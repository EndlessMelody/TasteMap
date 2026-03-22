import json
import uuid
from typing import List
import redis.asyncio as aioredis

# Vector mặc định 15 chiều, mức trung lập
DEFAULT_VECTOR: List[float] = [0.5] * 15

async def init_session(redis: aioredis.Redis, device_id: str, domain: str = "place") -> dict:
    """
    Khởi tạo phiên người dùng.
    - Nếu device_id + domain đã tồn tại trên Redis → trả về user_id và vector hiện tại.
    - Nếu chưa → tạo UUID mới, lưu vector mặc định [0.5]*8, trả về.
    
    Redis key format: user:{domain}:{device_id}
    Redis value: JSON string {"user_id": "...", "vector": [...]}
    """
    redis_key = f"user:{domain}:{device_id}"
    
    # Kiểm tra xem user đã tồn tại chưa
    existing_data = await redis.get(redis_key)
    
    if existing_data:
        # User đã tồn tại → trả về dữ liệu hiện có
        data = json.loads(existing_data)
        return {
            "user_id": data["user_id"],
            "current_vector": data["vector"]
        }
    
    # User mới → tạo UUID và vector mặc định
    new_user_id = str(uuid.uuid4())
    user_data = {
        "user_id": new_user_id,
        "vector": DEFAULT_VECTOR.copy()
    }
    
    # Lưu vào Redis (không set TTL, để user tồn tại vĩnh viễn trong phiên test)
    await redis.set(redis_key, json.dumps(user_data))
    
    return {
        "user_id": new_user_id,
        "current_vector": user_data["vector"]
    }
