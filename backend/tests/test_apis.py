"""
Test script tuần tự cho 3 API lõi.
Chạy: .\.venv\Scripts\python.exe test_apis.py
Yêu cầu: Server phải đang chạy (uvicorn src.main:app --reload) và Redis phải bật.
"""
import json
import urllib.request
import urllib.error
import time

BASE = "http://localhost:8000/api/v1"

def post(path, data):
    url = f"{BASE}{path}"
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"))
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8")), resp.status
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        print(f"  ❌ HTTP {e.code}: {body}")
        return None, e.code
    except urllib.error.URLError as e:
        print(f"  ❌ Không kết nối được server: {e.reason}")
        return None, 0

def get(path):
    url = f"{BASE}{path}"
    try:
        with urllib.request.urlopen(url) as resp:
            return json.loads(resp.read().decode("utf-8")), resp.status
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        print(f"  ❌ HTTP {e.code}: {body}")
        return None, e.code
    except urllib.error.URLError as e:
        print(f"  ❌ Không kết nối được server: {e.reason}")
        return None, 0

# ────────────── TEST 1: Init Session ──────────────
print("\n📌 TEST 1: POST /users/init (Lần đầu)")
data, status = post("/users/init", {"device_id": "test-device-001", "domain": "place"})
if data:
    print(f"  ✅ Status: {status}")
    print(f"  user_id: {data['user_id']}")
    print(f"  vector: {data['current_vector']}")
    user_id = data["user_id"]
    assert len(data["current_vector"]) == 8, "Vector phải 8 chiều!"
    assert all(v == 0.5 for v in data["current_vector"]), "Vector ban đầu phải toàn 0.5!"
    print("  ✅ Đúng: Vector 8 chiều, toàn 0.5")
else:
    print("  ❌ FAILED")
    exit(1)

# Test gọi lại cùng device_id → phải trả về cùng user_id
print("\n📌 TEST 1b: POST /users/init (Gọi lại cùng device_id)")
data2, _ = post("/users/init", {"device_id": "test-device-001", "domain": "place"})
if data2:
    assert data2["user_id"] == user_id, "user_id phải giống nhau khi gọi lại!"
    print(f"  ✅ Đúng: user_id giống nhau = {data2['user_id']}")

# Test domain khác → phải tạo user_id MỚI
print("\n📌 TEST 1c: POST /users/init (Domain food → user_id mới)")
data3, _ = post("/users/init", {"device_id": "test-device-001", "domain": "food"})
if data3:
    assert data3["user_id"] != user_id, "user_id phải KHÁC khi domain khác!"
    print(f"  ✅ Đúng: user_id khác = {data3['user_id']}")

# ────────────── TEST 2: Feed Cards ──────────────
print("\n📌 TEST 2: GET /feed/cards?type=place&limit=3")
data, status = get(f"/feed/cards?user_id={user_id}&type=place&limit=3")
if data:
    print(f"  ✅ Status: {status}")
    print(f"  Số thẻ nhận được: {len(data['cards'])}")
    for card in data["cards"]:
        print(f"    - {card['name']} ({card['category']})")
        assert "vector" not in card, "Response KHÔNG được chứa vector!"
    print("  ✅ Đúng: Không có field vector trong response")
else:
    print("  ❌ FAILED")

# ────────────── TEST 3: Swipe Batch ──────────────
print("\n📌 TEST 3: POST /interactions/swipe-batch")
now = time.time()
swipe_data = {
    "user_id": user_id,
    "domain": "place",
    "actions": [
        {"place_id": 1, "direction": "RIGHT", "client_timestamp": now},
        {"place_id": 4, "direction": "LEFT", "client_timestamp": now + 1.0},  # > 0.5s → không penalty
    ]
}
data, status = post("/interactions/swipe-batch", swipe_data)
if data:
    print(f"  ✅ Status: {status}")
    print(f"  processed_count: {data['processed_count']}")
    print(f"  penalty_triggered: {data['penalty_triggered']}")
    print(f"  updated_vector: {data['updated_vector']}")
    assert data["processed_count"] == 2, "Phải xử lý 2 actions!"
    assert data["penalty_triggered"] == False, "Không nên có penalty (khoảng cách > 0.5s)!"
    assert data["updated_vector"] != [0.5]*8, "Vector phải thay đổi sau khi vuốt!"
    print("  ✅ Đúng: 2 actions, không penalty, vector đã thay đổi")
else:
    print("  ❌ FAILED")

# Test penalty: vuốt quá nhanh
print("\n📌 TEST 3b: Swipe Batch với penalty (vuốt < 0.5s)")
now2 = time.time()
swipe_penalty = {
    "user_id": user_id,
    "domain": "place",
    "actions": [
        {"place_id": 2, "direction": "RIGHT", "client_timestamp": now2},
        {"place_id": 3, "direction": "RIGHT", "client_timestamp": now2 + 0.2},  # < 0.5s → PENALTY!
    ]
}
data, status = post("/interactions/swipe-batch", swipe_penalty)
if data:
    print(f"  ✅ Status: {status}")
    print(f"  penalty_triggered: {data['penalty_triggered']}")
    assert data["penalty_triggered"] == True, "Phải có penalty (khoảng cách < 0.5s)!"
    print("  ✅ Đúng: Penalty đã được kích hoạt!")
else:
    print("  ❌ FAILED")

print("\n" + "=" * 60)
print("🎉 TẤT CẢ TEST ĐÃ PASS!")
print("=" * 60)
