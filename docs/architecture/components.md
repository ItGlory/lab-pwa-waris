# Component Design

## Component Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        WARIS Components                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  APPS                          SERVICES                          │
│  ┌─────────────────┐          ┌─────────────────┐               │
│  │ apps/web        │          │ Water Loss      │               │
│  │ apps/api        │          │ AI Shadowing    │               │
│  │ apps/ai         │          │ LLM Service     │               │
│  └─────────────────┘          │ Report Service  │               │
│                               │ Alert Service   │               │
│  PACKAGES                     │ DMA Service     │               │
│  ┌─────────────────┐          └─────────────────┘               │
│  │ packages/shared │                                             │
│  │ packages/ui     │          MCP SERVERS                        │
│  │ packages/config │          ┌─────────────────┐               │
│  └─────────────────┘          │ waris-database  │               │
│                               │ waris-llm       │               │
│  INFRA                        │ waris-vector-db │               │
│  ┌─────────────────┐          │ waris-gis       │               │
│  │ infra/docker    │          └─────────────────┘               │
│  │ infra/k8s       │                                             │
│  │ infra/terraform │                                             │
│  └─────────────────┘                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Apps

### apps/web (Next.js Frontend)

**Purpose:** Main user interface for WARIS platform

**Structure:**
```
apps/web/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (auth)/            # Auth routes (login, register)
│   │   ├── (dashboard)/       # Dashboard routes
│   │   ├── api/               # API routes (BFF)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── charts/            # Chart components
│   │   ├── maps/              # GIS/Map components
│   │   └── forms/             # Form components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities
│   ├── services/              # API client services
│   └── types/                 # TypeScript types
├── public/
│   └── assets/
├── next.config.js
├── tailwind.config.js
└── package.json
```

**Key Features:**
- Server-side rendering (SSR)
- Thai language support (i18n)
- PWA capabilities
- Responsive design
- Dark mode support

### apps/api (FastAPI Backend)

**Purpose:** REST API backend for all services

**Structure:**
```
apps/api/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── users/         # User management
│   │   │   ├── dma/           # DMA endpoints
│   │   │   ├── water-loss/    # Water loss analysis
│   │   │   ├── reports/       # Report generation
│   │   │   ├── alerts/        # Alert management
│   │   │   └── chat/          # LLM chat endpoints
│   │   └── deps.py            # Dependencies
│   ├── core/
│   │   ├── config.py          # Configuration
│   │   ├── security.py        # Security utilities
│   │   └── logging.py         # Logging setup
│   ├── db/
│   │   ├── session.py         # Database session
│   │   └── base.py            # Base models
│   ├── models/                # SQLAlchemy models
│   ├── schemas/               # Pydantic schemas
│   ├── services/              # Business logic
│   └── main.py
├── migrations/                # Alembic migrations
├── tests/
├── pyproject.toml
└── Dockerfile
```

**Key Features:**
- OpenAPI 3.0 documentation
- JWT authentication
- Role-based access control
- Request validation
- Rate limiting
- Background tasks (Celery)

### apps/ai (AI/ML Services)

**Purpose:** AI model serving and training

**Structure:**
```
apps/ai/
├── models/
│   ├── shadowing/             # AI Shadowing models (4 types)
│   │   ├── leak_detection/
│   │   ├── demand_forecast/
│   │   ├── pressure_anomaly/
│   │   └── pipe_failure/
│   └── embeddings/            # Text embeddings
├── services/
│   ├── inference.py           # Model inference
│   ├── training.py            # Model training
│   └── preprocessing.py       # Data preprocessing
├── llm/
│   ├── ollama_client.py       # Ollama integration
│   ├── prompts/               # Prompt templates
│   └── rag/                   # RAG implementation
├── pipelines/
│   ├── training_pipeline.py
│   └── inference_pipeline.py
├── pyproject.toml
└── Dockerfile
```

**AI Shadowing Models (TOR 4.5.1):**

