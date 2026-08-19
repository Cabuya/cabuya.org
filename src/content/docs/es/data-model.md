---
title: Guía del modelo de datos
description: Una forma recomendada de organizar los datos de una app de ayuda para que publicar un feed conforme salga casi gratis. Guía, no requisito.
section: reference
order: 4
updated: 2026-08-19
---

**Esta página es guía, no requisito.** La especificación solo obliga lo que
publicas — el manifiesto y el feed. Tu modelo interno es tuyo: el
[cruce de campos](/es/developers/quickstart) traduce lo que ya tienes al
esquema compartido, y nadie migra tus llaves primarias.

Pero muchas apps de ayuda se construyen en días, durante la emergencia, con
equipos eligiendo la forma de sus tablas a las dos de la mañana. Si estás
construyendo ahora — o todavía puedes ajustar — esta es la forma que vuelve
la publicación casi gratis, porque es la forma publicada, la misma que usas
puertas adentro.
Cinco recomendaciones, en el orden en que ahorran dolor.

## 1. Separa lo que viaja de lo que nunca viaja

Guarda el contacto personal — nombres, teléfonos, correos, cualquier dato de
nivel persona — en sus propias tablas, **sin ruta de cruce desde las
consultas que arman tu feed**. El protocolo excluye los datos de personas por
una [prohibición de cruce](/es/developers/spec/0.1/7-normative-exclusions), y
la forma más barata de cumplirla es estructural: un serializador que *no
puede alcanzar* el contacto no puede filtrarlo.

| Viaja (tablas del feed) | Nunca viaja (tablas de contacto) |
|---|---|
| nombre del lugar, tipo, estado | el nombre de la persona de contacto |
| municipio, barrio, coordenadas | teléfonos, correos |
| cantidades, confirmaciones, marcas de tiempo | medios personales |
| la URL de la página pública del registro | cualquier dato de un individuo |

## 2. Dale a tus entidades la forma de las del protocolo

Nombra y tipa tus columnas como el
[esquema `place`](/es/developers/schemas/0.1/place-feed) donde puedas:
`name`, `place_kind`, `lifecycle_status`, `service_status`, `public_url`.
Cada campo que compartes con el esquema es una fila del cruce que se vuelve
la función identidad. Si tu app maneja pedidos de ayuda con cantidades, ten
presente que `need`/`offer` están **propuestos para la v0.2 en la
[RFC 0002](/es/rfcs/0002)** — un borrador, no algo publicado — y darles la
forma del esbozo de la RFC (`quantity_required`, `quantity_covered`, `unit`,
anclados a un lugar o a una organización) significa publicar el día que
llegue.

## 3. Lleva los campos de honestidad desde el primer día

La regla del protocolo más difícil de instalar después: `last_confirmed_at`
debe ser un evento real de confirmación — alguien verificó — o `null`.
**Nunca el `updated_at` de la base de datos.** Así que guarda el evento de
confirmación desde el primer día (quién confirmó, cómo, cuándo), y mantén el
estado en una columna de estado: un registro llamado «Coliseo (¡CERRADO!)»
codifica el estado en un nombre, y ningún esquema puede leerlo de vuelta.

## 4. Geografía como código + texto + coordenadas + precisión

Guarda los cuatro, desde el primer día: el **código** de municipio (DANE en
Colombia — el `municipality_code` del protocolo), el municipio y el barrio
como **texto**, las **coordenadas** cuando las tengas, y la **precisión** que
de verdad tienes (`geo_precision`), no la que quisieras tener. Los nombres de
ciudad en texto libre que aún no puedes codificar están bien —
`municipality_text` con código nulo es la salida que el esquema deja abierta.
Esto es lo que permite que un registro republicado en otra ciudad siga
diciendo dónde está.

## 5. Ids públicos estables, y una página pública por registro

Dale a cada registro un id que nunca cambie (tu llave primaria, del tipo que
sea) y una página pública de detalle — el `public_url` al que van a enlazar
los botones de acción de las otras apps. Si un registro no tiene página
pública, las demás apps no tienen a dónde mandar a la persona que quiere
actuar, y tu regla de contacto se queda sin mecanismo.

## Las dos rampas de entrada

- **App existente:** no reorganices nada. Sigue la
  [guía rápida](/es/developers/quickstart) — el cruce traduce tus columnas
  tal como están.
- **App nueva o ajustable:** parte de este modelo, y la
  [skill para agentes](/es/developers/skill) encontrará un cruce tan cercano
  a la identidad que el serializador casi se escribe solo.
