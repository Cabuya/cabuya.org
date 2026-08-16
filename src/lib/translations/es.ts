/**
 * Spanish translations
 */

import { APP_URL } from '@/lib/constances';

import type { SiteTranslations } from './types';

export const es: SiteTranslations = {
  // Site metadata
  home: {
    eyebrow: 'El ecosistema de impacto social',
    title: 'Tenemos coraje para servir y transformar vidas',
    lead: 'Conectamos a quienes quieren ayudar con quienes más lo necesitan, para que la ayuda sea transparente, medible y constante. Cada entrega deja evidencia.',
    ctaPrimary: 'Quiero ayudar',
    ctaSecondary: 'Cómo funciona',
    heroChips: ['Se publica', 'Se entrega', 'Queda la evidencia'],
    heroAppCardAlt:
      'Pantalla de la aplicación Ayuda Directa en un teléfono, con la emergencia de mayor prioridad',

    problemEyebrow: 'El problema',
    problemTitle: 'La intención existe. La conexión falla.',
    problemBody:
      'Muchas personas quieren donar o vincularse a una causa, pero no encuentran cómo hacerlo de manera confiable, cercana y significativa. No falta generosidad — falta conexión. La ayuda termina repartida en lugares que no se hablan entre sí.',
    problemFragments: [
      'Cadenas de WhatsApp',
      'Formularios sueltos',
      'Hojas de cálculo',
      'Llamadas',
      'Publicaciones que se pierden',
      'Listas que nadie actualiza',
    ],

    howEyebrow: 'Cómo funciona',
    howTitle: 'Un puente entre quien necesita y quien puede',
    howBody:
      'Una necesidad se publica, se ubica y se clasifica. Alguien que puede ayudar la encuentra. Se coordina, se entrega, y queda registro de lo que pasó.',
    howSteps: [
      {
        title: 'Se publica',
        body: 'Una persona o comunidad registra qué necesita, dónde y con qué urgencia. Queda visible para la red, no enterrada en un chat.',
      },
      {
        title: 'Un responsable la toma',
        body: 'Alguien con nombre, identidad validada y vínculo comprobado con la zona asume la entrega.',
      },
      {
        title: 'Alguien aporta',
        body: 'El aporte va por transferencia directa a la cuenta verificada del responsable, sin intermediarios.',
      },
      {
        title: 'Se entrega',
        body: 'El responsable compra, transporta y entrega, y registra qué se entregó, a cuántas personas y cuándo.',
      },
      {
        title: 'Queda la evidencia',
        body: 'Fotos y soportes pasan revisión, y solo entonces se publican. Hasta ese momento el aporte cuenta como recibido, no como utilizado.',
      },
    ],
    howCta: 'Ver el recorrido completo',
    howStepsAria: 'Los cinco pasos del recorrido de una ayuda',

    trustEyebrow: 'Transparencia',
    trustTitle:
      'Decir que somos transparentes es fácil. Publicar la cuenta requiere coraje.',
    trustBody:
      'Por eso cada aporte tiene un responsable con nombre y cada peso tiene un destino que puedes revisar. Publicamos dos números distintos, y los dos son públicos.',
    pillars: [
      {
        title: 'Recibido',
        body: 'Cuánto entró. Es el número fácil de mostrar, y por sí solo no dice nada.',
      },
      {
        title: 'Utilizado con evidencia',
        body: 'Cuánto se gastó con soporte verificado: recibos, fotos, resultados. Este es el número que importa.',
      },
      {
        title: 'Transferencia directa',
        body: 'El dinero va a cuentas de responsables verificados, no a una tesorería central. Cada aporte es atribuible.',
      },
    ],
    trustHonestyLine:
      'Los números reales viven en la aplicación, siempre al día. Cada aporte es atribuible a un responsable y a su evidencia.',
    trustCta: 'Cómo funciona la trazabilidad',

    productEyebrow: 'Producto insignia',
    productTitle: 'Ayuda Directa',
    productBody:
      'Publicar una necesidad, ofrecer ayuda, aportar y seguir tu aporte ocurre en la aplicación. Allí viven el mapa, los frentes de trabajo, los responsables y la evidencia.',
    productCta: 'Únete al movimiento',
    productPhotoAlt:
      'Dos voluntarias entregan un paquete de mercado a un hombre en una vereda',
    productUiCaption:
      'Vistas reales de la aplicación. Lo que se ve son datos vivos de la aplicación en el momento de la captura.',
    productScreenshotDesktopAlt:
      'Pantalla principal de Ayuda Directa en escritorio, con la emergencia prioritaria y el avance global en vivo',
    productScreenshotMobileAlt:
      'Flujo «¿Cómo quieres ayudar?» de Ayuda Directa en un teléfono',

    devEyebrow: 'Interoperabilidad',
    devTitle: 'Muchas interfaces, una sola red de datos',
    devBody:
      'En una emergencia aparecen varias aplicaciones al tiempo, cada una con su propia base de datos de necesidades. El resultado es más fragmentación, no menos. Por eso publicamos una API abierta: para que una aplicación nueva sea un cliente de la misma red, no otro silo.',
    devCta: 'Documentación para desarrolladores',
    devCodeTitle: 'POST /api/public/v1/help',
    devCategoriesLabel: 'Categorías reales de la API',

    closingTitle: '¿Te sumas?',
    closingBody:
      'Si quieres ayudar, aportar o publicar una necesidad, eso ocurre en la aplicación. Si construyes software, quieres ser aliado o quieres colaborar con el equipo, empieza por aquí.',
    closingCtaApp: 'Ir a la aplicación',
    closingCtaTeam: 'Quiero colaborar',
    closingChannelsTitle: 'Canales oficiales',
    closingChannelApp: 'Ayuda Directa',
  },
  siteTitle: 'Corag',
  siteTitleFull: 'Corag — El ecosistema de impacto social',
  siteDescription:
    'Conectamos a quienes quieren ayudar con quienes más lo necesitan, para que la ayuda sea transparente, medible y constante. Cada entrega deja evidencia.',

  // Navigation
  nav: {
    app: 'Ayudar o pedir ayuda',
    home: 'Inicio',
    howCoragWorks: 'Cómo funciona',
    howItWorks: 'Cómo funciona',
    transparency: 'Transparencia',
    emergencies: 'Emergencias',
    leaders: 'Líderes',
    partners: 'Aliados',
    ecosystem: 'Ecosistema',
    developers: 'Desarrolladores',
    blog: 'Blog',
    about: 'Sobre Corag',
    contact: 'Contacto',
    community: 'Comunidad',
    movement: 'Servir requiere coraje',
    channels: 'Canales',
    contributing: 'Cómo contribuir',
    governance: 'Gobernanza',
    conduct: 'Código de Conducta',
    privacy: 'Privacidad',
    menu: 'Menú',
    closeMenu: 'Cerrar menú',
    openMenu: 'Abrir menú',
  },

  appCta: {
    short: 'Ayuda',
    shortAria: 'Ir a la aplicación: ofrecer ayuda o pedir la que necesitas',
    floating: {
      lead: 'Cada entrega deja evidencia pública',
      action: 'Ayudar o pedir ayuda',
      dismiss: 'Ocultar esta invitación',
    },
    invite: {
      eyebrow: 'La aplicación',
      title: '¿Necesitas ayuda o quieres darla?',
      body: 'Publicar una necesidad, ofrecer ayuda, aportar y seguir a dónde llegó cada entrega ocurre en la aplicación. Aquí se explica el modelo; allí se actúa.',
      primary: 'Quiero ayudar',
      secondary: 'Necesito ayuda',
      tertiary: 'Ver la evidencia publicada',
    },
  },

  // Footer
  footer: {
    copyright: 'Corag',
    allRightsReserved: 'Todos los derechos reservados.',
    tagline: 'El ecosistema de impacto social.',
    appNote:
      'Publicar una necesidad, ofrecer ayuda, aportar y seguir tu aporte ocurre en la aplicación.',
  },

  // Homepage sections
  homeSections: {
    latestArticles: 'Del blog',
    viewAllPosts: 'Ver todos los artículos',
  },

  // Contact section (homepage)
  contact: {
    title: 'Contacto',
    nameLabel: 'Nombre',
    namePlaceholder: 'Tu nombre',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'tu@correo.com',
    messageLabel: 'Mensaje',
    messagePlaceholder: 'Escribe tu mensaje...',
    sendButton: 'Enviar mensaje',
  },

  // About page

  aboutPage: {
    title: 'Sobre Corag',
    subtitle: 'El ecosistema de impacto social',
    description:
      'Qué es Corag, de dónde viene el nombre, cómo funciona el modelo de responsables y evidencia, y por qué publicamos el recibo y no solo la intención.',
    heroDescription:
      'Nacimos de un grupo de jóvenes apasionados por el servicio social. De ahí salió el propósito de crear un puente digital entre quienes quieren ayudar y quienes más lo necesitan.',
    bioTitle: 'Tenemos coraje para servir y transformar vidas',
    bioIllustrationAlt:
      'Ilustración: un grupo de personas a un lado de un vacío y una casa con una familia al otro, unidos por un puente en arco cuya clave es un corazón; la mitad lejana del puente todavía se está formando',
    bioText:
      'El nombre viene de <strong>coraje</strong>. El corazón que reemplaza la <em>o</em> lleva el <strong>amor</strong>. Nuestro logo transmite coraje, innovación y amor.<br /><br />Coraje no es bravuconería. Es aparecer cuando es incómodo, poner tu nombre en una entrega y publicar la cuenta después. Esa última parte es la que conecta la idea con el producto: los responsables, la transferencia directa y la evidencia moderada son el coraje vuelto mecanismo. Decir que somos transparentes es fácil; publicar el recibo requiere coraje.<br /><br />Corag surge al reconocer una realidad simple: muchas personas quieren donar o vincularse a una causa, pero no encuentran cómo hacerlo de manera confiable, cercana y significativa. No falta generosidad — falta conexión.',
    passionsTitle: 'Nuestros valores',
    passions: [
      {
        title: 'Colaboración',
        description:
          'Unimos gobiernos, organizaciones, empresas y personas en una sola red, en lugar de multiplicar sistemas aislados.',
        icon: 'users',
        link: '/how-it-works',
      },
      {
        title: 'Empatía',
        description:
          'Quien recibe ayuda es un vecino, no el telón de fondo de la virtud de alguien más.',
        icon: 'heart',
        link: '/how-it-works',
      },
      {
        title: 'Confianza',
        description:
          'Cada aporte tiene un responsable con nombre y un destino que puedes revisar.',
        icon: 'shield',
        link: '/transparency',
      },
      {
        title: 'Amor',
        description:
          'Está en el corazón del logo y en la razón por la que existe esto.',
        icon: 'heart',
        link: '/about',
      },
      {
        title: 'Innovación social',
        description:
          'Una API pública, una especificación OpenAPI y un servidor MCP para que otros construyan sobre la misma red.',
        icon: 'sparkles',
        link: '/developers',
      },
      {
        title: 'Transparencia',
        description:
          'Publicamos cuánto se recibió y cuánto se usó con evidencia. Son dos números distintos y los dos son públicos.',
        icon: 'eye',
        link: '/transparency',
      },
    ],
    quickFactsTitle: 'En resumen',
    quickFacts: [
      'Corag es el ecosistema; Ayuda Directa es el producto insignia',
      'La coordinación, los aportes y la evidencia ocurren en la aplicación',
      'El dinero va por transferencia directa a responsables verificados',
      'La evidencia se modera antes de publicarse',
      'API pública, OpenAPI 3.1 y servidor MCP abiertos a quien quiera integrarse',
    ],
    ctaTitle: '¿Quieres ser parte?',
    ctaDescription:
      'Publicar una necesidad, ofrecer ayuda o aportar ocurre en la aplicación. Si representas una organización, escríbenos.',
    ctaApp: 'Ir a la aplicación',
    ctaContact: 'Escríbenos',
  },

  // Slides / deck pages
  slides: {
    exitToCatalog: 'Volver a Slides',
    printPdf: 'Imprimir como PDF',
    languageSwitch: 'View in English',
    external: {
      openCta: 'Abrir en {provider}',
      backToCatalog: 'Volver al catálogo',
    },
    languageNotice: 'El deck original está en {lang}',
    typeBadge: {
      native: 'Nativo',
      external: 'Externo',
    },
    toolbar: {
      backToCatalog: 'Volver al catálogo',
      switchLang: 'Cambiar a {lang}',
      themeToLight: 'Cambiar a modo claro',
      themeToDark: 'Cambiar a modo oscuro',
      enterFullscreen: 'Entrar en pantalla completa',
      exitFullscreen: 'Salir de pantalla completa',
    },
  },

  // Contact page
  contactPage: {
    title: 'Contacto',
    subtitle: 'Hablemos',
    description:
      'Escríbenos si representas una organización, quieres ser aliado, eres prensa o necesitas reportar algo. Pedir y ofrecer ayuda ocurre en la aplicación.',
    heroDescription:
      'Este canal es para conversaciones institucionales. Si necesitas ayuda o quieres aportar, eso ocurre en la aplicación.',
    appNoticeTitle: '¿Necesitas ayuda o quieres aportar?',
    appNoticeBody:
      'Publicar una necesidad, ofrecer ayuda, aportar y seguir tu aporte ocurre en Ayuda Directa. Este formulario no llega a nadie que pueda atender una emergencia.',
    appNoticeCta: 'Ir a la aplicación',
    formTitle: 'Escríbenos',
    nameLabel: 'Nombre',
    namePlaceholder: 'Tu nombre',
    emailLabel: 'Correo',
    emailPlaceholder: 'tu@correo.com',
    reasonLabel: 'Tema',
    reasonOptions: [
      { value: '', label: '— Selecciona un tema —' },
      { value: 'general', label: 'Contacto general' },
      {
        value: 'organization',
        label: 'Soy una organización y quiero ayudar',
      },
      { value: 'ally', label: 'Alianza institucional' },
      { value: 'press', label: 'Prensa' },
      { value: 'report', label: 'Reportar un problema con la información' },
    ],
    subjectLabel: 'Asunto',
    subjectPlaceholder: '¿De qué se trata?',
    messageLabel: 'Mensaje',
    messagePlaceholder: 'Cuéntanos con el detalle que puedas.',
    sendButton: 'Enviar',
    sendingButton: 'Enviando…',
    successTitle: 'Mensaje enviado',
    successMessage: 'Gracias por escribirnos.',
    successNextSteps: {
      general: 'Te respondemos en pocos días hábiles.',
      organization:
        'Te contactamos para entender qué puede aportar tu organización y cómo coordinarlo.',
      ally: 'Te escribimos para hablar de la alianza y los siguientes pasos.',
      press: 'El equipo responde lo antes posible.',
      report:
        'Revisamos lo que nos reportas. Si es urgente y afecta a alguien, escríbelo también en la aplicación.',
    },
    sendAnotherButton: 'Enviar otro mensaje',
    requiredField: 'Este campo es obligatorio',
    invalidEmail: 'Escribe un correo válido',
    submitError: 'No pudimos enviar el mensaje. Inténtalo de nuevo.',
    fallbackMessage:
      'Si el formulario no funciona, escríbenos por los canales públicos.',
    formNote:
      'Solo usamos estos datos para responderte. No los publicamos ni los compartimos.',
    quickLinksTitle: 'Quizá buscabas',
    quickLinks: [
      {
        label: 'Cómo funciona',
        href: '/how-it-works',
        description: 'El recorrido completo, de la necesidad a la evidencia.',
      },
      {
        label: 'Transparencia',
        href: '/transparency',
        description: 'Cuánto se recibió y cuánto se usó con evidencia.',
      },
      {
        label: 'Desarrolladores',
        href: '/developers',
        description: 'API pública, OpenAPI y MCP para integrarte.',
      },
    ],
  },

  movementPage: {
    title: 'Servir requiere coraje',
    description:
      'Corag es un movimiento social que moviliza personas y ayuda. El nombre viene de coraje: el que todos tenemos cuando amamos, cuidamos y servimos.',
    eyebrow: 'Movimiento social',
    illustrationAlt:
      'Ilustración: alrededor de ciento cincuenta siluetas de personas, sin rostro y todas del mismo tamaño, que al agruparse forman la silueta de un corazón; algunas se dan la mano, otras cargan cajas, y las del borde exterior, más claras, todavía se están sumando',
    lead: 'Corag viene de <strong>coraje</strong>. No el de las hazañas: el que todos tenemos cuando amamos, cuando queremos cuidar, cuando decidimos servir. Ese es el movimiento, y no se sostiene en nombres propios. Se sostiene en que alguien aparezca.',
    beats: [
      {
        title: 'Movilizamos personas, no audiencias',
        body: 'Un movimiento no se mide en seguidores. Se mide en cuánta ayuda llegó y en cuántas manos la movieron.',
      },
      {
        title: 'No hace falta permiso',
        body: 'Nadie tiene que ser designado para servir. Se entra ayudando: una entrega, una hora, una herramienta, una necesidad publicada.',
      },
      {
        title: 'El coraje se demuestra después',
        body: 'Lo difícil no es prometer. Es publicar la cuenta cuando ya pasó. Cada entrega deja evidencia, y por eso el movimiento se puede revisar en vez de solo creer.',
      },
    ],
    closingTitle: '¿Quién hace Corag?',
    closingBody:
      'Quien aparece. Quienes coordinan una entrega, quienes escriben código, quienes prestan una bodega o un camión, quienes revisan una evidencia a las once de la noche. Y mañana, quien decida sumarse. Corag no es un grupo al que se entra: es lo que ocurre cada vez que alguien decide que sí.',
    channelsLabel: 'Dónde nos encontramos',
  },

  conductForm: {
    formEyebrow: 'Reporte confidencial',
    formSectionTitle: 'Reportar una preocupación del Código de Conducta',
    privacyNote:
      'Los reportes llegan solo a organizadores. No se listan en público ni se publican en canales de Slack de la comunidad. Puedes enviar de forma anónima.',
    incidentLabel: '¿Qué ocurrió?',
    incidentPlaceholder:
      'Describe el incidente con el contexto que te sientas cómoda o cómodo compartiendo…',
    whenLabel: '¿Cuándo ocurrió? (opcional)',
    whenPlaceholder: 'Fecha, hora o nombre del evento…',
    peopleLabel: 'Personas involucradas (opcional)',
    peoplePlaceholder: 'Nombres o roles, si los conoces…',
    anonymousLabel: 'Enviar de forma anónima',
    anonymousHint:
      'Si eliges anonimato, no guardaremos nombre ni correo de quien reporta con este envío.',
    nameLabel: 'Tu nombre (opcional si es anónimo)',
    emailLabel: 'Tu correo (obligatorio salvo anonimato)',
    followupLabel: 'Seguimiento preferido (opcional)',
    followupPlaceholder: 'Correo, llamada o “no necesito seguimiento”…',
    submitButton: 'Enviar reporte confidencial',
    successTitle: 'Reporte recibido',
    successMessage:
      'Gracias. Los organizadores lo revisarán de forma confidencial y actuarán con prontitud y justicia.',
  },

  contactSection: {
    title: '¿Representas una organización?',
    description:
      'Fundaciones, empresas, alcaldías y organizaciones comunitarias pueden sumarse a la red. Escríbenos y coordinamos.',
    ctaText: 'Escríbenos',
    ctaLink: '/contact',
  },

  // Search input
  searchPlaceholder: 'Buscar artículos...',
  searchHint: 'Tip: presiona Esc para limpiar la búsqueda.',
  clearSearch: 'Limpiar',
  resultsFound: (count) =>
    `${count} resultado${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`,

  // Loading states
  loadingIndex: 'Cargando índice de búsqueda...',
  searching: 'Buscando artículos...',

  // Results
  noResults: (query) =>
    `No se encontraron artículos que coincidan con "${query}"`,
  noResultsSuggestion:
    'Prueba con una palabra clave más amplia o explora todos los artículos.',
  noPostsAvailable: 'Aún no hay artículos disponibles.',

  // Pagination
  previous: 'Anterior',
  next: 'Siguiente',
  pageOf: (current, total) => `Página ${current} de ${total}`,

  // Blog header
  blogTitle: 'Blog',
  blogHeading: 'Artículos e historias',
  blogDescription:
    'Artículos sobre coordinación humanitaria, transparencia, tecnología cívica y cómo se construye una red de ayuda que se puede verificar.',
  allPosts: 'Todos los artículos',
  showingArticles: (showing, total) =>
    `Mostrando ${showing} de ${total} artículos`,
  articlesAvailable: (total) =>
    `${total} artículo${total !== 1 ? 's' : ''} disponible${total !== 1 ? 's' : ''}`,
  lastUpdatedOn: 'Actualizado',
  readingTime: (minutes) => `${minutes} min de lectura`,
  relatedArticles: 'Artículos relacionados',
  relatedArticlesDescription: 'Estos artículos también podrían interesarte',

  // Series navigation
  seriesPartOf: 'Parte de la serie',
  seriesChapter: (n) => `Capítulo ${n}`,
  seriesPrevious: 'Capítulo anterior',
  seriesNext: 'Siguiente capítulo',
  seriesToC: 'Todos los capítulos',
  seriesChapterOf: (current, total) => `Capítulo ${current} de ${total}`,

  // Series pages
  seriesPage: {
    title: 'Series',
    breadcrumb: 'Series',
    chapters: 'capítulos',
    chapter: 'Capítulo',
    progress: (current, total) => `${current} de ${total} capítulos`,
    readChapter: 'Leer capítulo',
    emptyState: 'Aún no hay artículos en esta serie.',
    backToSeries: 'Todas las series',
    backToBlog: 'Volver al blog',
    startReading: 'Comenzar a leer',
    continueReading: 'Continuar leyendo',
  },
  seriesListingPage: {
    title: 'Series del blog',
    description:
      'Colecciones de artículos en varios capítulos: recorridos largos sobre el modelo de ayuda, el trabajo en terreno y la tecnología que hay detrás de Corag.',
    heading: 'Series',
    postsCount: (count) => `${count} ${count === 1 ? 'capítulo' : 'capítulos'}`,
    exploreSeries: 'Explorar series',
    emptyState: 'Aún no hay series publicadas.',
  },

  // Scheduled posts (dev-only indicators)
  scheduledBadge: 'Programado',
  scheduledBannerTitle: 'Artículo programado',
  scheduledBannerMessage: (date) =>
    `Este artículo se publicará el ${date}. Solo es visible en modo de desarrollo.`,

  // Draft posts (dev + preview indicators)
  draftBadge: 'Borrador',
  draftBannerTitle: 'Artículo en borrador',
  draftBannerMessage:
    'Este artículo está en construcción. Es visible aquí porque estás en el servidor de desarrollo o en una rama de previsualización; no se publicará hasta que se elimine la marca de borrador.',

  // Tags
  postsTagged: (tag) => `Artículos etiquetados con "${tag}"`,
  allTags: 'Todas las etiquetas',
  tagNames: {
    // Primary tags
    volunteering: 'Voluntariado',
    donations: 'Donaciones',
    foundations: 'Fundaciones y ONG',
    'social-impact': 'Impacto social',
    community: 'Comunidad',
    // Secondary tags
    colombia: 'Colombia',
    'getting-started': 'Para empezar',
    verification: 'Verificación',
    organizations: 'Organizaciones',
    measurement: 'Medición',
    // Subtopic tags
    technology: 'Tecnología',
    pereira: 'Pereira',
    youth: 'Niñez y juventud',
  },
  tagDescriptions: {
    // Primary tags
    volunteering:
      'Donar tiempo: cómo empezar sin experiencia previa, dónde buscar cerca de ti y qué esperar realmente durante las primeras semanas en terreno.',
    donations:
      'Donar dinero o en especie sin que se pierda por el camino: qué sirve de verdad, cómo verificar antes de transferir y cómo pedir el recibo.',
    foundations:
      'Cómo funcionan por dentro las fundaciones y las ONG, en qué se diferencian y cómo comprobar que una es real antes de apoyarla con algo.',
    'social-impact':
      'Qué es el impacto social, cómo se genera y cómo se mide sin engañarse: la diferencia incómoda entre hacer actividad y transformar algo.',
    community:
      'Parches, jornadas y proyectos donde la gente se organiza para ayudar, y cómo entrar en uno que siga existiendo dentro de dos años.',
    // Secondary tags
    colombia:
      'Contexto colombiano: marco legal, organizaciones activas y las realidades locales que definen cómo se coordina la ayuda en el territorio.',
    'getting-started':
      'Guías para quien quiere ayudar y todavía no sabe por dónde empezar. Sin requisitos previos, sin experiencia y sin necesidad de dinero.',
    verification:
      'Cómo comprobar que una organización, una cuenta o una entrega es real, antes de comprometer tu tiempo, tus cosas o tu dinero con ella.',
    organizations:
      'Empresas, entidades públicas y ONG que se suman al trabajo social, y qué modelos de aporte funcionan de verdad más allá de la donación.',
    measurement:
      'Indicadores, líneas base y evidencia: cómo se demuestra que algo cambió de verdad, en lugar de suponerlo a partir de buenas anécdotas.',
    // Subtopic tags
    technology:
      'Plataformas, datos e interoperabilidad aplicados a la ayuda humanitaria, con los tres riesgos de la digitalización que casi nadie menciona.',
    pereira:
      'Organizaciones, eventos y oportunidades para ayudar en Pereira y en el Eje Cafetero, donde Corag tiene operación activa en terreno.',
    youth:
      'Programas dirigidos a la niñez en situación vulnerable y a jóvenes que quieren empezar a aportar sin esperar a tener una carrera terminada.',
  },

  // Series names and descriptions (keyed by series slug). Vacío durante la transición a v3.0.0.
  seriesNames: {},
  seriesDescriptions: {},

  // Date formatting
  dateLocale: 'es-ES',

  // Read more
  readMore: 'Leer más',

  // Scroll to timeline
  scrollToTimeline: 'Ver línea de tiempo',
  viewLabel: (label: string) => `Ver ${label}`,

  // 404 page
  notFoundPage: {
    title: 'Página no encontrada',
    description: 'La página que buscas no existe o cambió de dirección.',
    heading: 'Esta página no existe',
    message:
      'Puede que el enlace esté roto o que la página haya cambiado de lugar. Desde aquí puedes volver al inicio, buscar en el blog, o ir directo a la aplicación.',
    eyebrow: 'Error 404',
    backHome: 'Volver al inicio',
    searchBlog: 'Buscar en el blog',
    appCta: 'Ir a la aplicación',
  },

  // Blog post engagement
  engagement: {
    // Share buttons
    shareTitle: 'Compartir este artículo',
    shareSeriesTitle: 'Compartir esta serie',
    shareOnTwitter: 'Compartir en X',
    shareOnLinkedIn: 'Compartir en LinkedIn',
    shareOnWhatsApp: 'Compartir en WhatsApp',
    copyLink: 'Copiar enlace',
    linkCopied: '¡Enlace copiado!',

    // Newsletter
    newsletterTitle: 'Mantente al tanto',
    newsletterDescription:
      'Te avisaremos cuando la comunidad publique nuevos artículos, recapitulaciones o anuncios de eventos. Sin spam, puedes cancelar tu suscripción cuando quieras.',
    newsletterPlaceholder: 'tu@correo.com',
    newsletterButton: 'Suscribirme',
    newsletterSubmitting: 'Suscribiendo...',
    newsletterSuccessTitle: '¡Estás suscrito!',
    newsletterSuccessMessage:
      'Gracias por suscribirte. Sabrás de nosotros cuando publiquemos algo nuevo.',
    newsletterInvalidEmail: 'Por favor ingresa un correo electrónico válido.',
    newsletterAlreadySubscribed: 'Ya estás suscrito. ¡Gracias por estar aquí!',
    newsletterResubscribe: 'Suscribirme con otro correo',
    newsletterPrivacy: 'Sin spam. Puedes darte de baja en cualquier momento.',

    // End-of-post CTA
    ctaTitle: '¿Te gustó este artículo?',
    ctaDescription:
      'Compártelo con tu red o suscríbete para recibir los últimos artículos de la comunidad en tu correo.',
  },

  // Blog engagement (author + share)
  blogEngagement: {
    aboutAuthor: 'Sobre el autor',
    writtenBy: 'Escrito por',
  },

  // Institutional pages
  howItWorksPage: {
    title: 'Cómo funciona',
    description:
      'El recorrido completo de una ayuda en Corag: quién publica la necesidad, quién responde, cómo se mueve el dinero y cómo se comprueba lo que se entregó.',
    eyebrow: 'El modelo',
    lead: 'Corag no guarda el dinero de nadie. Conecta a quien necesita con quien puede, pone un nombre responsable en el medio y publica la cuenta después. Esto es el recorrido, paso por paso.',
    heroFigure: {
      srcBase: '/images/home/app/app-home-desktop',
      widths: [640, 960, 1280, 1920],
      alt: 'Pantalla principal de Ayuda Directa en escritorio, con la emergencia prioritaria y el avance global',
      width: 1280,
      height: 800,
      frame: 'browser',
      caption:
        'Vista real de la aplicación. Los datos que se ven son datos vivos de la aplicación en el momento de la captura.',
    },
    sections: [
      {
        heading: 'El recorrido de una ayuda',
        intro:
          'Cinco pasos. Ninguno ocurre en este sitio: todos ocurren en la aplicación.',
        blocks: [
          {
            kind: 'steps',
            steps: [
              {
                title: 'Alguien publica una necesidad',
                body: 'Una familia, un líder comunitario o una organización registra qué hace falta y dónde. La solicitud queda visible para la red, no enterrada en un chat.',
                figure: {
                  srcBase: '/images/pages/app/app-solicitar-mobile',
                  widths: [390, 780],
                  alt: 'Formulario «Solicitar ayuda» de Ayuda Directa en un teléfono, con los campos vacíos',
                  width: 390,
                  height: 844,
                  frame: 'phone',
                },
              },
              {
                title: 'Un responsable la toma',
                body: 'Quien coordina en ese territorio asume la entrega. Tiene nombre, identidad validada y vínculo comprobado con la zona o la organización.',
                figure: {
                  srcBase: '/images/pages/app/app-registro-lider-desktop',
                  widths: [640, 1280],
                  alt: 'Pantalla de postulación para líder en Ayuda Directa, con el formulario vacío',
                  width: 1280,
                  height: 800,
                  frame: 'browser',
                },
              },
              {
                title: 'Alguien aporta',
                body: 'El aporte va por transferencia directa a la cuenta verificada del responsable. Corag no es intermediario del dinero ni cobra comisión por moverlo.',
                figure: {
                  srcBase: '/images/home/app/app-aportar-mobile',
                  widths: [390, 780],
                  alt: 'Flujo «¿Cómo quieres ayudar?» de Ayuda Directa en un teléfono, con las opciones de aporte',
                  width: 390,
                  height: 844,
                  frame: 'phone',
                },
              },
              {
                title: 'Se ejecuta la entrega',
                body: 'El responsable compra, transporta y entrega. Registra qué se entregó, a cuántas personas y cuándo.',
              },
              {
                title: 'Se publica la evidencia',
                body: 'Fotos, soportes y cifras se cargan dentro del plazo, pasan revisión administrativa y solo entonces se publican. Hasta ese momento el aporte cuenta como recibido, no como utilizado.',
                figure: {
                  srcBase: '/images/pages/app/app-seguimiento-mobile',
                  widths: [390, 780],
                  alt: 'Pantalla privada de seguimiento de un aporte en Ayuda Directa, con la búsqueda vacía',
                  width: 390,
                  height: 844,
                  frame: 'phone',
                },
              },
            ],
          },
        ],
      },
      {
        heading: 'Por qué el dinero no pasa por nosotros',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'Una plataforma que recauda y luego reparte se convierte en el cuello de botella y en el punto de fallo. Si se cae, se congela o se equivoca, la ayuda se detiene con ella.',
              'La transferencia directa elimina ese riesgo, pero traslada la confianza a otro lugar: al responsable. Por eso el sistema de validación de responsables es la dependencia crítica de todo lo demás, y por eso la evidencia no es opcional.',
            ],
          },
        ],
      },
      {
        heading: 'Los tres roles',
        blocks: [
          {
            kind: 'cards',
            cards: [
              {
                title: 'Persona',
                body: 'Publica una necesidad, ofrece ayuda o aporta. No necesita permiso de nadie para empezar.',
              },
              {
                title: 'Responsable',
                body: 'Coordina y ejecuta. Recibe aportes a su nombre y responde por ellos con evidencia dentro del plazo.',
              },
              {
                title: 'Administración',
                body: 'Valida identidades, modera la evidencia antes de publicarla y revisa los reportes sobre uso de recursos.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Qué pasa cuando algo sale mal',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'No presentar evidencia es la falta más grave, porque rompe exactamente aquello que hace verificable a Corag. La respuesta es escalonada: recordatorio, suspensión de la capacidad de recibir aportes y, si persiste, retiro del rol.',
            ],
          },
          {
            kind: 'callout',
            tone: 'info',
            title: '¿Viste algo que no cuadra?',
            body: 'Un aporte sin evidencia, una entrega que no ocurrió, una cuenta sospechosa: repórtalo. Un reporte sobre recursos siempre se revisa, incluso si llega de forma anónima.',
          },
        ],
      },
    ],
    cta: {
      title: 'Todo esto ocurre en la aplicación',
      body: 'Publicar una necesidad, ofrecer ayuda, aportar y revisar la evidencia son acciones de Ayuda Directa. Este sitio solo lo explica.',
      primary: {
        label: 'Ir a la aplicación',
        href: APP_URL,
        external: true,
      },
      secondary: { label: 'Ver la transparencia', href: '/transparency' },
    },
  },

  transparencyPage: {
    title: 'Transparencia',
    description:
      'Qué publicamos, qué significa cada número, cómo se revisa la evidencia antes de salir y qué cosas todavía no podemos comprobar. Sin adornos.',
    eyebrow: 'Las cuentas',
    lead: 'Decir que somos transparentes es fácil. Publicar el recibo requiere coraje. Esto es lo que publicamos, qué significa exactamente y dónde están los límites.',
    heroFigure: {
      srcBase: '/images/pages/app/app-avances-desktop',
      widths: [640, 960, 1240],
      alt: 'Banda de avance de Ayuda Directa: el total recibido junto al total donado con evidencia',
      width: 1240,
      height: 345,
      frame: 'browser',
      caption:
        'Vista real de la aplicación. Los dos números que se ven son datos vivos: cambian con cada aporte y con cada evidencia aprobada.',
    },
    sections: [
      {
        heading: 'Los dos números',
        intro:
          'No son el mismo número y la diferencia entre ellos es el punto entero.',
        blocks: [
          {
            kind: 'statPair',
            relation: '≠',
            items: [
              {
                label: 'Recibido',
                body: 'Lo que la red aportó. Se registra en el momento de la transferencia y no depende de nadie más.',
              },
              {
                label: 'Utilizado con evidencia',
                body: 'Lo que ya se entregó, se documentó y pasó revisión administrativa. Es el número que vale la pena mirar.',
              },
            ],
          },
          {
            kind: 'prose',
            paragraphs: [
              'La distancia entre los dos es el trabajo pendiente. Una plataforma que solo publica cuánto recaudó está contando la parte fácil.',
            ],
          },
        ],
      },
      {
        heading: 'Cómo se revisa la evidencia',
        blocks: [
          {
            kind: 'steps',
            steps: [
              {
                title: 'Se carga',
                body: 'El responsable sube fotos, soportes de compra y las cifras de la entrega, dentro del plazo definido.',
              },
              {
                title: 'Se revisa',
                body: 'La administración contrasta lo cargado contra lo prometido. Una carga incompleta se devuelve, no se publica.',
              },
              {
                title: 'Se publica',
                body: 'Solo después de aprobarse, el valor pasa a contarse como utilizado con evidencia y queda visible para quien aportó y para cualquiera.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Qué protegemos aunque cueste claridad',
        blocks: [
          {
            kind: 'list',
            items: [
              'No publicamos la ubicación exacta de una persona en situación vulnerable más allá de lo que la coordinación necesita.',
              'No publicamos datos de contacto sin autorización explícita de quien los entregó.',
              'Quien aporta puede aparecer como “Persona solidaria” en lugar de con su nombre, sin dar explicaciones.',
              'La evidencia con menores solo se publica con permiso y sin rasgos identificables.',
            ],
          },
          {
            kind: 'prose',
            paragraphs: [
              'Estas reglas reducen el detalle público. Es una decisión deliberada: la dignidad de quien recibe ayuda no se negocia por una foto más convincente.',
            ],
          },
        ],
      },
      {
        heading: 'Lo que todavía no está resuelto',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'Decirlo es parte de la transparencia. Los plazos formales de evidencia, el proceso de apelación cuando se retira un rol y los límites máximos de recursos que un responsable puede administrar sin revisión adicional se están definiendo. Cuando se cierren, se publican en Gobernanza.',
            ],
          },
        ],
      },
    ],
    cta: {
      title: 'Revisa las cifras tú mismo',
      body: 'Los números y la evidencia aprobada están en la aplicación, por emergencia y por entrega.',
      primary: {
        label: 'Ver la aplicación',
        href: APP_URL,
        external: true,
      },
      secondary: { label: 'Cómo se gobierna', href: '/governance' },
    },
  },

  emergenciesPage: {
    title: 'Emergencias',
    description:
      'Qué hace Corag cuando ocurre una emergencia, cómo se abre un frente, cómo pedir ayuda y qué no somos: esto no es un servicio de urgencias.',
    eyebrow: 'Respuesta',
    lead: 'En una emergencia el problema rara vez es la falta de generosidad. Es que nadie sabe qué hace falta, dónde, ni quién ya lo está cubriendo.',
    heroFigure: {
      srcBase: '/images/home/app/app-map-desktop',
      widths: [640, 1280],
      alt: 'Mapa de Ayuda Directa con los grupos de solicitudes y ofrecimientos sobre el Eje Cafetero',
      width: 1280,
      height: 1050,
      frame: 'browser',
      caption:
        'Vista real del mapa de la aplicación. Los grupos que se ven son datos vivos en el momento de la captura.',
    },
    sections: [
      {
        heading: 'Antes que nada',
        blocks: [
          {
            kind: 'callout',
            tone: 'warning',
            title: 'Corag no es un servicio de emergencia',
            body: 'Si hay riesgo inmediato para la vida o la integridad de alguien, llama primero a las líneas de emergencia de tu país. Corag coordina ayuda material; no reemplaza a bomberos, ambulancias ni policía.',
          },
        ],
      },
      {
        heading: 'Qué es un frente',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'Cuando ocurre una emergencia se abre un frente: un espacio con su propio mapa de necesidades, sus responsables y sus cifras. Todo lo que pasa en esa emergencia queda dentro del frente, en lugar de dispersarse entre grupos de chat que nadie puede auditar después.',
              'Dentro del frente conviven tres cosas: lo que se necesita, lo que se ofrece y lo que ya se entregó con evidencia. Esa tercera columna es la que evita que veinte personas lleven agua al mismo barrio mientras otro se queda sin nada.',
            ],
          },
        ],
      },
      {
        heading: 'Cómo participar',
        blocks: [
          {
            kind: 'steps',
            steps: [
              {
                title: 'Si necesitas ayuda',
                body: 'Publica la necesidad en el frente correspondiente. Sé concreto: qué, cuánto, dónde y para cuántas personas. Una necesidad vaga tarda más en ser atendida.',
              },
              {
                title: 'Si puedes ayudar',
                body: 'Revisa las necesidades abiertas antes de decidir qué llevar. Ofrecer lo que ya sobra retrasa lo que falta.',
              },
              {
                title: 'Si puedes coordinar',
                body: 'Postúlate como responsable. Requiere validación de identidad y de vínculo con el territorio, y compromete a rendir cuentas con evidencia.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Cuando el frente se cierra',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'Un frente no desaparece cuando pasa la urgencia. Queda como expediente: qué se necesitó, quién respondió, cuánto se movió y qué evidencia lo respalda. Esa memoria es lo que hace que la siguiente emergencia empiece con algo más que buena voluntad.',
            ],
          },
        ],
      },
    ],
    cta: {
      title: 'Los frentes activos están en la aplicación',
      body: 'Ahí puedes ver qué se necesita ahora mismo, qué ya está cubierto y qué evidencia hay de lo entregado.',
      primary: {
        label: 'Ver frentes activos',
        href: APP_URL,
        external: true,
      },
      secondary: { label: 'Cómo funciona', href: '/how-it-works' },
    },
  },

  leadersPage: {
    title: 'Líderes',
    description:
      'Qué asume quien coordina ayuda en Corag, cómo se valida, qué obligaciones acepta con la evidencia y qué pasa cuando no las cumple.',
    eyebrow: 'Responsables',
    lead: 'El sistema de responsables es la dependencia crítica de toda la plataforma. Si esa validación falla, nada de lo demás importa.',
    heroFigure: {
      srcBase: '/images/pages/illustrations/illustration-leaders',
      widths: [480, 768, 1024],
      alt: 'Ilustración: una persona coordinadora con una lista de verificación y un distintivo de validación, entre una casa con una familia a la izquierda y manos que ofrecen un paquete, una moneda y un corazón a la derecha',
      width: 1378,
      height: 659,
      frame: 'none',
    },
    sections: [
      {
        heading: 'Qué hace un responsable',
        blocks: [
          {
            kind: 'list',
            items: [
              'Coordina la ayuda dentro de un frente o de una entrega concreta.',
              'Recibe aportes en una cuenta verificada y a su nombre.',
              'Compra, transporta y entrega lo que la necesidad pedía.',
              'Registra lo entregado y sube la evidencia dentro del plazo.',
              'Mantiene al día el estado de las solicitudes que asumió.',
            ],
          },
        ],
      },
      {
        heading: 'Cómo se llega',
        blocks: [
          {
            kind: 'figure',
            figure: {
              srcBase: '/images/pages/app/app-registro-lider-desktop',
              widths: [640, 1280],
              alt: 'Pantalla de postulación para líder en Ayuda Directa, con el formulario vacío',
              width: 1280,
              height: 800,
              frame: 'browser',
              caption:
                'Vista real de la aplicación: la postulación ocurre allí, no en este sitio.',
            },
          },
          {
            kind: 'steps',
            steps: [
              {
                title: 'Postulación',
                body: 'Se hace desde la aplicación y es privada. No se publica quién se postuló ni quién fue rechazado.',
              },
              {
                title: 'Validación',
                body: 'Se comprueba la identidad y el vínculo real con el territorio o con la organización que dice representar.',
              },
              {
                title: 'Aprobación',
                body: 'Habilita el rol y con él la capacidad de recibir aportes directamente.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Las obligaciones que vienen con el rol',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'Coordinar recursos es una responsabilidad, no un privilegio. Quien asume el rol acepta rendir cuentas con evidencia dentro del plazo, no dirigir recursos hacia intereses propios sin declararlos primero, y entregar la coordinación de forma limpia si se retira.',
            ],
          },
          {
            kind: 'callout',
            tone: 'warning',
            title: 'La evidencia no es un trámite',
            body: 'No presentarla es la falta más grave: rompe exactamente aquello que hace verificable a Corag. La respuesta es escalonada — recordatorio, suspensión de la capacidad de recibir aportes y, si persiste, retiro del rol.',
          },
        ],
      },
      {
        heading: 'Conflictos de interés',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'Quien coordina no debe dirigir recursos hacia una organización, empresa o persona con la que tenga un interés económico o familiar sin declararlo primero. Declararlo no descalifica; ocultarlo sí.',
            ],
          },
        ],
      },
    ],
    cta: {
      title: '¿Coordinas ayuda en tu territorio?',
      body: 'La postulación se hace desde la aplicación. Es privada y toma unos minutos.',
      primary: {
        label: 'Postularme como responsable',
        href: APP_URL,
        external: true,
      },
      secondary: { label: 'Leer la gobernanza', href: '/governance' },
    },
  },

  partnersPage: {
    title: 'Aliados',
    description:
      'Cómo se suma una fundación, una empresa, una alcaldía o una organización comunitaria: aportar capacidad, integrar sistemas o respaldar la operación.',
    eyebrow: 'Organizaciones',
    lead: 'Una organización que ya trabaja en terreno no necesita otra plataforma. Necesita que la suya deje de estar aislada de las demás.',
    heroFigure: {
      srcBase: '/images/pages/illustrations/illustration-partners',
      widths: [480, 768, 1024],
      alt: 'Ilustración: una bodega, un camión, un centro de salud y un salón comunal, cada uno sobre su plataforma, unidos por líneas continuas que pasan por un corazón en el centro',
      width: 1269,
      height: 706,
      frame: 'none',
    },
    sections: [
      {
        heading: 'Tres formas de sumarse',
        blocks: [
          {
            kind: 'cards',
            cards: [
              {
                title: 'Aportar capacidad',
                body: 'Transporte, bodega, personal, insumos, cobertura en zonas donde nadie más llega. La capacidad instalada suele valer más que el dinero.',
              },
              {
                title: 'Integrar sistemas',
                body: 'Si ya llevas un registro de beneficiarios o de entregas, se conecta en lugar de duplicarse. Una necesidad registrada dos veces es una necesidad que se atiende mal.',
              },
              {
                title: 'Respaldar la operación',
                body: 'Con recursos o con difusión. Una convocatoria que llega a las juntas de acción comunal mueve más que un anuncio pagado.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Qué pedimos a cambio',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'Las mismas reglas que a todos: nombre responsable en cada entrega, evidencia dentro del plazo y respeto por los datos de las personas que reciben ayuda. Una alianza no compra excepciones.',
              'No publicamos el logo de ninguna organización sin autorización expresa, y no usamos una alianza como aval de nada que la organización no haya dicho.',
            ],
          },
        ],
      },
      {
        heading: 'Para alcaldías y entidades públicas',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'El valor de Corag para una entidad pública no es la donación: es el mapa. Saber en tiempo real qué se está pidiendo, quién ya lo está cubriendo y qué quedó documentado permite dirigir recursos propios donde de verdad falta, en lugar de duplicar lo que la comunidad ya resolvió.',
            ],
          },
        ],
      },
    ],
    cta: {
      title: 'Hablemos',
      body: 'Cuéntanos qué puede aportar tu organización y coordinamos los siguientes pasos.',
      primary: { label: 'Escríbenos', href: '/contact?topic=ally' },
      secondary: { label: 'Ver la documentación técnica', href: '/developers' },
    },
  },

  developersPage: {
    title: 'Desarrolladores',
    description:
      'La API pública de Corag: sin autenticación, idempotente por diseño, con servidor MCP. Qué se puede construir encima y cómo publicar tu primera solicitud.',
    eyebrow: 'Integraciones',
    lead: 'Muchas interfaces, una sola red de datos. El camino con más impacto no es construir otra aplicación de ayuda: es que la que construyas hable con la que ya existe.',
    heroFigure: {
      srcBase: '/images/home/app/app-home-desktop',
      widths: [640, 960, 1280, 1920],
      alt: 'Pantalla principal de Ayuda Directa, uno de los clientes de la API pública',
      width: 1280,
      height: 800,
      frame: 'browser',
      caption:
        'Ayuda Directa es un cliente de la misma API abierta que documentamos aquí. Los datos que se ven son datos vivos.',
    },
    sections: [
      {
        heading: 'El problema que resuelve una API abierta',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'En una emergencia aparecen varios equipos construyendo al tiempo, cada uno con su propia base de datos de necesidades. El resultado es más fragmentación, no menos: cinco listas incompatibles de lo mismo, ninguna completa.',
              'Por eso la red se publica. Una aplicación nueva no tiene que empezar de cero ni pedirle a la gente que se registre otra vez: se vuelve un cliente más de la misma red de datos.',
            ],
          },
        ],
      },
      {
        heading: 'La API en tres hechos',
        blocks: [
          {
            kind: 'cards',
            cards: [
              {
                title: 'Sin autenticación',
                body: 'No hay llaves ni registro. Publicar una solicitud o un ofrecimiento es un POST directo, porque en una emergencia el trámite es el enemigo.',
              },
              {
                title: 'Idempotente por diseño',
                body: 'El par source + externalId identifica cada registro. Reintentar la misma publicación no crea un duplicado, así que una integración con red inestable es segura.',
              },
              {
                title: 'El contacto exige consentimiento',
                body: 'El teléfono se publica, y por eso publishContact debe ser explícito. No hay forma de subir un contacto sin declarar que esa persona aceptó que se muestre.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Los tres endpoints',
        blocks: [
          {
            kind: 'list',
            items: [
              '`GET https://ayuda.cabuya.org/api/public/v1/help` — descubre la API y devuelve las emergencias activas con su `slug`. Empieza aquí.',
              '`POST https://ayuda.cabuya.org/api/public/v1/help` — publica una solicitud (`type: "request"`) o un ofrecimiento (`type: "offer"`).',
              '`POST https://ayuda.cabuya.org/mcp` — servidor MCP remoto, con las herramientas `listar_emergencias`, `publicar_solicitud` y `publicar_ofrecimiento`.',
            ],
          },
          {
            kind: 'prose',
            paragraphs: [
              'La especificación completa, OpenAPI 3.1, está en `https://ayuda.cabuya.org/api/public/openapi.json`.',
            ],
          },
        ],
      },
      {
        heading: 'Qué lleva una publicación',
        blocks: [
          {
            kind: 'list',
            items: [
              '**Obligatorio en ambos casos:** `source`, `externalId`, `title`, `category`, `contactName`, `contactWhatsapp` y `publishContact`.',
              '**`category`** es una de: `alimentos`, `salud`, `refugio`, `transporte`, `acopio`, `rescate`, `otro`.',
              '**Una solicitud** añade `address`, `latitude` y `longitude` obligatorios, más `urgency` (`urgent` · `needed` · `stable`) y `neededPeople`.',
              '**Un ofrecimiento** solo exige `type`; la ubicación es opcional y puede declarar `collectionCenterStatus` (`full` · `needs_volunteers` · `needs_resources`).',
              '**`emergencySlug`** se vuelve obligatorio cuando hay más de una emergencia activa. Por eso conviene hacer el `GET` primero.',
            ],
          },
        ],
      },
      {
        heading: 'Qué vale la pena construir encima',
        blocks: [
          {
            kind: 'list',
            items: [
              'Un bot de WhatsApp o Telegram que publique y consulte solicitudes.',
              'Una PWA que funcione sin conexión, para zonas con mala señal.',
              'Un importador desde hojas de cálculo, para organizaciones que ya trabajan así.',
              'Un tablero para una alcaldía o una ONG sobre sus propios frentes.',
              'Interfaces de accesibilidad: texto grande, lectura por voz, baja conectividad.',
              'Detección de duplicados y verificación de calidad de los datos.',
            ],
          },
        ],
      },
      {
        heading: 'Este sitio también es abierto',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'Cada página de cabuya.org tiene un gemelo en Markdown en la misma ruta con la extensión `.md`, pensado para agentes y para lectura automatizada. El catálogo completo está en `/llms.txt`.',
            ],
          },
        ],
      },
    ],
    cta: {
      title: '¿Estás construyendo algo?',
      body: 'La API no necesita permiso para empezar. Escríbenos si quieres contarnos qué estás haciendo o necesitas contexto sobre el modelo.',
      primary: {
        label: 'Ver la especificación',
        href: 'https://ayuda.cabuya.org/api/public/openapi.json',
        external: true,
      },
      secondary: { label: 'Escríbenos', href: '/contact?topic=general' },
    },
  },
  privacyPage: {
    title: 'Privacidad',
    description:
      'Qué datos maneja Corag, dónde se guardan, qué se publica y qué nunca, cómo pedir que se corrija algo y qué hacemos con la información de este sitio.',
    eyebrow: 'Tus datos',
    lead: 'Corag coordina ayuda entre personas que casi siempre están pasando un mal momento. Cómo tratamos sus datos es parte del servicio, no una nota al pie.',
    sectionIndexLabel: 'En esta página',
    sections: [
      {
        heading: 'Las dos superficies, dos tratamientos',
        blocks: [
          {
            kind: 'cards',
            cards: [
              {
                title: 'cabuya.org — este sitio',
                body: 'Es un sitio estático. No tiene cuentas, no guarda perfiles y no usa cookies de seguimiento. Solo recoge datos cuando escribes en un formulario.',
              },
              {
                title: 'ayuda.cabuya.org — la aplicación',
                body: 'Ahí viven las cuentas, las solicitudes y la evidencia. Es donde se trata información sobre necesidades de personas reales, con las reglas que siguen.',
              },
            ],
          },
        ],
      },
      {
        heading: 'Qué recogemos en este sitio',
        blocks: [
          {
            kind: 'list',
            items: [
              'Lo que escribes en el formulario de contacto: nombre, correo, tema y mensaje. Se usa para responderte y nada más.',
              'Lo que escribes en un reporte de conducta, que puede enviarse de forma anónima. Si eliges el anonimato, no guardamos ni tu nombre ni tu correo aunque el navegador los envíe.',
              'Métricas de uso agregadas y sin cookies: qué páginas se visitan y desde qué país. No identifican a nadie ni siguen a una persona entre sitios.',
              'Tu preferencia de idioma y de tema, guardadas en tu propio navegador. No salen de tu dispositivo.',
            ],
          },
        ],
      },
      {
        heading: 'Qué no hacemos, nunca',
        blocks: [
          {
            kind: 'list',
            items: [
              'Vender, alquilar o ceder datos personales a terceros.',
              'Publicar teléfonos, direcciones o ubicaciones exactas sin autorización explícita de la persona.',
              'Usar los datos de un formulario para enviarte publicidad que no pediste.',
              'Publicar evidencia con rasgos identificables de menores de edad.',
            ],
          },
        ],
      },
      {
        heading: 'Cuánto tiempo se guarda',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'Los mensajes de contacto se conservan mientras siga abierta la conversación y un periodo razonable después, para poder retomar el hilo. Los reportes de conducta se conservan el tiempo necesario para resolverlos y documentar la decisión.',
              'La evidencia publicada de una entrega permanece: es el registro que hace verificable la ayuda. Lo que no permanece son los datos personales de quien recibió, que no forman parte de esa publicación.',
            ],
          },
        ],
      },
      {
        heading: 'Tus derechos',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'Puedes pedir acceso a los datos que tenemos sobre ti, su corrección o su eliminación, y puedes retirar una autorización que hayas dado antes. Escríbenos desde el formulario de contacto indicando qué necesitas.',
              'Si algo publicado te afecta y crees que no debería estar ahí, dilo. Se revisa siempre, y mientras se revisa se puede despublicar.',
            ],
          },
        ],
      },
      {
        heading: 'Servicios de terceros',
        blocks: [
          {
            kind: 'prose',
            paragraphs: [
              'Este sitio se aloja en Cloudflare Pages, los formularios se procesan a través de Dailybot y las respuestas automáticas se envían con Resend. Cada uno recibe únicamente lo que necesita para cumplir su función, y ninguno recibe los datos para usarlos por su cuenta.',
            ],
          },
        ],
      },
    ],
    cta: {
      title: '¿Algo que corregir o retirar?',
      body: 'Escríbenos y lo revisamos. No hace falta que sepas si “aplica”: si algo te incomoda, es razón suficiente.',
      primary: { label: 'Escríbenos', href: '/contact?topic=report' },
      secondary: { label: 'Código de Conducta', href: '/conduct' },
    },
  },

  ecosystemPage: {
    title: 'Ecosistema de apps de ayuda',
    description:
      'Red de aplicaciones complementarias tras la emergencia: mapas, acopio, personas, mascotas y ayuda directa. Corag es un nodo. Nos alimentamos entre todas.',
    eyebrow: 'La red',
    headline: 'No competimos. Nos alimentamos.',
    lead: 'Muchas apps maduras ya ayudan tras la emergencia. Cada una resuelve una pieza a su manera. Esta página las reúne — y destaca Corag Ayuda Directa como un nodo de la misma red.',
    ctaApp: 'Abrir Ayuda Directa',
    ctaDirectory: 'Ver las apps',
    ctaHow: 'Cómo funciona Corag',
    featuredEyebrow: 'Nuestro nodo',
    featuredImageAlt: 'Pantalla principal de Ayuda Directa',
    directoryEyebrow: 'Herramientas complementarias',
    directoryTitle: 'Las apps de la red',
    directoryLead:
      'Las descripciones salen de lo que cada sitio público dice de sí mismo. Listar no es un ranking ni un aval.',
    categories: {
      matching: 'Ayuda directa',
      damage: 'Daños y reportes',
      logistics: 'Acopio y logística',
      pets: 'Mascotas',
      people: 'Personas',
    },
    categoryLeads: {
      matching: 'Conectan a quien necesita ayuda con quien puede darla.',
      damage: 'Mapean daños de infraestructura, grietas y reportes de campo.',
      logistics:
        'Centros de acopio, albergues, hospitales y coordinación de insumos.',
      pets: 'Ayudan a reunir animales perdidos con su familia.',
      people:
        'Herramientas de personas desaparecidas y reencuentros para equipos y familias.',
    },
    whatLabel: 'Qué hace:',
    howLabel: 'Cómo funciona:',
    visit: 'Visitar',
    apiDocs: 'API pública',
    moreInfo: 'Más información',
    close: 'Cerrar',
    overview: 'Qué ofrece',
    features: 'Características',
    tools: 'Herramientas y superficies',
    audience: 'Para quién',
    coverage: 'Cobertura',
    limits: 'Límites honestos',
    integrations: 'Integraciones',
    publicApi: 'API pública',
    publicMcp: 'MCP público',
    availabilityYes: 'Sí, documentada',
    availabilityNo: 'No anunciada',
    availabilityUnknown: 'Sin confirmar',
    openApi: 'Especificación OpenAPI',
    mcpEndpoint: 'Endpoint MCP',
    developers: 'Documentación para desarrolladores',
    badgeApi: 'API',
    badgeMcp: 'MCP',
    disclosure:
      'Este directorio describe herramientas públicas complementarias a partir de lo que cada sitio dice de sí mismo. Listar no es un aval a ninguna organización. Para pedir inclusión o retiro, usa el formulario de abajo o escríbenos.',
    joinEyebrow: 'Crece la red',
    joinTitle: '¿Construyes otra app?',
    joinLead:
      'Cuéntanos qué hiciste. Una persona revisa cada solicitud: no es publicación automática.',
    joinForm: {
      disclaimer:
        'Enviar este formulario pide revisión para aparecer en el directorio. No publica tu app automáticamente.',
      appName: 'Nombre de la app',
      appUrl: 'URL de la app (https)',
      what: '¿Qué hace?',
      how: '¿Cómo funciona?',
      category: 'Categoría',
      categoryPlaceholder: 'Elige una',
      catMatching: 'Ayuda directa',
      catDamage: 'Daños y reportes',
      catLogistics: 'Acopio y logística',
      catPets: 'Mascotas',
      catPeople: 'Personas',
      catOther: 'Otra',
      contactName: 'Tu nombre',
      contactEmail: 'Tu correo',
      notes: 'Notas (derechos de logo, API, lo que haga falta)',
      submit: 'Pedir inclusión',
      submitting: 'Enviando…',
      successTitle: 'Solicitud recibida',
      successBody:
        'Gracias. Revisamos tu app y te escribimos si necesitamos algo más.',
      errRequired: 'Este campo es obligatorio.',
      errEmail: 'Escribe un correo válido.',
      errUrl: 'Escribe una URL https válida.',
      errCategory: 'Elige una categoría.',
      errSubmit: 'Algo falló. Inténtalo de nuevo en un momento.',
    },
  },

  // Errors
  searchError: 'Ocurrió un error al buscar. Por favor, inténtalo de nuevo.',
  loadError:
    'No se pudo cargar el índice de búsqueda. Por favor, recarga la página.',
  retry: 'Reintentar',
};
