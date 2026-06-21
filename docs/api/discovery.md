[← Back to Index](README.md)

## 4. Discovery (Swipe Feed)

> Module: `src/feed/` — Lấy thẻ cho Tinder-style swipe.

### `GET /api/v1/feed/cards` ✅ Đã có

Lấy batch thẻ để Frontend render. Trả kèm photos và reviews_preview để hỗ trợ Flip Card UI. Dùng **Cursor Pagination** thay vì offset để hỗ trợ infinite scroll mượt mà.

| Query Param | Type | Default | Mô tả |
|---|---|---|---|
| `user_id` | string | — | ID hoặc UUID guest |
| `lat` | float | — | Đầu vào cho thuật toán tính khoảng cách (Lấy từ GPS) |
| `lng` | float | — | |
| `category` | "food" \| "place" | "place" | Domain |
| `limit` | int | 10 | Số thẻ (Max 50) |
| `cursor` | string | — | Location ID cuối cùng của batch trước |

**Response:** 
```json
{
  "cards": [ ... ],
  "next_cursor": "42",
  "has_more": true
}
```

---

## 5. Interactions (Swipe Learning)

> Module: `src/interactions/` — Ghi nhận swipe, cập nhật vector.

### `POST /api/v1/interactions/swipe-batch` ✅ Đã có

🔒 **Auth bắt buộc** (`Authorization: Bearer <token>`). `user_id` được suy ra từ token — **không** gửi trong body.

Ghi nhận batch swipe. Thuật toán: `U_new = U_old + α·P` với anti-spam decay.

**Request:**
```json
{
  "category": "food",
  "actions": [
    { "place_id": 42, "direction": "RIGHT", "client_timestamp": 1711612800.0 },
    { "place_id": 43, "direction": "LEFT",  "client_timestamp": 1711612801.5 }
  ]
}
```

**Response:**
```json
{
  "status": "ok",
  "processed_count": 2,
  "penalty_triggered": false,
  "updated_vector": [0.62, 0.41, ...]
}
```

---

### `GET /api/v1/interactions/history` 🆕

🔒 **Auth bắt buộc.** Trả về lịch sử swipe của **chính user** trong token (không thể truy vấn user khác).

| Query Param | Type | Default |
|---|---|---|
| `action` | string | — |
| `limit` | int | 50 |
| `offset` | int | 0 |

**Response:**
```json
{
  "items": [
    {
      "id": 1, "location_id": 42, "location_name": "Bún Bò Huế",
      "action": "LIKED", "timestamp": "2026-03-28T12:00:00Z"
    }
  ],
  "total": 120
}
```

---

## 6. Recommendations (AI Engine)

> Module: `src/recommendations/` — AI gợi ý dựa trên vector + context.

### `POST /api/v1/recommendations` ✅ Đã có

🔒 **Auth bắt buộc.** Gợi ý top-N dựa trên vector (Two-Pass: pgvector ANN → numpy scoring).

**Request:**
```json
{
  "user_vector": [0.8, 0.3, 0.9, ...],
  "top_n": 5
}
```

---

### `POST /api/v1/recommendations/contextual` 🆕

🔒 **Auth bắt buộc.** `user_id` suy ra từ token — không gửi trong body.

Gợi ý theo ngữ cảnh (thời tiết, thời gian, khoảng cách).  
Đây là hàm: `Score(S) = W1·Sim(U,P) + W2·C_weather − W3·D`

**Request:**
```json
{
  "lat": 10.89,
  "lng": 106.79,
  "category": "food",
  "radius_km": 3.0,
  "top_n": 10,
  "time_context": "dinner"
}
```

**Response:**
```json
{
  "context": {
    "time_slot": "dinner",
    "weather": "light_rain",
    "weather_coefficient": 0.7
  },
  "recommendations": [
    {
      "place_id": 1,
      "name": "Phở Bò 36",
      "match_score": 0.94,
      "distance_km": 0.8,
      "reason": "Because you love Spicy + Street Food",
      "open_status": "Open until 2AM"
    }
  ]
}
```

---

### `POST /api/v1/recommendations/rescue-me` 🆕

🔒 **Auth bắt buộc.** `user_id` suy ra từ token — không gửi trong body.

**Nút "Rescue Me"** — Ép trọng số Distance ($W_3$) lên 90%, bỏ qua Context (Thời tiết/thời gian), trả về duy nhất 1 kết quả có khoảng cách gần nhất (Radius < 1km) mà vector match vẫn tạm ổn (>60%). Tối ưu cho quyết định lười biếng.

