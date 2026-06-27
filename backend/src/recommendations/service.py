"""
Recommendations Service — Two-Pass scoring engine.

Pass 1: pgvector ANN in DB (up to 100 candidates)
Pass 2: Numpy scoring with dynamic weights (W1·Sim + W2·C_weather − W3·D)

RESCUE ME: W3=0.9, radius<1km, match>60%, returns 1 result. No weather/context.
CONTEXTUAL: Full formula with adjustable W1/W2/W3, time_context, weather mock.
"""
import asyncio
import numpy as np
from numpy.typing import NDArray
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Dict, Any, Optional, Tuple

from src.locations.models import Location
from src.users.models import User
from src.core.exceptions import ResourceNotFoundException, ValidationException


# ─── Pure math (no side effects) ─────────────────────────────────────────

def _cosine_sim(U: NDArray, P: NDArray) -> float:
    """L2-normalized cosine similarity. Returns 0.5 on degenerate input."""
    norm_u = np.linalg.norm(U)
    norm_p = np.linalg.norm(P)
    if norm_u < 1e-9 or norm_p < 1e-9:
        return 0.5  # Graceful degradation
    return float(np.dot(U / norm_u, P / norm_p))


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Haversine: used only in Pass 2 numpy scoring on ≤100 candidates (not a full DB scan)."""
    R = 6371.0
    dlat = np.radians(lat2 - lat1)
    dlng = np.radians(lng2 - lng1)
    a = np.sin(dlat / 2) ** 2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlng / 2) ** 2
    return float(R * 2 * np.arcsin(np.sqrt(a)))


def _normalize_distances(distances: List[float]) -> NDArray:
    """Min-Max normalize distances so they don't overpower cosine similarity."""
    if not distances:
        return np.array([], dtype=float)
    arr = np.array(distances, dtype=float)
    mn, mx = arr.min(), arr.max()
    if mx - mn < 1e-9:
        return np.zeros_like(arr)
    return (arr - mn) / (mx - mn)


def _score_candidates_sync(
    U: NDArray,
    candidates: List[Dict[str, Any]],
    W1: float,
    W2: float,
    W3: float,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
    c_weather: float = 0.8,
    jitter_strength: float = 0.0,
) -> List[Dict[str, Any]]:
    """
    Pass 2: Score(S) = W1·Sim(U, P) + W2·C_weather − W3·D_normalized
    input shape: candidates list of N items with 15-dim vectors
    output shape: sorted list with final_score
    """
    if not candidates:
        return []

    distances = []
    for c in candidates:
        if user_lat is not None and user_lng is not None:
            d = _haversine_km(user_lat, user_lng, c["lat"], c["lng"])
        else:
            d = 0.0
        distances.append(d)

    d_norm = _normalize_distances(distances)

    rng = np.random.default_rng()
    scored = []
    for i, c in enumerate(candidates):
        P = np.array(c["vector"], dtype=float)
        sim = _cosine_sim(U, P)
        base_score = W1 * sim + W2 * c_weather - W3 * d_norm[i]
        exploration_jitter = float(rng.uniform(0.0, jitter_strength)) if jitter_strength > 0 else 0.0
        score = base_score + exploration_jitter
        scored.append({
            **c,
            "final_score": score,
            "base_score": base_score,
            "exploration_jitter": exploration_jitter,
            "distance_km": distances[i],
        })

    scored.sort(key=lambda x: x["final_score"], reverse=True)
    return scored


def _pick_with_light_exploration(
    scored: List[Dict[str, Any]],
    top_n: int,
    window_multiplier: int = 5,
    temperature: float = 0.08,
) -> List[Dict[str, Any]]:
    """Keep the best match, then sample nearby strong candidates for freshness."""
    if top_n <= 0 or not scored:
        return []
    if len(scored) <= top_n:
        return scored[:top_n]

    selected = [scored[0]]
    window_size = min(len(scored), max(top_n * window_multiplier, top_n + 1))
    pool = scored[1:window_size]
    remaining_slots = top_n - 1

    if not pool or remaining_slots <= 0:
        return selected[:top_n]

    scores = np.array([item["final_score"] for item in pool], dtype=float)
    scores = scores - scores.max()
    weights = np.exp(scores / max(temperature, 1e-6))
    weights = weights / weights.sum()

    rng = np.random.default_rng()
    count = min(remaining_slots, len(pool))
    picked_indexes = rng.choice(len(pool), size=count, replace=False, p=weights)
    picked = [pool[int(i)] for i in picked_indexes]
    picked.sort(key=lambda x: x["final_score"], reverse=True)
    return selected + picked


