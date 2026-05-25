"""
Seed demo rows for the locations table.

Usage from backend/:
    .\.venv\Scripts\python.exe scripts\seed_demo_locations.py

Requires backend/.env to contain a real DATABASE_URL.
"""

import asyncio
import os
import sys
from typing import Any

from dotenv import load_dotenv
from sqlalchemy.exc import ProgrammingError
from sqlalchemy import select

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
load_dotenv()

from src.db.database import AsyncSessionLocal, engine  # noqa: E402
from src.locations.models import Location  # noqa: E402


DEMO_LOCATIONS: list[dict[str, Any]] = [
    {
        "name": "Com Tam Ba Ghien",
        "lat": 10.7965,
        "lng": 106.6721,
        "address": "84 Dang Van Ngu, Phu Nhuan, Ho Chi Minh City",
        "city": "Ho Chi Minh",
        "category": "food",
        "image_url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
        "price_range": "50k-100k",
        "open_hours": "07:00-21:00",
        "rating": 4.6,
        "base_score": 0.85,
        "characteristics": {
            "cuisine": "Vietnamese",
            "vibe": "local",
            "best_for": ["quick_bite", "lunch", "solo"],
        },
        "vector": [0.3, 0.2, 0.8, 0.9, 0.1, 0.3, 0.8, 0.2, 0.5, 0.4, 0.9, 0.2, 0.5, 0.4, 0.9],
    },
    {
        "name": "Pizza 4P's Le Thanh Ton",
        "lat": 10.7788,
        "lng": 106.7042,
        "address": "8 Thu Khoa Huan, District 1, Ho Chi Minh City",
        "city": "Ho Chi Minh",
        "category": "food",
        "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591",
        "price_range": "200k-400k",
        "open_hours": "10:00-22:30",
        "rating": 4.7,
        "base_score": 0.9,
        "characteristics": {
            "cuisine": "Italian",
            "vibe": "modern",
            "best_for": ["date", "group", "dinner"],
        },
        "vector": [0.2, 0.5, 0.6, 0.2, 0.8, 0.6, 0.7, 0.8, 0.7, 0.4, 0.4, 0.3, 0.9, 0.5, 0.7],
    },
    {
        "name": "The Workshop Coffee",
        "lat": 10.7755,
        "lng": 106.7048,
        "address": "27 Ngo Duc Ke, District 1, Ho Chi Minh City",
        "city": "Ho Chi Minh",
        "category": "food",
        "image_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
        "price_range": "80k-160k",
        "open_hours": "08:00-21:00",
        "rating": 4.5,
        "base_score": 0.78,
        "characteristics": {
            "cuisine": "coffee",
            "vibe": "work-friendly",
            "best_for": ["coffee", "study", "meeting"],
        },
        "vector": [0.1, 0.5, 0.3, 0.2, 0.6, 0.9, 0.4, 0.5, 0.6, 0.3, 0.5, 0.5, 0.8, 0.2, 0.6],
    },
    {
        "name": "Ben Thanh Market",
        "lat": 10.7725,
        "lng": 106.6980,
        "address": "Le Loi, District 1, Ho Chi Minh City",
        "city": "Ho Chi Minh",
        "category": "place",
        "image_url": "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b",
        "price_range": "Free",
        "open_hours": "06:00-19:00",
        "rating": 4.3,
        "base_score": 0.76,
        "characteristics": {
            "type": "market",
            "vibe": "busy",
            "best_for": ["local_food", "shopping", "tourist"],
        },
        "vector": [0.5, 0.4, 0.7, 0.9, 0.2, 0.4, 0.9, 0.2, 0.7, 0.5, 0.6, 0.3, 0.7, 0.6, 0.8],
    },
    {
        "name": "Saigon Central Post Office",
        "lat": 10.7798,
        "lng": 106.6990,
        "address": "2 Cong Xa Paris, District 1, Ho Chi Minh City",
        "city": "Ho Chi Minh",
        "category": "place",
        "image_url": "https://images.unsplash.com/photo-1583417319070-4a69db38a482",
        "price_range": "Free",
        "open_hours": "07:00-19:00",
        "rating": 4.5,
        "base_score": 0.82,
        "characteristics": {
            "type": "landmark",
            "vibe": "historic",
            "best_for": ["photo", "architecture", "tourist"],
        },
        "vector": [0.1, 0.2, 0.3, 0.1, 0.4, 0.6, 0.6, 0.7, 0.8, 0.2, 0.3, 0.4, 0.9, 0.2, 0.8],
    },
    {
        "name": "Banh Khot Goc Vu Sua",
        "lat": 10.3483,
        "lng": 107.0845,
        "address": "14 Nguyen Truong To, Vung Tau",
        "city": "Vung Tau",
        "category": "food",
        "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
        "price_range": "60k-150k",
        "open_hours": "07:00-21:00",
        "rating": 4.4,
        "base_score": 0.8,
        "characteristics": {
            "cuisine": "Vietnamese seafood",
            "vibe": "local",
            "best_for": ["brunch", "group", "local_favorite"],
        },
        "vector": [0.4, 0.2, 0.8, 0.9, 0.2, 0.4, 0.8, 0.3, 0.6, 0.5, 0.7, 0.3, 0.6, 0.5, 0.9],
    },
]


def _has_default_database_url() -> bool:
    database_url = os.getenv("DATABASE_URL", "")
    return not database_url or "user:password@localhost:5432/mydb" in database_url


async def seed_demo_locations() -> None:
    if _has_default_database_url():
        print("Missing real DATABASE_URL in backend/.env.")
        print("Add your Supabase/Postgres DATABASE_URL first, then run this script again.")
        return

    inserted = 0
    skipped = 0

    try:
        async with AsyncSessionLocal() as session:
            for item in DEMO_LOCATIONS:
                result = await session.execute(
                    select(Location).where(Location.name == item["name"])
                )
                existing = result.scalars().first()

                if existing:
                    skipped += 1
                    continue

                session.add(Location(**item))
                inserted += 1

            await session.commit()
    except ProgrammingError as exc:
        if 'relation "locations" does not exist' in str(exc):
            print("The configured database does not have a locations table yet.")
            print("Run migrations first from backend/:")
            print(r"    .\.venv\Scripts\alembic.exe upgrade head")
            print("Then run this seed script again.")
            return
        raise
    finally:
        await engine.dispose()

    print(f"Seed complete. Inserted: {inserted}. Skipped existing: {skipped}.")


if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed_demo_locations())
