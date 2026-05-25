#  TasteMap — API Documentation Index

Tài liệu này là bản đồ dẫn đường cho toàn bộ hệ thống API của TasteMap.

## 1. Cấu hình Chung (Global Config)
- **Base URL:** `/api/v1`
- **Auth Header:** `Authorization: Bearer <token>`
- **X-User-ID:** Cần thiết cho các endpoint `/me` hoặc check quyền.
- **Pagination:** Mặc định dùng `limit` và `offset`. Các module Feed/Messages dùng `cursor`.

## 2. Danh mục Module (Module Map)
- **[Shared Types](./shared_types.md):** Cấu trúc dữ liệu dùng chung (UserBrief, Pagination, Responses).
- **[Xác thực](./auth.md):** Đăng ký, Đăng nhập, JIT Sync, OTP.
- **[Người dùng](./users.md):** Quản lý Profile, Tìm kiếm, Social Context.
- **[Mạng xã hội](./social.md):** Bạn bè, Chat 1-1, Nhóm (Lobby), Thông báo.
- **[Nội dung](./content.md):** Địa điểm, Bài viết, Reels, Bình luận, Vault.
- **[Khám phá AI](./discovery.md):** Swipe Feed, AI Story, Tours, Culture Guide.
- **[Gamification](./gamification.md):** Huy hiệu, Thử thách, XP, Bảng xếp hạng.
- **[Hệ thống](./system.md):** Cài đặt, Upload Media.

## 3. System Traceability Matrix

Bản đồ truy vết giữa API Domain và Database Schema:

| Domain (Nghiệp vụ) | API Module | Database Schema | Key Tables |
|---|---|---|---|
| Xác thực & Danh tính (Identity & Auth) | `auth.md` | `core.md` | `users`, `sessions`, `otps` |
| Người dùng (Profile) | `users.md` | `core.md` | `users` |
| Thao tác Xã hội & Chat (Social) | `social.md` | `social.md` | `friendships`, `chat_messages`, `groups` |
| Nội dung người dùng (Content - UGC) | `content.md` | `content.md` | `posts`, `reels`, `comments`, `locations` |
| Gợi ý AI & Khám phá (Discovery) | `discovery.md` | `interactions.md` | `interactions`, `bookmarks` |
| Gamification & Thử thách | `gamification.md` | `gamification.md` | `badges`, `challenges`, `user_challenges` |
| Hệ thống (System) | `system.md` | N/A | Upload storage, System settings |