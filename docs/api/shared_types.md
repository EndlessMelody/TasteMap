# Shared Types & Common Objects

[← Back to Index](README.md)

Tài liệu này định nghĩa các cấu trúc dữ liệu (JSON Objects) được sử dụng lặp lại trên nhiều endpoints của TasteMap, giúp tài liệu API ngắn gọn, nhất quán và bớt dư thừa (DRY).

---

## 1. Phản hồi tiêu chuẩn (Standard API Responses)

Tất cả các API (nếu áp dụng Convention) sẽ gói gọn kết quả trả về bằng cấu trúc chuẩn.

### 1.1 `SuccessResponse`
Áp dụng cho mọi API request thành công (Status 2xx).
```json
{
  "success": true,
  "data": { ... }, // Data Model thực tế
  "message": "Optional status message"
}
```

### 1.2 `ErrorResponse`
Áp dụng cho API bị lỗi (Status 4xx, 5xx).
```json
{
  "success": false,
  "error": "Error_Code",
  "detail": "Human readable error description"
}
```

---

## 2. Phân trang (Pagination Models)

### 2.1 `OffsetPagination`
Phương pháp phân trang mặc định dùng cho Admin list, Bookmarks, Users list.
```json
{
  "items": [ ... ],
  "total": 150,
  "limit": 10,
  "offset": 0
}
```

### 2.2 `CursorPagination`
Sử dụng cho các luồng Infinite Scroll có dữ liệu realtime cập nhật liên tục (như Feed, Messages, Notifications). Tránh bị sót/trùng lặp item khi database thêm phần tử mới.
```json
{
  "items": [ ... ],
  "next_cursor": "1711612800", // Thường là timestamp hoặc UUID của last_item
  "has_more": true
}
```

---

## 3. Các Object Cốt Lõi Dự Phòng Dạng Ngắn (Brief Models)

Trong các payload mà không cần trả về toàn bộ chi tiết, Backend sẽ trả về `Brief` Model.

### 3.1 `UserBrief`
Dành cho danh sách người dùng (Comments, Friends, Likes, Lobby Members).
*Liên kết DB: `users`*

```json
{
  "id": 1,
  "username": "taste_explorer",
  "display_name": "Tuan Anh",
  "avatar_url": "https://...",
  "taste_match": 0.85 // (Tuỳ chọn) Độ hợp cạ (Cần contextual recommend)
}
```

### 3.2 `LocationBrief`
Dành cho các search nhanh, trích xuất điểm dừng của Tour, hoặc Feed tóm tắt.
*Liên kết DB: `locations`*

```json
{
  "id": 42,
  "name": "Bún Bò Cô Ngọc",
  "rating": 4.5,
  "review_count": 120,
  "distance_km": 1.2, // (Tuỳ chọn) Khoảng cách từ điểm người dùng đứng
  "price_level": 2, // 1-4 scale
  "image_url": "https://..."
}
```

### 3.3 `PostBrief`
Dành cho lưới hiển thị profile (Grid view), bookmarks collection.
*Liên kết DB: `posts`*

```json
{
  "id": 101,
  "media_url": "https://...",
  "media_type": "image", // "image" | "video"
  "like_count": 50,
  "comment_count": 12
}
```
