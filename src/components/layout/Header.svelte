<script lang="ts">
/**
 * Minimal migration header (Task 7). The full portal shell — grouped nav,
 * disclosure dropdowns, mobile drawer — ships in Task 18. With a
 * two-entry nav there is nothing to collapse, so no mobile menu yet.
 */
import type { Language } from '@/lib/i18n';
import { NAV_ENTRIES, navHref } from '@/lib/site-navigation';
import { getTranslations } from '@/lib/translations';
import ThemeToggle from './ThemeToggle.svelte';

export let lang: Language;

$: t = getTranslations(lang);
$: entries = NAV_ENTRIES.filter((e) => e.inChrome);
/** The same route in the other language (home-only surface for now). */
$: switchHref = lang === 'es' ? '/en/' : '/';
</script>

<header
  class="border-b border-cabuya-border bg-cabuya-bg-elevated/90 backdrop-blur"
>
  <div class="main-container flex items-center justify-between gap-4 py-3">
    <a
      href={lang === 'en' ? '/' : `/${lang}/`}
      class="flex items-center gap-3"
      aria-label="Cabuya"
    >
      <img
        src="/images/brand/cabuya-isologo.webp"
        alt=""
        width="36"
        height="36"
        class="h-9 w-9"
      />
      <span class="font-display text-lg font-bold text-cabuya-primary"
        >Cabuya</span
      >
    </a>

    <nav aria-label="Main" class="flex items-center gap-5">
      {#each entries as entry (entry.path)}
        <a
          href={navHref(entry, lang)}
          class="nav-link text-sm font-medium"
          rel={entry.external ? 'noopener' : undefined}
          target={entry.external ? '_blank' : undefined}
        >
          {entry.label[lang] ?? entry.label.en}
        </a>
      {/each}
      <a href={switchHref} class="nav-link text-sm font-medium">
        {t.nav.switchToLanguage}
      </a>
      <ThemeToggle {lang} />
    </nav>
  </div>
</header>
