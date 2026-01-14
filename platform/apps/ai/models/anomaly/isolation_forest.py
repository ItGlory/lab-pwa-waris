"""
Isolation Forest Anomaly Detection
Approach 1: Tree-based anomaly detection
"""

from typing import Optional
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.metrics import precision_score, recall_score, f1_score

from ..base import BaseModel, ModelResult, ModelMetrics


class IsolationForestDetector(BaseModel):
    """Isolation Forest anomaly detection"""

    def __init__(
        self,
        contamination: float = 0.1,
        n_estimators: int = 100,
        max_samples: str = "auto",
        random_state: int = 42,
    ):
        super().__init__(name="IsolationForestDetector", version="1.0.0")
        self.contamination = contamination
        self.n_estimators = n_estimators
        self.max_samples = max_samples
        self.random_state = random_state
        self.model: Optional[IsolationForest] = None

    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> "IsolationForestDetector":
        """Train Isolation Forest model"""
        self._validate_input(X)
        self.feature_names = X.columns.tolist()

        self.model = IsolationForest(
            contamination=self.contamination,
            n_estimators=self.n_estimators,
            max_samples=self.max_samples,
            random_state=self.random_state,
            n_jobs=-1,
        )

        self.model.fit(X)
        self.is_fitted = True
        return self

    def predict(self, X: pd.DataFrame) -> ModelResult:
        """Detect anomalies using Isolation Forest"""
        if not self.is_fitted or self.model is None:
            raise ValueError("Model not fitted")

        self._validate_input(X)

        # Get predictions (-1 for anomaly, 1 for normal)
        raw_predictions = self.model.predict(X)
        # Convert to 0 (normal) and 1 (anomaly)
        predictions = (raw_predictions == -1).astype(int)

        # Get anomaly scores (negative scores are more anomalous)
        scores = self.model.decision_function(X)
        # Normalize to probabilities (higher = more anomalous)
        probs = 1 - (scores - scores.min()) / (scores.max() - scores.min() + 1e-6)

        return ModelResult(
            predictions=predictions,
            probabilities=probs,
            confidence=float(probs.mean()),
            details={
                "contamination": self.contamination,
                "n_estimators": self.n_estimators,
                "anomaly_scores": scores.tolist(),
            }
        )

    def evaluate(self, X: pd.DataFrame, y: pd.Series) -> ModelMetrics:
        """Evaluate detection performance"""
        result = self.predict(X)
        predictions = result.predictions

        return ModelMetrics(
            precision=float(precision_score(y, predictions, zero_division=0)),
            recall=float(recall_score(y, predictions, zero_division=0)),
            f1_score=float(f1_score(y, predictions, zero_division=0)),
        )

    def get_feature_importance(self) -> pd.Series:
        """Get feature importance scores (not directly available in IF)"""
        if not self.is_fitted:
            raise ValueError("Model not fitted")
        # Isolation Forest doesn't provide direct feature importance
        # Return equal weights as placeholder
        return pd.Series(
            [1.0 / len(self.feature_names)] * len(self.feature_names),
            index=self.feature_names,
        )
