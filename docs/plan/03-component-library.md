# WARIS Component Library

> UI components specification with shadcn/ui base

## Component Organization

```
platform/apps/web/components/
├── ui/                    # shadcn/ui base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── toast.tsx
│   ├── skeleton.tsx
│   └── ...
│
├── layout/                # Layout components
│   ├── sidebar.tsx
│   ├── header.tsx
│   ├── mobile-nav.tsx
│   ├── page-header.tsx
│   └── footer.tsx
│
├── dashboard/             # Dashboard-specific components
│   ├── kpi-card.tsx
│   ├── metrics-grid.tsx
│   ├── alert-list.tsx
│   ├── quick-filters.tsx
│   └── live-indicator.tsx
│
├── charts/                # Chart components
│   ├── water-loss-chart.tsx
│   ├── area-chart.tsx
│   ├── bar-chart.tsx
│   ├── pie-chart.tsx
│   ├── gauge-chart.tsx
│   └── chart-container.tsx
│
├── map/                   # Map components
│   ├── dma-map.tsx
│   ├── dma-popup.tsx
│   ├── map-legend.tsx
│   └── map-controls.tsx
│
├── chat/                  # Chat components
│   ├── chat-window.tsx
│   ├── chat-message.tsx
│   ├── chat-input.tsx
│   ├── source-citation.tsx
│   ├── suggested-questions.tsx
│   └── streaming-indicator.tsx
│
├── reports/               # Report components
│   ├── pdf-viewer.tsx
│   ├── report-generator.tsx
│   └── report-list.tsx
│
├── alerts/                # Alert components
│   ├── alert-toast.tsx
│   ├── alert-badge.tsx
│   ├── alert-detail-modal.tsx
│   └── alert-history.tsx
│
├── predictions/           # AI prediction components
│   ├── prediction-card.tsx
│   ├── anomaly-badge.tsx
│   ├── confidence-bar.tsx
│   └── forecast-chart.tsx
│
├── forms/                 # Form components
│   ├── login-form.tsx
│   ├── date-range-picker.tsx
│   ├── region-selector.tsx
│   ├── dma-selector.tsx
│   └── filter-bar.tsx
│
└── common/                # Shared components
    ├── status-badge.tsx
    ├── theme-toggle.tsx
    ├── language-toggle.tsx
    ├── empty-state.tsx
    ├── error-card.tsx
    └── loading-states.tsx
```

---

## Component Specifications

### Layout Components

#### Sidebar

```tsx
interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

// Features:
// - Collapsible with animation
// - PWA logo at top
// - Navigation menu items
// - Active state highlighting
// - Badge for alerts count
// - User profile at bottom
// - Responsive (hidden on mobile)
```

#### Header

```tsx
interface HeaderProps {
  title?: string;
}

// Features:
// - Page title / breadcrumbs
// - Global search
// - Alert notification bell with badge
// - Theme toggle (dark/light)
// - Language toggle (TH/EN)
// - User avatar dropdown
// - Mobile menu button
```

#### PageHeader

```tsx
interface PageHeaderProps {
  title: string;
  titleEn?: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
}

// Features:
// - Page title with Thai primary
// - Optional description
// - Action buttons (right side)
// - Breadcrumb navigation
```

---

### Dashboard Components

#### KPICard

```tsx
interface KPICardProps {
  title: string;
  titleEn?: string;
  value: number;
  unit: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: number;
    label: string;
  };
  status?: 'normal' | 'warning' | 'critical';
  icon?: LucideIcon;
  loading?: boolean;
}

// Features:
// - Large value display with Thai number formatting
// - Unit label (ลบ.ม., %)
// - Trend indicator with arrow
// - Status color coding
// - Icon display
// - Loading skeleton state
```

#### MetricsGrid

```tsx
interface MetricsGridProps {
  metrics: KPICardProps[];
  columns?: 2 | 3 | 4;
  loading?: boolean;
}

// Features:
// - Responsive grid layout
// - 4 columns on desktop, 2 on tablet, 1 on mobile
// - Consistent card heights
// - Loading state for all cards
```

#### AlertList

```tsx
interface AlertListProps {
  alerts: Alert[];
  maxItems?: number;
  showViewAll?: boolean;
  onAlertClick?: (alert: Alert) => void;
}

// Features:
// - Compact alert list
// - Severity icons with colors
// - Thai timestamp formatting
// - "View all" link
// - Click to open detail modal
// - Empty state message
```

