from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Any, Dict
from datetime import datetime


class ChallengeBase(BaseModel):
    title: str
    description: str
    category: str
    difficulty: str
    xp_reward: int
    target_count: int
    icon: str
    accent_color: str


class ChallengeResponse(ChallengeBase):
    id: int
    badge_id: Optional[int] = None
    action_type: str
    action_filter: Dict[str, Any]
    duration_days: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: bool
    is_recurring: bool

    model_config = ConfigDict(from_attributes=True)


class ChallengeCreate(ChallengeBase):
    action_type: str
    action_filter: Optional[Dict[str, Any]] = Field(default_factory=dict)
    badge_id: Optional[int] = None
    duration_days: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: bool = True
    is_recurring: bool = False


class ChallengeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    xp_reward: Optional[int] = None
    target_count: Optional[int] = None
    icon: Optional[str] = None
    accent_color: Optional[str] = None
    action_type: Optional[str] = None
    action_filter: Optional[Dict[str, Any]] = None
    badge_id: Optional[int] = None
    duration_days: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None
    is_recurring: Optional[bool] = None


class ChallengeAdminDetail(ChallengeResponse):
    participants_count: int = 0
    completion_rate: int = 0


class UserChallengeProgress(BaseModel):
    challenge: ChallengeResponse
    progress: int
    target: int
    status: str
    started_at: datetime
    expires_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    claimed_at: Optional[datetime] = None
    percentage: float = 0.0

    model_config = ConfigDict(from_attributes=True)


class UserChallengeSummary(BaseModel):
    items: List[UserChallengeProgress]
    active_count: int
    completed_count: int
    total_xp_earned: int


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    username: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    xp: int
    level: int
    title: Optional[str] = None
    is_current_user: bool = False

    model_config = ConfigDict(from_attributes=True)


class StreakStatus(BaseModel):
    current_streak: int
    longest_streak: int
    last_active_date: str
    streak_start_date: Optional[str] = None
    is_active_today: bool
    streak_bonus_xp: int

    model_config = ConfigDict(from_attributes=True)


class XpTransactionResponse(BaseModel):
    id: int
    amount: int
    source_type: str
    description: Optional[str] = None
    balance_after: int
    level_after: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
