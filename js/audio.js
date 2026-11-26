// ================================================================
// AUDIO: background music with an on/off switch.
//
// Browsers block sound until the visitor interacts with the page, so the
// music starts on the first click or tap anywhere, then fades in gently.
// The switch in the corner turns it on and off, and the choice is
// remembered for the next visit.
//
// To change the track, put a file in music/ and update the <audio> src in index.html.
// ================================================================

const VOLUME = 0.4;              // 0 to 1. Background music should sit quietly
const FADE_MS = 1500;            // how long fades take, in milliseconds
const STORAGE_KEY = "thauma-sound";

const music = document.querySelector("#music");
const toggle = document.querySelector("#sound-toggle");

let wantsSound = true;           // the visitor's choice
let fadeFrame = null;            // the fade in progress, so a new fade can cancel it


// ---------- Fading ----------

// Glide the volume to `target` over FADE_MS. Pauses at the end of a fade-out.
// (iPhones don't allow pages to change volume. There it just plays or pauses.)
function fadeTo(target) {
  cancelAnimationFrame(fadeFrame);
  const start = music.volume;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / FADE_MS, 1);
    music.volume = start + (target - start) * progress;
    if (progress < 1) fadeFrame = requestAnimationFrame(step);
    else if (target === 0) music.pause();
  }
  fadeFrame = requestAnimationFrame(step);
}

function start() {
  music.play()
    .then(() => fadeTo(VOLUME))
    .catch(() => {});            // blocked or failed to load: stay silent, nothing breaks
}

function stop() {
  fadeTo(0);
}


// ---------- Remembering the choice ----------
// localStorage can be unavailable (private browsing, blocked storage),
// so every access is wrapped: if it fails, we just don't remember.

function loadPreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === null ? true : saved === "on";   // default: on
  } catch {
    return true;
  }
}

function savePreference(on) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // ignore
  }
}


// ---------- The switch ----------

function showState() {
  const playing = wantsSound && !music.paused;
  toggle.textContent = playing ? "♪ sound on" : "♪ sound off";
  toggle.setAttribute("aria-pressed", String(playing));   // tells screen readers it's on/off
}


// ---------- Setup (called once from main.js) ----------

export function initAudio() {
  wantsSound = loadPreference();
  music.volume = 0;                                // fades always start from silence

  // Only reveal the switch once we know the track exists and can play.
  // The track may already have loaded before this code ran (e.g. from cache),
  // in which case the event already fired: so check now, AND listen.
  const reveal = () => { toggle.hidden = false; showState(); };
  if (music.readyState >= HTMLMediaElement.HAVE_METADATA) reveal();
  else music.addEventListener("loadedmetadata", reveal, { once: true });
  music.addEventListener("play", showState);
  music.addEventListener("pause", showState);

  // First interaction anywhere starts the music (if the visitor wants it)
  function onFirstInteraction(event) {
    document.removeEventListener("pointerdown", onFirstInteraction);
    if (event.target.closest("#sound-toggle")) return;   // the switch handles itself
    if (wantsSound) start();
  }
  document.addEventListener("pointerdown", onFirstInteraction);

  toggle.addEventListener("click", () => {
    const playing = wantsSound && !music.paused;
    wantsSound = !playing;
    savePreference(wantsSound);
    if (wantsSound) start();
    else stop();
    showState();
  });
}
