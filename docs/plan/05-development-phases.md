# WARIS Development Phases

> Implementation roadmap for frontend mockup

## Phase Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT TIMELINE                          │
├─────────────────────────────────────────────────────────────────┤
│  Phase 1: Foundation     │  Documentation + Dependencies        │
│  Phase 2: Core UI        │  Layout + Dashboard + Basic Pages    │
│  Phase 3: Data Layer     │  Mock API + TanStack Query          │
│  Phase 4: Feature Pages  │  DMA, Alerts, Reports, Chat         │
│  Phase 5: Advanced       │  Map, Streaming, Real-time, PDF     │
│  Phase 6: Polish         │  i18n, Dark Mode, Responsive        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Foundation

### 1.1 Documentation

| Task | File | Status |
| ---- | ---- | ------ |
| Feature map | `docs/plan/01-feature-map.md` | Done |
| Page structure | `docs/plan/02-page-structure.md` | Done |
| Component library | `docs/plan/03-component-library.md` | Done |
| Mock data schema | `docs/plan/04-mock-data-schema.md` | Done |
| Development phases | `docs/plan/05-development-phases.md` | Done |

### 1.2 Dependencies Installation

```bash
cd platform/apps/web

# shadcn/ui setup
npx shadcn@latest init

# Install all shadcn components
npx shadcn@latest add button card input label select dropdown-menu \
  dialog sheet tabs table badge avatar skeleton toast sonner \
  calendar popover command scroll-area separator switch textarea \
  tooltip progress checkbox radio-group form

# Data fetching & state
npm install @tanstack/react-query zustand

# AI/Chat
npm install ai @ai-sdk/react

# Charts
npm install recharts

# Maps
npm install react-leaflet leaflet
npm install -D @types/leaflet

# Theme
npm install next-themes

# i18n
npm install next-intl

# Date utilities
npm install date-fns

# Forms
npm install react-hook-form @hookform/resolvers zod

# PDF
npm install react-pdf
npm install -D @types/react-pdf

# Icons
npm install lucide-react
```

### 1.3 Configuration Files

| File | Purpose |
| ---- | ------- |
| `tailwind.config.ts` | Thai theme colors, fonts |
| `components.json` | shadcn/ui configuration |
| `i18n.ts` | next-intl setup |
| `providers.tsx` | React Query, Theme providers |

---

## Phase 2: Core UI

### 2.1 Layout Components

| Component | Priority | Description |
| --------- | -------- | ----------- |
| `RootLayout` | P0 | Thai fonts, providers |
| `Sidebar` | P0 | Collapsible navigation |
| `Header` | P0 | Search, notifications, profile |
| `PageHeader` | P0 | Title, breadcrumbs, actions |
| `MobileNav` | P1 | Bottom navigation for mobile |

### 2.2 Auth Pages

| Page | Route | Description |
| ---- | ----- | ----------- |
| Login | `/login` | Thai login form |
| Auth layout | `(auth)/layout.tsx` | Centered minimal layout |

### 2.3 Dashboard Page

| Component | Priority | Description |
| --------- | -------- | ----------- |
| KPI Cards | P0 | 4 main metrics |
| Quick Filters | P1 | Region/Branch/Date |
| Stats summary | P0 | Top-level numbers |

---

## Phase 3: Data Layer

### 3.1 Mock Data Files

| File | Records | Description |
| ---- | ------- | ----------- |
| `regions.json` | 5 | PWA regions |
| `branches.json` | 50 | Branch offices |
| `dmas.json` | 200 | District metered areas |
| `alerts.json` | 100 | Sample alerts |
| `predictions.json` | 50 | AI predictions |
| `reports.json` | 20 | Generated reports |
| `users.json` | 10 | Sample users |

### 3.2 Route Handlers

| Endpoint | Method | Description |
| -------- | ------ | ----------- |
| `/api/dashboard` | GET | Dashboard summary |
| `/api/dma` | GET | DMA list with filters |
| `/api/dma/[id]` | GET | Single DMA details |
| `/api/dma/[id]/readings` | GET | Time-series data |
| `/api/alerts` | GET | Alert list |
| `/api/alerts/[id]` | PATCH | Update alert status |
| `/api/reports` | GET/POST | Report list/generate |
| `/api/chat` | POST | Chat with streaming |
| `/api/documents` | GET/POST | Document management |

