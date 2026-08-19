---
name: add-page
description: Create new pages with correct routing and MainLayout usage. Use proactively when creating new pages.
# === Universal (Claude Code + Cursor + Codex) ===
disable-model-invocation: false
# === Claude Code specific ===
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
model: haiku
# === Documentation (ignored by tools, useful for humans) ===
tier: 1
intent: create
max-files: 4
max-loc: 200
---

# Skill: Add Page

## Objective

Create new pages in the Astro application with correct file-based routing, MainLayout usage, and SEO properties. Creates pages in ALL active language routes to maintain multilingual parity. Uses shared page components (`src/components/pages/`) with thin per-language wrappers.

## Non-Goals

- Does NOT create components (use add-component skill)
- Does NOT create API endpoints (separate concern)
- Does NOT modify existing pages

## Tier Classification

**Tier: 1** - Light/Cheap

**Reasoning:** Creating a page follows a clear template, has defined patterns, and is low risk.

## Inputs

### Required Parameters

- `$NAME`: Page name/route (e.g., `projects`, `about/team`)
- `$TITLE`: Page title (for SEO)
- `$DESCRIPTION`: Page description (for SEO)

### Optional Parameters

- `$LANG`: Language code (default: `'en'`)
- `$DYNAMIC`: If true, creates dynamic route with `getStaticPaths`

## Routing Patterns

| File | Route |
|------|-------|
| `pages/about.astro` | `/about` |
| `pages/projects/index.astro` | `/projects` |
| `pages/team/[member].astro` | `/team/{member}` (dynamic) |
| `pages/es/about.astro` | `/es/about` (i18n) |

## Steps

### Step 1: Determine Route Structure

- Simple page → `pages/{name}.astro`
- Section index → `pages/{name}/index.astro`
- Dynamic → `pages/{name}/[param].astro`
- i18n → `pages/{lang}/{name}.astro`

### Step 2: Create Shared Page Component (MANDATORY)

**MANDATORY:** Every page must use the Page wrapper pattern. Create the shared component at `src/components/pages/{Name}Page.astro` — this component handles `MainLayout`, translations, and all content internally.

**Static Page Component Template:**

```astro
---
// src/components/pages/{Name}Page.astro
import MainLayout from '@/layouts/MainLayout.astro';
import { getTranslations } from '@/lib/translations';
import { getUrlPrefix } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';

interface Props {
  lang: Language;
}

const { lang } = Astro.props;
const t = getTranslations(lang);
const prefix = getUrlPrefix(lang);
---

<MainLayout lang={lang} title={t.{name}Page.title} description={t.{name}Page.description}>
  <main class="main-container py-24">
    <h1 class="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
      {t.{name}Page.title}
    </h1>

    <div class="prose dark:prose-invert max-w-none">
      <!-- Page content using t.* for text and prefix for URLs -->
    </div>
  </main>
</MainLayout>
```

### Step 3: Create Thin Page Wrappers for All Languages (MANDATORY)

Create 3-line wrapper files for each active language (see `src/lib/i18n.ts`):

**English wrapper** (`src/pages/{name}.astro`):
```astro
---
import {Name}Page from '@/components/pages/{Name}Page.astro';
---
<{Name}Page lang="en" />
```

**Spanish wrapper** (`src/pages/[lang]/{name}.astro`):
```astro
---
import {Name}Page from '@/components/pages/{Name}Page.astro';
---
<{Name}Page lang="es" />
```

**Key rules:**
- Wrappers never import `MainLayout` — the `*Page.astro` component handles it internally
- The `lang` prop is passed as a **string literal** (`"en"`, `"es"`), not a variable
- If the page introduces new UI text, add entries to `src/lib/translations/en.ts` and `src/lib/translations/es.ts`

### Step 4: Create the `.md` twin (MANDATORY)

Every page serves a complete Markdown twin. There is no `src/content/pages/`
directory — the twin is a **build-time endpoint**, and the pattern depends on
the page type:

**Portal page (`/developers/{slug}`)** — nothing to do here: the existing
`src/pages/developers/[page].md.ts` machinery serves the twin from the same
two content files created in Step 2 (`src/content/docs/{en,es}/{slug}.md`),
plus a `live` entry in `PORTAL_SECTIONS` (`src/lib/portal-nav.ts`).

**Top-level page (`/{name}`)** — four pieces, all required:

