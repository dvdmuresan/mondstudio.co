(() => {
  import("/google-consent-mode.js")
    .catch(() => null)
    .then(async (consentMode) => {
      await import("/consent-state.js");
      const connected = consentMode?.connectConsent();
      // P4 default and persisted update precede the opt-in-only GA4 loader.
      await import("/consent-ui.js?v=20260917-engagement-1");
      if (connected) return import("/google-analytics.js");
    })
    .catch(() => {});

  const setupSiteStyles = () => {

    const isProjectPage = Boolean(document.querySelector('link[href*="project-page.css"]'));
    document.documentElement.classList.add(isProjectPage ? "mond-project-page" : "mond-mobile-footer-enabled");
    if (isProjectPage) {
      document.querySelectorAll(".case-project-nav").forEach((nav) => nav.classList.add("is-visible"));
    }

  };

  const setupVideoCompatibility = () => {
    document.querySelectorAll("video").forEach((video) => {
      if (video.hasAttribute("muted")) {
        video.defaultMuted = true;
        video.muted = true;
      }
      if (video.hasAttribute("playsinline")) {
        video.playsInline = true;
        video.setAttribute("webkit-playsinline", "");
      }
    });
  };

  const setupMobileMenuStability = () => {
    const header = document.querySelector(".hero__top");
    if (!header) return;

    const syncMenuState = () => {
      document.documentElement.classList.toggle("mond-mobile-menu-open", header.classList.contains("is-open"));
    };

    syncMenuState();
    new MutationObserver(syncMenuState).observe(header, {
      attributes: true,
      attributeFilter: ["class"],
    });
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) {
        // Native navigation leaves the departing menu visible until replacement.
        // A history restore must reopen the page with its menu and lock cleared.
        const nav = header.querySelector(".hero__nav");
        const toggle = header.querySelector(".hero__menu-toggle");
        if (nav && toggle) {
          const previousTransition = nav.style.transition;
          nav.style.transition = "none";
          header.classList.remove("is-open", "is-preopening", "is-closing");
          toggle.setAttribute("aria-expanded", "false");
          toggle.setAttribute("aria-label", "Open menu");
          nav.getBoundingClientRect();
          nav.style.transition = previousTransition;
        }
      }
      syncMenuState();
    });
  };

  const setupMobileNavigationFooter = () => {
    const nav = document.querySelector(".hero__nav, .privacy-nav");
    if (!nav || nav.querySelector(".hero__nav-footer")) return;

    const footer = document.createElement("div");
    footer.className = "hero__nav-footer";
    footer.innerHTML = `
      <p class="hero__nav-footer__label">CHANNELS</p>
      <div class="hero__nav-footer__links">
        <a href="https://www.instagram.com/studio_mond/" target="_blank" rel="noopener noreferrer">INSTAGRAM</a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">FACEBOOK</a>
      </div>
      <div class="hero__nav-footer__copyright">©2026 MOND : STUDIO</div>
    `;
    nav.appendChild(footer);
  };

  const setupMobileFooterCopyright = () => {
    document.querySelectorAll(".footer-brand-minimal").forEach((brand) => {
      if (brand.querySelector(".footer-brand-minimal__mobile-copy")) return;

      const copyright = document.createElement("span");
      copyright.className = "footer-brand-minimal__mobile-copy";
      copyright.setAttribute("aria-label", "©2026 MOND : STUDIO");

      const year = document.createElement("span");
      year.textContent = "©2026";

      const studio = document.createElement("span");
      studio.className = "footer-brand-minimal__mobile-studio";
      studio.textContent = "MOND : STUDIO";

      copyright.append(year, studio);
      brand.appendChild(copyright);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setupSiteStyles();
      setupVideoCompatibility();
      setupMobileMenuStability();
      setupMobileNavigationFooter();
      setupMobileFooterCopyright();
    }, { once: true });
  } else {
    setupSiteStyles();
    setupVideoCompatibility();
    setupMobileMenuStability();
    setupMobileNavigationFooter();
    setupMobileFooterCopyright();
  }

  const setupPageTransitions = () => {
    const projectPaths = new Set([
      "/multitool/", "/intermezzo/", "/lesser-of-two-evils/", "/friss-kakas/",
      "/re-mind/", "/walk-with-me/", "/marty-restaurants/", "/macn/",
      "/dream-ville-software/", "/maier-jewelry/", "/olivo-bistro/"
    ]);
    const nativeNavigationPaths = new Set(["/", "/work/", "/about/"]);
    const transitionKey = "mond:work-to-intermezzo";
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    window.addEventListener("pageshow", (event) => {
      if (!event.persisted) return;
      document.querySelectorAll(".mond-page-transition").forEach((overlay) => overlay.remove());
    });

    const createOverlay = () => {
      const overlay = document.createElement("div");
      const panel = document.createElement("div");
      overlay.className = "mond-page-transition";
      panel.className = "mond-page-transition__panel";
      overlay.setAttribute("aria-hidden", "true");
      overlay.appendChild(panel);
      document.body.appendChild(overlay);
      return overlay;
    };

    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;

      const isProject = projectPaths.has(destination.pathname);
      const usesNativeNavigation = nativeNavigationPaths.has(destination.pathname);
      if ((!isProject && !usesNativeNavigation) || destination.pathname === window.location.pathname) return;

      if (usesNativeNavigation) {
        // Keep the open menu in place while the browser loads the destination;
        // suppress its close animation without preventing the link's default action.
        event.stopImmediatePropagation();
        try {
          // Clear only for a main-page destination; project arrivals still use it.
          sessionStorage.removeItem(transitionKey);
        } catch (error) {
          // Native navigation does not depend on browser storage.
        }
        return;
      }
      if (prefersReducedMotion) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      try {
        sessionStorage.setItem(transitionKey, JSON.stringify({ timestamp: Date.now() }));
      } catch (error) {
        // The outgoing transition does not depend on persisted state.
      }

      const overlay = createOverlay();
      overlay.getBoundingClientRect();
      requestAnimationFrame(() => overlay.classList.add("is-active"));
      window.setTimeout(() => {
        window.location.href = destination.href;
      }, 560);
    }, true);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupPageTransitions, { once: true });
  } else {
    setupPageTransitions();
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

(() => {
  const setupMobileHomeNavigation = () => {
    const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";
    if (normalizedPath === "/" || normalizedPath === "/index.html") return;

    const nav = document.querySelector(".hero__nav, .privacy-nav");
    if (!nav || nav.querySelector(".hero__nav-home")) return;

    const style = document.createElement("style");
    style.textContent = `
      .hero__nav .hero__nav-home, .privacy-nav .hero__nav-home {
        display: none !important;
      }

      @media (max-width: 720px) {
        .hero__nav .hero__nav-home {
          display: block !important;
        }

        .hero__top.is-open .hero__nav a:nth-child(5) .hero__nav-word {
          transition-delay: 1040ms;
        }
      }
    `;
    document.head.appendChild(style);

    const homeLink = document.createElement("a");
    homeLink.className = "hero__nav-home";
    homeLink.href = "/";
    homeLink.innerHTML = '<span class="hero__nav-word">HOME</span>';
    nav.prepend(homeLink);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupMobileHomeNavigation, { once: true });
  } else {
    setupMobileHomeNavigation();
  }
})();
