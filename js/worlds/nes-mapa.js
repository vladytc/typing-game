// MUNDO 2 — Castillo 8-Bit explorable (docs/LORE.md §5). Se carga después de js/worlds/nes.js.
// Seis zonas conectadas por puertas; cada encuentro está parado en un paso angosto, así el orden
// del mundo sale del mapa (docs/MUNDOS.md §3d):
//
//   PATIO DE LADRILLOS ──puerta──> CASTILLO 1 ──puerta de arriba──> BOSQUE OSCURO ──puerta──>
//   [tubo al pueblo] Mario 1-1 |    vigas y escaleras    Kongo      Bombita | Patoloco | Toby (patos)
//      Ladrillín | Caparacho  |                                        |
//   CASTILLO 2 ──puerta de arriba──> RING DE LA PLAZA ──puerta──> CASTILLO 3
//   reja con la Mazmorra de Llaves    ring con Puñín              puente sobre la lava, Lord Caparazón
//                                                                 (tubería de regreso al pueblo)

const NES_FACTS = CONSOLES.find((c) => c.id === 'nes').facts;

// ---------- Casillas nuevas (16×16, letras a/b/c/d; sus colores van en HUB_ERAS.nes.tiles) ----------

const nesBrick = (x, y, shade) => {
  if (y % 4 === 3) return 'd';
  const off = Math.floor(y / 4) % 2 ? 0 : 8;
  if ((x + off) % 16 === 7 || (x + off) % 16 === 15) return 'd';
  if (y % 4 === 0) return 'a';
  return shade && y % 4 === 2 ? 'c' : 'b';
};
// Nubes y arbustos: el MISMO dibujo con otra paleta (como en el juego de 1985).
const nesPuff = rowsOf((x, y) => {
  if (y >= 14) return '.';
  for (const [cx, cy, r] of [[4.5, 10, 3.6], [11.5, 10, 3.6], [8, 7, 4.2]]) {
    const dx = x + 0.5 - cx;
    const dy = y + 0.5 - cy;
    const dd = Math.hypot(dx, dy);
    if (dd > r) continue;
    if (dd > r - 1.1) return 'd';
    return dx + dy > r * 0.5 ? 'c' : 'a';
  }
  return '.';
});
const nesDoor = rowsOf((x, y) => {
  const inside = x >= 3 && x <= 12 && (y >= 6 || Math.hypot(x - 7.5, y - 6) <= 4.6);
  return inside ? 'd' : nesBrick(x, y, true);
});

Object.assign(SPRITES, {
  nes_negro: rowsOf((x, y) => ((x * 7 + y * 13) % 41 === 0 ? 'c' : 'a')),
  // Bloque de suelo del Mundo 1-1, con sus grietas.
  nes_suelo: rowsOf((x, y) => {
    if (x === 15 || y === 15) return 'd';
    if (x === 0 || y === 0) return 'a';
    if ((x === 9 && y <= 10) || (y === 10 && x >= 9)) return 'd';
    if ((x === 10 && y <= 9) || (y === 11 && x >= 10)) return 'a';
    if (y === 5 && x < 9) return 'd';
    if (y === 6 && x < 9) return 'a';
    return 'b';
  }),
  nes_ladrillo: rowsOf((x, y) => nesBrick(x, y, false)),
  nes_muro: rowsOf((x, y) => nesBrick(x, y, true)),
  nes_almena: rowsOf((x, y) => (y < 6 && (x < 3 || x > 12) ? '.' : nesBrick(x, y, true))),
  nes_puerta: nesDoor,
  nes_bloque: [
    '.dddddddddddddd.',
    'dbbbbbbbbbbbbbbd',
    'dbdbbbbbbbbbbdbd',
    'dbbbbccccccbbbbd',
    'dbbbccddddccbbbd',
    'dbbbccdbbbccdbbd',
    'dbbbbddbbbccdbbd',
    'dbbbbbbbbccddbbd',
    'dbbbbbbbccddbbbd',
    'dbbbbbbbccdbbbbd',
    'dbbbbbbbbddbbbbd',
    'dbbbbbbbccbbbbbd',
    'dbbbbbbbccdbbbbd',
    'dbdbbbbbbddbbdbd',
    'dbbbbbbbbbbbbbbd',
    '.dddddddddddddd.',
  ],
  nes_nube: nesPuff,
  nes_arbusto: nesPuff,
  nes_piso: rowsOf((x, y) => {
    if (x === 15 || y === 15) return 'd';
    if (x === 0 || y === 0) return 'a';
    return (x * 3 + y * 5) % 13 === 0 ? 'c' : 'b';
  }),
  nes_lava: rowsOf((x, y) => {
    const w = Math.round(1.5 * Math.sin((x + Math.floor(y / 8) * 5) / 2.2));
    if (y % 8 === (3 + w + 8) % 8) return 'a';
    if (y % 8 === (4 + w + 8) % 8) return 'b';
    return (x * 5 + y * 3) % 17 === 0 ? 'd' : 'c';
  }),
  // Puente del castillo: cadena arriba, tablas en medio; por abajo se ve la lava.
  nes_puente: rowsOf((x, y) => {
    if (y <= 1) return x % 4 < 2 ? 'a' : '.';
    if (y === 2 || y === 10) return 'd';
    if (y > 10) return '.';
    if (x % 8 === 7) return 'd';
    return y === 3 ? 'a' : 'b';
  }),
  nes_hacha: [
    '................',
    '.......dd.......',
    '...ddddaad......',
    '..dbbbbdaad.....',
    '.dbbaaabdad.....',
    '.dbaaaaabdd.....',
    '.dbaaaaabd......',
    '.dbbaaabdd......',
    '..dbbbbdccd.....',
    '...ddddcccd.....',
    '.......dccd.....',
    '.......dccd.....',
    '.......dccd.....',
    '.......dccd.....',
    '.......dddd.....',
    '................',
  ],
  // Viga roja con agujeros (guiño al juego del gorila de 1981).
  nes_viga: rowsOf((x, y) => {
    if (y === 0 || y === 15) return 'd';
    if (y <= 2 || y >= 13) return y === 1 ? 'a' : 'b';
    return (x + y) % 8 === 0 || (x - y + 16) % 8 === 0 ? 'b' : 'd';
  }),
  nes_escalera: rowsOf((x, y) => (x === 3 || x === 12 || (y % 4 === 1 && x > 3 && x < 12) ? 'a' : 'd')),
  nes_barril: [
    '................',
    '................',
    '....dddddddd....',
    '...dbbbbbbbbd...',
    '..dbaabbbbbbbd..',
    '..dccccccccccd..',
    '..dbabbbbbbbbd..',
    '..dbabbbbbbbbd..',
    '..dbabbbbbbbbd..',
    '..dbabbbbbbbbd..',
    '..dccccccccccd..',
    '..dbabbbbbbbbd..',
    '...dbbbbbbbbd...',
    '....dddddddd....',
    '................',
    '................',
  ],
  nes_estatua: rowsOf((x, y) => {
    if (x === 0 || y === 0 || x === 15 || y === 15) return 'd';
    if ((y === 5 || y === 6) && (x === 4 || x === 5 || x === 10 || x === 11)) return 'd';
    if (y === 10 && x >= 5 && x <= 10) return 'd';
    if (x === 1 || y === 1) return 'a';
    if (x === 14 || y === 14) return 'c';
    return 'b';
  }),
  nes_cuerda: rowsOf((x, y) => {
    if (y === 6 || y === 9) return 'd';
    if (y === 7 || y === 8) return (x + y) % 4 === 0 ? 'a' : 'b';
    return '.';
  }),
  nes_lona: rowsOf((x, y) => (x % 8 === 0 || y % 8 === 0 ? 'c' : 'b')),
  nes_asta: [
    '.......dd.......',
    '......dbbd......',
    '......dbbd......',
    '.......dd.......',
    '..aaaaacc.......',
    '...aaaacc.......',
    '....aaacc.......',
    '.....aacc.......',
    '......acc.......',
    '.......cc.......',
    '.......cc.......',
    '.......cc.......',
    '.......cc.......',
    '.......cc.......',
    '.....dddddd.....',
    '.....dddddd.....',
  ],
});
// Mismo dibujo, otra paleta: el bosque oscuro y la mazmorra del Castillo 2.
Object.assign(SPRITES, {
  nes_pasto: SPRITES.grass,
  nes_pastoalto: SPRITES.tall,
  nes_flor: SPRITES.flower,
  nes_arbol: SPRITES.tree,
  nes_tierra: SPRITES.path,
  nes_piso2: SPRITES.nes_piso,
  nes_muro2: SPRITES.nes_muro,
  nes_puerta2: SPRITES.nes_puerta,
});

