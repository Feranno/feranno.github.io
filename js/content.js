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
//           Optional extras for projects (see "computer" below):
//             video + poster   shown instead of the image in the detail view
//             subtitle         one line under the title
//             facts            [label, value] pairs
//             gallery          [{ src, caption }], click to enlarge
//           In a note, "\n\n" starts a new paragraph.

export const SECTIONS = [
  {
    name: "about",
    radius: 3.2,
    color: "#7dd3fc",
    items: [],
    // Text laid out in the panel instead of cards. One block per group:
    //   { lead, text }       a short first line, then a paragraph
    //   { label, list }      a lead-in line, then one bullet per item
    //   { label, inline }    a lead-in line, then one bullet with the items separated by commas
    //   { label, numbered }  a lead-in line, then a numbered list
    body: [
      {
        lead: "hi! i'm feranno",
        text: "i study at the university of southern california, currently studying what i enjoy and doing research." },
      { label: "here are some things i believe in:",
        list: ["agency is a superpower", "taste is learnable", "construct beliefs actively"] },
      { label: "here are some things i like:",
        inline: ["paddling", "serendipitous blogs", "character analysis", "dandelion tea",
                 "little detours"] },
      { label: "this semester i'm taking:",
        numbered: ["discrete mathematics", "object oriented programming", "probability theory"] },
    ],
  },
  {
    name: "projects",
    radius: 2.2,
    color: "#a78bfa",
    blurb: "beepboop",
    items: [
      {
        title: "computer",
        image: "projects/computer/cover.jpg",                // card cover
        video: "projects/computer/conditional-jump.mp4",     // replaces the poster in the detail view
        poster: "projects/computer/video-poster.jpg",        // still frame shown before the video loads
        subtitle: "building a general purpose computer, carefully",
        note: "Running a conditional-jump program that counts up to 255, back down to 0, repeats.\n\n" +
              "I spent 2–3× more time debugging this thing than building it, because when my program doesn't work like I intended, I have to reason through the entire stack: did I miswire an input, did i burn a chip, do my LEDs needed resistors, did i write my control logic correctly, did i write my assembly code correctly, did i insert the pins for the assembly code correctly. I wanted to give up on this project 70–80 times. Computer architecture is very much a lesson in interaction design.",
        facts: [
          ["RAM",       "16 bytes (4-bit address)"],
          ["ALU",       "8-bit add / subtract"],
          ["Control",   "2 EEPROMs"],
          ["Branching", "JMP · JZ · JC"],
          ["Clock",     "555 timer"],
        ],
        gallery: [
          { src: "projects/computer/fibonacci-program.jpg",    caption: "Fibonacci program" },
          { src: "projects/computer/fetch-decode-execute.jpg", caption: "Fetch, decode, execute" },
          { src: "projects/computer/control-signals.jpg",      caption: "Control signals" },
        ],
      },
    ],
  },
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
    name: "visual-generation",
    radius: 1.0,
    color: "#fbbf24",
    blurb: "aesthetic",
    items: [
      { title: ""},
      { title: ""},
      { title: ""},
      { title: ""},
      { title: ""},
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
