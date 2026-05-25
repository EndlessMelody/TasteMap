"""
Seed real-ish locations from OpenStreetMap into the locations table.

Real fields from OSM:
    name, lat, lng, address parts, city, category source, cuisine/tourism tags

Generated demo fields:
    image_url, price_range, open_hours fallback, rating, base_score, 15-dim vector

Usage from backend/:
    .\.venv\Scripts\python.exe scripts\seed_osm_locations.py --target 500
"""

import argparse
import asyncio
import hashlib
import os
import random
import sys
import time
import urllib.parse
from dataclasses import dataclass
from typing import Any

import requests
from dotenv import load_dotenv
from sqlalchemy import select
from sqlalchemy.exc import ProgrammingError

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
load_dotenv()

from src.db.database import AsyncSessionLocal, engine  # noqa: E402
from src.locations.models import Location  # noqa: E402


OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]

FOOD_AMENITIES = [
    "restaurant",
    "cafe",
    "fast_food",
    "food_court",
    "bar",
    "pub",
    "biergarten",
    "ice_cream",
    "bakery",
]

PLACE_TOURISM = [
    "attraction",
    "museum",
    "gallery",
    "viewpoint",
    "theme_park",
    "zoo",
    "aquarium",
]

PLACE_LEISURE = [
    "park",
    "garden",
    "sports_centre",
    "fitness_centre",
    "playground",
]

PLACE_SHOPS = [
    "mall",
    "department_store",
    "supermarket",
    "convenience",
    "marketplace",
]

DEFAULT_OPEN_HOURS = {
    "food": ["07:00-21:00", "08:00-22:00", "10:00-22:30", "16:00-23:00"],
    "place": ["08:00-17:00", "08:00-20:00", "09:00-18:00", "Open 24/7"],
}

PRICE_RANGES = {
    "food": ["25k-50k", "50k-100k", "80k-150k", "120k-250k", "200k-400k"],
    "place": ["Free", "20k-60k", "50k-120k", "100k-250k"],
}

FOOD_IMAGE_KEYWORDS = {
    "coffee": ["coffee,cafe", "latte,coffee", "coffee-shop", "iced-coffee"],
    "bakery": ["bakery,bread", "croissant,bakery", "pastry,bakery", "banh-mi,food"],
    "dessert": ["dessert,cake", "ice-cream,dessert", "sweet-food", "bubble-tea"],
    "bar": ["cocktail,bar", "beer,bar", "restaurant-bar", "night-food"],
    "pizza": ["pizza,food", "italian-food", "pizza-restaurant"],
    "asian": ["asian-food", "vietnamese-food", "noodle,food", "sushi,food", "rice-bowl"],
    "default": ["food", "restaurant-food", "street-food", "dinner,food", "lunch,food", "meal"],
}


@dataclass(frozen=True)
class SearchArea:
    label: str
    city: str
    bbox: tuple[float, float, float, float]


SEARCH_AREAS = [
    SearchArea("Ho Chi Minh core", "Ho Chi Minh", (10.72, 106.65, 10.83, 106.75)),
    SearchArea("Thu Duc / Di An", "Ho Chi Minh", (10.82, 106.74, 10.91, 106.84)),
    SearchArea("Hanoi core", "Hanoi", (21.00, 105.78, 21.07, 105.88)),
    SearchArea("Da Nang core", "Da Nang", (16.03, 108.18, 16.09, 108.27)),
    SearchArea("Vung Tau core", "Vung Tau", (10.32, 107.05, 10.39, 107.12)),
]


def _stable_rng(seed: str) -> random.Random:
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
    return random.Random(int(digest[:16], 16))


def _stable_float(seed: str, low: float, high: float, ndigits: int = 2) -> float:
    rng = _stable_rng(seed)
    return round(rng.uniform(low, high), ndigits)


def _stable_int(seed: str, low: int, high: int) -> int:
    return _stable_rng(seed).randint(low, high)