// Paletas NES por casilla (como las paletas de fondo de la NES real: 4 colores por bloque).
const NES_MAP_TILE_COLORS = {
  nes_negro: { a: '#000000', b: '#000000', c: '#3c3c3c', d: '#000000' },
  nes_suelo: { a: '#fcbcb0', b: '#c84c0c', c: '#c84c0c', d: '#000000' },
  nes_ladrillo: { a: '#fcbcb0', b: '#c84c0c', c: '#c84c0c', d: '#000000' },
  nes_bloque: { a: '#fcfcfc', b: '#f8b800', c: '#c84c0c', d: '#000000' },
  nes_nube: { a: '#fcfcfc', b: '#fcfcfc', c: '#a4e4fc', d: '#000000' },
  nes_arbusto: { a: '#b8f818', b: '#b8f818', c: '#00a800', d: '#000000' },
  nes_muro: { a: '#fcfcfc', b: '#7c7c7c', c: '#545454', d: '#000000' },
  nes_almena: { a: '#fcfcfc', b: '#7c7c7c', c: '#545454', d: '#000000' },
  nes_puerta: { a: '#fcfcfc', b: '#7c7c7c', c: '#545454', d: '#000000' },
  nes_piso: { a: '#fcfcfc', b: '#bcbcbc', c: '#7c7c7c', d: '#000000' },
  nes_lava: { a: '#f8b800', b: '#fca044', c: '#f83800', d: '#a81000' },
  nes_puente: { a: '#fcfcfc', b: '#fca044', c: '#c84c0c', d: '#000000' },
  nes_hacha: { a: '#fcfcfc', b: '#7c7c7c', c: '#c84c0c', d: '#000000' },
  nes_viga: { a: '#fcbcb0', b: '#d82800', c: '#d82800', d: '#000000' },
  nes_escalera: { a: '#3cbcfc', b: '#3cbcfc', c: '#3cbcfc', d: '#000000' },
  nes_barril: { a: '#fcbcb0', b: '#c84c0c', c: '#000000', d: '#000000' },
  nes_estatua: { a: '#00e8d8', b: '#008888', c: '#004058', d: '#000000' },
  nes_cuerda: { a: '#fcfcfc', b: '#f83800', c: '#f83800', d: '#000000' },
  nes_lona: { a: '#fcfcfc', b: '#3cbcfc', c: '#fcfcfc', d: '#000000' },
  nes_asta: { a: '#fcfcfc', b: '#00a800', c: '#b8f818', d: '#000000' },
  nes_pasto: { a: '#005800', b: '#00a800', c: '#000000', d: '#000000' },
  nes_pastoalto: { a: '#005800', b: '#00a800', c: '#b8f818', d: '#000000' },
  nes_flor: { a: '#005800', b: '#fcfcfc', c: '#000000', d: '#f83800' },
  nes_arbol: { a: '#fcfcfc', b: '#00a800', c: '#005800', d: '#000000' },
  nes_tierra: { a: '#fcd8a8', b: '#503000', c: '#887000', d: '#000000' },
  nes_piso2: { a: '#00e8d8', b: '#008888', c: '#004058', d: '#000000' },
  nes_muro2: { a: '#00e8d8', b: '#008888', c: '#004058', d: '#000000' },
  nes_puerta2: { a: '#00e8d8', b: '#008888', c: '#004058', d: '#000000' },
};

