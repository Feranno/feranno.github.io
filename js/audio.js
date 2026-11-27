// ================================================================
// AUDIO: background music, currently switched OFF.
//
// To turn it back on, set MUSIC_ENABLED to true. The music then works like
// anandmaj's site: browsers block sound until the visitor interacts with the
// page, so the first track starts on the first click or tap anywhere and
// fades in gently. There are no on-screen controls.
//
// While it's off, nothing is downloaded: the <audio> player is only created
// when music is enabled. The tracks stay in music/.
// To add or reorder tracks, edit TRACKS below (the first one plays).
// ================================================================

const MUSIC_ENABLED = false;

const VOLUME = 0.4;              // 0 to 1. Background music should sit quietly
const FADE_MS = 1500;            // how long the fade-in takes, in milliseconds

const TRACKS = [
  { name: "chopin", src: "music/chopin-ballade-1.mp3" },
  { name: "111hz",  src: "music/meditation-111hz.mp3" },
];

// Glide the volume up to VOLUME. (iPhones don't let pages change volume;
// there it simply plays at the phone's own volume.)
// A timer, not requestAnimationFrame: animation frames stop in background tabs.
function fadeIn(music) {
  const startTime = performance.now();
  const timer = setInterval(() => {
    const progress = Math.min((performance.now() - startTime) / FADE_MS, 1);
    music.volume = VOLUME * progress;
    if (progress === 1) clearInterval(timer);
  }, 30);
}


// ---------- Setup (called once from main.js) ----------

export function initAudio() {
  if (!MUSIC_ENABLED) return;

  const music = new Audio(TRACKS[0].src);
  music.loop = true;
  music.volume = 0;                                // fades always start from silence

  // First interaction anywhere starts the music
  function onFirstInteraction() {
    document.removeEventListener("pointerdown", onFirstInteraction);
    music.play()
      .then(() => fadeIn(music))
      .catch(() => {});                            // blocked or failed to load: stay silent
  }
  document.addEventListener("pointerdown", onFirstInteraction);
}
