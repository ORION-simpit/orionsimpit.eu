(() => {
  "use strict";

  const root = document.querySelector("#orion");
  const skip = document.querySelector("#boot-skip");
  const labels = ["POWER BUS", "CORE SYSTEMS", "CONTROL LAYERS", "PLUGIN BUS", "NAV LINK"];
  const releaseStamp = document.querySelector("#release-version");
  const channels = Object.freeze({ alpha: "ALPHA", beta: "BETA", stable: "RELEASE" });
  const versionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
  document.querySelector("#boot-lines").innerHTML = labels
    .map(value => `<span class="boot-line">${value}<b>STANDBY</b></span>`)
    .join("");

  function syncHotspots() {
    const geometry = window.OrionReveal.applyGeometry(root);
    const artworkWidth = geometry.renderedWidth;
    const artworkHeight = geometry.renderedHeight;
    const artworkX = geometry.left;
    const artworkY = geometry.top;
    const values = {
      "--apply-left": artworkX + artworkWidth * 0.311,
      "--apply-top": artworkY + artworkHeight * 0.628,
      "--apply-width": artworkWidth * 0.373,
      "--apply-height": artworkHeight * 0.082,
      "--private-left": artworkX + artworkWidth * 0.367,
      "--private-top": artworkY + artworkHeight * 0.728,
      "--private-width": artworkWidth * 0.267,
      "--private-height": artworkHeight * 0.045,
      "--release-meta-left": artworkX + artworkWidth * (560 / 1536),
      "--release-meta-top": artworkY + artworkHeight * (738 / 1024),
      "--release-meta-width": artworkWidth * (416 / 1536),
      "--release-meta-height": artworkHeight * (74 / 1024),
      "--release-alphaMeta-left": artworkX + artworkWidth * (560 / 1536),
      "--release-alphaMeta-top": artworkY + artworkHeight * (786 / 1024),
      "--release-alphaMeta-width": artworkWidth * (416 / 1536),
      "--release-alphaMeta-height": artworkHeight * (38 / 1024),
    };
    Object.entries(values).forEach(([name, value]) => root.style.setProperty(name, `${value}px`));
  }

  async function loadRelease() {
    const html = document.documentElement;
    const fallbackChannel = channels[html.dataset.releaseChannel] ? html.dataset.releaseChannel : "alpha";
    const fallbackVersion = versionPattern.test(html.dataset.releaseVersion || "") ? html.dataset.releaseVersion : "0.1.0";
    let manifest = { channel: fallbackChannel, name: html.dataset.releaseName || channels[fallbackChannel], version: fallbackVersion };
    try {
      const response = await fetch("release.json", { cache: "no-store", headers: { accept: "application/json" } });
      if (response.ok) {
        const candidate = await response.json();
        const channel = channels[candidate.channel] ? candidate.channel : fallbackChannel;
        manifest = { channel, name: String(candidate.name || channels[channel]).trim().slice(0, 24) || channels[channel], version: versionPattern.test(String(candidate.version || "")) ? String(candidate.version) : fallbackVersion };
      }
    } catch (_) {
      // Embedded metadata keeps the landing available during transient failures.
    }
    html.dataset.releaseChannel = manifest.channel;
    html.dataset.releaseVersion = manifest.version;
    root.dataset.activeRelease = manifest.channel;
    releaseStamp.querySelector("strong").textContent = manifest.name;
    releaseStamp.querySelector("small").textContent = `v${manifest.version}`;
    releaseStamp.setAttribute("aria-label", `${manifest.name} version ${manifest.version}`);
    syncHotspots();
  }

  function finalReady() {
    root.classList.add("final-ready");
    skip.hidden = true;
  }

  const reveal = window.OrionReveal.create(root, { onComplete: finalReady });
  const immediate = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const viewport = window.visualViewport;
  window.addEventListener("resize", syncHotspots);
  viewport?.addEventListener("resize", syncHotspots);
  viewport?.addEventListener("scroll", syncHotspots);
  window.addEventListener("pagehide", () => {
    viewport?.removeEventListener("resize", syncHotspots);
    viewport?.removeEventListener("scroll", syncHotspots);
    reveal.destroy();
  }, { once: true });
  skip.addEventListener("click", () => {
    reveal.finalState({ notify: false });
    finalReady();
  });

  syncHotspots();
  loadRelease();
  reveal.preflight(() => immediate ? (reveal.finalState({ notify: false }), finalReady()) : reveal.run());
})();
