# Frontend-Backend Integration Plan
# แผนการเชื่อมต่อ Frontend กับ Backend

**Created:** 2026-01-14
**Completed:** 2026-01-14
**Status:** Done
**Priority:** Critical

---

## Objective (วัตถุประสงค์)

เชื่อมต่อ Frontend (Next.js) กับ Backend (FastAPI) เพื่อให้ระบบทำงานร่วมกันจริง แทนที่จะใช้ mock data

---

## Current State (สถานะปัจจุบัน)

### Frontend
- ✅ Pages: Dashboard, DMA, Alerts, Chat, Reports, Settings
- ✅ Components: KPICard, AlertList, Charts, etc.
- ✅ Hooks: use-dashboard, use-dmas, use-alerts, etc.
- ⚠️ API Client configured แต่ยังไม่ได้ทดสอบกับ Backend จริง

### Backend
- ✅ Routers: /auth, /dma, /alerts, /dashboard, /reports, /chat
- ✅ Services: DMAService, AlertService, DashboardService
- ✅ Models: DMA, Alert, User, Region, Branch
- ⚠️ ใช้ mock data ใน services

### Infrastructure
- ✅ Traefik, PostgreSQL, MongoDB, Redis running
- ⚠️ Frontend/Backend containers ยังไม่ start

---

## Implementation Steps (ขั้นตอนการดำเนินการ)

### Step 1: Start Services (10 min)

```bash
cd platform/infra/docker
docker compose -f docker-compose.traefik.yml up -d web api
```

**Expected Result:**
- Frontend accessible at https://waris.local:8443
- Backend accessible at https://api.waris.local:8443
- API docs at https://api.waris.local:8443/docs

### Step 2: Verify API Endpoints (15 min)

Test each endpoint manually:

```bash
# Health check
curl http://localhost:8000/health

# Dashboard summary
curl http://localhost:8000/api/v1/dashboard/summary

# DMA list
curl http://localhost:8000/api/v1/dma

# Alerts
curl http://localhost:8000/api/v1/alerts
```

**Expected Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Success"
}
```

### Step 3: Configure Frontend API Client (15 min)

**File:** `platform/apps/web/lib/api-client.ts`

Verify configuration:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

**Environment Variables (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 4: Test Frontend-Backend Connection (20 min)

1. Open https://waris.local:8443
2. Check browser Network tab
3. Verify API calls are made to backend
4. Check for CORS errors

**Common Issues:**
- CORS: Backend needs to allow frontend origin
- Network: Containers need to be on same network
- Env vars: Frontend needs correct API URL

### Step 5: Seed Database with Test Data (30 min)

**File:** `platform/infra/docker/postgres/init/02-seed-data.sql`

```sql
-- Regions
INSERT INTO regions (id, name, name_th, code) VALUES
  ('reg-1', 'Central', 'ภาคกลาง', 'CTR'),
  ('reg-2', 'Northeast', 'ภาคตะวันออกเฉียงเหนือ', 'NE'),
  ('reg-3', 'North', 'ภาคเหนือ', 'NTH'),
  ('reg-4', 'South', 'ภาคใต้', 'STH'),
  ('reg-5', 'East', 'ภาคตะวันออก', 'EST');

-- Branches
INSERT INTO branches (id, region_id, name, name_th, code) VALUES
  ('br-1', 'reg-1', 'Nonthaburi', 'นนทบุรี', 'NTB'),
  ('br-2', 'reg-1', 'Pathum Thani', 'ปทุมธานี', 'PTT'),
  ('br-3', 'reg-2', 'Khon Kaen', 'ขอนแก่น', 'KKN'),
  ('br-4', 'reg-3', 'Chiang Mai', 'เชียงใหม่', 'CNX'),
  ('br-5', 'reg-4', 'Songkhla', 'สงขลา', 'SKA');

