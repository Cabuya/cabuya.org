# Operations — the continuity runbook

**This document exists so the project survives its current maintainers.**

Governance §6.3 requires it for a specific reason: an aid-interoperability
project whose domain lapses, whose measurement cron dies unnoticed, or whose
npm publish rights belong to one person's personal account has a single point
of failure that no amount of open licensing fixes. The protocol is public; the
infrastructure has to be operable by somebody who did not build it.

Everything here is a *fact about the deployment*. Secrets themselves live in
the platforms named below and nowhere in this repository.

---

## 1. What is running

| Surface | Where | Fails how |
|---|---|---|
| The site | Cloudflare Pages, built from `main` | A failed build leaves the previous deploy serving. |
| `/api/validate` | Pages Function | Returns 5xx; the page's paste mode still works, in-browser. |
| `/api/contact` | Pages Function | Answers 503 `not-configured` when its env is absent, and the form says so. |
| `/badge/[publisher]` | Pages Function, reads KV | An unreachable KV renders the honest "not yet measured" state. |
| `/registry/status.json` | Pages Function, reads KV | Same. |
| Re-measurement | GitHub Actions cron, writes KV | **Fails silently.** See §5 — this is the one that needs watching. |

## 2. Domains

| Name | Registrar | Renewal | Points at |
|---|---|---|---|
| `cabuya.org` | *(record the registrar and the account it sits in)* | **Auto-renew must be on.** | Cloudflare Pages |
| `cabuyaprotocol.org` | *(same)* | Auto-renew | Redirects to `cabuya.org` |

**Both domains must be registered to the project's organisational account, not
to an individual.** A domain in a personal account is the most common way an
open project loses its identity, and it is not recoverable by anyone else.

Every schema `$id` is an absolute URL under `cabuya.org`. If the domain moves,
the published schemas break for every consumer that resolves them — so a
domain change is a specification change and goes through an RFC.

## 3. Cloudflare surface

| Thing | Name | Notes |
|---|---|---|
| Pages project | `cabuya-org` | Production branch `main`; previews on pull requests |
| KV namespace | `REGISTRY_STATUS` | Measured badge state. **Never in git** — that is what makes the badge a measurement |
| KV namespace | `VALIDATE_RATE` | Two rate-limit counters. Nothing else, by design |
| Web Analytics | site token | Cookieless. Absent by default, so forks and local builds send nothing |

Access should be by organisation account with at least two people holding
admin. A single-owner Cloudflare account is the same failure mode as a
single-owner domain.

## 4. Secrets, and their scopes

Nothing here is in the repository. `.dev.vars.example` names them all with
empty values.

| Secret | Lives in | Scope | Rotate when |
|---|---|---|---|
| `CF_KV_READ_TOKEN` | Pages build env | **Read-only, one namespace** (`REGISTRY_STATUS`) | A maintainer leaves; on suspicion; otherwise annually |
| `CF_KV_WRITE_TOKEN` | The revalidation workflow's secrets **only** | Write, one namespace | Same |
| `DAILYBOT_API_KEY` | `/api/contact` env | The one form | Same |
| `DAILYBOT_FORM_ID`, `DAILYBOT_FORM_QUESTIONS` | Same | Configuration, not credentials | On form change |
| `NPM_TOKEN` | The release workflow's secrets | Publish `@cabuya/validator` | Same |

**The read and write tokens are deliberately separate.** Nothing served from a
Function can write a conformance state — a compromised site cannot award
itself a badge. That property is worth more than the convenience of one token.

**`/api/validate` holds no secret at all**, and that is a design decision worth
preserving: a service that fetches arbitrary URLs *and* holds a credential is
a much more attractive target than one that does not.

### Rotating one

1. Create the replacement in the platform, with the same narrow scope.
2. Set it in the consuming environment.
3. Confirm the surface works (a badge renders; the form accepts a message).
4. **Then** revoke the old one.
5. Note the date in this file's table.

## 5. The measurement cron — the one that fails silently

`revalidate.yml` re-measures every registry entry on a schedule and writes the
result to KV. It is the only thing that makes a badge a measurement rather
than a claim.

**If it stops, nothing breaks visibly.** Badges keep rendering their last
state, growing quietly stale, until somebody notices that every entry was
"checked" three weeks ago. That is the failure this section exists to prevent.

- **The `stale` state is the tripwire.** A passing feed whose `last_updated`
  is beyond 7 × `ttl` is rendered `stale` rather than `conforming`. If
  everything goes stale at once, suspect the cron, not the publishers.
- **Check it monthly**, or wire an alert on workflow failure. GitHub disables
  scheduled workflows on repositories with no activity for 60 days — which is
  a realistic state for a specification repository between releases, and is
  the most likely way this dies.
- **Dry-run it any time**: `pnpm run revalidate:dry-run` shows every
  transition it would make, against the live feeds, writing nothing.

## 6. Publishing

| Artifact | Where | Who |
|---|---|---|
| `@cabuya/validator` | npm | Release workflow, using `NPM_TOKEN`. **The npm package must be owned by an organisation with at least two owners.** |
| The skill pack | `Cabuya/cabuya-skill`, git | Tagged releases |
| The specification | This repository, `spec/` | RFC → merge → tag |

A validator release is a consequential act: publishers' CI pins a range, so a
bad publish reaches everyone who runs conformance in CI. The release workflow
runs the full suite, and a version whose acceptance run is not recorded does
not ship.

## 7. Who can do what

| Capability | Who should hold it | Minimum |
|---|---|---|
| Merge to `main` | Maintainers | 2 |
| Cloudflare admin | Maintainers | 2 |
| Domain registrar | Organisation account | 2 |
| npm publish | Organisation | 2 |
| Registry entry review | Maintainers + working group | 2 |

**Two is the number throughout, and the reason is bus factor rather than
suspicion.** Anything one person can do alone is something the project loses
when that person is unavailable — which, for a project about emergency
response, is a state to plan for rather than hope against.

`MAINTAINERS.md` names who holds these today.

## 8. If the site is down

1. **Check the Pages deployment log.** A failed build leaves the previous
   deploy serving, so "the site is old" and "the site is down" are different
   problems.
2. **Check Cloudflare status** before assuming it is us.
3. **The specification is not down.** It is in git, and the skill pack vendors
   a checksummed copy — an adopter mid-implementation is unblocked either way.
   Say so when you post about an outage; it is the useful thing to say.
4. Roll back by redeploying the previous successful build from the Pages
   dashboard. There is no database to migrate and no state to reconcile.

## 9. If a publisher's data is wrong

Not our data, and not our fix. The registry records where a feed is; the
publisher owns what is in it.

- **A wrong record** → the publisher. Their `public_url` is on every record.
- **A feed that stopped conforming** → the cron will mark it `failing`, which
  is the system working. The publisher gets the finding; we do not edit
  anybody's data.
- **Person-level data in a public feed** → this is the emergency case. Treat
  it as a security incident: contact the publisher directly and immediately,
  and remove the entry from the registry while it is unresolved. `SECURITY.md`
  has the disclosure path.

## 10. Keeping this document true

It goes stale silently, like the cron. Review it:

- when a secret is rotated (update the table),
- when a maintainer joins or leaves (update §7 and `MAINTAINERS.md`),
- when a platform changes,
- and at every release, as part of the checklist.

A runbook nobody has read since it was written is a runbook that will not work
on the day it is needed. If you are reading this in an incident and something
is wrong, fix the document afterwards — that is part of the incident.
