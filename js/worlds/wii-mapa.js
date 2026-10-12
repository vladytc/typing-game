// MUNDO 6 — Ciudad Sensor explorable, en 3D (docs/LORE.md §9). Se carga al final de las escenas
// del Mundo 6 (después de js/scenes/town3d.js y de js/scenes/wii-kit.js), igual que n64-mapa.js.
// Las casillas se juegan como siempre (flechas, casilla por casilla); `render: '3d'` las dibuja
// con polígonos. Sin three.js se ven en 2D con la paleta de la Wii.
//
// Estética: blanco y azul cielo del menú de la consola. Cada zona es un "canal" de la pantalla
// gigante de la plaza: se prende cuando ganas ahí. El último tramo es el espacio (planetitas y
// puentes de estrellas), guiño al juego de 2007 del plomero entre planetas.
//
//   PLAZA CANAL (28×20)                         DISTRITO DEPORTES (30×22)
//   BBBBB[ PANTALLA GIGANTE: canales ]BBBBB     KKKKKKKKKKKKKK[Mi]KKKKKKKKKKKKKKK  -> estadio
//   BT"""::::::::::::::::::::::::"TBB            K iiiiiii mmmm:mmmm gwwwwnwwwg K  gimnasio:
//   B"C.: S (fuente ~~) S :.C"BB  (cofre)        K LLLLLLL mZmm:mmmm gwgggnggwg K  boliche, balanza,
//   TTTT[Zumbito]TTTTTTTTTT[Muñequito]TTTTT      K ......... ::::::::: gggg:ggggg K  tenis (cofre)
//   T A: tubería P   BBBB  C: parque ,,,,, :      KKKKKKKKKKKKKKKKKKKKKKK[Sensorín]KKK
//   T                BBBB  ::::::[Canal Clima]->  ->[Correíta]  calle  [Nunchuquín] tele ,,,,
//
//   ESTADIO SENSOR (26×22)                       CANAL GALAXIA (30×24, en el espacio)
//   B "  S  (Estrella lanzadora U) -> galaxia    vvvvvvvvvv ooo[CANAL VACIO]ooo vvvvvvvvvv
//   EEEEEEEEEEEEE:EEEEEEEEEEEE                   vvvvvvvvvvvvvv + (puente de estrellas)
//   E GGGG (gradas) : GGGG E   cancha            vvvvvvvvvvvvvv [Capitán Cometa]
//   EG fffff w fffff GE                          P4 ooo+++ OOO observatorio ^^^ Y ++ooo P5
//   EEEEEEEEEEEEE[Dani]EEEEEEEEEEEE              vvvvvvvvvvvvvv +
//   B (locutor) : S (cofre)  <- deportes         vvvvvvvvvvv oooUoooo (estrella de regreso)
//
// Orden: Zumbito → Muñequito → Canal Clima → Correíta → Nunchuquín → Sensorín → Entrenador Mi →
//        Dani → Capitán Cometa. (El mismo de `nodes` en wii.js; cada uno en un paso angosto.)
// El final (Canal Vacío) NO está aquí: solo su marco apagado en la última planetita.

const WII_FACTS = CONSOLES.find((c) => c.id === 'wii').facts;

// ---------- Tesoros nuevos (cofres) ----------
Object.assign(TREASURES, {
  wii_clasico: { room: 'wii', name: 'Control Clásico', desc: 'Se conectaba abajo del control de la Wii. Con él jugabas los juegos viejitos de la Consola Virtual... ¡como en los 90!' },
  wii_motionplus: { room: 'wii', name: 'Wii MotionPlus', desc: 'Un cubito que se pegaba abajo del control (2009). Sentía el giro de tu muñeca con muchísima más precisión.' },
  wii_volante: { room: 'wii', name: 'Volante blanco', desc: 'Un volante de plástico donde se metía el control. Venía con Mario Kart Wii (2008). ¡Rrrrum!' },
});

// ---------- Sprites: casillas (letras a/b/c/d con los colores de cada casilla) ----------
const wiiRows = (fn) => Array.from({ length: 16 }, (_, y) => Array.from({ length: 16 }, (_, x) => fn(x, y)).join(''));
const WII_STAR_ROWS = [
  '.......cc.......',
  '.......cc.......',
  '......cbbc......',
  '......cbbc......',
  '.....cbbbbc.....',
  'cccccbbabbbccccc',
  'cbbbbbaabbbbbbbc',
  '.cbbbbbabbbbbbc.',
  '..cbbbbbbbbbbc..',
  '...cbbbbbbbbc...',
  '...cbbbbbbbbc...',
  '..cbbbbccbbbbc..',
  '..cbbbcc..cbbbc.',
  '.cbbcc.....ccbc.',
  '.ccc........ccc.',
  '................',
];
const wiiSpace = (x, y) => (((x * 13 + y * 7) % 23 === 0) ? 'b' : ((x * 5 + y * 11) % 37 === 0 ? 'c' : 'a'));

Object.assign(SPRITES, {
  wii_piso: wiiRows((x, y) => (x === 0 || y === 0 ? 'b' : 'a')),
  wii_camino: wiiRows((x, y) => (x % 4 === 1 && y % 4 === 1 ? 'a' : 'b')),
  wii_liso: wiiRows((x, y) => ((x * 7 + y * 3) % 11 === 0 ? 'b' : 'a')),
  wii_madera: wiiRows((x, y) => (y % 4 === 0 || (x + (y >> 2) * 5) % 8 === 0 ? 'b' : 'a')),
  wii_carril: wiiRows((x) => (x === 0 || x === 15 ? 'c' : x % 5 === 2 ? 'b' : 'a')),
  wii_arbol: wiiRows((x, y) => {
    if (y >= 11) return x === 7 || x === 8 ? 'd' : '.';
    const r = Math.hypot(x - 7.5, y - 5.5);
    if (r > 6) return '.';
    if (r > 5) return 'c';
    return x < 7 && y < 5 ? 'a' : 'b';
  }),
  wii_edificio: wiiRows((x, y) => {
    if (x === 0 || x === 15 || y === 0) return 'd';
    if (y === 1 && x === 12) return 'b';
    return y % 4 === 2 && x % 4 !== 0 && x % 4 !== 3 ? 'c' : 'a';
  }),
  wii_canal: wiiRows((x, y) => {
    const corner = (x < 2 || x > 13) && (y < 3 || y > 12);
    if (corner || y < 2 || y > 13) return '.';
    if (x === 0 || x === 15 || y === 2 || y === 13) return 'd';
    if (x > 2 && x < 13 && y > 4 && y < 11) return y === 7 && x > 4 && x < 11 ? 'c' : 'b';
    return 'a';
  }),
  wii_pantalla: wiiRows((x, y) => {
    if (y === 0 || y === 15 || x % 8 === 0) return 'd';
    if (y > 2 && y < 13) return ((x >> 3) + (y > 7 ? 1 : 0)) % 2 ? 'b' : 'c';
    return 'a';
  }),
  wii_valla: wiiRows((x, y) => (y === 5 || y === 10 ? 'b' : (x === 2 || x === 13) && y > 3 && y < 14 ? 'c' : '.')),
  wii_pinos: wiiRows((x, y) => {
    const pin = (x % 4 === 3 || x % 4 === 0) && x > 2 && x < 13 && y >= 4 && y <= 13;
    if (!pin) return x === 0 || x === 15 ? 'd' : 'b';
    return y === 6 || y === 7 ? 'c' : 'a';
  }),
  wii_red: wiiRows((x, y) => (x === 7 || x === 8 ? (y < 3 ? 'a' : y % 2 ? 'c' : 'd') : 'b')),
  wii_balanza: wiiRows((x, y) => {
    if (x < 2 || x > 13 || y < 6 || y > 10) return 'b';
    return x === 2 || x === 13 || y === 6 || y === 10 ? 'c' : 'a';
  }),
  wii_tele: wiiRows((x, y) => {
    if (y === 2 || y === 3) return x > 3 && x < 12 ? (y === 2 && (x === 5 || x === 10) ? 'b' : 'd') : '.';
    if (y >= 4 && y <= 12) return x === 0 || x === 15 || y === 4 || y === 12 ? 'd' : (x < 5 && y < 7 ? 'a' : 'b');
    return x > 5 && x < 10 ? 'c' : '.';
  }),
  wii_gradas: wiiRows((x, y) => (y % 5 === 1 && x % 3 === 1 ? 'c' : y % 5 === 0 ? 'd' : (y % 10 < 5 ? 'a' : 'b'))),
  wii_lanza: WII_STAR_ROWS,
  wii_vacio: wiiRows(wiiSpace),
  wii_puente_estrella: WII_STAR_ROWS.map((row, y) => [...row].map((ch, x) => (ch === '.' ? wiiSpace(x, y) : ch === 'a' ? 'd' : ch)).join('')),
  wii_planeta: wiiRows((x, y) => ((x * 3 + y * 5) % 13 === 0 || (x * 7 + y) % 17 === 0 ? 'b' : 'a')),
  wii_domo: wiiRows((x, y) => {
    if (y >= 10) return x > 0 && x < 15 ? (y === 10 ? 'd' : 'c') : '.';
    const r = Math.hypot(x - 7.5, y - 10);
    if (r > 7.2) return '.';
    return x === 7 || x === 8 ? 'd' : 'a';
  }),
  wii_telescopio: wiiRows((x, y) => {
    if (y > 9) return x === 4 || x === 7 || x === 10 ? 'd' : '.';
    return Math.abs((15 - x) - y * 1.3) < 1.6 && x > 2 ? (x > 12 ? 'a' : 'c') : '.';
  }),
  wii_portal: wiiRows((x, y) => {
    if (x < 1 || x > 14 || y < 1 || y > 14) return '.';
    if (x < 3 || x > 12 || y < 3 || y > 12) return 'a';
    return (x * 7 + y * 13) % 5 === 0 ? 'b' : (x + y * 3) % 7 === 0 ? 'c' : 'd';
  }),
});

// Tesoros y personajes, a todo color (paleta de la Wii, js/scenes/wii-kit.js).
Object.assign(SPRITES, {
  wii_volante: wiiArt([
    '................',
    '.....KKKKKK.....',
    '...KKWWWWWWKK...',
    '..KWWKKKKKKWWK..',
    '.KWWK......KWWK.',
    '.KWK..KKKK..KWK.',
    'KWWK.KSSSSK.KWWK',
    'KWK..KSWWSK..KWK',
    'KWK..KSSSSK..KWK',
    'KWWKKKKKKKKKKWWK',
    '.KWWWWWWWWWWWWK.',
    '.KWWKLLLLLLKWWK.',
    '..KWWK....KWWK..',
    '...KKWWWWWWKK...',
    '.....KKKKKK.....',
    '................',
  ]),
  wii_motionplus: wiiArt([
    '................',
    '................',
    '....KKKKKKKK....',
    '...KWWWWWWWWK...',
    '...KWLLLLLLWK...',
    '...KWLKKKKLWK...',
    '...KWLKSSKLWK...',
    '...KWLKKKKLWK...',
    '...KWLLLLLLWK...',
    '...KWWWWWWWWK...',
    '...KWWBBBBWWK...',
    '...KWWWWWWWWK...',
    '....KKKKKKKK....',
    '.....KGGGGK.....',
    '................',
    '................',
  ]),
  wii_clasico: wiiArt([
    '................',
    '................',
    '................',
    '..KKKK....KKKK..',
    '.KWWWWKKKKWWWWK.',
    'KWWKWWWWWWWWRWWK',
    'KWKKKWWWWWWBWYWK',
    'KWWKWWLWWLWWVWWK',
    'KWWWWKKWWKKWWWWK',
    'KWWWKGGKKGGKWWWK',
    '.KWWKGGKKGGKWWK.',
    '..KKK.KKKK.KKK..',
    '................',
    '................',
    '................',
    '................',
  ]),
  wii_noticias: wiiRecolor(SPRITES.munequito, { N: 'O', S: 'P' }),
  wii_abuela: wiiRecolor(SPRITES.munequito, { N: 'L', S: 'M' }),
  wii_locutor: wiiRecolor(SPRITES.munequito, { N: 'K', S: 'R' }),
  wii_estrellin: wiiArt(SPRITES.estrellita_capitan.slice()),
});