def build_overpass_query(area: SearchArea, include_places: bool = False) -> str:
    south, west, north, east = area.bbox
    bbox = f"{south},{west},{north},{east}"
    food = "|".join(FOOD_AMENITIES)
    tourism = "|".join(PLACE_TOURISM)
    leisure = "|".join(PLACE_LEISURE)
    shops = "|".join(PLACE_SHOPS)

    place_query = ""
    if include_places:
        place_query = f"""
  node["tourism"~"^({tourism})$"]({bbox});
  way["tourism"~"^({tourism})$"]({bbox});
  relation["tourism"~"^({tourism})$"]({bbox});
  node["leisure"~"^({leisure})$"]({bbox});
  way["leisure"~"^({leisure})$"]({bbox});
  relation["leisure"~"^({leisure})$"]({bbox});
  node["shop"~"^({shops})$"]({bbox});
  way["shop"~"^({shops})$"]({bbox});
  relation["shop"~"^({shops})$"]({bbox});
"""

    return f"""
[out:json][timeout:120];
(
  node["amenity"~"^({food})$"]({bbox});
  way["amenity"~"^({food})$"]({bbox});
  relation["amenity"~"^({food})$"]({bbox});
{place_query}
);
out center tags;
"""


def fetch_overpass(query: str) -> list[dict[str, Any]]:
    last_error = None
    for endpoint in OVERPASS_ENDPOINTS:
        for attempt in range(3):
            try:
                response = requests.post(
                    endpoint,
                    data={"data": query},
                    timeout=160,
                    headers={"User-Agent": "TasteMap student project location seed/1.0"},
                )
                response.raise_for_status()
                return response.json().get("elements", [])
            except Exception as exc:
                last_error = exc
                time.sleep(4 * (attempt + 1))
    print(f"Overpass request failed: {last_error}")
    return []


def get_coordinates(element: dict[str, Any]) -> tuple[float, float] | None:
    if element.get("type") == "node":
        lat = element.get("lat")
        lng = element.get("lon")
    else:
        center = element.get("center") or {}
        lat = center.get("lat")
        lng = center.get("lon")
    if lat is None or lng is None:
        return None
    return float(lat), float(lng)


def classify_category(tags: dict[str, str]) -> str:
    amenity = tags.get("amenity", "")
    if amenity in FOOD_AMENITIES or tags.get("cuisine"):
        return "food"
    return "place"


def build_address(tags: dict[str, str], fallback_city: str) -> str:
    parts = [
        tags.get("addr:housenumber", ""),
        tags.get("addr:street", ""),
        tags.get("addr:suburb", ""),
        tags.get("addr:district", ""),
    ]
    compact = ", ".join(part for part in parts if part)
    return tags.get("addr:full") or compact or fallback_city


def infer_price_range(category: str, tags: dict[str, str], seed: str) -> str:
    if tags.get("price_level"):
        return tags["price_level"][:50]
    amenity = tags.get("amenity", "")
    cuisine = tags.get("cuisine", "")
    rng = _stable_rng(seed + ":price")

    if category == "food" and any(token in cuisine for token in ["coffee", "cafe"]):
        low = rng.randrange(25, 71, 5)
        high = low + rng.randrange(35, 96, 5)
        return f"{low}k-{high}k"
    if category == "food" and amenity in {"bar", "pub", "biergarten"}:
        low = rng.randrange(80, 181, 10)
        high = low + rng.randrange(100, 281, 10)
        return f"{low}k-{high}k"
    if category == "food":
        low = rng.randrange(25, 181, 5)
        high = low + rng.randrange(35, 221, 5)
        return f"{low}k-{high}k"

    return _stable_rng(seed).choice(PRICE_RANGES[category])


def infer_open_hours(category: str, tags: dict[str, str], seed: str) -> str:
    value = tags.get("opening_hours")
    if value and len(value) <= 120:
        return value

    rng = _stable_rng(seed + ":hours")
    if category != "food":
        return rng.choice(DEFAULT_OPEN_HOURS[category])

    amenity = tags.get("amenity", "").lower()
    cuisine = tags.get("cuisine", "").lower()
    haystack = f"{amenity} {cuisine}"

    if any(token in haystack for token in ["bar", "pub", "biergarten"]):
        open_hour = rng.choice([15, 16, 17, 18])
        close_hour = rng.choice([0, 1, 2])
    elif any(token in haystack for token in ["bakery", "coffee", "cafe"]):
        open_hour = rng.choice([6, 7, 8])
        close_hour = rng.choice([18, 19, 20, 21, 22])
    else:
        open_hour = rng.choice([6, 7, 8, 9, 10])
        close_hour = rng.choice([20, 21, 22, 23])

    minute = rng.choice([0, 0, 0, 30])
    return f"{open_hour:02d}:{minute:02d}-{close_hour:02d}:00"