| Model | Purpose | Input | Output |
|-------|---------|-------|--------|
| Leak Detection | Detect potential leaks | Flow, pressure data | Leak probability, location |
| Demand Forecast | Predict water demand | Historical usage | 24h/7d/30d forecast |
| Pressure Anomaly | Detect pressure issues | Pressure readings | Anomaly score, alerts |
| Pipe Failure | Predict pipe failures | Age, material, history | Failure risk score |

## Packages

### packages/shared

**Purpose:** Shared utilities and types

```
packages/shared/
├── src/
│   ├── types/                 # Shared TypeScript types
│   ├── utils/                 # Utility functions
│   ├── constants/             # Shared constants
│   └── validators/            # Validation schemas
├── package.json
└── tsconfig.json
```

### packages/ui

**Purpose:** Shared UI component library

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Table/
│   │   ├── Chart/
│   │   └── ...
│   ├── styles/
│   │   └── globals.css
│   └── index.ts
├── package.json
└── tsconfig.json
```

### packages/config

**Purpose:** Shared configuration (ESLint, TypeScript, Tailwind)

```
packages/config/
├── eslint/
├── typescript/
├── tailwind/
└── package.json
```

## Services (Domain)

### Water Loss Service

**Responsibility:** Calculate and analyze Non-Revenue Water (NRW)

**Key Functions:**
- Calculate NRW percentage
- Identify high-loss DMAs
- Track loss trends
- Generate loss reports

**Formulas:**
```
NRW (%) = (System Input - Billed Consumption) / System Input × 100

ILI = Current Annual Real Losses / Unavoidable Annual Real Losses

CARL = System Input - Authorized Consumption
```

### AI Shadowing Service

**Responsibility:** Run AI models for predictions

**Key Functions:**
- Load and serve 4 AI models
- Batch inference
- Real-time predictions
- Model versioning

### LLM Service

**Responsibility:** Thai language LLM for Q&A

**Key Functions:**
- Natural language queries
- Document summarization
- Report generation assistance
- Thai language understanding

**Model Requirements (TOR 4.5.2):**
- Size: 70B+ parameters
- Language: Thai native support
- Context: 8K+ tokens
- Deployment: Local (Ollama)

### Report Service

**Responsibility:** Generate automated reports

**Report Types:**
- Daily water loss summary
- Weekly DMA performance
- Monthly executive report
- Annual compliance report

**Output Formats:**
- PDF (primary)
- Excel
- HTML

### Alert Service

**Responsibility:** Notifications and alerts

**Alert Types:**
- High water loss warning
- Leak detection alert
- System anomaly
- Scheduled maintenance

**Channels:**
- Email
- SMS
- LINE Notify
- In-app notification

## MCP Servers

### waris-database

**Purpose:** Centralized database access

**Capabilities:**
- Query execution
- Schema introspection
- Data export
- Connection pooling

### waris-llm

**Purpose:** LLM interaction via MCP

**Capabilities:**
- Chat completion
- Embeddings generation
- Prompt templates
- Context management

### waris-vector-db

**Purpose:** Vector database operations

**Capabilities:**
- Similarity search
- Index management
- Embedding storage
- RAG retrieval

### waris-gis

**Purpose:** GIS data access

**Capabilities:**
- Map data queries
- Spatial analysis
- DMA boundaries
- Pipe network data

## Infrastructure Components

### Docker

| Container | Purpose | Ports |
|-----------|---------|-------|
| waris-web | Next.js frontend | 3000 |
| waris-api | FastAPI backend | 8000 |
| waris-ai | AI services | 8001 |
| waris-llm | Ollama LLM | 11434 |
| postgres | Primary database | 5432 |
| mongodb | Document store | 27017 |
| milvus | Vector database | 19530 |
| redis | Cache | 6379 |
| rabbitmq | Message queue | 5672 |

### Kubernetes

| Resource | Purpose |
|----------|---------|
| Deployment | Application pods |
| Service | Internal networking |
| Ingress | External access |
| ConfigMap | Configuration |
| Secret | Sensitive data |
| PVC | Persistent storage |
| HPA | Auto-scaling |

## Related Documents

- [System Overview](./overview.md)
- [Data Flow](./data-flow.md)
- [API Endpoints](../api/endpoints.md)
