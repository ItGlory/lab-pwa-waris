"""
Example tests for WARIS API
"""

import pytest


class TestWaterLossCalculations:
    """Test water loss calculation utilities."""

    def test_nrw_percentage_calculation(self) -> None:
        """Test Non-Revenue Water percentage calculation."""
        system_input = 150000
        billed_authorized = 120000
        nrw = system_input - billed_authorized
        nrw_percentage = (nrw / system_input) * 100

        assert nrw_percentage == 20.0

    def test_ili_calculation(self) -> None:
        """Test Infrastructure Leakage Index calculation."""
        real_losses = 17000  # m3/year
        unavoidable_losses = 5000  # m3/year (UARL)
        ili = real_losses / unavoidable_losses

        assert ili == 3.4

    def test_water_balance_validation(self, sample_water_loss_data: dict) -> None:
        """Test water balance validation."""
        data = sample_water_loss_data

        # Calculate total
        total_output = (
            data["billed_authorized"]
            + data["unbilled_authorized"]
            + data["apparent_losses"]
            + data["real_losses"]
        )

        assert total_output == data["system_input_volume"]


class TestDMAOperations:
    """Test DMA-related operations."""

    def test_dma_data_structure(self, sample_dma_data: dict) -> None:
        """Test DMA data structure."""
        required_fields = ["dma_id", "name", "region", "area_km2", "pipe_length_km"]

        for field in required_fields:
            assert field in sample_dma_data

    def test_dma_id_format(self, sample_dma_data: dict) -> None:
        """Test DMA ID format validation."""
        dma_id = sample_dma_data["dma_id"]

        # Should match pattern: XXX-NNN
        assert "-" in dma_id
        assert len(dma_id) >= 5


@pytest.mark.asyncio
async def test_async_operation() -> None:
    """Test async operation example."""
    import asyncio

    async def fetch_dma_data(dma_id: str) -> dict:
        await asyncio.sleep(0.01)  # Simulate async operation
        return {"dma_id": dma_id, "status": "active"}

    result = await fetch_dma_data("BKK-001")
    assert result["dma_id"] == "BKK-001"
    assert result["status"] == "active"
