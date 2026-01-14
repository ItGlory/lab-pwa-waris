"""
Unified Pattern Recognizer
Combines multiple pattern recognition approaches
"""

from typing import Dict, List, Optional, Literal
import pandas as pd
import numpy as np

from ..base import BaseModel, ModelResult, ModelMetrics, ModelComparison
from .clustering import KMeansRecognizer, DBSCANRecognizer


class PatternRecognizer(BaseModel):
    """
    Unified Pattern Recognition Model

    Supports multiple approaches:
    - kmeans: K-Means clustering
    - dbscan: Density-based clustering
    - hybrid: K-Means with DBSCAN for noise detection
    """

    APPROACHES = {
        "kmeans": KMeansRecognizer,
        "dbscan": DBSCANRecognizer,
    }

    # Predefined usage patterns (Thai labels)
    PATTERN_LABELS = {
        "high_usage": "การใช้น้ำสูง",
        "low_usage": "การใช้น้ำต่ำ",
        "peak_hours": "ชั่วโมงเร่งด่วน",
        "off_peak": "นอกชั่วโมงเร่งด่วน",
        "weekend": "วันหยุดสุดสัปดาห์",
        "night": "กลางคืน",
        "seasonal_high": "ฤดูกาลใช้น้ำสูง",
        "seasonal_low": "ฤดูกาลใช้น้ำต่ำ",
        "anomalous": "รูปแบบผิดปกติ",
    }

    def __init__(
        self,
        approach: Literal["kmeans", "dbscan", "hybrid"] = "kmeans",
        n_clusters: int = 5,
        **kwargs
    ):
        super().__init__(name=f"PatternRecognizer_{approach}", version="1.0.0")
        self.approach = approach
        self.n_clusters = n_clusters
        self.kwargs = kwargs
        self.recognizer: Optional[BaseModel] = None
        self.pattern_mapping: Dict[int, str] = {}

        if approach == "hybrid":
            # Use K-Means for main clusters, DBSCAN for noise
            self.kmeans = KMeansRecognizer(n_clusters=n_clusters, **kwargs)
            self.dbscan = DBSCANRecognizer(**kwargs.get("dbscan", {}))
        elif approach in self.APPROACHES:
            self.recognizer = self.APPROACHES[approach](
                n_clusters=n_clusters if approach == "kmeans" else None,
                **kwargs
            )
        else:
            raise ValueError(f"Unknown approach: {approach}")

    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> "PatternRecognizer":
        """Train the pattern recognizer"""
        self._validate_input(X)
        self.feature_names = X.columns.tolist()

        if self.approach == "hybrid":
            self.kmeans.fit(X, y)
            self.dbscan.fit(X, y)
            self._create_hybrid_mapping()
        else:
            self.recognizer.fit(X, y)
            self._create_pattern_mapping(X)

        self.is_fitted = True
        return self

    def _create_pattern_mapping(self, X: pd.DataFrame) -> None:
        """Map cluster IDs to pattern labels based on characteristics"""
        if self.recognizer is None:
            return

        # Get cluster predictions
        result = self.recognizer.predict(X)
        clusters = result.predictions

        # For each cluster, determine dominant pattern
        for cluster_id in range(self.n_clusters):
            mask = clusters == cluster_id
            if mask.sum() == 0:
                continue

            cluster_data = X[mask]

            # Simple heuristic based on mean values
            # In real implementation, use domain knowledge
            mean_values = cluster_data.mean()

            # Determine pattern based on features
            if "flow_in" in mean_values.index:
                flow = mean_values.get("flow_in", 0)
                if flow > X["flow_in"].quantile(0.75):
                    pattern = "high_usage"
                elif flow < X["flow_in"].quantile(0.25):
                    pattern = "low_usage"
                else:
                    pattern = f"pattern_{cluster_id}"
            else:
                pattern = f"pattern_{cluster_id}"

            self.pattern_mapping[cluster_id] = pattern

    def _create_hybrid_mapping(self) -> None:
        """Create pattern mapping for hybrid approach"""
        # Use K-Means cluster labels
        self.pattern_mapping = {
            i: self.kmeans.cluster_labels_[i]
            for i in range(self.n_clusters)
        }
        # Add noise pattern from DBSCAN
        self.pattern_mapping[-1] = "anomalous"

    def predict(self, X: pd.DataFrame) -> ModelResult:
        """Recognize patterns in data"""
        if not self.is_fitted:
            raise ValueError("Model not fitted")

        self._validate_input(X)

        if self.approach == "hybrid":
            return self._hybrid_predict(X)
        else:
            result = self.recognizer.predict(X)

            # Add pattern labels
            pattern_labels = [
                self.pattern_mapping.get(int(c), f"pattern_{c}")
                for c in result.predictions
            ]

            result.details["pattern_labels"] = pattern_labels
            result.details["pattern_labels_th"] = [
                self.PATTERN_LABELS.get(p, p) for p in pattern_labels
            ]

            return result

    def _hybrid_predict(self, X: pd.DataFrame) -> ModelResult:
        """Hybrid prediction using K-Means and DBSCAN"""
        # Get K-Means clusters
        kmeans_result = self.kmeans.predict(X)

        # Get DBSCAN noise detection
        dbscan_result = self.dbscan.predict(X)

        # Mark K-Means clusters as anomalous if DBSCAN says noise
        predictions = kmeans_result.predictions.copy()
        predictions[dbscan_result.predictions == -1] = -1

        # Pattern labels
        pattern_labels = [
            self.pattern_mapping.get(int(c), "anomalous")
            for c in predictions
        ]

        return ModelResult(
            predictions=predictions,
            probabilities=kmeans_result.probabilities,
            confidence=float(kmeans_result.confidence),
            details={
                "approach": "hybrid",
                "pattern_labels": pattern_labels,
                "pattern_labels_th": [
                    self.PATTERN_LABELS.get(p, p) for p in pattern_labels
                ],
                "n_anomalous": int((predictions == -1).sum()),
            }
        )

    def evaluate(self, X: pd.DataFrame, y: pd.Series) -> ModelMetrics:
        """Evaluate pattern recognition quality"""
        if self.approach == "hybrid":
            return self.kmeans.evaluate(X, y)
        else:
            return self.recognizer.evaluate(X, y)

    @staticmethod
    def compare_approaches(
        X_train: pd.DataFrame,
        y_train: pd.Series,
        X_test: pd.DataFrame,
        y_test: pd.Series,
    ) -> Dict[str, ModelMetrics]:
        """Compare all pattern recognition approaches"""
        recognizers = [
            KMeansRecognizer(n_clusters=5),
            DBSCANRecognizer(eps=0.5, min_samples=5),
        ]

        comparison = ModelComparison(recognizers)
        return comparison.compare(X_train, y_train, X_test, y_test)

    def get_pattern_summary(self, X: pd.DataFrame) -> pd.DataFrame:
        """
        Get summary of patterns in data

        Returns DataFrame with pattern counts and characteristics
        """
        if not self.is_fitted:
            raise ValueError("Model not fitted")

        result = self.predict(X)
        patterns = result.details.get("pattern_labels", [])

        # Count patterns
        summary_data = []
        for pattern in set(patterns):
            mask = np.array(patterns) == pattern
            count = mask.sum()
            pct = count / len(patterns) * 100

            # Get mean values for this pattern
            pattern_data = X[mask]
            means = pattern_data.mean()

            summary_data.append({
                "pattern": pattern,
                "pattern_th": self.PATTERN_LABELS.get(pattern, pattern),
                "count": count,
                "percentage": round(pct, 1),
                **{f"mean_{col}": means[col] for col in X.columns},
            })

        return pd.DataFrame(summary_data).sort_values("count", ascending=False)
