# System Architecture Overview
# ภาพรวมสถาปัตยกรรมระบบ

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    WARIS PLATFORM                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────────────────────────── PRESENTATION LAYER ─────────────────────────────┐│
│  │                                                                                  ││
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      ││
│  │  │   Web App   │    │  Dashboard  │    │  Chat Bot   │    │   Reports   │      ││
│  │  │  (Next.js)  │    │  (React)    │    │  (LLM Q&A)  │    │   Viewer    │      ││
│  │  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘      ││
│  │         │                  │                  │                  │              ││
│  └─────────┴──────────────────┴──────────────────┴──────────────────┴──────────────┘│
│                                         │                                            │
│  ┌──────────────────────────────── API GATEWAY LAYER ──────────────────────────────┐│
│  │                                                                                  ││
│  │  ┌─────────────────────────────────────────────────────────────────────────┐   ││
│  │  │                         FastAPI Gateway                                  │   ││
│  │  │  • Authentication (JWT/OAuth2)    • Rate Limiting                       │   ││
│  │  │  • Request Routing                • Response Caching                    │   ││
│  │  │  • Load Balancing                 • API Versioning                      │   ││
│  │  └─────────────────────────────────────────────────────────────────────────┘   ││
│  │                                                                                  ││
│  └──────────────────────────────────────────────────────────────────────────────────┘│
│                                         │                                            │
│  ┌──────────────────────────────── SERVICE LAYER ───────────────────────────────────┐│
│  │                                                                                  ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            ││
│  │  │   Water     │  │   AI        │  │   LLM       │  │   Report    │            ││
│  │  │   Loss      │  │   Inference │  │   Service   │  │   Service   │            ││
│  │  │   Service   │  │   Service   │  │   (70B+)    │  │             │            ││
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            ││
│  │         │                │                │                │                    ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            ││
│  │  │   Alert     │  │   User      │  │   RAG       │  │   GIS       │            ││
│  │  │   Service   │  │   Service   │  │   Service   │  │   Service   │            ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘            ││
│  │                                                                                  ││
│  └──────────────────────────────────────────────────────────────────────────────────┘│
│                                         │                                            │
│  ┌──────────────────────────────── DATA LAYER ──────────────────────────────────────┐│
│  │                                                                                  ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            ││
│  │  │ PostgreSQL  │  │  MongoDB    │  │   Milvus    │  │   Redis     │            ││
│  │  │ (Primary)   │  │  (Documents)│  │ (Vectors)   │  │  (Cache)    │            ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘            ││
│  │                                                                                  ││
│  └──────────────────────────────────────────────────────────────────────────────────┘│
│                                         │                                            │
│  ┌──────────────────────────────── INTEGRATION LAYER ───────────────────────────────┐│
│  │                                                                                  ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            ││
│  │  │   DMAMA     │  │   GIS       │  │   Billing   │  │   IoT       │            ││
│  │  │   System    │  │   System    │  │   System    │  │   Sensors   │            ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘            ││
│  │                                                                                  ││
│  └──────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                      │
├──────────────────────────────────────────────────────────────────────────────────────┤
│          ON-PREMISE (GPU Server)           │         G-CLOUD (Backup/Scale)         │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Architecture Principles

### 1. Hybrid Architecture
- Primary processing on-premise (GPU server)
- Backup and scaling on G-Cloud
- No vendor lock-in
- Data portability between environments

### 2. Microservices Design
- Loosely coupled services
- Independent deployment
- Service-specific scaling
- Technology agnostic

### 3. Security by Design
- Zero trust network
- Encryption at rest and in transit
- Role-based access control
- Air-gapped LLM deployment

### 4. Thai Language First
- Thai as primary language
- English as secondary
- Thai-optimized LLM

---

## Component Overview

### Presentation Layer
| Component | Technology | Purpose |
|-----------|------------|---------|
| Web App | Next.js 14+ | Main web application |
| Dashboard | React + D3.js | Data visualization |
| Chat Bot | React + WebSocket | LLM Q&A interface |
| Reports | React-PDF | Report generation/viewing |

### API Gateway
| Feature | Implementation |
|---------|----------------|
| Authentication | JWT + OAuth2 |
| Rate Limiting | Redis-based |
| Caching | Redis |
| Load Balancing | Nginx/Traefik |

### Service Layer
| Service | Responsibility |
|---------|----------------|
| Water Loss Service | DMA data, analysis |
| AI Inference Service | Model predictions |
| LLM Service | Chat completions, RAG |
| Report Service | Report generation |
| Alert Service | Notifications |
| User Service | Authentication, authorization |
| RAG Service | Document retrieval |
| GIS Service | Spatial data |

### Data Layer
| Database | Purpose | Data Types |
|----------|---------|------------|
| PostgreSQL | Primary storage | Structured data, time-series |
| MongoDB | Document storage | Reports, logs, unstructured |
| Milvus | Vector database | Embeddings, semantic search |
| Redis | Cache, sessions | Hot data, real-time |

### Integration Layer
| System | Integration Method |
|--------|-------------------|
| DMAMA | API / Direct DB / Files |
| GIS | API |
| Billing | API |
| IoT Sensors | MQTT / API |

---

## Technology Stack

### Frontend
```yaml
Framework: Next.js 14+
Language: TypeScript
Styling: TailwindCSS
Components: shadcn/ui
Charts: Chart.js, D3.js
State: Zustand/TanStack Query
```

### Backend
```yaml
Framework: FastAPI
Language: Python 3.11+
Secondary: Node.js 20+
ORM: SQLAlchemy
Validation: Pydantic
```

### AI/ML
```yaml
Framework: PyTorch 2+, TensorFlow 2.15+
LLM: Ollama, vLLM
RAG: LangChain
Vector DB: Milvus
ML Ops: MLflow
```

### Infrastructure
```yaml
Container: Docker
Orchestration: Kubernetes
IaC: Terraform
CI/CD: GitHub Actions
Monitoring: Prometheus + Grafana
```

---

## Data Flow

### Real-time Flow
```
Sensors → DMAMA → ETL → PostgreSQL → AI Service → Alert Service → User
                           ↓
                        Milvus (embeddings)
```

### Analysis Flow
```
User Query → API Gateway → RAG Service → Milvus → LLM Service → Response
                                            ↓
                                     PostgreSQL (context)
```

### Report Flow
```
Schedule/Request → Report Service → Data Aggregation → Template → PDF/DOCX
                                          ↓
                                    AI Summary (LLM)
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     KUBERNETES CLUSTER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Ingress   │  │   Ingress   │  │   Ingress   │              │
│  │   (Web)     │  │   (API)     │  │   (Admin)   │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│  ┌──────┴────────────────┴────────────────┴──────┐              │
│  │              Service Mesh (Istio)             │              │
│  └──────┬────────────────┬────────────────┬──────┘              │
│         │                │                │                      │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐              │
│  │  Frontend   │  │   Backend   │  │     AI      │              │
│  │   Pods      │  │    Pods     │  │    Pods     │              │
│  │  (HPA)      │  │   (HPA)     │  │  (GPU)      │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Persistent Storage                    │    │
│  │   PostgreSQL │ MongoDB │ Milvus │ Redis │ MinIO         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Non-Functional Requirements

| Requirement | Target | Implementation |
|-------------|--------|----------------|
| Availability | 99.5% | K8s HA, failover |
| Response Time | < 2s (API) | Caching, optimization |
| Scalability | 100+ concurrent users | HPA, load balancing |
| Security | OWASP compliant | WAF, encryption |
| Data Retention | 60 days (alerts) | Archive policies |
