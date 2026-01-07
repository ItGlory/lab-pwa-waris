"""
Reports Router - API endpoints for report operations
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from schemas.common import APIResponse, PaginatedResponse, PaginationMeta
from schemas.report import Report
from services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("", response_model=PaginatedResponse[Report])
async def get_reports(
    report_type: Optional[str] = Query(
        None, alias="type", description="Filter by report type"
    ),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search in title"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
) -> PaginatedResponse[Report]:
    """Get all reports with optional filters"""
    items, total = await ReportService.get_all(
        report_type=report_type,
        category=category,
        search=search,
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


@router.get("/{report_id}", response_model=APIResponse[Report])
async def get_report(report_id: str) -> APIResponse[Report]:
    """Get a single report by ID"""
    report = await ReportService.get_by_id(report_id)
    if not report:
        raise HTTPException(
            status_code=404,
            detail={
                "message": "Report not found",
                "message_th": "ไม่พบรายงานที่ระบุ",
            },
        )
    return APIResponse(
        data=report,
        message="Success",
        message_th="สำเร็จ",
    )


@router.get("/{report_id}/download")
async def download_report(report_id: str):
    """Download a report file"""
    report = await ReportService.get_by_id(report_id)
    if not report:
        raise HTTPException(
            status_code=404,
            detail={
                "message": "Report not found",
                "message_th": "ไม่พบรายงานที่ระบุ",
            },
        )

    # In production, this would return actual file
    # For now, return a placeholder response
    return {
        "message": "Download started",
        "message_th": "เริ่มดาวน์โหลด",
        "report_id": report_id,
        "filename": f"{report['id']}.pdf",
    }
