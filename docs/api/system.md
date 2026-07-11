[← Back to Index](README.md)

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

🔒 **Auth bắt buộc** (`Authorization: Bearer <token>`).

Upload ảnh/video lên server (hoặc S3/Cloudinary/R2). Frontend dùng link trả về để gửi kèm trong các API tạo User/Post/Reel/Group.

**Headers:** `Content-Type: multipart/form-data`, `Authorization: Bearer <token>`

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

## 19. Health & Readiness

> Module: `src/main.py` — Root-level infra endpoints (không nằm dưới `/api/v1`), dùng cho load balancer / Render health check. Không có bảng DB tương ứng (N/A trong Traceability Matrix).

### `GET /health` 🆕

Liveness probe — luôn trả `200` nếu process còn sống, không kiểm tra dependency nào.

**Response:**
```json
{ "status": "ok" }
```

---

### `GET /health/ready` 🆕

Readiness probe — kiểm tra thực sự kết nối được tới Database (`SELECT 1`) và Redis (`PING`). Dùng làm `healthCheckPath` cho Render (`render.yaml`), thay vì `/health`, để tránh trường hợp deploy "healthy" trong khi DB/Redis đã chết.

**Response (200 — sẵn sàng):**
```json
{
  "status": "ready",
  "checks": {
    "database": "ok",
    "redis": "ok"
  }
}
```

**Response (503 — chưa sẵn sàng):**
```json
{
  "status": "not_ready",
  "checks": {
    "database": "ok",
    "redis": "error: <exception message>"
  }
}
```

---