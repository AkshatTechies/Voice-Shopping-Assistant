"""
Pydantic schemas for request/response validation.
Phase 1 covers the /api/list contract from Section 5 of the spec.
Other endpoints' schemas (parse, search, suggestions, voice) get
added in their respective phases.
"""

from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field


# ---- /api/list ----

class ListActionRequest(BaseModel):
    user_id: str
    action: Literal["add", "remove", "modify"]
    item: str
    quantity: Optional[int] = 1
    unit: Optional[str] = None
    item_id: Optional[str] = None  # required for remove/modify


class ShoppingListItemOut(BaseModel):
    item_id: str
    user_id: str
    name: str
    quantity: int
    unit: Optional[str]
    category: Optional[str]
    price: Optional[float] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ListActionResponse(BaseModel):
    success: bool
    item: Optional[ShoppingListItemOut] = None
    category: Optional[str] = None


class ListGetResponse(BaseModel):
    items: list[ShoppingListItemOut]


# ---- Auth ----

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str = Field(min_length=6)
    phone: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    user_id: str
    name: str
    email: str
    phone: Optional[str] = None
    language_pref: str
    dietary_preferences: list[str] = []

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    success: bool
    token: str
    user: UserOut


# ---- Profile ----

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    language_pref: Optional[str] = None
    dietary_preferences: Optional[list[str]] = None


class AddressIn(BaseModel):
    label: str = "Home"
    line1: str
    city: str
    pincode: Optional[str] = None
    is_default: bool = False


class AddressOut(AddressIn):
    address_id: str
    user_id: str

    class Config:
        from_attributes = True


class PaymentMethodIn(BaseModel):
    type: str  # upi / card / cod
    label: str
    is_default: bool = False


class PaymentMethodOut(PaymentMethodIn):
    payment_id: str
    user_id: str

    class Config:
        from_attributes = True


# ---- Shared error format (Section 5) ----

class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
