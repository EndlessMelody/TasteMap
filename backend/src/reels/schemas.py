from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ReelCreate(BaseModel):
    title: str
    video_url: str
    thumbnail_url: Optional[str] = None


class UserStub(BaseModel):
    id: int
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    title: Optional[str] = None
    level: Optional[int] = None


class ReelResponse(BaseModel):
    id: int
    title: str
    user: Optional[UserStub] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    views_count: int = 0
    likes_count: int = 0
    comments_count: int = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReelListResponse(BaseModel):
    items: List[ReelResponse]
