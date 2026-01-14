# 🚀 Start WARIS - Quick Guide

## Alternative Ports Configuration

WARIS Traefik is configured to use alternative ports to avoid conflicts with existing services:

- **HTTP**: Port 8090 (instead of 80)
- **HTTPS**: Port 8443 (instead of 443)
- **Dashboard**: Port 8888 (instead of 8080)

---

## 📋 Setup Steps (One-Time)

### 1. Add Hosts Entries

```bash
cd /Users/fero/Desktop/Works/HX/PWA/lab-pwa-waris
./setup-hosts.sh
```

This will add these entries to `/etc/hosts`:
```
127.0.0.1 waris.local
127.0.0.1 api.waris.local
127.0.0.1 ai.waris.local
127.0.0.1 traefik.waris.local
127.0.0.1 pgadmin.waris.local
127.0.0.1 mongo.waris.local
127.0.0.1 redis.waris.local
127.0.0.1 minio.waris.local
127.0.0.1 mlflow.waris.local
127.0.0.1 llm.waris.local
```

### 2. Trust SSL Certificate (Optional but Recommended)

```bash
sudo security add-trusted-cert -d -r trustRoot \
  -k /Library/Keychains/System.keychain \
  /Users/fero/Desktop/Works/HX/PWA/lab-pwa-waris/platform/infra/docker/traefik/certs/ca.crt
```

After this, **restart your browser** completely for the certificate to take effect.

---

## 🎯 Start WARIS

### Quick Start (All Services)

```bash
cd /Users/fero/Desktop/Works/HX/PWA/lab-pwa-waris/platform/infra/docker
docker compose -f docker-compose.traefik.yml up -d
```

**Wait 2-3 minutes** for all services to start and become healthy.

### Check Status

```bash
docker compose -f docker-compose.traefik.yml ps
```

---

## 🌐 Access Services

**Important:** Use port **8443** for HTTPS access!

### Main Applications

| Service | URL |
|---------|-----|
| **Frontend** | https://waris.local:8443 |
| **API** | https://api.waris.local:8443 |
| **API Docs** | https://api.waris.local:8443/docs |
| **AI Services** | https://ai.waris.local:8443 |

### Admin & Monitoring

| Service | URL | Credentials |
|---------|-----|-------------|
| **Traefik Dashboard** | https://traefik.waris.local:8888 | - |
| **pgAdmin** | https://pgadmin.waris.local:8443 | admin@waris.local / admin |
| **Mongo Express** | https://mongo.waris.local:8443 | admin / admin |
| **Redis Commander** | https://redis.waris.local:8443 | - |
| **MinIO Console** | https://minio.waris.local:8443 | minioadmin / minioadmin |
| **MLflow** | https://mlflow.waris.local:8443 | - |
| **Ollama (LLM)** | https://llm.waris.local:8443 | - |

---

## 🔧 Common Commands

### View Logs

```bash
cd /Users/fero/Desktop/Works/HX/PWA/lab-pwa-waris/platform/infra/docker

# All services
docker compose -f docker-compose.traefik.yml logs -f

# Specific service
docker compose -f docker-compose.traefik.yml logs -f traefik
docker compose -f docker-compose.traefik.yml logs -f api
docker compose -f docker-compose.traefik.yml logs -f web
```

### Stop Services

```bash
# Stop but keep data
docker compose -f docker-compose.traefik.yml down

# Stop and remove all data (⚠️ CAREFUL!)
docker compose -f docker-compose.traefik.yml down -v
```

### Restart Service

```bash
docker compose -f docker-compose.traefik.yml restart api
docker compose -f docker-compose.traefik.yml restart web
```

### Rebuild Service

```bash
# If you changed code and need to rebuild
docker compose -f docker-compose.traefik.yml build --no-cache web
docker compose -f docker-compose.traefik.yml up -d web
```

---

## ⚡ Quick Test

After starting, test with these commands:

```bash
# Test API health
curl -k https://api.waris.local:8443/health

# Test Traefik
curl -k https://traefik.waris.local:8888/ping

# Open in browser
open https://waris.local:8443
open https://api.waris.local:8443/docs
open https://traefik.waris.local:8888
```

---

## 🐛 Troubleshooting

### "Connection Refused"

**Check if services are running:**
```bash
docker compose -f docker-compose.traefik.yml ps
```

All services should show "Up" status.

### "Certificate Warning" in Browser

