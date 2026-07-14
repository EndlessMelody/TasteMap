"""Tours Service — CRUD + Vector-Aware route optimiser.

The optimiser personalises the visit order against the user's 15-dim taste vector
and contextual signals (weather/time), not just distance + rating. See
docs/math_models.md ("Tour Routing — Vector-Aware Cost Model") and
docs/api/discovery.md §8.
"""
import logging
import math
import re
import numpy as np
from numpy.typing import NDArray

import httpx

from src.core.exceptions import ResourceNotFoundException, QuotaExceededException
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional

from src.tours.models import Tour, TourStop
from src.locations.models import Location
from src.users.models import User
from src.membership.entitlements import get_entitlements
from src.tours.schemas import (
    StopCreate, TourCreate, TourUpdate, ReorderRequest,
    OptimizeRequest, OptimizeResponse, OptimizedStop, OptimizeContext,
)

log = logging.getLogger(__name__)
# Reuse the recommendation engine's pure-math helpers (no circular import: the
# recommendations module does not import tours).
from src.recommendations.service import _cosine_sim, _get_user_vector, _haversine_km

# ── Tour routing tuning constants ──────────────────────────────────────────
_SPEED_KMH = {"walking": 5.0, "driving": 20.0, "transit": 14.0}
_DEFAULT_SPEED_KMH = 20.0

# Reward → "minutes saved" conversion (M_S / M_R / M_T) and their weights.
_SIM_MINUTES = 30.0      # taste match can shave up to 30 min off an edge
_RATING_MINUTES = 10.0   # quality
_TIME_MINUTES = 12.0     # open-now / time-of-day fit
_WEATHER_MINUTES = 10.0  # bad-weather penalty ceiling
_W_SIM, _W_RATING, _W_TIME, _W_WEATHER = 1.0, 1.0, 1.0, 1.0

# Dwell time (minutes spent at a stop) by category, with a sensible default.
_DWELL_BY_CATEGORY = {"food": 60, "place": 30}
_DWELL_CAFE = 45
_DEFAULT_DWELL = 40

# Coarse $ → VND map when price_range is a "$$" style string.
_DOLLAR_VND = {1: 50_000, 2: 120_000, 3: 250_000, 4: 500_000}


# ── Pure helpers ────────────────────────────────────────────────────────────

