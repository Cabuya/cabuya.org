/**
 * The CLI harness: flags, commands, exit codes, formats and translations.
 *
 * The exit-code assertions matter most — agents branch on them before they
 * parse anything, and the transport/content split is what stops a fix loop
 * rewriting correct data because a DNS lookup failed.
 */
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  explain,
  helpText,
  initOutput,
  listChecks,
  main,
  parseArgs,
  UsageError,
} from '../src/cli/index.js';
import { EXIT } from '../src/index.js';

const SPEC = join(
  import.meta.dirname,
  '..',
  '..',
  '..',
  'spec',
  'examples',
  '0.1'
);

/** Capture stdout/stderr instead of writing to the terminal. */
function capture() {
  const out: string[] = [];
  const err: string[] = [];
  return {
    io: { out: (t: string) => out.push(t), err: (t: string) => err.push(t) },
    stdout: () => out.join(''),
    stderr: () => err.join(''),
  };
}

describe('argument parsing', () => {
  it('parses commands, targets and flags', () => {
    const options = parseArgs([
      'validate',
      'feed.json',
      '--level',
      'L2',
      '--format',
      'json',
      '--strict',
      '--no-network',
    ]);
    expect(options).toMatchObject({
      command: 'validate',
      target: 'feed.json',
      level: 'L2',
      format: 'json',
      strict: true,
      network: false,
    });
  });

  it('enforces the minimum probe gap', () => {
    expect(parseArgs(['probe', 'x', '--probe-twice', '1']).probeTwice).toBe(2);
  });

  it('rejects unknown flags and values with a usage error', () => {
    expect(() => parseArgs(['validate', '--nope'])).toThrow(UsageError);
    expect(() => parseArgs(['validate', '--level', 'L9'])).toThrow(UsageError);
    expect(() => parseArgs(['validate', '--format', 'yaml'])).toThrow(
      UsageError
    );
    expect(() => parseArgs(['validate', '--lang', 'fr'])).toThrow(UsageError);
    expect(() => parseArgs(['validate', '--level'])).toThrow(UsageError);
  });
});

describe('exit codes', () => {
  it('0 on a conforming document', async () => {
    const c = capture();
    const code = await main(
      [
        'validate',
        join(SPEC, 'valid', 'valid-minimal-core.json'),
        '--no-network',
        '--format',
        'json',
      ],
      c.io
    );
    expect(code).toBe(EXIT.OK);
  });

  it('1 on content errors', async () => {
    const c = capture();
    const code = await main(
      [
        'validate',
        join(SPEC, 'invalid', 'invalid-1-missing-confirmation-key.json'),
        '--no-network',
        '--format',
        'json',
      ],
      c.io
    );
    expect(code).toBe(EXIT.NON_CONFORMANT);
  });

  it('2 on warnings with --strict, but 0 without it', async () => {
    const target = join(SPEC, 'valid', 'valid-minimal-core.json');
    const strict = capture();
    expect(
      await main(
        ['validate', target, '--no-network', '--format', 'json', '--strict'],
        strict.io
      )
    ).toBe(EXIT.WARNINGS_STRICT);
    const lenient = capture();
    expect(
      await main(
        ['validate', target, '--no-network', '--format', 'json'],
        lenient.io
      )
    ).toBe(EXIT.OK);
  });

  it('3 on transport failure — never confused with bad data', async () => {
    const c = capture();
    const code = await main(
      ['validate', 'http://127.0.0.1:1/nothing.json', '--format', 'json'],
      c.io
    );
    expect(code).toBe(EXIT.TRANSPORT);
    expect(c.stderr()).toContain('transport failure');
  });

  it('4 on usage errors', async () => {
    expect(await main(['validate', '--bogus'], capture().io)).toBe(EXIT.USAGE);
    expect(await main(['nonsense'], capture().io)).toBe(EXIT.USAGE);
    expect(await main(['validate'], capture().io)).toBe(EXIT.USAGE);
    expect(await main(['validate', '/no/such/file.json'], capture().io)).toBe(
      EXIT.USAGE
    );
  });
});

