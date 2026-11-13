(() => {
  const key = Symbol.for("MOND.clarity");
  if (window[key] || !window.MONDConsent) return;
  window[key] = true;

  let requested = false;
  const synchronize = () => {
    const state = window.MONDConsent.getState();
    const permitted = state.choiceMade === true && state.analytics === true;
    if (!requested && !permitted) return;

    window.clarity = window.clarity || function () {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
    window.clarity("consentv2", {
      analytics_Storage: permitted ? "granted" : "denied",
      ad_Storage: permitted && state.advertising === true ? "granted" : "denied",
    });

    if (requested) return;
    requested = true;
    const script = document.createElement("script");
    script.id = "mond-clarity-script";
    script.async = true;
    script.src = "https://www.clarity.ms/tag/z8du4dnxk5";
    document.head.appendChild(script);
  };

  window.addEventListener("mond:consentchange", synchronize);
  synchronize();
})();
