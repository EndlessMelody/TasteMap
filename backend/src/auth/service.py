"""
Auth Service — Stub implementation.

TODO Sprint 2: 
- Hash passwords with bcrypt before storing (hashlib.sha256 is NOT secure)
- Replace token with real JWT (python-jose or authlib)
- Add token blacklist check on logout via Redis
"""
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.users.models import User
from src.auth.schemas import LoginRequest, TokenResponse


async def login(data: LoginRequest, db: AsyncSession) -> TokenResponse:
    """
    Stub login — compares password plain text.
    Replace password_hash comparison with bcrypt.verify() in Sprint 2.
    """
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng")

    # Stub check: compare plain text (password_hash stores plain now)
    if user.password_hash and user.password_hash != data.password:
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng")

    # Stub token: just encode user_id as base64. Replace with JWT in Sprint 2.
    import base64
    token = base64.b64encode(f"user:{user.id}".encode()).decode()

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        username=user.username,
        display_name=user.display_name,
    )


async def logout(user_id: int, redis) -> dict:
    """Add token to Redis blacklist (stub: just return ok)."""
    return {"status": "ok"}
