from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import get_db
from src.deals import service
from src.deals.schemas import DealCreate
from typing import Optional

router = APIRouter()


@router.get("/", summary="Deals đang hoạt động")
async def list_deals(
    location_id: Optional[int] = Query(None),
    sponsored_only: bool = Query(False),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    return await service.list_active_deals(db, location_id, sponsored_only, limit)


@router.get("/{deal_id}", summary="Chi tiết deal")
async def get_deal(deal_id: int, db: AsyncSession = Depends(get_db)):
    return await service.get_deal(db, deal_id)


@router.post("/", summary="Tạo deal mới (Admin)", status_code=201)
async def create_deal(body: DealCreate, db: AsyncSession = Depends(get_db)):
    return await service.create_deal(db, body)
