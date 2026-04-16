from datetime import datetime
from sqlalchemy import update, select
from sqlalchemy.ext.asyncio import AsyncSession
from src.users.models import User
from src.challenges.models import XpTransaction, LevelConfig
from src.db.redis import RedisClient

async def get_level_config(db: AsyncSession, level: int):
    """Fetch config for a specific level."""
    res = await db.execute(select(LevelConfig).where(LevelConfig.level == level))
    return res.scalar_one_or_none()

async def award_xp(
    db: AsyncSession,
    user_id: int,
    amount: int,
    source_type: str,
    source_id: str = None,
    description: str = None
) -> dict:
    """
    Award XP to a user with dynamic leveling based on LevelConfig.
    """
    if amount <= 0:
        return {"amount": 0, "leveled_up": False}

    # 1. Fetch current status
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one()

    old_level = user.level or 1
    old_total = user.total_xp_earned or 0
    new_total_xp = old_total + amount
    
    # 2. Level up logic using LevelConfig
    current_level = old_level
    # next_level_xp stores the TOTAL CUMULATIVE XP required to reach Level L+1
    current_threshold = user.next_level_xp or 100
    
    # Check if we need to advance levels
    while new_total_xp >= current_threshold:
        current_level += 1
        # Fetch the requirement for the NEW level to reach the one after it
        next_config = await get_level_config(db, current_level)
        if not next_config:
            # Reached max level or missing config
            break
        current_threshold += next_config.xp_required

    leveled_up = current_level > old_level

    # 3. Atomic UPDATE
    stmt = (
        update(User)
        .where(User.id == user_id)
        .values(
            total_xp_earned=new_total_xp,
            xp=User.xp + amount, # Current XP in level (optional field, but we use total mostly)
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
