from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import get_db
from src.bookmarks import service
from src.bookmarks.schemas import BookmarkCreate
from src.core.dependencies import get_current_user_id

router = APIRouter()


@router.get("/", summary="Danh sách bookmarks")
async def list_bookmarks(
    limit: int = Query(20, ge=1), offset: int = Query(0, ge=0),
    user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)
):
    return await service.list_bookmarks(db, user_id, limit, offset)


@router.post("/", summary="Bookmark một địa điểm (+XP)", status_code=201)
async def add_bookmark(
    body: BookmarkCreate, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)
):
    return await service.add_bookmark(db, user_id, body)


@router.post("/toggle", summary="Bật/tắt bookmark")
async def toggle_bookmark(
    body: BookmarkCreate, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)
):
    return await service.toggle_bookmark(db, user_id, body)


@router.delete("/{bookmark_id}", summary="Bỏ bookmark")
async def delete_bookmark(
    bookmark_id: int, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)
):
    return await service.delete_bookmark(db, bookmark_id, user_id)
