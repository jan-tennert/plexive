import json
import os
import secrets
import sys

from dotenv import load_dotenv
from passlib.context import CryptContext

from app.auth import hash_password
from app.database import Base, SessionLocal, engine
from app.models import Interest, Post, User, post_interests

Base.metadata.create_all(bind=engine)

SLUGS = [
    "physics", "quantum-physics", "astronomy", "cosmology", "chemistry",
    "biology", "genetics", "neuroscience", "evolution", "ecology", "climate",
    "geology", "oceans", "animals", "mathematics", "statistics", "medicine",
    "materials-science", "artificial-intelligence", "machine-learning",
    "computing", "internet", "cybersecurity", "robotics", "biotech",
    "space-tech", "energy-tech", "engineering", "gadgets", "cryptography",
    "blockchain", "aviation", "transportation", "economics",
    "behavioral-economics", "finance", "entrepreneurship", "startups",
    "marketing", "management", "negotiation", "money-history", "markets",
    "career", "productivity-work", "supply-chains", "advertising",
    "psychology", "cognitive-biases", "habits", "productivity", "focus",
    "motivation", "decision-making", "emotional-intelligence", "mental-health",
    "mindfulness", "happiness", "relationships", "communication", "learning",
    "discipline", "confidence", "stoicism-practice", "philosophy", "ethics",
    "stoicism", "existentialism", "eastern-philosophy", "logic", "epistemology",
    "consciousness", "free-will", "political-philosophy", "philosophy-of-mind",
    "meaning", "mental-models", "ancient-history", "medieval-history",
    "modern-history", "world-wars", "cold-war", "empires", "revolutions",
    "ancient-egypt", "ancient-rome", "ancient-greece", "exploration",
    "archaeology", "history-of-science", "forgotten-history", "military-history",
    "politics", "geopolitics", "political-systems", "democracy", "law",
    "human-rights", "social-movements", "inequality", "propaganda", "diplomacy",
    "elections", "public-policy", "art-history", "music", "music-theory",
    "literature", "film", "architecture", "design", "photography", "writing",
    "mythology", "religion", "language", "poetry", "theater", "nutrition",
    "fitness", "sleep", "longevity", "human-body", "brain-health", "immunity",
    "public-health", "sports-science", "everyday-science", "food-science",
    "games", "sports", "travel", "nature-phenomena", "curiosities", "future",
    "internet-culture", "crime", "money-everyday", "history", "anthropology",
    "exponential-growth", "patience", "critical-thinking", "trade-offs",
    "scarcity",
]

NAME_EXCEPTIONS = {
    "money-everyday": "Personal Finance",
}

SEED_INTEREST_SLUGS = [
    "psychology", "behavioral-economics", "decision-making", "neuroscience",
]

SEED_EMAIL = "marlo07drews@gmail.com"
SEED_USERNAME = "Marlo"
SEED_POST_FORMAT = "books"
SEED_POST_TITLE = "Thinking, Fast and Slow"


def slug_to_name(slug):
    if slug in NAME_EXCEPTIONS:
        return NAME_EXCEPTIONS[slug]
    return slug.replace("-", " ").title()


def _get_or_create_marlo(db) -> User:
    marlo = db.query(User).filter_by(email=SEED_EMAIL).first()
    if marlo:
        if not marlo.is_verified:
            marlo.is_verified = True
            db.commit()
        return marlo

    # Load seed password from .env; generate if absent
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    load_dotenv(env_path)
    password = os.environ.get("SEED_ADMIN_PASSWORD", "").strip()

    if not password:
        password = secrets.token_urlsafe(16)
        print(
            "\n"
            "WARNING: SEED_ADMIN_PASSWORD is not set in backend/.env.\n"
            f"         Generated seed password: {password}\n"
            "         Save this now — it will not be shown again.\n"
            "         Add SEED_ADMIN_PASSWORD=<password> to backend/.env\n"
            "         and re-run seed.py to use a stable password.\n"
        )
        if not sys.stdin.isatty():
            print("ERROR: Running non-interactively without SEED_ADMIN_PASSWORD set. Exiting.")
            sys.exit(1)

    marlo = User(
        email=SEED_EMAIL,
        username=SEED_USERNAME,
        password_hash=hash_password(password),
        is_active=True,
        is_verified=True,
    )
    db.add(marlo)
    db.commit()
    db.refresh(marlo)
    print(f"Created user @{SEED_USERNAME} ({SEED_EMAIL})")
    return marlo


db = SessionLocal()

# Phase 1: get-or-create interests (idempotent)
created_count = 0
for slug in SLUGS:
    if db.query(Interest).filter_by(slug=slug).first() is None:
        db.add(Interest(name=slug_to_name(slug), slug=slug))
        created_count += 1
db.commit()
print(f"Interests: {created_count} created (rest already existed)")

# Phase 2: ensure Marlo exists and is verified
marlo = _get_or_create_marlo(db)

# Phase 3: seed the Kahneman Books post (upsert — update if already present)
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
example_path = os.path.join(
    project_root, "docs", "content-structure", "examples", "books_example.json"
)
with open(example_path, encoding="utf-8") as f:
    example = json.load(f)

feed_card = example["feed_card"]
sections = example["sections"]

existing = (
    db.query(Post)
    .filter_by(format=SEED_POST_FORMAT, title=SEED_POST_TITLE)
    .first()
)

if existing:
    existing.feed_card = feed_card
    existing.sections = sections
    existing.title = feed_card["title"]
    existing.status = "published"
    db.commit()
    print(f"Updated existing Books post: {SEED_POST_TITLE}.")
else:
    # Resolve interest objects; skip any slug not in DB
    interests = []
    for slug in SEED_INTEREST_SLUGS:
        interest = db.query(Interest).filter_by(slug=slug).first()
        if interest:
            interests.append(interest)
        else:
            print(f"Warning: interest slug '{slug}' not found, skipping")

    post = Post(
        format=SEED_POST_FORMAT,
        title=feed_card["title"],
        feed_card=feed_card,
        sections=sections,
        author_id=marlo.id,
        status="published",
        is_user_content=False,
    )
    post.interests = interests
    db.add(post)
    db.commit()
    print(f"Seeded 1 Books post: {SEED_POST_TITLE}.")

db.close()
