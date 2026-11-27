// ================================================================
// AUDIO: background music with an on/off switch and a track switch.
//
// Browsers block sound until the visitor interacts with the page, so the
// music starts on the first click or tap anywhere, then fades in gently.
// The switch in the corner turns it on and off, and the choice is
// remembered for the next visit. The ⇄ button cycles through TRACKS,
// fading one out and the next in; that choice is remembered too.
//
// To add a track, put the file in music/ and add it to TRACKS below.
// ================================================================

const VOLUME = 0.4;              // 0 to 1. Background music should sit quietly
const FADE_MS = 1500;            // how long fades take, in milliseconds
const STORAGE_KEY = "thauma-sound";
const TRACK_KEY = "thauma-track";

// The ⇄ button cycles through these in order. `name` is the button label.
const TRACKS = [
  { name: "chopin", src: "music/chopin-ballade-1.mp3" },
  { name: "111hz",  src: "music/meditation-111hz.mp3" },
];

const music = document.querySelector("#music");
const toggle = document.querySelector("#sound-toggle");
const trackToggle = document.querySelector("#track-toggle");
const controls = document.querySelector("#sound");

let wantsSound = true;           // the visitor's choice
let fadeFrame = null;            // the fade in progress, so a new fade can cancel it
let trackIndex = 0;              // which of TRACKS is selected


// ---------- Fading ----------

// Glide the volume to `target` over FADE_MS. Pauses at the end of a fade-out,
// then calls `done` if given. (iPhones don't allow pages to change volume.
// There it just plays or pauses.)
// Uses a timer, not requestAnimationFrame: animation frames stop in background
// tabs, which would leave a fade (and a track switch) stuck halfway.
function fadeTo(target, done) {
  clearInterval(fadeFrame);
  const start = music.volume;
  const startTime = performance.now();

  function step() {
    const progress = Math.min((performance.now() - startTime) / FADE_MS, 1);
    music.volume = start + (target - start) * progress;
    if (progress < 1) return;
    clearInterval(fadeFrame);
    if (target === 0) {
      music.pause();
      loadSelectedTrack();       // silent now, so it's safe to swap files
      done?.();
    }
  }
  fadeFrame = setInterval(step, 30);
}

// Point the player at the selected track, if it isn't already
function loadSelectedTrack() {
  const wanted = new URL(TRACKS[trackIndex].src, location.href).href;
  if (music.src !== wanted) music.src = wanted;
}

function start() {
  loadSelectedTrack();           // never resume an old track under a new label
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

function loadTrack() {
  try {
    const i = TRACKS.findIndex((t) => t.name === localStorage.getItem(TRACK_KEY));
    return i === -1 ? 0 : i;                       // default: the first track
  } catch {
    return 0;
  }
}

function saveTrack() {
  try {
    localStorage.setItem(TRACK_KEY, TRACKS[trackIndex].name);
  } catch {
    // ignore
  }
}

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
  const name = TRACKS[trackIndex].name;
  trackToggle.textContent = `⇄ ${name}`;
  trackToggle.setAttribute("aria-label", `Switch music track (now: ${name})`);
}

// Move to the next track. If music is playing, fade out; the fade-out loads
// the new file (see fadeTo), then it fades back in. Turning sound off
// mid-switch is fine: the new file still loads, it just doesn't play.
function nextTrack() {
  trackIndex = (trackIndex + 1) % TRACKS.length;
  saveTrack();
  showState();

  if (music.paused) {                              // not playing: swap now
    loadSelectedTrack();
    if (wantsSound) start();                       // e.g. ⇄ was the visitor's first click
    return;
  }
  fadeTo(0, () => {
    if (wantsSound) start();
  });
}


// ---------- Setup (called once from main.js) ----------

export function initAudio() {
  wantsSound = loadPreference();
  trackIndex = loadTrack();
  loadSelectedTrack();                             // index.html names track 0
  music.volume = 0;                                // fades always start from silence

  // Only reveal the switch once we know the track exists and can play.
  // The track may already have loaded before this code ran (e.g. from cache),
  // in which case the event already fired: so check now, AND listen.
  const reveal = () => { controls.hidden = false; showState(); };
  if (music.readyState >= HTMLMediaElement.HAVE_METADATA) reveal();
  else music.addEventListener("loadedmetadata", reveal, { once: true });
  music.addEventListener("play", showState);
  music.addEventListener("pause", showState);

  // First interaction anywhere starts the music (if the visitor wants it)
  function onFirstInteraction(event) {
    document.removeEventListener("pointerdown", onFirstInteraction);
    if (event.target.closest("#sound")) return;    // the switches handle themselves
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

  trackToggle.addEventListener("click", nextTrack);
}