def _haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle distance (km). Thin wrapper over the recommendations helper."""
    return _haversine_km(lat1, lng1, lat2, lng2)


def _speed_kmh(mode: Optional[str]) -> float:
    return _SPEED_KMH.get(mode or "", _DEFAULT_SPEED_KMH)


def _travel_min(km: float, mode: Optional[str] = None) -> float:
    """Travel time (minutes) for a distance, given transport mode."""
    return (km / _speed_kmh(mode)) * 60.0


def _loc_vec(loc: Location) -> NDArray:
    if loc.vector is None:
        return np.full(15, 0.5, dtype=float)
    return np.array(list(loc.vector), dtype=float)


def _dwell_min(loc: Location) -> int:
    """Estimated minutes a user spends at a stop (category + characteristics hint)."""
    chars = loc.characteristics or {}
    blob = " ".join(str(v) for v in chars.values()).lower() if isinstance(chars, dict) else ""
    if "cafe" in blob or "coffee" in blob or "cà phê" in blob:
        return _DWELL_CAFE
    return _DWELL_BY_CATEGORY.get(loc.category, _DEFAULT_DWELL)


_OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
_DEFAULT_WEATHER = (0.8, "unknown")

# WMO weather_code → (coefficient 0-1 higher=nicer, condition label)
_WEATHER_CODE_MAP: dict[int, tuple[float, str]] = {
    0: (1.0, "clear"),
    1: (0.9, "partly_cloudy"), 2: (0.9, "partly_cloudy"),
    3: (0.8, "overcast"),
    45: (0.7, "fog"), 48: (0.7, "fog"),
    51: (0.6, "drizzle"), 53: (0.6, "drizzle"), 55: (0.6, "drizzle"),
    56: (0.55, "drizzle"), 57: (0.55, "drizzle"),
    61: (0.5, "light_rain"), 63: (0.45, "rain"), 80: (0.5, "light_rain"),
    65: (0.3, "heavy_rain"), 66: (0.3, "heavy_rain"), 67: (0.3, "heavy_rain"), 82: (0.3, "heavy_rain"),
    71: (0.4, "snow"), 73: (0.4, "snow"), 75: (0.35, "snow"), 77: (0.4, "snow"),
    85: (0.4, "snow"), 86: (0.35, "snow"),
    95: (0.2, "storm"), 96: (0.15, "storm"), 99: (0.15, "storm"),
}


async def _weather_coefficient(lat: Optional[float], lng: Optional[float]) -> tuple[float, str]:
    """
    Real-time weather coefficient (0–1, higher = nicer) + condition label via Open-Meteo
    (keyless). Falls back to a neutral constant on missing coords or any request failure —
    never blocks tour optimisation on a flaky third-party API.
    """
    if lat is None or lng is None:
        return _DEFAULT_WEATHER
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(
                _OPEN_METEO_URL,
                params={"latitude": lat, "longitude": lng, "current": "weather_code"},
            )
            resp.raise_for_status()
            code = int(resp.json()["current"]["weather_code"])
            return _WEATHER_CODE_MAP.get(code, _DEFAULT_WEATHER)
    except Exception as exc:
        log.warning(f"[Tours] Open-Meteo lookup failed for ({lat},{lng}): {exc}")
        return _DEFAULT_WEATHER


def _weather_penalty(loc: Location, c_weather: float) -> float:
    """Minutes penalty for bad weather — outdoor 'place' hurts more than indoor 'food'."""
    severity = max(0.0, 1.0 - c_weather)  # 0 = perfect weather
    exposure = 1.0 if loc.category == "place" else 0.5
    return severity * exposure * _WEATHER_MINUTES


def _open_fit(open_hours: Optional[str], time_context: Optional[str]) -> float:
    """Soft [0,1] fit of a venue's hours to the requested time slot. 0.5 = unknown/neutral."""
    if not time_context:
        return 0.5
    text = (open_hours or "").lower()
    if not text:
        return 0.5
    late_markers = ("2am", "1am", "12am", "midnight", "24h", "24/7", "late", "2:00", "1:00")
    is_late_venue = any(m in text for m in late_markers)
    if time_context in ("late_night", "late", "midnight"):
        return 1.0 if is_late_venue else 0.3
    # Daytime slots: a venue advertising late hours is generally also open earlier.
    return 0.8 if is_late_venue else 0.6


def _parse_price_vnd(price_range: Optional[str]) -> int:
    """Parse 'price_range' into VND. Handles '35k', '1.2M', '150000', '$$'. 0 if unknown."""
    if not price_range:
        return 0
    s = price_range.strip().lower()

    # "$$" tier notation
    dollars = s.count("$")
    if dollars:
        return _DOLLAR_VND.get(min(dollars, 4), _DOLLAR_VND[4])

    # numeric with k / m suffix, e.g. "35k", "1.2m", "120 k"
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


# ── CRUD ────────────────────────────────────────────────────────────────────

async def _get_tier(db: AsyncSession, user_id: int) -> str:
    res = await db.execute(select(User.membership_tier).where(User.id == user_id))
    return res.scalar_one_or_none() or "bite"


async def create_tour(db: AsyncSession, user_id: int, data: Optional[TourCreate] = None) -> Tour:
    tier = await _get_tier(db, user_id)
    max_tours = get_entitlements(tier)["saved_tours_max"]
    if max_tours is not None:
        count_res = await db.execute(select(func.count()).select_from(Tour).where(Tour.user_id == user_id))
        if (count_res.scalar_one() or 0) >= max_tours:
            raise QuotaExceededException(feature="saved_tours", tier=tier, limit=max_tours)

    tour = Tour(user_id=user_id, status="building", title=(data.title if data else None))
    db.add(tour)
    await db.commit()
    await db.refresh(tour)
    return tour


async def rename_tour(db: AsyncSession, tour_id: int, user_id: int, data: TourUpdate) -> dict:
    result = await db.execute(select(Tour).where(Tour.id == tour_id, Tour.user_id == user_id))
    tour = result.scalars().first()
    if not tour:
        raise ResourceNotFoundException(detail="Tour không tồn tại", error_code="TOUR_NOT_FOUND")
    tour.title = data.title
    await db.commit()
    return {"id": tour.id, "title": tour.title}