#### QuickFilters

```tsx
interface QuickFiltersProps {
  regions: Region[];
  branches: Branch[];
  onFilterChange: (filters: FilterState) => void;
  defaultFilters?: FilterState;
}

// Features:
// - Region multi-select
// - Branch multi-select (filtered by region)
// - Date range picker
// - Status dropdown
// - Apply/Reset buttons
// - Saved filter presets
```

---

### Chart Components

#### WaterLossChart

```tsx
interface WaterLossChartProps {
  data: TimeSeriesData[];
  dateRange?: { from: Date; to: Date };
  showInflow?: boolean;
  showOutflow?: boolean;
  showLoss?: boolean;
  loading?: boolean;
}

// Features:
// - Line chart with multiple series
// - Toggle series visibility
// - Interactive tooltips (Thai formatting)
// - Zoom and pan
// - Export as PNG
// - Responsive sizing
// - Time range presets (7D, 30D, 90D, 1Y)
```

#### PieChart

```tsx
interface PieChartProps {
  data: { name: string; value: number; color?: string }[];
  title?: string;
  showLegend?: boolean;
  showLabels?: boolean;
  loading?: boolean;
}

// Features:
// - Donut or full pie option
// - Interactive hover
// - Legend with toggles
// - Percentage labels
// - Thai number formatting
```

#### GaugeChart

```tsx
interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  thresholds?: { value: number; color: string }[];
  label?: string;
  loading?: boolean;
}

// Features:
// - Semi-circle gauge
// - Color zones (green/yellow/red)
// - Current value display
// - Min/max labels
// - Animated transitions
```

---

### Map Components

#### DMAMap

```tsx
interface DMAMapProps {
  dmas: DMAWithGeometry[];
  selectedDMA?: string;
  onDMAClick?: (dma: DMA) => void;
  center?: [number, number];
  zoom?: number;
  showLegend?: boolean;
}

// Features:
// - Leaflet base map (OpenStreetMap)
// - Thailand centered by default
// - DMA polygons with color by status
// - Click to select DMA
// - Popup with quick stats
// - Zoom controls
// - Layer toggle (satellite/street)
// - Responsive container
```

#### DMAPopup

```tsx
interface DMAPopupProps {
  dma: DMA;
  onViewDetails?: () => void;
}

// Features:
// - DMA name and code
// - Current loss percentage
// - Status badge
// - Quick metrics
// - "View Details" button
```

#### MapLegend

```tsx
interface MapLegendProps {
  items: { color: string; label: string }[];
}

// Features:
// - Compact legend box
// - Color swatches
// - Thai labels
// - Collapsible on mobile
```

---

### Chat Components

#### ChatWindow

```tsx
interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  onSend: (message: string) => void;
}

// Features:
// - Scrollable message container
// - Auto-scroll to bottom
// - Loading indicator during response
// - Empty state with suggestions
// - Keyboard shortcuts
```

#### ChatMessage

```tsx
interface ChatMessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

// Features:
// - User vs AI styling
// - Streaming text animation
// - Thai timestamp
// - Copy button
// - Source citations
// - Markdown rendering
```

#### ChatInput

```tsx
interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

// Features:
// - Multi-line textarea
// - Character count
// - Send button
// - Submit on Enter (Shift+Enter for newline)
// - Disabled during streaming
```

#### SourceCitation

```tsx
interface SourceCitationProps {
  sources: Source[];
  onSourceClick?: (source: Source) => void;
}

// Features:
// - Compact source links
// - Document icons
// - Click to preview
// - "📎 แหล่งข้อมูล:" label
```

#### SuggestedQuestions

```tsx
interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

// Features:
// - Chip/pill buttons
// - Thai question text
// - Click to send
// - Scrollable horizontal on mobile
```

---

### Report Components

#### PDFViewer

```tsx
interface PDFViewerProps {
  url: string;
  title?: string;
  onClose?: () => void;
}

// Features:
// - Embedded PDF rendering (react-pdf)
// - Page navigation
// - Zoom controls
// - Download button
// - Print button
// - Full-screen mode
// - Loading state
```

#### ReportGenerator

```tsx
interface ReportGeneratorProps {
  onGenerate: (config: ReportConfig) => void;
}

// Features:
// - Report type selector
// - Date range picker
// - Scope selector (regions/DMAs)
// - AI summary checkbox
// - Format selector (PDF/DOCX/Excel)
// - Generate button with loading
```

