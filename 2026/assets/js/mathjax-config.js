/*
 * MathJax settings, used by speculative_technology.html.
 *
 * Must load before the MathJax library itself, which reads `window.MathJax`
 * on start-up. Inline math can be written as $...$ or \(...\).
 */

window.MathJax = {
  tex: {
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"],
    ],
  },
};
