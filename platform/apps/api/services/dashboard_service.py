"""
Dashboard Service - Aggregates data for dashboard display
"""

from datetime import datetime

from services.dma_service import MOCK_DMAS
from services.alert_service import AlertService


class DashboardService:
    """Service for dashboard operations"""

    @staticmethod
    async def get_summary() -> dict:
        """Get complete dashboard summary"""
        dmas = MOCK_DMAS

        # Calculate totals
        total_inflow = sum(d["current_inflow"] for d in dmas)
        total_outflow = sum(d["current_outflow"] for d in dmas)
        total_loss = sum(d["current_loss"] for d in dmas)
        avg_loss_pct = (total_loss / total_inflow * 100) if total_inflow > 0 else 0

        # Status distribution
        status_counts = {"normal": 0, "warning": 0, "critical": 0}
        for dma in dmas:
            status_counts[dma["status"]] = status_counts.get(dma["status"], 0) + 1

        # Alert summary
        alert_summary = await AlertService.get_summary()

        # Regional summary
        regions: dict[str, dict] = {}
        for dma in dmas:
            rid = dma["region_id"]
            if rid not in regions:
                regions[rid] = {
                    "region_id": rid,
                    "region_name": dma["region_name"],
                    "dma_count": 0,
                    "total_loss_pct": 0,
                }
            regions[rid]["dma_count"] += 1
            regions[rid]["total_loss_pct"] += dma["loss_percentage"]

        regional_summary = []
        for region in regions.values():
            avg_loss = region["total_loss_pct"] / region["dma_count"]
            status = "normal" if avg_loss < 15 else ("warning" if avg_loss < 20 else "critical")
            regional_summary.append({
                "region_id": region["region_id"],
                "region_name": region["region_name"],
                "dma_count": region["dma_count"],
                "avg_loss_percentage": round(avg_loss, 1),
                "status": status,
            })

        # KPIs
        kpis = [
            {
                "title": "Water Inflow",
                "title_th": "น้ำเข้า",
                "value": round(total_inflow, 0),
                "unit": "m³/day",
                "unit_th": "ลบ.ม./วัน",
                "trend": {"direction": "up", "value": 2.5, "label": "+2.5%"},
            },
            {
                "title": "Water Outflow",
                "title_th": "น้ำออก",
                "value": round(total_outflow, 0),
                "unit": "m³/day",
                "unit_th": "ลบ.ม./วัน",
                "trend": {"direction": "up", "value": 1.8, "label": "+1.8%"},
            },
            {
                "title": "Water Loss",
                "title_th": "น้ำสูญเสีย",
                "value": round(total_loss, 0),
                "unit": "m³/day",
                "unit_th": "ลบ.ม./วัน",
                "trend": {"direction": "down", "value": -0.5, "label": "-0.5%"},
            },
            {
                "title": "Loss Percentage",
                "title_th": "เปอร์เซ็นต์สูญเสีย",
                "value": round(avg_loss_pct, 1),
                "unit": "%",
                "unit_th": "%",
                "trend": {"direction": "down", "value": -0.3, "label": "-0.3%"},
                "target": 15.0,
            },
        ]

        return {
            "total_dmas": len(dmas),
            "active_dmas": len(dmas),
            "total_inflow": round(total_inflow, 0),
            "total_outflow": round(total_outflow, 0),
            "total_loss": round(total_loss, 0),
            "avg_loss_percentage": round(avg_loss_pct, 1),
            "kpis": kpis,
            "status_distribution": status_counts,
            "alerts": alert_summary,
            "regional_summary": regional_summary,
            "last_updated": datetime.utcnow().isoformat() + "Z",
        }
