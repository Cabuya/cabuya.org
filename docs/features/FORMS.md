# Public intake forms (DailyBot)

Both public Corag forms post to the Cloudflare Pages Function
`POST /api/contact` (`functions/api/contact.ts`), which forwards structured
responses to the **DailyBot Forms** public API. DailyBot is the **system of
record**. An optional **Resend** auto-acknowledgement may run after a successful
DailyBot `201` and must never block success.

There is no local DailyBot mock — exercising Forms against a real
`DAILYBOT_API_KEY` hits the live workspace. Prefer unit tests for mapping; when
you must smoke-test, prefix subjects and messages with `[TEST]` and delete the
junk responses afterwards.

## The two forms

| Form | UI | Route | `_form` | DailyBot form (Corag org) |
|------|----|-------|---------|--------------------------|
| Contact | `ContactForm.svelte` | `/contact`, `/en/contact` | `contact` | **Corag — Contact** (`a467e863-e808-4e7e-97f6-173ab512cb96`) |
| Code of Conduct | `ConductReportForm.svelte` | `/conduct#conduct-report-form` | `conduct` | **Corag — Code of Conduct report** (`cf0b575b-8d49-4b3c-822a-4eafd9dbc3ee`) |
| Ecosystem join | `EcosystemJoinForm.svelte` | `/ecosystem#ecosystem-join` | `ecosystem` | **Corag — Ecosystem app request** (`9b51bedd-d8ef-428d-8c1b-36fc78d37336`) |

Both report to Slack channel `#all-corag`. Newsletter signup is disabled in the UI and has no backend.

### Client feedback

Both Svelte forms already:

- Validate on submit and show **per-field** errors (`aria-invalid`, red border, `aria-live` messages)
- Focus the first invalid field
- Show a **success** panel (`role="status"`) after a `2xx` from `/api/contact`
- Show a form-level error if the API fails or is not configured

### Contact topics → DailyBot choices

Site slug → DailyBot multiple-choice **label** (value === label):

`general`→General · `organization`→Organization · `ally`→Ally · `press`→Press · `report`→Report · `conduct`→Conduct · `other`→Other

## Form and question ids are baked into source

Form and question UUIDs for the Corag DailyBot org live in
`functions/api/_dailybot.ts` (`CONTACT_FORM` / `CONDUCT_FORM`). The **only**
runtime secret for intake is:

| Variable | Where | Notes |
|----------|-------|-------|
| `DAILYBOT_API_KEY` | Cloudflare / local Functions | **Never** `PUBLIC_*`. Sent as `X-API-KEY`. |

Without `DAILYBOT_API_KEY` the endpoint returns 503/`backend_not_configured`
and sends nothing.

## Environment

| Variable | Where | Notes |
|----------|-------|-------|
| `DAILYBOT_API_KEY` | Cloudflare / local Functions only | **Never** `PUBLIC_*`. Sent as `X-API-KEY`. Required. |
| `PUBLIC_CONTACT_API_ENDPOINT` | Build | Optional override. Defaults to `/api/contact`. |
| `RESEND_API_KEY` + `CONTACT_FROM_EMAIL` | Optional | Submitter acknowledgement after DailyBot success |
| `CONTACT_RATE_LIMIT` / `CONTACT_RATE_WINDOW_MS` | Optional | Default 8 requests / 600000 ms |
| `CONTACT_ALLOWED_ORIGINS` | Optional | CORS allowlist |

Form and question UUIDs are **not** env vars — they live in
`functions/api/_dailybot.ts`.

**Local Functions:** plain `pnpm run dev` does **not** run Cloudflare Pages
Functions. Use `wrangler pages dev` (or a preview deploy) with the variables
bound for an end-to-end smoke test.

## API contract

```json
{
  "_form": "contact",
  "name": "…",
  "email": "…",
  "topic": "ally",
  "subject": "…",
  "message": "…",
  "lang": "es",
  "page_path": "/contact/",
  "website": ""
}
```

- `_form`: `contact` | `conduct` | `ecosystem`
- Without `_form`, `reason`/`topic` maps `conduct`/`coc` → `conduct`, everything
  else → `contact`
- Honeypot `website` must be empty. If filled, the endpoint returns a fake `200`
  and forwards nothing
- DailyBot POST: `https://api.dailybot.com/v1/forms/{uuid}/responses/` with
  `{ content, automation: true }`

## Contact topics

The canonical set lives in `src/lib/contact-form.ts` and is mirrored for the
Function in `functions/_lib/intake-helpers.ts`:

`general` · `organization` · `ally` · `press` · `report` · `conduct` · `other`

Retired topics from the previous site (`sponsorship`, `collaboration`,
`tech-talk`, `cfs`, `speaker`, `project`) are kept in the alias table so an old
bookmarked link still lands on a live topic instead of falling through.

### Multiple-choice values

This workspace's DailyBot forms use **choice value === label** (e.g. `"General"`,
`"Ally"`). `lookupChoice` in `_dailybot.ts` maps site slugs to labels. Do not
invent a parallel slugified POST contract — the API rejects it.

Booleans send JSON `true` / `false`, not `"Yes"` / `"No"`.

## The conduct form's anonymity guarantee

When `anonymous` is set, the handler clears `email` **before** any mapping, so:

- No name or email reaches DailyBot, even if the client sends them.
- No Resend acknowledgement fires, because there is nowhere to send it.

`tests/unit/functions/contact-dailybot.test.ts` pins both behaviours, including
the case where a client sneaks an address into an anonymous payload.

## Error mapping

| Upstream | Returned | `error` |
|----------|----------|---------|
| No `DAILYBOT_API_KEY` | 503 | `backend_not_configured` |
| DailyBot 401 / 403 | 502 | `backend_not_configured` |
| DailyBot rejects a choice | 400 | `invalid_choice` |
| DailyBot missing required | 400 | `missing_required` |
| Network failure | 502 | `send_failed` |

A 401 from DailyBot is our misconfiguration, not the caller's — the client gets
a 502 and a message that does not leak the upstream status.

## Related

- [Contact Form](./CONTACT_FORM.md) — the client-side component contract
- [Security](../SECURITY.md) — the threat model these rules come from
