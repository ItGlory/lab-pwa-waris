# WARIS Design System - UI Guidelines

> แนวทางการออกแบบ UI สำหรับ WARIS Dashboard

---

## 1. Layout Structure

### Page Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header (h-16)                                              │
├────────────┬────────────────────────────────────────────────┤
│            │                                                │
│  Sidebar   │  Main Content                                  │
│  (w-64)    │  (flex-1, p-6)                                │
│            │                                                │
│            │  ┌──────────────────────────────────────────┐  │
│  - Logo    │  │ Page Header                              │  │
│  - Nav     │  │ - Title (text-2xl font-bold)             │  │
│  - Links   │  │ - Subtitle (text-muted-foreground)       │  │
│            │  └──────────────────────────────────────────┘  │
│            │                                                │
│            │  ┌──────────────────────────────────────────┐  │
│            │  │ Content Cards (space-y-6)                │  │
│            │  └──────────────────────────────────────────┘  │
│            │                                                │
└────────────┴────────────────────────────────────────────────┘
```

### Grid System
- Use CSS Grid for page-level layouts
- Use Flexbox for component-level layouts
- Standard gap: `gap-4` (16px) or `gap-6` (24px)

```tsx
// Dashboard KPI grid
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {/* KPI Cards */}
</div>

// Two-column layout
<div className="grid gap-6 lg:grid-cols-2">
  {/* Left column */}
  {/* Right column */}
</div>

// 3-column status grid
<div className="grid gap-4 sm:grid-cols-3">
  {/* Status cards */}
</div>
```

---

## 2. Typography

### Font Stack
```css
--font-sans: "Noto Sans Thai", "Inter", system-ui, sans-serif;
```

### Text Sizes

| Use Case | Class | Size |
|----------|-------|------|
| Page title | `text-2xl font-bold` | 24px |
| Card title | `text-base font-medium` | 16px |
| KPI value | `text-2xl font-bold` | 24px |
| Body text | `text-sm` | 14px |
| Label | `text-xs` | 12px |
| Muted text | `text-muted-foreground` | - |

### Line Height
- Use `leading-normal` (1.5) for Thai text
- Use `leading-relaxed` (1.625) for long paragraphs

---

## 3. Spacing

### Standard Spacing Scale
| Token | Value | Use Case |
|-------|-------|----------|
| `p-2` | 8px | Small padding |
| `p-3` | 12px | Compact elements |
| `p-4` | 16px | Card content |
| `p-6` | 24px | Page padding |
| `gap-2` | 8px | Tight grouping |
| `gap-3` | 12px | List items |
| `gap-4` | 16px | Card grid |
| `gap-6` | 24px | Section spacing |

### Section Spacing
```tsx
<div className="space-y-6">
  {/* Page Header */}
  <div>...</div>

  {/* KPI Cards */}
  <div className="grid gap-4">...</div>

  {/* Main Content */}
  <div className="grid gap-6">...</div>
</div>
```

---

## 4. Visual Hierarchy

### Status Display Priority
1. **Critical (วิกฤต)** - Immediate attention required
   - Red color, prominent placement
2. **Warning (เฝ้าระวัง)** - Needs monitoring
   - Amber color, visible but less urgent
3. **Normal (ปกติ)** - Operating correctly
   - Green color, confirmatory

### Information Hierarchy
1. Primary: KPI values (large, bold)
2. Secondary: Labels, descriptions
3. Tertiary: Metadata, timestamps

---

## 5. Responsive Design

### Breakpoints
| Prefix | Min Width | Typical Device |
|--------|-----------|----------------|
| `sm:` | 640px | Large phone |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Laptop |
| `xl:` | 1280px | Desktop |

### Mobile-First Patterns
```tsx
// Cards: 1 column mobile, 2 tablet, 4 desktop
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

// Sidebar: hidden on mobile, visible on desktop
<aside className="hidden md:flex md:w-64 md:flex-col">

// Filters: stack on mobile, row on desktop
<div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
```

---

## 6. Interactive States

### Buttons
```tsx
// Primary action
<Button>บันทึก</Button>

// Secondary action
<Button variant="outline">ยกเลิก</Button>

// Destructive action
<Button variant="destructive">ลบ</Button>

// Ghost (navigation)
<Button variant="ghost">ดูทั้งหมด</Button>
```

### Hover Effects
```tsx
// Card hover
<Card className="transition-shadow hover:shadow-md">

// Row hover
<TableRow className="hover:bg-muted/50">

// Link hover
<Link className="hover:underline">
```

### Focus States
- Always show focus ring for accessibility
- Use `ring-2 ring-ring ring-offset-2` for focus

---

## 7. Icons

### Icon Sizes
| Context | Class | Size |
|---------|-------|------|
| Button icon | `h-4 w-4` | 16px |
| Card icon | `h-5 w-5` | 20px |
| Empty state | `h-12 w-12` | 48px |

### Icon Colors
```tsx
// On colored background
<Icon className="text-white" />

// On light background (status)
<Icon className="text-emerald-500" />  // Normal
<Icon className="text-amber-500" />    // Warning
<Icon className="text-red-500" />      // Critical

// Muted
<Icon className="text-muted-foreground" />
```

### Icon Library
Use Lucide React icons consistently:
- `Droplets` - Water-related
- `MapPin` - Location/DMA
- `AlertCircle` - Critical alert
- `AlertTriangle` - Warning
- `CheckCircle` - Success
- `Info` - Information
- `TrendingUp/Down` - Trends
- `ChevronRight` - Navigation

---

## 8. Cards

### Card Anatomy
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

### Card Variants

**Standard Card**
```tsx
<Card>
  <CardContent className="p-4">
    {/* Content */}
  </CardContent>
</Card>
```

**Status Card**
```tsx
<Card className="bg-emerald-500 text-white border-0">
  <CardContent className="p-4">
    {/* Content */}
  </CardContent>
</Card>
```

**Compact Card**
```tsx
<Card>
  <CardContent className="p-3">
    {/* Content */}
  </CardContent>
</Card>
```

---

## 9. Forms

### Input Fields
```tsx
<div className="space-y-2">
  <Label htmlFor="search">ค้นหา</Label>
  <Input id="search" placeholder="พิมพ์เพื่อค้นหา..." />
</div>
```

### With Icon
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  <Input placeholder="ค้นหา..." className="pl-9" />
</div>
```

### Select
```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="w-[200px]">
    <SelectValue placeholder="เลือก..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

---

## 10. Thai Language UI

### Text Labels
Always provide Thai translations:
| English | Thai |
|---------|------|
| Dashboard | แดชบอร์ด |
| DMA | พื้นที่จ่ายน้ำย่อย |
| Water Loss | น้ำสูญเสีย |
| Alerts | การแจ้งเตือน |
| Reports | รายงาน |
| Normal | ปกติ |
| Warning | เฝ้าระวัง |
| Critical | วิกฤต |

### Number Formatting
```tsx
// Use Thai locale for numbers
formatNumber(12345)  // "12,345"
formatPercent(0.155) // "15.5%"

// Buddhist calendar for dates
new Date().toLocaleDateString('th-TH') // "15/1/2567"
```

### Units
| Unit | Thai |
|------|------|
| m³/day | ลบ.ม./วัน |
| km² | ตร.กม. |
| km | กม. |
| bar | บาร์ |
| people | คน |
| connections | ราย |
