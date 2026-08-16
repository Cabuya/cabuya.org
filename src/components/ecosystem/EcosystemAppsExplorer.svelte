<script lang="ts">
import { onDestroy } from 'svelte';

import { EVENTS, trackEvent } from '@/lib/analytics';
import type { EcosystemCategory } from '@/lib/ecosystem-apps';
import { ECOSYSTEM_CATEGORIES } from '@/lib/ecosystem-apps';
import type { EcosystemAppView } from '@/lib/ecosystem-view';
import { resolveEcosystemDevelopersUrl } from '@/lib/ecosystem-view';

export interface EcosystemExplorerLabels {
  featuredEyebrow: string;
  featuredImageAlt: string;
  featuredImageSrc: string;
  ctaApp: string;
  ctaHow: string;
  howItWorksHref: string;
  directoryEyebrow: string;
  directoryTitle: string;
  directoryLead: string;
  categories: Record<EcosystemCategory, string>;
  categoryLeads: Record<EcosystemCategory, string>;
  whatLabel: string;
  howLabel: string;
  visit: string;
  apiDocs: string;
  disclosure: string;
  moreInfo: string;
  close: string;
  overview: string;
  features: string;
  tools: string;
  audience: string;
  coverage: string;
  limits: string;
  integrations: string;
  publicApi: string;
  publicMcp: string;
  availabilityYes: string;
  availabilityNo: string;
  availabilityUnknown: string;
  openApi: string;
  mcpEndpoint: string;
  developers: string;
  badgeApi: string;
  badgeMcp: string;
}

interface Props {
  lang: string;
  urlPrefix: string;
  featured: EcosystemAppView | null;
  groups: Record<EcosystemCategory, EcosystemAppView[]>;
  labels: EcosystemExplorerLabels;
}

let { lang, urlPrefix, featured, groups, labels }: Props = $props();

let openId = $state<string | null>(null);
let dialogEl = $state<HTMLDivElement | undefined>(undefined);
let lastFocusedEl: HTMLElement | null = null;

const focusableSelector =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const openApp = $derived(
  openId
    ? ([
        ...(featured ? [featured] : []),
        ...ECOSYSTEM_CATEGORIES.flatMap((c) => groups[c]),
      ].find((a) => a.id === openId) ?? null)
    : null
);

function availabilityLabel(value: 'yes' | 'no' | 'unknown'): string {
  if (value === 'yes') return labels.availabilityYes;
  if (value === 'no') return labels.availabilityNo;
  return labels.availabilityUnknown;
}

function availabilityClass(value: 'yes' | 'no' | 'unknown'): string {
  if (value === 'yes') {
    return 'bg-corag-primary-soft text-corag-primary dark:text-corag-primary-light';
  }
  if (value === 'no') {
    return 'bg-corag-border/60 text-corag-secondary';
  }
  return 'bg-corag-bg text-corag-secondary ring-1 ring-corag-border';
}

function trapFocus(e: KeyboardEvent): void {
  if (e.key !== 'Tab' || !dialogEl) return;
  const focusable = Array.from(
    dialogEl.querySelectorAll<HTMLElement>(focusableSelector)
  );
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function openModal(app: EcosystemAppView, surface: 'card' | 'featured'): void {
  lastFocusedEl = document.activeElement as HTMLElement | null;
  openId = app.id;
  document.body.style.overflow = 'hidden';
  window.addEventListener('keydown', onKeydown);
  trackEvent(EVENTS.ECOSYSTEM_APP_MODAL_OPEN, {
    id: app.id,
    surface,
    lang,
  });
  queueMicrotask(() => {
    dialogEl?.focus();
  });
}

function closeModal(): void {
  openId = null;
  document.body.style.overflow = '';
  window.removeEventListener('keydown', onKeydown);
  lastFocusedEl?.focus();
  lastFocusedEl = null;
}

function onKeydown(e: KeyboardEvent): void {
  if (!openId) return;
  if (e.key === 'Escape') closeModal();
  else trapFocus(e);
}

onDestroy(() => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = '';
  window.removeEventListener('keydown', onKeydown);
});

