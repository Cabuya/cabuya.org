## What this changes

<!-- One or two sentences. What is different after this merges? -->

## Why

<!-- The problem, not the solution. If it fixes an issue, link it: Fixes #123 -->

## Gates

CI runs lint, types, tests and the build. The five content gates run **locally
only** — please confirm you ran them:

- [ ] `pnpm run md:check:strict` — every page still has a complete `.md` twin
- [ ] `pnpm run lang:check:strict` — Spanish renders at `/`, English at `/en`
- [ ] `pnpm run seo:check:strict` — metadata and structured data valid
- [ ] `pnpm run parity:check:strict` — both languages carry the **same** content
- [ ] `pnpm run redirects:check:strict` — no redirect shadows a live page

## If this touches content

- [ ] Both languages updated (`es` **and** `en`)
- [ ] The `.md` twin under `src/content/pages/{es,en}/` reflects the change
- [ ] Spanish text carries its accents and ñ
- [ ] No figure, statistic or organization endorsement we cannot back
- [ ] No CTA to a channel we do not run (only the app, WhatsApp, Instagram,
      Facebook)

## If this touches a new route

- [ ] Added to `KNOWN_ROOT_PATHS` / `KNOWN_EN_PATHS` in `src/middleware.ts` —
      without it the route works in dev and 404s in production

## How to verify

<!-- The steps a reviewer should follow. "Open /how-it-works at 360px and
     confirm the journey steps stack" beats "tested locally". -->

---

<!-- New here? docs/CONTRIBUTING.md explains what each gate protects and why.
     If this is your first pull request: welcome, and thank you. -->
