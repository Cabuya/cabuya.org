<script lang="ts">
/**
 * The site header.
 *
 * Three deliberate choices:
 *
 * 1. **Disclosure, not a menu.** Dropdowns use `aria-expanded` on a real
 *    `<button>` revealing a plain list of links. `role="menu"` implies the
 *    desktop-application menu model — arrow-key roving focus, typeahead,
 *    Escape semantics a screen reader announces as an application menu — and
 *    almost every site that reaches for it implements a tenth of that. A
 *    disclosure is what this actually is: a button that shows some links.
 *
 * 2. **Nav is data, not markup.** Groups come from `site-navigation.ts`, where
 *    each route carries a `live`/`planned` status. Routes appear here the day
 *    they exist and not before, so the header can never advertise a 404.
 *
 * 3. **The language switcher maps the path.** No persistence, no sniffing: a
 *    shared URL lands the recipient on the language it names (D-W1).
 */
import { onMount } from 'svelte';

import type { Language } from '@/lib/i18n';
import {
  GITHUB_URL,
  liveGroups,
  type NavGroup,
  navHref,
  SKILL_REPO_URL,
  switchLanguagePath,
} from '@/lib/site-navigation';

import ThemeToggle from './ThemeToggle.svelte';

export let lang: Language;
/** Current path, so active state and the switcher work without reading location. */
export let pathname = '/';
/** Injectable for tests; defaults to whatever is live today. */
export let groups: NavGroup[] = liveGroups();

/**
 * The three strings this component says, passed in rather than looked up.
 *
 * `getTranslations` reaches both translation modules, and a bundler cannot
 * tree-shake a lookup by key out of an object literal — so importing it here
 * put **73 KB of copy for two languages into the header island** to render
 * three labels. 26 KB gzipped, on every page of the site, for the word "Menu".
 *
 * The Astro side has the translations at build time for free. Passing three
 * strings across the island boundary costs three strings.
 */
export let labels: {
  openMenu: string;
  closeMenu: string;
  switchToLanguage: string;
  /** Accessible names for the two repository links. */
  repoSite: string;
  repoSkill: string;
  /** Forwarded to the theme toggle, which is in this island's chunk. */
  toDark: string;
  toLight: string;
};

/**
 * The two repositories, in the header because this is a protocol project and
 * the source is the product. Names rather than two identical marks: the whole
 * point is that they are different repositories, and an icon repeated twice
 * says the opposite. The names collapse below `xl`, where the mark and the
 * accessible name carry it.
 */
$: repos = [
  { href: GITHUB_URL, name: 'cabuya.org', label: labels.repoSite },
  { href: SKILL_REPO_URL, name: 'cabuya-skill', label: labels.repoSkill },
];
$: other = (lang === 'es' ? 'en' : 'es') as Language;
$: switchHref = switchLanguagePath(pathname, other);

/** id of the open disclosure, or null. Only one is open at a time. */
let openGroup: string | null = null;
let drawerOpen = false;
let drawerEl: HTMLElement | undefined;
let toggleEl: HTMLButtonElement | undefined;

const isActive = (path: string | undefined): boolean => {
  if (!path) return false;
  const bare = pathname.replace(/^\/es(?=\/|$)/, '') || '/';
  return bare === path || bare.startsWith(`${path}/`);
};

const groupActive = (group: NavGroup): boolean =>
  isActive(group.path) ||
  (group.children ?? []).some((child) => isActive(child.path));

function toggleGroup(id: string): void {
  openGroup = openGroup === id ? null : id;
}

function closeAll(): void {
  openGroup = null;
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return;
  if (drawerOpen) {
    drawerOpen = false;
    toggleEl?.focus();
    return;
  }
  if (openGroup) {
    const button = document.getElementById(`nav-disclosure-${openGroup}`);
    closeAll();
    button?.focus();
  }
}

