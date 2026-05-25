[← Back to Index](README.md)


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

### `GET /api/v1/users/search` 🆕

Tìm kiếm user bằng username hoặc display name (hỗ trợ tính năng tìm bạn bè/foodies).

| Query Param | Type | Default | Mô tả |
|---|---|---|---|
| `q` | string | — | Từ khóa tìm kiếm |
| `limit` | int | 10 | Số kết quả tối đa |

---

### `GET /api/v1/users/{user_id}/social-context` 🆕

Lấy thông tin về độ hợp cạ (**Taste Match**) và danh sách bạn chung (**Mutual Friends**) khi xem profile của người khác (nguồn cấp data cho **QuickActionsCard**).

**Response:**
```json
{
  "friendship_status": "none",
  "friendship_id": null,
  "food_vector": [0.8, 0.4, ...],
  "mutual_friends_count": 12,
  "mutual_friends": [
    { "id": 42, "username": "khoa_eats", "display_name": "Khoa", "avatar_url": "..." }
  ]
}
```