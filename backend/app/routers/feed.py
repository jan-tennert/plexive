from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..models import Interest, Post
from ..schemas import PostOut
from ..scoring import score_posts

router = APIRouter()


@router.get("/feed", response_model=List[PostOut])
def get_feed(
    format: Optional[str] = None,
    interests: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Post).options(selectinload(Post.interests))

    if format:
        query = query.filter(Post.format == format)

    slugs: List[str] = []
    if interests:
        slugs = [s.strip() for s in interests.split(",")]
        query = query.join(Post.interests).filter(Interest.slug.in_(slugs)).distinct()

    posts = query.all()
    return score_posts(posts, slugs, db)
