import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def test():
    # Use the direct connection URL for better compatibility
    engine = create_async_engine('postgresql+asyncpg://postgres.bjuikfhjrpmrpbvhduey:hakhoi1901tvtcm@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres')
    async with engine.connect() as conn:
        # Test connection
        result = await conn.execute(text('SELECT 1'))
        print('Connection OK:', result.scalar())
        
        # Check total locations
        result = await conn.execute(text('SELECT COUNT(*) FROM locations'))
        total = result.scalar()
        print(f'\nTotal locations: {total}')
        
        # Check categories (including NULL)
        result = await conn.execute(text('SELECT category, COUNT(*) FROM locations GROUP BY category ORDER BY category'))
        rows = result.fetchall()
        print('\nCategories in Supabase DB:')
        for row in rows:
            cat = row[0] if row[0] is not None else 'NULL'
            print(f'  {cat}: {row[1]}')
        
        # Check for 'place' category specifically
        result = await conn.execute(text("SELECT id, name, category FROM locations WHERE category='place' LIMIT 10"))
        rows = result.fetchall()
        print(f"\nPlace locations ({len(rows)} found):")
        for row in rows:
            print(f'  {row[0]}: {row[1]} (cat={row[2]})')
        
        # Check for NULL categories (these won't show in feed!)
        result = await conn.execute(text("SELECT id, name FROM locations WHERE category IS NULL LIMIT 5"))
        rows = result.fetchall()
        print(f"\nNULL category locations ({len(rows)} sample):")
        for row in rows:
            print(f'  {row[0]}: {row[1]}')
        
        # Check all unique non-null categories
        result = await conn.execute(text("SELECT DISTINCT category FROM locations WHERE category IS NOT NULL"))
        rows = result.fetchall()
        print(f"\nAll unique categories: {[r[0] for r in rows]}")

asyncio.run(test())
