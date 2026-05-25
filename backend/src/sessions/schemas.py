from pydantic import BaseModel
from typing import List, Literal, Union

class InitSessionRequest(BaseModel):
    device_id: str
    domain: Literal["food", "place"] = "place"

class InitSessionResponse(BaseModel):
    user_id: Union[int, str]
    current_vector: List[float]
