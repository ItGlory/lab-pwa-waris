# API Endpoints

## Endpoint Summary

| Module | Base Path | Description |
|--------|-----------|-------------|
| Auth | `/v1/auth` | Authentication |
| Users | `/v1/users` | User management |
| DMAs | `/v1/dmas` | DMA operations |
| Readings | `/v1/readings` | Sensor data |
| Analysis | `/v1/analysis` | NRW analysis |
| Alerts | `/v1/alerts` | Notifications |
| Reports | `/v1/reports` | Report generation |
| Chat | `/v1/chat` | LLM Q&A |

---

## Authentication

### Login

```http
POST /v1/auth/login
```

**Request:**
```json
{
  "email": "user@pwa.co.th",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

### Refresh Token

```http
POST /v1/auth/refresh
```

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Logout

```http
POST /v1/auth/logout
Authorization: Bearer <token>
```

### Get Current User

```http
GET /v1/auth/me
Authorization: Bearer <token>
```

---

## Users

### List Users

```http
GET /v1/users
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page number |
| `per_page` | int | Items per page |
| `role` | string | Filter by role |
| `department` | string | Filter by department |
| `search` | string | Search name/email |

### Get User

```http
GET /v1/users/{user_id}
Authorization: Bearer <token>
```

### Create User

```http
POST /v1/users
Authorization: Bearer <token>
```

**Request:**
```json
{
  "email": "newuser@pwa.co.th",
  "password": "securepassword",
  "full_name": "สมชาย ใจดี",
  "department": "Water Loss",
  "role_ids": ["uuid-1", "uuid-2"]
}
```

### Update User

```http
PUT /v1/users/{user_id}
Authorization: Bearer <token>
```

### Delete User

```http
DELETE /v1/users/{user_id}
Authorization: Bearer <token>
```

---

## DMAs (District Metered Areas)

### List DMAs

```http
GET /v1/dmas
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `region_id` | uuid | Filter by region |
| `branch_id` | uuid | Filter by branch |
| `status` | string | `active`, `inactive` |
| `nrw_min` | float | Min NRW percentage |
| `nrw_max` | float | Max NRW percentage |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "DMA-001",
      "name_th": "เขตพื้นที่ 1",
      "name_en": "District Area 1",
      "branch": {
        "id": "uuid",
        "name_th": "สาขาบางเขน"
      },
      "area_km2": 5.5,
      "population": 15000,
      "connections": 3500,
      "latest_nrw": 18.5,
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150
  }
}
```

### Get DMA

```http
GET /v1/dmas/{dma_id}
Authorization: Bearer <token>
```

### Get DMA Statistics

```http
GET /v1/dmas/{dma_id}/stats
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `period` | string | `day`, `week`, `month`, `year` |
| `from` | datetime | Start date |
| `to` | datetime | End date |

**Response:**
```json
{
  "success": true,
  "data": {
    "dma_id": "uuid",
    "period": "month",
    "system_input": 125000.5,
    "billed_consumption": 100250.3,
    "nrw_volume": 24750.2,
    "nrw_percent": 19.8,
    "ili": 2.5,
    "avg_flow_rate": 175.5,
    "avg_pressure": 2.8,
    "alerts_count": 3
  }
}
```

### Get DMA Boundary (GeoJSON)

```http
GET /v1/dmas/{dma_id}/boundary
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "Feature",
    "properties": {
      "dma_id": "uuid",
      "name": "DMA-001"
    },
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[100.5, 13.7], [100.6, 13.7], ...]]
    }
  }
}
```

---

## Readings

### Get Flow Readings

```http
GET /v1/readings/flow
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `dma_id` | uuid | Required |
| `from` | datetime | Start time |
| `to` | datetime | End time |
| `interval` | string | `5min`, `15min`, `hour`, `day` |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "recorded_at": "2024-01-15T10:00:00Z",
      "flow_rate": 125.5,
      "total_flow": 15250.3
    },
    {
      "recorded_at": "2024-01-15T10:05:00Z",
      "flow_rate": 128.2,
      "total_flow": 15260.7
    }
  ]
}
```

### Get Pressure Readings

```http
GET /v1/readings/pressure
Authorization: Bearer <token>
```

### Get Meter Readings

```http
GET /v1/readings/meter
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `meter_id` | uuid | Meter ID |
| `dma_id` | uuid | DMA ID |
| `from` | datetime | Start time |
| `to` | datetime | End time |

