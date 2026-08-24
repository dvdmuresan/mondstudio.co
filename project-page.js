/* Shared fixed project HUD and full-viewport cover. */
    (() => {
      const desktopProjectLayout = window.matchMedia('(min-width: 721px)');
      desktopProjectLayout.addEventListener('change', () => window.location.reload());
      if (!desktopProjectLayout.matches) return;

      const hero = document.querySelector('.hero');
      const main = document.querySelector('.case-main');
      const heading = main?.querySelector('.case-heading');
      const title = heading?.querySelector('.case-intro__copy');
      const gallery = main?.querySelector('.case-gallery');
      if (!hero || !main || !heading || !title || !gallery) return;

      let cover = hero.querySelector('.project-cover');

      if (!cover) {
        cover = gallery.querySelector('figure');
        if (!cover) return;

        const formerParent = cover.parentElement;
        hero.prepend(cover);

        if (formerParent?.classList.contains('case-gallery__row') && !formerParent.children.length) {
          formerParent.remove();
        }

        if (!gallery.children.length) gallery.remove();
      }

      const coverMedia = cover.querySelector('img, video');
      if (!coverMedia) return;

      cover.classList.remove('case-media-reveal', 'is-visible');
      cover.classList.add('project-cover');
      cover.removeAttribute('style');
      coverMedia.classList.add('project-cover__media');
      hero.classList.add('project-cover-host');
      document.body.classList.add('has-project-cover');

      const hud = document.createElement('div');
      hud.className = 'project-hud';
      hud.setAttribute('aria-label', 'Project position and title');

      const number = document.createElement('span');
      number.className = 'project-hud__number';
      number.setAttribute('aria-label', 'Project number');
      number.textContent = '--';

      const name = document.createElement('span');
      name.className = 'project-hud__name';
      name.textContent = title.textContent.trim();

      hud.append(number, name);
      hero.before(hud);

      const normalizePath = (value, base = window.location.href) => {
        const path = new URL(value, base).pathname.replace(/\/+$/, '');
        return `${path || ''}/`;
      };

      const currentPath = normalizePath(window.location.href);
      const workURL = new URL('/work/', window.location.href).href;

      fetch(workURL)
        .then((response) => {
          if (!response.ok) throw new Error(`Unable to load Work page: ${response.status}`);
          return response.text();
        })
        .then((markup) => {
          const workDocument = new DOMParser().parseFromString(markup, 'text/html');
          const projects = Array.from(workDocument.querySelectorAll('.projects-gallery figure[data-project-path]'));
          const projectIndex = projects.findIndex((project) => normalizePath(project.dataset.projectPath, workURL) === currentPath);
          if (projectIndex < 0) throw new Error('Current project is missing from the Work page order.');

          const workTitle = projects[projectIndex].querySelector('.projects-gallery__caption-title')?.textContent.trim();
          number.textContent = String(projectIndex + 1).padStart(2, '0');
          if (workTitle) name.textContent = workTitle;
        })
        .catch(() => {
          number.textContent = '--';
        });

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (reduceMotion.matches) return;

      let frame = 0;
      const updateParallax = () => {
        frame = 0;
        const offset = Math.min(window.scrollY, window.innerHeight) * 0.18;
        coverMedia.style.setProperty('--project-cover-parallax', `${offset}px`);
      };

      const requestParallaxUpdate = () => {
        if (frame) return;
        frame = window.requestAnimationFrame(updateParallax);
      };

      updateParallax();
      window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
      window.addEventListener('resize', requestParallaxUpdate, { passive: true });
    })();

