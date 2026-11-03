// kidsim: juega una escena del juego en jsdom con reloj virtual (tan rápido como la CPU),
// con un "niño" que teclea a cierta velocidad. Sirve para medir dificultad.
//
// Uso:  NODE_PATH=<node_modules con jsdom> node tools/kidsim.js '<json>'
//   { "enemy": "patoloco", "diff": "normal", "level": "auto", "seed": 1, "maxSec": 600,
//     "ms": 330, "react": 700, "err": 0.04, "bot": "ruta/adaptador.js",
//     "setup": "js extra antes de abrir la escena", "go": ["escena", {params}] }
//   GAME_ROOT=<carpeta del juego> (por defecto, la de este repo)
// Perfiles de referencia: niño de 30 PPM {ms:330, react:700, err:0.04};
//   niño lento {ms:450, react:1000, err:0.07}; niño de 80 PPM {ms:150, react:400, err:0.03}.
// Si no hay "go", abre ENEMIES[enemy].mode || 'battle' con {enemyId, back:'title'}.
// level "auto": el nivel que tendría al llegar a ese enemigo peleando todo lo anterior.
// Imprime una línea JSON: { enemy, result, sec, minHp, endHp, maxHp, foeHp, keys, wrong, errs, log }
// result: 'win' | 'lose' | 'timeout' | 'crash' | el nombre de la escena final.
//
// El bot genérico sabe jugar TypingTask y Dodge (js/typing.js) y aprieta Enter cuando
// no hay nada que teclear. Para escenas propias, "bot" apunta a un archivo JS que define
//   window.__kidAdapter = { step(now, kid) -> true | ms | false, done(scene) -> 'win'|'lose'|null }
// kid trae: send(key), type(ch) (con errores), gap(ch), find() (TypingTask/Dodge activo), cost(ch), ms, react, err, rnd().
// jsdom no tiene layout: window.__layout = [[selector, ancho, alto], ...] da medidas a los campos
// (medidas reales del navegador: .dodge 600x176; bala "hola" 82x46).
const fs = require('fs'); const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const cfg = Object.assign({ root: process.env.GAME_ROOT || path.join(__dirname, '..'), diff: 'normal', seed: 1, maxSec: 600, ms: 330, react: 700, err: 0.04 }, JSON.parse(process.argv[2] || '{}'));
const ROOT = cfg.root;
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const esc = (s) => s.replace(/<\/script/gi, '<\\/script');
html = html.replace(/<link[^>]*>/g, '').replace(/<script([^>]*)src="([^"]+)"([^>]*)><\/script>/g, (m, a, src) =>
  src.startsWith('http') ? '' : `<script>//# sourceURL=${src}\n${esc(fs.readFileSync(path.join(ROOT, src), 'utf8'))}\n</script>`);
