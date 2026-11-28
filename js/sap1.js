// ================================================================
// SAP-1: the clock stepper under the project video, the boxes drawn over
// the video, and the control-word glossary. Used by panel.js for an item
// with diagram: "sap1".
//
// Every word shown comes from Feranno's own notes: the control-signal
// sketch (part names and signal descriptions), the fetch-decode notes
// (step register, EEPROM, control word, "halt the computer"), the README
// (clock, flags) and the program on paper (count up to 255, count down
// to 0, put 1 into address 15). Keep it that way.
//
// Look: monochrome, drawn by hand (rough.js, loaded on first use; plain
// lines without it). The only color is the display, as on the board.
// Less is more: the video shows only the parts at work this clock tick.
//
// The steps come from simulating the program, with the instruction set and
// microcode of the Ben Eater design (as in the Shamblog write-up).
// Styles: css/style.css, "SAP-1 stepper".
// ================================================================

import { ANCHORS, FPS } from "./sap1-timeline.js";

// ---------- Parts, and where they are on the video ----------
// tag: where each name tag sits over the video (overlay units, see OV below),
// chosen so no tag covers an LED, the display or the potentiometer.
// Boxes are [left, top, right, bottom] in percent of the BOARD. The video
// shows the board with a margin around it (tools/topdown.py: 10% left and
// right, 12% top and bottom), so toVideo() converts to percent of the video.
const toVideo = ([l, t, r, b]) => [(10 + l) / 1.2, (12 + t) / 1.24, (10 + r) / 1.2, (12 + b) / 1.24];

const PARTS = [
  { id: "clock",   label: "Clock",         box: [0, 0, 45, 14], tag: [90, 56] },
  { id: "pc",      label: "PC",            box: [52, 0, 78, 13], tag: [525, 56] },
  { id: "mar",     label: "MAR",           box: [0, 15, 44, 31], tag: [316, 213] },
  { id: "ram",     label: "RAM",           box: [0, 31, 44, 58], tag: [90, 338] },
  { id: "ir",      label: "IR",            box: [15, 60, 46, 75], tag: [395, 558] },
  { id: "step",    label: "Step register", box: [0, 66, 16, 82], tag: [90, 560] },
  { id: "eeprom",  label: "EEPROM",        box: [8, 84, 34, 98], tag: [158, 741] },
  { id: "word",    label: "Control word",  box: [55, 89, 83, 100], tag: [548, 863] },
  { id: "bus",     label: "Bus",           box: [45, 0, 53, 100] },
  { id: "a",       label: "A",             box: [52, 14, 84, 32], tag: [525, 211] },
  { id: "flags",   label: "Flags",         box: [84, 17, 97, 32], tag: [792, 231] },
  { id: "alu",     label: "ALU",           box: [52, 32, 97, 49], tag: [525, 344] },
  { id: "b",       label: "B",             box: [52, 49, 97, 60], tag: [525, 474] },
  { id: "out",     label: "OUT",           box: [52, 61, 84, 76], tag: [525, 566] },
  { id: "display", label: "Display",       box: [84, 61, 100, 71], tag: [794, 614] },
].map((p) => ({ ...p, video: toVideo(p.box) }));
const PART = Object.fromEntries(PARTS.map((p) => [p.id, p]));

// ---------- The control word ----------
// In the order of the label strip on the board. Descriptions: the
// control-signal sketch; HLT from the fetch-decode notes; FI from Feranno.
const SIGNALS = [
  ["HLT", "halt the computer"],
  ["MI", "Memory address register in"],
  ["RI", "RAM in"],
  ["RO", "RAM out"],
  ["II", "Instruction register in"],
  ["IO", "Instruction register out"],
  ["AI", "A register in"],
  ["AO", "A register out"],
  ["EO", "Sum out"],
  ["SU", "Subtract"],
  ["BI", "B register in"],
  ["OI", "Output register in"],
  ["CE", "Counter enable"],
  ["CO", "Program counter out"],
  ["J", "Jump (Program counter in)"],
  ["FI", "Flag register in"],
];
const SHOWN = (x) => (x === "EO" ? "ΣO" : x);     // as on the label strip on the board
const WRITERS = { RO: "ram", IO: "ir", AO: "a", EO: "alu", CO: "pc" };
const READERS = { MI: "mar", RI: "ram", II: "ir", AI: "a", BI: "b", OI: "out", J: "pc" };

