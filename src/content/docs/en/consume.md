---
title: Consumption rules
description: Six rules for reading another application's feed without harming the people it describes. The half of the protocol that is usually forgotten.
section: consuming
order: 0
updated: 2026-08-17
---

Publishing gets the attention. Publishing is also the easy half: you export
what you already have, and if you get it wrong, the validator tells you.

Consuming is where the damage happens. A consumer decides what a person sees
when they are looking for a place to sleep tonight — which record, how old,
whose it is, and whether the two entries that look like the same shelter are
the same shelter. Get that wrong and nobody's validator fires. Someone just
walks to a collection point that closed on Tuesday.

So the protocol has six requirements for consumers, and they are MUSTs. They
are written out in [§4.3](/developers/spec/0.1/4-api-surface#4-3) and repeated
here with what each one is actually protecting against, because a rule you
understand is a rule you will still be following in six months when the
deadline is tight.

## The six rules

### 1. Attribute

> Display the origin publisher for every foreign record.

Machine-checkable through `source.source_id`, and `attribution_required` in the
publisher's manifest makes it explicit.

**What it protects.** A phone number that does not answer, an address that is
wrong, a shelter that turned someone away — these are things people need to
report to *somebody*, and the somebody is whoever published the record, not
whoever displayed it. An unattributed aggregate makes every error yours and
fixable by nobody.

It also protects the publishers. A team that sees its own data credited in
someone else's app has a reason to keep publishing. A team that sees its work
absorbed into an unattributed pile has a reason to stop.

**Self-test.** A test that fails when a card renders without its source stamp.
Not a code review item — a test, because this is the rule that quietly erodes
first when a layout gets crowded.

### 2. Show age

> Render `last_confirmed_at` age — or *sin confirmar* when it is `null` —
> wherever a foreign record can direct a person somewhere.

Past seven days, or when `contradictions_active > 0`, the record MUST be
visually distinguished. It SHOULD NOT be silently hidden.

**What it protects.** The rule against hiding is the important half.
[§6.2](/developers/spec/0.1/6-trust-and-verification#6-2) puts it plainly:
absence of data is not evidence of closure. A stale record shown as stale lets
someone decide to call ahead. A stale record hidden looks exactly like a place
that never existed, and the person goes somewhere further away for no reason.

`sin confirmar` is not a failure state either. It means nobody has been back to
check, which is the honest condition of most records during the first week of
an emergency, and it is more useful than a confident timestamp that was copied
from `updated_at` when somebody fixed a typo.

**Self-test.** Three fixture records — fresh, eight days old, and `null` — and
an assertion about what each renders.

### 3. Do not mutate

> Never alter a foreign record's content.

Corrections and enrichments live in *your* records, linked with `same_as`.

**What it protects.** The publisher's ability to answer for their own data. The
moment a consumer edits a record in flight, the record says something its
publisher never said, and the attribution in rule 1 becomes a lie with a name
attached to it.

This is also what makes the network debuggable. If every copy of a record is
byte-identical to what its publisher served, a discrepancy is a bug in one
place. If consumers each apply their own fixes, it is a bug in *n* places and
nobody can tell which.

**Self-test.** Type-level. The foreign-record type has no setters.

### 4. Preserve chains

> An aggregator that republishes MUST keep the original `source{}` intact.

Your own identity goes in the envelope's `publisher_id` — never in the record's
provenance.

**What it protects.** Provenance across two hops. Aggregators aggregate each
other; that is fine and expected. What is not fine is the second aggregator
appearing to be the origin of a record that came from a shelter's own
spreadsheet three hops back. Chains are the difference between a network and a
game of telephone.

**Self-test.** A round-trip fixture: read a record, republish it, read it back,
assert `source{}` is unchanged.

### 5. Dedupe by claim, not by authority

> Cluster with `same_as` — one hop, non-transitive — plus accent-folded address
> and DIVIPOLA matching. Never raw display strings. Publish clusters as your
> own records.

**What it protects.** The thing that makes deduplication dangerous is that it
is a judgement, and a judgement published as a fact is a claim you made on
someone else's behalf. *Colegio San José* and *I.E. San José* may be the same
building or may be two blocks apart, and the consumer who merges them has
decided something the publishers did not.

So merge, by all means — an app showing the same shelter four times is useless.
But publish the merge as *your* record, with `same_as` pointing at the four you
merged, so the next consumer can disagree with you. One hop and
non-transitive for the same reason: `A same_as B` and `B same_as C` does not
make A and C the same place, and a transitive closure over a noisy graph
eventually merges half a city.

Never raw display strings, because *Cra 8 #12-34* and *Carrera 8 No. 12 - 34*
are the same address and *Sede A* is thirty different places.

**Self-test.** The clusters are published as the consumer's own records and
documented as such in the generated code's header.

### 6. Respect exclusions

> Never join place data with person-level sources. Never fetch from a publisher
> whose declared policy reserves reuse.

**What it protects.** Both halves are about the thing the protocol refuses to
carry.

The join prohibition ([§7.1](/developers/spec/0.1/7-normative-exclusions#7-1))
is not satisfied by leaving personal fields out of your database. It is a
prohibition on the *join*: an application holding both place data and a
missing-persons list may federate its place data and must not combine the two,
even internally, even for a feature that would be useful. That is the whole
design — a protocol that cannot be assembled into a surveillance tool by
combining two individually-harmless datasets.

The reuse half is simpler and just as firm. `permitted_use` in a manifest is
the publisher's answer to *what may be done with this*, and a consumer that
fetches anyway has decided their use matters more than the publisher's consent.
Build the refusal into the fetch layer, not into a policy document: the request
should be impossible to make, not merely discouraged.

**Self-test.** The fetch layer refuses those hosts by construction.

## What consuming well looks like

[Ayudas Colombia](https://github.com/juanptoror/aqui-ayuda) is the working
reference, open-sourced by its author for this integration effort. It is a
Vite/React application aggregating five separate backends into one view, and it
arrived at several of these rules on its own, before there was a protocol to
require them.

Its provenance component gives every source its own visual stamp — the source's
own brand colour, "so a stamp says whose the data is, not how serious it is" —
and the project's README is explicit that this is not decoration: *if a phone
does not answer or an address is wrong, you have to be able to know who
published it and who to complain to.* That is rule 1, discovered from the field
rather than from a specification. **A test fails if a card renders without a
stamp, or with the wrong one.**

It also gets the hardest part of rule 2 right, in a place the rule does not
quite reach. When its upstream API fails, the screen says so — a 500 is never
rendered as "nobody is asking for help". The README's own words: *saying there
are no needs when in fact you could not ask is disinformation in the middle of
an emergency.* Same distinction the validator draws between exit code 1 and
exit code 3, and the same reason.

The pattern worth copying wholesale: **a gap you cannot explain is worse than
an explicit zero.** Their dashboard draws all four indicators whether or not
there is data behind them, because a missing tile reads as "fine" and a zero
reads as a zero.

## Where this leaves you

If you are building a consumer, the shortest honest path is: fetch through a
layer that knows about `permitted_use` and crawl policy, store foreign records
immutably, render source and age on every card, and treat your merges as your
own opinions.

If you would rather have an agent do it, the
[agent skill](/developers/skill) turns this page into a checklist it verifies
against the code it writes, with the self-tests above.

The [registry](/registry) lists who publishes what, and what the validator last
found in each feed. Nothing there is a recommendation — read
[the note on the page](/registry) before you treat it as one.
