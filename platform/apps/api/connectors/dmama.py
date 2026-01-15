"""
DMAMA Data Connectors
Supports: API, Direct Database, File Import
TOR Reference: Section 4.3
"""

from typing import List, Dict, Any, Optional
from pathlib import Path
import logging
import asyncio

import httpx

from .base import DataConnector
from .dmama_parsers import (
    parse_csv_content,
    parse_excel_content,
    ParseResult,
)

logger = logging.getLogger(__name__)


# Retry configuration
MAX_RETRIES = 3
RETRY_DELAY = 1.0  # seconds


class DMAMAAPIConnector(DataConnector):
    """Connector for DMAMA REST API with retry support"""

    def __init__(
        self,
        base_url: str,
        api_key: Optional[str] = None,
        timeout: float = 30.0,
        max_retries: int = MAX_RETRIES,
    ):
        super().__init__()
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout
        self.max_retries = max_retries
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
        """Fetch data from DMAMA API endpoint with retry"""
        if not self.is_connected or not self.client:
            raise ConnectionError("Not connected to DMAMA API")

        last_error: Optional[Exception] = None

        for attempt in range(self.max_retries):
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
                # Don't retry on 4xx errors
                if 400 <= e.response.status_code < 500:
                    raise
                last_error = e
            except httpx.TimeoutException as e:
                logger.warning(f"API timeout (attempt {attempt + 1}/{self.max_retries})")
                last_error = e
            except Exception as e:
                logger.error(f"API fetch failed: {e}")
                last_error = e

            # Wait before retry with exponential backoff
            if attempt < self.max_retries - 1:
                wait_time = RETRY_DELAY * (2 ** attempt)
                await asyncio.sleep(wait_time)

        raise last_error or ConnectionError("API fetch failed after retries")

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
    """Connector for file-based data import (CSV/Excel) with Thai encoding support"""

    def __init__(self, file_path: Optional[str] = None):
        super().__init__()
        self.file_path = file_path
        self.data: List[Dict] = []
        self.last_parse_result: Optional[ParseResult] = None

    async def connect(self) -> None:
        """Prepare file connector (no actual connection needed)"""
        self.is_connected = True
        logger.info("File connector ready")

    async def fetch(
        self,
        file_path: str,
        params: Optional[Dict] = None
    ) -> List[Dict[str, Any]]:
        """Read and parse file with automatic encoding detection"""
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        try:
            # Read file as bytes for encoding detection
            with open(path, "rb") as f:
                content = f.read()

            if path.suffix.lower() == ".csv":
                result = parse_csv_content(
                    content,
                    encoding=params.get("encoding") if params else None,
                    delimiter=params.get("delimiter") if params else None,
                )
            elif path.suffix.lower() in [".xlsx", ".xls"]:
                result = parse_excel_content(
                    content,
                    sheet_name=params.get("sheet_name") if params else None,
                )
            else:
                raise ValueError(f"Unsupported file type: {path.suffix}")

            self.last_parse_result = result

            if not result.success:
                logger.error(f"File parsing failed: {result.errors}")
                raise ValueError(f"File parsing failed: {result.errors[0] if result.errors else 'Unknown error'}")

            self._log_fetch(len(result.records), f"File {path.name}")
            return result.records

        except Exception as e:
            logger.error(f"File read failed: {e}")
            raise

    async def fetch_from_content(
        self,
        content: bytes,
        file_type: str = "csv",
        encoding: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Parse data from file content (uploaded file) with encoding detection"""
        if file_type.lower() == "csv":
            result = parse_csv_content(content, encoding=encoding)
        elif file_type.lower() in ["xlsx", "xls"]:
            result = parse_excel_content(content)
        else:
            raise ValueError(f"Unsupported content type: {file_type}")

        self.last_parse_result = result

        if not result.success:
            logger.error(f"Content parsing failed: {result.errors}")
            raise ValueError(f"Parsing failed: {result.errors[0] if result.errors else 'Unknown error'}")

        self._log_fetch(len(result.records), "Uploaded content")
        return result.records

    async def fetch_from_string(
        self,
        content: str,
        file_type: str = "csv"
    ) -> List[Dict[str, Any]]:
        """Parse data from string content (for backward compatibility)"""
        return await self.fetch_from_content(
            content.encode("utf-8"),
            file_type=file_type,
            encoding="utf-8",
        )

    def get_parse_result(self) -> Optional[ParseResult]:
        """Get the last parse result with detailed statistics"""
        return self.last_parse_result

    async def close(self) -> None:
        """Close file connector"""
        self.is_connected = False
        self.data = []
        self.last_parse_result = None
        logger.info("File connector closed")
