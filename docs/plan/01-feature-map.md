# WARIS Frontend Feature Map

> Complete feature inventory for UI mockup development

## Overview

This document maps all features required for the WARIS frontend mockup based on TOR requirements. Features are organized by functional area with priority levels.

---

## 1. Authentication & Access Control

### 1.1 Login Page

| Feature | Priority | Description |
| ------- | -------- | ----------- |
| Thai login form | P0 | Email/password with Thai labels |
| Remember me | P2 | Persist session checkbox |
| Forgot password link | P2 | Link to password reset (mock) |
| Language toggle | P1 | Switch TH/EN on login page |
| PWA branding | P0 | Logo and official colors |

### 1.2 Session Management (Mock)

| Feature | Priority | Description |
| ------- | -------- | ----------- |
| Mock JWT token | P1 | Simulate token storage |
| Auto logout | P2 | Session timeout simulation |
| Role-based redirect | P1 | Different dashboards per role |

---

## 2. Main Dashboard (หน้าแดชบอร์ดหลัก)

### 2.1 KPI Cards

| Metric | Thai Label | Unit | Status Colors |
| ------ | ---------- | ---- | ------------- |
| Water Inflow | น้ำเข้า | ลบ.ม./วัน | - |
| Water Outflow | น้ำออก | ลบ.ม./วัน | - |
| Water Loss | น้ำสูญเสีย | ลบ.ม./วัน | Green/Yellow/Red |
| Loss Percentage | % สูญเสีย | % | Green (<15), Yellow (15-20), Red (>20) |

### 2.2 Charts & Visualizations

| Chart Type | Purpose | Library |
| ---------- | ------- | ------- |
| Line Chart | Water loss trends over time | Recharts |
| Area Chart | Inflow vs Outflow comparison | Recharts |
| Bar Chart | Regional/branch comparison | Recharts |
| Pie Chart | Loss type distribution | Recharts |
| Gauge | Current loss percentage | Recharts |

### 2.3 Recent Alerts Section

| Feature | Priority | Description |
| ------- | -------- | ----------- |
| Alert list (10 items) | P0 | Latest alerts with severity icons |
| Severity badges | P0 | Critical/High/Medium/Low colors |
| Click to detail | P1 | Navigate to alert detail |
| Real-time updates | P1 | Toast notifications for new alerts |

### 2.4 DMA Map

| Feature | Priority | Description |
| ------- | -------- | ----------- |
| Interactive map | P0 | Leaflet with Thailand base map |
| DMA polygons | P0 | Color-coded by loss status |
| Popup on click | P1 | Quick stats in popup |
| Zoom/pan controls | P1 | Standard map navigation |
| Legend | P1 | Color meaning explanation |

### 2.5 Quick Filters

| Filter | Type | Description |
| ------ | ---- | ----------- |
| Region (เขต) | Multi-select | Filter by PWA region |
| Branch (สาขา) | Multi-select | Filter by branch office |
| DMA | Searchable dropdown | Find specific DMA |
| Date Range | Date picker | Custom date selection |
| Status | Dropdown | Normal/Warning/Critical |

---

## 3. DMA Analysis (หน้าวิเคราะห์ DMA)

### 3.1 DMA Header

| Element | Description |
| ------- | ----------- |
| DMA Code & Name | Thai name with code (e.g., DMA-001 บางพลี-01) |
| Region/Branch | Parent organization info |
| Status Badge | Current status indicator |
| Last Updated | Timestamp of latest data |

### 3.2 Metrics Grid (4 columns)

| Metric | Thai | Description |
| ------ | ---- | ----------- |
| น้ำเข้า | Inflow | Daily volume in ลบ.ม. |
| น้ำออก | Outflow | Daily volume in ลบ.ม. |
| น้ำสูญเสีย | Loss Volume | Calculated loss in ลบ.ม. |
| % สูญเสีย | Loss % | Percentage of inflow |

### 3.3 AI Predictions Section

| Model | Display | Confidence |
| ----- | ------- | ---------- |
| Anomaly Detection | Normal/Warning/Alert badge | 0-100% |
| Pattern Recognition | Pattern type + description | 0-100% |
| Classification | Physical vs Commercial loss pie | 0-100% |
| Time-series Forecast | Next 7/30 day prediction chart | With confidence bands |

### 3.4 Alert History

| Feature | TOR Requirement |
| ------- | --------------- |
| 60-day history | TOR 4.5.4.1 |
| Sortable by date/severity | Required |
| Status tracking | Active/Acknowledged/Resolved |
| Export capability | CSV/PDF download |

---

## 4. Chat/Q&A Interface (ถามตอบ LLM)

### 4.1 Chat Window

| Feature | TOR Requirement | Description |
| ------- | --------------- | ----------- |
| Thai language primary | TOR 4.5.4.2(ก) | Thai input and responses |
| 30-day history | TOR 4.5.4.2(ค) | Conversation retention |
| Daily limits | TOR 4.5.4.2(ข) | Configurable per role |
| Streaming responses | User preference | Word-by-word animation |

### 4.2 Message Types

| Type | Style | Features |
| ---- | ----- | -------- |
| User message | Right-aligned, blue | Timestamp |
| AI response | Left-aligned, gray | Sources, copy button |
| System message | Centered, light | Notifications |

### 4.3 Source Attribution (RAG)

| Feature | TOR Requirement | Description |
| ------- | --------------- | ----------- |
| Source links | TOR 4.5.4.5 | Links to referenced documents |
| Confidence score | Optional | Show AI confidence |
| Document preview | P2 | Quick view of source |

### 4.4 Suggested Questions

