"""
Base Model Classes for AI Shadowing
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional, Union
import numpy as np
import pandas as pd
import logging

logger = logging.getLogger(__name__)


@dataclass
class ModelMetrics:
    """Container for model evaluation metrics"""
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    auc_roc: Optional[float] = None
    mae: Optional[float] = None
    rmse: Optional[float] = None
    mape: Optional[float] = None
    silhouette_score: Optional[float] = None
    extra: Dict[str, float] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, float]:
        """Convert to dictionary, excluding None values"""
        result = {}
        for key, value in self.__dict__.items():
            if key == "extra":
                result.update(value)
            elif value is not None:
                result[key] = value
        return result


@dataclass
class ModelResult:
    """Container for model prediction results"""
    predictions: Union[np.ndarray, List, pd.Series]
    probabilities: Optional[Union[np.ndarray, List]] = None
    confidence: Optional[float] = None
    details: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "predictions": self.predictions.tolist() if isinstance(self.predictions, np.ndarray) else self.predictions,
            "probabilities": self.probabilities.tolist() if isinstance(self.probabilities, np.ndarray) else self.probabilities,
            "confidence": self.confidence,
            "details": self.details,
            "timestamp": self.timestamp.isoformat(),
        }


class BaseModel(ABC):
    """Abstract base class for all AI models"""

    def __init__(self, name: str, version: str = "1.0.0"):
        self.name = name
        self.version = version
        self.is_fitted = False
        self.model = None
        self.feature_names: List[str] = []
        self.metadata: Dict[str, Any] = {}

    @abstractmethod
    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> "BaseModel":
        """Train the model"""
        pass

    @abstractmethod
    def predict(self, X: pd.DataFrame) -> ModelResult:
        """Make predictions"""
        pass

    @abstractmethod
    def evaluate(self, X: pd.DataFrame, y: pd.Series) -> ModelMetrics:
        """Evaluate model performance"""
        pass

    def save(self, path: str) -> None:
        """Save model to disk"""
        import joblib
        joblib.dump({
            "name": self.name,
            "version": self.version,
            "model": self.model,
            "feature_names": self.feature_names,
            "metadata": self.metadata,
            "is_fitted": self.is_fitted,
        }, path)
        logger.info(f"Model saved to {path}")

    def load(self, path: str) -> "BaseModel":
        """Load model from disk"""
        import joblib
        data = joblib.load(path)
        self.name = data["name"]
        self.version = data["version"]
        self.model = data["model"]
        self.feature_names = data["feature_names"]
        self.metadata = data["metadata"]
        self.is_fitted = data["is_fitted"]
        logger.info(f"Model loaded from {path}")
        return self

    def _validate_input(self, X: pd.DataFrame) -> None:
        """Validate input data"""
        if X.empty:
            raise ValueError("Input data is empty")
        if self.is_fitted and self.feature_names:
            missing = set(self.feature_names) - set(X.columns)
            if missing:
                raise ValueError(f"Missing features: {missing}")

    def get_info(self) -> Dict[str, Any]:
        """Get model information"""
        return {
            "name": self.name,
            "version": self.version,
            "is_fitted": self.is_fitted,
            "feature_names": self.feature_names,
            "metadata": self.metadata,
        }


class ModelComparison:
    """Framework for comparing multiple model approaches"""

    def __init__(self, models: List[BaseModel]):
        self.models = models
        self.results: Dict[str, ModelMetrics] = {}

    def compare(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        X_test: pd.DataFrame,
        y_test: pd.Series,
    ) -> Dict[str, ModelMetrics]:
        """Compare all models and return metrics"""
        for model in self.models:
            logger.info(f"Training {model.name}...")
            model.fit(X_train, y_train)

            logger.info(f"Evaluating {model.name}...")
            metrics = model.evaluate(X_test, y_test)
            self.results[model.name] = metrics

        return self.results

    def get_best_model(self, metric: str = "f1_score") -> BaseModel:
        """Get the best model based on specified metric"""
        if not self.results:
            raise ValueError("No comparison results available")

        best_score = -float("inf")
        best_model = None

        for model in self.models:
            metrics = self.results.get(model.name)
            if metrics:
                score = getattr(metrics, metric, None)
                if score is not None and score > best_score:
                    best_score = score
                    best_model = model

        return best_model

    def generate_report(self) -> pd.DataFrame:
        """Generate comparison report"""
        data = []
        for name, metrics in self.results.items():
            row = {"model": name, **metrics.to_dict()}
            data.append(row)
        return pd.DataFrame(data)