// ---------- Tesoros nuevos (salen en la sala NES del museo) ----------

const NES_MAP_ART = nesArt({
  moneda_8bit: [
    '................',
    '.....KKKKKK.....',
    '....KYYYYYYK....',
    '...KYWYYYYYOK...',
    '...KWYYOOYYOK...',
    '...KWYYOYYYOK...',
    '...KWYYOYYYOK...',
    '...KWYYOYYYOK...',
    '...KWYYOYYYOK...',
    '...KWYYOYYYOK...',
    '...KWYYOYYYOK...',
    '...KWYYOOYYOK...',
    '...KYWYYYYYOK...',
    '....KYYYYYOK....',
    '.....KKKKKK.....',
    '................',
  ],
  super_estrella: [
    '.......OO.......',
    '.......OO.......',
    '......OYYO......',
    '......OYYO......',
    '.....OYYYYO.....',
    'OOOOOOYYYYOOOOOO',
    'OYYYYYYYYYYYYYYO',
    '.OYYYYKYYKYYYYO.',
    '..OYYYKYYKYYYO..',
    '...OYYYYYYYYO...',
    '...OYYYYYYYYO...',
    '..OYYYYYYYYYYO..',
    '..OYYYYOOYYYYO..',
    '.OYYYOO..OOYYYO.',
    '.OYOO......OOYO.',
    '.OO..........OO.',
  ],
  control_nes: [
    '................',
    '................',
    '................',
    '................',
    '.KKKKKKKKKKKKKK.',
    'KDDDDDDDDDDDDDDK',
    'KDKKKKKKKKKKKKDK',
    'KDKKDKKKKKKKKKDK',
    'KDKDDDKWKWKRKRDK',
    'KDKKDKKKKKKRKRDK',
    'KDKKKKKKKKKKKKDK',
    'KDDDDDDDDDDDDDDK',
    '.KKKKKKKKKKKKKK.',
    '................',
    '................',
    '................',
  ],
});
Object.assign(SPRITES, NES_MAP_ART.sprites);
Object.assign(SPRITE_PALETTES, NES_MAP_ART.palettes);

Object.assign(TREASURES, {
  moneda_8bit: { room: 'nes', name: 'Moneda de 8 bits', desc: 'En Super Mario Bros., juntar 100 monedas te daba una vida extra. Esta es la número 1.' },
  super_estrella: { room: 'nes', name: 'Súper estrella', desc: 'Con ella eras invencible unos segundos y sonaba una música rapidísima. Todavía parpadea.' },
  control_nes: { room: 'nes', name: 'Control de dos botones', desc: 'La cruz de control la inventó Gunpei Yokoi para las Game & Watch. La NES solo necesitaba A, B, SELECT y START.' },
});

// ---------- Música de las zonas que no tenían pista ----------

