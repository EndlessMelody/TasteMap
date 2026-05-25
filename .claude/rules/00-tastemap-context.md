---
trigger: always_on
---

# TasteMap Agent Context

## Project Overview

**TasteMap** is an AI-powered social food discovery and journey planning platform. It bridges the gap between social media and expert culinary guidance using vector-based preference learning and group conflict resolution algorithms.
Development Guidelines
**Core Value Proposition:**
- Replaces static restaurant lists with an immersive discovery engine
- Learns user preferences through interactiveDevelopment Guidelines "swipes" (AIPicks)
- Resolves group dining conflicts using Minimax algorithms
- Provides cinematic tour building with optimized itineraries

---

## Technology Stack

### Frontend Architecture
```
Next.js 16 (App Router + Turbopack)
├── React 19
├── TypeScript 5
├── Once UI (Primary) - Semantic layout primitives
├── Tailwind CSS 4 (Minimal - for utilities only)
├── Framer Motion - Animations & gestures
└── Supabase Auth (JWT)
```

**Key Directories:**
- `frontend/src/app/` - Next.js App Router pages
- `frontend/src/components/` - React components
  - `components/primitives/` - Once UI wrappers
  - `components/features/` - Domain-specific (lobby, feed, tours)
  - `components/layout/` - Page shells
- `frontend/src/context/` - React Context providers (AuthContext)
- `frontend/src/hooks/` - Custom React hooks (useVoiceRoom, useAuth)
- `frontend/src/lib/` - Utilities (supabase client, API helpers)
- `frontend/src/types/` - TypeScript type definitions

### Backend Architecture
```
FastAPI + Python 3.11
├── SQLAlchemy 2.0 (ORM)
├── Alembic (Migrations)
├── PostgreSQL + pgvector (Vector database)
├── Redis (Caching & Rate limiting)
├── OpenAI (Embeddings)
└── WebSocket (Real-time features)
```

**Key Directories:**
- `backend/src/api/` - API versioning
- `backend/src/auth/` - Authentication logic
- `backend/src/core/` - Core configuration
- `backend/src/db/` - Database session management
- `backend/src/groups/` - Group lobby feature
- `backend/src/locations/` - Location discovery
- `backend/src/recommendations/` - AI recommendation engine
- `backend/src/users/` - User management

---

## Core Concepts

### 1. Elite Pastel Design System
- **Philosophy:** Dark-mode first, grounded, simple, performant
- **Aesthetic:** Vercel-class quality, Linear-inspired, Raycast-level polish
- **Primitives:** Once UI semantic components (Column, Row, Grid, Heading, Text)
- **NO Tailwind utility classes for layout** - use Once UI props exclusively

### 2. Vector-First Identity
Every entity is an n-dimensional vector:
- **User Vector:** Preference profile (price, noise, nature, cuisine type, modern vs historic, etc.)
- **Location Vector:** Restaurant/place embedding
- **Dimension:** Fixed at n=15 for core traits
- **Storage:** pgvector in PostgreSQL with IVFFlat/HNSW indexing

### 3. Key Algorithms

**Preference Evolution (Swipe Learning):**
```
U⃗_new = U⃗_old + α · P⃗
```
- α = dynamic learning rate (decays if spam detected)
- P⃗ = preference delta from swipe action

**Group Conflict Resolution (Minimax):**
```
min( max |Scoreᵢ - Score_ideal| )
    i∈Group
```
- Minimizes maximum dissatisfaction among group members
- Retains memory of compromises for fairness

**Contextual Scoring:**
```
Score(S) = W₁ · Sim(U⃗, P⃗) + W₂ · C_weather - W₃ · D
```
- Sim = Cosine Similarity
- D = normalized distance

---

## Authentication Flow

1. **Frontend:** Supabase Auth (OAuth, email/password)
2. **JWT Token:** Passed to backend in Authorization header
3. **Backend Sync:** `POST /api/v1/auth/sync` provisions user in Postgres
4. **Context:** `AuthContext` provides `{ isInitializing, isLoggedIn, user, login, logout }`
5. **Middleware:** `middleware.ts` protects routes

**Key Files:**
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/lib/supabase.ts`
- `backend/src/auth/router.py`
- `frontend/middleware.ts`

---

## Feature Modules

### AIPicks (Discovery)
- Tinder-style swipe interface for restaurant discovery
- Real-time preference learning
- Vector-based recommendations

### Tour Builder
- Multi-location itinerary planning
- Graph-based route optimization (Dijkstra/A*)
- Cinematic presentation with map integration

### Group Lobby
- **Phase 1:** Create/join rooms (public/private with invite codes)
- **Phase 2:** Room interior with chat, ready status, members list
- **Phase 3:** Voice chat scaffold (WebRTC integration points)
- Minimax algorithm for group decisions

### Foodie Feed
- Social feed with posts, reels, comments
- Taste Vaults (collections)
- Bookmarking system

---

## System Workflows, API & Database Patterns

👉 **Single Source of Truth:** 
To view the complete System Workflows, REST API Endpoints, Parameters, Request Bodies, Response Schemas, and the Database Tables (including pgvector), you **MUST** refer to the documentation:
- **System Workflows Index:** `docs/flows/README.md`
- **API Documentation Index:** `docs/api/README.md`
- **Database Schema Index:** `docs/database_schema/README.md`

Do NOT assume endpoints, tables, or business logic flows exist without checking the above documentation indexes.


## Development Guidelines

### Priority Hierarchy
0. **THE GOLDEN RULE (Docs-First):** NEVER write functional code before updating and getting approval for documentation. You MUST follow `07-docs-first.md` strictly.
1. **Semantic Clarity:** Use Once UI primitives, never `<div>`
2. **Mathematical Rigor:** All ranking/preference logic must use defined formulas
3. **Vector-First Thinking:** Both users and locations are n-dimensional vectors
4. **Performance:** Use pgvector ANN indexes, numpy for matrix operations

### When Implementing Features
1. Always check this context file first
2. Follow domain-specific rules:
   - Docs & Flow → `07-docs-first.md` (MANDATORY FIRST STEP)
   - UI → `01-frontend-ui.md`
   - API → `02-backend-api.md`
   - DB → `03-database-vectors.md`
   - AI → `04-ai-algorithm.md`
   - Real-time → `05-realtime-websocket.md`

### File Organization
- **Frontend:** Feature-based folders with barrel exports (`index.ts`)
- **Backend:** Router/Service/Model pattern per domain
- **Shared:** Types duplicated if necessary (no shared folder)

---

## Quick Reference

**Start Dev Servers:**
```bash
# Backend
cd backend && uvicorn src.main:app --reload --port 8000

# Frontend
cd frontend && npm run dev  # localhost:3000
```

**Generate Migration:**
```bash
cd backend && alembic revision --autogenerate -m "description"
```

**Key Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `OPENAI_API_KEY` - For embeddings
- `NEXT_PUBLIC_API_URL` - Frontend→Backend URL
- `NEXT_PUBLIC_SUPABASE_URL` - Auth
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Auth