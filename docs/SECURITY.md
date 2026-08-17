# Security

> Threat model and controls for cabuya.org. The site is static-first on
> purpose: the smaller the dynamic surface, the smaller the attack surface.
> Disclosure policy: root [`SECURITY.md`](../SECURITY.md) — coordinated
> disclosure, 90-day posture, org-level contact.

---


## The Content-Security-Policy, and two accepted risks

`script-src` carries **no `'unsafe-inline'` and no `'unsafe-eval'`.** The
policy is generated from the built output by `scripts/generate-csp.mjs`, which
hashes every inline script the site actually shipped; `csp:check` fails a build
whose committed policy no longer matches what it produced. A hand-maintained
hash list would be correct on the day it was written and silently wrong
afterwards — and the usual repair for the resulting breakage is restoring
`'unsafe-inline'`, which is the setting that turns a CSP off.

Removing `'unsafe-eval'` had a consequence worth recording: **Ajv compiles
schemas with `new Function`**, so the validator's browser paste mode failed
silently — the page loaded, the button clicked, and nothing happened. The
schemas are precompiled now
(`packages/validator/scripts/build-standalone.mjs`), so the browser runs plain
functions and never evaluates a string. The alternative would have been making
any injected string executable on the page where users paste data, to save a
build step.

Thirteen end-to-end tests apply the **shipped** policy to real page loads and
fail on any violation, including three that check the interactive parts still
work. A CSP that breaks the site is not a security improvement; it is an
outage with a good reason.

**Two accepted risks**, recorded rather than left implicit:

1. **`style-src` keeps `'unsafe-inline'`.** Astro emits scoped component CSS
   inline, and no injection path this policy leaves open runs through a
   stylesheet.
2. **GitHub Actions are version-pinned, not SHA-pinned.** Every action in use
   is first-party `actions/*` or `peter-evans/create-pull-request`;
   SHA-pinning converts routine Dependabot minor bumps into unreviewable hash
   churn, and CI holds no credential beyond a read-only, single-namespace KV
   token. This trade changes the day a workflow gains a write-scoped secret.


## 1. Threat model at a glance

| Surface | Threat | Posture |
|---|---|---|
| Static site | Content tampering via supply chain | Pinned deps, `pnpm audit` in CI, Dependabot, provenance publish |
| **`/api/validate`** | **SSRF** — it fetches arbitrary URLs on request; also abuse-as-scanner against volunteers' servers | The full control set (§2). The highest-risk surface in the repo, reviewed as such |
| `/api/contact` | Spam, header injection into the DailyBot payload, secret leakage | Server validation, honeypot + min-fill-time, KV rate limit, env-only secret, `no-store` |
| `/badge/[publisher]` | Path traversal, SVG injection via registry strings | Id allowlist from registry entries; escape at composition; entries are HTML-free by gate (B6) |
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
| `CF_KV_TOKEN` (revalidation cron) | Workers KV Storage: **Edit**, one namespace | GitHub repo secret |
| `CF_ACCOUNT_ID` · `CF_REGISTRY_KV_ID` | Identifiers, not credentials | GitHub repo secret |
| `CF_KV_READ_TOKEN` (site build) | Workers KV Storage: **Read**, same namespace | Pages build env |
| `DAILYBOT_API_KEY` | Form submission only — no read scope needed | Pages env / `.dev.vars` |
| `DAILYBOT_FORM_ID` · `DAILYBOT_FORM_QUESTIONS` | Identifiers for one form in one workspace, not credentials | Pages env / `.dev.vars` |
| `PUBLIC_CF_BEACON_TOKEN` | Analytics beacon (public) | Pages env |

Rules: names documented in `.dev.vars.example` with placeholders; values
never in git; **a pushed secret is a leaked secret — rotate it, don't just
remove it**; the Security Review sweeps `git log -p` for added-then-removed
material.

### The KV write token

`CF_KV_TOKEN` is the only credential in the system that can change what the
registry says about a publisher, so it is worth being precise about it.

**Scope.** Workers KV Storage: Edit, restricted to the `REGISTRY_STATUS`
namespace, on one account. It cannot deploy, cannot read or write any other
namespace, cannot touch DNS, and cannot read the rate-counter namespace the
validator endpoint uses. A token that can only do the one thing it is for
cannot be repurposed by whoever finds it.

**Blast radius.** Someone holding it can write a false conformance state. They
cannot change the registry entries (those are git, and a pull request), cannot
change the history (also git, appended by a reviewable bot PR), and cannot
change the checks. The lie would be visible in the next cron run six hours
later, when the real measurement overwrites it — and the history PR would show
a day whose recorded state does not match the badge anyone saw.

**Where it can appear.** `.github/workflows/revalidate.yml` only. That workflow
does not run on `pull_request`, so a fork never receives it; it is gated on the
repository name so a fork's scheduled run exits before the step that would need
it; and `concurrency: revalidate` keeps two runs from racing on the same
counter.

**Rotation.** Rotate on any maintainer departure, on any suspicion, and
otherwise every 90 days. Rotation is a dashboard action plus a secret update —
there is nothing to redeploy, because no built artefact contains it.

**Read side.** `CF_KV_READ_TOKEN` is a separate, read-only token used at build
time to bake measured states into the static pages. It is deliberately not the
same token: a build environment is a more exposed place than a workflow secret,
and nothing that builds the site needs to be able to write a measurement.
Without it the build still succeeds and every entry renders as *not yet
measured*, which is the honest fallback rather than a broken one.

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
