/* Reuse the approved navigation, scoped to this preview route. */
(() => {
      const header = document.querySelector('.privacy-header');
      const toggle = header.querySelector('.privacy-menu-toggle');
      const nav = header.querySelector('.privacy-nav');
      const mobile = window.matchMedia('(max-width: 720px)');
      const syncLayout = () => {
        header.classList.toggle('hero__top', mobile.matches);
        nav.classList.toggle('hero__nav', mobile.matches);
        nav.querySelectorAll(':scope > a > span').forEach(word => word.classList.toggle('hero__nav-word', mobile.matches));
      };
      const setOpen = (open) => {
        header.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        document.documentElement.classList.toggle('mond-mobile-menu-open', open);
        document.querySelector('.inquiry-main').inert = open;
        // Safari does not focus buttons on pointer activation by default.
        // Keep keyboard navigation inside the opened menu on every browser.
        if (open) toggle.focus();
      };
      header.classList.add('is-menu-ready');
      syncLayout();
      toggle.addEventListener('click', () => setOpen(mobile.matches && !header.classList.contains('is-open')));
      nav.addEventListener('click', (event) => {
        if (event.target.closest('a')) setOpen(false);
      });
      document.addEventListener('keydown', (event) => {
        if (!header.classList.contains('is-open')) return;
        if (event.key === 'Escape') {
          setOpen(false);
          toggle.focus();
        } else if (event.key === 'Tab') {
          const last = Array.from(nav.querySelectorAll('a')).at(-1);
          if (event.shiftKey && document.activeElement === toggle) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            toggle.focus();
          }
        }
      });
      mobile.addEventListener('change', () => { setOpen(false); syncLayout(); });
      const syncScroll = () => document.body.classList.toggle('has-scrolled', window.scrollY > 0);
      window.addEventListener('scroll', syncScroll, { passive: true });
      syncScroll();
      window.addEventListener('pageshow', (event) => {
        // Reset a restored menu, not one opened while the initial page loads.
        if (event.persisted) setOpen(false);
      });
    })();
