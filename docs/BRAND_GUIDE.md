# Corag — Brand Guide

> **Canonical brand reference for `cabuya.org`.** Read this before touching
> anything that carries the identity: logo, color, type, voice, imagery.
>
> - **This file** owns *identity and brand rules*.
> - **[`DESIGN.md`](./DESIGN.md)** owns the *implementation contract* — exact
>   token names, generated utility classes, component patterns.
> - **[`ACCESSIBILITY.md`](./ACCESSIBILITY.md)** owns *WCAG procedure*.
>
> **Source of truth:** the official `Manual de Identidad Visual` (23 pp),
> preserved at [`assets/brand/`](../assets/brand/). Where this guide and the
> manual disagree, the manual wins — and this guide is wrong and must be fixed.

---

## 1. What Corag is

**Corag is *el ecosistema de impacto social*.**

> **Misión** — Conectar a fundaciones, gobiernos, emprendedores y personas a
> través de una plataforma digital transparente y creativa, que incentive la
> solidaridad mediante experiencias dinámicas, accesibles y con impacto real en
> las comunidades.

> **Visión** — Convertirse en la plataforma global líder en innovación social,
> donde donar, servir y transformar vidas sea una experiencia divertida,
> confiable y profundamente humana.

Corag exists because of a specific, ordinary failure: **many people want to help
and cannot find a trustworthy, close, meaningful way to do it.** Not a shortage
of generosity — a shortage of connection.

### The product hierarchy — get this right or the copy goes wrong

```
Corag — el ecosistema de impacto social          ← this website, cabuya.org
   └── Ayuda Directa — producto insignia         → ayuda.cabuya.org
          └── Emergencia activa: Eje Cafetero
```

`cabuya.org` is the **front door**: what Corag is, how the model works, why it can
be trusted, how to integrate with it. Every transactional action — publishing a
need, offering help, contributing, tracking a contribution, applying as a leader
— happens in the **app**, and we hand people over to it.

Writing about Corag as if it *were* Ayuda Directa is the most common mistake
available here. Ayuda Directa is one thing Corag does.

### Values

**Colaboración · Empatía · Confianza · Amor · Innovación social · Transparencia**

---

## 2. The mark

The wordmark is lowercase **corag**, where the **`o` is a heart**.

> *"El logo de CORAG está diseñado para transmitir **coraje, innovación y
> amor**, tres pilares fundamentales en la relación con entidades y grupos
> sociales."* — Manual, p. 10

The name comes from **coraje**. The heart carries **amor**. Say this on
`/sobre-corag` — it is the most human fact about the identity.

### Files

Masters live in [`assets/brand/`](../assets/brand/) (originals, never edited).
Everything shipped is derived by `scripts/build-brand-assets.mjs`.

| Asset | Path | Use |
|---|---|---|
| Wordmark, wine | `/images/brand/corag-wordmark.webp` | **Light backgrounds** |
| Wordmark, blanco roto | `/images/brand/corag-wordmark-light.webp` | **Dark and wine backgrounds** |
| Wordmark, rosa | `/images/brand/corag-wordmark-rosa.webp` | Wine grounds, accent contexts |
| Monogram, wine | `/images/brand/corag-monogram.webp` | Small marks on light |
| Monogram, blanco roto | `/images/brand/corag-monogram-light.webp` | Small marks on dark |
| Square lockup | `/images/brand/corag-lockup.webp` | Social avatars, app icon |

**Intrinsic aspect ratio is `526 : 154` (3.4156:1).** Every `<img>` of the
wordmark declares `width={342} height={100}`. Getting this wrong distorts the
mark or causes layout shift.

### The monogram

Below roughly 80px the wordmark stops being readable, so the small-size mark is
the **`co` ligature** — the `c` plus the heart-`o`. It is the distinctive,
legible part, and it keeps the heart. Used for the favicon, PWA icons and the
apple-touch icon.

### Rules

**Do**
- Use the wine mark on light grounds and the blanco-roto mark on dark ones.
- Keep clear space around the mark of **at least the height of the `o`** on every
  side.
- Scale proportionally.
- Use the monogram when the wordmark would render below ~80px wide.

**Never**
- Recolor the mark to anything outside the official palette.
- Stretch, skew, rotate or add effects (shadow, outline, gradient, bevel).
- Place the wine mark on a dark ground, or the light mark on a pale one.
- Rebuild the wordmark by typing "corag" in Outfit — the heart-`o` is custom.
- Crop the mark, or box it in a shape the brand does not define.
- Use the app's `corag-logo.png` — it has a baked-in non-transparent background.

> ⚠️ **Open gap:** the supplied package has **no vector master**. `favicon.svg`
> currently wraps a 512px raster. Request an SVG/AI master from the designer and
> replace it. Do **not** autotrace the wordmark.

---

## 3. Color

### Official palette (Manual, p. 13)

