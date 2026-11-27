// ================================================================
// AUDIO: the music player, bottom-right.
//
// Kept minimal: a play/pause glyph, the track name, and a hairline that
// fills as the track plays. Clicking the name opens the playlist (titles
// only); pick a track there to jump to it.
// The spacebar plays and pauses.
// Nothing plays until the visitor presses play (browsers block sound before
// that anyway), and nothing downloads until then either.
//
// The tracks are in js/chopin.js and stream from archive.org. When one ends,
// the next starts; after the last, it goes back to the first.
// The last track played is remembered on the visitor's own browser.
// Styles: css/style.css, "Music player".
// ================================================================

import { TRACKS } from "./chopin.js";

const VOLUME = 0.6;              // 0 to 1
const START = 0;                 // first visit starts at track 1 (0 = first in js/chopin.js)
const SAVE_KEY = "player-track";

const ICONS = {
  play:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13M16 5.5v13"/></svg>',
};

// Browser storage can be missing or blocked (private windows); never let that break the player
function load() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    const n = Number(saved);
    return saved !== null && Number.isInteger(n) && n >= 0 && n < TRACKS.length ? n : START;
  } catch { return START; }
}
function save(n) {
  try { localStorage.setItem(SAVE_KEY, String(n)); } catch {}
}

// ---------- Setup (called once from main.js) ----------

export function initAudio() {
  const root = document.createElement("div");
  root.id = "player";
  root.innerHTML = `
    <ol class="player-list" id="player-list" hidden aria-label="Playlist"></ol>
    <div class="player-bar">
      <button type="button" class="player-btn player-play" data-act="play" aria-label="Play">${ICONS.play}</button>
      <button type="button" class="player-title" aria-expanded="false" aria-controls="player-list">
        <span class="player-name"></span>
      </button>
      <span class="player-progress" aria-hidden="true"><span></span></span>
    </div>`;
  document.body.append(root);

  const list = root.querySelector(".player-list");
  const playBtn = root.querySelector(".player-play");
  const titleBtn = root.querySelector(".player-title");
  const nameEl = root.querySelector(".player-name");
  const bar = root.querySelector(".player-progress span");

  // The playlist, one row per track
  list.innerHTML = TRACKS.map((t, i) =>
    `<li><button type="button" data-i="${i}">${t.title}</button></li>`).join("");

  let index = load();
  let music = null;                                // created on first play

  function show() {
    const t = TRACKS[index];
    nameEl.textContent = t.title;
    titleBtn.title = t.title;
    list.querySelectorAll("button").forEach((b) =>
      b.toggleAttribute("aria-current", Number(b.dataset.i) === index));
  }

  function setPlaying(on) {
    root.classList.toggle("playing", on);
    playBtn.innerHTML = on ? ICONS.pause : ICONS.play;
    playBtn.setAttribute("aria-label", on ? "Pause" : "Play");
  }

  function ensure() {
    if (music) return music;
    music = new Audio();
    music.preload = "none";
    music.volume = VOLUME;
    music.addEventListener("ended", () => go(index + 1));
    music.addEventListener("play", () => setPlaying(true));
    music.addEventListener("pause", () => { setPlaying(false); root.classList.remove("loading"); });
    music.addEventListener("waiting", () => root.classList.add("loading"));
    music.addEventListener("playing", () => root.classList.remove("loading"));
    music.addEventListener("timeupdate", () => {
      const d = music.duration || TRACKS[index].seconds;
      bar.style.transform = `scaleX(${d ? music.currentTime / d : 0})`;
    });
    music.addEventListener("error", () => {      // a track that won't load: skip it
      root.classList.remove("loading");
      if (!music.paused || root.classList.contains("playing")) go(index + 1);
    });
    return music;
  }

  function go(n, play = true) {
    index = (n + TRACKS.length) % TRACKS.length;
    save(index);
    show();
    bar.style.transform = "scaleX(0)";
    const m = ensure();
    m.src = TRACKS[index].src;
    if (play) m.play().catch(() => setPlaying(false));
  }

  function toggle() {
    const m = ensure();
    if (!m.src) { go(index); return; }
    if (m.paused) m.play().catch(() => setPlaying(false));
    else m.pause();
  }

  function openList(open) {
    list.hidden = !open;
    titleBtn.setAttribute("aria-expanded", String(open));
    if (open) list.querySelector("[aria-current]")?.scrollIntoView({ block: "center" });
  }

  root.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    // A mouse click shouldn't leave the button focused, or the spacebar would
    // press it again instead of playing/pausing. (Keyboard users keep focus.)
    if (e.detail > 0) btn.blur();
    if (btn.dataset.i) { go(Number(btn.dataset.i)); openList(false); return; }
    if (btn === titleBtn) { openList(list.hidden); return; }
    if (btn.dataset.act === "play") toggle();
  });

  // Close the playlist on Escape or a click elsewhere
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !list.hidden) { openList(false); titleBtn.focus(); }
  });

  // Spacebar plays and pauses, unless something else on the page wants the
  // key: a focused button or link (Space presses it), a text field, or a
  // video's own controls.
  document.addEventListener("keydown", (e) => {
    if (e.code !== "Space" || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest?.("button, a, input, textarea, select, video, audio, [contenteditable]")) return;
    e.preventDefault();                            // don't scroll the page
    toggle();
  });
  document.addEventListener("pointerdown", (e) => {
    if (!list.hidden && !root.contains(e.target)) openList(false);
  });

  show();
}
