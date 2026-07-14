"""Add membership monetization schema (tiers, mock Visa payments, avatar frames)

Revision ID: 20260708memb
Revises: 20260628tourm
Create Date: 2026-07-08 00:00:00.000000

Adds the 4-tier account system (Bite/Savor/Feast/Omakase):
  - users.membership_tier / users.equipped_frame_id (denormalized snapshot,
    see docs/database_schema/monetization.md for the tier-resolution rules)
  - subscriptions, payment_methods, payment_transactions (mock Visa ledger)
  - avatar_frames (catalog, seeded below), user_frames (inventory)
  - streak_freezes

See docs/database_schema/monetization.md (Table blocks) and
docs/api/monetization.md for the full spec.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260708memb"
down_revision: Union[str, Sequence[str], None] = "20260628tourm"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── avatar_frames (catalog, no FK deps) ─────────────────────────────
    op.create_table(
        "avatar_frames",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("min_tier", sa.String(length=10), nullable=False),
        sa.Column("style_key", sa.String(length=50), nullable=False),
        sa.Column("accent_color", sa.String(length=20), nullable=False),
        sa.Column("is_animated", sa.Boolean(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(op.f("ix_avatar_frames_id"), "avatar_frames", ["id"], unique=False)

    # ── payment_methods (FK -> users) ───────────────────────────────────
    op.create_table(
        "payment_methods",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("brand", sa.String(length=20), nullable=False),
        sa.Column("last4", sa.String(length=4), nullable=False),
        sa.Column("exp_month", sa.Integer(), nullable=False),
        sa.Column("exp_year", sa.Integer(), nullable=False),
        sa.Column("cardholder_name", sa.String(length=100), nullable=True),
        sa.Column("fingerprint", sa.String(length=64), nullable=False),
        sa.Column("test_behavior", sa.String(length=30), nullable=False),
        sa.Column("is_default", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "fingerprint", name="uq_payment_method_user_fingerprint"),
    )
    op.create_index(op.f("ix_payment_methods_id"), "payment_methods", ["id"], unique=False)
    op.create_index(op.f("ix_payment_methods_user_id"), "payment_methods", ["user_id"], unique=False)

    # ── subscriptions (FK -> users, payment_methods) ────────────────────
    op.create_table(
        "subscriptions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("plan", sa.String(length=30), nullable=False),
        sa.Column("status", sa.String(length=12), nullable=False),
        sa.Column("price_vnd", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("current_period_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("current_period_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("cancel_at_period_end", sa.Boolean(), nullable=False),
        sa.Column("canceled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("payment_method_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["payment_method_id"], ["payment_methods.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_subscriptions_id"), "subscriptions", ["id"], unique=False)
    op.create_index(op.f("ix_subscriptions_user_id"), "subscriptions", ["user_id"], unique=False)
    op.create_index(op.f("ix_subscriptions_status"), "subscriptions", ["status"], unique=False)
    op.create_index(op.f("ix_subscriptions_current_period_end"), "subscriptions", ["current_period_end"], unique=False)
    op.create_index(
        "uq_subscriptions_user_active",
        "subscriptions",
        ["user_id"],
        unique=True,
        postgresql_where=sa.text("status = 'active'"),
    )

    # ── payment_transactions (FK -> users, subscriptions, payment_methods) ──
    op.create_table(
        "payment_transactions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("subscription_id", sa.Integer(), nullable=True),
        sa.Column("payment_method_id", sa.Integer(), nullable=True),
        sa.Column("amount_vnd", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("type", sa.String(length=20), nullable=False),
        sa.Column("status", sa.String(length=12), nullable=False),
        sa.Column("provider", sa.String(length=20), nullable=False),
        sa.Column("provider_txn_id", sa.String(length=64), nullable=False),
        sa.Column("decline_code", sa.String(length=30), nullable=True),
        sa.Column("description", sa.String(length=200), nullable=True),
        sa.Column("receipt_number", sa.String(length=30), nullable=True),
        sa.Column("idempotency_key", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["subscription_id"], ["subscriptions.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["payment_method_id"], ["payment_methods.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("provider_txn_id"),
        sa.UniqueConstraint("receipt_number"),
        sa.UniqueConstraint("idempotency_key"),
    )
    op.create_index(op.f("ix_payment_transactions_id"), "payment_transactions", ["id"], unique=False)
    op.create_index(op.f("ix_payment_transactions_user_id"), "payment_transactions", ["user_id"], unique=False)
    op.create_index(
        "ix_payment_transactions_user_created",
        "payment_transactions",
        ["user_id", "created_at"],
        unique=False,
    )

    # ── user_frames (FK -> users, avatar_frames) ────────────────────────
    op.create_table(
        "user_frames",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("frame_id", sa.Integer(), nullable=False),
        sa.Column("earned_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["frame_id"], ["avatar_frames.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "frame_id", name="uq_user_frame"),
    )
    op.create_index(op.f("ix_user_frames_id"), "user_frames", ["id"], unique=False)
    op.create_index(op.f("ix_user_frames_user_id"), "user_frames", ["user_id"], unique=False)

    # ── streak_freezes (FK -> users) ─────────────────────────────────────
    op.create_table(
        "streak_freezes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("frozen_date", sa.Date(), nullable=False),
        sa.Column("tier_at_use", sa.String(length=10), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "frozen_date", name="uq_streak_freeze_user_date"),
    )
    op.create_index(op.f("ix_streak_freezes_id"), "streak_freezes", ["id"], unique=False)
    op.create_index(op.f("ix_streak_freezes_user_id"), "streak_freezes", ["user_id"], unique=False)

    # ── users: + membership_tier, + equipped_frame_id ───────────────────
    op.add_column(
        "users",
        sa.Column("membership_tier", sa.String(length=10), nullable=False, server_default="bite"),
    )
    op.add_column(
        "users",
        sa.Column("equipped_frame_id", sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        "fk_users_equipped_frame_id",
        "users",
        "avatar_frames",
        ["equipped_frame_id"],
        ["id"],
        ondelete="SET NULL",
    )

    # ── Seed avatar_frames catalog ───────────────────────────────────────
    avatar_frames_table = sa.table(
        "avatar_frames",
        sa.column("slug", sa.String),
        sa.column("name", sa.String),
        sa.column("description", sa.Text),
        sa.column("min_tier", sa.String),
        sa.column("style_key", sa.String),
        sa.column("accent_color", sa.String),
        sa.column("is_animated", sa.Boolean),
        sa.column("sort_order", sa.Integer),
        sa.column("is_active", sa.Boolean),
    )
    op.bulk_insert(
        avatar_frames_table,
        [
            {
                "slug": "savor-ember",
                "name": "Ember Ring",
                "description": "A warm ember glow for a 7-day streak well kept.",
                "min_tier": "savor",
                "style_key": "savor-ember",
                "accent_color": "#ff6b35",
                "is_animated": False,
                "sort_order": 10,
                "is_active": True,
            },
            {
                "slug": "savor-flame-ring",
                "name": "Flame Ring",
                "description": "Twin flame arcs that circle your avatar.",
                "min_tier": "savor",
                "style_key": "savor-flame-ring",
                "accent_color": "#ff6b35",
                "is_animated": False,
                "sort_order": 20,
                "is_active": True,
            },
            {
                "slug": "feast-violet-halo",
                "name": "Violet Halo",
                "description": "A soft violet halo for Feast members.",
                "min_tier": "feast",
                "style_key": "feast-violet-halo",
                "accent_color": "#7b2ff7",
                "is_animated": False,
                "sort_order": 30,
                "is_active": True,
            },
            {
                "slug": "feast-signature-gradient",
                "name": "Signature Gradient",
                "description": "TasteMap's signature gradient, framed around you.",
                "min_tier": "feast",
                "style_key": "feast-signature-gradient",
                "accent_color": "#7b2ff7",
                "is_animated": False,
                "sort_order": 40,
                "is_active": True,
            },
            {
                "slug": "feast-royal",
                "name": "Royal",
                "description": "A refined double ring for the discerning diner.",
                "min_tier": "feast",
                "style_key": "feast-royal",
                "accent_color": "#7b2ff7",
                "is_animated": False,
                "sort_order": 50,
                "is_active": True,
            },
            {
                "slug": "omakase-gold-shimmer",
                "name": "Gold Shimmer",
                "description": "An animated gold shimmer reserved for Omakase.",
                "min_tier": "omakase",
                "style_key": "omakase-gold-shimmer",
                "accent_color": "#d4a017",
                "is_animated": True,
                "sort_order": 60,
                "is_active": True,
            },
            {
                "slug": "omakase-koi",
                "name": "Koi",
                "description": "Gold koi swim slowly around your avatar.",
                "min_tier": "omakase",
                "style_key": "omakase-koi",
                "accent_color": "#d4a017",
                "is_animated": True,
                "sort_order": 70,
                "is_active": True,
            },
        ],
    )


def downgrade() -> None:
    op.drop_constraint("fk_users_equipped_frame_id", "users", type_="foreignkey")
    op.drop_column("users", "equipped_frame_id")
    op.drop_column("users", "membership_tier")

    op.drop_index(op.f("ix_streak_freezes_user_id"), table_name="streak_freezes")
    op.drop_index(op.f("ix_streak_freezes_id"), table_name="streak_freezes")
    op.drop_table("streak_freezes")

    op.drop_index(op.f("ix_user_frames_user_id"), table_name="user_frames")
    op.drop_index(op.f("ix_user_frames_id"), table_name="user_frames")
    op.drop_table("user_frames")

    op.drop_index("ix_payment_transactions_user_created", table_name="payment_transactions")
    op.drop_index(op.f("ix_payment_transactions_user_id"), table_name="payment_transactions")
    op.drop_index(op.f("ix_payment_transactions_id"), table_name="payment_transactions")
    op.drop_table("payment_transactions")

    op.drop_index("uq_subscriptions_user_active", table_name="subscriptions", postgresql_where=sa.text("status = 'active'"))
    op.drop_index(op.f("ix_subscriptions_current_period_end"), table_name="subscriptions")
    op.drop_index(op.f("ix_subscriptions_status"), table_name="subscriptions")
    op.drop_index(op.f("ix_subscriptions_user_id"), table_name="subscriptions")
    op.drop_index(op.f("ix_subscriptions_id"), table_name="subscriptions")
    op.drop_table("subscriptions")

    op.drop_index(op.f("ix_payment_methods_user_id"), table_name="payment_methods")
    op.drop_index(op.f("ix_payment_methods_id"), table_name="payment_methods")
    op.drop_table("payment_methods")

    op.drop_index(op.f("ix_avatar_frames_id"), table_name="avatar_frames")
    op.drop_table("avatar_frames")
