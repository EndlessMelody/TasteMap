"""
Authentication router with /login and /register endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.database import get_db
from src.users.auth_service import AuthService, create_access_token, user_to_response, decode_token
from src.users.schemas import (
    LoginRequest, RegisterRequest, AuthResponse, Token, UserResponse,
    SendOTPRequest, SendOTPResponse, VerifyOTPRequest, VerifyOTPResponse,
    CheckEmailVerifiedRequest, CheckEmailVerifiedResponse
)
from src.users.otp_service import create_otp, verify_otp, is_email_verified
from src.core.email_service import email_service

router = APIRouter(prefix="/auth", tags=["authentication"])

# OAuth2 scheme for token URL
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(db)


@router.post("/register", response_model=AuthResponse)
async def register(
    request: RegisterRequest,
    service: AuthService = Depends(get_auth_service)
):
    """
    Register a new user account.
    
    - **username**: Unique username
    - **email**: Valid email address
    - **password**: Password (will be hashed)
    - **confirm_password**: Confirm password (must match password)
    - **name**: Optional display name
    - **otp_verified**: Must be True after verifying OTP
    
    Returns access token and user info on success.
    """
    # Check password match
    if request.password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Check OTP verified
    if not request.otp_verified:
        # Double-check if email was actually verified
        if not await is_email_verified(request.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not verified. Please verify OTP first."
            )
    
    # Create user with password
    user = await service.register_user(
        username=request.username,
        email=request.email,
        password=request.password,
        name=request.name
    )
    
    # Clear verification status after successful registration
    from src.users.otp_service import clear_verification
    await clear_verification(request.email)
    
    # Create access token
    token = create_access_token(user.id)
    
    return AuthResponse(
        token=token,
        user=user_to_response(user)
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    request: LoginRequest,
    service: AuthService = Depends(get_auth_service)
):
    """
    Login with email and password.
    
    - **email**: User's email address
    - **password**: User's password
    
    Returns access token and user info on success.
    """
    # Authenticate user
    user = await service.authenticate_user(request.email, request.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    token = create_access_token(user.id)
    
    return AuthResponse(
        token=token,
        user=user_to_response(user)
    )


@router.post("/login/oauth", response_model=AuthResponse)
async def login_oauth(
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service)
):
    """
    OAuth2 compatible token login, returns an access token.
    
    This endpoint is for OAuth2 clients (like Swagger UI).
    Use /auth/login for JSON-based login.
    """
    # OAuth2 form uses username field for email
    user = await service.authenticate_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = create_access_token(user.id)
    
    return AuthResponse(
        token=token,
        user=user_to_response(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    token: str = Depends(oauth2_scheme),
    service: AuthService = Depends(get_auth_service)
):
    """
    Get current logged-in user information.
    
    Requires a valid Bearer token in the Authorization header.
    """
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await service.get_user_by_id(payload.sub)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user_to_response(user)


# ─── OTP Endpoints ───

@router.post("/register/send-otp", response_model=SendOTPResponse)
async def send_registration_otp(
    request: SendOTPRequest,
    service: AuthService = Depends(get_auth_service)
):
    """
    Send OTP to email for registration verification.
    
    - **email**: Email address to verify
    - **username**: Username for the new account
    
    Returns success status and expiry time.
    """
    # Check if email already registered
    from sqlalchemy.future import select
    from src.users.models import User
    result = await service.db.execute(select(User).filter(User.email == request.email))
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already taken
    result = await service.db.execute(select(User).filter(User.username == request.username))
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create and send OTP
    otp = await create_otp(request.email)
    await email_service.send_otp_email(request.email, otp, request.username)
    
    return SendOTPResponse(
        success=True,
        message="OTP sent to your email",
        expires_in=600  # 10 minutes
    )


@router.post("/register/verify-otp", response_model=VerifyOTPResponse)
async def verify_registration_otp(
    request: VerifyOTPRequest
):
    """
    Verify OTP code for registration.
    
    - **email**: Email address being verified
    - **otp**: 6-digit OTP code
    
    Returns success status.
    """
    is_valid = await verify_otp(request.email, request.otp)
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    return VerifyOTPResponse(
        success=True,
        message="Email verified successfully"
    )


@router.post("/register/check-verified", response_model=CheckEmailVerifiedResponse)
async def check_email_verified(
    request: CheckEmailVerifiedRequest
):
    """
    Check if email has been verified with OTP.
    
    - **email**: Email address to check
    
    Returns verification status.
    """
    verified = await is_email_verified(request.email)
    
    return CheckEmailVerifiedResponse(
        verified=verified,
        email=request.email
    )
