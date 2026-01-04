# External System Integration

## Overview

WARIS integrates with multiple external systems to collect data and provide services.

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         WARIS PLATFORM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ┌─────────────────────┐                      │
│                    │   Integration Hub   │                      │
│                    │    (API Gateway)    │                      │
│                    └──────────┬──────────┘                      │
│                               │                                  │
│  ┌───────────┬───────────┬────┴────┬───────────┬───────────┐   │
│  │           │           │         │           │           │   │
│  ▼           ▼           ▼         ▼           ▼           ▼   │
│ DMAMA     SCADA      Billing    GIS       Weather    LINE     │
│ Adapter   Adapter    Adapter   Adapter   Adapter   Adapter   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
       │           │           │         │           │           │
       ▼           ▼           ▼         ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  DMAMA   │ │  SCADA   │ │ Billing  │ │   GIS    │ │ External │
│  System  │ │ Systems  │ │  System  │ │  Server  │ │   APIs   │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

## DMAMA Integration (TOR 4.3)

### Overview

DMAMA (District Metered Area Management Application) is the primary source for DMA data.

### Connection Details

| Parameter | Value |
|-----------|-------|
| Protocol | REST API / SOAP |
| Authentication | API Key + OAuth2 |
| Data Format | JSON / XML |
| Sync Frequency | Every 15 minutes |

### Data Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dma/list` | GET | List all DMAs |
| `/api/dma/{id}` | GET | DMA details |
| `/api/dma/{id}/readings` | GET | Flow/pressure readings |
| `/api/dma/{id}/meters` | GET | Meter list in DMA |
| `/api/meters/{id}/readings` | GET | Individual meter readings |

### Data Model Mapping

```
DMAMA                          WARIS
┌─────────────────┐           ┌─────────────────┐
│ DMA             │           │ dma             │
│ ├─ dma_code     │ ────────> │ ├─ id           │
│ ├─ dma_name     │           │ ├─ code         │
│ ├─ region       │           │ ├─ name         │
│ └─ branch       │           │ └─ region_id    │
└─────────────────┘           └─────────────────┘

┌─────────────────┐           ┌─────────────────┐
│ FlowReading     │           │ flow_reading    │
│ ├─ timestamp    │ ────────> │ ├─ recorded_at  │
│ ├─ flow_value   │           │ ├─ flow_rate    │
│ └─ unit         │           │ └─ dma_id       │
└─────────────────┘           └─────────────────┘
```

### Sync Process

```python
# DMAMA Sync Job
async def sync_dmama_data():
    """Sync data from DMAMA every 15 minutes"""

    # 1. Fetch DMA list
    dmas = await dmama_client.get_dmas()

    # 2. For each DMA, fetch latest readings
    for dma in dmas:
        readings = await dmama_client.get_readings(
            dma_id=dma.id,
            since=last_sync_time
        )

        # 3. Transform and validate
        validated = validate_readings(readings)

        # 4. Store in database
        await db.bulk_insert(validated)

    # 5. Update sync timestamp
    await update_last_sync()
```

## SCADA Integration

### Overview

SCADA systems provide real-time sensor data from field devices.

### Protocols Supported

| Protocol | Use Case |
|----------|----------|
| Modbus TCP | Direct sensor communication |
| OPC-UA | Industrial automation |
| MQTT | IoT sensors |
| HTTP/REST | Modern SCADA gateways |

### Data Points

| Point | Type | Unit | Frequency |
|-------|------|------|-----------|
| Flow Rate | Float | m³/h | 5 sec |
| Pressure | Float | bar | 5 sec |
| Level | Float | m | 1 min |
| Valve Status | Boolean | - | On change |
| Pump Status | Boolean | - | On change |

### Real-time Processing

```
┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
│ SCADA  │───>│ MQTT   │───>│ Stream │───>│ Redis  │
│Devices │    │ Broker │    │Process │    │ PubSub │
└────────┘    └────────┘    └────────┘    └────────┘
                                │              │
                                ▼              ▼
                          ┌────────┐    ┌────────┐
                          │TimeSeries│   │ Alert  │
                          │   DB    │   │ Engine │
                          └────────┘    └────────┘
```

## Billing System Integration

### Overview

Integration with PWA billing system for consumption data.

### Data Exchange

