/* Kinetic-typography intro for the first visit.
   Canvas 2D, framework-free. Everything is driven off one seeded PRNG so the
   loop plays identically every time. */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * params
   * ------------------------------------------------------------------ */

  var TICKS = 104;
  var FPS = 30;

  var PAPER = "#000000";
  var INK = "#f4f2ef";

  var BODY_TINT = 0.45;
  var ARRIVAL_STEP = 24;

  var FONT_FRAC = 0.09;
  var BASELINE_FRAC = 0.541;
  var GAP_EM = 0.26;
  var FONT_WEIGHT = 600;

  var ARRIVE_SCALE_FIRST = 2.0;
  var ARRIVE_SCALE_REST = 1.35;
  var SCALE_RETAIN = 0.72;

  var THUMP_EXCESS = 0.09;
  var THUMP_STRETCH = 1.045;
  var THUMP_SQUASH = 0.94;

  var SLIDE_EM = 1.0;

  var BLUR_MOST = [3, 2.2, 1.5, 0.9, 0.4, 0];
  var BLUR_LAST = [9, 8, 6.6, 5.2, 4, 3, 2.2, 1.4, 0.7, 0];

  var RECENTER = [
    1, 0.9, 0.74, 0.55, 0.36, 0.2, 0.07, -0.02, -0.06, -0.085, -0.098,
    -0.103, -0.1, -0.092, -0.08, -0.066, -0.052, -0.039, -0.027, -0.017,
    -0.009, -0.004, 0
  ];

  var GLIDE_RATE = 1;

  var TINT_TICK = 64;
  var TINT_LEN = 8;

  var SHAKE_TICK = 70;
  var SHAKE_END = 86;

  var SHAKE_ROT = 13;
  var SHAKE_DY = 6;
  var SHAKE_DX = 2.5;
  var SHAKE_OMEGA = 1.15;

  var LETTER_DRIFT = [
    [-1.5, 4, -9],
    [-0.5, 1.5, 6],
    [0.5, 4.5, -5],
    [2, 2.5, 11]
  ];

  var INHALE_TICKS = 3;
  var INHALE_LIFT = 4.5;
  var INHALE_SCALE = 0.055;

  var BURST_TICK = 90;
  var REF_BURST = 44;
  var STROKE_OFFSET = REF_BURST - BURST_TICK;

  var SEG_BANDS = 8;
  var SEG_MAX_PER_LETTER = 16;
  var SEG_MIN_RUN_EM = 0.05;

  var MORPH_LEN = 2.8;
  var MORPH_STAGGER = 0.9;

  var DART_SPIKE_MIN = 0.15;
  var DART_BELLY = 0.7;
  var DART_WOBBLE = 0.12;
  var FINALE_SPIKE = 0.8;

  var SEG_EXIT = 2;
  var SEG_GAP_MUL = 1.4;
  var SLOT_PROG_JIT = 0.06;

  var TRAIL_DT = 0.8;
  var TRAIL_ALPHA = 0.12;

  var RING_TICKS = 3;
  var RING_R0 = 14;
  var RING_V = 42;
  var RING_ALPHA = 0.35;
  var RING_WIDTH = 2.2;

  var ZOOM_MAX = 0.35;
  var ZOOM_EXP = 1.8;
  var THROW_PX = 17;
  var THROW_EXP = 2.5;
  var THROW_BALLISTIC = 1.9;
  var THROW_BALLISTIC_AT = BURST_TICK + 7;

  var WORD_FADE_START = BURST_TICK + 5;
  var WORD_FADE_END = BURST_TICK + 9;

  var STREAK_LEN = 90;
  var STREAK_ALPHA = 0.35;
  var STREAK_WIDTH = 1.6;

  var FLECK_COUNT = 14;
  var FLECK_SPD_MIN = 2.5;
  var FLECK_SPD_MAX = 5.5;
  var FLECK_R_MIN = 1.4;
  var FLECK_R_MAX = 3.2;
  var FLECK_DELAY_MAX = 1.5;
  var FLECK_FADE_START = BURST_TICK + 3;
  var FLECK_FADE_LEN = 3;

  var KICK_BASE = [
    [2.2, -1.4],
    [-1.5, 0.9]
  ];
  var KICK_JIT = 1.2;
  var KICK_ZOOM = 1.012;

  var STILL_TICK = BURST_TICK + 3;

  var REF_W = 700;
  var REF_H = 392;
  var ORIGIN_X = 358;
  var ORIGIN_Y = 205;

  var SEED = 0x10cd;

  /* The one sentence. "human" is the last word and the pun, so it arrives out
     of focus and takes the longest to resolve. */
  var SENTENCE = {
    words: ["keeping", "technology", "human"],
    burst: 1,
    theme: {
      inks: ["#ff6b57", "#ffb43f", "#63a8ff", "#a78bfa"],
      body: "#8fa7d0",
      burst: "#ff6b57"
    }
  };

  /* ------------------------------------------------------------------ *
   * strokes
   * ------------------------------------------------------------------ */

  var GROUPS = [
    {
      count: 6,
      gap: 6.5,
      sat: 0.78,
      lit: 0.72,
      keys: [
        { t: 40, x: 424, y: 174, len: 20, wid: 1.8, ang: -9, hue: 294 },
        { t: 42, x: 438, y: 172, len: 27, wid: 2.7, ang: -9, hue: 284 },
        { t: 44, x: 460, y: 166, len: 43, wid: 4.0, ang: -10, hue: 266 },
        { t: 46, x: 510, y: 148, len: 81, wid: 6.5, ang: -12, hue: 246 },
        { t: 47, x: 554, y: 147, len: 128, wid: 8.5, ang: -11, hue: 238 },
        { t: 48, x: 626, y: 124, len: 190, wid: 11, ang: -12, hue: 230 },
        { t: 49, x: 726, y: 100, len: 220, wid: 13, ang: -12, hue: 226 }
      ]
    },
    {
      count: 6,
      gap: 7,
      sat: 0.55,
      lit: 0.7,
      keys: [
        { t: 40, x: 326, y: 219, len: 33, wid: 2.4, ang: -12, hue: 14 },
        { t: 42, x: 318, y: 223, len: 32, wid: 3.0, ang: -12, hue: 18 },
        { t: 44, x: 296, y: 227, len: 57, wid: 5.0, ang: -12, hue: 22 },
        { t: 46, x: 277, y: 235, len: 86, wid: 9.0, ang: -13, hue: 26 },
        { t: 48, x: 236, y: 277, len: 169, wid: 16, ang: -23, hue: 27 },
        { t: 50, x: 186, y: 299, len: 190, wid: 20, ang: -27, hue: 31 },
        { t: 51, x: 140, y: 312, len: 210, wid: 22, ang: -24, hue: 33, fade: 0.4 }
      ]
    },
    {
      count: 2,
      gap: 8,
      sat: 0.42,
      lit: 0.66,
      keys: [
        { t: 40, x: 400, y: 188, len: 27, wid: 1.5, ang: 0, hue: 320 },
        { t: 44, x: 420, y: 218, len: 19, wid: 2.5, ang: -2, hue: 318 },
        { t: 47, x: 415, y: 225, len: 30, wid: 4.8, ang: 1, hue: 313 },
        { t: 49, x: 423, y: 257, len: 80, wid: 9, ang: 7, hue: 313 },
        { t: 51, x: 402, y: 300, len: 78, wid: 16, ang: -6, hue: 318 },
        { t: 52, x: 412, y: 290, len: 60, wid: 19, ang: -6, hue: 308, fade: 0 }
      ]
    },
    {
      count: 7,
      gap: 6.5,
      sat: 0.55,
      lit: 0.68,
      keys: [
        { t: 46, x: 485, y: 181, len: 50, wid: 3.5, ang: -6, hue: 262 },
        { t: 47, x: 472, y: 201, len: 74, wid: 5.0, ang: -3, hue: 273 },
        { t: 48, x: 477, y: 211, len: 68, wid: 6.0, ang: -5, hue: 268 },
        { t: 49, x: 478, y: 231, len: 90, wid: 9.0, ang: -2, hue: 272 },
        { t: 50, x: 536, y: 280, len: 148, wid: 18, ang: 14, hue: 262 },
        { t: 51, x: 626, y: 368, len: 146, wid: 24, ang: 18, hue: 261 }
      ]
    },
    {
      count: 4,
      gap: 9,
      sat: 0.58,
      lit: 0.7,
      keys: [
        { t: 47, x: 180, y: 260, len: 90, wid: 6, ang: -16, hue: 45 },
        { t: 49, x: 133, y: 277, len: 186, wid: 9, ang: -17, hue: 54 },
        { t: 50, x: 88, y: 303, len: 247, wid: 14, ang: -21, hue: 55 },
        { t: 51, x: 40, y: 290, len: 220, wid: 16, ang: -14, hue: 58, fade: 0.4 }
      ]
    },
    {
      count: 1,
      gap: 0,
      sat: 0.62,
      lit: 0.7,
      keys: [
        { t: 51, x: 250, y: 290, len: 200, wid: 26, ang: -17, hue: 22 },
        { t: 52, x: 204, y: 304, len: 294, wid: 37, ang: -17, hue: 23 },
        { t: 53, x: 135, y: 331, len: 339, wid: 58, ang: -18, hue: 29 },
        { t: 53.8, x: -80, y: 400, len: 340, wid: 60, ang: -18, hue: 32 }
      ]
    },
    {
      count: 1,
      gap: 0,
      sat: 0.58,
      lit: 0.7,
      keys: [
        { t: 52, x: 57, y: 214, len: 169, wid: 20, ang: -3, hue: 65 },
        { t: 53, x: 0, y: 180, len: 296, wid: 28, ang: -2, hue: 68 },
        { t: 53.6, x: -200, y: 165, len: 296, wid: 28, ang: -2, hue: 70 }
      ]
    },
    {
      count: 1,
      gap: 0,
      sat: 0.5,
      lit: 0.68,
      keys: [
        { t: 51, x: 150, y: 140, len: 120, wid: 12, ang: 6, hue: 80 },
        { t: 52, x: 117, y: 106, len: 260, wid: 20, ang: 8, hue: 80 },
        { t: 54, x: 95, y: 53, len: 223, wid: 45, ang: 6, hue: 81 },
        { t: 54.7, x: 80, y: -120, len: 200, wid: 50, ang: 6, hue: 82 }
      ]
    },
    {
      count: 1,
      gap: 0,
      sat: 0.45,
      lit: 0.66,
      keys: [
        { t: 52, x: 438, y: 81, len: 43, wid: 16, ang: 4, hue: 200 },
        { t: 53, x: 459, y: 118, len: 28, wid: 18, ang: -6, hue: 219 },
        { t: 54, x: 520, y: 100, len: 30, wid: 18, ang: -6, hue: 224, fade: 0 }
      ]
    },
    {
      count: 1,
      gap: 0,
      sat: 0.85,
      lit: 0.7,
      keys: [
        { t: 53, x: 480, y: 170, len: 180, wid: 40, ang: 2, hue: 228 },
        { t: 54, x: 576, y: 160, len: 277, wid: 58, ang: 1, hue: 224 },
        { t: 54.7, x: 880, y: 150, len: 280, wid: 60, ang: 1, hue: 222 }
      ]
    },
    {
      count: 1,
      gap: 0,
      sat: 0.5,
      lit: 0.67,
      keys: [
        { t: 53, x: 442, y: 248, len: 155, wid: 30, ang: -4, hue: 279 },
        { t: 54, x: 580, y: 430, len: 170, wid: 34, ang: 12, hue: 275 },
        { t: 54.6, x: 700, y: 540, len: 170, wid: 34, ang: 14, hue: 273 }
      ]
    }
  ];

  function groupAt(g, t) {
    var ks = g.keys;
    if (t < ks[0].t || t > ks[ks.length - 1].t) return null;
    var i = 0;
    while (i < ks.length - 1 && ks[i + 1].t <= t) i++;
    var a = ks[i];
    var b = ks[Math.min(i + 1, ks.length - 1)];
    var u = b.t === a.t ? 0 : (t - a.t) / (b.t - a.t);
    var L = function (p, q) {
      return p + (q - p) * u;
    };
    return {
      x: L(a.x, b.x),
      y: L(a.y, b.y),
      len: L(a.len, b.len),
      wid: L(a.wid, b.wid),
      ang: L(a.ang, b.ang),
      hue: L(a.hue, b.hue),
      alpha: L(a.fade == null ? 1 : a.fade, b.fade == null ? 1 : b.fade)
    };
  }

  /* ------------------------------------------------------------------ *
   * small helpers
   * ------------------------------------------------------------------ */

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function clamp01(v) {
    return Math.min(1, Math.max(0, v));
  }

  function lerp(a, b, u) {
    return a + (b - a) * u;
  }

  function rad(d) {
    return (d * Math.PI) / 180;
  }

  function hexRgb(hex) {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16)
    ];
  }

  function hueOf(c) {
    var r = c[0];
    var g = c[1];
    var b = c[2];
    var mx = Math.max(r, g, b);
    var mn = Math.min(r, g, b);
    var d = mx - mn;
    if (d === 0) return 0;
    var h;
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    return (((h * 60) % 360) + 360) % 360;
  }

  function circDist(a, b) {
    var d = Math.abs(
      (((a % 360) + 360) % 360) - (((b % 360) + 360) % 360)
    );
    return Math.min(d, 360 - d);
  }

  function mixArr(a, b, u) {
    return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
  }

  function rgbStr(c) {
    return (
      "rgb(" +
      Math.round(c[0]) +
      "," +
      Math.round(c[1]) +
      "," +
      Math.round(c[2]) +
      ")"
    );
  }

  var INK_RGB = hexRgb(INK);

  var SEG_POOL = 96;

  /* ------------------------------------------------------------------ *
   * engine
   * ------------------------------------------------------------------ */

  function LoudBurst(canvas, fontFamily) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ok = !!this.ctx;
    this.font = fontFamily || "sans-serif";

    this.raf = 0;
    this.t0 = 0;
    this.running = false;
    this.dpr = 1;
    this.lastTick = -1;

    this.sentence = SENTENCE;
    this.words = SENTENCE.words;
    this.burstIdx = SENTENCE.burst;
    this.arrivals = [];
    this.burstRgb = [0, 0, 0];
    this.bodyRgb = [0, 0, 0];
    this.bodyCss = "";
    this.journeys = [];

    this.fontPx = 0;
    this.baseline = 0;
    this.gap = 0;
    this.wordW = [];
    this.slotX = [];
    this.shift = [];
    this.landAge = [];
    this.originX = 0;
    this.originY = 0;
    this.refS = 1;

    this.wordSprites = [];
    this.letterX = [];
    this.letterW = [];
    this.segs = [];
    this.segCount = [];
    this.segsReady = false;

    this.dashJitter = [];
    this.segJitter = [];
    this.flecks = [];
    this.kick = KICK_BASE;

    this.scratch = [];

    this.applySentence();
    if (this.ok) this.resize();
  }

  LoudBurst.prototype.applySentence = function () {
    var self = this;
    var i = 0;

    this.words = this.sentence.words;
    this.burstIdx = this.sentence.burst;
    this.arrivals = this.words.map(function (_, k) {
      return k * ARRIVAL_STEP;
    });

    var th = this.sentence.theme;
    var inkRgbs = th.inks.map(hexRgb);
    var inkHues = inkRgbs.map(hueOf);
    this.burstRgb = hexRgb(th.burst);
    this.bodyRgb = mixArr(INK_RGB, hexRgb(th.body), BODY_TINT);
    this.bodyCss = rgbStr(this.bodyRgb);

    var nearest = function (h, excl) {
      var best = excl === 0 ? 1 : 0;
      for (var k = 0; k < inkHues.length; k++) {
        if (k === excl) continue;
        if (circDist(h, inkHues[k]) < circDist(h, inkHues[best])) best = k;
      }
      return best;
    };

    this.journeys = GROUPS.map(function (g) {
      var h0 = g.keys[0].hue;
      var h1 = g.keys[g.keys.length - 1].hue;
      var a = nearest(h0);
      var b = nearest(h1);
      if (b === a && circDist(h0, h1) > 25) b = nearest(h1, a);
      return [inkRgbs[a], inkRgbs[b]];
    });

    var rnd = mulberry32((SEED ^ Math.imul(i, 0x9e3779b9)) >>> 0);
    this.dashJitter = GROUPS.map(function (g) {
      var out = [];
      for (var k = 0; k < g.count; k++) {
        out.push({
          along: (rnd() - 0.5) * 24,
          lenMul: 0.75 + rnd() * 0.3,
          angJit: (rnd() - 0.5) * 6,
          bend: (rnd() - 0.5) * 0.24
        });
      }
      return out;
    });

    this.segJitter = [];
    for (var s = 0; s < SEG_POOL; s++) {
      this.segJitter.push({
        along: (rnd() - 0.5) * 20,
        lenMul: 0.75 + rnd() * 0.3,
        angJit: (rnd() - 0.5) * 6,
        bend: (rnd() - 0.5) * 0.24,
        delay: rnd(),
        sk: 1.1 + rnd() * 0.8
      });
    }

    this.flecks = [];
    for (var f = 0; f < FLECK_COUNT; f++) {
      this.flecks.push({
        ang: rnd() * Math.PI * 2,
        spd: FLECK_SPD_MIN + rnd() * (FLECK_SPD_MAX - FLECK_SPD_MIN),
        r: FLECK_R_MIN + rnd() * (FLECK_R_MAX - FLECK_R_MIN),
        color: th.inks[Math.floor(rnd() * th.inks.length)],
        delay: rnd() * FLECK_DELAY_MAX
      });
    }

    this.kick = KICK_BASE.map(function (k) {
      return [
        k[0] + (rnd() - 0.5) * KICK_JIT,
        k[1] + (rnd() - 0.5) * KICK_JIT
      ];
    });

    void self;

    if (this.fontPx > 0) this.layoutSentence();
  };

  LoudBurst.prototype.resize = function () {
    var c = this.canvas;
    var r = c.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.max(1, Math.round(r.width * this.dpr));
    c.height = Math.max(1, Math.round(r.height * this.dpr));
    this.buildLayout();
    this.lastTick = -1;
    if (!this.running) this.renderBlank();
  };

  LoudBurst.prototype.renderBlank = function () {
    if (!this.ok) return;
    var ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  };

  LoudBurst.prototype.buildLayout = function () {
    var H = this.canvas.height;
    var W = this.canvas.width;
    var ctx = this.ctx;
    var self = this;

    this.refS = H / REF_H;
    this.baseline = BASELINE_FRAC * H;

    var fontPx = FONT_FRAC * H;
    ctx.font = FONT_WEIGHT + " " + fontPx + "px " + this.font;
    var widths = this.words.map(function (w) {
      return ctx.measureText(w).width;
    });
    var gap = GAP_EM * fontPx;
    var lineW =
      widths.reduce(function (a, b) {
        return a + b;
      }, 0) +
      gap * (this.words.length - 1);

    var maxW = W * 0.78;
    if (lineW > maxW) fontPx *= maxW / lineW;

    this.fontPx = fontPx;
    this.gap = GAP_EM * fontPx;
    void self;
    this.layoutSentence();
  };

  LoudBurst.prototype.arriveScale = function (i) {
    return i === 0 ? ARRIVE_SCALE_FIRST : ARRIVE_SCALE_REST;
  };

  LoudBurst.prototype.layoutSentence = function () {
    var ctx = this.ctx;
    var W = this.canvas.width;

    ctx.font = FONT_WEIGHT + " " + this.fontPx + "px " + this.font;
    this.wordW = this.words.map(function (w) {
      return ctx.measureText(w).width;
    });

    var lineW =
      this.wordW.reduce(function (a, b) {
        return a + b;
      }, 0) +
      this.gap * (this.words.length - 1);

    var x = (W - lineW) / 2;
    var self = this;
    this.slotX = this.wordW.map(function (w) {
      var sx = x;
      x += w + self.gap;
      return sx;
    });

    this.originX = this.slotX[this.burstIdx] + this.wordW[this.burstIdx] / 2;
    this.originY = this.baseline - 0.35 * this.fontPx;

    var word = this.words[this.burstIdx];
    this.letterX = [];
    this.letterW = [];
    var lx = 0;
    for (var c = 0; c < word.length; c++) {
      var w = ctx.measureText(word[c]).width;
      this.letterX.push(lx);
      this.letterW.push(w);
      lx += w;
    }

    this.shift = [];
    var s0 = (W - this.wordW[0]) / 2 - this.slotX[0];
    for (var t = 0; t < TICKS; t++) {
      if (t < this.arrivals[1]) {
        this.shift.push(s0);
        continue;
      }
      var i = Math.round((t - this.arrivals[1]) * GLIDE_RATE);
      this.shift.push(s0 * (i < RECENTER.length ? RECENTER[i] : 0));
    }

    this.landAge = this.words.map(function (_, i) {
      var settle = Math.ceil(
        Math.log(THUMP_EXCESS / (self.arriveScale(i) - 1)) /
          Math.log(SCALE_RETAIN)
      );
      return i === self.words.length - 1
        ? Math.max(settle, BLUR_LAST.length - 1)
        : settle;
    });

    this.wordSprites = this.words.map(function (w) {
      var pad = Math.ceil(self.fontPx * 0.35);
      var wpx = Math.ceil(ctx.measureText(w).width);
      var sp = document.createElement("canvas");
      sp.width = (wpx + pad * 2) * 2;
      sp.height = Math.ceil(self.fontPx * 1.6) * 2;
      var sc = sp.getContext("2d");
      if (!sc) return null;
      sc.scale(2, 2);
      sc.font = FONT_WEIGHT + " " + self.fontPx + "px " + self.font;
      sc.fillStyle = self.bodyCss;
      sc.textBaseline = "alphabetic";
      sc.fillText(w, pad, self.fontPx * 1.1);
      return sp;
    });

    this.segs = [];
    this.segCount = [];
    this.segsReady = false;
  };

  LoudBurst.prototype.shakeAmp = function (t) {
    if (t < SHAKE_TICK) return 0;
    return Math.pow(
      clamp01((t - SHAKE_TICK) / (SHAKE_END - SHAKE_TICK)),
      2
    );
  };

  LoudBurst.prototype.tintProgress = function (t) {
    if (t < TINT_TICK) return 0;
    var u = clamp01((t - TINT_TICK) / TINT_LEN);
    return 1 - (1 - u) * (1 - u);
  };

  LoudBurst.prototype.wordFill = function (t) {
    var p = this.tintProgress(t);
    if (p <= 0) return this.bodyCss;
    var c = mixArr(this.bodyRgb, this.burstRgb, p);
    return rgbStr(c);
  };

  LoudBurst.prototype.journeyAt = function (gi, u) {
    var j = this.journeys[gi];
    return mixArr(j[0], j[1], clamp01(u));
  };

  LoudBurst.prototype.letterJitter = function (i, t) {
    var A = this.shakeAmp(t);
    if (A <= 0) return [0, 0, 0];
    var d = LETTER_DRIFT[i % LETTER_DRIFT.length];
    var ph = i * 2.1;
    var s = this.refS;
    var wob = Math.sin(t * SHAKE_OMEGA + ph);
    var wob2 = Math.sin(t * SHAKE_OMEGA * 0.63 + ph * 1.7);
    return [
      A * (d[0] + wob2 * SHAKE_DX) * s,
      A * (d[1] + wob * SHAKE_DY) * s,
      rad(A * (d[2] + wob * SHAKE_ROT * 0.45))
    ];
  };

  LoudBurst.prototype.scratchAt = function (idx, w, h) {
    var c = this.scratch[idx];
    if (!c) {
      c = document.createElement("canvas");
      this.scratch[idx] = c;
    }
    c.width = w;
    c.height = h;
    return c;
  };

  LoudBurst.prototype.drawDart = function (
    tailX,
    tailY,
    bendX,
    bendY,
    headX,
    headY,
    wMax,
    spike,
    skew,
    wobPhase,
    tailC,
    headC,
    alpha
  ) {
    var ctx = this.ctx;
    var span = Math.hypot(headX - tailX, headY - tailY);
    if (span < 1) return;
    wMax = Math.min(wMax, span * 0.32);

    var N = 10;
    var xs = [];
    var ys = [];
    var ws = [];
    var pxs = [];
    var pys = [];

    for (var i = 0; i <= N; i++) {
      var u = i / N;
      var v = 1 - u;
      xs.push(v * v * tailX + 2 * v * u * bendX + u * u * headX);
      ys.push(v * v * tailY + 2 * v * u * bendY + u * u * headY);

      var tx = 2 * v * (bendX - tailX) + 2 * u * (headX - bendX);
      var ty = 2 * v * (bendY - tailY) + 2 * u * (headY - bendY);
      var n = Math.hypot(tx, ty) || 1;
      pxs.push(-ty / n);
      pys.push(tx / n);

      var prof = Math.pow(Math.sin(Math.PI * Math.pow(u, skew)), DART_BELLY);
      var w = wMax * lerp(1, prof, spike);
      var wob = DART_WOBBLE * Math.min(1, span / (wMax * 5));
      w *= 1 + wob * spike * Math.sin(u * 13 + wobPhase);
      ws.push(Math.max(0, w));
    }

    var grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
    grad.addColorStop(0, rgbStr(tailC));
    grad.addColorStop(1, rgbStr(headC));

    ctx.fillStyle = grad;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(xs[0] + (pxs[0] * ws[0]) / 2, ys[0] + (pys[0] * ws[0]) / 2);
    for (var a = 1; a <= N; a++) {
      ctx.lineTo(xs[a] + (pxs[a] * ws[a]) / 2, ys[a] + (pys[a] * ws[a]) / 2);
    }
    for (var b = N; b >= 0; b--) {
      ctx.lineTo(xs[b] - (pxs[b] * ws[b]) / 2, ys[b] - (pys[b] * ws[b]) / 2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  LoudBurst.prototype.blurDraw = function (sp, dx, dy, dw, dh, sigma) {
    var ctx = this.ctx;
    if (sigma < 0.6) {
      ctx.drawImage(sp, dx, dy, dw, dh);
      return;
    }

    var k = sigma < 2 ? 1 : sigma < 5 ? 2 : 3;
    var src = sp;
    var sw = sp.width;
    var sh = sp.height;
    var si = 0;

    for (var i = 0; i < k; i++) {
      var step = this.scratchAt(
        si++,
        Math.max(1, Math.round(sw / 2)),
        Math.max(1, Math.round(sh / 2))
      );
      var sc = step.getContext("2d");
      if (!sc) break;
      sc.imageSmoothingEnabled = true;
      sc.drawImage(src, 0, 0, sw, sh, 0, 0, step.width, step.height);
      src = step;
      sw = step.width;
      sh = step.height;
    }

    for (var u = 0; u < k - 1; u++) {
      var up = this.scratchAt(si++, sw * 2, sh * 2);
      var uc = up.getContext("2d");
      if (!uc) break;
      uc.imageSmoothingEnabled = true;
      uc.drawImage(src, 0, 0, sw, sh, 0, 0, up.width, up.height);
      src = up;
      sw = up.width;
      sh = up.height;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(src, 0, 0, sw, sh, dx, dy, dw, dh);
  };

  LoudBurst.prototype.rasterBurstWord = function (fill, t, scratchIdx) {
    var pad = Math.ceil(this.fontPx * 0.5);
    var w = Math.ceil(
      this.letterX[this.letterX.length - 1] +
        this.letterW[this.letterW.length - 1]
    );
    var sp = this.scratchAt(
      scratchIdx,
      w + pad * 2,
      Math.ceil(this.fontPx * 1.9)
    );
    var sc = sp.getContext("2d", { willReadFrequently: true });
    var base = this.fontPx * 1.15;
    if (!sc) return { sp: null, pad: pad, base: base };

    sc.font = FONT_WEIGHT + " " + this.fontPx + "px " + this.font;
    sc.textBaseline = "alphabetic";
    var word = this.words[this.burstIdx];

    for (var i = 0; i < word.length; i++) {
      var j = this.letterJitter(i, t);
      var cx = pad + this.letterX[i] + this.letterW[i] / 2;
      var cy = base - this.fontPx * 0.35;
      sc.save();
      sc.translate(cx + j[0], cy + j[1]);
      sc.rotate(j[2]);
      sc.fillStyle = fill(i);
      sc.fillText(word[i], -this.letterW[i] / 2, this.fontPx * 0.35);
      sc.restore();
    }
    return { sp: sp, pad: pad, base: base };
  };

  LoudBurst.prototype.captureSegs = function () {
    var self = this;
    this.segsReady = true;
    this.segs = [];
    this.segCount = GROUPS.map(function () {
      return 0;
    });

    var capT = BURST_TICK - 1;
    var raster = this.rasterBurstWord(function () {
      return "#000";
    }, capT, 5);
    var sp = raster.sp;
    if (!sp) return;

    var sc = sp.getContext("2d", { willReadFrequently: true });
    if (!sc) return;

    var img;
    try {
      img = sc.getImageData(0, 0, sp.width, sp.height);
    } catch (e) {
      return;
    }

    var alphaAt = function (x, y) {
      return img.data[(y * sp.width + x) * 4 + 3];
    };

    var minY = sp.height;
    var maxY = 0;
    for (var y = 0; y < sp.height; y++) {
      for (var x = 0; x < sp.width; x += 2) {
        if (alphaAt(x, y) > 96) {
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          break;
        }
      }
    }
    if (maxY <= minY) return;

    var bandH = Math.max(2, (maxY - minY + 1) / SEG_BANDS);
    var minRun = Math.max(2, this.fontPx * SEG_MIN_RUN_EM);
    var spriteX = this.slotX[this.burstIdx] + this.shift[capT] - raster.pad;
    var spriteTop = this.baseline - raster.base;
    var word = this.words[this.burstIdx];

    var perLetter = word.split("").map(function () {
      return [];
    });

    for (var b = 0; b < SEG_BANDS; b++) {
      var ry = Math.min(sp.height - 1, Math.round(minY + (b + 0.5) * bandH));
      var runStart = -1;
      var gapRun = 0;

      var flush = function (endX) {
        if (runStart < 0) return;
        var len = endX - runStart;
        if (len >= minRun) {
          var rcx = runStart + len / 2;
          var li = 0;
          while (
            li < word.length - 1 &&
            rcx - raster.pad > self.letterX[li] + self.letterW[li]
          )
            li++;
          perLetter[li].push({
            bx: spriteX + rcx,
            by: spriteTop + ry,
            blen: len,
            bwid: bandH * 0.92,
            letter: li,
            gi: 0,
            slot: 0,
            ji: 0
          });
        }
        runStart = -1;
        gapRun = 0;
      };

      for (var px = 0; px < sp.width; px++) {
        if (alphaAt(px, ry) > 96) {
          if (runStart < 0) runStart = px;
          gapRun = 0;
        } else if (runStart >= 0 && ++gapRun > 3) {
          flush(px - gapRun + 1);
        }
      }
      flush(sp.width);
    }

    for (var i = 0; i < perLetter.length; i++) {
      var list = perLetter[i];
      if (list.length > SEG_MAX_PER_LETTER) {
        var step = list.length / SEG_MAX_PER_LETTER;
        var kept = [];
        for (var k = 0; k < SEG_MAX_PER_LETTER; k++) {
          kept.push(list[Math.floor(k * step)]);
        }
        perLetter[i] = kept;
      }
    }

    var segs = [];
    for (var li2 = 0; li2 < perLetter.length; li2++) {
      segs = segs.concat(perLetter[li2]);
    }
    if (!segs.length) return;

    var burstGroups = [];
    GROUPS.forEach(function (g, gi) {
      if (g.count > 1) burstGroups.push({ g: g, gi: gi });
    });

    var dirs = burstGroups.map(function (bg) {
      var kk = bg.g.keys[0];
      var dx = kk.x - ORIGIN_X;
      var dy = kk.y - ORIGIN_Y;
      var n = Math.hypot(dx, dy) || 1;
      return [dx / n, dy / n];
    });

    var cap = Math.ceil(segs.length / burstGroups.length) + 1;
    var counts = burstGroups.map(function () {
      return 0;
    });

    segs.forEach(function (seg) {
      var ox = (seg.bx - self.originX) / self.refS;
      var oy = (seg.by - self.originY) / self.refS;
      var n = Math.hypot(ox, oy) || 1;
      var best = 0;
      var bestScore = -Infinity;
      for (var k2 = 0; k2 < burstGroups.length; k2++) {
        if (counts[k2] >= cap) continue;
        var score = (ox / n) * dirs[k2][0] + (oy / n) * dirs[k2][1];
        if (score > bestScore) {
          bestScore = score;
          best = k2;
        }
      }
      counts[best]++;
      seg.gi = burstGroups[best].gi;
    });

    for (var g2 = 0; g2 < burstGroups.length; g2++) {
      (function (bg) {
        var ang = rad(bg.g.keys[0].ang);
        var pxx = -Math.sin(ang);
        var pyy = Math.cos(ang);
        var members = segs
          .filter(function (sg) {
            return sg.gi === bg.gi;
          })
          .sort(function (a, b2) {
            return a.bx * pxx + a.by * pyy - (b2.bx * pxx + b2.by * pyy);
          });
        members.forEach(function (sg, idx) {
          sg.slot = idx;
        });
        self.segCount[bg.gi] = members.length;
      })(burstGroups[g2]);
    }

    segs.forEach(function (sg, idx) {
      sg.ji = idx % SEG_POOL;
    });

    this.segs = segs;
  };

  LoudBurst.prototype.render = function (t) {
    var ctx = this.ctx;
    var W = this.canvas.width;
    var H = this.canvas.height;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);

    if (t === BURST_TICK || t === BURST_TICK + 1) {
      var kick = this.kick[t - BURST_TICK];
      ctx.translate(kick[0] * this.refS, kick[1] * this.refS);
      ctx.translate(this.originX, this.originY);
      ctx.scale(KICK_ZOOM, KICK_ZOOM);
      ctx.translate(-this.originX, -this.originY);
    }

    ctx.font = FONT_WEIGHT + " " + this.fontPx + "px " + this.font;
    ctx.textBaseline = "alphabetic";

    if (t < BURST_TICK) this.renderLine(t);
    else this.renderBurstWords(t);

    this.renderRing(t);
    this.renderFlecks(t);
    this.renderStrokes(t);
  };

  LoudBurst.prototype.renderLine = function (t) {
    var ctx = this.ctx;
    var s = this.refS;
    var shift = this.shift[t];

    for (var i = 0; i < this.words.length; i++) {
      if (this.arrivals[i] > t) continue;
      var age = t - this.arrivals[i];

      if (i === this.burstIdx && t >= TINT_TICK) {
        var fill = this.wordFill(t);
        var wordCx = this.slotX[i] + shift + this.wordW[i] / 2;
        var wordCy = this.baseline - this.fontPx * 0.35;

        var wI =
          t >= BURST_TICK - INHALE_TICKS
            ? (t - (BURST_TICK - INHALE_TICKS) + 1) / INHALE_TICKS
            : 0;

        ctx.save();
        if (wI > 0) {
          var k = 1 + INHALE_SCALE * wI;
          ctx.translate(wordCx, wordCy - INHALE_LIFT * wI * s);
          ctx.scale(k, k);
          ctx.translate(-wordCx, -wordCy);
        }

        for (var li = 0; li < this.words[i].length; li++) {
          var jit = this.letterJitter(li, t);
          var cx =
            this.slotX[i] + shift + this.letterX[li] + this.letterW[li] / 2;
          var cy = this.baseline - this.fontPx * 0.35;
          ctx.save();
          ctx.translate(cx + jit[0], cy + jit[1]);
          ctx.rotate(jit[2]);
          ctx.fillStyle = fill;
          ctx.fillText(
            this.words[i][li],
            -this.letterW[li] / 2,
            this.fontPx * 0.35
          );
          ctx.restore();
        }
        ctx.restore();
        continue;
      }

      var scale = 1 + (this.arriveScale(i) - 1) * Math.pow(SCALE_RETAIN, age);
      var sqX = 1;
      var sqY = 1;
      if (age === this.landAge[i]) {
        sqX = THUMP_STRETCH;
        sqY = THUMP_SQUASH;
      } else if (age === this.landAge[i] + 1) {
        sqX = 1 + (THUMP_STRETCH - 1) * 0.4;
        sqY = 1 - (1 - THUMP_SQUASH) * 0.4;
      }

      var blurTable = i === this.words.length - 1 ? BLUR_LAST : BLUR_MOST;
      var sigma =
        (blurTable[Math.min(age, blurTable.length - 1)] || 0) * s;
      var sp = this.wordSprites[i];
      if (!sp) continue;

      var dw = (sp.width / 2) * scale * sqX;
      var dh = (sp.height / 2) * scale * sqY;

      var slide =
        i === 0 ? 0 : SLIDE_EM * this.fontPx * Math.pow(SCALE_RETAIN, age);
      var cx2 = this.slotX[i] + shift + slide + this.wordW[i] / 2;
      var cy2 = this.baseline - this.fontPx * 0.35;

      this.blurDraw(sp, cx2 - dw / 2, cy2 - dh * (0.75 / 1.6), dw, dh, sigma);
    }
  };

  LoudBurst.prototype.renderBurstWords = function (t) {
    var ctx = this.ctx;
    var s = this.refS;
    var u = clamp01((t - (BURST_TICK - 1)) / 8);
    var zoom = 1 + ZOOM_MAX * Math.pow(u, ZOOM_EXP);
    var throwPx = THROW_PX * s * Math.pow(u, THROW_EXP);
    if (t > THROW_BALLISTIC_AT) {
      throwPx *= Math.pow(THROW_BALLISTIC, t - THROW_BALLISTIC_AT);
    }
    var alpha =
      1 - clamp01((t - WORD_FADE_START) / (WORD_FADE_END - WORD_FADE_START));

    var shift = this.shift[BURST_TICK - 1];

    for (var i = 0; i < this.words.length; i++) {
      if (i === this.burstIdx) continue;
      var side = i < this.burstIdx ? -1 : 1;
      var cx = this.slotX[i] + shift + this.wordW[i] / 2;
      var cy = this.baseline - this.fontPx * 0.35;

      var zx = this.originX + (cx - this.originX) * zoom + side * throwPx;
      var zy = this.originY + (cy - this.originY) * zoom;

      if (alpha > 0) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(zx, zy);
        ctx.scale(zoom, zoom);
        ctx.fillStyle = this.bodyCss;
        ctx.fillText(this.words[i], -this.wordW[i] / 2, this.fontPx * 0.35);
        ctx.restore();
      }

      var sw = clamp01((t - (WORD_FADE_START - 1)) / 1.5);
      if (sw > 0 && t < WORD_FADE_END + 1) {
        var sl = (0.4 + 0.6 * sw) * STREAK_LEN * s;
        for (var k = 0; k < 2; k++) {
          var sy =
            zy - this.fontPx * 0.2 + (((i * 37 + k * 53) % 5) - 2) * 3 * s;
          var ix = zx - side * sl;
          this.drawDart(
            ix,
            sy,
            (ix + zx) / 2,
            sy,
            zx,
            sy,
            STREAK_WIDTH * 2 * s,
            1,
            1.4,
            i * 2.3 + k,
            this.bodyRgb,
            this.bodyRgb,
            STREAK_ALPHA * sw * (k === 0 ? 1 : 0.6)
          );
        }
      }
    }

    if (!this.segsReady) this.captureSegs();

    if (!this.segs.length) {
      if (alpha > 0) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.wordFill(BURST_TICK - 1);
        ctx.fillText(
          this.words[this.burstIdx],
          this.slotX[this.burstIdx] + shift,
          this.baseline
        );
        ctx.restore();
      }
      return;
    }

    this.renderSegs(t);
  };

  LoudBurst.prototype.segStateAt = function (seg, tR) {
    var g = GROUPS[seg.gi];
    var keys = g.keys;
    var tEnd = keys[keys.length - 1].t;

    var over = tR - tEnd;
    if (over > SEG_EXIT) return null;

    var st = groupAt(g, Math.min(Math.max(tR, keys[0].t), tEnd));
    if (!st) return null;

    var exitMul = 1;
    if (over > 0) {
      var ka = keys[keys.length - 2];
      var kb = keys[keys.length - 1];
      var dt = kb.t - ka.t || 1;
      st.x += ((kb.x - ka.x) / dt) * over;
      st.y += ((kb.y - ka.y) / dt) * over;
      exitMul = Math.pow(1 - over / SEG_EXIT, 2);
    }

    var j = this.segJitter[seg.ji];
    var t0 = Math.max(REF_BURST, keys[0].t);
    var uRaw = clamp01((tR - t0 - j.delay * MORPH_STAGGER) / MORPH_LEN);
    var e = uRaw * uRaw * (3 - 2 * uRaw);

    var s = this.refS;
    var cxOff = this.originX - ORIGIN_X * s;
    var cyOff = this.originY - ORIGIN_Y * s;

    var n = this.segCount[seg.gi] || 1;
    var pxp = -Math.sin(rad(st.ang));
    var pyp = Math.cos(rad(st.ang));
    var spreadMul = Math.sqrt(Math.max(1, st.len / keys[0].len));
    var gapPx = g.gap * (g.count / n) * SEG_GAP_MUL;
    var off = (seg.slot - (n - 1) / 2) * gapPx * spreadMul;

    var tx =
      (st.x + pxp * off + Math.cos(rad(st.ang)) * j.along) * s + cxOff;
    var ty =
      (st.y + pyp * off + Math.sin(rad(st.ang)) * j.along) * s + cyOff;
    var tlen = st.len * j.lenMul * s;
    var twid = st.wid * s * (0.5 + 0.2 * j.lenMul);

    var x = lerp(seg.bx, tx, e);
    var y = lerp(seg.by, ty, e);
    var len = Math.max(1, lerp(seg.blen, tlen, e));
    var wid = Math.max(1, lerp(seg.bwid, twid, e));
    var ang = lerp(0, st.ang + j.angJit, e);
    var alpha = st.alpha * exitMul;
    if (alpha <= 0) return null;

    var dirx = Math.cos(rad(ang));
    var diry = Math.sin(rad(ang));
    var half = len / 2;
    var bendAmt = j.bend * half * e;

    var life = tEnd - keys[0].t || 1;
    var prog =
      clamp01((tR - keys[0].t) / life) + ((seg.slot % 3) - 1) * SLOT_PROG_JIT;

    var headC = mixArr(this.burstRgb, this.journeyAt(seg.gi, prog), e);
    var tailC = mixArr(this.burstRgb, this.journeyAt(seg.gi, prog - 0.18), e);

    return {
      tailX: x - dirx * half,
      tailY: y - diry * half,
      bendX: x + -diry * bendAmt,
      bendY: y + dirx * bendAmt,
      headX: x + dirx * half,
      headY: y + diry * half,
      w: wid,
      tailC: tailC,
      headC: headC,
      alpha: alpha,
      e: e
    };
  };

  LoudBurst.prototype.renderSegs = function (t) {
    var tR = t + STROKE_OFFSET;
    for (var i = 0; i < this.segs.length; i++) {
      var seg = this.segs[i];
      var main = this.segStateAt(seg, tR);
      if (!main) continue;

      var j = this.segJitter[seg.ji];
      var phase = seg.ji * 1.7;

      if (main.e > 0.3) {
        var tr = this.segStateAt(seg, tR - TRAIL_DT);
        if (tr) {
          this.drawDart(
            tr.tailX,
            tr.tailY,
            tr.bendX,
            tr.bendY,
            tr.headX,
            tr.headY,
            tr.w * 0.8,
            DART_SPIKE_MIN + (1 - DART_SPIKE_MIN) * tr.e,
            j.sk,
            phase,
            tr.tailC,
            tr.headC,
            tr.alpha * TRAIL_ALPHA
          );
        }
      }

      this.drawDart(
        main.tailX,
        main.tailY,
        main.bendX,
        main.bendY,
        main.headX,
        main.headY,
        main.w,
        DART_SPIKE_MIN + (1 - DART_SPIKE_MIN) * main.e,
        j.sk,
        phase,
        main.tailC,
        main.headC,
        main.alpha
      );
    }
  };

  LoudBurst.prototype.renderRing = function (t) {
    var age = t - BURST_TICK;
    if (age < 0 || age >= RING_TICKS) return;
    var ctx = this.ctx;
    var s = this.refS;
    var r = (RING_R0 + RING_V * age) * s;
    ctx.save();
    ctx.globalAlpha = RING_ALPHA * (1 - age / RING_TICKS);
    ctx.strokeStyle = rgbStr(this.burstRgb);
    ctx.lineWidth = Math.max(1.2, RING_WIDTH * s);
    ctx.beginPath();
    ctx.ellipse(this.originX, this.originY, r, r * 0.8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  LoudBurst.prototype.renderFlecks = function (t) {
    if (t < BURST_TICK) return;
    var ctx = this.ctx;
    var s = this.refS;
    var fade = 1 - clamp01((t - FLECK_FADE_START) / FLECK_FADE_LEN);
    if (fade <= 0) return;

    ctx.save();
    ctx.globalAlpha = fade;
    for (var i = 0; i < this.flecks.length; i++) {
      var fl = this.flecks[i];
      var a = t - BURST_TICK + 1 - fl.delay;
      if (a <= 0) continue;
      var d = fl.spd * (a + 0.25 * a * a) * s;
      var x = this.originX + Math.cos(fl.ang) * d;
      var y = this.originY + Math.sin(fl.ang) * d * 0.8;
      ctx.fillStyle = fl.color;
      ctx.beginPath();
      ctx.arc(x, y, fl.r * s * (0.5 + 0.5 * fade), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  LoudBurst.prototype.renderStrokes = function (t) {
    var tR = t + STROKE_OFFSET;
    var s = this.refS;
    var cxOff = this.originX - ORIGIN_X * s;
    var cyOff = this.originY - ORIGIN_Y * s;

    for (var gi = 0; gi < GROUPS.length; gi++) {
      var g = GROUPS[gi];
      if (g.count > 1) continue;
      var st = groupAt(g, tR);
      if (!st || st.alpha <= 0) continue;

      var dir = rad(st.ang);
      var ux = Math.cos(dir);
      var uy = Math.sin(dir);
      var px = -uy;
      var py = ux;
      var j = this.dashJitter[gi][0];
      var cx = (st.x + ux * j.along) * s + cxOff;
      var cy = (st.y + uy * j.along) * s + cyOff;
      var half = (st.len * j.lenMul * s) / 2;

      var life = g.keys[g.keys.length - 1].t - g.keys[0].t || 1;
      var prog = clamp01((tR - g.keys[0].t) / life);

      this.drawDart(
        cx - ux * half,
        cy - uy * half,
        cx + px * j.bend * half,
        cy + py * j.bend * half,
        cx + ux * half,
        cy + uy * half,
        st.wid * s,
        FINALE_SPIKE,
        1.4 + j.bend,
        gi * 2.9,
        this.journeyAt(gi, prog - 0.25),
        this.journeyAt(gi, prog),
        st.alpha
      );
    }
  };

  LoudBurst.prototype.start = function () {
    if (this.running || !this.ok) return;
    var self = this;
    this.running = true;
    this.t0 = performance.now();
    this.lastTick = -1;

    var tick = function (now) {
      if (!self.running) return;
      var t = Math.floor(((now - self.t0) / 1000) * FPS) % TICKS;
      if (t !== self.lastTick) {
        self.lastTick = t;
        self.render(t);
      }
      self.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  };

  LoudBurst.prototype.stop = function () {
    this.running = false;
    cancelAnimationFrame(this.raf);
  };

  LoudBurst.prototype.renderStill = function () {
    if (!this.ok) return;
    this.render(STILL_TICK);
  };

  LoudBurst.prototype.destroy = function () {
    this.stop();
    this.ctx = null;
    this.wordSprites = [];
    this.segs = [];
    this.scratch = [];
  };

  /* ------------------------------------------------------------------ *
   * intro controller
   * ------------------------------------------------------------------ */

  var KEY = "dd-intro-seen-v2";
  var LOOP_MS = (TICKS / FPS) * 1000;
  var HOLD_MS = Math.round(((TICKS - 1) / FPS) * 1000);
  var EXIT_MS = 500;

  function hasSeen() {
    try {
      if (/[?&]intro=1\b/.test(window.location.search)) return false;
      return localStorage.getItem(KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function markSeen() {
    try {
      localStorage.setItem(KEY, "1");
    } catch (e) {
      /* private mode: the intro simply replays next time */
    }
  }

  function fontStack() {
    var fam = "";
    try {
      fam = getComputedStyle(document.body).fontFamily;
    } catch (e) {
      fam = "";
    }
    return fam ? fam : "sans-serif";
  }

  function boot() {
    var root = document.documentElement;
    if (!root.classList.contains("intro-on")) return;
    if (hasSeen()) {
      root.classList.remove("intro-on");
      return;
    }

    window.__introStarted = true;

    var overlay = document.createElement("div");
    overlay.className = "dd-intro";
    overlay.setAttribute("role", "img");
    overlay.setAttribute(
      "aria-label",
      "The sentence keeping technology human types itself onto a dark page, word by word. The word human warms into colour, trembles, and bursts into colourful drawn strokes that sweep the page clean."
    );

    var stage = document.createElement("div");
    stage.className = "dd-intro-stage";

    var canvas = document.createElement("canvas");
    canvas.className = "dd-intro-canvas";
    stage.appendChild(canvas);

    var skip = document.createElement("button");
    skip.type = "button";
    skip.className = "dd-intro-skip";
    skip.textContent = "Skip";

    overlay.appendChild(stage);
    overlay.appendChild(skip);
    document.body.appendChild(overlay);

    var reduced = false;
    try {
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      reduced = false;
    }

    var engine = null;
    try {
      engine = new LoudBurst(canvas, fontStack());
    } catch (e) {
      engine = null;
    }

    var done = false;
    var timer = 0;
    var cleanupTimer = 0;

    function finish() {
      if (done) return;
      done = true;
      window.clearTimeout(timer);

      try {
        if (engine) {
          engine.stop();
          engine.renderBlank();
        }
      } catch (e) {
        /* already gone */
      }

      root.classList.add("intro-reveal");
      root.classList.remove("intro-on");
      overlay.classList.add("dd-intro--out");
      markSeen();

      cleanupTimer = window.setTimeout(function () {
        try {
          if (engine) engine.destroy();
        } catch (e) {
          /* already gone */
        }
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, EXIT_MS);
    }

    function startLoop() {
      if (!engine || !engine.ok || done) return;
      if (reduced) engine.renderStill();
      else engine.start();
      timer = window.setTimeout(finish, reduced ? 1500 : HOLD_MS);
    }

    skip.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      finish();
    });

    overlay.addEventListener("click", finish);
    window.addEventListener("keydown", finish);
    window.addEventListener("wheel", finish, { passive: true });
    window.addEventListener("touchstart", finish, { passive: true });

    var resizeTimer = 0;
    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        if (engine && !done) engine.resize();
      }, 120);
    }
    window.addEventListener("resize", onResize);

    function onVisibility() {
      if (!engine || done) return;
      if (document.hidden) engine.stop();
      else if (!reduced) engine.start();
    }
    document.addEventListener("visibilitychange", onVisibility);

    window.addEventListener("pagehide", function () {
      window.clearTimeout(cleanupTimer);
    });

    if (!engine || !engine.ok) {
      finish();
      return;
    }

    /* One frame so the canvas has its laid-out size, then start immediately.
       If the webfont lands later we re-measure in place rather than holding a
       blank screen. */
    requestAnimationFrame(function () {
      if (done) return;
      engine.resize();
      startLoop();
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(
          function () {
            if (!done && engine) engine.resize();
          },
          function () {}
        );
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