/* Case reveal animations */
    (function () {
      const root = document.documentElement;
      const revealEls = document.querySelectorAll('.case-reveal');
      const mediaEls = document.querySelectorAll('.case-media-reveal');
      if (!revealEls.length && !mediaEls.length) return;

      const activate = (el) => el.classList.add('is-visible');
      const startReveal = () => {
        mediaEls.forEach(activate);

        if (!revealEls.length) return;

        if (!('IntersectionObserver' in window)) {
          revealEls.forEach(activate);
          return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              activate(entry.target);
              obs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

        revealEls.forEach((el) => observer.observe(el));
      };

      if (root.classList.contains('project-entry-transition')) {
        if (root.classList.contains('is-case-reveal-ready')) {
          startReveal();
          return;
        }

        window.addEventListener('mond:intermezzo-entry-reveal', startReveal, { once: true });
        return;
      }

      startReveal();
    })();

    (() => {
      const cursor = document.querySelector('.case-project-cursor');
      const links = document.querySelectorAll('.case-project-nav--portal [data-cursor-image]');
      const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

      if (!cursor || !links.length || !canHover.matches) return;

      const moveCursor = (event) => {
        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
      };

      links.forEach((link) => {
        link.addEventListener('mouseenter', (event) => {
          cursor.style.backgroundImage = `url('${link.dataset.cursorImage}')`;
          cursor.style.display = 'block';
          moveCursor(event);
        });
        link.addEventListener('mousemove', moveCursor);
        link.addEventListener('mouseleave', () => {
          cursor.style.display = 'none';
          cursor.style.backgroundImage = '';
        });
      });
    })();

    (() => {
      const videos = Array.from(document.querySelectorAll(".case-gallery__video:not([data-manual-playback])"));
      if (!videos.length) return;

      const play = (video) => {
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");
        const attempt = video.play();
        if (attempt && typeof attempt.catch === "function") attempt.catch(() => {});
      };

      videos.forEach((video) => {
        video.preload = "none";
      });

      if (!("IntersectionObserver" in window)) {
        videos.forEach(play);
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.preload = "metadata";
            play(video);
          } else {
            video.pause();
          }
        });
      }, { rootMargin: "300px 0px", threshold: 0.01 });

      videos.forEach((video) => observer.observe(video));
    })();

    (() => {
      const manualVideos = document.querySelectorAll("video[data-manual-playback]");

      manualVideos.forEach((video) => {
        const playButton = video.parentElement?.querySelector(".case-video-play");
        if (!playButton) return;

        const updateButton = () => {
          playButton.hidden = !video.paused && !video.ended;
        };

        playButton.addEventListener("click", () => {
          const attempt = video.play();
          if (attempt && typeof attempt.catch === "function") {
            attempt.catch(() => updateButton());
          }
        });

        video.addEventListener("play", updateButton);
        video.addEventListener("pause", updateButton);
        video.addEventListener("ended", updateButton);
        updateButton();
      });
    })();

    // Enable click-and-drag scrolling on the gallery.
    (() => {
      const galleries = document.querySelectorAll(".case-gallery");
      galleries.forEach((gallery) => {
        let isDragging = false;
        let hasDragged = false;
        let startX = 0;
        let startScroll = 0;

        const endDrag = (e) => {
          if (!isDragging) return;
          isDragging = false;
          gallery.classList.remove("is-dragging");
          if (e && e.pointerId !== undefined && gallery.hasPointerCapture(e.pointerId)) {
            gallery.releasePointerCapture(e.pointerId);
          }
        };

        gallery.addEventListener("pointerdown", (e) => {
          if (e.target.closest("video[data-manual-playback], .case-video-play")) return;
          isDragging = true;
          hasDragged = false;
          startX = e.clientX;
          startScroll = gallery.scrollLeft;
          gallery.setPointerCapture(e.pointerId);
          gallery.classList.add("is-dragging");
          e.preventDefault();
        });

        gallery.addEventListener("pointermove", (e) => {
          if (!isDragging) return;
          const deltaX = e.clientX - startX;
          if (Math.abs(deltaX) > 6) {
            hasDragged = true;
          }
          gallery.scrollLeft = startScroll - deltaX;
        });

        gallery.addEventListener("click", (e) => {
          if (!hasDragged) return;
          e.preventDefault();
          e.stopPropagation();
          hasDragged = false;
        }, true);

        gallery.addEventListener("pointerup", endDrag);
        gallery.addEventListener("pointercancel", endDrag);
        gallery.addEventListener("pointerleave", endDrag);
      });

    })();

    (() => {
      const lightbox = document.getElementById("image-lightbox");
      const lightboxImage = lightbox?.querySelector(".image-lightbox__image");
      const closeButton = lightbox?.querySelector(".image-lightbox__close");
      const prevButton = lightbox?.querySelector(".image-lightbox__prev");
      const nextButton = lightbox?.querySelector(".image-lightbox__next");
      const counter = lightbox?.querySelector(".image-lightbox__counter");
      const galleryImages = Array.from(document.querySelectorAll(".case-gallery figure img"));

      if (!lightbox || !lightboxImage || !closeButton || !prevButton || !nextButton || !counter || !galleryImages.length) {
        return;
      }

      let activeIndex = 0;

      const updateImage = () => {
        const image = galleryImages[activeIndex];
        lightboxImage.src = image.currentSrc || image.src;
        lightboxImage.alt = image.alt;
        counter.textContent = `${activeIndex + 1} / ${galleryImages.length}`;
      };

      const openLightbox = (index) => {
        activeIndex = index;
        updateImage();
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("lightbox-open");
        closeButton.focus({ preventScroll: true });
      };

      const closeLightbox = () => {
        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.classList.remove("lightbox-open");
        lightboxImage.removeAttribute("src");
      };

      const showOffset = (offset) => {
        activeIndex = (activeIndex + offset + galleryImages.length) % galleryImages.length;
        updateImage();
      };

      galleryImages.forEach((image, index) => {
        const figure = image.closest("figure");
        figure?.setAttribute("tabindex", "0");
        figure?.setAttribute("role", "button");
        figure?.setAttribute("aria-label", `Open image ${index + 1} of ${galleryImages.length}`);

        figure?.addEventListener("click", () => openLightbox(index));
        figure?.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightbox(index);
          }
        });
      });

      closeButton.addEventListener("click", closeLightbox);
      prevButton.addEventListener("click", () => showOffset(-1));
      nextButton.addEventListener("click", () => showOffset(1));

      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox || e.target.classList.contains("image-lightbox__stage")) {
          closeLightbox();
        }
      });

      document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("is-open")) return;

        if (e.key === "Escape") {
          closeLightbox();
        } else if (e.key === "ArrowLeft") {
          showOffset(-1);
        } else if (e.key === "ArrowRight") {
          showOffset(1);
        }
      });
    })();
