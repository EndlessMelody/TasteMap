import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from src.users.service import UserService

DATABASE_URL = "postgresql+asyncpg://postgres.bjuikfhjrpmrpbvhduey:hakhoi1901tvtcm@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?prepared_statement_cache_size=0"

engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def main():
    async with async_session() as session:
        service = UserService(db=session)
        try:
            user = await service.get_or_create_supabase_user(
                supabase_uid="test-google-uuid", 
                email="test_google@gmail.com",
                display_name="Google User"
            )
            print(f"Created/Fetched auth user! ID: {user.id}")
        except Exception as e:
            print(f"DB ERROR OCCURRED: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())
