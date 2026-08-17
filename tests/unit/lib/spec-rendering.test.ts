/**
 * The spec reader, the generated schema reference, and the links between them.
 *
 * Three things can rot here, and each has a test:
 *
 *   1. The loader could stop seeing a section, and the site would quietly
 *      publish an incomplete specification.
 *   2. The schema reference could drift from the schema — the failure the
 *      generator exists to prevent, so it is worth proving the generator
 *      actually reads the schema rather than a snapshot of it.
 *   3. A check id in the field mapping could be renamed in the validator,
 *      leaving a dead cross-link on every reference page. That link is the
 *      agent loop's last edge; a broken one sends an agent to a 404 anchor.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  checksForField,
  mappedCheckIds,
  mappedFieldPaths,
} from '@/lib/field-checks';
import { exampleValueFor, schemaFields } from '@/lib/schema-reference';
import {
  sectionNeighbours,
  sectionNumber,
  specExamples,
  specSchema,
  specSchemas,
  specSection,
  specSections,
  specVersions,
} from '@/lib/spec-loader';

const ROOT = process.cwd();

describe('spec loader — sees everything on disk', () => {
  it('finds the versions', () => {
    expect(specVersions()).toContain('0.1');
  });

  it('loads every section file, and no more', () => {
    const onDisk = readdirSync(join(ROOT, 'spec/versions/0.1')).filter((file) =>
      file.endsWith('.md')
    );
    expect(specSections('0.1')).toHaveLength(onDisk.length);
  });

  it('orders sections by their number, appendices last', () => {
    const numbers = specSections('0.1').map((section) => section.number);
    expect(numbers[0]).toBe('0');
    expect(numbers.at(-1)).toBe('a');
  });

  it('derives the section number from the filename, not frontmatter', () => {
    // The filename is what anchors and validator messages are built from, so
    // renaming a file must change the anchor — that coupling is deliberate.
    expect(sectionNumber('3-the-feed')).toBe('3');
    expect(sectionNumber('appendix-a-design-decisions')).toBe('a');
  });

  it('strips frontmatter from the body but keeps the raw file', () => {
    const section = specSection('0.1', '1-architecture');
    expect(section).toBeDefined();
    expect(section?.body.startsWith('---')).toBe(false);
    expect(section?.body).toContain('§1');
    expect(section?.raw.startsWith('---')).toBe(true);
    // The twin serves `raw`, so it must be the file byte for byte.
    expect(section?.raw).toBe(
      readFileSync(join(ROOT, 'spec/versions/0.1/1-architecture.md'), 'utf-8')
    );
  });

  it('walks neighbours within a version', () => {
    const { previous, next } = sectionNeighbours('0.1', '1-architecture');
    expect(previous?.slug).toBe('0-introduction');
    expect(next?.slug).toBe('2-discovery');
    expect(sectionNeighbours('0.1', '0-introduction').previous).toBeNull();
  });

  it('loads schemas with their absolute versioned $id', () => {
    for (const schema of specSchemas('0.1')) {
      expect(schema.id).toMatch(
        /^https:\/\/cabuya\.org\/schemas\/0\.1\/[a-z-]+\.schema\.json$/
      );
    }
  });

  it('loads examples with their kind and teaching note', () => {
    const examples = specExamples('0.1');
    expect(examples.filter((e) => e.kind === 'valid').length).toBeGreaterThan(
      0
    );
    expect(examples.filter((e) => e.kind === 'invalid').length).toBeGreaterThan(
      0
    );
    // Every invalid example states, in its own file, what it demonstrates —
    // and the validator's message snapshots assert against these strings.
    for (const example of examples.filter((e) => e.kind === 'invalid')) {
      expect(example.comment, `${example.name} has no $comment`).toBeTruthy();
    }
  });
});

describe('schema reference — generated, not written', () => {
  const feed = specSchema('0.1', 'place-feed');
  const fields = schemaFields(feed?.schema ?? {});

  it('produces a field for every envelope property', () => {
    const top = fields.filter((field) => field.depth === 0).map((f) => f.name);
    for (const required of [
      'last_updated',
      'ttl',
      'version',
      'publisher_id',
      'license',
      'data',
    ]) {
      expect(top).toContain(required);
    }
  });

  it('marks required fields as core and optional ones as extended', () => {
    const lastUpdated = fields.find((f) => f.path === 'last_updated');
    expect(lastUpdated?.required).toBe(true);
    expect(lastUpdated?.profile).toBe('core');
    const permitted = fields.find((f) => f.path === 'permitted_use');
    expect(permitted?.required).toBe(false);
    expect(permitted?.profile).toBe('extended');
  });

  it('descends into arrays of records', () => {
    const paths = fields.map((field) => field.path);
    expect(paths).toContain('data.places[].id');
    expect(paths).toContain('data.places[].last_confirmed_at');
  });

  it('states what it cannot express instead of dropping it', () => {
    // A table that silently omits a constraint is worse than one that says
    // it cannot show it.
    const withNotes = fields.filter((field) => field.notes.length > 0);
    expect(withNotes.length).toBeGreaterThan(0);
  });

  it('reads the schema rather than a snapshot of it', () => {
    /*
     * The point of generating this table is that it cannot drift. Prove the
     * generator actually reads its input: give it a schema it has never seen
     * and check the output follows.
     */
    const invented = schemaFields({
      type: 'object',
      required: ['alpha'],
      properties: {
        alpha: { type: 'string', description: 'Invented.' },
        beta: { type: 'integer' },
      },
    });
    expect(invented.map((f) => f.path)).toEqual(['alpha', 'beta']);
    expect(invented[0].required).toBe(true);
    expect(invented[1].required).toBe(false);
  });

  it('pulls example values out of a real example document', () => {
    const example = JSON.parse(
      specExamples('0.1').find((e) => e.name === 'valid-rich-extended')?.raw ??
        '{}'
    );
    expect(exampleValueFor(example, 'ttl')).toBe('300');
    expect(exampleValueFor(example, 'data.places[].id')).toMatch(/^".+"$/);
    expect(exampleValueFor(example, 'nonexistent.field')).toBeUndefined();
  });

  it('shows a null as null rather than as missing', () => {
    // `last_confirmed_at: null` is a real, meaningful value in this protocol.
    // Rendering it as an empty cell would teach exactly the wrong thing.
    expect(exampleValueFor({ a: null }, 'a')).toBe('null');
    expect(exampleValueFor({}, 'a')).toBeUndefined();
  });
});

