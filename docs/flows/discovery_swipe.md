[← Back to Flows Index](README.md)

# Discovery Swipe Flow (Tour Builder Engine)

> **SSOT Reference:** This document governs all business logic for the Swipe-to-Discover feature in `/tour-builder`. Any change to swipe mechanics, vector learning, or tour finalization **MUST** update this document first and receive approval before code is written.
>
> - **API Reference:** `docs/api/discovery.md` (Sections 4, 5, 6, 8)
> - **DB Reference:** `docs/database_schema/schema_interactions.md`

---

## 1. Overview

The Tour Builder is a **Swipe-to-Discover Engine**, not a form. Instead of filling out preferences, users swipe through a curated card deck of food locations. The system silently learns their preference vector in real time. After sufficient signal (~10–15 swipes), the user pins locations to a **Tour Draft** and the system finalizes an optimized route.

### User Mental Model

```
  Swipe LEFT          Card Deck         Swipe RIGHT
  (Skip / -α·P) ←── [Location Card] ──→ (Like / +α·P)
                           │
                      ★ Tap Star
                  (Super Like / +α·P AND add to Tour Draft)
```

---

## 2. Phase 1 — Card Discovery

### 2.1 Initial Card Fetch

On page mount, the frontend fetches the first batch of swipe cards from the **Feed Engine**, **NOT** the raw Locations table.

| Step | Action | API |
|------|--------|-----|
| 1 | Page mounts, `deckQueue` is empty | — |
| 2 | Fetch first card batch | `GET /api/v1/feed/cards?category=food&limit=15` |
| 3 | Populate `deckQueue` in Zustand store | — |
| 4 | Store `next_cursor` from response for pagination | — |

**Response shape consumed:**
```json
{
  "cards": [ { "id": 42, "name": "Bún Bò Huế", "image_url": "...", "tags": [...], "price_range": "35k", "lat": 10.89, "lng": 106.79 } ],
  "next_cursor": "42",
  "has_more": true
}
```

### 2.2 Infinite Card Loading (Cursor Pagination)

To prevent the deck from running empty, the frontend monitors deck size and pre-fetches more cards automatically.

**Trigger condition:** `deckQueue.length < 3 AND has_more === true`

**Action:** `GET /api/v1/feed/cards?category=food&limit=15&cursor={next_cursor}`

The new batch is **appended** to the tail of `deckQueue`. The user never sees a loading gap.

---

## 3. Phase 2 — Swipe Actions & Vector Learning

### 3.1 Action Taxonomy

There are **3 distinct user actions**, each with a specific effect on the Preference Vector and Tour Draft:

| Action | Gesture | Vector Learning | Tour Draft |
|--------|---------|----------------|------------|
| **Skip** | Swipe LEFT | **`U_new = U_old − α·P`** | ✗ Not added |
| **Like** | Swipe RIGHT | **`U_new = U_old + α·P`** | ✗ Not added |
| **Super Like / Add to Tour** | Tap ★ on card | **`U_new = U_old + α·P`** (same as Like) | ✅ Added to `tourDraft[]` |

> [!IMPORTANT]
> **Super Like IS a Like.** Explicitly adding a location to the Tour Draft is the **strongest preference signal**. It MUST trigger vector learning (`+α·P`) in addition to saving the location. There is no "neutral pin" — the system always learns.

### 3.2 Preference Vector Formula

```
U_new = U_old + α · P
```

| Variable | Description |
|----------|-------------|
| `U_old` | Current 15-dim user food preference vector (loaded from Redis, fallback to PostgreSQL) |
| `P` | 15-dim characteristic vector of the swiped location (from `Location.vector` in DB) |
| `α` (alpha) | Learning rate. Normal: `0.1`. Penalized: `0.01` |

**Anti-Spam Penalty Rule (implemented in `interactions/service.py`):**
- If time between two consecutive swipes is **< 0.5 seconds** → `α` drops to `0.01` for that swipe
- This prevents "rage-swiping" from corrupting the preference vector

### 3.3 Batched API Submission (Performance Pattern)

Swipes are **NOT** sent to the backend one-by-one. They are queued locally and flushed in batches to minimize network overhead.

