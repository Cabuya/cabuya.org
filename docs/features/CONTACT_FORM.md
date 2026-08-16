# Contact and conduct intake

> **Canonical guide:** [FORMS.md](./FORMS.md) — the DailyBot architecture, the
> `_form` discriminator, the environment-driven form ids, the anonymity
> guarantee, and local testing.

`POST /api/contact` (`functions/api/contact.ts`) is the shared edge endpoint for
both public intakes. **DailyBot is the system of record.** An optional Resend
acknowledgement may run after a successful DailyBot response and never blocks it.

| Surface | Route | `_form` |
|---------|-------|---------|
| General contact | `/contact`, `/en/contact` | `contact` |
| Code of Conduct report | `/conduct#conduct-report-form` | `conduct` |

## Contact topics

`general` · `organization` · `ally` · `press` · `report` · `conduct` · `other`

The topic can be deep-linked: `/contact?topic=ally` preselects it. Several pages
do this — `/partners` links to the ally topic, `/privacy` to `report`. Retired
topics from the previous site resolve through the alias table rather than
falling through to nothing.

## Client modules

- **Validators:** `src/lib/contact-form.ts` — also the source of the canonical
  topic list and the acknowledgement email copy
- **Focus helper:** `src/lib/form-ui.ts`
- **UI:** `ContactForm.svelte`, `ConductReportForm.svelte`
- **Tests:** `tests/unit/lib/contact-form.test.ts`,
  `tests/unit/functions/contact-dailybot.test.ts`

All intakes POST JSON to `CONTACT_FORM.apiEndpoint` (default `/api/contact`).
There is no Google Forms fallback and no client-side email.

## What the forms must never collect

The contact form takes a message and a topic. Anything about a specific person's
situation — a location, a household, a need — belongs in the application, where
it is governed by the evidence and privacy rules, not in an email inbox.

If a form on this site starts asking for that, the form is in the wrong
repository.