/**
 * Focus stays inside the drawer while it is open.
 *
 * Without this, tabbing past the last link walks into the page behind an
 * opaque overlay — the keyboard user is somewhere they cannot see.
 */
function trapFocus(event: KeyboardEvent): void {
  if (!drawerOpen || event.key !== 'Tab' || !drawerEl) return;
  const focusable = drawerEl.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled])'
  );
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

$: if (typeof document !== 'undefined') {
  document.documentElement.classList.toggle('overflow-hidden', drawerOpen);
}

onMount(() => {
  // Pointer-outside closes an open disclosure. Keyboard users get Escape.
  const onPointerDown = (event: PointerEvent): void => {
    if (!openGroup) return;
    const target = event.target as HTMLElement | null;
    if (!target?.closest('[data-disclosure]')) closeAll();
  };
  document.addEventListener('pointerdown', onPointerDown);
  return () => document.removeEventListener('pointerdown', onPointerDown);
});
</script>

<svelte:window on:keydown={onKeydown} />

<!--
  Stickiness lives on the chrome wrapper in MainLayout, which also holds the
  spec-status banner: the two must move together, and the ResizeObserver that
  keeps `--cabuya-chrome-height` honest measures that wrapper.
-->
<header class="border-b border-cabuya-border bg-cabuya-bg/85 backdrop-blur">
  <div class="main-container flex items-center justify-between gap-4 py-3">
    <a
      href={lang === 'en' ? '/' : `/${lang}`}
      class="flex min-h-11 shrink-0 items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cabuya-primary"
      aria-label="Cabuya"
    >
      <img
        src="/images/brand/cabuya-isologo.webp"
        alt=""
        width="34"
        height="34"
        class="h-[34px] w-[34px]"
      />
      <span class="font-display text-lg font-bold tracking-tight text-cabuya-primary">
        Cabuya
      </span>
    </a>

    <!-- Desktop navigation -->
    <nav aria-label="Main" class="hidden items-center gap-1 lg:flex">
      {#each groups as group (group.id)}
        {#if group.children?.length}
          <div class="relative" data-disclosure>
            <button
              id="nav-disclosure-{group.id}"
              type="button"
              class="nav-link inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cabuya-primary"
              class:is-active={groupActive(group)}
              aria-expanded={openGroup === group.id}
              aria-controls="nav-panel-{group.id}"
              on:click={() => toggleGroup(group.id)}
            >
              {group.label[lang] ?? group.label.en}
              <svg
                class="h-3 w-3 transition-transform duration-150"
                class:rotate-180={openGroup === group.id}
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                aria-hidden="true"
              >
                <path d="M2.5 4.5L6 8l3.5-3.5" stroke-linecap="round" />
              </svg>
            </button>
            {#if openGroup === group.id}
              <div
                id="nav-panel-{group.id}"
                class="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-cabuya-border bg-cabuya-bg-elevated p-2 shadow-lg"
              >
                <ul class="flex flex-col">
                  {#each group.children as child (child.path)}
                    <li>
                      <a
                        href={navHref(child, lang)}
                        class="block rounded-lg px-3 py-2 transition-colors hover:bg-cabuya-bg-brand focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-cabuya-primary"
                        aria-current={isActive(child.path) ? 'page' : undefined}
                        on:click={closeAll}
                      >
                        <span class="block text-sm font-medium text-cabuya-text">
                          {child.label[lang] ?? child.label.en}
                        </span>
                        {#if child.hint}
                          <span class="block text-xs text-cabuya-text-secondary">
                            {child.hint[lang] ?? child.hint.en}
                          </span>
                        {/if}
                      </a>
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}
          </div>
        {:else if group.path}
          <a
            href={navHref({ path: group.path }, lang)}
            class="nav-link inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cabuya-primary"
            class:is-active={groupActive(group)}
            aria-current={isActive(group.path) ? 'page' : undefined}
          >
            {group.label[lang] ?? group.label.en}
          </a>
        {/if}
      {/each}
    </nav>

    <div class="flex items-center gap-1 sm:gap-2">
      <span class="mr-1 hidden items-center gap-1 lg:flex">
        {#each repos as repo (repo.href)}
          <a
            href={repo.href}
            rel="noopener"
            target="_blank"
            title={repo.label}
            aria-label={repo.label}
            class="nav-link inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cabuya-primary"
          >
            <svg
              class="h-[18px] w-[18px] shrink-0"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
              />
            </svg>
            <span class="hidden xl:inline">{repo.name}</span>
          </a>
        {/each}
      </span>

      <a
        href={switchHref}
        class="nav-link inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cabuya-primary"
        hreflang={other}
        lang={other}
        aria-label={labels.switchToLanguage}
      >
        {other.toUpperCase()}
      </a>
      <ThemeToggle
        labels={{ toDark: labels.toDark, toLight: labels.toLight }}
      />

      {#if groups.length > 0}
        <button
          bind:this={toggleEl}
          type="button"
          class="nav-link inline-flex h-10 w-10 items-center justify-center rounded-md lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cabuya-primary"
          aria-expanded={drawerOpen}
          aria-controls="mobile-drawer"
          aria-label={drawerOpen ? labels.closeMenu : labels.openMenu}
          on:click={() => (drawerOpen = !drawerOpen)}
        >
          <svg
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            aria-hidden="true"
          >
            {#if drawerOpen}
              <path d="M5 5l10 10M15 5L5 15" />
            {:else}
              <path d="M3 6h14M3 10h14M3 14h14" />
            {/if}
          </svg>
        </button>
      {/if}
    </div>
  </div>

  <!-- Mobile drawer -->
  {#if drawerOpen}
    <div
      id="mobile-drawer"
      bind:this={drawerEl}
      class="border-t border-cabuya-border bg-cabuya-bg-elevated lg:hidden"
      on:keydown={trapFocus}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      aria-label={labels.openMenu}
    >
      <nav aria-label="Main" class="main-container py-4">
        <ul class="flex flex-col gap-1">
          {#each groups as group (group.id)}
            <li>
              {#if group.path}
                <a
                  href={navHref({ path: group.path }, lang)}
                  class="block rounded-lg px-3 py-2.5 text-base font-medium text-cabuya-text hover:bg-cabuya-bg-brand focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-cabuya-primary"
                  aria-current={isActive(group.path) ? 'page' : undefined}
                  on:click={() => (drawerOpen = false)}
                >
                  {group.label[lang] ?? group.label.en}
                </a>
              {:else}
                <p
                  class="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-cabuya-text-muted"
                >
                  {group.label[lang] ?? group.label.en}
                </p>
              {/if}
              {#if group.children?.length}
                <ul class="flex flex-col">
                  {#each group.children as child (child.path)}
                    <li>
                      <a
                        href={navHref(child, lang)}
                        class="block rounded-lg px-3 py-2 text-sm text-cabuya-text-secondary hover:bg-cabuya-bg-brand focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-cabuya-primary"
                        aria-current={isActive(child.path) ? 'page' : undefined}
                        on:click={() => (drawerOpen = false)}
                      >
                        {child.label[lang] ?? child.label.en}
                      </a>
                    </li>
                  {/each}
                </ul>
              {/if}
            </li>
          {/each}
          <li class="mt-2 border-t border-cabuya-border pt-2">
            {#each repos as repo (repo.href)}
              <a
                href={repo.href}
                rel="noopener"
                target="_blank"
                aria-label={repo.label}
                class="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-cabuya-text-secondary hover:bg-cabuya-bg-brand focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-cabuya-primary"
                on:click={() => (drawerOpen = false)}
              >
                <svg
                  class="h-4 w-4 shrink-0"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
                  />
                </svg>
                {repo.name}
              </a>
            {/each}
          </li>
        </ul>
      </nav>
    </div>
  {/if}
</header>

<style>
  .is-active {
    color: var(--color-cabuya-primary);
  }
</style>
