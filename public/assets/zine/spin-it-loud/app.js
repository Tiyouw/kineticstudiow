// Spin It Loud AR: home loop + "Foto bareng DJ" (free placement) + "Hidupkan halaman zine" (MindAR tracking). by tiyoouw
const $ = s => document.querySelector(s), body = document.body, mo = $('.mo'), fit = $('#fit');
const ua = navigator.userAgent || '';
const inApp = /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Line\/|TikTok|musical_ly|BytedanceWebview|Snapchat|WhatsApp|Twitter|Telegram|KAKAOTALK|; wv\)/i.test(ua);
const android = /Android/i.test(ua), ios = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const hasCam = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
const rmq = matchMedia('(prefers-reduced-motion: reduce)');
const WATERMARK = 'Spin It Loud · Kinetic Studiow · tiyoouw.com';
const LANG = document.documentElement.lang === 'en' ? 'en' : 'id';
const BASE = new URL('./', import.meta.url).href; // assets sit next to app.js, wherever the page itself lives
const T = {
  id: {
    copied: 'Link tersalin ✓', copyPrompt: 'Salin link ini:', play: 'Putar animasi', pause: 'Jeda animasi',
    camDenied: 'Izin kamera ditolak. Izinkan kamera untuk situs ini di pengaturan browser, lalu coba lagi.',
    camFail: 'Kamera tidak bisa dibuka di sini. Coba buka halaman ini di Chrome atau Safari. Animasinya tetap bisa ditonton di layar ini.',
    settling: 'Tahan sebentar…<small>Gambar ketemu, menunggu kamera stabil.</small>',
    searching: 'Arahkan ke ilustrasi di halaman zine<small>Masukkan seluruh gambar ke dalam bingkai dan pastikan cukup terang.</small>',
    inApp: 'Browser aplikasi ini sering memblokir kamera. Kalau tidak jalan, buka link-nya di Chrome atau Safari.',
    djFail: 'Animasi DJ gagal dimuat. Cek koneksi, lalu coba lagi.', photoAlt: 'Hasil foto bareng DJ',
    shareText: 'Foto bareng DJ · Spin It Loud · Kinetic Studiow', shareFail: 'Gagal membagikan. Pakai tombol Simpan.',
    noteShare: 'Bagikan langsung ke IG Story atau WhatsApp, atau simpan ke galeri.', noteIos: 'Simpan, lalu buka dari Files/Foto untuk dibagikan.', noteSave: 'Simpan ke galeri, lalu bagikan dari sana.',
    recIosNo: 'Rekam video belum didukung di Safari ini. Pakai foto.', recNo: 'Rekam video tidak didukung di browser ini.', recIos: 'Rekam video: uji coba di iPhone',
    recFail: 'Rekam video gagal dimulai di browser ini. Pakai foto.',
  },
  en: {
    copied: 'Link copied ✓', copyPrompt: 'Copy this link:', play: 'Play animation', pause: 'Pause animation',
    camDenied: 'Camera permission was denied. Allow the camera for this site in your browser settings, then try again.',
    camFail: "The camera can't open here. Try opening this page in Chrome or Safari. You can still watch the animation on this screen.",
    settling: 'Hold still…<small>Found it, waiting for the camera to settle.</small>',
    searching: 'Point at the illustration in the zine<small>Fit the whole picture inside the frame, with enough light.</small>',
    inApp: "This app's browser often blocks the camera. If it doesn't work, open the link in Chrome or Safari.",
    djFail: "The DJ animation didn't load. Check your connection and try again.", photoAlt: 'Your photo with the DJ',
    shareText: 'Photo with the DJ · Spin It Loud · Kinetic Studiow', shareFail: "Couldn't share. Use Save instead.",
    noteShare: 'Share straight to your IG Story or WhatsApp, or save it to your gallery.', noteIos: 'Save it, then share it from Files/Photos.', noteSave: 'Save it to your gallery, then share it from there.',
    recIosNo: "Video recording isn't supported in this Safari yet. Take a photo instead.", recNo: "Video recording isn't supported in this browser.", recIos: 'Video recording: beta on iPhone',
    recFail: "Recording couldn't start in this browser. Take a photo instead.",
  },
}[LANG];


