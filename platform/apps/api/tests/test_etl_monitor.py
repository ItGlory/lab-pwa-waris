"""
Tests for ETL Monitor Service
Tests logging, metrics, and alerting
"""

import pytest
from datetime import datetime, timedelta

from services.etl_monitor import (
    ETLMonitor,
    ETLMetrics,
    ETLAlert,
    AlertSeverity,
    get_monitor,
)


class TestETLMetrics:
    """Test ETLMetrics dataclass"""

    def test_metrics_creation(self):
        """Test basic metrics creation"""
        metrics = ETLMetrics(
            job_id="test-001",
            job_type="manual_sync",
            source_type="api",
            started_at=datetime.now(),
        )

        assert metrics.job_id == "test-001"
        assert metrics.records_extracted == 0
        assert metrics.records_loaded == 0
        assert len(metrics.errors) == 0

    def test_metrics_to_dict(self):
        """Test metrics serialization"""
        now = datetime.now()
        metrics = ETLMetrics(
            job_id="test-001",
            job_type="file_import",
            source_type="file",
            started_at=now,
            completed_at=now,
            duration_seconds=10.5,
            records_extracted=100,
            records_transformed=95,
            records_loaded=90,
            records_failed=5,
        )

        d = metrics.to_dict()

        assert d["job_id"] == "test-001"
        assert d["duration_seconds"] == 10.5
        assert d["records"]["extracted"] == 100
        assert d["records"]["loaded"] == 90
        assert d["records"]["failed"] == 5


class TestETLAlert:
    """Test ETLAlert dataclass"""

    def test_alert_creation(self):
        """Test basic alert creation"""
        alert = ETLAlert(
            id="alert-001",
            severity=AlertSeverity.WARNING,
            message="Test alert",
            message_th="แจ้งเตือนทดสอบ",
            job_id="job-001",
            created_at=datetime.now(),
        )

        assert alert.id == "alert-001"
        assert alert.severity == AlertSeverity.WARNING
        assert alert.acknowledged is False

    def test_alert_to_dict(self):
        """Test alert serialization"""
        alert = ETLAlert(
            id="alert-001",
            severity=AlertSeverity.ERROR,
            message="Error alert",
            message_th="แจ้งเตือนข้อผิดพลาด",
            job_id="job-001",
            created_at=datetime.now(),
            acknowledged=True,
            acknowledged_by="admin",
        )

        d = alert.to_dict()

        assert d["id"] == "alert-001"
        assert d["severity"] == "error"
        assert d["acknowledged"] is True
        assert d["acknowledged_by"] == "admin"


