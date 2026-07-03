from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    """Schema for user registration."""
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    """Schema for user login."""
    email: str
    password: str


class UserResponse(BaseModel):
    """Schema for user data in responses."""
    id: int
    name: str
    email: str
    profile_picture: Optional[str] = None
    bio: Optional[str] = None
    xp: int
    level: int
    current_streak: int
    longest_streak: int
    settings: Optional[dict] = {}

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    profile_picture: Optional[str] = None
    bio: Optional[str] = None
    settings: Optional[dict] = None


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
