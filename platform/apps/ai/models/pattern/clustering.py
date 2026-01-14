"""
Clustering-based Pattern Recognition
K-Means and DBSCAN approaches
"""

from typing import Optional, List
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

from ..base import BaseModel, ModelResult, ModelMetrics


class KMeansRecognizer(BaseModel):
    """K-Means clustering for pattern recognition"""

    def __init__(
        self,
        n_clusters: int = 5,
        random_state: int = 42,
        max_iter: int = 300,
    ):
        super().__init__(name="KMeansRecognizer", version="1.0.0")
        self.n_clusters = n_clusters
        self.random_state = random_state
        self.max_iter = max_iter
        self.model: Optional[KMeans] = None
        self.scaler: Optional[StandardScaler] = None
        self.cluster_centers_: Optional[np.ndarray] = None
        self.cluster_labels_: List[str] = []

    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> "KMeansRecognizer":
        """Train K-Means clustering model"""
        self._validate_input(X)
        self.feature_names = X.columns.tolist()

        # Scale features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        # Train K-Means
        self.model = KMeans(
            n_clusters=self.n_clusters,
            random_state=self.random_state,
            max_iter=self.max_iter,
            n_init=10,
        )
        self.model.fit(X_scaled)

        # Store cluster centers in original scale
        self.cluster_centers_ = self.scaler.inverse_transform(self.model.cluster_centers_)

        # Generate cluster labels based on characteristics
        self._generate_cluster_labels(X)

        self.is_fitted = True
        return self

    def _generate_cluster_labels(self, X: pd.DataFrame) -> None:
        """Generate descriptive labels for clusters"""
        # Assign patterns to clusters based on centroids
        patterns = [
            "high_usage",     # สูง
            "low_usage",      # ต่ำ
            "peak_hours",     # ชั่วโมงเร่งด่วน
            "off_peak",       # นอกชั่วโมงเร่งด่วน
            "weekend",        # วันหยุด
        ]

        # Use first n_clusters patterns
        self.cluster_labels_ = patterns[:self.n_clusters]

        # If more clusters than patterns, add numbered labels
        while len(self.cluster_labels_) < self.n_clusters:
            self.cluster_labels_.append(f"pattern_{len(self.cluster_labels_) + 1}")

    def predict(self, X: pd.DataFrame) -> ModelResult:
        """Assign patterns to data points"""
        if not self.is_fitted or self.model is None:
            raise ValueError("Model not fitted")

        self._validate_input(X)

        # Scale and predict
        X_scaled = self.scaler.transform(X)
        clusters = self.model.predict(X_scaled)

        # Get distances to cluster centers for confidence
        distances = self.model.transform(X_scaled)
        min_distances = distances.min(axis=1)

        # Convert distances to confidence (closer = higher confidence)
        max_dist = min_distances.max() + 1e-6
        confidence = 1 - (min_distances / max_dist)

        # Map cluster IDs to labels
        pattern_labels = [self.cluster_labels_[c] for c in clusters]

        return ModelResult(
            predictions=clusters,
            probabilities=confidence,
            confidence=float(confidence.mean()),
            details={
                "pattern_labels": pattern_labels,
                "n_clusters": self.n_clusters,
                "cluster_sizes": [int((clusters == i).sum()) for i in range(self.n_clusters)],
            }
        )

    def evaluate(self, X: pd.DataFrame, y: pd.Series) -> ModelMetrics:
        """Evaluate clustering quality"""
        if not self.is_fitted or self.model is None:
            raise ValueError("Model not fitted")

        X_scaled = self.scaler.transform(X)
        labels = self.model.predict(X_scaled)

        # Calculate silhouette score
        if len(set(labels)) > 1:
            sil_score = float(silhouette_score(X_scaled, labels))
        else:
            sil_score = 0.0

        # Inertia (within-cluster sum of squares)
        inertia = float(self.model.inertia_)

        return ModelMetrics(
            silhouette_score=sil_score,
            extra={
                "inertia": inertia,
                "n_clusters": self.n_clusters,
            }
        )

    def get_cluster_profile(self, cluster_id: int) -> pd.Series:
        """Get the profile (centroid) of a specific cluster"""
        if not self.is_fitted:
            raise ValueError("Model not fitted")

        if cluster_id >= self.n_clusters:
            raise ValueError(f"Invalid cluster_id: {cluster_id}")

        return pd.Series(
            self.cluster_centers_[cluster_id],
            index=self.feature_names,
            name=self.cluster_labels_[cluster_id]
        )


