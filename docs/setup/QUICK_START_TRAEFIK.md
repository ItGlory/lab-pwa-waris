# WARIS - Quick Start with Traefik

**One-command setup for production-like local development with SSL**

---

## 🚀 Quick Start (Automated)

```bash
cd /Users/fero/Desktop/Works/HX/PWA/lab-pwa-waris/platform/infra/docker/scripts
./traefik-start.sh
```

This script will:
1. ✅ Generate SSL certificates
2. ✅ Configure `/etc/hosts`
3. ✅ Trust CA certificate
4. ✅ Start all services with Traefik
5. ✅ Verify everything is running

**Time required:** ~5 minutes (including service startup)

---

## 📍 Access Your Services

Once running, access these URLs:

### Main Applications
| Service | URL |
|---------|-----|
| Frontend | https://waris.local |
| API | https://api.waris.local |
| API Docs | https://api.waris.local/docs |
| AI Services | https://ai.waris.local |

### Admin & Monitoring
| Service | URL | Credentials |
|---------|-----|-------------|
| Traefik Dashboard | https://traefik.waris.local:8080 | - |
| pgAdmin | https://pgadmin.waris.local | admin@waris.local / admin |
| Mongo Express | https://mongo.waris.local | admin / admin |
| Redis Commander | https://redis.waris.local | - |
| MinIO Console | https://minio.waris.local | minioadmin / minioadmin |
| MLflow | https://mlflow.waris.local | - |

---

## 🔧 Manual Setup (Step by Step)

If you prefer manual control or the script fails:

### 1. Generate SSL Certificates
```bash
cd /Users/fero/Desktop/Works/HX/PWA/lab-pwa-waris/platform/infra/docker/scripts
./generate-certs.sh
```

### 2. Trust CA Certificate

**macOS:**
```bash
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain \
  ../traefik/certs/ca.crt
```

**Linux:**
```bash
sudo cp ../traefik/certs/ca.crt /usr/local/share/ca-certificates/waris-ca.crt
sudo update-ca-certificates
```

### 3. Configure /etc/hosts
```bash
sudo nano /etc/hosts
```

Add these lines:
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

### 4. Start Services
```bash
cd /Users/fero/Desktop/Works/HX/PWA/lab-pwa-waris/platform/infra/docker
docker compose -f docker-compose.traefik.yml up -d
```

### 5. Wait & Verify
```bash
# Wait 2-3 minutes for all services to start

# Check status
docker compose -f docker-compose.traefik.yml ps

# View logs
docker compose -f docker-compose.traefik.yml logs -f
```

---

## 📊 What's Included

### Services Running

1. **Traefik v3** - Reverse proxy with automatic HTTPS
2. **Next.js 16** - Frontend application
3. **FastAPI** - Backend API
4. **Python AI** - AI/ML services
5. **PostgreSQL 18** - Main database
6. **MongoDB 8** - Document store
7. **Redis 8** - Cache & sessions
8. **Milvus 2.6** - Vector database for RAG
9. **Ollama** - Local LLM server
10. **MLflow** - ML experiment tracking
11. **Admin Tools** - pgAdmin, Mongo Express, Redis Commander, MinIO

### Features

- ✅ **HTTPS Everywhere** - All services use SSL/TLS
- ✅ **Auto Service Discovery** - Traefik automatically routes to services
- ✅ **Hot Reload** - Code changes reflect immediately
- ✅ **Health Checks** - Automatic service health monitoring
- ✅ **Rate Limiting** - Protection against abuse
- ✅ **CORS Configured** - Frontend can call API
- ✅ **Security Headers** - XSS, HSTS, CSP protection
- ✅ **Compression** - Gzip enabled for better performance
- ✅ **Logging** - Access and error logs

---

## 🛠️ Common Commands

### Service Management
```bash
cd /Users/fero/Desktop/Works/HX/PWA/lab-pwa-waris/platform/infra/docker

# Start all services
docker compose -f docker-compose.traefik.yml up -d

# Stop all services
docker compose -f docker-compose.traefik.yml down

# Restart specific service
docker compose -f docker-compose.traefik.yml restart api

# View all logs
docker compose -f docker-compose.traefik.yml logs -f

# View specific service logs
docker compose -f docker-compose.traefik.yml logs -f traefik
docker compose -f docker-compose.traefik.yml logs -f api
docker compose -f docker-compose.traefik.yml logs -f web

# Check service status
docker compose -f docker-compose.traefik.yml ps

# Rebuild specific service
docker compose -f docker-compose.traefik.yml build --no-cache web
docker compose -f docker-compose.traefik.yml up -d web
```

### Troubleshooting
```bash
# Check Traefik routing
docker logs waris-traefik

# Test API endpoint
curl -k https://api.waris.local/health

# Check database connections
docker exec -it waris-postgres psql -U waris -d waris
docker exec -it waris-mongodb mongosh
docker exec -it waris-redis redis-cli

# Check resource usage
docker stats

# Remove and restart fresh (⚠️ DELETES DATA)
docker compose -f docker-compose.traefik.yml down -v
docker compose -f docker-compose.traefik.yml up -d
```

---

## 🔍 Verifying Setup

### 1. Check Services
```bash
docker compose -f docker-compose.traefik.yml ps
```

Expected: All services should show "Up" and databases should show "healthy"

### 2. Check Traefik Dashboard
Open: https://traefik.waris.local:8080

