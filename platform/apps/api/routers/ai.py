"""
AI API Router
Provides endpoints for AI model inference
TOR Reference: Section 4.5.1
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
import logging

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/ai", tags=["AI"])


# Request/Response Models
class ReadingInput(BaseModel):
    flow_in: float = Field(..., description="Inflow volume (m³)")
    flow_out: float = Field(..., description="Outflow volume (m³)")
    pressure: Optional[float] = Field(3.0, description="Pressure (bar)")
    loss_percentage: Optional[float] = None
    hour: Optional[int] = Field(12, description="Hour of day (0-23)")
    day_of_week: Optional[int] = Field(0, description="Day of week (0-6)")


class AnomalyResponse(BaseModel):
    is_anomaly: bool
    probability: Optional[float]
    confidence: float
    details: Dict[str, Any]
    message: str
    message_th: str


class ClassificationResponse(BaseModel):
    loss_type: str
    loss_type_th: str
    probability: Optional[float]
    confidence: float
    feature_importance: Dict[str, float]


class ForecastResponse(BaseModel):
    dates: List[str]
    predictions: List[float]
    lower_bound: List[float]
    upper_bound: List[float]
    confidence: float


class AIStatusResponse(BaseModel):
    status: str
    models_loaded: List[str]
    last_training: Optional[str]
    version: str


class AnalysisResponse(BaseModel):
    dma_id: str
    analysis_timestamp: str
    anomalies: List[Dict]
    patterns: Dict
    forecast: Dict
    classification: Dict
    recommendations: List[Dict]


# Mock AI Service (in production, use actual AI models)
class MockAIService:
    """Mock AI service for demo purposes"""

    def detect_anomaly(self, reading: Dict) -> Dict:
        # Calculate loss percentage if not provided
        loss_pct = reading.get("loss_percentage")
        if loss_pct is None:
            flow_in = reading.get("flow_in", 0)
            flow_out = reading.get("flow_out", 0)
            loss_pct = ((flow_in - flow_out) / flow_in * 100) if flow_in > 0 else 0

        is_anomaly = loss_pct > 20 or reading.get("pressure", 3.0) < 2.5

        return {
            "is_anomaly": is_anomaly,
            "probability": min(loss_pct / 30, 1.0) if is_anomaly else 0.1,
            "confidence": 0.85,
            "details": {
                "loss_percentage": loss_pct,
                "pressure": reading.get("pressure", 3.0),
            }
        }

    def classify_loss(self, reading: Dict) -> Dict:
        # Simple rule-based classification for demo
        loss_pct = reading.get("loss_percentage")
        if loss_pct is None:
            flow_in = reading.get("flow_in", 0)
            flow_out = reading.get("flow_out", 0)
            loss_pct = ((flow_in - flow_out) / flow_in * 100) if flow_in > 0 else 0

        pressure = reading.get("pressure", 3.0)

        # High loss + low pressure = physical loss
        # High loss + normal pressure = commercial loss
        if loss_pct > 15 and pressure < 2.8:
            loss_type = "physical"
            loss_type_th = "น้ำสูญเสียทางกายภาพ"
        else:
            loss_type = "commercial"
            loss_type_th = "น้ำสูญเสียเชิงพาณิชย์"

        return {
            "loss_type": loss_type,
            "loss_type_th": loss_type_th,
            "probability": 0.78,
            "confidence": 0.82,
            "feature_importance": {
                "loss_percentage": 0.35,
                "pressure": 0.25,
                "flow_in": 0.20,
                "hour": 0.12,
                "flow_out": 0.08,
            }
        }

    def forecast(self, days: int) -> Dict:
        import random
        base_loss = 150
        predictions = [base_loss + random.uniform(-20, 30) + i * 2 for i in range(days)]

        from datetime import datetime, timedelta
        start_date = datetime.now() + timedelta(days=1)
        dates = [(start_date + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days)]

        return {
            "dates": dates,
            "predictions": predictions,
            "lower_bound": [p - 30 for p in predictions],
            "upper_bound": [p + 30 for p in predictions],
            "confidence": 0.95,
        }

    def analyze_dma(self, dma_id: str) -> Dict:
        anomaly = self.detect_anomaly({"flow_in": 1000, "flow_out": 850, "pressure": 3.2})
        classification = self.classify_loss({"flow_in": 1000, "flow_out": 850, "pressure": 3.2})
        forecast = self.forecast(7)

        return {
            "dma_id": dma_id,
            "analysis_timestamp": datetime.now().isoformat(),
            "anomalies": [anomaly],
            "patterns": {
                "dominant_pattern": "high_usage",
                "dominant_pattern_th": "การใช้น้ำสูง",
                "confidence": 0.75,
            },
            "forecast": forecast,
            "classification": classification,
            "recommendations": [
                {
                    "type": "monitoring",
                    "priority": "medium",
                    "message": "ควรตรวจสอบเพิ่มเติม",
                    "message_en": "Further monitoring recommended",
                    "action": "ติดตามค่าน้ำสูญเสียอย่างใกล้ชิด",
                }
            ],
        }


# Create mock service instance
ai_service = MockAIService()


@router.get("/status", response_model=AIStatusResponse)
async def get_ai_status():
    """Get AI service status"""
    return AIStatusResponse(
        status="operational",
        models_loaded=["anomaly_detection", "pattern_recognition", "classification", "timeseries"],
        last_training="2026-01-15T02:00:00Z",
        version="1.0.0",
    )


@router.post("/anomaly/detect", response_model=AnomalyResponse)
async def detect_anomaly(reading: ReadingInput):
    """
    Detect anomaly in DMA reading

    Analyzes flow and pressure data to identify potential anomalies
    such as leaks, meter failures, or unusual consumption patterns.
    """
    try:
        reading_dict = reading.model_dump()
        if reading_dict.get("loss_percentage") is None:
            flow_in = reading_dict["flow_in"]
            flow_out = reading_dict["flow_out"]
            reading_dict["loss_percentage"] = ((flow_in - flow_out) / flow_in * 100) if flow_in > 0 else 0

        result = ai_service.detect_anomaly(reading_dict)

        return AnomalyResponse(
            is_anomaly=result["is_anomaly"],
            probability=result["probability"],
            confidence=result["confidence"],
            details=result["details"],
            message="Anomaly detected" if result["is_anomaly"] else "No anomaly detected",
            message_th="ตรวจพบความผิดปกติ" if result["is_anomaly"] else "ไม่พบความผิดปกติ",
        )
    except Exception as e:
        logger.error(f"Anomaly detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/classify", response_model=ClassificationResponse)
async def classify_loss(reading: ReadingInput):
    """
    Classify water loss type

    Determines whether water loss is physical (leaks, pipe damage)
    or commercial (meter errors, theft, unbilled consumption).
    """
    try:
        reading_dict = reading.model_dump()
        if reading_dict.get("loss_percentage") is None:
            flow_in = reading_dict["flow_in"]
            flow_out = reading_dict["flow_out"]
            reading_dict["loss_percentage"] = ((flow_in - flow_out) / flow_in * 100) if flow_in > 0 else 0

        result = ai_service.classify_loss(reading_dict)

        return ClassificationResponse(
            loss_type=result["loss_type"],
            loss_type_th=result["loss_type_th"],
            probability=result["probability"],
            confidence=result["confidence"],
            feature_importance=result["feature_importance"],
        )
    except Exception as e:
        logger.error(f"Classification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/forecast", response_model=ForecastResponse)
async def get_forecast(days: int = Query(7, ge=1, le=30, description="Number of days to forecast")):
    """
    Forecast water loss for future days

    Uses time series analysis to predict water loss trends.
    """
    try:
        result = ai_service.forecast(days)

        return ForecastResponse(
            dates=result["dates"],
            predictions=result["predictions"],
            lower_bound=result["lower_bound"],
            upper_bound=result["upper_bound"],
            confidence=result["confidence"],
        )
    except Exception as e:
        logger.error(f"Forecast error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analyze/{dma_id}", response_model=AnalysisResponse)
async def analyze_dma(dma_id: str):
    """
    Comprehensive AI analysis for a DMA

    Combines anomaly detection, pattern recognition, classification,
    and forecasting to provide a complete analysis of water loss
    for a specific DMA.
    """
    try:
        result = ai_service.analyze_dma(dma_id)

        return AnalysisResponse(
            dma_id=result["dma_id"],
            analysis_timestamp=result["analysis_timestamp"],
            anomalies=result["anomalies"],
            patterns=result["patterns"],
            forecast=result["forecast"],
            classification=result["classification"],
            recommendations=result["recommendations"],
        )
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/patterns/{dma_id}")
async def get_patterns(dma_id: str):
    """Get recognized patterns for a DMA"""
    return {
        "success": True,
        "dma_id": dma_id,
        "data": {
            "patterns": [
                {
                    "id": "high_usage",
                    "label": "high_usage",
                    "label_th": "การใช้น้ำสูง",
                    "percentage": 35.2,
                    "count": 352,
                },
                {
                    "id": "peak_hours",
                    "label": "peak_hours",
                    "label_th": "ชั่วโมงเร่งด่วน",
                    "percentage": 28.5,
                    "count": 285,
                },
                {
                    "id": "low_usage",
                    "label": "low_usage",
                    "label_th": "การใช้น้ำต่ำ",
                    "percentage": 20.3,
                    "count": 203,
                },
                {
                    "id": "weekend",
                    "label": "weekend",
                    "label_th": "วันหยุดสุดสัปดาห์",
                    "percentage": 16.0,
                    "count": 160,
                },
            ],
            "total_readings": 1000,
        },
        "message": "Success",
        "message_th": "สำเร็จ",
    }


@router.get("/models")
async def list_models():
    """List all available AI models"""
    return {
        "success": True,
        "data": [
            {
                "id": "anomaly_detection",
                "name": "Anomaly Detection",
                "name_th": "ตรวจจับความผิดปกติ",
                "version": "1.0.0",
                "status": "active",
                "last_trained": "2026-01-15T02:00:00Z",
                "metrics": {
                    "f1_score": 0.87,
                    "precision": 0.85,
                    "recall": 0.89,
                },
            },
            {
                "id": "pattern_recognition",
                "name": "Pattern Recognition",
                "name_th": "จดจำรูปแบบ",
                "version": "1.0.0",
                "status": "active",
                "last_trained": "2026-01-15T02:00:00Z",
                "metrics": {
                    "silhouette_score": 0.72,
                    "accuracy": 0.81,
                },
            },
            {
                "id": "classification",
                "name": "Water Loss Classification",
                "name_th": "แยกแยะประเภทน้ำสูญเสีย",
                "version": "1.0.0",
                "status": "active",
                "last_trained": "2026-01-15T02:00:00Z",
                "metrics": {
                    "accuracy": 0.84,
                    "auc_roc": 0.89,
                },
            },
            {
                "id": "timeseries",
                "name": "Time Series Forecasting",
                "name_th": "พยากรณ์แนวโน้ม",
                "version": "1.0.0",
                "status": "active",
                "last_trained": "2026-01-15T02:00:00Z",
                "metrics": {
                    "mape": 12.5,
                    "rmse": 25.3,
                },
            },
        ],
        "message": "Success",
        "message_th": "สำเร็จ",
    }
