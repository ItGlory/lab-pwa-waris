"""
ETL Scheduler Service
Background job scheduler for DMAMA data synchronization
TOR Reference: Section 4.3
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Callable, List
from dataclasses import dataclass, field
from enum import Enum
import uuid

logger = logging.getLogger(__name__)


class JobStatus(str, Enum):
    """ETL Job status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class JobType(str, Enum):
    """ETL Job types"""
    SCHEDULED_SYNC = "scheduled_sync"
    MANUAL_SYNC = "manual_sync"
    FILE_IMPORT = "file_import"


@dataclass
class ETLJob:
    """Represents an ETL job"""
    id: str
    job_type: JobType
    status: JobStatus
    source_type: str  # "api", "database", "file"
    source_config: Dict[str, Any]
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    records_processed: int = 0
    records_failed: int = 0
    error_message: Optional[str] = None
    retry_count: int = 0
    max_retries: int = 3

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "job_type": self.job_type.value,
            "status": self.status.value,
            "source_type": self.source_type,
            "source_config": self.source_config,
            "created_at": self.created_at.isoformat(),
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "records_processed": self.records_processed,
            "records_failed": self.records_failed,
            "error_message": self.error_message,
            "retry_count": self.retry_count,
        }


class ETLScheduler:
    """
    Background scheduler for ETL jobs
    Manages scheduled syncs, manual triggers, and file imports
    """

    def __init__(self):
        self._jobs: Dict[str, ETLJob] = {}
        self._job_history: List[ETLJob] = []
        self._is_running: bool = False
        self._scheduler_task: Optional[asyncio.Task] = None
        self._current_job: Optional[ETLJob] = None
        self._job_queue: asyncio.Queue = asyncio.Queue()

        # Configuration
        self.scheduled_sync_hour: int = 2  # 02:00
        self.scheduled_sync_minute: int = 0
        self.sync_interval_hours: int = 24
        self.max_history: int = 100

        # Callbacks
        self._on_job_complete: Optional[Callable] = None
        self._on_job_error: Optional[Callable] = None

        logger.info("ETL Scheduler initialized")

    @property
    def is_running(self) -> bool:
        return self._is_running

    @property
    def current_job(self) -> Optional[ETLJob]:
        return self._current_job

    @property
    def pending_jobs_count(self) -> int:
        return self._job_queue.qsize()

    async def start(self) -> None:
        """Start the scheduler"""
        if self._is_running:
            logger.warning("Scheduler already running")
            return

        self._is_running = True
        self._scheduler_task = asyncio.create_task(self._scheduler_loop())
        logger.info("ETL Scheduler started")

    async def stop(self) -> None:
        """Stop the scheduler gracefully"""
        if not self._is_running:
            return

        self._is_running = False

        if self._scheduler_task:
            self._scheduler_task.cancel()
            try:
                await self._scheduler_task
            except asyncio.CancelledError:
                pass

        logger.info("ETL Scheduler stopped")

    async def _scheduler_loop(self) -> None:
        """Main scheduler loop"""
        last_scheduled_run: Optional[datetime] = None

        while self._is_running:
            try:
                now = datetime.now()

                # Check for scheduled sync
                if self._should_run_scheduled_sync(now, last_scheduled_run):
                    await self.queue_scheduled_sync()
                    last_scheduled_run = now

                # Process job queue
                try:
                    job = self._job_queue.get_nowait()
                    await self._execute_job(job)
                except asyncio.QueueEmpty:
                    pass

                # Sleep briefly before next check
                await asyncio.sleep(10)

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Scheduler loop error: {e}")
                await asyncio.sleep(30)  # Wait before retrying

    def _should_run_scheduled_sync(
        self,
        now: datetime,
        last_run: Optional[datetime]
    ) -> bool:
        """Check if scheduled sync should run"""
        # Check if it's the right time
        if now.hour != self.scheduled_sync_hour or now.minute != self.scheduled_sync_minute:
            return False

        # Check if already ran today
        if last_run and (now - last_run).total_seconds() < 3600:
            return False

        return True

    async def queue_scheduled_sync(self) -> ETLJob:
        """Queue a scheduled sync job"""
        job = ETLJob(
            id=str(uuid.uuid4()),
            job_type=JobType.SCHEDULED_SYNC,
            status=JobStatus.PENDING,
            source_type="api",  # Default to API sync
            source_config={
                "sync_all": True,
                "triggered_by": "scheduler",
            },
            created_at=datetime.now(),
        )

        self._jobs[job.id] = job
        await self._job_queue.put(job)

        logger.info(f"Scheduled sync job queued: {job.id}")
        return job

    async def queue_manual_sync(
        self,
        source_type: str,
        source_url: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> ETLJob:
        """Queue a manual sync job"""
        job = ETLJob(
            id=str(uuid.uuid4()),
            job_type=JobType.MANUAL_SYNC,
            status=JobStatus.PENDING,
            source_type=source_type,
            source_config={
                "source_url": source_url,
                "start_date": start_date,
                "end_date": end_date,
                "triggered_by": "manual",
            },
            created_at=datetime.now(),
        )

        self._jobs[job.id] = job
        await self._job_queue.put(job)

        logger.info(f"Manual sync job queued: {job.id}")
        return job

    async def queue_file_import(
        self,
        filename: str,
        file_content: bytes,
        file_type: str,
    ) -> ETLJob:
        """Queue a file import job"""
        job = ETLJob(
            id=str(uuid.uuid4()),
            job_type=JobType.FILE_IMPORT,
            status=JobStatus.PENDING,
            source_type="file",
            source_config={
                "filename": filename,
                "file_type": file_type,
                "file_size": len(file_content),
                "triggered_by": "upload",
            },
            created_at=datetime.now(),
        )

        # Store file content temporarily (in production, use temp file or Redis)
        job.source_config["_content"] = file_content

        self._jobs[job.id] = job
        await self._job_queue.put(job)

        logger.info(f"File import job queued: {job.id} ({filename})")
        return job

    async def _execute_job(self, job: ETLJob) -> None:
        """Execute an ETL job"""
        self._current_job = job
        job.status = JobStatus.RUNNING
        job.started_at = datetime.now()

        logger.info(f"Starting job {job.id} ({job.job_type.value})")

        try:
            if job.source_type == "file":
                await self._execute_file_import(job)
            elif job.source_type == "api":
                await self._execute_api_sync(job)
            elif job.source_type == "database":
                await self._execute_db_sync(job)
            else:
                raise ValueError(f"Unknown source type: {job.source_type}")

            job.status = JobStatus.COMPLETED
            job.completed_at = datetime.now()
            logger.info(f"Job {job.id} completed: {job.records_processed} records")

            if self._on_job_complete:
                await self._on_job_complete(job)

        except Exception as e:
            logger.error(f"Job {job.id} failed: {e}")
            job.error_message = str(e)
            job.retry_count += 1

            if job.retry_count < job.max_retries:
                # Requeue for retry
                job.status = JobStatus.PENDING
                await self._job_queue.put(job)
                logger.info(f"Job {job.id} requeued for retry ({job.retry_count}/{job.max_retries})")
            else:
                job.status = JobStatus.FAILED
                job.completed_at = datetime.now()

                if self._on_job_error:
                    await self._on_job_error(job)

        finally:
            self._current_job = None
            self._archive_job(job)

    async def _execute_file_import(self, job: ETLJob) -> None:
        """Execute file import job"""
        from services.etl_service import ETLService
        from core.database import get_db_session

        file_content = job.source_config.get("_content")
        file_type = job.source_config.get("file_type", "csv")

        if not file_content:
            raise ValueError("No file content provided")

        async with get_db_session() as db:
            etl = ETLService(db)

            if file_type == "csv":
                content_str = file_content.decode("utf-8")
                stats = await etl.run_full_etl("csv", content_str)
            else:
                # For Excel, save to temp file and process
                import tempfile
                import os

                with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_type}") as f:
                    f.write(file_content)
                    temp_path = f.name

                try:
                    # Read Excel with pandas
                    import pandas as pd
                    df = pd.read_excel(temp_path)
                    content_str = df.to_csv(index=False)
                    stats = await etl.run_full_etl("csv", content_str)
                finally:
                    os.unlink(temp_path)

            job.records_processed = stats.get("loaded", 0)
            job.records_failed = stats.get("errors", 0)

        # Clean up stored content
        if "_content" in job.source_config:
            del job.source_config["_content"]

    async def _execute_api_sync(self, job: ETLJob) -> None:
        """Execute API sync job"""
        from connectors.dmama import DMAMAAPIConnector
        from services.etl_service import ETLService
        from core.database import get_db_session
        from core.config import settings

        source_url = job.source_config.get("source_url") or settings.DMAMA_API_URL

        if not source_url:
            raise ValueError("DMAMA API URL not configured")

        async with DMAMAAPIConnector(
            base_url=source_url,
            api_key=settings.DMAMA_API_KEY,
        ) as connector:
            # Fetch readings
            readings = await connector.fetch_readings(
                dma_id="all",
                start_date=job.source_config.get("start_date"),
                end_date=job.source_config.get("end_date"),
            )

            async with get_db_session() as db:
                etl = ETLService(db)

                # Transform and load
                transformed = await etl.transform_dma_readings(readings)
                loaded = await etl.load_dma_readings(transformed)
                await etl.update_dma_current_values()

                job.records_processed = loaded
                job.records_failed = etl.stats.get("errors", 0)

    async def _execute_db_sync(self, job: ETLJob) -> None:
        """Execute database sync job"""
        from connectors.dmama import DMAMADBConnector
        from services.etl_service import ETLService
        from core.database import get_db_session
        from core.config import settings

        connection_string = settings.DMAMA_DB_URL

        if not connection_string:
            raise ValueError("DMAMA database connection not configured")

        async with DMAMADBConnector(connection_string) as connector:
            # Fetch latest readings
            readings = await connector.fetch_latest_readings(hours=24)

            async with get_db_session() as db:
                etl = ETLService(db)

                # Transform and load
                transformed = await etl.transform_dma_readings(readings)
                loaded = await etl.load_dma_readings(transformed)
                await etl.update_dma_current_values()

                job.records_processed = loaded
                job.records_failed = etl.stats.get("errors", 0)

    def _archive_job(self, job: ETLJob) -> None:
        """Archive completed job to history"""
        self._job_history.append(job)

        # Trim history if too long
        if len(self._job_history) > self.max_history:
            self._job_history = self._job_history[-self.max_history:]

    def get_job(self, job_id: str) -> Optional[ETLJob]:
        """Get job by ID"""
        return self._jobs.get(job_id)

    def get_status(self) -> Dict[str, Any]:
        """Get scheduler status"""
        return {
            "is_running": self._is_running,
            "current_job": self._current_job.to_dict() if self._current_job else None,
            "pending_jobs": self._job_queue.qsize(),
            "next_scheduled_sync": f"{self.scheduled_sync_hour:02d}:{self.scheduled_sync_minute:02d}",
            "total_jobs_completed": len([j for j in self._job_history if j.status == JobStatus.COMPLETED]),
            "total_jobs_failed": len([j for j in self._job_history if j.status == JobStatus.FAILED]),
        }

    def get_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get job history"""
        jobs = sorted(
            self._job_history,
            key=lambda j: j.created_at,
            reverse=True
        )[:limit]

        return [job.to_dict() for job in jobs]

    def set_callbacks(
        self,
        on_complete: Optional[Callable] = None,
        on_error: Optional[Callable] = None
    ) -> None:
        """Set callback functions"""
        self._on_job_complete = on_complete
        self._on_job_error = on_error


# Global scheduler instance
_scheduler: Optional[ETLScheduler] = None


def get_scheduler() -> ETLScheduler:
    """Get global scheduler instance"""
    global _scheduler
    if _scheduler is None:
        _scheduler = ETLScheduler()
    return _scheduler


async def start_scheduler() -> None:
    """Start global scheduler"""
    scheduler = get_scheduler()
    await scheduler.start()


async def stop_scheduler() -> None:
    """Stop global scheduler"""
    global _scheduler
    if _scheduler:
        await _scheduler.stop()
        _scheduler = None
