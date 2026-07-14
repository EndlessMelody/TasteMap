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

> **Quota:** gated by `enforce_quota("swipes")` — Bite/Savor have a daily cap (see [`monetization.md`](./monetization.md) entitlement matrix); Feast/Omakase are unlimited. Over cap → `429 QUOTA_EXCEEDED`.

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

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `title` | string (≤120) | ❌ | Tên tour. Nếu bỏ trống, các UI hiển thị dùng fallback ("Tour #{id}"). AI Planner tự sinh title (VD: "Cozy evening · District 1"). |

**Response:** `{ "id": 1, "title": null, "status": "building", "stops": [] }`

---

### `GET /api/v1/tours` 🆕

Danh sách tour của user hiện tại.

| Query Param | Type | Default |
|---|---|---|
| `status` | string | — |
| `limit` | int | 10 |

---

### `GET /api/v1/tours/{tour_id}` 🆕

Chi tiết tour + danh sách stops (ordered). Sau khi `optimize`, mỗi stop kèm `match_score`,
`dwell_min`, `travel_min` (đã persist) để render lại journey view nhất quán.

**Response:**
```json
{
  "id": 1,
  "title": "Cozy evening · District 1",
  "status": "ready",
  "total_distance": 5.2,
  "estimated_cost": 250000,
  "estimated_duration": 180,
  "stops": [
    {
      "stop_order": 1,
      "match_score": 92,
      "dwell_min": 45,
      "travel_min": 0,
      "location": { "id": 1, "name": "Bún Bò Huế", "lat": 10.89, "lng": 106.79, "image_url": "...", "price_range": "35k", "rating": 4.6, "category": "food" }
    },
    {
      "stop_order": 2,
      "match_score": 88,
      "dwell_min": 60,
      "travel_min": 12,
      "location": { "id": 5, "name": "Matcha Garden", "lat": 10.90, "lng": 106.80, "image_url": "...", "price_range": "65k", "rating": 4.4, "category": "place" }
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

### `PUT /api/v1/tours/{tour_id}/stops/order` 🆕

Sắp xếp lại thủ công thứ tự các stops (kéo-thả trong Journey View). Vì thứ tự được set thủ công,
`match_score` / `dwell_min` / `travel_min` của tất cả stops bị **reset về `null`** cho tới khi user
gọi lại `POST /optimize` để tính lại các chỉ số.

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `stop_ids` | int[] | ✅ | Danh sách `stop_id` theo thứ tự mới mong muốn (phải chứa đúng tập stop hiện có của tour) |

```json
{ "stop_ids": [12, 10, 11] }
```

**Response:** Tour detail đầy đủ (như `GET /tours/{id}`), với `stop_order` mới và các metrics = `null`.

---

### `PATCH /api/v1/tours/{tour_id}` 🆕

Đổi tên tour.

| Field | Type | Required |
|---|---|---|
| `title` | string (≤120) | ✅ |

**Response:** `{ "id": 1, "title": "Weekend Food Crawl" }`

---

### `DELETE /api/v1/tours/{tour_id}` 🆕

Xóa vĩnh viễn 1 tour (cascade xóa `tour_stops`). Chỉ owner mới xóa được.

**Response:** `204 No Content`

---

### `POST /api/v1/tours/{tour_id}/optimize` 🆕

🔒 **Auth bắt buộc.** `user_id` suy ra từ token — dùng để nạp **taste vector** của user.

**Vector-Aware Routing** — Tối ưu thứ tự ghé thăm các stops (visit-all / TSP).

Thuật toán: **Nearest-Neighbour greedy** (xuất phát từ `start_lat/start_lng`) + cải thiện **2-opt**
(số stops nhỏ, ~≤10). Khác với shortest-path thuần, hàm chi phí được **cá nhân hoá theo vector sở
thích** của user + ngữ cảnh (thời tiết/thời gian), nên route ưu tiên nơi user thực sự thích và hợp
khung giờ — không chỉ gần nhất.

Hàm chi phí mỗi cạnh (đơn vị **phút**, nhỏ hơn = tốt hơn):
`Cost = Travel_Time + w_W·Weather_Penalty − w_S·sim·M_S − w_R·Rating·M_R − w_T·OpenFit·M_T`
- `Travel_Time = haversine_km / SPEED_KMH × 60`.
- `sim = (cosine(user_vector, location.vector) + 1) / 2` ∈ [0,1] → lưu mỗi stop là `match_score = round(sim×100)`.
- `Rating` chuẩn hoá từ `locations.rating` (0–5 → 0–1).
- `OpenFit` ∈ [0,1]: độ khớp `open_hours` với `time_context`.
- `Weather_Penalty`: hệ số thời tiết lấy từ **Open-Meteo** (keyless, real-time theo `start_lat/start_lng`);
  fallback về hằng số `0.8` nếu request thời tiết lỗi/timeout.
- `dwell_min` (thời gian ở mỗi điểm) suy ra theo `category`/`characteristics`; `estimated_cost_vnd`
  được parse & cộng từ `price_range`.

Xem [Mathematical Models](../math_models.md#tour-routing-itinerary--vector-aware-cost-model).
Cross-link DB: [`tours` / `tour_stops`](../database_schema/content.md) · [`locations`](../database_schema/content.md).

**Request:**

| Field | Type | Required | Default | Mô tả |
|---|---|---|---|---|
| `start_lat` | float \| null | ❌ | null | Vĩ độ điểm xuất phát. Nếu bỏ trống → dùng tọa độ của **stop đầu tiên** trong tour |
| `start_lng` | float \| null | ❌ | null | Kinh độ điểm xuất phát. Nếu bỏ trống → dùng tọa độ của **stop đầu tiên** trong tour |
| `category` | "food" \| "place" | ❌ | "food" | Chọn `food_vector` hay `place_vector` của user |
| `time_context` | string | ❌ | null | "breakfast"/"lunch"/"dinner"/"late_night"... → tính `OpenFit` |
| `transport_mode` | "walking" \| "driving" \| "transit" | ❌ | "driving" | Điều chỉnh `SPEED_KMH` |

```json
{
  "start_lat": 10.89,
  "start_lng": 106.79,
  "category": "food",
  "time_context": "dinner",
  "transport_mode": "driving"
}
```

**Response:**
```json
{
  "optimized_stops": [
    { "stop_order": 1, "location_id": 5, "estimated_travel_min": 0,  "match_score": 92, "dwell_min": 45 },
    { "stop_order": 2, "location_id": 1, "estimated_travel_min": 12, "match_score": 88, "dwell_min": 60 },
    { "stop_order": 3, "location_id": 8, "estimated_travel_min": 8,  "match_score": 84, "dwell_min": 30 }
  ],
  "total_distance_km": 4.8,
  "total_duration_min": 155,
  "estimated_cost_vnd": 210000,
  "context": {
    "time_slot": "dinner",
    "weather": "light_rain",
    "weather_coefficient": 0.6
  }
}
```
- `total_duration_min` = Σ `estimated_travel_min` + Σ `dwell_min`.
- `estimated_cost_vnd` = Σ `parse_price(location.price_range)` (0 nếu không parse được).
- `context.weather` phản ánh điều kiện thời tiết thực tế tại `start_lat/start_lng` (Open-Meteo current
  weather code, VD `"clear"`, `"light_rain"`, `"storm"`); trả về `"unknown"` nếu không lấy được (fallback
  `weather_coefficient=0.8`).

---

### `PATCH /api/v1/tours/{tour_id}/status` 🆕

Đổi trạng thái tour.

| Field | Type | Values |
|---|---|---|
| `status` | string | "ready" / "in_progress" / "completed" |


---

## 23. AI Planner

> Module: `src/planner/` — Sinh tour tự động từ mood/ngân sách/thời gian (thay cho heuristic phía
> client trước đây). Là lớp mỏng gọi lại engine thật của Tours (§8): candidate selection theo vector
> + `optimize_tour()`. Output là **1 tour đã persist**, nên xuất hiện ngay trên `GET /tours` và trên
> map "Latest Tour" ở Discovery.

### `POST /api/v1/planner/generate` 🆕

🔒 **Auth bắt buộc.** `user_id` suy ra từ token — dùng để nạp taste vector.

> **Quota:** dùng chung `enforce_quota("recommendation_calls")` với `POST /tours/{id}/optimize`
> (xem [`monetization.md`](./monetization.md) entitlement matrix). Vượt hạn mức → `429 QUOTA_EXCEEDED`.

**Thuật toán:** xem [Mathematical Models — AI Planner](../math_models.md#ai-planner--mood-boosted-candidate-selection).
Tóm tắt: `score = cosine(clip(user_vector + mood_boost, 0, 1), location.vector)`, lọc theo
`budget_vnd_max` và cuisine, chọn `stop_count = clamp(round(duration_min / 55), 2, tour_stops_max)`
địa điểm điểm cao nhất, rồi tạo tour + gọi `optimize_tour()` (§8) như quy trình build tour thủ công.
Nếu `prompt` (free-text) được gửi kèm và server có `GROQ_API_KEY`, prompt được GROQ (llama-3.3-70b)
parse thành các field có cấu trúc bên dưới, chỉ dùng để **điền vào chỗ trống** — field tường minh
(client gửi rõ ràng) luôn được ưu tiên nếu trùng; nếu GROQ lỗi/timeout, âm thầm bỏ qua và dùng
heuristic thuần (không fail request).

**Request:**

| Field | Type | Required | Default | Mô tả |
|---|---|---|---|---|
| `mood` | string | ❌ | null | "cozy" / "adventurous" / "romantic" / "family" ... → mood boost vector |
| `cuisines` | string[] | ❌ | [] | Soft-boost các món/quán khớp cuisine |
| `duration_min` | int | ❌ | 240 | Tổng thời lượng mong muốn → suy ra số stops |
| `budget_vnd_max` | int \| null | ❌ | null | Lọc `price_range` ≤ giá trị này (VND) |
| `party` | string | ❌ | null | "solo" / "couple" / "small_group" / "large_group" (metadata, chưa ảnh hưởng scoring) |
| `start_lat` | float | ❌ | null | Truyền tiếp cho `optimize_tour()`; bỏ trống → dùng stop đầu tiên |
| `start_lng` | float | ❌ | null | |
| `time_context` | string | ❌ | null | "breakfast"/"lunch"/"dinner"/"late_night"... |
| `transport_mode` | "walking" \| "driving" \| "transit" | ❌ | "walking" | |
| `prompt` | string | ❌ | null | Free-text; parse bằng GROQ nếu có key, ngược lại bị bỏ qua |

```json
{
  "mood": "cozy",
  "cuisines": ["vietnamese"],
  "duration_min": 240,
  "budget_vnd_max": 300000,
  "start_lat": 10.7769,
  "start_lng": 106.7009,
  "time_context": "dinner",
  "transport_mode": "walking"
}
```

**Response:**
```json
{
  "tour": { "id": 42, "title": "Cozy evening · District 1", "status": "ready", "...": "giống GET /tours/{id}" },
  "alternates": [
    { "id": 9, "name": "Cafe Ợt", "lat": 10.78, "lng": 106.70, "image_url": "...", "price_range": "40k", "rating": 4.5, "category": "food" }
  ]
}
```
- `tour` có shape giống hệt `GET /tours/{tour_id}` (§8) và đã ở trạng thái `"ready"`.
- `alternates` là danh sách địa điểm điểm cao tiếp theo chưa được chọn, dùng cho tính năng "Swap" ở
  AI Planner result screen (xem [`tours` / `locations`](../database_schema/content.md)).

Cross-link DB: [`tours` / `tour_stops` / `locations`](../database_schema/content.md).

---

## 21. Culture Guide

> Module: `src/culture/` — Khám phá văn hóa ẩm thực & AI Identification.
>
> **Quota:** `POST /culture/story`, `/identify`, `/identify-upload` are jointly gated by `enforce_quota("culture_calls")` (see [`monetization.md`](./monetization.md)) — Bite/Savor share a combined daily cap across all three; Feast/Omakase are unlimited.

### `POST /api/v1/culture/story` 🆕

Tạo câu chuyện văn hóa cho một món ăn thông qua tên (**Food Name**).

---

### `POST /api/v1/culture/identify` 🆕

Nhận diện món ăn qua một Image URL và tạo câu chuyện văn hóa.

---

### `POST /api/v1/culture/identify-upload` 🆕

Nhận diện món ăn từ file ảnh upload trực tiếp và tạo câu chuyện.

---




