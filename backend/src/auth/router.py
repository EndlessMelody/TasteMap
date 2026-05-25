"""
Auth router - JIT User Provisioning + Backend OTP.

POST /sync: Nhan Supabase JWT -> xac thuc token -> tim hoac tao User trong DB noi bo.
POST /register/check: Kiem tra email/username da ton tai chua.
Dung get_token_payload thay vi get_current_user_id de tranh nghich ly ga-va-trung.
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.db.database import get_db
from src.users.models import User
from src.users.schemas import UserMe, UserStats
from src.challenges.models import LevelConfig
from src.challenges.xp_service import compute_level_progress
from src.core.dependencies import get_token_payload
from src.auth.schemas import (
    SendOTPRequest, SendOTPResponse, VerifyOTPRequest, VerifyOTPResponse,
    CheckUserExistsRequest, CheckUserExistsResponse,
    ResolveEmailRequest, ResolveEmailResponse,
)
from src.users.otp_service import create_otp, verify_otp as verify_otp_code
from src.core.email_service import email_service

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

    # ── 3. Đối tượng xử lý chung cho Gamification Stats ────────────────────
    level1_res = await db.execute(select(LevelConfig).where(LevelConfig.level == 1))
    level1 = level1_res.scalar_one_or_none()
    default_xp_req = level1.xp_required if level1 else 100

    async def build_user_me(u: User) -> UserMe:
        """Build UserMe response with correctly computed relative XP."""
        progress = await compute_level_progress(db, u)
        return UserMe(
            id=u.id,
            username=u.username,
            email=u.email,
            display_name=u.display_name,
            avatar_url=u.avatar_url,
            bio=u.bio,
            cover_url=u.cover_url,
            location=u.location,
            title=u.title,
            phone=u.phone,
            xp=progress["xp_in_level"],
            level=u.level or 1,
            next_level_xp=progress["xp_for_level"],
            total_xp_earned=u.total_xp_earned or 0,
            food_vector=list(u.food_vector) if u.food_vector is not None else None,
            place_vector=list(u.place_vector) if u.place_vector is not None else None,
            role=u.role or "user",
            settings=u.settings or {},
            created_at=u.created_at,
            stats=UserStats(),
            badges=[],
        )

    async def repair_stats(u: User):
        changed = False
        if u.level is None: 
            u.level = 1
            changed = True
        if u.total_xp_earned is None: 
            u.total_xp_earned = 0
            changed = True
        if u.next_level_xp is None:
            u.next_level_xp = default_xp_req
            changed = True
        return changed

    # ── 4a. Đã tồn tại → kiểm tra repair và trả về ─────────────────────────
    if user is not None:
        if await repair_stats(user):
            await db.commit()
            await db.refresh(user)
        return await build_user_me(user)

    # ── 4b. Chưa tồn tại theo supabase_uid → kiểm tra orphaned row theo email ─
    orphaned_result = await db.execute(select(User).where(User.email == email))
    orphaned_user: User | None = orphaned_result.scalar_one_or_none()

    username_from_meta: str | None = user_metadata.get("username")
    username_base = email.split("@")[0].replace(".", "_").lower()

    if username_from_meta:
        dup = await db.execute(select(User).where(User.username == username_from_meta))
        if dup.scalar_one_or_none() is None:
            username = username_from_meta
        else:
            username = f"{username_from_meta}_{uuid.uuid4().hex[:4]}"
    else:
        username = f"{username_base}_{uuid.uuid4().hex[:6]}"

    if orphaned_user is not None:
        # Reclaim orphaned row: update supabase_uid to new Supabase account
        orphaned_user.supabase_uid = supabase_uid
        if username_from_meta:
            orphaned_user.username = username
        if display_name:
            orphaned_user.display_name = display_name
        if avatar_url:
            orphaned_user.avatar_url = avatar_url
            
        # Repair stats for orphaned user
        await repair_stats(orphaned_user)
        
        await db.commit()
        await db.refresh(orphaned_user)
        return await build_user_me(orphaned_user)

    new_user = User(
        supabase_uid=supabase_uid,
        email=email,
        username=username,
        display_name=display_name or username_from_meta or username_base,
        avatar_url=avatar_url,
        food_vector=_DEFAULT_VECTOR,
        place_vector=_DEFAULT_VECTOR,
        level=1,
        next_level_xp=default_xp_req,
        total_xp_earned=0,
        settings={},
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return await build_user_me(new_user)


@router.post(
    "/register/send-otp",
    response_model=SendOTPResponse,
    summary="Gửi OTP xác minh email khi đăng ký",
)
async def send_registration_otp(
    request: SendOTPRequest,
    db: AsyncSession = Depends(get_db),
) -> SendOTPResponse:
    # ── 1. Kiểm tra email chưa được đăng ký ───────────────────────────────
    existing_email = await db.execute(select(User).where(User.email == request.email))
    if existing_email.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # ── 2. Kiểm tra username chưa được sử dụng ────────────────────────────
    existing_username = await db.execute(select(User).where(User.username == request.username))
    if existing_username.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already taken")

    # ── 3. Tạo OTP và gửi email ────────────────────────────────────────────
    otp = await create_otp(request.email)
    await email_service.send_otp_email(request.email, otp, request.username)

    return SendOTPResponse(
        success=True,
        message="Verification code sent to your email",
        expires_in=600,
    )


@router.post(
    "/register/verify-otp",
    response_model=VerifyOTPResponse,
    summary="Xac minh ma OTP dang ky",
)
async def verify_registration_otp(
    request: VerifyOTPRequest,
) -> VerifyOTPResponse:
    is_valid = await verify_otp_code(request.email, request.otp)
    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired code. Please check the code and try again.",
        )
    return VerifyOTPResponse(success=True, message="Email verified successfully")


@router.post(
    "/resolve-email",
    response_model=ResolveEmailResponse,
    summary="Resolve username to email for login",
)
async def resolve_email(
    request: ResolveEmailRequest,
    db: AsyncSession = Depends(get_db),
) -> ResolveEmailResponse:
    result = await db.execute(select(User.email).where(User.username == request.username))
    email: str | None = result.scalar_one_or_none()
    if not email:
        raise HTTPException(status_code=404, detail="No account found with that username.")
    return ResolveEmailResponse(email=email)


@router.post(
    "/register/check",
    response_model=CheckUserExistsResponse,
    summary="Kiem tra email va username da ton tai chua",
)
async def check_user_exists(
    request: CheckUserExistsRequest,
    db: AsyncSession = Depends(get_db),
) -> CheckUserExistsResponse:
    """Kiem tra email va username co san de dang ky khong."""
    # Email uniqueness is enforced by Supabase during signUp.
    # Only check username here to avoid false positives from orphaned Postgres rows.
    username_exists = False

    existing_username = await db.execute(select(User).where(User.username == request.username))
    if existing_username.scalar_one_or_none():
        username_exists = True

    if username_exists:
        return CheckUserExistsResponse(
            available=False,
            email_exists=False,
            username_exists=True,
            message="Username already taken",
        )
    return CheckUserExistsResponse(
        available=True,
        email_exists=False,
        username_exists=False,
        message="Email and username are available",
    )
