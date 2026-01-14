# WARIS - Traefik Reverse Proxy Setup Guide

Complete guide for running WARIS with Traefik reverse proxy for a production-like local development environment.

---

## Overview

This setup provides:

- **Traefik v3** as reverse proxy with automatic HTTPS
- **SSL/TLS** with self-signed certificates for local development
- **Service Discovery** via Docker labels
- **Dashboard** for monitoring and debugging
- **Multiple Admin Tools** (pgAdmin, Mongo Express, Redis Commander, MinIO Console)
- **Load Balancing** and health checks
- **Security Middlewares** (headers, rate limiting, CORS)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Your Browser                             │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS (443)
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Traefik Reverse Proxy                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Router     │  │  Middleware  │  │   Service    │          │
│  │   Rules      │→ │  (Security)  │→ │  Discovery   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────┬────────────┬────────────┬────────────┬─────────────┘
             │            │            │            │
             ↓            ↓            ↓            ↓
       ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
       │   Web   │  │   API   │  │   AI    │  │  Admin  │
       │ (Next)  │  │(FastAPI)│  │(Python) │  │  Tools  │
       └─────────┘  └─────────┘  └─────────┘  └─────────┘
             │            │            │            │
             └────────────┴────────────┴────────────┘
                              ↓
                    ┌──────────────────┐
                    │    Databases     │
                    │ PG | Mongo | Redis│
                    └──────────────────┘
```

---

## Quick Start

### Prerequisites

- Docker & Docker Compose installed
- OpenSSL installed (for certificate generation)
- **sudo** access (for adding hosts entries)

### Step 1: Generate SSL Certificates

```bash
cd /Users/fero/Desktop/Works/HX/PWA/lab-pwa-waris/platform/infra/docker/scripts
./generate-certs.sh
```

This will create self-signed certificates for `*.waris.local` domains.

### Step 2: Trust the CA Certificate

#### macOS
```bash
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain \
  /Users/fero/Desktop/Works/HX/PWA/lab-pwa-waris/platform/infra/docker/traefik/certs/ca.crt
```

#### Linux (Ubuntu/Debian)
```bash
sudo cp /Users/fero/Desktop/Works/HX/PWA/lab-pwa-waris/platform/infra/docker/traefik/certs/ca.crt \
  /usr/local/share/ca-certificates/waris-ca.crt
sudo update-ca-certificates
```

#### Windows
1. Double-click `ca.crt`
2. Click "Install Certificate"
3. Select "Local Machine"
4. Place in "Trusted Root Certification Authorities"

### Step 3: Add Hosts Entries

Edit your hosts file:

```bash
sudo nano /etc/hosts
```

Add these lines:

```
# WARIS Local Development
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

Save and exit (Ctrl+X, Y, Enter in nano).

### Step 4: Start WARIS with Traefik

```bash
cd /Users/fero/Desktop/Works/HX/PWA/lab-pwa-waris/platform/infra/docker
docker compose -f docker-compose.traefik.yml up -d
```

### Step 5: Access Services

Wait 2-3 minutes for all services to start, then access:

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | https://waris.local | - |
| **API** | https://api.waris.local | - |
| **API Docs** | https://api.waris.local/docs | - |
| **AI Services** | https://ai.waris.local | - |
| **Traefik Dashboard** | https://traefik.waris.local:8080 | - |
| **pgAdmin** | https://pgadmin.waris.local | admin@waris.local / admin |
| **Mongo Express** | https://mongo.waris.local | admin / admin |
| **Redis Commander** | https://redis.waris.local | - |
| **MinIO Console** | https://minio.waris.local | minioadmin / minioadmin |
| **MLflow** | https://mlflow.waris.local | - |
| **Ollama (LLM)** | https://llm.waris.local | - |

---

## Service Details

### Main Applications

#### 1. Frontend (Next.js 16)
- **URL**: https://waris.local
- **Port**: 3000 (internal)
- **Features**:
  - React 19.2 with Server Components
  - TailwindCSS 4 styling
  - Hot reload enabled

