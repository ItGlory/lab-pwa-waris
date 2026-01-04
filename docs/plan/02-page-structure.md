# WARIS Page Structure & Routing

> App Router page organization and layouts

## Directory Structure

```
platform/apps/web/app/
├── (auth)/                          # Auth group (minimal layout)
│   ├── layout.tsx                   # Auth layout (centered, no sidebar)
│   ├── login/
│   │   └── page.tsx                 # Login page
│   └── logout/
│       └── page.tsx                 # Logout handler
│
├── (dashboard)/                     # Dashboard group (main layout)
│   ├── layout.tsx                   # Dashboard layout (sidebar + header)
│   ├── page.tsx                     # Main dashboard (/)
│   │
│   ├── dma/
│   │   ├── page.tsx                 # DMA list (/dma)
│   │   └── [id]/
│   │       ├── page.tsx             # DMA detail (/dma/[id])
│   │       └── predictions/
│   │           └── page.tsx         # AI predictions (/dma/[id]/predictions)
│   │
│   ├── alerts/
│   │   ├── page.tsx                 # Alert list (/alerts)
│   │   └── [id]/
│   │       └── page.tsx             # Alert detail (/alerts/[id])
│   │
│   ├── reports/
│   │   ├── page.tsx                 # Report list (/reports)
│   │   ├── new/
│   │   │   └── page.tsx             # Generate report (/reports/new)
│   │   └── [id]/
│   │       └── page.tsx             # Report viewer (/reports/[id])
│   │
│   ├── chat/
│   │   └── page.tsx                 # Chat Q&A (/chat)
│   │
│   ├── documents/
│   │   └── page.tsx                 # Document management (/documents)
│   │
│   └── settings/
│       ├── page.tsx                 # User settings (/settings)
│       └── admin/
│           └── page.tsx             # Admin settings (/settings/admin)
│
├── api/                             # Route Handlers (Mock API)
│   ├── dashboard/
│   │   └── route.ts                 # GET /api/dashboard
│   ├── dma/
│   │   ├── route.ts                 # GET /api/dma (list)
│   │   └── [id]/
│   │       ├── route.ts             # GET /api/dma/[id]
│   │       └── readings/
│   │           └── route.ts         # GET /api/dma/[id]/readings
│   ├── alerts/
│   │   └── route.ts                 # GET/PATCH /api/alerts
│   ├── reports/
│   │   └── route.ts                 # GET/POST /api/reports
│   ├── chat/
│   │   └── route.ts                 # POST /api/chat (streaming)
│   ├── documents/
│   │   └── route.ts                 # GET/POST /api/documents
│   └── auth/
│       └── route.ts                 # POST /api/auth (mock login)
│
├── layout.tsx                       # Root layout
├── globals.css                      # Global styles
└── not-found.tsx                    # 404 page
```

---

## Layout Hierarchy

### Root Layout (`/app/layout.tsx`)

