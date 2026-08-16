# cabuya.org

**El ecosistema de impacto social.**

This repository is the institutional website for **Corag** — a social-impact
ecosystem connecting foundations, governments, entrepreneurs and individuals with
real opportunities to help, transparently and traceably.

> **Tenemos coraje para servir y transformar vidas.**

---

## Two surfaces, one project

| Surface | What it is | Repository |
|---|---|---|
| **`cabuya.org`** | The institutional site: what Corag is, how the model works, why it can be trusted, how to integrate with it. Static, in Spanish and English. | **this repo** |
| **`ayuda.cabuya.org`** | **Corag Ayuda Directa** — the flagship product. Emergencies, requests, offers, contributions, leaders, evidence. | separate |

Every *transactional* action — publishing a need, offering help, contributing,
tracking a contribution, applying as a leader — happens in the **application**.
This site explains and hands over; it holds no aid data and has no write API.

Getting that split wrong is the most common way to write incorrect copy or code
here. When in doubt: **if it stores something about a real person's need, it
belongs in the app.**

---

## Stack

- **[Astro](https://astro.build)** — static site generation, islands architecture
- **[Svelte](https://svelte.dev)** — the few genuinely interactive components
- **[Tailwind CSS 4](https://tailwindcss.com)** — with the Corag `@theme` tokens
- **TypeScript** — pinned to 6.x on purpose (see `AGENTS.md`)
- **[Biome](https://biomejs.dev)** — linting and formatting (never ESLint/Prettier)
- **[Vitest](https://vitest.dev)** — unit tests
- **Cloudflare Pages** — hosting, plus Pages Functions for the contact forms

Markdown is compiled by **Sätteri**; transforms are HAST plugins in
`src/lib/satteri-plugins.ts`. Never add remark/rehype plugins.

---

## Getting started

This repository is container-first: the dev container carries the right Node,
pnpm and tooling, so you install none of them.

**The fastest path is to ask your AI assistant for `/setup`** (`#setup` in
Cursor or Codex). It scaffolds the local config, checks your machine, and tells
you the one next step. It is safe to re-run any time.

Never used Docker or dev containers? [Onboarding](./docs/ONBOARDING.md) is the
same path click by click.

Once you are inside the container:

```bash
install               # dependencies
pnpm run dev          # http://localhost:7777
help                  # every command available in the container
```

### Everyday commands

```bash
pnpm run build                # astro check && astro build
pnpm run astro:preview        # serve the production build

pnpm run biome:check          # lint + format
pnpm run biome:fix            # auto-fix
pnpm run astro:check          # TypeScript
pnpm run test                 # Vitest
pnpm run test:coverage
```

### Content and quality gates

```bash
pnpm run md:check:strict      # every page has a COMPLETE .md twin
pnpm run lang:check:strict    # Spanish at /, English at /en
pnpm run seo:check:strict     # per-URL SEO + structured data
pnpm run parity:check:strict  # both languages carry the same content
pnpm run search:budgets       # search payload budgets
pnpm run lighthouse
```

### Brand assets

Shipped assets are **derived by script** from the official masters in
`assets/brand/`, so the pipeline is reproducible:

```bash
node scripts/build-brand-assets.mjs --dry-run
node scripts/build-brand-assets.mjs
```

---

## Language support

Spanish is the **primary** language and is served at the root (`/`). English is
served under `/en`. Both carry the same content — the same sources, the same
structure — not merely correct content in each.

Spanish is also the **source** language: copy is written in Spanish first and
translated to English, never the reverse. Diacritics are mandatory.

---

## Project layout

```
src/
├── components/     UI components (.astro + .svelte)
│   └── pages/      one *Page.astro per route, shared across languages
├── content/        Astro Content Collections (Zod-validated)
├── layouts/        MainLayout, InternalLayout, ShowcaseLayout
├── lib/            data helpers, i18n, translations
├── pages/          file-based routing — thin 3-line wrappers
│   └── internal/   dev-only hub (brand book, UI showcase, guides)
└── styles/         global.css — the Corag design tokens

assets/brand/       official brand masters (manual + logo variants)
public/             static assets, agent-facing files, redirects
functions/          Cloudflare Pages Functions (contact intake)
docs/               project documentation
.agents/            skills, agents, commands for AI assistants
```

### The page-wrapper pattern

Every route is a **3-line wrapper** delegating to a shared page component:

```astro
---
import HomePage from '@/components/pages/HomePage.astro';
---
<HomePage lang="es" />
```

Wrappers never import `MainLayout`, and `lang` is always a string literal.

> ⚠️ **New top-level routes must be registered in `src/middleware.ts`**
> (`KNOWN_ROOT_PATHS` / `KNOWN_EN_PATHS`) or they 404 in production while working
> fine in dev.

---

## Documentation

| Read this | For |
|---|---|
| **[`AGENTS.md`](./AGENTS.md)** | The single source of truth for anyone — human or AI — working in this repo |
| [`docs/BRAND_GUIDE.md`](./docs/BRAND_GUIDE.md) | Identity, palette, typography, voice |
| [`docs/DESIGN.md`](./docs/DESIGN.md) | The UI contract — tokens, patterns, anti-patterns |
| [`docs/PRODUCT_SPEC.md`](./docs/PRODUCT_SPEC.md) | Vision, audiences, the model |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | How the site is put together |
| [`docs/I18N_GUIDE.md`](./docs/I18N_GUIDE.md) | Spanish/English conventions |
| [`docs/TESTING_GUIDE.md`](./docs/TESTING_GUIDE.md) | Test setup and conventions |
| [`docs/SECURITY.md`](./docs/SECURITY.md) | Threat model |

---

## Contributing

Corag is built by volunteers. If you want to help:

- **Developers** — [Contributing](./docs/CONTRIBUTING.md) covers this repo;
  [`/developers`](https://cabuya.org/developers) covers the public API you can
  build on.
- **First time with a project like this** — [Onboarding](./docs/ONBOARDING.md).
- **Everyone else** — the fastest way to help is through the application at
  [ayuda.cabuya.org](https://ayuda.cabuya.org).

**Every change reaches `main` through a pull request.** Before opening one:

```bash
pnpm run biome:check && pnpm run astro:check && pnpm run test && pnpm run build
pnpm run md:check:strict && pnpm run lang:check:strict && pnpm run seo:check:strict
pnpm run parity:check:strict && pnpm run redirects:check:strict
```

CI runs the first four. The last five — the content gates — run locally only,
and they are the ones that catch a page whose two languages drifted apart.
[Contributing](./docs/CONTRIBUTING.md) explains what each protects.

---

## License

MIT — see [`LICENSE`](./LICENSE).