// ---------- home ----------
if (inApp || !hasCam) body.classList.add('iab');
if (android) { const c = $('#chrome'); c.hidden = false; c.href = 'intent://' + location.host + location.pathname + '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' + encodeURIComponent(location.href) + ';end'; }
$('#copy').onclick = async e => { try { await navigator.clipboard.writeText(location.href); e.target.textContent = T.copied; } catch (_) { prompt(T.copyPrompt, location.href); } };
const msg = t => { const m = $('#msg'); m.textContent = t; m.classList.add('show'); clearTimeout(msg.t); msg.t = setTimeout(() => m.classList.remove('show'), 7000); };
const moAnims = () => mo.getAnimations({ subtree: true });
let userPlay = false; // the visitor tapped ▶ although the system asks for reduced motion
const moPaused = p => {
  mo.classList.toggle('paused', p);
  const b = $('#pause'); b.setAttribute('aria-pressed', p); b.textContent = p ? '▶' : '❚❚'; b.setAttribute('aria-label', p ? T.play : T.pause);
};
if (rmq.matches) moPaused(true);
$('#pause').onclick = () => { const p = !mo.classList.contains('paused'); if (!p) { userPlay = true; mo.classList.add('force'); } moPaused(p); };
document.addEventListener('visibilitychange', () => moAnims().forEach(a => document.hidden ? a.pause() : (!mo.classList.contains('paused') && a.play())));
const camError = err => msg(err && err.name === 'NotAllowedError'
  ? T.camDenied : T.camFail);
const wantsMotion = () => !rmq.matches || userPlay;

// ---------- mode 2: tracking ("Hidupkan halaman zine") ----------
let ar = null, wrap = null;
// filter override for testing on a phone: ?cf=0.0001&beta=0.004 (defaults below)
const qs = new URLSearchParams(location.search), Q = { cf: +qs.get('cf') || 0.0001, beta: +qs.get('beta') || 0.004 };
window.__ar = { state: 'idle', found: false, stable: false, events: [] };
const log = e => __ar.events.push([e, Math.round(performance.now())]);
function setGuide(state) { // searching | settling | live
  body.classList.toggle('searching', state === 'searching'); body.classList.toggle('settling', state === 'settling');
  const g = $('#gtext');
  g.hidden = state === 'live';
  g.innerHTML = state === 'settling' ? T.settling : T.searching;
}
async function startTrack() {
  const btn = $('#go-track'); btn.disabled = true;
  try {
    const [{ MindARThree }, { CSS3DObject }] = await Promise.all([import(BASE + 'vendor/mindar-image-three.prod.js'), import('three/addons/renderers/CSS3DRenderer.js')]);
    body.classList.add('ar-on'); __ar.state = 'starting';
    if (!$('#gtext')) { const p = document.createElement('p'); p.id = 'gtext'; p.setAttribute('role', 'status'); p.setAttribute('aria-live', 'polite'); body.appendChild(p); }
    setGuide('searching');
    // One Euro filter: lower minCF = steadier when still; small beta = less jitter, a little more lag when moving
    ar = new MindARThree({ container: $('#ar'), imageTargetSrc: BASE + 'targets.mind', uiLoading: 'no', uiScanning: 'no', uiError: 'no', filterMinCF: Q.cf, filterBeta: Q.beta, missTolerance: 10, warmupTolerance: 4 });
    wrap = document.createElement('div'); wrap.className = 'arwrap';
    for (const [x, y] of [[0, 0], [1, 0], [1, 1], [0, 1]]) { const k = document.createElement('i'); k.className = 'mk'; k.style.left = x * 100 + '%'; k.style.top = y * 100 + '%'; wrap.appendChild(k); }
    wrap.appendChild(mo);
    moAnims().forEach(a => { a.pause(); a.currentTime = 0; });
    const anchor = ar.addCSSAnchor(0); anchor.group.add(new CSS3DObject(wrap));
    // the animation starts only once the pose has been steady for a few frames
    let prev = null, calm = 0;
    anchor.onTargetFound = () => { __ar.found = true; log('found'); calm = 0; prev = null; setGuide('settling'); };
    anchor.onTargetLost = () => { __ar.found = false; __ar.stable = false; log('lost'); wrap.classList.remove('live'); setGuide('searching'); moAnims().forEach(a => { a.pause(); a.currentTime = 0; }); };
    anchor.onTargetUpdate = () => {
      if (!__ar.found || __ar.stable) return;
      const e = anchor.group.matrix.elements, cur = [e[12], e[13], e[14], e[0], e[5]];
      if (prev) { const d = Math.hypot(cur[0] - prev[0], cur[1] - prev[1]) / Math.max(1, Math.abs(cur[2])); calm = d < 0.004 ? calm + 1 : 0; }
      prev = cur;
      if (calm >= 6) {
        __ar.stable = true; log('stable'); wrap.classList.add('live'); setGuide('live');
        if (navigator.vibrate) navigator.vibrate(25);
        if (wantsMotion()) { mo.classList.add('force'); moAnims().forEach(a => { a.currentTime = 0; a.play(); }); }
      }
    };
    await ar.start();
    __ar.state = 'running'; __ar.three = ar;
    $('#ar').setAttribute('aria-hidden', 'false');
    const tick = () => { if (!ar) return; ar.cssRenderer.render(ar.cssScene, ar.camera); requestAnimationFrame(tick); }; tick();
  } catch (err) { console.warn(err); __ar.state = 'error'; stopTrack(); camError(err); }
  finally { btn.disabled = false; }
}
function stopTrack() {
  try { ar && ar.stop(); } catch (_) { }
  if (ar) { const c = $('#ar'); while (c.firstChild) c.removeChild(c.firstChild); }
  ar = null; fit.appendChild(mo); body.classList.remove('ar-on', 'searching', 'settling');
  const g = $('#gtext'); if (g) g.remove();
  __ar.state = 'idle'; __ar.found = false; __ar.stable = false; $('#ar').setAttribute('aria-hidden', 'true');
  if (!mo.classList.contains('paused')) moAnims().forEach(a => a.play());
}
$('#go-track').onclick = () => { if (inApp) msg(T.inApp); startTrack(); };
$('#close').onclick = stopTrack;

