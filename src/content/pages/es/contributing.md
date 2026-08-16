---
title: "Cómo contribuir"
description: "Formas concretas de aportar a Corag: desarrollo, diseño, traducción, contenido, coordinación en terreno y alianzas institucionales."
lastUpdated: 2026-08-14
---

## Antes de empezar

Si lo que buscas es **pedir ayuda, ofrecer ayuda o aportar**, eso no ocurre en
este sitio: ocurre en la aplicación. Este documento es para quien quiere aportar
**construyendo Corag**.

---

## Desarrollo

El camino con más impacto no es construir otra aplicación de ayuda. Es
integrarse con la que ya existe.

> **Muchas interfaces, una sola red de datos.**

En una emergencia aparecen varios equipos construyendo al tiempo, cada uno con
su propia base de datos de necesidades. El resultado es más fragmentación, no
menos. Por eso Corag publica una API abierta: para que una aplicación nueva sea
un cliente de la misma red.

**Cosas útiles que se pueden construir encima:**

- Un bot de WhatsApp o Telegram que publique solicitudes.
- Una PWA que funcione sin conexión, para zonas con mala señal.
- Un importador desde hojas de cálculo, para organizaciones que ya trabajan así.
- Un tablero para una alcaldía o una ONG.
- Interfaces de accesibilidad: texto grande, lectura por voz, baja
  conectividad.
- Detección de duplicados y verificación de calidad de los datos.

Empieza por [la documentación para desarrolladores](/developers).

### Este sitio

`cabuya.org` es abierto. Para contribuir aquí:

```bash
pnpm install
pnpm run dev          # http://localhost:7777
```

Antes de abrir un pull request:

```bash
pnpm run biome:check && pnpm run astro:check && pnpm run test && pnpm run build
```

Convenciones que importan:

- Todo el **código, los comentarios y la documentación en inglés**.
- El **contenido público en español primero**, con su traducción real al inglés.
  Las tildes y la ñ no son opcionales.
- Sin texto de relleno. Nada de `[TODO]`, `[TBD]` ni Lorem ipsum.
- Los tokens de diseño se usan, no se reemplazan por valores hexadecimales.

---

## Diseño

Hace falta:

- Un **máster vectorial del logo**. Hoy solo existe en mapa de bits, y el
  favicon envuelve un raster.
- Ilustración y diagramas que expliquen el modelo sin recurrir a fotografía de
  sufrimiento.
- Revisión de accesibilidad sobre pantallas reales.

La guía de marca y el sistema de diseño están documentados en el repositorio.

---

## Contenido y traducción

- Escribir en el blog sobre coordinación humanitaria, transparencia o tecnología
  cívica.
- Revisar que el español y el inglés digan lo mismo, no solo cosas correctas por
  separado.
- Documentar procesos que hoy solo viven en la cabeza de alguien.

---

## Coordinación en terreno

El trabajo que sostiene todo lo demás:

- Coordinar un frente operativo.
- Verificar necesidades reportadas.
- Acompañar entregas y documentar la evidencia.
- Mantener el estado de las solicitudes al día.

Para esto se postula como líder desde la aplicación.

---

## Organizaciones

Si representas una fundación, una empresa, una alcaldía o una organización
comunitaria, hay tres formas de sumarse:

1. **Aportar capacidad** — transporte, bodega, personal, insumos.
2. **Integrar tus sistemas** con la API, para no duplicar registros.
3. **Respaldar la operación**, con recursos o con difusión.

Escríbenos desde [contacto](/contact).

---

## Cómo se reconoce el trabajo

Quien construye aparece en [colaboradores](/contributors), con su rol y su
área. Quien dejó de estar activo no se borra: el tiempo que alguien donó no deja
de contar.
