[← Back to Index](README.md)

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

### `GET /api/v1/badges/admin/all` 🆕 (Admin)

Admin - Lấy toàn bộ badges kèm theo metrics (ví dụ: `owned_count`).

---

### `PATCH /api/v1/badges/{badge_id}` 🆕 (Admin)

Admin - Chỉnh sửa thông tin một badge (Tên, icon, rarity, accent color).

---

### `DELETE /api/v1/badges/{badge_id}` 🆕 (Admin)

Admin - Xóa một badge khỏi hệ thống.

---

### `POST /api/v1/badges/admin/award/{user_id}/{badge_id}` 🆕 (Admin)

Admin - Cấp phát huy hiệu thủ công cho một user cụ thể.

---

## 19. Challenges

> Module: `src/challenges/` — Hệ thống Thử thách & Leaderboard.

### `GET /api/v1/challenges/` 🆕 (Admin)

Admin - Lấy danh sách toàn bộ challenges để quản lý.

---

### `POST /api/v1/challenges/` 🆕 (Admin)

Admin - Tạo challenge mới (XP, badges, target count).

---

### `GET /api/v1/challenges/me` 🆕

Lấy danh sách thử thách của bản thân và tiến độ hiện tại.

---

### `GET /api/v1/challenges/xp/me` 🆕

Lấy thông tin XP, level hiện tại và tiến bộ đến level tiếp theo.

---

### `GET /api/v1/challenges/streaks/me` 🆕

Lấy thông tin streak (chuỗi ngày check-in) của user.

---

### `POST /api/v1/challenges/streaks/checkin` 🆕

Điểm danh hàng ngày (Daily Check-in) để giữ streak và nhận XP.

---

### `POST /api/v1/challenges/{challenge_id}/join` 🆕

Tham gia vào một thử thách mới.

---

### `POST /api/v1/challenges/{user_challenge_id}/claim` 🆕

Nhận phần thưởng sau khi hoàn thành thử thách.

---

### `GET /api/v1/challenges/leaderboard` 🆕

Xem bảng xếp hạng (Rankings) theo thời gian (tuần/tháng/tất cả).

---

### `GET / PUT / DELETE /api/v1/challenges/{challenge_id}` 🆕

Xem chi tiết (**GET**), cập nhật (**PUT**), hoặc xóa (**DELETE**) một thử thách. Tài khoản gọi API phải có quyền Admin đối với các thao tác thay đổi dữ liệu.
