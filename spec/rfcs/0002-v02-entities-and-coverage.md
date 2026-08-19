---
number: 2
title: "v0.2 entities and coverage · Entidades y cobertura v0.2"
status: draft
tier: normative
opened: 2026-08-19
---

# RFC-0002 — Entidades y cobertura v0.2 · v0.2 entities and coverage (draft)

> **TL;DR / Resumen**
> Esta RFC propone el contenido de la versión 0.2 del protocolo: las entidades
> `need`/`offer` (los pedidos y ofertas de ayuda — «el albergue X necesita 50
> cobijas»), el alcance de `damage_report` como pista separable, y una
> declaración de **cobertura** en el manifiesto (`local | regional | national |
> international` más las áreas servidas) para que un consumidor encuentre los
> feeds que le importan sin descargarlos todos. Los nombres vienen reservados
> por §8.5 desde la 0.1; la evidencia viene del directorio del ecosistema
> (21 apps, `corag.app/api/ecosystem.json`, generado 2026-08-18). **Es un
> borrador para el grupo de trabajo: nada de lo escrito aquí está aceptado ni
> publicado como normativo.**
>
> This RFC proposes the substance of protocol version 0.2: the `need`/`offer`
> entities (help requests and offers — "shelter X needs 50 blankets"),
> `damage_report` scoping as a separable track, and a manifest-level
> **coverage** declaration (`local | regional | national | international` plus
> the areas served) so a consumer can find the feeds that matter without
> fetching everything. The names were reserved by §8.5 in 0.1; the evidence
> comes from the ecosystem directory (21 apps, `corag.app/api/ecosystem.json`,
> generated 2026-08-18). **A draft for the working group: nothing here is
> accepted or published as normative.**

---

# ESPAÑOL

**RFC-0002 — Entidades y cobertura v0.2**

- **Estado:** Borrador — abierto a revisión
- **Nivel:** normativa
- **Fecha:** 2026-08-19
- **Versión objetivo:** 0.2
- **Aceptación:** consenso diferido con ventana publicada (reglas del índice de
  RFCs); la revisión de Privacidad y PII puede rechazarla por sí sola; sin
  implementación de referencia no es aceptable.

## Resumen

La 0.1 publica una sola entidad, `place`, y lo hace a propósito: los lugares
son la mayor superficie de duplicación, no contienen personas y cambian
despacio (apéndice A de la 0.1). Esta RFC añade — sin renombrar ni romper
nada — lo que el ecosistema real no puede expresar hoy: los **pedidos y
ofertas de ayuda** con cantidades, el alcance del **reporte de daños**, y la
**cobertura territorial declarada** de cada publicador.

## Motivación

Regla-0: la evidencia es real y citable. El directorio del ecosistema
(`https://corag.app/api/ecosystem.json`, generado 2026-08-18; análisis en el
registro de decisiones del plan de claridad, 2026-08-19) lista 21 aplicaciones:

- **8 de 21** necesitan una entidad v0.2 para sus datos centrales: 4 de las 5
  apps de emparejamiento directo de ayuda (Corag Ayuda Directa, Pereira Unida,
  SOS Terremoto, CaliSolidario) necesitan `need`/`offer`; las apps de daños
  (SismoVision, Pereira Responde, Terremoto Colombia entre 6) necesitan
  `damage_report`.
- El caso canónico, tal como ocurre hoy: un albergue registrado en una app de
  Pereira necesita 50 cobijas; una app hecha en Cali quiere republicar ese
  pedido. Con la 0.1 puede republicar el **lugar** con su municipio y barrio,
  pero no el **pedido** con su cantidad; y sin declaración de cobertura no hay
  forma estándar de saber qué publicadores sirven a Cali sin descargar todos
  los feeds.
- 10 de las 21 apps se describen con alcance nacional y una (Help Them
  Directly) es internacional; `municipality_code` es un espacio de códigos
  DANE — válido para toda Colombia, sin dimensión de país para nada más.

## No-objetivos

- **No** se renombra `place`, su esquema, su `$id`, ni ningún ancla o check id
  de la 0.1 (las versiones publicadas no mutan).
- **No** se crean entidades de nivel personal: personas desaparecidas,
  reunificación familiar y clasificados de mascotas siguen fuera — enlace
  saliente permanente (§7).
