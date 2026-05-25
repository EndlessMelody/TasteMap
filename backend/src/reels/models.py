from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from src.db.database import Base


class Reel(Base):
    """
    Bảng Reels — video ngắn về food/location trong Trending Reels section.
    views_count, likes_count, comments_count là denormalized counters.
    """
    __tablename__ = "reels"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String, nullable=False)
    video_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)

    # Denormalized counters
    views_count = Column(Integer, default=0)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="reels")
    comments = relationship("Comment", back_populates="reel", lazy="selectin", cascade="all, delete-orphan")
    likes = relationship("ReelLike", back_populates="reel", lazy="selectin", cascade="all, delete-orphan")


class ReelLike(Base):
    """
    Bảng ReelLikes — quan hệ N:N giữa User và Reel.
    """
    __tablename__ = "reel_likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reel_id = Column(Integer, ForeignKey("reels.id", ondelete="CASCADE"), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="reel_likes")
    reel = relationship("Reel", back_populates="likes")

    __table_args__ = (
        UniqueConstraint("user_id", "reel_id", name="uq_reel_like"),
        Index("ix_reel_likes_reel_id", "reel_id"),
    )
