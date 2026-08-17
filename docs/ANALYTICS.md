# Analytics — cookieless, and honest about what it measures

> Decision: **Cloudflare Web Analytics** — no cookies, no consent banner, no
> personal data, zero ops. **Never GA4.**

---

## 1. What is measured

- Page views and Core Web Vitals, aggregate, via the CF beacon
  (`PUBLIC_CF_BEACON_TOKEN`; absent env = no beacon, so forks stay clean).
- The adoption funnel at page level: quickstart → validator → registry
  (approximated from CF's per-page views — CF has no custom events; that
  limit is stated, not worked around).
- Agent traffic to `.md` twins / `llms.txt` via CF's own request analytics.

## 2. What is never measured

- Who validated what — **the probed URL never enters analytics** (also a
  §retention rule of the validate API).
- Any feed content; any form field content.
- Individual identity: no cookies, no fingerprinting, no cross-site IDs.

## 3. Disclosure

One sentence in the footer of every page, in both languages:

> Cookieless analytics: page views and load speed, in aggregate. No cookies, no
> identifiers, nothing about who you are.

In the footer rather than on a policy page, because a policy page is a place
people are sent when the answer is complicated. And it says *what* rather than
*we care about your privacy*: this project's whole argument is that an
unverifiable claim is worth nothing, which applies to its claims about itself.

If we cannot say it in one sentence, we should not be measuring it.

## 3.1 What the wiring actually is

The beacon is injected by a small inline script when `PUBLIC_CF_BEACON_TOKEN`
is set — absent in every fork, preview and local build, so nobody's development
traffic reaches our dashboard. Injected rather than a static `<script src>` for
a measured reason: a transient CDN failure on a static tag logs a
failed-resource console error, and that single Lighthouse audit drops Best
Practices to ~0.96.

The content-security policy allows exactly one third-party script origin —
`static.cloudflareinsights.com` — and `connect-src 'self'` with no exceptions.
The validator, the badge, the registry status endpoint and the contact form are
all same-origin, so a site that needed a third-party connect entry to work
would be a site with a dependency its privacy note did not mention. A test
asserts both.

**There is no custom-event code.** The 299-line tracking module that shipped
with the baseline — outbound links, scroll depth, a theme-toggle event — worked
through the previous provider's event API and was deleted rather than left
dormant, because dead tracking code is a privacy claim nobody can verify by
reading the page. It also removed 1.5 KB from every page.

## 4. Verification policy (MANDATORY, carried from the baseline)

1. Never add `PUBLIC_GOOGLE_SITE_VERIFICATION` or a `google-site-verification`
   meta tag — GSC is **DNS-only** (gate-enforced).
2. Bing optional via `PUBLIC_BING_SITE_VERIFICATION` env meta.

## 5. The upgrade path (documented, not planned)

If the working group ever needs event-level funnels, the pattern is
self-hosted Umami behind a first-party proxy (the baseline repo carried it; see
git history at `72395f2` — `functions/api/umami/[[path]].ts`). Adopt only with a
decision-log entry; the measured/never-measured lists above still bind.

Adopting it would also mean re-adding a `connect-src` origin and a consent
question this site currently does not have to ask. That is the real cost, and
it is larger than the wiring.
