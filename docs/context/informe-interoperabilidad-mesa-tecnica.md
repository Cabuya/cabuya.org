# Marco de interoperabilidad de datos entre plataformas de respuesta a emergencias

> **Provenance & fidelity note.** Text rendition of the mesa técnica's
> interoperability report (*Mesa Técnica de Plataformas de Respuesta ·
> Emergencia Eje Cafetero*, 2026-08-16, "Borrador para discusión"), extracted
> from the PDF shared with the working group so the founding record travels
> with this repository. Layout, tables and figures are flattened by extraction;
> **content is otherwise unmodified except for one redaction**: 2 phone-shaped
> contact values in the Figure 4 spreadsheet example are masked (`3•••••••••`)
> under this repository's zero-PII rule — the protocol this report motivated
> forbids contact values from traveling, and this repo applies its own rule to
> itself. The original PDF remains with the working group (and locally,
> git-ignored, at `tmp/informe-interoperabilidad.pdf`).
> Analysis and adopted decisions: [`MESA_TECNICA_ALIGNMENT.md`](./MESA_TECNICA_ALIGNMENT.md),
> [`DECISIONS.md`](./DECISIONS.md) M1–M7.

---

MESA TÉCNICA DE PLATAFORMAS DE RESPUESTA · EMERGENCIA EJE CAFETERO
Marco de interoperabilidad de datos entre plataformas de
respuesta a emergencias
Diagnóstico del ecosistema, estándares aplicables y arquitectura de referencia
FECHA
16 de agosto de 2026
ESTADO
Borrador para discusión
DESTINATARIO
Responsable de la tarea de protocolo entre aplicaciones
ALCANCE
Intercambio de datos operativos entre plataformas ciudadanas e institucionales
activas en la emergencia del 10 de agosto de 2026
Este documento sostiene que el trabajo de especiﬁcación pendiente es
considerablemente menor de lo que sugiere el planteamiento inicial. De las cinco
clases de información que las plataformas intercambian, tres cuentan ya con un
registro oﬁcial al cual referenciarse, y solo dos requieren diseño nuevo. La sección 6
detalla esa distribución; las secciones 1 a 5 la sustentan.
1. Antecedentes
El sismo de magnitud 7,4 del 10 de agosto de 2026, con epicentro en San José del Palmar (Chocó), dejó
un balance nacional de 190 fallecidos y 1.679 heridos en Quibdó, Pereira, Manizales, Cali, Armenia y
Popayán.
1
 En Pereira y Dosquebradas se reportaron 260 personas desaparecidas, 243 rescatadas y 58
estructuras colapsadas, además de cerca de 58.000 menores que quedaron sin acceso a sus
establecimientos educativos.
2
 El gobernador de Risaralda caliﬁcó el balance disponible como «la punta
del iceberg».
En las horas siguientes surgió un número inusualmente alto de plataformas digitales de respuesta,
desarrolladas de forma independiente por equipos ciudadanos. El directorio del ecosistema registra
veinte, y la revisión de prensa identiﬁca al menos cuatro adicionales. La mesa técnica del 15 de agosto
identiﬁcó la fragmentación y la duplicación de esfuerzos como el problema central, y asignó la
elaboración de un protocolo de comunicación entre aplicaciones.
Este documento es un insumo para esa tarea. No propone un protocolo alternativo: propone acotar su
alcance sobre la base de lo que ya existe.
2. Evidencia del problema
La duplicación no es un riesgo proyectado. Es un fenómeno ya registrado por la prensa, por la
administración municipal y por las autoridades de policía, en cuatro manifestaciones distintas.

---


2.1 Congestión informativa
La cobertura periodística de la respuesta describe un cuello de botella de información en redes
sociales y grupos de mensajería, donde la sobreoferta de datos y la falta de coordinación produjeron
confusión y pérdida de tiempo operativo. La descripción corresponde al episodio ocurrido, no a una
proyección de este documento.
2.2 Reconocimiento institucional
La Administración Municipal de Pereira solicitó públicamente canalizar las ayudas a través de puntos
oﬁciales «para evitar duplicación de esfuerzos», en el marco del proceso de caracterización de
afectados adelantado desde el Puesto de Mando Uniﬁcado.
3
 La autoridad local, por tanto, ya identiﬁcó
el problema que la mesa técnica busca resolver.
2.3 Asignación desigual de recursos
Diversos centros de acopio en las principales ciudades alcanzaron su capacidad máxima y debieron
suspender la recepción de donaciones.
4
 De forma simultánea, comunidades rurales del Chocó
