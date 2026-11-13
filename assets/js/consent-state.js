(() => {
  if (window.MONDConsent) return;

  // First-party preference only; schema v1 has no automatic migration or expiry.
  const STORAGE_KEY = "mond_cookie_consent";
  const VERSION = 1;
  const EVENT_NAME = "mond:consentchange";
  const defaults = () => ({
    version: VERSION,
    necessary: true,
    analytics: false,
    advertising: false,
    choiceMade: false,
    updatedAt: null,
  });
  const fields = Object.keys(defaults());

  // Missing, invalid or unknown data never grants optional consent.
  const parse = (raw) => {
    try {
      const value = JSON.parse(raw);
      if (!value || typeof value !== "object" || Array.isArray(value)) return defaults();
      if (Object.keys(value).length !== fields.length || !fields.every((key) => Object.hasOwn(value, key))) return defaults();
      if (value.version !== VERSION || value.necessary !== true ||
          typeof value.analytics !== "boolean" || typeof value.advertising !== "boolean" ||
          typeof value.choiceMade !== "boolean") return defaults();
      if (!value.choiceMade) {
        return !value.analytics && !value.advertising && value.updatedAt === null ? value : defaults();
      }
      if (typeof value.updatedAt !== "string" || new Date(value.updatedAt).toISOString() !== value.updatedAt) return defaults();
      return value;
    } catch {
      return defaults();
    }
  };

  let storage;
  let state = defaults();
  try {
    storage = window.localStorage;
    state = parse(storage.getItem(STORAGE_KEY));
  } catch {
    // Storage restrictions leave a safe in-memory default.
  }

  const getState = () => Object.freeze({ ...state });
  const apply = (next) => {
    if (fields.every((key) => state[key] === next[key])) return getState();
    state = next;
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: getState() }));
    return getState();
  };

  const setPreferences = (preferences) => {
    let analytics;
    let advertising;
    try {
      ({ analytics, advertising } = preferences);
    } catch {
      return getState();
    }
    if (typeof analytics !== "boolean" || typeof advertising !== "boolean") return getState();
    if (state.choiceMade && state.analytics === analytics && state.advertising === advertising) return getState();
    const next = {
      version: VERSION,
      necessary: true,
      analytics,
      advertising,
      choiceMade: true,
      updatedAt: new Date().toISOString(),
    };
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Avoid restoring a stale grant if writing the changed choice fails.
      try {
        storage?.removeItem(STORAGE_KEY);
      } catch {
        // The explicit choice still applies in memory.
      }
    }
    return apply(next);
  };

  const reset = () => {
    try {
      storage?.removeItem(STORAGE_KEY);
    } catch {
      try {
        storage?.setItem(STORAGE_KEY, JSON.stringify(defaults()));
      } catch {
        // Reset still denies optional consent in memory.
      }
    }
    return apply(defaults());
  };

  window.addEventListener("storage", (event) => {
    if (!storage || event.storageArea !== storage) return;
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    try {
      apply(parse(storage.getItem(STORAGE_KEY)));
    } catch {
      apply(defaults());
    }
  });

  window.MONDConsent = Object.freeze({
    getState,
    setPreferences,
    acceptAll: () => setPreferences({ analytics: true, advertising: true }),
    rejectOptional: () => setPreferences({ analytics: false, advertising: false }),
    hasConsent: (category) => ["necessary", "analytics", "advertising"].includes(category) && state[category] === true,
    reset,
  });
})();
