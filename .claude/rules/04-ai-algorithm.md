---
trigger: always_on
---

# TasteMap AI & Algorithm Rules

## Core Philosophy

**You are an Expert Data Scientist and Algorithm Engineer building TasteMap's "Brain"** — the mathematical engine that translates human behavior (swipes, group dynamics) into precise recommendations.

- **Priority 1: Mathematical Rigor** — Never use arbitrary `if/else` weights. All logic grounded in vector mathematics, cosine similarity, and minimax formulas.
- **Priority 2: Vector-First Thinking** — Users and locations are n-dimensional vectors. Every interaction is a matrix operation.
- **Priority 3: Matrix Operations** — Use `numpy` for all computations. Avoid Python `for` loops. Vectorized operations are mandatory.
- **Priority 4: Graceful Degradation** — Handle human unpredictability (spam swiping, contradictory groups) mathematically with decay functions.

---

## Vector Mathematics Fundamentals

### Dimension Schema (n=15)

Each vector represents 15 core travel/food traits:

| Index | Trait | Range | Description |
|-------|-------|-------|-------------|
| 0 | Price Level | 0-1 | 0=cheap, 1=expensive |
| 1 | Noise Level | 0-1 | 0=quiet, 1=loud |
| 2 | Nature/Outdoor | 0-1 | Nature exposure |
| 3 | Modern vs Historic | 0-1 | 0=historic, 1=modern |
| 4-8 | Cuisine Type | One-hot | [Vietnamese, Japanese, Italian, Mexican, Other] |
| 9 | Family Friendly | 0-1 | Kid-friendly amenities |
| 10 | Romantic | 0-1 | Date atmosphere |
| 11 | Instagram-worthy | 0-1 | Aesthetic appeal |
| 12 | Authenticity | 0-1 | Local vs touristy |
| 13 | Health-conscious | 0-1 | Healthy options |
| 14 | Open Late | 0-1 | Late-night hours |

### Vector Normalization

**Always normalize before cosine similarity:**

```python
import numpy as np
from numpy.typing import NDArray


def l2_normalize(vector: NDArray) -> NDArray:
    """L2 normalize vector to unit length."""
    norm = np.linalg.norm(vector)
    if norm == 0:
        return vector  # Return zero vector as-is
    return vector / norm


def safe_normalize(vectors: NDArray) -> NDArray:
    """Normalize array of vectors, handling edge cases."""
    # Handle NaN/Inf
    vectors = np.nan_to_num(vectors, nan=0.0, posinf=0.0, neginf=0.0)
    
    # Calculate norms for each row
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    
    # Avoid division by zero
    norms = np.where(norms == 0, 1, norms)
    
    return vectors / norms
```

### Cosine Similarity

```python
def cosine_similarity(
    user_vector: NDArray, 
    location_vectors: NDArray
) -> NDArray:
    """
    Calculate cosine similarity between user and multiple locations.
    
    Args:
        user_vector: shape (15,) - single user preference vector
        location_vectors: shape (N, 15) - N location embedding vectors
        
    Returns:
        similarities: shape (N,) - similarity scores [-1, 1]
    """
    # Ensure user_vector is 2D for broadcasting: (1, 15)
    if user_vector.ndim == 1:
        user_vector = user_vector.reshape(1, -1)
    
    # Normalize both (critical for correct similarity)
    user_norm = safe_normalize(user_vector)      # shape: (1, 15)
    loc_norm = safe_normalize(location_vectors)  # shape: (N, 15)
    
    # Cosine similarity = dot product of normalized vectors
    # shape: (1, 15) @ (15, N) = (1, N) -> squeeze to (N,)
    similarities = np.dot(user_norm, loc_norm.T).squeeze()
    
    # Handle edge cases: return 0 for NaN/Inf
    similarities = np.nan_to_num(similarities, nan=0.0, posinf=1.0, neginf=-1.0)
    
    return similarities
```

---

## Preference Evolution (Swipe Learning)

### Mathematical Formula

```
U⃗_new = U⃗_old + α · P⃗
```

Where:
- `U⃗_old` = Current user preference vector (15-dim)
- `α` = Dynamic learning rate (decays with spam detection)
- `P⃗` = Preference delta vector derived from swipe action

### Implementation

