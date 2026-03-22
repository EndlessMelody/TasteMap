from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    pass

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    food_vector: Optional[List[float]] = None
    place_vector: Optional[List[float]] = None
    xp: int
    level: int

    class Config:
        from_attributes = True
