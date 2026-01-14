"""
ETL Service for DMAMA Data Integration
TOR Reference: Section 4.3
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pathlib import Path
import logging
import csv
import io

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, insert, select
from sqlalchemy.dialects.postgresql import insert as pg_insert

logger = logging.getLogger(__name__)


class DataQualityError(Exception):
    """Raised when data quality check fails"""
    pass


class ETLService:
    """ETL Pipeline for DMAMA data integration"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.stats = {
            "extracted": 0,
            "transformed": 0,
            "loaded": 0,
            "errors": 0,
            "warnings": 0,
        }

    async def extract_from_csv(self, content: str) -> List[Dict[str, Any]]:
        """Extract data from CSV content"""
        records = []
        reader = csv.DictReader(io.StringIO(content))

        for row in reader:
            records.append(dict(row))
            self.stats["extracted"] += 1

        logger.info(f"Extracted {len(records)} records from CSV")
        return records

    async def extract_from_api(
        self,
        client,  # httpx.AsyncClient
        endpoint: str,
        params: Optional[Dict] = None
    ) -> List[Dict[str, Any]]:
        """Extract data from DMAMA API"""
        try:
            response = await client.get(endpoint, params=params)
            response.raise_for_status()
            data = response.json()

            records = data.get("data", []) if isinstance(data, dict) else data
            self.stats["extracted"] += len(records)

            logger.info(f"Extracted {len(records)} records from API")
            return records
        except Exception as e:
            logger.error(f"API extraction failed: {e}")
            self.stats["errors"] += 1
            raise

    async def transform_dma_readings(
        self,
        raw_data: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Transform DMA readings data"""
        transformed = []

        for record in raw_data:
            try:
                # Validate required fields
                if not self._validate_reading(record):
                    self.stats["warnings"] += 1
                    continue

                # Transform and clean
                cleaned = {
                    "dma_id": str(record.get("dma_id", "")).strip(),
                    "reading_date": self._parse_datetime(record.get("reading_date") or record.get("timestamp")),
                    "inflow": self._to_float(record.get("inflow") or record.get("flow_in")),
                    "outflow": self._to_float(record.get("outflow") or record.get("flow_out")),
                    "loss": 0.0,  # Calculated below
                    "loss_percentage": 0.0,  # Calculated below
                    "pressure": self._to_float(record.get("pressure", 0)),
                }

                # Calculate loss
                cleaned["loss"] = cleaned["inflow"] - cleaned["outflow"]
                if cleaned["inflow"] > 0:
                    cleaned["loss_percentage"] = (cleaned["loss"] / cleaned["inflow"]) * 100
                else:
                    cleaned["loss_percentage"] = 0.0

                # Validate ranges
                if not self._validate_ranges(cleaned):
                    self.stats["warnings"] += 1
                    continue

                transformed.append(cleaned)
                self.stats["transformed"] += 1

            except Exception as e:
                logger.warning(f"Transform error for record: {e}")
                self.stats["errors"] += 1
                continue

        logger.info(f"Transformed {len(transformed)} records")
        return transformed

    async def load_dma_readings(
        self,
        data: List[Dict[str, Any]],
        upsert: bool = True
    ) -> int:
        """Load DMA readings to PostgreSQL"""
        if not data:
            return 0

        loaded = 0

        try:
            # Generate UUIDs for new records
            import uuid

            for record in data:
                record["id"] = str(uuid.uuid4())

            if upsert:
                # Use PostgreSQL upsert (ON CONFLICT DO UPDATE)
                stmt = text("""
                    INSERT INTO dma_readings (id, dma_id, reading_date, inflow, outflow, loss, loss_percentage, pressure)
                    VALUES (:id, :dma_id, :reading_date, :inflow, :outflow, :loss, :loss_percentage, :pressure)
                    ON CONFLICT (dma_id, reading_date)
                    DO UPDATE SET
                        inflow = EXCLUDED.inflow,
                        outflow = EXCLUDED.outflow,
                        loss = EXCLUDED.loss,
                        loss_percentage = EXCLUDED.loss_percentage,
                        pressure = EXCLUDED.pressure
                """)
            else:
                stmt = text("""
                    INSERT INTO dma_readings (id, dma_id, reading_date, inflow, outflow, loss, loss_percentage, pressure)
                    VALUES (:id, :dma_id, :reading_date, :inflow, :outflow, :loss, :loss_percentage, :pressure)
                    ON CONFLICT DO NOTHING
                """)

            for record in data:
                await self.db.execute(stmt, record)
                loaded += 1
                self.stats["loaded"] += 1

            await self.db.commit()
            logger.info(f"Loaded {loaded} records to database")

        except Exception as e:
            logger.error(f"Load error: {e}")
            await self.db.rollback()
            self.stats["errors"] += 1
            raise

        return loaded

    async def update_dma_current_values(self) -> int:
        """Update DMA current values from latest readings"""
        stmt = text("""
            UPDATE dmas d
            SET
                current_inflow = r.inflow,
                current_outflow = r.outflow,
                current_loss = r.loss,
                loss_percentage = r.loss_percentage,
                avg_pressure = r.pressure,
                last_reading_at = r.reading_date,
                updated_at = NOW(),
                status = CASE
                    WHEN r.loss_percentage >= 20 THEN 'critical'
                    WHEN r.loss_percentage >= 15 THEN 'warning'
                    ELSE 'normal'
                END
            FROM (
                SELECT DISTINCT ON (dma_id)
                    dma_id, inflow, outflow, loss, loss_percentage, pressure, reading_date
                FROM dma_readings
                ORDER BY dma_id, reading_date DESC
            ) r
            WHERE d.id = r.dma_id
        """)

        result = await self.db.execute(stmt)
        await self.db.commit()

        updated = result.rowcount
        logger.info(f"Updated {updated} DMAs with latest readings")
        return updated

    async def run_full_etl(
        self,
        source_type: str,
        source_data: Any,
        **kwargs
    ) -> Dict[str, int]:
        """Run complete ETL pipeline"""
        self.stats = {
            "extracted": 0,
            "transformed": 0,
            "loaded": 0,
            "errors": 0,
            "warnings": 0,
        }

        try:
            # Extract
            if source_type == "csv":
                raw_data = await self.extract_from_csv(source_data)
            elif source_type == "api":
                raw_data = await self.extract_from_api(
                    kwargs.get("client"),
                    source_data,
                    kwargs.get("params")
                )
            else:
                raise ValueError(f"Unknown source type: {source_type}")

            # Transform
            transformed = await self.transform_dma_readings(raw_data)

            # Load
            await self.load_dma_readings(transformed)

            # Update DMA current values
            await self.update_dma_current_values()

            logger.info(f"ETL completed: {self.stats}")
            return self.stats

        except Exception as e:
            logger.error(f"ETL failed: {e}")
            self.stats["errors"] += 1
            return self.stats

    def _validate_reading(self, record: Dict) -> bool:
        """Validate required fields exist"""
        required = ["dma_id"]
        has_flow = ("inflow" in record or "flow_in" in record) and \
                   ("outflow" in record or "flow_out" in record)

        return all(record.get(f) for f in required) and has_flow

    def _validate_ranges(self, record: Dict) -> bool:
        """Validate data ranges"""
        # Loss percentage should be 0-100
        if record["loss_percentage"] < 0 or record["loss_percentage"] > 100:
            logger.warning(f"Invalid loss percentage: {record['loss_percentage']}")
            return False

        # Flow values should be non-negative
        if record["inflow"] < 0 or record["outflow"] < 0:
            logger.warning("Negative flow values detected")
            return False

        return True

    def _parse_datetime(self, value: Any) -> datetime:
        """Parse datetime from various formats"""
        if isinstance(value, datetime):
            return value
        if isinstance(value, str):
            # Try common formats
            formats = [
                "%Y-%m-%d %H:%M:%S",
                "%Y-%m-%dT%H:%M:%S",
                "%Y-%m-%dT%H:%M:%SZ",
                "%Y-%m-%d",
                "%d/%m/%Y %H:%M:%S",
                "%d/%m/%Y",
            ]
            for fmt in formats:
                try:
                    return datetime.strptime(value, fmt)
                except ValueError:
                    continue
        return datetime.now()

    def _to_float(self, value: Any) -> float:
        """Convert value to float safely"""
        if value is None:
            return 0.0
        try:
            # Remove commas and whitespace
            if isinstance(value, str):
                value = value.replace(",", "").strip()
            return float(value)
        except (ValueError, TypeError):
            return 0.0
