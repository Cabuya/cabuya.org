# Gobernanza

Cómo se decide el Protocolo Cabuya, quién lo decide y qué pasa si la gente que
hoy lo decide desaparece.

*(In English: [GOVERNANCE.md](GOVERNANCE.md).)* Este archivo es la fuente;
`https://cabuya.org/es/governance` lo renderiza. Si alguna vez los dos no
coinciden, manda este archivo.

---

## Hoy

**Todavía no hay consejo de maintainers.** El protocolo lo mantiene el equipo
inicial que escribió el borrador 0.1. Este documento describe el modelo al que
el proyecto se comprometió, los criterios para entrar y las condiciones que lo
cambian — para que nadie tenga que negociar nada de eso después, y para que
cada afirmación de esta página se pueda comprobar contra la realidad.

Donde este documento dice *maintainers*, léelo como *el equipo inicial* hasta
que [`MAINTAINERS.md`](MAINTAINERS.md) liste más de una organización.

## La compuerta de neutralidad

> **`Cabuya 1.0` no se puede etiquetar hasta que al menos dos maintainers
> representen aplicaciones distintas de la del equipo fundador.** Hasta
> entonces la especificación se queda en `0.x`.

Es la regla más importante de aquí, y está escrita como bloqueo de release y no
como intención a propósito. Se le está pidiendo a diecinueve equipos que pongan
una insignia en su propio producto. Ninguno debería tener que confiar en la
buena voluntad continuada de nadie para hacerlo, y una promesa de neutralidad
futura vale exactamente lo que valga el mecanismo que la hace cumplir.

## El modelo

**Un consejo de maintainers de varias aplicaciones ahora; un hogar fiscal
precomprometido.**

No un modelo de dictador benevolente, porque un dominio registrado a nombre de
una persona no es neutralidad, y porque un proyecto cuyo valor entero es la
durabilidad no puede tener un factor bus de uno.

Todavía no una fundación, porque constituirse primero gastaría la poca energía
del grupo en estatutos justo en las semanas en que lo que la gente necesita es
un formato de feed que funcione. Una fundación es el destino correcto y el punto
de partida equivocado.

### Qué abre automáticamente la migración

Cualquiera **una** de estas abre un RFC para pasar a un hogar fiscal. Escritas
ahora para que después sea un trámite y no una negociación política:

1. **Ocho o más** implementaciones conformes operadas de forma independiente en
   el registro, **o**
2. el proyecto necesita **recibir o tener dinero** — una beca, un patrocinio,
   una factura de infraestructura, **o**
3. alguien necesita **ser dueño de la marca** como persona jurídica para poder
   defender la insignia, **o**
4. **dos o más** maintainers lo piden.

Cuál hogar está deliberadamente sin decidir. Open Collective con un hogar
fiscal, la Software Freedom Conservancy, una entidad sin ánimo de lucro
colombiana dispuesta a hacer de custodia, y la Linux Foundation para una
especificación madura son todas candidatas a evaluar en ese momento. Nombrar una
hoy sería un compromiso que nadie ha adquirido.

## Cómo se llega a maintainer

Las cuatro, no tres:

1. **Tu aplicación publica un feed conforme que el validador público aprueba.**
   La intención, la asistencia a reuniones y el entusiasmo no califican.
   Publicar, sí.
2. **Dos o más contribuciones sustantivas** — un RFC aceptado, un cambio de
   esquema revisado, una contribución al validador o a la skill, o una prueba de
   interoperabilidad documentada contra el feed de otra aplicación.
3. **Nominación de un maintainer existente**, confirmada por consenso pasivo con
   una ventana de objeción de **7 días**.
4. **Aceptación del código de conducta** y de los términos de licencia.

### Límites de composición

- **Máximo dos maintainers por aplicación u organización**, contando a quien
  esté empleado por ella, contratando con ella o habiéndola fundado. Un consejo
  de cinco con tres asientos de una sola app es un dictador benevolente
  disfrazado.
- **Objetivo de tres a cinco maintainers.** Menos de tres no es un consejo; más
  de cinco vuelve lento el consenso pasivo sin volverlo más legítimo.
