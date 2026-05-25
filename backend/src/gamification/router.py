from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from src.db.database import get_db
from src.gamification import service, schemas
from src.core.dependencies import get_current_user_id, get_current_admin

router = APIRouter()

@router.get("/", response_model=List[schemas.BadgeResponse], summary="Lấy danh sách tất cả badges công khai")
async def list_all_badges(db: AsyncSession = Depends(get_db)):
    return await service.list_all_badges(db)

@router.get("/me", response_model=List[schemas.UserBadgeResponse], summary="Lấy danh sách badges của người dùng hiện tại")
async def my_badges(user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await service.list_user_badges(db, user_id)

@router.get("/user/{user_id}", response_model=List[schemas.UserBadgeResponse], summary="Lấy danh sách badges của user bất kỳ")
async def user_badges(user_id: int, db: AsyncSession = Depends(get_db)):
    return await service.list_user_badges(db, user_id)

# ----------------- ADMIN ROUTES ----------------- #

@router.get("/admin/all", response_model=List[schemas.BadgeAdminDetail], summary="Admin: Lấy danh sách tất cả badges kèm metrics")
async def admin_list_badges(admin = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    return await service.get_all_badges_admin_view(db)

@router.post("/", response_model=schemas.BadgeResponse, status_code=status.HTTP_201_CREATED, summary="Admin: Tạo badge mới")
async def create_badge(payload: schemas.BadgeCreate, admin = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    return await service.create_badge(db, payload)

@router.patch("/{badge_id}", response_model=schemas.BadgeResponse, summary="Admin: Cập nhật badge")
async def update_badge(badge_id: int, payload: schemas.BadgeUpdate, admin = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    badge = await service.update_badge(db, badge_id, payload)
    if not badge:
        raise HTTPException(status_code=404, detail="Badge not found")
    return badge

@router.delete("/{badge_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Admin: Xóa badge")
async def delete_badge(badge_id: int, admin = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    success = await service.delete_badge(db, badge_id)
    if not success:
        raise HTTPException(status_code=404, detail="Badge not found")

@router.post("/admin/award/{user_id}/{badge_id}", summary="Admin: Cấp huy hiệu cho user")
async def admin_award_badge(
    user_id: int, 
    badge_id: int, 
    admin=Depends(get_current_admin), 
    db: AsyncSession=Depends(get_db)
):
    result = await service.award_badge(db, user_id, badge_id)
    return {"success": True, "message": result["status"]}
