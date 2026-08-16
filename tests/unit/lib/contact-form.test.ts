import { describe, expect, it } from 'vitest';

import {
  checkRateLimit,
  isValidContactEmail,
  normalizeTopic,
  pickAckCopy,
  resolveTopicFromSearchParams,
  sanitizeContactText,
  validateConductReportForm,
  validateContactForm,
} from '@/lib/contact-form';

describe('contact-form', () => {
  const messages = {
    requiredField: 'Required',
    invalidEmail: 'Invalid email',
  };

  it('sanitizes and truncates text', () => {
    expect(sanitizeContactText('  hello  ', 10)).toBe('hello');
    expect(sanitizeContactText('abcdefghijklmnop', 5)).toBe('abcde');
  });

  it('validates email format', () => {
    expect(isValidContactEmail('user@example.com')).toBe(true);
    expect(isValidContactEmail('not-an-email')).toBe(false);
  });

  it('normalizes topic aliases', () => {
    expect(normalizeTopic('org')).toBe('organization');
    expect(normalizeTopic('partner')).toBe('ally');
    expect(normalizeTopic('REASON')).toBe('reason');
    expect(normalizeTopic('press')).toBe('press');
  });

  it('keeps old links working by mapping retired topics onto live ones', () => {
    // Bookmarks and printed material from the previous site still carry these.
    expect(normalizeTopic('sponsorship')).toBe('ally');
    expect(normalizeTopic('collaboration')).toBe('ally');
    expect(normalizeTopic('tech-talk')).toBe('general');
  });

  it('resolves topic from topic or legacy reason query params', () => {
    const allowed = new Set(['organization', 'ally', 'general']);
    expect(
      resolveTopicFromSearchParams(
        new URLSearchParams('topic=organization'),
        allowed
      )
    ).toBe('organization');
    expect(
      resolveTopicFromSearchParams(
        new URLSearchParams('reason=partner'),
        allowed
      )
    ).toBe('ally');
  });

  it('accepts a complete valid form', () => {
    const allowed = new Set(['general', 'tech-talk', 'sponsorship']);
    const result = validateContactForm(
      {
        name: 'Ada',
        email: 'ada@example.com',
        reason: 'general',
        subject: 'Hello',
        message: 'Testing',
      },
      allowed,
      messages
    );
    expect(result.valid).toBe(true);
  });

  it('accepts the ally alias `partner` when the allowlist has ally', () => {
    const allowed = new Set(['ally']);
    const result = validateContactForm(
      {
        name: 'Ada',
        email: 'ada@example.com',
        reason: 'partner',
        subject: 'Partnership',
        message: 'We want to help',
      },
      allowed,
      messages
    );
    expect(result.valid).toBe(true);
  });

  it('rejects honeypot submissions', () => {
    const allowed = new Set(['general']);
    const result = validateContactForm(
      {
        name: 'Bot',
        email: 'bot@example.com',
        reason: 'general',
        subject: 'Spam',
        message: 'Spam',
        website: 'https://spam.test',
      },
      allowed,
      messages
    );
    expect(result.valid).toBe(false);
  });

  it('rejects unknown reason values', () => {
    const allowed = new Set(['general']);
    const result = validateContactForm(
      {
        name: 'Ada',
        email: 'ada@example.com',
        reason: 'unknown',
        subject: 'Hello',
        message: 'Testing',
      },
      allowed,
      messages
    );
    expect(result.valid).toBe(false);
    expect(result.errors.reason).toBe('Required');
  });

  it('validates conduct reports with anonymity rules', () => {
    const anonymousOk = validateConductReportForm(
      {
        incidentDescription:
          'Enough detail about a confidential incident for organizers.',
        anonymous: true,
      },
      messages
    );
    expect(anonymousOk.valid).toBe(true);

    const identifiedMissingEmail = validateConductReportForm(
      {
        incidentDescription:
          'Enough detail about a confidential incident for organizers.',
        anonymous: false,
        name: 'Ada',
        email: '',
      },
      messages
    );
    expect(identifiedMissingEmail.valid).toBe(false);
    expect(identifiedMissingEmail.errors.email).toBe('Required');
  });

  it('rejects a conduct report too short to act on', () => {
    // Twenty characters is the floor. "Something happened" gives the team
    // nothing to review and nobody to follow up with.
    const tooShort = validateConductReportForm(
      { incidentDescription: 'Something happened', anonymous: true },
      messages
    );
    expect(tooShort.valid).toBe(false);
    expect(tooShort.errors.incidentDescription).toBe('Required');
  });

  it('still rejects a malformed email on an anonymous report', () => {
    // Anonymity does not mean unvalidated: if the reporter typed an address
    // wanting a reply, a silent drop is worse than an error.
    const result = validateConductReportForm(
      {
        incidentDescription:
          'Enough detail about a confidential incident for the team.',
        anonymous: true,
        email: 'not-an-email',
      },
      messages
    );
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBe('Invalid email');
  });

  it('accepts an anonymous report that supplies a valid contact address', () => {
    const result = validateConductReportForm(
      {
        incidentDescription:
          'Enough detail about a confidential incident for the team.',
        anonymous: true,
        email: 'reporter@example.com',
      },
      messages
    );
    expect(result.valid).toBe(true);
  });

  it('fails a conduct report whose honeypot is filled, without saying why', () => {
    // A bot gets `valid: false` and no field error to iterate against.
    const result = validateConductReportForm(
      {
        incidentDescription:
          'Enough detail about a confidential incident for the team.',
        anonymous: true,
        website: 'http://spam.example',
      },
      messages
    );
    expect(result.valid).toBe(false);
    expect(result.errors.incidentDescription).toBe('');
    expect(result.errors.email).toBe('');
  });

  it('picks localized ack copy and rate-limits', () => {
    const es = pickAckCopy('organization', 'es');
    expect(es.subject).toContain('Corag');
    expect(es.text).toContain('organización');
    const en = pickAckCopy('ally', 'en');
    expect(en.subject.toLowerCase()).toContain('partnership');

    // A report gets pointed at the app, because that is where urgency belongs.
    expect(pickAckCopy('report', 'es').text).toContain('ayuda.cabuya.org');
    // A conduct report never is: it says to call emergency services instead.
    expect(pickAckCopy('conduct', 'es').text).not.toContain('ayuda.cabuya.org');

    // An unknown topic degrades to the general copy rather than throwing.
    expect(pickAckCopy('not-a-topic', 'en').subject).toBe(
      pickAckCopy('general', 'en').subject
    );

    const store = new Map<string, number[]>();
    expect(checkRateLimit(store, '1.1.1.1', 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit(store, '1.1.1.1', 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit(store, '1.1.1.1', 2, 60_000).allowed).toBe(false);
  });
});
