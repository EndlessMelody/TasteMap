# import asyncio
# import numpy as np
# import random
# from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
# from sqlalchemy.orm import sessionmaker
# from sqlalchemy import delete

# from src.core.config import settings
# from src.db.database import Base
# from src.locations.models import Location

# # Cấu hình dữ liệu giả lập
# VIETNAM_LOCATIONS = [
#     # Places (Danh thắng / Địa điểm tham quan)
#     {"name": "Hồ Hoàn Kiếm", "category": "place", "lat": 21.0285, "lng": 105.8521},
#     {"name": "Dinh Độc Lập", "category": "place", "lat": 10.7770, "lng": 106.6953},
#     {"name": "Bến Nhà Rồng", "category": "place", "lat": 10.7684, "lng": 106.7068},
#     {"name": "Chợ Bến Thành", "category": "place", "lat": 10.7725, "lng": 106.6980},
#     {"name": "Văn Miếu - Quốc Tử Giám", "category": "place", "lat": 21.0270, "lng": 105.8355},
#     {"name": "Chùa Một Cột", "category": "place", "lat": 21.0358, "lng": 105.8335},
#     {"name": "Lăng Chủ tịch Hồ Chí Minh", "category": "place", "lat": 21.0368, "lng": 105.8346},
#     {"name": "Nhà thờ Đức Bà", "category": "place", "lat": 10.7798, "lng": 106.6990},
#     {"name": "Bưu điện Trung tâm Sài Gòn", "category": "place", "lat": 10.7799, "lng": 106.7000},
#     {"name": "Phạm Ngũ Lão / Bùi Viện", "category": "place", "lat": 10.7688, "lng": 106.6942},
#     # ... Sẽ được nhân bản để đủ 50
# ]

# VIETNAM_FOODS = [
#     # Foods (Quán ăn / Món ăn tiêu biểu)
#     {"name": "Phở Gia Truyền Bát Đàn", "category": "food", "lat": 21.0336, "lng": 105.8488},
#     {"name": "Bún Chả Hương Liên (Obama)", "category": "food", "lat": 21.0194, "lng": 105.8540},
#     {"name": "Cơm Tấm Ba Ghiền", "category": "food", "lat": 10.7932, "lng": 106.6715},
#     {"name": "Phở Hòa Pasteur", "category": "food", "lat": 10.7853, "lng": 106.6853},
#     {"name": "Bánh Mì Huỳnh Hoa", "category": "food", "lat": 10.7722, "lng": 106.6946},
#     {"name": "Bún Bò Huế Nam Giao", "category": "food", "lat": 10.7715, "lng": 106.6975},
#     {"name": "Bún Đậu Mắm Tôm Hàng Khay", "category": "food", "lat": 21.0255, "lng": 105.8525},
#     {"name": "Ốc Đào", "category": "food", "lat": 10.7663, "lng": 106.6852},
#     {"name": "Quán Bụi - Authentic Vietnamese", "category": "food", "lat": 10.7831, "lng": 106.7052},
#     {"name": "Pizza 4P's Bến Thành", "category": "food", "lat": 10.7735, "lng": 106.6992},
#     # ... Sẽ được nhân bản để đủ 50
# ]

# def generate_random_vector():
#     """Tạo vector 15 chiều, L2-normalized."""
#     vec = np.random.rand(15).astype(np.float32)
#     norm = np.linalg.norm(vec)
#     if norm > 0:
#         vec = vec / norm
#     return vec.tolist()

# async def seed_data():
#     engine = create_async_engine(settings.DATABASE_URL)
#     async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

#     print("🚀 Bắt đầu quá trình seed dữ liệu...")

#     async with async_session() as session:
#         # 1. Dọn dẹp dữ liệu cũ (Tùy chọn)
#         print("🧹 Đang xoá dữ liệu cũ trong table 'locations'...")
#         await session.execute(delete(Location))
        
#         all_locations = []

#         # 2. Sinh 50 Places
#         print("📍 Đang tạo 50 địa điểm tham quan (place)...")
#         for i in range(50):
#             base = VIETNAM_LOCATIONS[i % len(VIETNAM_LOCATIONS)]
#             # Thêm một chút nhiễu toạ độ để không bị trùng lặp hoàn toàn
#             lat = base["lat"] + (random.random() - 0.5) * 0.01
#             lng = base["lng"] + (random.random() - 0.5) * 0.01
            
#             loc = Location(
#                 name=f"{base['name']} #{i+1}" if i >= len(VIETNAM_LOCATIONS) else base["name"],
#                 category="place",
#                 lat=lat,
#                 lng=lng,
#                 vector=generate_random_vector(),
#                 base_score=round(random.uniform(3.5, 5.0), 1),
#                 tags=["culture", "sightseeing", "history"] if random.random() > 0.5 else ["nature", "photo"],
#                 image_url=f"https://picsum.photos/seed/place{i}/400/300"
#             )
#             all_locations.append(loc)

#         # 3. Sinh 50 Foods
#         print("🍜 Đang tạo 50 quán ăn (food)...")
#         for i in range(50):
#             base = VIETNAM_FOODS[i % len(VIETNAM_FOODS)]
#             lat = base["lat"] + (random.random() - 0.5) * 0.01
#             lng = base["lng"] + (random.random() - 0.5) * 0.01
            
#             loc = Location(
#                 name=f"{base['name']} #{i+1}" if i >= len(VIETNAM_FOODS) else base["name"],
#                 category="food",
#                 lat=lat,
#                 lng=lng,
#                 vector=generate_random_vector(),
#                 base_score=round(random.uniform(3.5, 5.0), 1),
#                 tags=["traditional", "local", "delicious"] if random.random() > 0.5 else ["streetfood", "cheap"],
#                 image_url=f"https://picsum.photos/seed/food{i}/400/300"
#             )
#             all_locations.append(loc)

#         session.add_all(all_locations)
#         await session.commit()
#         print(f"✅ Đã insert thành công {len(all_locations)} bản ghi vào table 'locations'.")

#     await engine.dispose()

# if __name__ == "__main__":
#     asyncio.run(seed_data())