Object.assign(TRACKS, {
  // Patio de Ladrillos: swing de paseo en Fa mayor, 140 BPM. Bajo de triángulo que camina en negras
  // (con nota de paso hacia el acorde que sigue), acordes de pulso 12 % a contratiempo y un B que
  // pasa por Si bemol menor y sube hasta el La#6. Forma A A' B A' (32 compases, ~55 s).
  nes_patio: (() => {
    const W = {
      F: ['F2', 'A2', 'C3'], Dm: ['D2', 'F2', 'A2'], Gm7: ['G2', 'A#2', 'D3'], Gm: ['G2', 'A#2', 'D3'], C7: ['C2', 'E2', 'G2'],
      D7: ['D2', 'F#2', 'A2'], Bb: ['A#1', 'D2', 'F2'], Bbm: ['A#1', 'C#2', 'F2'], FA: ['A1', 'C2', 'F2'], A7: ['A1', 'C#2', 'E2'], G7: ['G1', 'B1', 'D2'],
    };
    const CH = {
      F: 'F4+A4+C5', Dm: 'D4+F4+A4', Gm7: 'F4+A#4+D5', Gm: 'G4+A#4+D5', C7: 'E4+G4+A#4', D7: 'F#4+A4+C5',
      Bb: 'F4+A#4+D5', Bbm: 'F4+A#4+C#5', FA: 'F4+A4+C5', A7: 'E4+G4+C#5', G7: 'F4+G4+B4',
    };
    // Bajo caminante: raíz, tercera, quinta y medio tono abajo del acorde que sigue.
    const walk = (chords, after) => {
      const flat = chords.flatMap((c) => (Array.isArray(c) ? c.map((x) => [x, 2]) : [[c, 4]]));
      let out = '';
      let beats = 0;
      flat.forEach(([c, n], i) => {
        const next = i + 1 < flat.length ? flat[i + 1][0] : after;
        const [r, t, f] = W[c];
        const app = nesTr(W[next][0], -1);
        out += `${n === 4 ? `${r}/4 ${t}/4 ${f}/4` : `${r}/4`} ${app}/4 `;
        beats += n;
        if (beats % 4 === 0 && i + 1 < flat.length) out += '| ';
      });
      return out.trim();
    };
    const compH = (c) => `-/4 ${CH[c]}/3. -/1`;
    const comp = (c) => `${compH(c)} ${compH(c)}`;
    const chA = ['F', 'Dm', 'Gm7', 'C7', 'F', 'D7', ['Gm', 'C7'], 'F'];
    const chB = ['Bb', 'Bbm', 'FA', 'D7', 'Gm', 'C7', ['A7', 'Dm'], ['G7', 'C7']];
    const s1 = 'C5/2 F5/2 A5/3 G5/1 F5/2 C5/2 D5/2 F5/2';
    const a7 = `${s1} | A5/4 G5/2 F5/2 D5/6 -/2 | D5/2 G5/2 A#5/3 A5/1 G5/2 D5/2 F5/2 A5/2 | G5/4 E5/2 C5/2 E5/2 G5/2 A#5/4 | ` +
      `${s1} | C6/4 A5/2 F#5/2 D5/4 C6/2 A5/2 | A#5/2 A5/2 G5/2 D5/2 E5/2 G5/2 A#5/2 E5/2 |`;
    const melB = 'D6/4 A#5/2 F5/2 D5/4 F5/4 | C#6/4 A#5/2 F5/2 C#5/4 F5/4 | C6/2 A5/2 F5/2 A5/2 C6/2 F6/6 | F#6/4 D6/2 A5/2 C6/8 | ' +
      'A#5/2 D6/2 G6/4 F6/2 D6/2 A#5/4 | A5/2 C6/2 E6/4 G6/4 A#6/4 | A6/4 G6/2 E6/2 F6/4 D6/4 | B5/2 D6/2 F6/2 D6/2 E6/2 C6/2 A#5/2 G5/2';
    // Segunda voz en B: notas largas una tercera o una sexta abajo.
    const harB = 'F5/8 D5/8 | F5/8 C#5/8 | A4/8 C5/8 | D5/8 F#5/8 | D5/8 A#4/8 | E5/8 G5/8 | E5/8 A5/8 | F5/8 E5/8';
    const swing = 'k/4 h/2 h/2 s/4 h/2 h/2';
    const fill = 'k/4 h/2 h/2 s/2 s/2 t/2 T/2';
    const dr = `c+${swing} ${rep(swing, 6)} ${fill}`;
    return {
      bpm: 140, era: 'nes', swing: 0.2, form: ['A1', 'A2', 'B', 'A2'],
      voices: [
        { wave: 'square', vol: 0.03, parts: {
          A1: `${a7} F5/6 -/2 C5/2 D5/2 E5/2 -/2`, A2: `${a7} F5/4 A5/2 C6/2 F6/4! -/4`, B: melB,
        } },
        { wave: 'pulse25', vol: 0.013, env: 'soft', parts: { B: harB } },
        { wave: 'pulse12', vol: 0.016, env: 'stab', parts: {
          A1: nesLine(chA, comp, compH), A2: nesLine(chA, comp, compH), B: nesLine(chB, comp, compH),
        } },
        { wave: 'triangle', vol: 0.1, legato: 0.7, parts: { A1: walk(chA, 'F'), A2: walk(chA, 'Bb'), B: walk(chB, 'F') } },
        { wave: 'noise', vol: 0.018, parts: { A1: dr, A2: dr, B: dr } },
      ],
    };
  })(),

  // Castillo 3: marcha de castillo en La frigio, 110 BPM. Segundas menores que se arrastran, un
  // trémolo de pulso 12 % como antorchas, bajo que pisa medio tono arriba y pasos de armadura.
  // En B sube a Do y baja por semitonos de regreso. Forma A B A' (24 compases, ~52 s).
  nes_castillo: (() => {
    const a6 = 'A4/6 A#4/2 A4/8 | C5/6 B4/2 A#4/8 | A4/4 E5/4 D#5/4 D5/4 | C#5/12 -/4 | A4/6 A#4/2 A4/4 C5/4 | E5/6 F5/2 E5/8 |';
    const melA1 = `${a6} D#5/4 D5/4 C#5/4 D5/4 | A4/12 -/4`;
    const melA2 = `${a6} D#5/4 D5/4 C#5/4 A#4/4 | A4/16`;
    const melB = 'C5/6 C#5/2 C5/8 | D#5/6 D5/2 C#5/8 | C5/4 G5/4 F#5/4 F5/4 | E5/12 -/4 | F5/4 F#5/4 G5/4 G#5/4 | A5/4 A#5/4 B5/4 C6/4 | ' +
      'C#6/8! A5/4 E5/4 | A#5/2 A5/2 G#5/2 G5/2 F#5/2 F5/2 E5/2 D#5/2';
    const trem = (n) => rep(`${n}/1 ${nesTr(n, 1)}/1`, 8);
    const tremA = ['A3', 'A3', 'E3', 'E3', 'A3', 'A3', 'E3', 'E3'].map(trem).join(' | ');
    const tremB = ['C4', 'C4', 'G3', 'G3', 'F3', 'A3', 'C#4', 'E3'].map(trem).join(' | ');
    const step = (r) => { const b = nesTr(r, 1); return rep(`${r}/2. ${r}/2. ${r}/2. ${b}/2.`, 2); };
    const basA = ['A2', 'A2', 'E2', 'E2', 'A2', 'A2', 'E2', 'E2'].map(step).join(' | ');
    const basB = ['C3', 'C3', 'G2', 'G2', 'F2', 'A2', 'C#3', 'E2'].map(step).join(' | ');
    const walkA = 'k/4 -/4 k/2. -/2 h/2? -/2';
    const walkB = 'T/4 -/4 T/2. t/2. -/2 h/2?';
    return {
      bpm: 110, era: 'nes', form: ['A1', 'B', 'A2'],
      voices: [
        { wave: 'square', vol: 0.03, legato: 0.95, vib: 'slow', parts: { A1: melA1, A2: melA2, B: melB } },
        { wave: 'pulse12', vol: 0.011, parts: { A1: tremA, A2: tremA, B: tremB } },
        { wave: 'triangle', vol: 0.11, parts: { A1: basA, A2: basA, B: basB } },
        { wave: 'noise', vol: 0.018, parts: { A1: rep(walkA, 8), A2: rep(walkA, 8), B: `${rep(walkB, 7)} T/2 T/2 t/2 t/2 T/2! t/2! T/4!` } },
      ],
    };
  })(),
});

// ---------- Leyendas de casillas ----------

const NES_CASTLE_TILES = {
  v: { s: 'nes_negro', solid: true },
  A: { s: 'nes_almena', solid: true, under: 'nes_negro', look: 'castillo' },
  C: { s: 'nes_muro', solid: true, look: 'castillo' },
  O: { s: 'nes_puerta' },
};
// Patio y plaza: fondo negro con nubes, ladrillos, bloques ?, tuberías y arbustos.
const NES_OUTSIDE_TILES = {
  ...NES_CASTLE_TILES,
  '.': { s: 'nes_negro' },
  ':': { s: 'nes_suelo' },
  '#': { s: 'nes_ladrillo', solid: true, look: 'ladrillo' },
  '?': { s: 'nes_bloque', solid: true, look: 'bloque' },
  p: { s: 'pipe', solid: true, look: 'tubo' },
  n: { s: 'nes_nube', solid: true, under: 'nes_negro', look: 'nube' },
  b: { s: 'nes_arbusto', solid: true, look: 'arbusto' },
  F: { s: 'nes_asta', solid: true, look: 'asta' },
};
const NES_INSIDE_TILES = {
  ...NES_CASTLE_TILES,
  _: { s: 'nes_piso' },
};

