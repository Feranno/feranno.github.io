"""Turn sections.json (Hunterpedia text, verbatim) into practice/aincrad/wiki.js.
Only whole sentences are kept, in the wiki's own words; nothing is rewritten.
Usage: python3 -I build_wiki_js.py sections.json OUT.js"""
import json, re, sys

PAGES = {
    "gon": "Gon Freecss", "killua": "Killua Zoldyck", "kurapika": "Kurapika", "leorio": "Leorio Paradinight",
    "ging": "Ging Freecss", "hisoka": "Hisoka Morow", "illumi": "Illumi Zoldyck", "chrollo": "Chrollo Lucilfer",
    "netero": "Isaac Netero", "meruem": "Meruem", "komugi": "Komugi", "pouf": "Shaiapouf",
    "youpi": "Menthuthuyoupi", "pitou": "Neferpitou", "knuckle": "Knuckle Bine", "shoot": "Shoot McMahon",
    "morel": "Morel Mackernasey", "biscuit": "Biscuit Krueger", "kite": "Kite", "pariston": "Pariston Hill",
}

# which plot headings belong to which arc (first match wins)
ARCS = [
    ("zoldyck", r"zoldyck family"),
    ("exam", r"hunter exam"),
    ("heavens", r"heavens arena"),
    ("yorknew", r"yorknew"),
    ("greed", r"greed island"),
    ("chimera", r"chimera ant"),
    ("election", r"election"),
    ("succession", r"succession|dark continent"),
]

NAMES = {
    "gon": r"\bGon\b", "killua": r"Killua", "kurapika": r"Kurapika", "leorio": r"Leorio", "ging": r"\bGing\b",
    "hisoka": r"Hisoka", "illumi": r"Illumi", "chrollo": r"Chrollo", "netero": r"Netero", "meruem": r"Meruem|the King",
    "komugi": r"Komugi", "pouf": r"Pouf", "youpi": r"[Yy]oupi", "pitou": r"[Pp]itou", "knuckle": r"Knuckle",
    "shoot": r"Shoot", "morel": r"Morel", "biscuit": r"Biscuit|Bisky", "kite": r"Kite", "pariston": r"Pariston",
}

LIMIT = 700        # characters per paragraph, cut at a sentence end


def trim(text):
    text = re.sub(r"\s*\[\d+\]", "", text).strip()
    if len(text) <= LIMIT:
        return text
    cut = text[:LIMIT]
    end = max(cut.rfind(". "), cut.rfind("! "), cut.rfind("? "))
    return (cut[: end + 1] if end > 200 else cut.rsplit(" ", 1)[0]) + " …"


def main(src, dst):
    data = json.load(open(src))
    out = {}
    for pid, title in PAGES.items():
        page = data[title]
        secs = page["sections"]
        entry = {"page": page["page"], "title": title, "personality": [], "nen": [], "arcs": {}}
        entry["personality"] = [trim(p) for p in secs.get("Personality", [])[:2]]
        nen = (secs.get("Abilities & Powers > Nen") or secs.get("Abilities and Powers > Nen")
               or secs.get("Abilities & Powers") or secs.get("Abilities and Powers") or [])
        entry["nen"] = [trim(p) for p in nen if len(p) > 80][:1]
        for heading, paras in secs.items():
            if not heading.startswith("Plot"):
                continue
            low = heading.lower()
            for arc, pat in ARCS:
                if re.search(pat, low):
                    bucket = entry["arcs"].setdefault(arc, [])
                    for p in paras:                  # only paragraphs about this person
                        if len(p) > 80 and len(bucket) < 2 and re.search(NAMES[pid], p):
                            bucket.append(trim(p))
                    break
        entry["arcs"] = {k: v for k, v in entry["arcs"].items() if v}
        out[pid] = entry
    js = ("// GENERATED from the Hunterpedia (https://hunterxhunter.fandom.com), text\n"
          "// under CC BY-SA 3.0. Every sentence is the wiki editors' own; long\n"
          "// paragraphs are cut at a sentence end (…). Rebuild with\n"
          "// tools/wiki/build_wiki_js.py rather than editing by hand.\n"
          "export const WIKI = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n")
    open(dst, "w").write(js)
    for pid, e in out.items():
        print(pid, "pers", len(e["personality"]), "nen", len(e["nen"]), "arcs", ",".join(e["arcs"]))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
