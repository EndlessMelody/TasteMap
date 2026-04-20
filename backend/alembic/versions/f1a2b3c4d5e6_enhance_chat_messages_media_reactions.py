"""enhance_chat_messages_media_reactions

Revision ID: f1a2b3c4d5e6
Revises: e40d90cc4887
Create Date: 2026-04-20 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, Sequence[str], None] = 'e40d90cc4887'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add new columns to chat_messages
    op.add_column('chat_messages', sa.Column('content_type', sa.String(length=20), server_default='text', nullable=False))
    op.add_column('chat_messages', sa.Column('media_url', sa.String(length=500), nullable=True))
    op.add_column('chat_messages', sa.Column('media_meta', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=False))
    op.add_column('chat_messages', sa.Column('reply_to_id', sa.Integer(), nullable=True))
    op.add_column('chat_messages', sa.Column('is_edited', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('chat_messages', sa.Column('is_deleted', sa.Boolean(), server_default='false', nullable=False))
    
    # Make text nullable (for media-only messages)
    op.alter_column('chat_messages', 'text',
               existing_type=sa.Text(),
               nullable=True)
    
    # Add self-referential foreign key for replies
    op.create_foreign_key('fk_chat_messages_reply_to', 'chat_messages', 'chat_messages', ['reply_to_id'], ['id'], ondelete='SET NULL')
    
    # Add index for content_type filtering
    op.create_index('ix_chat_messages_content_type', 'chat_messages', ['content_type'], unique=False)
    
    # Create message_reactions table
    op.create_table('message_reactions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('message_id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('emoji', sa.String(length=10), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['message_id'], ['chat_messages.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('message_id', 'user_id', 'emoji', name='uq_message_user_emoji')
    )
    op.create_index('ix_message_reactions_id', 'message_reactions', ['id'], unique=False)
    op.create_index('ix_message_reactions_message_id', 'message_reactions', ['message_id'], unique=False)
    op.create_index('ix_message_reactions_user_id', 'message_reactions', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop reactions table
    op.drop_index('ix_message_reactions_user_id', table_name='message_reactions')
    op.drop_index('ix_message_reactions_message_id', table_name='message_reactions')
    op.drop_index('ix_message_reactions_id', table_name='message_reactions')
    op.drop_table('message_reactions')
    
    # Remove indexes
    op.drop_index('ix_chat_messages_content_type', table_name='chat_messages')
    op.drop_constraint('fk_chat_messages_reply_to', 'chat_messages', type_='foreignkey')
    
    # Remove columns
    op.drop_column('chat_messages', 'is_deleted')
    op.drop_column('chat_messages', 'is_edited')
    op.drop_column('chat_messages', 'reply_to_id')
    op.drop_column('chat_messages', 'media_meta')
    op.drop_column('chat_messages', 'media_url')
    op.drop_column('chat_messages', 'content_type')
    
    # Restore text as non-nullable
    op.alter_column('chat_messages', 'text',
               existing_type=sa.Text(),
               nullable=False)
