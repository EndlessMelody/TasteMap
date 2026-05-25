# Smart Travel App - System Architecture

## Overview
The Smart Travel App acts as a "Tinder for Travel", allowing users to swipe on locations/experiences, match with travel buddies, and generate optimized itineraries.

## Components
1. **Frontend**: Next.js (App Router) + Once UI
   - Handles user interactions, swipes, and real-time messaging.
2. **Backend Engine**: FastAPI
   - Serves API requests, handles authentication, and orchestrates algorithm tasks.
3. **Database**: PostgreSQL (pgvector)
   - Stores user profiles, location metadata, and vector embeddings for swiping algorithms.
4. **Algorithmic Core**: Python/Numpy
   - Computes match percentages, shortest paths (Dijkstra), and itinerary optimization.

## API Contracts
*(To be detailed as endpoints are built)*
