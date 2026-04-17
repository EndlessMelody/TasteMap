from pydantic import BaseModel, Field

class AnalyticsOverview(BaseModel):
    total_users: int = Field(..., description="Tổng số người dùng đã đăng ký")
    active_challenges: int = Field(..., description="Số lượng thử thách đang hoạt động")
    total_locations: int = Field(..., description="Tổng số địa điểm trong hệ thống")
