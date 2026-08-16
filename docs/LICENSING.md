# Licensing — the two-layer split

This repository deliberately carries **two licenses**, scoped by directory.

## The split

| Scope | License | Why |
|---|---|---|
| Everything by default — site code, components, build scripts, `packages/validator`, docs | **Apache-2.0** ([`LICENSE`](../LICENSE)) | A permissive license with an explicit patent grant, appropriate for code other teams embed in their own products |
| `spec/` — the normative Cabuya Protocol text, JSON Schemas, examples, RFCs | **CC0-1.0** (directory-scoped `LICENSE`, created with the directory) | The spec is the standard itself. CC0 means anyone can implement, mirror, translate, or fork it without a license conversation — the lowest possible barrier to adoption is the point |
| `registry/` — publisher entries, events, validation history | **CC0-1.0** (directory-scoped `LICENSE`) | The registry is public-interest data. CC0 makes it a mirrorable, reusable dataset with no strings attached |

**Rule of precedence:** a directory-scoped `LICENSE` file wins inside its
directory. The root `LICENSE` (Apache-2.0) governs everything not covered by a
more specific one.

## Attribution for the imported baseline

This repository began as an import of the Corag institutional website
(MIT-licensed, © 2026 Corag) at commit `72395f2`. Per the MIT license's terms,
its copyright and permission notice is preserved in [`NOTICE`](../NOTICE). New
work is Apache-2.0.

## What this means in practice

- **Implementing the protocol** requires no permission and no attribution — the
  spec and schemas are CC0.
- **Reusing site or validator code** follows Apache-2.0: keep the license and
  NOTICE attributions.
- **Reusing registry data** requires nothing — it is CC0 — though each *feed*
  a publisher serves declares its own data license in its envelope (`license`
  is a required envelope field; see the spec).
- **The Cabuya name and badge** are governed separately by the trademark and
  badge policy (`TRADEMARK.md` / `/trademark`), not by these code/data
  licenses. Conformance badges are validator-measured, never self-declared.