| Swatch | Hex | RGB | CMYK | Role |
|---|---|---|---|---|
| ██ | **`#78020E`** | R120 G2 B14 | C31 M100 Y93 K45 | **Vino — primary** |
| ██ | `#BC727C` | R188 G114 B124 | C12 M50 Y24 K1 | Vino 50% — decorative |
| ██ | **`#FFC7D5`** | R255 G199 B213 | C0 M31 Y6 K0 | **Rosa** |
| ██ | `#FFE2E9` | R255 G226 B233 | — | Rosa 50% — rosa claro |

**Rosa is a brand color, not a tint.** The manual uses it as a full background
treatment. Treating it as a faint wash of the wine loses half the identity.

`#F0E3E4` (blanco roto) appears as a ground in the official assets but is **not**
on the palette page — treat it as an observed neutral, not an official color.

### ⚠️ Hard accessibility rules

Measured ratios and their derivations:
[`CONTRAST_AUDIT.md`](../.dwp/plans/PLAN_corag_org_migration/analysis_results/CONTRAST_AUDIT.md).

1. **`#78020E` is AAA on every light ground** (7.93 minimum, 10.94 on the page
   background). Use it freely for text.
2. **`#BC727C` is never body text.** It fails AA on all five light grounds
   (2.46–3.60). Permitted: large text ≥24px or ≥19px bold, hairlines, decorative
   shapes, icon fills with an accessible label.
3. **Dark mode flips the brand from wine to rosa.** `#78020E` on a dark ground
   measures **1.52** — unusable. `#FFC7D5` measures 10.67. Both are official
   colors, so nothing is invented.
4. **The primary button is theme-invariant**: wine fill, rosa-claro label (9.54).
5. Never `text-gray-400`, `text-gray-500`, `dark:text-gray-400`,
   `dark:text-gray-500`.

### Colors the manual does not provide

A logo package cannot supply a product UI palette. Neutrals and status colors
were derived and verified in the contrast audit. They are **implementation
tokens, not brand colors** — a designer may change them without touching the
brand.

| Role | Light | Dark |
|---|---|---|
| Page background | `#FBF8F5` | `#231518` |
| Elevated surface | `#FFFFFF` | `#2E1B1F` |
| Body text | `#251F20` | `#F0E3E4` |
| Secondary text | `#574F51` | `#D6C4C7` |
| Muted text | `#635B5D` | `#92888A` |
| Success — *entregado, con evidencia* | `#24735D` | `#559381` |
| Warning — *en organización* | `#995D30` | `#B37B4F` |
| Info | `#3C6176` | `#6E8B9B` |
| Danger — *urgente* | `#A43536` | `#C37073` |

The dark ground `#231518` is **wine-tinted, not neutral grey** — dark mode still
has to read as Corag.

Full token names and utility classes: [`DESIGN.md`](./DESIGN.md).

---

## 4. Typography

| Role | Family | Notes |
|---|---|---|
| **Display / headings** | **Outfit** | Variable, weights 400–800 |
| **Body** | **Poppins** | 400 / 500 / 600 / 700 |
| Code | `ui-monospace` system stack | — |

Both are **SIL OFL 1.1** and **self-hosted** from `/public/fonts` — no external
font request, ever. Outfit ships as one variable file.

> The manual prints the body face as *"Popins"* (p. 17). That is a typo; the
> family is **Poppins**.

**Practice**
- Headings in Outfit, 600–800. Corag headlines are short and human — they should
  feel spoken, not announced.
- Body in Poppins 400, generous line height (1.6–1.75). This is a site people
  read when they are worried; give the text air.
- Never fake a weight with `font-synthesis`. Use a real shipped weight.
- Never set body copy below 16px.

---

## 5. Voice and tone

The manual defines five principles (p. 8). They are not suggestions.

| Principle | What it means |
|---|---|
| **Cálido y humano** | como un amigo que inspira a ayudar |
| **Inspirador y movilizador** | invita a la acción y al cambio |
| **Claro y sencillo** | sin tecnicismos, directo al corazón |
| **Juvenil y fresco** | cercano a la gente, con energía positiva |
| **Esperanzador** | siempre transmitiendo que sí se puede transformar vidas |

### Two registers, one brand

`cabuya.org` — this site — is **warm, human, hopeful**. It is where people decide
whether to trust Corag.

`ayuda.cabuya.org` during a live emergency is **operationally direct**. When someone
needs help right now, clarity beats warmth. *"Necesito ayuda"*, *"Quiero
ayudar"*, *"Seguir mi aporte"* — three words, no adjectives.

Both are Corag. Do not import the app's clipped register into marketing copy, and
do not import marketing warmth into an emergency flow.

### The messaging platform

**What we say, in what order, and in whose words** lives in
[`MESSAGING.md`](./MESSAGING.md) — the coraje positioning, the six-beat
argument, the approved lexicon, the proof points, and the rules for where coraje
belongs and where it must never appear. Every page that states the value
proposition writes from that document.