permanecían sin atención seis días después del sismo, sin energía eléctrica ni agua potable.
5
 La Oﬁcina
de Naciones Unidas advirtió que desconocía la magnitud del daño en zonas rurales por ausencia de
comunicaciones.
6
«La tragedia ha sido prácticamente invisible porque la atención se concentró en ciudades y
cabeceras municipales.»
José Rutilio Rivas, líder social, comunidades rurales del Medio San Juan
El patrón resultante es que la ayuda se concentra donde existe cobertura de plataformas digitales y
escasea donde no la hay. Se trata de una falla de coordinación de información, no de disponibilidad de
recursos.
2.4 Exposición al fraude
La Policía Nacional y la Dirección de Investigación Criminal emitieron alerta por falsas campañas de
donación y suplantación de identidad, incluida la de un supuesto director de Sanidad.
7
 Las autoridades
advierten de manera especíﬁca sobre sitios fraudulentos de registro, precisando que ninguna entidad
cobra por la inscripción como voluntario o damniﬁcado.
Esta advertencia tiene una implicación directa para la mesa técnica. Cuando coexisten más de veinte
sitios legítimos solicitando datos personales, un sitio fraudulento adicional resulta indistinguible para
el ciudadano. La proliferación de plataformas, además de su costo en eﬁciencia, opera como cobertura
para el delito.
3. Diagnóstico del ecosistema
Se revisaron una a una las plataformas registradas en el directorio del ecosistema, más las
identiﬁcadas en prensa, veriﬁcando en cada caso la existencia de interfaces de datos públicas y su

---


formato. Los resultados se resumen en el cuadro 1.
Cuadro 1.
 Estado de las interfaces de datos en el ecosistema, al 16 de agosto de 2026
CONDICIÓN
PLATAFORMAS
OBSERVACIÓN
Registradas en el directorio
20
Más cuatro identiﬁcadas en prensa
Con interfaz pública veriﬁcada
2
Una de ellas documentada con especiﬁcación
formal
Que adoptan algún estándar
humanitario
0
No se detectó uso de CAP, HSDS, HXL ni EDXL
Con interfaz disponible sin saberlo
1
Opera sobre una plataforma que la genera por
defecto
El obstáculo principal para la integración, sin embargo, no es la ausencia de interfaces sino la
divergencia de vocabularios. Las tres plataformas con datos accesibles emplean términos distintos
para designar los mismos objetos del mundo real, y una de ellas lo hace en inglés. El cuadro 2 recoge
tres casos representativos.
Cuadro 2.
 Divergencia de vocabularios entre plataformas con datos accesibles
OBJETO
PLATAFORMA A
PLATAFORMA B
PLATAFORMA C
Albergue
refugio
shelter
Albergue
Centro de acopio
acopio
collection
Centro de acopio
Prioridad máxima
urgent
risk: high
prioridad: Alta
La corrección de esta divergencia exige un diccionario de equivalencias acordado y publicado, no un formato nuevo.
4. Estándares abiertos aplicables
Antes de especiﬁcar campos propios conviene evaluar los estándares existentes. Los cuatro que se
relacionan a continuación son abiertos, libres de regalías y se encuentran en uso operativo. El primero
reviste particular importancia porque ya opera en el país.

---


Cuadro 3.
 Estándares aplicables por vertical de información
ESTÁNDAR
EMISOR
OBJETO
PERTINENCIA
CAP
OASIS / OMM
Alertas de emergencia
Adoptado oﬁcialmente en Colombia por
IDEAM, UNGRD y Google; el país fue el
primero de la región en implementarlo
8
HSDS
Open Referral
Directorios de servicios:
organizaciones, sedes y
servicios
Corresponde a la estructura de acopios,
albergues y centros de salud, que
constituyen la mayoría del ecosistema
HXL
OCHA —
Naciones
Unidas
Etiquetado de hojas de
cálculo
No requiere desarrollo de software; única vía
de adopción viable para las plataformas sin
interfaz propia
EDXL-RM /
HAVE
OASIS
Solicitud de recursos y
disponibilidad de
instalaciones
Referencia conceptual únicamente; su
codiﬁcación en XML data de 2008
5. Registros canónicos existentes
La revisión de la respuesta institucional arrojó el hallazgo que más reduce el alcance del trabajo
pendiente. Para tres de las cinco verticales de información, la identidad de los registros no requiere
diseño: requiere referencia a un sistema ya autoritativo.
Las personas damniﬁcadas se incorporan al Registro Único de Damniﬁcados de la Unidad Nacional
para la Gestión del Riesgo de Desastres, instrumento oﬁcial de identiﬁcación y caracterización de
quienes requieren asistencia.
9
 Las personas desaparecidas corresponden al canal habilitado por la
