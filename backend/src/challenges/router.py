"""
Challenges Router — API endpoints for the gamification system.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import get_db
from src.core.dependencies import get_current_user_id
from src.challenges import service, streak_service, leaderboard_service
from src.challenges.schemas import UserChallengeProgress, LeaderboardEntry, StreakStatus

router = APIRouter(prefix="/challenges", tags=["Challenges & Leaderboard"])

@router.get("/me", response_model=List[dict])
async def get_my_challenges(
    status: Optional[str] = Query(None, regex="^(active|completed|claimed|expired)$"),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Lấy danh sách thử thách của bản thân và tiến độ."""
    return await service.get_user_challenges(db, user_id, status)

@router.post("/{user_challenge_id}/claim")
async def claim_reward(
    user_challenge_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Nhận thưởng cho thử thách đã hoàn thành."""
    result = await service.claim_challenge_reward(db, user_id, user_challenge_id)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result

@router.get("/leaderboard")
async def get_rankings(
    period: str = Query("alltime", regex="^(alltime|monthly|weekly)$"),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Xem bảng xếp hạng thế giới."""
    return await leaderboard_service.get_leaderboard(db, period, limit, user_id)

@router.post("/streaks/checkin")
async def daily_checkin(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Điểm danh hàng ngày để duy trì streak và nhận XP."""
    return await streak_service.checkin(db, user_id)
