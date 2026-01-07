"""
DMA Service - Business logic for DMA operations
Currently uses mock data, will be replaced with database queries
"""

from datetime import datetime
from typing import Optional

# Mock data (same as frontend)
MOCK_DMAS = [
    {
        "id": "dma-001",
        "code": "DMA-001",
        "name_th": "บางพลี-01",
        "name_en": "Bang Phli-01",
        "branch_id": "brn-010",
        "branch_name": "สาขาสมุทรปราการ",
        "region_id": "reg-002",
        "region_name": "เขต 2 (ภาคกลาง)",
        "area_km2": 5.5,
        "population": 15000,
        "connections": 3500,
        "pipe_length_km": 125.8,
        "current_inflow": 12500.5,
        "current_outflow": 10250.3,
        "current_loss": 2250.2,
        "loss_percentage": 18.0,
        "avg_pressure": 2.8,
        "status": "warning",
        "last_updated": "2024-01-15T10:30:00Z",
    },
    {
        "id": "dma-002",
        "code": "DMA-002",
        "name_th": "บางพลี-02",
        "name_en": "Bang Phli-02",
        "branch_id": "brn-010",
        "branch_name": "สาขาสมุทรปราการ",
        "region_id": "reg-002",
        "region_name": "เขต 2 (ภาคกลาง)",
        "area_km2": 4.2,
        "population": 12000,
        "connections": 2800,
        "pipe_length_km": 98.5,
        "current_inflow": 9800.0,
        "current_outflow": 8820.0,
        "current_loss": 980.0,
        "loss_percentage": 10.0,
        "avg_pressure": 3.1,
        "status": "normal",
        "last_updated": "2024-01-15T10:30:00Z",
    },
    {
        "id": "dma-003",
        "code": "DMA-003",
        "name_th": "พระประแดง-01",
        "name_en": "Phra Pradaeng-01",
        "branch_id": "brn-010",
        "branch_name": "สาขาสมุทรปราการ",
        "region_id": "reg-002",
        "region_name": "เขต 2 (ภาคกลาง)",
        "area_km2": 6.8,
        "population": 18500,
        "connections": 4200,
        "pipe_length_km": 145.2,
        "current_inflow": 15200.0,
        "current_outflow": 11400.0,
        "current_loss": 3800.0,
        "loss_percentage": 25.0,
        "avg_pressure": 2.4,
        "status": "critical",
        "last_updated": "2024-01-15T10:30:00Z",
    },
    {
        "id": "dma-004",
        "code": "DMA-004",
        "name_th": "เชียงใหม่-01",
        "name_en": "Chiang Mai-01",
        "branch_id": "brn-001",
        "branch_name": "สาขาเชียงใหม่",
        "region_id": "reg-001",
        "region_name": "เขต 1 (ภาคเหนือ)",
        "area_km2": 8.5,
        "population": 22000,
        "connections": 5100,
        "pipe_length_km": 178.3,
        "current_inflow": 18500.0,
        "current_outflow": 16280.0,
        "current_loss": 2220.0,
        "loss_percentage": 12.0,
        "avg_pressure": 2.9,
        "status": "normal",
        "last_updated": "2024-01-15T10:30:00Z",
    },
    {
        "id": "dma-005",
        "code": "DMA-005",
        "name_th": "เชียงใหม่-02",
        "name_en": "Chiang Mai-02",
        "branch_id": "brn-001",
        "branch_name": "สาขาเชียงใหม่",
        "region_id": "reg-001",
        "region_name": "เขต 1 (ภาคเหนือ)",
        "area_km2": 7.2,
        "population": 19500,
        "connections": 4500,
        "pipe_length_km": 156.8,
        "current_inflow": 16200.0,
        "current_outflow": 13608.0,
        "current_loss": 2592.0,
        "loss_percentage": 16.0,
        "avg_pressure": 2.7,
        "status": "warning",
        "last_updated": "2024-01-15T10:30:00Z",
    },
    {
        "id": "dma-006",
        "code": "DMA-006",
        "name_th": "ขอนแก่น-01",
        "name_en": "Khon Kaen-01",
        "branch_id": "brn-020",
        "branch_name": "สาขาขอนแก่น",
        "region_id": "reg-004",
        "region_name": "เขต 4 (ภาคตะวันออกเฉียงเหนือ)",
        "area_km2": 9.1,
        "population": 25000,
        "connections": 5800,
        "pipe_length_km": 195.5,
        "current_inflow": 21000.0,
        "current_outflow": 18690.0,
        "current_loss": 2310.0,
        "loss_percentage": 11.0,
        "avg_pressure": 3.0,
        "status": "normal",
        "last_updated": "2024-01-15T10:30:00Z",
    },
    {
        "id": "dma-007",
        "code": "DMA-007",
        "name_th": "ภูเก็ต-01",
        "name_en": "Phuket-01",
        "branch_id": "brn-035",
        "branch_name": "สาขาภูเก็ต",
        "region_id": "reg-005",
        "region_name": "เขต 5 (ภาคใต้)",
        "area_km2": 6.5,
        "population": 20000,
        "connections": 4800,
        "pipe_length_km": 142.0,
        "current_inflow": 17500.0,
        "current_outflow": 14350.0,
        "current_loss": 3150.0,
        "loss_percentage": 18.0,
        "avg_pressure": 2.6,
        "status": "warning",
        "last_updated": "2024-01-15T10:30:00Z",
    },
    {
        "id": "dma-008",
        "code": "DMA-008",
        "name_th": "ชลบุรี-01",
        "name_en": "Chonburi-01",
        "branch_id": "brn-015",
        "branch_name": "สาขาชลบุรี",
        "region_id": "reg-003",
        "region_name": "เขต 3 (ภาคตะวันออก)",
        "area_km2": 7.8,
        "population": 21000,
        "connections": 4900,
        "pipe_length_km": 168.5,
        "current_inflow": 18200.0,
        "current_outflow": 15652.0,
        "current_loss": 2548.0,
        "loss_percentage": 14.0,
        "avg_pressure": 2.9,
        "status": "normal",
        "last_updated": "2024-01-15T10:30:00Z",
    },
]


