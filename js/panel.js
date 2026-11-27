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
const proseEl = document.querySelector("#prose");
const popup = document.querySelector("#popup");
const popupImg = document.querySelector("#popup-img");
const popupTitle = document.querySelector("#popup-title");
const popupNote = document.querySelector("#popup-note");
const popupKicker = document.querySelector("#popup-kicker");
const popupVideo = document.querySelector("#popup-video");
const popupSubtitle = document.querySelector("#popup-subtitle");
const popupFacts = document.querySelector("#popup-facts");
const popupGallery = document.querySelector("#popup-gallery");
const lightbox = document.querySelector("#lightbox");
const lightboxImg = document.querySelector("#lightbox-img");
const lightboxCaption = document.querySelector("#lightbox-caption");

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

  const photos = section.layout === "photos";
  cardsEl.classList.toggle("photos", photos);
  cardsEl.replaceChildren(...section.items.map(photos ? buildPhoto : buildCard));
  proseEl.hidden = !section.body?.length;
  proseEl.replaceChildren(...(section.body ?? []).map(buildBlock));

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


// ---------- Written text (a section's `body`) ----------

// Make one block of text. See the about section in content.js for the shapes.
function buildBlock(block, index) {
  const el = document.createElement("section");
  el.className = "prose-block";

  const para = (text) => {
    const p = document.createElement("p");
    p.textContent = text;
    el.appendChild(p);
  };
  const list = (tag, lines) => {
    const ul = document.createElement(tag);
    for (const text of lines) {
      const li = document.createElement("li");
      li.textContent = text;
      ul.appendChild(li);
    }
    el.appendChild(ul);
  };

  if (block.lead) para(block.lead);                // e.g. "Feranno", a plain first line
  if (block.text) para(block.text);
  if (block.label) para(block.label);              // e.g. "here are some things i like:"
  if (block.list) list("ul", block.list);          // one bullet per line
  if (block.inline) list("ul", [block.inline.join(", ")]);   // one bullet, items separated by commas
  if (block.numbered) list("ol", block.numbered);

  animate(el, [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }],
    { duration: 500, delay: 200 + index * 90, easing: "ease-out", fill: "backwards" });

  return el;
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


// One photo in a "photos" section: shown at its own shape with its caption.
// Hovering zooms it in place (CSS). A tap or Enter does the same, for phones
// and keyboards; tapping it again, or another photo, puts it back.
function buildPhoto(item, index) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "photo";
  button.setAttribute("aria-pressed", "false");

  const frame = document.createElement("div");
  frame.className = "photo-frame";
  const img = document.createElement("img");
  img.src = item.image;
  img.alt = "";                                    // the caption below names it
  img.loading = "lazy";
  frame.appendChild(img);

  const caption = document.createElement("span");
  caption.textContent = item.caption ?? "";
  button.append(frame, caption);

  button.addEventListener("click", () => {
    const zoom = !button.classList.contains("zoomed");
    for (const other of cardsEl.querySelectorAll(".photo.zoomed")) setZoom(other, false);
    setZoom(button, zoom);
  });
  // un-zoom when a real mouse leaves (touch screens send stray leave events after a tap)
  button.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") setZoom(button, false); });
  button.addEventListener("blur", () => setZoom(button, false));

  animate(button, [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }],
    { duration: 500, delay: 200 + index * 50, easing: "ease-out", fill: "backwards" });

  return button;
}

function setZoom(photo, on) {
  photo.classList.toggle("zoomed", on);
  photo.setAttribute("aria-pressed", String(on));
}


// ---------- Detail view (full poster + notes) ----------

function openPopup(item) {
  popupKicker.textContent = state.current?.name ?? "";   // e.g. "anime"
  popupTitle.textContent = item.title;
  popupNote.textContent = item.note ?? "";         // empty if there's no note

  popupSubtitle.hidden = !item.subtitle;
  popupSubtitle.textContent = item.subtitle ?? "";

  // Facts: label/value pairs
  popupFacts.hidden = !item.facts?.length;
  popupFacts.replaceChildren(...(item.facts ?? []).flatMap(([label, value]) => {
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = value;
    return [dt, dd];
  }));

  // Gallery: thumbnails that open the lightbox
  popupGallery.hidden = !item.gallery?.length;
  popupGallery.replaceChildren(...(item.gallery ?? []).map(buildThumb));

  // Video takes the poster's place when there is one
  const hasVideo = Boolean(item.video);
  popupVideo.hidden = !hasVideo;
  popupImg.hidden = hasVideo || !item.image;
  if (hasVideo) {
    popupVideo.poster = item.poster ?? "";
    popupVideo.src = item.video;
    popupVideo.setAttribute("aria-label", item.title);
  } else {
    popupVideo.removeAttribute("src");
    popupVideo.load();                             // drop any earlier video
  }
  if (!hasVideo && item.image) {
    popupImg.src = item.image;
    popupImg.alt = item.title;
  }

  popup.showModal();
  // Autoplay (muted) unless the visitor prefers reduced motion; then it waits for play
  if (hasVideo && !REDUCED_MOTION) popupVideo.play().catch(() => {});
}

// One gallery thumbnail
function buildThumb({ src, caption }) {
  const li = document.createElement("li");
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", `Enlarge: ${caption}`);
  const img = document.createElement("img");
  img.src = src;
  img.alt = "";                                    // the caption below names it
  img.loading = "lazy";
  const label = document.createElement("span");
  label.textContent = caption;
  button.append(img, label);
  button.addEventListener("click", () => openLightbox(src, caption));
  li.appendChild(button);
  return li;
}

function openLightbox(src, caption) {
  lightboxImg.src = src;
  lightboxImg.alt = caption;
  lightboxCaption.textContent = caption;
  lightbox.showModal();
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
    // clicked empty space (not the poster, text, or back button) → close
    if (e.target === popup || e.target.classList.contains("detail")) popup.close();
  });
  popup.addEventListener("close", () => popupVideo.pause());   // stop playing once hidden

  // Lightbox: back button, or click anywhere except the image
  document.querySelector("#lightbox-close").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (e) => {
    if (e.target !== lightboxImg) lightbox.close();
  });
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (popup.open || lightbox.open) return;       // the dialog closes itself on Escape
    goHome();
  });
}
