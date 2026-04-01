from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from src.db.database import Base


class Group(Base):
    """
    Bảng Groups — đại diện một nhóm bạn bè (Lobby) cùng chọn địa điểm.
    Minimax algorithm sẽ hoạt động trên các member của group này.
    """
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    # Status dùng String thay vì Enum — cùng triết lý với Interaction.action
    # Giá trị: "active", "completed", "cancelled"
    status = Column(String, nullable=False, default="active")

    # Thông tin lobby (từ thiết kế frontend)
    route_description = Column(String, nullable=True)  # VD: "District 1 Mapping"
    scheduled_time = Column(DateTime(timezone=True), nullable=True)
    max_spots = Column(Integer, default=6)
    cover_image_url = Column(String, nullable=True)
    accent_color = Column(String, nullable=True)  # Mã màu Hex cho UI lobby

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    members = relationship("GroupMember", back_populates="group", lazy="selectin")


class GroupMember(Base):
    """
    Bảng GroupMember — liên kết N:N giữa User và Group.

    is_host: Đánh dấu người tạo phòng — có quyền bấm "Chốt danh sách" (POST /finish).
    session_vector: Clone từ User.food_vector khi join. Mọi thao tác quẹt thẻ trong
        phòng CHỈ thay đổi session_vector này, KHÔNG ảnh hưởng vector gốc của user.
        Giúp user thoải mái "chiều" theo bạn bè mà không sợ AI sau này gợi ý sai.
    compromise_score: Lưu mức độ thuật toán Minimax đã "hy sinh" sở thích
        của user này trong quyết định trước. Nếu Member A bị compromise nhiều
        cho bữa trưa, weight của A sẽ được boost cho bữa tối.

    Công thức: min(max_i∈Group |Score_i - Score_ideal|)
    """
    __tablename__ = "group_members"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Host marker: Người tạo phòng, có quyền gọi POST /finish
    is_host = Column(Boolean, default=False)

    # Session Vector: Clone từ User profile khi join, mutate riêng trong session
    # ⚠️ Thuật toán Minimax Referee PHẢI đọc cột này, KHÔNG ĐỌC user.food_vector
    session_vector = Column(Vector(15), nullable=True)

    # Minimax memory: Boost weight cho user bị "thiệt" ở quyết định trước
    compromise_score = Column(Float, default=0.0)
    is_ready = Column(Boolean, default=False)

    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    group = relationship("Group", back_populates="members")
    user = relationship("User", back_populates="group_memberships")
