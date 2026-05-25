"""
Challenges Router — API endpoints for the gamification system.
"""
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import get_db
from src.core.dependencies import get_current_user_id, get_current_admin
from src.challenges import service, streak_service, leaderboard_service, schemas
from src.challenges.schemas import UserChallengeProgress, LeaderboardEntry, StreakStatus
from src.users.models import User

router = APIRouter(prefix="/challenges", tags=["Challenges & Leaderboard"])

@router.get("/", response_model=List[dict])
async def list_challenges_admin(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return await service.get_all_challenges_admin(db)


@router.post("/", response_model=schemas.ChallengeResponse)
async def create_challenge(
    schema: schemas.ChallengeCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return await service.create_challenge(db, schema)


@router.get("/me")
async def get_my_challenges(
    status: Optional[str] = Query(None, regex="^(active|completed|claimed|expired)$"),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Lấy danh sách thử thách của bản thân và tiến độ."""
    data = await service.get_user_challenges(db, user_id, status)
    return {"success": True, "data": data}

@router.get("/xp/me")
async def get_my_xp(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Lấy thông tin XP và level của bản thân."""
    data = await service.get_user_xp_info(db, user_id)
    return {"success": True, "data": data}

@router.get("/streaks/me")
async def get_my_streak(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Lấy thông tin streak hiện tại."""
    data = await streak_service.get_streak_status(db, user_id)
    return {"success": True, "data": data}

@router.post("/{challenge_id}/join")
async def join_challenge(
    challenge_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Tham gia một thử thách mới."""
    return await service.join_challenge(db, user_id, challenge_id)

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
    data = await leaderboard_service.get_leaderboard(db, period, limit, user_id)
    return {"success": True, "data": data.get("items", [])}

@router.post("/streaks/checkin")
async def daily_checkin(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Điểm danh hàng ngày để duy trì streak và nhận XP."""
    return await streak_service.checkin(db, user_id)

@router.get("/{challenge_id}", response_model=schemas.ChallengeAdminDetail)
async def get_challenge_detail(
    challenge_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    challenge = await service.get_challenge_by_id_admin(db, challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return challenge


@router.put("/{challenge_id}", response_model=schemas.ChallengeResponse)
async def update_challenge(
    challenge_id: int,
    schema: schemas.ChallengeUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    challenge = await service.update_challenge(db, challenge_id, schema)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return challenge


@router.delete("/{challenge_id}")
async def delete_challenge(
    challenge_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    success = await service.delete_challenge(db, challenge_id)
    if not success:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return {"status": "success", "message": "Challenge deleted"}
