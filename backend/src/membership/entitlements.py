"""
Membership Entitlements — single source of truth for the 4-tier perk matrix,
and resolve_effective_tier() which computes a user's tier from
(active subscription × login streak) and writes back the denormalized snapshot.

Tier is NEVER stored authoritatively — see docs/database_schema/monetization.md
("Tier Resolution"). This module imports MODELS ONLY (never service-level code)
so that src/challenges/streak_service.py can import it without a circular import.
"""
from datetime import datetime, timezone, timedelta, date
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.users.models import User
from src.challenges.models import UserStreak
from src.membership.models import Subscription, AvatarFrame, UserFrame

TIER_ORDER = ["bite", "savor", "feast", "omakase"]
SAVOR_STREAK_DAYS = 7
OMAKASE_STREAK_DAYS = 14

# None = unlimited
ENTITLEMENTS = {
    "bite": {
        "daily_swipes": 50,
        "super_likes_per_day": 1,
        "rewinds_per_day": 0,
        "culture_calls_per_day": 5,
        "recommendation_calls_per_day": 10,
        "tour_stops_max": 5,
        "saved_tours_max": 5,
        "vault_bookmarks_max": 100,
        "xp_boost_pct": 0,
        "streak_freezes_per_month": 0,
        "advanced_analytics": False,
    },
    "savor": {
        "daily_swipes": 100,
        "super_likes_per_day": 3,
        "rewinds_per_day": 3,
        "culture_calls_per_day": 10,
        "recommendation_calls_per_day": 20,
        "tour_stops_max": 7,
        "saved_tours_max": 15,
        "vault_bookmarks_max": 300,
        "xp_boost_pct": 10,
        "streak_freezes_per_month": 1,
        "advanced_analytics": False,
    },
    "feast": {
        "daily_swipes": None,
        "super_likes_per_day": 10,
        "rewinds_per_day": None,
        "culture_calls_per_day": None,
        "recommendation_calls_per_day": None,
        "tour_stops_max": 12,
        "saved_tours_max": None,
        "vault_bookmarks_max": None,
        "xp_boost_pct": 25,
        "streak_freezes_per_month": 2,
        "advanced_analytics": True,
    },
    "omakase": {
        "daily_swipes": None,
        "super_likes_per_day": 15,
        "rewinds_per_day": None,
        "culture_calls_per_day": None,
        "recommendation_calls_per_day": None,
        "tour_stops_max": 15,
        "saved_tours_max": None,
        "vault_bookmarks_max": None,
        "xp_boost_pct": 50,
        "streak_freezes_per_month": 3,
        "advanced_analytics": True,
    },
}


def get_entitlements(tier: str) -> dict:
    return ENTITLEMENTS.get(tier, ENTITLEMENTS["bite"])


def tier_rank(tier: str) -> int:
    try:
        return TIER_ORDER.index(tier)
    except ValueError:
        return 0


def local_today(timezone_offset: int = 7) -> date:
    return (datetime.now(timezone.utc) + timedelta(hours=timezone_offset)).date()


async def _get_active_subscription(db: AsyncSession, user_id: int) -> Optional[Subscription]:
    res = await db.execute(
        select(Subscription).where(Subscription.user_id == user_id, Subscription.status == "active")
    )
    return res.scalar_one_or_none()


def _expire_if_due(sub: Optional[Subscription]) -> Optional[Subscription]:
    """Lazy expiry — if the active subscription's period has already passed, mark it expired now."""
    if sub is None:
        return None
    now = datetime.now(timezone.utc)
    period_end = sub.current_period_end
    if period_end.tzinfo is None:
        period_end = period_end.replace(tzinfo=timezone.utc)
    if period_end < now:
        sub.status = "expired"
        return None
    return sub


async def _get_streak(db: AsyncSession, user_id: int) -> Optional[UserStreak]:
    res = await db.execute(select(UserStreak).where(UserStreak.user_id == user_id))
    return res.scalar_one_or_none()


def streak_is_alive(streak: Optional[UserStreak]) -> bool:
    if streak is None or streak.current_streak <= 0:
        return False
    today = local_today(streak.timezone_offset)
    yesterday = today - timedelta(days=1)
    last_date = streak.last_active_date.date()
    return last_date >= yesterday


async def _grant_frames_for_tier(db: AsyncSession, user_id: int, tier: str) -> None:
    """Idempotently grant every frame whose min_tier is at or below the reached tier."""
    eligible_tiers = TIER_ORDER[: tier_rank(tier) + 1]
    res = await db.execute(select(AvatarFrame.id).where(AvatarFrame.min_tier.in_(eligible_tiers)))
    frame_ids = [row[0] for row in res.all()]
    if not frame_ids:
        return
    owned_res = await db.execute(select(UserFrame.frame_id).where(UserFrame.user_id == user_id))
    owned_ids = {row[0] for row in owned_res.all()}
    for frame_id in frame_ids:
        if frame_id not in owned_ids:
            db.add(UserFrame(user_id=user_id, frame_id=frame_id))


async def resolve_effective_tier(db: AsyncSession, user: User) -> dict:
    """
    Compute the user's effective tier from (active subscription x login streak),
    lazily expire a stale subscription, snapshot the result on users.membership_tier,
    grant newly-eligible frames, and auto-unequip a frame the user no longer qualifies for.

    Mutates `user` and stages new rows via db.add() — caller is responsible for commit().
    Returns {tier, subscription, streak, streak_alive}.
    """
    subscription = await _get_active_subscription(db, user.id)
    subscription = _expire_if_due(subscription)
    is_paid = subscription is not None

    streak = await _get_streak(db, user.id)
    streak_alive = streak_is_alive(streak)
    current_streak = streak.current_streak if streak and streak_alive else 0

    if is_paid and current_streak >= OMAKASE_STREAK_DAYS:
        tier = "omakase"
    elif is_paid:
        tier = "feast"
    elif current_streak >= SAVOR_STREAK_DAYS:
        tier = "savor"
    else:
        tier = "bite"

    if user.membership_tier != tier:
        user.membership_tier = tier
        await _grant_frames_for_tier(db, user.id, tier)

        if user.equipped_frame_id is not None:
            frame_res = await db.execute(
                select(AvatarFrame.min_tier).where(AvatarFrame.id == user.equipped_frame_id)
            )
            equipped_min_tier = frame_res.scalar_one_or_none()
            if equipped_min_tier is not None and tier_rank(equipped_min_tier) > tier_rank(tier):
                user.equipped_frame_id = None

    return {
        "tier": tier,
        "subscription": subscription,
        "streak": streak,
        "streak_alive": streak_alive,
    }
