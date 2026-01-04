# System Architecture Overview

## Executive Summary

WARIS (Water Loss Intelligent Analysis and Reporting System) is a hybrid AI platform designed to analyze water loss data and provide intelligent insights for the Provincial Waterworks Authority (กปภ.).

## Architecture Principles

1. **Hybrid Deployment** - On-premise GPU servers + G-Cloud backup
2. **Microservices** - Loosely coupled, independently deployable services
3. **AI-First** - AI/ML capabilities integrated throughout
4. **Thai Language Native** - Full Thai language support in LLM and UI
5. **Security by Design** - ISO/IEC 42001 compliance

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            WARIS Platform                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     PRESENTATION LAYER                           │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │    │
│  │  │  Web App  │  │ Dashboard │  │  Chat Bot │  │  Reports  │    │    │
│  │  │ (Next.js) │  │  (React)  │  │ (LLM Q&A) │  │   (PDF)   │    │    │
│  │  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘    │    │
│  └────────┼──────────────┼──────────────┼──────────────┼──────────┘    │
│           │              │              │              │                 │
│  ┌────────┴──────────────┴──────────────┴──────────────┴──────────┐    │
│  │                      API GATEWAY (FastAPI)                      │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │    │
│  │  │  Auth   │  │  Rate   │  │ Logging │  │ Routing │           │    │
│  │  │ (JWT)   │  │ Limiter │  │         │  │         │           │    │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘           │    │
│  └────────┬──────────────┬──────────────┬──────────────┬──────────┘    │
│           │              │              │              │                 │
│  ┌────────┴──────────────┴──────────────┴──────────────┴──────────┐    │
│  │                       SERVICE LAYER                             │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐   │    │
│  │  │  Water    │  │    AI     │  │    LLM    │  │  Report   │   │    │
│  │  │  Loss     │  │ Shadowing │  │  Service  │  │  Service  │   │    │
│  │  │  Service  │  │  Service  │  │  (70B+)   │  │           │   │    │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘   │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐   │    │
│  │  │   DMA     │  │   Alert   │  │    GIS    │  │   User    │   │    │
│  │  │  Service  │  │  Service  │  │  Service  │  │  Service  │   │    │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘   │    │
│  └────────┬──────────────┬──────────────┬──────────────┬──────────┘    │
│           │              │              │              │                 │
│  ┌────────┴──────────────┴──────────────┴──────────────┴──────────┐    │
│  │                        DATA LAYER                               │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐   │    │
│  │  │PostgreSQL │  │  MongoDB  │  │  Milvus   │  │   Redis   │   │    │
│  │  │  (Main)   │  │  (Docs)   │  │ (Vector)  │  │  (Cache)  │   │    │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘   │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│          ON-PREMISE (GPU Server)     │       G-CLOUD (Backup/Scale)     │
└─────────────────────────────────────────────────────────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │         EXTERNAL SYSTEMS            │
                    │  ┌─────────┐  ┌─────────────────┐  │
                    │  │  DMAMA  │  │  PWA Existing   │  │
                    │  │  System │  │     Systems     │  │
                    │  └─────────┘  └─────────────────┘  │
                    └─────────────────────────────────────┘
