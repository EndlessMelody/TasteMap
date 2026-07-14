# 💳 Membership & Monetization Flow

This document details the business logic for TasteMap's 4-tier membership system (`bite` → `savor` → `feast` → `omakase`), the mock Visa checkout, quota enforcement, and avatar frame grants. Static schema/endpoint reference: [`docs/database_schema/monetization.md`](../database_schema/monetization.md) and [`docs/api/monetization.md`](../api/monetization.md).

## 1. Tier Resolution (`membership/entitlements.py::resolve_effective_tier`)

Tier is **computed on every read**, not stored authoritatively — the only durable facts are the subscription row and the streak counter. `users.membership_tier` is a denormalized snapshot written back whenever this function runs.

```mermaid
sequenceDiagram
    participant Caller as "/auth/sync, /users/me, /membership/*, checkin"
    participant Resolver as resolve_effective_tier()
    participant DB

    Caller->>Resolver: resolve(user)
    Resolver->>DB: SELECT subscriptions WHERE user_id=? AND status='active'
    alt subscription.current_period_end < now()
        Resolver->>DB: UPDATE subscriptions SET status='expired' (lazy expiry)
    end
    Resolver->>DB: SELECT user_streaks WHERE user_id=?
    Resolver->>Resolver: streak_alive = last_active_date >= local_yesterday
    Resolver->>Resolver: tier = omakase if (paid AND streak>=14)<br/>else feast if paid<br/>else savor if streak>=7<br/>else bite
    alt tier changed vs users.membership_tier
        Resolver->>DB: UPDATE users.membership_tier = tier
        Resolver->>DB: INSERT user_frames for all frames WHERE min_tier <= tier (idempotent)
        Resolver->>DB: auto-unequip equipped_frame_id if its min_tier > tier
    end
    Resolver-->>Caller: TierInfo
```

**Truth table:**

| Paid (active sub) | Streak ≥ 14 | Streak ≥ 7 | Effective tier |
|---|---|---|---|
| ✓ | ✓ | – | `omakase` |
| ✓ | ✗ | – | `feast` |
| ✗ | – | ✓ | `savor` |
| ✗ | – | ✗ | `bite` |

Demotion (streak break while Omakase → Feast; subscription expiry → Savor/Bite) falls out of this table automatically — there is no separate "demotion" code path.

## 2. Mock Visa Checkout (`membership/mock_visa.py`, `POST /membership/subscribe`)

```mermaid
sequenceDiagram
    participant Client
    participant Router as membership/router.py
    participant Provider as mock_visa.py
    participant DB

    Client->>Router: POST /subscribe {plan, idempotency_key, card}
    Router->>DB: SELECT payment_transactions WHERE idempotency_key=?
    alt already processed
        DB-->>Router: existing transaction
        Router-->>Client: return stored outcome (no re-charge)
    else new request
        Router->>Provider: validate(card) — Luhn, brand, expiry, CVV
        alt validation fails
            Provider-->>Client: 400 VALIDATION_ERROR (no delay, no ledger row)
        end
        Router->>Provider: charge(card) — sleep 1.2-2.4s, lookup test-card table
        Provider-->>Router: {status, decline_code?, provider_txn_id}
        Router->>DB: INSERT payment_transactions (succeeded|declined)
        alt succeeded
            Router->>DB: UPSERT subscriptions (status=active, period=+1mo/+1yr)
            Router->>Resolver: resolve_effective_tier() — grants frames, updates snapshot
            Router-->>Client: 200 {subscription, transaction, tier}
        else declined
            Router-->>Client: 402 PAYMENT_DECLINED
        end
    end
```

**Test-card table** (Stripe-style, see `docs/api/monetization.md` for the full list): `4242 4242 4242 4242` always succeeds; `4000 0000 0000 0002` / `…9995` / `…0069` / `…0127` / `…0119` deterministically decline with a specific `decline_code`. Any other Luhn-valid Visa number succeeds. This lets the demo show every UI state (success, each decline reason) on command.

**Idempotency:** `idempotency_key` is a client-generated UUID sent once per checkout attempt. Network retries (e.g. a timeout on the client side) resend the same key and get the original result — never a second charge.

## 3. Renewal Sweep (`tasks/subscription_renewal.py`)

Cloned from the existing `tasks/interaction_cleanup.py` APScheduler pattern, scheduled at 03:30 daily (after the 03:00 interaction cleanup).

```mermaid
sequenceDiagram
    participant Cron as APScheduler (03:30 daily)
    participant DB
    participant Provider as mock_visa.py

    Cron->>DB: SELECT subscriptions WHERE status='active' AND current_period_end <= now()
    loop each due subscription
        alt cancel_at_period_end = true
            Cron->>DB: UPDATE status='expired'
        else auto-renew
            Cron->>Provider: charge_saved(payment_method) — uses stored test_behavior
            alt success
                Cron->>DB: extend current_period_end (+1 month or +365 days)
                Cron->>DB: INSERT payment_transactions (type=renewal, succeeded) + receipt_number
            else declined
                Cron->>DB: INSERT payment_transactions (type=renewal, declined)
                Cron->>DB: UPDATE status='expired'
                Cron->>Notifications: notify user of failed renewal
            end
        end
    end
```

Between sweep runs, `resolve_effective_tier()`'s lazy expiry check (§1) covers any subscription whose `current_period_end` has already passed — so tier correctness never depends on the cron having run recently.

## 4. Streak Freeze (`challenges/streak_service.py::checkin`, extended)

When a check-in finds the streak broken (`last_active_date` is exactly 2 local days ago — i.e. exactly one day was missed), the service checks the caller's tier-based monthly freeze allowance (`entitlements.py`) against `COUNT(streak_freezes) WHERE user_id=? AND frozen_date >= <first of local month>`. If an allowance remains, it inserts a `streak_freezes` row for the missed date and **continues** the streak (`current_streak += 1`) instead of resetting it to 1, returning `freeze_used: true` in the check-in response. Missing more than one consecutive day still resets the streak — freezes forgive a single missed day, not extended absence.

## 5. Quota Enforcement (`membership/quota.py`)

`enforce_quota(feature)` is a FastAPI dependency factory wired onto `interactions` (swipe-batch), `culture` (all 3 endpoints), `recommendations`, and `tours` (optimize). It resolves the caller's tier (Redis-cached 60s), looks up the per-tier limit from the entitlement matrix, and — if not unlimited — does `INCR quota:{feature}:{user_id}:{local_date}` + `EXPIRE`. Over limit → 429 `QUOTA_EXCEEDED`. Structural caps (tour stops, saved tours, vault bookmarks) are plain count checks inside the relevant services rather than Redis counters, since they cap total state, not a daily rate.

**Fail-open policy:** any Redis error (including the dev-mode `InMemoryRedis` fallback lacking a method) allows the request through rather than 500ing — quota enforcement must never be the reason a demo breaks.
