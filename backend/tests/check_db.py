import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def test():
    engine = create_async_engine('postgresql+asyncpg://user:password@localhost:5432/mydb')
    async with engine.connect() as conn:
        # Check categories including NULL
        result = await conn.execute(text('SELECT category, COUNT(*) FROM locations GROUP BY category ORDER BY category'))
        rows = result.fetchall()
        print('Categories in DB:')
        for row in rows:
            cat = row[0] if row[0] is not None else 'NULL'
            print(f'  {cat}: {row[1]}')
        
        # Total count
        result2 = await conn.execute(text('SELECT COUNT(*) FROM locations'))
        total = result2.scalar()
        print(f'\nTotal locations: {total}')
        
        # Check specific locations the user mentioned
        print('\n=== Checking specific locations ===')
        result = await conn.execute(text("SELECT id, name, category, lat, lng FROM locations WHERE name ILIKE '%trinh%' OR name ILIKE '%mau%'"))
        rows = result.fetchall()
        for row in rows:
            print(f'  {row[0]}: {row[1]} (cat={row[2]}, lat={row[3]}, lng={row[4]})')
        
        # Query what the feed API would return for category='place'
        print('\n=== Feed API query for category=place ===')
        result = await conn.execute(text("SELECT id, name, category FROM locations WHERE category='place' ORDER BY RANDOM() LIMIT 10"))
        rows = result.fetchall()
        print(f'  Found {len(rows)} locations:')
        for row in rows:
            print(f'    {row[0]}: {row[1]} ({row[2]})')
        
        # Also check for 'food' category
        print('\n=== Feed API query for category=food ===')
        result = await conn.execute(text("SELECT id, name, category FROM locations WHERE category='food' ORDER BY RANDOM() LIMIT 10"))
        rows = result.fetchall()
        print(f'  Found {len(rows)} locations:')
        for row in rows:
            print(f'    {row[0]}: {row[1]} ({row[2]})')
        
        # Check NULL categories
        print('\n=== NULL category locations ===')
        result = await conn.execute(text("SELECT id, name FROM locations WHERE category IS NULL LIMIT 5"))
        rows = result.fetchall()
        print(f'  Found {len(rows)} locations with NULL category')
        for row in rows:
            print(f'    {row[0]}: {row[1]}')

asyncio.run(test())
