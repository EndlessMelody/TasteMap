from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from src.users.models import User
from src.challenges.models import Challenge
from src.locations.models import Location

async def get_overview_stats(db: AsyncSession) -> dict:
    """Truy vấn các thống kê tổng quan từ cơ sở dữ liệu cho Admin Dashboard."""
    
    # Đếm tổng số người dùng
    user_query = select(func.count(User.id))
    user_result = await db.execute(user_query)
    total_users = user_result.scalar_one()
    
    # Đếm số lượng thử thách đang hoạt động
    challenge_query = select(func.count(Challenge.id)).where(Challenge.is_active == True)
    challenge_result = await db.execute(challenge_query)
    active_challenges = challenge_result.scalar_one()
    
    # Đếm tổng số địa điểm (hoặc chỉ địa điểm đang active)
    location_query = select(func.count(Location.id)).where(Location.is_active == True)
    location_result = await db.execute(location_query)
    total_locations = location_result.scalar_one()

    return {
        "total_users": total_users,
        "active_challenges": active_challenges,
        "total_locations": total_locations
    }
