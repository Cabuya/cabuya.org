---
title: "How to contribute"
description: "Concrete ways to contribute to Corag: engineering, design, translation, content, field coordination and institutional partnerships."
lastUpdated: 2026-08-14
---

## Before you start

If what you want is to **ask for help, offer help or contribute money**, that
does not happen on this site — it happens in the application. This document is
for people who want to contribute by **building Corag**.

---

## Engineering

The highest-impact path is not building another aid application. It is
integrating with the one that already exists.

> **Many interfaces, one network of data.**

During an emergency several teams start building at once, each with its own
database of needs. The result is more fragmentation, not less. That is why Corag
publishes an open API: so a new application becomes a client of the same network.

**Useful things to build on top:**

- A WhatsApp or Telegram bot that publishes requests.
- An offline-capable PWA, for areas with poor signal.
- A spreadsheet importer, for organizations that already work that way.
- A dashboard for a municipality or an NGO.
- Accessibility interfaces: large text, screen reading, low bandwidth.
- Duplicate detection and data-quality checks.

Start with [the developer documentation](/en/developers).

### This site

`cabuya.org` is open. To contribute here:

```bash
pnpm install
pnpm run dev          # http://localhost:7777
```

Before opening a pull request:

```bash
pnpm run biome:check && pnpm run astro:check && pnpm run test && pnpm run build
```

Conventions that matter:

- All **code, comments and documentation in English**.
- **Public content in Spanish first**, with a real English translation. Accents
  and ñ are not optional.
- No filler. No `[TODO]`, `[TBD]` or Lorem ipsum.
- Design tokens get used, not replaced with hex values.

---

## Design

What is needed:

- A **vector master of the logo**. Today it exists only as raster, and the
  favicon wraps a bitmap.
- Illustration and diagrams that explain the model without resorting to
  photography of suffering.
- Accessibility review against real screens.

The brand guide and design system are documented in the repository.

---

## Content and translation

- Writing on the blog about humanitarian coordination, transparency or civic
  technology.
- Checking that the Spanish and the English say the same thing, not merely
  correct things separately.
- Documenting processes that currently live only in someone's head.

---

## Field coordination

The work that holds up everything else:

- Coordinating an operational front.
- Verifying reported needs.
- Accompanying deliveries and documenting the evidence.
- Keeping request statuses current.

You apply as a leader from the application.

---

## Organizations

If you represent a foundation, a company, a municipality or a community
organization, there are three ways in:

1. **Contribute capacity** — transport, storage, staff, supplies.
2. **Integrate your systems** with the API, so records are not duplicated.
3. **Back the operation**, with resources or with reach.

Write to us from [contact](/en/contact).

---

## How the work is credited

People who build appear on [contributors](/en/contributors), with their role and
area. Anyone who stops being active is not deleted: time someone donated does not
stop counting.
