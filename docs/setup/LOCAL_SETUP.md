# WARIS - Local Development Setup Guide

Complete guide to setting up and running WARIS locally on your machine.

---

## Prerequisites

Before starting, ensure you have the following installed:

### Required Software

| Software | Minimum Version | Current System | Status |
|----------|----------------|----------------|--------|
| Node.js | 22.0.0 | 24.12.0 | ✅ |
| npm | 10.0.0 | 11.6.2 | ✅ |
| Docker | 20.10+ | 29.1.4 | ✅ |
| Docker Compose | 2.0+ | 5.0.0 | ✅ |
| Python | 3.12+ | 3.14.2 | ✅ |

### Optional Software

- **pgAdmin 4**: Database management (included in Docker Compose)
- **Postman/Insomnia**: API testing
- **VS Code**: Recommended IDE with extensions:
  - ESLint
  - Prettier
  - Python
  - Docker

---

## Quick Start (Recommended)

The fastest way to get WARIS running locally:

### Option 1: Docker Compose (Databases Only)

Run only the databases in Docker and run the apps locally for hot-reload development.

```bash
# 1. Navigate to project root
cd /Users/fero/Desktop/Works/HX/PWA/lab-pwa-waris

# 2. Start infrastructure services (PostgreSQL, MongoDB, Redis)
cd platform/infra/docker
docker compose -f docker-compose.dev.yml up -d postgres redis mongodb pgadmin

# 3. Wait for services to be healthy (30-60 seconds)
docker compose -f docker-compose.dev.yml ps

# 4. Setup environment
cd ../../
cp .env.example .env

# 5. Install dependencies
npm install

# 6. Start development servers
npm run dev
```

Your services will be available at:
- **Frontend (Next.js)**: http://localhost:3000
- **Backend API (FastAPI)**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **pgAdmin**: http://localhost:5050

### Option 2: Full Docker Stack

Run everything in Docker (less ideal for development, but good for testing):

```bash
cd platform/infra/docker
docker compose -f docker-compose.dev.yml up -d
```

---

## Detailed Setup Instructions

### Step 1: Clone and Navigate

```bash
# If you haven't cloned yet
git clone <repository-url>
cd lab-pwa-waris

# Or if already cloned
cd /Users/fero/Desktop/Works/HX/PWA/lab-pwa-waris
```

### Step 2: Environment Configuration

```bash
cd platform

# Copy environment template
cp .env.example .env

# Edit the .env file with your settings
nano .env
```

**Important Environment Variables:**

```bash
# .env file
NODE_ENV=development
DEBUG=true

# Database URLs (use localhost if running DBs in Docker)
DATABASE_URL=postgresql+asyncpg://waris:waris@localhost:5432/waris
MONGODB_URL=mongodb://waris:waris@localhost:27017
REDIS_URL=redis://localhost:6379

# Security (change in production!)
SECRET_KEY=your-secure-random-string-here

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 3: Start Infrastructure Services

```bash
cd infra/docker

# Start only the databases
docker compose -f docker-compose.dev.yml up -d postgres redis mongodb pgadmin

# Check services are running
docker compose -f docker-compose.dev.yml ps

# View logs if needed
docker compose -f docker-compose.dev.yml logs -f postgres
```

**Expected Output:**
```
NAME                IMAGE          STATUS         PORTS
waris-postgres     postgres:17    healthy        0.0.0.0:5432->5432/tcp
waris-redis        redis:7-alpine healthy        0.0.0.0:6379->6379/tcp
waris-mongodb      mongo:8        healthy        0.0.0.0:27017->27017/tcp
waris-pgadmin      dpage/pgadmin4 running        0.0.0.0:5050->80/tcp
```

### Step 4: Install Node.js Dependencies

```bash
cd ../../  # Back to platform/
npm install
```

This will install all dependencies for the monorepo (frontend, backend, shared packages).

### Step 5: Setup Python Virtual Environment (API)

```bash
cd apps/api

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install Python dependencies
pip install --upgrade pip
pip install fastapi uvicorn sqlalchemy asyncpg pymongo redis pydantic python-jose passlib bcrypt python-multipart

# Or if requirements.txt exists:
# pip install -r requirements.txt

cd ../..  # Back to platform/
```

### Step 6: Initialize Database

```bash
cd apps/api

