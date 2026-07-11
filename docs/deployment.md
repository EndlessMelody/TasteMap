# Deployment Runbook — Vercel + Render + Supabase

This document covers **production deployment only**. For local development, see the [README](../README.md#-quick-start).

Stack:
- **Frontend** → Vercel (Next.js 16)
- **Backend** → Render (FastAPI, `render.yaml` blueprint at repo root)
- **Database + Auth + Storage** → Supabase (Postgres + pgvector, JWKS-verified JWT auth, media storage bucket)
- **Redis** → Render Key Value (managed, provisioned by `render.yaml`)

---

## 1. Supabase

Supabase is already the live Postgres instance (not just Auth) — pgvector is enabled automatically by `backend/alembic/versions/8b66a71fd32b_initial_schema.py` (`CREATE EXTENSION IF NOT EXISTS vector`).

Two separate connection strings are required — **do not use the same one for both**:

| Var | Port | Pooler mode | Used by |
|---|---|---|---|
| `DATABASE_URL` | 6543 | Transaction pooler (pgBouncer/Supavisor) | App runtime (`backend/src/db/database.py`) |
| `DATABASE_URL_DIRECT` | 5432 | Direct / session | Alembic migrations only (`backend/alembic/env.py:28`) |

The transaction pooler does not support server-side prepared statements. This is already handled: `DATABASE_URL` must keep the `?prepared_statement_cache_size=0` query param, and `database.py` additionally passes `connect_args={"statement_cache_size": 0, "prepared_statement_cache_size": 0}` to asyncpg as a second safeguard.

**Connection budget:** with `render.yaml` running `--workers 1` and `DB_POOL_SIZE=5` / `DB_MAX_OVERFLOW=5`, the app opens at most ~10 connections to the transaction pooler. Confirm this fits your Supabase plan's pooler connection limit before scaling workers up.

Where to find both URLs: Supabase Dashboard → Project Settings → Database → Connection string (toggle "Transaction" vs "Session/Direct" mode).

Also grab, from the same Settings page / API settings:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required for media uploads — `backend/src/media/service.py`)
- `SUPABASE_JWT_SECRET` (required by `Settings` at startup even though the actual token verification path uses JWKS, not this secret — see `backend/src/core/dependencies.py`)
- `SUPABASE_PROJECT_REF` (optional — parsed from `SUPABASE_URL` if omitted)

---

## 2. Render (backend)

Deploy via Blueprint: Render Dashboard → New → Blueprint → point at this repo, it will read `render.yaml` from the repo root.

`render.yaml` defines two services:
1. **`tastemap-redis`** (type `keyvalue`, free plan) — managed Redis. Wired into the web service automatically via `fromService`.
2. **`tastemap-backend`** (type `web`, Python 3.13.2, starter plan):
   - `preDeployCommand: alembic upgrade head` — runs migrations against `DATABASE_URL_DIRECT` before traffic switches to the new instance. This includes any migrations not yet applied, e.g. `20260708_add_membership_monetization.py`.
   - `startCommand`: `uvicorn src.main:app --host 0.0.0.0 --port $PORT --workers 1 --proxy-headers --forwarded-allow-ips="*"`.
     - **`--workers 1` is intentional, not a placeholder.** The voice-chat WebSocket (`backend/src/groups/websocket.py`) keeps room state in an in-process Python dict. With more than one worker, two users in the same voice room can land on different workers and never see each other. Do not raise the worker count until that state is moved to Redis pub/sub.
   - `healthCheckPath: /health/ready` — a deep probe that checks DB (`SELECT 1`) and Redis (`PING`), not just process liveness. See `docs/api/system.md` §19.

**Env vars to fill in the Render dashboard** (everything marked `sync: false` in `render.yaml`): `DATABASE_URL`, `DATABASE_URL_DIRECT`, `SUPABASE_URL`, `SUPABASE_JWT_SECRET`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PROJECT_REF`, `GROQ_API_KEY`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`. `REDIS_URL` is auto-populated from the `tastemap-redis` Key Value service — do not set it manually.

**Cron jobs:** `backend/src/tasks/interaction_cleanup.py` (daily 03:00) and `backend/src/tasks/subscription_renewal.py` (daily 03:30) run in-process via APScheduler, guarded by a Redis `SET NX EX` lock so they don't double-fire under multiple workers/restarts. The **Starter** plan (used here) does not sleep, so these will fire on schedule; a Free-tier instance that spins down could miss them.

