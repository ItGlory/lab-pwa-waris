# WARIS Troubleshooting Guide

> คู่มือแก้ไขปัญหาที่พบบ่อยในระบบ WARIS
> Quick reference สำหรับ common issues

**Last Updated**: 2026-01-14

---

## 🚨 Emergency Quick Fixes

### ระบบไม่ทำงาน - ทำตามนี้ก่อน!

```bash
# 1. Restart ทุกอย่าง
cd platform/infra/docker
docker compose -f docker-compose.traefik.yml restart

# 2. ยังไม่ได้ - ลอง clean restart
docker compose -f docker-compose.traefik.yml down
docker compose -f docker-compose.traefik.yml up -d

# 3. ยังไม่ได้ - nuclear option
docker compose -f docker-compose.traefik.yml down -v
docker system prune -f
docker compose -f docker-compose.traefik.yml up -d

# 4. Check status
docker ps
docker compose -f docker-compose.traefik.yml ps
```

---

## 📑 ปัญหาแบ่งตามหมวด

### [A. Container Issues](#a-container-issues)
### [B. Network & Connection](#b-network--connection)
### [C. Frontend Issues](#c-frontend-issues)
### [D. Backend API Issues](#d-backend-api-issues)
### [E. Database Issues](#e-database-issues)
### [F. Traefik Issues](#f-traefik-issues)
### [G. SSL/Certificate Issues](#g-sslcertificate-issues)
### [H. Performance Issues](#h-performance-issues)

---

## A. Container Issues

### A1. Container ไม่ start

**อาการ**:
```bash
$ docker ps
# ไม่เห็น container ที่ต้องการ
```

**วิธีตรวจสอบ**:
```bash
# ดู container ทั้งหมด (รวมที่หยุด)
docker ps -a

# ดู logs
docker logs <container-name>
```

**สาเหตุที่พบบ่อย**:

1. **Port conflict**
```bash
# ตรวจสอบ
lsof -i :3000
lsof -i :8000
lsof -i :8443

# แก้ไข: Kill process
kill -9 <PID>
```

2. **Image build failed**
```bash
# Rebuild
docker compose -f docker-compose.traefik.yml build --no-cache web
docker compose -f docker-compose.traefik.yml up -d web
```

3. **Volume permission issues**
```bash
# Check permissions
docker exec <container> ls -la /app

# Fix (if needed)
sudo chmod -R 755 platform/apps/web
```

### A2. Container restart loop

**อาการ**: Container เปิดแล้วปิดซ้ำๆ

**วิธีตรวจสอบ**:
```bash
# ดู restart count
docker ps -a --format "table {{.Names}}\t{{.Status}}"

# ดู logs แบบ follow
docker logs -f <container-name>
```

**สาเหตุที่พบบ่อย**:

1. **Application crash at startup**
```bash
# Debug: Run shell in container
docker run -it --entrypoint sh <image-name>

# Check if command works
npm run dev  # หรือคำสั่งที่กำหนดใน CMD
```

2. **Missing environment variables**
```bash
# Check env vars
docker exec <container> env | grep -E 'DATABASE|API|REDIS'

# Add missing vars in docker-compose.yml
```

3. **Health check fails too fast**
```yaml
# Adjust health check in docker-compose.yml
healthcheck:
  interval: 30s
  timeout: 10s
  start_period: 60s  # เพิ่มเวลา start
  retries: 5
```

### A3. Container healthy แต่ไม่ตอบ requests

**วิธีตรวจสอบ**:
```bash
# Test from inside container
docker exec waris-web wget -qO- http://localhost:3000

# Test from host
curl http://localhost:3000
```

**แก้ไข**:
- ตรวจสอบว่า application bind to `0.0.0.0` ไม่ใช่ `127.0.0.1`
- ตรวจสอบ port mapping ใน docker-compose.yml

---

## B. Network & Connection

### B1. Cannot access waris.local

