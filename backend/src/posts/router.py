from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import get_db
from src.posts import service
from src.posts.schemas import PostCreate, CommentCreate, PostResponse
from src.core.dependencies import get_current_user_id, get_optional_user_id
from typing import Optional

router = APIRouter()
comments_router = APIRouter()


@router.post("/", summary="Tạo bài review mới", status_code=201, response_model=PostResponse)
async def create_post(body: PostCreate, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await service.create_post(db, user_id, body)


@router.get("/", summary="Feed bài viết (paginated)")
async def list_posts(
    location_id: Optional[int] = Query(None),
    user_id_filter: Optional[int] = Query(None, alias="user_id"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    viewer_id: Optional[int] = Depends(get_optional_user_id),
    db: AsyncSession = Depends(get_db)
):
    return await service.list_posts(db, viewer_id, location_id, user_id_filter, limit, offset)


@router.get("/{post_id}", summary="Chi tiết bài viết")
async def get_post(post_id: int, viewer_id: Optional[int] = Depends(get_optional_user_id), db: AsyncSession = Depends(get_db)):
    return await service.get_post(db, post_id, viewer_id)


@router.delete("/{post_id}", summary="Xóa bài viết (chỉ chủ bài)")
async def delete_post(post_id: int, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await service.delete_post(db, post_id, user_id)


@router.post("/{post_id}/like", summary="Like/Unlike bài viết (toggle)")
async def toggle_like(post_id: int, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await service.toggle_like(db, post_id, user_id)


@router.get("/{post_id}/comments", summary="Comments của bài viết")
async def list_comments(
    post_id: int,
    limit: int = Query(20, ge=1),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    return await service.list_comments(db, post_id, limit, offset)


@router.post("/{post_id}/comments", summary="Thêm comment vào bài viết")
async def add_comment(
    post_id: int,
    body: CommentCreate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    return await service.add_comment(db, user_id, body, post_id=post_id)


# Comments delete — registered separately in main router
@comments_router.delete("/{comment_id}", summary="Xóa comment")
async def delete_comment(comment_id: int, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await service.delete_comment(db, comment_id, user_id)
