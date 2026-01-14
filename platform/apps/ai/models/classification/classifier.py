"""
Unified Water Loss Classifier
Combines multiple classification approaches
"""

from typing import Dict, List, Optional, Literal
import pandas as pd
import numpy as np

from ..base import BaseModel, ModelResult, ModelMetrics, ModelComparison
from .tree_models import DecisionTreeClassifier, RandomForestClassifier, XGBoostClassifier


class WaterLossClassifier(BaseModel):
    """
    Unified Water Loss Classification Model

    Classifies water loss into:
    - Physical Loss (น้ำสูญเสียทางกายภาพ): Leaks, pipe bursts, overflow
    - Commercial Loss (น้ำสูญเสียเชิงพาณิชย์): Meter errors, theft, unbilled

    Supports multiple approaches:
    - decision_tree: Simple baseline
    - random_forest: Ensemble method
    - xgboost: Gradient boosting
    """

    APPROACHES = {
        "decision_tree": DecisionTreeClassifier,
        "random_forest": RandomForestClassifier,
        "xgboost": XGBoostClassifier,
    }

    # Loss type labels
    LOSS_TYPES = {
        0: {"en": "physical", "th": "น้ำสูญเสียทางกายภาพ"},
        1: {"en": "commercial", "th": "น้ำสูญเสียเชิงพาณิชย์"},
    }

    # Sub-categories
    PHYSICAL_LOSS_TYPES = {
        "leak": "รั่วไหล",
        "burst": "ท่อแตก",
        "overflow": "น้ำล้น",
        "joint_failure": "ข้อต่อชำรุด",
    }

    COMMERCIAL_LOSS_TYPES = {
        "meter_error": "มิเตอร์ผิดพลาด",
        "meter_tamper": "มิเตอร์ถูกแก้ไข",
        "illegal_connection": "การต่อเถื่อน",
        "unbilled": "ไม่ได้เรียกเก็บเงิน",
        "data_error": "ข้อมูลผิดพลาด",
    }

    def __init__(
        self,
        approach: Literal["decision_tree", "random_forest", "xgboost"] = "xgboost",
        **kwargs
    ):
        super().__init__(name=f"WaterLossClassifier_{approach}", version="1.0.0")
        self.approach = approach
        self.kwargs = kwargs

        if approach not in self.APPROACHES:
            raise ValueError(f"Unknown approach: {approach}")

        self.classifier = self.APPROACHES[approach](**kwargs)

    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> "WaterLossClassifier":
        """Train the classifier"""
        if y is None:
            raise ValueError("y is required for classification")

        self._validate_input(X)
        self.feature_names = X.columns.tolist()

        self.classifier.fit(X, y)
        self.is_fitted = True
        return self

    def predict(self, X: pd.DataFrame) -> ModelResult:
        """Classify water loss type"""
        if not self.is_fitted:
            raise ValueError("Model not fitted")

        self._validate_input(X)
        result = self.classifier.predict(X)

        # Add loss type labels
        predictions = result.predictions
        loss_labels = [
            self.LOSS_TYPES.get(int(p), {"en": "unknown", "th": "ไม่ทราบ"})
            for p in predictions
        ]

        result.details["loss_types"] = [l["en"] for l in loss_labels]
        result.details["loss_types_th"] = [l["th"] for l in loss_labels]

        return result

    def evaluate(self, X: pd.DataFrame, y: pd.Series) -> ModelMetrics:
        """Evaluate classification performance"""
        return self.classifier.evaluate(X, y)

    def get_feature_importance(self) -> pd.Series:
        """Get feature importance scores"""
        return self.classifier.get_feature_importance()

    @staticmethod
    def compare_approaches(
        X_train: pd.DataFrame,
        y_train: pd.Series,
        X_test: pd.DataFrame,
        y_test: pd.Series,
    ) -> Dict[str, ModelMetrics]:
        """Compare all classification approaches"""
        classifiers = [
            DecisionTreeClassifier(max_depth=10),
            RandomForestClassifier(n_estimators=100),
            XGBoostClassifier(n_estimators=100),
        ]

        comparison = ModelComparison(classifiers)
        return comparison.compare(X_train, y_train, X_test, y_test)

    def classify_single(self, reading: Dict) -> Dict:
        """
        Classify a single reading
        Used for real-time classification

        Args:
            reading: Dictionary with features

        Returns:
            Dictionary with loss_type, probability, details
        """
        if not self.is_fitted:
            raise ValueError("Model not fitted")

        # Convert to DataFrame
        df = pd.DataFrame([reading])

        # Ensure all features are present
        for col in self.feature_names:
            if col not in df.columns:
                df[col] = 0

        df = df[self.feature_names]
        result = self.predict(df)

        prediction = int(result.predictions[0])
        loss_type = self.LOSS_TYPES.get(prediction, {"en": "unknown", "th": "ไม่ทราบ"})

        return {
            "loss_type": loss_type["en"],
            "loss_type_th": loss_type["th"],
            "probability": float(result.probabilities[0].max()) if result.probabilities is not None else None,
            "confidence": result.confidence,
            "feature_importance": self.get_feature_importance().head(5).to_dict(),
        }

    def get_classification_report(self, X: pd.DataFrame, y: pd.Series) -> pd.DataFrame:
        """Generate detailed classification report"""
        from sklearn.metrics import classification_report

        result = self.predict(X)
        predictions = result.predictions

        report = classification_report(y, predictions, output_dict=True)

        # Convert to DataFrame
        df = pd.DataFrame(report).T

        # Add Thai labels
        df.index = df.index.map(lambda x: f"{x} ({self.LOSS_TYPES.get(int(x), {}).get('th', '')})" if x.isdigit() else x)

        return df

    def explain_prediction(self, X: pd.DataFrame, idx: int = 0) -> Dict:
        """
        Explain a single prediction

        Returns feature contributions to the prediction
        """
        if not self.is_fitted:
            raise ValueError("Model not fitted")

        # Get prediction
        result = self.predict(X.iloc[[idx]])
        prediction = int(result.predictions[0])

        # Get feature importance
        importance = self.get_feature_importance()

        # Get feature values for this sample
        sample = X.iloc[idx]

        # Create explanation
        explanation = {
            "prediction": self.LOSS_TYPES.get(prediction, {"en": "unknown", "th": "ไม่ทราบ"}),
            "confidence": float(result.probabilities[0].max()) if result.probabilities is not None else None,
            "top_factors": [],
        }

        for feature, imp in importance.head(5).items():
            explanation["top_factors"].append({
                "feature": feature,
                "importance": float(imp),
                "value": float(sample[feature]),
            })

        return explanation