// ---------- Mapas ----------
// Leyenda común: .  piso  :  camino  #  ladrillo  ?  bloque ?  p  tubería  n  nube  b  arbusto
//   v  negro (no se pasa)  A  almena  C  muro de castillo  O  puerta  S  letrero  P  tubería de salida

const NES_PATIO_MAP = [
  'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv',
  'vnnvvvvvvvvvnnvvvvvvvvnnvvvvvvvv',
  '########################AvAvAvA#',
  '#.......#.......#....pp#CCCCCCC#',
  '#.?#?...#..b....#......#CCvCvCC#',
  '#.......#..:::::::::...#CCCCCCC#',
  '#.....bb#..:....#..:...#CCCOCCC#',
  '#.......#..:....#..:.S.#...:...#',
  '#.......#..:.?#?#..:...#.F.:.S.#',
  '#.......#..:....#p.:..b#...:...#',
  '#.....S.#..:....#p.:...#...:...#',
  '#......p#..:..b.#..:::::::::...#',
  '#..::::::::.....#......#.......#',
  '#..:.S..#.....S.#.b..pp#b.....b#',
  '#..P..bb#.......#......#.......#',
  '################################',
];

const NES_CASTILLO1_MAP = [
  'CCCCCCCCCCCCCCCCCCCC',
  'CCCCCCCCCOCCCCCCCCCC',
  'CBBVVVVVVVVVVVVVVVVC',
  'CvvvvvvvvvvvvvvvvvEC',
  'CVVVVVVVVVVVVVVVVVVC',
  'CEvvvvvvvvvvvvvvvvvC',
  'CVVVVVVVVVVVVVVVVVVC',
  'CvvvvvvvvvvvvvvvvvEC',
  'CVVVVVVVVVVVVVVVVVVC',
  'CEvvvvvvvvvvvvvvvvvC',
  'C__________________C',
  'C_S________________C',
  'C__________________C',
  'C__________________C',
  'CCCCCCCCCOCCCCCCCCCC',
];

const NES_BOSQUE_MAP = [
  'TTTTTTTTTTTTTTTTTTTTTTAvAvAvAT',
  'T,,,..TT.T..,,,....TTTCCCCCCCT',
  'T,,,....:T.,,,..*..TTTCCvCvCCT',
  'T.,...T.:T.....~~~.TTTCCCOCCCT',
  'T.....T.:::...~~~~.T..S..:...T',
  'T,,...T.:T..:..~~~.T.*...:.*.T',
  'T,,,....:T..:......T.....:...T',
  'T,,,..,,:T..:..,,,,T.:::::...T',
  'T..,,,,,:T..:..,,,,TT:TTTTTTTT',
  'T.TT.,,,:T..:...TT.T.:,,,,,,.T',
  'T.T..,,.:T..::::...T.:,,,TT,.T',
  'T....,,.:T.....:...T.:,,,TT,.T',
  'T,,.....:T,,,..:.S.T.:,,,,,,.T',
  'T,,,....:T,,,..:::::::.......T',
  'T,,,TT..:T,,,......T..,,,,,..T',
  'T.S.....:T..TT..,,,T..,,,,,..T',
  'T.:::::::T.........T.........T',
  'COCCTTTTTTTTTTTTTTTTTTTTTTTTTT',
];

const NES_CASTILLO2_MAP = [
  'CCCCCCCCCCCCCCCCCCCC',
  'CCCCCCCCCOCCCCCCCCCC',
  'C_X______________X_C',
  'C__________________C',
  'C_X______________X_C',
  'C__________________C',
  'CCCCCCCCC_CCCCCCCCCC',
  'C__________________C',
  'C_X______________X_C',
  'C__________________C',
  'C_X______________X_C',
  'C_S________________C',
  'C__________________C',
  'C__________________C',
  'CCCCCCCCCOCCCCCCCCCC',
];

const NES_PLAZA_MAP = [
  '#######AvAvAvAvA########',
  '#######CCCCCCCCC########',
  '#######CCvCCCvCC########',
  '#n.....CCCCOCCCC......n#',
  '#....S.....:...........#',
  '#..b.......:........b..#',
  '#..........:...........#',
  '#rrrrrrrrrr.rrrrrrrrrrr#',
  '#oooooooooooooooooooooo#',
  '#oooooooooooooooooooooo#',
  '#oooooooooooooooooooooo#',
  '#oooooooooooooooooooooo#',
  '#rrrr.rrrrrrrrrrrrrrrrr#',
  '#....:..b.........b....#',
  '#....:.................#',
  '#....:.S...............#',
  '#....:.................#',
  'CCCCCOCCCC##############',
];

const NES_CASTILLO3_MAP = [
  'CCCCCCCCCCCCCCCCCCCCCCCC',
  'C_____LLLLLLLLLLLL_____C',
  'C_CC__LLLLLLLLLLLL_____C',
  'C_____LLLLLLLLLLLL_____C',
  'C_____LLLLLLLLLLLL__S__C',
  'C_____LLLLLLLLLLLL_____C',
  'C_____LLLLLLLLLLLLH____C',
  'C_____============__P__C',
  'C_____LLLLLLLLLLLL_____C',
  'C_CC__LLLLLLLLLLLL_____C',
  'C_____LLLLLLLLLLLL_____C',
  'C_____LLLLLLLLLLLL_____C',
  'C___S_LLLLLLLLLLLL_____C',
  'C_____LLLLLLLLLLLL_____C',
  'CCOCCCCCCCCCCCCCCCCCCCCC',
];

