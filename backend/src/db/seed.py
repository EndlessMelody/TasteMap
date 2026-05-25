"""
Seed script — chèn dữ liệu location mẫu 15 chiều vào database.
Chạy: python -m src.db.seed

Vector 15 chiều đại diện cho:
[price, noise, nature, food_quality, modern_vs_historic, nightlife,
 family_friendly, romantic, adventure, cultural, luxury, casual,
 scenic, accessibility, popularity]
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import engine, AsyncSessionLocal, Base
from src.locations.models import Location


# Dữ liệu mẫu — 15 chiều mỗi location
SEED_LOCATIONS = [
    {
        "name": "Phở Thìn Bờ Hồ",
        "category": "food",
        "lat": 21.0285,
        "lng": 105.8542,
        "city": "Hà Nội",
        "base_score": 4.5,
        "image_url": "https://placehold.co/400x300?text=Pho+Thin",
        "characteristics": {"cuisine": "Vietnamese", "vibe": "traditional", "price_range": "$"},
        # [price_low, noisy, no_nature, food_high, historic, no_nightlife,
        #  family_ok, not_romantic, no_adventure, cultural, not_luxury, casual,
        #  not_scenic, accessible, very_popular]
        "vector": [0.2, 0.7, 0.1, 0.9, 0.8, 0.1, 0.7, 0.2, 0.1, 0.8, 0.1, 0.9, 0.2, 0.8, 0.9],
    },
    {
        "name": "The Coffee House - Nguyễn Huệ",
        "category": "food",
        "lat": 10.7731,
        "lng": 106.7030,
        "city": "TP.HCM",
        "base_score": 4.0,
        "image_url": "https://placehold.co/400x300?text=Coffee+House",
        "characteristics": {"cuisine": "Cafe", "vibe": "chill", "price_range": "$$"},
        "vector": [0.4, 0.3, 0.2, 0.6, 0.3, 0.2, 0.5, 0.6, 0.1, 0.3, 0.4, 0.7, 0.4, 0.9, 0.7],
    },
    {
        "name": "Bún chả Hương Liên",
        "category": "food",
        "lat": 21.0115,
        "lng": 105.8397,
        "city": "Hà Nội",
        "base_score": 4.7,
        "image_url": "https://placehold.co/400x300?text=Bun+Cha",
        "characteristics": {"cuisine": "Vietnamese", "vibe": "local", "price_range": "$"},
        "vector": [0.2, 0.6, 0.1, 0.95, 0.7, 0.1, 0.6, 0.1, 0.1, 0.7, 0.1, 0.9, 0.1, 0.7, 0.85],
    },
    {
        "name": "Hồ Hoàn Kiếm",
        "category": "place",
        "lat": 21.0288,
        "lng": 105.8525,
        "city": "Hà Nội",
        "base_score": 4.8,
        "image_url": "https://placehold.co/400x300?text=Hoan+Kiem",
        "characteristics": {"type": "lake", "vibe": "peaceful"},
        "vector": [0.1, 0.3, 0.9, 0.1, 0.9, 0.2, 0.8, 0.7, 0.3, 0.9, 0.2, 0.6, 0.95, 0.9, 0.95],
    },
    {
        "name": "Landmark 81",
        "category": "place",
        "lat": 10.7952,
        "lng": 106.7219,
        "city": "TP.HCM",
        "base_score": 4.3,
        "image_url": "https://placehold.co/400x300?text=Landmark81",
        "characteristics": {"type": "observation_deck", "vibe": "modern"},
        "vector": [0.8, 0.4, 0.2, 0.3, 0.1, 0.6, 0.5, 0.7, 0.4, 0.3, 0.9, 0.3, 0.8, 0.7, 0.8],
    },
    {
        "name": "Bãi biển Mỹ Khê",
        "category": "place",
        "lat": 16.0544,
        "lng": 108.2472,
        "city": "Đà Nẵng",
        "base_score": 4.6,
        "image_url": "https://placehold.co/400x300?text=My+Khe+Beach",
        "characteristics": {"type": "beach", "vibe": "relaxing"},
        "vector": [0.3, 0.4, 0.95, 0.2, 0.3, 0.3, 0.8, 0.8, 0.7, 0.4, 0.3, 0.7, 0.95, 0.6, 0.8],
    },
    {
        "name": "Quán Ăn Ngon - Pasteur",
        "category": "food",
        "lat": 10.7760,
        "lng": 106.6940,
        "city": "TP.HCM",
        "base_score": 4.2,
        "image_url": "https://placehold.co/400x300?text=Quan+An+Ngon",
        "characteristics": {"cuisine": "Vietnamese", "vibe": "rustic-elegant", "price_range": "$$"},
        "vector": [0.5, 0.5, 0.3, 0.85, 0.6, 0.1, 0.7, 0.5, 0.1, 0.6, 0.5, 0.5, 0.4, 0.8, 0.75],
    },
    {
        "name": "Phố cổ Hội An",
        "category": "place",
        "lat": 15.8801,
        "lng": 108.3380,
        "city": "Hội An",
        "base_score": 4.9,
        "image_url": "https://placehold.co/400x300?text=Hoi+An",
        "characteristics": {"type": "old_town", "vibe": "romantic"},
        "vector": [0.3, 0.4, 0.6, 0.5, 0.95, 0.4, 0.6, 0.9, 0.5, 0.95, 0.4, 0.5, 0.95, 0.7, 0.9],
    },
]


async def seed_db():
    """Chèn dữ liệu mẫu vào database. Skip nếu đã có data."""
    from sqlalchemy import text
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Kiểm tra xem đã có data chưa
        from sqlalchemy.future import select
        result = await session.execute(select(Location).limit(1))
        if result.scalars().first():
            print("⚠️  Database đã có data — skip seeding.")
            return

        for loc_data in SEED_LOCATIONS:
            location = Location(**loc_data)
            session.add(location)

        await session.commit()
        print(f"✅ Đã seed {len(SEED_LOCATIONS)} locations vào database.")


if __name__ == "__main__":
    asyncio.run(seed_db())