| Category | Example Questions (Thai) |
| -------- | ------------------------ |
| Summary | สรุปข้อมูลน้ำสูญเสียเดือนนี้ |
| Analysis | เหตุใดน้ำสูญเสียจึงสูงขึ้น? |
| Forecast | พยากรณ์น้ำสูญเสียเดือนหน้า |
| Recommendation | แนะนำวิธีลดน้ำสูญเสีย |

---

## 5. Reports (รายงาน)

### 5.1 Report Types

| Type | Thai | Frequency |
| ---- | ---- | --------- |
| Daily Report | รายงานประจำวัน | Daily |
| Weekly Report | รายงานประจำสัปดาห์ | Weekly |
| Monthly Report | รายงานประจำเดือน | Monthly |
| Executive Report | รายงานผู้บริหาร | On-demand |

### 5.2 Report Generator

| Field | Type | Description |
| ----- | ---- | ----------- |
| Report Type | Dropdown | Select report template |
| Date Range | Date picker | Start and end dates |
| Scope | Multi-select | Regions/Branches/DMAs |
| Include AI Summary | Checkbox | LLM-generated summary |
| Format | Radio | PDF/DOCX/Excel |

### 5.3 Report List

| Feature | Description |
| ------- | ----------- |
| Search/filter | By date, type, status |
| Preview | Embedded PDF viewer |
| Download | Direct file download |
| Delete | Remove report (admin) |

---

## 6. Document Management (เอกสาร RAG)

### 6.1 Upload

| Feature | TOR Requirement |
| ------- | --------------- |
| DOCX support | TOR 4.5.4.3 |
| PDF support | TOR 4.5.4.3 |
| Drag-and-drop | UX enhancement |
| Progress indicator | UX enhancement |

### 6.2 Document List

| Column | Description |
| ------ | ----------- |
| Filename | Document name |
| Type | PDF/DOCX icon |
| Size | File size |
| Upload Date | Thai date format |
| Status | Processing/Indexed/Error |
| Actions | Download/Delete |

---

## 7. Alerts Management (การแจ้งเตือน)

### 7.1 Alert List Page

| Feature | Description |
| ------- | ----------- |
| Filterable list | By severity, status, DMA, date |
| Bulk actions | Acknowledge/resolve multiple |
| Export | CSV/PDF download |

### 7.2 Alert Detail Modal

| Section | Content |
| ------- | ------- |
| Header | Type, severity, timestamp |
| Description | Thai message with details |
| Root Cause | AI-suggested cause (mock) |
| Recommended Actions | Thai action items |
| Actions | Acknowledge, Resolve, Escalate |

### 7.3 Real-time Notifications

| Feature | Implementation |
| ------- | -------------- |
| Toast notifications | New alerts appear as toasts |
| Sound option | Optional audio alert |
| Badge count | Header shows unread count |
| Live indicator | Pulsing dot for live data |

---

## 8. Settings (ตั้งค่า)

### 8.1 User Settings

| Setting | Type | Description |
| ------- | ---- | ----------- |
| Language | Toggle | TH/EN preference |
| Theme | Toggle | Light/Dark mode |
| Notifications | Switches | Enable/disable types |
| Date Format | Dropdown | Thai Buddhist/Gregorian |

### 8.2 Admin Settings (Mock)

| Setting | Description |
| ------- | ----------- |
| User Management | List, add, edit users |
| Role Permissions | Configure role access |
| Chat Limits | Daily limits per role |
| Alert Thresholds | Configure warning levels |

---

## 9. UI/UX Features

### 9.1 Theme Support

| Theme | Description |
| ----- | ----------- |
| Light | Default PWA blue theme |
| Dark | Dark mode with adjusted colors |
| System | Follow OS preference |

### 9.2 Responsive Breakpoints

| Breakpoint | Layout |
| ---------- | ------ |
| Mobile (<640px) | Single column, bottom nav |
| Tablet (640-1024px) | 2-column, collapsible sidebar |
| Desktop (>1024px) | Full sidebar, multi-column |

### 9.3 Loading States

| State | Component |
| ----- | --------- |
| Page loading | Full-page skeleton |
| Data loading | Card/table skeletons |
| Button loading | Spinner + disabled |
| Chart loading | Placeholder animation |

---

## 10. Accessibility

### 10.1 WCAG 2.1 AA Requirements

| Requirement | Implementation |
| ----------- | -------------- |
| Keyboard navigation | Focus management, skip links |
| Screen reader | ARIA labels, semantic HTML |
| Color contrast | 4.5:1 minimum ratio |
| Focus indicators | Visible focus rings |
| Text scaling | Responsive typography |

---

## Feature Priority Legend

- **P0**: Must have for demo (core functionality)
- **P1**: Should have (important features)
- **P2**: Nice to have (enhancements)
- **P3**: Future consideration

---

## TOR Compliance Checklist

| TOR Section | Feature | Status |
| ----------- | ------- | ------ |
| 4.5.4.1(ค) | 5 chart types (line, pie, bar, gauge, heatmap) | Planned |
| 4.5.4.1(ง) | 3+ interactive dashboards with drill-down | Planned |
| 4.5.4.1(จ) | Custom date range filtering | Planned |
| 4.5.4.1 | 60-day alert history | Planned |
| 4.5.4.2(ก) | Thai language Q&A | Planned |
| 4.5.4.2(ข) | Configurable daily chat limits | Planned |
| 4.5.4.2(ค) | 30-day conversation history | Planned |
| 4.5.4.3 | DOCX/PDF document support | Planned |
| 4.5.4.4 | Knowledge base management | Planned |
| 4.5.4.5 | RAG source attribution | Planned |
