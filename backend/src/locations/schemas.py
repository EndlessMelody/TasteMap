from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class LocationCreate(BaseModel):
    name: str
    lat: float
    lng: float
    address: Optional[str] = None
    city: Optional[str] = None
    category: str  # "food" | "place"
    image_url: Optional[str] = None
    price_range: Optional[str] = None
    open_hours: Optional[str] = None
    characteristics: Optional[dict] = None
    vector: Optional[List[float]] = None  # 15-dim feature vector cho recommendations


class LocationResponse(BaseModel):
    id: int
    name: str
    lat: float
    lng: float
    address: Optional[str] = None
    city: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    price_range: Optional[str] = None
    open_hours: Optional[str] = None
    rating: Optional[float] = None
    characteristics: Optional[dict] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LocationDetail(LocationResponse):
    """Chi tiết địa điểm — kèm posts, deals gần đây."""
    recent_posts: List[dict] = []
    active_deals: List[dict] = []


class LocationListResponse(BaseModel):
    items: List[LocationResponse]
    total: int
    limit: int
    offset: int
