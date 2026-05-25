from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class FriendRequest(BaseModel):
    friend_id: int


class UserStub(BaseModel):
    id: int
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None


class FriendResponse(BaseModel):
    friendship_id: int
    user: Optional[UserStub] = None
    status: str
    since: Optional[datetime] = None


class FriendListResponse(BaseModel):
    items: List[FriendResponse]


class PendingRequest(BaseModel):
    friendship_id: int
    from_user: Optional[UserStub] = None
    created_at: Optional[datetime] = None


class FoodieFriend(BaseModel):
    id: int
    username: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    cover_url: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    title: Optional[str] = None
    match_score: int = 0
    friendship_id: Optional[int] = None


class FoodiesListResponse(BaseModel):
    items: List[FoodieFriend]