-- DMAs
INSERT INTO dmas (id, branch_id, name, name_th, code, status, loss_percentage, volume_input, volume_output) VALUES
  ('dma-001', 'br-1', 'Nonthaburi Zone 1', 'นนทบุรี โซน 1', 'NTB-01', 'normal', 12.5, 15000, 13125),
  ('dma-002', 'br-1', 'Nonthaburi Zone 2', 'นนทบุรี โซน 2', 'NTB-02', 'warning', 18.2, 12000, 9816),
  ('dma-003', 'br-2', 'Pathum Thani Zone 1', 'ปทุมธานี โซน 1', 'PTT-01', 'normal', 11.8, 18000, 15876),
  ('dma-004', 'br-3', 'Khon Kaen Central', 'ขอนแก่น กลาง', 'KKN-01', 'critical', 25.5, 20000, 14900),
  ('dma-005', 'br-4', 'Chiang Mai Old City', 'เชียงใหม่ เมืองเก่า', 'CNX-01', 'warning', 16.7, 14000, 11662),
  ('dma-006', 'br-5', 'Songkhla Harbor', 'สงขลา ท่าเรือ', 'SKA-01', 'normal', 10.2, 16000, 14368),
  ('dma-007', 'br-1', 'Nonthaburi Zone 3', 'นนทบุรี โซน 3', 'NTB-03', 'critical', 22.8, 11000, 8492),
  ('dma-008', 'br-2', 'Pathum Thani Zone 2', 'ปทุมธานี โซน 2', 'PTT-02', 'normal', 13.1, 17000, 14773);

-- Alerts
INSERT INTO alerts (id, dma_id, severity, status, title, title_th, description, created_at) VALUES
  ('alert-001', 'dma-004', 'critical', 'active', 'High Water Loss Detected', 'ตรวจพบน้ำสูญเสียสูง', 'Water loss exceeds 25% threshold', NOW() - INTERVAL '2 hours'),
  ('alert-002', 'dma-007', 'critical', 'active', 'Critical Loss Alert', 'แจ้งเตือนน้ำสูญเสียวิกฤต', 'Immediate attention required', NOW() - INTERVAL '1 hour'),
  ('alert-003', 'dma-002', 'warning', 'active', 'Elevated Loss Pattern', 'รูปแบบน้ำสูญเสียสูงขึ้น', 'Loss trending upward', NOW() - INTERVAL '4 hours'),
  ('alert-004', 'dma-005', 'warning', 'acknowledged', 'Abnormal Usage Pattern', 'รูปแบบการใช้น้ำผิดปกติ', 'Unusual consumption detected', NOW() - INTERVAL '6 hours'),
  ('alert-005', 'dma-001', 'info', 'resolved', 'Scheduled Maintenance', 'การบำรุงรักษาตามกำหนด', 'Maintenance completed', NOW() - INTERVAL '1 day');
```

### Step 6: Update Backend to Use Database (45 min)

**File:** `platform/apps/api/services/dma_service.py`

Change from mock data to database queries:

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.dma import DMA, DMAReading

class DMAService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, skip: int = 0, limit: int = 10):
        query = select(DMA).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_by_id(self, dma_id: str):
        query = select(DMA).where(DMA.id == dma_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
```

### Step 7: End-to-End Testing (30 min)

**Test Cases:**

| Test | Expected Result |
|------|-----------------|
| Load Dashboard | Shows KPIs from API |
| View DMA List | Shows 8 DMAs from database |
| View DMA Detail | Shows readings chart |
| View Alerts | Shows 5 alerts with status |
| Filter Alerts | Filters work correctly |
| Chat | Sends message, gets response |

---

## Success Criteria (เกณฑ์ความสำเร็จ)

- [ ] Frontend loads without errors
- [ ] Dashboard shows real data from API
- [ ] DMA list displays database records
- [ ] Alerts show with correct severity colors
- [ ] No CORS errors in browser console
- [ ] API response time < 500ms

---

## Rollback Plan (แผนสำรอง)

If integration fails:
1. Keep mock data as fallback
2. Add feature flag to switch between mock/real
3. Debug API issues separately

```typescript
// Feature flag in frontend
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
```

---

## Files to Modify

| File | Change |
|------|--------|
| `platform/apps/web/.env.local` | Add API URL |
| `platform/apps/api/services/dma_service.py` | Use database |
| `platform/apps/api/services/alert_service.py` | Use database |
| `platform/apps/api/services/dashboard_service.py` | Use database |
| `platform/infra/docker/postgres/init/02-seed-data.sql` | Add test data |
| `platform/infra/docker/docker-compose.traefik.yml` | Verify service configs |

---

## Timeline

| Step | Duration | Status |
|------|----------|--------|
| Start Services | 10 min | Pending |
| Verify API | 15 min | Pending |
| Configure Client | 15 min | Pending |
| Test Connection | 20 min | Pending |
| Seed Database | 30 min | Pending |
| Update Backend | 45 min | Pending |
| E2E Testing | 30 min | Pending |
| **Total** | **~3 hours** | |

---

## Next Steps After Completion

1. **Connect to real DMAMA data** (TOR 4.3)
2. **Implement AI models** (TOR 4.5.1)
3. **Deploy LLM** (TOR 4.5.2)
4. **Setup RAG pipeline** (TOR 4.5.4.5)
