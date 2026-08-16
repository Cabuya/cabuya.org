<script>
import { EVENTS, trackEvent } from '@/lib/analytics';
import {
  emptyEcosystemJoinErrors,
  validateEcosystemJoinForm,
} from '@/lib/ecosystem-join-form';
import { focusFirstInvalidField } from '@/lib/form-ui';
import { getTranslations } from '@/lib/translations';

export let lang = 'es';
export let apiEndpoint = '/api/contact';

$: t = getTranslations(lang);
$: f = t.ecosystemPage.joinForm;

let formState = 'idle';
let appName = '';
let appUrl = '';
let what = '';
let how = '';
let category = '';
let name = '';
let email = '';
let notes = '';
let website = '';
let errors = emptyEcosystemJoinErrors();
let formError = '';

const categoryOptions = [
  { value: 'matching', labelKey: 'catMatching' },
  { value: 'damage', labelKey: 'catDamage' },
  { value: 'logistics', labelKey: 'catLogistics' },
  { value: 'pets', labelKey: 'catPets' },
  { value: 'people', labelKey: 'catPeople' },
  { value: 'other', labelKey: 'catOther' },
];

function validate() {
  errors = validateEcosystemJoinForm(
    { appName, appUrl, what, how, category, name, email, notes },
    {
      required: f.errRequired,
      email: f.errEmail,
      url: f.errUrl,
      category: f.errCategory,
    }
  );
  return Object.keys(errors).length === 0;
}

async function handleSubmit(event) {
  event.preventDefault();
  formError = '';
  if (!validate()) {
    focusFirstInvalidField(
      [
        { key: 'appName', id: 'eco-app-name' },
        { key: 'appUrl', id: 'eco-app-url' },
        { key: 'what', id: 'eco-what' },
        { key: 'how', id: 'eco-how' },
        { key: 'category', id: 'eco-category' },
        { key: 'name', id: 'eco-name' },
        { key: 'email', id: 'eco-email' },
      ],
      errors
    );
    return;
  }

  formState = 'submitting';
  try {
    const res = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _form: 'ecosystem',
        appName,
        appUrl,
        what,
        how,
        category,
        name,
        email,
        notes,
        lang,
        page_path:
          typeof window !== 'undefined'
            ? window.location.pathname
            : '/ecosystem',
        website,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      formError = f.errSubmit;
      formState = 'idle';
      trackEvent(EVENTS.ECOSYSTEM_FORM_ERROR, {
        error: body.error || String(res.status),
      });
      return;
    }
    formState = 'success';
    trackEvent(EVENTS.ECOSYSTEM_FORM_SUBMIT, { status: 'ok' });
  } catch {
    formError = f.errSubmit;
    formState = 'idle';
    trackEvent(EVENTS.ECOSYSTEM_FORM_ERROR, { error: 'network' });
  }
}
</script>

