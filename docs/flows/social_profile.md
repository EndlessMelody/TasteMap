# User Profile & Social Flows

This document details the business logic and API sequencing for the Personal Profile (My Profile), Foodie Profiles (Public), and Social Graph interactions (Friends, Match scoring, and Gamification).

## 1. My Profile (`/profile`)

The personal profile dashboard acts as the orchestration hub for a user's data.

### 1.1 Data Hydration Sequence
When the user navigates to `/profile`, the frontend executes the following API fetch operations in parallel to populate the dashboard:
1. **Core Identity**: Hydrated globally via `AuthContext` (JWT payload mapping to `user` state).
2. **Taste DNA (Vector)**: Hydrated globally via the `useUserVector()` context.
3. **Friend Graph**: `GET /api/v1/friends/foodies`
   - Returns the user's accepted friends and their pre-computed Taste Match Scores.
4. **Gamification (Badges)**: Executes the custom `useBadges()` hook -> calls `GET /api/v1/gamification/badges`.
5. **Content (Posts)**: `GET /api/v1/posts/?user_id={me}&limit=50&offset=0`.

### 1.2 Profile Mutation Sequence (Edit Profile)
Handling updates for cover photos and avatars:
1. **Media Upload**: If an avatar or cover image is changed, the frontend calls the media service `apiUploadMedia()`.
2. **Profile Update**: `PATCH /api/v1/users/me` with the updated URLs and bio text.
3. **State Sync**: Calls `refetch()` in the global `AuthContext` to ensure the new avatar propagates to navigation bars and floating headers instantly.

---

## 2. Foodie Profile (`/foodies/[id]`)

Viewing another user's profile involves fetching context-aware social graph data, ensuring the UI knows the relationship between the viewer and the target profile.

### 2.1 Context Hydration
Visiting a foodie's profile requires a split-fetch strategy:
1. **Target User Data (`UserProfile`)**: `GET /api/v1/users/{user_id}`
   - Returns static identity: EXP, Level, and interaction stats (reviews, visited, followers/following).
2. **Social Context (`SocialContext`)**: `GET /api/v1/users/{user_id}/social-context`
   - **Crucial Payload**: Returns `friendship_status` (none, pending, requested, accepted), `friendship_id`, an array of `mutual_friends`, and the target's 15-dim `food_vector`.
3. **Target Content**: `GET /api/v1/posts/?user_id={user_id}`.

### 2.2 Taste Match Score Calculation (Dynamic Client Compute)
To ensure immediate responsiveness and visual synchronicity, the "Taste Match Gauge" percentage is calculated **dynamically on the frontend**:
1. Frontend extracts `MyVector` (from local `useUserVector()`).
2. Frontend extracts `TheirVector` (from fetched `SocialContext.food_vector`).
3. Executes a mathematical Cosine Similarity (Dot Product over Euclidean magnitude) directly in the UI layer.
4. Renders the Match Gauge based on thresholds (Green for >= 80%, Orange for >= 60%, Gray otherwise).

---

## 3. Social Interaction Flows

### 3.1 Friendship Lifecycle
The system manages friend requests through specific REST transitions:
- **Add Friend**: `POST /api/v1/friends/request` (Body: `{ friend_id }`)
- **Accept Friend**: `PATCH /api/v1/friends/{friendship_id}/accept`
- **Cancel / Unfriend**: `DELETE /api/v1/friends/{friendship_id}`

*UI Behavior Pattern*: All social actions wrap the API execution in a `withBusy()` async lock. Once the action resolves, the page automatically triggers a re-fetch of the `/social-context` endpoint to refresh the UI buttons without necessitating a full page reload.

### 3.2 Messaging Handoff
- Clicking "Message" on a Foodie Profile **DOES NOT** trigger a backend chat creation API directly.
- Sequence: UI localizes target details into a `Friend` object -> Updates global `ChatContext` via `setActiveFriend(friend)` and `setIsChatOpen(true)` -> Routes user to the main `/foodies` lounge. The context trigger will pop up the messaging window.

---

## 4. Gamification Logic (Badges & XP)

- **Badge Fetching Orchestration**: The `useBadges(userId?)` hook centrally manages all achievement data retrieval.
  - If `userId` is omitted, it defaults to the authenticated user's session.
  - Automatically structures the raw JSON into `BadgeSummary` cards mapping required icons and progress.
- **XP Ecosystem**: XP calculations and Level scaling are strictly handled server-side. The frontend passively renders `user.xp` and `user.level` as scalar values provided during Hydration.
