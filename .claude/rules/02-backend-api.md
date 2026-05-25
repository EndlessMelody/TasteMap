---
trigger: always_on
---

# TasteMap Backend API Rules

## Core Philosophy

**You are a Backend API Engineer specializing in FastAPI and TasteMap's vector-first architecture.**

- **Priority 1: Type Safety** — Pydantic v2 for all request/response validation
- **Priority 2: Clear Separation** — Router/Service/Model pattern
- **Priority 3: Performance** — Async database operations, connection pooling
- **Priority 4: Documentation** — Self-documenting OpenAPI specs

---

## Project Structure

```
backend/src/
├── main.py                 # FastAPI app entry point
├── core/
│   ├── config.py          # Settings (pydantic-settings)
│   ├── security.py        # JWT, password hashing
│   └── deps.py            # Dependency injection
├── db/
│   ├── session.py         # AsyncSession factory
│   └── base.py            # SQLAlchemy base
├── api/
│   └── v1/
│       └── router.py      # API version aggregator
├── auth/
│   ├── router.py          # /auth/* endpoints
│   ├── service.py         # Business logic
│   ├── models.py          # SQLAlchemy tables
│   └── schemas.py         # Pydantic models
├── groups/                # Group lobby feature
├── locations/             # Location discovery
├── recommendations/       # AI recommendations
├── swipes/                # Swipe tracking
├── tours/                 # Tour building
└── users/                 # User management
```

---

## Router Pattern

### File Structure

```python
# backend/src/groups/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.deps import get_db, get_current_user
from ..db.session import get_async_session
from . import schemas, service

router = APIRouter(prefix="/groups", tags=["groups"])


@router.get(
    "",
    response_model=schemas.GroupListResponse,
    summary="List available groups",
    description="Returns public groups and user's private groups"
)
async def list_groups(
    public_only: bool = False,
    db: AsyncSession = Depends(get_async_session),
    current_user = Depends(get_current_user)
):
    """List groups with optional filtering."""
    groups = await service.list_groups(
        db=db,
        user_id=current_user.id,
        public_only=public_only
    )
    return {"success": True, "data": groups}


@router.post(
    "",
    response_model=schemas.GroupResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new group"
)
async def create_group(
    request: schemas.GroupCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user = Depends(get_current_user)
):
    """Create a new group lobby room."""
    group = await service.create_group(
        db=db,
        host_id=current_user.id,
        data=request
    )
    return {"success": True, "data": group}


@router.post(
    "/join-by-code",
    response_model=schemas.GroupResponse,
    summary="Join group by invite code"
)
async def join_by_code(
    request: schemas.JoinByCodeRequest,
    db: AsyncSession = Depends(get_async_session),
    current_user = Depends(get_current_user)
):
    """Join a private group using invite code."""
    group = await service.join_by_code(
        db=db,
        user_id=current_user.id,
        code=request.code
    )
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid invite code or group not found"
        )
    return {"success": True, "data": group}
```

### Key Principles

1. **Prefix Declaration:** Always use `prefix` in `APIRouter()`
2. **HTTP Status:** Use `status_code` parameter for non-200 responses
3. **Response Models:** Always specify `response_model`
4. **Async/Await:** All database operations must be async
5. **Dependency Injection:** Use `Depends()` for db sessions and auth

---

## Service Layer Pattern

### File Structure

```python
# backend/src/groups/service.py
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload

from . import models, schemas
from ..users.models import User


async def list_groups(
    db: AsyncSession,
    user_id: int,
    public_only: bool = False
) -> List[models.Group]:
    """List groups with filtering."""
    query = select(models.Group).options(
        selectinload(models.Group.members),
        selectinload(models.Group.host)
    )
    
    if public_only:
        query = query.where(models.Group.is_public == True)
    else:
        # Show public groups + user's own groups
        query = query.where(
            or_(
                models.Group.is_public == True,
                models.Group.host_id == user_id
            )
        )
    
    result = await db.execute(query)
    return result.scalars().all()


async def create_group(
    db: AsyncSession,
    host_id: int,
    data: schemas.GroupCreate
) -> models.Group:
    """Create a new group room."""
    group = models.Group(
        name=data.name,
        description=data.description,
        host_id=host_id,
        is_public=data.is_public,
        invite_code=_generate_invite_code() if not data.is_public else None
    )
    
    # Add host as first member
    host = await db.get(User, host_id)
    group.members.append(host)
    
    db.add(group)
    await db.commit()
    await db.refresh(group)
    return group


def _generate_invite_code(length: int = 8) -> str:
    """Generate random invite code."""
    import secrets
    import string
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) 
                   for _ in range(length))


async def join_by_code(
    db: AsyncSession,
    user_id: int,
    code: str
) -> Optional[models.Group]:
    """Join group using invite code."""
    query = select(models.Group).where(
        and_(
            models.Group.invite_code == code,
            models.Group.is_public == False
        )
    ).options(selectinload(models.Group.members))
    
    result = await db.execute(query)
    group = result.scalar_one_or_none()
    
    if group:
        user = await db.get(User, user_id)
        if user not in group.members:
            group.members.append(user)
            await db.commit()
            await db.refresh(group)
    
    return group
```

### Service Layer Principles

1. **Pure Business Logic:** No HTTP-specific code in services
2. **Type Hints:** Always use return types and parameter types
3. **Optional Pattern:** Return `Optional[Model]` for "not found" cases
4. **Eager Loading:** Use `selectinload()` for relationships to avoid N+1
5. **Atomic Operations:** Handle database transactions in services

---

## Schema Pattern (Pydantic v2)

### File Structure

