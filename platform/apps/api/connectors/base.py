"""
Base Data Connector Abstract Class
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class DataConnector(ABC):
    """Abstract base class for data connectors"""

    def __init__(self):
        self.is_connected = False
        self.connection = None

    @abstractmethod
    async def connect(self) -> None:
        """Establish connection to data source"""
        pass

    @abstractmethod
    async def fetch(self, query: str, params: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """Fetch data from source"""
        pass

    @abstractmethod
    async def close(self) -> None:
        """Close connection"""
        pass

    async def __aenter__(self):
        await self.connect()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    def _log_fetch(self, count: int, source: str):
        """Log fetch operation"""
        logger.info(f"Fetched {count} records from {source}")
