/*!
 * tiyoouw-mark.js — v1.0.0
 * The Tiyoouw logo (A / Open, "parallax fold") as one self-contained web component.
 * No dependencies. Works in any site: plain HTML, React, Vue, Svelte, Astro, Next.js, WordPress.
 *
 * ============================================================================
 *  FOR AI AGENTS / DEVELOPERS: HOW TO USE
 * ============================================================================
 *
 * 1) Load the file once (host it with the site, e.g. /assets/tiyoouw-mark.js):
 *
 *      <script src="/assets/tiyoouw-mark.js" defer></script>
 *
 * 2) Drop the tag wherever the logo goes. Size it with CSS width; color with CSS color.
 *
 *      <tiyoouw-mark></tiyoouw-mark>                                  static logo
 *      <tiyoouw-mark motion="intro" wordmark></tiyoouw-mark>          full brand animation (eyes -> logo)
 *      <tiyoouw-mark hover="eyes" wordmark></tiyoouw-mark>            website variation: hover wakes the eyes
 *      <tiyoouw-mark motion="snap" hover="replay"></tiyoouw-mark>     nav logo: snaps in, replays on hover
 *      <tiyoouw-mark motion="slide" trigger="view"></tiyoouw-mark>    plays when scrolled into view
 *
 *      tiyoouw-mark { width: 120px; color: #111214; }
 *
 * ATTRIBUTES
 *   motion    Entry animation. One of:
 *               "none"   (default) static logo
 *               "intro"  FULL ANIMATION, 3.45s. Two eyes pop open, glance left/right, blink,
 *                        crouch, then spring together into the logo. The signature piece:
 *                        splash screen, hero, showreel, video export.
 *               "hinge"  1.3s. Planes swing open from the fold like a book cover. Calm, premium.
 *               "slide"  1.3s. Left plane drops from above, right rises from below, T halves lock.
 *               "punch"  1.4s. Solid folded block; crossbar cuts in, stem drops through the base.
 *               "snap"   1.4s. Flat logo snaps into its 15° fold; the tab pops up.
 *   trigger   When the entry motion plays: "load" (default), "view" (first time 40% visible),
 *             "hover" (every hover), "manual" (only via element.play()).
 *   hover     Hover behaviour once settled: "none" (default), "replay" (replay the motion),
 *             "eyes" (split a little, turn back into eyes that follow the cursor and blink;
 *             on leave, spring back into the logo). On touch: tap to wake, tap elsewhere to sleep.
 *   wordmark  Boolean. WITH TYPE vs NO TYPE: add it to show "Tiyoouw" under the mark, leave it off
 *             for the symbol only. Every motion works both ways.
 *             The typeface is PROVISIONAL (final brand typography is not decided yet): Jost 500,
 *             loaded from Google Fonts automatically unless --tiyoouw-word-font is set.
 *             When in doubt, use the symbol only (no wordmark) next to the site's own text.
 *   delay     Milliseconds before a "load" motion starts. Default 0.
 *   label     Accessible name. Default "Tiyoouw".
 *
 * CSS
 *   width                      Required for sizing (default 160px). Height follows.
 *   color                      Logo color (it uses currentColor). Default: inherits.
 *   --tiyoouw-word-gap         Space between mark and wordmark. Default 0.06em.
 *   --tiyoouw-word-font        Wordmark font-family. Set this once the final typeface exists
 *                              (the font must be loaded by the page). Default "Jost", sans-serif.
 *   --tiyoouw-word-weight      Default 500.
 *   --tiyoouw-word-tracking    Letter-spacing. Default .04em.
 *   --tiyoouw-word-scale       Size multiplier relative to the mark width. Default 1.
 *
 *      tiyoouw-mark { --tiyoouw-word-font: "Your Final Font", sans-serif; --tiyoouw-word-weight: 600; }
 *
 * JAVASCRIPT
 *   el.play()      Play the entry motion from the start.
 *   el.wake()      Turn into eyes (as if hovered, hover="eyes" behaviour).
 *   el.sleep()     Spring back into the logo.
 *   el.addEventListener('tiyoouw-done', ...)   fires when an entry motion finishes.
 *   TiyoouwMark.svg({ color: '#111214', size: 240 })  -> static SVG string of the logo.
 *   TiyoouwMark.pathData                              -> the logo's single path "d" (viewBox 0 0 240 240,
 *                                                        fill-rule evenodd). Mark bounds: x 40–200, y 32.6–207.4.
 *   TiyoouwMark.motions                               -> ["none","intro","hinge","slide","punch","snap"]
 *
 * FRAMEWORKS
 *   React: render <tiyoouw-mark motion="intro" wordmark=""></tiyoouw-mark> after loading the script
 *          (e.g. import '/assets/tiyoouw-mark.js' in a client component, or a <Script> tag in Next.js).
 *   Node:  require('./tiyoouw-mark.js').svg() works for build-time SVG export.
 *
 * BRAND RULES (keep these when using the logo)
 *   - Monochrome. Use the site's ink color or white on dark. Do not add gradients, outlines or shadows.
 *   - Do not redraw, stretch, rotate or re-slant the mark. The 15° fold is the identity.
 *   - Minimum size: 16px for the mark alone, 96px wide with the wordmark.
 *   - Clear space around the mark: at least the height of the tab (about 1/8 of the mark width).
 *   - prefers-reduced-motion is respected automatically (the logo appears settled, no motion).
 *
 * GEOMETRY (240-unit grid)
 *   Two planes meet at x=120. Left plane rises toward the fold (-15°), right plane falls away (+15°).
 *   Tab height = half-width × tan 15°. Crossbar 96×30, stem 36 wide. The whole T sits on the right
 *   plane's slant, even where it crosses into the left plane: two layers, one letter.
 * ============================================================================
 */
