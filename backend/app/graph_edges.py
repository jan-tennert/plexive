"""Derive and maintain the post-graph edges (post_edges table).

Block 1 gave every post an identity_key and added the post_edges table; this
module makes the edges live. A post's outgoing edges are derived on write from
its connections (links to non-person posts) and its featured person-list entries
(links to people). Edges are gated on status='published': only a live post is a
node and casts live edges.

One assembly path: both a post's own key and an incoming connection ref's key go
through graph_identity._key_from_parts, so they can never drift. A ref or person
entry that does not yield a complete key (a legacy string ref, a structured ref
missing a part, a person without a coercible birth_year) is skipped cleanly --
no edge, no exception, never a partial key. Old (string) and new (structured)
authoring shapes therefore coexist safely while the seed data is migrated later.

read_next (the post-detail "read next" set) is a small read-time projection of
the featured edges, resolved against live posts; see resolved_read_next.
"""

from sqlalchemy import and_, or_

from .graph_identity import _key_from_parts
from .models import Post, PostEdge

# The single definition of "is this a live node / a publishable target". Every
# place that decides whether a post counts as published goes through this, so the
# edge table and the read projection can never disagree.
LIVE_STATUS = "published"

# Person-list fields that carry a person edge. key_figures / key_thinkers are
# nested inside a section's dict content; cast / authors_context are the section
# content list directly (section type == the field name). We scan for all four in
# both shapes so any post resolves regardless of which it uses.
_PERSON_FIELDS = ("key_figures", "key_thinkers", "cast", "authors_context")
_PERSON_LIST_SECTION_TYPES = ("cast", "authors_context")


def is_live_node(post) -> bool:
    """A post is a live graph node only while published."""
    return post.status == LIVE_STATUS


def _iter_person_entries(sections):
    """Yield every person dict from the four person-list fields, in any shape.

    Tolerant of missing/odd content: non-dict sections, scalar content and
    non-dict list items are skipped rather than raising.
    """
    if not isinstance(sections, list):
        return
    for section in sections:
        if not isinstance(section, dict):
            continue
        content = section.get("content")
        if isinstance(content, dict):
            for field in _PERSON_FIELDS:
                entries = content.get(field)
                if isinstance(entries, list):
                    for entry in entries:
                        if isinstance(entry, dict):
                            yield entry
        elif isinstance(content, list) and section.get("type") in _PERSON_LIST_SECTION_TYPES:
            for entry in content:
                if isinstance(entry, dict):
                    yield entry


def _connection_key(fmt, ref):
    """Identity key for a connection ref, or None if it cannot resolve cleanly.

    ref must be the structured (dict) form. A legacy string ref is NOT split --
    it returns None (no edge) so old and new shapes coexist during migration.
    People are never linked via connections (only via person-list fields).
    """
    if not fmt or fmt == "people" or not isinstance(ref, dict):
        return None
    if fmt == "books":
        return _key_from_parts("books", title=ref.get("title"), author=ref.get("author"))
    return _key_from_parts(fmt, title=ref.get("title"))


def _edge_specs(post):
    """Yield (target_format, target_identity_key, featured) for a post's edges.

    Skips anything unresolvable (legacy string ref, missing parts, no birth_year)
    without raising and without ever producing a partial key.
    """
    connections = post.connections if isinstance(post.connections, list) else []
    for conn in connections:
        if not isinstance(conn, dict):
            continue
        fmt = conn.get("format")
        key = _connection_key(fmt, conn.get("ref"))
        if key is None:
            continue
        yield fmt, key, bool(conn.get("featured"))

    for person in _iter_person_entries(post.sections):
        key = _key_from_parts(
            "people", name=person.get("name"), birth_year=person.get("birth_year")
        )
        if key is None:
            continue
        yield "people", key, bool(person.get("featured"))


def _resolve_live_targets(db, pairs):
    """Map (format, identity_key) -> (post_id, title) for LIVE posts matching pairs.

    pairs is an iterable of (format, identity_key). One query, OR of per-pair
    equality clauses (robust on both SQLite and PostgreSQL).
    """
    pairs = [(f, k) for f, k in pairs if k is not None]
    if not pairs:
        return {}
    clause = or_(*[and_(Post.format == f, Post.identity_key == k) for f, k in pairs])
    rows = (
        db.query(Post.id, Post.format, Post.identity_key, Post.title)
        .filter(Post.status == LIVE_STATUS, clause)
        .all()
    )
    return {(fmt, key): (pid, title) for pid, fmt, key, title in rows}


