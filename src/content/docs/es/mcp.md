---
title: Servidor MCP
description: El servidor MCP de referencia está especificado y todavía no desplegado. Qué va a exponer, la frontera que no debe cruzar y la condición de dos feeds que lo habilita.
section: consuming
order: 1
updated: 2026-08-17
---

> **Estado: especificado, no desplegado.** Todavía no existe ningún endpoint.
> Sale cuando existan al menos dos feeds conformes en vivo sobre los cuales
> federar, y no antes — [por qué, más abajo](#por-que-todavia-no-esta-construido).
> Nada en esta página describe software corriendo. Describe un contrato al que
> nos comprometimos, para que cualquiera que construya sobre el protocolo pueda
> ver hacia dónde va la superficie para agentes.

MCP es una **capa opcional por encima del protocolo, nunca el piso de
conformidad** ([§4.5](/es/developers/spec/0.1/4-api-surface#4-5)). Una
aplicación en L2 es conforme tenga o no algo que ver con MCP; el servidor de
referencia es una comodidad que corre la iniciativa sobre la red, no una quinta
cosa que implementar.

## La frontera que no debe cruzar

Hay dos tipos de servidor MCP en este ecosistema, y confundirlos desharía el
sentido del protocolo.

| | **MCP de red** (este) | **MCP de producto** (el de cada app) |
|---|---|---|
| Dueño | La iniciativa | Cada aplicación |
| Alcance | Los datos públicos de lugares de todo publicador registrado | El producto de esa app, incluido lo que el protocolo no modela |
| Entidades | Solo `place` en v0.1 | Lo que ofrezca la app — emparejamiento, casos, flujos |
| Autenticación | Ninguna para lectura | La propia de la app |
| Datos de personas | **Imposible por construcción** — el servidor solo habla el esquema `place` | La política propia de la app, fuera de este protocolo |
| Nombres de herramientas | Identificadores en inglés | Pueden ser en español; el registro los guarda tal cual |

**La regla, dicha una sola vez:** el servidor de red **nunca** hace de
intermediario de un MCP de producto, nunca agrega los endpoints no protocolarios
de un producto y nunca se presenta como sustituto de uno. Los *lista* —
`list_publishers` devuelve el endpoint `mcp{}` que declaró cada publicador —
para que un agente pueda conectarse directo a la app.

La razón es la misma que hay detrás de todo el protocolo. Un servidor de la
iniciativa que en silencio se volviera la puerta de entrada a veinte
aplicaciones recrearía exactamente la centralización que este diseño existe para
evitar, y lo haría usando el lenguaje de la interoperabilidad. Un directorio que
se convierte en pasarela cambió de naturaleza.

## Las cuatro herramientas

Cada una es una proyección 1:1 de las superficies de lectura y escritura ya
especificadas en [§4.1 y §4.2](/es/developers/spec/0.1/4-api-surface#4-1). Sus
esquemas de entrada y salida se **generan desde los mismos JSON Schemas que usa
el validador**, no se escriben a mano — mismo esquema, cuarto transporte.

| Herramienta | Entrada | Salida |
|---|---|---|
| `list_publishers` | `{ level?, entity?, municipality?, event?, status? }` | Entradas del registro con estado medido, estado de la insignia, fecha de la última validación, licencia y `permitted_use` declarados, y el endpoint `mcp{}` si lo hay |
| `search_places` | `{ municipality?, kind?, q?, bbox?, updated_since?, limit?, cursor? }` | Un sobre de feed con `data.places[]` y `next_cursor`, más `sources[]` y `unreachable[]` |
| `get_place` | `{ qualified_id }` | El registro, su cadena completa de procedencia y su bloque de frescura |
| `publish_place` | `{ target_publisher, source, external_id, place }` | La respuesta de eco del publicador, incluido el estado de moderación — solo contra publicadores cuyo manifiesto declara soporte de escritura |

## Federación, y lo que se niega a esconder

El diseño interesante no es el abanico de peticiones. Es lo que dice la
respuesta cuando ese abanico no sale del todo bien.

**Los resultados parciales son explícitos.** Cada respuesta lleva `sources[]` —
quién contestó, cada uno con su `last_updated` — y `unreachable[]`, quién no y
por qué. Descartar un publicador en silencio haría que la red se viera más
pequeña y más fresca de lo que es, que es la misma deshonestidad que las reglas
de frescura existen para evitar, cometida por la capa que debía hacerlas
cumplir.

**El consentimiento se verifica antes de traer nada.** A un publicador cuyo
`permitted_use` excluye `ai_answer` no se le consulta para un agente, y la
respuesta lo dice en `excluded_by_policy[]` en vez de fingir que no existe.
Excluido es un hecho sobre permisos; ausente es un hecho sobre existencia, y un
agente que no puede distinguirlos le va a reportar el equivocado a una persona.

**La atribución viaja y la frescura se dibuja.** Cada registro devuelto conserva
su cadena `source{}` y la cadena de atribución del publicador, y lleva la edad
de su `last_confirmed_at` y `contradictions_active`. La descripción de la
herramienta le dice al agente que llama que DEBE mostrarlos — las
[reglas de consumo](/es/developers/consume) no dejan de aplicar porque quien
consume sea un modelo de lenguaje.

**Acotado por diseño.** Ocho segundos y doce publicadores por petición,
ordenados por relevancia declarada, `ttl` respetado por publicador desde su
propio sobre, caché en memoria y nunca escrita a disco.

## Los datos de personas son imposibles, no están prohibidos

Tres garantías estructurales en vez de tres políticas:

1. El único esquema de salida del servidor es el esquema `place`. No hay camino
   de código que pueda emitir un campo de persona porque no existe un tipo para
   uno.
2. No acepta ninguna consulta que pueda funcionar como búsqueda de personas. La
   búsqueda de texto libre corre solo contra `name` y `description` de lugares, y
   `q` tiene límite de longitud.
3. No guarda ninguna credencial de escritura. `publish_place` pasa la credencial
   de quien llama por petición y no almacena nada — la iniciativa nunca debe
   tener acceso de escritura al sistema de otro equipo.

Esto es la
[prohibición de cruce](/es/developers/spec/0.1/7-normative-exclusions#7-1)
expresada como arquitectura. Una política se puede olvidar bajo la presión de un
plazo; un tipo que no existe, no.

## Por qué todavía no está construido

Porque un servidor de federación con un solo feed detrás es un intermediario, y
un intermediario que se dice red es una afirmación que no podemos respaldar.

La condición son **dos feeds conformes en vivo**, y la prueba de aceptación es
concreta: un agente responde una pregunta real sobre los datos de dos
publicadores, con la atribución y las edades intactas. Hasta que eso sea
demostrable, construir el servidor significaría publicar algo cuya propuesta de
valor entera está sin probar — y publicar un endpoint que sugiere que existe una
red cuando no existe es justo el tipo de afirmación que
[la primera regla del proyecto](/es/developers/spec/0.1/8-versioning-and-conformance#8-3)
prohíbe.

La especificación existe ahora, antes que el código, a propósito. Cualquiera que
esté construyendo una integración con agentes puede ver los nombres de las
herramientas, los esquemas y las garantías, y puede decirnos que están mal antes
de que cambiarlos salga caro.

## Qué hacer mientras tanto

Un agente no necesita este servidor para trabajar con el protocolo. Necesita el
protocolo, que es un documento, y la [skill para agentes](/es/developers/skill)
lo trae adentro — la skill funciona sin nada de red, porque una especificación
es texto y un esquema es un archivo.

Para leer datos en vivo hoy: los feeds son JSON estático en URLs estables y la
[API de lectura](/es/developers/spec/0.1/4-api-surface#4-1) es HTTP a secas. En
este protocolo no hay ningún transporte que exija una librería cliente, que era
uno de los objetivos de diseño.