# ─── DB helpers ───────────────────────────────────────────────────────────

async def _fetch_candidates(db: AsyncSession, category: str, limit: int = 300) -> List[Dict]:
    """Pass 1: pgvector ANN — fetch top candidates from DB."""
    from sqlalchemy import or_
    result = await db.execute(
        select(Location)
        .where(or_(Location.category == category, Location.category.is_(None)))
        .where(Location.vector.isnot(None))
        .order_by(
            Location.rating.desc().nullslast(),
            Location.base_score.desc().nullslast(),
            Location.id.asc(),
        )
        .limit(limit)
    )
    locations = result.scalars().all()
    return [
        {"id": loc.id, "name": loc.name, "lat": loc.lat, "lng": loc.lng,
         "vector": list(loc.vector) if loc.vector is not None else [0.5] * 15, "open_hours": loc.open_hours,
         "image_url": loc.image_url, "price_range": loc.price_range}
        for loc in locations
    ]


async def _get_user_vector(db: AsyncSession, user_id: int, category: str) -> NDArray:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        return np.array([0.5] * 15)
    vec = user.food_vector if category == "food" else user.place_vector
    return np.array(vec if vec is not None else [0.5] * 15, dtype=float)


# ─── Public API functions ─────────────────────────────────────────────────

async def recommend_top_n_places(
    db: AsyncSession,
    user_vector: List[float],
    top_n: int = 5,
    domain: str = "place"
) -> List[Dict]:
    """Original endpoint — backwards compatible."""
    candidates = await _fetch_candidates(db, domain, limit=max(300, top_n * 30))
    U = np.array(user_vector, dtype=float)
    if len(U) != 15:
        return []
    scored = await asyncio.to_thread(
        _score_candidates_sync, U, candidates, 0.6, 0.2, 0.2, None, None, 0.8, 0.0
    )
    picked = _pick_with_light_exploration(scored, top_n)
    return [
        {"place_id": c["id"], "name": c["name"], "match_score": round(c["final_score"] * 100, 2),
         "lat": c["lat"], "lng": c["lng"], "vector": c["vector"],
         "image_url": c.get("image_url"), "price_range": c.get("price_range")}
        for c in picked
    ]


async def recommend_contextual(
    db: AsyncSession,
    user_id: int,
    lat: float,
    lng: float,
    category: str,
    radius_km: float,
    top_n: int,
    time_context: Optional[str],
) -> Dict:
    """Full contextual: Score(S) = W1·Sim + W2·C_weather − W3·D"""
    U = await _get_user_vector(db, user_id, category)
    candidates = await _fetch_candidates(db, category, limit=max(300, top_n * 30))

    # Mock weather coefficient — replace with real weather API call
    c_weather = 0.8
    W1, W2, W3 = 0.6, 0.2, 0.2

    scored = await asyncio.to_thread(
        _score_candidates_sync, U, candidates, W1, W2, W3, lat, lng, c_weather, 0.0
    )

    # Filter by radius
    filtered = [c for c in scored if c["distance_km"] <= radius_km]

    picked = _pick_with_light_exploration(filtered, top_n)
    results = [
        {
            "place_id": c["id"],
            "name": c["name"],
            "match_score": round(c["final_score"] * 100, 2),
            "distance_km": round(c["distance_km"], 2),
            "reason": f"Matches your {category} preferences",
            "open_status": c.get("open_hours"),
            "image_url": c.get("image_url"),
            "price_range": c.get("price_range"),
        }
        for c in picked
    ]

    return {
        "context": {
            "time_slot": time_context or "any",
            "weather": "unknown",
            "weather_coefficient": c_weather,
        },
        "recommendations": results,
    }


