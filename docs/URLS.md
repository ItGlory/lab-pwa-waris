# WARIS - Complete URL Guide

**Quick Reference for All Service URLs**

---

## 🌐 Access URLs (Port 8443)

### Main Applications

| Service | URL | Status | Description |
|---------|-----|--------|-------------|
| **Frontend** | https://waris.local:8443 | ⏸️ Not Started | Next.js 16 web app |
| **Backend API** | https://api.waris.local:8443 | ⏸️ Not Started | FastAPI REST API |
| **API Documentation** | https://api.waris.local:8443/docs | ⏸️ Not Started | Swagger UI (interactive) |
| **API Redoc** | https://api.waris.local:8443/redoc | ⏸️ Not Started | ReDoc (alternative docs) |
| **API Health** | https://api.waris.local:8443/health | ⏸️ Not Started | Health check endpoint |
| **AI Services** | https://ai.waris.local:8443 | ⏸️ Not Started | AI/ML inference API |

---

## 🛠️ Admin & Management Tools

| Service | URL | Status | Credentials |
|---------|-----|--------|-------------|
| **Traefik Dashboard** | http://localhost:8888 | ✅ **RUNNING** | - |
| **Traefik Dashboard** | https://traefik.waris.local:8888 | ✅ **RUNNING** | - |
| **pgAdmin** | https://pgadmin.waris.local:8443 | ⏸️ Not Started | admin@waris.local / admin |
| **Mongo Express** | https://mongo.waris.local:8443 | ⏸️ Not Started | admin / admin |
| **Redis Commander** | https://redis.waris.local:8443 | ⏸️ Not Started | - |
| **MinIO Console** | https://minio.waris.local:8443 | ⏸️ Not Started | minioadmin / minioadmin |
| **MinIO API (S3)** | https://s3.waris.local:8443 | ⏸️ Not Started | minioadmin / minioadmin |
| **MLflow** | https://mlflow.waris.local:8443 | ⏸️ Not Started | - |
| **Ollama (LLM)** | https://llm.waris.local:8443 | ⏸️ Not Started | - |
| **Milvus** | https://milvus.waris.local:8443 | ⏸️ Not Started | - |

---

## 🔌 Direct Access (Without Traefik)

Use these URLs if you bypass Traefik or for direct container access:

### Using localhost

| Service | Direct URL | Port |
|---------|-----------|------|
| Traefik Dashboard | http://localhost:8888 | 8888 |
| HTTP Endpoint | http://localhost:8090 | 8090 |
| HTTPS Endpoint | https://localhost:8443 | 8443 |

### Container Network (Internal)

When services talk to each other inside Docker:

```yaml
# From within containers:
Database: postgres:5432
MongoDB: mongodb:27017
Redis: redis:6379
Milvus: milvus:19530
Ollama: ollama:11434
API: api:8000
Web: web:3000
```

---

## 📋 URL Patterns

### With Custom Domains (Requires /etc/hosts)

**Pattern:** `https://[service].waris.local:8443`

Examples:
- https://waris.local:8443 → Frontend
- https://api.waris.local:8443 → Backend API
- https://pgadmin.waris.local:8443 → pgAdmin

**Exception:** Traefik Dashboard uses port 8888:
- https://traefik.waris.local:8888

### Without Custom Domains (Direct)

**Pattern:** `https://localhost:8443`

But you'll need to:
- Use different paths, OR
- Access services by their container ports directly

---

## 🚀 How to Start Services

### Start Frontend & Backend

```bash
cd /Users/fero/Desktop/Works/HX/PWA/lab-pwa-waris/platform/infra/docker

# Start web + API
docker compose -f docker-compose.traefik.yml up -d web api

# Wait 1-2 minutes for services to build and start
docker compose -f docker-compose.traefik.yml logs -f web api
```

**Then access:**
- Frontend: https://waris.local:8443
- API Docs: https://api.waris.local:8443/docs

### Start Admin Tools

```bash
# Start database admin tools
docker compose -f docker-compose.traefik.yml up -d pgadmin mongo-express redis-commander

# Wait 30 seconds
docker compose -f docker-compose.traefik.yml ps
```

**Then access:**
- pgAdmin: https://pgadmin.waris.local:8443
- Mongo Express: https://mongo.waris.local:8443
- Redis Commander: https://redis.waris.local:8443

### Start AI Services

```bash
# Start AI services (requires GPU)
docker compose -f docker-compose.traefik.yml up -d ai ollama mlflow milvus

# Note: These require more resources and time to start
```

### Start Everything

```bash
# Start all services
docker compose -f docker-compose.traefik.yml up -d

# This includes: web, api, ai, ollama, mlflow, milvus, pgadmin, etc.
```

---

## ✅ Setup Requirements

### For Custom Domains (waris.local)

**1. Add to /etc/hosts:**
```bash
cd /Users/fero/Desktop/Works/HX/PWA/lab-pwa-waris
./setup-hosts.sh
```

This adds:
```
127.0.0.1 waris.local
127.0.0.1 api.waris.local
127.0.0.1 ai.waris.local
127.0.0.1 traefik.waris.local
127.0.0.1 pgadmin.waris.local
127.0.0.1 mongo.waris.local
127.0.0.1 redis.waris.local
127.0.0.1 minio.waris.local
127.0.0.1 s3.waris.local
127.0.0.1 mlflow.waris.local
127.0.0.1 llm.waris.local
127.0.0.1 milvus.waris.local
```

