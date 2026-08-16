---
number: 1
title: "Founding agreement · Acuerdo fundacional"
status: draft
tier: governance
opened: 2026-08-16
---

# RFC-0 — Acuerdo fundacional · Founding agreement (draft)

> **TL;DR / Resumen**
> RFC-0 es el acuerdo fundacional del protocolo `cabuya`: un documento de una
> página que abre con el artículo «Crecemos juntos: no competimos, nos alimentamos»,
> define el alcance de la v0.1 (entidad `place`, feeds estáticos, conformidad medida por
> un validador), fija los no-objetivos que ninguna RFC posterior puede levantar (datos de
> personas, scraping, rankings) y se firma por PR. Bilingüe, contenido idéntico en ambos
> idiomas. **Es una propuesta para el grupo de trabajo: ningún equipo ha aceptado nada.**
>
> RFC-0 is the protocol's founding agreement — one page, opening with the article "we grow
> together: we don't compete, we feed each other", defining v0.1's scope, its permanent
> non-goals, and how to sign. **A proposal for the working group; no team has agreed to anything.**
>
> **Entradas / Inputs:** `PROTOCOL_DESIGN.md` (escalera L0–L4, §7 exclusiones, §7.4 cierre
> ordenado) · `GOVERNANCE_AND_LICENSING.md` (§2 modelo B, §3.5 RFC-0, §4 licencias) ·
> `APPS_MATRIX.md` (§2.1 evidencia de duplicados) · `ADOPTION_PLAYBOOK.md` (§5.5).
> Redactado el **2026-08-16**. Nombre decidido: **Cabuya** (dominios cabuya.org y cabuyaprotocol.org).

---

# ESPAÑOL

**RFC-0 — Acuerdo fundacional del protocolo `cabuya`**

- **Estado:** Borrador — abierto a firma
- **Nivel:** gobernanza
- **Fecha:** 2026-08-16
- **Aceptación:** por **acuerdo afirmativo explícito**, no por consenso tácito. El
  silencio no puede ser aceptación en el documento que define qué significa el silencio.

> Este texto es una **propuesta redactada para el grupo de trabajo**. Ningún equipo se ha
> comprometido a nada, ninguna app aparece firmando por haber sido nombrada aquí, y nada
> de lo escrito obliga a nadie hasta que su propio equipo abra el PR de adhesión.

## Artículo 0 — «Crecemos juntos: no competimos, nos alimentamos»

Quien firma este documento acepta primero un contrato cultural y después uno técnico.

**La especialización es bienvenida.** Que un equipo se dedique a los albergues, otro a
los daños estructurales, otro a los arriendos y otro a las mascotas no es duplicación:
es cobertura. Nadie tiene que dejar de hacer lo que hace bien, ni fusionarse con nadie,
ni entregar su producto, su marca o su comunidad.

**El enemigo no es la competencia: es la fragmentación sin puentes.** El daño no lo
causa que existan veinte tableros. Lo causa que el mismo albergue esté en tres de ellos
con tres nombres distintos, sin identificadores en común, y que quien necesita ayuda
tenga que adivinar cuál mirar.

**La pertenencia se practica, no se declara.** Se es parte de esta red exponiendo las
interfaces estándar y consumiendo las de los demás. Publicar y leer —no asistir a
reuniones ni firmar intenciones— es lo que convierte a una app en parte de la red.

**El trabajo ajeno se acredita, no se borra.** Todo dato que viaja lleva su origen, y el
origen se muestra.

## Artículo 1 — Lo que acordamos

1. Que existe un problema común y que ninguna app lo resuelve sola.
2. Que la solución es un **formato compartido y abierto**, no una plataforma única ni una
   fusión de productos.
3. Que la especificación se gobierna en público, por RFC, y que **nadie tiene voto de
   calidad** —tampoco quien convoca.
4. Que la conformidad **se mide con un validador público**; no se declara.
5. Que cada app conserva sus datos, su marca, su comunidad y su derecho a irse.

## Artículo 2 — El problema que resuelve la v0.1

Hoy el mismo edificio aparece en tres aplicaciones con tres nombres distintos y sin un
solo identificador en común. En un caso documentado, **la misma dirección figura como
activa en un tablero y como cerrada en otro**: quien va a donar recibe una respuesta u
otra según cuál tablero encontró primero. Un mismo campus universitario aparece tres
veces, con coordenadas separadas por más de un kilómetro. Nada de esto es negligencia de
nadie: es lo que pasa cuando veinte equipos trabajan rápido y en paralelo, sin un
identificador compartido.

Ya se está pagando el costo a mano: hay puntos copiados de un tablero a otro, con el
crédito puesto, pero sin identificador común. Eso es integración manual, y no escala.

## Artículo 3 — Alcance de la v0.1

- **Una entidad: `place`** —puntos de acopio, albergues, puntos de servicio—. Es la
  superficie con más duplicación, es lenta de cambiar y no es personal.
- **Feeds estáticos** como piso: un archivo JSON con sobre común (`last_updated`, `ttl`,
  `license`, `permitted_use`) y CORS abierto. Publicarlo cuesta **una tarde**.
