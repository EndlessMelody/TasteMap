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
        # BÚN: Logic mới - Fetch tất cả active Challenge templates matching action_type
        # Sau đó chúng ta sẽ tìm hoặc tạo UserChallenge record tương ứng.
        query = (
            select(Challenge)
            .where(
                and_(
                    Challenge.action_type == action_type,
                    Challenge.is_active == True
                )
            )
        )
        result = await db.execute(query)
        challenges = result.scalars().all()

        for challenge in challenges:
            # 3. Kiểm tra filter (Python-side matching)
            if not matches_filter(challenge.action_filter, metadata):
                continue

            # 4. Tìm hoặc tạo UserChallenge (Auto-enrollment)
            uc_query = select(UserChallenge).where(
                and_(
                    UserChallenge.user_id == user_id,
                    UserChallenge.challenge_id == challenge.id
                )
            )
            uc_result = await db.execute(uc_query)
            user_challenge = uc_result.scalar_one_or_none()

            if not user_challenge:
                # Lazy Create
                user_challenge = UserChallenge(
                    user_id=user_id,
                    challenge_id=challenge.id,
                    progress=0,
                    status="active"
                )
                db.add(user_challenge)
                # Flush to get ID if needed, but we can just use the object
                await db.flush()
            elif user_challenge.status != "active":
                # Only track for active challenges
                continue

            # 5. Kiểm tra deduplication (đã tính cho entity này chưa?)
            if ref_id and ref_type:
                if await ChallengeTracker._is_already_tracked(db, user_id, challenge.id, ref_type, ref_id):
                    continue

            # 6. Cập nhật tiến độ ATOMIC SQL
            # SET progress = progress + 1
            user_challenge.progress += 1
            user_challenge.last_progress_at = func.now()

            # 7. Ghi log tiến độ (Audit trail + Dedup source)
            progress_log = ChallengeProgressLog(
                user_id=user_id,
                challenge_id=challenge.id,
                action_type=action_type,
                action_ref_type=ref_type,
                action_ref_id=ref_id,
                delta=1
            )
            db.add(progress_log)

            # 8. Kiểm tra hoàn thành
            if user_challenge.progress >= challenge.target_count:
                user_challenge.status = "completed"
                user_challenge.completed_at = func.now()
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
        result = await db.execute(count_query)
        count = result.scalar()
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
