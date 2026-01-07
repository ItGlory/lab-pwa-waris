"""
Alerts Router - API endpoints for alert operations
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from schemas.common import APIResponse, PaginatedResponse, PaginationMeta
from schemas.alert import Alert, AlertActionRequest, AlertSummary
from services.alert_service import AlertService

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("", response_model=PaginatedResponse[Alert])
async def get_alerts(
    severity: Optional[str] = Query(None, description="Filter by severity"),
    status: Optional[str] = Query(None, description="Filter by status"),
    dma_id: Optional[str] = Query(None, description="Filter by DMA ID"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
) -> PaginatedResponse[Alert]:
    """Get all alerts with optional filters"""
    items, total = await AlertService.get_all(
        severity=severity,
        status=status,
        dma_id=dma_id,
        page=page,
        per_page=per_page,
    )
    return PaginatedResponse(
        data=items,
        meta=PaginationMeta(
            page=page,
            per_page=per_page,
            total=total,
            total_pages=(total + per_page - 1) // per_page,
        ),
    )


@router.get("/summary", response_model=APIResponse[AlertSummary])
async def get_alert_summary() -> APIResponse[AlertSummary]:
    """Get alert summary statistics"""
    summary = await AlertService.get_summary()
    return APIResponse(
        data=summary,
        message="Success",
        message_th="สำเร็จ",
    )


@router.get("/active/count", response_model=APIResponse[dict])
async def get_active_count() -> APIResponse[dict]:
    """Get count of active alerts"""
    count = await AlertService.get_active_count()
    return APIResponse(
        data={"count": count},
        message="Success",
        message_th="สำเร็จ",
    )


@router.get("/{alert_id}", response_model=APIResponse[Alert])
async def get_alert(alert_id: str) -> APIResponse[Alert]:
    """Get a single alert by ID"""
    alert = await AlertService.get_by_id(alert_id)
    if not alert:
        raise HTTPException(
            status_code=404,
            detail={
                "message": "Alert not found",
                "message_th": "ไม่พบการแจ้งเตือนที่ระบุ",
            },
        )
    return APIResponse(
        data=alert,
        message="Success",
        message_th="สำเร็จ",
    )


@router.post("/{alert_id}/action", response_model=APIResponse[Alert])
async def update_alert_status(
    alert_id: str,
    request: AlertActionRequest,
) -> APIResponse[Alert]:
    """Update alert status (acknowledge/resolve)"""
    updated = await AlertService.update_status(
        alert_id=alert_id,
        action=request.action,
        user_id=request.user_id,
    )
    if not updated:
        raise HTTPException(
            status_code=404,
            detail={
                "message": "Alert not found",
                "message_th": "ไม่พบการแจ้งเตือนที่ระบุ",
            },
        )

    action_messages = {
        "acknowledge": ("Alert acknowledged", "รับทราบการแจ้งเตือนแล้ว"),
        "resolve": ("Alert resolved", "แก้ไขการแจ้งเตือนแล้ว"),
    }
    msg, msg_th = action_messages.get(request.action, ("Success", "สำเร็จ"))

    return APIResponse(
        data=updated,
        message=msg,
        message_th=msg_th,
    )
