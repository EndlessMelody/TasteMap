from typing import Any, Optional, Dict
from fastapi import status

class TasteMapException(Exception):
    """Base exception class for TasteMap backend application."""
    def __init__(
        self,
        detail: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code: Optional[str] = None,
        headers: Optional[Dict[str, str]] = None
    ):
        super().__init__(detail)
        self.detail = detail
        self.status_code = status_code
        self.error_code = error_code or self.__class__.__name__
        self.headers = headers


class ResourceNotFoundException(TasteMapException):
    """Raised when a requested resource (user, location, tour, etc.) is not found."""
    def __init__(self, detail: str = "Resource not found", error_code: str = "RESOURCE_NOT_FOUND"):
        super().__init__(detail=detail, status_code=status.HTTP_404_NOT_FOUND, error_code=error_code)


class UnauthorizedException(TasteMapException):
    """Raised when authentication credentials are missing or invalid."""
    def __init__(self, detail: str = "Authentication required or invalid token", error_code: str = "UNAUTHORIZED"):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code=error_code,
            headers={"WWW-Authenticate": "Bearer"}
        )


class ForbiddenException(TasteMapException):
    """Raised when the user does not have sufficient permissions."""
    def __init__(self, detail: str = "You do not have permission to perform this action", error_code: str = "FORBIDDEN"):
        super().__init__(detail=detail, status_code=status.HTTP_403_FORBIDDEN, error_code=error_code)


class ValidationException(TasteMapException):
    """Raised when request parameters or payload fail business validation."""
    def __init__(self, detail: str = "Invalid request data", error_code: str = "VALIDATION_ERROR"):
        super().__init__(detail=detail, status_code=status.HTTP_400_BAD_REQUEST, error_code=error_code)


class ConflictException(TasteMapException):
    """Raised when there is a resource conflict (e.g., duplicate email or username)."""
    def __init__(self, detail: str = "Resource conflict occurred", error_code: str = "CONFLICT"):
        super().__init__(detail=detail, status_code=status.HTTP_409_CONFLICT, error_code=error_code)


class ServiceUnavailableException(TasteMapException):
    """Raised when an external or downstream service (LLM, Redis, etc.) is unavailable."""
    def __init__(self, detail: str = "Service temporarily unavailable", error_code: str = "SERVICE_UNAVAILABLE"):
        super().__init__(detail=detail, status_code=status.HTTP_503_SERVICE_UNAVAILABLE, error_code=error_code)
