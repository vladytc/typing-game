// Prueba de humo: carga index.html como el navegador (un <script> por archivo) y abre escenas.
// Uso: NODE_PATH=<node_modules con jsdom> node tools/smoke.js '[["escena",{params}], ...]'
//   GAME_ROOT=<carpeta del juego> (por defecto, la de este repo)
//   EXTRA='js' evalúa algo al final e imprime el resultado.
// Imprime "SIN ERRORES" o la lista de errores.
const fs = require('fs'); const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const ROOT = process.env.GAME_ROOT || path.join(__dirname, '..');
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const errors = [];
const esc = (s) => s.replace(/<\/script/gi, '<\\/script');
html = html.replace(/<link[^>]*>/g, '').replace(/<script([^>]*)src="([^"]+)"([^>]*)><\/script>/g, (m, a, src) =>
  src.startsWith('http') ? '' : `<script>//# sourceURL=${src}\n${esc(fs.readFileSync(path.join(ROOT, src), 'utf8'))}\n</script>`);
const scenes = JSON.parse(process.argv[2] || '[]');
const pre = `<script>
const __ctx = new Proxy({}, { get: (t, k) => (k === 'measureText' ? () => ({ width: 10 }) : /ImageData$/.test(k) ? () => ({ data: new Uint8ClampedArray(4) }) : /Gradient$|Pattern$/.test(k) ? () => ({ addColorStop() {} }) : typeof k === 'string' ? (k in t ? t[k] : () => {}) : undefined), set: (t, k, v) => { t[k] = v; return true; } });
HTMLCanvasElement.prototype.getContext = function (type) { return type === '2d' ? __ctx : null; };
HTMLCanvasElement.prototype.toDataURL = () => '';
${AUDIO_STUB()}
document.fonts = { load: () => Promise.resolve(), ready: Promise.resolve() };
</script>`;
function AUDIO_STUB() {
  return `window.AudioContext = function () {
  const p = () => ({ setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {}, setValueCurveAtTime() {}, value: 1 });
  const node = () => ({ connect() { return node(); }, disconnect() {}, start() {}, stop() {}, setPeriodicWave() {}, frequency: p(), gain: p(), delayTime: p(), Q: p(), detune: p(), pan: p(), threshold: p(), knee: p(), ratio: p(), attack: p(), release: p(), playbackRate: p(), type: '', buffer: null, curve: null, onended: null });
  return { currentTime: 0, state: 'running', resume() { return Promise.resolve(); }, destination: {}, sampleRate: 44100,
    createOscillator: node, createGain: node, createBufferSource: node, createBiquadFilter: node, createDelay: node,
    createDynamicsCompressor: node, createWaveShaper: node, createStereoPanner: node, createConvolver: node, createChannelMerger: node, createChannelSplitter: node,
    createPeriodicWave: () => ({}), createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(Math.max(1, n | 0)), numberOfChannels: c, length: n }) };
};
window.webkitAudioContext = window.AudioContext;`;
}
html = html.replace('<head>', '<head>' + pre);
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errors.push('JSDOM: ' + (e.detail && e.detail.message || e.message)));
const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://127.0.0.1/', pretendToBeVisual: true, virtualConsole: vc });
const w = dom.window;
setTimeout(() => {
  try {
    w.eval(`Save.reset(); Save.write=()=>{}; Save.data.seenIntro=true; Save.data.flags.metBit=true;
      Object.assign(Save.data.consoles,{gameboy:true,nes:true,snes:true,n64:true,gamecube:true});
      Save.data.team=[{id:'voltin',lv:10,xp:0}];`);
  } catch (e) { errors.push('SETUP: ' + e.message); }
  for (const [s, p] of scenes) {
    try { w.eval(`Game.lockUntil=0; Game.go(${JSON.stringify(s)}, ${JSON.stringify(p)})`); }
    catch (e) { errors.push(`GO ${s} ${JSON.stringify(p)}: ${e.message} @ ${(e.stack || '').split('\n')[1]}`); }
  }
  if (process.env.EXTRA) { try { console.log(w.eval(process.env.EXTRA)); } catch (e) { errors.push('EXTRA: ' + e.message + ' @ ' + (e.stack || '').split('\n')[1]); } }
  try { console.log('mundos: ' + w.eval('WORLDS.map(x=>x.id+":"+x.nodes.length).join(" ")')); } catch (e) { errors.push(e.message); }
  setTimeout(() => { console.log(errors.length ? errors.join('\n') : 'SIN ERRORES'); process.exit(0); }, 500);
}, 1500);