// Lo que se ve al revisar casillas (ENTER enfrente).
const NES_LOOKS = {
  ladrillo: '* Ladrillos de verdad.\n* Bueno, de verdad de 8 bits.',
  bloque: '* Un bloque con un signo de interrogación.\n* Le das un cabezazo... ¡Ting! Estaba vacío. Qué misterio.',
  tubo: '* Una tubería verde. Se oye eco adentro.\n* "...ohhh... ohhh..."',
  nube: '* Una nube blanca y esponjosa.\n* Tiene una forma MUY familiar.',
  arbusto: '* Un arbusto verde y esponjoso.\n* ...¿Seguro que no es una nube pintada de verde?',
  asta: '* Un asta con bandera.\n* Dicen que si llegas hasta arriba dan muchos puntos.',
  castillo: '* Un muro de castillo.\n* Todos los bloques son exactamente iguales. Es la ley del castillo.',
  viga: '* Una viga roja llena de agujeros.\n* Huele a plátano y a barril.',
  barril: '* Un barril de madera.\n* Tiene escrito: "PROPIEDAD DE K. TAMBOR".',
  estatua: '* Una estatua de piedra con cara de pocos amigos.\n* No se mueve. Por ahora.',
  lava: '* Lava naranja. Hace burbujas de 8 bits.\n* Mejor no tocarla.',
  hacha: '* Un hacha junto al puente.\n* Del otro lado hay una cuerda... Ya sabes lo que pasa si la cortas.',
  cuerda: '* Las cuerdas del ring.\n* Rebotan. Mucho.',
  arbol: '* Un árbol oscuro. Algo se mueve entre las hojas.\n* ...Ah, es un pato.',
};

// Hongo-paje del castillo, con un saludo nuevo cada vez (el aviso famoso ya te lo dio en la pelea).
function nesPaje(id, lines) {
  return async (ctx) => {
    await ctx.say([lines[ctx.counter(id) % lines.length]], 'HONGO-PAJE');
  };
}

