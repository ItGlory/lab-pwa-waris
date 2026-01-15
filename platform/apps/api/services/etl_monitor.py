"""
ETL Monitoring Service
Provides logging, metrics, and alerting for ETL operations
TOR Reference: Section 4.3
"""

import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field
from enum import Enum
from collections import defaultdict

logger = logging.getLogger(__name__)


class AlertSeverity(str, Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


@dataclass
class ETLMetrics:
    """ETL execution metrics"""
    job_id: str
    job_type: str
    source_type: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration_seconds: float = 0.0
    records_extracted: int = 0
    records_transformed: int = 0
    records_loaded: int = 0
    records_failed: int = 0
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "job_id": self.job_id,
            "job_type": self.job_type,
            "source_type": self.source_type,
            "started_at": self.started_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "duration_seconds": self.duration_seconds,
            "records": {
                "extracted": self.records_extracted,
                "transformed": self.records_transformed,
                "loaded": self.records_loaded,
                "failed": self.records_failed,
            },
            "error_count": len(self.errors),
            "warning_count": len(self.warnings),
        }


@dataclass
class ETLAlert:
    """ETL Alert notification"""
    id: str
    severity: AlertSeverity
    message: str
    message_th: str
    job_id: Optional[str]
    created_at: datetime
    acknowledged: bool = False
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "severity": self.severity.value,
            "message": self.message,
            "message_th": self.message_th,
            "job_id": self.job_id,
            "created_at": self.created_at.isoformat(),
            "acknowledged": self.acknowledged,
            "acknowledged_at": self.acknowledged_at.isoformat() if self.acknowledged_at else None,
            "acknowledged_by": self.acknowledged_by,
        }


