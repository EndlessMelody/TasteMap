import logging

from fastapi import FastAPI
from contextlib import asynccontextmanager

import redis.asyncio as redis

logger = logging.getLogger("tastemap")
from src.core.config import settings
from src.api.router import api_router
from src.db.redis import init_redis

class MockRedisPipeline:
    """Giả lập pipeline cho Redis — ghi lại các lệnh và thực thi tuần tự."""
    def __init__(self, redis_instance):
        self.redis = redis_instance
        self.commands = []

    def zincrby(self, name, amount, value):
        self.commands.append(("zincrby", (name, amount, value)))
        return self

    def zadd(self, name, mapping):
        self.commands.append(("zadd", (name, mapping)))
        return self

    async def execute(self):
        results = []
        for cmd, args in self.commands:
            method = getattr(self.redis, cmd)
            res = await method(*args)
            results.append(res)
        return results

class InMemoryRedis:
    """Fallback khi Redis chưa bật (dev only) — giả lập get/set, TTL, và Sorted Sets (ZSET) bằng dict."""
    def __init__(self):
        self._store = {}
        self._expiry = {}
        self._zsets = {}

    def _evict_if_expired(self, key):
        import time
        exp = self._expiry.get(key)
        if exp is not None and time.monotonic() >= exp:
            self._store.pop(key, None)
            self._expiry.pop(key, None)

    async def get(self, key):
        self._evict_if_expired(key)
        return self._store.get(key)

    async def set(self, key, value, nx: bool = False, ex: int | None = None):
        self._evict_if_expired(key)
        if nx and key in self._store:
            return None
        self._store[key] = value
        if ex is not None:
            import time
            self._expiry[key] = time.monotonic() + ex
        else:
            self._expiry.pop(key, None)
        return True

    async def setex(self, key, seconds, value):
        import time
        self._store[key] = value
        self._expiry[key] = time.monotonic() + seconds

    async def incr(self, key):
        self._evict_if_expired(key)
        value = int(self._store.get(key, 0)) + 1
        self._store[key] = str(value)
        return value

    async def incrby(self, key, amount):
        self._evict_if_expired(key)
        value = int(self._store.get(key, 0)) + int(amount)
        self._store[key] = str(value)
        return value

    async def expire(self, key, seconds):
        import time
        if key in self._store:
            self._expiry[key] = time.monotonic() + seconds
        return True

    async def delete(self, *keys):
        count = 0
        for k in keys:
            self._expiry.pop(k, None)
            if k in self._store:
                del self._store[k]
                count += 1
        return count

    async def exists(self, key):
        self._evict_if_expired(key)
        return 1 if key in self._store else 0

    async def scan(self, cursor=0, match="*", count=100):
        import fnmatch
        for k in list(self._store.keys()):
            self._evict_if_expired(k)
        keys = [k for k in self._store.keys() if fnmatch.fnmatch(k, match)]
        return 0, keys

    async def zincrby(self, name: str, amount: float, value: str) -> float:
        if name not in self._zsets:
            self._zsets[name] = {}
        curr_score = self._zsets[name].get(str(value), 0.0)
        new_score = float(curr_score) + float(amount)
        self._zsets[name][str(value)] = new_score
        return new_score

    async def zadd(self, name: str, mapping: dict):
        if name not in self._zsets:
            self._zsets[name] = {}
        for val, score in mapping.items():
            self._zsets[name][str(val)] = float(score)

    async def zscore(self, name: str, value: str) -> float:
        return self._zsets.get(name, {}).get(str(value))

    async def zrevrange(self, name: str, start: int, end: int, withscores: bool = False):
        zset = self._zsets.get(name, {})
        # Sắp xếp theo score giảm dần, sau đó theo value tăng dần để ổn định
        sorted_items = sorted(zset.items(), key=lambda x: (-x[1], x[0]))
        
        # Redis slicing: [start, end] inclusive. Nếu end = -1 thì lấy đến hết.
        if end == -1:
            sliced = sorted_items[start:]
        else:
            sliced = sorted_items[start:end + 1]
        
        if withscores:
            return sliced
        return [item[0] for item in sliced]

    async def zrevrank(self, name: str, value: str):
        zset = self._zsets.get(name, {})
        sorted_items = sorted(zset.items(), key=lambda x: (-x[1], x[0]))
        for i, (val, _) in enumerate(sorted_items):
            if val == str(value):
                return i
        return None

    def pipeline(self):
        return MockRedisPipeline(self)

    async def close(self):
        pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Thử kết nối Redis, nếu không được thì dùng InMemoryRedis (chỉ ở dev).
    # Ở production, Redis là bắt buộc (OTP TTL, rate limiting, cache) — nếu
    # không kết nối được, ứng dụng phải dừng khởi động thay vì chạy sai lệch âm thầm.
    try:
        r = redis.from_url(settings.REDIS_URL, decode_responses=True)
        await r.ping()
        app.state.redis = r
        print("[OK] Redis connected successfully!")
    except Exception as exc:
        if settings.is_production:
            raise RuntimeError(
                f"Redis unreachable at startup (REDIS_URL) -- refusing to start in production: {exc}"
            ) from exc
        app.state.redis = InMemoryRedis()
        print("[WARN] Redis unavailable -- using InMemoryRedis fallback (dev only).")

    # Khởi động cronjob dọn dẹp interaction (3:00 AM hàng ngày)
    from src.tasks.interaction_cleanup import schedule_cleanup
    schedule_cleanup(app)

    # Khởi động cronjob gia hạn subscription (3:30 AM hàng ngày)
    from src.tasks.subscription_renewal import schedule_subscription_renewal
    schedule_subscription_renewal(app)
    
    # Initialize redis client for global access
    init_redis(app)

    yield
    await app.state.redis.close()


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=None if settings.is_production else f"{settings.API_V1_STR}/openapi.json",
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    description="API hành vi dựa trên vector cho hệ thống backend.",
    version="1.0.0",
    lifespan=lifespan
)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

