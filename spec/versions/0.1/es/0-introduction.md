---
version: "0.1"
status: normative
section: 0
order: 0
title: Introducción
---

# §0 — Introducción

Toda afirmación normativa de este documento se adopta por el proceso de RFC
([`/rfcs`](/rfcs)), y los cambios llegan por la misma vía.

## §0.1 Qué es el Protocolo Cabuya

Cabuya es un protocolo abierto de interoperabilidad para aplicaciones de
ayuda. Define:

1. **Un esquema, cuatro transportes.** Un feed JSON estático (L2), una API de
   lectura (L3), una API de escritura (L4) y una superficie MCP son
   proyecciones del **mismo** registro `place` — un feed estático es una API
   de lectura degenerada, y viceversa.
2. **Un mecanismo de descubrimiento** — un manifiesto en una ruta conocida
   más un registro revisado por pull request (§2).
3. **Una escalera de conformidad** (L0–L4), **medida por un validador
   publicado, nunca autodeclarada** (§1, §8).
4. **Exclusiones normativas que no se mueven** — los datos de personas nunca
   viajan; los valores de contacto nunca viajan; los datos entran por
   publicación, nunca por scraping (§7).

El principio fundacional, normativo hasta donde la especificación puede
llevarlo: **«Crecemos juntos: no competimos, nos alimentamos»** — los feeds
existen para que las aplicaciones se alimenten entre sí.

## §0.2 Convenciones

Las palabras clave **MUST**, **MUST NOT**, **REQUIRED**, **SHOULD**, **SHOULD
NOT**, **RECOMMENDED**, **MAY** y **OPTIONAL** se interpretan como describen
el RFC 2119 y el RFC 8174 cuando, y solo cuando, aparecen en mayúsculas. Se
conservan en inglés: son términos de arte con una definición normativa, y
traducirlos cambiaría lo que obligan.

Los identificadores de máquina (nombres de campo, tokens de `place_kind`,
identificadores de verificación, nombres de nivel) nunca se traducen. Las
cadenas legibles por personas dentro de un feed siguen la regla de
localización de §3, con **`es` como base REQUERIDA**.

## §0.3 Mapa del documento

| Sección | Contenido |
|---|---|
| [§1](/developers/spec/0.1/1-architecture) | La escalera de conformidad L0–L4 |
| [§2](/developers/spec/0.1/2-discovery) | Manifiesto, ruta conocida, el registro |
| [§3](/developers/spec/0.1/3-the-feed) | El sobre del feed y el registro `place` |
| [§4](/developers/spec/0.1/4-api-surface) | APIs de lectura y escritura, reglas de consumo, sincronización, MCP |
| [§5](/developers/spec/0.1/5-identifiers) | Identidad del registro y del lugar |
| [§6](/developers/spec/0.1/6-trust-and-verification) | El bloque de verificación; postura ante amenazas |
| [§7](/developers/spec/0.1/7-normative-exclusions) | Las líneas que no se mueven |
| [§8](/developers/spec/0.1/8-versioning-and-conformance) | SemVer, perfiles, conformidad medida |
| [Apéndice A](/developers/spec/0.1/appendix-a-design-decisions) | No normativo: registro de decisiones y el recorrido de implementabilidad |

Esquemas: [`manifest.schema.json`](https://cabuya.org/schemas/0.1/manifest.schema.json)
· [`place-feed.schema.json`](https://cabuya.org/schemas/0.1/place-feed.schema.json)
— con cinco ejemplos trabajados (dos que cumplen, tres que no, con mensajes de
error diseñados) en [`examples/`](/developers/schemas).
