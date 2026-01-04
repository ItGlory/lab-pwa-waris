# Database Architecture Overview
# ภาพรวมสถาปัตยกรรมฐานข้อมูล

## Database Strategy

WARIS uses a polyglot persistence approach with multiple database types optimized for specific use cases.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   PostgreSQL    │  │    MongoDB      │  │    Milvus       │             │
│  │   (Primary)     │  │   (Documents)   │  │   (Vectors)     │             │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤             │
│  │ • Water loss    │  │ • Reports       │  │ • Embeddings    │             │
│  │ • DMA data      │  │ • Logs          │  │ • Documents     │             │
│  │ • Users         │  │ • Chat history  │  │ • Q&A pairs     │             │
│  │ • Alerts        │  │ • Audit trail   │  │                 │             │
│  │ • Time-series   │  │ • Files metadata│  │                 │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│           │                    │                    │                       │
│           └────────────────────┴────────────────────┘                       │
│                                │                                            │
│                      ┌─────────▼─────────┐                                  │
│                      │      Redis        │                                  │
│                      │     (Cache)       │                                  │
│                      ├───────────────────┤                                  │
│                      │ • Session data    │                                  │
│                      │ • Query cache     │                                  │
│                      │ • Rate limiting   │                                  │
│                      │ • Real-time data  │                                  │
│                      └───────────────────┘                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Selection Rationale

| Database | Use Case | Rationale |
|----------|----------|-----------|
| **PostgreSQL** | Structured data, transactions | ACID compliance, time-series extensions, mature ecosystem |
| **MongoDB** | Documents, flexible schema | JSON storage, horizontal scaling, document queries |
| **Milvus** | Vector storage, similarity search | High-performance embeddings, semantic search |
| **Redis** | Cache, sessions | In-memory speed, pub/sub, data structures |

---

## PostgreSQL Schema

### Core Tables

```sql
-- DMA (District Metering Area)
CREATE TABLE dma (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_th VARCHAR(255) NOT NULL,
    region_id UUID REFERENCES regions(id),
    branch_id UUID REFERENCES branches(id),
    geometry GEOMETRY(POLYGON, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Water Loss Readings
CREATE TABLE water_loss_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dma_id UUID REFERENCES dma(id),
    reading_time TIMESTAMP NOT NULL,
    inflow DECIMAL(12,3),
    outflow DECIMAL(12,3),
    loss_volume DECIMAL(12,3),
    loss_percentage DECIMAL(5,2),
    pressure_in DECIMAL(6,2),
    pressure_out DECIMAL(6,2),
    source VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create hypertable for time-series
SELECT create_hypertable('water_loss_readings', 'reading_time');

-- Alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dma_id UUID REFERENCES dma(id),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    title_th VARCHAR(255),
    description TEXT,
    description_th TEXT,
    status VARCHAR(20) DEFAULT 'active',
    triggered_at TIMESTAMP NOT NULL,
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    first_name_th VARCHAR(100),
    last_name_th VARCHAR(100),
    role VARCHAR(50) NOT NULL,
    region_id UUID REFERENCES regions(id),
    branch_id UUID REFERENCES branches(id),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Model Predictions
CREATE TABLE ai_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dma_id UUID REFERENCES dma(id),
    model_type VARCHAR(50) NOT NULL,
    model_version VARCHAR(20),
    prediction_time TIMESTAMP NOT NULL,
    input_data JSONB,
    prediction JSONB NOT NULL,
    confidence DECIMAL(5,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT create_hypertable('ai_predictions', 'prediction_time');
```

### Indexes

```sql
-- Water loss readings
CREATE INDEX idx_water_loss_dma_time ON water_loss_readings(dma_id, reading_time DESC);
CREATE INDEX idx_water_loss_time ON water_loss_readings(reading_time DESC);

-- Alerts
CREATE INDEX idx_alerts_dma ON alerts(dma_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_triggered ON alerts(triggered_at DESC);

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_region ON users(region_id);

-- AI Predictions
CREATE INDEX idx_predictions_dma_type ON ai_predictions(dma_id, model_type);
```

---

## MongoDB Collections

### Reports Collection
```javascript
{
  _id: ObjectId,
  report_type: "daily" | "weekly" | "monthly" | "executive",
  title: String,
  title_th: String,
  dma_id: UUID,
  date_range: {
    start: ISODate,
    end: ISODate
  },
  content: {
    summary: String,
    summary_th: String,
    metrics: Object,
    charts: [Object],
    recommendations: [String]
  },
  generated_by: UUID,
  generated_at: ISODate,
  file_path: String,
  metadata: Object
}
```

