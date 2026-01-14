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
from routers import auth_router, dma_router, alerts_router, reports_router, dashboard_router, chat_router
from routers.ws import router as ws_router
from routers.etl import router as etl_router
from routers.ai import router as ai_router
from routers.knowledge import router as knowledge_router

app.include_router(auth_router, prefix="/api/v1")
app.include_router(dma_router, prefix="/api/v1")
app.include_router(alerts_router, prefix="/api/v1")
app.include_router(reports_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(ws_router, prefix="/api/v1")
app.include_router(etl_router)  # ETL routes for DMAMA integration
app.include_router(ai_router)  # AI inference routes
app.include_router(knowledge_router, prefix="/api/v1")  # RAG knowledge base routes
