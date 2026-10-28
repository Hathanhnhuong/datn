from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


# =====================
# CREATE
# =====================
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Optional[str] = "user"


# =====================
# UPDATE
# =====================
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


# =====================
# RESPONSE
# =====================
class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
