import asyncio
import os
import sys
from sqlalchemy import select, func

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.db.database import AsyncSessionLocal, engine
from src.challenges.models import LevelConfig
from src.core.config import settings

async def check_db():
    print(f"Connecting to: {settings.DATABASE_URL.split('@')[-1]}")
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(func.count(LevelConfig.level)))
        count = result.scalar()
        print(f"Current rows in level_configs: {count}")
        
        # Pull level 1 config
        result = await db.execute(select(LevelConfig).where(LevelConfig.level == 1))
        lvl1 = result.scalar_one_or_none()
        if lvl1:
            print(f"Level 1: {lvl1.title}, XP Required: {lvl1.xp_required}")
        else:
            print("Level 1 not found!")

if __name__ == "__main__":
    asyncio.run(check_db())
