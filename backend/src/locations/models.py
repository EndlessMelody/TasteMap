from sqlalchemy import Column, Integer, String, Float, JSON
from pgvector.sqlalchemy import Vector
from src.db.database import Base

class Location(Base):
    """
    Represents a POI (Point of Interest) can be a Food place or a generic Location/Place.
    """
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    
    # Vector features: 15 dimensions
    vector = Column(Vector(15))
    
    # Spatial info
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    
    # Context features
    base_score = Column(Float, default=0.0)
    category = Column(String, index=True) # e.g. "food" or "place"
    image_url = Column(String)
    tags = Column(JSON) # List of tags (string)
