"""
Crawl địa điểm TP.HCM từ Overpass API (OpenStreetMap)
Output: locations_hcmc.csv (compatible với schema public.locations)

Cài đặt:
    pip install requests pandas tqdm

Chạy:
    python crawl_hcmc_locations.py
"""

import requests
import pandas as pd
import json
import time
import logging
from tqdm import tqdm

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# BOUNDING BOX TP.HCM
# ──────────────────────────────────────────────
HCMC_BBOX = (10.35, 106.35, 11.15, 107.05)   # (south, west, north, east)

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# ──────────────────────────────────────────────
# MAPPING OSM TAG → category (theo schema)
# ──────────────────────────────────────────────
FOOD_AMENITY = [
    "restaurant", "fast_food", "food_court", "bbq",
    "ice_cream", "noodle", "seafood", "sushi",
]
CAFE_BAR_AMENITY = [
    "cafe", "bar", "pub", "biergarten", "juice_bar",
    "bubble_tea",
]
TOURISM_LEISURE = [
    "attraction", "museum", "theme_park", "viewpoint",
    "gallery", "aquarium", "zoo",
]

CATEGORY_MAP = {
    **{a: "restaurant"  for a in FOOD_AMENITY},
    **{a: "cafe_bar"    for a in CAFE_BAR_AMENITY},
    **{t: "tourism"     for t in TOURISM_LEISURE},
    "hotel": "hotel", "hostel": "hotel", "guest_house": "hotel",
    "mall": "shopping", "supermarket": "shopping", "marketplace": "shopping",
}

# OSM cuisine → thêm vào characteristics
CUISINE_PRIORITY = {"vietnamese", "asian", "seafood", "bbq", "noodle", "hotpot"}

# ──────────────────────────────────────────────
# CÁC QUERY (ưu tiên đồ ăn)
# ──────────────────────────────────────────────
def build_queries(bbox):
    s, w, n, e = bbox
    bb = f"{s},{w},{n},{e}"

    queries = []

    # 1. Nhà hàng / Quán ăn (ưu tiên cao nhất)
    food_filter = "|".join(FOOD_AMENITY)
    queries.append(("food", f"""
[out:json][timeout:120];
(
  node["amenity"~"^({food_filter})$"]({bb});
  way["amenity"~"^({food_filter})$"]({bb});
  node["cuisine"]({bb});
  way["cuisine"]({bb});
);
out center tags;
"""))

    # 2. Cafe / Bar
    cafe_filter = "|".join(CAFE_BAR_AMENITY)
    queries.append(("cafe_bar", f"""
[out:json][timeout:120];
(
  node["amenity"~"^({cafe_filter})$"]({bb});
  way["amenity"~"^({cafe_filter})$"]({bb});
);
out center tags;
"""))

    # 3. Du lịch / Vui chơi
    tourism_filter = "|".join(TOURISM_LEISURE)
    queries.append(("tourism", f"""
[out:json][timeout:120];
(
  node["tourism"~"^({tourism_filter})$"]({bb});
  way["tourism"~"^({tourism_filter})$"]({bb});
  node["leisure"~"^(park|playground|sports_centre|swimming_pool|fitness_centre)$"]({bb});
  way["leisure"~"^(park|playground|sports_centre|swimming_pool|fitness_centre)$"]({bb});
);
out center tags;
"""))

    return queries


# ──────────────────────────────────────────────
# GỌI OVERPASS API
# ──────────────────────────────────────────────
def fetch_overpass(query: str, retries: int = 3) -> list:
    for attempt in range(retries):
        try:
            resp = requests.post(
                OVERPASS_URL,
                data={"data": query},
                timeout=180,
                headers={"User-Agent": "hcmc-location-crawler/1.0"}
            )
            resp.raise_for_status()
            return resp.json().get("elements", [])
        except requests.exceptions.RequestException as e:
            log.warning(f"Attempt {attempt+1} failed: {e}")
            if attempt < retries - 1:
                time.sleep(5 * (attempt + 1))
    return []