```python
from typing import Literal
import numpy as np
from numpy.typing import NDArray
import redis.asyncio as redis

redis_client = redis.from_url("redis://localhost:6379")


async def update_user_preference_vector(
    user_id: int,
    location_vector: NDArray,
    swipe_action: Literal["like", "dislike", "superlike"],
    current_vector: NDArray
) -> NDArray:
    """
    Update user preference vector based on swipe action.
    
    Formula: U_new = U_old + α · P
    """
    # ─────────────────────────────────────────
    # 1. Calculate Preference Delta (P)
    # ─────────────────────────────────────────
    
    # Normalize location vector
    loc_norm = l2_normalize(location_vector)
    
    # Calculate delta based on swipe type
    if swipe_action == "like":
        P = loc_norm * 0.3  # Move 30% toward location
    elif swipe_action == "superlike":
        P = loc_norm * 0.5  # Move 50% toward location
    elif swipe_action == "dislike":
        P = -loc_norm * 0.2  # Move 20% away from location
    else:
        P = np.zeros(15)
    
    # ─────────────────────────────────────────
    # 2. Calculate Dynamic Learning Rate (α)
    # ─────────────────────────────────────────
    
    alpha = await _calculate_learning_rate(user_id)
    
    # ─────────────────────────────────────────
    # 3. Apply Update
    # ─────────────────────────────────────────
    
    U_new = current_vector + alpha * P
    
    # Re-normalize to maintain unit vector (optional based on design)
    U_new = l2_normalize(U_new)
    
    # ─────────────────────────────────────────
    # 4. Log for Analysis
    # ─────────────────────────────────────────
    
    await _log_swipe_event(user_id, swipe_action, alpha)
    
    return U_new


async def _calculate_learning_rate(user_id: int) -> float:
    """
    Calculate dynamic learning rate α.
    
    α decays exponentially if:
    - Rapid swiping detected (< 0.5s per swipe)
    - Unidirectional streak (> 10 likes or dislikes in a row)
    """
    base_alpha = 0.1
    
    # Check for rapid swiping
    recent_swipes = await _get_recent_swipes(user_id, seconds=60)
    
    if len(recent_swipes) >= 10:
        # Calculate average time between swipes
        times = [s['timestamp'] for s in recent_swipes]
        intervals = np.diff(times)
        avg_interval = np.mean(intervals)
        
        if avg_interval < 0.5:  # Less than 0.5 seconds
            # Exponential decay: α = base * exp(-k * spam_factor)
            spam_factor = 0.5 / avg_interval
            alpha = base_alpha * np.exp(-2 * spam_factor)
            return max(alpha, 0.01)  # Minimum 1% learning rate
    
    # Check for unidirectional streak
    streak = await _get_swipe_streak(user_id)
    if streak >= 10:
        # Decay based on streak length
        alpha = base_alpha * np.exp(-0.1 * (streak - 10))
        return max(alpha, 0.01)
    
    return base_alpha


async def _get_recent_swipes(user_id: int, seconds: int) -> list:
    """Get recent swipe events from Redis."""
    key = f"swipe_history:{user_id}"
    now = time.time()
    cutoff = now - seconds
    
    # Get swipes within time window
    swipes = await redis_client.zrangebyscore(key, cutoff, now, withscores=True)
    return [{'timestamp': s[1]} for s in swipes]


async def _get_swipe_streak(user_id: int) -> int:
    """Get current unidirectional swipe streak."""
    key = f"swipe_streak:{user_id}"
    streak_data = await redis_client.get(key)
    
    if streak_data:
        return int(streak_data)
    return 0


async def _log_swipe_event(user_id: int, action: str, alpha: float):
    """Log swipe for rate limiting and analysis."""
    now = time.time()
    
    # Add to sorted set with timestamp
    await redis_client.zadd(f"swipe_history:{user_id}", {str(now): now})
    
    # Trim to last 100 swipes
    await redis_client.zremrangebyrank(f"swipe_history:{user_id}", 0, -101)
    
    # Update streak counter
    streak_key = f"swipe_streak:{user_id}"
    current_streak = await redis_client.get(streak_key)
    
    if current_streak:
        streak = int(current_streak)
        # Check if same direction
        last_action = await redis_client.get(f"last_swipe:{user_id}")
        
        if last_action == action:
            await redis_client.incr(streak_key)
        else:
            await redis_client.set(streak_key, 1)
    else:
        await redis_client.set(streak_key, 1)
    
    await redis_client.set(f"last_swipe:{user_id}", action)
```

---

## Group Conflict Resolution (Minimax)

### Mathematical Formula

```
min( max |Scoreᵢ - Score_ideal| )
    i∈Group
```

**With Memory Compensation:**
- Track how much each member was "sacrificed" in previous decisions
- Mathematically boost their weight in subsequent decisions

