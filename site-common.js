(() => {
  const setupSiteStyles = () => {

    const isProjectPage = Boolean(document.querySelector('link[href*="project-page.css"]'));
    document.documentElement.classList.add(isProjectPage ? "mond-project-page" : "mond-mobile-footer-enabled");
    if (isProjectPage) {
      document.querySelectorAll(".case-project-nav").forEach((nav) => nav.classList.add("is-visible"));
    }

    const style = document.createElement("style");
    style.textContent = `
      .hero__nav,
      .hero__nav a,
      .hero__nav-word {
        font-family: "Mona Sans", sans-serif !important;
        font-weight: 450 !important;
        -webkit-font-smoothing: auto !important;
      }
      @media (max-width: 720px) {
        .hero__nav,
        .hero__nav a,
        .hero__nav-word {
          font-weight: 450 !important;
        }
      }
      @media (max-width: 600px) {
        .mond-project-page .site-footer {
          display: none !important;
        }
      }
      html.lenis,
      html.lenis body {
        height: auto;
      }
      html.lenis.lenis-smooth {
        scroll-behavior: auto !important;
      }
      html.lenis.lenis-stopped {
        overflow: hidden;
      }
      .mond-page-transition {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        visibility: hidden;
        overflow: hidden;
        pointer-events: none;
      }
      .mond-page-transition.is-active {
        visibility: visible;
      }
      .mond-page-transition__panel {
        position: absolute;
        inset: 0;
        background: #f7f7f7;
        transform: translate3d(0, 100%, 0);
        transition: transform 560ms cubic-bezier(0.76, 0, 0.24, 1);
        will-change: transform;
      }
      .mond-page-transition--landing .mond-page-transition__panel {
        background: #000;
      }
      .mond-page-transition.is-active .mond-page-transition__panel {
        transform: translate3d(0, 0, 0);
      }
      .mond-page-transition.is-arriving {
        visibility: visible;
      }
      .mond-page-transition.is-arriving .mond-page-transition__panel {
        transform: translate3d(0, 0, 0);
      }
      .mond-page-transition.is-arriving.is-exiting .mond-page-transition__panel {
        transform: translate3d(0, -100%, 0);
      }
      html.mond-landing-entry .hero,
      html.mond-landing-entry .about-section,
      html.mond-landing-entry .work-section,
      html.mond-landing-entry .site-footer {
        opacity: 0;
        transform: translateY(18px);
        transition: opacity 1040ms ease, transform 1120ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      html.mond-landing-entry.is-landing-entry-ready .hero,
      html.mond-landing-entry.is-landing-entry-ready .about-section,
      html.mond-landing-entry.is-landing-entry-ready .work-section,
      html.mond-landing-entry.is-landing-entry-ready .site-footer {
        opacity: 1;
        transform: translateY(0);
      }
      @media (max-width: 600px) {
        .mond-mobile-footer-enabled .site-footer.footer-section,
        .mond-mobile-footer-enabled .site-footer {
          position: relative !important;
          width: calc(100vw - 20px) !important;
          max-width: calc(100vw - 20px) !important;
          min-height: auto !important;
          margin: 10px !important;
          padding: 60px 0 0 !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
          border: 0 !important;
          border-radius: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }
        .mond-mobile-footer-enabled .site-footer,
        .mond-mobile-footer-enabled .site-footer * {
          font-family: "Mona Sans", "Helvetica Neue", Arial, sans-serif !important;
        }
        .mond-mobile-footer-enabled .site-footer .footer-content {
          position: relative !important;
          display: flex !important;
          flex-direction: column !important;
          width: 100% !important;
          min-height: auto !important;
        }
        .mond-mobile-footer-enabled .site-footer .footer-social-minimal,
        .mond-mobile-footer-enabled .site-footer .footer-contact-block,
        .mond-mobile-footer-enabled .site-footer .footer-brand-minimal {
          position: static !important;
          inset: auto !important;
          width: 100% !important;
          max-width: none !important;
          transform: none !important;
          text-align: left !important;
        }
        .mond-mobile-footer-enabled .site-footer .footer-social-minimal {
          order: 1;
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 30px !important;
        }
        .mond-mobile-footer-enabled .site-footer .footer-social-minimal a {
          margin: 0 !important;
          color: inherit !important;
          font-size: 30px !important;
          font-weight: 550 !important;
          line-height: 1 !important;
          letter-spacing: 0 !important;
        }
        .mond-mobile-footer-enabled .site-footer .footer-contact-block {
          order: 2;
          margin-top: 8svh !important;
          color: inherit !important;
          white-space: nowrap !important;
          font-size: 14.375px !important;
          font-weight: 400 !important;
          line-height: 23.125px !important;
          letter-spacing: -0.02em !important;
        }
        .mond-mobile-footer-enabled .site-footer .footer-email {
          color: inherit !important;
        }
        .mond-mobile-footer-enabled .site-footer .footer-brand-minimal {
          order: 3;
          margin-top: 5svh !important;
          margin-bottom: 0 !important;
          color: inherit !important;
        }
        .mond-mobile-footer-enabled .site-footer .footer-brand-minimal__logo {
          width: 100% !important;
          height: auto !important;
          aspect-ratio: 377 / 100;
          background-color: currentColor !important;
          -webkit-mask-image: url("/mobile%20footer%20logo.svg") !important;
          mask-image: url("/mobile%20footer%20logo.svg") !important;
          -webkit-mask-repeat: no-repeat !important;
          mask-repeat: no-repeat !important;
          -webkit-mask-size: 100% 100% !important;
          mask-size: 100% 100% !important;
          -webkit-mask-position: left bottom !important;
          mask-position: left bottom !important;
        }
        .mond-mobile-footer-enabled .site-footer .footer-copy-minimal {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setupSiteStyles();
      setupVideoCompatibility();
    }, { once: true });
  } else {
    setupSiteStyles();
    setupVideoCompatibility();
  }

  const setupPageTransitions = () => {
    const projectPaths = new Set([
      "/multitool/", "/intermezzo/", "/lesser-of-two-evils/", "/friss-kakas/",
      "/re-mind/", "/walk-with-me/", "/marty-restaurants/", "/macn/",
      "/dream-ville-software/", "/maier-jewelry/", "/olivo-bistro/"
    ]);
    const blackTransitionPaths = new Set(["/", "/work/", "/about/"]);
    const transitionKey = "mond:work-to-intermezzo";
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    window.addEventListener("pageshow", (event) => {
      if (!event.persisted) return;
      document.querySelectorAll(".mond-page-transition").forEach((overlay) => overlay.remove());
    });

    const createOverlay = (arriving = false, landing = false) => {
      const overlay = document.createElement("div");
      const panel = document.createElement("div");
      overlay.className = `mond-page-transition${arriving ? " is-arriving" : ""}${landing ? " mond-page-transition--landing" : ""}`;
      panel.className = "mond-page-transition__panel";
      overlay.setAttribute("aria-hidden", "true");
      overlay.appendChild(panel);
      document.body.appendChild(overlay);
      return overlay;
    };

    if (window.location.pathname === "/" && !prefersReducedMotion) {
      try {
        if (sessionStorage.getItem(transitionKey)) {
          document.documentElement.classList.add("mond-landing-entry");
          const overlay = createOverlay(true, true);
          requestAnimationFrame(() => {
            overlay.classList.add("is-exiting");
            document.documentElement.classList.add("is-landing-entry-ready");
          });
          window.setTimeout(() => {
            overlay.remove();
            document.documentElement.classList.remove("mond-landing-entry", "is-landing-entry-ready");
            sessionStorage.removeItem(transitionKey);
          }, 900);
        }
      } catch (error) {
        // Navigation still works when session storage is unavailable.
      }
    }

    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;

      const isProject = projectPaths.has(destination.pathname);
      const usesBlackTransition = blackTransitionPaths.has(destination.pathname);
      if ((!isProject && !usesBlackTransition) || destination.pathname === window.location.pathname || prefersReducedMotion) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      try {
        sessionStorage.setItem(transitionKey, JSON.stringify({ timestamp: Date.now() }));
      } catch (error) {
        // The outgoing transition does not depend on persisted state.
      }

      const overlay = createOverlay(false, usesBlackTransition);
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

    const nav = document.querySelector(".hero__nav");
    if (!nav || nav.querySelector(".hero__nav-home")) return;

    const style = document.createElement("style");
    style.textContent = `
      .hero__nav .hero__nav-home {
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
