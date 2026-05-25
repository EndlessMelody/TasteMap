"""Direct database check using backend's own database setup"""
import asyncio
from sqlalchemy import text
from src.db.database import async_session_maker

async def check_db():
    async with async_session_maker() as session:
        # Check total count
        result = await session.execute(text("SELECT COUNT(*) FROM locations"))
        total = result.scalar()
        print(f"Total locations: {total}")
        
        # Check categories
        result = await session.execute(text("SELECT category, COUNT(*) FROM locations GROUP BY category"))
        rows = result.fetchall()
        print("\nCategories:")
        for row in rows:
            cat = row[0] if row[0] else 'NULL'
            print(f"  {cat}: {row[1]}")
        
        # Check sample locations
        result = await session.execute(text("SELECT id, name, category FROM locations LIMIT 10"))
        rows = result.fetchall()
        print("\nSample locations:")
        for row in rows:
            print(f"  {row[0]}: {row[1]} (cat={row[2]})")

if __name__ == "__main__":
    asyncio.run(check_db())
