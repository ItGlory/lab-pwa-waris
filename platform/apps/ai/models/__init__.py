"""
WARIS AI Shadowing Models
TOR Reference: Section 4.5.1

4 AI Models:
1. Anomaly Detection - ตรวจจับความผิดปกติ
2. Pattern Recognition - จดจำรูปแบบ
3. Classification - แยกแยะประเภทน้ำสูญเสีย
4. Time Series Forecasting - พยากรณ์แนวโน้ม
"""

from .base import BaseModel, ModelResult, ModelMetrics
from .anomaly import AnomalyDetector
from .pattern import PatternRecognizer
from .classification import WaterLossClassifier
from .timeseries import TimeSeriesForecaster

__all__ = [
    "BaseModel",
    "ModelResult",
    "ModelMetrics",
    "AnomalyDetector",
    "PatternRecognizer",
    "WaterLossClassifier",
    "TimeSeriesForecaster",
]
