# Day-one issues

> **Generated** by `scripts/generate-day-one-issues.mjs` from the check
> registry. Do not edit by hand — run `pnpm run issues:day-one` after the
> catalogue changes.

The issues to open when the repository goes public, so the tracker starts
with well-specified work rather than empty. Every one below is a catalogued
check that is not yet implemented, which means its id, severity, level, rule
and fix text are already decided: the contributor writes one function and two
tests, and designs nothing.

**19 issues**, all labelled `good-first-issue:check`, across
4 families. 62 checks are catalogued in total;
43 are already implemented.

## How to open one

Title: `` `{id}` — {title} ``. Body: the rule, the fix, the level and the
spec anchor, exactly as they appear below. Label: `good-first-issue:check`.
Add the Spanish rule text where this document has one — a contributor who
reads the issue in Spanish should not have to translate the requirement
before they can implement it.

## api (6)

### `API001` — Read API base reachable; envelope shape identical to the feed

- **Severity:** error
- **Level:** L3
- **Planned in:** v0.2 (L3 checks — deferred from the walking skeleton)
- **Rule:** One schema, four transports.
- **Fix:** Serve the read API at the declared base with the same envelope shape as the static feed.
- **Regla (ES):** Un esquema, cuatro transportes.
- **Arreglo (ES):** Sirve la API de lectura en la base declarada, con la misma forma de sobre que el feed estático.
- **Specification:** https://cabuya.org/developers/spec/0.1/4-api-surface#4-1

### `API002` — Static ≡ API: the same record is byte-compatible from both surfaces

- **Severity:** error
- **Level:** L3
- **Planned in:** Task 15
- **Rule:** The equivalence rule is what lets one schema serve four transports.
- **Fix:** Return byte-compatible records from the API and the feed. A consumer must not have to know which one it read.
- **Regla (ES):** La regla de equivalencia es lo que permite que un esquema sirva cuatro transportes.
- **Arreglo (ES):** Devuelve registros compatibles byte a byte desde la API y desde el feed. Un consumidor no debe tener que saber cuál de los dos leyó.
- **Specification:** https://cabuya.org/developers/spec/0.1/3-the-feed#3-2

### `API003` — cursor pagination ordered on a server sequence, not a timestamp

- **Severity:** error
- **Level:** L3
- **Planned in:** v0.2
- **Rule:** Timestamp cursors silently drop offline-composed records that arrive late.
- **Fix:** Paginate on a server-side sequence rather than a timestamp. Timestamps collide and records get skipped.
- **Regla (ES):** Los cursores por marca de tiempo descartan en silencio los registros compuestos sin conexión que llegan tarde.
- **Arreglo (ES):** Pagina sobre una secuencia del lado del servidor en vez de una marca de tiempo. Las marcas de tiempo colisionan y se saltan registros.
- **Specification:** https://cabuya.org/developers/spec/0.1/4-api-surface#4-1

### `API004` — Documented query parameters accepted

- **Severity:** warning
- **Level:** L3
- **Planned in:** v0.2
- **Rule:** municipality, kind, bbox, updated_since, limit, cursor.
- **Fix:** Accept the documented query parameters, or remove them from the documentation.
- **Regla (ES):** municipality, kind, bbox, updated_since, limit, cursor.
- **Arreglo (ES):** Acepta los parámetros de consulta documentados, o quítalos de la documentación.
- **Specification:** https://cabuya.org/developers/spec/0.1/4-api-surface#4-1

### `API005` — CORS * on the API; no auth required for reads

- **Severity:** error
- **Level:** L3
- **Planned in:** v0.2
- **Rule:** Reads are public by design.
- **Fix:** Serve the API with CORS * and no authentication for reads. Public-interest data behind a key is not public.
- **Regla (ES):** Las lecturas son públicas por diseño.
- **Arreglo (ES):** Sirve la API con CORS * y sin autenticación para lecturas. Datos de interés público detrás de una llave no son públicos.
- **Specification:** https://cabuya.org/developers/spec/0.1/4-api-surface#4-1

### `API006` — Consumes ≥ 1 peer feed (partly self-declared)

- **Severity:** info
- **Level:** L3
- **Planned in:** v0.2
- **Rule:** L3 requires consuming as well as serving — the one requirement a probe cannot fully measure, so it is reported as info with the limitation stated.
- **Fix:** Consume at least one peer feed. The level is about interoperating, not only about publishing.
- **Regla (ES):** L3 exige consumir además de servir — el único requisito que un sondeo no puede medir del todo, así que se reporta como info con la limitación declarada.
- **Arreglo (ES):** Consume al menos un feed de un par. El nivel trata de interoperar, no solo de publicar.
- **Specification:** https://cabuya.org/developers/spec/0.1/4-api-surface#4-3