const pre = `<script>
window.__errs = [];
(function () {
  // Reloj virtual: performance.now, Date.now, timers y rAF los avanza __adv(ms).
  let vt = 0, id = 1, T = [], rafs = [];
  const base = Date.now();
  Object.defineProperty(window.performance, 'now', { value: () => vt, configurable: true });
  Date.now = () => base + vt;
  window.setTimeout = (f, ms, ...a) => { const i = id++; T.push({ i, t: vt + Math.max(0, +ms || 0), f, a }); return i; };
  window.setInterval = (f, ms, ...a) => { const r = Math.max(1, +ms || 0); const i = id++; T.push({ i, t: vt + r, f, a, rep: r }); return i; };
  window.clearTimeout = window.clearInterval = (i) => { const k = T.findIndex((x) => x.i === i); if (k >= 0) T.splice(k, 1); };
  window.requestAnimationFrame = (f) => { const i = id++; rafs.push({ i, f }); return i; };
  window.cancelAnimationFrame = (i) => { rafs = rafs.filter((x) => x.i !== i); };
  const run = (f, a) => { try { typeof f === 'function' ? f(...a) : 0; } catch (e) { window.__errs.push(String(e && e.stack || e).split('\\n').slice(0, 3).join(' | ')); } };
  window.__adv = (ms) => {
    const end = vt + ms;
    while (vt < end) {
      const tgt = Math.min(end, vt + 16.67);
      for (;;) {
        let n = null; for (const x of T) if (!n || x.t < n.t) n = x;
        if (!n || n.t > tgt) break;
        vt = Math.max(vt, n.t);
        if (n.rep) n.t += n.rep; else T.splice(T.indexOf(n), 1);
        run(n.f, n.a);
      }
      vt = tgt;
      const r = rafs; rafs = []; for (const x of r) run(x.f, [vt]);
    }
  };
  window.__vt = () => vt;
  // Math.random con semilla, para repetir corridas.
  let s = ${(cfg.seed >>> 0) || 1};
  Math.random = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
})();
const __ctx = new Proxy({}, { get: (t, k) => (k === 'measureText' ? () => ({ width: 10 }) : /ImageData$/.test(k) ? () => ({ data: new Uint8ClampedArray(4) }) : /Gradient$|Pattern$/.test(k) ? () => ({ addColorStop() {} }) : typeof k === 'string' ? (k in t ? t[k] : () => {}) : undefined), set: (t, k, v) => { t[k] = v; return true; } });
HTMLCanvasElement.prototype.getContext = function (type) { return type === '2d' ? __ctx : null; };
HTMLCanvasElement.prototype.toDataURL = () => '';
window.AudioContext = function () {
  const p = () => ({ setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {}, setValueCurveAtTime() {}, value: 1 });
  const node = () => ({ connect() { return node(); }, disconnect() {}, start() {}, stop() {}, setPeriodicWave() {}, frequency: p(), gain: p(), delayTime: p(), Q: p(), detune: p(), pan: p(), threshold: p(), knee: p(), ratio: p(), attack: p(), release: p(), playbackRate: p(), type: '', buffer: null, curve: null, onended: null });
  return { currentTime: 0, state: 'running', resume() { return Promise.resolve(); }, destination: {}, sampleRate: 44100,
    createOscillator: node, createGain: node, createBufferSource: node, createBiquadFilter: node, createDelay: node,
    createDynamicsCompressor: node, createWaveShaper: node, createStereoPanner: node, createConvolver: node, createChannelMerger: node, createChannelSplitter: node,
    createPeriodicWave: () => ({}), createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(Math.max(1, n | 0)), numberOfChannels: c, length: n }) };
};
window.webkitAudioContext = window.AudioContext;
// Medidas de layout (jsdom no tiene). Los demás elementos miden 0 (las escenas usan su "|| valor").
window.__layout = [['.dodge', 600, 176], ['.bbox', 600, 176]];
const __lay = (el, i) => { for (const r of window.__layout) if (el.matches && el.matches(r[0])) return r[i]; return null; };
const __textW = (el) => (el.textContent || '').length * 14 + 26;
const __isBullet = (el) => /bullet|bala|word|palabra|item/i.test(el.className || '');
Object.defineProperty(HTMLElement.prototype, 'clientWidth', { get() { const v = __lay(this, 1); return v != null ? v : 0; } });
Object.defineProperty(HTMLElement.prototype, 'clientHeight', { get() { const v = __lay(this, 2); return v != null ? v : 0; } });
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { get() { const v = __lay(this, 1); return v != null ? v : __isBullet(this) ? __textW(this) : 0; } });
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { get() { const v = __lay(this, 2); return v != null ? v : __isBullet(this) ? 46 : 0; } });
document.fonts = { load: () => Promise.resolve(), ready: Promise.resolve() };
</script>`;
html = html.replace('<head>', '<head>' + pre);
const vc = new VirtualConsole();
const jsErr = [];
vc.on('jsdomError', (e) => jsErr.push(String(e.detail && e.detail.message || e.message).slice(0, 200)));
const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://127.0.0.1/', pretendToBeVisual: false, virtualConsole: vc });
const w = dom.window;

const BOT = `
window.__kid = { ms: ${cfg.ms}, react: ${cfg.react}, err: ${cfg.err}, keys: 0, wrong: 0, log: [] };
(function () {
  const kid = window.__kid;
  kid.rnd = Math.random;
  kid.send = (k) => { kid.keys++; document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })); document.dispatchEvent(new KeyboardEvent('keyup', { key: k, bubbles: true })); };
  kid.cost = (ch) => /[áéíóúüñ¿¡]/i.test(ch || '') ? 2.6 : (ch && ch !== ch.toLowerCase()) ? 1.8 : 1;
  kid.gap = (ch) => kid.ms * (0.7 + kid.rnd() * 0.6) * kid.cost(ch);
  // Busca el TypingTask/Dodge activo (los getters de la escena pueden tronar: se ignoran).
  kid.find = () => { const s = Game.scene; if (!s) return null; for (const k in s) { let v; try { v = s[k]; } catch (e) { continue; } if ((v instanceof TypingTask || v instanceof Dodge) && v.active) return v; } return null; };
  // Teclea un carácter con probabilidad de error (manda 'q' o 'w').
  kid.type = (ch) => { if (kid.rnd() < kid.err) { kid.wrong++; kid.send(ch === 'q' ? 'w' : 'q'); } else kid.send(ch); };
  let next = 0, lastUnit = null;
  kid.generic = (now) => {
    const t = kid.find();
    if (t instanceof TypingTask) {
      const txt = t.texts[t.i]; if (txt == null) return true;
      const id = t.i + '|' + txt;
      if (id !== lastUnit) { lastUnit = id; next = now + kid.react; return true; }
      const ch = txt[t.pos]; if (ch == null) return true;
      kid.type(ch); next = now + kid.gap(ch); return true;
    }
    if (t instanceof Dodge) {
      let b = t.target;
      if (!b && t.bullets.length) { b = t.bullets.reduce((a, x) => (x.y > a.y ? x : a)); if (b.y < 10) b = null; }
      if (b) { const ch = b.text[b.pos]; if (ch == null) return true; kid.type(ch); next = now + kid.gap(ch) + (t.target ? 0 : kid.react * 0.6); }
      return true;
    }
    return false;
  };
  setInterval(() => {
    const now = performance.now(); if (now < next) return;
    try {
      const A = window.__kidAdapter;
      let handled = A && A.step ? A.step(now, kid) : false;
      if (typeof handled === 'number') { next = now + handled; return; }
      if (!handled) handled = kid.generic(now);
      if (!handled) { next = now + 450; kid.send('Enter'); }
    } catch (e) { kid.log.push('BOT: ' + e.message); next = now + 500; }
  }, 20);
})();`;

