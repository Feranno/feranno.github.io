/*
 * Google Analytics (gtag.js) settings.
 *
 * Each page loads Google's gtag.js library with an async <script> tag in its
 * <head>, then loads this file. Calls queue up in `dataLayer` until the
 * library arrives, so the order the two finish loading in doesn't matter.
 */

const GA_MEASUREMENT_ID = "G-QBD647KJDD";

window.dataLayer = window.dataLayer || [];

function gtag() {
  window.dataLayer.push(arguments);
}

gtag("js", new Date());
gtag("config", GA_MEASUREMENT_ID);