### Implementation

```python
from dataclasses import dataclass
from typing import List, Tuple
import numpy as np
from numpy.typing import NDArray


@dataclass
class GroupMember:
    user_id: int
    preference_vector: NDArray  # shape: (15,)
    compromise_history: float  # Accumulated sacrifice score


async def resolve_group_recommendation(
    members: List[GroupMember],
    candidate_locations: List[dict],
    weather_coefficient: float = 1.0,
    memory_decay: float = 0.9
) -> Tuple[dict, dict]:
    """
    Use Minimax to find location that minimizes maximum dissatisfaction.
    
    Returns:
        (selected_location, decision_metadata)
    """
    
    # ─────────────────────────────────────────
    # 1. Calculate Member Weights (with memory)
    # ─────────────────────────────────────────
    
    # Boost members with high compromise history
    weights = np.array([
        1.0 + m.compromise_history for m in members
    ])
    
    # Normalize weights
    weights = weights / weights.sum()
    
    # ─────────────────────────────────────────
    # 2. Calculate Group Ideal Vector
    # ─────────────────────────────────────────
    
    # Weighted average of member preference vectors
    member_vectors = np.array([m.preference_vector for m in members])
    group_ideal = np.average(member_vectors, axis=0, weights=weights)
    group_ideal = l2_normalize(group_ideal)
    
    # ─────────────────────────────────────────
    # 3. Score All Candidates (Minimax)
    # ─────────────────────────────────────────
    
    best_location = None
    best_max_dissatisfaction = float('inf')
    member_scores = {}  # Track for memory update
    
    for location in candidate_locations:
        loc_vector = np.array(location['embedding'])
        
        # Calculate individual member scores
        scores = []
        for i, member in enumerate(members):
            # Personal score for this member
            member_score = _calculate_personal_score(
                user_vector=member.preference_vector,
                location_vector=loc_vector,
                weather_coefficient=weather_coefficient
            )
            scores.append(member_score)
        
        scores = np.array(scores)
        
        # Calculate dissatisfaction for each member
        # |Scoreᵢ - Score_ideal| where Score_ideal is group ideal similarity
        group_score = _calculate_personal_score(
            user_vector=group_ideal,
            location_vector=loc_vector,
            weather_coefficient=weather_coefficient
        )
        
        dissatisfactions = np.abs(scores - group_score)
        
        # Apply member weights to dissatisfactions
        weighted_dissatisfactions = dissatisfactions * weights
        
        # Minimax: find maximum dissatisfaction for this location
        max_dissatisfaction = np.max(weighted_dissatisfactions)
        
        # Track member scores for best location
        if max_dissatisfaction < best_max_dissatisfaction:
            best_max_dissatisfaction = max_dissatisfaction
            best_location = location
            member_scores = {
                m.user_id: {
                    'score': scores[i],
                    'dissatisfaction': dissatisfactions[i],
                    'weighted_dissatisfaction': weighted_dissatisfactions[i]
                }
                for i, m in enumerate(members)
            }
    
    # ─────────────────────────────────────────
    # 4. Update Compromise Memory
    # ─────────────────────────────────────────
    
    # Increase compromise history for members with high dissatisfaction
    for member in members:
        if member.user_id in member_scores:
            dissatisfaction = member_scores[member.user_id]['dissatisfaction']
            
            # Decay old history and add new compromise
            new_history = (
                member.compromise_history * memory_decay + 
                dissatisfaction * (1 - memory_decay)
            )
            
            await _update_compromise_history(member.user_id, new_history)
    
    # ─────────────────────────────────────────
    # 5. Return with Explanation
    # ─────────────────────────────────────────
    
    metadata = {
        'algorithm': 'minimax_with_memory',
        'group_ideal_similarity': _calculate_personal_score(
            user_vector=group_ideal,
            location_vector=np.array(best_location['embedding']),
            weather_coefficient=weather_coefficient
        ),
        'max_dissatisfaction': best_max_dissatisfaction,
        'member_breakdown': member_scores,
        'fairness_score': 1.0 - best_max_dissatisfaction,  # Higher is fairer
        'explanation': _generate_explanation(member_scores, members)
    }
    
    return best_location, metadata


def _calculate_personal_score(
    user_vector: NDArray,
    location_vector: NDArray,
    weather_coefficient: float,
    W1: float = 0.5,
    W2: float = 0.2,
    W3: float = 0.3
) -> float:
    """
    Personal scoring function:
    Score = W₁ · Sim(U⃗, L⃗) + W₂ · C_weather
    """
    # Cosine similarity
    similarity = cosine_similarity(user_vector, location_vector.reshape(1, -1))[0]
    
    # Calculate score
    score = W1 * similarity + W2 * weather_coefficient
    
    return float(score)


def _generate_explanation(
    member_scores: dict,
    members: List[GroupMember]
) -> str:
    """Generate human-readable explanation of decision."""
    # Find most and least satisfied members
    sorted_members = sorted(
        member_scores.items(),
        key=lambda x: x[1]['dissatisfaction']
    )
    
    most_satisfied = sorted_members[0]
    least_satisfied = sorted_members[-1]
    
    return (
        f"This choice best balances group preferences. "
        f"Most aligned member scored {most_satisfied[1]['score']:.2f}, "
        f"while the biggest compromise was {least_satisfied[1]['dissatisfaction']:.2f} "
        f"(fairness: {(1-least_satisfied[1]['dissatisfaction'])*100:.0f}%)"
    )
```