### 3.3 TanStack Query Hooks

```typescript
// hooks/use-dashboard.ts
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });
}

// hooks/use-dmas.ts
export function useDMAs(filters?: DMAFilters) {
  return useQuery({
    queryKey: ['dmas', filters],
    queryFn: () => fetchDMAs(filters),
  });
}

export function useDMA(id: string) {
  return useQuery({
    queryKey: ['dma', id],
    queryFn: () => fetchDMA(id),
  });
}

// hooks/use-alerts.ts
export function useAlerts(filters?: AlertFilters) {
  return useQuery({
    queryKey: ['alerts', filters],
    queryFn: () => fetchAlerts(filters),
  });
}

export function useUpdateAlert() {
  return useMutation({
    mutationFn: updateAlert,
    onSuccess: () => queryClient.invalidateQueries(['alerts']),
  });
}
```

---

## Phase 4: Feature Pages

### 4.1 DMA Pages

| Page | Components | Priority |
| ---- | ---------- | -------- |
| DMA List | DataTable, FilterBar, StatusBadge | P0 |
| DMA Detail | MetricsGrid, TimeSeriesChart, AlertHistory | P0 |
| Predictions | PredictionCards (4 types) | P1 |

### 4.2 Alert Pages

| Page | Components | Priority |
| ---- | ---------- | -------- |
| Alert List | DataTable, FilterBar, AlertBadge | P0 |
| Alert Detail | AlertDetailModal | P1 |
| Alert Actions | Acknowledge/Resolve buttons | P1 |

### 4.3 Report Pages

| Page | Components | Priority |
| ---- | ---------- | -------- |
| Report List | DataTable, StatusBadge | P1 |
| Report Generator | ReportForm | P1 |
| Report Viewer | PDFViewer | P1 |

### 4.4 Chat Page

| Component | Priority | Description |
| --------- | -------- | ----------- |
| ChatWindow | P0 | Message container |
| ChatMessage | P0 | User/AI messages |
| ChatInput | P0 | Input with send |
| SuggestedQuestions | P1 | Quick start chips |
| SourceCitation | P1 | RAG sources |

---

## Phase 5: Advanced Features

### 5.1 Interactive Map (Leaflet)

| Component | Priority | Description |
| --------- | -------- | ----------- |
| DMAMap | P0 | Base map with polygons |
| DMAPopup | P1 | Quick stats popup |
| MapLegend | P1 | Color legend |
| MapControls | P2 | Layer toggle |

```tsx
// Dynamic import for SSR compatibility
const DMAMap = dynamic(() => import('@/components/map/dma-map'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});
```

### 5.2 Streaming Chat (Vercel AI SDK)

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Simulate streaming response
  const result = await streamText({
    model: mockModel,
    messages,
  });

  return result.toDataStreamResponse();
}
```

### 5.3 Real-time Alerts

```tsx
// Simulated real-time with interval
useEffect(() => {
  const interval = setInterval(() => {
    // Randomly trigger new alert
    if (Math.random() > 0.9) {
      const newAlert = generateRandomAlert();
      toast({
        title: newAlert.title_th,
        description: newAlert.message_th,
        variant: getSeverityVariant(newAlert.severity),
      });
    }
  }, 30000); // Every 30 seconds

  return () => clearInterval(interval);
}, []);
```

### 5.4 PDF Viewer

```tsx
// components/reports/pdf-viewer.tsx
import { Document, Page } from 'react-pdf';

