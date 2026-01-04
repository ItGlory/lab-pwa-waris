# API Design Overview
# ภาพรวมการออกแบบ API

## API Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            API GATEWAY                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         NGINX / Traefik                              │   │
│  │  • SSL Termination  • Load Balancing  • Rate Limiting  • Caching    │   │
│  └───────────────────────────────┬─────────────────────────────────────┘   │
│                                  │                                          │
│  ┌───────────────────────────────▼─────────────────────────────────────┐   │
│  │                         FastAPI Gateway                              │   │
│  │  • Authentication  • Authorization  • Request Routing  • Logging    │   │
│  └───────────────────────────────┬─────────────────────────────────────┘   │
│                                  │                                          │
│         ┌────────────────────────┼────────────────────────┐                │
│         │                        │                        │                │
│  ┌──────▼──────┐         ┌───────▼──────┐        ┌───────▼──────┐         │
│  │   /api/v1   │         │   /api/v1    │        │   /api/v1    │         │
│  │   /water-   │         │   /ai        │        │   /users     │         │
│  │   loss      │         │              │        │              │         │
│  └─────────────┘         └──────────────┘        └──────────────┘         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## API Standards

### Base URL
```
Production:  https://api.waris.pwa.co.th/api/v1
Development: http://localhost:8000/api/v1
```

### Versioning
- URL-based versioning: `/api/v1/`, `/api/v2/`
- Header-based fallback: `X-API-Version: 1`

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  },
  "message": "Success",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "message_th": "ข้อมูลไม่ถูกต้อง",
    "details": [
      {
        "field": "dma_id",
        "message": "DMA ID is required"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## API Endpoints Overview

### Water Loss APIs (`/api/v1/water-loss`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dma` | List all DMAs |
| GET | `/dma/{id}` | Get DMA details |
| GET | `/dma/{id}/readings` | Get water loss readings |
| GET | `/dma/{id}/analysis` | Get AI analysis |
| GET | `/dma/{id}/alerts` | Get DMA alerts |
| POST | `/readings` | Submit new readings |
| GET | `/summary` | Get organization summary |

### AI/ML APIs (`/api/v1/ai`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict/anomaly` | Run anomaly detection |
| POST | `/predict/pattern` | Run pattern recognition |
| POST | `/predict/classify` | Run classification |
| POST | `/predict/forecast` | Run time-series forecast |
| GET | `/models` | List available models |
| GET | `/models/{id}/metrics` | Get model performance |

### LLM/Chat APIs (`/api/v1/chat`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/completions` | Chat completion |
| POST | `/rag/query` | RAG-powered query |
| GET | `/history` | Get chat history |
| DELETE | `/history/{session_id}` | Delete chat session |
| POST | `/documents` | Upload document |
| GET | `/documents` | List documents |

### Report APIs (`/api/v1/reports`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List reports |
| POST | `/generate` | Generate new report |
| GET | `/{id}` | Get report details |
| GET | `/{id}/download` | Download report |
| DELETE | `/{id}` | Delete report |

### Alert APIs (`/api/v1/alerts`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List alerts |
| GET | `/{id}` | Get alert details |
| POST | `/{id}/acknowledge` | Acknowledge alert |
| POST | `/{id}/resolve` | Resolve alert |
| GET | `/history` | Get alert history |

### User APIs (`/api/v1/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/logout` | User logout |
| POST | `/auth/refresh` | Refresh token |
| GET | `/me` | Get current user |
| PUT | `/me` | Update current user |
| GET | `/` | List users (admin) |
| POST | `/` | Create user (admin) |
| PUT | `/{id}` | Update user (admin) |
| DELETE | `/{id}` | Delete user (admin) |

### Dashboard APIs (`/api/v1/dashboard`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/overview` | Organization overview |
| GET | `/dma/{id}` | DMA dashboard data |
| GET | `/charts/{type}` | Chart data |
| GET | `/kpi` | KPI metrics |

---

## Authentication

### JWT Token Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │────►│  Login  │────►│  JWT    │
│         │     │  API    │     │  Token  │
└─────────┘     └─────────┘     └────┬────┘
                                     │
     ┌───────────────────────────────┘
     │
     ▼
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Request │────►│ Verify  │────►│ Resource│
│ + Token │     │  JWT    │     │   API   │
└─────────┘     └─────────┘     └─────────┘
```

### Token Structure
```json
{
  "sub": "user_id",
  "email": "user@pwa.co.th",
  "role": "operator",
  "region_id": "uuid",
  "permissions": ["read:dma", "write:alerts"],
  "exp": 1705320000,
  "iat": 1705233600
}
```

### Headers
```http
Authorization: Bearer <jwt_token>
X-Request-ID: <uuid>
Accept-Language: th
```

---

## Rate Limiting

### Limits by Role

| Role | Requests/Minute | Chat/Day |
|------|-----------------|----------|
| Admin | 1000 | Unlimited |
| Operator | 100 | 100 |
| Viewer | 50 | 50 |

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705320000
```

---

## WebSocket Events

### Connection
```javascript
const ws = new WebSocket('wss://api.waris.pwa.co.th/ws');
ws.send(JSON.stringify({
  type: 'auth',
  token: 'jwt_token'
}));
```

### Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `alert.new` | Server→Client | New alert created |
| `alert.update` | Server→Client | Alert status changed |
| `reading.new` | Server→Client | New reading received |
| `chat.response` | Server→Client | Streaming chat response |
| `subscribe` | Client→Server | Subscribe to channel |
| `unsubscribe` | Client→Server | Unsubscribe from channel |

### Event Format
```json
{
  "type": "alert.new",
  "data": {
    "id": "uuid",
    "dma_id": "uuid",
    "severity": "critical",
    "message": "High water loss detected",
    "message_th": "ตรวจพบน้ำสูญเสียสูง"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Pagination

### Request
```http
GET /api/v1/alerts?page=1&per_page=20&sort=-created_at
```

### Response
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 156,
    "total_pages": 8
  }
}
```

---

## Filtering

### Query Parameters
```http
GET /api/v1/alerts?status=active&severity=critical&dma_id=uuid
GET /api/v1/readings?dma_id=uuid&start_date=2024-01-01&end_date=2024-01-31
```

### Filter Operators
```http
?loss_percentage[gte]=10    # Greater than or equal
?loss_percentage[lte]=50    # Less than or equal
?status[in]=active,pending  # In list
?name[like]=บางพลี           # Contains (Thai supported)
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | Authentication required |
| `AUTH_INVALID` | 401 | Invalid credentials |
| `FORBIDDEN` | 403 | Permission denied |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Invalid input |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## API Documentation

### OpenAPI/Swagger
- Swagger UI: `https://api.waris.pwa.co.th/docs`
- ReDoc: `https://api.waris.pwa.co.th/redoc`
- OpenAPI JSON: `https://api.waris.pwa.co.th/openapi.json`

### Thai Language Support
All API responses support Thai language via:
- `Accept-Language: th` header
- `lang=th` query parameter
