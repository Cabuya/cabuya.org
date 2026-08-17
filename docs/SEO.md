# SEO / AEO — search and answer-engine surface

> The rules for how cabuya.org is indexed, cited and read by machines. The
> agent-facing Markdown layer is first-class product here (see
> `docs/aeo/MARKDOWN_FOR_AGENTS.md`); classic SEO serves the same goal:
> being the authoritative, citable source for the Cabuya Protocol.

---

## 1. Canonical rules

- Absolute origin: `https://cabuya.org` (from `astro.config.mjs` `site`).
- Every page: exactly one `rel="canonical"`, pointing at the HTML (never at a
  `.md` twin).
- **Versioned spec URLs are canonical to themselves, never to "latest".** A
  normative document that silently changes under its own URL is a
  standards-project failure. `/developers/spec/0.1/…` stays 0.1 forever.
- `cabuyaprotocol.org` 301s to `cabuya.org` (DNS-level, launch action).

## 2. hreflang (D-W1 topology)

Every EN/ES pair emits both directions + `x-default` → the EN page:

```html
<link rel="alternate" hreflang="en" href="https://cabuya.org/{route}" />
<link rel="alternate" hreflang="es" href="https://cabuya.org/es/{route}" />
<link rel="alternate" hreflang="x-default" href="https://cabuya.org/{route}" />
```

Derived from the language registry — never hand-written per page. Machine
surfaces (llms.txt, schemas, badges, API) emit none.

## 3. Structured data (JSON-LD) — the page-type matrix *(gate-enforced from Task 33)*

| Page type | Types |
|---|---|
| Home | `Organization` + `WebSite` |
| Spec sections | `TechArticle` (with `version`, `datePublished`) |
| Schema reference pages | `SoftwareSourceCode` |
| `/registry` | `Dataset` (CC0 license, distribution URL — it IS a dataset) |
| `/developers/faq` | `FAQPage` |
| RFCs | `TechArticle` |
| Sitewide | `BreadcrumbList` via the breadcrumbs component |

All emitted by the central helper; every block must parse (test) and match
the matrix (`seo:check`).

## 4. Meta

- Descriptions 130–160 chars, composed from the page's actual content, both
  languages (`seo:check` asserts range).
- OG/Twitter cards on every page: `og:image` 1200×630 (system + fallback
  card: *Task 22*), `og:locale` + alternates, `twitter:card =
  summary_large_image`, absolute URLs.
- Titles: `{Page} — Cabuya` pattern; home is `Cabuya — {pitch fragment}`.

## 5. Sitemap & robots

- `@astrojs/sitemap` with both languages; excludes `/internal/*` and twin
  endpoints; hreflang alternates included.
- `robots.txt`: allow all incl. the AI crawlers (the spec and registry exist
  to be read by machines); sitemap reference; no stale rules.
- **Verification policy (MANDATORY):** GSC verification is **DNS-only** —
  never add `google-site-verification` meta (gate-banned). Bing optional via
  `PUBLIC_BING_SITE_VERIFICATION` env only.

## 6. AEO — the machine reading path

- Every page serves a complete `.md` twin; `Accept: text/markdown` negotiates
  to it; spec twins ARE the CI-validated source files.
- `llms.txt` = the site map for agents; `llms-full.txt` = the whole protocol
  in one fetch (spec + quickstart + check catalogue). Generated at build.
- Schema pages negotiate `application/schema+json` to the raw schema; `$id`
  URLs serve the actual files.
- Registry data is CC0 and says so where agents look (llms.txt + the Dataset
  JSON-LD).

## 7. Redirects

`public/_redirects` is the single source (checked by `redirects:check`):
retired Corag routes → closest surviving surface; `/en/*` → `/*`; legacy ES
root URLs → `/es/*`. Every rule must resolve to a live page; no live page may
be shadowed.

## Share cards

One card, 1200 × 630, on every page. The mechanism lives in
`src/lib/og-image.ts` and resolves in three steps, most specific first: an
explicit `image` prop on the page, a section card matched by route prefix, then
the language default.

| Card | Path | Serves |
|---|---|---|
| Default — English | `public/images/og-default-en.jpg` | Every `/` route |
| Default — Spanish | `public/images/og-default.jpg` | Every `/es` route |

### Adding a section card

1. Generate the artwork per `docs/visuals/prompts/04-og-images.md` — same house
   style, same dimensions, same safe area, wordless.
2. Register it in `OG_CARDS`.
3. Add a `{ prefix, card }` entry to `SECTION_CARDS`.

Nothing else changes: pages in that section pick it up, including pages nobody
has written yet. That is why the map is keyed on route prefix rather than on
frontmatter — a per-page field is a field the next page forgets, and the page
that forgets is the one that gets shared.

### Why route prefixes and not frontmatter

A section card is a property of the section. Frontmatter makes it a property of
each page, which means it is only as correct as the last person's memory.

### Why there is no dark variant

`og:image` is fetched by a crawler that has no idea what colour scheme the
eventual viewer prefers, and `prefers-color-scheme` is not part of the Open
Graph protocol. A second file could never be selected, so the card is built on
the light ground and has to read well when a dark client frames it.

### The fallback

`scripts/generate-og-fallback.mjs` runs in `prebuild` and composes an austere
on-brand card so that no page ever ships without a valid `og:image`. It writes
a marker into the file's EXIF description and **refuses to overwrite anything
that does not carry it** — the real artwork arrives with the same filename, so
the marker is the only signal that distinguishes it. `--force` regenerates the
fallback but still will not touch real artwork.
`tests/unit/scripts/og-fallback.test.ts` covers the guard, because "does not
destroy the designer's work" is not a property to verify by hand.

### What the gate enforces

`pnpm run seo:check` asserts, on the built output, that every page carries
`og:image` and `twitter:card`, that the image URL is absolute, that the file it
points at **exists in the build**, and that the card kind is
`summary_large_image`. A relative URL is resolved against the crawler's own
origin by some platforms and not at all by others, and a 404 card renders as a
broken-image frame rather than falling back to text.
