// UI consumes MONDConsent; only the state module reads or writes preferences.
const mountConsentUI = async () => {
  const consent = window.MONDConsent;
  if (!consent || document.getElementById("mond-consent-prompt")) return;

  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "/consent-ui.css";
  // Do not expose an unstyled or unusable prompt if the stylesheet fails.
  await new Promise((resolve, reject) => {
    stylesheet.onload = resolve;
    stylesheet.onerror = reject;
    document.head.appendChild(stylesheet);
  });

  const utility = document.createElement("nav");
  utility.className = "mond-consent-utility";
  utility.setAttribute("aria-label", "Privacy controls");
  utility.innerHTML = `<button type="button" aria-haspopup="dialog" aria-controls="mond-consent-settings">Cookie Settings</button><a href="/privacy/">Privacy Policy</a>`;
  const opener = utility.querySelector("button");

  const prompt = document.createElement("section");
  prompt.id = "mond-consent-prompt";
  prompt.className = "mond-consent";
  prompt.setAttribute("aria-labelledby", "mond-consent-title");
  prompt.setAttribute("data-lenis-prevent", "");
  prompt.hidden = true;
  prompt.innerHTML = `
    <h2 id="mond-consent-title">Privacy preferences</h2>
    <p>We use essential browser storage for site functionality and your preferences. Google Analytics is optional and loads only with your permission. Advertising technologies are not active.</p>
    <div class="mond-consent-actions">
      <button type="button" data-choice="accept">Accept all</button>
      <button type="button" data-choice="reject">Reject optional</button>
      <button type="button" data-choice="manage" aria-haspopup="dialog" aria-controls="mond-consent-settings">Manage preferences</button>
    </div>`;

  const dialog = document.createElement("dialog");
  dialog.id = "mond-consent-settings";
  dialog.className = "mond-consent";
  dialog.setAttribute("aria-labelledby", "mond-consent-settings-title");
  dialog.setAttribute("aria-describedby", "mond-consent-settings-description");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("data-lenis-prevent", "");
  dialog.innerHTML = `
    <h2 id="mond-consent-settings-title" tabindex="-1">Privacy preferences</h2>
    <p id="mond-consent-settings-description">Choose what you allow. Google Analytics loads only with Analytics permission. Advertising technologies are not active.</p>
    <form>
      <label class="mond-consent-category"><span><strong id="mond-consent-necessary-label">Necessary</strong><span id="mond-consent-necessary-description">Always on. Required for basic site functionality and saving your preferences.</span></span><input type="checkbox" checked disabled aria-labelledby="mond-consent-necessary-label" aria-describedby="mond-consent-necessary-description"></label>
      <label class="mond-consent-category"><span><strong id="mond-consent-analytics-label">Analytics</strong><span id="mond-consent-analytics-description">Optional measurement of site usage.</span></span><input type="checkbox" name="analytics" aria-labelledby="mond-consent-analytics-label" aria-describedby="mond-consent-analytics-description"></label>
      <label class="mond-consent-category"><span><strong id="mond-consent-advertising-label">Advertising</strong><span id="mond-consent-advertising-description">Optional advertising and conversion technologies.</span></span><input type="checkbox" name="advertising" aria-labelledby="mond-consent-advertising-label" aria-describedby="mond-consent-advertising-description"></label>
      <div class="mond-consent-actions">
        <button type="submit">Save preferences</button>
        <button type="button" data-close>Cancel</button>
      </div>
    </form>
    <a class="mond-consent-policy" href="/privacy/">Privacy Policy</a>`;
  document.body.append(utility, prompt, dialog);

  const analytics = dialog.querySelector('[name="analytics"]');
  const advertising = dialog.querySelector('[name="advertising"]');
  const manage = prompt.querySelector('[data-choice="manage"]');
  let returnFocus;
  let unlockScroll;

  const readPreferences = () => {
    const state = consent.getState();
    analytics.checked = state.analytics;
    advertising.checked = state.advertising;
  };
  const focusPage = () => {
    const heading = document.querySelector("main h1, h1, main");
    if (!heading) return;
    const previous = heading.getAttribute("tabindex");
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
    if (previous === null) heading.removeAttribute("tabindex");
    else heading.setAttribute("tabindex", previous);
  };
  const lockScroll = () => {
    const x = window.scrollX;
    const y = window.scrollY;
    const body = document.body;
    const properties = ["position", "top", "left", "width", "overflow"];
    const previous = properties.map((name) => [name, body.style.getPropertyValue(name), body.style.getPropertyPriority(name)]);
    body.style.setProperty("position", "fixed");
    body.style.setProperty("top", `${-y}px`);
    body.style.setProperty("left", `${-x}px`);
    body.style.setProperty("width", "100%");
    body.style.setProperty("overflow", "hidden");
    return () => {
      previous.forEach(([name, value, priority]) => {
        if (value) body.style.setProperty(name, value, priority);
        else body.style.removeProperty(name);
      });
      window.scrollTo({ left: x, top: y, behavior: "instant" });
    };
  };
  const closeSettings = () => {
    if (!dialog.open) return;
    dialog.close();
    unlockScroll?.();
    unlockScroll = undefined;
    prompt.hidden = consent.getState().choiceMade;
    if (returnFocus?.isConnected && (returnFocus !== manage || !prompt.hidden)) {
      returnFocus.focus({ preventScroll: true });
    } else {
      focusPage();
    }
  };
  const openSettings = (source) => {
    if (dialog.open) return;
    returnFocus = source;
    readPreferences();
    unlockScroll = lockScroll();
    prompt.hidden = true;
    dialog.showModal();
    dialog.querySelector("h2").focus({ preventScroll: true });
  };
  const synchronize = () => {
    const state = consent.getState();
    readPreferences();
    if (dialog.open && !state.choiceMade) closeSettings();
    const promptHadFocus = prompt.contains(document.activeElement);
    prompt.hidden = state.choiceMade || dialog.open;
    if (promptHadFocus && prompt.hidden) focusPage();
  };

  opener.addEventListener("click", () => openSettings(opener));
  manage.addEventListener("click", () => openSettings(manage));
  prompt.querySelector('[data-choice="accept"]').addEventListener("click", () => consent.acceptAll());
  prompt.querySelector('[data-choice="reject"]').addEventListener("click", () => consent.rejectOptional());
  dialog.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    consent.setPreferences({ analytics: analytics.checked, advertising: advertising.checked });
    closeSettings();
  });
  dialog.querySelector("[data-close]").addEventListener("click", closeSettings);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeSettings();
  });
  dialog.addEventListener("keydown", (event) => {
    // Keep page-level modal shortcuts out of this dialog.
    event.stopPropagation();
    if (event.key !== "Tab") return;
    const controls = [...dialog.querySelectorAll('button, input:not(:disabled), a[href]')];
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.querySelector("h2"))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  // Native showModal supplies the top layer and an inert background.
  window.addEventListener("mond:consentchange", synchronize);
  synchronize();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => { mountConsentUI().catch(() => {}); }, { once: true });
} else {
  mountConsentUI().catch(() => {});
}
