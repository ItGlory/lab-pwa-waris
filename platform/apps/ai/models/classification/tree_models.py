"""
Tree-based Classification Models
Decision Tree, Random Forest, and XGBoost
"""

from typing import Optional
import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier as SKDecisionTree
from sklearn.ensemble import RandomForestClassifier as SKRandomForest
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
)

from ..base import BaseModel, ModelResult, ModelMetrics


class DecisionTreeClassifier(BaseModel):
    """Decision Tree classifier (Baseline)"""

    def __init__(
        self,
        max_depth: int = 10,
        min_samples_split: int = 5,
        random_state: int = 42,
    ):
        super().__init__(name="DecisionTreeClassifier", version="1.0.0")
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.random_state = random_state
        self.model: Optional[SKDecisionTree] = None
        self.classes_: Optional[np.ndarray] = None

    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> "DecisionTreeClassifier":
        """Train Decision Tree model"""
        if y is None:
            raise ValueError("y is required for classification")

        self._validate_input(X)
        self.feature_names = X.columns.tolist()

        self.model = SKDecisionTree(
            max_depth=self.max_depth,
            min_samples_split=self.min_samples_split,
            random_state=self.random_state,
        )
        self.model.fit(X, y)
        self.classes_ = self.model.classes_

        self.is_fitted = True
        return self

    def predict(self, X: pd.DataFrame) -> ModelResult:
        """Classify water loss type"""
        if not self.is_fitted or self.model is None:
            raise ValueError("Model not fitted")

        self._validate_input(X)

        predictions = self.model.predict(X)
        probabilities = self.model.predict_proba(X)

        # Confidence is max probability
        confidence = probabilities.max(axis=1).mean()

        return ModelResult(
            predictions=predictions,
            probabilities=probabilities,
            confidence=float(confidence),
            details={
                "classes": self.classes_.tolist() if self.classes_ is not None else [],
                "max_depth": self.max_depth,
            }
        )

    def evaluate(self, X: pd.DataFrame, y: pd.Series) -> ModelMetrics:
        """Evaluate classification performance"""
        result = self.predict(X)
        predictions = result.predictions
        probabilities = result.probabilities

        metrics = ModelMetrics(
            accuracy=float(accuracy_score(y, predictions)),
            precision=float(precision_score(y, predictions, average="weighted", zero_division=0)),
            recall=float(recall_score(y, predictions, average="weighted", zero_division=0)),
            f1_score=float(f1_score(y, predictions, average="weighted", zero_division=0)),
        )

        # AUC-ROC for binary classification
        if len(self.classes_) == 2:
            metrics.auc_roc = float(roc_auc_score(y, probabilities[:, 1]))

        return metrics

    def get_feature_importance(self) -> pd.Series:
        """Get feature importance scores"""
        if not self.is_fitted or self.model is None:
            raise ValueError("Model not fitted")

        return pd.Series(
            self.model.feature_importances_,
            index=self.feature_names,
        ).sort_values(ascending=False)


class RandomForestClassifier(BaseModel):
    """Random Forest classifier"""

    def __init__(
        self,
        n_estimators: int = 100,
        max_depth: int = 15,
        min_samples_split: int = 5,
        random_state: int = 42,
    ):
        super().__init__(name="RandomForestClassifier", version="1.0.0")
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.random_state = random_state
        self.model: Optional[SKRandomForest] = None
        self.classes_: Optional[np.ndarray] = None

    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> "RandomForestClassifier":
        """Train Random Forest model"""
        if y is None:
            raise ValueError("y is required for classification")

        self._validate_input(X)
        self.feature_names = X.columns.tolist()

        self.model = SKRandomForest(
            n_estimators=self.n_estimators,
            max_depth=self.max_depth,
            min_samples_split=self.min_samples_split,
            random_state=self.random_state,
            n_jobs=-1,
        )
        self.model.fit(X, y)
        self.classes_ = self.model.classes_

        self.is_fitted = True
        return self

    def predict(self, X: pd.DataFrame) -> ModelResult:
        """Classify water loss type"""
        if not self.is_fitted or self.model is None:
            raise ValueError("Model not fitted")

        self._validate_input(X)

        predictions = self.model.predict(X)
        probabilities = self.model.predict_proba(X)
        confidence = probabilities.max(axis=1).mean()

        return ModelResult(
            predictions=predictions,
            probabilities=probabilities,
            confidence=float(confidence),
            details={
                "classes": self.classes_.tolist() if self.classes_ is not None else [],
                "n_estimators": self.n_estimators,
            }
        )

    def evaluate(self, X: pd.DataFrame, y: pd.Series) -> ModelMetrics:
        """Evaluate classification performance"""
        result = self.predict(X)
        predictions = result.predictions
        probabilities = result.probabilities

        metrics = ModelMetrics(
            accuracy=float(accuracy_score(y, predictions)),
            precision=float(precision_score(y, predictions, average="weighted", zero_division=0)),
            recall=float(recall_score(y, predictions, average="weighted", zero_division=0)),
            f1_score=float(f1_score(y, predictions, average="weighted", zero_division=0)),
        )

        if len(self.classes_) == 2:
            metrics.auc_roc = float(roc_auc_score(y, probabilities[:, 1]))

        return metrics

    def get_feature_importance(self) -> pd.Series:
        """Get feature importance scores"""
        if not self.is_fitted or self.model is None:
            raise ValueError("Model not fitted")

        return pd.Series(
            self.model.feature_importances_,
            index=self.feature_names,
        ).sort_values(ascending=False)