- Los maintainers están listados en [`MAINTAINERS.md`](MAINTAINERS.md) con la
  aplicación que representan, así que el límite de composición es auditable por
  cualquiera, en cualquier momento, sin preguntarle a nadie.

### Eméritos y remoción

Un maintainer inactivo **120 días** pasa a emérito automáticamente — sin
votación, sin drama, reversible a solicitud. La remoción con causa exige un
hallazgo del código de conducta o una supermayoría de los maintainers restantes,
y queda registrada públicamente con su motivo.

## Cómo se toman las decisiones

Consenso pasivo en todo: **el silencio es asentimiento, una objeción tiene que
estar razonada y la carga la lleva el cambio.**

| Nivel | Alcance | Requisito | Ventana |
|---|---|---|---|
| **Vía rápida** | Erratas, ejemplos, documentación, prosa no normativa, CI, tests, texto del sitio | 1 aprobación de maintainer, se integra de inmediato | ninguna |
| **Normativo** | Cualquier cambio a un campo del esquema, cardinalidad, enumeración, obligatoriedad, nivel de conformidad o el significado de un término definido | RFC + **2 aprobaciones de maintainers que representen 2 aplicaciones distintas** | **10 días** |
| **Ruptura** | Quitar o renombrar un campo, cambiar un tipo, cambiar la conformidad de modo que un feed conforme deje de serlo, cambiar la gobernanza o las licencias | RFC + **mayoría de todos los maintainers**, y una nota de migración escrita | **21 días** |

**Objeciones.** Una objeción razonada de cualquier maintainer detiene el reloj, y
tiene que decir qué la resolvería. Una objeción sin camino de resolución expira
a los 14 días.

**Empate.** Un RFC normativo o de ruptura que siga sin resolverse **30 días**
después de abrirse su ventana queda **rechazado por defecto**, y se puede
reabrir con información nueva. El sesgo hacia el *no* es deliberado: un campo
que no se publica cuesta muchísimo menos que un campo con el que veinte
implementaciones tienen que vivir para siempre.

**No hay voto de calidad.** No hay desempate. La persona a la que sería más
probable dárselo es exactamente la persona a la que los límites de composición
existen para contener.

**Cláusula de emergencia.** Durante una emergencia activa declarada, la vía
rápida cubre además campos **puramente aditivos y opcionales** — propiedades
nuevas opcionales que ninguna implementación conforme está obligada a leer ni a
emitir — integrados con 2 aprobaciones y una ventana de **72 horas**, y
**convertidos automáticamente en un RFC retroactivo dentro de 14 días**. Si ese
RFC se rechaza, el campo se deprecia en la siguiente versión.

Esto existe para que nadie esquive el proceso cuando se necesita un feed el
martes. No se puede usar para nada que cambie el comportamiento existente.

## La salida de emergencia

La cláusula que hace seguro decir que sí. Seis mecanismos, ninguno de los cuales
depende de la buena voluntad de nadie:

1. **La licencia es el cimiento.** CC0 sobre la especificación significa que
   cualquiera puede bifurcarla, republicarla y continuarla — legalmente, para
   siempre, sin permiso. Ningún fracaso de gobernanza puede quitarle la
   especificación a quienes la usan.
2. **La fuente canónica es un repositorio git, y cada maintainer tiene un clon
   completo.** `git clone` *es* la copia de respaldo. La lista de maintainers es
   además un archivo distribuido con un piso de tres copias.
3. **La identidad no depende de una URL que resuelva.** Los `$id` de los
   esquemas son URLs versionadas, pero el validador y todos los SDK funcionan
   completamente sin conexión desde una copia incluida. **Una implementación
   conforme nunca debe necesitar una llamada de red a `cabuya.org` para
   validar.** Los esquemas viajan dentro del release etiquetado y dentro del
   paquete npm, ambos direccionables por contenido y replicados por todo el que
   los haya instalado alguna vez.
