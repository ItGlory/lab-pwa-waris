# Data Import UI Plan

# แผนพัฒนา UI นำเข้าข้อมูล

**Created:** 2026-01-15
**Completed:** 2026-01-15
**Status:** Done
**TOR Reference:** Section 4.3

---

## Objective (วัตถุประสงค์)

พัฒนา Frontend UI สำหรับนำเข้าข้อมูลจากระบบ DMAMA รองรับการอัปโหลดไฟล์และ Manual Sync

---

## Features Implemented

### 1. Data Import Page (`/data-import`)

**File:** `platform/apps/web/app/(dashboard)/data-import/page.tsx`

Features:
- ETL Status Cards (status, last sync, errors)
- File Upload with Drag & Drop
- Manual Sync Trigger Dialog
- Sync History Table
- Settings for DMAMA connection

### 2. API Proxy Routes

| Route | File | Backend Endpoint |
|-------|------|------------------|
| `/api/etl/status` | `app/api/etl/status/route.ts` | `/api/v1/etl/status` |
| `/api/etl/history` | `app/api/etl/history/route.ts` | `/api/v1/etl/history` |
| `/api/etl/upload` | `app/api/etl/upload/route.ts` | `/api/v1/etl/upload` |
| `/api/etl/sync` | `app/api/etl/sync/route.ts` | `/api/v1/etl/sync` |

### 3. Sidebar Navigation

Added "นำเข้าข้อมูล" (Data Import) menu item with Upload icon.

**File:** `platform/apps/web/components/layout/sidebar.tsx`

---

## UI Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Data Import Page                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │ ETL Status   │  │ Last Sync    │  │ Errors       │                   │
│  │ ✓ Idle       │  │ 15 ม.ค. 69   │  │ 0            │                   │
│  │ 15,000 rec   │  │ Next: 02:00  │  │ No errors    │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  Tabs: [อัปโหลดไฟล์] [ประวัติการซิงค์] [ตั้งค่า]                  ││
│  ├─────────────────────────────────────────────────────────────────────┤│
│  │                                                                      ││
│  │  ┌───────────────────────────────────────────────────────────────┐  ││
│  │  │                                                                │  ││
│  │  │           📤 ลากไฟล์มาวางที่นี่                              │  ││
│  │  │                                                                │  ││
│  │  │        รองรับไฟล์ CSV และ Excel (.xlsx, .xls)                │  ││
│  │  │                                                                │  ││
│  │  │               [ เลือกไฟล์ ]                                   │  ││
│  │  │                                                                │  ││
│  │  └───────────────────────────────────────────────────────────────┘  ││
│  │                                                                      ││
│  │  Template Downloads:                                                 ││
│  │  [DMA Readings Template.csv] [DMA Master Template.xlsx]             ││
│  │                                                                      ││
│  │  Uploaded Files Table:                                               ││
│  │  ├──────────────┬────────┬──────────┬────────┬─────┤                ││
│  │  │ ชื่อไฟล์     │ ขนาด   │ สถานะ    │ รายการ │     │                ││
│  │  ├──────────────┼────────┼──────────┼────────┼─────┤                ││
│  │  │ data.csv     │ 1.2 MB │ ✓ สำเร็จ │ 500    │ 🗑️ │                ││
│  │  └──────────────┴────────┴──────────┴────────┴─────┘                ││
│  │                                                                      ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
platform/apps/web/
├── app/
│   ├── (dashboard)/
│   │   └── data-import/
│   │       └── page.tsx          # Data Import UI page
│   └── api/
│       └── etl/
│           ├── status/
│           │   └── route.ts      # GET /api/etl/status
│           ├── history/
│           │   └── route.ts      # GET /api/etl/history
│           ├── upload/
│           │   └── route.ts      # POST /api/etl/upload
│           └── sync/
│               └── route.ts      # POST /api/etl/sync
└── components/
    └── layout/
        └── sidebar.tsx           # Updated with Data Import menu
```

---

## Features Details

### 1. ETL Status Display
- Real-time status (idle, syncing, processing, error, completed)
- Records processed counter
- Last sync time (Thai format)
- Next scheduled sync time
- Error count

### 2. File Upload
- Drag & Drop support
- Multi-file upload
- Progress tracking
- Supported formats: CSV, XLSX, XLS
- File size display
- Status badges (pending, processing, completed, error)
- Delete uploaded file from list

### 3. Manual Sync
- Source type selection (API, Database, File)
- Sync trigger dialog
- Loading state while syncing

### 4. Sync History
- Table view of past syncs
- Source type badge
- Start/end timestamps
- Records processed
- Status badge

### 5. Settings (Placeholder)
- DMAMA API URL configuration
- API Key input
- Connection test button
- Scheduled sync time settings

---

## Thai Language Support

All UI elements have Thai translations:
- Menu: "นำเข้าข้อมูล"
- Page title: "นำเข้าข้อมูล"
- Status labels: "พร้อม", "กำลังซิงค์", "สำเร็จ", "ผิดพลาด"
- Button texts: "ซิงค์ข้อมูล", "รีเฟรช", "เลือกไฟล์"
- Tab labels: "อัปโหลดไฟล์", "ประวัติการซิงค์", "ตั้งค่า"

---

## Dependencies

- shadcn/ui components (Dialog, Tabs, Table, Progress, Badge)
- lucide-react icons
- Next.js API routes for backend proxy

---

## Next Steps

1. Add real file processing with validation feedback
2. Implement data preview before import
3. Add detailed error messages with row numbers
4. Create data mapping UI for custom column mapping
5. Add export functionality for failed records
