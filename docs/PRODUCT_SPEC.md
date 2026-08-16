# Product Specification — cabuya.org

## Overview

**Corag** is *el ecosistema de impacto social* — a platform that connects
foundations, governments, companies, social entrepreneurs and individuals with
real, verifiable opportunities to help.

This repository is **`cabuya.org`**, Corag's institutional site. Its job is to
make someone understand Corag, believe in it, and cross over to the product.

**`ayuda.cabuya.org`** is a separate deployment: **Corag Ayuda Directa**, the
flagship product where the actual coordination happens.

```
Corag — el ecosistema de impacto social          ← this site, cabuya.org
   └── Ayuda Directa — producto insignia         → ayuda.cabuya.org
          └── Emergencia activa
```

Getting that split wrong is the most common way to write incorrect copy or code
here. **If it stores something about a real person's need, it belongs in the
application.** This site holds no aid data and has no write API.

---

## Brand Positioning

**Primary identity:** the social-impact ecosystem — a community of professionals,
organizations and volunteers who make help visible and accountable.

> **Tenemos coraje para servir y transformar vidas.**

The name comes from **coraje**. The heart replacing the `o` in the wordmark
carries **amor**. The official brand manual states the mark transmits *coraje,
innovación y amor*.

Corag exists because of a specific, ordinary failure:

> Many people want to donate or get involved, but cannot find a way to do it that
> is **confiable, cercana y significativa**.

Not a shortage of generosity — a shortage of connection. Aid fragments across
WhatsApp threads, one-off forms, spreadsheets and phone calls, and the people who
could help never meet the people who need it.

**Values:** Colaboración · Empatía · Confianza · Amor · Innovación social ·
Transparencia.

Full positioning, the six-beat argument and the approved lexicon:
[`MESSAGING.md`](./MESSAGING.md).

### Value propositions, by audience

| Audience | What Corag offers them |
|---|---|
| Someone who needs help | A way to publish a real need and have it seen by people who can act on it |
| Someone who wants to help | A concrete, verifiable place to put time, goods or money — and proof of where it went |
| A contributor of money | Direct transfer to a named, verified responsable, with published evidence of use |
| A leader / coordinator | Tools to organize a front, register deliveries and account for what was received |
| An organization or foundation | A shared coordination layer instead of another isolated internal system |
| A government or municipality | Territorial visibility of needs and offers, without building a platform |
| A developer | A public API, an OpenAPI spec and an MCP server — build a client, not another silo |
| An AI agent | A machine-readable surface, and a clear boundary about where writes belong |

---

## Vision

> Convertirse en la plataforma global líder en innovación social, donde donar,
> servir y transformar vidas sea una experiencia divertida, confiable y
> profundamente humana.

### Mission

> Conectar a fundaciones, gobiernos, emprendedores y personas a través de una
> plataforma digital transparente y creativa, que incentive la solidaridad
> mediante experiencias dinámicas, accesibles y con impacto real en las
> comunidades.

### What this site is for

1. **Explain** what Corag is and how the model works.
2. **Earn trust** by showing the mechanism, not by claiming trustworthiness.
3. **Hand over** to `ayuda.cabuya.org` for every action.
4. **Recruit** — developers, organizations, volunteers, leaders.
5. **Stay legible to machines**, because Corag's thesis is interoperability.

---

## Target Audience

**Primary** — people affected by an emergency, people who want to help, and the
leaders who coordinate between them.

**Secondary** — foundations, NGOs, companies and municipalities evaluating
whether to join the network.

**Tertiary** — developers, and the AI agents acting on someone's behalf.

Corag operates from Colombia, in Spanish, with an English surface so the model is
legible to organizations and contributors outside the country.

---

## Information Architecture

Spanish is served at the root; English lives under `/en`.

