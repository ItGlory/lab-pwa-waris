"""
Auth Router - Authentication endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, status

from schemas.common import APIResponse
from schemas.auth import (
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    User,
)
from services.auth_service import AuthService
from core.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest) -> TokenResponse:
    """Login with email and password"""
    user = await AuthService.authenticate(request.email, request.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "message": "Invalid email or password",
                "message_th": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
            },
        )

    tokens = AuthService.create_tokens(user)
    return TokenResponse(**tokens)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest) -> TokenResponse:
    """Refresh access token"""
    tokens = await AuthService.refresh_tokens(request.refresh_token)

    if not tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "message": "Invalid or expired refresh token",
                "message_th": "โทเค็นรีเฟรชไม่ถูกต้องหรือหมดอายุ",
            },
        )

    return TokenResponse(**tokens)


@router.get("/me", response_model=APIResponse[User])
async def get_current_user_info(
    user: dict = Depends(get_current_user),
) -> APIResponse[User]:
    """Get current user information"""
    user_data = AuthService.get_user_response(user)
    return APIResponse(
        data=user_data,
        message="Success",
        message_th="สำเร็จ",
    )


@router.post("/logout")
async def logout(user: dict = Depends(get_current_user)) -> dict:
    """Logout (client should discard tokens)"""
    # In production, you might want to blacklist the token
    return {
        "message": "Successfully logged out",
        "message_th": "ออกจากระบบสำเร็จ",
    }
