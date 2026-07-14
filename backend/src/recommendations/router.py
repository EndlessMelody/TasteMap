from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import get_db
from src.recommendations.schemas import (
    RecommendationRequest, RecommendationResponse,
    ContextualRequest, ContextualResponse,
    RescueMeRequest, RescueMeResponse,
    CompatibilityCheckRequest, CompatibilityResponse,
    GroupConsensusRequest, GroupConsensusResponse,
)
from src.recommendations import service
from src.core.dependencies import get_current_user_id
from src.membership.quota import enforce_quota

router = APIRouter()


@router.post(
    "/",
    response_model=RecommendationResponse,
    summary="Gợi ý top-N (vector-only)",
    description="Two-Pass: pgvector ANN → numpy scoring.",
    dependencies=[Depends(enforce_quota("recommendation_calls"))],
)
async def get_recommendations(
    request: RecommendationRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
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
async def get_contextual(
    body: ContextualRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await service.recommend_contextual(
        db=db,
        user_id=user_id,
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
async def rescue_me(
    body: RescueMeRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await service.rescue_me(
        db=db,
        user_id=user_id,
        lat=body.lat,
        lng=body.lng,
        category=body.category,
    )


@router.post(
    "/compatibility-check",
    response_model=CompatibilityResponse,
    summary="AI Matchmaker — Phân tích độ tương thích khẩu vị ăn uống giữa các bạn bè",
    description="Tính cosine similarity 15 chiều, chỉ ra điểm chung và điểm dễ xung đột khi chọn món."
)
async def check_compatibility(
    body: CompatibilityCheckRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await service.check_compatibility(
        db=db,
        current_user_id=user_id,
        target_user_ids=body.target_user_ids
    )


@router.post(
    "/group-consensus",
    response_model=GroupConsensusResponse,
    summary="AI Group Dining Concierge — Gợi ý điểm chung tối ưu cho nhóm",
    description="Dùng thuật toán Pareto Min-Max Regret tối ưu hóa độ hài lòng trung bình và bảo vệ thành viên khó tính nhất."
)
async def recommend_group_consensus(
    body: GroupConsensusRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await service.recommend_group_consensus(
        db=db,
        user_ids=body.user_ids,
        lat=body.lat,
        lng=body.lng,
        radius_km=body.radius_km,
        category=body.category,
        top_n=body.top_n
    )
