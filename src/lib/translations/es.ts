import type { SiteTranslations } from './types';

/** Textos en español — escritos nativamente, no traducidos del inglés. */
export const es: SiteTranslations = {
  siteTitle: 'Cabuya',
  siteTitleFull: 'Cabuya — el protocolo abierto de interoperabilidad de ayuda',
  siteDescription:
    'Cabuya es un formato abierto para que las apps de ayuda publiquen y lean los mismos datos: puntos de acopio, necesidades, capacidades y entregas. Cualquier equipo puede implementarlo en una tarde, y nadie tiene que pedirle permiso a nadie.',

  nav: {
    home: 'Inicio',
    foundingRecord: 'Registro fundacional',
    github: 'GitHub',
    openMenu: 'Abrir el menú',
    closeMenu: 'Cerrar el menú',
    switchToLanguage: 'Switch to English',
  },

  theme: {
    toLight: 'Cambiar a modo claro',
    toDark: 'Cambiar a modo oscuro',
  },

  home: {
    metaTitle: 'Cabuya — el protocolo abierto de interoperabilidad de ayuda',
    metaDescription:
      'Un protocolo abierto para que las apps de ayuda publiquen y lean los mismos datos. Un esquema, cuatro transportes; conformidad medida por un validador público.',
    eyebrow: 'Un protocolo abierto para apps de ayuda',
    title: 'Cada app es un hilo. El protocolo es la cuerda.',
    pitch:
      'Cabuya es un formato abierto para que las apps de ayuda publiquen y lean los mismos datos: puntos de acopio, necesidades, capacidades y entregas.',
    pitchSecond:
      'Cualquier equipo puede implementarlo en una tarde, y nadie tiene que pedirle permiso a nadie. La conformidad se mide con un validador publicado — nunca se declara.',
    principleGloss: 'Crecemos juntos: no competimos, nos alimentamos.',
    statusNote:
      'La especificación del protocolo (0.1) es un borrador en revisión, y este sitio se construye en público. El registro fundacional — decisiones, diseño del protocolo, evidencia — ya es público en el repositorio.',
  },

  footer: {
    principle: '«Crecemos juntos: no competimos, nos alimentamos.»',
    principleGloss:
      'La fibra con la que se amarra lo que nadie puede cargar solo.',
    license: 'Código Apache-2.0 · spec y registro CC0',
    sourceCode: 'Código fuente',
    foundingRecord: 'Registro fundacional',
  },

  notFoundPage: {
    metaTitle: 'Página no encontrada — Cabuya',
    title: 'Esta página no existe',
    description:
      'El hilo que seguiste no lleva a ninguna parte: puede que la página se haya movido durante la migración, o que la dirección tenga un error.',
    backHome: 'Volver al inicio',
  },

  markdown: {
    siteNavigation: 'Navegación del Sitio',
    languageNote: 'Esta página también está disponible en inglés.',
  },
};
