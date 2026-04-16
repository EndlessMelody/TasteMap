"""
Challenges Service — Orchestrates tracking, completion, and reward claiming.
"""
from typing import Dict, Any, Optional, List
from sqlalchemy import select, update, and_
from sqlalchemy.ext.asyncio import AsyncSession
from src.challenges.models import Challenge, UserChallenge
from src.challenges.tracker import ChallengeTracker
from src.challenges import xp_service

async def track_user_action(
    db: AsyncSession,
    user_id: int,
    action_type: str,
    ref_type: Optional[str] = None,
    ref_id: Optional[int] = None,
    metadata: Dict[str, Any] = None
):
    """
    Track a user action and update relevant challenges.
    This is the main entry point for other services.
    """
    await ChallengeTracker.track_action(
        db=db,
        user_id=user_id,
        action_type=action_type,
        ref_type=ref_type,
        ref_id=ref_id,
        metadata=metadata
    )
    # Note: ChallengeTracker marks as 'completed'. User usually claims reward manually
    # or it can be auto-claimed for some types.

async def claim_challenge_reward(
    db: AsyncSession,
    user_id: int,
    user_challenge_id: int
) -> dict:
    """
    Claim rewards for a completed challenge.
    Checks status, updates status to 'claimed', and awards XP.
    """
    query = (
        select(UserChallenge, Challenge)
        .join(Challenge, UserChallenge.challenge_id == Challenge.id)
        .where(
            and_(
                UserChallenge.id == user_challenge_id,
                UserChallenge.user_id == user_id
            )
        )
    )
    result = await db.execute(query)
    row = result.fetchone()
    
    if not row:
        return {"success": False, "error": "Challenge not found"}
        
    user_challenge, challenge = row
    
    if user_challenge.status != "completed":
        return {"success": False, "error": f"Challenge status is {user_challenge.status}, not completed"}

    # Update status ATOMICALLY to claim
    # This prevents double claiming
    stmt = (
        update(UserChallenge)
        .where(UserChallenge.id == user_challenge_id, UserChallenge.status == "completed")
        .values(
            status="claimed",
            claimed_at=func.now()
        )
        .returning(UserChallenge.id)
    )
    
    # We need func from sqlalchemy
    from sqlalchemy import func
    res = await db.execute(stmt)
    if not res.scalar():
        return {"success": False, "error": "Already claimed or status changed"}

    # Award XP
    xp_res = await xp_service.award_xp(
        db=db,
        user_id=user_id,
        amount=challenge.xp_reward,
        source_type="challenge",
        source_id=challenge.id,
        description=f"Completed challenge: {challenge.title}"
    )
    
    return {
        "success": True,
        "challenge_title": challenge.title,
        "xp_awarded": challenge.xp_reward,
        "new_level": xp_res["new_level"],
        "leveled_up": xp_res["leveled_up"]
    }

async def get_user_challenges(
    db: AsyncSession,
    user_id: int,
    status: Optional[str] = None
) -> List[dict]:
    """Get all challenges for a user with their current progress."""
    query = (
        select(UserChallenge, Challenge)
        .join(Challenge, UserChallenge.challenge_id == Challenge.id)
        .where(UserChallenge.user_id == user_id)
    )
    
    if status:
        query = query.where(UserChallenge.status == status)
        
    result = await db.execute(query)
    rows = result.all()
    
    output = []
    for uc, c in rows:
        output.append({
            "user_challenge_id": uc.id,
            "challenge_id": c.id,
            "title": c.title,
            "description": c.description,
            "category": c.category,
            "target_count": c.target_count,
            "current_progress": uc.progress,
            "status": uc.status,
            "xp_reward": c.xp_reward,
            "icon": c.icon,
            "accent_color": c.accent_color,
            "completed_at": uc.completed_at
        })
    return output
