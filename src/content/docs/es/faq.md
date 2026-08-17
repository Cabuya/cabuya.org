---
title: Preguntas frecuentes
description: Las cuatro preguntas que frenan la adopción — licencias, datos de personas, identificadores y el cierre — cada una respondida contra su ancla normativa.
section: consuming
order: 2
jsonld: faq
updated: 2026-08-17
---

Cuatro preguntas aparecen antes de que nadie escriba una línea de código, y
ninguna es técnica. Cada respuesta enlaza la parte de la especificación de la
que sale, para que puedas comprobarla en vez de creernos.

## ¿Tengo que cambiar mi licencia?

Tienes que *declarar* una. Eso es distinto, y es el único requisito de licencia
del protocolo.

`license` es REQUERIDO tanto en el manifiesto como en el sobre de cada feed,
como identificador SPDX. Es requerido porque su ausencia es lo que con más
frecuencia detiene la revisión legal de quien consume. El estudio desde el que
se diseñó el protocolo encontró una licencia declarada en **una de las veinte
aplicaciones** que examinó (*PROTOCOL_DESIGN.md* §3.1, sobre los veinte
expedientes de aplicaciones sondeados el 2026-08-16); las otras diecinueve son
inutilizables para cualquiera que tenga que preguntarle a un abogado primero,
por más abiertas que pretendan ser.

El protocolo no te dice *cuál* licencia. No exige CC0, no exige atribución y no
exige términos permisivos. Un publicador que se reserva todos los derechos y lo
dice es conforme; un publicador que quiere ser abierto y no dice nada, no.

`permitted_use` va al lado para los usos que un identificador de licencia no
expresa con limpieza — si tus datos se pueden agregar, mostrar o usar para
responder preguntas por un sistema de IA. Quien consume está obligado a
respetarlo ([§4.3](/es/developers/spec/0.1/4-api-surface#4-3), regla 6), y las
herramientas de referencia rechazan esas peticiones por construcción, no por
política.

## ¿Puedo publicar si mi app tiene datos personales?

Sí, y esta es la pregunta con la que el diseño del protocolo tuvo más cuidado.

La regla es una **prohibición de cruce, no una omisión de campos**
([§7.1](/es/developers/spec/0.1/7-normative-exclusions#7-1)). Dejar los nombres
fuera de tu feed es necesario y no suficiente. Lo prohibido es combinar los
datos del protocolo con fuentes de personas — y los permisos son por entidad,
así que una aplicación que tiene ubicaciones de albergues y también una lista de
personas desaparecidas federa solo sus entidades que no son personas, desde
superficies que no sirven datos de personas al mismo tiempo.

En concreto, para una app en esa situación:

- Publica los lugares. Sírvelos desde un endpoint que no sirva también registros
  de personas.
- Quita los datos personales del texto libre antes de publicar. `description` y
  `warning_text` son el tercer canal de fuga y el que la gente olvida; el
  validador ejecuta una lista de rechazo sobre ellos.
- Los valores de contacto no viajan en absoluto
  ([§7.2](/es/developers/spec/0.1/7-normative-exclusions#7-2)). `public_url` más
  un enlace hacia afuera es el mecanismo, y `contact_available` lleva el *hecho*
  de que se puede contactar a alguien, nunca el número.
- La integración con el dominio de personas es solo enlace hacia afuera, de
  forma permanente. Converge en los canales oficiales, que el
  [registro](/es/registry) lista como entradas `official_source` justamente para
  que nadie tenga que inventarse un destino.

## ¿Tengo que reescribir mis identificadores?

No. Esta es la decisión de diseño con la que el protocolo está más contento.

La identidad de un registro es `{publisher_id}:{local_id}`
([§5.1](/es/developers/spec/0.1/5-identifiers#5-1)). El `publisher_id` se asigna
una vez, por pull request, y es legible por humanos. El `local_id` es **lo que
tu base de datos ya usa** — un entero, un UUID, una cadena hexadecimal, un
slug. Todos conforman sin cambios.

Eso da unicidad global con cero coordinación. Sin servicio central de
identificadores, sin migración, sin tabla de equivalencias, sin nadie a quien
pedirle permiso. Si tus albergues son las filas 1 a 40 de una tabla de Postgres,
tus identificadores calificados son `tuapp:1` a `tuapp:40` y ya está.

Sí aplican tres reglas: los identificadores deben ser estables entre ediciones,
no deben incrustar datos personales y nunca deben acuñarse dentro del espacio de
nombres de otro publicador — la API de escritura responde 409 si lo intentas,
que es una garantía a nivel de protocolo de que nadie puede hablar en tu nombre.

## ¿Qué pasa si cerramos?

El protocolo tiene un procedimiento para esto, y usarlo es una cortesía con todo
el que construyó sobre tus datos
([§7.4](/es/developers/spec/0.1/7-normative-exclusions#7-4)).

Un cierre ordenado: congela tus feeds con un `last_updated` final, publica
`sunset_at` en tu manifiesto y después o transfieres la custodia de los
registros a un publicador con nombre — que los republica con la cadena de
procedencia intacta — o los declaras archivados.

El registro te marca `archived`, y **tu `publisher_id` nunca se reasigna**. Esa
última parte importa más de lo que suena. Todos los identificadores calificados
que publicaste alguna vez siguen resolviéndose como referencia histórica, y
ningún publicador futuro puede heredar tu espacio de nombres y parecer que dijo
algo que tú no dijiste.

La alternativa no dicha — quedarse callado — es lo que las reglas de frescura
están hechas para sobrevivir. Quien consume respetando
[las reglas](/es/developers/consume) muestra tus registros envejeciendo, los
distingue pasados siete días y no los oculta en silencio. Eso degrada con
dignidad. Pero obliga a adivinar a quienes te consumen, y la adivinanza le
cuesta a alguien un viaje en vano.

## Algo más

La especificación es corta y se lee de principio a fin — unas 3.600 palabras
repartidas en nueve secciones y un apéndice, que son veinte minutos a ritmo de
lectura técnica. Puedes [empezar por arriba](/es/developers/spec).

Si una pregunta sobre adopción no está respondida en ninguna parte, eso es un
error de la documentación y vale un issue. Si no está respondida porque no lo
hemos decidido, la respuesta lo va a decir en vez de sonar segura.