// The parts at work in a step: who puts a number on the bus, who takes it,
// and the ones changed without the bus (counting up, saving flags, showing)
function roles(s) {
  const writer = s.sig.map((x) => WRITERS[x]).find(Boolean) || null;
  const readers = s.sig.map((x) => READERS[x]).filter(Boolean);
  const touched = [];
  if (s.sig.includes("CE")) touched.push("pc");
  if (s.sig.includes("FI")) touched.push("flags");
  if (s.sig.includes("OI")) touched.push("display");
  return { writer, readers, touched };
}

// ---------- Instruction set and microcode ----------
const FETCH = [["MI", "CO"], ["RO", "II", "CE"]];
const OPS = {
  0: { name: "NOP", steps: [] },
  1: { name: "LDA", steps: [["IO", "MI"], ["RO", "AI"]] },
  2: { name: "ADD", steps: [["IO", "MI"], ["RO", "BI"], ["EO", "AI", "FI"]] },
  3: { name: "SUB", steps: [["IO", "MI"], ["RO", "BI"], ["EO", "AI", "SU", "FI"]] },
  4: { name: "STA", steps: [["IO", "MI"], ["AO", "RI"]] },
  5: { name: "LDI", steps: [["IO", "AI"]] },
  6: { name: "JMP", steps: [["IO", "J"]] },
  7: { name: "JC", steps: [["IO", "J"]], when: "carry" },
  8: { name: "JZ", steps: [["IO", "J"]], when: "zero" },
  14: { name: "OUT", steps: [["AO", "OI"]] },
  15: { name: "HLT", steps: [["HLT"]] },
};

// ---------- The program, as written on paper ----------
const PROGRAM = [
  [0, 14, 0, "OUT"], [1, 2, 15, "ADD 15"], [2, 7, 4, "JC 4"], [3, 6, 0, "JMP 0"],
  [4, 3, 15, "SUB 15"], [5, 14, 0, "OUT"], [6, 8, 0, "JZ 0"], [7, 6, 4, "JMP 4"],
];
const NOTES = [[0, 3, "count up to 255"], [4, 7, "count down to 0"], [15, 15, "put 1 into address 15"]];

// Every clock step from reset, as the state just before each clock edge
function simulate(outsWanted) {
  const ram = new Array(16).fill(0);
  PROGRAM.forEach(([addr, op, arg]) => (ram[addr] = (op << 4) | arg));
  ram[15] = 1;
  let pc = 0, mar = 0, ir = 0, a = 0, b = 0, out = 0, cf = 0, zf = 0;
  const steps = [], outs = [];
  let at = 0;
  while (outs.length < outsWanted) {
    for (let t = 0; t < 5; t++) {
      if (t === 0) at = pc;
      const op = OPS[ir >> 4] || OPS[0];
      let sig = t < 2 ? FETCH[t] : op.steps[t - 2] || [];
      if (t >= 2 && op.when && !(op.when === "carry" ? cf : zf)) sig = [];
      const has = (s) => sig.includes(s);
      const sum = has("SU") ? a + ((~b) & 255) + 1 : a + b;
      const alu = sum & 255;
      let bus = null;
      if (has("CO")) bus = pc;
      if (has("RO")) bus = ram[mar];
      if (has("IO")) bus = ir & 15;
      if (has("AO")) bus = a;
      if (has("EO")) bus = alu;
      steps.push({ t, sig, bus, pc, mar, ir, a, b, alu, out, cf, zf, at });
      if (has("MI")) mar = bus & 15;
      if (has("II")) ir = bus;
      if (has("AI")) a = bus;
      if (has("BI")) b = bus;
      if (has("OI")) { out = bus; outs.push(steps.length - 1); }
      if (has("J")) pc = bus & 15;
      if (has("CE")) pc = (pc + 1) & 15;
      if (has("FI")) { cf = sum > 255 ? 1 : 0; zf = alu === 0 ? 1 : 0; }
    }
    const name = (OPS[ir >> 4] || OPS[0]).name;  // known once T1 has loaded it
    for (let k = steps.length - 5; k < steps.length; k++) steps[k].instr = name;
  }
  return { steps, outs };
}

let SIM = null;                                    // made on first open
const sim = () => (SIM ??= simulate(700));      // past the end of the video

