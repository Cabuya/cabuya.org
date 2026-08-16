# AI Agent Onboarding

Quick start guide for AI coding assistants (Cursor AI, Claude Code, ChatGPT, Gemini, etc.) working on Corag.

## Tech Stack Overview

| Technology | Version | Purpose |
|------------|---------|---------|
| **Astro** | 7.x | Static site generator (islands architecture) |
| **Svelte** | 5.x | Interactive components |
| **TypeScript** | 6.x | Pinned on purpose — see `AGENTS.md` |
| **Tailwind CSS** | 4.x | Utility styling over the `@theme` token layer |
| **Biome** | 2.x | Linter and formatter |
| **MDX** | 7.x | Enhanced Markdown for the blog |

## Project Type

- **cabuya.org** — the site that explains Corag: what it is, how the model works,
  and how to integrate with it. The application lives at `ayuda.cabuya.org` and is
  a separate codebase.
- **Static Site Generation (SSG)** — builds to static HTML
- **Two languages** — Spanish at `/` (primary), English under `/en`. All slugs
  are English in both.
- **No personal data here.** If something holds information about a real
  person's need, it belongs in the application, not in this repository.
- **Deployed to** Cloudflare Pages, with Pages Functions for the intake forms

## Repository Structure

```
cabuya.org/
├── src/
│   ├── components/      # UI components (.astro, .svelte)
│   ├── content/         # Content Collections (blog, pages, authors, channels, contributors, tags, series, notifications)
│   ├── layouts/         # Page layouts (MainLayout, InternalLayout, ShowcaseLayout)
│   ├── lib/             # Utilities and types
│   ├── pages/           # File-based routing (ES at root, EN under /en, /internal dev-only)
│   └── styles/          # Tailwind 4 theme tokens (--color-corag-*)
├── public/              # Static assets (.well-known/, openapi.json, robots.txt)
├── docs/                # Documentation
├── .agents/             # Skills (incl. the deepworkplan skill), commands, agent definitions
└── .dwp/                # Deep Work Plan outputs — plans/ + drafts/ (git-ignored)
```

## Critical Rules (MUST FOLLOW)

### 1. Language

**ALL code MUST be in English** - variables, comments, commits, docs.

### 2. Code Quality

**Use Biome** (NOT ESLint/Prettier):

```bash
pnpm run biome:check    # Check issues
pnpm run biome:fix      # Auto-fix
```

### 3. TypeScript

**Run type checking**:

```bash
pnpm run astro:check
```

### 4. Import Order

```typescript
// 1. Node.js native
import { dirname } from 'node:path';

// 2. Third-party
import { getCollection } from 'astro:content';

// 3. Internal (@ alias)
import Header from '@/components/layout/Header.svelte';

// 4. Types
import type { CollectionEntry } from 'astro:content';
```

### 5. Components

- **Astro** (`.astro`) - Static content
- **Svelte** (`.svelte`) - Interactive components

```astro
<!-- Hydrate Svelte for interactivity. Prefer client:visible or client:idle;
     client:load only when the component is above the fold. -->
<Header client:load lang={lang} />
```

### 6. Dark Mode

Always support dark mode:

Use the design tokens, not raw greys:

```html
<div class="bg-corag-bg text-corag">
```

The token layer already resolves light and dark. Reaching for `bg-white
dark:bg-gray-900` bypasses it and produces a surface that does not match the
rest of the page. See [Design System](DESIGN.md).

### 7. Blog Post Creation Workflow

New blog posts MUST be created with the `/add-blog-post` skill (not manual file scaffolding).

- Create both language files in the same task: `src/content/blog/en/` and `src/content/blog/es/`
- Use date-prefix naming: `YYYY-MM-DD_slug.md`
- Keep frontmatter synchronized across languages (`pubDate`, `heroImage`, `heroLayout`, `tags`, `series`, `seriesOrder`)
- Validate with `pnpm run build`

### 8. New top-level routes need a middleware entry

`src/middleware.ts` holds a hardcoded allowlist. A route missing from it works
in dev and returns 404 in production — add the path to `KNOWN_ROOT_PATHS` and,
if it has an English version, to `KNOWN_EN_PATHS`.

### 9. Blog Search Performance Guardrails

