# WARIS Mock Data Schema

> Sample data structure and generation patterns

## Data Files Structure

```
platform/apps/web/lib/mock-data/
├── regions.json           # 5 PWA regions
├── branches.json          # 50 branches across regions
├── dmas.json             # 200 DMAs with current status
├── dma-geometry.json     # GeoJSON for DMA polygons
├── readings.json         # Time-series flow/pressure data
├── alerts.json           # Sample alerts (100+)
├── predictions.json      # AI prediction samples
├── reports.json          # Generated reports
├── documents.json        # Knowledge base documents
├── users.json            # Sample users
└── chat-history.json     # Sample conversations
```

---

## Schema Definitions

### Region (เขต)

```typescript
interface Region {
  id: string;           // UUID
  code: string;         // "REG-01"
  name_th: string;      // "เขต 1 (ภาคเหนือ)"
  name_en: string;      // "Region 1 (Northern)"
  branch_count: number; // Number of branches
  dma_count: number;    // Total DMAs
}

// Sample Data
const regions: Region[] = [
  {
    id: "reg-001",
    code: "REG-01",
    name_th: "เขต 1 (ภาคเหนือ)",
    name_en: "Region 1 (Northern)",
    branch_count: 10,
    dma_count: 45
  },
  {
    id: "reg-002",
    code: "REG-02",
    name_th: "เขต 2 (ภาคกลาง)",
    name_en: "Region 2 (Central)",
    branch_count: 12,
    dma_count: 52
  },
  {
    id: "reg-003",
    code: "REG-03",
    name_th: "เขต 3 (ภาคตะวันออก)",
    name_en: "Region 3 (Eastern)",
    branch_count: 8,
    dma_count: 35
  },
  {
    id: "reg-004",
    code: "REG-04",
    name_th: "เขต 4 (ภาคตะวันออกเฉียงเหนือ)",
    name_en: "Region 4 (Northeastern)",
    branch_count: 12,
    dma_count: 48
  },
  {
    id: "reg-005",
    code: "REG-05",
    name_th: "เขต 5 (ภาคใต้)",
    name_en: "Region 5 (Southern)",
    branch_count: 8,
    dma_count: 20
  }
];
```

### Branch (สาขา)

```typescript
interface Branch {
  id: string;
  code: string;         // "BRN-001"
  name_th: string;      // "สาขาเชียงใหม่"
  name_en: string;      // "Chiang Mai Branch"
  region_id: string;
  province: string;     // Province name
  dma_count: number;
}

// Sample Data (subset)
const branches: Branch[] = [
  {
    id: "brn-001",
    code: "BRN-001",
    name_th: "สาขาเชียงใหม่",
    name_en: "Chiang Mai Branch",
    region_id: "reg-001",
    province: "เชียงใหม่",
    dma_count: 8
  },
  {
    id: "brn-002",
    code: "BRN-002",
    name_th: "สาขาลำพูน",
    name_en: "Lamphun Branch",
    region_id: "reg-001",
    province: "ลำพูน",
    dma_count: 5
  },
  // ... 48 more branches
];
```

### DMA (District Metered Area)

```typescript
interface DMA {
  id: string;
  code: string;              // "DMA-001"
  name_th: string;           // "บางพลี-01"
  name_en: string;           // "Bang Phli-01"
  branch_id: string;
  region_id: string;

  // Physical properties
  area_km2: number;          // 5.5
  population: number;        // 15000
  connections: number;       // 3500
  pipe_length_km: number;    // 125.8

  // Current metrics
  current_inflow: number;    // m³/day
  current_outflow: number;   // m³/day
  current_loss: number;      // m³/day
  loss_percentage: number;   // %
  avg_pressure: number;      // bar

  // Status
  status: 'normal' | 'warning' | 'critical';
  last_updated: string;      // ISO timestamp
}

// Sample Data (subset)
const dmas: DMA[] = [
  {
    id: "dma-001",
    code: "DMA-001",
    name_th: "บางพลี-01",
    name_en: "Bang Phli-01",
    branch_id: "brn-010",
    region_id: "reg-002",
    area_km2: 5.5,
    population: 15000,
    connections: 3500,
    pipe_length_km: 125.8,
    current_inflow: 12500.5,
    current_outflow: 10250.3,
    current_loss: 2250.2,
    loss_percentage: 18.0,
    avg_pressure: 2.8,
    status: "warning",
    last_updated: "2024-01-15T10:30:00Z"
  },
  // ... 199 more DMAs
];
```

