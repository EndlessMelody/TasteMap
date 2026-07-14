from fastapi import APIRouter, Depends, Query, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import get_db
from src.locations import service
from src.locations.schemas import LocationCreate, LocationResponse, LocationDetail, LocationListResponse
from typing import Optional
from src.core.cache import cached_response

router = APIRouter()


@router.get(
    "/",
    response_model=LocationListResponse,
    summary="Danh sách địa điểm",
    description="Paginated, filterable. Dùng category='food'|'place'."
)
@cached_response(ttl=300, cache_control="public, max-age=300, stale-while-revalidate=60")
async def list_locations(
    request: Request,
    response: Response,
    category: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    return await service.list_locations(db, category, city, search, min_rating, limit, offset)


@router.get(
    "/{location_id}",
    response_model=LocationDetail,
    summary="Chi tiết địa điểm (kèm posts gần đây + deals)"
)
@cached_response(ttl=600, cache_control="public, max-age=600, stale-while-revalidate=120")
async def get_location(request: Request, response: Response, location_id: int, db: AsyncSession = Depends(get_db)):
    return await service.get_location_detail(db, location_id)


from src.core.dependencies import get_current_admin
from src.users.models import User

@router.post(
    "/",
    response_model=LocationResponse,
    summary="Tạo địa điểm mới (Admin)",
    status_code=201
)
async def create_location(
    body: LocationCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    return await service.create_location(db, body)


@router.get(
    "/by-food/{food_name}",
    response_model=LocationListResponse,
    summary="Tìm địa điểm theo tên món ăn",
    description="Tìm các địa điểm có tên món ăn tương tự (hỗ trợ Culture Guide)"
)
@cached_response(ttl=600, cache_control="public, max-age=600")
async def get_locations_by_food(
    request: Request,
    response: Response,
    food_name: str,
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    """Find locations that serve the searched food item."""
    return await service.find_locations_by_food_name(db, food_name, limit)
