// Basic Consent Mode: one approved GA4 destination, loaded only after opt-in.
const initializeAnalytics = () => {
  const key = Symbol.for("MOND.analytics");
  if (window[key] || !window.MONDConsent || typeof window.gtag !== "function") return;
  window[key] = true;

  const measurementId = "G-EHS2KKDC09";
  const disableKey = `ga-disable-${measurementId}`;
  let requested = false;
  let loaded = false;
  let configured = false;
  let pending = [];
  const permitted = () => {
    const state = window.MONDConsent.getState();
    return state.choiceMade === true && state.analytics === true;
  };
  const cleanURL = (value) => {
    try {
      const url = new URL(value);
      return /^https?:$/.test(url.protocol) ? url.origin + url.pathname : "";
    } catch {
      return "";
    }
  };
  const configure = () => {
    if (!loaded || !permitted()) return;
    if (!configured) {
      configured = true;
      window.gtag("js", new Date());
      // The single config sends the standard page_view. No manual page_view.
      window.gtag("config", measurementId, {
        page_location: cleanURL(window.location.href),
        page_referrer: cleanURL(document.referrer),
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
    }
    const events = pending;
    pending = [];
    events.forEach(([name, parameters]) => window.gtag("event", name, parameters));
  };
  const synchronize = () => {
    if (!permitted()) {
      pending = [];
      return;
    }
    if (!requested) {
      requested = true;
      const script = document.createElement("script");
      script.id = "mond-ga4-script";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.onload = () => {
        loaded = true;
        configure();
      };
      script.onerror = () => { pending = []; };
      document.head.appendChild(script);
    }
    configure();
  };
  // Capture runs before P4's consent update listener. Revoke disables delivery
  // before the already-loaded Google tag can process a denied-state update.
  const updateDelivery = () => { window[disableKey] = !permitted(); };
  window.addEventListener("mond:consentchange", updateDelivery, { capture: true });
  window.addEventListener("mond:consentchange", synchronize);
  updateDelivery();

  // Private event helper: only audited controls can supply editorial values.
  const allowedParameters = {
    work_filter_service: ["filter_name"],
    work_filter_industry: ["filter_name"],
    project_navigation: ["direction", "project_name", "current_project"],
    email_click: ["location"],
  };
  const track = (name, parameters) => {
    if (!permitted() || !Object.hasOwn(allowedParameters, name)) return;
    const clean = {};
    for (const field of allowedParameters[name]) {
      const value = parameters[field];
      if (typeof value !== "string" || !value || value.length > 100) return;
      clean[field] = value;
    }
    if (configured) window.gtag("event", name, clean);
    else if (pending.length < 20) pending.push([name, clean]);
  };
  const editorialText = (value) => value?.replace(/\s+/g, " ").trim().slice(0, 100) || "";

  if (window.location.pathname === "/work/") {
    document.querySelectorAll("[data-service-filters], [data-industry-filters]").forEach((container) => {
      // Filters are populated by Work's DOMContentLoaded handler. Delegate only
      // inside these audited controls, after the target's selection handler.
      container.addEventListener("click", (event) => {
        const button = event.target.closest?.(".projects-filter__button[data-filter-type]");
        if (!button || !container.contains(button) || button.getAttribute("aria-pressed") !== "true") return;
        const type = button.dataset.filterType;
        if (!["service", "industry"].includes(type)) return;
        const model = window.MOND_WORK_TAXONOMY;
        const options = type === "service" ? model?.serviceFilterOptions : model?.taxonomies?.industries;
        const option = options?.find((item) => item.id === button.dataset.filterId);
        if (option) track(`work_filter_${type}`, { filter_name: option.label });
      });
    });
  }

  const currentProject = editorialText(document.querySelector("main h1, h1")?.innerText);
  const projectLinks = new Map();
  document.querySelectorAll(".case-project-nav__button").forEach((link) => {
    const label = link.getAttribute("aria-label") || "";
    const match = /^(Previous|Next) project:\s*(.+)$/i.exec(label);
    if (!match) return;
    const parameters = {
      direction: match[1].toLowerCase(),
      project_name: editorialText(match[2]),
      current_project: currentProject,
    };
    projectLinks.set(link, parameters);
  });
  // The existing page transition stops propagation at document capture.
  // Observe only audited project links before it; never prevent navigation.
  if (projectLinks.size) window.addEventListener("click", (event) => {
    const link = event.target.closest?.(".case-project-nav__button");
    const parameters = projectLinks.get(link);
    if (parameters) track("project_navigation", parameters);
  }, { capture: true });
  document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
    const location = link.closest("footer") ? "footer"
      : link.closest("nav") ? "navigation"
      : window.location.pathname === "/about/" ? "about"
      : window.location.pathname === "/privacy/" ? "privacy" : "contact";
    link.addEventListener("click", () => track("email_click", { location }));
  });
  synchronize();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAnalytics, { once: true });
} else {
  initializeAnalytics();
}
