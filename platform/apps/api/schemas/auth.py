"""
Authentication schemas
"""

from typing import Optional

from pydantic import BaseModel, Field, EmailStr


class LoginRequest(BaseModel):
    """Login request"""
    email: EmailStr = Field(..., description="User email")
    password: str = Field(..., min_length=6, description="User password")


class TokenResponse(BaseModel):
    """Token response"""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiry in seconds")


class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    refresh_token: str = Field(..., description="Refresh token")


class User(BaseModel):
    """User model"""
    id: str = Field(..., description="User ID")
    email: str = Field(..., description="Email")
    name: str = Field(..., description="Full name (English)")
    name_th: str = Field(..., description="Full name (Thai)")
    role: str = Field(..., description="User role")
    branch_id: Optional[str] = Field(None, description="Branch ID")
    branch_name: Optional[str] = Field(None, description="Branch name")
    region_id: Optional[str] = Field(None, description="Region ID")
    region_name: Optional[str] = Field(None, description="Region name")
    is_active: bool = Field(default=True, description="Active status")

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    """User creation request"""
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str
    name_th: str
    role: str = Field(default="viewer")
    branch_id: Optional[str] = None
    region_id: Optional[str] = None


class PasswordChange(BaseModel):
    """Password change request"""
    current_password: str
    new_password: str = Field(..., min_length=6)
