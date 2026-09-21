import {submitProjectInquiry} from './submission.js?v=20260921-formspree';

const form = document.querySelector('#project-inquiry');
const send = form.querySelector('.inquiry-send');
const sendContent = [...send.childNodes].map(node => node.cloneNode(true));
const status = document.querySelector('#form-status');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const serviceChoices = [...form.querySelectorAll('[name="services"]')];
const allowedServices = new Set(serviceChoices.map(input => input.value));
const allowedBudgets = new Map([...form.budget.options].filter(option => option.value).map(option => [option.value, option.textContent.trim()]));
const phoneRegions = new Map([...form.phoneRegion.options].map(option => [option.value, option.dataset.callingCode]));
const fieldOrder = ['name', 'company', 'services', 'budget', 'email', 'phoneRegion', 'phone'];
let attempted = false;
let submitting = false;
let sent = false;
const success = document.querySelector('#inquiry-success');
const closeSuccess = () => {
  const restoreFocus = success.contains(document.activeElement);
  success.hidden = true;
  if (restoreFocus) send.focus();
};
success.querySelector('button').addEventListener('click', closeSuccess);
success.addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.stopPropagation(); closeSuccess(); }
});

function readInquiry() {
  const data = new FormData(form);
  const inquiry = Object.fromEntries([...fieldOrder, 'company_fax'].map(key =>
    [key, key === 'services' ? data.getAll(key) : String(data.get(key) || '').trim()]));
  return {...inquiry, budgetLabel: allowedBudgets.get(inquiry.budget), phoneCallingCode: phoneRegions.get(inquiry.phoneRegion) || ''};
}

function validate(data) {
  const errors = {};
  if (!data.name) errors.name = 'Please tell us your name.';
  if (!data.company) errors.company = 'Please enter your company or organisation.';
  if (!data.services.length || data.services.some(value => !allowedServices.has(value))) errors.services = 'Please choose at least one service.';
  if (!allowedBudgets.has(data.budget)) errors.budget = 'Please choose an approximate budget.';
  if (!data.email) errors.email = 'Please enter your email address.';
  else if (form.email.validity.typeMismatch) errors.email = 'Please enter a valid email address, such as name@company.com.';
  if (!phoneRegions.has(data.phoneRegion)) errors.phoneRegion = 'Please choose your phone country or region.';
  if (!data.phone) errors.phone = 'Please enter your phone number.';
  for (const [key, limit] of Object.entries({name: 120, company: 120, email: 254, phone: 50})) {
    if (data[key].length > limit) errors[key] = `Please keep this field within ${limit} characters.`;
  }
  return errors;
}

function renderErrors(errors) {
  for (const key of fieldOrder) {
    const error = document.getElementById(`${key}-error`);
    error.textContent = errors[key] || '';
    error.hidden = !errors[key];
    const controls = key === 'services' ? serviceChoices : [form.elements.namedItem(key)];
    controls.forEach(control => control.setAttribute('aria-invalid', String(Boolean(errors[key]))));
  }
}

function focusError(errors) {
  const key = fieldOrder.find(key => errors[key]);
  if (!key) return;
  const target = key === 'services' ? serviceChoices[0] : form.elements.namedItem(key);
  requestAnimationFrame(() => target.focus());
}

function showStatus(message) { status.textContent = message; status.hidden = false; }
form.addEventListener('change', event => {
  if (event.target.name === 'services') {
    serviceChoices.forEach(input => { input.nextElementSibling.querySelector('.service-check').textContent = input.checked ? '✓' : '+'; });
  }
  if (attempted) renderErrors(validate(readInquiry()));
});
form.addEventListener('input', () => { if (attempted) renderErrors(validate(readInquiry())); });

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (submitting || sent) return;
  attempted = true;
  const data = readInquiry();
  const errors = validate(data);
  renderErrors(errors);
  if (Object.keys(errors).length) {
    showStatus('Please check the highlighted fields below. Your inquiry has not been sent.');
    focusError(errors);
    return;
  }
  if (data.company_fax) {
    showStatus('Your inquiry has not been sent. Please try again.');
    return;
  }
  submitting = true;
  send.disabled = true;
  send.textContent = 'SENDING…';
  const controls = [...form.querySelectorAll('input, select, textarea')].filter(control => !control.disabled);
  controls.forEach(control => { control.disabled = true; });
  form.setAttribute('aria-busy', 'true');
  showStatus('Sending your inquiry…');
  try {
    const result = await submitProjectInquiry(data);
    if (result?.status === 'accepted') {
      sent = true;
      status.hidden = true;
      send.textContent = 'INQUIRY SENT';
      send.setAttribute('aria-disabled', 'true');
      form.querySelectorAll('input, select, textarea').forEach(control => { control.disabled = true; });
      success.hidden = false;
      success.focus();
    } else if (result?.status === 'invalid' && result.errors && typeof result.errors === 'object') {
      const safeErrors = Object.fromEntries(Object.entries(result.errors).filter(([key, value]) => fieldOrder.includes(key) && typeof value === 'string'));
      renderErrors(safeErrors);
      showStatus('Please check your details. Your inquiry has not been sent.');
      focusError(safeErrors);
    } else {
      const messages = {
        offline: 'You appear to be offline. Your details are still here. Reconnect and try again.',
        'rate-limit': 'Please wait a little before trying again. Your details are still here.',
        timeout: 'This is taking too long. We couldn’t confirm your inquiry was sent. Your details are still here so you can try again.'
      };
      showStatus(messages[result?.reason] || 'We couldn’t confirm your inquiry was sent. Your details are still here so you can try again.');
      status.scrollIntoView({behavior: reduced.matches ? 'instant' : 'smooth', block: 'center'});
    }
  } catch {
    showStatus('We couldn’t confirm your inquiry was sent. Your details are still here so you can try again.');
  } finally {
    submitting = false;
    send.disabled = false;
    if (!sent) {
      controls.forEach(control => { control.disabled = false; });
      send.replaceChildren(...sendContent.map(node => node.cloneNode(true)));
    }
    form.removeAttribute('aria-busy');
  }
});
// Without JS the disabled default submit prevents implicit Enter submission.
send.disabled = false;
