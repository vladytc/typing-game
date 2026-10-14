// MUNDO 2 — Castillo 8-Bit (NES, 1985). Diseño en docs/LORE.md §5.
// Zonas: Patio de Ladrillos → Castillo 1 (Kongo Tambor) → Bosque Oscuro (Patos de Letras)
//        → Castillo 2 (Mazmorra de Llaves + Tragabombas) → Ring de la Plaza (Campeón Puñín)
//        → Castillo 3 (Lord Caparazón, rescata la NES).
// Aquí se practican las MAYUSCULAS con SHIFT (nombres propios, inicio de frase) y el punto final.

// Dibujos a todo color (letras de la paleta NES de js/nes-kit.js). Ley del castillo: máximo 3 colores.
const NES_ART = {
  ladrillin: [
    '................',
    '.KKKKKKKKKKKKKK.',
    '.KOOOOOKOOOOOOK.',
    '.KOOOOOKOOOOOOK.',
    '.KKKKKKKKKKKKKK.',
    '.KOKKKOOOOKKKOK.',
    '.KOOOKKOOKKOOOK.',
    '.KOWWWOOOOWWWOK.',
    '.KOWKWOOOOWKWOK.',
    '.KOWWWOOOOWWWOK.',
    '.KOOOOOOOOOOOOK.',
    '.KOOOKKKKKKOOOK.',
    '.KOOKOOOOOOKOOK.',
    '.KKKKKKKKKKKKKK.',
    '..KKK......KKK..',
    '.KKKK......KKKK.',
  ],
  caparacho: [
    '................',
    '................',
    '................',
    '...........SSS..',
    '....GGGGGG.SSGSS',
    '...GWGGGGWGSSSSS',
    '..GGGWWWWGGGSSS.',
    '..GGWGGGGWGGSS..',
    '.GGWGGGGGGWGGS..',
    '.GGWGGGGGGWGG...',
    '.GGGWGGGGWGGG...',
    '.WWWWWWWWWWWWW..',
    '..SSS....SSS....',
    '.SSSS...SSSS....',
    '................',
    '................',
  ],
  bombita: [
    '..........Y.Y...',
    '...........Y....',
    '..........WYY...',
    '.........W......',
    '........W.......',
    '.....KKKKKK.....',
    '...KKKKKKKKKK...',
    '..KKWWKKKKKKKK..',
    '..KWWKKKKKKKKK..',
    '.KKWKKWKKKWKKKK.',
    '.KKKKKWKKKWKKKK.',
    '.KKKKKKKKKKKKKK.',
    '.KKKKKWWWWKKKKK.',
    '..KKKKKKKKKKKK..',
    '...KKKKKKKKKK...',
    '.....KKKKKK.....',
  ],
  patoloco: [
    '................',
    '.........GGGG...',
    '........GGGGGG..',
    '........GGGYGGYY',
    '........GGGGGYYY',
    '.........GGGG...',
    '..........BB....',
    '..BB....BBBB....',
    '.BBBBBBBBBBBB...',
    'BBBBYYYYBBBBBB..',
    '.BBBBYYYBBBBBB..',
    '..BBBBBBBBBBB...',
    '....BBBBBBBB....',
    '......Y..Y......',
    '.....YY.YY......',
    '................',
  ],
  kongo: [
    '.....BBBBBB.....',
    '...BBBBBBBBBB...',
    '..BBBSSSSSSBBB..',
    '..BBSSBSSBSSBB..',
    '..BBSSSSSSSSBB..',
    '.BBBSSBBBBSSBBB.',
    'BBBBBSSSSSSBBBBB',
    'BB.BBBBRRBBBB.BB',
    'BB.BBBBRRBBBB.BB',
    'SS.BBBBRRBBBB.SS',
    'SS.BBBRRRRBBB.SS',
    '...BBBBRRBBBB...',
    '...BBBBBBBBBB...',
    '...BBB....BBB...',
    '..SSSS....SSSS..',
    '................',
  ],
  tragabombas: [
    '................',
    '....GGGGG.......',
    '...GGWGGGG......',
    '..GGGDGGGGG.....',
    '.GGGGGGGGGGG....',
    'WDWDWDGGGGGG....',
    '......GGGGGGG...',
    'WDWDWDGGGGGGGG..',
    '.GGGGGGGDDGGGGG.',
    '...GGGGDDDDGGGGG',
    '...GGGDDDDDDGGGG',
    '....GGDDDDDDGGG.',
    '....GGGGGGGGGG..',
    '....GGG....GGG..',
    '...DDDD...DDDD..',
    '................',
  ],
  punin: [
    '.....KKKKKK.....',
    '....KKKKKKKK....',
    '....SSSSSSSS....',
    '....SKSSSSKS....',
    '....SSSSSSSS....',
    '.....SKKKKS.....',
    '.GG...SSSS...GG.',
    'GGGG.SSSSSS.GGGG',
    'GGGGSSSSSSSSGGGG',
    'GGGG.SSSSSS.GGGG',
    '.GG..SSSSSS..GG.',
    '.....KKKKKK.....',
    '.....KKKKKK.....',
    '.....SS..SS.....',
    '.....SS..SS.....',
    '....KKK..KKK....',
  ],
  caparazon: [
    '...Y.Y.Y........',
    '...YYYYY.RR.....',
    '..GGGGGGRRRR....',
    '.GGRGGGGGRRRR...',
    'YYGGGGGGGGRRR...',
    'YYYYGGGGGGGRR...',
    '.Y.Y.GGGGG.GGG..',
    '.....YYYYGGGGGG.',
    '....YYYYYGGRGGGG',
    '..GGYYYYYGGGGRGG',
    '..GGYYYYYGGRGGGG',
    '....YYYYYGGGGGG.',
    '.....YYYYGGGGG..',
    '....GGG...GGG...',
    '...YGYG..YGYG...',
    '................',
  ],
  paje: [
    '.....WWWWWW.....',
    '...WWRRWWRRWW...',
    '..WRRRRWWRRRRW..',
    '.WWRRWWWWWWRRWW.',
    '.WWWWWWRRWWWWWW.',
    '.RRWWWRRRRWWWRR.',
    '..WWWWWWWWWWWW..',
    '....SSSSSSSS....',
    '....SRSSSSRS....',
    '....SSSSSSSS....',
    '.....SSRRSS.....',
    '....WWWWWWWW....',
    '...SWWRRRRWWS...',
    '....WWWWWWWW....',
    '....RR....RR....',
    '...RRR....RRR...',
  ],
  llave: [
    '................',
    '................',
    '.....KKKK.......',
    '....KYYYYK......',
    '...KYYKKYYK.....',
    '...KYK..KYK.....',
    '...KYYKKYYK.....',
    '....KYYYYK......',
    '.....KYYK.......',
    '.....KYYK.......',
    '.....KYYKKK.....',
    '.....KYYYYK.....',
    '.....KYYKKK.....',
    '.....KYYYYK.....',
    '.....KKKKKK.....',
    '................',
  ],
  ladrillo_dorado: [
    '.KKKKKKKKKKKKKK.',
    'KYYYYYYYYYYYYYYK',
    'KYOYYYYYYYYYYOYK',
    'KYYYYKKKKKYYYYYK',
    'KYYYKKOOOKKYYYYK',
    'KYYYKKOYYKKOYYYK',
    'KYYYYOOYYKKOYYYK',
    'KYYYYYYYKKOOYYYK',
    'KYYYYYYKKOOYYYYK',
    'KYYYYYYKKOYYYYYK',
    'KYYYYYYYOOYYYYYK',
    'KYYYYYYKKYYYYYYK',
    'KYYYYYYKKOYYYYYK',
    'KYOYYYYYOOYYYOYK',
    'KYYYYYYYYYYYYYYK',
    '.KKKKKKKKKKKKKK.',
  ],
  guantes_verdes: [
    '................',
    '................',
    '..KKKK....KKKK..',
    '.KGGGGK..KGGGGK.',
    'KGLLGGGKKGGGLLGK',
    'KGLGGGGKKGGGGLGK',
    'KGGGGGGKKGGGGGGK',
    'KGGGGGGKKGGGGGGK',
    'KGGGGGGKKGGGGGGK',
    '.KGGGGK..KGGGGK.',
    '.KLLLLK..KLLLLK.',
    '.KLLLLK..KLLLLK.',
    '.KKKKKK..KKKKKK.',
    '................',
    '................',
    '................',
  ],
  mapa_mazmorra: [
    '................',
    '................',
    '.KKKKKKKKKKKKKK.',
    '.KWWWWWWWWWWWWK.',
    '.KWKKKWWWKKKWWK.',
    '.KWKWKKKKKWKWWK.',
    '.KWKKKWWWKKKWWK.',
    '.KWWWWWWWWWKWWK.',
    '.KWWWWWWWKKKWWK.',
    '.KWWWWWWWKFKWWK.',
    '.KWWWWWWWKKKWWK.',
    '.KWWWWWWWWWWWWK.',
    '.KKKKKKKKKKKKKK.',
    '................',
    '................',
    '................',
  ],
  cinturon: [
    '................',
    '................',
    '................',
    '................',
    '................',
    'KKKKKKKKKKKKKKKK',
    'RRRRRKYYYYKRRRRR',
    'RRRRKYYKKYYKRRRR',
    'RRRRKYKYYKYKRRRR',
    'RRRRKYYKKYYKRRRR',
    'RRRRRKYYYYKRRRRR',
    'KKKKKKKKKKKKKKKK',
    '................',
    '................',
    '................',
    '................',
  ],
};

