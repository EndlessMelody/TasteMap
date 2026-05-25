"""repair missing locations table

Revision ID: 20260524locs
Revises: 550b5b60a341
Create Date: 2026-05-24 22:45:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "20260524locs"
down_revision: Union[str, Sequence[str], None] = "550b5b60a341"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create locations when a DB was stamped to head without the table."""
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS locations (
            id SERIAL PRIMARY KEY,
            name VARCHAR NOT NULL,
            vector VECTOR(15),
            lat DOUBLE PRECISION NOT NULL,
            lng DOUBLE PRECISION NOT NULL,
            address VARCHAR,
            city VARCHAR,
            base_score DOUBLE PRECISION DEFAULT 0.0,
            category VARCHAR,
            image_url VARCHAR,
            price_range VARCHAR,
            open_hours VARCHAR,
            rating DOUBLE PRECISION DEFAULT 0.0,
            characteristics JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        )
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_locations_id ON locations (id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_locations_name ON locations (name)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_locations_category ON locations (category)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_locations_city ON locations (city)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_locations_category ON locations (category)")
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_locations_category_id ON locations (category, id)"
    )
    op.execute("CREATE INDEX IF NOT EXISTS idx_locations_lat_lng ON locations (lat, lng)")


def downgrade() -> None:
    """Keep user data on downgrade; this migration is a repair guard."""
    pass
