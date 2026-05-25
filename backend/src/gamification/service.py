"""Gamification Service — Badge management."""
from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone

from src.gamification.models import Badge, UserBadge
from src.gamification import schemas
from src.users.models import User

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
        raise HTTPException(status_code=404, detail="User not found")
    
    if badge_id is None:
        user.primary_badge_id = None
    else:
        # Check ownership
        ownership_q = await db.execute(
            select(UserBadge).where(UserBadge.user_id == user_id, UserBadge.badge_id == badge_id)
        )
        if not ownership_q.scalars().first():
            raise HTTPException(status_code=400, detail="User does not own this badge")
        user.primary_badge_id = badge_id
        
    await db.commit()
    return True
