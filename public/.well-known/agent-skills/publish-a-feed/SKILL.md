---
name: publish-a-cabuya-feed
description: Take an application that holds collection points, needs, capacities or deliveries, and publish them as a conforming Cabuya feed — then prove it with the public validator. Use when asked to implement Cabuya, publish a feed, or reach conformance level L2.
version: 0.1
license: CC0-1.0
---

# Publish a Cabuya feed

Cabuya is an open interoperability format for emergency-aid applications: one
`place` schema, published as a static file, so any application can read any
other's data without asking permission. This skill takes you from a data model
to a conforming feed, and to a measurement you did not have to be trusted for.

## The five rules that do not bend

1. **No person-level data, ever.** The schema models places, not people. This is
   a join prohibition, not a field omission: do not publish a field, a note or
   an id that lets a reader reconstruct who was helped.
   Deny-listed keys: `name_person`, `nombre`, `nombres`, `apellido`, `apellidos`, `phone`, `telefono`, `teléfono`, `celular`, `movil`, `móvil`, `whatsapp`, `wa`, `email`, `correo`, `mail`, `cedula`, `cédula`, `documento`, `dni`, `nit_persona`, `direccion_casa`, `foto`, `photo`, `contacto`, `contact_phone`, `contact_email`, `responsable`, `encargado`, `beneficiario`, `beneficiary`, `victima`, `víctima`, `desaparecido`, `missing_person`.
   Deny-listed patterns: `email-address`, `colombian-mobile`, `intl-phone`, `whatsapp-link`, `national-id`.
2. **Conformance is measured, never declared.** Nothing you write about
   yourself makes you conforming. The validator reads what you published.
3. **A static file is enough.** L2 needs no API, no database and no account.
4. **Contact is org-level.** A role address published by the organisation, never
   a person's phone or email.
5. **Say what you do not know.** Omit a field rather than guess it. `null` and an
   invented value are not the same claim.

## Step 1 — the manifest

Serve this at `/.well-known/cabuya.json` on your own domain. It says who you
are, what you publish and under which licence.

```json
{
  "protocol": {
    "name": "cabuya",
    "spec_version": "0.1.0"
  },
  "publisher": {
    "publisher_id": "example-app",
    "canonical_url": "https://example.org"
  },
  "conformance_target": "L2",
  "license": "CC-BY-4.0",
  "permitted_use": [
    "display",
    "aggregate"
  ],
  "feeds": [
    {
      "name": "places",
      "url": "https://example.org/feeds/places.json",
      "entity": "place",
      "profile": "core"
    }
  ]
}
```

## Step 2 — the feed

One JSON file at a stable URL, in the shared schema. This one validates:

```json
{
  "last_updated": "2026-01-01T00:00:00Z",
  "ttl": 300,
  "version": "0.1.0",
  "publisher_id": "example-app",
  "license": "CC-BY-4.0",
  "permitted_use": [
    "display",
    "aggregate"
  ],
  "attribution": "Your App",
  "data": {
    "places": [
      {
        "id": "1",
        "publisher_id": "example-app",
        "name": "Coliseo Municipal",
        "place_kind": "shelter",
        "municipality_code": "66001",
        "address_text": "Avenida Ejemplo 12-34",
        "lat": 4.8133,
        "lon": -75.6961,
        "lifecycle_status": "active",
        "service_status": "open",
        "last_confirmed_at": null,
        "source": {
          "source_id": "example-app"
        },
        "public_url": "https://example.org/places/1"
      }
    ]
  }
}
```

## Step 3 — serve both correctly

- `Content-Type: application/json`
- `Access-Control-Allow-Origin: *` — the one L2 requirement a static file host
  cannot always give you; check yours before assuming.
- If your site is a single-page app, exclude both paths from the catch-all
  rewrite, or the validator receives your HTML shell and reports a parse error.

## Step 4 — measure it

Call the public validator. No key, no account, no registration:

```bash
curl -X POST https://cabuya.org/api/validate \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.org/.well-known/cabuya.json"}'
```

Findings come back with stable check ids — 43 of 62 catalogued checks are
implemented — each with a rule, a remedy and a link to the specification clause it
comes from. The catalogue: https://cabuya.org/developers/validator/checks.md

Or run the same engine locally, with no network round trip:

```bash
npx @cabuya/validator validate https://example.org/.well-known/cabuya.json
```

## Step 5 — join the registry

Open a pull request against the registry directory in https://cabuya.org/developers's
repository. Inclusion is not endorsement and the badge state is measured on our
side, never written by hand.

## The specification

Version 0.1. Every section is served as Markdown; fetch the section you need
rather than the whole document.

- **0 Introduction** — https://cabuya.org/developers/spec/0.1/0-introduction.md
- **1 Architecture — the conformance ladder** — https://cabuya.org/developers/spec/0.1/1-architecture.md
- **2 Discovery — manifest and registry** — https://cabuya.org/developers/spec/0.1/2-discovery.md
- **3 The feed (L2) — envelope and records** — https://cabuya.org/developers/spec/0.1/3-the-feed.md
- **4 The standard API surface** — https://cabuya.org/developers/spec/0.1/4-api-surface.md
- **5 Identifiers** — https://cabuya.org/developers/spec/0.1/5-identifiers.md
- **6 Trust and verification** — https://cabuya.org/developers/spec/0.1/6-trust-and-verification.md
- **7 Normative exclusions — the lines that don't move** — https://cabuya.org/developers/spec/0.1/7-normative-exclusions.md
- **8 Versioning and conformance** — https://cabuya.org/developers/spec/0.1/8-versioning-and-conformance.md
- **a Appendix A — design decisions and the implementability walkthrough (non-normative)** — https://cabuya.org/developers/spec/0.1/appendix-a-design-decisions.md

### Schemas

- `manifest` — https://cabuya.org/schemas/0.1/manifest.schema.json — Cabuya publisher manifest (v0.1)
- `place-feed` — https://cabuya.org/schemas/0.1/place-feed.schema.json — Cabuya place feed (v0.1)

### Everything, in one file

- https://cabuya.org/llms.txt — the map
- https://cabuya.org/llms-full.txt — the specification, the quickstart and every check, inlined
- https://cabuya.org/auth.md — why there is nothing to authenticate against