async def delete_tour(db: AsyncSession, tour_id: int, user_id: int) -> None:
    result = await db.execute(select(Tour).where(Tour.id == tour_id, Tour.user_id == user_id))
    tour = result.scalars().first()
    if not tour:
        raise ResourceNotFoundException(detail="Tour không tồn tại", error_code="TOUR_NOT_FOUND")
    await db.delete(tour)
    await db.commit()


async def reorder_stops(db: AsyncSession, tour_id: int, user_id: int, data: ReorderRequest) -> dict:
    tour_q = await db.execute(select(Tour).where(Tour.id == tour_id, Tour.user_id == user_id))
    if not tour_q.scalars().first():
        raise ResourceNotFoundException(detail="Tour không tồn tại", error_code="TOUR_NOT_FOUND")

    stops_q = await db.execute(select(TourStop).where(TourStop.tour_id == tour_id))
    stops_by_id = {s.id: s for s in stops_q.scalars().all()}
    if set(data.stop_ids) != set(stops_by_id.keys()):
        raise ResourceNotFoundException(detail="stop_ids không khớp với các stop hiện có", error_code="STOP_MISMATCH")

    for idx, stop_id in enumerate(data.stop_ids, start=1):
        stop = stops_by_id[stop_id]
        stop.stop_order = idx
        # Manual reorder invalidates the optimiser's personalised metrics until re-optimize.
        stop.match_score = None
        stop.dwell_min = None
        stop.travel_min = None

    await db.commit()
    return await get_tour(db, tour_id, user_id)


async def list_tours(db: AsyncSession, user_id: int, status: Optional[str], limit: int):
    q = select(Tour).where(Tour.user_id == user_id)
    if status:
        q = q.where(Tour.status == status)
    q = q.order_by(Tour.created_at.desc()).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


async def get_tour(db: AsyncSession, tour_id: int, user_id: int) -> dict:
    result = await db.execute(select(Tour).where(Tour.id == tour_id, Tour.user_id == user_id))
    tour = result.scalars().first()
    if not tour:
        raise ResourceNotFoundException(detail="Tour không tồn tại", error_code="TOUR_NOT_FOUND")
    stops = await _get_stops(db, tour_id)
    return _tour_to_dict(tour, stops)


async def add_stop(db: AsyncSession, tour_id: int, user_id: int, data: StopCreate) -> dict:
    # Verify tour belongs to user
    result = await db.execute(select(Tour).where(Tour.id == tour_id, Tour.user_id == user_id))
    if not result.scalars().first():
        raise ResourceNotFoundException(detail="Tour không tồn tại", error_code="TOUR_NOT_FOUND")

    existing_stops_result = await db.execute(select(TourStop).where(TourStop.tour_id == tour_id))
    existing_stops = existing_stops_result.scalars().all()

    tier = await _get_tier(db, user_id)
    max_stops = get_entitlements(tier)["tour_stops_max"]
    if max_stops is not None and len(existing_stops) >= max_stops:
        raise QuotaExceededException(feature="tour_stops", tier=tier, limit=max_stops)

    if data.stop_order is None:
        data.stop_order = len(existing_stops) + 1

    stop = TourStop(tour_id=tour_id, location_id=data.location_id, stop_order=data.stop_order)
    db.add(stop)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise ResourceNotFoundException(detail=f"Location {data.location_id} không tồn tại", error_code="LOCATION_NOT_FOUND")
    return {"id": stop.id, "stop_order": stop.stop_order, "location_id": stop.location_id}


async def delete_stop(db: AsyncSession, tour_id: int, stop_id: int, user_id: int):
    tour_q = await db.execute(select(Tour).where(Tour.id == tour_id, Tour.user_id == user_id))
    if not tour_q.scalars().first():
        raise ResourceNotFoundException(detail="Tour không tồn tại", error_code="TOUR_NOT_FOUND")
    stop_q = await db.execute(select(TourStop).where(TourStop.id == stop_id, TourStop.tour_id == tour_id))
    stop = stop_q.scalars().first()
    if not stop:
        raise ResourceNotFoundException(detail="Stop không tồn tại", error_code="STOP_NOT_FOUND")
    await db.delete(stop)
    await db.flush()

    # Re-number remaining stops so stop_order stays contiguous (1..n).
    remaining_q = await db.execute(
        select(TourStop).where(TourStop.tour_id == tour_id).order_by(TourStop.stop_order)
    )
    for idx, s in enumerate(remaining_q.scalars().all(), start=1):
        if s.stop_order != idx:
            s.stop_order = idx

    await db.commit()
    return {"status": "deleted"}