// Segundo cuadro del pato (alas arriba), para Patos de Letras.
const PATO_VUELA = NES_ART.patoloco.map((r, i) => ({
  6: '...YYY....BB....', 7: '..BBYYYYBBBB....', 9: 'BBBBBBBBBBBBBB..', 10: '.BBBBBBBBBBBBB..',
}[i] || r));

const NES_SPRITES = nesArt(NES_ART);
// Tesoros que reusan un dibujo del juego con colores dorados.
NES_SPRITES.sprites.cartucho_dorado = SPRITES.cartucho;
NES_SPRITES.palettes.cartucho_dorado = { b: NES.W, c: NES.Y, d: NES.K };
NES_SPRITES.sprites.zapper_dorada = SPRITES.zapper;
NES_SPRITES.palettes.zapper_dorada = { b: NES.W, c: NES.Y, d: NES.K };

// Palabras del mundo (LORE §16): mayúscula inicial y nombres propios.
const WORDS_NES = ['Castillo', 'Ladrillo', 'Tubería', 'Hongo', 'Moneda', 'Bandera', 'Puente', 'Lava', 'Nube',
  'Robot', 'Pato', 'Red', 'Bosque', 'Llave', 'Mazmorra', 'Mapa', 'Bomba', 'Escudo', 'Ring', 'Guante',
  'Campeón', 'Torre', 'Princesa', 'Paje', 'Puerta', 'Cofre', 'Corona', 'Hacha', 'Cuerda', 'Martillo'];

// Los mensajes del hongo-paje al terminar los castillos 1 y 2.
const PAJE_LINES = {
  1: [
    '* ¡Gracias por venir!\n* ...Pero tu consola está en otro castillo.',
    '* Soy el paje. Es mi trabajo decirte que la consola está en otro castillo.\n* ¡Me encanta mi trabajo!',
  ],
  2: [
    '* ¡Gracias! Pero tu consola está en otro...',
    '* Sí, ya sé, ya sé. En OTRO castillo.\n* El tercero. El último. Te lo prometo.',
  ],
};