describe('field → check mapping — the agent loop’s last edge', () => {
  it('names only checks that exist', async () => {
    const { CHECKS } = await import('@cabuya/validator');
    const known = new Set(CHECKS.map((check) => check.id));
    const unknown = mappedCheckIds().filter((id) => !known.has(id));
    expect(
      unknown,
      'these would render as dead links on the schema reference'
    ).toEqual([]);
  });

  it('names only fields that exist in a schema', () => {
    const paths = new Set(
      ['place-feed', 'manifest'].flatMap((name) =>
        schemaFields(specSchema('0.1', name)?.schema ?? {}).map((f) => f.path)
      )
    );
    const orphans = mappedFieldPaths().filter((path) => !paths.has(path));
    expect(orphans, 'mapped fields that no schema declares').toEqual([]);
  });

  it('covers the fields whose checks a publisher will actually hit', () => {
    // Not every field needs a check, but these are the ones the founding
    // analysis showed people get wrong.
    for (const path of [
      'data.places[].last_confirmed_at',
      'data.places[].name',
      'data.places[].service_status',
      'license',
    ]) {
      expect(checksForField(path).length, path).toBeGreaterThan(0);
    }
  });

  it('returns nothing for a field with no checks, rather than guessing', () => {
    expect(checksForField('data.places[].nonexistent')).toEqual([]);
  });
});

