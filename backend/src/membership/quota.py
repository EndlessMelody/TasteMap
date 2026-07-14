"""
Membership Quota Enforcement — daily per-feature caps gated by tier.

Reads the user's `membership_tier` snapshot (already kept fresh by
resolve_effective_tier on /auth/sync, /users/me, /membership/*, and checkin)
rather than recomputing tier on every gated request — hot paths must stay cheap.

Fail-open policy: any Redis error (including a dev-mode InMemoryRedis fallback
missing a method) lets the request through rather than 500ing. Quota
enforcement must never be the reason a demo breaks.
"""
import logging

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.core.dependencies import get_current_user
from src.core.exceptions import QuotaExceededException
from src.membership.entitlements import get_entitlements, local_today
from src.users.models import User

logger = logging.getLogger("tastemap.membership.quota")

# feature name (as used by callers/docs) -> key in ENTITLEMENTS per-tier dict.
# Only perks with a real enforcement point live here — super_likes/rewinds are
# entitlement-matrix-only (no corresponding action exists yet in interactions/*).
FEATURE_LIMIT_KEYS = {
    "swipes": "daily_swipes",
    "culture_calls": "culture_calls_per_day",
    "recommendation_calls": "recommendation_calls_per_day",
}


def _quota_key(feature: str, user_id: int) -> str:
    return f"quota:{feature}:{user_id}:{local_today().isoformat()}"


def _limit_for(feature: str, tier: str) -> "int | None":
    limit_key = FEATURE_LIMIT_KEYS[feature]
    return get_entitlements(tier).get(limit_key)


async def consume(request: Request, user: User, feature: str, amount: int = 1) -> None:
    """
    Core quota check — increments the caller's daily counter for `feature` by
    `amount` and raises QuotaExceededException if the tier's limit is exceeded.
    Used directly by call sites that need to count more than 1 unit per call
    (e.g. a swipe-batch consuming N units for N swiped cards).
    """
    if not settings.MEMBERSHIP_QUOTAS_ENABLED:
        return

    tier = user.membership_tier or "bite"
    limit = _limit_for(feature, tier)
    if limit is None:
        return  # unlimited on this tier

    redis = request.app.state.redis
    key = _quota_key(feature, user.id)
    try:
        if hasattr(redis, "incrby"):
            current = await redis.incrby(key, amount)
        else:
            current = await redis.incr(key)  # amount ignored — dev fallback only
        if current == amount:
            await redis.expire(key, 172800)  # 2 days — safely past the local day boundary
    except Exception as e:
        logger.warning("Quota check failed for %s (fail-open): %s", key, e)
        return

    if current > limit:
        raise QuotaExceededException(feature=feature, tier=tier, limit=limit)


def enforce_quota(feature: str):
    """Dependency factory — consumes 1 unit of `feature` for the caller on every request."""
    if feature not in FEATURE_LIMIT_KEYS:
        raise ValueError(f"Unknown quota feature: {feature}")

    async def _dependency(request: Request, user: User = Depends(get_current_user)) -> None:
        await consume(request, user, feature, amount=1)

    return _dependency


async def get_usage(request: Request, user: User, feature: str) -> "dict | None":
    """Read-only usage peek for GET /membership/quotas — does not increment."""
    tier = user.membership_tier or "bite"
    limit = _limit_for(feature, tier)
    if limit is None:
        return None

    redis = request.app.state.redis
    key = _quota_key(feature, user.id)
    try:
        raw = await redis.get(key)
    except Exception:
        raw = None
    used = int(raw) if raw else 0
    return {"limit": limit, "used": used, "remaining": max(0, limit - used)}
