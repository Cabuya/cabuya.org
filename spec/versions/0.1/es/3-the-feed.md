---
version: "0.1"
status: normative
section: 3
order: 3
title: El feed (L2) — sobre y registros
---

# §3 — El feed (L2), entidad `place`

## §3.1 Sobre

```json
{
  "last_updated": "2026-08-16T04:00:00Z",
  "ttl": 300,
  "version": "0.1.0",
  "publisher_id": "example-app",
  "license": "CC-BY-4.0",
  "permitted_use": ["display", "aggregate", "ai_answer"],
  "data": { "places": [] }
}
```

- **`last_updated`** (RFC 3339 en UTC) es la marca de tiempo de generación del
  feed, REQUIRED — sin ella un consumidor no puede distinguir «no cambió nada»
  de «se murió el proceso». **`ttl`** es el contrato de caché. **`version`** es
  la versión de la especificación implementada.
- **`license` es REQUIRED.** Un feed sin licencia no cumple: su ausencia
  bloquea la revisión legal de cualquier consumidor. **`permitted_use`** lleva
  el consentimiento de reutilización **en el sobre** (enum cerrado: `display` |
  `aggregate` | `redistribute` | `ai_answer` | `ai_train`).
- **Los registros** siguen el modelo `place` codificado en
  [`place-feed.schema.json`](https://cabuya.org/schemas/0.1/place-feed.schema.json),
  incluidos el estado de tres ejes (los nombres MUST NOT codificar estado
  operativo — CR-2), el bloque de verificación (§6), el `source{}`
  estructurado, la `public_url` REQUIRED y la regla de ubicación
  (`address_text` O `lat`+`lon`; ambos RECOMMENDED; ninguno = no cumple).
- **Transporte:** HTTPS, UTF-8, `Content-Type: application/json` y
  **`Access-Control-Allow-Origin: *` REQUIRED** — el único MUST no obvio; sin
  él, todo consumidor que corra en un navegador necesita un proxy.
- **Localización:** las cadenas legibles por personas MAY usar arreglos
  `[{text, language}]`; las cadenas simples se interpretan como `es`. **`es` es
  la base REQUIRED; `en` es RECOMMENDED.** Los tokens de máquina nunca se
  traducen.
- **Tamaño:** un archivo SHOULD mantenerse en 5 MB o menos y 10 000 registros
  o menos; más allá de eso, fragmenta por municipio DIVIPOLA y lista los
  fragmentos en `feeds[]` del manifiesto. No hay paginación dentro de archivos
  estáticos.
- **Señales de sincronización en L2:** regenerar y actualizar `last_updated`;
  RECOMMENDED un `lastmod` por fragmento. **Antipatrón con nombre propio
  (MUST NOT):** regenerar `last_updated` en cada petición para que siempre diga
  «ahora» — peor que no tener señal (observado en producción).

## §3.2 Regla de equivalencia estático ≡ API

El arreglo `data.places[]` del feed y los elementos de la API de lectura (§4.1)
MUST ser compatibles byte a byte por registro. Un feed estático es una API de
lectura degenerada; las herramientas de conformidad prueban ambos con el mismo
esquema.
