"""Bookmarks Service — save locations + auto XP reward."""
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from src.bookmarks.models import Bookmark
from src.locations.models import Location
from src.users.models import User
from src.bookmarks.schemas import BookmarkCreate
from src.challenges.xp_service import award_xp

XP_PER_BOOKMARK = 10


async def list_bookmarks(db: AsyncSession, user_id: int, limit: int, offset: int) -> dict:
    q = select(Bookmark).where(Bookmark.user_id == user_id)
    count_r = await db.execute(select(func.count()).select_from(q.subquery()))
    total = count_r.scalar_one() or 0
    q = q.order_by(Bookmark.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(q)
    bookmarks = result.scalars().all()
    items = [await _bookmark_to_dict(db, b) for b in bookmarks]
    return {"items": items, "total": total}


async def add_bookmark(db: AsyncSession, user_id: int, data: BookmarkCreate) -> dict:
    # Xác định loại bookmark và kiểm tra đã tồn tại chưa
    if data.location_id:
        existing_q = await db.execute(
            select(Bookmark).where(Bookmark.user_id == user_id, Bookmark.location_id == data.location_id)
        )
        target_id = data.location_id
        target_type = "location"
    elif data.post_id:
        existing_q = await db.execute(
            select(Bookmark).where(Bookmark.user_id == user_id, Bookmark.post_id == data.post_id)
        )
        target_id = data.post_id
        target_type = "post"
    elif data.reel_id:
        existing_q = await db.execute(
            select(Bookmark).where(Bookmark.user_id == user_id, Bookmark.reel_id == data.reel_id)
        )
        target_id = data.reel_id
        target_type = "reel"
    else:
        raise HTTPException(status_code=400, detail="Thiếu ID đối tượng để bookmark")

    if existing_q.scalars().first():
        raise HTTPException(status_code=400, detail="Đã bookmark rồi")

    # Chỉ thưởng XP cho bookmark địa điểm (Taste Vault)
    earned_xp = XP_PER_BOOKMARK if target_type == "location" else 0

    bm = Bookmark(
        user_id=user_id,
        location_id=data.location_id,
        post_id=data.post_id,
        reel_id=data.reel_id,
        xp_earned=earned_xp
    )
    db.add(bm)

    if earned_xp > 0:
        await award_xp(db, user_id, earned_xp, "bookmark", str(bm.id), f"Bookmarked location {data.location_id}")

    await db.commit()
    await db.refresh(bm)

    # Fetch updated user to get accurate total_xp_earned
    user_q = await db.execute(select(User).where(User.id == user_id))
    user = user_q.scalars().first()
    
    return {"id": bm.id, "xp_earned": earned_xp, "total_xp": user.total_xp_earned if user else 0}


async def toggle_bookmark(db: AsyncSession, user_id: int, body: BookmarkCreate) -> dict:
    """Toggles bookmark status (create if missing, delete if exists)."""
    # Check if exists
    query = select(Bookmark).where(Bookmark.user_id == user_id)
    if body.location_id:
        query = query.where(Bookmark.location_id == body.location_id)
    elif body.post_id:
        query = query.where(Bookmark.post_id == body.post_id)
    elif body.reel_id:
        query = query.where(Bookmark.reel_id == body.reel_id)
    else:
        raise HTTPException(status_code=400, detail="Missing location_id, post_id, or reel_id")

    result = await db.execute(query)
    existing = result.scalar_one_or_none()

    if existing:
        await db.delete(existing)
        await db.commit()
        return {"id": existing.id, "action": "deleted"}
    else:
        new_bookmark = await add_bookmark(db, user_id, body)
        return {**new_bookmark, "action": "created"}


async def delete_bookmark(db: AsyncSession, bookmark_id: int, user_id: int) -> dict:
    result = await db.execute(select(Bookmark).where(Bookmark.id == bookmark_id, Bookmark.user_id == user_id))
    bm = result.scalars().first()
    if not bm:
        raise HTTPException(status_code=404, detail="Bookmark không tồn tại")
    await db.delete(bm)
    await db.commit()
    return {"status": "deleted"}


async def _bookmark_to_dict(db: AsyncSession, bm: Bookmark) -> dict:
    res = {
        "id": bm.id,
        "xp_earned": bm.xp_earned,
        "created_at": bm.created_at,
        "location": None,
        "post": None,
        "reel": None
    }
    
    if bm.location_id:
        loc_q = await db.execute(select(Location).where(Location.id == bm.location_id))
        loc = loc_q.scalars().first()
        if loc:
            res["location"] = {
                "id": loc.id, "name": loc.name, "image_url": loc.image_url, 
                "rating": loc.rating, "category": loc.category, "price_range": loc.price_range
            }
    
    if bm.post_id and bm.post:
        post = bm.post
        # Load author info
        from src.users.models import User
        author_q = await db.execute(select(User).where(User.id == post.user_id))
        author = author_q.scalars().first()
        # Load spot name from location if linked
        spot_name = None
        if post.location_id:
            from src.locations.models import Location as Loc
            loc_q2 = await db.execute(select(Loc).where(Loc.id == post.location_id))
            loc2 = loc_q2.scalars().first()
            spot_name = loc2.name if loc2 else None
        res["post"] = {
            "id": post.id,
            "image_url": post.image_url,
            "review": post.review[:100] + "..." if post.review and len(post.review) > 100 else post.review,
            "spot_name": spot_name,
            "author_name": author.display_name or author.username if author else None,
            "author_avatar": author.avatar_url if author else None,
            "author_username": author.username if author else None,
        }
            
    if bm.reel_id and bm.reel:
        reel = bm.reel
        from src.users.models import User
        author_q = await db.execute(select(User).where(User.id == reel.user_id))
        author = author_q.scalars().first()
        res["reel"] = {
            "id": reel.id,
            "title": reel.title,
            "thumbnail_url": reel.thumbnail_url,
            "author_name": author.display_name or author.username if author else None,
            "author_avatar": author.avatar_url if author else None,
            "author_username": author.username if author else None,
        }
            
    return res
