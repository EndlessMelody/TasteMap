import asyncio
from src.db.database import AsyncSessionLocal
from src.users.models import User
from src.culture.service import parse_food_vector

async def test():
    async with AsyncSessionLocal() as session:
        user = await session.get(User, 1)
        if user:
            print('user boolean evaluation:', bool(user))
            try:
                res = parse_food_vector(user.food_vector)
                print('parsed vector:', res)
            except Exception as e:
                import traceback
                traceback.print_exc()
        else:
            print('User not found')

asyncio.run(test())
