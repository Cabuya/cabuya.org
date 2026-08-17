/**
 * The fallback card generator's guard.
 *
 * This script runs in `prebuild`, on every build, forever. The one thing it
 * must never do is overwrite the real artwork when it lands — and if it ever
 * did, nobody would notice, because the fallback also looks fine. That is
 * precisely the kind of failure that has to be a test rather than a habit.
 *
 * The guard is tested on bytes, not on file paths: the real card arrives with
 * the same filename, so the only signal that distinguishes it is the marker
 * carried inside the file.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  CARD_HEIGHT,
  CARD_WIDTH,
  CARDS,
  FALLBACK_MARKER,
  mayWrite,
} from '../../../scripts/generate-og-fallback.mjs';

const ROOT = process.cwd();

describe('og fallback — the overwrite guard', () => {
  it('writes when the file is absent', () => {
    expect(mayWrite(null)).toBe(true);
    expect(mayWrite(undefined)).toBe(true);
  });

  it('rewrites its own output', () => {
    const ours = Buffer.from(`...jpeg bytes...${FALLBACK_MARKER}...more bytes`);
    expect(mayWrite(ours)).toBe(true);
  });

  it('refuses to touch a file it did not generate', () => {
    // The real card, or anything a human put there on purpose.
    const theirs = Buffer.from('...jpeg bytes with no marker anywhere...');
    expect(mayWrite(theirs)).toBe(false);
  });

  it('is not fooled by a near-miss marker', () => {
    const almost = Buffer.from('...cabuya-og-fallbac...');
    expect(mayWrite(almost)).toBe(false);
  });
});

/**
 * The cards that are actually in place, and who owns them.
 *
 * This block used to assert that both cards **carry** the fallback marker,
 * which was true while the fallback was the shipped card — and which would now
 * require keeping the fallback forever to stay true. The real per-language
 * artwork landed (`OG-01`, installed by `scripts/build-og-cards.mjs`), so the
 * assertion is inverted rather than dropped, and it is a stronger one: the
 * shipped cards must carry **no** marker, and `mayWrite` must refuse them. That
 * is the guard doing its job on the real files rather than on a fixture.
 */
describe('og fallback — the cards in place are the designer’s, and stay that way', () => {
  it.each(CARDS.map((card: { path: string }) => card.path))(
    '%s exists, is exactly 1200x630, and the generator will not touch it',
    (path: string) => {
      const buffer = readFileSync(join(ROOT, path));

      // JPEG SOI, then the dimensions out of the SOF0/SOF2 segment.
      expect(buffer.subarray(0, 2).toString('hex')).toBe('ffd8');
      let offset = 2;
      let size: [number, number] | null = null;
      while (offset < buffer.length - 9) {
        if (buffer[offset] !== 0xff) break;
        const marker = buffer[offset + 1];
        const length = buffer.readUInt16BE(offset + 2);
        if (marker === 0xc0 || marker === 0xc2) {
          size = [
            buffer.readUInt16BE(offset + 7),
            buffer.readUInt16BE(offset + 5),
          ];
          break;
        }
        offset += 2 + length;
      }
      expect(size).toEqual([CARD_WIDTH, CARD_HEIGHT]);

      expect(
        buffer.includes(FALLBACK_MARKER),
        'a shipped card carrying the marker would be overwritten on the next build'
      ).toBe(false);
      expect(mayWrite(buffer), 'the guard must refuse the real artwork').toBe(
        false
      );
      // The prompt pack's ceiling: a card that is slow to fetch is a card some
      // platforms silently drop.
      expect(buffer.length).toBeLessThan(300 * 1024);
    }
  );
});
