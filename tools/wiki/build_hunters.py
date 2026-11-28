"""Build practice/hunters/hunters.js from downloaded Hunterpedia pages.
Every sentence is the wiki's own. Long paragraphs are cut at a sentence end
(…), and Japanese readings in brackets are left out. Nothing is reworded.
Usage: python3 -I build_hunters.py LEAD_DIR ASSOC_JSON MEMBERS_JSON OUT.js"""
import json, os, re, sys
from html.parser import HTMLParser

VOID = {"br", "img", "hr", "wbr", "input", "meta", "link", "source", "col"}

SKIP_TAGS = {"rt", "rp", "style", "script", "table", "figure", "aside"}   # footnote <sup>s go by class
SKIP_CLASSES = {"reference", "mw-editsection", "toc", "navbox", "gallery", "thumb", "quote", "explain"}


class Text(HTMLParser):
    """Paragraph text outside the infobox (and other skipped boxes)."""
    def __init__(self):
        super().__init__()
        self.skip_tag = None
        self.skip, self.cur, self.paras = 0, None, []

    def handle_starttag(self, tag, attrs):
        cls = set((dict(attrs).get("class") or "").split())
        if self.skip:
            if tag == self.skip_tag:
                self.skip += 1
            return
        if tag in SKIP_TAGS or cls & SKIP_CLASSES:
            self.skip, self.skip_tag = 1, tag
        elif tag == "p":
            self.flush()
            self.cur = []

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if self.skip:
            if tag == self.skip_tag:
                self.skip -= 1
        elif tag in ("p", "div") and self.cur is not None:
            self.flush()

    def flush(self):
        if self.cur is not None:
            t = clean("".join(self.cur))
            if len(t) > 40 and not t.startswith("Cite error"):
                self.paras.append(t)
        self.cur = None

    def handle_data(self, data):
        if not self.skip and self.cur is not None:
            self.cur.append(data)


def clean(t):
    t = re.sub(r"\s+", " ", t).strip()
    # brackets holding Japanese script (readings, romanizations) are left out
    for _ in range(3):                             # empty ruby brackets first, then readings
        t = re.sub(r"\(\s*\)", "", t)
        t = re.sub(r"\s*\([^()]*[぀-ヿ一-鿿][^()]*\)", "", t)
    return re.sub(r"\s+([,.])", r"\1", t).strip()


def trim(t, limit=650):
    if len(t) <= limit:
        return t
    cut = t[:limit]
    end = max(cut.rfind(". "), cut.rfind("! "), cut.rfind("? "))
    return (cut[: end + 1] if end > 150 else cut.rsplit(" ", 1)[0]) + " …"


def field(html, name):
    m = re.search(r'data-source="%s">.*?<div class="pi-data-value[^"]*">(.*?)</div>' % re.escape(name), html, re.S)
    if not m:
        return []
    raw = re.sub(r'<span class="explain".*?</span>', "", m.group(1), flags=re.S)
    raw = re.sub(r'<sup[^>]*class="reference".*?</sup>', "", raw, flags=re.S)
    parts = re.split(r"<br\s*/?>|<li>", raw)
    out = [clean(re.sub(r"<[^>]+>", "", p)) for p in parts]
    return [p for p in out if p]


def image(html):
    m = re.search(r'data-source="image".*?<img[^>]+?(?:data-src|src)="(https://static\.wikia\.nocookie\.net/[^"]+)"', html, re.S)
    if not m:
        return None
    url = m.group(1).replace("&amp;", "&")
    return re.sub(r"/scale-to-width-down/\d+", "", url)   # the original: not every size exists


# Types: their category, and the heading on the Hunter Association page
TYPE_OF_CATEGORY = {
    "Beast_Hunters": "Beast Hunter", "Blacklist_Hunters": "Blacklist Hunter", "Gourmet_Hunters": "Gourmet Hunter",
    "Ruins_Hunters": "Ruins Hunter", "Treasure_Hunters": "Treasure Hunter", "Temp_Hunters": "Temp Hunter",
    "Provisional_Hunters": "Provisional Hunter", "Amateur_Hunters": "Amateur Hunter", "Rookie_Hunter": "Rookie",
}


