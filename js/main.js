// ================================================================
// MAIN: starts everything. Read this file first.
// ================================================================

import { initPanel, openSection } from "./panel.js";
import { SECTIONS } from "./content.js";
import { placeLists } from "./lists.js";

// 0. Put the links list where js/lists.js says (a page, inside thoughts, or
//    its own sphere), before the menu and spheres are built from SECTIONS.
placeLists(SECTIONS);
import { createScene } from "./scene.js";
import { initInput } from "./input.js";
import { initAudio } from "./audio.js";
import { initTheme } from "./theme.js";

// Tell index.html the site started, so it doesn't also load js/bundle.js
// (the stand-in used when the page is opened from disk).
document.documentElement.dataset.started = "true";

// 1. The menu, panel and popup. Plain HTML, works on every browser.
initPanel();

// 2. The midnight/light switch, and the music player (bottom-right).
initTheme();
initAudio();

// 3. The 3D scene. If the browser can't do WebGL (old device, disabled
//    graphics), skip it: the menu still opens every section.
let scene = null;
try {
  scene = createScene();
} catch (error) {
  console.warn("3D disabled: WebGL is not available.", error);
  document.body.classList.add("no-webgl");
}

// 4. Put the canvas behind the page, connect the mouse, start animating.
if (scene) {
  document.body.prepend(scene.canvas);
  initInput(scene);
  addEventListener("resize", scene.resize);
  scene.start();
}

// 5. A link can open a section directly: feranno.github.io/?open=anime
const asked = new URLSearchParams(location.search).get("open");
const opening = SECTIONS.find((section) => section.name === asked);
if (opening) openSection(opening);
