"""
Feed Service — Tinder-style swipe cards with Flip Card support.

Implementing Two-Pass Filtering (Vector-First) as per 04-ai-algorithm.md:
1. Pass 1: Pgvector Cosine Distance Retrieval
2. Pass 2: Python Contextual Scoring (Similarity vs Geographic Distance)
"""
import json
import logging
import math
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.locations.models import Location
from src.posts.models import Post
from src.users.models import User
from src.db.redis import RedisClient

logger = logging.getLogger(__name__)

CACHE_TTL_SECONDS = 300  # 5 minutes cache for feed


def _haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates in kilometers."""
    R = 6371  # Earth's radius in km
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    a = (math.sin(delta_lat / 2) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) *
         math.sin(delta_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


async def get_feed_cards(
    db: AsyncSession,
    user_id: Optional[str] = None,
    category: str = "place",
    limit: int = 10,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    cursor: Optional[str] = None,
) -> dict:
    """
    Lấy batch thẻ để Frontend render bằng luồng Two-Pass Filtering.
    """
    logger.info(f"[FEED] Getting cards: category={category}, limit={limit}, lat={lat}, lng={lng}, cursor={cursor}")
    
    offset = 0
    if cursor:
        try:
            offset = int(cursor)
        except ValueError:
            logger.warning(f"[FEED] Invalid offset cursor: {cursor}")
    
    # ─────────────────────────────────────────
    # 0. Smart Cache Check
    # ─────────────────────────────────────────
    # Cache key phụ thuộc vào user_id và offset. 
    # Khi user swipe, key 'feed:*:{user_id}:*' sẽ bị xoá để lấy lại feed mới.
    cache_key = f"feed:{category}:{limit}:{lat}:{lng}:{user_id or 'anon'}:{offset}"
    
    try:
        cached = await RedisClient.get(cache_key)
        if cached:
            logger.info(f"[FEED] Cache hit for {cache_key}")
            return json.loads(cached)
    except Exception as e:
        logger.warning(f"[FEED] Redis cache error: {e}")

    # ─────────────────────────────────────────
    # 1. Khởi tạo User Vector (Fallback)
    # ─────────────────────────────────────────
    user_vector = [0.5] * 15
    if user_id:
        try:
            uid_int = int(user_id)
            user = await db.get(User, uid_int)
            if user:
                if category == "food" and user.food_vector is not None:
                    # Convert pgvector string to list if necessary, or just pass directly
                    user_vector = list(user.food_vector) if isinstance(user.food_vector, list) else user.food_vector
                elif user.place_vector is not None:
                    user_vector = list(user.place_vector) if isinstance(user.place_vector, list) else user.place_vector
        except ValueError:
            pass
            
    # Đảm bảo user_vector format hợp lệ cho SQLAlchemy
    if isinstance(user_vector, str):
        import ast
        user_vector = ast.literal_eval(user_vector)

    # ─────────────────────────────────────────
    # 2. Pass 1: Vector Database Retrieval
    # ─────────────────────────────────────────
    # Lấy ra số lượng ứng viên đủ lớn (Pool) để chấm điểm lại.
    pool_size = max(100, offset + limit + 20)
    
    # Gọi hàm pgvector cosine_distance (<=>)
    query = (
        select(Location, Location.vector.cosine_distance(user_vector).label("cos_dist"))
        .where((Location.category == category) | (Location.category.is_(None)))
        .order_by(Location.vector.cosine_distance(user_vector))
        .limit(pool_size)
    )
    
    result = await db.execute(query)
    rows = result.all()
    
    if not rows:
        return {"cards": [], "next_cursor": None, "has_more": False}

    # ─────────────────────────────────────────
    # 3. Pass 2: Contextual Scoring & Ranking
    # ─────────────────────────────────────────
    W1 = 0.7  # Similarity weight
    W2 = 0.3  # Distance penalty weight
    MAX_DISTANCE_KM = 50.0
    
    scored_items = []
    
    for row in rows:
        loc = row[0]
        cos_dist = float(row[1]) if row[1] is not None else 1.0
        
        # Tính Similarity [0, 1] (cosine_distance = 1 - cosine_similarity)
        similarity = 1.0 - cos_dist
        match_percent = max(0, min(100, int(similarity * 100)))
        
        # Tính khoảng cách và chuẩn hoá (Normalized Distance)
        dist_km = None
        normalized_distance = 0.0
        
        if lat is not None and lng is not None and loc.lat is not None and loc.lng is not None:
            dist_km = _haversine_distance(lat, lng, loc.lat, loc.lng)
            # Clamp khoảng cách về [0, 1]
            normalized_distance = min(dist_km / MAX_DISTANCE_KM, 1.0)
            
        # Chấm điểm tổng hợp
        score = (W1 * similarity) - (W2 * normalized_distance)
        scored_items.append((score, loc, dist_km, match_percent))
        
    # Sắp xếp lại theo điểm (cao nhất lên trước)
    scored_items.sort(key=lambda x: x[0], reverse=True)
    
    # ─────────────────────────────────────────
    # 4. Slice & Trả về
    # ─────────────────────────────────────────
    # Cắt lấy đúng số thẻ cần hiển thị cho trang hiện tại
    page_items = scored_items[offset : offset + limit]
    
    cards = []
    for item in page_items:
        score, loc, dist_km, match_percent = item
        reviews = await _get_reviews_preview(db, loc.id)
        cards.append(_build_card(loc, dist_km, match_percent, reviews))
        
    # Tính next_cursor cho lần tải trang tiếp theo
    has_more = (offset + limit) < len(scored_items)
    next_cursor = str(offset + limit) if has_more else None

    response_data = {
        "cards": cards,
        "next_cursor": next_cursor,
        "has_more": has_more
    }

    # Lưu cache
    try:
        await RedisClient.setex(cache_key, CACHE_TTL_SECONDS, json.dumps(response_data))
        logger.info(f"[FEED] Cached {len(cards)} cards for {cache_key}")
    except Exception as e:
        logger.warning(f"[FEED] Failed to cache: {e}")

    return response_data


async def _get_reviews_preview(db: AsyncSession, location_id: int) -> List[str]:
    """Lấy 2 câu review ngắn nhất của địa điểm để phục vụ flip card."""
    try:
        result = await db.execute(
            select(Post.review)
            .where(Post.location_id == location_id)
            .order_by(Post.likes_count.desc())
            .limit(2)
        )
        rows = result.all()
        return [row[0][:120] for row in rows if row[0]]
    except Exception as e:
        logger.warning(f"[FEED] Error getting reviews for location {location_id}: {e}")
        return []


def _build_card(loc: Location, distance_km: Optional[float], match_percent: int, reviews: List[str]) -> dict:
    tags = []
    if loc.characteristics:
        if isinstance(loc.characteristics, dict):
            sorted_chars = sorted(
                [(k, v) for k, v in loc.characteristics.items() if isinstance(v, (int, float))],
                key=lambda x: x[1],
                reverse=True
            )[:3]
            tags = [k.replace("_", " ").title() for k, v in sorted_chars]
            
    category = loc.category if loc.category else "place"
    
    # Định dạng khoảng cách để hiển thị đẹp hơn
    distance_display = None
    if distance_km is not None:
        distance_display = round(distance_km, 2)
    
    return {
        "id": loc.id,
        "name": loc.name,
        "image_url": loc.image_url,
        "tags": tags,
        "price_range": loc.price_range,
        "rating": loc.rating,
        "distance_km": distance_display,
        "match_percent": match_percent,  # Giá trị chuẩn xác từ AI Two-Pass
        "photos": [loc.image_url] if loc.image_url else [],
        "reviews_preview": reviews,
        "address": loc.address,
        "open_hours": loc.open_hours,
        "category": category,
        "lat": loc.lat,
        "lng": loc.lng,
    }
