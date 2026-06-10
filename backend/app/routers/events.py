from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import get_optional_user
from ..database import get_db
from ..models import Event, Post, User
from ..schemas import EventIn

router = APIRouter()


@router.post("/events")
def create_events(
    events: List[EventIn],
    db: Session = Depends(get_db),
    optional_user: Optional[User] = Depends(get_optional_user),
):
    # The frontend queue flushes at 5 events; anything near this cap is abuse.
    if len(events) > 50:
        raise HTTPException(status_code=422, detail="Too many events in one batch.")

    # Drop events that reference nonexistent posts instead of storing garbage.
    # Only posts visible to this caller count, so the stored-count response
    # cannot be used as an existence oracle for pending post ids.
    requested_ids = {e.post_id for e in events}
    valid_ids = set()
    if requested_ids:
        query = db.query(Post.id).filter(Post.id.in_(requested_ids))
        if optional_user:
            query = query.filter(
                (Post.status == "published") | (Post.author_id == optional_user.id)
            )
        else:
            query = query.filter(Post.status == "published")
        valid_ids = {row[0] for row in query.all()}

    new_events = []
    batch_liked_post_ids: set[int] = set()
    for e in events:
        if e.post_id not in valid_ids:
            continue
        if e.event_type == "like" and optional_user:
            # Dedup within this batch as well as against stored events
            if e.post_id in batch_liked_post_ids:
                continue
            already_liked = (
                db.query(Event)
                .filter(
                    Event.post_id == e.post_id,
                    Event.event_type == "like",
                    Event.user_id == optional_user.id,
                )
                .first()
            )
            if already_liked:
                continue
            batch_liked_post_ids.add(e.post_id)
        new_events.append(Event(
            post_id=e.post_id,
            event_type=e.event_type,
            duration_ms=e.duration_ms,
            user_id=optional_user.id if optional_user else None,
        ))
    db.add_all(new_events)
    db.commit()
    return {"stored": len(new_events)}


@router.get("/posts/{post_id}/likes")
def get_likes(
    post_id: int,
    db: Session = Depends(get_db),
    optional_user: Optional[User] = Depends(get_optional_user),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
    # Pending posts are author-only everywhere else; like info follows the same rule.
    if post.status != "published" and (optional_user is None or post.author_id != optional_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")

    count = (
        db.query(Event)
        .filter(Event.post_id == post_id, Event.event_type == "like")
        .count()
    )
    liked = False
    if optional_user:
        liked = (
            db.query(Event)
            .filter(
                Event.post_id == post_id,
                Event.event_type == "like",
                Event.user_id == optional_user.id,
            )
            .first()
        ) is not None

    return {"count": count, "liked": liked}
