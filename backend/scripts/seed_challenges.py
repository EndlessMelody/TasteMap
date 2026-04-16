import asyncio
import os
import sys

# Add project root to sys.path to allow imports from 'src'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.future import select
from src.db.database import AsyncSessionLocal, engine
from src.challenges.models import Challenge

CHALLENGES_SEED_DATA = [
    {
        "title": "Cuisine Explorer",
        "description": "Try 5 different cuisine types this week.",
        "category": "cuisine",
        "difficulty": "medium",
        "xp_reward": 250,
        "target_count": 5,
        "action_type": "cuisine_variety",
        "action_filter": {"distinct_field": "cuisine_type"},
        "icon": "utensils",
        "accent_color": "#FF9500",
        "is_recurring": True,
        "duration_days": 7
    },
    {
        "title": "Night Owl",
        "description": "Visit 3 locations after 9 PM.",
        "category": "discovery",
        "difficulty": "easy",
        "xp_reward": 180,
        "target_count": 3,
        "action_type": "location_visit_night",
        "action_filter": {"time_after": "21:00"},
        "icon": "moon",
        "accent_color": "#5856D6",
        "is_recurring": False
    },
    {
        "title": "Social Foodie",
        "description": "Complete 2 group dining adventures.",
        "category": "social",
        "difficulty": "medium",
        "xp_reward": 320,
        "target_count": 2,
        "action_type": "group_complete",
        "icon": "users",
        "accent_color": "#AF52DE",
        "is_recurring": False
    },
    {
        "title": "Photo Master",
        "description": "Post 10 high-quality food photos.",
        "category": "review",
        "difficulty": "hard",
        "xp_reward": 400,
        "target_count": 10,
        "action_type": "post_with_photo",
        "action_filter": {"require_photo": True},
        "icon": "camera",
        "accent_color": "#34C759",
        "is_recurring": False
    },
    {
        "title": "Spice Seeker",
        "description": "Review 5 dishes with 'Spicy' tag.",
        "category": "cuisine",
        "difficulty": "easy",
        "xp_reward": 200,
        "target_count": 5,
        "action_type": "review_spicy",
        "action_filter": {"tags": ["Spicy"]},
        "icon": "flame",
        "accent_color": "#FF3B30",
        "is_recurring": False
    },
    {
        "title": "Coffee Connoisseur",
        "description": "Visit 8 specialty coffee shops.",
        "category": "discovery",
        "difficulty": "medium",
        "xp_reward": 300,
        "target_count": 8,
        "action_type": "location_visit_cuisine",
        "action_filter": {"cuisine_type": "Cafe"},
        "icon": "coffee",
        "accent_color": "#A2845E",
        "is_recurring": False
    },
    {
        "title": "Street Food Sprint",
        "description": "Visit 12 local street food spots.",
        "category": "discovery",
        "difficulty": "hard",
        "xp_reward": 350,
        "target_count": 12,
        "action_type": "location_visit",
        "action_filter": {"location_vibe": "local"},
        "icon": "map-pin",
        "accent_color": "#FFCC00",
        "is_recurring": False
    },
    {
        "title": "Fan Favorite",
        "description": "Receive a total of 20 likes on your reviews.",
        "category": "social",
        "difficulty": "medium",
        "xp_reward": 280,
        "target_count": 20,
        "action_type": "receive_likes",
        "icon": "heart",
        "accent_color": "#FF2D55",
        "is_recurring": True,
        "duration_days": 30
    }
]

async def seed_challenges():
    """Seed initial challenge templates if they don't exist."""
    async with AsyncSessionLocal() as session:
        for data in CHALLENGES_SEED_DATA:
            # Check if exists by title
            stmt = select(Challenge).where(Challenge.title == data["title"])
            res = await session.execute(stmt)
            if res.scalar_one_or_none():
                print(f"Skipping '{data['title']}' (already exists)")
                continue
            
            challenge = Challenge(**data)
            session.add(challenge)
            print(f"Adding challenge: {data['title']}")
        
        await session.commit()
    print("Challenges seeding completed.")

if __name__ == "__main__":
    asyncio.run(seed_challenges())
