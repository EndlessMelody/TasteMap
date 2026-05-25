---
description: AI/ML feature implementation workflow
---

# AI Feature Implementation Workflow

Workflow for implementing vector-based AI features in TasteMap, including preference learning, recommendations, and group conflict resolution.

## When to Use

Use this workflow when:
- Implementing vector similarity search
- Adding swipe/preference learning
- Building recommendation engines
- Creating group Minimax resolution
- Adding embedding generation
- Implementing contextual scoring

## Prerequisites

Before starting:
1. Review `04-ai-algorithm.md` for mathematical foundations
2. Review `03-database-vectors.md` for pgvector patterns
3. Understand vector dimension schema (n=15)
4. Have OpenAI API key configured

## Steps

### 1. Define Vector Schema

Specify what each vector dimension represents.

**Actions:**
- [ ] Document the 15 dimensions
- [ ] Define normalization ranges
- [ ] Specify data sources for each dimension
- [ ] Create vector generation logic

**Dimension Documentation:**
```python
# backend/src/ai/vector_schema.py
"""
TasteMap Vector Schema (n=15)

Index | Trait | Range | Data Source
------|-------|-------|------------
0 | Price Level | 0-1 | price_level / 4
1 | Noise Level | 0-1 | noise_level / 5
2 | Nature/Outdoor | 0-1 | manual tagging
3 | Modern vs Historic | 0-1 | manual tagging
4 | Vietnamese Cuisine | 0/1 | tag matching
5 | Japanese Cuisine | 0/1 | tag matching
6 | Italian Cuisine | 0/1 | tag matching
7 | Mexican Cuisine | 0/1 | tag matching
8 | Other Cuisine | 0/1 | tag matching
9 | Family Friendly | 0-1 | amenity detection
10 | Romantic | 0-1 | manual tagging
11 | Instagram-worthy | 0-1 | image analysis + reviews
12 | Authenticity | 0-1 | review sentiment
13 | Health-conscious | 0-1 | menu analysis
14 | Open Late | 0-1 | hours analysis
"""

VECTOR_DIMENSIONS = {
    0: "price_level",
    1: "noise_level",
    2: "nature_outdoor",
    3: "modern_historic",
    4: "cuisine_vietnamese",
    5: "cuisine_japanese",
    6: "cuisine_italian",
    7: "cuisine_mexican",
    8: "cuisine_other",
    9: "family_friendly",
    10: "romantic",
    11: "instagram_worthy",
    12: "authenticity",
    13: "health_conscious",
    14: "open_late",
}
```

**Output:** Vector schema documentation

---

### 2. Implement Vector Generation

Create functions to generate embeddings.

**Actions:**
- [ ] Create `vector_generation.py` module
- [ ] Implement location embedding from attributes
- [ ] Implement user embedding initialization
- [ ] Add OpenAI fallback for text-based embeddings
- [ ] Test vector generation

**Rules (from `04-ai-algorithm.md`):**
- Always normalize vectors (L2 norm)
- Handle missing data gracefully (default to neutral 0.5)
- Use numpy for all operations
- Document matrix shapes in comments

**Output:** Vector generation module