// ---------- Música ORIGINAL de las zonas (las voces de cada pista suman los mismos pasos) ----------
// Distrito Deportes: Fa mayor, saltarina, como ir al gimnasio con tenis nuevos. 64 pasos.
TRACKS.wii_deportes = {
  bpm: 132,
  voices: [
    {
      wave: 'square', vol: 0.024,
      notes: 'C5/2 F5/2 A5/2 C6/2 A5/2 F5/2 G5/4 A5/2 G5/2 F5/2 E5/2 F5/4 -/4 ' +
        'D5/2 F5/2 A#5/2 D6/2 C6/2 A#5/2 A5/4 G5/2 A5/2 A#5/2 G5/2 F5/8',
    },
    { wave: 'triangle', vol: 0.09, notes: `${rep('F2/2 C3/2', 4)} ${rep('C2/2 G2/2', 4)} ${rep('A#1/2 F2/2', 4)} ${rep('C2/2 G2/2', 4)}` },
    { wave: 'sine', vol: 0.02, legato: 1, notes: 'F4/16 E4/16 D4/16 C4/16' },
    { wave: 'noise', vol: 0.016, notes: rep('x/2 -/2 x/2 x x', 8) },
  ],
};
// Canal Galaxia: Sol menor a Re mayor, vals lento (3/4) entre planetitas. 96 pasos (8 compases de 12).
TRACKS.wii_galaxia = {
  bpm: 92,
  voices: [
    {
      wave: 'sine', vol: 0.04, legato: 0.95,
      notes: 'G5/6 A#5/3 D6/3 C6/9 A#5/3 A5/6 F5/3 G5/3 A5/12 A#5/6 D6/3 F6/3 D#6/9 D6/3 C6/6 A5/3 F5/3 G5/12',
    },
    {
      wave: 'sine', vol: 0.016, legato: 0.4,
      notes: `${rep('G3/2 D4/2 G4/2 A#4/2 G4/2 D4/2', 2)} ${rep('D#3/2 A#3/2 D#4/2 G4/2 D#4/2 A#3/2', 2)} ` +
        `${rep('C3/2 G3/2 C4/2 D#4/2 C4/2 G3/2', 2)} ${rep('D3/2 A3/2 D4/2 F#4/2 D4/2 A3/2', 2)}`,
    },
    { wave: 'sine', vol: 0.012, legato: 0.3, notes: `${rep('D6/1 -/11', 4)} ${rep('G6/1 -/11', 4)}` },
    { wave: 'triangle', vol: 0.07, notes: 'G2/24 D#2/24 C2/24 D2/24' },
  ],
};

// ---------- Casillas (sprite + colores para el 2D; `w3` = modelo propio de la Ciudad Sensor en 3D) ----------
const wiiT = (s, colors, extra = {}) => ({ s, colors, ...extra });
const WII_INK = '#2B3445';
const WII_TILES = {
  // c3s = color de la orilla en 3D (la pared que sale junto a la fuente): blanco, no tierra.
  '.': { s: 'wii_piso', c3s: '#E6E9EE' },
  ':': wiiT('wii_camino', { a: '#FFFFFF', b: '#D9F0FB', c: '#9FD8F5', d: '#5BC0EB' }, { c3s: '#E6E9EE' }),
  '"': wiiT('grass', { a: '#DDF5E5', b: '#B8EBC9', c: '#43D17A', d: WII_INK }, { c3s: '#E6E9EE' }),
  ',': wiiT('tall', { a: '#DDF5E5', b: '#B8EBC9', c: '#43D17A', d: WII_INK }, { tall: true }),
  '*': wiiT('flower', { a: '#DDF5E5', b: '#F48FB1', c: '#43D17A', d: '#FFD54F' }),
  T: wiiT('wii_arbol', { a: '#DDF7E6', b: '#8BE3AE', c: '#43D17A', d: '#AAB2BD' }, { solid: true, w3: 'arbol', look: 'arbol' }),
  B: wiiT('wii_edificio', { a: '#FAFAFA', b: '#F44336', c: '#9FD8F5', d: '#AAB2BD' }, { solid: true, w3: 'edificio', look: 'edificio' }),
  C: wiiT('wii_canal', { a: '#FAFAFA', b: '#5BC0EB', c: '#FFFFFF', d: '#AAB2BD' }, { solid: true, w3: 'canal', look: 'canal' }),
  X: wiiT('wii_pantalla', { a: '#FAFAFA', b: '#5BC0EB', c: '#43D17A', d: '#AAB2BD' }, { solid: true, w3: 'pantalla', look: 'pantalla' }),
  '~': wiiT('water', { a: '#FAFAFA', b: '#D9F0FB', c: '#5BC0EB', d: '#1E88E5' }, { solid: true, look: 'agua' }),
  S: wiiT('sign', { a: '#FAFAFA', b: '#FAFAFA', c: '#1E88E5', d: WII_INK }, { solid: true, w3: 'letrero' }),
  P: wiiT('pipe', { a: '#FAFAFA', b: '#E6E9EE', c: '#5BC0EB', d: WII_INK }, { w3: 'tubo' }),
  '=': wiiT('wii_valla', { a: '#FAFAFA', b: '#FAFAFA', c: '#AAB2BD', d: WII_INK }, { solid: true, w3: 'valla', look: 'valla' }),
  // Gimnasio Sensor
  K: wiiT('wall', { a: '#FAFAFA', b: '#FAFAFA', c: '#5BC0EB', d: '#1E88E5' }, { solid: true, d3: 'wall', c3: '#FAFAFA', c3b: '#5BC0EB', bh: 3, look: 'muroGym' }),
  m: wiiT('wii_madera', { a: '#F6E2B8', b: '#E6C88E', c: '#C9A66B', d: WII_INK }),
  L: wiiT('wii_carril', { a: '#F3D9A4', b: '#E2BE7A', c: '#AAB2BD', d: WII_INK }),
  i: wiiT('wii_pinos', { a: '#FAFAFA', b: '#F3D9A4', c: '#F44336', d: '#AAB2BD' }, { solid: true, w3: 'pinos', look: 'pinos' }),
  g: wiiT('wii_liso', { a: '#6FCF97', b: '#62C28A', c: '#43D17A', d: WII_INK }),
  w: wiiT('wii_liso', { a: '#FAFAFA', b: '#F0F2F5', c: '#E6E9EE', d: WII_INK }),
  n: wiiT('wii_red', { a: '#FAFAFA', b: '#6FCF97', c: '#E6E9EE', d: WII_INK }, { solid: true, w3: 'red', look: 'red' }),
  Z: wiiT('wii_balanza', { a: '#FAFAFA', b: '#F6E2B8', c: '#AAB2BD', d: WII_INK }, { solid: true, w3: 'balanza', look: 'balanza' }),
  V: wiiT('wii_tele', { a: '#CFEFFF', b: '#5BC0EB', c: '#AAB2BD', d: WII_INK }, { solid: true, w3: 'tele', look: 'tele' }),
  // Estadio Sensor
  E: wiiT('wall', { a: '#FAFAFA', b: '#FAFAFA', c: '#5BC0EB', d: '#1E88E5' }, { solid: true, d3: 'wall', c3: '#FAFAFA', c3b: '#1E88E5', bh: 3.4, look: 'muroEstadio' }),
  G: wiiT('wii_gradas', { a: '#FAFAFA', b: '#D9F0FB', c: '#F6D2B0', d: '#1E88E5' }, { solid: true, w3: 'gradas', look: 'gradas' }),
  f: wiiT('wii_liso', { a: '#7FDC9A', b: '#6CCB88', c: '#43D17A', d: WII_INK }),
  U: wiiT('wii_lanza', { a: '#FFF3B0', b: '#FFD54F', c: '#FF8A3D', d: WII_INK }, { w3: 'lanza' }),
  // Canal Galaxia (el espacio)
  v: wiiT('wii_vacio', { a: '#0B1638', b: '#FFD54F', c: '#9FD8F5', d: '#FAFAFA' }, { solid: true, d3: 'void', look: 'vacio' }),
  '+': wiiT('wii_puente_estrella', { a: '#0B1638', b: '#FFD54F', c: '#FF8A3D', d: '#FFF3B0' }, { d3: 'bridge', over: 'void', w3: 'estrella' }),
  o: wiiT('wii_planeta', { a: '#6FCF97', b: '#8BE3AE', c: '#43D17A', d: WII_INK }, { c3s: '#3FA36B' }),
  '^': wiiT('wii_piso', { a: '#F4F6F9', b: '#D5DBE3', c: '#AAB2BD', d: WII_INK }, { h: 0.8, c3s: '#C9D1DB' }),
  O: wiiT('wii_domo', { a: '#FAFAFA', b: '#E6E9EE', c: '#AAB2BD', d: '#0D47A1' }, { solid: true, w3: 'domo', look: 'domo' }),
  Y: wiiT('wii_telescopio', { a: '#FAFAFA', b: '#E6E9EE', c: '#1E88E5', d: '#AAB2BD' }, { solid: true, w3: 'telescopio', look: 'telescopio', under: 'wii_piso' }),
  Q: wiiT('wii_portal', { a: '#FAFAFA', b: '#FF00FF', c: '#444444', d: '#111111' }, { solid: true, w3: 'canalVacio', look: 'canalVacio' }),
};

// Canales de la pantalla gigante: se prenden cuando ganas en cada zona.
function wiiCanales() {
  const d = Save.data.done;
  const f = Save.data.flags;
  return [
    { name: 'NOTICIAS', on: !!d.zumbito, bg: '#1E88E5' },
    { name: 'CARAS', on: !!d.munequito, bg: '#F48FB1' },
    { name: 'CLIMA', on: !!d.canalclima, bg: '#5BC0EB' },
    { name: 'TIENDA', on: false, off: 'CERRADO' },
    { name: 'DEPORTES', on: !!d.entrenadormi, bg: '#43D17A' },
    { name: 'TORNEO', on: !!d.daniwii, bg: '#FF8A3D' },
    { name: 'GALAXIA', on: !!d.cometa, bg: '#0D47A1', fg: '#FFD54F' },
    { name: 'CANAL VACIO', on: !!f.finalAbierto, bg: '#111111', fg: '#FF00FF', off: '' },
  ];
}

// Lo que se ve al revisar casillas. `on` = ¿esta zona ya está encendida?
function wiiLooks(on) {
  return {
    arbol: '* Un árbol redondito, como una bola de helado de menta.\n* No tiene ni una hoja fuera de lugar.',
    edificio: () => (on()
      ? '* Un edificio blanquísimo. La lucecita de la azotea ya está VERDE.\n* ¡Despierto y encendido!'
      : ['* Un edificio blanquísimo. En la azotea parpadea una lucecita ROJA.', '* BIT: Es la luz de standby. El Glitch dejó la ciudad "medio dormida".']),
    canal: '* Un canal flotante, como los cuadritos del menú de la consola.\n* Si lo miras de cerca, el dibujo se mueve un poquito.',
    pantalla: () => {
      const list = wiiCanales().filter((c) => c.name !== 'CANAL VACIO' || c.on);
      const lit = list.filter((c) => c.on);
      return [
        `* La PANTALLA GIGANTE de la ciudad. Canales encendidos: ${lit.length} de ${list.length}.`,
        `* ${list.map((c) => `${c.name}: ${c.on ? 'SI' : c.off || 'apagado'}`).join(' · ')}`,
      ];
    },
    agua: '* Una fuente de agua clarita. En el fondo brillan unas monedas...\n* ...no: son botones A. Alguien pidió un deseo.',
    valla: '* Una barda blanca, limpísima. Nadie se ha atrevido a recargarse.',
    muroGym: '* La pared del Gimnasio Sensor. Blanca, con una franja azul.\n* Huele a pelota nueva.',
    pinos: '* Diez pinos blancos con una franja roja.\n* Se ven nerviosos. Con razón.',
    red: '* La red de la cancha de tenis.\n* Aquí se pega con la mano izquierda... o con la derecha. Nunca con las dos.',
    balanza: '* Una balanza blanca, plana como tabla.\n* Un letrerito dice: "Párate derechito, respira y haz yoga. 2007."',
    tele: () => (Save.data.done.sensorin
      ? '* Una tele enorme con la BARRA SENSORA encima.\n* Sus dos lucecitas brillan tranquilas. Ninguna lámpara la confunde.'
      : ['* Una tele enorme con la BARRA SENSORA encima.', '* BIT: Psst... la barra no "ve" nada: solo tiene luces.\n* El que ve es el control.']),
    muroEstadio: '* El muro del Estadio Sensor. Desde adentro se oye:\n* "¡DA-NI! ¡DA-NI!"',
    gradas: '* Gradas llenas de muñequitos con cara de puntitos.\n* Todos agitan los brazos al mismo tiempo. Muy coordinados.',
    vacio: '* Abajo no hay piso. Solo estrellas... y más estrellas.\n* Mejor no te asomes tanto.',
    domo: '* El OBSERVATORIO del Capitán Cometa: una cúpula blanca con una rendija.\n* Desde aquí vigila la Ciudad Sensor... y sus canales.',
    telescopio: () => (Save.data.done.cometa
      ? '* Miras por el telescopio: allá abajo toda la Ciudad Sensor brilla.\n* Los canales están ENCENDIDOS. Bueno... casi todos.'
      : '* Miras por el telescopio: la ciudad allá abajo...\n* Casi todos los edificios tienen su lucecita roja de standby.'),
    canalVacio: () => (Save.data.flags.finalAbierto
      ? [
        '* EL CANAL VACIO.\n* Un marco blanco y, adentro, solo estática morada y gris. "Bzzzzt."',
        '* Se siente frío. Como un cuarto donde nadie ha entrado en años.',
        '* BIT: ...Todavía no. Antes vamos al pueblo.\n* Los amigos que hiciste van a querer verte. (ESC: Volver al pueblo.)',
      ]
      : '* Un marco blanco con la pantalla apagada.\n* No tiene nombre. No tiene canal. Solo está... ahí.'),
  };
}

