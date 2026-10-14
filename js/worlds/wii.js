// MUNDO 6 — Ciudad Sensor (Wii, 2006). Diseño en docs/LORE.md §9.
// Blanco y azul cielo, como el menú de la consola. Aquí se practica RITMO CONSTANTE y VELOCIDAD:
// letras al compás, una mano a la vez, mayúsculas exactas, números y símbolos (° % /), texto de cabeza.
// Los acentos y la Ñ siguen contando (strictAccents), como desde el Reino 16-Bit.
//
// Escenas propias (js/scenes/):
//   wii-kit.js      paleta, 3D limpio (WiiPoly, sobre poly3d.js), pausa
//   wii-battle.js   enemigos normales en 3D, cada uno con su forma de escribir (wiiTask / wiiDodge)
//   wii-gym.js      ENTRENADOR MI: boliche, tenis y box (y los minijuegos sueltos del pueblo)
//   wii-torneo.js   DANI TURBO, Torneo Sensor (Tecloides 3 contra 3, la final del rival)
//   wii-cometa.js   CAPITAN COMETA (jefe): gravedad desde 4 lados, texto de cabeza, 7 estrellitas
// Lo del pueblo (Barrio Sensor, gimnasio, observatorio, amigos): js/worlds/wii-pueblo.js.
//
// Para probar sin jugar todo (consola del navegador):
//   Save.data.consoles.gamecube = true; Game.go('map', { world: 'wii' })

// ---------- Palabras del mundo (lore §16) ----------
WORDS.wii = ['24°', '75%', '10 km/h', '¡Ponte la correa!', 'izq', 'der', 'agacha', 'chuza', 'saque', 'raqueta', 'estrella',
  'gravedad', 'planeta', 'observatorio', 'canal', 'sensor', 'remoto', 'gimnasio', 'boliche', 'tenis', 'cometa'];

// ---------- Tecloides nuevos ----------
addTecloide('zumbito', {
  name: 'Zumbito', type: 'chispa', sprite: 'zumbito', hp: 46,
  desc: 'Una abeja de LED que zumba al ritmo. Bzz. Bzz. Bzz. Siempre a tiempo.',
  moves: [move('Zumbido', 'bzz', 20, 'chispa'), TECLEO, move('Aguijón', 'aguijón', 36, 'chispa'), move('Enjambre', 'enjambre', 44, 'chispa', 'aturdir')],
});
// Las formas finales de los iniciales (el equipo definitivo de Dani). Usan el dibujo de su forma base.
addTecloide('voltrueno', {
  name: 'Voltrueno', type: 'chispa', sprite: 'voltin', hp: 58,
  desc: 'La forma final de Voltín. Truena con solo verte.',
  moves: [move('Relámpago', 'relámpago', 44, 'chispa'), TECLEO, move('Eléctrico', 'eléctrico', 48, 'chispa'), move('Electricidad', 'electricidad', 56, 'chispa', 'aturdir')],
});
addTecloide('gotamar', {
  name: 'Gotamar', type: 'gota', sprite: 'gotin', hp: 62,
  desc: 'La forma final de Gotín. Ya no es una gota: es un mar con gorra.',
  moves: [move('Marejada', 'marejada', 44, 'gota'), TECLEO, move('Remolino', 'remolino', 46, 'gota'), move('Océano Azul', 'océano azul', 54, 'gota')],
});
addTecloide('brotarbol', {
  name: 'Brotárbol', type: 'brote', sprite: 'brotin', hp: 66,
  desc: 'La forma final de Brotín. Un árbol entero que salió de una tubería.',
  moves: [move('Hojarasca', 'hojarasca', 44, 'brote'), TECLEO, move('Enredadera', 'enredadera', 46, 'brote'), move('Árbol Gigante', 'árbol gigante', 56, 'brote', 'curar')],
});
const WII_FINAL_OF = { voltin: 'voltrueno', gotin: 'gotamar', brotin: 'brotarbol' };

TRAINERS.daniwii = {
  name: 'Dani Turbo',
  sprite: 'dani',
  music: 'wii_torneo',
  musicCasi: 'wii_torneo_casi',
  reward: 'medalla_sensor',
  // Su equipo definitivo: las tres formas finales, sin el "???". (El lore dice nivel 28; aquí el
  // nivel va de acuerdo con el tuyo para que la final sea difícil pero justa.)
  team: (starter) => {
    const s = STARTERS.includes(starter) ? starter : 'voltin';
    const top = Math.max(5, ...(Save.data.team || []).map((t) => t.lv));
    const other = STARTERS.find((x) => x !== s && x !== COUNTER[s]);
    return [
      { id: WII_FINAL_OF[COUNTER[s]], lv: top + 1 }, // el que te gana por tipo, un nivel menos (con +2 la final se perdía 1 de cada 5)
      { id: WII_FINAL_OF[other], lv: top + 1 },
      { id: WII_FINAL_OF[s], lv: top + 2 },
    ];
  },
  intro: [
    '* LOCUTOR: ¡BIENVENIDOS A LA GRAN FINAL DEL TORNEO SENSOR!',
    '* DANI: Llegaste. Sabía que ibas a llegar.\n* ...Mira. Ya no traigo al "???".',
    '* DANI: Lo dejé ir. No era mío. Era de él.\n* Y tampoco era de él, la verdad.',
    '* DANI: Este es mi equipo de verdad. Sin trucos.\n* Mis ataques son LARGOS y con acento. Y para esquivar tendrás 20 % menos de tiempo.',
    '* ¡DANI TURBO quiere pelear, 3 contra 3! (La final.)',
  ],
  lose: [
    '* DANI: ...Ok. Eres el más rápido del museo.\n* Lo digo yo, que soy el segundo.',
    '* DANI: Y oye... cuando vayas con el tipo morado, no vayas solo.',
  ],
  win: ['* DANI: ¡Ja! La final es mía. ¿Revancha? Claro que sí. Soy generoso.'],
  retry: ['* PROFESORA LETRA (desde las gradas): ¡Ya curé a tu equipo!', '* DANI: Otra vez. Y esta vez escribe con TODOS los dedos.'],
};

// ---------- Música ORIGINAL (lore §14.2) con el motor de js/music.js (era 'wii': flauta, cuerdas,
// bajo cálido, campanitas y reverb brillante). Cada pista usa `form`: el motor rellena cada sección
// para que todas las voces queden alineadas. Estilo: jazz y bossa de los menús, pop deportivo,
// orquesta espacial. Ninguna melodía viene de un juego; la única pieza ajena es la Oda a la alegría
// (Beethoven, dominio público), en el gimnasio.

