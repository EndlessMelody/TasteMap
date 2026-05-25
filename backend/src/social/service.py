"""Social Service — Friend request lifecycle."""
import math
from typing import Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from src.social.models import Friendship
from src.users.models import User
from src.notifications.models import Notification


# ── Helpers ───────────────────────────────────────────────────────────────────

def _cosine_sim(a, b) -> float:
    if a is None or b is None:
        return 0.0
    a, b = list(a), list(b)
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def _to_foodie(user: User, current_vector, friendship_id: Optional[int] = None, last_message_at: Optional[any] = None) -> dict:
    return {
        "id": user.id,
        "username": user.username,
        "display_name": user.display_name,
        "avatar_url": user.avatar_url,
        "cover_url": user.cover_url,
        "bio": user.bio,
        "location": user.location,
        "title": user.title,
        "match_score": round(_cosine_sim(current_vector, user.food_vector) * 100),
        "friendship_id": friendship_id,
        "last_message_at": last_message_at.isoformat() if last_message_at else None,
    }


async def list_friends(db: AsyncSession, user_id: int) -> dict:
    result = await db.execute(
        select(Friendship, User)
        .join(User, or_(
            (Friendship.friend_id == User.id) & (Friendship.user_id == user_id),
            (Friendship.user_id == User.id) & (Friendship.friend_id == user_id)
        ))
        .where(
            Friendship.status == "accepted",
            or_(Friendship.user_id == user_id, Friendship.friend_id == user_id)
        )
    )
    rows = result.all()
    items = []
    for fs, user in rows:
        friend_id = fs.friend_id if fs.user_id == user_id else fs.user_id
        if user.id == friend_id:
            items.append({
                "friendship_id": fs.id,
                "user": {"id": user.id, "display_name": user.display_name, "avatar_url": user.avatar_url},
                "status": "accepted",
                "since": fs.created_at,
            })
    return {"items": items}


async def send_request(db: AsyncSession, user_id: int, friend_id: int) -> dict:
    if user_id == friend_id:
        raise HTTPException(status_code=400, detail="Không thể kết bạn với chính mình")
    existing = await db.execute(
        select(Friendship).where(
            or_(
                (Friendship.user_id == user_id) & (Friendship.friend_id == friend_id),
                (Friendship.user_id == friend_id) & (Friendship.friend_id == user_id)
            )
        )
    )
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Đã có quan hệ bạn bè / yêu cầu đang chờ")

    sender_res = await db.execute(select(User).where(User.id == user_id))
    sender = sender_res.scalars().first()
    sender_name = (sender.display_name or sender.username) if sender else "Someone"

    fs = Friendship(user_id=user_id, friend_id=friend_id, status="pending")
    db.add(fs)
    await db.flush()

    notif = Notification(
        user_id=friend_id,
        type="social",
        title="New Friend Request",
        body=f"{sender_name} wants to be your foodie! 🍜",
        reference_type="friendship",
        reference_id=fs.id,
    )
    db.add(notif)
    await db.commit()
    return {"status": "pending"}


async def accept_request(db: AsyncSession, friendship_id: int, user_id: int) -> dict:
    result = await db.execute(select(Friendship).where(Friendship.id == friendship_id, Friendship.friend_id == user_id))
    fs = result.scalars().first()
    if not fs:
        raise HTTPException(status_code=404, detail="Invitation not found")

    accepter_res = await db.execute(select(User).where(User.id == user_id))
    accepter = accepter_res.scalars().first()
    accepter_name = (accepter.display_name or accepter.username) if accepter else "Someone"

    fs.status = "accepted"

    notif = Notification(
        user_id=fs.user_id,
        type="social",
        title="Friend Request Accepted",
        body=f"{accepter_name} accepted your friend request!",
        reference_type="friendship",
        reference_id=fs.id,
    )
    db.add(notif)
    await db.commit()
    return {"status": "accepted"}


async def block_friend(db: AsyncSession, friendship_id: int, user_id: int) -> dict:
    result = await db.execute(
        select(Friendship).where(Friendship.id == friendship_id, or_(Friendship.user_id == user_id, Friendship.friend_id == user_id))
    )
    fs = result.scalars().first()
    if not fs:
        raise HTTPException(status_code=404, detail="Not found")
    fs.status = "blocked"
    await db.commit()
    return {"status": "blocked"}


