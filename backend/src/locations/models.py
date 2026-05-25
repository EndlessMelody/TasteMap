from sqlalchemy import Column, Integer, String, Float, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from pgvector.sqlalchemy import Vector
from sqlalchemy.orm import relationship
from src.db.database import Base


class Location(Base):
    """
    Bảng Locations — lưu trữ các POI (Point of Interest).
    Vector 15 chiều biểu diễn đặc trưng địa điểm cho thuật toán Cosine Similarity.
    characteristics dùng JSONB thay vì JSON thường để hỗ trợ GIN index sau này.
    """
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)

    # Vector features: 15 dimensions (price, noise, nature, food_type, modern_vs_historic, ...)
    vector = Column(Vector(15))

    # Spatial info
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)

    # Geographic bucketing (cho query theo khu vực)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True, index=True)

    # Context features
    base_score = Column(Float, default=0.0)
    category = Column(String, index=True)  # "food" / "place"
    image_url = Column(String, nullable=True)

    # Extended display info (từ thiết kế frontend)
    price_range = Column(String, nullable=True)  # VD: "25k", "120k"
    open_hours = Column(String, nullable=True)   # VD: "Open until 2AM"
    rating = Column(Float, default=0.0)

    # JSONB thay vì JSON: hỗ trợ GIN index, query nhanh hơn
    # Ví dụ: {"vibe": "chill", "cuisine": "Vietnamese", "noise_level": "quiet"}
    characteristics = Column(JSONB, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    interactions = relationship("Interaction", back_populates="location", lazy="selectin")
    posts = relationship("Post", back_populates="location", lazy="selectin")
    bookmarks = relationship("Bookmark", back_populates="location", lazy="selectin")
    tour_stops = relationship("TourStop", back_populates="location", lazy="selectin")
    deals = relationship("Deal", back_populates="location", lazy="selectin")

    # Index cho pgvector ANN search (ivfflat hoặc hnsw) — sẽ tạo qua Alembic raw SQL
    # vì SQLAlchemy chưa hỗ trợ native CREATE INDEX ... USING ivfflat
