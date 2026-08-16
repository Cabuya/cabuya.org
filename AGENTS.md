# AGENTS.md — Documentation for AI Agents

**Purpose:** Single source of truth for all AI coding assistants (Claude Code, Cursor AI, OpenAI Codex, Google Gemini, GitHub Copilot, and others) operating on the `cabuya.org` codebase.

## Detailed Documentation

| Category | Guide | Purpose |
|----------|-------|---------|
| Architecture | [Architecture](docs/ARCHITECTURE.md) | Components, Content Collections, Svelte integration, project structure |
| Standards | [Standards](docs/STANDARDS.md) | Canonical coding rules, orthography, import order |
| Brand | [Brand Guide](docs/BRAND_GUIDE.md) | Palette, typography, logo usage, voice and tone |
| Design | [Design System](docs/DESIGN.md) | Agent-facing UI contract — `--color-corag-*` tokens, type/spacing/radius scales, component patterns |
| Messaging | [Messaging](docs/MESSAGING.md) | The coraje narrative and where each beat belongs |
| Product | [Product Spec](docs/PRODUCT_SPEC.md) | Vision, audiences, the aid model, success metrics |
| Information architecture | [Information Architecture](docs/INFORMATION_ARCHITECTURE.md) | URL surface, navigation, content relationships |
| Blog | [Blog Posts](docs/features/BLOG_POSTS.md) | Tags, series, hero layouts, images, content lifecycle |
| Blog Lifecycle | [Blog Content Lifecycle](docs/features/BLOG_CONTENT_LIFECYCLE.md) | Draft, scheduled, published, demo visibility |
| Forms | [Forms](docs/features/FORMS.md) | DailyBot intake — contact and conduct |
| Authors | [Authors](docs/features/AUTHORS.md) | Author YAML schema, `AuthorCard`, JSON-LD |
| Contributors | [Contributors](docs/features/CONTRIBUTORS.md) | The team directory |
| Writing Voice | [Writing Voice Guide](docs/WRITING_VOICE_GUIDE.md) | Anti-AI-slop checklist, Corag voice, vocabulary blocklist |
| Content QA | [Content QA Checklist](docs/features/CONTENT_QA_CHECKLIST.md) | Parity, orthography, SEO/AEO, automated gates |
| Writing Craft | [Writing Craft Guide](docs/WRITING_CRAFT_GUIDE.md) | Narrative structure, fact verification, refinement |
| Testing | [Testing](docs/TESTING_GUIDE.md) | Vitest setup, conventions, writing tests |
| Commands | [Development Commands](docs/DEVELOPMENT_COMMANDS.md) | npm scripts, Astro CLI, build workflows |
| i18n | [I18N Guide](docs/I18N_GUIDE.md) | Spanish primary at `/`, English at `/en` |
| Performance | [Performance](docs/PERFORMANCE.md) | Astro SSG optimization, images, caching |
| Accessibility | [Accessibility](docs/ACCESSIBILITY.md) | WCAG AA, measured contrast, ARIA |
| SEO | [SEO](docs/SEO.md) | Meta tags, JSON-LD, hreflang, AEO |
| Security | [Security](docs/SECURITY.md) | Static site + public intake threat model |
| Documentation | [Documentation Guide](docs/DOCUMENTATION_GUIDE.md) | When and how to update docs |
| Analytics | [Analytics](docs/ANALYTICS.md) | Cookieless tracking, GSC, verification |
| Community | [Code of Conduct](docs/CODE_OF_CONDUCT.md) · [Contributing](docs/CONTRIBUTING.md) · [Governance](docs/GOVERNANCE.md) | Operational rules |
| AI Agents | [Agent Onboarding](docs/AI_AGENT_ONBOARDING.md), [Agent Collaboration](docs/AI_AGENT_COLLAB.md) | Setup, handoff, coordination |
| Skills/Agents | [Skills & Agents Catalog](.agents/docs/skills_agents_catalog.md) | Available skills and agents |
| Commands | [Commands Reference](.agents/docs/COMMANDS_REFERENCE.md) | All slash commands with procedure files |