class DBSCANRecognizer(BaseModel):
    """DBSCAN clustering for pattern recognition"""

    def __init__(
        self,
        eps: float = 0.5,
        min_samples: int = 5,
    ):
        super().__init__(name="DBSCANRecognizer", version="1.0.0")
        self.eps = eps
        self.min_samples = min_samples
        self.model: Optional[DBSCAN] = None
        self.scaler: Optional[StandardScaler] = None
        self.n_clusters_: int = 0
        self.n_noise_: int = 0

    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> "DBSCANRecognizer":
        """Train DBSCAN clustering model"""
        self._validate_input(X)
        self.feature_names = X.columns.tolist()

        # Scale features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        # Train DBSCAN
        self.model = DBSCAN(
            eps=self.eps,
            min_samples=self.min_samples,
            n_jobs=-1,
        )
        self.model.fit(X_scaled)

        # Count clusters (excluding noise labeled as -1)
        labels = self.model.labels_
        self.n_clusters_ = len(set(labels)) - (1 if -1 in labels else 0)
        self.n_noise_ = int((labels == -1).sum())

        self.is_fitted = True
        return self

    def predict(self, X: pd.DataFrame) -> ModelResult:
        """
        DBSCAN doesn't have predict method, but we can find nearest cluster
        """
        if not self.is_fitted or self.model is None:
            raise ValueError("Model not fitted")

        self._validate_input(X)

        # Scale data
        X_scaled = self.scaler.transform(X)

        # For DBSCAN, we need to refit or use core samples
        # Here we use a simple approach: assign to nearest core sample's cluster
        from sklearn.neighbors import NearestNeighbors

        core_mask = np.zeros(len(self.model.labels_), dtype=bool)
        core_mask[self.model.core_sample_indices_] = True

        if hasattr(self, '_X_train_scaled'):
            X_core = self._X_train_scaled[core_mask]
            labels_core = self.model.labels_[core_mask]
        else:
            # Fallback: return -1 (noise) for new points
            return ModelResult(
                predictions=np.full(len(X), -1),
                probabilities=np.zeros(len(X)),
                confidence=0.0,
                details={"note": "DBSCAN doesn't support predict on new data"}
            )

        # Find nearest core sample for each new point
        nn = NearestNeighbors(n_neighbors=1)
        nn.fit(X_core)
        distances, indices = nn.kneighbors(X_scaled)

        # Assign cluster labels
        predictions = labels_core[indices.flatten()]

        # Points far from core samples marked as noise
        noise_mask = distances.flatten() > self.eps
        predictions[noise_mask] = -1

        # Confidence based on distance
        confidence = 1 - np.minimum(distances.flatten() / self.eps, 1)

        return ModelResult(
            predictions=predictions,
            probabilities=confidence,
            confidence=float(confidence.mean()),
            details={
                "n_clusters": self.n_clusters_,
                "n_noise": int((predictions == -1).sum()),
            }
        )

    def evaluate(self, X: pd.DataFrame, y: pd.Series) -> ModelMetrics:
        """Evaluate clustering quality"""
        if not self.is_fitted or self.model is None:
            raise ValueError("Model not fitted")

        labels = self.model.labels_

        # Calculate silhouette score (excluding noise points)
        if self.n_clusters_ > 1:
            mask = labels != -1
            if mask.sum() > 1:
                X_scaled = self.scaler.transform(X)
                sil_score = float(silhouette_score(X_scaled[mask], labels[mask]))
            else:
                sil_score = 0.0
        else:
            sil_score = 0.0

        return ModelMetrics(
            silhouette_score=sil_score,
            extra={
                "n_clusters": self.n_clusters_,
                "n_noise": self.n_noise_,
                "noise_ratio": self.n_noise_ / len(labels) if len(labels) > 0 else 0,
            }
        )
