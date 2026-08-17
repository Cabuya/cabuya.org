# Política de nombre e insignia

Todo en este proyecto es abierto menos dos cosas: **el nombre y la insignia de
conformidad**. Es deliberado, y es lo que hace que la insignia valga la pena
llevarla. Si cualquiera puede afirmar compatibilidad, la afirmación no carga
ninguna información.

*(In English: [TRADEMARK.md](TRADEMARK.md).)* Este archivo es la fuente;
`https://cabuya.org/es/trademark` lo renderiza. Si alguna vez los dos no
coinciden, manda este archivo.

El modelo es `Certified Kubernetes` — una especificación abierta, un conjunto de
pruebas abierto y una marca cerrada que solo la conformidad desbloquea — con
**una diferencia deliberada: no hay cuota, nunca, y eso está escrito aquí en vez
de simplemente pretendido.** Quienes adoptan esto son equipos voluntarios que
construyen software de ayuda de noche. Una cuota de cualquier tamaño convertiría
la insignia de una marca de trabajo compartido en un filtro sobre quién puede
pagar por ser legítimo.

---

## Las marcas

| Marca | Quién puede usarla | Cómo se gana | Estado |
|---|---|---|---|
| **«Compatible con Cabuya 1.0»** / **«Cabuya 1.0 compatible»** | Cualquier aplicación cuyo feed en vivo pase el validador público | **Autoservicio y automático.** Apuntas el validador a tu feed. Pasa, el registro guarda la fecha y el resultado, y muestras la insignia. Sin solicitud, sin comité, sin cuota. | Activa |
| **«Cabuya Certificado»** | — | — | **Reservada y sin uso.** |

La segunda fila es un compromiso, no un olvido. **No crear un nivel de
certificación que el proyecto no puede sostener con gente.** Una certificación
sin nadie detrás es peor que ninguna, porque promete una revisión que nadie
hace. La palabra *certificado* no aparece en la insignia, ni en el registro, ni
en el validador, ni en la documentación, y hay un test que lo hace cumplir.

## Lo que puedes hacer sin pedirle permiso a nadie

- **Decir cosas ciertas sobre tu software.** «implementa Cabuya», «lee feeds
  Cabuya», «compatible con el Protocolo Cabuya». El uso nominativo y descriptivo
  no necesita permiso de nadie.
- **Mostrar la insignia sin modificar** mientras el registro muestre una
  validación aprobada para un feed en vivo.
- **Bifurcar la especificación y decirlo** — «basado en el Protocolo Cabuya
  1.0». Es CC0; bifurcar es un derecho, no un favor. Lo que una bifurcación no
  puede hacer es llamarse Cabuya.
- **Enseñar, escribir, presentar, criticar.** Charlas, publicaciones, cursos,
  reseñas hostiles. Una política de marca que se pudiera usar para suprimir
  crítica es una política de marca mal usada.

## Lo que no puedes hacer

- **Mostrar la insignia cuando la validación falla, nunca corrió, o nombra una
  versión que no implementas.** Las insignias tienen **alcance de versión**:
  `Cabuya 1.0` es una afirmación sobre 1.0 y sobre nada más.
- **Usar el nombre como tu identidad** — `CabuyaApp`, `Cabuya Inc`,
  `cabuya.com.co`. El uso nominativo está bien; apropiarse de la identidad, no.
- **Modificar la insignia.** Sin recolorear, sin redibujar, sin quitarle la
  versión, sin meterle tu logo.
- **Insinuar un aval, una certificación o una alianza que no existe.** Esta es
  la primera regla del proyecto dicha como política de marca: no avalamos
  organizaciones que no hemos verificado, y nadie puede afirmar que sí.

## Las palabras que nunca se usan

No es una preferencia de estilo — cada una hace una afirmación que el proyecto
no puede respaldar:

| Palabra | Por qué no |
|---|---|
| *Certificado* / *certified* | Aquí nadie certifica nada. Un validador midió un documento en un momento. |
| *Impulsado por Cabuya* / *Powered by Cabuya* | El protocolo no impulsa nada. La aplicación hace el trabajo y habla el formato. |
| *Compatible con Cabuya*, sin versión | Una afirmación sin versión sobrevive a la versión contra la que se midió. Así es como una insignia se vuelve mentira quedándose quieta. |
| *Avalado*, *socio*, *oficial* | Estar en el registro no es un aval, y la página del registro lo dice en los dos idiomas. |

## Cómo se hace cumplir

Al tamaño de este proyecto, hacerla cumplir es **social y probatorio, no legal**,
y decirlo con claridad es más útil que insinuar una capacidad legal que no
existe.

1. **El registro es la fuente de verdad.** Cualquiera puede comparar cualquier
   insignia contra un resultado público de validación y su fecha. Una insignia
   falsa no es una acusación que haya que litigar — es una discrepancia que
   cualquiera puede ver.
2. **La revalidación corre en un horario.** Un feed que se rompe pasa a
   `failing` en el registro con la fecha. La insignia deja de ser verdad y el
   registro lo dice antes de que nadie tenga que reclamar.
3. **Escalar empieza por una conversación.** Casi todo mal uso va a ser una
   insignia vieja después de una refactorización. Un maintainer abre un issue o
   escribe un correo, y casi todo se resuelve ahí.
4. **La escalada legal está aplazada**, porque el proyecto no tiene una entidad
   que pueda ser dueña de una marca registrada. Hasta entonces el nombre se
   sostiene como **marca no registrada de derecho común**, y esta política se
   publica para que la reivindicación al menos quede en el registro público y
   fechada.
5. **El registro formal viene después de pasar a un hogar fiscal**, no antes —
   ver [`GOVERNANCE.es.md`](GOVERNANCE.es.md#qué-abre-automáticamente-la-migración).
   Registrar en Colombia (SIC) y quizá en Estados Unidos (USPTO) es tarea de
   quien pueda ser legalmente dueño de una marca. Los costos no se han cotizado
   y deliberadamente no se estiman aquí.

## Estado de la marca, dicho con honestidad

No se ha hecho ninguna búsqueda formal de disponibilidad. Una búsqueda web en
agosto de 2026 no encontró ninguna empresa de software, producto o marca usando
el nombre, pero **una búsqueda web no es una búsqueda de disponibilidad**, y no
se ha consultado ningún registro — ni la SIC en Colombia, ni la USPTO, ni la
EUIPO. El nombre se usa como marca no registrada de derecho común sobre esa
base.

Si tienes una marca en conflicto, por favor abre un issue o escribe al alias del
proyecto. Enterarnos temprano es mejor para todos que enterarnos en una carta.

## Si la insignia está en tu README

Eres la persona para la que se escribió esta política, y no tienes que hacer
nada. Tu insignia lee la medición en vivo; si tu feed se rompe, la insignia
cambia y el registro explica por qué. No puede decir sobre tu software algo que
el validador no haya encontrado.
