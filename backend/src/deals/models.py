from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from src.db.database import Base


class Deal(Base):
    """
    Bảng Deals — khuyến mãi / ưu đãi tại địa điểm.
    Xuất hiện trong Notification panel (Deals section) và Hero Banner của dashboard.
    is_sponsored: True → hiển thị tag "Ad • Sponsored".
    """
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="SET NULL"), nullable=True, index=True)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    discount_percent = Column(Integer, nullable=True)
    banner_image_url = Column(String, nullable=True)
    xp_reward = Column(Integer, default=0)
    is_sponsored = Column(Boolean, default=False)

    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    location = relationship("Location", back_populates="deals")
