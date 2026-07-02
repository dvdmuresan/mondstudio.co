const rockModel = document.getElementById("rock-model");

if (rockModel) {
  let loaded = false;

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
    import("./work-3d-model.js").catch(() => {
      loaded = false;
    });
  };

  loadModel();

  const observer = new MutationObserver(loadModel);
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
