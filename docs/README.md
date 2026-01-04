# WARIS Documentation

> Water Loss Intelligent Analysis and Reporting System

## Overview

WARIS is an AI-powered platform for analyzing and reporting water loss data for the Provincial Waterworks Authority (กปภ.) of Thailand.

## Documentation Index

### Requirements

| Document | Description |
|----------|-------------|
| [TOR Requirements](./requirements/tor.csv) | Terms of Reference (ข้อกำหนดขอบเขตงาน) |
| [Functional Requirements](./requirements/functional.md) | Feature specifications |
| [Non-Functional Requirements](./requirements/non-functional.md) | Performance, security, scalability |

### Architecture

| Document | Description |
|----------|-------------|
| [System Overview](./architecture/overview.md) | High-level system architecture |
| [Component Design](./architecture/components.md) | Detailed component specifications |
| [Data Flow](./architecture/data-flow.md) | Data pipeline and flow diagrams |
| [Integration](./architecture/integration.md) | External system integrations (DMAMA) |

### API

| Document | Description |
|----------|-------------|
| [API Overview](./api/overview.md) | REST API design principles |
| [Authentication](./api/authentication.md) | Auth flow and security |
| [Endpoints](./api/endpoints.md) | API endpoint specifications |
| [OpenAPI Spec](./api/openapi.yaml) | OpenAPI 3.0 specification |

### Database

| Document | Description |
|----------|-------------|
| [Schema Overview](./database/overview.md) | Database architecture |
| [ERD](./database/erd.md) | Entity relationship diagrams |
| [Tables](./database/tables.md) | Table definitions |
| [Migrations](./database/migrations.md) | Migration strategy |

### AI/ML

| Document | Description |
|----------|-------------|
| [AI Overview](./ai-ml/overview.md) | AI/ML system architecture |
| [Models](./ai-ml/models.md) | AI Shadowing models (4 types) |
| [LLM](./ai-ml/llm.md) | LLM 70B+ Thai language |
| [RAG](./ai-ml/rag.md) | RAG engine with Milvus |
| [Training](./ai-ml/training.md) | Model training pipeline |

### Infrastructure

| Document | Description |
|----------|-------------|
| [Overview](./infrastructure/overview.md) | Infrastructure architecture |
| [On-Premise](./infrastructure/on-premise.md) | GPU server setup |
| [G-Cloud](./infrastructure/g-cloud.md) | Government cloud backup |
| [Docker](./infrastructure/docker.md) | Container configurations |
| [Kubernetes](./infrastructure/kubernetes.md) | K8s deployment |

### Guides

| Document | Description |
|----------|-------------|
| [Getting Started](./guides/getting-started.md) | Quick start guide |
| [Development](./guides/development.md) | Development workflow |
| [Deployment](./guides/deployment.md) | Deployment procedures |
| [Contributing](./guides/contributing.md) | Contribution guidelines |

### Testing

| Document | Description |
|----------|-------------|
| [Testing Strategy](./testing/strategy.md) | Overall testing approach |
| [Unit Tests](./testing/unit.md) | Unit testing guidelines |
| [Integration Tests](./testing/integration.md) | Integration testing |
| [E2E Tests](./testing/e2e.md) | End-to-end testing |

### Design

| Document | Description |
|----------|-------------|
| [Brand Guidelines](./design/brand-guidelines.md) | PWA branding |
| [UI/UX](./design/ui-ux.md) | Design system |
| [Components](./design/components.md) | UI component library |

## TOR Compliance Matrix

| TOR Section | Document | Status |
|-------------|----------|--------|
| 4.1 Project Management | [Architecture](./architecture/overview.md) | Planned |
| 4.2 Hybrid Architecture | [Infrastructure](./infrastructure/overview.md) | Planned |
| 4.3 DMAMA Integration | [Integration](./architecture/integration.md) | Planned |
| 4.4 Centralized Database | [Database](./database/overview.md) | Planned |
| 4.5.1 AI Shadowing | [AI Models](./ai-ml/models.md) | Planned |
| 4.5.2 LLM 70B+ Thai | [LLM](./ai-ml/llm.md) | Planned |
| 4.5.3 Notifications | [API](./api/endpoints.md) | Planned |
| 4.5.4 Dashboard/Reports | [Components](./architecture/components.md) | Planned |
| 4.5.5 ISO/IEC 42001 | [AI Overview](./ai-ml/overview.md) | Planned |
| 4.5.6 AI Guardrails | [AI Overview](./ai-ml/overview.md) | Planned |
| 4.6 System Testing | [Testing](./testing/strategy.md) | Planned |
| 4.7 Training (40 users) | [Guides](./guides/getting-started.md) | Planned |

## Quick Links

- **Source Code:** [GitHub Repository](#)
- **API Docs:** [Swagger UI](#)
- **Design System:** [Storybook](#)

---

*Provincial Waterworks Authority (การประปาส่วนภูมิภาค)*
