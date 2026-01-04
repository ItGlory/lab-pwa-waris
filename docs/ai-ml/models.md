# AI Shadowing Models

## Overview

WARIS implements 4 AI Shadowing models as required by TOR 4.5.1 for predictive water loss analysis.

## Model 1: Leak Detection

### Purpose

Detect potential water leaks in the distribution network using flow and pressure patterns.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    LEAK DETECTION MODEL                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Input Features                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │    Flow     │  │  Pressure   │  │  Historical │             │
│  │   Series    │  │   Series    │  │   Pattern   │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          ▼                                       │
│                   ┌─────────────┐                               │
│                   │   LSTM +    │                               │
│                   │  Attention  │                               │
│                   └──────┬──────┘                               │
│                          │                                       │
│                          ▼                                       │
│                   ┌─────────────┐                               │
│                   │    Dense    │                               │
│                   │   Layers    │                               │
│                   └──────┬──────┘                               │
│                          │                                       │
│                          ▼                                       │
│  Output                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Leak Probability (0-1)  |  Location Score  |  Severity │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Input Features

| Feature | Type | Description |
|---------|------|-------------|
| `flow_rate` | float[] | Flow rate time series (m³/h) |
| `pressure` | float[] | Pressure time series (bar) |
| `night_flow` | float | Minimum night flow (m³/h) |
| `flow_variance` | float | Flow variance |
| `pressure_drop` | float | Pressure drop rate |
| `dma_age` | int | DMA infrastructure age (years) |
| `pipe_material` | category | Pipe material type |

### Output

```python
@dataclass
class LeakDetectionResult:
    leak_probability: float  # 0-1
    location_scores: Dict[str, float]  # Zone -> probability
    severity: str  # 'low', 'medium', 'high'
    confidence: float  # Model confidence
    recommended_action: str
```

### Training

| Parameter | Value |
|-----------|-------|
| Algorithm | LSTM + Attention |
| Sequence Length | 24 hours (288 points @ 5min) |
| Batch Size | 32 |
| Learning Rate | 0.001 |
| Epochs | 100 |
| Validation Split | 20% |

### Performance

| Metric | Value |
|--------|-------|
| Accuracy | 92% |
| Precision | 89% |
| Recall | 94% |
| F1 Score | 0.91 |
| AUC-ROC | 0.95 |

---

## Model 2: Demand Forecast

### Purpose

Predict water demand for different time horizons to optimize operations.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   DEMAND FORECAST MODEL                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Input Features                                                  │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐      │
│  │Historical │ │  Weather  │ │  Calendar │ │  Special  │      │
│  │  Demand   │ │   Data    │ │  Features │ │  Events   │      │
│  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘      │
│        │             │             │             │               │
│        └─────────────┴─────────────┴─────────────┘               │
│                            │                                      │
│                            ▼                                      │
│                   ┌─────────────┐                               │
│                   │  Temporal   │                               │
│                   │   Fusion    │                               │
│                   │ Transformer │                               │
│                   └──────┬──────┘                               │
│                          │                                       │
│                          ▼                                       │
│  Output                                                          │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  24h Forecast  |  7d Forecast  |  30d Forecast            │ │
│  │  (hourly)      |  (daily)      |  (daily)                 │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Input Features

| Feature | Type | Description |
|---------|------|-------------|
| `historical_demand` | float[] | Past demand (30 days) |
| `temperature` | float[] | Temperature forecast |
| `humidity` | float[] | Humidity forecast |
| `rainfall` | float[] | Rainfall forecast |
| `day_of_week` | int | 0-6 |
| `hour_of_day` | int | 0-23 |
| `is_holiday` | bool | Public holiday flag |
| `special_event` | category | Event type if any |

### Output

```python
@dataclass
class DemandForecastResult:
    forecast_24h: List[float]  # Hourly for 24 hours
    forecast_7d: List[float]   # Daily for 7 days
    forecast_30d: List[float]  # Daily for 30 days
    confidence_intervals: Dict[str, Tuple[float, float]]
    peak_demand: float
    peak_time: datetime
```

### Training

| Parameter | Value |
|-----------|-------|
| Algorithm | Temporal Fusion Transformer |
| History Length | 30 days |
| Forecast Horizons | 24h, 7d, 30d |
| Batch Size | 64 |
| Learning Rate | 0.0001 |

### Performance

| Metric | 24h | 7d | 30d |
|--------|-----|-----|-----|
| MAPE | 3.2% | 5.1% | 7.8% |
| RMSE | 12.5 | 28.3 | 45.2 |
| R² | 0.96 | 0.92 | 0.87 |

---

## Model 3: Pressure Anomaly

### Purpose

