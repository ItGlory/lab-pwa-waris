# WARIS - Quick Start Guide

เริ่มใช้งาน WARIS ได้ทันที! 🚀

## ✅ สถานะปัจจุบัน

ระบบพร้อมใช้งานแล้ว ทุก services ทำงานปกติ:

- ✅ Frontend (Next.js 16)
- ✅ Backend API (FastAPI)
- ✅ PostgreSQL 17
- ✅ MongoDB 8
- ✅ Redis 8
- ✅ Traefik (Dashboard only)

---

## 🌐 URLs สำหรับเข้าใช้งาน

### Applications

| Service | URL | สถานะ | รายละเอียด |
|---------|-----|-------|------------|
| **Frontend** | http://localhost:3000 | ✅ พร้อมใช้งาน | หน้าเว็บหลัก WARIS |
| **Backend API** | http://localhost:8000 | ✅ พร้อมใช้งาน | REST API endpoint |
| **API Docs** | http://localhost:8000/docs | ✅ พร้อมใช้งาน | Swagger UI (Interactive) |
| **API ReDoc** | http://localhost:8000/redoc | ✅ พร้อมใช้งาน | ReDoc (Alternative docs) |
| **API Health** | http://localhost:8000/health | ✅ พร้อมใช้งาน | Health check endpoint |

### Management Tools

| Service | URL | สถานะ |
|---------|-----|-------|
| **Traefik Dashboard** | http://localhost:8888 | ✅ พร้อมใช้งาน |

---

## 🚀 วิธีเริ่มใช้งาน

### 1. เปิด Frontend

```bash
# เปิดเบราว์เซอร์และไปที่
open http://localhost:3000

# หรือใช้คำสั่ง
curl http://localhost:3000
```

**หน้าจอที่จะเห็น:**
- หน้า Dashboard หลักของ WARIS
- แสดงข้อมูลน้ำสูญเสีย, DMA zones, แจ้งเตือน

### 2. ทดสอบ API

```bash
# ตรวจสอบสถานะ API
curl http://localhost:8000/health

# ผลลัพธ์ที่ควรได้:
# {"status":"healthy","status_th":"ปกติ"}

# เปิด API Documentation
open http://localhost:8000/docs
```

### 3. ดู Traefik Dashboard

```bash
# เปิด Traefik Dashboard
open http://localhost:8888
```

---

## 🛠️ การจัดการ Services

### ตรวจสอบสถานะ

```bash
# ดู services ทั้งหมด
docker ps | grep waris

# ตรวจสอบ logs
docker logs waris-web --tail 50
docker logs waris-api --tail 50
```

### Restart Services

```bash
cd /Users/fero/Desktop/Works/HX/PWA/lab-pwa-waris/platform/infra/docker

# Restart frontend
docker compose -f docker-compose.traefik.yml restart web

# Restart backend
docker compose -f docker-compose.traefik.yml restart api

# Restart ทั้งหมด
docker compose -f docker-compose.traefik.yml restart
```

### Stop/Start Services

```bash
# หยุด services
docker compose -f docker-compose.traefik.yml stop

# เริ่ม services
docker compose -f docker-compose.traefik.yml start

# หยุดและลบ containers
docker compose -f docker-compose.traefik.yml down

# เริ่มใหม่ทั้งหมด
docker compose -f docker-compose.traefik.yml up -d
```

---

## 📱 ฟีเจอร์ที่พร้อมใช้งาน

### Frontend Features
- ✅ Dashboard หลัก (แสดง KPI)
- ✅ DMA Management (จัดการพื้นที่จ่ายน้ำ)
- ✅ Alert System (ระบบแจ้งเตือน)
- ✅ Reports (รายงาน)
- ✅ Documents (เอกสาร)
- ✅ Chat Interface (ติดต่อ AI)
- ⚠️ ใช้ Mock Data (ข้อมูลจำลอง)

### Backend API Features
- ✅ Health Check Endpoint
- ✅ CORS Configuration
- ✅ FastAPI Auto Documentation
- ⚠️ Database Connected (พร้อมแต่ยังไม่มีข้อมูล)

---

## 🔧 Configuration

### Environment Variables

