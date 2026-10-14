// Render offline de la música (herramienta para compositores; el juego no la usa).
// Carga js/music.js en un contexto de node, valida el parseo de las pistas y las "graba" a WAV
// con un OfflineAudioContext real (paquete node-web-audio-api, que no es dependencia del juego).
//
// Uso:
//   npm i --no-save node-web-audio-api       (o NODE_PATH=<carpeta con node_modules>)
//   node tools/musica-render.js [opciones] [pista ...]
// Opciones:
//   --tracks archivo.json  agrega pistas (p. ej. un volcado de TRACKS con las de los mundos)
//   --out carpeta          dónde guardar los WAV (por defecto, no guarda; solo mide)
//   --secs 10              segundos por pista (si es "loop", usa la vuelta completa con --loop)
//   --loop                 graba una vuelta completa de cada pista (intro + loop)
//   --check                solo valida el parseo (no necesita node-web-audio-api)
// MUSIC_JS=otro/music.js usa otra versión del motor (para comparar antes y después).
// Sin nombres de pista, procesa todas.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const args = process.argv.slice(2);
const opt = { secs: 10, names: [] };
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--tracks') opt.tracks = args[++i];
  else if (a === '--out') opt.out = args[++i];
  else if (a === '--secs') opt.secs = Number(args[++i]);
  else if (a === '--loop') opt.loop = true;
  else if (a === '--check') opt.check = true;
  else opt.names.push(a);
}
const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(process.env.MUSIC_JS || path.join(ROOT, 'js/music.js'), 'utf8');
const EXTRA = opt.tracks ? fs.readFileSync(opt.tracks, 'utf8') : null;

// Un contexto nuevo por pista: Music guarda su master y su ruido del primer AudioContext.
function load(audio) {
  const intervals = [];
  const sandbox = {
    console, Math, JSON, Float32Array, Array, Object, Number, String, Error,
    performance: { now: () => 0 },
    setInterval: (fn) => { intervals.push(fn); return intervals.length; },
    clearInterval: (id) => { intervals[id - 1] = null; },
    setTimeout: () => 0,
    Sfx: { unlock: () => audio },
  };
  vm.createContext(sandbox);
  vm.runInContext(SRC, sandbox, { filename: 'js/music.js' });
  if (EXTRA) vm.runInContext(`Object.assign(TRACKS, ${EXTRA});`, sandbox);
  vm.runInContext('this.__api = { Music, TRACKS };', sandbox);
  return { ...sandbox.__api, intervals };
}

// Envuelve el contexto real: el reloj (currentTime) lo movemos nosotros mientras programamos.
function clockCtx(real) {
  const w = { t: 0 };
  const proxy = new Proxy(real, {
    get(target, k) {
      if (k === 'currentTime') return w.t;
      if (k === 'state') return 'running';
      if (k === 'resume') return () => {};
      const v = target[k];
      return typeof v === 'function' ? v.bind(target) : v;
    },
  });
  return { proxy, w };
}

function wav(buf) {
  const ch = buf.numberOfChannels;
  const len = buf.length;
  const out = Buffer.alloc(44 + len * ch * 2);
  out.write('RIFF', 0); out.writeUInt32LE(36 + len * ch * 2, 4); out.write('WAVE', 8);
  out.write('fmt ', 12); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(ch, 22);
  out.writeUInt32LE(buf.sampleRate, 24); out.writeUInt32LE(buf.sampleRate * ch * 2, 28);
  out.writeUInt16LE(ch * 2, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(len * ch * 2, 40);
  const data = [...Array(ch)].map((_, c) => buf.getChannelData(c));
  for (let i = 0; i < len; i++) {
    for (let c = 0; c < ch; c++) out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, data[c][i])) * 32767), 44 + (i * ch + c) * 2);
  }
  return out;
}

// El motor viejo no tiene Music.check: en ese caso solo se graba --secs.
const check = (api, n) => (api.Music.check ? api.Music.check(n) : api.TRACKS[n] && { intro: [0], loop: [0], aligned: true });

async function main() {
  const probe = load(null);
  const names = opt.names.length ? opt.names : Object.keys(probe.TRACKS);
  let fails = 0;
  // 1) Parseo: todas las voces, intro y loop, y si quedan alineadas.
  names.forEach((n) => {
    const ck = check(probe, n);
    if (!ck) { fails++; console.log(`${n}: NO EXISTE`); return; }
    if (opt.check) console.log(`${n}: loop=${ck.loop.join(',')} intro=${ck.intro.join(',')}${ck.aligned ? '' : '  (voces desalineadas)'}`);
  });
  if (opt.check) { console.log(fails ? `${fails} fallas` : 'parseo OK'); return; }

  // 2) Render real.
  const { OfflineAudioContext } = require('node-web-audio-api');
  if (opt.out) fs.mkdirSync(opt.out, { recursive: true });
  for (const n of names) {
    const tr = probe.TRACKS[n];
    const ck = check(probe, n);
    const stepS = 60 / tr.bpm / 4;
    const secs = opt.loop ? (Math.max(...ck.intro) + Math.max(...ck.loop)) * stepS + 1.5 : opt.secs;
    const sr = 44100;
    const real = new OfflineAudioContext(2, Math.ceil(secs * sr), sr);
    const { proxy, w } = clockCtx(real);
    const api = load(proxy);
    try {
      api.Music.play(n);
      // Avanza el reloj como lo haría el setInterval de 50 ms, programando todo antes de grabar.
      for (; w.t < secs - 0.3; w.t += 0.05) api.intervals.forEach((f) => f && f());
      const buf = await real.startRendering();
      let peak = 0;
      let sum = 0;
      let bad = 0;
      for (let c = 0; c < buf.numberOfChannels; c++) {
        const d = buf.getChannelData(c);
        for (let i = 0; i < d.length; i++) {
          const x = d[i];
          if (!Number.isFinite(x)) { bad++; continue; }
          peak = Math.max(peak, Math.abs(x));
          sum += x * x;
        }
      }
      const rms = Math.sqrt(sum / (buf.length * buf.numberOfChannels));
      const warn = bad ? ' NaN!' : peak >= 1 ? ' SATURA' : rms < 0.002 ? ' casi mudo' : '';
      if (bad || peak >= 1) fails++;
      console.log(`${n}: ${secs.toFixed(1)} s pico=${peak.toFixed(3)} rms=${rms.toFixed(4)}${warn}`);
      if (opt.out) fs.writeFileSync(path.join(opt.out, `${n}.wav`), wav(buf));
    } catch (e) {
      fails++;
      console.log(`${n}: ERROR ${e.message}`);
    }
  }
  console.log(fails ? `${fails} con problemas` : 'todo OK');
}

main();