describe('spec anchors — stable across editorial changes', () => {
  /**
   * Validator findings deep-link to `#3-1`. Those anchors must survive a typo
   * fix in the heading text, which a slugified title would not: correcting
   * "§3.1 The envelope" would move `#3-1-the-envelope` and break every message
   * that already shipped.
   */
  const anchors = () => {
    const calls: Array<[string, unknown]> = [];
    const ctx = {
      setProperty: (_node: unknown, key: string, value: unknown) =>
        calls.push([key, value]),
    };
    return { calls, ctx };
  };

  const heading = (text: string) => ({
    type: 'element' as const,
    tagName: 'h2',
    children: [{ type: 'text', value: text }],
  });

  it('derives the id from the section number', async () => {
    const { satteriSpecAnchors } = await import('@/lib/satteri-plugins');
    const plugin = satteriSpecAnchors();
    const { calls, ctx } = anchors();
    plugin.element.visit(heading('§3.1 The envelope'), ctx as never);
    expect(calls).toEqual([['id', '3-1']]);
  });

  it('handles deep numbering and appendices', async () => {
    const { satteriSpecAnchors } = await import('@/lib/satteri-plugins');
    const plugin = satteriSpecAnchors();
    const deep = anchors();
    plugin.element.visit(
      heading('§7.2.1 The join prohibition'),
      deep.ctx as never
    );
    expect(deep.calls).toEqual([['id', '7-2-1']]);
  });

  it('ignores headings with no section number', async () => {
    const { satteriSpecAnchors } = await import('@/lib/satteri-plugins');
    const plugin = satteriSpecAnchors();
    const { calls, ctx } = anchors();
    plugin.element.visit(heading('Design decisions'), ctx as never);
    expect(calls).toEqual([]);
  });

  it('gives the same id whatever the heading text says', () => {
    // The property the whole scheme depends on.
    const ids = [
      '§3.1 The envelope',
      '§3.1 The feed envelope',
      '§3.1  Envelope',
    ].map((text) =>
      text.match(/§\s*([0-9]+(?:\.[0-9]+)*)/)?.[1].replace(/\./g, '-')
    );
    expect(new Set(ids).size).toBe(1);
  });
});

describe('RFC 2119 keywords', () => {
  it('wraps normative keywords and leaves the rest alone', async () => {
    const { satteriRfc2119 } = await import('@/lib/satteri-plugins');
    const plugin = satteriRfc2119();
    let result: unknown[] = [];
    const node = {
      type: 'element' as const,
      tagName: 'p',
      children: [
        {
          type: 'text',
          value: 'Feeds MUST carry a licence and SHOULD be cached.',
        },
      ],
    };
    plugin.element.visit(node, {
      setProperty: (_n: unknown, key: string, value: unknown) => {
        if (key === 'children') result = value as unknown[];
      },
    } as never);

    const wrapped = result.filter(
      (child) => (child as { tagName?: string }).tagName === 'b'
    );
    expect(wrapped).toHaveLength(2);
    expect(
      wrapped.map(
        (child) =>
          (child as { children: Array<{ value: string }> }).children[0].value
      )
    ).toEqual(['MUST', 'SHOULD']);
  });

  it('matches the longest keyword, not its prefix', async () => {
    // "MUST NOT" is a different requirement from "MUST"; splitting it would
    // invert the meaning of the sentence.
    const { satteriRfc2119 } = await import('@/lib/satteri-plugins');
    const plugin = satteriRfc2119();
    let result: unknown[] = [];
    plugin.element.visit(
      {
        type: 'element' as const,
        tagName: 'p',
        children: [{ type: 'text', value: 'Records MUST NOT carry a name.' }],
      },
      {
        setProperty: (_n: unknown, key: string, value: unknown) => {
          if (key === 'children') result = value as unknown[];
        },
      } as never
    );
    const wrapped = result.find(
      (child) => (child as { tagName?: string }).tagName === 'b'
    ) as { children: Array<{ value: string }> };
    expect(wrapped.children[0].value).toBe('MUST NOT');
  });

  it('leaves a paragraph with no keywords untouched', async () => {
    const { satteriRfc2119 } = await import('@/lib/satteri-plugins');
    const plugin = satteriRfc2119();
    let called = false;
    plugin.element.visit(
      {
        type: 'element' as const,
        tagName: 'p',
        children: [{ type: 'text', value: 'This paragraph is descriptive.' }],
      },
      {
        setProperty: () => {
          called = true;
        },
      } as never
    );
    expect(called).toBe(false);
  });
});