### DMA Geometry (GeoJSON)

```typescript
interface DMAGeometry {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    properties: {
      dma_id: string;
      name_th: string;
      status: string;
    };
    geometry: {
      type: "Polygon";
      coordinates: number[][][];
    };
  }[];
}

// Sample polygon (simplified)
const dmaGeometry: DMAGeometry = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        dma_id: "dma-001",
        name_th: "บางพลี-01",
        status: "warning"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [100.705, 13.615],
          [100.715, 13.615],
          [100.715, 13.625],
          [100.705, 13.625],
          [100.705, 13.615]
        ]]
      }
    }
  ]
};
```

### Water Loss Reading

```typescript
interface WaterLossReading {
  id: string;
  dma_id: string;
  recorded_at: string;      // ISO timestamp
  inflow: number;           // m³
  outflow: number;          // m³
  loss: number;             // m³
  loss_percentage: number;  // %
  pressure_in: number;      // bar
  pressure_out: number;     // bar
  quality: number;          // 0-100 (data quality score)
}

// Generate 6 months of hourly data per DMA
// Total: ~4,380 readings × 200 DMAs = ~876,000 readings
// For mockup: Use daily aggregates or sample data
```

### Alert

```typescript
interface Alert {
  id: string;
  dma_id: string;
  dma_name: string;
  type: 'high_nrw' | 'leak_detected' | 'pressure_anomaly' |
        'meter_fault' | 'threshold_breach' | 'system_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  title_th: string;
  message: string;
  message_th: string;
  status: 'active' | 'acknowledged' | 'resolved';
  triggered_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  acknowledged_by?: string;
  resolved_by?: string;
}

// Sample Data
const alerts: Alert[] = [
  {
    id: "alt-001",
    dma_id: "dma-001",
    dma_name: "บางพลี-01",
    type: "high_nrw",
    severity: "high",
    title: "High water loss detected",
    title_th: "ตรวจพบน้ำสูญเสียสูง",
    message: "Water loss percentage exceeded 20% threshold",
    message_th: "เปอร์เซ็นต์น้ำสูญเสียเกินเกณฑ์ 20%",
    status: "active",
    triggered_at: "2024-01-15T08:30:00Z"
  },
  {
    id: "alt-002",
    dma_id: "dma-015",
    dma_name: "สมุทรปราการ-03",
    type: "leak_detected",
    severity: "critical",
    title: "Potential leak detected",
    title_th: "ตรวจพบการรั่วไหลที่อาจเกิดขึ้น",
    message: "Anomaly detection model identified potential leak in sector B",
    message_th: "โมเดลตรวจจับความผิดปกติพบการรั่วไหลที่อาจเกิดขึ้นในเซกเตอร์ B",
    status: "active",
    triggered_at: "2024-01-15T07:15:00Z"
  },
  // ... 98 more alerts
];
```

### AI Prediction

