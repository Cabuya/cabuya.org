# Adopters

**This file is empty, and that is the honest state.**

Cabuya is a 0.1 draft. Listing an adopter before one exists would be the
first unbacked claim in a project whose whole argument is that unbacked claims
are worth nothing — and it would be the easiest one to get away with, because
nobody checks an ADOPTERS file.

When entries appear here, each one will have met the criteria below.

## What an entry means

An adopter is an application that **publishes or consumes a Cabuya feed in
production**, measured by the published validator.

Not: an organisation that has expressed interest, attended a meeting, been
mentioned in a document, or been listed in the founding analysis. Those are
real and valuable and they are not adoption.

## Criteria

An entry requires **all** of:

1. **A registry entry** at `registry/publishers/`, reviewed and merged.
2. **A measured level of L2 or above** — measured, not declared. The
   scheduled re-measurement has to have seen it pass at least once.
3. **Written opt-in from the organisation**, in the pull request that adds
   them, from somebody who can speak for it.

That third one is not a formality. **Inclusion is not endorsement, and being
listed is a claim about somebody else's organisation.** A directory lists; a
registry measures; neither gets to speak for a team that did not ask to be
spoken for.

## What an entry contains

```markdown
| Application | Municipality | Level | Since | Entry |
|---|---|---|---|---|
| Example App | Pereira (66001) | L2 | 2026-09 | [registry](registry/publishers/example-app.json) |
```

The level is a link to the measurement, never a badge pasted in by hand. If
the measurement changes, this file is wrong until it is updated — so it links
rather than restates.

## Removal

Any adopter may be removed on request, without giving a reason, by opening an
issue or a pull request. An organisation that no longer wants to be associated
with the project should not have to argue about it.

An adopter whose measured level drops stays listed with its current level —
the registry is where the live state lives, and this file is a record of who
adopted, not a leaderboard.

## Related

- [`registry/`](registry/) — the reviewed entries, with their measured state
- [`TRADEMARK.md`](TRADEMARK.md) — using the name and the badge
- [`GOVERNANCE.md`](GOVERNANCE.md) — how the specification changes
