# WARIS Design System - Overview

> ระบบออกแบบ UI/UX สำหรับ WARIS Dashboard
> Water Loss Intelligent Analysis and Reporting System

---

## Design Principles

### 1. Clarity First (ความชัดเจนเป็นอันดับแรก)
- High contrast colors for status indicators
- Clear visual hierarchy for data presentation
- Readable Thai fonts with proper spacing

### 2. Data-Driven (ขับเคลื่อนด้วยข้อมูล)
- KPI cards for quick insights
- Color-coded status at a glance
- Real-time updates and trends

### 3. Actionable (นำไปใช้งานได้)
- Clear call-to-action buttons
- Easy navigation to details
- Contextual actions where needed

### 4. Accessible (เข้าถึงได้)
- WCAG 2.1 compliant contrast ratios
- Screen reader friendly
- Keyboard navigation support

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [01-color-system.md](./01-color-system.md) | Color palette, status colors, accessibility |
| [02-components.md](./02-components.md) | UI component patterns and code examples |
| [03-ui-guidelines.md](./03-ui-guidelines.md) | Layout, typography, spacing, responsive design |

---

## Quick Reference

### Status Colors (High Contrast)

| Status | Background | Text | Use |
|--------|------------|------|-----|
| Normal | `bg-emerald-500` | `text-white` | ปกติ |
| Warning | `bg-amber-500` | `text-white` | เฝ้าระวัง |
| Critical | `bg-red-500` | `text-white` | วิกฤต |
| Info | `bg-blue-500` | `text-white` | ข้อมูล |

### Key Components

```tsx
// Status Badge
<Badge variant="success">ปกติ</Badge>
<Badge variant="warning">เฝ้าระวัง</Badge>
<Badge variant="critical">วิกฤต</Badge>

// Status Card
<Card className="bg-emerald-500 text-white border-0">
  <CardContent className="p-4">
    <p className="text-sm text-emerald-100">Label</p>
    <p className="text-2xl font-bold text-white">Value</p>
  </CardContent>
</Card>

// Icon with Status
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
  <Icon className="h-5 w-5 text-white" />
</div>
```

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 |
| UI Library | shadcn/ui |
| Styling | TailwindCSS 4 |
| Icons | Lucide React |
| Fonts | Noto Sans Thai, Inter |
| Theme | next-themes (light/dark) |

---

## File Structure

```
platform/apps/web/
├── app/
│   └── globals.css          # CSS variables, base styles
├── components/
│   ├── ui/                  # shadcn/ui components
│   │   ├── badge.tsx        # Status badges
│   │   ├── button.tsx       # Buttons
│   │   ├── card.tsx         # Cards
│   │   └── ...
│   ├── dashboard/           # Dashboard-specific components
│   │   ├── kpi-card.tsx     # KPI display
│   │   └── alert-list.tsx   # Alert list
│   └── layout/              # Layout components
│       ├── sidebar.tsx      # Navigation sidebar
│       └── header.tsx       # Top header
└── lib/
    ├── utils.ts             # Utility functions (cn)
    └── formatting.ts        # Number/date formatting
```

---

## Design Tokens

### CSS Variables (globals.css)

```css
:root {
  /* Colors */
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --primary: 221 83% 53%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 35%;
  --border: 214 32% 85%;

  /* Radius */
  --radius: 0.5rem;
}
```

### Tailwind Custom Classes

```css
/* Status utility classes */
.status-normal { @apply bg-emerald-500 text-white; }
.status-warning { @apply bg-amber-500 text-white; }
.status-critical { @apply bg-red-500 text-white; }
```

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-05 | 1.0.0 | Initial design system with high-contrast status colors |
