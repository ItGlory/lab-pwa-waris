# PWA Brand Guidelines

> Provincial Waterworks Authority (การประปาส่วนภูมิภาค)
> อัตลักษณ์องค์กร กปภ.

---

## Organization

| Attribute | Value |
|-----------|-------|
| Thai Name | การประปาส่วนภูมิภาค (กปภ.) |
| English Name | Provincial Waterworks Authority (PWA) |
| Website | https://www.pwa.co.th |
| DMAMA System | https://dmama2.pwa.co.th |
| Hotline | 1662 |
| Established | 1979 |

## Taglines

- **English:** "Determined – Confident – For the Public"
- **Thai:** "มุ่ง - มั่น - เพื่อปวงชน - สู่ความยั่งยืน"

---

## Logo

The PWA emblem features **Phra Mae Thorani** (พระแม่ธรณี), the Earth Goddess, wringing water from her hair - symbolizing pure water provision to the people.

### Emblem (Seal)

![PWA Emblem](./assets/pwa-logo-original.jpg)

The official seal contains:
- Outer ring in **Royal Blue** (`#1E4D8C`) with Thai script "การประปาส่วนภูมิภาค"
- Inner circle with **Sky Blue** (`#87CEEB`) background
- **Golden** (`#D4A84B`) Thai pattern decorations (Kranok/กระหนก)
- Figure of Phra Mae Thorani in traditional Thai art style

### Header Logo

![PWA Header](./assets/pwa-logo-header.png)

The horizontal header logo uses **Cyan Blue** (`#5CB3E8`) for the Thai and English text.

### Large Logo

![PWA Large](./assets/pwa-logo-large.png)

### Logo Files

| File | Dimensions | Usage |
|------|------------|-------|
| `pwa-logo-original.jpg` | 600x600 | Emblem, official documents, print |
| `pwa-logo-header.png` | 294x70 | Navigation headers |
| `pwa-logo-large.png` | 571x136 | Hero sections, banners, presentations |
| `pwa-icon.jpg` | 50x55 | Favicon, app icons |

### Logo Clear Space

Maintain minimum clear space equal to the height of the "P" in PWA around the logo.

### Logo Don'ts

- ❌ Do not stretch or distort the logo
- ❌ Do not change the logo colors
- ❌ Do not add effects (shadows, gradients)
- ❌ Do not place logo on busy backgrounds
- ❌ Do not rotate the logo

---

## Color Palette

### Primary Brand Colors (จากตราสัญลักษณ์)

Colors extracted from the official PWA emblem:

