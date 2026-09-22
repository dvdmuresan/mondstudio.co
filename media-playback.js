/* Start visible muted media immediately; loading and scrolling are not play gates. */
(() => {
  const videos = [...document.querySelectorAll('.projects-gallery__item video, .pl-video, .post-placeholder-panel__video, .case-gallery__video')];
  if (!videos.length) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const states = new Map();
  let active = true;
  let frame = 0;
  const automatic = () => !reducedMotion.matches && connection?.saveData !== true;

  const bounds = video => {
    const rect = video.getBoundingClientRect();
    const rendered = rect.width > 0 && rect.height > 0 && getComputedStyle(video).visibility !== 'hidden';
    const horizontal = rect.right > 0 && rect.left < innerWidth;
    return {
      near: rendered && horizontal && rect.bottom > -300 && rect.top < innerHeight + 300,
      visible: rendered && horizontal && rect.bottom > 0 && rect.top < innerHeight
    };
  };
  const prepare = video => {
    if (video.preload === 'none') video.preload = 'metadata';
    if (video.dataset.src && !video.getAttribute('src')) video.src = video.dataset.src;
  };
  const hideFallback = state => { if (state.button) state.button.hidden = true; };
  const showFallback = (video, state) => {
    // A real browser policy restriction still needs an accessible escape hatch.
    if (!video.matches('.case-gallery__video') || !state.wanted) return;
    if (!state.button) {
      state.button = document.createElement('button');
      state.button.type = 'button';
      state.button.className = 'case-video-play';
      state.button.setAttribute('data-video-play-fallback', '');
      state.button.setAttribute('aria-label', `Play ${video.getAttribute('aria-label') || 'project video'}`);
      const icon = document.createElement('span');
      icon.setAttribute('aria-hidden', 'true');
      state.button.append(icon);
      video.parentElement.append(state.button);
      bindFallback(video, state);
    }
    state.button.hidden = false;
  };
  const play = (video, state) => {
    if (!state.wanted || !active || document.hidden) return;
    if (state.pending) return;
    if (!video.paused) { hideFallback(state); return; }
    // Retry when readiness or visibility actually changes, without exhausting
    // a lifetime budget before the browser has finished revealing the video.
    if (state.attemptedRevision === state.revision) return;
    state.attemptedRevision = state.revision;
    state.pending = true;
    const finish = error => {
      state.pending = false;
      if (!state.wanted || !active || document.hidden) { video.pause(); return; }
      if (!video.paused) hideFallback(state);
      else if (error?.name === 'NotAllowedError') showFallback(video, state);
      // A readiness/visibility event received during a pending request still
      // gets one attempt. A rejection alone never schedules another request.
      if (state.attemptedRevision !== state.revision) play(video, state);
    };
    try {
      const attempt = video.play();
      if (attempt?.then) attempt.then(() => finish(), finish);
      else finish();
    } catch (error) { finish(error); }
  };
  const bindFallback = (video, state) => {
    state.button.addEventListener('click', () => {
      state.manual = true;
      state.wanted = true;
      state.revision += 1;
      prepare(video);
      play(video, state);
    });
  };
  const sync = () => {
    frame = 0;
    videos.forEach(video => {
      const state = states.get(video);
      const position = bounds(video);
      const enabled = active && !document.hidden && (automatic() || state.manual);
      const wanted = enabled && position.visible;
      if (wanted !== state.wanted) state.revision += 1;
      state.wanted = wanted;
      // Set autoplay before attaching a deferred source, so WebKit can also
      // start it natively when decoding and visibility become ready.
      if (video.autoplay !== wanted) video.autoplay = wanted;
      if (wanted) video.preload = 'auto';
      if (enabled && position.near) prepare(video);
      if (wanted) play(video, state);
      else { video.pause(); hideFallback(state); }
    });
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };

  videos.forEach(video => {
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    const button = document.getElementById(video.dataset.playButton || '');
    const state = {wanted: false, pending: false, manual: false, revision: 0, attemptedRevision: -1, button};
    states.set(video, state);
    if (button) { button.hidden = true; bindFallback(video, state); }
    video.addEventListener('playing', () => {
      hideFallback(state);
      if (!state.wanted || !active || document.hidden) video.pause();
    });
    for (const event of ['loadedmetadata', 'loadeddata', 'canplay']) {
      video.addEventListener(event, () => {
        state.revision += 1;
        if (state.wanted) play(video, state);
        else schedule();
      });
    }
  });
  if ('IntersectionObserver' in window) {
    const near = new IntersectionObserver(schedule, {rootMargin: '300px 0px', threshold: 0});
    const visible = new IntersectionObserver(schedule, {threshold: 0});
    videos.forEach(video => { near.observe(video); visible.observe(video); });
  } else window.addEventListener('scroll', schedule, {passive: true});
  if ('ResizeObserver' in window) {
    const resize = new ResizeObserver(schedule);
    videos.forEach(video => resize.observe(video));
  }
  window.addEventListener('resize', schedule, {passive: true});
  const resume = () => {
    states.forEach(state => { state.revision += 1; });
    sync();
  };
  window.addEventListener('load', resume, {once: true});
  window.addEventListener('pageshow', () => {
    active = true;
    resume();
  });
  window.addEventListener('pagehide', () => { active = false; sync(); });
  document.addEventListener('visibilitychange', resume);
  window.addEventListener('focus', resume);
  for (const event of ['transitionend', 'animationend']) {
    document.addEventListener(event, event => {
      let affected = false;
      videos.forEach(video => {
        if (!event.target.contains(video)) return;
        states.get(video).revision += 1;
        affected = true;
      });
      if (affected) schedule();
    });
  }
  reducedMotion.addEventListener('change', sync);
  connection?.addEventListener?.('change', sync);
  document.fonts?.ready.then(schedule);
  sync();
  schedule();
})();