**Example - Location Embedding:**
```python
# backend/src/locations/vector_generation.py
import numpy as np
from numpy.typing import NDArray
from typing import List, Dict, Any

from ..ai.vector_schema import VECTOR_DIMENSIONS


def generate_location_embedding(
    location_data: Dict[str, Any]
) -> NDArray[np.float32]:
    """
    Generate 15-dimensional embedding vector for a location.
    
    Args:
        location_data: Dictionary with location attributes
        
    Returns:
        15-dimensional vector (shape: (15,))
    """
    vector = np.zeros(15, dtype=np.float32)
    
    # 0: Price Level (normalize 1-4 to 0-1)
    price = location_data.get('price_level', 2)
    vector[0] = (price - 1) / 3.0
    
    # 1: Noise Level (normalize 1-5 to 0-1)
    noise = location_data.get('noise_level', 3)
    vector[1] = (noise - 1) / 4.0
    
    # 2: Nature/Outdoor
    tags = location_data.get('tags', [])
    vector[2] = 1.0 if any(t in ['outdoor', 'garden', 'rooftop'] for t in tags) else 0.0
    
    # 3: Modern vs Historic
    style_tags = location_data.get('style_tags', [])
    if 'modern' in style_tags:
        vector[3] = 1.0
    elif 'historic' in style_tags or 'traditional' in style_tags:
        vector[3] = 0.0
    else:
        vector[3] = 0.5  # Neutral
    
    # 4-8: Cuisine Type (one-hot encoding)
    cuisine = location_data.get('cuisine_type', '').lower()
    cuisine_map = {
        'vietnamese': 4,
        'japanese': 5,
        'italian': 6,
        'mexican': 7,
    }
    if cuisine in cuisine_map:
        vector[cuisine_map[cuisine]] = 1.0
    else:
        vector[8] = 1.0  # Other
    
    # 9: Family Friendly
    amenities = location_data.get('amenities', [])
    family_score = sum(1 for a in ['kids-menu', 'high-chairs', 'play-area'] if a in amenities)
    vector[9] = min(family_score / 2.0, 1.0)
    
    # 10: Romantic
    romantic_keywords = ['intimate', 'date-night', 'candlelit', 'romantic']
    reviews = location_data.get('reviews', [])
    romantic_mentions = sum(1 for r in reviews if any(k in r.lower() for k in romantic_keywords))
    vector[10] = min(romantic_mentions / 3.0, 1.0)
    
    # 11: Instagram-worthy
    # Based on image analysis score (0-1) or review mentions
    insta_score = location_data.get('instagram_score', 0.5)
    vector[11] = insta_score
    
    # 12: Authenticity
    # Based on review sentiment about authenticity
    authenticity_keywords = ['authentic', 'traditional', 'local favorite', 'hidden gem']
    auth_mentions = sum(1 for r in reviews if any(k in r.lower() for k in authenticity_keywords))
    vector[12] = min(auth_mentions / 2.0, 1.0)
    
    # 13: Health-conscious
    health_options = location_data.get('dietary_options', [])
    health_score = sum(1 for h in ['vegan', 'vegetarian', 'gluten-free', 'organic'] if h in health_options)
    vector[13] = min(health_score / 2.0, 1.0)
    
    # 14: Open Late
    hours = location_data.get('hours', {})
    closes_late = any('22:' in h or '23:' in h or '00:' in h for h in hours.values())
    vector[14] = 1.0 if closes_late else 0.0
    
    return vector


def generate_user_initial_vector(
    survey_responses: Dict[str, Any]
) -> NDArray[np.float32]:
    """
    Generate initial user preference vector from onboarding survey.
    
    Args:
        survey_responses: User's onboarding answers
        
    Returns:
        15-dimensional preference vector
    """
    vector = np.full(15, 0.5, dtype=np.float32)  # Start neutral
    
    # Map survey responses to dimensions
    if 'price_preference' in survey_responses:
        vector[0] = survey_responses['price_preference']  # 0-1
    
    if 'noise_tolerance' in survey_responses:
        vector[1] = survey_responses['noise_tolerance']
    
    if 'preferred_cuisines' in survey_responses:
        cuisines = survey_responses['preferred_cuisines']
        for cuisine in cuisines:
            idx = CUISINE_TO_INDEX.get(cuisine.lower())
            if idx:
                vector[idx] = 1.0  # Mark preferred
    
    # Normalize
    return l2_normalize(vector)


def l2_normalize(vector: NDArray) -> NDArray:
    """L2 normalize vector to unit length."""
    norm = np.linalg.norm(vector)
    if norm == 0:
        return vector
    return vector / norm
```

**Example - OpenAI Fallback:**
```python
# backend/src/ai/openai_embeddings.py
import openai
import numpy as np
from numpy.typing import NDArray

from ..core.config import settings

openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def generate_embedding_from_text(
    text: str,
    model: str = "text-embedding-3-small"
) -> NDArray[np.float32]:
    """
    Generate embedding using OpenAI API.
    Map to 15-dim vector for TasteMap.
    
    This is a fallback when structured data is insufficient.
    """
    response = await openai_client.embeddings.create(
        input=text,
        model=model
    )
    
    # Get 1536-dim embedding
    full_embedding = np.array(response.data[0].embedding)
    
    # Project to 15-dim using learned projection matrix
    # (In production, this would be a trained linear layer)
    projection_matrix = load_projection_matrix()  # shape: (1536, 15)
    taste_vector = np.dot(full_embedding, projection_matrix)
    
    # Normalize
    return l2_normalize(taste_vector)


def load_projection_matrix() -> NDArray:
    """Load pre-trained projection matrix."""
    # This would be loaded from a file or database
    # For now, return identity-like random projection
    return np.random.randn(1536, 15) * 0.01
```

