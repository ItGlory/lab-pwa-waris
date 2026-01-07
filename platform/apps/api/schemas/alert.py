"""
Alert schemas
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from schemas.common import SeverityEnum, AlertStatusEnum, PaginationMeta


class AlertBase(BaseModel):
    """Base alert schema"""
    dma_id: str = Field(..., description="Associated DMA ID")
    dma_name: str = Field(..., description="Associated DMA name")
    type: str = Field(..., description="Alert type (high_loss, leak_detected, etc.)")
    severity: SeverityEnum = Field(..., description="Alert severity")
    title_th: str = Field(..., description="Thai title")
    title_en: str = Field(..., description="English title")
    description_th: str = Field(..., description="Thai description")


class AlertCreate(AlertBase):
    """Schema for creating an alert"""
    pass


class AlertUpdate(BaseModel):
    """Schema for updating an alert"""
    status: Optional[AlertStatusEnum] = None
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None


class Alert(AlertBase):
    """Full alert schema"""
    id: str = Field(..., description="Alert ID")
    status: AlertStatusEnum = Field(default=AlertStatusEnum.ACTIVE)
    triggered_at: datetime = Field(..., description="When alert was triggered")
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None

    class Config:
        from_attributes = True


class AlertListResponse(BaseModel):
    """Alert list response"""
    success: bool = True
    data: list[Alert]
    meta: PaginationMeta
    message: str = "Success"
    message_th: str = "สำเร็จ"


class AlertActionRequest(BaseModel):
    """Request for alert actions (acknowledge/resolve)"""
    action: str = Field(..., description="Action: 'acknowledge' or 'resolve'")
    user_id: Optional[str] = Field(None, description="User performing action")


class AlertSummary(BaseModel):
    """Alert summary statistics"""
    total: int = Field(..., description="Total alerts")
    active: int = Field(..., description="Active alerts")
    acknowledged: int = Field(..., description="Acknowledged alerts")
    resolved: int = Field(..., description="Resolved alerts")
    by_severity: dict[str, int] = Field(..., description="Count by severity")
