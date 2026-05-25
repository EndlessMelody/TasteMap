import asyncio
import math
import os
import sys

# Add project root to sys.path to allow imports from 'src'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.db.database import AsyncSessionLocal, engine, Base
from src.challenges.models import LevelConfig
from sqlalchemy import select, delete

async def seed_levels():
    print("Seeding Level Configurations...")
    
    # Ensure tables are created
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as db:
        # Clear existing configs
        await db.execute(delete(LevelConfig))
        
        levels = []
        titles = [
            (1, "Taste Newbie"),
            (5, "Spice Scout"),
            (10, "Flavor Finder"),
            (20, "Gourmet Voyager"),
            (30, "Culinary Explorer"),
            (40, "Elite Foodie"),
            (50, "Gastronomy Master"),
            (60, "Texture Architect"),
            (70, "Taste Legend"),
            (85, "Cuisine Oracle"),
            (100, "God of Taste"),
            (200, "Flavor Dimension Walker"),
            (300, "Mythical Chef"),
            (400, "Taste Sovereign"),
            (500, "Grandmaster of Gastronomy"),
            (700, "Eater of Worlds"),
            (900, "Culinary Ascendant"),
            (1000, "The Absolute Palate")
        ]
        
        def get_title(lvl):
            current_title = "Taste Newbie"
            for threshold, title in titles:
                if lvl >= threshold:
                    current_title = title
                else:
                    break
            return current_title

        for lvl in range(1, 1001):
            # Target ~15,000 XP at Level 70
            # Formula: 100 + (level-1) * 215
            xp_req = 100 + (lvl - 1) * 215
            
            # Add some slight exponential curve for higher levels
            if lvl > 70:
                xp_req += (lvl - 70) ** 2 * 10
                
            levels.append(LevelConfig(
                level=lvl,
                xp_required=int(xp_req),
                title=get_title(lvl)
            ))
        
        db.add_all(levels)
        await db.commit()
        print(f"Seeded {len(levels)} levels.")

if __name__ == "__main__":
    asyncio.run(seed_levels())
