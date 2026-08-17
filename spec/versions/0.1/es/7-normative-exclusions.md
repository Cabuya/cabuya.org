---
version: "0.1"
status: normative
section: 7
order: 7
title: Exclusiones normativas — las líneas que no se mueven
---

# §7 — Exclusiones normativas

## §7.1 Datos a nivel de persona

El protocolo MUST NOT transportar entidades a nivel de persona — personas
desaparecidas, casos individuales, *identidades* de voluntarios, nombres
personales, teléfonos personales, medios personales. Esto es una **prohibición
de cruce, no una omisión de campos**: las herramientas MUST NOT combinar datos
del protocolo con fuentes a nivel de persona, y los permisos son por entidad —
una aplicación que guarda a la vez datos de lugares y de personas desaparecidas
federa **únicamente** sus entidades que no son personas, desde superficies que
no sirvan datos de personas al mismo tiempo. El texto libre es el tercer canal
de fuga: los publicadores MUST retirar los datos personales de `description` y
`warning_text` antes de publicar.

La integración con el dominio de personas es **solo enlace saliente, de forma
permanente** — y esos enlaces SHOULD converger en los canales oficiales:
**Cruz Roja Colombiana (Restablecimiento del Contacto Familiar)** para
personas desaparecidas y el **Registro Único de Damnificados (UNGRD)** para
personas afectadas. El registro lista esos canales como entradas
`official_source`.

## §7.2 Contacto

Los valores de contacto MUST NOT viajar en los feeds. El mecanismo es
`public_url` más el enlace saliente; `contact_available` lleva el hecho, nunca
el valor; `institutional_contact` (perfil Extended) admite solo números que
pertenecen a la organización.

## §7.3 Scraping y consentimiento

Los datos entran a la red por **publicación, nunca por scraping**. Consumir a
un publicador requiere el consentimiento que declaró en el registro
(`permitted_use`). Los registros suprimidos o moderados se **omiten**, nunca se
etiquetan aguas abajo — republicar el veredicto de moderación de otro sin
derecho a réplica es un riesgo con forma de difamación.

## §7.4 Cierre ordenado

Un publicador que se retira SHOULD: congelar sus feeds con un `last_updated`
final, publicar `sunset_at` en su manifiesto y, o bien (a) transferir la
custodia de los registros a un publicador nombrado (que los republica con la
procedencia encadenada), o bien (b) declarar los registros archivados. El
registro marca al publicador como `archived`; su `publisher_id` nunca se
reasigna.

## §7.5 Suspensión del registro (involuntaria)

Los maintainers MAY marcar a un publicador como `suspended` — insignia
retirada, feeds fuera de la lista, y los consumidores SHOULD dejar de
ingerirlos — por: publicar datos a nivel de persona, mantener lugares
fabricados después de una notificación, o suplantación de identidad. La
suspensión sigue las reglas de consenso perezoso del proceso de RFC, con una
vía de emergencia de 48 horas para incidentes de datos personales; el
publicador recibe un registro público y apelable — nunca una eliminación en
silencio (el principio de «sin veredictos silenciosos» de §7.3 aplica al
registro mismo). El `publisher_id` sigue sin reasignarse nunca.
