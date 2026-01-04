# Development Guide

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 20+ | Frontend, tooling |
| pnpm | 8+ | Package manager |
| Python | 3.11+ | Backend, AI |
| Docker | 24+ | Containerization |
| Git | 2.40+ | Version control |

### Optional Software

| Software | Version | Purpose |
|----------|---------|---------|
| CUDA | 12+ | GPU acceleration |
| kubectl | 1.28+ | Kubernetes CLI |
| Terraform | 1.6+ | Infrastructure |

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/pwa-th/waris.git
cd waris
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

### 4. Start Development Services

```bash
# Start all services with Docker
docker compose up -d

# Or start individually
pnpm dev:web    # Frontend
pnpm dev:api    # Backend
pnpm dev:ai     # AI services
```

### 5. Verify Installation

```bash
# Check health endpoints
curl http://localhost:3000/health  # Web
curl http://localhost:8000/health  # API
```

## Project Structure

```
waris/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/        # App Router pages
│   │   │   ├── components/ # React components
│   │   │   ├── hooks/      # Custom hooks
│   │   │   ├── lib/        # Utilities
│   │   │   └── services/   # API clients
│   │   └── package.json
│   ├── api/                 # FastAPI backend
│   │   ├── app/
│   │   │   ├── api/        # API routes
│   │   │   ├── core/       # Config, security
│   │   │   ├── db/         # Database
│   │   │   ├── models/     # SQLAlchemy models
│   │   │   ├── schemas/    # Pydantic schemas
│   │   │   └── services/   # Business logic
│   │   └── pyproject.toml
│   └── ai/                  # AI/ML services
│       ├── models/         # Model code
│       ├── services/       # Inference services
│       └── pyproject.toml
├── packages/
│   ├── shared/             # Shared TypeScript
│   ├── ui/                 # Component library
│   └── config/             # Shared configs
├── infra/
│   ├── docker/             # Docker files
│   ├── kubernetes/         # K8s manifests
│   └── terraform/          # IaC
└── docs/                   # Documentation
```

## Development Workflow

### Branch Strategy

```
main              # Production-ready
├── develop       # Development integration
├── feature/*     # New features
├── fix/*         # Bug fixes
├── release/*     # Release preparation
└── hotfix/*      # Production hotfixes
```

### Branch Naming

```bash
feature/WARIS-123-add-leak-detection
fix/WARIS-456-fix-nrw-calculation
release/v1.2.0
hotfix/v1.1.1
```

### Commit Messages

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactor
- `test`: Tests
- `chore`: Maintenance

Example:
```
feat(api): add NRW calculation endpoint

- Implement POST /v1/analysis/nrw/calculate
- Add validation for date ranges
- Include unit tests

Closes WARIS-123
```

## Frontend Development

### Running the Frontend

```bash
cd apps/web
pnpm dev
```

### Component Development

```tsx
// src/components/DMACard.tsx
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface DMACardProps {
  dma: DMA;
  onClick?: () => void;
}

export function DMACard({ dma, onClick }: DMACardProps) {
  return (
    <Card onClick={onClick} className="cursor-pointer hover:shadow-lg">
      <CardHeader>
        <h3 className="font-thai text-lg">{dma.name_th}</h3>
        <p className="text-sm text-muted-foreground">{dma.code}</p>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          <span>NRW:</span>
          <span className={dma.nrw > 20 ? 'text-red-500' : 'text-green-500'}>
            {dma.nrw}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
```

### API Integration

```tsx
// src/services/dma.ts
import { apiClient } from '@/lib/api';

export const dmaService = {
  async list(params?: DMAListParams) {
    const response = await apiClient.get<DMAListResponse>('/dmas', { params });
    return response.data;
  },

  async get(id: string) {
    const response = await apiClient.get<DMAResponse>(`/dmas/${id}`);
    return response.data;
  },

  async getStats(id: string, params: StatsParams) {
    const response = await apiClient.get<StatsResponse>(
      `/dmas/${id}/stats`,
      { params }
    );
    return response.data;
  },
};
```

## Backend Development

### Running the Backend

```bash
cd apps/api
uvicorn app.main:app --reload --port 8000
```

### Creating an Endpoint

```python
# app/api/v1/dmas.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.dma import DMAResponse, DMAListResponse
from app.services.dma import DMAService

router = APIRouter(prefix="/dmas", tags=["DMAs"])


@router.get("", response_model=DMAListResponse)
async def list_dmas(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    region_id: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """List all DMAs with pagination and filtering."""
    service = DMAService(db)
    return await service.list(
        page=page,
        per_page=per_page,
        region_id=region_id,
    )


@router.get("/{dma_id}", response_model=DMAResponse)
async def get_dma(
    dma_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get DMA by ID."""
    service = DMAService(db)
    return await service.get(dma_id)
```

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "add_nrw_table"

# Run migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Testing

### Frontend Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:coverage
```

### Backend Tests

```bash
# Run all tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# Specific test
pytest tests/test_dma.py -v
```

### Writing Tests

```python
# tests/test_dma.py
import pytest
from httpx import AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_list_dmas():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/v1/dmas")

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "data" in data
    assert "pagination" in data
```

## Code Quality

### Linting

```bash
# Frontend
pnpm lint
pnpm lint:fix

# Backend
ruff check .
ruff format .
```

### Type Checking

```bash
# Frontend
pnpm typecheck

# Backend
mypy app
```

### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.9
    hooks:
      - id: ruff
      - id: ruff-format

  - repo: local
    hooks:
      - id: typecheck
        name: typecheck
        entry: pnpm typecheck
        language: system
        pass_filenames: false
```

## Debugging

### Frontend Debugging

1. Use React DevTools
2. Check browser console
3. Use `console.log` or debugger
4. VSCode debugging with launch.json

### Backend Debugging

```python
# Using debugger
import debugpy
debugpy.listen(5678)
debugpy.wait_for_client()

# Or use print/logging
import logging
logging.debug("Debug message")
```

### Database Debugging

```bash
# Connect to PostgreSQL
psql -h localhost -U waris_app -d waris

# Check query performance
EXPLAIN ANALYZE SELECT * FROM dma.dmas WHERE region_id = 'uuid';
```

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/waris
MONGODB_URL=mongodb://localhost:27017/waris
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60

# External APIs
DMAMA_API_URL=https://dmama.pwa.co.th/api
DMAMA_API_KEY=your-api-key
```

### Development Overrides

```bash
# .env.local (not committed)
DEBUG=true
LOG_LEVEL=debug
MOCK_EXTERNAL_APIS=true
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Port in use | `lsof -i :3000` then `kill -9 <pid>` |
| DB connection failed | Check Docker, verify .env |
| Module not found | `pnpm install` or `pip install -r requirements.txt` |
| Permission denied | Check file permissions, Docker socket |

### Getting Help

1. Check existing documentation
2. Search GitHub issues
3. Ask in team chat
4. Create new issue with details

## Related Documents

- [Getting Started](./getting-started.md)
- [Deployment](./deployment.md)
- [Contributing](./contributing.md)
