import asyncio
import json
import os
import sys

# Add project root to sys.path to allow imports from 'src'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.db.database import AsyncSessionLocal, engine, Base
from src.gamification.models import Badge
from sqlalchemy import select

async def seed_badges():
    print("Seeding Badges from badges.json...")
    
    # Ensure tables are created
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    json_path = os.path.join(os.path.dirname(__file__), "badges.json")
    
    if not os.path.exists(json_path):
        print(f"File not found: {json_path}")
        print("Please create badges.json with your badge list.")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        badges_data = json.load(f)

    async with AsyncSessionLocal() as db:
        seeded_count = 0
        for item in badges_data:
            # Check if badge already exists to avoid duplicates
            result = await db.execute(select(Badge).where(Badge.name == item["name"]))
            existing_badge = result.scalar_one_or_none()
            
            if not existing_badge:
                badge = Badge(
                    name=item["name"],
                    description=item.get("description"),
                    icon_name=item["icon_name"],
                    rarity=item.get("rarity", "Common"),
                    accent_color=item.get("accent_color", "#007AFF"),
                    is_hidden=item.get("is_hidden", False)
                )
                db.add(badge)
                seeded_count += 1
            else:
                # Optionally update existing badge details here
                existing_badge.description = item.get("description", existing_badge.description)
                existing_badge.icon_name = item.get("icon_name", existing_badge.icon_name)
                existing_badge.rarity = item.get("rarity", existing_badge.rarity)
                existing_badge.accent_color = item.get("accent_color", existing_badge.accent_color)
                existing_badge.is_hidden = item.get("is_hidden", existing_badge.is_hidden)
                print(f"Updated existing badge: {item['name']}")

        await db.commit()
        print(f"Added {seeded_count} new badges. Total processed: {len(badges_data)}")

if __name__ == "__main__":
    asyncio.run(seed_badges())
