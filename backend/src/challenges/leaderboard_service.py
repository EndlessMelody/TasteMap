"""
Leaderboard Service — High-performance ranking using Redis ZSETs + SQL hydration.
"""
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.users.models import User
from src.db.redis import RedisClient

async def get_leaderboard(
    db: AsyncSession,
    period: str = "alltime",
    limit: int = 20,
    viewer_id: int = None
) -> dict:
    """
    Get leaderboard for a specific period (alltime, monthly, weekly).
    Logic:
    1. Determine Redis key based on period.
    2. ZREVRANGE to get top user IDs and scores.
    3. Hydrate User data from DB.
    4. Fetch viewer rank if viewer_id provided.
    """
    redis = RedisClient.get_client()
    now = datetime.utcnow()
    
    if period == "monthly":
        key = f"leaderboard:monthly:{now.strftime('%Y-%m')}"
    elif period == "weekly":
        key = f"leaderboard:weekly:{now.strftime('%Y-W%U')}"
    else:
        key = "leaderboard:alltime"

    # 1. Get top scorers from Redis
    # Note: aioredis/redis-py returns List[Tuple[str, float]]
    top_results = await redis.zrevrange(key, 0, limit - 1, withscores=True)
    
    if not top_results:
        return {"items": [], "viewer_rank": None}

    user_ids = [int(r[0]) for r in top_results]
    scores_map = {int(r[0]): int(r[1]) for r in top_results}

    # 2. Hydrate from DB
    res = await db.execute(
        select(User.id, User.username, User.display_name, User.avatar_url, User.level)
        .where(User.id.in_(user_ids))
    )
    users = res.all()
    
    # Sort hydrated users according to Redis order
    user_data_map = {u.id: u for u in users}
    
    items = []
    for i, user_id in enumerate(user_ids):
        u = user_data_map.get(user_id)
        if not u: continue
        
        items.append({
            "rank": i + 1,
            "user_id": u.id,
            "username": u.username,
            "display_name": u.display_name,
            "avatar_url": u.avatar_url,
            "level": u.level,
            "xp": scores_map[user_id]
        })

    # 3. Viewer Rank
    viewer_rank_data = None
    if viewer_id:
        v_rank = await redis.zrevrank(key, str(viewer_id))
        if v_rank is not None:
            v_score = await redis.zscore(key, str(viewer_id))
            viewer_rank_data = {
                "rank": v_rank + 1,
                "xp": int(v_score)
            }

    return {
        "items": items,
        "viewer_rank": viewer_rank_data,
        "period": period,
        "key_used": key
    }
