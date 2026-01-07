"""
Alert Service - Business logic for alert operations
"""

from datetime import datetime
from typing import Optional

MOCK_ALERTS = [
    {
        "id": "alert-001",
        "dma_id": "dma-003",
        "dma_name": "พระประแดง-01",
        "type": "high_loss",
        "severity": "critical",
        "status": "active",
        "title_th": "น้ำสูญเสียสูงผิดปกติ",
        "title_en": "Abnormally High Water Loss",
        "description_th": "ตรวจพบน้ำสูญเสีย 25% สูงกว่าเกณฑ์วิกฤต (20%)",
        "triggered_at": "2024-01-15T08:30:00Z",
        "acknowledged_at": None,
        "resolved_at": None,
    },
    {
        "id": "alert-002",
        "dma_id": "dma-001",
        "dma_name": "บางพลี-01",
        "type": "threshold_breach",
        "severity": "high",
        "status": "active",
        "title_th": "น้ำสูญเสียเกินเกณฑ์เฝ้าระวัง",
        "title_en": "Water Loss Exceeds Warning Threshold",
        "description_th": "ตรวจพบน้ำสูญเสีย 18% สูงกว่าเกณฑ์เฝ้าระวัง (15%)",
        "triggered_at": "2024-01-15T07:15:00Z",
        "acknowledged_at": None,
        "resolved_at": None,
    },
    {
        "id": "alert-003",
        "dma_id": "dma-005",
        "dma_name": "เชียงใหม่-02",
        "type": "pressure_anomaly",
        "severity": "medium",
        "status": "acknowledged",
        "title_th": "แรงดันน้ำผิดปกติ",
        "title_en": "Abnormal Pressure Detected",
        "description_th": "แรงดันน้ำลดลง 0.3 บาร์ จากค่าเฉลี่ย",
        "triggered_at": "2024-01-15T06:00:00Z",
        "acknowledged_at": "2024-01-15T08:00:00Z",
        "resolved_at": None,
    },
    {
        "id": "alert-004",
        "dma_id": "dma-007",
        "dma_name": "ภูเก็ต-01",
        "type": "threshold_breach",
        "severity": "high",
        "status": "active",
        "title_th": "น้ำสูญเสียเกินเกณฑ์เฝ้าระวัง",
        "title_en": "Water Loss Exceeds Warning Threshold",
        "description_th": "ตรวจพบน้ำสูญเสีย 18% สูงกว่าเกณฑ์เฝ้าระวัง (15%)",
        "triggered_at": "2024-01-15T05:30:00Z",
        "acknowledged_at": None,
        "resolved_at": None,
    },
    {
        "id": "alert-005",
        "dma_id": "dma-008",
        "dma_name": "ชลบุรี-01",
        "type": "flow_anomaly",
        "severity": "medium",
        "status": "resolved",
        "title_th": "ความผิดปกติของอัตราการไหล",
        "title_en": "Flow Rate Anomaly",
        "description_th": "ตรวจพบการเปลี่ยนแปลงอัตราการไหลผิดปกติ",
        "triggered_at": "2024-01-14T22:00:00Z",
        "acknowledged_at": "2024-01-14T23:00:00Z",
        "resolved_at": "2024-01-15T02:00:00Z",
    },
]


class AlertService:
    """Service for alert operations"""

    @staticmethod
    async def get_all(
        severity: Optional[str] = None,
        status: Optional[str] = None,
        dma_id: Optional[str] = None,
        page: int = 1,
        per_page: int = 20,
    ) -> tuple[list[dict], int]:
        """Get all alerts with optional filters"""
        filtered = MOCK_ALERTS.copy()

        if severity:
            filtered = [a for a in filtered if a["severity"] == severity]

        if status:
            filtered = [a for a in filtered if a["status"] == status]

        if dma_id:
            filtered = [a for a in filtered if a["dma_id"] == dma_id]

        # Sort by triggered_at descending
        filtered.sort(key=lambda x: x["triggered_at"], reverse=True)

        total = len(filtered)
        start = (page - 1) * per_page
        end = start + per_page

        return filtered[start:end], total

    @staticmethod
    async def get_by_id(alert_id: str) -> Optional[dict]:
        """Get a single alert by ID"""
        for alert in MOCK_ALERTS:
            if alert["id"] == alert_id:
                return alert
        return None

    @staticmethod
    async def update_status(
        alert_id: str, action: str, user_id: Optional[str] = None
    ) -> Optional[dict]:
        """Update alert status (acknowledge/resolve)"""
        alert = await AlertService.get_by_id(alert_id)
        if not alert:
            return None

        updated = alert.copy()
        now = datetime.utcnow().isoformat() + "Z"

        if action == "acknowledge":
            updated["status"] = "acknowledged"
            updated["acknowledged_at"] = now
            updated["acknowledged_by"] = user_id
        elif action == "resolve":
            updated["status"] = "resolved"
            updated["resolved_at"] = now
            updated["resolved_by"] = user_id

        return updated

    @staticmethod
    async def get_active_count() -> int:
        """Get count of active alerts"""
        return len([a for a in MOCK_ALERTS if a["status"] == "active"])

    @staticmethod
    async def get_summary() -> dict:
        """Get alert summary statistics"""
        total = len(MOCK_ALERTS)
        active = len([a for a in MOCK_ALERTS if a["status"] == "active"])
        acknowledged = len([a for a in MOCK_ALERTS if a["status"] == "acknowledged"])
        resolved = len([a for a in MOCK_ALERTS if a["status"] == "resolved"])

        by_severity = {}
        for alert in MOCK_ALERTS:
            sev = alert["severity"]
            by_severity[sev] = by_severity.get(sev, 0) + 1

        return {
            "total": total,
            "active": active,
            "acknowledged": acknowledged,
            "resolved": resolved,
            "by_severity": by_severity,
        }
