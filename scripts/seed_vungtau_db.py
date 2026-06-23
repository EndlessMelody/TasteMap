import asyncio
import json
import os
import sys

# Thêm thư mục gốc (backend) vào sys.path để import từ src.*
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

import src.db.database
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from src.core.config import settings
from src.locations.models import Location

engine = create_async_engine(settings.DATABASE_URL_DIRECT, echo=False)
AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def seed_data():
    json_path = os.path.join(os.path.dirname(__file__), "../backend/src/data_test/database_vungtau.json")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    async with AsyncSessionLocal() as session:
        count = 0
        for item in data:
            meta = item.get("metadata", {})
            coords = meta.get("coordinates", {})
            vector_8d = item.get("vector", [])
            
            # Pad 8D vector to 15D
            vector_15d = vector_8d + [0.0] * (15 - len(vector_8d))
            if len(vector_15d) > 15:
                vector_15d = vector_15d[:15]
            
            # Category mapping: map to "food" or "place"
            raw_category = meta.get("category", "").lower()
            if "nhà hàng" in raw_category or "quán" in raw_category or "ẩm thực" in raw_category or "cafe" in raw_category:
                category = "food"
            else:
                category = "place"

            image_url = meta.get("image_url")
            # If image_url is a relative path like "img_01.jpg", replace it with a generic unsplash image or leave it
            if image_url and not image_url.startswith("http"):
                image_url = f"https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=900&fit=crop"

            loc = Location(
                name=meta.get("name", "Unknown Location"),
                vector=vector_15d,
                lat=coords.get("lat", 0.0),
                lng=coords.get("lng", 0.0),
                address=meta.get("address", ""),
                city="Vũng Tàu",
                category=category,
                image_url=image_url,
                price_range="$$",
                rating=4.5,
                characteristics={
                    "original_category": meta.get("category")
                }
            )
            session.add(loc)
            count += 1
            
        await session.commit()
        print(f"Successfully seeded {count} locations.")

if __name__ == "__main__":
    asyncio.run(seed_data())
