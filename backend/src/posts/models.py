from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, UniqueConstraint, Index, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from src.db.database import Base


class Post(Base):
    """
    Bảng Posts — bài đăng review địa điểm trong Foodie Feed.
    tags dùng ARRAY(String) của PostgreSQL.
    likes_count và comments_count là denormalized counters để tránh COUNT(*) query nặng.
    """
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="SET NULL"), nullable=True, index=True)

    review = Column(Text, nullable=False)
    rating = Column(Float, nullable=True)
    image_url = Column(String, nullable=True)

    # Postgres native array — validate bằng Pydantic, không dùng DB-level constraint
    tags = Column(ARRAY(String), nullable=True)  # VD: ["Street Food", "Spicy"]

    # Denormalized counters (tránh COUNT(*) JOIN nặng khi hiển thị feed)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="posts")
    location = relationship("Location", back_populates="posts")
    likes = relationship("PostLike", back_populates="post", lazy="selectin", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="post", lazy="selectin", cascade="all, delete-orphan")


class PostLike(Base):
    """
    Bảng PostLikes — quan hệ N:N giữa User và Post.
    Unique constraint (user_id, post_id) đảm bảo mỗi user chỉ like 1 lần.
    """
    __tablename__ = "post_likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="post_likes")
    post = relationship("Post", back_populates="likes")

    __table_args__ = (
        UniqueConstraint("user_id", "post_id", name="uq_post_like"),
        Index("ix_post_likes_post_id", "post_id"),
    )


class Comment(Base):
    """
    Bảng Comments — comment cho cả Posts và Reels.
    post_id và reel_id đều nullable — một comment thuộc về một trong hai.
    """
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Nullable — comment thuộc về post HOẶC reel
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=True, index=True)
    reel_id = Column(Integer, ForeignKey("reels.id", ondelete="CASCADE"), nullable=True, index=True)
    parent_id = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"), nullable=True, index=True)

    content = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="comments")
    post = relationship("Post", back_populates="comments")
    reel = relationship("Reel", back_populates="comments")
    parent = relationship("Comment", remote_side=[id], back_populates="replies")
    replies = relationship(
        "Comment",
        back_populates="parent",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="Comment.created_at.asc()",
    )
