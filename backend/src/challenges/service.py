"""
Challenges Service — Orchestrates tracking, completion, and reward claiming.
"""
from typing import Dict, Any, Optional, List
from sqlalchemy import select, update, and_
from sqlalchemy.ext.asyncio import AsyncSession
from src.challenges.models import Challenge, UserChallenge
from src.users.models import User
from src.challenges.tracker import ChallengeTracker
from src.challenges import xp_service, schemas

async def get_user_xp_info(db: AsyncSession, user_id: int) -> dict:
    """Get current user's XP, level and progress towards next level.
    
    Delegates to xp_service.compute_level_progress — single source of truth.
    """
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()

    if not user:
        return {
            "current_xp": 0,
            "xp": 0,
            "level": 1,
            "next_level_xp": 100,
            "total_xp_earned": 0,
            "progress_percentage": 0,
            "rank": None,
        }

    progress = await xp_service.compute_level_progress(db, user)
    
    # Get all-time rank from Redis
    from src.db.redis import RedisClient
    redis = RedisClient.get_client()
    key = "leaderboard:alltime"
    v_rank = await redis.zrevrank(key, str(user_id))
    rank = (v_rank + 1) if v_rank is not None else None

    return {
        "current_xp": progress["xp_in_level"],
        "xp": progress["xp_in_level"],  # backward compat
        "level": user.level or 1,
        "next_level_xp": progress["xp_for_level"],
        "total_xp_earned": user.total_xp_earned or 0,
        "progress_percentage": progress["progress_pct"],
        "rank": rank,
    }

async def join_challenge(db: AsyncSession, user_id: int, challenge_id: int) -> dict:
    """Enroll a user in a challenge if not already enrolled."""
    # Check if challenge exists
    res = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
    challenge = res.scalar_one_or_none()
    
    if not challenge:
        return {"success": False, "error": "Challenge not found"}
        
    # Check if already joined
    res = await db.execute(
        select(UserChallenge).where(
            and_(
                UserChallenge.user_id == user_id,
                UserChallenge.challenge_id == challenge_id
            )
        )
    )
    user_challenge = res.scalar_one_or_none()
    
    if user_challenge:
        return {"success": True, "message": "Already joined", "user_challenge_id": user_challenge.id}
        
    # Create new entry
    user_challenge = UserChallenge(
        user_id=user_id,
        challenge_id=challenge_id,
        progress=0,
        status="active"
    )
    db.add(user_challenge)
    await db.commit()
    await db.refresh(user_challenge)
    
    return {
        "success": True, 
        "message": "Joined successfully", 
        "user_challenge_id": user_challenge.id
    }

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
    
    # Award Badge if applicable
    badge_awarded = None
    if challenge.badge_id:
        from src.gamification.service import award_badge
        res_badge = await award_badge(db, user_id, challenge.badge_id)
        if res_badge.get("status") == "awarded":
            badge_awarded = challenge.badge_id
            
    return {
        "success": True,
        "challenge_title": challenge.title,
        "xp_awarded": challenge.xp_reward,
        "new_level": xp_res["new_level"],
        "leveled_up": xp_res["leveled_up"],
        "badge_awarded": badge_awarded
    }

async def get_user_challenges(
    db: AsyncSession,
    user_id: int,
    status: Optional[str] = None
) -> List[dict]:
    """
    Get all active challenges for a user, merging templates with existing progress.
    Implements 'Frictionless UX': Every active template is returned even if not joined.
    """
    # 1. Fetch all active challenge templates
    template_query = select(Challenge).where(Challenge.is_active == True)
    template_res = await db.execute(template_query)
    templates = template_res.scalars().all()
    
    # 2. Fetch user's actual progress records
    progress_query = select(UserChallenge).where(UserChallenge.user_id == user_id)
    progress_res = await db.execute(progress_query)
    user_progress = {row.challenge_id: row for row in progress_res.scalars().all()}
    
    output = []
    
    for c in templates:
        uc = user_progress.get(c.id)
        
        # If status filter is applied and mismatch, skip
        current_status = uc.status if uc else "active"
        if status and status != current_status:
            continue
            
        progress_val = uc.progress if uc else 0
        
        output.append({
            "id": str(uc.id) if uc else f"temp_{c.id}",
            "challenge": {
                "id": str(c.id),
                "title": c.title,
                "description": c.description,
                "category": c.category,
                "difficulty": c.difficulty,
                "xp_reward": c.xp_reward,
                "target_count": c.target_count,
                "icon": c.icon,
                "accent_color": c.accent_color
            },
            "progress": progress_val,
            "target": c.target_count,
            "status": current_status,
            "percentage": min(int((progress_val / c.target_count) * 100), 100) if c.target_count > 0 else 0,
            "completed_at": uc.completed_at.isoformat() if uc and uc.completed_at else None,
            "claimed_at": uc.claimed_at.isoformat() if uc and uc.claimed_at else None,
            "expires_at": uc.expires_at.isoformat() if uc and uc.expires_at else None
        })
    
    return output

    return output


