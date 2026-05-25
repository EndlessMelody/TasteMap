from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class TourCreate(BaseModel):
    pass  # No required fields — creates empty tour


class StopCreate(BaseModel):
    location_id: int
    stop_order: Optional[int] = None


class LocationStub(BaseModel):
    id: int
    name: str
    lat: float
    lng: float
    image_url: Optional[str] = None
    price_range: Optional[str] = None

    class Config:
        from_attributes = True


class StopResponse(BaseModel):
    id: int
    stop_order: int
    location: Optional[LocationStub] = None


class TourResponse(BaseModel):
    id: int
    status: str
    total_distance: Optional[float] = None
    estimated_cost: Optional[int] = None
    estimated_duration: Optional[int] = None
    created_at: Optional[datetime] = None
    stops: List[StopResponse] = []

    class Config:
        from_attributes = True


class StatusUpdate(BaseModel):
    status: str  # building / ready / in_progress / completed


class OptimizeRequest(BaseModel):
    start_lat: float
    start_lng: float


class OptimizedStop(BaseModel):
    stop_order: int
    location_id: int
    estimated_travel_min: int


class OptimizeResponse(BaseModel):
    optimized_stops: List[OptimizedStop]
    total_distance_km: float
    total_duration_min: int
    estimated_cost_vnd: int