def infer_food_image(tags: dict[str, str], name: str, seed: str) -> str:
    amenity = tags.get("amenity", "").lower()
    cuisine = tags.get("cuisine", "").lower()
    name_lower = name.lower()
    haystack = f"{amenity} {cuisine} {name_lower}"

    if any(token in haystack for token in ["coffee", "cafe", "café", "espresso"]):
        pool_key = "coffee"
    elif any(token in haystack for token in ["bakery", "bread", "banh mi", "bánh mì"]):
        pool_key = "bakery"
    elif any(token in haystack for token in ["ice_cream", "dessert", "cake", "tea", "bubble"]):
        pool_key = "dessert"
    elif any(token in haystack for token in ["bar", "pub", "beer", "biergarten"]):
        pool_key = "bar"
    elif "pizza" in haystack or "italian" in haystack:
        pool_key = "pizza"
    elif any(token in haystack for token in ["asian", "vietnamese", "japanese", "korean", "thai", "sushi", "noodle", "phở", "pho"]):
        pool_key = "asian"
    else:
        pool_key = "default"

    keyword = _stable_rng(seed + ":image-keyword").choice(FOOD_IMAGE_KEYWORDS[pool_key])
    lock = _stable_int(seed + ":image-lock", 1, 20_000_000)
    encoded_keyword = urllib.parse.quote(keyword, safe=",")
    return f"https://loremflickr.com/800/600/{encoded_keyword}?lock={lock}"


def build_characteristics(tags: dict[str, str], osm_id: str, source: str) -> dict[str, Any]:
    keys = [
        "amenity",
        "tourism",
        "leisure",
        "shop",
        "cuisine",
        "brand",
        "operator",
        "outdoor_seating",
        "takeaway",
        "delivery",
        "internet_access",
        "diet:vegetarian",
        "diet:vegan",
        "diet:halal",
        "wheelchair",
        "phone",
        "contact:phone",
        "website",
        "contact:website",
    ]
    characteristics = {key.replace(":", "_"): tags[key] for key in keys if tags.get(key)}
    characteristics["source"] = source
    characteristics["osm_id"] = osm_id
    return characteristics


def build_vector(category: str, tags: dict[str, str], seed: str) -> list[float]:
    rng = _stable_rng(seed + ":vector")
    vector = [round(rng.uniform(0.2, 0.8), 2) for _ in range(15)]

    cuisine = tags.get("cuisine", "").lower()
    amenity = tags.get("amenity", "")
    tourism = tags.get("tourism", "")
    leisure = tags.get("leisure", "")

    if category == "food":
        vector[3] = 0.9 if amenity in {"fast_food", "food_court", "bakery"} else 0.65
        vector[4] = 0.75 if amenity in {"bar", "pub"} else 0.35
        vector[10] = 0.85 if amenity in {"fast_food", "cafe", "bakery"} else 0.55
        vector[14] = 0.8
        if any(token in cuisine for token in ["thai", "korean", "indian", "spicy"]):
            vector[0] = 0.8
        if any(token in cuisine for token in ["dessert", "ice_cream", "cake", "coffee"]):
            vector[1] = 0.75
        if any(token in cuisine for token in ["vietnamese", "noodle", "seafood"]):
            vector[14] = 0.95
    else:
        vector[5] = 0.8 if leisure in {"park", "garden"} else 0.55
        vector[8] = 0.85 if leisure in {"park", "playground"} else 0.6
        vector[12] = 0.9 if tourism in {"attraction", "museum", "gallery", "viewpoint"} else 0.65
        vector[14] = 0.7

    return [max(0.0, min(1.0, round(value, 2))) for value in vector]