- **Identificadores** con la forma `{publicador}:{id_local}`: únicos sin coordinar nada y
  sin migrar ninguna base de datos.
- **Frescura obligatoria y honesta**: `last_confirmed_at` es un campo requerido y su
  valor `null` es legítimo. Ausencia de dato no es evidencia de cierre.
- **Escalera de conformidad L0–L4**, medida por validador. Cada nivel es una forma
  respetada de pertenecer, incluido el nivel «solo directorio».
- Las demás entidades —necesidades y ofertas, daños, arriendos, mascotas, alertas— entran
  por RFC en la v0.2, **redactadas por los equipos que las conocen**.

## Artículo 4 — Lo que este protocolo NO hace

1. **No transporta datos de personas. Nunca.** Ni nombres, ni teléfonos, ni fotos, ni
   casos individuales, ni personas desaparecidas. Y no es solo omitir campos: **queda
   prohibido cruzar los datos del protocolo con fuentes de nivel persona**. Las apps de
   búsqueda de personas se enlazan, no se federan. Ninguna RFC futura puede levantar esta
   regla.
2. **No hay scraping.** Los datos entran a la red porque alguien los publica.
3. **No hay rankings, ni certificaciones de confianza, ni listas de organizaciones
   recomendadas. Estar en el registro no es un aval.**
4. **No federan los veredictos de moderación.** Un registro suprimido se omite; nunca se
   reetiqueta en la app de otro.
5. **Los datos de contacto no viajan en los feeds.** Viaja el enlace público.
6. **Ningún servicio central es obligatorio.** Un feed es válido aunque el registro no
   exista.

## Artículo 5 — Gobernanza

Consejo de mantenedores de varias apps, asíncrono por defecto, con consenso tácito para
lo cotidiano y RFC para lo normativo. **Máximo dos asientos por organización**, y la
versión `1.0` no se publica hasta que al menos **dos mantenedores representen apps
distintas de la que convoca**. La especificación es CC0, cada mantenedor tiene una copia
completa del repositorio, y si el dominio caduca o la organización se apaga 180 días,
dos mantenedores de dos apps distintas pueden declarar el repositorio sucesor. Detalle
completo en `GOVERNANCE.md`.

## Artículo 6 — Cierre ordenado

Irse bien es parte del acuerdo. Un publicador que se retira debería congelar sus feeds
con un `last_updated` final, declarar `sunset_at` en su manifiesto y, o bien transferir
la custodia de sus registros a otro publicador nombrado, o bien declararlos archivados.
El registro lo marca como `archived` y **su identificador nunca se reasigna**, para que
los enlaces existentes sigan significando lo mismo.

## Artículo 7 — Transparencia sobre quién convoca

Quien redacta y convoca este documento es un equipo que también es parte de la red, y que
en este momento está recibiendo la migración de otra app del ecosistema, anunciada
públicamente por esa app en su propia página (2026-08-16; el traspaso de registros no
está verificado). Decirlo es mejor que callarlo: cualquiera puede leer esa página.

Federarse y absorberse son dos caminos reales y están ocurriendo al mismo tiempo. Por eso
esa migración se documenta en público bajo el artículo 6, y por eso existen el tope de
dos asientos por organización, la condición de los dos mantenedores externos antes de la
`1.0` y la ausencia de voto de calidad. **El protocolo solo se gana el argumento si las
apps que siguen independientes terminan mejor que la que se fusionó.**

## Artículo 8 — Firmas

Solo se registran **nombres de aplicaciones**. Nunca nombres de personas.

| App | Nivel objetivo | Fecha | PR |
|---|---|---|---|
| *(esta tabla se llena con cada PR de adhesión)* | | | |

## Artículo 9 — Cómo firmar

Abra un PR que agregue su app a `ADOPTERS.md` con el nombre de la app, el nivel objetivo
y la fecha. Un 👍 en el PR de RFC-0 vale como apoyo público, pero **la firma es el PR**.
Para objetar, use el mismo PR: toda objeción razonada detiene el reloj y debe decir qué
la resolvería. Firmar no obliga a publicar en una fecha; obliga a que, cuando se publique,
se publique así.

---

# ENGLISH

**RFC-0 — Founding agreement of the `cabuya` protocol**

- **Status:** Draft — open for signature
- **Tier:** governance
- **Date:** 2026-08-16
- **Acceptance:** by **explicit affirmative agreement**, not lazy consensus. Silence
  cannot be assent in the document that defines what silence means.

> This text is a **proposal drafted for the working group**. No team has committed to
> anything, no app is a signatory by virtue of being named here, and nothing written here
> binds anyone until that team opens its own adoption PR.

## Article 0 — "We grow together: we don't compete, we feed each other"

Signing this document means accepting a cultural contract first and a technical one
second.

**Specialization is welcome.** One team on shelters, another on structural damage,
another on rentals, another on pets — that is coverage, not duplication. Nobody has to
stop doing what they do well, merge with anyone, or hand over their product, their brand
or their community.

**The enemy is not competition: it is fragmentation without bridges.** The harm is not
that twenty boards exist. The harm is that the same shelter sits in three of them under
three different names, with no identifier in common, and the person who needs help has to
guess which one to trust.

