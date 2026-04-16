"""add_role_column

Revision ID: 42e95493ea6a
Revises: c2d3e4f5a6b7
Create Date: 2026-04-16 10:28:17.154031

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '42e95493ea6a'
down_revision: Union[str, Sequence[str], None] = 'c2d3e4f5a6b7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('role', sa.String(), server_default='user', nullable=False))

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'role')