```

## Layer Descriptions

### 1. Presentation Layer

| Component | Technology | Purpose |
|-----------|------------|---------|
| Web App | Next.js 14+ | Main user interface |
| Dashboard | React + D3.js | Data visualization |
| Chat Bot | React + WebSocket | LLM-powered Q&A |
| Reports | PDF Generator | Automated reporting |

### 2. API Gateway

| Feature | Implementation | Purpose |
|---------|----------------|---------|
| Authentication | JWT + OAuth2 | User identity |
| Authorization | RBAC | Access control |
| Rate Limiting | Token bucket | API protection |
| Logging | Structured logs | Audit trail |

### 3. Service Layer

| Service | Responsibility |
|---------|----------------|
| Water Loss Service | NRW calculations, analysis |
| AI Shadowing Service | 4 AI models for predictions |
| LLM Service | 70B+ Thai language model |
| Report Service | Automated report generation |
| DMA Service | District Metered Area management |
| Alert Service | Notifications and alerts |
| GIS Service | Geographic data processing |
| User Service | User management |

### 4. Data Layer

| Database | Purpose | Data Type |
|----------|---------|-----------|
| PostgreSQL 16+ | Primary data | Structured (DMA, meters, users) |
| MongoDB 7+ | Documents | Unstructured (reports, logs) |
| Milvus | Vector DB | Embeddings (RAG) |
| Redis 7+ | Cache | Session, hot data |

## Deployment Architecture

### On-Premise (Primary)

```
┌─────────────────────────────────────────┐
│           GPU Server Cluster            │
├─────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │ GPU #1  │  │ GPU #2  │  │ GPU #3  │ │
│  │ LLM     │  │ AI Mod1 │  │ AI Mod2 │ │
│  └─────────┘  └─────────┘  └─────────┘ │
│  ┌─────────────────────────────────┐   │
│  │      Kubernetes Cluster         │   │
│  │  ┌───────┐ ┌───────┐ ┌───────┐ │   │
│  │  │ API   │ │ Web   │ │ Worker│ │   │
│  │  │ Pods  │ │ Pods  │ │ Pods  │ │   │
│  │  └───────┘ └───────┘ └───────┘ │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │        Storage (NVMe SSD)       │   │
│  │  PostgreSQL │ MongoDB │ Milvus  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### G-Cloud (Backup/Scale)

- Disaster recovery
- Burst capacity
- Data replication
- Backup storage

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14+ | React framework |
| React | 18+ | UI library |
| TypeScript | 5+ | Type safety |
| TailwindCSS | 3+ | Styling |
| shadcn/ui | Latest | Component library |
| Chart.js | 4+ | Charts |
| D3.js | 7+ | Visualizations |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.100+ | API framework |
| Python | 3.11+ | Backend language |
| Pydantic | 2+ | Validation |
| SQLAlchemy | 2+ | ORM |
| Celery | 5+ | Task queue |
| RabbitMQ | 3+ | Message broker |

### AI/ML

| Technology | Version | Purpose |
|------------|---------|---------|
| PyTorch | 2+ | Deep learning |
| TensorFlow | 2.15+ | ML framework |
| LangChain | 0.1+ | LLM orchestration |
| Ollama | Latest | Local LLM serving |
| Milvus | 2+ | Vector database |
| MLflow | 2+ | ML lifecycle |

### Infrastructure

| Technology | Version | Purpose |
|------------|---------|---------|
| Docker | 24+ | Containerization |
| Kubernetes | 1.28+ | Orchestration |
| Terraform | 1.6+ | IaC |
| GitHub Actions | - | CI/CD |
| Prometheus | 2+ | Monitoring |
| Grafana | 10+ | Dashboards |

## Security Architecture

### Authentication Flow

```
┌────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User  │────>│   Web   │────>│   API   │────>│  Auth   │
│        │<────│   App   │<────│ Gateway │<────│ Service │
└────────┘     └─────────┘     └─────────┘     └─────────┘
                                    │
                              ┌─────┴─────┐
                              │   JWT +   │
                              │  Refresh  │
                              │   Token   │
                              └───────────┘
```

### Security Layers

1. **Network** - Firewall, VPN, TLS 1.3
2. **Application** - JWT, RBAC, Input validation
3. **Data** - Encryption at rest, field-level encryption
4. **AI** - Guardrails, content filtering

## Performance Requirements

| Metric | Target |
|--------|--------|
| API Response | < 200ms (p95) |
| Dashboard Load | < 2s |
| LLM Response | < 5s |
| Report Generation | < 30s |
| Concurrent Users | 500+ |
| Data Retention | 5 years |

## Related Documents

- [Component Design](./components.md)
- [Data Flow](./data-flow.md)
- [Integration](./integration.md)
