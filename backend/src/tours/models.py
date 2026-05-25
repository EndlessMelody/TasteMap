from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from src.db.database import Base


class Tour(Base):
    """
    Bảng Tours — Food Tour được xây dựng từ Tour Builder (swipe to add).
    Mỗi tour thuộc về 1 user, chứa nhiều TourStop theo thứ tự.
    status: building / ready / in_progress / completed
    """
    __tablename__ = "tours"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    total_distance = Column(Float, nullable=True)   # km
    estimated_cost = Column(Integer, nullable=True)  # VND
    estimated_duration = Column(Integer, nullable=True)  # minutes

    # building → ready → in_progress → completed
    status = Column(String, nullable=False, default="building")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="tours")
    stops = relationship("TourStop", back_populates="tour", order_by="TourStop.stop_order", lazy="selectin")


class TourStop(Base):
    """
    Bảng TourStops — từng điểm dừng trong một Tour.
    stop_order xác định thứ tự: 1 → 2 → 3 → 4.
    """
    __tablename__ = "tour_stops"

    id = Column(Integer, primary_key=True, index=True)
    tour_id = Column(Integer, ForeignKey("tours.id", ondelete="CASCADE"), nullable=False, index=True)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=False, index=True)

    stop_order = Column(Integer, nullable=False)  # 1-based position trong tour

    added_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    tour = relationship("Tour", back_populates="stops")
    location = relationship("Location", back_populates="tour_stops")
