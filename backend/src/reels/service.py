"""Reels Service — CRUD + Like toggle + View counter."""
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import Optional

from src.reels.models import Reel, ReelLike
from src.users.models import User
from src.bookmarks.models import Bookmark
from src.reels.schemas import ReelCreate
from src.challenges import service as challenges_service


async def list_reels(db: AsyncSession, sort: str = "trending", limit: int = 10, viewer_id: Optional[int] = None) -> dict:
    q = select(Reel).options(selectinload(Reel.user))
    if sort == "trending":
        q = q.order_by(Reel.views_count.desc())
    else:
        q = q.order_by(Reel.created_at.desc())
    result = await db.execute(q.limit(limit))
    reels = result.scalars().all()

    # Batch fetch likes to avoid N+1
    liked_reel_ids = set()
    bookmarked_reel_ids = set()
    if viewer_id and reels:
        reel_ids = [r.id for r in reels]
        likes_result = await db.execute(
            select(ReelLike.reel_id)
            .where(ReelLike.user_id == viewer_id, ReelLike.reel_id.in_(reel_ids))
        )
        liked_reel_ids = {row[0] for row in likes_result.all()}
        bookmarks_result = await db.execute(
            select(Bookmark.reel_id)
            .where(Bookmark.user_id == viewer_id, Bookmark.reel_id.in_(reel_ids))
        )
        bookmarked_reel_ids = {row[0] for row in bookmarks_result.all() if row[0] is not None}

    items = []
    for r in reels:
        user_data = None
        if r.user:
            user_data = {"id": r.user.id, "display_name": r.user.display_name, "avatar_url": r.user.avatar_url}
            
        items.append({
            "id": r.id, "title": r.title,
            "user": user_data,
            "video_url": r.video_url, "thumbnail_url": r.thumbnail_url,
            "views_count": r.views_count, "likes_count": r.likes_count, "comments_count": r.comments_count,
            "is_liked": r.id in liked_reel_ids,
            "is_bookmarked": r.id in bookmarked_reel_ids,
            "created_at": r.created_at,
        })

    return {"items": items}


async def create_reel(db: AsyncSession, user_id: int, data: ReelCreate) -> dict:
    reel = Reel(user_id=user_id, **data.model_dump())
    db.add(reel)
    await db.commit()
    await db.refresh(reel)
    
    # Challenge Tracking Hook
    await challenges_service.track_user_action(
        db=db,
        user_id=user_id,
        action_type="reel_create",
        ref_type="reel",
        ref_id=reel.id,
        metadata={
            "has_caption": bool(reel.title)
        }
    )
    
    return await _reel_to_dict(db, reel)


async def get_reel(db: AsyncSession, reel_id: int, viewer_id: Optional[int] = None) -> dict:
    result = await db.execute(select(Reel).options(selectinload(Reel.user)).where(Reel.id == reel_id))
    reel = result.scalars().first()
    if not reel:
        raise HTTPException(status_code=404, detail="Reel không tồn tại")
    reel.views_count += 1
    await db.commit()
    return await _reel_to_dict(db, reel, viewer_id)


from sqlalchemy import update, func

async def toggle_like(db: AsyncSession, reel_id: int, user_id: int) -> dict:
    # Transaction starts inherently
    result = await db.execute(select(ReelLike).where(ReelLike.reel_id == reel_id, ReelLike.user_id == user_id))
    like = result.scalars().first()
    
    reel_q = await db.execute(select(Reel.id).where(Reel.id == reel_id))
    reel = reel_q.first()
    if not reel:
        raise HTTPException(status_code=404, detail="Reel không tồn tại")

    if like:
        await db.delete(like)
        # Atomic decrement
        update_stmt = update(Reel).where(Reel.id == reel_id).values(
            likes_count=func.greatest(0, Reel.likes_count - 1)
        ).returning(Reel.likes_count)
        result = await db.execute(update_stmt)
        new_count = result.scalar_one()
        liked = False
    else:
        db.add(ReelLike(reel_id=reel_id, user_id=user_id))
        # Atomic increment
        update_stmt = update(Reel).where(Reel.id == reel_id).values(
            likes_count=Reel.likes_count + 1
        ).returning(Reel.likes_count)
        result = await db.execute(update_stmt)
        new_count = result.scalar_one()
        liked = True
        
    await db.commit()
    return {"liked": liked, "likes_count": new_count}


async def _reel_to_dict(db: AsyncSession, reel: Reel, viewer_id: Optional[int] = None) -> dict:
    # Fallback function for create_reel and get_reel, manually query user if not eager loaded
    user = reel.user
    if not user:
        user_q = await db.execute(select(User).where(User.id == reel.user_id))
        user = user_q.scalars().first()
        
    is_liked = False
    is_bookmarked = False
    if viewer_id:
        like_q = await db.execute(select(ReelLike).where(ReelLike.reel_id == reel.id, ReelLike.user_id == viewer_id))
        is_liked = like_q.scalars().first() is not None
        bookmark_q = await db.execute(
            select(Bookmark).where(Bookmark.reel_id == reel.id, Bookmark.user_id == viewer_id)
        )
        is_bookmarked = bookmark_q.scalars().first() is not None

    return {
        "id": reel.id, "title": reel.title,
        "user": {"id": user.id, "display_name": user.display_name, "avatar_url": user.avatar_url} if user else None,
        "video_url": reel.video_url, "thumbnail_url": reel.thumbnail_url,
        "views_count": reel.views_count, "likes_count": reel.likes_count, "comments_count": reel.comments_count,
        "is_liked": is_liked,
        "is_bookmarked": is_bookmarked,
        "created_at": reel.created_at,
    }
