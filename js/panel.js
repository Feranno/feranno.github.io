// ================================================================
// PANEL: the menu, the content panel, its cards, and the popup.
// Everything here is plain HTML. The 3D scene lives in scene.js.
// ================================================================

import { SECTIONS } from "./content.js";
import { REDUCED_MOTION } from "./config.js";
import { state } from "./state.js";
import { sectionColor, onThemeChange } from "./theme.js";
import { initSap1 } from "./sap1.js";

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
const popupVideo = document.querySelector("#popup-video");
const popupFrame = document.querySelector("#popup-frame");        // the video, plus boxes drawn over it
const popupOverlay = document.querySelector("#popup-overlay");
const popupDiagram = document.querySelector("#popup-diagram");    // the clock stepper under the video
let closeDiagram = null;
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
  setAccent();

  const photos = section.layout === "photos";
  expanded = null;                                 // any enlarged photo goes with the old cards
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

// --accent: the open section's color in the current theme (its own color at
// midnight, its gray in light mode). Cards, the menu dot and focus rings use it.
function setAccent() {
  if (state.current) document.body.style.setProperty("--accent", sectionColor(state.current, SECTIONS));
}
onThemeChange(setAccent);

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

  // text is a string, or a list of strings and { text, href } links
  const para = (text) => {
    const p = document.createElement("p");
    for (const part of [].concat(text)) {
      if (typeof part === "string") {
        p.append(part);
      } else {
        const a = document.createElement("a");
        a.href = part.href;
        a.textContent = part.text;                 // textContent, never innerHTML
        p.appendChild(a);
      }
    }
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

  card.addEventListener("click", () => openPopup(item, card));   // the poster grows out of this card

  animate(card, [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }],
    { duration: 500, delay: 200 + index * 50, easing: "ease-out", fill: "backwards" });

  return card;
}


// One photo in a "photos" section: shown at its own shape with its caption.
// Hovering zooms it a little (CSS). Clicking or tapping opens it large, in a
// full-width row right below its own row (see expandPhoto).
function buildPhoto(item, index) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "photo";
  button.setAttribute("aria-expanded", "false");
  button.append(...photoParts(item));
  button.addEventListener("click", () => expandPhoto(button, item));

  animate(button, [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }],
    { duration: 500, delay: 200 + index * 50, easing: "ease-out", fill: "backwards" });

  return button;
}

// The picture in its rounded frame, and the caption under it
function photoParts(item) {
  const frame = document.createElement("div");
  frame.className = "photo-frame";
  const img = document.createElement("img");
  img.src = item.image;
  img.alt = "";                                    // the caption names it
  frame.appendChild(img);
  const caption = document.createElement("span");
  caption.textContent = item.caption ?? "";
  return [frame, caption];
}


// ---------- Enlarged photo ----------
// The clicked photo's spot stays empty (so nothing jumps), and a large copy
// opens across the whole grid after the last photo in that row. It grows out
// of the small one. Clicking the large one closes it; clicking another photo
// moves it there.

let expanded = null;                               // { photo, item, block } or null

