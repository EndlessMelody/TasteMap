from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, func, Text, Boolean
from sqlalchemy.orm import relationship
from src.db.database import Base


class Badge(Base):
    """
    Bảng Badges — danh sách huy hiệu có thể nhận.
    VD: Spice Master, Night Owl, Photo Pro, Top Reviewer
    """
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    icon_name = Column(String(50), nullable=False) 
    rarity = Column(String(20), nullable=False, default="Common") 
    accent_color = Column(String(20), nullable=False, default="#007AFF")
    is_hidden = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user_badges = relationship("UserBadge", back_populates="badge", lazy="selectin")

class UserBadge(Base):
    """
    Bảng UserBadges — liên kết N:N giữa User và Badge.
    Unique constraint (user_id, badge_id) tránh nhận trùng badge.
    """
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    badge_id = Column(Integer, ForeignKey("badges.id", ondelete="CASCADE"), nullable=False, index=True)

    earned_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="user_badges")
    badge = relationship("Badge", back_populates="user_badges")

    __table_args__ = (
        UniqueConstraint("user_id", "badge_id", name="uq_user_badge"),
    )