class XGBoostClassifier(BaseModel):
    """XGBoost classifier"""

    def __init__(
        self,
        n_estimators: int = 100,
        max_depth: int = 6,
        learning_rate: float = 0.1,
        random_state: int = 42,
    ):
        super().__init__(name="XGBoostClassifier", version="1.0.0")
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.learning_rate = learning_rate
        self.random_state = random_state
        self.model = None
        self.classes_: Optional[np.ndarray] = None

    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> "XGBoostClassifier":
        """Train XGBoost model"""
        if y is None:
            raise ValueError("y is required for classification")

        self._validate_input(X)
        self.feature_names = X.columns.tolist()

        try:
            import xgboost as xgb
            self.model = xgb.XGBClassifier(
                n_estimators=self.n_estimators,
                max_depth=self.max_depth,
                learning_rate=self.learning_rate,
                random_state=self.random_state,
                use_label_encoder=False,
                eval_metric="logloss",
                n_jobs=-1,
            )
            self.model.fit(X, y)
            self.classes_ = self.model.classes_
        except ImportError:
            # Fallback to sklearn if xgboost not available
            from sklearn.ensemble import GradientBoostingClassifier
            self.model = GradientBoostingClassifier(
                n_estimators=self.n_estimators,
                max_depth=self.max_depth,
                learning_rate=self.learning_rate,
                random_state=self.random_state,
            )
            self.model.fit(X, y)
            self.classes_ = self.model.classes_

        self.is_fitted = True
        return self

    def predict(self, X: pd.DataFrame) -> ModelResult:
        """Classify water loss type"""
        if not self.is_fitted or self.model is None:
            raise ValueError("Model not fitted")

        self._validate_input(X)

        predictions = self.model.predict(X)
        probabilities = self.model.predict_proba(X)
        confidence = probabilities.max(axis=1).mean()

        return ModelResult(
            predictions=predictions,
            probabilities=probabilities,
            confidence=float(confidence),
            details={
                "classes": self.classes_.tolist() if self.classes_ is not None else [],
                "n_estimators": self.n_estimators,
                "learning_rate": self.learning_rate,
            }
        )

    def evaluate(self, X: pd.DataFrame, y: pd.Series) -> ModelMetrics:
        """Evaluate classification performance"""
        result = self.predict(X)
        predictions = result.predictions
        probabilities = result.probabilities

        metrics = ModelMetrics(
            accuracy=float(accuracy_score(y, predictions)),
            precision=float(precision_score(y, predictions, average="weighted", zero_division=0)),
            recall=float(recall_score(y, predictions, average="weighted", zero_division=0)),
            f1_score=float(f1_score(y, predictions, average="weighted", zero_division=0)),
        )

        if len(self.classes_) == 2:
            metrics.auc_roc = float(roc_auc_score(y, probabilities[:, 1]))

        return metrics

    def get_feature_importance(self) -> pd.Series:
        """Get feature importance scores"""
        if not self.is_fitted or self.model is None:
            raise ValueError("Model not fitted")

        return pd.Series(
            self.model.feature_importances_,
            index=self.feature_names,
        ).sort_values(ascending=False)