def parse_element(element: dict[str, Any], area: SearchArea) -> dict[str, Any] | None:
    tags = element.get("tags") or {}
    name = tags.get("name:vi") or tags.get("name") or tags.get("brand") or tags.get("operator")
    if not name or len(name) > 180:
        return None

    coordinates = get_coordinates(element)
    if not coordinates:
        return None

    osm_id = f"{element.get('type', 'node')}-{element.get('id')}"
    category = classify_category(tags)
    seed = f"{osm_id}:{name}"
    rating = _stable_float(seed + ":rating", 3.7, 4.9, 1)

    return {
        "name": name.strip(),
        "lat": coordinates[0],
        "lng": coordinates[1],
        "address": build_address(tags, area.city),
        "city": area.city,
        "base_score": round(rating / 5, 2),
        "category": category,
        "image_url": infer_food_image(tags, name, seed),
        "price_range": infer_price_range(category, tags, seed),
        "open_hours": infer_open_hours(category, tags, seed),
        "rating": rating,
        "characteristics": build_characteristics(tags, osm_id, "openstreetmap"),
        "vector": build_vector(category, tags, seed),
    }


def collect_locations(target: int, include_places: bool) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    seen: set[tuple[str, float, float]] = set()

    for area in SEARCH_AREAS:
        if len(rows) >= target:
            break

        print(f"Fetching {area.label}...")
        elements = fetch_overpass(build_overpass_query(area, include_places))
        print(f"  {len(elements)} OSM elements")

        parsed_rows = []
        for element in elements:
            row = parse_element(element, area)
            if not row:
                continue
            if not include_places and row["category"] != "food":
                continue
            key = (row["name"].casefold(), round(row["lat"], 5), round(row["lng"], 5))
            if key in seen:
                continue
            seen.add(key)
            parsed_rows.append(row)

        parsed_rows.sort(key=lambda item: (item["category"] != "food", -item["rating"], item["name"]))
        rows.extend(parsed_rows)
        print(f"  collected total: {len(rows)}")
        time.sleep(2)

    return rows[:target]


async def seed_locations(rows: list[dict[str, Any]], replace_demo: bool) -> None:
    inserted = 0
    skipped = 0

    try:
        async with AsyncSessionLocal() as session:
            if replace_demo:
                demo_names = [
                    "Com Tam Ba Ghien",
                    "Pizza 4P's Le Thanh Ton",
                    "The Workshop Coffee",
                    "Ben Thanh Market",
                    "Saigon Central Post Office",
                    "Banh Khot Goc Vu Sua",
                ]
                existing_demo = await session.execute(
                    select(Location).where(Location.name.in_(demo_names))
                )
                for item in existing_demo.scalars().all():
                    await session.delete(item)
                await session.flush()

            for row in rows:
                existing = await session.execute(
                    select(Location).where(Location.name == row["name"])
                )
                if existing.scalars().first():
                    skipped += 1
                    continue

                session.add(Location(**row))
                inserted += 1

                if inserted % 100 == 0:
                    await session.commit()
                    print(f"  inserted {inserted}...")

            await session.commit()
    except ProgrammingError as exc:
        if 'relation "locations" does not exist' in str(exc):
            print("The locations table does not exist. Run migrations first:")
            print(r"    .\.venv\Scripts\alembic.exe upgrade head")
            return
        raise
    finally:
        await engine.dispose()

    print(f"Seed complete. Inserted: {inserted}. Skipped existing: {skipped}.")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--target", type=int, default=500, help="Number of rows to collect")
    parser.add_argument(
        "--include-places",
        action="store_true",
        help="Also include tourism/leisure/shop places. By default, only food venues are seeded.",
    )
    parser.add_argument(
        "--replace-demo",
        action="store_true",
        help="Delete the earlier 6 hand-written demo rows before seeding",
    )
    return parser.parse_args()


async def main() -> None:
    args = parse_args()
    rows = collect_locations(args.target, include_places=args.include_places)
    if not rows:
        print("No OSM rows collected.")
        return
    print(f"Collected {len(rows)} locations. Seeding DB...")
    await seed_locations(rows, replace_demo=args.replace_demo)


if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
