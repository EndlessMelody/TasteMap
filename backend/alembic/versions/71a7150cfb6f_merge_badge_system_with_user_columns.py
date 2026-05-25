"""merge badge system with user columns

Revision ID: 71a7150cfb6f
Revises: 50d8f6a8ec0c, 808c5d2b84dc
Create Date: 2026-04-18 08:11:36.132635

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '71a7150cfb6f'
down_revision: Union[str, Sequence[str], None] = ('50d8f6a8ec0c', '808c5d2b84dc')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
