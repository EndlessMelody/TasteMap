"""Tours Service — CRUD + Graph routing (Dijkstra stub)."""
import math
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List

from src.tours.models import Tour, TourStop
from src.locations.models import Location
from src.tours.schemas import StopCreate, OptimizeRequest, OptimizeResponse, TourResponse, StopResponse, OptimizedStop

# ── Tour routing tuning constants ──────────────────────────────────────────
_SPEED_KMH = 20.0            # giả định tốc độ di chuyển nội đô trung bình
_LOCATION_SCORE_WEIGHT = 2.0  # w: số phút "thưởng" cho mỗi đơn vị rating chuẩn hoá


def _haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Khoảng cách great-circle giữa 2 toạ độ (km)."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


def _travel_min(km: float) -> float:
    """Thời gian di chuyển (phút) cho một quãng đường km."""
    return (km / _SPEED_KMH) * 60.0


def _edge_cost(from_lat: float, from_lng: float, to_loc: Location, weather_penalty: float = 0.0) -> float:
    """Cost = Travel_Time + Weather_Penalty − w·Location_Score (xem docs/api/discovery.md §8)."""
    km = _haversine(from_lat, from_lng, to_loc.lat, to_loc.lng)
    location_score = max(0.0, min((to_loc.rating or 0.0) / 5.0, 1.0))
    return _travel_min(km) + weather_penalty - _LOCATION_SCORE_WEIGHT * location_score


def _path_cost(order: list, start_lat: float, start_lng: float) -> float:
    """Tổng cost của một thứ tự ghé thăm, bắt đầu từ điểm xuất phát."""
    total = 0.0
    cur_lat, cur_lng = start_lat, start_lng
    for _, loc in order:
        total += _edge_cost(cur_lat, cur_lng, loc)
        cur_lat, cur_lng = loc.lat, loc.lng
    return total


async def create_tour(db: AsyncSession, user_id: int) -> Tour:
    tour = Tour(user_id=user_id, status="building")
    db.add(tour)
    await db.commit()
    await db.refresh(tour)
    return tour


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
        raise HTTPException(status_code=404, detail="Tour không tồn tại")
    stops = await _get_stops(db, tour_id)
    return _tour_to_dict(tour, stops)


async def add_stop(db: AsyncSession, tour_id: int, user_id: int, data: StopCreate) -> dict:
    # Verify tour belongs to user
    result = await db.execute(select(Tour).where(Tour.id == tour_id, Tour.user_id == user_id))
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Tour không tồn tại")

    if data.stop_order is None:
        count_result = await db.execute(
            select(TourStop).where(TourStop.tour_id == tour_id)
        )
        data.stop_order = len(count_result.scalars().all()) + 1

    stop = TourStop(tour_id=tour_id, location_id=data.location_id, stop_order=data.stop_order)
    db.add(stop)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=404, detail=f"Location {data.location_id} không tồn tại")
    return {"id": stop.id, "stop_order": stop.stop_order, "location_id": stop.location_id}


async def delete_stop(db: AsyncSession, tour_id: int, stop_id: int, user_id: int):
    tour_q = await db.execute(select(Tour).where(Tour.id == tour_id, Tour.user_id == user_id))
    if not tour_q.scalars().first():
        raise HTTPException(status_code=404, detail="Tour không tồn tại")
    stop_q = await db.execute(select(TourStop).where(TourStop.id == stop_id, TourStop.tour_id == tour_id))
    stop = stop_q.scalars().first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop không tồn tại")
    await db.delete(stop)
    await db.commit()
    return {"status": "deleted"}


async def update_status(db: AsyncSession, tour_id: int, user_id: int, status: str):
    result = await db.execute(select(Tour).where(Tour.id == tour_id, Tour.user_id == user_id))
    tour = result.scalars().first()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour không tồn tại")
    tour.status = status
    await db.commit()
    return {"id": tour_id, "status": status}


async def optimize_tour(db: AsyncSession, tour_id: int, user_id: int, body: OptimizeRequest):
    """
    Tối ưu thứ tự ghé thăm stops (visit-all / TSP) — xem docs/api/discovery.md §8.

    Nearest-Neighbour greedy từ điểm xuất phát + cải thiện 2-opt.
    Cost mỗi cạnh = Travel_Time + Weather_Penalty − w·Location_Score.
    """
    stops_result = await db.execute(
        select(TourStop, Location)
        .join(Location, Location.id == TourStop.location_id)
        .where(TourStop.tour_id == tour_id)
    )
    rows = stops_result.all()
    if not rows:
        raise HTTPException(status_code=404, detail="Tour không có stops")

    # ── 1. Nearest-Neighbour greedy ───────────────────────────────────────
    remaining = list(rows)
    order: list = []
    cur_lat, cur_lng = body.start_lat, body.start_lng
    while remaining:
        best_i = min(range(len(remaining)), key=lambda i: _edge_cost(cur_lat, cur_lng, remaining[i][1]))
        chosen = remaining.pop(best_i)
        order.append(chosen)
        cur_lat, cur_lng = chosen[1].lat, chosen[1].lng

    # ── 2. 2-opt improvement (n nhỏ → chi phí không đáng kể) ───────────────
    improved = True
    while improved:
        improved = False
        base_cost = _path_cost(order, body.start_lat, body.start_lng)
        for i in range(len(order) - 1):
            for j in range(i + 1, len(order)):
                candidate = order[:i] + order[i:j + 1][::-1] + order[j + 1:]
                if _path_cost(candidate, body.start_lat, body.start_lng) + 1e-9 < base_cost:
                    order = candidate
                    base_cost = _path_cost(order, body.start_lat, body.start_lng)
                    improved = True

    # ── 3. Tính khoảng cách/thời gian thực tế giữa các stop liên tiếp ──────
    #     estimated_travel_min = thời gian từ stop trước → stop hiện tại (stop đầu = 0).
    consecutive_km = [0.0] + [
        _haversine(order[k - 1][1].lat, order[k - 1][1].lng, order[k][1].lat, order[k][1].lng)
        for k in range(1, len(order))
    ]
    optimized = [
        OptimizedStop(
            stop_order=k + 1,
            location_id=order[k][0].location_id,
            estimated_travel_min=int(round(_travel_min(km))),
        )
        for k, km in enumerate(consecutive_km)
    ]

    total_dist = sum(consecutive_km)
    total_duration = sum(o.estimated_travel_min for o in optimized)

    return OptimizeResponse(
        optimized_stops=optimized,
        total_distance_km=round(total_dist, 2),
        total_duration_min=total_duration,
        estimated_cost_vnd=0,
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
        "id": tour.id, "status": tour.status,
        "total_distance": tour.total_distance,
        "estimated_cost": tour.estimated_cost,
        "estimated_duration": tour.estimated_duration,
        "created_at": tour.created_at,
        "stops": [
            {
                "id": r[0].id, "stop_order": r[0].stop_order,
                "location": {"id": r[1].id, "name": r[1].name, "lat": r[1].lat, "lng": r[1].lng,
                             "image_url": r[1].image_url, "price_range": r[1].price_range},
            } for r in stops
        ],
    }