// Muñequitos del mundo (personajes de las zonas). `wiiModel` = su modelo 3D (los dibuja wiiBody).
const wiiMiiModel = (opts) => (v) => WiiPoly.models.mii(v, opts);

// ---------- Mapas ----------
addMaps('wii', {
  entry: { map: 'wii-plaza', spawn: [4, 16, 'up'] },
  maps: {
    'wii-plaza': {
      name: 'Plaza Canal',
      render: '3d',
      view3d: { edge: 'grass', sky: '#DDF1FC', fogColor: '#EEF7FD', fog: [34, 120], cam: [11.5, 9.5] },
      wii3d: { sky: 'menu', on: () => !!Save.data.done.canalclima },
      async intro(ctx) {
        // La bienvenida de la ciudad (la misma de wii.js), solo una vez; así no se repite en la batalla.
        if (!Save.data.flags.wiiIntro && typeof wiiIntroPages === 'function') {
          Save.data.flags.wiiIntro = true;
          Save.write();
          if (QUESTS.wii_canales) Quests.start('wii_canales');
          await ctx.say(wiiIntroPages());
        }
        await ctx.say([
          '* ¡Y todo es 3D otra vez! Pero ya no se ve borroso como en la Isla Polígono...\n* Es limpio. Blanco. Brillante. Como recién sacado de la caja.',
          '* Cada zona de la ciudad es como un CANAL del menú.\n* Cuando ganemos en una, se prende en la pantalla gigante. ¡Vamos!',
        ], 'BIT');
      },
      music: 'wii_map',
      ground: 'wii_piso',
      map: [
        'BBBBBBBBBBBBBBBBBBBBBBBBBBBB',
        'BBBBBXXXXXXXXXXXXXXXXXXBBBBB',
        'BBBBBXXXXXXXXXXXXXXXXXXBBBBB',
        'BT"""::::::::::::::::::""TBB',
        'B"C.:....S.......S....:.C"BB',
        'B"..:........~~.......:.."BB',
        'BC..:::::::::~~::::::::..CBB',
        'B*..:........~~.......:..*BB',
        'B"C.:.................:.C"BB',
        'BT"":"""""TT"""TT""""":""TBB',
        'TTTT:TTTTTTTTTTTTTTTTT:TTTTT',
        'TTTT:TTTTTTTBBBTTTTTTT:TTTTT',
        'T""":"""*TBBBB,,,,,,,,:,,,TT',
        'T"S.:"""""BBBB,,,,"""":"""TT',
        'T"..:..*""BBBB,,"""*"":""STT',
        'T"..:....TBBBB""""""""::::::',
        'T*..:...""BBBB"*""""""""""TT',
        'T"..P..*""BBBB""""""""""*"TT',
        'TTT"""""TTBBBBTT"""""""""TTT',
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      ],
      tiles: WII_TILES,
      spawns: { start: [4, 16, 'up'] },
      exits: {
        '4,17': { pueblo: 'wii' },
        '27,15': { map: 'wii-deportes', spawn: [1, 15, 'right'] },
      },
      encounters: [
        { enemy: 'zumbito', x: 4, y: 11, say: ['* ¡Bzz! ¡Bzz! Este pasillo tiene RITMO.\n* Pasa al compás... ¡o no pasas! Bzz.'] },
        { enemy: 'munequito', x: 22, y: 10, say: ['* ¡Hola! ¡Hola! (Te saluda. Tú saludas. Te saluda otra vez.)', '* ¿Quieres ir al parque? ¡Primero repite lo que yo digo!\n* ...¡Primero repite lo que yo digo!'] },
        { enemy: 'canalclima', x: 26, y: 15, say: ['* ¡Interrumpimos la caminata para dar el PRONOSTICO!', '* Hacia el Distrito Deportes: 100% de probabilidad de... ¡pelea!\n* Y un 20% de llovizna. Trae paraguas.'] },
      ],
      chests: [
        { id: 'wii_clasico', x: 24, y: 7, treasure: 'wii_clasico', word: 'virtual' },
      ],
      wild: ['zumbito', 'munequito', 'canalclima'],
      signs: {
        '2,13': ['* CIUDAD SENSOR · PLAZA CANAL\n* (La tubería al Pueblo Vitrina está aquí abajo.)', '* La Wii salió en 2006.', `* ${WII_FACTS[0]}`],
        '9,4': ['* PANTALLA GIGANTE DE LA CIUDAD\n* Cada canal es una zona. Los apagados... los apagó alguien morado.', `* ${WII_FACTS[4]}`],
        '17,4': ['* CANAL TIENDA (CERRADO)', '* "Aquí se compraban juegos viejitos para jugarlos en la nueva.\n* Se llamaba Consola Virtual."'],
        '25,14': ['* → DISTRITO DEPORTES\n* Gimnasio Sensor · Estadio del Torneo', `* ${WII_FACTS[2]}`],
      },
      looks: wiiLooks(() => !!Save.data.done.canalclima),
      bitTips: [
        '* ¿Ves esa manita blanca que flota en el cielo?\n* Es mi tío. ...Saluda, tío.',
        '* Mira la pantalla gigante: cada vez que ganamos, se prende un canal.',
        '* En el pasto alto del parque salen enemigos que ya venciste.\n* ¡Para practicar el ritmo!',
        '* Todo aquí es tan blanco que me da pena pisarlo.',
      ],
      npcs: [
        {
          id: 'wii_noticias', sprite: 'wii_noticias', x: 8, y: 7,
          wiiModel: wiiMiiModel({ hair: WIIC.orange, shirt: WIIC.pink, pants: WIIC.navy }),
          async talk(ctx) {
            const who = 'LOCUTORA DEL CANAL NOTICIAS';
            if (!ctx.flag('wiiNoticias')) {
              ctx.setFlag('wiiNoticias');
              await ctx.say([
                '* ¡Última hora! Les habla el CANAL NOTICIAS, en vivo desde la plaza.',
                '* Un sujeto morado está poniendo la ciudad en STANDBY.\n* Los canales se apagan uno por uno. ¡Qué nervios!',
              ], who);
              return;
            }
            if (Save.data.done.canalclima && !ctx.flag('wiiNoticiasPlaza')) {
              ctx.setFlag('wiiNoticiasPlaza');
              await ctx.say(['* ¡Noticia de último minuto! Los canales de la plaza se están PRENDIENDO.\n* Fuentes cercanas dicen que fue alguien que escribe muy rápido.'], who);
              return;
            }
            const lines = [
              ['* Dato de noticiero: la Wii recibía noticias y el clima aunque estuviera en standby.\n* A eso le decían WiiConnect24.'],
              ['* Cuando llegaba un mensaje nuevo, la ranura del disco brillaba en AZUL.\n* Como diciendo: "Psst... tienes correo".'],
              ['* El foquito del botón de encendido era VERDE si estaba prendida...\n* ...y rojo o naranja en standby. Hoy toda la ciudad está en rojo. Por ahora.'],
            ];
            await ctx.say(lines[ctx.counter('wiiNoticiasN') % lines.length], who);
          },
        },
      ],
    },

    'wii-deportes': {
      name: 'Distrito Deportes',
      render: '3d',
      view3d: { edge: 'grass', sky: '#DDF1FC', fogColor: '#EEF7FD', fog: [34, 120], cam: [11.5, 9.5] },
      wii3d: { sky: 'menu', on: () => !!Save.data.done.entrenadormi },
      intro: [
        '* ¡El DISTRITO DEPORTES! Huele a pelota nueva y a tenis recién lavados.',
        '* Allá al fondo está el GIMNASIO SENSOR.\n* Dicen que el Entrenador Mi no deja pasar a nadie sin sus tres pruebas.',
      ],
      music: 'wii_deportes',
      ground: 'wii_piso',
      map: [
        'KKKKKKKKKKKKKK:KKKKKKKKKKKKKKK',
        'KKKKKKKKKKKKKK:KKKKKKKKKKKKKKK',
        'K.iiiiiii.mmmm:mmmmggggggggggK',
        'K.LLLLLLL.mZmm:mmmmgwwwwnwwwgK',
        'K.LLLLLLL.mmmm:mmmmgwgggnggwgK',
        'K.LLLLLLL.mmmm:mmmmgwgggnggwgK',
        'K.LLLLLLL.mmmm:mmmmgwgggnggwgK',
        'K.LLLLLLL.mmmm:mmmmgwwwwnwwwgK',
        'K..................gggg:gggggK',
        'K.S.......mmmmmmmmmgggg:gggg.K',
        'KKKKKKKKKKKKKKKKKKKKKKK:KKKKKK',
        'BBBBBBBBBBBBBBBBBBBBBBB:BBBBBB',
        'B""T"""BB"""T"""BVVV...:.....B',
        'B"""""*BB"S"""""B......:..*..B',
        'B"S""""BB"""*"""B..::::::....B',
        ':::::::::::::"""B..:...C.....B',
        'B""""""BB""""":"B..:....,,,,.B',
        'B"*""""BB"""""::::::....,,,,.B',
        'B""""T"BB"*"""""B"".....,,,,"B',
        'B""""""BB"""T"""B"*"""T""""*"B',
        'BTTTTTTBBTTTTTTTBTTTTTTTTTTTTB',
        'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
      ],
      tiles: WII_TILES,
      spawns: { start: [1, 15, 'right'] },
      exits: {
        '0,15': { map: 'wii-plaza', spawn: [26, 15, 'left'] },
        '14,0': { map: 'wii-estadio', spawn: [13, 20, 'up'] },
      },
      encounters: [
        { enemy: 'correita', x: 7, y: 15, say: ['* ¡ALTO! ¿Te pusiste la correa? ¡¿TE PUSISTE LA CORREA?!', '* Por esta calle nadie pasa sin seguridad.\n* ¡Y SIN MAYUSCULAS BIEN PUESTAS!'] },
        { enemy: 'nunchuquin', x: 16, y: 17, say: ['* ¡Oh! ¿Viniste a pelear conmigo? ¿Con... CONMIGO primero?', '* Nadie me deja ir primero nunca. ¡Esta vez sí! ¡Mitad y mitad!'] },
        { enemy: 'sensorin', x: 23, y: 11, say: ['* ¡Clic, clic! Te veo. Te veo de un lado... y del otro.', '* Nadie entra al gimnasio sin que yo lo vea primero.\n* ¡Y yo veo MUY rápido!'] },
        { enemy: 'entrenadormi', x: 14, y: 1, say: ['* ENTRENADOR MI: ¡Hola, hola! ¡Bienvenido al GIMNASIO SENSOR!', '* ENTRENADOR MI: La salida al estadio está detrás de mí.\n* Pero primero: ¡tres pruebas! Boliche, tenis y box. ¡El deporte es ritmo!'] },
      ],
      chests: [
        { id: 'wii_motionplus', x: 28, y: 9, treasure: 'wii_motionplus', word: 'precisión' },
      ],
      wild: ['zumbito', 'correita', 'nunchuquin', 'sensorin'],
      signs: {
        '2,14': ['* DISTRITO DEPORTES\n* ← Plaza Canal · Gimnasio Sensor: al norte, pasando la Sala Sensor.', `* ${WII_FACTS[1]}`],
        '10,13': ['* CALLE DE LA CORREA\n* "Póngase la correa. Por su tele." —El Ayuntamiento'],
        '2,9': ['* GIMNASIO SENSOR\n* Prueba 1: BOLICHE · Prueba 2: TENIS · Prueba 3: BOX', '* "¡El deporte es ritmo! ¡El tecleo es ritmo!" —Entrenador Mi'],
      },
      looks: wiiLooks(() => !!Save.data.done.entrenadormi),
      bitTips: [
        '* ¡Una tele ENORME con la barra sensora encima!\n* Ahí vive Sensorín, seguro.',
        '* En el pasto alto de la Sala Sensor salen enemigos que ya venciste.',
        '* ¿Ves los pinos del boliche? Esperan su chuza desde 2006.',
        '* Correíta grita, pero tiene razón: ¡la correa salva teles!',
      ],
      npcs: [
        {
          id: 'wii_abuela', sprite: 'wii_abuela', x: 5, y: 8,
          wiiModel: wiiMiiModel({ hair: WIIC.light, shirt: WIIC.purple, pants: WIIC.gray }),
          async talk(ctx) {
            const who = 'ABUELA BOLICHE';
            if (!ctx.flag('wiiAbuela')) {
              ctx.setFlag('wiiAbuela');
              await ctx.say([
                '* ¡Hola, mijo! Soy la ABUELA BOLICHE.\n* Llevo 300 partidas seguidas. Mis nietos ya no quieren jugar conmigo.',
                '* El truco es el RITMO: paso, paso, paso... ¡y soltar!\n* Igualito que escribir. Una letra, otra, otra.',
              ], who);
              return;
            }
            const lines = [
              ['* Antes yo no jugaba videojuegos. Luego llegó una consola que se jugaba MOVIENDO el brazo.\n* ¡Hasta las abuelas podíamos!'],
              ['* ¿Sabías? En Wii Sports había cinco deportes:\n* boliche, tenis, box, golf y béisbol. Yo soy de boliche, obvio.'],
              ['* Cuando el control vuela, la tele llora.\n* Por eso le hago caso a Correíta. Siempre.'],
            ];
            if (Save.data.done.entrenadormi) lines.push(['* ¡Le ganaste al Entrenador Mi! A mí me tardó tres semanas.\n* Bueno, dos. No le digas.']);
            await ctx.say(lines[ctx.counter('wiiAbuelaN') % lines.length], who);
          },
        },
      ],
    },

    'wii-estadio': {
      name: 'Estadio Sensor',
      render: '3d',
      view3d: { edge: 'grass', sky: '#DDF1FC', fogColor: '#EEF7FD', fog: [34, 120], cam: [11.5, 9.5] },
      wii3d: { sky: 'menu', on: () => !!Save.data.done.daniwii },
      intro: [
        '* ¡El ESTADIO DEL TORNEO SENSOR! ¿Escuchas? El público corea...\n* "¡DA-NI! ¡DA-NI!" ...y también tu nombre. Poquito, pero sí.',
        '* Dani nos espera en la entrada de la cancha. La gran final.',
      ],
      music: 'wii_canal',
      ground: 'wii_piso',
      map: [
        'BBBBBBBBBBBBBBBBBBBBBBBBBB',
        'B"C""""""""""""""""""""C"B',
        'B""""S"""""""U"""""""""""B',
        'B"""""""""""":"""""""""""B',
        'B"T"""""""""":"""""""""T"B',
        'EEEEEEEEEEEEE:EEEEEEEEEEEE',
        'EGGGGGGGGGGGG:GGGGGGGGGGGE',
        'EGfffffffffffwffffffffffGE',
        'EGfffffffffffwffffffffffGE',
        'EGfffffffffffwffffffffffGE',
        'EGwwwwwwwwwwwwwwwwwwwwwwGE',
        'EGfffffffffffwffffffffffGE',
        'EGfffffffffffwffffffffffGE',
        'EGfffffffffffwffffffffffGE',
        'EGfffffffffffwffffffffffGE',
        'EGGGGGGGGGGGG:GGGGGGGGGGGE',
        'EEEEEEEEEEEEE:EEEEEEEEEEEE',
        'B"T"""""""""":"""""""""T"B',
        'B"""""""""""":""S""""""""B',
        'B"""""""""""":"""""""""""B',
        'B"*"""""""""":"""""""""*"B',
        'BBBBBBBBBBBBB:BBBBBBBBBBBB',
      ],
      tiles: WII_TILES,
      spawns: { start: [13, 20, 'up'] },
      exits: {
        '13,21': { map: 'wii-deportes', spawn: [14, 1, 'down'] },
        '13,2': { map: 'wii-galaxia', spawn: [14, 20, 'up'] },
      },
      encounters: [
        { enemy: 'daniwii', x: 13, y: 16, say: ['* DANI: Por fin. Te estaba esperando.', '* DANI: La cancha está detrás de mí. Y detrás de la cancha, el cielo.\n* Pero primero... la final.'] },
      ],
      chests: [
        { id: 'wii_volante', x: 2, y: 19, treasure: 'wii_volante', word: 'volante' },
      ],
      signs: {
        '16,18': ['* TORNEO SENSOR · ¡GRAN FINAL!\n* HOY: DANI TURBO contra... ¡TI!', '* Las gradas son para 10 000 muñequitos.\n* (Hoy vinieron 10 001. Uno se coló.)'],
        '5,2': ['* ESTRELLA LANZADORA\n* Párate encima y... ¡al espacio! (Destino: el Observatorio.)', '* BIT: Una estrella que te lanza a otra planetita...\n* Esto me suena a un juego de 2007. ¡Con un plomero!'],
      },
      looks: wiiLooks(() => !!Save.data.done.daniwii),
      bitTips: [
        '* ¡Mira las gradas! Todos los muñequitos agitan los brazos igualito.',
        '* Dani se ve distinto. Más tranquilo. ¿Dónde estará su "???"?',
        '* Esa estrella amarilla del otro lado del estadio... ¿está girando?',
      ],
      npcs: [
        {
          id: 'wii_locutor', sprite: 'wii_locutor', x: 10, y: 18,
          wiiModel: wiiMiiModel({ hair: WIIC.black, shirt: WIIC.red, pants: WIIC.gray }),
          async talk(ctx) {
            const who = 'LOCUTOR';
            const d = Save.data.done;
            if (!d.daniwii) {
              await ctx.say([
                '* ¡Bienvenidos al TORNEO SENSOR! Soy el LOCUTOR. Hoy: ¡LA GRAN FINAL!',
                '* En una esquina: DANI TURBO, el segundo más rápido del museo.\n* En la otra esquina: ¡TÚ! ...Ya entra, que el público se desespera.',
              ], who);
              return;
            }
            if (!ctx.flag('wiiLocutorFinal')) {
              ctx.setFlag('wiiLocutorFinal');
              await ctx.say([
                '* ¡QUE FINAL, SEÑORAS Y SEÑORES! ¡Nunca vi teclear así!',
                '* Dicen que la estrella del otro lado de la cancha te lanza hasta el espacio.\n* Al OBSERVATORIO del Capitán Cometa.',
              ], who);
              return;
            }
            await ctx.say([d.cometa
              ? '* ¡La pantalla gigante ya tiene todos sus canales! Bueno... casi todos.\n* Hay uno nuevo que no sale en mi guía de programación.'
              : `* Dato del locutor: ${WII_FACTS[3]}`], who);
          },
        },
      ],
    },

    'wii-galaxia': {
      name: 'Canal Galaxia',
      render: '3d',
      view3d: { edge: 'void', sky: '#0B1638', fogColor: '#0B1638', fog: [60, 220], cam: [12.5, 10] },
      wii3d: { sky: 'space', on: () => !!Save.data.done.cometa },
      intro: [
        '* ¡WOOOAAAH! ¡La estrella nos lanzó hasta el ESPACIO!',
        '* Planetitas, puentes de estrellas... y allá arriba, el OBSERVATORIO del Capitán Cometa.\n* Ahí debe estar la Wii.',
        '* Tranquilo: aquí todavía se camina normal.\n* ...Por ahora. El Glitch le robó la gravedad al Capitán.',
      ],
      music: 'wii_galaxia',
      ground: 'wii_piso',
      map: [
        'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvv',
        'vvvvvvvvvvoooQQQooovvvvvvvvvvv',
        'vvvvvvvvvooooooooSooovvvvvvvvv',
        'vvvvvvvvvvooooooooovvvvvvvvvvv',
        'vvvvvvvvvvvvvv+vvvvvvvvvvvvvvv',
        'vvvvvvvvvvvvvv+vvvvvvvvvvvvvvv',
        'vvvvvvvvvvvvvv+vvvvvvvvvvvvvvv',
        'vvvvvvvvoo^^^^^^^^^^oovvvvvvvv',
        'vvvvvvvvoOOO^^^^^^Y^oovvvvvvvv',
        'vvvvvvvvoOOO^^^^^^^^oovvvvvvvv',
        'voooovvvoOOOoooooooooovvooooov',
        'voooo+++oooooooooooooo++ooooov',
        'voSoovvvoooooooooooooovvoooSov',
        'vvvvvvvvoooooooooooooovvvvvvvv',
        'vvvvvvvvvvvvvv+vvvvvvvvvvvvvvv',
        'vvvvvvvvvvvvvv+vvvvvvvvvvvvvvv',
        'vvvvvvvvvvvvvv+vvvvvvvvvvvvvvv',
        'vvvvvvvvvvvvvv+vvvvvvvvvvvvvvv',
        'vvvvvvvvvvvoooooooovvvvvvvvvvv',
        'vvvvvvvvvvvoooooooovvvvvvvvvvv',
        'vvvvvvvvvvvoooooooovvvvvvvvvvv',
        'vvvvvvvvvvvoooUoooovvvvvvvvvvv',
        'vvvvvvvvvvvvoooooovvvvvvvvvvvv',
        'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvv',
      ],
      tiles: WII_TILES,
      spawns: { start: [14, 20, 'up'] },
      exits: {
        '14,21': { map: 'wii-estadio', spawn: [13, 3, 'down'] },
      },
      encounters: [
        { enemy: 'cometa', x: 14, y: 6, say: ['* CAPITAN COMETA: ¡Alto ahí! ...Perdón. Es que todo se me cae.\n* Hacia arriba. Hacia los lados. Hacia todos lados.', '* CAPITAN COMETA: El Glitch se llevó mi gravedad.\n* Solo un tecleo MUY estable puede restaurar mi órbita. ¡En guardia!'] },
      ],
      signs: {
        '2,12': ['* PLANETITA DEL OESTE\n* Gravedad: un poquito. Saltos: muchos.', '* En 2007 salió un juego de Wii en el que un plomero saltaba de planetita en planetita.\n* Cada una tenía su propia gravedad.'],
        '27,12': ['* PLANETITA DEL ESTE · MIRADOR', '* En ese juego del plomero espacial había 120 estrellas por juntar.\n* Aquí solo hay 7. Pero son del Capitán.'],
        '17,2': () => (Save.data.flags.finalAbierto
          ? ['* CANAL VACIO\n* (Este letrero no estaba aquí ayer.)', '* Abajo, con letra muy chiquita: "Te espero."']
          : '* El letrero está en blanco.'),
      },
      looks: wiiLooks(() => !!Save.data.done.cometa),
      bitTips: [
        '* ¿Viste a alguien de gorra roja brincando en esa planetita de allá?\n* ...Mejor no lo distraigas. Se ve ocupado juntando estrellas.',
        '* Los puentes son de ESTRELLAS. Pisa suavecito.',
        '* Desde aquí la Ciudad Sensor se ve chiquitita. Y casi toda apagada.',
      ],
      npcs: [
        {
          id: 'wii_estrellin', sprite: 'wii_estrellin', x: 11, y: 2,
          wiiModel: (v) => {
            const g = WiiPoly.models.star(v, WIIC.yellow, 0.7, true);
            const anim = (t) => { g.position.y = 0.6 + Math.sin(t * 2.5) * 0.2; g.rotation.y = Math.sin(t) * 0.5; };
            g.userData.anim = anim;
            return g;
          },
          async talk(ctx) {
            const who = 'ESTRELLIN';
            if (!Save.data.flags.finalAbierto) {
              await ctx.say(['* ¡Ay! ¿Cómo llegaste hasta aquí?\n* ...Bueno, ya que estás: cuida al Capitán, ¿sí?'], who);
              return;
            }
            if (!ctx.flag('wiiEstrellin')) {
              ctx.setFlag('wiiEstrellin');
              await ctx.say([
                '* ¡Hola! Soy ESTRELLIN, una de las siete estrellitas del Capitán.\n* Gracias por devolverle su gravedad.',
                '* Ese marco blanco apareció solito cuando el Capitán se calmó.\n* No sale en ningún mapa de estrellas. Dice: CANAL VACIO.',
                '* Yo no me acerco mucho. Hace "bzzzt" y huele a cartucho viejo.',
              ], who);
              return;
            }
            await ctx.say([rand([
              '* El Capitán dice que las estrellas no se apagan: se van lejos.\n* Ese canal se siente como algo que se fue MUY lejos.',
              '* Bit dice que antes de entrar vayan al pueblo.\n* Que tus amigos te quieren decir algo. ¡Yo también iría!',
              '* A veces, de ese canal sale un ruidito... como alguien tecleando.',
            ])], who);
          },
        },
      ],
    },
  },
});