1. A section builder `src/lib/{name}-markdown.ts` exporting
   `{name}Sections(lang): TwinSection[]`, built from the SAME translation keys
   the page renders (see `src/lib/about-markdown.ts` for the pattern).
2. Two endpoints: `src/pages/{name}.md.ts` and
   `src/pages/[lang]/{name}.md.ts`, each passing the builder to
   `serializeGenericToMarkdown` (`src/lib/markdown-for-agents.ts`).
3. A `KNOWN_PATHS` entry in `src/middleware.ts` — **same commit** (unknown
   top-level paths 404 in production).
4. If the page needs structured data, a `JSONLD_MATRIX` row in
   `src/lib/structured-data.ts` (enforced by `seo:check:strict`).

Then regenerate the committed route map: `pnpm run llms:generate`
(`llms:check` fails CI on drift).

**Coverage contract:** the twin must carry ≥ 0.85 of the HTML's content words
(`scripts/check-md-parity.mjs`) — build the twin from the same translations,
not from a summary. Runtime `Accept: text/markdown` negotiation is already
handled by `functions/_middleware.ts`.

### Step 5: Validate

```bash
pnpm run astro:check
pnpm run biome:check
pnpm run build
pnpm run md:check:strict && pnpm run lang:check:strict && pnpm run parity:check:strict
pnpm run seo:check:strict && pnpm run llms:check
```

## Output Format

### Success Output

```
## ✅ Pages Created (Multilingual)

### Pages
- English: `src/pages/{path}.astro` -> URL: `/{route}`
- Spanish: `src/pages/[lang]/{path}.astro` -> URL: `/es/{route}`
- Type: {Static|Dynamic}

### SEO
- Title: {title} / {title_es}
- Description: {description} / {description_es}

### Layout
- Uses MainLayout ✅
- main-container ✅

### Validation
- Astro check: ✅
- Build: ✅

### Commit Message
feat: add {name} page (en + es)
```

## Guardrails

### Required Elements

- [ ] Shared `*Page.astro` component handles `MainLayout` internally
- [ ] Page wrappers are 3-line files (import + render with `lang` literal)
- [ ] Has `main-container` wrapper
- [ ] Has semantic heading (`<h1>`)
- [ ] Dark mode support

### Scope Limits

- **Maximum files:** 4 (1 shared component + N language wrappers)
- **Maximum LOC:** 200

### Multilingual Enforcement

- MUST create a shared page component and wrappers for all active languages (see `src/lib/i18n.ts`).
- If new UI strings are needed, add them to `translations.ts` for all active languages.

### Stop Conditions

**Stop and escalate** if:

- Needs new layout component
- Complex data fetching required
- Multiple dynamic segments
- Translation quality is uncertain for page content

## Definition of Done

- [ ] Shared page component created in `src/components/pages/`
- [ ] Thin wrapper created for each active language (see `src/lib/i18n.ts`)
- [ ] All wrappers use correct `lang` value
- [ ] Shared component uses `MainLayout` with `lang` prop and `getUrlPrefix(lang)` for URLs
- [ ] SEO props provided for all active languages
- [ ] New UI strings added to `translations.ts` for all active languages (if applicable)
- [ ] `pnpm run astro:check` passes
- [ ] `pnpm run build` passes

## Examples

### Example 1: Static Page

**Input:**
```
$NAME: projects
$TITLE: My Projects
$DESCRIPTION: A showcase of my development projects
```

**Creates:**
- `src/pages/projects.astro` -> `/projects`
- `src/pages/[lang]/projects.astro` -> `/es/projects`

### Example 2: Page with Translations

**Input:**
```
$NAME: about
$TITLE: About Me
$DESCRIPTION: Information about me
```

**Creates:**
- `src/pages/about.astro` (English, `lang='en'`)
- `src/pages/[lang]/about.astro` (Spanish, `lang='es'`)

### Example 3: Dynamic Page

**Input:**
```
$NAME: projects/[slug]
$TITLE: (dynamic)
$DESCRIPTION: (dynamic)
$DYNAMIC: true
```

**Creates:** `src/pages/projects/[slug].astro`
**Route:** `/projects/{slug}`

## Related

- [add-component](../add-component/SKILL.md) - Create components
- [translate-sync](../translate-sync/SKILL.md) - Synchronize translations
- docs/ARCHITECTURE.md - Routing details
- src/pages/README.md - Page patterns
