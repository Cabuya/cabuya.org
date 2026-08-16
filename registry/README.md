# The Cabuya registry (`registry/`)

The public, PR-reviewed record of **who publishes what** in the Cabuya
network — plus the official institutional channels the protocol links out to.
Dedicated to the public domain under **CC0-1.0** ([`LICENSE`](./LICENSE)): a
mirrorable, reusable dataset with no strings attached.

> **Aparecer en el registro no es un aval. · Inclusion is not endorsement.**
> Every entry shows its last validation timestamp and result on the site —
> the measurement, not this file, is the claim.

## What lives here — and what never does

| Here (claimed + identity-reviewed) | In KV, written ONLY by the validator (measured) |
|---|---|
| `publisher_id`, canonical URL + aliases, entity domains, declared target, crawl policy, org-level contact, status | Measured level, badge state, check results, timestamps |

A registry PR that hand-writes any measured value is rejected — *manifests
lie, behavior doesn't* (spec §8.3). The 6-hour re-validation cron appends its
public audit trail to `history/` as monthly JSONL.

## Layout

| Path | Schema | What |
|---|---|---|
| `publishers/{publisher_id}.json` | `schema/publisher-entry.schema.json` | One reviewed publisher |
| `official-sources/{id}.json` | `schema/official-source.schema.json` | Authoritative channels (Cruz Roja RCF, Registro Único/UNGRD) — link-out targets, never validated publishers |
| `events/{event_id}.json` | `schema/event.schema.json` | Registry events (figures only with named sources) |
| `history/YYYY-MM.jsonl` | — | Monthly validation audit trail (cron-written) |

## The rules

1. **Keys are canonical URL + declared aliases, never slugs** — the same app
   has shipped under three names in production.
2. **`publisher_id` is assigned once and never reassigned**, even after
   archive (spec §5.3) — ids must survive a publisher's wind-down.
3. **Contact is org-level only** (role addresses). Personal contact data is
   never merged, in any field, including notes.
4. **Crawl/reuse policy is honored by all tooling** — a publisher whose
   policy reserves reuse is never fetched, even on request.
5. **`status: proposed`** marks an entry filed on a team's behalf before
   their own confirmation: rendered as proposed, **no badge served**. It
   becomes `active` only with the publisher's say-so (their PR, their
   comment, or their manifest appearing at the canonical URL).
6. **Suspension** (spec §7.5) is public and appealable, follows the RFC
   process's lazy-consensus rules with a 48-hour emergency path for PII
   incidents, and never reassigns the id.
7. **Wind-down** (spec §7.4): `sunset_at` + `status: archived`; records
   remain valid references forever.

## Adding or correcting an entry

Open a **registry entry** issue (the form asks exactly what the schema
needs) or a PR against `publishers/`. Review follows the maintainer
checklist in the repo skill `/registry-review`: schema gate green, identity
checked, uniqueness verified (including against history — ids never come
back), contact org-level, crawl policy resolves. First response target:
48 hours.

`pnpm run registry:check` runs the integrity gate locally.
