"""
AI Model Service
Unified service for AI model inference
"""

from typing import Dict, List, Any, Optional
from pathlib import Path
import logging
import pandas as pd
import numpy as np

from ..models import (
    AnomalyDetector,
    PatternRecognizer,
    WaterLossClassifier,
    TimeSeriesForecaster,
)
from ..models.base import ModelMetrics

logger = logging.getLogger(__name__)


class AIModelService:
    """
    Unified AI Model Service

    Provides:
    - Model loading/training
    - Real-time inference
    - Batch predictions
    - Model management
    """

    MODEL_TYPES = {
        "anomaly": AnomalyDetector,
        "pattern": PatternRecognizer,
        "classification": WaterLossClassifier,
        "timeseries": TimeSeriesForecaster,
    }

    def __init__(self, model_dir: Optional[str] = None):
        self.model_dir = Path(model_dir) if model_dir else Path("./models")
        self.models: Dict[str, Any] = {}
        self._initialized = False

    def initialize(self, use_demo_models: bool = True) -> None:
        """
        Initialize AI service with models

        Args:
            use_demo_models: If True, create demo models with synthetic data
        """
        if use_demo_models:
            self._create_demo_models()
        else:
            self._load_models()

        self._initialized = True
        logger.info("AI Model Service initialized")

    def _create_demo_models(self) -> None:
        """Create demo models with synthetic data for testing"""
        # Generate synthetic training data
        np.random.seed(42)
        n_samples = 1000

        # Features for anomaly and classification
        df = pd.DataFrame({
            "flow_in": np.random.normal(1000, 200, n_samples),
            "flow_out": np.random.normal(850, 180, n_samples),
            "pressure": np.random.normal(3.5, 0.5, n_samples),
            "hour": np.random.randint(0, 24, n_samples),
            "day_of_week": np.random.randint(0, 7, n_samples),
        })

        # Calculate derived features
        df["loss_volume"] = df["flow_in"] - df["flow_out"]
        df["loss_percentage"] = (df["loss_volume"] / df["flow_in"]) * 100

        # Generate labels
        anomaly_labels = (df["loss_percentage"] > 20) | (df["pressure"] < 2.5)
        anomaly_labels = anomaly_labels.astype(int)

        classification_labels = (df["loss_percentage"] > 18).astype(int)  # 0=physical, 1=commercial

        # Train Anomaly Detector
        logger.info("Training Anomaly Detection model...")
        self.models["anomaly"] = AnomalyDetector(approach="isolation_forest")
        self.models["anomaly"].fit(df[["flow_in", "flow_out", "pressure", "loss_percentage"]])

        # Train Pattern Recognizer
        logger.info("Training Pattern Recognition model...")
        self.models["pattern"] = PatternRecognizer(approach="kmeans", n_clusters=5)
        self.models["pattern"].fit(df[["flow_in", "flow_out", "hour", "day_of_week"]])

        # Train Classifier
        logger.info("Training Classification model...")
        self.models["classification"] = WaterLossClassifier(approach="xgboost")
        self.models["classification"].fit(
            df[["flow_in", "flow_out", "pressure", "loss_percentage", "hour"]],
            classification_labels
        )

        # Train Time Series Forecaster
        logger.info("Training Time Series model...")
        dates = pd.date_range(start="2025-01-01", periods=n_samples, freq="H")
        ts_df = pd.DataFrame({
            "ds": dates,
            "y": df["loss_volume"].values,
        })
        self.models["timeseries"] = TimeSeriesForecaster(approach="moving_average")
        self.models["timeseries"].fit(ts_df)

        logger.info("Demo models created successfully")

    def _load_models(self) -> None:
        """Load pre-trained models from disk"""
        for model_type, model_class in self.MODEL_TYPES.items():
            model_path = self.model_dir / f"{model_type}_model.joblib"
            if model_path.exists():
                self.models[model_type] = model_class()
                self.models[model_type].load(str(model_path))
                logger.info(f"Loaded {model_type} model from {model_path}")

    def save_models(self) -> None:
        """Save all models to disk"""
        self.model_dir.mkdir(parents=True, exist_ok=True)
        for model_type, model in self.models.items():
            model_path = self.model_dir / f"{model_type}_model.joblib"
            model.save(str(model_path))
            logger.info(f"Saved {model_type} model to {model_path}")

    def detect_anomaly(self, reading: Dict) -> Dict:
        """
        Detect anomaly in a single reading

        Args:
            reading: Dict with flow_in, flow_out, pressure, etc.

        Returns:
            Dict with is_anomaly, probability, confidence
        """
        if "anomaly" not in self.models:
            return {"error": "Anomaly model not loaded"}

        try:
            return self.models["anomaly"].detect_single(reading)
        except Exception as e:
            logger.error(f"Anomaly detection error: {e}")
            return {"error": str(e)}

    def recognize_pattern(self, data: pd.DataFrame) -> Dict:
        """
        Recognize patterns in data

        Args:
            data: DataFrame with flow readings

        Returns:
            Dict with patterns and summary
        """
        if "pattern" not in self.models:
            return {"error": "Pattern model not loaded"}

        try:
            result = self.models["pattern"].predict(data)
            summary = self.models["pattern"].get_pattern_summary(data)
            return {
                "patterns": result.details.get("pattern_labels_th", []),
                "summary": summary.to_dict("records"),
                "confidence": result.confidence,
            }
        except Exception as e:
            logger.error(f"Pattern recognition error: {e}")
            return {"error": str(e)}

    def classify_loss(self, reading: Dict) -> Dict:
        """
        Classify water loss type

        Args:
            reading: Dict with features

        Returns:
            Dict with loss_type, probability
        """
        if "classification" not in self.models:
            return {"error": "Classification model not loaded"}

        try:
            return self.models["classification"].classify_single(reading)
        except Exception as e:
            logger.error(f"Classification error: {e}")
            return {"error": str(e)}

    def forecast(self, days: int = 7) -> Dict:
        """
        Forecast water loss for future days

        Args:
            days: Number of days to forecast

        Returns:
            Dict with dates, predictions, bounds
        """
        if "timeseries" not in self.models:
            return {"error": "Time series model not loaded"}

        try:
            return self.models["timeseries"].forecast_days(days)
        except Exception as e:
            logger.error(f"Forecast error: {e}")
            return {"error": str(e)}

    def get_model_info(self) -> Dict[str, Dict]:
        """Get information about all loaded models"""
        info = {}
        for model_type, model in self.models.items():
            info[model_type] = model.get_info()
        return info

    def analyze_dma(self, dma_id: str, data: pd.DataFrame) -> Dict:
        """
        Comprehensive AI analysis for a DMA

        Args:
            dma_id: DMA identifier
            data: Historical data for the DMA

        Returns:
            Comprehensive analysis results
        """
        results = {
            "dma_id": dma_id,
            "analysis_timestamp": pd.Timestamp.now().isoformat(),
            "anomalies": [],
            "patterns": {},
            "forecast": {},
            "classification": {},
            "recommendations": [],
        }

        # Anomaly detection on recent data
        if "anomaly" in self.models and len(data) > 0:
            recent = data.tail(1).iloc[0].to_dict()
            results["anomalies"] = [self.detect_anomaly(recent)]

        # Pattern recognition
        if "pattern" in self.models and len(data) >= 10:
            results["patterns"] = self.recognize_pattern(data)

        # Classification of recent loss
        if "classification" in self.models and len(data) > 0:
            recent = data.tail(1).iloc[0].to_dict()
            results["classification"] = self.classify_loss(recent)

        # Forecast
        if "timeseries" in self.models:
            results["forecast"] = self.forecast(7)

        # Generate recommendations based on analysis
        results["recommendations"] = self._generate_recommendations(results)

        return results

    def _generate_recommendations(self, analysis: Dict) -> List[Dict]:
        """Generate recommendations based on analysis results"""
        recommendations = []

        # Check anomalies
        anomalies = analysis.get("anomalies", [])
        if anomalies and anomalies[0].get("is_anomaly"):
            recommendations.append({
                "type": "anomaly",
                "priority": "high",
                "message": "ตรวจพบความผิดปกติในข้อมูล",
                "message_en": "Anomaly detected in recent data",
                "action": "ตรวจสอบมิเตอร์และท่อในพื้นที่",
            })

        # Check classification
        classification = analysis.get("classification", {})
        if classification.get("loss_type") == "physical":
            recommendations.append({
                "type": "physical_loss",
                "priority": "medium",
                "message": "สงสัยน้ำสูญเสียทางกายภาพ",
                "message_en": "Physical loss suspected",
                "action": "ตรวจสอบท่อในพื้นที่เพื่อหารอยรั่ว",
            })

        # Check forecast trend
        forecast = analysis.get("forecast", {})
        if forecast.get("predictions"):
            trend = forecast["predictions"]
            if len(trend) > 1 and trend[-1] > trend[0] * 1.1:
                recommendations.append({
                    "type": "trend",
                    "priority": "low",
                    "message": "แนวโน้มน้ำสูญเสียเพิ่มขึ้น",
                    "message_en": "Water loss trend increasing",
                    "action": "วางแผนตรวจสอบเชิงป้องกัน",
                })

        return recommendations


# Global service instance
_service: Optional[AIModelService] = None


def get_ai_service() -> AIModelService:
    """Get or create the global AI service instance"""
    global _service
    if _service is None:
        _service = AIModelService()
        _service.initialize(use_demo_models=True)
    return _service
