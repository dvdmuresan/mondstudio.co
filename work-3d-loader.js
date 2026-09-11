const rockModel = document.getElementById("rock-model");

if (rockModel) {
  let loaded = false;
  let observer;
  let resizeObserver;

  const stopWatching = () => {
    observer?.disconnect();
    resizeObserver?.disconnect();
    window.removeEventListener("resize", loadModel);
  };

  const isVisible = () => {
    // Keep this eligibility rule aligned with work-3d-model.js.
    if (document.body.classList.contains("view-image")) return false;
    const style = window.getComputedStyle(rockModel);
    const rect = rockModel.getBoundingClientRect();
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.visibility !== "collapse" &&
      rect.width > 0 &&
      rect.height > 0
    );
  };

  const loadModel = () => {
    if (loaded || !isVisible()) return;
    loaded = true;
    import("./work-3d-model.js")
      .then(stopWatching)
      .catch(() => {
        loaded = false;
      });
  };

  loadModel();

  if (!loaded) {
    observer = new MutationObserver(loadModel);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    observer.observe(rockModel, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    window.addEventListener("resize", loadModel, { passive: true });
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(loadModel);
      resizeObserver.observe(rockModel);
    }
  }
}