Cruz Roja Colombiana, que opera dentro del sistema internacional de Restablecimiento del Contacto
Familiar.
10
 Las alertas, como se indicó, disponen de CAP.
Pese a ello, en el momento de redacción de este documento se contabilizan 4.344 personas por
localizar distribuidas entre tres plataformas ciudadanas independientes, en paralelo al canal oﬁcial.
11
Una familia que adelante una búsqueda debe consultar cuatro fuentes distintas, de las cuales tres
carecen de carácter autoritativo. Este caso ilustra con precisión el costo humano de la fragmentación.
6. Arquitectura propuesta
La propuesta consiste en referenciar tres verticales y especiﬁcar dos. El cuadro 4 resume la
distribución y sus implicaciones.

---


Cuadro 4.
 Tratamiento propuesto por vertical de información
VERTICAL
TRATAMIENTO
IMPLICACIÓN
Damniﬁcados
Referenciar
Las plataformas alimentan el Registro Único; no constituyen fuente de
verdad
Desaparecidos
Referenciar
Convergencia hacia el canal de Cruz Roja; cese de registros paralelos
Alertas
Referenciar
Adopción de CAP, con conexión al sistema nacional de alertas
públicas
Lugares físicos
Especiﬁcar
Registro compartido con identiﬁcador canónico; no existe y resulta
indispensable
Necesidad y
oferta
Especiﬁcar
Formato común mínimo; único caso que justiﬁca desarrollo nuevo
Conviene señalar un efecto secundario de valor institucional. Un registro compartido y veriﬁcado de
puntos legítimos constituye en sí mismo una contramedida frente al fraude descrito en la sección 2.4, y
ofrece a la mesa técnica un argumento de utilidad pública ante la administración municipal y la
Unidad Nacional para la Gestión del Riesgo.
7. Casos de uso
7.1 Reconciliación de un mismo lugar físico
Un centro de acopio de referencia ﬁgura actualmente en tres plataformas, con números de contacto
distintos y horarios que se contradicen entre sí, sin que el ciudadano pueda determinar cuál se
encuentra vigente. Bajo un registro de lugares, cada plataforma conserva su publicación pero declara a
qué lugar canónico corresponde.
Figura 1.
 Declaración de correspondencia con un lugar canónico
{
  "lugarCanonico": "CO-RIS-PER-ACOPIO-0007",
  "nombreLocal":   "Expofuturo",
  "fuente":        "plataforma-a",
  "idEnFuente":    "d6ba7c67",
  "horario":       "8AM-8PM",
  "estado":        "activo",
  "actualizado":   "2026-08-16T09:12:00-05:00"
}
Con esa declaración, cualquier consumidor puede agrupar las tres versiones, presentar la más reciente
y detectar la contradicción entre ellas. El registro no sustituye ninguna plataforma; las reconcilia.

---


7.2 Alerta interoperable con el sistema nacional
Una restricción de circulación por riesgo estructural, publicada en CAP en lugar de un formato propio,
resulta legible de manera simultánea por las demás plataformas, por el sistema nacional de alertas y
por los agregadores públicos que ya lo consumen.
Figura 2.
 Alerta de restricción codificada en CAP
<alert>
  <identifier>PLAT-2026-0814-0031</identifier>
  <sender>plataforma-c</sender>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <info>
    <language>es-CO</language>
    <category>Safety</category>
    <urgency>Immediate</urgency>
    <severity>Severe</severity>
    <headline>Cierre total sector Invico</headline>
    <instruction>Ruta alterna por Carrera 19</instruction>
    <area><circle>4.80802,-75.69339 0.4</circle></area>
  </info>
</alert>
7.3 Registro de necesidad con nivel de cobertura
El formato mínimo para el par necesidad-oferta se apoya en tres campos determinantes. Los dos
primeros, 
fuente
 e 
