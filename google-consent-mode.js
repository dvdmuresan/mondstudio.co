// Local consent commands only. No Google script, measurement or storage.
const key = Symbol.for("MOND.googleConsentMode");

const foundation = window[key] || (() => {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  const mapConsent = (state) => {
    const analytics = state?.choiceMade === true && state.analytics === true;
    const advertising = state?.choiceMade === true && state.advertising === true;
    return {
      analytics_storage: analytics ? "granted" : "denied",
      ad_storage: advertising ? "granted" : "denied",
      ad_user_data: advertising ? "granted" : "denied",
      ad_personalization: advertising ? "granted" : "denied",
    };
  };

  const denied = mapConsent();
  window.gtag("consent", "default", denied);
  let lastMapping = JSON.stringify(denied);
  let lastChoice = false;
  let connected = false;

  const synchronize = () => {
    // Read the authority, not potentially stale or synthetic event details.
    const state = window.MONDConsent.getState();
    const mapped = mapConsent(state);
    const signature = JSON.stringify(mapped);
    const firstChoice = state.choiceMade === true && !lastChoice;
    lastChoice = state.choiceMade === true;
    // Record an explicit initial rejection once; reset of an already denied
    // mapping needs no command. Timestamp-only changes never repeat updates.
    if (signature === lastMapping && !firstChoice) return;
    lastMapping = signature;
    window.gtag("consent", "update", mapped);
  };

  const connectConsent = () => {
    if (connected) return true;
    if (!window.MONDConsent) return false;
    window.addEventListener("mond:consentchange", synchronize);
    synchronize();
    connected = true;
    return true;
  };

  return Object.freeze({ connectConsent });
})();

// Shared across repeated evaluations, including imports with different URLs.
window[key] = foundation;
export const connectConsent = foundation.connectConsent;