---

### 3. Implement Similarity Search

Create vector similarity query functions.

**Actions:**
- [ ] Create `similarity.py` module
- [ ] Implement cosine similarity calculation
- [ ] Create two-pass query function
- [ ] Add Redis caching for results
- [ ] Test similarity accuracy

**Rules:**
- Use pgvector for first pass (ANN index)
- Use numpy for second pass refinement
- Cache results in Redis (TTL 5 minutes)
- Handle NaN/Inf gracefully

**Output:** Similarity search module

**Example:**
```python
# backend/src/recommendations/similarity.py
import numpy as np
from numpy.typing import NDArray
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pgvector.sqlalchemy import cosine_distance
from typing import List, Tuple

from ..locations.models import Location
from ..core.cache import cache_recommendations, get_cached_recommendations


async def find_similar_locations(
    db: AsyncSession,
    user_vector: NDArray,
    user_location: Tuple[float, float],
    first_pass_limit: int = 100,
    final_limit: int = 10,
    use_cache: bool = True
) -> List[dict]:
    """
    Two-pass similarity search:
    1. pgvector cosine similarity (fast)
    2. numpy contextual scoring (accurate)
    
    Args:
        user_vector: 15-dim user preference vector
        user_location: (lat, lon) of user
        first_pass_limit: Number of candidates from pgvector
        final_limit: Number of results to return
        
    Returns:
        List of location dicts with similarity scores
    """
    # Check cache
    if use_cache:
        cache_key = f"{user_location[0]:.2f}_{user_location[1]:.2f}"
        cached = await get_cached_recommendations(-1, cache_key)
        if cached:
            return cached
    
    # ─────────────────────────────────────────
    # FIRST PASS: pgvector cosine similarity
    # ─────────────────────────────────────────
    
    query = select(Location).where(
        Location.is_active == True
    ).order_by(
        cosine_distance(Location.embedding, user_vector)
    ).limit(first_pass_limit)
    
    result = await db.execute(query)
    candidates = result.scalars().all()
    
    # ─────────────────────────────────────────
    # SECOND PASS: Contextual scoring
    # ─────────────────────────────────────────
    
    scored = []
    
    for location in candidates:
        # Calculate contextual score
        score = calculate_contextual_score(
            user_vector=user_vector,
            location_vector=np.array(location.embedding),
            user_location=user_location,
            location_location=(location.latitude, location.longitude),
            weather_coefficient=1.0  # Would be real weather data
        )
        
        scored.append({
            'location': location,
            'score': score,
            'similarity': float(cosine_similarity_single(user_vector, np.array(location.embedding)))
        })
    
    # Sort by contextual score
    scored.sort(key=lambda x: x['score'], reverse=True)
    
    # Format results
    results = [
        {
            'id': s['location'].id,
            'name': s['location'].name,
            'score': s['score'],
            'similarity': s['similarity'],
            'distance_km': haversine_distance(
                user_location[0], user_location[1],
                s['location'].latitude, s['location'].longitude
            )
        }
        for s in scored[:final_limit]
    ]
    
    # Cache results
    if use_cache:
        await cache_recommendations(-1, cache_key, results)
    
    return results


def cosine_similarity_single(v1: NDArray, v2: NDArray) -> float:
    """Calculate cosine similarity between two vectors."""
    v1_norm = v1 / np.linalg.norm(v1)
    v2_norm = v2 / np.linalg.norm(v2)
    return float(np.dot(v1_norm, v2_norm))


def calculate_contextual_score(
    user_vector: NDArray,
    location_vector: NDArray,
    user_location: Tuple[float, float],
    location_location: Tuple[float, float],
    weather_coefficient: float,
    W1: float = 0.5,
    W2: float = 0.2,
    W3: float = 0.3
) -> float:
    """
    Contextual scoring: W₁·Sim + W₂·Weather - W₃·Distance
    """
    similarity = cosine_similarity_single(user_vector, location_vector)
    
    distance = haversine_distance(
        user_location[0], user_location[1],
        location_location[0], location_location[1]
    )
    normalized_distance = min(distance / 50.0, 1.0)
    
    score = W1 * similarity + W2 * weather_coefficient - W3 * normalized_distance
    return float(score)


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in km between two points."""
    import math
    R = 6371  # Earth's radius in km
    
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c
```