async def delete_friendship(db: AsyncSession, friendship_id: int, user_id: int) -> dict:
    result = await db.execute(
        select(Friendship).where(Friendship.id == friendship_id, or_(Friendship.user_id == user_id, Friendship.friend_id == user_id))
    )
    fs = result.scalars().first()
    if not fs:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(fs)
    await db.commit()
    return {"status": "deleted"}


async def list_pending_requests(db: AsyncSession, user_id: int) -> dict:
    me_res = await db.execute(select(User).where(User.id == user_id))
    me = me_res.scalars().first()

    result = await db.execute(
        select(Friendship, User)
        .join(User, User.id == Friendship.user_id)
        .where(Friendship.friend_id == user_id, Friendship.status == "pending")
    )
    rows = result.all()
    items = []
    for fs, u in rows:
        items.append({
            "friendship_id": fs.id,
            "id": u.id,
            "username": u.username,
            "display_name": u.display_name,
            "avatar_url": u.avatar_url,
            "cover_url": u.cover_url,
            "bio": u.bio,
            "location": u.location,
            "title": u.title,
            "match_score": round(_cosine_sim(me.food_vector if me else None, u.food_vector) * 100),
            "created_at": fs.created_at,
        })
    return {"items": items}


async def list_friends_foodies(db: AsyncSession, user_id: int) -> dict:
    from src.messages.models import ChatMessage
    from sqlalchemy import func

    me_res = await db.execute(select(User).where(User.id == user_id))
    me = me_res.scalars().first()
    if not me:
        return {"items": []}

    # Subquery to get last message timestamp for each friend
    last_msg_subquery = (
        select(func.max(ChatMessage.created_at))
        .where(
            or_(
                (ChatMessage.sender_id == user_id) & (ChatMessage.receiver_id == User.id),
                (ChatMessage.sender_id == User.id) & (ChatMessage.receiver_id == user_id)
            )
        )
        .scalar_subquery()
    )

    result = await db.execute(
        select(Friendship, User, last_msg_subquery.label("last_message_at"))
        .join(User, or_(
            (Friendship.friend_id == User.id) & (Friendship.user_id == user_id),
            (Friendship.user_id == User.id) & (Friendship.friend_id == user_id),
        ))
        .where(
            Friendship.status == "accepted",
            or_(Friendship.user_id == user_id, Friendship.friend_id == user_id),
        )
    )
    rows = result.all()
    items = []
    for fs, user, last_msg_at in rows:
        friend_id = fs.friend_id if fs.user_id == user_id else fs.user_id
        if user.id == friend_id:
            items.append(_to_foodie(user, me.food_vector, friendship_id=fs.id, last_message_at=last_msg_at))
    
    # Sort by last_message_at DESC, then by match_score DESC
    items.sort(key=lambda x: (x["last_message_at"] or "", x["match_score"]), reverse=True)
    return {"items": items}


async def list_sent_requests(db: AsyncSession, user_id: int) -> dict:
    me_res = await db.execute(select(User).where(User.id == user_id))
    me = me_res.scalars().first()

    result = await db.execute(
        select(Friendship, User)
        .join(User, User.id == Friendship.friend_id)
        .where(Friendship.user_id == user_id, Friendship.status == "pending")
    )
    rows = result.all()
    items = []
    for fs, u in rows:
        items.append({
            "friendship_id": fs.id,
            "id": u.id,
            "username": u.username,
            "display_name": u.display_name,
            "avatar_url": u.avatar_url,
            "cover_url": u.cover_url,
            "bio": u.bio,
            "location": u.location,
            "title": u.title,
            "match_score": round(_cosine_sim(me.food_vector if me else None, u.food_vector) * 100),
            "created_at": fs.created_at,
        })
    return {"items": items}


async def list_discover_foodies(db: AsyncSession, user_id: int, limit: int = 20) -> dict:
    me_res = await db.execute(select(User).where(User.id == user_id))
    me = me_res.scalars().first()
    if not me:
        return {"items": []}

    existing_res = await db.execute(
        select(Friendship).where(
            or_(Friendship.user_id == user_id, Friendship.friend_id == user_id)
        )
    )
    excluded: set[int] = {user_id}
    for fs in existing_res.scalars().all():
        excluded.add(fs.user_id)
        excluded.add(fs.friend_id)

    users_res = await db.execute(select(User).where(User.id.notin_(excluded)))
    users = users_res.scalars().all()

    items = [_to_foodie(u, me.food_vector) for u in users]
    items.sort(key=lambda x: x["match_score"], reverse=True)
    return {"items": items[:limit]}
