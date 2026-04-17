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


async def compute_level_progress(db: AsyncSession, user) -> dict:
    """
    Shared helper — Tính XP tương đối trong cấp độ hiện tại.

    Phân biệt rõ 4 khái niệm:
      - total_xp_earned:         Tổng XP tích lũy từ trước đến nay (absolute)
      - base_xp_of_current_level: Ngưỡng tổng XP để đạt level hiện tại
      - xp_in_level (current_xp): XP đã đi được trong level này = total - base
      - xp_for_level (next_level_xp): XP cần để lên level tiếp = next_threshold - base

    Returns dict:
      xp_in_level   → dùng làm UserMe.xp / UserProfile.xp
      xp_for_level  → dùng làm UserMe.next_level_xp / UserProfile.next_level_xp
      progress_pct  → phần trăm tiến độ chuẩn (0–100)
    """
    total_xp = user.total_xp_earned or 0
    current_level = user.level or 1
    next_level_total_threshold = user.next_level_xp or 100  # Cumulative threshold in DB

    # Lấy config của level hiện tại để biết xp_required riêng của cấp này
    config = await get_level_config(db, current_level)

    if config:
        xp_for_level = config.xp_required
        base_xp_of_current_level = next_level_total_threshold - xp_for_level
    else:
        # Fallback nếu không có config: coi toàn bộ ngưỡng là XP cần trong level này
        base_xp_of_current_level = 0
        xp_for_level = max(next_level_total_threshold, 100)

    if total_xp >= next_level_total_threshold:
        # Max level hoặc chờ level-up → hiển thị 100%
        return {
            "xp_in_level": xp_for_level,
            "xp_for_level": xp_for_level,
            "progress_pct": 100,
        }

    xp_in_level = max(0, total_xp - base_xp_of_current_level)
    progress_pct = (
        min(int((xp_in_level / xp_for_level) * 100), 100)
        if xp_for_level > 0 else 0
    )

    return {
        "xp_in_level": xp_in_level,
        "xp_for_level": xp_for_level,
        "progress_pct": progress_pct,
    }

async def award_xp(
    db: AsyncSession,
    user_id: int,
    amount: int,
    source_type: str,
    source_id: str = None,
    description: str = None
) -> dict:
    """
    Award XP to a user.
    Optimized to compute level jumps in RAM with a single DB query for configs.
    """
    if amount <= 0:
        return {"amount": 0, "leveled_up": False}

    # 1. Fetch current user state
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one()

    old_level = user.level or 1
    old_total_xp = user.total_xp_earned or 0
    new_total_xp = old_total_xp + amount
    
    current_level = old_level
    current_threshold = user.next_level_xp or 100 # Ngưỡng tích lũy để lên L+1

    leveled_up = False

    # 2. Level Up Logic - Tính toán trên RAM
    if new_total_xp >= current_threshold:
        # Thay vì query N lần trong vòng lặp, ta lấy 1 lần tất cả các level cao hơn
        config_query = select(LevelConfig).where(LevelConfig.level > current_level).order_by(LevelConfig.level.asc())
        configs_res = await db.execute(config_query)
        higher_configs = configs_res.scalars().all()

        for config in higher_configs:
            if new_total_xp >= current_threshold:
                current_level = config.level
                current_threshold += config.xp_required
            else:
                break
                
        # Xử lý Edge Case: Chạm Max Level
        if new_total_xp >= current_threshold:
            # Nếu chạy hết list config mà XP vẫn dư -> Max Level. 
            # Ép threshold bằng new_total_xp để Progress Bar UI luôn hiển thị 100% (không bị tràn)
            current_threshold = new_total_xp 

    leveled_up = current_level > old_level

    # 3. Atomic UPDATE
    stmt = (
        update(User)
        .where(User.id == user_id)
        .values(
            total_xp_earned=new_total_xp,
            level=current_level,
            next_level_xp=current_threshold
        )
        .returning(User.total_xp_earned, User.level)
    )
    result = await db.execute(stmt)
    updated_total, updated_level = result.fetchone()

    # 4. Ghi Log Transaction
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
    
    # 5. Commit dữ liệu cứng trước khi đồng bộ sang Redis (Tránh Race Condition)
    await db.commit()

    # 6. Redis Dual-Write (High Performance Leaderboard Sync)
    try:
        redis = RedisClient.get_client()
        now = datetime.utcnow()
        
        # Key patterns matched with leaderboard_service.py
        month_key = f"leaderboard:monthly:{now.strftime('%Y-%m')}"
        week_key = f"leaderboard:weekly:{now.strftime('%Y-W%U')}"
        alltime_key = "leaderboard:alltime"

        pipe = redis.pipeline()
        
        # 1. Update All-time leaderboard (Absolute value)
        pipe.zadd(alltime_key, {str(user_id): new_total_xp})
        
        # 2. Update Period leaderboards (Incremental values)
        pipe.zincrby(month_key, float(amount), str(user_id))
        pipe.zincrby(week_key, float(amount), str(user_id))
        
        # 3. Set expiry for period keys to keep Redis clean (optional)
        pipe.expire(month_key, 60*60*24*60) # 60 days
        pipe.expire(week_key, 60*60*24*14)  # 14 days
        
        await pipe.execute()
    except Exception as e:
        print(f"Leaderboard Sync Error: {e}")

    return {
        "amount": amount,
        "new_total": updated_total,
        "new_level": updated_level,
        "leveled_up": leveled_up
    }
