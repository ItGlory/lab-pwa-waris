# PWA Brand Guidelines

> Provincial Waterworks Authority (การประปาส่วนภูมิภาค)

## Organization

| Attribute | Value |
|-----------|-------|
| Thai Name | การประปาส่วนภูมิภาค (กปภ.) |
| English Name | Provincial Waterworks Authority (PWA) |
| Website | https://www.pwa.co.th |
| Hotline | 1662 |

## Taglines

- **English:** "Determined – Confident – For the Public"
- **Thai:** "มุ่ง - มั่น - เพื่อปวงชน - สู่ความยั่งยืน"

## Logo

The PWA emblem features **Phra Mae Thorani** (พระแม่ธรณี), the Earth Goddess, wringing water from her hair - symbolizing pure water provision.

### Emblem (Seal)

![PWA Emblem](./assets/pwa-logo-original.jpg)

### Header Logo

![PWA Header](./assets/pwa-logo-header.png)

### Logo Files

| File | Dimensions | Usage |
|------|------------|-------|
| `pwa-logo-original.jpg` | 600x600 | Emblem, documents, print |
| `pwa-logo-header.png` | 294x70 | Navigation, headers |
| `pwa-logo-large.png` | 571x136 | Hero sections, banners |
| `pwa-icon.jpg` | 50x55 | Favicon, app icon |

## Typography

### Primary Fonts

| Font | Usage | Source |
|------|-------|--------|
| **TH Sarabun New** | Official documents (Thai Gov standard) | [SIPA](https://www.sipa.or.th) |
| **Sarabun** | Web (Thai) | [Google Fonts](https://fonts.google.com/specimen/Sarabun) |
| **Prompt** | Web (Thai headings) | [Google Fonts](https://fonts.google.com/specimen/Prompt) |
| **Inter** | Web (English/Numbers) | [Google Fonts](https://fonts.google.com/specimen/Inter) |

### Font Stack

```css
/* Thai Content */
font-family: 'Sarabun', 'TH Sarabun New', Tahoma, sans-serif;

/* Headings */
font-family: 'Prompt', 'Sarabun', sans-serif;

/* English/Numbers */
font-family: 'Inter', 'Sarabun', sans-serif;

/* System Fallback */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, sans-serif;
```

### Font Sizes

| Scale | Size | Usage |
|-------|------|-------|
| xs | 0.75rem (12px) | Captions |
| sm | 0.875rem (14px) | Small text |
| base | 1rem (16px) | Body |
| lg | 1.125rem (18px) | Lead text |
| xl | 1.25rem (20px) | H4 |
| 2xl | 1.5rem (24px) | H3 |
| 3xl | 1.875rem (30px) | H2 |
| 4xl | 2.25rem (36px) | H1 |

## Color Palette

### Primary Colors (from Logo)

| Name | Hex | RGB | CSS Variable |
|------|-----|-----|--------------|
| Royal Blue | `#1E4D8C` | 30, 77, 140 | `--pwa-blue` |
| Gold | `#D4A84B` | 212, 168, 75 | `--pwa-gold` |
| Sky Blue | `#87CEEB` | 135, 206, 235 | `--pwa-sky` |

### Secondary Colors

| Name | Hex | RGB | CSS Variable |
|------|-----|-----|--------------|
| Navy Dark | `#0D2E5C` | 13, 46, 92 | `--pwa-navy` |
| Gold Dark | `#B8922F` | 184, 146, 47 | `--pwa-gold-dark` |
| Emerald | `#2E8B57` | 46, 139, 87 | `--pwa-green` |

### UI Colors

| Name | Hex | RGB | CSS Variable |
|------|-----|-----|--------------|
| Cyan Bright | `#00C2F3` | 0, 194, 243 | `--pwa-cyan` |
| Blue Deep | `#065BAA` | 6, 91, 170 | `--pwa-blue-deep` |
| Cyan Light | `#ABE1FA` | 171, 225, 250 | `--pwa-cyan-light` |
| Dark Gray | `#4D4D4D` | 77, 77, 77 | `--pwa-gray` |
| White | `#FFFFFF` | 255, 255, 255 | `--pwa-white` |

## CSS Variables

```css
:root {
  /* Primary (Logo) */
  --pwa-blue: #1E4D8C;
  --pwa-gold: #D4A84B;
  --pwa-sky: #87CEEB;

  /* Secondary */
  --pwa-navy: #0D2E5C;
  --pwa-gold-dark: #B8922F;
  --pwa-green: #2E8B57;

  /* UI */
  --pwa-cyan: #00C2F3;
  --pwa-blue-deep: #065BAA;
  --pwa-cyan-light: #ABE1FA;
  --pwa-gray: #4D4D4D;
  --pwa-white: #FFFFFF;

  /* Typography */
  --font-thai: 'Sarabun', 'TH Sarabun New', Tahoma, sans-serif;
  --font-heading: 'Prompt', 'Sarabun', sans-serif;
  --font-english: 'Inter', 'Sarabun', sans-serif;
}
```

## Tailwind Config

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
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
          gray: '#4D4D4D',
        }
      },
      fontFamily: {
        thai: ['Sarabun', 'TH Sarabun New', 'Tahoma', 'sans-serif'],
        heading: ['Prompt', 'Sarabun', 'sans-serif'],
        english: ['Inter', 'Sarabun', 'sans-serif'],
      }
    }
  }
}
```

## Accessibility

| Standard | Level |
|----------|-------|
| WCAG | 2.0 AAA |
| HTML | HTML5 Valid |
| Languages | Thai, English |

---

*Source: https://www.pwa.co.th*
