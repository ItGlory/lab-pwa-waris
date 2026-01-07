"""
WARIS API Routers
"""

from routers.auth import router as auth_router
from routers.dma import router as dma_router
from routers.alerts import router as alerts_router
from routers.reports import router as reports_router
from routers.dashboard import router as dashboard_router
from routers.chat import router as chat_router

__all__ = [
    "auth_router",
    "dma_router",
    "alerts_router",
    "reports_router",
    "dashboard_router",
    "chat_router",
]