ALLOWED_ORIGINS = settings.allowed_origins_list

import re as _re
_ALLOWED_ORIGIN_PATTERN = _re.compile(settings.ALLOWED_ORIGIN_REGEX) if settings.ALLOWED_ORIGIN_REGEX else None


def _is_origin_allowed(origin: str) -> bool:
    if not origin:
        return False
    if _is_origin_allowed(origin):
        return True
    return bool(_ALLOWED_ORIGIN_PATTERN and _ALLOWED_ORIGIN_PATTERN.fullmatch(origin))

from src.core.audit import AuditLoggingMiddleware
from src.core.exceptions import TasteMapException
from src.core.rate_limit import limiter

app.state.limiter = limiter

from slowapi.middleware import SlowAPIMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1024)
app.add_middleware(AuditLoggingMiddleware)
app.add_middleware(SlowAPIMiddleware)
# CORS must be the outermost of these so preflight OPTIONS requests short-circuit
# here rather than being consumed by the rate limiter or reaching the route.
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=settings.ALLOWED_ORIGIN_REGEX or None,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    expose_headers=["X-Request-ID"],
)


@app.middleware("http")
async def security_headers_middleware(request, call_next):
    """Add baseline security headers to every response."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


app.include_router(api_router, prefix=settings.API_V1_STR)

# ── Centralized Exception Handlers ──────────────────────────────────────────
from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded


@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Standardized 429 response, consistent with other centralized handlers."""
    trace_id = getattr(request.state, "trace_id", "unknown")
    origin = request.headers.get("origin", "")
    headers = {"X-Request-ID": trace_id, "Retry-After": str(getattr(exc, "retry_after", 60))}
    if _is_origin_allowed(origin):
        headers["access-control-allow-origin"] = origin
        headers["access-control-allow-credentials"] = "true"
    return JSONResponse(
        status_code=429,
        content={
            "success": False,
            "error": "Too many requests. Please try again later.",
            "error_code": "RATE_LIMITED",
            "trace_id": trace_id,
        },
        headers=headers,
    )


@app.exception_handler(TasteMapException)
async def tastemap_exception_handler(request: Request, exc: TasteMapException):
    """Custom exception handler returning standardized JSON response with trace ID."""
    trace_id = getattr(request.state, "trace_id", "unknown")
    logger.warning("TasteMapException: [%s] %s on %s %s (TraceID=%s)", exc.error_code, exc.detail, request.method, request.url.path, trace_id)
    
    origin = request.headers.get("origin", "")
    headers = dict(exc.headers or {})
    if _is_origin_allowed(origin):
        headers["access-control-allow-origin"] = origin
        headers["access-control-allow-credentials"] = "true"
    headers["X-Request-ID"] = trace_id
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "error_code": exc.error_code,
            "trace_id": trace_id
        },
        headers=headers
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Ensure CORS headers and trace IDs are present even on unhandled 500 errors."""
    trace_id = getattr(request.state, "trace_id", "unknown")
    logger.exception("Unhandled error on %s %s (TraceID=%s)", request.method, request.url.path, trace_id)
    origin = request.headers.get("origin", "")
    headers = {"X-Request-ID": trace_id}
    if _is_origin_allowed(origin):
        headers["access-control-allow-origin"] = origin
        headers["access-control-allow-credentials"] = "true"
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error", "error_code": "INTERNAL_ERROR", "trace_id": trace_id},
        headers=headers,
    )

# Serve uploaded media files at /static/uploads/
import os
from fastapi.staticfiles import StaticFiles
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/health")
@limiter.exempt
async def health_check(request: Request):
    return {"status": "ok"}


@app.get("/health/ready")
@limiter.exempt
async def readiness_check(request: Request):
    """Deep readiness probe used by Render — verifies DB and Redis are reachable."""
    from sqlalchemy import text
    from src.db.database import engine

    checks: dict[str, str] = {}

    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as exc:
        checks["database"] = f"error: {exc}"

    try:
        ping = getattr(request.app.state.redis, "ping", None)
        if ping is not None:
            await ping()
        checks["redis"] = "ok"
    except Exception as exc:
        checks["redis"] = f"error: {exc}"

    is_ready = all(v == "ok" for v in checks.values())
    return JSONResponse(
        status_code=200 if is_ready else 503,
        content={"status": "ready" if is_ready else "not_ready", "checks": checks},
    )
