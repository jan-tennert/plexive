from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy import case, func, or_
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..models import Post
from ..schemas import PostOut

router = APIRouter()


@router.get("/search", response_model=List[PostOut])
def search_posts(
    q: str = "",
    format: Optional[str] = None,
    db: Session = Depends(get_db),
):
    if not q.strip():
        return []

    q_lower = f"%{q.strip().lower()}%"

    title_match = func.lower(Post.title).like(q_lower)
    hook_match = func.lower(Post.hook).like(q_lower)
    body_match = func.lower(Post.body).like(q_lower)
    author_match = func.lower(func.json_extract(Post.details, "$.author")).like(q_lower)
    source_match = func.lower(func.json_extract(Post.details, "$.source")).like(q_lower)
    known_for_match = func.lower(func.json_extract(Post.details, "$.known_for")).like(q_lower)
    question_match = func.lower(func.json_extract(Post.details, "$.the_question")).like(q_lower)

    relevance = case((title_match, 2), else_=1)

    query = (
        db.query(Post)
        .options(selectinload(Post.interests))
        .filter(or_(title_match, hook_match, body_match, author_match, source_match, known_for_match, question_match))
    )

    if format:
        query = query.filter(Post.format == format)

    results = (
        query
        .order_by(relevance.desc(), Post.created_at.desc())
        .limit(50)
        .all()
    )

    return results
