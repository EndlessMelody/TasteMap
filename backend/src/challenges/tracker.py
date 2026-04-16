from datetime import datetime, timezone, date
from typing import Dict, Any, Optional, List
from sqlalchemy import select, update, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.challenges.models import Challenge, UserChallenge, ChallengeProgressLog


class ChallengeTracker:
    """
    Hệ thống tự động theo dõi tiến độ thử thách (Challenges Tracking Engine).
    """

    DAILY_CAPS = {
        "post_create": 5,
        "post_with_photo": 5,
        "reel_create": 3,
        "receive_likes": 50,
        "review_create": 5,
        "daily_login": 1
    }

    @staticmethod
    async def track_action(
        db: AsyncSession,
        user_id: int,
        action_type: str,
        ref_type: Optional[str] = None,
        ref_id: Optional[int] = None,
        metadata: Dict[str, Any] = None
    ):
        """
        Ghi nhận một hành động của người dùng và cập nhật các thử thách liên quan.
        
        Args:
            db: AsyncSession database
            user_id: ID người dùng
            action_type: Loại hành động (VD: post_create)
            ref_type: Loại entity liên kết (VD: post)
            ref_id: ID của entity (để chống trùng lặp)
            metadata: Thông tin bổ sung để lọc (VD: {"has_photo": True})
        """
        metadata = metadata or {}
        today = datetime.now(timezone.utc).date()

        # 1. Kiểm tra daily cap (ngăn farm XP)
        if not await ChallengeTracker._check_daily_cap(db, user_id, action_type, today):
            return

        # 2. Lấy danh sách thử thách CÓ THỂ bị ảnh hưởng (dựa trên action_type và status active)
        # Chỉ fetch những challenge mà user đang tham gia và có status 'active'
        query = (
            select(UserChallenge, Challenge)
            .join(Challenge, UserChallenge.challenge_id == Challenge.id)
            .where(
                and_(
                    UserChallenge.user_id == user_id,
                    UserChallenge.status == "active",
                    Challenge.action_type == action_type,
                    Challenge.is_active == True
                )
            )
        )
        result = await db.execute(query)
        active_user_challenges = result.all()

        for user_challenge, challenge in active_user_challenges:
            # 3. Kiểm tra filter (Python-side matching)
            if not matches_filter(challenge.action_filter, metadata):
                continue

            # 4. Kiểm tra deduplication (đã tính cho entity này chưa?)
            if ref_id and ref_type:
                if await ChallengeTracker._is_already_tracked(db, user_id, challenge.id, ref_type, ref_id):
                    continue

            # 5. Cập nhật tiến độ ATOMIC SQL
            # SET progress = progress + 1
            stmt = (
                update(UserChallenge)
                .where(UserChallenge.id == user_challenge.id)
                .values(
                    progress=UserChallenge.progress + 1,
                    last_progress_at=func.now()
                )
                .returning(UserChallenge.progress)
            )
            res = await db.execute(stmt)
            new_progress = res.scalar()

            # 6. Ghi log tiến độ (Audit trail + Dedup source)
            progress_log = ChallengeProgressLog(
                user_id=user_id,
                challenge_id=challenge.id,
                action_type=action_type,
                action_ref_type=ref_type,
                action_ref_id=ref_id,
                delta=1
            )
            db.add(progress_log)

            # 7. Kiểm tra hoàn thành
            if new_progress >= challenge.target_count:
                # Đánh dấu hoàn thành
                await db.execute(
                    update(UserChallenge)
                    .where(UserChallenge.id == user_challenge.id)
                    .values(
                        status="completed",
                        completed_at=func.now()
                    )
                )
                # TODO: Gửi notification cho user

        await db.commit()

    @staticmethod
    async def _is_already_tracked(
        db: AsyncSession,
        user_id: int,
        challenge_id: int,
        ref_type: str,
        ref_id: int
    ) -> bool:
        """Kiểm tra xem entity này đã được tính progress cho challenge này chưa."""
        query = select(ChallengeProgressLog.id).where(
            and_(
                ChallengeProgressLog.user_id == user_id,
                ChallengeProgressLog.challenge_id == challenge_id,
                ChallengeProgressLog.action_ref_type == ref_type,
                ChallengeProgressLog.action_ref_id == ref_id
            )
        ).limit(1)
        res = await db.execute(query)
        return res.scalar_one_or_none() is not None

    @staticmethod
    async def _check_daily_cap(
        db: AsyncSession,
        user_id: int,
        action_type: str,
        today: date
    ) -> bool:
        """Kiểm tra giới hạn số lần thực hiện hành động tính điểm trong ngày."""
        cap = ChallengeTracker.DAILY_CAPS.get(action_type)
        if cap is None:
            return True
            
        count_query = select(func.count(ChallengeProgressLog.id)).where(
            and_(
                ChallengeProgressLog.user_id == user_id,
                ChallengeProgressLog.action_type == action_type,
                func.date(ChallengeProgressLog.created_at) == today
            )
        )
        count = await db.scalar(count_query)
        return count < cap


def matches_filter(action_filter: Optional[dict], metadata: dict) -> bool:
    """
    Hàm so khớp metadata của hành động với action_filter của thử thách.
    Logic được thực hiện ở RAM (Python side) để giảm tải cho DB.
    """
    if not action_filter:
        return True
    
    # VD: "time_after": "21:00"
    if "time_after" in action_filter:
        action_hour = metadata.get("hour", 0)
        cutoff_hour = int(action_filter["time_after"].split(":")[0])
        if action_hour < cutoff_hour:
            return False
            
    # VD: "require_photo": True
    if action_filter.get("require_photo"):
        if not metadata.get("has_photo"):
            return False
            
    # VD: "cuisine_type": "Japanese"
    if "cuisine_type" in action_filter:
        if metadata.get("cuisine_type") != action_filter["cuisine_type"]:
            return False

    # VD: Tag matching
    if "tags" in action_filter:
        required_tags = set(action_filter["tags"])
        actual_tags = set(metadata.get("tags", []))
        if not required_tags.issubset(actual_tags):
            return False

    return True
