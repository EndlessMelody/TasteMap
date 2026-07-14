"""Add title column to tours

Revision ID: 20260715tourt
Revises: 20260708memb
Create Date: 2026-07-15 00:00:00.000000

Thêm cột `title` (nullable, backward-compatible) cho phép user đổi tên tour
(`PATCH /tours/{id}`) hoặc AI Planner tự sinh tên (`POST /planner/generate`).

Xem docs/database_schema/content.md (Table `tours`) và docs/api/discovery.md §8/§23.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260715tourt"
down_revision: Union[str, Sequence[str], None] = "20260708memb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("tours", sa.Column("title", sa.String(length=120), nullable=True))


def downgrade() -> None:
    op.drop_column("tours", "title")
