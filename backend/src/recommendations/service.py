import asyncio
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any, Tuple
from src.locations.models import Location
import json

def _calculate_context_score_sync(U: np.ndarray, candidates: List[Dict[str, Any]], context_data: dict) -> List[Dict[str, Any]]:
    """
    Pass 2: Python / Numpy math calculation.
    """
    norm_U = np.linalg.norm(U)
    if norm_U == 0:
        return []
        
    scored_places = []
    
    # Giả lập tham số ngữ cảnh:
    # Score = W1*Sim + W2*Weather - W3*Distance
    W1, W2, W3 = 0.6, 0.2, 0.2
    
    for place in candidates:
        P = np.array(place["vector"], dtype=float)
        norm_P = np.linalg.norm(P)
        if norm_P == 0:
            continue
            
        cosine_sim = np.dot(U, P) / (norm_U * norm_P)
        
        # Mocks: context scores. Trong thực tế sẽ tính từ place["lat"], place["lng"] và API thời tiết
        mock_weather_score = 0.8
        mock_dist_score = 0.3
        
        final_score = W1 * cosine_sim + W2 * mock_weather_score - W3 * mock_dist_score
        
        scored_places.append({
            "place_id": place["id"],
            "name": place["name"],
            "match_score": round(final_score * 100, 2),
            "vector": place["vector"]
        })
        
    scored_places.sort(key=lambda x: x['match_score'], reverse=True)
    return scored_places

async def recommend_top_n_places(db: AsyncSession, user_vector: List[float], top_n: int = 5, domain: str = "place"):
    # Pass 1: Lấy top 100 địa điểm gần nhất bằng pgvector index
    # Note: Sử dụng cosine_distance của SQLAlchemy
    # query = select(Location).where(Location.category == domain).order_by(Location.vector.cosine_distance(user_vector)).limit(100)
    
    # Đối với sqlalchemy mà chưa load toán tử pgvector chi tiết, có thể dùng text_clause hoặc simple select.
    # Tạm thời cứ query toàn bộ trong filter theo domain (vì DB mới lập cũng ít dữ liệu):
    query = select(Location).where(Location.category == domain).limit(200)
    result = await db.execute(query)
    locations = result.scalars().all()
    
    if not locations:
        return []
        
    candidates = [
        {
            "id": loc.id,
            "name": loc.name,
            "vector": loc.vector
        }
        for loc in locations if loc.vector is not None
    ]
    
    U = np.array(user_vector, dtype=float)
    if len(U) != 15:
        # Prevent crash
        return []
        
    # Pass 2: Numpy threadpool context scoring
    scored_places = await asyncio.to_thread(_calculate_context_score_sync, U, candidates, {})
    
    return scored_places[:top_n]
