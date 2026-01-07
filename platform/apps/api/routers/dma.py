"""
DMA Router - API endpoints for DMA operations
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from schemas.common import APIResponse, PaginatedResponse, PaginationMeta
from schemas.dma import DMA, DMAReadingsResponse
from services.dma_service import DMAService

router = APIRouter(prefix="/dma", tags=["DMA"])


@router.get("", response_model=PaginatedResponse[DMA])
async def get_dmas(
    region: Optional[str] = Query(None, description="Filter by region ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search by name or code"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
) -> PaginatedResponse[DMA]:
    """Get all DMAs with optional filters"""
    items, total = await DMAService.get_all(
        region=region,
        status=status,
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


@router.get("/{dma_id}", response_model=APIResponse[DMA])
async def get_dma(dma_id: str) -> APIResponse[DMA]:
    """Get a single DMA by ID"""
    dma = await DMAService.get_by_id(dma_id)
    if not dma:
        raise HTTPException(
            status_code=404,
            detail={
                "message": "DMA not found",
                "message_th": "ไม่พบ DMA ที่ระบุ",
            },
        )
    return APIResponse(
        data=dma,
        message="Success",
        message_th="สำเร็จ",
    )


@router.get("/{dma_id}/readings", response_model=APIResponse[DMAReadingsResponse])
async def get_dma_readings(
    dma_id: str,
    period: str = Query("30d", description="Period: 7d, 14d, or 30d"),
) -> APIResponse[DMAReadingsResponse]:
    """Get readings for a DMA"""
    readings = await DMAService.get_readings(dma_id, period)
    if not readings:
        raise HTTPException(
            status_code=404,
            detail={
                "message": "DMA not found",
                "message_th": "ไม่พบ DMA ที่ระบุ",
            },
        )
    return APIResponse(
        data=readings,
        message="Success",
        message_th="สำเร็จ",
    )
