# 🏆 TasteMap Challenges — Feature Design Specification

> Tài liệu thiết kế toàn bộ tính năng cho module **Challenges**, dựa trên phân tích frontend `challenges/page.tsx` và hệ thống backend hiện có.

---

## 1. Tổng Quan Tính Năng

Frontend hiện tại hiển thị **6 nhóm chức năng chính**:

| # | Feature Group | Mô tả |
|---|---------------|--------|
| 1 | **Challenge Cards** | Danh sách challenges với filter (All/Active/Completed/Upcoming) |
| 2 | **Progress Tracking** | Theo dõi tiến độ từng challenge (progress/target) |
| 3 | **XP & Leveling** | Hệ thống điểm kinh nghiệm + level up |
| 4 | **Leaderboard** | Bảng xếp hạng theo XP (monthly) |
| 5 | **Badge System** | Huy hiệu từ challenge + locked badges |
| 6 | **Streak System** | Day streak tracking (liên tục sử dụng app) |

---

## 2. Phân Tích Chi Tiết Từ Frontend

### 2.1 Challenge Entity (từ mock data)

```typescript
interface Challenge {
  id: string;
  title: string;           // "Cuisine Explorer", "Night Owl"
  description: string;     // "Try 5 different cuisine types this week"
  category: ChallengeCategory;  // "discovery" | "social" | "review" | "cuisine" | "streak"
  xpReward: number;        // 180 - 400 XP
  progress: number;        // Current progress count
  target: number;          // Target to complete (e.g., 5, 10, 20)
  deadline: string;        // "3 days left", "This week", "Completed!"
  difficulty: Difficulty;   // "easy" | "medium" | "hard"
  icon: ReactNode;         // Icon component
  accent: string;          // Color hex
  status: ChallengeStatus; // "active" | "completed" | "upcoming"
}
```

### 2.2 Leaderboard Entity

```typescript
interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  badge: string;          // Featured badge slug
  isCurrentUser?: boolean;
}
```

### 2.3 User Gamification Data (từ MOCK_USER)

```typescript
// Đã có trong UserProfile
{
  level: 69,
  title: "Teenage Syndrome",   // Level title
  xp: 750,
  nextLevelXp: 1000,
  badges: Badge[],
}
```

---

## 3. Database Schema Design

### 3.1 Bảng `challenges` — Challenge Template (Admin tạo)

```sql
CREATE TABLE challenges (
    id              SERIAL PRIMARY KEY,
    
    -- Basic info
    title           VARCHAR(100) NOT NULL,
    description     TEXT NOT NULL,
    category        VARCHAR(20) NOT NULL,        -- ENUM: discovery, social, review, cuisine, streak
    difficulty      VARCHAR(10) NOT NULL,         -- ENUM: easy, medium, hard
    
    -- Reward
    xp_reward       INTEGER NOT NULL DEFAULT 100,
    badge_id        INTEGER REFERENCES badges(id) ON DELETE SET NULL,  -- Optional badge reward
    
    -- Target
    target_count    INTEGER NOT NULL DEFAULT 1,   -- Số lượng cần hoàn thành
    action_type     VARCHAR(50) NOT NULL,         -- Loại hành động cần track (bên dưới)
    action_filter   JSONB DEFAULT '{}',           -- Filter bổ sung (xem phần 3.6)
    
    -- UI
    icon            VARCHAR(30) NOT NULL DEFAULT 'trophy',  -- Lucide icon name
    accent_color    VARCHAR(7) NOT NULL DEFAULT '#007AFF',   -- Hex color
    
    -- Scheduling
    duration_days   INTEGER,                      -- NULL = permanent, 7 = weekly, 30 = monthly
    start_date      TIMESTAMPTZ,                  -- NULL = starts immediately when joined
    end_date        TIMESTAMPTZ,                  -- NULL = no fixed end
    
    -- Status management
    is_active       BOOLEAN NOT NULL DEFAULT true,
    is_recurring    BOOLEAN NOT NULL DEFAULT false, -- Reset mỗi kỳ?
    sort_order      INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_challenges_category ON challenges(category);
CREATE INDEX idx_challenges_active ON challenges(is_active);
```

### 3.2 Bảng `user_challenges` — User's Challenge Progress

```sql
CREATE TABLE user_challenges (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id    INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    
    -- Progress
    progress        INTEGER NOT NULL DEFAULT 0,
    status          VARCHAR(12) NOT NULL DEFAULT 'active',  -- active, completed, expired, claimed
    
    -- Timing
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    claimed_at      TIMESTAMPTZ,                -- Khi user claim reward
    expires_at      TIMESTAMPTZ,                -- Deadline cho challenge này
    
    -- Metadata
    last_progress_at TIMESTAMPTZ,               -- Lần cuối cập nhật progress
    
    UNIQUE(user_id, challenge_id),
    
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_challenges_user ON user_challenges(user_id);
CREATE INDEX idx_user_challenges_status ON user_challenges(status);
CREATE INDEX idx_user_challenges_user_status ON user_challenges(user_id, status);
```

### 3.3 Bảng `user_streaks` — Day Streak Tracking

