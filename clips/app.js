'use strict';
/* Chispa — clips verticales 100% en el navegador (sin servidor). */
(() => {
const $ = s => document.querySelector(s);
const video = $('#video');
const cvs = $('#preview'), pctx = cvs.getContext('2d');
const PW = cvs.width, PH = cvs.height;
const FONT = '"Bricolage Grotesque","Arial Black",Impact,sans-serif';
const COL = { ink: '#0F1613', bone: '#EDE6D3', verm: '#E8572A', ocre: '#E3A83B' };

const S = { clips: [], cur: null, dur: 0, url: null, blob: null, name: '', uid: 0,
            playing: false, exporting: false, cancel: false, busy: false,
            ac: null, gain: null, dest: null };

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = t => { t = Math.max(0, t || 0); const m = Math.floor(t / 60); return m + ':' + (t % 60).toFixed(1).padStart(4, '0'); };
const wait = ms => new Promise(r => setTimeout(r, ms));
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3200); }
function step(n) { for (let i = 1; i <= 4; i++) { const e = $('#st' + i); e.classList.toggle('on', i === n); e.classList.toggle('done', i < n); } }

/* ---------- 1. CARGA ---------- */
const drop = $('#drop'), fileIn = $('#file');
$('#btnPick').onclick = () => fileIn.click();
drop.onclick = e => { if (e.target === drop || e.target.tagName === 'P') fileIn.click(); };
drop.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileIn.click(); } };
fileIn.onchange = () => { if (fileIn.files[0]) loadBlob(fileIn.files[0], fileIn.files[0].name); fileIn.value = ''; };
['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) loadBlob(f, f.name); });
$('#btnNew').onclick = () => {
  pause(); $('#work').hidden = true; $('#load').hidden = false; step(1); $('#loadMsg').textContent = '';
};

$('#btnUrl').onclick = async () => {
  const u = $('#urlInput').value.trim(), msg = $('#loadMsg');
  if (!u) { msg.textContent = 'Pega primero un enlace.'; return; }
  if (/(^|\/\/)(www\.|m\.)?(youtube\.com|youtu\.be)/i.test(u)) {
    msg.textContent = 'Los enlaces de YouTube no se pueden descargar desde el navegador. Descarga tu propio video (o uno con permiso del autor) y súbelo con "Elegir video".';
    return;
  }
  msg.textContent = 'Descargando…';
  try {
    const r = await fetch(u); if (!r.ok) throw new Error('HTTP ' + r.status);
    const b = await r.blob();
    if (!/^video\//.test(b.type) && !/\.(mp4|webm|mov|m4v)(\?|$)/i.test(u)) throw new Error('no es un video');
    loadBlob(b, decodeURIComponent(u.split('/').pop().split('?')[0]) || 'video');
  } catch (err) {
    msg.textContent = 'No se pudo cargar ese enlace (' + err.message + '). Debe ser un archivo directo con CORS habilitado; si no, descárgalo y súbelo.';
  }
};

async function loadBlob(blob, name) {
  const msg = $('#loadMsg'); msg.textContent = 'Leyendo video…';
  if (S.url) URL.revokeObjectURL(S.url);
  S.blob = blob; S.name = name; S.url = URL.createObjectURL(blob);
  try {
    await new Promise((ok, ko) => {
      video.onloadedmetadata = ok;
      video.onerror = () => ko(new Error('formato no compatible'));
      video.src = S.url; video.load();
    });
    if (!isFinite(video.duration) || !video.videoWidth) throw new Error('video sin duración o sin imagen');
  } catch (err) {
    msg.textContent = 'No se pudo abrir el video: ' + err.message + '. Prueba con MP4 (H.264) o WebM.';
    return;
  }
  S.dur = video.duration; S.clips = []; S.cur = null;
  msg.textContent = '';
  $('#load').hidden = true; $('#work').hidden = false;
  $('#srcInfo').textContent = `${name} · ${fmt(S.dur)} · ${video.videoWidth}×${video.videoHeight}`;
  renderMoments(); setEditorEnabled(false); step(2);
  video.currentTime = Math.min(0.1, S.dur / 2);
}

/* ---------- 2. DETECCIÓN DE MOMENTOS ---------- */
const WIN = 0.5; // segundos por ventana

async function audioEnergy(blob, dur) {
  if (blob.size > 600e6 || dur > 5400) return null;
  try {
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const ctx = new OAC(1, 16000, 16000);
    const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
    const n = Math.ceil(buf.duration / WIN), out = new Float32Array(n), sr = buf.sampleRate, per = Math.floor(sr * WIN);
    const chs = []; for (let c = 0; c < buf.numberOfChannels; c++) chs.push(buf.getChannelData(c));
    for (let i = 0; i < n; i++) {
      let sum = 0, cnt = 0; const a = i * per, b = Math.min(a + per, buf.length);
      for (let k = a; k < b; k += 4) { let v = 0; for (const ch of chs) v += ch[k]; v /= chs.length; sum += v * v; cnt++; }
      out[i] = cnt ? Math.sqrt(sum / cnt) : 0;
    }
    return out;
  } catch (e) { return null; }
}

async function seekTo(t) {
  return new Promise(res => {
    const done = () => { video.removeEventListener('seeked', done); clearTimeout(to); res(); };
    const to = setTimeout(done, 3500);
    video.addEventListener('seeked', done); video.currentTime = t;
  });
}

async function motionSeries(dur, onProg) {
  const w = 48, h = 27, c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d', { willReadFrequently: true });
  const stepS = Math.max(1, dur / 240), n = Math.ceil(dur / stepS), vals = new Float32Array(n);
  let prev = null;
  for (let i = 0; i < n; i++) {
    await seekTo(Math.min(dur - 0.05, i * stepS));
    x.drawImage(video, 0, 0, w, h);
    const d = x.getImageData(0, 0, w, h).data, g = new Float32Array(w * h);
    for (let p = 0; p < g.length; p++) g[p] = (d[p * 4] * 0.3 + d[p * 4 + 1] * 0.59 + d[p * 4 + 2] * 0.11);
    if (prev) { let s = 0; for (let p = 0; p < g.length; p++) s += Math.abs(g[p] - prev[p]); vals[i] = s / g.length / 255; }
    prev = g; if (i % 6 === 0) onProg(i / n);
  }
  // remuestrear a ventanas de WIN
  const nw = Math.ceil(dur / WIN), out = new Float32Array(nw);
  for (let i = 0; i < nw; i++) out[i] = vals[Math.min(n - 1, Math.floor(i * WIN / stepS))];
  return out;
}

const pct = (arr, p) => { const a = Array.from(arr).sort((x, y) => x - y); return a[Math.floor((a.length - 1) * p)] || 0; };
function normalize(arr) { const m = pct(arr, 0.95) || 1; return Float32Array.from(arr, v => Math.min(1, v / m)); }

function pickMoments(e, m, dur, L, N) {
  const nw = Math.max(e ? e.length : 0, m ? m.length : 0), W = Math.min(nw, Math.round(L / WIN));
  const get = (a, i) => (a && i < a.length ? a[i] : 0);
  const pre = a => { const s = new Float64Array(nw + 1), q = new Float64Array(nw + 1); for (let i = 0; i < nw; i++) { const v = get(a, i); s[i + 1] = s[i] + v; q[i + 1] = q[i] + v * v; } return [s, q]; };
  const [es, eq] = pre(e), [ms] = pre(m);
  const hasA = !!e, hasM = !!m;
  const cands = [];
  for (let i = 0; i + W <= nw; i += 2) {
    const me = (es[i + W] - es[i]) / W, sd = Math.sqrt(Math.max(0, (eq[i + W] - eq[i]) / W - me * me));
    const mm = (ms[i + W] - ms[i]) / W;
    let hook = 0; const hw = Math.min(6, W); for (let k = 0; k < hw; k++) hook += get(e, i + k); hook /= hw;
    let quiet = 0; for (let k = 0; k < W; k++) if (get(e, i + k) < 0.12) quiet++; quiet /= W;
    const s = hasA ? (0.35 * me + 0.25 * Math.min(1, sd * 3) + (hasM ? 0.2 * mm : 0) + 0.2 * hook - 0.5 * quiet) : mm;
    cands.push({ i, s, me, sd, mm, hook, quiet });
  }
  cands.sort((a, b) => b.s - a.s);
  const picked = [];
  for (const c of cands) { if (picked.length >= N) break; if (picked.every(p => Math.abs(p.i - c.i) >= W)) picked.push(c); }
  if (!picked.length) return [];
  const smax = picked[0].s, smin = picked[picked.length - 1].s;
  // cortar en pausas: mínimo de energía cerca del borde
  const snap = (idx, r) => { if (!e) return idx; let best = idx, bv = Infinity; for (let k = Math.max(0, idx - r); k <= Math.min(e.length - 1, idx + r); k++) { if (e[k] < bv) { bv = e[k]; best = k; } } return best; };
  return picked.map(p => {
    const a = snap(p.i, 6), b = snap(p.i + W, 6);
    let start = a * WIN, end = Math.min(dur, Math.max(b * WIN, start + L * 0.6));
    if (end - start > L * 1.4) end = start + L * 1.4;
    const score = picked.length === 1 ? 85 : Math.round(45 + 53 * (p.s - smin) / ((smax - smin) || 1));
    const tags = []; if (p.hook > 0.55) tags.push('arranque fuerte'); if (p.me > 0.5) tags.push('alta energía'); if (p.sd * 3 > 0.55) tags.push('mucha dinámica'); if (hasM && p.mm > 0.5) tags.push('mucho movimiento');
    return { start, end, score, tags: tags.slice(0, 3) };
  }).sort((a, b) => a.start - b.start);
}

$('#btnAnalyze').onclick = async () => {
  if (S.busy || S.exporting) return;
  S.busy = true; pause();
  const btn = $('#btnAnalyze'), prog = $('#prog'), bar = $('#progBar'), txt = $('#progTxt');
  btn.disabled = true; prog.hidden = false; bar.style.width = '0%';
  const L = +$('#selDur').value, N = +$('#selCount').value;
  try {
    txt.textContent = 'Analizando audio…'; bar.style.width = '5%';
    const e = await audioEnergy(S.blob, S.dur);
    const en = e ? normalize(e) : null;
    bar.style.width = '15%';
    txt.textContent = en ? 'Analizando movimiento…' : 'Audio no disponible: usando solo movimiento…';
    const mo = await motionSeries(S.dur, p => { bar.style.width = (15 + p * 75) + '%'; });
    const mn = normalize(mo);
    let found;
    if (S.dur <= L * 1.2) found = [{ start: 0, end: S.dur, score: 80, tags: ['video corto: se usa completo'] }];
    else found = pickMoments(en, mn, S.dur, L, N);
    txt.textContent = 'Generando miniaturas…'; bar.style.width = '92%';
    S.clips = [];
    for (const f of found) { const c = newClip(f.start, f.end, f.score, f.tags); c.thumb = await thumb(c.start + Math.min(1, (c.end - c.start) / 2)); S.clips.push(c); }
    renderMoments();
    if (S.clips.length) selectClip(S.clips[0].id);
    bar.style.width = '100%';
    txt.textContent = S.clips.length ? `${S.clips.length} momentos encontrados.` : 'No se encontraron momentos. Crea un clip manual.';
    step(3);
  } catch (err) { txt.textContent = 'Error al analizar: ' + err.message; }
  S.busy = false; btn.disabled = false; setTimeout(() => { prog.hidden = true; }, 1200);
};

async function thumb(t) {
  await seekTo(Math.min(S.dur - 0.05, t));
  const c = document.createElement('canvas'); c.width = 108; c.height = 192; const x = c.getContext('2d');
  drawCover(x, 108, 192, { cropX: .5, cropY: .5, zoom: 1, mode: 'fill' });
  return c.toDataURL('image/jpeg', 0.7);
}

/* ---------- Clips ---------- */
function newClip(start, end, score, tags) {
  return { id: ++S.uid, start, end, score: score || 0, tags: tags || [], thumb: '', mode: 'fill', cropX: .5, cropY: .5, zoom: 1,
           hook: '', hookOn: true, bar: true, captions: [], capStyle: 'viral', capPos: 'low', capSize: 56 };
}
$('#btnManual').onclick = () => {
  const L = +$('#selDur').value, t = clamp(video.currentTime || 0, 0, Math.max(0, S.dur - 1));
  const c = newClip(t, Math.min(S.dur, t + L), 0, ['manual']);
  S.clips.push(c); thumb(c.start + 0.5).then(d => { c.thumb = d; renderMoments(); selectClip(c.id); }); step(3);
};

function renderMoments() {
  const box = $('#moments'); box.innerHTML = '';
  if (!S.clips.length) { box.innerHTML = '<p class="muted small-t">Aún no hay clips. Busca momentos o crea uno manual desde el punto actual.</p>'; return; }
  S.clips.forEach((c, i) => {
    const el = document.createElement('div'); el.className = 'm' + (S.cur === c ? ' sel' : ''); el.tabIndex = 0; el.setAttribute('role', 'button');
    el.innerHTML = `${c.thumb ? `<img alt="" src="${c.thumb}">` : '<div class="ph"></div>'}
      <div><div class="sc">${c.score ? c.score : '—'}<small>${c.score ? '/100' : 'manual'}</small></div>
      <div class="tm">Clip ${i + 1} · ${fmt(c.start)} → ${fmt(c.end)} (${Math.round(c.end - c.start)} s)</div>
      <div class="tg">${c.tags.join(' · ')}</div></div>
      <button class="x" type="button" title="Eliminar clip" aria-label="Eliminar clip">×</button>`;
    el.onclick = ev => { if (ev.target.closest('.x')) { deleteClip(c.id); } else selectClip(c.id); };
    el.onkeydown = ev => { if (ev.key === 'Enter') selectClip(c.id); };
    box.appendChild(el);
  });
}
function deleteClip(id) {
  const was = S.cur && S.cur.id === id; S.clips = S.clips.filter(c => c.id !== id);
  if (was) { pause(); S.cur = null; setEditorEnabled(false); }
  renderMoments();
}
function selectClip(id) {
  const c = S.clips.find(x => x.id === id); if (!c) return;
  pause(); S.cur = c; setEditorEnabled(true); syncUI(); renderMoments(); video.currentTime = c.start; step(3);
}

/* ---------- 3. EDITOR ---------- */
const ctl = id => $('#' + id);
function setEditorEnabled(on) {
  $('#stageHint').hidden = on;
  ['btnPlay', 'btnRestart', 'seek', 'btnExport'].forEach(i => ctl(i).disabled = !on);
  document.querySelectorAll('#editor input,#editor select,#editor textarea,#editor button').forEach(el => {
    if (el.id === 'btnCancel' || el.id === 'btnExport') return; el.disabled = !on;
  });
}
function syncUI() {
  const c = S.cur; if (!c) return;
  ctl('cStart').value = c.start.toFixed(1); ctl('cEnd').value = c.end.toFixed(1);
  ctl('mode').value = c.mode; ctl('cropX').value = c.cropX * 100; ctl('cropY').value = c.cropY * 100; ctl('zoom').value = c.zoom * 100;
  ctl('hookText').value = c.hook; ctl('hookOn').checked = c.hookOn; ctl('barOn').checked = c.bar;
  ctl('capStyle').value = c.capStyle; ctl('capPos').value = c.capPos; ctl('capSize').value = c.capSize;
  renderCaps();
}
const bind = (id, ev, fn) => ctl(id).addEventListener(ev, () => { if (S.cur) fn(S.cur, ctl(id)); });
bind('mode', 'change', (c, e) => c.mode = e.value);
bind('cropX', 'input', (c, e) => c.cropX = e.value / 100);
bind('cropY', 'input', (c, e) => c.cropY = e.value / 100);
bind('zoom', 'input', (c, e) => c.zoom = e.value / 100);
bind('hookText', 'input', (c, e) => c.hook = e.value);
bind('hookOn', 'change', (c, e) => c.hookOn = e.checked);
bind('barOn', 'change', (c, e) => c.bar = e.checked);
bind('capStyle', 'change', (c, e) => c.capStyle = e.value);
bind('capPos', 'change', (c, e) => c.capPos = e.value);
bind('capSize', 'input', (c, e) => c.capSize = +e.value);
bind('cStart', 'change', (c, e) => { c.start = clamp(+e.value || 0, 0, c.end - 1); e.value = c.start.toFixed(1); video.currentTime = c.start; renderMoments(); });
bind('cEnd', 'change', (c, e) => { c.end = clamp(+e.value || 0, c.start + 1, S.dur); e.value = c.end.toFixed(1); renderMoments(); });
ctl('btnSetStart').onclick = () => { const c = S.cur; if (!c) return; c.start = clamp(video.currentTime, 0, c.end - 1); syncUI(); renderMoments(); };
ctl('btnSetEnd').onclick = () => { const c = S.cur; if (!c) return; c.end = clamp(video.currentTime, c.start + 1, S.dur); syncUI(); renderMoments(); };

/* Transporte */
function ensureAudio() {
  if (!S.ac) {
    const AC = window.AudioContext || window.webkitAudioContext; S.ac = new AC();
    const src = S.ac.createMediaElementSource(video);
    S.gain = S.ac.createGain(); S.dest = S.ac.createMediaStreamDestination();
    src.connect(S.gain); S.gain.connect(S.ac.destination); src.connect(S.dest);
  }
  if (S.ac.state === 'suspended') S.ac.resume();
}
function play() {
  const c = S.cur; if (!c) return;
  ensureAudio();
  if (video.currentTime < c.start || video.currentTime >= c.end - 0.05) video.currentTime = c.start;
  video.play().then(() => { S.playing = true; ctl('btnPlay').textContent = '❚❚ Pausar'; }).catch(() => toast('El navegador bloqueó la reproducción'));
}
function pause() { video.pause(); S.playing = false; ctl('btnPlay').textContent = '▶ Reproducir'; }
ctl('btnPlay').onclick = () => (S.playing ? pause() : play());
ctl('btnRestart').onclick = () => { if (S.cur) video.currentTime = S.cur.start; };
ctl('seek').addEventListener('input', () => { const c = S.cur; if (!c) return; video.currentTime = c.start + (c.end - c.start) * ctl('seek').value / 1000; });
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && S.cur && !/INPUT|TEXTAREA|SELECT|BUTTON/.test(document.activeElement.tagName)) { e.preventDefault(); S.playing ? pause() : play(); }
});

