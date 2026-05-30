from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Event
from ..schemas import EventIn

router = APIRouter()


@router.post("/events")
def create_events(events: List[EventIn], db: Session = Depends(get_db)):
    db.add_all([
        Event(
            post_id=e.post_id,
            event_type=e.event_type,
            duration_ms=e.duration_ms,
        )
        for e in events
    ])
    db.commit()
    return {"stored": len(events)}
