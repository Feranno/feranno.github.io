// ================================================================
// THEME: midnight (dark, the original) or light (white, like anandmaj's).
//
// The button in the top-right switches between them and the choice is
// remembered. A small script in index.html's <head> applies a saved light
// theme before the page draws, so it never flashes dark first.
//
//   Page colors   css/style.css (:root for midnight, [data-theme="light"])
//   3D colors     PALETTES below, read by scene.js
// ================================================================

const STORAGE_KEY = "thauma-theme";

// The 3D colors of each theme.
//   shades   light mode's sphere colors, outermost sphere first, from pale
//            gray to near-black (midnight uses each section's own color)
//   hot      a hovered sphere's wireframe
//   wire     wireframe opacity, normally and when hovered
//   glow     the soft shell's opacity, normally and when hovered
//   dots     orbit ring dots: color and the two opacities (halo, core)
//   sparks   additive = glowing light on dark; on white that would be invisible
export const PALETTES = {
  midnight: {
    shades: null,
    hot: "#ffffff",
    wire: [0.25, 0.9],
    glow: [0.06, 0.15],
    dots: { color: "#ffffff", halo: 0.15, core: 0.9 },
    additiveSparks: true,
    pageBackground: "#0b0d17",
  },
  light: {
    shades: ["#b4b4b4", "#9a9a9a", "#7c7c7c", "#5c5c5c", "#3a3a3a", "#171717"],
    hot: "#000000",
    wire: [0.4, 0.95],
    glow: [0.05, 0.12],
    dots: { color: "#6b6b6b", halo: 0.12, core: 0.75 },
    additiveSparks: false,
    pageBackground: "#ffffff",
  },
};

let current = document.documentElement.dataset.theme === "light" ? "light" : "midnight";
const listeners = new Set();

export function getTheme() {
  return current;
}

export function palette() {
  return PALETTES[current];
}

// Call `fn` whenever the theme changes
export function onThemeChange(fn) {
  listeners.add(fn);
}

// The color a section uses in the current theme: its own color at midnight,
// its gray in light mode (bigger spheres paler, smaller ones darker).
// `sections` is the full list, so we can rank this one by size.
export function sectionColor(section, sections) {
  const shades = palette().shades;
  if (!shades) return section.color;
  const rank = [...sections].sort((a, b) => b.radius - a.radius).indexOf(section);
  return shades[Math.min(rank, shades.length - 1)];
}

function apply(theme) {
  current = theme;
  const root = document.documentElement;
  if (theme === "light") root.dataset.theme = "light";
  else delete root.dataset.theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", PALETTES[theme].pageBackground);

  const button = document.querySelector("#theme-toggle");
  if (button) {
    // The label names the mode you'd switch TO
    button.textContent = theme === "light" ? "☾ midnight" : "☀ light";
    button.setAttribute("aria-label", theme === "light" ? "Switch to midnight mode" : "Switch to light mode");
  }
  for (const fn of listeners) fn(theme);
}

function save(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // storage blocked (e.g. private browsing): the choice just isn't remembered
  }
}


// ---------- Setup (called once from main.js) ----------

export function initTheme() {
  apply(current);                                  // sync the button label with the saved theme
  document.querySelector("#theme-toggle").addEventListener("click", () => {
    const next = current === "light" ? "midnight" : "light";
    save(next);
    apply(next);
  });
}
