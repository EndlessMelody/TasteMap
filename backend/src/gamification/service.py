"""Gamification Service — Badge management."""
from typing import List, Optional
from src.core.exceptions import ResourceNotFoundException, ValidationException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone

from src.gamification.models import Badge, UserBadge
from src.gamification import schemas
from src.users.models import User
from src.posts.models import Post
from src.bookmarks.models import Bookmark

async def list_all_badges(db: AsyncSession) -> List[Badge]:
    """Returns all badges (public view)."""
    result = await db.execute(select(Badge).where(Badge.is_hidden == False))
    return result.scalars().all()

async def list_user_badges(db: AsyncSession, user_id: int) -> List[UserBadge]:
    """Get all badges earned by a specific user."""
    result = await db.execute(
        select(UserBadge)
        .options(selectinload(UserBadge.badge))
        .where(UserBadge.user_id == user_id)
        .order_by(desc(UserBadge.earned_at))
    )
    return result.scalars().all()

async def get_all_badges_admin_view(db: AsyncSession) -> List[dict]:
    """Admin view: returns all badges along with an owned_count aggregated metric."""
    query = select(Badge).order_by(Badge.id)
    result = await db.execute(query)
    badges = result.scalars().all()
    
    # Get counts for all badges efficiently
    count_query = select(UserBadge.badge_id, func.count(UserBadge.id)).group_by(UserBadge.badge_id)
    count_res = await db.execute(count_query)
    counts = dict(count_res.all())
    
    output = []
    for badge in badges:
        data = schemas.BadgeResponse.model_validate(badge).model_dump()
        data["owned_count"] = counts.get(badge.id, 0)
        output.append(data)
    
    return output

async def create_badge(db: AsyncSession, payload: schemas.BadgeCreate) -> Badge:
    """Admin: create a new badge."""
    badge = Badge(**payload.model_dump())
    db.add(badge)
    await db.commit()
    await db.refresh(badge)
    return badge

async def update_badge(db: AsyncSession, badge_id: int, payload: schemas.BadgeUpdate) -> Optional[Badge]:
    """Admin: update an existing badge."""
    badge = await db.get(Badge, badge_id)
    if not badge:
        return None
        
    update_data = payload.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        setattr(badge, key, val)
        
    await db.commit()
    await db.refresh(badge)
    return badge

async def delete_badge(db: AsyncSession, badge_id: int) -> bool:
    """Admin: delete a badge."""
    badge = await db.get(Badge, badge_id)
    if not badge:
        return False
    await db.delete(badge)
    await db.commit()
    return True

async def award_badge(db: AsyncSession, user_id: int, badge_id: int) -> dict:
    """Internal: awards a badge to a user. Idempotent."""
    existing = await db.execute(select(UserBadge).where(UserBadge.user_id == user_id, UserBadge.badge_id == badge_id))
    if existing.scalars().first():
        return {"status": "already_awarded"}
    ub = UserBadge(user_id=user_id, badge_id=badge_id, earned_at=datetime.now(timezone.utc))
    db.add(ub)
    await db.commit()
    return {"status": "awarded"}

async def set_primary_badge(db: AsyncSession, user_id: int, badge_id: Optional[int]) -> bool:
    """Sets a primary badge for the user. Validates ownership."""
    user = await db.get(User, user_id)
    if not user:
        raise ResourceNotFoundException(detail="User not found", error_code="USER_NOT_FOUND")
    
    if badge_id is None:
        user.primary_badge_id = None
    else:
        # Check ownership
        ownership_q = await db.execute(
            select(UserBadge).where(UserBadge.user_id == user_id, UserBadge.badge_id == badge_id)
        )
        if not ownership_q.scalars().first():
            raise ValidationException(detail="User does not own this badge", error_code="BADGE_NOT_OWNED")
        user.primary_badge_id = badge_id
        
    await db.commit()
    return True


# ─── AI Badge Progression & Roadmap Engine ──────────────────────────────

