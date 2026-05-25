
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from src.db.database import get_db
from src.feed.schemas import FeedResponse
from src.feed.service import get_feed_cards
from src.core.cache import cached_response
from typing import Optional

router = APIRouter()

@router.get(
    "/cards",
    response_model=FeedResponse,
    summary="Lấy thẻ swipe (Tinder-style) với cursor pagination",
    description="Trả kèm photos và reviews_preview để hỗ trợ Flip Card UI. Dùng cursor để infinite scroll."
)
@cached_response(ttl=300)
async def get_cards(
    request: Request,
    user_id: Optional[str] = Query(None),
    category: str = Query("place", description="'food' hoặc 'place'"),
    lat: Optional[float] = Query(None, description="Tọa độ user — backend tính distance_km ở tầng DB"),
    lng: Optional[float] = Query(None),
    limit: int = Query(10, ge=1, le=50),
    cursor: Optional[str] = Query(None, description="Cursor for pagination (last location ID from previous batch)"),
    db: AsyncSession = Depends(get_db)
):
    result = await get_feed_cards(
        db=db, user_id=user_id, category=category, limit=limit, 
        lat=lat, lng=lng, cursor=cursor
    )
    return result


@router.get("/debug/db-check", summary="Debug database state")
async def debug_db_check(db: AsyncSession = Depends(get_db)):
    """Debug endpoint to check actual database state"""
    # Total count
    result = await db.execute(text("SELECT COUNT(*) FROM locations"))
    total = result.scalar()
    
    # Categories
    result = await db.execute(text("SELECT category, COUNT(*) FROM locations GROUP BY category"))
    categories = [{"category": row[0] if row[0] else "NULL", "count": row[1]} for row in result.fetchall()]
    
    # Sample locations
    result = await db.execute(text("SELECT id, name, category FROM locations LIMIT 20"))
    locations = [{"id": row[0], "name": row[1], "category": row[2]} for row in result.fetchall()]
    
    return {
        "total_locations": total,
        "categories": categories,
        "sample_locations": locations
    }