// =====================================================================================
// 3D de la Ciudad Sensor. town3d.js dibuja lo de siempre; esto solo AGREGA, en los mapas con
// `wii3d` (y nada más en ellos): modelos de casilla propios (`w3`), los personajes con los
// modelos redonditos de WiiPoly (js/scenes/wii-kit.js), cielo limpio con canales flotantes
// (o el espacio) y luz más blanca. No cambia town3d.js: envuelve sus métodos sin tocarlos.
// =====================================================================================

const wiiZone = (sc) => (sc && sc.m && sc.m.world === 'wii' && sc.m.wii3d) || null;

// Los modelos de WiiPoly usan v.s / v.soft / v.glow (de WiiPoly.view). La vista del mapa es la
// de Poly.view, así que se los agregamos (materiales en el caché de la vista: se liberan con ella).
function wiiAdapt(v) {
  if (v.s) return v;
  v.soft = (color, extra) => {
    if (extra) return new THREE.MeshPhongMaterial({ color, shininess: 70, specular: 0x444444, ...extra });
    const k = `wii:${color}`;
    if (!v.mats[k]) v.mats[k] = new THREE.MeshPhongMaterial({ color, shininess: 70, specular: 0x444444 });
    return v.mats[k];
  };
  v.glow = (color) => new THREE.MeshBasicMaterial({ color });
  v.s = (geo, color, parent, extra) => v.mesh(geo, typeof color === 'object' ? color : v.soft(color, extra), null, parent);
  return v;
}

