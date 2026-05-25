from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import get_db
from src.tours import service
from src.tours.schemas import StopCreate, StatusUpdate, OptimizeRequest, OptimizeResponse
from src.core.dependencies import get_current_user_id
from typing import Optional

router = APIRouter()


@router.post("/", summary="Tạo tour mới", status_code=201)
async def create_tour(user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await service.create_tour(db, user_id)


@router.get("/", summary="Danh sách tours của user")
async def list_tours(
    status: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=50),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    return {"items": await service.list_tours(db, user_id, status, limit)}


@router.get("/{tour_id}", summary="Chi tiết tour + stops")
async def get_tour(tour_id: int, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await service.get_tour(db, tour_id, user_id)


@router.post("/{tour_id}/stops", summary="Thêm stop vào tour")
async def add_stop(
    tour_id: int,
    body: StopCreate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    return await service.add_stop(db, tour_id, user_id, body)


@router.delete("/{tour_id}/stops/{stop_id}", summary="Xóa stop khỏi tour")
async def delete_stop(
    tour_id: int,
    stop_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    return await service.delete_stop(db, tour_id, stop_id, user_id)


@router.post("/{tour_id}/optimize", response_model=OptimizeResponse, summary="Tối ưu thứ tự stops")
async def optimize_tour(
    tour_id: int,
    body: OptimizeRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    return await service.optimize_tour(db, tour_id, user_id, body)


@router.patch("/{tour_id}/status", summary="Cập nhật trạng thái tour")
async def update_status(
    tour_id: int,
    body: StatusUpdate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    return await service.update_status(db, tour_id, user_id, body.status)
