# Database Architecture

## Overview

WARIS uses a polyglot persistence approach with multiple databases optimized for different use cases.

## Database Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      WARIS DATA LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   PostgreSQL    │    │    MongoDB      │                    │
│  │   (Primary)     │    │   (Documents)   │                    │
│  │                 │    │                 │                    │
│  │ • Users         │    │ • Reports       │                    │
│  │ • DMAs          │    │ • Audit Logs    │                    │
│  │ • Readings      │    │ • Chat History  │                    │
│  │ • Alerts        │    │ • Notifications │                    │
│  │ • Configs       │    │                 │                    │
│  └─────────────────┘    └─────────────────┘                    │
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │     Milvus      │    │      Redis      │                    │
│  │   (Vectors)     │    │    (Cache)      │                    │
│  │                 │    │                 │                    │
│  │ • Embeddings    │    │ • Sessions      │                    │
│  │ • RAG Index     │    │ • Hot Data      │                    │
│  │                 │    │ • Rate Limits   │                    │
│  └─────────────────┘    └─────────────────┘                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## PostgreSQL (Primary Database)

### Purpose

Primary relational database for structured data.

### Version

PostgreSQL 16+ with extensions:
- PostGIS (spatial data)
- TimescaleDB (time-series)
- pg_cron (scheduled jobs)

### Connection

```
Host: localhost / db.waris.local
Port: 5432
Database: waris
User: waris_app
SSL: Required
```

### Schema Overview

```
waris
├── public (default)
│   ├── users
│   ├── roles
│   └── permissions
├── dma (District Metered Areas)
│   ├── regions
│   ├── branches
│   ├── dmas
│   ├── meters
│   └── pipes
├── readings (Time-series data)
│   ├── flow_readings
│   ├── pressure_readings
│   └── meter_readings
├── analysis (Water loss analysis)
│   ├── nrw_calculations
│   ├── loss_reports
│   └── ai_predictions
├── alerts (Notification system)
│   ├── alert_rules
│   ├── alerts
│   └── notifications
└── spatial (PostGIS)
    ├── dma_boundaries
    ├── pipe_network
    └── meter_locations
```

## MongoDB (Document Store)

### Purpose

Document database for unstructured data and logs.

### Version

MongoDB 7+

### Connection

```
URI: mongodb://localhost:27017/waris
Database: waris
```

### Collections

```
waris
├── reports
│   ├── daily_reports
│   ├── weekly_reports
│   └── monthly_reports
├── audit
│   ├── audit_logs
│   ├── access_logs
│   └── change_logs
├── chat
│   ├── conversations
│   ├── messages
│   └── feedback
├── notifications
│   ├── notification_queue
│   └── notification_history
└── documents
    ├── manuals
    ├── policies
    └── training_materials
```

## Milvus (Vector Database)

### Purpose

Vector storage for RAG (Retrieval-Augmented Generation).

### Version

Milvus 2.3+

### Connection

```
Host: localhost
Port: 19530
```

### Collections

| Collection | Dimension | Index | Description |
|------------|-----------|-------|-------------|
| document_embeddings | 1536 | IVF_FLAT | Document chunks |
| query_cache | 1536 | IVF_FLAT | Query embeddings |
| knowledge_base | 1536 | HNSW | FAQ/Knowledge |

## Redis (Cache)

### Purpose

In-memory cache and message broker.

### Version

Redis 7+

### Connection

```
Host: localhost
Port: 6379
DB: 0-15
```

### Key Patterns

| Pattern | Purpose | TTL |
|---------|---------|-----|
| `session:{user_id}` | User sessions | 24h |
| `cache:dma:{id}` | DMA cache | 5m |
| `cache:reading:{dma}:{date}` | Reading cache | 1h |
| `rate:{user_id}` | Rate limiting | 1m |
| `lock:{resource}` | Distributed locks | 30s |

## Data Retention

| Data Type | Hot (SSD) | Warm (HDD) | Archive | Total |
|-----------|-----------|------------|---------|-------|
| Flow readings | 7 days | 30 days | 5 years | 5 years |
| Pressure readings | 7 days | 30 days | 5 years | 5 years |
| Meter readings | 30 days | 1 year | 5 years | 5 years |
| Reports | 1 year | 5 years | Forever | Forever |
| Audit logs | 90 days | 1 year | 5 years | 5 years |
| Chat history | 30 days | 1 year | - | 1 year |

## Backup Strategy

### PostgreSQL

```yaml
backup:
  type: pg_dump + WAL archiving
  frequency:
    full: daily at 02:00
    incremental: every 15 minutes (WAL)
  retention:
    daily: 7 days
    weekly: 4 weeks
    monthly: 12 months
  destination:
    primary: local NAS
    secondary: G-Cloud Storage
```

### MongoDB

```yaml
backup:
  type: mongodump + oplog
  frequency:
    full: daily at 03:00
    incremental: continuous (oplog)
  retention:
    daily: 7 days
    weekly: 4 weeks
  destination: G-Cloud Storage
```

## High Availability

### PostgreSQL

```
┌──────────────┐     ┌──────────────┐
│   Primary    │────>│   Replica    │
│  (Read/Write)│     │  (Read Only) │
└──────────────┘     └──────────────┘
       │
       ▼
┌──────────────┐
│   Replica 2  │
│  (Standby)   │
└──────────────┘
```

### Redis

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Master    │────>│   Replica 1  │────>│   Replica 2  │
└──────────────┘     └──────────────┘     └──────────────┘
       │
       ▼
┌──────────────┐
│   Sentinel   │
│   Cluster    │
└──────────────┘
```

## Performance Tuning

### PostgreSQL

```sql
-- Key configuration parameters
shared_buffers = 4GB
effective_cache_size = 12GB
maintenance_work_mem = 1GB
work_mem = 256MB
max_connections = 200
random_page_cost = 1.1  -- SSD optimized
```

### Indexes

Critical indexes for performance:

```sql
-- Flow readings (time-series)
CREATE INDEX idx_flow_readings_dma_time
ON readings.flow_readings (dma_id, recorded_at DESC);

-- DMA lookups
CREATE INDEX idx_dma_code ON dma.dmas (code);
CREATE INDEX idx_dma_region ON dma.dmas (region_id);

-- Spatial queries
CREATE INDEX idx_dma_boundaries_geom
ON spatial.dma_boundaries USING GIST (geom);
```

## Related Documents

- [ERD](./erd.md)
- [Tables](./tables.md)
- [Migrations](./migrations.md)
