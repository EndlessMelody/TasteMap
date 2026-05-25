from pydantic import BaseModel
from typing import Optional


class CultureQuery(BaseModel):
    """Text-based food identification query."""
    food_name: str
    language: str = "vi"  # vi | en


class CultureImageQuery(BaseModel):
    """Image-based food identification — image_url or base64."""
    image_url: Optional[str] = None
    image_base64: Optional[str] = None
    language: str = "vi"


class CultureStorySection(BaseModel):
    title: str
    content: str
    icon: Optional[str] = None  # emoji


class CultureStoryResponse(BaseModel):
    """Full cultural story response."""
    food_name: str
    food_name_local: Optional[str] = None
    identified_from_image: bool = False
    confidence: Optional[float] = None  # 0-1 for image identification
    image_url: Optional[str] = None
    sections: list[CultureStorySection] = []
    taste_tags: list[str] = []
    pairing_suggestions: list[str] = []
    when_to_eat: Optional[str] = None
    fun_fact: Optional[str] = None