def main(lead_dir, assoc_path, members_path, dst):
    assoc = json.load(open(assoc_path))["Hunter Association"]["sections"]
    types = {}
    for heading, paras in assoc.items():
        if heading.startswith("Types of Hunters > "):
            name = heading.split(" > ", 1)[1].replace("Unclassified/Unknown Type Hunters", "Unclassified Hunters")
            name = re.sub(r"s$", "", name) if name not in ("Rookies",) else "Rookie"
            types[name] = [trim(clean(p)) for p in paras[:2]]
    for heading, paras in assoc.items():           # kinds described outside "Types of Hunters"
        if heading.endswith("Provisional Hunters"):
            types["Provisional Hunter"] = [trim(clean(p)) for p in paras[:2]]
    ALIASES = {"Disease Hunter": "Disease/Virus Hunter", "Virus Hunter": "Disease/Virus Hunter"}
    members = json.load(open(members_path))

    hunters = []
    NOT_PEOPLE = {"Amateur Hunters", "Bounty Hunter", "Zodiacs"}   # group pages in the categories
    LEFT_OUT = {"Kenzaki", "Likke", "Latoon", "Grachan"}            # your choice
    NOT_PEOPLE |= LEFT_OUT
    for title, cats in members.items():
        if title in NOT_PEOPLE:
            continue
        f = os.path.join(lead_dir, title.replace("/", "_") + ".json")
        try:
            page = json.load(open(f))["parse"]
        except Exception:
            continue
        html = page["text"]["*"]
        occupation = field(html, "occupation")
        # the opening text follows the infobox, often outside any <p>
        t = Text(); t.cur = []; t.feed(html[html.rfind("</aside>") + 8:] if "</aside>" in html else html); t.flush()
        # their Hunter type: the occupation line naming a type, else the category
        kind = None
        for line in occupation + t.paras[:1]:          # the infobox first, then the opening sentence
            for name in sorted(list(types) + list(ALIASES), key=len, reverse=True):
                if name.lower() in line.lower():
                    kind = ALIASES.get(name, name); break
            if kind: break
        if not kind:
            kind = next((TYPE_OF_CATEGORY[c] for c in cats if c in TYPE_OF_CATEGORY), None)
        if not kind:
            kind = "Unclassified Hunter"            # the wiki gives no specialization
        stars = 3 if "Triple_Star_Hunters" in cats else 2 if "Double_Star_Hunters" in cats else 1 if "Single_Star_Hunters" in cats else 0
        hunters.append({
            "name": page["title"], "page": page["title"].replace(" ", "_"),
            "image": image(html), "kind": kind, "stars": stars,
            "zodiac": "Zodiac_Twelve" in cats,
            "occupation": occupation[:4], "nen": (field(html, "type") or [None])[0],
            "lead": [trim(p) for p in t.paras[:2]],
        })
    hunters.sort(key=lambda h: (h["kind"] == "Unclassified Hunter", h["kind"], h["name"]))
    js = ("// GENERATED from the Hunterpedia (https://hunterxhunter.fandom.com), text under\n"
          "// CC BY-SA 3.0. Every sentence is the wiki editors' own; long paragraphs are cut\n"
          "// at a sentence end (…) and Japanese readings in brackets are left out.\n"
          "// Images are the wiki's, loaded from its servers. Rebuild with tools/wiki/build_hunters.py.\n"
          "export const TYPES = " + json.dumps(types, ensure_ascii=False, indent=1) + ";\n\n"
          "export const HUNTERS = " + json.dumps(hunters, ensure_ascii=False, indent=1) + ";\n")
    open(dst, "w").write(js)
    from collections import Counter
    print(len(hunters), "hunters;", sum(1 for h in hunters if h["image"]), "with images")
    print(Counter(h["kind"] for h in hunters).most_common())


if __name__ == "__main__":
    main(*sys.argv[1:5])