| Route | Purpose |
|---|---|
| `/` | The full argument: problem, bridge, evidence, product, invitation |
| `/como-funciona` | The lifecycle end to end, plus the three flows (necesidad, ofrecimiento, aporte) |
| `/transparencia` | Recibido vs. utilizado con evidencia · moderation · transferencia directa |
| `/emergencias` | What an emergency is in Corag, frentes operativos, the live one |
| `/lideres` | What a leader is, how they are validated, what they are accountable for |
| `/desarrolladores` | REST API, OpenAPI 3.1, MCP, idempotency, rate limits |
| `/aliados` | Organizations, foundations, companies, municipalities |
| `/colaboradores` | The team building Corag, by area, with a recruiting CTA |
| `/sobre-corag` | Mission, model, governance, the origin of the name |
| `/contacto` | Institutional contact — **not** a channel for requesting aid |
| `/blog` | Editorial: the model, the field, the technology |
| `/privacidad` · `/conducta` · `/gobernanza` · `/contribuir` | Legal and community |

Every route is registered in `src/middleware.ts`. A route missing from that
allowlist works in dev and 404s in production.

---

## Key Features

### 1. Home

Runs the full six-beat argument from `MESSAGING.md`. Leads with the coraje
statement, names the problem, presents the bridge, shows the evidence mechanism,
introduces Ayuda Directa, and invites. Every action routes to the application.

### 2. How it works

The lifecycle — necesidad → publicación → geolocalización → matching →
coordinación → entrega → evidencia → verificación → trazabilidad — plus the
request/offer model with its urgency levels and categories.

### 3. Transparency

The differentiator, given its own page. **Money received** and **money used with
evidence** are two separate public figures. Evidence is moderated before
publication. Contributions go by direct transfer to verified leader accounts
rather than a central treasury, which reduces custodial risk and makes every
contribution attributable.

### 4. Emergencies

An emergency is the top-level entity, and the platform is built for many — not
only the current one. Large emergencies split into **frentes operativos**, each
with its own needs, responsables, conversations, priorities and evidence.

### 5. Leaders

What a leader is, how they are validated and approved, and what they are
accountable for. This is the system's critical trust dependency and the page says
so plainly.

### 6. Developers

The most strategically important page. Documents `POST /api/public/v1/help`, the
OpenAPI 3.1 spec, the MCP server and its tools, `source` + `externalId`
idempotency, rate limiting and geographic validation.

> **Muchas interfaces, una sola red de datos.** During an emergency, several
> teams build parallel applications, each with its own database of needs — which
> produces more fragmentation, not less. The API exists so a new client becomes a
> client *of one network* rather than a new silo.

**Everything on this page is verified against the live OpenAPI spec.** Nothing is
documented that the spec does not confirm.

### 7. Allies and contributors

`/aliados` for organizations; `/colaboradores` for the people building Corag,
grouped by area, with a recruiting call to action. Neither page ever lists an
invented organization or person.

### 8. Blog

Editorial on the model, the field and the technology. Tags, series, authors,
search, RSS, pagination and per-post agent-Markdown twins.

### 9. Contact

Institutional intakes only, relayed through Cloudflare Pages Functions to
Dailybot Forms. Every form page states prominently, **above** the form, that
requesting or offering aid happens in the application — a form here that quietly
swallowed an emergency need would be a real harm, not a UX flaw.

### 10. Agent-readable surface

Every public page has a **complete** Markdown twin at its path plus `.md`, served
from the original source Markdown rather than converted from rendered HTML. Plus
`llms.txt`, `llms-full.txt` and `.well-known` descriptors.

Because Corag's thesis is interoperability, these files carry one instruction
above all: **this host has no write API — publishing a need or a contribution
happens at `ayuda.cabuya.org`.** An agent that POSTs a humanitarian need here
reaches nobody.

### 11. Language support

Spanish is the primary language and is served at the root. English is served
under `/en`. Both carry the same content — the same sources, the same structure —
not merely correct content in each, and `pnpm run parity:check` enforces it.

Spanish is also the **source** language: copy is written in Spanish and
translated to English, never the reverse. Diacritics are mandatory.

---

## Design Principles

### Visual

- The official palette: wine `#78020E`, rosa `#FFC7D5`, rosa claro `#FFE2E9`,
  and the decorative 50% wine `#BC727C`.
- **Outfit** for display, **Poppins** for body — both self-hosted, no external
  font request.
- Warm rather than clinical. The rosa family is what keeps the brand from reading
  severe.
- Radius 12 / 18 / 28px; wine-tinted elevation, never neutral grey.
- Dark mode flips the brand from wine to rosa, because wine on a dark ground
  measures 1.52:1. Both are official colors.

