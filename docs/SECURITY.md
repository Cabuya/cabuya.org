# Security

> Threat model and controls for cabuya.org. The site is static-first on
> purpose: the smaller the dynamic surface, the smaller the attack surface.
> Disclosure policy: root `SECURITY.md` *(ships in Task 30)* — coordinated
> disclosure, 90-day posture, org-level contact.

---

## 1. Threat model at a glance

| Surface | Threat | Posture |
|---|---|---|
| Static site | Content tampering via supply chain | Pinned deps, `pnpm audit` in CI, Dependabot, provenance publish |
| **`/api/validate`** *(Task 27)* | **SSRF** — it fetches arbitrary URLs on request; also abuse-as-scanner against volunteers' servers | The full control set (§2). The highest-risk surface in the repo, reviewed as such |
| `/api/contact` *(Task 31)* | Spam, header injection into the DailyBot payload, secret leakage | Server validation, honeypot + min-fill-time, KV rate limit, env-only secret, `no-store` |
| `/badge/[publisher]` *(Task 28)* | Path traversal, SVG injection via registry strings | Id allowlist from registry entries; escape at composition; entries are HTML-free by gate (B6) |
| Registry PRs | Malicious entries (impersonation, personal data, HTML) | `registry:check` gate + human identity review + the reviewer checklist |
| Spec/examples | PII smuggled into fixtures | B7: deny-pattern pass over our own tree in CI |
| The cron | Token theft → KV tampering | Single CF API token, scoped **write-only to one KV namespace**, repo secret, rotation documented in OPERATIONS |

**Data stance:** the site stores no personal data and has no field that could
hold one (org-level contact only, everywhere). The validator/API retain
**nothing** — no feed bodies, no probed URLs in logs or analytics.

## 2. The `/api/validate` control set (normative for Task 27)

| Control | Rule |
|---|---|
| Scheme | `https:` only |
| Address | Reject IP literals (v4/v6, incl. encoded forms), localhost, `*.local`/`*.internal`, metadata endpoints — checked on the initial URL **and every redirect hop** (redirects followed manually, max 3) |
| Size / time | 5 MB streaming abort · 8 s/request · 25 s/run |
| Rate | 10 validations/min/IP; **60/hour per probed host** (the validator must never out-request a volunteer's server) |
| Politeness | Stable UA naming the project + explanation URL (`/developers/validator/probe`); no Referer; `Cache-Control: no-cache` on probes |
| Retention | Nothing stored; `no-store` on responses; only anonymous counters |
| Abuse | Turnstile only after the per-IP limit trips |
| Platform caveat | Workers can't resolve DNS pre-fetch — hostname-pattern denial + metadata-IP denial + platform egress protections; the residual risk is documented here honestly, not hidden |

## 3. Headers (`public/_headers` — hardened in Task 45)

CSP without `unsafe-inline` for scripts (hashed theme script; CF beacon
allowlisted) · HSTS + preload · `X-Content-Type-Options: nosniff` ·
`Referrer-Policy: strict-origin-when-cross-origin` · `Permissions-Policy`
denying camera/mic/geolocation · `X-Frame-Options: DENY` (badge endpoint
exempt for embedding).

## 4. Secrets

| Secret | Scope | Where |
|---|---|---|
| Cloudflare API token (cron) | Write-only, one KV namespace | GitHub repo secret |
| `DAILYBOT_FORMS_TOKEN` + form id | Form submission only | Pages env / `.dev.vars` |
| `PUBLIC_CF_BEACON_TOKEN` | Analytics beacon (public) | Pages env |

Rules: names documented in `.dev.vars.example` with placeholders; values
never in git; **a pushed secret is a leaked secret — rotate it, don't just
remove it**; the Security Review sweeps `git log -p` for added-then-removed
material.

## 5. Repository & supply chain

2FA org-wide · branch protection on `main` with the named checks · DCO
enforced · CODEOWNERS on `spec/`, `registry/`, `packages/validator/` ·
dependency count on the validator is a *reviewed number* (Ajv only in core) ·
npm publish with provenance · everything public from the first commit.

## 6. The skill's process controls (companion repo)

The PII gate always stops for a human; crawl policy honored even if a human
asks; degraded mode never claims conformance; grep-contract tests keep those
sentences from being edited away. (Enforced in `Cabuya/cabuya-skill` CI.)
