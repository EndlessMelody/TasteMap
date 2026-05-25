# TasteMap flows (Business Logic & Workflows)

> **Single Source of Truth (SSOT)**
> This directory acts as the authoritative reference for all **System Workflows, Business Logic, and Algorithmic Processes**. AI Agents and Developers MUST consult these documents to understand *how* features work sequentially, complementing the static schemas defined in `docs/api/` and `docs/database_schema/`.

---

## Workflow Matrix (Under Construction)

The following workflows outline the exact sequencing between the User Interface, APIs, and Database.

| Domain                 | Status  | File Reference                               | Description                                                                 |
| :--------------------- | :------ | :------------------------------------------- | :-------------------------------------------------------------------------- |
| **Authentication**     | Active  | `auth_registration.md`                       | OTP Verification, Supabase Auth integration, and PostgreSQL JIT Provisioning. |
| **Discovery / Swipes** | Active  | `discovery_swipe.md`                          | Swipe engine, Vector learning (U=U+αP), Super Like, batching, Tour finalization. |
| **Group Lobby**        | Planned | `group_lobby.md` (TBD)                       | Real-time WebSocket room dynamics, Minimax arbitration, and "Tour DNA". |
| **Tour Building**      | Planned | `tour_optimization.md` (TBD)                 | Route optimization via Dijkstra's algorithm, constraint evaluation.          |
| **Social**             | Active  | `social_profile.md`               | Friend requests, unlocking badges, and feed interactions.                    |
| **Gamification**       | Active  | `challenges_gamification.md`                 | XP & Leveling, Challenge auto-enrollment, Streak check-ins, Leaderboards.    |

---

## Development Protocol

When implementing or modifying any complex feature:
1. **Check Flows First:** Understand the intended operational sequence before writing code.
2. **Update on Change:** If a new operational step or algorithmic modification occurs, YOU MUST UPDATE the corresponding flow document here.

*(Migration Note: Detailed logic is currently being transitioned from legacy root documents into this module).*
