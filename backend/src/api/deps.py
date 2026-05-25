from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import get_db
from src.users.auth_service import AuthService, decode_token

# Dummy current user dependency, would normally decode JWT token
async def get_current_user(db: AsyncSession = Depends(get_db)):
    return None
