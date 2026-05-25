from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import get_db
from src.reels import service
from src.reels.schemas import ReelCreate
from src.posts.service import list_reel_comments, add_comment
from src.posts.schemas import CommentCreate
from src.core.dependencies import get_current_user_id, get_optional_user_id
from typing import Optional

router = APIRouter()


@router.get("/", summary="Danh sách reels")
async def list_reels(sort: str = Query("trending"), limit: int = Query(10, ge=1, le=50), viewer_id: Optional[int] = Depends(get_optional_user_id), db: AsyncSession = Depends(get_db)):
    return await service.list_reels(db, sort, limit, viewer_id)


@router.post("/", summary="Upload reel mới", status_code=201)
async def create_reel(body: ReelCreate, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await service.create_reel(db, user_id, body)


@router.get("/{reel_id}", summary="Chi tiết reel (tự tăng views)")
async def get_reel(reel_id: int, viewer_id: Optional[int] = Depends(get_optional_user_id), db: AsyncSession = Depends(get_db)):
    return await service.get_reel(db, reel_id, viewer_id)


@router.post("/{reel_id}/like", summary="Like reel (toggle)")
async def like_reel(reel_id: int, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await service.toggle_like(db, reel_id, user_id)


@router.get("/{reel_id}/comments", summary="Comments của reel")
async def reel_comments(reel_id: int, limit: int = Query(20), offset: int = Query(0), db: AsyncSession = Depends(get_db)):
    return await list_reel_comments(db, reel_id, limit, offset)


@router.post("/{reel_id}/comments", summary="Thêm comment vào reel")
async def add_reel_comment(reel_id: int, body: CommentCreate, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await add_comment(db, user_id, body, reel_id=reel_id)
