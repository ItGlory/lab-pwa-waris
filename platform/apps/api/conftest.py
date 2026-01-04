"""
Pytest configuration for WARIS API tests
"""

import asyncio
from collections.abc import AsyncGenerator, Generator

import pytest
from httpx import ASGITransport, AsyncClient

# Import your FastAPI app when ready
# from main import app


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Create an async HTTP client for testing."""
    # Uncomment when app is ready
    # async with AsyncClient(
    #     transport=ASGITransport(app=app),
    #     base_url="http://test"
    # ) as ac:
    #     yield ac
    yield None  # type: ignore


@pytest.fixture
def sample_dma_data() -> dict:
    """Sample DMA data for testing."""
    return {
        "dma_id": "BKK-001",
        "name": "Bangkok Zone 1",
        "region": "Central",
        "area_km2": 12.5,
        "pipe_length_km": 45.2,
        "connections": 5000,
    }


@pytest.fixture
def sample_water_loss_data() -> dict:
    """Sample water loss data for testing."""
    return {
        "dma_id": "BKK-001",
        "period": "2026-01",
        "system_input_volume": 150000,
        "billed_authorized": 120000,
        "unbilled_authorized": 5000,
        "apparent_losses": 8000,
        "real_losses": 17000,
        "nrw_percentage": 20.0,
    }