#### 2. Backend API (FastAPI)
- **URL**: https://api.waris.local
- **Port**: 8000 (internal)
- **Docs**: https://api.waris.local/docs
- **Features**:
  - Automatic API documentation
  - CORS enabled for frontend
  - Rate limiting: 50 req/min
  - Health endpoint: `/health`

#### 3. AI Services (Python)
- **URL**: https://ai.waris.local
- **Port**: 8001 (internal)
- **Features**:
  - AI model inference
  - RAG pipeline
  - Vector search integration

### Databases

#### PostgreSQL 18
- **Internal**: postgres:5432
- **User/Pass**: waris / waris
- **Database**: waris
- **Admin UI**: https://pgadmin.waris.local

#### MongoDB 8.2
- **Internal**: mongodb:27017
- **User/Pass**: waris / waris
- **Database**: waris
- **Admin UI**: https://mongo.waris.local

#### Redis 8
- **Internal**: redis:6379
- **Password**: waris
- **Admin UI**: https://redis.waris.local

#### Milvus 2.6 (Vector DB)
- **Internal**: milvus:19530
- **For**: RAG pipeline, embeddings

### Admin Tools

#### pgAdmin 4
- **URL**: https://pgadmin.waris.local
- **Email**: admin@waris.local
- **Password**: admin
- **Purpose**: PostgreSQL management

#### Mongo Express
- **URL**: https://mongo.waris.local
- **User/Pass**: admin / admin
- **Purpose**: MongoDB management

#### Redis Commander
- **URL**: https://redis.waris.local
- **Purpose**: Redis key management

#### MinIO Console
- **URL**: https://minio.waris.local
- **Access Key**: minioadmin
- **Secret Key**: minioadmin
- **Purpose**: S3-compatible object storage
- **API**: https://s3.waris.local

### ML Tools

#### MLflow
- **URL**: https://mlflow.waris.local
- **Purpose**: ML experiment tracking
- **Storage**: PostgreSQL + MinIO

#### Ollama (LLM Server)
- **URL**: https://llm.waris.local
- **Purpose**: Local LLM hosting
- **Models**: OpenThaiGPT, Typhoon 2

---

## Traefik Configuration

### Static Configuration

File: [platform/infra/docker/traefik/traefik.yml](platform/infra/docker/traefik/traefik.yml)

**Key Features:**
- Dashboard enabled on port 8080
- HTTP → HTTPS redirect
- Docker provider with service discovery
- File provider for dynamic config
- Access logs enabled
- Prometheus metrics

### Dynamic Configuration

#### TLS/SSL
File: [platform/infra/docker/traefik/dynamic/tls.yml](platform/infra/docker/traefik/dynamic/tls.yml)

- Self-signed certificates
- TLS 1.2+ minimum
- Modern cipher suites

#### Middlewares
File: [platform/infra/docker/traefik/dynamic/middlewares.yml](platform/infra/docker/traefik/dynamic/middlewares.yml)

**Security Headers:**
- XSS Protection
- Content Type Nosniff
- HSTS enabled
- Frame Options

**CORS:**
- Allowed origins: waris.local, api.waris.local
- Credentials support
- All HTTP methods

**Rate Limiting:**
- General: 100 req/min
- API: 50 req/min

**Other:**
- Compression (gzip)
- Circuit breaker
- Retry logic
- IP whitelist for admin

---

## Common Commands

### Start/Stop Services

```bash
cd platform/infra/docker

# Start all services
docker compose -f docker-compose.traefik.yml up -d

# Stop all services
docker compose -f docker-compose.traefik.yml down

# Stop and remove volumes (CAUTION: deletes data!)
docker compose -f docker-compose.traefik.yml down -v

# Restart specific service
docker compose -f docker-compose.traefik.yml restart api

# View logs
docker compose -f docker-compose.traefik.yml logs -f

# View logs for specific service
docker compose -f docker-compose.traefik.yml logs -f traefik
docker compose -f docker-compose.traefik.yml logs -f api
```

