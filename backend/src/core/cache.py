import json
import hashlib
from functools import wraps
from typing import Any, Callable
from fastapi import Request
from src.db.redis import redis_client

def cached_response(ttl: int = 60):
    """
    Decorator to cache FastAPI endpoint responses in Redis.
    Uses the request path and query params to generate a cache key.
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Attempt to find the Request object in kwargs
            request: Request = kwargs.get("request")
            
            # If request isn't explicitly passed, try to find it in args
            if not request:
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break

            # If no request is found, we cannot cache properly by path/query, so just run the function
            if not request:
                return await func(*args, **kwargs)

            # Generate cache key based on path and sorted query params
            cache_key = f"cache:{request.url.path}"
            if request.query_params:
                # Sort query params so different order yields the same key
                sorted_params = sorted(request.query_params.items())
                query_string = "&".join([f"{k}={v}" for k, v in sorted_params])
                key_hash = hashlib.md5(query_string.encode()).hexdigest()
                cache_key = f"{cache_key}:{key_hash}"

            # Try to fetch from Redis
            try:
                cached_data = await redis_client.get(cache_key)
                if cached_data:
                    return json.loads(cached_data)
            except Exception as e:
                print(f"[CACHE ERROR] Failed to get cache for {cache_key}: {e}")

            # If not cached, execute the route handler
            response = await func(*args, **kwargs)

            # Try to store in Redis
            try:
                # Ensure the response is JSON serializable
                if isinstance(response, dict) or isinstance(response, list):
                    await redis_client.setex(cache_key, ttl, json.dumps(response))
            except Exception as e:
                print(f"[CACHE ERROR] Failed to set cache for {cache_key}: {e}")

            return response
        return wrapper
    return decorator
