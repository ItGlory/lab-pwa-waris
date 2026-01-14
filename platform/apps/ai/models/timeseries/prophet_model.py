"""
Prophet Time Series Forecasting
Facebook's Prophet model for time series with trend and seasonality
"""

from typing import Optional, Dict, Any
import numpy as np
import pandas as pd

from ..base import BaseModel, ModelResult, ModelMetrics


class ProphetForecaster(BaseModel):
    """Prophet time series forecasting"""

    def __init__(
        self,
        seasonality_mode: str = "additive",
        yearly_seasonality: bool = True,
        weekly_seasonality: bool = True,
        daily_seasonality: bool = False,
        changepoint_prior_scale: float = 0.05,
    ):
        super().__init__(name="ProphetForecaster", version="1.0.0")
        self.seasonality_mode = seasonality_mode
        self.yearly_seasonality = yearly_seasonality
        self.weekly_seasonality = weekly_seasonality
        self.daily_seasonality = daily_seasonality
        self.changepoint_prior_scale = changepoint_prior_scale
        self.model = None
        self._prophet_available = False

        # Check if Prophet is available
        try:
            from prophet import Prophet
            self._prophet_available = True
        except ImportError:
            self._prophet_available = False

    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> "ProphetForecaster":
        """
        Fit Prophet model

        Args:
            X: DataFrame with 'ds' (datetime) column
               or datetime index
            y: Series with values, or X must have 'y' column
        """
        # Prepare data in Prophet format (ds, y)
        df = self._prepare_data(X, y)

        if self._prophet_available:
            from prophet import Prophet

            self.model = Prophet(
                seasonality_mode=self.seasonality_mode,
                yearly_seasonality=self.yearly_seasonality,
                weekly_seasonality=self.weekly_seasonality,
                daily_seasonality=self.daily_seasonality,
                changepoint_prior_scale=self.changepoint_prior_scale,
            )
            self.model.fit(df)
        else:
            # Fallback to simple moving average if Prophet not available
            self._fallback_fit(df)

        self.is_fitted = True
        return self

    def _prepare_data(self, X: pd.DataFrame, y: Optional[pd.Series]) -> pd.DataFrame:
        """Prepare data in Prophet format"""
        if "ds" in X.columns and "y" in X.columns:
            return X[["ds", "y"]].copy()

        if y is not None:
            if isinstance(X.index, pd.DatetimeIndex):
                return pd.DataFrame({"ds": X.index, "y": y.values})
            elif "ds" in X.columns:
                return pd.DataFrame({"ds": X["ds"], "y": y.values})
            else:
                raise ValueError("X must have datetime index or 'ds' column")

        if isinstance(X.index, pd.DatetimeIndex):
            return pd.DataFrame({
                "ds": X.index,
                "y": X.iloc[:, 0].values
            })

        raise ValueError("Cannot prepare data for Prophet format")

    def _fallback_fit(self, df: pd.DataFrame) -> None:
        """Fallback fit using simple statistics when Prophet unavailable"""
        self._history = df.copy()
        self._mean = df["y"].mean()
        self._std = df["y"].std()

        # Calculate simple trend
        df["t"] = range(len(df))
        if len(df) > 1:
            from scipy import stats
            slope, intercept, _, _, _ = stats.linregress(df["t"], df["y"])
            self._slope = slope
            self._intercept = intercept
        else:
            self._slope = 0
            self._intercept = self._mean

    def predict(self, X: pd.DataFrame) -> ModelResult:
        """
        Generate forecasts

        Args:
            X: DataFrame with 'ds' column for dates to forecast
               or integer periods to forecast
        """
        if not self.is_fitted:
            raise ValueError("Model not fitted")

        # Prepare future dates
        if "periods" in X.columns:
            periods = int(X["periods"].iloc[0])
            if self._prophet_available:
                future = self.model.make_future_dataframe(periods=periods)
            else:
                last_date = self._history["ds"].iloc[-1]
                dates = pd.date_range(start=last_date, periods=periods + 1, freq="D")[1:]
                future = pd.DataFrame({"ds": dates})
        else:
            future = X[["ds"]].copy() if "ds" in X.columns else X.copy()

        if self._prophet_available:
            forecast = self.model.predict(future)

            predictions = forecast["yhat"].tail(len(future)).values
            lower = forecast["yhat_lower"].tail(len(future)).values
            upper = forecast["yhat_upper"].tail(len(future)).values

            details = {
                "dates": forecast["ds"].tail(len(future)).dt.strftime("%Y-%m-%d").tolist(),
                "lower_bound": lower.tolist(),
                "upper_bound": upper.tolist(),
                "trend": forecast["trend"].tail(len(future)).tolist(),
            }
        else:
            # Fallback predictions
            n = len(future)
            t_start = len(self._history)
            t_range = np.arange(t_start, t_start + n)

            predictions = self._intercept + self._slope * t_range
            lower = predictions - 1.96 * self._std
            upper = predictions + 1.96 * self._std

            details = {
                "dates": future["ds"].dt.strftime("%Y-%m-%d").tolist() if "ds" in future.columns else list(range(n)),
                "lower_bound": lower.tolist(),
                "upper_bound": upper.tolist(),
                "note": "Using fallback (Prophet not available)",
            }

        return ModelResult(
            predictions=predictions,
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

    def get_components(self) -> Dict[str, Any]:
        """Get forecast components (trend, seasonality)"""
        if not self.is_fitted or not self._prophet_available:
            return {}

        # Get component plots data
        future = self.model.make_future_dataframe(periods=0)
        forecast = self.model.predict(future)

        components = {
            "trend": forecast["trend"].tolist(),
            "dates": forecast["ds"].dt.strftime("%Y-%m-%d").tolist(),
        }

        if self.yearly_seasonality:
            components["yearly"] = forecast.get("yearly", pd.Series([0])).tolist()

        if self.weekly_seasonality:
            components["weekly"] = forecast.get("weekly", pd.Series([0])).tolist()

        return components