**อาการ**: Browser แสดง "This site can't be reached"

**Checklist**:

```bash
# 1. Check hosts file
cat /etc/hosts | grep waris
# ต้องมี: 127.0.0.1 waris.local api.waris.local

# 2. Test DNS
ping waris.local
# ควรได้ 127.0.0.1

# 3. Test port
nc -zv localhost 8443
# ควรได้ Connection succeeded

# 4. Test Traefik
curl -k https://waris.local:8443/
```

**แก้ไข**:

1. **ถ้า hosts file ไม่มี**:
```bash
echo "127.0.0.1 waris.local api.waris.local" | sudo tee -a /etc/hosts
```

2. **ถ้า Traefik ไม่ทำงาน**:
```bash
docker restart waris-traefik
sleep 5
curl http://localhost:8888  # Traefik dashboard
```

3. **ถ้ายังไม่ได้ - ใช้ direct access**:
```bash
open http://localhost:3000  # Frontend
open http://localhost:8000  # API
```

### B2. Containers ติดต่อกันไม่ได้

**อาการ**: Frontend ติดต่อ Backend ไม่ได้

**วิธีตรวจสอบ**:
```bash
# 1. Check network
docker network ls | grep waris
docker network inspect waris-network

# 2. Test connectivity
docker exec waris-web ping -c 2 waris-api
docker exec waris-web wget -qO- http://waris-api:8000

# 3. Check DNS
docker exec waris-web nslookup waris-api
```

**แก้ไข**:

1. **Reconnect to network**:
```bash
docker network disconnect waris-network waris-web
docker network connect waris-network waris-web
```

2. **Recreate network**:
```bash
docker compose -f docker-compose.traefik.yml down
docker network rm waris-network
docker compose -f docker-compose.traefik.yml up -d
```

### B3. CORS errors

**อาการ**: Console แสดง CORS policy errors

**วิธีตรวจสอบ**:
```bash
# Test CORS headers
curl -H "Origin: https://waris.local:8443" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     -v \
     https://api.waris.local:8443/api/v1/dmas
```

**แก้ไข**:

1. **Backend**: เพิ่ม CORS middleware
```python
# platform/apps/api/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://waris.local:8443"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

2. **Traefik**: เพิ่ม CORS headers
```yaml
# platform/infra/docker/traefik/dynamic/middlewares.yml
http:
  middlewares:
    cors:
      headers:
        accessControlAllowOriginList:
          - "https://waris.local:8443"
        accessControlAllowMethods:
          - "GET"
          - "POST"
          - "PUT"
          - "DELETE"
        accessControlAllowHeaders:
          - "Content-Type"
          - "Authorization"
```

---

## C. Frontend Issues

### C1. Frontend blank page / white screen

**วิธีตรวจสอบ**:
```bash
# 1. Check container logs
docker logs waris-web --tail 100

# 2. Check browser console
# กด F12 → Console tab

# 3. Test direct access
curl http://localhost:3000
```

**สาเหตุที่พบบ่อย**:

1. **JavaScript errors**:
   - เปิด browser console ดู errors
   - แก้ตาม error message

2. **API not reachable**:
```bash
# Test API from frontend container
docker exec waris-web wget -qO- http://waris-api:8000
```

3. **Environment variables wrong**:
```bash
# Check env vars
docker exec waris-web env | grep NEXT_PUBLIC

# Should have:
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

### C2. Hot reload ไม่ทำงาน

**อาการ**: แก้ไขไฟล์แล้วไม่ refresh

**แก้ไข**:

1. **Check volume mount**:
```bash
docker inspect waris-web | grep -A 10 Mounts
# ต้องมี: platform/apps/web:/app
```

2. **Restart container**:
```bash
docker restart waris-web
```

3. **ถ้ายังไม่ได้ - run locally**:
```bash
cd platform/apps/web
npm install
npm run dev
```

### C3. Build errors

**อาการ**: `npm run build` failed

**วิธีแก้**:

