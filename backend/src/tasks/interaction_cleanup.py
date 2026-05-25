"""
Interaction Cleanup Cronjob
Chạy lúc 3:00 AM mỗi ngày:
1. Aggregate: Gom cụm hành vi user trong tháng cũ → blend vào vector hiện tại.
2. Purge: Xoá raw interactions > 30 ngày.

Cách tích hợp: Gọi schedule_cleanup(app) trong lifespan của FastAPI.
APScheduler đủ cho scope đồ án — không cần Celery.
"""
import asyncio
import logging
from datetime import datetime, timedelta, timezone

import numpy as np
from sqlalchemy.future import select
from sqlalchemy import delete, func

from src.db.database import AsyncSessionLocal
from src.users.models import User
from src.interactions.models import Interaction
from src.locations.models import Location

logger = logging.getLogger(__name__)

# Tỉ lệ blend: U = BLEND_KEEP * U_current + BLEND_HISTORY * U_monthly_summary
BLEND_KEEP = 0.9
BLEND_HISTORY = 0.1
PURGE_DAYS = 30


async def _aggregate_and_purge():
    """
    Core logic:
    1. Tìm tất cả user có interaction cũ hơn 30 ngày.
    2. Với mỗi user: lấy vector các location đã LIKED trong tháng cũ,
       tính weighted average → blend vào user vector hiện tại.
    3. Xoá raw interactions cũ hơn 30 ngày.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=PURGE_DAYS)

    async with AsyncSessionLocal() as session:
        # --- Bước 1: Tìm user có interaction cũ ---
        user_ids_result = await session.execute(
            select(Interaction.user_id)
            .where(Interaction.timestamp < cutoff)
            .distinct()
        )
        user_ids = [row[0] for row in user_ids_result.all()]

        if not user_ids:
            logger.info("Không có interaction cũ cần aggregate.")
            return

        logger.info(f" Aggregate cho {len(user_ids)} users...")

        for uid in user_ids:
            try:
                await _aggregate_user(session, uid, cutoff)
            except Exception as e:
                logger.error(f"Lỗi aggregate user {uid}: {e}")
                continue

        # --- Bước 3: Purge raw data ---
        delete_stmt = delete(Interaction).where(Interaction.timestamp < cutoff)
        result = await session.execute(delete_stmt)
        await session.commit()

        logger.info(f"Đã purge {result.rowcount} interactions cũ hơn {PURGE_DAYS} ngày.")


async def _aggregate_user(session, user_id: int, cutoff: datetime):
    """Aggregate interaction history cho 1 user, blend vào vector."""
    user = await session.scalar(select(User).filter(User.id == user_id))
    if not user:
        return

    for domain in ["food", "place"]:
        # Lấy tất cả LIKED interactions trong khoảng cũ
        liked_interactions = await session.execute(
            select(Interaction.location_id)
            .where(
                Interaction.user_id == user_id,
                Interaction.action == "LIKED",
                Interaction.timestamp < cutoff,
            )
            .join(Location, Interaction.location_id == Location.id)
            .where(Location.category == domain)
        )
        liked_location_ids = [row[0] for row in liked_interactions.all()]

        if not liked_location_ids:
            continue

        # Lấy vectors của các location đã LIKED
        loc_result = await session.execute(
            select(Location.vector)
            .where(Location.id.in_(liked_location_ids))
            .where(Location.vector.isnot(None))
        )
        vectors = []
        for (vec,) in loc_result.all():
            if vec is not None:
                arr = np.array(vec, dtype=float)
                if len(arr) == 15:
                    vectors.append(arr)

        if not vectors:
            continue

        # Weighted average → monthly summary vector
        # input shape: (N, 15), output shape: (15,)
        monthly_summary = np.mean(vectors, axis=0)

        # Blend vào vector hiện tại
        current_vec = np.array(
            user.food_vector if domain == "food" else user.place_vector,
            dtype=float
        )
        # U = 0.9 * U_current + 0.1 * U_monthly_summary
        blended = BLEND_KEEP * current_vec + BLEND_HISTORY * monthly_summary
        blended = np.clip(blended, 0.0, 1.0)

        updated = [round(float(x), 4) for x in blended]
        if domain == "food":
            user.food_vector = updated
        else:
            user.place_vector = updated

    await session.commit()


def schedule_cleanup(app):
    """
    Tích hợp vào FastAPI lifespan.
    Sử dụng APScheduler nếu có, fallback sang asyncio loop nếu không.

    Usage trong main.py lifespan:
        from src.tasks.interaction_cleanup import schedule_cleanup
        schedule_cleanup(app)
    """
    try:
        from apscheduler.schedulers.asyncio import AsyncIOScheduler
        scheduler = AsyncIOScheduler()
        scheduler.add_job(
            _aggregate_and_purge,
            "cron",
            hour=3,
            minute=0,
            id="interaction_cleanup",
            replace_existing=True,
        )
        scheduler.start()
        logger.info("APScheduler: Cronjob cleanup đã lên lịch 3:00 AM hàng ngày.")
    except ImportError:
        logger.warning(
            "APScheduler chưa cài — cronjob cleanup không hoạt động. "
            "Chạy: pip install apscheduler"
        )
