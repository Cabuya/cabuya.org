# Cabuya — Brand Assets & Palette (FINAL, delivered 2026-08-16)

> Asset: `cabuya-logo-and-palette.png` (primary logo, dark-mode variant, isologo,
> palette). The mark is a rope braided into a C — the brand thesis made visual:
> many fibres, one cordage. Wordmark: geometric sans, wide tracking, the A
> crossbar-less (echoes the strand).

## Palette (measured contrast, WCAG relative luminance)

| Token (proposed) | Name | Hex | Role |
|---|---|---|---|
| `--color-cabuya-forest` | Cabuya Forest | `#0B3D32` | Primary brand / text on light |
| `--color-cabuya-fique` | Fique Fiber | `#C79A4A` | Accent (the golden strand) |
| `--color-cabuya-night` | Cabuya Night | `#082A24` | Dark-mode ground |
| `--color-cabuya-ivory` | Natural Ivory | `#F6F3ED` | Light ground (soft) |
| `--color-cabuya-white` | Warm White | `#FAF9F6` | Light ground (page) |

## Measured contrast — the rules that follow from it

| Pair | Ratio | Verdict |
|---|---|---|
| Forest on White / Ivory | **11.54 / 10.97** | ✅ AAA — body text pair on light |
| White / Ivory on Night | **14.59 / 13.87** | ✅ AAA — body text pair on dark |
| Fique on Night | **5.96** | ✅ AA — accent may carry text **on dark only** |
| Fique on Forest | **4.72** | ✅ AA (normal text, barely) — ok for badges on forest |
| Fique on White / Ivory | **2.45 / 2.33** | ❌ FAILS AA and even large-text 3:1 — **never body/link text on light** |

**Rule (mirrors the CoragWeb accent lesson exactly):** Fique Fiber on light
grounds is for icons, decorative strands, large display type and the logo only.
Any *text* use of the accent on light needs a darkened variant — reserve the
token name `--color-cabuya-fique-strong` (to be derived in the website repo;
target ≥ 4.5:1 on `#FAF9F6`, i.e. roughly `#8a6a2e`-territory, final value
picked in the design pass with the measured test the CoragWeb repo already
uses).

## Usage notes for the website repo

- Declare all tokens once in `src/styles/global.css` `@theme` (CoragWeb
  discipline carries over: no token overrides in components, `/internal/ui/colors`
  page + declared≡shown unit test).
- Dark mode: Night ground + White/Ivory text + Fique accents (all pass).
- Light mode: White/Ivory ground + Forest text; Fique as decoration or
  `fique-strong` for text.
- Badge "Compatible con Cabuya 1.0": forest-on-ivory or ivory-on-forest; the
  fique strand as the graphic element, not the type color (on light).
- Favicon/isologo: the braided C works at small sizes in both single-color
  (forest on light, ivory on dark) and two-strand versions.
