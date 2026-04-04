"""
Shared dependency injection utilities.

Supabase user access tokens dùng ES256 (Elliptic Curve, asymmetric).
Đã xác nhận qua JWKS endpoint: algorithms=['ES256'], key_type='EC'.
Dùng PyJWKClient với đúng URL /.well-known/jwks.json để lấy public key.
"""
import jwt
from jwt import PyJWKClient
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional
from src.db.database import get_db
from src.core.config import settings
from src.users.models import User

# Security scheme for Swagger UI
reusable_oauth2 = HTTPBearer()

# JWKS client — cache public key của Supabase, không gọi API mỗi request
# URL đúng: /.well-known/jwks.json (không phải /jwks — cái đó trả 401)
_JWKS_URL = f"https://{settings.SUPABASE_PROJECT_REF}.supabase.co/auth/v1/.well-known/jwks.json"
_jwks_client = PyJWKClient(_JWKS_URL, cache_keys=True)


def _decode_supabase_token(token: str) -> dict:
    """
    Decode Supabase user access token dùng JWKS (ES256 asymmetric).

    Supabase project này dùng ES256 — đã xác nhận qua:
      GET /.well-known/jwks.json → algorithms: ['ES256'], kty: 'EC'
    PyJWKClient tự cache public key → chỉ fetch lần đầu, sau đó dùng lại.
    """
    try:
        signing_key = _jwks_client.get_signing_key_from_jwt(token)
    except Exception as e:
        raise jwt.InvalidTokenError(f"Không lấy được signing key: {e}")

    return jwt.decode(
        token,
        signing_key.key,
        algorithms=["ES256", "RS256"],   # ES256 trước — đúng với project này
        audience="authenticated",
    )


async def get_token_payload(
    http_auth: HTTPAuthorizationCredentials = Depends(reusable_oauth2),
) -> dict:
    """
    Dependency nhẹ — CHỈ xác thực JWT và trả về payload dict.
    KHÔNG truy vấn Database. Dùng cho /auth/sync để tránh nghịch lý gà-và-trứng.
    """
    token = http_auth.credentials
    try:
        return _decode_supabase_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token đã hết hạn")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Token không hợp lệ: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Lỗi xác thực: {str(e)}")


async def get_current_user_id(
    http_auth: HTTPAuthorizationCredentials = Depends(reusable_oauth2),
    db: AsyncSession = Depends(get_db),
) -> int:
    """
    Xác thực JWT + tìm user trong DB nội bộ.
    1. Decode token qua JWKS (ES256).
    2. Lấy 'sub' (Supabase UUID).
    3. Map sang internal integer user_id.
    """
    token = http_auth.credentials
    try:
        payload = _decode_supabase_token(token)
        supabase_uid = payload.get("sub")
        if not supabase_uid:
            raise HTTPException(status_code=401, detail="Token không hợp lệ: thiếu 'sub'")

        result = await db.execute(select(User.id).where(User.supabase_uid == supabase_uid))
        user_id = result.scalar_one_or_none()

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="User chưa được đồng bộ. Vui lòng gọi POST /api/v1/auth/sync trước.",
            )
        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token đã hết hạn")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Token không hợp lệ: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Lỗi xác thực: {str(e)}")


async def get_optional_user_id(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> Optional[int]:
    """
    Giống get_current_user_id nhưng không bắt buộc.
    Dùng Request thủ công để tránh HTTPBearer tự raise 401 khi không có token.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1]
    try:
        payload = _decode_supabase_token(token)
        supabase_uid = payload.get("sub")
        if not supabase_uid:
            return None
        result = await db.execute(select(User.id).where(User.supabase_uid == supabase_uid))
        return result.scalar_one_or_none()
    except Exception:
        return None
