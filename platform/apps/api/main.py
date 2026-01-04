"""
WARIS API - Water Loss Intelligent Analysis and Reporting System
FastAPI Backend Service
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan events."""
    # Startup
    print("🚀 Starting WARIS API...")
    yield
    # Shutdown
    print("👋 Shutting down WARIS API...")


app = FastAPI(
    title="WARIS API",
    description="ระบบวิเคราะห์และรายงานข้อมูลน้ำสูญเสียอัจฉริยะ",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint."""
    return {
        "message": "WARIS API",
        "message_th": "ระบบวิเคราะห์และรายงานข้อมูลน้ำสูญเสียอัจฉริยะ",
        "version": "0.1.0",
        "status": "running",
    }


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy", "status_th": "ปกติ"}


# Import and include routers
# from routers import dma, water_loss, reports, alerts, chat
# app.include_router(dma.router, prefix="/api/v1/dma", tags=["DMA"])
# app.include_router(water_loss.router, prefix="/api/v1/water-loss", tags=["Water Loss"])
# app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
# app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])
# app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