1. **Clear cache**:
```bash
cd platform/apps/web
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build
```

2. **Check TypeScript errors**:
```bash
npm run typecheck
```

3. **Check for circular dependencies**:
```bash
npx madge --circular --extensions ts,tsx src/
```

---

## D. Backend API Issues

### D1. API returns 500 errors

**วิธีตรวจสอบ**:
```bash
# Check logs
docker logs waris-api --tail 50 --follow

# Test endpoint
curl http://localhost:8000/health
```

**สาเหตุที่พบบ่อย**:

1. **Database connection failed**:
```bash
# Test database
docker exec waris-postgres psql -U waris -c "SELECT 1"

# Check connection string
docker exec waris-api env | grep DATABASE_URL
```

2. **Missing dependencies**:
```bash
# Rebuild
docker compose -f docker-compose.traefik.yml build --no-cache api
docker compose -f docker-compose.traefik.yml up -d api
```

### D2. API slow response

**วิธีตรวจสอบ**:
```bash
# Measure response time
curl -w "@-" -o /dev/null -s http://localhost:8000/api/v1/dmas << 'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
      time_redirect:  %{time_redirect}\n
   time_pretransfer:  %{time_pretransfer}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
EOF
```

**สาเหตุที่พบบ่อย**:

1. **Slow database queries**:
```sql
-- Check slow queries (PostgreSQL)
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

2. **No database indexes**:
```sql
-- Add indexes
CREATE INDEX idx_dmas_branch_id ON dmas(branch_id);
CREATE INDEX idx_readings_dma_id_time ON readings(dma_id, reading_time);
```

### D3. WebSocket connection fails

**อาการ**: Console แสดง "WebSocket connection failed"

**แก้ไข**:

ใน development mode - WebSocket ถูกปิดโดยตั้งใจ:
```typescript
// platform/apps/web/hooks/use-websocket.ts
if (process.env.NODE_ENV === 'development') {
  console.log(`WebSocket disabled in development`);
  return;
}
```

ถ้าต้องการเปิดใช้:
1. ลบ code block นี้ออก
2. Implement WebSocket endpoint ใน backend
3. Restart containers

---

## E. Database Issues

### E1. PostgreSQL won't start

**วิธีตรวจสอบ**:
```bash
# Check logs
docker logs waris-postgres --tail 50

# Common errors:
# - "role does not exist"
# - "database does not exist"
# - "could not create lock file"
```

**แก้ไข**:

1. **Remove and recreate**:
```bash
docker compose -f docker-compose.traefik.yml down postgres
docker volume rm docker_postgres-data
docker compose -f docker-compose.traefik.yml up -d postgres

# Wait for init
sleep 10

# Test connection
docker exec waris-postgres psql -U waris -c "SELECT version()"
```

2. **Fix permissions**:
```bash
# On macOS
docker exec -u root waris-postgres chown -R postgres:postgres /var/lib/postgresql/data
docker restart waris-postgres
```

### E2. Database connection pool exhausted

**อาการ**: "too many connections" errors

**วิธีตรวจสอบ**:
```sql
-- Check current connections
SELECT count(*) FROM pg_stat_activity;

-- Check max connections
SHOW max_connections;
```

**แก้ไข**:

```yaml
# docker-compose.traefik.yml
services:
  postgres:
    command: postgres -c max_connections=200
```

### E3. Database migrations failed

**วิธีตรวจสอบ**:
```bash
# Check migration status
docker exec waris-api alembic current
docker exec waris-api alembic history
```

**แก้ไข**:

```bash
# Reset migrations (DANGER: loses data!)
docker exec waris-api alembic downgrade base
docker exec waris-api alembic upgrade head

# Or: Drop and recreate database
docker exec waris-postgres psql -U waris -c "DROP DATABASE waris"
docker exec waris-postgres psql -U waris -c "CREATE DATABASE waris"
docker exec waris-api alembic upgrade head
```

---

## F. Traefik Issues

### F1. Traefik dashboard not accessible

**วิธีตรวจสอบ**:
```bash
# Check if Traefik running
docker ps | grep traefik

