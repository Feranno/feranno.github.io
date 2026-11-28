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
//             diagram: "sap1"  boxes over the video and the clock stepper
//                              under it (js/sap1.js)
//           In a note, "\n\n" starts a new paragraph.
//   layout  optional. "photos" shows items as { image, caption } photos
//           in a wall, each opening full size on click.

export const SECTIONS = [
  {
    name: "about",
    radius: 3.2,
    color: "#7dd3fc",
    items: [],
    // Text laid out in the panel instead of cards. One block per group:
    //   { lead, text }       a short first line, then a paragraph
    //                        text can also mix in links:
    //                        ["see ", { text: "this page", href: "2026/article.html" }]
    //   { label, list }      a lead-in line, then one bullet per item
    //   { label, inline }    a lead-in line, then one bullet with the items separated by commas
    //   { label, numbered }  a lead-in line, then a numbered list
    body: [
      {
        lead: "hi! i'm feranno",
        text: "i study at the university of southern california, currently taking what i enjoy and doing research." },
      /*
        { label: "here are some things i believe in:",
        list: ["agency is a superpower", "taste is learnable", "construct beliefs actively"] },
      { label: "here are some things i like:",
        inline: ["paddling", "serendipitous blogs", "character analysis", "dandelion tea",
                 "little detours"] },
      */
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
        title: "SAP-1",
        image: "projects/computer/cover.jpg",                // card cover
        video: "projects/computer/conditional-jump-4k.mp4", // replaces the poster in the detail view
        poster: "projects/computer/video-poster-4k.jpg", // still frame shown before the video loads
        subtitle: "building a general purpose computer, carefully",
        diagram: "sap1",
        // One paragraph per array entry; they're joined with a blank line between them.
        note: [
          "I wanted to understand how computers worked. How do computational primitives " +
          "come together to form the von Neumann architecture? What does it mean for a " +
          "machine to be Turing complete? Is it possible for us to run vastly different " +
          "software programs on a single general purpose computer?",

          "In the beginning, all you see are the results. I see the ideas and paradigms " +
          "that shaped the industry - starting from binary, to logic gates, to a discussion " +
          "of relays and transistors, to building the clock, the ALU, the display, and the " +
          "control signals, and in the end combining all the parts to form a minimal " +
          "implementation of a computer processing unit where we can write assembly " +
          "programs into.",

          "In the end, all I saw were the painstaking details that had to be " +
          "configured and engineered to guardrail against failed test cases. I burnt TTL " +
          "chips, replaced LED lights with resistor-built in LEDs, sifted through 200+ wires " +
          "to notice that the source of the problem was not a miswired input, but a clock " +
          "racing condition, so then I had to stablize the clock before the input was wired " +
          "into the memory address register.",

          "I remember writing the microinstructions for " +
          "designing the instruction set architecture for my assembly language, and I " +
          "remember thinking to myself that if a single binary input was off, I wouldn't " +
          "notice the problem until I write the assembly program, insert the program into " +
          "hardware, see that the control signals are off, check if any of my control " +
          "signal wires were off, check if at any point there exists a short circuit, check " +
          "if I inserted the assembly program wrong, and only after going through the " +
          "entire tech stack, would I consider if the microinstructions for the assembly " +
          "program were written wrong. This process of debugging throughout the entire " +
          "stack taught me the painstaking process of building fault tolerant systems.",

          "That perhaps this dream of understanding how a computer works was just that - a " +
          "dream. And behind the veil of buzzwords, insights, and excitement surrounding " +
          "the capabilities of computer hardware and software lies the accumulation of " +
          "lifetimes worth of pedestrian work, failed experiments, test faults, and " +
          "resourcefulness, or in modern terms what we call hustle, as a bedrock of " +
          "innovation.",
        ].join("\n\n"),
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
    ],
  },
  {
    name: "photos",
    radius: 1.0,
    color: "#fbbf24",
    blurb: "aesthetic",
    // layout "photos": a wall of photos at their own shapes, no titles on top.
    // Clicking one enlarges it with its caption.
    layout: "photos",
    items: [
      { image: "photos/01-soccer.jpg",             caption: "first kick" },
      { image: "photos/02-smoothies.jpg",          caption: "mango smoothies" },
      { image: "photos/03-cub-scouts.jpg",         caption: "cub scouts gift exchange" },
      { image: "photos/04-shanghai-tower.jpg",     caption: "oriental pearl tower, shanghai" },
      { image: "photos/05-skewers.jpg",            caption: "night market skewers" },
      { image: "photos/06-hawker-noodles.jpg",     caption: "hawker centre noodles" },
      { image: "photos/07-marina-bay.jpg",         caption: "marina bay, singapore" },
      { image: "photos/08-hawker-shells.jpg",      caption: "cockles and sea snails" },
      { image: "photos/09-rose-syrup.jpg",         caption: "nasi lemak and rose syrup" },
      { image: "photos/10-hor-fun.jpg",            caption: "hor fun" },
      { image: "photos/11-budapest-ice-cream.jpg", caption: "ice cream walk, budapest" },
      { image: "photos/12-basketball-rebound.jpg", caption: "going up for it" },
      { image: "photos/13-basketball-layup.jpg",   caption: "layup" },
      { image: "photos/14-basketball-line.jpg",    caption: "waiting in line" },
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
      { title: "Akame ga Kill!",              image: "images/akame-ga-kill.jpg" },
      { title: "Chainsaw Man",                image: "images/chainsaw-man.jpg" },
      { title: "Chihayafuru",                 image: "images/chihayafuru.jpg" },
      { title: "Cyberpunk: Edgerunners",      image: "images/cyberpunk-edgerunners.jpg" },
      { title: "Death Note",                  image: "images/death-note.jpg" },
      { title: "Erased",                      image: "images/erased.jpg" },
      { title: "Fullmetal Alchemist: Brotherhood", image: "images/fullmetal-alchemist-brotherhood.jpg" },
      { title: "Future Diary",                image: "images/future-diary.jpg" },
      { title: "Great Teacher Onizuka",       image: "images/great-teacher-onizuka.jpg" },
      { title: "Haikyu!!",                    image: "images/haikyuu.jpg" },
      { title: "Hajime no Ippo",              image: "images/hajime-no-ippo.jpg" },
      { title: "Hunter x Hunter (2011)",      image: "images/hunter-x-hunter-2011.jpg" },
      { title: "Kaguya-sama: Love Is War",    image: "images/kaguya-sama-love-is-war.jpg" },
      { title: "Kuroko's Basketball",         image: "images/kuroko-no-basket.jpg" },
      { title: "Legend of the Galactic Heroes", image: "images/legend-of-the-galactic-heroes.jpg" },
      { title: "Monster",                     image: "images/monster.jpg" },
      { title: "Naruto",                      image: "images/naruto.jpg" },
      { title: "Naruto Shippuden",            image: "images/naruto-shippuden.jpg" },
      { title: "Neon Genesis Evangelion",     image: "images/neon-genesis-evangelion.jpg" },
      { title: "One Piece",                   image: "images/one-piece.jpg" },
      { title: "Oshi no Ko",                  image: "images/oshi-no-ko.jpg" },
      { title: "Re:Zero",                     image: "images/re-zero.jpg" },
      { title: "Run with the Wind",           image: "images/run-with-the-wind.jpg" },
      { title: "Steins;Gate",                 image: "images/steins-gate.jpg" },
      { title: "Sword Art Online",            image: "images/sword-art-online.jpg" },
      { title: "The Promised Neverland",      image: "images/the-promised-neverland.jpg" },
      { title: "The Tatami Galaxy",           image: "images/the-tatami-galaxy.jpg" },
      { title: "Your Lie in April",           image: "images/your-lie-in-april.jpg" },
    ],
  },
  {
    name: "thoughts",
    radius: 0.3,
    color: "#f87171",
    blurb: "Welcome to Aincrad.",
    items: [],
    body: [
      { text: [
        "I am obsessed with ",
        { text: "media literacy", href: "2026/article.html" },
        " and ",
        { text: "character analysis", href: "2026/letters.html" },
      ] },
    ],
  },
];