function developersHref(app: EcosystemAppView): string | undefined {
  return resolveEcosystemDevelopersUrl(
    app.integrations.developersUrl,
    urlPrefix
  );
}

function showLogo(app: EcosystemAppView): boolean {
  return !!app.logo && app.logoAuthorization !== 'text_only';
}
</script>

{#if featured}
  <section class="bg-corag-fill text-corag-on-fill">
    <div class="main-container py-14 sm:py-20">
      <p
        class="text-sm font-semibold uppercase tracking-[0.2em] text-corag-on-fill/80"
      >
        {labels.featuredEyebrow}
      </p>
      <div class="mt-6 grid items-center gap-10 lg:grid-cols-12">
        <div class="lg:col-span-7">
          <div class="flex items-center gap-4">
            {#if featured.logo}
              <img
                src={featured.logo}
                alt=""
                width="72"
                height="72"
                class="h-16 w-16 rounded-2xl border border-white/60 bg-white object-contain p-1 shadow-sm dark:border-white/70 dark:bg-white dark:shadow-black/40"
                loading="eager"
                decoding="async"
              />
            {/if}
            <div class="min-w-0">
              <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
                {featured.name}
              </h2>
              <a
                href={featured.url}
                class="mt-1 block truncate text-sm text-corag-on-fill/80 underline-offset-2 hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                {featured.displayUrl}
              </a>
            </div>
          </div>
          <p class="mt-4 text-lg font-medium text-corag-on-fill/95">
            {featured.tagline}
          </p>
          <p class="mt-4 max-w-2xl text-base leading-relaxed text-corag-on-fill/85">
            {featured.what}
          </p>
          <p class="mt-3 max-w-2xl text-base leading-relaxed text-corag-on-fill/85">
            {featured.how}
          </p>
          <div class="mt-4 flex flex-wrap gap-2">
            {#if featured.integrations.publicApi === 'yes'}
              <span
                class="inline-flex items-center rounded-full bg-corag-on-fill/15 px-3 py-1 text-xs font-semibold text-corag-on-fill"
              >
                {labels.badgeApi}
              </span>
            {/if}
            {#if featured.integrations.publicMcp === 'yes'}
              <span
                class="inline-flex items-center rounded-full bg-corag-on-fill/15 px-3 py-1 text-xs font-semibold text-corag-on-fill"
              >
                {labels.badgeMcp}
              </span>
            {/if}
          </div>
          <div class="mt-8 flex flex-wrap gap-3">
            <a
              href={featured.url}
              class="inline-flex min-h-[48px] items-center justify-center rounded-full bg-corag-on-fill px-7 text-base font-semibold text-corag-fill transition hover:opacity-90"
              rel="noopener noreferrer"
              target="_blank"
            >
              {labels.ctaApp}
            </a>
            <button
              type="button"
              class="inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-full border border-corag-on-fill/40 px-7 text-base font-semibold text-corag-on-fill transition hover:bg-corag-on-fill/10"
              onclick={() => openModal(featured, 'featured')}
            >
              {labels.moreInfo}
            </button>
            <a
              href={labels.howItWorksHref}
              class="inline-flex min-h-[48px] items-center justify-center rounded-full border border-corag-on-fill/40 px-7 text-base font-semibold text-corag-on-fill transition hover:bg-corag-on-fill/10"
            >
              {labels.ctaHow}
            </a>
          </div>
        </div>
        <div class="hidden lg:col-span-5 lg:block">
          <div
            class="relative overflow-hidden rounded-3xl border border-corag-on-fill/20 bg-corag-on-fill/5 p-2 shadow-2xl shadow-black/20"
          >
            <img
              src={labels.featuredImageSrc}
              alt={labels.featuredImageAlt}
              width="1280"
              height="800"
              class="h-auto w-full rounded-2xl"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
{/if}

<section
  id="ecosystem-directory"
  class="scroll-mt-24 border-b border-corag-border bg-corag-bg"
>
  <div class="main-container py-14 sm:py-20">
    <p
      class="text-sm font-semibold uppercase tracking-widest text-corag-primary dark:text-corag-primary-light"
    >
      {labels.directoryEyebrow}
    </p>
    <h2 class="mt-3 text-3xl font-bold tracking-tight text-corag sm:text-4xl">
      {labels.directoryTitle}
    </h2>
    <p class="mt-4 max-w-2xl text-base leading-relaxed text-corag-secondary">
      {labels.directoryLead}
    </p>

    {#each ECOSYSTEM_CATEGORIES as category (category)}
      {@const apps = groups[category]}
      {#if apps.length}
        <div class="mt-14">
          <h3 class="text-xl font-bold text-corag sm:text-2xl">
            {labels.categories[category]}
          </h3>
          <p class="mt-2 max-w-2xl text-sm text-corag-secondary">
            {labels.categoryLeads[category]}
          </p>
          <ul class="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {#each apps as app (app.id)}
              <li>
                <article
                  class="group flex h-full flex-col rounded-2xl border border-corag-border bg-corag-bg-elevated p-5 transition duration-300 hover:-translate-y-0.5 hover:border-corag-primary hover:shadow-lg hover:shadow-corag-primary/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <div class="flex items-start gap-3">
                    {#if showLogo(app)}
                      <img
                        src={app.logo}
                        alt=""
                        width="56"
                        height="56"
                        class="h-14 w-14 shrink-0 rounded-xl border border-corag-border bg-white object-contain p-0.5 shadow-sm dark:border-white/40 dark:bg-white dark:shadow-black/40"
                        loading="lazy"
                        decoding="async"
                      />
                    {:else}
                      <div
                        class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-corag-border bg-white text-sm font-bold text-corag-fill shadow-sm dark:border-white/40 dark:bg-white dark:shadow-black/40"
                        aria-hidden="true"
                      >
                        {app.monogram || app.name.slice(0, 2)}
                      </div>
                    {/if}
                    <div class="min-w-0">
                      <h4 class="text-lg font-semibold text-corag">{app.name}</h4>
                      <a
                        href={app.url}
                        class="mt-0.5 block truncate text-sm text-corag-accent-strong underline-offset-2 hover:underline"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {app.displayUrl}
                      </a>
                      <p class="mt-0.5 text-sm text-corag-secondary">
                        {app.tagline}
                      </p>
                    </div>
                  </div>
                  {#if app.integrations.publicApi === 'yes' || app.integrations.publicMcp === 'yes'}
                    <div class="mt-3 flex flex-wrap gap-1.5">
                      {#if app.integrations.publicApi === 'yes'}
                        <span
                          class="inline-flex items-center rounded-full bg-corag-primary-soft px-2.5 py-0.5 text-xs font-semibold text-corag-primary dark:text-corag-primary-light"
                        >
                          {labels.badgeApi}
                        </span>
                      {/if}
                      {#if app.integrations.publicMcp === 'yes'}
                        <span
                          class="inline-flex items-center rounded-full bg-corag-primary-soft px-2.5 py-0.5 text-xs font-semibold text-corag-primary dark:text-corag-primary-light"
                        >
                          {labels.badgeMcp}
                        </span>
                      {/if}
                    </div>
                  {/if}
                  <p class="mt-4 text-sm leading-relaxed text-corag-secondary">
                    <span class="font-semibold text-corag">{labels.whatLabel}</span>
                    {' '}{app.what}
                  </p>
                  <p class="mt-2 text-sm leading-relaxed text-corag-secondary">
                    <span class="font-semibold text-corag">{labels.howLabel}</span>
                    {' '}{app.how}
                  </p>
                  <div class="mt-auto flex flex-wrap items-center gap-3 pt-5">
                    <button
                      type="button"
                      class="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-full border border-corag-border bg-corag-bg px-5 text-sm font-semibold text-corag transition hover:border-corag-primary hover:bg-corag-primary-soft"
                      onclick={() => openModal(app, 'card')}
                    >
                      {labels.moreInfo}
                    </button>
                    <a
                      href={app.url}
                      class="inline-flex min-h-[44px] items-center justify-center rounded-full bg-corag-fill px-5 text-sm font-semibold text-corag-on-fill transition hover:bg-corag-fill-strong"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {labels.visit}
                    </a>
                  </div>
                </article>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    {/each}

    <p class="mt-16 max-w-3xl text-sm leading-relaxed text-corag-secondary">
      {labels.disclosure}
    </p>
  </div>
</section>

{#if openApp}
  <div
    class="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 backdrop-blur-[2px] sm:items-center p-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))]"
    role="presentation"
    onclick={(e) => {
      if (e.target === e.currentTarget) closeModal();
    }}
  >
    <div
      bind:this={dialogEl}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`eco-app-title-${openApp.id}`}
      tabindex="-1"
      class="relative flex w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-t-2xl rounded-b-2xl bg-corag-bg-elevated text-corag shadow-2xl ring-1 ring-corag-border focus:outline-none sm:max-h-[calc(100dvh-2rem)]"
    >
      <button
        type="button"
        class="absolute right-2.5 top-2.5 z-20 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-corag-bg/90 text-corag ring-1 ring-corag-border backdrop-blur-sm transition hover:bg-corag-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corag-primary sm:right-3 sm:top-3"
        aria-label={labels.close}
        onclick={closeModal}
      >
        <svg
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
          />
        </svg>
      </button>

      <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4 pt-5 sm:px-7 sm:pt-7">
        <div class="flex items-start gap-4 pr-12">
          {#if showLogo(openApp)}
            <img
              src={openApp.logo}
              alt=""
              width="64"
              height="64"
              class="h-16 w-16 shrink-0 rounded-2xl border border-corag-border bg-white object-contain p-1 shadow-sm"
              loading="lazy"
              decoding="async"
            />
          {:else}
            <div
              class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-corag-border bg-white text-base font-bold text-corag-fill shadow-sm"
              aria-hidden="true"
            >
              {openApp.monogram || openApp.name.slice(0, 2)}
            </div>
          {/if}
          <div class="min-w-0">
            <h2
              id={`eco-app-title-${openApp.id}`}
              class="text-2xl font-bold tracking-tight text-corag"
            >
              {openApp.name}
            </h2>
            <a
              href={openApp.url}
              class="mt-1 block truncate text-sm text-corag-accent-strong underline-offset-2 hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              {openApp.displayUrl}
            </a>
            <p class="mt-2 text-sm font-medium text-corag-secondary">
              {openApp.tagline}
            </p>
          </div>
        </div>

        <section class="mt-6">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-corag-primary dark:text-corag-primary-light">
            {labels.overview}
          </h3>
          <p class="mt-2 text-base leading-relaxed text-corag-secondary">
            {openApp.overview}
          </p>
        </section>

        {#if openApp.features.length}
          <section class="mt-6">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-corag-primary dark:text-corag-primary-light">
              {labels.features}
            </h3>
            <ul class="mt-3 space-y-2">
              {#each openApp.features as feature}
                <li class="flex gap-3 text-sm leading-relaxed text-corag-secondary">
                  <span
                    class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-corag-primary"
                    aria-hidden="true"
                  ></span>
                  <span>{feature}</span>
                </li>
              {/each}
            </ul>
          </section>
        {/if}

        {#if openApp.tools.length}
          <section class="mt-6">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-corag-primary dark:text-corag-primary-light">
              {labels.tools}
            </h3>
            <ul class="mt-3 space-y-2">
              {#each openApp.tools as tool}
                <li
                  class="rounded-xl border border-corag-border bg-corag-bg px-3 py-2 text-sm leading-relaxed text-corag"
                >
                  {tool}
                </li>
              {/each}
            </ul>
          </section>
        {/if}

        <div class="mt-6 grid gap-5 sm:grid-cols-2">
          {#if openApp.audience}
            <section>
              <h3 class="text-sm font-semibold uppercase tracking-wider text-corag-primary dark:text-corag-primary-light">
                {labels.audience}
              </h3>
              <p class="mt-2 text-sm leading-relaxed text-corag-secondary">
                {openApp.audience}
              </p>
            </section>
          {/if}
          {#if openApp.coverage}
            <section>
              <h3 class="text-sm font-semibold uppercase tracking-wider text-corag-primary dark:text-corag-primary-light">
                {labels.coverage}
              </h3>
              <p class="mt-2 text-sm leading-relaxed text-corag-secondary">
                {openApp.coverage}
              </p>
            </section>
          {/if}
        </div>

        {#if openApp.limits}
          <section class="mt-6 rounded-2xl border border-corag-border bg-corag-bg px-4 py-3">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-corag-primary dark:text-corag-primary-light">
              {labels.limits}
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-corag-secondary">
              {openApp.limits}
            </p>
          </section>
        {/if}

        <section class="mt-6">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-corag-primary dark:text-corag-primary-light">
            {labels.integrations}
          </h3>
          <dl class="mt-3 grid gap-3 sm:grid-cols-2">
            <div class="rounded-xl border border-corag-border bg-corag-bg px-3 py-3">
              <dt class="text-xs font-semibold uppercase tracking-wide text-corag-secondary">
                {labels.publicApi}
              </dt>
              <dd class="mt-2">
                <span
                  class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold {availabilityClass(
                    openApp.integrations.publicApi
                  )}"
                >
                  {availabilityLabel(openApp.integrations.publicApi)}
                </span>
              </dd>
            </div>
            <div class="rounded-xl border border-corag-border bg-corag-bg px-3 py-3">
              <dt class="text-xs font-semibold uppercase tracking-wide text-corag-secondary">
                {labels.publicMcp}
              </dt>
              <dd class="mt-2">
                <span
                  class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold {availabilityClass(
                    openApp.integrations.publicMcp
                  )}"
                >
                  {availabilityLabel(openApp.integrations.publicMcp)}
                </span>
              </dd>
            </div>
          </dl>

          {#if openApp.integrations.notes}
            <p class="mt-3 text-sm leading-relaxed text-corag-secondary">
              {openApp.integrations.notes}
            </p>
          {/if}

          <ul class="mt-4 flex flex-col gap-2 text-sm">
            {#if openApp.integrations.apiDocsUrl}
              <li>
                <a
                  href={openApp.integrations.apiDocsUrl}
                  class="font-medium text-corag-accent-strong underline-offset-2 hover:underline"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {labels.apiDocs}
                </a>
              </li>
            {/if}
            {#if openApp.integrations.openApiUrl && openApp.integrations.openApiUrl !== openApp.integrations.apiDocsUrl}
              <li>
                <a
                  href={openApp.integrations.openApiUrl}
                  class="font-medium text-corag-accent-strong underline-offset-2 hover:underline"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {labels.openApi}
                </a>
              </li>
            {/if}
            {#if openApp.integrations.mcpUrl}
              <li>
                <a
                  href={openApp.integrations.mcpUrl}
                  class="font-medium text-corag-accent-strong underline-offset-2 hover:underline"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {labels.mcpEndpoint}
                </a>
              </li>
            {/if}
            {#if developersHref(openApp)}
              <li>
                <a
                  href={developersHref(openApp)}
                  class="font-medium text-corag-accent-strong underline-offset-2 hover:underline"
                  rel={openApp.integrations.developersUrl?.startsWith('/')
                    ? undefined
                    : 'noopener noreferrer'}
                  target={openApp.integrations.developersUrl?.startsWith('/')
                    ? undefined
                    : '_blank'}
                >
                  {labels.developers}
                </a>
              </li>
            {/if}
          </ul>
        </section>
      </div>

      <div
        class="shrink-0 border-t border-corag-border bg-corag-bg-elevated px-5 py-4 sm:px-7"
      >
        <a
          href={openApp.url}
          class="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-corag-fill px-7 text-base font-semibold text-corag-on-fill transition hover:bg-corag-fill-strong sm:w-auto"
          rel="noopener noreferrer"
          target="_blank"
        >
          {labels.visit}
        </a>
      </div>
    </div>
  </div>
{/if}
