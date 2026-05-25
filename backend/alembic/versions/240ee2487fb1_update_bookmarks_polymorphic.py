"""update_bookmarks_polymorphic

Revision ID: 240ee2487fb1
Revises: 188aa48b49c8
Create Date: 2026-04-23 23:14:50.735032

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '240ee2487fb1'
down_revision: Union[str, Sequence[str], None] = '188aa48b49c8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('bookmarks', sa.Column('post_id', sa.Integer(), nullable=True))
    op.add_column('bookmarks', sa.Column('reel_id', sa.Integer(), nullable=True))
    op.alter_column('bookmarks', 'location_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    
    # Drop old constraint
    op.drop_constraint('uq_bookmark', 'bookmarks', type_='unique')
    
    # Add new constraints and indexes
    op.create_index(op.f('ix_bookmarks_post_id'), 'bookmarks', ['post_id'], unique=False)
    op.create_index(op.f('ix_bookmarks_reel_id'), 'bookmarks', ['reel_id'], unique=False)
    op.create_unique_constraint('uq_bookmark_location', 'bookmarks', ['user_id', 'location_id'])
    op.create_unique_constraint('uq_bookmark_post', 'bookmarks', ['user_id', 'post_id'])
    op.create_unique_constraint('uq_bookmark_reel', 'bookmarks', ['user_id', 'reel_id'])
    
    # Add foreign keys
    op.create_foreign_key(None, 'bookmarks', 'posts', ['post_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key(None, 'bookmarks', 'reels', ['reel_id'], ['id'], ondelete='CASCADE')


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(None, 'bookmarks', type_='foreignkey')
    op.drop_constraint(None, 'bookmarks', type_='foreignkey')
    op.drop_constraint('uq_bookmark_reel', 'bookmarks', type_='unique')
    op.drop_constraint('uq_bookmark_post', 'bookmarks', type_='unique')
    op.drop_constraint('uq_bookmark_location', 'bookmarks', type_='unique')
    op.drop_index(op.f('ix_bookmarks_reel_id'), table_name='bookmarks')
    op.drop_index(op.f('ix_bookmarks_post_id'), table_name='bookmarks')
    
    # Restore old constraint
    op.create_unique_constraint('uq_bookmark', 'bookmarks', ['user_id', 'location_id'])
    
    op.alter_column('bookmarks', 'location_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.drop_column('bookmarks', 'reel_id')
    op.drop_column('bookmarks', 'post_id')