// ---------- mode 1: free placement ("Foto bareng DJ") ----------
const st = $('#st'), cam = $('#cam'), dj = $('#dj');
const S = { stream: null, facing: 'environment', mirror: false, opt: 'D', x: 0, y: 0, s: 1, r: 0, bw: 0, bh: 0, rec: null };
window.__st = S;
// stacked-alpha MP4 -> transparent WebGL canvas (left half colour, right half alpha)
const djv = document.createElement('video');
djv.muted = true; djv.loop = true; djv.playsInline = true; djv.setAttribute('playsinline', ''); djv.setAttribute('muted', ''); djv.crossOrigin = 'anonymous'; djv.preload = 'auto';
const gl = dj.getContext('webgl', { premultipliedAlpha: false, alpha: true, preserveDrawingBuffer: true });
(function initGL() {
  const vs = 'attribute vec2 p;varying vec2 t;void main(){t=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0,1);}';
  const fs = 'precision mediump float;uniform sampler2D s;varying vec2 t;void main(){vec3 c=texture2D(s,vec2(t.x*.5,t.y)).rgb;float a=texture2D(s,vec2(.5+t.x*.5,t.y)).r;a=clamp((a-.02)*1.04,0.,1.);gl_FragColor=vec4(c,a);}';
  const sh = (ty, src) => { const o = gl.createShader(ty); gl.shaderSource(o, src); gl.compileShader(o); return o; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
  [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.LINEAR));
})();
let djFrames = 0;
function drawDJ() {
  if (djv.readyState >= 2) { gl.viewport(0, 0, dj.width, dj.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, djv); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); djFrames++; }
}
function djLoop() { if (st.hidden) return; drawDJ(); djv.requestVideoFrameCallback ? djv.requestVideoFrameCallback(djLoop) : requestAnimationFrame(djLoop); }
// the host does not answer byte-range requests (iOS Safari needs 206 for <video src>), so play from a blob: URL
const blobs = {};
const djURL = o => blobs[o] || (blobs[o] = fetch(`${BASE}media/dj-${o}.mp4`).then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); })
  .then(b => URL.createObjectURL(b)).catch(e => { delete blobs[o]; throw e; }));
