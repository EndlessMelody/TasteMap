[← Back to Index](README.md)

## 22. Membership & Monetization (Hội viên & Thanh toán)

> Module: `src/membership/` — Hệ thống 4 bậc hội viên (Bite/Savor/Feast/Omakase), thanh toán mock Visa, quota theo bậc, và kho khung avatar (Frames).
>
> Xem [`docs/database_schema/monetization.md`](../database_schema/monetization.md) cho schema đầy đủ và [`docs/flows/monetization.md`](../flows/monetization.md) cho sequence diagrams (checkout, gia hạn, tier resolution).

### Tier Overview

| Tier | Key | How obtained | Identity |
|---|---|---|---|
| 1 | `bite` | Default (everyone) | Neutral, no frame |
| 2 | `savor` | Login streak ≥ 7 days | Warm orange, flame frames |
| 3 | `feast` | Paid subscription (₫49.000/mo or ₫490.000/yr) | Violet signature gradient |
| 4 | `omakase` | Paid ∧ login streak ≥ 14 days | Animated gold |

### Entitlement Matrix

| Perk | Bite | Savor | Feast | Omakase |
|---|---|---|---|---|
| Daily swipes | 50 | 100 | ∞ | ∞ |
| Super likes/day | 1 | 3 | 10 | 15 |
| Swipe rewinds/day | 0 | 3 | ∞ | ∞ |
| Culture AI calls/day | 5 | 10 | ∞ | ∞ |
| Recommendation/tour-optimize calls/day | 10 | 20 | ∞ | ∞ |
| Tour stops per tour | 5 | 7 | 12 | 15 |
| Saved tours (total) | 5 | 15 | ∞ | ∞ |
| Vault bookmarks (total) | 100 | 300 | ∞ | ∞ |
| XP boost | +0% | +10% | +25% | +50% |
| Streak freezes/month | 0 | 1 | 2 | 3 |
| Advanced taste analytics | ✗ | ✗ | ✓ | ✓ |

Quotas are enforced via `MEMBERSHIP_QUOTAS_ENABLED` (env flag, default `true`). All daily counters reset at local midnight (GMT+7, matching `user_streaks.timezone_offset`).

### Error Codes (new)

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Card fails Luhn/expiry/CVV validation before any charge attempt |
| `PAYMENT_DECLINED` | 402 | Mock Visa declined the card (see `decline_code`) |
| `QUOTA_EXCEEDED` | 429 | Daily/structural quota reached for the caller's tier; response includes `X-Quota-Limit` / `X-Quota-Remaining: 0` headers |
| `FRAME_NOT_ELIGIBLE` | 403 | Attempting to equip a frame not owned, or requiring a tier the user no longer holds |

---

### `GET /api/v1/membership/plans` 🆕

Danh sách các gói trả phí có thể mua.

**Response:**
```json
{
  "success": true,
  "data": [
    { "plan": "feast_monthly", "price_vnd": 49000, "currency": "VND", "interval": "month" },
    { "plan": "feast_yearly", "price_vnd": 490000, "currency": "VND", "interval": "year", "savings_pct": 17 }
  ]
}
```

---

### `GET /api/v1/membership/entitlements` 🆕

Toàn bộ ma trận quyền lợi theo tier (dùng để render bảng so sánh).

**Response:**
```json
{
  "success": true,
  "data": {
    "bite": { "daily_swipes": 50, "super_likes_per_day": 1, "rewinds_per_day": 0, "culture_calls_per_day": 5, "recommendation_calls_per_day": 10, "tour_stops_max": 5, "saved_tours_max": 5, "vault_bookmarks_max": 100, "xp_boost_pct": 0, "streak_freezes_per_month": 0, "advanced_analytics": false },
    "savor": { "daily_swipes": 100, "super_likes_per_day": 3, "rewinds_per_day": 3, "culture_calls_per_day": 10, "recommendation_calls_per_day": 20, "tour_stops_max": 7, "saved_tours_max": 15, "vault_bookmarks_max": 300, "xp_boost_pct": 10, "streak_freezes_per_month": 1, "advanced_analytics": false },
    "feast": { "daily_swipes": null, "super_likes_per_day": 10, "rewinds_per_day": null, "culture_calls_per_day": null, "recommendation_calls_per_day": null, "tour_stops_max": 12, "saved_tours_max": null, "vault_bookmarks_max": null, "xp_boost_pct": 25, "streak_freezes_per_month": 2, "advanced_analytics": true },
    "omakase": { "daily_swipes": null, "super_likes_per_day": 15, "rewinds_per_day": null, "culture_calls_per_day": null, "recommendation_calls_per_day": null, "tour_stops_max": 15, "saved_tours_max": null, "vault_bookmarks_max": null, "xp_boost_pct": 50, "streak_freezes_per_month": 3, "advanced_analytics": true }
  }
}
```
`null` = unlimited.

