import asyncio
import json
import os
import sys

# Đảm bảo import được từ src
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.db.database import AsyncSessionLocal
from src.gamification.models import Badge
from sqlalchemy import select

async def force_update_badges_by_order():
    print("🛠️ Đang khởi động chiến dịch giải cứu Badges...")
    
    json_path = os.path.join(os.path.dirname(__file__), "badges.json")
    
    with open(json_path, "r", encoding="utf-8") as f:
        badges_data = json.load(f)

    async with AsyncSessionLocal() as db:
        # Lấy toàn bộ badge hiện có trong DB, SẮP XẾP THEO ID để đảm bảo đúng thứ tự
        result = await db.execute(select(Badge).order_by(Badge.id))
        existing_badges = result.scalars().all()

        if not existing_badges:
            print("❌ Không có data trong DB để update.")
            return

        updated_count = 0
        
        # Dùng vòng lặp zip để ghép đôi (Map) từng dòng trong DB với từng cụm trong JSON
        for db_badge, json_item in zip(existing_badges, badges_data):
            
            # Ghi đè toàn bộ thông tin chuẩn từ JSON vào Object trong DB
            db_badge.name = json_item["name"]
            db_badge.description = json_item.get("description")
            db_badge.icon_name = json_item["icon_name"]
            db_badge.rarity = json_item.get("rarity", "Common")
            db_badge.accent_color = json_item.get("accent_color", "#007AFF")
            db_badge.is_hidden = json_item.get("is_hidden", False)
            
            print(f"✅ Đã fix ID {db_badge.id}: Phục hồi tên thành '{db_badge.name}'")
            updated_count += 1

        # Lưu thay đổi xuống Database
        await db.commit()
        print(f"\n🎉 Sửa lỗi thành công {updated_count} badges!")

if __name__ == "__main__":
    asyncio.run(force_update_badges_by_order())