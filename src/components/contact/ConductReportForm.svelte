<script>
import { EVENTS, trackEvent } from '@/lib/analytics';
import { validateConductReportForm } from '@/lib/contact-form';
import { focusFirstInvalidField } from '@/lib/form-ui';
import { getTranslations } from '@/lib/translations';

export let lang = 'es';
export let apiEndpoint = '/api/contact';

$: t = getTranslations(lang);
$: f = t.conductForm;
$: cp = t.contactPage;

let formState = 'idle';
let incidentDescription = '';
let incidentDate = '';
let peopleInvolved = '';
let anonymous = false;
let name = '';
let email = '';
let preferredFollowup = '';
let website = '';
let errors = {
  incidentDescription: '',
  email: '',
};
let submitError = '';
let successRef;

const inputClass =
  'w-full min-h-[44px] text-base p-3 rounded-lg border border-cabuya-border bg-cabuya-bg-elevated text-cabuya focus:outline-none focus:ring-2 focus:ring-cabuya-primary/30 focus:border-cabuya-primary transition-colors';
const labelClass = 'block text-sm font-medium text-cabuya-secondary mb-2';
const errorClass = 'mt-1 text-sm text-red-600 dark:text-red-400';
const hintClass = 'mt-1 text-sm text-cabuya-secondary';

function onAnonymousChange() {
  if (anonymous) {
    name = '';
    email = '';
    errors = { ...errors, email: '' };
  }
}

async function handleSubmit() {
  submitError = '';
  const result = validateConductReportForm(
    {
      incidentDescription,
      incidentDate,
      peopleInvolved,
      anonymous,
      name,
      email,
      preferredFollowup,
      website,
    },
    {
      requiredField: cp.requiredField,
      invalidEmail: cp.invalidEmail,
    }
  );
  errors = result.errors;
  if (!result.valid) {
    const failedCount = Object.values(errors).filter(Boolean).length;
    // Never include incident text in analytics payloads.
    trackEvent(EVENTS.CONTACT_FORM_ERROR, {
      field_count: failedCount,
      topic: 'conduct',
    });
    focusFirstInvalidField(
      [
        { key: 'incidentDescription', id: 'coc-incident' },
        { key: 'email', id: 'coc-email' },
      ],
      errors
    );
    return;
  }
  if (!apiEndpoint) {
    submitError = cp.submitError;
    return;
  }

  formState = 'submitting';

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _form: 'conduct',
        incidentDescription,
        incidentDate,
        peopleInvolved,
        anonymous,
        name: anonymous ? '' : name,
        email: anonymous ? '' : email,
        preferredFollowup,
        lang,
        website,
        page_path:
          typeof window !== 'undefined' ? window.location.pathname : '/',
      }),
    });
    if (!response.ok) {
      let payload;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
      const errorCode =
        (payload && typeof payload === 'object' && payload?.error) ||
        `http_${response.status}`;
      throw new Error(errorCode);
    }
    formState = 'success';
    trackEvent(EVENTS.CONDUCT_REPORT_SUBMIT, { anonymous });
    setTimeout(() => successRef?.focus(), 100);
  } catch (err) {
    const code = err instanceof Error ? err.message : 'submit_failed';
    const next = { incidentDescription: '', email: '' };
    if (code === 'missing_incidentDescription' || code === 'missing_required') {
      next.incidentDescription = cp.requiredField;
    } else if (code === 'missing_email' || code === 'email_invalid') {
      next.email =
        code === 'email_invalid' ? cp.invalidEmail : cp.requiredField;
    }
    errors = next;
    if (next.incidentDescription || next.email) {
      focusFirstInvalidField(
        [
          { key: 'incidentDescription', id: 'coc-incident' },
          { key: 'email', id: 'coc-email' },
        ],
        errors
      );
    } else {
      submitError = cp.submitError;
    }
    formState = 'idle';
    trackEvent(EVENTS.CONTACT_FORM_ERROR, { reason: code });
  }
}

function resetForm() {
  incidentDescription = '';
  incidentDate = '';
  peopleInvolved = '';
  anonymous = false;
  name = '';
  email = '';
  preferredFollowup = '';
  website = '';
  errors = { incidentDescription: '', email: '' };
  submitError = '';
  formState = 'idle';
}
</script>

