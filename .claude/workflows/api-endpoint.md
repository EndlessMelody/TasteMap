---
description: Backend API endpoint creation workflow
---

# API Endpoint Creation Workflow

Workflow for creating FastAPI endpoints with proper structure, validation, and documentation.

## When to Use

Use this workflow when:
- Adding new REST API endpoints
- Creating CRUD operations for a resource
- Building endpoints that need authentication
- Implementing endpoints with complex validation

## Prerequisites

Before starting:
1. Review `02-backend-api.md` for FastAPI patterns
2. Have database models ready (or create them first)
3. Understand the API contract (request/response shapes)

## Steps

### 1. Define Pydantic Schemas

Create request and response models.

**Actions:**
- [ ] Create `schemas.py` file if doesn't exist
- [ ] Define Base schema with common fields
- [ ] Define Create/Update request schemas
- [ ] Define Response schema with ConfigDict
- [ ] Add Field() validation (min_length, pattern, etc.)

**Rules (from `02-backend-api.md`):**
- Use Pydantic v2 (BaseModel, ConfigDict)
- Inherit from Base → Create/Update/Response
- Add `from_attributes=True` for ORM compatibility
- Use type hints everywhere
- Document with Field descriptions

**Output:** Complete `schemas.py`

**Example:**
```python
# backend/src/features/schemas.py
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class FeatureBase(BaseModel):
    """Base schema with common fields."""
    name: str = Field(
        ..., 
        min_length=1, 
        max_length=100,
        description="Feature display name"
    )
    description: Optional[str] = Field(
        None,
        max_length=500,
        description="Detailed description"
    )
    is_active: bool = Field(
        default=True,
        description="Whether feature is enabled"
    )


class FeatureCreate(FeatureBase):
    """Schema for creating a feature."""
    category_id: int = Field(
        ...,
        ge=1,
        description="Parent category ID"
    )


class FeatureUpdate(BaseModel):
    """Schema for updating a feature (all fields optional)."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class UserBrief(BaseModel):
    """Nested user info for responses."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    username: str
    avatar_url: Optional[str] = None


class FeatureResponse(FeatureBase):
    """Full feature response with relations."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    category_id: int
    owner: UserBrief
    created_at: datetime
    updated_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "Premium Analytics",
                "description": "Advanced analytics dashboard",
                "is_active": True,
                "category_id": 5,
                "owner": {"id": 1, "username": "admin"},
                "created_at": "2024-01-15T10:00:00",
                "updated_at": "2024-01-15T10:00:00"
            }
        }


class FeatureListResponse(BaseModel):
    """Paginated list response."""
    success: bool = True
    data: List[FeatureResponse]
    total: int
    page: int
    per_page: int


class ErrorResponse(BaseModel):
    """Standard error response."""
    success: bool = False
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None
```

---

### 2. Implement Service Layer

Create business logic functions.

**Actions:**
- [ ] Create `service.py` if doesn't exist
- [ ] Implement CRUD operations (async)
- [ ] Add type hints to all functions
- [ ] Handle database errors gracefully
- [ ] Add eager loading for relationships

**Rules:**
- Pure business logic (no HTTP code)
- Return models, not dicts
- Use `selectinload()` for relationships
- Handle `None` returns for "not found"

**Output:** `service.py` with business logic

