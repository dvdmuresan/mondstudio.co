import Lenis from 'https://esm.sh/@studio-freight/lenis@1.0.33?bundle';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let lenis;

const enableLenis = () => {
  if (lenis) {
    lenis.start();
    return;
  }

  lenis = new Lenis({
    smoothWheel: true,
    duration: 1.5,
  });
};

const raf = (time) => {
  if (lenis) {
    lenis.raf(time);
  }
  requestAnimationFrame(raf);
};

if (!prefersReducedMotion.matches) {
  enableLenis();
}

requestAnimationFrame(raf);

const handlePreferenceChange = (event) => {
  if (event.matches) {
    lenis?.stop();
  } else {
    enableLenis();
  }
};

if (prefersReducedMotion.addEventListener) {
  prefersReducedMotion.addEventListener('change', handlePreferenceChange);
} else if (prefersReducedMotion.addListener) {
  prefersReducedMotion.addListener(handlePreferenceChange);
}