{#if formState === 'success'}
  <div
    bind:this={successRef}
    tabindex="-1"
    class="text-center py-12"
    role="status"
    aria-live="polite"
  >
    <div class="mb-4 text-5xl" aria-hidden="true">✓</div>
    <h3 class="text-2xl font-bold text-cabuya mb-3">{f.successTitle}</h3>
    <p class="text-cabuya-secondary mb-6">{f.successMessage}</p>
    <button
      type="button"
      on:click={resetForm}
      class="inline-flex min-h-[44px] items-center px-6 py-2 rounded-full border border-cabuya-primary text-cabuya-primary font-semibold hover:bg-cabuya-fill hover:text-cabuya-on-fill transition-colors"
    >
      {cp.sendAnotherButton}
    </button>
  </div>
{:else}
  <form class="space-y-6" on:submit|preventDefault={handleSubmit} novalidate>
    <p class="text-sm text-cabuya-secondary rounded-lg border border-cabuya-border bg-cabuya-bg-elevated p-4">
      {f.privacyNote}
    </p>

    {#if submitError}
      <div
        class="rounded-lg border border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-200 p-4"
        role="alert"
        aria-live="assertive"
      >
        {submitError}
      </div>
    {/if}

    <div
      style="position:absolute;left:-9999px;height:0;overflow:hidden;"
      aria-hidden="true"
    >
      <label for="coc-website">Website</label>
      <input
        id="coc-website"
        type="text"
        tabindex="-1"
        autocomplete="off"
        bind:value={website}
      />
    </div>

    <div>
      <label for="coc-incident" class={labelClass}>{f.incidentLabel}</label>
      <textarea
        id="coc-incident"
        rows="6"
        class="{inputClass} resize-none"
        class:border-red-500={errors.incidentDescription}
        placeholder={f.incidentPlaceholder}
        bind:value={incidentDescription}
        disabled={formState === 'submitting'}
        aria-describedby={errors.incidentDescription
          ? 'coc-incident-error'
          : undefined}
        aria-invalid={errors.incidentDescription ? 'true' : undefined}
      ></textarea>
      {#if errors.incidentDescription}<p
          id="coc-incident-error"
          class={errorClass}
          aria-live="polite">{errors.incidentDescription}</p
        >{/if}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="coc-when" class={labelClass}>{f.whenLabel}</label>
        <input
          id="coc-when"
          class={inputClass}
          placeholder={f.whenPlaceholder}
          bind:value={incidentDate}
          disabled={formState === 'submitting'}
        />
      </div>
      <div>
        <label for="coc-people" class={labelClass}>{f.peopleLabel}</label>
        <input
          id="coc-people"
          class={inputClass}
          placeholder={f.peoplePlaceholder}
          bind:value={peopleInvolved}
          disabled={formState === 'submitting'}
        />
      </div>
    </div>

    <label class="flex items-start gap-3 min-h-[44px] cursor-pointer">
      <input
        type="checkbox"
        class="mt-1 h-6 w-6 shrink-0 rounded border-cabuya-border"
        bind:checked={anonymous}
        on:change={onAnonymousChange}
        disabled={formState === 'submitting'}
      />
      <span>
        <span class="block text-sm font-medium text-cabuya">{f.anonymousLabel}</span
        >
        <span class="block {hintClass}">{f.anonymousHint}</span>
      </span>
    </label>

    {#if !anonymous}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="coc-name" class={labelClass}>{f.nameLabel}</label>
          <input
            id="coc-name"
            class={inputClass}
            bind:value={name}
            disabled={formState === 'submitting'}
            autocomplete="name"
          />
        </div>
        <div>
          <label for="coc-email" class={labelClass}>{f.emailLabel}</label>
          <input
            id="coc-email"
            type="email"
            inputmode="email"
            class={inputClass}
            class:border-red-500={errors.email}
            bind:value={email}
            disabled={formState === 'submitting'}
            autocomplete="email"
            aria-describedby={errors.email ? 'coc-email-error' : undefined}
            aria-invalid={errors.email ? 'true' : undefined}
          />
          {#if errors.email}<p id="coc-email-error" class={errorClass} aria-live="polite">{errors.email}</p>{/if}
        </div>
      </div>
    {/if}

    <div>
      <label for="coc-followup" class={labelClass}>{f.followupLabel}</label>
      <textarea
        id="coc-followup"
        rows="3"
        class="{inputClass} resize-none"
        placeholder={f.followupPlaceholder}
        bind:value={preferredFollowup}
        disabled={formState === 'submitting'}
      ></textarea>
    </div>

    <div class="text-center">
      <button
        type="submit"
        disabled={formState === 'submitting'}
        class="inline-flex min-h-[44px] items-center px-8 py-3 bg-cabuya-fill text-cabuya-on-fill font-semibold rounded-full hover:bg-cabuya-fill-strong transition-colors disabled:opacity-60"
      >
        {formState === 'submitting' ? cp.sendingButton : f.submitButton}
      </button>
    </div>
  </form>
{/if}
