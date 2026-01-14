# WARIS Documentation

> **ระบบวิเคราะห์และรายงานข้อมูลน้ำสูญเสียอัจฉริยะ**
> Water Loss Intelligent Analysis and Reporting System
> สำหรับ การประปาส่วนภูมิภาค (กปภ.)

---

## Quick Start

| เริ่มต้น | คำอธิบาย |
|----------|----------|
| [QUICKSTART](./setup/QUICKSTART.md) | เริ่มต้นใช้งานภายใน 5 นาที |
| [LOCAL_SETUP](./setup/LOCAL_SETUP.md) | การติดตั้งแบบละเอียด |
| [STATUS](./setup/STATUS.md) | สถานะระบบปัจจุบัน |
| [URLS](./setup/URLS.md) | รายการ URL ทั้งหมด |

---

## Documentation Index

### Project Management (การจัดการโครงการ)

| เอกสาร | คำอธิบาย |
|--------|----------|
| [Project Overview](./project-management/01-project-overview.md) | ภาพรวมโครงการ งบประมาณ ไทม์ไลน์ |
| [TOR Summary](./project-management/02-tor-summary.md) | สรุป TOR และการ mapping |
| [Timeline](./project-management/03-timeline.md) | แผนงานและกำหนดการ 270 วัน |
| [Team Structure](./project-management/04-team-structure.md) | โครงสร้างทีมและบทบาท |

### Architecture (สถาปัตยกรรม)

| เอกสาร | คำอธิบาย |
|--------|----------|
| [System Overview](./architecture/01-overview.md) | ภาพรวมสถาปัตยกรรมระบบ 7 layers |
| [Hybrid Infrastructure](./architecture/02-hybrid-infrastructure.md) | On-Premise + G-Cloud |
| [Components](./architecture/components.md) | รายละเอียด components |
| [Data Flow](./architecture/data-flow.md) | การไหลของข้อมูล |
| [Integration](./architecture/integration.md) | การเชื่อมต่อระบบภายนอก (DMAMA, GIS) |
| [Tech Stack 2026](./architecture/tech-stack-2026.md) | เทคโนโลยีที่ใช้ (อัพเดท 2026) |

### API (Application Programming Interface)

| เอกสาร | คำอธิบาย |
|--------|----------|
| [API Overview](./api/01-overview.md) | ออกแบบ REST API, Auth, Rate Limiting |
| [Endpoints](./api/endpoints.md) | รายละเอียด endpoints ทั้งหมด |

### Database (ฐานข้อมูล)

| เอกสาร | คำอธิบาย |
|--------|----------|
| [Database Overview](./database/01-overview.md) | Polyglot persistence strategy |
| [ERD](./database/erd.md) | Entity Relationship Diagrams |
| [Tables](./database/tables.md) | นิยามตารางและ columns |

### AI/ML (ปัญญาประดิษฐ์)

| เอกสาร | คำอธิบาย |
|--------|----------|
| [AI Overview](./ai-ml/01-overview.md) | 4 Shadowing Models, LLM 70B+, RAG |
| [Models](./ai-ml/models.md) | รายละเอียดโมเดล AI |

### Frontend (หน้าบ้าน)

| เอกสาร | คำอธิบาย |
|--------|----------|
| [Frontend Overview](./frontend/01-overview.md) | Next.js 16, React 19, สถาปัตยกรรม UI |

### Design System (ระบบออกแบบ)

| เอกสาร | คำอธิบาย |
|--------|----------|
| [Design Overview](./design/00-overview.md) | หลักการออกแบบ, design tokens |
| [Color System](./design/01-color-system.md) | ระบบสี, status colors |
| [Components](./design/02-components.md) | UI components |
| [UI Guidelines](./design/03-ui-guidelines.md) | แนวทางการออกแบบ UI |
| [Brand Guidelines](./design/brand-guidelines.md) | แบรนด์ กปภ. |

### Security (ความปลอดภัย)

| เอกสาร | คำอธิบาย |
|--------|----------|
| [Security Overview](./security/01-overview.md) | OWASP, PDPA, Authentication |