---

## Contextual Scoring

### Full Scoring Formula

```
Score(S) = W₁ · Sim(U⃗, P⃗) + W₂ · C_weather - W₃ · D_normalized
```

Where:
- `Sim(U⃗, P⃗)` = Cosine similarity between user and location vectors
- `C_weather` = Weather coefficient (0-1, higher is better)
- `D_normalized` = Distance normalized to 0-1 range
- `W₁, W₂, W₃` = Tunable weights (default: 0.5, 0.2, 0.3)

### Implementation

```python
import math
import numpy as np
from numpy.typing import NDArray


def contextual_score(
    user_vector: NDArray,          # shape: (15,)
    location_vector: NDArray,      # shape: (15,)
    user_coords: Tuple[float, float],   # (lat, lon)
    location_coords: Tuple[float, float],  # (lat, lon)
    weather_coefficient: float,
    W1: float = 0.5,
    W2: float = 0.2,
    W3: float = 0.3,
    max_distance_km: float = 50.0
) -> float:
    """
    Calculate contextual score for a location.
    
    Score = W₁·Sim(U,P) + W₂·C_weather - W₃·D_normalized
    """
    
    # 1. Vector Similarity (W₁ term)
    similarity = cosine_similarity(
        user_vector, 
        location_vector.reshape(1, -1)
    )[0]
    
    # 2. Weather Coefficient (W₂ term)
    # Already provided as 0-1 value
    weather_score = weather_coefficient
    
    # 3. Distance (W₃ term)
    distance_km = haversine_distance(
        user_coords[0], user_coords[1],
        location_coords[0], location_coords[1]
    )
    
    # Normalize distance: 0=at user location, 1=at max_distance or beyond
    normalized_distance = min(distance_km / max_distance_km, 1.0)
    
    # Calculate final score
    score = (W1 * similarity) + (W2 * weather_score) - (W3 * normalized_distance)
    
    # Clamp to valid range
    return float(np.clip(score, -1.0, 1.0))


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates in kilometers."""
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

## Graph-Based Tour Routing

### Modified Dijkstra's Algorithm

```python
import heapq
from typing import Dict, List, Set, Tuple
import numpy as np


class LocationNode:
    """Graph node representing a location."""
    
    def __init__(self, id: int, lat: float, lon: float, embedding: np.ndarray):
        self.id = id
        self.lat = lat
        self.lon = lon
        self.embedding = embedding
        self.neighbors: Dict[int, float] = {}  # node_id -> edge_weight


def build_tour_graph(locations: List[dict]) -> Dict[int, LocationNode]:
    """Build graph from locations."""
    nodes = {}
    
    for loc in locations:
        node = LocationNode(
            id=loc['id'],
            lat=loc['latitude'],
            lon=loc['longitude'],
            embedding=np.array(loc['embedding'])
        )
        nodes[loc['id']] = node
    
    # Connect nodes within reasonable distance (e.g., 10km)
    for node1 in nodes.values():
        for node2 in nodes.values():
            if node1.id != node2.id:
                distance = haversine_distance(
                    node1.lat, node1.lon,
                    node2.lat, node2.lon
                )
                if distance < 10.0:  # 10km threshold
                    # Edge weight = composite cost
                    edge_weight = calculate_edge_cost(node1, node2)
                    node1.neighbors[node2.id] = edge_weight
    
    return nodes


