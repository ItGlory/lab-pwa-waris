# Data Flow Architecture

## Overview

This document describes how data flows through the WARIS platform from external sources to end-user interfaces.

## Data Sources

```
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL DATA SOURCES                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   DMAMA     │  │  SCADA      │  │    GIS      │             │
│  │   System    │  │  Systems    │  │   Data      │             │
│  │ (DMA Data)  │  │ (Real-time) │  │  (Maps)     │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                      │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐             │
│  │  Meter      │  │  Billing    │  │  Weather    │             │
│  │  Readings   │  │  System     │  │   API       │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                      │
└─────────┴────────────────┴────────────────┴──────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │    ETL PIPELINE        │
              │    (Data Ingestion)    │
              └────────────────────────┘
```

## ETL Pipeline

### Data Ingestion Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        ETL PIPELINE                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  EXTRACT              TRANSFORM              LOAD                 │
│  ┌─────────┐         ┌─────────┐          ┌─────────┐           │
│  │  APIs   │────────>│  Clean  │─────────>│PostgreSQL│           │
│  │  Files  │         │ Validate│          │ MongoDB  │           │
│  │  SFTP   │         │ Enrich  │          │ Milvus   │           │
│  └─────────┘         └─────────┘          └─────────┘           │
│       │                   │                    │                  │
│       ▼                   ▼                    ▼                  │
│  ┌─────────┐         ┌─────────┐          ┌─────────┐           │
│  │ Staging │         │ Quality │          │ Data    │           │
│  │  Area   │         │  Check  │          │ Catalog │           │
│  └─────────┘         └─────────┘          └─────────┘           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Pipeline Schedule

| Pipeline | Source | Frequency | Duration |
|----------|--------|-----------|----------|
| DMA Sync | DMAMA API | Every 15 min | ~2 min |
| Meter Reading | SCADA | Every 5 min | ~1 min |
| Billing Sync | Billing DB | Daily 2:00 | ~30 min |
| GIS Update | GIS Server | Weekly | ~1 hour |
| Weather | Weather API | Every hour | ~30 sec |

### Data Quality Rules

```python
# Example validation rules
VALIDATION_RULES = {
    "flow_rate": {
        "min": 0,
        "max": 10000,  # m³/h
        "null_allowed": False
    },
    "pressure": {
        "min": 0,
        "max": 100,  # bar
        "null_allowed": False
    },
    "meter_reading": {
        "increasing": True,  # Must be monotonically increasing
        "null_allowed": True
    }
}
```

## Real-Time Data Flow

### Sensor to Dashboard

```
┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
│ Sensor │───>│ SCADA  │───>│  API   │───>│ Redis  │───>│  Web   │
│        │    │        │    │        │    │ PubSub │    │ Socket │
└────────┘    └────────┘    └────────┘    └────────┘    └────────┘
    │              │              │              │              │
    │   Raw Data   │   Cleaned    │   Events     │   Updates    │
    │   (5 sec)    │   (5 sec)    │   (realtime) │   (realtime) │
```

### Event Processing

```python
# Event types
EVENT_TYPES = [
    "FLOW_READING",      # Regular flow measurement
    "PRESSURE_READING",  # Regular pressure measurement
    "LEAK_DETECTED",     # AI detected potential leak
    "ANOMALY_DETECTED",  # Pressure/flow anomaly
    "THRESHOLD_BREACH",  # Value exceeded threshold
    "METER_FAULT",       # Meter communication error
]
```

## AI/ML Data Flow

### Training Pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│                    AI TRAINING PIPELINE                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │
│  │Historical│───>│ Feature │───>│  Model  │───>│  Model  │      │
│  │  Data   │    │Engineer │    │Training │    │Registry │      │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘      │
│       │              │              │              │              │
│       │              ▼              ▼              ▼              │
│       │         ┌─────────┐   ┌─────────┐   ┌─────────┐        │
│       │         │ Feature │   │ MLflow  │   │ Model   │        │
│       │         │  Store  │   │Tracking │   │ Serving │        │
│       │         └─────────┘   └─────────┘   └─────────┘        │
│       │                                                          │
└───────┴──────────────────────────────────────────────────────────┘
```

### Inference Pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│                    AI INFERENCE PIPELINE                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Input           Processing          Output                       │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │
│  │  API    │───>│Preprocess│───>│  Model  │───>│ Result  │      │
│  │ Request │    │  Data   │    │Inference│    │  Store  │      │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘      │
│                      │              │              │              │
│                      ▼              ▼              ▼              │
│                 ┌─────────┐   ┌─────────┐   ┌─────────┐        │
│                 │ Feature │   │  GPU    │   │  Alert  │        │
│                 │ Extract │   │ Compute │   │ Trigger │        │
│                 └─────────┘   └─────────┘   └─────────┘        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## LLM/RAG Data Flow

### Document Ingestion

```
┌──────────────────────────────────────────────────────────────────┐
│                    RAG INGESTION PIPELINE                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │
│  │Documents│───>│  Parse  │───>│  Chunk  │───>│ Embed   │      │
│  │  (PDF,  │    │  Text   │    │  Text   │    │ (Model) │      │
│  │  DOCX)  │    │         │    │         │    │         │      │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘      │
│                                                    │              │
│                                                    ▼              │
│                                              ┌─────────┐        │
│                                              │ Milvus  │        │
│                                              │ (Vector)│        │
│                                              └─────────┘        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Query Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      RAG QUERY FLOW                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  User Query                                                       │
│      │                                                            │
│      ▼                                                            │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                      │
│  │  Embed  │───>│ Vector  │───>│Retrieve │                      │
│  │  Query  │    │ Search  │    │ Top-K   │                      │
│  └─────────┘    └─────────┘    └─────────┘                      │
│                                     │                             │
│                                     ▼                             │
│                               ┌─────────┐                        │
│                               │ Context │                        │
│                               │ Builder │                        │
│                               └────┬────┘                        │
│                                    │                              │
│                                    ▼                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                      │
│  │Response │<───│   LLM   │<───│ Prompt  │                      │
│  │         │    │  (70B+) │    │Template │                      │
│  └─────────┘    └─────────┘    └─────────┘                      │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Report Generation Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    REPORT GENERATION FLOW                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Trigger          Process            Output                       │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │
│  │Schedule │───>│  Query  │───>│Generate │───>│  Store  │      │
│  │   or    │    │  Data   │    │   PDF   │    │  Report │      │
│  │ Manual  │    │         │    │         │    │         │      │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘      │
│       │              │              │              │              │
│       │              ▼              ▼              ▼              │
│       │         ┌─────────┐   ┌─────────┐   ┌─────────┐        │
│       │         │Aggregate│   │ Charts  │   │  Email  │        │
│       │         │  Stats  │   │ Images  │   │  Notify │        │
│       │         └─────────┘   └─────────┘   └─────────┘        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Data Retention Policy

| Data Type | Hot Storage | Warm Storage | Cold Storage | Archive |
|-----------|-------------|--------------|--------------|---------|
| Real-time readings | 7 days | 30 days | 1 year | 5 years |
| Daily aggregates | 30 days | 1 year | 5 years | Forever |
| Reports | 1 year | 5 years | Forever | - |
| Logs | 30 days | 90 days | 1 year | - |
| AI Model artifacts | Latest 5 | 1 year | - | - |

## Related Documents

- [System Overview](./overview.md)
- [Component Design](./components.md)
- [Database Schema](../database/overview.md)
