# API Overview

## Introduction

WARIS provides a RESTful API built with FastAPI for all platform operations.

## Base URL

```
Production:  https://api.waris.pwa.co.th/v1
Staging:     https://api-staging.waris.pwa.co.th/v1
Development: http://localhost:8000/v1
```

## API Versioning

API version is included in the URL path: `/v1/`, `/v2/`, etc.

## Authentication

All API endpoints require authentication except:
- `POST /v1/auth/login`
- `POST /v1/auth/register`
- `GET /v1/health`

### JWT Authentication

```http
Authorization: Bearer <access_token>
```

### Token Flow

```
┌────────┐                                           ┌────────┐
│ Client │                                           │  API   │
└───┬────┘                                           └───┬────┘
    │                                                    │
    │  POST /auth/login {email, password}               │
    │ ─────────────────────────────────────────────────>│
    │                                                    │
    │  {access_token, refresh_token, expires_in}        │
    │ <─────────────────────────────────────────────────│
    │                                                    │
    │  GET /dmas (Authorization: Bearer <token>)        │
    │ ─────────────────────────────────────────────────>│
    │                                                    │
    │  {data: [...]}                                    │
    │ <─────────────────────────────────────────────────│
    │                                                    │
    │  POST /auth/refresh {refresh_token}               │
    │ ─────────────────────────────────────────────────>│
    │                                                    │
    │  {access_token, refresh_token, expires_in}        │
    │ <─────────────────────────────────────────────────│
```

## Request Format

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes* | Bearer token |
| `Content-Type` | Yes | `application/json` |
| `Accept-Language` | No | `th` or `en` (default: `th`) |
| `X-Request-ID` | No | Request tracking ID |

### Request Body

```json
{
  "field_name": "value",
  "nested": {
    "field": "value"
  }
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Example"
  },
  "meta": {
    "request_id": "req_123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [
    {"id": "1", "name": "Item 1"},
    {"id": "2", "name": "Item 2"}
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  },
  "meta": {
    "request_id": "req_123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "request_id": "req_123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created |
| 204 | No Content - Successful, no body |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth required |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource conflict |
| 422 | Unprocessable - Validation failed |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Error - Server error |

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | Authentication required |
| `AUTH_INVALID` | 401 | Invalid credentials |
| `AUTH_EXPIRED` | 401 | Token expired |
| `ACCESS_DENIED` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Input validation failed |
| `DUPLICATE_ENTRY` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Internal server error |

## Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 10 | 1 minute |
| Read (GET) | 100 | 1 minute |
| Write (POST/PUT) | 30 | 1 minute |
| Export | 5 | 5 minutes |
| AI/LLM | 20 | 1 minute |

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248960
```

## Pagination

Query parameters for list endpoints:

| Parameter | Default | Max | Description |
|-----------|---------|-----|-------------|
| `page` | 1 | - | Page number |
| `per_page` | 20 | 100 | Items per page |
| `sort` | - | - | Sort field |
| `order` | `asc` | - | `asc` or `desc` |

Example:
```
GET /v1/dmas?page=2&per_page=50&sort=name&order=asc
```

## Filtering

### Operators

| Operator | Example | Description |
|----------|---------|-------------|
| `eq` | `status=eq:active` | Equals |
| `ne` | `status=ne:inactive` | Not equals |
| `gt` | `nrw=gt:20` | Greater than |
| `gte` | `nrw=gte:20` | Greater or equal |
| `lt` | `nrw=lt:10` | Less than |
| `lte` | `nrw=lte:10` | Less or equal |
| `in` | `status=in:active,pending` | In list |
| `like` | `name=like:bangkok` | Contains |

Example:
```
GET /v1/dmas?region_id=eq:uuid&nrw=gt:15&status=in:active,pending
```

## Date/Time

All dates/times use ISO 8601 format in UTC:
```
2024-01-15T10:30:00Z
```

Query parameters for date ranges:
```
GET /v1/readings?from=2024-01-01T00:00:00Z&to=2024-01-31T23:59:59Z
```

## File Uploads

Multipart form data for file uploads:
```http
POST /v1/documents
Content-Type: multipart/form-data

file: <binary>
metadata: {"category": "report", "dma_id": "uuid"}
```

## Webhooks

WARIS can send webhooks for events:

```json
{
  "event": "alert.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "uuid",
    "type": "leak_detected",
    "severity": "high"
  },
  "signature": "sha256=..."
}
```

## API Documentation

Interactive documentation available at:
- Swagger UI: `/docs`
- ReDoc: `/redoc`
- OpenAPI JSON: `/openapi.json`

## Related Documents

- [Authentication](./authentication.md)
- [Endpoints](./endpoints.md)
- [OpenAPI Spec](./openapi.yaml)
