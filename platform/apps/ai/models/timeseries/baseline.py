"""
Baseline Time Series Forecasting
Moving Average approach
"""

from typing import Optional, List
import numpy as np
import pandas as pd

from ..base import BaseModel, ModelResult, ModelMetrics


class MovingAverageForecaster(BaseModel):
    """Moving Average time series forecasting (Baseline)"""

    def __init__(
        self,
        window: int = 7,
        weighted: bool = False,
    ):
        super().__init__(name="MovingAverageForecaster", version="1.0.0")
        self.window = window
        self.weighted = weighted
        self.history: Optional[pd.Series] = None
        self.target_col: str = "value"

    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> "MovingAverageForecaster":
        """
        Fit the model with historical data

        Args:
            X: DataFrame with datetime index and target column
            y: Optional, target values (if not in X)
        """
        if y is not None:
            self.history = y.copy()
            self.target_col = y.name or "value"
        elif len(X.columns) == 1:
            self.history = X.iloc[:, 0].copy()
            self.target_col = X.columns[0]
        else:
            raise ValueError("Must provide y or single-column X")

        self.feature_names = [self.target_col]
        self.is_fitted = True
        return self

    def predict(self, X: pd.DataFrame) -> ModelResult:
        """
        Generate forecasts

        Args:
            X: DataFrame with datetime index for forecast periods
               or DataFrame with 'periods' column indicating number of periods
        """
        if not self.is_fitted or self.history is None:
            raise ValueError("Model not fitted")

        # Determine number of periods to forecast
        if "periods" in X.columns:
            n_periods = int(X["periods"].iloc[0])
        else:
            n_periods = len(X)

        # Generate forecasts
        predictions = []
        history = self.history.copy()

        for _ in range(n_periods):
            # Calculate moving average
            if self.weighted:
                weights = np.arange(1, self.window + 1)
                forecast = np.average(history.tail(self.window), weights=weights)
            else:
                forecast = history.tail(self.window).mean()

            predictions.append(forecast)
            # Add forecast to history for multi-step
            history = pd.concat([history, pd.Series([forecast])])

        # Calculate confidence interval (simple approach)
        std = self.history.tail(self.window * 3).std()
        lower = np.array(predictions) - 1.96 * std
        upper = np.array(predictions) + 1.96 * std

        return ModelResult(
            predictions=np.array(predictions),
            probabilities=None,
            confidence=0.95,  # 95% confidence interval
            details={
                "window": self.window,
                "weighted": self.weighted,
                "lower_bound": lower.tolist(),
                "upper_bound": upper.tolist(),
            }
        )

    def evaluate(self, X: pd.DataFrame, y: pd.Series) -> ModelMetrics:
        """Evaluate forecast accuracy"""
        result = self.predict(X)
        predictions = result.predictions[:len(y)]
        actuals = y.values[:len(predictions)]

        # Calculate metrics
        mae = float(np.abs(predictions - actuals).mean())
        rmse = float(np.sqrt(((predictions - actuals) ** 2).mean()))

        # MAPE (avoid division by zero)
        mask = actuals != 0
        if mask.sum() > 0:
            mape = float(np.abs((predictions[mask] - actuals[mask]) / actuals[mask]).mean() * 100)
        else:
            mape = float("inf")

        return ModelMetrics(
            mae=mae,
            rmse=rmse,
            mape=mape,
        )


class ExponentialSmoothingForecaster(BaseModel):
    """Exponential Smoothing time series forecasting"""

    def __init__(
        self,
        alpha: float = 0.3,
        trend: bool = False,
        seasonal: bool = False,
        seasonal_periods: int = 7,
    ):
        super().__init__(name="ExponentialSmoothingForecaster", version="1.0.0")
        self.alpha = alpha
        self.trend = trend
        self.seasonal = seasonal
        self.seasonal_periods = seasonal_periods
        self.level: Optional[float] = None
        self.trend_value: Optional[float] = None
        self.seasonals: Optional[List[float]] = None
        self.history: Optional[pd.Series] = None

    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> "ExponentialSmoothingForecaster":
        """Fit exponential smoothing model"""
        if y is not None:
            self.history = y.copy()
        elif len(X.columns) == 1:
            self.history = X.iloc[:, 0].copy()
        else:
            raise ValueError("Must provide y or single-column X")

        values = self.history.values

        # Initialize level
        self.level = values[0]

        # Initialize trend if needed
        if self.trend and len(values) > 1:
            self.trend_value = values[1] - values[0]

        # Initialize seasonals if needed
        if self.seasonal and len(values) >= self.seasonal_periods:
            self.seasonals = values[:self.seasonal_periods].tolist()

        # Fit the model
        for t in range(1, len(values)):
            self._update(values[t], t)

        self.is_fitted = True
        return self

    def _update(self, value: float, t: int) -> None:
        """Update model state with new observation"""
        if self.seasonal:
            seasonal_idx = t % self.seasonal_periods
            seasonal = self.seasonals[seasonal_idx] if self.seasonals else 0
        else:
            seasonal = 0

        if self.trend:
            old_level = self.level
            self.level = self.alpha * (value - seasonal) + (1 - self.alpha) * (self.level + self.trend_value)
            self.trend_value = 0.1 * (self.level - old_level) + 0.9 * self.trend_value
        else:
            self.level = self.alpha * (value - seasonal) + (1 - self.alpha) * self.level

        if self.seasonal and self.seasonals:
            self.seasonals[t % self.seasonal_periods] = 0.1 * (value - self.level) + 0.9 * seasonal

    def predict(self, X: pd.DataFrame) -> ModelResult:
        """Generate forecasts"""
        if not self.is_fitted:
            raise ValueError("Model not fitted")

        if "periods" in X.columns:
            n_periods = int(X["periods"].iloc[0])
        else:
            n_periods = len(X)

        predictions = []
        for h in range(n_periods):
            forecast = self.level
            if self.trend and self.trend_value:
                forecast += (h + 1) * self.trend_value
            if self.seasonal and self.seasonals:
                forecast += self.seasonals[(len(self.history) + h) % self.seasonal_periods]
            predictions.append(forecast)

        return ModelResult(
            predictions=np.array(predictions),
            probabilities=None,
            confidence=0.95,
            details={
                "alpha": self.alpha,
                "trend": self.trend,
                "seasonal": self.seasonal,
            }
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