class ETLMonitor:
    """
    ETL Monitoring Service
    Tracks metrics, logs, and alerts for ETL operations
    """

    def __init__(self):
        self._metrics: Dict[str, ETLMetrics] = {}
        self._alerts: List[ETLAlert] = []
        self._daily_stats: Dict[str, Dict[str, int]] = defaultdict(lambda: {
            "jobs_completed": 0,
            "jobs_failed": 0,
            "records_processed": 0,
            "errors": 0,
        })
        self._alert_counter = 0

        # Thresholds for alerts
        self.error_rate_threshold = 0.1  # 10% error rate
        self.duration_threshold_minutes = 30  # 30 minutes

        logger.info("ETL Monitor initialized")

    def start_job(
        self,
        job_id: str,
        job_type: str,
        source_type: str
    ) -> ETLMetrics:
        """Start tracking a new job"""
        metrics = ETLMetrics(
            job_id=job_id,
            job_type=job_type,
            source_type=source_type,
            started_at=datetime.now(),
        )
        self._metrics[job_id] = metrics

        logger.info(f"ETL job started: {job_id} ({job_type} from {source_type})")
        return metrics

    def update_extraction(self, job_id: str, records_count: int) -> None:
        """Update extraction count"""
        if job_id in self._metrics:
            self._metrics[job_id].records_extracted = records_count
            logger.debug(f"Job {job_id}: Extracted {records_count} records")

    def update_transformation(self, job_id: str, records_count: int) -> None:
        """Update transformation count"""
        if job_id in self._metrics:
            self._metrics[job_id].records_transformed = records_count
            logger.debug(f"Job {job_id}: Transformed {records_count} records")

    def update_loading(self, job_id: str, records_count: int, failed_count: int = 0) -> None:
        """Update loading count"""
        if job_id in self._metrics:
            self._metrics[job_id].records_loaded = records_count
            self._metrics[job_id].records_failed = failed_count
            logger.debug(f"Job {job_id}: Loaded {records_count} records, {failed_count} failed")

    def add_error(self, job_id: str, error: str) -> None:
        """Add error to job metrics"""
        if job_id in self._metrics:
            self._metrics[job_id].errors.append(error)
            logger.error(f"Job {job_id} error: {error}")

    def add_warning(self, job_id: str, warning: str) -> None:
        """Add warning to job metrics"""
        if job_id in self._metrics:
            self._metrics[job_id].warnings.append(warning)
            logger.warning(f"Job {job_id} warning: {warning}")

    def complete_job(self, job_id: str, success: bool = True) -> ETLMetrics:
        """Mark job as completed and calculate final metrics"""
        if job_id not in self._metrics:
            logger.warning(f"Job {job_id} not found in metrics")
            return None

        metrics = self._metrics[job_id]
        metrics.completed_at = datetime.now()
        metrics.duration_seconds = (metrics.completed_at - metrics.started_at).total_seconds()

        # Update daily stats
        date_key = metrics.started_at.strftime("%Y-%m-%d")
        if success:
            self._daily_stats[date_key]["jobs_completed"] += 1
        else:
            self._daily_stats[date_key]["jobs_failed"] += 1

        self._daily_stats[date_key]["records_processed"] += metrics.records_loaded
        self._daily_stats[date_key]["errors"] += len(metrics.errors)

        # Check for alerts
        self._check_alerts(metrics, success)

        status = "completed" if success else "failed"
        logger.info(
            f"ETL job {status}: {job_id} - "
            f"{metrics.records_loaded} records in {metrics.duration_seconds:.1f}s"
        )

        return metrics

    def _check_alerts(self, metrics: ETLMetrics, success: bool) -> None:
        """Check if alerts should be raised"""
        # Job failure alert
        if not success:
            self._create_alert(
                severity=AlertSeverity.ERROR,
                message=f"ETL job failed: {metrics.job_id}",
                message_th=f"งาน ETL ล้มเหลว: {metrics.job_id}",
                job_id=metrics.job_id,
            )

        # High error rate alert
        total_records = metrics.records_extracted or 1
        error_rate = metrics.records_failed / total_records
        if error_rate > self.error_rate_threshold:
            self._create_alert(
                severity=AlertSeverity.WARNING,
                message=f"High error rate ({error_rate:.1%}) in job {metrics.job_id}",
                message_th=f"อัตราข้อผิดพลาดสูง ({error_rate:.1%}) ในงาน {metrics.job_id}",
                job_id=metrics.job_id,
            )

        # Long duration alert
        if metrics.duration_seconds > self.duration_threshold_minutes * 60:
            self._create_alert(
                severity=AlertSeverity.WARNING,
                message=f"Job {metrics.job_id} took {metrics.duration_seconds/60:.1f} minutes",
                message_th=f"งาน {metrics.job_id} ใช้เวลา {metrics.duration_seconds/60:.1f} นาที",
                job_id=metrics.job_id,
            )

    def _create_alert(
        self,
        severity: AlertSeverity,
        message: str,
        message_th: str,
        job_id: Optional[str] = None
    ) -> ETLAlert:
        """Create a new alert"""
        self._alert_counter += 1
        alert = ETLAlert(
            id=f"alert-{self._alert_counter:06d}",
            severity=severity,
            message=message,
            message_th=message_th,
            job_id=job_id,
            created_at=datetime.now(),
        )
        self._alerts.append(alert)

        # Log based on severity
        if severity == AlertSeverity.CRITICAL:
            logger.critical(f"ALERT: {message}")
        elif severity == AlertSeverity.ERROR:
            logger.error(f"ALERT: {message}")
        elif severity == AlertSeverity.WARNING:
            logger.warning(f"ALERT: {message}")
        else:
            logger.info(f"ALERT: {message}")

        return alert

    def get_job_metrics(self, job_id: str) -> Optional[ETLMetrics]:
        """Get metrics for a specific job"""
        return self._metrics.get(job_id)

    def get_daily_stats(self, date: Optional[str] = None) -> Dict[str, int]:
        """Get daily statistics"""
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")
        return dict(self._daily_stats.get(date, {}))

    def get_weekly_stats(self) -> Dict[str, Dict[str, int]]:
        """Get statistics for the past week"""
        result = {}
        for i in range(7):
            date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
            result[date] = self.get_daily_stats(date)
        return result

    def get_alerts(
        self,
        severity: Optional[AlertSeverity] = None,
        unacknowledged_only: bool = False,
        limit: int = 50
    ) -> List[ETLAlert]:
        """Get alerts with optional filtering"""
        alerts = self._alerts

        if severity:
            alerts = [a for a in alerts if a.severity == severity]

        if unacknowledged_only:
            alerts = [a for a in alerts if not a.acknowledged]

        # Sort by created_at descending
        alerts = sorted(alerts, key=lambda a: a.created_at, reverse=True)

        return alerts[:limit]

    def acknowledge_alert(self, alert_id: str, user: str) -> bool:
        """Acknowledge an alert"""
        for alert in self._alerts:
            if alert.id == alert_id:
                alert.acknowledged = True
                alert.acknowledged_at = datetime.now()
                alert.acknowledged_by = user
                logger.info(f"Alert {alert_id} acknowledged by {user}")
                return True
        return False

    def get_summary(self) -> Dict[str, Any]:
        """Get overall monitoring summary"""
        today = datetime.now().strftime("%Y-%m-%d")
        today_stats = self.get_daily_stats(today)
        unack_alerts = len([a for a in self._alerts if not a.acknowledged])

        # Calculate success rate
        total_jobs = today_stats.get("jobs_completed", 0) + today_stats.get("jobs_failed", 0)
        success_rate = today_stats.get("jobs_completed", 0) / total_jobs if total_jobs > 0 else 1.0

        return {
            "today": today_stats,
            "active_jobs": len([m for m in self._metrics.values() if m.completed_at is None]),
            "unacknowledged_alerts": unack_alerts,
            "success_rate": success_rate,
            "total_jobs_tracked": len(self._metrics),
        }


# Global monitor instance
_monitor: Optional[ETLMonitor] = None


def get_monitor() -> ETLMonitor:
    """Get global monitor instance"""
    global _monitor
    if _monitor is None:
        _monitor = ETLMonitor()
    return _monitor
