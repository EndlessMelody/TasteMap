from sqlalchemy import (
    Column, Integer, String, Text, Date, DateTime, Boolean,
    ForeignKey, UniqueConstraint, Index, func, text
)
from sqlalchemy.orm import relationship
from src.db.database import Base


class Subscription(Base):
    """
    Bảng subscriptions — vòng đời gói trả phí Feast.
    Mỗi user chỉ có tối đa 1 subscription 'active' tại 1 thời điểm
    (partial unique index bên dưới).
    """
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    plan = Column(String(30), nullable=False)          # feast_monthly | feast_yearly
    status = Column(String(12), nullable=False, index=True, default="active")  # active | expired
    price_vnd = Column(Integer, nullable=False)
    currency = Column(String(3), nullable=False, default="VND")

    started_at = Column(DateTime(timezone=True), server_default=func.now())
    current_period_start = Column(DateTime(timezone=True), nullable=False)
    current_period_end = Column(DateTime(timezone=True), nullable=False, index=True)

    cancel_at_period_end = Column(Boolean, nullable=False, default=False)
    canceled_at = Column(DateTime(timezone=True), nullable=True)

    payment_method_id = Column(Integer, ForeignKey("payment_methods.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id])
    payment_method = relationship("PaymentMethod", foreign_keys=[payment_method_id])
    transactions = relationship("PaymentTransaction", back_populates="subscription")

    __table_args__ = (
        Index(
            "uq_subscriptions_user_active",
            "user_id",
            unique=True,
            postgresql_where=text("status = 'active'"),
        ),
    )


class PaymentMethod(Base):
    """
    Bảng payment_methods — thẻ đã lưu (chỉ lưu bản che số, không lưu PAN thật).
    `test_behavior` là scaffolding của mock provider — KHÔNG được tồn tại
    nếu sau này thay bằng provider thanh toán thật (Stripe/VNPay/...).
    """
    __tablename__ = "payment_methods"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    brand = Column(String(20), nullable=False, default="visa")
    last4 = Column(String(4), nullable=False)
    exp_month = Column(Integer, nullable=False)
    exp_year = Column(Integer, nullable=False)
    cardholder_name = Column(String(100), nullable=True)

    fingerprint = Column(String(64), nullable=False)  # sha256(PAN) — không thể đảo ngược
    test_behavior = Column(String(30), nullable=False, default="success")  # mock-only

    is_default = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])

    __table_args__ = (
        UniqueConstraint("user_id", "fingerprint", name="uq_payment_method_user_fingerprint"),
    )


class PaymentTransaction(Base):
    """
    Bảng payment_transactions — sổ cái giao dịch (append-only).
    Cấu trúc mô phỏng theo xp_transactions.
    """
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True)
    payment_method_id = Column(Integer, ForeignKey("payment_methods.id", ondelete="SET NULL"), nullable=True)

    amount_vnd = Column(Integer, nullable=False)
    currency = Column(String(3), nullable=False, default="VND")
    type = Column(String(20), nullable=False)          # purchase | renewal
    status = Column(String(12), nullable=False)         # succeeded | declined | error
    provider = Column(String(20), nullable=False, default="mockvisa")
    provider_txn_id = Column(String(64), nullable=False, unique=True)
    decline_code = Column(String(30), nullable=True)
    description = Column(String(200), nullable=True)
    receipt_number = Column(String(30), nullable=True, unique=True)
    idempotency_key = Column(String(64), nullable=True, unique=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    user = relationship("User", foreign_keys=[user_id])
    subscription = relationship("Subscription", back_populates="transactions")
    payment_method = relationship("PaymentMethod", foreign_keys=[payment_method_id])


class AvatarFrame(Base):
    """
    Bảng avatar_frames — catalog khung avatar (cosmetic), seed sẵn qua migration.
    """
    __tablename__ = "avatar_frames"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(50), nullable=False, unique=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    min_tier = Column(String(10), nullable=False)  # savor | feast | omakase
    style_key = Column(String(50), nullable=False)  # frontend CSS renderer key
    accent_color = Column(String(20), nullable=False)
    is_animated = Column(Boolean, nullable=False, default=False)
    sort_order = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UserFrame(Base):
    """
    Bảng user_frames — kho khung avatar user đã sở hữu (cấp phát khi đạt tier).
    """
    __tablename__ = "user_frames"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    frame_id = Column(Integer, ForeignKey("avatar_frames.id", ondelete="CASCADE"), nullable=False)
    earned_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])
    frame = relationship("AvatarFrame", foreign_keys=[frame_id])

    __table_args__ = (
        UniqueConstraint("user_id", "frame_id", name="uq_user_frame"),
    )


class StreakFreeze(Base):
    """
    Bảng streak_freezes — nhật ký các lần "tha" streak bị đứt (1 ngày bỏ lỡ).
    """
    __tablename__ = "streak_freezes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    frozen_date = Column(Date, nullable=False)
    tier_at_use = Column(String(10), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])

    __table_args__ = (
        UniqueConstraint("user_id", "frozen_date", name="uq_streak_freeze_user_date"),
    )