| Data | Direction | Frequency |
|------|-----------|-----------|
| Meter Readings | Billing → WARIS | Daily |
| Consumption | Billing → WARIS | Monthly |
| Customer Info | Billing → WARIS | On change |
| Anomaly Alerts | WARIS → Billing | Real-time |

### API Specification

```yaml
# OpenAPI spec for Billing integration
paths:
  /billing/consumption:
    get:
      summary: Get consumption data
      parameters:
        - name: dma_id
          in: query
          type: string
        - name: period
          in: query
          type: string
          enum: [daily, monthly, yearly]
      responses:
        200:
          description: Consumption data
          schema:
            $ref: '#/definitions/ConsumptionData'
```

## GIS Integration

### Overview

Geographic Information System integration for map data.

### Layers

| Layer | Description | Update Frequency |
|-------|-------------|------------------|
| DMA Boundaries | DMA polygon areas | Monthly |
| Pipe Network | Water pipe lines | Weekly |
| Meters | Meter locations | Daily |
| Valves | Valve locations | Weekly |
| Facilities | Pump stations, tanks | Monthly |

### Data Format

| Format | Use Case |
|--------|----------|
| GeoJSON | Web display |
| Shapefile | Import/Export |
| WMS/WFS | Map tile service |

### Map Service

```
┌─────────────────────────────────────────────────────────────────┐
│                        GIS SERVICE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐               │
│  │  PostGIS  │───>│  Tile     │───>│  Map      │               │
│  │ (Storage) │    │  Server   │    │  Client   │               │
│  └───────────┘    └───────────┘    └───────────┘               │
│       │                                    │                     │
│       ▼                                    ▼                     │
│  ┌───────────┐                      ┌───────────┐               │
│  │  Spatial  │                      │  Leaflet  │               │
│  │  Queries  │                      │  /Mapbox  │               │
│  └───────────┘                      └───────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Notification Integrations

### LINE Notify

```python
# LINE Notify integration
async def send_line_notify(message: str, token: str):
    """Send notification via LINE Notify"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://notify-api.line.me/api/notify",
            headers={"Authorization": f"Bearer {token}"},
            data={"message": message}
        )
    return response.status_code == 200
```

### Email (SMTP)

```python
# Email configuration
EMAIL_CONFIG = {
    "host": "smtp.pwa.co.th",
    "port": 587,
    "use_tls": True,
    "from_address": "waris@pwa.co.th"
}
```

### SMS Gateway

```python
# SMS integration
SMS_CONFIG = {
    "provider": "ThaiBulkSMS",
    "api_url": "https://api-v2.thaibulksms.com/sms",
    "sender_name": "PWA-WARIS"
}
```

## Weather API Integration

### Purpose

Weather data for demand forecasting and anomaly detection.

### Provider

| Provider | Data | Update |
|----------|------|--------|
| TMD (Thai Met Dept) | Forecast, historical | Hourly |
| OpenWeatherMap | Current, forecast | 15 min |

### Data Points

- Temperature (°C)
- Humidity (%)
- Rainfall (mm)
- Wind speed (m/s)

## Error Handling

### Retry Strategy

```python
RETRY_CONFIG = {
    "max_retries": 3,
    "backoff_factor": 2,  # Exponential backoff
    "retry_codes": [408, 429, 500, 502, 503, 504]
}
```

### Circuit Breaker

```python
CIRCUIT_BREAKER_CONFIG = {
    "failure_threshold": 5,
    "recovery_timeout": 60,  # seconds
    "expected_exception": ConnectionError
}
```

### Dead Letter Queue

Failed integration messages are stored for manual review:

```
┌────────┐    ┌────────┐    ┌────────┐
│ Failed │───>│  DLQ   │───>│ Manual │
│Message │    │ Queue  │    │ Review │
└────────┘    └────────┘    └────────┘
```

## Security

### API Authentication

| System | Method |
|--------|--------|
| DMAMA | API Key + OAuth2 |
| SCADA | Certificates + VPN |
| Billing | JWT |
| GIS | API Key |
| LINE | Bearer Token |

### Data Encryption

- TLS 1.3 for all API calls
- VPN for SCADA connections
- Field-level encryption for sensitive data

## Related Documents

- [System Overview](./overview.md)
- [Data Flow](./data-flow.md)
- [API Endpoints](../api/endpoints.md)
