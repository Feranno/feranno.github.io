# Letter to Yvonne (2026 site)

A plain HTML and CSS site with no build step. Served at `feranno.github.io/2026/`.

## Files

```
2026/
├── index.html                    Home
├── about.html                    About
├── letters.html                  Letter to Yvonne
├── article.html                  Essays, grouped by creator
├── rant-on-starting-anime-analysis.html   Rant, linked under Pause and Select in article.html
├── gings-unrivaled-genius.html            Essay on Ging, linked from the top of article.html
├── satoshi-kon-editing-space-and-time.html  Every Frame a Painting essay, linked from article.html
├── speculative_technology.html   Notes on future technologies (uses MathJax)
├── courses.html                  Undergraduate courses
└── assets/
    ├── css/
    │   ├── base.css        colors, fonts, links (start here to restyle)
    │   ├── layout.css      menu, text column, tablet and mobile layout
    │   └── components.css  collapsible sections, reading lists, letter paragraphs
    └── js/
        ├── analytics.js       Google Analytics settings
        └── mathjax-config.js  MathJax settings
```

## Common edits

- **Change a color or font:** edit the variables at the top of `assets/css/base.css`.
- **Add a menu item:** the menu is copied into all six pages. Add the link to each
  one, and put `aria-current="page"` on the link to the page itself.
- **Add an essay or creator:** in `article.html`, add an `<li>` to a list, or copy a
  whole `<details class="collapsible">` block.
- **Add a page:** copy `about.html`, change the `<title>`, the content in `<main>`, and
  which menu link has `aria-current="page"`. Then add it to every page's menu.

## Preview locally

From the repository root (the folder above `2026/`), start any local web server, for example:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000/2026/`.