### Check Service Status

```bash
# List all services
docker compose -f docker-compose.traefik.yml ps

# Check service health
docker compose -f docker-compose.traefik.yml ps | grep healthy

# Inspect Traefik
docker inspect waris-traefik
```

### Traefik Commands

```bash
# View Traefik logs
docker logs -f waris-traefik

# Access Traefik CLI
docker exec -it waris-traefik traefik version

# Check configuration
docker exec -it waris-traefik cat /etc/traefik/traefik.yml
```

### Certificate Management

```bash
# Regenerate certificates
cd platform/infra/docker/scripts
./generate-certs.sh

# View certificate details
openssl x509 -in ../traefik/certs/waris.local.crt -text -noout

# Verify certificate
openssl verify -CAfile ../traefik/certs/ca.crt ../traefik/certs/waris.local.crt
```

---

## Development Workflow

### Hot Reload Development

Services with hot reload enabled:
- **Web** (Next.js): Edit files in `apps/web/`, changes reflect immediately
- **API** (FastAPI): Edit files in `apps/api/`, server auto-reloads
- **AI**: Edit files in `apps/ai/`, server auto-reloads

### Making Code Changes

```bash
# 1. Edit your code locally
nano apps/web/app/page.tsx

# 2. Changes auto-reload (no restart needed)

# 3. View logs if issues occur
docker compose -f docker-compose.traefik.yml logs -f web
```

### Adding New Routes

Traefik automatically discovers new services. Add labels to your service:

```yaml
services:
  my-new-service:
    image: my-image
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.my-service.rule=Host(`my-service.waris.local`)"
      - "traefik.http.routers.my-service.entrypoints=websecure"
      - "traefik.http.routers.my-service.tls=true"
      - "traefik.http.services.my-service.loadbalancer.server.port=8080"
```

Don't forget to add the host to `/etc/hosts`!

---

## Troubleshooting

### Issue: Certificate Not Trusted

**Symptoms:** Browser shows "Your connection is not private"

**Solutions:**

1. **Verify CA is installed:**
   ```bash
   # macOS
   security find-certificate -c "WARIS Local CA" -a

   # Linux
   ls /usr/local/share/ca-certificates/ | grep waris
   ```

2. **Reinstall CA certificate** (see Step 2 above)

3. **Restart browser** completely after installing CA

4. **In Chrome/Edge:** Type `thisisunsafe` on the warning page (bypass)

### Issue: Cannot Access Service

**Symptoms:** `ERR_NAME_NOT_RESOLVED` or `Connection refused`

**Solutions:**

1. **Check hosts file:**
   ```bash
   cat /etc/hosts | grep waris
   ```

2. **Verify service is running:**
   ```bash
   docker compose -f docker-compose.traefik.yml ps
   ```

3. **Check Traefik routing:**
   - Open https://traefik.waris.local:8080
   - Go to HTTP → Routers
   - Verify your service router is listed

4. **Check service logs:**
   ```bash
   docker compose -f docker-compose.traefik.yml logs service-name
   ```

### Issue: Service Won't Start

**Symptoms:** Service shows "Restarting" or "Unhealthy"

**Solutions:**

1. **Check logs:**
   ```bash
   docker compose -f docker-compose.traefik.yml logs -f service-name
   ```

2. **Check dependencies:**
   ```bash
   # Ensure databases are healthy first
   docker compose -f docker-compose.traefik.yml ps postgres mongodb redis
   ```

3. **Restart service:**
   ```bash
   docker compose -f docker-compose.traefik.yml restart service-name
   ```

4. **Rebuild image:**
   ```bash
   docker compose -f docker-compose.traefik.yml build --no-cache service-name
   docker compose -f docker-compose.traefik.yml up -d service-name
   ```

### Issue: Port Already in Use

**Symptoms:** `port is already allocated`

**Solutions:**

1. **Check what's using the port:**
   ```bash
   lsof -i :80
   lsof -i :443
   ```

