# Wiki tools

Turn Hunterpedia pages (hunterxhunter.fandom.com, CC BY-SA 3.0) into the data
files the drafts read. Text is kept word for word: long paragraphs are cut at
a sentence end, footnote marks and Japanese readings in brackets are left out.

1. Download pages with the wiki's API, e.g.
   `https://hunterxhunter.fandom.com/api.php?action=parse&page=Gon_Freecss&prop=text&format=json`
   (whole pages for `sections.py`; `&section=0` for a Hunter's opening and infobox).
2. `python3 -I sections.py PAGES_DIR sections.json`: split pages into sections.
3. `python3 -I build_wiki_js.py sections.json ../../practice/aincrad/wiki.js`:
   the 20 characters in the Aincrad timeline.
4. `python3 -I build_hunters.py LEAD_DIR assoc.json members.json ../../thoughts/hunters/hunters.js`:
   every Hunter, where `assoc.json` is `sections.py` run on the Hunter_Association page and
   `members.json` maps page titles to their Hunter categories.
