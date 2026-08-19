/**
 * The hosted installer and its SHA-256 sidecar, paired.
 *
 * `/developers/skill` tells every reader to verify the download against the
 * published sidecar. Nothing else enforces that the two files move together —
 * and the first edit that forgets the sidecar makes the documented
 * verification fail for every user, which reads as a compromised download.
 * (Security review finding 1, PLAN_product_clarity_overhaul.)
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

describe('the hosted installer', () => {
  it('matches its published SHA-256 sidecar', () => {
    const script = readFileSync(join(ROOT, 'public', 'skill', 'install.sh'));
    const sidecar = readFileSync(
      join(ROOT, 'public', 'skill', 'install.sh.sha256'),
      'utf-8'
    );
    const hash = createHash('sha256').update(script).digest('hex');
    expect(sidecar.trim()).toBe(`${hash}  install.sh`);
  });

  it('keeps the defensive shell preamble', () => {
    const script = readFileSync(
      join(ROOT, 'public', 'skill', 'install.sh'),
      'utf-8'
    );
    expect(script).toContain('set -euo pipefail');
    // The two-step doctrine: the script must never advertise piping to bash.
    expect(script).not.toMatch(/curl[^\n]*\|\s*bash/);
  });
});
