from sqlalchemy import Column, Integer, Text, Boolean, DateTime, ForeignKey, func, String, JSON
from sqlalchemy.orm import relationship
from src.db.database import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    receiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    text = Column(Text, nullable=True)  # Nullable for media-only messages
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Content type: text, image, voice, video, file
    content_type = Column(String(20), default="text", nullable=False, index=True)
    media_url = Column(String(500), nullable=True)  # Supabase URL for media
    media_meta = Column(JSON, default=dict, nullable=False)  # {duration, width, height, size_bytes}

    # Reply/thread support
    reply_to_id = Column(Integer, ForeignKey("chat_messages.id", ondelete="SET NULL"), nullable=True)

    # Message lifecycle
    is_edited = Column(Boolean, default=False, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)  # Soft delete

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])
    reply_to = relationship("ChatMessage", remote_side=[id], uselist=False)
    reactions = relationship("MessageReaction", back_populates="message", cascade="all, delete-orphan", lazy="selectin")

    @property
    def reaction_counts(self) -> dict:
        """Return emoji -> count mapping for quick serialization."""
        counts = {}
        for reaction in self.reactions:
            counts[reaction.emoji] = counts.get(reaction.emoji, 0) + 1
        return counts


class MessageReaction(Base):
    __tablename__ = "message_reactions"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("chat_messages.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    emoji = Column(String(10), nullable=False)  # Unicode emoji
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Unique constraint handled in migration: (message_id, user_id, emoji)

    message = relationship("ChatMessage", back_populates="reactions")
    user = relationship("User")