export function PDFViewer({ url }: { url: string }) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  return (
    <div className="pdf-viewer">
      <Document file={url} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
        <Page pageNumber={pageNumber} />
      </Document>
      <div className="controls">
        <Button onClick={() => setPageNumber(p => Math.max(1, p - 1))}>
          Previous
        </Button>
        <span>{pageNumber} / {numPages}</span>
        <Button onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}>
          Next
        </Button>
      </div>
    </div>
  );
}
```

---

## Phase 6: Polish

### 6.1 Internationalization (Thai/English)

```
messages/
├── th.json    # Thai translations (primary)
└── en.json    # English translations
```

```json
// messages/th.json
{
  "common": {
    "dashboard": "แดชบอร์ด",
    "dma": "พื้นที่ DMA",
    "alerts": "การแจ้งเตือน",
    "reports": "รายงาน",
    "chat": "ถามตอบ AI",
    "settings": "ตั้งค่า"
  },
  "dashboard": {
    "title": "แดชบอร์ดภาพรวม",
    "waterInflow": "น้ำเข้า",
    "waterOutflow": "น้ำออก",
    "waterLoss": "น้ำสูญเสีย",
    "lossPercentage": "เปอร์เซ็นต์สูญเสีย"
  },
  "units": {
    "cubicMeterPerDay": "ลบ.ม./วัน",
    "cubicMeter": "ลบ.ม.",
    "percent": "%",
    "bar": "บาร์"
  }
}
```

### 6.2 Dark Mode

```tsx
// app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 6.3 Responsive Design

| Breakpoint | Layout Changes |
| ---------- | -------------- |
| < 640px | Single column, bottom nav, stacked cards |
| 640-1024px | 2-column, collapsible sidebar, compact tables |
| > 1024px | Full layout, expanded sidebar, full tables |

### 6.4 Loading States

| Component | Loading State |
| --------- | ------------- |
| Cards | Skeleton pulse |
| Tables | Row skeletons |
| Charts | Chart skeleton |
| Map | Map placeholder |
| Chat | Typing indicator |

---

## Deliverables Checklist

### Pages

- [ ] Login page with Thai form
- [ ] Main dashboard with KPIs
- [ ] DMA list with search/filter
- [ ] DMA detail with metrics + predictions
- [ ] Alert list with actions
- [ ] Report list with PDF preview
- [ ] Chat interface with streaming
- [ ] Settings page

### Components

- [ ] Sidebar navigation
- [ ] Header with search/notifications
- [ ] KPI cards
- [ ] Data tables
- [ ] Charts (line, bar, pie, gauge)
- [ ] Interactive map
- [ ] Chat window
- [ ] PDF viewer
- [ ] Alert toasts

### Features

- [ ] Mock API with realistic data
- [ ] TanStack Query integration
- [ ] Thai/English translations
- [ ] Dark/light theme
- [ ] Responsive design
- [ ] Streaming chat simulation
- [ ] Real-time alert simulation
- [ ] PDF report preview

### Quality

- [ ] TypeScript strict mode
- [ ] All Thai labels correct
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Mobile-friendly
- [ ] Accessibility basics

---

## File Creation Order

```
1. Configuration
   - tailwind.config.ts (update theme)
   - components.json (shadcn config)
   - lib/utils.ts (cn utility)
   - lib/formatting.ts (Thai formatting)

2. Providers
   - components/providers.tsx
   - app/layout.tsx (update)

3. Layout Components
   - components/layout/sidebar.tsx
   - components/layout/header.tsx
   - components/layout/page-header.tsx
   - app/(dashboard)/layout.tsx

4. Mock Data
   - lib/mock-data/*.json
   - app/api/*/route.ts

5. Hooks
   - hooks/use-dashboard.ts
   - hooks/use-dmas.ts
   - hooks/use-alerts.ts

6. Pages (in order)
   - app/(auth)/login/page.tsx
   - app/(dashboard)/page.tsx
   - app/(dashboard)/dma/page.tsx
   - app/(dashboard)/dma/[id]/page.tsx
   - app/(dashboard)/alerts/page.tsx
   - app/(dashboard)/chat/page.tsx
   - app/(dashboard)/reports/page.tsx

7. Advanced Components
   - components/map/dma-map.tsx
   - components/chat/chat-window.tsx
   - components/reports/pdf-viewer.tsx

8. i18n
   - messages/th.json
   - messages/en.json
   - i18n/request.ts
```