class TestETLMonitor:
    """Test ETLMonitor class"""

    @pytest.fixture
    def monitor(self):
        """Create a fresh monitor instance"""
        return ETLMonitor()

    def test_monitor_initialization(self, monitor):
        """Test monitor initializes correctly"""
        summary = monitor.get_summary()

        assert summary["active_jobs"] == 0
        assert summary["unacknowledged_alerts"] == 0

    def test_start_job(self, monitor):
        """Test starting job tracking"""
        metrics = monitor.start_job(
            job_id="job-001",
            job_type="manual_sync",
            source_type="api",
        )

        assert metrics.job_id == "job-001"
        assert metrics.started_at is not None
        assert monitor.get_job_metrics("job-001") is not None

    def test_update_extraction(self, monitor):
        """Test updating extraction count"""
        monitor.start_job("job-001", "file_import", "file")
        monitor.update_extraction("job-001", 100)

        metrics = monitor.get_job_metrics("job-001")
        assert metrics.records_extracted == 100

    def test_update_transformation(self, monitor):
        """Test updating transformation count"""
        monitor.start_job("job-001", "file_import", "file")
        monitor.update_transformation("job-001", 95)

        metrics = monitor.get_job_metrics("job-001")
        assert metrics.records_transformed == 95

    def test_update_loading(self, monitor):
        """Test updating loading count"""
        monitor.start_job("job-001", "file_import", "file")
        monitor.update_loading("job-001", 90, failed_count=5)

        metrics = monitor.get_job_metrics("job-001")
        assert metrics.records_loaded == 90
        assert metrics.records_failed == 5

    def test_add_error(self, monitor):
        """Test adding error to job"""
        monitor.start_job("job-001", "file_import", "file")
        monitor.add_error("job-001", "Test error message")

        metrics = monitor.get_job_metrics("job-001")
        assert len(metrics.errors) == 1
        assert "Test error" in metrics.errors[0]

    def test_add_warning(self, monitor):
        """Test adding warning to job"""
        monitor.start_job("job-001", "file_import", "file")
        monitor.add_warning("job-001", "Test warning message")

        metrics = monitor.get_job_metrics("job-001")
        assert len(metrics.warnings) == 1

    def test_complete_job_success(self, monitor):
        """Test completing a successful job"""
        monitor.start_job("job-001", "file_import", "file")
        monitor.update_loading("job-001", 100)
        metrics = monitor.complete_job("job-001", success=True)

        assert metrics.completed_at is not None
        assert metrics.duration_seconds > 0

        # Check daily stats updated
        today = datetime.now().strftime("%Y-%m-%d")
        stats = monitor.get_daily_stats(today)
        assert stats["jobs_completed"] == 1

    def test_complete_job_failure(self, monitor):
        """Test completing a failed job"""
        monitor.start_job("job-001", "manual_sync", "api")
        monitor.add_error("job-001", "Connection failed")
        metrics = monitor.complete_job("job-001", success=False)

        assert metrics.completed_at is not None

        # Check alert was created
        alerts = monitor.get_alerts(unacknowledged_only=True)
        assert len(alerts) >= 1
        assert any(a.job_id == "job-001" for a in alerts)

    def test_high_error_rate_alert(self, monitor):
        """Test alert is created for high error rate"""
        monitor.start_job("job-001", "file_import", "file")
        monitor.update_extraction("job-001", 100)
        monitor.update_loading("job-001", 80, failed_count=20)  # 20% error rate
        monitor.complete_job("job-001", success=True)

        alerts = monitor.get_alerts(severity=AlertSeverity.WARNING)
        assert len(alerts) >= 1

    def test_get_daily_stats(self, monitor):
        """Test getting daily statistics"""
        # Complete a job
        monitor.start_job("job-001", "file_import", "file")
        monitor.update_loading("job-001", 50)
        monitor.complete_job("job-001", success=True)

        today = datetime.now().strftime("%Y-%m-%d")
        stats = monitor.get_daily_stats(today)

        assert stats["jobs_completed"] == 1
        assert stats["records_processed"] == 50

    def test_get_weekly_stats(self, monitor):
        """Test getting weekly statistics"""
        stats = monitor.get_weekly_stats()

        assert len(stats) == 7
        today = datetime.now().strftime("%Y-%m-%d")
        assert today in stats

    def test_acknowledge_alert(self, monitor):
        """Test acknowledging an alert"""
        # Create an alert by completing a failed job
        monitor.start_job("job-001", "manual_sync", "api")
        monitor.complete_job("job-001", success=False)

        alerts = monitor.get_alerts(unacknowledged_only=True)
        assert len(alerts) > 0

        alert_id = alerts[0].id
        result = monitor.acknowledge_alert(alert_id, "admin")

        assert result is True

        # Check alert is now acknowledged
        unack_alerts = monitor.get_alerts(unacknowledged_only=True)
        assert all(a.id != alert_id for a in unack_alerts)

    def test_acknowledge_nonexistent_alert(self, monitor):
        """Test acknowledging non-existent alert"""
        result = monitor.acknowledge_alert("nonexistent-id", "admin")
        assert result is False

    def test_get_alerts_with_severity_filter(self, monitor):
        """Test filtering alerts by severity"""
        # Create alerts of different severities
        monitor.start_job("job-001", "manual_sync", "api")
        monitor.complete_job("job-001", success=False)  # Creates ERROR alert

        error_alerts = monitor.get_alerts(severity=AlertSeverity.ERROR)
        warning_alerts = monitor.get_alerts(severity=AlertSeverity.WARNING)

        assert all(a.severity == AlertSeverity.ERROR for a in error_alerts)

    def test_get_summary(self, monitor):
        """Test getting overall summary"""
        # Start a job (active)
        monitor.start_job("job-001", "file_import", "file")

        summary = monitor.get_summary()

        assert "today" in summary
        assert "active_jobs" in summary
        assert "unacknowledged_alerts" in summary
        assert "success_rate" in summary
        assert summary["active_jobs"] == 1


class TestGlobalMonitor:
    """Test global monitor instance"""

    def test_get_monitor_singleton(self):
        """Test get_monitor returns same instance"""
        monitor1 = get_monitor()
        monitor2 = get_monitor()

        assert monitor1 is monitor2


class TestAlertSeverityEnum:
    """Test AlertSeverity enum"""

    def test_severity_values(self):
        """Test all severity values exist"""
        assert AlertSeverity.INFO.value == "info"
        assert AlertSeverity.WARNING.value == "warning"
        assert AlertSeverity.ERROR.value == "error"
        assert AlertSeverity.CRITICAL.value == "critical"