/* Subtítulos */
function renderCaps() {
  const c = S.cur, box = ctl('capList'); box.innerHTML = '';
  if (!c || !c.captions.length) { box.innerHTML = '<p class="muted small-t">Sin subtítulos.</p>'; return; }
  c.captions.sort((a, b) => a.start - b.start).forEach(cap => {
    const r = document.createElement('div'); r.className = 'cap';
    r.innerHTML = `<input type="number" step="0.1" value="${cap.start.toFixed(1)}" aria-label="Inicio"><input type="number" step="0.1" value="${cap.end.toFixed(1)}" aria-label="Fin"><input type="text" value="" aria-label="Texto"><button class="x" type="button" title="Eliminar" aria-label="Eliminar subtítulo">×</button>`;
    const [a, b, t, x] = r.children; t.value = cap.text;
    a.onchange = () => { cap.start = +a.value || 0; };
    b.onchange = () => { cap.end = Math.max(cap.start + 0.2, +b.value || 0); };
    t.oninput = () => { cap.text = t.value; };
    a.onfocus = b.onfocus = () => { video.currentTime = clamp(cap.start, c.start, c.end); };
    x.onclick = () => { c.captions = c.captions.filter(k => k !== cap); renderCaps(); };
    box.appendChild(r);
  });
}
ctl('btnAddCap').onclick = () => {
  const c = S.cur; if (!c) return; const t = clamp(video.currentTime, c.start, c.end - 0.5);
  c.captions.push({ start: t, end: Math.min(c.end, t + 2), text: 'Nuevo subtítulo' }); renderCaps();
};
ctl('btnSrt').onclick = () => ctl('srtFile').click();
ctl('srtFile').onchange = async () => {
  const f = ctl('srtFile').files[0]; ctl('srtFile').value = ''; const c = S.cur; if (!f || !c) return;
  const items = parseSubs(await f.text()).filter(k => k.end > c.start && k.start < c.end);
  if (!items.length) { toast('Ningún subtítulo cae dentro de este clip'); return; }
  c.captions = items; renderCaps(); toast(items.length + ' subtítulos importados');
};
function parseSubs(txt) {
  const out = [], re = /(?:(\d+):)?(\d{1,2}):(\d{2})[,.](\d{1,3})\s*-->\s*(?:(\d+):)?(\d{1,2}):(\d{2})[,.](\d{1,3})[^\n]*\n((?:(?!\n\s*\n)[\s\S])*)/g;
  const sec = (h, m, s, ms) => (+h || 0) * 3600 + +m * 60 + +s + parseFloat('0.' + ms);
  let m; txt = txt.replace(/\r/g, '');
  while ((m = re.exec(txt))) {
    const text = m[9].replace(/<[^>]+>/g, '').replace(/\s*\n\s*/g, ' ').trim();
    if (text) out.push({ start: sec(m[1], m[2], m[3], m[4]), end: sec(m[5], m[6], m[7], m[8]), text });
  }
  return out;
}
ctl('btnSpread').onclick = () => {
  const c = S.cur; if (!c) return; const words = ctl('transcript').value.trim().split(/\s+/).filter(Boolean);
  if (!words.length) { toast('Pega primero el texto'); return; }
  const chunks = []; for (let i = 0; i < words.length; i += 4) chunks.push(words.slice(i, i + 4).join(' '));
  const d = (c.end - c.start) / chunks.length;
  c.captions = chunks.map((t, i) => ({ start: c.start + i * d, end: c.start + (i + 1) * d, text: t })); renderCaps();
  toast(chunks.length + ' subtítulos creados');
};