addMaps('nes', {
  entry: { map: 'nes-patio', spawn: [3, 13, 'up'] },
  maps: {
    'nes-patio': {
      name: 'Patio de Ladrillos',
      intro: ['* ¡Ladrillos, bloques con signo de pregunta, tuberías!\n* Esto es el CASTILLO 8-BIT.', '* Aquí todos tienen solo tres colores. Y las MAYÚSCULAS importan:\n* usa SHIFT cuando un nombre empiece con mayúscula.'],
      music: 'nes_patio',
      ground: 'nes_negro',
      map: NES_PATIO_MAP,
      tiles: NES_OUTSIDE_TILES,
      spawns: { start: [3, 13, 'up'] },
      exits: {
        '3,14': { pueblo: 'nes' },
        '27,6': { map: 'nes-castillo1', spawn: [9, 13, 'up'] },
      },
      encounters: [
        { enemy: 'mario11', x: 8, y: 12, say: ['* Un plomero bigotón te cierra el paso junto a la tubería.', '* "¿Vas a los castillos? Primero hay que pasar el MUNDO 1-1.\n* ¡Vamos juntos!"'] },
        { enemy: 'ladrillin', x: 16, y: 5, say: ['* ¡Alto! ¡Este hueco en la pared es MIO!\n* ...Bueno, yo SOY la pared.'] },
        { enemy: 'caparacho', x: 23, y: 11, say: ['* ¡Vuuum! ¡Nadie pasa al castillo sin echar una carrera conmigo!'] },
      ],
      chests: [
        { id: 'nes_moneda', x: 15, y: 14, treasure: 'moneda_8bit', word: 'Moneda' },
      ],
      signs: {
        '5,13': ['* PATIO DE LADRILLOS\n* (Tubería al Pueblo Vitrina)', `* ${NES_FACTS[1]}`],
        '6,10': ['* MUNDO 1-1', '* La música de Super Mario Bros. (1985) la compuso Koji Kondo.\n* Seguro ya la estás tarareando.'],
        '14,13': ['* DATO DEL PATIO', '* Mario salió por primera vez en Donkey Kong (1981).\n* Se llamaba "Jumpman" y era carpintero, no plomero.'],
        '21,7': ['* DATO DEL PATIO', `* ${NES_FACTS[2]}`],
        '29,8': '* CASTILLO 1\n* Guardián: KONGO TAMBOR.\n* (Se aceptan plátanos.)',
      },
      looks: NES_LOOKS,
      bitTips: [
        '* ¡Qué colores! Rojo, naranja, verde... ¡y el cielo es NEGRO!',
        '* Los monstruos se paran en los huecos de las paredes.\n* Hay que vencerlos (o hacernos amigos) para pasar.',
        '* Aquí las MAYUSCULAS cuentan. ¡Usa SHIFT!',
        '* Con ESC podemos volver al pueblo cuando quieras.',
        '* Los letreros tienen datos de la NES de verdad. ¡Léelos todos!',
        '* Esa nube y ese arbusto... se me hace que los dibujó la misma persona.',
      ],
      npcs: [
        {
          id: 'luigi', sprite: 'luigi', x: 5, y: 11,
          async talk(ctx) {
            if (!ctx.flag('metLuigi')) {
              ctx.setFlag('metLuigi');
              await ctx.say([
                '* ¡Hola! Soy LUIGI.\n* Estoy esperando a mi hermano.',
                '* Se metió al MUNDO 1-1 y no ha salido.\n* Lleva corriendo a la derecha desde 1985.',
              ], 'LUIGI');
              return;
            }
            const lines = [
              '* Nuestro primer juego juntos fue Mario Bros. (1983).\n* Él era el jugador 1. Yo, el 2. Como siempre.',
              '* Dicen que en la NES soy igualito a mi hermano, pero en verde.\n* Mismo dibujo, otra paleta. ¡Así ahorraban memoria!',
              '* Si ves a mi hermano, dile que la cena se enfría.\n* Hongos. Otra vez.',
            ];
            await ctx.say([lines[ctx.counter('luigi') % lines.length]], 'LUIGI');
          },
        },
      ],
    },

    'nes-castillo1': {
      name: 'Castillo 1',
      music: 'kongo',
      ground: 'nes_piso',
      map: NES_CASTILLO1_MAP,
      tiles: {
        ...NES_INSIDE_TILES,
        V: { s: 'nes_viga', look: 'viga' },
        E: { s: 'nes_escalera' },
        B: { s: 'nes_barril', solid: true, under: 'nes_viga', look: 'barril' },
      },
      spawns: { start: [9, 13, 'up'] },
      exits: {
        '9,14': { map: 'nes-patio', spawn: [27, 7, 'down'] },
        '9,1': { map: 'nes-bosque', spawn: [1, 16, 'up'] },
      },
      encounters: [
        { enemy: 'kongo', x: 9, y: 2, say: ['* ¡BUM BUM BUM!\n* ¿Quién se atreve a subir MIS vigas?', '* ¡La puerta de atrás es mía! ¡A ver si saltas mis barriles!'] },
      ],
      signs: {
        '2,11': ['* CASTILLO 1\n* Sube por las vigas y las escaleras.', '* Arriba toca el tambor un gorila con corbata.\n* Y avienta barriles. Muchos.'],
      },
      looks: NES_LOOKS,
      bitTips: [
        '* ¡Vigas rojas y escaleras! Esto me recuerda a un juego de 1981.',
        '* Escucha... ¡bum, bum, bum! Viene de hasta arriba.',
        '* Zigzag: derecha, escalera, izquierda, escalera... ¡Tú puedes!',
      ],
      npcs: [
        {
          id: 'paje1', sprite: 'paje', x: 5, y: 2, when: () => !!Save.data.done.kongo,
          talk: nesPaje('paje1', [
            '* ¡Hola otra vez!\n* Ya te di la noticia, ¿verdad? Me encanta darla.',
            '* La puerta de arriba lleva al BOSQUE OSCURO.\n* Y detrás del bosque está el Castillo 2.',
            '* Practico mi frase todas las mañanas frente al espejo.\n* "Tu consola está en otro..." ¡Perfecta!',
          ]),
        },
      ],
    },

    'nes-bosque': {
      name: 'Bosque Oscuro',
      music: 'patos',
      ground: 'nes_pasto',
      map: NES_BOSQUE_MAP,
      tiles: {
        ...NES_CASTLE_TILES,
        '.': { s: 'nes_pasto' },
        ',': { s: 'nes_pastoalto', tall: true },
        ':': { s: 'nes_tierra' },
        '*': { s: 'nes_flor' },
        T: { s: 'nes_arbol', solid: true, look: 'arbol' },
      },
      spawns: { start: [1, 16, 'up'] },
      exits: {
        '1,17': { map: 'nes-castillo1', spawn: [9, 2, 'down'] },
        '25,3': { map: 'nes-castillo2', spawn: [9, 13, 'up'] },
      },
      encounters: [
        { enemy: 'bombita', x: 9, y: 4, say: ['* ¡No hay tiempo! ¡NO HAY TIEMPO!\n* ¡Quítate de mi camino! ...Espera, tú estás en MI camino.'] },
        { enemy: 'patoloco', x: 19, y: 13, say: ['* ¡Cuac cuac! ¡Ja ja ja!\n* ¡A que no me atrapas!'] },
        { enemy: 'patos', x: 21, y: 8, say: ['* ¡Es TOBY! Mueve la cola en medio del camino.', '* "¡Guau! El camino al castillo está lleno de PATOS DE LETRAS.\n* ¡Atrapemos unos cuantos con tu red de letras!"'] },
      ],
      chests: [
        { id: 'nes_estrella', x: 18, y: 1, treasure: 'super_estrella', word: 'Estrella' },
      ],
      signs: {
        '2,15': ['* BOSQUE OSCURO\n* Cuidado con el pasto alto.', '* Duck Hunt (1984) se jugaba con la Zapper, una pistola de luz.\n* Solo funcionaba en las teles de tubo.'],
        '17,12': ['* DATO DEL BOSQUE', '* Entre la NES y la Famicom se vendieron casi 62 millones de consolas.'],
        '22,4': '* CASTILLO 2\n* Adentro: la MAZMORRA DE LLAVES.\n* Lleva frases con mayúscula y punto final.',
      },
      looks: NES_LOOKS,
      wild: ['bombita', 'patoloco'],
      bitTips: [
        '* Qué oscuro... Bueno, aquí TODO es oscuro, pero esto más.',
        '* En el pasto alto vuelven a salir los que ya vencimos.\n* ¡Buena práctica para los dedos!',
        '* ¿Oíste eso? Algo hizo "cuac".',
        '* Toby dijo que nos esperaba antes del castillo.',
      ],
    },

    'nes-castillo2': {
      name: 'Castillo 2',
      music: 'mazmorra',
      ground: 'nes_piso2',
      map: NES_CASTILLO2_MAP,
      tiles: {
        ...NES_CASTLE_TILES,
        _: { s: 'nes_piso2' },
        C: { s: 'nes_muro2', solid: true, look: 'castillo' },
        O: { s: 'nes_puerta2' },
        X: { s: 'nes_estatua', solid: true, look: 'estatua' },
      },
      spawns: { start: [9, 13, 'up'] },
      exits: {
        '9,14': { map: 'nes-bosque', spawn: [25, 4, 'down'] },
        '9,1': { map: 'nes-plaza', spawn: [5, 16, 'up'] },
      },
      encounters: [
        { enemy: 'mazmorra', x: 9, y: 6, say: ['* (Una llave enorme flota frente a la reja.)', '* (Detrás está la MAZMORRA DE LLAVES.\n* Abajo, algo ronca y huele a pólvora.)'] },
      ],
      chests: [
        { id: 'nes_control', x: 17, y: 12, treasure: 'control_nes', word: 'Control' },
      ],
      signs: {
        '2,11': ['* CASTILLO 2', '* The Legend of Zelda salió en Japón en 1986, en un disquete\n* para el Famicom Disk System.'],
      },
      looks: NES_LOOKS,
      bitTips: [
        '* Estatuas, piedra azul, eco... ¡esto es una mazmorra!',
        '* Esa llave flotando no me da confianza. Pero ni modo.',
        '* Si la mazmorra se pone difícil, la Espada del Anciano ayuda.',
      ],
      npcs: [
        {
          id: 'paje2', sprite: 'paje', x: 12, y: 3, when: () => !!Save.data.done.mazmorra,
          talk: nesPaje('paje2', [
            '* Sí. Ya sé. Otra vez un paje.\n* El del Castillo 1 es mi primo. Somos idénticos: hongo de tres colores.',
            '* Pasando la plaza está el Castillo 3.\n* Ese sí es el bueno. Te lo juro por mi sombrero.',
            '* ¿Que si me canso de decir lo mismo?\n* Un poquito. Pero tengo prestaciones.',
          ]),
        },
      ],
    },

    'nes-plaza': {
      name: 'Ring de la Plaza',
      music: 'punin',
      ground: 'nes_negro',
      map: NES_PLAZA_MAP,
      tiles: {
        ...NES_OUTSIDE_TILES,
        r: { s: 'nes_cuerda', solid: true, under: 'nes_lona', look: 'cuerda' },
        o: { s: 'nes_lona' },
      },
      spawns: { start: [5, 16, 'up'] },
      exits: {
        '5,17': { map: 'nes-castillo2', spawn: [9, 2, 'down'] },
        '11,3': { map: 'nes-castillo3', spawn: [2, 13, 'up'] },
      },
      encounters: [
        { enemy: 'punin', x: 11, y: 7, say: ['* ¡DING DING!\n* ¡Nadie sale de MI ring sin aguantar un round!'] },
      ],
      signs: {
        '7,15': ['* RING DE LA PLAZA\n* Entrada libre. Salida... depende.', '* En Punch-Out!! (1987) el árbitro del ring era nada menos que Mario.'],
        '5,4': '* CASTILLO 3\n* Aquí vive LORD CAPARAZON.\n* (Se ruega no hacer enojar al rey.)',
      },
      looks: NES_LOOKS,
      bitTips: [
        '* ¡Un ring de box en medio de la plaza! Muy normal todo.',
        '* La salida al Castillo 3 está del otro lado del ring...',
        '* Cuando Puñín parpadee una palabra, ¡escríbela rapidísimo!',
      ],
      npcs: [
        {
          id: 'arbitro', sprite: 'arbitro', x: 4, y: 9,
          async talk(ctx) {
            if (Save.data.done.punin) {
              await ctx.say([rand([
                '* ¡Qué pelea! Puñín ya está entrenando para la revancha.',
                '* Conté hasta diez y nadie se levantó.\n* Bueno, conté hasta tres. Tenía prisa.',
              ])], 'ARBITRO');
              return;
            }
            await ctx.say([rand([
              '* Soy el árbitro. ¿Que me parezco a alguien famoso?\n* No sé de qué hablas. Yo solo cuento hasta diez.',
              '* Reglas del ring: nada de golpes bajos y nada de faltas de ortografía.',
              '* El campeón espera en la salida de arriba.\n* Para pasar, hay que esquivarlo... escribiendo.',
            ])], 'ARBITRO');
          },
        },
      ],
    },

    'nes-castillo3': {
      name: 'Castillo 3',
      music: 'nes_castillo',
      ground: 'nes_piso',
      map: NES_CASTILLO3_MAP,
      tiles: {
        ...NES_INSIDE_TILES,
        L: { s: 'nes_lava', solid: true, look: 'lava' },
        '=': { s: 'nes_puente', under: 'nes_lava' },
        H: { s: 'nes_hacha', solid: true, look: 'hacha' },
      },
      spawns: { start: [2, 13, 'up'] },
      exits: {
        '2,14': { map: 'nes-plaza', spawn: [11, 4, 'down'] },
        '21,7': { pueblo: 'nes' },
      },
      encounters: [
        { enemy: 'caparazon', x: 11, y: 7, say: ['* ¡BIENVENIDO A MI PUENTE! ¡BIENVENIDO A MI PUEN—\n* ¡BIEN- BIENVENIDO!'] },
      ],
      signs: {
        '4,12': ['* CASTILLO 3', '* Super Mario Bros. tiene 8 mundos de 4 niveles.\n* ¡32 niveles en un solo cartucho!'],
        '20,4': '* ¡Felicidades!\n* Esta vez la consola SI estaba en este castillo.\n* (Firma: los pajes.)',
      },
      looks: NES_LOOKS,
      bitTips: [
        '* Lava, un puente y un hacha... Conozco esta historia.',
        '* ¿Escuchas? Alguien repite lo mismo una y otra vez.',
        '* Esa tubería del fondo nos lleva directo al pueblo.',
      ],
    },
  },
});

