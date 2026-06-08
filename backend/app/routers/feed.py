from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from ..auth import get_current_user, get_optional_user
from ..database import get_db
from ..models import Comment, Event, Follow, Interest, Post, User
from ..schemas import PostOut
from ..scoring import score_posts

router = APIRouter()

FEED_MIN = 10


def _attach_counts(post: Post, db: Session) -> Post:
    post.like_count = (
        db.query(func.count(Event.id))
        .filter(Event.post_id == post.id, Event.event_type == "like")
        .scalar()
    ) or 0
    post.comment_count = (
        db.query(func.count(Comment.id))
        .filter(Comment.post_id == post.id)
        .scalar()
    ) or 0
    return post


def _attach_counts_many(posts: List[Post], db: Session) -> List[Post]:
    return [_attach_counts(p, db) for p in posts]


@router.get("/feed", response_model=List[PostOut])
def get_feed(
    format: Optional[str] = None,
    interests: Optional[str] = None,
    db: Session = Depends(get_db),
):
    base = db.query(Post).options(selectinload(Post.interests), selectinload(Post.author))
    base = base.filter(Post.status == "published")
    if format:
        base = base.filter(Post.format == format)

    slugs: List[str] = [s.strip() for s in interests.split(",")] if interests else []

    if not slugs:
        posts = base.all()
        return _attach_counts_many(score_posts(posts, [], db), db)

    # Tier 1: posts directly tagged with the user's selected slugs.
    tier1 = (
        base.join(Post.interests)
            .filter(Interest.slug.in_(slugs))
            .distinct()
            .all()
    )
    tier1_ids = {p.id for p in tier1}
    tier_map = {p.id: 1 for p in tier1}

    # Tier 2: posts co-tagged with interests from Tier 1 posts.
    tier2: List[Post] = []
    if len(tier1) < FEED_MIN:
        related_slugs = {
            i.slug
            for p in tier1
            for i in p.interests
            if i.slug not in slugs
        }
        if related_slugs:
            tier2 = (
                base.join(Post.interests)
                    .filter(Interest.slug.in_(related_slugs))
                    .filter(Post.id.notin_(tier1_ids))
                    .distinct()
                    .all()
            )
        tier_map.update({p.id: 2 for p in tier2})

    # Tier 3: any remaining posts regardless of interests.
    tier3: List[Post] = []
    if len(tier1) + len(tier2) < FEED_MIN:
        tier12_ids = tier1_ids | {p.id for p in tier2}
        tier3 = base.filter(Post.id.notin_(tier12_ids)).all()
        tier_map.update({p.id: 3 for p in tier3})

    ranked = score_posts(tier1 + tier2 + tier3, slugs, db, tier_map)
    return _attach_counts_many(ranked, db)


@router.get("/feed/following", response_model=List[PostOut])
def get_following_feed(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    following_ids = [
        row.following_id
        for row in db.query(Follow).filter(
            Follow.follower_id == current_user.id,
            Follow.status == "accepted",
        ).all()
    ]
    if not following_ids:
        return []
    posts = (
        db.query(Post)
        .options(selectinload(Post.interests), selectinload(Post.author))
        .filter(Post.author_id.in_(following_ids), Post.status == "published")
        .order_by(Post.created_at.desc())
        .limit(50)
        .all()
    )
    return _attach_counts_many(posts, db)


@router.get("/feed/user/{username}", response_model=List[PostOut])
def get_user_feed(
    username: str,
    _current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    target = db.query(User).filter(User.username == username, User.is_active == True).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    posts = (
        db.query(Post)
        .options(selectinload(Post.interests), selectinload(Post.author))
        .filter(Post.author_id == target.id, Post.status == "published")
        .order_by(Post.created_at.desc())
        .limit(50)
        .all()
    )
    return _attach_counts_many(posts, db)
