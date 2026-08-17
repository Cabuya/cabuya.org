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

## `/api/validate` — as built

The endpoint exists because two of the most common real defects cannot be
diagnosed from a browser: whether a feed sends CORS headers (a browser cannot
see that — it is what CORS prevents), and whether a discovery path is a soft-404
(which needs a byte comparison against the site's own index). Everything below
is implemented in `functions/api/validate.ts` and `functions/lib/ssrf-guard.ts`,
and each row has a test.

| Control | As implemented |
|---|---|
| Scheme | `https:` only. `http:`, `file:`, `data:`, `gopher:` refused with a message that explains why |
| Credentials | A URL with a username or password is refused — including `https://example.org@169.254.169.254/`, where the apparent host is the username |
| IP literals | Every form refused: dotted decimal, dword, hex, octal, short form, IPv6. The URL parser normalises most of them to dotted decimal before the guard runs, so they land on the loopback and private-range rules; the generic literal rule is the backstop |
| Ranges | Loopback, `0.0.0.0/8`, RFC 1918, CGNAT, multicast, and link-local — which is where `169.254.169.254` lives |
| Metadata | Provider hostnames refused by name as well as by address |
| Internal names | `.local`, `.internal`, `.corp`, `.lan`, `.onion` and friends; and any hostname with no dot, which catches container and service names |
| Ports | A short deny-list of ports where a request means something other than "fetch a document". Not an allowlist of 443 — an unusual HTTPS port is unusual, not wrong |
| Redirects | Followed **manually**, at most 3, with the guard re-run on every hop. This is the control most often got wrong: with automatic following, a 302 to a metadata address is followed inside `fetch` and the initial check becomes decorative |
| Size | 5 MB, enforced by aborting the stream mid-read rather than buffering and checking |
| Time | 8 s per request, 25 s per run |
| Rate | 10/minute per caller; **60/hour per probed host across all callers** — a per-caller host limit would not protect the publisher at all |
| Politeness | A User-Agent naming the project and linking to `/developers/validator/probe`; no Referer; no retries |
| Retention | Two integer counters with TTLs, and nothing else. Enforced by `pnpm run retention:check`, which fails on a `console.*` call, a storage binding, an analytics call, or a KV write to any key outside `rate:` |
| CORS | **No `Access-Control-Allow-Origin` on this endpoint.** The protocol requires *feeds* to send `ACAO: *`; an open policy here would make the endpoint a free SSRF proxy for any site that wanted one. The two rules point in opposite directions because they protect different things |

### The limitation, stated plainly

**A Cloudflare Worker cannot resolve DNS.** There is no `dns.lookup`, and
`fetch` resolves inside the runtime after the guard has already run. So a
hostname that *resolves* to a private or metadata address cannot be detected
here by resolution — only by pattern.

That means the residual risk is real and specific: **a public hostname whose DNS
answer points inside a network.** An attacker who controls a domain can point it
at `169.254.169.254`, and the pattern rules will not see it.

What stands between that and a problem:

1. **Cloudflare's own egress controls.** Worker `fetch` is blocked from
   reaching the platform's metadata endpoints and loopback. This is a
   dependency on the platform, recorded here as a dependency rather than
   assumed silently — if the site ever moves off Pages, this row moves with it
   and the guard alone is not sufficient.
2. **There is nothing to steal at the other end.** The endpoint holds no
   credential — see `.dev.vars.example`. An SSRF that succeeds reaches a
   service with no secret to exfiltrate through it.
3. **Nothing is returned raw.** The response is a validation report, not the
   fetched body, so a successful internal fetch does not hand the caller the
   contents of what it reached.

The honest summary: the pattern rules close every bypass that does not require
controlling DNS, the platform closes the most dangerous of the ones that do, and
the blast radius of the remainder is a report about a document rather than the
document itself. Re-examine this section if the endpoint ever gains a
credential, returns a body, or moves off Cloudflare.
