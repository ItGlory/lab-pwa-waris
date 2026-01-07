"""
Auth Service - Authentication and user management
"""

from typing import Optional

from core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)
from core.config import settings

# Mock users for development
MOCK_USERS = [
    {
        "id": "user-001",
        "email": "admin@pwa.co.th",
        "password_hash": get_password_hash("admin123"),
        "name": "System Administrator",
        "name_th": "ผู้ดูแลระบบ",
        "role": "admin",
        "branch_id": None,
        "branch_name": None,
        "region_id": None,
        "region_name": None,
        "is_active": True,
    },
    {
        "id": "user-002",
        "email": "manager@pwa.co.th",
        "password_hash": get_password_hash("manager123"),
        "name": "Regional Manager",
        "name_th": "ผู้จัดการเขต",
        "role": "manager",
        "branch_id": None,
        "branch_name": None,
        "region_id": "reg-002",
        "region_name": "เขต 2 (ภาคกลาง)",
        "is_active": True,
    },
    {
        "id": "user-003",
        "email": "operator@pwa.co.th",
        "password_hash": get_password_hash("operator123"),
        "name": "Branch Operator",
        "name_th": "เจ้าหน้าที่สาขา",
        "role": "operator",
        "branch_id": "brn-010",
        "branch_name": "สาขาสมุทรปราการ",
        "region_id": "reg-002",
        "region_name": "เขต 2 (ภาคกลาง)",
        "is_active": True,
    },
    {
        "id": "user-004",
        "email": "viewer@pwa.co.th",
        "password_hash": get_password_hash("viewer123"),
        "name": "Report Viewer",
        "name_th": "ผู้ดูรายงาน",
        "role": "viewer",
        "branch_id": "brn-010",
        "branch_name": "สาขาสมุทรปราการ",
        "region_id": "reg-002",
        "region_name": "เขต 2 (ภาคกลาง)",
        "is_active": True,
    },
]


class AuthService:
    """Service for authentication operations"""

    @staticmethod
    async def authenticate(email: str, password: str) -> Optional[dict]:
        """Authenticate user with email and password"""
        user = await AuthService.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user["password_hash"]):
            return None
        if not user["is_active"]:
            return None
        return user

    @staticmethod
    async def get_user_by_email(email: str) -> Optional[dict]:
        """Get user by email"""
        for user in MOCK_USERS:
            if user["email"] == email:
                return user
        return None

    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[dict]:
        """Get user by ID"""
        for user in MOCK_USERS:
            if user["id"] == user_id:
                return user
        return None

    @staticmethod
    def create_tokens(user: dict) -> dict:
        """Create access and refresh tokens for a user"""
        token_data = {
            "sub": user["id"],
            "email": user["email"],
            "role": user["role"],
        }

        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    @staticmethod
    async def refresh_tokens(refresh_token: str) -> Optional[dict]:
        """Refresh access token using refresh token"""
        payload = verify_refresh_token(refresh_token)
        if not payload:
            return None

        user_id = payload.get("sub")
        user = await AuthService.get_user_by_id(user_id)
        if not user or not user["is_active"]:
            return None

        return AuthService.create_tokens(user)

    @staticmethod
    def get_user_response(user: dict) -> dict:
        """Get user data for response (excluding sensitive fields)"""
        return {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "name_th": user["name_th"],
            "role": user["role"],
            "branch_id": user["branch_id"],
            "branch_name": user["branch_name"],
            "region_id": user["region_id"],
            "region_name": user["region_name"],
            "is_active": user["is_active"],
        }
