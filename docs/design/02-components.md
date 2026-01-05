# WARIS Design System - Components

> คู่มือ Components สำหรับ WARIS Dashboard

---

## 1. Badge Components

### Status Badges

```tsx
import { Badge } from '@/components/ui/badge';

// Success/Normal - ปกติ
<Badge variant="success">ปกติ</Badge>

// Warning - เฝ้าระวัง
<Badge variant="warning">เฝ้าระวัง</Badge>

// Critical - วิกฤต
<Badge variant="critical">วิกฤต</Badge>
```

### Implementation
```tsx
// badge.tsx variants
success: 'border-emerald-500 bg-emerald-500 text-white font-bold',
warning: 'border-amber-500 bg-amber-500 text-white font-bold',
critical: 'border-red-500 bg-red-500 text-white font-bold',
```

---

## 2. KPI Cards

### Standard KPI Card

```tsx
import { KPICard } from '@/components/dashboard/kpi-card';

<KPICard
  title="น้ำสูญเสีย"
  value="15.5"
  unit="%"
  trend={{ direction: 'up', value: 2.3, label: '+2.3% จากเดือนก่อน' }}
  status="warning"
  icon={Droplets}
/>
```

### Status-Colored Cards
For high-visibility status display:

```tsx
<Card className="bg-emerald-500 text-white border-0">
  <CardContent className="p-4">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
        <Droplets className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-emerald-100">ปกติ</p>
        <p className="text-2xl font-bold text-white">42</p>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 3. Alert List

### Severity Configuration

```tsx
const severityConfig = {
  critical: {
    icon: AlertCircle,
    variant: 'critical',
    color: 'text-white',
    bg: 'bg-red-500',
  },
  high: {
    icon: AlertTriangle,
    variant: 'warning',
    color: 'text-white',
    bg: 'bg-orange-500',
  },
  medium: {
    icon: AlertTriangle,
    variant: 'warning',
    color: 'text-white',
    bg: 'bg-amber-500',
  },
  low: {
    icon: Info,
    variant: 'secondary',
    color: 'text-white',
    bg: 'bg-blue-500',
  },
};
```

---

## 4. Data Tables

### DMA Table

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>DMA</TableHead>
      <TableHead>สาขา / เขต</TableHead>
      <TableHead>น้ำสูญเสีย</TableHead>
      <TableHead>สถานะ</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {dmas.map((dma) => (
      <TableRow key={dma.id}>
        <TableCell>
          <div>
            <p className="font-medium">{dma.name_th}</p>
            <p className="text-xs text-muted-foreground">{dma.code}</p>
          </div>
        </TableCell>
        <TableCell>
          <p className="text-sm">{dma.branch_name}</p>
        </TableCell>
        <TableCell>
          <span className={cn(
            'text-lg font-bold',
            dma.status === 'normal' ? 'text-emerald-700' :
            dma.status === 'warning' ? 'text-amber-700' :
            'text-red-700'
          )}>
            {formatPercent(dma.loss_percentage)}
          </span>
        </TableCell>
        <TableCell>
          <Badge variant={getStatusVariant(dma.status)}>
            {getStatusText(dma.status)}
          </Badge>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## 5. Status Distribution Box

### Horizontal Layout (Dashboard)

```tsx
<div className="grid gap-4 sm:grid-cols-3">
  <div className="flex items-center justify-between rounded-lg bg-emerald-500 p-4 text-white">
    <div>
      <p className="text-sm font-medium text-emerald-100">ปกติ</p>
      <p className="text-2xl font-bold text-white">{normalCount}</p>
    </div>
    <Badge variant="success">Normal</Badge>
  </div>

  <div className="flex items-center justify-between rounded-lg bg-amber-500 p-4 text-white">
    <div>
      <p className="text-sm font-medium text-amber-100">เฝ้าระวัง</p>
      <p className="text-2xl font-bold text-white">{warningCount}</p>
    </div>
    <Badge variant="warning">Warning</Badge>
  </div>

  <div className="flex items-center justify-between rounded-lg bg-red-500 p-4 text-white">
    <div>
      <p className="text-sm font-medium text-red-100">วิกฤต</p>
      <p className="text-2xl font-bold text-white">{criticalCount}</p>
    </div>
    <Badge variant="critical">Critical</Badge>
  </div>
