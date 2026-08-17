import type { SiteTranslations } from './types';

/** Textos en español — escritos nativamente, no traducidos del inglés. */
export const es: SiteTranslations = {
  siteTitle: 'Cabuya',
  siteTitleFull: 'Cabuya — el protocolo abierto de interoperabilidad de ayuda',
  siteDescription:
    'Cabuya es un formato abierto para que las apps de ayuda publiquen y lean los mismos datos: puntos de acopio, necesidades, capacidades y entregas. Cualquier equipo puede implementarlo en una tarde, y nadie tiene que pedirle permiso a nadie.',
  siteDescriptionShort:
    'Un formato abierto para que las apps de ayuda publiquen y lean los mismos datos. La conformidad se mide, no se declara.',

  nav: {
    home: 'Inicio',
    foundingRecord: 'Registro fundacional',
    github: 'GitHub',
    openMenu: 'Abrir el menú',
    closeMenu: 'Cerrar el menú',
    switchToLanguage: 'Switch to English',
    skipToContent: 'Saltar al contenido',
  },

  specBanner: {
    label: 'Borrador',
    text: 'La especificación 0.1 es un borrador en revisión. Los anclajes y los nombres de campo todavía pueden cambiar.',
    linkLabel: 'Cómo cambia el protocolo',
  },

  theme: {
    toLight: 'Cambiar a modo claro',
    toDark: 'Cambiar a modo oscuro',
  },

  home: {
    metaTitle: 'Cabuya — el protocolo abierto de interoperabilidad de ayuda',
    metaDescription:
      'Un formato abierto para que las apps de ayuda publiquen y lean los mismos datos. Un esquema, cuatro transportes; conformidad medida por un validador público.',

    hero: {
      eyebrow: 'Un protocolo abierto para apps de ayuda',
      title: 'Cada app es un hilo. El protocolo es la cuerda.',
      pitch:
        'Cabuya es un formato abierto para que las apps de ayuda publiquen y lean los mismos datos: puntos de acopio, necesidades, capacidades y entregas.',
      pitchSecond:
        'Cualquier equipo puede implementarlo en una tarde, y nadie tiene que pedirle permiso a nadie. La conformidad se mide con un validador publicado — nunca se declara.',
      ctaPrimary: 'Publicar un feed',
      ctaSecondary: 'Ver quién publica',
      ctaPending:
        'La guía rápida y el registro se están escribiendo ahora. Mientras tanto, la especificación y el validador ya están en el repositorio.',
    },

    thesis: {
      kicker: 'La tesis',
      principle: '«Crecemos juntos: no competimos, nos alimentamos.»',
      gloss: 'La fibra con la que se amarra lo que nadie puede cargar solo.',
      body: 'La cabuya es la fibra con la que se amarra. Un hilo solo no aguanta nada; torcidos juntos, cargan lo que sea. Eso no es una metáfora sobre colaborar en general: es la descripción de lo que pasa cuando dos aplicaciones pueden leer los datos de la otra.',
      bodySecond:
        'Cada app que entra conserva su producto, sus usuarios y sus decisiones. Lo que gana es que sus registros dejan de quedarse encerrados adentro, y que puede leer los de todos los demás sin pedir permiso.',
      intentNote:
        'Para eso existe el protocolo. Que pase o no depende de los equipos que lo adopten, y todavía no ha pasado.',
    },

    howItWorks: {
      kicker: 'Cómo funciona',
      title: 'Cuatro pasos, y ninguno nos necesita',
      lead: 'Nada de esto requiere una cuenta, una aprobación ni una conversación con nadie. El protocolo es un documento; el validador es un programa que puedes correr tú.',
      steps: [
        {
          title: 'Publica un manifiesto',
          body: 'Un archivo JSON en una ruta conocida que dice quién eres, qué publicas y bajo qué licencia.',
        },
        {
          title: 'Exporta un feed',
          body: 'Tus lugares, en el esquema compartido. Basta con un archivo estático en una URL estable — no hace falta una API.',
        },
        {
          title: 'Corre el validador',
          body: 'Trae lo que publicaste y reporta lo que encontró. Cada hallazgo ubica el problema y dice cómo arreglarlo.',
        },
        {
          title: 'Abre una entrada en el registro',
          body: 'Un pull request. La medición ocurre de nuestro lado y queda visible para quien quiera mirarla.',
        },
      ],
    },

    ladder: {
      kicker: 'Conformidad',
      title: 'Una escalera, no una puerta',
      lead: 'Cada nivel es una clase de membresía. Ya estás en la red en L0, y cada peldaño hace que más de ella te sirva — pero quedarse es una posición, no un fracaso.',
      respectNote:
        'Dos clases nunca pasan de L1: las apps cuyos registros son irreduciblemente personales, y las que simplemente eligen no publicar. Ambas están listadas y ambas son miembros respetados.',
    },

    network: {
      kicker: 'La red',
      title: 'Quiénes están en el registro',
      lead: 'El registro lista aplicaciones, anota lo que se midió y no hace nada más. No es un directorio de aliados y no clasifica a nadie.',
      tableHead: {
        publisher: 'Aplicación',
        domains: 'Publica',
        state: 'Estado de la entrada',
      },
      proposedLabel: 'Propuesta',
      proposedExplainer:
        'Estas entradas se abrieron en nombre de cada equipo a partir del análisis público, y esperan a que ese equipo las confirme. Nadie aquí ha reclamado conformidad, y ninguna de estas es un aval.',
      measuredNote:
        'Los estados de conformidad medidos aparecen aquí cuando el validador empiece a correr contra los feeds en vivo de forma programada.',
    },

    horizon: {
      kicker: 'El horizonte largo',
      title: 'Hasta dónde podría llegar',
      ambitionLabel: 'Ambición, no hoja de ruta',
      stages: [
        {
          title: 'Una red de emergencia',
          body: 'Las apps construidas durante una emergencia pueden leerse entre sí, para que la siguiente empiece con infraestructura y no con una hoja de cálculo.',
        },
        {
          title: 'Un estándar de interoperabilidad',
          body: 'El esquema sobrevive a la emergencia que lo produjo y se vuelve la manera normal de publicar datos de ayuda.',
        },
        {
          title: 'Un ecosistema regional',
          body: 'Otra ciudad, otro país, adopta el mismo documento sin pedirle permiso a nadie — porque es CC0 y no hay a quién pedírselo.',
        },
      ],
    },

    finalCta: {
      title: 'La especificación es pública. Todo lo que hay detrás también.',
      body: 'El texto normativo, los esquemas, el validador y las decisiones que los produjeron están en el repositorio, con licencia abierta, hoy.',
      developers: 'Leer la especificación',
      join: 'Contribuir',
      github: 'El repositorio',
    },
  },

  footer: {
    principle: '«Crecemos juntos: no competimos, nos alimentamos.»',
    principleGloss:
      'La fibra con la que se amarra lo que nadie puede cargar solo.',
    license: 'Código Apache-2.0 · spec y registro CC0',
    sourceCode: 'Código fuente',
    foundingRecord: 'Registro fundacional',
    languages: 'Idiomas',
    specStatus: 'Especificación 0.1 — borrador en revisión',
  },

  notFoundPage: {
    metaTitle: 'Página no encontrada — Cabuya',
    title: 'Esta página no existe',
    description:
      'El hilo que seguiste no lleva a ninguna parte: puede que la página se haya movido durante la migración, o que la dirección tenga un error.',
    backHome: 'Volver al inicio',
    otherExitLabel: 'Leer el registro fundacional',
  },

  docs: {
    portal: 'Desarrolladores',
    sidebar: 'Documentación',
    breadcrumb: 'Ruta de navegación',
    pagination: 'Navegación entre páginas',
    previous: 'Anterior',
    next: 'Siguiente',
    onThisPage: 'En esta página',
    openNav: 'Explorar la documentación',
    closeNav: 'Cerrar',
    updated: 'Actualizado',
    copy: 'Copiar',
    copied: 'Copiado',
    copyFailed: 'Selecciona y copia',
    copyAsMarkdown: 'Copiar como Markdown',
    viewMarkdown: 'Ver el Markdown',
    field: 'Campo',
    type: 'Tipo',
    required: 'Obligatorio',
    description: 'Descripción',
    yes: 'Sí',
    no: 'No',
    specifiedNotMeasured: 'Especificado, pero no medido por la versión 0.1.',
  },

  portal: {
    metaTitle: 'Desarrolladores — Cabuya',
    metaDescription:
      'Publica y lee datos de ayuda con un esquema compartido. La especificación, los esquemas y el validador, con una guía rápida de una tarde.',
    eyebrow: 'Desarrolladores',
    title: 'Todo lo que necesitas para publicar, y nada que tengas que pedir',
    lead: 'Cabuya es un documento y un validador. No hay cuenta que crear, ni llave que solicitar, ni con quién negociar — nosotros incluidos.',
    promiseTitle: 'La versión de cinco minutos',
    promiseBody:
      'Pon un archivo JSON con tus lugares en una URL estable, y un manifiesto pequeño en una ruta conocida que diga quién eres. Corre el validador contra ambos y arregla lo que reporte. Eso es conformidad en L2, y para una aplicación pequeña es una tarde.',
    transportsTitle: 'Un esquema, cuatro transportes',
    transportsLead:
      'El mismo registro place se mueve de cuatro maneras. Cuál sirves es una decisión de operación; el registro no cambia, así que un consumidor escrito contra uno funciona contra los otros.',
    pathsTitle: 'Tres maneras de entrar',
    pathsLead:
      'La mayoría de los equipos llegan queriendo una de estas. Son independientes: publicar no obliga a consumir, y ninguna de las dos necesita la skill.',
    paths: [
      {
        title: 'Publicar',
        body: 'Exporta lo que ya tienes en el esquema compartido y deja que cualquiera lo lea.',
        forWhom: 'Tienes una aplicación con lugares, necesidades o capacidades',
      },
      {
        title: 'Consumir',
        body: 'Lee los feeds de otros bajo las reglas de consumo, con la atribución intacta.',
        forWhom: 'Quieres más cobertura de la que te dan tus propios datos',
      },
      {
        title: 'Enseñarle a un agente',
        body: 'Instala la skill y tu agente de código conoce el protocolo, sin conexión, con la especificación incluida.',
        forWhom: 'Prefieres que un agente haga la integración',
      },
    ],
    startTitle: 'Por dónde empezar',
    startBody:
      'La especificación y el validador ya están en el repositorio. La guía rápida, la especificación renderizada y el validador en vivo se están escribiendo ahora — mientras tanto, el repositorio es la fuente completa.',
  },

  quickstart: {
    metaTitle: 'Guía rápida — Cabuya',
    metaDescription:
      'Publica tu primer feed de Cabuya: dos archivos, una corrida del validador y una entrada en el registro. Copiar y pegar toma cinco minutos.',
    title: 'Publica tu primer feed',
    lead: 'Dos archivos y una corrida del validador. Todo lo de abajo está listo para copiar y pegar, y cumple con la especificación que enseña: los bloques de esta página los revisa la suite de pruebas contra el validador real.',

    agentPathTitle: 'Si tienes un agente de código',
    agentPathBody:
      'Instala la skill y pídele que publique un feed de Cabuya. La skill incluye la especificación, así que funciona sin conexión y sin adivinar nombres de campo.',
    handPathTitle: 'Si lo vas a hacer a mano',
    handPathBody:
      'Cinco pasos, abajo. El paso 3 es el que agarra a la gente desprevenida — léelo aunque vengas de afán.',

    fileFirstTitle: 'Guarda esto primero',
    fileFirstBody:
      'Este es un manifiesto completo y conforme. Cambia las dos URL y el identificador de publicador por los tuyos, y ya terminaste el paso 1.',

    steps: [
      {
        title: 'Escribe el manifiesto',
        body: 'Dice quién eres, qué publicas y bajo qué licencia. Doce líneas son un manifiesto de verdad, no un esqueleto.',
      },
      {
        title: 'Ponlo en /.well-known/cabuya.json',
        body: 'La ruta es fija. Los consumidores miran ahí y en ningún otro lado, así que no hay descubrimiento que implementar.',
      },
      {
        title: 'Excluye esa ruta de tu catch-all',
        body: 'No es opcional. Si tu framework sirve index.html en rutas desconocidas, tu manifiesto responde 200 con HTML, y todos los consumidores lo tratan como ausente.',
      },
      {
        title: 'Serializa tus lugares en el sobre',
        body: 'El sobre lleva cinco campos y un arreglo. Mapea lo que ya tienes; publica null para todo lo que nadie haya confirmado de verdad.',
      },
      {
        title:
          'Corre el validador hasta que quede limpio y abre una entrada en el registro',
        body: 'Cada hallazgo nombra el campo y dice cómo arreglarlo. Cuando la corrida sale limpia, un pull request te agrega al registro.',
      },
    ],

    spaTitle: 'El paso 3, según tu stack',
    spaLead:
      'Busca el tuyo, aplica la línea y después pide la URL y comprueba que lo que vuelve es JSON.',
    spaWhy:
      'Cuatro de las veinte aplicaciones del análisis fundacional fallaron aquí, y las cuatro creían haber publicado. El manifiesto se alcanzaba, respondía 200 y contenía su página de inicio.',

    piiTitle: 'Antes de publicar: la única decisión que es tuya',
    piiLead:
      'Cabuya lleva lugares, no personas. Mira los campos que estás por mapear y confirma que ninguno guarda el nombre de una persona, un teléfono o correo personal, un caso individual, o una decisión de moderación sobre alguien.',
    piiKeysLabel: 'Nombres de campo que el validador rechaza de entrada',
    piiPatternsLabel: 'Formas de valor que marca dondequiera que aparezcan',
    piiConfirm:
      'Una persona toma esta decisión una vez, cuando se escribe el mapeo. El validador la verifica en cada corrida posterior, y reporta el campo, nunca el valor que encontró.',

    validatorTitle: 'Córrelo',
    validatorLead:
      'Apunta el validador a la URL de tu manifiesto. Sigue los feeds que declara y reporta lo que encontró.',
    validatorOpen: 'Abrir el validador',
    validatorPending:
      'El modo de pegar corre el mismo motor en tu navegador, sin subir nada. La revisión por URL —que además mide el comportamiento de transporte— necesita un servidor, y esa parte se está construyendo. La línea de comandos hace las dos cosas hoy:',

    honestyTitle: 'Cuánto toma esto de verdad',
    honestyBody:
      'Cinco minutos es el número honesto para el camino de arriba: dos archivos estáticos, copiados, editados y subidos. Es un nivel de conformidad real —L2— y les sirve de verdad a los consumidores.',
    honestyAfternoon:
      'Mapear una base de datos viva al esquema es una tarde, a veces dos: hay que reconciliar tus estados con el vocabulario compartido, y alguien tiene que decidir qué significan tus datos en realidad. Ese trabajo no se puede evitar y preferimos decirlo aquí y no que lo descubras en el paso 4.',
  },

  spec: {
    indexTitle: 'Especificación',
    indexDescription:
      'La especificación del protocolo Cabuya. Versionada, con anclajes de sección estables, renderizada desde los mismos archivos que leen el validador y la skill.',
    indexLead:
      'Cada versión conserva su propia URL para siempre. Esta página las lista; el texto vive un nivel más abajo.',
    versionLabel: 'Versión',
    statusLabels: {
      draft: 'Borrador — en revisión',
      rc: 'Candidata a publicación',
      normative: 'Normativa',
      superseded: 'Reemplazada',
    },
    permanenceTitle: 'Las URL versionadas son permanentes',
    permanenceBody:
      'La URL de una especificación apunta a una versión y sigue apuntando a ella. No hay alias «última», porque un documento normativo que cambia bajo su propia dirección es un documento que nadie puede citar.',
    rcRuleTitle: 'Qué significa una candidata a publicación',
    rcRuleBody:
      'Una candidata está congelada salvo por defectos. Si cambia por cualquier otra razón, se convierte en una candidata nueva y no en una enmendada en silencio.',
    sectionsTitle: 'Secciones',
    sectionsCountLabel: 'secciones',
    normativeLanguageNotice:
      'El texto normativo se publica en inglés. Esta página lo muestra sin cambios; la navegación alrededor está en español. Una traducción, cuando exista, será informativa — el inglés sigue siendo el texto que rige.',
    schemasTitle: 'Esquemas',
    schemasDescription:
      'Los esquemas JSON que el validador aplica. Cada campo con su tipo, restricciones, un valor de ejemplo y los identificadores de verificación que se disparan en él.',
    schemasLead:
      'Generada desde los archivos de esquema, así que esta página no puede describir un campo que el validador no aplique.',
    schemaIdLabel: 'Identificador del esquema',
    fieldsTitle: 'Campos',
    checksColumn: 'Verificaciones',
    profileColumn: 'Perfil',
    exampleColumn: 'Ejemplo',
    coreLabel: 'Núcleo',
    extendedLabel: 'Extendido',
    examplesTitle: 'Ejemplos',
    examplesLead:
      'Dos que cumplen y tres que no. Los que no cumplen declaran, en su propio archivo, qué están demostrando — y las pruebas del validador se comparan contra esas cadenas exactas.',
    validLabel: 'Cumple',
    invalidLabel: 'No cumple',
    teachingNote: 'Qué demuestra este ejemplo',
  },

  validator: {
    metaTitle: 'Validador — Cabuya',
    metaDescription:
      'Revisa un feed o un manifiesto contra la especificación de Cabuya. Pega un documento para validarlo en tu navegador, o apunta el validador a una URL en vivo.',
    title: 'Validador',
    lead: 'El mismo motor que corre la línea de comandos, y los mismos identificadores de verificación. Cada hallazgo nombra el campo, dice la regla y te dice qué cambiar.',
    urlModeTitle: 'Revisar una URL en vivo',
    urlModeLead:
      'Apúntalo a tu manifiesto o a un feed. El validador trae lo que está publicado y reporta lo que encontró, incluido el comportamiento de transporte que un archivo en disco no puede mostrar.',
    urlLabel: 'URL del manifiesto o del feed',
    urlPlaceholder: 'https://ejemplo.org/.well-known/cabuya.json',
    run: 'Correr el validador',
    running: 'Corriendo…',
    pasteModeTitle: 'Revisar un documento que todavía no publicaste',
    pasteModeLead:
      'Pega un feed o un manifiesto. Sirve antes de desplegar nada, y para un documento que preferirías no mandar a ninguna parte.',
    pastePrivacy:
      'Esto corre completamente en tu navegador. El documento no se sube, no se registra y nunca sale de esta página.',
    pasteLabel: 'El documento',
    pastePlaceholder: '{ "last_updated": "…", "ttl": 900, … }',
    kindLabel: '¿Qué es esto?',
    kindFeed: 'Un feed de lugares',
    kindManifest: 'Un manifiesto',
    resultTitle: 'Resultado',
    blockersTitle: 'Bloquea el siguiente nivel',
    errorsTitle: 'Errores',
    warningsTitle: 'Advertencias',
    notesTitle: 'Notas',
    noFindings: 'Nada que reportar.',
    copyReport: 'Copiar el reporte como Markdown',
    copied: 'Copiado',
    fixLabel: 'Arreglo',
    ruleLabel: 'Regla',
    specLabel: 'Especificación',
    checkLabel: 'Sobre esta verificación',
    unavailableTitle: 'La revisión por URL todavía no está desplegada',
    unavailableBody:
      'El servicio que trae una URL se está construyendo. Mientras tanto la línea de comandos hace lo mismo — y el modo de pegar, abajo, corre el motor idéntico en tu navegador.',
    transportTitle: 'No se pudo alcanzar',
    transportBody:
      'Esto no dice nada sobre tus datos. La petición falló — DNS, TLS, un tiempo agotado, o el host negándose — y el validador se detiene en vez de adivinar. Nada de esto significa que tu feed esté mal.',
    parseErrorTitle: 'Eso no es JSON válido',
    parseErrorBody:
      'El documento no se pudo interpretar, así que no corrió ninguna verificación. Arregla la sintaxis e inténtalo otra vez.',
    degradedNote:
      'Válido contra el esquema; conformidad no medida. Correr sin red significa que las verificaciones de transporte no corrieron, así que no se puede medir ningún nivel — eso es distinto de aprobarlas.',
  },

  probe: {
    metaTitle: 'Nuestro sondeo — validador de Cabuya',
    metaDescription:
      'Qué es el agente CabuyaValidator, exactamente qué peticiones hace y con qué frecuencia, qué guarda —nada en absoluto— y cómo impedir que traiga tu sitio.',
    title: 'Nuestro sondeo',
    lead: 'Si encontraste esta página en los registros de tu servidor, alguien le pidió al validador de Cabuya que revisara un feed en tu dominio. Esto es exactamente lo que eso significa.',
    uaTitle: 'El agente de usuario',
    uaBody:
      'Cada petición que hace el validador se identifica y enlaza de vuelta a esta página, para que una línea de registro nunca sea un misterio. Es el único agente que enviamos y no lo variamos.',
    whatTitle: 'Qué pide',
    whatItems: [
      'Un GET a la URL que alguien indicó — normalmente /.well-known/cabuya.json.',
      'Un GET a cada feed que ese manifiesto declara, para revisar los documentos.',
      'A veces un segundo GET a la misma URL unos segundos después. Esa es la verificación de «siempre ahora»: compara dos respuestas para ver si una marca de tiempo sigue al reloj en vez de al contenido.',
      'Nada más. Sin rastreo, sin seguir enlaces más allá de los feeds declarados, sin intentar ninguna otra ruta.',
    ],
    politenessTitle: 'Cómo se comporta',
    politenessItems: [
      'Como máximo 60 peticiones por hora a un mismo host, sumando a todos los que lo pidan.',
      'Un intento por petición. Nunca reintenta ante un fallo.',
      'Un tiempo de espera de ocho segundos, y se rinde.',
      'Deja de leer a los 5 MB en vez de tragarse lo que llegue.',
      'No envía Referer, así que nunca revela quién preguntó.',
      'Sigue como máximo tres redirecciones, y revisa cada destino antes de ir.',
    ],
    retentionTitle: 'Qué guarda',
    retentionBody:
      'Nada. El documento se trae, se revisa y se descarta con la petición. No se guarda ningún cuerpo de feed, nosotros no registramos ninguna URL, y ningún evento de analítica lleva nada que un publicador haya enviado. Lo único que se escribe en alguna parte es un contador anónimo para aplicar los límites de arriba.',
    optOutTitle: 'Cómo detenerlo',
    optOutBody:
      'Prohíbe el agente en tu robots.txt y no te traerá nada. Preferiríamos que primero nos contaras qué salió mal —un validador que se volvió una molestia es un error nuestro— pero la decisión es tuya y no necesita nuestro acuerdo.',
  },

  checks: {
    metaTitle: 'Verificaciones — validador de Cabuya',
    metaDescription:
      'Cada verificación que corre el validador de Cabuya: su identificador, severidad, nivel, la regla que aplica y cómo arreglar un documento que la incumple. Los anclajes son estables.',
    title: 'Verificaciones',
    lead: 'Cada verificación que el validador puede reportar, con un anclaje estable. Los mensajes de error enlazan aquí, así que estas URL no se mueven.',
    stableNote:
      'Un identificador de verificación es permanente. Renombrar uno rompería el bucle de arreglo de todo agente que guardó el anterior, así que las verificaciones retiradas conservan su identificador y se marcan en vez de borrarse.',
    implementedLabel: 'Implementada',
    implementedCountLabel: 'implementadas',
    plannedLabel: 'Catalogada, todavía no implementada',
    severityLabel: 'Severidad',
    levelLabel: 'Nivel',
    familyLabels: {
      discovery: 'Descubrimiento',
      envelope: 'Sobre',
      record: 'Registro',
      pii: 'Datos de persona',
      behavior: 'Comportamiento',
      api: 'API de lectura',
      write: 'API de escritura',
      license: 'Licencias',
    },
    ruleLabel: 'Regla',
    fixLabel: 'Arreglo',
    specLabel: 'Especificación',
    countSummary: 'verificaciones catalogadas',
    untranslatedNote:
      'Las verificaciones catalogadas pero todavía no implementadas se muestran en inglés. Sus reglas se traducen cuando la verificación entra en funcionamiento, para que un lector en español nunca vea la traducción de algo que aún no corre.',
  },

  markdown: {
    siteNavigation: 'Navegación del Sitio',
    languageNote: 'Esta página también está disponible en inglés.',
  },
};
