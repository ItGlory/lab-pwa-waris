"""
Baseline Anomaly Detection Models
Statistical approaches: Z-Score and IQR
"""

from typing import Optional
import numpy as np
import pandas as pd
from sklearn.metrics import precision_score, recall_score, f1_score

from ..base import BaseModel, ModelResult, ModelMetrics


class ZScoreDetector(BaseModel):
    """Z-Score based anomaly detection (Baseline)"""

    def __init__(self, threshold: float = 3.0):
        super().__init__(name="ZScoreDetector", version="1.0.0")
        self.threshold = threshold
        self.means: Optional[pd.Series] = None
        self.stds: Optional[pd.Series] = None

    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> "ZScoreDetector":
        """Calculate mean and std for each feature"""
        self._validate_input(X)
        self.feature_names = X.columns.tolist()
        self.means = X.mean()
        self.stds = X.std()
        # Replace zero std with 1 to avoid division by zero
        self.stds = self.stds.replace(0, 1)
        self.is_fitted = True
        return self

    def predict(self, X: pd.DataFrame) -> ModelResult:
        """Detect anomalies using Z-Score"""
        if not self.is_fitted:
            raise ValueError("Model not fitted")

        self._validate_input(X)

        # Calculate Z-scores
        z_scores = np.abs((X - self.means) / self.stds)

        # Anomaly if any feature exceeds threshold
        is_anomaly = (z_scores > self.threshold).any(axis=1).astype(int)

        # Confidence based on max z-score
        max_z = z_scores.max(axis=1)
        confidence = (max_z / (max_z.max() + 1e-6)).mean()

        return ModelResult(
            predictions=is_anomaly.values,
            probabilities=max_z.values / (max_z.max() + 1e-6),
            confidence=float(confidence),
            details={
                "threshold": self.threshold,
                "max_z_scores": max_z.tolist(),
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


class IQRDetector(BaseModel):
    """IQR (Interquartile Range) based anomaly detection"""

    def __init__(self, multiplier: float = 1.5):
        super().__init__(name="IQRDetector", version="1.0.0")
        self.multiplier = multiplier
        self.q1: Optional[pd.Series] = None
        self.q3: Optional[pd.Series] = None
        self.iqr: Optional[pd.Series] = None
        self.lower_bound: Optional[pd.Series] = None
        self.upper_bound: Optional[pd.Series] = None

    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> "IQRDetector":
        """Calculate IQR bounds for each feature"""
        self._validate_input(X)
        self.feature_names = X.columns.tolist()

        self.q1 = X.quantile(0.25)
        self.q3 = X.quantile(0.75)
        self.iqr = self.q3 - self.q1

        self.lower_bound = self.q1 - self.multiplier * self.iqr
        self.upper_bound = self.q3 + self.multiplier * self.iqr

        self.is_fitted = True
        return self

    def predict(self, X: pd.DataFrame) -> ModelResult:
        """Detect anomalies using IQR"""
        if not self.is_fitted:
            raise ValueError("Model not fitted")

        self._validate_input(X)

        # Check if values are outside bounds
        below_lower = X < self.lower_bound
        above_upper = X > self.upper_bound

        # Anomaly if any feature is outside bounds
        is_anomaly = (below_lower | above_upper).any(axis=1).astype(int)

        # Calculate distance from nearest bound as probability
        distances = pd.DataFrame(index=X.index)
        for col in X.columns:
            dist_lower = np.maximum(0, self.lower_bound[col] - X[col])
            dist_upper = np.maximum(0, X[col] - self.upper_bound[col])
            distances[col] = np.maximum(dist_lower, dist_upper)

        max_dist = distances.max(axis=1)
        probs = max_dist / (max_dist.max() + 1e-6)

        return ModelResult(
            predictions=is_anomaly.values,
            probabilities=probs.values,
            confidence=float(probs.mean()),
            details={
                "multiplier": self.multiplier,
                "lower_bound": self.lower_bound.to_dict(),
                "upper_bound": self.upper_bound.to_dict(),
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