## Project Overview

**Corag** (`cabuya.org`) — the site that explains Corag: what it is, how the aid model works, what gets published, and how to integrate with it.

Corag connects people who need help with people who can give it, and publishes the evidence of every delivery. The name comes from **coraje** — courage. The heart replacing the *o* in the mark carries **love**.

> **This repository is not the application.** Publishing a need, offering help, contributing, and uploading evidence all happen at **`ayuda.cabuya.org`**, which is a separate codebase. Nothing in this repository should ever hold information about a real person's situation.

**Technology Stack:**

- **Astro 7.x** — Static site generator (islands architecture). The Rust `.astro` compiler is the default
- **Sätteri** — the Rust Markdown/MDX compiler, configured via `markdown.processor: satteri({ hastPlugins: [...] })` from `@astrojs/markdown-satteri`. It does **not** run remark/rehype plugins: markdown transforms live in `src/lib/satteri-plugins.ts` as HAST plugins. `@astrojs/mdx` inherits the processor, so `.md` and `.mdx` share one pipeline. **Never** add `markdown.remarkPlugins`/`rehypePlugins` (deprecated) or a `rehype-*` dependency — port the transform to a Sätteri HAST plugin instead
- **Svelte 5.x** — Interactive components (with `client:visible`/`client:idle`/`client:only` hydration directives)
- **TypeScript 6.x** — **Pinned to 6.x on purpose:** TypeScript 7's native compiler does not yet expose the programmatic API `astro check` relies on, so upgrading breaks the type-check gate. Do not bump until [withastro/roadmap#1321](https://github.com/withastro/roadmap/discussions/1321) ships
- **Tailwind CSS 4.x** — Utility-first styling with the Corag `@theme` token system
- **Biome 2.x** — Linter and formatter (replaces ESLint + Prettier)
- **MDX** — Enhanced Markdown for blog posts
- **Cloudflare Pages** — Hosting; Cloudflare Pages Functions for the intake forms

## Project Structure

