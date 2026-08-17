---
version: "0.1"
status: normative
section: 4
order: 4
title: La superficie de API estándar
---

# §4 — La superficie de API estándar

Esta sección es el estado final del protocolo y el objetivo fundacional:
**exposición y consumo estandarizados para que las aplicaciones se alimenten
entre sí.** L2 es la rampa de entrada; esto es la carretera.

## §4.1 API de lectura (L3)

- Ruta base: `/{api-base}/v1/places` — base RECOMMENDED `/api/public/v1/`
  (una convención que emergió del ecosistema, adoptada en vez de inventada).
- Parámetros (todos opcionales): `municipality` (DIVIPOLA), `kind`
  (`place_kind`), `bbox` (`oeste,sur,este,norte`), `updated_since`
  (RFC 3339), `limit` (1–500, por omisión 100) y `cursor` (opaco).
- **Regla del cursor:** la sincronización incremental MUST ordenar por una
  **secuencia del lado del servidor** (cursor opaco), nunca por marcas de
  tiempo del registro — los reportes compuestos sin conexión llegan horas
  después de su hora de creación, y un cursor por marca de tiempo los descarta
  en silencio. `updated_since` es un filtro de conveniencia, no el mecanismo de
  sincronización.
- Las respuestas usan el sobre del feed con `data.places[]` y `next_cursor`.
  CORS `*`; sin autenticación para lecturas.

## §4.2 API de escritura (L4)

- `POST /{api-base}/v1/places` — sobre:
  `{ "source": "<publisher_id>", "external_id": "<local_id del emisor>", "place": { … } }`.
- **La idempotencia MUST ir claveada por (`source`, `external_id`)** —
  reenviar es un upsert de la contribución del propio emisor, nunca un
  duplicado. Un mecanismo, no dos.
- Autenticación: elección del publicador, declarada en el manifiesto — `none`
  (modo emergencia) o `bearer` (emitido a mano por integración). En modo
  `none`, las mitigaciones son REQUIRED: límite de tasa, una cola de
  moderación antes de que los registros entren al feed propio del publicador, y
  respuestas de eco que lleven el estado de moderación del registro
  (`received` | `published` | `held`).
- El receptor republica los registros aceptados con `source.source_id` = el
  emisor — **la identidad del emisor viaja con el registro para siempre**
  (§4.3).
- Códigos de estado: 201 creado o reproducido · 400 esquema · 401
  (+`WWW-Authenticate`) · 409 (conflicto de id fuera del espacio del emisor —
  un publicador MUST NOT acuñar en el espacio de otro, §5) · 429 · 5xx.

## §4.3 Reglas de consumo — qué exige «nos alimentamos»

Una aplicación que consume (L3 o superior) MUST:

1. **Atribuir:** mostrar el publicador de origen de cada registro ajeno
   (comprobable por máquina vía `source.source_id`; respetando
   `attribution_required`).
2. **Mostrar la edad:** renderizar la antigüedad de `last_confirmed_at` (o
   «sin confirmar» cuando es `null`) dondequiera que un registro ajeno pueda
   dirigir a una persona a algún lado. Cuando la edad supere los 7 días O
   `contradictions_active > 0`, el consumidor MUST distinguir el registro
   visualmente; SHOULD NOT ocultarlo en silencio (la ausencia de datos no es
   evidencia de cierre — §6).
3. **No mutar:** nunca alterar el contenido de un registro ajeno; los
   enriquecimientos viven en los registros propios del consumidor, con
   afirmaciones `same_as`.
4. **Preservar las cadenas:** un agregador que republica MUST conservar el
   `source{}` **original** intacto — su propia identidad va en el
   `publisher_id` del sobre, nunca en la procedencia del registro.
5. **Deduplicar por afirmación, no por autoridad:** agrupar mediante `same_as`
   (un solo salto, no transitivo) más coincidencia de dirección y DIVIPOLA con
   los acentos plegados — nunca por las cadenas de visualización en bruto; los
   grupos se publican solo como registros propios del consumidor.
6. **Respetar las exclusiones:** nunca cruzar datos de lugares con fuentes a
   nivel de persona (§7.1); nunca descargar de publicadores cuya política
   declarada se reserva la reutilización.

## §4.4 Niveles de sincronización

| Nivel | Mecanismo | Para quién |
|---|---|---|
| Barato (L2) | Consultar el feed según el `ttl`; `lastmod` por fragmento, opcional | Publicadores estáticos |
| Estándar (L3) | Paginación por `cursor` sobre una secuencia del servidor | Publicadores con API |
| Push | **Fuera de alcance en 0.1** | A discutir en v1 y posteriores |

## §4.5 Mapeo MCP (superficie de agentes a nivel de red)

MCP es una capa OPTIONAL **por encima** del protocolo, nunca el piso de
conformidad. Un servidor de referencia (operado por la iniciativa) sirve a toda
la red: `list_publishers` → el registro; `search_places(municipality?, kind?,
q?)` → lectura federada sobre feeds y APIs conformes;
`get_place(qualified_id)` → registro más procedencia; `publish_place(...)` → la
escritura de §4.2, solo contra publicadores cuyo manifiesto declare soporte de
escritura. Los esquemas de las herramientas son proyecciones 1:1 de §4.1 y
§4.2 — mismo esquema, cuarto transporte. Los MCP a nivel de producto siguen
siendo de cada quien; el registro lleva los metadatos de sus herramientas (los
identificadores pueden estar en español — las herramientas no deben asumir
inglés).