function wiiStarShape(R, r = R * 0.48) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const k = i % 2 ? r : R;
    if (i) s.lineTo(Math.cos(a) * k, Math.sin(a) * k); else s.moveTo(Math.cos(a) * k, Math.sin(a) * k);
  }
  return s;
}

// Junta las casillas pegadas con el mismo `w3` (la pantalla, la tele, el observatorio...).
// Devuelve el rectángulo solo la primera vez (las demás casillas ya quedaron dibujadas).
function wiiRect(r3, x, y, key) {
  const done = r3.wiiGrouped || (r3.wiiGrouped = new Set());
  if (done.has(`${x},${y}`)) return null;
  const is = (i, j) => { const t = r3.sc.tileAt(i, j); return !!t && t.w3 === key; };
  let x0 = x; let x1 = x; let y0 = y; let y1 = y;
  const st = [[x, y]];
  while (st.length) {
    const [i, j] = st.pop();
    const k = `${i},${j}`;
    if (done.has(k) || !is(i, j)) continue;
    done.add(k);
    x0 = Math.min(x0, i); x1 = Math.max(x1, i); y0 = Math.min(y0, j); y1 = Math.max(y1, j);
    st.push([i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]);
  }
  return { x0, x1, y0, y1 };
}

// Lucecita de la azotea: roja y parpadeando (standby) o verde (zona encendida).
function wiiLed(r3, X, Y, Z, band) {
  const z = wiiZone(r3.sc);
  const on = !!(z && z.on && z.on());
  if (!r3.wiiLedMats) r3.wiiLedMats = { on: new THREE.MeshBasicMaterial({ color: '#43D17A' }), off: new THREE.MeshBasicMaterial({ color: '#F44336' }) };
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), on ? r3.wiiLedMats.on : r3.wiiLedMats.off);
  m.position.set(X, Y, Z);
  band.grp.add(m);
  if (!on) {
    const k = T3Hash(Math.round(X), Math.round(Z), 2) * 6;
    r3.anims.push((dt, t) => { m.visible = Math.sin(t * 2.2 + k) > -0.3; });
  }
}

const WII_CANAL_COLS = ['#5BC0EB', '#43D17A', '#FFD54F', '#F48FB1', '#FF8A3D', '#9C6ADE', '#1E88E5'];

// ---------- Estilo 3D de la Ciudad Sensor: brillante, limpio y con color (como los deportes de 2006) ----------
// El blanco y el azul siguen siendo la identidad; el pasto es verde de verdad, los caminos blancos con
// orilla azul y la plaza gris clarito, para que siempre se sepa por dónde se camina.
const WII3 = {
  grass: '#72C847', grassL: '#86D65A', grassD: '#5DB43C', tuft: ['#4FAE3C', '#3E9A33', '#62BE45'],
  path: '#FFFFFF', pathSeam: '#E2EEF7', pathEdge: '#2E9BE6',
  pave: '#D5E0EC', paveSeam: '#BCCBDC',
  court: '#3FAA5C', courtL: '#49B666', field: ['#5DC85B', '#4CB74C'], line: '#FAFDFF',
  trunk: '#A47A58', leaf: ['#45B649', '#56C24E', '#3CA847'], leafHi: '#78D158',
  roof: ['#1E88E5', '#43D17A', '#FF8A3D', '#F48FB1', '#FFD54F', '#9C6ADE', '#5BC0EB'],
  glass: '#4FB3F0', plinth: '#C3D0DE',
  flower: ['#F48FB1', '#FFD54F', '#FAFAFA', '#FF8A3D', '#5BC0EB'],
  shadow: '#16324D',
};

// Malla horneada propia de la Wii: guarda las normales de cada geometría (esferas lisas, no facetadas).
class WiiBake extends T3Bake {
  add(geo, m, color, uv) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    if (m) g.applyMatrix4(m);
    if (!g.attributes.normal) g.computeVertexNormals();
    const P = g.attributes.position.array;
    const N = g.attributes.normal.array;
    const U = g.attributes.uv && g.attributes.uv.array;
    const col = new THREE.Color(color || '#ffffff');
    for (let i = 0; i < P.length / 3; i++) {
      this.p.push(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]);
      this.n.push(N[i * 3], N[i * 3 + 1], N[i * 3 + 2]);
      this.c.push(col.r, col.g, col.b);
      if (uv) this.u.push(uv[0] + (uv[2] - uv[0]) * (U ? U[i * 2] : 0), uv[1] + (uv[3] - uv[1]) * (U ? U[i * 2 + 1] : 0));
    }
    if (g !== geo) g.dispose();
    geo.dispose();
  }
}
const wiiSm = (band) => band.wiiSm || (band.wiiSm = new WiiBake());

