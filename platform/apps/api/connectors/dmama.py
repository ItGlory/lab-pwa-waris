"""
DMAMA Data Connectors
Supports: API, Direct Database, File Import
TOR Reference: Section 4.3
"""

from typing import List, Dict, Any, Optional
from pathlib import Path
import logging
import csv
import io

import httpx

from .base import DataConnector

logger = logging.getLogger(__name__)


class DMAMAAPIConnector(DataConnector):
    """Connector for DMAMA REST API"""

    def __init__(
        self,
        base_url: str,
        api_key: Optional[str] = None,
        timeout: float = 30.0
    ):
        super().__init__()
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout
        self.client: Optional[httpx.AsyncClient] = None

    async def connect(self) -> None:
        """Connect to DMAMA API"""
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers=headers,
            timeout=self.timeout
        )
        self.is_connected = True
        logger.info(f"Connected to DMAMA API: {self.base_url}")

    async def fetch(
        self,
        endpoint: str,
        params: Optional[Dict] = None
    ) -> List[Dict[str, Any]]:
        """Fetch data from DMAMA API endpoint"""
        if not self.is_connected or not self.client:
            raise ConnectionError("Not connected to DMAMA API")

        try:
            response = await self.client.get(endpoint, params=params)
            response.raise_for_status()

            data = response.json()

            # Handle common response formats
            if isinstance(data, list):
                records = data
            elif isinstance(data, dict):
                records = data.get("data", data.get("items", data.get("results", [])))
            else:
                records = []

            self._log_fetch(len(records), f"API {endpoint}")
            return records

        except httpx.HTTPStatusError as e:
            logger.error(f"API error {e.response.status_code}: {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"API fetch failed: {e}")
            raise

    async def fetch_dmas(self, region_id: Optional[str] = None) -> List[Dict]:
        """Fetch DMA list from DMAMA"""
        params = {}
        if region_id:
            params["region_id"] = region_id
        return await self.fetch("/api/v1/dmas", params)

    async def fetch_readings(
        self,
        dma_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> List[Dict]:
        """Fetch DMA readings from DMAMA"""
        params = {"dma_id": dma_id}
        if start_date:
            params["start_date"] = start_date
        if end_date:
            params["end_date"] = end_date
        return await self.fetch("/api/v1/readings", params)

    async def close(self) -> None:
        """Close API connection"""
        if self.client:
            await self.client.aclose()
            self.client = None
        self.is_connected = False
        logger.info("Disconnected from DMAMA API")


class DMAMADBConnector(DataConnector):
    """Connector for direct DMAMA database access"""

    def __init__(self, connection_string: str):
        super().__init__()
        self.connection_string = connection_string
        self.pool = None

    async def connect(self) -> None:
        """Connect to DMAMA database"""
        try:
            import asyncpg
            self.pool = await asyncpg.create_pool(
                self.connection_string,
                min_size=2,
                max_size=10,
                command_timeout=60
            )
            self.is_connected = True
            logger.info("Connected to DMAMA database")
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise

    async def fetch(
        self,
        query: str,
        params: Optional[Dict] = None
    ) -> List[Dict[str, Any]]:
        """Execute SQL query and return results"""
        if not self.is_connected or not self.pool:
            raise ConnectionError("Not connected to DMAMA database")

        try:
            async with self.pool.acquire() as conn:
                if params:
                    rows = await conn.fetch(query, *params.values())
                else:
                    rows = await conn.fetch(query)

                records = [dict(row) for row in rows]
                self._log_fetch(len(records), "Database")
                return records

        except Exception as e:
            logger.error(f"Database query failed: {e}")
            raise

    async def fetch_dmas(self) -> List[Dict]:
        """Fetch all DMAs from DMAMA database"""
        query = """
            SELECT
                dma_id as id,
                dma_code as code,
                dma_name_th as name_th,
                dma_name_en as name_en,
                branch_id,
                region_id,
                area_km2,
                population,
                connections,
                pipe_length_km
            FROM dma_master
            WHERE is_active = true
        """
        return await self.fetch(query)

    async def fetch_latest_readings(self, hours: int = 24) -> List[Dict]:
        """Fetch latest readings from DMAMA database"""
        query = """
            SELECT
                dma_id,
                reading_timestamp as reading_date,
                flow_in as inflow,
                flow_out as outflow,
                pressure
            FROM dma_readings
            WHERE reading_timestamp >= NOW() - INTERVAL '%s hours'
            ORDER BY dma_id, reading_timestamp DESC
        """
        return await self.fetch(query, {"hours": hours})

    async def close(self) -> None:
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
            self.pool = None
        self.is_connected = False
        logger.info("Disconnected from DMAMA database")


class DMAMAFileConnector(DataConnector):
    """Connector for file-based data import (CSV/Excel)"""

    def __init__(self, file_path: Optional[str] = None):
        super().__init__()
        self.file_path = file_path
        self.data: List[Dict] = []

    async def connect(self) -> None:
        """Prepare file connector (no actual connection needed)"""
        self.is_connected = True
        logger.info("File connector ready")

    async def fetch(
        self,
        file_path: str,
        params: Optional[Dict] = None
    ) -> List[Dict[str, Any]]:
        """Read and parse file"""
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        try:
            if path.suffix.lower() == ".csv":
                records = await self._read_csv(path, params)
            elif path.suffix.lower() in [".xlsx", ".xls"]:
                records = await self._read_excel(path, params)
            else:
                raise ValueError(f"Unsupported file type: {path.suffix}")

            self._log_fetch(len(records), f"File {path.name}")
            return records

        except Exception as e:
            logger.error(f"File read failed: {e}")
            raise

    async def fetch_from_content(
        self,
        content: str,
        file_type: str = "csv"
    ) -> List[Dict[str, Any]]:
        """Parse data from file content (uploaded file)"""
        if file_type.lower() == "csv":
            reader = csv.DictReader(io.StringIO(content))
            records = [dict(row) for row in reader]
        else:
            raise ValueError(f"Unsupported content type: {file_type}")

        self._log_fetch(len(records), "Uploaded content")
        return records

    async def _read_csv(
        self,
        path: Path,
        params: Optional[Dict] = None
    ) -> List[Dict]:
        """Read CSV file"""
        encoding = params.get("encoding", "utf-8") if params else "utf-8"
        delimiter = params.get("delimiter", ",") if params else ","

        records = []
        with open(path, "r", encoding=encoding) as f:
            reader = csv.DictReader(f, delimiter=delimiter)
            for row in reader:
                records.append(dict(row))

        return records

    async def _read_excel(
        self,
        path: Path,
        params: Optional[Dict] = None
    ) -> List[Dict]:
        """Read Excel file"""
        try:
            import pandas as pd
        except ImportError:
            raise ImportError("pandas is required for Excel support")

        sheet_name = params.get("sheet_name", 0) if params else 0
        df = pd.read_excel(path, sheet_name=sheet_name)

        return df.to_dict("records")

    async def close(self) -> None:
        """Close file connector"""
        self.is_connected = False
        self.data = []
        logger.info("File connector closed")
