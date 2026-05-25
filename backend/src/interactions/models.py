from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from src.db.database import Base


class Interaction(Base):
    """
    Bảng Interactions — lưu lịch sử swipe để:
    1. Recalculate / reverse vector nếu cần.
    2. Aggregate hành vi hàng tháng (cronjob 3h sáng).
    3. Purge data > 30 ngày sau khi aggregate.

    ⚠️ HIGH-VOLUME TABLE:
    - Composite Index (user_id, timestamp) là BẮT BUỘC.
    - Composite Index (group_id, action) cho query Vault nhanh.
    - action dùng String thay vì Postgres Enum để dễ thêm action mới
      (STARRED, ...) mà không cần ALTER TYPE.
    - Validation enum nằm ở tầng Pydantic schema, không ở DB.
    """
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=False, index=True)

    # Nullable FK — đánh dấu swipe khi ở trong phòng nhóm
    # NULL = swipe cá nhân bình thường, NOT NULL = swipe trong group lobby
    # Dùng để query Group's Vault: WHERE group_id = ? AND action IN ('LIKED', 'STARRED')
    group_id = Column(Integer, ForeignKey("groups.id", ondelete="SET NULL"), nullable=True, index=True)

    # String thay vì Enum — linh hoạt cho migration, validate bằng Pydantic
    # Giá trị hợp lệ: LIKED, DISLIKED, SKIPPED, SAVED, STARRED
    action = Column(String, nullable=False)

    # Snapshot ngữ cảnh lúc swipe (weather, time_of_day, user_lat/lng, ...)
    context_at_time = Column(JSONB, nullable=True)

    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="interactions")
    location = relationship("Location", back_populates="interactions")

    # Composite Indexes
    __table_args__ = (
        Index("ix_interactions_user_timestamp", "user_id", "timestamp"),
        Index("ix_interactions_group_action", "group_id", "action"),
    )

