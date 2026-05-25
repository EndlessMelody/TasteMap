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
    Graph routing stub — sorts stops by Haversine distance from start point.
    TODO: Implement full Dijkstra with Cost = Traffic_Time + Weather_Penalty - Location_Score
    """
    stops_result = await db.execute(
        select(TourStop, Location)
        .join(Location, Location.id == TourStop.location_id)
        .where(TourStop.tour_id == tour_id)
    )
    rows = stops_result.all()
    if not rows:
        raise HTTPException(status_code=404, detail="Tour không có stops")

    def haversine(lat1, lng1, lat2, lng2):
        R = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlng = math.radians(lng2 - lng1)
        a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
        return R * 2 * math.asin(math.sqrt(a))

    sorted_stops = sorted(rows, key=lambda r: haversine(body.start_lat, body.start_lng, r[1].lat, r[1].lng))
    total_dist = sum(
        haversine(sorted_stops[i][1].lat, sorted_stops[i][1].lng,
                  sorted_stops[i + 1][1].lat, sorted_stops[i + 1][1].lng)
        for i in range(len(sorted_stops) - 1)
    ) if len(sorted_stops) > 1 else 0.0

    optimized = [
        OptimizedStop(stop_order=i + 1, location_id=r[0].location_id, estimated_travel_min=int(dist * 3))
        for i, (r, dist) in enumerate(
            zip(sorted_stops, [0.0] + [haversine(sorted_stops[i][1].lat, sorted_stops[i][1].lng,
                                               sorted_stops[i + 1][1].lat, sorted_stops[i + 1][1].lng)
                                       for i in range(len(sorted_stops) - 1)])
        )
    ]

    return OptimizeResponse(
        optimized_stops=optimized,
        total_distance_km=round(total_dist, 2),
        total_duration_min=int(total_dist * 3 * len(sorted_stops)),
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
