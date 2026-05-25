import json
from typing import List
import redis.asyncio as aioredis

# Vector mặc định 15 chiều, mức trung lập
DEFAULT_VECTOR: List[float] = [0.5] * 15

async def init_session(
    redis: aioredis.Redis,
    device_id: str,
    domain: str = "place"
) -> dict:
    """
    Khởi tạo phiên người dùng trên Redis.
    - Nếu device_id + domain đã tồn tại trên Redis → trả về user_id và vector hiện tại.
    - Nếu chưa → lưu vector mặc định vào Redis, trả về user_id chính là device_id.

    Redis key format: user:{domain}:{device_id}
    Redis value: JSON string {"user_id": <string UUID>, "vector": [...]}
    """
    redis_key = f"user:{domain}:{device_id}"

    # Kiểm tra xem user đã tồn tại trên Redis chưa
    existing_data = await redis.get(redis_key)

    if existing_data:
        # User đã tồn tại → trả về dữ liệu hiện có
        data = json.loads(existing_data)
        return {
            "user_id": data.get("user_id", device_id),
            "current_vector": data["vector"]
        }

    # User mới hoàn toàn (GUEST)
    user_data = {
        "user_id": device_id,
        "vector": DEFAULT_VECTOR.copy()
    }
    await redis.set(redis_key, json.dumps(user_data))

    return {
        "user_id": user_data["user_id"],
        "current_vector": user_data["vector"]
    }