---

### 4. Implement Preference Learning

Create swipe-based vector update system.

**Actions:**
- [ ] Create `learning.py` module
- [ ] Implement dynamic learning rate calculation
- [ ] Create Redis-based rate limiting
- [ ] Handle spam detection
- [ ] Test vector updates

**Rules:**
- Learning rate α decays with spam detection
- Use exponential decay formula
- Track swipe history in Redis
- Re-normalize after updates

**Output:** Preference learning module

**Example:**
```python
# backend/src/swipes/learning.py
import numpy as np
from numpy.typing import NDArray
from typing import Literal
import time
import redis.asyncio as redis

from ..ai.vector_schema import VECTOR_DIMENSIONS

redis_client = redis.from_url("redis://localhost:6379")


async def update_user_vector_from_swipe(
    user_id: int,
    user_vector: NDArray,
    location_vector: NDArray,
    swipe_type: Literal["like", "dislike", "superlike"]
) -> NDArray:
    """
    Update user preference vector based on swipe.
    
    Formula: U_new = U_old + α · P
    
    Where:
    - α = dynamic learning rate (decays with spam)
    - P = preference delta from swipe action
    """
    # Calculate preference delta
    P = calculate_preference_delta(location_vector, swipe_type)
    
    # Calculate dynamic learning rate
    alpha = await calculate_learning_rate(user_id)
    
    # Apply update
    U_new = user_vector + alpha * P
    
    # Re-normalize
    U_new = l2_normalize(U_new)
    
    # Log swipe for rate limiting
    await log_swipe_event(user_id, swipe_type)
    
    return U_new


def calculate_preference_delta(
    location_vector: NDArray,
    swipe_type: Literal["like", "dislike", "superlike"]
) -> NDArray:
    """
    Calculate preference delta vector P.
    """
    loc_norm = l2_normalize(location_vector)
    
    if swipe_type == "like":
        return loc_norm * 0.3  # Move 30% toward location
    elif swipe_type == "superlike":
        return loc_norm * 0.5  # Move 50% toward location
    elif swipe_type == "dislike":
        return -loc_norm * 0.2  # Move 20% away
    else:
        return np.zeros(15)


async def calculate_learning_rate(user_id: int) -> float:
    """
    Calculate dynamic learning rate α.
    
    α decays exponentially if:
    - Rapid swiping detected (< 0.5s per swipe)
    - Unidirectional streak (> 10 in a row)
    """
    base_alpha = 0.1
    
    # Check recent swipe rate
    recent_swipes = await get_recent_swipes(user_id, seconds=60)
    
    if len(recent_swipes) >= 10:
        # Calculate average interval
        timestamps = [s['timestamp'] for s in recent_swipes]
        intervals = np.diff(timestamps)
        avg_interval = float(np.mean(intervals))
        
        if avg_interval < 0.5:  # Less than 0.5 seconds
            # Exponential decay
            spam_factor = 0.5 / avg_interval
            alpha = base_alpha * np.exp(-2 * spam_factor)
            return max(alpha, 0.01)  # Minimum 1%
    
    # Check for streak
    streak = await get_swipe_streak(user_id)
    if streak >= 10:
        alpha = base_alpha * np.exp(-0.1 * (streak - 10))
        return max(alpha, 0.01)
    
    return base_alpha


async def get_recent_swipes(user_id: int, seconds: int) -> list:
    """Get recent swipe events from Redis."""
    key = f"swipe_history:{user_id}"
    now = time.time()
    cutoff = now - seconds
    
    swipes = await redis_client.zrangebyscore(key, cutoff, now)
    return [{'timestamp': float(s)} for s in swipes]


async def get_swipe_streak(user_id: int) -> int:
    """Get current unidirectional swipe streak."""
    key = f"swipe_streak:{user_id}"
    streak = await redis_client.get(key)
    return int(streak) if streak else 0


async def log_swipe_event(user_id: int, swipe_type: str):
    """Log swipe for rate limiting and streak tracking."""
    now = time.time()
    
    # Add to history
    await redis_client.zadd(f"swipe_history:{user_id}", {str(now): now})
    
    # Trim to last 100
    await redis_client.zremrangebyrank(f"swipe_history:{user_id}", 0, -101)
    
    # Update streak
    streak_key = f"swipe_streak:{user_id}"
    last_swipe = await redis_client.get(f"last_swipe:{user_id}")
    
    if last_swipe == swipe_type:
        await redis_client.incr(streak_key)
    else:
        await redis_client.set(streak_key, 1)
    
    await redis_client.set(f"last_swipe:{user_id}", swipe_type)


def l2_normalize(vector: NDArray) -> NDArray:
    """L2 normalize vector."""
    norm = np.linalg.norm(vector)
    if norm == 0:
        return vector
    return vector / norm
```

