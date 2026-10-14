// MUNDO 5 — Cubo Galáctico (GameCube, 2001). Diseño en docs/LORE.md §8.
// El mundo del giro emocional: el Glitch invoca copias en sombra de los jefes anteriores y,
// en la Estación Visor, Bit descubre que salió del mismo cartucho sin nombre.
//
// Escenas propias (todas en js/scenes/):
//   gc3d.js     3D "plástico pulido" (encima de poly3d.js) + ganchos del combate normal
//   brotes.js   Capitán Brotes: órdenes de colores (y el minijuego Brotitos)
//   escaner.js  Casco Escáner: visor de combate / visor de escaneo
//   sombra.js   Las 4 Copias de Sombra: la mecánica del jefe original resumida a 30 s
//   guante.js   JEFE El Guante Crossover: porcentaje, SMASH, recuperarse y 3 vidas
//   correo.js   Correo de Bellota: cartas con mayúsculas y puntuación
// El pueblo (Barrio Cubo, Alcaldesa Bellota, la caja del sótano) está en js/worlds/gc-pueblo.js.

// Palabras del mundo (§16): frases completas, dos puntos y cambio de contexto.
WORDS.gc = WORDS.gc || ['El cubo tiene manija.', 'Salta Delfinito, salta.', 'rojo: apagar', 'azul: nadar', 'amarillo: saltar',
  'Querido vecino, ¿cómo estás?', 'Hoy llovió en la isla.', 'La fantasmita se escondió en el cuadro.', 'Gracias por tu carta.',
  'Nos vemos en la plaza a las cinco.'];

// Colores fijos extra para los sprites de este mundo (además de a/b/c/d del tema).
const GC_PAL = {
  w: '#FFFFFF', g: '#3BB54A', o: '#F28C28', y: '#F5D547', r: '#E04B4B', s: '#7EC8FF', k: '#8B5E3C',
  i: '#4B3F9E', l: '#8E86D9', n: '#17162B', p: '#C8CBD6', u: '#2B9EDB', e: '#F2C6A0',
};
const gcArt = (rows) => Object.assign(rows, { pal: GC_PAL });

// Base de los enemigos normales: frases con MAYUSCULAS (SHIFT), acentos que cuentan y escenario 3D.
const GC_BASE = {
  theme: 'gc', music: 'gc_battle', caps: true, strictAccents: true, gc: true,
  onEnter: (s, pages) => gcBattleEnter(s, pages),
  onExit: (s) => gcBattleExit(s),
  onWin: (s, info) => gcBattleWin(s, info),
};

// ---------- Tecloide nuevo: Delfinito (GOTA), guiño al nombre clave "Dolphin" ----------
addTecloide('delfinito', {
  name: 'Delfinito', type: 'gota', sprite: 'delfinito', hp: 56,
  desc: 'Un delfín juguetón. Su nombre secreto es Dolphin. No se lo digas a nadie.',
  moves: [move('Salpicón', 'salpica', 30, 'gota'), TECLEO, move('Aro de Agua', 'aro de agua', 42, 'gota'), move('Ola Dolphin', 'ola gigante', 52, 'gota', 'aturdir')],
});

// ---------- Las 4 Copias de Sombra (§8.4) ----------
// Se dibujan con el sprite del jefe original, pero en magenta "de estática".
const GC_SHADOW_PAL = { a: '#FFC2FF', b: '#FF66FF', c: '#B000B0', d: '#2A0030' };
function gcShadowSprite(orig) {
  const src = SPRITES[orig] || SPRITES.guante_gc;
  if (!src) return null;
  const rows = src.map((r) => r);
  const pal = { ...GC_SHADOW_PAL };
  Object.keys(src.pal || {}).forEach((k) => { if (!pal[k]) pal[k] = '#FF00FF'; });
  return Object.assign(rows, { pal });
}

const GC_SHADOW = (id, o) => ({
  name: o.name, sprite: `gc_sombra_${o.kind}`, mode: 'sombra', xp: 26, kind: o.kind, orig: o.orig,
  blurb: o.blurb, keysHint: o.keysHint, sad: o.sad, origTrack: o.origTrack, words: o.words,
});

// ---------- Música del Cubo Galáctico (era 'gc': flauta, cuerdas, bajo cálido y reverb grande) ----------
// Todas las melodías son ORIGINALES, al estilo de los juegos de GameCube, salvo la Danza húngara
// n.º 5 de Brahms (dominio público), que Nintendo puso de verdad en Donkey Konga (2003).
// Las pistas de las zonas de mapa viven en js/worlds/gc-mapa.js y usan estos ayudantes.
// gcBars(['C', 'G'], fn): une lo que devuelve fn por cada acorde (un compás por acorde).
const gcBars = (chords, fn) => chords.map(fn).join(' ');
// Arpegio "de marimba" de un compás de 16 pasos: 4 notas del acorde, de ida y vuelta, en corcheas.
const gcOst = ([a, b, c, d]) => `${a}/2! ${b}/2 ${c}/2 ${d}/2 ${c}/2 ${b}/2 ${c}/2 ${d}/2`;
// Timbres propios de este mundo (arreglos de armónicos que entiende el motor).
const GC_MARIMBA = [1, 0, 0, 0.32, 0, 0, 0, 0, 0, 0.08];
const GC_HARP = [1, 0.45, 0.25, 0.12, 0.06];
const GC_EPIANO = [1, 0.35, 0.08, 0.12, 0, 0.04];
const GC_GAITA = [0.55, 1, 0.85, 0.7, 0.5, 0.38, 0.26, 0.16, 0.1];