</div>
```

---

## 6. Filter Bar

```tsx
<Card>
  <CardHeader className="pb-3">
    <CardTitle className="flex items-center gap-2 text-base font-medium">
      <Filter className="h-4 w-4" />
      ตัวกรอง
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex flex-wrap gap-4">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="ค้นหา..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Select Dropdown */}
      <Select value={region} onValueChange={setRegion}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="เลือกเขต" />
        </SelectTrigger>
        <SelectContent>
          {regions.map((r) => (
            <SelectItem key={r.id} value={r.id}>
              {r.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </CardContent>
</Card>
```

---

## 7. Progress Bar with Status

```tsx
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>น้ำสูญเสีย</span>
    <span className={cn(
      'font-medium',
      status === 'critical' ? 'text-red-600' :
      status === 'warning' ? 'text-amber-600' :
      'text-emerald-600'
    )}>
      {formatPercent(percentage)}
    </span>
  </div>
  <Progress
    value={percentage}
    className={cn(
      'h-3',
      status === 'critical' ? '[&>div]:bg-red-500' :
      status === 'warning' ? '[&>div]:bg-amber-500' :
      '[&>div]:bg-emerald-500'
    )}
  />
</div>
```

---

## 8. Icon with Status Background

```tsx
// Standard icon container with status color
<div className={cn(
  'flex h-10 w-10 items-center justify-center rounded-lg',
  status === 'normal' ? 'bg-emerald-500' :
  status === 'warning' ? 'bg-amber-500' :
  'bg-red-500'
)}>
  <Icon className="h-5 w-5 text-white" />
</div>

// Icon on colored card with translucent background
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
  <Icon className="h-5 w-5 text-white" />
</div>
```

---

## 9. Empty State

```tsx
<div className="flex flex-col items-center justify-center py-12">
  <AlertTriangle className="h-12 w-12 text-amber-500" />
  <h2 className="mt-4 text-xl font-semibold">ไม่พบข้อมูล</h2>
  <p className="mt-2 text-muted-foreground">
    ไม่พบข้อมูลที่ต้องการ
  </p>
  <Button asChild className="mt-4">
    <Link href="/">กลับหน้าหลัก</Link>
  </Button>
</div>
```

---

## 10. Loading Skeleton

```tsx
// Card skeleton
<Card>
  <CardContent className="p-6">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-10 w-10 rounded-lg" />
    </div>
  </CardContent>
</Card>

// Table row skeleton
<div className="flex items-center gap-4">
  <Skeleton className="h-10 w-10 rounded-lg" />
  <div className="flex-1 space-y-2">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-3 w-1/4" />
  </div>
  <Skeleton className="h-6 w-16" />
</div>
```

---

## 11. Styling Guidelines

### Explicit White Backgrounds

For consistent light-mode styling, we use **explicit white backgrounds** instead of CSS variables for all components, especially portaled components (Select, Tooltip, Popover, Dialog).

```tsx
// ✅ Correct - explicit colors
className="bg-white text-slate-900 border-slate-200"

// ❌ Avoid - CSS variables can cause dark mode bleeding
className="bg-popover text-popover-foreground border"
```

### Component-Specific Overrides

| Component | Background | Text | Border |
|-----------|------------|------|--------|
| Card | `bg-white` | `text-slate-900` | `border-slate-200` |
| Select Trigger | `bg-white` | `text-slate-900` | `border-slate-300` |
| Select Content | `bg-white` | `text-slate-900` | `border-slate-200` |
| Select Item (hover) | `bg-slate-100` | `text-slate-900` | - |
| Tooltip | `bg-white` | `text-slate-900` | `border-slate-200` |
| Input | `bg-white` | `text-slate-900` | `border-slate-300` |

### Portaled Components

Radix UI portaled components (Select, Tooltip, Popover, Dialog) render outside the normal DOM hierarchy, which can cause theme inheritance issues. Always use explicit colors:

```tsx
// SelectContent
<SelectPrimitive.Content
  className="bg-white text-slate-900 border border-slate-200 shadow-lg ..."
>

// TooltipContent
<TooltipPrimitive.Content
  className="bg-white text-slate-900 border border-slate-200 shadow-md ..."
>
```
