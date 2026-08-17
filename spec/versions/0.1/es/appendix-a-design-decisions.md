---
version: "0.1"
status: normative
section: 9
order: 9
title: "Apéndice A — decisiones de diseño y el recorrido de implementabilidad (no normativo)"
---

# Apéndice A — Decisiones de diseño (NO NORMATIVO)

> Nada en este apéndice es normativo. Registra **por qué** las secciones
> normativas dicen lo que dicen, para que los RFC futuros discutan contra el
> razonamiento real en vez de adivinarlo.

## A.1 El registro de decisiones

| Decisión | Alternativas consideradas | Por qué | Revisar cuando |
|---|---|---|---|
| Archivo estático primero (piso L2) | API REST primero; federación por push | Casi la mitad de las aplicaciones observadas están a una tarde de un archivo estático; los protocolos de federación se llevarían todo el presupuesto de adopción; un `ttl` de 300 s cubre la latencia de los datos de albergues | Entre en alcance una entidad en tiempo real (disponibilidad de camas) |
| JSON (con la forma de sobre adoptada) | CSV etiquetado con HXL; JSON-LD | Todas las aplicaciones observadas son nativas de JSON; la varianza de JSON-LD es un impuesto de interoperabilidad documentado | Nunca en 0.x |
| Registro por PR más ruta conocida | Solo registro central; descubrimiento por DNS | Se puede diferenciar, revisar y bifurcar (eso es una función de gobernanza); hoy las SPA con catch-all rompen una regla de solo ruta conocida en hostings reales | El registro supere lo que la revisión por git aguanta |
| Una sola entidad (`place`) | Publicar también need/offer/damage | Los lugares son la mayor superficie de duplicación, no son personales y cambian despacio; los vocabularios de emparejamiento son incompatibles de forma demostrable y necesitan primero la maquinaria de equivalencias | RFC de 0.2 |
| Feed primero; API obligatoria solo en L3 | API primero | El objetivo fundacional es la superficie de API, pero el *piso* no puede serlo — la mayoría de las aplicaciones observadas no tiene API pública. Un esquema y cuatro transportes mantienen coherente el estado final mientras la rampa de entrada sigue siendo una tarde | Haya datos de adopción de L3 de dos ciclos de versión |
| `{publisher_id}:{local_id}`; sin obligar UUID | Todo UUID; identificadores de lugar centrales | Unicidad con cero coordinación; sin impuesto de migración; la identidad central de lugar se aplaza hasta que existan agrupaciones reales | El índice de lugares de 0.2 |
| Sin firmas en 0.1 | Feeds firmados; identidad DID | La gestión de llaves les falla a los equipos de voluntarios; el registro y la moderación mitigan las amenazas vivas; la ruta de actualización queda preservada | El primer incidente de suplantación observado, o v1 |
| Registro acotado por evento, registros con evento opcional | Acotado por país; evento obligatorio | Las aplicaciones operan varios eventos en paralelo; los lugares sobreviven a las emergencias — la reutilización más allá del evento fundacional es la estrella polar | El primer despliegue fuera de Colombia |
| La moderación nunca federa | Federar los veredictos de confianza | Riesgo con forma de difamación; omitir es seguro, etiquetar no | Haya un RFC de marco de confianza entre publicadores (v1 o posterior) |

## A.2 El recorrido de implementabilidad — el listón de la tarde

Perfil: una aplicación real del ecosistema (Next.js App Router más Supabase,
sin API pública), llevada a **L2** por un agente de código con la skill
instalada:

1. *(15 min)* La skill lee el repositorio, encuentra el esquema de la base de
   datos y mapea las tablas de albergues y acopios a `place`:
   `last_confirmed_at` ← el propio campo de confirmación de la aplicación (este
   campo se tomó *del* ecosistema), la categoría → `place_kind` por la tabla de
   equivalencias, el municipio → búsqueda DIVIPOLA.
2. *(30 min)* El agente escribe un manejador de ruta (o una exportación en
   tiempo de compilación) que serializa los registros mapeados dentro del
   sobre. **La decisión sobre datos personales se le presenta a la persona**:
   las columnas de nombre y teléfono que marca la lista de rechazo quedan
   excluidas; `public_url` apunta a las páginas de registro de la propia
   aplicación. Una decisión humana.
3. *(15 min)* Se escribe el manifiesto en `/.well-known/cabuya.json`; se agrega
   la exclusión del catch-all de la SPA (una línea); se comprueba el
   `robots.txt`.
4. *(30–60 min)* Ciclo del validador: errores de esquema → corregir el mapeo;
   soft-404 → pasa; doble sondeo de siempre-ahora → pasa.
5. *(10 min)* Se abre el PR al registro; la revalidación programada lo recoge;
   aparece la insignia `publishes`.

**Total: ≈ 2 horas de tiempo de agente más una decisión humana.**

Los pasos que romperían el listón si la especificación fuera distinta — y por
eso cada decisión de §10 salió como salió: UUID obligatorios (el paso 1 se
vuelve una migración) · GeoJSON obligatorio (al paso 2 le crece una
refactorización de geometría) · firmas (el paso 3 se vuelve una ceremonia de
llaves) · acuñación central de identificadores de lugar (el paso 5 se vuelve
una negociación).
