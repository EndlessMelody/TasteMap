---
trigger: always_on
---

# TasteMap Database & Vector Rules

## Core Philosophy

**You are a Database Architect specializing in PostgreSQL, pgvector, and high-performance vector similarity search.**

- **Priority 1: Vector-First Design** — Both users and locations are n-dimensional vectors
- **Priority 2: Two-Pass Querying** — pgvector ANN index + Python refinement
- **Priority 3: Performance** — Proper indexing, connection pooling, query optimization
- **Priority 4: Data Integrity** — Alembic migrations, constraints, relationships

---

## SQLAlchemy 2.0 Style

### Model Definition

> 👉 **CRITICAL WARNING:** The following are **abbreviated examples** solely to demonstrate `pgvector` syntax and relationships. 
> For the **exact, authoritative list of columns and constraints**, you MUST refer to `docs/database_schema/README.md`.

```python
# backend/src/users/models.py
from typing import List, Optional
from sqlalchemy import Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

from ..db.base import Base


class User(Base):
    """User model with preference vector."""
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    # ... refer to docs/database_schema/core.md for actual columns ...
    
    # Vector field - 15-dimensional preference vector
    preference_vector: Mapped[Optional[List[float]]] = mapped_column(
        Vector(15),
        nullable=True
    )
```

### Location Model with Vector

```python
# backend/src/locations/models.py
from typing import List
from sqlalchemy import Integer, Index
from sqlalchemy.orm import Mapped, mapped_column
from pgvector.sqlalchemy import Vector

from ..db.base import Base


class Location(Base):
    """Location/Restaurant model with embedding vector."""
    __tablename__ = "locations"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    # ... refer to docs/database_schema/core.md for actual columns ...
    
    # 15-dimensional embedding vector
    embedding: Mapped[List[float]] = mapped_column(Vector(15))
    
    # Vector index for fast similarity search
    __table_args__ = (
        Index(
            'ix_locations_embedding_ivfflat',
            'embedding',
            postgresql_using='ivfflat',
            postgresql_with={'lists': 100}
        ),
    )
```

---

## pgvector Integration

### Vector Column Definition

```python
from pgvector.sqlalchemy import Vector

# Fixed dimension (recommended for production)
embedding: Mapped[List[float]] = mapped_column(Vector(15))

# For variable dimensions (use sparingly)
# embedding: Mapped[List[float]] = mapped_column(Vector())
```

### Vector Indexing Strategies

**IVFFlat (Approximate Nearest Neighbor):**
```python
__table_args__ = (
    Index(
        'ix_locations_embedding_ivfflat',
        'embedding',
        postgresql_using='ivfflat',
        postgresql_with={'lists': 100}  # ~1000 rows per list
    ),
)
```
- Good for: Medium datasets (10k-100k vectors)
- Pros: Fast queries, reasonable accuracy
- Cons: Approximate results, index build time

**HNSW (Hierarchical Navigable Small World):**
```python
__table_args__ = (
    Index(
        'ix_locations_embedding_hnsw',
        'embedding',
        postgresql_using='hnsw',
        postgresql_with={'m': 16, 'ef_construction': 64}
    ),
)
```
- Good for: Large datasets (100k+ vectors)
- Pros: Better accuracy, good for high-dimensional data
- Cons: More memory, slower index build

**No Index (Exact Search):**
```python
# Just use the column without index for small datasets (<1000)
# or when exact results are critical
```

### Vector Similarity Queries

