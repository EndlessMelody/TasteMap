from typing import List, Literal, Optional

from pydantic import BaseModel, Field

from src.tours.schemas import TourResponse, LocationStub


class PlannerGenerateRequest(BaseModel):
    mood: Optional[Literal["casual", "adventurous", "romantic", "family"]] = None
    cuisines: List[str] = Field(default_factory=list)
    duration_min: int = Field(240, ge=30, le=720)
    budget_vnd_max: Optional[int] = Field(None, ge=0)
    party: Optional[str] = None
    start_lat: Optional[float] = None
    start_lng: Optional[float] = None
    time_context: Optional[str] = None
    transport_mode: Literal["walking", "driving", "transit"] = "walking"
    prompt: Optional[str] = Field(None, max_length=500)


class PlannerGenerateResponse(BaseModel):
    tour: TourResponse
    alternates: List[LocationStub] = Field(default_factory=list)
