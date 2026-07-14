"""
Planner Service — AI Planner "pro": a thin layer that picks a shortlist of
candidate locations via mood-boosted cosine similarity, then hands off to the
REAL tours engine (create tour + add stops + optimize) to order/score them.

See docs/math_models.md ("AI Planner — Mood-Boosted Candidate Selection") and
docs/api/discovery.md §23.
"""
import json
import logging
import re
from typing import Optional

import httpx
import numpy as np
from numpy.typing import NDArray
from sqlalchemy import or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.core.config import settings
from src.core.exceptions import ResourceNotFoundException
from src.locations.models import Location
from src.membership.entitlements import get_entitlements
from src.planner.schemas import PlannerGenerateRequest
from src.recommendations.service import _cosine_sim, _get_user_vector
from src.tours import service as tours_service
from src.tours.schemas import OptimizeRequest, StopCreate, TourCreate
from src.users.models import User

log = logging.getLogger(__name__)

# ── Mood → 15-dim taste vector boost (see docs/math_models.md) ─────────────
# Dims (TASTE_DIMENSIONS in recommendations/service.py):
# 0 Spicy, 1 Sweet, 2 Sour, 3 Salty, 4 Umami, 5 Crunchy, 6 Rich, 7 Herbal,
# 8 Grilled, 9 Broth, 10 StreetFood, 11 FineDining, 12 Cafes, 13 LateNight, 14 Budget
MOOD_BOOSTS: dict[str, dict[int, float]] = {
    "casual": {10: 0.25, 12: 0.2, 14: 0.2},
    "adventurous": {0: 0.25, 8: 0.2, 10: 0.2},
    "romantic": {11: 0.3, 6: 0.15},
    "family": {9: 0.2, 12: 0.15, 14: 0.2},
}

# Cuisine hint → keyword table (matched against name/characteristics), mirrors
# the frontend's legacy client-side detectCuisine() keyword groups.
CUISINE_KEYWORDS: dict[str, list[str]] = {
    "vietnamese": ["vietnam", "phở", "pho", "bún", "bun", "cơm", "com tam", "bánh mì", "banh mi"],
    "cafe": ["cafe", "coffee", "cà phê", "ca phe"],
    "street food": ["street", "vỉa hè", "via he", "quán vỉa hè"],
    "bbq": ["bbq", "nướng", "nuong", "grill"],
    "japanese": ["japan", "sushi", "ramen", "izakaya"],
    "dessert": ["dessert", "chè", "che", "bánh ngọt", "kem", "ice cream"],
    "ramen": ["ramen"],
    "healthy": ["healthy", "salad", "chay", "vegan", "vegetarian"],
}

_STOP_MIN = 2
_MIN_PER_STOP = 55.0


def _loc_vec(loc: Location) -> NDArray:
    if loc.vector is None:
        return np.full(15, 0.5, dtype=float)
    return np.array(list(loc.vector), dtype=float)


def _parse_price_vnd(price_range: Optional[str]) -> int:
    """Mirrors tours.service._parse_price_vnd (kept local to avoid a private cross-module import)."""
    if not price_range:
        return 0
    s = price_range.strip().lower()
    dollars = s.count("$")
    if dollars:
        return {1: 50_000, 2: 120_000, 3: 250_000, 4: 500_000}.get(min(dollars, 4), 500_000)
    m = re.search(r"(\d+(?:[.,]\d+)?)\s*([km])?", s)
    if not m:
        return 0
    value = float(m.group(1).replace(",", "."))
    suffix = m.group(2)
    if suffix == "k":
        value *= 1_000
    elif suffix == "m":
        value *= 1_000_000
    return int(round(value))


def _cuisine_boost(loc: Location, cuisines: list[str]) -> float:
    if not cuisines:
        return 0.0
    chars = loc.characteristics or {}
    blob = " ".join([loc.name or ""] + [str(v) for v in (chars.values() if isinstance(chars, dict) else [])]).lower()
    boost = 0.0
    for cuisine in cuisines:
        keywords = CUISINE_KEYWORDS.get(cuisine.strip().lower(), [cuisine.strip().lower()])
        if any(kw in blob for kw in keywords):
            boost += 0.1
    return boost


def select_candidates(
    locations: list[Location],
    user_vec: NDArray,
    *,
    mood: Optional[str],
    cuisines: list[str],
    budget_vnd_max: Optional[int],
) -> list[tuple[Location, float]]:
    """
    Pure scoring core (no DB/I/O) — mood-boosted cosine similarity + budget/cuisine
    filters. Returns (location, score) sorted best-first. Kept pure for unit tests.
    """
    boost = np.zeros(15, dtype=float)
    for idx, delta in MOOD_BOOSTS.get(mood or "", {}).items():
        boost[idx] += delta
    boosted_user = np.clip(user_vec + boost, 0.0, 1.0)

    scored: list[tuple[Location, float]] = []
    for loc in locations:
        if budget_vnd_max is not None and _parse_price_vnd(loc.price_range) > budget_vnd_max:
            continue
        sim = _cosine_sim(boosted_user, _loc_vec(loc))
        score = sim + _cuisine_boost(loc, cuisines)
        scored.append((loc, score))

    scored.sort(key=lambda x: x[1], reverse=True)
    return scored