### Chat History Collection
```javascript
{
  _id: ObjectId,
  session_id: UUID,
  user_id: UUID,
  messages: [{
    role: "user" | "assistant" | "system",
    content: String,
    timestamp: ISODate,
    metadata: {
      sources: [String],
      confidence: Number
    }
  }],
  created_at: ISODate,
  updated_at: ISODate,
  expires_at: ISODate  // 30-day retention
}
```

### Audit Logs Collection
```javascript
{
  _id: ObjectId,
  action: String,
  resource_type: String,
  resource_id: UUID,
  user_id: UUID,
  ip_address: String,
  user_agent: String,
  details: Object,
  timestamp: ISODate
}
```

---

## Milvus Collections

### Document Embeddings
```python
collection_schema = {
    "name": "document_embeddings",
    "fields": [
        {"name": "id", "type": DataType.VARCHAR, "max_length": 36, "is_primary": True},
        {"name": "embedding", "type": DataType.FLOAT_VECTOR, "dim": 1536},
        {"name": "document_type", "type": DataType.VARCHAR, "max_length": 50},
        {"name": "source", "type": DataType.VARCHAR, "max_length": 255},
        {"name": "content_preview", "type": DataType.VARCHAR, "max_length": 500},
        {"name": "created_at", "type": DataType.INT64}
    ],
    "index": {
        "field_name": "embedding",
        "index_type": "IVF_FLAT",
        "metric_type": "COSINE",
        "params": {"nlist": 1024}
    }
}
```

### Q&A Pairs
```python
collection_schema = {
    "name": "qa_embeddings",
    "fields": [
        {"name": "id", "type": DataType.VARCHAR, "max_length": 36, "is_primary": True},
        {"name": "question_embedding", "type": DataType.FLOAT_VECTOR, "dim": 1536},
        {"name": "question", "type": DataType.VARCHAR, "max_length": 1000},
        {"name": "answer", "type": DataType.VARCHAR, "max_length": 5000},
        {"name": "category", "type": DataType.VARCHAR, "max_length": 100},
        {"name": "created_at", "type": DataType.INT64}
    ]
}
```

---

## Redis Data Structures

```yaml
# Session Storage
session:{user_id}:
  type: hash
  fields:
    - token
    - expires_at
    - permissions
  ttl: 24 hours

# Rate Limiting
ratelimit:{user_id}:{endpoint}:
  type: string (counter)
  ttl: 1 minute

# Query Cache
cache:query:{hash}:
  type: string (JSON)
  ttl: 5 minutes

# Real-time Alerts
alerts:active:
  type: sorted set
  score: timestamp
  member: alert_id

# Pub/Sub Channels
channel:alerts:{region_id}
channel:notifications:{user_id}
```

---

## Data Retention Policies

| Data Type | Retention | Archive |
|-----------|-----------|---------|
| Water loss readings | 2 years | Cold storage |
| Alerts | 60 days (active) | 1 year (archive) |
| Chat history | 30 days | Delete |
| Audit logs | 1 year | 3 years (archive) |
| Reports | 2 years | Cold storage |
| AI predictions | 1 year | Cold storage |

---

## Backup Strategy

### PostgreSQL
```yaml
Full Backup:
  Frequency: Weekly (Sunday 2:00 AM)
  Method: pg_dump
  Retention: 4 weeks

Incremental Backup:
  Frequency: Daily (2:00 AM)
  Method: WAL archiving
  Retention: 7 days

Point-in-time Recovery: Yes
```

### MongoDB
```yaml
Full Backup:
  Frequency: Daily (3:00 AM)
  Method: mongodump
  Retention: 7 days
```

### Milvus
```yaml
Backup:
  Frequency: Daily (4:00 AM)
  Method: Milvus backup utility
  Retention: 14 days
```

---

## Security

### Access Control
- Role-based access (RBAC)
- Row-level security (PostgreSQL)
- Field-level encryption for sensitive data

### Encryption
- At rest: AES-256
- In transit: TLS 1.3
- Keys managed by HashiCorp Vault

### Audit
- All queries logged
- Change data capture (CDC)
- Compliance reporting
