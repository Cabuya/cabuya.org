---
title: FAQ
description: The four questions that block adoption — licensing, person-level data, identifiers and shutting down — each answered against its normative anchor.
section: consuming
order: 2
jsonld: faq
updated: 2026-08-17
---

Four questions come up before anyone writes a line of code, and none of them
are technical. Each answer links the part of the specification it comes from,
so you can check it rather than take our word for it.

## Do I have to change my licence?

You have to *declare* one. That is different, and it is the only licensing
requirement in the protocol.

`license` is REQUIRED in both the manifest and every feed envelope, as an SPDX
identifier. It is required because its absence is the single most common thing
that stops a consumer's legal review. The survey the protocol was designed from
found a declared licence in **one of the twenty applications** it examined
(*PROTOCOL_DESIGN.md* §3.1, from the twenty app dossiers probed on 2026-08-16);
the other nineteen are unusable by anyone who has to ask a lawyer first, however
open they intend to be.

The protocol does not tell you *which* licence. It does not require CC0, it
does not require attribution, and it does not require permissive terms. A
publisher who reserves all rights and says so is conforming; a publisher who
means to be open and says nothing is not.

`permitted_use` sits alongside it for the uses a licence identifier does not
cleanly express — whether your data may be aggregated, displayed, used to
answer questions by an AI system. Consumers are required to honour it
([§4.3](/developers/spec/0.1/4-api-surface#4-3), rule 6), and the reference
tooling refuses those fetches by construction rather than by policy.

## Can I publish if my app holds personal data?

Yes, and this is the question the protocol's design was most careful about.

The rule is a **join prohibition, not a field omission**
([§7.1](/developers/spec/0.1/7-normative-exclusions#7-1)). Leaving names out of
your feed is necessary and not sufficient. What is prohibited is combining
protocol data with person-level sources — and grants are entity-scoped, so an
application holding both shelter locations and a missing-persons list federates
only its non-person entities, from surfaces that do not co-serve person data.

Concretely, for an app in that position:

- Publish the places. Serve them from an endpoint that does not also serve
  person records.
- Strip personal data from free text before publishing. `description` and
  `warning_text` are the third leak channel and the one people forget; the
  validator runs a deny-list over them.
- Contact values do not travel at all
  ([§7.2](/developers/spec/0.1/7-normative-exclusions#7-2)). `public_url` plus
  a link-out is the mechanism, and `contact_available` carries the *fact* that
  someone can be reached, never the number.
- People-domain integration is link-out only, permanently. It converges on the
  official channels, which the [registry](/registry) lists as `official_source`
  entries precisely so nobody has to invent a destination.

## Do I have to rewrite my identifiers?

No. This is the design decision the protocol is most pleased with.

A record's identity is `{publisher_id}:{local_id}`
([§5.1](/developers/spec/0.1/5-identifiers#5-1)). `publisher_id` is assigned
once, by pull request, and is human-readable. `local_id` is **whatever your
database already uses** — an integer, a UUID, a hex string, a slug. All of them
conform unchanged.

That gives global uniqueness with zero coordination. No central id service, no
migration, no mapping table, no one to ask. If your shelters are rows 1 through
40 in a Postgres table, your qualified ids are `yourapp:1` through `yourapp:40`
and you are done.

Three rules do apply: ids must be stable across edits, must not embed personal
data, and must never be minted inside another publisher's namespace — the write
API answers 409 if you try, which is a protocol-level guarantee that nobody can
speak on your behalf.

## What happens if we shut down?

The protocol has a procedure for this, and using it is a kindness to everyone
who built on your data
([§7.4](/developers/spec/0.1/7-normative-exclusions#7-4)).

An orderly wind-down: freeze your feeds with a final `last_updated`, publish
`sunset_at` in your manifest, and then either transfer custody of the records to
a named publisher — who republishes them with the provenance chain intact — or
declare them archived.

The registry marks you `archived`, and **your `publisher_id` is never
reassigned**. That last part matters more than it sounds. Every qualified id
you ever published stays resolvable as a historical reference, and no future
publisher can inherit your namespace and appear to have said something you did
not.

The unstated alternative — going quiet — is what the freshness rules are built
to survive. A consumer who is honouring
[the rules](/developers/consume) shows your records ageing, distinguishes them
past seven days, and does not silently hide them. That degrades gracefully. But
it makes your consumers guess, and the guess costs somebody a wasted trip.

## Anything else

The specification is short and readable end to end — about 3,600 words across
nine sections and an appendix, which is twenty minutes at a technical reading
pace. You can [start at the top](/developers/spec).

If a question about adoption is not answered anywhere, that is a bug in the
documentation and worth an issue. If it is not answered because we have not
decided, the answer will say so rather than sound confident.

Looking for the non-technical questions — what Cabuya is, what installing the
skill produces, why no phone numbers appear? Those live in the
[general FAQ](/faq).
