# MESA_TECNICA_ALIGNMENT.md — Iteration vs. the Interoperability Report

> **TL;DR**
> The mesa técnica's report (*Marco de interoperabilidad de datos entre
> plataformas de respuesta a emergencias*, 2026-08-16, borrador para discusión)
> **independently confirms the core of our design** — place registry as the
> indispensable piece, vocabulary divergence as the main obstacle, need/offer as
> the only new format worth writing — and contributes four things we adopt:
> the **HXL/CSV on-ramp**, the **CAP reference for alerts**, the **official-registry
> convergence** for people verticals, and the **fraud-countermeasure framing**
> that opens an institutional door (Alcaldía + UNGRD). One factual delta: their
> interface census (2 verified) undercounts what our deeper probe found
> (4 APIs + 3 MCPs) — our number stands, with evidence.

Source: `/app/tmp/informe-interoperabilidad.pdf` (Mesa Técnica de Plataformas de
Respuesta · Emergencia Eje Cafetero, 16-ago-2026). Institutional context it
establishes: a **mesa técnica** met on 2026-08-15, named fragmentation/duplication
as the central problem, and formally assigned the inter-app protocol task — the
"working group" our plan modeled now has an institutional anchor and a date.

## 1. What the report confirms (independent convergence)

| Report claim | Our analysis | Verdict |
|---|---|---|
| Place registry with canonical id "no existe y resulta indispensable" (cuadro 4) | The entire v0.1 (`PROTOCOL_DESIGN.md`; duplicate-place evidence in `APPS_MATRIX.md` §2.1) | ✅ Same conclusion, reached from different evidence (their press/institutional review; our 20-app probe) |
| Main obstacle = vocabulary divergence, not missing interfaces (cuadro 2: refugio/shelter/Albergue) | Finding #4: no enum is a superset of any other; crosswalks + `origin_category` | ✅ Their cuadro 2 is our crosswalk problem, with the same fix: dictionary, not new format |
| Need/offer = only case justifying new format; `fuente`+`idEnFuente` for dedup | Our write-API idempotency (`source`+`external_id`) and v0.2 need/offer | ✅ Identical mechanism, same field pair |
| "Spec without a validating implementation stays a document" (hoja de ruta §4) | RC-ships-first rule (verdict I) + walking skeleton | ✅ Same principle |
| Their example `lugarCanonico` declaration (fig. 1) — platform keeps its record, *declares* correspondence | Our `same_as` claims (one-hop, non-authoritative) + registry place index (Q4, v0.2) | ✅ Structurally identical; their `CO-RIS-PER-ACOPIO-0007` shape adopted for registry ids (M5) |
| Expofuturo / Coliseo Mayor duplication cases | Same physical cases in our §2.1 tables | ✅ Down to the same buildings |

**Why this convergence matters for adoption:** the mesa can be told, truthfully,
that two independent analyses (theirs institutional, ours technical-forensic)
arrived at the same architecture. That is the strongest possible argument that
the design is right-sized.

## 2. What we adopt from the report (changes applied)

### 2.1 HXL/CSV on-ramp (the biggest addition)

The report's §7.4 is right about something our ladder missed: for teams with no
dev capacity mid-emergency, **even an afternoon of agent-assisted work is too
much** — but adding one row of HXL hashtags (`#loc+name`, `#cap`, `#reached`,
`#contact+phone`…) to an existing spreadsheet is feasible for anyone.

**Adopted as follows (design amendment, PROTOCOL_DESIGN Addendum A):**
- An HXL-tagged CSV published at a stable URL is an accepted **input format**:
  the Cabuya skill (`implement` flow) and the validator's `convert` mode
  transform it into a conforming JSON feed — the sheet stays the team's working
  tool; the feed is generated from it.
- This does NOT add a second canonical format (the one-schema-four-transports
  rule holds); it adds a **generator path**. Conformance is still measured on
  the produced JSON feed.
- PII note: the report's own HXL example includes `#contact+phone` — Cabuya's
  converter MUST drop contact columns per §7.2 (contact never travels) unless
  they are declared institutional. The dictionary of HXL tags → place fields
  ships with the converter.
- Report's goal adopted as a metric: **from 2 machine-readable sources to 10**
  (added to success metrics).

### 2.2 Alerts vertical → CAP (Q1 updated)