(function (root) {
  'use strict';

  /* ---------------- geometry ---------------- */
  var K = Math.tan(Math.PI / 12);  // 15°
  var F = 120, W = 80, H = 132, YT = 54;
  var CB_TOP = 40, CB_BOT = 70, CB_HALF = 48, STEM_HALF = 18, STEM = H;

  function rp(x, off) { return [x, YT + off + K * (x - F)]; }

  // Two pieces (left / right plane), each an outline plus one 6-point hole (half of the T).
  // k = slant; k = 0 gives the same mark unfolded flat.
  function pieces(k) {
    if (k === undefined) k = K;
    function r(x, off) { return [x, YT + off + k * (x - F)]; }
    function l(x, off) { return [x, YT - W * k + off - k * (x - F)]; }
    var a = F - STEM_HALF, b = F + STEM_HALF, c0 = F - CB_HALF, c1 = F + CB_HALF;
    var chev = r(a, H);
    return {
      L: {
        o: [l(F - W, 0), l(F, 0), r(F, H), chev, [F - W, chev[1] + k * (a - (F - W))]],
        h: [r(c0, CB_TOP), r(F, CB_TOP), r(F, STEM), r(a, STEM), r(a, CB_BOT), r(c0, CB_BOT)]
      },
      R: {
        o: [r(F, 0), r(F + W, 0), r(F + W, H), r(F, H)],
        h: [r(F, CB_TOP), r(c1, CB_TOP), r(c1, CB_BOT), r(b, CB_BOT), r(b, STEM), r(F, STEM)]
      }
    };
  }
  var FINAL = pieces(), FLAT = pieces(0);

  function n(x) { return Math.round(x * 100) / 100; }
  function poly(pts) { return 'M' + pts.map(function (p) { return n(p[0]) + ' ' + n(p[1]); }).join('L') + 'Z'; }
  function piecePath(P) { return poly(P.o) + poly(P.h); }

  // The settled logo as one seamless path (no seam at the fold).
  var PATH = (function () {
    var a = F - STEM_HALF, b = F + STEM_HALF, c0 = F - CB_HALF, c1 = F + CB_HALF;
    return poly([FINAL.L.o[0], FINAL.L.o[1], FINAL.R.o[0], FINAL.R.o[1], FINAL.R.o[2],
      rp(b, H), rp(b, CB_BOT), rp(c1, CB_BOT), rp(c1, CB_TOP), rp(c0, CB_TOP), rp(c0, CB_BOT),
      rp(a, CB_BOT), rp(a, H), FINAL.L.o[4]]);
  })();

  /* ---------------- eyes ---------------- */
  // The eyes are the logo's own two planes pulled apart (same 80×132 size), leaning 8° inward-down
  // with high pupils: eager, not droopy. Point order matches the T halves so they morph 1:1.
  var EYE_W = 80, EYE_TILT = Math.tan(8 * Math.PI / 180), EYE_Y0 = 54 - EYE_TILT * 40;
  function eyePt(side, lu, lv, st) {
    var x0 = side ? 140 : 20;
    var top = EYE_Y0 + EYE_TILT * EYE_W * (side ? 1 - lu : lu);
    var v = 0.5 + (lv - 0.5) * (1 - 0.96 * st.blink);
    var x = x0 + lu * EYE_W + 4 * st.look + (side ? 1 : -1) * st.spread;
    return [x, top + v * H + st.drop];
  }
  function eyes(st) {
    var s = 0.2 * st.look, p0 = 0.32 + s, p1 = 0.68 + s, pm = 0.5 + s, q0 = 0.2, q1 = 0.62, qm = 0.41;
    function E(side, u, v) { return eyePt(side, u, v, st); }
    return {
      L: {
        o: [E(0, 0, 0), E(0, 1, 0), E(0, 1, 1), E(0, 0.775, 1), E(0, 0, 1)],
        h: [E(0, p0, q0), E(0, p1, q0), E(0, p1, q1), E(0, pm, q1), E(0, p0, q1), E(0, p0, qm)]
      },
      R: {
        o: [E(1, 0, 0), E(1, 1, 0), E(1, 1, 1), E(1, 0, 1)],
        h: [E(1, p0, q0), E(1, p1, q0), E(1, p1, qm), E(1, p1, q1), E(1, pm, q1), E(1, p0, q1)]
      }
    };
  }

  /* ---------------- easing & helpers ---------------- */
  function lerp(a, b, k) { return a + (b - a) * k; }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function seg(t, a, b) { return clamp01((t - a) / (b - a)); }
  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
  function backOut(x) { var c = 1.4; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }
  // kx / ky separate: horizontal never overshoots (planes must not cross the fold), vertical may spring.
  function lerpPts(A, B, kx, ky) { return A.map(function (p, i) { return [lerp(p[0], B[i][0], kx), lerp(p[1], B[i][1], ky)]; }); }
  function lerpPiece(A, B, kx, ky) { return { o: lerpPts(A.o, B.o, kx, ky), h: lerpPts(A.h, B.h, kx, ky) }; }
  function lerpFrame(A, B, kx, ky) { return { L: lerpPiece(A.L, B.L, kx, ky), R: lerpPiece(A.R, B.R, kx, ky) }; }
  function mapPiece(P, fn) { return { o: P.o.map(fn), h: P.h.map(fn) }; }
  function shift(P, dx, dy) { return mapPiece(P, function (p) { return [p[0] + dx, p[1] + dy]; }); }
  function scaleX(P, s) { return mapPiece(P, function (p) { return [F + (p[0] - F) * s, p[1]]; }); }
  function withHoles(hL, hR) { return { L: { o: FINAL.L.o, h: hL }, R: { o: FINAL.R.o, h: hR } }; }

  var HOLE = (function () {
    var a = F - STEM_HALF, b = F + STEM_HALF, c0 = F - CB_HALF, c1 = F + CB_HALF, T = CB_TOP, C = CB_BOT;
    return {
      none: { L: [rp(c0, T), rp(F, T), rp(F, T), rp(a, T), rp(a, T), rp(c0, T)], R: [rp(F, T), rp(c1, T), rp(c1, T), rp(b, T), rp(b, T), rp(F, T)] },
      bar: { L: [rp(c0, T), rp(F, T), rp(F, C), rp(a, C), rp(a, C), rp(c0, C)], R: [rp(F, T), rp(c1, T), rp(c1, C), rp(b, C), rp(b, C), rp(F, C)] }
    };
  })();
  var DOT = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];

  /* ---------------- motions ----------------
     Each returns { L, R, alpha, word } for time t (seconds). */
  function dart(t, a) { return easeOut(seg(t, a, a + 0.14)); }
  function lookAt(t) {
    if (t < 1.0) return -dart(t, 0.5);
    if (t < 1.5) return -1 + 2 * dart(t, 1.0);
    return 1 - dart(t, 1.5);
  }

  var MOTIONS = {
    intro: { dur: 3.45, at: function (t) {
      var pop = 1 - backOut(seg(t, 0.05, 0.38));
      var blink = t > 1.72 && t < 1.9 ? Math.sin(Math.PI * seg(t, 1.72, 1.9)) : 0;
      var crouch = easeOut(seg(t, 2.02, 2.28)) * (1 - seg(t, 2.28, 2.36));
      var e = eyes({ look: lookAt(t), blink: Math.max(pop, blink) + 0.1 * crouch, drop: 6.6 * crouch, spread: 6 * crouch });
      // Right plane lands first, left a beat later: the parallax step.
      var sR = seg(t, 2.3, 2.66), sL = seg(t, 2.38, 2.76);
      return {
        L: lerpPiece(e.L, FINAL.L, easeOut(sL), backOut(sL)), R: lerpPiece(e.R, FINAL.R, easeOut(sR), backOut(sR)),
        alpha: easeOut(seg(t, 0, 0.15)), word: easeOut(seg(t, 2.75, 3.35))
      };
    } },
    hinge: { dur: 1.3, at: function (t) {
      var kR = seg(t, 0.1, 0.62), kL = seg(t, 0.24, 0.78);
      return { L: scaleX(FINAL.L, backOut(kL)), R: scaleX(FINAL.R, backOut(kR)), alpha: seg(t, 0, 0.08) };
    } },
    slide: { dur: 1.3, at: function (t) {
      var kR = seg(t, 0.05, 0.6), kL = seg(t, 0.15, 0.72);
      return { L: shift(FINAL.L, 0, -64 * (1 - backOut(kL))), R: shift(FINAL.R, 0, 64 * (1 - backOut(kR))), alpha: easeOut(seg(t, 0.05, 0.4)) };
    } },
    punch: { dur: 1.4, at: function (t) {
      var k1 = seg(t, 0.25, 0.6), k2 = seg(t, 0.62, 1.0), f;
      if (k1 <= 0) f = withHoles(DOT, DOT);
      else {
        var bar = withHoles(lerpPts(HOLE.none.L, HOLE.bar.L, 1, backOut(k1)), lerpPts(HOLE.none.R, HOLE.bar.R, 1, backOut(k1)));
        f = k2 > 0 ? lerpFrame(bar, FINAL, 1, easeOut(k2)) : bar;
      }
      f.alpha = easeOut(seg(t, 0, 0.15));
      return f;
    } },
    snap: { dur: 1.4, at: function (t) {
      var kR = seg(t, 0.35, 0.8), kL = seg(t, 0.43, 0.9);
      return { L: lerpPiece(FLAT.L, FINAL.L, 1, backOut(kL)), R: lerpPiece(FLAT.R, FINAL.R, 1, backOut(kR)), alpha: easeOut(seg(t, 0, 0.15)) };
    } }
  };

  function svg(opts) {
    opts = opts || {};
    var size = opts.size || 240, color = opts.color || '#111214';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="' + size + '" height="' + size + '">' +
      '<path fill="' + color + '" fill-rule="evenodd" d="' + PATH + '"/></svg>';
  }

  var api = {
    version: '1.0.0', pathData: PATH, svg: svg,
    motions: ['none', 'intro', 'hinge', 'slide', 'punch', 'snap'],
    // internals, for build tools and previews
    _geometry: { pieces: pieces, eyes: eyes, MOTIONS: MOTIONS, piecePath: piecePath }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window === 'undefined') return;
  root.TiyoouwMark = api;
  if (!window.customElements || window.customElements.get('tiyoouw-mark')) return;

  /* ---------------- web component ---------------- */
  var FONT_URL = 'https://fonts.googleapis.com/css2?family=Jost:wght@500&display=swap';
  function ensureFont() {
    if (document.querySelector('link[data-tiyoouw-font]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = FONT_URL; l.setAttribute('data-tiyoouw-font', '');
    document.head.appendChild(l);
  }
  var reduceQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reduced() { return !!(reduceQ && reduceQ.matches); }

  var CSS =
    ':host{display:inline-block;width:160px;color:inherit;line-height:1;vertical-align:middle;container-type:inline-size}' +
    ':host([hidden]){display:none}' +
    '.w{display:flex;flex-direction:column;align-items:center;gap:var(--tiyoouw-word-gap,.06em)}' +
    'svg{display:block;width:100%;height:auto;overflow:visible}' +
    '.word{font-family:var(--tiyoouw-word-font,"Jost","Futura","Century Gothic","Avenir Next",system-ui,sans-serif);' +
    'font-weight:var(--tiyoouw-word-weight,500);letter-spacing:var(--tiyoouw-word-tracking,.04em);' +
    'font-size:28px;font-size:calc(18cqw * var(--tiyoouw-word-scale,1));white-space:nowrap;will-change:opacity,transform}' +
    '.word[hidden]{display:none}';

  var TiyoouwMarkElement = class extends HTMLElement {
    static get observedAttributes() { return ['motion', 'wordmark', 'label']; }
  };

  var P = TiyoouwMarkElement.prototype;

  P.connectedCallback = function () {
    var self = this;
    if (!this._init) {
      this._init = true;
      var sh = this.attachShadow({ mode: 'open' });
      sh.innerHTML = '<style>' + CSS + '</style><div class="w" part="root">' +
        '<svg viewBox="16 16 208 208" role="img" part="mark"><title></title><g fill="currentColor" fill-rule="evenodd"><path/><path/></g></svg>' +
        '<div class="word" part="wordmark" aria-hidden="true">Tiyoouw</div></div>';
      this._g = sh.querySelector('g'); this._pl = sh.querySelectorAll('path')[0]; this._pr = sh.querySelectorAll('path')[1];
      this._word = sh.querySelector('.word'); this._title = sh.querySelector('title');
      this._tick = function (now) { self._raf = 0; if (self._step(now)) self._raf = requestAnimationFrame(self._tick); };
      this._mode = 'idle'; this._tx = 0; this._ty = 0; this._px = 0; this._py = 0; this._look = 0; this._hover = false;
      this._onEnter = function (e) { if (e.pointerType === 'mouse') self._enter(); };
      this._onLeave = function (e) { if (e.pointerType === 'mouse') self._leave(); };
      this._onMove = function (e) {
        var r = self.getBoundingClientRect();
        self._tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        self._ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      };
      this._onDown = function (e) { if (e.pointerType !== 'mouse') self._enter(); };
      this._onDocDown = function (e) { if (e.pointerType !== 'mouse' && !self.contains(e.target) && e.target !== self) self._leave(); };
    }
    this._sync();
    this.addEventListener('pointerenter', this._onEnter);
    this.addEventListener('pointerleave', this._onLeave);
    this.addEventListener('pointermove', this._onMove);
    this.addEventListener('pointerdown', this._onDown);
    document.addEventListener('pointerdown', this._onDocDown);

    var trig = this._trigger(), m = this._motion();
    if (m !== 'none' && !reduced()) {
      if (trig === 'load') {
        var d = parseFloat(this.getAttribute('delay')) || 0;
        this._startEntry(performance.now() + d);
      } else if (trig === 'view' && 'IntersectionObserver' in window) {
        this._mode = 'pending'; this._renderFrame(MOTIONS[m].at(0), 0);
        this._io = new IntersectionObserver(function (es) {
          if (es.some(function (x) { return x.isIntersecting; })) { self._io.disconnect(); self._io = null; self.play(); }
        }, { threshold: 0.4 });
        this._io.observe(this);
      } else this._renderIdle();
    } else this._renderIdle();
  };

  P.disconnectedCallback = function () {
    if (this._raf) cancelAnimationFrame(this._raf), this._raf = 0;
    if (this._io) this._io.disconnect(), this._io = null;
    this.removeEventListener('pointerenter', this._onEnter);
    this.removeEventListener('pointerleave', this._onLeave);
    this.removeEventListener('pointermove', this._onMove);
    this.removeEventListener('pointerdown', this._onDown);
    document.removeEventListener('pointerdown', this._onDocDown);
  };

  P.attributeChangedCallback = function () { if (this._init) this._sync(); };

  P._sync = function () {
    var label = this.getAttribute('label') || 'Tiyoouw';
    this._title.textContent = label;
    var wm = this.hasAttribute('wordmark');
    this._word.hidden = !wm;
    if (wm && !getComputedStyle(this).getPropertyValue('--tiyoouw-word-font').trim()) ensureFont();
  };
  P._motion = function () { var m = this.getAttribute('motion') || 'none'; return MOTIONS[m] ? m : 'none'; };
  P._trigger = function () { return this.getAttribute('trigger') || 'load'; };
  P._hoverMode = function () {
    var h = this.getAttribute('hover');
    if (h) return h;
    return this._trigger() === 'hover' ? 'replay' : 'none';
  };

  P.play = function () { if (this._motion() === 'none' || reduced()) { this._renderIdle(); return; } this._startEntry(performance.now()); };
  P.wake = function () { this._hover = true; if (this._mode === 'idle') this._set('split'); else if (this._mode === 'to-logo') this._set('to-eyes'); this._kick(); };
  P.sleep = function () { this._hover = false; this._tx = this._ty = 0; if (this._mode === 'split' || this._mode === 'to-eyes' || this._mode === 'eyes') { this._set('to-logo'); this._kick(); } };

  P._startEntry = function (t0) { this._mode = 'entry'; this._t0 = t0; this._kick(); };
  P._set = function (m) { this._mode = m; this._t0 = performance.now(); this._from = this._cur || FINAL; };
  P._kick = function () { if (!this._raf) this._raf = requestAnimationFrame(this._tick); };

  P._enter = function () {
    var h = this._hoverMode();
    if (h === 'eyes') { if (this._mode === 'entry') { this._hover = true; return; } this.wake(); }
    else if (h === 'replay' && this._mode === 'idle') this.play();
  };
  P._leave = function () { if (this._hoverMode() === 'eyes') this.sleep(); this._hover = false; };

  P._eyesNow = function (now) {
    this._look += (Math.max(-1, Math.min(1, this._tx * 1.4)) - this._look) * 0.14;
    if (!this._nextBlink || now > this._nextBlink) { this._blinkAt = now; this._nextBlink = now + 1800 + Math.random() * 1600; }
    var bt = (now - this._blinkAt) / 170;
    var blink = bt >= 0 && bt < 1 ? Math.sin(Math.PI * bt) : 0;
    return eyes({ look: this._look, blink: blink, drop: this._ty * 3, spread: 0 });
  };

  // One animation step. Returns true while something is still moving.
  P._step = function (now) {
    var t = (now - this._t0) / 1000, f, k;
    this._px += (this._tx - this._px) * 0.12; this._py += (this._ty - this._py) * 0.12;
    switch (this._mode) {
      case 'entry':
        var M = MOTIONS[this._motion()];
        if (!M || t >= M.dur) {
          this._renderIdle();
          this.dispatchEvent(new CustomEvent('tiyoouw-done', { bubbles: true }));
          if (this._hover && this._hoverMode() === 'eyes') { this._set('split'); return true; }
          return false;
        }
        var fr = M.at(Math.max(0, t));
        var word = fr.word != null ? fr.word : easeOut(seg(t, M.dur - 0.6, M.dur));
        this._renderFrame(fr, t < 0 ? 0 : fr.alpha, word);
        return true;
      case 'split':
        var s = easeOut(seg(t, 0, 0.22)), gap = 6 * s;
        f = { L: shift(FINAL.L, -gap - 3 * this._px, -2 * this._py - 3 * s), R: shift(FINAL.R, gap + 3 * this._px, 2 * this._py + 3 * s) };
        this._cur = f;
        if (t > 0.5) { this._nextBlink = now + 1100; this._set('to-eyes'); }
        this._renderFrame(f, 1, 1);
        return true;
      case 'to-eyes':
        k = seg(t, 0, 0.42);
        f = lerpFrame(this._from, this._eyesNow(now), easeOut(k), backOut(k));
        this._cur = f;
        if (k >= 1) this._mode = 'eyes';
        this._renderFrame(f, 1, 1);
        return true;
      case 'eyes':
        f = this._eyesNow(now); this._cur = f;
        this._renderFrame(f, 1, 1);
        return true;
      case 'to-logo':
        // Crouch for a beat, then spring back: right plane first, left a beat later.
        var c = seg(t, 0, 0.12), from = this._from;
        var cr = { L: shift(from.L, -3 * c, 4 * c), R: shift(from.R, 3 * c, 4 * c) };
        var kR = seg(t, 0.12, 0.5), kL = seg(t, 0.18, 0.58);
        f = { L: lerpPiece(cr.L, FINAL.L, easeOut(kL), backOut(kL)), R: lerpPiece(cr.R, FINAL.R, easeOut(kR), backOut(kR)) };
        this._cur = f;
        if (kL >= 1) { this._renderIdle(); return false; }
        this._renderFrame(f, 1, 1);
        return true;
      default:
        return false;
    }
  };

  P._renderFrame = function (f, alpha, word) {
    this._pl.setAttribute('d', piecePath(f.L));
    this._pr.setAttribute('d', piecePath(f.R));
    this._g.style.opacity = alpha;
    var w = word == null ? 0 : word;
    this._word.style.opacity = w;
    this._word.style.transform = 'translateY(' + ((1 - w) * 0.25).toFixed(3) + 'em)';
  };
  P._renderIdle = function () {
    this._mode = 'idle'; this._cur = FINAL;
    this._pl.setAttribute('d', PATH); this._pr.setAttribute('d', '');
    this._g.style.opacity = 1; this._word.style.opacity = 1; this._word.style.transform = 'none';
  };

  window.customElements.define('tiyoouw-mark', TiyoouwMarkElement);
})(typeof window !== 'undefined' ? window : this);