- **No** se transporta dinero ni punteros de pago: las donaciones monetarias
  permanecen como enlace saliente a la app origen, bajo su propia
  responsabilidad.
- **No** se centraliza nada: el registro sigue listando, nunca alojando.

## Especificación

### 1. Entidad `need` (y su inversa `offer`)

Nombres exactos reservados por §8.5. Un `need` es un pedido de ayuda **de un
lugar o de una organización, nunca de una persona**. Un `offer` es su inversa
(alguien ofrece cantidades de un recurso). Ambos viajan en feeds propios
(`"entity": "need"` / `"entity": "offer"` en el manifiesto) con el mismo sobre
(envelope) de la 0.1.

Esbozo de esquema — **es un esbozo pendiente de la implementación de
referencia, no texto final**:

- Requeridos: `id`, `publisher_id`, `title`, `category` (enum de recursos:
  `blankets | food | water | medicine | tools | clothing | hygiene |
  transport | volunteers_org | other`), `quantity_required`,
  `quantity_covered`, `unit`, `place_id` **o** (`municipality_code` +
  geografía como en `place`), `lifecycle_status`, `last_confirmed_at`,
  `source`, `public_url`.
- Opcionales: `description`, `neighborhood_text`, `address_text`, `lat`/`lon`,
  `geo_precision`, `expires_at`, `confirmed_by`, `confirmation_method`,
  `same_as`, `merged_into`.
- `quantity_required`/`quantity_covered` son los campos que evitan la
  sobre-entrega a puntos saturados mientras zonas sin atender esperan (§8.5).
- La maquinaria de honestidad de `place` aplica idéntica: `last_confirmed_at`
  es un evento real de confirmación o `null`, nunca un `updated_at`.

Ejemplo completo (datos ficticios, solo nivel organización):

```json
{
  "id": "need-4821",
  "publisher_id": "corag",
  "title": "50 cobijas",
  "category": "blankets",
  "quantity_required": 50,
  "quantity_covered": 12,
  "unit": "unidades",
  "place_id": "albergue-la-badea",
  "municipality_code": "66170",
  "municipality_text": "Dosquebradas",
  "neighborhood_text": "La Badea",
  "lifecycle_status": "active",
  "last_confirmed_at": "2026-08-18T14:00:00Z",
  "source": { "source_id": "corag", "source_kind": "publisher" },
  "public_url": "https://ayuda.corag.app/pedidos/4821"
}
```

Un consumidor en otra ciudad lo muestra con el patrón de visualización de la
0.1 — «50 cobijas — Albergue La Badea · by corag · Dosquebradas, La Badea» —
y su botón de acción lleva a `public_url`: la app origen, donde está el
contacto que el feed nunca transporta.

### 2. `damage_report` — pista separable

Recomendación basada en la matriz (6 apps de daños): **entra en v0.2 como
pista separable** — su aceptación o aplazamiento no bloquea `need`/`offer`, y
viceversa. Referenciado a EDAN como fija §8.5, nunca un formato inventado.
`rental_notice` (1 app: PereiraVive) queda nombrado pero se recomienda
aplazarlo a 0.3 salvo que su publicador candidato aporte la implementación de
referencia dentro de la ventana.

### 3. Declaración de cobertura en el manifiesto

Nuevo bloque opcional `coverage` en el manifiesto (la forma exacta se discute
en esta RFC, no está decidida):

```json
{
  "coverage": {
    "scope": "regional",
    "country": "CO",
    "municipality_codes": ["66001", "66170"],
    "notes": "Pereira y Dosquebradas"
  }
}
```

- `scope`: `local | regional | national | international`.
- Motivación: enrutamiento del consumidor — «¿qué feeds sirven a Cali?» debe
  responderse leyendo manifiestos, no descargando todos los feeds.
- Guía asociada: los publicadores de cobertura amplia **DEBERÍAN** agrupar sus
  feeds por municipio (el `municipality_code` opcional por feed que ya existe
  en el manifiesto 0.1 es la semilla de este patrón).

### 4. Espacios de códigos internacionales (pregunta abierta)

