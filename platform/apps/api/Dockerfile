# WARIS API Dockerfile
# FastAPI with Python 3.12+

# ========================================
# Base Stage
# ========================================
FROM python:3.12-slim AS base

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ========================================
# Development Stage
# ========================================
FROM base AS development

WORKDIR /app

# Copy requirements
COPY pyproject.toml README.md* ./

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
    fastapi>=0.124.0 \
    uvicorn[standard]>=0.34.0 \
    pydantic>=2.12.0 \
    pydantic-settings>=2.5.0 \
    sqlalchemy>=2.0.0 \
    asyncpg>=0.30.0 \
    pymongo>=4.10.0 \
    redis>=5.2.0 \
    python-jose[cryptography]>=3.3.0 \
    passlib[bcrypt]>=1.7.4 \
    python-multipart>=0.0.18 \
    httpx>=0.28.0 \
    orjson>=3.10.0 \
    python-dotenv>=1.0.0 \
    email-validator>=2.0.0

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run with reload for development
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# ========================================
# Production Stage
# ========================================
FROM base AS production

WORKDIR /app

# Create non-root user
RUN useradd -m -u 1001 waris && \
    chown -R waris:waris /app

# Copy requirements
COPY pyproject.toml README.md* ./

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
    fastapi>=0.124.0 \
    uvicorn[standard]>=0.34.0 \
    pydantic>=2.12.0 \
    pydantic-settings>=2.5.0 \
    sqlalchemy>=2.0.0 \
    asyncpg>=0.30.0 \
    pymongo>=4.10.0 \
    redis>=5.2.0 \
    python-jose[cryptography]>=3.3.0 \
    passlib[bcrypt]>=1.7.4 \
    python-multipart>=0.0.18 \
    httpx>=0.28.0 \
    orjson>=3.10.0 \
    email-validator>=2.0.0 \
    pymilvus>=2.4.0

# Copy application code
COPY --chown=waris:waris . .

# Switch to non-root user
USER waris

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run with multiple workers for production
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
