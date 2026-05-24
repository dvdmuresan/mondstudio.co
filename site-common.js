(() => {
  const clockConfigs = [
    { el: document.getElementById("ro-clock"), timeZone: "Europe/Bucharest" },
    { el: document.getElementById("hu-clock"), timeZone: "Europe/Budapest" },
  ].filter(({ el }) => el);

  if (clockConfigs.length) {
    const formatters = new Map();

    const getFormatter = (timeZone) => {
      if (!formatters.has(timeZone)) {
        formatters.set(
          timeZone,
          new Intl.DateTimeFormat("en-GB", {
            timeZone,
            hour12: true,
            hour: "numeric",
            minute: "2-digit",
          })
        );
      }
      return formatters.get(timeZone);
    };

    const updateClock = () => {
      clockConfigs.forEach(({ el, timeZone }) => {
        const formatter = getFormatter(timeZone);
        const parts = formatter.formatToParts(new Date());
        const get = (type) => parts.find((part) => part.type === type)?.value || "";
        const time = `${get("hour")}:${get("minute")} ${get("dayPeriod")?.toUpperCase() || ""}`.trim();
        el.textContent = `(${time})`;
      });
    };

    updateClock();
    window.setInterval(updateClock, 30 * 1000);
  }
})();
