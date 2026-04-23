from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_, func
from sqlalchemy.orm import selectinload

from src.messages.models import ChatMessage, MessageReaction


# Allowed content types
CONTENT_TYPES = {"text", "image", "voice", "video", "file"}

# Edit time limit (15 minutes)
EDIT_TIME_LIMIT_MINUTES = 15


def _now_compatible_with(dt: datetime) -> datetime:
    """Return current time with matching tz-awareness for safe subtraction."""
    tzinfo = dt.tzinfo
    if tzinfo is not None and tzinfo.utcoffset(dt) is not None:
        return datetime.now(tzinfo)
    return datetime.utcnow()


def _fmt_time(dt) -> str:
    if dt is None:
        return ""
    return dt.strftime("%I:%M %p").lstrip("0")


def _to_dict(m: ChatMessage, current_user_id: int) -> dict:
    """Serialize message with full media and reaction support."""
    base = {
        "id": m.id,
        "text": m.text if not m.is_deleted else None,
        "sender": "me" if m.sender_id == current_user_id else "them",
        "sender_id": m.sender_id,
        "time": _fmt_time(m.created_at),
        "is_read": m.is_read,
        "created_at": m.created_at.isoformat() if m.created_at else None,
        "content_type": m.content_type,
        "is_edited": m.is_edited,
        "is_deleted": m.is_deleted,
    }

    # Media fields
    if m.media_url:
        base["media_url"] = m.media_url
        base["media_meta"] = m.media_meta or {}
    
    # Reply reference
    if m.reply_to_id:
        base["reply_to_id"] = m.reply_to_id
        if m.reply_to and not m.reply_to.is_deleted:
            base["reply_to"] = {
                "id": m.reply_to.id,
                "text": m.reply_to.text[:100] if m.reply_to.text else None,
                "sender_id": m.reply_to.sender_id,
                "content_type": m.reply_to.content_type,
            }

    # Reactions (grouped by emoji with user list)
    if m.reactions:
        reactions_by_emoji = {}
        for r in m.reactions:
            if r.emoji not in reactions_by_emoji:
                reactions_by_emoji[r.emoji] = {
                    "emoji": r.emoji,
                    "count": 0,
                    "user_ids": [],
                    "has_reacted": False,
                }
            reactions_by_emoji[r.emoji]["count"] += 1
            reactions_by_emoji[r.emoji]["user_ids"].append(r.user_id)
            if r.user_id == current_user_id:
                reactions_by_emoji[r.emoji]["has_reacted"] = True
        base["reactions"] = list(reactions_by_emoji.values())
    else:
        base["reactions"] = []

    return base


