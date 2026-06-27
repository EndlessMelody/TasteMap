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
    lat: float
    lng: float
    category: str = "food"


class RescueMeResponse(BaseModel):
    place: Optional[dict] = None


# ─── Group Consensus & Compatibility Engine ──────────────────────────────

class CompatibilityCheckRequest(BaseModel):
    target_user_ids: List[int]


class CompatibilityMatchResult(BaseModel):
    user_id: int
    username: str
    avatar_url: Optional[str] = None
    similarity_score: float
    compatibility_label: str
    shared_loves: List[str]
    potential_friction: List[str]


class CompatibilityResponse(BaseModel):
    overall_harmony: float
    summary: str
    matches: List[CompatibilityMatchResult]


class GroupConsensusRequest(BaseModel):
    user_ids: List[int]
    lat: Optional[float] = None
    lng: Optional[float] = None
    radius_km: float = 5.0
    category: str = "place"
    top_n: int = 5


class MemberSatisfaction(BaseModel):
    user_id: int
    username: str
    match_score: float


class ConsensusRecommendation(BaseModel):
    place_id: int
    name: str
    group_harmony_score: float
    min_member_score: float
    distance_km: Optional[float] = None
    member_satisfactions: List[MemberSatisfaction]
    image_url: Optional[str] = None
    price_range: Optional[str] = None
    reason: str


class GroupConsensusResponse(BaseModel):
    consensus_vector: List[float]
    group_size: int
    recommendations: List[ConsensusRecommendation]