4. **Cláusula de continuidad, dicha por anticipado.** *Si el dominio canónico
   caduca, o la organización no publica ni integra nada durante 180 días
   corridos, dos maintainers cualesquiera que representen dos aplicaciones
   distintas pueden publicar un repositorio sucesor, anunciarlo en el registro y
   en los últimos canales conocidos, y la comunidad lo sigue. El sucesor hereda
   la numeración de versiones y las obligaciones de este documento.* Nombrar esto
   antes de necesitarlo es justamente el punto: convierte una crisis futura en un
   procedimiento.
5. **Los dominios y las cuentas de organización están en custodia compartida,
   nunca personal.** El contacto de registro es un alias del proyecto, no una
   persona.
6. **Nada en el protocolo puede exigir un servicio central.** Ninguna consulta
   obligatoria al registro, ninguna clave de API obligatoria, ninguna llamada de
   retorno obligatoria. El registro es una comodidad y una ayuda de
   descubrimiento; un feed es válido sepa o no el registro que existe.

El sexto es lo que de verdad vuelve la especificación de nadie. Un protocolo con
un endpoint central obligatorio le pertenece a quien opere ese endpoint, diga lo
que diga su archivo de gobernanza.

## El proceso de RFC

Un cambio necesita RFC cuando toca un campo del esquema, un nivel de
conformidad, el significado de un término definido, la gobernanza o las
licencias. Todo lo demás va por la vía rápida.

Cualquiera puede abrir uno. No hace falta ser maintainer y no hace falta haber
escrito código — quien se estrelló implementando la especificación suele ser
quien mejor puede describir qué tiene de malo.

Los RFC viven en `spec/rfcs/`, se numeran al integrarse y se publican en
`https://cabuya.org/es/rfcs`. La plantilla es `spec/rfcs/0000-template.md`, y
lleva una sección obligatoria que otras no tienen:

> **Revisión de privacidad y datos personales — puede bloquear por sí sola.**
> Cada RFC dice qué datos de personas podría volver alcanzables su cambio, de
> forma directa o cruzando con otra fuente. Un RFC que no pueda responder eso no
> avanza, por útil que fuera el campo.

## Código de conducta

El [Contributor Covenant 2.1](CODE_OF_CONDUCT.md), con dos adiciones propias del
proyecto:

- **Los reportes van a un rol que sostienen al menos dos maintainers de dos
  aplicaciones distintas** — nunca a una persona con nombre y apellido. Si no,
  reportar a un maintainer puede significar reportárselo a sí mismo.
- **Una regla de recusación.** Un maintainer que sea objeto de un reporte no
  participa en atenderlo. Si quienes sostienen el alias están en conflicto de
  interés, los maintainers restantes designan a alguien temporal.

## Licencias

Dos capas, deliberadamente distintas:

- **La especificación, los esquemas y el registro: CC0-1.0.** Dominio público.
  Bifúrcalo, inclúyelo, republícalo, construye una implementación competidora.
  Es el primer mecanismo de la salida de emergencia y no está en discusión.
- **El código: Apache-2.0.** El validador, el sitio, la skill. Apache y no MIT
  por la concesión expresa de patentes, que le importa a las instituciones que
  este protocolo quiere alcanzar.

**Las contribuciones van con DCO, no con CLA.** Firma tus commits:

```bash
git commit -s -m "tu mensaje"
```

Eso añade una línea `Signed-off-by` que afirma que tienes derecho a aportar ese
trabajo, bajo el
[Developer Certificate of Origin 1.1](https://developercertificate.org/). CI lo
verifica.

Un CLA se rechaza por dos razones. Requiere una entidad legal a la cual cederle
derechos, y no existe. Y su fricción reduce de forma medible justamente las
contribuciones de paso de quienes programan como voluntarios, de las que este
proyecto depende. El DCO da la garantía que de verdad importa — *quien contribuye
tiene derecho a contribuir esto* — sin papeleo y sin contraparte.

## Cómo se cambia este documento

Los cambios de gobernanza son de **ruptura** según la tabla de arriba: un RFC,
mayoría de todos los maintainers, una nota de migración escrita y 21 días.