## behavior (2)

### `BEH004` — Per-shard lastmod present (the incremental-sync pattern)

- **Severity:** warning
- **Level:** L2
- **Planned in:** Task 15
- **Rule:** A per-shard lastmod is working incremental sync at zero cost.
- **Fix:** Publish a lastmod per shard so consumers can fetch only what changed.
- **Regla (ES):** Un lastmod por fragmento es sincronización incremental funcionando a costo cero.
- **Arreglo (ES):** Publica un lastmod por fragmento para que los consumidores descarguen solo lo que cambió.
- **Specification:** https://cabuya.org/developers/spec/0.1/4-api-surface#4-4

### `BEH005` — Declared shards reachable and envelope-consistent

- **Severity:** error
- **Level:** L2
- **Planned in:** Task 15
- **Rule:** A declared shard that disagrees with its siblings breaks every consumer that trusts the manifest.
- **Fix:** Make every declared shard reachable and consistent with the envelope that declares it.
- **Regla (ES):** Un fragmento declarado que no concuerda con sus hermanos rompe a todo consumidor que confíe en el manifiesto.
- **Arreglo (ES):** Haz que todos los fragmentos declarados sean alcanzables y consistentes con el sobre que los declara.
- **Specification:** https://cabuya.org/developers/spec/0.1/3-the-feed#3-1

## discovery (6)

### `DSC001` — Manifest reachable over HTTPS as JSON

- **Severity:** error
- **Level:** L1
- **Planned in:** Task 15 (behavioral probes)
- **Rule:** The manifest MUST be served over HTTPS with Content-Type: application/json.
- **Fix:** Serve the manifest over HTTPS with a JSON content type, and check it from outside your network.
- **Regla (ES):** El manifiesto MUST servirse por HTTPS con Content-Type: application/json.
- **Arreglo (ES):** Sirve el manifiesto por HTTPS con un tipo de contenido JSON, y compruébalo desde fuera de tu red.
- **Specification:** https://cabuya.org/developers/spec/0.1/2-discovery#2-1

### `DSC003` — robots.txt returns 200 text/plain

- **Severity:** warning
- **Level:** L1
- **Planned in:** Task 15
- **Rule:** L2+ preconditions include a real robots.txt.
- **Fix:** Serve a real robots.txt at the root with a text/plain content type.
- **Regla (ES):** Las precondiciones de L2 y superiores incluyen un robots.txt real.
- **Arreglo (ES):** Sirve un robots.txt real en la raíz, con tipo de contenido text/plain.
- **Specification:** https://cabuya.org/developers/spec/0.1/1-architecture#1-2

### `DSC004` — Manifest at the RECOMMENDED path, or a <link rel> advertisement

- **Severity:** warning
- **Level:** L1
- **Planned in:** Task 15
- **Rule:** The manifest SHOULD live at /.well-known/cabuya.json, or be advertised with <link rel="cabuya">.
- **Fix:** Move the manifest to /.well-known/cabuya.json, or advertise its location with a <link rel="cabuya">.
- **Regla (ES):** El manifiesto SHOULD vivir en /.well-known/cabuya.json, o anunciarse con <link rel="cabuya">.
- **Arreglo (ES):** Mueve el manifiesto a /.well-known/cabuya.json, o anuncia su ubicación con un <link rel="cabuya">.
- **Specification:** https://cabuya.org/developers/spec/0.1/2-discovery#2-2

### `DSC006` — publisher.canonical_url matches the registry entry

- **Severity:** error
- **Level:** L1
- **Planned in:** Task 15
- **Rule:** A registered publisher’s manifest MUST agree with its registry entry about its canonical URL.
- **Fix:** Make the canonical URL in the manifest match the one in your registry entry, or open a pull request to change the entry.
- **Regla (ES):** El manifiesto de un publicador registrado MUST coincidir con su entrada del registro en la URL canónica.
- **Arreglo (ES):** Haz que la URL canónica del manifiesto coincida con la de tu entrada en el registro, o abre un pull request para cambiar la entrada.
- **Specification:** https://cabuya.org/developers/spec/0.1/2-discovery#2-4

### `DSC008` — crawl_policy_url resolves

- **Severity:** warning
- **Level:** L1
- **Planned in:** Task 15
- **Rule:** The declared crawl/reuse policy SHOULD be fetchable — consumers must honor it.
- **Fix:** Point crawl_policy_url at a page that exists, or remove the field.
- **Regla (ES):** La política declarada de rastreo y reutilización SHOULD poder descargarse — los consumidores tienen que respetarla.
- **Arreglo (ES):** Apunta crawl_policy_url a una página que exista, o quita el campo.
- **Specification:** https://cabuya.org/developers/spec/0.1/2-discovery#2-4

