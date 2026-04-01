# Database Schema Design

## Users

- `id` (INTEGER, PK, AUTO-INCREMENT)
- `username` (VARCHAR, UNIQUE, NOT NULL)
- `email` (VARCHAR, UNIQUE, NOT NULL)
- `password_hash` (VARCHAR)
- `display_name` (VARCHAR)
- `avatar_url` (VARCHAR)
- `bio` (TEXT) - Mô tả bản thân
- `cover_url` (VARCHAR) - Ảnh bìa profile
- `location` (VARCHAR) - VD: "Dĩ An, Bình Dương"
- `title` (VARCHAR) - Gamification title: "Taste Explorer"
- `phone` (VARCHAR) - Số điện thoại (private)
- `food_vector` (VECTOR(15), NOT NULL, DEFAULT) - default: [0.5]*15
- `place_vector` (VECTOR(15), NOT NULL, DEFAULT) - default: [0.5]*15
- `xp` (INTEGER, DEFAULT 0)
- `level` (INTEGER, DEFAULT 1)
- `settings` (JSONB) - VD: {"theme": "dark", "language": "vi", "notif_friends": true}
- `created_at` (TIMESTAMP, DEFAULT NOW)
- `updated_at` (TIMESTAMP, DEFAULT NOW)

## Locations

- `id` (INTEGER, PK, AUTO-INCREMENT)
- `name` (VARCHAR, NOT NULL)
- `vector` (VECTOR(15))
- `lat` (FLOAT, NOT NULL)
- `lng` (FLOAT, NOT NULL)
- `address` (VARCHAR)
- `city` (VARCHAR)
- `base_score` (FLOAT, DEFAULT 0.0)
- `category` (VARCHAR) - Phân loại: food / place
- `image_url` (VARCHAR)
- `price_range` (VARCHAR) - VD: 25k, 120k
- `open_hours` (VARCHAR) - VD: Open until 2AM
- `rating` (FLOAT, DEFAULT 0.0)
- `characteristics` (JSONB)
- `created_at` (TIMESTAMP, DEFAULT NOW)

## Interactions

