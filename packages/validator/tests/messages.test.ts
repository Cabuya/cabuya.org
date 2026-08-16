/**
 * Message snapshots — the validator's voice, frozen.
 *
 * Messages are quoted in issues, commit messages and agent transcripts, and
 * three of them are written verbatim into the spec's own teaching examples.
 * Changing one must therefore be a deliberate act that fails a test and
 * forces a decision, not a diff nobody reads.
 *
 * The three DESIGNED sets below are asserted against the strings the spec's
 * invalid examples promise in their `$comment`. If the validator and the
 * spec ever disagree about what an error says, this test says so.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { denyChecks } from '../src/passes/deny.js';
import { authorMessage } from '../src/passes/schema.js';
import { recordChecks } from '../src/passes/semantic.js';
import { feedWith, type Json } from './fixtures/builders.js';

const EXAMPLES = join(
  import.meta.dirname,
  '..',
  '..',
  '..',
  'spec',
  'examples',
  '0.1',
  'invalid'
);

const commentOf = (file: string): string =>
  JSON.parse(readFileSync(join(EXAMPLES, file), 'utf-8')).$comment as string;

describe('the designed messages match what the spec examples promise', () => {
  it('REC001 — invalid-1 (the honest-null parenthetical)', () => {
    const { message } = authorMessage({
      keyword: 'required',
      instancePath: '/data/places/0',
      schemaPath: '',
      params: { missingProperty: 'last_confirmed_at' },
    } as never);
    expect(message).toBe(
      "/data/places/0: required property 'last_confirmed_at' is missing (did you mean to publish last_confirmed_at: null?)"
    );
    expect(commentOf('invalid-1-missing-confirmation-key.json')).toContain(
      'last_confirmed_at: null'
    );
  });

  it('PII001 / PII002 / PII003 — invalid-2 (the three §7 violations)', () => {
    const findings = denyChecks(
      feedWith({
        x_example_phone: '+57 300 000 0000',
        confirmed_by: 'Nombre Ejemplo',
        description: 'Preguntar por Nombre Ejemplo, cel 3000000000.',
      }) as Json
    );
    const by = (id: string) => findings.find((f) => f.id === id)?.message ?? '';

    expect(by('PII001')).toContain(
      'contact values MUST NOT travel in feeds (use contact_available + public_url)'
    );
    expect(by('PII002')).toBe(
      'must be a role token (team|volunteer|official_source|partner:{id}), never a personal name'
    );
    expect(by('PII003')).toBe(
      'possible personal data detected (name+phone pattern) — strip before publishing'
    );

    const comment = commentOf('invalid-2-contact-and-personal-data.json');
    expect(comment).toContain('contact values MUST NOT travel in feeds');
    expect(comment).toContain('must be a role token');
    expect(comment).toContain('possible personal data detected');
  });

  it('REC010 — invalid-3 (state token named, destination named)', () => {
    const findings = recordChecks(
      feedWith({ name: 'Acopio Consota (cerrado ahora)' }) as Json
    );
    const message = findings.find((f) => f.id === 'REC010')?.message ?? '';
    expect(message).toBe(
      "operational state token detected in name ('cerrado') — move it to service_status/lifecycle_status (CR-2)"
    );
    expect(commentOf('invalid-3-status-in-name-and-always-now.json')).toContain(
      'CR-2'
    );
  });
});

describe('message-shape rules hold across the whole catalogue output', () => {
  const sample = [
    ...recordChecks(
      feedWith({
        name: 'Sitio cerrado',
        same_as: ['bare-id'],
        x_note: 'oops',
        municipality_code: null,
      }) as Json
    ),
    ...denyChecks(
      feedWith({
        confirmed_by: 'Nombre Ejemplo',
        x_example_phone: '3000000000',
      }) as Json
    ),
  ];

  it('one violation per message — no message merges two problems', () => {
    for (const finding of sample) {
      expect(
        finding.message.split(/(?<![0-9])\.\s+[A-Z]/).length,
        finding.id
      ).toBeLessThan(3);
    }
  });

  it('every fix is imperative and actionable', () => {
    for (const finding of sample) {
      expect(finding.fix.length, finding.id).toBeGreaterThan(10);
      expect(finding.fix, finding.id).toMatch(
        /^(Add|Remove|Rename|Replace|Use|Set|Publish|Emit|Correct|Give|Keep|Bring|Match|Shard|Prefer|Make|Store|Consumers)/
      );
    }
  });

  it('never blames, moralizes or claims certification', () => {
    for (const finding of sample) {
      const text = `${finding.message} ${finding.fix}`.toLowerCase();
      for (const banned of [
        'certified',
        'certificado',
        'you should have',
        'obviously',
        'clearly wrong',
        'bad practice',
      ]) {
        expect(text, `${finding.id}: ${banned}`).not.toContain(banned);
      }
    }
  });

  it('every finding is locatable and documented', () => {
    for (const finding of sample) {
      expect(finding.pointer, finding.id).toMatch(/^(\/|$)/);
      expect(finding.docs).toBe(
        `https://cabuya.org/developers/validator/checks#${finding.id}`
      );
    }
  });
});
