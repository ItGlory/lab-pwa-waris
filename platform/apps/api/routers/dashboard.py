"""
Dashboard Router - API endpoints for dashboard data
"""

from fastapi import APIRouter

from schemas.common import APIResponse
from schemas.dashboard import DashboardSummary
from services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=APIResponse[DashboardSummary])
async def get_dashboard_summary() -> APIResponse[DashboardSummary]:
    """Get complete dashboard summary with KPIs, status distribution, and alerts"""
    summary = await DashboardService.get_summary()
    return APIResponse(
        data=summary,
        message="Success",
        message_th="สำเร็จ",
    )
