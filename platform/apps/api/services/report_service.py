"""
Report Service - Business logic for report operations
"""

from typing import Optional

MOCK_REPORTS = [
    {
        "id": "rpt-001",
        "title_th": "รายงานน้ำสูญเสียประจำเดือน มกราคม 2567",
        "title_en": "Monthly Water Loss Report - January 2024",
        "type": "monthly",
        "category": "water_loss",
        "period": "2024-01",
        "created_at": "2024-01-31T10:30:00Z",
        "file_size": "2.4 MB",
        "status": "ready",
    },
    {
        "id": "rpt-002",
        "title_th": "รายงานประสิทธิภาพ DMA ประจำสัปดาห์ที่ 3",
        "title_en": "Weekly DMA Performance Report - Week 3",
        "type": "weekly",
        "category": "dma_performance",
        "period": "2024-W03",
        "created_at": "2024-01-21T08:00:00Z",
        "file_size": "1.8 MB",
        "status": "ready",
    },
    {
        "id": "rpt-003",
        "title_th": "สรุปการแจ้งเตือนประจำวัน 15 มกราคม 2567",
        "title_en": "Daily Alerts Summary - January 15, 2024",
        "type": "daily",
        "category": "alerts",
        "period": "2024-01-15",
        "created_at": "2024-01-15T23:59:00Z",
        "file_size": "512 KB",
        "status": "ready",
    },
    {
        "id": "rpt-004",
        "title_th": "รายงานการเงินประจำปี 2566",
        "title_en": "Annual Financial Report 2023",
        "type": "annual",
        "category": "financial",
        "period": "2023",
        "created_at": "2024-01-10T14:00:00Z",
        "file_size": "5.2 MB",
        "status": "ready",
    },
    {
        "id": "rpt-005",
        "title_th": "รายงานเปรียบเทียบน้ำสูญเสีย Q4/2566",
        "title_en": "Q4 2023 Water Loss Comparison Report",
        "type": "custom",
        "category": "water_loss",
        "period": "2023-Q4",
        "created_at": "2024-01-05T16:30:00Z",
        "file_size": "3.1 MB",
        "status": "ready",
    },
]


class ReportService:
    """Service for report operations"""

    @staticmethod
    async def get_all(
        report_type: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        per_page: int = 20,
    ) -> tuple[list[dict], int]:
        """Get all reports with optional filters"""
        filtered = MOCK_REPORTS.copy()

        if report_type and report_type != "all":
            filtered = [r for r in filtered if r["type"] == report_type]

        if category and category != "all":
            filtered = [r for r in filtered if r["category"] == category]

        if search:
            search_lower = search.lower()
            filtered = [
                r
                for r in filtered
                if search_lower in r["title_th"].lower()
                or search_lower in r["title_en"].lower()
            ]

        # Sort by created_at descending
        filtered.sort(key=lambda x: x["created_at"], reverse=True)

        total = len(filtered)
        start = (page - 1) * per_page
        end = start + per_page

        return filtered[start:end], total

    @staticmethod
    async def get_by_id(report_id: str) -> Optional[dict]:
        """Get a single report by ID"""
        for report in MOCK_REPORTS:
            if report["id"] == report_id:
                return report
        return None