```typescript
interface Prediction {
  id: string;
  dma_id: string;
  model_type: 'anomaly' | 'pattern' | 'classification' | 'forecast';
  model_version: string;
  created_at: string;

  // Result varies by model type
  result: AnomalyResult | PatternResult | ClassificationResult | ForecastResult;

  confidence: number;       // 0-1
  is_validated?: boolean;
  actual_value?: number;
}

interface AnomalyResult {
  status: 'normal' | 'warning' | 'anomaly';
  anomaly_score: number;    // 0-1
  anomaly_type?: string;
  description_th: string;
}

interface PatternResult {
  pattern_type: 'seasonal' | 'weekly' | 'daily' | 'irregular';
  cluster_id: number;
  description_th: string;
}

interface ClassificationResult {
  physical_loss_pct: number;
  commercial_loss_pct: number;
  main_cause: string;
  cause_th: string;
}

interface ForecastResult {
  horizon_days: number;
  predictions: {
    date: string;
    value: number;
    lower_bound: number;
    upper_bound: number;
  }[];
  trend: 'increasing' | 'decreasing' | 'stable';
}

// Sample Data
const predictions: Prediction[] = [
  {
    id: "pred-001",
    dma_id: "dma-001",
    model_type: "anomaly",
    model_version: "v1.2.0",
    created_at: "2024-01-15T06:00:00Z",
    result: {
      status: "warning",
      anomaly_score: 0.72,
      anomaly_type: "pressure_drop",
      description_th: "ตรวจพบความดันลดลงผิดปกติในช่วง 06:00-08:00"
    },
    confidence: 0.85
  },
  // ... more predictions
];
```

### Report

```typescript
interface Report {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'executive';
  title: string;
  title_th: string;
  date_range: {
    from: string;
    to: string;
  };
  scope: {
    regions?: string[];
    branches?: string[];
    dmas?: string[];
  };
  generated_at: string;
  generated_by: string;
  status: 'processing' | 'ready' | 'failed';
  file_url?: string;
  file_size?: number;
  includes_ai_summary: boolean;
}

// Sample Data
const reports: Report[] = [
  {
    id: "rpt-001",
    type: "monthly",
    title: "Monthly Water Loss Report - January 2024",
    title_th: "รายงานน้ำสูญเสียประจำเดือน - มกราคม 2567",
    date_range: {
      from: "2024-01-01",
      to: "2024-01-31"
    },
    scope: {
      regions: ["reg-002"]
    },
    generated_at: "2024-02-01T09:00:00Z",
    generated_by: "user-001",
    status: "ready",
    file_url: "/reports/monthly-2024-01.pdf",
    file_size: 2048576,
    includes_ai_summary: true
  },
  // ... more reports
];
```

### User

```typescript
interface User {
  id: string;
  email: string;
  full_name: string;
  full_name_th: string;
  role: 'admin' | 'manager' | 'analyst' | 'operator' | 'viewer';
  department: string;
  department_th: string;
  region_ids?: string[];     // Assigned regions
  branch_ids?: string[];     // Assigned branches
  avatar_url?: string;
  created_at: string;
  last_login?: string;
}

// Sample Data
const users: User[] = [
  {
    id: "user-001",
    email: "admin@pwa.co.th",
    full_name: "Somchai Jaidee",
    full_name_th: "สมชาย ใจดี",
    role: "admin",
    department: "Water Loss Management",
    department_th: "ฝ่ายจัดการน้ำสูญเสีย",
    avatar_url: "/avatars/admin.jpg",
    created_at: "2023-01-01T00:00:00Z",
    last_login: "2024-01-15T08:00:00Z"
  },
  {
    id: "user-002",
    email: "operator@pwa.co.th",
    full_name: "Somsri Rakdee",
    full_name_th: "สมศรี รักดี",
    role: "operator",
    department: "Operations",
    department_th: "ฝ่ายปฏิบัติการ",
    region_ids: ["reg-002"],
    branch_ids: ["brn-010", "brn-011"],
    created_at: "2023-06-01T00:00:00Z",
    last_login: "2024-01-15T07:30:00Z"
  },
  // ... more users
];
```

### Chat Message

