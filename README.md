# WARIS - Water Loss Intelligent Analysis and Reporting System

<div align="center">

**ระบบวิเคราะห์และรายงานข้อมูลน้ำสูญเสียอัจฉริยะ**

[![Status](https://img.shields.io/badge/status-in_development-yellow)](https://github.com)
[![Version](https://img.shields.io/badge/version-0.1.0-blue)](https://github.com)
[![License](https://img.shields.io/badge/license-Proprietary-red)](LICENSE)

*Enterprise AI Platform for Water Loss Management*
*Provincial Waterworks Authority (กปภ.) - Government of Thailand*

[Features](#features) • [Architecture](#architecture) • [Quick Start](#quick-start) • [Documentation](#documentation)

</div>

---

## Overview

WARIS is an advanced AI-powered platform designed to analyze, predict, and report water loss data for the Provincial Waterworks Authority (PWA/กปภ.) of Thailand. The system integrates with existing DMAMA infrastructure, employs cutting-edge AI models including a 70B+ parameter Thai language model, and provides comprehensive analytics through an intuitive dashboard.

### Project Specifications

| Aspect | Details |
|--------|---------|
| **Budget** | 9.5M THB |
| **Timeline** | 270 days |
| **Client** | Provincial Waterworks Authority (กปภ.) |
| **Compliance** | PDPA, OWASP Top 10, ISO/IEC 42001 |
| **Deployment** | On-Premise (GPU Server) + G-Cloud (Backup) |
| **Language** | Thai (Primary), English (Technical) |

---

## Features

### Core Capabilities

#### 🤖 AI Shadowing Models (4 Types)
- **Anomaly Detection**: Real-time identification of unusual water consumption patterns
- **Pattern Recognition**: Historical trend analysis and pattern discovery
- **Classification**: Automatic categorization of water loss events
- **Time-Series Forecasting**: Future water loss predictions

#### 🧠 Thai Language LLM (70B+ Parameters)
- Natural language querying in Thai
- Intelligent report generation
- Conversational analytics interface
- Context-aware recommendations

#### 📊 Advanced RAG Pipeline
- Vector database integration (Milvus 2.6)
- Semantic search capabilities
- Knowledge base management
- Multi-modal data retrieval

#### 📈 Real-Time Dashboard
- Interactive water loss visualization
- DMA (District Metered Area) monitoring
- Alert management system
- Customizable reports and exports

#### 🔗 DMAMA Integration
- Seamless connection to existing PWA infrastructure
- Real-time data synchronization
- Bidirectional data flow
- Legacy system compatibility

---

## Architecture

### Technology Stack (Updated: January 2026)

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

### Key Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 16.x | Modern React framework with Turbopack |
| | React | 19.2 | UI library with Server Components |
| | TypeScript | 5.8 | Type-safe development |
| | TailwindCSS | 4.0 | Utility-first CSS framework |
| **Backend** | FastAPI | 0.124+ | High-performance Python API |
| | PostgreSQL | 18+ | Primary relational database |
| | MongoDB | 8.2 | Document storage with vector search |
| | Redis | 8.4 | Caching and real-time features |
| **AI/ML** | PyTorch | 2.10+ | Deep learning framework |
| | MLflow | 3.8 | ML experiment tracking |
| | Milvus | 2.6.5 | Vector database for RAG |
| | LangChain | 1.2 | LLM application framework |
| | Ollama | 0.12 | LLM deployment runtime |
| **Thai LLM** | OpenThaiGPT | 1.6/R1 | 32B reasoning model |
| | Typhoon 2 | 70B | 128K context Thai language model |
| **Infrastructure** | Kubernetes | 1.35 | Container orchestration |
| | Docker | Latest | Containerization |
| | Terraform | 1.14 | Infrastructure as Code |

---

## Quick Start

### Prerequisites

- **Node.js** 22 LTS or higher
- **Python** 3.12 or higher
- **Docker** & **Docker Compose** (latest)
- **PostgreSQL** 18+
- **MongoDB** 8.2+
- **Redis** 8.4+
- **GPU** (NVIDIA, CUDA-compatible) for AI models

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pwa-thailand/waris.git
   cd waris
   ```

2. **Install dependencies**
   ```bash
   # Frontend & Backend (Node.js)
   cd platform
   npm install

   # AI/ML (Python)
   cd apps/ai
   pip install -r requirements.txt
   cd ../api
   pip install -r requirements.txt
   ```

3. **Configure environment**
   ```bash
   # Copy environment template
   cp platform/.env.example platform/.env

   # Edit .env with your configuration
   nano platform/.env
   ```

4. **Start infrastructure services**
   ```bash
   cd platform/infra/docker
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   cd platform/apps/api
   alembic upgrade head
   ```

6. **Start development servers**
   ```bash
   cd platform
   npm run dev
   ```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **AI Services**: http://localhost:8001

### Docker Quick Start

```bash
# Start all services with Docker
cd platform/infra/docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Project Structure

```
waris/
├── .claude/                    # Claude Code AI configuration
│   ├── CLAUDE.md              # AI agent instructions
│   ├── settings.json          # Project settings
│   ├── skills/                # Slash commands
│   └── agents/                # Specialized AI agents
│
├── platform/                   # Main codebase
│   ├── apps/
│   │   ├── web/              # Next.js 16 frontend
│   │   │   ├── app/          # App router pages
│   │   │   ├── components/   # React components
│   │   │   ├── hooks/        # Custom hooks
│   │   │   ├── lib/          # Utilities
│   │   │   └── stores/       # State management
│   │   │
│   │   ├── api/              # FastAPI backend
│   │   │   ├── routers/      # API routes
│   │   │   ├── services/     # Business logic
│   │   │   ├── models/       # Pydantic models
│   │   │   ├── schemas/      # Database schemas
│   │   │   └── core/         # Config, security
│   │   │
│   │   └── ai/               # AI/ML services
│   │       ├── models/       # ML models
│   │       ├── inference/    # Inference services
│   │       ├── training/     # Training pipelines
│   │       ├── rag/          # RAG pipeline
│   │       └── notebooks/    # Jupyter notebooks
│   │
│   ├── packages/
│   │   └── shared/           # Shared types & utilities
│   │
│   ├── infra/
│   │   ├── docker/           # Docker Compose
│   │   ├── kubernetes/       # K8s manifests
│   │   └── terraform/        # Infrastructure as Code
│   │
│   └── scripts/              # Build/deploy scripts
│
└── docs/                      # Documentation
    ├── project-management/   # Project docs
    ├── architecture/         # System architecture
    ├── api/                  # API specifications
    ├── database/             # Database design
    ├── ai-ml/                # AI/ML documentation
    └── security/             # Security docs
```

---

## Development

### Available Commands

```bash
# Development
npm run dev              # Start all services (Turborepo)
npm run dev:web          # Frontend only
npm run dev:api          # Backend only

# Building
npm run build            # Build all apps
npm run build:web        # Build frontend
npm run build:api        # Build backend

# Testing
npm test                 # Run all tests
npm run test:web         # Frontend tests
pytest apps/api/         # Backend tests
pytest apps/ai/tests/    # AI tests

# Linting & Type Checking
npm run lint             # Lint all code
npm run typecheck        # Type check TypeScript
ruff check apps/api/     # Lint Python backend
mypy apps/api/           # Type check Python

# Database
alembic upgrade head     # Run migrations
alembic revision -m "msg" # Create new migration
```

### Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/WARIS-XXX-feature-name
   ```

2. **Review relevant documentation**
   - Architecture: [docs/architecture/](docs/architecture/)
   - API Design: [docs/api/](docs/api/)
   - Database: [docs/database/](docs/database/)

3. **Implement with tests**
   - Write tests first (TDD approach)
   - Follow coding standards (see [.claude/CLAUDE.md](.claude/CLAUDE.md))
   - Include Thai translations for user-facing features

4. **Run quality checks**
   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```

5. **Create pull request**
   - Reference TOR requirements if applicable
   - Update documentation
   - Request code review

---

## Documentation

### Quick Links

| Document | Description |
|----------|-------------|
| [Architecture Overview](docs/architecture/) | System design and components |
| [API Documentation](docs/api/) | REST API specifications |
| [Database Schema](docs/database/) | Data models and relationships |
| [AI/ML Documentation](docs/ai-ml/) | AI models and pipelines |
| [Security Guidelines](docs/security/) | OWASP and PDPA compliance |
| [Deployment Guide](docs/guides/deployment.md) | Production deployment |
| [Contributing Guide](docs/guides/contributing.md) | How to contribute |

### For Developers

- **Getting Started**: [docs/guides/getting-started.md](docs/guides/getting-started.md)
- **Development Guide**: [docs/guides/development.md](docs/guides/development.md)
- **Testing Strategy**: [docs/testing/strategy.md](docs/testing/strategy.md)
- **Coding Standards**: [.claude/CLAUDE.md](.claude/CLAUDE.md)

### For Project Managers

- **TOR Requirements**: [docs/requirements/tor.csv](docs/requirements/tor.csv)
- **Project Timeline**: [docs/project-management/03-timeline.md](docs/project-management/03-timeline.md)
- **Compliance Matrix**: [docs/project-management/02-tor-summary.md](docs/project-management/02-tor-summary.md)

---

## AI-Powered Development with Claude Code

This project is optimized for development with [Claude Code](https://claude.com/claude-code), featuring:

- **Specialized AI Agents**: 11 domain-specific agents (frontend, backend, ML, DevOps, etc.)
- **Director Command** (`/one`): Orchestrates multi-agent workflows
- **Smart Planning**: Automated task breakdown and dependency management
- **TOR Compliance**: Built-in compliance checking against project requirements

### Using Claude Code

```bash
# Project status and planning
/one status              # Show project status
/one plan [feature]      # Plan new feature
/one compliance          # Check TOR compliance

# Development
/one build [component]   # Build component
/one test [scope]        # Run tests
/one deploy [env]        # Deploy to environment

# AI/ML specific
/one train [model]       # Train AI model
/one analyze [dma]       # Analyze DMA data
```

Learn more: [.claude/CLAUDE.md](.claude/CLAUDE.md)

---

## Testing

### Test Coverage

- **Unit Tests**: Component and function-level tests
- **Integration Tests**: API and database integration
- **E2E Tests**: Full user flow testing
- **AI Model Tests**: Model accuracy and performance
- **Security Tests**: OWASP compliance validation

### Running Tests

```bash
# All tests
npm test

# Frontend tests
npm run test:web

# Backend tests
cd platform/apps/api
pytest

# AI/ML tests
cd platform/apps/ai
pytest tests/

# E2E tests
npm run test:e2e
```

---

## Deployment

### Environments

- **Development**: Local Docker Compose
- **Staging**: On-Premise Kubernetes Cluster
- **Production**: On-Premise (Primary) + G-Cloud (Backup)

### Production Deployment

```bash
# Using Kubernetes
cd platform/infra/kubernetes
kubectl apply -f production/

# Using Terraform
cd platform/infra/terraform
terraform init
terraform plan
terraform apply
```

See [Deployment Guide](docs/guides/deployment.md) for detailed instructions.

---

## Security

### Compliance Standards

- **PDPA**: Thai Personal Data Protection Act compliance
- **OWASP Top 10**: Web application security best practices
- **ISO/IEC 42001**: AI system management
- **Zero Trust**: Network security architecture

### Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- API rate limiting
- Input validation and sanitization
- Encrypted data at rest and in transit
- AI guardrails and output filtering
- Audit logging

---

## Contributing

We welcome contributions from the development team. Please follow these guidelines:

1. Read [Contributing Guide](docs/guides/contributing.md)
2. Follow [Coding Standards](.claude/CLAUDE.md)
3. Write tests for new features
4. Include Thai translations for UI changes
5. Update documentation as needed

### Code Quality Requirements

- Linting must pass (`npm run lint`)
- Type checking must pass (`npm run typecheck`)
- All tests must pass (`npm test`)
- Code review approval required
- TOR compliance verified (if applicable)

---

## Team

### Development Team

- **Project Director**: AI Orchestration & Planning
- **Frontend Team**: Next.js, React, UI/UX
- **Backend Team**: FastAPI, Database, APIs
- **AI/ML Team**: Model Training, RAG Pipeline, LLM
- **DevOps Team**: Infrastructure, CI/CD, Deployment
- **QA Team**: Testing, Quality Assurance
- **Security Team**: PDPA, OWASP Compliance

---

## License

This project is proprietary software developed for the Provincial Waterworks Authority (กปภ.) of Thailand.

**Copyright © 2026 Provincial Waterworks Authority**

Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.

---

## Support

### For Development Issues
- Create an issue in the project repository
- Contact the development team lead
- Review documentation at [docs/](docs/)

### For Production Issues
- Contact PWA IT Support
- Review [Troubleshooting Guide](docs/guides/troubleshooting.md)
- Check system logs and monitoring

---

## Acknowledgments

- **Provincial Waterworks Authority (กปภ.)** - Project sponsor and client
- **Development Team** - Core contributors
- **Thai AI Community** - Thai language model support

---

<div align="center">

**WARIS** - Water Loss Intelligent Analysis and Reporting System
*Empowering Water Management with Artificial Intelligence*

Provincial Waterworks Authority (การประปาส่วนภูมิภาค)
Government of Thailand

[Documentation](docs/) • [API Docs](http://localhost:8000/docs) • [Support](#support)

</div>
