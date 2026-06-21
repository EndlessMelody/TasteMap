from pydantic import BaseModel, EmailStr


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