async def update_status(db: AsyncSession, tour_id: int, user_id: int, status: str):
    result = await db.execute(select(Tour).where(Tour.id == tour_id, Tour.user_id == user_id))
    tour = result.scalars().first()
    if not tour:
        raise ResourceNotFoundException(detail="Tour không tồn tại", error_code="TOUR_NOT_FOUND")
    tour.status = status
    await db.commit()
    return {"id": tour_id, "status": status}


# ── The brain: vector-aware optimisation ─────────────────────────────────────

def _optimize_order(
    rows: list,
    user_vec: NDArray,
    start_lat: float,
    start_lng: float,
    *,
    c_weather: float,
    mode: Optional[str],
    time_context: Optional[str],
) -> tuple[list, dict, dict]:
    """
    Pure ordering core (no DB / no I/O) — Nearest-Neighbour greedy + 2-opt over a
    taste-personalised edge cost:
        Cost = Travel + w_W·Weather − w_S·sim·M_S − w_R·rating·M_R − w_T·openfit·M_T

    `rows` is a list of (stop_obj, location_obj). Returns (ordered_rows, sim01, dwell)
    keyed by location id. Kept pure so the brain is unit-testable without a database.
    """
    # Precompute per-location signals once (location id → metrics).
    sim01: dict[int, float] = {}
    stop_bonus: dict[int, float] = {}   # travel-independent cost contribution (usually negative)
    dwell: dict[int, int] = {}
    for _, loc in rows:
        sim = (_cosine_sim(user_vec, _loc_vec(loc)) + 1.0) / 2.0  # → [0,1]
        rating01 = max(0.0, min((loc.rating or 0.0) / 5.0, 1.0))
        openfit = _open_fit(loc.open_hours, time_context)
        stop_bonus[loc.id] = (
            _W_WEATHER * _weather_penalty(loc, c_weather)
            - _W_SIM * sim * _SIM_MINUTES
            - _W_RATING * rating01 * _RATING_MINUTES
            - _W_TIME * openfit * _TIME_MINUTES
        )
        sim01[loc.id] = sim
        dwell[loc.id] = _dwell_min(loc)

    def edge_cost(from_lat: float, from_lng: float, loc) -> float:
        km = _haversine(from_lat, from_lng, loc.lat, loc.lng)
        return _travel_min(km, mode) + stop_bonus[loc.id]

    def path_cost(seq: list) -> float:
        total = 0.0
        cur_lat, cur_lng = start_lat, start_lng
        for _, loc in seq:
            total += edge_cost(cur_lat, cur_lng, loc)
            cur_lat, cur_lng = loc.lat, loc.lng
        return total

    # ── 1. Nearest-Neighbour greedy ───────────────────────────────────────
    remaining = list(rows)
    order: list = []
    cur_lat, cur_lng = start_lat, start_lng
    while remaining:
        best_i = min(range(len(remaining)), key=lambda i: edge_cost(cur_lat, cur_lng, remaining[i][1]))
        chosen = remaining.pop(best_i)
        order.append(chosen)
        cur_lat, cur_lng = chosen[1].lat, chosen[1].lng

    # ── 2. 2-opt improvement (n nhỏ → chi phí không đáng kể) ───────────────
    improved = True
    while improved:
        improved = False
        base_cost = path_cost(order)
        for i in range(len(order) - 1):
            for j in range(i + 1, len(order)):
                candidate = order[:i] + order[i:j + 1][::-1] + order[j + 1:]
                if path_cost(candidate) + 1e-9 < base_cost:
                    order = candidate
                    base_cost = path_cost(order)
                    improved = True

    return order, sim01, dwell