idEnFuente
, permiten retransmitir un mismo registro de forma indeﬁnida sin
generar duplicados. El tercero, 
cantidadCubierta
, es el que evita el fenómeno descrito en la sección 2.3:
la llegada de cuatrocientas unidades a un punto que había solicitado cuarenta.
Figura 3.
 Necesidad con cantidad requerida y cubierta
{
  "tipo":              "necesidad",
  "lugarCanonico":     "CO-RIS-PER-ALBERGUE-0003",
  "recurso":           "colchonetas",
  "cantidadRequerida": 40,
  "unidad":            "unidades",
  "cantidadCubierta":  12,
  "urgencia":          "alta",
  "fuente":            "plataforma-b",
  "idEnFuente":        "a91f0c",
  "actualizado":       "2026-08-16T08:40:00-05:00"
}
7.4 Vía de entrada para plataformas sin interfaz propia
Desarrollar una interfaz de datos durante la emergencia no resulta viable para la mayoría de los
equipos, que operan con recursos limitados y prioridades operativas. HXL requiere únicamente añadir
una ﬁla de etiquetas a una hoja de cálculo existente. Una hoja publicada en formato de valores

---


separados por comas constituye ya una fuente legible por máquina, sin desarrollo, infraestructura ni
presupuesto asociados.
Figura 4.
 Etiquetado HXL sobre una hoja de cálculo de albergues
Nombre           Dirección          Barrio      Cupo  Ocupado  Teléfono
#loc+name        #loc+address       #adm2       #cap  #reached #contact+phone
Coliseo Mayor    Av. Américas #37   Villa Olím  1000  1000     3•••••••••
Centro Violetas  Calle 27           Dosquebrad   150    33     3•••••••••
8. Hoja de ruta
Las etapas se ordenan por dependencia técnica y por costo de ejecución, de menor a mayor. Las dos
primeras no requieren desarrollo de software.
1. 
Publicación del diccionario de equivalencias.
 Correspondencia entre los términos que cada
plataforma emplea actualmente. Constituye el entregable de menor costo y habilita los
siguientes.
2. 
Levantamiento del registro de lugares.
 Acopios, albergues y centros de salud del Eje Cafetero,
con identiﬁcador canónico. El universo es de unos cientos de sedes, lo que permite curaduría
manual con veriﬁcación.
3. 
Habilitación de la vía HXL.
 Plantilla de hoja de cálculo para publicación sin desarrollo. Meta
sugerida: pasar de dos fuentes legibles a diez.
4. 
Especiﬁcación del formato de necesidad y oferta
, acompañada de una implementación de
referencia operativa desde el inicio. Una especiﬁcación sin implementación que la valide
permanece como documento.
5. 
Presentación ante la administración municipal y la Unidad Nacional para la Gestión del
Riesgo
, con el registro de puntos legítimos como contramedida frente al fraude.
Referencias
1. 
Infobae. «Sube a 190 la cifra de muertos y 1.679 heridos por el terremoto de magnitud 7,4», 11 de
agosto de 2026. 
infobae.com
2. 
El Espectador. «260 personas desaparecidas y 58 mil niños descolarizados en Pereira».
elespectador.com
3. 
Pulzo. «Autoridades de Pereira coordinan censos y entrega de ayudas tras el terremoto». 
pulzo.com
4. 
Colombia.com. «Varios centros de acopio han tenido que dejar de recibir ayudas porque se encuentran
copados». 
colombia.com
5. 
Forbes Colombia. «La otra cara del terremoto: comunidades rurales del Chocó siguen esperando
ayuda». 
forbes.co
6. 
La FM. «ONU advierte que aún no conoce la magnitud del daño en zonas rurales: “No hay
comunicación”». 
lafm.com.co

---


7. 
Infobae. «Delincuentes están usando falsas campañas de ayuda y mensajes fraudulentos», 15 de
agosto de 2026. 
infobae.com
8. 
Unidad Nacional para la Gestión del Riesgo de Desastres. «Alertas Públicas de Google».
gestiondelriesgo.gov.co
9. 
Radio Nacional de Colombia. «Cómo acceder a las ayudas humanitarias después del terremoto».
radionacional.co
10. 
El Tiempo. «Cruz Roja habilitó canales oﬁciales para contactar a personas desaparecidas».
eltiempo.com
11. 
Univision. «“Colombia te busca” y “desaparecidos.co”: las plataformas ciudadanas para localizar a los
desaparecidos». 
univision.com
Las cifras y citas proceden de las fuentes relacionadas. El inventario de plataformas, la veriﬁcación de interfaces y el
cuadro de vocabularios proceden de la revisión directa de los datos publicados por cada plataforma los días 15 y 16
de agosto de 2026. Los nombres de plataforma en los cuadros 2 y 3 y en las ﬁguras se han sustituido por
identiﬁcadores genéricos.