const sceneName = () => w.eval('Object.keys(Scenes).find((k) => Scenes[k] === Game.scene) || "?"');
const out = { enemy: cfg.enemy, diff: cfg.diff, seed: cfg.seed };
function finish(result) {
  try {
    Object.assign(out, { result, sec: Math.round(w.__vt() / 1000), keys: w.__kid && w.__kid.keys, wrong: w.__kid && w.__kid.wrong });
    out.errs = [...new Set([...w.__errs, ...jsErr])].slice(0, 6);
    if (w.__kid && w.__kid.log.length) out.log = w.__kid.log.slice(-8);
    if (w.__L) out.trace = w.__L;
  } catch (e) { out.result = 'crash'; out.errs = [e.message]; }
  console.log(JSON.stringify(out));
  process.exit(0);
}
setTimeout(async () => {
  try {
    w.__adv(2000);
    w.eval(`Save.reset(); Save.write = () => {}; Save.data.seenIntro = true; Save.data.flags.metBit = true; Save.data.difficulty = ${JSON.stringify(cfg.diff)};`);
    if (!cfg.level || cfg.level === 'auto') cfg.level = w.eval(`(() => { const lvAt = (xp) => { let l = 1; while (xp >= 15 + l * 10) { xp -= 15 + l * 10; l++; } return l; };
      let acc = 0; for (const W of WORLDS) for (const n of W.nodes) { if (n === ${JSON.stringify(cfg.enemy)}) return lvAt(acc); acc += (ENEMIES[n] && ENEMIES[n].xp) || 0; } return lvAt(acc); })()`);
    out.level = cfg.level;
    w.eval(`Save.data.level = ${cfg.level}; Save.data.xp = 0;`);
    if (cfg.setup) w.eval(cfg.setup);
    w.eval(BOT);
    if (cfg.bot) w.eval(fs.readFileSync(cfg.bot, 'utf8'));
    const go = cfg.go || [w.eval(`(ENEMIES[${JSON.stringify(cfg.enemy)}] || {}).mode || 'battle'`), { enemyId: cfg.enemy, back: 'title' }];
    w.eval(`Game.lockUntil = 0; Game.go(${JSON.stringify(go[0])}, ${JSON.stringify(go[1])});`);
    out.scene = sceneName();
  } catch (e) { out.errs = [e.message]; return finish('crash'); }
  const start = sceneName();
  let minHp = Infinity;
  const t0 = Date.now();
  for (let k = 0; k < cfg.maxSec * 10; k++) {
    // Avanza 100 ms virtuales en pasos de 25, cediendo al event loop para que corran las promesas.
    for (let j = 0; j < 4; j++) { w.__adv(25); await new Promise((r) => setImmediate(r)); }
    let st;
    try {
      st = w.eval(`(() => { const s = Game.scene, A = window.__kidAdapter;
        const r = A && A.done ? A.done(s) : null;
        const p = s && (s.p || s.player);
        const f = s && (s.e || s.foe || s.enemy);
        return { r, name: Object.keys(Scenes).find((k) => Scenes[k] === s) || '?', hp: p && p.hp, max: p && (p.max || p.maxHp), foe: f && f.hp }; })()`);
    } catch (e) { out.errs = [e.message]; return finish('crash'); }
    if (typeof st.hp === 'number') { minHp = Math.min(minHp, st.hp); out.minHp = minHp; out.endHp = st.hp; out.maxHp = st.max; }
    if (typeof st.foe === 'number') out.foeHp = st.foe;
    if (st.r) return finish(st.r);
    if (st.name !== start) { out.endScene = st.name; return finish(st.name === 'gameover' ? 'lose' : st.name === 'title' ? (out.foeHp === 0 || (out.endHp > 0 && out.foeHp === undefined) ? 'win' : 'left') : st.name); }
    if (Date.now() - t0 > 180000) return finish('walltimeout');
  }
  finish('timeout');
}, 300);
