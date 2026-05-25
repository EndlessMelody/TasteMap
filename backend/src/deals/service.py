"""Deals Service."""
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import datetime, timezone
from typing import Optional

from src.deals.models import Deal
from src.locations.models import Location
from src.deals.schemas import DealCreate


async def list_active_deals(db: AsyncSession, location_id: Optional[int], sponsored_only: bool, limit: int) -> dict:
    now = datetime.now(timezone.utc)
    q = select(Deal).where(Deal.expires_at > now)
    if location_id:
        q = q.where(Deal.location_id == location_id)
    if sponsored_only:
        q = q.where(Deal.is_sponsored == True)
    result = await db.execute(q.order_by(Deal.created_at.desc()).limit(limit))
    deals = result.scalars().all()
    return {"items": [await _deal_to_dict(db, d) for d in deals]}


async def get_deal(db: AsyncSession, deal_id: int) -> dict:
    result = await db.execute(select(Deal).where(Deal.id == deal_id))
    deal = result.scalars().first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal không tồn tại")
    return await _deal_to_dict(db, deal)


async def create_deal(db: AsyncSession, data: DealCreate) -> dict:
    deal = Deal(**data.model_dump())
    db.add(deal)
    await db.commit()
    await db.refresh(deal)
    return await _deal_to_dict(db, deal)


async def _deal_to_dict(db: AsyncSession, d: Deal) -> dict:
    loc = None
    if d.location_id:
        loc_q = await db.execute(select(Location).where(Location.id == d.location_id))
        loc = loc_q.scalars().first()
    return {
        "id": d.id, "title": d.title, "description": d.description,
        "discount_percent": d.discount_percent, "banner_image_url": d.banner_image_url,
        "xp_reward": d.xp_reward, "is_sponsored": d.is_sponsored,
        "location": {"id": loc.id, "name": loc.name} if loc else None,
        "expires_at": d.expires_at, "created_at": d.created_at,
    }