---

### `GET /api/v1/membership/me` 🆕

Trạng thái hội viên hiện tại của bản thân — dùng cho trang Membership và Settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "tier": "feast",
    "streak": { "current_streak": 9, "is_alive": true, "days_to_savor": 0, "days_to_omakase": 5 },
    "subscription": { "plan": "feast_monthly", "status": "active", "current_period_end": "2026-08-08T00:00:00Z", "cancel_at_period_end": false },
    "equipped_frame": { "id": 4, "slug": "feast-signature-gradient", "style_key": "feast-signature-gradient", "accent_color": "#7b2ff7", "is_animated": false },
    "frames_owned": [1, 2, 4],
    "freezes": { "allowance": 2, "used_this_month": 0 }
  }
}
```
`subscription` is `null` when the user has never subscribed or the subscription has expired.

---

### `GET /api/v1/membership/quotas` 🆕

Quota usage hiện tại theo từng feature — dùng để hiển thị thanh tiến trình / cảnh báo sắp hết trong UI.

**Response:**
```json
{
  "success": true,
  "data": {
    "swipes": { "limit": 50, "used": 12, "remaining": 38 },
    "super_likes": { "limit": 1, "used": 1, "remaining": 0 },
    "culture_calls": { "limit": 5, "used": 2, "remaining": 3 },
    "recommendation_calls": { "limit": 10, "used": 0, "remaining": 10 }
  }
}
```
Field is omitted (unlimited) for tiers where the perk has no cap.

---

### `POST /api/v1/membership/subscribe` 🆕

Đăng ký gói Feast qua mock Visa. **Request body chấp nhận MỘT trong hai:** thẻ mới (`card`) hoặc phương thức đã lưu (`payment_method_id`).

**Request:**
```json
{
  "plan": "feast_monthly",
  "idempotency_key": "a1b2c3d4-...-uuid",
  "card": {
    "number": "4242424242424242",
    "exp_month": 12,
    "exp_year": 2028,
    "cvc": "123",
    "name": "NGUYEN VAN A"
  }
}
```
hoặc
```json
{ "plan": "feast_yearly", "idempotency_key": "e5f6...-uuid", "payment_method_id": 7 }
```

**Response (success, 200):**
```json
{
  "success": true,
  "data": {
    "subscription": { "plan": "feast_monthly", "status": "active", "current_period_start": "2026-07-08T00:00:00Z", "current_period_end": "2026-08-08T00:00:00Z", "cancel_at_period_end": false },
    "transaction": { "id": 101, "status": "succeeded", "amount_vnd": 49000, "receipt_number": "TM-2026-000042", "provider_txn_id": "mv_9f2a..." },
    "tier": "feast"
  }
}
```

**Response (declined, 402):**
```json
{ "success": false, "error": "Your card was declined.", "error_code": "PAYMENT_DECLINED", "trace_id": "..." }
```
The declined attempt is still recorded in `payment_transactions` (`status="declined"`, `decline_code` set) for the ledger/receipt history.

**Test cards (mock Visa provider — never real charges):**

| Number | Outcome | `decline_code` |
|---|---|---|
| `4242 4242 4242 4242` | Success | — |
| `4000 0000 0000 0002` | Declined | `card_declined` |
| `4000 0000 0000 9995` | Declined | `insufficient_funds` |
| `4000 0000 0000 0069` | Declined | `expired_card` |
| `4000 0000 0000 0127` | Declined | `incorrect_cvc` |
| `4000 0000 0000 0119` | Declined | `processing_error` |
| Any other Luhn-valid Visa number | Success | — |

Validation (Luhn, brand, expiry, CVV format) fails fast with 400 `VALIDATION_ERROR` before any simulated network delay. Successful/declined charges simulate a 1.2–2.4s processing delay. Resending the same `idempotency_key` returns the original stored outcome without charging again.

---

### `POST /api/v1/membership/cancel` 🆕

Hủy gia hạn tự động — subscription vẫn `active` cho đến hết `current_period_end` (Stripe-style).

**Response:**
```json
{ "success": true, "data": { "status": "active", "cancel_at_period_end": true, "current_period_end": "2026-08-08T00:00:00Z" } }
```

---

### `POST /api/v1/membership/resume` 🆕

Hủy thao tác cancel — bật lại tự động gia hạn trước khi hết hạn.

**Response:**
```json
{ "success": true, "data": { "status": "active", "cancel_at_period_end": false } }
```

---

### `GET /api/v1/membership/payment-methods` 🆕

Danh sách thẻ đã lưu (đã che số).

**Response:**
```json
{ "success": true, "data": [ { "id": 7, "brand": "visa", "last4": "4242", "exp_month": 12, "exp_year": 2028, "is_default": true } ] }
```

---

### `POST /api/v1/membership/payment-methods` 🆕

Lưu thẻ mới mà không thanh toán ngay (validate + Luhn check, không gọi mock charge).

**Request:**
```json
{ "number": "4242424242424242", "exp_month": 12, "exp_year": 2028, "cvc": "123", "name": "NGUYEN VAN A", "set_default": true }
```

**Response:**
```json
{ "success": true, "data": { "id": 7, "brand": "visa", "last4": "4242", "exp_month": 12, "exp_year": 2028, "is_default": true } }
```

---

### `DELETE /api/v1/membership/payment-methods/{id}` 🆕

Xóa thẻ đã lưu (không được xóa nếu đang gắn với subscription `active`).

---

### `GET /api/v1/membership/transactions` 🆕

Lịch sử giao dịch (ledger) — hỗ trợ `limit`/`offset`.

**Response:**
```json
{ "success": true, "data": { "items": [ { "id": 101, "type": "purchase", "status": "succeeded", "amount_vnd": 49000, "receipt_number": "TM-2026-000042", "created_at": "2026-07-08T10:00:00Z" } ], "total": 1, "limit": 10, "offset": 0 } }
```

---

### `GET /api/v1/membership/transactions/{id}/receipt` 🆕

Biên lai chi tiết cho một giao dịch thành công.

**Response:**
```json
{
  "success": true,
  "data": {
    "receipt_number": "TM-2026-000042",
    "plan": "feast_monthly",
    "amount_vnd": 49000,
    "currency": "VND",
    "card_last4": "4242",
    "period_start": "2026-07-08T00:00:00Z",
    "period_end": "2026-08-08T00:00:00Z",
    "created_at": "2026-07-08T10:00:00Z"
  }
}
```

---

### `GET /api/v1/membership/frames` 🆕

Toàn bộ catalog khung avatar kèm trạng thái sở hữu/khả dụng của bản thân.

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "slug": "savor-ember", "name": "Ember Ring", "min_tier": "savor", "style_key": "savor-ember", "accent_color": "#ff6b35", "is_animated": false, "owned": true, "equippable": true },
    { "id": 6, "slug": "omakase-gold-shimmer", "name": "Gold Shimmer", "min_tier": "omakase", "style_key": "omakase-gold-shimmer", "accent_color": "#d4a017", "is_animated": true, "owned": false, "equippable": false }
  ]
}
```

---

### `PUT /api/v1/membership/frames/equip` 🆕

Gắn (hoặc gỡ) một khung avatar. Cùng mẫu với `PUT /api/v1/users/me/primary-badge`.

**Request:**
```json
{ "frame_id": 4 }
```
`frame_id: null` để gỡ khung hiện tại.

**Response:**
```json
{ "success": true, "data": { "equipped_frame_id": 4 } }
```
Lỗi `403 FRAME_NOT_ELIGIBLE` nếu chưa sở hữu, hoặc tier hiện tại thấp hơn `min_tier` của khung.
