"""Read-only-report test for graph_edges.unmatched_latent_edges.

Run from backend/:
    .venv\\Scripts\\python.exe tests\\report_edges_test.py

Freezes the "should this have matched?" report: latent edges whose
(target_format, target_identity_key) matches no post (any status) are surfaced,
grouped + counted + sorted by count descending, each carrying the source post's
title and the raw ref that produced the key; a latent edge whose target exists
(even pending) is correctly latent and excluded; and the report mutates nothing.
Same throwaway-DB pattern as edges_test.py.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _throwaway_db  # noqa: F401 -- must run before any app import

from app.database import Base, SessionLocal, engine  # noqa: E402
from app.graph_edges import on_post_written, unmatched_latent_edges  # noqa: E402
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
        title=feed_card.get("title")
        or feed_card.get("name")
        or feed_card.get("headline")
        or feed_card.get("concept_name")
        or "x",
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


def conn(fmt, ref, featured=False):
    return {"format": fmt, "ref": ref, "featured": featured}


# --- seed ------------------------------------------------------------------

# (b) decay: the books post exists as "Tao Te Ching by Laozi", but two sources
# reference it as "... by Lao Tzu". The edge key drifts and matches no post.
add_post("books", {"title": "Tao Te Ching", "author": "Laozi"})
src1 = add_post(
    "facts",
    {"headline": "The Tao that can be told is not the eternal Tao"},
    connections=[conn("books", {"title": "Tao Te Ching", "author": "Lao Tzu"})],
)
src2 = add_post(
    "facts",
    {"headline": "Water is the softest thing yet wears down rock"},
    connections=[conn("books", {"title": "Tao Te Ching", "author": "Lao Tzu"})],
)

# (a) correct: the target genuinely does not exist yet (a real future post).
src3 = add_post(
    "concepts",
    {"concept_name": "Wu Wei"},
    connections=[conn("books", {"title": "A Theory Not Yet Written", "author": "Future Author"})],
)

# Excluded: the target exists but is pending (not a live node), so the edge is
# correctly latent -- the key is fine, the post just is not published.
add_post("concepts", {"concept_name": "Pending Concept"}, status="pending")
add_post(
    "facts",
    {"headline": "Points at a pending concept"},
    connections=[conn("concepts", {"title": "Pending Concept"})],
)

# --- run the report (and prove it writes nothing) --------------------------


def snapshot():
    """Counts + every edge's target_post_id, to prove the report mutates nothing."""
    return (
        db.query(Post).count(),
        db.query(PostEdge).count(),
        {e.id: e.target_post_id for e in db.query(PostEdge).all()},
    )


before = snapshot()
report = unmatched_latent_edges(db)
after = snapshot()

check("report is read-only -- nothing written", before == after, f"{before} != {after}")

# --- shape: grouped, counted, sorted by count descending -------------------

check("exactly the two unmatched pairs are reported", len(report) == 2, str(report))

# Sorted by count desc, so the mis-keyed pair (2 edges) comes before the genuinely
# absent one (1 edge).
top_fmt, top_key, top_sources = report[0]
second_fmt, second_key, second_sources = report[1]
check("sorted by count descending", len(top_sources) >= len(second_sources))

check(
    "mis-keyed pair surfaces with count 2",
    (top_fmt, top_key) == ("books", "tao te ching by lao tzu") and len(top_sources) == 2,
    str(report[0]),
)
check(
    "genuinely-absent pair surfaces with count 1",
    (second_fmt, second_key) == ("books", "a theory not yet written by future author")
    and len(second_sources) == 1,
    str(report[1]),
)

# --- diagnostic payload: source title + raw ref per latent edge ------------

mis_ids = {sid for sid, _, _ in top_sources}
check("mis-keyed sources are the two facts posts", mis_ids == {src1.id, src2.id}, str(mis_ids))
check(
    "each mis-keyed source carries its post title",
    all(title for _, title, _ in top_sources),
    str(top_sources),
)
check(
    "each mis-keyed source carries the raw ref that drifted (author 'Lao Tzu')",
    all(isinstance(ref, dict) and ref.get("author") == "Lao Tzu" for _, _, ref in top_sources),
    str(top_sources),
)
absent_source = second_sources[0]
check("genuinely-absent source is the concepts post", absent_source[0] == src3.id)
check(
    "genuinely-absent source carries its title + ref",
    bool(absent_source[1]) and isinstance(absent_source[2], dict),
    str(absent_source),
)

# --- exclusion: a pending target is correctly latent, not a key problem ----

reported_pairs = {(fmt, key) for fmt, key, _ in report}
check(
    "a latent edge whose target exists (pending) is excluded",
    ("concepts", "pending concept") not in reported_pairs,
    str(reported_pairs),
)

db.close()

print(f"\nAll {PASS} report checks passed.")
