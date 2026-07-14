from fastapi import APIRouter, Request

from src.core.rate_limit import limiter

router = APIRouter(tags=["Health Check"])

@router.get("/")
@limiter.exempt
async def health_check(request: Request):
    return {"status": "ok", "message": "TasteMap Server is running smoothly!"}