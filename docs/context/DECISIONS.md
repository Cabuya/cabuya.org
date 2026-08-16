# DECISIONS.md — Ratified Decisions (authoritative log)

> Status legend: **DECIDED** = ratified by the founder/group, execution may rely
> on it. **DEFAULT** = recommended default from the analysis, adopted unless the
> working group objects (silence resolves to it). Last updated 2026-08-16.

## Identity & brand — DECIDED

| # | Decision | Detail |
|---|---|---|
| I1 | **Name: Cabuya** | Selected from the verified 47-candidate analysis (`BRAND_AND_NAMING.md`); story: *la fibra con la que se amarra lo que nadie puede cargar solo* |
| I2 | **Domains: `cabuya.org` (canonical) + `cabuyaprotocol.org` (compound)** | `.org` because open standards live there; the compound owns the search unit "Cabuya Protocol / Protocolo Cabuya" and blocks confusion sites. `cabuya.com` is held by a third party since 2003 (Cloudflare registrar, expires 2026-10-17) — not needed, not pursued; optional cheap backorder noted |
| I3 | **Brand architecture: master brand + sub-brand** | `Cabuya` (movement/master) · `Protocolo Cabuya` / `Cabuya Protocol` (the spec) · products as `Cabuya {product}` |
| I4 | **Logo & palette: FINAL, delivered** | `brand/cabuya-logo-and-palette.png` — braided-rope C mark + wordmark, dark-mode variant, isologo. Palette: Forest `#0B3D32`, Fique `#C79A4A`, Night `#082A24`, Ivory `#F6F3ED`, White `#FAF9F6`. Measured contrast rules in `brand/PALETTE.md` (Fique NEVER text-on-light; `fique-strong` variant to be derived) |
| I5 | **Badge language** | «Compatible con Cabuya 1.0» — version-scoped, validator-measured; never "Powered by" |
| I6 | Group announcement text | Drafted and approved (WhatsApp version) — name, domains, and what they represent |

## Product & repos — DECIDED

| # | Decision | Detail |
|---|---|---|
| P1 | **Exactly 2 repos: `cabuya-website` + `cabuya-skill`** | Website = landing + `/developers` portal with the **same architecture as CoragWeb** (Astro 7/Sätteri/Svelte 5/Tailwind 4 tokens/Biome/page-wrapper/ES-EN/.md twins/gates). Skill = agent pack modeled on the DailyBot + DeepWorkPlan packs |
| P2 | Spec home: website repo, bounded CC0 `spec/` dir | Own CHANGELOG, no-imports rule, published extraction procedure (`PRODUCTS_BLUEPRINT.md` §1.4) |
| P3 | **Protocol end-state: standardized expose+consume APIs** | One schema, four transports: static feed ≡ read API ≡ write API ≡ MCP. Write = `source`+`external_id` idempotency. The founding goal is that the apps feed each other |
| P4 | v0.1 entity: `place` | Needs/offers, rentals, hazards → v0.2 RFCs |
| P5 | Well-known path | `/.well-known/cabuya.json` |
| P6 | npm scope | `@cabuya/validator` (validator 1 engine / 4 harnesses, TypeScript) |

## Principles & governance — DECIDED

| # | Decision | Detail |
|---|---|---|
| G1 | **Founding principle: «Crecemos juntos: no competimos, nos alimentamos»** | Article 0 of RFC-0; the cultural contract of membership |
| G2 | Person-level data NEVER federates | Join prohibition, not field omission; link-out only — and per the mesa técnica report, link-out SHOULD converge to the **official channels** (Cruz Roja RCF for missing persons; Registro Único de Damnificados/UNGRD for affected people) |
| G3 | Governance Model B now, Model C pre-committed | Maintainer council; ≥2 non-Corag co-maintainers before v1.0; 2-seat org cap; no casting vote; escape hatch |
| G4 | Licensing | Spec CC0 · code Apache-2.0 · data license declared per feed · badge use conformance-gated |
| G5 | Conformance is measured, never declared | Validator + scheduled registry re-validation; suspension procedure §7.5 |
| G6 | North star | The initiative seeds a lasting regional tech ecosystem ("Silicon Valley colombiano") — stated as vision + preconditions, never invented traction |

## From the Mesa Técnica report (2026-08-16) — adopted into the design

| # | Decision | Detail |
|---|---|---|
| M1 | **Scope confirmation: specify 2 verticals, reference 3** | Places + need/offer are specified by Cabuya; damnificados → Registro Único (UNGRD), desaparecidos → Cruz Roja, alertas → **CAP** (officially adopted in Colombia). Matches and sharpens our v0.1/v0.2 tiering |
| M2 | **HXL/CSV on-ramp added below L2** | A spreadsheet with one HXL tag row is an accepted *input* format: the skill/validator converts it to a conforming feed. Goal from the report: from 2 machine-readable sources to 10 |
| M3 | **Place registry doubles as fraud countermeasure** | Police fraud alerts make a verified registry of legitimate points an institutional argument; presentation to Alcaldía + UNGRD added to the roadmap |
| M4 | Equivalence dictionary is an explicit early deliverable | Our crosswalks (`ENTITY_MODEL.md` §4.2) get published standalone as *diccionario de equivalencias* — the report's step 1, cheapest enabler |
| M5 | Canonical place-ID shape harmonized | Registry place ids follow the mesa's human-legible shape (`CO-RIS-PER-ACOPIO-0007` style) mapped 1:1 to our DIVIPOLA-scoped scheme; record identity stays `{publisher_id}:{local_id}` |
| M6 | `cantidadCubierta` reserved | The report's covered-quantity field enters the v0.2 need/offer draft (prevents 400 units arriving where 40 were needed) |
| M7 | Official figures now citable | M7.4, epicenter San José del Palmar (Chocó); 190 dead / 1,679 injured (Infobae 11-ago); 260 missing + 58 collapsed structures Pereira/Dosquebradas (El Espectador) — cite with source, per Rule-0 |

Full alignment analysis: `MESA_TECNICA_ALIGNMENT.md`.

## Still open (working-group DEFAULTs, unchanged)

Entity-model Q1–Q10 defaults (with Q1 hazards now updated: **reference CAP, don't
invent** — see M1) · blueprint decisions #2–#10 · data-license default table ·
wave-1 first asks. See `EXECUTION_PLAN.md` §5.