Full contract: [`DESIGN.md`](./DESIGN.md). Identity: [`BRAND_GUIDE.md`](./BRAND_GUIDE.md).

### Messaging

Five principles from the official manual: **cálido y humano · inspirador y
movilizador · claro y sencillo · juvenil y fresco · esperanzador**.

Two registers: this site is warm and hopeful; the application during a live
emergency is operationally direct. Never mix them.

**The coraje is ours, never aimed at the people receiving aid.**

### Imagery

Warm natural light, tight human crops (often hands), real and diverse people —
**the moment of connection, never the moment of suffering**. No disaster imagery,
no misery as leverage.

---

## Technical Requirements

### Performance

- Static generation. `.astro` by default; Svelte islands only where genuinely
  interactive, with the laziest viable hydration.
- Every image carries `width` and `height`. No layout shift.
- Self-hosted fonts with `font-display: swap`.
- Lighthouse: 100 across categories is the target, enforced by `pnpm run lighthouse`.

### SEO & AEO

- `NGO`/`Organization` JSON-LD, `BlogPosting`, `BreadcrumbList`.
- Reciprocal hreflang across `es` / `en` / `x-default`.
- Meta descriptions 130–160 characters, enforced by `pnpm run seo:check`.
- GSC verification is **DNS-only** — never add a `google-site-verification` tag.

### Accessibility

- WCAG AA: 4.5:1 body, 3:1 large text and meaningful UI boundaries.
- Every token's contrast is measured, not estimated.
- Keyboard operable throughout, with visible focus.
- `prefers-reduced-motion` honored by every non-essential animation.

### Privacy

This site collects only what a contact form submission carries. No accounts, no
personal records, no aid data. Corag's audience may include people in vulnerable
situations, so no PII reaches logs.

---

## User Flows

### Someone who needs help

1. Arrives at `/` — usually from a share, not a search.
2. The primary action is unmistakable and points at the application.
3. → `ayuda.cabuya.org`, where the need is published, geolocated and matched.

> This site never collects a need. Every path leads to the application.

### Someone who wants to contribute

1. `/` → `/transparencia` — how do I know it arrives?
2. Sees the mechanism: two numbers, named responsables, moderated evidence.
3. → `ayuda.cabuya.org/aportar`.

### An organization evaluating Corag

1. `/sobre-corag` → `/como-funciona` → `/transparencia`.
2. `/aliados` for how to join.
3. `/contacto` for an institutional conversation.

### A developer

1. `/desarrolladores` — the problem, the API, the quickstart.
2. Fetches the OpenAPI spec from the application host.
3. Builds a client that syncs with Corag instead of starting a new database.

### An AI agent

1. Reads `/llms.txt` — learns immediately that this host has no write API.
2. Follows the pointer to the application's API and MCP server.
3. Reads any page's `.md` twin for complete content.

---

## Content Strategy

### Editorial standards

- Spanish first, English as a real translation.
- Every claim must be one the site can stand behind. "Verificado" and "con
  evidencia" mean specific things.
- Never publish a live figure this static site cannot verify — link to the
  application instead.
- No placeholder content, ever.

### Tag taxonomy

Three tiers (primary / secondary / subtopic), max five tags per post, at least
one primary. Tags are never created without approval — propose with
`/audit-taxonomy`.

---

## Success Metrics

These measure **the website**, not the aid. This repo cannot measure whether help
arrived; the application does that, and conflating the two would be exactly the
overclaiming the brand guide forbids.

| Metric | Why it matters |
|---|---|
| Handoff rate to `ayuda.cabuya.org` | The site's actual job |
| `/desarrolladores` → integrations started | The interoperability thesis working |
| `/colaboradores` → contributors joined | Recruiting |
| Institutional contacts from `/aliados` | Organizations entering the network |
| Lighthouse 100 across categories | The site loads for people on bad connections |
| `md:check`, `lang:check`, `seo:check`, `parity:check` all clean | The agent and language surfaces stay honest |
| Zero placeholder content in production | Basic integrity |

---

## Future Enhancements

- A true vector logo master, replacing the raster-wrapped `favicon.svg`.
- Live figures pulled from the application's public API at runtime, degrading
  gracefully when it is unreachable — never baked into the build.
- Case studies once there are completed emergencies with published evidence.
- An integrations directory listing the clients built on the API.