Detect anomalies in pressure patterns that may indicate system issues.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  PRESSURE ANOMALY MODEL                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Input                                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Pressure Time Series                        │   │
│  │              (Multi-point sensors)                       │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│                   ┌─────────────────┐                           │
│                   │   Variational   │                           │
│                   │   Autoencoder   │                           │
│                   │     (VAE)       │                           │
│                   └────────┬────────┘                           │
│                            │                                     │
│              ┌─────────────┼─────────────┐                      │
│              ▼             ▼             ▼                       │
│        ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│        │Reconstruc│ │  Latent  │ │ Anomaly  │                  │
│        │  Error   │ │  Score   │ │  Score   │                  │
│        └──────────┘ └──────────┘ └──────────┘                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Input Features

| Feature | Type | Description |
|---------|------|-------------|
| `pressure_series` | float[] | Pressure readings |
| `flow_context` | float[] | Concurrent flow |
| `sensor_location` | category | Sensor position |
| `time_features` | float[] | Time encodings |

### Output

```python
@dataclass
class PressureAnomalyResult:
    anomaly_score: float  # 0-1
    is_anomaly: bool
    anomaly_type: str  # 'sudden_drop', 'gradual_decline', 'spike'
    affected_zone: str
    start_time: datetime
    severity: str
```

### Training

| Parameter | Value |
|-----------|-------|
| Algorithm | Variational Autoencoder |
| Latent Dimension | 32 |
| Window Size | 60 minutes |
| Threshold | 95th percentile |

### Performance

| Metric | Value |
|--------|-------|
| Detection Rate | 95% |
| False Positive Rate | 3% |
| Mean Detection Time | 5 minutes |

---

## Model 4: Pipe Failure

### Purpose

Predict pipe failure risk based on asset characteristics and history.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PIPE FAILURE MODEL                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Input Features                                                  │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐      │
│  │   Asset   │ │  Failure  │ │Environment│ │Operational│      │
│  │   Data    │ │  History  │ │   Data    │ │   Data    │      │
│  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘      │
│        │             │             │             │               │
│        └─────────────┴─────────────┴─────────────┘               │
│                            │                                      │
│                            ▼                                      │
│                   ┌─────────────┐                               │
│                   │   Gradient  │                               │
│                   │   Boosting  │                               │
│                   │  (XGBoost)  │                               │
│                   └──────┬──────┘                               │
│                          │                                       │
│                          ▼                                       │
│  Output                                                          │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Failure Risk (0-1)  |  Time to Failure  |  Priority      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Input Features

| Feature | Type | Description |
|---------|------|-------------|
| `pipe_age` | int | Years since installation |
| `material` | category | PVC, PE, cast iron, etc. |
| `diameter` | float | Pipe diameter (mm) |
| `length` | float | Pipe length (m) |
| `soil_type` | category | Surrounding soil |
| `traffic_load` | category | Above-ground traffic |
| `failure_count` | int | Historical failures |
| `last_failure_days` | int | Days since last failure |
| `pressure_avg` | float | Average pressure |
| `pressure_variance` | float | Pressure variance |

### Output

```python
@dataclass
class PipeFailureResult:
    failure_risk: float  # 0-1
    estimated_ttf: int  # Days to failure
    risk_category: str  # 'low', 'medium', 'high', 'critical'
    contributing_factors: List[str]
    recommended_action: str
    priority_rank: int
```

### Training

| Parameter | Value |
|-----------|-------|
| Algorithm | XGBoost |
| Trees | 500 |
| Max Depth | 8 |
| Learning Rate | 0.05 |
| Class Weight | Balanced |

### Performance

| Metric | Value |
|--------|-------|
| AUC-ROC | 0.89 |
| Precision @10% | 78% |
| Recall @10% | 65% |

---

## Model Registry

### Versioning

```
models/
├── leak_detection/
│   ├── v1.0.0/
│   │   ├── model.pt
│   │   ├── config.yaml
│   │   └── metrics.json
│   └── v1.1.0/
├── demand_forecast/
│   └── v1.0.0/
├── pressure_anomaly/
│   └── v1.0.0/
└── pipe_failure/
    └── v1.0.0/
```

### Model Metadata

```yaml
# model_config.yaml
model:
  name: leak_detection
  version: 1.1.0
  framework: pytorch
  created_at: 2024-01-15
  trained_by: ml-team

training:
  dataset: leak_detection_v3
  samples: 150000
  epochs: 100
  final_loss: 0.023

performance:
  accuracy: 0.92
  precision: 0.89
  recall: 0.94
  f1: 0.91

deployment:
  min_gpu_memory: 4GB
  inference_time_ms: 50
  batch_size: 32
```

## Related Documents

- [AI Overview](./overview.md)
- [LLM Service](./llm.md)
- [Training Pipeline](./training.md)
