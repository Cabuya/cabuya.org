/**
 * The deny (PII) pass — the protocol's hardest line, and the one whose
 * findings must never echo what they catch.
 */
import { describe, expect, it } from 'vitest';

import {
  DENY_KEYS,
  DENY_PATTERNS,
  denyChecks,
  ROLE_TOKEN,
} from '../src/passes/deny.js';
import { feed, feedWith, type Json, place } from './fixtures/builders.js';

const ids = (findings: { id: string }[]) => findings.map((f) => f.id);
const on = (over: Json) => ids(denyChecks(feedWith(over) as Json));

/** Sentinel values that must never appear in any serialized finding. */
const SENTINELS = [
  '3001234567',
  '+57 300 123 4567',
  'persona.privada@example.invalid',
  'Nombre Apellido',
];

describe('the baseline is silent', () => {
  it('a clean record produces no PII findings', () => {
    expect(denyChecks(feed() as Json)).toEqual([]);
  });
});

describe('PII001 — contact values never travel', () => {
  it('fires on a phone in a namespaced extension (extensions do NOT exempt)', () => {
    expect(on({ x_example_phone: '+57 300 123 4567' })).toContain('PII001');
  });

  it('fires on an email anywhere in the record', () => {
    expect(
      on({ x_example_contact: 'persona.privada@example.invalid' })
    ).toContain('PII001');
  });

  it('fires on a WhatsApp link', () => {
    expect(on({ x_example_chat: 'https://wa.me/573001234567' })).toContain(
      'PII001'
    );
  });

  it('does NOT fire on public_url or source_url — the sanctioned link-out', () => {
    expect(
      on({ public_url: 'https://example-app.org/places/p-001?ref=wa.me' })
    ).not.toContain('PII001');
  });

  it('does NOT fire on a plain place name or address', () => {
    expect(
      on({ name: 'Acopio Consota', address_text: 'Calle 12 #34-56' })
    ).not.toContain('PII001');
  });
});

describe('PII002 — confirmed_by is a role token', () => {
  it('fires on a personal name and enumerates the legal values in the message', () => {
    const findings = denyChecks(
      feedWith({ confirmed_by: 'Nombre Apellido' }) as Json
    );
    const finding = findings.find((f) => f.id === 'PII002');
    expect(finding).toBeDefined();
    expect(finding?.message).toContain(
      'team|volunteer|official_source|partner:{id}'
    );
    expect(finding?.suggested_patch?.value).toBe('team');
  });

  it('accepts every legal role token', () => {
    for (const token of [
      'team',
      'volunteer',
      'official_source',
      'partner:peer-app',
    ]) {
      expect(on({ confirmed_by: token }), token).not.toContain('PII002');
      expect(ROLE_TOKEN.test(token), token).toBe(true);
    }
  });
});

describe('PII003 — free text is the third leak channel', () => {
  it('fires with the designed message on a name+phone pattern', () => {
    const findings = denyChecks(
      feedWith({
        description:
          'Recibe alimentos. Preguntar por Nombre Apellido, cel 3001234567.',
      }) as Json
    );
    const finding = findings.find((f) => f.id === 'PII003');
    expect(finding?.message).toBe(
      'possible personal data detected (name+phone pattern) — strip before publishing'
    );
  });

  it('fires on contact-only free text, naming the class not the value', () => {
    const findings = denyChecks(
      feedWith({
        description: 'Escribir a persona.privada@example.invalid',
      }) as Json
    );
    const finding = findings.find((f) => f.id === 'PII003');
    expect(finding?.message).toContain('email-address');
    expect(finding?.message).toContain('value not echoed');
  });

  it('stays silent on ordinary descriptive prose', () => {
    expect(
      on({ description: 'Recibe alimentos no perecederos de 8am a 6pm.' })
    ).not.toContain('PII003');
  });

  it('does not accuse on capitalized place names alone', () => {
    expect(
      on({
        description: 'Ubicado frente al Coliseo Municipal, Barrio Consota.',
      })
    ).not.toContain('PII003');
  });
});

describe('PII004 — person-level entities', () => {
  it('fires on a person-level collection in the envelope or data', () => {
    expect(ids(denyChecks(feed({ desaparecidos: [] }) as Json))).toContain(
      'PII004'
    );
    expect(
      ids(
        denyChecks({
          ...feed(),
          data: { places: [], beneficiarios: [] },
        } as Json)
      )
    ).toContain('PII004');
  });

  it('stays silent on the places collection itself', () => {
    expect(ids(denyChecks(feed() as Json))).not.toContain('PII004');
  });
});

describe('PII005 — deny-listed field names, even when the value looks clean', () => {
  it('warns on a contact-shaped field name', () => {
    expect(on({ responsable: 'equipo local' })).toContain('PII005');
    expect(on({ x_example_telefono: 'ver sitio' })).toContain('PII005');
  });

  it('stays silent on ordinary fields', () => {
    expect(on({ x_example_capacity_note: 'lleno por la tarde' })).not.toContain(
      'PII005'
    );
  });
});

describe('PII006 — moderation verdicts do not federate', () => {
  it('fires when a verdict rides on a foreign record', () => {
    expect(
      on({
        source: { source_id: 'peer-app' },
        moderation: 'informacion_falsa',
      })
    ).toContain('PII006');
  });

  it('stays silent on a publisher’s own moderation of its own record', () => {
    expect(
      on({ source: { source_id: 'example-app' }, moderation: 'held' })
    ).not.toContain('PII006');
  });
});

describe('the non-echo rule (absolute)', () => {
  it('no sentinel value appears in any serialized finding', () => {
    const findings = denyChecks(
      feedWith({
        x_example_phone: SENTINELS[1],
        x_example_mail: SENTINELS[2],
        confirmed_by: SENTINELS[3],
        description: `Preguntar por ${SENTINELS[3]}, cel ${SENTINELS[0]}.`,
      }) as Json
    );
    expect(findings.length).toBeGreaterThanOrEqual(4);
    const serialized = JSON.stringify(findings);
    for (const sentinel of SENTINELS) {
      expect(serialized, sentinel).not.toContain(sentinel);
    }
  });

  it('still says enough to fix: pointer + pattern class + an imperative fix', () => {
    const findings = denyChecks(
      feedWith({ x_example_phone: SENTINELS[1] }) as Json
    );
    const finding = findings.find((f) => f.id === 'PII001');
    expect(finding?.pointer).toBe('/data/places/0/x_example_phone');
    expect(finding?.message).toContain('colombian-mobile');
    expect(finding?.fix).toMatch(/remove the value/i);
  });
});

describe('the exported pattern set (the skill vendors these semantics)', () => {
  it('covers the documented deny keys and pattern classes', () => {
    for (const key of ['telefono', 'cedula', 'whatsapp', 'responsable']) {
      expect(DENY_KEYS, key).toContain(key);
    }
    const classes = DENY_PATTERNS.map((p) => p.class);
    expect(classes).toEqual(
      expect.arrayContaining([
        'email-address',
        'colombian-mobile',
        'whatsapp-link',
        'national-id',
      ])
    );
  });
});
