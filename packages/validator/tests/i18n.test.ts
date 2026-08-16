/**
 * Output translations.
 *
 * The completeness assertion is the point: shipping a new check without its
 * Spanish entry would silently degrade the experience for the ecosystem
 * this protocol was built for, so it fails CI instead.
 */
import { describe, expect, it } from 'vitest';
import type { Finding } from '../src/index.js';
import {
  CHECKS,
  ES,
  translateFinding,
  untranslatedChecks,
} from '../src/index.js';

const finding = (over: Partial<Finding> = {}): Finding => ({
  id: 'REC001',
  severity: 'error',
  level: 'L2',
  pointer: '/data/places/0',
  message: "required property 'last_confirmed_at' is missing",
  rule: 'The confirmation key is REQUIRED.',
  fix: 'Add it.',
  spec: 'https://cabuya.org/developers/spec/0.1/6-trust-and-verification#6-1',
  docs: 'https://cabuya.org/developers/validator/checks#REC001',
  ...over,
});

describe('completeness', () => {
  it('every implemented check has a Spanish entry', () => {
    expect(untranslatedChecks()).toEqual([]);
  });

  it('every Spanish entry has a real check id behind it', () => {
    const ids = new Set(CHECKS.map((c) => c.id));
    expect(Object.keys(ES).filter((id) => !ids.has(id))).toEqual([]);
  });

  it('Spanish entries carry both a rule and a fix', () => {
    for (const [id, entry] of Object.entries(ES)) {
      expect(entry.rule, id).toBeTruthy();
      expect(entry.fix, id).toBeTruthy();
    }
  });
});

describe('what translates and what never does', () => {
  it('translates message, rule and fix', () => {
    const translated = translateFinding(finding(), 'es');
    expect(translated.message).toContain('falta la propiedad obligatoria');
    expect(translated.rule).toContain('OBLIGATORIA');
    expect(translated.fix).toContain('Nunca la inventes');
  });

  it('NEVER translates the id, pointer, spec link or docs link', () => {
    const original = finding();
    const translated = translateFinding(original, 'es');
    expect(translated.id).toBe(original.id);
    expect(translated.pointer).toBe(original.pointer);
    expect(translated.spec).toBe(original.spec);
    expect(translated.docs).toBe(original.docs);
  });

  it('is a no-op for English', () => {
    const original = finding();
    expect(translateFinding(original, 'en')).toBe(original);
  });

  it('leaves runtime detail intact inside a translated message', () => {
    const translated = translateFinding(
      finding({
        id: 'PII001',
        message:
          'contact values MUST NOT travel in feeds (use contact_available + public_url) — matched pattern class: colombian-mobile, value not echoed',
      }),
      'es'
    );
    expect(translated.message).toContain('NO DEBEN viajar');
    // The pattern class is runtime detail, not prose — it stays verbatim.
    expect(translated.message).toContain('colombian-mobile');
    expect(translated.message).toContain('valor no reproducido');
  });

  it('falls back to English rather than emitting an empty string', () => {
    const unknown = translateFinding(finding({ id: 'ZZZ999' }), 'es');
    expect(unknown.rule).toBe('The confirmation key is REQUIRED.');
  });
});