# Check logs
docker logs waris-traefik --tail 50

# Test dashboard
curl http://localhost:8888
```

**แก้ไข**:
```bash
# Restart Traefik
docker restart waris-traefik

# Check configuration
docker exec waris-traefik cat /etc/traefik/traefik.yml
```

### F2. Routes not working

**วิธีตรวจสอบ**:
```bash
# List all routers
curl -s http://localhost:8888/api/http/routers | jq

# Check specific router
curl -s http://localhost:8888/api/http/routers/web@file | jq

# Check if service is UP
curl -s http://localhost:8888/api/http/services/web@file | jq '.serverStatus'
```

**แก้ไข**:

1. **Reload configuration**:
```bash
docker exec waris-traefik kill -HUP 1
```

2. **Check File Provider files**:
```bash
# Validate YAML syntax
docker exec waris-traefik cat /etc/traefik/dynamic/services.yml

# Check for errors
docker logs waris-traefik | grep -i error
```

3. **Recreate routes** (edit `services.yml` then):
```bash
docker restart waris-traefik
```

### F3. Docker Provider not working

**อาการ**: Traefik ไม่เห็น containers

**สาเหตุ**: Docker Desktop บน macOS มีปัญหา compatibility

**แก้ไข**: ใช้ File Provider แทน (แนะนำ)

ดู: [docs/LESSONS_LEARNED.md#1-traefik-docker-provider-issues](./LESSONS_LEARNED.md#1-traefik-docker-provider-issues)

---

## G. SSL/Certificate Issues

### G1. Browser แสดง "Your connection is not private"

**อาการ**: NET::ERR_CERT_AUTHORITY_INVALID

**สาเหตุ**: ใช้ self-signed certificate

**แก้ไข** (3 options):

**Option 1**: กด "Advanced" → "Proceed to waris.local (unsafe)"

**Option 2**: Trust certificate
```bash
# Export cert from Traefik
docker exec waris-traefik cat /letsencrypt/acme.json

# Add to keychain (macOS)
sudo security add-trusted-cert -d -r trustRoot \
  -k /Library/Keychains/System.keychain waris.crt
```

**Option 3**: Use mkcert (recommended)
```bash
brew install mkcert
mkcert -install
mkcert waris.local api.waris.local

# Then mount certificates in Traefik
# (requires docker-compose.yml modification)
```

### G2. Certificate expired

**วิธีตรวจสอบ**:
```bash
# Check certificate expiry
echo | openssl s_client -connect waris.local:8443 2>/dev/null | \
  openssl x509 -noout -dates
```

**แก้ไข**:
```bash
# Delete ACME storage
docker exec waris-traefik rm -f /letsencrypt/acme.json

# Restart Traefik (will generate new cert)
docker restart waris-traefik
```

---

## H. Performance Issues

### H1. Slow page load

**วิธีวัด**:
```bash
# Measure total load time
curl -w "@-" -o /dev/null -s -k https://waris.local:8443/ << 'EOF'
         time_total:  %{time_total}\n
EOF
```

**ปกติควรได้**:
- First load: < 5 seconds
- Cached: < 2 seconds

**ถ้าช้ากว่านี้**:

1. **Check Traefik overhead**:
```bash
# Direct access
time curl http://localhost:3000 > /dev/null

# Via Traefik
time curl -k https://waris.local:8443 > /dev/null

# Difference = Traefik overhead (should be < 100ms)
```

2. **Check Next.js build**:
```bash
cd platform/apps/web
npm run build  # Should complete in < 60s
```

3. **Check resource usage**:
```bash
docker stats --no-stream
```

### H2. High CPU usage

**วิธีตรวจสอบ**:
```bash
# Top CPU containers
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}"

