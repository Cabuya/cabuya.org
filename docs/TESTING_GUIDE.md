# Testing Guide

> How this repo tests, where suites live, and the coverage bars. Behavior
> changes ship with their tests in the same commit; never weaken a test to
> pass a gate.

---

## 1. Toolchain

- **Vitest** (`pnpm run test`, `test:watch`, `test:coverage`) — unit +
  integration, happy-dom environment where DOM is needed, Testing Library for
  Svelte components.
- **Playwright** — a11y gate (`a11y:check`, axe on the route matrix,
  *Task 35*), E2E journeys (*Task 47*), responsive audit.
- Gate scripts export testable functions; their unit tests live beside the
  other suites with fixtures under `tests/fixtures/`.

## 2. Layout & naming

```
tests/
├── unit/            # *.test.ts, mirroring src/ paths (tests/unit/lib/i18n.test.ts)
├── fixtures/        # shared fixture data (spec-gates/, quickstart/, …)
└── e2e/             # Playwright: a11y/, journeys/, responsive/
packages/validator/tests/   # the validator's own suites (see §4)
```

## 3. Coverage bars

| Surface | Bar | Where enforced |
|---|---|---|
| `src/lib/` | ≥ 80% | vitest coverage thresholds |
| Validator core | ≥ 90% lines | package config |
| Every `E`-severity check | 1 must-fail + 1 near-miss fixture | structural invariant test |

## 4. The validator test strategy (the deep end)

| Layer | Content |
|---|---|
| Golden corpus | The 5 spec examples + ~35 synthetic fixtures from real ecosystem shapes (de-identified) |
| Must-fail pairs | Every error check: one fixture that fires it, one near-miss that must NOT |
| Message snapshots | Exact strings — incl. the three designed message sets from the invalid examples. A message change is a deliberate act |
| Schema mutations | Delete each required property; assert exactly the expected check fires |
| Parity | Same corpus through Node and the Workers runtime → byte-identical JSON |
| Probe tests | A local fixture server reproducing the four traps (SPA catch-all, always-now, missing CORS, redirect chain) |
| Non-echo | Sentinel values prove PII findings never quote the matched value |
| Purity | The built core bundle contains no Node-only APIs |
| No-network | A test fails if the engine calls fetch in `--no-network` mode |

## 5. House tests that guard the system itself

- `tests/unit/lib/design-tokens.test.ts` — declared≡shown tokens, RE-COMPUTED
  WCAG ratios, raw-grey ban, fique-on-light scan.
- Gate self-tests — each gate proven red on a seeded violation when it lands.
- Structure guards (internal hub excluded from production; sidebar links
  resolve; nav ↔ IA consistency) — added with their surfaces.

## 6. Discipline

1. **New behavior ⇒ tests in the same task/commit** (happy path + meaningful
   edges).
2. **Full check, not the build:** validation = `pnpm run test && pnpm run
   biome:check && pnpm run astro:check` minimum.
3. **Keep existing tests green** — update intent, never delete to pass.
4. **Proportionality:** docs/config changes don't need new tests but still
   run the gates.
5. **No flakes:** suites must survive `--sequence.shuffle`; fix
   order-dependence when found.
