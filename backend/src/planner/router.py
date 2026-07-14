from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_current_user_id
from src.db.database import get_db
from src.membership.quota import enforce_quota
from src.planner import service
from src.planner.schemas import PlannerGenerateRequest, PlannerGenerateResponse

router = APIRouter()


@router.post(
    "/generate",
    response_model=PlannerGenerateResponse,
    summary="Sinh tour tự động từ mood/ngân sách/thời gian",
    dependencies=[Depends(enforce_quota("recommendation_calls"))],
)
async def generate_plan(
    body: PlannerGenerateRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await service.generate_plan(db, user_id, body)
