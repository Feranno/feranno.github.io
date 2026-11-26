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
  { name: "about",    radius: 3.2, color: "#7dd3fc", 
    blurb: "loading...",
    items: [] },
  { name: "projects", radius: 2.2, color: "#a78bfa", blurb: "beepboop",   items: [] },
  {
    name: "books",
    radius: 1.5,
    color: "#f472b6",
    blurb: "brrr",
    items: [
      { title: "Educated",                image: "images/educated.jpg" },
      { title: "Feynman's Rainbow",       image: "images/feynmans-rainbow.jpg" },
      { title: "Harvest",                 image: "images/harvest.jpg" },
      { title: "Know My Name",            image: "images/know-my-name.jpg" },
      { title: "Sapiens",                 image: "images/sapiens.jpg" },
      { title: "When Breath Becomes Air", image: "images/when-breath-becomes-air.jpg" },
      { title: "Vagabond",                image: "images/vagabond.jpg" },
    ],
  },
  {
    name: "movies",
    radius: 1.0,
    color: "#fbbf24",
    blurb: "aesthetic",
    items: [
      { title: "2001: A Space Odyssey",   image: "images/2001-a-space-odyssey.png" },
      { title: "Darkest Hour",            image: "images/darkest-hour.jpg" },
      { title: "Decision to Leave",       image: "images/decision-to-leave.jpg" },
      { title: "Drive My Car",            image: "images/drive-my-car.jpg" },
      { title: "Dunkirk",                 image: "images/dunkirk.jpg" },
      { title: "Evil Does Not Exist",     image: "images/evil-does-not-exist.jpg" },
      { title: "F for Fake",              image: "images/f-for-fake.jpg" },
      { title: "Fallen Angels",           image: "images/fallen-angels.jpg" },
      { title: "Inception",               image: "images/inception.jpg" },
      { title: "Memento",                 image: "images/memento.jpg" },
      { title: "Mickey 17",               image: "images/mickey-17.jpg" },
      { title: "Oppenheimer",             image: "images/oppenheimer.jpg" },
      { title: "Parasite",                image: "images/parasite.jpg" },
      { title: "Perfect Days",            image: "images/perfect-days.jpg" },
      { title: "Pulp Fiction",            image: "images/pulp-fiction.jpg" },
      { title: "Star Wars",               image: "images/star-wars.jpeg" },
    ],
  },
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
      { title: "Mushoku Tensei",              image: "images/mushoku-tensei.jpg" },
      { title: "Perfect Blue",                image: "images/perfect-blue.jpg" },
      { title: "The Tale of the Princess Kaguya", image: "images/tale-of-the-princess-kaguya.jpg" },
      { title: "Tokyo Godfathers",            image: "images/tokyo-godfathers.jpg" },
      { title: "Your Name",                   image: "images/your-name.jpg" },
    ],
  },
  { name: "thoughts",   radius: 0.3, color: "#f87171", blurb: "Welcome to Aincrad.", items: [] },
];
