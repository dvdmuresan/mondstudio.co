(() => {
  const services = document.querySelector('.home-services');
  if (!services || !Element.prototype.animate) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const entries = [...services.querySelectorAll('.home-service')].map((item) => ({
    item,
    summary: item.querySelector('summary'),
    content: item.querySelector('.home-service__content'),
    expanded: item.open,
    animations: [],
  }));

  const settle = (entry) => {
    entry.animations.forEach((animation) => animation.cancel());
    entry.animations = [];
    entry.item.open = entry.expanded;
    entry.item.classList.remove('is-closing');
    entry.content.inert = !entry.expanded;
    entry.summary.setAttribute('aria-expanded', String(entry.expanded));
  };

  const setExpanded = (entry, expanded) => {
    if (entry.expanded === expanded) return;
    const { item, summary, content } = entry;
    const wasOpen = item.open;
    const startHeight = item.getBoundingClientRect().height;
    const summaryStyle = getComputedStyle(summary);
    const startSummary = {
      height: `${summary.getBoundingClientRect().height}px`,
      paddingTop: summaryStyle.paddingTop,
      paddingBottom: summaryStyle.paddingBottom,
    };
    const contentStyle = getComputedStyle(content);
    const startContent = {
      opacity: wasOpen ? contentStyle.opacity : '0',
      transform: wasOpen ? contentStyle.transform : 'translateY(-6px)',
    };

    entry.animations.forEach((animation) => animation.cancel());
    entry.animations = [];
    entry.expanded = expanded;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      settle(entry);
      return;
    }

    // Keep the content rendered until the collapse has finished.
    item.open = true;
    item.classList.toggle('is-closing', !expanded);
    content.inert = !expanded;
    summary.setAttribute('aria-expanded', String(expanded));
    const targetStyle = getComputedStyle(summary);
    const targetHeight = expanded ? item.getBoundingClientRect().height : 30;
    const targetSummary = {
      height: expanded ? `${summary.getBoundingClientRect().height}px` : '30px',
      paddingTop: expanded ? targetStyle.paddingTop : '0px',
      paddingBottom: expanded ? targetStyle.paddingBottom : '0px',
    };
    const timing = {
      duration: expanded ? 460 : 360,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'both',
    };
    const heightAnimation = item.animate([
      { height: `${startHeight}px` },
      { height: `${targetHeight}px` },
    ], timing);
    entry.animations = [
      heightAnimation,
      summary.animate([startSummary, targetSummary], timing),
      content.animate([
        startContent,
        { opacity: expanded ? '1' : '0', transform: expanded ? 'translateY(0)' : 'translateY(-6px)' },
      ], { ...timing, duration: expanded ? 320 : 180, delay: expanded && !wasOpen ? 60 : 0 }),
    ];
    heightAnimation.onfinish = () => settle(entry);
  };

  entries.forEach((entry) => {
    // JS coordinates closing animations; without it, native exclusive details work.
    entry.item.removeAttribute('name');
    settle(entry);
    entry.summary.addEventListener('click', (event) => {
      event.preventDefault();
      const expanded = !entry.expanded;
      if (expanded) {
        entries.forEach((other) => {
          if (other !== entry) setExpanded(other, false);
        });
      }
      setExpanded(entry, expanded);
    });
  });
  services.classList.add('is-animated');

  // Reflow safely after orientation changes or an updated motion preference.
  const settleAll = () => entries.forEach(settle);
  window.addEventListener('resize', settleAll, { passive: true });
  reducedMotion.addEventListener('change', settleAll);
})();

// Original desktop service image previews.
    (() => {
      const serviceBox = document.getElementById('pl-4-services');
      const services = Array.from(document.querySelectorAll('.pl-4-service'));
      const preview = document.getElementById('pl-4-service-preview');
      const previewImage = preview?.querySelector('img');
      const desktopHover = window.matchMedia('(min-width: 861px) and (hover: hover) and (pointer: fine)');
      if (!serviceBox || !services.length || !preview || !previewImage) return;

      const positionPreview = () => {
        if (!desktopHover.matches) return;
        const box = serviceBox.getBoundingClientRect();
        const previewWidth = 143.36;
        const previewHeight = 179.2;
        const gap = 14;
        const left = box.right + gap + previewWidth <= window.innerWidth - 20
          ? box.right + gap
          : box.left - previewWidth - gap;
        const top = box.top + Math.max(0, (box.height - previewHeight) / 2);
        preview.style.left = `${Math.max(20, left)}px`;
        preview.style.top = `${Math.max(20, Math.min(top, window.innerHeight - previewHeight - 20))}px`;
      };

      const showPreview = (service) => {
        if (!desktopHover.matches) return;
        const source = service.dataset.previewImage;
        if (!source) return;
        positionPreview();
        previewImage.src = source;
        preview.classList.add('is-visible');
      };

      const hidePreview = () => preview.classList.remove('is-visible');

      services.forEach((service) => {
        service.addEventListener('mouseenter', () => showPreview(service));
        service.addEventListener('mouseleave', hidePreview);
        service.addEventListener('focus', () => showPreview(service));
        service.addEventListener('blur', hidePreview);
      });

      window.addEventListener('resize', positionPreview);
      window.addEventListener('scroll', positionPreview, { passive: true });
      desktopHover.addEventListener('change', hidePreview);
    })();