**2. Trust SSL Certificate (Optional):**
```bash
sudo security add-trusted-cert -d -r trustRoot \
  -k /Library/Keychains/System.keychain \
  /Users/fero/Desktop/Works/HX/PWA/lab-pwa-waris/platform/infra/docker/traefik/certs/ca.crt
```

**3. Restart Browser** completely (quit and reopen)

---

## 🧪 Testing URLs

### Test Current Infrastructure

```bash
# Traefik Dashboard (Should work now)
curl http://localhost:8888/api/overview

# Open in browser
open http://localhost:8888

# Test HTTPS endpoint
curl -k https://localhost:8443
# Expected: 404 (no apps running yet)
```

### Test After Starting Web/API

```bash
# Frontend
curl -k https://waris.local:8443
# or
curl -k https://localhost:8443

# API Health
curl -k https://api.waris.local:8443/health
# Expected: {"status":"ok"}

# API Docs
open https://api.waris.local:8443/docs
```

---

## 🔍 Service Discovery

### How Traefik Routes Traffic

Traefik automatically routes based on **Host headers**:

```
Request: https://api.waris.local:8443/docs
         ↓
Traefik checks Host: api.waris.local
         ↓
Routes to container: waris-api:8000
         ↓
Response from FastAPI docs
```

### View All Routes

```bash
# Via API
curl http://localhost:8888/api/http/routers | python3 -m json.tool

# Or open dashboard
open http://localhost:8888
```

In dashboard:
- **HTTP → Routers**: See all configured routes
- **HTTP → Services**: See all backend services
- **HTTP → Middlewares**: See security, CORS, rate limiting

---

## 📊 URL Summary by Category

### Currently Working ✅
- http://localhost:8888 - Traefik Dashboard
- https://localhost:8443 - HTTPS endpoint (returns 404 until apps start)

### Need to Start Services ⏸️
- https://waris.local:8443 - Frontend (run: `docker compose up -d web`)
- https://api.waris.local:8443 - API (run: `docker compose up -d api`)
- https://pgadmin.waris.local:8443 - pgAdmin (run: `docker compose up -d pgadmin`)

### Need /etc/hosts Setup 📝
All `*.waris.local` domains need hosts file entries:
```bash
./setup-hosts.sh
```

---

## 🎯 Quick Start Commands

### Option 1: Start Frontend & API Only

```bash
cd /Users/fero/Desktop/Works/HX/PWA/lab-pwa-waris/platform/infra/docker
docker compose -f docker-compose.traefik.yml up -d web api
```

**Access:**
- https://waris.local:8443
- https://api.waris.local:8443/docs

### Option 2: Start Everything

```bash
docker compose -f docker-compose.traefik.yml up -d
```

**Access:** All URLs listed above

### Option 3: Selective Services

```bash
# Core apps
docker compose -f docker-compose.traefik.yml up -d web api

# Add admin tools
docker compose -f docker-compose.traefik.yml up -d pgadmin mongo-express

# Add AI (requires GPU)
docker compose -f docker-compose.traefik.yml up -d ai ollama mlflow
```

---

## 🐛 Troubleshooting URLs

### "Cannot resolve host" Error

**Problem:** Browser can't find `waris.local`

**Solution:**
```bash
# Add to /etc/hosts
./setup-hosts.sh

# Verify
ping waris.local
```

### "SSL Certificate Warning"

**Problem:** Browser shows security warning

**Solutions:**
1. Click "Advanced" → "Proceed" (for dev)
2. Type `thisisunsafe` on warning page (Chrome/Edge)
3. Or trust CA certificate (see setup above)

### "404 Not Found"

**Problem:** Traefik returns 404

**Solutions:**
1. Check service is running: `docker ps | grep waris`
2. Check Traefik dashboard: http://localhost:8888
3. View service logs: `docker logs waris-web`

### "Connection Refused"

**Problem:** Can't connect to service

**Solutions:**
1. Check Traefik is running: `docker ps | grep traefik`
2. Check port is open: `lsof -i :8443`
3. Check firewall settings

---

## 📱 Mobile/Device Access

To access from other devices on your network:

1. **Find your IP:**
   ```bash
   ipconfig getifaddr en0  # macOS Wi-Fi
   ```

2. **Use IP instead of localhost:**
   ```
   https://192.168.1.x:8443
   ```

3. **Add to device hosts file** (advanced):
   On mobile, use IP address or set up local DNS

---

## 💡 Pro Tips

### 1. Bookmark These URLs

```
http://localhost:8888 - Traefik Dashboard
https://waris.local:8443 - Frontend
https://api.waris.local:8443/docs - API Docs
https://pgadmin.waris.local:8443 - Database Admin
```

### 2. Use Browser Profiles

Create a browser profile for WARIS with:
- Bookmarks for all services
- Certificate exceptions saved
- Dev tools open by default

### 3. Use Traefik Dashboard

Check http://localhost:8888 to:
- See which services are running
- Check routing rules
- View request metrics
- Debug routing issues

### 4. Check Service Health

```bash
# All services
docker compose -f docker-compose.traefik.yml ps

# Specific service
curl -k https://api.waris.local:8443/health
```

---

<div align="center">

**🌐 Complete URL Reference for WARIS**

Need help? Check [STATUS.md](STATUS.md) for current status
or [TRAEFIK_SETUP.md](TRAEFIK_SETUP.md) for detailed setup

[Start Services](START_WARIS.md) • [Dashboard](http://localhost:8888) • [Documentation](README.md)

</div>
