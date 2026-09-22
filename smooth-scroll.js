const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const desktopPointer = window.matchMedia('(min-width: 721px) and (hover: hover) and (pointer: fine)');
const hasTouchInput = navigator.maxTouchPoints > 0;
let lenis;
let animationFrame;
let library;
let pageActive = true;
const eligible = () => pageActive && desktopPointer.matches && !prefersReducedMotion.matches && !hasTouchInput;

const frame = (time) => {
  if (!lenis) return;
  lenis.raf(time);
  animationFrame = window.requestAnimationFrame(frame);
};

const stopFrame = () => {
  if (!animationFrame) return;
  window.cancelAnimationFrame(animationFrame);
  animationFrame = undefined;
};

const enableLenis = async () => {
  if (lenis) {
    lenis.start();
    return;
  }

  // Optional desktop enhancement must never hold DOMContentLoaded or mobile media.
  const module = await (library ||= import('https://esm.sh/@studio-freight/lenis@1.0.33?bundle').catch(() => null));
  if (!module || !eligible() || lenis) return;
  lenis = new module.default({
    smoothWheel: true,
    smoothTouch: false,
    lerp: 0.1,
    wheelMultiplier: 1,
    prevent: (node) => Boolean(node.closest?.('[data-lenis-prevent], .hero__nav, .image-lightbox')),
  });

  animationFrame = window.requestAnimationFrame(frame);
};

const disableLenis = () => {
  stopFrame();
  lenis?.destroy();
  lenis = undefined;
};

const syncLenis = () => {
  if (eligible()) {
    enableLenis();
  } else {
    disableLenis();
  }
};

syncLenis();
prefersReducedMotion.addEventListener('change', syncLenis);
desktopPointer.addEventListener('change', syncLenis);

document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest?.('a[href]');
  if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

  const destination = new URL(link.href, window.location.href);
  if (destination.origin === window.location.origin && destination.pathname !== window.location.pathname) {
    lenis?.stop();
  }
}, { capture: true });

window.addEventListener('pagehide', () => { pageActive = false; disableLenis(); });
window.addEventListener('pageshow', () => { pageActive = true; syncLenis(); });
