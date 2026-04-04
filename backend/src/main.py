from fastapi import FastAPI
from contextlib import asynccontextmanager

import redis.asyncio as redis
from src.core.config import settings
from src.api.router import api_router

class InMemoryRedis:
    """Fallback khi Redis chưa bật — giả lập get/set bằng dict trong RAM."""
    def __init__(self):
        self._store = {}
    async def get(self, key):
        return self._store.get(key)
    async def set(self, key, value):
        self._store[key] = value
    async def scan(self, cursor=0, match="*", count=100):
        import fnmatch
        keys = [k for k in self._store.keys() if fnmatch.fnmatch(k, match)]
        return 0, keys
    async def close(self):
        pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Thử kết nối Redis, nếu không được thì dùng InMemoryRedis
    try:
        r = redis.from_url(settings.REDIS_URL, decode_responses=True)
        await r.ping()
        app.state.redis = r
        print("✅ Đã kết nối Redis thành công!")
    except Exception:
        app.state.redis = InMemoryRedis()
        print("⚠️  Redis không khả dụng — dùng bộ nhớ tạm (InMemoryRedis) để test.")

    # Khởi động cronjob dọn dẹp interaction (3:00 AM hàng ngày)
    from src.tasks.interaction_cleanup import schedule_cleanup
    schedule_cleanup(app)

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

# Serve uploaded media files at /static/uploads/
import os
from fastapi.staticfiles import StaticFiles
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
