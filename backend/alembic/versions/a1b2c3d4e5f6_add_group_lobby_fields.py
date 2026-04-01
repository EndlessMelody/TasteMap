"""Add group lobby fields: session_vector, is_host, group_id on interactions

Revision ID: a1b2c3d4e5f6
Revises: 95af5c100ac0
Create Date: 2026-04-01 22:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '95af5c100ac0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Group Lobby Schema Updates:
    1. group_members: Add is_host (Boolean) + session_vector (Vector(15))
    2. interactions: Add group_id (nullable FK → groups.id) + composite index
    """
    # ── GroupMember: is_host ──
    op.add_column('group_members', sa.Column('is_host', sa.Boolean(), nullable=True, server_default=sa.text('false')))

    # ── GroupMember: session_vector (pgvector) ──
    op.add_column('group_members', sa.Column('session_vector', Vector(15), nullable=True))

    # ── Interactions: group_id ──
    op.add_column('interactions', sa.Column('group_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_interactions_group_id',
        'interactions', 'groups',
        ['group_id'], ['id'],
        ondelete='SET NULL',
    )
    op.create_index('ix_interactions_group_id', 'interactions', ['group_id'])

    # ── Composite Index: (group_id, action) for fast Vault queries ──
    op.create_index('ix_interactions_group_action', 'interactions', ['group_id', 'action'])


def downgrade() -> None:
    """Reverse all Group Lobby schema changes."""
    op.drop_index('ix_interactions_group_action', table_name='interactions')
    op.drop_index('ix_interactions_group_id', table_name='interactions')
    op.drop_constraint('fk_interactions_group_id', 'interactions', type_='foreignkey')
    op.drop_column('interactions', 'group_id')
    op.drop_column('group_members', 'session_vector')
    op.drop_column('group_members', 'is_host')
