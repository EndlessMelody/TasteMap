from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.db.database import get_db
from src.users.models import User
from src.core.dependencies import get_current_user_id
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class SettingsUpdate(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    # Open-ended: any key-value pair
    class Config:
        extra = "allow"


@router.get("/", summary="Lấy cài đặt user")
async def get_settings(user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    return {"settings": user.settings or {}}


@router.patch("/", summary="Cập nhật settings (JSONB deep merge)")
async def patch_settings(
    body: SettingsUpdate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    JSONB deep merge strategy:
    1. Fetch current settings from DB
    2. Merge incoming dict into current dict (Python side)
    3. Write back
    This prevents overwriting existing keys not in the request body.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Không tìm thấy user")

    current = dict(user.settings or {})
    incoming = body.model_dump(exclude_unset=True, exclude_none=True)
    current.update(incoming)
    user.settings = current
    await db.commit()
    return {"settings": current}
