from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    display_name: Optional[str] = None


class LogoutRequest(BaseModel):
    pass


class SendOTPRequest(BaseModel):
    email: EmailStr
    username: str


class SendOTPResponse(BaseModel):
    success: bool
    message: str
    expires_in: int = 600


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


class VerifyOTPResponse(BaseModel):
    success: bool
    message: str


class CheckUserExistsRequest(BaseModel):
    email: EmailStr
    username: str


class CheckUserExistsResponse(BaseModel):
    available: bool
    email_exists: bool = False
    username_exists: bool = False
    message: str


class ResolveEmailRequest(BaseModel):
    username: str


class ResolveEmailResponse(BaseModel):
    email: str