// Sombra redondita y suave (una textura de degradado; todas las de los objetos van en UNA malla).
function wiiShadowMat(r3) {
  if (r3.wiiShMat) return r3.wiiShMat;
  const tex = r3.v.tex(64, 64, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.45, 'rgba(255,255,255,0.75)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  });
  r3.wiiShMat = new THREE.MeshBasicMaterial({
    map: tex, color: WII3.shadow, transparent: true, opacity: 0.34, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  });
  return r3.wiiShMat;
}
function wiiShadow(band, X, Y, Z, rx, rz = rx) {
  const bake = band.wiiSh || (band.wiiSh = new WiiBake());
  bake.add(new THREE.PlaneGeometry(rx * 2, rz * 2), T3M(X, Y + 0.025, Z, 1, 1, 1, 0, -Math.PI / 2), '#ffffff', [0, 0, 1, 1]);
}

// Modelos de casilla (this = el Town3D). (x, y) casilla, (X, Z) su centro en el mundo, wiiSm(band) = malla horneada (lisa y brillante).
const WII_T3 = {
  arbol(x, y, c, X, Z, band) {
    const b = wiiSm(band);
    const h = c.h;
    const j = (k) => T3Hash(x, y, k);
    const ox = (j(1) - 0.5) * 0.4;
    const oz = (j(2) - 0.5) * 0.4;
    const s = 0.85 + j(3) * 0.3;
    // Árbol de bolita: tronco café, copa verde lisa y un brillito arriba (sin hojas fuera de lugar).
    b.add(new THREE.CylinderGeometry(0.16, 0.24, 1.2 * s, 6, 1, true), T3M(X + ox, h + 0.6 * s, Z + oz), WII3.trunk);
    b.add(new THREE.SphereGeometry(1.0 * s, 10, 6), T3M(X + ox, h + 1.8 * s, Z + oz, 1, 0.92, 1), WII3.leaf[Math.floor(j(4) * 3)]);
    b.add(new THREE.SphereGeometry(0.5 * s, 7, 4), T3M(X + ox - 0.3, h + 2.35 * s, Z + oz + 0.35), WII3.leafHi);
    wiiShadow(band, X + ox, h, Z + oz, 1.15 * s);
  },

  edificio(x, y, c, X, Z, band) {
    const S = T3S;
    const b = wiiSm(band);
    const h = c.h;
    // De 2 en 2 casillas, la misma altura. Si detrás (al norte) se puede caminar, va bajito:
    // la cámara mira desde el sur y un edificio alto taparía al héroe.
    const back = [1, 2, 3].some((k) => { const t = this.sc.tileAt(x, y - k); return t && !t.solid; })
      // Junto a una salida también: es lo primero que se ve al entrar.
      || Object.keys(this.sc.m.exits || {}).some((k) => { const [ex, ey] = k.split(',').map(Number); return Math.abs(ex - x) <= 3 && Math.abs(ey - y) <= 3; });
    const H = back ? 1.7 + T3Hash(x >> 1, y >> 1, 5) * 0.6 : 2.6 + T3Hash(x >> 1, y >> 1, 5) * 3.6;
    // Blanco con ventanas azules, zócalo gris y una franja de color arriba (de 2 en 2 casillas, como la altura).
    const roof = WII3.roof[Math.floor(T3Hash(x >> 1, y >> 1, 7) * WII3.roof.length)];
    b.add(new THREE.BoxGeometry(S, H, S), T3M(X, h + H / 2, Z), '#FAFAFA');
    b.add(new THREE.BoxGeometry(S * 1.03, 0.45, S * 1.03), T3M(X, h + 0.22, Z), WII3.plinth);
    for (let k = 1; k < H - 0.6; k += 1.1) b.add(new THREE.BoxGeometry(S * 1.02, 0.34, S * 1.02), T3M(X, h + k + 0.3, Z), WII3.glass);
    b.add(new THREE.BoxGeometry(S * 1.04, 0.4, S * 1.04), T3M(X, h + H - 0.3, Z), roof);
    if (T3Hash(x, y, 6) < 0.3) wiiLed(this, X + 0.5, h + H + 0.22, Z + 0.5, band);
  },

  canal(x, y, c, X, Z, band) {
    const b = wiiSm(band);
    const h = c.h;
    const col = c.t.c3 || WII_CANAL_COLS[Math.floor(T3Hash(x, y, 1) * WII_CANAL_COLS.length)];
    b.add(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8), T3M(X, h + 0.6, Z), '#AAB2BD');
    b.add(new THREE.BoxGeometry(1.8, 1.15, 0.22), T3M(X, h + 1.75, Z), '#FAFAFA');
    wiiShadow(band, X, h, Z, 0.9, 0.5);
    [0.12, -0.12].forEach((o) => b.add(new THREE.BoxGeometry(1.5, 0.85, 0.04), T3M(X, h + 1.75, Z + o), col));
  },

  // La pantalla gigante: un muro blanco con 8 canales (prendidos o apagados según tu progreso).
  pantalla(x, y, c, X, Z, band) {
    const R = wiiRect(this, x, y, 'pantalla');
    if (!R) return;
    const S = T3S;
    const b = wiiSm(band);
    const x0 = R.x0 * S;
    const x1 = (R.x1 + 1) * S;
    const z0 = R.y0 * S;
    const z1 = (R.y1 + 1) * S;
    const w = x1 - x0;
    const H = 7;
    b.add(new THREE.BoxGeometry(w, H, z1 - z0), T3M((x0 + x1) / 2, H / 2, (z0 + z1) / 2), '#FAFAFA');
    b.add(new THREE.BoxGeometry(w - 0.6, H - 1.2, 0.1), T3M((x0 + x1) / 2, H / 2 + 0.2, z1 + 0.03), WII_INK);
    const list = wiiCanales();
    const cols = 4;
    const gw = (w - 1.4) / cols;
    const gh = (H - 2.2) / 2;
    list.forEach((ch, i) => {
      const tex = this.v.textTex(ch.on ? ch.name : (ch.off == null ? '' : ch.off), {
        w: 96, h: 40, bg: ch.on ? ch.bg : '#3A4150', fg: ch.on ? (ch.fg || '#FFFFFF') : '#7A8396', size: 8,
      });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(gw - 0.4, gh - 0.4), new THREE.MeshBasicMaterial({ map: tex }));
      m.position.set(x0 + 0.7 + gw * (i % cols) + gw / 2, H / 2 + 0.2 + (i < cols ? 0.5 : -0.5) * gh, z1 + 0.1);
      band.grp.add(m);
    });
  },

  letrero(x, y, c, X, Z, band) {
    const b = wiiSm(band);
    const h = c.h;
    b.add(new THREE.CylinderGeometry(0.09, 0.09, 1.1, 8), T3M(X, h + 0.55, Z), '#AAB2BD');
    b.add(new THREE.BoxGeometry(1.5, 0.95, 0.16), T3M(X, h + 1.4, Z), '#FAFAFA');
    b.add(new THREE.BoxGeometry(1.2, 0.65, 0.04), T3M(X, h + 1.4, Z + 0.09), WIIC.blue);
    wiiShadow(band, X, h, Z, 0.75, 0.4);
    b.add(new THREE.BoxGeometry(0.8, 0.08, 0.02), T3M(X, h + 1.5, Z + 0.12), '#FAFAFA');
    b.add(new THREE.BoxGeometry(0.6, 0.08, 0.02), T3M(X, h + 1.32, Z + 0.12), '#FAFAFA');
  },

  // Tubería blanca (mismas medidas que la verde de town3d.js: ahí se para el jugador).
  tubo(x, y, c, X, Z, band) {
    const b = wiiSm(band);
    const h = c.h;
    b.add(new THREE.CylinderGeometry(0.7, 0.7, 0.8, 16), T3M(X, h + 0.4, Z), '#FAFAFA');
    b.add(new THREE.CylinderGeometry(0.9, 0.9, 0.32, 16), T3M(X, h + 0.96, Z), '#5BC0EB');
    b.add(new THREE.CylinderGeometry(0.62, 0.62, 0.04, 16), T3M(X, h + 1.12, Z), '#0D47A1');
    wiiShadow(band, X, h, Z, 1.15);
  },

  valla(x, y, c, X, Z, band) {
    const S = T3S;
    const b = wiiSm(band);
    const h = c.h;
    const same = (i, j) => { const t = this.sc.tileAt(i, j); return !!t && t.w3 === 'valla'; };
    b.add(new THREE.BoxGeometry(0.2, 0.9, 0.2), T3M(X, h + 0.45, Z), '#FAFAFA');
    let any = false;
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
      if (!same(x + dx, y + dy)) return;
      any = true;
      [0.35, 0.75].forEach((yy) => b.add(new THREE.BoxGeometry(dx ? S / 2 : 0.1, 0.1, dy ? S / 2 : 0.1), T3M(X + dx * S / 4, h + yy, Z + dy * S / 4), '#E6E9EE'));
    });
    if (!any) [0.35, 0.75].forEach((yy) => b.add(new THREE.BoxGeometry(S, 0.1, 0.1), T3M(X, h + yy, Z), '#E6E9EE'));
  },

  pinos(x, y, c, X, Z, band) {
    const b = wiiSm(band);
    const h = c.h;
    [[0, 0.35], [-0.42, -0.3], [0.42, -0.3]].forEach(([ox, oz]) => {
      b.add(new THREE.CylinderGeometry(0.1, 0.17, 0.55, 8), T3M(X + ox, h + 0.28, Z + oz), '#FAFAFA');
      b.add(new THREE.CylinderGeometry(0.09, 0.09, 0.07, 8), T3M(X + ox, h + 0.5, Z + oz), '#F44336');
      b.add(new THREE.SphereGeometry(0.11, 8, 6), T3M(X + ox, h + 0.66, Z + oz), '#FAFAFA');
      wiiShadow(band, X + ox, h, Z + oz, 0.28);
    });
  },

  red(x, y, c, X, Z, band) {
    const S = T3S;
    const b = wiiSm(band);
    const h = c.h;
    const net = (i, j) => { const t = this.sc.tileAt(i, j); return !!t && t.w3 === 'red'; };
    const alongZ = net(x, y - 1) || net(x, y + 1);
    b.add(new THREE.BoxGeometry(alongZ ? 0.06 : S, 0.8, alongZ ? S : 0.06), T3M(X, h + 0.45, Z), '#3A4150');
    b.add(new THREE.BoxGeometry(alongZ ? 0.1 : S, 0.08, alongZ ? S : 0.1), T3M(X, h + 0.88, Z), '#FAFAFA');
    const ends = alongZ ? [[0, -1], [0, 1]] : [[-1, 0], [1, 0]];
    ends.forEach(([dx, dy]) => { if (!net(x + dx, y + dy)) b.add(new THREE.CylinderGeometry(0.07, 0.07, 1.0, 6), T3M(X + dx * S * 0.48, h + 0.5, Z + dy * S * 0.48), '#AAB2BD'); });
  },

  balanza(x, y, c, X, Z, band) {
    const b = wiiSm(band);
    const h = c.h;
    b.add(new THREE.BoxGeometry(1.5, 0.16, 0.9), T3M(X, h + 0.1, Z), '#FAFAFA');
    b.add(new THREE.BoxGeometry(1.3, 0.02, 0.7), T3M(X, h + 0.19, Z), '#E6E9EE');
    b.add(new THREE.SphereGeometry(0.05, 6, 4), T3M(X + 0.6, h + 0.2, Z + 0.38), '#5BC0EB');
    wiiShadow(band, X, h, Z, 0.95, 0.65);
  },

  // Tele enorme de la Sala Sensor con la barra sensora encima (las 3 casillas son UNA tele).
  tele(x, y, c, X, Z, band) {
    const R = wiiRect(this, x, y, 'tele');
    if (!R) return;
    const S = T3S;
    const b = wiiSm(band);
    const w = (R.x1 - R.x0 + 1) * S;
    const cx = (R.x0 + R.x1 + 1) * S / 2;
    const cz = (R.y0 + R.y1 + 1) * S / 2;
    b.add(new THREE.BoxGeometry(w * 0.3, 0.6, 0.8), T3M(cx, 0.3, cz), '#AAB2BD');
    b.add(new THREE.BoxGeometry(w - 0.2, 2.6, 0.4), T3M(cx, 1.9, cz), WII_INK);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.6, 2.2), new THREE.MeshBasicMaterial({ color: '#CFEFFF' }));
    scr.position.set(cx, 1.9, cz + 0.21);
    band.grp.add(scr);
    b.add(new THREE.BoxGeometry(w * 0.5, 0.18, 0.22), T3M(cx, 3.32, cz), '#222222');
    const glow = new THREE.MeshBasicMaterial({ color: Save.data.done.sensorin ? '#F48FB1' : '#5A3A48' });
    [-1, 1].forEach((sx) => {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), glow);
      e.position.set(cx + sx * w * 0.2, 3.32, cz + 0.12);
      band.grp.add(e);
    });
  },

  gradas(x, y, c, X, Z, band) {
    const S = T3S;
    const b = wiiSm(band);
    const h = c.h;
    const j = (k) => T3Hash(x, y, k);
    const pass = (i, k) => this.passable(i, k);
    const ry = pass(x, y + 1) ? 0 : pass(x, y - 1) ? Math.PI : pass(x + 1, y) ? Math.PI / 2 : pass(x - 1, y) ? -Math.PI / 2 : 0;
    const rot = new THREE.Matrix4().makeRotationY(ry);
    const shirts = [WIIC.sky, WIIC.green, WIIC.yellow, WIIC.pink, WIIC.orange, WIIC.purple, WIIC.red];
    for (let i = 0; i < 3; i++) {
      const hh = 0.6 + i * 0.8;
      const off = S / 3 - i * (S / 3);
      b.add(new THREE.BoxGeometry(S, hh, S / 3), T3M(X, h, Z).multiply(rot).multiply(T3M(0, hh / 2, off)), ['#E3F2FD', '#90CAF9', '#42A5F5'][i]);
      if (j(i) < 0.8) {
        const px = (j(i + 3) - 0.5) * 1.3;
        b.add(new THREE.CylinderGeometry(0.14, 0.18, 0.3, 6), T3M(X, h, Z).multiply(rot).multiply(T3M(px, hh + 0.15, off)), shirts[(x + y * 3 + i) % shirts.length]);
        b.add(new THREE.SphereGeometry(0.2, 8, 6), T3M(X, h, Z).multiply(rot).multiply(T3M(px, hh + 0.48, off)), WIIC.skin);
      }
    }
  },

  // Estrella lanzadora: gira sobre su casilla (la salida al espacio... o de regreso).
  lanza(x, y, c, X, Z, band) {
    const g = new THREE.Group();
    const geo = new THREE.ExtrudeGeometry(wiiStarShape(0.85), { depth: 0.18, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1 });
    geo.center();
    const star = new THREE.Mesh(geo, this.v.mat('#FFD54F'));
    star.rotation.x = -Math.PI / 2;
    g.add(star);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.06, 6, 24), this.v.mat('#FF8A3D'));
    ring.rotation.x = -Math.PI / 2;
    g.add(ring);
    g.position.set(X, c.h + 0.25, Z);
    band.grp.add(g);
    wiiShadow(band, X, c.h, Z, 1.1);
    this.anims.push((dt, t) => { g.rotation.y = t * 1.6 + x; g.position.y = c.h + 0.25 + Math.sin(t * 3) * 0.06; });
  },

  // Puente de estrellas sobre el vacío (casilla 'bridge' de town3d.js: se camina a la misma altura).
  estrella(x, y, c, X, Z, band) {
    const geo = new THREE.ExtrudeGeometry(wiiStarShape(0.98), { depth: 0.16, bevelEnabled: false });
    // rz gira la estrella en su plano (se aplica primero); rx la acuesta en el piso.
    wiiSm(band).add(geo, T3M(X, 0.12, Z, 1, 1, 1, 0, -Math.PI / 2, (x + y) % 2 ? 0.63 : 0), (x + y) % 2 ? '#FFD54F' : '#FFE27A');
  },

  domo(x, y, c, X, Z, band) {
    const R = wiiRect(this, x, y, 'domo');
    if (!R) return;
    const S = T3S;
    const b = wiiSm(band);
    const w = (R.x1 - R.x0 + 1) * S;
    const cx = (R.x0 + R.x1 + 1) * S / 2;
    const cz = (R.y0 + R.y1 + 1) * S / 2;
    const h = c.h;
    const r = w / 2 - 0.3;
    b.add(new THREE.CylinderGeometry(r, r + 0.15, 1.8, 20), T3M(cx, h + 0.9, cz), '#FAFAFA');
    b.add(new THREE.CylinderGeometry(r + 0.2, r + 0.2, 0.2, 20), T3M(cx, h + 1.8, cz), '#5BC0EB');
    b.add(new THREE.SphereGeometry(r, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), T3M(cx, h + 1.9, cz), '#E6E9EE');
    b.add(new THREE.BoxGeometry(0.5, r * 0.9, 0.3), T3M(cx, h + 1.9 + r * 0.5, cz + r * 0.82, 1, 1, 1, 0, -0.5), '#0D47A1');
    b.add(new THREE.CylinderGeometry(0.28, 0.32, r * 1.4, 10), T3M(cx, h + 1.9 + r * 0.75, cz + r * 0.5, 1, 1, 1, 0, 0.9), '#1E88E5');
    b.add(new THREE.BoxGeometry(0.9, 1.3, 0.1), T3M(cx, h + 0.65, cz + r + 0.12), '#5BC0EB');
    wiiShadow(band, cx, h, cz, r + 0.7);
  },

  telescopio(x, y, c, X, Z, band) {
    const b = wiiSm(band);
    const h = c.h;
    [0, 2.1, 4.2].forEach((a) => b.add(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 5), T3M(X + Math.cos(a) * 0.3, h + 0.7, Z + Math.sin(a) * 0.3, 1, 1, 1, 0, Math.sin(a) * 0.35, -Math.cos(a) * 0.35), '#AAB2BD'));
    b.add(new THREE.CylinderGeometry(0.22, 0.3, 1.9, 12), T3M(X, h + 1.75, Z - 0.2, 1, 1, 1, 0, -0.85), '#1E88E5');
    b.add(new THREE.CylinderGeometry(0.33, 0.33, 0.12, 12), T3M(X, h + 2.4, Z - 0.75, 1, 1, 1, 0, -0.85), '#FAFAFA');
    wiiShadow(band, X, h, Z - 0.2, 0.8);
  },

  // El Canal Vacío: un marco blanco apagado. Con el final abierto, estática morada (no lleva a ningún lado
  // todavía: el final lo hace otra parte del juego).
  canalVacio(x, y, c, X, Z, band) {
    const R = wiiRect(this, x, y, 'canalVacio');
    if (!R) return;
    const S = T3S;
    const b = wiiSm(band);
    const w = (R.x1 - R.x0 + 1) * S;
    const cx = (R.x0 + R.x1 + 1) * S / 2;
    const cz = (R.y0 + R.y1 + 1) * S / 2;
    const h = c.h;
    const H = 3.6;
    const open = !!Save.data.flags.finalAbierto;
    b.add(new THREE.BoxGeometry(w, 0.35, 0.5), T3M(cx, h + 0.18, cz), '#FAFAFA');
    b.add(new THREE.BoxGeometry(w, 0.35, 0.5), T3M(cx, h + H, cz), '#FAFAFA');
    [-1, 1].forEach((s) => b.add(new THREE.BoxGeometry(0.35, H, 0.5), T3M(cx + s * (w / 2 - 0.18), h + H / 2 + 0.1, cz), '#FAFAFA'));
    let mat;
    if (open) {
      const tex = this.v.tex(64, 48, (g, tw, th) => {
        for (let i = 0; i < tw; i += 2) {
          for (let k = 0; k < th; k += 2) {
            const n = T3Hash(i, k, 77);
            g.fillStyle = n < 0.18 ? '#FF00FF' : n < 0.55 ? '#444444' : n < 0.62 ? '#BBBBBB' : '#111111';
            g.fillRect(i, k, 2, 2);
          }
        }
      }, { nearest: true, repeat: [1, 1] });
      mat = new THREE.MeshBasicMaterial({ map: tex });
      this.anims.push((dt, t) => { tex.offset.set(Math.floor(t * 23) * 0.37 % 1, Math.floor(t * 17) * 0.53 % 1); });
    } else {
      mat = new THREE.MeshBasicMaterial({ color: '#15151C' });
    }
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.7, H - 0.5), mat);
    scr.position.set(cx, h + H / 2 + 0.1, cz + 0.1);
    band.grp.add(scr);
    const label = this.v.textTex(open ? 'CANAL VACIO' : '', { w: 96, h: 16, bg: '#FAFAFA', fg: open ? '#FF00FF' : '#AAB2BD', size: 8 });
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.6, 0.5), new THREE.MeshBasicMaterial({ map: label }));
    plate.position.set(cx, h + H + 0.45, cz + 0.05);
    band.grp.add(plate);
    b.add(new THREE.BoxGeometry(w * 0.64, 0.6, 0.12), T3M(cx, h + H + 0.45, cz - 0.05), '#E6E9EE');
  },
};