`municipality_code` es DANE: cubre todos los municipios colombianos y ningún
lugar fuera. La pregunta abierta que esta RFC debe resolver antes de
aceptarse: una dimensión de país (ISO 3166-1) más una declaración de espacio
de códigos por país. Requisito no negociable: **no rompe el despliegue
colombiano** — los códigos DANE existentes siguen siendo válidos tal cual,
sin migración.

## Impacto en conformidad

- Un feed 0.1 conforme **no deja de ser conforme** (cambio aditivo → versión
  menor 0.2 según §8.1).
- Nuevos esquemas ⇒ nuevos checks del validador (esquema de `need`/`offer`,
  coherencia `quantity_covered ≤ quantity_required`, geografía, honestidad de
  `last_confirmed_at`, y los patrones de denegación de PII corriendo sobre las
  nuevas entidades).
- El manifiesto gana valores nuevos en el enum `entity` y el bloque opcional
  `coverage`; ambos ignorables por consumidores 0.1.

## Revisión de Privacidad y PII (OBLIGATORIA — puede bloquear por sí sola)

- Las entidades nuevas heredan §7 **sin cambios**: prohibición de join, cero
  valores de contacto, enlace saliente vía `public_url`.
- Un `need` es de nivel organización («el albergue X necesita 50 cobijas»),
  **nunca** de nivel persona («María necesita…»). El esquema lo fuerza:
  el pedido se ancla a `place_id` o a geografía de lugar, jamás a un nombre
  propio; los patrones de denegación del validador corren sobre `title` y
  `description`.
- ¿Identifica a una persona, sola o cruzada con otro feed público? El diseño
  responde que no; la revisión debe verificarlo con los ejemplos del esquema
  final. Si algún campo lo permite, esta RFC se rechaza en esa parte.
- Corrección y retiro: mismos mecanismos que `place` (`lifecycle_status`,
  `merged_into`, TTL del sobre).

## Migración y compatibilidad

Ninguna para publicadores 0.1: todo es aditivo. Un publicador que no quiera
publicar `need`/`offer` no cambia nada. Consumidores 0.1 ignoran entidades y
campos que no conocen.

## Implementación de referencia

Requerida antes de la aceptación (reglas del índice: «una RFC sin
implementación de referencia es revisable pero no aceptable»). Candidata
natural como primer publicador: **Corag Ayuda Directa** (gestiona pedidos,
ofertas y evidencia de entrega a nivel nacional — directorio del ecosistema).
La implementación debe incluir: un feed `need` vivo, el esquema JSON final,
fixtures válidos e inválidos, y los checks del validador.

## Alternativas consideradas

- **No hacer nada:** los 8 casos de la matriz siguen sin expresarse; cada app
  inventa su propio formato de pedidos y la fragmentación que el protocolo
  existe para evitar se reproduce una capa más arriba. Pierde.
- **Renombrar `place` a algo más genérico (p. ej. `record`):** rompe el `$id`
  publicado, los anclajes, los checks y el paquete skill, y hace el esquema
  menos preciso, no más. Pierde (registro de decisiones, 2026-08-19).
- **Meter cantidades dentro de `place` (perfil extendido):** confunde el
  inventario de un lugar con un pedido con ciclo de vida propio; imposibilita
  `quantity_covered` por pedido. Pierde.

## Preguntas abiertas

1. Forma final del bloque `coverage` (¿códigos de región intermedios? ¿solo
   municipios?).
2. Dimensión internacional: ISO 3166-1 + declaración de espacio de códigos
   por país — ¿en el sobre, en el manifiesto o en ambos?
3. ¿`offer` entra junto a `need` o se aplaza si ningún publicador la
   implementa en la ventana?
4. Enum de `category`: ¿vocabulario propio versionado en `spec/vocab/` o
   referencia a un vocabulario humanitario existente?

## Decisión (la llena un mantenedor al cerrar)

- **Resultado:** —
- **Fecha:** —
- **Ventana:** abierta 2026-08-19, cierra —
- **Aprobaciones:** —
- **Objeciones y resolución:** —

---

# ENGLISH

**RFC-0002 — v0.2 entities and coverage**

- **Status:** Draft — open for review
- **Tier:** normative
- **Created:** 2026-08-19
- **Target release:** 0.2
- **Acceptance:** lazy consensus with a published window (RFC index rules);
  the Privacy & PII review may decline on its own; not acceptable without a
  reference implementation.

