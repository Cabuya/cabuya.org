/**
 * `/start` quotes installs; it does not aspire to them.
 *
 * The commands the page renders are pinned here against the pack's own
 * install proof (cabuya-skill 0.1.0, INSTALL_TRANSCRIPT.md): if somebody
 * edits `start-commands.ts` to a command nobody proved, this fails before
 * the page ships it. And the page must consume the module rather than
 * hardcoding strings, so there is exactly one place the proof protects.
 */
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { START_COMMANDS } from '@/lib/start-commands';

describe('the /start commands are the proven ones', () => {
  it('pins the three commands to the release proof', () => {
    expect(START_COMMANDS.install).toBe('npx skills add Cabuya/cabuya-skill');
    expect(START_COMMANDS.installVendored).toBe(
      'git clone --depth 1 https://github.com/Cabuya/cabuya-skill .agents/skills/cabuya'
    );
    expect(START_COMMANDS.invoke).toBe('/cabuya');
  });

  it('the page renders the module, never a hardcoded command', () => {
    const page = readFileSync('src/components/pages/StartPage.astro', 'utf8');
    expect(page).toContain("from '@/lib/start-commands'");
    expect(page).not.toMatch(/npx skills add/);
    expect(page).not.toMatch(/git clone/);
  });

  it('the twin serializes the same module', () => {
    const twin = readFileSync('src/lib/start-markdown.ts', 'utf8');
    expect(twin).toContain("from '@/lib/start-commands'");
    expect(twin).not.toMatch(/npx skills add/);
  });

  it('the quickstart quotes the same install the proof covers', () => {
    const quickstart = readFileSync(
      'src/components/pages/QuickstartPage.astro',
      'utf8'
    );
    expect(quickstart).toContain('npx skills add Cabuya/cabuya-skill');
  });
});
