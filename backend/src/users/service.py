from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.users.models import User
from src.users.schemas import UserCreate

class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_id(self, user_id: int):
        result = await self.db.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
        return user

    async def create_user(self, user_create: UserCreate):
        new_user = User(
            username=user_create.username,
            email=user_create.email,
        )
        self.db.add(new_user)
        try:
            await self.db.commit()
            await self.db.refresh(new_user)
            return new_user
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(status_code=400, detail=f"Không thể tạo người dùng: {str(e)}")