- Keep search static-only and language-sharded (`/api/posts-en.json`, `/api/posts-es.json`)
- Do **not** inline full search index data into blog listing/tag page HTML
- Keep search index metadata-only (no full markdown body)
- For search-related changes, run:

```bash
pnpm run build
pnpm run search:budgets
```

### 10. Analytics Verification Policy

- Google Search Console verification is DNS-based (Domain property TXT), not meta-tag based.
- Do not add `PUBLIC_GOOGLE_SITE_VERIFICATION` or `google-site-verification` meta tags.
- Keep Bing verification as optional env-based meta tag (`PUBLIC_BING_SITE_VERIFICATION`).

## Essential Commands

```bash
# Development
pnpm run dev              # Start dev server (localhost:7777)
pnpm run build            # Production build
pnpm run astro:preview    # Preview build

# Code Quality
pnpm run biome:check      # Lint check
pnpm run biome:fix        # Auto-fix
pnpm run astro:check      # Type check

# Deployment
pnpm run build            # Production build (Cloudflare Pages)
```

## Key Patterns

### Content Collections

Blog posts in `src/content/blog/`:

```yaml
---
title: "Post Title"
description: "Description"
pubDate: 2024-01-15
tags: ["tech"]
---
```

### Page Wrapper Pattern

All content pages use the **Page wrapper pattern**. Pages in `src/pages/` are 3-line wrappers. Logic lives in `src/components/pages/*Page.astro`:

**Page component** (`src/components/pages/AboutPage.astro`):
```astro
---
import MainLayout from '@/layouts/MainLayout.astro';
import { getTranslations } from '@/lib/translations';
import type { Language } from '@/lib/i18n';

interface Props { lang: Language; }
const { lang } = Astro.props;
const t = getTranslations(lang);
---
<MainLayout lang={lang} title={t.aboutPage.title} description={t.aboutPage.description}>
  <section>{t.aboutPage.title}</section>
</MainLayout>
```

**Page wrapper** (`src/pages/about.astro` — 3 lines):
```astro
---
import AboutPage from '@/components/pages/AboutPage.astro';
---
<AboutPage lang="en" />
```

### API Routes

In `src/pages/api/`:

```typescript
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};
```

## Common Tasks

### Add a Blog Post

1. Use `/add-blog-post` (mandatory workflow)
2. Ensure EN + ES files are both created/updated in `src/content/blog/{lang}/`
3. Verify frontmatter includes required fields and optional series fields when applicable
4. Run `pnpm run build` to validate Content Collections

### Add a Component

1. Create in `src/components/`
2. Use `.astro` for static, `.svelte` for interactive
3. Import with `@/components/...`

### Add a Page

1. Create shared component in `src/components/pages/*Page.astro` (handles `MainLayout` internally)
2. Create thin wrappers in `src/pages/` and `src/pages/en/` (3 lines each, pass `lang` as string literal)
3. Add translation keys to `src/lib/translations/` if needed

## What NOT to Do

❌ Write code, comments or commits in Spanish
❌ Use ESLint or Prettier — this repo uses Biome exclusively
❌ Reach for raw greys instead of the `--color-corag-*` tokens
❌ Ship a Svelte island with no `client:*` directive
❌ Add a top-level route without its `src/middleware.ts` entry
❌ Change page copy without updating its `.md` twin
❌ Add content in one language only
❌ Publish a figure you cannot back — on this site especially

## Documents to Read

1. **[AGENTS.md](../AGENTS.md)** — binding rules (read first)
2. **[STANDARDS.md](STANDARDS.md)** — coding conventions
3. **[ARCHITECTURE.md](ARCHITECTURE.md)** — technical details
4. **[DESIGN.md](DESIGN.md)** — the token contract
5. **[MESSAGING.md](MESSAGING.md)** — before writing any user-facing copy

## Quick Validation

Before any commit:

```bash
pnpm run biome:check && pnpm run astro:check && pnpm run test && pnpm run build
```

And, if you touched content or copy:

```bash
pnpm run md:check:strict && pnpm run lang:check:strict && \
pnpm run seo:check:strict && pnpm run parity:check:strict
```

All of them must pass. The content gates are not advisory: a failing
`parity:check` means one language is reading a different site.

## Getting Help

- **Astro Docs**: https://docs.astro.build/
- **Svelte Docs**: https://svelte.dev/docs
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Biome Docs**: https://biomejs.dev/
