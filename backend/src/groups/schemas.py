from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ─── Member schemas ───────────────────────────────────────────────────────

class MemberSummary(BaseModel):
    user_id: int
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_host: bool = False
    is_ready: bool = False


# ─── Group CRUD ───────────────────────────────────────────────────────────

class GroupCreate(BaseModel):
    name: str
    description: Optional[str] = None
    route_description: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    max_spots: int = 6
    cover_image_url: Optional[str] = None
    accent_color: Optional[str] = None
    is_public: bool = True


class GroupResponse(BaseModel):
    id: int
    name: str
    status: str
    description: Optional[str] = None
    route_description: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    max_spots: int = 6
    cover_image_url: Optional[str] = None
    accent_color: Optional[str] = None
    is_public: bool = True
    invite_code: Optional[str] = None
    created_at: Optional[datetime] = None
    members: List[MemberSummary] = []
    spots_remaining: int = 0

    class Config:
        from_attributes = True


class GroupListResponse(BaseModel):
    items: List[GroupResponse]


class ReadyUpdate(BaseModel):
    is_ready: bool


class JoinByCodeRequest(BaseModel):
    invite_code: str


# ─── Recommend (Minimax Referee — đang chơi) ─────────────────────────────

class GroupRecommendRequest(BaseModel):
    lat: float
    lng: float
    category: str = "food"
    meal_slot: Optional[str] = None
    top_n: int = 5


class MemberScore(BaseModel):
    user_id: int
    display_name: Optional[str] = None
    score: float
    compromise: float


class GroupPlaceResult(BaseModel):
    place_id: int
    name: str
    group_score: float
    member_scores: List[MemberScore]
    most_compromised_member: Optional[str] = None
    compensation_note: Optional[str] = None


class GroupRecommendResponse(BaseModel):
    group_vector: List[float]
    recommendations: List[GroupPlaceResult]


# ─── Sync (Polling) ──────────────────────────────────────────────────────

class StarredCardInfo(BaseModel):
    location_id: int
    location_name: Optional[str] = None
    image_url: Optional[str] = None
    starred_by: Optional[str] = None
    starred_at: Optional[datetime] = None


class MemberSyncStatus(BaseModel):
    user_id: int
    display_name: Optional[str] = None
    swipe_count: int = 0
    is_ready: bool = False


class GroupSyncResponse(BaseModel):
    starred_cards: List[StarredCardInfo] = []
    group_vector: List[float] = []
    members_status: List[MemberSyncStatus] = []
    vault_count: int = 0


# ─── Vault (Kho lưu trữ nhóm) ────────────────────────────────────────────

class VaultLikedBy(BaseModel):
    user_id: int
    display_name: Optional[str] = None
    action: str  # "LIKED" | "STARRED"


class VaultItem(BaseModel):
    location_id: int
    name: str
    image_url: Optional[str] = None
    total_likes: int = 0
    liked_by: List[VaultLikedBy] = []


class VaultResponse(BaseModel):
    items: List[VaultItem]


# ─── Finish (Chốt danh sách) ─────────────────────────────────────────────

class FinishRequest(BaseModel):
    top_n: int = 3


class FinishMemberScore(BaseModel):
    user_id: int
    score: float
    compromise: float


class FinishResolution(BaseModel):
    place_id: int
    name: str
    group_score: float
    member_scores: List[FinishMemberScore]
    in_vault: bool = False


class FinishResponse(BaseModel):
    status: str
    final_resolutions: List[FinishResolution]
    message: str


# ─── Undo ─────────────────────────────────────────────────────────────────

class UndoResponse(BaseModel):
    status: str
    undone_interaction_id: Optional[int] = None
    reverted_vector: List[float] = []


# ─── Swipe (Group-context swiping) ────────────────────────────────────────

class GroupSwipeRequest(BaseModel):
    location_id: int
    action: str  # "LIKED" | "SKIPPED" | "STARRED"


class GroupSwipeResponse(BaseModel):
    status: str
    interaction_id: int
    updated_session_vector: List[float] = []
    is_starred: bool = False


# ─── Launch (Host starts swipe session) ───────────────────────────────────

class GroupLaunchResponse(BaseModel):
    status: str
    group_id: int
    message: str


# ─── Chat ─────────────────────────────────────────────────────────────────

class ChatMessageBase(BaseModel):
    content: str | None = None
    content_type: str = "text"
    media_url: str | None = None
    media_meta: dict = {}


class ChatMessageCreate(ChatMessageBase):
    pass


class ChatMessageResponse(ChatMessageBase):
    id: int
    group_id: int
    user_id: int
    username: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatMessageList(BaseModel):
    items: List[ChatMessageResponse]
