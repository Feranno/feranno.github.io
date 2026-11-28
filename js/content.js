// ================================================================
// CONTENT: edit this file to change what the site says and shows.
// ================================================================
//
// Each section becomes a menu button AND a sphere.
//   name    menu label and panel title
//   radius  sphere size. Keep them nested: each smaller than the one before.
//   color   any CSS color
//   blurb   one line under the title, or { lines, label, list }:
//           several lines, then a lead-in and a short bulleted list
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
//   columns how many columns the cards stack in (3 on small screens)
//   tabs    optional filters above the cards; each item picks one with `tab`
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
    columns: 6,
    radius: 2.2,
    color: "#a78bfa",
    blurb: "beepboop",
    tabs: ["1D", "2D", "3D", "4D"],                 // each project names one with `tab`
    items: [
      {
        title: "SAP-1",
        tab: "3D",
        image: "projects/computer/cover.jpg",                // card cover
        video: "projects/computer/conditional-jump-4k.mp4", // replaces the poster in the detail view
        poster: "projects/computer/video-poster-4k.jpg", // still frame shown before the video loads
        subtitle: "building a general purpose computer, carefully",
        diagram: "sap1",
        // One paragraph per array entry; they're joined with a blank line between them.
        note: [
          "In the beginning, all I wanted were results. I wanted to understand how " +
          "computers worked. How do computational primitives come together to form the " +
          "von Neumann architecture? What does it mean for a machine to be Turing " +
          "complete? Is it possible for us to run vastly different software programs on a " +
          "single general purpose computer? I wanted to democratize this black box of " +
          "building a computer. I felt strongly that education was broken, and that we " +
          "needed better methods of distilling information.",

          "This essay will not be an explanation of how a computer processing unit or CPU " +
          "works or an answer to these questions. If you’d like to build a computer " +
          "yourself, I highly recommend reading Code: The Hidden Language of Computer " +
          "Hardware and Software by Charles Petzold, and work through the 8-bit computer " +
          "tutorial series by Ben Eater. There are numerous other ways to build a " +
          "computer, like constructing one out of red stones in Minecraft or one in a " +
          "hardware description language like Verilog. To be honest, the latter two " +
          "alternatives would save you much more time, at the cost of learning a little " +
          "bit of esoteric knowledge, like basic breadboarding, clipping wires, a bit of " +
          "physics and transistor knowledge. The reason being, you’d be much better " +
          "equipped building modern technology by learning the tech stack for designing " +
          "and fabricating silicon chips. Instead, this essay will be a detour into the " +
          "intricacies of engineering, and a philosophy of how I might venture to create " +
          "something original myself.",

          "Early on into designing this computer, I was fascinated and drawn to the ideas " +
          "and paradigms that shaped the development of embedding logic into hardware. " +
          "How did we create magical interfaces for people to explore digital worlds, " +
          "communicate with people across the world, and interact in previously " +
          "unthinkable spaces? Where do I even begin?",

          "Intro to programming classes usually begin with variables, then a discussion " +
          "of conditionals and for loops, functions, and then maybe a little bit of " +
          "object oriented design. But whenever discussion about how the program compiles " +
          "a high level language into binary, the instructor would usually handwave this " +
          "section and say that you’ll learn about it later, and to assume for now that a " +
          "compiler is usually considered a black box. This was highly unsatisfying for " +
          "me, and I assume was too for a few curious students in class. What goes on " +
          "inside the black box? After taking a digital electronics class in high school, " +
          "my digital electronics teacher at the time introduced us to a book called " +
          "Code: The Hidden Language of Computer Hardware and Software by Charles " +
          "Petzold. In reading this book, I was particularly interested in how a computer " +
          "executes a compiled machine code.",

          "A few chapters in, you go from a discussion of binary through different " +
          "historical lenses, to logic gates from relays, to a discussion of assemblage " +
          "of memory, to building the arithmetic logic unit, a seven segment display, and " +
          "the control signals, and in the end combining all the parts to form a minimal " +
          "implementation of a computer processing unit where we can write assembly " +
          "programs into.",

          "The first time I read about how D-flip flops were constructed I felt like I " +
          "had unlocked a hidden world that stood in front of me for years. Because to " +
          "me, it meant that anything I can think of could be permanently inscribed into " +
          "memory. Any information could be encapsulated into electrical signals, moving " +
          "from A to B. This was a revelation to me. I wake up and brush my teeth. " +
          "Somewhere in my memory, I remember where I put my toothbrush. I remembered how " +
          "to put toothpaste onto my tooth brush, and I remember for all long I should " +
          "brush my teeth - to put slightly less pressure on the teeth so the blinking " +
          "red light doesn’t turn on so as not to damage the gum. This requires lifting " +
          "my hand, moving up and down precisely at the right speed, at the right angles, " +
          "and roughly keeping track of time in my head. I never thought about how my " +
          "brain consolidates memory, it just does. It works, by default. My arms move on " +
          "their own. My hands move by default. Both short term and long-term. And " +
          "programming memory, something so personal and intimate, how I wake up and " +
          "remember my identity, who I am, a student, a son, my performativity in " +
          "different roles across different social environments, survival strategies I’ve " +
          "internalized out of habit, loading these things into physical hardware seemed " +
          "alien to me at the time. D-flip flops created the possibility of storing " +
          "states, and moving states from one part of the computer to another, creating " +
          "persistent memory that could be altered.",

          "Working through building a simple as possible computer designed by Albert Paul " +
          "Malvino made it extremely easy, almost unfair to construct a computer. In the " +
          "methods outlined in building this  computer, I essentially took a massive " +
          "problem, and decomposed it into mutually exclusive but collectively exhaustive " +
          "parts, like lego pieces that each had different functions. When you pieced " +
          "them together in the right combination and order, an unlikely emergent " +
          "structure pops up with functionalities you couldn’t get before. I suspect " +
          "there are a few select states that I consider interesting and I suspect each " +
          "interesting state is orthogonal to each other, and lies on top of a mountain " +
          "of tested failed states.",

          "Abstraction seemingly takes away the details, putting things into neat little " +
          "boxes, and all I need to focus on are the inputs and outputs. I didn’t realize " +
          "it at the time, but in building this computer, and feeling frustrated that I " +
          "wasn’t making progress fast enough, this struggle of plugging and unplugging " +
          "wires, and wrestling with data primitives was foundational in fermenting the " +
          "abstractions that were previously assumed. Abstractions like creating assembly " +
          "code felt layered and justified because I explored alternative failed states. " +
          "I noticed that having a faster clock frequency wasn't always good if the " +
          "hardware underneath couldn't handle racing conditions, that a misplaced wire " +
          "could crash the entire program and I saw the program crash in real time in the " +
          "form of a jumbled mess of control signals.",

          "The details are everything. The painstaking details that had to be configured " +
          "and engineered to guardrail against failed test cases. I burnt TTL chips, " +
          "replaced LED lights with resistor-built LEDs, and sifted through 200+ wires " +
          "only to notice that the source of the problem was not a miswired input, but " +
          "the source of the weird behavior was a clock racing condition, and that the " +
          "random flickering of the lights was just a cascading consequence of that " +
          "problem. Such cases were not only common, but frequent. In this case, I had to " +
          "stabilize the clock before the input was wired into the memory address " +
          "register. As a software architect, whatever complications that could have come " +
          "up with on the physics and electrical engineering side, such as parasitic " +
          "capacitance, shorted circuits, racing conditions, and not enough power being " +
          "distributed across the board, these things are conveniently abstracted away by " +
          "chip designers and verification engineers in the process of designing and " +
          "fabricating chips.",

          "It’s not so hard to envision why this role is separated into chip designers " +
          "and software engineers. In making the control signals module, I wrote " +
          "microinstructions for designing the instruction set architecture. And I " +
          "remember thinking to myself that if a single binary input was off, I wouldn't " +
          "have noticed the problem until I uploaded the code into my EEPROM, designed " +
          "and wrote out the assembly program, inserted the program into hardware, and " +
          "saw that the control signals were off. So then after noticing something was " +
          "off, I would likely then have to check if any of my control signal wires were " +
          "off, and test to see if there’s a short circuit. But because there seems to be " +
          "nothing wrong with the control signals or the circuit, I would test to see if " +
          "I’ve inserted the assembly program correctly. Only once I’ve confirmed the " +
          "most probable causes, albeit the most immediate reasons that come to mind, as " +
          "someone who has been trained to think in high level programming languages, " +
          "having tested through the entire tech stack that I could perceive from " +
          "tutorials and documentation, would I even begin to remotely consider the " +
          "possibility that my microinstructions for the assembly program were written " +
          "wrong. And in hindsight, this process was absurdly inefficient, because I " +
          "would assume I have no memory of any previous configuration. If I knew " +
          "everything in the stack was working, I would only need to start checking from " +
          "my micro instructions embedding, and see that yes, I have made the error to " +
          "something along the lines of I bit shifted by one where I was not supposed to " +
          "on line 356. Isolating infrastructure and the modularity of designing computer " +
          "hardware and software is instrumental in keeping people sane. As a chip " +
          "designer, you are not allowed this ignorance, for others operate on top of " +
          "your work. But as you climb higher on the ladder of abstraction, a game " +
          "designer making the mechanics of a fighting mechanic could. This process of " +
          "debugging throughout the entire stack taught me the painstaking process of " +
          "building fault tolerant systems.",

          "That perhaps this dream of understanding how a computer works was just a " +
          "dream. And behind the veil of buzzwords, insights, and excitement surrounding " +
          "the capabilities of computer hardware and software lies the accumulation of " +
          "lifetimes worth of pedestrian work, failed experiments, test faults, and " +
          "resourcefulness, or in modern terms what we call hustle, as a bedrock of " +
          "innovation. There is no magic, only a series of one hardware decision or " +
          "software decision to another, each carefully selected from having " +
          "painstakingly gone through hundreds, if not thousands of trial and error.",

          "In the beginning, all you want are results. In the end, all you want is " +
          "control. And as a result, it is inevitable that your vocabulary will become " +
          "more granular.",

          "This is evident in all language acquisition: be it learning Chinese for the " +
          "first time, constructing an application specific integrated circuit for an ai " +
          "accelerator, or learning what quantum decoherence means physically. At some " +
          "point, you will lack the language to pinpoint the object you want to talk " +
          "about in relation to other subatomic particles for the first time, and we know " +
          "that such rigorous mathematical structure is evident through practical " +
          "experimentation. So you invent new terminology to pinpoint things you want to " +
          "describe more accurately, and thus be able to communicate your ideas in a " +
          "compressed state so as to be concise.",

          "In seeking to understand something, you will lose some things and gain some " +
          "others.",

          "You will have the ability to climb up and down the ladder of abstraction more " +
          "fluidly, as well as your ability to imagine and pinpoint precisely what you " +
          "want to manipulate. Like Ging, you would be able to see four to five steps " +
          "ahead of what you previously thought was impossible to parse out because you " +
          "have wrestled with the primitives yourself, and reasoned through them " +
          "carefully by rejecting failed tests that didn’t hold up against reality.",

          "At the same time, what you will care about today will change drastically with " +
          "respect to how fast you learn. And this change doesn’t have to be hard " +
          "knowledge accumulation. It could be in terms of seeing things from a different " +
          "angle, broadening your horizons, or downright thinking that the original " +
          "framing you had was downright stupid. And this is a hard pill to swallow for " +
          "some. Because it implies that just what I cared about as a child is different " +
          "from what I cared about today, what I care about today may be just as fickle " +
          "as a breeze in the wind. That I might be wrong today. I don't find joy in " +
          "collecting Yugioh cards anymore, and doing my multiplication tables doesn’t " +
          "give me the same high or challenge as memorizing 78 digits of pi as did for me " +
          "in 3rd grade. I thought that my lack of curiosity for what once spiked my " +
          "curiosity was due to fickleness in changing my opinions to fit the occasion, " +
          "or being power hungry, and being mimetic to social conditioning. That I’m not " +
          "wondering or pondering as much as I used to because I’m optimizing for some " +
          "default objective handed down to me by culture or lending myself to the " +
          "default instincts of my mammalian brain. Like perhaps I was interested in " +
          "plants versus zombies for the inherent act of the game, but also partly " +
          "because my classmates said it was cool too. But a more nuanced view of this " +
          "increasing indifference to what once made me light up as a kid, and one where " +
          "I find more plausible, is the fact that any creative endeavor, no matter how " +
          "novel, once internalized has diminishing returns.",

          "An unhealthy attachment to ideals, objects, and ideas can lead to idol " +
          "worship, like how Pouf idealized the king, but didn’t care for the king " +
          "himself. We need to have a more stubborn attachment to people, and relegate " +
          "ideas and artifacts to the realm of tools, including the most prized tools we " +
          "worship, our intelligence. Youpi formed his own code of honour through battles " +
          "with Knuckle, Shoot, and Morel. Pitou formed empathy for who the king cared " +
          "for, and was therefore able to empathize with Gon on some level to be able to " +
          "care for someone. But Pouf, Pouf stayed stagnant. He laughs at himself for his " +
          "incompetence. He ponders, contemplates, and connives to kill Komugi, but holds " +
          "himself back in fear that the king will never become the uneclipsed pinnacle " +
          "of all creatures. This internal monologue makes him annoying, and a complex " +
          "character to study.",

          "Once you ask questions enough times but don’t pursue them, you are stuck at " +
          "the same level of thinking as the questions that asked them. Repeated enough " +
          "times without thought, and the neurons that fire in my brain will associate " +
          "this pathway to the same set of results.",

          "This stagnation and mental decline from adjusting to the default terrifies me. " +
          "But so is the pursuit of the opposite of lending myself to a total disregard " +
          "for loyalty, of being tied to a topic or frame of thinking, makes me worry and " +
          "anxious. These two states can exist on the same plane. I can be terrified and " +
          "anxious of losing connection with my previous self and peers, and learn " +
          "astronomically more than I ever have been.",

          "And perhaps because of this pursuit of understanding, the questions I asked " +
          "originally at the start had become boring to me. The questions that I will " +
          "likely get asked when writing this blog, and that I have asked others will " +
          "bore me. I’ve traversed the terrain of a von Neumann architecture, and briefly " +
          "touched upon the construction of an imaginary machine that is capable of " +
          "computing any computable sequence, albeit with finite memory. I’m less " +
          "interested in knowing how binary is executed on a processing unit, and I’m " +
          "more interested in how an operating system works. How does a computer utilize " +
          "its resources to make a more powerful version of itself through " +
          "virtualization? How does a compiler process high level programming languages " +
          "like Python into assembly? What is interesting to me today will likely be " +
          "vastly different than what I will be interested in five years from now. " +
          "Perhaps by then, I will have deepened my understanding of operating systems " +
          "and compilers to some level I’ll find satisfactory, and say that my pursuit of " +
          "knowledge in that domain is done, and move on to more interesting things. " +
          "Perhaps by then, artificial intelligence will have already beaten humans in " +
          "every single conceivable behavioral benchmark, surpassing any capabilities we " +
          "thought were unique to us, and are recursively self improving. If you can’t " +
          "beat a monster or tame it, your next best bet is to ally with it, or learn " +
          "from it. It was never about my use, but about expanding the horizontal breadth " +
          "of the human condition. Have I pushed the boundaries of what I thought I " +
          "considered to be possible? Did I do everything in my power to challenge my own " +
          "assumptions? My interests will broaden. Perhaps we’d be seriously grappling " +
          "with the ethics of adopting AI robots five years from now. Osamu Tezuka’s " +
          "dream of Astro Boy that kickstarted the modern manga industry doesn’t seem too " +
          "far off just as Mary Shelley’s Frankenstein speculated on the unease of " +
          "traversing the moral complexities and consequences of unchecked scientific " +
          "creation. I’m on a mission to be culturally literate. I will try to approach " +
          "the same things but from different angles. My interpretations will become more " +
          "nuanced and precise to explore hidden alternative states, be they boring or " +
          "interesting. But these benefits hinge on the expectation that I won’t fall " +
          "into local minimums.",

          "A fool who thinks he can change a broken world is much more interesting than a " +
          "person who has given up on rejecting the existing monolithic state. It’s more " +
          "likely that the fool will fail and the conservative is right, and it’s easier " +
          "to not have dreams. Less stressful. Less pressure. Less anxiety. The world " +
          "revolves around money and power. But accepting the state of things, and not " +
          "setting goals to pursue because of the inevitability of disappointment, is not " +
          "who God intended us to be.",

          "I believe in you. Stay hungry. Keep reading. And like the themes of corruption " +
          "and injustice explored in jujutsu kaizen, help the people around you in the " +
          "confrontation of a dark world. I am on a mission to viciously care for the " +
          "people around me.",
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
      {
        title: "ranking classes",
        tab: "1D",
        subtitle: "listing classes based on how interesting they were + notes",
      },
    ],
  },
  {
    name: "books",
    columns: 6,
    radius: 1.5,
    color: "#f472b6",
    blurb: "i don't know what i'm reading",
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
    columns: 4,
    radius: 1.0,
    color: "#fbbf24",
    // lines: one per line; then a lead-in (label) and a short list
    // blurb: {
    //   lines: [
    //     "i don't know how to respond when people ask how are you.",
    //     "because i feel so many emotions at once.",
    //   ],
    //   label: "here's what i know is likely true",
    //   list: ["i love food", "i love playing basketball", "i love traveling"],
    // },
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
    columns: 6,
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
