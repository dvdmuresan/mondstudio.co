(() => {
  const CONSENT_KEY = "mond_cookie_consent";

  const readConsent = () => {
    try {
      const value = window.localStorage.getItem(CONSENT_KEY);
      return value === "accepted" || value === "declined" ? value : null;
    } catch (error) {
      return null;
    }
  };

  const writeConsent = (value) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch (error) {
      // Consent still applies for this page when storage is unavailable.
    }
  };

  const removeAnalyticsCookies = () => {
    const cookieNames = document.cookie
      .split(";")
      .map((cookie) => cookie.split("=")[0].trim())
      .filter((name) => name === "_ga" || name.startsWith("_ga_"));
    const hostname = window.location.hostname;
    const domains = ["", hostname, `.${hostname}`];

    cookieNames.forEach((name) => {
      domains.forEach((domain) => {
        const domainPart = domain ? `; domain=${domain}` : "";
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}; SameSite=Lax`;
      });
    });
  };

  const setupConsentControls = () => {
    if (document.getElementById("mond-consent")) return;

    const style = document.createElement("style");
    style.textContent = `
      .mond-consent {
        position: fixed;
        z-index: 2147483646;
        right: 20px;
        bottom: 20px;
        width: min(420px, calc(100vw - 40px));
        box-sizing: border-box;
        padding: 16px;
        border: 0;
        border-radius: 7px;
        background: rgba(255, 255, 255, 0.20);
        color: #fff;
        font-family: "Mona Sans", Arial, sans-serif;
        font-size: 13px;
        line-height: 1.4;
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
      }
      .mond-consent,
      .mond-consent * {
        font-family: "Mona Sans", Arial, sans-serif;
      }
      body[data-theme="light"] .mond-consent {
        background: rgba(255, 255, 255, 0.65);
        color: #131313;
      }
      .mond-consent[hidden] { display: none; }
      .mond-consent__text { margin: 0 0 14px; }
      .mond-consent__actions { display: flex; gap: 18px; }
      .mond-consent__button,
      .mond-cookie-settings,
      .mond-footer-privacy {
        appearance: none;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: 11px;
        font-weight: 600;
        line-height: 1.5;
        letter-spacing: .08em;
        text-transform: uppercase;
        cursor: pointer;
      }
      .mond-consent__button.is-selected {
        border-bottom: 1px solid currentColor;
      }
      .mond-consent__button:focus-visible,
      .mond-cookie-settings:focus-visible,
      .mond-footer-privacy:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 4px;
      }
      .mond-footer-legal {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
        margin-top: 12px;
      }
      .mond-cookie-settings,
      .mond-footer-privacy {
        opacity: .75;
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        line-height: inherit;
        letter-spacing: inherit;
        text-decoration: none;
      }
      @media (max-width: 600px) {
        .mond-consent {
          right: 12px;
          bottom: 12px;
          width: calc(100vw - 24px);
          padding: 14px;
        }
        .mond-footer-legal {
          width: 100%;
          justify-content: flex-start;
          align-items: center;
          text-align: left;
        }
      }
    `;
    document.head.appendChild(style);

    const banner = document.createElement("section");
    banner.id = "mond-consent";
    banner.className = "mond-consent";
    banner.setAttribute("aria-label", "Analytics consent");
    const savedConsent = readConsent();
    banner.innerHTML = `
      <p class="mond-consent__text">We use analytics to understand how the website is used.</p>
      <div class="mond-consent__actions">
        <button class="mond-consent__button${savedConsent === "accepted" ? " is-selected" : ""}" type="button" data-consent="accepted" aria-pressed="${savedConsent === "accepted"}">Accept</button>
        <button class="mond-consent__button${savedConsent === "declined" ? " is-selected" : ""}" type="button" data-consent="declined" aria-pressed="${savedConsent === "declined"}">Decline</button>
      </div>
    `;
    banner.hidden = Boolean(savedConsent);
    document.body.appendChild(banner);

    const settingsButton = document.createElement("button");
    settingsButton.type = "button";
    settingsButton.className = "mond-cookie-settings";
    settingsButton.textContent = "Cookie settings";
    settingsButton.setAttribute("aria-controls", banner.id);
    settingsButton.setAttribute("aria-expanded", "false");
    const footerTarget = document.querySelector(".site-footer .footer-copy-minimal") || document.querySelector("footer") || document.body;
    const footerLegal = document.createElement("div");
    footerLegal.className = "mond-footer-legal";
    const privacyLink = document.createElement("a");
    privacyLink.className = "mond-footer-privacy";
    privacyLink.href = "/privacy/";
    privacyLink.textContent = "Privacy";
    footerLegal.append(privacyLink, settingsButton);
    footerTarget.appendChild(footerLegal);

    let reopened = false;
    const closeBanner = () => {
      banner.hidden = true;
      reopened = false;
      settingsButton.setAttribute("aria-expanded", "false");
    };

    banner.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-consent]");
      if (!button) return;
      const value = button.dataset.consent;
      window.gtag?.("consent", "update", {
        analytics_storage: value === "accepted" ? "granted" : "denied",
      });
      writeConsent(value);
      banner.querySelectorAll("button[data-consent]").forEach((consentButton) => {
        const isSelected = consentButton.dataset.consent === value;
        consentButton.classList.toggle("is-selected", isSelected);
        consentButton.setAttribute("aria-pressed", String(isSelected));
      });
      if (value === "declined") removeAnalyticsCookies();
      closeBanner();
      settingsButton.focus();
    });

    settingsButton.addEventListener("click", () => {
      reopened = true;
      banner.hidden = false;
      settingsButton.setAttribute("aria-expanded", "true");
      banner.querySelector("button").focus();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !reopened || banner.hidden) return;
      closeBanner();
      settingsButton.focus();
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupConsentControls, { once: true });
  } else {
    setupConsentControls();
  }

  const applyTheme = (theme) => {
    const resolved = theme === "light" ? "light" : "dark";
    document.body.dataset.theme = resolved;
    document.body.style.colorScheme = resolved;
  };

  applyTheme(document.body.dataset.theme || "dark");

  const clockConfigs = [
    { el: document.getElementById("ro-clock"), timeZone: "Europe/Bucharest" },
    { el: document.getElementById("hu-clock"), timeZone: "Europe/Budapest" },
  ].filter(({ el }) => el);

  if (clockConfigs.length) {
    const formatters = new Map();

    const getFormatter = (timeZone) => {
      if (!formatters.has(timeZone)) {
        formatters.set(
          timeZone,
          new Intl.DateTimeFormat("en-GB", {
            timeZone,
            hour12: true,
            hour: "numeric",
            minute: "2-digit",
          })
        );
      }
      return formatters.get(timeZone);
    };

    const updateClock = () => {
      clockConfigs.forEach(({ el, timeZone }) => {
        const formatter = getFormatter(timeZone);
        const parts = formatter.formatToParts(new Date());
        const get = (type) => parts.find((part) => part.type === type)?.value || "";
        const time = `${get("hour")}:${get("minute")} ${get("dayPeriod")?.toUpperCase() || ""}`.trim();
        el.textContent = `(${time})`;
      });
    };

    updateClock();
    window.setInterval(updateClock, 30 * 1000);
  }

  const setupEmailCopyCursor = () => {
    const emailLinks = Array.from(document.querySelectorAll('a[href^="mailto:"]'));
    if (!emailLinks.length) return;

    if (!document.getElementById("mond-email-copy-cursor-style")) {
      const style = document.createElement("style");
      style.id = "mond-email-copy-cursor-style";
      style.textContent = `
        .copied-cursor-tag {
          --copy-cursor-x: -9999px;
          --copy-cursor-y: -9999px;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 2147483647;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: calc((44px / 1.15) * 0.8625);
          padding: 0 calc((22px / 1.15) * 0.8625);
          border-radius: 8px;
          border: 0;
          background: rgba(255, 255, 255, 0.20);
          color: var(--color-white, #ffffff);
          font-family: "Mona Sans", sans-serif;
          font-size: calc((15px / 1.15) * 0.8625);
          font-weight: 500;
          line-height: 1;
          text-transform: none;
          letter-spacing: 0.6px;
          opacity: 0;
          pointer-events: none;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          transform: translate3d(var(--copy-cursor-x), var(--copy-cursor-y), 0) translate(12px, 12px) scale(.96);
          transition:
            opacity 180ms ease,
            transform 180ms ease,
            background-color 180ms ease,
            color 180ms ease;
          will-change: transform, opacity;
        }

        .copied-cursor-tag.is-visible {
          opacity: 1;
          transform: translate3d(var(--copy-cursor-x), var(--copy-cursor-y), 0) translate(12px, 12px) scale(1);
        }

        body[data-theme="light"] .copied-cursor-tag {
          background: rgba(19, 19, 19, 0.12);
          color: #131313;
        }
      `;
      document.head.appendChild(style);
    }

    const copiedTag = document.createElement("span");
    copiedTag.className = "copied-cursor-tag";
    copiedTag.setAttribute("aria-hidden", "true");
    copiedTag.textContent = "Copied!";
    document.body.appendChild(copiedTag);

    let hideTimer;

    const positionCopiedTag = (event) => {
      copiedTag.style.setProperty("--copy-cursor-x", `${event.clientX}px`);
      copiedTag.style.setProperty("--copy-cursor-y", `${event.clientY}px`);
    };

    const getEmail = (link) => {
      const href = link.getAttribute("href") || "";
      const rawValue = href.replace(/^mailto:/i, "").split("?")[0];
      try {
        return decodeURIComponent(rawValue).trim();
      } catch (error) {
        return rawValue.trim();
      }
    };

    const fallbackCopy = (value) => {
      const textArea = document.createElement("textarea");
      textArea.value = value;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
    };

    const copyEmail = async (value) => {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return;
      }
      fallbackCopy(value);
    };

    emailLinks.forEach((emailLink) => {
      emailLink.addEventListener("pointermove", positionCopiedTag);
      emailLink.addEventListener("click", async (event) => {
        const email = getEmail(emailLink);
        if (!email) return;

        event.preventDefault();
        positionCopiedTag(event);

        try {
          await copyEmail(email);
        } catch (error) {
          fallbackCopy(email);
        }

        copiedTag.classList.add("is-visible");
        window.clearTimeout(hideTimer);
        hideTimer = window.setTimeout(() => {
          copiedTag.classList.remove("is-visible");
        }, 1200);
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupEmailCopyCursor, { once: true });
  } else {
    setupEmailCopyCursor();
  }

  const shortWords = [
    "a",
    "an",
    "and",
    "as",
    "at",
    "be",
    "by",
    "do",
    "for",
    "if",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "so",
    "the",
    "to",
    "up",
    "via",
  ];
  const shortWordPattern = new RegExp(
    `(^|[\\s([{'"“‘])(${shortWords.join("|")})([ \\t\\r\\n]+)(?=\\S)`,
    "giu"
  );
  const ignoredTypographyTags = new Set([
    "SCRIPT",
    "STYLE",
    "TEXTAREA",
    "INPUT",
    "SELECT",
    "OPTION",
    "CODE",
    "PRE",
    "KBD",
    "SAMP",
  ]);

  const protectShortWords = (root = document.body) => {
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || ignoredTypographyTags.has(parent.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }

        if (!node.nodeValue || !shortWordPattern.test(node.nodeValue)) {
          shortWordPattern.lastIndex = 0;
          return NodeFilter.FILTER_REJECT;
        }

        shortWordPattern.lastIndex = 0;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const nodes = [];
    let node = walker.nextNode();

    while (node) {
      nodes.push(node);
      node = walker.nextNode();
    }

    nodes.forEach((textNode) => {
      let nextValue = textNode.nodeValue;
      let previousValue = "";

      while (nextValue !== previousValue) {
        previousValue = nextValue;
        nextValue = nextValue.replace(shortWordPattern, "$1$2\u00a0");
      }

      textNode.nodeValue = nextValue;
      shortWordPattern.lastIndex = 0;
    });
  };

  const runTypographyPass = () => protectShortWords();

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(runTypographyPass, { timeout: 1200 });
  } else {
    window.setTimeout(runTypographyPass, 0);
  }

  window.mondProtectShortWords = protectShortWords;
})();
