const ENDPOINT = 'https://formspree.io/f/xgavkowd';
const TIMEOUT_MS = 20000;
const fieldMessages = {
  name: 'Please check your name.',
  company: 'Please check your company or organisation.',
  email: 'Please enter a valid email address.',
  phone: 'Please check your phone number.',
  phone_region: 'Please choose your phone country or region.',
  services: 'Please choose at least one service.',
  budget: 'Please choose an approximate budget.'
};

// Transport boundary: explicit fields only; no recipient overrides or user-built headers.
// The controller validates current UI choices before calling this adapter.
export async function submitProjectInquiry(data) {
  if (navigator.onLine === false) return {status: 'unavailable', reason: 'offline'};
  const body = new FormData();
  for (const key of ['name', 'company', 'email', 'phone']) body.set(key, data[key]);
  body.set('phone_region', data.phoneRegion);
  body.set('phone_calling_code', data.phoneCallingCode);
  body.set('services', [...new Set(data.services)].join(', '));
  body.set('budget', data.budgetLabel);
  body.set('subject', 'New project inquiry — MOND');
  body.set('_gotcha', data.company_fax);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST', headers: {Accept: 'application/json'}, body,
      signal: controller.signal, credentials: 'omit', redirect: 'error'
    });
    const result = await response.json().catch(() => null);
    // Require a positive JSON acknowledgement, never a redirect/HTML page.
    const hasErrors = Array.isArray(result?.errors) ? result.errors.length > 0 : Boolean(result?.errors);
    if (response.ok && result?.ok === true && !hasErrors && !result.error) return {status: 'accepted'};
    if (response.status === 429) return {status: 'unavailable', reason: 'rate-limit'};
    if ([400, 422].includes(response.status) && Array.isArray(result?.errors)) {
      const errors = {};
      for (const error of result.errors) {
        if (Object.hasOwn(fieldMessages, error?.field)) {
          errors[error.field === 'phone_region' ? 'phoneRegion' : error.field] = fieldMessages[error.field];
        }
      }
      if (Object.keys(errors).length) return {status: 'invalid', errors};
    }
    return {status: 'unavailable', reason: 'unconfirmed'};
  } catch {
    return {status: 'unavailable', reason: controller.signal.aborted ? 'timeout' : 'network'};
  } finally {
    clearTimeout(timeout);
  }
}