---

### 5. Implement Group Minimax

Create group conflict resolution algorithm.

**Actions:**
- [ ] Create `minimax.py` module
- [ ] Implement group vector aggregation
- [ ] Create compromise memory tracking
- [ ] Test with various group compositions
- [ ] Add fairness metrics

**Rules:**
- Minimize maximum dissatisfaction
- Track compromise history per member
- Use weighted aggregation with memory boosts
- Return decision metadata for transparency

**Output:** Minimax resolution module

**Example:**
```python
# backend/src/groups/minimax.py
import numpy as np
from numpy.typing import NDArray
from dataclasses import dataclass
from typing import List, Tuple, Dict


@dataclass
class GroupMember:
    user_id: int
    preference_vector: NDArray
    compromise_score: float = 0.0  # Accumulated sacrifice


async def resolve_group_decision(
    members: List[GroupMember],
    candidates: List[dict],
    weather_coefficient: float = 1.0
) -> Tuple[dict, dict]:
    """
    Minimax group conflict resolution with memory.
    
    Returns:
        (selected_candidate, metadata)
    """
    # Calculate member weights (boost compromised members)
    weights = np.array([1.0 + m.compromise_score for m in members])
    weights = weights / weights.sum()  # Normalize
    
    # Calculate group ideal vector
    member_vectors = np.array([m.preference_vector for m in members])
    group_ideal = np.average(member_vectors, axis=0, weights=weights)
    group_ideal = l2_normalize(group_ideal)
    
    # Minimax search
    best_candidate = None
    best_max_dissatisfaction = float('inf')
    member_results = {}
    
    for candidate in candidates:
        loc_vector = np.array(candidate['embedding'])
        
        # Calculate individual scores
        scores = [
            calculate_personal_score(m.preference_vector, loc_vector, weather_coefficient)
            for m in members
        ]
        scores = np.array(scores)
        
        # Group score (weighted average)
        group_score = np.average(scores, weights=weights)
        
        # Dissatisfaction per member
        dissatisfactions = np.abs(scores - group_score)
        weighted_dissatisfactions = dissatisfactions * weights
        
        # Max dissatisfaction (the minimax target)
        max_dissatisfaction = np.max(weighted_dissatisfactions)
        
        if max_dissatisfaction < best_max_dissatisfaction:
            best_max_dissatisfaction = max_dissatisfaction
            best_candidate = candidate
            member_results = {
                m.user_id: {
                    'score': float(scores[i]),
                    'dissatisfaction': float(dissatisfactions[i])
                }
                for i, m in enumerate(members)
            }
    
    # Update compromise memories
    for member in members:
        if member.user_id in member_results:
            dissatisfaction = member_results[member.user_id]['dissatisfaction']
            # Exponential moving average
            new_score = member.compromise_score * 0.9 + dissatisfaction * 0.1
            await update_compromise_score(member.user_id, new_score)
    
    metadata = {
        'algorithm': 'minimax_with_memory',
        'max_dissatisfaction': float(best_max_dissatisfaction),
        'fairness_score': float(1.0 - best_max_dissatisfaction),
        'member_scores': member_results,
        'weights': {m.user_id: float(w) for m, w in zip(members, weights)}
    }
    
    return best_candidate, metadata


def calculate_personal_score(
    user_vector: NDArray,
    location_vector: NDArray,
    weather_coefficient: float
) -> float:
    """Calculate personal score for a user-location pair."""
    similarity = cosine_similarity(user_vector, location_vector)
    return 0.5 * similarity + 0.2 * weather_coefficient


def cosine_similarity(v1: NDArray, v2: NDArray) -> float:
    """Cosine similarity between two vectors."""
    v1_norm = l2_normalize(v1)
    v2_norm = l2_normalize(v2)
    return float(np.dot(v1_norm, v2_norm))


async def update_compromise_score(user_id: int, score: float):
    """Update compromise score in database/Redis."""
    # Implementation depends on storage choice
    pass


def l2_normalize(vector: NDArray) -> NDArray:
    """L2 normalize vector."""
    norm = np.linalg.norm(vector)
    if norm == 0:
        return vector
    return vector / norm
```

