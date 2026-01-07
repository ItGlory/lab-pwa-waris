"""
DMA (District Metered Area) Model
"""

from typing import Optional, List
from datetime import datetime

from sqlalchemy import String, Float, Integer, ForeignKey, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from models.base import Base, TimestampMixin


class DMAStatus(str, enum.Enum):
    """DMA status levels"""
    NORMAL = "normal"
    WARNING = "warning"
    CRITICAL = "critical"


class Region(Base, TimestampMixin):
    """Regional area"""
    __tablename__ = "regions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    name_th: Mapped[str] = mapped_column(String(255), nullable=False)
    name_en: Mapped[str] = mapped_column(String(255), nullable=False)

    # Relationships
    branches: Mapped[List["Branch"]] = relationship("Branch", back_populates="region")
    dmas: Mapped[List["DMA"]] = relationship("DMA", back_populates="region")
    users: Mapped[List["User"]] = relationship("User", back_populates="region")


class Branch(Base, TimestampMixin):
    """PWA Branch"""
    __tablename__ = "branches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    name_th: Mapped[str] = mapped_column(String(255), nullable=False)
    name_en: Mapped[str] = mapped_column(String(255), nullable=False)
    region_id: Mapped[str] = mapped_column(String(36), ForeignKey("regions.id"), nullable=False)

    # Relationships
    region: Mapped["Region"] = relationship("Region", back_populates="branches")
    dmas: Mapped[List["DMA"]] = relationship("DMA", back_populates="branch")
    users: Mapped[List["User"]] = relationship("User", back_populates="branch")


class DMA(Base, TimestampMixin):
    """District Metered Area"""
    __tablename__ = "dmas"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    name_th: Mapped[str] = mapped_column(String(255), nullable=False)
    name_en: Mapped[str] = mapped_column(String(255), nullable=False)
    branch_id: Mapped[str] = mapped_column(String(36), ForeignKey("branches.id"), nullable=False)
    region_id: Mapped[str] = mapped_column(String(36), ForeignKey("regions.id"), nullable=False)

    # Physical attributes
    area_km2: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    population: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    connections: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    pipe_length_km: Mapped[float] = mapped_column(Float, nullable=False, default=0)

    # Current readings (updated by IoT/sensors)
    current_inflow: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    current_outflow: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    current_loss: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    loss_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    avg_pressure: Mapped[float] = mapped_column(Float, nullable=False, default=0)

    # Status
    status: Mapped[DMAStatus] = mapped_column(
        Enum(DMAStatus, name="dma_status"),
        nullable=False,
        default=DMAStatus.NORMAL
    )
    last_reading_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    branch: Mapped["Branch"] = relationship("Branch", back_populates="dmas")
    region: Mapped["Region"] = relationship("Region", back_populates="dmas")
    readings: Mapped[List["DMAReading"]] = relationship("DMAReading", back_populates="dma")
    alerts: Mapped[List["Alert"]] = relationship("Alert", back_populates="dma")


class DMAReading(Base):
    """DMA water reading measurement"""
    __tablename__ = "dma_readings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    dma_id: Mapped[str] = mapped_column(String(36), ForeignKey("dmas.id"), nullable=False, index=True)
    reading_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    inflow: Mapped[float] = mapped_column(Float, nullable=False)
    outflow: Mapped[float] = mapped_column(Float, nullable=False)
    loss: Mapped[float] = mapped_column(Float, nullable=False)
    loss_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    pressure: Mapped[float] = mapped_column(Float, nullable=False)

    # Relationships
    dma: Mapped["DMA"] = relationship("DMA", back_populates="readings")


# Import Alert for relationship
from models.alert import Alert
