from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..models import Post
from ..schemas import PostOut

router = APIRouter()


@router.get("/posts/{post_id}", response_model=PostOut)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = (
        db.query(Post)
        .options(selectinload(Post.interests))
        .filter(Post.id == post_id)
        .first()
    )
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return post