> [!WARNING]
> **Timezone Trap:** Khái niệm "ngày" phải dựa trên **local timezone của user**, không phải UTC của server. Xem chi tiết tại [Section 6.8](#68-timezone-aware-streak-logic).

```sql
CREATE TABLE user_streaks (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    current_streak  INTEGER NOT NULL DEFAULT 0,
    longest_streak  INTEGER NOT NULL DEFAULT 0,
    last_active_date DATE NOT NULL DEFAULT CURRENT_DATE,  -- Tính theo local TZ
    
    -- Detailed log
    streak_start_date DATE,                     -- Ngày bắt đầu streak hiện tại
    timezone_offset  INTEGER NOT NULL DEFAULT 7, -- UTC offset (VD: 7 = GMT+7 Vietnam)
    
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_user_streaks_user ON user_streaks(user_id);
```

### 3.4 Bảng `challenge_progress_log` — Audit Trail (**REQUIRED**, không optional)

> [!IMPORTANT]
> Bảng này là **bắt buộc**, không phải optional. Nó đóng vai trò **Anti-Abuse Deduplication** — ngăn user farm XP bằng cách tạo rồi xóa entity lặp lại. Xem [Section 6.7](#67-anti-abuse--deduplication).

```sql
CREATE TABLE challenge_progress_log (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id    INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    
    action_type     VARCHAR(50) NOT NULL,        -- Hành động đã thực hiện
    action_ref_id   INTEGER,                     -- ID của entity liên quan (post_id, reel_id, etc.)
    action_ref_type VARCHAR(30),                 -- "post", "reel", "location_visit", etc.
    delta           INTEGER NOT NULL DEFAULT 1,  -- Số progress tăng (thường = 1)
    
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_progress_log_user ON challenge_progress_log(user_id);
CREATE INDEX idx_progress_log_challenge ON challenge_progress_log(user_id, challenge_id);
-- Dedup index: ngăn cùng 1 entity được track 2 lần cho cùng 1 challenge
CREATE UNIQUE INDEX idx_progress_log_dedup 
    ON challenge_progress_log(user_id, challenge_id, action_ref_type, action_ref_id)
    WHERE action_ref_id IS NOT NULL;
```

### 3.5 Bảng `xp_transactions` — XP Audit Log

```sql
CREATE TABLE xp_transactions (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    amount          INTEGER NOT NULL,             -- +250, -50 (nếu có penalty)
    source_type     VARCHAR(30) NOT NULL,         -- "challenge", "streak_bonus", "post", "review", "daily_login"
    source_id       INTEGER,                      -- challenge_id, post_id, etc.
    description     VARCHAR(200),                 -- "Completed: Cuisine Explorer"
    
    balance_after   INTEGER NOT NULL,             -- XP tổng sau transaction
    level_after     INTEGER NOT NULL,             -- Level sau transaction
    
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_xp_transactions_user ON xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_created ON xp_transactions(user_id, created_at DESC);
```

### 3.6 Modify Bảng `users` — Thêm fields gamification

```sql
-- Đã có: xp, level
-- Cần thêm:
ALTER TABLE users ADD COLUMN IF NOT EXISTS next_level_xp INTEGER DEFAULT 1000;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_xp_earned INTEGER DEFAULT 0;  -- Lifetime XP (khác current xp)
```

---

## 4. Enum & Action Types

### 4.1 Challenge Categories

| Category | Mô tả | Ví dụ |
|----------|--------|-------|
| `discovery` | Khám phá địa điểm mới | "Visit 3 night market spots", "Check in 8 coffee shops" |
| `social` | Tương tác xã hội | "Join 2 group rooms", "Receive 20 likes" |
| `review` | Đánh giá & review | "Post 10 food photos with ratings" |
| `cuisine` | Thử đồ ăn/cuisine | "Try 5 different cuisine types", "Rate 5 spicy dishes" |
| `streak` | Duy trì streak liên tục | "Login 7 consecutive days" |

### 4.2 Action Types (cho auto-tracking)

| `action_type` | Trigger | Module liên quan |
|----------------|---------|------------------|
| `post_create` | User tạo post mới | `posts` |
| `post_with_rating` | Tạo post có rating | `posts` |
| `post_with_photo` | Tạo post có photo | `posts` |
| `reel_create` | User tạo reel mới | `reels` |
| `location_visit` | Check-in quán mới | `locations` (cần thêm check-in feature) |
| `location_visit_night` | Check-in sau 21:00 | `locations` + time filter |
| `location_visit_cuisine` | Visit theo cuisine filter | `locations` + `action_filter` |
| `group_join` | Join group room | `groups` |
| `group_complete` | Hoàn thành group adventure | `groups` |
| `receive_likes` | Nhận likes trên posts/reels | `interactions` |
| `review_create` | Viết review (post + rating) | `posts` |
| `review_spicy` | Review món cay | `posts` + tag filter |
| `daily_login` | Login hàng ngày | `auth/sessions` |
| `streak_days` | Duy trì streak N ngày | `user_streaks` |
| `cuisine_variety` | Thử N loại cuisine khác nhau | `locations` + distinct count |
| `friend_add` | Kết bạn | `social` |
| `bookmark_create` | Bookmark location | `bookmarks` |

### 4.3 `action_filter` JSONB Examples

```jsonc
// "Visit 3 night market spots after 9PM"
{ "time_after": "21:00", "location_type": "night_market" }

// "Try 5 different cuisine types"
{ "distinct_field": "cuisine_type", "distinct_count": true }

// "Rate 5 spicy dishes"
{ "tags": ["Spicy"], "require_rating": true }

// "Check in to 8 specialty coffee shops"
{ "location_category": "coffee", "location_tags": ["specialty"] }
```

---

## 5. API Endpoints Design

### 5.1 Challenges — CRUD (Admin + Public)

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|--------|
| `GET` | `/api/v1/challenges` | Optional | Danh sách challenges (có filter) |
| `GET` | `/api/v1/challenges/{id}` | Optional | Chi tiết 1 challenge |
| `POST` | `/api/v1/challenges` | Admin | Tạo challenge template mới |
| `PUT` | `/api/v1/challenges/{id}` | Admin | Cập nhật challenge |
| `DELETE` | `/api/v1/challenges/{id}` | Admin | Xóa challenge |

#### `GET /api/v1/challenges` — Query params:

```
?category=discovery|social|review|cuisine|streak
?difficulty=easy|medium|hard
?status=active|upcoming              # filter theo thời gian start_date/end_date
?is_active=true
?page=1&limit=20
```

#### Response format:

```json
{
  "items": [
    {
      "id": 1,
      "title": "Cuisine Explorer",
      "description": "Try 5 different cuisine types this week.",
      "category": "cuisine",
      "difficulty": "medium",
      "xp_reward": 250,
      "target_count": 5,
      "action_type": "cuisine_variety",
      "icon": "utensils",
      "accent_color": "#FF6B35",
      "duration_days": 7,
      "start_date": null,
      "end_date": null,
      "badge_reward": null,
      "is_recurring": true
    }
  ],
  "total": 8,
  "page": 1,
  "limit": 20
}
```

---

### 5.2 User Challenges — Progress & Enrollment

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|--------|
| `GET` | `/api/v1/challenges/me` | Required | Challenges của user hiện tại (progress) |
| `POST` | `/api/v1/challenges/{id}/join` | Required | Tham gia challenge |
| `POST` | `/api/v1/challenges/{id}/claim` | Required | Claim reward khi hoàn thành |
| `GET` | `/api/v1/challenges/me/history` | Required | Lịch sử challenges đã hoàn thành |

#### `GET /api/v1/challenges/me` — Query params:

```
?status=active|completed|upcoming|expired|claimed
```

#### Response format (merged challenge + progress):

```json
{
  "items": [
    {
      "id": 1,
      "challenge": {
        "id": 1,
        "title": "Cuisine Explorer",
        "description": "Try 5 different cuisine types this week.",
        "category": "cuisine",
        "difficulty": "medium",
        "xp_reward": 250,
        "target_count": 5,
        "icon": "utensils",
        "accent_color": "#FF6B35",
        "badge_reward": { "id": 5, "icon": "🍜", "label": "Cuisine Master" }
      },
      "progress": 3,
      "target": 5,
      "status": "active",
      "started_at": "2026-04-14T00:00:00Z",
      "expires_at": "2026-04-21T00:00:00Z",
      "deadline_display": "3 days left",
      "completed_at": null,
      "claimed_at": null,
      "percentage": 60
    }
  ],
  "summary": {
    "active_count": 3,
    "completed_count": 2,
    "total_xp_earned_from_challenges": 600
  }
}
```

#### `POST /api/v1/challenges/{id}/claim` — Response:

```json
{
  "success": true,
  "rewards": {
    "xp_earned": 250,
    "new_total_xp": 1000,
    "level_up": true,
    "new_level": 70,
    "badge_earned": {
      "id": 5,
      "icon": "🍜",
      "label": "Cuisine Master",
      "color": "#FF6B35"
    }
  }
}
```

---

### 5.3 Leaderboard (Redis ZSET-backed)

> [!CAUTION]
> **KHÔNG dùng SQL aggregation cho leaderboard.** Xem [Section 6.6](#66-redis-zset-leaderboard) cho kiến trúc Redis ZSET bắt buộc.

| Method | Endpoint | Auth | Mô tả | Data Source |
|--------|----------|------|--------|-------------|
| `GET` | `/api/v1/leaderboard` | Optional | Bảng xếp hạng | **Redis ZSET** |
| `GET` | `/api/v1/leaderboard/me` | Required | Vị trí của user hiện tại | **Redis ZSET** |

#### `GET /api/v1/leaderboard` — Query params:

```
?period=weekly|monthly|all_time       # Default: monthly
?limit=10                             # Top N
```

#### Response format:

```json
{
  "period": "monthly",
  "entries": [
    {
      "rank": 1,
      "user_id": 42,
      "username": "Ramona",
      "display_name": "Ramona",
      "avatar_url": "https://...",
      "xp": 14820,
      "level": 82,
      "title": "Grand Master",
      "featured_badge": {
        "icon": "👑",
        "label": "Top Reviewer",
        "color": "#FBBF24"
      },
      "is_current_user": false
    }
  ],
  "my_position": {
    "rank": 3,
    "xp": 10240,
    "level": 69
  },
  "total_participants": 1240
}
```

---

### 5.4 Streak

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|--------|
| `GET` | `/api/v1/streaks/me` | Required | Streak hiện tại |
| `POST` | `/api/v1/streaks/checkin` | Required | Check-in hàng ngày (gọi auto hoặc manual) |

#### `GET /api/v1/streaks/me` — Response:

```json
{
  "current_streak": 7,
  "longest_streak": 23,
  "last_active_date": "2026-04-16",
  "streak_start_date": "2026-04-10",
  "is_active_today": true,
  "streak_bonus_xp": 10
}
```

---

### 5.5 XP & Level

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|--------|
| `GET` | `/api/v1/xp/me` | Required | XP & level hiện tại |
| `GET` | `/api/v1/xp/me/history` | Required | Lịch sử XP transactions |

#### `GET /api/v1/xp/me` — Response:

```json
{
  "xp": 750,
  "level": 69,
  "next_level_xp": 1000,
  "xp_to_next_level": 250,
  "title": "Teenage Syndrome",
  "total_xp_earned": 45680,
  "rank": 3
}
```

#### `GET /api/v1/xp/me/history` — Query params:

```
?source_type=challenge|streak_bonus|post|review|daily_login
?page=1&limit=20
```

---

## 6. Business Logic & Rules

### 6.1 XP Leveling Formula

```python
def xp_for_level(level: int) -> int:
    """XP cần để lên level tiếp theo."""
    # Progressive scaling: mỗi level cần thêm XP
    base = 100
    growth = 1.15
    return int(base * (growth ** (level - 1)))

# VD: Level 1 → 100 XP, Level 10 → 404 XP, Level 50 → 10,836 XP
```

### 6.2 Level Titles

| Level Range | Title |
|-------------|-------|
| 1 - 5 | Newbie Taster |
| 6 - 15 | Street Foodie |
| 16 - 30 | Taste Explorer |
| 31 - 50 | Flavor Hunter |
| 51 - 70 | Gastro Elite |
| 71 - 90 | Culinary Legend |
| 91 - 100 | Grand Master |

### 6.3 Streak Bonus XP

| Streak Days | Daily Bonus XP |
|-------------|----------------|
| 1 - 3 | +5 XP |
| 4 - 7 | +10 XP |
| 8 - 14 | +15 XP |
| 15 - 30 | +25 XP |
| 31+ | +50 XP |

### 6.4 Challenge Auto-Progress Flow (Revised)

> [!IMPORTANT]
> Flow đã tích hợp 3 safeguard: **Dedup check**, **Atomic UPDATE**, và **Python-side filter matching**.

```
User tạo Post → Backend post service → Hook gọi challenge_tracker
                                        │
                                        ├─ 1. Query ALL active user_challenges (status='active')
                                        │     → Kết quả nhỏ (3-10 records) → load vào RAM
                                        │
                                        ├─ 2. [Python RAM] Filter: action_type match?
                                        │     → KHÔNG dùng SQL JSONB query
                                        │
                                        ├─ 3. [Python RAM] Pattern-match action_filter
                                        │     So metadata của action vs action_filter JSON dict
                                        │
                                        ├─ 4. [DEDUP] Check challenge_progress_log:
                                        │     Đã có (user_id, challenge_id, ref_type, ref_id)?
                                        │     → Có rồi thì SKIP (chống create-delete-create abuse)
                                        │
                                        ├─ 5. [ATOMIC] UPDATE user_challenges
                                        │     SET progress = progress + 1   ← SQL atomic, no race
                                        │     WHERE id = uc_id AND status = 'active'
                                        │
                                        ├─ 6. Ghi challenge_progress_log (audit + dedup source)
                                        │
                                        ├─ 7. Re-read progress. Nếu progress >= target:
                                        │     ├─ Set status = "completed"
                                        │     └─ Gửi notification cho user
                                        │
                                        └─ 8. [RATE LIMIT] Check daily cap (max 3 post/ngày)
```

> [!IMPORTANT]
> **Auto-tracking** là tính năng then chốt. Khi user thực hiện hành động ở module khác (tạo post, check-in location, join group...), backend service tương ứng phải gọi `challenge_tracker.track_action(user_id, action_type, metadata)` để tự động cập nhật progress.

### 6.5 Challenge Lifecycle

```
                    ┌─────────┐
                    │ Created │  (Admin tạo template)
                    └────┬────┘
                         │ User joins / auto-enrolled
                    ┌────▼────┐
               ┌────│  Active │────┐
               │    └────┬────┘    │
               │         │         │
          expires_at  progress   user leaves
          reached     >= target
               │         │         │
          ┌────▼────┐ ┌──▼──────┐ │
          │ Expired │ │Completed│ │
          └─────────┘ └────┬────┘ │
                           │      │
                      User claims  │
                           │      │
                      ┌────▼────┐ │
                      │ Claimed │ │
                      └─────────┘ │
                                  │
                           ┌──────▼──┐
                           │ Dropped │  (Optional)
                           └─────────┘
```

---

## 6.6 Redis ZSET Leaderboard

> [!CAUTION]
> **KHÔNG BAO GIỜ** dùng `SELECT SUM(amount) FROM xp_transactions GROUP BY user_id` cho leaderboard real-time. Full table scan sẽ giết DB.

### Kiến trúc Write-Through

```
┌─────────────────────────────────────────────────────────────────┐
│  XP Award Flow (mỗi khi cấp XP)                                │
│                                                                 │
│  xp_service.award_xp(user_id, amount, source)                   │
│       │                                                         │
│       ├─ 1. SQL: UPDATE users SET xp = xp + amount             │
│       ├─ 2. SQL: INSERT INTO xp_transactions (...)              │
│       ├─ 3. Redis: ZINCRBY leaderboard:monthly:2026-04          │
│       │           <amount> <user_id>                            │
│       ├─ 4. Redis: ZINCRBY leaderboard:weekly:2026-W16          │
│       │           <amount> <user_id>                            │
│       └─ 5. Redis: ZINCRBY leaderboard:alltime                  │
│                   <amount> <user_id>                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Leaderboard Read Flow (O(log N) — cực nhanh)                   │
│                                                                 │
│  GET /api/v1/leaderboard?period=monthly                         │
│       │                                                         │
│       ├─ ZREVRANGE leaderboard:monthly:2026-04 0 9 WITHSCORES  │
│       │   → Top 10 user_ids + XP scores                        │
│       │                                                         │
│       ├─ SQL: SELECT id, username, avatar_url, level, title     │
│       │       FROM users WHERE id IN (...)                      │
│       │   → Hydrate user info (1 query, IN clause)             │
│       │                                                         │
│       └─ Return merged result                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Redis Key Convention

| Key Pattern | TTL | Mô tả |
|-------------|-----|--------|
| `leaderboard:monthly:YYYY-MM` | 45 ngày | Rank XP trong tháng |
| `leaderboard:weekly:YYYY-WNN` | 14 ngày | Rank XP trong tuần |
| `leaderboard:alltime` | Không TTL | All-time ranking (dùng `users.total_xp_earned`) |

### Fallback: Nếu Redis mất data

Chạy cron job hoặc startup script rebuild ZSET từ `xp_transactions`:

```python
async def rebuild_monthly_leaderboard(db: AsyncSession, redis: Redis, month: str):
    """Rebuild ZSET from xp_transactions. Run on startup or cron."""
    start = datetime.strptime(month, "%Y-%m")
    end = start + relativedelta(months=1)
    
    query = select(
        XpTransaction.user_id,
        func.sum(XpTransaction.amount).label("total")
    ).where(
        XpTransaction.created_at.between(start, end)
    ).group_by(XpTransaction.user_id)
    
    result = await db.execute(query)
    
    key = f"leaderboard:monthly:{month}"
    await redis.delete(key)
    for user_id, total in result.all():
        await redis.zadd(key, {str(user_id): total})
    await redis.expire(key, 45 * 86400)  # 45 days TTL
```

### Lấy rank của current user

```python
# O(log N) — không cần scan
rank = await redis.zrevrank(f"leaderboard:monthly:{current_month}", str(user_id))
xp = await redis.zscore(f"leaderboard:monthly:{current_month}", str(user_id))
# rank is 0-indexed, +1 for display
```

---

## 6.7 Anti-Abuse & Deduplication

> [!WARNING]
> **Exploit vector:** User tạo Post (→ +1 progress) → Xóa Post → Tạo lại Post → (+1 progress nữa). Lặp lại vô hạn.

### Chiến lược 2 lớp

**Lớp 1: Entity Deduplication (bảng `challenge_progress_log`)**

Trước khi increment progress, tracker PHẢI kiểm tra:

```python
# tracker.py — core dedup logic
async def _is_already_tracked(
    db: AsyncSession,
    user_id: int,
    challenge_id: int,
    ref_type: str,
    ref_id: int
) -> bool:
    """Check if this specific entity was already counted."""
    query = select(ChallengeProgressLog.id).where(
        ChallengeProgressLog.user_id == user_id,
        ChallengeProgressLog.challenge_id == challenge_id,
        ChallengeProgressLog.action_ref_type == ref_type,
        ChallengeProgressLog.action_ref_id == ref_id,
    ).limit(1)
    result = await db.execute(query)
    return result.scalar_one_or_none() is not None
```

Kết hợp UNIQUE INDEX `idx_progress_log_dedup` ở tầng DB để fail-safe:
```sql
CREATE UNIQUE INDEX idx_progress_log_dedup 
    ON challenge_progress_log(user_id, challenge_id, action_ref_type, action_ref_id)
    WHERE action_ref_id IS NOT NULL;
```

**Lớp 2: Daily Rate Limit**

```python
# Giới hạn theo action_type mỗi ngày
DAILY_CAPS = {
    "post_create": 5,        # Max 5 posts/ngày được tính progress
    "post_with_photo": 5,
    "reel_create": 3,
    "receive_likes": 50,     # Cao hơn vì passive
    "review_create": 5,
}

async def _check_daily_cap(
    db: AsyncSession,
    user_id: int,
    action_type: str,
    today: date
) -> bool:
    """Return True if user has NOT exceeded daily cap."""
    cap = DAILY_CAPS.get(action_type)
    if cap is None:
        return True  # No cap for this action
    
    count = await db.scalar(
        select(func.count(ChallengeProgressLog.id)).where(
            ChallengeProgressLog.user_id == user_id,
            ChallengeProgressLog.action_type == action_type,
            func.date(ChallengeProgressLog.created_at) == today,
        )
    )
    return count < cap
```

### Luật chơi 1 chiều

> **Gamification Rule:** XP và progress đã cấp thì **KHÔNG thu hồi** khi user xóa entity gốc. Lý do:
> - Tránh phức tạp hóa logic rollback
> - Tránh user frustration ("Tôi vừa level up rồi lại bị hạ level")
> - Dedup + Rate Limit đã đủ ngăn abuse

---

## 6.8 Timezone-Aware Streak Logic

> [!WARNING]
> **Timezone Trap:** `CURRENT_DATE` trên server UTC. User Việt Nam (GMT+7) check-in lúc 6:00 sáng VN = 23:00 UTC ngày hôm trước → bị đứt streak sai.

### Giải pháp: Configurable Cutoff Offset

```python
from datetime import datetime, timedelta, timezone, date

SYSTEM_DEFAULT_OFFSET = 7  # GMT+7 (Vietnam)

def get_user_local_date(utc_now: datetime, offset_hours: int) -> date:
    """Convert UTC timestamp to user's local date."""
    user_tz = timezone(timedelta(hours=offset_hours))
    return utc_now.astimezone(user_tz).date()


async def streak_checkin(db: AsyncSession, user_id: int) -> dict:
    """Daily streak check-in with timezone awareness."""
    streak = await db.get(UserStreak, user_id)  # or query by user_id
    
    utc_now = datetime.now(timezone.utc)
    offset = streak.timezone_offset if streak else SYSTEM_DEFAULT_OFFSET
    today_local = get_user_local_date(utc_now, offset)
    
    if streak is None:
        # First ever check-in
        streak = UserStreak(
            user_id=user_id,
            current_streak=1,
            longest_streak=1,
            last_active_date=today_local,
            streak_start_date=today_local,
            timezone_offset=SYSTEM_DEFAULT_OFFSET,
        )
        db.add(streak)
        await db.commit()
        return {"current_streak": 1, "is_new": True}
    
    if streak.last_active_date == today_local:
        # Already checked in today
        return {"current_streak": streak.current_streak, "already_checked": True}
    
    yesterday_local = today_local - timedelta(days=1)
    
    if streak.last_active_date == yesterday_local:
        # Continuing streak!
        streak.current_streak += 1
        streak.longest_streak = max(streak.longest_streak, streak.current_streak)
    else:
        # Streak broken — reset
        streak.current_streak = 1
        streak.streak_start_date = today_local
    
    streak.last_active_date = today_local
    await db.commit()
    
    return {
        "current_streak": streak.current_streak,
        "longest_streak": streak.longest_streak,
        "streak_broken": streak.last_active_date != yesterday_local,
    }
```

### Nếu App Global (nhiều timezone)

Thêm API cho user set timezone:

```
PUT /api/v1/settings/timezone
{ "timezone_offset": 7 }  // hoặc "Asia/Ho_Chi_Minh"
```

Lưu vào `user_streaks.timezone_offset` hoặc `users.settings` JSONB.

---

## 6.9 Atomic Progress Update (Race Condition Prevention)

> [!CAUTION]
> **Race Condition:** 3 parallel requests cùng đọc `progress = 0`, cùng ghi `progress = 1`. Kết quả: progress = 1 thay vì 3.

### Giải pháp: SQL Atomic Update

```python
from sqlalchemy import update

# ❌ SAI — Read-Modify-Write (race condition)
uc = await db.get(UserChallenge, uc_id)
uc.progress += 1
await db.commit()

# ✅ ĐÚNG — Atomic UPDATE (DB tự serialize)
stmt = (
    update(UserChallenge)
    .where(
        UserChallenge.id == uc_id,
        UserChallenge.status == "active"  # Guard: chỉ update nếu còn active
    )
    .values(
        progress=UserChallenge.progress + delta,
        last_progress_at=func.now(),
        updated_at=func.now(),
    )
    .returning(UserChallenge.progress, UserChallenge.id)  # Đọc lại giá trị mới
)
result = await db.execute(stmt)
await db.commit()

new_progress = result.scalar_one_or_none()  # progress sau khi cộng
```

Đồng thời, XP update trong `users` cũng phải atomic:

```python
# ✅ Atomic XP increment
stmt = (
    update(User)
    .where(User.id == user_id)
    .values(
        xp=User.xp + amount,
        total_xp_earned=User.total_xp_earned + amount,
    )
    .returning(User.xp, User.level)
)
```

---

## 6.10 Python-Side Action Filter Matching

> [!TIP]
> **Đừng bắt PostgreSQL query JSONB phức tạp.** Load active challenges vào RAM rồi match bằng Python.

### Rationale

- Mỗi user chỉ có **3-10 active challenges** (nhỏ)
- Query: `SELECT * FROM user_challenges WHERE user_id = X AND status = 'active'` → fetch all, rất nhẹ
- So sánh `action_filter` dict bằng Python pattern matching → linh hoạt, dễ test, dễ mở rộng
- Tránh GIN index overhead + phức tạp của `@>`, `?&` operators

### Implementation Pattern

```python
def matches_filter(action_filter: dict, action_metadata: dict) -> bool:
    """
    Check if action metadata satisfies the challenge's filter.
    action_filter: from challenges.action_filter (JSONB)
    action_metadata: from the triggering action
    """
    if not action_filter:
        return True  # No filter = always match
    
    # Tag matching: action must have ALL required tags
    if "tags" in action_filter:
        required_tags = set(action_filter["tags"])
        actual_tags = set(action_metadata.get("tags", []))
        if not required_tags.issubset(actual_tags):
            return False
    
    # Time window: action must be after specified time
    if "time_after" in action_filter:
        action_hour = action_metadata.get("hour", 0)  # 0-23
        cutoff = int(action_filter["time_after"].split(":")[0])
        if action_hour < cutoff:
            return False
    
    # Location category
    if "location_category" in action_filter:
        if action_metadata.get("location_category") != action_filter["location_category"]:
            return False
    
    # Rating requirement
    if action_filter.get("require_rating"):
        if not action_metadata.get("rating"):
            return False
    
    return True
```

---

## 7. Integration Points (Modules cần sửa)

### 7.1 Posts Service — `backend/src/posts/service.py`

```python
# Sau khi tạo post thành công:
await challenge_tracker.track_action(
    db=db,
    user_id=user_id,
    action_type="post_create",
    ref_type="post",
    ref_id=post.id,             # ← Dedup key
    metadata={"has_photo": bool(post.image_url), "has_rating": bool(post.rating), "tags": post.tags}
)

# Nếu post có rating:
if post.rating:
    await challenge_tracker.track_action(
        db=db,
        user_id=user_id,
        action_type="post_with_rating",
        ref_type="post",
        ref_id=post.id,         # ← Cùng ref_id, khác action_type → dedup riêng
        metadata={"rating": post.rating, "tags": post.tags}
    )
```

### 7.2 Reels Service — `backend/src/reels/service.py`

```python
await challenge_tracker.track_action(
    db=db,
    user_id=user_id,
    action_type="reel_create",
    ref_type="reel",
    ref_id=reel.id,
    metadata={}
)
```

### 7.3 Interactions Service (Likes)

```python
# Khi post/reel nhận like → track cho AUTHOR (không phải người like)
await challenge_tracker.track_action(
    db=db,
    user_id=post.user_id,  # Author nhận like
    action_type="receive_likes",
    ref_type="like",
    ref_id=like.id,        # ← Like entity id, tránh unlike/re-like abuse
    metadata={}
)
```

### 7.4 Groups Service

```python
# Join group
await challenge_tracker.track_action(
    db=db,
    user_id=user_id,
    action_type="group_join",
    ref_type="group_membership",
    ref_id=group.id,
    metadata={}
)
```

### 7.5 Auth/Sessions — Daily Login

```python
# Khi user login hoặc refresh token:
await streak_service.checkin(db, user_id)
await challenge_tracker.track_action(
    db=db,
    user_id=user_id,
    action_type="daily_login",
    ref_type="session",
    ref_id=None,         # Không có entity → skip dedup, dùng daily cap thay
    metadata={}
)
```

### 7.6 XP Service — Dual Write (DB + Redis)

```python
# xp_service.py — MỌI lần cấp XP đều phải ghi cả DB lẫn Redis
async def award_xp(
    db: AsyncSession,
    redis: Redis,
    user_id: int,
    amount: int,
    source_type: str,
    source_id: int | None = None,
    description: str = "",
):
    # 1. Atomic DB update
    stmt = (
        update(User).where(User.id == user_id)
        .values(xp=User.xp + amount, total_xp_earned=User.total_xp_earned + amount)
        .returning(User.xp, User.level)
    )
    result = await db.execute(stmt)
    new_xp, current_level = result.one()
    
    # 2. Check level up
    new_level = calculate_level(new_xp)  # from leveling formula
    if new_level != current_level:
        await db.execute(update(User).where(User.id == user_id).values(level=new_level))
    
    # 3. XP transaction log
    tx = XpTransaction(
        user_id=user_id, amount=amount, source_type=source_type,
        source_id=source_id, description=description,
        balance_after=new_xp, level_after=new_level,
    )
    db.add(tx)
    await db.commit()
    
    # 4. Redis ZSET — Dual write
    now = datetime.now(timezone.utc)
    month_key = f"leaderboard:monthly:{now.strftime('%Y-%m')}"
    week_key = f"leaderboard:weekly:{now.strftime('%Y-W%W')}"
    
    await redis.zincrby(month_key, amount, str(user_id))
    await redis.zincrby(week_key, amount, str(user_id))
    await redis.zincrby("leaderboard:alltime", amount, str(user_id))
    
    # Set TTL if key is new
    if await redis.ttl(month_key) == -1:
        await redis.expire(month_key, 45 * 86400)
    if await redis.ttl(week_key) == -1:
        await redis.expire(week_key, 14 * 86400)
    
    return {"new_xp": new_xp, "new_level": new_level, "level_up": new_level != current_level}
```

---

## 8. Tổng Kết — Backend Files Cần Tạo/Sửa

### 8.1 Files Mới (tạo trong `backend/src/challenges/`)

| File | Mô tả | Critical Constraints |
|------|--------|---------------------|
| `__init__.py` | Package init | — |
| `models.py` | SQLAlchemy models: `Challenge`, `UserChallenge`, `UserStreak`, `ChallengeProgressLog`, `XpTransaction` | Dedup UNIQUE INDEX trên progress_log |
| `schemas.py` | Pydantic v2 schemas cho request/response | — |
| `router.py` | FastAPI endpoints (5.1 → 5.5) | — |
| `service.py` | Business logic (CRUD, join, progress, claim) | **Atomic UPDATE** cho progress |
| `tracker.py` | `ChallengeTracker` class — auto-tracking engine | **Dedup check** + **Python-side filter** + **Daily cap** |
| `xp_service.py` | XP awarding, level calculation, level-up logic | **Dual Write: DB + Redis ZSET** |
| `streak_service.py` | Streak check-in, bonus calculation | **Timezone-aware** (UTC offset) |
| `leaderboard_service.py` | Leaderboard queries (monthly, weekly, all-time) | **Redis ZSET only**, SQL chỉ hydrate user info |

### 8.2 Files Cần Modify

| File | Thay đổi |
|------|----------|
| `backend/src/users/models.py` | Thêm `next_level_xp`, `total_xp_earned`, relationships |
| `backend/src/posts/service.py` | Hook `track_action()` với `ref_type="post"`, `ref_id=post.id` |
| `backend/src/reels/service.py` | Hook `track_action()` với `ref_type="reel"`, `ref_id=reel.id` |
| `backend/src/interactions/service.py` | Hook cho `receive_likes` với `ref_type="like"`, `ref_id=like.id` |
| `backend/src/groups/service.py` | Hook cho `group_join` với `ref_type="group_membership"` |
| `backend/src/api/v1/router.py` | Register challenges router |
| `backend/src/main.py` | Include challenges router |
| `backend/src/core/config.py` | Thêm `REDIS_URL` setting (nếu chưa có) |

### 8.3 Migration

```bash
alembic revision --autogenerate -m "add_challenges_system"
```

Tạo tables: `challenges`, `user_challenges`, `user_streaks`, `challenge_progress_log`, `xp_transactions`
Modify: `users` (thêm 2 columns)

### 8.4 Redis Keys cần quản lý

| Key Pattern | Operation | Khi nào |
|-------------|-----------|--------|
| `leaderboard:monthly:YYYY-MM` | `ZINCRBY` | Mỗi lần cấp XP |
| `leaderboard:weekly:YYYY-WNN` | `ZINCRBY` | Mỗi lần cấp XP |
| `leaderboard:alltime` | `ZINCRBY` | Mỗi lần cấp XP |
| Rebuild cron | `rebuild_monthly_leaderboard()` | Startup + daily cron |

---

## 9. Seed Data (Ban đầu)

Dựa trên 8 challenges trong mock data frontend:

| Title | Category | Difficulty | XP | Target | Action Type |
|-------|----------|------------|-----|--------|-------------|
| Cuisine Explorer | cuisine | medium | 250 | 5 | `cuisine_variety` |
| Night Owl | discovery | easy | 180 | 3 | `location_visit_night` |
| Social Foodie | social | medium | 320 | 2 | `group_complete` |
| Photo Master | review | hard | 400 | 10 | `post_with_photo` |
| Spice Seeker | cuisine | easy | 200 | 5 | `review_spicy` |
| Coffee Connoisseur | discovery | hard | 300 | 8 | `location_visit_cuisine` |
| Street Food Sprint | discovery | medium | 350 | 12 | `location_visit` |
| Fan Favorite | social | medium | 280 | 20 | `receive_likes` |

---

## 10. Future Enhancements (Phase 2)

> [!TIP]
> Những tính năng mở rộng có thể implement sau:

1. **Challenge Collections** — Nhóm nhiều challenges thành 1 "Season" hoặc "Event"
2. **Friend Challenges** — Challenge giữa bạn bè (ai hoàn thành trước)
3. **Custom Challenges** — User tự tạo challenge cho bản thân
4. **Seasonal Events** — Limited-time challenges theo mùa/lễ
5. **Combo Rewards** — Bonus XP khi hoàn thành nhiều challenges cùng category
6. **Challenge Recommendations** — Gợi ý challenge dựa trên user vector
