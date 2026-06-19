"""Repro/regression: GET /api/posts/{id} must carry read_next for a post with featured edges.

Run from backend/:
    .venv\\Scripts\\python.exe tests\\read_next_endpoint_test.py

Block 2 added PostOut.read_next (schemas.py) and attached it in routers/posts.py::get_post
via `post.read_next = resolved_read_next(db, post)` (same attach-as-attribute pattern as
attach_counts_one for like_count). This check inserts a PUBLISHED post with two featured
connections + one featured person (mirroring the live post 4: "Allometric scaling",
"Naked mole rats and aging", Geoffrey West), hits the endpoint in-process against the
COMMITTED code, and asserts read_next is present and carries the three latent entries.

This is the control: it PASSES on committed code, proving the code path is correct and the
"key absent" symptom cannot originate from the source. Throwaway SQLite DB via _throwaway_db.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _throwaway_db  # noqa: F401 -- must run before any app import

from fastapi.testclient import TestClient  # noqa: E402

from app.database import Base, SessionLocal, engine  # noqa: E402
from app.graph_identity import post_identity_key  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Post  # noqa: E402

Base.metadata.create_all(bind=engine)

client = TestClient(app)

FEED_CARD = {"field": "Biology", "headline": "Why elephants outlive mice"}
SECTIONS = [
    {"type": "headline", "order": 1, "content": "Why elephants outlive mice"},
    {
        "type": "story",
        "order": 2,
        "content": {
            "body": "Body text.",
            "key_figures": [
                {"name": "Geoffrey West", "birth_year": 1940, "role": "physicist", "featured": True},
            ],
        },
    },
]
CONNECTIONS = [
    {"format": "concepts", "ref": {"title": "Allometric scaling"}, "featured": True},
    {"format": "facts", "ref": {"title": "Naked mole rats and aging"}, "featured": True},
]

db = SessionLocal()
post = Post(
    format="facts",
    title="Why elephants outlive mice",
    identity_key=post_identity_key("facts", FEED_CARD),
    feed_card=FEED_CARD,
    sections=SECTIONS,
    tags=[],
    connections=CONNECTIONS,
    status="published",
    is_user_content=False,
)
db.add(post)
db.commit()
db.refresh(post)
post_id = post.id
db.close()

resp = client.get(f"/api/posts/{post_id}")
assert resp.status_code == 200, f"expected 200, got {resp.status_code}: {resp.text[:300]}"
body = resp.json()

failures = []

if "read_next" not in body:
    failures.append("read_next key ABSENT from the response (the reported bug)")
else:
    rn = body["read_next"]
    if not isinstance(rn, list) or len(rn) != 3:
        failures.append(f"read_next should have 3 entries, got {rn!r}")
    elif not all(i.get("latent") is True and i.get("target_post_id") is None for i in rn):
        failures.append(f"all 3 entries should be latent (no live targets), got {rn!r}")

# The symptom states these fields ARE present; assert they remain so.
for key in ("feed_card", "sections", "tags", "connections", "like_count", "interests"):
    if key not in body:
        failures.append(f"expected field {key!r} present, but it is missing")

if failures:
    print("FAIL:")
    for f in failures:
        print("  -", f)
    print("keys present:", sorted(body.keys()))
    sys.exit(1)

print("PASS: read_next present with 3 latent entries; other fields present too.")
print("read_next:", body["read_next"])