- `id` (INTEGER, PK, AUTO-INCREMENT)
- `user_id` (INTEGER, FK, NOT NULL)
- `location_id` (INTEGER, FK, NOT NULL)
- `group_id` (INTEGER, FK) - Nullable. Đánh dấu quẹt khi ở trong phòng nhóm. (Dùng để query ra Group's Vault)
- `action` (VARCHAR, NOT NULL) - LIKED / DISLIKED / SKIPPED / SAVED / STARRED
- `context_at_time` (JSONB)
- `timestamp` (TIMESTAMP, NOT NULL, DEFAULT NOW)
- **Index:** `(user_id, timestamp)`
- **Index:** `(group_id, action)` - Tối ưu tốc độ khi query danh sách Vault

## Groups

- `id` (INTEGER, PK, AUTO-INCREMENT)
- `name` (VARCHAR, NOT NULL)
- `status` (VARCHAR, NOT NULL, DEFAULT 'active') - active / completed / cancelled
- `route_description` (VARCHAR) - VD: District 1 Mapping
- `scheduled_time` (TIMESTAMP)
- `max_spots` (INTEGER, DEFAULT 6)
- `cover_image_url` (VARCHAR)
- `accent_color` (VARCHAR) - Mã màu Hex cho UI của lobby
- `created_at` (TIMESTAMP, DEFAULT NOW)

## Group Members

- `id` (INTEGER, PK, AUTO-INCREMENT)
- `group_id` (INTEGER, FK, NOT NULL)
- `user_id` (INTEGER, FK, NOT NULL)
- `is_host` (BOOLEAN, DEFAULT FALSE) - Đánh dấu người tạo phòng (Có quyền bấm nút Chốt danh sách)
- `session_vector` (VECTOR(15)) - Clone từ Users. Cập nhật real-time khi lướt.
- `compromise_score` (FLOAT, DEFAULT 0.0) - Điểm Minimax
- `is_ready` (BOOLEAN, DEFAULT FALSE)
- `joined_at` (TIMESTAMP, DEFAULT NOW)

## Friendships

- `id` (INTEGER, PK, AUTO-INCREMENT)
- `user_id` (INTEGER, FK, NOT NULL)
- `friend_id` (INTEGER, FK, NOT NULL)
- `status` (VARCHAR, NOT NULL, DEFAULT 'pending') - pending / accepted / blocked
- `created_at` (TIMESTAMP, DEFAULT NOW)
- **Index:** `UNIQUE(user_id, friend_id)`

## Badges

- `id` (INTEGER, PK, AUTO-INCREMENT)
- `icon` (VARCHAR, NOT NULL) - Emoji: "🔥", "🌙", "📸", "👑"
- `label` (VARCHAR, NOT NULL) - "Spice Master", "Night Owl"
- `color` (VARCHAR, NOT NULL) - Hex: "#E63946", "#7B2FF7"
- `description` (VARCHAR)
- `created_at` (TIMESTAMP, DEFAULT NOW)

## User Badges

- `id` (INTEGER, PK, AUTO-INCREMENT)
- `user_id` (INTEGER, FK, NOT NULL)
- `badge_id` (INTEGER, FK, NOT NULL)
- `earned_at` (TIMESTAMP, DEFAULT NOW)
- **Index:** `UNIQUE(user_id, badge_id)`

## Posts

- `id` (INTEGER, PK, AUTO-INCREMENT)
- `user_id` (INTEGER, FK, NOT NULL)
- `location_id` (INTEGER, FK)
- `review` (TEXT, NOT NULL)
- `rating` (FLOAT)
- `image_url` (VARCHAR)
- `tags` (VARCHAR[]) - VD: {Street Food, Spicy}
- `likes_count` (INTEGER, DEFAULT 0)
- `comments_count` (INTEGER, DEFAULT 0)
- `created_at` (TIMESTAMP, DEFAULT NOW)

## Post Likes

- `id` (INTEGER, PK, AUTO-INCREMENT)
- `user_id` (INTEGER, FK, NOT NULL)
- `post_id` (INTEGER, FK, NOT NULL)
- `created_at` (TIMESTAMP, DEFAULT NOW)
- **Index:** `UNIQUE(user_id, post_id)`

## Reels

- `id` (INTEGER, PK, AUTO-INCREMENT)
- `user_id` (INTEGER, FK, NOT NULL)
- `title` (VARCHAR, NOT NULL)
- `video_url` (VARCHAR)
- `thumbnail_url` (VARCHAR)
- `views_count` (INTEGER, DEFAULT 0)
- `likes_count` (INTEGER, DEFAULT 0)
- `comments_count` (INTEGER, DEFAULT 0)
- `created_at` (TIMESTAMP, DEFAULT NOW)

## Comments

- `id` (INTEGER, PK, AUTO-INCREMENT)
- `user_id` (INTEGER, FK, NOT NULL)
- `post_id` (INTEGER, FK) - Nullable
- `reel_id` (INTEGER, FK) - Nullable
- `content` (TEXT, NOT NULL)
- `created_at` (TIMESTAMP, DEFAULT NOW)

## Tours

- `id` (INTEGER, PK, AUTO-INCREMENT)
- `user_id` (INTEGER, FK, NOT NULL)
- `total_distance` (FLOAT) - Đơn vị: km
- `estimated_cost` (INTEGER) - Đơn vị: VND
- `estimated_duration` (INTEGER) - Đơn vị: minutes
- `status` (VARCHAR, DEFAULT 'building') - building / ready / in_progress / completed
- `created_at` (TIMESTAMP, DEFAULT NOW)

## Tour Stops

- `id` (INTEGER, PK, AUTO-INCREMENT)
- `tour_id` (INTEGER, FK, NOT NULL)
- `location_id` (INTEGER, FK, NOT NULL)
- `stop_order` (INTEGER, NOT NULL)
- `added_at` (TIMESTAMP, DEFAULT NOW)

## Bookmarks

- `id` (INTEGER, PK, AUTO-INCREMENT)
- `user_id` (INTEGER, FK, NOT NULL)
- `location_id` (INTEGER, FK, NOT NULL)
- `xp_earned` (INTEGER, DEFAULT 0)
- `created_at` (TIMESTAMP, DEFAULT NOW)
- **Index:** `UNIQUE(user_id, location_id)`

## Notifications

- `id` (INTEGER, PK, AUTO-INCREMENT)
- `user_id` (INTEGER, FK, NOT NULL)
- `type` (VARCHAR, NOT NULL) - social / deal / system
- `title` (VARCHAR, NOT NULL)
- `body` (TEXT)
- `is_read` (BOOLEAN, DEFAULT FALSE)
- `reference_type` (VARCHAR) - post / reel / lobby / location
- `reference_id` (INTEGER)
- `created_at` (TIMESTAMP, DEFAULT NOW)

## Deals

- `id` (INTEGER, PK, AUTO-INCREMENT)
- `location_id` (INTEGER, FK)
- `title` (VARCHAR, NOT NULL)
- `description` (TEXT)
- `discount_percent` (INTEGER)
- `banner_image_url` (VARCHAR)
- `xp_reward` (INTEGER, DEFAULT 0)
- `is_sponsored` (BOOLEAN, DEFAULT FALSE)
- `expires_at` (TIMESTAMP)
- `created_at` (TIMESTAMP, DEFAULT NOW)
