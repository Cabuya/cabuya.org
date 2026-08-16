<script lang="ts">
import { onMount } from 'svelte';
import { EVENTS, trackEvent } from '@/lib/analytics';
import { APP_PATHS, appUrl } from '@/lib/constances';
import {
  getLanguageConfig,
  getSupportedLanguages,
  getUrlPrefix,
  stripLangPrefix,
} from '@/lib/i18n';
import { LANGUAGE_STORAGE_KEY } from '@/lib/language-preference';
import { getTranslations } from '@/lib/translations';
import MobileMenu from './MobileMenu.svelte';
import ThemeToggle from './ThemeToggle.svelte';

export let lang: string = 'es';
let open: boolean = false;
let howOpen = false;
let communityOpen = false;
let languageOpen = false;

$: t = getTranslations(lang);
$: prefix = getUrlPrefix(lang);
$: otherLanguages = getSupportedLanguages().filter((l) => l !== lang);

let alternateLanguageUrls: {
  lang: string;
  url: string;
  flag: string;
  nativeName: string;
}[] = [];

onMount(() => {
  const path = window.location.pathname;
  const basePath = stripLangPrefix(path);

  alternateLanguageUrls = otherLanguages.map((l) => {
    const config = getLanguageConfig(l);
    const url =
      basePath === '/'
        ? config.urlPrefix || '/'
        : `${config.urlPrefix}${basePath}`;
    return { lang: l, url, flag: config.flag, nativeName: config.nativeName };
  });
});

/** Soft preference only — does not force redirects (URL is source of truth). */
function rememberLanguage(target: string) {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, target);
  } catch {
    // Storage disabled (private mode) — the switch still navigates.
  }
}

function toggleMenu() {
  open = !open;
  trackEvent(EVENTS.MOBILE_MENU_TOGGLE, { action: open ? 'open' : 'close' });
}

function openDropdown(which: string) {
  howOpen = which === 'how';
  communityOpen = which === 'community';
  languageOpen = which === 'language';
}

function closeAllDropdowns() {
  howOpen = false;
  communityOpen = false;
  languageOpen = false;
}
</script>

<svelte:window on:click={closeAllDropdowns} />

<header
  class="border-b transition-colors duration-300 bg-corag-bg-elevated/95 text-corag border-corag-border shadow-sm shadow-corag-primary/5 backdrop-blur-md dark:bg-corag-bg-dark/95 dark:text-white dark:border-white/10 dark:shadow-black/30"
  style="padding-top: env(safe-area-inset-top); padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right);"
