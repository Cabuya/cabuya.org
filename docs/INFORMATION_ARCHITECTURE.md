# Information Architecture — cabuya.org

> The URL surface, navigation structure and content relationships of the new
> site. Language topology: **English canonical at `/`, Spanish at `/es`**
> (decision D-W1 — see [`docs/DECISIONS.md`](./DECISIONS.md)). Route slugs are
> **English in both languages**; every route has an `/es/{route}` twin unless
> marked otherwise. Status column tracks the migration plan
> (PLAN_cabuya_website_and_skill).

---

## 1. The URL surface

### Root

| Route | Job | JSON-LD | Status |
|---|---|---|---|
| `/` | The landing: story, ladder, network, horizon | `Organization` + `WebSite` | Task 21 |
| `/registry` | Implementers registry: table + filters, measured states | `Dataset` (CC0, with distribution) | Task 28 |
| `/registry/{publisher_id}` | One publisher: claimed vs measured, history | — | Task 28 |
| `/rfcs`, `/rfcs/{number}` | RFC index + individual RFCs | `TechArticle` | Task 30 |
| `/changelog` | Spec + validator + skill releases, one timeline | — | Task 30 |
| `/governance` | The governance model, maintainers, continuity | — | Task 30 |
| `/trademark` | Badge + name policy (bilingual body) | — | Task 30 |
| `/join` | Contribution funnel + the contact form | — | Tasks 30–31 |
| `/404` | Bilingual, on-brand | — | Task 18 |

### The developers portal

| Route | Job | Status |
|---|---|---|
| `/developers` | Portal home: the five-minute promise, four transports, choose-your-path | Task 23 |
| `/developers/quickstart` | Publish your first feed — the single most important page | Task 24 |
| `/developers/spec` | Version index with status badges + the RC rule | Task 25 |
| `/developers/spec/{version}` | Spec TOC for one version | Task 25 |
| `/developers/spec/{version}/{section}` | One normative section; stable `#N-M` anchors | Task 25 |
| `/developers/schemas` · `/developers/schemas/{version}/{name}` | Generated field-by-field schema reference with check-id cross-links | Task 25 |
| `/developers/validator` | Live validator (URL mode + paste-JSON mode) | Tasks 26–27 |
| `/developers/validator/checks` | The full check catalogue; stable anchors `#REC001` | Task 26 |
| `/developers/validator/probe` | What our probe UA does and why (politeness page) | Task 27 |
| `/developers/consume` | The six consumption rules as a checklist | Task 29 |
| `/developers/profiles` | Core vs Extended; how extension sets become profiles | Task 29 |
| `/developers/mcp` | The reference MCP server — documented, honestly "not yet deployed" | Task 29 |
| `/developers/faq` | The four adoption blockers + more, anchor-linked | Task 29 |
| `/developers/skill` | Skill install page per agent + compatibility matrix | Task 29 |

### Machine surfaces (no `/es` twin — language-neutral or EN-pinned)

| Route | What |
|---|---|
| `{route}.md` twins | Every HTML page serves a complete Markdown twin (Task 32) |
| `/llms.txt` · `/llms-full.txt` | The agent map / the inlined protocol (Task 32) |
| `/api/validate` | The live validator Function (Task 27) |
| `/badge/{publisher_id}.svg` | The measured badge (`?lang=`, `?style=`) (Task 28) |
| `/spec/**` raw files | Schemas served at their `$id` URLs (Task 25) |
| `sitemap-index.xml`, `robots.txt`, `site.webmanifest`, favicons | Standard |

### Dev-only (`/internal/*` — excluded from production three ways)

`/internal` hub · `/internal/brand` (brand book) · `/internal/brand/assets`
(favicon/OG verification) · `/internal/ui/colors` (live token table) ·
`/internal/ui/components` · `/internal/ui/diagrams` · `/internal/guide`.
English-only, `InternalLayout`, no page-wrapper pattern.

## 2. Navigation

### Header (5 items max + language switcher + theme toggle)

| Item | Target | Notes |
|---|---|---|
| **Protocol** | disclosure → Spec, Schemas, RFCs, Changelog | The standard itself |
| **Developers** | `/developers` | The portal (its own sidebar takes over inside) |
| **Registry** | `/registry` | Public, not dev-only — badges link here |
| **Governance** | `/governance` | Trust surface |
| **Join** | `/join` | The funnel |

Logo → `/`. Language switcher: same route, other language (URL-first, no
redirect logic). Mobile: drawer with the same five groups.

### Portal sidebar (order = the adoption journey)

1. Overview (`/developers`)
2. **Quickstart**
3. Spec (version index → sections)
4. Schemas
5. Validator (+ Checks)
6. Consume
7. Profiles
8. Skill
9. MCP
10. FAQ

### Footer (four columns)

| Protocol | Developers | Governance | Meta |
|---|---|---|---|
| Spec · Schemas · RFCs · Changelog | Quickstart · Validator · Registry · Skill | Governance · Trademark · Code of Conduct · Security policy · Licensing | GitHub · `llms.txt` · Language links · The founding principle (small, both languages) |

## 3. Content relationships (the cross-link graph)

- **Validator messages → spec anchors** (`#3-1`-style) and **→ check pages**
  (`/developers/validator/checks#REC001`) — the agent fix loop's edges.
- **Schema reference fields → the check ids that fire on them** — closes the
  loop from data shape to enforcement.
- **Badge → `/registry/{id}`** — the measurement behind the claim.
- **Registry entry → publisher's canonical site, manifest, crawl policy** —
  outward, attributed.
- **Quickstart → validator (embedded) → registry PR** — the adoption funnel.
- **FAQ answers → normative anchors** — never restate a norm, link it.
- **Landing sections → their owning deep pages** — per MESSAGING.md beats.

## 4. Redirect posture

Every retired Corag route 301s to its closest surviving surface (full table
defined in migration Tasks 7–8 and recorded in
`analysis_results/I18N_MIGRATION.md`; enforced by `redirects:check`):

- Old `/en/*` URLs → `/*` (English moved to root).
- Indexed Spanish-rooted URLs → `/es/*` equivalents where they exist.
- Retired sections (blog, ecosystem, channels, contact, emergencies, …) → the
  closest new surface (`/`, `/registry`, `/join`).
- `cabuyaprotocol.org/*` → `https://cabuya.org/*` (301, DNS-level — a launch
  human action).

## 5. The middleware allowlist

`src/middleware.ts` keeps a hardcoded allowlist (`KNOWN_ROOT_PATHS` +
language-aware paths). **Adding a top-level route without updating it returns
404 in production.** Every task that adds a route updates the allowlist in the
same commit — this is a standing trap, documented in AGENTS.md.
