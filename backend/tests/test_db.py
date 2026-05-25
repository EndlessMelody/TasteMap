import asyncio
from src.db.database import async_session
from src.users.service import UserService

async def main():
    async with async_session() as session:
        service = UserService(db=session)
        try:
            user = await service.get_or_create_supabase_user(supabase_uid="test-uuid", email="test@gmail.com")
            print(f"Created user: {user.username}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
