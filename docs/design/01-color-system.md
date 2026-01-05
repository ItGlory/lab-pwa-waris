# WARIS Design System - Color System

> ระบบสี สำหรับ WARIS Dashboard

---

## 1. Brand Colors

### Primary Brand
```css
--primary: 221 83% 53%;        /* #2563eb - Blue 600 */
--primary-foreground: 0 0% 100%; /* White */
```

### Usage
- Primary buttons
- Links and interactive elements
- Focus rings
- Active navigation items

---

## 2. Semantic Status Colors

### Normal / Success (ปกติ)
| Token | Tailwind Class | Hex | Usage |
|-------|---------------|-----|-------|
| Background | `bg-emerald-500` | #10b981 | Status badges, cards |
| Text on dark | `text-white` | #ffffff | Text on colored bg |
| Text on light | `text-emerald-700` | #047857 | Text on white bg |
| Border | `border-emerald-500` | #10b981 | Borders |

### Warning / Caution (เฝ้าระวัง)
| Token | Tailwind Class | Hex | Usage |
|-------|---------------|-----|-------|
| Background | `bg-amber-500` | #f59e0b | Status badges, cards |
| Text on dark | `text-white` | #ffffff | Text on colored bg |
| Text on light | `text-amber-700` | #b45309 | Text on white bg |
| Border | `border-amber-500` | #f59e0b | Borders |

### Critical / Danger (วิกฤต)
| Token | Tailwind Class | Hex | Usage |
|-------|---------------|-----|-------|
| Background | `bg-red-500` | #ef4444 | Status badges, cards |
| Text on dark | `text-white` | #ffffff | Text on colored bg |
| Text on light | `text-red-700` | #b91c1c | Text on white bg |
| Border | `border-red-500` | #ef4444 | Borders |

### Info
| Token | Tailwind Class | Hex | Usage |
|-------|---------------|-----|-------|
| Background | `bg-blue-500` | #3b82f6 | Info badges, cards |
| Text on dark | `text-white` | #ffffff | Text on colored bg |
| Text on light | `text-blue-700` | #1d4ed8 | Text on white bg |
| Border | `border-blue-500` | #3b82f6 | Borders |

---

## 3. Alert Severity Colors

| Severity | Thai | Background | Icon |
|----------|------|------------|------|
| Critical | วิกฤต | `bg-red-500` | AlertCircle |
| High | สูง | `bg-orange-500` | AlertTriangle |
| Medium | ปานกลาง | `bg-amber-500` | AlertTriangle |
| Low | ต่ำ | `bg-blue-500` | Info |

---

## 4. Neutral Colors

### Light Mode
```css
--background: 0 0% 100%;           /* #ffffff */
--foreground: 222 47% 11%;         /* #0f172a - Slate 900 */
--muted: 210 40% 96%;              /* #f1f5f9 - Slate 100 */
--muted-foreground: 215 16% 35%;   /* #475569 - Slate 600 */
--border: 214 32% 85%;             /* #cbd5e1 - Slate 300 */
```

### Dark Mode
```css
--background: 224 71% 4%;          /* #020617 - Slate 950 */
--foreground: 213 31% 91%;         /* #e2e8f0 - Slate 200 */
--muted: 215 28% 17%;              /* #1e293b - Slate 800 */
--muted-foreground: 215 20% 65%;   /* #94a3b8 - Slate 400 */
--border: 215 28% 17%;             /* #1e293b - Slate 800 */
```

---

## 5. Chart Colors

For data visualizations (charts, graphs):

| Index | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| 1 | `#2563eb` (Blue) | `#3b82f6` | Primary data |
| 2 | `#16a34a` (Green) | `#22c55e` | Success/positive |
| 3 | `#f59e0b` (Amber) | `#fbbf24` | Warning/caution |
| 4 | `#ef4444` (Red) | `#f87171` | Critical/negative |
| 5 | `#8b5cf6` (Violet) | `#a78bfa` | Secondary data |

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
| Background | Foreground | Contrast |
|------------|------------|----------|
| `emerald-500` | `white` | 4.5:1 ✓ |
| `amber-500` | `white` | 3.9:1 ✓ (large text) |
| `red-500` | `white` | 4.6:1 ✓ |
| `blue-500` | `white` | 4.5:1 ✓ |
| `white` | `emerald-700` | 5.2:1 ✓ |
| `white` | `amber-700` | 4.5:1 ✓ |
| `white` | `red-700` | 5.9:1 ✓ |

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
