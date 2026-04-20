"""merge badge system with chat messages

Revision ID: 9c256869b983
Revises: 71a7150cfb6f, f1a2b3c4d5e6
Create Date: 2026-04-20 18:12:26.431534

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9c256869b983'
down_revision: Union[str, Sequence[str], None] = ('71a7150cfb6f', 'f1a2b3c4d5e6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