// Sube o baja `n` semitonos todas las notas de un texto de fichas (para modular una sección).
const WII_PCS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const WII_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const wiiMidi = (l, acc, o) => WII_PC[l] + (acc === '#' ? 1 : acc === 'b' ? -1 : 0) + Number(o) * 12;
const wiiName = (m) => `${WII_PCS[((m % 12) + 12) % 12]}${Math.floor(m / 12)}`;
function wiiUp(s, n) {
  return s.replace(/([A-G])([#b]?)(\d)/g, (x, l, acc, o) => wiiName(wiiMidi(l, acc, o) + n));
}
// Segunda voz a una tercera diatónica arriba (escala dada en clases de tono, p. ej. Fa mayor).
function wiiThird(s, scale) {
  return s.replace(/([A-G])([#b]?)(\d)/g, (x, l, acc, o) => {
    const m = wiiMidi(l, acc, o);
    const i = scale.indexOf(((m % 12) + 12) % 12);
    if (i < 0) return x;
    let t = m + ((scale[(i + 2) % 7] - scale[i] + 12) % 12);
    if (t <= m) t += 12;
    return wiiName(t);
  });
}
// Acorde quebrado en corcheas: 4 notas → sube y baja (16 pasos); en 3/4 son 6 corcheas (12 pasos).
const wiiBroken = (ch) => { const [a, b, c, d] = ch.split('+'); return `${a}/2 ${b}/2 ${c}/2 ${d}/2 ${c}/2 ${b}/2 ${a}/2 ${b}/2`; };
// Envolvente de metales: ataque rápido y nota sostenida (la 'stab' se apagaba demasiado).
const WII_BRASS = { a: 0.01, d: 0.15, s: 0.7, r: 0.08 };
const wiiHarp = (ch) => { const [a, b, c, d] = ch.split('+'); return `${a}/2 ${b}/2 ${c}/2 ${d}/2 ${c}/2 ${b}/2`; };

// Gimnasio Sensor: la "Oda a la alegría" de Beethoven (9.ª sinfonía, 1824; dominio público) con
// arreglo propio de pop deportivo en Fa mayor. Nintendo la incluyó en Wii Music (2008): ver
// https://www.nintendoworldreport.com/news/17028/wii-music-trumpets-into-stores y la lista japonesa en
// https://purenintendo.com/wii-music-japanese-track-listing/ . Es pura negra, así que marca el pulso igual
// que el metrónomo. El tempo es la mecánica: se crea al tempo de cada prueba. Sin percusión fuerte (el
// TIC lo pone la escena). Vuelta 1: flauta con marimba; vuelta 2: trompetas, flauta a una tercera y cuerdas.
function wiiGymTrack(bpm) {
  const odeA = 'A5/4 A5/4 A#5/4 C6/4 | C6/4 A#5/4 A5/4 G5/4 | F5/4 F5/4 G5/4 A5/4 |';
  const ode = `${odeA} A5/6 G5/2 G5/8 | ${odeA} G5/6 F5/2 F5/8 | ` +
    'G5/4 G5/4 A5/4 F5/4 | G5/4 A5/2 A#5/2 A5/4 F5/4 | G5/4 A5/2 A#5/2 A5/4 G5/4 | F5/4 G5/4 C5/8 | ' +
    `${odeA} G5/6 F5/2 F5/8`;
  // Acordes por medio compás (16 compases).
  const H = 'F F F C F F C C F F F C F F C F C C C F C C F C F F F C F F C F'.split(' ');
  const CH = { F: 'F4+A4+C5', C: 'E4+G4+C5' };
  const BS = { F: ['F2', 'C3', 'F3'], C: ['C3', 'G2', 'C3'] };
  const bassO1 = H.map((c) => `${BS[c][0]}/4 ${BS[c][1]}/4`).join(' ');
  const bassO2 = H.map((c) => `${BS[c][0]}/2. ${BS[c][2]}/2. ${BS[c][1]}/2. ${BS[c][2]}/2.`).join(' ');
  const mar = H.map((c) => `-/2 ${CH[c]}/2. -/2 ${CH[c]}/2.`).join(' ');
  const pad = H.map((c) => `${CH[c]}/8`).join(' ');
  return {
    bpm, vol: 1.3, era: 'wii', form: ['O1', 'O2'],
    voices: [
      { wave: 'square', vol: 0.048, parts: { O1: ode, O2: wiiUp(ode, -12) } },
      { wave: 'brass', vol: 0.022, env: 'soft', parts: { O1: '-/256', O2: ode } },
      { wave: 'square', vol: 0.02, parts: { O1: '-/256', O2: wiiThird(ode, [5, 7, 9, 10, 0, 2, 4]) } },
      { wave: 'triangle', vol: 0.075, fx: 0, env: 'bass', parts: { O1: bassO1, O2: bassO2 } },
      { wave: [1, 0, 0.3, 0, 0.1], vol: 0.022, env: 'pluck', poly: true, fx: 0.5, parts: { O1: mar, O2: mar } },
      { wave: 'sawtooth', vol: 0.011, env: 'pad', poly: true, filter: 2500, parts: { O1: '-/256', O2: pad } },
      { wave: 'noise', vol: 0.016, fx: 0.1, parts: { O1: rep('h/2? h/2', 64), O2: rep('h/2? h/1? h/1', 64) } },
    ],
  };
}

// Invierte una pista (cuando el Capitán Cometa gira la gravedad, o en la Plaza Lanac): arma la vuelta
// completa (secciones de `form` con su relleno y grupos "( )*n" expandidos) y la toca de atrás para adelante.
function wiiReverse(track) {
  const expand = (s) => {
    let out = s;
    let prev;
    do {
      prev = out;
      out = out.replace(/\(([^()]*)\)(?:\s*\*\s*(\d+))?/g, (m, body, n) => Array(Number(n || 1)).fill(body).join(' '));
    } while (out !== prev);
    return out.replace(/\|/g, ' ');
  };
  const txt = (s) => (Array.isArray(s) ? s.join(' ') : String(s || ''));
  const len = (sec) => Math.max(0, ...track.voices.map((w) => (w.parts ? Music.steps(txt(w.parts[sec])) : 0)));
  const flat = (v) => {
    if (!track.form || !v.parts) return txt(v.notes);
    return track.form.map((sec) => {
      const p = txt(v.parts[sec]);
      const pad = len(sec) - Music.steps(p);
      return pad > 0 ? `${p} -/${pad}` : p;
    }).join(' ');
  };
  return {
    ...track,
    form: undefined,
    intro: undefined,
    voices: track.voices.map((v) => ({
      ...v, intro: undefined, parts: undefined,
      notes: expand(flat(v)).trim().split(/\s+/).filter(Boolean).reverse().join(' '),
    })),
  };
}

const WII_TRACKS = {
  // Ciudad Sensor (mapa): jazz-pop de menú con swing suave en Do mayor, 110 BPM. Flauta, vibráfono,
  // piano eléctrico, bajo caminante y escobillas. Forma A A' B A' (32 compases, ~70 s).
  // La Plaza Lanac (js/secretos/wii.js) la toca al revés con wiiReverse.
  wii_map: (() => {
    const melA = 'G5/3 E5/1 -/2 G5/2 B5/4 A5/2 G5/2 | C6/3 A5/1 -/2 E5/2 G5/6 -/2 | F5/3 A5/1 -/2 C6/2 E6/4 D6/2 C6/2 | ' +
      'B5/6 A5/2 G5/2 F5/2 D5/4 | E5/3 G5/1 -/2 B5/2 D6/4 C6/2 B5/2 | C#6/3 A5/1 -/2 E5/2 G5/4 F5/2 E5/2 | ' +
      'F5/2 A5/2 D6/4 B5/2 G5/2 F5/4 |';
    const melB = 'A5/2 C6/2 E6/6 D6/2 C6/2 A5/2 | B5/2 D6/2 G6/6 E6/2 D6/2 B5/2 | A5/2 C6/2 F6/6 E6/2 D6/2 C6/2 | ' +
      'B5/4 D6/4 G6/4! F6/4 | E6/3 D6/1 -/2 B5/2 G5/4 B5/4 | C#6/3 E6/1 -/2 G6/2 A6/4! G6/2 E6/2 | ' +
      'F6/4 E6/2 D6/2 C6/2 A5/2 F5/4 | D6/2 C6/2 B5/2 A5/2 G5/2 F5/2 D5/2 G4/2';
    const CH = { C: 'E4+G4+B4+D5', Am: 'G4+C5+E5+A5', Dm: 'F4+A4+C5+E5', G7: 'F4+B4+D5+G5', A7: 'G4+C#5+E5+A5',
      C6: 'E4+G4+A4+D5', F: 'E4+A4+C5+F5', Em: 'D4+G4+B4+E5' };
    const comp = (a, b = a) => `-/2 ${CH[a]}/2. -/4 ${CH[b]}/3 ${CH[b]}/1. -/4`;
    const progA = [['C'], ['Am'], ['Dm'], ['G7'], ['C'], ['A7'], ['Dm', 'G7']];
    const epA1 = `${progA.map((p) => comp(...p)).join(' ')} ${comp('C6', 'G7')}`;
    const epA2 = `${progA.map((p) => comp(...p)).join(' ')} ${CH.C6}/8 -/8`;
    const epB = [['F'], ['Em'], ['Dm'], ['G7'], ['Em'], ['A7'], ['Dm'], ['G7']].map((p) => comp(...p)).join(' ');
    const up = (k) => wiiUp(CH[k], 12);
    const vibA = ['C', 'Am', 'Dm', 'G7', 'C', 'A7', 'Dm', 'C6'].map((k) => wiiBroken(up(k))).join(' ');
    const vibB = ['F', 'Em', 'Dm', 'G7', 'Em', 'A7', 'Dm', 'G7'].map((k) => wiiBroken(up(k))).join(' ');
    const basA = 'C3/4 E3/4 G3/4 A3/4 A2/4 C3/4 E3/4 G3/4 D3/4 E3/4 F3/4 F#3/4 G2/4 B2/4 D3/4 B2/4 ' +
      'C3/4 G2/4 A2/4 B2/4 A2/4 C#3/4 E3/4 G3/4 D3/4 F3/4 G2/4 B2/4';
    const basB = 'F2/4 A2/4 C3/4 E3/4 E2/4 G2/4 B2/4 D3/4 D3/4 C3/4 A2/4 F2/4 G2/4 A2/4 B2/4 D3/4 ' +
      'E3/4 D3/4 B2/4 G2/4 A2/4 B2/4 C#3/4 E3/4 D3/4 F3/4 A3/4 F3/4 G2/4 F2/4 E2/4 D2/4';
    const brush = 'k/4 h/2 h/2? s/4? h/2 h/2?';
    const fill = 'k/4 h/2 h/2 s/2? t/2 T/2 s/2';
    return {
      bpm: 110, vol: 1.3, era: 'wii', swing: 0.14, form: ['A1', 'A2', 'B', 'A2'],
      voices: [
        { wave: 'square', vol: 0.05, vib: 'light', parts: {
          A1: `${melA} E5/8 -/4 G4/2 A4/2`, A2: `${melA} C5/2 E5/2 G5/2 C6/8! -/2`, B: melB } },
        { wave: 'sine', vol: 0.022, env: 'pluck', fx: 0.7, pan: 0.3, parts: { A1: '-/128', A2: vibA, B: vibB } },
        { wave: [1, 0.35, 0.12, 0.06], vol: 0.026, env: 'pluck', poly: true, pan: -0.25, fx: 0.5,
          parts: { A1: epA1, A2: epA2, B: epB } },
        { wave: 'triangle', vol: 0.075, fx: 0, env: 'bass', parts: {
          A1: `${basA} C3/4 G2/4 A2/4 B2/4`, A2: `${basA} C3/4 E3/4 G3/4 C3/4`, B: basB } },
        { wave: 'noise', vol: 0.02, fx: 0.15, parts: {
          A1: `${rep(brush, 7)} ${fill}`, A2: `c+${rep(brush, 7)} ${fill}`, B: `c+${rep(brush, 7)} ${fill}` } },
      ],
    };
  })(),

  // Batalla normal Wii: rock-funk electrónico de carreras en Sol menor, 160 BPM. Bajo en semicorcheas,
  // trompetas al frente, arpegios de sintetizador y un puente a medio tiempo. I + A B A C (~48 s).
  wii_battle: (() => {
    const melA = 'G5/2! A#5/2 D6/3 C6/1 A#5/2 A5/2 G5/4 | F5/2 G5/2 A5/2 A#5/2 D6/4! C6/4 | ' +
      'A#5/2 G5/2 D#6/3 D6/1 C6/2 A#5/2 G5/4 | A5/2 A#5/2 C6/2 D6/2 F6/4! D#6/2 D6/2 | ' +
      'D6/3 C6/1 A#5/2 G5/2 D5/4 G5/4 | A#5/2 A5/2 G5/2 F5/2 G5/8 | ' +
      'D#5/2 G5/2 A#5/2 D#6/2 D6/3 C6/1 A#5/4 | A5/2 F#5/2 D5/2 F#5/2 A5/4 C6/4';
    const melB = 'G6/6 F6/2 D#6/4 A#5/4 | C6/6 D6/2 D#6/4 F6/4 | F#6/6 D6/2 A5/4 F#5/4 | G5/2 A5/2 A#5/2 C6/2 D6/8 | ' +
      'D#6/6 D6/2 C6/4 A#5/4 | A5/6 A#5/2 C6/4 F6/4! | F#6/4 G6/4 A6/4! F#6/4 | D6/2 C6/2 A5/2 F#5/2 D5/2 F#5/2 A5/2 C6/2';
    const melC = 'C5/4 D#5/4 G5/6 -/2 | F5/2 D#5/2 D5/2 C5/2 G5/8 | A#4/4 D5/4 G5/6 -/2 | A5/2 G5/2 F5/2 D5/2 G5/8 | ' +
      'C5/4 D#5/4 G#5/6 -/2 | A#5/2 G#5/2 G5/2 D#5/2 C6/8 | D6/4 C6/4 A5/4 F#5/4 | D5/1 F#5/1 A5/1 D6/1 F#6/1 A6/1 D6/1 A5/1 -/8';
    // Bajo: riff de semicorcheas sobre la raíz (raíz, octava, tercera y séptima del acorde).
    const riff = (r, o, t, s) => `${r}/2. ${r}/1 ${o}/1 ${r}/2. ${t}/2 ${r}/2. ${s}/2 ${r}/2 ${t}/2`;
    const BR = { Gm: ['G2', 'G3', 'A#2', 'F2'], Eb: ['D#2', 'D#3', 'G2', 'D2'], F: ['F2', 'F3', 'A2', 'D#2'],
      D: ['D2', 'D3', 'F#2', 'C3'], Cm: ['C2', 'C3', 'D#2', 'A#1'], Ab: ['G#1', 'G#2', 'C2', 'G1'] };
    const bass = (prog) => prog.map((c) => riff(...BR[c])).join(' ');
    const CH = { Gm: 'G4+A#4+D5', Eb: 'G4+A#4+D#5', F: 'F4+A4+C5', D: 'F#4+A4+D5', Cm: 'G4+C5+D#5', Ab: 'G#4+C5+D#5' };
    const arp = (prog) => prog.map((c) => `${CH[c]}/4. ${CH[c]}/2. ${CH[c]}/2. ${CH[c]}/4. ${CH[c]}/4.`).join(' ');
    const pad = (prog) => prog.map((c) => `${CH[c]}/16`).join(' ');
    const pA = ['Gm', 'Gm', 'Eb', 'F', 'Gm', 'Gm', 'Eb', 'D'];
    const pB = ['Eb', 'F', 'D', 'Gm', 'Eb', 'F', 'D', 'D'];
    const pC = ['Cm', 'Cm', 'Gm', 'Gm', 'Ab', 'Ab', 'D', 'D'];
    const beat = 'k/2 h/2 s/2 h/2 k/2 k/2 s/2 h/1 h/1';
    const fill = 'k/2 h/2 s/2 s/1 s/1 t/2 t/2 T/2 T/2';
    const half = 'k/4 h/2 h/2 s/4 h/2 h/2';
    return {
      bpm: 160, vol: 1.3, era: 'wii', form: ['A', 'B', 'A', 'C'], intro: ['I'],
      fx: { reverb: { time: 1.2, mix: 0.16 }, echo: { steps: 3, feedback: 0.25, mix: 0.12 } },
      voices: [
        { wave: 'brass', vol: 0.045, env: WII_BRASS, vib: 'light', parts: { I: '-/32', A: melA, B: melB, C: melC } },
        { wave: 'pulse25', vol: 0.02, env: 'stab', arp: 0.04, pan: 0.3, fx: 0.6, parts: { I: '-/32', A: arp(pA), B: '-/128', C: arp(pC) } },
        { wave: 'sawtooth', vol: 0.016, env: 'pad', poly: true, filter: 3000, pan: -0.3, parts: { I: '-/32', A: '-/128', B: pad(pB), C: pad(pC) } },
        { wave: 'triangle', vol: 0.08, fx: 0, env: 'bass', parts: {
          I: 'G2/2! -/6 G2/2! -/6 | D#2/4 F2/4 F#2/4 G2/2 -/2', A: bass(pA), B: bass(pB), C: bass(pC) } },
        { wave: 'noise', vol: 0.02, fx: 0.15, parts: {
          I: 'c+k/2! -/6 k/2! -/6 | s/1 s/1 s/2 s/2 s/2 t/2 t/2 T/2 T/2',
          A: `c+${rep(beat, 7)} ${fill}`,
          B: `c+${rep('k/2 h/2 s/2 o/2 k/2 k/2 s/2 o/2', 7)} ${fill}`,
          C: `${rep(half, 6)} ${rep('s/2', 4)} ${rep('s/1', 8)} | k/2 -/6 s/1 s/1 s/1 s/1 t/2 T/2` } },
      ],
    };
  })(),

  // Torneo Sensor: el Reto de Tecloides versión final, rock orquestal de torneo en La menor, 170 BPM.
  // Abre con la subida cromática del reto; la segunda mitad modula a Si menor y el clímax regresa por
  // Mi7. I + A A' B C (32 compases, ~45 s; a 184 BPM con "¡casi!").
  wii_torneo: (() => {
    const mel7 = 'A5/2! E5/2 A5/2 C6/2 B5/3 A5/1 E5/4 | F5/2 A5/2 C6/2 F6/2 E6/3 C6/1 A5/4 | ' +
      'G5/2 B5/2 D6/2 G6/2 F6/2 E6/2 D6/4 | E6/6 C6/2 A5/8 | A5/2 C6/2 E6/2 A6/2! G6/3 E6/1 C6/4 | ' +
      'F6/3 E6/1 D6/2 C6/2 A5/4 C6/4 | B5/2 C6/2 D6/2 B5/2 G5/4 D6/4 |';
    const melA1 = `${mel7} E6/4! D6/2 B5/2 G#5/4 E5/4`;
    const melA2 = `${mel7} F#5/2 A#5/2 C#6/2 E6/2 F#6/8!`;
    const melC = 'B5/4 D6/4 G6/6 F#6/2 | E6/4 C#6/4 A6/6! G6/2 | F#6/6 E6/2 C#6/4 A5/4 | B5/2 C#6/2 D6/2 E6/2 F#6/8 | ' +
      'G6/6 F#6/2 E6/4 D6/4 | E6/6 F#6/2 G6/4 A6/4! | B6/6! G#6/2 E6/4 D6/4 | B5/2 G#5/2 E5/2 D5/2 B4/2 D5/2 E5/2 G#5/2';
    const R = { Am: 'A2', F: 'F2', G: 'G2', E: 'E2', 'F#': 'F#2', Bm: 'B2', A: 'A2', 'F#m': 'F#2', E7: 'E2' };
    const oct = (c) => `${R[c]}/2 ${wiiUp(R[c], 12)}/2`;
    const gal = (c) => `${R[c]}/1 ${R[c]}/1 ${wiiUp(R[c], 12)}/2`;
    const pA1 = ['Am', 'F', 'G', 'Am', 'Am', 'F', 'G', 'E'];
    const pA2 = ['Am', 'F', 'G', 'Am', 'Am', 'F', 'G', 'F#'];
    const pC = ['G', 'A', 'F#m', 'Bm', 'G', 'A', 'E7', 'E7'];
    const bass = (prog, f = oct) => prog.map((c) => rep(f(c), 4)).join(' ');
    const CH = { Am: 'A3+C4+E4', F: 'A3+C4+F4', G: 'B3+D4+G4', E: 'B3+E4+G#4', 'F#': 'A#3+C#4+F#4',
      A: 'A3+C#4+E4', 'F#m': 'A3+C#4+F#4', Bm: 'B3+D4+F#4', E7: 'B3+D4+G#4' };
    const pad = (prog) => prog.map((c) => `${CH[c]}/16`).join(' ');
    const glk = (prog) => prog.map((c) => rep(`${wiiUp(CH[c].split('+')[2], 24)}/2 -/2`, 4)).join(' ');
    const rock = 'k/2 h/2 s/2 h/2 k/2 k/2 s/2 h/2';
    const fill = 'k/2 s/1 s/1 s/2 s/1 s/1 t/2 t/2 T/2 T/2';
    return {
      bpm: 170, vol: 1.3, era: 'wii', form: ['A1', 'A2', 'B', 'C'], intro: ['I'],
      fx: { reverb: { time: 1.5, mix: 0.2 }, echo: { steps: 3, feedback: 0.2, mix: 0.08 } },
      voices: [
        { wave: 'brass', vol: 0.045, env: WII_BRASS, vib: 'light', parts: {
          I: '-/4 E5 F5 F#5 G5 G#5 A5 A#5 B5 C6/4!', A1: melA1, A2: melA2, B: wiiUp(melA1, 2), C: melC } },
        { wave: 'sawtooth', vol: 0.016, env: 'pad', poly: true, pan: -0.25, parts: {
          I: '-/16', A1: pad(pA1), A2: pad(pA2), B: wiiUp(pad(pA1), 2), C: pad(pC) } },
        { wave: 'sine', vol: 0.02, env: 'pluck', pan: 0.35, parts: { I: '-/16', A1: '-/128', A2: glk(pA2), B: wiiUp(glk(pA1), 2), C: glk(pC) } },
        { wave: 'triangle', vol: 0.085, fx: 0, env: 'bass', parts: {
          I: '-/8 E2/8!', A1: bass(pA1), A2: bass(pA2), B: wiiUp(bass(pA1), 2), C: bass(pC, gal) } },
        { wave: 'noise', vol: 0.021, fx: 0.15, parts: {
          I: 'k/1! k/1! k/1! k/1! -/8 s/1 s/1 s/1 s/1',
          A1: `c+${rep(rock, 7)} ${fill}`, A2: `c+${rep(rock, 7)} ${fill}`, B: `c+${rep(rock, 7)} ${fill}`,
          C: `c+${rep('k/2 h/1 h/1 s/2 h/1 h/1 k/2 k/2 s/2 o/2', 7)} ${fill}` } },
      ],
    };
  })(),

  // Capitán Cometa (jefe): vals espacial orquestal en Mi bemol mayor, 3/4 a 100 BPM. Cuerdas al frente,
  // arpa en corcheas, timbales y una parte B en Do menor que sube al clímax. A A' B A' (32 compases, ~58 s).
  // Cuando gira la gravedad suena al revés (wii_cometa_rev).
  wii_cometa: (() => {
    const mel7 = 'A#5/6 G5/3 A#5/3 | D#6/9 D6/3 | C6/6 G#5/3 C6/3 | A#5/12 | C6/6 D#6/3 G6/3 | F6/9 D#6/3 | D6/6 C6/3 A#5/3 |';
    const melB = 'G6/6 F6/3 D#6/3 | D#6/6 C6/3 G#5/3 | G#6/6 G6/3 F6/3 | D6/9 B5/3 | C6/3 D6/3 D#6/3 G6/3 | ' +
      'C7/6! A#6/3 G#6/3 | A6/6 F6/3 D#6/3 | D6/3 C6/3 A#5/3 G#5/3';
    const CH = { Eb: 'D#4+G4+A#4+D#5', Ab: 'D#4+G#4+C5+D#5', Cm: 'D#4+G4+C5+D#5', F7: 'D#4+F4+A4+C5',
      Bb7: 'D4+F4+G#4+A#4', Fm: 'C4+F4+G#4+C5', G7: 'D4+F4+G4+B4' };
    const R = { Eb: 'D#2', Ab: 'G#1', Cm: 'C2', F7: 'F2', Bb7: 'A#1', Fm: 'F2', G7: 'G1' };
    const pA1 = ['Eb', 'Eb', 'Ab', 'Eb', 'Cm', 'F7', 'Bb7', 'Bb7'];
    const pA2 = ['Eb', 'Eb', 'Ab', 'Eb', 'Cm', 'F7', 'Bb7', 'Eb'];
    const pB = ['Cm', 'Ab', 'Fm', 'G7', 'Cm', 'Ab', 'F7', 'Bb7'];
    const harp = (p) => p.map((c) => wiiHarp(wiiUp(CH[c], 12))).join(' ');
    const pah = (p) => p.map((c) => `-/4 ${CH[c]}/4. ${CH[c]}/4.`).join(' ');
    const bass = (p) => p.map((c) => `${R[c]}/4 ${wiiUp(R[c], 7)}/4. ${wiiUp(R[c], 12)}/4.`).join(' ');
    const drA = `c+T/4 -/8 ${rep('T/4 -/8', 6)} T/2 T/2 s/2 s/2 t/2 T/2`;
    const drB = `c+T/4 k/4? -/4 ${rep('T/4 k/4? -/4', 6)} s/1 s/1 s/1 s/1 s/2 s/2 c+T/4`;
    return {
      bpm: 100, vol: 1.3, era: 'wii', form: ['A1', 'A2', 'B', 'A2'],
      voices: [
        { wave: 'sawtooth', vol: 0.04, env: 'soft', vib: { rate: 5.2, depth: 0.2, delay: 0.25 }, parts: {
          A1: `${mel7} G#5/6 F5/3 D5/3`, A2: `${mel7} D#6/6! A#5/3 G5/3`, B: melB } },
        { wave: 'square', vol: 0.018, parts: { A1: '-/96', A2: `${mel7} D#6/6! A#5/3 G5/3`, B: melB } },
        { wave: 'sine', vol: 0.026, env: 'pluck', pan: 0.3, parts: { A1: harp(pA1), A2: harp(pA2), B: harp(pB) } },
        { wave: 'sawtooth', vol: 0.018, env: 'stab', poly: true, pan: -0.3, parts: { A1: pah(pA1), A2: pah(pA2), B: pah(pB) } },
        { wave: 'triangle', vol: 0.075, fx: 0, env: 'bass', parts: { A1: bass(pA1), A2: bass(pA2), B: bass(pB) } },
        { wave: 'noise', vol: 0.016, fx: 0.4, parts: { A1: drA, A2: drA, B: drB } },
      ],
    };
  })(),

  // Fase final (7 estrellitas): marcha orquestal heroica en Mi bemol, 4/4 a 128. Cada compás trae un
  // arpegio de 7 notas (una por estrellita). Metales, cuerdas, campanitas y redobles. A B A C (~60 s).
  wii_cometa2: (() => {
    const melA = 'G5/4 A#5/4 D#6/6 D6/2 | C6/4 A#5/4 G5/8 | G#5/4 C6/4 D#6/6 F6/2 | D6/8 A#5/4 F5/4 | ' +
      'G5/4 A#5/4 D#6/6 F6/2 | G6/6 F6/2 D#6/4 C6/4 | C6/4 D#6/4 D6/4 F6/4 | D#6/12! -/4';
    const melB = 'C6/6 D#6/2 G#6/8 | A#6/6 G#6/2 F6/8 | G6/6 F6/2 D6/4 A#5/4 | C6/4 D6/4 D#6/4 G6/4 | ' +
      'G#6/6 G6/2 F6/4 C6/4 | D6/4 F6/4 A#6/8! | G6/6 F6/2 D#6/4 A#5/4 | G#5/2 A#5/2 C6/2 D6/2 F6/4 D6/4';
    const melC = 'D#5/8 G5/4 C6/4 | C6/8 A#5/4 G#5/4 | G5/8 A#5/4 D#6/4 | D6/12 -/4 | D#6/8 D6/4 C6/4 | ' +
      'D#6/8 F6/4 G6/4 | A6/8 F6/4 C6/4 | A#5/2 C6/2 D6/2 F6/2 A#6/8';
    // Arpegios de 7 notas por acorde (raíz, 3.ª, 5.ª y siguen subiendo).
    const ST = { Eb: 'D#5 G5 A#5 D#6 G6 A#6 D#7', Cm: 'C5 D#5 G5 C6 D#6 G6 C7', Ab: 'G#4 C5 D#5 G#5 C6 D#6 G#6',
      Bb: 'A#4 D5 F5 A#5 D6 F6 A#6', Gm: 'G4 A#4 D5 G5 A#5 D6 G6', Fm: 'F4 G#4 C5 F5 G#5 C6 F6', F: 'F4 A4 C5 F5 A5 C6 F6',
      Bb7: 'A#4 D5 F5 G#5 A#5 D6 F6' };
    const stars = (p) => p.map((c) => `${ST[c]} -/9`).join(' ');
    const pA = ['Eb', 'Cm', 'Ab', 'Bb', 'Eb', 'Cm', 'Ab', 'Eb'];
    const pB = ['Ab', 'Bb', 'Gm', 'Cm', 'Fm', 'Bb', 'Eb', 'Bb7'];
    const pC = ['Cm', 'Ab', 'Eb', 'Bb', 'Cm', 'Ab', 'F', 'Bb'];
    const root = (c) => ST[c].split(' ')[0];
    const bass = (p) => p.map((c) => { const r = wiiUp(root(c), -24); return `${r}/2 ${r}/2 ${wiiUp(r, 12)}/2 ${r}/2 ${r}/2 ${wiiUp(r, 7)}/2 ${wiiUp(r, 12)}/2 ${wiiUp(r, 7)}/2`; }).join(' ');
    const chord = (c) => ST[c].split(' ').slice(0, 3).map((n) => wiiUp(n, -12)).join('+');
    const strings = (p) => p.map((c) => `${chord(c)}/16`).join(' ');
    const march = 'k/2 s/1? s/1? s/2 k/2 k/2 s/2 s/2 h/2';
    const roll = 'k/2 s/1 s/1 s/1 s/1 s/1 s/1 s/1 s/1 s/1 s/1 t/2 T/2';
    return {
      bpm: 128, vol: 1.3, era: 'wii', form: ['A', 'B', 'A', 'C'],
      voices: [
        { wave: 'brass', vol: 0.05, env: WII_BRASS, vib: 'light', parts: { A: melA, B: melB, C: '-/128' } },
        { wave: 'square', vol: 0.05, parts: { A: '-/128', B: '-/128', C: melC } },
        { wave: 'sine', vol: 0.024, env: 'pluck', pan: 0.3, parts: { A: stars(pA), B: stars(pB), C: stars(pC) } },
        { wave: 'sawtooth', vol: 0.014, env: 'pad', poly: true, pan: -0.3, parts: { A: strings(pA), B: strings(pB), C: strings(pC) } },
        { wave: 'triangle', vol: 0.075, fx: 0, env: 'bass', parts: { A: bass(pA), B: bass(pB), C: bass(pC) } },
        { wave: 'noise', vol: 0.018, fx: 0.25, parts: {
          A: `c+${rep(march, 7)} ${roll}`, B: `c+${rep(march, 7)} ${roll}`,
          C: `${rep('T/4 -/4 k/4? -/4', 7)} ${roll}` } },
      ],
    };
  })(),

  // Canal de los muñequitos: bossa nova juguetona y ORIGINAL en Do mayor, 114 BPM (guiño al estilo de
  // los canales, no a una melodía). Silbido de flauta, guitarra de nylon, bajo de bossa y cuerdas en B.
  // A A B A (32 compases, ~67 s).
  wii_canal: (() => {
    const melA = '-/2 E5/2 G5/2 B5/4 A5/2 G5/2 E5/2 | D5/3 E5/3 G5/2 -/8 | -/2 F5/2 A5/2 C6/4 B5/2 A5/2 F5/2 | ' +
      'E5/3 F5/3 D5/2 -/8 | -/2 G5/2 B5/2 D6/4 C6/2 B5/2 G5/2 | A5/3 C#6/3 E6/2 -/4 D6/2 C#6/2 | ' +
      'D6/3 A5/3 F5/2 -/2 E5/2 F5/2 A5/2 | G5/12 -/4';
    const melB = 'A5/4 C6/2 E6/6 D6/2 C6/2 | G#5/4 C6/2 D6/6 C6/2 G#5/2 | G5/3 B5/3 D6/2 -/2 E6/2 D6/2 B5/2 | ' +
      'C#6/6 A5/2 G5/4 E5/4 | F5/3 A5/3 C6/2 -/2 D6/2 E6/2 F6/2 | G6/6! F6/2 D6/4 B5/4 | ' +
      'C6/3 B5/3 G5/2 -/2 E5/2 D5/2 E5/2 | D5/8 -/4 G4/2 B4/2';
    const CH = { C: 'E3+B3+D4+G4', Dm: 'F3+C4+E4+A4', G7: 'F3+B3+D4+G4', Em: 'D3+G3+B3+E4', A7: 'G3+C#4+E4+A4',
      F: 'E3+A3+C4+F4', Fm: 'D3+G#3+C4+F4' };
    const R = { C: ['C3', 'G2'], Dm: ['D3', 'A2'], G7: ['G2', 'D3'], Em: ['E3', 'B2'], A7: ['A2', 'E3'], F: ['F2', 'C3'], Fm: ['F2', 'C3'] };
    const pA = ['C', 'C', 'Dm', 'G7', 'Em', 'A7', 'Dm', 'G7'];
    const pB = ['F', 'Fm', 'Em', 'A7', 'Dm', 'G7', 'C', 'G7'];
    // Guitarra: ritmo de bossa de dos compases (el segundo compás va desplazado).
    const gtr = (p) => p.map((c, i) => (i % 2 === 0 ?
      `${CH[c]}/3. ${CH[c]}/3. ${CH[c]}/2. -/2 ${CH[c]}/3. ${CH[c]}/3.` :
      `-/2 ${CH[c]}/3. ${CH[c]}/3. ${CH[c]}/2. -/2 ${CH[c]}/2. ${CH[c]}/2.`)).join(' ');
    const bass = (p) => p.map((c) => { const [r, f] = R[c]; return `${r}/6 ${f}/2 ${f}/6 ${r}/2`; }).join(' ');
    const pad = (p) => p.map((c) => `${wiiUp(CH[c], 12)}/16`).join(' ');
    const bossa = 'k/3 h/1? h/2 s/2? k/3 h/1? h/2 s/2?';
    return {
      bpm: 114, vol: 1.3, era: 'wii', form: ['A', 'A', 'B', 'A'],
      voices: [
        { wave: 'square', vol: 0.05, legato: 0.8, vib: 'light', parts: { A: melA, B: melB } },
        { wave: [1, 0.45, 0.25, 0.12, 0.06], vol: 0.026, env: 'pluck', poly: true, pan: -0.25, fx: 0.4, parts: { A: gtr(pA), B: gtr(pB) } },
        { wave: 'sawtooth', vol: 0.014, env: 'pad', poly: true, filter: 2200, pan: 0.25, parts: { A: '-/128', B: pad(pB) } },
        { wave: 'triangle', vol: 0.075, fx: 0, env: 'bass', parts: { A: bass(pA), B: bass(pB) } },
        { wave: 'noise', vol: 0.018, fx: 0.1, parts: { A: rep(bossa, 8), B: `c+${rep(bossa, 8)}` } },
      ],
    };
  })(),
};
WII_TRACKS.wii_torneo_casi = { ...WII_TRACKS.wii_torneo, bpm: 184 };
WII_TRACKS.wii_cometa_rev = wiiReverse(WII_TRACKS.wii_cometa);
WII_TRACKS.wii_gym_90 = wiiGymTrack(90);
WII_TRACKS.wii_gym_100 = wiiGymTrack(100);
WII_TRACKS.wii_gym_120 = wiiGymTrack(120);

// ---------- Sprites (16 x 16, redonditos y a todo color; ojos de puntito, sin nariz) ----------
const WII_SPRITES = {
  sensorin: wiiArt([
    '................',
    '................',
    '................',
    '....P......P....',
    '...PP......PP...',
    '.KKKKKKKKKKKKKK.',
    'KWWWWWWWWWWWWWWK',
    'KLKKKKKKKKKKKKLK',
    'KLKPPKKKKKKPPKLK',
    'KLKPWKKKKKKPWKLK',
    'KLKKKKKSSKKKKKLK',
    'KWWWWWWWWWWWWWWK',
    '.KKKKKKKKKKKKKK.',
    '......KGGK......',
    '.....KGGGGK.....',
    '.....KKKKKK.....',
  ]),
  correita: wiiArt([
    '................',
    '.....KKKKKK.....',
    '....KBBBBBBK....',
    '...KBK....KBK...',
    '...KBK....KBK...',
    '...KBK....KBK...',
    '....KBK..KBK....',
    '.....KBKKBK.....',
    '....KKGGGGKK....',
    '...KLLLLLLLLK...',
    '...KLKLLLLKLK...',
    '...KLLLLLLLLK...',
    '...KLLLKKLLLK...',
    '...KLLLKKLLLK...',
    '....KKKKKKKK....',
    '................',
  ]),
  nunchuquin: wiiArt([
    '.......KKK......',
    '......KGGGK.....',
    '......KGWGK.....',
    '.......KKK......',
    '.....KKKKKK.....',
    '....KWWWWWWK....',
    '...KWKWWWWKWK...',
    '...KWWWWWWWWK...',
    '...KWWKWWKWWK...',
    '...KWWWKKWWWK...',
    '....KWWWWWWK....',
    '....KWWWWWWK....',
    '.....KWWWWK.....',
    '......KKKK......',
    '.......GG.......',
    '........GGGGG...',
  ]),
  munequito: wiiArt([
    '................',
    '.....KKKKKK.....',
    '....KNNNNNNK....',
    '...KNNNNNNNNK...',
    '...KFFFFFFFFK...',
    '...KFKFFFFKFK...',
    '...KFFFFFFFFK...',
    '...KFFKFFKFFK...',
    '....KFFKKFFK....',
    '.....KKKKKK.....',
    '....KSSSSSSK....',
    '..KFKSSSSSSKFK..',
    '...KKSSSSSSKK...',
    '....KGGKKGGK....',
    '....KGGKKGGK....',
    '....KKK..KKK....',
  ]),
  canalclima: wiiArt([
    '................',
    '..........YY....',
    '.........YYYY...',
    '.....KKK.YYYY...',
    '....KWWWKKYY....',
    '..KKKWWWWWKK....',
    '.KWWWWWWWWWWK...',
    'KWWKWWWWWKWWWK..',
    'KWWWWWWWWWWWWK..',
    'KWWWWKKKWWWWWK..',
    '.KWWWWWWWWWWK...',
    '..KKKKKKKKKK....',
    '....S...S...S...',
    '...S...S...S....',
    '................',
    '................',
  ]),
  zumbito: wiiArt([
    '................',
    '....SS....SS....',
    '...SWWS..SWWS...',
    '...SWWS..SWWS...',
    '....SSK..KSS....',
    '.....KKKKKK.....',
    '....KYYYYYYK....',
    '...KYKYYYYKYK...',
    '...KYYYYYYYYK...',
    '...KKKKKKKKKK...',
    '...KYYYKKYYYK...',
    '...KKKKKKKKKK...',
    '....KYYYYYYK....',
    '.....KKKKKK.....',
    '.......KK.......',
    '........K.......',
  ]),
  entrenadormi: wiiArt([
    '................',
    '.....KKKKKK.....',
    '....KOOOOOOK....',
    '...KRRRRRRRRK...',
    '...KFFFFFFFFK...',
    '...KFKFFFFKFK...',
    '...KFFFFFFFFK...',
    '...KFFKKKKFFK...',
    '....KFFFFFFK....',
    '...KKKKKKKKKK...',
    '..KWWWWBBWWWWK..',
    '..KWWWWBBWWWWK..',
    '..KFKWWBBWWKFK..',
    '...KWWWWWWWWK...',
    '....KGGKKGGK....',
    '....KKK..KKK....',
  ]),
  cometa: wiiArt([
    '.......YY.......',
    '......KYYK......',
    '....KKKKKKKK....',
    '...KNNNNNNNNK...',
    '..KKKKKKKKKKKK..',
    '...KFFFFFFFFK...',
    '...KFKFFFFKFK...',
    '...KFFFFFFFFK...',
    '...KFFFKKFFFK...',
    '....KFFFFFFK....',
    '..KBKKKKKKKKBK..',
    '.KBBKWWYWWKBBK..',
    '.KBBKWWWWWKBBK..',
    'KBBBKWWWWWKBBBK.',
    'KBBBKNNKNNKBBBK.',
    'KKKKKKKKKKKKKKK.',
  ]),
  pelota_boliche: wiiArt([
    '................',
    '................',
    '.....KKKKKK.....',
    '....KBBBBBBK....',
    '...KBBSBBBBBK...',
    '..KBBSBBBBBBBK..',
    '..KBBBBBKKBBBK..',
    '..KBBBBBKKBKBK..',
    '..KBBBBBBBBKBK..',
    '..KBBBBBBBBBBK..',
    '..KNBBBBBBBBNK..',
    '...KNBBBBBBNK...',
    '....KNNNNNNK....',
    '.....KKKKKK.....',
    '................',
    '................',
  ]),
  estrellita_capitan: wiiArt([
    '.......KK.......',
    '......KYYK......',
    '......KYYK......',
    '.....KYYYYK.....',
    'KKKKKKYYYYKKKKKK',
    'KYYYYYYYYYYYYYYK',
    '.KYYYKYYYYKYYYK.',
    '..KYYKYYYYKYYK..',
    '...KYYYYYYYYK...',
    '...KYYYKKYYYK...',
    '..KYYYYYYYYYYK..',
    '..KYYYYKKYYYYK..',
    '.KYYYKK..KKYYYK.',
    '.KYKK......KKYK.',
    '.KK..........KK.',
    '................',
  ]),
  correa: wiiArt([
    '................',
    '....KKKKKKK.....',
    '...KBBBBBBBK....',
    '..KBK.....KBK...',
    '..KBK.....KBK...',
    '..KBK.....KBK...',
    '...KBK...KBK....',
    '....KBK.KBK.....',
    '.....KBKBK......',
    '.....KGGGK......',
    '....KGLLLGK.....',
    '....KGLLLGK.....',
    '.....KGGGK......',
    '......KBK.......',
    '......KBK.......',
    '.......K........',
  ]),
  sensor: wiiArt([
    '................',
    '................',
    '................',
    '................',
    '................',
    '..P..........P..',
    '.KKKKKKKKKKKKKK.',
    'KWWWWWWWWWWWWWWK',
    'KLKKKKKKKKKKKKLK',
    'KLKPPKKKKKKPPKLK',
    'KLKKKKKKKKKKKKLK',
    'KWWWWWWWWWWWWWWK',
    '.KKKKKKKKKKKKKK.',
    '................',
    '................',
    '................',
  ]),
  medalla_sensor: wiiArt([
    '....KK....KK....',
    '....KBK..KBK....',
    '.....KBKKBK.....',
    '......KBBK......',
    '.....KKKKKK.....',
    '....KYYYYYYK....',
    '...KYYOOOOYYK...',
    '..KYYOYYYYOYYK..',
    '..KYOYYWWYYOYK..',
    '..KYOYWYYWYOYK..',
    '..KYOYYWWYYOYK..',
    '..KYYOYYYYOYYK..',
    '...KYYOOOOYYK...',
    '....KYYYYYYK....',
    '.....KKKKKK.....',
    '................',
  ]),
  cara_mii: wiiArt([
    '................',
    '.....KKKKKK.....',
    '....KBBBBBBK....',
    '...KBBBBBBBBK...',
    '..KBBBBBBBBBBK..',
    '..KFFFFFFFFFFK..',
    '..KFFKFFFFKFFK..',
    '..KFFKFFFFKFFK..',
    '..KFFFFFFFFFFK..',
    '..KFFFFFFFFFFK..',
    '..KFFKFFFFKFFK..',
    '..KFFFKKKKFFFK..',
    '...KFFFFFFFFK...',
    '....KKFFFFKK....',
    '......KKKK......',
    '................',
  ]),
};
WII_SPRITES.pelota_dorada = wiiRecolor(WII_SPRITES.pelota_boliche, { B: 'Y', S: 'W', N: 'O' });

// ---------- Mecánicas de cada enemigo (lore §9.3) ----------

const WII_BASE = { wii: true, theme: 'wii', music: 'wii_battle', strictAccents: true, fightTime: 0.95 };

// Sin acentos (teclado sin acentos): se quitan ¡ ¿ y el ° se dice "grados".
const wiiList = (list) => list.map(wiiSigns);

// Zumbito: cada palabra pega más si las letras van parejitas, al ritmo del metrónomo.
function wiiBeatDamage(unit, dmg, battle) {
  const task = battle.task;
  const stamps = task && task.stamps ? task.stamps.slice(-unit.text.length) : null;
  const steady = wiiSteadiness(stamps, WII_BEAT_MS * diff().time);
  if (steady >= 0.8) battle.floatText('¡AL RITMO!', 'mercy');
  return Math.max(1, Math.round(dmg * (0.6 + steady * 0.9)));
}

function wiiIntroPages() {
  return [
    '* (La tubería te deja en una ciudad blanquísima.\n* Todo brilla como recién lavado.)',
    '* BIT: ¡Whoa! ¡La CIUDAD SENSOR! Mira la pantalla gigante: tiene CANALES...\n* ...pero casi todos están APAGADOS.',
    '* En cada edificio parpadea una lucecita roja: la luz de standby.\n* BIT: Es él. El tipo morado quiere apagar TODO. Un apagón definitivo.',
    '* BIT: Si ganamos en cada zona, los canales se prenden otra vez.\n* ¡Vamos a encender la ciudad!',
    '* BIT: Aquí todo va al RITMO. Y los acentos siguen contando.\n* Tip: el ° se escribe con Shift + la tecla de la izquierda del 1 (en Mac: Option + Shift + 8).',
  ];
}

// ---------- El mundo ----------
addWorld({
  id: 'wii',
  order: 6,
  name: 'Ciudad Sensor',
  theme: 'wii',               // css/worlds/wii.css
  music: 'wii_map',
  requires: 'gamecube',       // la tubería brota al rescatar la GameCube (jefe del Mundo 5)
  console: 'wii',
  // Plaza Canal (de menos a más difícil) → Gimnasio Sensor → Torneo Sensor → Observatorio.
  nodes: ['zumbito', 'munequito', 'canalclima', 'correita', 'nunchuquin', 'sensorin', 'entrenadormi', 'daniwii', 'cometa'],
  enemies: {
    zumbito: {
      ...WII_BASE,
      name: 'Zumbito Salvaje', sprite: 'zumbito', model: 'zumbito', wiiTask: 'beat', wiiDodge: 'beat', fightTime: 1.15,
      hp: 90, atk: 5, def: 3, xp: 42,
      fightWords: 3,
      words: ['zumbido', 'abeja', 'panal', 'miel', 'ritmo', 'compás', 'flor', 'néctar', 'bzz bzz', 'aleteo', 'polen', 'colmena', 'antena', 'tic tac'],
      blurb: 'Una abeja de LED que zumba al ritmo. Si la perdonas... quizá quiera ser tu Tecloide.',
      keysHint: 'Ritmo constante: una letra en cada tic',
      intro: '* ¡Bzz! ¡Bzz! ¡Un Zumbito Salvaje!\n* Zumba exactamente cada 600 milisegundos. Ni uno más.',
      check: '* ZUMBITO SALVAJE - ATQ 5 DEF 3\n* Un Tecloide CHISPA salvaje. Si escribes al ritmo de su zumbido, pegas más fuerte.',
      idle: ['* Zumbito zumba: bzz... bzz... bzz... Perfectamente a tiempo.', '* BIT: Aquí todos se mueven agitando los brazos.\n* Yo no tengo brazos. Qué envidia.', '* Huele a miel recién encendida.'],
      calm: '* Zumbito zumba más bajito, como canción de cuna.',
      taunts: ['¡Bzz!', '¡Al ritmo, al ritmo!', '¡Tic, tac, bzz!'],
      acts: [
        { name: 'Ritmo', text: 'aplaudes a su ritmo', mercy: 50, reply: '* "¡Bzz bzz bzz!" Zumbito baila en el aire.' },
        { name: 'Flor', text: 'le das una flor de led', mercy: 45, reply: '* "¡Mi favorita!" La flor parpadea en azul.' },
        { name: 'Silencio', text: 'le pides un segundo de silencio', mercy: 35, reply: '* "...bzz? Un segundo. Ya."' },
      ],
      bullets: { count: 14, interval: 600, speed: 40, pool: ['b', 'z', 's', 'a', 'f', 'j', 'k', 'l', 'm', 'r', 'o', 'e'] },
      fightUnit: wiiBeatDamage,
      onEnter(scene, pages) {
        if (Save.data.flags.wiiIntro) return;
        Save.data.flags.wiiIntro = true;
        Save.write();
        pages.unshift(...wiiIntroPages());
        Quests.start('wii_canales');
      },
      onWin(scene, { spared, pages }) {
        if (!spared || typeof giveTecloide !== 'function') return;
        const t = giveTecloide('zumbito');
        if (t) pages.push('* Zumbito da tres vueltas a tu alrededor... ¡y se queda contigo!', t);
      },
    },
    munequito: {
      ...WII_BASE,
      name: 'Muñequito', sprite: 'munequito', model: 'munequito', caps: true, wiiTask: 'echo', wiiDodge: 'echo', fightTime: 1.1,
      hp: 100, atk: 6, def: 3, xp: 45,
      fightWords: 2,
      words: ['¡Hola, vecino!', 'Me gusta tu gorra.', '¿Jugamos boliche?', 'Soy tu copia.', '¡Choca esos cinco!', 'Ojos de puntito.', '¿Me imitas?', 'Sin nariz, ¿y qué?', 'Hoy es Martes.', '¡Qué cara tan simple!', 'Vivo en la Plaza.'],
      blurb: 'Un habitante de la ciudad con cara de puntitos. Repite lo que dices... y tú lo que él dice.',
      keysHint: 'Copiar frases EXACTAS: mayúsculas y signos',
      intro: '* ¡Un Muñequito te saluda agitando la mano!\n* ...Tú saludas. Él saluda igual. Tú paras. Él para.',
      check: '* MUÑEQUITO - ATQ 6 DEF 3\n* Copia todo. Escribe su frase EXACTA: con mayúsculas (SHIFT), comas y signos.',
      idle: ['* Muñequito te imita la postura. Se ve igualito.', '* BIT: ¿Ves esa manita que flota en el fondo?\n* Es mi tío.', '* Muñequito parpadea. Sus ojos son dos puntitos perfectos.'],
      calm: '* Muñequito sonríe con su boquita de una rayita.',
      taunts: ['¡Lo que tú digas!', '¡Lo que tú digas!', '¡Te copio!'],
      acts: [
        { name: 'Imitar', text: 'imitas su cara de puntitos', mercy: 50, reply: '* "¡Jaja! ¡Te pareces a mí!"' },
        { name: 'Crear', text: 'le diseñas unas cejas nuevas', mercy: 45, reply: '* "¡Cejas! ¡Qué expresivo!"' },
        { name: 'Saludar', text: 'lo saludas agitando la mano', mercy: 40, reply: '* Muñequito agita la mano igualito. Durante un buen rato.' },
      ],
      bullets: { count: 11, interval: 1150, speed: 36, pool: ['Hola', 'Copia', 'Igual', 'Tú', 'Yo', 'Mii', 'Cara', 'Ojos'] },
      fightList: wiiList,
    },
    canalclima: {
      ...WII_BASE,
      name: 'Canal Clima', sprite: 'canalclima', model: 'canalclima', wiiTask: 'ticker',
      hp: 105, atk: 5, def: 5, xp: 46,
      fightWords: 4,
      words: ['24°', '75%', '10 km/h', '18°C', '3/4', '90%', '12 km/h', '-5°', '50%', '1/2', 'lluvia 20%', 'sol 30°', 'viento 15 km/h', '2/3'],
      blurb: 'Una nubecita con pronóstico. Habla en números, grados y porcentajes.',
      keysHint: 'Números y símbolos: 24° 75% 10 km/h',
      intro: '* ¡Canal Clima interrumpe la batalla!\n* "Pronóstico para hoy: 100% de probabilidad de pelea."',
      check: '* CANAL CLIMA - ATQ 5 DEF 5\n* Escribe sus números con símbolos. El ° va con Shift + la tecla de la izquierda del 1\n* (en Mac: Option + Shift + 8).',
      idle: ['* Canal Clima anuncia: "Mañana, 25 grados y despejado."', '* En la gran pantalla hay un Canal Tienda cerrado:\n* "Aquí se compraban juegos viejitos para jugarlos en la nueva. Se llamaba Consola Virtual."', '* Cae una gotita. Luego sale el sol. Luego otra gotita.'],
      calm: '* Canal Clima pronostica: "Cielo despejado. Amistad al 80%."',
      taunts: ['¡Lluvia al 90%!', '¡Viento de 50 km/h!', '¡Granizo de letras!'],
      acts: [
        { name: 'Pronóstico', text: 'le preguntas si va a llover', mercy: 45, reply: '* "Veinte por ciento. Trae paraguas igual."' },
        { name: 'Sol', text: 'le pides un día soleado', mercy: 50, reply: '* "Para ti, 25 grados."' },
        { name: 'Nube', text: 'la abrazas aunque esté fría', mercy: 40, reply: '* "Brrr. Pero gracias."' },
      ],
      get bullets() { return { count: 11, interval: 1150, speed: 36, pool: wiiList(['°', '%', '/', '24', '75%', '1/2', '10', 'km', 'h', '30°', '5%']).filter((x) => x && x.trim()) }; },
      fightList: wiiList,
    },
    correita: {
      ...WII_BASE,
      name: 'Correíta', sprite: 'correita', model: 'correita', caps: true, fightTime: 1.05,
      hp: 110, atk: 6, def: 5, xp: 48,
      fightWords: 2,
      words: ['¡Ponte la correa!', '¡Cuidado con la Tele!', 'Respeta la Distancia.', '¡No lo sueltes!', 'Primero la Seguridad.', '¡Ojo con la Lámpara!', 'Muñeca bien amarrada.', '¡Atención, Jugador!', 'Revisa el Cordón.'],
      blurb: 'La correa de seguridad del control. Está MUY preocupada por todos. Grita con mayúsculas.',
      keysHint: 'Frases de advertencia con MAYUSCULAS y signos',
      intro: '* ¡Correíta aparece colgando de tu muñeca!\n* "¡ALTO! ¿Te pusiste la correa? ¡¿TE PUSISTE LA CORREA?!"',
      check: '* CORREITA - ATQ 6 DEF 5\n* Sus advertencias llevan MAYUSCULAS (SHIFT) y signos ¡! Escríbelas exactas.',
      idle: ['* Correíta: "En 2006, hubo gente que rompió su tele por no ponerse la correa.\n* No seas esa gente."', '* Correíta revisa que todos tengan la correa puesta. Hasta Bit.', '* Correíta se aprieta solita. Por si acaso.'],
      calm: '* Correíta suspira: "...Bueno. Confío en ti."',
      taunts: ['¡LA CORREA!', '¡Cuidado con la tele!', '¡Seguridad primero!'],
      acts: [
        { name: 'Ponerse', text: 'te pones la correa en la muñeca', mercy: 55, reply: '* "¡Por fin alguien responsable!"' },
        { name: 'Tele', text: 'le prometes no romper la tele', mercy: 40, reply: '* "...Lo voy a anotar."' },
        { name: 'Calma', text: 'le dices que todo va a estar bien', mercy: 45, reply: '* "¿Seguro? ...Ok."' },
      ],
      bullets: { count: 11, interval: 1150, speed: 37, pool: ['Ojo', 'Tele', 'Correa', 'Alto', 'Cuidado', 'Calma', 'Ya', 'Mano'] },
      fightList: wiiList,
      drop: 'correa',
    },
    nunchuquin: {
      ...WII_BASE,
      name: 'Nunchuquín', sprite: 'nunchuquin', model: 'nunchuquin', wiiTask: 'half',
      hp: 115, atk: 6, def: 4, xp: 48,
      fightWords: 4,
      words: ['palanca', 'botones', 'segundo', 'cable', 'control', 'izquierda', 'gatillo', 'sacudida', 'enredado', 'compañero', 'pareja', 'ayudante', 'conexión', 'mitades', 'después'],
      blurb: 'El control chiquito que cuelga de un cable. Siempre va de segundo. Sus palabras vienen en dos mitades.',
      keysHint: 'Palabras partidas en dos: escríbelas seguidas',
      intro: '* ¡Nunchuquín llega... detrás de alguien más, como siempre!\n* "¿Puedo pelear yo? ¿Sí? ¿De veras?"',
      check: '* NUNCHUQUIN - ATQ 6 DEF 4\n* Sus palabras vienen partidas por su cable. Escribe las dos mitades SEGUIDAS, sin espacio.',
      idle: ['* Nunchuquín se enreda en su propio cable.', '* Un letrero: "El nombre secreto de esta ciudad era Revolution."', '* Nunchuquín mueve su palanquita en círculos. Se marea.'],
      calm: '* Nunchuquín se queda quietecito, sin enredarse. Milagro.',
      taunts: ['¡Yo voy después!', '¡Mitad y mitad!', '¡Conectado!'],
      acts: [
        { name: 'Primero', text: 'lo dejas ir primero', mercy: 55, reply: '* "¿Yo? ¿Primero? ¡Wow!"' },
        { name: 'Cable', text: 'desenredas su cable', mercy: 45, reply: '* "Llevaba desde 2006 enredado."' },
        { name: 'Palanca', text: 'mueves su palanquita con cuidado', mercy: 40, reply: '* "Jiji, cosquillas."' },
      ],
      bullets: { count: 12, interval: 1100, speed: 38, pool: ['pa', 'lan', 'ca', 'bo', 'to', 'nes', 'ca', 'ble', 'se', 'gun', 'do', 'mi'] },
    },
    sensorin: {
      ...WII_BASE,
      name: 'Sensorín', sprite: 'sensorin', model: 'sensorin', wiiTask: 'side', wiiDodge: 'side', fightTime: 0.85,
      hp: 120, atk: 7, def: 4, xp: 50,
      fightWords: 4,
      words: ['sensor', 'infrarrojo', 'distancia', 'puntero', 'pantalla', 'apuntar', 'luces', 'señal', 'calibrar', 'televisión', 'cursor', 'mirada', 'izquierda', 'derecha'],
      blurb: 'La barra sensora con dos ojitos LED. Te "ve" de un lado y del otro. El más rápido de la plaza.',
      keysHint: 'Velocidad: palabras que saltan de izquierda a derecha',
      intro: '* ¡Sensorín se prende sobre la tele!\n* Sus dos ojitos LED te siguen a todos lados.',
      check: '* SENSORIN - ATQ 7 DEF 4\n* Sus palabras saltan de un lado al otro. Y sus luces caen alternando izquierda y derecha.',
      idle: ['* Una ranura con un control de cubo dice:\n* "Los primeros modelos leían los discos del cubo. Familia es familia."', '* Sensorín parpadea sus dos LED: ¡clic, clic!', '* BIT: Psst... la barra sensora no "siente" nada. Solo son dos luces. El que ve es el control.'],
      calm: '* Sensorín te mira con sus dos luces tranquilas.',
      taunts: ['¡Te veo!', '¡Izquierda! ¡Derecha!', '¡Dos luces, cero dudas!'],
      acts: [
        { name: 'Alinear', text: 'la pones derechita sobre la tele', mercy: 50, reply: '* "¡Ahora sí te veo!"' },
        { name: 'Lejos', text: 'te paras a la distancia correcta', mercy: 45, reply: '* "Un metro... dos. ¡Perfecto!"' },
        { name: 'Luz', text: 'apagas la lámpara que la confunde', mercy: 40, reply: '* "¡Gracias! Esa lámpara me daba dolor de cabeza."' },
      ],
      bullets: { count: 13, interval: 1050, speed: 40, pool: ['luz', 'led', 'izq', 'der', 'ojo', 'clic', 'ver', 'rayo', 'señal', 'tele'] },
      drop: 'sensor',
    },
    entrenadormi: {
      name: 'Entrenador Mi', sprite: 'entrenadormi', mode: 'wiigym', xp: 55, drop: 'pelota_boliche',
      blurb: '¡MINIJEFE! Gimnasio Sensor: tres pruebas de ritmo. Boliche, tenis (una mano a la vez) y box al compás.',
      keysHint: 'Ritmo constante y mano izquierda / derecha',
    },
    daniwii: {
      name: 'Dani Turbo', sprite: 'dani', mode: 'wiitorneo', xp: 55,
      blurb: '¡MINIJEFE! Torneo Sensor: la gran final contra Dani. Tecloides 3 contra 3, ataques largos y con acento.',
      keysHint: 'Palabras de 8 a 12 letras con acento, con prisa',
    },
    cometa: {
      ...WII_BASE,
      name: 'Capitán Cometa', sprite: 'cometa', model: 'cometa', boss: true, console: 'wii',
      mode: 'cometa',           // js/scenes/wii-cometa.js
      theme: 'cometa', music: 'wii_cometa', fightTime: 1,
      hp: 340, atk: 7, def: 5, xp: 90,
      fightWords: 4,
      words: ['estrella', 'gravedad', 'planeta', 'órbita', 'cometa', 'galaxia', 'telescopio', 'capitán', 'satélite', 'meteoro', 'nebulosa', 'constelación', 'cráter', 'cósmico', 'brillo', 'lejano'],
      fallWords: ['estrella', 'cielo', 'noche', 'luna', 'planeta', 'órbita', 'cometa', 'galaxia', 'nave', 'viaje', 'rumbo', 'espacio', 'cosmos', 'sol', 'eclipse',
        'meteoro', 'cráter', 'brillo', 'polvo', 'estelar', 'satélite', 'universo', 'gravedad', 'capitán', 'mapa', 'faro', 'luz', 'casa', 'lejos', 'volver'],
      blurb: '¡JEFE! El Observatorio: el Glitch le robó la gravedad al Capitán. Ahora todo cae... hacia todos lados.',
      keysHint: 'De todo: velocidad, ritmo y texto de cabeza',
      intro: '* El Observatorio flota en el espacio. Todo da vueltas.\n* "¡ALTO! Solo un tecleo MUY estable puede restaurar mi órbita."',
      check: '* CAPITAN COMETA - ATQ 7 DEF 5\n* El Glitch le robó la gravedad. Cada palabra PERFECTA rescata una de sus 7 estrellitas.',
      idle: [
        '* Las estrellitas giran alrededor del Capitán, asustadas.',
        '* CAPITAN COMETA: "Cada palabra que escribes bien tiene su propia gravedad. Lo noto."',
        '* El planeta chiquito gira. Tus pies quieren ir hacia arriba.',
        '* Un telescopio enorme apunta a la Ciudad Sensor. Casi todos los canales siguen apagados.',
      ],
      calm: '* La capa del Capitán ondea más despacio. La órbita se está calmando.',
      taunts: ['¡Gravedad, ven aquí!', '¡Todo cae hacia el centro!', '¡Las estrellas no se apagan!'],
      acts: [
        { name: 'Estabilizar', text: 'estabilizas la órbita con calma', mercy: 30, reply: '* El planeta deja de tambalearse.\n* "...Gracias. Así no se me voltea el mundo." (Se canceló el giro de gravedad.)' },
        { name: 'Estrellas', needStars: 1, costStar: true, text: 'le devuelves una estrellita en la mano', mercy: 40, reply: '* La estrellita brinca a su hombro.\n* "Las estrellas no se apagan. Se van lejos. No es lo mismo."' },
        { name: 'Observar', needStars: 3, text: 'miras el cielo con él en silencio', mercy: 50, reply: '* Se quedan callados, mirando las estrellas.\n* "...Ahí. Esa es mi casa."' },
      ],
      bullets: { count: 12, interval: 1050, speed: 0.2, pool: ['luz', 'sol', 'luna', 'astro', 'polvo', 'nave', 'cielo', 'órbita', 'cometa', 'brillo', 'estrella', 'faro'] },
      // Cada palabra PERFECTA en LUCHAR rescata una estrellita (js/scenes/wii-cometa.js).
      fightUnit(unit, dmg, battle) {
        if (!unit.errors && battle.rescueStar) battle.rescueStar();
        return dmg;
      },
      onWin(scene, { first, pages }) {
        const d = Save.data;
        pages.splice(1, 0, '* CAPITAN COMETA: ...La órbita es estable otra vez.\n* "Ya tienes mi gravedad. Cuídala."');
        Quests.complete('mundo_wii');
        if (['entrenadormi', 'daniwii', 'cometa'].every((id) => d.done[id])) Quests.complete('wii_canales');
        if (Quests.state('wii_estrellitas') === 'done' && !d.flags.cometaPueblo) {
          d.flags.cometaPueblo = true;
          d.treasures.estrellita_capitan = true;
          pages.push(
            '* Una de las 7 estrellitas se queda flotando junto a ti.\n* Recibiste: ESTRELLITA DEL CAPITAN. (Se guardó en tu vitrina.)',
            '* CAPITAN COMETA: Rescataste a las siete. Te debo una.\n* Voy a poner un observatorio en el techo de tu museo.',
          );
        }
        if (!first) return;
        d.flags.finalAbierto = true; // gancho para el final (LORE.md §10, El Canal Vacío)
        pages.push(
          '* ¡La pantalla gigante de la ciudad se prende entera!\n* CANAL DEPORTES · CANAL TORNEO · CANAL GALAXIA: ENCENDIDOS.',
          '* BIT: ¡LO LOGRAMOS! Esta consola vendió más de cien millones.\n* Cien. Millones. ...Y ahora está a salvo.',
          '* ...',
          '* En una esquina de la pantalla, un cuadrito que nadie había visto se prende solo.\n* No tiene dibujo. Solo dice: CANAL VACIO.',
          `* ???: ${wiiGlitch('Ya no tengo dónde esconderlas. Las rescataste todas.')}`,
          `* ???: ${wiiGlitch('Si quieres saber quién soy... entra. Te espero en el canal que nunca existió.')}`,
          '* BIT: ...',
          '* BIT: Oye. Antes de entrar, vamos al pueblo.\n* Todos los amigos que hiciste... van a querer decirte algo.',
          '* (Se abrió EL CANAL VACIO. En la plaza del pueblo apareció una tele vieja...)',
        );
        Quests.start('wii_canal_vacio');
      },
    },
  },

  treasures: {
    pelota_boliche: { name: 'Pelota de boliche', desc: 'Regalo del Entrenador Mi. Azul, pesada y con tres hoyitos.' },
    pelota_dorada: { name: 'Pelota dorada', desc: '10 chuzas seguidas. El Entrenador Mi lloró un poquito.' },
    estrellita_capitan: { name: 'Estrellita del Capitán', desc: 'Una de las 7. Brilla más cuando escribes sin errores.' },
    correa: { name: 'Correa', desc: 'Para que el control no vuele. Y la tele no llore.' },
    sensor: { name: 'Barra sensora', desc: 'Solo son dos luces. En serio, solo eso.' },
    medalla_sensor: { name: 'Medalla Sensor', desc: 'Campeón del Torneo Sensor. Dani dice que fue de suerte.' },
    cara_mii: { name: 'Cara de puntitos', desc: 'Tu cara, diseñada por Muñequito. Ojos grandes, boca chica, gorra azul.' },
  },

  sprites: WII_SPRITES,
  tracks: WII_TRACKS,

  quests: {
    mundo_wii: {
      name: 'La Ciudad Sensor',
      desc: 'Una tubería blanca lleva a una ciudad moderna. El Glitch quiere apagarla con su "luz de standby". Llega al Observatorio y rescata la Wii.',
    },
    wii_canales: {
      name: 'Enciende los canales',
      desc: 'Gana el Gimnasio Sensor, el Torneo Sensor y el Observatorio: cada uno prende un canal de la pantalla gigante.',
      progress: () => `${['entrenadormi', 'daniwii', 'cometa'].filter((id) => Save.data.done[id]).length}/3`,
    },
    wii_chuza: {
      name: 'Chuza perfecta',
      desc: 'Haz 10 chuzas seguidas en BOLICHE SENSOR (dificultad Normal o Difícil). El gimnasio del Entrenador Mi también cuenta.',
      progress: () => `${Math.min(10, ((Save.data.wii || {}).chuzas) || 0)}/10`,
    },
    wii_estrellitas: {
      name: 'Las 7 estrellitas',
      desc: 'Rescata las 7 estrellitas del Capitán Cometa en una sola batalla (7 palabras PERFECTAS en LUCHAR).',
    },
    wii_caras: {
      name: 'Caras nuevas',
      desc: 'Muñequito, en el pueblo, quiere caras nuevas. Escribe las 5 descripciones que te dicta, exactas.',
    },
    wii_canal_vacio: {
      name: 'El Canal Vacío',
      desc: 'Un canal sin nombre se prendió en la pantalla gigante de la Ciudad Sensor. Vuelve al pueblo: en la Plaza de las Tuberías apareció una tele vieja con estática magenta. Alguien te espera adentro.',
    },
  },
});
