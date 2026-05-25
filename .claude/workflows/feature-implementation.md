---
description: Complete full-stack feature development workflow
---

# Feature Implementation Workflow

End-to-end workflow for implementing TasteMap features across frontend, backend, and database layers.

## When to Use

Use this workflow when:
- Implementing new user-facing features
- Adding complete CRUD functionality
- Building multi-component features (e.g., Group Lobby, Tour Builder)
- Creating features that span API → DB → UI

## Prerequisites

Before starting:
1. Review `00-tastemap-context.md` for project overview
2. Identify affected domains (UI, API, DB, AI)
3. Have API contract draft ready (if applicable)

## Steps

### 1. Requirements Analysis

Analyze the feature request and identify scope.

**Actions:**
- [ ] Read existing code in affected domains
- [ ] Identify required database changes
- [ ] Map out API endpoints needed
- [ ] List frontend components required
- [ ] Check for AI/algorithm requirements

**Output:** Requirements checklist with affected files

**Prompt Template:**
```
Analyze this feature request: {FEATURE_DESCRIPTION}

1. What database tables/models need changes?
2. What API endpoints are required?
3. What frontend components need creation/modification?
4. Does this involve AI algorithms (vectors, minimax)?
5. Are there real-time features (WebSocket)?
6. What existing files should I examine first?

Return a structured checklist.
```

---

### 2. Design API Contract

Define the API interface between frontend and backend.

**Actions:**
- [ ] Define Pydantic request schemas (validate with Field())
- [ ] Define Pydantic response schemas
- [ ] Document endpoint paths and methods
- [ ] Define error response structures
- [ ] Add OpenAPI descriptions

**Rules (from `02-backend-api.md`):**
- Separate Base/Create/Update/Response schemas
- Use type hints everywhere
- Add Field() validation (min_length, pattern, etc.)
- Use ConfigDict(from_attributes=True) for ORM compatibility

**Output:** `schemas.py` file with all Pydantic models

**Example:**
```python
# backend/src/features/schemas.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List

class FeatureBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)

class FeatureCreate(FeatureBase):
    pass

class FeatureResponse(FeatureBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
```

---

### 3. Database Schema Design

Design SQLAlchemy models and migration.

**Actions:**
- [ ] Define SQLAlchemy 2.0 mapped models
- [ ] Add vector columns if needed (pgvector.Vector)
- [ ] Create indexes (especially for vectors)
- [ ] Define relationships with proper lazy loading
- [ ] Generate Alembic migration

**Rules (from `03-database-vectors.md`):**
- Use `Mapped[type]` and `mapped_column()` syntax
- Add comments explaining vector dimensions
- Create IVFFlat/HNSW indexes for vector columns
- Use `selectinload` for relationships to avoid N+1

**Output:**
- `models.py` with SQLAlchemy models
- Alembic migration file in `backend/alembic/versions/`

**Example:**
```python
# backend/src/features/models.py
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

class Feature(Base):
    __tablename__ = "features"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    
    # Vector field with index
    embedding: Mapped[List[float]] = mapped_column(Vector(15))
    
    __table_args__ = (
        Index('ix_features_embedding', 'embedding', 
              postgresql_using='ivfflat', postgresql_with={'lists': 100}),
    )
```

---

### 4. Backend Implementation

Implement service layer and API endpoints.

**Actions:**
- [ ] Create service functions (pure business logic)
- [ ] Implement API router with proper HTTP methods
- [ ] Add dependency injection (db, current_user)
- [ ] Handle errors with HTTPException
- [ ] Add async/await throughout

**Rules (from `02-backend-api.md`):**
- Use `APIRouter(prefix="/features")`
- Service layer: no HTTP-specific code
- Use `selectinload()` for eager loading
- Return proper HTTP status codes

**Output:**
- `service.py` with business logic
- `router.py` with API endpoints

**File Structure:**
```python
# service.py
async def create_feature(db: AsyncSession, user_id: int, data: FeatureCreate):
    feature = Feature(**data.model_dump(), owner_id=user_id)
    db.add(feature)
    await db.commit()
    await db.refresh(feature)
    return feature

# router.py
@router.post("", response_model=FeatureResponse, status_code=201)
async def create_feature_endpoint(
    request: FeatureCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user = Depends(get_current_user)
):
    feature = await service.create_feature(db, current_user.id, request)
    return {"success": True, "data": feature}
```

---

### 5. Frontend Components

Build UI components with Once UI.

**Actions:**
- [ ] Identify Once UI primitives needed
- [ ] Define TypeScript props interface
- [ ] Implement semantic layout (Column/Row/Grid)
- [ ] Add Framer Motion if interactive
- [ ] Create barrel export in index.ts