**Membership is practiced, not declared.** You belong to this network by exposing the
standard interfaces and consuming everyone else's. Publishing and reading — not attending
meetings, not signing statements of intent — is what makes an app part of the network.

**Other people's work is credited, never erased.** Every record that travels carries its
origin, and the origin is displayed.

## Article 1 — What we agree on

1. That there is a shared problem and no single app solves it alone.
2. That the answer is a **shared, open format** — not one platform, and not a merger of
   products.
3. That the specification is governed in public, by RFC, and that **nobody holds a
   casting vote** — including the team that convenes it.
4. That conformance is **measured by a public validator**, never self-declared.
5. That every app keeps its data, its brand, its community and its right to leave.

## Article 2 — The problem v0.1 solves

Today the same building appears in three applications under three different names, with
not one identifier in common. In one documented case, **the same address is listed as
open on one board and closed on another**: a donor gets one answer or the other depending
on which board they found first. One university campus appears three times, with
coordinates more than a kilometre apart. None of this is anyone's negligence — it is what
happens when twenty teams work fast and in parallel without a shared identifier.

The cost is already being paid by hand: places are copied from one board to another, with
credit given, but with no shared identifier. That is manual integration, and it does not
scale.

## Article 3 — Scope of v0.1

- **One entity: `place`** — collection points, shelters, service points. It is the
  largest duplication surface, it changes slowly, and it is not personal.
- **Static feeds** as the floor: one JSON file with a common envelope (`last_updated`,
  `ttl`, `license`, `permitted_use`) and open CORS. Publishing one costs **an afternoon**.
- **Identifiers** shaped `{publisher}:{local_id}`: unique with zero coordination and no
  database migration.
- **Freshness is required and honest**: `last_confirmed_at` is a required field and a
  `null` value is legitimate. Absence of data is not evidence of closure.
- **An L0–L4 conformance ladder**, measured by the validator. Every level is a respected
  way of belonging, including the directory-only level.
- Every other entity — needs and offers, damage, rentals, pets, hazard notices — arrives
  by RFC in v0.2, **written by the teams who know them**.

## Article 4 — What this protocol does NOT do

1. **It never carries person-level data.** No names, no phone numbers, no photographs, no
   individual cases, no missing persons. And this is more than omitting fields: **joining
   protocol data with person-level sources is prohibited**. Missing-person apps are linked
   to, never federated. No future RFC may lift this rule.
2. **No scraping.** Data enters the network because someone publishes it.
3. **No rankings, no trust certifications, no lists of recommended organizations. Being
   in the registry is not an endorsement.**
4. **Moderation verdicts do not federate.** A suppressed record is omitted, never
   relabelled inside someone else's app.
5. **Contact details do not travel in feeds.** The public link does.
6. **No central service is ever required.** A feed is valid whether or not the registry
   knows it exists.

## Article 5 — Governance

A maintainer council drawn from several apps, asynchronous by default, with lazy consensus
for routine work and an RFC for anything normative. **At most two seats per
organization**, and version `1.0` is not released until at least **two maintainers
represent apps other than the convening one**. The specification is CC0, every maintainer
holds a complete clone of the repository, and if the domain lapses or the organization
goes silent for 180 days, any two maintainers from two different apps may declare the
successor repository. Full detail in `GOVERNANCE.md`.

## Article 6 — Orderly wind-down

Leaving well is part of the agreement. A departing publisher should freeze its feeds with
a final `last_updated`, declare `sunset_at` in its manifest, and either transfer custody
of its records to a named publisher or declare them archived. The registry marks it
`archived` and **its identifier is never reassigned**, so existing references keep meaning
what they meant.

## Article 7 — Transparency about who convenes this

The team drafting and convening this document is also part of the network, and is
currently receiving the migration of another app in the ecosystem — announced publicly by
that app on its own site (2026-08-16; the transfer of records is unverified). Saying so is
better than staying quiet: anyone can read that page.

Federating and being absorbed are both real paths, and they are happening at the same
time. That is why this migration is documented publicly under Article 6, and why the
two-seats-per-organization cap, the two-external-maintainers condition before `1.0`, and
the absence of a casting vote exist at all. **The protocol only earns its argument if the
apps that stay independent end up better off than the one that merged.**

## Article 8 — Signatures

**Application names only.** Never personal names.

| App | Target level | Date | PR |
|---|---|---|---|
| *(this table is filled in by each adoption PR)* | | | |

## Article 9 — How to sign

Open a PR adding your app to `ADOPTERS.md` with the app name, the target level and the
date. A 👍 on the RFC-0 PR counts as public support, but **the signature is the PR**. To
object, use the same PR: any reasoned objection stops the clock and must state what would
resolve it. Signing does not commit you to a publication date; it commits you to
publishing this way when you do.

---

*Propuesta bajo la Regla-0 del plan: cada afirmación sobre una app está sostenida en
`APPS_MATRIX.md` o en su dosier. · Drafted under the plan's Rule-0: every app-level claim
is sourced in `APPS_MATRIX.md` or the app's dossier. `cabuya` resolves after the
group's vote.*
