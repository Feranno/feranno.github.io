// ================================================================
// INPUT: the pointer in the 3D scene. Hover, tap/click, and drag-to-spin.
//
// Uses pointer events, which cover mouse, touch and pen alike. (iPhone
// Safari never sends a "click" for a tap on the plain canvas, so taps are
// detected here from pointerdown + pointerup instead.)
// ================================================================

import { DRAG_SPEED, CLICK_TOLERANCE, UI_ELEMENTS } from "./config.js";
import { state } from "./state.js";
import { openSection, goHome, sectionFromMenu } from "./panel.js";

// `scene` is what createScene() returned. We need its sectionAt() and canvas.
export function initInput(scene) {
  let press = null;                      // the current press: { id, lastX, lastY, moved }

  // Is this event on a page element (menu, cards, popup) rather than the 3D scene?
  const onUI = (e) => e.target.closest(UI_ELEMENTS) !== null;

  // Which sphere (if any) is under this pointer, and light it up
  function updateHover(e) {
    state.mouse.x = (e.clientX / innerWidth) * 2 - 1;
    state.mouse.y = -(e.clientY / innerHeight) * 2 + 1;

    // Hovering a menu item lights up its sphere; other UI lights nothing
    const menuSection = sectionFromMenu(e.target);
    if (menuSection) state.hovered = menuSection;
    else if (onUI(e)) state.hovered = null;
    else state.hovered = scene.sectionAt(e.clientX, e.clientY);

    document.body.style.cursor = state.hovered ? "pointer" : "";
  }

  addEventListener("pointerdown", (e) => {
    if (onUI(e) || !e.isPrimary) return;
    press = { id: e.pointerId, lastX: e.clientX, lastY: e.clientY, moved: 0 };
    if (e.pointerType !== "mouse") updateHover(e);   // a finger has no hover: light the sphere on touch
  });

  addEventListener("pointermove", (e) => {
    if (press && e.pointerId === press.id) {
      // Measure movement ourselves: Safari leaves movementX at 0 for touches
      const dx = e.clientX - press.lastX;
      const dy = e.clientY - press.lastY;
      press.lastX = e.clientX;
      press.lastY = e.clientY;
      press.moved += Math.abs(dx) + Math.abs(dy);
      state.spin.y += dx * DRAG_SPEED;
      state.spin.x += dy * DRAG_SPEED;
    }
    if (e.pointerType === "mouse" || press) updateHover(e);
  });

  addEventListener("pointerup", (e) => {
    if (!press || e.pointerId !== press.id) return;
    const wasTap = press.moved <= CLICK_TOLERANCE * (e.pointerType === "mouse" ? 1 : 2);  // fingers wobble more
    press = null;
    if (e.pointerType !== "mouse") state.hovered = null;  // no hover left behind after a tap

    if (!wasTap || onUI(e)) return;                    // a drag, or released over the menu/panel
    const tapped = scene.sectionAt(e.clientX, e.clientY);
    if (!tapped || tapped === state.current) goHome();   // empty space or the open sphere → home
    else openSection(tapped);
  });

  addEventListener("pointercancel", () => {
    press = null;
    state.hovered = null;
  });

  // Let touches on the 3D scene drag the spheres instead of scrolling or zooming the page
  scene.canvas.style.touchAction = "none";
}
