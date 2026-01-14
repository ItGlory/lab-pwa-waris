"""
Time Series Forecasting Models
TOR Reference: Section 4.5.1

Models:
1. Baseline: Moving Average
2. Approach 1: Prophet
3. Approach 2: LSTM

Purpose: พยากรณ์ปริมาณน้ำสูญเสียในอนาคต
"""

from .forecaster import TimeSeriesForecaster
from .baseline import MovingAverageForecaster
from .prophet_model import ProphetForecaster

__all__ = [
    "TimeSeriesForecaster",
    "MovingAverageForecaster",
    "ProphetForecaster",
]
