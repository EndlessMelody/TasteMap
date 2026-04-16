from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, func, JSON, UniqueConstraint, Index, text
from sqlalchemy.orm import relationship
from src.db.database import Base


class Challenge(Base):
    """
    Bảng challenges — template cho các thử thách (admin tạo).
    """
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(20), nullable=False)        # discovery, social, review, cuisine, streak
    difficulty = Column(String(10), nullable=False)       # easy, medium, hard
    
    xp_reward = Column(Integer, nullable=False, default=100)
    badge_id = Column(Integer, ForeignKey("badges.id", ondelete="SET NULL"), nullable=True)
    
    target_count = Column(Integer, nullable=False, default=1)
    action_type = Column(String(50), nullable=False)         # action key to track (e.g., post_create)
    action_filter = Column(JSON, server_default='{}')        # complex filters like {"time_after": "21:00"}
    
    icon = Column(String(30), nullable=False, default='trophy')
    accent_color = Column(String(7), nullable=False, default='#007AFF')
    
    duration_days = Column(Integer, nullable=True)           # NULL = permanent
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    
    is_active = Column(Boolean, nullable=False, default=True)
    is_recurring = Column(Boolean, nullable=False, default=False)
    sort_order = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user_challenges = relationship("UserChallenge", back_populates="challenge", cascade="all, delete-orphan")
    badge = relationship("Badge")


class UserChallenge(Base):
    """
    Bảng user_challenges — theo dõi tiến độ tham gia thử thách của từng user.
    """
    __tablename__ = "user_challenges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    challenge_id = Column(Integer, ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False, index=True)
    
    progress = Column(Integer, nullable=False, default=0)
    status = Column(String(12), nullable=False, default='active')  # active, completed, expired, claimed
    
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    claimed_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    last_progress_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="user_challenges")
    challenge = relationship("Challenge", back_populates="user_challenges")

    __table_args__ = (
        UniqueConstraint("user_id", "challenge_id", name="uq_user_challenge"),
    )


class UserStreak(Base):
    """
    Bảng user_streaks — theo dõi chuỗi hoạt động hàng ngày.
    """
    __tablename__ = "user_streaks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, unique=True)
    
    current_streak = Column(Integer, nullable=False, default=0)
    longest_streak = Column(Integer, nullable=False, default=0)
    last_active_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    streak_start_date = Column(DateTime(timezone=True), nullable=True)
    timezone_offset = Column(Integer, nullable=False, default=7)  # Default GMT+7
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="user_streaks")


class XpTransaction(Base):
    """
    Bảng xp_transactions — lưu vết mọi thay đổi điểm kinh nghiệm.
    """
    __tablename__ = "xp_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    amount = Column(Integer, nullable=False)
    source_type = Column(String(30), nullable=False)         # challenge, streak_bonus, post, review, daily_login
    source_id = Column(Integer, nullable=True)
    description = Column(String(200), nullable=True)
    
    balance_after = Column(Integer, nullable=False)
    level_after = Column(Integer, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="xp_transactions")


class ChallengeProgressLog(Base):
    """
    Bảng challenge_progress_log — nhật ký chi tiết giúp chống abuse và deduplication.
    """
    __tablename__ = "challenge_progress_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    challenge_id = Column(Integer, ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False, index=True)
    
    action_type = Column(String(50), nullable=False)
    action_ref_id = Column(Integer, nullable=True)           # post_id, reel_id...
    action_ref_type = Column(String(30), nullable=True)       # post, reel, like...
    delta = Column(Integer, nullable=False, default=1)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index(
            "idx_progress_log_dedup",
            "user_id", "challenge_id", "action_ref_type", "action_ref_id",
            unique=True,
            postgresql_where=(text("action_ref_id IS NOT NULL"))
        ),
    )
