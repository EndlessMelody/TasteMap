"""add_parent_id_to_comments

Revision ID: 6f4b0f8f2a1d
Revises: 240ee2487fb1
Create Date: 2026-04-24 13:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "6f4b0f8f2a1d"
down_revision: Union[str, Sequence[str], None] = "240ee2487fb1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("comments", sa.Column("parent_id", sa.Integer(), nullable=True))
    op.create_index(op.f("ix_comments_parent_id"), "comments", ["parent_id"], unique=False)
    op.create_foreign_key(
        "fk_comments_parent_id_comments",
        "comments",
        "comments",
        ["parent_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    op.drop_constraint("fk_comments_parent_id_comments", "comments", type_="foreignkey")
    op.drop_index(op.f("ix_comments_parent_id"), table_name="comments")
    op.drop_column("comments", "parent_id")
