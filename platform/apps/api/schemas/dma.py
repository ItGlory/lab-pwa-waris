"""
DMA (District Metered Area) schemas
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from schemas.common import StatusEnum, PaginationMeta


class DMABase(BaseModel):
    """Base DMA schema"""
    code: str = Field(..., description="DMA code")
    name_th: str = Field(..., description="Thai name")
    name_en: str = Field(..., description="English name")
    branch_id: str = Field(..., description="Branch ID")
    branch_name: str = Field(..., description="Branch name")
    region_id: str = Field(..., description="Region ID")
    region_name: str = Field(..., description="Region name")
    area_km2: float = Field(..., description="Area in square kilometers")
    population: int = Field(..., description="Population count")
    connections: int = Field(..., description="Number of water connections")
    pipe_length_km: float = Field(..., description="Total pipe length in km")


class DMACreate(DMABase):
    """Schema for creating a DMA"""
    pass


class DMAUpdate(BaseModel):
    """Schema for updating a DMA"""
    name_th: Optional[str] = None
    name_en: Optional[str] = None
    area_km2: Optional[float] = None
    population: Optional[int] = None
    connections: Optional[int] = None
    pipe_length_km: Optional[float] = None


class DMA(DMABase):
    """Full DMA schema with computed fields"""
    id: str = Field(..., description="DMA ID")
    current_inflow: float = Field(..., description="Current water inflow (m³/day)")
    current_outflow: float = Field(..., description="Current water outflow (m³/day)")
    current_loss: float = Field(..., description="Current water loss (m³/day)")
    loss_percentage: float = Field(..., description="Loss percentage")
    avg_pressure: float = Field(..., description="Average pressure (bar)")
    status: StatusEnum = Field(..., description="Current status")
    last_updated: datetime = Field(..., description="Last data update time")

    class Config:
        from_attributes = True


class DMAReading(BaseModel):
    """Single DMA reading/measurement"""
    date: str = Field(..., description="Reading date (YYYY-MM-DD)")
    inflow: float = Field(..., description="Water inflow (m³)")
    outflow: float = Field(..., description="Water outflow (m³)")
    loss: float = Field(..., description="Water loss (m³)")
    loss_pct: float = Field(..., description="Loss percentage")
    pressure: float = Field(..., description="Average pressure (bar)")


class DMAListResponse(BaseModel):
    """DMA list response"""
    success: bool = True
    data: list[DMA]
    meta: PaginationMeta
    message: str = "Success"
    message_th: str = "สำเร็จ"


class DMAReadingsResponse(BaseModel):
    """DMA readings response"""
    dma_id: str = Field(..., description="DMA ID")
    period: str = Field(..., description="Period (7d, 14d, 30d)")
    base_inflow: float = Field(..., description="Base inflow value")
    base_loss_pct: float = Field(..., description="Base loss percentage")
    readings: list[DMAReading] = Field(..., description="List of readings")
