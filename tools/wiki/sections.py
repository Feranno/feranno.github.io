"""Split downloaded Hunterpedia pages (MediaWiki parse JSON) into sections of
plain paragraphs, word for word. Usage: python3 -I sections.py WIKI_DIR OUT.json"""
import json, re, sys, os
from html.parser import HTMLParser

VOID = {"br", "img", "hr", "wbr", "input", "meta", "link", "source", "col"}

SKIP_CLASSES = ("reference", "rt", "rp", "mw-editsection", "toc", "portable-infobox", "navbox", "gallery", "thumb", "quote", "mw-references-wrap", "references")


class Sections(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skip_tag = None
        self.path = ["Intro"]          # heading path
        self.out = {}                  # "H2 > H3" -> [paragraphs]
        self.skip = 0                  # depth inside skipped elements
        self.stack = []                # tags, for skip depth
        self.cur = None                # current text buffer (p / li)
        self.head = None               # heading buffer
        self.level = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls = a.get("class", "") or ""
        if self.skip:
            if tag == self.skip_tag:
                self.skip += 1
            return
        if tag in ("rt", "rp", "style", "script", "table", "figure", "aside") or any(c in cls.split() for c in SKIP_CLASSES):
            self.skip, self.skip_tag = 1, tag
            return
        if tag in ("h2", "h3", "h4"):
            self.head, self.level = [], int(tag[1])
        elif tag in ("p", "li") and self.head is None:
            self.cur = []

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if self.skip:
            if tag == self.skip_tag:
                self.skip -= 1
            return
        if tag in ("h2", "h3", "h4") and self.head is not None:
            name = re.sub(r"\s+", " ", "".join(self.head)).strip()
            depth = self.level - 2
            self.path = self.path[:depth] + [name] if depth else [name]
            self.head = None
        elif tag in ("p", "li") and self.cur is not None:
            text = re.sub(r"\s+", " ", "".join(self.cur)).strip()
            if len(text) > 30:
                self.out.setdefault(" > ".join(self.path), []).append(text)
            self.cur = None

    def handle_data(self, data):
        if self.skip:
            return
        if self.head is not None:
            self.head.append(data)
        elif self.cur is not None:
            self.cur.append(data)


def main(src, dst):
    result = {}
    for name in sorted(os.listdir(src)):
        if not name.endswith(".json"):
            continue
        data = json.load(open(os.path.join(src, name)))
        html = data["parse"]["text"]["*"]
        p = Sections()
        p.feed(html)
        result[data["parse"]["title"]] = {"page": name[:-5], "sections": p.out}
    json.dump(result, open(dst, "w"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