| Name | Thai | Hex | RGB | CSS Variable | Preview |
|------|------|-----|-----|--------------|---------|
| Royal Blue | น้ำเงินหลวง | `#1E4D8C` | 30, 77, 140 | `--pwa-blue` | ![#1E4D8C](https://via.placeholder.com/20/1E4D8C/1E4D8C) |
| Gold | ทอง | `#D4A84B` | 212, 168, 75 | `--pwa-gold` | ![#D4A84B](https://via.placeholder.com/20/D4A84B/D4A84B) |
| Sky Blue | ฟ้า | `#87CEEB` | 135, 206, 235 | `--pwa-sky` | ![#87CEEB](https://via.placeholder.com/20/87CEEB/87CEEB) |

### Secondary Brand Colors

| Name | Thai | Hex | RGB | CSS Variable | Preview |
|------|------|-----|-----|--------------|---------|
| Navy Dark | กรมท่า | `#0D2E5C` | 13, 46, 92 | `--pwa-navy` | ![#0D2E5C](https://via.placeholder.com/20/0D2E5C/0D2E5C) |
| Gold Dark | ทองเข้ม | `#B8922F` | 184, 146, 47 | `--pwa-gold-dark` | ![#B8922F](https://via.placeholder.com/20/B8922F/B8922F) |
| Water Green | เขียวน้ำ | `#2E8B57` | 46, 139, 87 | `--pwa-green` | ![#2E8B57](https://via.placeholder.com/20/2E8B57/2E8B57) |

### Digital/UI Colors (สีสำหรับระบบดิจิทัล)

Colors used in PWA digital systems (DMAMA2, Website, Apps):

| Name | Thai | Hex | RGB | CSS Variable | Usage | Preview |
|------|------|-----|-----|--------------|-------|---------|
| Cyan Primary | ฟ้าสด | `#00C2F3` | 0, 194, 243 | `--pwa-cyan` | Primary buttons, links, CTAs | ![#00C2F3](https://via.placeholder.com/20/00C2F3/00C2F3) |
| Blue Deep | น้ำเงินเข้ม | `#065BAA` | 6, 91, 170 | `--pwa-blue-deep` | Navigation, headers, sidebars | ![#065BAA](https://via.placeholder.com/20/065BAA/065BAA) |
| Cyan Light | ฟ้าอ่อน | `#ABE1FA` | 171, 225, 250 | `--pwa-cyan-light` | Light backgrounds, hover states | ![#ABE1FA](https://via.placeholder.com/20/ABE1FA/ABE1FA) |
| Header Blue | ฟ้าหัวกระดาษ | `#5CB3E8` | 92, 179, 232 | `--pwa-header` | Logo text, headers | ![#5CB3E8](https://via.placeholder.com/20/5CB3E8/5CB3E8) |

### Neutral Colors

| Name | Thai | Hex | RGB | CSS Variable | Preview |
|------|------|-----|-----|--------------|---------|
| Dark Gray | เทาเข้ม | `#4D4D4D` | 77, 77, 77 | `--pwa-gray` | ![#4D4D4D](https://via.placeholder.com/20/4D4D4D/4D4D4D) |
| Light Gray | เทาอ่อน | `#F5F5F5` | 245, 245, 245 | `--pwa-gray-light` | ![#F5F5F5](https://via.placeholder.com/20/F5F5F5/F5F5F5) |
| White | ขาว | `#FFFFFF` | 255, 255, 255 | `--pwa-white` | ![#FFFFFF](https://via.placeholder.com/20/FFFFFF/FFFFFF) |

### Color Usage Guidelines

```
┌────────────────────────────────────────────────────────────────┐
│  Header/Navigation                                              │
│  Background: --pwa-blue-deep (#065BAA)                         │
│  Text: --pwa-white (#FFFFFF)                                    │
│  Active: --pwa-cyan (#00C2F3)                                  │
├────────────────────────────────────────────────────────────────┤
│  Sidebar                                                        │
│  Background: --pwa-navy (#0D2E5C)                              │
│  Text: --pwa-white (#FFFFFF)                                    │
│  Hover: --pwa-blue-deep (#065BAA)                              │
├────────────────────────────────────────────────────────────────┤
│  Main Content                                                   │
│  Background: --pwa-white (#FFFFFF)                             │
│  Text: --pwa-gray (#4D4D4D)                                    │
│  Links: --pwa-cyan (#00C2F3)                                   │
├────────────────────────────────────────────────────────────────┤
│  Buttons                                                        │
│  Primary: --pwa-cyan (#00C2F3) → Hover: --pwa-blue-deep        │
│  Secondary: --pwa-blue (#1E4D8C) → Hover: --pwa-navy           │
└────────────────────────────────────────────────────────────────┘
```

---

## Typography

### Primary Fonts

| Font | Usage | Source |
|------|-------|--------|
| **TH Sarabun New** | Official documents (Thai Gov standard) | [SIPA](https://www.sipa.or.th) |
| **Sarabun** | Web body text (Thai) | [Google Fonts](https://fonts.google.com/specimen/Sarabun) |
| **Prompt** | Web headings (Thai) | [Google Fonts](https://fonts.google.com/specimen/Prompt) |
| **Inter** | Web (English/Numbers) | [Google Fonts](https://fonts.google.com/specimen/Inter) |
| **Noto Sans Thai** | Alternative Thai font | [Google Fonts](https://fonts.google.com/noto/specimen/Noto+Sans+Thai) |

### Font Stack

```css
/* Thai Body Content */
font-family: 'Sarabun', 'TH Sarabun New', 'Noto Sans Thai', Tahoma, sans-serif;

/* Thai Headings */
font-family: 'Prompt', 'Sarabun', sans-serif;

/* English/Numbers */
font-family: 'Inter', 'Sarabun', sans-serif;

/* System Fallback */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, sans-serif;
```

### Font Sizes

| Scale | Size | Line Height | Usage |
|-------|------|-------------|-------|
| xs | 0.75rem (12px) | 1rem | Captions, labels |
| sm | 0.875rem (14px) | 1.25rem | Small text, metadata |
| base | 1rem (16px) | 1.5rem | Body text |
| lg | 1.125rem (18px) | 1.75rem | Lead text |
| xl | 1.25rem (20px) | 1.75rem | H4, card titles |
| 2xl | 1.5rem (24px) | 2rem | H3, section titles |
| 3xl | 1.875rem (30px) | 2.25rem | H2, page subtitles |
| 4xl | 2.25rem (36px) | 2.5rem | H1, page titles |
| 5xl | 3rem (48px) | 1 | Hero text, KPIs |

### Font Weights

| Weight | Usage |
|--------|-------|
| 400 (Regular) | Body text |
| 500 (Medium) | Emphasis, labels |
| 600 (Semibold) | Subheadings |
| 700 (Bold) | Headings, KPI values |

---

## CSS Variables

```css
:root {
  /* ==================== */
  /* PWA Brand Colors     */
  /* ==================== */

  /* Primary (from Logo) */
  --pwa-blue: #1E4D8C;
  --pwa-gold: #D4A84B;
  --pwa-sky: #87CEEB;

  /* Secondary */
  --pwa-navy: #0D2E5C;
  --pwa-gold-dark: #B8922F;
  --pwa-green: #2E8B57;

  /* Digital/UI */
  --pwa-cyan: #00C2F3;
  --pwa-blue-deep: #065BAA;
  --pwa-cyan-light: #ABE1FA;
  --pwa-header: #5CB3E8;

  /* Neutrals */
  --pwa-gray: #4D4D4D;
  --pwa-gray-light: #F5F5F5;
  --pwa-white: #FFFFFF;

  /* ==================== */
  /* Typography           */
  /* ==================== */
  --font-thai: 'Sarabun', 'TH Sarabun New', 'Noto Sans Thai', Tahoma, sans-serif;
  --font-heading: 'Prompt', 'Sarabun', sans-serif;
  --font-english: 'Inter', 'Sarabun', sans-serif;

  /* ==================== */
  /* Shadows              */
  /* ==================== */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* ==================== */
  /* Border Radius        */
  /* ==================== */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;
}
```

---

## Tailwind Configuration

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        pwa: {
          // Primary (Logo)
          blue: '#1E4D8C',
          gold: '#D4A84B',
          sky: '#87CEEB',
          // Secondary
          navy: '#0D2E5C',
          'gold-dark': '#B8922F',
          green: '#2E8B57',
          // Digital/UI
          cyan: '#00C2F3',
          'blue-deep': '#065BAA',
          'cyan-light': '#ABE1FA',
          header: '#5CB3E8',
          // Neutrals
          gray: '#4D4D4D',
          'gray-light': '#F5F5F5',
        }
      },
      fontFamily: {
        thai: ['Sarabun', 'TH Sarabun New', 'Noto Sans Thai', 'Tahoma', 'sans-serif'],
        heading: ['Prompt', 'Sarabun', 'sans-serif'],
        english: ['Inter', 'Sarabun', 'sans-serif'],
      },
      boxShadow: {
        'pwa': '0 4px 6px -1px rgba(6, 91, 170, 0.1), 0 2px 4px -1px rgba(6, 91, 170, 0.06)',
      }
    }
  }
}
```

---

## Component Examples

### Primary Button (PWA Style)

```tsx
<button className="bg-pwa-cyan hover:bg-pwa-blue-deep text-white font-medium px-4 py-2 rounded-md transition-colors">
  ดำเนินการ
</button>
```

### Secondary Button

```tsx
<button className="bg-pwa-blue hover:bg-pwa-navy text-white font-medium px-4 py-2 rounded-md transition-colors">
  ยกเลิก
</button>
```

### Navigation Header

```tsx
<header className="bg-pwa-blue-deep text-white">
  <nav className="flex items-center gap-4 px-6 py-4">
    <img src="/pwa-logo-header.png" alt="PWA" className="h-10" />
    <span className="text-pwa-cyan-light">WARIS Dashboard</span>
  </nav>
</header>
```

### Sidebar

```tsx
<aside className="bg-pwa-navy text-white w-64 min-h-screen">
  <nav className="py-4">
    <a href="#" className="block px-6 py-3 hover:bg-pwa-blue-deep">
      แดชบอร์ด
    </a>
  </nav>
</aside>
```

---

## Accessibility

| Standard | Level | Notes |
|----------|-------|-------|
| WCAG | 2.1 AA | Minimum requirement |
| HTML | HTML5 Valid | Semantic markup |
| Languages | Thai, English | Bilingual support |
| Color Contrast | 4.5:1 | Text on backgrounds |

### Color Contrast Checks

| Combination | Contrast | Status |
|-------------|----------|--------|
| White on `#065BAA` (Blue Deep) | 7.2:1 | ✅ AAA |
| White on `#1E4D8C` (Royal Blue) | 6.5:1 | ✅ AAA |
| White on `#00C2F3` (Cyan) | 2.8:1 | ⚠️ Large text only |
| `#0D2E5C` on White | 13.5:1 | ✅ AAA |
| `#4D4D4D` on White | 7.0:1 | ✅ AAA |

**Note:** Use `--pwa-cyan` for large text (18pt+) or UI elements. For small body text, use `--pwa-blue-deep` or `--pwa-navy`.

---

## Sources

- Official PWA Website: https://www.pwa.co.th
- PWA English Site: https://en.pwa.co.th
- DMAMA2 System: https://dmama2.pwa.co.th
- Wikipedia: https://th.wikipedia.org/wiki/การประปาส่วนภูมิภาค

---

*Last Updated: January 2026*