def _relatent_incoming(db, post_id):
    """Set target_post_id NULL on every edge pointing at this post (re-latent).

    Used both when the target is deleted and when it stops being a live node.
    """
    db.query(PostEdge).filter(PostEdge.target_post_id == post_id).update(
        {PostEdge.target_post_id: None}, synchronize_session="fetch"
    )


def rebuild_post_edges(db, post):
    """Rebuild this post's outgoing edge rows from its current authoring data.

    Always clears the post's existing rows first. A non-live post inserts none
    (so going non-live tears its outgoing edges down). A live post inserts one
    row per resolvable connection / person entry, with target_post_id resolved
    against existing live posts (latent = NULL when the target does not exist).
    """
    db.query(PostEdge).filter(PostEdge.source_post_id == post.id).delete(
        synchronize_session="fetch"
    )
    if not is_live_node(post):
        return
    specs = list(_edge_specs(post))
    if not specs:
        return
    resolved = _resolve_live_targets(db, {(fmt, key) for fmt, key, _ in specs})
    for fmt, key, featured in specs:
        target = resolved.get((fmt, key))
        db.add(
            PostEdge(
                source_post_id=post.id,
                target_format=fmt,
                target_identity_key=key,
                target_post_id=target[0] if target else None,
                featured=featured,
            )
        )


def activate_edges_for(db, post):
    """Point every edge whose target identity matches this post at it.

    The single indexed statement that activates latent edges when their target
    is inserted or published -- no re-scan, no backfill job.
    """
    if not is_live_node(post) or post.identity_key is None:
        return
    db.query(PostEdge).filter(
        PostEdge.target_format == post.format,
        PostEdge.target_identity_key == post.identity_key,
    ).update({PostEdge.target_post_id: post.id}, synchronize_session="fetch")


def on_post_written(db, post):
    """Single entry point after any post insert / update / status transition.

    Handles both directions of the status gate:
    - live: rebuild outgoing edges, then activate incoming latent edges.
    - not live: rebuild clears outgoing edges, then re-latent incoming ones, so
      an un-verified / taken-down / un-published post is no longer a live node on
      either side.
    """
    rebuild_post_edges(db, post)
    if is_live_node(post):
        activate_edges_for(db, post)
    else:
        _relatent_incoming(db, post.id)
    db.commit()


def on_post_deleted(db, post):
    """Remove a post and clean up its edges: drop its outgoing rows, and re-latent
    every edge that pointed at it (never dangling). Then delete the post row."""
    post_id = post.id
    db.query(PostEdge).filter(PostEdge.source_post_id == post_id).delete(
        synchronize_session="fetch"
    )
    _relatent_incoming(db, post_id)
    db.delete(post)
    db.commit()


def resolved_read_next(db, post):
    """The post-detail "read next" set, resolved server-side.

    Built from the authoring layer (featured person-list entries first, then
    featured connections -- mirroring the previous frontend order), capped at 3
    at read time, then resolved against live posts. Resolved entries carry the
    target's id + canonical title; unmatched ones are kept and marked latent
    (target_post_id None) rather than dropped. Uses the same key assembly as the
    edge table, so the projection can never disagree with it.
    """
    candidates = []  # (format, key, fallback_title)
    for person in _iter_person_entries(post.sections):
        if not person.get("featured"):
            continue
        key = _key_from_parts(
            "people", name=person.get("name"), birth_year=person.get("birth_year")
        )
        if key is None:
            continue
        candidates.append(("people", key, person.get("name") or ""))

    connections = post.connections if isinstance(post.connections, list) else []
    for conn in connections:
        if not isinstance(conn, dict) or not conn.get("featured"):
            continue
        fmt = conn.get("format")
        ref = conn.get("ref")
        key = _connection_key(fmt, ref)
        if key is None:
            continue
        candidates.append((fmt, key, (ref.get("title") if isinstance(ref, dict) else "") or ""))

    candidates = candidates[:3]
    if not candidates:
        return []

    resolved = _resolve_live_targets(db, {(f, k) for f, k, _ in candidates})
    items = []
    for fmt, key, fallback in candidates:
        target = resolved.get((fmt, key))
        if target is not None:
            items.append(
                {"target_post_id": target[0], "format": fmt, "title": target[1], "latent": False}
            )
        else:
            items.append(
                {"target_post_id": None, "format": fmt, "title": fallback, "latent": True}
            )
    return items
