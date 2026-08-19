---
title: Data model guide
description: A recommended way to organize an aid app's data so publishing a conforming feed is nearly free. Guidance, not a requirement — the spec binds what you publish.
section: reference
order: 4
updated: 2026-08-19
---

**This page is guidance, not a requirement.** The specification binds only
what you publish — the manifest and the feed. Your internal model is yours:
the [crosswalk](/developers/quickstart) maps whatever you already have onto
the shared schema, and nobody migrates your primary keys.

But many aid apps are built in days, during the emergency, by teams choosing
table shapes at two in the morning. If you are building now — or can still
adapt — this is the shape that makes publishing nearly free, because it is
the published shape, held internally. Five recommendations, in the order they
save you pain.

## 1. Separate what travels from what never travels

Keep personal contact — names, phones, emails, anything person-level — in its
own tables, with **no join path from the queries that build your feed**. The
protocol excludes person-level data by a
[join prohibition](/developers/spec/0.1/7-normative-exclusions), and the
cheapest way to comply is structural: a serializer that *cannot reach* contact
data cannot leak it.

| Travels (feed tables) | Never travels (contact tables) |
|---|---|
| place name, kind, status | contact person's name |
| municipality, neighborhood, coordinates | phone numbers, emails |
| quantities, confirmations, timestamps | personal media |
| the record's public page URL | anything about an individual |

## 2. Shape your core entities like the protocol's

Name and type your columns after the
[`place` schema](/developers/schemas/0.1/place-feed) where you can: `name`,
`place_kind`, `lifecycle_status`, `service_status`, `public_url`. Every field
you share with the schema is a crosswalk row that becomes the identity
function. If your app handles help requests with quantities, know that
`need`/`offer` are **proposed for v0.2 in [RFC 0002](/rfcs/0002)** — a draft,
not shipped — and shaping yours after the RFC's sketch
(`quantity_required`, `quantity_covered`, `unit`, a place or org anchor) means
you publish the day it lands.

## 3. Carry honesty fields natively

The protocol's hardest rule to retrofit: `last_confirmed_at` must be a real
confirmation event — somebody checked — or `null`. **Never a database
`updated_at`.** So store the confirmation event from day one (who confirmed,
how, when), and keep status in a status column: a record named
"Coliseo (CLOSED!!)" encodes state in a name, and no schema can read it back
out.

## 4. Geography as code + text + coordinates + precision

Store all four, from day one: the municipality **code**
(DANE in Colombia — the protocol's `municipality_code`), the municipality and
neighborhood as **text**, **coordinates** when you have them, and the
**precision** you actually have (`geo_precision`) rather than a precision you
wish you had. Free-text city names you cannot code yet are fine —
`municipality_text` with a null code is the schema's escape hatch. This is
what lets a record republished in another city still say where it is.

## 5. Stable public ids, and a public page per record

Give every record an id that never changes (your primary key, any type) and a
public detail page — the `public_url` other apps' action buttons will link
to. If a record has no public page, other apps have nowhere to send the
person who wants to act on it, and your contact rule has no mechanism.

## The two on-ramps

- **Existing app:** don't reorganize anything. Follow the
  [quickstart](/developers/quickstart) — the crosswalk maps your columns as
  they are.
- **New or adaptable app:** start from this model, and the
  [agent skill](/developers/skill) will find a crosswalk so close to identity
  that the serializer nearly writes itself.
