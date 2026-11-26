// ================================================================
// INPUT: the mouse in the 3D scene. Hover, click, and drag-to-spin.
// ================================================================

import { DRAG_SPEED, CLICK_TOLERANCE, UI_ELEMENTS } from "./config.js";
import { state } from "./state.js";
import { openSection, goHome, sectionFromMenu } from "./panel.js";

// `scene` is what createScene() returned. We need its sectionAt().
export function initInput(scene) {
  let dragging = false;
  let dragMoved = 0;                     // pixels moved during the current press

  // Is this event on a page element (menu, cards, popup) rather than the 3D scene?
  const onUI = (e) => e.target.closest(UI_ELEMENTS) !== null;

  addEventListener("pointerdown", (e) => {
    if (onUI(e)) return;
    dragging = true;
    dragMoved = 0;
  });

  addEventListener("pointerup", () => {
    dragging = false;
  });

  addEventListener("pointermove", (e) => {
    state.mouse.x = (e.clientX / innerWidth) * 2 - 1;
    state.mouse.y = -(e.clientY / innerHeight) * 2 + 1;

    if (dragging) {
      state.spin.y += e.movementX * DRAG_SPEED;
      state.spin.x += e.movementY * DRAG_SPEED;
      dragMoved += Math.abs(e.movementX) + Math.abs(e.movementY);
    }

    // Hovering a menu item lights up its sphere; other UI lights nothing
    const menuSection = sectionFromMenu(e.target);
    if (menuSection) state.hovered = menuSection;
    else if (onUI(e)) state.hovered = null;
    else state.hovered = scene.sectionAt(e.clientX, e.clientY);

    document.body.style.cursor = state.hovered ? "pointer" : "";
  });

  addEventListener("click", (e) => {
    if (onUI(e)) return;
    if (dragMoved > CLICK_TOLERANCE) return;         // that was a drag, not a click
    const clicked = scene.sectionAt(e.clientX, e.clientY);
    if (!clicked || clicked === state.current) goHome();   // empty space or the open sphere → home
    else openSection(clicked);
  });
}