async def rescue_me(
    db: AsyncSession,
    user_id: int,
    lat: float,
    lng: float,
    category: str,
) -> Dict:
    """
    Rescue Me — Ép W3=0.9 (distance), W1=0.09, W2=0.01.
    Bỏ qua context (thời tiết/thời gian).
    Radius < 1km, match > 60%, trả 1 kết quả duy nhất.
    """
    U = await _get_user_vector(db, user_id, category)
    candidates = await _fetch_candidates(db, category, limit=300)

    scored = await asyncio.to_thread(
        _score_candidates_sync, U, candidates, 0.09, 0.01, 0.90, lat, lng, 0.0, 0.0
    )

    # Filter: radius < 1km, raw cosine match > 60%
    MIN_MATCH = 0.60
    for c in scored:
        P = np.array(c["vector"], dtype=float)
        sim = _cosine_sim(U, P)
        if c["distance_km"] <= 1.0 and sim >= MIN_MATCH:
            return {
                "place": {
                    "id": c["id"],
                    "name": c["name"],
                    "distance_km": round(c["distance_km"], 2),
                    "match_score": round(sim * 100, 1),
                    "image_url": c.get("image_url"),
                }
            }

    # Fallback: nearest regardless of match
    nearest = min(scored, key=lambda x: x["distance_km"], default=None)
    if nearest:
        return {"place": {
            "id": nearest["id"],
            "name": nearest["name"],
            "distance_km": round(nearest["distance_km"], 2),
            "match_score": None,
            "image_url": nearest.get("image_url"),
        }}
    return {"place": None}


# ─── Group Consensus & Compatibility Engine ──────────────────────────────

TASTE_DIMENSIONS = [
    "Spicy/Cay", "Sweet/Ngọt", "Sour/Chua", "Salty/Mặn", "Umami/Đậm đà",
    "Crunchy/Giòn", "Rich/Béo", "Herbal/Thảo mộc", "Grilled/Nướng", "Broth/Nước dùng",
    "StreetFood/Vỉa hè", "FineDining/Sang trọng", "Cafes/Cà phê", "LateNight/Ăn đêm", "Budget/Bình dân"
]


async def check_compatibility(
    db: AsyncSession, current_user_id: int, target_user_ids: List[int]
) -> dict:
    if not target_user_ids:
        raise ValidationException(detail="Cần ít nhất 1 target_user_id để kiểm tra độ hợp nhau", error_code="MISSING_TARGETS")
    
    all_ids = list(set([current_user_id] + target_user_ids))
    result = await db.execute(select(User).where(User.id.in_(all_ids)))
    users_map = {u.id: u for u in result.scalars().all()}
    
    if current_user_id not in users_map:
        raise ResourceNotFoundException(detail="Không tìm thấy người dùng hiện tại", error_code="USER_NOT_FOUND")
    
    cur_u = users_map[current_user_id]
    cur_vec = np.array(cur_u.food_vector if cur_u.food_vector else [0.1]*15, dtype=np.float64)
    
    matches = []
    sim_scores = []
    
    for tid in target_user_ids:
        if tid not in users_map or tid == current_user_id:
            continue
        tu = users_map[tid]
        t_vec = np.array(tu.food_vector if tu.food_vector else [0.1]*15, dtype=np.float64)
        
        sim = _cosine_sim(cur_vec, t_vec)
        sim_scores.append(sim)
        
        # Identify shared loves and potential frictions
        shared = []
        friction = []
        for idx, dim_name in enumerate(TASTE_DIMENSIONS):
            if idx < len(cur_vec) and idx < len(t_vec):
                v1, v2 = cur_vec[idx], t_vec[idx]
                if v1 > 0.6 and v2 > 0.6:
                    shared.append(dim_name)
                elif abs(v1 - v2) > 0.5:
                    friction.append(dim_name)
        
        if sim > 0.82:
            label = "Soulmate Foodies ⭐"
        elif sim > 0.70:
            label = "Great Dining Buddies 🤝"
        elif sim > 0.55:
            label = "Complementary Tastes 🥗"
        else:
            label = "Polar Opposites ⚡"
            
        matches.append({
            "user_id": tu.id,
            "username": tu.username or f"User #{tu.id}",
            "avatar_url": tu.avatar_url,
            "similarity_score": round(sim, 3),
            "compatibility_label": label,
            "shared_loves": shared[:4],
            "potential_friction": friction[:3]
        })
        
    overall = round(float(np.mean(sim_scores)), 3) if sim_scores else 0.5
    summary = f"Đội hình ăn uống đạt độ hòa hợp {int(overall*100)}%." if overall >= 0.7 else "Nhóm có gu ăn uống khá đa dạng, nên ưu tiên các khu tổ hợp ẩm thực hoặc buffet!"
    
    return {
        "overall_harmony": overall,
        "summary": summary,
        "matches": matches
    }