async def get_badge_progression_roadmap(db: AsyncSession, user_id: int) -> dict:
    user = await db.get(User, user_id)
    if not user:
        raise ResourceNotFoundException(detail="User không tồn tại", error_code="USER_NOT_FOUND")

    all_badges_q = await db.execute(select(Badge).where(Badge.is_hidden == False))
    all_badges = all_badges_q.scalars().all()

    earned_q = await db.execute(select(UserBadge.badge_id).where(UserBadge.user_id == user_id))
    earned_ids = set(earned_q.scalars().all())

    # Count metrics for dynamic calculation
    posts_q = await db.execute(select(func.count(Post.id)).where(Post.user_id == user_id))
    posts_count = posts_q.scalar() or 0

    bookmarks_q = await db.execute(select(func.count(Bookmark.id)).where(Bookmark.user_id == user_id))
    bookmarks_count = bookmarks_q.scalar() or 0

    food_vec = user.food_vector if user.food_vector else [0.1] * 15
    max_spicy = round(float(food_vec[0]) * 10, 1) if len(food_vec) > 0 else 1.0

    progressions = []
    total_rarity_score = 0

    rarity_weights = {"Common": 10, "Rare": 25, "Epic": 50, "Legendary": 100}

    for badge in all_badges:
        is_earned = badge.id in earned_ids
        weight = rarity_weights.get(badge.rarity, 15)
        if is_earned:
            total_rarity_score += weight

        # Determine dynamic target and current value
        if "Review" in badge.name or "Bài" in badge.name or "Nhà Phê Bình" in badge.name:
            target = 5 if badge.rarity == "Common" else (15 if badge.rarity == "Rare" else 30)
            cur = posts_count
            advice = f"Viết thêm {max(0, target - cur)} bài review món ăn để mở khóa huy hiệu này!"
        elif "Lưu" in badge.name or "Sưu Tầm" in badge.name or "Bookmark" in badge.name:
            target = 10 if badge.rarity == "Common" else (25 if badge.rarity == "Rare" else 50)
            cur = bookmarks_count
            advice = f"Lưu thêm {max(0, target - cur)} quán ăn vào bộ sưu tập cá nhân!"
        elif "Cay" in badge.name or "Spicy" in badge.name:
            target = 8
            cur = int(max_spicy)
            advice = "Tăng cường quẹt thẻ các món cay nồng hoặc check-in quán lẩu cay Thái/Tứ Xuyên!"
        else:
            target = 10 if badge.rarity == "Common" else 20
            cur = posts_count + bookmarks_count
            advice = f"Tích cực tương tác, review và check-in thêm {max(0, target - cur)} lần trên ứng dụng!"

        if is_earned:
            cur = target
            progress_pct = 100.0
            advice = "🎉 Bạn đã chinh phục thành công thành tựu xuất sắc này!"
        else:
            progress_pct = round(min(100.0, (cur / target) * 100.0), 1)

        progressions.append({
            "badge_id": badge.id,
            "name": badge.name,
            "icon_name": badge.icon_name,
            "rarity": badge.rarity,
            "progress_percent": progress_pct,
            "current_value": min(cur, target),
            "target_value": target,
            "ai_advice": advice,
            "is_earned": is_earned
        })

    if total_rarity_score >= 300:
        rank_title = "Chuyên Gia Ẩm Thực Tối Cao 👑"
        next_advice = "Bạn đang ở vị trí đỉnh cao của cộng đồng ẩm thực Tastemap!"
    elif total_rarity_score >= 150:
        rank_title = "Thực Khách Sành Ăn 🍜"
        next_advice = "Khám phá thêm các huy hiệu Legendary để leo lên ngôi vị Tối Cao!"
    elif total_rarity_score >= 50:
        rank_title = "Nhà Khám Phá Triển Vọng 🌟"
        next_advice = "Hãy viết thêm bài đánh giá và thử sức với các huy hiệu Epic!"
    else:
        rank_title = "Tập Sự Khám Phá 🥄"
        next_advice = "Bắt đầu lưu quán và viết bài review đầu tiên để nhận huy hiệu khởi động!"

    return {
        "total_earned": len(earned_ids),
        "total_available": len(all_badges),
        "foodie_rank_title": rank_title,
        "rarity_score": total_rarity_score,
        "next_milestone_advice": next_advice,
        "progressions": progressions
    }


async def auto_evaluate_and_award_badges(db: AsyncSession, user_id: int) -> dict:
    roadmap = await get_badge_progression_roadmap(db, user_id)
    newly_awarded = []

    for item in roadmap["progressions"]:
        if not item["is_earned"] and item["progress_percent"] >= 100.0:
            res = await award_badge(db, user_id, item["badge_id"])
            if res.get("status") == "awarded":
                newly_awarded.append(item["name"])

    return {
        "evaluated_count": len(roadmap["progressions"]),
        "newly_awarded_count": len(newly_awarded),
        "new_badges": newly_awarded
    }
