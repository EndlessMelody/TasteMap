"""Notifications Service."""
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import Optional

from src.notifications.models import Notification


async def list_notifications(db: AsyncSession, user_id: int, notif_type: Optional[str], unread_only: bool, limit: int) -> dict:
    q = select(Notification).where(Notification.user_id == user_id)
    if notif_type:
        q = q.where(Notification.type == notif_type)
    if unread_only:
        q = q.where(Notification.is_read == False)

    count_q = await db.execute(
        select(func.count()).select_from(
            select(Notification).where(Notification.user_id == user_id, Notification.is_read == False).subquery()
        )
    )
    unread_count = count_q.scalar_one() or 0

    q = q.order_by(Notification.created_at.desc()).limit(limit)
    result = await db.execute(q)
    notifications = result.scalars().all()
    return {"items": [_to_dict(n) for n in notifications], "unread_count": unread_count}


async def mark_read(db: AsyncSession, notif_id: int, user_id: int) -> dict:
    result = await db.execute(select(Notification).where(Notification.id == notif_id, Notification.user_id == user_id))
    n = result.scalars().first()
    if not n:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông báo")
    n.is_read = True
    await db.commit()
    return {"status": "read"}


async def mark_all_read(db: AsyncSession, user_id: int) -> dict:
    result = await db.execute(select(Notification).where(Notification.user_id == user_id, Notification.is_read == False))
    notifications = result.scalars().all()
    for n in notifications:
        n.is_read = True
    await db.commit()
    return {"status": "all_read", "count": len(notifications)}


def _to_dict(n: Notification) -> dict:
    return {
        "id": n.id, "type": n.type, "title": n.title, "body": n.body,
        "is_read": n.is_read, "reference_type": n.reference_type,
        "reference_id": n.reference_id, "created_at": n.created_at,
    }
