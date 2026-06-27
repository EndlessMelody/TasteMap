from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from src.core.exceptions import ValidationException, ForbiddenException, ResourceNotFoundException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.database import get_db
from src.core.dependencies import get_current_user_id
from src.messages import service

router = APIRouter()


class SendMessageBody(BaseModel):
    text: str
    content_type: str = Field(default="text", pattern="^(text|image|voice|video|file)$")
    media_url: Optional[str] = None
    media_meta: Optional[dict] = None  # {duration, width, height, size_bytes}
    reply_to_id: Optional[int] = None  # For reply/thread support


class EditMessageBody(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)


class ReactionBody(BaseModel):
    emoji: str = Field(..., min_length=1, max_length=10, description="Unicode emoji character")


@router.get("/inbox", summary="Get inbox - all conversations with last message")
async def get_inbox(
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await service.get_inbox(db, user_id)


@router.get("/{other_user_id}", summary="Get conversation with a user")
async def get_conversation(
    other_user_id: int,
    limit: int = Query(60, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await service.get_conversation(db, user_id, other_user_id, limit, offset)


@router.post("/{other_user_id}", summary="Send a message (text or media) to a user")
async def send_message(
    other_user_id: int,
    body: SendMessageBody,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Send text, image, voice, video, or file message. For media messages, upload first via /media/upload?type=chat"""
    try:
        msg = await service.send_message(
            db,
            sender_id=user_id,
            receiver_id=other_user_id,
            text=body.text,
            content_type=body.content_type,
            media_url=body.media_url,
            media_meta=body.media_meta,
            reply_to_id=body.reply_to_id,
        )
        return {"success": True, "data": msg}
    except ValueError as e:
        raise ValidationException(detail=str(e), error_code="INVALID_MESSAGE")


@router.patch("/{other_user_id}/read", summary="Mark all messages from user as read")
async def mark_read(
    other_user_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    count = await service.mark_read(db, user_id, other_user_id)
    return {"success": True, "marked_read": count}


# ═══════════════════════════════════════════════════════════════════════════
# MESSAGE LIFECYCLE (Edit / Delete)
# ═══════════════════════════════════════════════════════════════════════════

@router.patch("/{other_user_id}/{message_id}", summary="Edit a message (within 15 min)")
async def edit_message(
    other_user_id: int,  # Path param for consistency, not used
    message_id: int,
    body: EditMessageBody,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Edit a text message. Only sender can edit, within 15 minutes of sending."""
    result = await service.edit_message(db, message_id, user_id, body.text)
    if not result:
        raise ForbiddenException(
            detail="Cannot edit message: not found, not sender, too old, or not a text message", error_code="CANNOT_EDIT_MESSAGE"
        )
    return {"success": True, "data": result}


@router.delete("/{other_user_id}/{message_id}", summary="Delete a message (soft delete)")
async def delete_message(
    other_user_id: int,
    message_id: int,
    for_everyone: bool = Query(False, description="Delete for everyone vs just for self"),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Soft delete a message. Only sender can delete for everyone."""
    success = await service.delete_message(db, message_id, user_id, for_everyone)
    if not success:
        raise ForbiddenException(
            detail="Cannot delete message: not found or not authorized", error_code="CANNOT_DELETE_MESSAGE"
        )
    return {"success": True, "deleted": True}


# ═══════════════════════════════════════════════════════════════════════════
# REACTIONS
# ═══════════════════════════════════════════════════════════════════════════

@router.post("/{other_user_id}/{message_id}/reactions", summary="Add reaction to message")
async def add_reaction(
    other_user_id: int,
    message_id: int,
    body: ReactionBody,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """React to a message with an emoji (👍 ❤️ 😂 🎉 😮 😢 😡). Returns updated message with reactions."""
    result = await service.add_reaction(db, message_id, user_id, body.emoji)
    if not result:
        raise ResourceNotFoundException(detail="Message not found", error_code="MESSAGE_NOT_FOUND")
    return {"success": True, "data": result}


@router.delete("/{other_user_id}/{message_id}/reactions", summary="Remove reaction from message")
async def remove_reaction(
    other_user_id: int,
    message_id: int,
    emoji: str = Query(..., description="Emoji to remove"),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Remove your reaction from a message."""
    result = await service.remove_reaction(db, message_id, user_id, emoji)
    if not result:
        raise ResourceNotFoundException(detail="Message not found", error_code="MESSAGE_NOT_FOUND")
    return {"success": True, "data": result}