>
  <nav class="main-container flex items-center justify-between">
    <a
      href={prefix || '/'}
      class="flex items-center select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corag-primary"
      aria-label="Corag"
    >
      <img
        class="h-8 w-auto md:h-9 dark:hidden"
        src="/images/brand/corag-wordmark.webp"
        alt=""
        width={342}
        height={100}
        loading="eager"
        decoding="async"
      />
      <img
        class="hidden h-8 w-auto md:h-9 dark:block"
        src="/images/brand/corag-wordmark-light.webp"
        alt=""
        width={342}
        height={100}
        loading="eager"
        decoding="async"
      />
    </a>

    <div class="hidden lg:flex items-center gap-6">
      <!-- How Corag works — institutional model pages (matches footer column). -->
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
      <div
        role="group"
        class="relative group"
        on:mouseenter={() => openDropdown('how')}
        on:mouseleave={() => howOpen = false}
        on:click|stopPropagation={() => {}}
      >
        <button
          class="nav-link flex items-center gap-1 cursor-pointer select-none"
          aria-expanded={howOpen}
          aria-haspopup="true"
          aria-controls="how-dropdown"
          type="button"
          on:click={() => howOpen ? closeAllDropdowns() : openDropdown('how')}
        >
          {t.nav.howCoragWorks}
          <svg
            class="w-4 h-4 transition-transform duration-200"
            style="transform: rotate({howOpen ? '180deg' : '0deg'});"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        {#if howOpen}
          <div
            class="absolute left-1/2 -translate-x-1/2 top-full w-64"
            style="height: 12px; pointer-events: auto;"
          ></div>
          <div
            id="how-dropdown"
            class="absolute left-1/2 -translate-x-1/2 top-full w-64 bg-corag-bg-elevated text-corag rounded shadow-lg z-50 overflow-hidden transition-all duration-200"
            style="pointer-events: auto; opacity: 1; transform: translateY(12px);"
          >
            <a href="{prefix}/how-it-works" class="block px-4 py-2 hover:bg-corag-primary-soft text-corag-secondary transition" on:click={() => trackEvent(EVENTS.NAV_CLICK, { item: 'how-it-works' })}>{t.nav.howItWorks}</a>
            <a href="{prefix}/transparency" class="block px-4 py-2 hover:bg-corag-primary-soft text-corag-secondary transition" on:click={() => trackEvent(EVENTS.NAV_CLICK, { item: 'transparency' })}>{t.nav.transparency}</a>
            <a href="{prefix}/emergencies" class="block px-4 py-2 hover:bg-corag-primary-soft text-corag-secondary transition" on:click={() => trackEvent(EVENTS.NAV_CLICK, { item: 'emergencies' })}>{t.nav.emergencies}</a>
            <a href="{prefix}/leaders" class="block px-4 py-2 hover:bg-corag-primary-soft text-corag-secondary transition" on:click={() => trackEvent(EVENTS.NAV_CLICK, { item: 'leaders' })}>{t.nav.leaders}</a>
            <a href="{prefix}/partners" class="block px-4 py-2 hover:bg-corag-primary-soft text-corag-secondary transition" on:click={() => trackEvent(EVENTS.NAV_CLICK, { item: 'partners' })}>{t.nav.partners}</a>
            <a href="{prefix}/ecosystem" class="block px-4 py-2 hover:bg-corag-primary-soft text-corag-secondary transition" on:click={() => trackEvent(EVENTS.NAV_CLICK, { item: 'ecosystem' })}>{t.nav.ecosystem}</a>
            <a href="{prefix}/developers" class="block px-4 py-2 hover:bg-corag-primary-soft text-corag-secondary transition" on:click={() => trackEvent(EVENTS.NAV_CLICK, { item: 'developers' })}>{t.nav.developers}</a>
          </div>
        {/if}
      </div>

      <!-- Community — people, channels, and policy pages. -->
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
      <div
        role="group"
        class="relative group"
        on:mouseenter={() => openDropdown('community')}
        on:mouseleave={() => communityOpen = false}
        on:click|stopPropagation={() => {}}
      >
        <button
          class="nav-link flex items-center gap-1 cursor-pointer select-none"
          aria-expanded={communityOpen}
          aria-haspopup="true"
          aria-controls="community-dropdown"
          type="button"
          on:click={() => communityOpen ? closeAllDropdowns() : openDropdown('community')}
        >
          {t.nav.community}
          <svg
            class="w-4 h-4 transition-transform duration-200"
            style="transform: rotate({communityOpen ? '180deg' : '0deg'});"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        {#if communityOpen}
          <div
            class="absolute left-1/2 -translate-x-1/2 top-full w-64"
            style="height: 12px; pointer-events: auto;"
          ></div>
          <div
            id="community-dropdown"
            class="absolute left-1/2 -translate-x-1/2 top-full w-64 bg-corag-bg-elevated text-corag rounded shadow-lg z-50 overflow-hidden transition-all duration-200"
            style="pointer-events: auto; opacity: 1; transform: translateY(12px);"
          >
            <a href="{prefix}/about" class="block px-4 py-2 hover:bg-corag-primary-soft text-corag-secondary transition" on:click={() => trackEvent(EVENTS.NAV_CLICK, { item: 'about' })}>{t.nav.about}</a>
            <a href="{prefix}/movement" class="block px-4 py-2 hover:bg-corag-primary-soft text-corag-secondary transition" on:click={() => trackEvent(EVENTS.NAV_CLICK, { item: 'movement' })}>{t.nav.movement}</a>
            <a href="{prefix}/channels" class="block px-4 py-2 hover:bg-corag-primary-soft text-corag-secondary transition" on:click={() => trackEvent(EVENTS.NAV_CLICK, { item: 'channels' })}>{t.nav.channels}</a>
            <a href="{prefix}/contributing" class="block px-4 py-2 hover:bg-corag-primary-soft text-corag-secondary transition" on:click={() => trackEvent(EVENTS.NAV_CLICK, { item: 'contributing' })}>{t.nav.contributing}</a>
            <a href="{prefix}/governance" class="block px-4 py-2 hover:bg-corag-primary-soft text-corag-secondary transition" on:click={() => trackEvent(EVENTS.NAV_CLICK, { item: 'governance' })}>{t.nav.governance}</a>
            <a href="{prefix}/conduct" class="block px-4 py-2 hover:bg-corag-primary-soft text-corag-secondary transition" on:click={() => trackEvent(EVENTS.NAV_CLICK, { item: 'conduct' })}>{t.nav.conduct}</a>
            <a href="{prefix}/privacy" class="block px-4 py-2 hover:bg-corag-primary-soft text-corag-secondary transition" on:click={() => trackEvent(EVENTS.NAV_CLICK, { item: 'privacy' })}>{t.nav.privacy}</a>
          </div>
        {/if}
      </div>

      <a href="{prefix}/blog" class="nav-link" on:click={() => trackEvent(EVENTS.NAV_CLICK, { item: 'blog' })}>{t.nav.blog}</a>
      <a href="{prefix}/contact" class="nav-link" on:click={() => trackEvent(EVENTS.NAV_CLICK, { item: 'contact' })}>{t.nav.contact}</a>

      <!-- The application. Every transactional action happens there, so this is
           the primary action in the chrome. -->
      <a
        href={appUrl(APP_PATHS.home)}
        class="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-corag-fill px-5 py-2 font-semibold text-corag-on-fill transition-colors hover:bg-corag-fill-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corag-primary"
        data-umami-event="app_cta_click"
        data-umami-event-surface="header-desktop"
      >
        <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 21s-7.5-4.6-9.6-9A5.6 5.6 0 0 1 12 6.2 5.6 5.6 0 0 1 21.6 12c-2.1 4.4-9.6 9-9.6 9z" />
        </svg>
        {t.nav.app}
      </a>

      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
      <div
        role="group"
        class="relative group"
        on:mouseenter={() => openDropdown('language')}
        on:mouseleave={() => languageOpen = false}
        on:click|stopPropagation={() => {}}
      >
        <button
          class="nav-link flex items-center gap-1 cursor-pointer select-none"
          aria-expanded={languageOpen}
          aria-haspopup="true"
          aria-controls="language-dropdown"
          type="button"
          on:click={() => languageOpen ? closeAllDropdowns() : openDropdown('language')}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          {lang.toUpperCase()}
          <svg
            class="w-4 h-4 transition-transform duration-200"
            style="transform: rotate({languageOpen ? '180deg' : '0deg'});"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        {#if languageOpen}
          <div
            class="absolute left-1/2 -translate-x-1/2 top-full w-20"
            style="height: 12px; pointer-events: auto;"
          ></div>
          <div
            id="language-dropdown"
            class="absolute left-1/2 -translate-x-1/2 top-full w-20 bg-corag-bg-elevated text-corag rounded shadow-lg z-50 overflow-hidden transition-all duration-200"
            style="pointer-events: auto; opacity: 1; transform: translateY(12px);"
          >
            {#each alternateLanguageUrls as alt}
              <a href={alt.url} class="block w-full text-center px-3 py-2 hover:bg-corag-primary-soft text-corag-secondary transition" on:click={() => {
                rememberLanguage(alt.lang);
                trackEvent(EVENTS.LANGUAGE_SWITCH, { from: lang, to: alt.lang });
              }}>
                {alt.lang.toUpperCase()}
              </a>
            {/each}
          </div>
        {/if}
      </div>

      <ThemeToggle {lang} placement="header" />
    </div>

    <!--
      Below lg the desktop nav is hidden, and with it the only route to the
      application: measured at 390px and 768px, zero app CTAs were visible, and
      the one inside the mobile menu sat below the fold. This pill restores on
      mobile what the desktop chrome always had. It abbreviates under 400px so
      it can never push the wordmark.
    -->
    <div class="flex items-center gap-1 lg:hidden {open ? 'pointer-events-none invisible' : ''}">
      <a
        href={appUrl(APP_PATHS.home)}
        class="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-corag-fill px-3.5 py-2 text-sm font-semibold text-corag-on-fill transition-colors hover:bg-corag-fill-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corag-primary sm:px-4"
        aria-label={t.appCta.shortAria}
        data-umami-event="app_cta_click"
        data-umami-event-surface="header-mobile"
      >
        <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 21s-7.5-4.6-9.6-9A5.6 5.6 0 0 1 12 6.2 5.6 5.6 0 0 1 21.6 12c-2.1 4.4-9.6 9-9.6 9z" />
        </svg>
        <span>{t.appCta.short}</span>
      </a>

    <button
      class="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center p-2 {open
        ? 'pointer-events-none invisible'
        : 'block'}"
      aria-label={t.nav.openMenu}
      aria-expanded={open}
      aria-controls="mobile-menu"
      on:click={toggleMenu}
      type="button"
    >
      <svg class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    </div>
  </nav>
  <MobileMenu {lang} {open} {toggleMenu} />
</header>