# Run database migrations (if using Alembic)
# alembic upgrade head

# Or manually create tables
python -c "from database import init_db; init_db()"

cd ../..
```

### Step 7: Start Development Servers

```bash
# From platform/ directory

# Option A: Start all services with Turborepo
npm run dev

# Option B: Start services individually in separate terminals

# Terminal 1: Frontend (Next.js)
npm run dev:web

# Terminal 2: Backend API (FastAPI)
npm run dev:api

# Terminal 3: AI Services (if needed)
npm run dev:ai
```

---

## Verify Installation

### 1. Check Services

Open your browser and verify each service:

| Service | URL | Expected Result |
|---------|-----|-----------------|
| Frontend | http://localhost:3000 | WARIS Dashboard |
| API Docs | http://localhost:8000/docs | Swagger UI |
| API Health | http://localhost:8000/health | `{"status": "ok"}` |
| pgAdmin | http://localhost:5050 | Login page |

### 2. Test API Endpoints

```bash
# Health check
curl http://localhost:8000/health

# API info
curl http://localhost:8000/api/v1/info

# Test authentication (if implemented)
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

### 3. Test Database Connections

```bash
# PostgreSQL
docker exec -it waris-postgres psql -U waris -d waris -c "SELECT version();"

# MongoDB
docker exec -it waris-mongodb mongosh --eval "db.adminCommand('ping')"

# Redis
docker exec -it waris-redis redis-cli ping
```

### 4. Access pgAdmin

1. Open http://localhost:5050
2. Login with:
   - **Email**: admin@waris.local
   - **Password**: admin
3. Add server:
   - **Host**: postgres (or localhost if outside Docker)
   - **Port**: 5432
   - **Database**: waris
   - **Username**: waris
   - **Password**: waris

---

## Development Workflow

### Daily Development

```bash
# 1. Ensure Docker services are running
cd platform/infra/docker
docker compose -f docker-compose.dev.yml ps

# If not running:
docker compose -f docker-compose.dev.yml up -d postgres redis mongodb

# 2. Start development servers
cd ../../
npm run dev

# 3. Make your changes with hot-reload
# Frontend changes: apps/web/
# Backend changes: apps/api/
# Shared code: packages/shared/
```

### Running Tests

```bash
# All tests
npm test

# Frontend tests only
npm run test --workspace=apps/web

# Backend tests (Python)
cd apps/api
pytest
cd ../..

# Test coverage
npm run test:coverage
```

### Code Quality

```bash
# Linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run typecheck
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/WARIS-XXX-feature-name

# Make changes and commit
git add .
git commit -m "feat: add water loss chart component"

# Push to remote
git push origin feature/WARIS-XXX-feature-name
```

---

## Common Commands Reference

### Docker Commands

```bash
cd platform/infra/docker

# Start services
docker compose -f docker-compose.dev.yml up -d

# Stop services
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes (CAREFUL: deletes data!)
docker compose -f docker-compose.dev.yml down -v

# View logs
docker compose -f docker-compose.dev.yml logs -f

# View logs for specific service
docker compose -f docker-compose.dev.yml logs -f postgres

# Restart specific service
docker compose -f docker-compose.dev.yml restart postgres

# Check service status
docker compose -f docker-compose.dev.yml ps
```

### NPM Commands

```bash
cd platform

# Install dependencies
npm install

# Development
npm run dev              # All services
npm run dev:web          # Frontend only
npm run dev:api          # Backend only

# Building
npm run build            # Build all
npm run build:web        # Build frontend

# Testing
npm test                 # All tests
npm run test:coverage    # With coverage

# Code quality
npm run lint             # Check linting
npm run lint:fix         # Fix linting
npm run format           # Format code
npm run typecheck        # Type check

# Utilities
npm run clean            # Clean build artifacts
npm run dx:check         # Check dev environment
```

### Database Commands

```bash
# PostgreSQL
docker exec -it waris-postgres psql -U waris -d waris

# MongoDB
docker exec -it waris-mongodb mongosh

# Redis
docker exec -it waris-redis redis-cli

# Backup PostgreSQL
docker exec -it waris-postgres pg_dump -U waris waris > backup.sql

# Restore PostgreSQL
cat backup.sql | docker exec -i waris-postgres psql -U waris waris
```