// ---------- rough.js, loaded once ----------
let roughReady = null;
function loadRough() {
  if (window.rough) return Promise.resolve(window.rough);
  roughReady ??= new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/roughjs@4.6.6/bundled/rough.js";
    s.onload = () => resolve(window.rough);
    s.onerror = () => resolve(null);               // offline: plain lines instead
    document.head.append(s);
  });
  return roughReady;
}

const NS = "http://www.w3.org/2000/svg";
function el(name, attrs = {}, parent) {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  parent?.append(e);
  return e;
}
const cssVar = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

// A pen: hand-drawn shapes with rough.js, or plain ones without it.
// Each shape gets its own seed so a box keeps the same wobble from tick to tick.
function pen(svg, rough) {
  const rc = rough ? rough.svg(svg) : null;
  const add = (node) => (svg.append(node), node);
  return {
    rect(x, y, w, h, o, seed) {
      if (rc) return add(rc.rectangle(x, y, w, h, { ...o, seed }));
      return el("rect", { x, y, width: w, height: h, rx: 3, fill: o.fill && o.fillStyle === "solid" ? o.fill : "none",
        stroke: o.stroke, "stroke-width": o.strokeWidth, "stroke-dasharray": o.strokeLineDash?.join(" ") }, svg);
    },
    line(x1, y1, x2, y2, o, seed) {
      if (rc) return add(rc.line(x1, y1, x2, y2, { ...o, seed }));
      return el("line", { x1, y1, x2, y2, stroke: o.stroke, "stroke-width": o.strokeWidth, "stroke-linecap": "round" }, svg);
    },
    path(points, o, seed) {
      if (rc) return add(rc.linearPath(points, { ...o, seed }));
      return el("polyline", { points: points.map((p) => p.join(",")).join(" "), fill: "none", stroke: o.stroke,
        "stroke-width": o.strokeWidth, "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
    },
    circle(cx, cy, d, o, seed) {
      if (rc) return add(rc.circle(cx, cy, d, { ...o, seed }));
      return el("circle", { cx, cy, r: d / 2, fill: o.fill && o.fillStyle === "solid" ? o.fill : "none",
        stroke: o.stroke, "stroke-width": o.strokeWidth }, svg);
    },
  };
}
const text = (svg, x, y, str, cls, anchor = "start") => {
  const t = el("text", { x, y, class: cls, "text-anchor": anchor }, svg);
  t.textContent = str;
  return t;
};


// ================================================================
// The boxes over the video: only the parts at work this tick
// ================================================================
// The overlay's units: 1000 across, and the video's own shape down
const OV = { w: 1000, h: 1000 * 2160 / 2280 };

function paintOverlay(svg, s, rough) {
  svg.replaceChildren();
  svg.setAttribute("viewBox", `0 0 ${OV.w} ${OV.h}`);
  const p = pen(svg, rough);
  const { writer, readers, touched } = roles(s);
  // Every part keeps its box and name; the ones in use this tick are highlighted.
  // Writing to the bus: solid. Reading from it, or changed without it: dashed.
  const how = (id) => (id === writer ? "writes" : readers.includes(id) || touched.includes(id) ? "reads" : "quiet");
  const order = PARTS.filter((x) => how(x.id) === "quiet").concat(PARTS.filter((x) => how(x.id) !== "quiet"));
  for (const part of order) {
    const state = how(part.id);
    const [l, t, r, b] = part.video;
    const x = l * 10, y = t * OV.h / 100, w = (r - l) * 10, h = (b - t) * OV.h / 100;
    p.rect(x, y, w, h, {
      roughness: 1.1, bowing: 1,
      stroke: state === "quiet" ? "rgba(255,255,255,0.4)" : "#fff",
      strokeWidth: state === "writes" ? 5 : state === "reads" ? 3.5 : 1.6,
      strokeLineDash: state === "reads" ? [14, 10] : undefined,
    }, 11 + PARTS.indexOf(part));
    const label = part.label, tw = label.length * 13 + 20;
    const vertical = part.id === "bus";
    const [tx, ty] = vertical ? [x + w / 2 - 16, OV.h * 0.42] : part.tag;
    const g = el("g", { class: `sap-tag ${state}` }, svg);
    if (vertical) g.setAttribute("transform", `rotate(90 ${tx + 16} ${ty + 16})`);
    el("rect", { x: tx, y: ty, width: tw, height: 32, rx: 4 }, g);
    text(g, tx + 10, ty + 22, label);
  }
}


// ================================================================
// The stepper diagram
// ================================================================
const VB = { w: 600, h: 590 };
const BUS = { x: 282, y: 40, w: 36, h: 470 };
const LX = 14, RX = 336, W = 250;
const BOX = {
  mar:     { x: LX, y: 40, w: W, h: 62, label: "MAR", bits: 4 },
  ram:     { x: LX, y: 116, w: W, h: 214, label: "RAM" },
  ir:      { x: LX, y: 344, w: W, h: 62, label: "IR", bits: 8 },
  eeprom:  { x: LX, y: 420, w: W, h: 90, label: "EEPROM" },
  pc:      { x: RX, y: 40, w: W, h: 62, label: "PC", bits: 4 },
  a:       { x: RX, y: 116, w: W, h: 62, label: "A", bits: 8 },
  alu:     { x: RX, y: 192, w: W - 74, h: 62, label: "ALU", bits: 8 },
  flags:   { x: RX + W - 64, y: 192, w: 64, h: 62, label: "Flags" },
  b:       { x: RX, y: 268, w: W, h: 62, label: "B", bits: 8 },
  out:     { x: RX, y: 344, w: W, h: 62, label: "OUT", bits: 8 },
  display: { x: RX, y: 420, w: W, h: 90, label: "Display" },
};

// Seven-segment digits: which of a b c d e f g are lit
const SEG = ["abcdef", "bc", "abdeg", "abcdg", "bcfg", "acdfg", "acdefg", "abc", "abcdefg", "abcdfg"];
// segment shapes for a digit 30 wide, 54 tall (slanted afterwards)
const SEG_PATH = {
  a: "M4 1h22l-4 4h-14z", b: "M27 3v22l-4-3v-15z", c: "M27 29v22l-4-4v-15z", d: "M4 53h22l-4-4h-14z",
  e: "M3 29v22l4-4v-15z", f: "M3 3v22l4-3v-15z", g: "M5 27l3-2.5h14l3 2.5l-3 2.5h-14z",
};

function drawDisplay(svg, x, y, w, h, value) {
  const g = el("g", { class: "sap-display" }, svg);
  el("rect", { x, y, width: w, height: h, rx: 6, class: "sap-display-glass" }, g);
  el("rect", { x, y, width: w, height: h, rx: 6, fill: "url(#sap-scan)" }, g);
  const digits = String(value).padStart(3, " ");
  const dw = 34, start = x + (w - dw * 3) / 2 + 4;
  [...digits].forEach((ch, k) => {
    const lit = ch === " " ? "" : SEG[+ch];
    const d = el("g", { transform: `translate(${start + k * dw} ${y + (h - 54) / 2}) skewX(-7)` }, g);
    for (const s of "abcdefg") el("path", { d: SEG_PATH[s], class: lit.includes(s) ? "seg on" : "seg" }, d);
  });
}

function drawStepper(svg, s, rough) {
  svg.replaceChildren();
  const ink = cssVar("--text", "#fff"), muted = cssVar("--muted", "#888"), quiet = cssVar("--line", "#444");
  const p = pen(svg, rough);
  const { writer, readers, touched } = roles(s);
  const busy = (id) => id === writer || readers.includes(id) || touched.includes(id);

  // shared definitions: the display's scanlines and glow
  const defs = el("defs", {}, svg);
  const pat = el("pattern", { id: "sap-scan", width: 4, height: 4, patternUnits: "userSpaceOnUse" }, defs);
  el("rect", { width: 4, height: 1.2, fill: "rgba(255,255,255,0.05)" }, pat);
  const glow = el("filter", { id: "sap-glow", x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs);
  el("feGaussianBlur", { stdDeviation: 2.4, result: "b" }, glow);
  const merge = el("feMerge", {}, glow);
  el("feMergeNode", { in: "b" }, merge);
  el("feMergeNode", { in: "b" }, merge);
  el("feMergeNode", { in: "SourceGraphic" }, merge);

  // the bus: two hand-drawn rails, with a small diamond where each part joins
  const rail = { roughness: 1.4, bowing: 2, stroke: quiet, strokeWidth: 1.1 };
  p.line(BUS.x, BUS.y, BUS.x, BUS.y + BUS.h, rail, 1);
  p.line(BUS.x + BUS.w, BUS.y, BUS.x + BUS.w, BUS.y + BUS.h, rail, 2);
  text(svg, BUS.x + BUS.w / 2, BUS.y - 14, "BUS", "sap-label", "middle");
  for (const id of ["mar", "ram", "ir", "pc", "a", "alu", "b", "out"]) {
    const b = BOX[id], y = b.y + 31, left = b.x < BUS.x;
    const jx = left ? BUS.x : BUS.x + BUS.w;
    el("path", { d: `M${jx} ${y - 3.5}l3.5 3.5l-3.5 3.5l-3.5 -3.5z`, class: busy(id) ? "sap-node on" : "sap-node" }, svg);
  }

  // boxes: quiet hairlines; the ones at work drawn in full ink.
  // Writing: solid. Reading, or changed without the bus: dashed.
  let seed = 20;
  for (const id in BOX) {
    const b = BOX[id];
    const on = busy(id) || (id === "eeprom" && s.sig.length);
    p.rect(b.x, b.y, b.w, b.h, {
      roughness: 1.3, bowing: 1.2,
      stroke: on ? ink : quiet, strokeWidth: id === writer ? 2.2 : on ? 1.6 : 1,
      strokeLineDash: on && id !== writer && id !== "eeprom" ? [6, 5] : undefined,
    }, seed++);
    text(svg, b.x + 12, b.y + 20, b.label.toUpperCase(), on ? "sap-label on" : "sap-label");
  }

  // bits as small hand-drawn circles: filled = 1, open = 0
  const bits = (b, n, width, dx = 0) => {
    const str = n.toString(2).padStart(width, "0");
    for (let k = 0; k < width; k++) {
      const one = str[k] === "1";
      p.circle(b.x + 18 + dx + k * 20, b.y + 43, 11, {
        roughness: 0.7, stroke: one ? ink : quiet, strokeWidth: 1,
        fill: one ? ink : undefined, fillStyle: "solid",
      }, 200 + k);
    }
  };
  const value = (b, v, cls = "sap-value") => text(svg, b.x + b.w - 12, b.y + 22, String(v), cls, "end");
  bits(BOX.mar, s.mar, 4); value(BOX.mar, s.mar);
  bits(BOX.pc, s.pc, 4); value(BOX.pc, s.pc);
  bits(BOX.ir, s.ir, 8); value(BOX.ir, s.t >= 2 ? `${s.instr} ${s.ir & 15}` : "");
  bits(BOX.a, s.a, 8); value(BOX.a, s.a);
  bits(BOX.alu, s.alu, 8); value(BOX.alu, s.alu);
  bits(BOX.b, s.b, 8); value(BOX.b, s.b);
  bits(BOX.out, s.out, 8); value(BOX.out, s.out);
  bits(BOX.flags, (s.cf << 1) | s.zf, 2, 2);
  text(svg, BOX.flags.x + 20, BOX.flags.y + 58, "C", "sap-small", "middle");
  text(svg, BOX.flags.x + 40, BOX.flags.y + 58, "Z", "sap-small", "middle");

  // display: the one thing in color, as on the board
  drawDisplay(svg, BOX.display.x + 20, BOX.display.y + 28, BOX.display.w - 40, 52, s.out);

  // RAM: the program from the paper. → the line being run; ● the slot being read
  const rows = [...PROGRAM.map(([addr, , , txt]) => [addr, txt]), [15, "1"]];
  const rowY = (k) => BOX.ram.y + 46 + k * 18.5;
  rows.forEach(([addr, txt], k) => {
    const y = rowY(k), here = addr === s.at, reading = s.sig.includes("RO") && s.mar === addr;
    if (here) text(svg, BOX.ram.x + 12, y, "→", "sap-code on");
    if (reading) p.circle(BOX.ram.x + 92, y - 5, 8, { roughness: 0.5, stroke: ink, strokeWidth: 1, fill: ink, fillStyle: "solid" }, 300);
    text(svg, BOX.ram.x + 46, y, String(addr), "sap-code dim", "end");
    text(svg, BOX.ram.x + 54, y, txt, here ? "sap-code on" : "sap-code");
  });
  for (const [from, to, note] of NOTES) {
    const i0 = rows.findIndex(([a]) => a === from), i1 = rows.findIndex(([a]) => a === to);
    const y0 = rowY(i0) - 12, y1 = rowY(i1) + 3;
    if (i1 > i0) p.line(BOX.ram.x + 112, y0, BOX.ram.x + 112, y1, { roughness: 1, stroke: quiet, strokeWidth: 1 }, 400 + i0);
    text(svg, BOX.ram.x + 120, (y0 + y1) / 2 + 4, note, "sap-note");
  }

  // EEPROM: the step register as five marks, T0 to T4, and the signals it puts out
  const e = BOX.eeprom;
  for (let k = 0; k < 5; k++) {
    const cx = e.x + 24 + k * 30;
    p.circle(cx, e.y + 42, 10, { roughness: 0.6, stroke: k === s.t ? ink : quiet, strokeWidth: 1,
      fill: k === s.t ? ink : undefined, fillStyle: "solid" }, 500 + k);
    text(svg, cx, e.y + 62, `T${k}`, k === s.t ? "sap-small on" : "sap-small", "middle");
  }
  text(svg, e.x + 12, e.y + 82, s.sig.length ? s.sig.map(SHOWN).join("  ") : "", "sap-code on");

  // the move: out of the writer, along the bus, into each reader
  if (writer) {
    const edge = (id) => (BOX[id].x < BUS.x ? BOX[id].x + BOX[id].w : BOX[id].x);
    const mid = (id) => BOX[id].y + 31;
    const cx = BUS.x + BUS.w / 2;
    const arrow = { roughness: 0.9, bowing: 1, stroke: ink, strokeWidth: 1.8 };
    readers.forEach((r, k) => {
      const ex = edge(r), ry = mid(r), dir = ex > cx ? -1 : 1;
      p.path([[edge(writer), mid(writer)], [cx, mid(writer)], [cx, ry], [ex, ry]], arrow, 600 + k);
      p.line(ex, ry, ex + dir * 9, ry - 6, arrow, 610 + k);
      p.line(ex, ry, ex + dir * 9, ry + 6, arrow, 620 + k);
    });
    const ys = [mid(writer), ...readers.map(mid)];
    const by = (Math.min(...ys) + Math.max(...ys)) / 2;
    el("rect", { x: BUS.x + 3, y: by - 14, width: BUS.w - 6, height: 22, class: "sap-busval-bg" }, svg);
    text(svg, BUS.x + BUS.w / 2, by + 3, String(s.bus), "sap-busval", "middle");
  }
}


// ================================================================
// Keeping the stepper and the video together
// ================================================================
// The video is the clock. A moment in the video -> which OUT the program was
// on (from the timeline) -> which clock step. And back, for the buttons.
const RESET_FRAME = ANCHORS[0][0];

// OUT count at a video frame (fractional); -1 before the reset button is pressed
function outAt(frame) {
  if (frame < RESET_FRAME) return -1;
  let lo = 0, hi = ANCHORS.length - 1;
  if (frame >= ANCHORS[hi][0]) return ANCHORS[hi][1];
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (ANCHORS[m][0] <= frame) lo = m; else hi = m; }
  const [f0, k0] = ANCHORS[lo], [f1, k1] = ANCHORS[hi];
  return k0 + (k1 - k0) * (frame - f0) / (f1 - f0);
}

// Video frame for an OUT count (the inverse of outAt)
function frameAt(k) {
  if (k <= 0) return RESET_FRAME;
  let lo = 0, hi = ANCHORS.length - 1;
  if (k >= ANCHORS[hi][1]) return ANCHORS[hi][0];
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (ANCHORS[m][1] <= k) lo = m; else hi = m; }
  const [f0, k0] = ANCHORS[lo], [f1, k1] = ANCHORS[hi];
  return f0 + (f1 - f0) * (k - k0) / (k1 - k0);
}

// Clock step at a moment of the video. Between two OUTs the steps are
// spread evenly. Before the reset button is pressed: step 0.
function stepAt(time, outs) {
  const k = outAt(time * FPS);
  if (k < 0) return 0;
  const k0 = Math.floor(k), k1 = Math.min(k0 + 1, outs.length - 1);
  return Math.floor(outs[k0] + (outs[k1] - outs[k0]) * (k - k0));
}

// Moment of the video for a clock step
function timeOf(i, outs) {
  if (i <= outs[0]) return RESET_FRAME / FPS + 0.01;
  let k0 = 0;
  while (k0 + 1 < outs.length && outs[k0 + 1] <= i) k0++;
  const k1 = Math.min(k0 + 1, outs.length - 1);
  const k = k0 + (outs[k1] === outs[k0] ? 0 : (i - outs[k0]) / (outs[k1] - outs[k0]));
  return frameAt(k) / FPS;
}


// ================================================================
// Public: attach to the detail view
// ================================================================
// `host` is the container under the video, `overlaySvg` sits over the video,
// `video` is the video they follow.
export function initSap1(host, overlaySvg, video) {
  const { steps, outs } = sim();
  let i = -1, held = null, rough = window.rough || null, raf = 0, lastDraw = 0;

  host.innerHTML = `
    <svg class="sap-diagram" viewBox="0 0 ${VB.w} ${VB.h}" role="img" aria-label="SAP-1"></svg>
    <div class="sap-controls">
      <span class="sap-clk" aria-live="off">clk 0</span>
      <button type="button" data-act="back" aria-label="‹">‹</button>
      <button type="button" data-act="play" aria-label="▶">▶</button>
      <button type="button" data-act="stop" aria-label="■">■</button>
      <button type="button" data-act="next" aria-label="›">›</button>
    </div>
    <div class="sap-scenes" role="group">
      <button type="button" data-scene="up" aria-pressed="false">count up to 255</button>
      <button type="button" data-scene="down" aria-pressed="false">count down to 0</button>
    </div>
    <p class="sap-glossary-head">CONTROL WORD</p>
    <dl class="sap-glossary">
      ${SIGNALS.map(([id, what]) => `<div data-sig="${id}"><dt>${SHOWN(id)}</dt><dd>${what}</dd></div>`).join("")}
    </dl>`;
  const svg = host.querySelector(".sap-diagram");
  const clk = host.querySelector(".sap-clk");
  const playBtn = host.querySelector('[data-act="play"]');
  const sceneBtns = host.querySelectorAll("[data-scene]");
  const gloss = Object.fromEntries([...host.querySelectorAll("[data-sig]")].map((d) => [d.dataset.sig, d]));

  function draw(n, force) {
    if (n === i && !force) return;
    i = n;
    const s = steps[i];
    drawStepper(svg, s, rough);
    paintOverlay(overlaySvg, s, rough);
    clk.textContent = `clk ${i}`;
    for (const id in gloss) gloss[id].classList.toggle("on", s.sig.includes(id));
  }

  // Follow the video, a few times a second at most while it plays fast
  function follow(now) {
    raf = requestAnimationFrame(follow);
    if (held != null) return;                      // a button picked the step; wait for play
    if (!video.paused && now - lastDraw < 70) return;
    const n = Math.min(steps.length - 1, stepAt(video.currentTime, outs));
    if (n !== i) { lastDraw = now; draw(n); }
  }
  raf = requestAnimationFrame(follow);

  // Buttons move the video, and the stepper with it
  function hold(n) {
    n = Math.max(0, Math.min(steps.length - 1, n));
    video.pause();
    held = n;
    draw(n);
    const t = timeOf(n, outs);
    if (Number.isFinite(t)) video.currentTime = Math.min(t, (video.duration || t) - 0.05);
  }
  const showPlaying = () => { playBtn.textContent = video.paused ? "▶" : "❚❚"; };
  const onPlay = () => { held = null; showPlaying(); };
  video.addEventListener("play", onPlay);
  video.addEventListener("pause", showPlaying);
  showPlaying();
  function scene(which) { sceneBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.scene === which))); }

  host.onclick = (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (e.detail > 0) b.blur();                    // keep the spacebar for the music
    const act = b.dataset.act;
    if (act === "next") hold(i + 1);
    if (act === "back") hold(i - 1);
    if (act === "stop") { scene(null); hold(0); }
    if (act === "play") { if (video.paused) video.play().catch(() => {}); else video.pause(); }
    if (b.dataset.scene === "up") { scene("up"); hold(outs[254] + 3); }       // adding 1 to 254, then to 255
    if (b.dataset.scene === "down") { scene("down"); hold(outs[510] + 3); }   // showing 1, then down to 0
  };

  // redraw in the other theme's ink
  const themeWatch = new MutationObserver(() => draw(i, true));
  themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  draw(Math.max(0, stepAt(video.currentTime || 0, outs)), true);
  if (!rough) loadRough().then((r) => { if (r) { rough = r; draw(i, true); } });

  return function destroy() {
    cancelAnimationFrame(raf);
    video.removeEventListener("play", onPlay);
    video.removeEventListener("pause", showPlaying);
    themeWatch.disconnect();
    host.replaceChildren();
    overlaySvg.replaceChildren();
  };
}