> Full tree: **[Architecture Guide](docs/ARCHITECTURE.md#project-structure)**

```
src/
├── components/
│   ├── pages/                 # One *Page.astro per route + InstitutionalPage
│   ├── blog/                  # BlogCard, BlogGrid, Search, SeriesNav
│   ├── home/                  # Homepage sections
│   ├── layout/                # Header.svelte, MobileMenu.svelte, ThemeToggle
│   ├── contact/               # ContactForm, ConductReportForm
│   ├── cards/ ui/             # ContributorCard; Section, Eyebrow, Breadcrumbs, …
│   └── agent/                 # WebMCPBridge
├── content/
│   ├── blog/{es,en}/          # Posts (YYYY-MM-DD_slug.md), English slugs both sides
│   ├── pages/{es,en}/         # Markdown twins; conduct/governance/contributing
│   │                          # are ALSO the live page bodies
│   ├── authors/               # YAML, one per author
│   ├── channels/              # Official channel inventory
│   ├── contributors/          # The team directory
│   ├── tags/ series/          # Three-tier taxonomy + series definitions
│   └── notifications/         # Top banner, date-bounded
├── layouts/                   # MainLayout, InternalLayout, ShowcaseLayout
├── lib/                       # blog.ts, i18n.ts, translations/, markdown-for-agents.ts, …
├── pages/
│   ├── (root ES routes)       # /, /about, /how-it-works, /transparency, …
│   ├── en/                    # Mirror in English
│   ├── internal/              # Dev-only hub (brand book, design system)
│   └── api/                   # JSON endpoints (search index)
└── styles/                    # global.css (Tailwind 4 @theme Corag tokens)

functions/                      # Cloudflare Pages Functions (intake, agent endpoints)
public/images/                  # brand · blog · home
scripts/                        # Gate scripts and build utilities
docs/                           # Project documentation
.agents/                        # Cross-agent skills, commands, agents, settings (canonical)
.claude → .agents               # Backward-compat symlink for Claude Code
.dwp/                           # Deep Work Plan outputs (git-ignored)
tmp/                            # Temporary workspace (git-ignored)
```

## Temporary Workspace (`tmp/`)

The `tmp/` directory is a **git-ignored scratch space** for agents and developers.

**Use it for:** temporary prompts, outputs, drafts, one-off analysis results, debug logs, ephemeral files.

**Rules:** Everything inside `tmp/` is ignored by git (except `.gitkeep`). Do NOT store anything permanent here. When a user asks for a temporary file or scratch artifact, **write it to `tmp/`**.

## Skills, Commands, and Agents (`.agents/`)

The `.agents/` directory is the **canonical, cross-agent home** for everything that defines how AI assistants behave in this repo: skills, slash commands, agent definitions, internal documentation, and settings.

```
.agents/
├── agents/        # Agent definitions (architect, executor, reviewer, ...)
├── commands/      # Slash commands (commit, pr, branch, dwp-*, ...)
├── skills/        # Skill procedures (add-blog-post, fix-lint, ...)
├── docs/          # Catalogs and references
├── README.md      # Conventions for authoring skills, agents, and commands
├── settings.json  # Claude Code env
└── settings.local.json # Claude Code local permissions (git-tracked)
```

**Backward compatibility — `.claude/` symlink:** `.claude` is a symlink to `.agents`. Use `.agents/...` as the canonical path in **all new documentation, prompts, and skill/command files**. Do not edit files via the `.claude/` symlink.

## CRITICAL: Mandatory Requirements

### 0. Never publish a claim you cannot back

This one outranks the rest, because it is the argument the project makes.

Corag's whole proposition is that unverified numbers are the problem. A page, a post or a metadata string that invents a statistic, endorses an organization we have not verified, or promises a channel we do not run does more damage than a weaker version that stays honest.

Concretely:

- **No fabricated figures.** If a case needs numbers we do not have, describe the shape of the thing and say the numbers are not ours.
- **No endorsements we cannot maintain.** We do not publish lists of "trustworthy organizations"; we publish the method for verifying one.
- **State the limit.** "The public specification is not published yet" is better copy than an evasion.
- **Social channels are Facebook, Instagram and the WhatsApp group.** Nothing else exists. Do not write a CTA to a channel we do not run.

### 1. Language Standards

**ALL code, comments, and documentation MUST be in English.** Always update documentation after important changes. Public content is written in Spanish first, with English as a first-class rendition.

### 2. Orthography & Diacritical Marks (MANDATORY)

**All user-facing text MUST use proper orthography.** Spanish content MUST include ñ (e.g., `pequeño`, `diseño`, `español`, `compañero`, `mañana`), accented vowels (`análisis`, `código`, `página`, `versión`, `próximo`), and interrogative accents (`cómo`, `qué`, `cuál`, `dónde`, `cuándo`).

**Quick validation** before committing Spanish text:

```bash
grep -rn 'pequeno\|tamano\|diseno\|espanol\|manana\|companer' src/content/ src/lib/translations/es.ts
grep -rn 'analisis\|numero\|codigo\|ejecucion\|version\|pagina\|titulo\|proximo' src/content/ src/lib/translations/es.ts
```

If any match is found, fix it before committing. Full word lists in **[Standards Guide](docs/STANDARDS.md)**.

### 3. Import Order Convention (MANDATORY)

```typescript
// 1. Node.js native modules
import { dirname, resolve } from 'node:path';

// 2. Third-party packages
import { defineConfig } from 'astro/config';
import { z } from 'astro:content';

// 3. Internal project modules (using @ alias)
import Header from '@/components/layout/Header.svelte';
import { SITE_TITLE } from '@/lib/constances';
import { getTranslations } from '@/lib/translations';

// 4. Type imports (separate group)
import type { APIRoute } from 'astro';
import type { CollectionEntry } from 'astro:content';
```

### 4. Type Hints (RECOMMENDED)

Prefer explicit types on function signatures. Biome allows `any` for flexibility, but explicit types are better. See **[Standards Guide](docs/STANDARDS.md)**.

### 5. Code Quality (MANDATORY)

```bash
pnpm run biome:check        # Check linting and formatting
pnpm run biome:fix          # Auto-fix issues
pnpm run biome:fix:unsafe   # Fix with unsafe transformations
```

**DO NOT use ESLint or Prettier** — this project uses Biome exclusively.

### 6. Testing

```bash
pnpm run test           # Run all tests (single run)
pnpm run test:watch     # Watch mode
pnpm run test:coverage  # With coverage report
```

Tests use `*.test.ts` naming in `tests/unit/`. Coverage target: 80%+ on `src/lib/`. See **[Testing Guide](docs/TESTING_GUIDE.md)**.

### 7. Multilingual Content Synchronization (MANDATORY)

**ALL content changes MUST be synchronized across both languages (Spanish primary, English international).** No exceptions.

**Content type rules:**

- **Pages:** Create 1 shared `*Page.astro` in `src/components/pages/` + thin 3-line wrappers in `src/pages/` (Spanish, served at `/`) and `src/pages/en/` (English, served at `/en`) passing `lang` as a string literal.
- **Institutional pages:** Add an `InstitutionalPageCopy` to both locale files and point both wrappers at `InstitutionalPage.astro`. The `.md` twin serializes from the same copy object, so it cannot drift.
- **Blog Posts:** Both `src/content/blog/es/` and `src/content/blog/en/` MUST have the equivalent post, sharing the English slug and the date prefix. Translate `title`, `description`, body. Preserve `pubDate`, `heroImage`, `tags`, `author`, code blocks. **Use `/add-blog-post` for new posts.**
- **Authors / Contributors / Channels:** YAML with localized `role`/`bio`/`description` (`en`/`es` keys required by schema).
- **Translation Strings:** Add to BOTH `src/lib/translations/en.ts` and `es.ts`. `types.ts` makes both exhaustive, so a missing key is a type error.
- **Components:** Use `getTranslations(lang)`. **Never hardcode user-visible strings.**
- **Agent-Friendly Markdown (MANDATORY):** When page or translation content changes, update the corresponding `src/content/pages/{en,es}/*.md`. See **[Markdown for Agents](docs/aeo/MARKDOWN_FOR_AGENTS.md)**.

**Compliance checklist:**

- [ ] Pages exist in both `src/pages/` (ES, root) and `src/pages/en/` (EN)
- [ ] Blog posts exist in both `src/content/blog/es/` and `src/content/blog/en/`
- [ ] The English title is real English, not the Spanish title with a word swapped
- [ ] Same `author` slug used in both versions of a post
- [ ] UI strings in both `en.ts` and `es.ts`
- [ ] No hardcoded user-visible text
- [ ] Page Markdown twins updated in both languages
- [ ] `pnpm run parity:check` clean — the two languages carry the **same content**, not merely correct content in each

**Tools:** `/translate-sync` skill, `i18n-guardian` agent. Adding a new language: **[I18N Guide](docs/I18N_GUIDE.md)**.

### 8. Brand & Design Tokens (MANDATORY)

1. The Corag palette is declared **once**, in `src/styles/global.css` via Tailwind 4 `@theme`. Every colour on the site comes from a `--color-corag-*` token.
2. **Never set `--color-corag-*` variables outside `src/styles/global.css`.** No inline `style="--color-corag-primary: …"` on components.
3. **The brand foreground flips in dark mode; the fill pair does not.** `--color-corag-primary` becomes rosa on dark; `--color-corag-fill` / `--color-corag-on-fill` stay fixed because they are a measured 9.54:1 pair in both themes. Pairing `bg-corag-primary` with `text-white` is the bug this split exists to prevent.
4. `--color-corag-accent` **fails WCAG AA on every light ground** — reserve it for icons, large text and decorative motifs. Use `--color-corag-accent-strong` when it must carry text.
5. Every documented token appears on `/internal/ui/colors`, which reads the computed values at runtime. `tests/unit/lib/design-tokens.test.ts` fails if a token is declared and not shown, or shown and not declared.

Full reference: **[Brand Guide](docs/BRAND_GUIDE.md)** + **[Design System](docs/DESIGN.md)** + the dev-only **[`/internal/brand`](http://localhost:7777/internal/brand)**.

### 9. Performance-First Mindset (MANDATORY)

1. **Prefer static over dynamic** — use `.astro` for non-interactive content
2. **Choose the laziest hydration** — `client:visible` or `client:idle` over `client:load`
3. **Minimize JavaScript** — prefer CSS-only solutions
4. **Use native browser APIs** — IntersectionObserver over scroll listeners, native `loading="lazy"`
5. **Optimize images** — always include dimensions, lazy load below-fold content
6. **Avoid layout shifts** — reserve space for async content, `font-display: swap`
7. **Keep search payload lean** — language-sharded endpoints, minimal index schema
8. **Protect Lighthouse scores** — run `pnpm run search:budgets` after search changes

See **[Performance Guide](docs/PERFORMANCE.md)**.

### 10. Accessibility Standards (MANDATORY)

1. **WCAG AA contrast** — 4.5:1 normal text, 3:1 large text and non-text UI
2. **Approved text colours** — the `--color-corag-*` tokens. **NEVER** `text-gray-400`, `text-gray-500`, `dark:text-gray-400`, `dark:text-gray-500`
3. **Image dimensions** — every `<img>` must have `width` and `height`
4. **Semantic HTML** — proper heading hierarchy, landmarks, button vs link
5. **Text alternatives** — meaningful `alt` for informative images, `alt=""` for decorative
6. **Keyboard navigation** — all interactive elements focusable and operable
7. **ARIA** — disclosure pattern for nav dropdowns (not `role="menu"`)
8. **Reduced motion** — all non-essential animations honour `prefers-reduced-motion: reduce`

See **[Accessibility Guide](docs/ACCESSIBILITY.md)**.

### 11. Analytics Verification Policy (MANDATORY)

1. Do not add or reintroduce `PUBLIC_GOOGLE_SITE_VERIFICATION`
2. Do not add `google-site-verification` meta tags in templates/components
3. Keep Bing verification as an optional env-based meta tag (`PUBLIC_BING_SITE_VERIFICATION`)
4. GSC verification is DNS-only (Domain property DNS TXT)

## Shared Agent Coordination

Multiple AI agents collaborate on this codebase. When updating agent guidance, mirror changes across all relevant files. See **[AI Agent Collaboration](docs/AI_AGENT_COLLAB.md)**.

### DWP Security Review augmentation — AI Diff Reviewer addon (optional, local-only / Flow A)

The [AI Diff Reviewer addon](.agents/skills/deepworkplan/addons/ai-diff-reviewer/SKILL.md) is installed in **Flow A (local-only)**: vendored skill at `.agents/skills/ai-diff-reviewer/` + a repo-tailored `.review/extension.md`. The mandatory DWP **Security Review** task gains an additional local-review step — invoke *"Review my current branch"*, then append the verdict + findings table under `## AI Diff Reviewer local review` in `analysis_results/SECURITY_REVIEW.md`. A `critical` finding blocks until fixed or explicitly accepted; `warning`/`info` are reported but do not block. Best-effort and **never-block** — skipped (with one warning) if the skill or extension is absent. **No CI workflow** is installed (Flow B deferred); Flow A needs **no** provider secret.

## Quick Commands

```bash
pnpm run dev                # Dev server (http://localhost:7777)
pnpm run build              # Production build (astro check && astro build)
pnpm run astro:preview      # Preview production build
pnpm run biome:check        # Lint and format check
pnpm run biome:fix          # Auto-fix lint issues
pnpm run astro:check        # TypeScript type checking
pnpm run test               # Run unit tests
pnpm run test:coverage      # Tests with coverage
pnpm run images:optimize    # Process staged images
pnpm run md:check           # Verify every page has a COMPLETE .md twin
pnpm run md:check:strict    # Same; exits 1 on failure (CI gate)
pnpm run lang:check         # Sitewide language-integrity audit (ES at /, EN at /en)
pnpm run lang:check:strict  # Same; exits 1 on failure (CI gate)
pnpm run seo:check          # Per-URL SEO + structured-data audit
pnpm run seo:check:strict   # Same; exits 1 on failure (CI gate)
pnpm run parity:check       # ES and EN carry the SAME content
pnpm run parity:check:strict # Same; exits 1 on failure (CI gate)
pnpm run redirects:check    # Every redirect resolves; no live page shadowed
pnpm run redirects:check:strict # Same; exits 1 on failure (CI gate)
pnpm run search:budgets     # Search payload budgets
pnpm run lighthouse         # Lighthouse audit
pnpm run release            # Bump version and release commit
pnpm run ncu:check          # Check for package updates
```

Full command reference: **[Development Commands](docs/DEVELOPMENT_COMMANDS.md)**.

## Architecture Patterns

> Full patterns with code examples: **[Architecture Guide](docs/ARCHITECTURE.md)**

### 1. Astro Components

`.astro` files are the foundation. The script block runs at build time. Use for all non-interactive content. Svelte is only for interactive components.

```astro
---
interface Props {
  title: string;
  count?: number;
}
const { title, count = 5 } = Astro.props;
---

<section class="py-12">
  <h2 class="text-2xl font-bold text-corag">{title}</h2>
</section>
```

### 2. Content Collections

All structured content (blog, pages, authors, channels, contributors, tags, series, notifications) uses Astro Content Collections with Zod schemas in `src/content.config.ts`.

### 3. Svelte Integration

Use Svelte for interactive components. Always include a `client:*` directive (`client:visible` preferred over `client:load`).

### 4. Page Wrapper Pattern (MANDATORY)

Pages in `src/pages/` are ultra-minimal 3-line routing wrappers. All logic lives in `*Page.astro` components in `src/components/pages/`.

**Key rules:**

- Page components handle `MainLayout` internally — wrappers **never** import `MainLayout`
- The `lang` prop is passed as a **string literal** (`"en"`, `"es"`), not a variable
- For a new page: create **1 `*Page.astro` component** + **2 thin wrappers**
- All user-visible text uses `getTranslations(lang)`, all URLs use `getUrlPrefix(lang)`

**Wrapper** (`src/pages/about.astro` — 3 lines):

```astro
---
import AboutPage from '@/components/pages/AboutPage.astro';
---
<AboutPage lang="es" />
```

### 5. i18n Routing

Spanish pages at root (`src/pages/` → `/`), English in `src/pages/en/` (→ `/en`). Language is **URL-first**: there is no automatic redirect from browser language or `localStorage`. Route slugs are **English in both languages**. Never hardcode a `/en` prefix — derive it from `getUrlPrefix(lang)`.

### 6. Institutional pages

The seven pages under "How Corag works" share one renderer. Their copy is an `InstitutionalPageCopy` in each locale file, and `serializeInstitutionalPageToMarkdown` produces the `.md` twin from the same object — so the twin cannot fall behind the page.

### 7. Internal Hub (Dev-Only)

Dev-only portal at `/internal/`. Uses `InternalLayout` or `ShowcaseLayout` (never `MainLayout`). English-only, no Page Wrapper pattern. Excluded from production builds via three layers (post-build deletion, sitemap filter, noindex meta).

## Blog Post Conventions

> Full reference: **[Blog Posts Guide](docs/features/BLOG_POSTS.md)**

**File naming:** `YYYY-MM-DD_slug.{md,mdx}` in `src/content/blog/{es,en}/`. Date prefix stripped from URLs. **Slugs MUST always be in English** — both versions use the same one.

**Tags:** Flat `tags` array in frontmatter. Three tiers (primary / secondary / subtopic) resolved at build time from `src/content/tags/*.md`. Max 5 tags per post (1-2 primary + 0-3 secondary + 0-3 subtopic; ≥ 1 primary required). Never auto-create tags without user approval — propose with [`/audit-taxonomy`](.agents/skills/audit-taxonomy/SKILL.md).

**Series:** Posts reference `series: "{slug}"` and `seriesOrder: {n}`. **Series slugs MUST be in English.**

**Authors:** Posts reference `author: "{slug}"`, defined as YAML in `src/content/authors/{slug}.yaml` with localized `role`/`bio`. Both versions of a post use the same slug.

**Resources section:** Include external links. Do NOT list related articles or previous chapters — the series navigation covers that.

**Hero layouts:** `banner` (default, landscape), `side-by-side` (square), `minimal` (thumbnail), `none` (text-only).

**Images:** Stored in `public/images/blog/posts/{slug}/`. Hero: `hero.webp` plus the 480/768/1280 responsive set. Provenance for any third-party image is recorded in `public/images/blog/posts/CREDITS.json`.

**New post workflow:** Use `/add-blog-post` (mandatory). Do not create blog post files manually.

## Documentation Standards

Update docs after: adding components/pages, changing schemas, updating config, adding npm scripts, establishing patterns. See **[Documentation Guide](docs/DOCUMENTATION_GUIDE.md)**.

## Common Mistakes to Avoid

### DON'T:

1. Put interactive logic in `.astro` files (use Svelte)
2. Skip the `client:*` directive for interactive Svelte components
3. Import `MainLayout` in page wrappers (it belongs inside `*Page.astro`)
4. Hardcode translatable text in templates
5. Create content in only one language
6. Use `client:load` when `client:visible` or `client:idle` would suffice
7. Add JS where CSS achieves the same result
8. Use `text-gray-400`, `dark:text-gray-400`, or `dark:text-gray-500` for body text (fails WCAG AA)
9. Use `role="menu"` for nav dropdowns (use the disclosure pattern)
10. Skip heading levels (e.g. h1 → h3 without h2)
11. Forget `alt=""` on decorative images or `aria-label` on icon-only links
12. Use `MainLayout` for internal hub pages
13. Reference `/internal/` pages from public pages
14. Name blog files without the date prefix (`YYYY-MM-DD_slug.md`)
15. Put blog images outside `public/images/blog/posts/{slug}/`
16. Write Spanish content without proper accents and ñ
17. **Leave placeholder content** — `[AUTHOR: …]`, `[TODO: …]`, `[TBD]`. Zero tolerance
18. **Use Spanish slugs** for blog posts, series or routes — all slugs MUST be in English
19. **Override `--color-corag-*` tokens outside `src/styles/global.css`**
20. Pair `bg-corag-primary` with `text-white` — use the `fill` / `on-fill` pair
21. Use `--color-corag-accent` for body text — it fails WCAG AA on light grounds
22. **Add a new top-level page without updating `src/middleware.ts`** — the middleware has a hardcoded allowlist (`KNOWN_ROOT_PATHS` / `KNOWN_EN_PATHS`). New top-level routes return 404 in production until added
23. **Change page copy without updating its `.md` twin**
24. **Publish a figure you cannot back**, or endorse an organization we have not verified
25. Write a CTA to a channel we do not run

### DO:

1. Use Biome for linting (`pnpm run biome:check` before commits)
2. Use Svelte for interactive components with the lightest `client:*` directive
3. Support dark mode through the Corag token layer
4. Use the `@` path alias for imports
5. Use the Page wrapper pattern (thin wrappers + `*Page.astro`)
6. Create content in both languages
7. Use the `--color-corag-*` tokens for every colour
8. Include `width` and `height` on all `<img>` elements
9. Use date-prefix naming for blog posts
10. Verify Spanish diacritical marks before committing
11. Ensure no placeholder content (`grep -rn '\[AUTHOR:\|\[AUTOR:\|\[TODO:\|\[TBD\]\|\[FIXME\]' src/content/` → zero matches)
12. Add both language versions of every post
13. State the limit when there is one, rather than writing around it

## Pre-Commit Checklist

- [ ] All code in English
- [ ] `pnpm run test` passes
- [ ] `pnpm run biome:check` passes
- [ ] `pnpm run astro:check` passes
- [ ] `pnpm run build` succeeds
- [ ] `pnpm run md:check` passes — every page has a **complete** `.md` twin, not a summary
- [ ] `pnpm run lang:check` reports 0 flagged pages
- [ ] `pnpm run seo:check` reports 0 flagged URLs
- [ ] `pnpm run parity:check` reports 0 content-loss and 0 structural findings
- [ ] `pnpm run redirects:check` reports 0 dead destinations and 0 shadowed pages
- [ ] Dark mode works in new components
- [ ] Content in both languages
- [ ] Translation strings in both locale files
- [ ] Spanish content has correct diacritical marks
- [ ] No placeholder content (`[AUTHOR:`, `[TODO:`, …)
- [ ] Meta descriptions: 130-160 characters
- [ ] Accessibility: token text colours, image dimensions, heading hierarchy
- [ ] Performance: lightest hydration, minimal JS
- [ ] Corag tokens used, no raw greys
- [ ] Every figure in new copy is one we can back
- [ ] New top-level route added to `src/middleware.ts`
- [ ] Commit message in English (conventional format)

## Skills & Agents

- **Skills** — Reusable procedures via slash commands: `quick-fix`, `doc-edit`, `pr-review-lite`, `fix-lint`, `write-tests`, `type-fix`, `refactor-safe`, `security-check`, `git-commit-push`, `translate-sync`, `add-blog-post`, `add-page`, `add-component`, `promote-post`, `optimize-image`, `audit-post`, `audit-series`, `audit-taxonomy`, `audit-analytics`, `audit-language-integrity`, `audit-content-parity`
- **Agents** — Specialized workers: `reviewer`, `executor`, `architect`, `security-auditor`, `i18n-guardian`, `content-writer`
- **Critical policy:** New blog posts MUST use `/add-blog-post`
- **Management:** `/skill-list`, `/agent-list`, `/skill-create`, `/agent-create`
- **Full catalog:** [Skills & Agents Catalog](.agents/docs/skills_agents_catalog.md)

### Execution Modes

| Mode | Support | Description |
|------|---------|-------------|
| Sequential | All agents | Default — tasks one at a time |
| Subagents | Claude Code | Helper agents within session |
| Team Agents | Claude Code only | Parallel instances with shared coordination |
| Orchestrator | All agents | Child DWPs in sub-repos |

## Slash Commands (All Agents)

> **New here?** Run **`/setup`** first (`#setup` outside Claude Code). It is a
> doctor: it scaffolds the git-ignored local config (`.env`, `.dev.vars`,
> `.devcontainer/`), checks the toolchain, and tells you whether the project
> actually runs. Idempotent — safe to re-run any time.

**This section applies to ALL agents** — Claude Code, OpenAI Codex, Cursor AI, Gemini, and any other assistant.

### How to Invoke Commands

| Agent | Prefix | Example |
|-------|--------|---------|
| **Claude Code** | `/` (native) | `/add-blog-post` |
| **OpenAI Codex** | `#` | `#add-blog-post` |
| **Cursor AI** | `#` | `#add-blog-post` |
| **Gemini / others** | `#` | `#add-blog-post` |

> **Why `#` for non-Claude agents?** Most AI CLIs intercept `/` as their own system commands. Using `#` avoids interception. You can also write the command name in plain text.

When a command is invoked (via `/`, `#`, or by name), the agent MUST:

1. **Look up** the command in **[Commands Reference](.agents/docs/COMMANDS_REFERENCE.md)** to find its procedure file
2. **READ** the linked procedure file completely
3. **FOLLOW** its step-by-step instructions exactly
4. **DO NOT** improvise or skip steps — the procedure file IS the spec

## Conventional Commits

**Format:** `<type>(<scope>): <description>`

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `content`

**Common scopes:** `brand`, `blog`, `pages`, `i18n`, `a11y`, `seo`, `aeo`, `forms`, `home`, `nav`, `docs`, `agents`

Examples:

- `feat(pages): build the seven institutional pages`
- `content(blog): migrate posts 12-17 of the corag.org archive`
- `fix(a11y): resolve contrast on the navigation dropdown`
- `refactor(forms): rework intakes for the Corag intent set`
