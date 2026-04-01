# TasteMap — API Design Specification

> Bản thiết kế toàn bộ REST API cho dự án TasteMap.
> Base URL: `/api/v1`  
> Auth: Bearer token (JWT) — `Depends(get_current_user)`  
> Pagination mặc định: `limit=20, offset=0`

---

## Mục lục

1. [Auth & Sessions](#1-auth--sessions)
2. [Users & Profile](#2-users--profile)
3. [Locations](#3-locations)
4. [Discovery (Swipe Feed)](#4-discovery-swipe-feed)
5. [Interactions (Swipe Learning)](#5-interactions-swipe-learning)
6. [Recommendations (AI Engine)](#6-recommendations-ai-engine)
7. [Groups & Lobbies (Minimax)](#7-groups--lobbies-minimax)
8. [Tours (Food Tour Builder)](#8-tours-food-tour-builder)
9. [Posts (Foodie Feed)](#9-posts-foodie-feed)
10. [Reels](#10-reels)
11. [Comments](#11-comments)
12. [Bookmarks (Taste Vault)](#12-bookmarks-taste-vault)
13. [Social (Friendships)](#13-social-friendships)
14. [Notifications](#14-notifications)
15. [Deals](#15-deals)
16. [Gamification (Badges)](#16-gamification-badges)
17. [Settings](#17-settings)

---

## 1. Auth & Sessions

> Module: `src/sessions/` — Quản lý phiên khách vãng lai (guest) và xác thực.

### `POST /api/v1/auth/init-session` ✅ Đã có

Khởi tạo phiên guest. Nếu device_id đã tồn tại trên Redis → trả lại vector cũ.

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `device_id` | string | ✅ | UUID thiết bị |
| `domain` | "food" \| "place" | ❌ | Mặc định: "place" |

**Response:**
```json
{
  "user_id": "uuid-string",
  "vector": [0.5, 0.5, ...],
  "is_new": true
}
```

---

### `POST /api/v1/auth/register` ✅ Đã có (tại /users/)

Đăng ký tài khoản. Migrate vector từ Redis nếu có `device_id`.

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `username` | string | ✅ | Unique |
| `email` | string (email) | ✅ | Unique |
| `password` | string | ❌ | Nullable giai đoạn dev |
| `device_id` | string | ❌ | Để migrate vector guest |

**Response:** `UserResponse` (id, username, email, food_vector, place_vector, xp, level)

---

### `POST /api/v1/auth/login` 🆕

Đăng nhập. Trả JWT token.

| Field | Type | Required |
|---|---|---|
| `email` | string | ✅ |
| `password` | string | ✅ |

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": { "id": 1, "username": "ramona_eats", "display_name": "Ramona F.", ... }
}
```

---

### `POST /api/v1/auth/logout` 🆕

Đăng xuất. Invalidate token trên Redis blacklist.

**Headers:** `Authorization: Bearer <token>`  
**Response:** `{ "status": "ok" }`

---

## 2. Users & Profile

> Module: `src/users/` — CRUD người dùng + Profile page.

### `GET /api/v1/users/{user_id}` ✅ Đã có

Lấy thông tin public của user.

**Response:**
```json
{
  "id": 1,
  "username": "ramona_eats",
  "display_name": "Ramona F.",
  "avatar_url": "https://...",
  "bio": "Foodie Explorer 🍜 ...",
  "cover_url": "https://...",
  "location": "Dĩ An, Bình Dương",
  "title": "Taste Explorer",
  "xp": 1200,
  "level": 12,
  "created_at": "2025-03-01T00:00:00Z",
  "stats": {
    "reviews": 89,
    "visited": 142,
    "followers": 1240,
    "following": 356
  },
  "badges": [
    { "icon": "🔥", "label": "Spice Master", "color": "#E63946" }
  ]
}
```

> **Lưu ý:** `stats` là computed fields:
> - `reviews` = `COUNT(posts WHERE user_id = ?)`
> - `visited` = `COUNT(bookmarks WHERE user_id = ?)`
> - `followers` = `COUNT(friendships WHERE friend_id = ? AND status = 'accepted')`
> - `following` = `COUNT(friendships WHERE user_id = ? AND status = 'accepted')`

---

### `GET /api/v1/users/me` 🆕

Lấy thông tin user hiện tại (từ JWT token). Bao gồm cả private fields.

**Headers:** `Authorization: Bearer <token>`  
**Response:** Giống `GET /users/{id}` + thêm:
```json
{
  "...public fields...",
  "email": "ramona.f@email.com",
  "phone": "+84 901 234 567",
  "food_vector": [0.8, 0.3, ...],
  "place_vector": [0.5, 0.7, ...],
  "settings": { "theme": "dark", "language": "vi", ... }
}
```

---

### `PATCH /api/v1/users/me` 🆕

Cập nhật profile. Chỉ gửi fields cần thay đổi.

**Headers:** `Authorization: Bearer <token>`

| Field | Type | Mô tả |
|---|---|---|
| `display_name` | string | Tên hiển thị |
| `avatar_url` | string | URL avatar |
| `bio` | string | Giới thiệu bản thân |
| `cover_url` | string | Ảnh bìa |
| `location` | string | Vị trí |
| `phone` | string | SĐT (private) |
| `email` | string | Email (cần verify) |

**Response:** Updated `UserResponse`

---

### `GET /api/v1/users/{user_id}/top-spots` 🆕

Lấy top 3 địa điểm yêu thích nhất (dựa trên bookmarks + highest rating).

**Query params:** `limit=3`

**Response:**
```json
[
  { "name": "Bún Bò O Trắng", "image_url": "https://...", "rating": 4.9 }
]
```

---

## 3. Locations

> Module: `src/locations/` — CRUD địa điểm.

### `GET /api/v1/locations` 🆕

Danh sách địa điểm (paginated, filterable).

| Query Param | Type | Default | Mô tả |
|---|---|---|---|
| `limit` | int | 20 | Số kết quả |
| `offset` | int | 0 | Bắt đầu từ |
| `category` | string | — | "food" \| "place" |
| `city` | string | — | Lọc theo thành phố |
| `search` | string | — | Full-text search theo tên |
| `min_rating` | float | — | Rating tối thiểu |

**Response:**
```json
{
  "items": [
    {
      "id": 1, "name": "Bún Bò Huế", "lat": 10.89, "lng": 106.79,
      "address": "123 Lý Thường Kiệt", "city": "Dĩ An",
      "category": "food", "image_url": "https://...",
      "price_range": "35k", "open_hours": "7AM - 10PM",
      "rating": 4.8, "characteristics": {"spicy": 0.9, "street_food": 0.8}
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

---

### `GET /api/v1/locations/{location_id}` 🆕

Chi tiết một địa điểm (bao gồm posts, deals liên quan).

**Response:**
```json
{
  "id": 1,
  "name": "Bún Bò Huế Cô Giào",
  "lat": 10.89, "lng": 106.79,
  "address": "123 Lý Thường Kiệt, Dĩ An",
  "category": "food",
  "image_url": "https://...",
  "price_range": "35k",
  "open_hours": "7AM - 10PM",
  "rating": 4.8,
  "characteristics": { ... },
  "recent_posts": [ ... ],
  "active_deals": [ ... ]
}
```

---

### `POST /api/v1/locations` 🆕 (Admin)

Tạo địa điểm mới.

| Field | Type | Required |
|---|---|---|
| `name` | string | ✅ |
| `lat` | float | ✅ |
| `lng` | float | ✅ |
| `address` | string | ❌ |
| `city` | string | ❌ |
| `category` | "food" \| "place" | ✅ |
| `image_url` | string | ❌ |
| `price_range` | string | ❌ |
| `open_hours` | string | ❌ |
| `characteristics` | object | ❌ |

---

## 4. Discovery (Swipe Feed)

> Module: `src/feed/` — Lấy thẻ cho Tinder-style swipe.

### `GET /api/v1/feed/cards` ✅ Đã có

Lấy batch thẻ để Frontend render. Không chứa vector.

| Query Param | Type | Default | Mô tả |
|---|---|---|---|
| `user_id` | string | — | ID hoặc UUID guest |
| `lat` | float | — | Đầu vào cho thuật toán tính khoảng cách thực tế |
| `lng` | float | — | Bắt buộc gửi nếu muốn backend tính khoảng cách |
| `type` | "food" \| "place" | "place" | Domain |
| `limit` | int | 10 | Số thẻ |

**Response:** Cấu trúc hỗ trợ **Flip Card UI**:
```json
{
  "cards": [
    {
      "id": 1, 
      "name": "Bún Bò Huế",
      "image_url": "https://...",
      "tags": ["Spicy", "Street Food"],
      "price_range": "35k",
      "distance_km": 1.2,
      "match_percent": 94,
      "photos": [
        "https://...", "https://..."
      ],
      "reviews_preview": [
        "Nước dùng đậm đà, thịt bò mềm...",
        "Quán hơi đông vào buổi sáng nhưng phục vụ nhanh."
      ]
    }
  ]
}
```

---

## 5. Interactions (Swipe Learning)

> Module: `src/interactions/` — Ghi nhận swipe, cập nhật vector.

### `POST /api/v1/interactions/swipe-batch` ✅ Đã có

Ghi nhận batch swipe. Thuật toán: `U_new = U_old + α·P` với anti-spam decay.

**Request:**
```json
{
  "user_id": 1,
  "domain": "food",
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

Lịch sử swipe của user (dùng để hiển thị "đã xem" hoặc analytics).

| Query Param | Type | Default |
|---|---|---|
| `user_id` | int | — |
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

Gợi ý top-N dựa trên vector (Two-Pass: pgvector ANN → numpy scoring).

**Request:**
```json
{
  "user_vector": [0.8, 0.3, 0.9, ...],
  "top_n": 5
}
```

---

### `POST /api/v1/recommendations/contextual` 🆕

Gợi ý theo ngữ cảnh (thời tiết, thời gian, khoảng cách).  
Đây là hàm: `Score(S) = W1·Sim(U,P) + W2·C_weather − W3·D`

**Request:**
```json
{
  "user_id": 1,
  "lat": 10.89,
  "lng": 106.79,
  "domain": "food",
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

**Nút "Rescue Me"** — Ép trọng số Distance ($W_3$) lên 90%, bỏ qua Context (Thời tiết/thời gian), trả về duy nhất 1 kết quả có khoảng cách gần nhất (Radius < 1km) mà vector match vẫn tạm ổn (>60%). Tối ưu cho quyết định lười biếng.

**Request:**
```json
{
  "user_id": 1,
  "lat": 10.89,
  "lng": 106.79,
  "domain": "food",
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

## 7. Groups & Lobbies (Minimax)

> Module: `src/groups/` — Phòng nhóm + thuật toán Minimax referee.

### `POST /api/v1/groups` 🆕

Tạo phòng nhóm mới.

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `name` | string | ✅ | Tên phòng |
| `route_description` | string | ❌ | VD: "District 1 Mapping" |
| `scheduled_time` | datetime | ❌ | Thời gian hẹn |
| `max_spots` | int | ❌ | Mặc định: 6 |
| `cover_image_url` | string | ❌ | Ảnh nền lobby |
| `accent_color` | string | ❌ | Hex color cho UI |

**Response:** `GroupResponse`

---

### `GET /api/v1/groups` 🆕

Danh sách lobby đang active (để hiển thị "Live Group Lobbies").

| Query Param | Type | Default | Mô tả |
|---|---|---|---|
| `status` | string | "active" | active / completed |
| `limit` | int | 10 | — |

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Spicy Noodle Challenge",
      "route_description": "District 1 Mapping",
      "scheduled_time": "2026-03-28T20:00:00Z",
      "max_spots": 4,
      "cover_image_url": "https://...",
      "accent_color": "#ED1B24",
      "members": [
        { "user_id": 1, "display_name": "Ramona", "avatar_url": "...", "is_ready": true }
      ],
      "spots_remaining": 1
    }
  ]
}
```

---

### `GET /api/v1/groups/{group_id}` 🆕

Chi tiết lobby (members, trạng thái ready).

---

### `POST /api/v1/groups/{group_id}/join` 🆕

Tham gia lobby. Kiểm tra max_spots.

**Response:** `{ "status": "joined", "member": { ... } }`

---

### `POST /api/v1/groups/{group_id}/leave` 🆕

Rời lobby.

---

### `PATCH /api/v1/groups/{group_id}/ready` 🆕

Toggle trạng thái ready của member hiện tại.

| Field | Type | Required |
|---|---|---|
| `is_ready` | boolean | ✅ |

---

### `POST /api/v1/groups/{group_id}/recommend` ✅ Đã có (Refactored)

**Minimax Referee** — Đọc **session_vector** (KHÔNG đọc user vector gốc).
Loại trừ thẻ đã quẹt, ưu tiên starred cards từ teammates.

`min(max_i |Score_i − Score_ideal|)`

**Headers:** `X-User-ID: <user_id>` (để biết serve cho ai)

**Request:**
```json
{
  "category": "food",
  "lat": 10.89,
  "lng": 106.79,
  "meal_slot": "dinner",
  "top_n": 5
}
```

**Response:**
```json
{
  "group_vector": [0.65, 0.55, ...],
  "recommendations": [
    {
      "place_id": 3,
      "name": "BBQ Garden Night",
      "group_score": 0.82,
      "member_scores": [
        { "user_id": 1, "display_name": "Ramona", "score": 0.9, "compromise": 0.08 },
        { "user_id": 2, "display_name": "Khoa",   "score": 0.75, "compromise": 0.23 }
      ],
      "most_compromised_member": "Khoa",
      "compensation_note": "Khoa sẽ được ưu tiên ở bữa sau"
    }
  ]
}
```

---

### `GET /api/v1/groups/{group_id}/sync` 🆕

**Polling endpoint** — Frontend gọi mỗi 3-5 giây để lấy trạng thái mới nhất.

| Query Param | Type | Default | Mô tả |
|---|---|---|---|
| `since_ts` | string (ISO) | — | Chỉ lấy starred cards mới hơn timestamp này |

**Headers:** `X-User-ID: <user_id>`

**Response:**
```json
{
  "starred_cards": [
    {
      "location_id": 42,
      "location_name": "Bánh Mì Cô Thúy",
      "image_url": "https://...",
      "starred_by": "Khoa",
      "starred_at": "2026-04-01T22:30:00Z"
    }
  ],
  "group_vector": [0.65, 0.55, ...],
  "members_status": [
    { "user_id": 1, "display_name": "Ramona", "swipe_count": 12, "is_ready": true }
  ],
  "vault_count": 7
}
```

---

### `GET /api/v1/groups/{group_id}/vault` 🆕

Lấy danh sách Vault (Kho lưu trữ): Trả về toàn bộ các địa điểm đã được ít nhất 1 người LIKED hoặc STARRED.

| Query Param | Type | Default | Mô tả |
|---|---|---|---|
| `limit` | int | 50 | — |
| `sort_by` | string | "votes" | `votes` hoặc `recent` |

**Response:**
```json
{
  "items": [
    {
      "location_id": 42,
      "name": "Bánh Mì Cô Thúy",
      "image_url": "https://...",
      "total_likes": 3,
      "liked_by": [
        { "user_id": 1, "display_name": "Khoa", "action": "STARRED" },
        { "user_id": 2, "display_name": "Melody", "action": "LIKED" }
      ]
    }
  ]
}
```

---

### `POST /api/v1/groups/{group_id}/finish` 🆕

**Chốt danh sách** — Chỉ `is_host` mới gọi được. Đổi status → `completed`, chạy Minimax lần cuối.

**Headers:** `X-User-ID: <user_id>` (kiểm tra is_host)

**Request:**
```json
{
  "top_n": 3
}
```

**Response:**
```json
{
  "status": "completed",
  "final_resolutions": [
    {
      "place_id": 3,
      "name": "BBQ Garden Night",
      "group_score": 0.88,
      "member_scores": [
        { "user_id": 1, "score": 0.9, "compromise": 0.08 },
        { "user_id": 2, "score": 0.85, "compromise": 0.13 }
      ],
      "in_vault": true
    }
  ],
  "message": "Phiên khám phá đã kết thúc. Host có thể chọn 1 trong các địa điểm trên để tạo Tour."
}
```

---

### `POST /api/v1/groups/{group_id}/undo` 🆕

**Hoàn tác** — Rollback thẻ vừa quẹt. Đảo ngược phép tính vector, rút phiếu Vote nếu có.

**Headers:** `X-User-ID: <user_id>`

**Response:**
```json
{
  "status": "undone",
  "undone_interaction_id": 123,
  "reverted_vector": [0.62, 0.41, ...]
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

**Graph Routing** — Tối ưu thứ tự stops bằng modified Dijkstra/A*.  
`Cost = Traffic_Time + Weather_Penalty − Location_Score`

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

## 9. Posts (Foodie Feed)

> Module: `src/posts/` — Bài viết review địa điểm.

### `POST /api/v1/posts` 🆕

Tạo bài review mới.

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `location_id` | int | ❌ | Địa điểm (nullable) |
| `review` | string | ✅ | Nội dung review |
| `rating` | float | ❌ | 0.0–5.0 |
| `image_url` | string | ❌ | Ảnh kèm theo |
| `tags` | string[] | ❌ | VD: ["Street Food", "Spicy"] |

**Response:** `PostResponse`

---

### `GET /api/v1/posts` 🆕

Feed bài viết (paginated). Sắp xếp mới nhất trước.

| Query Param | Type | Default | Mô tả |
|---|---|---|---|
| `limit` | int | 20 | — |
| `offset` | int | 0 | — |
| `location` | string | — | Lọc theo city/area |
| `user_id` | int | — | Lọc theo user |

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "user": { "id": 1, "display_name": "Minh T.", "avatar_url": "..." },
      "location": { "id": 1, "name": "Bún Bò O Trắng" },
      "review": "Tìm được quán bún bò chân ái mới...",
      "rating": 4.8,
      "image_url": "https://...",
      "tags": ["Street Food", "Spicy"],
      "likes_count": 42,
      "comments_count": 8,
      "is_liked": false,
      "is_bookmarked": false,
      "created_at": "2026-03-28T10:00:00Z"
    }
  ],
  "total": 234
}
```

---

### `GET /api/v1/posts/{post_id}` 🆕

Chi tiết bài viết + comments.

---

### `DELETE /api/v1/posts/{post_id}` 🆕

Xóa bài viết (chỉ chủ bài).

---

### `POST /api/v1/posts/{post_id}/like` 🆕

Like bài viết. Toggle: gọi lại → unlike.

**Response:** `{ "liked": true, "likes_count": 43 }`

---

## 10. Reels

> Module: `src/reels/` — Video ngắn trending.

### `GET /api/v1/reels` 🆕

Danh sách reels (sắp theo views/trending).

| Query Param | Type | Default |
|---|---|---|
| `limit` | int | 10 |
| `sort` | "trending" \| "recent" | "trending" |

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "title": "Crispy Pork Belly ASMR 🔥",
      "user": { "id": 1, "username": "@foodie_ramona", "avatar_url": "..." },
      "video_url": "https://...",
      "thumbnail_url": "https://...",
      "views_count": 1200000,
      "likes_count": 45000,
      "comments_count": 320,
      "created_at": "2026-03-27T15:00:00Z"
    }
  ]
}
```

---

### `POST /api/v1/reels` 🆕

Upload reel mới.

| Field | Type | Required |
|---|---|---|
| `title` | string | ✅ |
| `video_url` | string | ✅ |
| `thumbnail_url` | string | ❌ |

---

### `GET /api/v1/reels/{reel_id}` 🆕

Chi tiết reel. Tự tăng `views_count += 1`.

---

### `POST /api/v1/reels/{reel_id}/like` 🆕

Like reel. Toggle.

---

## 11. Comments

> Module: `src/posts/` (shared) — Comments cho cả Posts và Reels.

### `GET /api/v1/posts/{post_id}/comments` 🆕

Danh sách comments trên post.

| Query Param | Type | Default |
|---|---|---|
| `limit` | int | 20 |
| `offset` | int | 0 |

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "user": { "id": 2, "display_name": "Khoa", "avatar_url": "..." },
      "content": "Quán này ngon thiệt! 🔥",
      "created_at": "2026-03-28T11:30:00Z"
    }
  ],
  "total": 8
}
```

---

### `POST /api/v1/posts/{post_id}/comments` 🆕

Thêm comment vào post.

| Field | Type | Required |
|---|---|---|
| `content` | string | ✅ |

---

### `GET /api/v1/reels/{reel_id}/comments` 🆕

Danh sách comments trên reel.

---

### `POST /api/v1/reels/{reel_id}/comments` 🆕

Thêm comment vào reel.

---

### `DELETE /api/v1/comments/{comment_id}` 🆕

Xóa comment (chỉ chủ comment).

---

## 12. Bookmarks (Taste Vault)

> Module: `src/bookmarks/` — "The Taste Vault" — địa điểm đã lưu.

### `GET /api/v1/bookmarks` 🆕

Danh sách bookmarks của user hiện tại.

| Query Param | Type | Default |
|---|---|---|
| `limit` | int | 20 |
| `offset` | int | 0 |

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "location": {
        "id": 5, "name": "Banh Mi Pho 古",
        "image_url": "...", "rating": 4.8,
        "category": "food", "price_range": "25k"
      },
      "xp_earned": 10,
      "created_at": "2026-03-28T09:00:00Z"
    }
  ],
  "total": 12
}
```

---

### `POST /api/v1/bookmarks` 🆕

Bookmark một địa điểm. Auto +XP.

| Field | Type | Required |
|---|---|---|
| `location_id` | int | ✅ |

**Response:** `{ "id": 1, "xp_earned": 10, "total_xp": 1210 }`

---

### `DELETE /api/v1/bookmarks/{bookmark_id}` 🆕

Bỏ bookmark.

---

## 13. Social (Friendships)

> Module: `src/social/` — Hệ thống bạn bè.

### `GET /api/v1/friends` 🆕

Danh sách bạn bè (accepted) + trạng thái online.

**Response:**
```json
{
  "items": [
    {
      "user": { "id": 2, "display_name": "Mai Linh", "avatar_url": "..." },
      "status": "online",
      "status_text": "🟢 Online",
      "since": "2026-01-15T00:00:00Z"
    }
  ]
}
```

> **Lưu ý:** `status` (online/eating/lobby) lấy từ Redis real-time, không lưu DB.

---

### `POST /api/v1/friends/request` 🆕

Gửi lời mời kết bạn. Tạo Notification cho người nhận.

| Field | Type | Required |
|---|---|---|
| `friend_id` | int | ✅ |

**Response:** `{ "status": "pending" }`

---

### `PATCH /api/v1/friends/{friendship_id}/accept` 🆕

Chấp nhận lời mời.

**Response:** `{ "status": "accepted" }`

---

### `PATCH /api/v1/friends/{friendship_id}/block` 🆕

Block.

---

### `DELETE /api/v1/friends/{friendship_id}` 🆕

Hủy kết bạn / hủy lời mời.

---

### `GET /api/v1/friends/requests` 🆕

Danh sách lời mời kết bạn pending.

---

## 14. Notifications

> Module: `src/notifications/` — Hệ thống thông báo.

### `GET /api/v1/notifications` 🆕

Danh sách thông báo (social / deal / system).

| Query Param | Type | Default | Mô tả |
|---|---|---|---|
| `limit` | int | 20 | — |
| `type` | string | — | social / deal / system |
| `unread_only` | bool | false | Chỉ chưa đọc |

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "type": "social",
      "title": "Ramona checked in at Phở 36",
      "body": null,
      "is_read": false,
      "reference_type": "location",
      "reference_id": 5,
      "created_at": "2026-03-28T19:56:00Z"
    }
  ],
  "unread_count": 3
}
```

---

### `PATCH /api/v1/notifications/{id}/read` 🆕

Đánh dấu đã đọc.

---

### `PATCH /api/v1/notifications/read-all` 🆕

Đánh dấu tất cả đã đọc.

---

## 15. Deals

> Module: `src/deals/` — Khuyến mãi & Sponsored content.

### `GET /api/v1/deals` 🆕

Danh sách deals đang active (chưa hết hạn).

| Query Param | Type | Default |
|---|---|---|
| `limit` | int | 10 |
| `location_id` | int | — |
| `sponsored_only` | bool | false |

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "title": "30% off at Matcha Garden today!",
      "description": "Áp dụng cho tất cả đồ uống...",
      "discount_percent": 30,
      "banner_image_url": "https://...",
      "xp_reward": 50,
      "is_sponsored": true,
      "location": { "id": 3, "name": "Matcha Garden" },
      "expires_at": "2026-03-28T23:00:00Z"
    }
  ]
}
```

---

### `POST /api/v1/deals` 🆕 (Admin)

Tạo deal mới.

---

### `GET /api/v1/deals/{deal_id}` 🆕

Chi tiết deal.

---

## 16. Gamification (Badges)

> Module: `src/gamification/` — Huy hiệu & XP.

### `GET /api/v1/badges` 🆕

Tất cả badges có thể nhận.

**Response:**
```json
[
  { "id": 1, "icon": "🔥", "label": "Spice Master", "color": "#E63946", "description": "Vuốt thích 50+ quán cay" },
  { "id": 2, "icon": "🌙", "label": "Night Owl", "color": "#7B2FF7", "description": "Check-in 10+ lần sau 10PM" }
]
```

---

### `GET /api/v1/users/{user_id}/badges` 🆕

Badges user đã nhận.

**Response:**
```json
[
  { "badge": { "id": 1, "icon": "🔥", "label": "Spice Master", "color": "#E63946" }, "earned_at": "2026-03-15T00:00:00Z" }
]
```

---

### `POST /api/v1/badges/check` 🆕 (Internal / Background)

Kiểm tra và cấp badge cho user (gọi bởi backend khi có event). Không public.

---

## 17. Settings

> Sử dụng JSONB field `settings` trong bảng `users`.

### `GET /api/v1/settings` 🆕

Lấy settings hiện tại.

**Response:**
```json
{
  "theme": "dark",
  "language": "vi",
  "notifications": {
    "friends_checkin": true,
    "nearby_deals": true,
    "vector_update": false,
    "lobby_invite": true
  }
}
```

---

### `PATCH /api/v1/settings` 🆕

Cập nhật settings. Chỉ gửi fields cần thay đổi.

> ⚠️ **Backend Note:** Trong PostgreSQL, update một phần (partial update) JSONB nếu dùng toán tử `=` thông thường sẽ overwrite toàn bộ column. 
> Cách xử lý: 
> 1. Dùng toán tử `||` (concatenation) của JSONB ở tầng DB: `UPDATE users SET settings = settings || '{"theme": "light"}'::jsonb`
> 2. Hoặc fetch `settings` cũ ra $\rightarrow$ merge (deep update) bằng Python dict $\rightarrow$ lưu lại vào DB.

**Request:**
```json
{
  "theme": "light",
  "notifications": { "vector_update": true }
}
```

**Response:** Updated full settings object.

---

## 18. Media / Uploads

> Module: `src/media/` — Xử lý nén, lưu trữ và sinh URL cho ảnh/video.

### `POST /api/v1/media/upload` 🆕

Upload ảnh/video lên server (hoặc S3/Cloudinary/R2). Frontend dùng link trả về để gửi kèm trong các API tạo User/Post/Reel/Group.

**Headers:** `Content-Type: multipart/form-data`

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `file` | file | ✅ | File ảnh hoặc video |
| `type` | string | ✅ | "avatar" \| "cover" \| "post" \| "reel" (để backend resize/optimize cho hợp lý) |

**Response:**
```json
{
  "url": "https://...",
  "file_type": "image/jpeg",
  "size_bytes": 102400
}
```

---

## Tổng hợp

| Module | Prefix | Endpoints | Status |
|---|---|---|---|
| Auth & Sessions | `/auth` | 4 | 2 ✅ + 2 🆕 |
| Users & Profile | `/users` | 4 | 1 ✅ + 3 🆕 |
| Locations | `/locations` | 3 | 3 🆕 |
| Discovery | `/feed` | 1 | 1 ✅ |
| Interactions | `/interactions` | 2 | 1 ✅ + 1 🆕 |
| Recommendations | `/recommendations` | 3 | 1 ✅ + 2 🆕 |
| Groups & Lobbies | `/groups` | 6 | 6 🆕 |
| Tours | `/tours` | 6 | 6 🆕 |
| Posts | `/posts` | 5 | 5 🆕 |
| Reels | `/reels` | 4 | 4 🆕 |
| Comments | (nested) | 5 | 5 🆕 |
| Bookmarks | `/bookmarks` | 3 | 3 🆕 |
| Social | `/friends` | 6 | 6 🆕 |
| Notifications | `/notifications` | 3 | 3 🆕 |
| Deals | `/deals` | 3 | 3 🆕 |
| Gamification | `/badges` | 3 | 3 🆕 |
| Settings | `/settings` | 2 | 2 🆕 |
| Media / Uploads | `/media` | 1 | 1 🆕 |
| **Tổng** | | **64** | **6 ✅ + 58 🆕** |

---

## Ghi chú kiến trúc

1. **Router → Service → DB:** Router chỉ validate + inject dependencies. Logic nặng nằm trong Service.
2. **Async/Await:** Tất cả I/O-bound dùng `async def`. CPU-bound (Minimax, graph routing) chạy trong `BackgroundTasks` hoặc thread pool.
3. **Redis:** Dùng cho session guest, anti-spam rate limiting, online status, token blacklist.
4. **Pagination:** Mọi list endpoint đều có `limit/offset`. Không bao giờ `SELECT *` không giới hạn.
5. **Auth:** `Depends(get_current_user)` cho các endpoint cần xác thực. Public endpoints (feed, reels trending) không yêu cầu auth.
