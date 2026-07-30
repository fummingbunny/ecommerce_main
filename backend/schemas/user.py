from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from backend.models.user import UserRole

class UserBase(BaseModel):
    name:str
    email:EmailStr

class UserCreate(UserBase):
    password:str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v)<6:
            raise ValueError("Password must be at least 6 characters")
        if len(v)>72:
            raise ValueError("Password must be less than 72 characters")
        return v

class UserLogin(BaseModel):
    email:EmailStr
    password:str

class UserResponse(UserBase):
    id:int
    role:UserRole
    is_active:bool
    created_at:datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshTokenRequest(BaseModel):
    refresh_token: str