# ──────────────────────────────────────────────
# PARSE 1 ELEMENT → dict
# ──────────────────────────────────────────────
def parse_element(el: dict, default_category: str) -> dict | None:
    tags = el.get("tags", {})

    # Lấy tọa độ (node dùng lat/lon, way dùng center)
    if el["type"] == "node":
        lat, lng = el.get("lat"), el.get("lon")
    elif el["type"] == "way":
        center = el.get("center", {})
        lat, lng = center.get("lat"), center.get("lon")
    else:
        return None

    if not lat or not lng:
        return None

    name = (
        tags.get("name:vi")
        or tags.get("name")
        or tags.get("brand")
        or tags.get("operator")
    )
    if not name:
        return None

    # Category
    amenity  = tags.get("amenity", "")
    tourism  = tags.get("tourism", "")
    leisure  = tags.get("leisure", "")
    category = (
        CATEGORY_MAP.get(amenity)
        or CATEGORY_MAP.get(tourism)
        or CATEGORY_MAP.get(leisure)
        or default_category
    )

    # Address
    addr_parts = [
        tags.get("addr:housenumber", ""),
        tags.get("addr:street", ""),
        tags.get("addr:suburb", ""),
        tags.get("addr:district", ""),
    ]
    address = ", ".join(p for p in addr_parts if p) or tags.get("addr:full", "")

    # Price range từ OSM "price_level" (ít khi có) hoặc cuisine type
    price_raw = tags.get("price_level") or tags.get("charge", "")
    price_range = None
    if price_raw:
        price_range = price_raw[:50]

    # Open hours
    open_hours = tags.get("opening_hours")

    # Rating (OSM thường không có, để None)
    rating = None

    # Characteristics (JSONB) – gom thêm metadata hữu ích
    characteristics = {}
    cuisine = tags.get("cuisine", "")
    if cuisine:
        characteristics["cuisine"] = cuisine
    diet = tags.get("diet:vegetarian") or tags.get("diet:vegan") or tags.get("diet:halal")
    if diet:
        characteristics["diet"] = diet
    outdoor = tags.get("outdoor_seating")
    if outdoor:
        characteristics["outdoor_seating"] = outdoor
    delivery = tags.get("delivery")
    if delivery:
        characteristics["delivery"] = delivery
    takeaway = tags.get("takeaway")
    if takeaway:
        characteristics["takeaway"] = takeaway
    phone = tags.get("phone") or tags.get("contact:phone")
    if phone:
        characteristics["phone"] = phone
    website = tags.get("website") or tags.get("contact:website")
    if website:
        characteristics["website"] = website
    wifi = tags.get("internet_access")
    if wifi:
        characteristics["wifi"] = wifi

    # image_url từ wikimedia nếu có
    image_url = tags.get("image") or tags.get("wikimedia_commons")

    return {
        "name":            name,
        "lat":             lat,
        "lng":             lng,
        "category":        category,
        "address":         address or None,
        "city":            "Hồ Chí Minh",
        "open_hours":      open_hours,
        "price_range":     price_range,
        "rating":          rating,
        "image_url":       image_url,
        "characteristics": json.dumps(characteristics, ensure_ascii=False) if characteristics else None,
        "base_score":      None,
    }


# ──────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────
def main():
    all_rows = []
    seen_keys = set()   # dedup theo (name, lat, lng)

    queries = build_queries(HCMC_BBOX)

    for label, query in tqdm(queries, desc="Querying Overpass"):
        log.info(f"Fetching category: {label} ...")
        elements = fetch_overpass(query)
        log.info(f"  → {len(elements)} elements returned")

        for el in elements:
            row = parse_element(el, default_category=label)
            if not row:
                continue
            key = (row["name"], round(row["lat"], 6), round(row["lng"], 6))
            if key in seen_keys:
                continue
            seen_keys.add(key)
            all_rows.append(row)

        # Nghỉ 3s giữa các query để không bị rate-limit
        time.sleep(3)

    df = pd.DataFrame(all_rows, columns=[
        "name", "lat", "lng", "category", "address", "city",
        "open_hours", "price_range", "rating", "image_url",
        "characteristics", "base_score"
    ])

    # Sắp xếp: food trước, rồi cafe, tourism
    cat_order = {"restaurant": 0, "cafe_bar": 1, "tourism": 2, "hotel": 3, "shopping": 4}
    df["_sort"] = df["category"].map(lambda c: cat_order.get(c, 99))
    df = df.sort_values("_sort").drop(columns="_sort").reset_index(drop=True)

    out_file = "locations_hcmc.csv"
    df.to_csv(out_file, index=False, encoding="utf-8-sig")

    log.info(f"✅ Done! Tổng: {len(df)} địa điểm → {out_file}")
    log.info(df["category"].value_counts().to_string())


if __name__ == "__main__":
    main()