```python
# backend/src/groups/schemas.py
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


# ─────────────────────────────────────────
# Base Schemas (shared fields)
# ─────────────────────────────────────────

class GroupBase(BaseModel):
    """Base group fields."""
    name: str = Field(..., min_length=1, max_length=100, 
                      description="Group name")
    description: Optional[str] = Field(None, max_length=500,
                                       description="Group description")
    is_public: bool = Field(default=True, 
                            description="Public or private room")


# ─────────────────────────────────────────
# Request Schemas (API input)
# ─────────────────────────────────────────

class GroupCreate(GroupBase):
    """Schema for creating a group."""
    pass


class JoinByCodeRequest(BaseModel):
    """Schema for joining by invite code."""
    code: str = Field(..., min_length=6, max_length=16,
                      pattern=r'^[A-Z0-9-]+$',
                      description="Invite code (e.g., 'SQUAD-X9K2')")


class GroupUpdate(BaseModel):
    """Schema for updating group (all fields optional)."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    is_public: Optional[bool] = None


# ─────────────────────────────────────────
# Response Schemas (API output)
# ─────────────────────────────────────────

class UserBrief(BaseModel):
    """Brief user info for nested responses."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    username: str
    avatar_url: Optional[str] = None


class GroupMember(UserBrief):
    """Group member with additional context."""
    is_ready: bool = False
    is_speaking: bool = False


class GroupResponse(BaseModel):
    """Full group response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    description: Optional[str]
    is_public: bool
    invite_code: Optional[str]
    host_id: int
    host: UserBrief
    members: List[GroupMember]
    member_count: int
    created_at: datetime
    updated_at: datetime


# ─────────────────────────────────────────
# List Response
# ─────────────────────────────────────────

class GroupListResponse(BaseModel):
    """Response for group list endpoint."""
    success: bool = True
    data: List[GroupResponse]
    total: int


# ─────────────────────────────────────────
# Error Response
# ─────────────────────────────────────────

class ErrorResponse(BaseModel):
    """Standard error response."""
    success: bool = False
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None
```

### Schema Principles

1. **Inheritance:** Use Base → Create/Update/Response hierarchy
2. **Field Validation:** Use `Field()` for constraints (min_length, pattern)
3. **ConfigDict:** Use `from_attributes=True` for SQLAlchemy compatibility
4. **Optional vs Required:** Use `Optional` for nullable fields
5. **Descriptions:** Add descriptions for OpenAPI docs

---

## Authentication Pattern

### JWT Token Validation

```python
# backend/src/core/security.py
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")


def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except JWTError:
        return None
```

### Dependency Injection

```python
# backend/src/core/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from .security import verify_token
from .config import settings
from ..db.session import get_async_session
from ..users.models import User

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_async_session)
) -> User:
    """Validate JWT and return current user."""
    token = credentials.credentials
    
    # Support Supabase JWT format
    if settings.SUPABASE_JWT_SECRET:
        payload = verify_supabase_token(token)
    else:
        payload = verify_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    user = await db.get(User, int(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_async_session)
) -> Optional[User]:
    """Optional authentication (returns None if not authenticated)."""
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None
```

---

## Error Handling

### HTTP Exceptions

```python
from fastapi import HTTPException, status

# Common error patterns
raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Resource not found"
)

raise HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Not authorized to perform this action"
)

raise HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Invalid request data"
)

raise HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail="Resource already exists"
)
```

### Global Exception Handler

```python
# backend/src/main.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors gracefully."""
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if settings.DEBUG else None
        }
    )
```

---

## Background Tasks

### For Heavy Operations

```python
from fastapi import BackgroundTasks

@router.post("/recommendations")
async def get_recommendations(
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Get recommendations (heavy computation in background)."""
    # Quick response
    cached = await get_cached_recommendations(current_user.id)
    if cached:
        return {"success": True, "data": cached}
    
    # Queue background computation
    background_tasks.add_task(
        compute_recommendations,
        user_id=current_user.id,
        db=db
    )
    
    return {
        "success": True,
        "data": [],
        "message": "Recommendations computing in background"
    }
```

---

## Testing Patterns

### Async Test Setup

```python
# tests/test_groups.py
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

@pytest.mark.asyncio
async def test_create_group(
    client: AsyncClient,
    db: AsyncSession,
    auth_headers: dict
):
    """Test group creation."""
    response = await client.post(
        "/api/v1/groups",
        json={
            "name": "Test Group",
            "description": "A test group",
            "is_public": True
        },
        headers=auth_headers
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["name"] == "Test Group"
```

---

## Common Patterns Reference

### Database Query Patterns

```python
# Get by ID
user = await db.get(User, user_id)

# Select with filter
query = select(User).where(User.email == email)
result = await db.execute(query)
user = result.scalar_one_or_none()

# Select with multiple filters
query = select(Location).where(
    and_(
        Location.city == city,
        Location.is_active == True
    )
)

# Select with eager loading
query = select(Group).options(
    selectinload(Group.members),
    selectinload(Group.host)
)

# Count
query = select(func.count(User.id)).where(User.is_active == True)
result = await db.execute(query)
count = result.scalar()
```

### Relationship Handling

```python
# Many-to-many: Add member
group.members.append(user)
await db.commit()

# One-to-many: Create with parent
post = Post(
    title="Title",
    author_id=current_user.id,
    author=current_user  # Optional but explicit
)
```

---

## File References

**Key Backend Files:**
- `backend/src/main.py` - FastAPI app
- `backend/src/core/deps.py` - Dependencies
- `backend/src/core/config.py` - Settings
- `backend/src/groups/router.py` - Group endpoints
- `backend/src/groups/service.py` - Group business logic
- `backend/src/groups/schemas.py` - Group Pydantic models
- `backend/src/groups/models.py` - Group SQLAlchemy models

**API Entry Points:**
- `backend/src/api/v1/router.py` - API version aggregator
