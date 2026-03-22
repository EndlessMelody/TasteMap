from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import get_db
from src.feed.schemas import FeedResponse
from src.feed.service import get_feed_cards
from typing import Optional

router = APIRouter()

@router.get("/cards", response_model=FeedResponse)
async def get_cards(
    user_id: Optional[str] = None,
    type: str = "place",
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    """
    Lấy danh sách thẻ để Frontend render (Batch Fetching).
    - user_id: ID người dùng (dùng để lọc thẻ đã xem/ưu tiên vector sau này)
    - type: "food" hoặc "place"
    - limit: số lượng thẻ muốn lấy (mặc định 10)
    
    Response KHÔNG chứa vector — Frontend chỉ cần thông tin hiển thị.
    """
    cards = await get_feed_cards(db=db, user_id=user_id, feed_type=type, limit=limit)
    return {"cards": cards}
