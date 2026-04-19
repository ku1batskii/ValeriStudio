/**
 * form.js — Contact form validation
 * - Real-time field validation
 * - Pattern checks (email regex, length)
 * - Visual error / valid states
 * - Fake async submit with loading state
 * - Success state reveal
 */

(function () {
  'use strict';

  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn  = form.querySelector('.form-submit');
  const formWrap   = form.closest('.contact-form-wrap');
  const successEl  = document.querySelector('.form-success');

  // ─── Validation rules ──────────────────────────────────
  const rules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 80,
      message: (val) => {
        if (!val.trim()) return 'Введите ваше имя';
        if (val.trim().length < 2) return 'Минимум 2 символа';
        if (val.trim().length > 80) return 'Максимум 80 символов';
        return null;
      }
    },
    email: {
      required: true,
      message: (val) => {
        if (!val.trim()) return 'Введите email';
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!re.test(val.trim())) return 'Введите корректный email';
        return null;
      }
    },
    subject: {
      required: false,
      message: () => null
    },
    message: {
      required: true,
      minLength: 10,
      message: (val) => {
        if (!val.trim()) return 'Введите сообщение';
        if (val.trim().length < 10) return 'Минимум 10 символов';
        return null;
      }
    }
  };

  // ─── Helpers ────────────────────────────────────────────
  function getField(name) {
    return form.querySelector(`[name="${name}"]`);
  }
  function getError(name) {
    return form.querySelector(`[data-error="${name}"]`);
  }

  function setFieldState(input, errEl, isValid, message) {
    input.classList.toggle('error', !isValid);
    input.classList.toggle('valid', isValid);
    if (errEl) {
      errEl.textContent = message || '';
      errEl.classList.toggle('show', !isValid && !!message);
    }
  }

  function validateField(name) {
    const input  = getField(name);
    const errEl  = getError(name);
    if (!input || !rules[name]) return true;

    const val    = input.value;
    const msg    = rules[name].message(val);
    const valid  = msg === null;
    setFieldState(input, errEl, valid, msg);
    return valid;
  }

  // ─── Checkbox validation ────────────────────────────────
  function validateCheckbox() {
    const cb    = form.querySelector('#privacy-check');
    const wrap  = cb ? cb.closest('.form-check') : null;
    if (!cb) return true;
    const ok = cb.checked;
    if (wrap) wrap.classList.toggle('error', !ok);
    return ok;
  }

  // ─── Real-time validation ───────────────────────────────
  Object.keys(rules).forEach(name => {
    const input = getField(name);
    if (!input) return;

    // Validate on blur (first touch)
    input.addEventListener('blur', () => validateField(name));

    // Validate on input (after first error shown)
    input.addEventListener('input', () => {
      if (input.classList.contains('error') || input.classList.contains('valid')) {
        validateField(name);
      }
    });
  });

  // Privacy checkbox live
  const cb = form.querySelector('#privacy-check');
  if (cb) {
    cb.addEventListener('change', validateCheckbox);
  }

  // ─── Full form validation ───────────────────────────────
  function validateAll() {
    const fieldResults = Object.keys(rules).map(name => validateField(name));
    const cbResult = validateCheckbox();
    return fieldResults.every(Boolean) && cbResult;
  }

  // ─── Submit handler ─────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      // Focus first error
      const firstError = form.querySelector('.field-input.error, .field-textarea.error');
      if (firstError) firstError.focus();
      // Shake the submit button
      submitBtn.style.animation = 'none';
      submitBtn.offsetWidth;
      submitBtn.style.animation = 'shake 0.4s ease';
      return;
    }

    // Loading state
    submitBtn.classList.add('loading');

    // Simulate async send (replace with fetch() to real endpoint)
    await new Promise(resolve => setTimeout(resolve, 1800));

    submitBtn.classList.remove('loading');

    // Show success
    if (formWrap && successEl) {
      form.style.display = 'none';
      successEl.classList.add('show');
    }
  });

  // ─── Shake animation ───────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);

  // ─── Character counter for message field ───────────────
  const msgField = getField('message');
  if (msgField) {
    const label = form.querySelector('[data-counter-label]');
    msgField.addEventListener('input', () => {
      if (label) label.textContent = msgField.value.length + ' / 1000';
    });
    msgField.setAttribute('maxlength', '1000');
  }

})();