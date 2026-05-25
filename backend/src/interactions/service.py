import json
import asyncio
import numpy as np
from typing import List, Dict, Any, Tuple
import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.locations.models import Location

# Hằng số thuật toán
ALPHA_NORMAL = 0.1       # Hệ số học bình thường
ALPHA_PENALTY = 0.01     # Hệ số học khi bị phạt (vuốt quá nhanh)
PENALTY_THRESHOLD = 0.5  # Ngưỡng thời gian tối thiểu giữa 2 lần vuốt (giây)

def _normalize_timestamp(ts: float) -> float:
    """
    Chuẩn hoá timestamp về đơn vị Giây.
    - Nếu ts > 1e12 → Frontend gửi Mili-giây (JavaScript Date.now()), chia 1000.
    - Nếu ts <= 1e12 → Đã là Giây (Python time.time()), giữ nguyên.
    """
    if ts > 1e12:
        return ts / 1000.0
    return ts

def _calculate_math_sync(U: np.ndarray, sorted_actions: List[Dict[str, Any]], db_vectors: Dict[int, np.ndarray]) -> Tuple[np.ndarray, int, bool]:
    """
    Hàm tính toán thuật toán Active Learning chạy đồng bộ.
    Sẽ được bọc ngoài bởi asyncio.to_thread để không block FastAPI Event Loop.
    """
    processed_count = 0
    penalty_triggered = False
    
    for i, action in enumerate(sorted_actions):
        place_id = action["place_id"]
        direction = action["direction"]
        timestamp = _normalize_timestamp(action["client_timestamp"])
        
        P = db_vectors.get(place_id)
        if P is None or len(P) != 15:
            continue
            
        alpha = ALPHA_NORMAL
        if i > 0:
            prev_timestamp = _normalize_timestamp(sorted_actions[i - 1]["client_timestamp"])
            time_diff = timestamp - prev_timestamp
            if time_diff < PENALTY_THRESHOLD:
                alpha = ALPHA_PENALTY
                penalty_triggered = True
                
        if direction == "RIGHT":
            U = U + alpha * P
        elif direction == "LEFT":
            U = U - alpha * P
            
        U = np.clip(U, 0.0, 1.0)
        processed_count += 1
        
    return U, processed_count, penalty_triggered

from typing import List, Dict, Any, Union

async def process_swipe_batch(
    db: AsyncSession,
    redis: aioredis.Redis,
    user_id: Union[int, str],
    domain: str,
    actions: List[Dict[str, Any]]
) -> dict:
    from src.users.models import User
    
    # 1. Quét Redis tìm key user tương ứng
    user_key = None
    cursor = 0
    pattern = f"user:{domain}:*"
    
    while True:
        cursor, keys = await redis.scan(cursor=cursor, match=pattern, count=100)
        for key in keys:
            data = await redis.get(key)
            if data:
                parsed = json.loads(data)
                # So sánh dạng string để khớp cả UUID (guest) lẫn ID (db)
                if str(parsed.get("user_id")) == str(user_id):
                    user_key = key
                    break
        if user_key or cursor == 0:
            break
            
    # NẾU KHÔNG CÓ TRONG REDIS (ví dụ: User vừa đăng ký xong chưa quét), LOAD TỪ DB CỦA HỌ
    if not user_key:
        try:
            db_user_id = int(user_id)
            result = await db.execute(select(User).filter(User.id == db_user_id))
            user_db = result.scalar_one_or_none()
            if user_db:
                # Nạp vào Redis
                user_key = f"user:{domain}:db_{db_user_id}"
                vec = user_db.place_vector if domain == "place" else user_db.food_vector
                # ⚠️ QUAN TRỌNG: pgvector trả về object Vector, KHÔNG phải list Python
                # Phải ép float() từng phần tử để json.dumps() không crash TypeError
                if vec is not None:
                    if isinstance(vec, str):
                        vec = json.loads(vec)
                    vec = [float(x) for x in vec]
                else:
                    vec = [0.5] * 15
                user_data = {
                    "user_id": db_user_id,
                    "vector": vec
                }
                await redis.set(user_key, json.dumps(user_data))
        except ValueError:
            pass # Lỗi ép int -> đây là chuỗi UUID (Guest User), không query DB
            
    # NẾU VẪN KHÔNG CÓ, TỨC LÀ SESSION LỖI HOẶC GUEST CHƯA INIT
    if not user_key:
        return {
            "status": "error",
            "processed_count": 0,
            "penalty_triggered": False,
            "updated_vector": []
        }
    else:
        user_data = json.loads(await redis.get(user_key))
        
    U = np.array(user_data["vector"], dtype=float)
    if len(U) != 15:
        return {"status": "error", "message": "User vector is not 15-dimensional.", "updated_vector": []}
    
    # 2. Query location vectors from Database
    place_ids = [a["place_id"] for a in actions]
    result = await db.execute(select(Location.id, Location.vector).where(Location.id.in_(place_ids)))
    locations = result.all()
    
    db_vectors = {}
    for loc_id, loc_vec in locations:
        if loc_vec is not None:
            # Handle possible string representation from DB driver
            if isinstance(loc_vec, str):
                loc_vec = json.loads(loc_vec)
            db_vectors[loc_id] = np.array(loc_vec, dtype=float)
            
    sorted_actions = sorted(actions, key=lambda a: a["client_timestamp"])
    
    # 3. Offload numpy calculations to thread pool to prevent blocking async loop
    U, processed_count, penalty_triggered = await asyncio.to_thread(
        _calculate_math_sync, U, sorted_actions, db_vectors
    )
    
    # 4. Save updated vector to redis AND POSTGRESQL
    updated_vector = [round(float(x), 4) for x in U]
    user_data["vector"] = updated_vector
    await redis.set(user_key, json.dumps(user_data))
    
    # Đồng bộ ngược lại DB để profile / DB check luôn up to date!
    try:
        db_user_id = int(user_id)
        result = await db.execute(select(User).filter(User.id == db_user_id))
        user_to_update = result.scalar_one_or_none()
        if user_to_update:
            if domain == "place":
                user_to_update.place_vector = updated_vector
            else:
                user_to_update.food_vector = updated_vector
            await db.commit()
    except ValueError:
        pass # UUID Guest User -> không đồng bộ PostgreSQL
        
    # 5. Smart Cache Invalidation: Xóa cache Feed để force AI tính lại vòng lặp mới
    try:
        feed_pattern = f"feed:*:{user_id}:*"
        cursor_scan = 0
        while True:
            cursor_scan, keys = await redis.scan(cursor=cursor_scan, match=feed_pattern, count=100)
            if keys:
                await redis.delete(*keys)
            if cursor_scan == 0:
                break
    except Exception as e:
        import logging
        logging.warning(f"[SWIPE] Failed to clear feed cache for user {user_id}: {e}")
        
    return {
        "status": "success",
        "processed_count": processed_count,
        "penalty_triggered": penalty_triggered,
        "updated_vector": updated_vector
    }