---

## Troubleshooting

### Issue: Port Already in Use

**Error**: `Port 5432 is already in use`

**Solution**:
```bash
# Check what's using the port
lsof -i :5432

# Kill the process (replace PID)
kill -9 <PID>

# Or use different ports in docker-compose.dev.yml
ports:
  - "5433:5432"  # Use 5433 instead
```

### Issue: Docker Services Won't Start

**Error**: Docker services fail health checks

**Solution**:
```bash
# Check logs
docker compose -f docker-compose.dev.yml logs

# Remove containers and volumes, start fresh
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d

# Wait longer for health checks (60 seconds)
```

### Issue: npm install Fails

**Error**: Node version mismatch or dependency conflicts

**Solution**:
```bash
# Check Node version
node --version  # Should be 22+

# Update Node using nvm
nvm install 22
nvm use 22

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Issue: Python Dependencies Won't Install

**Error**: Module not found or version conflicts

**Solution**:
```bash
cd platform/apps/api

# Create fresh virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
# Or install individually if no requirements.txt
```

### Issue: Database Connection Error

**Error**: `Connection refused` or `Authentication failed`

**Solution**:
```bash
# Check if database is running
docker compose -f docker-compose.dev.yml ps

# Check if using correct host
# Inside Docker: use service name (postgres, mongodb, redis)
# Outside Docker: use localhost

# Verify credentials in .env match docker-compose.dev.yml
# Default: username=waris, password=waris
```

### Issue: Frontend Won't Connect to Backend

**Error**: CORS errors or API connection refused

**Solution**:
```bash
# 1. Check backend is running
curl http://localhost:8000/health

# 2. Verify NEXT_PUBLIC_API_URL in .env
echo $NEXT_PUBLIC_API_URL  # Should be http://localhost:8000

# 3. Check CORS settings in backend
# apps/api/main.py should allow http://localhost:3000

# 4. Restart both services
npm run dev
```

### Issue: Hot Reload Not Working

**Solution**:
```bash
# For frontend
# Check if .next is corrupted
rm -rf apps/web/.next
npm run dev:web

# For backend
# Ensure uvicorn has --reload flag
# Check apps/api/main.py or package.json dev:api script
```

---

## Next Steps

After successful setup:

1. **Explore the codebase**:
   - Frontend: [apps/web/](platform/apps/web/)
   - Backend: [apps/api/](platform/apps/api/)
   - Shared: [packages/shared/](platform/packages/shared/)

2. **Read documentation**:
   - Architecture: [docs/architecture/](docs/architecture/)
   - API Specs: [docs/api/](docs/api/)
   - Contributing: [docs/guides/contributing.md](docs/guides/contributing.md)

3. **Try the examples**:
   - Create a DMA (District Metered Area)
   - View water loss dashboard
   - Generate reports

4. **Start developing**:
   - Pick a task from the project board
   - Create a feature branch
   - Implement with tests
   - Submit a pull request

---

## Getting Help

### Resources

- **Documentation**: [docs/](docs/)
- **API Documentation**: http://localhost:8000/docs (when running)
- **Claude Code**: Use `/one` commands for AI assistance
- **GitHub Issues**: Report bugs and issues

### Contacts

- **Technical Lead**: [Contact info]
- **DevOps Team**: [Contact info]
- **Project Manager**: [Contact info]

---

## Additional Setup (Optional)

### Setting up AI/ML Services

If you need to work on AI features:

```bash
cd platform/apps/ai

# Install AI dependencies
pip install torch transformers langchain chromadb mlflow

# Download Thai LLM (requires Ollama)
ollama pull openthaigpt

# Start MLflow tracking server
mlflow server --host 0.0.0.0 --port 5000
```

### Setting up Milvus (Vector Database)

For RAG pipeline development:

```bash
# Add to docker-compose.dev.yml or run separately
docker run -d --name milvus-standalone \
  -p 19530:19530 -p 9091:9091 \
  milvusdb/milvus:latest
```

### IDE Configuration

**VS Code settings.json**:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter"
  }
}
```

---

<div align="center">

**Happy Coding! 🚀**

*WARIS - Water Loss Intelligent Analysis and Reporting System*

</div>