**CORS:** `ALLOWED_ORIGINS` is set to the production Vercel URL; `ALLOWED_ORIGIN_REGEX` additionally allows any `https://tastemap-*.vercel.app` Vercel preview deployment without needing a redeploy per preview URL.

---

## 3. Vercel (frontend)

Project settings → set **Root Directory = `frontend`** (no `vercel.json` needed).

Env vars (Project → Settings → Environment Variables), all `NEXT_PUBLIC_*` since there are no server-only secrets in this app:
- `NEXT_PUBLIC_API_URL` — the Render backend's `https://` URL. **Required in production** — without it, `frontend/src/lib/api.ts:21` resolves the API base to the current origin, i.e. calls go nowhere.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- Optional: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_WEBRTC_ICE_SERVERS`, `NEXT_PUBLIC_ADMIN_SECRET`

**WebSocket:** `frontend/src/hooks/useVoiceRoom.ts` derives `wss://` vs `ws://` from `window.location.protocol`, so it will correctly use `wss://` once served over Vercel's HTTPS. The socket connects **directly to the Render backend** (Vercel serverless can't proxy long-lived WebSocket connections) — confirm the Render backend is reachable over `wss://` and that its CORS/origin config allows the Vercel domain (see §2).

**Build notes:**
- `package.json` now pins `engines.node: "22.x"` to match Vercel's default.
- The `--max-old-space-size` flag in the `dev` script does not apply to `next build`. If the Vercel build OOMs (heavy deps: `three`, `@react-three/*`, `mapbox-gl`, `xlsx`, `recharts`), set `NODE_OPTIONS=--max-old-space-size=8192` as a Vercel env var rather than editing the build script.
- `xlsx` is now dynamically imported inside the admin locations page handlers instead of statically at module scope, trimming that route's chunk.
- `next.config.ts` sets `images.minimumCacheTTL` to 31 days to reduce repeat Vercel image-optimization transformations of the same Supabase/Unsplash image.

---

## 4. Limits & quotas (verify current numbers against each provider's pricing page before go-live)

| Layer | Limit | Where it's enforced | Mitigation already in place |
|---|---|---|---|
| App-level rate limiting | 300 req/min default, tighter per-route (e.g. media upload 20/min) | `backend/src/core/rate_limit.py`, slowapi + Redis storage in prod | Requires Redis to be up — app-level 429s are already returned with `Retry-After` |
| Render Starter | Fixed instance hours/month, no cold sleep | Render billing dashboard | `--workers 1` keeps memory footprint down |
| Render Key Value (free) | Small memory ceiling, no persistence guarantees on free tier | Render Key Value plan page | Used only for cache/rate-limit/OTP/cron-lock — nothing is durable-critical |
| Supabase free/small tier | Connection pool ceiling, storage egress cap | Supabase project settings | `DB_POOL_SIZE=5` + `DB_MAX_OVERFLOW=5` × 1 worker keeps connections low |
| Vercel Hobby | ~100GB bandwidth/mo, image-optimization transformation quota | Vercel usage dashboard | `minimumCacheTTL` set; only 2 components use `next/image` and both already pass `unoptimized` |

---

## 5. Go-live checklist

- [ ] Rotate the Supabase DB password, `SUPABASE_JWT_SECRET`, and `SUPABASE_SERVICE_ROLE_KEY` — a local `backend/.env` currently has these in plaintext; treat them as compromised once any machine holding that file is not fully trusted.
- [ ] Confirm `ENVIRONMENT=production` is set on Render (already in `render.yaml`) — this disables `/docs`, `/redoc`, `/openapi.json` and enforces the Redis-required startup check.
- [ ] Commit `render.yaml` and any pending Alembic migrations (e.g. `20260708_add_membership_monetization.py`) — they must be in the repo for Render to pick them up.
- [ ] Run `alembic upgrade head` once against the real Supabase instance (the Render `preDeployCommand` will do this on every future deploy).
- [ ] Seed location data via `backend/scripts/seed_locations.py` if the target Supabase project is fresh (needs `GROQ_API_KEY`; install `backend/scripts/requirements-scripts.txt` first).
- [ ] Smoke test after first deploy: `GET https://<render-host>/health/ready` returns 200; log in on the Vercel site and confirm `/auth/sync` succeeds (CORS + JWKS working); open a voice room and confirm the `wss://` connection to the Render backend succeeds.
- [ ] Reconsider `NEXT_PUBLIC_ADMIN_SECRET` — as a `NEXT_PUBLIC_*` var it ships to the browser, so it is not a real access control; treat the admin gate as UX-only until it's replaced with server-verified auth.
