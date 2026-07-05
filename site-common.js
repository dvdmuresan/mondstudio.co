(() => {
  const accessStorageKey = "mondAccessGranted";
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  if (currentPage !== "wip.html") {
    let hasAccess = false;

    try {
      hasAccess = window.sessionStorage.getItem(accessStorageKey) === "true";
    } catch (error) {
      hasAccess = false;
    }

    if (!hasAccess) {
      window.location.href = "wip.html";
      return;
    }
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
