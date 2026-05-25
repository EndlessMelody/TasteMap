[← Back to Index](README.md)

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

### `GET /api/v1/locations/by-food/{food_name}` 🆕

Tìm địa điểm dựa theo tên món ăn cụ thể. Tài liệu này liên quan mật thiết đến module Culture Guide để chuyển đổi từ tên món sang địa điểm thực tế.

**Query params:** `limit=10`
**Response:** `LocationListResponse`

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