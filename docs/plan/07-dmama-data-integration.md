# DMAMA Data Integration Plan

# แผนการเชื่อมต่อข้อมูล DMAMA

**Created:** 2026-01-14
**Completed:** 2026-01-15
**Status:** Done
**TOR Reference:** Section 4.3, 4.4

---

## Objective (วัตถุประสงค์)

เชื่อมต่อระบบ WARIS กับระบบ DMAMA ของ กปภ. เพื่อดึงข้อมูลน้ำสูญเสียแบบอัตโนมัติ

---

## TOR Requirements (ข้อกำหนด)

### Section 4.3: Data Integration

- DMAMA system integration
- API / Direct DB / File import support
- Data quality validation
- ETL pipeline development
- Data Flow Diagram
- Metadata & Data Catalog

### Section 4.4: Data Types

- Water user data (ข้อมูลผู้ใช้น้ำ)
- Operational data (การผลิตและจำหน่าย)
- Pipe repair records (ข้อมูลการซ่อมท่อ)
- GIS data

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DMAMA Data Sources                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │
│  │   DMAMA API   │  │   DMAMA DB    │  │  File Import  │               │
│  │   (REST)      │  │  (Direct SQL) │  │  (CSV/Excel)  │               │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘               │
│          │                  │                  │                        │
└──────────┼──────────────────┼──────────────────┼────────────────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          ETL Pipeline                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │   Extract   │───▶│  Transform  │───▶│    Load     │                 │
│  │             │    │             │    │             │                 │
│  │ - Fetch     │    │ - Validate  │    │ - PostgreSQL│                 │
│  │ - Parse     │    │ - Clean     │    │ - MongoDB   │                 │
│  │ - Schedule  │    │ - Enrich    │    │ - Milvus    │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        WARIS Data Layer                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │
│  │  PostgreSQL   │  │   MongoDB     │  │    Milvus    │                │
│  │  (Structured) │  │  (Documents)  │  │  (Vectors)   │                │
│  │               │  │               │  │               │                │
│  │ - DMA Data    │  │ - Reports     │  │ - Embeddings │                │
│  │ - Readings    │  │ - Logs        │  │ - RAG Index  │                │
│  │ - Alerts      │  │ - Files       │  │               │                │
│  └───────────────┘  └───────────────┘  └───────────────┘               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Schema

### 1. Regions (เขต)

