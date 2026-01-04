# /data-pipeline

Manage ETL pipelines and data integration for WARIS system.

## Description
Control data extraction, transformation, and loading processes for water management data.

## Usage
```
/data-pipeline [action] [source]
```

## Parameters
- `action`: Pipeline action (run | status | schedule | debug)
- `source`: Data source (dmama | gis | billing | sensors | all)

## Data Sources

### DMAMA System
- Flow meter readings
- Pressure sensor data
- DMA boundaries
- Water consumption records

### GIS Data (ข้อมูลภูมิสารสนเทศ)
- Pipeline network maps
- DMA geographical boundaries
- Service area polygons
- Asset locations

### Billing System (ระบบการเงิน)
- Customer water usage
- Meter readings
- Payment records
- Account information

### IoT Sensors
- Real-time flow data
- Pressure monitoring
- Water quality sensors

## ETL Processes

### Extract
- API connections to source systems
- Direct database access (read replicas)
- File imports (CSV, Excel, JSON)
- Real-time streaming (Kafka)

### Transform
- Data cleaning and validation
- Missing value handling
- Outlier detection
- Schema normalization
- Feature engineering

### Load
- Load to centralized Data Lake
- Update Vector Database embeddings
- Sync to reporting database
- Archive to cold storage

## Data Quality Checks
- Completeness validation
- Consistency verification
- Accuracy assessment
- Timeliness monitoring
- Duplicate detection

## Scheduling
- Real-time: Sensor data (every 15 min)
- Hourly: Flow aggregations
- Daily: Full DMA sync
- Weekly: GIS updates
- Monthly: Billing reconciliation