async def get_all_challenges_admin(db: AsyncSession) -> List[dict]:
    """Get all challenges with aggregated stats for admin dashboard."""
    from sqlalchemy import func
    
    # 1. Fetch all challenges
    query = select(Challenge).order_by(Challenge.created_at.desc())
    res = await db.execute(query)
    challenges = res.scalars().all()
    
    # 2. Get participant counts per challenge
    participant_query = (
        select(UserChallenge.challenge_id, func.count(UserChallenge.id).label("count"))
        .group_by(UserChallenge.challenge_id)
    )
    p_res = await db.execute(participant_query)
    participant_map = {row.challenge_id: row.count for row in p_res.fetchall()}
    
    # 3. Get completion counts per challenge (status='claimed' or 'completed')
    completion_query = (
        select(UserChallenge.challenge_id, func.count(UserChallenge.id).label("count"))
        .where(UserChallenge.status.in_(["completed", "claimed"]))
        .group_by(UserChallenge.challenge_id)
    )
    c_res = await db.execute(completion_query)
    completion_map = {row.challenge_id: row.count for row in c_res.fetchall()}
    
    output = []
    for c in challenges:
        p_count = participant_map.get(c.id, 0)
        c_count = completion_map.get(c.id, 0)
        c_rate = int((c_count / p_count * 100)) if p_count > 0 else 0
        
        output.append({
            "id": c.id,
            "title": c.title,
            "category": c.category,
            "difficulty": c.difficulty,
            "xp_reward": c.xp_reward,
            "is_active": c.is_active,
            "start_date": c.start_date.isoformat() if c.start_date else None,
            "end_date": c.end_date.isoformat() if c.end_date else None,
            "participants_count": p_count,
            "completion_rate": c_rate
        })
    
    return output


async def create_challenge(db: AsyncSession, schema: schemas.ChallengeCreate) -> Challenge:
    """Create a new challenge template."""
    challenge = Challenge(**schema.model_dump())
    db.add(challenge)
    await db.commit()
    await db.refresh(challenge)
    return challenge


async def get_challenge_by_id_admin(db: AsyncSession, challenge_id: int) -> Optional[dict]:
    """Get a single challenge with detailed stats for admin."""
    from sqlalchemy import func
    
    # Fetch challenge
    challenge = await db.get(Challenge, challenge_id)
    if not challenge:
        return None
        
    # Stats
    participant_query = (
        select(func.count(UserChallenge.id))
        .where(UserChallenge.challenge_id == challenge_id)
    )
    p_res = await db.execute(participant_query)
    p_count = p_res.scalar() or 0
    
    completion_query = (
        select(func.count(UserChallenge.id))
        .where(UserChallenge.challenge_id == challenge_id)
        .where(UserChallenge.status.in_(["completed", "claimed"]))
    )
    c_res = await db.execute(completion_query)
    c_count = c_res.scalar() or 0
    
    c_rate = int((c_count / p_count * 100)) if p_count > 0 else 0
    
    return {
        **schemas.ChallengeResponse.model_validate(challenge).model_dump(),
        "participants_count": p_count,
        "completion_rate": c_rate
    }


async def update_challenge(db: AsyncSession, challenge_id: int, schema: schemas.ChallengeUpdate) -> Optional[Challenge]:
    """Partially update a challenge."""
    challenge = await db.get(Challenge, challenge_id)
    if not challenge:
        return None
        
    update_data = schema.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(challenge, key, value)
        
    await db.commit()
    await db.refresh(challenge)
    return challenge


async def delete_challenge(db: AsyncSession, challenge_id: int) -> bool:
    """Delete a challenge and all its associations."""
    challenge = await db.get(Challenge, challenge_id)
    if not challenge:
        return False
        
    await db.delete(challenge)
    await db.commit()
    return True
