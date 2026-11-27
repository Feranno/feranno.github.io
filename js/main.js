// ================================================================
// MAIN: starts everything. Read this file first.
// ================================================================

import { initPanel } from "./panel.js";
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
