(() => {
  "use strict";

  const root = document.querySelector("#orion");
  const skip = document.querySelector("#boot-skip");
  const labels = ["POWER BUS", "CORE SYSTEMS", "CONTROL LAYERS", "PLUGIN BUS", "NAV LINK"];
  document.querySelector("#boot-lines").innerHTML = labels
    .map(value => `<span class="boot-line">${value}<b>STANDBY</b></span>`)
    .join("");

  function syncHotspots() {
    const { width, height } = root.getBoundingClientRect();
    const source = window.OrionReveal.SOURCE;
    const scale = Math.max(width / source.width, height / source.height);
    const artworkWidth = source.width * scale;
    const artworkHeight = source.height * scale;
    const artworkX = (width - artworkWidth) / 2;
    const artworkY = (height - artworkHeight) / 2;
    const values = {
      "--apply-left": artworkX + artworkWidth * 0.311,
      "--apply-top": artworkY + artworkHeight * 0.628,
      "--apply-width": artworkWidth * 0.373,
      "--apply-height": artworkHeight * 0.082,
      "--private-left": artworkX + artworkWidth * 0.367,
      "--private-top": artworkY + artworkHeight * 0.728,
      "--private-width": artworkWidth * 0.267,
      "--private-height": artworkHeight * 0.045,
    };
    Object.entries(values).forEach(([name, value]) => root.style.setProperty(name, `${value}px`));
  }

  function finalReady() {
    root.classList.add("final-ready");
    skip.hidden = true;
  }

  const reveal = window.OrionReveal.create(root, { onComplete: finalReady });
  const immediate = matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.addEventListener("resize", syncHotspots);
  window.addEventListener("pagehide", () => reveal.destroy(), { once: true });
  skip.addEventListener("click", () => {
    reveal.finalState({ notify: false });
    finalReady();
  });

  window.OrionReveal.applyGeometry(root);
  syncHotspots();
  reveal.preflight(() => immediate ? (reveal.finalState({ notify: false }), finalReady()) : reveal.run());
})();