**Rules (from `01-frontend-ui.md`):**
- **Never use `<div>`** - use `<Column>`, `<Row>`, `<Grid>`
- Use spacing tokens: "4", "8", "16", "24", "32", "40", "64"
- Use `fillWidth`/`fillHeight` instead of Tailwind
- Use `background`/`onBackground` for colors
- Spread Flex props for component flexibility

**Output:**
- Feature components in `frontend/src/components/features/{domain}/`
- Barrel export in `index.ts`

**Example:**
```tsx
// components/features/feature/FeatureCard.tsx
import { Column, Row, Heading, Text, Button } from '@/once-ui/components';

interface FeatureCardProps {
  name: string;
  description: string;
  onAction: () => void;
}

export function FeatureCard({ name, description, onAction }: FeatureCardProps) {
  return (
    <Column background="surface" padding="24" gap="16" radius="l" fillWidth>
      <Heading variant="display-strong-m">{name}</Heading>
      <Text variant="body-default-m" onBackground="neutral-medium">
        {description}
      </Text>
      <Button onClick={onAction} variant="primary">
        Action
      </Button>
    </Column>
  );
}

// index.ts
export { FeatureCard } from './FeatureCard';
export { FeatureList } from './FeatureList';
```

---

### 6. API Integration

Connect frontend to backend API.

**Actions:**
- [ ] Add API call using `api.ts` helpers
- [ ] Handle loading states
- [ ] Handle error states with proper UI
- [ ] Add TypeScript types for API responses
- [ ] Implement optimistic updates if applicable

**Rules:**
- Use `apiGet`, `apiPost` from `@/lib/api`
- Show loading spinners during requests
- Display user-friendly error messages
- Type API responses with interfaces

**Output:** Updated component with API integration

**Example:**
```tsx
import { apiPost } from '@/lib/api';
import { useState } from 'react';

export function FeatureCreator() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleCreate = async (data: FeatureCreate) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiPost('/features', data);
      // Handle success
    } catch (err) {
      setError(err.message || 'Failed to create');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Column gap="16">
      {error && (
        <Text variant="body-default-s" style={{ color: 'red' }}>
          {error}
        </Text>
      )}
      <Button onClick={() => handleCreate(formData)} disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create'}
      </Button>
    </Column>
  );
}
```

---

### 7. Real-time Integration (if applicable)

Add WebSocket for live updates.

**Actions:**
- [ ] Set up WebSocket connection hook
- [ ] Handle connection lifecycle
- [ ] Implement message handlers
- [ ] Broadcast updates to room members
- [ ] Handle reconnection logic

**Rules (from `05-realtime-websocket.md`):**
- Use heartbeat/ping-pong for connection health
- Broadcast state changes to all room members
- Handle disconnect gracefully
- Use Redis pub/sub for multi-server scaling

**Output:**
- WebSocket hook in `frontend/src/hooks/`
- Backend WebSocket endpoint

**Example:**
```typescript
// hooks/useFeatureWebSocket.ts
export function useFeatureWebSocket(featureId: number) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    const ws = new WebSocket(`ws://.../ws/features/${featureId}`);
    wsRef.current = ws;
    
    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      // Handle message types
    };
    
    return () => ws.close();
  }, [featureId]);
  
  return { isConnected, sendMessage: wsRef.current?.send.bind(wsRef.current) };
}
```

---

### 8. Testing

Add tests for critical paths.

**Actions:**
- [ ] Add unit tests for service functions
- [ ] Add API endpoint tests
- [ ] Add frontend component tests
- [ ] Run integration tests

**Commands:**
```bash
# Backend tests
cd backend && pytest tests/test_features.py -v

# Frontend tests
cd frontend && npm test -- FeatureCard.test.tsx

# Integration
cd backend && pytest tests/integration/test_feature_flow.py -v
```

---

### 9. Documentation

Update documentation for the feature.

**Actions:**
- [ ] Add OpenAPI docstrings to endpoints
- [ ] Update README if needed
- [ ] Add inline code comments
- [ ] Document any new environment variables

---

## Completion Checklist

Before marking complete:
- [ ] API contract documented in schemas
- [ ] Database migration generated and tested
- [ ] Backend endpoints implemented and tested
- [ ] Frontend components built with Once UI
- [ ] API integration working end-to-end
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] WebSocket working (if applicable)
- [ ] Tests passing
- [ ] Code follows TasteMap style rules

## Troubleshooting

**Database migration fails:**
```bash
cd backend && alembic downgrade -1  # Roll back
cd backend && alembic revision --autogenerate -m "fix migration"  # Recreate
```

**API not connecting:**
- Check `NEXT_PUBLIC_API_URL` in frontend `.env`
- Verify backend CORS settings
- Check JWT token is valid

**WebSocket disconnects:**
- Check heartbeat interval
- Verify Redis is running (for multi-server)
- Check network proxy settings