**Example:**
```python
# backend/src/features/service.py
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload

from . import models, schemas
from ..users.models import User


async def get_feature(
    db: AsyncSession,
    feature_id: int
) -> Optional[models.Feature]:
    """Get feature by ID with owner."""
    query = select(models.Feature).where(
        models.Feature.id == feature_id
    ).options(
        selectinload(models.Feature.owner)
    )
    
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def list_features(
    db: AsyncSession,
    user_id: int,
    category_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100
) -> tuple[List[models.Feature], int]:
    """
    List features with filtering and pagination.
    
    Returns: (features_list, total_count)
    """
    # Build base query
    base_query = select(models.Feature).where(
        or_(
            models.Feature.is_public == True,
            models.Feature.owner_id == user_id
        )
    )
    
    # Apply filters
    if category_id:
        base_query = base_query.where(
            models.Feature.category_id == category_id
        )
    
    if is_active is not None:
        base_query = base_query.where(
            models.Feature.is_active == is_active
        )
    
    # Get total count
    count_query = select(func.count()).select_from(base_query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Get paginated results with owner
    query = base_query.options(
        selectinload(models.Feature.owner)
    ).offset(skip).limit(limit).order_by(
        models.Feature.created_at.desc()
    )
    
    result = await db.execute(query)
    features = result.scalars().all()
    
    return list(features), total


async def create_feature(
    db: AsyncSession,
    owner_id: int,
    data: schemas.FeatureCreate
) -> models.Feature:
    """Create new feature."""
    feature = models.Feature(
        name=data.name,
        description=data.description,
        is_active=data.is_active,
        category_id=data.category_id,
        owner_id=owner_id
    )
    
    db.add(feature)
    await db.commit()
    await db.refresh(feature)
    
    # Reload with relationships
    return await get_feature(db, feature.id)


async def update_feature(
    db: AsyncSession,
    feature_id: int,
    data: schemas.FeatureUpdate
) -> Optional[models.Feature]:
    """Update feature (partial update)."""
    feature = await get_feature(db, feature_id)
    if not feature:
        return None
    
    # Update only provided fields
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(feature, field, value)
    
    await db.commit()
    await db.refresh(feature)
    return feature


async def delete_feature(
    db: AsyncSession,
    feature_id: int
) -> bool:
    """Delete feature. Returns True if deleted."""
    feature = await get_feature(db, feature_id)
    if not feature:
        return False
    
    await db.delete(feature)
    await db.commit()
    return True


async def check_feature_ownership(
    db: AsyncSession,
    feature_id: int,
    user_id: int
) -> bool:
    """Check if user owns the feature."""
    feature = await get_feature(db, feature_id)
    return feature is not None and feature.owner_id == user_id
```

---

### 3. Create API Router

Implement HTTP endpoints.

**Actions:**
- [ ] Create `router.py` with APIRouter
- [ ] Add CRUD endpoints (POST, GET, PATCH, DELETE)
- [ ] Use dependency injection for db/auth
- [ ] Add proper HTTP status codes
- [ ] Include OpenAPI documentation

**Rules:**
- Use `prefix` in APIRouter
- Always use `response_model`
- Use `Depends(get_async_session)` for DB
- Use `Depends(get_current_user)` for auth
- Return consistent response format

**Output:** `router.py` with endpoints

**Example:**
```python
# backend/src/features/router.py
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from ..core.deps import get_async_session, get_current_user
from ..users.models import User
from . import schemas, service

router = APIRouter(
    prefix="/features",
    tags=["features"],
    responses={
        401: {"model": schemas.ErrorResponse, "description": "Unauthorized"},
        403: {"model": schemas.ErrorResponse, "description": "Forbidden"},
        404: {"model": schemas.ErrorResponse, "description": "Not Found"},
    }
)


@router.get(
    "",
    response_model=schemas.FeatureListResponse,
    summary="List features",
    description="Get paginated list of features with optional filtering"")
async def list_features(
    category_id: Optional[int] = Query(None, description="Filter by category"),
    is_active: Optional[bool] = Query(None, description="Filter by status"),
    skip: int = Query(0, ge=0, description="Items to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Items per page"),
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """List features accessible to current user."""
    features, total = await service.list_features(
        db=db,
        user_id=current_user.id,
        category_id=category_id,
        is_active=is_active,
        skip=skip,
        limit=limit
    )
    
    return {
        "success": True,
        "data": features,
        "total": total,
        "page": skip // limit + 1,
        "per_page": limit
    }


@router.get(
    "/{feature_id}",
    response_model=schemas.FeatureResponse,
    summary="Get feature by ID",
    responses={
        404: {"description": "Feature not found"}
    }
)
async def get_feature(
    feature_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """Get single feature by ID."""
    feature = await service.get_feature(db, feature_id)
    
    if not feature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature not found"
        )
    
    # Check access (owner or public)
    if not feature.is_public and feature.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this feature"
        )
    
    return {"success": True, "data": feature}


@router.post(
    "",
    response_model=schemas.FeatureResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create feature",
    description="Create a new feature (authenticated users only)"
)
async def create_feature(
    request: schemas.FeatureCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """Create new feature."""
    feature = await service.create_feature(
        db=db,
        owner_id=current_user.id,
        data=request
    )
    
    return {"success": True, "data": feature}


@router.patch(
    "/{feature_id}",
    response_model=schemas.FeatureResponse,
    summary="Update feature",
    responses={
        404: {"description": "Feature not found"},
        403: {"description": "Not owner"}
    }
)
async def update_feature(
    feature_id: int,
    request: schemas.FeatureUpdate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """Update feature (owner only)."""
    # Check ownership
    is_owner = await service.check_feature_ownership(
        db, feature_id, current_user.id
    )
    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the owner can update this feature"
        )
    
    feature = await service.update_feature(db, feature_id, request)
    if not feature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature not found"
        )
    
    return {"success": True, "data": feature}


@router.delete(
    "/{feature_id}",
    summary="Delete feature",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        404: {"description": "Feature not found"},
        403: {"description": "Not owner"}
    }
)
async def delete_feature(
    feature_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """Delete feature (owner only)."""
    # Check ownership
    is_owner = await service.check_feature_ownership(
        db, feature_id, current_user.id
    )
    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the owner can delete this feature"
        )
    
    deleted = await service.delete_feature(db, feature_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature not found"
        )
    
    return None  # 204 No Content
```

