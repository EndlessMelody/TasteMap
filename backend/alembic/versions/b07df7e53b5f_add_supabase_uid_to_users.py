"""add_supabase_uid_to_users

Revision ID: b07df7e53b5f
Revises: a1b2c3d4e5f6
Create Date: 2026-04-04 10:26:36.891345

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b07df7e53b5f'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema."""
    # Add column
    op.add_column('users', sa.Column('supabase_uid', sa.String(), nullable=True))
    # Create index
    op.create_index(op.f('ix_users_supabase_uid'), 'users', ['supabase_uid'], unique=True)

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_users_supabase_uid'), table_name='users')
    op.drop_column('users', 'supabase_uid')
