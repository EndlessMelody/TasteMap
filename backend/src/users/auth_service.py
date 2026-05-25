"""
Authentication service with password hashing and JWT token handling.
"""
from datetime import datetime, timedelta
from typing import Optional

from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.core.config import settings
from src.users.models import User
from src.users.schemas import Token, TokenPayload, UserResponse

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password for storing."""
    return pwd_context.hash(password)


def create_access_token(user_id: int, role: str = "user", expires_delta: Optional[timedelta] = None) -> Token:
    """Create a JWT access token for a user."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "sub": str(user_id),
        "role": role,
        "exp": expire,
        "type": "access",
        "iat": datetime.utcnow()
    }
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return Token(
        access_token=encoded_jwt,
        token_type="bearer",
        expires_in=int((expire - datetime.utcnow()).total_seconds())
    )


def decode_token(token: str) -> Optional[TokenPayload]:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = int(payload.get("sub"))
        role = payload.get("role", "user")
        exp = datetime.fromtimestamp(payload.get("exp"))
        token_type = payload.get("type", "access")
        
        if token_type != "access":
            return None
            
        return TokenPayload(sub=user_id, role=role, exp=exp, type=token_type)
    except (JWTError, ValueError, KeyError):
        return None


class AuthService:
    """Service for handling authentication operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate a user by email and password."""
        result = await self.db.execute(select(User).filter(User.email == email))
        user = result.scalars().first()
        
        if not user:
            return None
        
        # Check if user has a password set
        if not user.password_hash:
            return None
            
        if not verify_password(password, user.password_hash):
            return None
            
        return user
    
    async def register_user(
        self, 
        username: str, 
        email: str, 
        password: str, 
        name: Optional[str] = None
    ) -> User:
        """Register a new user with email/password."""
        # Check if email already exists
        result = await self.db.execute(select(User).filter(User.email == email))
        if result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Check if username already exists
        result = await self.db.execute(select(User).filter(User.username == username))
        if result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        
        # Create new user with hashed password
        new_user = User(
            username=username,
            email=email,
            password_hash=get_password_hash(password),
            name=name or username,
        )
        
        self.db.add(new_user)
        try:
            await self.db.commit()
            await self.db.refresh(new_user)
            return new_user
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Could not create user: {str(e)}"
            )
    
    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get a user by ID."""
        result = await self.db.execute(select(User).filter(User.id == user_id))
        return result.scalars().first()
    
    async def change_password(self, user_id: int, old_password: str, new_password: str) -> bool:
        """Change a user's password."""
        user = await self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Verify old password
        if not user.password_hash or not verify_password(old_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password"
            )
        
        # Update password
        user.password_hash = get_password_hash(new_password)
        try:
            await self.db.commit()
            return True
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Could not update password: {str(e)}"
            )


def user_to_response(user: User) -> UserResponse:
    """Convert User model to UserResponse schema."""
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        name=user.name,
        bio=user.bio,
        avatar=user.avatar,
        cover=user.cover,
        title=user.title,
        location=user.location,
        phone=user.phone,
        joined_at=user.joined_at,
        food_vector=list(user.food_vector) if user.food_vector else None,
        place_vector=list(user.place_vector) if user.place_vector else None,
        xp=user.xp,
        level=user.level
    )
