# Analytics — cookieless, and honest about what it measures

> Decision: **Cloudflare Web Analytics** — no cookies, no consent banner, no
> personal data, zero ops. **Never GA4.** *(Wiring ships in Task 36.)*

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

One sentence in the footer, both languages: cookieless, aggregate, no
personal data. If we can't say it in one sentence, we shouldn't be measuring
it.

## 4. Verification policy (MANDATORY, carried from the baseline)

1. Never add `PUBLIC_GOOGLE_SITE_VERIFICATION` or a `google-site-verification`
   meta tag — GSC is **DNS-only** (gate-enforced).
2. Bing optional via `PUBLIC_BING_SITE_VERIFICATION` env meta.

## 5. The upgrade path (documented, not planned)

If the working group ever needs event-level funnels, the pattern is
self-hosted Umami behind a first-party proxy (the baseline repo carried it;
see git history at `72395f2` — `functions/api/umami/[[path]].ts`). Adopt only
with a decision-log entry; the measured/never-measured lists above still bind.