/* ---------- Render ---------- */
const bgC = document.createElement('canvas'); bgC.width = 54; bgC.height = 96; const bgX = bgC.getContext('2d');
function geom(W, H, c) {
  const vw = video.videoWidth, vh = video.videoHeight;
  const s = (c.mode === 'blur' ? Math.min(W / vw, H / vh) : Math.max(W / vw, H / vh)) * c.zoom, dw = vw * s, dh = vh * s;
  return { dw, dh, dx: dw >= W ? (W - dw) * c.cropX : (W - dw) / 2, dy: dh >= H ? (H - dh) * c.cropY : (H - dh) / 2 };
}
function drawCover(x, W, H, c) {
  x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
  if (c.mode === 'blur') {
    const vw = video.videoWidth, vh = video.videoHeight, k = Math.max(54 / vw, 96 / vh);
    bgX.drawImage(video, (54 - vw * k) / 2, (96 - vh * k) / 2, vw * k, vh * k);
    if ('filter' in x) x.filter = 'blur(10px)';
    x.drawImage(bgC, -W * .06, -H * .06, W * 1.12, H * 1.12); x.filter = 'none';
    x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(0, 0, W, H);
  }
  const g = geom(W, H, c); x.drawImage(video, g.dx, g.dy, g.dw, g.dh);
}
function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
function wrap(x, words, maxW, space) {
  const lines = [[]]; let w = 0;
  words.forEach((t, i) => {
    const tw = x.measureText(t).width;
    if (w + tw > maxW && lines[lines.length - 1].length) { lines.push([]); w = 0; }
    lines[lines.length - 1].push({ t, i, tw }); w += tw + space;
  });
  return lines;
}
function drawCaption(x, W, H, t, c) {
  const cap = c.captions.find(k => t >= k.start && t < k.end); if (!cap) return;
  const words = cap.text.trim().split(/\s+/).filter(Boolean); if (!words.length) return;
  const fs = Math.round(W * c.capSize / 540), upper = c.capStyle === 'viral';
  x.font = `800 ${fs}px ${FONT}`; x.textBaseline = 'middle'; x.lineJoin = 'round';
  const ws = words.map(w => upper ? w.toUpperCase() : w), space = fs * 0.28, lh = fs * 1.2;
  const lines = wrap(x, ws, W * 0.86, space), th = lines.length * lh;
  const top = c.capPos === 'top' ? H * 0.16 : c.capPos === 'mid' ? (H - th) / 2 : H * 0.72 - th / 2;
  const act = Math.min(words.length - 1, Math.floor((t - cap.start) / (cap.end - cap.start) * words.length));
  lines.forEach((ln, li) => {
    const lw = ln.reduce((a, b) => a + b.tw, 0) + space * (ln.length - 1), y = top + li * lh + lh / 2;
    let px = (W - lw) / 2;
    if (c.capStyle === 'caja') { x.fillStyle = 'rgba(15,22,19,.82)'; rr(x, px - fs * .3, y - lh / 2 + fs * .08, lw + fs * .6, lh - fs * .1, fs * .3); x.fill(); }
    ln.forEach(wd => {
      const on = wd.i === act;
      x.textAlign = 'left';
      if (c.capStyle === 'viral') { x.lineWidth = fs * 0.22; x.strokeStyle = '#000'; x.strokeText(wd.t, px, y); x.fillStyle = on ? COL.ocre : '#fff'; }
      else if (c.capStyle === 'limpio') { x.shadowColor = 'rgba(0,0,0,.7)'; x.shadowBlur = fs * .25; x.fillStyle = on ? COL.verm : COL.bone; }
      else { x.fillStyle = on ? COL.ocre : COL.bone; }
      x.fillText(wd.t, px, y); x.shadowBlur = 0; px += wd.tw + space;
    });
  });
}
function drawHook(x, W, H, t, c) {
  const el = t - c.start; if (!c.hookOn || !c.hook.trim() || el < 0 || el > 4) return;
  const fs = Math.round(W * 0.056); x.font = `800 ${fs}px ${FONT}`; x.textBaseline = 'middle';
  const lines = wrap(x, c.hook.trim().split(/\s+/), W * 0.76, fs * .26), lh = fs * 1.25;
  const bw = Math.max(...lines.map(l => l.reduce((a, b) => a + b.tw, 0) + fs * .26 * (l.length - 1))) + fs * 1.2, bh = lines.length * lh + fs * .8;
  x.globalAlpha = Math.min(1, el / 0.25, (4 - el) / 0.25);
  x.fillStyle = COL.bone; rr(x, (W - bw) / 2, H * 0.07, bw, bh, fs * .45); x.fill();
  x.fillStyle = COL.ink; x.textAlign = 'left';
  lines.forEach((ln, i) => { const lw = ln.reduce((a, b) => a + b.tw, 0) + fs * .26 * (ln.length - 1); let px = (W - lw) / 2; ln.forEach(wd => { x.fillText(wd.t, px, H * 0.07 + fs * .4 + i * lh + lh / 2); px += wd.tw + fs * .26; }); });
  x.globalAlpha = 1;
}
function drawFrame(x, W, H, t, c) {
  drawCover(x, W, H, c); drawHook(x, W, H, t, c); drawCaption(x, W, H, t, c);
  if (c.bar) { x.fillStyle = COL.verm; x.fillRect(0, H - Math.max(4, W * .012), W * clamp((t - c.start) / (c.end - c.start), 0, 1), Math.max(4, W * .012)); }
}
(function loop() {
  requestAnimationFrame(loop);
  const c = S.cur; if (!c || video.readyState < 2) return;
  let t = video.currentTime;
  if (S.playing && !S.exporting && t >= c.end) { video.currentTime = c.start; t = c.start; }
  drawFrame(pctx, PW, PH, clamp(t, c.start, c.end), c);
  ctl('timeLbl').textContent = `${fmt(Math.max(0, t - c.start))} / ${fmt(c.end - c.start)}`;
  if (document.activeElement !== ctl('seek')) ctl('seek').value = clamp((t - c.start) / (c.end - c.start), 0, 1) * 1000;
})();