- Go to **HTTP → Routers** - Should see routes for all services
- Go to **HTTP → Services** - Should see all backend services
- Go to **HTTP → Middlewares** - Should see security, CORS, rate limiting

### 3. Test API
```bash
curl -k https://api.waris.local/health
```

Expected: `{"status":"ok"}` or similar

### 4. Test Frontend
Open: https://waris.local

Expected: WARIS dashboard loads

### 5. Test Database Access
- pgAdmin: https://pgadmin.waris.local
- Login and connect to PostgreSQL server
- Expected: Can browse database tables

---

## 🐛 Troubleshooting

### Certificate Warnings in Browser

**Problem:** Browser shows "Your connection is not private"

**Solution:**
1. Make sure CA certificate is trusted (Step 2)
2. Restart browser completely
3. Or type `thisisunsafe` on the warning page (Chrome/Edge)

### Cannot Access Service

**Problem:** `ERR_NAME_NOT_RESOLVED`

**Solution:**
1. Verify `/etc/hosts`: `cat /etc/hosts | grep waris`
2. Ping the domain: `ping waris.local`
3. Check Traefik is running: `docker ps | grep traefik`

### Service Not Starting

**Problem:** Service shows "Restarting" or "Unhealthy"

**Solution:**
```bash
# Check logs
docker compose -f docker-compose.traefik.yml logs service-name

# Restart service
docker compose -f docker-compose.traefik.yml restart service-name

# Rebuild if needed
docker compose -f docker-compose.traefik.yml build --no-cache service-name
docker compose -f docker-compose.traefik.yml up -d service-name
```

### Port Already in Use

**Problem:** `Bind for 0.0.0.0:443 failed: port is already allocated`

**Solution:**
```bash
# Check what's using port 80/443
sudo lsof -i :80
sudo lsof -i :443

# Stop conflicting service
sudo systemctl stop apache2  # or nginx
```

### Slow Performance

**Solution:**
```bash
# Check resource usage
docker stats

# Increase Docker resources (Docker Desktop)
# Settings → Resources → Increase CPU/Memory

# Or disable unnecessary services in docker-compose.traefik.yml
```

---

## 📚 Full Documentation

For complete documentation, see:

- **[TRAEFIK_SETUP.md](TRAEFIK_SETUP.md)** - Complete Traefik setup guide
- **[LOCAL_SETUP.md](LOCAL_SETUP.md)** - Basic local development setup
- **[README.md](README.md)** - Project overview

---

## 🔄 Switching Between Setups

### From Simple Docker to Traefik

```bash
# Stop simple setup (keep data)
docker compose -f docker-compose.dev.yml down

# Start Traefik setup (reuses data)
./scripts/traefik-start.sh
```

### From Traefik to Simple Docker

```bash
# Stop Traefik setup (keep data)
docker compose -f docker-compose.traefik.yml down

# Start simple setup (reuses data)
docker compose -f docker-compose.dev.yml up -d
```

Data is preserved as long as you don't use `-v` flag.

---

## 🎯 Development Workflow

### Daily Usage

1. **Start services** (once):
   ```bash
   cd platform/infra/docker
   docker compose -f docker-compose.traefik.yml up -d
   ```

2. **Develop locally** - Edit files in:
   - Frontend: `apps/web/`
   - Backend: `apps/api/`
   - AI: `apps/ai/`

3. **Changes auto-reload** - No restart needed

4. **View logs** if issues:
   ```bash
   docker compose -f docker-compose.traefik.yml logs -f
   ```

5. **Stop when done**:
   ```bash
   docker compose -f docker-compose.traefik.yml down
   ```

### Before Committing

```bash
# Lint code
npm run lint

# Type check
npm run typecheck

# Run tests
npm test

# Format code
npm run format
```

---

## ⚡ Performance Tips

1. **Keep services running** - Don't stop between coding sessions
2. **Monitor resources** - Use `docker stats` to check usage
3. **Selective services** - Comment out unused services in docker-compose
4. **Use .dockerignore** - Already configured for optimal builds
5. **Layer caching** - Dockerfiles optimized for build speed

---

## 🔐 Security Notes

### For Development
- Self-signed certificates are fine
- Default passwords are acceptable
- All services exposed on localhost

### For Production
**MUST CHANGE:**
- All passwords (database, admin tools)
- SSL certificates (use Let's Encrypt or commercial)
- Enable authentication on APIs
- Restrict IP access
- Use secrets management

---

## 📞 Getting Help

1. **Check this guide** - Most common issues covered
2. **Check logs** - `docker compose logs -f`
3. **Check Traefik dashboard** - https://traefik.waris.local:8080
4. **Review full docs** - [TRAEFIK_SETUP.md](TRAEFIK_SETUP.md)

---

## ✅ Checklist

Before starting development:

- [ ] SSL certificates generated
- [ ] CA certificate trusted
- [ ] `/etc/hosts` configured
- [ ] All services running (`docker compose ps`)
- [ ] Can access https://waris.local
- [ ] Can access https://api.waris.local/docs
- [ ] Traefik dashboard accessible
- [ ] Database connections work

---

<div align="center">

**🚀 You're Ready to Develop with WARIS! 🚀**

*Production-like environment with automatic HTTPS*

[Main README](README.md) • [Local Setup](LOCAL_SETUP.md) • [Full Traefik Docs](TRAEFIK_SETUP.md)

</div>