async def _fetch_food_locations(db: AsyncSession, limit: int = 300) -> list[Location]:
    result = await db.execute(
        select(Location)
        .where(or_(Location.category == "food", Location.category.is_(None)))
        .where(Location.vector.isnot(None))
        .order_by(Location.rating.desc().nullslast(), Location.base_score.desc().nullslast())
        .limit(limit)
    )
    return list(result.scalars().all())


GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

_PROMPT_PARSE_INSTRUCTION = """You extract structured trip-planning fields from a short free-text request.
Return STRICT JSON only, no prose, matching this schema (omit fields you cannot infer):
{"mood": "casual"|"adventurous"|"romantic"|"family", "cuisines": ["..."], "duration_min": int, "budget_vnd_max": int, "party": "solo"|"couple"|"small_group"|"large_group"}
User request: """


async def _parse_prompt_with_groq(prompt: str) -> dict:
    """Optional LLM enhancement — parses free text into structured fields.
    Returns {} on missing key / any failure; the heuristic path never depends on this."""
    if not settings.GROQ_API_KEY:
        return {}
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": settings.GROQ_MODEL,
                    "messages": [{"role": "user", "content": _PROMPT_PARSE_INSTRUCTION + prompt}],
                    "temperature": 0.2,
                    "max_tokens": 200,
                    "response_format": {"type": "json_object"},
                },
            )
            resp.raise_for_status()
            raw = resp.json()["choices"][0]["message"]["content"].strip()
            return json.loads(raw)
    except Exception as exc:
        log.warning(f"[Planner] GROQ prompt parse failed: {exc}")
        return {}


async def generate_plan(db: AsyncSession, user_id: int, req: PlannerGenerateRequest) -> dict:
    # 1. Optional LLM parse — merge over explicit fields (explicit fields win).
    parsed: dict = {}
    if req.prompt:
        parsed = await _parse_prompt_with_groq(req.prompt)

    mood = req.mood or parsed.get("mood")
    cuisines = req.cuisines or parsed.get("cuisines") or []
    duration_min = req.duration_min if req.duration_min != 240 else parsed.get("duration_min", req.duration_min)
    budget_vnd_max = req.budget_vnd_max if req.budget_vnd_max is not None else parsed.get("budget_vnd_max")

    # 2. Candidate selection.
    user_vec = await _get_user_vector(db, user_id, "food")
    locations = await _fetch_food_locations(db)
    scored = select_candidates(
        locations, user_vec, mood=mood, cuisines=cuisines, budget_vnd_max=budget_vnd_max,
    )

    tier_q = await db.execute(select(User.membership_tier).where(User.id == user_id))
    tier = tier_q.scalar_one_or_none() or "bite"
    max_stops = get_entitlements(tier)["tour_stops_max"] or 12

    stop_count = max(_STOP_MIN, min(round(duration_min / _MIN_PER_STOP), max_stops))
    selected = scored[:stop_count]
    alternates = scored[stop_count:stop_count + 6]

    if not selected:
        raise ResourceNotFoundException(detail="Không tìm thấy địa điểm phù hợp", error_code="NO_CANDIDATES")

    # 3. Create tour + stops, then delegate ordering to the real optimiser.
    title = _auto_title(mood, req.start_lat is not None)
    tour = await tours_service.create_tour(db, user_id, TourCreate(title=title))
    for loc, _score in selected:
        await tours_service.add_stop(db, tour.id, user_id, StopCreate(location_id=loc.id))

    await tours_service.optimize_tour(
        db, tour.id, user_id,
        OptimizeRequest(
            start_lat=req.start_lat,
            start_lng=req.start_lng,
            category="food",
            time_context=req.time_context,
            transport_mode=req.transport_mode,
        ),
    )

    tour_detail = await tours_service.get_tour(db, tour.id, user_id)

    return {
        "tour": tour_detail,
        "alternates": [
            {
                "id": loc.id, "name": loc.name, "lat": loc.lat, "lng": loc.lng,
                "image_url": loc.image_url, "price_range": loc.price_range,
                "rating": loc.rating, "category": loc.category,
            }
            for loc, _score in alternates
        ],
    }


def _auto_title(mood: Optional[str], has_start: bool) -> str:
    mood_label = {
        "casual": "Casual outing",
        "adventurous": "Adventurous crawl",
        "romantic": "Romantic evening",
        "family": "Family outing",
    }.get(mood or "", "Flavor journey")
    return mood_label
