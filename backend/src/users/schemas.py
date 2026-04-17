from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserStats(BaseModel):
    reviews: int = 0
    visited: int = 0
    followers: int = 0
    following: int = 0


class BadgeSummary(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon_name: str
    rarity: str
    accent_color: str
    is_hidden: bool
    earned_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TopSpotResponse(BaseModel):
    id: int
    name: str
    image_url: Optional[str] = None
    rating: Optional[float] = None

    class Config:
        from_attributes = True


# ─── Base ───────────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    username: str
    email: EmailStr


# ─── Auth & Registration ──────────────────────────────────────────────────

class UserCreate(UserBase):
    """Đăng ký user mới. device_id để móc vector từ Redis."""
    password: Optional[str] = None
    device_id: Optional[str] = None


# ─── PATCH Profile ───────────────────────────────────────────────────────

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    cover_url: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None


# ─── Responses ───────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    """Response cơ bản sau register / get_by_id."""
    id: int
    username: str
    email: str
    display_name: Optional[str] = None
    food_vector: Optional[List[float]] = None
    place_vector: Optional[List[float]] = None
    role: str = "user"
    xp: int = 0
    level: int = 1
    next_level_xp: int = 100
    total_xp_earned: int = 0

    class Config:
        from_attributes = True


class UserProfile(BaseModel):
    """Public profile — GET /users/{id}"""
    id: int
    username: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    cover_url: Optional[str] = None
    location: Optional[str] = None
    title: Optional[str] = None
    xp: int = 0               # XP trong level hiện tại (relative)
    level: int = 1
    next_level_xp: int = 100  # XP cần để hoàn thành level này (relative)
    total_xp_earned: int = 0   # Tổng XP tích lũy (absolute)
    created_at: Optional[datetime] = None
    stats: UserStats = UserStats()
    badges: List[BadgeSummary] = []

    class Config:
        from_attributes = True


class UserMe(BaseModel):
    """Private profile — GET /users/me (bao gồm cả private fields)"""
    id: int
    username: str
    email: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    cover_url: Optional[str] = None
    location: Optional[str] = None
    title: Optional[str] = None
    phone: Optional[str] = None
    xp: int = 0               # XP trong level hiện tại (relative)
    level: int = 1
    next_level_xp: int = 100  # XP cần để hoàn thành level này (relative)
    total_xp_earned: int = 0   # Tổng XP tích lũy (absolute)
    food_vector: Optional[List[float]] = None
    place_vector: Optional[List[float]] = None
    role: str = "user"
    settings: Optional[dict] = None
    created_at: Optional[datetime] = None
    stats: UserStats = UserStats()
    badges: List[BadgeSummary] = []

    class Config:
        from_attributes = True


# ─── Authentication Schemas ───

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds

class TokenPayload(BaseModel):
    sub: int  # user_id
    role: str = "user"
    exp: datetime
    type: str = "access"

class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    confirm_password: str
    name: Optional[str] = None
    otp_verified: bool = False  # Set to True after OTP verification


class AuthResponse(BaseModel):
    """Response sau khi login/register thành công"""
    token: Token
    user: UserResponse


# ─── OTP Schemas ───

class SendOTPRequest(BaseModel):
    email: EmailStr
    username: str


class SendOTPResponse(BaseModel):
    success: bool
    message: str
    expires_in: int = 600  # 10 minutes in seconds


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


class VerifyOTPResponse(BaseModel):
    success: bool
    message: str


class CheckEmailVerifiedRequest(BaseModel):
    email: EmailStr


class CheckEmailVerifiedResponse(BaseModel):
    verified: bool
    email: str


# ─── Profile Schemas (cho /profile page) ───



class RadarDataPoint(BaseModel):
    subject: str
    A: float
    fullMark: int = 150

class Post(BaseModel):
    id: int
    img: str
    likes: int
    comments: int

class TopSpot(BaseModel):
    name: str
    img: str
    rating: float
    category: str

class ProfileResponse(BaseModel):
    """Full profile data cho /profile page"""
    id: int
    name: str
    username: str
    email: str
    bio: Optional[str] = None
    avatar: Optional[str] = None
    cover: Optional[str] = None
    title: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    joined: str  # formatted like "March 2025"
    
    # Gamification — all relative values, computed server-side
    level: int
    xp: int           # XP trong level hiện tại (relative)
    nextLevelXp: int  # XP cần để hoàn thành level này (relative, từ LevelConfig)
    total_xp_earned: int = 0  # Tổng XP tích lũy (absolute)
    
    # Stats
    stats: UserStats
    
    # Taste DNA (radar chart data)
    radarData: List[RadarDataPoint]
    
    # Achievements
    badges: List[BadgeSummary]
    
    # Content
    posts: List[Post]
    topSpots: List[TopSpot]

    class Config:
        from_attributes = True


# ─── Social Context (for public profile page) ───────────────────────────────

class MutualFriendStub(BaseModel):
    id: int
    username: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class SocialContextResponse(BaseModel):
    """Viewer-aware context for a user's public profile page."""
    friendship_status: str = "none"  # none / pending_sent / pending_received / accepted / blocked
    friendship_id: Optional[int] = None
    food_vector: Optional[List[float]] = None
    mutual_friends_count: int = 0
    mutual_friends: List[MutualFriendStub] = []
