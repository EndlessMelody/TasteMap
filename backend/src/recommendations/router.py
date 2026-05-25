from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import get_db
from src.recommendations.schemas import (
    RecommendationRequest, RecommendationResponse,
    ContextualRequest, ContextualResponse,
    RescueMeRequest, RescueMeResponse,
)
from src.recommendations import service

router = APIRouter()


@router.post(
    "/",
    response_model=RecommendationResponse,
    summary="Gợi ý top-N (vector-only)",
    description="Two-Pass: pgvector ANN → numpy scoring."
)
async def get_recommendations(request: RecommendationRequest, db: AsyncSession = Depends(get_db)):
    top_places = await service.recommend_top_n_places(
        db=db,
        user_vector=request.user_vector,
        top_n=request.top_n,
        domain=request.category,
    )
    return {"recommendations": top_places}


@router.post(
    "/contextual",
    response_model=ContextualResponse,
    summary="Gợi ý theo ngữ cảnh (thời tiết + khoảng cách + vector)",
    description="Score(S) = W1·Sim(U,P) + W2·C_weather − W3·D"
)
async def get_contextual(body: ContextualRequest, db: AsyncSession = Depends(get_db)):
    return await service.recommend_contextual(
        db=db,
        user_id=body.user_id,
        lat=body.lat,
        lng=body.lng,
        category=body.category,
        radius_km=body.radius_km,
        top_n=body.top_n,
        time_context=body.time_context,
    )


@router.post(
    "/rescue-me",
    response_model=RescueMeResponse,
    summary="Rescue Me — Trả ngay 1 kết quả gần nhất đủ ngon",
    description="Ép W3=90% (distance), bỏ qua Context. Radius<1km, cosine match>60%."
)
async def rescue_me(body: RescueMeRequest, db: AsyncSession = Depends(get_db)):
    return await service.rescue_me(
        db=db,
        user_id=body.user_id,
        lat=body.lat,
        lng=body.lng,
        category=body.category,
    )