**Request:**
```json
{
  "lat": 10.89,
  "lng": 106.79,
  "category": "food"
}
```

**Response:**
```json
{
  "place": {
    "id": 5,
    "name": "Cơm Tấm Sườn Bì",
    "distance_km": 0.3,
    "match_score": 0.78,
    "image_url": "https://..."
  }
}
```

---

## 8. Tours (Food Tour Builder)

> Module: `src/tours/` — Xây dựng lịch trình + Graph routing.

### `POST /api/v1/tours` 🆕

Tạo tour mới (trạng thái "building").

**Response:** `{ "id": 1, "status": "building", "stops": [] }`

---

### `GET /api/v1/tours` 🆕

Danh sách tour của user hiện tại.

| Query Param | Type | Default |
|---|---|---|
| `status` | string | — |
| `limit` | int | 10 |

---

### `GET /api/v1/tours/{tour_id}` 🆕

Chi tiết tour + danh sách stops (ordered).

**Response:**
```json
{
  "id": 1,
  "status": "building",
  "total_distance": 5.2,
  "estimated_cost": 250000,
  "estimated_duration": 180,
  "stops": [
    {
      "stop_order": 1,
      "location": { "id": 1, "name": "Bún Bò Huế", "lat": 10.89, "lng": 106.79, "image_url": "...", "price_range": "35k" }
    },
    {
      "stop_order": 2,
      "location": { "id": 5, "name": "Matcha Garden", "lat": 10.90, "lng": 106.80, "image_url": "...", "price_range": "65k" }
    }
  ]
}
```

---

### `POST /api/v1/tours/{tour_id}/stops` 🆕

Thêm địa điểm vào tour.

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `location_id` | int | ✅ | Địa điểm cần thêm |
| `stop_order` | int | ❌ | Vị trí. Nếu không gửi → append cuối |

---

### `DELETE /api/v1/tours/{tour_id}/stops/{stop_id}` 🆕

Xóa một stop khỏi tour. Tự re-order các stops còn lại.

---

### `POST /api/v1/tours/{tour_id}/optimize` 🆕

**Graph Routing** — Tối ưu thứ tự ghé thăm các stops (bài toán dạng visit-all / TSP).

Thuật toán: **Nearest-Neighbour greedy** (xuất phát từ `start_lat/start_lng`) + cải thiện **2-opt**
(số stops nhỏ, ~≤10 nên chạy đủ nhanh).

Hàm chi phí mỗi cạnh:
`Cost = Travel_Time + Weather_Penalty − w · Location_Score`
- `Travel_Time = haversine_km / SPEED_KMH × 60` (phút)
- `Location_Score` chuẩn hoá từ `locations.rating` (0–5 → 0–1)
- `Weather_Penalty` = `0.0` (placeholder — chưa tích hợp weather service)
- `w` = trọng số ưu tiên địa điểm chất lượng cao

Cross-link DB: [`tours` / `tour_stops`](../database_schema/content.md) · [`locations`](../database_schema/content.md).

**Request:**
```json
{
  "start_lat": 10.89,
  "start_lng": 106.79
}
```

**Response:**
```json
{
  "optimized_stops": [
    { "stop_order": 1, "location_id": 5, "estimated_travel_min": 0 },
    { "stop_order": 2, "location_id": 1, "estimated_travel_min": 12 },
    { "stop_order": 3, "location_id": 8, "estimated_travel_min": 8 }
  ],
  "total_distance_km": 4.8,
  "total_duration_min": 165,
  "estimated_cost_vnd": 210000
}
```

---

### `PATCH /api/v1/tours/{tour_id}/status` 🆕

Đổi trạng thái tour.

| Field | Type | Values |
|---|---|---|
| `status` | string | "ready" / "in_progress" / "completed" |


---

## 21. Culture Guide

> Module: `src/culture/` — Khám phá văn hóa ẩm thực & AI Identification.

### `POST /api/v1/culture/story` 🆕

Tạo câu chuyện văn hóa cho một món ăn thông qua tên (**Food Name**).

---

### `POST /api/v1/culture/identify` 🆕

Nhận diện món ăn qua một Image URL và tạo câu chuyện văn hóa.

---

### `POST /api/v1/culture/identify-upload` 🆕

Nhận diện món ăn từ file ảnh upload trực tiếp và tạo câu chuyện.

---




