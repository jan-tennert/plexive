"""Post-graph edge tests against a throwaway database.

Run from backend/:
    .venv\\Scripts\\python.exe tests\\edges_test.py

Freezes app/graph_edges.py: derivation from connections + person-list fields,
latent edges, activation, target/source lifecycle, the published<->not-published
status gate (both directions), the read-next projection (cap 3, latent marked),
and clean skip/coexistence of legacy string refs with the new structured shape.
Same throwaway-DB pattern as identity_test.py.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _throwaway_db  # noqa: F401 -- must run before any app import

from app.database import Base, SessionLocal, engine  # noqa: E402
from app.graph_edges import (  # noqa: E402
    on_post_deleted,
    on_post_written,
    resolved_read_next,
)
from app.graph_identity import post_identity_key  # noqa: E402
from app.models import Post, PostEdge  # noqa: E402

Base.metadata.create_all(bind=engine)

PASS = 0


def check(name: str, condition: bool, detail: str = ""):
    global PASS
    assert condition, f"FAIL: {name} {detail}"
    PASS += 1
    print(f"ok: {name}")


db = SessionLocal()


def add_post(fmt, feed_card, *, status="published", connections=None, sections=None):
    """Create a post in the structured shape and run the edge hook."""
    post = Post(
        format=fmt,
        title=feed_card.get("title") or feed_card.get("name") or feed_card.get("concept_name") or "x",
        identity_key=post_identity_key(fmt, feed_card),
        feed_card=feed_card,
        sections=sections or [],
        connections=connections or [],
        status=status,
        is_user_content=False,
    )
    db.add(post)
    db.commit()
    on_post_written(db, post)
    return post


def edges_from(post):
    return db.query(PostEdge).filter_by(source_post_id=post.id).all()


def conn(fmt, ref, featured=False):
    return {"format": fmt, "ref": ref, "featured": featured}


# --- latent edge, then activation ------------------------------------------

# Source declares a connection to a Books target that does not exist yet.
source = add_post(
    "facts",
    {"headline": "Metabolism scales with mass"},
    connections=[conn("books", {"title": "Scale", "author": "Geoffrey West"})],
)
src_edges = edges_from(source)
check("connection stores exactly one edge", len(src_edges) == 1, str(src_edges))
check("edge to missing target is latent", src_edges[0].target_post_id is None)

# Create the target. Activation must set target_post_id in one statement.
target = add_post("books", {"title": "Scale", "author": "Geoffrey West"})
db.refresh(src_edges[0])
check("creating the target activates the latent edge", src_edges[0].target_post_id == target.id)

# --- lifecycle: target deleted -> re-latent --------------------------------

target_id = target.id
on_post_deleted(db, target)
db.refresh(src_edges[0])
check("deleting the target returns the edge to latent", src_edges[0].target_post_id is None)
check("target post row is gone", db.get(Post, target_id) is None)

# --- lifecycle: source deleted -> edges removed ----------------------------

source_id = source.id
on_post_deleted(db, source)
check(
    "deleting the source removes its edges",
    db.query(PostEdge).filter_by(source_post_id=source_id).count() == 0,
)

# --- status gate: pending casts none, publishing casts them ----------------

pending = add_post(
    "facts",
    {"headline": "A pending fact"},
    status="pending",
    connections=[conn("concepts", {"title": "Some Concept"})],
)
check("a pending source casts no edges", len(edges_from(pending)) == 0)

pending.status = "published"
db.commit()
on_post_written(db, pending)
check("publishing the source casts its edges", len(edges_from(pending)) == 1)

# --- status gate: published -> not-published teardown (both sides) ---------

# T2 has a live outgoing edge (to T3) and a live incoming edge (from A).
t3 = add_post("concepts", {"concept_name": "Downstream Idea"})
t2 = add_post(
    "books",
    {"title": "Bridge", "author": "Mid Author"},
    connections=[conn("concepts", {"title": "Downstream Idea"})],
)
a = add_post(
    "facts",
    {"headline": "Points at the bridge"},
    connections=[conn("books", {"title": "Bridge", "author": "Mid Author"})],
)
check("T2 outgoing edge resolved while live", edges_from(t2)[0].target_post_id == t3.id)
check("A's edge into T2 resolved while live", edges_from(a)[0].target_post_id == t2.id)

t2_id = t2.id
t2.status = "pending"
db.commit()
on_post_written(db, t2)
check("un-published node drops its outgoing edges", len(edges_from(t2)) == 0)
db.refresh(edges_from(a)[0])
check("edges pointing at an un-published node go latent", edges_from(a)[0].target_post_id is None)
check("no live edge references the un-published node",
      db.query(PostEdge).filter_by(target_post_id=t2_id).count() == 0)

# --- read-next: cap at 3, latent marked not dropped ------------------------

# Four featured connections; only one target exists (T3, published).
reader = add_post(
    "facts",
    {"headline": "Reader with many featured links"},
    connections=[
        conn("concepts", {"title": "Downstream Idea"}, featured=True),
        conn("concepts", {"title": "Missing One"}, featured=True),
        conn("concepts", {"title": "Missing Two"}, featured=True),
        conn("concepts", {"title": "Missing Three"}, featured=True),
        conn("concepts", {"title": "Not Featured"}, featured=False),
    ],
)
rn = resolved_read_next(db, reader)
check("read-next trimmed to 3", len(rn) == 3, str(rn))
resolved_items = [i for i in rn if not i["latent"]]
latent_items = [i for i in rn if i["latent"]]
check("read-next resolves the existing target", any(i["target_post_id"] == t3.id for i in resolved_items))
check("read-next keeps latent featured edges, marked latent", len(latent_items) >= 1)
check("latent read-next items keep a display title", all(i["title"] for i in latent_items))

# --- read-next: person-list featured in; people-connection ignored ---------

curie = add_post("people", {"name": "Marie Curie", "birth_year": 1867})
person_post = add_post(
    "facts",
    {"headline": "Has a featured person"},
    sections=[
        {
            "type": "story",
            "order": 1,
            "content": {
                "key_figures": [
                    {"name": "Marie Curie", "birth_year": 1867, "role": "Pioneer", "featured": True},
                    {"name": "Unfeatured Person", "birth_year": 1900, "role": "Extra"},
                ]
            },
        }
    ],
    # A connection that points at a person must be ignored (person edges come
    # only from person-list fields).
    connections=[conn("people", {"name": "Marie Curie", "birth_year": 1867}, featured=True)],
)
person_edges = edges_from(person_post)
check(
    "person-list entries cast person edges; people-connection ignored",
    # Both key_figures (featured Curie + unfeatured) cast person edges; the
    # format=='people' connection casts nothing, so the count is 2, not 3.
    len(person_edges) == 2
    and all(e.target_format == "people" for e in person_edges)
    and any(e.target_post_id == curie.id for e in person_edges),
    str([(e.target_format, e.target_post_id) for e in person_edges]),
)
prn = resolved_read_next(db, person_post)
check("featured person appears in read-next", len(prn) == 1 and prn[0]["format"] == "people")
check("read-next person resolved to the people post", prn[0]["target_post_id"] == curie.id)

# --- coexistence / clean skip ----------------------------------------------

mixed = add_post(
    "facts",
    {"headline": "Mixed old and new shapes"},
    connections=[
        conn("books", "Scale by Geoffrey West", featured=True),   # legacy string ref
        conn("books", {"title": "No Author Book"}, featured=True),  # structured, missing author
        conn("concepts", {"title": "Valid Concept"}, featured=True),  # valid
    ],
    sections=[
        {
            "type": "cast",
            "order": 1,
            "content": [
                {"name": "No Year Person", "role": "Unknown era"},  # no birth_year
                {"name": "Known Person", "birth_year": 1850, "role": "Has a year"},  # valid
            ],
        }
    ],
)
mixed_edges = edges_from(mixed)
check(
    "only the resolvable entries cast edges (string ref + missing parts skipped)",
    len(mixed_edges) == 2,
    str([(e.target_format, e.target_identity_key) for e in mixed_edges]),
)
mixed_keys = {(e.target_format, e.target_identity_key) for e in mixed_edges}
check(
    "the valid concept and the year-bearing person resolved",
    ("concepts", "valid concept") in mixed_keys
    and ("people", post_identity_key("people", {"name": "Known Person", "birth_year": 1850})) in mixed_keys,
    str(mixed_keys),
)
# read_next over the same mixed post must also skip cleanly without raising. Only
# the valid featured connection survives (the cast persons here are not featured;
# the legacy string ref and the author-less books ref are skipped).
mixed_rn = resolved_read_next(db, mixed)
check(
    "read-next over mixed shapes skips cleanly",
    len(mixed_rn) == 1 and mixed_rn[0]["format"] == "concepts" and mixed_rn[0]["latent"],
    str(mixed_rn),
)

db.close()

print(f"\nAll {PASS} edge checks passed.")