const GC_TRACKS = (() => {
  // Batalla normal: la Danza húngara n.º 5 de Brahms (Sol menor, 2/4) con bongos, como en
  // Donkey Konga. El arreglo es nuestro: violín gitano, oom-pah de cuerdas y tambores. 52 compases.
  // Fuentes: Nintendo World Report, lista de canciones de Donkey Konga (EE. UU.)
  //   https://nintendoworldreport.com/news/10006 ("Hungarian Dance #5 in G Minor"), y
  //   https://www.mariowiki.com/Hungarian_Dance_No._5 (Brahms, en todas las versiones del juego).
  const danza = (() => {
    // Compases de 8 pasos (2/4). Tema A: la frase y su respuesta una octava arriba.
    const melA = 'D5/6! G5/2. | Bb5/6! G5/2. | F#5/6 G5/1 A5/1 | G5/8 | Eb5/6! F5/1 G5/1 | D5/8 | ' +
      'C5/1 Bb4/1 Bb4/1 A4/1 A4/3 D5/1 | G4/6 -/2 | ' +
      'D5/6! G5/1 Bb5/1 | D6/6! Bb5/2. | A5/6 Bb5/1 C6/1 | Bb5/8 | ' +
      'Eb5/1 F5/1 G5/1 Eb5/1 D5/1 Eb5/1 F5/1 D5/1 | C5/1 D5/1 Eb5/1 C5/1 Bb4/1 C5/1 D5/1 Bb4/1 | ' +
      'C5/1 Bb4/1 Bb4/1 A4/1 A4/3 D5/1 | G4/4 -/4';
    // Tema B (el "vivace"): golpes cortos, el giro de semicorcheas y el pasaje lento final.
    const melB = 'D6/2. -/2 D6/2. -/2 | Eb6/6! D6/2 | -/2 C6/4 B5/1 C6/1 | D6/1 C6/1 B5/1 D6/1 C6/2. -/2 | ' +
      'C6/2. -/2 C6/2. -/2 | D6/6! C6/2 | -/2 Bb5/4 A5/1 Bb5/1 | C6/1 Bb5/1 A5/1 C6/1 Bb5/2. -/2 | ' +
      'A5/2. -/2 A5/2. -/2 | C6/1 -/1 Bb5/2. -/1 A5/3 | -/1 G5/2. -/2 F#5/1 G5/1 A5/1 | G5/1 F#5/1 A5/1 G5/2. -/2 D6/1 | ' +
      'D5/2 E5/2 F#5/2 A5/2 | -/1 G5/4 F#5/1 G5/1 A5/1 | G5/1 F#5/1 G5/1 A5/1 G5/2. -/2 | G5/2! D5/2! G4/2! -/2';
    const hA = ['Gm', 'Gm', 'D7', 'Gm', 'Cm', 'Gm', 'D7', 'Gm', 'Gm', 'Gm', 'F7', 'Bb', 'Cm', 'Gm', 'D7', 'Gm'];
    const hB = ['G', 'Cm', 'D7', 'G', 'Cm', 'D7', 'Gm', 'Gm', 'D7', 'D7', 'Gm', 'Gm', 'D7', 'Gm', 'D7', 'Gm'];
    const hD = ['Gm', 'Gm', 'D7', 'D7'];
    const BS = { Gm: ['G2', 'D3'], G: ['G2', 'D3'], D7: ['D2', 'A2'], Cm: ['C3', 'G2'], F7: ['F2', 'C3'], Bb: ['Bb2', 'F2'] };
    const CH = { Gm: 'G3+Bb3+D4', G: 'G3+B3+D4', D7: 'F#3+A3+C4', Cm: 'G3+C4+Eb4', F7: 'F3+A3+Eb4', Bb: 'F3+Bb3+D4' };
    // Oom-pah: el bajo en los tiempos, el acorde de cuerdas a contratiempo; en C, más "friss".
    const oom = (h) => gcBars(h, (c) => `${BS[c][0]}/2. -/2 ${BS[c][1]}/2. -/2`);
    const friss = (h) => gcBars(h, (c) => `${BS[c][0]}/1 -/1 ${BS[c][0]}/1. ${BS[c][1]}/1 ${BS[c][1]}/1 -/1 ${BS[c][0]}/1. ${BS[c][1]}/1`);
    const pah = (h) => gcBars(h, (c) => `-/2 ${CH[c]}/2. -/2 ${CH[c]}/2.`);
    // Bongos: agudo-agudo-grave con bombo; el compás 8 de cada frase trae un redoble.
    const bongo = 'k/2 t/1 t/1? T/2 t/1 t/1?';
    const bongoH = 'k+h/1 h/1? t/1 t/1 s+T/2 t/1 h/1?';
    const fill = 't/1 t/1 T/1 T/1 t/1 t/1 T/1! T/1!';
    const drA = `c+k/2 t/1 t/1? T/2 t/1 t/1? ${rep(bongo, 6)} ${fill} ${rep(bongo, 7)} ${fill}`;
    const drC = `c+k+h/1 h/1? t/1 t/1 s+T/2 t/1 h/1? ${rep(bongoH, 6)} ${fill} ${rep(bongoH, 7)} ${fill}`;
    const drD = 't/1 t/1 T/2 t/1 t/1 T/2 | t/1 T/1 t/1 T/1 k+t/2 T/2 | t/1 t/1 T/1 t/1 t/1 T/1 t/1 t/1 | t/1 t/1 T/1 T/1 s/1 s/1 s/1! s/1!';
    return {
      bpm: 136, era: 'gc', intro: ['I'], form: ['A', 'B', 'C', 'D'],
      voices: [
        // Violín gitano con vibrato ancho.
        { wave: 'sawtooth', vol: 0.042, env: { a: 0.01, d: 0.1, s: 0.75, r: 0.08 }, vib: { rate: 6, depth: 0.22, delay: 0.18 },
          parts: { A: melA, B: melB, C: melA, D: '-/32' } },
        // Flauta que dobla el tema una octava abajo en la segunda vuelta.
        { wave: 'square', vol: 0.026, transpose: -12, parts: { C: melA } },
        { wave: 'triangle', vol: 0.1, env: 'bass', fx: 0,
          parts: { I: '-/16', A: oom(hA), B: oom(hB), C: friss(hA), D: oom(hD) } },
        { wave: GC_HARP, vol: 0.026, poly: true, env: 'pluck', fx: 0.5,
          parts: { A: pah(hA), B: pah(hB), C: pah(hA), D: pah(hD) } },
        { wave: 'noise', vol: 0.02, fx: 0.15,
          parts: { I: 't/1 t/1 T/2 t/1 t/1 T/2 | t/1 T/1 t/1 T/1 t/1 t/1 T/1! T/1!', A: drA, B: drA, C: drC, D: drD } },
      ],
    };
  })();

  // Jardín Brotitos (y el Correo): pastoral y curiosa al estilo Pikmin, Re mayor con su
  // toque lidio (Sol#), marimba en ostinato, flauta y percusión de sonaja. 32 compases.
  const jardin = (() => {
    const mA = 'A5/4 F#5/2 E5/2 D5/4 F#5/2 A5/2 | G#5/6 F#5/2 E5/4 -/4 | D5/2 E5/2 F#5/2 A5/2 B5/4 A5/2 F#5/2 | ' +
      'A5/8 -/4 F#5/2 G5/2 | B5/4 G5/2 E5/2 B4/4 E5/2 G5/2 | A5/6 G5/2 F#5/4 C#5/4 | ';
    const melA = `${mA} D5/2 E5/2 F#5/2 G5/2 A5/2 B5/2 D6/2 B5/2 | A5/8 -/8`;
    const melA2 = `${mA} B5/4 A5/2 G5/2 E5/2 F#5/2 G5/2 C#5/2 | D5/8 -/8`;
    const melB = 'B5/6 A5/2 B5/4 D6/4 | C#6/6 A5/2 E5/8 | G5/2 A5/2 B5/2 D6/2 E6/6 D6/2 | C#6/4 B5/2 A5/2 G5/4 E5/4 | ' +
      'F#5/2 A5/2 D6/2 F#6/2! E6/4 D6/4 | D6/6 B5/2 G#5/4 F#5/4 | G5/2 B5/2 D6/2 F#6/2 E6/4 D6/2 B5/2 | A5/4 D6/4 C#6/6 -/2';
    const hA = ['D', 'E/D', 'Bm7', 'Gmaj7', 'Em7', 'F#m7', 'Gmaj7', 'A7sus'];
    const hA2 = ['D', 'E/D', 'Bm7', 'Gmaj7', 'Em7', 'F#m7', 'Gmaj7', 'D'];
    const hB = ['Gmaj7', 'F#m7', 'Em7', 'A7', 'Bm7', 'G#m7b5', 'Gmaj7', 'A7sus'];
    const MA = { D: ['D4', 'A4', 'D5', 'F#5'], 'E/D': ['D4', 'G#4', 'B4', 'E5'], Bm7: ['B3', 'F#4', 'A4', 'D5'],
      Gmaj7: ['G3', 'D4', 'F#4', 'B4'], Em7: ['E4', 'G4', 'B4', 'D5'], 'F#m7': ['F#3', 'C#4', 'E4', 'A4'],
      A7sus: ['A3', 'E4', 'G4', 'D5'], A7: ['A3', 'E4', 'G4', 'C#5'], 'G#m7b5': ['G#3', 'D4', 'F#4', 'B4'] };
    const BA = { D: ['D2', 'A2', 'D3'], 'E/D': ['D2', 'G#2', 'D3'], Bm7: ['B1', 'F#2', 'B2'], Gmaj7: ['G2', 'D3', 'G2'],
      Em7: ['E2', 'B2', 'E3'], 'F#m7': ['F#2', 'C#3', 'F#2'], A7sus: ['A2', 'E3', 'A2'], A7: ['A2', 'E3', 'C#3'], 'G#m7b5': ['G#2', 'D3', 'G#2'] };
    const PAD = { D: 'D4+F#4+A4', 'E/D': 'D4+G#4+B4', Bm7: 'D4+F#4+A4', Gmaj7: 'D4+F#4+B4', Em7: 'D4+G4+B4',
      'F#m7': 'C#4+E4+A4', A7sus: 'D4+E4+A4', A7: 'C#4+E4+G4', 'G#m7b5': 'D4+F#4+B4' };
    const ost = (h) => gcBars(h, (c) => gcOst(MA[c]));
    const bas = (h) => gcBars(h, (c) => `${BA[c][0]}/6 ${BA[c][1]}/2 ${BA[c][2]}/4 ${BA[c][1]}/2. ${BA[c][0]}/2.`);
    const pad = (h) => gcBars(h, (c) => `${PAD[c]}/16`);
    const shk = 'k/2 h/2? h/2 h/1? h/1? s/2? h/2? k/2 h/2?';
    const shkB = 'k/2 h/2? o/2? h/1? h/1? s/2? h/2? k/2 o/2?';
    return {
      bpm: 104, era: 'gc', intro: ['I'], form: ['A', 'A2', 'B', 'A2'],
      voices: [
        { wave: 'square', vol: 0.05, vib: 'light', parts: { A: melA, A2: melA2, B: melB, I: '-/32' } },
        { wave: GC_MARIMBA, vol: 0.03, env: 'pluck', fx: 0.5, pan: -0.25,
          parts: { I: ost(['D', 'E/D']), A: ost(hA), A2: ost(hA2), B: ost(hB) } },
        { wave: 'triangle', vol: 0.09, env: 'bass', fx: 0, parts: { A: bas(hA), A2: bas(hA2), B: bas(hB) } },
        { wave: 'sawtooth', vol: 0.016, poly: true, env: 'pad', filter: 1800, pan: 0.25,
          parts: { A2: pad(hA2), B: pad(hB) } },
        { wave: 'noise', vol: 0.016, fx: 0.2,
          parts: { I: rep('h/2? h/2? h/2 h/2?', 4), A: rep('h/2? h/2? h/2 h/2?', 15) + ' h/2? h/2? t/2? T/2', A2: rep(shk, 8), B: rep(shkB, 7) + ' k/2 h/2? s/2? t/1? t/1? t/2 t/2 T/2 T/2' } },
      ],
    };
  })();

  // Capitán Brotes: marcha de expedición en Fa mayor (silbido, tuba en oom-pah, tarola de
  // desfile y un "glock" para los escuadrones de colores); trío en Si bemol. 32 compases.
  const brotes = (() => {
    const melA = 'C5/2 F5/2 A5/2 F5/2 C6/4 A5/4 | Bb5/2 A5/2 G5/2 A5/2 F5/8 | G5/2 C5/2 E5/2 G5/2 Bb5/4 G5/4 | ' +
      'A5/2 G5/2 F5/2 G5/2 E5/8 | C5/2 F5/2 A5/2 C6/2 F6/4! C6/4 | D6/2 C6/2 Bb5/2 A5/2 G5/4 Bb5/4 | ' +
      'A5/4 G5/2 E5/2 C5/4 E5/4 | F5/6 -/2 F5/2. F5/2. -/4';
    const melB = 'A5/6 F5/2 D5/4 F5/4 | A5/4 D6/4 C6/4 A5/4 | Bb5/6 G5/2 D5/4 G5/4 | Bb5/4 E6/4 D6/4 C6/4 | ' +
      'A5/2 C6/2 F6/4! E6/2 D6/2 C6/4 | F#5/2 A5/2 D6/4 C6/2 A5/2 F#5/4 | G5/2 Bb5/2 D6/2 F6/2 E6/4 C6/4 | F6/4! C6/4 A5/4 C5/4';
    const melC = 'D5/8 F5/4 Bb5/4 | A5/6 G5/2 F5/8 | Eb5/8 F5/4 A5/4 | C6/6 Bb5/2 A5/8 | ' +
      'D6/6 C6/2 Bb5/4 D6/4 | G6/6 F6/2 Eb6/8 | D6/4 C6/4 Bb5/4 A5/4 | G5/4 Bb5/4 C6/4 E5/4';
    const hA = ['F', 'F', 'C7', 'C7', 'F', 'Bb', 'C7', 'F'];
    const hB = ['Dm', 'Dm', 'Gm', 'C7', 'F', 'D7', 'Gm', 'F'];
    const hC = ['Bb', 'Bb', 'F7', 'F7', 'Bb', 'Eb', 'F7', 'C7'];
    const TU = { F: ['F2', 'C3'], C7: ['C3', 'G2'], Bb: ['Bb2', 'F2'], Dm: ['D3', 'A2'], Gm: ['G2', 'D3'], D7: ['D3', 'A2'], F7: ['F2', 'C3'], Eb: ['Eb3', 'Bb2'] };
    const CH = { F: 'F4+A4+C5', C7: 'E4+G4+Bb4', Bb: 'F4+Bb4+D5', Dm: 'F4+A4+D5', Gm: 'G4+Bb4+D5', D7: 'F#4+A4+C5', F7: 'Eb4+A4+C5', Eb: 'Eb4+G4+Bb4' };
    const tuba = (h) => gcBars(h, (c) => `${TU[c][0]}/2. -/2 ${TU[c][1]}/2. -/2 ${TU[c][0]}/2. -/2 ${TU[c][1]}/2. -/2`);
    const pizz = (h) => gcBars(h, (c) => rep(`-/2 ${CH[c]}/2.`, 4));
    // Glock: respuestas de 4 notas en el final de cada frase de 2 compases (rojo, azul, amarillo...).
    const glockA = '-/24 C6/2 A5/2 F5/2 A5/2 -/24 G5/2 Bb5/2 C6/2 E6/2 -/24 F6/2 D6/2 Bb5/2 D6/2 -/24 A5/2 C6/2 F6/2 -/2';
    const glockC = '-/24 F5/2 Bb5/2 D6/2 F6/2 -/24 Eb6/2 C6/2 A5/2 F5/2 -/24 G6/2 Eb6/2 Bb5/2 G5/2 -/32';
    const marcha = 'k+s/2 s/1? s/1? s/2 k/2 k+s/2 s/1? s/1? s/2 h/2';
    const redoble = 'k+s/2 s/1? s/1? s/2 k/2 s/1 s/1 s/1 s/1 s/1! s/1! s/1! s/1!';
    const drm = `c+${marcha} ${rep(marcha, 6)} ${redoble}`;
    return {
      bpm: 128, era: 'gc', form: ['A', 'B', 'A', 'C'],
      voices: [
        // Silbido: seno con vibrato y un deslicito de entrada.
        { wave: 'sine', vol: 0.045, legato: 0.8, vib: { rate: 5.5, depth: 0.2, delay: 0.15 }, parts: { A: melA, B: melB, C: melC } },
        { wave: 'bell', vol: 0.03, env: 'bell', fx: 0.7, pan: 0.3, parts: { A: glockA, C: glockC } },
        { wave: 'triangle', vol: 0.1, env: 'bass', fx: 0, parts: { A: tuba(hA), B: tuba(hB), C: tuba(hC) } },
        { wave: GC_HARP, vol: 0.026, poly: true, env: 'pluck', fx: 0.4, pan: -0.3, parts: { A: pizz(hA), B: pizz(hB), C: pizz(hC) } },
        // En el trío entran cuerdas largas.
        { wave: 'sawtooth', vol: 0.016, poly: true, env: 'pad', filter: 2000, parts: { C: gcBars(hC, (c) => `${CH[c]}/16`) } },
        { wave: 'noise', vol: 0.02, fx: 0.15, parts: { A: drm, B: drm, C: drm } },
      ],
    };
  })();

  // Casco Escáner (y la Estación Visor): ambiente frío al estilo Metroid Prime en Si menor
  // frigio; secuenciador de pulsos en semicorcheas con eco, coro y latido. 32 compases.
  const escaner = (() => {
    const melA = 'F#5/8 -/2 B4/2 C#5/2 D5/2 | C#5/12 -/4 | E5/8 -/2 C5/2 D5/2 E5/2 | G5/6 F#5/2 E5/8 | ' +
      'F#5/8 -/2 D5/2 E5/2 F#5/2 | B5/8 A5/4 F#5/4 | G5/6 F#5/2 E5/4 B4/4 | A#4/12 -/4';
    const melB = 'B5/6 A5/2 G5/4 D5/4 | E5/6 F#5/2 A5/8 | B5/4 C#6/4 D6/8 | F#6/12! -/4 | ' +
      'E6/6 D6/2 B5/8 | C#6/6 B5/2 A5/8 | A#5/8 F#5/8 | C#5/4 E5/4 A#5/4 C#6/4';
    const melC = 'E5/16 | F#5/16 | G5/8 A5/8 | B5/16 | C6/8 B5/4 G5/4 | E5/16 | F#5/8 G5/4 A#5/4 | F#5/16';
    const hA = ['Bm', 'Bm', 'C', 'C', 'Bm', 'Bm', 'Em', 'F#'];
    const hB = ['G', 'A', 'Bm', 'Bm', 'G', 'A', 'F#', 'F#'];
    const hC = ['Em', 'F#m', 'G', 'A', 'C', 'C', 'F#', 'F#'];
    const AR = { Bm: ['B3', 'F#4', 'B4', 'D5'], C: ['C4', 'G4', 'C5', 'E5'], Em: ['E4', 'G4', 'B4', 'E5'], 'F#': ['F#3', 'C#4', 'F#4', 'A#4'],
      G: ['G3', 'D4', 'G4', 'B4'], A: ['A3', 'E4', 'A4', 'C#5'], 'F#m': ['F#3', 'C#4', 'F#4', 'A4'] };
    const BS = { Bm: ['B1', 'B2'], C: ['C2', 'C3'], Em: ['E2', 'E3'], 'F#': ['F#1', 'F#2'], G: ['G1', 'G2'], A: ['A1', 'A2'], 'F#m': ['F#1', 'F#2'] };
    const seq = (h) => gcBars(h, (c) => { const [a, b, x, d] = AR[c]; return rep(`${a}/1! ${b}/1 ${x}/1 ${d}/1 ${b}/1 ${x}/1 ${d}/1 ${x}/1`, 2); });
    const bas = (h) => gcBars(h, (c) => { const [r, o] = BS[c]; return `${r}/3 ${r}/3 ${r}/2 ${o}/2 ${r}/2 ${r}/2 ${o}/2`; });
    const pad = (h) => gcBars(h, (c) => `${AR[c].slice(1).join('+')}/16`);
    const beat = 'k/3 h/1? h/2? h/2 s/3 h/1? k/2 h/2';
    const beatB = 'k+h/1 h/1? h/1? h/1? s/2 h/1? k/1 h/1? k/1 h/1? h/1? s/2 h/2?';
    const toms = 'k/4 T/2? T/2? k/4 t/2? T/2';
    return {
      bpm: 100, era: 'gc', intro: ['I'], form: ['A', 'B', 'A2', 'C'],
      fx: { reverb: { time: 2.8, mix: 0.3 }, echo: { steps: 3, feedback: 0.35, mix: 0.18, tone: 2600 }, comp: true },
      voices: [
        // Coro sintético, lento y con vibrato tardío.
        { wave: 'vox', vol: 0.055, env: 'soft', vib: 'slow', filter: 3200,
          parts: { I: '-/32', A: melA, B: melB, A2: melA, C: melC } },
        { wave: 'pulse25', vol: 0.016, env: 'stab', filter: 2400, fx: 0.8, pan: 0.35,
          parts: { I: seq(['Bm', 'Bm']), A: seq(hA), B: seq(hB), A2: seq(hA), C: seq(hC) } },
        { wave: 'sawtooth', vol: 0.014, poly: true, env: 'pad', filter: 1500, pan: -0.3,
          parts: { I: '-/32', A: pad(hA), B: pad(hB), A2: pad(hA), C: pad(hC) } },
        { wave: 'triangle', vol: 0.1, env: 'bass', fx: 0, parts: { A: bas(hA), B: bas(hB), A2: bas(hA), C: bas(hC) } },
        { wave: 'noise', vol: 0.02, fx: 0.35,
          parts: { I: rep('k/8 k/4? -/4', 2), A: rep('k/8 k/4? -/4', 4) + ' ' + rep(beat, 4), B: `c+${beatB} ${rep(beatB, 7)}`,
            A2: `c+${beat} ${rep(beatB, 7)}`, C: rep(toms, 6) + ' ' + 'k/4 T/2 T/2 t/2 t/2 T/2 T/2 | t/1 t/1 t/1 t/1 T/1 T/1 T/1 T/1 s/1 s/1 s/1 s/1 s/1! s/1! s/1! s/1!' } },
      ],
    };
  })();

  // El Guante Crossover (jefe): épica de torneo orquestal con rock al estilo Super Smash Bros.
  // Melee, Mi menor a 170; fanfarria de 4 compases, metales, cuerdas en semicorcheas. 32 compases.
  // Las figuritas (abajo) cambian el timbre de la voz 1, así que la melodía va en voices[0].
  const guante = (() => {
    const fan = 'E5/2! E5/2 E5/2 G5/2! B5/6 A5/2 | G5/2 A5/2 B5/2 E6/2! D6/8 | C6/4! B5/4 A5/4 G5/4 | F#5/4 G5/2 A5/2 B5/8!';
    const melA = 'E5/2 B4/2 E5/2 G5/2 B5/4 A5/2 G5/2 | E5/4 G5/2 C6/2 B5/4 G5/4 | F#5/2 D5/2 F#5/2 A5/2 D6/4 C6/2 A5/2 | B5/12 -/2 B4/2 | ' +
      'E5/2 B4/2 E5/2 G5/2 B5/4 E6/4 | D6/2 C6/2 B5/2 G5/2 E5/4 G5/4 | A5/2 C6/2 E6/2 C6/2 B5/2 A5/2 G5/2 F#5/2 | F#5/8 D#5/4 B4/4';
    const melB = 'G5/6 C6/2 E6/8 | F#6/6 E6/2 D6/8 | E6/4 B5/4 G5/4 B5/4 | E6/12 -/4 | ' +
      'G6/6! E6/2 C6/8 | A6/6! F#6/2 D6/8 | D#6/4 F#6/4 B6/8! | A6/4 F#6/4 D#6/4 B5/4';
    const melC = 'A4/6 C5/2 E5/8 | D5/4 C5/4 B4/4 A4/4 | G4/6 B4/2 E5/8 | F#5/4 G5/4 A5/4 B5/4 | ' +
      'C6/6 A5/2 F5/8 | E5/4 F5/4 G5/4 A5/4 | B5/8 A5/4 F#5/4 | D#5/4 F#5/4 B5/4 D#6/4';
    const hI = ['Em', 'C', 'Am', 'B'];
    const hA = ['Em', 'C', 'D', 'Bm', 'Em', 'C', 'Am', 'B'];
    const hB = ['C', 'D', 'Em', 'Em', 'C', 'D', 'B', 'B'];
    const hC = ['Am', 'Am', 'Em', 'Em', 'F', 'F', 'B', 'B'];
    const ST = { Em: ['E4', 'B4', 'G4'], C: ['C4', 'G4', 'E4'], D: ['D4', 'A4', 'F#4'], Bm: ['B3', 'F#4', 'D4'], Am: ['A3', 'E4', 'C4'],
      B: ['B3', 'F#4', 'D#4'], F: ['F3', 'C4', 'A3'] };
    const BS = { Em: ['E2', 'E3'], C: ['C2', 'C3'], D: ['D2', 'D3'], Bm: ['B1', 'B2'], Am: ['A1', 'A2'], B: ['B1', 'B2'], F: ['F1', 'F2'] };
    const CH = { Em: 'E4+G4+B4', C: 'E4+G4+C5', D: 'F#4+A4+D5', Bm: 'F#4+B4+D5', Am: 'E4+A4+C5', B: 'F#4+B4+D#5', F: 'F4+A4+C5' };
    const runs = (h) => gcBars(h, (c) => { const [a, b, x] = ST[c]; return rep(`${a}/1. ${x}/1. ${b}/1. ${x}/1.`, 4); });
    const gallop = (h) => gcBars(h, (c) => { const [r, o] = BS[c]; return rep(`${r}/1. ${r}/1. ${o}/2.`, 4); });
    const half = (h) => gcBars(h, (c) => { const [r, o] = BS[c]; return `${r}/6 ${o}/2 ${r}/4 ${o}/4`; });
    const stab = (h) => gcBars(h, (c) => `${CH[c]}/2! -/4 ${CH[c]}/2. -/4 ${CH[c]}/2. ${CH[c]}/2.`);
    const hold = (h) => gcBars(h, (c) => `${CH[c]}/16`);
    const rock = 'k/2 h/2 s/2 h/2 k/1 k/1 h/2 s/2 h/2';
    const rockB = 'k/2 o/2 s/2 h/2 k/1 k/1 o/2 s/2 h/2';
    const tomsFill = 'k/2 s/1 s/1 t/1 t/1 t/2 T/1 T/1 T/2 s/1! s/1! s/2!';
    return {
      bpm: 170, era: 'gc', intro: ['I'], form: ['A', 'B', 'A', 'C'],
      voices: [
        { wave: 'brass', vol: 0.05, env: { a: 0.015, d: 0.12, s: 0.7, r: 0.08 }, vib: { rate: 5.5, depth: 0.15, delay: 0.2 },
          parts: { I: fan, A: melA, B: melB, C: melC } },
        { wave: 'sawtooth', vol: 0.016, env: 'stab', fx: 0.5, pan: 0.3,
          parts: { I: runs(hI), A: runs(hA), B: runs(hB), C: '-/64 ' + runs(['F', 'F', 'B', 'B']) } },
        { wave: 'brass', vol: 0.026, poly: true, env: 'stab', pan: -0.3,
          parts: { I: stab(hI), A: stab(hA), B: hold(hB), C: hold(hC) } },
        { wave: 'triangle', vol: 0.11, env: 'bass', fx: 0,
          parts: { I: gallop(hI), A: gallop(hA), B: gallop(hB), C: half(hC.slice(0, 4)) + ' ' + gallop(hC.slice(4)) } },
        { wave: 'noise', vol: 0.026, fx: 0.15,
          parts: { I: 'c+k/2! -/2 k/2 -/2 c+k/2! -/2 s/2 s/2 | c+k/2! -/2 k/2 -/2 c+k/2! -/2 s/2 s/2 | ' + rep('k/2 s/2', 4) + ' | s/1 s/1 s/1 s/1 s/1 s/1 s/1 s/1 t/1 t/1 t/1 t/1 T/1! T/1! T/1! T/1!',
            A: `c+${rock} ${rep(rock, 6)} ${tomsFill}`, B: `c+${rockB} ${rep(rockB, 6)} ${tomsFill}`,
            C: `c+k/4 h/4 s/4 h/4 ${rep('k/4 h/4 s/4 h/4', 3)} ${rep(rock, 3)} ${tomsFill}` } },
      ],
    };
  })();

  return { gc_battle: danza, gc_map: jardin, gc_brotes: brotes, gc_escaner: escaner, gc_guante: guante };
})();


