from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from src.db.database import Base


class Notification(Base):
    """
    Bảng Notifications — thông báo cho user.
    type: social / deal / system
    reference_type + reference_id: polymorphic reference đến entity liên quan
      VD: reference_type="post", reference_id=42 → Post với id=42
    """
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # social / deal / system
    type = Column(String, nullable=False)

    title = Column(String, nullable=False)
    body = Column(Text, nullable=True)
    is_read = Column(Boolean, default=False)

    # Polymorphic reference — không dùng FK cứng để giữ linh hoạt
    reference_type = Column(String, nullable=True)  # "post" / "reel" / "lobby" / "location"
    reference_id = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="notifications")
