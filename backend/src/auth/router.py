"""
Auth router — JIT User Provisioning.

POST /sync: Nhận Supabase JWT → xác thực token → tìm hoặc tạo User trong DB nội bộ.
Dùng get_token_payload thay vì get_current_user_id để tránh nghịch lý gà-và-trứng.
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.db.database import get_db
from src.users.models import User
from src.users.schemas import UserMe
from src.core.dependencies import get_token_payload

router = APIRouter()

# Vector trung lập 15 chiều — giá trị khởi tạo cho user mới.
# Thuật toán U_new = U_old + α·P sẽ dịch chuyển vector từ đây.
_DEFAULT_VECTOR: list[float] = [0.5] * 15


@router.post(
    "/sync",
    response_model=UserMe,
    summary="JIT Provisioning — Đồng bộ User từ Supabase sang PostgreSQL",
    description=(
        "Xác thực Supabase JWT, trích xuất sub/email, "
        "sau đó tìm hoặc tạo User trong DB nội bộ. "
        "Endpoint này KHÔNG yêu cầu user đã tồn tại trong DB trước."
    ),
)
async def sync_user(
    payload: dict = Depends(get_token_payload),
    db: AsyncSession = Depends(get_db),
) -> UserMe:
    # ── 1. Trích xuất thông tin từ JWT payload ─────────────────────────────
    supabase_uid: str | None = payload.get("sub")
    user_metadata: dict = payload.get("user_metadata") or {}

    email: str | None = payload.get("email") or user_metadata.get("email")
    display_name: str | None = (
        user_metadata.get("full_name") or user_metadata.get("name")
    )
    avatar_url: str | None = (
        user_metadata.get("avatar_url") or user_metadata.get("picture")
    )

    if not supabase_uid or not email:
        raise HTTPException(
            status_code=401,
            detail="Token payload thiếu trường bắt buộc (sub, email).",
        )

    # ── 2. Tìm user theo supabase_uid ──────────────────────────────────────
    result = await db.execute(
        select(User).where(User.supabase_uid == supabase_uid)
    )
    user: User | None = result.scalar_one_or_none()

    # ── 3a. Đã tồn tại → trả về ngay ──────────────────────────────────────
    if user is not None:
        return UserMe.model_validate(user)

    # ── 3b. Chưa tồn tại → tạo mới (JIT Provisioning) ────────────────────
    # Username: phần đầu email + 4 ký tự uuid ngẫu nhiên để tránh trùng
    username_base = email.split("@")[0].replace(".", "_").lower()
    username = f"{username_base}_{uuid.uuid4().hex[:6]}"

    new_user = User(
        supabase_uid=supabase_uid,
        email=email,
        username=username,
        display_name=display_name or username_base,
        avatar_url=avatar_url,
        food_vector=_DEFAULT_VECTOR,
        place_vector=_DEFAULT_VECTOR,
        xp=0,
        level=1,
        settings={},
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return UserMe.model_validate(new_user)
