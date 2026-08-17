# AGENTS.md — Documentation for AI Agents

**Purpose:** single source of truth for all AI coding assistants (Claude Code,
Cursor AI, OpenAI Codex, Google Gemini, GitHub Copilot, and others) operating
on the `cabuya.org` codebase.

> **Status.** Every artifact this document describes exists: `spec/`,
> `registry/`, `packages/validator/`, the `[lang]` tree, and the gates that
> enforce them.
>
> Anything not yet built is listed under **Deferred** at the end of this file,
> with what it is waiting on — never as a forward reference inside a section
> that otherwise describes the present.

## Detailed Documentation

| Category | Guide | Purpose |
|----------|-------|---------|
| Architecture | [Architecture](docs/ARCHITECTURE.md) | Structure, collections, loaders, the spec/registry boundary |
| Standards | [Standards](docs/STANDARDS.md) | Coding rules, orthography, import order, naming |
| Product | [Product Spec](docs/PRODUCT_SPEC.md) | What cabuya.org is, audiences, metrics, golden rules |
| Messaging | [Messaging](docs/MESSAGING.md) | The narrative map — which page owns which claim |
| Information architecture | [Information Architecture](docs/INFORMATION_ARCHITECTURE.md) | URL surface, nav, cross-link graph, redirects |
| Brand | [Brand Guide](docs/BRAND_GUIDE.md) | The story, the mark, the measured palette, voice, badge language |
| Design | [Design System](docs/DESIGN.md) | **Read before generating any UI** — tokens, hard rules, patterns |
| Writing voice | [Writing Voice Guide](docs/WRITING_VOICE_GUIDE.md) | Register, blocklists, anti-slop, both languages |
| Writing craft | [Writing Craft Guide](docs/WRITING_CRAFT_GUIDE.md) | Fact verification, citation, drift detection |
| i18n | [I18N Guide](docs/I18N_GUIDE.md) | EN at `/`, ES at `/es`, the `[lang]` tree, parity gates |
| Testing | [Testing](docs/TESTING_GUIDE.md) | Vitest conventions, the validator test strategy |
| Commands | [Development Commands](docs/DEVELOPMENT_COMMANDS.md) | Every script, including the gates |
| Performance | [Performance](docs/PERFORMANCE.md) | Normative budgets per surface |
| Accessibility | [Accessibility](docs/ACCESSIBILITY.md) | WCAG AA measured; the two site-specific rules |
| SEO / AEO | [SEO](docs/SEO.md) | Canonical/hreflang topology, JSON-LD inventory, versioned-URL rule |
| Security | [Security](docs/SECURITY.md) | Threat model; the `/api/validate` SSRF surface; secrets |
| Analytics | [Analytics](docs/ANALYTICS.md) | Cookieless; measured vs never-measured |
| Licensing | [Licensing](docs/LICENSING.md) | Apache-2.0 / CC0 two-layer split |
| Documentation | [Documentation Guide](docs/DOCUMENTATION_GUIDE.md) | When and how docs must change |
| Founding record | [docs/context/](docs/context/README.md) | The ratified decisions and evidence (historical; `spec/` wins) |
| Decisions (live) | [docs/DECISIONS.md](docs/DECISIONS.md) | Post-founding decisions (D-W1…) |
| Skills/Agents | [Skills & Agents Catalog](.agents/docs/skills_agents_catalog.md) | Available skills and agents |
| Commands | [Commands Reference](.agents/docs/COMMANDS_REFERENCE.md) | All slash commands |

## Project Overview

**cabuya.org** is the home of the **Cabuya Protocol** — an open
interoperability standard that lets emergency-aid applications publish and
consume the same data. One `place` schema, four transports (static feed ≡
read API ≡ write API ≡ MCP); conformance **measured by a published validator,
never self-declared**. Spec status: **0.1 draft**.

This repository holds four artifacts:

1. **The website** — landing + `/developers` portal, bilingual (EN at `/`,
   ES at `/es`).
2. **`spec/`** — the normative text, JSON Schemas, examples and RFCs. CC0,
   bounded, extractable.
3. **`registry/`** — reviewed publisher entries; measured badge state lives in
   KV, never in git.
4. **`packages/validator/`** — `@cabuya/validator`: one engine, four
   harnesses (CLI, CI, live web, cron).

Companion repo: **`Cabuya/cabuya-skill`** — the installable agent pack that
vendors `spec/` (checksummed) and teaches any agent the protocol offline.

> **This repository is not an aid application.** It never holds a real
> person's situation, case, name or phone number — and the protocol itself
> excludes person-level data by a **join prohibition**, not a field omission.

**Technology stack:** Astro 7.x SSG + Sätteri (Rust Markdown; HAST plugins in
`src/lib/satteri-plugins.ts` — **never** add `remarkPlugins`/`rehypePlugins`
or any `rehype-*` dependency) · Svelte 5.x islands (`client:visible`/`idle`)
· Tailwind 4.x `@theme` tokens · TypeScript 6.x (**pinned** — `astro check`
needs the TS 6 programmatic API; do not bump to 7) · Biome 2.x (no
ESLint/Prettier) · Vitest · Playwright · pnpm workspaces · Cloudflare Pages +
Functions + KV.