---

## Analysis

### Get NRW Analysis

```http
GET /v1/analysis/nrw
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `dma_id` | uuid | DMA ID |
| `period` | string | `day`, `month`, `year` |
| `from` | date | Start date |
| `to` | date | End date |

### Run NRW Calculation

```http
POST /v1/analysis/nrw/calculate
Authorization: Bearer <token>
```

**Request:**
```json
{
  "dma_id": "uuid",
  "period_start": "2024-01-01",
  "period_end": "2024-01-31"
}
```

### Get AI Predictions

```http
GET /v1/analysis/predictions
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `dma_id` | uuid | DMA ID |
| `model_type` | string | `leak_detection`, `demand_forecast`, etc. |
| `from` | datetime | Start time |
| `to` | datetime | End time |

### Request AI Prediction

```http
POST /v1/analysis/predictions
Authorization: Bearer <token>
```

**Request:**
```json
{
  "dma_id": "uuid",
  "model_type": "leak_detection",
  "parameters": {
    "sensitivity": "high"
  }
}
```

---

## Alerts

### List Alerts

```http
GET /v1/alerts
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `dma_id` | uuid | Filter by DMA |
| `type` | string | Alert type |
| `severity` | string | `low`, `medium`, `high`, `critical` |
| `status` | string | `open`, `acknowledged`, `resolved` |

### Get Alert

```http
GET /v1/alerts/{alert_id}
Authorization: Bearer <token>
```

### Acknowledge Alert

```http
POST /v1/alerts/{alert_id}/acknowledge
Authorization: Bearer <token>
```

### Resolve Alert

```http
POST /v1/alerts/{alert_id}/resolve
Authorization: Bearer <token>
```

**Request:**
```json
{
  "resolution_note": "Fixed leak at location X"
}
```

---

## Reports

### List Reports

```http
GET /v1/reports
Authorization: Bearer <token>
```

### Generate Report

```http
POST /v1/reports/generate
Authorization: Bearer <token>
```

**Request:**
```json
{
  "report_type": "monthly_nrw",
  "dma_ids": ["uuid-1", "uuid-2"],
  "period_start": "2024-01-01",
  "period_end": "2024-01-31",
  "format": "pdf",
  "language": "th"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "job_id": "uuid",
    "status": "processing",
    "estimated_time": 30
  }
}
```

### Get Report Status

```http
GET /v1/reports/jobs/{job_id}
Authorization: Bearer <token>
```

### Download Report

```http
GET /v1/reports/{report_id}/download
Authorization: Bearer <token>
```

---

## Chat (LLM Q&A)

### Create Conversation

```http
POST /v1/chat/conversations
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversation_id": "uuid",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Send Message

```http
POST /v1/chat/conversations/{conversation_id}/messages
Authorization: Bearer <token>
```

**Request:**
```json
{
  "message": "DMA-001 มีอัตราน้ำสูญเสียเท่าไหร่ในเดือนที่ผ่านมา?"
}
```

**Response (streaming):**
```json
{
  "success": true,
  "data": {
    "message_id": "uuid",
    "response": "จากข้อมูลในระบบ DMA-001 มีอัตราน้ำสูญเสีย (NRW) ในเดือนธันวาคม 2024 อยู่ที่ 18.5% ซึ่งลดลงจากเดือนก่อนหน้า 2.3%",
    "sources": [
      {
        "type": "database",
        "reference": "nrw_calculations",
        "date": "2024-01"
      }
    ]
  }
}
```

### Get Conversation History

```http
GET /v1/chat/conversations/{conversation_id}/messages
Authorization: Bearer <token>
```

---

## Health Check

### Health Status

```http
GET /v1/health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "milvus": "healthy",
    "llm": "healthy"
  }
}
```

## Related Documents

- [API Overview](./overview.md)
- [Authentication](./authentication.md)
- [OpenAPI Spec](./openapi.yaml)
