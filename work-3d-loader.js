const rockModel = document.getElementById("rock-model");

if (rockModel) {
  let loaded = false;
  let observer;

  const stopWatching = () => {
    observer?.disconnect();
    window.removeEventListener("resize", loadModel);
  };

  const isVisible = () => {
    const style = window.getComputedStyle(rockModel);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      rockModel.getClientRects().length > 0
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
  }
}