```python
from sqlalchemy import select, func
from pgvector.sqlalchemy import cosine_distance, l2_distance

# Cosine similarity (preferred for TasteMap - direction matters more than magnitude)
async def find_similar_locations(
    db: AsyncSession,
    user_vector: List[float],
    limit: int = 100
) -> List[Location]:
    """Find locations most similar to user preferences."""
    
    # Convert to pgvector format
    vector_literal = f'[{",".join(map(str, user_vector))}]'
    
    query = select(Location).where(
        Location.is_active == True
    ).order_by(
        cosine_distance(Location.embedding, vector_literal)
    ).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()


# L2/Euclidean distance (when magnitude matters)
async def find_nearby_locations(
    db: AsyncSession,
    user_vector: List[float],
    max_distance: float = 0.5,
    limit: int = 50
) -> List[Location]:
    """Find locations within vector distance threshold."""
    
    query = select(Location).where(
        and_(
            Location.is_active == True,
            l2_distance(Location.embedding, user_vector) < max_distance
        )
    ).order_by(
        l2_distance(Location.embedding, user_vector)
    ).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()
```

---

## Two-Pass Query Pattern

### Implementation

```python
# backend/src/recommendations/service.py
import numpy as np
from typing import List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession

from ..locations.models import Location


async def get_recommendations(
    db: AsyncSession,
    user_vector: List[float],
    user_location: Tuple[float, float],  # (lat, lon)
    weather_coefficient: float = 1.0,
    first_pass_limit: int = 100,
    final_limit: int = 10
) -> List[dict]:
    """
    Two-pass recommendation algorithm:
    1. First pass: pgvector ANN index for fast similarity
    2. Second pass: Python scoring with dynamic variables
    """
    
    # ─────────────────────────────────────────
    # FIRST PASS: Fast vector similarity (pgvector)
    # ─────────────────────────────────────────
    
    # Get candidates using IVFFlat index
    candidates = await _get_vector_candidates(
        db=db,
        user_vector=user_vector,
        limit=first_pass_limit
    )
    
    # ─────────────────────────────────────────
    # SECOND PASS: Refined scoring (Python/numpy)
    # ─────────────────────────────────────────
    
    scored_locations = []
    
    for location in candidates:
        score = _calculate_contextual_score(
            location=location,
            user_vector=user_vector,
            user_location=user_location,
            weather_coefficient=weather_coefficient
        )
        scored_locations.append((location, score))
    
    # Sort by score descending
    scored_locations.sort(key=lambda x: x[1], reverse=True)
    
    # Return top results
    return [
        {
            "location": location,
            "score": score,
            "match_details": _explain_score(location, user_vector)
        }
        for location, score in scored_locations[:final_limit]
    ]


async def _get_vector_candidates(
    db: AsyncSession,
    user_vector: List[float],
    limit: int
) -> List[Location]:
    """First pass: Use pgvector index for fast retrieval."""
    from pgvector.sqlalchemy import cosine_distance
    
    query = select(Location).where(
        Location.is_active == True
    ).order_by(
        cosine_distance(Location.embedding, user_vector)
    ).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()


def _calculate_contextual_score(
    location: Location,
    user_vector: List[float],
    user_location: Tuple[float, float],
    weather_coefficient: float,
    W1: float = 0.5,  # Similarity weight
    W2: float = 0.2,  # Weather weight
    W3: float = 0.3   # Distance weight
) -> float:
    """
    Score(S) = W₁ · Sim(U⃗, P⃗) + W₂ · C_weather - W₃ · D
    """
    
    # Cosine similarity (numpy for precision)
    loc_vector = np.array(location.embedding)
    usr_vector = np.array(user_vector)
    
    # Normalize both vectors
    loc_norm = loc_vector / np.linalg.norm(loc_vector)
    usr_norm = usr_vector / np.linalg.norm(usr_vector)
    
    similarity = np.dot(loc_norm, usr_norm)
    
    # Distance (normalized 0-1)
    distance_km = _haversine_distance(
        user_location[0], user_location[1],
        location.latitude, location.longitude
    )
    normalized_distance = min(distance_km / 50.0, 1.0)  # Cap at 50km
    
    # Calculate final score
    score = (
        W1 * similarity +
        W2 * weather_coefficient -
        W3 * normalized_distance
    )
    
    return float(score)


def _haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points in kilometers."""
    import math
    
    R = 6371  # Earth's radius in km
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_lat / 2) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) *
         math.sin(delta_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c
```

---

