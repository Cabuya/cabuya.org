<script lang="ts">
/**
 * A persistent, dismissible route into the application.
 *
 * Corag's argument is that saying you are transparent is easy and publishing
 * the receipt is not. A CTA that blinks, blocks the text or cannot be closed
 * would contradict that. Each rule below keeps it on the right side of that
 * line:
 *
 *   1. It appears once the visitor has scrolled a little — attention is earned,
 *      but the bar is low so short pages still get a window to show it.
 *   2. Dismissal survives in-tab page navigations, but a full reload clears it
 *      so the ask can return.
 *   3. It hides while a real in-content invitation is substantially on screen,
 *      so the visitor is never asked for the same thing twice at once.
 *   4. It hides when the footer reaches the pill's bottom strip, rather than
 *      cover those links — without vanishing for most of a short page.
 *   5. It does not animate under `prefers-reduced-motion`.
 */
import { onDestroy, onMount } from 'svelte';
import { APP_PATHS, appUrl } from '@/lib/constances';
import { getTranslations } from '@/lib/translations';

export let lang: string = 'es';

/**
 * Survives Astro full-document navigations within the tab, but is cleared on
 * reload (see `isBrowserReload`).
 */
const DISMISS_KEY = 'corag:app-cta-dismissed';
/** Pixels scrolled before the pill may appear. */
const REVEAL_PX = 120;
/**
 * How much of an in-content invite must be visible before we yield to it.
 * A tiny peek at the edge of the viewport should not kill the floating ask.
 */
const INVITE_HIDE_RATIO = 0.2;
/** Footer top must enter this many px from the bottom before we hide. */
const FOOTER_HIDE_INSET_PX = 96;

let visible = false;
let dismissed = false;
/** True while an `AppInvite` block or the footer occupies the CTA strip. */
let suppressed = false;
let reduceMotion = false;

let ticking = false;
let footerEl: HTMLElement | null = null;

$: t = getTranslations(lang);

function isBrowserReload(): boolean {
  const entry = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined;
  if (entry) return entry.type === 'reload';
  // Legacy PathNavigationTiming fallback (Safari < 15).
  const legacy = (
    performance as Performance & { navigation?: { type?: number } }
  ).navigation;
  return legacy?.type === 1;
}

function readDismissal(): boolean {
  try {
    if (isBrowserReload()) {
      window.sessionStorage.removeItem(DISMISS_KEY);
      return false;
    }
    return window.sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    // Storage disabled (private mode) — dismissal only lasts this document.
    return false;
  }
}

function dismiss() {
  dismissed = true;
  visible = false;
  try {
    window.sessionStorage.setItem(DISMISS_KEY, '1');
  } catch {
    // Nothing to persist; in-memory flag still holds until next navigation.
  }
}

function footerCoversCta(): boolean {
  if (!footerEl) return false;
  return (
    footerEl.getBoundingClientRect().top <
    window.innerHeight - FOOTER_HIDE_INSET_PX
  );
}

function inviteOnScreen(): boolean {
  const vh = window.innerHeight;
  for (const node of document.querySelectorAll('[data-app-invite]')) {
    const r = node.getBoundingClientRect();
    const visiblePx = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    if (visiblePx <= 0) continue;
    if (visiblePx / Math.min(r.height || 1, vh) >= INVITE_HIDE_RATIO)
      return true;
  }
  return false;
}

function evaluate() {
  ticking = false;
  if (dismissed) return;
  visible = window.scrollY >= REVEAL_PX;
  suppressed = inviteOnScreen() || footerCoversCta();
}

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(evaluate);
}

onMount(() => {
  dismissed = readDismissal();
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  footerEl = document.querySelector('footer');

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  evaluate();
});

onDestroy(() => {
  if (typeof window === 'undefined') return;
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onScroll);
});

$: shown = visible && !dismissed && !suppressed;
</script>

<div
  class="floating-cta {shown ? 'is-shown' : ''} {reduceMotion ? 'is-static' : ''}"
  aria-hidden={!shown}
