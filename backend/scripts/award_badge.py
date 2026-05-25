import asyncio
import os
import sys

# Thêm project root vào sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.db.database import AsyncSessionLocal
from src.gamification.service import award_badge

async def give_badge(user_id: int, badge_id: int):
    async with AsyncSessionLocal() as db:
        result = await award_badge(db, user_id, badge_id)
        if result["status"] == "awarded":
            print(f"Đã cấp thành công Badge ID {badge_id} cho User ID {user_id}!")
        else:
            print(f"ℹUser ID {user_id} đã có Badge ID {badge_id} rồi.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Sử dụng: python scripts/award_badge.py <user_id> <badge_id>")
    else:
        u_id = int(sys.argv[1])
        b_id = int(sys.argv[2])
        asyncio.run(give_badge(u_id, b_id))
