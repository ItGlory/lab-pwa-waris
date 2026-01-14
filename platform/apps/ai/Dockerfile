# WARIS AI Services Dockerfile
# Python 3.12+ with PyTorch, MLflow, LangChain

# ========================================
# Base Stage
# ========================================
FROM python:3.12-slim AS base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ========================================
# Dependencies Stage
# ========================================
FROM base AS deps

# Copy requirements
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# ========================================
# Development Stage
# ========================================
FROM base AS development

WORKDIR /app

# Copy dependencies
COPY --from=deps /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin

# Install dev dependencies
RUN pip install pytest pytest-cov black ruff mypy ipython jupyter

# Copy source code
COPY . .

# Expose port
EXPOSE 8001

# Set environment
ENV ENVIRONMENT=development

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8001/health || exit 1

# Start development server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]

# ========================================
# Production Stage
# ========================================
FROM base AS production

WORKDIR /app

# Create non-root user
RUN useradd -m -u 1001 waris && \
    chown -R waris:waris /app

# Copy dependencies
COPY --from=deps /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin

# Copy source code
COPY --chown=waris:waris . .

# Switch to non-root user
USER waris

# Expose port
EXPOSE 8001

# Set environment
ENV ENVIRONMENT=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8001/health || exit 1

# Start production server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "4"]
