[← Back to Index](README.md)

#


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

### `POST /api/v1/groups/join-by-code` 🆕

Tham gia vào một private lobby bằng mã mời (**Invite Code**).

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `invite_code` | string | ✅ | Mã mời (VD: SQUAD-X9K2) |

**Response:** `GroupResponse`

---

### `GET /api/v1/groups/{group_id}/messages` 🆕

Lấy lịch sử tin nhắn chat trong phòng Lobby.

**Query params:** `limit=50`
**Response:** `List[ChatMessage]`

---

### `POST /api/v1/groups/{group_id}/messages` 🆕

Gửi tin nhắn chat vào phòng Lobby.

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `content` | string | ✅ | Nội dung tin nhắn |
| `content_type` | string | ❌ | "text" (default) |

**Response:** `ChatMessage`

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

### `GET /api/v1/friends/foodies` 🆕

Lấy danh sách bạn bè kèm theo điểm số hợp cạ (**Taste Match Scores**).

**Response:** `List[FriendWithScore]`

---

### `GET /api/v1/friends/sent` 🆕

Lấy danh sách lời mời kết bạn đã gửi đi (**Outgoing Requests**).

---

### `GET /api/v1/friends/discover` 🆕

Khám phá những foodies có độ hợp cạ cao nhưng chưa kết bạn. Dựa trên Vector Similarity.

**Response:** `List[DiscoverFoodie]`

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

## 20. Messages (Direct)

> Module: `src/messages/` — Chat 1-1 (Direct Messaging).

### `GET /api/v1/messages/inbox` 🆕

Lấy danh sách hộp thư đến (các cuộc hội thoại kèm tin nhắn cuối cùng).

---

### `GET /api/v1/messages/{other_user_id}` 🆕

Lấy lịch sử chat với 1 user cụ thể. Kết quả trả về danh sách tin nhắn sắp xếp theo thời gian mới nhất.

| Query Param | Type | Default | Mô tả |
|---|---|---|---|
| `limit` | int | 60 | Số tin nhắn tối đa |
| `offset` | int | 0 | Điểm bắt đầu (để load thêm tin nhắn cũ) |

---

### `POST /api/v1/messages/{other_user_id}` 🆕

Gửi tin nhắn (text hoặc media).

---

### `PATCH /api/v1/messages/{other_user_id}/read` 🆕

Đánh dấu đã đọc tất cả tin nhắn từ user đó.

---

### `PATCH /api/v1/messages/{other_user_id}/{message_id}` 🆕

Chỉnh sửa tin nhắn (trong vòng 15 phút).

---

### `DELETE /api/v1/messages/{other_user_id}/{message_id}` 🆕

Xóa tin nhắn (xóa cho mọi người hoặc xóa phía mình).

---

### `POST /api/v1/messages/{other_user_id}/{message_id}/reactions` 🆕

Thả reaction (icon) vào tin nhắn.

---

### `DELETE /api/v1/messages/{other_user_id}/{message_id}/reactions` 🆕

Gỡ reaction khỏi tin nhắn.

---