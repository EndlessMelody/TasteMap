from fastapi import APIRouter, Request, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from src.db.database import get_db
from src.interactions.schemas import SwipeBatchRequest, SwipeBatchResponse, InteractionHistoryResponse, InteractionHistoryItem
from src.interactions.service import process_swipe_batch
from src.interactions.models import Interaction
from src.locations.models import Location
from typing import Optional

router = APIRouter()


@router.post(
    "/swipe-batch",
    response_model=SwipeBatchResponse,
    summary="Gửi batch swipe",
    description="Frontend gom tối đa 5 actions hoặc đợi 3s rồi gửi 1 lần."
)
async def swipe_batch(
    request: Request,
    body: SwipeBatchRequest,
    db: AsyncSession = Depends(get_db)
):
    redis = request.app.state.redis
    actions_data = [action.model_dump() for action in body.actions]
    result = await process_swipe_batch(
        db=db,
        redis=redis,
        user_id=body.user_id,
        domain=body.category,  # renamed field
        actions=actions_data
    )
    return result


@router.get(
    "/history",
    response_model=InteractionHistoryResponse,
    summary="Lịch sử swipe của user"
)
async def get_history(
    user_id: int = Query(...),
    action: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Interaction, Location.name.label("location_name"))
        .join(Location, Location.id == Interaction.location_id)
        .where(Interaction.user_id == user_id)
    )
    if action:
        query = query.where(Interaction.action == action.upper())

    count_q = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_q)
    total = total_result.scalar_one() or 0

    query = query.order_by(Interaction.timestamp.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    items = [
        InteractionHistoryItem(
            id=row[0].id,
            location_id=row[0].location_id,
            location_name=row[1],
            action=row[0].action,
            timestamp=row[0].timestamp,
        )
        for row in rows
    ]
    return InteractionHistoryResponse(items=items, total=total)
