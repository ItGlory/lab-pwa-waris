"""
Dashboard schemas
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TrendData(BaseModel):
    """Trend information"""
    direction: str = Field(..., description="up, down, or stable")
    value: float = Field(..., description="Change value")
    label: str = Field(..., description="Trend label")


class KPIData(BaseModel):
    """KPI card data"""
    title: str
    title_th: str
    value: float
    unit: str
    unit_th: str
    trend: Optional[TrendData] = None
    target: Optional[float] = None


class StatusDistribution(BaseModel):
    """Status distribution counts"""
    normal: int = Field(..., description="Number of DMAs in normal status")
    warning: int = Field(..., description="Number of DMAs in warning status")
    critical: int = Field(..., description="Number of DMAs in critical status")


class AlertSummary(BaseModel):
    """Alert summary counts"""
    total: int
    active: int
    acknowledged: int
    resolved: int
    by_severity: dict[str, int]


class RegionalSummary(BaseModel):
    """Summary for a single region"""
    region_id: str
    region_name: str
    dma_count: int
    avg_loss_percentage: float
    status: str


class DashboardSummary(BaseModel):
    """Complete dashboard summary"""
    total_dmas: int
    active_dmas: int
    total_inflow: float
    total_outflow: float
    total_loss: float
    avg_loss_percentage: float
    kpis: list[KPIData]
    status_distribution: StatusDistribution
    alerts: AlertSummary
    regional_summary: list[RegionalSummary]
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class DashboardResponse(BaseModel):
    """Dashboard API response"""
    success: bool = True
    data: DashboardSummary
    message: str = "Success"
    message_th: str = "สำเร็จ"
