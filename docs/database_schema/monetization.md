[← Back to Index](README.md)

# Monetization Schema

> Domain: **Membership & Monetization** — the 4-tier account system (`bite` → `savor` → `feast` → `omakase`), the mock Visa payment provider, and the avatar frame (cosmetic) catalog. See [`docs/api/monetization.md`](../api/monetization.md) for the endpoints that read/write these tables, and [`docs/flows/monetization.md`](../flows/monetization.md) for the tier-resolution and checkout sequencing.
>
> `test_behavior` on `payment_methods` is **mock-provider scaffolding only** — it must never survive a swap to a real payment provider (Stripe, VNPay, etc.).

## Table `users` (modified)

Two columns added to the existing `users` table (see [`core.md`](./core.md) for the full column list).

### Columns

| Name | Type | Constraints | Description |
|------|------|-------------|-------------|
| `membership_tier` | `varchar` | Default `'bite'` | Denormalized snapshot of the effective tier (`bite`/`savor`/`feast`/`omakase`), lazily recomputed by `resolve_effective_tier()`. Not authoritative — see Tier Resolution below. |
| `equipped_frame_id` | `int4` | Nullable | FK → `avatar_frames.id` (`ON DELETE SET NULL`). Mirrors the existing `primary_badge_id` "equipped cosmetic" pattern. |

## Table `subscriptions`

One row per subscription attempt lifecycle; a user has at most one `active` row at a time (partial unique index below).

### Columns

| Name | Type | Constraints | Description |
|------|------|-------------|-------------|
| `id` | `int4` | Primary | |
| `user_id` | `int4` |  | FK → `users.id` (`ON DELETE CASCADE`), indexed |
| `plan` | `varchar` |  | `feast_monthly` \| `feast_yearly` |
| `status` | `varchar` |  | `active` \| `expired`, indexed |
| `price_vnd` | `int4` |  | Integer VND amount charged (no decimals) |
| `currency` | `varchar` | Default `'VND'` | |
| `started_at` | `timestamptz` |  | |
| `current_period_start` | `timestamptz` |  | |
| `current_period_end` | `timestamptz` |  | Indexed — read by the lazy-expiry check and the renewal sweep |
| `cancel_at_period_end` | `bool` | Default `false` | Stripe-style cancel: stays `active` until period end |
| `canceled_at` | `timestamptz` | Nullable | |
| `payment_method_id` | `int4` | Nullable | FK → `payment_methods.id` (`ON DELETE SET NULL`) — card used for renewal |
| `created_at` | `timestamptz` |  | |
| `updated_at` | `timestamptz` |  | |

**Indexes:** partial unique `uq_subscriptions_user_active ON (user_id) WHERE status = 'active'`.

## Table `payment_methods`

Masked card storage only — the PAN (card number) is **never** persisted, only a salted fingerprint for de-duplication.

### Columns

| Name | Type | Constraints | Description |
|------|------|-------------|-------------|
| `id` | `int4` | Primary | |
| `user_id` | `int4` |  | FK → `users.id` (`ON DELETE CASCADE`), indexed |
| `brand` | `varchar` |  | `visa` |
| `last4` | `varchar(4)` |  | |
| `exp_month` | `int4` |  | |
| `exp_year` | `int4` |  | |
| `cardholder_name` | `varchar` | Nullable | |
| `fingerprint` | `varchar` |  | SHA-256 of the PAN — used for de-dup, never reversible |
| `test_behavior` | `varchar` |  | Mock-only: `success` \| `card_declined` \| `insufficient_funds` \| … captured at save time, drives deterministic renewal outcomes |
| `is_default` | `bool` | Default `false` | |
| `created_at` | `timestamptz` |  | |

**Indexes:** unique `(user_id, fingerprint)`.

## Table `payment_transactions`

Structural template: `xp_transactions` (see [`gamification.md`](./gamification.md)) — an append-only ledger.

### Columns

