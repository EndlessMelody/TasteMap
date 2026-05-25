"""
OTP Service for email verification during registration.
Uses Redis for temporary OTP storage.
"""
import random
import string
from datetime import datetime, timedelta
from typing import Optional

from src.db.redis import redis_client

OTP_EXPIRY_MINUTES = 10
MAX_ATTEMPTS = 3


def generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP code."""
    return ''.join(random.choices(string.digits, k=length))


def get_otp_key(email: str) -> str:
    """Get Redis key for OTP storage."""
    return f"otp:register:{email.lower()}"


def get_attempts_key(email: str) -> str:
    """Get Redis key for attempt counter."""
    return f"otp:register:attempts:{email.lower()}"


def get_verified_key(email: str) -> str:
    """Get Redis key for verified status."""
    return f"otp:register:verified:{email.lower()}"


async def create_otp(email: str) -> str:
    """
    Create and store OTP for email verification.
    Returns the OTP code.
    """
    otp = generate_otp()
    key = get_otp_key(email)
    
    # Store OTP with expiry
    await redis_client.setex(key, OTP_EXPIRY_MINUTES * 60, otp)
    
    # Reset attempts
    attempts_key = get_attempts_key(email)
    await redis_client.delete(attempts_key)
    
    return otp


async def verify_otp(email: str, otp: str) -> bool:
    """
    Verify OTP code for email.
    Returns True if valid, False otherwise.
    """
    key = get_otp_key(email)
    stored_otp = await redis_client.get(key)
    
    if not stored_otp:
        return False
    
    if stored_otp != otp:
        # Increment attempts
        attempts_key = get_attempts_key(email)
        attempts = await redis_client.incr(attempts_key)
        if attempts == 1:
            # Set expiry on first attempt
            await redis_client.expire(attempts_key, OTP_EXPIRY_MINUTES * 60)
        
        # Check max attempts
        if attempts >= MAX_ATTEMPTS:
            # Clear OTP after max attempts
            await redis_client.delete(key)
            await redis_client.delete(attempts_key)
        
        return False
    
    # OTP is valid - mark as verified
    verified_key = get_verified_key(email)
    await redis_client.setex(verified_key, 30 * 60, "1")  # 30 min expiry
    
    # Clear OTP and attempts
    await redis_client.delete(key)
    await redis_client.delete(attempts_key)
    
    return True


async def is_email_verified(email: str) -> bool:
    """Check if email has been verified with OTP."""
    verified_key = get_verified_key(email)
    return await redis_client.exists(verified_key) > 0


async def clear_verification(email: str) -> None:
    """Clear all verification data for email."""
    await redis_client.delete(get_otp_key(email))
    await redis_client.delete(get_attempts_key(email))
    await redis_client.delete(get_verified_key(email))
