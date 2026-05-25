"""
Debug script: Chạy trực tiếp hàm process_swipe_batch để bắt traceback chính xác.
"""
import asyncio
import json
import traceback
import os
from dotenv import load_dotenv

load_dotenv()

async def main():
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
    from sqlalchemy.orm import sessionmaker
    import redis.asyncio as aioredis
    from src.core.config import settings

    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)

    async with async_session() as db:
        try:
            from src.interactions.service import process_swipe_batch
            result = await process_swipe_batch(
                db=db,
                redis=redis_client,
                user_id=16,
                domain="place",
                actions=[
                    {"place_id": 1, "direction": "RIGHT", "client_timestamp": 1774152962755.0},
                    {"place_id": 2, "direction": "LEFT", "client_timestamp": 1774152964755.0},
                ]
            )
            print("SUCCESS:", json.dumps(result, indent=2, ensure_ascii=False))
        except Exception as e:
            print("=" * 60)
            print(f"CAUGHT ERROR: {type(e).__name__}: {e}")
            print("=" * 60)
            traceback.print_exc()
        finally:
            await redis_client.aclose()
            await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
