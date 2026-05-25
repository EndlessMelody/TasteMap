import requests
import json

def fetch_locations_from_osm():
    print("Đang gọi Overpass API... (Có thể mất vài giây)")
    
    # Tọa độ tâm: Khu vực Làng Đại Học Quốc Gia (KHTN, Dĩ An, Thủ Đức)
    LAT = 10.876
    LNG = 106.801
    RADIUS = 5000 # Bán kính quét: 5000 mét (5km)

    # Câu lệnh truy vấn Overpass QL
    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query = f"""
    [out:json];
    (
      node["amenity"="cafe"](around:{RADIUS},{LAT},{LNG});
      node["amenity"="restaurant"](around:{RADIUS},{LAT},{LNG});
      node["amenity"="fast_food"](around:{RADIUS},{LAT},{LNG});
    );
    out body;
    """
    
    response = requests.get(overpass_url, params={'data': overpass_query})
    
    if response.status_code != 200:
        print("Lỗi khi gọi API:", response.status_code)
        return []

    data = response.json()
    elements = data.get('elements', [])
    
    locations = []
    
    for el in elements:
        tags = el.get('tags', {})
        
        # BỎ QUA nếu quán không có tên (tránh rác database)
        if 'name' not in tags:
            continue
            
        # Gom góp địa chỉ từ các tag của OSM
        street = tags.get('addr:street', '')
        housenumber = tags.get('addr:housenumber', '')
        address = f"{housenumber} {street}".strip() if street else None
        
        # Tạo object khớp với cấu trúc bảng Location của TasteMap
        loc = {
            "name": tags.get('name'),
            "lat": el.get('lat'),
            "lng": el.get('lon'),
            "category": tags.get('amenity'), # Sẽ là 'cafe', 'restaurant' hoặc 'fast_food'
            "address": address,
            "city": tags.get('addr:city', 'Thủ Đức / Dĩ An'),
            # Khởi tạo characteristics dạng JSONB để sau này nhét Vector vào dễ dàng
            "characteristics": {
                "cuisine": tags.get('cuisine', 'unknown'),
                "outdoor_seating": tags.get('outdoor_seating', 'no')
            },
            # Các trường null hoặc default
            "base_score": 0.0,
            "image_url": None, 
            "price_range": None,
            "open_hours": tags.get('opening_hours', None),
            "rating": None
        }
        locations.append(loc)
        
    print(f"✅ Đã cào thành công {len(locations)} quán ăn/cafe quanh KHTN!")
    return locations

# Chạy thử
if __name__ == "__main__":
    tastemap_data = fetch_locations_from_osm()
    
    # In thử 3 quán đầu tiên ra xem cho sướng mắt
    print(json.dumps(tastemap_data[:3], indent=2, ensure_ascii=False))