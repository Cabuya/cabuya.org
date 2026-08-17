---
version: "0.1"
status: normative
section: 2
order: 2
title: Descubrimiento — manifiesto y registro
---

# §2 — Descubrimiento

**§2.1** Un publicador MUST exponer un **manifiesto**: un documento JSON que
cumpla con
[`manifest.schema.json`](https://cabuya.org/schemas/0.1/manifest.schema.json).

**§2.2 Ubicación.** RECOMMENDED en `/.well-known/cabuya.json`. ACCEPTABLE:
cualquier ruta HTTPS estable declarada en la entrada del registro y anunciada
con `<link rel="cabuya" href="…">` en el head HTML del sitio. La entrada del
registro es el puntero autoritativo; la ruta conocida es la convención.
(Algunos hostings de voluntarios maltratan los directorios que empiezan por
punto — la ruta conocida nunca es un MUST.)

**§2.3 Contenido.** El manifiesto lleva: `protocol` (nombre y `spec_version`),
`publisher{}` (`publisher_id` del registro, URL canónica, alias declarados,
contacto institucional), `conformance_target` (L0–L4), `feeds[]`
(`{name, url, entity, profile}` — al estilo del autodescubrimiento), `api{}`
(URL base si es L3 o superior), `mcp{}` (endpoint, si existe), `license`,
`permitted_use[]`, `crawl_policy_url`, `events[]` (identificadores de eventos
del registro que sirve) y `languages[]` (BCP 47).

**§2.4 Registro.** Una colección de entradas de publicadores versionada en
git, actualizada por pull request con revisión humana. Las claves son **la URL
canónica más los alias declarados, nunca slugs** (una misma aplicación ha
salido a producción bajo tres nombres). El registro anota la política de
rastreo y reutilización de cada publicador; **las herramientas — la skill para
agentes incluida — MUST respetarla**: nada de descargar de un publicador cuya
política se reserva la reutilización.

**§2.5 Por qué los dos mecanismos.** Una caída del registro no debe romper las
lecturas entre publicadores (por eso existen las rutas conocidas); las SPA con
catch-all y las limitaciones de hosting impiden una regla de solo ruta conocida
(2 de 20 hostings observados no podían servirla honestamente). Los dos, cada
uno haciendo aquello en lo que es bueno.