// Personajes con modelo propio que no trae ENEMIES[...].model.
const WII_FOE_MODELS = {
  entrenadormi(v) {
    const g = WiiPoly.models.mii(v, { hair: WIIC.orange, shirt: WIIC.white, pants: WIIC.navy });
    const band = v.s(new THREE.TorusGeometry(0.8, 0.07, 6, 24), WIIC.red, g);
    band.position.y = 1.55;
    band.rotation.x = Math.PI / 2;
    return g;
  },
  // Dani Turbo, en versión muñequito de la ciudad: gorra azul con visera, como siempre.
  daniwii(v) {
    const g = WiiPoly.models.mii(v, { hair: WIIC.navy, shirt: WIIC.blue, pants: WIIC.navy });
    const cap = v.s(new THREE.SphereGeometry(0.9, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.42), WIIC.blue, g);
    cap.position.y = 1.42;
    const brim = v.s(new THREE.CylinderGeometry(0.5, 0.5, 0.07, 16, 1, false, -Math.PI / 2, Math.PI), WIIC.navy, g);
    brim.position.set(0, 1.62, 0.62);
    brim.scale.set(1.15, 1, 0.9);
    const dot = v.s(WiiPoly.sphere(0.13, 10, 8), WIIC.white, g);
    dot.position.set(0, 2.05, 0.62);
    return g;
  },
};

// Modelo 3D de un personaje de la Ciudad Sensor (o null: entonces sale lo de siempre, un cartón).
function wiiBody(r3, e) {
  if (e.id === 'player' || e.id === 'bit' || e.kind === 'chest') return null;
  const v = wiiAdapt(r3.v);
  let o = null;
  try {
    const key = e.kind === 'foe' && ENEMIES[e.enemy] ? ENEMIES[e.enemy].model : null;
    if (key && WiiPoly.models[key]) o = WiiPoly.models[key](v);
    else if (e.kind === 'foe' && WII_FOE_MODELS[e.enemy]) o = WII_FOE_MODELS[e.enemy](v);
    else if (typeof e.wiiModel === 'function') o = e.wiiModel(v);
  } catch (err) {
    console.warn('wii-mapa:', err);
    o = null;
  }
  if (!o) return null;
  // Igual que town3d.js (pies en el suelo), pero más grandes: muñequitos cabezones que se lean bien.
  const hgt = e.big ? 3.8 : 2.65;
  const wrap = new THREE.Group();
  const lift = new THREE.Group();
  lift.add(o);
  wrap.add(lift);
  const box = new THREE.Box3().setFromObject(o);
  const size = box.max.y - box.min.y || 1;
  const s = Math.max(0.35, Math.min(1.7, hgt / size));
  lift.scale.setScalar(s);
  lift.position.y = -box.min.y * s;
  return { o: wrap, model: o };
}

// Cielo: canales flotando alrededor y la manita-cursor ("Es mi tío"), o el espacio con planetitas.
function wiiSky(r3, z) {
  const v = wiiAdapt(r3.v);
  const { W, H } = r3.sc;
  const S = T3S;
  const cx = (W * S) / 2;
  const cz = (H * S) / 2;
  v.scene.add(new THREE.AmbientLight(0xffffff, z.sky === 'space' ? 0.22 : 0.1));
  if (z.sky === 'space') {
    const pts = [];
    for (let i = 0; i < 700; i++) {
      const th = T3Hash(i, 1, 41) * Math.PI * 2;
      const ph = Math.acos(2 * T3Hash(i, 2, 41) - 1);
      const rr = 150 + T3Hash(i, 3, 41) * 50;
      pts.push(cx + rr * Math.sin(ph) * Math.cos(th), rr * Math.cos(ph), cz + rr * Math.sin(ph) * Math.sin(th));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    v.scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: '#FFFFFF', size: 2.6, sizeAttenuation: false, fog: false })));
    // Planetitas de adorno, girando despacio.
    [[-26, -4, cz - 10, 5], [W * S + 30, 6, cz - 30, 7], [cx + 10, -30, H * S + 30, 10], [cx - 40, 22, -40, 4]].forEach(([px, py, pz, r], i) => {
      const p = WiiPoly.models.planet(v, r);
      p.position.set(px, py, pz);
      v.scene.add(p);
      r3.anims.push((dt, t) => { p.rotation.y = t * (0.1 + i * 0.05); });
    });
    // Alguien de gorra roja brinca en la planetita del oeste (guiño).
    const hop = new THREE.Group();
    const mii = WiiPoly.models.mii(v, { hair: '#F44336', shirt: '#F44336', pants: '#1E88E5' });
    mii.userData.anim = null;
    hop.add(mii);
    hop.scale.setScalar(0.9);
    v.scene.add(hop);
    r3.anims.push((dt, t) => { hop.position.set(-26, -4 + 5.6 + Math.abs(Math.sin(t * 2.6)) * 1.6, cz - 10); hop.rotation.y = t * 0.8; });
    // Un cometa que cruza el cielo de vez en cuando.
    const comet = new THREE.Group();
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 8), new THREE.MeshBasicMaterial({ color: '#FFF3B0', fog: false }));
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.8, 7, 8), new THREE.MeshBasicMaterial({ color: '#9FD8F5', transparent: true, opacity: 0.5, fog: false }));
    tail.rotation.z = Math.PI / 2;
    tail.position.x = 3.8;
    comet.add(head, tail);
    v.scene.add(comet);
    r3.anims.push((dt, t) => {
      const k = (t % 14) / 14;
      comet.position.set(cx + 120 - k * 240, 40 - k * 12, cz - 70);
    });
    return;
  }
  // Canales del menú flotando alrededor de la zona.
  const R = Math.max(W, H) * S * 0.62 + 18;
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(7, 4.4, 0.5), v.soft('#FAFAFA')));
    const face = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.4), new THREE.MeshBasicMaterial({ color: WII_CANAL_COLS[k % WII_CANAL_COLS.length], fog: false }));
    face.position.z = 0.27;
    g.add(face);
    g.position.set(cx + Math.cos(a) * R, 10 + (k % 3) * 4, cz + Math.sin(a) * R);
    g.lookAt(cx, 6, cz);
    v.scene.add(g);
    const y0 = g.position.y;
    r3.anims.push((dt, t) => { g.position.y = y0 + Math.sin(t * 0.9 + k) * 0.6; });
  }
  // La manita-cursor del menú, flotando sobre la zona. (Bit: "Es mi tío.")
  const hand = new THREE.Group();
  const glove = '#FAFAFA';
  hand.add(new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.4, 1.3), v.soft(glove)));
  const finger = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.32, 1.3), v.soft(glove));
  finger.position.set(-0.4, 0, -1.1);
  hand.add(finger);
  const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.7), v.soft(glove));
  thumb.position.set(0.75, 0, -0.35);
  thumb.rotation.y = -0.6;
  hand.add(thumb);
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.35, 12), v.soft('#5BC0EB'));
  cuff.rotation.x = Math.PI / 2;
  cuff.position.z = 0.8;
  hand.add(cuff);
  v.scene.add(hand);
  r3.anims.push((dt, t) => {
    hand.position.set(cx + Math.cos(t * 0.21) * W * 0.6, 9 + Math.sin(t * 1.3) * 0.5, cz + Math.sin(t * 0.17) * H * 0.55);
    hand.rotation.set(-0.5 + Math.sin(t * 1.3) * 0.1, Math.sin(t * 0.3) * 0.6, 0);
  });
}

// ---------- Suelo, luz, cielo y orillas de las zonas de la ciudad (no del espacio) ----------

// Qué suelo es cada casilla en 3D. Las que no salen aquí (madera, carriles, agua...) usan su sprite.
const WII_GK = { '"': 'grass', ',': 'grass', '*': 'grass', T: 'grass', ':': 'path', '.': 'pave', g: 'court', f: 'field', w: 'line' };