/* ---------- 4. EXPORTAR ---------- */
function pickMime() {
  const opts = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  return opts.find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || '';
}
ctl('btnCancel').onclick = () => { S.cancel = true; };
ctl('btnExport').onclick = async () => {
  const c = S.cur; if (!c || S.exporting || S.busy) return;
  if (!window.MediaRecorder) { toast('Tu navegador no soporta exportación. Usa Chrome, Edge o Firefox.'); return; }
  const mime = pickMime(), W = +ctl('selRes').value, H = Math.round(W * 16 / 9), ext = mime.startsWith('video/mp4') ? 'mp4' : 'webm';
  pause(); ensureAudio(); S.exporting = true; S.cancel = false; step(4);
  ctl('btnExport').hidden = true; ctl('btnCancel').hidden = false; ctl('expProg').hidden = false; ctl('result').hidden = true;
  const msg = ctl('expMsg'), bar = ctl('expBar'); bar.style.width = '0%'; msg.textContent = 'Preparando…';
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d');
  const stream = cv.captureStream(30); S.dest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
  const rec = new MediaRecorder(stream, { mimeType: mime || undefined, videoBitsPerSecond: W >= 1080 ? 8e6 : 5e6, audioBitsPerSecond: 128e3 });
  const chunks = []; rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  const stopped = new Promise(r => rec.onstop = r);
  const dur = c.end - c.start;
  try {
    await seekTo(c.start); S.gain.gain.value = 0; drawFrame(x, W, H, c.start, c);
    rec.start(250); await video.play(); msg.textContent = 'Grabando… mantén esta pestaña visible.';
    await new Promise(done => {
      const tick = () => {
        const t = video.currentTime;
        drawFrame(x, W, H, clamp(t, c.start, c.end), c);
        bar.style.width = (clamp((t - c.start) / dur, 0, 1) * 100) + '%';
        if (S.cancel || t >= c.end - 0.03 || video.ended) return done();
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  } catch (err) { S.cancel = true; msg.textContent = 'Error: ' + err.message; }
  video.pause(); S.gain.gain.value = 1;
  if (rec.state !== 'inactive') rec.stop(); await stopped;
  S.exporting = false; ctl('btnExport').hidden = false; ctl('btnCancel').hidden = true; ctl('expProg').hidden = true;
  if (S.cancel || !chunks.length) { msg.textContent = S.cancel && msg.textContent.startsWith('Error') ? msg.textContent : 'Exportación cancelada.'; return; }
  const blob = new Blob(chunks, { type: mime || 'video/webm' }), url = URL.createObjectURL(blob);
  const idx = S.clips.indexOf(c) + 1, fname = `chispa-clip-${idx}.${ext}`;
  const box = ctl('result'); box.innerHTML = ''; const v = document.createElement('video'); v.src = url; v.controls = true; v.playsInline = true;
  const a = document.createElement('a'); a.className = 'btn primary'; a.href = url; a.download = fname; a.textContent = `Descargar ${fname} (${(blob.size / 1048576).toFixed(1)} MB)`;
  box.append(v, a); box.hidden = false; msg.textContent = ext === 'webm' ? 'Listo. Formato WebM (YouTube lo acepta; para Instagram conviértelo a MP4).' : 'Listo.';
  a.click();
};

window.addEventListener('beforeunload', e => { if (S.exporting) { e.preventDefault(); e.returnValue = ''; } });
setEditorEnabled(false);
})();
