# Deployment Guide

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT OVERVIEW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     LOAD BALANCER                        │   │
│  │                   (Nginx / HAProxy)                      │   │
│  └───────────────────────────┬─────────────────────────────┘   │
│                              │                                   │
│              ┌───────────────┼───────────────┐                  │
│              ▼               ▼               ▼                   │
│         ┌─────────┐    ┌─────────┐    ┌─────────┐              │
│         │   Web   │    │   API   │    │   AI    │              │
│         │  Pods   │    │  Pods   │    │  Pods   │              │
│         └─────────┘    └─────────┘    └─────────┘              │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    DATA LAYER                            │   │
│  │  PostgreSQL │ MongoDB │ Redis │ Milvus │ RabbitMQ       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Environments

| Environment | Purpose | URL |
|-------------|---------|-----|
| Development | Local development | localhost:3000 |
| Staging | Pre-production testing | staging.waris.pwa.co.th |
| Production | Live system | waris.pwa.co.th |

## Docker Deployment

### Build Images

```bash
# Build all images
docker compose build

# Build specific service
docker compose build web
docker compose build api
docker compose build ai
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:8000
    depends_on:
      - api

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://waris:password@postgres:5432/waris
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  ai:
    build:
      context: ./apps/ai
      dockerfile: Dockerfile
    ports:
      - "8001:8001"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=waris
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=waris

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  mongodb:
    image: mongo:7
    volumes:
      - mongo_data:/data/db

  milvus:
    image: milvusdb/milvus:v2.3.0
    volumes:
      - milvus_data:/var/lib/milvus

volumes:
  postgres_data:
  redis_data:
  mongo_data:
  milvus_data:
```

### Run Services

```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f api

# Stop services
docker compose down
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster 1.28+
- kubectl configured
- Helm 3+
- Container registry access

### Namespace Setup

```bash
# Create namespace
kubectl create namespace waris

# Set default namespace
kubectl config set-context --current --namespace=waris
```

### ConfigMaps and Secrets

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: waris-config
  namespace: waris
data:
  ENVIRONMENT: production
  LOG_LEVEL: info
  API_VERSION: v1
```

```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: waris-secrets
  namespace: waris
type: Opaque
stringData:
  DATABASE_URL: postgresql://user:pass@postgres:5432/waris
  JWT_SECRET: your-production-secret
  DMAMA_API_KEY: your-api-key
```

### Deployments

```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: waris-api
  namespace: waris
spec:
  replicas: 3
  selector:
    matchLabels:
      app: waris-api
  template:
    metadata:
      labels:
        app: waris-api
    spec:
      containers:
        - name: api
          image: registry.pwa.co.th/waris/api:latest
          ports:
            - containerPort: 8000
          envFrom:
            - configMapRef:
                name: waris-config
            - secretRef:
                name: waris-secrets
          resources:
            requests:
              cpu: 500m
              memory: 512Mi
            limits:
              cpu: 2000m
              memory: 2Gi
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 5
```

### Services

```yaml
# k8s/api-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: waris-api
  namespace: waris
spec:
  selector:
    app: waris-api
  ports:
    - port: 8000
      targetPort: 8000
  type: ClusterIP
```

### Ingress

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: waris-ingress
  namespace: waris
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - waris.pwa.co.th
        - api.waris.pwa.co.th
      secretName: waris-tls
  rules:
    - host: waris.pwa.co.th
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: waris-web
                port:
                  number: 3000
    - host: api.waris.pwa.co.th
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: waris-api
                port:
                  number: 8000
```

### Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n waris
kubectl get services -n waris

# Check logs
kubectl logs -f deployment/waris-api -n waris
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test

      - name: Run linting
        run: pnpm lint

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Login to Registry
        uses: docker/login-action@v3
        with:
          registry: registry.pwa.co.th
          username: ${{ secrets.REGISTRY_USER }}
          password: ${{ secrets.REGISTRY_PASS }}

      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: ./apps/api
          push: true
          tags: registry.pwa.co.th/waris/api:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3

      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/waris-api \
            api=registry.pwa.co.th/waris/api:${{ github.sha }} \
            -n waris
```

## Database Migrations

### Production Migrations

```bash
# Run migrations
kubectl exec -it deployment/waris-api -n waris -- \
  alembic upgrade head

# Rollback if needed
kubectl exec -it deployment/waris-api -n waris -- \
  alembic downgrade -1
```

## Monitoring

### Health Checks

```bash
# Check all services
curl https://waris.pwa.co.th/health
curl https://api.waris.pwa.co.th/v1/health
```

### Prometheus Metrics

```yaml
# Prometheus scrape config
scrape_configs:
  - job_name: 'waris-api'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        regex: waris-api
        action: keep
```

### Grafana Dashboards

- API Response Times
- Error Rates
- Database Connections
- AI Model Performance
- Resource Utilization

## Backup & Recovery

### Database Backup

```bash
# Automated daily backup
kubectl create cronjob db-backup \
  --image=postgres:16 \
  --schedule="0 2 * * *" \
  -- pg_dump -h postgres -U waris waris > /backup/waris_$(date +%Y%m%d).sql
```

### Disaster Recovery

1. **RTO (Recovery Time Objective):** 4 hours
2. **RPO (Recovery Point Objective):** 15 minutes

### Recovery Steps

```bash
# 1. Restore from backup
pg_restore -h postgres -U waris -d waris /backup/latest.sql

# 2. Verify data integrity
kubectl exec -it deployment/waris-api -- python -c "
from app.db.session import engine
from sqlalchemy import text
with engine.connect() as conn:
    result = conn.execute(text('SELECT COUNT(*) FROM dma.dmas'))
    print(f'DMAs: {result.scalar()}')
"

# 3. Restart services
kubectl rollout restart deployment -n waris
```

## Rollback Procedures

### Application Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/waris-api -n waris

# Rollback to specific revision
kubectl rollout undo deployment/waris-api --to-revision=3 -n waris

# Check rollout history
kubectl rollout history deployment/waris-api -n waris
```

### Database Rollback

```bash
# Rollback migration
alembic downgrade -1

# Rollback to specific version
alembic downgrade abc123
```

## Security Checklist

- [ ] TLS certificates configured
- [ ] Secrets stored in Kubernetes Secrets
- [ ] Network policies applied
- [ ] RBAC configured
- [ ] Pod security policies enabled
- [ ] Image vulnerability scanning
- [ ] Database encryption at rest
- [ ] Backup encryption

## Related Documents

- [Development Guide](./development.md)
- [Infrastructure](../infrastructure/overview.md)
- [Monitoring](../infrastructure/monitoring.md)
