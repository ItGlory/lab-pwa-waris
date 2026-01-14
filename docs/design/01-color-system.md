# WARIS Design System - Color System

> ระบบสี สำหรับ WARIS Dashboard
> อิงตามอัตลักษณ์องค์กร กปภ. (PWA Corporate Identity)

---

## 1. PWA Brand Colors

WARIS uses PWA's official corporate identity colors as the foundation.

### Primary Brand (จากตราสัญลักษณ์ กปภ.)

| Color        | Hex       | HSL          | Usage                        |
| ------------ | --------- | ------------ | ---------------------------- |
| Royal Blue   | `#1E4D8C` | 214 65% 33%  | Headers, official elements   |
| Cyan Primary | `#00C2F3` | 193 100% 48% | Primary buttons, links, CTAs |
| Blue Deep    | `#065BAA` | 209 94% 35%  | Navigation, sidebars         |
| Gold         | `#D4A84B` | 43 60% 56%   | Accents, highlights          |

### CSS Variables

```css
/* PWA Brand - Primary */
--pwa-blue: #1e4d8c;
--pwa-cyan: #00c2f3;
--pwa-blue-deep: #065baa;
--pwa-gold: #d4a84b;

/* Application Primary (based on PWA Cyan) */
--primary: 209 94% 35%; /* #065BAA - Blue Deep */
--primary-foreground: 0 0% 100%; /* White */
```

### Usage

- **Primary buttons**: `--pwa-cyan` with hover `--pwa-blue-deep`
- **Navigation/Headers**: `--pwa-blue-deep`
- **Links**: `--pwa-cyan`
- **Active states**: `--pwa-cyan`
- **Accents/Highlights**: `--pwa-gold`

---

## 2. Semantic Status Colors

### Normal / Success (ปกติ)

| Token         | Tailwind Class       | Hex     | Usage                |
| ------------- | -------------------- | ------- | -------------------- |
| Background    | `bg-emerald-500`     | #10b981 | Status badges, cards |
| Text on dark  | `text-white`         | #ffffff | Text on colored bg   |
| Text on light | `text-emerald-700`   | #047857 | Text on white bg     |
| Border        | `border-emerald-500` | #10b981 | Borders              |

### Warning / Caution (เฝ้าระวัง)

| Token         | Tailwind Class     | Hex     | Usage                |
| ------------- | ------------------ | ------- | -------------------- |
| Background    | `bg-amber-500`     | #f59e0b | Status badges, cards |
| Text on dark  | `text-white`       | #ffffff | Text on colored bg   |
| Text on light | `text-amber-700`   | #b45309 | Text on white bg     |
| Border        | `border-amber-500` | #f59e0b | Borders              |

### Critical / Danger (วิกฤต)

| Token         | Tailwind Class   | Hex     | Usage                |
| ------------- | ---------------- | ------- | -------------------- |
| Background    | `bg-red-500`     | #ef4444 | Status badges, cards |
| Text on dark  | `text-white`     | #ffffff | Text on colored bg   |
| Text on light | `text-red-700`   | #b91c1c | Text on white bg     |
| Border        | `border-red-500` | #ef4444 | Borders              |

### Info

| Token         | Tailwind Class    | Hex     | Usage              |
| ------------- | ----------------- | ------- | ------------------ |
| Background    | `bg-blue-500`     | #3b82f6 | Info badges, cards |
| Text on dark  | `text-white`      | #ffffff | Text on colored bg |
| Text on light | `text-blue-700`   | #1d4ed8 | Text on white bg   |
| Border        | `border-blue-500` | #3b82f6 | Borders            |

---

## 3. Alert Severity Colors

| Severity | Thai    | Background      | Icon          |
| -------- | ------- | --------------- | ------------- |
| Critical | วิกฤต   | `bg-red-500`    | AlertCircle   |
| High     | สูง     | `bg-orange-500` | AlertTriangle |
| Medium   | ปานกลาง | `bg-amber-500`  | AlertTriangle |
| Low      | ต่ำ     | `bg-blue-500`   | Info          |

---

## 4. Neutral Colors

### Light Mode

