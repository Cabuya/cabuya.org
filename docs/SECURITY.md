# Security Guide

Security best practices for Corag, a static site built with Astro.

## Overview

As a static site, Corag has a different security profile than dynamic web applications. The main concerns are:

1. **Build-time secrets** - Protecting sensitive data during build
2. **Client-side exposure** - What data reaches the browser
3. **Third-party dependencies** - Supply chain security
4. **Content security** - Protecting against XSS in user-generated content

## Security Principles

### 1. No Secrets in Client Code

Static sites ship all client-side code to users. Never include secrets in:

- Astro component scripts
- Svelte component logic
- Client-side JavaScript

```typescript
// ❌ BAD - Secret exposed to client
const API_KEY = 'sk_live_xxxxx';

// ✅ GOOD - Only public data on client
const SITE_URL = import.meta.env.PUBLIC_SITE_URL;
```

### 2. Build-Time vs Runtime

Astro runs code at build time (server-side) and optionally at runtime (API routes). Understand the difference:

| Context | Secrets Safe? | Example |
|---------|---------------|---------|
| Build-time (`.astro` frontmatter) | ⚠️ Careful | Fetching data for static pages |
| API Routes (`src/pages/api/`) | ✅ Yes | Server-side endpoints |
| Client-side (Svelte with `client:*`) | ❌ No | Interactive components |

### 3. Minimal Attack Surface

As a static site:
- No database to protect
- No user authentication
- No session management
- Limited server-side logic

## Environment Variables

### Configuration

Use `.env` files for environment variables:

```bash
# .env (local development - DO NOT COMMIT)
PUBLIC_SITE_URL=http://localhost:7777
PRIVATE_API_KEY=sk_xxxxx

# .env.production
PUBLIC_SITE_URL=https://cabuya.org
```

### Naming Convention

- `PUBLIC_*` - Safe to expose to client (e.g., `PUBLIC_SITE_URL`)
- No prefix - Server-only, never reaches client

```typescript
// Server-side only (build time or API routes)
const privateKey = import.meta.env.PRIVATE_API_KEY;

// Available on client
const siteUrl = import.meta.env.PUBLIC_SITE_URL;
```

### Security Rules

- [ ] Never commit `.env` files with secrets
- [ ] Use `.env.example` for documentation
- [ ] Rotate secrets if accidentally exposed
- [ ] Use CI/CD environment variables for builds

## Analytics Privacy

Umami analytics on cabuya.org is **cookieless** and **PII-free** by policy:

- **No GA4** — Umami Cloud only, with optional first-party proxy at `/api/umami/*`
- **No consent banner** — no cookies set by the analytics stack
- **Public env vars only** — `PUBLIC_UMAMI_WEBSITE_ID` and related `PUBLIC_UMAMI_*` flags; no Umami API secrets on the client
- **PII stripping** — `sanitizeEventData()` in `src/lib/analytics.ts` blocks payload keys matching `email`, `name`, `message`, etc.; enforced by `tests/unit/lib/analytics-privacy.test.ts`
- **Proxy hardening** — `functions/api/umami/[[path]].ts` allowlists only `script.js` and `api/send`; no arbitrary upstream forwarding
- **Server events** — AI bot and markdown analytics send bot name + path only; request bodies are never logged

See `docs/ANALYTICS.md` for the full event catalog and operator runbook (`.dwp/plans/PLAN_world_class_umami_analytics/analysis_results/UMAMI_OPERATOR_RUNBOOK.md`).

### Agent Tooling Secrets (DeepWorkPlan addons)

The repo vendors opt-in AI-agent tooling (DeepWorkPlan v2.17.0 + the AI Diff Reviewer and design-system addons). None of it ships to the production site — it is developer/agent-only — and its secrets are **never committed**:

- **AI Diff Reviewer:** installed in **Flow A (local-only)** — no CI workflow, no provider secret required. If Flow B (CI review) is ever adopted, the provider secret (typical: `CURSOR_API_KEY`) is set **only** in GitHub → Settings → Secrets and variables → Actions, never in the repo.
- **Skill installs** use the checksummed `npx skills add … -y` path (content hashes recorded in `skills-lock.json`) — no remote-installer-piped-to-shell.

## Content Security

### User-Generated Content

Blog posts are authored in Markdown/MDX. While you control the content, follow these practices:

```markdown
<!-- ✅ Safe - standard markdown -->
# My Post
This is safe content.

<!-- ⚠️ Careful with raw HTML in MDX -->
<script>alert('This would execute!')</script>
```

### Content Collection Validation

Zod schemas validate content at build time:

```typescript
// src/content.config.ts
const blog = defineCollection({
  schema: z.object({
    title: z.string().max(200),  // Limit length
    description: z.string().max(500),
    // Validates structure, prevents malformed data
  }),
});
```

### Top notifications / alerts

Site-wide `TopNotificationBar` reads from the `notifications` content collection (YAML). Rules:

