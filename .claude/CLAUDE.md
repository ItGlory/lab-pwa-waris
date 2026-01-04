# WARIS - Claude Code Project Instructions

> **ระบบวิเคราะห์และรายงานข้อมูลน้ำสูญเสียอัจฉริยะ**
> Water Loss Intelligent Analysis and Reporting System
> สำหรับ การประปาส่วนภูมิภาค (กปภ.)

---

## Project Context

You are working on **WARIS**, an enterprise AI platform for water loss management. This is a government project for the Provincial Waterworks Authority (PWA/กปภ.) of Thailand with strict compliance requirements.

### Key Constraints
- **Budget**: 9.5M THB | **Timeline**: 270 days
- **Thai language** is PRIMARY for all user-facing content
- **Air-gapped LLM** deployment (no internet access for AI)
- **PDPA compliance** required (Thai data protection law)
- **OWASP security** standards mandatory

### Project Phase
Check `docs/project-management/03-timeline.md` for current phase and deliverables.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           WARIS PLATFORM                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  FRONTEND        │  BACKEND           │  AI/ML                         │
│  ─────────────   │  ─────────────     │  ─────────────                 │
│  Next.js 16      │  FastAPI 0.124+    │  4 AI Models (Shadowing)       │
│  React 19.2      │  Python 3.12+      │  LLM 70B+ (Thai)               │
│  TypeScript 5.8  │  PostgreSQL 18+    │  RAG Pipeline (Milvus 2.6)     │
│  TailwindCSS 4   │  MongoDB 8.2       │  MLflow 3.8                    │
│  shadcn/ui       │  Redis 8.4         │  PyTorch 2.10+                 │
├─────────────────────────────────────────────────────────────────────────┤
│  INFRASTRUCTURE: Docker | K8s 1.35 | Terraform 1.14 | GitHub Actions   │
│  AI AGENTS: LangChain 1.2 | LangGraph 1.0 | Ollama 0.12                │
│  DEPLOYMENT: On-Premise (GPU Server) + G-Cloud (Backup)                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### Tech Stack Details (Updated: January 2026)

| Category | Technology | Version | Key Features |
|----------|-----------|---------|--------------|
| **Frontend** | Next.js | 16.x | Turbopack stable, Cache Components, PPR |
| | React | 19.2 | Activity component, Server Components GA, useEffectEvent |
| | TypeScript | 5.8 | Node.js native support, improved perf |
| | TailwindCSS | 4.0 | CSS-first config, 5x faster builds, container queries |
| | shadcn/ui | Latest | Base UI 1.0 integration, Field component |
| **Backend** | FastAPI | 0.124+ | Python 3.12+, Pydantic v2.12, FastAPI Cloud |
| | Node.js | 22 LTS | Native TS support, WebSocket client, HTTP/3 |
| | PostgreSQL | 18+ | JSON_TABLE, incremental backup, virtual columns |
| | MongoDB | 8.2 | Vector search, hybrid search, 59% faster updates |
| | Redis | 8.4 | Vector sets, 87% faster commands, native JSON |
| **AI/ML** | PyTorch | 2.10+ | FlexAttention CPU, FP16 X86, Intel GPU |
| | MLflow | 3.8 | GenAI support, multi-turn eval, trace comparison |
| | Milvus | 2.6.5 | Struct in ARRAY, Storage Format V2, Boost Ranker |
| | LangChain | 1.2 | Agent-centric, create_agent API, content_blocks |
| | LangGraph | 1.0 | Stateful graphs, production-ready |
| | Ollama | 0.12 | Vulkan GPU, cloud models, Llama 4 support |
| **Thai LLM** | OpenThaiGPT | 1.6/R1 | 32B reasoning model, LIMO integration |
| | Typhoon 2 | 70B | 128K context, function calling |
| **Infra** | Kubernetes | 1.35 | In-place Pod updates GA, native workload identity |
| | Terraform | 1.14 | Ephemeral values, List Resources, Actions block |
| | Docker | Latest | Multi-platform builds |

---

## Directory Structure

