// ================================================================
// PANEL: the menu, the content panel, its cards, and the popup.
// Everything here is plain HTML. The 3D scene lives in scene.js.
// ================================================================

import { SECTIONS } from "./content.js";
import { REDUCED_MOTION } from "./config.js";
import { state } from "./state.js";

// Page elements, looked up once
const nav = document.querySelector("nav");
const main = document.querySelector("main");
const titleEl = document.querySelector("#section-title");
const blurbEl = document.querySelector("#section-blurb");
const cardsEl = document.querySelector("#cards");
const popup = document.querySelector("#popup");
const popupImg = document.querySelector("#popup-img");
const popupTitle = document.querySelector("#popup-title");
const popupNote = document.querySelector("#popup-note");

// Menu buttons ↔ sections, so each can find the other
const buttonFor = new Map();     // section → button
const sectionFor = new Map();    // button → section


// ---------- Opening and closing ----------

// Show a section in the panel. The camera flies to its sphere (see scene.js).
export function openSection(section) {
  state.current = section;
  main.hidden = false;
  titleEl.textContent = section.name;
  blurbEl.textContent = section.blurb;
  document.body.style.setProperty("--accent", section.color);

  cardsEl.replaceChildren(...section.items.map(buildCard));

  animate(main, [{ opacity: 0, transform: "translateX(24px)" }, { opacity: 1, transform: "none" }],
    { duration: 600, easing: "ease-out" });

  for (const [s, button] of buttonFor) {
    button.classList.toggle("active", s === section);
    button.setAttribute("aria-current", s === section ? "true" : "false");
  }
}

// Back to the home view
export function goHome() {
  state.current = null;
  main.hidden = true;
  for (const button of buttonFor.values()) {
    button.classList.remove("active");
    button.setAttribute("aria-current", "false");
  }
}

// If `element` is (inside) a menu button, return that button's section
export function sectionFromMenu(element) {
  const button = element.closest("nav button");
  return button ? sectionFor.get(button) : null;
}


// ---------- Cards ----------

// Make one card. `raw` is plain text or a { title, image, note } object.
// `index` sets the stagger, so the cards cascade in one after another.
function buildCard(raw, index) {
  const item = typeof raw === "string" ? { title: raw } : raw;   // treat both shapes the same

  const card = document.createElement("button");   // a button, so keyboards can reach it too
  card.type = "button";
  card.className = "card";

  if (item.image) {
    const img = document.createElement("img");
    img.src = item.image;
    img.alt = "";                                  // decorative: the title text right below names it
    img.loading = "lazy";                          // download only when it's about to be visible
    card.appendChild(img);
  }

  const label = document.createElement("span");
  label.textContent = item.title;                  // textContent, never innerHTML (safe from XSS)
  card.appendChild(label);

  card.addEventListener("click", () => openPopup(item));

  animate(card, [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }],
    { duration: 500, delay: 200 + index * 50, easing: "ease-out", fill: "backwards" });

  return card;
}


// ---------- Popup ----------

function openPopup(item) {
  popupTitle.textContent = item.title;
  popupNote.textContent = item.note ?? "";         // empty if there's no note
  popupImg.hidden = !item.image;
  if (item.image) {
    popupImg.src = item.image;
    popupImg.alt = item.title;
  }
  popup.showModal();
}


// ---------- Helpers ----------

// element.animate(), unless the visitor prefers reduced motion
function animate(element, keyframes, options) {
  if (!REDUCED_MOTION) element.animate(keyframes, options);
}


// ---------- Setup (called once from main.js) ----------

export function initPanel() {
  // One menu button per section
  for (const section of SECTIONS) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = section.name;
    button.addEventListener("click", () => openSection(section));
    buttonFor.set(section, button);
    sectionFor.set(button, section);
    nav.appendChild(button);
  }

  // Ways to close things
  document.querySelector(".back").addEventListener("click", goHome);
  document.querySelector("#popup-close").addEventListener("click", () => popup.close());
  popup.addEventListener("click", (e) => {
    if (e.target === popup) popup.close();         // clicked the dark area outside the popup
  });
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (popup.open) return;                        // the dialog closes itself on Escape
    goHome();
  });
}
