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
      const videos = Array.from(document.querySelectorAll(".case-gallery__video"));
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
