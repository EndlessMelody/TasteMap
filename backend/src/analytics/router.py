from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.dependencies import get_current_admin
from src.db.database import get_db

from src.analytics import schemas, service

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/overview", response_model=schemas.AnalyticsOverview)
async def get_analytics_overview(
    current_admin=Depends(get_current_admin),
    db: AsyncSession=Depends(get_db)
):
    """Get high level analytics for the admin dashboard."""
    stats = await service.get_overview_stats(db)
    return stats