async function loadDJ(o) {
  S.opt = o; document.querySelectorAll('.seg button').forEach(b => b.setAttribute('aria-pressed', b.dataset.o === o));
  let src; try { src = await djURL(o); } catch (e) { msg(T.djFail); return; }
  if (S.opt !== o) return;
  S.src = `media/dj-${o}.mp4`; djv.src = src;
  djv.addEventListener('loadeddata', () => { djv.currentTime = 0; drawDJ(); if (S.playing) djv.play().catch(() => { }); }, { once: true });
}
const setPlay = p => { S.playing = p; const b = $('#st-play'); b.textContent = p ? '❚❚' : '▶'; b.setAttribute('aria-pressed', !p); b.setAttribute('aria-label', p ? T.pause : T.play); p ? djv.play().catch(() => { }) : djv.pause(); };
$('#st-play').onclick = () => { if (!S.playing) userPlay = true; setPlay(!S.playing); };
document.querySelectorAll('.seg button').forEach(b => b.onclick = () => b.dataset.o !== S.opt && loadDJ(b.dataset.o));

function layout() { // base size of the DJ on screen; S.x/S.y is its centre in stage px
  const W = st.clientWidth, H = st.clientHeight;
  S.bw = Math.min(W * 0.72, H * 0.5 * 720 / 972); S.bh = S.bw * 972 / 720;
  dj.style.width = S.bw + 'px'; dj.style.height = S.bh + 'px';
}
function apply() { dj.style.transform = `translate(${S.x - S.bw / 2}px,${S.y - S.bh / 2}px) rotate(${S.r}rad) scale(${S.s})`; }
function resetPose() { layout(); S.x = st.clientWidth / 2; S.y = st.clientHeight * 0.52; S.s = 1; S.r = 0; apply(); }
addEventListener('resize', () => { if (!st.hidden) { const ow = S.bw; layout(); if (ow) S.s *= ow / S.bw; apply(); } });

// gestures: 1 finger drags, 2 fingers pinch (scale), twist (rotate) and drag together (pointer events)
const pts = new Map();
dj.addEventListener('pointerdown', e => { e.preventDefault(); dj.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); hideHint(); });
st.addEventListener('pointerdown', e => { if (e.target === cam && pts.size === 1) { st.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); } });
const onMove = e => {
  if (!pts.has(e.pointerId)) return;
  const before = [...pts.values()].map(p => ({ ...p }));
  pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const after = [...pts.values()];
  if (after.length === 1) { S.x += after[0].x - before[0].x; S.y += after[0].y - before[0].y; }
  else {
    const [a0, b0] = before, [a1, b1] = after;
    const c0 = { x: (a0.x + b0.x) / 2, y: (a0.y + b0.y) / 2 }, c1 = { x: (a1.x + b1.x) / 2, y: (a1.y + b1.y) / 2 };
    const d0 = Math.hypot(b0.x - a0.x, b0.y - a0.y), d1 = Math.hypot(b1.x - a1.x, b1.y - a1.y);
    const ang0 = Math.atan2(b0.y - a0.y, b0.x - a0.x), ang1 = Math.atan2(b1.y - a1.y, b1.x - a1.x);
    const k = d0 > 0 ? d1 / d0 : 1, ns = Math.min(5, Math.max(0.2, S.s * k)), kk = ns / S.s, dr = ang1 - ang0;
    // scale and rotate about the fingers' midpoint, then follow it
    const vx = S.x - c0.x, vy = S.y - c0.y, cs = Math.cos(dr), sn = Math.sin(dr);
    S.x = c1.x + (vx * cs - vy * sn) * kk; S.y = c1.y + (vx * sn + vy * cs) * kk; S.s = ns; S.r += dr;
  }
  apply();
};
const onUp = e => pts.delete(e.pointerId);
// dj's events bubble to st, so listen once on st
st.addEventListener('pointermove', onMove); st.addEventListener('pointerup', onUp); st.addEventListener('pointercancel', onUp);
st.addEventListener('wheel', e => { e.preventDefault(); if (e.shiftKey) S.r += e.deltaY * 0.003; else S.s = Math.min(5, Math.max(0.2, S.s * Math.exp(-e.deltaY * 0.0015))); apply(); }, { passive: false });
let hintT = 0; const hideHint = () => { $('#st-hint').classList.add('gone'); clearTimeout(hintT); };