```
mea-waris/
├── .claude/                    # Claude Code configuration
│   ├── CLAUDE.md              # THIS FILE - Main instructions
│   ├── settings.json          # Project settings
│   ├── skills/                # Slash commands (/one, /analyze, etc.)
│   ├── agents/                # Specialized agents
│   └── mcp/                   # MCP server configs
├── apps/
│   ├── web/                   # Next.js frontend (apps/web)
│   │   ├── app/              # App router pages
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities
│   │   └── stores/           # State management
│   ├── api/                   # FastAPI backend (apps/api)
│   │   ├── routers/          # API routes
│   │   ├── services/         # Business logic
│   │   ├── models/           # Pydantic models
│   │   ├── schemas/          # Database schemas
│   │   └── core/             # Config, security
│   └── ai/                    # AI services (apps/ai)
│       ├── models/           # ML models
│       ├── inference/        # Inference services
│       ├── training/         # Training pipelines
│       └── rag/              # RAG pipeline
├── packages/
│   └── shared/               # Shared types, utils
│       ├── types/            # TypeScript types
│       └── utils/            # Common utilities
├── infra/
│   ├── docker/               # Dockerfiles
│   ├── kubernetes/           # K8s manifests
│   └── terraform/            # IaC
├── docs/                      # Documentation
│   ├── project-management/   # PM docs
│   ├── architecture/         # Architecture
│   ├── api/                  # API specs
│   ├── database/             # DB design
│   ├── ai-ml/                # AI/ML docs
│   └── security/             # Security
└── scripts/                   # Build/deploy scripts
```

---

## Coding Standards

### TypeScript/JavaScript (Frontend)

```typescript
// File naming: kebab-case
// water-loss-chart.tsx, use-dma-data.ts

// Component naming: PascalCase
export function WaterLossChart({ dmaId }: WaterLossChartProps) { }

// Hook naming: camelCase with 'use' prefix
export function useDmaData(dmaId: string) { }

// Constants: SCREAMING_SNAKE_CASE
export const API_BASE_URL = '/api/v1';
export const MAX_RETRY_COUNT = 3;

// Types: PascalCase with descriptive suffix
interface DmaDataResponse { }
type WaterLossReading = { }

// Always use TypeScript strict mode
// Always define return types for functions
// Use Zod for runtime validation
```

### Python (Backend/AI)

```python
# File naming: snake_case
# water_loss_service.py, dma_router.py

# Class naming: PascalCase
class WaterLossService:
    pass

# Function/variable naming: snake_case
def calculate_water_loss(dma_id: str) -> float:
    pass

# Constants: SCREAMING_SNAKE_CASE
MAX_BATCH_SIZE = 1000
DEFAULT_TIMEOUT = 30

# Always use type hints
# Use Pydantic for data validation
# Use async/await for I/O operations
# Follow PEP 8 style guide
```

### Database

```sql
-- Table naming: snake_case, plural
CREATE TABLE water_loss_readings (...);
CREATE TABLE dma_alerts (...);

-- Column naming: snake_case
dma_id, created_at, loss_percentage

-- Index naming: idx_{table}_{columns}
CREATE INDEX idx_readings_dma_time ON water_loss_readings(dma_id, reading_time);

-- Foreign key naming: fk_{table}_{referenced_table}
CONSTRAINT fk_readings_dma FOREIGN KEY (dma_id) REFERENCES dmas(id)
```

---

## Thai Language Guidelines

### User Interface
```typescript
// Always provide Thai translations
const labels = {
  waterLoss: 'น้ำสูญเสีย',
  dma: 'พื้นที่จ่ายน้ำย่อย',
  alert: 'การแจ้งเตือน',
  report: 'รายงาน',
  dashboard: 'แดชบอร์ด',
  analysis: 'การวิเคราะห์',
  prediction: 'การคาดการณ์',
};

// Date formatting (Buddhist calendar)
formatDate(date) // "15 ม.ค. 2567"

// Number formatting
formatVolume(1234567) // "1,234,567 ลบ.ม."
formatPercent(0.125)  // "12.5%"
```

### API Responses
```json
{
  "message": "Success",
  "message_th": "สำเร็จ",
  "data": {
    "title": "Water Loss Report",
    "title_th": "รายงานน้ำสูญเสีย"
  }
}
```

### Error Messages
```python
# Always include Thai error messages
raise ValidationError(
    message="Invalid DMA ID",
    message_th="รหัส DMA ไม่ถูกต้อง"
)
```

---

## Development Workflows

### Starting New Feature
```bash
# 1. Create feature branch
git checkout -b feature/WARIS-XXX-feature-name

# 2. Check documentation first
# Read: docs/architecture/01-overview.md
# Read: docs/api/01-overview.md (if API work)

# 3. Use /one to plan
/one plan [feature-name]

# 4. Implement with TDD approach
# Write tests first, then implementation
```

### Component Development (Frontend)
```bash
# 1. Create component file
apps/web/components/dashboard/water-loss-card.tsx

# 2. Create types
packages/shared/types/water-loss.ts

# 3. Create hook if needed
apps/web/hooks/use-water-loss.ts

# 4. Add to Storybook (if visual component)
apps/web/stories/water-loss-card.stories.tsx
```

### API Development (Backend)
```bash
# 1. Define schema
apps/api/schemas/water_loss.py

# 2. Create Pydantic models
apps/api/models/water_loss.py

# 3. Implement service
apps/api/services/water_loss_service.py

# 4. Create router
apps/api/routers/water_loss.py

# 5. Write tests
apps/api/tests/test_water_loss.py
```

