from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import get_db
from src.notifications import service
from src.core.dependencies import get_current_user_id
from typing import Optional

router = APIRouter()


@router.get("/", summary="Danh sách thông báo")
async def list_notifications(
    notif_type: Optional[str] = Query(None, alias="type"),
    unread_only: bool = Query(False),
    limit: int = Query(20, ge=1, le=100),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    return await service.list_notifications(db, user_id, notif_type, unread_only, limit)


@router.patch("/{notif_id}/read", summary="Đánh dấu đã đọc")
async def mark_read(notif_id: int, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await service.mark_read(db, notif_id, user_id)


@router.patch("/read-all", summary="Đánh dấu tất cả đã đọc")
async def mark_all_read(user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await service.mark_all_read(db, user_id)