---

### 4. Register Router

Add router to main API.

**Actions:**
- [ ] Import router in `backend/src/api/v1/router.py`
- [ ] Include router with prefix

**Example:**
```python
# backend/src/api/v1/router.py
from fastapi import APIRouter

from ...features.router import router as features_router
from ...groups.router import router as groups_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(features_router, prefix="/features")
api_router.include_router(groups_router, prefix="/groups")
```

---

### 5. Add Tests

Create tests for endpoints.

**Actions:**
- [ ] Create `tests/test_features.py`
- [ ] Test GET list endpoint
- [ ] Test GET single endpoint
- [ ] Test POST create endpoint
- [ ] Test PATCH update endpoint
- [ ] Test DELETE endpoint
- [ ] Test auth requirements
- [ ] Test permission checks

**Output:** Test file

**Example:**
```python
# tests/test_features.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_features(client: AsyncClient, auth_headers):
    """Test listing features."""
    response = await client.get(
        "/api/v1/features",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "data" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_create_feature(client: AsyncClient, auth_headers):
    """Test creating a feature."""
    response = await client.post(
        "/api/v1/features",
        json={
            "name": "Test Feature",
            "description": "Test description",
            "category_id": 1
        },
        headers=auth_headers
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["name"] == "Test Feature"


@pytest.mark.asyncio
async def test_get_feature_not_found(client: AsyncClient, auth_headers):
    """Test 404 for non-existent feature."""
    response = await client.get(
        "/api/v1/features/99999",
        headers=auth_headers
    )
    
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_unauthorized_access(client: AsyncClient):
    """Test auth required."""
    response = await client.get("/api/v1/features")
    
    assert response.status_code == 401
```

---

### 6. Verify OpenAPI

Check documentation is generated correctly.

**Actions:**
- [ ] Start backend server
- [ ] Visit `http://localhost:8000/docs`
- [ ] Verify schemas are documented
- [ ] Test endpoints via Swagger UI
- [ ] Check request/response examples

**Commands:**
```bash
cd backend
uvicorn src.main:app --reload

# Visit http://localhost:8000/docs
```

---

## Common Patterns

### Search Endpoint

```python
@router.get("/search", response_model=FeatureListResponse)
async def search_features(
    q: str = Query(..., min_length=2, description="Search query"),
    db: AsyncSession = Depends(get_async_session)
):
    """Search features by name/description."""
    features = await service.search_features(db, q)
    return {"success": True, "data": features, "total": len(features)}
```

### Bulk Operations

```python
@router.post("/bulk", response_model=BulkResponse)
async def bulk_create_features(
    requests: List[schemas.FeatureCreate],
    db: AsyncSession = Depends(get_async_session)
):
    """Create multiple features."""
    results = await service.bulk_create(db, requests)
    return {"success": True, "created": len(results)}
```

### File Upload

```python
from fastapi import File, UploadFile

@router.post("/{feature_id}/upload")
async def upload_feature_image(
    feature_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_async_session)
):
    """Upload feature image."""
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "Only images allowed")
    
    # Save file, update feature
    image_url = await service.save_upload(file)
    await service.update_feature_image(db, feature_id, image_url)
    
    return {"success": True, "image_url": image_url}
```

---

## Troubleshooting

**Schema validation errors:**
- Check Field() constraints match database limits
- Ensure optional fields are marked with `Optional[...]`
- Use `exclude_unset=True` in model_dump() for PATCH

**Database connection errors:**
- Verify `DATABASE_URL` in `.env`
- Check database is running
- Ensure `get_async_session` dependency is correct

**Authentication not working:**
- Check JWT secret matches between Supabase and backend
- Verify auth token is passed in Authorization header
- Test token with `/auth/me` endpoint

**N+1 query problems:**
- Add `selectinload()` for all relationships in queries
- Check SQL logs in debug mode
- Use `joinedload()` for single relationships
