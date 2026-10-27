from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr



class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    author_id: Optional[str] = None
    name: str
    email: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    author_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

