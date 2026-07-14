from typing import Literal, Optional
from pydantic import BaseModel, Field


class CardInput(BaseModel):
    number: str = Field(..., description="Card number, spaces allowed")
    exp_month: int
    exp_year: int
    cvc: str
    name: Optional[str] = None


class SubscribeRequest(BaseModel):
    plan: Literal["feast_monthly", "feast_yearly"]
    idempotency_key: str
    card: Optional[CardInput] = None
    payment_method_id: Optional[int] = None


class SavePaymentMethodRequest(BaseModel):
    number: str
    exp_month: int
    exp_year: int
    cvc: str
    name: Optional[str] = None
    set_default: bool = False


class EquipFrameRequest(BaseModel):
    frame_id: Optional[int] = None
