<div align="center">

<img src="https://i.pinimg.com/736x/e4/b6/85/e4b685c6ea97e9e0954a8507082735c9.jpg" alt="TasteMap Logo" width="160"/>

**AI-Powered Social Food Discovery & Journey Planning**

*Elite Culinary Exploration Driven by Vector Similarity & Minimax Dynamics*

[![Built with React](https://img.shields.io/badge/Built%20with-React%2019-61DAFB?logo=react)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Framework-Next.js%2016-000000?logo=nextdotjs)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![pgvector](https://img.shields.io/badge/Database-PostgreSQL%20+%20pgvector-336791?logo=postgresql)](https://github.com/pgvector/pgvector)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Live Demo](https://tastemap-example.vercel.app) • [API Documentation](#api-documentation) • [Research Report](./PROJECT_REPORT.md)

</div>

---

## 🍽️ About TasteMap

TasteMap is a high-fidelity, AI-driven social platform designed for the modern foodie. It replaces static restaurant lists with an **immersive discovery engine** that learns your preferences through interactive "swipes" and cinematic tour building.

Built with an **Elite Pastel** design system, TasteMap bridges the gap between social media and expert culinary guidance, providing a "Vercel-class" user experience for exploring the world's best tastes.

### Why TasteMap?

Traditional food apps suffer from:
- **Generic Recommendations**: One-size-fits-all lists that don't adapt to individual tastes.
- **Static Interfaces**: Flat designs that feel like 2015 spreadsheets.
- **Group Friction**: The "Where do we eat?" debate remains an unsolved conflict.
- **Disconnected Data**: Reviews are isolated from the actual journey planning.

**TasteMap solves this with:**
- **Vector-First Identity**: Every user and location is an $n$-dimensional vector.
- **Cinematic Experience**: Framer Motion-driven transitions and an Elite Pastel Blue aesthetic.
- **Mathematical Referees**: Minimax algorithms to resolve group conflicts instantly.
- **Integrated Workspace**: Real-time map navigation, Vaults, and a Social Feed.

---

## ✨ Key Features

- **🎯 AIPicks**: Personalized, real-time recommendations using **pgvector** and a dynamic learning rate $\alpha$.
- **🗺️ Tour Builder**: A cinematic journey planner that chains locations into optimized itineraries using modified Dijkstra/A* routing.
- **📱 Foodie Feed**: A high-fidelity social hub featuring **Reels** and **Taste Vaults** for shared experiences.
- **⚖️ Lobby (Minimax)**: A collaborative room system that minimizes the "maximum dissatisfaction" of group members for perfect dining decisions.
- **🛰️ Contextual Navigator**: A fluid UI that adapts based on user intent (Lobby, Browse, or Plan).
- **🎨 Elite Pastel UI**: A premium, dark-mode-first system built on **Once UI** primitives and Tailwind CSS 4.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 (React 19), TypeScript, Once UI, Framer Motion, Tailwind CSS 4 |
| **Backend** | FastAPI (Python 3.11), SQLAlchemy, Alembic |
| **Database** | PostgreSQL (Primary) + **pgvector** (Similarity Search) |
| **Caching** | Redis (Rate Limiting & State Management) |
| **Algorithms** | NumPy (Vector Math), Minimax (Group Dynamics), Dijkstra (Routing) |
| **Maps** | Leaflet / React-Leaflet |
| **Infrastructure** | Docker, Docker Compose, Vercel |

---

## 🚀 Quick Start

### 1. Prerequisites

- **Git** & **Node.js 18+**
- **Docker Desktop** (Required for Database/Redis)
- **Python 3.11+**

### 2. Setup with Docker (Recommended)

Start the core infrastructure (PostgreSQL with pgvector and Redis):

```bash
docker-compose up -d
```

### 3. Local Development

**Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your TasteMap.

---

## ⚙️ Configuration

Create a `.env` file in the root based on `.env.example`:

```env
# --- Server ---
PORT=8000
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/tdtt_db

# --- AI & Embeddings ---
OPENAI_API_KEY=your_key_here

# --- Interaction Logic ---
SWIPE_LEARNING_RATE=0.1
GROUP_MINIMAX_MEMORY=10
```

---

## 📂 Project Structure

```
TasteMap/
├── frontend/                    # Next.js React 19 Frontend
│   ├── src/
│   │   ├── app/                # App Router (Pages & Layouts)
│   │   ├── components/         # Once UI & Feature Primitives
│   │   ├── hooks/              # Custom interaction hooks
│   │   ├── types/              # Domain-driven types
│   │   └── utils/              # Math & Routing utilities
├── backend/                     # FastAPI Backend Engine
│   ├── src/
│   │   ├── api/                # RESTful endpoints
│   │   ├── core/               # Configuration & Auth
│   │   ├── db/                 # Models & pgvector sessions
│   │   └── [features]/         # Domain logic (Feed, Locations, Recs)
├── docker-compose.yml           # Database & Redis orchestration
└── docs/                        # Technical specifications
```

---

## 🧠 The Algorithm

TasteMap isn't just a UI; it's a mathematical engine.

**Preference Evolution:**
$$\vec{U}_{new} = \vec{U}_{old} + \alpha \cdot \vec{P}$$
*Where $\alpha$ decays exponentially if "swipe-spamming" is detected via Redis.*

**Group Conflict Resolution:**
$$\min \left( \max_{i \in \text{Group}} \left| \text{Score}_i - \text{Score}_{ideal} \right| \right)$$
*This ensures that "Member A" never feels ignored when "Member B" has strong preferences.*

---

## 🤝 Contributing

We welcome contributions! Please follow our [Elite UI Guidelines](./docs/UI_GUIDELINES.md) to maintain the premium aesthetic.

1. Fork the repo and create your feature branch.
2. Ensure `npm run lint` passes (Strict Once UI Rules).
3. Submit a PR with a description of the UX improvement.

---

## 🎯 Acknowledgments

- **Once UI**: For the semantic layout framework.
- **pgvector**: For the heavy lifting in high-dimensional search.

---

<div align="center">

**Made with 💙 by HCMUS_JobSeeker**

</div>