## Project Structure (target)

```
spec/                      # CC0 · bounded · extractable
│  ├── versions/0.1/       #   normative sections, stable §-anchors
│  ├── schemas/0.1/        #   manifest + place-feed JSON Schemas
│  ├── examples/0.1/       #   {valid,invalid}/ teaching examples
│  ├── profiles/ vocab/ rfcs/
registry/                  # CC0 · publisher entries + history
packages/
│  └── validator/          # @cabuya/validator
src/
├── components/
│   ├── pages/             # *Page.astro (receive `lang`)
│   ├── home/              # landing sections
│   ├── developers/        # portal machinery: sidebar, TOC, code blocks
│   ├── registry/          # registry table + publisher views
│   ├── diagrams/          # HTML/CSS diagram components
│   ├── editorial/ ui/ layout/
├── content/docs/{en,es}/  # portal prose
├── layouts/               # MainLayout, DocsLayout, InternalLayout
├── lib/                   # i18n, language-codes, translations/, spec-loader,
│                          #   registry-loader, markdown-for-agents, satteri-plugins
├── pages/                 # EN at root · [lang]/ dynamic tree · internal/
├── middleware.ts          # KNOWN_* allowlist — see the trap below
└── styles/global.css      # the ONLY @theme token declaration site
functions/                 # _middleware (Accept negotiation) · api/validate
│                          #   · api/contact · badge/[publisher]
scripts/                   # gates + build utilities
docs/                      # this documentation set · docs/context/ founding record
.agents/  (.claude → .agents, CLAUDE.md → AGENTS.md)
tmp/                       # git-ignored scratch (agents write temp files here)
```

## CRITICAL: Mandatory Requirements

### 0. Rule-0 — never publish a claim you cannot back

The project's founding argument. **No invented figures** (citable emergency
figures: `docs/context/DECISIONS.md` M7, always with the named source). **No
endorsements we cannot maintain** — *inclusion is not endorsement*; a
directory lists, a registry measures. **No CTA to anything that does not
exist.** **No conformance language the validator has not measured** — and
never the word *certificado/certified*. State the limit instead of writing
around it.

### 1. Person-level data — the line that never moves

No personal names, personal phones, personal emails or personal media anywhere
in this repo: code, content, fixtures, examples, docs, tests. Org-level role
addresses published by their own orgs are the only exception. The validator's
own PII deny-patterns run over our fixtures in CI.

### 2. Language standards

All code, comments, commit messages, check ids, JSON keys and repo docs in
**English**. Public content: **English canonical, Spanish first-class** — both
written natively (see the voice guide). Spanish orthography (ñ, tildes,
¿ ¡) is gate-checked:

```bash
grep -rn 'pequeno\|tamano\|diseno\|espanol\|manana\|companer\|analisis\|codigo\|version\|pagina' src/content/ src/lib/translations/es.ts
```

### 3. i18n topology (D-W1)

**EN at `/`, ES at `/es`**, one `[lang]` dynamic tree.
Route slugs are English in both languages. URL-first: no browser-language
redirects. Translations are exhaustive-typed (`src/lib/translations/types.ts`
— a missing key is a type error). Never hardcode user-visible strings; use
`getTranslations(lang)` and `getUrlPrefix(lang)`.

### 4. The spec/registry boundary (B1–B7)

`spec/` and `registry/` import nothing and are imported by nothing directly —
site code reads them **only** through `src/lib/spec-loader.ts` and
`src/lib/registry-loader.ts`. No build files inside them; absolute versioned
`$id`s; directory-scoped CC0 licenses; no PII, even in examples. Enforced by
`spec:boundary`.

### 5. Design tokens (MANDATORY — see docs/DESIGN.md for the full contract)

`--color-cabuya-*` declared once in `src/styles/global.css`. Five hard rules:
single declaration site · no raw greys (`text-gray-400/500` + `dark:` variants
are test-banned) · **fique (`#C79A4A`) never carries text on light** (use
`cabuya-accent-strong`) · filled surfaces use the fill pair
(`bg-cabuya-fill text-cabuya-on-fill`, never `bg-cabuya-primary text-white`)
· no hex literals in components. The token test **re-computes WCAG ratios**;
it will fail your build if you break a measured pair.

### 6. Code quality

```bash
pnpm run biome:check   # lint + format (no ESLint/Prettier)
pnpm run astro:check   # types
pnpm run test          # Vitest
```

### 7. Quality gates

Five content gates (all `:strict` in CI): `md:check` (complete `.md` twins) ·
`lang:check` (EN at root renders English, `/es` renders Spanish) · `seo:check`
· `parity:check` (both languages carry the SAME content) · `redirects:check`.
Protocol gates: `spec:check` + `spec:boundary` ·
`registry:check` · `checks:catalogue` ·
`perf:budgets` · `a11y:check`.

### 8. Performance budgets (normative — docs/PERFORMANCE.md)

