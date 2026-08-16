/** Server-side intake helpers for Cloudflare Pages Functions. */

export const CANONICAL_TOPICS = [
  'general',
  /** A foundation, company, municipality or community org offering capacity. */
  'organization',
  /** Institutional partnership. */
  'ally',
  'press',
  /** A problem with published information — wrong data, a delivery that does not add up. */
  'report',
  'conduct',
  'other',
] as const;

const TOPIC_ALIASES: Record<string, string> = {
  general: 'general',
  organization: 'organization',
  org: 'organization',
  ally: 'ally',
  partner: 'ally',
  alliance: 'ally',
  press: 'press',
  media: 'press',
  report: 'report',
  conduct: 'conduct',
  coc: 'conduct',
  other: 'other',
  /*
   * Legacy values from the previous site. Kept so an old bookmarked link still
   * lands on a real topic instead of falling through to an empty selection.
   */
  sponsor: 'ally',
  sponsorship: 'ally',
  collaboration: 'ally',
  project: 'general',
  speaker: 'general',
  'tech-talk': 'general',
  cfs: 'general',
};

export function normalizeTopic(raw: string | null | undefined): string {
  if (!raw) return '';
  const key = raw.trim().toLowerCase();
  return TOPIC_ALIASES[key] ?? key;
}

export function looksLikeSpamPayload(fields: {
  name: string;
  message: string;
  website?: string;
}): boolean {
  if (fields.website?.trim()) return true;
  const urlPattern = /https?:\/\//gi;
  if (fields.name.match(urlPattern)?.length) return true;
  if ((fields.message.match(urlPattern) || []).length > 6) return true;
  return false;
}

export function checkRateLimit(
  store: Map<string, number[]>,
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): { allowed: boolean; retryAfterSec: number } {
  const cutoff = now - windowMs;
  const prior = (store.get(key) || []).filter((ts) => ts > cutoff);
  if (prior.length >= limit) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((prior[0] + windowMs - now) / 1000)
    );
    store.set(key, prior);
    return { allowed: false, retryAfterSec };
  }
  prior.push(now);
  store.set(key, prior);
  return { allowed: true, retryAfterSec: 0 };
}

export function pickAckCopy(
  topic: string,
  lang: 'en' | 'es'
): { subject: string; text: string } {
  const t = normalizeTopic(topic) || 'general';

  if (lang === 'es') {
    const subjects: Record<string, string> = {
      organization: 'Recibimos tu mensaje — Corag',
      ally: 'Recibimos tu propuesta de alianza — Corag',
      press: 'Recibimos tu consulta de prensa — Corag',
      report: 'Recibimos tu reporte — Corag',
      conduct: 'Recibimos tu reporte — Corag',
      ecosystem: 'Recibimos tu solicitud de ecosistema — Corag',
      general: 'Recibimos tu mensaje — Corag',
    };
    const bodies: Record<string, string> = {
      organization:
        'Gracias por escribirnos. Te contactamos para entender qué puede aportar tu organización y cómo coordinarlo.\n\n— Corag',
      ally: 'Gracias por escribirnos. Te contactamos para hablar de la alianza y los siguientes pasos.\n\n— Corag',
      press:
        'Gracias por escribirnos. Revisamos tu consulta y respondemos lo antes posible.\n\n— Corag',
      report:
        'Gracias por reportarlo. Revisamos lo que nos cuentas.\n\nSi se trata de algo urgente que afecta a alguien ahora mismo, repórtalo también en la aplicación: https://ayuda.cabuya.org\n\n— Corag',
      conduct:
        'Gracias por escribirnos. Tu mensaje se trata de forma confidencial.\n\nSi hay riesgo inmediato para la integridad de alguien, contacta primero a las autoridades locales: este canal no es un servicio de emergencia.\n\n— Corag',
      ecosystem:
        'Gracias por pedirnos incluir tu app en el ecosistema. Revisamos la solicitud a mano — no es publicación automática — y te escribimos si hace falta algo más.\n\n— Corag',
      general:
        'Gracias por escribirnos. Te respondemos tan pronto como podamos.\n\nSi lo que necesitas es pedir ayuda o aportar, eso ocurre en la aplicación: https://ayuda.cabuya.org\n\n— Corag',
    };
    return {
      subject: subjects[t] || subjects.general,
      text: bodies[t] || bodies.general,
    };
  }

  const subjects: Record<string, string> = {
    organization: 'We received your message — Corag',
    ally: 'We received your partnership enquiry — Corag',
    press: 'We received your press enquiry — Corag',
    report: 'We received your report — Corag',
    conduct: 'We received your report — Corag',
    ecosystem: 'We received your ecosystem request — Corag',
    general: 'We received your message — Corag',
  };
  const bodies: Record<string, string> = {
    organization:
      'Thanks for writing. We will get in touch to understand what your organization can offer and how to coordinate it.\n\n— Corag',
    ally: 'Thanks for writing. We will get in touch to discuss the partnership and next steps.\n\n— Corag',
    press:
      'Thanks for reaching out. We will review your enquiry and reply as soon as possible.\n\n— Corag',
    report:
      'Thanks for reporting it. We will review what you told us.\n\nIf this is urgent and affects someone right now, please also report it in the application: https://ayuda.cabuya.org\n\n— Corag',
    conduct:
      'Thanks for writing. Your message is handled confidentially.\n\nIf anyone is in immediate danger, contact your local emergency services first — this channel is not an emergency service.\n\n— Corag',
    ecosystem:
      'Thanks for asking to list your app in the ecosystem. A human reviews every request — this is not automatic publishing — and we will write back if we need anything else.\n\n— Corag',
    general:
      'Thanks for writing. We will get back to you as soon as we can.\n\nIf what you need is to ask for help or contribute, that happens in the application: https://ayuda.cabuya.org\n\n— Corag',
  };
  return {
    subject: subjects[t] || subjects.general,
    text: bodies[t] || bodies.general,
  };
}