class DMAService:
    """Service for DMA operations"""

    @staticmethod
    async def get_all(
        region: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        per_page: int = 20,
    ) -> tuple[list[dict], int]:
        """Get all DMAs with optional filters"""
        filtered = MOCK_DMAS.copy()

        if region:
            filtered = [d for d in filtered if d["region_id"] == region]

        if status:
            filtered = [d for d in filtered if d["status"] == status]

        if search:
            search_lower = search.lower()
            filtered = [
                d
                for d in filtered
                if search_lower in d["name_th"].lower()
                or search_lower in d["name_en"].lower()
                or search_lower in d["code"].lower()
            ]

        total = len(filtered)
        start = (page - 1) * per_page
        end = start + per_page

        return filtered[start:end], total

    @staticmethod
    async def get_by_id(dma_id: str) -> Optional[dict]:
        """Get a single DMA by ID"""
        for dma in MOCK_DMAS:
            if dma["id"] == dma_id:
                return dma
        return None

    @staticmethod
    async def get_readings(
        dma_id: str, period: str = "30d"
    ) -> Optional[dict]:
        """Get readings for a DMA"""
        # Generate mock readings
        dma = await DMAService.get_by_id(dma_id)
        if not dma:
            return None

        days = {"7d": 7, "14d": 14, "30d": 30}.get(period, 30)
        base_inflow = dma["current_inflow"]
        base_loss_pct = dma["loss_percentage"]

        readings = []
        for i in range(days):
            # Generate slightly varied readings
            variation = 1 + (hash(f"{dma_id}-{i}") % 10 - 5) / 100
            inflow = base_inflow * variation
            loss_pct = base_loss_pct + (hash(f"{dma_id}-loss-{i}") % 4 - 2)
            outflow = inflow * (1 - loss_pct / 100)
            loss = inflow - outflow

            readings.append({
                "date": f"2024-01-{15-i:02d}",
                "inflow": round(inflow, 1),
                "outflow": round(outflow, 1),
                "loss": round(loss, 1),
                "loss_pct": round(loss_pct, 1),
                "pressure": round(dma["avg_pressure"] + (i % 3 - 1) * 0.1, 1),
            })

        return {
            "dma_id": dma_id,
            "period": period,
            "base_inflow": base_inflow,
            "base_loss_pct": base_loss_pct,
            "readings": readings,
        }