2. **Stop conflicting service:**
   ```bash
   # If it's another Docker container
   docker ps
   docker stop <container-id>

   # If it's a system service (e.g., Apache)
   sudo systemctl stop apache2
   ```

3. **Change port in docker-compose.traefik.yml:**
   ```yaml
   ports:
     - "8080:80"    # Use 8080 instead of 80
     - "8443:443"   # Use 8443 instead of 443
   ```

### Issue: Slow Performance

**Solutions:**

1. **Check resource usage:**
   ```bash
   docker stats
   ```

2. **Increase Docker resources:**
   - Docker Desktop → Preferences → Resources
   - Increase CPU, Memory, Swap

3. **Disable unnecessary services:**
   ```bash
   # Comment out services you don't need in docker-compose.traefik.yml
   ```

4. **Check database indexes:**
   - Ensure proper indexes in PostgreSQL/MongoDB

### Issue: Traefik Dashboard Not Loading

**Solutions:**

1. **Check Traefik is running:**
   ```bash
   docker ps | grep traefik
   ```

2. **Check Traefik logs:**
   ```bash
   docker logs waris-traefik
   ```

3. **Verify port 8080 is exposed:**
   ```bash
   docker port waris-traefik
   ```

4. **Access directly:**
   - Try http://localhost:8080 (no HTTPS)

---

## Security Considerations

### For Development

- Self-signed certificates are ONLY for local development
- Default passwords are weak - acceptable for local only
- Admin UIs exposed - use IP whitelist middleware
- Rate limiting is lenient - tighten for production

### For Production

**MUST CHANGE:**

1. **All default passwords:**
   - PostgreSQL, MongoDB, Redis
   - pgAdmin, Mongo Express
   - MinIO access keys

