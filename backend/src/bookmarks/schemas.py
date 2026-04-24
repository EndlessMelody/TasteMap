from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class BookmarkCreate(BaseModel):
    location_id: Optional[int] = None
    post_id: Optional[int] = None
    reel_id: Optional[int] = None


class LocationStub(BaseModel):
    id: int
    name: str
    image_url: Optional[str] = None
    rating: Optional[float] = None
    category: Optional[str] = None
    price_range: Optional[str] = None


class PostStub(BaseModel):
    id: int
    image_url: Optional[str] = None
    review: Optional[str] = None


class ReelStub(BaseModel):
    id: int
    title: str
    thumbnail_url: Optional[str] = None


class BookmarkResponse(BaseModel):
    id: int
    location: Optional[LocationStub] = None
    post: Optional[PostStub] = None
    reel: Optional[ReelStub] = None
    xp_earned: int = 0
    created_at: Optional[datetime] = None


class BookmarkListResponse(BaseModel):
    items: List[BookmarkResponse]
    total: int
