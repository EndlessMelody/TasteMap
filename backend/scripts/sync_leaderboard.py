import asyncio
import os
import sys
from datetime import datetime
from sqlalchemy import select

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.db.database import AsyncSessionLocal
from src.users.models import User
from src.db.redis import RedisClient

async def sync_leaderboard():
    print("--- Syncing Leaderboard from DB to Redis ---")
    
    # Manual Redis initialization for standalone script
    import redis.asyncio as aioredis
    from src.core.config import settings
    
    redis_instance = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    
    # Mock a fake app state for RedisClient
    class FakeState:
        def __init__(self, r): self.redis = r
    class FakeApp:
        def __init__(self, r): self.state = FakeState(r)
        
    RedisClient.set_app(FakeApp(redis_instance))

    async with AsyncSessionLocal() as db:
        # 1. Fetch all users with XP
        result = await db.execute(select(User).where(User.total_xp_earned > 0))
        users = result.scalars().all()
        
        if not users:
            print("No users with XP found to sync.")
            return

        redis = RedisClient.get_client()
        now = datetime.utcnow()
        
        # Keys
        month_key = f"leaderboard:monthly:{now.strftime('%Y-%m')}"
        week_key = f"leaderboard:weekly:{now.strftime('%Y-W%U')}"
        alltime_key = "leaderboard:alltime"
        
        # We'll clear the current all-time to be safe, 
        # but monthly/weekly are harder to 'sync' perfectly from total_xp 
        # without transaction logs. We'll just reset them to match total_xp for now 
        # as a baseline.
        
        pipe = redis.pipeline()
        pipe.delete(alltime_key)
        pipe.delete(month_key)
        pipe.delete(week_key)
        
        for u in users:
            user_id_str = str(u.id)
            score = float(u.total_xp_earned)
            
            pipe.zadd(alltime_key, {user_id_str: score})
            pipe.zadd(month_key, {user_id_str: score})
            pipe.zadd(week_key, {user_id_str: score})
            
        await pipe.execute()
        print(f"Successfully synced {len(users)} users to Redis Leaderboard.")

if __name__ == "__main__":
    asyncio.run(sync_leaderboard())
