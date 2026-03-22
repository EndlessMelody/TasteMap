from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql.expression import func
from src.locations.models import Location
# Dùng thư viện redis nếu có lưu cached vector của user, hiện tạm fetch random từ DB nếu không có logic vector rõ ràng cho feed mồi.

async def get_feed_cards(db: AsyncSession, user_id: Optional[str] = None, feed_type: str = "place", limit: int = 10) -> List[dict]:
    """
    Lấy danh sách thẻ để Frontend render.
    - Dùng PostgreSQL để lấy danh sách random hoặc theo Vector.
    - Hiện tại tạm lấy random `ORDER BY random()`, sau này có thể kết hợp pgvector để kéo thẻ mồi hợp nhất.
    """
    query = select(Location).where(Location.category == feed_type).order_by(func.random()).limit(limit)
    result = await db.execute(query)
    locations = result.scalars().all()
    
    if not locations:
        return []
        
    cards = []
    for loc in locations:
        cards.append({
            "place_id": loc.id,
            "name": loc.name,
            "image_url": loc.image_url or "",
            "category": loc.category,
            "coordinates": {"lat": loc.lat, "lng": loc.lng} if loc.lat else None
        })
        
    return cards