### Deployment (การ Deploy)

| เอกสาร | คำอธิบาย |
|--------|----------|
| [Deployment Overview](./deployment/01-overview.md) | กระบวนการ deploy |

### Setup & Troubleshooting (การติดตั้งและแก้ไขปัญหา)

| เอกสาร | คำอธิบาย |
|--------|----------|
| [QUICKSTART](./setup/QUICKSTART.md) | เริ่มต้นอย่างรวดเร็ว |
| [LOCAL_SETUP](./setup/LOCAL_SETUP.md) | การติดตั้ง local แบบละเอียด |
| [TRAEFIK_SETUP](./setup/TRAEFIK_SETUP.md) | การตั้งค่า Traefik v3.3 |
| [QUICK_START_TRAEFIK](./setup/QUICK_START_TRAEFIK.md) | Traefik quick reference |
| [START_WARIS](./setup/START_WARIS.md) | วิธีเริ่มต้น services |
| [TROUBLESHOOTING](./setup/TROUBLESHOOTING.md) | **คู่มือแก้ไขปัญหา** |
| [QUICK_REFERENCE](./setup/QUICK_REFERENCE.md) | **คำสั่งที่ใช้บ่อย** |
| [LESSONS_LEARNED](./setup/LESSONS_LEARNED.md) | บทเรียนและประสบการณ์ |
| [STATUS](./setup/STATUS.md) | สถานะระบบปัจจุบัน |
| [URLS](./setup/URLS.md) | รายการ URLs ทั้งหมด |
| [FRONTEND_BACKEND_FIX](./setup/FRONTEND_BACKEND_FIX.md) | วิธีแก้ไข frontend/backend |

### Guides (คู่มือ)

| เอกสาร | คำอธิบาย |
|--------|----------|
| [Development](./guides/development.md) | workflow การพัฒนา |
| [Deployment](./guides/deployment.md) | ขั้นตอนการ deploy |

### Development Planning (การวางแผนพัฒนา)

| เอกสาร | คำอธิบาย |
|--------|----------|
| [Feature Map](./plan/01-feature-map.md) | รายการ features |
| [Page Structure](./plan/02-page-structure.md) | โครงสร้างหน้าเว็บ |
| [Component Library](./plan/03-component-library.md) | รายการ components |
| [Mock Data Schema](./plan/04-mock-data-schema.md) | โครงสร้าง mock data |
| [Development Phases](./plan/05-development-phases.md) | เฟสการพัฒนา |

### Requirements (ข้อกำหนด)

| เอกสาร | คำอธิบาย |
|--------|----------|
| [TOR Requirements](./requirements/tor.csv) | ข้อกำหนดขอบเขตงาน (CSV) |

---

## TOR Compliance Matrix

| TOR Section | เอกสารที่เกี่ยวข้อง | สถานะ |
|-------------|-------------------|--------|
| 4.1 Project Management | [Project Overview](./project-management/01-project-overview.md) | Planned |
| 4.2 Hybrid Architecture | [Architecture](./architecture/01-overview.md) | Planned |
| 4.3 DMAMA Integration | [Integration](./architecture/integration.md) | Planned |
| 4.4 Centralized Database | [Database](./database/01-overview.md) | Planned |
| 4.5.1 AI Shadowing | [AI Models](./ai-ml/models.md) | Planned |
| 4.5.2 LLM 70B+ Thai | [AI Overview](./ai-ml/01-overview.md) | Planned |
| 4.5.3 Notifications | [API Endpoints](./api/endpoints.md) | Planned |
| 4.5.4 Dashboard/Reports | [Components](./architecture/components.md) | Planned |
| 4.5.5 ISO/IEC 42001 | [AI Overview](./ai-ml/01-overview.md) | Planned |
| 4.5.6 AI Guardrails | [AI Overview](./ai-ml/01-overview.md) | Planned |
| 4.6 System Testing | [Development](./guides/development.md) | Planned |
| 4.7 Training (40 users) | [Deployment](./guides/deployment.md) | Planned |

---

## Directory Structure

