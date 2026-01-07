"""
Report schemas
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field

from schemas.common import PaginationMeta


class ReportTypeEnum(str, Enum):
    """Report type"""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    ANNUAL = "annual"
    CUSTOM = "custom"


class ReportCategoryEnum(str, Enum):
    """Report category"""
    WATER_LOSS = "water_loss"
    DMA_PERFORMANCE = "dma_performance"
    ALERTS = "alerts"
    FINANCIAL = "financial"


class ReportStatusEnum(str, Enum):
    """Report generation status"""
    PROCESSING = "processing"
    READY = "ready"
    ERROR = "error"


class ReportBase(BaseModel):
    """Base report schema"""
    title_th: str = Field(..., description="Thai title")
    title_en: str = Field(..., description="English title")
    type: ReportTypeEnum = Field(..., description="Report type")
    category: ReportCategoryEnum = Field(..., description="Report category")
    period: str = Field(..., description="Report period (e.g., '2024-01', '2024-W03')")


class ReportCreate(ReportBase):
    """Schema for creating a report"""
    scope_regions: Optional[list[str]] = None
    scope_branches: Optional[list[str]] = None
    scope_dmas: Optional[list[str]] = None


class Report(ReportBase):
    """Full report schema"""
    id: str = Field(..., description="Report ID")
    status: ReportStatusEnum = Field(default=ReportStatusEnum.PROCESSING)
    created_at: datetime = Field(..., description="Creation timestamp")
    file_size: Optional[str] = None
    file_url: Optional[str] = None
    generated_by: Optional[str] = None

    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    """Report list response"""
    success: bool = True
    data: list[Report]
    meta: PaginationMeta
    message: str = "Success"
    message_th: str = "สำเร็จ"