async function openCam() {
  if (S.stream) S.stream.getTracks().forEach(t => t.stop());
  S.stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: S.facing }, width: { ideal: 1920 }, height: { ideal: 1920 } } });
  cam.srcObject = S.stream; await cam.play().catch(() => { });
  const set = S.stream.getVideoTracks()[0].getSettings ? S.stream.getVideoTracks()[0].getSettings() : {};
  setMirror(set.facingMode ? set.facingMode === 'user' : S.facing === 'user');
}
const setMirror = m => { S.mirror = m; cam.classList.toggle('mirror', m); $('#mirror').setAttribute('aria-pressed', m); };
$('#mirror').onclick = () => setMirror(!S.mirror);
$('#flip').onclick = async () => { S.facing = S.facing === 'user' ? 'environment' : 'user'; try { await openCam(); } catch (err) { camError(err); } };

async function startSticker() {
  const btn = $('#go-photo'); btn.disabled = true;
  try {
    st.hidden = false; body.classList.add('st-on'); resetPose();
    moAnims().forEach(a => a.pause());
    $('#st-hint').classList.remove('gone'); hintT = setTimeout(hideHint, 5000);
    loadDJ(S.opt); setPlay(wantsMotion()); djLoop();
    await openCam();
    S.state = 'running';
  } catch (err) { console.warn(err); stopSticker(); camError(err); }
  finally { btn.disabled = false; }
}
function stopSticker() {
  if (S.rec) S.rec.stop();
  if (S.stream) S.stream.getTracks().forEach(t => t.stop()); S.stream = null;
  djv.pause(); st.hidden = true; body.classList.remove('st-on'); $('#sheet').hidden = true; S.state = 'idle';
  if (!mo.classList.contains('paused')) moAnims().forEach(a => a.play());
}
$('#go-photo').onclick = () => { if (inApp) msg(T.inApp); startSticker(); };
$('#st-close').onclick = stopSticker;

// what is on screen, at the camera's own resolution: the visible (object-fit: cover) part of the frame
function crop() {
  const vw = cam.videoWidth, vh = cam.videoHeight, W = st.clientWidth, H = st.clientHeight;
  const sc = Math.max(W / vw, H / vh); // screen px per camera px
  return { sc, sw: W / sc, sh: H / sc, sx: (vw - W / sc) / 2, sy: (vh - H / sc) / 2 };
}
function compose(ctx, w, h, c) { // c = crop(); w,h = output size (same aspect as the screen)
  const k = w / c.sw; // output px per camera px
  ctx.save();
  if (S.mirror) { ctx.translate(w, 0); ctx.scale(-1, 1); }
  // the mirrored view shows the frame flipped, so the visible crop is mirrored too (it is centred, so the same rect)
  ctx.drawImage(cam, c.sx, c.sy, c.sw, c.sh, 0, 0, w, h);
  ctx.restore();
  const f = k / c.sc; // output px per screen px
  ctx.save(); ctx.translate(S.x * f, S.y * f); ctx.rotate(S.r); ctx.scale(S.s, S.s);
  ctx.drawImage(dj, -S.bw * f / 2, -S.bh * f / 2, S.bw * f, S.bh * f);
  ctx.restore();
  // watermark, bottom right
  const fs = Math.max(11, Math.round(Math.min(w, h) * 0.026));
  ctx.font = `800 ${fs}px Nunito, ui-rounded, system-ui, -apple-system, "Segoe UI", sans-serif`;
  const tw = ctx.measureText(WATERMARK).width, pad = fs * 0.6, m = fs * 1.1;
  const bx = w - m - tw - pad * 2, by = h - m - fs - pad * 1.4;
  ctx.fillStyle = 'rgba(20,26,56,.55)';
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(bx, by, tw + pad * 2, fs + pad * 1.4, fs); ctx.fill(); } else ctx.fillRect(bx, by, tw + pad * 2, fs + pad * 1.4);
  ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(WATERMARK, bx + pad, by + (fs + pad * 1.4) / 2 + fs * 0.04);
}
const stamp = () => { const d = new Date(), z = n => String(n).padStart(2, '0'); return `${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}-${z(d.getHours())}${z(d.getMinutes())}${z(d.getSeconds())}`; };