## Summary

0.1 ships one entity, `place`, deliberately: places are the largest
duplication surface, non-personal and slow-changing (0.1 appendix A). This
RFC adds — renaming and breaking nothing — what the real ecosystem cannot
express today: **help requests and offers** with quantities, **damage
report** scoping, and each publisher's **declared territorial coverage**.

## Motivation

Rule-0: the evidence is real and citable. The ecosystem directory
(`https://corag.app/api/ecosystem.json`, generated 2026-08-18; analysis in
the clarity plan's decision record, 2026-08-19) lists 21 applications:

- **8 of 21** need a v0.2 entity for their core data: 4 of the 5 direct-aid
  matching apps (Corag Ayuda Directa, Pereira Unida, SOS Terremoto,
  CaliSolidario) need `need`/`offer`; the damage apps (SismoVision, Pereira
  Responde, Terremoto Colombia among 6) need `damage_report`.
- The canonical case, as it happens today: a shelter registered in a Pereira
  app needs 50 blankets; an app built in Cali wants to republish that
  request. With 0.1 it can republish the **place** with its municipality and
  neighborhood, but not the **request** with its quantity; and without a
  coverage declaration there is no standard way to know which publishers
  serve Cali short of fetching every feed.
- 10 of the 21 apps describe themselves as national and one (Help Them
  Directly) as international; `municipality_code` is a DANE code space —
  valid across Colombia, with no country dimension for anywhere else.

## Non-goals

- **No** rename of `place`, its schema, its `$id`, or any 0.1 anchor or check
  id (published versions never mutate).
- **No** person-level entities: missing persons, family reunification and pet
  classifieds stay out — permanent link-out (§7).
- **No** money transport and no payment pointers: monetary donations remain a
  link-out to the origin app, under its own accountability.
- **No** centralization: the registry keeps listing, never hosting.

## Specification

### 1. The `need` entity (and its inverse, `offer`)

Exact names reserved by §8.5. A `need` is a help request **from a place or an
organization, never from a person**. An `offer` is its inverse. Both travel
in their own feeds (`"entity": "need"` / `"entity": "offer"` in the manifest)
with the same 0.1 envelope.

Schema sketch — **a sketch pending the reference implementation, not final
text**:

- Required: `id`, `publisher_id`, `title`, `category` (resource enum:
  `blankets | food | water | medicine | tools | clothing | hygiene |
  transport | volunteers_org | other`), `quantity_required`,
  `quantity_covered`, `unit`, `place_id` **or** (`municipality_code` + the
  `place` geography fields), `lifecycle_status`, `last_confirmed_at`,
  `source`, `public_url`.
- Optional: `description`, `neighborhood_text`, `address_text`, `lat`/`lon`,
  `geo_precision`, `expires_at`, `confirmed_by`, `confirmation_method`,
  `same_as`, `merged_into`.
- `quantity_required`/`quantity_covered` are the fields that prevent
  over-delivery to saturated points while unserved zones wait (§8.5).
- The `place` honesty machinery applies unchanged: `last_confirmed_at` is a
  real confirmation event or `null`, never an `updated_at`.

Full worked example (fictional, org-level only):

```json
{
  "id": "need-4821",
  "publisher_id": "corag",
  "title": "50 cobijas",
  "category": "blankets",
  "quantity_required": 50,
  "quantity_covered": 12,
  "unit": "unidades",
  "place_id": "albergue-la-badea",
  "municipality_code": "66170",
  "municipality_text": "Dosquebradas",
  "neighborhood_text": "La Badea",
  "lifecycle_status": "active",
  "last_confirmed_at": "2026-08-18T14:00:00Z",
  "source": { "source_id": "corag", "source_kind": "publisher" },
  "public_url": "https://ayuda.corag.app/pedidos/4821"
}
```

A consumer in another city renders it with the 0.1 display pattern — "50
cobijas — Albergue La Badea · by corag · Dosquebradas, La Badea" — and its
action button goes to `public_url`: the origin app, where the contact the
feed never carries lives.

### 2. `damage_report` — a separable track

Recommendation from the matrix (6 damage apps): **enters v0.2 as a separable
track** — its acceptance or deferral does not block `need`/`offer`, and vice
versa. EDAN-referenced as §8.5 fixes, never an invented format.
`rental_notice` (1 app: PereiraVive) stays named but is recommended for
deferral to 0.3 unless its candidate publisher brings the reference
implementation within the window.

### 3. Manifest-level coverage declaration

New optional `coverage` block in the manifest (exact shape argued in this
RFC, not decided here):

```json
{
  "coverage": {
    "scope": "regional",
    "country": "CO",
    "municipality_codes": ["66001", "66170"],
    "notes": "Pereira and Dosquebradas"
  }
}
```

- `scope`: `local | regional | national | international`.
- Motivation: consumer routing — "which feeds serve Cali?" must be answerable
  by reading manifests, not by fetching every feed.
- Companion guidance: wide-coverage publishers **SHOULD** group feeds per
  municipality (the optional per-feed `municipality_code` already in the 0.1
  manifest is this pattern's seed).

### 4. International code spaces (open question)

`municipality_code` is DANE: it covers every Colombian municipality and
nowhere else. The open question this RFC must settle before acceptance: a
country dimension (ISO 3166-1) plus a per-country code-space declaration.
Non-negotiable requirement: **it does not break the Colombian deployment** —
existing DANE codes remain valid as-is, no migration.

## Conformance impact

- An existing conforming 0.1 feed does **not** stop conforming (additive
  change → minor version 0.2 per §8.1). This RFC is `normative`, not
  `breaking`.
- New schemas ⇒ new validator checks (need/offer schema, `quantity_covered ≤
  quantity_required` coherence, geography, `last_confirmed_at` honesty, and
  the PII deny-patterns running over the new entities).
- The manifest gains new `entity` enum values and the optional `coverage`
  block; both ignorable by 0.1 consumers.

## Privacy & PII review (MANDATORY — may block on its own)

- New entities inherit §7 **unchanged**: join prohibition, zero contact
  values, link-out via `public_url`.
- A `need` is org-level ("shelter X needs 50 blankets"), **never**
  person-level ("María needs…"). The schema enforces it: a request anchors to
  `place_id` or place geography, never to a person's name; the validator's
  deny-patterns run over `title` and `description`.
- Does any field, alone or joined with another public feed, identify a
  person? The design answers no; the review must verify it against the final
  schema's examples. If any field allows it, that part of this RFC is
  declined.
- Correction and withdrawal: the same mechanisms as `place`
  (`lifecycle_status`, `merged_into`, envelope TTL).

## Migration & backwards compatibility

None for 0.1 publishers: everything is additive. A publisher that never
publishes `need`/`offer` changes nothing. 0.1 consumers ignore entities and
fields they do not know.

## Reference implementation

Required before acceptance (index rules: "an RFC with no reference
implementation is reviewable but not acceptable"). Natural candidate first
publisher: **Corag Ayuda Directa** (manages live requests, offers and
delivery evidence nationally — ecosystem directory). The implementation must
include: a live `need` feed, the final JSON Schema, valid and invalid
fixtures, and the validator checks.

## Alternatives considered

- **Do nothing:** the 8 matrix cases stay inexpressible; every app invents
  its own request format and the fragmentation this protocol exists to
  prevent reproduces itself one layer up. Loses.
- **Rename `place` to something generic (e.g. `record`):** breaks the
  published `$id`, anchors, checks and the skill pack, and makes the schema
  less precise, not more. Loses (decision record, 2026-08-19).
- **Put quantities inside `place` (extended profile):** conflates a place's
  inventory with a request that has its own lifecycle; makes per-request
  `quantity_covered` impossible. Loses.

## Open questions

1. Final shape of the `coverage` block (intermediate region codes, or
   municipalities only?).
2. The international dimension: ISO 3166-1 + per-country code-space
   declaration — in the envelope, the manifest, or both?
3. Does `offer` ship alongside `need`, or defer if no publisher implements it
   within the window?
4. The `category` enum: an own versioned vocabulary under `spec/vocab/`, or a
   reference to an existing humanitarian vocabulary?

## Decision (filled in by a maintainer at merge)

- **Outcome:** —
- **Date:** —
- **Window:** opened 2026-08-19, closed —
- **Approvals:** —
- **Objections raised and how resolved:**
- **Notes:**