| Name | Type | Constraints | Description |
|------|------|-------------|-------------|
| `id` | `int4` | Primary | |
| `user_id` | `int4` |  | FK → `users.id` (`ON DELETE CASCADE`), indexed (with `created_at`) |
| `subscription_id` | `int4` | Nullable | FK → `subscriptions.id` (`ON DELETE SET NULL`) |
| `payment_method_id` | `int4` | Nullable | FK → `payment_methods.id` (`ON DELETE SET NULL`) |
| `amount_vnd` | `int4` |  | |
| `currency` | `varchar` | Default `'VND'` | |
| `type` | `varchar` |  | `purchase` \| `renewal` |
| `status` | `varchar` |  | `succeeded` \| `declined` \| `error` |
| `provider` | `varchar` | Default `'mockvisa'` | |
| `provider_txn_id` | `varchar` | Unique | `mv_<hex24>` |
| `decline_code` | `varchar` | Nullable | `card_declined` \| `insufficient_funds` \| `expired_card` \| `incorrect_cvc` \| `processing_error` |
| `description` | `varchar` | Nullable | |
| `receipt_number` | `varchar` | Unique, Nullable | `TM-2026-000042` — issued on `succeeded` only |
| `idempotency_key` | `varchar` | Unique, Nullable | Client-supplied; replays return the stored outcome instead of charging again |
| `created_at` | `timestamptz` |  | |

## Table `avatar_frames`

Catalog of equippable avatar decorations, seeded by the migration (never user-writable).

### Columns

| Name | Type | Constraints | Description |
|------|------|-------------|-------------|
| `id` | `int4` | Primary | |
| `slug` | `varchar` | Unique | e.g. `omakase-gold-shimmer` |
| `name` | `varchar` |  | |
| `description` | `text` | Nullable | |
| `min_tier` | `varchar` |  | Minimum tier required to equip: `savor` \| `feast` \| `omakase` |
| `style_key` | `varchar` |  | Frontend CSS frame-renderer key (see `DecoratedAvatar`) |
| `accent_color` | `varchar` |  | |
| `is_animated` | `bool` | Default `false` | Only `omakase` frames are animated |
| `sort_order` | `int4` |  | |
| `is_active` | `bool` | Default `true` | |
| `created_at` | `timestamptz` |  | |

## Table `user_frames`

Inventory of frames a user has earned (granted idempotently on tier attainment; kept on demotion, only equipping is gated by current tier).

### Columns

| Name | Type | Constraints | Description |
|------|------|-------------|-------------|
| `id` | `int4` | Primary | |
| `user_id` | `int4` |  | FK → `users.id` (`ON DELETE CASCADE`), indexed |
| `frame_id` | `int4` |  | FK → `avatar_frames.id` (`ON DELETE CASCADE`) |
| `earned_at` | `timestamptz` |  | |

**Indexes:** unique `(user_id, frame_id)`.

## Table `streak_freezes`

One row per calendar day a streak-break was auto-forgiven. Monthly allowance (see entitlement matrix in [`docs/api/monetization.md`](../api/monetization.md)) is computed as `COUNT(*) WHERE user_id = ? AND frozen_date >= <first day of current local month>`.

### Columns

| Name | Type | Constraints | Description |
|------|------|-------------|-------------|
| `id` | `int4` | Primary | |
| `user_id` | `int4` |  | FK → `users.id` (`ON DELETE CASCADE`), indexed |
| `frozen_date` | `date` |  | The missed local date that was forgiven |
| `tier_at_use` | `varchar` |  | Tier snapshot at the moment the freeze was consumed (audit) |
| `created_at` | `timestamptz` |  | |

**Indexes:** unique `(user_id, frozen_date)`.

---

## Tier Resolution (not stored authoritatively)

`membership_tier` on `users` is a **denormalized snapshot**, not the source of truth. The real inputs are:
1. Whether `subscriptions` has a row with `status = 'active'` for the user (paid).
2. Whether `user_streaks.current_streak` is "alive" (see [`gamification.md`](./gamification.md)) and `≥ 7` (Savor) or `≥ 14` (Omakase).

`omakase` = paid ∧ streak ≥ 14 · `feast` = paid · `savor` = streak ≥ 7 · else `bite`. The snapshot column exists purely so hot read paths (feed authors, leaderboards) can read tier with zero extra joins; it is refreshed on every `/auth/sync`, `/users/me`, `/membership/*`, and streak check-in call.
