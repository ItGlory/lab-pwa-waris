"""
Common schemas used across the API
"""

from datetime import datetime
from enum import Enum
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class StatusEnum(str, Enum):
    """DMA status levels"""
    NORMAL = "normal"
    WARNING = "warning"
    CRITICAL = "critical"


class SeverityEnum(str, Enum):
    """Alert severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertStatusEnum(str, Enum):
    """Alert status"""
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"


class PaginationMeta(BaseModel):
    """Pagination metadata"""
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Items per page")
    total: int = Field(..., description="Total number of items")
    total_pages: int = Field(..., description="Total number of pages")


class ErrorDetail(BaseModel):
    """Error detail"""
    code: str
    message: str
    message_th: str


class ErrorResponse(BaseModel):
    """Error response"""
    success: bool = False
    error: ErrorDetail
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class APIResponse(BaseModel, Generic[T]):
    """Standard API response wrapper"""
    success: bool = True
    data: T
    message: str = "Success"
    message_th: str = "สำเร็จ"
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated API response wrapper"""
    success: bool = True
    data: list[T]
    meta: PaginationMeta
    message: str = "Success"
    message_th: str = "สำเร็จ"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
