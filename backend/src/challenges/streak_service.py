"""
Streak Service — Handles daily check-ins, streak maintenance, and timezone-aware calculations.
"""
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.challenges.models import UserStreak
from src.challenges import xp_service

async def get_or_create_streak(db: AsyncSession, user_id: int) -> UserStreak:
    """Get user's streak info or create a default one."""
    res = await db.execute(select(UserStreak).where(UserStreak.user_id == user_id))
    streak = res.scalar_one_or_none()
    
    if not streak:
        streak = UserStreak(user_id=user_id, current_streak=0, longest_streak=0)
        db.add(streak)
        await db.flush() # Get ID without committing
    return streak

async def checkin(db: AsyncSession, user_id: int) -> dict:
    """
    Handle user check-in.
    Logic:
    - Already checkin today -> No XP, but return status.
    - Checkin yesterday -> Increment streak + award XP.
    - Checkin before yesterday -> Reset streak to 1 + award XP.
    """
    streak = await get_or_create_streak(db, user_id)
    
    # Calculate local "today" using timezone_offset
    now_utc = datetime.now(timezone.utc)
    local_now = now_utc + timedelta(hours=streak.timezone_offset)
    today = local_now.date()
    
    last_date = streak.last_active_date.date()
    
    if last_date == today and streak.current_streak > 0:
        return {
            "status": "already_checked_in",
            "current_streak": streak.current_streak,
            "xp_awarded": 0
        }
    
    yesterday = today - timedelta(days=1)
    xp_amount = 10 # Base XP for login
    
    if last_date == yesterday:
        # Continue streak
        streak.current_streak += 1
        # Bonus XP for longer streaks
        bonus = min(streak.current_streak, 50) # Cap bonus at 50 XP
        xp_amount += bonus
    else:
        # Streak broken or first time
        streak.current_streak = 1
    
    # Update high scores
    if streak.current_streak > streak.longest_streak:
        streak.longest_streak = streak.current_streak
        
    streak.last_active_date = local_now
    
    # Award XP
    xp_res = await xp_service.award_xp(
        db=db,
        user_id=user_id,
        amount=xp_amount,
        source_type="streak_bonus",
        description=f"Daily check-in streak: {streak.current_streak}"
    )
    
    await db.commit()
    
    return {
        "status": "success",
        "current_streak": streak.current_streak,
        "xp_awarded": xp_amount,
        "leveled_up": xp_res["leveled_up"]
    }