---

### 6. Add API Endpoints

Create REST endpoints for AI features.

**Actions:**
- [ ] Add recommendation endpoint
- [ ] Add swipe recording endpoint
- [ ] Add group resolution endpoint
- [ ] Add vector inspection endpoint (admin)
- [ ] Document with OpenAPI

**Output:** API endpoints

**Example:**
```python
# backend/src/recommendations/router.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Tuple

from ..core.deps import get_async_session, get_current_user
from ..users.models import User
from . import service

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("")
async def get_recommendations(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get AI-powered recommendations based on user vector and location.
    """
    user_vector = np.array(current_user.preference_vector)
    
    recommendations = await service.get_recommendations(
        db=db,
        user_vector=user_vector,
        user_location=(lat, lon),
        limit=limit
    )
    
    return {
        "success": True,
        "data": recommendations,
        "user_vector_preview": user_vector[:5].tolist()  # First 5 dims
    }
```

---

### 7. Test AI Features

Validate algorithm correctness.

**Actions:**
- [ ] Test vector generation produces valid vectors
- [ ] Test similarity search returns sensible results
- [ ] Test learning rate decay with rapid swipes
- [ ] Test Minimax with controlled groups
- [ ] Benchmark query performance

**Test Example:**
```python
# tests/test_similarity.py
def test_cosine_similarity():
    """Test cosine similarity calculation."""
    v1 = np.array([1, 0, 0])
    v2 = np.array([1, 0, 0])
    
    similarity = cosine_similarity(v1, v2)
    assert similarity == 1.0  # Same vector
    
    v3 = np.array([0, 1, 0])
    similarity = cosine_similarity(v1, v3)
    assert similarity == 0.0  # Orthogonal


def test_learning_rate_decay():
    """Test learning rate decays with rapid swipes."""
    # Simulate rapid swiping
    for _ in range(20):
        log_swipe_event(1, "like")
    
    alpha = calculate_learning_rate(1)
    assert alpha < 0.1  # Should decay from base


def test_minimax_fairness():
    """Test Minimax chooses fair option."""
    # Create group with conflicting preferences
    members = [
        GroupMember(1, np.array([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
        GroupMember(2, np.array([0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
    ]
    
    # Options: one matches member1, one matches member2, one is middle
    candidates = [
        {'id': 1, 'embedding': [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
        {'id': 2, 'embedding': [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
        {'id': 3, 'embedding': [0.5, 0.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
    ]
    
    result, metadata = resolve_group_decision(members, candidates)
    
    # Should choose middle option (id: 3) for fairness
    assert result['id'] == 3
    assert metadata['fairness_score'] > 0.8
```

---

## Commands Reference

```bash
# Generate embeddings for existing locations
python scripts/backfill_embeddings.py

# Test similarity search
python -c "from src.recommendations.similarity import *; test()"

# Benchmark query performance
pytest tests/benchmark_similarity.py -v

# Clear recommendation cache
redis-cli FLUSHDB
```
