# Documentation Index

Documentation for **cabuya.org** — the site that explains Corag, and the surface
agents read to understand it. The application itself (`ayuda.cabuya.org`) is a
separate codebase; this repository never holds a real person's need.

## Quick navigation

### Getting started

| Document | Description |
|----------|-------------|
| [AI Agent Onboarding](AI_AGENT_ONBOARDING.md) | Quick start for AI coding assistants |
| [Development Commands](DEVELOPMENT_COMMANDS.md) | Scripts and CLI reference |
| [Standards](STANDARDS.md) | Coding conventions, orthography, import order |
| [Environment Setup](ENVIRONMENT_SETUP.md) | Local environment and required variables |

### Product and design

| Document | Description |
|----------|-------------|
| [Product Spec](PRODUCT_SPEC.md) | What Corag is, who it serves, how the model works |
| [Messaging](MESSAGING.md) | The coraje narrative and where each beat belongs |
| [Brand Guide](BRAND_GUIDE.md) | Palette, typography, logo, voice, and the rules that bind them |
| [Design System](DESIGN.md) | The `--color-corag-*` token contract and component patterns |
| [Information Architecture](INFORMATION_ARCHITECTURE.md) | URL surface, navigation, content relationships |

### Engineering

| Document | Description |
|----------|-------------|
| [Architecture](ARCHITECTURE.md) | Components, collections, routing, layout patterns |
| [Testing Guide](TESTING_GUIDE.md) | Vitest setup and conventions |
| [I18N Guide](I18N_GUIDE.md) | Spanish at `/`, English at `/en`, and the parity contract |
| [Performance](PERFORMANCE.md) | SSG optimisation, images, hydration budget |
| [Accessibility](ACCESSIBILITY.md) | WCAG AA, measured contrast, ARIA patterns |
| [Security](SECURITY.md) | Threat model for a static site with public intake forms |
| [SEO](SEO.md) | Metadata, structured data, hreflang |
| [Analytics](ANALYTICS.md) | Cookieless tracking and verification |

### Content

| Document | Description |
|----------|-------------|
| [Blog Posts](features/BLOG_POSTS.md) | Tags, series, hero layouts, lifecycle |
| [Blog Content Lifecycle](features/BLOG_CONTENT_LIFECYCLE.md) | End-to-end publishing workflow |
| [Content QA Checklist](features/CONTENT_QA_CHECKLIST.md) | Parity, orthography, SEO gates |
| [Writing Voice Guide](WRITING_VOICE_GUIDE.md) | Voice, anti-slop checklist, vocabulary blocklist |
| [Writing Craft Guide](WRITING_CRAFT_GUIDE.md) | Structure, fact verification, quote handling |
| [Authors](features/AUTHORS.md) | Author YAML, `AuthorCard`, JSON-LD |
| [Contributors](features/CONTRIBUTORS.md) | The team directory |
| [Forms](features/FORMS.md) | Contact and conduct intake through DailyBot |

### Policies

| Document | Description |
|----------|-------------|
| [Code of Conduct](CODE_OF_CONDUCT.md) | Pointer to the live page, plus what applies to this repo |
| [Governance](GOVERNANCE.md) | The three levels, the evidence pipeline, what is unsettled |
| [Contributing](CONTRIBUTING.md) | How to open a pull request that passes the gates |

### Agents

| Document | Description |
|----------|-------------|
| [AI Agent Collaboration](AI_AGENT_COLLAB.md) | Multi-agent coordination |
| [Markdown for Agents](aeo/MARKDOWN_FOR_AGENTS.md) | The `.md` twin contract |
| [AEO Queries](aeo/QUERIES.md) | Target queries mapped to answering URLs |
| [AEO Checklist](aeo/CHECKLIST.md) | Recurring verification pass |
| [DNS-AID](aeo/DNS_AID.md) | DNS records for agent discovery |
| [Documentation Guide](DOCUMENTATION_GUIDE.md) | When and how to update docs |

## Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Astro** | 7.x | Static site generator, islands architecture |
| **Svelte** | 5.x | Interactive components |
| **TypeScript** | 6.x | Pinned deliberately — see `AGENTS.md` |
| **Tailwind CSS** | 4.x | Utility styling over the `@theme` token layer |
| **Biome** | 2.x | Lint and format. Never ESLint or Prettier |
| **MDX** | 7.x | Enhanced Markdown, sharing the Sätteri pipeline |

## Project structure

```
cabuya.org/
├── src/
│   ├── components/
│   │   ├── pages/          # One *Page.astro per route, incl. InstitutionalPage
│   │   ├── blog/           # Cards, grid, search, series navigation
│   │   ├── layout/         # Header, MobileMenu, ThemeToggle (Svelte)
│   │   ├── contact/        # ContactForm, ConductReportForm
│   │   └── ui/             # Section, Eyebrow, Breadcrumbs, Badge, Pill
│   ├── content/
│   │   ├── blog/{es,en}/   # Posts, date-prefixed, English slugs in both
│   │   ├── pages/{es,en}/  # Markdown twins; conduct/governance/contributing
│   │   │                   # are ALSO the live page bodies
│   │   ├── authors/        # Author YAML
│   │   ├── channels/       # Official channel inventory
│   │   ├── tags/           # Three-tier taxonomy
│   │   └── series/         # Multi-part collections
│   ├── layouts/            # MainLayout, InternalLayout, ShowcaseLayout
│   ├── lib/                # blog, i18n, translations, markdown-for-agents, …
│   ├── pages/              # 3-line wrappers; /en mirror; /internal dev-only
│   └── styles/             # global.css — the --color-corag-* @theme layer
├── functions/              # Cloudflare Pages Functions (contact intake, agent)
├── public/                 # Static assets, _redirects, llms.txt, .well-known
├── scripts/                # Gate scripts and build utilities
├── docs/                   # This folder
├── .agents/                # Skills, commands, agent definitions (.claude symlinks here)
└── .dwp/                   # Deep Work Plan outputs (git-ignored)
```

## Content collections

Defined in `src/content.config.ts`:

- **blog** — posts with `title`, `description`, `pubDate`, `heroImage`, `tags`,
  `series`, `author`. One file per language, sharing an English slug.
- **pages** — the Markdown twin of every page. Three of them (`conduct`,
  `governance`, `contributing`) are also rendered as the live page bodies, so
  editing them changes the site, not only the agent surface.
- **tags** — three tiers (primary / secondary / subtopic), resolved at build.
- **series** — multi-part collections.
- **authors** — YAML with localized `role` and `bio`.
- **channels** — the official channel inventory.
- **contributors** — the team directory.
- **notifications** — the top banner, with a start and end date.

## Non-obvious things that will catch you

- **New top-level routes must be added to `src/middleware.ts`.** A route missing
  from the allowlist works in dev and 404s in production.
- **The `.md` twin gate measures completeness, not existence.** A summary fails.
- **`parity:check` compares the two languages against each other**, not each
  against correctness. A paragraph added to one side and not the other fails.
- **Route slugs are English in both languages.** Spanish is served unprefixed.
- **DailyBot form UUIDs are baked into `functions/api/_dailybot.ts`.** Only
  `DAILYBOT_API_KEY` is env-bound; without it the intake returns 503 and sends
  nothing, by design.

## Commands

```bash
pnpm run dev                 # http://localhost:7777
pnpm run build               # astro check && astro build
pnpm run biome:check         # lint + format
pnpm run astro:check         # types
pnpm run test                # unit tests
pnpm run md:check:strict     # complete .md twin per page
pnpm run lang:check:strict   # ES at /, EN at /en
pnpm run seo:check:strict    # metadata and structured data
pnpm run parity:check:strict # both languages carry the same content
pnpm run redirects:check:strict # no redirect breaks a live page
```

Full reference in [Development Commands](DEVELOPMENT_COMMANDS.md).

## For AI agents

1. Read [AGENTS.md](../AGENTS.md) — the binding rules.
2. Read [AI Agent Onboarding](AI_AGENT_ONBOARDING.md) — the short checklist.
3. Follow [Standards](STANDARDS.md).
4. Browse `/internal/brand` and `/internal/ui` in dev — the running system is
   the canonical reference for tokens and components, not this folder.
