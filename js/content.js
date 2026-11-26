// ================================================================
// CONTENT: edit this file to change what the site says and shows.
// ================================================================
//
// Each section becomes a menu button AND a sphere.
//   name    menu label and panel title
//   radius  sphere size. Keep them nested: each smaller than the one before.
//   color   any CSS color
//   blurb   one line under the title
//   items   the cards. Each is either plain text, or
//           { title, image, note } for a poster that opens a popup.
//           image paths are relative to index.html, e.g. "images/x.jpg"

export const SECTIONS = [
  { name: "about",    radius: 3.2, color: "#7dd3fc", blurb: "loading...", items: [] },
  { name: "projects", radius: 2.2, color: "#a78bfa", blurb: "beepboop",   items: [] },
  { name: "notes",    radius: 1.5, color: "#f472b6", blurb: "brrr",       items: [] },
  { name: "sports",   radius: 1.0, color: "#fbbf24", blurb: "aesthetic",  items: [] },
  {
    name: "anime",
    radius: 0.6,
    color: "#34d399",
    blurb: "Shows I love.",
    items: [
      { title: "Frieren",                     image: "images/frieren.jpg", note: "beyond journey's end" },
      { title: "Mob Psycho 100",              image: "images/mob-psycho-100.jpg" },
      { title: "Cowboy Bebop",                image: "images/cowboy-bebop.jpg" },
      { title: "Mushishi",                    image: "images/mushishi.jpg" },
      { title: "Ping Pong the Animation",     image: "images/ping-pong-the-animation.jpg" },
      { title: "Vinland Saga",                image: "images/vinland-saga.jpg" },
      { title: "Made in Abyss",               image: "images/made-in-abyss.jpg" },
      { title: "Showa Genroku Rakugo Shinju", image: "images/showa-genroku-rakugo-shinju.jpg" },
      { title: "Orb",                         image: "images/orb.jpg" },
      { title: "Attack on Titan",             image: "images/attack-on-titan.jpg" },
    ],
  },
  { name: "movies",   radius: 0.3, color: "#f87171", blurb: "Movies I love.", items: [] },
];
