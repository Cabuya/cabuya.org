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
  liveGroups,
  type NavGroup,
  navHref,
  REPO_GROUP,
  switchLanguagePath,
} from '@/lib/site-navigation';

import ThemeToggle from './ThemeToggle.svelte';

export let lang: Language;
/** Current path, so active state and the switcher work without reading location. */
export let pathname = '/';
/** Which theme preference the toggle writes — the portal keeps its own. */
export let themeScope: 'site' | 'docs' = 'site';
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
  /** Names what the switcher selects, in the page's own language. */
  language: string;
  switchToLanguage: string;
  /** Forwarded to the theme toggle, which is in this island's chunk. */
  toDark: string;
  toLight: string;
};

/**
 * The nav as rendered: the live groups, then the repositories.
 *
 * `REPO_GROUP` is appended here rather than living in `NAV_GROUPS` — see the
 * note on it in `site-navigation.ts`. Appending means it inherits the
 * disclosure markup, the hover and keyboard behaviour and the panel styling
 * instead of growing a second copy of all three.
 */
$: navGroups = [...groups, REPO_GROUP];
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

/**
 * Hover opens the disclosures, click and keyboard still do everything.
 *
 * Two guards make this safe rather than the usual hover-menu trap:
 *
 * - **Pointer check.** `(hover: hover) and (pointer: fine)` keeps it to mice
 *   and trackpads. On a touch screen a tap synthesises `mouseenter` right
 *   before `click`, which would open and immediately close the panel.
 * - **Close delay.** There is a 4px gap between the button and the panel, so
 *   a straight-line pointer move fires `mouseleave` in transit. 150 ms of
 *   patience covers the gap without the panel feeling stuck open.
 *
 * `aria-expanded` still tells the truth either way, and the button remains a
 * real button: hover is an accelerator, never the only way in.
 */
let hoverTimer: ReturnType<typeof setTimeout> | undefined;

const canHover = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function hoverOpen(id: string): void {
  if (!canHover()) return;
  clearTimeout(hoverTimer);
  openGroup = id;
}

function hoverClose(): void {
  if (!canHover()) return;
  clearTimeout(hoverTimer);
  hoverTimer = setTimeout(closeAll, 150);
}

/**
 * A pointer click on a trigger that hover already opened must not close it.
 *
 * Reaching the button with a mouse fires `mouseenter` first, so a plain
 * toggle would open on approach and close on the click — the panel would
 * appear to be broken for the most ordinary interaction there is. On a
 * hover-capable pointer the click therefore only ever opens; leaving closes.
 *
 * `event.detail` separates the two callers: a real pointer click reports the
 * click count, a keyboard-activated one reports 0. Enter and Space keep the
 * toggle, so a keyboard user can still close what they opened without
 * reaching for Escape.
 */
function onTriggerClick(event: MouseEvent, id: string): void {
  if (event.detail > 0 && canHover()) {
    clearTimeout(hoverTimer);
    openGroup = id;
    return;
  }
  toggleGroup(id);
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
      {#each navGroups as group (group.id)}
        {#if group.children?.length}
          <!--
            The hover handlers sit on a plain wrapper on purpose. They are a
            pointer-only convenience: the disclosure's actual control is the
            button below, which carries the role, the `aria-expanded` state and
            the full click and keyboard path. Giving this div a role would put
            an element in the accessibility tree that announces nothing and
            does nothing for anyone not using a mouse.
          -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="relative"
            data-disclosure
            on:mouseenter={() => hoverOpen(group.id)}
            on:mouseleave={hoverClose}
          >
            <button
              id="nav-disclosure-{group.id}"
              type="button"
              class="nav-link inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cabuya-primary"
              class:is-active={groupActive(group)}
              aria-expanded={openGroup === group.id}
              aria-controls="nav-panel-{group.id}"
              on:click={(event) => onTriggerClick(event, group.id)}
            >
              {#if group.id === 'github'}
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
              {/if}
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
                        rel={child.external ? 'noopener' : undefined}
                        target={child.external ? '_blank' : undefined}
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

    <!--
      Keep `gap-2` (8px) as the floor: the responsive audit fails any pair of
      touch targets closer than that, and on a 320px phone this cluster is the
      densest row on the site. Only tighten from `lg`, where the repo links
      join it and the pointer is a mouse.
    -->
    <div class="flex items-center gap-2 sm:gap-3 lg:gap-1.5">
      <!--
        The language switcher: the same disclosure as the nav groups, so it
        inherits hover, Escape, pointer-outside and the one-open-at-a-time
        rule instead of growing a second copy of all four.

        The panel is always in the DOM and hidden with the `hidden` attribute
        rather than an `{#if}`. `lang:check` reads the built HTML for the
        `data-language-switch` href on every page — an unmounted panel would
        make the gate report `no-switcher` for the whole site. Keep display
        utilities off that element too: `[hidden]` only wins while nothing
        else sets `display`.
      -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="relative"
        data-disclosure
        on:mouseenter={() => hoverOpen('language')}
        on:mouseleave={hoverClose}
      >
        <button
          id="nav-disclosure-language"
          type="button"
          class="nav-link inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cabuya-primary"
          aria-expanded={openGroup === 'language'}
          aria-controls="nav-panel-language"
          on:click={(event) => onTriggerClick(event, 'language')}
        >
          <!-- Lucide `globe`, inline: the header island has no icon package. -->
          <svg
            class="h-[18px] w-[18px] shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9.5" />
            <path d="M2.5 12h19" />
            <path d="M12 2.5a14 14 0 0 1 0 19 14 14 0 0 1 0-19" />
          </svg>
          <!--
            The accessible name reads "Language: EN": the icon is decorative
            and the bare code alone would announce as a two-letter word with
            no indication of what it selects.
          -->
          <span class="sr-only">{labels.language}:</span>
          {lang.toUpperCase()}
          <!--
            The chevron is the first thing to go on a folded phone.

            At 280px the header cluster — switcher, theme toggle, drawer button —
            plus the logo overran the viewport by 13px, and `gap-2` is a floor
            rather than a knob: the responsive audit fails any pair of touch
            targets closer than 8px. Dropping the chevron below 340px buys 18px
            and costs nothing the disclosure needs: the control is still a button
            carrying `aria-expanded`, and the globe is still the affordance.
          -->
          <svg
            class="h-3 w-3 transition-transform duration-150 max-[339px]:hidden"
            class:rotate-180={openGroup === 'language'}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            aria-hidden="true"
          >
            <path d="M2.5 4.5L6 8l3.5-3.5" stroke-linecap="round" />
          </svg>
        </button>
        <div
          id="nav-panel-language"
          hidden={openGroup !== 'language'}
          class="absolute right-0 top-full z-50 mt-1 min-w-full rounded-xl border border-cabuya-border bg-cabuya-bg-elevated p-1 shadow-lg"
        >
          <a
            href={switchHref}
            class="block rounded-lg px-3 py-2 text-center text-sm font-medium text-cabuya-text transition-colors hover:bg-cabuya-bg-brand focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-cabuya-primary"
            hreflang={other}
            data-language-switch
            lang={other}
            aria-label={labels.switchToLanguage}
            on:click={closeAll}
          >
            {other.toUpperCase()}
          </a>
        </div>
      </div>
      <ThemeToggle
        labels={{ toDark: labels.toDark, toLight: labels.toLight }}
        scope={themeScope}
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
          {#each navGroups as group (group.id)}
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
                        rel={child.external ? 'noopener' : undefined}
                        target={child.external ? '_blank' : undefined}
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
