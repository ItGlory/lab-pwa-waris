"""
Example tests for WARIS AI Service
"""

import pytest
import numpy as np


class TestAnomalyDetection:
    """Test anomaly detection utilities."""

    def test_zscore_anomaly_detection(self, sample_time_series_data: list[dict]) -> None:
        """Test Z-score based anomaly detection."""
        values = [d["value"] for d in sample_time_series_data]
        mean = np.mean(values)
        std = np.std(values)

        # Z-score threshold
        threshold = 2.0

        anomalies = []
        for i, val in enumerate(values):
            z_score = abs((val - mean) / std) if std > 0 else 0
            if z_score > threshold:
                anomalies.append(i)

        # No anomalies in this sample data
        assert len(anomalies) == 0

    def test_anomaly_severity_classification(self, sample_anomaly_data: dict) -> None:
        """Test anomaly severity classification."""
        value = sample_anomaly_data["value"]
        expected_range = sample_anomaly_data["expected_range"]

        # Calculate deviation
        if value > expected_range[1]:
            deviation = value - expected_range[1]
        elif value < expected_range[0]:
            deviation = expected_range[0] - value
        else:
            deviation = 0

        # Deviation is 50 (250 - 200)
        assert deviation == 50.0

        # Classify severity
        if deviation > 40:
            severity = "high"
        elif deviation > 20:
            severity = "medium"
        else:
            severity = "low"

        assert severity == "high"


class TestEmbeddings:
    """Test embedding operations."""

    def test_embedding_dimension(self, sample_embedding: list[float]) -> None:
        """Test embedding vector dimensions."""
        assert len(sample_embedding) == 768

    def test_cosine_similarity(self, sample_embedding: list[float]) -> None:
        """Test cosine similarity calculation."""
        vec_a = np.array(sample_embedding)
        vec_b = np.array(sample_embedding)

        # Cosine similarity
        similarity = np.dot(vec_a, vec_b) / (np.linalg.norm(vec_a) * np.linalg.norm(vec_b))

        # Same vectors should have similarity of 1.0
        assert abs(similarity - 1.0) < 0.0001


class TestModelPredictions:
    """Test model prediction utilities."""

    def test_forecast_output_shape(self, sample_time_series_data: list[dict]) -> None:
        """Test forecast output shape."""
        input_length = len(sample_time_series_data)
        forecast_horizon = 7

        # Simulate forecast output
        forecast = [100.0 + i * 2 for i in range(forecast_horizon)]

        assert len(forecast) == forecast_horizon
        assert input_length == 5

    def test_confidence_intervals(self) -> None:
        """Test confidence interval calculation."""
        prediction = 100.0
        std_error = 5.0
        z_score_95 = 1.96

        lower = prediction - z_score_95 * std_error
        upper = prediction + z_score_95 * std_error

        assert lower == pytest.approx(90.2, rel=0.01)
        assert upper == pytest.approx(109.8, rel=0.01)


@pytest.mark.asyncio
async def test_rag_context_retrieval(sample_chat_context: dict) -> None:
    """Test RAG context retrieval simulation."""
    import asyncio

    async def retrieve_context(query: str, top_k: int = 3) -> list[dict]:
        await asyncio.sleep(0.01)  # Simulate async retrieval
        return [
            {"id": f"doc_{i}", "score": 0.9 - i * 0.1, "content": f"Context {i}"}
            for i in range(top_k)
        ]

    contexts = await retrieve_context(sample_chat_context["user_query"])

    assert len(contexts) == 3
    assert contexts[0]["score"] > contexts[1]["score"]