### `DSC009` — conformance_target does not exceed the measured level

- **Severity:** error
- **Level:** L1
- **Planned in:** Task 13 (content side) + Task 15
- **Rule:** conformance_target is a declaration; it MUST NOT claim more than this run measures. Reported as a mismatch, never as the level.
- **Fix:** Lower conformance_target to the level you actually reach, or fix what is blocking the level you claim. The target is an intention, not a claim.
- **Regla (ES):** conformance_target es una declaración; MUST NOT afirmar más de lo que esta ejecución mide. Se reporta como discrepancia, nunca como el nivel.
- **Arreglo (ES):** Baja conformance_target al nivel que realmente alcanzas, o corrige lo que bloquea el nivel que declaras. El objetivo es una intención, no una afirmación.
- **Specification:** https://cabuya.org/developers/spec/0.1/8-versioning-and-conformance#8-3

## write (5)

### `WRT001` — POST accepts the {source, external_id, place} envelope

- **Severity:** error
- **Level:** L4
- **Planned in:** v0.2
- **Rule:** The write envelope is fixed.
- **Fix:** Accept the {source, external_id, place} envelope on POST.
- **Regla (ES):** El sobre de escritura es fijo.
- **Arreglo (ES):** Acepta el sobre {source, external_id, place} en el POST.
- **Specification:** https://cabuya.org/developers/spec/0.1/4-api-surface#4-2

### `WRT002` — Idempotency on (source, external_id): a replay does not duplicate

- **Severity:** error
- **Level:** L4
- **Planned in:** v0.2
- **Rule:** Re-sending is an upsert of the sender’s own contribution, never a duplicate.
- **Fix:** Make writes idempotent on (source, external_id). A replay after a timeout must not create a second record.
- **Regla (ES):** Reenviar es un upsert de la contribución del propio emisor, nunca un duplicado.
- **Arreglo (ES):** Haz las escrituras idempotentes en (source, external_id). Un reenvío tras un tiempo agotado no debe crear un segundo registro.
- **Specification:** https://cabuya.org/developers/spec/0.1/4-api-surface#4-2

### `WRT003` — 409 on an id conflict outside the sender’s namespace

- **Severity:** error
- **Level:** L4
- **Planned in:** v0.2
- **Rule:** Namespace discipline is enforced at the write boundary.
- **Fix:** Return 409 when a sender tries to write an id outside its own namespace.
- **Regla (ES):** La disciplina de espacios de nombres se aplica en la frontera de escritura.
- **Arreglo (ES):** Devuelve 409 cuando un emisor intente escribir un id fuera de su propio espacio de nombres.
- **Specification:** https://cabuya.org/developers/spec/0.1/4-api-surface#4-2

### `WRT004` — In auth:none mode, a moderation state is echoed and rate limiting is observable

- **Severity:** error
- **Level:** L4
- **Planned in:** v0.2
- **Rule:** Open writes REQUIRE mitigations: rate limiting, a moderation queue, and an echoed state.
- **Fix:** Echo the moderation state and make rate limiting observable, so an unauthenticated sender knows what happened to its write.
- **Regla (ES):** Las escrituras abiertas REQUIRE mitigaciones: límite de tasa, cola de moderación y un estado devuelto en eco.
- **Arreglo (ES):** Devuelve en eco el estado de moderación y haz observable el límite de tasa, para que un emisor sin autenticar sepa qué pasó con su escritura.
- **Specification:** https://cabuya.org/developers/spec/0.1/4-api-surface#4-2

### `WRT005` — Republished records carry source.source_id = the original sender

- **Severity:** error
- **Level:** L4
- **Planned in:** v0.2
- **Rule:** The sender’s identity travels with the record forever.
- **Fix:** Keep source.source_id as the original sender when republishing. Attribution is the thing that must survive the hop.
- **Regla (ES):** La identidad del emisor viaja con el registro para siempre.
- **Arreglo (ES):** Conserva source.source_id como el emisor original al republicar. La atribución es lo que tiene que sobrevivir al salto.
- **Specification:** https://cabuya.org/developers/spec/0.1/4-api-surface#4-2

## The other labels

These are not generated, because they are not enumerable from a registry —
a stack guide or a translation is proposed by whoever knows the subject. The
taxonomy and what each label is for are in [`CONTRIBUTING.md`](../CONTRIBUTING.md).
