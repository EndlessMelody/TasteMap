from pydantic import BaseModel, conlist
from typing import List, Optional
from datetime import datetime


# ─── Base ────────────────────────────────────────────────────────────────

class RecommendationRequest(BaseModel):
    user_vector: conlist(float, min_length=15, max_length=15)
    top_n: int = 5
    category: str = "place"  # Unified: was "domain"


class PlaceRecommendation(BaseModel):
    place_id: int
    name: str
    match_score: float
    lat: float
    lng: float
    vector: List[float]
    image_url: Optional[str] = None
    price_range: Optional[str] = None


class RecommendationResponse(BaseModel):
    recommendations: List[PlaceRecommendation]


# ─── Contextual ──────────────────────────────────────────────────────────

class ContextualRequest(BaseModel):
    user_id: int
    lat: float
    lng: float
    category: str = "food"  # Unified
    radius_km: float = 3.0
    top_n: int = 10
    time_context: Optional[str] = None  # "breakfast" | "lunch" | "dinner"


class ContextualPlaceResult(BaseModel):
    place_id: int
    name: str
    match_score: float
    distance_km: float
    reason: Optional[str] = None
    open_status: Optional[str] = None
    image_url: Optional[str] = None
    price_range: Optional[str] = None


class ContextualResponse(BaseModel):
    context: dict
    recommendations: List[ContextualPlaceResult]


# ─── Rescue Me ───────────────────────────────────────────────────────────

class RescueMeRequest(BaseModel):
    user_id: int
    lat: float
    lng: float
    category: str = "food"


class RescueMeResponse(BaseModel):
    place: Optional[dict] = None