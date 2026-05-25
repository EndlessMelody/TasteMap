"""Add group visibility: is_public + invite_code

Revision ID: c2d3e4f5a6b7
Revises: a1b2c3d4e5f6
Create Date: 2026-04-15 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'c2d3e4f5a6b7'
down_revision: Union[str, Sequence[str], None] = 'b425b6d0fccf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('groups', sa.Column('is_public', sa.Boolean(), nullable=False, server_default=sa.text('true')))
    op.add_column('groups', sa.Column('invite_code', sa.String(16), nullable=True))
    op.create_unique_constraint('uq_groups_invite_code', 'groups', ['invite_code'])
    op.create_index('ix_groups_is_public', 'groups', ['is_public'])


def downgrade() -> None:
    op.drop_index('ix_groups_is_public', table_name='groups')
    op.drop_constraint('uq_groups_invite_code', 'groups', type_='unique')
    op.drop_column('groups', 'invite_code')
    op.drop_column('groups', 'is_public')