def calculate_edge_cost(
    node1: LocationNode, 
    node2: LocationNode,
    traffic_factor: float = 1.0,
    weather_penalty: float = 0.0
) -> float:
    """
    Calculate composite edge cost.
    
    Cost = Travel_Time + Weather_Penalty - Location_Score
    """
    # Distance-based travel time (assume 30km/h average in city)
    distance = haversine_distance(node1.lat, node1.lon, node2.lat, node2.lon)
    travel_time = (distance / 30.0) * 60  # Convert to minutes
    
    # Apply traffic factor
    adjusted_travel = travel_time * traffic_factor
    
    # Weather penalty (e.g., rain adds 5-10 minutes)
    weather_cost = weather_penalty
    
    # Location score bonus (negative cost = bonus)
    # Use similarity between consecutive locations
    similarity = cosine_similarity(
        node1.embedding, 
        node2.embedding.reshape(1, -1)
    )[0]
    location_bonus = -similarity * 5  # Up to 5 minute bonus
    
    total_cost = adjusted_travel + weather_cost + location_bonus
    
    return max(total_cost, 0.1)  # Minimum cost


def find_optimal_tour_route(
    graph: Dict[int, LocationNode],
    start_id: int,
    must_visit: Set[int],
    max_time_minutes: float = 240  # 4 hours
) -> List[int]:
    """
    Find optimal tour route visiting all must_visit locations.
    
    Uses modified Dijkstra's with backtracking for multiple stops.
    """
    
    def dijkstra_partial(
        current: int, 
        remaining: Set[int], 
        time_budget: float
    ) -> Tuple[List[int], float]:
        """Find best next steps from current position."""
        
        if not remaining or time_budget <= 0:
            return [current], 0.0
        
        best_route = [current]
        best_score = float('inf')
        
        for next_id in remaining:
            edge_cost = graph[current].neighbors.get(next_id, float('inf'))
            
            if edge_cost > time_budget:
                continue
            
            # Recursively find route from next
            sub_route, sub_cost = dijkstra_partial(
                next_id,
                remaining - {next_id},
                time_budget - edge_cost
            )
            
            total_cost = edge_cost + sub_cost
            total_route = [current] + sub_route[1:]
            
            if total_cost < best_score:
                best_score = total_cost
                best_route = total_route
        
        return best_route, best_score
    
    # Start optimization
    route, _ = dijkstra_partial(start_id, must_visit, max_time_minutes)
    
    return route
```

---

## Rescue Me Endpoint

### Fast Fallback Algorithm

```python
async def calculate_rescue_recommendation(
    db: AsyncSession,
    user_id: int,
    user_location: Tuple[float, float],
    max_distance_km: float = 2.0
) -> dict:
    """
    'Rescue Me' - Fast fallback recommendation core logic.
    Bypasses heavy algorithms, prioritizes distance with minimum quality threshold.
    
    > 👉 **CRITICAL WARNING:** This is the algorithmic core. For the EXACT expected 
    > API Response Schema (status code, fields, nested dicts), you MUST refer to 
    > `docs/api/discovery.md`. Do not return arbitrary dictionary structures to the client.
    """
    # Get user vector
    user = await db.get(User, user_id)
    user_vector = np.array(user.preference_vector)
    
    # Query: Closest locations with minimum quality
    query = select(Location).where(
        and_(
            Location.is_active == True,
            Location.rating >= 3.5,
            Location.review_count >= 10
        )
    ).order_by(
        # Order by distance (simple, fast)
        func.sqrt(
            func.pow(Location.latitude - user_location[0], 2) +
            func.pow(Location.longitude - user_location[1], 2)
        )
    ).limit(10)
    
    result = await db.execute(query)
    nearby = result.scalars().all()
    
    if not nearby:
        return None
    
    # ... algorithmic scoring logic ...
    
    # Return raw algorithmic result - API Router must format this according to docs/api/*.md!
    return {
        "location": nearby[0],
        "algorithm": "rescue_me_fast"
    }
```

---

## File References

**Algorithm Implementations:**
- `backend/src/recommendations/service.py` - Recommendation engine
- `backend/src/swipes/service.py` - Swipe learning
- `backend/src/groups/service.py` - Minimax group resolution
- `backend/src/tours/service.py` - Tour routing

**Model References:**
- `backend/src/users/models.py` - User preference_vector
- `backend/src/locations/models.py` - Location embedding

**API Endpoints:**
👉 **MUST REFER TO:** `docs/api/README.md` for all algorithm-related endpoints.

**Database Schemas:**
👉 **MUST REFER TO:** `docs/database_schema/README.md` for actual vector column details.
