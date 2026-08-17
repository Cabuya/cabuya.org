---
name: audit-analytics
description: Audit what this site actually measures against what it claims — the beacon's env gate, the absence of custom events, no cookies, and the CSP's single third-party origin. Use before a release, or whenever anything analytics-shaped is added.
# === Universal (Claude Code + Cursor + Codex) ===
disable-model-invocation: false
# === Claude Code specific ===
allowed-tools: Read, Glob, Grep, Bash
model: sonnet
# === Documentation (ignored by tools, useful for humans) ===
tier: 2
intent: review
max-files: 0
max-loc: 0
---

# Skill: Audit analytics

## Objective

Verify that the footer's one sentence — *cookieless, aggregate, nothing about
who you are* — is still true of the shipped code.

This project's whole argument is that an unverifiable claim is worth nothing.
A privacy claim is the one every visitor is asked to take on trust, so it is
the one that most needs to be checkable by reading the repository.

> **Rewritten after the migration.** The previous version audited **Umami** —
> an events catalogue, `trackEvent(EVENTS.…)` call sites, and a
> `/api/umami/script.js` proxy. None of that exists. Task 36 replaced it with
> Cloudflare Web Analytics and **deleted 299 lines of dormant tracking code**,
> because dead tracking code is a privacy claim nobody can verify by reading
> the page. Auditing against the old design would have found nothing and
> reported success.

## What is true now, and must stay true

| Claim | Where it is enforced |
|---|---|
| Cloudflare Web Analytics, and nothing else | `src/lib/constances.ts` |
| **No custom events at all** — the provider has no event API, so there is nothing for one to reach | `tests/unit/lib/analytics-posture.test.ts` |
| Absent unless a token is configured — so forks, previews and local builds send nothing | `Boolean(cloudflareBeaconToken) &&` |
| Off outside production unless explicitly enabled | `PUBLIC_CF_BEACON_ENABLE` + `import.meta.env.PROD` |
| No cookie is set from the page | the built-site assertions |
| Exactly one third-party script origin, and it is the beacon | the CSP, checked in the same test |

## Procedure

### 1. Run the assertions that already exist

```bash
pnpm run test -- analytics-posture
```

The absence assertions are the strongest ones there: no `trackEvent`, no
`window.umami`, no `gtag`, no `googletagmanager`, and no `src/lib/analytics.ts`
to import.

### 2. Look for anything analytics-shaped that was added

```bash
rg -n 'gtag\(|dataLayer|googletagmanager|posthog|mixpanel|segment|plausible|umami' src/ functions/
rg -n 'navigator\.sendBeacon|new Image\(\)|fetch\(.*(track|collect|event)' src/ functions/
rg -n 'document\.cookie\s*=' src/ functions/
```

Any hit is a finding until proven otherwise. A tracker added without updating
the footer sentence is the failure this audit exists for.

### 3. Check the CSP still allows exactly one origin

```bash
pnpm run csp:check
grep -o "script-src[^;]*" dist/_headers | tr ' ' '\n' | grep '^https://'
```

Expect exactly `https://static.cloudflareinsights.com`. **`connect-src` must
stay `'self'`** — a site that needed a third-party connect entry to work would
be a site with a dependency its privacy note did not mention.

### 4. Check the disclosure is still rendered, in both languages

```bash
grep -c 'Cookieless analytics' dist/index.html
grep -c 'Analítica sin cookies' dist/es/index.html
```

A claim that stopped being displayed is a claim that stopped being made — and
the code would still be doing whatever it does.

### 5. Verify a build with no token sends nothing

```bash
grep -c 'cloudflareinsights.com/beacon' dist/index.html   # expect 0 locally
```

Every local build and every fork's CI runs without a token. A build that
phoned home from a contributor's laptop would be exactly what the footer says
does not happen.

## Findings to raise as blocking

- Any custom-event mechanism, in any form.
- A cookie set from the page.
- A second third-party origin in `script-src`, or anything in `connect-src`.
- A beacon that loads without a configured token.
- Analytics in `/api/validate`'s path — `retention:check` covers it, and that
  endpoint is documented as keeping nothing.
- The footer sentence changed without the code changing, or the reverse.

## Non-goals

- Does not add analytics. Adding one is a decision, not a task.
- Does not audit Cloudflare's own dashboard configuration.
- Does not replace `retention:check`, which is about the validator endpoint.

## Validation

```bash
pnpm run test -- analytics-posture && pnpm run csp:check
```
