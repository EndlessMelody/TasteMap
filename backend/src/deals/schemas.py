from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DealCreate(BaseModel):
    location_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    discount_percent: Optional[int] = None
    banner_image_url: Optional[str] = None
    xp_reward: int = 0
    is_sponsored: bool = False
    expires_at: Optional[datetime] = None


class LocationStub(BaseModel):
    id: int
    name: str


class DealResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    discount_percent: Optional[int] = None
    banner_image_url: Optional[str] = None
    xp_reward: int = 0
    is_sponsored: bool = False
    location: Optional[LocationStub] = None
    expires_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DealListResponse(BaseModel):
    items: List[DealResponse]
