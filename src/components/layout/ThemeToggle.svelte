<script lang="ts">
/**
 * Compact theme toggle for the site header / mobile menu.
 * Persists to localStorage['theme'].
 */
import { onMount } from 'svelte';

/**
 * The two labels this button carries, passed in rather than looked up.
 *
 * Same reason as the header's: `getTranslations` reaches both translation
 * modules, and a lookup by key cannot be tree-shaken out of an object literal.
 * This one button was pulling 73 KB of site copy into the header island — and
 * it was doing it even after the header stopped, because the toggle is
 * imported by the header and a chunk is the union of what its members need.
 */
export let labels: { toDark: string; toLight: string } = {
  toDark: 'Dark mode',
  toLight: 'Light mode',
};
/** `header` sits in the desktop nav; `menu` is a larger mobile control. */
export let placement: 'header' | 'menu' = 'header';
/**
 * Which preference this button writes.
 *
 * The portal keeps its own, so a reader who wants dark docs and a light
 * landing gets both. A single global key would make this button appear to
 * work and then be overridden on the next navigation.
 */
export let scope: 'site' | 'docs' = 'site';

let isDark = false;

$: ariaLabel = isDark ? labels.toLight : labels.toDark;

onMount(() => {
  isDark = document.documentElement.classList.contains('dark');
});

function toggleTheme() {
  isDark = document.documentElement.classList.toggle('dark');
  const newTheme = isDark ? 'dark' : 'light';
  try {
    localStorage.setItem(scope === 'docs' ? 'theme:docs' : 'theme', newTheme);
  } catch {
    // Storage disabled — visual toggle still works for this session.
  }
}
</script>

<button
  type="button"
  class="theme-toggle group inline-flex cursor-pointer items-center justify-center transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cabuya-primary
    {placement === 'header'
      ? 'relative h-6 w-6 shrink-0 p-0 text-cabuya hover:text-cabuya-primary dark:text-white dark:hover:text-white/85 after:absolute after:-inset-2.5 after:content-[\'\']'
      : 'min-h-[44px] gap-2.5 rounded-full border border-cabuya-border px-4 py-2 text-base text-cabuya hover:border-cabuya-primary dark:border-white/20 dark:text-white'}"
  aria-label={ariaLabel}
  aria-pressed={isDark}
  on:click={toggleTheme}
>
  {#if isDark}
    <svg
      class="theme-toggle-icon h-5 w-5 text-cabuya-accent"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"></circle>
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      ></path>
    </svg>
  {:else}
    <svg
      class="theme-toggle-icon h-5 w-5 text-cabuya-primary"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M21 14.3A9 9 0 1 1 9.7 3a7 7 0 1 0 11.3 11.3z"
        opacity="0.95"
      ></path>
    </svg>
  {/if}
  {#if placement === 'menu'}
    <span class="font-medium">{ariaLabel}</span>
  {/if}
</button>
