# Deployment Overview
# ภาพรวมการ Deploy

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT PIPELINE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   GitHub    │───►│   GitHub    │───►│   Build &   │───►│   Deploy    │  │
│  │   (Code)    │    │   Actions   │    │   Test      │    │             │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘  │
│                                                                   │         │
│                           ┌───────────────────────────────────────┘         │
│                           │                                                  │
│              ┌────────────┼────────────┐                                    │
│              │            │            │                                    │
│       ┌──────▼──────┐ ┌───▼────┐ ┌─────▼─────┐                             │
│       │   Docker    │ │ Helm   │ │ Terraform │                             │
│       │   Images    │ │ Charts │ │   (IaC)   │                             │
│       └──────┬──────┘ └───┬────┘ └─────┬─────┘                             │
│              │            │            │                                    │
│              └────────────┼────────────┘                                    │
│                           │                                                  │
│              ┌────────────▼────────────┐                                    │
│              │      Kubernetes         │                                    │
│              │  (On-Premise + G-Cloud) │                                    │
│              └─────────────────────────┘                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Environments

| Environment | Purpose | URL |
|-------------|---------|-----|
| Development | Local development | localhost |
| Staging | Integration testing | staging.waris.internal |
| Production | Live system | waris.pwa.co.th |

---

## Container Strategy

### Docker Images

```yaml
# Base images
Frontend: node:20-alpine
Backend: python:3.11-slim
AI/ML: nvidia/cuda:12.1-runtime-ubuntu22.04

# Custom images
waris/web:latest
waris/api:latest
waris/ai-service:latest
waris/llm-service:latest
```

### Dockerfile Examples

```dockerfile
# Backend API
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# AI Service (GPU)
FROM nvidia/cuda:12.1-runtime-ubuntu22.04

RUN apt-get update && apt-get install -y python3.11 python3-pip
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8001

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

---

## Kubernetes Deployment

### Namespace Structure

```yaml
namespaces:
  - waris-system      # Core infrastructure
  - waris-app         # Application services
  - waris-ai          # AI/ML services
  - waris-data        # Databases
  - waris-monitoring  # Monitoring stack
```

### Resource Allocation

| Service | CPU (Request/Limit) | Memory (Request/Limit) | GPU |
|---------|---------------------|------------------------|-----|
| Frontend | 100m / 500m | 256Mi / 512Mi | - |
| API | 500m / 2000m | 512Mi / 2Gi | - |
| AI Service | 1000m / 4000m | 4Gi / 16Gi | 1 |
| LLM Service | 2000m / 8000m | 32Gi / 96Gi | 2 |
| PostgreSQL | 1000m / 4000m | 4Gi / 16Gi | - |
| Milvus | 1000m / 4000m | 8Gi / 32Gi | - |

### Horizontal Pod Autoscaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: waris-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: waris-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: WARIS CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: |
          npm test
          pytest

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker images
        run: |
          docker build -t waris/api:${{ github.sha }} ./apps/api
          docker build -t waris/web:${{ github.sha }} ./apps/web

      - name: Push to registry
        run: |
          docker push waris/api:${{ github.sha }}
          docker push waris/web:${{ github.sha }}

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: |
          helm upgrade --install waris ./helm/waris \
            --set image.tag=${{ github.sha }} \
            --namespace waris-staging

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        run: |
          helm upgrade --install waris ./helm/waris \
            --set image.tag=${{ github.sha }} \
            --namespace waris-production
```

---

## Infrastructure as Code

### Terraform Structure

```
infra/terraform/
├── modules/
│   ├── kubernetes/
│   ├── networking/
│   ├── storage/
│   └── gpu-server/
├── environments/
│   ├── staging/
│   │   └── main.tf
│   └── production/
│       └── main.tf
├── main.tf
├── variables.tf
└── outputs.tf
```

### Example Terraform

```hcl
# GPU Server module
module "gpu_server" {
  source = "./modules/gpu-server"

  name        = "waris-gpu-01"
  cpu_cores   = 50
  memory_gb   = 512
  gpu_count   = 2
  gpu_model   = "nvidia-a100"
  storage_gb  = 17500
}

# Kubernetes cluster
module "kubernetes" {
  source = "./modules/kubernetes"

  cluster_name = "waris-cluster"
  node_pools = [
    {
      name       = "general"
      node_count = 3
      vm_size    = "Standard_D8s_v3"
    },
    {
      name       = "gpu"
      node_count = 1
      vm_size    = "Standard_NC24ads_A100_v4"
      gpu_count  = 2
    }
  ]
}
```

---

## Monitoring & Observability

### Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    MONITORING STACK                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Prometheus  │  │   Grafana   │  │  AlertMgr   │             │
│  │  (Metrics)  │  │ (Dashboard) │  │  (Alerts)   │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│  ┌──────┴────────────────┴────────────────┴──────┐             │
│  │                Service Mesh                    │             │
│  └──────┬────────────────┬────────────────┬──────┘             │
│         │                │                │                     │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐             │
│  │    Loki     │  │   Jaeger    │  │  Promtail   │             │
│  │   (Logs)    │  │  (Traces)   │  │ (Log Agent) │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| API Response Time | p99 latency | > 2s |
| Error Rate | 5xx errors | > 1% |
| GPU Utilization | AI service | > 90% for 10m |
| Memory Usage | All services | > 85% |
| Database Connections | PostgreSQL | > 80% |

---

## Rollback Strategy

### Deployment Rollback

```bash
# Helm rollback
helm rollback waris <revision> -n waris-production

# Kubernetes rollback
kubectl rollout undo deployment/waris-api -n waris-production
```

### Database Rollback

```bash
# PostgreSQL point-in-time recovery
pg_restore -d waris --target-time="2024-01-15 10:00:00" backup.dump
```

---

## Security Considerations

### Container Security
- Non-root containers
- Read-only root filesystem
- Resource limits enforced
- Network policies

### Secrets Management
```yaml
# Using External Secrets Operator
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: waris-secrets
spec:
  secretStoreRef:
    name: vault-backend
    kind: ClusterSecretStore
  target:
    name: waris-secrets
  data:
    - secretKey: database-url
      remoteRef:
        key: waris/production/database
        property: url
```

---

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Database migrations ready
- [ ] Feature flags configured
- [ ] Monitoring alerts configured

### Deployment
- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Verify metrics
- [ ] Deploy to production
- [ ] Monitor for 30 minutes

### Post-deployment
- [ ] Verify all services healthy
- [ ] Check error rates
- [ ] Update documentation
- [ ] Notify stakeholders
