# EXECUTION_PLAN.md — The Master Roadmap

> **TL;DR**
> 1. **Five phases + a north star.** Phase 0 (social lock-in, weeks 1–2) converts
>    the verbal consensus into RFC-0 signatures and a name before it cools; phases
>    1–4 build spec → validator → portal+registry → skill → federation, in
>    dependency order; phase 5 sketches the long horizon (the "Silicon Valley
>    colombiano" ambition) as vision + preconditions, never as traction.
> 2. **Every phase exit is verifiable** — a green CI run, a live badge, a signed
>    PR — never "momentum" or "alignment".
> 3. **The clock is real:** one app is being absorbed into Corag *now* and the
>    national aggregator sunsets 2026-11-30. RFC-0 goes to the group in days.
> 4. **One founder + agents can carry phases 0–2 alone; phase 3 onward requires
>    the two external co-maintainers** that governance already made a condition
>    for v1.0. The founder-bottleneck section is honest about this.
> 5. Kill/pivot criteria are explicit: **< 3 independent implementations by the
>    end of phase 3 means the protocol claim fails** and the fallback is
>    documented bilateral integrations — a smaller, still-useful outcome.
>
> Standalone-readable; deep documents are linked per section. A one-page Spanish
> summary closes the document. Date: 2026-08-16. Rule-0 applies throughout: no
> invented traction, no fabricated figures; week numbers are relative to the
> working group's first message — **no external team has agreed to any date.**

**Inputs:** `DECISIONS.md` · `MESA_TECNICA_ALIGNMENT.md` · `APPS_MATRIX.md` · `ENTITY_MODEL.md` · `PRIOR_ART.md` ·
`PROTOCOL_DESIGN.md` · `BRAND_AND_NAMING.md` · `GOVERNANCE_AND_LICENSING.md` ·
`PRODUCTS_BLUEPRINT.md` (build order P0–P9, walking skeleton §7.3) ·
`ADOPTION_PLAYBOOK.md` (waves, weeks-1–2 list, risks) · `RFC-0_draft.md`.

---

## 1. Phase structure

> Adjustment vs. the original plan sketch, justified: the website/portal moves
> **ahead of** the skill (blueprint dependency: "nobody finds the skill without
> the portal"; the live validator and registry are what make the first badge
> possible), and the skill overlaps the portal's tail (P4∥P5). Everything else
> holds.

### Phase 0 — Social lock-in (weeks 1–2) · runs parallel with technical P0

| # | Task | Repo/venue | Effort | Owner type |
|---|---|---|---|---|
| 0.1 | Take `RFC-0_draft.md` to the group channel; open the signature PR | group channel + org | S | Founder |
| 0.2 | ✅ **DONE — name decided: Cabuya**; register **cabuya.org + cabuyaprotocol.org** (announcement text drafted; brand assets in `brand/`) | group channel | S | Decided; founder registers |
| 0.3 | Recruit 2 co-maintainers from non-Corag apps — first asks per evidence: **PereiraAyuda** (publicly invites interop) and **Pereira Responde** or **AquíAyuda** | direct conversations | M | Founder |
| 0.4 | Create the GitHub org (new, neutral — not `pereira-tech-talks`), `.github` repo (CoC, TRADEMARK, SECURITY), branch protection, DCO | org | S | Founder + agent |
| 0.5 | First wind-down case: document SOS Terremoto's migration under RFC-0 Art. 6/7 openly | registry (later) | S | Founder + that team |
| 0.6 | **Private security disclosures** to the four affected teams (Task 9 queue) — before any federation conversation with them | private channels | S | Founder |

**Exit:** RFC-0 signed by **≥ 8 apps** (⅖ of the directory), name chosen and
domains registered, ≥ 1 co-maintainer confirmed, org live.
**DWP note:** phase 0 needs no DWP — it is conversations plus a dozen files.

### Phase 1 — Spec v0.1 + validator (weeks 1–3) · blueprint P0–P2

| # | Task | Repo | Effort | Owner type |
|---|---|---|---|---|
| 1.1 | Populate `spec/` from `PROTOCOL_DESIGN.md` + `schemas/` + the 5 examples (name already resolved: Cabuya); CC0 stamp | website `spec/` | S | Agent-assisted |
| 1.2 | Validator core: schema + semantic + PII-deny passes; JSON+text reports; exit codes; golden corpus from the examples | website `packages/validator` | M | Agent-assisted |
| 1.3 | Behavioral probes: soft-404 (byte-equality), always-now double-probe, CORS; `probe` + `explain` commands; fixture server with the four traps | same | M | Agent-assisted |
| 1.4 | npm publish `@cabuya/validator 0.1.0`; CI action wrapper | same | S | Agent-assisted |
| 1.5 | Corag reference feed — **the convener ships first** — plus fixing Corag's own API incoherences in public (version strings, dual idempotency, casing) | ayuda.corag.app | M | Founder's team |

**Exit:** the three invalid examples fail with exactly their designed messages;
the two valid ones pass; **Corag's feed returns a green validator run** — the
first conforming implementation exists.
**DWP note:** 1.2–1.4 is a natural child DWP in the website repo
(`PLAN_validator_v01`).

### Phase 2 — Portal + registry (weeks 2–5) · blueprint P3–P4

| # | Task | Repo | Effort | Owner type |
|---|---|---|---|---|
| 2.1 | Astro scaffold with the 13 inherited CoragWeb patterns (named in `PRODUCTS_BLUEPRINT.md` §2.2); brand tokens from the vote | website | M | Agent-assisted |
| 2.2 | Landing (initiative story, "crecemos juntos" thesis, signatories) + `/developers` quickstart + versioned spec rendering + schema reference; `.md` twins + `llms.txt`; the five content gates | website | M | Agent-assisted |
| 2.3 | Live validator: `/api/validate` Pages Function (SSRF control set §2.7) + paste-JSON client mode | website | M | Agent-assisted |
| 2.4 | `registry/` with the wave-0 publishers; 6-hour re-validation cron; KV status; badge endpoint (5 states) | website | M | Agent-assisted |

**Exit:** portal live and bilingual with gates green (`md:check:strict`,
`lang:check:strict`, `parity:check:strict`); **≥ 3 measured badges rendering**,
including at least one non-green state working honestly.
**DWP note:** phase 2 is the second child DWP (`PLAN_portal_v01`); reuse this
repo's DWP conventions wholesale.

### Phase 3 — Skill + first external adopters (weeks 4–8) · blueprint P5–P6, waves 0–1

| # | Task | Repo | Effort | Owner type |
|---|---|---|---|---|
| 3.1 | Skill repo: router + `implement` + `validate` + `setup`; vendored spec (checksummed); bundled validator runner; 2 stack guides (the matrix's most common stacks: Next.js+Supabase, PHP-SSR) | skill | M | Agent-assisted |
| 3.2 | §3.8 acceptance test ("any agent installs it and knows the whole protocol") passing on **two agent harnesses**, in CI | skill | M | Agent-assisted |
| 3.3 | First external adopter end-to-end with a human from that team — first asks: PereiraAyuda, Pereira Responde, Reporte CO (all "field-mapping, not engineering") | their repos | S–M each | Community + skill |
| 3.4 | AquíAyuda as **first consumer** (L3): replace its 5 bespoke adapters with 1 protocol client | theirs | M | Community + skill |

**Exit:** **≥ 3 independent implementations** (Corag + 2 external) with green
badges — the "it's a protocol, not an export format" threshold — and one
consumer reading the network. **The walking skeleton's "done" line holds:** a
stranger goes quickstart → skill → green badge in ~45 minutes with no maintainer
message in between.

### Phase 4 — Federation + v0.2 (months 3–6) · blueprint P7–P9, waves 2–3

| # | Task | Effort | Owner type |
|---|---|---|---|
| 4.1 | `consume` + `publish-status` sub-skills; L3/L4 validator checks; write-API conformance | M | Agent-assisted + co-maintainers |
| 4.2 | Reference MCP server (after ≥ 2 live feeds — blueprint decision #9) | M | Co-maintainers |
| 4.3 | v0.2 RFCs through the process: `need`/`offer`, `rental-notice` (validated blind spot), `hazard_notice` (Q1), damage vocabulary (EDAN), registry place index (Q4) | M each | Working group |
| 4.4 | Waves 2–3 adoption (the "a decision, not code" tier — approached only now, per wave discipline) | S–M each | Community |
| 4.5 | mapadelterremoto sunset (2026-11-30): execute the first *planned* orderly wind-down under §7.4 — its open-data commitment becomes the case study | S | Founder + that team |
| 4.6 | **Institutional presentation** (mesa técnica roadmap §5): present the verified place registry to the Alcaldía (PMU) and UNGRD as a fraud countermeasure (Police/DIJIN alerts) and public-utility asset | S | Founder + co-maintainers |

**Exit:** first agent-driven network query in the wild via MCP; ≥ 1 v0.2 RFC
merged through the full process; ≥ 8 publishers with badges.

### Phase 5 — North star (year 1+; sketched, not scheduled)

The founder's stated ambition: this collaboration seeds a lasting Colombian tech
ecosystem — a *"Silicon Valley colombiano"* grown from Pereira's post-earthquake
dev community. Rule-0 framing: **vision + preconditions, zero invented traction.**

| Vector | What it looks like | Honest precondition |
|---|---|---|
| Protocol reuse beyond this event | Another emergency or region deploys the spec + skill (the registry is already event-scoped, Q10; Reporte CO is itself a fork of a Venezuela edition — portability is proven in the ecosystem) | v0.1 shipped, documented, and at least one deployment not run by the founder |
| Working group → standing community | The maintainer council becomes a recognized civic-tech body; fiscal host (governance Model C, pre-committed) | 2+ external co-maintainers active for 6+ months; a budget larger than domains |
| Talent visibility | The 20 apps + the protocol as a public portfolio: Pereira's devs demonstrably built interoperable civic infrastructure under pressure | The registry's measured history (CC0 JSONL) exists — evidence, not narrative |
| Institutional partnerships | Universities (UTP is literally a shelter in the dataset), Alcaldía (SOS Pereira is already a node), MinTIC interoperability framework alignment (`PRIOR_ART.md` §6.8) | An institution asks to *implement*, not to *sponsor*; the brand licensing rules (badge = measured conformance) survive first contact with a government logo |
| The brand carries phase 3 | Per `BRAND_AND_NAMING.md` §1.4: the name must already work as a tech-movement flag — that test was applied at selection | The name vote picked a 3-phase-surviving name |

What phase 5 is **not**: a promise of economic impact, a claim about jobs, or a
number of any kind. When someone asks "what did this become?", the answer is the
registry's history file.

## 2. Milestones

| M | Verifiable exit | Phase |
|---|---|---|
| M0 | RFC-0 ≥ 8 app signatures; name registered | 0 |
| M1 | Validator 0.1.0 published; invalid examples fail with designed messages | 1 |
| M2 | Corag feed green — first conforming implementation | 1 |
| M3 | Portal live, bilingual, gates green; 3 measured badges | 2 |
| M4 | Skill acceptance test green on 2 harnesses | 3 |
| M5 | **3 independent implementations** + 1 consumer | 3 |
| M6 | First MCP network query; first v0.2 RFC merged | 4 |
| M7 | First planned wind-down executed cleanly (mapadelterremoto) | 4 |

No vanity milestones: every row is a check a stranger can run.

## 3. Effort & resourcing honesty

- **What one founder + coding agents can carry:** all of phases 0–2 and task 3.1
  — the artifacts are files, schemas, a validator and a website, all
  agent-buildable against this plan's documents. Estimated founder attention:
  phase 0 is mostly *conversations* (the part agents cannot do); phases 1–2 are
  review + decisions on agent output.
- **What they cannot carry:** 3.3/3.4 (other teams' repos — their humans, their
  call), 4.2–4.4 (federation must not be single-maintainer — the neutrality
  argument collapses), and every group decision.
- **Founder-bottleneck mitigations, concrete:** the two co-maintainers are a
  phase-0 exit criterion, not a nice-to-have; the governance escape hatch and
  the extraction procedure (`PRODUCTS_BLUEPRINT.md` §1.4) are published up
  front; every artifact is agent-reproducible from this plan's documents, so
  continuity does not depend on any one person's memory; the RFC-0 2-seat cap
  keeps the founder's org from accumulating structural control while it carries
  early execution.

## 4. Success metrics (Rule-0-compatible — all measurable by a stranger)

| Metric | Source |
|---|---|
| Conforming publishers (badge = `conforming`) | registry KV / history JSONL |
| Independent implementations (distinct orgs) | registry |
| Registry freshness (median `last_updated` age across feeds) | history JSONL |
| Validator runs (CLI downloads + portal invocations) | npm + CF analytics (cookieless) |
| Skill installs proxy (repo clones/stars — labeled as proxy) | GitHub |
| Machine-readable sources in the ecosystem (mesa técnica goal: 2 → 10, via feeds + HXL on-ramp) | registry + validator runs |
| RFCs merged through the full process | spec/rfcs/ |
| Wind-downs executed per §7.4 vs. silent disappearances | registry states |

Explicitly **not** metrics: people helped, donations moved, lives improved —
those belong to the apps, and claiming them for the protocol would violate the
initiative's own Rule-0.

## 5. Open decisions register (consolidated)

| # | Decision | Recommended default | Argued in |
|---|---|---|---|
| D1 | Name (the vote) | Cabuya | `BRAND_AND_NAMING.md` §5 |
| D2 | Brand architecture | Master brand + `Protocolo {name}` sub-brand | `BRAND_AND_NAMING.md` §6 |
| D3 | Governance model | Model B now, Model C pre-committed | `GOVERNANCE_AND_LICENSING.md` §2 |
| D4 | Spec home | Website repo, bounded `spec/`, extraction procedure published | `PRODUCTS_BLUEPRINT.md` §1 |
| D5–D14 | Blueprint decisions 1–10 (validator arch, badges, cadence, language, analytics, announcements, msg language, MCP timing, .github repo) | Per blueprint §8 | `PRODUCTS_BLUEPRINT.md` §8 |
| D15–D24 | Entity-model Q1–Q10 (hazards, institutional phones, DIVIPOLA nullability, place-id minting, same_as transitivity, multi-kind, capacity, clustering, origin_category, event scoping) | Per entity model §9 | `ENTITY_MODEL.md` §9 |
| D25 | Data-license default recommendation | Per-feed declared; guidance table | `GOVERNANCE_AND_LICENSING.md` §4 |
| D26 | Wave-1 first asks | PereiraAyuda, Pereira Responde, AquíAyuda, Reporte CO | `ADOPTION_PLAYBOOK.md` §4 |

Silence resolves to the default; every default is written down; nothing is
decided by momentum.

## 6. Kill / pivot criteria (honest)

| Condition | Call | Fallback |
|---|---|---|
| < 8 RFC-0 signatures within 3 weeks of presentation | Pivot: the consensus was softer than reported | Bilateral integrations: Corag ↔ PereiraAyuda ↔ Pereira Responde via their existing APIs, documented publicly; the spec stays as a draft for the next emergency |
| < 3 independent implementations by end of phase 3 | **Kill the "protocol" claim** | Same fallback: documented bilateral integrations + the skill repurposed as a "publish open aid data" helper. Smaller, still real |
| Both external co-maintainer asks fail | Pause phase 4; do not build federation single-handed | Phases 1–3 artifacts remain useful as Corag's open-data surface |
| A PII incident traced to the protocol path | Full stop; RFC-0 Art. 4 review; incident report published | §7.1's join prohibition and deny-pass exist to make this near-impossible; if it happens anyway, the design was wrong and must be re-reviewed before any restart |
| Name vote deadlocks | Founder breaks the tie among the top-2 — announced as such in advance | `ADOPTION_PLAYBOOK.md` §5 mechanics |

## 7. Cross-reference index

| Need | Document |
|---|---|
| What each app is, does, exposes | `apps/APP_{slug}.md` ×20, `APPS_MATRIX.md` |
| The data model and why | `ENTITY_MODEL.md` |
| What we borrowed and from where | `PRIOR_ART.md` |
| The protocol itself | `PROTOCOL_DESIGN.md` + `schemas/` |
| The name and the brand | `BRAND_AND_NAMING.md` |
| Who decides what | `GOVERNANCE_AND_LICENSING.md` |
| What gets built, exactly | `PRODUCTS_BLUEPRINT.md` |
| Who adopts, when, and the risks | `ADOPTION_PLAYBOOK.md` |
| The founding agreement | `RFC-0_draft.md` |

---

## Resumen en una página (español)

**Qué acordamos construir.** Las apps que nacieron tras el terremoto del 10 de
agosto acordaron un protocolo unificado para compartir y consumir datos entre
todas. Este plan convierte ese acuerdo en ruta: primero lo social (RFC-0 firmado
y nombre votado — la lista corta verificada es Cabuya, Cardumen, Guadua,
Convite y Trenzia), luego lo técnico en orden de dependencia: especificación y
validador → portal de desarrolladores con registro de badges medidos → skill de
agentes que lleva a cualquier app a conformancia en una tarde → federación
(APIs de lectura/escritura y MCP).

**Por qué ya.** Una app del ecosistema se está fusionando con Corag en este
momento y el agregador nacional anunció mantenimiento solo hasta el 30 de
noviembre. La alternativa a federarse es la absorción: el RFC-0 se presenta en
días, no en meses.

**Qué encontramos.** El ecosistema real tiene 4 APIs públicas y 3 servidores
MCP (el doble de lo que creíamos), un proto-protocolo artesanal ya construido
por AquíAyuda, tres equipos que inventaron por separado el mismo modelo de
verificación de frescura, y ~20 casos concretos del mismo lugar físico
duplicado en hasta 9 espacios de identificadores — incluido un colegio "Activo"
en una app y "cerrado" en otra. El protocolo formaliza lo que la práctica ya
validó.

**Las líneas que no se mueven.** Los datos de personas jamás se federan
(prohibición de *joins*, no solo de campos); el contacto nunca viaja en un
feed; nada se obtiene por scraping; listar no es avalar; la conformancia se
mide con un validador, nunca se declara.

**Cómo se mide el éxito.** Publicadores con badge verde, implementaciones
independientes (3 = umbral de "protocolo de verdad"), frescura del registro,
RFCs fusionados. Nunca cifras de impacto humano: esas pertenecen a las apps.

**El norte.** Si esto funciona, queda sembrada la infraestructura — técnica y
social — de un ecosistema tech duradero para la región. Esa ambición se
escribe como visión con precondiciones honestas, no como promesa: cuando
alguien pregunte qué llegó a ser, la respuesta estará en el historial público
del registro.

**Siguiente paso concreto.** Presentar `RFC-0_draft.md` al canal del grupo,
abrir el PR de firmas y registrar cabuya.org y cabuyaprotocol.org (el nombre ya está decidido). Todo lo demás de la
fase 0 cabe en dos semanas.