```
docs/
├── README.md                 # หน้านี้ - สารบัญเอกสาร
├── project-management/       # การจัดการโครงการ
│   ├── 01-project-overview.md
│   ├── 02-tor-summary.md
│   ├── 03-timeline.md
│   └── 04-team-structure.md
├── architecture/             # สถาปัตยกรรมระบบ
│   ├── 01-overview.md
│   ├── 02-hybrid-infrastructure.md
│   ├── components.md
│   ├── data-flow.md
│   ├── integration.md
│   └── tech-stack-2026.md
├── api/                      # API specification
│   ├── 01-overview.md
│   └── endpoints.md
├── database/                 # ฐานข้อมูล
│   ├── 01-overview.md
│   ├── erd.md
│   └── tables.md
├── ai-ml/                    # AI/ML
│   ├── 01-overview.md
│   └── models.md
├── frontend/                 # Frontend
│   └── 01-overview.md
├── design/                   # Design system
│   ├── 00-overview.md
│   ├── 01-color-system.md
│   ├── 02-components.md
│   ├── 03-ui-guidelines.md
│   └── brand-guidelines.md
├── security/                 # ความปลอดภัย
│   └── 01-overview.md
├── deployment/               # การ deploy
│   └── 01-overview.md
├── setup/                    # การติดตั้งและแก้ไขปัญหา
│   ├── QUICKSTART.md
│   ├── LOCAL_SETUP.md
│   ├── TRAEFIK_SETUP.md
│   ├── TROUBLESHOOTING.md
│   ├── QUICK_REFERENCE.md
│   ├── LESSONS_LEARNED.md
│   ├── STATUS.md
│   └── URLS.md
├── guides/                   # คู่มือ
│   ├── development.md
│   └── deployment.md
├── plan/                     # แผนพัฒนา
│   ├── 01-feature-map.md
│   ├── 02-page-structure.md
│   ├── 03-component-library.md
│   ├── 04-mock-data-schema.md
│   └── 05-development-phases.md
└── requirements/             # ข้อกำหนด
    └── tor.csv
```

---

## Documentation Flow

### สำหรับผู้เริ่มต้น (Getting Started)
1. [QUICKSTART](./setup/QUICKSTART.md) - เริ่มต้นภายใน 5 นาที
2. [STATUS](./setup/STATUS.md) - ตรวจสอบสถานะระบบ
3. [URLS](./setup/URLS.md) - รายการ URLs ที่ใช้งาน

### สำหรับเข้าใจ Project (Understanding the Project)
1. [Project Overview](./project-management/01-project-overview.md) - ภาพรวม
2. [TOR Summary](./project-management/02-tor-summary.md) - ข้อกำหนด
3. [Timeline](./project-management/03-timeline.md) - แผนงาน

### สำหรับนักพัฒนา (For Developers)
1. [Architecture](./architecture/01-overview.md) - สถาปัตยกรรม
2. [API](./api/01-overview.md) - การออกแบบ API
3. [Database](./database/01-overview.md) - ฐานข้อมูล
4. [Development Guide](./guides/development.md) - workflow

### สำหรับงาน AI/ML
1. [AI Overview](./ai-ml/01-overview.md) - ภาพรวม AI
2. [Models](./ai-ml/models.md) - รายละเอียดโมเดล

### สำหรับแก้ไขปัญหา (Troubleshooting)
1. [TROUBLESHOOTING](./setup/TROUBLESHOOTING.md) - วิธีแก้ไขปัญหา
2. [QUICK_REFERENCE](./setup/QUICK_REFERENCE.md) - คำสั่งที่ใช้บ่อย
3. [LESSONS_LEARNED](./setup/LESSONS_LEARNED.md) - บทเรียน

---

## Related Links

- **Source Code**: `platform/` directory
- **Claude Instructions**: `.claude/CLAUDE.md`
- **API Documentation**: http://localhost:8000/docs (เมื่อรัน API)
- **Traefik Dashboard**: http://localhost:8888

---

*Provincial Waterworks Authority (การประปาส่วนภูมิภาค)*
*Updated: 2026-01-14*
