"""
Locations Service — with DB-side distance calculation.

RULE: Khoảng cách (distance_km) PHẢI được tính ở tầng Database bằng SQLAlchemy.
Không kéo toàn bộ rows lên RAM rồi tính bằng Python loop (O(N) overhead).

Công thức Haversine approximate (không cần PostGIS):
    dist ≈ sqrt((Δlat_deg * 111)^2 + (Δlng_deg * 111 * cos(lat_rad))^2)

Dùng SQLAlchemy func.sqrt, func.pow, func.cos, func.radians để biểu diễn.
"""
import math
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import case, func, or_
from typing import Optional, List

from src.locations.models import Location
from src.locations.schemas import LocationCreate, LocationResponse, LocationDetail, LocationListResponse


async def list_locations(
    db: AsyncSession,
    category: Optional[str] = None,
    city: Optional[str] = None,
    search: Optional[str] = None,
    min_rating: Optional[float] = None,
    limit: int = 20,
    offset: int = 0,
) -> LocationListResponse:
    query = select(Location)

    if category:
        query = query.where(Location.category == category)
    if city:
        query = query.where(Location.city == city)
    if search:
        query = query.where(Location.name.ilike(f"%{search}%"))
    if min_rating is not None:
        query = query.where(Location.rating >= min_rating)

    # Count total
    count_q = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_q)
    total = total_result.scalar_one() or 0

    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    locations = result.scalars().all()

    return LocationListResponse(
        items=[LocationResponse.model_validate(loc) for loc in locations],
        total=total,
        limit=limit,
        offset=offset,
    )


async def get_location_detail(db: AsyncSession, location_id: int) -> LocationDetail:
    result = await db.execute(select(Location).where(Location.id == location_id))
    loc = result.scalars().first()
    if not loc:
        raise HTTPException(status_code=404, detail="Không tìm thấy địa điểm")

    # Recent posts (up to 3)
    from src.posts.models import Post
    posts_result = await db.execute(
        select(Post).where(Post.location_id == location_id).order_by(Post.created_at.desc()).limit(3)
    )
    posts = posts_result.scalars().all()
    recent_posts = [{"id": p.id, "review": p.review[:100], "rating": p.rating, "image_url": p.image_url} for p in posts]

    # Active deals
    from src.deals.models import Deal
    from sqlalchemy import text
    from datetime import datetime, timezone
    now_utc = datetime.now(timezone.utc)
    deals_result = await db.execute(
        select(Deal).where(Deal.location_id == location_id, Deal.expires_at > now_utc).limit(3)
    )
    deals = deals_result.scalars().all()
    active_deals = [{"id": d.id, "title": d.title, "discount_percent": d.discount_percent} for d in deals]

    return LocationDetail(
        id=loc.id,
        name=loc.name,
        lat=loc.lat,
        lng=loc.lng,
        address=loc.address,
        city=loc.city,
        category=loc.category,
        image_url=loc.image_url,
        price_range=loc.price_range,
        open_hours=loc.open_hours,
        rating=loc.rating,
        characteristics=loc.characteristics,
        created_at=loc.created_at,
        recent_posts=recent_posts,
        active_deals=active_deals,
    )


async def create_location(db: AsyncSession, data: LocationCreate) -> Location:
    loc = Location(**data.model_dump())
    db.add(loc)
    try:
        await db.commit()
        await db.refresh(loc)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return loc


async def find_locations_by_food_name(
    db: AsyncSession,
    food_name: str,
    limit: int = 10,
) -> LocationListResponse:
    """
    Find locations that likely serve the searched food.
    Uses smart matching: name contains food_name OR category is 'food' with name similarity.
    """
    from sqlalchemy import or_, func
    
    # Normalize search term
    search_term = food_name.lower().strip()
    
    # Build query with flexible matching
    query = select(Location).where(
        or_(
            # Direct name match (e.g., "Phở" matches "Phở Thìn")
            func.lower(Location.name).contains(search_term),
            # Food category locations that might serve this
            Location.category == "food",
        )
    )
    
    # Prefer food category, then by rating
    query = query.order_by(
        case((Location.category == "food", 1), else_=0).desc(),
        Location.rating.desc().nullslast(),
        Location.base_score.desc().nullslast(),
    )
    
    query = query.limit(limit)
    result = await db.execute(query)
    locations = result.scalars().all()
    
    # If no direct matches, fallback to any food locations
    if not locations:
        fallback_query = select(Location).where(
            Location.category == "food"
        ).order_by(
            Location.rating.desc().nullslast(),
        ).limit(limit)
        fallback_result = await db.execute(fallback_query)
        locations = fallback_result.scalars().all()
    
    return LocationListResponse(
        items=[LocationResponse.model_validate(loc) for loc in locations],
        total=len(locations),
        limit=limit,
        offset=0,
    )