---

### Alert Components

#### AlertToast

```tsx
interface AlertToastProps {
  alert: Alert;
  onDismiss: () => void;
  onView: () => void;
}

// Features:
// - Slide-in animation
// - Severity color accent
// - Thai message
// - View and Dismiss buttons
// - Auto-dismiss after 10s
// - Sound notification (optional)
```

#### AlertBadge

```tsx
interface AlertBadgeProps {
  count: number;
  maxCount?: number;
  pulsing?: boolean;
}

// Features:
// - Red badge with count
// - "99+" for high counts
// - Pulsing animation for new
// - Hidden when count is 0
```

---

### Prediction Components

#### PredictionCard

```tsx
interface PredictionCardProps {
  type: 'anomaly' | 'pattern' | 'classification' | 'forecast';
  prediction: Prediction;
  loading?: boolean;
}

// Features:
// - Card with prediction type header
// - Status indicator
// - Confidence bar
// - Thai description
// - Expandable details
// - Model version info
```

#### ConfidenceBar

```tsx
interface ConfidenceBarProps {
  value: number; // 0-100
  label?: string;
  showValue?: boolean;
}

// Features:
// - Horizontal progress bar
// - Color gradient (red to green)
// - Percentage label
// - Animation on mount
```

---

### Form Components

#### DateRangePicker

```tsx
interface DateRangePickerProps {
  value?: { from: Date; to: Date };
  onChange: (range: { from: Date; to: Date }) => void;
  presets?: DateRangePreset[];
  locale?: 'th' | 'en';
}

// Features:
// - Dual calendar picker
// - Thai Buddhist calendar option
// - Preset buttons (7D, 30D, 90D, 1Y)
// - Custom range
// - Apply/Cancel buttons
// - Thai date formatting
```

#### RegionSelector

```tsx
interface RegionSelectorProps {
  regions: Region[];
  value?: string[];
  onChange: (selected: string[]) => void;
  multiple?: boolean;
}

// Features:
// - Multi-select dropdown
// - Search/filter
// - Select all/none
// - Thai region names
// - Branch count per region
```

---

### Common Components

#### StatusBadge

```tsx
interface StatusBadgeProps {
  status: 'normal' | 'warning' | 'critical' | 'inactive';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Colors:
// - normal: green
// - warning: yellow
// - critical: red
// - inactive: gray
```

#### ThemeToggle

```tsx
interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
}

// Features:
// - Sun/Moon icons
// - Smooth transition
// - System theme option
// - Persisted preference
```

#### LanguageToggle

```tsx
interface LanguageToggleProps {
  size?: 'sm' | 'md' | 'lg';
}

// Features:
// - TH/EN toggle
// - Flag icons optional
// - Persisted preference
// - Instant UI update
```

#### EmptyState

```tsx
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Features:
// - Centered layout
// - Muted icon
// - Thai text
// - Optional action button
```

#### LoadingStates

```tsx
// Skeleton components
<CardSkeleton />
<TableSkeleton rows={5} />
<ChartSkeleton />
<ListSkeleton items={3} />

// Spinner components
<Spinner size="sm" />
<LoadingOverlay />
```

---

## shadcn/ui Components to Install

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add dropdown-menu
npx shadcn@latest add dialog
npx shadcn@latest add sheet
npx shadcn@latest add tabs
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add skeleton
npx shadcn@latest add toast
npx shadcn@latest add sonner
npx shadcn@latest add calendar
npx shadcn@latest add popover
npx shadcn@latest add command
npx shadcn@latest add scroll-area
npx shadcn@latest add separator
npx shadcn@latest add switch
npx shadcn@latest add textarea
npx shadcn@latest add tooltip
npx shadcn@latest add progress
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add form
```

---

## Icon Library

Using **Lucide React** icons:

```tsx
import {
  // Navigation
  LayoutDashboard,
  MapPin,
  Bell,
  MessageSquare,
  FileText,
  FolderOpen,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,

  // Actions
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit,
  Plus,
  X,
  Check,

  // Status
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,

  // Data
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  PieChart,
  LineChart,

  // Misc
  Sun,
  Moon,
  User,
  LogOut,
  Copy,
  ExternalLink,
  Loader2,
  Droplets,
  Gauge,
} from 'lucide-react';
```