The one rule worth repeating here: **the coraje is ours, never aimed at the
people receiving aid.**

### Never describe Corag as "bilingual"

Corag is **a community of professionals, organizations and volunteers** — that is
the identity. The site being available in Spanish and English is a *capability*,
not a positioning claim, and calling Corag "a bilingual community" makes a
language accident sound like the point.

| ❌ | ✅ |
|---|---|
| "the bilingual community of…" | "a community of professionals and organizations" |
| "our bilingual platform" | "available in Spanish and English" |
| "intentionally bilingual" | *(drop it — say what the site does, not what label it wears)* |

State the language support where it is useful — a technical doc, an i18n guide, a
footer switcher — as the plain fact that Spanish is served at `/` and English at
`/en`. Never as an adjective describing who Corag is.

### Spanish is the source language

Spanish is written first and English is a real translation of it — never the
reverse, and never a machine echo. **Diacritics are mandatory**: ñ, á/é/í/ó/ú,
¿…?, ¡…!, and interrogative accents (`cómo`, `qué`, `cuál`, `dónde`, `cuándo`).

### What warmth does *not* license

Corag handles real aid, real money and real people in bad situations.
**Confianza** and **Transparencia** are official values, which means:

- **Never promise what the platform does not guarantee.** "Verificado" and "con
  evidencia" mean specific things. Do not blur them.
- **Never sensationalize suffering.** No disaster imagery, no misery as leverage,
  no urgency theatre.
- **Never claim numbers this site cannot verify.** Live figures belong to the
  app; link to them rather than baking them into a static build.
- **Never write savior framing.** People receiving aid are neighbours, not
  beneficiaries of our virtue.

### Blocklist

Avoid: *revolucionario · disruptivo · la mejor plataforma · líder indiscutible ·
cambiamos el mundo · salvamos vidas · empoderar · sinergia · solución integral ·
game changer · simplemente · obviamente · en resumen · sumérgete · desbloquea*.

Also avoid AI-slop scaffolding: *"En un mundo donde…"*, *"No es solo X, es Y"*,
*"Ya sea que… o…"*, *"la clave está en"*.

### Good and bad, concretely

| ❌ | ✅ |
|---|---|
| "Revolucionamos la ayuda humanitaria con tecnología de punta." | "Conectamos a quienes quieren ayudar con quienes más lo necesitan." |
| "Nuestra plataforma garantiza que tu donación llegue." | "Puedes ver en qué se usó tu aporte y qué evidencia lo respalda." |
| "Únete a la revolución solidaria." | "Ayuda donde más se necesita." |
| "Empoderamos comunidades vulnerables." | "Las comunidades organizan su propia ayuda. Nosotros la hacemos visible." |
| "Millones de vidas impactadas." | "Cada aporte queda registrado, con su destino y su evidencia." |

---

## 6. Photography

The manual's reference images (pp. 22–23) establish the style:

- Warm natural light. No cold or clinical treatment.
- **Tight human crops — often hands.** Connection, contact, exchange.
- Real, visibly diverse people.
- **The moment of connection, never the moment of suffering.**

Concretely: a box of groceries passing between two people, yes. A photograph of a
family's destroyed home, no. Corag's imagery is about what people do for each
other.

> ⚠️ The two reference photographs in `assets/brand/` are almost certainly
> **licensed stock** included as guidance. They are **not** cleared for
> publication and must not ship. Confirm licensing before using any photograph
> on the site.

---

## 7. Open gaps

Tracked in
[`OFFICIAL_BRAND_REVIEW.md`](../.dwp/plans/PLAN_corag_org_migration/analysis_results/OFFICIAL_BRAND_REVIEW.md) §8.

| Gap | Status |
|---|---|
| No vector logo master | ⚠️ Request from the designer; `favicon.svg` wraps a raster meanwhile |
| Clear-space / min-size figures | ⚠️ Stated qualitatively above; exact numbers not machine-readable from the manual |
| Photography licensing | ⚠️ Unconfirmed — do not publish |
| Icon set | Manual p. 19 is vector-only; the site uses its own icon approach |
| Social accounts, legal name, contact email | ⚠️ **Unknown — must be supplied, never invented** (needed for JSON-LD, footer, privacy page) |

---

## 8. Quick reference

```
Primary            #78020E   wine        AAA on every light ground
Rosa               #FFC7D5   brand color, not a tint
Rosa claro         #FFE2E9   primary-button label on wine
Decorative         #BC727C   NEVER body text

Display            Outfit    400–800, variable, self-hosted
Body               Poppins   400/500/600/700, self-hosted

Voice              cálido · inspirador · claro · juvenil · esperanzador
Positioning        Corag = ecosistema de impacto social
                   Ayuda Directa = producto insignia → ayuda.cabuya.org
Mark               "corag", the o is a heart — coraje + innovación + amor
```
