from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import relationship
from src.db.database import Base


class Friendship(Base):
    """
    Bảng Friendships — quan hệ bạn bè N:N giữa các Users.
    status: pending / accepted / blocked
    Unique constraint (user_id, friend_id) tránh trùng lặp.
    """
    __tablename__ = "friendships"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    friend_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # pending / accepted / blocked
    status = Column(String, nullable=False, default="pending")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="friendships_sent")
    friend = relationship("User", foreign_keys=[friend_id], back_populates="friendships_received")

    __table_args__ = (
        UniqueConstraint("user_id", "friend_id", name="uq_friendship"),
    )
