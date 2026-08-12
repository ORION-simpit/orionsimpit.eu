(() => {
  "use strict";

  const progress = document.querySelector("[data-reveal-progress]");
  const counter = document.querySelector("#boot-percent");
  if (!progress || !counter) return;

  progress.setAttribute("pathLength", "100");

  const sync = () => {
    const match = counter.textContent.match(/^(\d{1,3})%$/);
    if (!match) return;
    const value = Math.max(0, Math.min(100, Number(match[1])));
    progress.style.strokeDasharray = `${value} ${100 - value}`;
    progress.style.strokeDashoffset = "0";
  };

  const observer = new MutationObserver(sync);
  observer.observe(counter, { childList: true, characterData: true, subtree: true });
  sync();
  addEventListener("pagehide", () => observer.disconnect(), { once: true });
})();
