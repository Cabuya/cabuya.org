---
title: Profiles
description: Core is the conformance floor and every field in it is machine-checkable. Extended is depth you declare. How a shared extension becomes a named profile.
section: reference
order: 3
updated: 2026-08-17
---

A profile is a named set of fields with a versioned URI. There are two today,
and the difference between them is not "basic" and "advanced" — it is
**required of everyone** and **declared by you**.

## Core — the floor

`Core` is what L2 conformance means: a manifest, and at least one `places` feed
whose every record carries the required set. The full list, with why each field
is in it, is in
[the profile document](/developers/spec/0.1/8-versioning-and-conformance#8-2)
and its source is `spec/profiles/core.md`.

The set is short on purpose. Nine fields per record and five in the envelope —
enough that a consumer can attribute a record, locate it, link out to it, and
say how old it is, and not one field more. Everything a consumer needs to
behave correctly under the [consumption rules](/developers/consume) is in Core;
everything else is optional.

One property is worth stating on its own, because it is the reason the floor
holds:

> **Everything in Core is validator-checkable.**

That is the [§8.2](/developers/spec/0.1/8-versioning-and-conformance#8-2)
editorial rule doing its job — *a MUST that a script cannot validate SHOULD be
a SHOULD*. A requirement nobody can measure is a requirement that quietly
becomes optional, and then the floor is wherever each publisher decided it was.

## Extended — declared depth

`Extended` is Core plus the optional depth already reserved in the schema:
capacity and occupancy, needs summaries, opening hours, media, and
`institutional_contact`.

Two things about it are load-bearing:

**You declare it per feed**, in the manifest's `feeds[].profile`. Not per
publisher, not globally. A publisher whose shelter feed carries capacity and
whose collection-point feed does not is a normal publisher, not an inconsistent
one.

**An absent Extended field is never a Core failure.** The validator measures
Extended fields only where you declared them. Declaring `extended` and then
omitting `capacity` is a finding; not declaring it at all is simply not
claiming it.

`institutional_contact` deserves its own warning. It is org-owned numbers only,
and [§7.2](/developers/spec/0.1/7-normative-exclusions#7-2) still binds inside
it: a personal phone number does not become publishable by being placed in an
Extended field. No profile ever relaxes an exclusion. Profiles add fields;
[§7](/developers/spec/0.1/7-normative-exclusions) removes them, and removal
wins.

## Extending before there is a profile

You do not need permission to add a field, and you do not need to wait.

`x_{publisher}_{field}` extensions are always legal, and
[§8.4](/developers/spec/0.1/8-versioning-and-conformance#8-4) requires
consumers to preserve unknown members and forbids failing validation on them.
So a publisher who needs *water pressure at the tap* or *whether the ramp is
usable* can ship it tomorrow, under their own namespace, and no consumer
breaks.

The namespace prefix is what makes this safe. Two publishers who both invent
`capacity_note` have collided; `x_pereira_ayuda_capacity_note` and
`x_reporteco_capacity_note` have not, and the collision is exactly the thing
that would otherwise force coordination before anyone can experiment.

## How an extension becomes a profile

The path is deliberately slow at the start and fast at the end.

1. **Publishers converge in the wild.** People ship `x_` extensions because
   they need them. Nothing is proposed yet.
2. **Two or more publishers ship the same shape.** This is the threshold, and
   it is a threshold about running code rather than about agreement in a
   meeting. One publisher with an extension has a local need; two with the same
   extension have found something the protocol is missing.
3. **An RFC proposes it** as a named profile at a versioned public URI, and
   goes through the standard RFC rules.
4. **On acceptance the fields move** out of the `x_` namespace into the
   profile's schema, in the next MINOR.

The same principle governs the spec itself:
[§8.1](/developers/spec/0.1/8-versioning-and-conformance#8-1) says a release
candidate becomes normative only after at least one publisher has shipped it
publicly. The specification never outruns its implementers. A profile promoted
because it seemed like a good idea is a profile that ships fields nobody
populates, and a schema full of empty optional fields teaches implementers to
ignore the schema.

## What this means in practice

If you are starting: target Core, ignore Extended, and get measured. Core is an
afternoon's work for a small application, which is the design constraint the
protocol was built to hold
([§1.4](/developers/spec/0.1/1-architecture#1-4)).

If you already have depth in your data: declare `extended` on the feeds that
carry it, and put anything the profile does not cover under your `x_`
namespace. You lose nothing by doing this and you make the case for the next
profile.

If you think a field belongs in the protocol: ship it as an extension first.
Then find the other publisher who needs it. That conversation is the RFC.