async def optimize_tour(db: AsyncSession, tour_id: int, user_id: int, body: OptimizeRequest):
    """
    Tối ưu thứ tự ghé thăm stops (visit-all / TSP) — xem docs/api/discovery.md §8.

    Nearest-Neighbour greedy từ điểm xuất phát + cải thiện 2-opt. Edge cost được
    cá nhân hoá theo taste vector + context:
        Cost = Travel + w_W·Weather − w_S·sim·M_S − w_R·rating·M_R − w_T·openfit·M_T
    """
    stops_result = await db.execute(
        select(TourStop, Location)
        .join(Location, Location.id == TourStop.location_id)
        .where(TourStop.tour_id == tour_id)
        .order_by(TourStop.stop_order)
    )
    rows = stops_result.all()
    if not rows:
        raise ResourceNotFoundException(detail="Tour không có stops", error_code="TOUR_EMPTY")

    # No explicit start → default to the first added stop's coordinates.
    start_lat = body.start_lat if body.start_lat is not None else rows[0][1].lat
    start_lng = body.start_lng if body.start_lng is not None else rows[0][1].lng

    # Personalisation inputs.
    user_vec = await _get_user_vector(db, user_id, body.category)
    c_weather, weather_label = await _weather_coefficient(start_lat, start_lng)
    mode = body.transport_mode

    order, sim01, dwell = _optimize_order(
        rows, user_vec, start_lat, start_lng,
        c_weather=c_weather, mode=mode, time_context=body.time_context,
    )

    # ── 3. Per-stop metrics (travel from previous, dwell, match) ───────────
    consecutive_km = [0.0] + [
        _haversine(order[k - 1][1].lat, order[k - 1][1].lng, order[k][1].lat, order[k][1].lng)
        for k in range(1, len(order))
    ]
    optimized = []
    estimated_cost = 0
    for k, km in enumerate(consecutive_km):
        loc = order[k][1]
        travel = int(round(_travel_min(km, mode)))
        optimized.append(OptimizedStop(
            stop_order=k + 1,
            location_id=order[k][0].location_id,
            estimated_travel_min=travel,
            match_score=int(round(sim01[loc.id] * 100)),
            dwell_min=dwell[loc.id],
        ))
        estimated_cost += _parse_price_vnd(loc.price_range)

    total_dist = sum(consecutive_km)
    total_duration = sum(o.estimated_travel_min for o in optimized) + sum(dwell[order[k][1].id] for k in range(len(order)))

    # ── 4. Persist results back to Tour + reorder/annotate stops ───────────
    tour_result = await db.execute(select(Tour).where(Tour.id == tour_id, Tour.user_id == user_id))
    tour = tour_result.scalars().first()
    if tour:
        tour.total_distance = round(total_dist, 2)
        tour.estimated_duration = total_duration
        tour.estimated_cost = estimated_cost
        tour.status = "ready"

    for opt_stop in optimized:
        stop_result = await db.execute(
            select(TourStop).where(
                TourStop.tour_id == tour_id,
                TourStop.location_id == opt_stop.location_id,
            )
        )
        db_stop = stop_result.scalars().first()
        if db_stop:
            db_stop.stop_order = opt_stop.stop_order
            db_stop.match_score = opt_stop.match_score
            db_stop.dwell_min = opt_stop.dwell_min
            db_stop.travel_min = opt_stop.estimated_travel_min

    await db.commit()

    return OptimizeResponse(
        optimized_stops=optimized,
        total_distance_km=round(total_dist, 2),
        total_duration_min=total_duration,
        estimated_cost_vnd=estimated_cost,
        context=OptimizeContext(
            time_slot=body.time_context or "any",
            weather=weather_label,
            weather_coefficient=c_weather,
        ),
    )


async def _get_stops(db: AsyncSession, tour_id: int):
    result = await db.execute(
        select(TourStop, Location)
        .join(Location, Location.id == TourStop.location_id)
        .where(TourStop.tour_id == tour_id)
        .order_by(TourStop.stop_order)
    )
    return result.all()


def _tour_to_dict(tour: Tour, stops) -> dict:
    return {
        "id": tour.id, "title": tour.title, "status": tour.status,
        "total_distance": tour.total_distance,
        "estimated_cost": tour.estimated_cost,
        "estimated_duration": tour.estimated_duration,
        "created_at": tour.created_at,
        "stops": [
            {
                "id": r[0].id, "stop_order": r[0].stop_order,
                "match_score": r[0].match_score,
                "dwell_min": r[0].dwell_min,
                "travel_min": r[0].travel_min,
                "location": {"id": r[1].id, "name": r[1].name, "lat": r[1].lat, "lng": r[1].lng,
                             "image_url": r[1].image_url, "price_range": r[1].price_range,
                             "rating": r[1].rating, "category": r[1].category},
            } for r in stops
        ],
    }
