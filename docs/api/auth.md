[← Back to Index](README.md)

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

### `POST /api/v1/auth/sync` 🆕

**JIT Provisioning** — Đồng bộ User từ Supabase sang PostgreSQL. API này cực kỳ quan trọng cho hệ thống Auth. Xác thực Supabase JWT, trích xuất sub/email, sau đó tìm hoặc tạo User trong DB nội bộ.

**Headers:** `Authorization: Bearer <Supabase_JWT>`  
**Response:** `UserMe` (Thông tin user hoàn chỉnh sau khi đồng bộ)

---

### `POST /api/v1/auth/register/send-otp` 🆕

Gửi mã OTP xác minh email khi đăng ký.

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `email` | string | ✅ | Email nhận OTP |
| `username` | string | ✅ | Username dự kiến |

**Response:** `{ "success": true, "message": "OTP sent", "expires_in": 600 }`

---

### `POST /api/v1/auth/register/verify-otp` 🆕

Xác minh mã OTP đăng ký.

| Field | Type | Required |
|---|---|---|
| `email` | string | ✅ |
| `otp` | string | ✅ |

**Response:** `{ "success": true, "message": "OTP verified" }`

---

### `POST /api/v1/auth/resolve-email` 🆕

Trả về email dựa trên username để hỗ trợ quy trình login.

| Field | Type | Required |
|---|---|---|
| `username` | string | ✅ |

**Response:** `{ "email": "r*******.f@email.com" }`

---

### `POST /api/v1/auth/register/check` 🆕

Kiểm tra xem email và username đã tồn tại hay chưa trước khi user đăng ký.

| Field | Type | Required |
|---|---|---|
| `email` | string | ✅ |
| `username` | string | ✅ |

**Response:** `{ "available": true, "email_exists": false, "username_exists": false, "message": "Available" }`
