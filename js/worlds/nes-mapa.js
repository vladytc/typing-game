// MUNDO 2 — Castillo 8-Bit explorable (docs/LORE.md §5). Se carga después de js/worlds/nes.js.
// Seis zonas conectadas por puertas; cada encuentro está parado en un paso angosto, así el orden
// del mundo sale del mapa (docs/MUNDOS.md §3d):
//
//   PATIO (REINO CHAMPIÑÓN) ─puerta──> CASTILLO 1 ──puerta de arriba──> BOSQUE PERDIDO ──puerta──>
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
// Casillas del recorrido nuevo: el pasto y el camino del Reino Champiñón (como el mapa de
// Super Mario Bros. 3), las colinas redondas, la Casa de Toad, la ciudad del box y Hyrule.
Object.assign(SPRITES, {
  nes_cielo: rowsOf(() => 'b'),
  // Tubería verde vista desde arriba: el borde grueso y el hoyo oscuro en medio.
  nes_tubo: rowsOf((x, y) => {
    if (x === 0 || x === 15 || y === 0 || y === 15) return 'd';
    const r = Math.hypot(x - 7.5, y - 7.5);
    if (r < 3.6) return 'd';
    if (r < 4.8) return 'c';
    if (x <= 3 || y <= 2) return 'a';
    return x >= 12 || y >= 13 ? 'c' : 'b';
  }),
  // Colina de Super Mario Bros.: un domo verde con sus dos "ojos" negros.
  nes_colina: rowsOf((x, y) => {
    const dx = (x + 0.5 - 8) / 7.8;
    const dy = (y + 0.5 - 16) / 15.5;
    const dd = dx * dx + dy * dy;
    if (dd > 1) return '.';
    if (dd > 0.82) return 'd';
    if ((x === 6 && y >= 6 && y <= 8) || (x === 9 && y >= 6 && y <= 8)) return 'd';
    if (x < 8 && dd < 0.5 && (x + y) % 5 === 0) return 'a';
    return y > 12 ? 'c' : 'b';
  }),
  // Camino de arena con puntitos (como los caminos del mapa de Super Mario Bros. 3).
  nes_senda: rowsOf((x, y) => ((x % 8 === 2 && y % 8 === 2) || (x % 8 === 6 && y % 8 === 6) ? 'c' : 'b')),
  // Cuadro de nivel del mapa de Super Mario Bros. 3, con su número 1.
  nes_panel: [
    '................',
    '.dddddddddddddd.',
    '.dbbbbbbbbbbbbd.',
    '.dbbbbbaabbbbbd.',
    '.dbbbbaaabbbbbd.',
    '.dbbbaaaabbbbbd.',
    '.dbbbbbaabbbbbd.',
    '.dbbbbbaabbbbbd.',
    '.dbbbbbaabbbbbd.',
    '.dbbbbbaabbbbbd.',
    '.dbbbbbaabbbbbd.',
    '.dbbbbaaaabbbbd.',
    '.dbbbbbbbbbbbbd.',
    '.dddddddddddddd.',
    '..ccccccccccccc.',
    '................',
  ],
  // Casa de Toad: techo de hongo rojo con lunares blancos, pared clarita y puerta.
  nes_hongotecho: rowsOf((x, y) => {
    if (y === 15) return 'd';
    if (Math.hypot(x - 4, y - 6) < 3 || Math.hypot(x - 12, y - 10) < 2.6) return 'a';
    return 'b';
  }),
  nes_casapared: rowsOf((x, y) => (y === 15 ? 'd' : x === 0 || x === 15 ? 'c' : 'b')),
  nes_casapuerta: SPRITES.door,
  // Tambo de aceite con su fuego (la primera pantalla de Donkey Kong).
  nes_bidon: [
    '....c..c...c....',
    '...ccc.cc.ccc...',
    '..cccccaccccc...',
    '..ddddddddddddd.',
    '..dbbbbbbbbbbbd.',
    '..daaaaaaaaaaad.',
    '..dbbbbbbbbbbbd.',
    '..dbaabaabbabbd.',
    '..dbababababbbd.',
    '..dbaabaabbabbd.',
    '..dbbbbbbbbbbbd.',
    '..daaaaaaaaaaad.',
    '..dbbbbbbbbbbbd.',
    '..dbbbbbbbbbbbd.',
    '..ddddddddddddd.',
    '................',
  ],
  // Hyrule (The Legend of Zelda, 1986): arena clarita, rocas cafés y la boca negra de una cueva.
  nes_arena: rowsOf((x, y) => ((x * 5 + y * 7) % 23 === 0 ? 'c' : 'b')),
  // Rocas de Hyrule: bultos redondos con contorno negro y brillo arriba.
  nes_roca: rowsOf((x, y) => {
    const ox = y < 8 ? 0 : 4;
    const lx = (x + ox) % 8;
    const ly = y % 8;
    const r = Math.hypot(lx - 3.5, ly - 3.5);
    if (r > 3.9) return 'd';
    if (r > 3.0) return ly < 4 ? 'a' : 'c';
    return lx + ly < 5 ? 'a' : 'b';
  }),
  nes_cueva: SPRITES.cave,
  // Escalera de la mazmorra (en Zelda, las escaleras llevaban a pasajes escondidos).
  nes_escalon: rowsOf((x, y) => (x === 0 || x === 15 || y === 0 ? 'd' : y % 4 < 2 ? 'a' : 'c')),
  // Ciudad del box (Punch-Out!!, 1987): banqueta, calle, edificios con ventanas y faroles.
  nes_acera: rowsOf((x, y) => (x % 8 === 0 || y % 8 === 0 ? 'c' : 'b')),
  nes_calle: rowsOf((x, y) => (y >= 7 && y <= 8 && x % 8 >= 2 && x % 8 <= 5 ? 'a' : (x * 3 + y * 7) % 19 === 0 ? 'c' : 'b')),
  nes_edificio: rowsOf((x, y) => {
    const wx = x % 8;
    const wy = y % 8;
    if (wx >= 2 && wx <= 5 && wy >= 2 && wy <= 5) return wx === 2 || wy === 2 ? 'd' : 'a';
    return wy === 0 ? 'c' : 'b';
  }),
  // Azotea: el cielo morado de la noche (como el entrenamiento de Punch-Out!!) y la silueta de la ciudad.
  nes_azotea: rowsOf((x, y) => {
    const top = [9, 6, 6, 11, 11, 4, 4, 4, 8, 8, 12, 12, 5, 5, 10, 10][x];
    if (y < top) return (x * 7 + y * 3) % 29 === 0 ? 'a' : 'c';
    return (x % 3 === 1 && y % 3 === 1 && y > top) ? 'b' : 'd';
  }),
  nes_farol: [
    '................',
    '.....dddddd.....',
    '....daaaaaad....',
    '....daaaaaad....',
    '.....dddddd.....',
    '.......dd.......',
    '.......cc.......',
    '.......cc.......',
    '.......cc.......',
    '.......cc.......',
    '.......cc.......',
    '.......cc.......',
    '.......cc.......',
    '......dccd......',
    '.....dddddd.....',
    '................',
  ],
  // Entrada del metro: escalones que bajan.
  nes_metro: rowsOf((x, y) => {
    if (x <= 1 || x >= 14) return 'c';
    if (y <= 1) return 'a';
    return y % 3 === 0 ? 'd' : 'b';
  }),
});
// Mismo dibujo, otra paleta (como en la NES): Hyrule, la Pradera de Duck Hunt, el Mundo 1-2 bajo
// tierra, la mazmorra del Nivel 1 y las estatuas del Castillo de Bowser.
Object.assign(SPRITES, {
  nes_cesped: SPRITES.grass,
  nes_pasto: SPRITES.grass,
  nes_pastoalto: SPRITES.tall,
  nes_flor: SPRITES.flower,
  nes_arbol: SPRITES.tree,
  nes_arbolz: SPRITES.tree,
  nes_arbolp: SPRITES.tree,
  nes_tierra: SPRITES.path,
  nes_agua: SPRITES.water,
  nes_ladrillo2: SPRITES.nes_ladrillo,
  nes_suelo2: SPRITES.nes_suelo,
  nes_piso2: SPRITES.nes_piso,
  nes_muro2: SPRITES.nes_muro,
  nes_puerta2: SPRITES.nes_puerta,
  nes_estatua3: SPRITES.nes_estatua,
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
  // Reino Champiñón
  nes_cielo: { a: '#5c94fc', b: '#5c94fc', c: '#5c94fc', d: '#5c94fc' },
  nes_tubo: { a: '#b8f818', b: '#00a800', c: '#005800', d: '#000000' },
  nes_cesped: { a: '#00a800', b: '#58d854', c: '#005800', d: '#000000' },
  nes_colina: { a: '#b8f818', b: '#00a800', c: '#008800', d: '#000000' },
  nes_senda: { a: '#fcfcfc', b: '#fcd8a8', c: '#c84c0c', d: '#000000' },
  nes_panel: { a: '#000000', b: '#f8b800', c: '#005800', d: '#000000' },
  nes_hongotecho: { a: '#fcfcfc', b: '#f83800', c: '#a81000', d: '#000000' },
  nes_casapared: { a: '#fcfcfc', b: '#fcd8a8', c: '#c84c0c', d: '#000000' },
  nes_casapuerta: { a: '#f8b800', b: '#fcd8a8', c: '#c84c0c', d: '#000000' },
  nes_agua: { a: '#fcfcfc', b: '#3cbcfc', c: '#0058f8', d: '#000000' },
  nes_bidon: { a: '#fcfcfc', b: '#0058f8', c: '#f83800', d: '#000000' },
  // Mundo 1-2, bajo tierra: los mismos ladrillos y bloques de suelo, pero azules.
  nes_ladrillo2: { a: '#3cbcfc', b: '#0058f8', c: '#0058f8', d: '#000000' },
  nes_suelo2: { a: '#0058f8', b: '#0000bc', c: '#0000bc', d: '#000000' },
  // Hyrule
  nes_arena: { a: '#fcd8a8', b: '#fcd8a8', c: '#fca044', d: '#000000' },
  nes_roca: { a: '#fca044', b: '#c84c0c', c: '#881400', d: '#000000' },
  nes_cueva: { a: '#000000', b: '#c84c0c', c: '#c84c0c', d: '#000000' },
  nes_arbolz: { a: '#fcfcfc', b: '#58d854', c: '#00a800', d: '#000000' },
  nes_arbolp: { a: '#fcfcfc', b: '#00a800', c: '#005800', d: '#000000' },
  nes_escalon: { a: '#00e8d8', b: '#008888', c: '#004058', d: '#000000' },
  // Ciudad del box
  nes_acera: { a: '#fcfcfc', b: '#bcbcbc', c: '#7c7c7c', d: '#000000' },
  nes_calle: { a: '#f8b800', b: '#3c3c3c', c: '#7c7c7c', d: '#000000' },
  nes_edificio: { a: '#f8b800', b: '#a81000', c: '#c84c0c', d: '#000000' },
  nes_azotea: { a: '#fcfcfc', b: '#f8b800', c: '#4428bc', d: '#000000' },
  nes_farol: { a: '#f8b800', b: '#7c7c7c', c: '#7c7c7c', d: '#000000' },
  nes_metro: { a: '#00a800', b: '#7c7c7c', c: '#bcbcbc', d: '#000000' },
  // Castillo de Bowser: estatuas grises del rey Koopa.
  nes_estatua3: { a: '#fcfcfc', b: '#7c7c7c', c: '#3c3c3c', d: '#000000' },
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

// Reino Champiñón: pasto, camino de arena, colinas, tubos, bloques y ladrillos sueltos, el río
// con su puente, la Casa de Toad, la Obra 25m al fondo y el Mundo 1-2 bajo tierra (azul).
const NES_REINO_TILES = {
  '.': { s: 'nes_cesped' },
  ':': { s: 'nes_senda' },
  k: { s: 'nes_cielo', solid: true, look: 'cielo' },
  n: { s: 'nes_nube', solid: true, under: 'nes_cielo', look: 'nube' },
  h: { s: 'nes_colina', solid: true, look: 'colina' },
  b: { s: 'nes_arbusto', solid: true, look: 'arbusto' },
  '#': { s: 'nes_ladrillo', solid: true, look: 'ladrillo' },
  '?': { s: 'nes_bloque', solid: true, look: 'bloque' },
  p: { s: 'nes_tubo', solid: true, look: 'tubo' },
  P: { s: 'nes_tubo', pipe: true },
  q: { s: 'nes_tubo', pipe: true },
  w: { s: 'nes_agua', solid: true, look: 'agua' },
  '=': { s: 'nes_puente', under: 'nes_agua' },
  1: { s: 'nes_panel', solid: true },
  F: { s: 'nes_asta', solid: true, look: 'asta' },
  m: { s: 'nes_hongotecho', solid: true, look: 'casatoad' },
  u: { s: 'nes_casapared', solid: true, look: 'casatoad' },
  d: { s: 'nes_casapuerta', solid: true, look: 'casatoad' },
  V: { s: 'nes_viga', solid: true, look: 'viga' },
  l: { s: 'nes_escalera', solid: true, look: 'viga' },
  E: { s: 'nes_escalera' },
  B: { s: 'nes_barril', solid: true, look: 'barril' },
  o: { s: 'nes_bidon', solid: true, look: 'bidon' },
  z: { s: 'nes_ladrillo2', solid: true, look: 'ladrillo' },
  g: { s: 'nes_suelo2' },
  s: { s: 'sign', solid: true, under: 'nes_suelo2' },
  x: { s: 'nes_tubo', solid: true, under: 'nes_suelo2', look: 'tubo' },
  Q: { s: 'nes_tubo', pipe: true, under: 'nes_suelo2' },
};

// ---------- Mapas ----------
// Cada zona es un juego de la NES, en orden: el camino (o la tubería) de cada una lleva a la siguiente.
//
//   REINO CHAMPIÑÓN ──escalera──> OBRA 25m ──tubería de arriba──> HYRULE ──puerta del Nivel 1──>
//   (Super Mario Bros.)           (Donkey Kong)                   (Zelda: cueva, Bosque Perdido, pradera)
//   MAZMORRA DEL NIVEL 1 ──escalera──> CIUDAD DEL BOX ──tubería──> CASTILLO DE BOWSER ──tubería──> pueblo
//   (Zelda)                            (Punch-Out!!)               (Super Mario Bros.)

// Reino Champiñón (36×22), visto desde arriba como el mapa de Super Mario Bros. 3:
//
//   cielo y nubes ·························································
//   B: Pit, arbusto,      ║ C: bloques ?,   ≈ D: OBRA 25m (vigas)
//      tubo al 1-2, ?#?   ║    cofre         ≈    escalera = salida
//      ═══camino═══ LADRILLÍN ═══camino══ CAPARACHO (puente) ═══>
//   ───colinas── MARIO ── ║                  ≈
//   A: llegada (tubo),    ║ [Mundo 1-2 bajo tierra: 2 tubos + pared]   mar
//      Luigi, Casa de Toad, cuadro 1-1
const NES_PATIO_MAP = [
  'kkkknnnkkkkkkkkknnkkkkkkkkkkkknnnkkk',
  'kkknnnnnkkkkkkknnnnkkkkkkkkkknnnnnkk',
  'h.............h..........ww.VVVVVVVh',
  'h.........qS..h...#?#?#..ww.VlVVVlVh',
  'h.............#..........ww.VVVVVVVh',
  'h.?#?.........?..........ww.VVVlVVVh',
  'h....::::::::::::::::....ww.VVVEVVVh',
  'h....:........?....:.....ww.Bo.:.S.h',
  'h....:....b...#....::::::==:::::...h',
  'h..h.:........h.h........ww...h....h',
  'h....:...h....h......h...ww.b....h.h',
  'hhhhh:hhhhhhhhh.S........ww....b...h',
  'h...1:F......hh..........wwh......bh',
  'h....:..mmm..hhhhhhhhhhhhwwwwwwwwwwh',
  'h....:..udu.Shzzzzzzzzzzzwwwwwwwwwwh',
  'h....:.......hzggsggggxxzwwwwwwwwwwh',
  'h..:::.......hzQggggggggzwwwwwwwwwwh',
  'h..:.S.......hzgggzzgzggzwwwwwwwwwwh',
  'h..:...b.....hzgggggggggzwwwwwwwwwwh',
  'h..PS....h...hzgzzzgggggzwwwwwwwwwwh',
  'hb.........bbhzzzzzzzzzzzwwwwwwwwwwh',
  'hhhhhhhhhhhhhhhhhhhhhhhhhwwwwwwwwwwh',
];

// Obra en construcción 25m (Donkey Kong, 1981): fondo negro, vigas rojas y escaleras azules.
// Abajo, la planta baja con el tambo de aceite; arriba, Kongo y la tubería a Hyrule.
const NES_CASTILLO1_MAP = [
  'vvvvvvvvvvvvvvvvvvvv',
  'vvvvvvvvvPvvvvvvvvvv',
  'vBBVVVVVVVVVVVVVVVVv',
  'vvvvvvvvvvvvvvvvvvEv',
  'vVVVVVVVVVVVVVVVVVVv',
  'vEvvvvvvvvvvvvvvvvvv',
  'vVVVVVVVVVVVVVVVVVVv',
  'vvvvvvvvvvvvvvvvvvEv',
  'vVVVVVVVVVVVVVVVVVVv',
  'vEvvvvvvvvvvvvvvvvvv',
  'vVVVVVVVVVVVVVVVVVVv',
  'v_S________________v',
  'vo_________________v',
  'v__________________v',
  'vvvvvvvvvEvvvvvvvvvv',
];

// Hyrule (The Legend of Zelda, 1986), 34×23:
//
//   [Entrada al     ]  BOSQUE PERDIDO (4 claros)      [cueva del anciano]
//   [Nivel 1: puerta]   C3 ←── C2                       (se entra por la boca K)
//   ──── TOBY ────      ↓      ↑
//   PRADERA DE      ←── C4    C1
//   DUCK HUNT  PATOLOCO        ↑ entrada
//   (pasto alto,                BOMBITA (paso de rocas)   K boca de la cueva
//    perro, cofre)              camino ═══════════════ tubería (llegada desde la Obra)
//
// El acertijo del Zelda de 1986: norte, oeste, sur, oeste. Cualquier otra salida de un claro
// regresa a la entrada del bosque.
const NES_BOSQUE_MAP = [
  'TTTTTTTTTTTTYYYYYYYYYYYYYYYYRRRRRR',
  'T..MMMMM...TYYY.YYYYYY.YYYYRRRRRRR',
  'T..MMOMM...TY......Y......YRRRRRRR',
  'T......S...T..Y......Y.....RRnnnRR',
  'T..........TY....Y.Y....Y.YRRnnnRR',
  'T..........TY......Y......YRRnnnRR',
  'T..........TYYYY.YYYYY.YYYYRRnnnRR',
  'TTTTT.TTTTTTY......Y......YRRRnRRR',
  'TgggggggggZTY.Y......Y.....RRRRRRR',
  'Tgg,,gggggg......Y.Y....Y.YRRRRRRR',
  'Tg,,,ggggggTY......Y......YRRRRRRR',
  'Tgggg,,gg,gTYYY.YYYYYY.YYYYRRRRRRR',
  'Tg,,gggg,,gTTTTTTTTTTT.TTTTRRRRRRR',
  'Tgg,,g~~gggTTRRRRRRRRR:RRRRKRRRRRR',
  'Tggggg~~g,gTT........S:..........R',
  'Tg,,ggggtggTT..T...T..:....R.....R',
  'Tg,,,ggggggTT.........:..........R',
  'Tgggg,,gg,gTTT..R.....:....T.....R',
  'Tgtgg,,,gggTT.........:.....RR...R',
  'Tggg,,gggggTT..T......:......S...R',
  'Tg,,ggggg,gTT.........:::::::::P.R',
  'Tgggggt,gggTT...T.........R......R',
  'TTTTTTTTTTTTTRRRRRRRRRRRRRRRRRRRRR',
];

// Mazmorra del Nivel 1 de Hyrule: piedra azul, estatuas y la reja con la llave flotante.
const NES_CASTILLO2_MAP = [
  'CCCCCCCCCCCCCCCCCCCC',
  'CCCCCCCCCZCCCCCCCCCC',
  'C_X_____S________X_C',
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

// Ciudad del box (Punch-Out!!, 1987): calles, banquetas, edificios y el ring en medio de la plaza.
// Se llega por el metro (abajo); para llegar a la tubería del norte hay que cruzar el ring.
const NES_PLAZA_MAP = [
  'eeeeeeeeeeeeeeeeeeeeeeee',
  'EEEEEEEEEEEEEEEEEEEEEEEE',
  'E__L______S_P_______L__E',
  'E----------------------E',
  'E______________________E',
  'E______________________E',
  'EEEEErrrrrrrorrrrrrEEEEE',
  'EEEEEroooooooooooorEEEEE',
  'EEEEEroooooooooooorEEEEE',
  'EEEEEroooooooooooorEEEEE',
  'EEEEEroooooooooooorEEEEE',
  'EEEEErrrrrrrorrrrrrEEEEE',
  'E______________________E',
  'E----------------------E',
  'E___S__________________E',
  'E_M_____gtg____gtg_____E',
  'E______________________E',
  'EEEEEEEEEEEEEEEEEEEEEEEE',
];

// Castillo de Bowser (como el 8-4 de Super Mario Bros.): lava, el puente, el hacha y estatuas del rey Koopa.
const NES_CASTILLO3_MAP = [
  'CCCCCCCCCCCCCCCCCCCCCCCC',
  'C_____LLLLLLLLLLLL_____C',
  'C_XX__LLLLLLLLLLLL_____C',
  'C_____LLLLLLLLLLLL_____C',
  'C_____LLLLLLLLLLLL__S__C',
  'C_____LLLLLLLLLLLL_____C',
  'C____XLLLLLLLLLLLLH____C',
  'C_____============__P__C',
  'C____XLLLLLLLLLLLL_____C',
  'C_XX__LLLLLLLLLLLL_____C',
  'C_____LLLLLLLLLLLL_____C',
  'C_____LLLLLLLLLLLL_____C',
  'C___S_LLLLLLLLLLLL_____C',
  'C_____LLLLLLLLLLLL_____C',
  'CCqCCCCCCCCCCCCCCCCCCCCC',
];

const NES_CASTLE_TILES = {
  v: { s: 'nes_negro', solid: true },
  C: { s: 'nes_muro', solid: true, look: 'castillo' },
  O: { s: 'nes_puerta' },
};
const NES_INSIDE_TILES = {
  ...NES_CASTLE_TILES,
  _: { s: 'nes_piso' },
};

// Lo que se ve al revisar casillas (ENTER enfrente).
const NES_LOOKS = {
  ladrillo: '* Ladrillos de verdad.\n* Bueno, de verdad de 8 bits.',
  bloque: '* Un bloque con un signo de interrogación.\n* Le das un cabezazo... ¡Ting! Estaba vacío. Qué misterio.',
  tubo: '* Una tubería verde. Se oye eco adentro.\n* "...ohhh... ohhh..."',
  nube: '* Una nube blanca y esponjosa.\n* Tiene una forma MUY familiar.',
  arbusto: '* Un arbusto verde y esponjoso.\n* ...¿Seguro que no es una nube pintada de verde?',
  asta: '* El asta con bandera del final del nivel.\n* Dicen que si llegas hasta arriba dan muchos puntos.',
  cielo: '* El cielo azul del Reino Champiñón.\n* En Super Mario Bros. es de un solo color. Siempre de día.',
  colina: '* Una colina verde y redonda.\n* Tiene dos rayitas negras. ¿Son ojos? Nadie sabe.',
  agua: '* Agua azul y fresquita.\n* Por aquí nadan los Cheep Cheep, los peces rojos.',
  casatoad: '* La Casa de Toad. Techo de hongo, como su dueño.\n* En Super Mario Bros. 3 regalaban objetos.',
  castillo: '* Un muro de castillo.\n* Todos los bloques son exactamente iguales. Es la ley del castillo.',
  viga: '* Una viga roja llena de agujeros.\n* Huele a plátano y a barril.',
  barril: '* Un barril de madera.\n* Tiene escrito: "PROPIEDAD DE K. TAMBOR".',
  bidon: '* Un tambo de aceite con fuego.\n* En Donkey Kong (1981), de aquí salían llamitas.',
  estatua: '* Una estatua de piedra con cara de pocos amigos.\n* No se mueve. Por ahora.',
  koopa: '* Una estatua del rey Koopa.\n* En Super Mario Bros. 3 algunas disparaban rayos. Esta solo mira feo.',
  lava: '* Lava naranja. Hace burbujas de 8 bits.\n* Mejor no tocarla.',
  hacha: '* Un hacha junto al puente.\n* Del otro lado hay una cuerda... Ya sabes lo que pasa si la cortas.',
  cuerda: '* Las cuerdas del ring.\n* Rebotan. Mucho.',
  arbol: '* Un árbol oscuro. Algo se mueve entre las hojas.\n* ...Ah, es un pato.',
  arbolz: '* Un arbusto de Hyrule.\n* En Zelda, algunos se quemaban con la vela y escondían escaleras.',
  arbolp: '* Todos los árboles del Bosque Perdido son iguales.\n* Por eso todos se pierden.',
  roca: '* Rocas cafés de Hyrule.\n* En Zelda, algunas paredes se abrían con una bomba.',
  edificio: '* Un edificio con las ventanas prendidas.\n* Seguro todos están viendo la pelea por la tele.',
  farol: '* Un farol de la ciudad.\n* Alumbra a los boxeadores que salen a correr de noche.',
};

// Hongo-paje del castillo, con un saludo nuevo cada vez (el aviso famoso ya te lo dio en la pelea).
function nesPaje(id, lines) {
  return async (ctx) => {
    await ctx.say([lines[ctx.counter(id) % lines.length]], 'HONGO-PAJE');
  };
}

// ---------- Pistas de Bit: a dónde ir ----------
// El siguiente enemigo del mundo, en qué zona está y qué decir; si está más adelante, por dónde salir.
const NES_ROUTE = ['nes-patio', 'nes-castillo1', 'nes-bosque', 'nes-castillo2', 'nes-plaza', 'nes-castillo3'];
const NES_GOALS = {
  mario11: ['nes-patio', '* Mario espera en el camino de arena, junto al cuadro del NIVEL 1.\n* ¡Sube por el camino!'],
  ladrillin: ['nes-patio', '* Sigue el camino a la derecha.\n* Un ladrillo con cejas tapa el paso entre las colinas.'],
  caparacho: ['nes-patio', '* Caparacho patina en el puente del río.\n* Del otro lado está la OBRA 25m.'],
  kongo: ['nes-castillo1', '* Kongo está hasta arriba de la obra.\n* Vigas y escaleras: derecha, izquierda, derecha...'],
  bombita: ['nes-bosque', '* Bombita corre en el paso de rocas, al final del camino.\n* Y antes, ¡entra a la cueva! Siempre hay alguien adentro.'],
  patoloco: ['nes-bosque', '* Para cruzar el Bosque Perdido: norte, oeste, sur, oeste.\n* Si te pierdes, el bosque te regresa a la entrada.'],
  patos: ['nes-bosque', '* Toby nos espera en la orilla norte de la pradera,\n* junto a la puerta del NIVEL 1.'],
  mazmorra: ['nes-castillo2', '* La reja de la mazmorra está aquí arriba.\n* La llave flotante nos deja entrar... si escribimos bien.'],
  punin: ['nes-plaza', '* El ring está en medio de la plaza.\n* Puñín cuida la salida de arriba, la que va a la tubería.'],
  caparazon: ['nes-castillo3', '* Lord Caparazón espera en el puente.\n* Del otro lado está la consola.'],
};
const NES_FORWARD = {
  'nes-patio': '* Sigue el camino de arena hasta la OBRA 25m, arriba a la derecha,\n* y sube por la escalera.',
  'nes-castillo1': '* La tubería de hasta arriba de la obra lleva a HYRULE.',
  'nes-bosque': '* La puerta del NIVEL 1 está al norte de la pradera,\n* del otro lado del Bosque Perdido.',
  'nes-castillo2': '* La escalera del fondo de la mazmorra sale a la CIUDAD DEL BOX.',
  'nes-plaza': '* La tubería del norte de la ciudad lleva al CASTILLO DE BOWSER.',
  'nes-castillo3': '* La tubería después del puente nos lleva al pueblo.',
};
function nesNext(mapId) {
  const world = WORLDS.find((w) => w.id === 'nes');
  const next = world && world.nodes.find((id) => !Save.data.done[id]);
  if (!next) return '* ¡Ya rescatamos la NES!\n* Con ESC volvemos al pueblo cuando quieras.';
  const [where, hint] = NES_GOALS[next];
  if (where === mapId) return hint;
  return NES_ROUTE.indexOf(where) > NES_ROUTE.indexOf(mapId) ? NES_FORWARD[mapId] : '* Lo que sigue está de regreso, por donde vinimos.';
}

// Al perderse en el Bosque Perdido, el bosque te regresa a la entrada.
const NES_PERDIDO = {
  map: 'nes-bosque',
  spawn: [22, 12, 'up'],
  say: ['* ...¿Eh? ¡Volvimos a la entrada del bosque!\n* Por ahí no era. Norte, oeste, sur, oeste.'],
};

addMaps('nes', {
  entry: { map: 'nes-patio', spawn: [3, 18, 'up'] },
  maps: {
    'nes-patio': {
      name: 'Reino Champiñón',
      rev: 2,
      intro: [
        '* ¡Pasto verde, cielo azul, tubos y bloques con signo de pregunta!\n* Es el REINO CHAMPIÑÓN, la primera parada del CASTILLO 8-BIT.',
        '* Sigue el CAMINO DE ARENA. Y aquí las MAYÚSCULAS importan:\n* usa SHIFT cuando un nombre empiece con mayúscula.',
      ],
      music: 'nes_patio',
      ground: 'nes_cesped',
      map: NES_PATIO_MAP,
      tiles: NES_REINO_TILES,
      spawns: { start: [3, 18, 'up'] },
      exits: {
        '3,19': { pueblo: 'nes' },
        '31,6': { map: 'nes-castillo1', spawn: [9, 13, 'up'] },
        '10,3': { map: 'nes-patio', spawn: [16, 16, 'right'] },
        '15,16': { map: 'nes-patio', spawn: [10, 4, 'down'] },
      },
      encounters: [
        { enemy: 'mario11', x: 5, y: 11, say: ['* Un plomero bigotón te cierra el paso junto al cuadro del NIVEL 1.', '* "¿Vas a la obra? Primero hay que pasar el MUNDO 1-1.\n* ¡Vamos juntos!"'] },
        { enemy: 'ladrillin', x: 14, y: 6, say: ['* ¡Alto! ¡Este paso entre las colinas es MIO!\n* ...Bueno, yo SOY la pared.'] },
        { enemy: 'caparacho', x: 25, y: 8, say: ['* ¡Vuuum! ¡Nadie cruza MI puente sin echar una carrera conmigo!'] },
      ],
      chests: [
        { id: 'nes_moneda', x: 20, y: 4, treasure: 'moneda_8bit', word: 'Moneda' },
      ],
      signs: {
        '4,19': ['* REINO CHAMPIÑÓN\n* (Tubería al Pueblo Vitrina)', `* ${NES_FACTS[1]}`],
        '5,17': ['* EL CAMINO DEL CASTILLO 8-BIT:\n* REINO CHAMPIÑÓN → OBRA 25m → HYRULE', '* → CIUDAD DEL BOX → CASTILLO DE BOWSER.\n* ¡Sigue el camino de arena!'],
        '4,12': ['* NIVEL 1-1', '* La música de Super Mario Bros. (1985) la compuso Koji Kondo.\n* Seguro ya la estás tarareando.'],
        '11,3': ['* MUNDO 1-2 (BAJO TIERRA)\n* Entra por la tubería.'],
        '12,14': ['* CASA DE TOAD', '* En Super Mario Bros. 3 (1988), las casas de Toad regalaban objetos.\n* Esta regala consejos.'],
        '16,11': ['* DATO DEL REINO', `* ${NES_FACTS[2]}`],
        '33,7': ['* OBRA EN CONSTRUCCIÓN 25m\n* Guardián: KONGO TAMBOR. Sube por la escalera.', '* "25m" era la primera pantalla de Donkey Kong (1981):\n* vigas rojas, escaleras y barriles.'],
        '17,15': ['* MUNDO 1-2', '* El 1-2 era el primer nivel bajo tierra.\n* Al final había tuberías... y una pared muy delgada.'],
      },
      regions: [
        { x0: 15, y0: 15, x1: 23, y1: 19, era: 'nes', name: 'Mundo 1-2 (bajo tierra)' },
        { x0: 27, y0: 2, x1: 34, y1: 12, era: 'nes', name: 'Obra en construcción 25m' },
      ],
      looks: NES_LOOKS,
      bitNext: () => nesNext('nes-patio'),
      bitTips: [
        '* ¡Pasto verde, tubos, bloques ?... y colinas con ojos!\n* Esto es el Reino Champiñón.',
        '* Los monstruos se paran en los pasos angostos.\n* Hay que vencerlos (o hacernos amigos) para pasar.',
        '* Aquí las MAYUSCULAS cuentan. ¡Usa SHIFT!',
        '* Con ESC podemos volver al pueblo cuando quieras.',
        '* Los letreros tienen datos de la NES de verdad. ¡Léelos todos!',
        '* Esa nube y ese arbusto... se me hace que los dibujó la misma persona.',
      ],
      npcs: [
        {
          id: 'luigi', sprite: 'luigi', x: 1, y: 17,
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
      name: 'Obra en construcción 25m',
      rev: 2,
      intro: ['* ¡Vigas rojas, escaleras y un tambo de aceite!\n* Es la OBRA 25m, la primera pantalla de Donkey Kong (1981).'],
      music: 'kongo',
      ground: 'nes_negro',
      map: NES_CASTILLO1_MAP,
      tiles: {
        v: { s: 'nes_negro', solid: true, look: 'noche' },
        V: { s: 'nes_viga', look: 'viga' },
        E: { s: 'nes_escalera' },
        B: { s: 'nes_barril', solid: true, under: 'nes_viga', look: 'barril' },
        P: { s: 'nes_tubo', pipe: true },
        _: { s: 'nes_suelo' },
        o: { s: 'nes_bidon', solid: true, under: 'nes_suelo', look: 'bidon' },
        S: { s: 'sign', solid: true, under: 'nes_suelo' },
      },
      spawns: { start: [9, 13, 'up'] },
      exits: {
        '9,14': { map: 'nes-patio', spawn: [31, 7, 'down'] },
        '9,1': { map: 'nes-bosque', spawn: [30, 20, 'left'] },
      },
      encounters: [
        { enemy: 'kongo', x: 9, y: 2, say: ['* ¡BUM BUM BUM!\n* ¿Quién se atreve a subir MIS vigas?', '* ¡Soy KONGO, primo de DONKEY KONG! Él no usó corbata hasta 1994.\n* Yo ya la traigo. ¡A ver si saltas mis barriles!'] },
      ],
      signs: {
        '2,11': ['* OBRA EN CONSTRUCCIÓN 25m\n* Sube por las vigas y las escaleras.', '* Arriba toca el tambor un gorila con corbata.\n* Y detrás de él, una tubería a HYRULE.'],
      },
      looks: { ...NES_LOOKS, noche: '* Todo negro, como el fondo de las maquinitas de 1981.\n* Solo se ven las vigas.' },
      bitNext: () => nesNext('nes-castillo1'),
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
            '* La tubería de aquí arriba lleva a HYRULE, el reino de Zelda.\n* Del otro lado del Bosque Perdido está la mazmorra.',
            '* Practico mi frase todas las mañanas frente al espejo.\n* "Tu consola está en otro..." ¡Perfecta!',
          ]),
        },
      ],
    },

    'nes-bosque': {
      name: 'Hyrule',
      rev: 2,
      intro: ['* ¡Arena, rocas cafés y árboles redondos! Esto es HYRULE,\n* el reino de The Legend of Zelda (1986).', '* Allá al norte está el BOSQUE PERDIDO.\n* Y esa cueva negra... siempre hay alguien adentro.'],
      music: 'patos',
      ground: 'nes_arena',
      map: NES_BOSQUE_MAP,
      tiles: {
        '.': { s: 'nes_arena' },
        ':': { s: 'nes_tierra' },
        g: { s: 'nes_pasto' },
        ',': { s: 'nes_pastoalto', tall: true },
        T: { s: 'nes_arbolz', solid: true, look: 'arbolz' },
        t: { s: 'nes_arbol', solid: true, under: 'nes_pasto', look: 'arbol' },
        Y: { s: 'nes_arbolp', solid: true, look: 'arbolp' },
        R: { s: 'nes_roca', solid: true, look: 'roca' },
        K: { s: 'nes_cueva' },
        n: { s: 'nes_negro' },
        M: { s: 'nes_muro2', solid: true, look: 'castillo' },
        O: { s: 'nes_puerta2' },
        P: { s: 'nes_tubo', pipe: true },
        Z: { s: 'sign', solid: true, under: 'nes_pasto' },
        '~': { s: 'nes_agua', solid: true, under: 'nes_pasto', look: 'agua' },
      },
      spawns: { start: [30, 20, 'left'] },
      exits: {
        '31,20': { map: 'nes-castillo1', spawn: [9, 2, 'down'] },
        '5,2': { map: 'nes-castillo2', spawn: [9, 13, 'up'] },
        '27,13': { map: 'nes-bosque', spawn: [30, 6, 'up'] },
        '30,7': { map: 'nes-bosque', spawn: [27, 14, 'down'] },
        // Bosque Perdido: las salidas equivocadas de cada claro.
        '12,3': NES_PERDIDO,
        '15,1': NES_PERDIDO,
        '22,1': NES_PERDIDO,
        '26,3': NES_PERDIDO,
        '26,8': NES_PERDIDO,
        '19,8': NES_PERDIDO,
        '15,11': NES_PERDIDO,
      },
      encounters: [
        { enemy: 'bombita', x: 22, y: 13, say: ['* ¡No hay tiempo! ¡NO HAY TIEMPO!\n* ¡Quítate de mi camino! ...Espera, tú estás en MI camino.'] },
        { enemy: 'patoloco', x: 11, y: 9, say: ['* ¡Cuac cuac! ¡Ja ja ja! ¡Saliste del bosque!\n* ¡A que no me atrapas!'] },
        { enemy: 'patos', x: 5, y: 7, say: ['* ¡Es TOBY! Mueve la cola frente a la puerta del NIVEL 1.', '* "¡Guau! La pradera está llena de PATOS DE LETRAS.\n* ¡Atrapemos unos cuantos con tu red de letras!"'] },
      ],
      chests: [
        { id: 'nes_estrella', x: 1, y: 20, treasure: 'super_estrella', word: 'Estrella' },
      ],
      signs: {
        '29,19': ['* HYRULE\n* (La tubería regresa a la Obra 25m.)', '* Entre la NES y la Famicom se vendieron casi 62 millones de consolas.'],
        '21,14': ['* BOSQUE PERDIDO\n* Si te pierdes: norte, oeste, sur, oeste.', '* Así se cruzaba el Bosque Perdido en The Legend of Zelda (1986).\n* Cualquier otro camino te regresa al principio.'],
        '10,8': ['* PRADERA DE DUCK HUNT', '* Duck Hunt (1984) se jugaba con la Zapper, una pistola de luz.\n* Solo funcionaba en las teles de tubo.'],
        '7,3': ['* NIVEL 1: LA MAZMORRA\n* Adentro, la MAZMORRA DE LLAVES.', '* Lleva frases con mayúscula y punto final.'],
      },
      regions: [
        { x0: 13, y0: 2, x1: 25, y1: 10, era: 'nes', name: 'Bosque Perdido' },
        { x0: 1, y0: 8, x1: 10, y1: 21, era: 'nes', name: 'Pradera de Duck Hunt' },
        { x0: 1, y0: 1, x1: 10, y1: 6, era: 'nes', name: 'Entrada al Nivel 1' },
      ],
      looks: NES_LOOKS,
      wild: ['bombita', 'patoloco'],
      bitNext: () => nesNext('nes-bosque'),
      bitTips: [
        '* ¡Esto ya no es el Reino Champiñón! Es HYRULE.\n* Arena, rocas, cuevas... y pasto alto en la pradera.',
        '* En el pasto alto vuelven a salir los que ya vencimos.\n* ¡Buena práctica para los dedos!',
        '* ¿Oíste eso? Algo hizo "cuac".',
        '* Bosque Perdido: norte, oeste, sur, oeste.\n* Me lo apunté en la mano.',
      ],
    },

    'nes-castillo2': {
      name: 'Mazmorra del Nivel 1',
      rev: 2,
      music: 'mazmorra',
      ground: 'nes_piso2',
      map: NES_CASTILLO2_MAP,
      tiles: {
        ...NES_CASTLE_TILES,
        _: { s: 'nes_piso2' },
        C: { s: 'nes_muro2', solid: true, look: 'castillo' },
        O: { s: 'nes_puerta2' },
        X: { s: 'nes_estatua', solid: true, look: 'estatua' },
        Z: { s: 'nes_escalon' },
        S: { s: 'sign', solid: true, under: 'nes_piso2' },
      },
      spawns: { start: [9, 13, 'up'] },
      exits: {
        '9,14': { map: 'nes-bosque', spawn: [5, 3, 'down'] },
        '9,1': { map: 'nes-plaza', spawn: [3, 15, 'right'] },
      },
      encounters: [
        { enemy: 'mazmorra', x: 9, y: 6, say: ['* (Una llave enorme flota frente a la reja.)', '* (Detrás está la MAZMORRA DE LLAVES.\n* Abajo, algo ronca y huele a pólvora.)'] },
      ],
      chests: [
        { id: 'nes_control', x: 17, y: 12, treasure: 'control_nes', word: 'Control' },
      ],
      signs: {
        '2,11': ['* NIVEL 1 DE HYRULE', '* The Legend of Zelda salió en Japón en 1986, en un disquete\n* para el Famicom Disk System.'],
        '8,2': ['* ESCALERA\n* Sale a la CIUDAD DEL BOX.'],
      },
      looks: NES_LOOKS,
      bitNext: () => nesNext('nes-castillo2'),
      bitTips: [
        '* Estatuas, piedra azul, eco... ¡esto es una mazmorra!',
        '* Esa llave flotando no me da confianza. Pero ni modo.',
        '* Si la mazmorra se pone difícil, la Espada del Anciano ayuda.',
      ],
      npcs: [
        {
          id: 'paje2', sprite: 'paje', x: 12, y: 3, when: () => !!Save.data.done.mazmorra,
          talk: nesPaje('paje2', [
            '* Sí. Ya sé. Otra vez un paje.\n* El de la Obra 25m es mi primo. Somos idénticos: hongo de tres colores.',
            '* Pasando la ciudad está el Castillo de Bowser.\n* Ese sí es el bueno. Te lo juro por mi sombrero.',
            '* ¿Que si me canso de decir lo mismo?\n* Un poquito. Pero tengo prestaciones.',
          ]),
        },
      ],
    },

    'nes-plaza': {
      name: 'Ciudad del Box',
      rev: 2,
      intro: ['* ¡Una ciudad de noche y un ring en medio de la plaza!\n* Esto es de Punch-Out!! (1987).'],
      music: 'punin',
      ground: 'nes_acera',
      map: NES_PLAZA_MAP,
      tiles: {
        _: { s: 'nes_acera' },
        '-': { s: 'nes_calle' },
        E: { s: 'nes_edificio', solid: true, look: 'edificio' },
        e: { s: 'nes_azotea', solid: true, look: 'edificio' },
        L: { s: 'nes_farol', solid: true, look: 'farol' },
        g: { s: 'nes_pasto' },
        t: { s: 'nes_arbol', solid: true, under: 'nes_pasto', look: 'arbol' },
        r: { s: 'nes_cuerda', solid: true, under: 'nes_lona', look: 'cuerda' },
        o: { s: 'nes_lona' },
        M: { s: 'nes_metro' },
        P: { s: 'nes_tubo', pipe: true },
      },
      spawns: { start: [3, 15, 'right'] },
      exits: {
        '2,15': { map: 'nes-castillo2', spawn: [9, 2, 'down'] },
        '12,2': { map: 'nes-castillo3', spawn: [2, 13, 'up'] },
      },
      encounters: [
        { enemy: 'punin', x: 12, y: 6, say: ['* ¡DING DING!\n* ¡Nadie sale de MI ring sin aguantar un round!'] },
      ],
      signs: {
        '4,14': ['* CIUDAD DEL BOX\n* Hoy pelea: el CAMPEÓN PUÑÍN. Entrada libre.', '* En Punch-Out!! (1987) el árbitro del ring era nada menos que Mario.'],
        '10,2': '* TUBERÍA AL CASTILLO DE BOWSER\n* Aquí vive LORD CAPARAZON.\n* (Se ruega no hacer enojar al rey.)',
      },
      looks: NES_LOOKS,
      bitNext: () => nesNext('nes-plaza'),
      bitTips: [
        '* ¡Un ring de box en medio de la plaza! Muy normal todo.',
        '* La tubería al Castillo de Bowser está del otro lado del ring...',
        '* Cuando Puñín parpadee una palabra, ¡escríbela rapidísimo!',
      ],
      npcs: [
        {
          id: 'arbitro', sprite: 'arbitro', x: 8, y: 8,
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
      name: 'Castillo de Bowser',
      rev: 2,
      intro: ['* Lava, un puente y un hacha... Es el CASTILLO DE BOWSER,\n* como el último de Super Mario Bros.'],
      music: 'nes_castillo',
      ground: 'nes_piso',
      map: NES_CASTILLO3_MAP,
      tiles: {
        ...NES_INSIDE_TILES,
        L: { s: 'nes_lava', solid: true, look: 'lava' },
        '=': { s: 'nes_puente', under: 'nes_lava' },
        H: { s: 'nes_hacha', solid: true, look: 'hacha' },
        X: { s: 'nes_estatua3', solid: true, look: 'koopa' },
        P: { s: 'nes_tubo', pipe: true },
        q: { s: 'nes_tubo', pipe: true },
        S: { s: 'sign', solid: true, under: 'nes_piso' },
      },
      spawns: { start: [2, 13, 'up'] },
      exits: {
        '2,14': { map: 'nes-plaza', spawn: [12, 3, 'down'] },
        '21,7': { pueblo: 'nes' },
      },
      encounters: [
        { enemy: 'caparazon', x: 11, y: 7, say: ['* ¡BIENVENIDO A MI PUENTE! ¡BIENVENIDO A MI PUEN—\n* ¡BIEN- BIENVENIDO!'] },
      ],
      signs: {
        '4,12': ['* CASTILLO DE BOWSER', '* Super Mario Bros. tiene 8 mundos de 4 niveles.\n* ¡32 niveles en un solo cartucho!'],
        '20,4': '* ¡Felicidades!\n* Esta vez la consola SI estaba en este castillo.\n* (Firma: los pajes.)',
      },
      looks: NES_LOOKS,
      bitNext: () => nesNext('nes-castillo3'),
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
