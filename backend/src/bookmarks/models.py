from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import relationship
from src.db.database import Base


class Bookmark(Base):
    """
    Bảng Bookmarks — "The Taste Vault" trong frontend.
    User lưu địa điểm yêu thích, bài viết (Post), hoặc Reel.
    Nhận XP khi bookmark địa điểm.
    """
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Một bookmark có thể trỏ tới Location, Post, hoặc Reel
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=True, index=True)
    reel_id = Column(Integer, ForeignKey("reels.id", ondelete="CASCADE"), nullable=True, index=True)

    # XP thưởng khi lưu địa điểm vào Vault (chỉ áp dụng cho location_id)
    xp_earned = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="bookmarks")
    location = relationship("Location", back_populates="bookmarks")
    post = relationship("Post", lazy="selectin")
    reel = relationship("Reel", lazy="selectin")

    __table_args__ = (
        UniqueConstraint("user_id", "location_id", name="uq_bookmark_location"),
        UniqueConstraint("user_id", "post_id", name="uq_bookmark_post"),
        UniqueConstraint("user_id", "reel_id", name="uq_bookmark_reel"),
    )
