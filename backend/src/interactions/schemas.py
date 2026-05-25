from pydantic import BaseModel
from typing import List, Literal, Union, Optional
from datetime import datetime


class InteractionAction(str):
    LIKED = "LIKED"
    DISLIKED = "DISLIKED"
    SKIPPED = "SKIPPED"
    SAVED = "SAVED"
    STARRED = "STARRED"


class SwipeAction(BaseModel):
    place_id: int
    direction: Literal["RIGHT", "LEFT"]
    client_timestamp: float


class SwipeBatchRequest(BaseModel):
    user_id: Union[int, str]
    category: Literal["food", "place"] = "place"  # Unified: was "domain"
    actions: List[SwipeAction]
    # Nullable — nếu swipe trong group lobby thì gửi group_id
    group_id: Optional[int] = None


class SwipeBatchResponse(BaseModel):
    status: str
    processed_count: int
    penalty_triggered: bool
    updated_vector: List[float]


class InteractionHistoryItem(BaseModel):
    id: int
    location_id: int
    location_name: Optional[str] = None
    action: str
    group_id: Optional[int] = None
    timestamp: datetime

    class Config:
        from_attributes = True


class InteractionHistoryResponse(BaseModel):
    items: List[InteractionHistoryItem]
    total: int

