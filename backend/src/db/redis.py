"""
Redis client accessor.
Uses app.state.redis which is set during lifespan.
"""
from fastapi import Request
from typing import Any, Optional


class RedisClient:
    """Proxy class to access app.state.redis from anywhere."""
    
    _app_state = None
    
    @classmethod
    def set_app(cls, app):
        cls._app_state = app.state
    
    @classmethod
    def get_client(cls):
        if cls._app_state is None:
            raise RuntimeError("Redis client not initialized. Call set_app() first.")
        return cls._app_state.redis
    
    @classmethod
    async def get(cls, key: str) -> Optional[str]:
        client = cls.get_client()
        return await client.get(key)
    
    @classmethod
    async def set(cls, key: str, value: str, ex: Optional[int] = None) -> None:
        client = cls.get_client()
        if ex:
            await client.setex(key, ex, value)
        else:
            await client.set(key, value)
    
    @classmethod
    async def setex(cls, key: str, seconds: int, value: str) -> None:
        client = cls.get_client()
        await client.setex(key, seconds, value)
    
    @classmethod
    async def delete(cls, *keys: str) -> int:
        client = cls.get_client()
        return await client.delete(*keys)
    
    @classmethod
    async def exists(cls, key: str) -> int:
        client = cls.get_client()
        return await client.exists(key)
    
    @classmethod
    async def incr(cls, key: str) -> int:
        client = cls.get_client()
        return await client.incr(key)
    
    @classmethod
    async def expire(cls, key: str, seconds: int) -> bool:
        client = cls.get_client()
        return await client.expire(key, seconds)


# Convenience instance
redis_client = RedisClient()


def init_redis(app):
    """Initialize redis client with app state."""
    RedisClient.set_app(app)
