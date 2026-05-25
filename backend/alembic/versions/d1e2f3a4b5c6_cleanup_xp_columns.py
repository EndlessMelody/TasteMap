"""Cleanup XP columns: remove redundant xp, fix next_level_xp default

Revision ID: d1e2f3a4b5c6
Revises: 95af5c100ac0
Create Date: 2026-04-16 23:47:00.000000

Vấn đề:
  - Cột `xp` là duplicate của `total_xp_earned` (cả 2 đều lưu tổng XP tuyệt đối).
  - `next_level_xp` có default=1000 trong DB nhưng thực tế Level 1 chỉ cần 100 XP.

Thay đổi:
  1. DATA MIGRATION: Đồng bộ total_xp_earned ← xp cho user cũ có xp > 0
     (phòng trường hợp xp được ghi nhưng total_xp_earned chưa được set)
  2. Fix default next_level_xp: 1000 → 100 (khớp với LevelConfig level=1)
  3. Drop cột `xp` redundant
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd1e2f3a4b5c6'
down_revision: Union[str, Sequence[str], None] = '3ec3a499417c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. DATA MIGRATION: Sync total_xp_earned from xp cho user cũ ────────
    # Chỉ update những user có total_xp_earned = 0 nhưng xp > 0
    # Tránh ghi đè dữ liệu đúng bằng dữ liệu cũ
    op.execute("""
        UPDATE users
        SET total_xp_earned = xp
        WHERE total_xp_earned = 0 AND xp > 0
    """)

    # ── 2. Fix next_level_xp default: 1000 → 100 ────────────────────────────
    # Giá trị 1000 là bug cũ. Level 1 chỉ cần 100 XP (theo LevelConfig).
    # Chỉ fix những user mới (total_xp_earned = 0 và next_level_xp = 1000)
    op.execute("""
        UPDATE users
        SET next_level_xp = 100
        WHERE next_level_xp = 1000 AND total_xp_earned = 0
    """)

    # Đổi server default của cột next_level_xp thành 100
    op.alter_column(
        'users',
        'next_level_xp',
        existing_type=sa.Integer(),
        server_default='100',
        existing_nullable=True,
    )

    # ── 3. Drop cột xp redundant ────────────────────────────────────────────
    op.drop_column('users', 'xp')


def downgrade() -> None:
    # Khôi phục cột xp (populate từ total_xp_earned)
    op.add_column(
        'users',
        sa.Column('xp', sa.Integer(), nullable=True, server_default='0')
    )
    op.execute("""
        UPDATE users SET xp = total_xp_earned
    """)

    # Khôi phục default next_level_xp về 1000 (giá trị cũ)
    op.alter_column(
        'users',
        'next_level_xp',
        existing_type=sa.Integer(),
        server_default='1000',
        existing_nullable=True,
    )