{#if formState === 'success'}
  <div
    class="rounded-2xl border border-corag-border bg-corag-primary-soft/40 p-6 sm:p-8"
    role="status"
  >
    <p class="text-lg font-semibold text-corag">{f.successTitle}</p>
    <p class="mt-2 text-sm leading-relaxed text-corag-secondary">{f.successBody}</p>
  </div>
{:else}
  <form class="relative space-y-5" on:submit={handleSubmit} novalidate>
    <p class="text-sm text-corag-secondary">{f.disclaimer}</p>

    <div class="grid gap-5 sm:grid-cols-2">
      <div class="sm:col-span-2">
        <label class="mb-2 block text-sm font-medium text-corag-secondary" for="eco-app-name"
          >{f.appName}</label
        >
        <input
          id="eco-app-name"
          class="w-full min-h-[44px] rounded-xl border border-corag-border bg-corag-bg-elevated px-4 py-3 text-base text-corag outline-none transition focus:border-corag-primary focus:ring-2 focus:ring-corag-primary/30"
          class:border-red-600={Boolean(errors.appName)}
          aria-invalid={errors.appName ? 'true' : undefined}
          bind:value={appName}
          autocomplete="organization"
        />
        {#if errors.appName}
          <p class="mt-1 text-sm text-red-600 dark:text-red-400" aria-live="polite">
            {errors.appName}
          </p>
        {/if}
      </div>

      <div class="sm:col-span-2">
        <label class="mb-2 block text-sm font-medium text-corag-secondary" for="eco-app-url"
          >{f.appUrl}</label
        >
        <input
          id="eco-app-url"
          type="url"
          inputmode="url"
          placeholder="https://"
          class="w-full min-h-[44px] rounded-xl border border-corag-border bg-corag-bg-elevated px-4 py-3 text-base text-corag outline-none transition focus:border-corag-primary focus:ring-2 focus:ring-corag-primary/30"
          class:border-red-600={Boolean(errors.appUrl)}
          aria-invalid={errors.appUrl ? 'true' : undefined}
          bind:value={appUrl}
        />
        {#if errors.appUrl}
          <p class="mt-1 text-sm text-red-600 dark:text-red-400" aria-live="polite">
            {errors.appUrl}
          </p>
        {/if}
      </div>

      <div class="sm:col-span-2">
        <label class="mb-2 block text-sm font-medium text-corag-secondary" for="eco-what"
          >{f.what}</label
        >
        <textarea
          id="eco-what"
          rows="3"
          class="w-full rounded-xl border border-corag-border bg-corag-bg-elevated px-4 py-3 text-base text-corag outline-none transition focus:border-corag-primary focus:ring-2 focus:ring-corag-primary/30"
          class:border-red-600={Boolean(errors.what)}
          aria-invalid={errors.what ? 'true' : undefined}
          bind:value={what}
        ></textarea>
        {#if errors.what}
          <p class="mt-1 text-sm text-red-600 dark:text-red-400" aria-live="polite">
            {errors.what}
          </p>
        {/if}
      </div>

      <div class="sm:col-span-2">
        <label class="mb-2 block text-sm font-medium text-corag-secondary" for="eco-how"
          >{f.how}</label
        >
        <textarea
          id="eco-how"
          rows="3"
          class="w-full rounded-xl border border-corag-border bg-corag-bg-elevated px-4 py-3 text-base text-corag outline-none transition focus:border-corag-primary focus:ring-2 focus:ring-corag-primary/30"
          class:border-red-600={Boolean(errors.how)}
          aria-invalid={errors.how ? 'true' : undefined}
          bind:value={how}
        ></textarea>
        {#if errors.how}
          <p class="mt-1 text-sm text-red-600 dark:text-red-400" aria-live="polite">
            {errors.how}
          </p>
        {/if}
      </div>

      <div class="sm:col-span-2">
        <label class="mb-2 block text-sm font-medium text-corag-secondary" for="eco-category"
          >{f.category}</label
        >
        <select
          id="eco-category"
          class="w-full min-h-[44px] rounded-xl border border-corag-border bg-corag-bg-elevated px-4 py-3 text-base text-corag outline-none transition focus:border-corag-primary focus:ring-2 focus:ring-corag-primary/30"
          class:border-red-600={Boolean(errors.category)}
          aria-invalid={errors.category ? 'true' : undefined}
          bind:value={category}
        >
          <option value="">{f.categoryPlaceholder}</option>
          {#each categoryOptions as opt}
            <option value={opt.value}>{f[opt.labelKey]}</option>
          {/each}
        </select>
        {#if errors.category}
          <p class="mt-1 text-sm text-red-600 dark:text-red-400" aria-live="polite">
            {errors.category}
          </p>
        {/if}
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-corag-secondary" for="eco-name"
          >{f.contactName}</label
        >
        <input
          id="eco-name"
          class="w-full min-h-[44px] rounded-xl border border-corag-border bg-corag-bg-elevated px-4 py-3 text-base text-corag outline-none transition focus:border-corag-primary focus:ring-2 focus:ring-corag-primary/30"
          class:border-red-600={Boolean(errors.name)}
          aria-invalid={errors.name ? 'true' : undefined}
          bind:value={name}
          autocomplete="name"
        />
        {#if errors.name}
          <p class="mt-1 text-sm text-red-600 dark:text-red-400" aria-live="polite">
            {errors.name}
          </p>
        {/if}
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-corag-secondary" for="eco-email"
          >{f.contactEmail}</label
        >
        <input
          id="eco-email"
          type="email"
          class="w-full min-h-[44px] rounded-xl border border-corag-border bg-corag-bg-elevated px-4 py-3 text-base text-corag outline-none transition focus:border-corag-primary focus:ring-2 focus:ring-corag-primary/30"
          class:border-red-600={Boolean(errors.email)}
          aria-invalid={errors.email ? 'true' : undefined}
          bind:value={email}
          autocomplete="email"
        />
        {#if errors.email}
          <p class="mt-1 text-sm text-red-600 dark:text-red-400" aria-live="polite">
            {errors.email}
          </p>
        {/if}
      </div>

      <div class="sm:col-span-2">
        <label class="mb-2 block text-sm font-medium text-corag-secondary" for="eco-notes"
          >{f.notes}</label
        >
        <textarea
          id="eco-notes"
          rows="2"
          class="w-full rounded-xl border border-corag-border bg-corag-bg-elevated px-4 py-3 text-base text-corag outline-none transition focus:border-corag-primary focus:ring-2 focus:ring-corag-primary/30"
          bind:value={notes}
        ></textarea>
      </div>
    </div>

    <div class="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
      <label for="eco-website">Website</label>
      <input id="eco-website" tabindex="-1" autocomplete="off" bind:value={website} />
    </div>

    {#if formError}
      <p class="text-sm text-red-600 dark:text-red-400" role="alert">{formError}</p>
    {/if}

    <button
      type="submit"
      class="inline-flex min-h-[48px] items-center justify-center rounded-full bg-corag-fill px-8 text-base font-semibold text-corag-on-fill transition hover:bg-corag-fill-strong disabled:opacity-60"
      disabled={formState === 'submitting'}
    >
      {formState === 'submitting' ? f.submitting : f.submit}
    </button>
  </form>
{/if}
