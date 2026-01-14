# AI Shadowing Models Plan

# แผนพัฒนาโมเดล AI Shadowing

**Created:** 2026-01-15
**Completed:** 2026-01-15
**Status:** Done
**TOR Reference:** Section 4.5.1

---

## Objective (วัตถุประสงค์)

พัฒนา 4 โมเดล AI Shadowing สำหรับวิเคราะห์ข้อมูลน้ำสูญเสีย ตาม TOR

---

## TOR Requirements (ข้อกำหนด)

1. ต้องเปรียบเทียบอย่างน้อย 2 วิธีการ
2. ต้องเปรียบเทียบกับ Baseline Model (Rule-based หรือ Statistical)
3. ต้องทดสอบกับ Test Dataset ที่ตกลงกัน
4. ต้องรายงาน Performance Metrics

---

## 4 AI Shadowing Models

### 1. Anomaly Detection Model (ตรวจจับความผิดปกติ)

**Purpose:** ตรวจจับค่าผิดปกติของ flow, pressure, meter readings

| Approach | Algorithm | Description |
|----------|-----------|-------------|
| Baseline | Z-Score / IQR | Statistical outlier detection |
| Approach 1 | Isolation Forest | Tree-based anomaly detection |
| Approach 2 | LSTM Autoencoder | Deep learning sequence anomaly |

**Target Metrics:**
- F1-Score: ≥ 0.85
- Precision: ≥ 0.80
- Recall: ≥ 0.80

---

### 2. Pattern Recognition Model (จดจำรูปแบบ)

**Purpose:** จดจำรูปแบบการใช้น้ำ, ฤดูกาล, กลุ่มผู้ใช้

| Approach | Algorithm | Description |
|----------|-----------|-------------|
| Baseline | Rule-based patterns | Manual threshold rules |
| Approach 1 | K-Means + DBSCAN | Clustering algorithms |
| Approach 2 | CNN | Convolutional pattern recognition |

**Target Metrics:**
- Silhouette Score: ≥ 0.60
- Pattern Accuracy: ≥ 0.80

---

### 3. Classification Model (แยกแยะประเภท)

**Purpose:** แยกแยะประเภทน้ำสูญเสีย (Physical vs Commercial)

| Approach | Algorithm | Description |
|----------|-----------|-------------|
| Baseline | Decision Tree | Simple rule-based classification |
| Approach 1 | XGBoost | Gradient boosting |
| Approach 2 | Random Forest | Ensemble method |

**Target Metrics:**
- AUC-ROC: ≥ 0.85
- Accuracy: ≥ 0.80

---

### 4. Time Series Forecasting Model (พยากรณ์แนวโน้ม)

**Purpose:** พยากรณ์ปริมาณน้ำสูญเสียในอนาคต

| Approach | Algorithm | Description |
|----------|-----------|-------------|
| Baseline | Moving Average | Simple statistical forecast |
| Approach 1 | Prophet | Facebook's time series model |
| Approach 2 | LSTM | Deep learning sequence model |

**Target Metrics:**
- MAPE: ≤ 15%
- MAE: Minimize
- RMSE: Minimize

---

## Implementation Plan

### Phase 1: Model Architecture (Today)

```
platform/apps/ai/
├── models/
│   ├── __init__.py
│   ├── base.py                    # Base model class
│   ├── anomaly/
│   │   ├── __init__.py
│   │   ├── baseline.py            # Z-Score baseline
│   │   ├── isolation_forest.py    # Approach 1
│   │   └── lstm_autoencoder.py    # Approach 2
│   ├── pattern/
│   │   ├── __init__.py
│   │   ├── baseline.py            # Rule-based
│   │   ├── clustering.py          # K-Means + DBSCAN
│   │   └── cnn.py                 # CNN approach
│   ├── classification/
│   │   ├── __init__.py
│   │   ├── baseline.py            # Decision Tree
│   │   ├── xgboost.py             # XGBoost
│   │   └── random_forest.py       # Random Forest
│   └── timeseries/
│       ├── __init__.py
│       ├── baseline.py            # Moving Average
│       ├── prophet.py             # Prophet
│       └── lstm.py                # LSTM
├── inference/
│   ├── __init__.py
│   └── model_service.py           # Inference service
├── training/
│   ├── __init__.py
│   └── trainer.py                 # Training pipeline
└── evaluation/
    ├── __init__.py
    └── metrics.py                 # Evaluation metrics
```

### Phase 2: API Integration

```
platform/apps/api/
├── routers/
│   └── ai.py                      # AI inference endpoints
└── services/
    └── ai_service.py              # AI service layer
```

### Phase 3: Frontend UI

```
platform/apps/web/
└── app/(dashboard)/
    └── ai-insights/
        └── page.tsx               # AI Insights dashboard
```

---

## Data Requirements

### Training Data

| Data Type | Source | Format |
|-----------|--------|--------|
| DMA Readings | PostgreSQL | Time series (flow_in, flow_out, pressure) |
| Alerts History | PostgreSQL | Labels for anomalies |
| Seasonal Data | PostgreSQL | Date features |
| Loss Classifications | Manual Labels | Physical/Commercial labels |

### Feature Engineering

```python
features = {
    # Time features
    "hour": "Hour of day (0-23)",
    "day_of_week": "Day of week (0-6)",
    "month": "Month (1-12)",
    "is_weekend": "Boolean",
    "is_holiday": "Boolean (Thai holidays)",

    # Flow features
    "flow_in": "Inflow volume (m³)",
    "flow_out": "Outflow volume (m³)",
    "loss_volume": "flow_in - flow_out",
    "loss_percentage": "loss_volume / flow_in * 100",

    # Statistical features
    "flow_in_rolling_mean": "7-day rolling average",
    "flow_in_rolling_std": "7-day rolling std",
    "loss_pct_rolling_mean": "7-day rolling average",

    # Lag features
    "flow_in_lag_1h": "Flow 1 hour ago",
    "flow_in_lag_24h": "Flow 24 hours ago",
    "flow_in_lag_7d": "Flow 7 days ago",
}
```

---

## Model Comparison Framework

```python
class ModelComparison:
    """Compare multiple approaches for each model type"""

    def compare(self, approaches: List[BaseModel], test_data: DataFrame):
        results = {}
        for approach in approaches:
            # Train
            approach.fit(train_data)

            # Predict
            predictions = approach.predict(test_data)

            # Evaluate
            metrics = approach.evaluate(test_data, predictions)
            results[approach.name] = metrics

        # Return comparison report
        return self._generate_report(results)
```

---

## Timeline

| Step | Duration | Status |
|------|----------|--------|
| Model Architecture | 2 hours | In Progress |
| Training Pipeline | 1 hour | Pending |
| Evaluation Framework | 1 hour | Pending |
| API Endpoints | 1 hour | Pending |
| Frontend UI | 2 hours | Pending |
| Testing | 1 hour | Pending |
| **Total** | **~8 hours** | |

---

## Dependencies

```
# AI/ML Libraries
scikit-learn>=1.4.0
xgboost>=2.0.0
prophet>=1.1.5
torch>=2.1.0
numpy>=1.26.0
pandas>=2.1.0

# MLOps
mlflow>=2.10.0
```