// Repinta la textura del suelo (la que town3d.js armó con los sprites): pasto verde, plaza gris
// clarito, caminos blancos con orilla azul solo por fuera, cancha con rayas y líneas blancas.
function wiiGround(r3) {
  const sc = r3.sc;
  const { W, H } = sc;
  const map = r3.mats && r3.mats.g3 && r3.mats.g3.map;
  if (!map || !map.image) return;
  const g = map.image.getContext('2d');
  const ch = (x, y) => (sc.rows[y] && sc.rows[y][x]) || null;
  const gk = (x, y) => WII_GK[ch(x, y)] || null;
  const N4 = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const N8 = [...N4, [1, 1], [1, -1], [-1, 1], [-1, -1]];
  // Lo que va debajo de una casilla sólida (edificio, letrero...): lo que más hay alrededor.
  const under = (x, y) => {
    const cnt = {};
    let best = null;
    N8.forEach(([dx, dy], i) => {
      const c = ch(x + dx, y + dy);
      const t = c && sc.tiles[c];
      if (!t || (t.solid && !WII_GK[c]) || WII_GK[c] === 'line') return;
      cnt[c] = (cnt[c] || 0) + (i < 4 ? 2 : 1);
      if (!best || cnt[c] > cnt[best]) best = c;
    });
    return best;
  };
  const dots = (px, py, x, y, col, n) => {
    g.fillStyle = col;
    for (let i = 0; i < n; i++) g.fillRect(px + Math.floor(T3Hash(x, y, 30 + i) * 15), py + Math.floor(T3Hash(x, y, 40 + i) * 15), 1, 1);
  };
  const paint = (kind, x, y) => {
    const px = x * 16;
    const py = y * 16;
    if (kind === 'grass') {
      g.fillStyle = ((x >> 1) + (y >> 1)) % 2 ? WII3.grass : WII3.grassL;
      g.fillRect(px, py, 16, 16);
      dots(px, py, x, y, WII3.grassD, 4);
    } else if (kind === 'path') {
      g.fillStyle = WII3.path;
      g.fillRect(px, py, 16, 16);
      g.fillStyle = WII3.pathSeam;
      g.fillRect(px, py, 16, 1);
      g.fillRect(px, py, 1, 16);
      g.fillStyle = WII3.pathEdge;
      N4.forEach(([dx, dy]) => {
        const c = ch(x + dx, y + dy);
        if (!c || gk(x + dx, y + dy) === 'path') return; // borde del mapa (salida) o más camino: sin orilla
        g.fillRect(px + (dx === 1 ? 14 : 0), py + (dy === 1 ? 14 : 0), dx ? 2 : 16, dy ? 2 : 16);
      });
    } else if (kind === 'pave') {
      g.fillStyle = WII3.pave;
      g.fillRect(px, py, 16, 16);
      g.fillStyle = WII3.paveSeam;
      g.fillRect(px, py, 16, 1);
      g.fillRect(px, py, 1, 16);
    } else if (kind === 'court') {
      g.fillStyle = (x + y) % 2 ? WII3.court : WII3.courtL;
      g.fillRect(px, py, 16, 16);
    } else if (kind === 'field') {
      g.fillStyle = WII3.field[x % 2];
      g.fillRect(px, py, 16, 16);
    } else if (kind === 'line') {
      // La raya blanca va hacia donde sigue la raya (o la red); sobre el verde de alrededor.
      let base = 'pave';
      N4.forEach(([dx, dy]) => { const k = gk(x + dx, y + dy); if (k === 'court' || k === 'field') base = k; });
      paint(base, x, y);
      const on = (dx, dy) => { const c = ch(x + dx, y + dy); return gk(x + dx, y + dy) === 'line' || c === 'n'; };
      const lr = on(-1, 0) || on(1, 0);
      const ud = on(0, -1) || on(0, 1);
      g.fillStyle = WII3.line;
      if (!lr && !ud) g.fillRect(px + 2, py + 2, 12, 12);
      if (lr) g.fillRect(on(-1, 0) ? px : px + 6, py + 6, on(-1, 0) && on(1, 0) ? 16 : 10, 4);
      if (ud) g.fillRect(px + 6, on(0, -1) ? py : py + 6, 4, on(0, -1) && on(0, 1) ? 16 : 10);
    }
  };
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const c = r3.cells[y] && r3.cells[y][x];
      if (!c || c.h < -10 || c.kind === 'water' || c.kind === 'bridge' || !c.native) continue;
      const k = gk(x, y);
      if (k) { paint(k, x, y); continue; }
      // Casillas con su propio dibujo: primero el suelo de alrededor (sin cuadros blancos), luego su sprite.
      const u = under(x, y);
      if (u && WII_GK[u]) paint(WII_GK[u], x, y);
      else if (u) { const t = sc.tiles[u]; paintSprite(g, t.s, x * 16, y * 16, 1, sc.tileCols(t.s, t, null)); }
      if (c.kind === 'ground' && !c.t.solid && c.t.s !== (sc.m.ground || 'grass')) paintSprite(g, c.t.s, x * 16, y * 16, 1, sc.tileCols(c.t.s, c.t, null));
    }
  }
  map.needsUpdate = true;
  if (r3.mats.g2 && r3.mats.g2.map) r3.mats.g2.map.needsUpdate = true;
}

// Luz de día limpio: menos "lavada" (antes todo se iba a blanco), con un lado en sombra suave.
function wiiLights(r3) {
  r3.v.scene.children.forEach((o) => {
    if (o.isHemisphereLight) { o.color.set('#FFFFFF'); o.groundColor.set('#9AB4CB'); o.intensity = 0.62; }
    else if (o.isDirectionalLight) { o.intensity = 0.6; o.position.set(-20, 60, 40); }
  });
  if (r3.v.scene.fog) r3.v.scene.fog.color.set('#D6EDFB');
}

// Cielo en degradado: azul fuerte arriba, clarito en el horizonte (como la pantalla de inicio).
function wiiSkyDome(r3) {
  const { W, H } = r3.sc;
  const R = 240;
  const geo = new THREE.SphereGeometry(R, 24, 14);
  const pos = geo.attributes.position;
  const top = new THREE.Color('#2A8FE4');
  const mid = new THREE.Color('#86CCF5');
  const hor = new THREE.Color('#D6EDFB');
  const cols = [];
  for (let i = 0; i < pos.count; i++) {
    const k = pos.getY(i) / R;
    const c = k <= 0 ? hor : k < 0.25 ? hor.clone().lerp(mid, k / 0.25) : mid.clone().lerp(top, Math.min(1, (k - 0.25) / 0.45));
    cols.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  const dome = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
  dome.position.set((W * T3S) / 2, 0, (H * T3S) / 2);
  dome.renderOrder = -1;
  r3.v.scene.add(dome);
  r3.v.scene.background = hor.clone();
}

// Fuera del mapa: pasto verde, arbolitos de bolita y lomas redondas a lo lejos (isla de deportes).
function wiiEdge(r3) {
  const { W, H } = r3.sc;
  const S = T3S;
  const MW = W * S;
  const MH = H * S;
  const R = 160;
  const flat = new T3Bake();
  [[-R, -R, MW + R, 0], [-R, MH, MW + R, MH + R], [-R, 0, 0, MH], [MW, 0, MW + R, MH]].forEach(([x0, z0, x1, z1]) => {
    flat.quad([x0, -0.02, z1], [x1, -0.02, z1], [x1, -0.02, z0], [x0, -0.02, z0], WII3.grassD);
  });
  const sm = new WiiBake();
  for (let i = 0; i < 44; i++) {
    const a = T3Hash(i, 7, 3) * Math.PI * 2;
    const d = 2 + T3Hash(i, 8, 3) * 14;
    const px = MW / 2 + Math.cos(a) * (MW / 2 + d * S * 0.6);
    const pz = MH / 2 + Math.sin(a) * (MH / 2 + d * S * 0.6);
    if (px > -1 && px < MW + 1 && pz > -1 && pz < MH + 1) continue;
    const s = 1 + T3Hash(i, 5, 3) * 0.6;
    sm.add(new THREE.CylinderGeometry(0.16 * s, 0.24 * s, 1.2 * s, 6, 1, true), T3M(px, 0.6 * s, pz), WII3.trunk);
    sm.add(new THREE.SphereGeometry(1.0 * s, 8, 5), T3M(px, 1.8 * s, pz, 1, 0.92, 1), WII3.leaf[i % 3]);
  }
  const far = Math.max(MW, MH) * 0.5;
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + T3Hash(i, 1, 4);
    const d = far + 55 + T3Hash(i, 2, 4) * 30;
    const r = 16 + T3Hash(i, 3, 4) * 14;
    sm.add(new THREE.SphereGeometry(r, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), T3M(MW / 2 + Math.cos(a) * d, -0.5, MH / 2 + Math.sin(a) * d, 1, 0.5, 1), i % 2 ? '#5DBE4A' : '#6FCB55');
  }
  [flat.mesh(r3.mats.vc), sm.mesh(r3.wiiSmMat)].forEach((m) => { if (m) r3.v.scene.add(m); });
}

// Matitas y flores redonditas (en vez de los conos verde oscuro de la N64).
function wiiPlants(r3, x, y, c, X, Z, band) {
  const b = wiiSm(band);
  const h = c.h;
  const j = (k) => T3Hash(x, y, k);
  if (c.t.tall || c.t.s === 'tall') {
    for (let i = 0; i < 6; i++) {
      b.add(new THREE.ConeGeometry(0.16, 0.7 + j(i) * 0.35, 6), T3M(X + (j(i + 1) - 0.5) * 1.5, h + 0.36, Z + (j(i + 2) - 0.5) * 1.5), WII3.tuft[i % 3]);
    }
    return;
  }
  for (let i = 0; i < 3; i++) {
    const fx = X + (j(i + 3) - 0.5) * 1.3;
    const fz = Z + (j(i + 4) - 0.5) * 1.3;
    b.add(new THREE.CylinderGeometry(0.035, 0.035, 0.42, 5), T3M(fx, h + 0.21, fz), WII3.tuft[1]);
    b.add(new THREE.SphereGeometry(0.17, 8, 6), T3M(fx, h + 0.48, fz, 1, 0.7, 1), WII3.flower[(x + y + i) % WII3.flower.length]);
    b.add(new THREE.SphereGeometry(0.07, 6, 4), T3M(fx, h + 0.56, fz), '#FFF3B0');
  }
}

// Se envuelven los métodos de Town3D (sin modificar town3d.js): fuera de la Ciudad Sensor todo sigue igual.
if (typeof Town3D !== 'undefined') {
  const P3 = Town3D.prototype;
  const baseBuild = P3.build;
  const baseProp = P3.prop;
  const baseBody = P3.body;
  const baseEdge = P3.edge;
  const baseAddEnt = P3.addEnt;
  P3.build = function (flat) {
    const z = wiiZone(this.sc);
    if (!z) return baseBuild.call(this, flat);
    wiiAdapt(this.v);
    // Wii = 480 líneas y bordes suaves (un escalón arriba de la N64; igual de nítida que la GameCube).
    this.v.renderer.setSize(640, 480, false);
    this.v.canvas.style.imageRendering = 'auto';
    this.v.canvas.classList.add('wii-hd');
    // Material liso y brillante para los modelos propios (plástico blanco de consola, no facetado).
    this.wiiSmMat = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 28, specular: 0x1c1c1c });
    // Sin montañas cafés (y sin nubes en el espacio): el cielo de la ciudad es limpio.
    const sky = Poly.sky;
    Poly.sky = function (v, o) { return sky.call(this, v, { ...o, mountains: 0, clouds: z.sky === 'space' ? 0 : 6, missing: 0 }); };
    try { baseBuild.call(this, flat); } finally { Poly.sky = sky; }
    this.bands.forEach((b) => {
      const m = b.wiiSm && b.wiiSm.mesh(this.wiiSmMat);
      if (m) b.grp.add(m);
      const sh = b.wiiSh && b.wiiSh.mesh(wiiShadowMat(this));
      if (sh) { sh.renderOrder = 1; b.grp.add(sh); }
    });
    wiiGround(this);
    if (z.sky !== 'space') {
      wiiLights(this);
      wiiSkyDome(this);
    }
    wiiSky(this, z);
    return undefined;
  };
  P3.prop = function (x, y, c, X, Z, band) {
    const f = c && c.native && c.t.w3 && WII_T3[c.t.w3];
    if (f) { f.call(this, x, y, c, X, Z, band); return; }
    if (c && c.native && c.kind === 'ground' && (c.t.tall || c.t.s === 'tall' || c.t.s === 'flower') && wiiZone(this.sc)) {
      wiiPlants(this, x, y, c, X, Z, band);
      return;
    }
    baseProp.call(this, x, y, c, X, Z, band);
  };
  P3.body = function (e) {
    return (wiiZone(this.sc) && wiiBody(this, e)) || baseBody.call(this, e);
  };
  // Cada personaje (y el héroe, y Bit, y los cofres) con su sombrita redonda debajo.
  P3.addEnt = function (e) {
    const r = baseAddEnt.call(this, e);
    if (!r || !wiiZone(this.sc)) return r;
    if (!this.wiiEntGeo) this.wiiEntGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
    const sh = new THREE.Mesh(this.wiiEntGeo, wiiShadowMat(this));
    const k = e.id === 'bit' ? 0.9 : e.kind === 'chest' ? 1.8 : e.big ? 2.8 : 1.8;
    sh.scale.set(k, 1, k);
    sh.position.y = 0.03;
    sh.renderOrder = 1;
    r.holder.add(sh);
    this.anims.push(() => { sh.visible = !r.sink; });
    return r;
  };
  P3.edge = function (gnd) {
    const z = wiiZone(this.sc);
    if (z && z.sky === 'space') return; // en el espacio no hay nubes abajo: solo estrellas (wiiSky)
    if (z) { wiiEdge(this); return; }
    baseEdge.call(this, gnd);
  };
}