async def get_conversation(
    db: AsyncSession, user_id: int, other_id: int, limit: int = 60, offset: int = 0
) -> list:
    """Get conversation with eager-loaded reactions and reply references."""
    result = await db.execute(
        select(ChatMessage)
        .options(
            selectinload(ChatMessage.reactions),
            selectinload(ChatMessage.reply_to)
        )
        .where(
            and_(
                or_(
                    and_(ChatMessage.sender_id == user_id, ChatMessage.receiver_id == other_id),
                    and_(ChatMessage.sender_id == other_id, ChatMessage.receiver_id == user_id),
                ),
                ChatMessage.is_deleted == False,  # Exclude soft-deleted
            )
        )
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    messages = result.scalars().all()
    return [_to_dict(m, user_id) for m in reversed(messages)]


async def send_message(
    db: AsyncSession,
    sender_id: int,
    receiver_id: int,
    text: str,
    content_type: str = "text",
    media_url: Optional[str] = None,
    media_meta: Optional[dict] = None,
    reply_to_id: Optional[int] = None,
) -> dict:
    """Send a message (text or media)."""
    if content_type not in CONTENT_TYPES:
        raise ValueError(f"Invalid content_type: {content_type}")

    # Validate text is provided for text messages, media for media messages
    if content_type == "text" and not text:
        raise ValueError("Text is required for text messages")
    if content_type != "text" and not media_url:
        raise ValueError("media_url is required for media messages")

    msg = ChatMessage(
        sender_id=sender_id,
        receiver_id=receiver_id,
        text=text.strip() if text else None,
        content_type=content_type,
        media_url=media_url,
        media_meta=media_meta or {},
        reply_to_id=reply_to_id,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    # Reload with reactions (empty) for consistent format
    return _to_dict(msg, sender_id)


async def edit_message(
    db: AsyncSession,
    message_id: int,
    user_id: int,
    new_text: str,
) -> Optional[dict]:
    """Edit a message within time limit. Returns None if not allowed."""
    msg = await db.get(ChatMessage, message_id)
    if not msg or msg.is_deleted:
        return None

    # Only sender can edit
    if msg.sender_id != user_id:
        return None

    # Time limit check
    time_since_send = _now_compatible_with(msg.created_at) - msg.created_at
    if time_since_send > timedelta(minutes=EDIT_TIME_LIMIT_MINUTES):
        return None

    # Only text messages can be edited (media stays the same)
    if msg.content_type != "text":
        return None

    msg.text = new_text.strip()
    msg.is_edited = True
    await db.commit()
    await db.refresh(msg)

    return _to_dict(msg, user_id)


async def delete_message(
    db: AsyncSession,
    message_id: int,
    user_id: int,
    for_everyone: bool = False,
) -> bool:
    """Soft delete a message. Returns True if successful."""
    msg = await db.get(ChatMessage, message_id)
    if not msg or msg.is_deleted:
        return False

    # Only sender can delete for everyone, either side can delete for self (not implemented here)
    if for_everyone and msg.sender_id != user_id:
        return False

    msg.is_deleted = True
    msg.text = None  # Clear text content
    msg.media_url = None  # Clear media reference (optional: keep for recovery)
    await db.commit()
    return True


async def mark_read(db: AsyncSession, user_id: int, other_id: int) -> int:
    """Mark all messages from other_id as read. Returns count marked."""
    result = await db.execute(
        select(ChatMessage).where(
            ChatMessage.sender_id == other_id,
            ChatMessage.receiver_id == user_id,
            ChatMessage.is_read == False,
            ChatMessage.is_deleted == False,
        )
    )
    messages = result.scalars().all()
    for m in messages:
        m.is_read = True
    await db.commit()
    return len(messages)


# ═══════════════════════════════════════════════════════════════════════════
# REACTIONS
# ═══════════════════════════════════════════════════════════════════════════

async def add_reaction(
    db: AsyncSession,
    message_id: int,
    user_id: int,
    emoji: str,
) -> Optional[dict]:
    """Add a reaction to a message. Returns updated message or None if message not found."""
    msg = await db.get(ChatMessage, message_id)
    if not msg or msg.is_deleted:
        return None

    # Check if user already reacted with this emoji
    existing = await db.execute(
        select(MessageReaction).where(
            MessageReaction.message_id == message_id,
            MessageReaction.user_id == user_id,
            MessageReaction.emoji == emoji,
        )
    )
    if existing.scalar_one_or_none():
        # Already exists, return current state
        return _to_dict(msg, user_id)

    reaction = MessageReaction(
        message_id=message_id,
        user_id=user_id,
        emoji=emoji,
    )
    db.add(reaction)
    await db.commit()

    # Refresh with reactions
    result = await db.execute(
        select(ChatMessage)
        .options(selectinload(ChatMessage.reactions))
        .where(ChatMessage.id == message_id)
    )
    msg = result.scalar_one()
    return _to_dict(msg, user_id)


async def remove_reaction(
    db: AsyncSession,
    message_id: int,
    user_id: int,
    emoji: str,
) -> Optional[dict]:
    """Remove a reaction from a message. Returns updated message or None."""
    result = await db.execute(
        select(MessageReaction).where(
            MessageReaction.message_id == message_id,
            MessageReaction.user_id == user_id,
            MessageReaction.emoji == emoji,
        )
    )
    reaction = result.scalar_one_or_none()
    if reaction:
        await db.delete(reaction)
        await db.commit()

    # Refresh with reactions
    result = await db.execute(
        select(ChatMessage)
        .options(selectinload(ChatMessage.reactions))
        .where(ChatMessage.id == message_id)
    )
    msg = result.scalar_one_or_none()
    if not msg:
        return None
    return _to_dict(msg, user_id)


# ═══════════════════════════════════════════════════════════════════════════
# INBOX
# ═══════════════════════════════════════════════════════════════════════════

async def get_inbox(db: AsyncSession, user_id: int) -> list:
    """Return latest conversations with each partner, including last message and unread count."""
    from src.users.models import User

    # Find all partners user has chatted with (as sender or receiver)
    partners_q = await db.execute(
        select(
            ChatMessage.sender_id.label("partner_id"),
        )
        .where(ChatMessage.receiver_id == user_id)
        .distinct()
    )
    partners_q2 = await db.execute(
        select(
            ChatMessage.receiver_id.label("partner_id"),
        )
        .where(ChatMessage.sender_id == user_id)
        .distinct()
    )

    partner_ids = {row[0] for row in partners_q.all()} | {row[0] for row in partners_q2.all()}

    inbox = []
    for partner_id in partner_ids:
        if partner_id == user_id:
            continue

        # Get partner user info
        partner_user = await db.get(User, partner_id)
        if not partner_user:
            continue

        # Get last message between user and partner (exclude deleted)
        last_msg_q = await db.execute(
            select(ChatMessage)
            .where(
                and_(
                    or_(
                        and_(ChatMessage.sender_id == user_id, ChatMessage.receiver_id == partner_id),
                        and_(ChatMessage.sender_id == partner_id, ChatMessage.receiver_id == user_id),
                    ),
                    ChatMessage.is_deleted == False,
                )
            )
            .order_by(ChatMessage.created_at.desc())
            .limit(1)
        )
        last_msg = last_msg_q.scalar_one_or_none()
        if not last_msg:
            continue

        # Format last message preview
        last_text = last_msg.text
        if last_msg.content_type == "image":
            last_text = "📷 Photo"
        elif last_msg.content_type == "voice":
            last_text = "🎤 Voice message"
        elif last_msg.content_type == "video":
            last_text = "🎥 Video"
        elif last_msg.content_type == "file":
            last_text = "📎 File"
        elif last_msg.is_deleted:
            last_text = "Message deleted"

        # Count unread messages from this partner
        unread_q = await db.execute(
            select(func.count()).where(
                ChatMessage.sender_id == partner_id,
                ChatMessage.receiver_id == user_id,
                ChatMessage.is_read == False,
                ChatMessage.is_deleted == False,
            )
        )
        unread_count = unread_q.scalar() or 0

        inbox.append({
            "partner_id": partner_id,
            "partner_name": partner_user.display_name or partner_user.username or "Unknown",
            "partner_avatar": partner_user.avatar_url,
            "last_message": last_text,
            "last_message_time": _fmt_time(last_msg.created_at),
            "last_message_at": last_msg.created_at.isoformat() if last_msg.created_at else None,
            "unread_count": unread_count,
            "is_sent_by_me": last_msg.sender_id == user_id,
            "last_message_type": last_msg.content_type,
        })

    # Sort by most recent message
    inbox.sort(key=lambda x: x["last_message_at"] or "", reverse=True)
    return inbox