```tsx
// Responsibilities:
// - HTML lang="th"
// - Thai fonts (Noto Sans Thai)
// - ThemeProvider (next-themes)
// - QueryClientProvider (TanStack Query)
// - Toaster (sonner for alerts)

export default function RootLayout({ children }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={fonts}>
        <ThemeProvider>
          <QueryClientProvider>
            {children}
            <Toaster />
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Auth Layout (`/app/(auth)/layout.tsx`)

```tsx
// Responsibilities:
// - Centered container
// - PWA logo header
// - No sidebar/navigation
// - Language toggle only

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-6">
        <Logo className="mx-auto mb-8" />
        {children}
      </div>
    </div>
  );
}
```

### Dashboard Layout (`/app/(dashboard)/layout.tsx`)

```tsx
// Responsibilities:
// - Collapsible sidebar
// - Top header with search, notifications, profile
// - Main content area
// - Mobile bottom navigation
// - Alert notification toasts

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
      <MobileNav className="md:hidden" />
    </div>
  );
}
```

---

## Page Specifications

### 1. Login Page (`/login`)

| Section | Component | Description |
| ------- | --------- | ----------- |
| Header | Logo | PWA logo centered |
| Form | LoginForm | Email, password, remember me |
| Footer | LanguageToggle | TH/EN switch |
| Actions | Submit button | เข้าสู่ระบบ |

### 2. Main Dashboard (`/`)

| Section | Component | Description |
| ------- | --------- | ----------- |
| Header | PageHeader | แดชบอร์ด + filters |
| Row 1 | KPICards (4) | น้ำเข้า, น้ำออก, น้ำสูญเสีย, % |
| Row 2 Left | WaterLossChart | Time-series line chart |
| Row 2 Right | AlertList | Recent 10 alerts |
| Row 3 | DMAMap | Interactive Leaflet map |

### 3. DMA List (`/dma`)

| Section | Component | Description |
| ------- | --------- | ----------- |
| Header | PageHeader | รายการ DMA + search |
| Filters | FilterBar | Region, Branch, Status |
| Content | DataTable | Sortable DMA table |
| Actions | Row click | Navigate to detail |

### 4. DMA Detail (`/dma/[id]`)

| Section | Component | Description |
| ------- | --------- | ----------- |
| Header | DMAHeader | Code, name, status badge |
| Row 1 | MetricsGrid | 4 KPI cards |
| Row 2 | TimeSeriesChart | Configurable date range |
| Row 3 | PredictionCards | 4 AI model results |
| Row 4 | AlertHistory | 60-day alert list |

### 5. Alerts (`/alerts`)

| Section | Component | Description |
| ------- | --------- | ----------- |
| Header | PageHeader | การแจ้งเตือน + badge count |
| Filters | FilterBar | Severity, status, date |
| Content | AlertTable | Paginated alert list |
| Modal | AlertDetailModal | Full alert details |

### 6. Chat (`/chat`)

| Section | Component | Description |
| ------- | --------- | ----------- |
| Sidebar | ConversationList | Past conversations |
| Main | ChatWindow | Message history |
| Footer | ChatInput | Input + send button |
| Overlay | SuggestedQuestions | Quick question chips |

### 7. Reports (`/reports`)

| Section | Component | Description |
| ------- | --------- | ----------- |
| Header | PageHeader | รายงาน + new button |
| Content | ReportList | Table with preview/download |
| Modal | PDFViewer | Embedded PDF preview |

### 8. Documents (`/documents`)

| Section | Component | Description |
| ------- | --------- | ----------- |
| Header | PageHeader | เอกสาร + upload button |
| Upload | DropZone | Drag-and-drop upload |
| Content | DocumentList | Table with status |

### 9. Settings (`/settings`)

| Section | Component | Description |
| ------- | --------- | ----------- |
| Navigation | SettingsTabs | Profile, Preferences, Admin |
| Profile | ProfileForm | Name, email, avatar |
| Preferences | PreferencesForm | Theme, language, notifications |

---

## Navigation Structure

### Sidebar Menu

```tsx
const menuItems = [
  {
    label: 'แดชบอร์ด',
    labelEn: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'พื้นที่ DMA',
    labelEn: 'DMA Areas',
    href: '/dma',
    icon: MapPin,
  },
  {
    label: 'การแจ้งเตือน',
    labelEn: 'Alerts',
    href: '/alerts',
    icon: Bell,
    badge: alertCount, // Dynamic count
  },
  {
    label: 'ถามตอบ AI',
    labelEn: 'AI Chat',
    href: '/chat',
    icon: MessageSquare,
  },
  {
    label: 'รายงาน',
    labelEn: 'Reports',
    href: '/reports',
    icon: FileText,
  },
  {
    label: 'เอกสาร',
    labelEn: 'Documents',
    href: '/documents',
    icon: FolderOpen,
  },
  {
    label: 'ตั้งค่า',
    labelEn: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];
```

### Mobile Bottom Navigation

```tsx
const mobileNavItems = [
  { label: 'หน้าแรก', href: '/', icon: Home },
  { label: 'DMA', href: '/dma', icon: MapPin },
  { label: 'แจ้งเตือน', href: '/alerts', icon: Bell, badge: true },
  { label: 'ถามตอบ', href: '/chat', icon: MessageSquare },
  { label: 'เพิ่มเติม', href: '#more', icon: Menu }, // Opens drawer
];
```

---

## Route Parameters

### Dynamic Routes

| Route | Parameter | Type | Description |
| ----- | --------- | ---- | ----------- |
| `/dma/[id]` | id | string | DMA UUID |
| `/dma/[id]/predictions` | id | string | DMA UUID |
| `/alerts/[id]` | id | string | Alert UUID |
| `/reports/[id]` | id | string | Report UUID |

### Query Parameters

| Route | Parameter | Type | Description |
| ----- | --------- | ---- | ----------- |
| `/dma` | region | string | Filter by region |
| `/dma` | branch | string | Filter by branch |
| `/dma` | status | string | Filter by status |
| `/alerts` | severity | string | Filter by severity |
| `/alerts` | status | string | Filter by status |
| `/reports` | type | string | Filter by report type |
| All pages | from, to | string | Date range (ISO) |

---

## Loading & Error States

### Loading UI

```tsx
// Page-level loading
export default function Loading() {
  return <PageSkeleton />;
}

// Component-level loading
<Suspense fallback={<CardSkeleton />}>
  <KPICards />
</Suspense>
```

### Error UI

```tsx
// Page-level error
export default function Error({ error, reset }) {
  return (
    <ErrorCard
      title="เกิดข้อผิดพลาด"
      message={error.message}
      action={<Button onClick={reset}>ลองอีกครั้ง</Button>}
    />
  );
}
```

### Not Found

```tsx
// 404 page
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">ไม่พบหน้าที่คุณต้องการ</p>
      <Button asChild>
        <Link href="/">กลับหน้าแรก</Link>
      </Button>
    </div>
  );
}
```

---

## Protected Routes (Mock)

### Auth Guard

```tsx
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');

  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## SEO & Metadata

### Per-Page Metadata

```tsx
// app/(dashboard)/page.tsx
export const metadata: Metadata = {
  title: 'แดชบอร์ด | WARIS',
  description: 'ระบบวิเคราะห์และรายงานข้อมูลน้ำสูญเสียอัจฉริยะ',
};

// app/(dashboard)/dma/page.tsx
export const metadata: Metadata = {
  title: 'รายการ DMA | WARIS',
  description: 'จัดการพื้นที่จ่ายน้ำย่อย (DMA)',
};
```

### Dynamic Metadata

```tsx
// app/(dashboard)/dma/[id]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const dma = await getDMA(params.id);
  return {
    title: `${dma.name_th} | WARIS`,
    description: `วิเคราะห์น้ำสูญเสียสำหรับ ${dma.name_th}`,
  };
}
```
