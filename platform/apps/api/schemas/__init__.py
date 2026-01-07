"""
WARIS API Schemas
Pydantic models for request/response validation
"""

from schemas.common import (
    APIResponse,
    PaginationMeta,
    ErrorResponse,
    StatusEnum,
    SeverityEnum,
)
from schemas.dma import (
    DMA,
    DMACreate,
    DMAUpdate,
    DMAReading,
    DMAListResponse,
    DMAReadingsResponse,
)
from schemas.alert import (
    Alert,
    AlertCreate,
    AlertUpdate,
    AlertListResponse,
)
from schemas.report import (
    Report,
    ReportCreate,
    ReportListResponse,
)
from schemas.dashboard import (
    DashboardSummary,
    KPIData,
    RegionalSummary,
)

__all__ = [
    # Common
    "APIResponse",
    "PaginationMeta",
    "ErrorResponse",
    "StatusEnum",
    "SeverityEnum",
    # DMA
    "DMA",
    "DMACreate",
    "DMAUpdate",
    "DMAReading",
    "DMAListResponse",
    "DMAReadingsResponse",
    # Alert
    "Alert",
    "AlertCreate",
    "AlertUpdate",
    "AlertListResponse",
    # Report
    "Report",
    "ReportCreate",
    "ReportListResponse",
    # Dashboard
    "DashboardSummary",
    "KPIData",
    "RegionalSummary",
]
