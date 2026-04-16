"""
XP Service — Handles awarding XP, leveling logic, and Redis leaderboard synchronization.
"""
import math
from datetime import datetime
from sqlalchemy import update, select
from sqlalchemy.ext.asyncio import AsyncSession
from src.users.models import User
from src.challenges.models import XpTransaction
from src.db.redis import RedisClient

def get_xp_threshold(level: int) -> int:
    """Calculate XP required to pass CURRENT level."""
    base = 100
    growth = 1.15
    return int(base * (growth ** (level - 1)))

async def award_xp(
    db: AsyncSession,
    user_id: int,
    amount: int,
    source_type: str,
    source_id: str = None,
    description: str = None
) -> dict:
    """
    Award XP to a user with atomic SQL updates and Redis dual-write.
    CRITICAL: Uses update().returning() for concurrency safety.
    """
    if amount <= 0:
        return {"amount": 0, "leveled_up": False}

    # 1. Fetch current status (to calculate level ups)
    # We do a SELECT first to get current state, but the UPDATE itself is atomic.
    # To handle multiple level ups in one go, we need the current total.
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one()

    old_level = user.level
    new_total_xp = user.total_xp_earned + amount
    
    # 2. Level up logic
    current_level = old_level
    current_threshold = user.next_level_xp
    
    # Check for multiple level ups
    temp_total = user.total_xp_earned + amount
    while temp_total >= current_threshold:
        # We don't subtract from total, we just increase the threshold for the next level
        # Total XP is cumulative.
        # Actually, let's redefine: total_xp_earned is the target.
        # Level 1: 0-99 XP. Level 2: 100-214 XP.
        # So threshold to reach Level L+1 is Sum(xp_for_level(i) for i in 1..L)
        current_level += 1
        current_threshold += get_xp_threshold(current_level)

    leveled_up = current_level > old_level

    # 3. Atomic UPDATE
    stmt = (
        update(User)
        .where(User.id == user_id)
        .values(
            total_xp_earned=User.total_xp_earned + amount,
            level=current_level,
            next_level_xp=current_threshold
        )
        .returning(User.total_xp_earned, User.level)
    )
    result = await db.execute(stmt)
    updated_total, updated_level = result.fetchone()

    # 4. Log Transaction
    transaction = XpTransaction(
        user_id=user_id,
        amount=amount,
        source_type=source_type,
        source_id=source_id,
        description=description,
        balance_after=updated_total,
        level_after=updated_level
    )
    db.add(transaction)
    
    # Commit DB changes before triggering Redis
    await db.commit()

    # 5. Redis Dual-Write (Leaderboards)
    try:
        redis = RedisClient.get_client()
        now = datetime.utcnow()
        year_month = now.strftime("%Y-%m")
        year_week = now.strftime("%Y-W%U")
        
        # Keys
        all_time_key = "leaderboard:alltime"
        monthly_key = f"leaderboard:monthly:{year_month}"
        weekly_key = f"leaderboard:weekly:{year_week}"

        pipe = redis.pipeline()
        pipe.zincrby(all_time_key, amount, str(user_id))
        pipe.zincrby(monthly_key, amount, str(user_id))
        pipe.zincrby(weekly_key, amount, str(user_id))
        await pipe.execute()
    except Exception as e:
        # Don't fail the whole request if Redis is down, but log it
        print(f"Leaderboard Sync Error: {e}")

    return {
        "amount": amount,
        "new_total": updated_total,
        "new_level": updated_level,
        "leveled_up": leveled_up
    }