CAP is officially adopted in Colombia (IDEAM, UNGRD, Google Public Alerts;
first country in the region). Our Q1 default deferred hazards/road closures to
a v0.2 `hazard_notice` we would design. **Updated: v0.2 hazards will REFERENCE
CAP, not invent** — a Cabuya publisher emitting an alert SHOULD publish CAP
(the report's fig. 2 shows exactly this) and the registry records CAP endpoints.
Interop with the national alert system comes free.

### 2.3 People verticals → official-registry convergence (G2 sharpened)

We had: person data never federates; people apps are link-out only. The report
adds where the link-out should *point*: **damnificados → Registro Único de
Damnificados (UNGRD); desaparecidos → canal de la Cruz Roja Colombiana (RCF)**.
Their figure is sobering: 4,344 people listed across 3 citizen platforms in
parallel to the official channel — plus 2 more people-platforms found in press
("Colombia te busca", desaparecidos.co) beyond our 20. Amendment: the protocol's
normative exclusion section now RECOMMENDS that people-domain tools display and
link the official channels; the registry records those channels as
`official_source` entries. Convergence is their teams' decision — we make the
official path visible, we do not force migration.

### 2.4 Fraud-countermeasure framing + institutional track

Police/DIJIN alerts about fake donation campaigns mean 20+ legitimate sites
asking for personal data are cover for fraud. **A verified, PR-reviewed registry
of legitimate points is itself a fraud countermeasure** — a public-utility
argument we did not have. Adopted:
- `EXECUTION_PLAN.md` phase 4 gains task 4.6: present the registry to the
  Alcaldía (PMU) and UNGRD with this framing (the report's hoja de ruta §5).
- The registry's `suspended` state (§7.5) and measured badges make the
  anti-fraud property real, not declarative.

### 2.5 Equivalence dictionary as a named early deliverable

Our crosswalks existed inside `ENTITY_MODEL.md` §4.2; the report makes
"publicación del diccionario de equivalencias" step 1 of its roadmap — cheapest,
enables everything. Adopted: the dictionary ships as a standalone page + JSON on
cabuya.org in Phase 1 (spec `vocab/` folder), not buried in the entity model.

### 2.6 Covered-quantity field reserved (v0.2)

`cantidadCubierta` (their fig. 3) is the field that prevents "400 units arriving
where 40 were asked" (their §2.3 evidence: saturated urban collection centers
while rural Chocó went unserved 6 days). Reserved in the v0.2 need/offer draft
as `quantity_covered` alongside `quantity_required` — consistent with the
`needs[]` extended shape we already reserved.

## 3. Factual deltas (where our data stands)

| Report | Ours | Resolution |
|---|---|---|
| Cuadro 1: 2 verified public interfaces (+1 unknowing de-facto) | **4 APIs + 3 MCPs verified live** (corag, pereiraresponde, pereiraayuda, reporteco; MCPs: corag, pereiraayuda, pereiraresponde) with probe evidence | Ours stands — their census predates/undersamples; the catch-all-200 discovery trap we documented explains exactly how interfaces get undercounted. Share our matrix with the mesa |
| 0 platforms adopting humanitarian standards | Same finding (0 CAP/HSDS/HXL/EDXL) | ✅ Agrees |
| 20 directory + 4 press platforms | Our 20 | The +4 (incl. 2 more missing-persons platforms) noted as registry candidates; people ones are link-out-only by rule |
| Official figures (190 dead, 1,679 injured, 260 missing P/D, 58 collapsed, ~58k children unschooled, M7.4 San José del Palmar) | We had deliberately used no figures (Rule-0) | Now citable **with their named sources** where context needs them |

## 4. What we do NOT adopt

- **EDXL-RM/HAVE beyond conceptual reference** — the report itself says
  reference-only (2008 XML); matches our PRIOR_ART verdict.
- **HSDS as a format** — the report lists it as pertinent for directories; our
  deeper license/complexity analysis (CC BY-SA spec, fee-licensed taxonomy,
  10-entity model) already concluded: take its semantics, not its format. The
  alignment doc for the mesa should explain this nuance so the two documents
  don't appear to disagree.
- **Any people-data specification** — the report agrees (referenciar, not
  especificar); nothing to change.

## 5. Effect on the roadmap

The mesa's 5-step hoja de ruta maps onto our phases almost 1:1 — reordered
only where dependency demands:

| Mesa step | Our phase |
|---|---|
| 1. Diccionario de equivalencias | Phase 1 (spec `vocab/`, standalone page) |
| 2. Registro de lugares | Phases 1–2 (spec + registry with wave-0 publishers) |
| 3. Vía HXL (2 → 10 fuentes) | Phase 3 (skill `implement` + converter; new metric) |
| 4. Formato necesidad/oferta + implementación de referencia | Phase 4 (v0.2 RFC, RC-ships-first) |
| 5. Presentación a administración municipal + UNGRD | Phase 4 task 4.6 (new) |

No phase-structure change needed — the report *validates* the sequencing and
adds one institutional task and one on-ramp.
