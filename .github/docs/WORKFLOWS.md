# Workflows Reference

Reference for the GitHub Actions workflows in this repository.

**Stack:** Node.js 24.15.0, pnpm (via Corepack), ubuntu-latest runners, Astro
static site.

> **One workflow, on purpose.** The imported source carried five (PR size
> labelling, dependency-bump automation, release publishing). They depended on
> a repo secret this project never created and on a release flow it does not
> use, so every pull request failed on setup rather than on code. They were
> removed. Add one back only when there is a job that actually needs it.

---

## code_check.yml — Code Quality Validation

| Property | Value |
|----------|-------|
| **Trigger** | `pull_request` to `main` (opened, synchronize, reopened) |
| **Concurrency** | Per-workflow + PR number, cancel in-progress |
| **Secrets** | None — uses the built-in `GITHUB_TOKEN` |

### Job: `code_check`

| Step | Name | What it does |
|------|------|-------------|
| — | Checkout | `actions/checkout@v4` |
| — | Setup Node | `actions/setup-node@v4` (24.15.0) |
| 0 | Get pnpm store path | Resolves `corepack pnpm store path` |
| 0a | Cache pnpm store | `actions/cache@v4`, keyed on `pnpm-lock.yaml` |
| 1 | Install Dependencies | `corepack pnpm install --frozen-lockfile` |
| 2 | Astro checks | `corepack pnpm run astro:check` — TypeScript validation |
| 3 | Biome checks | `corepack pnpm run biome:check` — lint and format |
| 4 | Tests | `corepack pnpm run test` |
| 5 | Build | `corepack pnpm run build` (prebuild runs `images:webp`) |

**Notes:**

- pnpm resolves platform-specific native bindings
  (`@rollup/rollup-linux-x64-gnu`, `@esbuild/linux-x64`, …) through
  `optionalDependencies` in the lockfile — no `--no-save` workaround needed.
- **CI does not run the five content gates** (`md`, `lang`, `seo`, `parity`,
  `redirects`). They run locally, and [Contributing](../../docs/CONTRIBUTING.md)
  requires them before opening a pull request. Wiring them into CI is a
  sensible future change; until then, a green check here does **not** mean the
  content contract holds.

---

## Deployment

Cloudflare Pages deploys independently on push to `main`, configured in the
Cloudflare dashboard rather than in this repository.

Environment variables live there too — including `PUBLIC_UMAMI_WEBSITE_ID`,
without which the analytics tracker never loads. See
[Analytics](../../docs/ANALYTICS.md).

---

## External Actions

| Action | Version | Used in |
|--------|---------|---------|
| `actions/checkout@v4` | v4 | code_check |
| `actions/setup-node@v4` | v4 | code_check |
| `actions/cache@v4` | v4 | code_check |