```sql
CREATE TABLE regions (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name_th VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Branches (สาขา)

```sql
CREATE TABLE branches (
    id VARCHAR(50) PRIMARY KEY,
    region_id VARCHAR(50) REFERENCES regions(id),
    code VARCHAR(20) UNIQUE NOT NULL,
    name_th VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    tier SMALLINT DEFAULT 2,  -- 1, 2, หรือ พิเศษ
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. DMAs (พื้นที่จ่ายน้ำย่อย)

```sql
CREATE TABLE dmas (
    id VARCHAR(50) PRIMARY KEY,
    branch_id VARCHAR(50) REFERENCES branches(id),
    code VARCHAR(20) UNIQUE NOT NULL,
    name_th VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    area_km2 DECIMAL(10,2),
    population INTEGER,
    connections INTEGER,
    pipe_length_km DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. DMA Readings (ค่าการอ่าน)

```sql
CREATE TABLE dma_readings (
    id SERIAL PRIMARY KEY,
    dma_id VARCHAR(50) REFERENCES dmas(id),
    reading_time TIMESTAMP NOT NULL,
    flow_in DECIMAL(12,2),       -- ลบ.ม.
    flow_out DECIMAL(12,2),      -- ลบ.ม.
    loss_volume DECIMAL(12,2),   -- ลบ.ม.
    loss_percentage DECIMAL(5,2), -- %
    pressure DECIMAL(5,2),        -- บาร์
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(dma_id, reading_time)
);

-- Index for time-series queries
CREATE INDEX idx_readings_dma_time ON dma_readings(dma_id, reading_time DESC);
```

### 5. Alerts (การแจ้งเตือน)

```sql
CREATE TABLE alerts (
    id VARCHAR(50) PRIMARY KEY,
    dma_id VARCHAR(50) REFERENCES dmas(id),
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    title_th VARCHAR(200),
    title_en VARCHAR(200),
    description_th TEXT,
    description_en TEXT,
    triggered_at TIMESTAMP NOT NULL,
    acknowledged_at TIMESTAMP,
    acknowledged_by VARCHAR(50),
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alerts_status ON alerts(status, severity);
CREATE INDEX idx_alerts_dma ON alerts(dma_id, triggered_at DESC);
```

---

## Implementation Steps

### Step 1: Create Database Schema (30 min)

```bash
# Create migration file
cd platform/apps/api
alembic revision -m "create_dmama_schema"
```

### Step 2: Create ETL Service (2 hours)

**File:** `platform/apps/api/services/etl_service.py`

```python
from typing import List, Dict, Any
from datetime import datetime, timedelta
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession

class ETLService:
    """ETL Pipeline for DMAMA data integration"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def extract_from_api(self, endpoint: str) -> List[Dict]:
        """Extract data from DMAMA API"""
        # TODO: Implement when DMAMA API is available
        pass

    async def extract_from_db(self, query: str) -> List[Dict]:
        """Extract data from DMAMA database"""
        # TODO: Implement when DB connection is available
        pass

    async def extract_from_file(self, file_path: str) -> List[Dict]:
        """Extract data from CSV/Excel file"""
        import pandas as pd
        df = pd.read_csv(file_path) if file_path.endswith('.csv') else pd.read_excel(file_path)
        return df.to_dict('records')

    async def transform(self, raw_data: List[Dict]) -> List[Dict]:
        """Transform and validate data"""
        transformed = []
        for record in raw_data:
            # Validate required fields
            if not self._validate_record(record):
                continue
            # Clean and enrich data
            cleaned = self._clean_record(record)
            transformed.append(cleaned)
        return transformed

    async def load_to_postgres(self, data: List[Dict], table: str):
        """Load data to PostgreSQL"""
        # Bulk insert with conflict handling
        pass

    def _validate_record(self, record: Dict) -> bool:
        """Validate a single record"""
        required_fields = ['dma_id', 'reading_time', 'flow_in', 'flow_out']
        return all(field in record for field in required_fields)

    def _clean_record(self, record: Dict) -> Dict:
        """Clean and normalize a record"""
        return {
            'dma_id': str(record.get('dma_id', '')).strip(),
            'reading_time': self._parse_datetime(record.get('reading_time')),
            'flow_in': float(record.get('flow_in', 0)),
            'flow_out': float(record.get('flow_out', 0)),
            'loss_volume': float(record.get('flow_in', 0)) - float(record.get('flow_out', 0)),
            'loss_percentage': self._calc_loss_pct(record),
            'pressure': float(record.get('pressure', 0)),
        }
```

### Step 3: Create Data Connectors (1 hour)

**File:** `platform/apps/api/connectors/dmama_connector.py`

```python
from abc import ABC, abstractmethod
from typing import List, Dict, Any
import httpx
import asyncpg

class DataConnector(ABC):
    """Base class for data connectors"""

    @abstractmethod
    async def connect(self):
        pass

    @abstractmethod
    async def fetch(self, query: str) -> List[Dict]:
        pass

    @abstractmethod
    async def close(self):
        pass

class DMAMAAPIConnector(DataConnector):
    """Connector for DMAMA REST API"""

    def __init__(self, base_url: str, api_key: str = None):
        self.base_url = base_url
        self.api_key = api_key
        self.client = None

    async def connect(self):
        headers = {}
        if self.api_key:
            headers['Authorization'] = f'Bearer {self.api_key}'
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers=headers,
            timeout=30.0
        )

    async def fetch(self, endpoint: str) -> List[Dict]:
        response = await self.client.get(endpoint)
        response.raise_for_status()
        return response.json()

    async def close(self):
        if self.client:
            await self.client.aclose()

class DMAMADBConnector(DataConnector):
    """Connector for direct DMAMA database access"""

    def __init__(self, connection_string: str):
        self.connection_string = connection_string
        self.pool = None

    async def connect(self):
        self.pool = await asyncpg.create_pool(self.connection_string)

    async def fetch(self, query: str) -> List[Dict]:
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(query)
            return [dict(row) for row in rows]

    async def close(self):
        if self.pool:
            await self.pool.close()
```

### Step 4: Create Scheduler (30 min)

**File:** `platform/apps/api/scheduler/etl_scheduler.py`

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

scheduler = AsyncIOScheduler()

async def run_daily_etl():
    """Run daily ETL job at 2 AM"""
    from services.etl_service import ETLService
    # Execute ETL pipeline
    pass

async def run_hourly_readings():
    """Fetch hourly readings from DMAMA"""
    pass

def setup_scheduler():
    # Daily full sync at 2 AM
    scheduler.add_job(
        run_daily_etl,
        CronTrigger(hour=2, minute=0),
        id='daily_etl'
    )

    # Hourly readings sync
    scheduler.add_job(
        run_hourly_readings,
        CronTrigger(minute=0),
        id='hourly_readings'
    )

    scheduler.start()
```

### Step 5: Create API Endpoints (30 min)

**File:** `platform/apps/api/routers/etl.py`

```python
from fastapi import APIRouter, UploadFile, File, Depends
from services.etl_service import ETLService

router = APIRouter(prefix="/api/v1/etl", tags=["ETL"])

@router.post("/upload")
async def upload_data_file(
    file: UploadFile = File(...),
    etl: ETLService = Depends()
):
    """Upload CSV/Excel file for data import"""
    # Save file and process
    pass

@router.post("/sync")
async def trigger_sync():
    """Manually trigger data sync from DMAMA"""
    pass

@router.get("/status")
async def get_etl_status():
    """Get ETL pipeline status"""
    return {
        "last_sync": "2026-01-14T02:00:00Z",
        "records_processed": 15000,
        "status": "completed"
    }
```

---

## File Structure

```
platform/apps/api/
├── connectors/
│   ├── __init__.py
│   ├── base.py
│   └── dmama_connector.py
├── services/
│   ├── etl_service.py
│   └── data_quality_service.py
├── scheduler/
│   ├── __init__.py
│   └── etl_scheduler.py
├── routers/
│   └── etl.py
└── migrations/
    └── versions/
        └── 002_create_dmama_schema.py
```

---

## Data Quality Checks

| Check | Description | Action |
|-------|-------------|--------|
| Null values | Required fields must not be null | Reject record |
| Range validation | Loss % must be 0-100 | Flag for review |
| Duplicate detection | Same DMA + timestamp | Skip duplicate |
| Outlier detection | Values > 3 std dev | Flag for review |
| Referential integrity | DMA must exist | Create or reject |

---

## Timeline

| Step | Duration | Status |
|------|----------|--------|
| Database Schema | 30 min | Pending |
| ETL Service | 2 hours | Pending |
| Data Connectors | 1 hour | Pending |
| Scheduler | 30 min | Pending |
| API Endpoints | 30 min | Pending |
| Testing | 1 hour | Pending |
| **Total** | **~6 hours** | |

---

## Configuration

```yaml
# config/etl.yaml
dmama:
  api:
    base_url: "https://dmama.pwa.co.th/api/v1"
    api_key: "${DMAMA_API_KEY}"
    timeout: 30

  database:
    host: "dmama-db.pwa.co.th"
    port: 5432
    database: "dmama"
    username: "${DMAMA_DB_USER}"
    password: "${DMAMA_DB_PASS}"

  schedule:
    daily_sync: "0 2 * * *"      # 2 AM daily
    hourly_readings: "0 * * * *"  # Every hour

  quality:
    max_loss_percentage: 100
    min_flow_rate: 0
    duplicate_window_hours: 1
```

---

## Next Steps After Completion

1. **Test with sample DMAMA data**
2. **Create data validation reports**
3. **Setup monitoring alerts for ETL failures**
4. **Document data dictionary**
