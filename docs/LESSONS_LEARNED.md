# Lessons Learned - WARIS Local Development Setup

> บันทึกปัญหาและวิธีแก้ไขที่พบระหว่างการติดตั้งระบบ WARIS ครั้งแรก
> สำหรับอ้างอิงในอนาคต

**วันที่**: 14 มกราคม 2026
**สภาพแวดล้อม**: macOS (Apple Silicon), Docker Desktop 4.56.0

---

## 📋 สารบัญ

1. [Traefik Docker Provider Issues](#1-traefik-docker-provider-issues)
2. [Frontend Build Issues](#2-frontend-build-issues)
3. [Database Compatibility](#3-database-compatibility)
4. [SSL/TLS Certificates](#4-ssltls-certificates)
5. [Network Configuration](#5-network-configuration)
6. [Development Workflow](#6-development-workflow)
7. [Quick Reference](#7-quick-reference)

---

## 1. Traefik Docker Provider Issues

### ❌ ปัญหา
Traefik ไม่สามารถเชื่อมต่อกับ Docker API บน macOS Docker Desktop ได้

```
ERR Failed to retrieve information of the docker client and server host
error="Error response from daemon: " providerName=docker
```

### 🔍 สาเหตุ
1. **Docker Desktop on macOS** ใช้ VM และมี socket path ที่แตกต่างจาก Linux
2. **Docker API Negotiation** ระหว่าง Traefik และ Docker Desktop มีปัญหา compatibility
3. **Socket Mounting** - symlink `/var/run/docker.sock` ไม่ทำงานใน container context

### ✅ วิธีแก้ไข

#### แก้ไขชั่วคราว (Workaround - แนะนำ):
ใช้ **Traefik File Provider** แทน Docker Provider

```yaml
# platform/infra/docker/traefik/dynamic/services.yml
http:
  routers:
    web:
      entryPoints:
        - websecure
      rule: "Host(`waris.local`)"
      service: web
      tls:
        certResolver: default

    api:
      entryPoints:
        - websecure
      rule: "Host(`api.waris.local`)"
      service: api
      tls:
        certResolver: default

  services:
    web:
      loadBalancer:
        servers:
          - url: "http://waris-web:3000"

    api:
      loadBalancer:
        servers:
          - url: "http://waris-api:8000"
```

#### แก้ไขแบบถาวร (ถ้า Docker Provider จำเป็น):
1. ใช้ Traefik version ที่รองรับ Docker Desktop API ล่าสุด
2. ลอง downgrade Docker Desktop version
3. ใช้ Colima แทน Docker Desktop
4. ใช้ Linux VM (Multipass, UTM)

### 📚 บทเรียน
- **File Provider มีเสถียรภาพมากกว่า** สำหรับ local development
- **Docker Desktop บน macOS มีข้อจำกัด** เรื่อง socket communication
- **Static routes ง่ายกว่า dynamic discovery** สำหรับโปรเจค scale เล็ก

---

## 2. Frontend Build Issues

### ❌ ปัญหา
Next.js 16 + React 19.2 มี peer dependency conflicts

```
npm ERR! ERESOLVE could not resolve
npm ERR! While resolving: @waris/web@0.1.0
npm ERR! Found: next@16.0.0
npm ERR! Could not resolve dependency: next-intl@"^3.25.0"
```

### 🔍 สาเหตุ
1. **Next.js 16 เป็น cutting-edge version** - dependencies ยังไม่รองรับครบ
2. **React 19.2 เพิ่ง stable** - ecosystem ยังปรับตัวไม่ทัน
3. **Workspace dependencies** (`@waris/shared`) ยังไม่มีจริงใน npm registry

### ✅ วิธีแก้ไข

#### 1. ใช้ `--legacy-peer-deps` flag
```dockerfile
# platform/apps/web/Dockerfile
RUN npm install --legacy-peer-deps
```

#### 2. เอา workspace dependencies ออก
```json
{
  "dependencies": {
    // ลบออก: "@waris/shared": "*",
    "@tanstack/react-query": "^5.62.0"
  }
}
```

#### 3. สร้าง missing library files
ต้องสร้างไฟล์เหล่านี้เอง:
- `lib/utils.ts` - className utilities
- `lib/formatting.ts` - Thai date/number formatting
- `lib/auth-context.tsx` - Authentication context
- `lib/mock-geojson.ts` - Mock map data
- `lib/mock-data/predictions.json` - Mock AI data

### 📚 บทเรียน
- **Turbopack ยัง unstable** - ควรใช้ webpack ใน production
- **Bleeding edge tech มี trade-offs** - พิจารณาใช้ stable versions
- **Mock data structure ต้องตรงกับ types** - validate schema ก่อน deploy
- **Monorepo setup ต้อง configure ให้ถูกต้อง** - ใช้ Turborepo/nx properly

---

## 3. Database Compatibility

### ❌ ปัญหา 1: PostgreSQL 18 Volume Structure
```
Error: in 18+, these Docker images are configured to store database data in a
format which is compatible with "pg_ctlcluster"...
```

**แก้ไข**: Downgrade เป็น PostgreSQL 17
```yaml
services:
  postgres:
    image: postgres:17-alpine  # เปลี่ยนจาก 18
```

### ❌ ปัญหา 2: Thai Locale ไม่มี
```
initdb: error: invalid locale name "th_TH.UTF-8"
```

**แก้ไข**: ใช้ C.UTF-8 แทน
```yaml
environment:
  - LC_ALL=C.UTF-8      # เปลี่ยนจาก th_TH.UTF-8
  - LANG=C.UTF-8
```

### 📚 บทเรียน
- **ใช้ stable database versions** - PostgreSQL 17 > 18 (ณ ม.ค. 2026)
- **Alpine images มี locale จำกัด** - ใช้ C.UTF-8 หรือ full images
- **Test database upgrades ก่อน** - volume compatibility เปลี่ยนได้
- **Thai locale setup ยุ่งยาก** - handle formatting ใน application layer

---

## 4. SSL/TLS Certificates

### ⚠️ ปัญหา
Self-signed certificates ทำให้ browser แสดง warning

### ✅ วิธีจัดการ

#### สำหรับ Development (แนะนำ):
**Option 1**: กด "Advanced" → "Proceed" ใน browser (ง่ายที่สุด)

**Option 2**: Trust certificate ใน System Keychain (macOS)
```bash
# Export certificate จาก Traefik
docker exec waris-traefik cat /letsencrypt/acme.json | \
  jq -r '.default.Certificates[0].certificate' | \
  base64 -d > waris.crt

# Add to keychain
sudo security add-trusted-cert -d -r trustRoot \
  -k /Library/Keychains/System.keychain waris.crt
```

**Option 3**: ใช้ mkcert (recommended for teams)
```bash
# Install mkcert
brew install mkcert
mkcert -install

# Generate certificates
mkcert waris.local api.waris.local

# Use in Traefik
# (modify docker-compose to mount certificates)
```

#### สำหรับ Production:
ใช้ Let's Encrypt + DNS challenge (Traefik รองรับอยู่แล้ว)

### 📚 บทเรียน
- **mkcert ดีที่สุดสำหรับ team development** - แชร์ CA ได้
- **Let's Encrypt ACME ใช้ไม่ได้กับ .local domains** - ต้องใช้ real domain
- **HTTP/2 ต้องใช้ HTTPS** - ไม่มีทางเลือก
- **Certificate expiry ต้องจัดการ** - ACME auto-renew ช่วยได้

---

## 5. Network Configuration

### ❌ ปัญหา: Port Conflicts
Traefik ปกติใช้ port 80, 443, 8080 ซึ่งอาจชนกับ services อื่น

### ✅ วิธีแก้ไข
ใช้ alternative ports:
```yaml
ports:
  - "8090:80"      # HTTP (แทน 80)
  - "8443:443"     # HTTPS (แทน 443)
  - "8888:8080"    # Dashboard (แทน 8080)
```

### 🔍 ตรวจสอบ Port Conflicts
```bash
# macOS
lsof -i :80
lsof -i :443
lsof -i :8080

# Kill process
kill -9 <PID>
```

### 📚 บทเรียน
- **ตรวจสอบ ports ก่อนเสมอ** - `docker ps`, `lsof`, `netstat`
- **Use high ports (>1024) ไม่ต้อง sudo** - ง่ายกว่า
- **Document port mappings** - ใส่ใน README
- **Docker network isolation ดี** - ใช้ internal networks

---

## 6. Development Workflow

### 🎯 Best Practices ที่ค้นพบ

#### 1. WebSocket ใน Development
ปิดการใช้งาน WebSocket ใน dev mode:
```typescript
// platform/apps/web/hooks/use-websocket.ts
if (process.env.NODE_ENV === 'development') {
  console.log(`WebSocket disabled in development`);
  return;
}
```

**เหตุผล**:
- Backend WebSocket endpoint อาจยังไม่พร้อม
- Mock data เพียงพอสำหรับ UI development
- ลด complexity ใน local setup

#### 2. Fixed Sidebar Layout
ใช้ `position: fixed` แทน `relative`:
```tsx
<aside className="fixed left-0 top-0 z-40 h-screen ...">
  {/* Sidebar content */}
</aside>

<main className={`lg:ml-64 ...`}>
  {/* Main content with margin */}
</main>
```

**เหตุผล**:
- Sidebar ติดหน้าจอตลอดเวลา (UX ดีกว่า)
- Smooth animation เมื่อ collapse/expand
- Mobile-friendly (overlay)

#### 3. Dockerfile Multi-stage Builds
แยก development และ production stages:
```dockerfile
# Development
FROM node:22-alpine AS development
CMD ["npm", "run", "dev"]

# Production
FROM node:22-alpine AS production
CMD ["npm", "start"]
```

**เหตุผล**:
- Dev mode มี hot reload + debugging tools
- Production optimized & smaller image
- Clear separation of concerns

#### 4. Direct Port Access
Expose ports สำหรับ direct access:
```yaml
services:
  web:
    ports:
      - "3000:3000"  # Direct access
    labels:
      - "traefik.http.routers.web.rule=Host(`waris.local`)"  # Traefik access
```

**เหตุผล**:
- Debug ได้ง่ายกว่า (bypass Traefik)
- Fallback เมื่อ Traefik มีปัญหา
- Testing performance (compare direct vs proxied)

### 📚 บทเรียน
- **Provide fallbacks** - direct access, mock data, graceful degradation
- **Optimize DX** - fast reload, clear errors, good logging
- **Document everything** - README, inline comments, troubleshooting guides
- **Use environment variables** - แยก config per environment

---

## 7. Quick Reference

### 🚀 Starting Services (Correct Order)

```bash
# 1. Start infrastructure
cd platform/infra/docker
docker compose -f docker-compose.traefik.yml up -d

# 2. Wait for health checks
docker compose -f docker-compose.traefik.yml ps

# 3. Verify Traefik dashboard
open http://localhost:8888

# 4. Check service status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 5. Test access
curl http://localhost:3000        # Frontend direct
curl http://localhost:8000        # API direct
curl -k https://waris.local:8443  # Frontend via Traefik
```

### 🔧 Common Troubleshooting Commands

```bash
# Check logs
docker logs waris-traefik --tail 50
docker logs waris-web --tail 50
docker logs waris-api --tail 50

# Check Traefik routes
curl -s http://localhost:8888/api/http/routers | jq

# Check Traefik services
curl -s http://localhost:8888/api/http/services | jq

# Restart specific service
docker compose -f docker-compose.traefik.yml restart traefik

# Clean restart (nuclear option)
docker compose -f docker-compose.traefik.yml down
docker volume prune -f
docker compose -f docker-compose.traefik.yml up -d

# Check network connectivity
docker exec waris-traefik ping -c 2 waris-web
docker exec waris-traefik ping -c 2 waris-api

# Test internal routing
docker exec waris-traefik wget -qO- http://waris-web:3000
docker exec waris-traefik wget -qO- http://waris-api:8000
```

### 🔍 Debugging Checklist

เมื่อเจอปัญหา ให้ตรวจสอบตามลำดับ:

- [ ] **Containers running?** - `docker ps`
- [ ] **Healthy status?** - `docker ps` (ดู STATUS column)
- [ ] **Ports exposed?** - `docker ps` (ดู PORTS column)
- [ ] **Network connected?** - `docker network inspect waris-network`
- [ ] **Direct access works?** - `curl http://localhost:3000`, `curl http://localhost:8000`
- [ ] **Traefik dashboard accessible?** - `curl http://localhost:8888`
- [ ] **Traefik sees services?** - `curl http://localhost:8888/api/http/services`
- [ ] **DNS resolves?** - `ping waris.local`
- [ ] **Hosts file configured?** - `cat /etc/hosts | grep waris`
- [ ] **Traefik routes configured?** - `curl http://localhost:8888/api/http/routers`
- [ ] **SSL cert issues?** - `curl -kv https://waris.local:8443`
- [ ] **Check logs** - `docker logs <container>`

### 📊 Performance Baseline

สำหรับเปรียบเทียบในอนาคต:

| Metric | Expected Value | Command |
|--------|---------------|---------|
| Container startup | < 30 seconds | `time docker compose up -d` |
| Frontend first load | < 5 seconds | `curl -w "%{time_total}\n" http://localhost:3000` |
| API response | < 100ms | `curl -w "%{time_total}\n" http://localhost:8000/health` |
| Traefik overhead | < 10ms | Compare direct vs proxied |
| Hot reload | < 2 seconds | Edit file → See changes |

---

## 🎯 Key Takeaways

### สิ่งที่ทำได้ดี ✅
1. ใช้ File Provider แทน Docker Provider (pragmatic solution)
2. Document ทุกปัญหาที่เจอ (คุณกำลังอ่านอยู่)
3. แยก commits ตาม functionality (ง่ายต่อการ rollback)
4. ใช้ multi-stage Dockerfile (optimize development)
5. Provide multiple access methods (direct + Traefik)

### สิ่งที่ควรปรับปรุง ⚠️
1. **Testing**: ยังไม่มี automated tests สำหรับ infrastructure
2. **Monitoring**: ควรเพิ่ม health checks ที่ละเอียดขึ้น
3. **Documentation**: ควรมี video walkthrough
4. **Security**: ยังใช้ default passwords, ควร use secrets manager
5. **CI/CD**: ยังไม่มี automated deployment pipeline

### ถัดไปควรทำ 🚀
1. เพิ่ม `.env.example` พร้อม comments ละเอียด
2. สร้าง `make` commands สำหรับ common tasks
3. Setup pre-commit hooks (linting, type checking)
4. เขียน integration tests สำหรับ critical paths
5. Document production deployment strategy

---

## 📞 Need Help?

เมื่อเจอปัญหาที่ไม่อยู่ในเอกสารนี้:

1. **Check logs first**: `docker logs <container> --tail 100`
2. **Search GitHub Issues**: [lab-pwa-waris/issues](https://github.com/...)
3. **Ask the team**: Slack channel #waris-dev
4. **Update this document**: PR welcome!

---

**สุดท้าย**: เอกสารนี้เขียนขึ้นจากประสบการณ์จริง ถ้าคุณเจอปัญหาและแก้ได้ **กรุณาอัพเดทเอกสารนี้** เพื่อคนต่อไป 🙏

**Last Updated**: 2026-01-14
**Contributors**: Claude Code Assistant, Development Team
