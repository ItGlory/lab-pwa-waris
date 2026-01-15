"""
Tests for ETL Scheduler Service
Tests background job scheduling and execution
"""

import pytest
import asyncio
from datetime import datetime
from unittest.mock import AsyncMock, patch, MagicMock

from services.etl_scheduler import (
    ETLScheduler,
    ETLJob,
    JobStatus,
    JobType,
    get_scheduler,
)


class TestETLJob:
    """Test ETLJob dataclass"""

    def test_job_creation(self):
        """Test basic job creation"""
        job = ETLJob(
            id="test-001",
            job_type=JobType.MANUAL_SYNC,
            status=JobStatus.PENDING,
            source_type="api",
            source_config={"url": "http://example.com"},
            created_at=datetime.now(),
        )

        assert job.id == "test-001"
        assert job.job_type == JobType.MANUAL_SYNC
        assert job.status == JobStatus.PENDING
        assert job.source_type == "api"
        assert job.records_processed == 0
        assert job.retry_count == 0

    def test_job_to_dict(self):
        """Test job serialization to dict"""
        now = datetime.now()
        job = ETLJob(
            id="test-001",
            job_type=JobType.FILE_IMPORT,
            status=JobStatus.COMPLETED,
            source_type="file",
            source_config={"filename": "test.csv"},
            created_at=now,
            started_at=now,
            completed_at=now,
            records_processed=100,
        )

        d = job.to_dict()

        assert d["id"] == "test-001"
        assert d["job_type"] == "file_import"
        assert d["status"] == "completed"
        assert d["records_processed"] == 100
        assert "created_at" in d


class TestETLScheduler:
    """Test ETLScheduler class"""

    @pytest.fixture
    def scheduler(self):
        """Create a fresh scheduler instance"""
        return ETLScheduler()

    def test_scheduler_initialization(self, scheduler):
        """Test scheduler initializes correctly"""
        assert scheduler.is_running is False
        assert scheduler.current_job is None
        assert scheduler.pending_jobs_count == 0

    @pytest.mark.asyncio
    async def test_start_stop(self, scheduler):
        """Test scheduler start and stop"""
        assert scheduler.is_running is False

        await scheduler.start()
        assert scheduler.is_running is True

        await scheduler.stop()
        assert scheduler.is_running is False

    @pytest.mark.asyncio
    async def test_queue_manual_sync(self, scheduler):
        """Test queuing a manual sync job"""
        job = await scheduler.queue_manual_sync(
            source_type="api",
            source_url="http://example.com",
            start_date="2026-01-01",
            end_date="2026-01-15",
        )

        assert job.id is not None
        assert job.job_type == JobType.MANUAL_SYNC
        assert job.status == JobStatus.PENDING
        assert job.source_type == "api"
        assert scheduler.pending_jobs_count == 1

    @pytest.mark.asyncio
    async def test_queue_file_import(self, scheduler):
        """Test queuing a file import job"""
        content = b"dma_id,inflow,outflow\nDMA001,100,90"
        job = await scheduler.queue_file_import(
            filename="test.csv",
            file_content=content,
            file_type="csv",
        )

        assert job.id is not None
        assert job.job_type == JobType.FILE_IMPORT
        assert job.source_type == "file"
        assert job.source_config["filename"] == "test.csv"
        assert job.source_config["file_size"] == len(content)

    @pytest.mark.asyncio
    async def test_queue_scheduled_sync(self, scheduler):
        """Test queuing a scheduled sync job"""
        job = await scheduler.queue_scheduled_sync()

        assert job.id is not None
        assert job.job_type == JobType.SCHEDULED_SYNC
        assert job.source_config["triggered_by"] == "scheduler"

    def test_get_job(self, scheduler):
        """Test retrieving a job by ID"""
        # Initially no jobs
        assert scheduler.get_job("nonexistent") is None

    def test_get_status(self, scheduler):
        """Test getting scheduler status"""
        status = scheduler.get_status()

        assert "is_running" in status
        assert "current_job" in status
        assert "pending_jobs" in status
        assert "next_scheduled_sync" in status
        assert status["is_running"] is False

    @pytest.mark.asyncio
    async def test_get_status_with_jobs(self, scheduler):
        """Test getting status with queued jobs"""
        await scheduler.queue_manual_sync(source_type="api")
        await scheduler.queue_manual_sync(source_type="database")

        status = scheduler.get_status()
        assert status["pending_jobs"] == 2

    def test_get_history_empty(self, scheduler):
        """Test getting history when empty"""
        history = scheduler.get_history()
        assert history == []

    @pytest.mark.asyncio
    async def test_set_callbacks(self, scheduler):
        """Test setting callback functions"""
        on_complete = AsyncMock()
        on_error = AsyncMock()

        scheduler.set_callbacks(on_complete=on_complete, on_error=on_error)

        assert scheduler._on_job_complete == on_complete
        assert scheduler._on_job_error == on_error


class TestGlobalScheduler:
    """Test global scheduler instance"""

    def test_get_scheduler_singleton(self):
        """Test get_scheduler returns same instance"""
        scheduler1 = get_scheduler()
        scheduler2 = get_scheduler()

        # They should be the same instance
        assert scheduler1 is scheduler2

    def test_scheduler_has_default_config(self):
        """Test scheduler has default configuration"""
        scheduler = get_scheduler()

        assert scheduler.scheduled_sync_hour == 2
        assert scheduler.scheduled_sync_minute == 0
        assert scheduler.sync_interval_hours == 24
        assert scheduler.max_history == 100


class TestJobStatusEnum:
    """Test JobStatus enum"""

    def test_status_values(self):
        """Test all status values exist"""
        assert JobStatus.PENDING.value == "pending"
        assert JobStatus.RUNNING.value == "running"
        assert JobStatus.COMPLETED.value == "completed"
        assert JobStatus.FAILED.value == "failed"
        assert JobStatus.CANCELLED.value == "cancelled"


class TestJobTypeEnum:
    """Test JobType enum"""

    def test_type_values(self):
        """Test all job type values exist"""
        assert JobType.SCHEDULED_SYNC.value == "scheduled_sync"
        assert JobType.MANUAL_SYNC.value == "manual_sync"
        assert JobType.FILE_IMPORT.value == "file_import"
