(() => {
  if (typeof window.matchMedia !== 'function') return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');

  if (reducedMotion.matches || !finePointer.matches || typeof window.requestAnimationFrame !== 'function') return;

  const root = document.documentElement;
  const DOM_DELTA_LINE = typeof WheelEvent === 'undefined' ? 1 : WheelEvent.DOM_DELTA_LINE;
  const DOM_DELTA_PAGE = typeof WheelEvent === 'undefined' ? 2 : WheelEvent.DOM_DELTA_PAGE;
  const scrollState = {
    current: window.scrollY || window.pageYOffset || 0,
    target: window.scrollY || window.pageYOffset || 0,
    frame: 0,
    lastTime: 0,
    active: false,
  };

  root.style.scrollBehavior = 'auto';

  const maxScroll = () => Math.max(0, root.scrollHeight - window.innerHeight);
  const clamp = (value) => Math.min(maxScroll(), Math.max(0, value));
  const ease = (deltaTime) => 1 - Math.exp(-deltaTime * 16);

  const normalizeDelta = (event) => {
    if (event.deltaMode === DOM_DELTA_LINE) return event.deltaY * 18;
    if (event.deltaMode === DOM_DELTA_PAGE) return event.deltaY * window.innerHeight;
    return event.deltaY;
  };

  const canScrollElement = (element, deltaY) => {
    if (!element || element === document.body || element === root) return false;

    const style = window.getComputedStyle(element);
    const overflowY = style.overflowY;
    const isScrollable = /(auto|scroll|overlay)/.test(overflowY) && element.scrollHeight > element.clientHeight;
    if (!isScrollable) return false;

    if (deltaY > 0) return element.scrollTop + element.clientHeight < element.scrollHeight - 1;
    if (deltaY < 0) return element.scrollTop > 1;
    return false;
  };

  const hasScrollableParent = (startElement, deltaY) => {
    let element = startElement;

    while (element && element !== document.body && element !== root) {
      if (canScrollElement(element, deltaY)) return true;
      element = element.parentElement;
    }

    return false;
  };

  const stop = () => {
    if (scrollState.frame) window.cancelAnimationFrame(scrollState.frame);
    scrollState.frame = 0;
    scrollState.lastTime = 0;
    scrollState.active = false;
  };

  const animate = (time) => {
    const previousTime = scrollState.lastTime || time;
    const deltaTime = Math.min(0.04, (time - previousTime) / 1000);
    const amount = ease(deltaTime);
    const distance = scrollState.target - scrollState.current;

    scrollState.lastTime = time;

    if (Math.abs(distance) < 0.35) {
      scrollState.current = scrollState.target;
      window.scrollTo(0, scrollState.current);
      stop();
      return;
    }

    scrollState.current += distance * amount;
    window.scrollTo(0, scrollState.current);
    scrollState.frame = window.requestAnimationFrame(animate);
  };

  const start = () => {
    if (scrollState.active) return;
    scrollState.active = true;
    scrollState.frame = window.requestAnimationFrame(animate);
  };

  window.addEventListener(
    'wheel',
    (event) => {
      if (event.defaultPrevented || event.ctrlKey || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
      if (hasScrollableParent(event.target, event.deltaY)) return;

      event.preventDefault();
      scrollState.target = clamp(scrollState.target + normalizeDelta(event));
      start();
    },
    { passive: false }
  );

  window.addEventListener(
    'scroll',
    () => {
      if (scrollState.active) return;
      scrollState.current = window.scrollY || window.pageYOffset || 0;
      scrollState.target = scrollState.current;
    },
    { passive: true }
  );

  window.addEventListener('resize', () => {
    scrollState.current = clamp(window.scrollY || window.pageYOffset || 0);
    scrollState.target = clamp(scrollState.target);
  });

  window.addEventListener('keydown', (event) => {
    if (event.defaultPrevented) return;
    if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) return;

    stop();
    scrollState.current = window.scrollY || window.pageYOffset || 0;
    scrollState.target = scrollState.current;
  });
})();
