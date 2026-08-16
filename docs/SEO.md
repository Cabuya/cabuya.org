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