## Alembic Migrations

### Migration Best Practices

```python
# backend/alembic/versions/2024_01_15_add_location_vectors.py
"""Add embedding vectors to locations table.

Revision ID: 2024_01_15_add_location_vectors
Revises: previous_revision_id
Create Date: 2024-01-15 10:00:00.000000
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

# revision identifiers
revision: str = '2024_01_15_add_location_vectors'
down_revision: Union[str, None] = 'previous_revision_id'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add embedding column and index."""
    
    # Add vector column
    op.add_column(
        'locations',
        sa.Column(
            'embedding',
            Vector(15),
            nullable=True,
            comment='15-dim location embedding vector'
        )
    )
    
    # Create IVFFlat index for fast similarity search
    op.create_index(
        'ix_locations_embedding_ivfflat',
        'locations',
        ['embedding'],
        unique=False,
        postgresql_using='ivfflat',
        postgresql_with={'lists': 100}
    )
    
    # Add comment
    op.execute("""
        COMMENT ON COLUMN locations.embedding IS 
        '15-dim vector: [price_norm, noise_norm, nature, food_type...]';
    """)


def downgrade() -> None:
    """Remove embedding column and index."""
    
    # Drop index first
    op.drop_index('ix_locations_embedding_ivfflat', table_name='locations')
    
    # Drop column
    op.drop_column('locations', 'embedding')
```

### Common Migration Commands

```bash
# Generate migration from model changes
cd backend && alembic revision --autogenerate -m "add location vectors"

# Apply migrations
cd backend && alembic upgrade head

# Rollback one revision
cd backend && alembic downgrade -1

# View current revision
cd backend && alembic current

# View history
cd backend && alembic history
```

---

## Connection Pooling

### Configuration

```python
# backend/src/db/session.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker

from ..core.config import settings

# Create async engine with connection pooling
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # Log SQL in debug mode
    pool_size=20,         # Maintain 20 connections
    max_overflow=10,      # Allow 10 extra connections
    pool_timeout=30,      # Wait 30s for available connection
    pool_recycle=3600,    # Recycle connections after 1 hour
    pool_pre_ping=True   # Verify connections before use
)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting async database sessions."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
```

---

## Redis Caching for Vector Data

### Pattern

```python
# backend/src/core/cache.py
import json
import redis.asyncio as redis
from typing import Optional, List

from ..core.config import settings

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


async def get_cached_recommendations(
    user_id: int,
    location_hash: str
) -> Optional[List[dict]]:
    """Get cached recommendations for user."""
    cache_key = f"recommendations:{user_id}:{location_hash}"
    cached = await redis_client.get(cache_key)
    
    if cached:
        return json.loads(cached)
    return None


async def cache_recommendations(
    user_id: int,
    location_hash: str,
    recommendations: List[dict],
    ttl: int = 300  # 5 minutes
):
    """Cache recommendations with TTL."""
    cache_key = f"recommendations:{user_id}:{location_hash}"
    await redis_client.setex(
        cache_key,
        ttl,
        json.dumps(recommendations, default=str)
    )


async def invalidate_user_cache(user_id: int):
    """Invalidate all cached data for user."""
    pattern = f"recommendations:{user_id}:*"
    keys = await redis_client.keys(pattern)
    if keys:
        await redis_client.delete(*keys)
```

---

## File References

**Database Setup:**
- `backend/src/db/base.py` - SQLAlchemy Base
- `backend/src/db/session.py` - AsyncSession factory
- `backend/alembic/env.py` - Alembic configuration

**Models:**
- `backend/src/users/models.py` - User with preference_vector
- `backend/src/locations/models.py` - Location with embedding
- `backend/src/groups/models.py` - Group lobby
- `backend/src/swipes/models.py` - Swipe tracking

**Migrations:**
- `backend/alembic/versions/` - Migration files
- Naming: `YYYY_MM_DD_description.py`

**Vector Service:**
- `backend/src/recommendations/service.py` - Two-pass query implementation