>
  <div class="floating-cta__inner">
    <p class="floating-cta__lead">{t.appCta.floating.lead}</p>

    <a
      href={appUrl(APP_PATHS.home)}
      class="floating-cta__action"
      tabindex={shown ? 0 : -1}
      data-umami-event="app_cta_click"
      data-umami-event-surface="floating"
    >
      <svg class="floating-cta__heart" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 21s-7.5-4.6-9.6-9A5.6 5.6 0 0 1 12 6.2 5.6 5.6 0 0 1 21.6 12c-2.1 4.4-9.6 9-9.6 9z" />
      </svg>
      {t.appCta.floating.action}
    </a>

    <button
      type="button"
      class="floating-cta__dismiss"
      aria-label={t.appCta.floating.dismiss}
      tabindex={shown ? 0 : -1}
      on:click={dismiss}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</div>

<style>
  .floating-cta {
    position: fixed;
    z-index: 40;
    opacity: 0;
    pointer-events: none;
    transition:
      opacity 200ms ease,
      transform 200ms ease;
  }

  .floating-cta.is-shown {
    opacity: 1;
    pointer-events: auto;
  }

  .floating-cta.is-static {
    transition: none;
  }

  .floating-cta__inner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: var(--color-cabuya-bg-elevated);
    border: 1px solid var(--color-cabuya-border);
    box-shadow: 0 12px 32px -12px rgb(0 0 0 / 0.35);
  }

  .floating-cta__lead {
    color: var(--color-cabuya-secondary);
    font-size: 0.875rem;
    line-height: 1.35;
  }

  .floating-cta__action {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
    min-height: 44px;
    padding: 0.5rem 1.25rem;
    border-radius: 9999px;
    background: var(--color-cabuya-fill);
    color: var(--color-cabuya-on-fill);
    font-weight: 600;
    white-space: nowrap;
    transition: background-color 150ms ease;
  }

  .floating-cta__action:hover {
    background: var(--color-cabuya-fill-strong);
  }

  .floating-cta__action:focus-visible,
  .floating-cta__dismiss:focus-visible {
    outline: 2px solid var(--color-cabuya-primary);
    outline-offset: 2px;
  }

  .floating-cta__heart {
    width: 1.05rem;
    height: 1.05rem;
    flex-shrink: 0;
  }

  .floating-cta__dismiss {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 9999px;
    color: var(--color-cabuya-secondary);
    cursor: pointer;
  }

  .floating-cta__dismiss:hover {
    background: var(--color-cabuya-primary-soft);
  }

  .floating-cta__dismiss svg {
    width: 1rem;
    height: 1rem;
  }

  /*
    Mobile: a bar anchored to the bottom edge, where the thumb already lives.
    It spans the width because at 390px a floating pill either truncates the
    line or crowds the content it sits over.
  */
  @media (max-width: 767px) {
    .floating-cta {
      left: 0;
      right: 0;
      bottom: 0;
      transform: translateY(0.5rem);
      padding-bottom: env(safe-area-inset-bottom);
      background: var(--color-cabuya-bg-elevated);
      border-top: 1px solid var(--color-cabuya-border);
    }

    .floating-cta.is-shown {
      transform: translateY(0);
    }

    .floating-cta__inner {
      border: 0;
      box-shadow: none;
      background: transparent;
      padding: 0.625rem 0.75rem;
    }

    /*
      No room for the argument at 390px: it left ~125px for the text, which
      truncated to "Ofrece ayuda o pide la que…". A cut-off argument is worse
      than none, so mobile keeps only the door, and the button label carries
      both intents on its own.
    */
    .floating-cta__lead {
      display: none;
    }

    .floating-cta__action {
      flex: 1;
      justify-content: center;
    }
  }

  /* Desktop: a small pill out of the reading column, bottom-right. */
  @media (min-width: 768px) {
    .floating-cta {
      right: 1.5rem;
      bottom: 1.5rem;
      /* Wide enough that the lead wraps to two lines rather than four: the
         action label and the close button claim ~330px of it. */
      max-width: min(32rem, calc(100vw - 3rem));
      transform: translateY(0.75rem);
    }

    .floating-cta.is-shown {
      transform: translateY(0);
    }

    .floating-cta__lead {
      flex: 1 1 auto;
      min-width: 9rem;
    }

    .floating-cta__inner {
      border-radius: 9999px;
      padding: 0.5rem 0.5rem 0.5rem 1.25rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .floating-cta {
      transition: none;
      transform: none;
    }
  }
</style>
