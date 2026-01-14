"""
Unified Anomaly Detector
Combines multiple detection approaches
"""

from typing import Dict, List, Optional, Literal
import pandas as pd
import numpy as np

from ..base import BaseModel, ModelResult, ModelMetrics, ModelComparison
from .baseline import ZScoreDetector, IQRDetector
from .isolation_forest import IsolationForestDetector


class AnomalyDetector(BaseModel):
    """
    Unified Anomaly Detection Model

    Supports multiple approaches:
    - baseline: Z-Score or IQR (Statistical)
    - isolation_forest: Tree-based
    - ensemble: Combine multiple methods
    """

    APPROACHES = {
        "zscore": ZScoreDetector,
        "iqr": IQRDetector,
        "isolation_forest": IsolationForestDetector,
    }

    def __init__(
        self,
        approach: Literal["zscore", "iqr", "isolation_forest", "ensemble"] = "isolation_forest",
        **kwargs
    ):
        super().__init__(name=f"AnomalyDetector_{approach}", version="1.0.0")
        self.approach = approach
        self.kwargs = kwargs
        self.detector: Optional[BaseModel] = None
        self.detectors: List[BaseModel] = []

        if approach == "ensemble":
            # Use all approaches for ensemble
            self.detectors = [
                ZScoreDetector(**kwargs.get("zscore", {})),
                IQRDetector(**kwargs.get("iqr", {})),
                IsolationForestDetector(**kwargs.get("isolation_forest", {})),
            ]
        elif approach in self.APPROACHES:
            self.detector = self.APPROACHES[approach](**kwargs)
        else:
            raise ValueError(f"Unknown approach: {approach}")

    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> "AnomalyDetector":
        """Train the anomaly detector(s)"""
        self._validate_input(X)
        self.feature_names = X.columns.tolist()

        if self.approach == "ensemble":
            for detector in self.detectors:
                detector.fit(X, y)
        else:
            self.detector.fit(X, y)

        self.is_fitted = True
        return self

    def predict(self, X: pd.DataFrame) -> ModelResult:
        """Detect anomalies"""
        if not self.is_fitted:
            raise ValueError("Model not fitted")

        self._validate_input(X)

        if self.approach == "ensemble":
            return self._ensemble_predict(X)
        else:
            return self.detector.predict(X)

    def _ensemble_predict(self, X: pd.DataFrame) -> ModelResult:
        """Combine predictions from multiple detectors"""
        all_predictions = []
        all_probabilities = []

        for detector in self.detectors:
            result = detector.predict(X)
            all_predictions.append(result.predictions)
            all_probabilities.append(result.probabilities)

        # Stack predictions
        pred_matrix = np.column_stack(all_predictions)
        prob_matrix = np.column_stack(all_probabilities)

        # Majority voting for predictions
        ensemble_predictions = (pred_matrix.sum(axis=1) >= len(self.detectors) / 2).astype(int)

        # Average probabilities
        ensemble_probabilities = prob_matrix.mean(axis=1)

        return ModelResult(
            predictions=ensemble_predictions,
            probabilities=ensemble_probabilities,
            confidence=float(ensemble_probabilities.mean()),
            details={
                "approach": "ensemble",
                "num_detectors": len(self.detectors),
                "individual_results": {
                    det.name: {
                        "anomaly_count": int(pred.sum()),
                    }
                    for det, pred in zip(self.detectors, all_predictions)
                },
            }
        )

    def evaluate(self, X: pd.DataFrame, y: pd.Series) -> ModelMetrics:
        """Evaluate detection performance"""
        if self.approach == "ensemble":
            result = self.predict(X)
            from sklearn.metrics import precision_score, recall_score, f1_score
            predictions = result.predictions
            return ModelMetrics(
                precision=float(precision_score(y, predictions, zero_division=0)),
                recall=float(recall_score(y, predictions, zero_division=0)),
                f1_score=float(f1_score(y, predictions, zero_division=0)),
            )
        else:
            return self.detector.evaluate(X, y)

    @staticmethod
    def compare_approaches(
        X_train: pd.DataFrame,
        y_train: pd.Series,
        X_test: pd.DataFrame,
        y_test: pd.Series,
    ) -> Dict[str, ModelMetrics]:
        """Compare all anomaly detection approaches"""
        detectors = [
            ZScoreDetector(threshold=3.0),
            IQRDetector(multiplier=1.5),
            IsolationForestDetector(contamination=0.1),
        ]

        comparison = ModelComparison(detectors)
        return comparison.compare(X_train, y_train, X_test, y_test)

    def detect_single(self, reading: Dict) -> Dict:
        """
        Detect anomaly for a single reading
        Used for real-time detection

        Args:
            reading: Dictionary with flow_in, flow_out, pressure, etc.

        Returns:
            Dictionary with is_anomaly, probability, details
        """
        if not self.is_fitted:
            raise ValueError("Model not fitted")

        # Convert to DataFrame
        df = pd.DataFrame([reading])

        # Ensure all features are present
        for col in self.feature_names:
            if col not in df.columns:
                df[col] = 0  # Default value

        # Select only required features
        df = df[self.feature_names]

        result = self.predict(df)

        return {
            "is_anomaly": bool(result.predictions[0]),
            "probability": float(result.probabilities[0]) if result.probabilities is not None else None,
            "confidence": result.confidence,
            "details": result.details,
        }
