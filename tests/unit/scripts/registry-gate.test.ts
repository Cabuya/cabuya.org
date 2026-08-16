/**
 * Unit tests for the registry:check core — each rule proven on a seeded
 * fixture, and the non-echo discipline verified on the sensitive ones.
 */
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

// @ts-expect-error — plain-ESM gate module without type declarations
import { checkRegistry } from '../../../scripts/lib/registry-checks.mjs';

const FX = join(process.cwd(), 'tests/fixtures/registry-gate');
const findings = checkRegistry(FX) as {
  check: string;
  file: string;
  message: string;
}[];

const of = (check: string) => findings.filter((f) => f.check === check);

describe('registry:check core', () => {
  it('the good entry produces no findings of its own', () => {
    // The URL collision it shares with bad-app is reported once, naming both
    // files — see the dedicated test below.
    const own = findings.filter(
      (f) => f.file.includes('good-app') && f.check !== 'url-unique'
    );
    expect(own).toEqual([]);
  });

  it('flags filename ≠ id', () => {
    expect(of('filename').some((f) => f.file.includes('bad-app'))).toBe(true);
  });

  it('flags a URL collision across entries (trailing slash + case folded), naming both files', () => {
    const hits = of('url-unique');
    expect(hits).toHaveLength(1);
    expect(hits[0].message).toContain('bad-app.json');
    expect(hits[0].message).toContain('good-app.json');
  });

  it('flags a personal-looking contact without echoing it', () => {
    const hits = of('contact-org-level');
    expect(hits).toHaveLength(1);
    expect(hits[0].message).not.toContain('gmail');
  });

  it('flags HTML in a field (B6) without echoing it', () => {
    const hits = of('B6-html');
    expect(hits.length).toBeGreaterThanOrEqual(1);
    expect(hits[0].message).not.toContain('script');
  });

  it('flags a reference to an unknown event', () => {
    expect(of('event-ref').some((f) => f.message.includes('ghost-event'))).toBe(
      true
    );
  });

  it('refuses hand-written measured fields via additionalProperties', () => {
    expect(
      of('schema').some(
        (f) => f.file.includes('measured') && f.message.includes('additional')
      )
    ).toBe(true);
  });
});