### AI Model Development
```bash
# 1. Document approach in docs/ai-ml/
# 2. Create notebook for exploration
apps/ai/notebooks/anomaly_detection_exploration.ipynb

# 3. Implement training pipeline
apps/ai/training/anomaly_detection/

# 4. Create inference service
apps/ai/inference/anomaly_detection_service.py

# 5. Register in MLflow
# 6. Write evaluation tests
```

---

## Quality Checklist

### Before Committing
- [ ] Code follows naming conventions
- [ ] TypeScript/Python types are complete
- [ ] Thai translations included (if user-facing)
- [ ] Unit tests written and passing
- [ ] No hardcoded secrets or credentials
- [ ] No console.log/print statements (use logger)
- [ ] Error handling is comprehensive

### Before PR
- [ ] All tests passing (`npm test`, `pytest`)
- [ ] Linting passes (`npm run lint`, `ruff check`)
- [ ] Type checking passes (`npm run typecheck`, `mypy`)
- [ ] Documentation updated if needed
- [ ] TOR compliance verified (if applicable)

---

## /one - Director Commands

The `/one` command is your primary orchestrator:

```bash
# Project Status
/one status              # Show overall project status
/one compliance          # Check TOR compliance

# Planning
/one plan [feature]      # Plan feature implementation
/one review              # Review current work

# Development
/one build [component]   # Build specific component
/one test [scope]        # Run tests
/one deploy [env]        # Deploy to environment

# AI/ML
/one train [model]       # Train AI model
/one analyze [dma]       # Analyze DMA water loss

# Orchestration
/one delegate [task]     # Delegate to specific agent
/one coordinate          # Multi-agent coordination
```

---

## Agent Reference

| Agent | Use For |
|-------|---------|
| `director` | Orchestration, planning, coordination |
| `data-engineer` | ETL, data pipelines, DMAMA integration |
| `ml-engineer` | AI models (anomaly, pattern, classification, time-series) |
| `llm-specialist` | LLM deployment, RAG pipeline, Thai NLP |
| `frontend-developer` | Next.js, React, Dashboard, Thai UI |
| `backend-developer` | FastAPI, APIs, WebSocket |
| `devops-engineer` | Docker, K8s, CI/CD, infrastructure |
| `security-specialist` | OWASP, PDPA, authentication |
| `database-architect` | PostgreSQL, MongoDB, Milvus, Redis |
| `qa-engineer` | Testing, quality assurance |
| `documentation-specialist` | Docs, training materials |

---

## Important Files

| File | Purpose |
|------|---------|
| `docs/requirements/tor.csv` | Original TOR requirements |
| `docs/project-management/02-tor-summary.md` | TOR implementation mapping |
| `docs/architecture/01-overview.md` | System architecture |
| `docs/api/01-overview.md` | API design |
| `docs/database/01-overview.md` | Database schema |
| `docs/ai-ml/01-overview.md` | AI/ML system design |
| `docs/security/01-overview.md` | Security requirements |

---

## Environment Setup

```bash
# Required environment variables
DATABASE_URL=postgresql://user:pass@localhost:5432/waris
MONGODB_URL=mongodb://localhost:27017/waris
REDIS_URL=redis://localhost:6379
MILVUS_HOST=localhost
MILVUS_PORT=19530
LLM_SERVER_URL=http://localhost:8080
JWT_SECRET=your-secret-key
```

---

## Common Commands

```bash
# Development
npm run dev              # Start frontend dev server
uvicorn main:app --reload  # Start backend dev server

# Testing
npm test                 # Frontend tests
pytest                   # Backend tests
pytest apps/ai/tests/    # AI tests

# Linting
npm run lint             # Frontend lint
ruff check apps/api/     # Backend lint

# Type checking
npm run typecheck        # Frontend types
mypy apps/api/           # Backend types

# Database
alembic upgrade head     # Run migrations
alembic revision -m "msg" # Create migration

# Docker
docker-compose up -d     # Start all services
docker-compose logs -f   # View logs
```

---

## Security Reminders

- **NEVER** commit secrets or API keys
- **NEVER** log sensitive data (passwords, tokens)
- **ALWAYS** validate user input
- **ALWAYS** use parameterized queries
- **ALWAYS** implement rate limiting on APIs
- **ALWAYS** use HTTPS in production
- AI responses must go through guardrails

---

## Need Help?

1. **Architecture questions**: Read `docs/architecture/`
2. **API design**: Read `docs/api/01-overview.md`
3. **Database schema**: Read `docs/database/01-overview.md`
4. **AI/ML approach**: Read `docs/ai-ml/01-overview.md`
5. **TOR requirements**: Read `docs/project-management/02-tor-summary.md`

Use `/one plan [topic]` to get Claude to analyze and plan any implementation.