async function snap() {
  if (!cam.videoWidth) return null;
  const c = crop(), w = Math.round(c.sw), h = Math.round(c.sh);
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  drawDJ(); compose(cv.getContext('2d'), w, h, c);
  const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.92));
  S.last = { w, h, blob };
  return { blob, w, h, name: `spin-it-loud-${stamp()}.jpg`, type: 'image/jpeg' };
}
let lastURL = null;
function showSheet(res, isVideo) {
  if (lastURL) URL.revokeObjectURL(lastURL);
  lastURL = URL.createObjectURL(res.blob);
  const box = $('#pvbox'); box.innerHTML = '';
  const el = document.createElement(isVideo ? 'video' : 'img'); el.className = 'pv'; el.src = lastURL;
  if (isVideo) { el.muted = true; el.loop = true; el.autoplay = true; el.playsInline = true; el.setAttribute('playsinline', ''); } else el.alt = T.photoAlt;
  box.appendChild(el);
  const file = new File([res.blob], res.name, { type: res.type });
  const canShare = !!(navigator.canShare && navigator.canShare({ files: [file] }));
  $('#share').hidden = !canShare;
  $('#share').onclick = async () => { try { await navigator.share({ files: [file], title: 'Spin It Loud', text: T.shareText, url: location.origin + location.pathname }); } catch (e) { if (e.name !== 'AbortError') msg(T.shareFail); } };
  const sv = $('#save'); sv.href = lastURL; sv.download = res.name; sv.classList.toggle('primary', !canShare);
  $('#sheet-note').textContent = canShare ? T.noteShare : (ios ? T.noteIos : T.noteSave);
  $('#sheet').hidden = false;
}
$('#again').onclick = () => { $('#sheet').hidden = true; };
$('#shutter').onclick = async () => {
  const f = $('#flash'); f.classList.add('on'); requestAnimationFrame(() => requestAnimationFrame(() => f.classList.remove('on')));
  const res = await snap(); if (res) showSheet(res, false);
};

// short clip (MediaRecorder on a composited canvas); hidden where unsupported
const recType = (() => {
  if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) return null;
  for (const t of ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'])
    if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) return t;
  return null;
})();
S.recType = recType;
if (!recType) { $('#rec').hidden = true; const n = $('#rec-note'); n.hidden = false; n.textContent = ios ? T.recIosNo : T.recNo; }
else if (ios) { const n = $('#rec-note'); n.hidden = false; n.textContent = T.recIos; }
$('#rec').onclick = () => {
  if (S.rec) { S.rec.stop(); return; }
  if (!cam.videoWidth) return;
  const c = crop(), k = Math.min(1, 1080 / c.sw), w = Math.round(c.sw * k / 2) * 2, h = Math.round(c.sh * k / 2) * 2;
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const ctx = cv.getContext('2d');
  const stream = cv.captureStream(30), chunks = [];
  let rec; try { rec = new MediaRecorder(stream, { mimeType: recType, videoBitsPerSecond: 6e6 }); } catch (e) { msg(T.recFail); return; }
  S.rec = rec; const btn = $('#rec'); btn.classList.add('on');
  let alive = true; const t0 = performance.now();
  const frame = () => { if (!alive) return; compose(ctx, w, h, crop()); btn.textContent = '■ ' + Math.max(0, 5 - Math.floor((performance.now() - t0) / 1000)) + 's'; requestAnimationFrame(frame); }; frame();
  rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  rec.onstop = () => {
    alive = false; S.rec = null; btn.classList.remove('on'); btn.textContent = '● 5s'; clearTimeout(rec.t);
    const type = recType.split(';')[0], blob = new Blob(chunks, { type });
    S.lastClip = { size: blob.size, type, ms: Math.round(performance.now() - t0) };
    if (blob.size) showSheet({ blob, name: `spin-it-loud-${stamp()}.${type.includes('mp4') ? 'mp4' : 'webm'}`, type }, true);
  };
  rec.start(250); rec.t = setTimeout(() => rec.state !== 'inactive' && rec.stop(), 5000);
};
// test hooks (Playwright): pose + snapshot + pause
S.setPose = (x, y, s, r) => { S.x = x; S.y = y; S.s = s; S.r = r; apply(); };
S.snap = snap; S.djv = djv; S.djFrames = () => djFrames;