Docs pages **0 KB JS** unless they carry an island · landing ≤ 40 KB ·
validator page ≤ 90 KB (`client:idle`) · registry ≤ 60 KB (table works
without JS) · badge < 50 ms p95 · Lighthouse ≥ 95/100/100/95. Lightest
hydration that works; CSS before JS; dimensions on every image.

### 9. Accessibility (docs/ACCESSIBILITY.md)

WCAG AA measured. Token text colors only. Disclosure pattern for nav (never
`role="menu"`). Visible focus. `prefers-reduced-motion`. Plus the two
site-specific rules: **validator severity is never color-alone** (text
tokens), and **the badge SVG carries `<title>` + `aria-label`**.

### 10. Security (docs/SECURITY.md)

The one dynamic surface that matters is `/api/validate` — a server that
fetches arbitrary URLs. Treat every change near it as security-sensitive
(scheme/address/redirect guards, size/time caps, rate limits, zero
retention). No secrets in the repo, ever; env names documented in
`.dev.vars.example`.

## Architecture Patterns

1. **Astro first.** `.astro` for all non-interactive content; Svelte only for
   genuine interactivity, always with the lightest `client:*` directive.
2. **Page components + `[lang]` tree** *(from Task 8)*: one `*Page.astro` per
   route in `src/components/pages/` receiving `lang`; root routes render
   `lang="en"`; the single `src/pages/[lang]/` tree serves other languages via
   `getStaticPaths`. Page wrappers never import layouts.
3. **Content collections + Zod** in `src/content.config.ts`; localized fields
   as `{en, es}` objects so a missing translation is a build error.
4. **Loaders, not globs, for bounded dirs**: `spec-loader.ts` /
   `registry-loader.ts` are the only doors (B2).
5. **`.md` twins**: every page serves a complete Markdown twin; spec twins ARE
   the source files. `Accept: text/markdown` negotiation in
   `functions/_middleware.ts`.
6. **Internal hub** (`/internal/*`): dev-only, `InternalLayout`, excluded from
   production three ways (post-build deletion, sitemap filter, noindex).

## Common Mistakes to Avoid

1. **Adding a top-level route without updating `src/middleware.ts`** — the
   allowlist returns 404 in production for unknown paths. Update it in the
   same commit.
2. Adding a surface the protocol does not need (a blog, a channels page, an
   institutional section) — the site is the specification, the registry and
   the validator, and nothing else earns a route.
3. `bg-cabuya-primary text-white` (breaks in dark mode — use the fill pair).
4. `text-cabuya-accent` for text on light (fique fails AA — use
   `-strong`).
5. Raw greys, hex literals, token overrides in components.
6. Hardcoding user-visible strings or a `/es` prefix (derive via
   `getUrlPrefix`).
7. Adding `remark`/`rehype` plugins (Sätteri HAST plugins only).
8. Bumping TypeScript to 7.x (breaks `astro check`).
9. Editing `spec/` normative text without an RFC (editorial fixes excepted;
   the boundary and `spec:check` gates will catch schema/example drift).
10. Hand-writing anything the system generates (schema reference pages, check
    catalogue, llms.txt, measured badge states).
11. Publishing a figure without a named source, or naming a
    person/organization without written opt-in.
12. Placeholder content — `[TODO:]`, `[TBD]`, `[AUTHOR:]`: zero tolerance.
13. Editing files via the `.claude/` symlink (use `.agents/`), or editing the
    vendored packs (`deepworkplan`, `dailybot`, `ai-diff-reviewer`).
14. Weakening or deleting a test to make a gate pass.

## Pre-Commit Checklist

- [ ] `pnpm run test` · `biome:check` · `astro:check` · `build` all pass
- [ ] Content gates green (`md`/`lang`/`seo`/`parity`/`redirects`, `:strict`)
- [ ] Protocol gates green where they exist (`spec:check`, `spec:boundary`,
      `registry:check`, `checks:catalogue`)
- [ ] Both languages updated, natively written; Spanish orthography verified
- [ ] Dark mode verified; tokens only; dimensions on images
- [ ] Every figure sourced; no placeholder markers; no PII in the diff
- [ ] New top-level route added to `src/middleware.ts`
- [ ] `.md` twin updated when page content changed
- [ ] Commit: conventional format, English, `-s` (DCO is CI-enforced)

## Skills, Commands, and Agents (`.agents/`)

`.agents/` is canonical (`.claude` and `.cursor` symlink to it). Skills are
invoked `/name` in Claude Code, `#name` in other agents. When a command is
invoked, **read its procedure file and follow it exactly** — the
[Commands Reference](.agents/docs/COMMANDS_REFERENCE.md) maps names to files.
The catalog of repo skills/agents: [skills_agents_catalog](.agents/docs/skills_agents_catalog.md).
Vendored packs (deepworkplan, dailybot, ai-diff-reviewer) are upstream
artifacts — never edit them here.

## Conventional Commits

`type(scope): description` — types: `feat fix docs content refactor test
chore perf ci build security`. Common scopes: `brand spec registry validator
developers home i18n a11y seo aeo forms nav internal agents gates`. English,
imperative, signed off (`git commit -s`).
