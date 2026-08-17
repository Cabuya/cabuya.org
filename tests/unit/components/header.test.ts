/**
 * The header's keyboard and ARIA contract.
 *
 * These behaviours are the reason the header is an island at all — everything
 * else about it would work as static HTML. If the interactive parts are not
 * keyboard-operable there is no justification for shipping the JavaScript, so
 * the contract is tested rather than assumed:
 *
 *   - dropdowns are **disclosures** (`aria-expanded` on a real button), never
 *     `role="menu"`, which promises a keyboard model this does not implement;
 *   - Escape closes and returns focus to the control that opened it;
 *   - the mobile drawer traps Tab, so nobody lands behind an opaque overlay;
 *   - only one disclosure is open at a time.
 *
 * The nav is injected rather than taken from the live registry: most routes
 * are still unbuilt, and a test that silently passes because there is nothing
 * to render proves nothing.
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';

import Header from '@/components/layout/Header.svelte';
import type { NavGroup } from '@/lib/site-navigation';

afterEach(cleanup);

const GROUPS: NavGroup[] = [
  {
    id: 'protocol',
    label: { en: 'Protocol', es: 'Protocolo' },
    status: 'live',
    children: [
      {
        label: { en: 'Specification', es: 'Especificación' },
        path: '/developers/spec',
        status: 'live',
      },
      {
        label: { en: 'Schemas', es: 'Esquemas' },
        path: '/developers/schemas',
        status: 'live',
      },
    ],
  },
  {
    id: 'registry',
    label: { en: 'Registry', es: 'Registro' },
    path: '/registry',
    status: 'live',
  },
];

/**
 * The labels the header renders, passed in as the component now requires.
 *
 * They are props rather than a lookup because `getTranslations` reaches both
 * translation modules and cannot be tree-shaken by key — the header island was
 * carrying 73 KB of site copy to render three words.
 */
const LABELS = {
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  switchToLanguage: 'Cambiar a español',
  repoSite: 'Protocol and site repository on GitHub',
  repoSkill: 'Agent skill repository on GitHub',
  toDark: 'Switch to dark mode',
  toLight: 'Switch to light mode',
};

const mount = (props: Record<string, unknown> = {}) =>
  render(Header, {
    lang: 'en',
    pathname: '/',
    groups: GROUPS,
    labels: LABELS,
    ...props,
  });

describe('header — the disclosure pattern', () => {
  it('uses a button with aria-expanded, and no menu roles anywhere', () => {
    const { container } = mount();
    const button = screen.getByRole('button', { name: /protocol/i });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(container.querySelector('[role="menu"]')).toBeNull();
    expect(container.querySelector('[role="menuitem"]')).toBeNull();
  });

  it('reveals its links only once opened', async () => {
    mount();
    expect(screen.queryByRole('link', { name: 'Specification' })).toBeNull();
    await fireEvent.click(screen.getByRole('button', { name: /protocol/i }));
    expect(screen.getByRole('button', { name: /protocol/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByRole('link', { name: 'Specification' })).toHaveAttribute(
      'href',
      '/developers/spec'
    );
  });

  it('Escape closes it and returns focus to the button', async () => {
    mount();
    const button = screen.getByRole('button', { name: /protocol/i });
    await fireEvent.click(button);
    await fireEvent.keyDown(window, { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(button);
  });

  it('closes when a link inside it is followed', async () => {
    mount();
    const button = screen.getByRole('button', { name: /protocol/i });
    await fireEvent.click(button);
    await fireEvent.click(screen.getByRole('link', { name: 'Specification' }));
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('header — the mobile drawer', () => {
  it('opens, is labelled as a dialog, and Escape restores focus', async () => {
    mount();
    const toggle = screen.getByRole('button', { name: /open menu/i });
    await fireEvent.click(toggle);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(toggle);
  });

  it('keeps Tab inside itself while open', async () => {
    mount();
    await fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    const dialog = screen.getByRole('dialog');
    const focusable = dialog.querySelectorAll<HTMLElement>('a[href], button');
    expect(focusable.length).toBeGreaterThan(1);

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    last.focus();
    await fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(document.activeElement).toBe(first);

    first.focus();
    await fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });
});

describe('header — language and active state', () => {
  it('links to the same route in the other language', () => {
    mount({ lang: 'en', pathname: '/registry' });
    const link = screen.getByRole('link', { name: /cambiar a español/i });
    expect(link).toHaveAttribute('href', '/es/registry');
    expect(link).toHaveAttribute('hreflang', 'es');
  });

  it('marks the current page, including a nested route', () => {
    mount({ pathname: '/registry' });
    expect(screen.getByRole('link', { name: 'Registry' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('treats a Spanish path as the same route for active state', () => {
    mount({ lang: 'es', pathname: '/es/registry' });
    expect(screen.getByRole('link', { name: 'Registro' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });
});