addWorld({
  id: 'gc',
  order: 5,
  name: 'Cubo Galáctico',
  theme: 'gc',                // css/worlds/gc.css
  music: 'gc_map',
  requires: 'n64',
  console: 'gamecube',
  // Isla Celeste → Jardín Brotitos → Pueblo de Bellota → Estación Visor → Arena Final.
  // Entre zona y zona aparece una Copia de Sombra.
  nodes: ['cubito', 'disquin', 'brotitos', 'capbrotes', 'sombra_tetro', 'delfinito', 'correo', 'sombra_cap',
    'fantasmita', 'sombracel', 'sombra_nebula', 'casco', 'sombra_marco', 'guante'],
  enemies: {
    // ===== Isla Celeste =====
    cubito: {
      ...GC_BASE,
      name: 'Cubito', sprite: 'cubito', model: 'cubito',
      hp: 100, atk: 6, def: 4, xp: 42,
      fightWords: 2, fightTime: 1.1,
      words: ['El cubo tiene manija.', 'Llévame a casa.', 'Soy índigo, no morado.', 'Tengo cuatro puertos.', 'Mi tapa se abre.',
        'Juguemos con amigos.', 'Mi disco es chiquito.', 'Cárgame, por favor.', 'Soy un cubo feliz.', 'Hola, Isla Celeste.'],
      blurb: 'ISLA CELESTE. Un cubo índigo con manija. Quiere que lo cargues a casa de un amigo.',
      keysHint: 'Frases completas: El cubo tiene manija.',
      intro: '* ¡Un Cubito rueda hacia ti!\n* Te ofrece su manija. "¿Me cargas?"',
      check: '* CUBITO - ATQ 6 DEF 4\n* Un cubo con manija. Técnicamente es portátil. Técnicamente.',
      idle: ['* Cubito abre y cierra su tapita. Clic, clic.', '* Cubito presume sus cuatro puertos.', '* "Tengo manija. Soy portátil. Técnicamente."', '* Huele a plástico nuevo.'],
      calm: '* Cubito se queda quieto, esperando que lo cargues.',
      taunts: ['¡Cárgame!', '¡Soy índigo!', '¡Clic, clic!'],
      acts: [
        { name: 'Cargar', text: 'lo cargas de la manija con cuidado', mercy: 50, reply: '* "¡Vamos a la casa de un amigo!"' },
        { name: 'Cubo', text: 'le dices que es el cubo más bonito', mercy: 40, reply: '* "Soy índigo, no morado. ÍNDIGO."' },
        { name: 'Abrir', text: 'abres la tapita de arriba', mercy: 45, reply: '* "¡Mi disco está aquí!"' },
      ],
      bullets: { count: 10, interval: 1250, speed: 36, pool: ['Cubo', 'Manija.', 'Tapa', 'Índigo', 'Disco.', 'Clic', 'Cuatro', 'Hola.', 'Plástico', 'Casa.'] },
      drop: 'manija',
      townLine: '* ¡Clic! Mi casa tiene manija en la puerta.\n* Cuando quiera, me la llevo a casa de un amigo.',
      townFacts: ['* Dato: la GameCube tenía 4 puertos para controles al frente.\n* ¡Cuatro amigos, como en la N64!'],
    },
    disquin: {
      ...GC_BASE,
      name: 'Disquín', sprite: 'disquin', model: 'disquin', fx: 'circle',
      hp: 95, atk: 5, def: 3, xp: 40,
      fightWords: 3,
      words: ['disco', 'gira', 'vuelta', 'centro', 'mareo', 'órbita', 'rueda', 'espiral', 'redondo', 'círculo', 'Ocho', 'Giro', 'Mini'],
      blurb: 'ISLA CELESTE. Un disco de 8 cm que gira y gira... y se marea. Sus letras salen en círculo.',
      keysHint: 'Letras en círculo: se escriben en orden',
      intro: '* ¡Disquín llega girando!\n* "¡No puedo parar! ¡El mundo gira! ¿O soy yo?"',
      check: '* DISQUIN - ATQ 5 DEF 3\n* Un disco de 8 cm. Sus letras giran: empieza por la de ARRIBA y sigue como reloj.',
      idle: ['* Disquín gira tan rápido que hace viento.', '* "Soy chiquito y guardo mil cuatrocientos megas. Más o menos."', '* Disquín se tambalea. Se marea.', '* BIT: ¿Sabías que el nombre secreto de esta consola era "Dolphin"?'],
      calm: '* Disquín gira despacito, sonriendo.',
      taunts: ['¡Giro, giro!', '¡Ocho centímetros!', '¡Me mareo!'],
      acts: [
        { name: 'Parar', text: 'lo detienes con un dedo suave', mercy: 50, reply: '* "Uff. El mundo seguía girando."' },
        { name: 'Limpiar', text: 'lo limpias del centro hacia afuera', mercy: 45, reply: '* "¡Así es como se hace!"' },
        { name: 'Chico', text: 'le dices que ser chico es práctico', mercy: 40, reply: '* "¡Ocho centímetros de pura potencia!"' },
      ],
      bullets: { count: 11, interval: 1200, speed: 36, pool: ['Gira', 'Disco', 'Ocho', 'Mini', 'Vuelta', 'Centro', 'Rueda', 'Mareo'] },
      drop: 'disco_mini',
      townLine: '* ¡Llegué girando! Ya casi no me mareo.\n* Bueno, solo si me ves fijamente.',
      townFacts: ['* Dato: los discos de GameCube medían 8 cm y guardaban cerca de 1.5 GB.\n* ¡Chiquitos pero llenos de aventura!'],
    },

    // ===== Jardín Brotitos =====
    brotitos: {
      ...GC_BASE,
      name: 'Brotitos', sprite: 'brotitos', model: 'brotitos',
      hp: 90, atk: 4, def: 2, xp: 34,
      fightWords: 3,
      words: ['rojo: cava', 'azul: nada', 'amarillo: salta', 'rojo: empuja', 'azul: busca', 'amarillo: sube', 'rojo: carga',
        'azul: trae', 'amarillo: brinca', 'rojo: corre', 'azul: bucea', 'amarillo: vuela'],
      blurb: 'JARDIN BROTITOS. Tres criaturitas-planta de colores que siguen órdenes. ¡Dile a cuál le hablas!',
      keysHint: 'Cambio de contexto con dos puntos: rojo: cava',
      intro: '* ¡Tres Brotitos salen de la tierra!\n* ROJO, AZUL y AMARILLO te miran. Esperan órdenes.',
      check: '* BROTITOS - ATQ 4 DEF 2\n* Vienen de 3 en 3. Cada orden empieza con el color: "rojo: cava".',
      idle: ['* Los Brotitos se forman en fila. Luego en otra fila.', '* El Brotito amarillo tiene una florecita.', '* "¡Esperamos órdenes, capitán!"'],
      calm: '* Los tres Brotitos se sientan juntos, muy tranquilos.',
      taunts: ['¡A la carga!', '¡Rojo, azul, amarillo!', '¡Sí, capitán!'],
      acts: [
        { name: 'Silbar', text: 'silbas para que vengan los tres', mercy: 50, reply: '* "¡Sí, capitán!"' },
        { name: 'Plantar', text: 'los plantas un rato al sol', mercy: 45, reply: '* "Crecen las hojitas."' },
        { name: 'Contar', text: 'cuentas uno, dos, tres', mercy: 40, reply: '* "¡Estamos todos!"' },
      ],
      bullets: { count: 11, interval: 1200, speed: 35, pool: ['rojo:', 'azul:', 'cava', 'nada', 'sube', 'salta', 'trae', 'busca', 'amarillo:'] },
      townLine: '* ¡Rojo, azul y amarillo reportándose!\n* Plantamos flores en todo el barrio.',
      townFacts: ['* Dato: Pikmin (2001) lo creó Shigeru Miyamoto.\n* Dicen que se le ocurrió mirando su jardín.'],
    },
    capbrotes: {
      name: 'Capitán Brotes', sprite: 'capbrotes', mode: 'brotes', friend: true, xp: 60, hp: 150,
      blurb: '¡MINIJEFE! JARDIN BROTITOS. Un explorador diminuto que cree que eres un gigante. Da órdenes a tus Brotitos con el color correcto.',
      keysHint: 'Órdenes con dos puntos y cambio de contexto',
      townLine: '* ¡Gigante! ...Digo, vecino.\n* Mi nave ya está reparada, pero me gusta este barrio.',
      townFacts: ['* Dato: en Pikmin, el Capitán Olimar tenía solo 30 días para reparar su nave.\n* ¡Yo tengo todo el tiempo del mundo!'],
      // Pikmin real: los rojos aguantan el fuego, los azules nadan y a los amarillos se les lanza alto.
      squads: [
        { id: 'rojo', label: 'ROJO', color: '#E04B4B', task: 'FUEGO', icon: '🔥', verbs: ['apagar', 'cruzar', 'pisar', 'soplar'], verbs2: ['apagar fuego', 'cruzar llamas', 'pisar brasas', 'soplar humo'] },
        { id: 'azul', label: 'AZUL', color: '#2B9EDB', task: 'AGUA', icon: '💧', verbs: ['nadar', 'bucear', 'flotar', 'remar'], verbs2: ['nadar rápido', 'bucear hondo', 'flotar quieto', 'remar fuerte'] },
        { id: 'amarillo', label: 'AMARILLO', color: '#F5D547', task: 'ALTURA', icon: '⛰', verbs: ['saltar', 'subir', 'trepar', 'volar'], verbs2: ['saltar alto', 'subir muro', 'trepar roca', 'volar lejos'] },
      ],
      // Turbo del minijuego: un 4º color (§8.6). Los morados son pesados y fuertes.
      squadTurbo: { id: 'morado', label: 'MORADO', color: '#8E44AD', task: 'PESO', icon: '🪨', verbs: ['cargar', 'empujar', 'aplastar', 'mover'], verbs2: ['cargar piedra', 'empujar caja', 'aplastar lata', 'mover tronco'] },
      peace: [
        { name: 'Silbato', text: 'silbas la nota de reunión' },
        { name: 'Gigante', text: 'no soy gigante, solo normal' },
        { name: 'Nave', text: 'le ayudas a juntar piezas de su nave' },
      ],
    },
    sombra_tetro: GC_SHADOW('sombra_tetro', {
      name: 'Copia de Tetro Rey', kind: 'tetro', orig: 'tetrorey', origTrack: 'gb_tetrorey',
      blurb: 'COPIA DE SOMBRA. Tetro Rey, pero de estática magenta. Bloques con palabras caen... ¡30 segundos!',
      keysHint: 'Bloques que caen: escríbelos antes de que toquen el piso',
      sad: 'Todo encaja... menos yo.',
      words: ['Bloque', 'Línea', 'Encaja', 'Gira', 'Torre', 'Pieza', 'Caer', 'Rey', 'Fila', 'Cuadro', 'Ordena', 'Baja'],
    }),

    // ===== Pueblo de Bellota =====
    delfinito: {
      ...GC_BASE,
      name: 'Delfinito Salvaje', sprite: 'delfinito', model: 'delfin', gift: 'delfinito',
      hp: 110, atk: 6, def: 3, xp: 45,
      fightWords: 2, fightTime: 1.1,
      words: ['Salta Delfinito, salta.', 'Gira, Delfinito, gira.', 'Bit y Delfinito juegan.', 'Mira el Mar Celeste.', 'Nadamos con Bit.',
        'Hola, Pueblo de Bellota.', 'Delfinito ama el Agua.', 'Un aro para Delfinito.', 'Ve al Muelle, Delfinito.'],
      blurb: 'PUEBLO DE BELLOTA. Un delfín juguetón (guiño a "Dolphin"). Si lo perdonas... quizá quiera ser tu Tecloide.',
      keysHint: 'Frases con dos mayúsculas: Salta Delfinito, salta.',
      intro: '* ¡Delfinito Salvaje salta del agua!\n* ¡Iiiik! Te salpica toda la cara.',
      check: '* DELFINITO SALVAJE - ATQ 6 DEF 3\n* Un Tecloide de tipo GOTA... salvaje. Sus frases llevan DOS mayúsculas.',
      idle: ['* Delfinito hace un clavado perfecto.', '* "¡Iiiik! ¡Iiiik!"', '* BIT: Por eso hay tantos delfines aquí: ¡a esta consola le decían Dolphin!'],
      calm: '* Delfinito flota panza arriba, feliz.',
      taunts: ['¡Iiiik!', '¡Splash!', '¡Atrápame!'],
      acts: [
        { name: 'Nadar', text: 'nadas a su lado', mercy: 45, reply: '* "¡Iiiik!"' },
        { name: 'Aro', text: 'lanzas un aro al agua', mercy: 50, reply: '* "¡Lo atrapo! ¡Otra vez!"' },
        { name: 'Nombre', text: 'le preguntas por su nombre secreto', mercy: 40, reply: '* "Shh. Es Dolphin. No lo digas."' },
      ],
      bullets: { count: 11, interval: 1200, speed: 37, pool: ['Iiik', 'Splash', 'Aro', 'Ola', 'Mar.', 'Salta', 'Agua', 'Dolphin'] },
      townLine: '* ¡Iiiik! El barrio tiene fuente. ¡Hago clavados todo el día!',
      townFacts: ['* Dato: "Dolphin" era el nombre clave de la GameCube.\n* Su procesador se llamaba Gekko y su chip de gráficos, Flipper. ¡Puro mar!'],
    },
    correo: {
      name: 'Correo de Bellota', sprite: 'bellota', mode: 'correo', xp: 30,
      blurb: 'PUEBLO DE BELLOTA. La Alcaldesa Bellota necesita cartero. Escribe 3 cartas a los vecinos (con mayúsculas y puntuación).',
      keysHint: 'Cartas: frases largas con comas, puntos y signos',
    },
    sombra_cap: GC_SHADOW('sombra_cap', {
      name: 'Copia de Lord Caparazón', kind: 'caparazon', orig: 'caparazon', origTrack: 'caparazon1',
      blurb: 'COPIA DE SOMBRA. Lord Caparazón en estática. Cada palabra hay que terminarla antes del siguiente golpe del metrónomo.',
      keysHint: 'Al ritmo: una palabra por golpe',
      sad: 'Mi castillo es otro castillo.',
      words: ['Castillo', 'Puente', 'Hacha', 'Lava', 'Fuego', 'Torre', 'Corona', 'Salto', 'Bandera', 'Tubo', 'Hongo', 'Rey'],
    }),

    // ===== Estación Visor =====
    fantasmita: {
      ...GC_BASE,
      name: 'Fantasmita Aspirada', sprite: 'fantasmita', model: 'fantasmita', fx: 'ghost',
      hp: 90, atk: 5, def: 4, xp: 40,
      fightWords: 3,
      words: ['fantasma', 'cuadro', 'escondida', 'linterna', 'aspiradora', 'mansión', 'susto', 'pasillo', 'sábana', 'retrato', 'Buh', 'Luigi'],
      blurb: 'ESTACION VISOR. Una fantasmita traviesa que se esconde en los cuadros. Sus palabras solo se ven cuando escribes la primera letra.',
      keysHint: 'Palabras escondidas: adivina la primera letra',
      intro: '* ¡Un cuadro se mueve...!\n* ¡Fantasmita Aspirada sale de la pintura! "¡Buh!"',
      check: '* FANTASMITA ASPIRADA - ATQ 5 DEF 4\n* Esconde las palabras. Solo se ve la primera letra: escríbela y aparece lo demás.',
      idle: ['* Fantasmita se mete a un cuadro. Luego a otro.', '* Se oye una aspiradora a lo lejos. Fantasmita tiembla.', '* "¡Buh! ...¿No te asustaste? Qué mal."'],
      calm: '* Fantasmita juega a las escondidas. Siempre en el mismo cuadro.',
      taunts: ['¡Buh!', '¡Adivina dónde estoy!', '¡Jijiji!'],
      acts: [
        { name: 'Aspirar', text: 'la aspiras... no, mejor la saludas', mercy: 45, reply: '* "¡Buh! Digo, hola."' },
        { name: 'Cuadro', text: 'miras el cuadro donde se esconde', mercy: 50, reply: '* "Me encontraste. Juguemos otra."' },
        { name: 'Linterna', text: 'prendes la linterna un segundo', mercy: 35, reply: '* "¡Ay, mis ojitos!"' },
      ],
      bullets: { count: 12, interval: 1150, speed: 37, pool: ['Buh', 'Susto', 'Cuadro', 'Sábana', 'Jiji', 'Uuuh', 'Luz', 'Eco'] },
      townLine: '* ¡Buh! ...Jiji. Mi casa tiene muchos cuadros.\n* Ven a jugar a las escondidas.',
      townFacts: ['* Dato: Luigi\'s Mansion fue uno de los primeros juegos de la GameCube, en 2001.\n* ¡Luigi atrapaba fantasmas con una aspiradora!'],
    },
    sombracel: {
      ...GC_BASE,
      name: 'Sombra de Cel', sprite: 'sombracel', model: 'sombracel', fx: 'neg',
      hp: 105, atk: 6, def: 5, xp: 44,
      fightWords: 2, fightTime: 1.1,
      words: ['Mi contorno es grueso.', 'El viento sopla.', 'Soy de caricatura.', 'La pared es mía.', 'Tinta negra, borde fino.',
        'El barco cruza el mar.', 'Dibújame con cuidado.', 'Sin luz no hay sombra.', 'Batuta, viento y mar.'],
      blurb: 'ESTACION VISOR. Una sombra con contorno negro grueso que se pega a las paredes. Sus frases salen en negativo.',
      keysHint: 'Frases en negativo (blanco sobre negro)',
      intro: '* ¡Una sombra se despega de la pared!\n* Tiene un contorno grueso, como de caricatura.',
      check: '* SOMBRA DE CEL - ATQ 6 DEF 5\n* Dibujada con cel-shading. Sus palabras salen en negativo.',
      idle: ['* Sombra de Cel se pega a la pared. Ya no se ve.', '* El contorno de Sombra de Cel se pone más grueso.', '* Sopla un viento con ritmo de tres por cuatro.'],
      calm: '* Sombra de Cel posa con su mejor contorno.',
      taunts: ['¡Más grueso!', '¡Pegada a la pared!', '¡Soy caricatura!'],
      acts: [
        { name: 'Luz', text: 'le das luz de frente', mercy: 45, reply: '* "Mi contorno se ve genial."' },
        { name: 'Dibujar', text: 'delineas su borde con cuidado', mercy: 50, reply: '* "¡Más grueso! ¡Más!"' },
        { name: 'Viento', text: 'la despegas de la pared con un soplo', mercy: 40, reply: '* "¡Libre!"' },
      ],
      bullets: { count: 12, interval: 1150, speed: 38, pool: ['Tinta', 'Borde', 'Sombra', 'Viento', 'Mar.', 'Barco', 'Pared', 'Trazo'] },
      townLine: '* Aquí hay mucha luz. Mi contorno nunca se vio tan bien.',
      townFacts: ['* Dato: The Legend of Zelda: The Wind Waker (2002) usaba cel-shading.\n* ¡Parecía una caricatura que se movía!'],
    },
    sombra_nebula: GC_SHADOW('sombra_nebula', {
      name: 'Copia de Reina Nébula', kind: 'nebula', orig: 'nebula', origTrack: 'snes_nebula',
      blurb: 'COPIA DE SOMBRA. Reina Nébula en estática. Sus medusitas suben flotando: escríbelas antes de que lleguen arriba.',
      keysHint: 'Medusitas que suben (acentos)',
      sad: 'Mis hijas no me reconocen.',
      words: ['Medusa', 'Océano', 'Órbita', 'Galaxia', 'Nébula', 'Reina', 'Burbuja', 'Hondo', 'Estrella', 'Lago', 'Ola', 'Brillo'],
    }),
    casco: {
      name: 'Casco Escáner', sprite: 'casco', mode: 'escaner', friend: true, model: 'casco',
      theme: 'gc', music: 'gc_escaner', caps: true, strictAccents: true, gc: true,
      onEnter: (s, pages) => gcBattleEnter(s, pages),
      onExit: (s) => gcBattleExit(s),
      hp: 140, atk: 5, def: 6, xp: 65,
      fightWords: 3,
      words: ['Visor', 'escaneo', 'casco', 'energía', 'Samus', 'datos', 'misil', 'sensor', 'Prime', 'archivo', 'radar', 'señal'],
      blurb: '¡MINIJEFE! ESTACION VISOR. Un casco-visor que te escanea. Usa su propio visor: escanea sus secretos para debilitarlo.',
      keysHint: 'Líneas de datos con mayúsculas y puntos',
      intro: '* ¡CASCO ESCANER baja del techo!\n* "Escaneo iniciado. Sujeto: rápido. Nervioso. Sin nombre."',
      check: '* CASCO ESCANER - ATQ 6 DEF ?\n* Cambia de visor cada turno. En el VISOR DE ESCANEO puedes leer sus secretos.',
      idle: ['* Casco Escáner hace "bip". Luego "bup".', '* "Toda la información es... información."', '* Un anillo de luz te recorre de pies a cabeza.'],
      calm: '* Casco Escáner apaga su luz roja. Ahora es verde.',
      taunts: ['¡Escaneando!', '¡Bip, bup!', '¡Datos, datos!'],
      // Los ACTUAR se desbloquean escaneando (§8.4 B).
      acts: [],
      scans: [
        { name: 'Visera', line: 'Su visera se nubla con el vapor.', act: { name: 'Vapor', text: 'soplas vapor tibio en su visera', mercy: 50, reply: '* "¡No veo nada! ...Qué relajante."' } },
        { name: 'Antena', line: 'Escanear sin parar le da hipo.', act: { name: 'Hipo', text: 'le das un susto para quitarle el hipo', mercy: 50, reply: '* "¡Hip! ...¿Ya se fue? ¡Ya se fue!"' } },
        { name: 'Archivo', line: 'Nadie le pregunta cómo está.', act: { name: 'Preguntar', text: 'le preguntas cómo está hoy', mercy: 50, reply: '* "...Bien. Nadie me lo había preguntado."' } },
        { name: 'Memoria', line: 'Guarda una foto de su primer escaneo.', act: { name: 'Foto', text: 'le pides que te enseñe su foto', mercy: 50, reply: '* "¡Era un helecho! Lo escaneé 400 veces."' } },
      ],
      bullets: { count: 8, interval: 2200, speed: 34, pool: ['Bip', 'Bup', 'Datos', 'Visor', 'Radar', 'Misil', 'Señal', 'Escaneo'] },
      townLine: '* Escaneo del barrio: 100% amigable.\n* ...Ya no escaneo a nadie sin permiso.',
      townFacts: ['* Dato: Metroid Prime (2002) llevó a Samus al 3D en primera persona.\n* ¡Veías todo desde dentro de su casco, hasta las gotas en la visera!'],
    },
    sombra_marco: GC_SHADOW('sombra_marco', {
      name: 'Copia de Marco', kind: 'marco', orig: 'marco', origTrack: 'n64marco',
      blurb: 'COPIA DE SOMBRA. Marco en estática. Sus cuadros giran: léelos aunque estén chuecos.',
      keysHint: 'Palabras dentro de un marco que gira',
      sad: 'Un cuadro sin nadie que lo mire.',
      words: ['Cuadro', 'Pincel', 'Óleo', 'Galería', 'Marco', 'Estrella', 'Castillo', 'Pintura', 'Dorado', 'Arte', 'Museo', 'Lienzo'],
    }),

    // ===== Arena Final =====
    guante: {
      name: 'El Guante Crossover', sprite: 'guante_gc', boss: true, friend: true, console: 'gamecube',
      mode: 'guante', theme: 'gc', music: 'gc_guante', caps: true, strictAccents: true,
      hp: 100, atk: 7, def: 4, xp: 100,
      fightWords: 3,
      words: ['Arena', 'Guante', 'Smash', 'figurita', 'plataforma', 'torneo', 'Melee', 'trofeo', 'borde', 'combo', 'todos', 'escudo', 'campeón', 'salto'],
      smash: [
        // Frases de ~35 letras: con 50 un niño de ~30 PPM casi nunca la saca sin errores.
        '¡Todos contra todos, hoy gano yo!',
        'Las figuritas son amigos, Guante.',
        'Salto, golpe y escudo: ¡así se juega!',
        'Bit, aguanta un poco más, ya llego.',
        '¿Listo para volar? ¡Golpe Smash!',
        'Cuatro jugadores y mucha amistad.',
      ],
      blurb: '¡JEFE! ARENA FINAL. Un guante gigante que coleccionó copias de todos los jefes como figuritas. ¡Súbele el porcentaje y mándalo a volar!',
      keysHint: 'De todo: frases largas PERFECTAS, mayúsculas y puntuación',
      intro: '* ¡EL GUANTE CROSSOVER baja de las estrellas!\n* "¡Bienvenido a la Arena! Todos contra todos. Yo contra todos."',
      check: '* EL GUANTE CROSSOVER - ATQ 7 DEF 4\n* No tiene HP: tiene PORCENTAJE. Al 100% puedes darle un SMASH. Tres caídas y se acabó.',
      idle: ['* El Guante chasquea los dedos. Hace eco en todo el espacio.', '* "Esta consola vendió más de mi juego que de ninguno. Lo digo con humildad."', '* El Guante acomoda sus figuritas en fila.', '* Las figuritas tiemblan un poquito. Están hechas de estática.'],
      calm: '* El Guante abre la mano. Ya no es un puño.',
      taunts: ['¡Todos contra todos!', '¡A volar!', '¡Figurita va!', '¡Pon tu escudo!'],
      acts: [
        { name: 'Chocar', text: 'chocas la mano con el guante', mercy: 45, reply: '* "...Nadie me había chocado."' },
        { name: 'Figuras', text: 'las figuritas no son juguetes', mercy: 40, reply: '* "...Son amigos. Ya lo sé."' },
        { name: 'Suelta', text: 'le pides que suelte a Bit', mercy: 50, reply: '* El Guante abre los dedos. Bit sale volando hacia ti.\n* BIT: ¡¡AAAH!! ...¡Gracias!', phase3: true },
      ],
      bullets: { count: 6, interval: 1900, speed: 40, pool: ['Golpe', 'Puño', 'Smash', 'Zas', 'Pum', 'Arena', 'Borde', 'Vuela', 'Escudo'] },
      townLine: '* ¡Choca esos cinco! ...Bueno, yo pongo los cinco.\n* Ya no colecciono jefes. Ahora colecciono amigos.',
      townFacts: ['* Dato: Super Smash Bros. Melee fue el juego más vendido de la GameCube.\n* ¡Más de 7 millones de copias!', '* Dato: en Smash Bros., el jefe final es una mano gigante con guante: Master Hand.\n* Primo lejano. Muy lejano.'],
    },
  },

  treasures: {
    caja_prototipo: { name: 'Caja del prototipo', desc: 'Caja de cartón, sin dibujo, sin nombre. Pesa mucho para lo que es.' },
    buzon_rojo: { name: 'Buzón rojo', desc: 'Regalo de la Alcaldesa Bellota. Llegan cartas de vecinos que todavía no conoces.' },
    figurita_dorada: { name: 'Figurita dorada', desc: 'Un guante dorado chiquito. Lo dejaron las cuatro sombras al despedirse.' },
    silbato_brotes: { name: 'Silbato de brotes', desc: 'Suena "¡fiiu!" y aparecen tres hojitas. Regalo del Capitán Brotes.' },
    disco_mini: { name: 'Disco mini', sprite: 'disquin', desc: 'Ocho centímetros de aventura.' },
    manija: { name: 'Manija', desc: 'La manija de la consola. Para llevarla a casa de un amigo.' },
  },

  quests: {
    mundo_gc: {
      name: 'El Cubo Galáctico',
      desc: 'Una tubería índigo lleva a una isla-cubo que flota en el espacio. El Glitch invocó copias de los jefes anteriores. Rescata la GameCube.',
    },
    diez_cartas: {
      name: 'Diez cartas',
      desc: 'Escribe una carta a cada uno de los 10 vecinos de la Alcaldesa Bellota y recibe 5 respuestas felices (precisión de 97% o más).',
      progress: () => {
        const c = GCS().cartas;
        return `${Object.keys(c).length}/10 cartas · ${Object.values(c).filter((a) => a >= 97).length}/5 felices`;
      },
    },
    caja_sotano: {
      name: 'La caja del sótano',
      desc: 'Don Chip encontró una caja vieja en el sótano del museo. Ayúdale a leerla: está junto a él, en el pueblo.',
    },
    cuatro_sombras: {
      name: 'Las cuatro sombras',
      desc: 'Abraza a las 4 Copias de Sombra en vez de vencerlas. Cada una guarda una frase para el final.',
      progress: () => `${Object.values(GCS().sombras).filter((s) => s === 'abrazo').length}/4`,
    },
    dia_30: {
      name: 'El día 30',
      desc: 'Juega BROTITOS (desde la parada del Capitán Brotes) en modo Normal y logra 40 órdenes correctas.',
      progress: () => `Récord: ${(Save.data.arcade || {}).brotitos || 0}/40`,
    },
  },

  sprites: {
    cubito: gcArt([
      '................',
      '.....nnnnnn.....',
      '....n......n....',
      '..nnnnnnnnnnnn..',
      '..niiiiiiiiiwn..',
      '..nillllllllin..',
      '..nianiiiianin..',
      '..nianiiiianin..',
      '..niiiiiiiiiin..',
      '..niiiinniiiin..',
      '..niiiiiiiiiin..',
      '..nininiininin..',
      '..niiiiiiiiiin..',
      '..nnnnnnnnnnnn..',
      '...nn......nn...',
      '................',
    ]),
    disquin: gcArt([
      '................',
      '.....nnnnnn.....',
      '...nnppppppnn...',
      '..nppppppppwpn..',
      '.npsspppppppspn.',
      '.nspanpppppanpn.',
      '.nppanpnnpanppn.',
      '.npppppnnpppppn.',
      '.nppspppppppspn.',
      '.npppnppppnpppn.',
      '..npsppnnppspn..',
      '..nppppppppppn..',
      '...nnppppppnn...',
      '.....nnnnnn.....',
      '................',
      '................',
    ]),
    delfinito: gcArt([
      '................',
      '................',
      '........nn......',
      '.......nuun.....',
      '....nnnuuunnn...',
      '...nuuuuuuuuwnn.',
      'n.nuuuuuuuuuanun',
      'nnuuuuuuuuuuuuun',
      'nuussssssssuuun.',
      'n.nsssssssssnn..',
      '...nnsssssnn....',
      '.....nnnnn......',
      '................',
      '..u...u...u.....',
      '.uuuu.uuuu.uuuu.',
      '................',
    ]),
    fantasmita: gcArt([
      '................',
      '.....nnnnnn.....',
      '....naaaaaan....',
      '...naaaaaawan...',
      '..naaaaaaaaaan..',
      '..naannaannaan..',
      '..naannaannaan..',
      '..naaaaaaaaaan..',
      '..naaaallaaaan..',
      '..naaaaaaaaaan..',
      '..naaaaaaaaaan..',
      '..naaaaaaaaaan..',
      '..nanaanaanaan..',
      '..n.nn.nn.nn.n..',
      '................',
      '................',
    ]),
    sombracel: gcArt([
      '................',
      '......nnnn......',
      '.....nccccn.....',
      '....nccccccn....',
      '....ncyccycn....',
      '....nccccccn....',
      '.....nccccn.....',
      '...nnnccccnnn...',
      '..nccccccccccn..',
      '.nccnccccccnccn.',
      '.nn.nccccccn.nn.',
      '....nccccccn....',
      '....nccnnccn....',
      '....ncn..ncn....',
      '...nnnn..nnnn...',
      '................',
    ]),
    brotitos: gcArt([
      '................',
      '.gg...gg...www..',
      '..g....g....g...',
      '..g....g....g...',
      '.nnnn.nnnn.nnnn.',
      'nrrrrnuuuunyyyyn',
      'nanannanannanann',
      'nrrrrnuuuunyyyyn',
      'nrnnrnunnunynnyn',
      'nrrrrnuuuunyyyyn',
      'nnnnnnnnnnnnnnnn',
      '.nn..nn...nn..n.',
      '................',
      '................',
      '................',
      '................',
    ]),
    capbrotes: gcArt([
      '.......y........',
      '.......n........',
      '.......n........',
      '.....nnnnnn.....',
      '....nsswsssn....',
      '...nseeeeeesn...',
      '...nsenrrnesn...',
      '...nseeeeeesn...',
      '....nnnnnnnn....',
      '...noooooooon...',
      '..nnoooooooonn..',
      '...nooyooyoon...',
      '...noooooooon...',
      '....nnn..nnn....',
      '....nkn..nkn....',
      '....nnn..nnn....',
    ]),
    casco: gcArt([
      '................',
      '.....nnnnnn.....',
      '...nnoooooonn...',
      '..noooowooooon..',
      '.noooooooooooon.',
      '.noonnnnnnnnoon.',
      '.nongggggggwnon.',
      '.nonggnggnggnon.',
      '.nongggggggggon.',
      '.noonnnnnnnnoon.',
      '.noooooooooooon.',
      'pnoorooooooroonp',
      '.noooooooooooon.',
      '..noooooooooon..',
      '...nnnnnnnnnn...',
      '................',
    ]),
    guante_gc: gcArt([
      '................',
      '...nn.nn.nn.nn..',
      '..nawnawnawnawn.',
      '..naanaanaanaan.',
      '..naanaanaanaan.',
      '..naaaaaaaaaaan.',
      '.nnnaaaaaaaaaan.',
      'naaanaaaaaaaaan.',
      '.nnaaaaaaaaaaan.',
      '...naaaaaaaaan..',
      '...nnnnnnnnnnn..',
      '...niiiiiiiiin..',
      '...nyyyyyyyyyn..',
      '...niiiiiiiiin..',
      '...nnnnnnnnnnn..',
      '................',
    ]),
    bellota: gcArt([
      '................',
      '....n....n..nn..',
      '...nkn..nkn.nkkn',
      '...nkkkkkkn.nkkn',
      '..nkkeeeekkn.nkn',
      '..nkenkknekn.nkn',
      '..nkeeeeeekn.nkn',
      '..nkkeeeekkn.nkn',
      '...nnggggnn.nkn.',
      '..ngggwgggn.nkn.',
      '..ngggggggnnkn..',
      '..nggyggggn.....',
      '...ngggggggn....',
      '....nnnnnnn.....',
      '....nk...kn.....',
      '....nn...nn.....',
    ]),
    caja_prototipo: gcArt([
      '................',
      '................',
      '...nnnnnnnnnn...',
      '..nkkkkkkkkkkn..',
      '.nkkkkkkkkkkkkn.',
      '.nnnnnnnnnnnnnn.',
      '.nkkkkkkkkkkkkn.',
      '.nkkkkkkkkkkwkn.',
      '.nkkkkaaaakkkkn.',
      '.nkkkkaaaakkkkn.',
      '.nkkkkkkkkkkkkn.',
      '.nkkkkkkkkkkkkn.',
      '.nnnnnnnnnnnnnn.',
      '................',
      '................',
      '................',
    ]),
    buzon_rojo: gcArt([
      '................',
      '.....nnnnnn.....',
      '....nrrrrrwn....',
      '...nrrrrrrrrn.y.',
      '...nrrrrrrrrnny.',
      '...nrnnnnnnrn.n.',
      '...nrnaaaanrn.n.',
      '...nrnnnnnnrn.n.',
      '...nrrrrrrrrn.n.',
      '...nnnnnnnnnn.n.',
      '.......nk.......',
      '.......nk.......',
      '.......nk.......',
      '.....nnnnnn.....',
      '................',
      '................',
    ]),
    figurita_dorada: gcArt([
      '................',
      '....n.n.n.n.....',
      '....nynynynn....',
      '....nyyyyyyn....',
      '...nnyyyywyn....',
      '...nyyyyyyyn....',
      '....nyyyyyn.....',
      '.....nyyyn......',
      '......nyn.......',
      '......nyn.......',
      '....nnnnnnn.....',
      '...nyyyyyyyn....',
      '...nkkkkkkkn....',
      '...nnnnnnnnn....',
      '................',
      '................',
    ]),
    silbato_brotes: gcArt([
      '................',
      '................',
      '................',
      '................',
      '........nnnnn...',
      '..nnnnnnyyyyyn..',
      '.nyyyyyyywyyyyn.',
      '.nyyyyyyyyyyyyn.',
      '.nnnnnnnnyyyyyn.',
      '........nyyyyn..',
      '........nnnnnn..',
      '.......g........',
      '......ggg.......',
      '................',
      '................',
      '................',
    ]),
    manija: gcArt([
      '................',
      '................',
      '................',
      '....nnnnnnnn....',
      '...niiiiiiiin...',
      '..niinnnnnniin..',
      '..nin......nin..',
      '..nin......nin..',
      '..nin......nin..',
      '.nnnnn....nnnnn.',
      '.niiwn....niiwn.',
      '.nnnnn....nnnnn.',
      '................',
      '................',
      '................',
      '................',
    ]),
    // Guiños del Barrio Cubo (§8.8).
    gc_botona: gcArt([
      '................',
      '................',
      '.....nnnnnn.....',
      '...nnggggggnn...',
      '..nggggggwwggn..',
      '..nggggaaggggn..',
      '..ngggaggagggn..',
      '..ngggaaaagggn..',
      '..ngggaggagggn..',
      '..nggggggggggn..',
      '...nnggggggnn...',
      '.....nnnnnn.....',
      '....nppppppn....',
      '...nppppppppn...',
      '...nnnnnnnnnn...',
      '................',
    ]),
    gc_kart: gcArt([
      '................',
      '....nn...nn.....',
      '...nrrn.nuun....',
      '...neen.neen....',
      '....nn...nn.....',
      '..nnnnnnnnnnnn..',
      '.nyyyyyyyyyyyyn.',
      'nyyywyyyyyyyyyyn',
      'nnnnnnnnnnnnnnnn',
      '.nnn.......nnn..',
      '.npn.......npn..',
      '.nnn.......nnn..',
      '................',
      '................',
      '................',
      '................',
    ]),
    gc_gbplayer: gcArt([
      '................',
      '................',
      '................',
      '................',
      '..nnnnnnnnnnnn..',
      '..niiiiiiiiiin..',
      '..niinnnnnniin..',
      '..niinppppniin..',
      '..niiiiiiiiwin..',
      '..nnnnnnnnnnnn..',
      '...ngn....nrn...',
      '...nnn....nnn...',
      '................',
      '................',
      '................',
      '................',
    ]),
  },
  // Música: ver GC_TRACKS arriba (las de las zonas de mapa están en gc-mapa.js).
  tracks: GC_TRACKS,
});