// ---------- Ajustes que necesitan scripts que cargan después ----------

// js/town-eras.js (HUB_ERAS) y js/scenes/mario.js (SPRITES.mario) cargan después de este archivo:
// se completan cuando ya cargó todo, antes de que el juego pinte algo.
addEventListener('DOMContentLoaded', () => {
  Object.assign(HUB_ERAS.nes.tiles, NES_MAP_TILE_COLORS);

  // En las zonas, los personajes de la era NES se pintan con la paleta general de la era.
  // Con `pal` (paintSprite) cada dibujo NES conserva sus 3 colores de verdad en el mapa y la vitrina.
  const withPal = (id, pal) => { if (SPRITES[id] && pal) SPRITES[id].pal = pal; };
  [...Object.keys(NES_ART), ...Object.keys(NES_MAP_ART.sprites)].forEach((id) => withPal(id, SPRITE_PALETTES[id]));
  if (SPRITES.mario) {
    withPal('mario', { b: NES.S, c: NES.R, d: NES.B });
    // Luigi: el mismo dibujo con otra paleta. El árbitro del ring, también (camisa blanca).
    SPRITES.luigi = Object.assign(SPRITES.mario.slice(), { pal: { b: NES.S, c: NES.G, d: NES.B } });
    SPRITES.arbitro = Object.assign(SPRITES.mario.slice(), { pal: { b: NES.S, c: NES.W, d: NES.K } });
  }
});