# Specific container
docker stats waris-web --no-stream
```

**แก้ไข**:

1. **Limit resources**:
```yaml
# docker-compose.traefik.yml
services:
  web:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
```

2. **Check for infinite loops**:
```bash
docker logs waris-web | grep -i error
```

### H3. High memory usage

**วิธีตรวจสอบ**:
```bash
# Memory usage
docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}"
```

**แก้ไข**:

1. **Restart container**:
```bash
docker restart <container>
```

2. **Increase memory limit**:
```yaml
# docker-compose.traefik.yml
services:
  api:
    environment:
      - NODE_OPTIONS=--max-old-space-size=4096  # 4GB
```

---

## 🆘 Still Having Issues?

### Step 1: Collect Information

```bash
# Run diagnostic script
cat > /tmp/waris-diagnostic.sh << 'EOF'
#!/bin/bash
echo "=== WARIS Diagnostic Report ==="
echo "Date: $(date)"
echo ""

echo "=== Docker Version ==="
docker version
echo ""

echo "=== Running Containers ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "=== Container Health ==="
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -v "healthy"
echo ""

echo "=== Network ==="
docker network ls | grep waris
docker network inspect waris-network --format '{{json .Containers}}' | jq
echo ""

echo "=== Disk Space ==="
df -h | grep -E "(Filesystem|/dev/)"
docker system df
echo ""

echo "=== Recent Logs (last 20 lines each) ==="
for container in waris-traefik waris-web waris-api waris-postgres; do
    echo "--- $container ---"
    docker logs $container --tail 20 2>&1
    echo ""
done

echo "=== Traefik Routes ==="
curl -s http://localhost:8888/api/http/routers | jq '.[] | {name, status, rule}' 2>/dev/null
echo ""

echo "=== Hosts File ==="
cat /etc/hosts | grep waris
echo ""

echo "=== Port Check ==="
for port in 3000 8000 8090 8443 8888; do
    echo -n "Port $port: "
    lsof -i :$port | head -2
done
echo ""

echo "=== End of Report ==="
EOF

chmod +x /tmp/waris-diagnostic.sh
/tmp/waris-diagnostic.sh > ~/waris-diagnostic.txt 2>&1

echo "Report saved to: ~/waris-diagnostic.txt"
```

### Step 2: Review Checklist

- [ ] อ่าน error message อย่างละเอียด
- [ ] ค้นหาใน [LESSONS_LEARNED.md](./LESSONS_LEARNED.md)
- [ ] ค้นหาใน troubleshooting guide นี้
- [ ] ลอง restart containers
- [ ] ตรวจสอบ logs
- [ ] ลอง clean restart
- [ ] Search GitHub issues
- [ ] ถามทีม

### Step 3: Report Issue

ถ้าแก้ไขไม่ได้ ให้รวบรวมข้อมูลเหล่านี้:

1. **Environment**:
   - OS และ version
   - Docker Desktop version
   - Architecture (Intel/Apple Silicon)

2. **Error Details**:
   - Error message เต็มๆ
   - Steps to reproduce
   - Expected vs actual behavior

3. **Logs**:
   - Diagnostic report จาก script ด้านบน
   - Screenshot (ถ้ามี)

4. **What You've Tried**:
   - รายการสิ่งที่ลองแล้ว
   - Results ของแต่ละ attempt

---

## 📚 Additional Resources

- [LESSONS_LEARNED.md](./LESSONS_LEARNED.md) - ประสบการณ์และบทเรียน
- [QUICKSTART.md](./setup/QUICKSTART.md) - Quick start guide
- [LOCAL_SETUP.md](./setup/LOCAL_SETUP.md) - Detailed setup
- [TRAEFIK_SETUP.md](./setup/TRAEFIK_SETUP.md) - Traefik configuration

---

**Remember**: เมื่อแก้ไขปัญหาได้แล้ว **กรุณาอัพเดทเอกสารนี้** เพื่อช่วยคนต่อไป! 🙏