// Sprites de las copias de sombra (el sprite original en magenta). Se crean ahora que los
// mundos anteriores ya se registraron; si alguno falta, se usa el del Guante.
[['tetro', 'tetrorey'], ['caparazon', 'caparazon'], ['nebula', 'nebula'], ['marco', 'marco']].forEach(([kind, orig]) => {
  const s = gcShadowSprite(orig);
  if (s) SPRITES[`gc_sombra_${kind}`] = s;
});

// Variantes de música hechas a partir de pistas que ya existen:
//  - Copias de sombra: la pista del jefe original, medio tono abajo y con cortes (§14.2).
//    Sirve con pistas de texto plano y con las de secciones (form/parts/intro), acordes,
//    repeticiones "( )*n" y bemoles: se lee con Music.parse y se vuelve a escribir.
//  - Figuritas del Guante: la pista del jefe con el timbre de la voz principal de cada era.
const GC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function gcTranspose(n, by) {
  const m = /^([A-G])([#b]?)(\d)$/.exec(n);
  if (!m) return n;
  const k = GC_NOTES.indexOf(m[1]) + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + by + Number(m[3]) * 12;
  return `${GC_NOTES[((k % 12) + 12) % 12]}${Math.floor(k / 12)}`;
}
function gcShadowCut(src) {
  return Music.parse(src).map((ev, k) => {
    if (k % 7 === 6 && ev.parts.length) return `-/${ev.d}`; // "cortes"
    if (!ev.parts.length) return `-/${ev.d}`;
    const mods = (ev.acc > 1 ? '!' : ev.acc < 1 ? '?' : '') + (ev.stac ? '.' : '') + (ev.ten ? '_' : '') + (ev.glide ? '^' : '');
    return `${ev.parts.map((p) => gcTranspose(p, -1)).join('+')}/${ev.d}${mods}`;
  }).join(' ');
}
function gcShadowTrack(src) {
  const isDrum = (v) => v.wave === 'noise' || v.wave === 'drums';
  const parts = (p) => Object.fromEntries(Object.entries(p).map(([s, txt]) => [s, gcShadowCut(txt)]));
  return {
    ...src,
    bpm: Math.round(src.bpm * 0.92),
    voices: src.voices.map((v) => (isDrum(v) ? v : {
      ...v,
      notes: v.notes && gcShadowCut(v.notes),
      intro: v.intro && gcShadowCut(v.intro),
      parts: v.parts && parts(v.parts),
    })),
  };
}
function gcShadowTrackFor(id) {
  const key = `gc_sombra_${id}`;
  if (!TRACKS[key]) TRACKS[key] = gcShadowTrack(TRACKS[id] || TRACKS.boss);
  return key;
}
// Timbre de la consola de cada figurita: pulso de Game Boy, pulso de NES, la muestra de
// Super NES y la ocarina de N64. Sin la fanfarria de entrada (ya empezó la pelea).
const GC_FIGURE_WAVE = { tetro: ['pulse50', 0.03], caparazon: ['pulse25', 0.03], nebula: ['snes', 0.042], marco: ['ocarina', 0.05] };
Object.entries(GC_FIGURE_WAVE).forEach(([kind, [wave, vol]]) => {
  const base = TRACKS.gc_guante;
  TRACKS[`gc_guante_${kind}`] = {
    ...base,
    intro: undefined,
    bpm: kind === 'nebula' ? 150 : base.bpm,
    voices: base.voices.map((v, i) => (i === 0 ? { ...v, wave, vol, env: 'chip' } : v)),
  };
});
TRACKS.gc_brotes_fast = { ...TRACKS.gc_brotes, bpm: 156 };