**Batching rules:**
- Queue swipe action locally to `swipeBatchRef[]` with `client_timestamp` (milliseconds)
- **Flush triggers:** (whichever comes first)
  - Queue reaches **5 actions**
  - **3 seconds** have elapsed since last flush
  - User taps "Finalize Tour" button

**API call on flush:**
```
POST /api/v1/interactions/swipe-batch
```
```json
{
  "user_id": 1,
  "domain": "food",
  "actions": [
    { "place_id": 42, "direction": "RIGHT", "client_timestamp": 1711612800000 },
    { "place_id": 43, "direction": "LEFT",  "client_timestamp": 1711612801500 },
    { "place_id": 44, "direction": "RIGHT", "client_timestamp": 1711612802000 }
  ]
}
```

> [!NOTE]
> `client_timestamp` is sent in **milliseconds** (JS `Date.now()`). The backend `_normalize_timestamp()` function handles the ms→s conversion automatically.

**Backend processing sequence (existing, no changes needed):**
1. Load user vector from Redis (fallback: PostgreSQL)
2. Fetch location vectors for all `place_id`s from DB — single batch query
3. Run `_calculate_math_sync()` in thread pool (non-blocking)
4. Save updated vector to **Redis** (hot cache) + **PostgreSQL** (durable)

---

## 4. Phase 3 — Tour Finalization

Triggered when user taps **"Build My Tour"** button. The finalization process is a sequential collection of **concurrent** API calls.

### 4.1 Finalization Sequence

```
Step 1: Flush remaining swipe batch
   └─ POST /api/v1/interactions/swipe-batch (remaining queued actions)

Step 2: Create Tour entity
   └─ POST /api/v1/tours/
   └─ Response: { "id": 7, "status": "building" }

Step 3: Add all stops CONCURRENTLY (Promise.all anti-pattern fix)
   └─ Promise.all([
        POST /api/v1/tours/7/stops { "location_id": 42 },
        POST /api/v1/tours/7/stops { "location_id": 51 },
        POST /api/v1/tours/7/stops { "location_id": 68 },
      ])

Step 4: Optimize Route (Dijkstra/A*)
   └─ POST /api/v1/tours/7/optimize { "start_lat": 10.89, "start_lng": 106.79 }
   └─ Response: optimized_stops[] with travel_min between each stop

Step 5: Render Tour Map View
   └─ GET /api/v1/tours/7  (full tour + ordered stops)
   └─ setIsTourReady(true) → Render split-screen: Map (left) + Tour Itinerary (right)
```

> [!IMPORTANT]
> **Step 3 MUST use `Promise.all()`** — never a sequential `for...of` loop. Adding N stops sequentially creates waterfall latency (N × network round-trip). `Promise.all()` resolves all stop insertions concurrently.

### 4.2 Optimization Algorithm Reference

The backend `POST /api/v1/tours/{id}/optimize` applies a **modified Dijkstra/A*** algorithm:

```
Edge Cost = Traffic_Time + Weather_Penalty − Location_Match_Score
```

Returns an `optimized_stops[]` array with re-ordered `stop_order` and `estimated_travel_min` between stops.

---

## 5. State Management Summary

All swipe session state is managed in the `useTourBuilderStore` (Zustand):

| State Field | Type | Purpose |
|-------------|------|---------|
| `deckQueue` | `TourNode[]` | Cards yet to be swiped |
| `tourDraft` | `TourNode[]` | Locations starred for the tour |
| `nextCursor` | `string \| null` | Cursor for next card batch fetch |
| `hasMore` | `boolean` | Whether more cards exist |
| `status` | `BuilderStatus` | `idle \| loading \| finalizing \| ready \| error` |
| `lastDiscarded` | `TourNode \| null` | Enables 5-second Undo window |

---

## 6. Edge Cases

| Case | Handling |
|------|----------|
| User finalizes with **0 stars** | Show warning toast: "Star at least 1 location to build a tour." Block finalization. |
| Swipe batch flush **fails** (network error) | Silent retry once. If still fails, log to console. Do not block UI. |
| `feed/cards` returns **0 results** | Show `EmptyState` component suggesting user broaden search or try different category. |
| User swipes all cards, `has_more = false` | Show "You've seen everything nearby!" prompt with option to increase search radius. |