```typescript
interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: Source[];
  created_at: string;
}

interface Source {
  id: string;
  title: string;
  type: 'document' | 'data';
  url?: string;
  relevance_score: number;
}

interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  title_th: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

// Sample Data
const chatHistory = {
  sessions: [
    {
      id: "chat-001",
      user_id: "user-001",
      title: "Water loss analysis for DMA-001",
      title_th: "วิเคราะห์น้ำสูญเสีย DMA-001",
      created_at: "2024-01-15T09:00:00Z",
      updated_at: "2024-01-15T09:15:00Z",
      message_count: 6
    }
  ],
  messages: [
    {
      id: "msg-001",
      session_id: "chat-001",
      role: "user",
      content: "สรุปข้อมูลน้ำสูญเสียของ DMA บางพลี-01 เดือนที่แล้ว",
      created_at: "2024-01-15T09:00:00Z"
    },
    {
      id: "msg-002",
      session_id: "chat-001",
      role: "assistant",
      content: "## สรุปน้ำสูญเสีย DMA บางพลี-01 (ธันวาคม 2566)\n\n### ข้อมูลหลัก\n- **น้ำเข้าเฉลี่ย**: 12,500 ลบ.ม./วัน\n- **น้ำออกเฉลี่ย**: 10,250 ลบ.ม./วัน\n- **น้ำสูญเสียเฉลี่ย**: 2,250 ลบ.ม./วัน\n- **เปอร์เซ็นต์สูญเสีย**: 18.0%\n\n### แนวโน้ม\nน้ำสูญเสียเพิ่มขึ้น 2.3% จากเดือนก่อน สาเหตุหลักมาจากแรงดันที่เพิ่มขึ้นในช่วงเช้า\n\n### คำแนะนำ\n1. ตรวจสอบท่อในเซกเตอร์ B\n2. ปรับแรงดันให้สม่ำเสมอ",
      sources: [
        {
          id: "src-001",
          title: "รายงานน้ำสูญเสียประจำเดือน ธ.ค. 66",
          type: "document",
          url: "/documents/monthly-dec-2023.pdf",
          relevance_score: 0.95
        }
      ],
      created_at: "2024-01-15T09:00:05Z"
    }
  ]
};
```

---

## Data Generation Guidelines

### Realistic Value Ranges

| Metric | Min | Max | Distribution |
| ------ | --- | --- | ------------ |
| Loss % (healthy) | 8 | 12 | Normal |
| Loss % (average) | 12 | 18 | Normal |
| Loss % (poor) | 18 | 25 | Normal |
| Loss % (crisis) | 25 | 35 | Normal |
| Flow rate (m³/h) | 50 | 500 | Log-normal |
| Pressure (bar) | 1.5 | 4.0 | Normal |
| Data quality | 80 | 100 | Left-skewed |

### Status Distribution

| Status | Percentage | Loss % Range |
| ------ | ---------- | ------------ |
| normal | 60% | < 15% |
| warning | 30% | 15-20% |
| critical | 10% | > 20% |

### Alert Severity Distribution

| Severity | Percentage |
| -------- | ---------- |
| low | 40% |
| medium | 35% |
| high | 20% |
| critical | 5% |

### Time-Series Patterns

```typescript
// Daily pattern (higher usage morning/evening)
const hourlyMultiplier = [
  0.7, 0.6, 0.5, 0.5, 0.6, 0.8,  // 00:00-05:00
  1.0, 1.2, 1.3, 1.2, 1.1, 1.0,  // 06:00-11:00
  0.9, 0.9, 1.0, 1.0, 1.1, 1.2,  // 12:00-17:00
  1.3, 1.2, 1.0, 0.9, 0.8, 0.7   // 18:00-23:00
];

// Weekly pattern (lower on weekends)
const dayMultiplier = [
  0.85, // Sunday
  1.0,  // Monday
  1.0,  // Tuesday
  1.0,  // Wednesday
  1.0,  // Thursday
  0.95, // Friday
  0.9   // Saturday
];
```

---

## Mock API Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  },
  "message": "Success",
  "message_th": "สำเร็จ",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "DMA not found",
    "message_th": "ไม่พบ DMA"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```
