// ================================================================
// MAIN: starts everything. Read this file first.
// ================================================================

import { initPanel } from "./panel.js";
import { createScene } from "./scene.js";
import { initInput } from "./input.js";
import { initAudio } from "./audio.js";

// 1. The menu, panel and popup. Plain HTML, works on every browser.
initPanel();

// 2. Background music and its on/off switch (stays hidden if there's no track).
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
