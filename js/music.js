// Música chiptune: un secuenciador con WebAudio (sin archivos de audio).
// Todas las melodías son originales, compuestas "al estilo" de cada época.
//
// ===================== NOTACIÓN (para compositores) =====================
// Cada voz es un texto de "fichas" separadas por espacios. Un paso = semicorchea.
//   E5/2      nota E5 durante 2 pasos (sin "/n" dura 1). Sostenidos "C#4", bemoles "Bb3".
//   -/4       silencio de 4 pasos.
//   C4+E4+G4/4  acorde: en una voz normal suena como ARPEGIO rápido estilo chiptune
//             (velocidad con `arp` de la voz); si la voz tiene `poly: true` suena junto.
//   Marcas al final de la ficha (se pueden combinar, p. ej. "G5/4!^"):
//     !  acento (más fuerte)          ?  nota suave ("fantasma")
//     .  staccato (cortita)           _  ligada (dura todo su tiempo)
//     ^  se desliza desde la nota anterior (portamento solo en esa nota)
//   ( ... )*3  repite el grupo 3 veces (se pueden anidar). "|" se ignora: sirve de barra
//             de compás para leer mejor.
//   Batería (voces con wave 'noise' o 'drums'):
//     x golpe clásico de ruido (el de siempre)   k bombo        s tarola
//     h hi-hat cerrado    o hi-hat abierto       c platillo     t tom agudo   T tom grave
//     Se juntan con "+": "k+h/2", "c+k/4!".
//
// Opciones de cada VOZ (todas opcionales salvo `notes`):
//   wave    'square' 'triangle' 'sawtooth' 'sine' | 'pulse12' 'pulse25' 'pulse50' (pulso de
//           NES/Game Boy) | 'gbwave' (onda programable delgada) | 'organ' 'brass' 'strings'
//           'flute' 'ocarina' 'warmbass' 'bell' 'vox' 'snes' | 'noise' (batería) |
//           o un arreglo de armónicos propio: [1, 0.5, 0.25].
//   vol     volumen (0.03 es lo normal para una melodía; 0.1 para el bajo de triángulo).
//   legato  fracción del paso que suena la nota (0.85 por defecto).
//   env     envolvente: 'chip' 'pluck' 'stab' 'organ' 'soft' 'pad' 'swell' 'bell' 'bass'
//           o { a, d, s, r }: ataque, caída y relajación en segundos; s = nivel sostenido (0-1).
//           Sin env suena como siempre (la envolvente fija de antes).
//   vib     vibrato que entra después de un retraso: true | 'light' | 'wide' | 'slow' |
//           { rate: Hz, depth: semitonos, delay: segundos }.
//   arp     segundos por nota del arpeggio (0.03 por defecto). arpMode: 'up' 'down' 'updown'.
//   poly    true: los acordes suenan juntos en vez de arpegiados.
//   slide   segundos de portamento entre TODAS las notas de la voz (o usa "^" por nota).
//   unison  centésimas de desafinación de una segunda onda (coro, pads gorditos).
//   transpose  semitonos (12 = una octava arriba).
//   filter  pasa bajos en Hz (2000) o { type, freq, q } solo para esta voz.
//   pan     -1 (izquierda) a 1 (derecha).
//   fx      cuánto manda al eco/reverb de la pista (0 a 1; 1 por defecto). Al bajo, 0.
//   kit     batería: 'full' (moderna) o 'lofi' (ruido de 1 bit como la NES/GB).
//   intro   fichas que suenan una sola vez antes del loop de `notes`.
//   notes   texto o arreglo de textos (se juntan en orden).
//   parts   { A: '...', B: '...' } para usar con `form` de la pista (ver abajo).
//
// Opciones de la PISTA:
//   bpm, loop (false = no se repite), vol (volumen general de la pista).
//   era     'gb' 'nes' 'snes' 'n64' 'gc' 'wii': carácter de consola sin configurar todo
//           (cambia ondas, envolventes, vibrato de la voz 1, batería y efectos; ver ERAS).
//           Lo que pongas en cada voz gana sobre la era. `fx: false` quita los efectos de la era.
//             gb   square→pulse50, sawtooth→pulse25, triangle/sine→gbwave; env chip, batería
//                  lofi, arpegio rápido; filtros de bocinita y mezcla un poco cruda (crush 8 bits).
//             nes  sawtooth→pulse25, sine→triangle; env chip, batería lofi; sin eco.
//             snes square→snes, sawtooth→strings, triangle→warmbass, sine→flute; env soft,
//                  filtro acolchado y eco de 3 pasos.
//             n64  square→ocarina, sawtooth→strings, triangle→warmbass; env soft y reverb de sala.
//             gc   square→flute, sawtooth→strings, triangle→warmbass; reverb grande y poco eco.
//             wii  square→flute, sawtooth→strings, triangle→warmbass, sine→bell; reverb brillante.
//   fx      { echo: { time | steps, feedback, mix, tone }, reverb: { time, mix, decay },
//             filter: { type, freq, q } o arreglo de filtros, crush: bits, comp: true }.
//   swing   0 a 0.5: retrasa las corcheas a contratiempo (sabor "shuffle").
//   form    secciones en orden para el loop, p. ej. ['A', 'A', 'B', 'A'], e `intro: ['I']`
//           para las que suenan una vez. Cada voz pone sus `parts`; si una voz es más corta
//           en una sección se rellena con silencio, así TODAS las voces quedan alineadas.
//
// Ejemplo corto:
//   ejemplo: {
//     bpm: 120, era: 'nes', form: ['A', 'A', 'B'],
//     fx: { echo: { steps: 3, feedback: 0.3, mix: 0.2 } },
//     voices: [
//       { wave: 'pulse25', vol: 0.03, vib: true, parts: {
//         A: 'C5/2! E5/2 G5/2. E5/2 (D5 E5)*2 C5/4',
//         B: 'F5/4 A5/4^ G5/6 -/2' } },
//       { wave: 'pulse12', vol: 0.015, arp: 0.03, parts: { A: 'C4+E4+G4/8 G3+B3+D4/8', B: 'F4+A4+C5/16' } },
//       { wave: 'triangle', vol: 0.1, fx: 0, parts: { A: '(C3/2. G3/2.)*4', B: '(F2/2. C3/2.)*4' } },
//       { wave: 'noise', vol: 0.025, parts: { A: '(k/2 h/2 s/2 h/2)*2', B: 'c+k/4 h/4 s/4 h/2 s/1? s/1' } },
//     ],
//   },
// Music.steps(texto) dice cuántos pasos suma una voz; Music.check(nombre) revisa una pista.
// ========================================================================
const Music = (() => {
  let current = null;
  let timer = null;
  let master = null;
  let noiseBuf = null; // ruido blanco (se reusa en todos los golpes)
  let noiseLo = null; // ruido de 1 bit "crujiente" para las eras de 8 bits
  let muted = false;
  const AHEAD = 0.25; // cuánto programamos por adelantado (segundos)
  // Canciones en loop que se detuvieron: si vuelven a sonar poco después (al salir de una
  // pausa, o al volver de una pelea al mismo mapa), siguen donde iban en vez de empezar de cero.
  const held = {};
  // Cosas caras que se generan una sola vez: ondas, respuestas de reverb y curvas de "crush".
  const waveCache = {};
  const irCache = {};
  const crushCache = {};

  const NOTE = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
  const freq = (n) => {
    const m = /^([A-G])([#b]?)(\d)$/.exec(n);
    if (!m) return 0;
    const semi = NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (Number(m[3]) - 4) * 12;
    return 440 * Math.pow(2, semi / 12);
  };
  const DRUMS = 'xkshoctT';

  // ---------- Parseo ----------
  // Expande "( ... )*n" (de adentro hacia afuera) y quita las barras "|".
  function expand(s) {
    const re = /\(([^()]*)\)(?:\s*\*\s*(\d+))?/g;
    let out = s;
    let prev;
    do {
      prev = out;
      out = out.replace(re, (m, body, n) => Array(Number(n || 1)).fill(body).join(' '));
    } while (out !== prev);
    return out.replace(/\|/g, ' ');
  }

  const TOK = /^([^/!?._^]+)(?:\/(\d+(?:\.\d+)?))?([!?._^]*)$/;
  function parse(src) {
    const s = expand(Array.isArray(src) ? src.join(' ') : String(src || ''));
    return s.trim().split(/\s+/).filter(Boolean).map((tok) => {
      const m = TOK.exec(tok);
      const n = m ? m[1] : tok.split('/')[0];
      const d = m ? Number(m[2] || 1) : Number(tok.split('/')[1]);
      const mods = m ? m[3] : '';
      const parts = n === '-' ? [] : n.split('+');
      return {
        n, d: d > 0 ? d : 1, parts, fs: parts.map(freq),
        acc: mods.includes('!') ? 1.5 : mods.includes('?') ? 0.5 : 1,
        stac: mods.includes('.'), ten: mods.includes('_'), glide: mods.includes('^'),
      };
    });
  }
  const total = (evs) => evs.reduce((a, e) => a + e.d, 0);
  const steps = (src) => total(parse(src));

  // Arma intro y loop de cada voz. Con `form`, rellena cada sección hasta la voz más larga.
  function sequences(track) {
    if (!track.form) {
      return track.voices.map((v) => ({ intro: v.intro ? parse(v.intro) : null, notes: parse(v.notes) }));
    }
    const intro = Array.isArray(track.intro) ? track.intro : [];
    const len = {};
    [...intro, ...track.form].forEach((s) => {
      len[s] = Math.max(0, ...track.voices.map((v) => (v.parts ? steps(v.parts[s]) : 0)));
    });
    const build = (v, list) => list.flatMap((s) => {
      const evs = parse(v.parts[s]);
      const pad = len[s] - total(evs);
      if (pad > 0) evs.push(parse(`-/${pad}`)[0]);
      return evs;
    });
    return track.voices.map((v) => {
      if (!v.parts) return { intro: v.intro ? parse(v.intro) : null, notes: parse(v.notes) };
      return {
        intro: intro.length ? build(v, intro) : (v.intro ? parse(v.intro) : null),
        notes: build(v, track.form),
      };
    });
  }

  // ---------- Ondas ----------
  // Serie de Fourier de un pulso con ciclo de trabajo `duty` (12.5 %, 25 %, 50 %).
  function pulse(duty) {
    const real = new Float32Array(64);
    const imag = new Float32Array(64);
    for (let n = 1; n < 64; n++) real[n] = (4 / (n * Math.PI)) * Math.sin(n * Math.PI * duty);
    return [real, imag];
  }
  // El navegador normaliza cada PeriodicWave a pico 1, y un pulso angosto tiene el pico de un
  // solo lado: quedaría mucho más bajito que 'square'. Esta ganancia lo devuelve al volumen de
  // un pulso real (misma amplitud, distinto timbre, como en la NES). pulse50 = 'square'.
  function peakOf([real, imag]) {
    let pk = 0;
    for (let k = 0; k < 512; k++) {
      let x = 0;
      for (let n = 1; n < real.length; n++) x += real[n] * Math.cos((2 * Math.PI * n * k) / 512) + imag[n] * Math.sin((2 * Math.PI * n * k) / 512);
      pk = Math.max(pk, Math.abs(x));
    }
    return pk;
  }
  const gainCache = {};
  const waveGain = (wave) => {
    if (!/^pulse(12|25)$/.test(wave)) return 1;
    if (!gainCache[wave]) gainCache[wave] = peakOf(WAVES[wave]()) / peakOf(pulse(0.5));
    return gainCache[wave];
  };
  // Armónicos en seno: [fundamental, 2.º, 3.º, ...].
  function harm(amps) {
    const real = new Float32Array(amps.length + 1);
    const imag = new Float32Array(amps.length + 1);
    amps.forEach((a, i) => { imag[i + 1] = a; });
    return [real, imag];
  }
  const series = (n, f) => Array.from({ length: n }, (_, i) => f(i + 1));
  // Onda programable de Game Boy: 32 muestras de 4 bits (aquí, medio seno: delgada y nasal).
  function gbTable() {
    const x = Array.from({ length: 32 }, (_, k) => (k < 16 ? Math.round(15 * Math.sin((Math.PI * k) / 16)) : 0));
    const real = new Float32Array(16);
    const imag = new Float32Array(16);
    for (let n = 1; n < 16; n++) {
      for (let k = 0; k < 32; k++) {
        real[n] += (x[k] * Math.cos((2 * Math.PI * n * k) / 32)) / 16;
        imag[n] += (x[k] * Math.sin((2 * Math.PI * n * k) / 32)) / 16;
      }
    }
    return [real, imag];
  }
  const WAVES = {
    pulse12: () => pulse(0.125),
    pulse25: () => pulse(0.25),
    pulse50: () => pulse(0.5),
    gbwave: gbTable,
    organ: () => harm([1, 0.8, 0.55, 0.4, 0, 0.3, 0, 0.22]),
    brass: () => harm(series(16, (n) => (n === 1 ? 1 : 0.9 / Math.pow(n, 0.9)))),
    strings: () => harm(series(24, (n) => 1 / Math.pow(n, 1.25))),
    flute: () => harm([1, 0.22, 0.1, 0.03]),
    ocarina: () => harm([1, 0.06, 0.18, 0.02, 0.05]),
    warmbass: () => harm([1, 0.5, 0.22, 0.08]),
    bell: () => harm([1, 0, 0, 0.45, 0, 0, 0, 0, 0, 0.22]),
    vox: () => harm([0.6, 1, 0.75, 0.35, 0.2, 0.12, 0.08]),
    snes: () => harm(series(12, (n) => (n === 1 ? 1 : 0.6 / Math.pow(n, 1.1)))),
  };
  const NATIVE = { square: 1, triangle: 1, sawtooth: 1, sine: 1 };
  function periodic(c, wave) {
    if (!wave) return null;
    if (typeof wave === 'string' && (NATIVE[wave] || !WAVES[wave])) return null;
    if (!c.createPeriodicWave) return null;
    const key = typeof wave === 'string' ? wave : JSON.stringify(wave);
    if (!waveCache[key]) {
      const [real, imag] = typeof wave === 'string' ? WAVES[wave]() : harm(wave);
      waveCache[key] = c.createPeriodicWave(real, imag);
    }
    return waveCache[key];
  }

  // ---------- Envolventes, vibrato y eras ----------
  const ENVS = {
    chip: { a: 0.002, d: 0.05, s: 0.75, r: 0.03 },
    pluck: { a: 0.003, d: 0.18, s: 0.12, r: 0.08 },
    stab: { a: 0.002, d: 0.07, s: 0.35, r: 0.04 },
    organ: { a: 0.006, d: 0.01, s: 1, r: 0.04 },
    soft: { a: 0.03, d: 0.12, s: 0.7, r: 0.15 },
    pad: { a: 0.25, d: 0.3, s: 0.75, r: 0.6 },
    swell: { a: 0.5, d: 0.1, s: 0.9, r: 0.4 },
    bell: { a: 0.002, d: 0.9, s: 0, r: 0.4 },
    bass: { a: 0.004, d: 0.12, s: 0.6, r: 0.05 },
  };
  const envOf = (e) => {
    if (!e) return null;
    if (typeof e === 'string') return ENVS[e] || null;
    return { a: 0.005, d: 0.1, s: 0.8, r: 0.05, ...e };
  };
  const VIBS = {
    light: { rate: 5, depth: 0.12, delay: 0.25 },
    normal: { rate: 5.5, depth: 0.25, delay: 0.2 },
    wide: { rate: 6, depth: 0.5, delay: 0.15 },
    slow: { rate: 4, depth: 0.3, delay: 0.4 },
  };
  const vibOf = (v) => {
    if (!v) return null;
    if (v === true) return VIBS.normal;
    if (typeof v === 'string') return VIBS[v] || VIBS.normal;
    return { ...VIBS.normal, ...v };
  };

  // Presets de consola. `waves` traduce las ondas genéricas a las de esa consola.
  const ERAS = {
    // Game Boy: 2 pulsos, la onda programable delgada, ruido de 1 bit y mezcla algo cruda.
    gb: {
      waves: { square: 'pulse50', sawtooth: 'pulse25', triangle: 'gbwave', sine: 'gbwave' },
      env: 'chip', kit: 'lofi', arp: 0.033, vib: { rate: 6, depth: 0.15, delay: 0.2 },
      fx: { filter: [{ type: 'highpass', freq: 120 }, { type: 'lowpass', freq: 7500 }], crush: 8 },
    },
    // NES: pulsos 12/25/50, triángulo para el bajo y ruido de 1 bit. Sin eco.
    nes: {
      waves: { sawtooth: 'pulse25', sine: 'triangle' },
      env: 'chip', kit: 'lofi', arp: 0.033, vib: { rate: 5.5, depth: 0.2, delay: 0.25 },
      fx: { filter: [{ type: 'highpass', freq: 90 }, { type: 'lowpass', freq: 12000 }] },
    },
    // Super NES: ondas ricas filtradas (las muestras suenan "acolchadas") y el famoso eco.
    snes: {
      waves: { square: 'snes', sawtooth: 'strings', triangle: 'warmbass', sine: 'flute' },
      env: 'soft', kit: 'full', arp: 0.045, vib: { rate: 5, depth: 0.22, delay: 0.3 },
      fx: { filter: { type: 'lowpass', freq: 7000 }, echo: { steps: 3, feedback: 0.4, mix: 0.28, tone: 2500 }, comp: true },
    },
    // N64: suave, ocarina y cuerdas, reverb de sala.
    n64: {
      waves: { square: 'ocarina', sawtooth: 'strings', triangle: 'warmbass', sine: 'flute' },
      env: 'soft', kit: 'full', arp: 0.05, vib: { rate: 5, depth: 0.18, delay: 0.35 },
      fx: { filter: { type: 'lowpass', freq: 9000 }, reverb: { time: 1.6, mix: 0.22 }, comp: true },
    },
    // GameCube: limpio, flauta y cuerdas, reverb grande con un poquito de eco.
    gc: {
      waves: { square: 'flute', sawtooth: 'strings', triangle: 'warmbass', sine: 'sine' },
      env: 'soft', kit: 'full', arp: 0.05, vib: { rate: 4.8, depth: 0.15, delay: 0.35 },
      fx: { reverb: { time: 2.2, mix: 0.28 }, echo: { steps: 4, feedback: 0.2, mix: 0.1 }, comp: true },
    },
    // Wii: brillante y limpio, campanitas y reverb.
    wii: {
      waves: { square: 'flute', sawtooth: 'strings', triangle: 'warmbass', sine: 'bell' },
      env: 'soft', kit: 'full', arp: 0.05, vib: { rate: 5, depth: 0.12, delay: 0.3 },
      fx: { filter: { type: 'lowpass', freq: 12000 }, reverb: { time: 1.8, mix: 0.25 }, comp: true },
    },
  };

  // Mezcla la voz con su era y deja todo listo para tocar.
  function resolveVoice(track, v, i) {
    const era = ERAS[track.era];
    const r = { ...v };
    const drums = r.wave === 'noise' || r.wave === 'drums';
    if (era) {
      if (typeof r.wave === 'string' && era.waves[r.wave]) r.wave = era.waves[r.wave];
      if (!drums && r.env === undefined) r.env = era.env;
      if (!drums && i === 0 && r.vib === undefined) r.vib = era.vib;
      if (r.kit === undefined) r.kit = era.kit;
      if (r.arp === undefined) r.arp = era.arp;
    }
    r.drums = drums;
    r.vol = (r.vol === undefined ? 0.03 : r.vol) * waveGain(r.wave);
    r.envR = envOf(r.env);
    r.vibR = vibOf(r.vib);
    r.tr = Math.pow(2, (r.transpose || 0) / 12);
    return r;
  }

  function ctx() { return Sfx.unlock(); }

  function setup(c) {
    if (master) return;
    master = c.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(c.destination);
    const n = Math.floor(c.sampleRate * 1.5);
    noiseBuf = c.createBuffer(1, n, c.sampleRate);
    noiseLo = c.createBuffer(1, n, c.sampleRate);
    const data = noiseBuf.getChannelData(0);
    const lo = noiseLo.getChannelData(0);
    let bit = 1;
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
      if (i % 3 === 0) bit = Math.random() < 0.5 ? -0.8 : 0.8; // 1 bit, sostenido 3 muestras
      lo[i] = bit;
    }
  }

  // ---------- Efectos de la pista ----------
  // Respuesta de reverb inventada: ruido estéreo que se apaga (se genera una vez por duración).
  function impulse(c, time, decay) {
    const key = `${time}|${decay}`;
    if (irCache[key]) return irCache[key];
    const len = Math.max(1, Math.floor(c.sampleRate * time));
    const b = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    irCache[key] = b;
    return b;
  }
  function crushCurve(bits) {
    if (crushCache[bits]) return crushCache[bits];
    const levels = Math.pow(2, bits - 1);
    const curve = new Float32Array(4096);
    for (let i = 0; i < curve.length; i++) {
      const x = (i / (curve.length - 1)) * 2 - 1;
      curve[i] = Math.round(x * levels) / levels;
    }
    crushCache[bits] = curve;
    return curve;
  }
  function biquad(c, f) {
    const b = c.createBiquadFilter();
    b.type = f.type || 'lowpass';
    b.frequency.value = f.freq || 2000;
    if (f.q !== undefined) b.Q.value = f.q;
    return b;
  }

  // Grafo de la pista: voces → mezcla → (filtro, crush, compresor) → master; y una "send" al eco/reverb.
  function buildGraph(c, track, step) {
    const era = ERAS[track.era];
    const fx = track.fx === false ? {} : { ...(era ? era.fx : {}), ...(track.fx || {}) };
    const mix = c.createGain();
    const out = c.createGain();
    out.gain.value = track.vol === undefined ? 1 : track.vol;
    let node = mix;
    const chain = (n) => { node.connect(n); node = n; };
    (Array.isArray(fx.filter) ? fx.filter : fx.filter ? [fx.filter] : []).forEach((f) => chain(biquad(c, f)));
    if (fx.crush && c.createWaveShaper) {
      const ws = c.createWaveShaper();
      ws.curve = crushCurve(fx.crush);
      chain(ws);
    }
    if (fx.comp && c.createDynamicsCompressor) {
      // Compresor suave para que el eco/reverb no sature. El compresor de WebAudio sube el
      // volumen solo ("makeup gain" = (1/salida a 0 dB)^0.6); lo devolvemos para no cambiar la mezcla.
      const thr = -10;
      const ratio = 2.5;
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = thr;
      comp.knee.value = 6;
      comp.ratio.value = ratio;
      comp.attack.value = 0.005;
      comp.release.value = 0.2;
      chain(comp);
      const back = c.createGain();
      back.gain.value = Math.pow(Math.pow(10, (thr * (1 - 1 / ratio)) / 20), 0.6);
      chain(back);
    }
    node.connect(out);
    out.connect(master);
    let send = null;
    let tail = 0.5;
    if (fx.echo || (fx.reverb && c.createConvolver)) {
      send = c.createGain();
      if (fx.echo) {
        const e = fx.echo;
        const time = Math.min(1.4, e.time || (e.steps || 3) * step);
        const dl = c.createDelay(1.5);
        dl.delayTime.value = time;
        const fb = c.createGain();
        fb.gain.value = Math.min(0.85, e.feedback === undefined ? 0.35 : e.feedback);
        const tone = biquad(c, { type: 'lowpass', freq: e.tone || 3500 });
        const wet = c.createGain();
        wet.gain.value = e.mix === undefined ? 0.25 : e.mix;
        send.connect(dl);
        dl.connect(tone);
        tone.connect(fb);
        fb.connect(dl);
        tone.connect(wet);
        wet.connect(mix);
        tail = Math.max(tail, time * 8);
      }
      if (fx.reverb && c.createConvolver) {
        const r = fx.reverb;
        const conv = c.createConvolver();
        conv.buffer = impulse(c, r.time || 1.8, r.decay || 3);
        const wet = c.createGain();
        wet.gain.value = r.mix === undefined ? 0.25 : r.mix;
        send.connect(conv);
        conv.connect(wet);
        wet.connect(mix);
        tail = Math.max(tail, (r.time || 1.8) + 0.3);
      }
    }
    return { mix, send, out, tail: Math.min(tail, 6) };
  }

  // Cada voz tiene su "bus": filtro y paneo propios, y cuánto manda al eco/reverb.
  function attachVoice(c, g, v) {
    v.bus = c.createGain();
    let node = v.bus;
    if (v.filter) {
      const f = biquad(c, typeof v.filter === 'number' ? { freq: v.filter } : v.filter);
      node.connect(f);
      node = f;
    }
    if (v.pan && c.createStereoPanner) {
      const p = c.createStereoPanner();
      p.pan.value = v.pan;
      node.connect(p);
      node = p;
    }
    node.connect(g.mix);
    const amt = v.fx === undefined ? 1 : v.fx;
    if (g.send && amt > 0) {
      const s = c.createGain();
      s.gain.value = amt;
      node.connect(s);
      s.connect(g.send);
    }
    v.filters = {}; // filtros de batería compartidos (se crean al primer golpe)
  }

  // ---------- Tocar ----------
  function drumFilter(c, v, kind) {
    if (!v.filters[kind]) {
      const f = kind === 'bp' ? biquad(c, { type: 'bandpass', freq: 1800, q: 0.7 }) :
        biquad(c, { type: 'highpass', freq: kind === 'hp' ? 7000 : 3500 });
      f.connect(v.bus);
      v.filters[kind] = f;
    }
    return v.filters[kind];
  }

  function drum(c, v, kind, t, vol) {
    const lofi = v.kit === 'lofi';
    const noise = (dest, peak, decay, off) => {
      const src = c.createBufferSource();
      src.buffer = lofi ? noiseLo : noiseBuf;
      const g = c.createGain();
      g.gain.setValueAtTime(peak, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      src.connect(g);
      g.connect(dest);
      src.start(t, off === undefined ? Math.random() * 0.3 : off);
      src.stop(t + decay + 0.02);
    };
    const tone = (type, f0, f1, peak, decay) => {
      const o = c.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(f1, t + decay * 0.6);
      const g = c.createGain();
      g.gain.setValueAtTime(peak, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      o.connect(g);
      g.connect(v.bus);
      o.start(t);
      o.stop(t + decay + 0.02);
    };
    const body = lofi ? 'triangle' : 'sine';
    switch (kind) {
      case 'x': noise(v.bus, vol, 0.06, 0); break; // el golpe de siempre
      case 'k': tone(body, lofi ? 110 : 150, 42, vol * 4.5, lofi ? 0.12 : 0.22); break;
      case 's':
        noise(drumFilter(c, v, 'bp'), vol * 1.8, lofi ? 0.1 : 0.15);
        tone('triangle', 220, 160, vol * 1.6, 0.07);
        break;
      case 'h': noise(drumFilter(c, v, 'hp'), vol * 1.1, 0.035); break;
      case 'o': noise(drumFilter(c, v, 'hp'), vol * 0.9, 0.24); break;
      case 'c': noise(drumFilter(c, v, 'hpc'), vol * 0.9, 1.1); break;
      case 't': tone(body, 260, 130, vol * 3.2, 0.2); break;
      case 'T': tone(body, 160, 75, vol * 3.6, 0.28); break;
      default: break;
    }
  }

  // Envolvente ADSR con rampas (sin cancelAndHold, que no está en todos los navegadores).
  function adsr(p, peak, t, len, e) {
    const a = Math.max(0.001, e.a);
    const d = Math.max(0.001, e.d);
    const sus = Math.max(0.0001, peak * e.s);
    const r = Math.max(0.005, e.r);
    p.setValueAtTime(0, t);
    if (len <= a) {
      p.linearRampToValueAtTime(Math.max(0.0001, (peak * len) / a), t + len);
    } else {
      p.linearRampToValueAtTime(peak, t + a);
      if (len < a + d) {
        p.exponentialRampToValueAtTime(Math.max(0.0001, peak * Math.pow(sus / peak, (len - a) / d)), t + len);
      } else {
        p.exponentialRampToValueAtTime(sus, t + a + d);
        p.setValueAtTime(sus, t + len);
      }
    }
    p.exponentialRampToValueAtTime(0.0001, t + len + r);
    return len + r;
  }

  function arpOrder(fs, mode) {
    if (mode === 'down') return fs.slice().reverse();
    if (mode === 'updown' && fs.length > 2) return fs.concat(fs.slice(1, -1).reverse());
    return fs;
  }

  function playNote(c, v, ev, t, dur) {
    if (!ev.parts.length) return;
    const vol = v.vol * ev.acc;
    if (v.drums) {
      ev.parts.forEach((k) => { if (DRUMS.includes(k)) drum(c, v, k, t, vol); });
      return;
    }
    const fs = ev.fs.filter((f) => f > 0).map((f) => f * v.tr);
    if (!fs.length) return;
    const len = dur * (ev.stac ? 0.45 : ev.ten ? 0.98 : (v.legato || 0.85));
    const poly = v.poly && fs.length > 1;
    const uni = v.unison ? [-v.unison / 2, v.unison / 2] : [0];
    const peak = vol * (poly ? 1 / Math.sqrt(fs.length) : 1) * (uni.length > 1 ? 0.7 : 1);
    const g = c.createGain();
    g.connect(v.bus);
    let end = len;
    if (v.envR) {
      end = adsr(g.gain, peak, t, len, v.envR);
    } else {
      // La envolvente de siempre: sostiene y cae al final.
      g.gain.setValueAtTime(peak, t);
      g.gain.setValueAtTime(peak, t + len * 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    }
    // Vibrato: un LFO por nota que entra después del retraso (solo si la nota es larga).
    let vg = null;
    const vib = v.vibR;
    if (vib && end > vib.delay + 0.05) {
      const lfo = c.createOscillator();
      lfo.frequency.value = vib.rate;
      vg = c.createGain();
      vg.gain.setValueAtTime(0, t);
      vg.gain.setValueAtTime(0, t + vib.delay);
      vg.gain.linearRampToValueAtTime(vib.depth * 100, t + vib.delay + 0.15);
      lfo.connect(vg);
      lfo.start(t);
      lfo.stop(t + end + 0.02);
    }
    const wave = periodic(c, v.wave);
    const arp = !poly && fs.length > 1;
    const slideT = ev.glide ? (v.slide || 0.06) : v.slide;
    (poly ? fs : [fs[0]]).forEach((f) => uni.forEach((dt) => {
      const o = c.createOscillator();
      if (wave) o.setPeriodicWave(wave);
      else o.type = NATIVE[v.wave] ? v.wave : 'square';
      if (dt) o.detune.setValueAtTime(dt, t);
      if (arp) {
        const seq = arpOrder(fs, v.arpMode);
        const rate = Math.max(0.01, v.arp || 0.03);
        for (let k = 0, tt = t; tt < t + end && k < 96; k++, tt += rate) o.frequency.setValueAtTime(seq[k % seq.length], tt);
      } else if (slideT && v.prev && v.prev !== f) {
        o.frequency.setValueAtTime(v.prev, t);
        o.frequency.exponentialRampToValueAtTime(f, t + Math.min(slideT, len));
      } else {
        o.frequency.setValueAtTime(f, t);
      }
      if (vg) vg.connect(o.detune);
      o.connect(g);
      o.start(t);
      o.stop(t + end + 0.02);
    }));
    v.prev = arp ? fs[fs.length - 1] : fs[0];
  }

  function tick() {
    const c = ctx();
    if (!c || !current) return;
    const step = 60 / current.bpm / 4;
    let ended = 0;
    current.voices.forEach((v) => {
      if (v.dead) { ended++; return; }
      while (v.next < c.currentTime + AHEAD) {
        if (v.i >= v.seq.length) {
          if (v.seq !== v.notes) { v.seq = v.notes; v.i = 0; v.pos = 0; continue; } // terminó la intro
          if (!current.loop || !v.notes.length) { ended++; return; }
          v.i = 0;
          v.pos = 0;
        }
        const ev = v.seq[v.i++];
        // Swing: las corcheas a contratiempo (paso 2 de cada 4) llegan un poquito tarde.
        const sw = current.swing && v.pos % 4 === 2 ? current.swing * 2 * step : 0;
        playNote(c, v, ev, v.next + sw, ev.d * step - sw);
        v.next += ev.d * step;
        v.pos += ev.d;
      }
    });
    if (!current.loop && ended === current.voices.length) stop();
  }

  function start(c, cur) {
    cur.graph = buildGraph(c, cur.track, 60 / cur.bpm / 4);
    cur.voices.forEach((v) => attachVoice(c, cur.graph, v));
    current = cur;
    tick();
    timer = setInterval(tick, 50);
  }

  function play(name) {
    const track = TRACKS[name];
    if (!track) return;
    if (current && current.name === name) return;
    const h = held[name];
    const back = h && performance.now() - h.at < 120000 ? h : null;
    stop();
    const c = ctx();
    if (!c) return;
    setup(c);
    const t0 = c.currentTime + 0.05;
    if (back) {
      // Cada voz conserva cuánto le faltaba para su siguiente nota, así siguen juntas.
      back.voices.forEach((v) => { v.next = t0 + Math.max(0, v.next - back.ctxAt); });
      start(c, back);
      return;
    }
    const seqs = sequences(track);
    start(c, {
      name, track, bpm: track.bpm, loop: track.loop !== false, swing: track.swing || 0,
      voices: track.voices.map((v, i) => {
        const r = resolveVoice(track, v, i);
        const { intro, notes } = seqs[i];
        const dead = !notes.length && !(intro && intro.length);
        return { ...r, notes, seq: intro && intro.length ? intro : notes, i: 0, pos: 0, next: t0, dead };
      }),
    });
  }

  function stop() {
    const c = ctx();
    if (current && current.loop) {
      held[current.name] = { ...current, at: performance.now(), ctxAt: c ? c.currentTime : 0 };
    }
    if (current && current.graph) {
      // Deja sonar la cola del eco/reverb y luego suelta los nodos de la pista.
      const g = current.graph;
      setTimeout(() => { try { g.out.disconnect(); } catch (e) { /* ya estaba suelto */ } }, (AHEAD + g.tail) * 1000);
    }
    clearInterval(timer);
    timer = null;
    current = null;
  }

  // Revisa una pista: pasos de intro y loop por voz, y si los loops quedan alineados.
  function check(name) {
    const track = TRACKS[name];
    if (!track) return null;
    const seqs = sequences(track);
    const loops = seqs.map((s) => total(s.notes));
    return {
      intro: seqs.map((s) => (s.intro ? total(s.intro) : 0)),
      loop: loops,
      aligned: loops.every((n) => n === loops[0]),
    };
  }

  return {
    play,
    stop,
    steps,
    check,
    parse,
    eras: Object.keys(ERAS),
    get playing() { return current && current.name; },
    set muted(v) {
      muted = v;
      if (master) master.gain.value = v ? 0 : 1;
    },
  };
})();

// ---------- Pistas ----------
const rep = (s, n) => Array(n).fill(s).join(' ');

const TRACKS = {
  // Pueblo: alegre y pegajosa (Do mayor). Muestra lo que puede hacer el motor: pulso 25 %
  // con vibrato, bajo saltarín en staccato, arpegios de pulso 12 %, un pad que entra en la
  // segunda vuelta, batería completa y eco. Forma A A' B A (8 compases cada una).
  // Ojo: el final (fin-data.js) usa voices[0] y voices[1] como texto y FIN_MELODIA son las
  // primeras 8 notas de la melodía (E G A G E D C D): no cambiarlas.
  town: (() => {
    // Acordes por compás. Las secciones A terminan distinto (A1 con anacrusa, A2 cierra arriba).
    const melA = 'E5/2! G5/2 A5/2. G5/2 E5/3 D5/1 C5/2 D5/2 | E5/4 A4/2. C5/2 E5/2 D5/2 C5/4 | ' +
      'F5/2! A5/2 C6/2. A5/2 G5/3 F5/1 E5/2 F5/2 | G5/6 -/2 B5/2. A5/2. G5/2 F5/2 | ' +
      'E5/2! G5/2 A5/2. G5/2 E5/3 D5/1 C5/2 D5/2 | E5/2 G#5/2 B5/2 G#5/2 A5/4! E5/2 C5/2 | ' +
      'F5/2 E5/2 D5/2 C5/2 D5/2 E5/2 B4/2 D5/2 |';
    const melA1 = `${melA} C5/8 -/2 G4/2. A4/2. B4/2.`;
    const melA2 = `${melA} C5/4 E5/2 G5/2 C6/4! -/4`;
    const melB = 'A5/4 G5/2 F5/2 C6/6^ A5/2 | G5/4 E5/2 C5/2 G5/6 E5/2 | F5/2 E5/2 D5/2 F5/2 A5/4 F5/2 D5/2 | ' +
      'B4/2 D5/2 G5/2 F5/2 E5/2 D5/2 B4/4 | C5/2 E5/2 A5/4! G5/2 E5/2 C5/4 | D5/2 F5/2 A5/4 C6/2 A5/2 F5/4 | ' +
      'D6/2 C6/2 B5/2 A5/2 G5/2 F5/2 E5/2 D5/2 | G5/8_ -/2 G4/2. A4/2. B4/2.';
    // Bajo: raíz, quinta y octava. En A rebota en staccato; en B camina en negras.
    const R = { C: ['C3', 'G3', 'C4'], Am: ['A2', 'E3', 'A3'], F: ['F2', 'C3', 'F3'], G: ['G2', 'D3', 'G3'], E: ['E2', 'B2', 'E3'], Dm: ['D3', 'A3', 'D4'] };
    const half = (c) => { const [r, f, o] = R[c]; return `${r}/3 ${r}/1. ${f}/2. ${o}/2`; };
    const bnc = (c) => `${half(c)} ${half(c)}`;
    const walk = (c) => { const [r, f, o] = R[c]; return `${r}/4 ${f}/4 ${o}/4 ${f}/4`; };
    const walkH = (c) => { const [r, , o] = R[c]; return `${r}/4 ${o}/4`; };
    const basA = ['C', 'Am', 'F', 'G', 'C', 'E'].map(bnc).join(' ') + ` ${half('F')} ${half('G')} ${bnc('C')}`;
    const basB = ['F', 'C', 'Dm', 'G', 'Am', 'F'].map(walk).join(' ') + ` ${walkH('Dm')} ${walkH('G')} ${walk('G')}`;
    // Arpegios: en A golpecitos a contratiempo, en B el acorde entero arpegiado.
    const CH = { C: 'E4+G4+C5', Am: 'E4+A4+C5', F: 'F4+A4+C5', G: 'D4+G4+B4', E: 'E4+G#4+B4', Dm: 'D4+F4+A4' };
    const off = (c) => `(-/2 ${CH[c]}/2.)*2`;
    const arpA = ['C', 'Am', 'F', 'G', 'C', 'E'].map((c) => `${off(c)} ${off(c)}`).join(' ') + ` ${off('F')} ${off('G')} ${CH.C}/8 -/8`;
    const arpB = ['F', 'C', 'Dm', 'G', 'Am', 'F'].map((c) => `${CH[c]}/16`).join(' ') + ` ${CH.Dm}/8 ${CH.G}/8 ${CH.G}/16`;
    // Pad: calla en A1, segunda voz en A2, acordes largos en B.
    const padA2 = 'G4/16 C5/16 A4/16 B4/16 G4/16 G#4/16 A4/8 B4/8 C5/16';
    const padB = 'F4+A4/16 E4+G4/16 F4+A4/16 D4+G4/16 E4+A4/16 F4+A4/16 F4+A4/8 D4+G4/8 D4+G4+B4/16';
    // Batería: bombo, tarola y hi-hats; platillo al empezar cada sección y redoble al final.
    const groove = 'k/2 h/2 s/2 h/2 k/2 k/2 s/2 h/1 h/1';
    const fill = 'k/2 h/2 s/2 h/2 s/1? s/1 t/2 t/2! T/2!';
    const drA = `c+${groove} (${groove})*6 ${fill}`;
    const drB = 'c+k/2 h/2 o/4 k/2 h/2 s/4 (k/2 h/2 o/4 k/2 h/2 s/4)*6 ' + fill;
    return {
      bpm: 112,
      fx: { echo: { steps: 3, feedback: 0.28, mix: 0.2 } },
      voices: [
        { wave: 'pulse25', vol: 0.036, env: 'chip', vib: { rate: 5.5, depth: 0.18, delay: 0.22 }, notes: [melA1, melA2, melB, melA1].join(' ') },
        { wave: 'triangle', vol: 0.1, fx: 0, notes: [basA, basA, basB, basA].join(' ') },
        { wave: 'pulse12', vol: 0.02, env: 'stab', arp: 0.035, fx: 0.6, notes: [arpA, arpA, arpB, arpA].join(' ') },
        { wave: 'pulse25', vol: 0.016, env: 'pad', poly: true, filter: 2200, vib: 'light', notes: ['-/128', padA2, padB, '-/128'].join(' ') },
        { wave: 'noise', vol: 0.02, kit: 'full', fx: 0.15, notes: [drA, drA, drB, drA].join(' ') },
      ],
    };
  })(),

  // Título: misteriosa y con ganas de aventura.
  title: {
    bpm: 96,
    voices: [
      {
        wave: 'square', vol: 0.03,
        notes: 'A4/4 C5/4 E5/4 D5/2 C5/2 B4/4 G4/4 A4/8 E5/4 D5/4 C5/4 B4/4 C5/8 A4/8',
      },
      { wave: 'triangle', vol: 0.09, notes: 'A2/8 A2/8 G2/8 G2/8 F2/8 F2/8 E2/8 E2/8' },
    ],
  },

  // Batalla normal: con energía (La menor).
  battle: {
    bpm: 150,
    voices: [
      {
        wave: 'square', vol: 0.03,
        notes: 'A4 C5 E5 A5/2 G5 E5/2 D5 E5/2 C5 D5/2 B4 C5 ' +
          'A4 C5 E5 A5/2 B5 C6/2 B5 A5/2 G5 E5/4 ' +
          'F5/2 E5 D5/2 C5 D5/2 E5/2 F5/2 G5/4 E5/2 C5/2 D5/4 E5/4 B4/4',
      },
      { wave: 'triangle', vol: 0.1, notes: rep('A2 A3', 8) + ' ' + rep('F2 F3', 8) + ' ' + rep('G2 G3', 8) + ' ' + rep('E2 E3', 8) },
      { wave: 'noise', vol: 0.025, notes: rep('x/2 -/2 x -/1 x/2', 8) },
    ],
  },

  // Jefe: pesada y dramática (Re menor).
  boss: {
    bpm: 138,
    voices: [
      {
        wave: 'square', vol: 0.032,
        notes: 'D5/2 D5 F5/2 D5 G5/2 A5/4 -/2 A5 G5/2 F5 E5/2 C5 D5/6 -/5 ' +
          'A#4/2 D5/2 F5/2 A#5/4 A5/2 G5/2 F5/2 E5/2 C#5/2 E5/2 A5/4 -/6',
      },
      { wave: 'square', vol: 0.018, notes: rep('D4 A3', 8) + ' ' + rep('A#3 F3', 8) + ' ' + rep('C4 G3', 8) + ' ' + rep('A3 E3', 8) },
      { wave: 'triangle', vol: 0.11, notes: rep('D2/2 D3/2', 4) + ' ' + rep('A#1/2 A#2/2', 4) + ' ' + rep('C2/2 C3/2', 4) + ' ' + rep('A1/2 A2/2', 4) },
      { wave: 'noise', vol: 0.03, notes: rep('x x - x x/2 x/2', 8) },
    ],
  },

  // Reto de Tecloides (la pista "de batalla de monstruos"): La menor, urgente, 160 BPM.
  // Abre con 4 golpes y una subida cromática como sirena; bajo de tónica-octava-séptima.
  tecloides: {
    bpm: 160,
    voices: [
      {
        wave: 'square', vol: 0.032,
        intro: '-/4 E5 F5 F#5 G5 G#5 A5 A#5 B5 C6/4',
        notes: 'A5/2 E5 A5 C6/2 B5/2 A5 G5 E5/2 G5/2 A5/2 B5/2 C6/2 D6/2 B5/2 A5/8 ' +
          'C6/2 B5 A5 G5/2 E5/2 F5 G5 A5/2 F5/2 E5/2 D5/2 E5/2 F5/2 G#5/2 A5/8',
      },
      {
        wave: 'triangle', vol: 0.11,
        intro: '-/8 E2/8',
        notes: rep('A2 A3 G3 A3', 4) + ' ' + rep('F2 F3 E3 F3', 4) + ' ' + rep('C3 C4 B3 C4', 4) + ' ' + rep('D2 D3 C3 D3', 2) + ' ' + rep('E2 E3 D3 E3', 2),
      },
      { wave: 'noise', vol: 0.028, intro: 'x x x x -/12', notes: rep('x - x x', 16) },
    ],
  },

  // "¡Casi!": puente a Do mayor cuando al rival le queda poca vida.
  tecloides_casi: {
    bpm: 168,
    voices: [
      {
        wave: 'square', vol: 0.032,
        notes: 'C6/2 G5 C6 E6/2 D6/2 C6 B5 G5/2 B5/2 C6/2 D6/2 E6/2 F6/2 D6/2 C6/8 ' +
          'E6/2 D6 C6 B5/2 G5/2 A5 B5 C6/2 A5/2 G5/2 F5/2 G5/2 A5/2 B5/2 C6/8',
      },
      { wave: 'triangle', vol: 0.11, notes: rep('C3 C4 B3 C4', 4) + ' ' + rep('A2 A3 G3 A3', 4) + ' ' + rep('F2 F3 E3 F3', 4) + ' ' + rep('G2 G3 F3 G3', 4) },
      { wave: 'noise', vol: 0.03, notes: rep('x x x x', 16) },
    ],
  },

  // Minijuegos de arcade: alegre y rápida.
  arcade: {
    bpm: 160,
    voices: [
      {
        wave: 'square', vol: 0.03,
        notes: 'E5 B4 C5 D5/2 C5 B4 A4/2 A4 C5 E5/2 D5 C5 B4/3 C5 D5/2 E5/2 C5/2 A4/2 A4/4 ' +
          '-/2 D5/2 F5 A5/2 G5 F5 E5/3 C5 E5/2 D5 C5 B4/2 B4 C5 D5/2 E5/2 C5/2 A4/2 A4/4',
      },
      { wave: 'triangle', vol: 0.1, notes: rep('A2 A3', 8) + ' ' + rep('E2 E3', 8) + ' ' + rep('D2 D3', 8) + ' ' + rep('A2 A3', 8) },
      { wave: 'noise', vol: 0.022, notes: rep('x - x -', 16) },
    ],
  },

  // Mundo 1-1: calipso brincador en Do mayor, 170 BPM (original, al estilo de los plataformeros
  // del NES): melodía sincopada 3+3+2, bajo de triángulo saltarín, golpecitos de pulso 12 % y una
  // parte "subterránea" en Do menor. Forma A A' B A C A' (48 compases, ~68 s).
  // La entrada es el arranque de "Eine kleine Nachtmusik" (Mozart, 1787, dominio público), como el
  // "Game Start" de Mario Bros. (1983); arreglo propio al unísono. Fuente: MarioWiki, "Game Start
  // (Mario Bros.)" (mariowiki.com/Game_Start_(Mario_Bros.)): "a brief arrangement of Eine kleine
  // Nachtmusik: I. Allegro", también en la versión de NES.
  nes11: (() => {
    const down = (s) => s.replace(/([A-G][#b]?)(\d)/g, (m, n, o) => `${n}${o - 1}`);
    // Bajo [raíz, tercera, quinta, octava] y acorde para los golpecitos.
    const B = {
      C: ['C3', 'E3', 'G3', 'C4'], Am: ['A2', 'C3', 'E3', 'A3'], Dm: ['D3', 'F3', 'A3', 'D4'], G7: ['G2', 'B2', 'D3', 'F3'],
      E7: ['E2', 'G#2', 'B2', 'D3'], F: ['F2', 'A2', 'C3', 'F3'], G: ['G2', 'B2', 'D3', 'G3'], CE: ['E2', 'G2', 'C3', 'E3'],
      Fm: ['F2', 'Ab2', 'C3', 'F3'], CG: ['G2', 'C3', 'E3', 'G3'], A7: ['A2', 'C#3', 'E3', 'G3'],
    };
    const CH = {
      C: 'E4+G4+C5', Am: 'E4+A4+C5', Dm: 'F4+A4+D5', G7: 'F4+B4+D5', E7: 'E4+G#4+D5', F: 'F4+A4+C5', G: 'D4+G4+B4',
      CE: 'E4+G4+C5', Fm: 'F4+Ab4+C5', CG: 'E4+G4+C5', A7: 'E4+G4+C#5',
    };
    const halfB = (c) => { const [r, , f, o] = B[c]; return `${r}/3. ${f}/3. ${o}/2`; };
    const barB = (c) => { const [r, t, f] = B[c]; return `${halfB(c)} ${r}/3. ${f}/3. ${t}/2`; };
    const halfS = (c) => `-/2 ${CH[c]}/2. -/1 ${CH[c]}/1. ${CH[c]}/2.`;
    const barS = (c) => `${halfS(c)} -/2 ${CH[c]}/2. -/2 ${CH[c]}/2.`;
    const line = (chords, bar, half) => chords.map((c) => (Array.isArray(c) ? c.map(half).join(' ') : bar(c))).join(' | ');
    const chA = ['C', 'Am', 'Dm', 'G7', 'C', 'E7', ['F', 'G'], 'C'];
    const chB = ['F', 'CE', 'Dm', 'G', 'F', 'Fm', ['CG', 'A7'], ['Dm', 'G7']];
    // Melodía. A: pregunta en Do, respuesta en La menor; B sube por Fa menor hasta el La6.
    const a7 = 'C5/2 E5/1 G5/3! A5/2 G5/3 E5/2 C5/3 | -/2 A5/1 C6/3 B5/2 A5/3 E5/2 -/3 | ' +
      'F5/2 A5/1 D6/3 C6/2 A5/3 F5/2 D5/3 | B4/2 D5/1 G5/3 F5/2 D5/2 B4/2 G4/4 | ' +
      'C5/2 E5/1 G5/3! A5/2 G5/3 E5/2 C5/3 | -/2 G#5/1 B5/3 D6/2 B5/3 G#5/2 E5/3 | ' +
      'A5/2 G5/1 F5/3 A5/2 G5/2 F5/2 E5/2 D5/2 |';
    const melA1 = `${a7} C5/4 -/4 G4/2 A4/2 B4/4`;
    const melA2 = `${a7} C5/3 E5/3 G5/2 C6/4! -/4`;
    const melB = 'A5/4 C6/2 A5/2 F5/4 -/2 G5/2 | E5/4 G5/2 E5/2 C5/6 -/2 | F5/3 F5/3 A5/2 D6/4 C6/2 A5/2 | B5/3 A5/3 G5/2 D5/8 | ' +
      'A5/4 C6/2 A5/2 F6/4 E6/2 D6/2 | C6/3 Ab5/3 F5/2 Ab5/3 C6/3 Eb6/2 | E6/4! D6/2 C6/2 C#6/2 E6/2 G6/2 A6/2 | ' +
      'F6/3 D6/3 A5/2 G5/2 F5/2 D5/2 B4/2';
    const harB = 'C5/8 A4/8 | G4/16 | A4/8 F4/8 | B4/8 D5/8 | C5/16 | C5/8 Ab4/8 | G4/8 C#5/8 | A4/8 B4/8';
    // C: el "subterráneo", riff en staccato con el bajo en octavas de semicorchea.
    const c1 = 'C5/1. -/1 Eb5/1. -/1 F5/1. -/1 G5/2. Bb5/1. -/1 G5/2. F5/2. Eb5/2.';
    const c2 = 'C5/2. -/6 G4/1. Bb4/1. C5/2. -/4';
    const c5 = 'F5/1. -/1 Ab5/1. -/1 Bb5/1. -/1 C6/2. Eb6/1. -/1 C6/2. Bb5/2. Ab5/2.';
    const melC = [c1, c2, c1, c2, c5, c2, c5, 'G5/2. -/2 G5/1. G5/1. -/2 B4/2 D5/2 F5/2 G5/2!'].join(' | ');
    const oct = (lo, hi, n = 8) => rep(`${lo}/1. ${hi}/1.`, n);
    const basC = [oct('C2', 'C3'), oct('C2', 'C3'), oct('C2', 'C3'), oct('C2', 'C3'), oct('F2', 'F3'), oct('C2', 'C3'), oct('F2', 'F3'),
      `${oct('G2', 'G3', 6)} B2/1 C3/1 D3/1 F3/1`].join(' | ');
    // Entrada: Mozart al unísono (melodía, eco una octava abajo y el triángulo dos octavas abajo).
    const intro = 'C5/4 -/2 G4/2 C5/4 -/2 G4/2 | C5/2 G4/2 C5/2 E5/2 G5/8 | F5/4 -/2 D5/2 F5/4 -/2 D5/2 | F5/2 D5/2 B4/2 D5/2 G4/8';
    const groove = 'k/3 h/1 h/2 s/2 k/2 h/1 h/1 s/2 h/2';
    const fill = 'k/2 s/1 s/1 s/2 t/2 t/1 t/1 T/2 s/2! s/2!';
    const drA = `c+${groove} ${rep(groove, 6)} ${fill}`;
    const rock = 'k/2 h/2 s/2 h/2 k/2 k/2 s/2 h/2';
    return {
      bpm: 170, era: 'nes', intro: ['I'], form: ['A1', 'A2', 'B', 'A1', 'C', 'A2'],
      voices: [
        { wave: 'square', vol: 0.032, parts: { I: intro, A1: melA1, A2: melA2, B: melB, C: melC } },
        { wave: 'pulse25', vol: 0.014, env: 'soft', parts: { I: down(intro), B: harB, C: down(melC) } },
        { wave: 'triangle', vol: 0.1, parts: {
          I: down(down(intro)), A1: line(chA, barB, halfB), A2: line(chA, barB, halfB), B: line(chB, barB, halfB), C: basC,
        } },
        { wave: 'pulse12', vol: 0.016, env: 'stab', parts: {
          A1: line(chA, barS, halfS), A2: line(chA, barS, halfS), B: line(chB, barS, halfS), C: `-/112 ${barS('G7')}`,
        } },
        { wave: 'noise', vol: 0.02, parts: {
          I: '-/48 s/1 s/1 s/1 s/1 s/2 s/2 t/2 t/2 T/2! -/2', A1: drA, A2: drA, B: drA, C: `c+${rock} ${rep(rock, 6)} ${fill}`,
        } },
      ],
    };
  })(),

  // Jingle de victoria (no se repite).
  victory: {
    bpm: 150, loop: false,
    voices: [
      { wave: 'square', vol: 0.04, notes: 'C5 E5 G5 C6/3 -/1 G5 C6/8' },
      { wave: 'triangle', vol: 0.1, notes: 'C3/2 G3/2 C4/4 G3/2 C3/6' },
    ],
  },
};

// ¡Apúrate! La misma pista, más rápida y sin la entrada de Mozart, cuando el tiempo baja de 100.
TRACKS.nes11_hurry = { ...TRACKS.nes11, bpm: 230, intro: [] };
