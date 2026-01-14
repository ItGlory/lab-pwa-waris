# WARIS Design System - Overview

> ระบบออกแบบ UI/UX สำหรับ WARIS Dashboard
> Water Loss Intelligent Analysis and Reporting System
> อิงตามอัตลักษณ์องค์กร กปภ. (PWA Corporate Identity)

---

## PWA Brand Foundation

WARIS follows the **Provincial Waterworks Authority (PWA)** corporate identity to ensure visual consistency with existing PWA systems like DMAMA2.

### Brand Colors at a Glance

| Color         | Hex       | Usage                           |
| ------------- | --------- | ------------------------------- |
| PWA Blue Deep | `#065BAA` | Navigation, headers, sidebars   |
| PWA Cyan      | `#00C2F3` | Primary buttons, links, actions |
| PWA Navy      | `#0D2E5C` | Dark backgrounds, sidebar       |
| PWA Gold      | `#D4A84B` | Accents, highlights             |

### Logo Assets

| File                  | Usage                |
| --------------------- | -------------------- |
| `pwa-logo-header.png` | Navigation headers   |
| `pwa-logo-large.png`  | Hero sections        |
| `pwa-logo-original.jpg` | Official documents |

See [brand-guidelines.md](./brand-guidelines.md) for complete PWA CI documentation.

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

### 5. PWA Brand Aligned (สอดคล้องกับ กปภ.)

- Consistent with DMAMA2 visual language
- Uses official PWA color palette
- Thai typography standards

---

## Documentation Index

| Document                                     | Description                                   |
| -------------------------------------------- | --------------------------------------------- |
| [brand-guidelines.md](./brand-guidelines.md) | PWA CI, logo usage, typography, brand colors  |
| [01-color-system.md](./01-color-system.md)   | Color palette, status colors, accessibility   |
| [02-components.md](./02-components.md)       | UI component patterns and code examples       |
| [03-ui-guidelines.md](./03-ui-guidelines.md) | Layout, typography, spacing, responsive design |

---

## Quick Reference

### PWA-Branded UI Elements

```tsx
// Header with PWA branding
<header className="bg-pwa-blue-deep text-white">
  <img src="/pwa-logo-header.png" alt="PWA" />
  <span className="text-pwa-cyan-light">WARIS</span>
</header>

// Primary button
<Button className="bg-pwa-cyan hover:bg-pwa-blue-deep text-white">
  ดำเนินการ
</Button>

// Sidebar navigation
<aside className="bg-pwa-navy text-white">
  <a className="hover:bg-pwa-blue-deep">แดชบอร์ด</a>
</aside>
```

### Status Colors (High Contrast)

| Status   | Background       | Text         | Thai        |
| -------- | ---------------- | ------------ | ----------- |
| Normal   | `bg-emerald-500` | `text-white` | ปกติ        |
| Warning  | `bg-amber-500`   | `text-white` | เฝ้าระวัง   |
| Critical | `bg-red-500`     | `text-white` | วิกฤต       |
| Info     | `bg-blue-500`    | `text-white` | ข้อมูล      |

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

| Category   | Technology                       |
| ---------- | -------------------------------- |
| Framework  | Next.js 16                       |
| UI Library | shadcn/ui                        |
| Styling    | TailwindCSS 4                    |
| Icons      | Lucide React                     |
| Fonts      | Sarabun, Prompt, Inter           |
| Theme      | next-themes (light/dark)         |

---

## File Structure

```
platform/apps/web/
├── app/
│   └── globals.css          # CSS variables, PWA colors, base styles
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
│       ├── sidebar.tsx      # Navigation sidebar (PWA Navy)
│       └── header.tsx       # Top header (PWA Blue Deep)
└── lib/
    ├── utils.ts             # Utility functions (cn)
    └── formatting.ts        # Number/date formatting (Thai locale)
```

---

## Design Tokens

### CSS Variables (globals.css)

```css
:root {
  /* PWA Brand Colors */
  --pwa-blue: #1E4D8C;
  --pwa-cyan: #00C2F3;
  --pwa-blue-deep: #065BAA;
  --pwa-navy: #0D2E5C;
  --pwa-gold: #D4A84B;
  --pwa-cyan-light: #ABE1FA;

  /* Application Colors */
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --primary: 209 94% 35%;        /* PWA Blue Deep */
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 35%;
  --border: 214 32% 85%;

  /* Radius */
  --radius: 0.5rem;
}
```

### Tailwind Custom Classes

```css
/* PWA Brand utility classes */
.pwa-header { @apply bg-pwa-blue-deep text-white; }
.pwa-sidebar { @apply bg-pwa-navy text-white; }
.pwa-button { @apply bg-pwa-cyan hover:bg-pwa-blue-deep text-white; }

/* Status utility classes */
.status-normal { @apply bg-emerald-500 text-white; }
.status-warning { @apply bg-amber-500 text-white; }
.status-critical { @apply bg-red-500 text-white; }
```

---

## Change Log

| Date       | Version | Changes                                                  |
| ---------- | ------- | -------------------------------------------------------- |
| 2026-01-15 | 1.1.0   | Added PWA CI colors, updated brand guidelines            |
| 2026-01-05 | 1.0.0   | Initial design system with high-contrast status colors   |
