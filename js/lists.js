// ================================================================
// LISTS: links worth keeping, like anniehu.com/lists.
//
// Add a link by adding one line to LINKS. Order doesn't matter: the list is
// always shown newest first, by `published` (when its creator published it).
//   title       as the creator wrote it
//   by          channel or author
//   url         the link (keep a &t=… start time if you want one)
//   published   "YYYY-MM-DD"
//   seconds     a video's length (optional; shown as "12 min")
//   image       a preview picture (optional; YouTube links get theirs automatically)
//   margin      true = also show it in the thoughts panel (a few picks only)
//
// The full list always has its own page, lists/index.html (Annie's table).
// Where else it appears is LISTS_DRAFT below (practice/lists/ compares them):
//   "page"     only on its own page, linked from thoughts
//   "thoughts" also in the thoughts panel: just the `margin: true` picks,
//              under a "Things I keep coming back to" link to the page
//   "sphere"   its own sphere and menu entry, with video thumbnails
// To preview another without editing: add ?lists=thoughts to the address.
// ================================================================

export const LISTS_DRAFT = "thoughts";          // chosen 2026-11-28 (B · Margin)

export const LINKS = [
  { title: "Resentment is needing others to change so you can stay the same", by: "Carmen, Altered", margin: true,
    url: "https://altered.substack.com/p/resentment", published: "2026-03-14",
    image: "https://substackcdn.com/image/fetch/$s_!V8GP!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa965ae01-31eb-4d4e-a813-be050fdfe392_622x375.jpeg" },
  { title: "The Value of a Fraud | Mob Psycho 100", by: "Kyle Robes", margin: true,
    url: "https://www.youtube.com/watch?v=JkyfiQmGD2s", published: "2021-05-15", seconds: 728 },
  { title: "Peak Dumbass - A Reflection on Cheetu", by: "Mathwiz", margin: true,
    url: "https://www.youtube.com/watch?v=YZBMSxcPo6A&t=312s", published: "2020-04-22", seconds: 473 },
  { title: "The Ultimate Motivation in Haikyuu", by: "Aleczandxr",
    url: "https://www.youtube.com/watch?v=_P2QtmF9-bI", published: "2019-07-26", seconds: 696 },
  { title: "【Attack on Titan｜Erwin Smith】Atonement", by: "S.Yushan",
    url: "https://www.youtube.com/watch?v=NngTZr1bZGM", published: "2019-07-24", seconds: 243 },
  { title: "Passing the Torch in Naruto", by: "Mathwiz",
    url: "https://www.youtube.com/watch?v=KLYVrzset8k", published: "2019-04-27", seconds: 604 },
  { title: "Where to Draw the Line | Lining in Animation", by: "Any-mation",
    url: "https://www.youtube.com/watch?v=CIVKpaLFc3w", published: "2018-04-12", seconds: 570 },
  { title: "Isao Takahata | Animating Reality", by: "Any-mation",
    url: "https://www.youtube.com/watch?v=5Ef78Lwd_Ok", published: "2017-12-02", seconds: 841 },
  { title: "12 Years A Slave - The Cinema of Time", by: "The House of Tabula",
    url: "https://www.youtube.com/watch?v=TJoUP1DaZHg", published: "2017-08-17", seconds: 867 },
  { title: "Afternoon Class - Animation Short Film (2014)", by: "Osro",
    url: "https://www.youtube.com/watch?v=CAYDRIbXFAc", published: "2017-07-26", seconds: 230 },
  { title: "Understanding Disaster, Part 4: Yokohama Kaidashi Kikou and the Harmonious Apocalypse", by: "Pause and Select",
    url: "https://www.youtube.com/watch?v=npLVlJTH_mk", published: "2016-12-18", seconds: 1192 },
];


// ---------- Helpers, shared by every way of showing the list ----------

export function newestFirst() {
  return [...LINKS].sort((a, b) => b.published.localeCompare(a.published));
}

// "2026-03-14" → "Mar 14, 2026" (or "Mar 14" with { year: false })
export function formatDate(iso, { year = true } = {}) {
  const [y, m, d] = iso.split("-").map(Number);
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];
  return year ? `${month} ${d}, ${y}` : `${month} ${d}`;
}

// "2026-03-14" → "Mar 2026"
export function formatMonth(iso) {
  return formatDate(iso).replace(/ \d+,/, "");
}

// 728 → "12 min" (how long it takes to watch, rounded)
export function formatMinutes(seconds) {
  return seconds ? `${Math.max(1, Math.round(seconds / 60))} min` : "";
}

// 728 → "12:08"
export function formatLength(seconds) {
  if (!seconds) return "";
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

// The link's preview picture: its own `image`, else YouTube's thumbnail
export function previewImage(link) {
  if (link.image) return link.image;
  const id = new URL(link.url).searchParams.get("v");
  return id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null;
}

// Which draft to show: ?lists=… in the address wins, for previewing
export function listsDraft() {
  const asked = new URLSearchParams(location.search).get("lists");
  return ["page", "thoughts", "sphere"].includes(asked) ? asked : LISTS_DRAFT;
}

// Put the list where the chosen draft says, before the site builds itself
// (main.js calls this first). `sections` is SECTIONS from content.js.
export function placeLists(sections) {
  const draft = listsDraft();
  const thoughts = sections.find((s) => s.name === "thoughts");
  if (draft === "page" && thoughts) {
    thoughts.body = [...(thoughts.body ?? []),
      { text: ["Things I keep coming back to: ", { text: "lists", href: "lists/" }, "."] }];
  }
  if (draft === "thoughts" && thoughts) {
    // Right under the text, above any picture (the World Seed), so it's seen first
    const body = [...(thoughts.body ?? [])];
    const firstImage = body.findIndex((block) => block.image);
    body.splice(firstImage === -1 ? body.length : firstImage, 0, { links: true });
    thoughts.body = body;
  }
  if (draft === "sphere") {
    sections.push({ name: "lists", radius: 0.16, color: "#f0abfc", layout: "links", items: [],
      blurb: "Things I keep coming back to." });
  }
}
