/* Marty Restaurants only: size CDN sources for the existing shared lightbox. */
(() => {
  const lightbox = document.querySelector('#image-lightbox');
  const displayedImage = lightbox?.querySelector('.image-lightbox__image');
  const images = Array.from(document.querySelectorAll('img[data-lightbox-widths]'));
  if (!displayedImage || !images.length) return;

  const sources = images.map(image => ({
    image,
    base: new URL(image.dataset.lightboxSrc),
    widths: image.dataset.lightboxWidths.split(',').map(Number),
    // Retain the old full-size WebP's display cap and aspect ratio.
    width: Number(image.getAttribute('width')),
    height: Number(image.getAttribute('height'))
  }));

  const displaySize = source => {
    const mobile = window.matchMedia('(max-width: 720px)').matches;
    const padding = mobile ? 16 : Math.min(44, Math.max(16, innerWidth * 0.04));
    const stageWidth = Math.min(1500, innerWidth - padding * 2);
    // The current grid can overflow vertically for portraits. Preserve that
    // behavior rather than turning this source migration into a layout fix.
    const width = Math.min(source.width, stageWidth);
    return { width, height: width * source.height / source.width };
  };

  const activeSource = () => sources.find(source =>
    displayedImage.getAttribute('src') &&
    new URL(displayedImage.src).pathname === source.base.pathname
  );

  const preserveDisplaySize = () => {
    const source = activeSource();
    if (!source) return;
    displayedImage.style.width = `${source.width}px`;
    displayedImage.style.height = 'auto';
    displayedImage.style.aspectRatio = `${source.width} / ${source.height}`;
  };

  const updateSources = () => {
    const active = activeSource();
    sources.forEach(source => {
      const target = displaySize(source).width * (window.devicePixelRatio || 1);
      const width = source.widths.find(candidate => candidate >= target) || source.widths.at(-1);
      const url = new URL(source.base);
      url.searchParams.set('w', width);
      source.image.dataset.lightboxSrc = url.href;
    });
    if (active && !lightbox.hidden) {
      const url = active.image.dataset.lightboxSrc;
      if (displayedImage.src !== url) displayedImage.src = url;
    }
    preserveDisplaySize();
  };

  // The shared code still owns opening, navigation, focus, closing and animation.
  new MutationObserver(preserveDisplaySize).observe(displayedImage, {
    attributes: true,
    attributeFilter: ['src']
  });
  updateSources();
  window.addEventListener('resize', updateSources, { passive: true });
})();
