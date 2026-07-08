"""Add per-stop optimiser metrics to tour_stops

Revision ID: 20260628tourm
Revises: 20260524locs
Create Date: 2026-06-28 10:00:00.000000

Thêm 3 cột (nullable, backward-compatible) được ghi bởi route optimiser
(`POST /tours/{id}/optimize`) để cinematic journey view render lại nhất quán:
  - match_score : taste match 0–100 = round(((cos(u,l)+1)/2)·100)
  - dwell_min   : số phút ước tính ở mỗi điểm (theo category/characteristics)
  - travel_min  : số phút di chuyển từ stop trước (stop đầu = 0)

Xem docs/database_schema/content.md (Table `tour_stops`).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260628tourm"
down_revision: Union[str, Sequence[str], None] = "20260524locs"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("tour_stops", sa.Column("match_score", sa.Float(), nullable=True))
    op.add_column("tour_stops", sa.Column("dwell_min", sa.Integer(), nullable=True))
    op.add_column("tour_stops", sa.Column("travel_min", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("tour_stops", "travel_min")
    op.drop_column("tour_stops", "dwell_min")
    op.drop_column("tour_stops", "match_score")