1. **Trust the CA certificate** (see step 2 above)
2. **Restart browser** completely
3. Or click "Advanced" → "Proceed" (for development)
4. Or type `thisisunsafe` on the warning page (Chrome/Edge)

### Port Already in Use

If you get port conflicts:

```bash
# Check what's using the port
lsof -i :8443
lsof -i :8090
lsof -i :8888

# Stop conflicting service if needed
docker stop <container-name>
```

### Service Won't Start

```bash
# Check logs
docker compose -f docker-compose.traefik.yml logs service-name

# Check dependencies (databases must be healthy first)
docker compose -f docker-compose.traefik.yml ps postgres mongodb redis
```

### Can't Access via Domain Name

1. **Verify /etc/hosts:**
   ```bash
   cat /etc/hosts | grep waris
   ```

2. **Ping the domain:**
   ```bash
   ping waris.local
   ```
   Should respond from 127.0.0.1

---

## 📊 Service Architecture

```
Browser (Port 8443)
    ↓
Traefik (waris-traefik)
    ├─→ Web (Next.js) - waris.local:8443
    ├─→ API (FastAPI) - api.waris.local:8443
    ├─→ AI (Python) - ai.waris.local:8443
    └─→ Admin Tools - *.waris.local:8443
         ↓
    Databases
    ├─→ PostgreSQL (port 5432)
    ├─→ MongoDB (port 27017)
    ├─→ Redis (port 6379)
    └─→ Milvus (port 19530)
```

---

## 🎨 Development Workflow

### 1. Start Services (Once)

```bash
cd /Users/fero/Desktop/Works/HX/PWA/lab-pwa-waris/platform/infra/docker
docker compose -f docker-compose.traefik.yml up -d
```

### 2. Develop Locally

Edit files in:
- **Frontend**: `apps/web/`
- **Backend**: `apps/api/`
- **AI**: `apps/ai/`

Changes will auto-reload! No restart needed.

### 3. View Changes

Open https://waris.local:8443 in your browser.

### 4. Check Logs if Issues

```bash
docker compose -f docker-compose.traefik.yml logs -f web api
```

### 5. Stop When Done

```bash
docker compose -f docker-compose.traefik.yml down
```

---

## 📝 Services Included

### Core Services
- ✅ **Traefik v3** - Reverse proxy
- ✅ **Next.js 16** - Frontend (React 19.2)
- ✅ **FastAPI** - Backend API
- ✅ **Python AI** - AI/ML services

### Databases
- ✅ **PostgreSQL 18** - Main database
- ✅ **MongoDB 8** - Document store
- ✅ **Redis 8** - Cache & sessions
- ✅ **Milvus 2.6** - Vector database

### ML Tools
- ✅ **Ollama** - LLM server
- ✅ **MLflow** - ML tracking

### Admin Tools
- ✅ **pgAdmin** - PostgreSQL UI
- ✅ **Mongo Express** - MongoDB UI
- ✅ **Redis Commander** - Redis UI
- ✅ **MinIO** - S3 storage

---

## 🔒 Security Notes

### For Development (Current Setup)
- ✅ Self-signed certificates OK
- ✅ Default passwords OK
- ✅ All services on localhost
- ✅ Alternative ports to avoid conflicts

### For Production (Change Before Deploy)
- ❌ Use real SSL certificates
- ❌ Change all default passwords
- ❌ Enable API authentication
- ❌ Restrict IP access
- ❌ Use secrets management

---

## 📚 More Information

- **Full Setup Guide**: [TRAEFIK_SETUP.md](TRAEFIK_SETUP.md)
- **Quick Start**: [QUICK_START_TRAEFIK.md](QUICK_START_TRAEFIK.md)
- **Local Setup**: [LOCAL_SETUP.md](LOCAL_SETUP.md)
- **Project README**: [README.md](README.md)

---

## ✅ Setup Checklist

Before you start developing:

- [ ] Hosts entries added (`./setup-hosts.sh`)
- [ ] CA certificate trusted (optional)
- [ ] Services started (`docker compose up -d`)
- [ ] All services "Up" (`docker compose ps`)
- [ ] Can access https://waris.local:8443
- [ ] Can access https://api.waris.local:8443/docs
- [ ] Can access https://traefik.waris.local:8888

---

<div align="center">

**🎉 You're Ready to Develop! 🎉**

Access your app at: **https://waris.local:8443**

[Traefik Dashboard](https://traefik.waris.local:8888) • [API Docs](https://api.waris.local:8443/docs) • [pgAdmin](https://pgadmin.waris.local:8443)

</div>
