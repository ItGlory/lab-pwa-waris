"""
Unified Time Series Forecaster
Combines multiple forecasting approaches
"""

from typing import Dict, List, Optional, Literal
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from ..base import BaseModel, ModelResult, ModelMetrics, ModelComparison
from .baseline import MovingAverageForecaster, ExponentialSmoothingForecaster
from .prophet_model import ProphetForecaster


class TimeSeriesForecaster(BaseModel):
    """
    Unified Time Series Forecasting Model

    Forecasts water loss trends and values.

    Supports multiple approaches:
    - moving_average: Simple baseline
    - exponential_smoothing: Exponential smoothing
    - prophet: Facebook Prophet
    - ensemble: Combine multiple methods
    """

    APPROACHES = {
        "moving_average": MovingAverageForecaster,
        "exponential_smoothing": ExponentialSmoothingForecaster,
        "prophet": ProphetForecaster,
    }

    def __init__(
        self,
        approach: Literal["moving_average", "exponential_smoothing", "prophet", "ensemble"] = "prophet",
        **kwargs
    ):
        super().__init__(name=f"TimeSeriesForecaster_{approach}", version="1.0.0")
        self.approach = approach
        self.kwargs = kwargs
        self.forecaster: Optional[BaseModel] = None
        self.forecasters: List[BaseModel] = []

        if approach == "ensemble":
            self.forecasters = [
                MovingAverageForecaster(**kwargs.get("moving_average", {})),
                ProphetForecaster(**kwargs.get("prophet", {})),
            ]
        elif approach in self.APPROACHES:
            self.forecaster = self.APPROACHES[approach](**kwargs)
        else:
            raise ValueError(f"Unknown approach: {approach}")

    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> "TimeSeriesForecaster":
        """Train the forecaster"""
        self._validate_input(X)

        if self.approach == "ensemble":
            for forecaster in self.forecasters:
                forecaster.fit(X, y)
        else:
            self.forecaster.fit(X, y)

        self.is_fitted = True
        return self

    def predict(self, X: pd.DataFrame) -> ModelResult:
        """Generate forecasts"""
        if not self.is_fitted:
            raise ValueError("Model not fitted")

        if self.approach == "ensemble":
            return self._ensemble_predict(X)
        else:
            return self.forecaster.predict(X)

    def _ensemble_predict(self, X: pd.DataFrame) -> ModelResult:
        """Combine forecasts from multiple models"""
        all_predictions = []
        all_lower = []
        all_upper = []

        for forecaster in self.forecasters:
            result = forecaster.predict(X)
            all_predictions.append(result.predictions)

            if "lower_bound" in result.details:
                all_lower.append(result.details["lower_bound"])
            if "upper_bound" in result.details:
                all_upper.append(result.details["upper_bound"])

        # Average predictions
        ensemble_predictions = np.mean(all_predictions, axis=0)

        # Average bounds if available
        details = {
            "approach": "ensemble",
            "num_forecasters": len(self.forecasters),
        }

        if all_lower:
            details["lower_bound"] = np.mean(all_lower, axis=0).tolist()
        if all_upper:
            details["upper_bound"] = np.mean(all_upper, axis=0).tolist()

        return ModelResult(
            predictions=ensemble_predictions,
            probabilities=None,
            confidence=0.95,
            details=details,
        )

    def evaluate(self, X: pd.DataFrame, y: pd.Series) -> ModelMetrics:
        """Evaluate forecast accuracy"""
        result = self.predict(X)
        predictions = result.predictions[:len(y)]
        actuals = y.values[:len(predictions)]

        mae = float(np.abs(predictions - actuals).mean())
        rmse = float(np.sqrt(((predictions - actuals) ** 2).mean()))

        mask = actuals != 0
        if mask.sum() > 0:
            mape = float(np.abs((predictions[mask] - actuals[mask]) / actuals[mask]).mean() * 100)
        else:
            mape = float("inf")

        return ModelMetrics(mae=mae, rmse=rmse, mape=mape)

    @staticmethod
    def compare_approaches(
        X_train: pd.DataFrame,
        y_train: pd.Series,
        X_test: pd.DataFrame,
        y_test: pd.Series,
    ) -> Dict[str, ModelMetrics]:
        """Compare all forecasting approaches"""
        forecasters = [
            MovingAverageForecaster(window=7),
            ProphetForecaster(),
        ]

        comparison = ModelComparison(forecasters)
        return comparison.compare(X_train, y_train, X_test, y_test)

    def forecast_days(self, days: int) -> Dict:
        """
        Forecast water loss for specified number of days

        Args:
            days: Number of days to forecast

        Returns:
            Dictionary with dates, predictions, and bounds
        """
        if not self.is_fitted:
            raise ValueError("Model not fitted")

        # Create forecast request
        X = pd.DataFrame({"periods": [days]})
        result = self.predict(X)

        # Generate dates
        start_date = datetime.now() + timedelta(days=1)
        dates = [(start_date + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days)]

        return {
            "dates": dates,
            "predictions": result.predictions.tolist(),
            "lower_bound": result.details.get("lower_bound", []),
            "upper_bound": result.details.get("upper_bound", []),
            "confidence": result.confidence,
        }

    def get_trend_analysis(self) -> Dict:
        """
        Analyze the trend in historical data

        Returns analysis of trend direction, strength, and seasonality
        """
        if not self.is_fitted:
            return {}

        if self.approach == "prophet" and self.forecaster:
            components = self.forecaster.get_components()
            if components:
                trend = components.get("trend", [])
                if len(trend) > 1:
                    trend_direction = "increasing" if trend[-1] > trend[0] else "decreasing"
                    trend_strength = abs(trend[-1] - trend[0]) / (abs(np.mean(trend)) + 1e-6)

                    return {
                        "direction": trend_direction,
                        "direction_th": "เพิ่มขึ้น" if trend_direction == "increasing" else "ลดลง",
                        "strength": float(trend_strength),
                        "has_weekly_seasonality": "weekly" in components,
                        "has_yearly_seasonality": "yearly" in components,
                    }

        return {
            "direction": "unknown",
            "direction_th": "ไม่ทราบ",
            "strength": 0,
        }