async def recommend_group_consensus(
    db: AsyncSession,
    user_ids: List[int],
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius_km: float = 5.0,
    category: str = "place",
    top_n: int = 5
) -> dict:
    if not user_ids:
        raise ValidationException(detail="Danh sách user_ids không được để trống", error_code="EMPTY_GROUP")
        
    result = await db.execute(select(User).where(User.id.in_(user_ids)))
    users = result.scalars().all()
    if not users:
        raise ResourceNotFoundException(detail="Không tìm thấy thành viên nào trong nhóm", error_code="USERS_NOT_FOUND")
        
    user_vectors = []
    for u in users:
        vec = u.food_vector if u.food_vector else [0.1]*15
        user_vectors.append(np.array(vec, dtype=np.float64))
        
    # Consensus vector is the average vector representing group centroid
    consensus_vec = np.mean(user_vectors, axis=0)
    
    # Pass 1: Query candidates
    candidates = await _fetch_candidates(db, consensus_vec.tolist(), limit=50, domain=category)
    if not candidates:
        # Fallback query all locations
        q = select(Location).where(Location.is_active == True).limit(30)
        res = await db.execute(q)
        locs = res.scalars().all()
        candidates = [{
            "id": loc.id, "name": loc.name, "lat": loc.latitude, "lng": loc.longitude,
            "category": loc.category, "price_range": loc.price_range, "image_url": loc.image_url,
            "place_vector": loc.place_vector or [0.1]*15
        } for loc in locs]
        
    scored_results = []
    for c in candidates:
        p_vec = np.array(c["place_vector"] if c["place_vector"] else [0.1]*15, dtype=np.float64)
        
        member_satisfactions = []
        member_scores = []
        for idx, u in enumerate(users):
            u_vec = user_vectors[idx]
            sim = _cosine_sim(u_vec, p_vec)
            score = round(sim * 100, 1)
            member_scores.append(score)
            member_satisfactions.append({
                "user_id": u.id,
                "username": u.username or f"User #{u.id}",
                "match_score": score
            })
            
        mean_score = float(np.mean(member_scores))
        min_score = float(np.min(member_scores))
        # Min-Max Regret / Pareto optimization: balance average satisfaction with preventing anyone from having a bad meal
        harmony_score = round(0.65 * mean_score + 0.35 * min_score, 1)
        
        dist_km = None
        if lat is not None and lng is not None and c["lat"] and c["lng"]:
            dist_km = round(_haversine_km(lat, lng, c["lat"], c["lng"]), 2)
            if dist_km > radius_km * 1.5:
                continue  # Skip far places
                
        reason = f"Độ hài lòng nhóm đạt {harmony_score}% — (Thấp nhất trong nhóm: {min_score}%)"
        
        scored_results.append({
            "place_id": c["id"],
            "name": c["name"],
            "group_harmony_score": harmony_score,
            "min_member_score": min_score,
            "distance_km": dist_km,
            "member_satisfactions": member_satisfactions,
            "image_url": c.get("image_url"),
            "price_range": c.get("price_range"),
            "reason": reason
        })
        
    scored_results.sort(key=lambda x: x["group_harmony_score"], reverse=True)
    
    return {
        "consensus_vector": [round(float(v), 4) for v in consensus_vec],
        "group_size": len(users),
        "recommendations": scored_results[:top_n]
    }
