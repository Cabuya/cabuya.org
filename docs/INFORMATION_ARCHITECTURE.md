# Information Architecture — cabuya.org

> The URL surface, navigation structure and content relationships of the new
> site. Language topology: **English canonical at `/`, Spanish at `/es`**
> (decision D-W1 — see [`docs/DECISIONS.md`](./DECISIONS.md)). Route slugs are
> **English in both languages**; every route has an `/es/{route}` twin unless
> marked otherwise.

---

## 1. The URL surface

### Root

| Route | Job | JSON-LD | Status |
|---|---|---|---|
| `/` | The landing: story, ladder, network, horizon | `Organization` + `WebSite` | Task 21 |
| `/registry` | Implementers registry: table + filters, measured states | `Dataset` (CC0, with distribution) — *Task 33* | ✅ live |
| `/registry/{publisher_id}` | One publisher: claimed vs measured, history | — | ✅ live |
| `/rfcs`, `/rfcs/{number}` | RFC index + individual RFCs | `TechArticle` | ✅ live |
| `/changelog` | Spec + validator + skill releases, one timeline | — | ✅ live |
| `/about` | Why the protocol is called Cabuya: the fibre, the neutrality argument, the two idioms, the name that was refused | — | ✅ live |
| `/start` | Install the pack, say `/cabuya`: the guided adoption in two lines, who plans (own methodology → DWP → plan mode), the PII gate, the refusals. Hero's primary CTA lands here | — | ✅ live |
| `/governance` | The governance model, maintainers, continuity | — | ✅ live |
| `/trademark` | Badge + name policy (bilingual body) | — | ✅ live |
| `/join` | Contribution funnel (the contact form lands in Task 31) | — | ✅ live |
| `/404` | Bilingual, on-brand | — | Task 18 |

### The developers portal

| Route | Job | Status |
|---|---|---|
| `/developers` | Portal home: the five-minute promise, four transports, choose-your-path | ✅ live |
| `/developers/quickstart` | Publish your first feed — the single most important page | ✅ live |
| `/developers/spec` | Version index with status badges + the RC rule | ✅ live |
| `/developers/spec/{version}` | Spec TOC for one version | ✅ live |
| `/developers/spec/{version}/{section}` | One normative section; stable `#N-M` anchors | ✅ live |
| `/developers/schemas` · `/developers/schemas/{version}/{name}` | Generated field-by-field schema reference with check-id cross-links | ✅ live |
| `/developers/validator` | Live validator (paste mode live; URL mode wired, awaiting the Function) | ✅ live |
| `/developers/validator/checks` | The full check catalogue; stable anchors `#REC001` | ✅ live |
| `/developers/validator/probe` | What our probe UA does and why (politeness page) | Task 27 |
| `/developers/consume` | The six consumption rules as a checklist | ✅ live |
| `/developers/profiles` | Core vs Extended; how extension sets become profiles | ✅ live |
| `/developers/mcp` | The reference MCP server — documented, honestly "not yet deployed" | ✅ live |
| `/developers/faq` | The four adoption blockers + more, anchor-linked | ✅ live |
| `/developers/skill` | Skill install page per agent + compatibility matrix | ✅ live |

### Machine surfaces (no `/es` twin — language-neutral or EN-pinned)

| Route | What |
|---|---|
| `{route}.md` twins | Every HTML page serves a complete Markdown twin |
| `/llms.txt` · `/llms-full.txt` | The agent map / the inlined protocol |
| `/api/validate` | The live validator Function | ✅ live |
| `/badge/{publisher_id}.svg` | The measured badge (`?lang=`, `?style=`) | ✅ live |
| `/registry/status.json` | Every measured state, live, so the static pages can refresh themselves | ✅ live |
| `/schemas/{version}/{name}.schema.json` | Schemas served byte-exact at their `$id` URLs | ✅ live |
| `sitemap-index.xml`, `robots.txt`, `site.webmanifest`, favicons | Standard |

### Dev-only (`/internal/*` — excluded from production three ways)

`/internal` hub · `/internal/brand` (brand book) · `/internal/brand/assets`
(favicon/OG verification) · `/internal/ui/colors` (live token table) ·
`/internal/ui/components` · `/internal/ui/diagrams` · `/internal/guide`.
English-only, `InternalLayout`, no page-wrapper pattern.

## 2. Navigation

### Header (6 items max + language switcher + theme toggle)

| Item | Target | Notes |
|---|---|---|
| **Protocol** | disclosure → Spec, Schemas, RFCs, Changelog | The standard itself |
| **Developers** | `/developers` | The portal (its own sidebar takes over inside) |
| **Registry** | `/registry` | Public, not dev-only — badges link here |
| **About** | disclosure → Why Cabuya, Governance, Trademark | Who this belongs to |
| **Join** | `/join` | The funnel |

**Why `About` is a disclosure and not a sixth sibling.** `/about`,
`/governance` and `/trademark` answer one question from three angles — who the
protocol belongs to — and two of them were reachable only from the footer. A
flat seventh entry would have crowded the row on a laptop and put the newest
page at the end of it. The group's own target is `/about`, so the label is a
link on touch, where a hover disclosure has nothing to hover.

Logo → `/`. Language switcher: same route, other language (URL-first, no
redirect logic). Mobile: drawer with the same groups.

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

Every retired route 301s to its closest surviving surface (the table is
defined in D-W1 and enforced by `redirects:check`):

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