2. **SSL certificates:**
   - Use real certificates (Let's Encrypt, commercial CA)
   - Update Traefik certificate resolver

3. **Security settings:**
   - Enable authentication on all admin UIs
   - Restrict IP access (not just localhost)
   - Increase rate limiting
   - Enable API authentication (JWT, OAuth)

4. **Secrets management:**
   - Use Docker secrets or vault
   - Never commit `.env` files

---

## Performance Optimization

### Traefik Optimizations

1. **Enable caching:**
   ```yaml
   http:
     middlewares:
       cache:
         plugin:
           souin:
             default_cache:
               ttl: 300s
   ```

2. **Enable compression:**
   - Already enabled in middlewares.yml
   - Reduces bandwidth by ~70%

3. **Connection pooling:**
   - Configured in Traefik for HTTP/2

### Database Optimizations

1. **PostgreSQL:**
   ```sql
   -- Create indexes on frequently queried columns
   CREATE INDEX idx_readings_dma_time ON water_loss_readings(dma_id, reading_time);
   ```

2. **MongoDB:**
   ```javascript
   // Create indexes
   db.logs.createIndex({ timestamp: -1 })
   ```

3. **Redis:**
   - Already using append-only file (AOF)
   - Configure maxmemory policy if needed

---

## Monitoring & Observability

### Traefik Dashboard

Access: https://traefik.waris.local:8080

**Features:**
- View all routers, services, middlewares
- Check HTTP/TCP traffic
- Monitor error rates
- View TLS certificates

### Metrics

Prometheus metrics available at:
```
http://localhost:8080/metrics
```

**Sample metrics:**
- `traefik_entrypoint_requests_total`
- `traefik_entrypoint_request_duration_seconds`
- `traefik_service_requests_total`

### Logs

**Access logs:**
```bash
docker exec waris-traefik tail -f /var/log/traefik/access.log
```

**Traefik logs:**
```bash
docker logs -f waris-traefik
```

**Application logs:**
```bash
docker compose -f docker-compose.traefik.yml logs -f web api ai
```

---

## Backup & Restore

### Backup Data

```bash
# PostgreSQL
docker exec waris-postgres pg_dump -U waris waris > waris_backup_$(date +%Y%m%d).sql

# MongoDB
docker exec waris-mongodb mongodump --username waris --password waris --out /tmp/backup
docker cp waris-mongodb:/tmp/backup ./mongodb_backup_$(date +%Y%m%d)

# Redis
docker exec waris-redis redis-cli --rdb /tmp/dump.rdb SAVE
docker cp waris-redis:/tmp/dump.rdb ./redis_backup_$(date +%Y%m%d).rdb

# All volumes
docker run --rm -v waris_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_data_$(date +%Y%m%d).tar.gz -C /data .
```

### Restore Data

```bash
# PostgreSQL
cat waris_backup_20260114.sql | docker exec -i waris-postgres psql -U waris waris

# MongoDB
docker cp mongodb_backup_20260114 waris-mongodb:/tmp/restore
docker exec waris-mongodb mongorestore --username waris --password waris /tmp/restore

# Redis
docker cp redis_backup_20260114.rdb waris-redis:/data/dump.rdb
docker restart waris-redis
```

---

## Migration from Simple Docker Setup

If you're currently using `docker-compose.dev.yml`:

### Step 1: Backup Data

```bash
# Follow backup instructions above
```

### Step 2: Stop Old Stack

```bash
docker compose -f docker-compose.dev.yml down
# Keep volumes by NOT using -v flag
```

### Step 3: Start Traefik Stack

```bash
# Generate certs (if not done)
cd scripts && ./generate-certs.sh && cd ..

# Start new stack
docker compose -f docker-compose.traefik.yml up -d
```

### Step 4: Verify

```bash
# Check all services are running
docker compose -f docker-compose.traefik.yml ps

# Test connections
curl -k https://api.waris.local/health
```

Data will be preserved as long as you didn't use `-v` flag when stopping.

---

## Advanced Configuration

### Custom Domain

Want to use a different domain? (e.g., `waris.dev`)

1. **Regenerate certificates:**
   Edit `scripts/generate-certs.sh`, change `DOMAIN="waris.dev"`

2. **Update docker-compose.traefik.yml:**
   Replace all `waris.local` with `waris.dev`

3. **Update /etc/hosts:**
   Use `waris.dev` instead of `waris.local`

### External Database

To use external database instead of containerized:

1. **Comment out database service** in docker-compose.traefik.yml

2. **Update environment variables:**
   ```yaml
   environment:
     DATABASE_URL: postgresql+asyncpg://user:pass@external-host:5432/waris
   ```

### Load Balancing

To run multiple instances of a service:

```yaml
services:
  api:
    deploy:
      replicas: 3
    # ... rest of config
```

Traefik will automatically load balance between instances.

---

## Uninstall

### Remove Everything

```bash
cd platform/infra/docker

# Stop and remove containers, networks, volumes
docker compose -f docker-compose.traefik.yml down -v

# Remove images
docker compose -f docker-compose.traefik.yml down --rmi all

# Remove certificates
rm -rf traefik/certs/*

# Remove CA from system (macOS)
sudo security delete-certificate -c "WARIS Local CA" /Library/Keychains/System.keychain

# Remove hosts entries
sudo nano /etc/hosts
# Delete WARIS lines
```

---

## Additional Resources

### Documentation
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

### WARIS Docs
- [Project README](README.md)
- [Local Setup Guide](LOCAL_SETUP.md)
- [Architecture Documentation](docs/architecture/)
- [API Documentation](docs/api/)

---

## Support

### Getting Help

1. **Check logs:** Most issues are visible in logs
2. **Traefik Dashboard:** Verify routing configuration
3. **Health endpoints:** Check `/health` on each service
4. **Documentation:** Review troubleshooting section

### Reporting Issues

When reporting issues, include:
- Output of `docker compose -f docker-compose.traefik.yml ps`
- Relevant logs from failing service
- Your OS and Docker version
- Steps to reproduce

---

<div align="center">

**WARIS with Traefik - Production-Ready Local Development** 🚀🔒

*Provincial Waterworks Authority (การประปาส่วนภูมิภาค)*

[Main README](README.md) • [Local Setup](LOCAL_SETUP.md) • [Documentation](docs/)

</div>