**Frontend** (`platform/apps/web`):
```env
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_TELEMETRY_DISABLED=1
```

**Backend** (`platform/apps/api`):
```env
DATABASE_URL=postgresql+asyncpg://waris:waris@postgres:5432/waris
MONGODB_URL=mongodb://waris:waris@mongodb:27017
REDIS_URL=redis://redis:6379
DEBUG=true
```

---

## 🐛 Troubleshooting

### Frontend ไม่โหลด

```bash
# ตรวจสอบ logs
docker logs waris-web --tail 100

# Restart container
docker restart waris-web

# ตรวจสอบว่า port ไม่ซ้ำ
lsof -i :3000
```

### API Error 500

```bash
# ตรวจสอบ logs
docker logs waris-api --tail 100

# ตรวจสอบ database connection
docker exec waris-postgres pg_isready

# Restart API
docker restart waris-api
```

### Port Already in Use

```bash
# หา process ที่ใช้ port
lsof -i :3000  # Frontend
lsof -i :8000  # Backend

# Kill process
kill -9 <PID>

# หรือเปลี่ยน port ใน docker-compose.traefik.yml
```

---

## 📊 ข้อมูลเทคนิค

### Services Architecture

```
┌─────────────────────────────────────────────────────┐
│                    WARIS Platform                    │
├─────────────────────────────────────────────────────┤
│  Frontend (Next.js 16)     →  localhost:3000        │
│  Backend API (FastAPI)     →  localhost:8000        │
│  PostgreSQL 17             →  Internal               │
│  MongoDB 8                 →  Internal               │
│  Redis 8                   →  Internal               │
│  Traefik Dashboard         →  localhost:8888        │
└─────────────────────────────────────────────────────┘
```

### Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend | Next.js | 16.1.1 |
| Frontend Runtime | React | 19.2 |
| Frontend Language | TypeScript | 5.8 |
| Frontend Styling | TailwindCSS | 4.0 |
| Backend | FastAPI | 0.124+ |
| Backend Language | Python | 3.12+ |
| Database | PostgreSQL | 17 |
| NoSQL | MongoDB | 8 |
| Cache | Redis | 8 |
| Reverse Proxy | Traefik | 3.3 |

---

## 📚 เอกสารเพิ่มเติม

- [README.md](README.md) - ภาพรวมโปรเจกต์
- [LOCAL_SETUP.md](LOCAL_SETUP.md) - คู่มือติดตั้งแบบละเอียด
- [URLS.md](URLS.md) - รายการ URLs ทั้งหมด
- [STATUS.md](STATUS.md) - สถานะระบบปัจจุบัน

---

## 🎯 Next Steps

### สำหรับ Development

1. **เพิ่มข้อมูลจริง**: แทนที่ mock data ด้วยข้อมูลจาก API
2. **ทดสอบ Authentication**: ทดสอบระบบ login/logout
3. **เชื่อมต่อ Database**: เพิ่มข้อมูลลงใน PostgreSQL/MongoDB
4. **พัฒนาฟีเจอร์**: เพิ่มฟีเจอร์ตามที่ต้องการ

### สำหรับ Production

1. **เปลี่ยน Secrets**: เปลี่ยน JWT_SECRET และ passwords
2. **Setup SSL**: ใช้ SSL certificates จริง
3. **Configure Traefik**: แก้ปัญหา Docker provider
4. **Add Monitoring**: ติดตั้ง monitoring และ logging

---

## 💡 Tips

### ใช้งานอย่างมีประสิทธิภาพ

1. **ใช้ API Docs**: http://localhost:8000/docs สำหรับทดสอบ API
2. **ดู Logs**: `docker logs -f waris-web` สำหรับ debug
3. **Hot Reload**: Code changes จะ reload อัตโนมัติ
4. **Clear Cache**: Restart containers ถ้ามีปัญหา cache

---

<div align="center">

**✨ WARIS - Water Loss Intelligent Analysis and Reporting System**

พร้อมใช้งานแล้ว! 🚀

[Frontend](http://localhost:3000) • [API Docs](http://localhost:8000/docs) • [Dashboard](http://localhost:8888)

</div>
