((root, factory) => {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.OrionReveal = api;
})(typeof globalThis !== "undefined" ? globalThis : this, () => {
  "use strict";

  const ARTWORK = "/assets/orion-eclipse-v15.jpg?v=15.1";
  const SOURCE = Object.freeze({ width: 1536, height: 1024, centerX: 765, centerY: 430, radius: 192 });
  const TIMING = Object.freeze({ load: 7600, lock: 500, reveal: 1100, fade: 3200, pulse: 5200, cycle: 6600 });
  const phaseSteps = Object.freeze([
    [700, 0, "POWER BUS"],
    [1600, 1, "CORE SYSTEMS"],
    [2800, 2, "CONTROL LAYERS"],
    [4200, 3, "PLUGIN BUS"],
    [5750, 4, "NAV LINK"],
  ]);

  const select = (node, selector) => node.querySelector(selector);
  const selectAll = (node, selector) => [...node.querySelectorAll(selector)];
  const later = (timers, callback, delay) => {
    timers.push(setTimeout(callback, delay));
  };

  function geometryFor(width, height) {
    const scale = Math.max(width / SOURCE.width, height / SOURCE.height);
    const renderedWidth = SOURCE.width * scale;
    const renderedHeight = SOURCE.height * scale;
    const x = (width - renderedWidth) / 2 + SOURCE.centerX * scale;
    const y = (height - renderedHeight) / 2 + SOURCE.centerY * scale;
    const radius = SOURCE.radius * scale;
    return { x, y, radius, circumference: 2 * Math.PI * radius };
  }

  function applyGeometry(node) {
    if (!node) return null;
    const rect = node.getBoundingClientRect();
    const geometry = geometryFor(rect.width || innerWidth, rect.height || innerHeight);
    node.style.setProperty("--orion-cx", `${geometry.x}px`);
    node.style.setProperty("--orion-cy", `${geometry.y}px`);
    node.style.setProperty("--orion-radius", `${geometry.radius}px`);
    node.style.setProperty("--orion-diameter", `${geometry.radius * 2}px`);
    node.style.setProperty("--orion-r94", `${geometry.radius * 0.94}px`);
    node.style.setProperty("--orion-r100", `${geometry.radius}px`);
    node.style.setProperty("--orion-r146", `${geometry.radius * 1.46}px`);
    node.style.setProperty("--orion-r162", `${geometry.radius * 1.62}px`);
    node.style.setProperty("--orion-i-width", `${geometry.radius * 0.32}px`);
    node.style.setProperty("--orion-i-height", `${geometry.radius * 0.62}px`);
    return geometry;
  }

  function create(node, { onReveal = () => {}, onComplete = () => {}, artwork = ARTWORK } = {}) {
    if (!node) throw new TypeError("ORION reveal root is required");
    const master = select(node, "[data-reveal-master]");
    const corona = select(node, "[data-reveal-corona]");
    const ambient = select(node, "[data-reveal-ambient]");
    const bootSpace = select(node, "[data-reveal-space]");
    const progress = select(node, "[data-reveal-progress]");
    const head = select(node, "[data-reveal-head]");
    const iMark = select(node, "[data-reveal-i]");
    const hud = select(node, "[data-reveal-hud]");
    const flash = select(node, "[data-reveal-flash]");
    const error = select(node, "[data-reveal-error]");
    const rows = selectAll(node, ".boot-line");
    const counter = select(node, "#boot-percent");
    const index = select(node, "#boot-index");
    const phase = select(node, "#boot-state");
    const nominal = select(node, "#boot-nominal");
    const motion = [];
    let animationFrame = 0;
    let timers = [];
    let geometry = geometryFor(innerWidth, innerHeight);

    master.style.setProperty("--orion-artwork", `url("${artwork}")`);
    corona.style.setProperty("--orion-artwork", `url("${artwork}")`);

    function syncGeometry() {
      geometry = applyGeometry(node);
    }

    function stop() {
      cancelAnimationFrame(animationFrame);
      timers.forEach(clearTimeout);
      timers = [];
      motion.splice(0).forEach(item => item.cancel());
      corona.classList.remove("breathe");
      master.classList.remove("energized");
      ambient.classList.remove("active");
    }

    function reset() {
      stop();
      syncGeometry();
      [master, bootSpace, progress, head, iMark, hud, corona, ambient].forEach(element => {
        element.getAnimations().forEach(animation => animation.cancel());
      });
      master.style.opacity = 0;
      master.style.visibility = "hidden";
      master.style.filter = "none";
      bootSpace.style.opacity = 1;
      progress.style.opacity = 1;
      progress.style.strokeDasharray = `0 ${geometry.circumference}`;
      progress.style.strokeDashoffset = "0";
      head.style.opacity = 0;
      iMark.style.opacity = 0;
      corona.style.opacity = 0;
      corona.style.visibility = "hidden";
      ambient.style.opacity = 0;
      ambient.style.visibility = "hidden";
      hud.style.opacity = 1;
      hud.style.transform = "none";
      index.textContent = "01.";
      counter.textContent = "0%";
      phase.textContent = "INITIALISATION";
      nominal.innerHTML = "ALL SYSTEMS<br>STANDBY";
      rows.forEach(row => {
        row.classList.remove("online");
        row.querySelector("b").textContent = "STANDBY";
      });
    }

    function setHead(progressValue) {
      if (progressValue <= 0.003) {
        head.style.opacity = 0;
        return;
      }
      const angle = (-90 + progressValue * 360) * Math.PI / 180;
      const radius = geometry.radius;
      head.style.left = `${geometry.x + Math.cos(angle) * radius}px`;
      head.style.top = `${geometry.y + Math.sin(angle) * radius}px`;
      head.style.opacity = Math.min(1, progressValue * 8);
    }

    function pulse() {
      corona.classList.add("breathe");
      master.classList.add("energized");
      ambient.style.visibility = "visible";
      ambient.classList.add("active");
    }

    function finalState({ notify = true } = {}) {
      reset();
      master.style.opacity = 1;
      master.style.visibility = "visible";
      bootSpace.style.opacity = 0;
      progress.style.opacity = 0;
      head.style.opacity = 0;
      iMark.style.opacity = 1;
      hud.style.opacity = 0;
      corona.style.opacity = 0.18;
      corona.style.visibility = "visible";
      pulse();
      if (notify) {
        onReveal();
        onComplete();
      }
    }

    function run() {
      reset();
      const start = performance.now();
      phaseSteps.forEach(([delay, rowIndex, label]) => later(timers, () => {
        rows[rowIndex].classList.add("online");
        rows[rowIndex].querySelector("b").textContent = "ONLINE";
        phase.textContent = label;
      }, delay));

      function frame(now) {
        const elapsed = Math.min(1, (now - start) / TIMING.load);
        const value = elapsed < 0.12 ? elapsed / 0.12 * 0.07 : 0.07 + (elapsed - 0.12) / 0.88 * 0.93;
        const clamped = Math.min(1, value);
        const arc = clamped * geometry.circumference;
        progress.style.strokeDasharray = `${arc} ${geometry.circumference - arc}`;
        setHead(clamped);
        const percent = Math.round(clamped * 100);
        index.textContent = `${String(Math.min(5, 1 + Math.floor(elapsed * 5))).padStart(2, "0")}.`;
        counter.textContent = `${percent}%`;
        if (elapsed < 1) animationFrame = requestAnimationFrame(frame);
      }
      animationFrame = requestAnimationFrame(frame);

      later(timers, () => {
        index.textContent = "05.";
        counter.textContent = "100%";
        phase.textContent = "FINAL CHECK";
        nominal.innerHTML = "ALL SYSTEMS<br>CHECK COMPLETE";
        head.style.opacity = 0.8;
      }, TIMING.load);

      later(timers, () => {
        index.textContent = "06.";
        counter.textContent = "LOCK";
        phase.textContent = "LOCK ON";
        nominal.innerHTML = "ALL SYSTEMS<br>CALIBRATING";
        motion.push(flash.animate([{ opacity: 0 }, { opacity: 0.58, offset: 0.22 }, { opacity: 0 }], { duration: 850, easing: "ease-out" }));
      }, TIMING.load + TIMING.lock);

      later(timers, () => {
        master.style.visibility = "visible";
        corona.style.visibility = "visible";
        onReveal();
        motion.push(master.animate(
          [{ opacity: 0 }, { opacity: 0.08, offset: 0.16 }, { opacity: 0.28, offset: 0.38 }, { opacity: 0.62, offset: 0.68 }, { opacity: 0.88, offset: 0.88 }, { opacity: 1 }],
          { duration: TIMING.fade, easing: "cubic-bezier(.37,0,.2,1)", fill: "forwards" },
        ));
        motion.push(bootSpace.animate([{ opacity: 1 }, { opacity: 0.82, offset: 0.28 }, { opacity: 0.38, offset: 0.7 }, { opacity: 0 }], { duration: 3000, easing: "cubic-bezier(.37,0,.2,1)", fill: "forwards" }));
        motion.push(progress.animate([{ opacity: 1 }, { opacity: 0.82, offset: 0.3 }, { opacity: 0.42, offset: 0.67 }, { opacity: 0 }], { duration: 2700, easing: "ease-in-out", fill: "forwards" }));
        motion.push(head.animate([{ opacity: 0.8 }, { opacity: 0 }], { duration: 1450, easing: "ease-in-out", fill: "forwards" }));
        motion.push(iMark.animate([{ opacity: 0, filter: "blur(4px)" }, { opacity: 1, filter: "blur(0)" }], { duration: 1650, delay: 1150, easing: "ease-in-out", fill: "forwards" }));
        motion.push(corona.animate([{ opacity: 0 }, { opacity: 0.1, offset: 0.4 }, { opacity: 0.18 }], { duration: 3000, easing: "ease-in-out", fill: "forwards" }));
      }, TIMING.load + TIMING.reveal);

      later(timers, () => {
        index.textContent = "11.";
        counter.textContent = "SYSTEMS CLEAR";
        phase.textContent = "SYSTEMS CLEAR";
        nominal.innerHTML = "ALL SYSTEMS<br>NOMINAL";
        motion.push(hud.animate([{ opacity: 1 }, { opacity: 0, transform: "translateX(-8px)" }], { duration: 900, easing: "ease-out", fill: "forwards" }));
      }, TIMING.load + 4400);

      later(timers, pulse, TIMING.load + TIMING.pulse);
      later(timers, onComplete, TIMING.load + TIMING.pulse + 900);
    }

    function preflight(callback) {
      const probe = new Image();
      probe.onload = () => {
        if (probe.naturalWidth !== SOURCE.width || probe.naturalHeight !== SOURCE.height) {
          error.textContent = `ERREUR ASSET — dimensions ${probe.naturalWidth}×${probe.naturalHeight}, attendu ${SOURCE.width}×${SOURCE.height}.`;
          error.style.display = "grid";
          return;
        }
        callback();
      };
      probe.onerror = () => { error.style.display = "grid"; };
      probe.src = artwork;
    }

    const resize = () => syncGeometry();
    addEventListener("resize", resize);
    syncGeometry();
    return { run, stop, reset, pulse, finalState, preflight, destroy: () => { stop(); removeEventListener("resize", resize); } };
  }

  return { ARTWORK, SOURCE, TIMING, geometryFor, applyGeometry, create };
});
