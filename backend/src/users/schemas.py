from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserStats(BaseModel):
    reviews: int = 0
    visited: int = 0
    followers: int = 0
    following: int = 0


class BadgeSummary(BaseModel):
    icon: str
    label: str
    color: str

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
    xp: int = 0
    level: int = 1

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
    xp: int = 0
    level: int = 1
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
    xp: int = 0
    level: int = 1
    food_vector: Optional[List[float]] = None
    place_vector: Optional[List[float]] = None
    settings: Optional[dict] = None
    created_at: Optional[datetime] = None
    stats: UserStats = UserStats()
    badges: List[BadgeSummary] = []

    class Config:
        from_attributes = True