- **Plain text only** in title/summary/body — no HTML rendering of notification fields.
- **Date window** (`startsAt`/`endsAt`) + `active` flag filter via `src/lib/notifications.ts`.
- **CTA hrefs** validated by Zod (`notificationSafeHref`): internal paths (`/…`) or absolute `http(s)://` only.
- **Non-dismissible** — the bar has no close control; it only collapses while the page is scrolled away from the top.
- **Modal** focus trap is client UX only — content remains author-controlled YAML.

### Community calendar feeds

The `/calendar` page embeds **public** Google Calendar IDs from the `communityCalendars` content collection. Security rules:

- **No Google API keys** in the repo or client bundle — only embeddable public calendar IDs (`googleCalendarId`).
- **HTTPS only** for `website` and `lumaUrl` fields (enforced by Zod at build time).
- **Calendar ID validation** rejects URL-shaped values (`http://`, `https://`) so embed `src` params cannot be hijacked to third-party origins.
- **ICS subscribe links** are built server-side from validated IDs; users leave the site only to `calendar.google.com`.
- **iframe** loads Google-hosted content only; no `sandbox` attribute (breaks Google Calendar UI). Rely on Google origin isolation.

To add a calendar, organizers must make the Google Calendar public and submit the ID via the [calendar intake form](/calendar/#calendar-intake) — never share service-account credentials.

### Community intakes (`/api/contact` → Dailybot)

Both public forms (`ContactForm`, `ConductReportForm`) post to `POST /api/contact`, which forwards to **DailyBot Forms**. The server-only secret is:

- `DAILYBOT_API_KEY`

Form and question UUIDs for the Corag org are baked into `functions/api/_dailybot.ts`.
Without the API key the endpoint fails closed (503) and sends nothing. See
[FORMS.md](./features/FORMS.md).

| Control | Implementation |
|---------|----------------|
| Honeypot | Hidden `website` field — filled values get a fake `200` and are never sent to Dailybot |
| Form discriminator | `_form` allowlist; legacy `reason`/`topic` mapped server-side |
| Input bounds | Length caps + sanitizers in `functions/api/contact.ts` / `src/lib/contact-form.ts` |
| Email format | Required except anonymous CoC reports |
| No secrets in client | `DAILYBOT_API_KEY` and Resend keys stay in Cloudflare / local Functions env — never `PUBLIC_*` |
| Rate limiting | Isolate-local sliding window (default 8 / 10 min) |
| Turnstile | Deferred — `CONTACT_TURNSTILE_SECRET` reserved |
| Optional Resend ack | Best-effort after Dailybot `201`; ack failure does not fail the request |
| CoC privacy | Restricted Dailybot form (`owner_and_admins`, no public link). Anonymous mode clears reporter identity. Analytics must not include incident text |
| Validation tests | `tests/unit/lib/contact-form.test.ts`, `tests/unit/functions/dailybot.test.ts`, `tests/unit/functions/contact-dailybot.test.ts` |

Prefill query params on Contact (`topic` preferred, legacy `reason`, plus `subject`, `message`) are sanitized on mount; never render raw query strings as HTML.

### External Links

When linking to external sites:

```astro
<!-- Add rel attributes for security -->
<a href="https://external.com" target="_blank" rel="noopener noreferrer">
  External Link
</a>
```

## Agent-markdown surface

Every public page also publishes a `.md` twin at `{url}.md` for AI agents
(**[Markdown for Agents](aeo/MARKDOWN_FOR_AGENTS.md)**). Since these are a
second public rendering of the same content, they are a second place content can
leak from.

**The invariant: a `.md` twin publishes exactly what its HTML page publishes —
no more.**

- Twins are generated **only for pages the build emits**. Draft and scheduled
  content never reaches a page, so it never reaches a twin — verified against
  the build: 10 draft blog posts, 0 twins.
- Pages marked `noindex` have **no** `.md` twin. Today that is only `/internal/**`, which is deleted from the production build.
  Asserted against `dist/` during the Task 13 review.
- Serializers read the same filtered helpers the pages read (`getChannels`,
  `getEditions`, `getSlideDecks`), so a draft filter added in one place applies
  to both surfaces.
- Twins resolve entity references to names and links. They must not introduce
  fields the page does not render — reviewers should treat a new field in a
  serializer as a publication decision, not a formatting one.

`pnpm run md:check:strict` enforces completeness and language on every build;
`pnpm run seo:check:strict` asserts, among other things, that `noindex` appears
only on the intended surfaces and that no `google-site-verification` tag exists
anywhere (see **[Analytics Verification Policy](../CLAUDE.md)**).

### `Content-Disposition: inline` on `/*.md`

`public/_headers` serves the twins as `text/markdown` with
`Content-Disposition: inline`. The content type is deliberate — the WorkOS
`auth.md` / isitagentready scanner expects it — and browsers have no renderer
for it, so without the disposition they download the file or show a blank
viewport.

`inline` is safe **because** the type is `text/markdown`: browsers do not
execute it, so the usual "inline disposition on user-supplied content" concern
(HTML/SVG rendered in origin context) does not apply. If the content type of
these routes ever changes to something a browser executes, the disposition must
be revisited at the same time.

## API Route Security

### Current Endpoints

The site has minimal API routes:

| Endpoint | Purpose | Security |
|----------|---------|----------|
| `/api/posts-en.json` | Blog search index (EN shard) | Public, cached |
| `/api/posts-es.json` | Blog search index (ES shard) | Public, cached |
| `/api/posts.json` | Blog search index (compatibility) | Public, cached |
| `/rss.xml` | RSS feed | Public |

### API Route Best Practices

```typescript
// src/pages/api/posts-en.json.ts (same pattern for posts-es.json)
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    // Validate and sanitize any inputs
    // Return only necessary data
    const data = await getPublicPosts();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    // Don't expose error details
    console.error('API error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
    });
  }
};
```

## Dependency Security

### Regular Audits

```bash
# Check for known vulnerabilities
npm audit

# Fix automatically where safe
npm audit fix

# Check for outdated packages
pnpm run ncu:check
```

### Package Selection

When adding dependencies:

- [ ] Check package popularity and maintenance
- [ ] Review recent security advisories
- [ ] Prefer well-maintained packages
- [ ] Minimize dependencies when possible

### Lock Files

Always commit `pnpm-lock.yaml` to ensure reproducible builds. The lockfile is consumed by `corepack pnpm install --frozen-lockfile` in CI and Cloudflare Pages.

## Build Security

### Cloudflare Pages Deployment

The site deploys to Cloudflare Pages from the `dist/` folder:

```bash
pnpm run build
```

Security considerations:

- [ ] Build output (`docs/`) contains only public content
- [ ] No `.env` files in build output
- [ ] No source maps with sensitive paths
- [ ] HTTPS enforced by Cloudflare

### Build-Time Secrets

If you need secrets during build (e.g., fetching from a CMS):

```bash
# In CI/CD, set environment variables
PRIVATE_CMS_TOKEN=xxx pnpm run build
```

The secret is used at build time but not included in output.

## Headers and CSP

**Shipped**, in `public/_headers`, applied to every route:

| Header | Value | Why |
|--------|-------|-----|
| `Content-Security-Policy` | see below | Limits where scripts, styles, fonts, images and connections may come from |
| `X-Content-Type-Options` | `nosniff` | Stops a browser guessing a type the server did not declare |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | A path here can reveal what somebody was reading |
| `Permissions-Policy` | camera, microphone, geolocation, payment, usb all `()` | This site needs none of them |
| `Cross-Origin-Opener-Policy` | `same-origin` | Isolates the browsing context |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | No plaintext downgrade |

### The CSP, and why each source is there

```
default-src 'self'; base-uri 'self'; object-src 'none';
frame-ancestors 'none'; form-action 'self';
img-src 'self' data:; font-src 'self'; style-src 'self' 'unsafe-inline';
script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://cloud.umami.is;
connect-src 'self' https://cloud.umami.is https://ayuda.cabuya.org;
upgrade-insecure-requests
```

- **`frame-ancestors 'none'`** — nothing should embed this site. This replaces
  `X-Frame-Options`, which the meta-tag form never actually enforced.
- **`form-action 'self'`** — the intake forms POST to a Pages Function on this
  origin and nowhere else.
- **`script-src 'unsafe-inline'`** — required, not aspirational: Astro emits
  inline module scripts for every island, and the theme and notification
  bootstraps must run before paint to avoid a flash. Removing it means moving
  to hashes or a nonce, which a fully static build cannot generate per request.
- **`static.cloudflareinsights.com`** — injected by the platform.
- **`cloud.umami.is`** — only reached when the first-party proxy is disabled via
  `PUBLIC_UMAMI_USE_PROXY=false`.
- **`connect-src` includes `ayuda.cabuya.org`** — so a page may reach the
  application's public API metadata without the browser blocking it.
- **No `frame-src`, no `media-src`** — nothing on the site uses either, so
  `default-src 'self'` covers them.

### Verifying after a deploy

```bash
curl -sI https://cabuya.org/ | grep -iE 'content-security|x-content-type|referrer|permissions|strict-transport'
```

Then open the console on a page with an island and confirm no CSP violations.
A new third-party script means the policy changes with it — never the other way
round.

## Security Checklist

### Before Committing

- [ ] No secrets in code, and no form or question id hardcoded where the
      environment should supply it
- [ ] No `.env` files committed
- [ ] External links have `rel="noopener noreferrer"`
- [ ] No unnecessary data exposed
- [ ] No new page collects information about a real person's situation — that
      belongs in the application

### Before Deployment

- [ ] `npm audit` shows no critical vulnerabilities
- [ ] Build output contains only public content
- [ ] Environment variables properly configured
- [ ] Dependencies are up to date

### Periodic Review

- [ ] Audit dependencies monthly
- [ ] Review API routes for data exposure
- [ ] Check for new security best practices
- [ ] Update packages regularly

## Incident Response

If a secret is accidentally committed:

1. **Rotate immediately** - Generate new credentials
2. **Remove from history** - Use `git filter-branch` or BFG Repo-Cleaner
3. **Audit usage** - Check if secret was used maliciously
4. **Update documentation** - Prevent recurrence

## Resources

- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Astro Security Documentation](https://docs.astro.build/en/guides/security/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [npm Security Best Practices](https://docs.npmjs.com/packages-and-modules/securing-your-code)
