# AI/ML System Overview

## Introduction

WARIS incorporates advanced AI/ML capabilities for water loss analysis, predictions, and intelligent assistance per TOR requirements.

## AI Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         WARIS AI PLATFORM                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    AI SHADOWING (TOR 4.5.1)                        │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐     │  │
│  │  │    Leak    │ │   Demand   │ │  Pressure  │ │    Pipe    │     │  │
│  │  │ Detection  │ │  Forecast  │ │  Anomaly   │ │  Failure   │     │  │
│  │  │   Model    │ │   Model    │ │   Model    │ │   Model    │     │  │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      LLM SERVICE (TOR 4.5.2)                       │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │               LLM 70B+ (Thai Language Native)               │  │  │
│  │  │                                                             │  │  │
│  │  │  • Question Answering    • Report Generation               │  │  │
│  │  │  • Data Summarization    • Insight Extraction              │  │  │
│  │  │  • Natural Language Query                                  │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                        RAG ENGINE                                  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │  │
│  │  │  Document   │  │   Vector    │  │  Context    │               │  │
│  │  │  Processor  │  │   Search    │  │  Builder    │               │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    AI GUARDRAILS (TOR 4.5.6)                       │  │
│  │  • Content Filtering    • Hallucination Detection                 │  │
│  │  • Bias Monitoring      • Output Validation                       │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## TOR Compliance Matrix

| TOR Section | Requirement | Implementation |
|-------------|-------------|----------------|
| 4.5.1 | AI Shadowing (4 models) | See [Models](./models.md) |
| 4.5.2 | LLM 70B+ Thai Language | See [LLM](./llm.md) |
| 4.5.5 | ISO/IEC 42001 | AI Management System |
| 4.5.6 | AI Guardrails | Content filtering, validation |

## AI Shadowing Models

### Model Overview

| Model | Purpose | Input | Output |
|-------|---------|-------|--------|
| **Leak Detection** | Detect potential leaks | Flow, pressure | Probability, location |
| **Demand Forecast** | Predict water demand | Historical data | 24h/7d/30d forecast |
| **Pressure Anomaly** | Detect pressure issues | Pressure readings | Anomaly score |
| **Pipe Failure** | Predict pipe failures | Asset data | Risk score |

### Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | PyTorch 2.x |
| Serving | TorchServe / Triton |
| Tracking | MLflow |
| Feature Store | Feast |
| Pipeline | Apache Airflow |

## LLM System

### Model Requirements

| Requirement | Specification |
|-------------|---------------|
| Model Size | 70B+ parameters |
| Language | Thai native support |
| Context Window | 8K+ tokens |
| Deployment | Local (On-premise) |
| Inference | Ollama / vLLM |

### Capabilities

1. **Question Answering**
   - Natural language queries about water loss
   - DMA-specific data retrieval
   - Historical trend analysis

2. **Report Generation**
   - Automated executive summaries
   - Data narrative generation
   - Insight extraction

3. **Data Analysis**
   - Pattern recognition
   - Anomaly explanation
   - Recommendation generation

## RAG System

### Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Document   │───>│   Chunking   │───>│  Embedding   │
│   Ingestion  │    │   & Split    │    │  Generation  │
└──────────────┘    └──────────────┘    └──────────────┘
                                               │
                                               ▼
                                        ┌──────────────┐
                                        │    Milvus    │
                                        │ Vector Store │
                                        └──────────────┘
                                               │
┌──────────────┐    ┌──────────────┐          │
│   Response   │<───│     LLM      │<─────────┤
│  Generation  │    │   + Context  │          │
└──────────────┘    └──────────────┘          │
                           ▲                   │
                           │            ┌──────────────┐
                           └────────────│   Retrieval  │
                                        │    Top-K     │
                                        └──────────────┘
```

### Document Types

| Type | Format | Update Frequency |
|------|--------|------------------|
| Manuals | PDF, DOCX | Monthly |
| Policies | PDF | Quarterly |
| Reports | PDF | Daily |
| Knowledge Base | Markdown | Weekly |

## AI Guardrails

### Content Filtering

```python
GUARDRAIL_CONFIG = {
    "content_filter": {
        "enabled": True,
        "categories": ["harmful", "inappropriate", "off_topic"]
    },
    "output_validation": {
        "max_length": 2000,
        "require_citation": True,
        "fact_check": True
    },
    "hallucination_detection": {
        "enabled": True,
        "threshold": 0.8
    }
}
```

### ISO/IEC 42001 Compliance

| Control | Implementation |
|---------|----------------|
| AI Risk Assessment | Documented risk matrix |
| Data Governance | Data lineage tracking |
| Model Governance | Version control, audit trail |
| Monitoring | Performance metrics, drift detection |
| Transparency | Explainability, decision logging |

## Infrastructure

### GPU Requirements

| Model | GPU Memory | Recommended GPU |
|-------|------------|-----------------|
| Leak Detection | 4 GB | RTX 3090 |
| Demand Forecast | 4 GB | RTX 3090 |
| Pressure Anomaly | 4 GB | RTX 3090 |
| Pipe Failure | 4 GB | RTX 3090 |
| LLM 70B | 80 GB | A100 80GB / H100 |
| Embeddings | 4 GB | RTX 3090 |

### Deployment

```yaml
# AI Service Deployment
services:
  ai-shadowing:
    replicas: 2
    resources:
      gpu: 1
      memory: 16Gi

  llm-service:
    replicas: 1
    resources:
      gpu: 2  # For 70B model
      memory: 160Gi

  embedding-service:
    replicas: 2
    resources:
      gpu: 1
      memory: 8Gi
```

## Monitoring

### Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Inference Latency | Response time | < 200ms (Shadowing), < 5s (LLM) |
| Throughput | Requests/sec | > 100 (Shadowing), > 10 (LLM) |
| Accuracy | Model accuracy | > 90% |
| Availability | Uptime | > 99.9% |

### Drift Detection

```python
DRIFT_CONFIG = {
    "feature_drift": {
        "method": "PSI",  # Population Stability Index
        "threshold": 0.2
    },
    "prediction_drift": {
        "method": "KS",  # Kolmogorov-Smirnov
        "threshold": 0.1
    },
    "check_interval": "daily"
}
```

## Related Documents

- [AI Models](./models.md)
- [LLM Service](./llm.md)
- [RAG Engine](./rag.md)
- [Training Pipeline](./training.md)
