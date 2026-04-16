from sqlalchemy import Column, Integer, String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from pgvector.sqlalchemy import Vector
from sqlalchemy.orm import relationship
from src.db.database import Base


class User(Base):
    """
    Bảng Users — lưu trữ thông tin người dùng và vector sở thích 15 chiều.
    Vector mặc định [0.5]*15 (trung lập) để thuật toán U_new = U_old ± α·P
    không bị TypeError khi user mới chưa có dữ liệu.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    supabase_uid = Column(String, unique=True, index=True, nullable=True) # UUID từ Supabase Auth
    password_hash = Column(String, nullable=True)  # Nullable cho giai đoạn chưa có auth
    role = Column(String, default="user", nullable=False) # admin hoặc user
    display_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)

    # Profile info (từ profile/page.tsx)
    bio = Column(Text, nullable=True)                  # Mô tả bản thân
    cover_url = Column(String, nullable=True)           # Ảnh bìa profile
    location = Column(String, nullable=True)            # VD: "Dĩ An, Bình Dương"
    title = Column(String, nullable=True)               # Gamification title: "Taste Explorer"
    phone = Column(String, nullable=True)               # Số điện thoại (private)

    # 15-dimensional preference vectors (separated by domain)
    food_vector = Column(Vector(15), nullable=False, default=[0.5] * 15)
    place_vector = Column(Vector(15), nullable=False, default=[0.5] * 15)

    # Gamification
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)

    # User settings — JSONB cho linh hoạt, không cần table riêng
    # VD: {"theme": "dark", "language": "vi", "notif_friends": true, "notif_deals": true, ...}
    settings = Column(JSONB, nullable=True, default={})

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships — existing
    interactions = relationship("Interaction", back_populates="user", lazy="selectin")
    group_memberships = relationship("GroupMember", back_populates="user", lazy="selectin")

    # Relationships — social features
    posts = relationship("Post", back_populates="user", lazy="selectin")
    reels = relationship("Reel", back_populates="user", lazy="selectin")
    post_likes = relationship("PostLike", back_populates="user", lazy="selectin")
    comments = relationship("Comment", back_populates="user", lazy="selectin")
    friendships_sent = relationship("Friendship", foreign_keys="Friendship.user_id", back_populates="user", lazy="selectin")
    friendships_received = relationship("Friendship", foreign_keys="Friendship.friend_id", back_populates="friend", lazy="selectin")
    tours = relationship("Tour", back_populates="user", lazy="selectin")
    bookmarks = relationship("Bookmark", back_populates="user", lazy="selectin")
    notifications = relationship("Notification", back_populates="user", lazy="selectin")

    # Relationships — gamification
    user_badges = relationship("UserBadge", back_populates="user", lazy="selectin")
