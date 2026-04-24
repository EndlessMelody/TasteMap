from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class BadgeBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = Field(None)
    icon_name: str = Field(..., max_length=50)
    rarity: str = Field(default="Common", max_length=20)
    accent_color: str = Field(default="#007AFF", max_length=20)
    is_hidden: bool = Field(default=False)

class BadgeStub(BaseModel):
    id: int
    name: str
    icon_name: str
    accent_color: str

    class Config:
        from_attributes = True

class BadgeCreate(BadgeBase):
    pass

class BadgeUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None)
    icon_name: Optional[str] = Field(None, max_length=50)
    rarity: Optional[str] = Field(None, max_length=20)
    accent_color: Optional[str] = Field(None, max_length=20)
    is_hidden: Optional[bool] = None

class BadgeResponse(BadgeBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class BadgeAdminDetail(BadgeResponse):
    owned_count: int = 0

class UserBadgeResponse(BaseModel):
    badge: BadgeResponse
    earned_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MediaUploadResponse(BaseModel):
    url: str
    file_type: str
    size_bytes: int