describe('output formats', () => {
  const target = join(
    SPEC,
    'invalid',
    'invalid-1-missing-confirmation-key.json'
  );

  it('json is the machine contract', async () => {
    const c = capture();
    await main(['validate', target, '--no-network', '--format', 'json'], c.io);
    const report = JSON.parse(c.stdout());
    expect(report.findings[0].id).toBe('REC001');
    expect(report.blockers_for_next_level).toContain('REC001');
  });

  it('sarif is valid and carries rule metadata', async () => {
    const c = capture();
    await main(['validate', target, '--no-network', '--format', 'sarif'], c.io);
    const sarif = JSON.parse(c.stdout());
    expect(sarif.version).toBe('2.1.0');
    expect(sarif.runs[0].tool.driver.name).toBe('cabuya-validator');
    expect(sarif.runs[0].tool.driver.rules[0].helpUri).toContain('checks#');
    expect(sarif.runs[0].results[0].ruleId).toBe('REC001');
  });

  it('markdown is the copy-into-an-agent format', async () => {
    const c = capture();
    await main(
      ['validate', target, '--no-network', '--format', 'markdown'],
      c.io
    );
    const md = c.stdout();
    expect(md).toContain('# Cabuya conformance report');
    expect(md).toContain('| Severity | Check | Location | What to fix |');
    expect(md).toContain('REC001');
  });

  it('text renders severity as a TEXT token, never colour alone', async () => {
    const c = capture();
    await main(['validate', target, '--no-network', '--format', 'text'], c.io);
    const text = c.stdout();
    expect(text).toContain('ERROR');
    expect(text).toContain('Blocking the next level');
    // No ANSI escapes when stdout is not a TTY.
    expect(text).not.toContain('[');
  });

  it('text puts blockers before the longer warning list', async () => {
    const c = capture();
    await main(['validate', target, '--no-network', '--format', 'text'], c.io);
    const text = c.stdout();
    expect(text.indexOf('Blocking the next level')).toBeLessThan(
      text.indexOf('Warnings')
    );
  });
});

describe('translations', () => {
  it('translates message, rule and fix but never the id, pointer or links', async () => {
    const c = capture();
    await main(
      [
        'validate',
        join(SPEC, 'invalid', 'invalid-1-missing-confirmation-key.json'),
        '--no-network',
        '--format',
        'json',
        '--lang',
        'es',
      ],
      c.io
    );
    const report = JSON.parse(c.stdout());
    const finding = report.findings.find(
      (f: { id: string }) => f.id === 'REC001'
    );
    expect(finding.message).toContain('falta la propiedad obligatoria');
    expect(finding.fix).toContain('Nunca la inventes');
    expect(finding.id).toBe('REC001');
    expect(finding.pointer).toBe('/data/places/0');
    expect(finding.docs).toContain('cabuya.org');
  });
});

describe('explain — offline check resolution', () => {
  it('prints rule, status and both links without touching the network', () => {
    const text = explain('REC001', 'en');
    expect(text).toContain('REC001');
    expect(text).toContain('rule:');
    expect(text).toContain('spec: https://cabuya.org/developers/spec/');
    expect(text).toContain(
      'docs: https://cabuya.org/developers/validator/checks#REC001'
    );
  });

  it('is case-insensitive and suggests neighbours for a typo', () => {
    expect(explain('rec001', 'en')).toContain('REC001');
    expect(explain('REC999', 'en')).toContain('Did you mean');
  });

  it('shows the Spanish rule and fix with --lang es', () => {
    expect(explain('PII001', 'es')).toContain('NO DEBEN viajar');
  });

  it('states plainly when a check is catalogued but not implemented', () => {
    expect(explain('WRT002', 'en')).toContain('catalogued');
  });
});

describe('checks and init', () => {
  it('checks lists the whole catalogue with implementation status', () => {
    const text = listChecks();
    expect(text).toContain('REC001');
    expect(text).toContain('implemented');
    expect(text).toMatch(/\d+\/\d+ implemented/);
  });

  it('init emits a manifest and feed skeleton that teach the honest null', () => {
    const text = initOutput(parseArgs(['init', '--publisher-id', 'my-app']));
    expect(text).toContain('.well-known/cabuya.json');
    expect(text).toContain('"publisher_id": "my-app"');
    expect(text).toContain('"last_confirmed_at": null');
  });

  it('init emits the framework one-liner when asked, and says how to get it otherwise', () => {
    expect(initOutput(parseArgs(['init', '--framework', 'nextjs']))).toContain(
      'Next.js'
    );
    expect(initOutput(parseArgs(['init']))).toContain('--framework');
  });
});

describe('help', () => {
  it('documents every exit code and the measured-not-declared stance', () => {
    const help = helpText();
    for (const code of [0, 1, 2, 3, 4, 5]) {
      expect(help).toContain(`  ${code}  `);
    }
    expect(help).toContain('Conformance is measured, never declared.');
  });

  it('--help and a bare invocation both succeed', async () => {
    expect(await main(['--help'], capture().io)).toBe(EXIT.OK);
    expect(await main([], capture().io)).toBe(EXIT.OK);
  });
});
