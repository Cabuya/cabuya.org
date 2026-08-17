/**
 * Guards the generated brand assets and the references that point at them.
 *
 * `/internal/brand/assets` renders these files so a human can see a broken one.
 * This file is the half that can stop a release: it reconciles three lists that
 * are maintained in three different places — the files on disk, the `<head>`
 * links in `BaseHead.astro`, and the icons array in `site.webmanifest` — and
 * fails when they disagree.
 *
 * The failure mode being prevented is specific and common: an icon is renamed
 * or regenerated at a new size, two of the three lists are updated, and the
 * third rots quietly for months because nobody looks at a 16-pixel tab icon.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const PUBLIC = join(ROOT, 'public');

const read = (relative: string): Buffer => readFileSync(join(PUBLIC, relative));

/** PNG header: width and height are big-endian 32-bit ints at byte 16. */
function pngSize(relative: string): [number, number] {
  const buffer = read(relative);
  expect(buffer.subarray(1, 4).toString('ascii'), `${relative} is a PNG`).toBe(
    'PNG'
  );
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
}

const EXPECTED_PNG: Record<string, [number, number]> = {
  'icons/apple-touch-icon.png': [180, 180],
  'icons/icon-192x192.png': [192, 192],
  'icons/icon-512x512.png': [512, 512],
  'icons/icon-maskable-512x512.png': [512, 512],
  'images/brand/cabuya-lockup.png': [640, 213],
  'images/brand/cabuya-lockup-dark.png': [640, 213],
};

describe('brand assets — the files themselves', () => {
  it('every declared PNG exists at exactly its declared size', () => {
    for (const [relative, [width, height]] of Object.entries(EXPECTED_PNG)) {
      expect(existsSync(join(PUBLIC, relative)), `${relative} exists`).toBe(
        true
      );
      expect(pngSize(relative), relative).toEqual([width, height]);
    }
  });

  it('favicon.ico carries both the 16 and the 32 variant', () => {
    const buffer = read('favicon.ico');
    const count = buffer.readUInt16LE(4);
    const sizes = Array.from({ length: count }, (_, i) => {
      const entry = 6 + i * 16;
      return `${buffer[entry] || 256}x${buffer[entry + 1] || 256}`;
    });
    expect(sizes).toEqual(expect.arrayContaining(['16x16', '32x32']));
  });

  it('favicon.svg is square and scalable', () => {
    const svg = read('favicon.svg').toString('utf-8');
    const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
    expect(viewBox, 'favicon.svg declares a viewBox').toBeDefined();
    const [, , width, height] = (viewBox as string).split(/\s+/).map(Number);
    expect(width).toBe(height);
  });

  it('keeps the icon set small enough to be free', () => {
    // Not a performance budget — a sanity bound. A 2 MB favicon means someone
    // exported the print master by mistake.
    for (const relative of Object.keys(EXPECTED_PNG)) {
      expect(statSync(join(PUBLIC, relative)).size, relative).toBeLessThan(
        400 * 1024
      );
    }
  });
});

describe('brand assets — the manifest agrees with the filesystem', () => {
  const manifest = JSON.parse(read('site.webmanifest').toString('utf-8')) as {
    name: string;
    theme_color: string;
    background_color: string;
    icons: Array<{ src: string; sizes: string; purpose?: string }>;
  };

  it('every icon it lists resolves', () => {
    const missing = manifest.icons
      .map((icon) => icon.src)
      .filter((src) => !existsSync(join(PUBLIC, src.replace(/^\//, ''))));
    expect(missing).toEqual([]);
  });

  it('states the true pixel size of each raster icon', () => {
    for (const icon of manifest.icons) {
      if (!icon.src.endsWith('.png')) continue;
      const [width, height] = pngSize(icon.src.replace(/^\//, ''));
      expect(icon.sizes, icon.src).toBe(`${width}x${height}`);
    }
  });

  it('ships a maskable icon — otherwise Android crops the mark', () => {
    expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(
      true
    );
  });

  it('uses palette colours, not arbitrary ones', () => {
    const css = readFileSync(join(ROOT, 'src/styles/global.css'), 'utf-8');
    for (const color of [manifest.theme_color, manifest.background_color]) {
      expect(css.toLowerCase(), `${color} is a declared token value`).toContain(
        color.toLowerCase()
      );
    }
  });

  it('names Cabuya, with no leftover from the previous project', () => {
    const raw = read('site.webmanifest').toString('utf-8');
    expect(raw).toContain('Cabuya');
    expect(raw.toLowerCase()).not.toContain('corag');
  });
});

describe('brand assets — the head links agree with the filesystem', () => {
  const head = readFileSync(
    join(ROOT, 'src/components/BaseHead.astro'),
    'utf-8'
  );

  it('every icon href in BaseHead resolves', () => {
    const hrefs = [
      ...head.matchAll(
        /rel="(?:icon|apple-touch-icon|manifest)"[^>]*href="([^"]+)"/g
      ),
    ]
      .map((m) => m[1])
      .concat(
        [
          ...head.matchAll(
            /href="([^"]+)"[^>]*rel="(?:icon|apple-touch-icon|manifest)"/g
          ),
        ].map((m) => m[1])
      );
    expect(hrefs.length, 'found icon links to check').toBeGreaterThan(0);
    const missing = hrefs.filter(
      (href) => !existsSync(join(PUBLIC, href.replace(/^\//, '')))
    );
    expect(missing).toEqual([]);
  });

  it('declares favicon.ico sizes that the file actually contains', () => {
    const declared = head.match(/href="\/favicon\.ico"\s+sizes="([^"]+)"/)?.[1];
    if (!declared) return; // sizes is optional; only checked when present
    const buffer = read('favicon.ico');
    const count = buffer.readUInt16LE(4);
    const actual = new Set(
      Array.from({ length: count }, (_, i) => {
        const entry = 6 + i * 16;
        return `${buffer[entry] || 256}x${buffer[entry + 1] || 256}`;
      })
    );
    for (const size of declared.split(/\s+/)) {
      expect(actual.has(size), `favicon.ico contains ${size}`).toBe(true);
    }
  });

  it('paints browser chrome with the palette grounds', () => {
    const css = readFileSync(
      join(ROOT, 'src/styles/global.css'),
      'utf-8'
    ).toLowerCase();
    const themeColors = [
      ...head.matchAll(/name="theme-color"\s+content="(#[0-9a-fA-F]{6})"/g),
    ].map((m) => m[1].toLowerCase());
    expect(themeColors.length).toBeGreaterThanOrEqual(2);
    for (const color of themeColors) {
      expect(css, `${color} is a declared token value`).toContain(color);
    }
  });
});
