# 🗺️ TasteMap — Database Schema Guide

Tài liệu này mô tả cấu trúc Cơ sở dữ liệu (PostgreSQL) của dự án TasteMap. Để tối ưu việc đọc hiểu và quản lý, toàn bộ Schema đã được chia nhỏ theo các Domain (Nghiệp vụ) cụ thể.

## 1. Cấu trúc Tài liệu (Module Map)

Vui lòng tham khảo các file chi tiết dưới đây khi cần làm việc với một Domain cụ thể:

* **[`core.md`](./core.md):** Quản lý tài khoản (Users), thông tin cốt lõi và lịch sử Migration (Alembic).
* **[`social.md`](./social.md):** Kết nối bạn bè, Groups (Lobbies), Tin nhắn (Chat 1-1 & Group Chat) và Thông báo.
* **[`content.md`](./content.md):** UGC (User-Generated Content) bao gồm Posts, Reels, Locations, Comments và Deals.
* **[`interactions.md`](./interactions.md):** Dữ liệu hành vi người dùng (Swipes), Bookmarks (Taste Vault) dùng để train AI.
* **[`gamification.md`](./gamification.md):** Cấp độ (Levels), XP, Huy hiệu (Badges) và Hệ thống Thử thách (Challenges/Streaks).

---

## 2. Quy chuẩn Thiết kế CSDL (Global Conventions)

Mọi bảng và cột trong TasteMap cần tuân thủ các quy chuẩn sau:

1. **Naming Convention (Quy tắc đặt tên):**
   * Tên bảng (Table): `snake_case` và ở dạng số nhiều (VD: `users`, `chat_messages`).
   * Tên cột (Column): `snake_case` (VD: `created_at`, `avatar_url`).

2. **Primary Keys (Khóa chính):**
   * Mặc định sử dụng `id` kiểu `int4` (INTEGER), Auto-Increment cho hầu hết các bảng.

3. **Timestamps (Thời gian):**
   * Sử dụng kiểu `timestamptz` (Timestamp with Timezone) để đồng bộ đa quốc gia.
   * Các bảng lưu dữ liệu động bắt buộc có `created_at` (Default: NOW()) và `updated_at` (Tự động cập nhật khi có trigger/ORM).

4. **Soft Deletes (Xóa mềm):**
   * Các bảng nội dung quan trọng (như `chat_messages`, `posts`) sử dụng cột `is_deleted` (BOOLEAN) thay vì xóa cứng (Hard delete) khỏi DB.

---

## 3. Extensions & Kiểu dữ liệu Đặc thù

* **`VECTOR(15)` (pgvector):** Sử dụng cho các cột `food_vector` và `place_vector` trong bảng `users` và `locations` để phục vụ tính năng Match & Recommendation (Minimax / Cosine Similarity).
* **`JSONB`:** Được dùng cho các cột chứa dữ liệu cấu hình không có cấu trúc cố định (VD: `settings` của user, `media_meta` của chat, hoặc `action_filter` của challenges) để tăng tốc độ truy vấn linh hoạt.