// ---------- Música (era 'nes') ----------
// Ayudas para escribir las pistas del mundo (también las usan nes-mapa.js y secretos/nes.js).
const NES_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
// Sube o baja una nota k semitonos: nesTr('A2', -1) → 'G#2'.
function nesTr(n, k) {
  const m = /^([A-G])([#b]?)(\d)$/.exec(n);
  let i = NES_NOTES.indexOf(m[1]) + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + k;
  const o = Number(m[3]) + Math.floor(i / 12);
  i = ((i % 12) + 12) % 12;
  return `${NES_NOTES[i]}${o}`;
}
// Baja todas las notas de un texto n octavas (n negativo, sube).
const nesDown = (s, n = 1) => s.replace(/([A-G][#b]?)(\d)/g, (m, x, o) => `${x}${o - n}`);
// La misma línea k pasos después y recortada al final: el "eco" del segundo pulso de la NES.
function nesLate(mel, k) {
  const ev = mel.replace(/\|/g, ' ').trim().split(/\s+/);
  let cut = k;
  while (cut > 0) {
    const m = /^(.*?)\/(\d+)(.*)$/.exec(ev.pop());
    const d = m ? Number(m[2]) : 1;
    if (m && d > cut) { ev.push(`${m[1]}/${d - cut}${m[3]}`); cut = 0; } else cut -= d;
  }
  return `-/${k} ${ev.join(' ')}`;
}
// Un compás por acorde (o dos medios compases si viene [a, b]), separados por "|".
const nesLine = (chords, bar, half) => chords.map((c) => (Array.isArray(c) ? c.map(half).join(' ') : bar(c))).join(' | ');

const NES_TRACKS = {
  // Batalla normal: rock de batalla en Sol menor, 168 BPM. Bajo de triángulo en corcheas, acordes
  // de pulso 25 % y un puente a medio tiempo con la melodía larga. Forma A A' B C A' (40 compases, ~57 s).
  nes_battle: (() => {
    const B = { Gm: ['G2', 'D3', 'G3'], Eb: ['D#2', 'A#2', 'D#3'], F: ['F2', 'C3', 'F3'], D7: ['D2', 'A2', 'D3'], Cm: ['C2', 'G2', 'C3'], Ab: ['G#2', 'D#3', 'G#3'], D: ['D2', 'A2', 'D3'] };
    const CH = { Gm: ['G4', 'A#4', 'D5'], Eb: ['G4', 'A#4', 'D#5'], F: ['A4', 'C5', 'F5'], D7: ['F#4', 'A4', 'C5'], Cm: ['G4', 'C5', 'D#5'], Ab: ['G#4', 'C5', 'D#5'], D: ['F#4', 'A4', 'D5'] };
    const drive = (c) => { const [r, f, o] = B[c]; return `${r}/2 ${r}/2 ${o}/2 ${r}/2 ${f}/2 ${r}/2 ${o}/2 ${f}/2`; };
    const slow = (c) => { const [r, f, o] = B[c]; return `${r}/4 -/2 ${r}/2 ${o}/4 ${f}/4`; };
    const chug = (c) => rep(`-/2 ${CH[c].join('+')}/2.`, 4);
    const roll = (c) => { const [a, b, d] = CH[c]; return rep(`${a}/1 ${b}/1 ${d}/1 ${b}/1`, 4); };
    const chA = ['Gm', 'Eb', 'F', 'D7', 'Gm', 'Eb', 'Cm', 'D7'];
    const chB = ['Cm', 'Gm', 'Ab', 'F', 'Eb', 'F', 'D', 'D7'];
    const chC = ['Eb', 'F', 'Gm', 'Gm', 'Eb', 'F', 'D', 'D'];
    const a1 = 'G5/2! D5/1 G5/1 A#5/2 A5/2 G5/1 F5/1 G5/2 D5/2 F5/2';
    const a2 = 'G5/3 D#5/3 A#4/2 C5/2 D5/2 D#5/2 F5/2';
    const a6 = `${a1} | ${a2} | A5/2! F5/1 A5/1 C6/2 A#5/2 A5/1 G5/1 F5/2 C5/2 D#5/2 | D5/3 F#5/3 A5/2 C6/4 A5/2 F#5/2 | ${a1} | ${a2} | ` +
      'C6/2! A#5/1 G5/1 D#5/2 G5/2 A#5/2 C6/2 D6/2 D#6/2 |';
    const melB = 'D#5/4 G5/4 C6/6 A#5/2 | A#5/4 G5/2 D5/2 G5/6 -/2 | C6/4 D#6/4 G#6/6 G6/2 | F6/4 D#6/2 D6/2 C6/4 A5/4 | ' +
      'G5/2 A#5/2 D#6/2 G6/2 F6/2 D#6/2 D6/2 C6/2 | A5/2 C6/2 F6/2 A6/2 G6/2 F6/2 D#6/2 D6/2 | F#6/6! D6/2 A5/4 F#5/4 | ' +
      'A5/1 C6/1 A5/1 F#5/1 D5/1 F#5/1 A5/1 C6/1 D6/4 -/4';
    const melC = 'G5/12 F5/4 | A5/12 C6/4 | A#5/8 A5/4 G5/4 | D5/16 | D#5/12 G5/4 | F5/12 A5/4 | F#5/8 A5/8 | D6/8! C6/4 A5/4';
    const beat = 'k/2 h/2 s/2 h/2 k/2 k/2 s/2 h/2';
    const fill = 'k/2 s/1 s/1 s/2 s/1 s/1 t/2 t/2 T/2 T/2';
    const dr16 = 'k/1 h/1 h/1 h/1 s/1 h/1 h/1 h/1 k/1 h/1 k/1 h/1 s/1 h/1 h/1 h/1';
    const half = 'k/4 h/4 s/4 h/4';
    return {
      bpm: 168, era: 'nes', form: ['A1', 'A2', 'B', 'C', 'A2'],
      voices: [
        { wave: 'square', vol: 0.03, parts: {
          A1: `${a6} D6/6 C6/2 A5/2 F#5/2 D5/4`, A2: `${a6} D6/3 A5/3 F#5/2 G5/8!`, B: melB, C: melC,
        } },
        { wave: 'pulse25', vol: 0.013, parts: {
          A1: nesLine(chA, chug), A2: nesLine(chA, chug), B: nesLine(chB, roll), C: nesLine(chC, roll),
        } },
        { wave: 'triangle', vol: 0.1, parts: {
          A1: nesLine(chA, drive), A2: nesLine(chA, drive), B: nesLine(chB, drive), C: nesLine(chC, slow),
        } },
        { wave: 'noise', vol: 0.02, parts: {
          A1: `c+${beat} ${rep(beat, 6)} ${fill}`, A2: `c+${beat} ${rep(beat, 6)} ${fill}`,
          B: `c+${dr16} ${rep(dr16, 6)} ${fill}`, C: `c+${half} ${rep(half, 6)} ${fill}`,
        } },
      ],
    };
  })(),

  // Kongo Tambor: groove de selva en Mi menor, 132 BPM. Los tambores mandan (bombo-caja-bombo-bombo-caja
  // y una voz de toms), el bajo rebota en pentatónica y la melodía deja huecos. Hay un corte solo de
  // tambores. Forma A A B D A B (44 compases, ~80 s).
  kongo: (() => {
    const r1 = 'E2/2. -/1 E2/1. G2/2. -/2 A2/2. B2/2. D3/2. B2/2.';
    const r2 = 'E2/2. -/1 E2/1. G2/2. -/2 A2/2. B2/1. A2/1. G2/2. D2/2.';
    const riff = (n) => Array(n).fill(`${r1} | ${r2}`).join(' | ');
    const B = { C: ['C2', 'G2', 'C3'], D: ['D2', 'A2', 'D3'], Bm: ['B1', 'F#2', 'B2'], Em: ['E2', 'B2', 'E3'], B7: ['B1', 'F#2', 'B2'] };
    const CH = { C: 'C4+E4+G4', D: 'D4+F#4+A4', Bm: 'B3+D4+F#4', Em: 'E4+G4+B4', B7: 'B3+D#4+A4' };
    const bounce = (c) => { const [r, f, o] = B[c]; return `${r}/2. -/1 ${r}/1. ${f}/2. -/2 ${o}/2. ${f}/2. ${r}/2. ${f}/2.`; };
    const chB = ['C', 'D', 'Bm', 'Em', 'C', 'D', 'B7', 'B7'];
    const k1 = 'E5/2! G5/2 -/2 A5/1 B5/1 -/4 D6/2 B5/2';
    const melA = `${k1} | A5/3 G5/3 E5/2 -/8 | E5/2! G5/2 -/2 A5/1 B5/1 -/4 D6/2 E6/2 | D6/3 B5/3 A5/2 G5/2 A5/2 B5/4 | ` +
      `${k1} | A5/3 G5/3 E5/2 -/4 E5/1 G5/1 A5/2 | B5/2 A5/2 G5/2 D6/2 E6/4 D6/2 B5/2 | A5/2 B5/1 A5/1 G5/2 E5/10`;
    const melB = 'G5/4 E5/2 G5/2 C6/6 B5/2 | A5/4 F#5/2 A5/2 D6/6 C6/2 | B5/3 A5/3 F#5/2 D5/2 F#5/2 A5/2 B5/2 | G5/8 E5/8 | ' +
      'C6/2 D6/2 E6/4 G6/4 E6/4 | F#6/2 E6/2 D6/4 A5/4 D6/4 | D#6/4! F#6/4 B6/6 A6/2 | F#6/2 D#6/2 B5/2 A5/2 F#5/2 D#5/2 B4/4';
    const stab = (x) => `-/4 ${x}/2. -/2 -/2 ${x}/1. ${x}/1. -/4`;
    const stabA = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => stab(i % 4 === 0 ? 'D4+G4+B4' : CH.Em)).join(' | ');
    const kit = 'k/2 h/2 s/2 k/2 k/2 h/2 s/2 h/2';
    const toms = 'T/2 -/1 t/1 -/2 t/2 T/2 -/1 t/1 t/2 -/2';
    const tomFill = 'T/1 T/1 t/1 t/1 T/1 T/1 t/1 t/1 T/2! t/2! T/2! -/2';
    const brk = 'T/2 t/1 t/1 T/2 t/2 T/1 T/1 t/2 T/2 t/2';
    return {
      bpm: 132, era: 'nes', form: ['A', 'A', 'B', 'D', 'A', 'B'],
      voices: [
        { wave: 'square', vol: 0.03, parts: { A: melA, B: melB } },
        { wave: 'pulse12', vol: 0.016, env: 'stab', parts: { A: stabA, B: chB.map((c) => rep(`${CH[c]}/4`, 4)).join(' | ') } },
        { wave: 'triangle', vol: 0.12, parts: { A: riff(4), B: nesLine(chB, bounce), D: riff(2) } },
        { wave: 'noise', vol: 0.022, parts: {
          A: `c+${kit} ${rep(kit, 7)}`, B: `c+${kit} ${rep(kit, 7)}`, D: `${rep('k/4', 12)} k/2 s/1 s/1 s/2 s/2 c+k/4 -/4`,
        } },
        { wave: 'noise', vol: 0.024, parts: { A: `${rep(toms, 7)} ${tomFill}`, B: `${rep(toms, 7)} ${tomFill}`, D: `${rep(brk, 3)} ${tomFill}` } },
      ],
    };
  })(),

  // Mazmorra de Llaves: misterio de mazmorra en La menor, 100 BPM. Un ostinato de pulso 12 % que no
  // para, bajo de lamento que baja por semitonos, latido de bombo y el eco de la melodía en el segundo
  // pulso, un tiempo después. Forma A A' B C (28 compases, ~67 s).
  mazmorra: (() => {
    const AR = {
      Am: ['A3', 'C4', 'E4', 'A4', 'C5'], Fo: ['F#3', 'A3', 'C4', 'E4', 'A4'], F: ['F3', 'A3', 'C4', 'F4', 'A4'], E: ['E3', 'G#3', 'B3', 'E4', 'G#4'],
      Dm: ['D3', 'F3', 'A3', 'D4', 'F4'], G: ['G3', 'B3', 'D4', 'G4', 'B4'], Em: ['E3', 'G3', 'B3', 'E4', 'G4'], Bb: ['A#3', 'D4', 'F4', 'A#4', 'D5'],
      E7: ['E3', 'G#3', 'D4', 'E4', 'G#4'],
    };
    const osti = (c) => { const [a, b, d, e, f] = AR[c]; return rep(`${a}/1 ${b}/1 ${d}/1 ${e}/1 ${f}/1 ${e}/1 ${d}/1 ${b}/1`, 2); };
    const chA = ['Am', 'Am', 'Am', 'Fo', 'F', 'E', 'Dm', 'E'];
    const chB = ['F', 'G', 'Em', 'Am', 'Dm', 'Bb', 'E', 'E7'];
    const chC = ['Am', 'Am', 'F', 'E'];
    const low = (r) => `${r}/12 ${r}/2. ${r}/2.`;
    const basA = ['A2', 'G#2', 'G2', 'F#2', 'F2', 'E2', 'D2', 'E2'].map(low).join(' | ');
    const basB = ['F2', 'G2', 'E2', 'A2', 'D2', 'A#1', 'E2', 'E2'].map(low).join(' | ');
    const a6 = 'A4/6 C5/2 B4/6 A4/2 | G#4/6 B4/2 E5/8 | F5/6 E5/2 D#5/6 E5/2 | C5/16 | A4/6 C5/2 B4/6 A4/2 | G#4/4 B4/4 D5/4 F5/4 |';
    const melA1 = `${a6} E5/6 D5/2 C5/4 B4/4 | A4/12 -/4`;
    const melA2 = `${a6} E5/4 F5/4 G#5/4 B5/4 | A5/12 -/4`;
    const melB = 'C6/6 A5/2 F5/8 | D6/6 B5/2 G5/8 | E6/6 B5/2 G5/4 E5/4 | A5/16 | F6/6 D6/2 A5/4 F5/4 | F6/4 E6/4 D6/4 A#5/4 | ' +
      'G#5/6 B5/2 E6/8! | D6/2 C6/2 B5/2 G#5/2 E5/8';
    const drips = '-/6 E6/1? -/9 | -/10 B5/1? -/5 | -/3 C6/1? -/12 | -/8 G#5/1? -/7';
    const beat = 'k/2 k/2? -/12';
    const beatB = 'k/2 k/2? -/4 h/2? -/2 h/2? -/2';
    return {
      bpm: 100, era: 'nes', form: ['A1', 'A2', 'B', 'C'],
      voices: [
        { wave: 'square', vol: 0.03, legato: 0.95, vib: 'slow', parts: { A1: melA1, A2: melA2, B: melB } },
        { wave: 'square', vol: 0.011, legato: 0.95, parts: { A1: nesLate(melA1, 4), A2: nesLate(melA2, 4), B: nesLate(melB, 4), C: drips } },
        { wave: 'pulse12', vol: 0.017, env: 'pluck', parts: {
          A1: nesLine(chA, osti), A2: nesLine(chA, osti), B: nesLine(chB, osti), C: nesLine(chC, osti),
        } },
        { wave: 'triangle', vol: 0.1, parts: { A1: basA, A2: basA, B: basB, C: ['A2', 'A2', 'F2', 'E2'].map(low).join(' | ') } },
        { wave: 'noise', vol: 0.018, parts: { A1: rep(beat, 8), A2: rep(beat, 8), B: rep(beatB, 8), C: rep(beat, 4) } },
      ],
    };
  })(),

  // Campeón Puñín: rock de ring en Si bemol mayor, 170 BPM. Golpes de metal con silencios para los
  // avisos, bajo con séptima rockera, un B en Sol menor que sube hasta el La#6 y un "entrenamiento"
  // de boogie con pregunta y respuesta entre los dos pulsos. Forma A A' B C A' (40 compases, ~56 s).
  punin: (() => {
    const B = {
      Bb: ['A#1', 'F2', 'A#2', 'G#2'], Ab: ['G#1', 'D#2', 'G#2', 'F#2'], Eb: ['D#2', 'A#2', 'D#3', 'C#3'], F: ['F1', 'C2', 'F2', 'D#2'],
      Gm: ['G1', 'D2', 'G2', 'F2'], Cm: ['C2', 'G2', 'C3', 'A#2'], D7: ['D2', 'A2', 'D3', 'C3'],
    };
    const CH = { Bb: 'D4+F4+A#4', Ab: 'C4+D#4+G#4', Eb: 'D#4+G4+A#4', F: 'C4+F4+A4', Gm: 'D4+G4+A#4', Cm: 'C4+D#4+G4', D7: 'D4+F#4+C5' };
    const rock = (c) => { const [r, f, o, s] = B[c]; return `${r}/2 ${o}/2 ${r}/2 ${o}/2 ${f}/2 ${o}/2 ${s}/2 ${o}/2`; };
    const BOOG = { Bb: ['A#1', 'D2', 'F2', 'G2', 'G#2'], Eb: ['D#2', 'G2', 'A#2', 'C3', 'C#3'], F: ['F1', 'A1', 'C2', 'D2', 'D#2'] };
    const boogie = (c) => { const [r, t, f, s, b7] = BOOG[c]; return `${r}/2 ${t}/2 ${f}/2 ${s}/2 ${b7}/2 ${s}/2 ${f}/2 ${t}/2`; };
    const hit = (c) => `${CH[c]}/2.! -/2 ${CH[c]}/1. ${CH[c]}/1. -/10`;
    const roll = (c) => { const [a, b, d] = CH[c].split('+'); return rep(`${a}/1 ${b}/1 ${d}/1 ${b}/1`, 4); };
    const chA = ['Bb', 'Ab', 'Eb', 'F', 'Bb', 'Ab', 'Eb', 'F'];
    const chB = ['Gm', 'Gm', 'Eb', 'F', 'Gm', 'Eb', 'Cm', 'D7'];
    const chC = ['Bb', 'Bb', 'Eb', 'Bb', 'F', 'Eb', 'Bb', 'F'];
    const p1 = 'A#5/2! -/2 A#5/1 A#5/1 -/2 F5/2 G5/2 A#5/2 C6/2';
    const a7 = `${p1} | C6/4 A#5/2 G#5/2 -/8 | G5/2! -/2 G5/1 G5/1 -/2 D#5/2 F5/2 G5/2 A#5/2 | A5/4 C6/4! -/8 | ` +
      `${p1} | D#6/4 C6/2 A#5/2 G#5/2 A#5/2 C6/4 | A#5/2 G5/2 D#5/2 G5/2 A#5/2 D#6/2 D6/2 C6/2 |`;
    const melB = 'D6/6 A#5/2 G5/8 | A5/2 A#5/2 C6/2 D6/2 D#6/4 D6/4 | G6/6! D#6/2 A#5/8 | A5/2 C6/2 F6/4 D#6/4 D6/4 | ' +
      'D6/6 A#5/2 G5/4 A#5/4 | D#6/2 F6/2 G6/4 A#6/6! G6/2 | F6/2 D#6/2 D6/2 C6/2 D#6/4 C6/4 | D6/2 -/2 D6/1 D6/1 -/2 F#5/2 A5/2 C6/4';
    const melC = 'F5/1. F5/1. -/2 G#5/2. A5/2 C6/2. -/6 | -/16 | A#5/1. A#5/1. -/2 C#6/2. D6/2 F6/2. -/6 | -/16 | ' +
      'C6/2. C6/2. A5/2. F5/2. G5/2 A5/2 A#5/4 | D#6/2. C6/2. A#5/2. G5/2. G#5/2 A5/2 A#5/4 | F6/4! D6/2 A#5/2 F5/2 D5/2 A#4/4 | ' +
      'C5/2 D5/2 F5/2 A5/2 C6/4 -/4';
    const ansC = '-/16 | D5/2. D5/2. F5/2. D5/2. C5/2 A#4/2 -/4 | -/16 | G5/2. G5/2. A#5/2. G5/2. F5/2 D#5/2 -/4';
    const beat = 'k/2 h/2 s/2 h/2 k/2 h/2 s/2 k/2';
    const fill = 'k/2 s/1 s/1 s/2 s/1 s/1 t/2 t/2 T/2! T/2!';
    const shuffle = 'k/3 h/1 s/3 h/1 k/3 k/1 s/3 h/1';
    return {
      bpm: 170, era: 'nes', form: ['A1', 'A2', 'B', 'C', 'A2'],
      voices: [
        { wave: 'square', vol: 0.03, parts: { A1: `${a7} C6/6 A5/2 F5/8`, A2: `${a7} A#5/4! F5/2 D5/2 A#4/4 -/4`, B: melB, C: melC } },
        { wave: 'pulse25', vol: 0.016, parts: {
          A1: nesLine(chA, hit), A2: nesLine(chA, hit), B: nesLine(chB, roll), C: ansC,
        } },
        { wave: 'triangle', vol: 0.1, parts: {
          A1: nesLine(chA, rock), A2: nesLine(chA, rock), B: nesLine(chB, rock), C: nesLine(chC, boogie),
        } },
        { wave: 'noise', vol: 0.02, parts: {
          A1: `c+${beat} ${rep(beat, 6)} ${fill}`, A2: `c+${beat} ${rep(beat, 6)} ${fill}`, B: `c+${beat} ${rep(beat, 6)} ${fill}`,
          C: `c+${shuffle} ${rep(shuffle, 6)} ${fill}`,
        } },
      ],
    };
  })(),

  // Patos de Letras: hoedown de campo en Do mayor, 152 BPM. Violín de pulso con semicorcheas, bajo
  // "bum-chic" que alterna raíz y quinta, rasgueo a contratiempo, banjo de pulso 25 % en 3 contra 8
  // y batería de tren. Forma A A' B A' (32 compases, ~51 s).
  patos: (() => {
    const B = { C: ['C3', 'G2'], F: ['F2', 'C3'], Am: ['A2', 'E2'], D7: ['D3', 'A2'], G: ['G2', 'D3'] };
    const CH = { C: 'E4+G4+C5', F: 'F4+A4+C5', Am: 'E4+A4+C5', D7: 'F#4+A4+C5', G: 'D4+G4+B4' };
    const BJ = { C: ['G4', 'C5', 'E5'], F: ['A4', 'C5', 'F5'], Am: ['A4', 'C5', 'E5'], D7: ['F#4', 'A4', 'D5'], G: ['G4', 'B4', 'D5'] };
    const boomH = (c) => `${B[c][0]}/2. -/2 ${B[c][1]}/2. -/2`;
    const boom = (c) => `${boomH(c)} ${boomH(c)}`;
    const chickH = (c) => rep(`-/2 ${CH[c]}/2.`, 2);
    const chick = (c) => `${chickH(c)} ${chickH(c)}`;
    const banjo = (c) => { const [a, b, d] = BJ[c]; return rep(`${a}/1 ${b}/1 ${d}/1 ${a}/1 ${b}/1 ${d}/1 ${a}/1 ${b}/1`, 2); };
    const chA1 = ['C', 'C', 'F', 'C', 'C', 'Am', 'D7', 'G'];
    const chA2 = ['C', 'C', 'F', 'C', 'C', 'Am', 'D7', 'C'];
    const chB = ['F', 'C', 'G', 'C', 'F', 'C', ['D7', 'G'], 'C'];
    const f1 = 'E5/1 F5/1 G5/2 C6/2 G5/2 E5/2 G5/2 C5/2 E5/2';
    const a7 = `${f1} | D5/1 E5/1 F5/2 E5/2 D5/2 C5/4 G4/4 | A4/1 B4/1 C5/2 F5/2 C5/2 A5/2 G5/2 F5/2 A5/2 | G5/2 E5/2 C5/2 E5/2 G5/6 -/2 | ` +
      `${f1} | A5/1 G5/1 E5/2 C5/2 E5/2 A5/4 C6/4 | D6/2 C6/2 A5/2 F#5/2 D5/2 F#5/2 A5/2 C6/2 |`;
    const melB = 'A5/4 F5/2 A5/2 C6/4 A5/4 | G5/4 E5/2 G5/2 C6/8 | B5/2 C6/2 D6/2 B5/2 G5/2 A5/2 B5/2 G5/2 | C6/4 E6/4 G6/6 -/2 | ' +
      'A6/4! G6/2 F6/2 C6/4 A5/4 | G6/4 E6/2 C6/2 G5/4 E5/4 | F#5/2 A5/2 D6/2 C6/2 B5/2 D6/2 G6/2 F6/2 | E6/4 D6/2 B5/2 C6/4 -/4';
    const harB = 'C5/16 | G4/16 | D5/8 B4/8 | E5/8 G5/6 -/2 | C6/8 A5/8 | G5/8 E5/8 | A5/8 B5/8 | G5/8 -/8';
    const train = 'k/1 h/1 h/1 h/1 s/1 h/1 h/1 h/1';
    const fill = `${train} s/1 s/1 s/1 s/1 t/2 T/2`;
    const dr = `c+${train} ${rep(train, 13)} ${fill}`;
    return {
      bpm: 152, era: 'nes', form: ['A1', 'A2', 'B', 'A2'],
      voices: [
        { wave: 'square', vol: 0.03, parts: {
          A1: `${a7} B5/3 A5/3 G5/2 -/2 G4/2 A4/2 B4/2`, A2: `${a7} C6/3 G5/3 E5/2 C5/4! -/4`, B: melB,
        } },
        { wave: 'pulse25', vol: 0.012, parts: { A2: nesLine(chA2, banjo), B: harB } },
        { wave: 'pulse12', vol: 0.015, env: 'stab', parts: {
          A1: nesLine(chA1, chick), A2: nesLine(chA2, chick), B: nesLine(chB, chick, chickH),
        } },
        { wave: 'triangle', vol: 0.1, parts: {
          A1: nesLine(chA1, boom), A2: nesLine(chA2, boom), B: nesLine(chB, boom, boomH),
        } },
        { wave: 'noise', vol: 0.018, parts: { A1: dr, A2: dr, B: dr } },
      ],
    };
  })(),
};

// Lord Caparazón: marcha de jefe en Do menor, 120 BPM, con el pulso del metrónomo marcado en cada
// tiempo (acordes en negra, bombo y caja). Forma A B A' (24 compases, ~48 s).
// Ojo: las voces van en `notes` sin paréntesis ni "|", porque la copia de sombra del mundo GC
// (gcShadowTrack en gc.js) recorta las fichas una por una.
// caparazon2 es la misma más rápida; en caparazon3 el rey se "traba": cada 4 compases la melodía
// repite su primera nota como disco rayado.
function nesCaparazon(bpm, stuck) {
  const melA = ['C5/4! D#5/2 G5/2 C6/6 G5/2', 'G#5/4 G5/2 F5/2 D#5/4 D5/4', 'C5/4 D#5/2 G#5/2 C6/6 D#6/2', 'D6/8 B5/4 G5/4',
    'C6/4! A#5/2 G5/2 D#6/6 D6/2', 'D6/4 C6/2 A#5/2 F5/4 D5/4', 'D#5/4 G#5/2 C6/2 F6/6 D#6/2'];
  const melB = ['F5/6 G#5/2 C6/8', 'D#6/6 D6/2 C6/8', 'C#6/4 F6/4 G#6/6 F6/2', 'G6/12! -/4',
    'G#6/4 G6/2 F6/2 C6/4 G#5/4', 'C6/4 D#6/4 G#6/4 C7/4', 'C#7/6 C7/2 G#6/4 F6/4', 'G6/2 F6/2 D#6/2 D6/2 B5/2 G5/2 F5/2 D5/2'];
  const bars = [...melA, 'D6/4 B5/4 G5/4 F5/2 D5/2', ...melB, ...melA, 'D6/2 B5/2 G5/2 B5/2 C6/8!'];
  const mel = bars.map((b, i) => (stuck && i % 4 === 3 ? rep(`${b.split(/[/ ]/)[0]}/2`, 8) : b)).join(' ');
  const chords = ['Cm', 'Cm', 'Ab', 'G', 'Cm', 'Bb', 'Ab', 'G', 'Fm', 'Cm', 'Db', 'G', 'Fm', 'Ab', 'Db', 'G7', 'Cm', 'Cm', 'Ab', 'G', 'Cm', 'Bb', 'Ab', 'G'];
  const CH = { Cm: 'C4+D#4+G4', Ab: 'C4+D#4+G#4', G: 'B3+D4+G4', Bb: 'A#3+D4+F4', Fm: 'C4+F4+G#4', Db: 'C#4+F4+G#4', G7: 'B3+D4+F4' };
  const R = { Cm: 'C2', Ab: 'G#1', G: 'G1', Bb: 'A#1', Fm: 'F1', Db: 'C#2', G7: 'G1' };
  const march = 'k+h/2 h/2 s+h/2 h/2 k+h/2 k/2 s+h/2 h/2';
  const fill = 'k/2 s/1 s/1 s/2 s/2 t/2 t/2 T/2! T/2!';
  const eight = `c+${march} ${rep(march, 6)} ${fill}`;
  return {
    bpm, era: 'nes',
    voices: [
      { wave: 'square', vol: 0.032, notes: mel },
      { wave: 'pulse25', vol: 0.014, env: 'stab', notes: chords.map((c) => rep(`${CH[c]}/2. -/2`, 4)).join(' ') },
      { wave: 'triangle', vol: 0.11, notes: chords.map((c) => rep(`${R[c]}/2 ${nesTr(R[c], 12)}/2`, 4)).join(' ') },
      { wave: 'noise', vol: 0.022, notes: rep(eight, 3) },
    ],
  };
}
NES_TRACKS.caparazon1 = nesCaparazon(120, false);

addWorld({
  id: 'nes',
  order: 2,
  name: 'Castillo 8-Bit',
  theme: 'nes',
  requires: 'gameboy',      // se abre al rescatar la Game Boy
  console: 'nes',
  nodes: ['mario11', 'ladrillin', 'caparacho', 'kongo', 'bombita', 'patoloco', 'patos', 'mazmorra', 'punin', 'caparazon'],
  enemies: {
    mario11: {
      name: 'Mundo 1-1',
      sprite: 'mario',
      mode: 'mario', // nivel de plataformas (js/scenes/mario.js)
      xp: 30,
      blurb: '¡El nivel más famoso de la historia! Mario avanza mientras escribes.',
      keysHint: 'Mayúsculas con SHIFT (Mario, Goomba)',
    },

    // ---------- Patio de Ladrillos ----------
    ladrillin: {
      name: 'Ladrillín',
      sprite: 'ladrillin',
      hp: 45, atk: 3, def: 2, xp: 16,
      caps: true, music: 'nes_battle',
      fightWords: 3,
      words: ['Torre', 'Perro', 'Tipo', 'Puerto', 'Repite', 'Poquito', 'Quiero', 'Tuyo', 'Pero', 'Trote', 'Ropero', 'Pirueta', 'Ladrillo', 'Tubo', 'Retiro'],
      blurb: 'Un bloque de ladrillo con cejas. Se enoja si saltas debajo de él.',
      intro: '* ¡Un Ladrillín bloquea el Patio de Ladrillos!\n* (Aquí las MAYUSCULAS cuentan: usa SHIFT.)',
      check: '* LADRILLIN - ATQ 3 DEF 2\n* Un bloque de ladrillo con cejas. Se enoja si saltas debajo de él.',
      idle: ['* Ladrillín frunce las cejas. También son de ladrillo.', '* Se oye una moneda adentro... ¿o te lo imaginaste?', '* "Aquí todos somos de tres colores. Es la ley del castillo."'],
      calm: '* Ladrillín ya no frunce tanto las cejas.',
      taunts: ['¡No me saltes encima!', '¡Soy de ladrillo macizo!', '¡Ni se te ocurra golpearme desde abajo!'],
      acts: [
        { name: 'Tocar', text: 'tocas el bloque con cuidado', mercy: 40, reply: '* ¡Ting! ...\n* "Ah, eso se sintió bien."' },
        { name: 'Preguntar', text: 'qué guardas adentro', mercy: 35, reply: '* "Una moneda. O un hongo. Nunca sé."' },
        { name: 'Apilar', text: 'apilas tres ladrillos derechitos', mercy: 50, reply: '* "¡Por fin alguien construye en vez de romper!"' },
      ],
      bullets: { count: 9, interval: 1250, speed: 32, pool: 'qwertyuiop'.split('').concat(['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P']) },
      drop: 'ladrillo_dorado',
      keysHint: 'Fila de arriba (Q W E R T Y U I O P) + mayúscula inicial',
    },
    caparacho: {
      name: 'Caparacho',
      sprite: 'caparacho',
      hp: 55, atk: 3, def: 1, xp: 18,
      caps: true, music: 'nes_battle',
      fightWords: 3,
      words: ['Mario', 'Luigi', 'Yoshi', 'Toad', 'Peach', 'Ana', 'Pablo', 'Lucas', 'Diego', 'Sofía', 'Toby', 'Champi', 'Bit', 'Lima', 'Roma', 'Tokio', 'Kioto', 'Chile', 'Perú'],
      blurb: 'Una tortuguita que se mete a su caparazón y patina por todo el patio.',
      intro: '* ¡Caparacho llega patinando dentro de su caparazón!\n* (Los nombres propios llevan MAYUSCULA.)',
      check: '* CAPARACHO - ATQ 3 DEF 1\n* Patina rapidísimo. Nadie le ha preguntado nunca a dónde va.',
      idle: ['* Caparacho da vueltas dentro de su concha.', '* Se escucha un "¡vuuum!" a lo lejos.', '* Caparacho se asoma... y se vuelve a esconder.'],
      calm: '* Caparacho saca la cabeza y te sonríe.',
      taunts: ['¡Patina esto!', '¡Me escondo y no me ves!', '¡Soy más rápido de lo que parezco!'],
      acts: [
        { name: 'Rascar', text: 'le rascas el caparazón', mercy: 45, reply: '* "Más a la izquierda... ahí. AHI."' },
        { name: 'Patinar', text: 'patinas a su lado por el pasillo', mercy: 40, reply: '* ¡Vuuum! Caparacho se ríe dentro de su concha.' },
        { name: 'Devolver', text: 'le devuelves su caparazón perdido', mercy: 50, reply: '* "Oh. Pensé que no volvería a verlo."' },
      ],
      bullets: { count: 9, interval: 1350, speed: 30, pool: ['Ma', 'Lu', 'To', 'Pe', 'Yo', 'Ki', 'Ro', 'Bi', 'Sa', 'Ne', 'Da', 'Li'] },
      keysHint: 'Nombres propios con mayúscula (Mario, Lima...)',
    },

    // ---------- Castillo 1 ----------
    kongo: {
      name: 'Kongo Tambor',
      sprite: 'kongo',
      mode: 'kongo', // js/scenes/kongo.js
      xp: 30,
      blurb: '¡MINIJEFE del Castillo 1! Un gorila con corbata avienta barriles. Escribe para saltarlos y sube las vigas.',
      keysHint: 'Palabras con mayúscula inicial (Barril, Viga)',
    },

    // ---------- Bosque Oscuro ----------
    bombita: {
      name: 'Bombita Mecha',
      sprite: 'bombita',
      hp: 50, atk: 4, def: 0, xp: 20,
      caps: true, music: 'nes_battle',
      fightWords: 4, fightTime: 0.8, // ¡tiene prisa! 20 % menos tiempo
      words: ['Bum', 'Pum', 'Uno', 'Dos', 'Tres', 'mecha', 'chispa', 'fuego', 'humo', 'luz', 'zas', 'Bomba', 'ya', 'corre', 'Fiu'],
      blurb: 'Una bomba con la mecha corta y MUCHA prisa. Aquí hay menos tiempo para escribir.',
      intro: '* ¡Bombita Mecha corre en círculos por el Bosque Oscuro!\n* "¡No hay tiempo! ¡NO HAY TIEMPO!"',
      check: '* BOMBITA MECHA - ATQ 4 DEF 0\n* Siempre tiene prisa. Nadie sabe a dónde va tan rápido.',
      idle: ['* La mecha de Bombita hace fssssss.', '* Bombita mira su reloj. No tiene reloj.', '* Huele a cerillo recién apagado.'],
      calm: '* La mecha de Bombita se apagó solita. Está tranquila.',
      taunts: ['¡Tres... dos...!', '¡No hay tiempo! ¡No hay tiempo!', '¡Fsssss!'],
      acts: [
        { name: 'Soplar', text: 'soplas la mecha hasta apagarla', mercy: 50, reply: '* ...¡Ay! "Qué alivio."' },
        { name: 'Calmar', text: 'respiras hondo con bombita', mercy: 45, reply: '* "Inhala... exhala... ¡Me gusta!"' },
        { name: 'Contar', text: 'cuentas hasta tres muy despacio', mercy: 35, reply: '* "¿Tres? ¡Pensé que era uno!"' },
      ],
      bullets: { count: 11, interval: 950, speed: 40, pool: ['tic', 'tac', 'bum', 'pum', 'ya', 'uno', 'dos', 'tres'] },
      keysHint: 'Palabras cortas contra reloj (20 % menos tiempo)',
    },
    patoloco: {
      name: 'Patoloco',
      sprite: 'patoloco',
      hp: 40, atk: 2, def: 1, xp: 14,
      caps: true, music: 'nes_battle',
      fightWords: 4,
      words: ['Pato', 'cuac', 'pluma', 'Red', 'pan', 'Toby', 'vuela', 'nido', 'ala', 'pico', 'lago', 'Cuac'],
      blurb: 'Un pato que se burla porque nadie le atina nunca. Sus letras caen rapidísimo.',
      intro: '* ¡Patoloco sale volando de un arbusto!\n* "¡Ja ja ja! ¡A que no me atrapas!"',
      check: '* PATOLOCO - ATQ 2 DEF 1\n* Vuela en zigzag. Se ríe de todo, sobre todo de los que fallan.',
      idle: ['* Patoloco hace cuac. Muy fuerte.', '* Una pluma cae despacito.', '* Patoloco vuela en zigzag nada más porque sí.'],
      calm: '* Patoloco te mira de ladito. Ya no se burla tanto.',
      taunts: ['¡Ja ja ja! ¡Fallaste!', '¡Cuac! ¡Muy lento!', '¡Nadie me atrapa!'],
      acts: [
        { name: 'Silbar', text: 'silbas como pato', mercy: 40, reply: '* "¡Cuac! ¿Eres primo mío?"' },
        { name: 'Reír', text: 'te ríes con el pato y no de él', mercy: 50, reply: '* "Nadie se había reído CONMIGO."' },
        { name: 'Pan', text: 'le das un pedazo de pan', mercy: 35, reply: '* "¡Cuac cuac cuac!"' },
      ],
      bullets: { count: 14, interval: 720, speed: 50, pool: 'asdfghjklqwertyuiopzxcvbnm'.split('').concat(['P', 'A', 'T', 'O']) },
      keysHint: 'Letras sueltas muy rápidas (reacción)',
    },
    patos: {
      name: 'Patos de Letras',
      sprite: 'toby',
      mode: 'patos', // js/scenes/patos.js
      xp: 20,
      blurb: 'Toby te acompaña al Bosque Oscuro. Atrapa patos con tu red de letras: ¡escribe la letra de cada pato!',
      keysHint: 'Letras sueltas, reacción rápida',
    },

    // ---------- Castillo 2 ----------
    mazmorra: {
      name: 'Mazmorra de Llaves',
      sprite: 'llave',
      mode: 'mazmorra', // js/scenes/mazmorra.js
      xp: 25,
      blurb: '¡Castillo 2! Una mazmorra de cuartos con puertas que se abren escribiendo frases. Al fondo espera Tragabombas.',
      keysHint: 'Frases con mayúscula y punto final',
    },
    // Minijefe del fondo de la mazmorra: combate normal con bombas (no es nodo del mapa).
    tragabombas: {
      name: 'Tragabombas',
      sprite: 'tragabombas',
      hp: 170, atk: 4, def: 1, xp: 30,
      caps: true, music: 'nes_battle',
      fightWords: 5,
      words: WORDS_NES.filter((w) => w !== 'Bomba'),
      // Cada tercera palabra es "bomba": PERFECTA, Tragabombas se la traga (daño triple). Con errores, explota en tu lado.
      fightList: (words) => words.map((w, i) => (i % 3 === 2 ? 'bomba' : w)),
      fightUnit(unit, dmg, battle) {
        if (unit.text !== 'bomba') return dmg;
        if (unit.errors === 0) {
          battle.floatText('¡SE LA TRAGO!', 'crit');
          return dmg * 3;
        }
        battle.p.hp = Math.max(1, battle.p.hp - scaledDmg(5));
        battle.updateBars();
        battle.shake('.pinfo');
        Sfx.hurt();
        battle.floatText('¡BUM! La bomba explotó de tu lado');
        return 0;
      },
      blurb: 'Un dinosaurio que come bombas.',
      intro: '* ¡TRAGABOMBAS sale de las sombras!\n* "¿Tienes bombas? Me encantan las bombas."\n* (Escribe "bomba" SIN ERRORES y se la tragará.)',
      check: '* TRAGABOMBAS - ATQ 4 DEF 1\n* Come bombas. Escribe "bomba" perfecto y le hará daño triple. ¡A Tragabombas no le gusta el humo!',
      idle: ['* Tragabombas eructa humo.', '* "Es peligroso ir solo. Por eso como acompañado."', '* Huele a pólvora y a zanahoria.'],
      calm: '* Tragabombas se acaricia la panza. Ya está lleno.',
      taunts: ['¿Tienes bombas? ¡Me encantan las bombas!', 'Es peligroso ir solo. Por eso como acompañado.', '¡ÑAM ÑAM!'],
      acts: [
        { name: 'Dieta', text: 'le ofreces una zanahoria', mercy: 35, reply: '* Tragabombas la mastica...\n* "No explota. Pero está rica."' },
        { name: 'Cepillar', text: 'le cepillas los dientes', mercy: 40, reply: '* Huele a menta y a pólvora. Tragabombas sonríe.' },
        { name: 'Mapa', text: 'le muestras la salida del laberinto', mercy: 40, reply: '* "¿Había SALIDA? ¡Llevo años aquí adentro!"' },
      ],
      bullets: { count: 14, interval: 640, speed: 52, pool: 'bombaexplotahumo'.split('').concat(['B', 'U', 'M']) },
      keysHint: 'Mayúsculas + la palabra "bomba" perfecta',
    },

    // ---------- Ring de la Plaza ----------
    punin: {
      name: 'Campeón Puñín',
      sprite: 'punin',
      mode: 'punin', // js/scenes/punin.js
      xp: 30,
      drop: 'guantes_verdes',
      blurb: 'Un boxeador enorme con guantes verdes. Avisa su golpe con una palabra: ¡escríbela para esquivar!',
      keysHint: 'Reacción: escribir el aviso a tiempo',
    },

    // ---------- Castillo 3 ----------
    caparazon: {
      name: 'Lord Caparazón',
      sprite: 'caparazon',
      boss: true,
      mode: 'caparazon', // js/scenes/caparazon.js
      console: 'nes',
      xp: 50,
      blurb: '¡JEFE! El rey tortuga del Castillo 3. Está "trabado": repite su frase como disco rayado. Salta los bloques AL COMPAS.',
      keysHint: 'Palabras al ritmo del metrónomo',
    },
  },

  treasures: {
    superhongo: { name: 'Súper hongo', desc: 'Premio por terminar el Mundo 1-1. Te hace grande... en la vitrina.' },
    ladrillo_dorado: { name: 'Ladrillo dorado', desc: 'Todavía tiene un signo de interrogación. Nadie lo ha golpeado.' },
    zapper_dorada: { name: 'Pistola de luz dorada', desc: 'Regalo de Toby por atrapar 20 patos. Solo brilla en teles de tubo.' },
    guantes_verdes: { name: 'Guantes verdes', desc: 'Los guantes del Campeón Puñín. Huelen a esfuerzo... y un poquito a pies.' },
    mapa_mazmorra: { name: 'Mapa de la mazmorra', desc: 'Regalo del Anciano. Con él, todos los cuartos del Castillo 2 se ven en el minimapa.' },
    cartucho_dorado: { name: 'Cartucho dorado', desc: 'Los cartuchos dorados guardaban tu partida con una pila. ¡Era magia!' },
    cinturon: { name: 'Cinturón de campeón', desc: 'Por esquivar 9 golpes seguidos de Puñín. Dani Turbo no lo puede creer.' },
  },

  sprites: NES_SPRITES.sprites,
  palettes: NES_SPRITES.palettes,

  // Música original al estilo NES (pistas en NES_TRACKS, arriba).
  tracks: NES_TRACKS,

  quests: {
    // mundo_<id> se activa sola cuando Bit anuncia la tubería nueva.
    mundo_nes: {
      name: 'El Castillo 8-Bit',
      desc: 'Una tubería nueva lleva a un mundo de ladrillos y bloques ?. Cruza los tres castillos y rescata la NES.',
    },
    patos_toby: {
      name: 'Los patos de Toby',
      desc: 'Toby quiere ver cuántos patos atrapas con tu red de letras en el Bosque Oscuro. ¡Atrapa 20!',
      progress: () => `${Math.min(20, Save.data.flags.nesDucks || 0)}/20`,
    },
    tres_llaves: {
      name: 'Las tres llaves',
      desc: 'Encuentra las 3 llaves de la Mazmorra del Castillo 2 y muéstraselas al Anciano del pueblo.',
      progress: () => `${[1, 2, 3].filter((n) => Save.data.flags[`nesKey${n}`]).length}/3`,
    },
    record_ring: {
      name: 'Récord de ring',
      desc: 'Vence al Campeón Puñín esquivando 9 golpes seguidos sin fallar.',
      progress: () => `Mejor racha: ${Save.data.flags.nesBestStreak || 0}`,
    },
  },
});

// Variaciones del jefe: más rápida en la fase 2; en la fase 3 se "traba" (ver nesCaparazon).
TRACKS.caparazon2 = { ...TRACKS.caparazon1, bpm: 135 };
TRACKS.caparazon3 = nesCaparazon(150, true);