```css
--background: 0 0% 100%; /* #ffffff */
--foreground: 222 47% 11%; /* #0f172a - Slate 900 */
--muted: 210 40% 96%; /* #f1f5f9 - Slate 100 */
--muted-foreground: 215 16% 35%; /* #475569 - Slate 600 */
--border: 214 32% 85%; /* #cbd5e1 - Slate 300 */
```

### Dark Mode

```css
--background: 224 71% 4%; /* #020617 - Slate 950 */
--foreground: 213 31% 91%; /* #e2e8f0 - Slate 200 */
--muted: 215 28% 17%; /* #1e293b - Slate 800 */
--muted-foreground: 215 20% 65%; /* #94a3b8 - Slate 400 */
--border: 215 28% 17%; /* #1e293b - Slate 800 */
```

---

## 5. Chart Colors

For data visualizations (charts, graphs):

| Index | Light Mode         | Dark Mode | Usage             |
| ----- | ------------------ | --------- | ----------------- |
| 1     | `#2563eb` (Blue)   | `#3b82f6` | Primary data      |
| 2     | `#16a34a` (Green)  | `#22c55e` | Success/positive  |
| 3     | `#f59e0b` (Amber)  | `#fbbf24` | Warning/caution   |
| 4     | `#ef4444` (Red)    | `#f87171` | Critical/negative |
| 5     | `#8b5cf6` (Violet) | `#a78bfa` | Secondary data    |

---

## 6. Usage Guidelines

### Status Badges

Always use solid backgrounds with white text for maximum contrast:

```tsx
// Good - High contrast
<Badge variant="success">Normal</Badge>  // bg-emerald-500 text-white
<Badge variant="warning">Warning</Badge> // bg-amber-500 text-white
<Badge variant="critical">Critical</Badge> // bg-red-500 text-white

// Avoid - Low contrast
<Badge className="bg-green-100 text-green-600">Normal</Badge>
```

### Status Cards

For cards displaying status information:

```tsx
// Full colored card (recommended)
<Card className="bg-emerald-500 text-white border-0">
  <p className="text-emerald-100">Label</p>
  <p className="text-2xl font-bold text-white">Value</p>
</Card>

// Icon with status color
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
  <Icon className="h-5 w-5 text-white" />
</div>
```

### Text on Colored Backgrounds

- Always use white (`text-white`) for primary text
- Use `{color}-100` (e.g., `text-emerald-100`) for secondary/label text
- Never use dark text on colored backgrounds

### Text on White Backgrounds

- Use `{color}-700` variants for status text (e.g., `text-emerald-700`)
- Use `text-foreground` for primary text
- Use `text-muted-foreground` for secondary text

---

## 7. Accessibility Requirements

### Contrast Ratios (WCAG 2.1)

- Normal text: Minimum 4.5:1 contrast ratio
- Large text (18pt+ or 14pt bold): Minimum 3:1 contrast ratio
- UI components: Minimum 3:1 contrast ratio

### Color Combinations That Pass

| Background    | Foreground    | Contrast             |
| ------------- | ------------- | -------------------- |
| `emerald-500` | `white`       | 4.5:1 ✓              |
| `amber-500`   | `white`       | 3.9:1 ✓ (large text) |
| `red-500`     | `white`       | 4.6:1 ✓              |
| `blue-500`    | `white`       | 4.5:1 ✓              |
| `white`       | `emerald-700` | 5.2:1 ✓              |
| `white`       | `amber-700`   | 4.5:1 ✓              |
| `white`       | `red-700`     | 5.9:1 ✓              |

---

## 8. Thai Language Considerations

- Use Noto Sans Thai as primary font
- Ensure sufficient line-height (1.5+) for Thai characters
- Numbers should use tabular figures for alignment

```css
.thai-number {
  font-feature-settings: "tnum";
}
```

---

## 9. PWA Brand Integration

### Complete Color Palette Reference

