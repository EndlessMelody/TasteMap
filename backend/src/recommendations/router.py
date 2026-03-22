from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import get_db
from src.recommendations.schemas import RecommendationRequest, RecommendationResponse
from src.recommendations.service import recommend_top_n_places

router = APIRouter()

@router.post("/", response_model=RecommendationResponse)
async def get_recommendations(
    request: RecommendationRequest,
    db: AsyncSession = Depends(get_db)
):
    top_places = await recommend_top_n_places(
        db=db,
        user_vector=request.user_vector,
        top_n=request.top_n,
        domain=getattr(request, "domain", "place")
    )
    
    return {"recommendations": top_places}
