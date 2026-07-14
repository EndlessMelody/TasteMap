"""
Global rate limiter (slowapi).

Storage: Redis in production (enforced cluster-wide across workers),
in-memory in development (per-process, avoids requiring Redis locally).
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

from src.core.config import settings

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["300/minute"],
    storage_uri=settings.REDIS_URL if settings.is_production else "memory://",
    enabled=settings.RATE_LIMIT_ENABLED,
)
