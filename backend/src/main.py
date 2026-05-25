from fastapi import FastAPI
from contextlib import asynccontextmanager

import redis.asyncio as redis
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
    """Fallback khi Redis chưa bật — giả lập get/set và Sorted Sets (ZSET) bằng dict."""
    def __init__(self):
        self._store = {}
        self._zsets = {}

    async def get(self, key):
        return self._store.get(key)

    async def set(self, key, value):
        self._store[key] = value

    async def scan(self, cursor=0, match="*", count=100):
        import fnmatch
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
    # Thử kết nối Redis, nếu không được thì dùng InMemoryRedis
    try:
        r = redis.from_url(settings.REDIS_URL, decode_responses=True)
        await r.ping()
        app.state.redis = r
        print("[OK] Redis connected successfully!")
    except Exception:
        app.state.redis = InMemoryRedis()
        print("[WARN] Redis unavailable -- using InMemoryRedis fallback.")

    # Khởi động cronjob dọn dẹp interaction (3:00 AM hàng ngày)
    from src.tasks.interaction_cleanup import schedule_cleanup
    schedule_cleanup(app)
    
    # Initialize redis client for global access
    init_redis(app)

    yield
    await app.state.redis.close()


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="API hành vi dựa trên vector cho hệ thống backend.",
    version="1.0.0",
    lifespan=lifespan
)

from fastapi.middleware.cors import CORSMiddleware

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://tastemap-fork-v1.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

# ── Catch-all exception handler that preserves CORS headers ──────────────
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Ensure CORS headers are present even on unhandled 500 errors."""
    origin = request.headers.get("origin", "")
    headers = {}
    if origin in ALLOWED_ORIGINS:
        headers["access-control-allow-origin"] = origin
        headers["access-control-allow-credentials"] = "true"
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error", "detail": str(exc)},
        headers=headers,
    )

# Serve uploaded media files at /static/uploads/
import os
from fastapi.staticfiles import StaticFiles
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
