# Governance

How the Cabuya Protocol is decided, by whom, and what happens if the people
currently deciding it disappear.

This file is the source. `https://cabuya.org/governance` renders it; if the two
ever disagree, this file is right.

---

## Status today

**There is no maintainer council yet.** The protocol is maintained by the
initial team that wrote the 0.1 draft. This document describes the model the
project has committed to, the criteria for joining it, and the conditions that
change it — so that nobody has to negotiate any of that later, and so that
every claim on this page can be checked against reality.

Where this document says *maintainers*, read it as *the initial maintainer
team* until `MAINTAINERS.md` lists more than one organisation.

## The neutrality gate

> **`Cabuya 1.0` cannot be tagged until at least two maintainers represent
> applications other than the founding team's.** Until then the specification
> stays at `0.x`.

This is the single most important rule here, and it is stated as a release
blocker rather than as an intention on purpose. Nineteen teams are being asked
to put a badge on their own product. Not one of them should have to trust
anybody's continued goodwill to do it, and a promise of future neutrality is
worth exactly as much as the mechanism that enforces it.

## The model

**A multi-app maintainer council now; a fiscal host pre-committed.**

Not a benevolent-dictator model, because a domain registered to one person is
not neutrality, and because a project whose entire value is durability cannot
have a bus factor of one.

Not a foundation yet, because incorporating first would spend the group's
scarce energy on bylaws during exactly the weeks when a working feed format is
what people need. A foundation is the right destination and the wrong starting
point.

### What automatically opens the migration

Any **one** of these opens an RFC to move to a fiscal host. Written down now so
it is an administrative step later rather than a political negotiation:

1. **Eight or more** independently operated conforming implementations in the
   registry, **or**
2. the project needs to **receive or hold money** — a grant, a sponsorship, an
   infrastructure bill, **or**
3. someone needs to **own the trademark** as a legal person in order to defend
   the badge, **or**
4. **two or more** maintainers request it.

Which host is deliberately not decided. Candidates to evaluate at that point
include Open Collective with a fiscal host, the Software Freedom Conservancy, a
Colombian non-profit association (*entidad sin ánimo de lucro*) willing to act
as steward, and the Linux Foundation for a mature specification. Naming one
today would be a commitment nobody has made.

## Becoming a maintainer

All four, not three:

1. **Your application publishes a conforming feed that the public validator
   passes.** Intent, meeting attendance and enthusiasm do not qualify. Shipping
   does.
2. **Two or more substantive contributions** — an accepted RFC, a reviewed
   schema change, a validator or skill contribution, or a documented interop
   test against another application's feed.
3. **Nominated by an existing maintainer**, confirmed by lazy consensus with a
   **7-day** objection window.
4. **Agreement to the Code of Conduct** and to the licensing terms.

### Composition limits

- **At most two maintainers per application or organisation**, counting anyone
  employed by, contracting for, or founding it. A council of five with three
  seats from one app is a benevolent dictatorship wearing a costume.
- **Target three to five maintainers.** Fewer than three is not a council; more
  than five makes lazy consensus slow without making it more legitimate.
- Maintainers are listed in [`MAINTAINERS.md`](MAINTAINERS.md) with the
  application they represent, so the composition limit is auditable by anyone,
  at any time, without asking.

### Emeritus and removal

A maintainer inactive for **120 days** moves to emeritus automatically — no
vote, no drama, restorable on request. Removal for cause requires a Code of
Conduct finding or a supermajority of the remaining maintainers, and is
recorded publicly with a reason.

## How decisions are made

Lazy consensus throughout: **silence is assent, an objection must be reasoned,
and the burden is on the change.**

| Tier | Scope | Requirement | Window |
|---|---|---|---|
| **Fast path** | Typos, examples, documentation, non-normative prose, CI, tests, website copy | 1 maintainer approval, merge immediately | none |
| **Normative** | Any change to a schema field, cardinality, enum, required/optional status, conformance level, or the meaning of a defined term | RFC + **2 approvals from maintainers representing 2 different applications** | **10 days** |
| **Breaking** | Removing or renaming a field, changing a type, changing conformance so an existing conforming feed stops conforming, changing governance or licensing | RFC + **majority of all maintainers**, and a written migration note | **21 days** |

**Objections.** A reasoned objection from any maintainer pauses the clock, and
must state what would resolve it. An objection with no proposed resolution path
expires after 14 days.

**Deadlock.** A normative or breaking RFC still unresolved **30 days** after its
window opened is **declined by default**, and may be reopened with new
information. The bias toward *no* is deliberate: an unshipped field costs far
less than a field twenty implementations have to live with forever.

