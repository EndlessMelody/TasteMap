from pydantic import BaseModel
from src.gamification.schemas import BadgeStub
from typing import Optional, List
from datetime import datetime


class PostCreate(BaseModel):
    location_id: Optional[int] = None
    review: str
    rating: Optional[float] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None


class UserStub(BaseModel):
    id: int
    display_name: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    title: Optional[str] = None
    level: Optional[int] = None
    primary_badge: Optional[BadgeStub] = None


class LocationStub(BaseModel):
    id: int
    name: str


class PostResponse(BaseModel):
    id: int
    review: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    items: List[PostResponse]
    total: int


class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[int] = None


class CommentResponse(BaseModel):
    id: int
    user: Optional[UserStub] = None
    content: str
    parent_id: Optional[int] = None
    created_at: Optional[datetime] = None
    replies: List["CommentResponse"] = []

    class Config:
        from_attributes = True


class CommentListResponse(BaseModel):
    items: List[CommentResponse]
    total: int


CommentResponse.model_rebuild()
