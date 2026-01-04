"""
Pytest configuration for WARIS AI tests
"""

import asyncio
from collections.abc import Generator

import pytest


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def sample_time_series_data() -> list[dict]:
    """Sample time series data for testing ML models."""
    return [
        {"timestamp": "2026-01-01", "value": 100.0},
        {"timestamp": "2026-01-02", "value": 102.5},
        {"timestamp": "2026-01-03", "value": 98.3},
        {"timestamp": "2026-01-04", "value": 105.2},
        {"timestamp": "2026-01-05", "value": 110.0},
    ]


@pytest.fixture
def sample_anomaly_data() -> dict:
    """Sample anomaly detection data."""
    return {
        "dma_id": "BKK-001",
        "timestamp": "2026-01-05T14:30:00",
        "metric": "flow_rate",
        "value": 250.0,
        "expected_range": [150.0, 200.0],
        "severity": "high",
    }


@pytest.fixture
def sample_embedding() -> list[float]:
    """Sample embedding vector for testing."""
    return [0.1] * 768  # Typical embedding dimension


@pytest.fixture
def sample_chat_context() -> dict:
    """Sample chat context for LLM testing."""
    return {
        "system_prompt": "You are a water loss analysis assistant.",
        "language": "th",
        "user_query": "ข้อมูลการสูญเสียน้ำในเขต BKK-001 เป็นอย่างไร?",
    }