**No casting vote.** There is no tiebreaker. The person most likely to be handed
one is precisely the person the composition limits exist to constrain.

**Emergency clause.** During a declared active emergency the fast path
additionally covers **purely additive, optional** fields — new optional
properties no conforming implementation is required to read or emit — merged on
2 approvals with a **72-hour** window, and **automatically converted into a
retroactive RFC within 14 days**. If that RFC is declined, the field is
deprecated in the next release.

This exists so nobody routes around the process when a feed is needed on
Tuesday. It cannot be used for anything that changes existing behaviour.

## The escape hatch

The clause that makes it safe to say yes. Six mechanisms, none of which depend
on anybody's goodwill:

1. **The licence is the foundation.** CC0 on the specification means anyone may
   fork, republish and continue it — legally, forever, without permission. No
   governance failure can take the specification away from the people using it.
2. **The canonical source is a git repository, and every maintainer holds a
   complete clone.** `git clone` *is* the backup. The maintainer list doubles as
   a distributed archive with a floor of three copies.
3. **Identity does not depend on a resolving URL.** Schema `$id` values are
   versioned URLs, but the validator and every SDK work fully offline from a
   vendored copy. **A conforming implementation must never require a network
   call to `cabuya.org` to validate.** Schemas ship inside the tagged release
   and inside the npm package, both content-addressable and mirrored by
   everyone who has ever installed them.
4. **Continuity clause, stated in advance.** *If the canonical domain lapses, or
   the organisation publishes nothing and merges nothing for 180 consecutive
   days, any two maintainers representing two different applications may publish
   a successor repository, announce it in the registry and on the last-known
   channels, and the community follows it. The successor inherits the version
   numbering and the obligations of this document.* Naming this before it is
   needed is the point: it converts a future crisis into a procedure.
5. **Domains and organisation accounts are held in shared custody, never
   personally.** Registrant contact is a project alias, not an individual.
6. **Nothing in the protocol may require a central service.** No mandatory
   registry lookup, no mandatory API key, no mandatory callback. The registry is
   a convenience and a discovery aid; a feed is valid whether or not the
   registry knows it exists.

The sixth is what actually makes the specification ownerless. A protocol with a
required central endpoint is owned by whoever runs that endpoint, whatever its
governance file says.

## The RFC process

A change needs an RFC when it touches a schema field, a conformance level, the
meaning of a defined term, governance, or licensing. Everything else takes the
fast path.

Anyone may open one. You do not have to be a maintainer, and you do not have to
have written any code — the person who has hit a wall implementing the
specification is often the person best placed to describe what is wrong with it.

RFCs live in `spec/rfcs/`, are numbered on merge, and are rendered at
`https://cabuya.org/rfcs`. The template is `spec/rfcs/0000-template.md`, and it
carries one mandatory section others do not:

> **Privacy & PII review — may block on its own.** Every RFC states what
> person-level data its change could make reachable, directly or by joining with
> another source. An RFC that cannot answer that question does not proceed,
> regardless of how useful the field would be.

## Code of Conduct

The [Contributor Covenant 2.1](CODE_OF_CONDUCT.md), with two project-specific
additions:

- **Reporting goes to a role alias monitored by at least two maintainers from
  two different applications** — never to a single named individual. Otherwise
  reporting a maintainer means reporting them to themselves.
- **A recusal rule.** A maintainer who is the subject of a report takes no part
  in handling it. If the alias-holders are conflicted, the remaining maintainers
  appoint a temporary handler.

## Licensing

Two layers, deliberately different:

- **The specification, the schemas and the registry: CC0-1.0.** Public domain.
  Fork it, vendor it, republish it, build a competing implementation. This is
  the escape hatch's first mechanism and it is not negotiable.
- **The code: Apache-2.0.** The validator, the website, the skill. Apache rather
  than MIT for the patent grant, which matters to the institutional adopters
  this protocol wants to reach.

**Contributions are under the DCO, not a CLA.** Sign off your commits:

```bash
git commit -s -m "your message"
```

That adds a `Signed-off-by` trailer asserting you have the right to contribute
the work, under the [Developer Certificate of Origin 1.1](https://developercertificate.org/).
CI enforces it.

A CLA is rejected for two reasons. It requires a legal entity to assign rights
to, and there isn't one. And CLA friction measurably reduces exactly the
drive-by contributions from volunteer developers that this project depends on.
The DCO gives the assurance that actually matters — *the contributor has the
right to contribute this* — with no paperwork and no counterparty.

## Changing this document

Governance changes are **breaking** by the table above: an RFC, a majority of
all maintainers, a written migration note, and 21 days.
