"""
Users Service — extended with profile, stats, top-spots, settings.
"""
import json
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_
import redis.asyncio as aioredis
from typing import Optional, List

from src.users.models import User
from src.users.schemas import UserCreate, UserUpdate, UserStats, BadgeSummary, UserProfile, UserMe
from src.posts.models import Post
from src.bookmarks.models import Bookmark
from src.social.models import Friendship
from src.gamification.models import UserBadge, Badge
from src.challenges.xp_service import compute_level_progress


class UserService:
    def __init__(self, db: AsyncSession, redis: Optional[aioredis.Redis] = None):
        self.db = db
        self.redis = redis

    # ─── Helpers ──────────────────────────────────────────────────────────

    async def _get_user_or_404(self, user_id: int) -> User:
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
        return user

    async def _compute_stats(self, user_id: int) -> UserStats:
        reviews_q = await self.db.execute(
            select(func.count()).select_from(Post).where(Post.user_id == user_id)
        )
        visited_q = await self.db.execute(
            select(func.count()).select_from(Bookmark).where(Bookmark.user_id == user_id)
        )
        followers_q = await self.db.execute(
            select(func.count()).select_from(Friendship).where(
                Friendship.friend_id == user_id, Friendship.status == "accepted"
            )
        )
        following_q = await self.db.execute(
            select(func.count()).select_from(Friendship).where(
                Friendship.user_id == user_id, Friendship.status == "accepted"
            )
        )
        return UserStats(
            reviews=reviews_q.scalar_one() or 0,
            visited=visited_q.scalar_one() or 0,
            followers=followers_q.scalar_one() or 0,
            following=following_q.scalar_one() or 0,
        )

    async def _get_badges(self, user_id: int) -> List[BadgeSummary]:
        result = await self.db.execute(
            select(Badge, UserBadge.earned_at)
            .join(UserBadge, UserBadge.badge_id == Badge.id)
            .where(UserBadge.user_id == user_id)
        )
        rows = result.all()
        return [
            BadgeSummary(
                id=b.id,
                name=b.name,
                description=b.description,
                icon_name=b.icon_name,
                rarity=b.rarity,
                accent_color=b.accent_color,
                is_hidden=b.is_hidden,
                earned_at=earned_at
            ) for b, earned_at in rows
        ]

    # ─── Public API ───────────────────────────────────────────────────────

    async def get_user_by_id(self, user_id: int) -> User:
        return await self._get_user_or_404(user_id)

    async def get_profile(self, user_id: int) -> UserProfile:
        user = await self._get_user_or_404(user_id)
        stats = await self._compute_stats(user_id)
        badges = await self._get_badges(user_id)
        progress = await compute_level_progress(self.db, user)
        return UserProfile(
            id=user.id,
            username=user.username,
            display_name=user.display_name,
            avatar_url=user.avatar_url,
            bio=user.bio,
            cover_url=user.cover_url,
            location=user.location,
            title=user.title,
            xp=progress["xp_in_level"],
            level=user.level or 1,
            next_level_xp=progress["xp_for_level"],
            total_xp_earned=user.total_xp_earned or 0,
            created_at=user.created_at,
            stats=stats,
            badges=badges,
        )

    async def get_me(self, user_id: int) -> UserMe:
        user = await self._get_user_or_404(user_id)
        stats = await self._compute_stats(user_id)
        badges = await self._get_badges(user_id)
        progress = await compute_level_progress(self.db, user)
        return UserMe(
            id=user.id,
            username=user.username,
            email=user.email,
            display_name=user.display_name,
            avatar_url=user.avatar_url,
            bio=user.bio,
            cover_url=user.cover_url,
            location=user.location,
            title=user.title,
            phone=user.phone,
            xp=progress["xp_in_level"],
            level=user.level or 1,
            next_level_xp=progress["xp_for_level"],
            total_xp_earned=user.total_xp_earned or 0,
            food_vector=list(user.food_vector) if user.food_vector is not None else None,
            place_vector=list(user.place_vector) if user.place_vector is not None else None,
            settings=user.settings or {},
            created_at=user.created_at,
            stats=stats,
            badges=badges,
        )

    async def update_me(self, user_id: int, data: UserUpdate) -> UserMe:
        user = await self._get_user_or_404(user_id)
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        try:
            await self.db.commit()
            await self.db.refresh(user)
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(status_code=400, detail=str(e))
        return await self.get_me(user_id)

    async def get_social_context(self, viewer_id: int, target_id: int) -> dict:
        """Return friendship status, mutual friends, and target food vector for the profile page."""
        # Friendship status
        fs_res = await self.db.execute(
            select(Friendship).where(
                or_(
                    (Friendship.user_id == viewer_id) & (Friendship.friend_id == target_id),
                    (Friendship.user_id == target_id) & (Friendship.friend_id == viewer_id),
                )
            )
        )
        fs = fs_res.scalars().first()
        if fs is None:
            friendship_status = "none"
            friendship_id = None
        elif fs.status == "accepted":
            friendship_status = "accepted"
            friendship_id = fs.id
        elif fs.status == "blocked":
            friendship_status = "blocked"
            friendship_id = fs.id
        elif fs.user_id == viewer_id:
            friendship_status = "pending_sent"
            friendship_id = fs.id
        else:
            friendship_status = "pending_received"
            friendship_id = fs.id

        # Target user food vector
        target_res = await self.db.execute(select(User).where(User.id == target_id))
        target = target_res.scalars().first()
        food_vector = list(target.food_vector) if target and target.food_vector is not None else None

        # Mutual friends
        def _friend_ids(rows, me):
            return {fs.friend_id if fs.user_id == me else fs.user_id for fs in rows}

        viewer_fs = (await self.db.execute(
            select(Friendship).where(
                or_(Friendship.user_id == viewer_id, Friendship.friend_id == viewer_id),
                Friendship.status == "accepted",
            )
        )).scalars().all()
        target_fs = (await self.db.execute(
            select(Friendship).where(
                or_(Friendship.user_id == target_id, Friendship.friend_id == target_id),
                Friendship.status == "accepted",
            )
        )).scalars().all()

        mutual_ids = _friend_ids(viewer_fs, viewer_id) & _friend_ids(target_fs, target_id)
        mutual_friends = []
        if mutual_ids:
            mf_res = await self.db.execute(
                select(User).where(User.id.in_(list(mutual_ids))).limit(6)
            )
            for u in mf_res.scalars().all():
                mutual_friends.append({
                    "id": u.id,
                    "username": u.username,
                    "display_name": u.display_name,
                    "avatar_url": u.avatar_url,
                })

        return {
            "friendship_status": friendship_status,
            "friendship_id": friendship_id,
            "food_vector": food_vector,
            "mutual_friends_count": len(mutual_ids),
            "mutual_friends": mutual_friends,
        }

    async def get_top_spots(self, user_id: int, limit: int = 3) -> list:
        from src.locations.models import Location
        # Join bookmarks → locations, sorted by rating desc
        result = await self.db.execute(
            select(Location)
            .join(Bookmark, Bookmark.location_id == Location.id)
            .where(Bookmark.user_id == user_id)
            .order_by(Location.rating.desc())
            .limit(limit)
        )
        locations = result.scalars().all()
        return [{"id": loc.id, "name": loc.name, "image_url": loc.image_url, "rating": loc.rating} for loc in locations]

    async def create_user(self, user_create: UserCreate) -> User:
        """
        Đăng ký người dùng mới.
        Migrate vector từ Redis (guest) nếu có device_id.
        """
        food_vector: List[float] = [0.5] * 15
        place_vector: List[float] = [0.5] * 15

        if user_create.device_id and self.redis:
            for domain, is_food in [("food", True), ("place", False)]:
                redis_key = f"user:{domain}:{user_create.device_id}"
                raw = await self.redis.get(redis_key)
                if raw:
                    data = json.loads(raw)
                    recovered = data.get("vector")
                    if recovered and len(recovered) == 15:
                        if is_food:
                            food_vector = [float(x) for x in recovered]
                        else:
                            place_vector = [float(x) for x in recovered]

        new_user = User(
            username=user_create.username,
            email=user_create.email,
            password_hash=user_create.password,
            food_vector=food_vector,
            place_vector=place_vector,
        )
        self.db.add(new_user)
        try:
            await self.db.commit()
            await self.db.refresh(new_user)
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(status_code=400, detail=f"Không thể tạo người dùng: {str(e)}")

        if user_create.device_id and self.redis:
            for domain in ["food", "place"]:
                try:
                    await self.redis.delete(f"user:{domain}:{user_create.device_id}")
                except Exception:
                    pass

    async def get_or_create_supabase_user(self, supabase_uid: str, email: str, display_name: str = None, avatar_url: str = None) -> User:
        """
        JIT Provisioning: Trả về user từ DB nếu có supabase_uid, 
        nếu không thì tạo mới dựa vào email và UUID từ Supabase.
        """
        result = await self.db.execute(select(User).where(User.supabase_uid == supabase_uid))
        user = result.scalars().first()
        if user:
            return user

        # Check if user exists with same email but no supabase_uid
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        if user:
            user.supabase_uid = supabase_uid
            if display_name and not user.display_name:
                user.display_name = display_name
            if avatar_url and not user.avatar_url:
                user.avatar_url = avatar_url
            await self.db.commit()
            await self.db.refresh(user)
            return user

        # Create new user
        username = email.split("@")[0]
        # Ensure username uniqueness (naive approach)
        import random
        username = f"{username}_{random.randint(1000, 9999)}"
        
        new_user = User(
            username=username,
            email=email,
            supabase_uid=supabase_uid,
            display_name=display_name or username,
            avatar_url=avatar_url,
            food_vector=[0.5] * 15,
            place_vector=[0.5] * 15,
            level=1
        )
        self.db.add(new_user)
        try:
            await self.db.commit()
            await self.db.refresh(new_user)
            return new_user
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(status_code=400, detail=f"Không thể tạo người dùng JIT: {str(e)}")

    async def search_users(self, current_user_id: int, q: str, limit: int = 10) -> list:
        q = q.strip()
        if not q:
            return []
        pattern = f"%{q}%"
        result = await self.db.execute(
            select(User)
            .where(
                User.id != current_user_id,
                or_(User.username.ilike(pattern), User.display_name.ilike(pattern)),
            )
            .limit(limit)
        )
        users = result.scalars().all()

        items = []
        for u in users:
            fs_res = await self.db.execute(
                select(Friendship).where(
                    or_(
                        (Friendship.user_id == current_user_id) & (Friendship.friend_id == u.id),
                        (Friendship.user_id == u.id) & (Friendship.friend_id == current_user_id),
                    )
                )
            )
            fs = fs_res.scalars().first()
            items.append({
                "id": u.id,
                "username": u.username,
                "display_name": u.display_name,
                "avatar_url": u.avatar_url,
                "friendship_status": fs.status if fs else None,
            })
        return items