```css
:root {
  /* ============================== */
  /* PWA Corporate Identity Colors  */
  /* ============================== */

  /* Primary Brand (from Official Logo) */
  --pwa-blue: #1E4D8C;          /* Royal blue - emblem border */
  --pwa-gold: #D4A84B;          /* Gold - Thai patterns */
  --pwa-sky: #87CEEB;           /* Sky blue - emblem background */

  /* Secondary Brand */
  --pwa-navy: #0D2E5C;          /* Navy - dark elements */
  --pwa-gold-dark: #B8922F;     /* Dark gold - shadows */
  --pwa-green: #2E8B57;         /* Water green - environmental */

  /* Digital/UI Colors (DMAMA2 System) */
  --pwa-cyan: #00C2F3;          /* Cyan - primary actions */
  --pwa-blue-deep: #065BAA;     /* Deep blue - navigation */
  --pwa-cyan-light: #ABE1FA;    /* Light cyan - backgrounds */
  --pwa-header: #5CB3E8;        /* Header blue - logo text */

  /* Neutrals */
  --pwa-gray: #4D4D4D;          /* Dark gray - body text */
  --pwa-gray-light: #F5F5F5;    /* Light gray - backgrounds */
  --pwa-white: #FFFFFF;         /* White */

  /* ============================== */
  /* WARIS Application Colors       */
  /* ============================== */

  /* Primary (mapped from PWA) */
  --primary: #065BAA;           /* Blue Deep for main actions */
  --primary-hover: #1E4D8C;     /* Royal Blue for hover */
  --primary-foreground: #FFFFFF;

  /* Accent */
  --accent: #00C2F3;            /* Cyan for highlights */
  --accent-foreground: #FFFFFF;

  /* Status Colors (high contrast) */
  --status-normal: #10b981;     /* Emerald 500 */
  --status-warning: #f59e0b;    /* Amber 500 */
  --status-critical: #ef4444;   /* Red 500 */
  --status-info: #3b82f6;       /* Blue 500 */
}
```

### Tailwind Integration

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // PWA Brand Colors
        pwa: {
          blue: '#1E4D8C',
          gold: '#D4A84B',
          sky: '#87CEEB',
          navy: '#0D2E5C',
          'gold-dark': '#B8922F',
          green: '#2E8B57',
          cyan: '#00C2F3',
          'blue-deep': '#065BAA',
          'cyan-light': '#ABE1FA',
          header: '#5CB3E8',
          gray: '#4D4D4D',
          'gray-light': '#F5F5F5',
        },
        // Status Colors (kept for backward compatibility)
        status: {
          normal: '#10b981',
          warning: '#f59e0b',
          critical: '#ef4444',
          info: '#3b82f6',
        }
      }
    }
  }
}
```

### Usage Examples

```tsx
// Navigation header with PWA branding
<header className="bg-pwa-blue-deep text-white">
  <nav className="flex items-center px-6 py-4">
    <img src="/pwa-logo-header.png" alt="PWA" />
    <span className="ml-4 text-pwa-cyan-light">WARIS Dashboard</span>
  </nav>
</header>

// Primary button with PWA colors
<Button className="bg-pwa-cyan hover:bg-pwa-blue-deep text-white">
  ดำเนินการ
</Button>

// Status card (still uses high-contrast status colors)
<Card className="bg-status-normal text-white">
  <span className="text-emerald-100">สถานะ</span>
  <span className="text-2xl font-bold">ปกติ</span>
</Card>

// Sidebar with PWA navy
<aside className="bg-pwa-navy text-white w-64">
  <a className="block px-6 py-3 hover:bg-pwa-blue-deep">
    แดชบอร์ด
  </a>
</aside>
```

---

## 10. Color Reference Card

### Quick Reference

| Purpose         | Color     | Hex       | Tailwind           |
| --------------- | --------- | --------- | ------------------ |
| Primary Action  | Cyan      | `#00C2F3` | `bg-pwa-cyan`      |
| Navigation      | Blue Deep | `#065BAA` | `bg-pwa-blue-deep` |
| Sidebar         | Navy      | `#0D2E5C` | `bg-pwa-navy`      |
| Accent          | Gold      | `#D4A84B` | `bg-pwa-gold`      |
| Normal Status   | Emerald   | `#10b981` | `bg-emerald-500`   |
| Warning Status  | Amber     | `#f59e0b` | `bg-amber-500`     |
| Critical Status | Red       | `#ef4444` | `bg-red-500`       |
| Body Text       | Gray      | `#4D4D4D` | `text-pwa-gray`    |

---

*See [brand-guidelines.md](./brand-guidelines.md) for complete PWA CI documentation.*
