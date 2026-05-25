<div align="center">

<!-- Animated Header -->
<img src="https://capsule-render.vercel.app/api?type=venom&height=200&text=TasteMap&fontSize=70&color=0:667eea,100:764ba2&stroke=764ba2&strokeWidth=2&animation=twinkling" alt="TasteMap"/>

<p><strong>AI-Powered Social Food Discovery & Journey Planning</strong></p>
<p><em>Elite Culinary Exploration Driven by Vector Similarity & Minimax Dynamics</em></p>

[![Built with React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_pgvector-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/MIT-green?style=for-the-badge)](LICENSE)

<br/>

<a href="#quick-start"><kbd>🚀 Quick Start</kbd></a>
<a href="#features"><kbd>✨ Features</kbd></a>
<a href="#api-documentation"><kbd>📚 API Docs</kbd></a>
<a href="#architecture"><kbd>🏗️ Architecture</kbd></a>

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Architecture](#-architecture)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌏 Overview

TasteMap is a high-fidelity, AI-driven social platform designed for the modern foodie. It replaces static restaurant lists with an **immersive discovery engine** that learns your preferences through interactive "swipes" and cinematic tour building.

Built with an **Elite Pastel** design system, TasteMap bridges the gap between social media and expert culinary guidance, providing a "Vercel-class" user experience for exploring the world's best tastes.

### The Problem with Traditional Food Apps

| Issue                       | Impact                                                        |
| --------------------------- | ------------------------------------------------------------- |
| **Generic Recommendations** | One-size-fits-all lists that don't adapt to individual tastes |
| **Static Interfaces**       | Flat designs that feel like 2015 spreadsheets                 |
| **Group Friction**          | The "Where do we eat?" debate remains an unsolved conflict    |
| **Disconnected Data**       | Reviews are isolated from the actual journey planning         |

### The TasteMap Solution

- **🧬 Vector-First Identity** — Every user and location is an _n_-dimensional vector
- **🎬 Cinematic Experience** — Framer Motion-driven transitions and Elite Pastel aesthetic
- **⚖️ Mathematical Referees** — Minimax algorithms to resolve group conflicts instantly
- **🌐 Integrated Workspace** — Real-time map navigation, Vaults, and Social Feed

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎯 AIPicks (Discovery)

Personalized, real-time recommendations using **pgvector** and a dynamic learning rate α that adapts to your swipe behavior.

### 🗺️ Tour Builder

A cinematic journey planner that chains locations into optimized itineraries using modified Dijkstra/A\* routing algorithms.

### 📱 Foodie Feed

A high-fidelity social hub featuring **Reels**, posts, and **Taste Vaults** for shared culinary experiences.

### 🧑‍🤝‍🧑 Foodies

Discover and connect with other food enthusiasts — explore their profiles, collections, and culinary journeys.

</td>
<td width="50%">

### ⚖️ Group Lobby (Minimax)

A collaborative room system that minimizes the "maximum dissatisfaction" of group members for perfect dining decisions, powered by real-time WebSocket communication.

### 🔥 Hot Routes

Curated trending food trails and popular local circuits updated dynamically from community data.

### 🌍 Culture Explorer

Deep-dive into the cultural context behind cuisines and regional food traditions.

### 🏆 Challenges & Gamification

Engage with food challenges, earn badges, and track your culinary achievements on a leaderboard.

### 🤖 AI Planner

A conversational AI assistant that helps you plan complete food journeys, from morning coffee to late-night bites.

### 🎨 Elite Pastel UI

A premium, dark-mode-first system built on **Once UI** primitives with Framer Motion animations.

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

### Frontend

![Next.js](https://img.shields.io/badge/Next.js_16-000?logo=nextdotjs&logoColor=white&style=flat-square)
![React](https://img.shields.io/badge/React_19-20232a?logo=react&logoColor=61DAFB&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white&style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?logo=tailwind-css&logoColor=white&style=flat-square)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?logo=framer&logoColor=white&style=flat-square)

### Backend

![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white&style=flat-square)
![Python](https://img.shields.io/badge/Python_3.11-3776AB?logo=python&logoColor=white&style=flat-square)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy_2.0-D71F00?logo=python&logoColor=white&style=flat-square)
![Alembic](https://img.shields.io/badge/Alembic-A4373A?logo=python&logoColor=white&style=flat-square)

### Database & Infrastructure

![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white&style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_pgvector-336791?logo=postgresql&logoColor=white&style=flat-square)
![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white&style=flat-square)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white&style=flat-square)

---

## 🚀 Quick Start

### Prerequisites

- Git
- Node.js 18+
- Python 3.11+
- Docker Desktop (for local Redis)
- A [Supabase](https://supabase.com/) project (PostgreSQL is cloud-hosted)

### 1. Clone the Repository

```bash
git clone https://github.com/EndlessMelody/TasteMap.git
cd TasteMap
```

### 2. Start Local Infrastructure (Redis only)

> **Note:** PostgreSQL is hosted on Supabase. Only Redis runs locally via Docker.

```bash
docker-compose up -d
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (choose your platform)
source venv/bin/activate        # macOS/Linux
.\venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
alembic upgrade head

# Start the server
uvicorn src.main:app --reload --port 8000
```

<details>
<summary>📋 Backend Environment Variables</summary>

Create a `.env` file inside the `backend/` directory:

```env
PORT=8000
DATABASE_URL=postgresql+asyncpg://postgres:[password]@[host]:5432/postgres
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

</details>

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

<details>
<summary>📋 Frontend Environment Variables</summary>

Create a `.env.local` file inside the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

</details>

> **🌐 Access the app at:** [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuration

### Backend (`backend/.env`)

```env
# ─────────────────────────────────────────
# Server
# ─────────────────────────────────────────
PORT=8000
HOST=0.0.0.0
DEBUG=true

# ─────────────────────────────────────────
# Database (Supabase / PostgreSQL + pgvector)
# ─────────────────────────────────────────
DATABASE_URL=postgresql+asyncpg://postgres:[password]@[host]:5432/postgres
DATABASE_POOL_SIZE=20

# ─────────────────────────────────────────
# Redis (Caching & Rate Limiting)
# ─────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ─────────────────────────────────────────
# Supabase Auth
# ─────────────────────────────────────────
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret

# ─────────────────────────────────────────
# AI & Embeddings
# ─────────────────────────────────────────
OPENAI_API_KEY=sk-...
EMBEDDING_MODEL=text-embedding-3-small

# ─────────────────────────────────────────
# Interaction Logic
# ─────────────────────────────────────────
SWIPE_LEARNING_RATE=0.1
GROUP_MINIMAX_MEMORY=10
SWIPE_RATE_LIMIT=30/minute
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       TasteMap Architecture                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   Client    │◄──►│  Next.js    │◄──►│   FastAPI Backend   │  │
│  │  (Browser)  │    │  App Router │    │    (Python 3.11)    │  │
│  └─────────────┘    └─────────────┘    └──────────┬──────────┘  │
│          │                                         │             │
│          │         WebSocket (Real-time)           │             │
│          └─────────────────────────────────────────┘             │
│                                                    │             │
│                        ┌───────────────────────────┤             │
│                        │                           │             │
│                   ┌────▼────┐  ┌───────────────────▼──────────┐ │
│                   │  Redis  │  │  Supabase (PostgreSQL)        │ │
│                   │ (Cache) │  │  + pgvector (Vector Store)    │ │
│                   │  Rate   │  │  + Supabase Auth              │ │
│                   │ Limiter │  └──────────────────────────────┘ │
│                   └─────────┘                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Core Algorithms

**Preference Evolution (Swipe Learning)**

```
U⃗_new = U⃗_old + α · P⃗
```

_Where α decays exponentially if "swipe-spamming" is detected via Redis rate limiting._

**Group Conflict Resolution (Minimax)**

```
min( max |Scoreᵢ - Score_ideal| )
    i∈Group
```

_Ensures no member feels ignored. Retains fairness memory across multiple group decisions._

**Contextual Scoring**

```
Score(S) = W₁ · Sim(U⃗, P⃗) + W₂ · C_weather - W₃ · D
```

_Combines vector similarity, weather context, and geographic distance into a single ranked score._

### Vector Dimensions (n=15)

Each user and location is encoded as a 15-dimensional vector covering: price level, noise level, outdoor exposure, modernity, cuisine type (one-hot: Vietnamese/Japanese/Italian/Mexican/Other), family-friendliness, romance, aesthetic appeal, authenticity, health focus, and late-night availability.

---

## 📁 Project Structure

```
TasteMap/
├── frontend/                   # Next.js 16 App Router
│   └── src/
│       ├── app/                # Pages (file-based routing)
│       │   ├── ai-planner/     # AI Planner feature
│       │   ├── challenges/     # Gamification & challenges
│       │   ├── culture/        # Culture explorer
│       │   ├── discover/       # Location discovery (AIPicks)
│       │   ├── feed/           # Foodie Feed (reels, posts)
│       │   ├── foodies/        # Social profiles
│       │   ├── group-rooms/    # Group Lobby
│       │   ├── hot-routes/     # Trending food trails
│       │   ├── profile/        # User profile
│       │   └── tour-builder/   # Tour Builder
│       ├── components/         # UI components (Once UI primitives)
│       ├── context/            # React Context (AuthContext)
│       ├── hooks/              # Custom hooks (useVoiceRoom, useAuth)
│       └── lib/                # API helpers, Supabase client
│
├── backend/                    # FastAPI + Python 3.11
│   └── src/
│       ├── api/v1/             # API version router
│       ├── auth/               # Supabase JWT auth
│       ├── groups/             # Group lobby + WebSocket
│       ├── locations/          # Location discovery
│       ├── recommendations/    # AI recommendation engine
│       ├── swipes/             # Swipe tracking & vector update
│       ├── tours/              # Tour building & routing
│       ├── feed/               # Social feed
│       ├── gamification/       # Challenges & achievements
│       └── users/              # User management
│
├── docs/                       # Documentation
│   ├── api/                    # REST API specs
│   ├── database_schema/        # DB schema docs
│   └── flows/                  # System workflow diagrams
│
└── docker-compose.yml          # Local Redis only
```

---

## 📚 API Documentation

Once the backend is running, access interactive API docs:

| Endpoint           | URL                                |
| ------------------ | ---------------------------------- |
| **Swagger UI**     | http://localhost:8000/docs         |
| **ReDoc**          | http://localhost:8000/redoc        |
| **OpenAPI Schema** | http://localhost:8000/openapi.json |

### Key API Endpoints

```
POST   /api/v1/auth/sync           # Sync Supabase user to Postgres
GET    /api/v1/locations           # Location discovery
POST   /api/v1/swipes              # Record user swipe (updates preference vector)
GET    /api/v1/recommendations     # AI-powered recommendations
POST   /api/v1/groups              # Create group lobby
WS     /ws/groups/{id}             # Real-time group WebSocket
POST   /api/v1/tours               # Build optimized tour itineraries
GET    /api/v1/feed                # Social feed
GET    /api/v1/challenges          # Gamification challenges
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository and create a feature branch
2. **Docs First** — update `docs/api/` or `docs/database_schema/` before writing code
3. **Code Quality** — ensure `npm run lint` passes (strict Once UI rules apply)
4. **Testing** — add tests for new features
5. **Pull Request** — submit with a clear description of changes

📖 See [UI Guidelines](./docs/UI_GUIDELINES.md) for design system details.

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

<p><strong>Made with 💙 by HCMUS_JobSeeker</strong></p>

<a href="https://github.com/EndlessMelody/TasteMap">⭐ Star us on GitHub</a>

</div>
