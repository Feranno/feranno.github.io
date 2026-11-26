// ================================================================
// CONFIG: tuning knobs. Change a number here, reload, see the effect.
// ================================================================

// Camera
export const HOME_DISTANCE = 10;     // how far back the camera sits on the home view
export const CAMERA_EASE = 3;        // higher = the camera arrives faster

// Orbit rings
export const RING_RADIUS = 4;        // just outside the biggest sphere
export const DOTS_PER_RING = 100;
export const RING_TILTS = [0, 30, 60, 120, 150];   // degrees (90 skipped: it'd look like a flat line)

// Sparks (shown around the hovered sphere)
export const SPARK_COUNT = 150;
export const SPARK_TRAVEL = 0.6;     // how far a spark flies before restarting

// Mouse
export const DRAG_SPEED = 0.005;     // radians of spin per pixel dragged
export const CLICK_TOLERANCE = 5;    // pixels of movement before a press counts as a drag

// Page elements the 3D scene should ignore clicks and hovers on
export const UI_ELEMENTS = "button, dialog";

// True if the visitor asked their OS to reduce motion. We then skip
// decorative animation (auto-spin, panel slides, card cascades).
export const REDUCED_MOTION = matchMedia("(prefers-reduced-motion: reduce)").matches;
