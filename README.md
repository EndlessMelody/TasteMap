<div align="center">

<!-- Animated Header -->
<img src="https://capsule-render.vercel.app/api?type=venom&height=200&text=TasteMap&fontSize=70&color=0:667eea,100:764ba2&stroke=764ba2&strokeWidth=2&animation=twinkling" alt="TasteMap"/>

<p><strong>AI-Powered Social Food Discovery & Journey Planning</strong></p>
<p><em>Elite Culinary Exploration Driven by Vector Similarity & Minimax Dynamics</em></p>

<!-- Dynamic Badges -->

[![Built with React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
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

## � Overview

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
- **🎬 Cinematic Experience** — Framer Motion-driven transitions and Elite Pastel Blue aesthetic
- **⚖️ Mathematical Referees** — Minimax algorithms to resolve group conflicts instantly
- **🌐 Integrated Workspace** — Real-time map navigation, Vaults, and Social Feed

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎯 AIPicks

Personalized, real-time recommendations using **pgvector** and a dynamic learning rate α that adapts to your swipe behavior.

### 🗺️ Tour Builder

A cinematic journey planner that chains locations into optimized itineraries using modified Dijkstra/A\* routing algorithms.

### 📱 Foodie Feed

A high-fidelity social hub featuring **Reels** and **Taste Vaults** for shared culinary experiences.

</td>
<td width="50%">

### ⚖️ Group Lobby (Minimax)

A collaborative room system that minimizes the "maximum dissatisfaction" of group members for perfect dining decisions.

### 🛰️ Contextual Navigator

A fluid UI that adapts based on user intent (Lobby, Browse, or Plan).

### 🎨 Elite Pastel UI

A premium, dark-mode-first system built on **Once UI** primitives and Tailwind CSS 4.

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

### Frontend

![Next.js](https://img.shields.io/badge/Next.js_16-000?logo=nextdotjs&logoColor=white&style=flat-square)
![React](https://img.shields.io/badge/React_19-20232a?logo=react&logoColor=61DAFB&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white&style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white&style=flat-square)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?logo=framer&logoColor=white&style=flat-square)

### Backend

![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white&style=flat-square)
![Python](https://img.shields.io/badge/Python_3.11-3776AB?logo=python&logoColor=white&style=flat-square)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?logo=python&logoColor=white&style=flat-square)
![Alembic](https://img.shields.io/badge/Alembic-A4373A?logo=python&logoColor=white&style=flat-square)

### Database & Infrastructure

![PostgreSQL](https://img.shields.io/badge/PostgreSQL_pgvector-336791?logo=postgresql&logoColor=white&style=flat-square)
![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white&style=flat-square)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white&style=flat-square)
![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=white&style=flat-square)

---

## 🚀 Quick Start

### Prerequisites

- Git
- Node.js 18+
- Python 3.11+
- Docker Desktop

### 1. Clone & Setup Infrastructure

```bash
# Clone the repository
git clone https://github.com/your-org/tastemap.git
cd tastemap

# Start PostgreSQL + Redis
docker-compose up -d
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (choose your platform)
source venv/bin/activate        # macOS/Linux
.\venv\Scripts\activate        # Windows

# Install dependencies & run
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000
```

<details>
<summary>📋 Backend Environment Variables</summary>

```env
PORT=8000
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/tdtt_db
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key
OPENAI_API_KEY=sk-...
```

</details>

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

> **🌐 Access the app at:** [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuration

Create a `.env` file in the project root:

```env
# ─────────────────────────────────────────
# Server Configuration
# ─────────────────────────────────────────
PORT=8000
HOST=0.0.0.0
DEBUG=true

# ─────────────────────────────────────────
# Database
# ─────────────────────────────────────────
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/tdtt_db
DATABASE_POOL_SIZE=20

# ─────────────────────────────────────────
# Redis (Caching & Rate Limiting)
# ─────────────────────────────────────────
REDIS_URL=redis://localhost:6379

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

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         TasteMap Architecture                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   Client    │◄──►│  Next.js    │◄──►│   FastAPI Backend   │  │
│  │  (Browser)  │    │   Frontend  │    │    (Python 3.11)    │  │
│  └─────────────┘    └─────────────┘    └──────────┬──────────┘  │
│          │                                         │             │
│          │         WebSocket (Real-time)          │             │
│          └─────────────────────────────────────────┘             │
│                                                    │             │
│                             ┌──────────────────────┼────────┐ │
│                             │                      │        │ │
│                        ┌────▼────┐  ┌───────────▼───┐  ┌───▼──┐│
│                        │  Redis  │  │ PostgreSQL    │  │  AI  ││
│                        │ (Cache) │  │ + pgvector     │  │ APIs ││
│                        └─────────┘  │ (Vector Store) │  └──────┘│
│                                     └────────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Core Algorithms

**Preference Evolution**

```
U⃗_new = U⃗_old + α · P⃗
```

_Where α decays exponentially if "swipe-spamming" is detected via Redis._

**Group Conflict Resolution (Minimax)**

```
min( max |Scoreᵢ - Score_ideal| )
    i∈Group
```

_Ensures no member feels ignored when others have strong preferences._

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
POST   /api/v1/auth/sync           # User synchronization
GET    /api/v1/locations           # Location discovery
POST   /api/v1/swipes             # Record user swipe
GET    /api/v1/recommendations     # AI-powered recommendations
POST   /api/v1/groups              # Create group lobby
POST   /api/v1/tours               # Build optimized tours
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository and create a feature branch
2. **Code Quality**: Ensure `npm run lint` passes (Strict Once UI Rules)
3. **Testing**: Add tests for new features
4. **Documentation**: Update relevant docs
5. **Pull Request**: Submit with clear description of changes

📖 See [UI Guidelines](./docs/UI_GUIDELINES.md) for design system details.

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

<p><strong>Made with 💙 by HCMUS_JobSeeker</strong></p>

<a href="https://github.com/your-org/tastemap">⭐ Star us on GitHub</a>

</div>
