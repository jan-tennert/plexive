from typing import List

from pydantic import BaseModel, ConfigDict, field_validator


class EventIn(BaseModel):
    post_id: int
    event_type: str
    duration_ms: int | None = None


class InterestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str


class PostOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    format: str
    title: str
    body: str  # deprecated fallback
    source: str | None
    hook: str | None = None
    key_points: list[str] | None = None
    takeaway: str | None = None
    source_url: str | None = None
    image_url: str | None = None
    image_attribution: str | None = None
    related_slugs: list[str] | None = None
    details: dict | None = None
    interests: List[str]

    @field_validator("interests", mode="before")
    @classmethod
    def extract_names(cls, v):
        if v and hasattr(v[0], "name"):
            return [interest.name for interest in v]
        return v