function expandPhoto(photo, item) {
  const wasOpen = expanded?.photo === photo;
  collapsePhoto();
  if (wasOpen) return;

  const block = document.createElement("button");
  block.type = "button";
  block.className = "photo-expanded";
  block.setAttribute("aria-label", `Close: ${item.caption ?? "photo"}`);
  block.append(...photoParts(item));
  block.addEventListener("click", () => { collapsePhoto(); photo.focus(); });

  const from = photo.querySelector(".photo-frame").getBoundingClientRect();
  photo.classList.add("is-open");
  photo.setAttribute("aria-expanded", "true");
  expanded = { photo, item, block };
  placeExpanded();

  // Grow from where the small photo was (the "FLIP" trick: measure both, then animate the difference)
  const frame = block.querySelector(".photo-frame");
  const to = frame.getBoundingClientRect();
  animate(frame, [
    { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})` },
    { transform: "none" },
  ], { duration: 500, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" });
  animate(block.querySelector("span"), [{ opacity: 0 }, { opacity: 1 }],
    { duration: 300, delay: 250, easing: "ease-out", fill: "backwards" });

  block.scrollIntoView({ block: "nearest", behavior: REDUCED_MOTION ? "auto" : "smooth" });
}

// Put the large copy after the last photo in the clicked photo's row
function placeExpanded() {
  if (!expanded) return;
  const photos = [...cardsEl.querySelectorAll(".photo")];
  const columns = getComputedStyle(cardsEl).gridTemplateColumns.split(" ").length;
  const index = photos.indexOf(expanded.photo);
  const rowEnd = Math.min(Math.floor(index / columns) * columns + columns - 1, photos.length - 1);
  photos[rowEnd].after(expanded.block);
}

function collapsePhoto() {
  if (!expanded) return;
  expanded.block.remove();
  expanded.photo.classList.remove("is-open");
  expanded.photo.setAttribute("aria-expanded", "false");
  expanded = null;
}

// The column count changes with the window width, so the row end can move
addEventListener("resize", placeExpanded);


// ---------- Detail view (full poster + notes) ----------
// Opening: the poster grows out of the card you clicked, the background dims,
// then the text fades in on the right. Closing reverses it: the poster shrinks
// back into its card. Every poster opens at the same height, whatever the size
// of its image file.

const popupText = popup.querySelector(".detail-text");
const popupBack = document.querySelector("#popup-close");
const OPEN_MS = 600;
const CLOSE_MS = 420;
const EASE_OUT = "cubic-bezier(0.2, 0.7, 0.2, 1)";      // fast start, long gentle landing
const EASE_IN_OUT = "cubic-bezier(0.4, 0, 0.2, 1)";
const CLEAR = "transparent";
// The dialog's dimmed background: --overlay in style.css, which depends on the theme
const dim = () => getComputedStyle(document.documentElement).getPropertyValue("--overlay").trim();

let openedFrom = null;           // the card the open poster came from
let closing = false;

async function openPopup(item, card) {
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
  popupFrame.hidden = !hasVideo;

  // SAP-1: boxes over the video and the clock stepper under it
  const hasDiagram = item.diagram === "sap1" && hasVideo;
  popup.querySelector(".detail").classList.toggle("has-diagram", hasDiagram);
  popupDiagram.hidden = !hasDiagram;
  popupOverlay.hidden = !hasDiagram;
  if (hasDiagram) closeDiagram = initSap1(popupDiagram, popupOverlay, popupVideo);
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

  closing = false;
  openedFrom = card ?? null;
  const media = hasVideo ? popupFrame : (item.image ? popupImg : null);

  // Size the poster before showing it, so it never flashes at the wrong size.
  // The card already loaded this image, so decoding it is nearly instant.
  if (media === popupImg) {
    popupImg.style.visibility = "hidden";
    popupImg.style.width = popupImg.style.height = "";
    await popupImg.decode().catch(() => {});
  }

  popup.showModal();
  fitPoster();
  popupImg.style.visibility = "";
  if (openedFrom) openedFrom.style.visibility = "hidden";   // the card "lifts out" of the grid

  popIn(media);

  // Autoplay (muted) unless the visitor prefers reduced motion; then it waits for play
  if (hasVideo && !REDUCED_MOTION) popupVideo.play().catch(() => {});
}

// Every poster gets the same height, scaled up or down from its file, and never
// wider than its column: 500px (like anandmaj's book covers), less on short
// screens so it always fits; on phones, half the screen height (at most 420px).
const POSTER_HEIGHT = 500;
const PHONE_POSTER_HEIGHT = 420;

function fitPoster() {
  if (popupImg.hidden || !popupImg.naturalWidth) return;
  const phone = matchMedia("(max-width: 800px)").matches;
  const maxHeight = phone
    ? Math.min(innerHeight * 0.5, PHONE_POSTER_HEIGHT)
    : Math.min(innerHeight * 0.68, POSTER_HEIGHT);
  const maxWidth = popupImg.parentElement.clientWidth;
  const ratio = popupImg.naturalWidth / popupImg.naturalHeight;
  let height = maxHeight;
  let width = height * ratio;
  if (width > maxWidth) {                          // a wide image: fit the column instead
    width = maxWidth;
    height = width / ratio;
  }
  popupImg.style.width = `${Math.round(width)}px`;
  popupImg.style.height = `${Math.round(height)}px`;
}

// The transform that makes `media` sit exactly over `rect` (the card):
// same center, same width. One scale for both axes, so the poster never stretches.
function overCard(media, rect) {
  const to = media.getBoundingClientRect();
  const dx = rect.left + rect.width / 2 - (to.left + to.width / 2);
  const dy = rect.top + rect.height / 2 - (to.top + to.height / 2);
  return `translate(${dx}px, ${dy}px) scale(${rect.width / to.width})`;
}

// Is the card still on screen, so it makes sense to fly to or from it?
function cardRect() {
  const rect = openedFrom?.getBoundingClientRect();
  const onScreen = rect && rect.width && rect.bottom > 0 && rect.top < innerHeight;
  return onScreen ? rect : null;
}

function popIn(media) {
  animate(popup, [{ backgroundColor: CLEAR }, { backgroundColor: dim() }],
    { duration: OPEN_MS * 0.6, easing: "ease-out" });

  const rect = cardRect();
  if (media && rect && media === popupImg) {
    // Grow out of the card: start exactly over it, end at full size
    animate(media, [{ transform: overCard(media, rect) }, { transform: "none" }],
      { duration: OPEN_MS, easing: EASE_OUT });
  } else if (media) {
    // A video (its size isn't known yet) or no card to grow from: rise and grow in place
    animate(media, [{ opacity: 0, transform: "translateY(20px) scale(0.94)" }, { opacity: 1, transform: "none" }],
      { duration: OPEN_MS, easing: EASE_OUT });
  }

  // Text, back button and stepper follow once the poster is mostly there
  for (const el of [popupText, popupBack, popupDiagram]) {
    animate(el, [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
      { duration: 500, delay: OPEN_MS * 0.45, easing: "ease-out", fill: "backwards" });
  }
}

// Close with the reverse motion: text fades, poster shrinks back into its card
function closePopup() {
  if (!popup.open || closing) return;
  const media = !popupImg.hidden ? popupImg : (!popupFrame.hidden ? popupFrame : null);
  const rect = cardRect();
  if (REDUCED_MOTION) { popup.close(); return; }

  closing = true;
  const fill = "forwards";                         // hold the end state until the dialog closes
  const runs = [
    popup.animate([{ backgroundColor: dim() }, { backgroundColor: CLEAR }], { duration: CLOSE_MS, easing: EASE_IN_OUT, fill }),
    popupText.animate([{ opacity: 1 }, { opacity: 0 }], { duration: CLOSE_MS * 0.5, fill }),
    popupBack.animate([{ opacity: 1 }, { opacity: 0 }], { duration: CLOSE_MS * 0.5, fill }),
    popupDiagram.animate([{ opacity: 1 }, { opacity: 0 }], { duration: CLOSE_MS * 0.5, fill }),
  ];
  if (media && rect && media === popupImg) {
    runs.push(media.animate([{ transform: "none" }, { transform: overCard(media, rect) }],
      { duration: CLOSE_MS, easing: EASE_IN_OUT, fill }));
  } else if (media) {
    runs.push(media.animate([{ opacity: 1 }, { opacity: 0, transform: "scale(0.94)" }],
      { duration: CLOSE_MS, easing: EASE_IN_OUT, fill }));
  }
  Promise.all(runs.map((run) => run.finished)).then(() => popup.close(), () => popup.close());
}

// Runs however the dialog closed: put everything back for next time
function resetPopup() {
  closing = false;
  for (const el of [popup, popupImg, popupFrame, popupDiagram, popupText, popupBack]) {
    for (const run of el.getAnimations()) run.cancel();
  }
  if (openedFrom) openedFrom.style.visibility = "";
  openedFrom = null;
  popupVideo.pause();                              // stop playing once hidden
  closeDiagram?.();
  closeDiagram = null;
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
  popupBack.addEventListener("click", closePopup);
  popup.addEventListener("click", (e) => {
    // clicked empty space (not the poster, text, or back button) → close
    if (e.target === popup || e.target.classList.contains("detail") ||
        e.target.classList.contains("detail-poster")) closePopup();
  });
  popup.addEventListener("cancel", (e) => {        // Escape: animate out instead of vanishing
    e.preventDefault();
    closePopup();
  });
  popup.addEventListener("close", resetPopup);
  addEventListener("resize", () => { if (popup.open && !closing) fitPoster(); });

  // Lightbox: back button, or click anywhere except the image
  document.querySelector("#lightbox-close").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (e) => {
    if (e.target !== lightboxImg) lightbox.close();
  });
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (popup.open || lightbox.open) return;       // the dialog closes itself on Escape
    if (expanded) {                                // first Escape closes an enlarged photo
      const photo = expanded.photo;
      collapsePhoto();
      photo.focus();
      return;
    }
    goHome();
  });
}
