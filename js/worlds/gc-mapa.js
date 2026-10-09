// MUNDO 5 — Cubo Galáctico explorable, en 3D "plástico pulido" (docs/LORE.md §8.1-8.2).
// Se carga después de las escenas del Mundo 5 (js/scenes/gc3d.js ... correo.js) y de
// js/scenes/town3d.js, que es quien lo dibuja. Las casillas se juegan igual que siempre (flechas,
// casilla por casilla); `render: '3d'` hace que se vean con polígonos. Sin three.js: 2D con la
// paleta índigo de la GameCube.
//
//   ISLA CELESTE (30×20, mar)                 JARDIN BROTITOS (30×20)
//   ~~~~~~~~~~~~~~~~~~~ss.T.T.ss~~~            T.....F..O F..,,,,.F O..F...T
//   ~~~~~~~~~~~~~~~~~ss..::::::::: -> jardín   T..*.....O .^^^^^(cofre) O.,,,,..T
//   ~~~~~~~~~~~~~~~~~~s.:.S.p.ss~~             T.F......O .^^^^^::[CapBrotes]:::..T
//   ~~~~~~~~~~~~~~~~~~~~[Disquín] (puente)     ::::.....O ,,,,:,,,, O..:.....T
//   ~~~sH.ss~~~~~~~sss.:.ss~~                  T...:::::[Brotitos]::::  O..:.OOOOT
//   ~~s.p.:.===[Cubito]===::::,,.(cofre)s      T........O .....,,,. O..::[Sombra Tetro]:: -> pueblo
//   ~~~sS.:.ps~~~~~~ss...ss~~                  T........O .F....... O....OOOOT
//   ~~~~~sPs (tubería al pueblo)
//
//   PUEBLO DE BELLOTA (30×22)                 ESTACION VISOR (30×22, espacio)          ARENA FINAL (26×20)
//   T..T..*..T~~...*..,,...TTTTTTT            vvvvvvvvvvvvvvvvvvvvvbvvvv -> arena     vvvvvvvU1U2UUUU3U4Uvvv  figuritas
//   T.T.......~~.,,,....::[Sombra Cap]:: ->   vvvMMMMMMMMMMMMMMMMM[Casco]MMMMvvv      vvvvvvvUUUU[Guante]UUUUvvv
//   T..*......~~TTTTTTTT[Correo]TTTTTTTTT     vvvMKmmmmmmmmmK M AmmmmmmmAMvvv         vvvvvvvvvvvv/vvvvvvvvvvvv
//   T.RRR.....~~.RRR....:..RRRRR.T            vvvMmmmmmm[Sombra Nébula]mmmmmMvvv      vvvvYXXXXXXXXXXXXXXXXYvvvv
//   ::::::::::[Delfinito]::::::::..T          vvvMMM[Sombra de Cel]MMMMMMMMMMMMvvv     vvvvXSXXXXXXXXXXXXXXXXvvvv
//   T..WdW:...~~..~~~...*..WdW...T            vvvMmmmSmmmmmmmmmmmmmmm(cofre)Mvvv      vvvvYXXXXXXXXXXXXXXXXYvvvv
//   T..*....T.~~...WdW.....:...T.T            vvvMMMMMMMMMMM[Fantasmita]MMMMMMvvv      vvvvvvvvvvvv[Sombra Marco]
//                                             vvvMmmmm(Sonda)mmmSmmmmmmmmmmmMvvv      vvvvvvvvvvvvb <- estación
//                                             vvvvvvvvvvvvvvb <- pueblo
//
// Orden: Cubito → Disquín → Brotitos → Capitán Brotes → Copia de Tetro Rey → Delfinito → Correo de
// Bellota → Copia de Caparazón → Fantasmita → Sombra de Cel → Copia de Nébula → Casco Escáner →
// Copia de Marco → El Guante Crossover. (El mismo de `nodes` en gc.js; cada uno en un paso angosto.
// Las copias de sombra están en los pasos ENTRE zonas.)
//
// El 3D propio de la GameCube se agrega SIN tocar el motor: Town3D (js/scenes/town3d.js) se
// envuelve una sola vez aquí (prop/body/build) y solo cambia algo en los mapas de este mundo:
//   - modelos de casilla nuevos (d3: 'gcArbol', 'gcFlor', 'gcPanel'...) con brillo de plástico y
//     contorno negro tipo cel-shading;
//   - los enemigos con `model` se ven con sus modelos de js/scenes/gc3d.js (GC3.models);
//   - estrellas en las zonas del espacio, luz de contra lila y agua con reflejos.

const GC_FACTS = CONSOLES.find((c) => c.id === 'gamecube').facts;

// ---------- Tesoros nuevos (cofres) ----------
Object.assign(TREASURES, {
  memory_card_gc: { room: 'gc', name: 'Memory Card 59', desc: 'La tarjeta de memoria de la GameCube: 59 bloques para guardar partidas. Se metía al frente de la consola.' },
  dk_bongos: { room: 'gc', name: 'DK Bongos', desc: 'Dos tambores para jugar Donkey Konga (2003). Se tocaban con las manos... ¡y también aplaudiendo!' },
  wavebird: { room: 'gc', name: 'WaveBird', desc: 'El control inalámbrico de la GameCube (2002). Funcionaba por radio: no había que apuntarle a la consola.' },
});

// ---------- Sprites (suelos con colores fijos, vecinos y tesoros) ----------
const gcPalArt = (rows, pal) => Object.assign(rows.slice(), { pal });
const GC_GROUND = {
  gc_pasto: gcPalArt(SPRITES.grass, { a: '#5CC96A', b: '#8EE59A', c: '#2F8A3C', d: '#17162B' }),
  gc_camino: gcPalArt(SPRITES.path, { a: '#FFFFFF', b: '#ECEBF7', c: '#C8CBD6', d: '#8E86D9' }),
  gc_arena: gcPalArt(SPRITES.path, { a: '#FFF6D8', b: '#F5E6B8', c: '#D9C48E', d: '#8B5E3C' }),
  gc_piso: gcPalArt([
    'aaaaaaaaaaaaaaac',
    'abbbbbbbbbbbbbbc',
    'abdbbbbbbbbbbdbc',
    'abbbbbbbbbbbbbbc',
    'abbbbbbbbbbbbbbc',
    'abbbbbbbbbbbbbbc',
    'abbbbbbbbbbbbbbc',
    'abbbbbbaabbbbbbc',
    'abbbbbbaabbbbbbc',
    'abbbbbbbbbbbbbbc',
    'abbbbbbbbbbbbbbc',
    'abbbbbbbbbbbbbbc',
    'abbbbbbbbbbbbbbc',
    'abdbbbbbbbbbbdbc',
    'abbbbbbbbbbbbbbc',
    'cccccccccccccccc',
  ], { a: '#FFFFFF', b: '#C8CBD6', c: '#8E86D9', d: '#4B3F9E' }),
  gc_baldosa: gcPalArt([
    'aaaaaaaabbbbbbbb',
    'acccccccbddddddd',
    'acaaaaaabdbbbbbb',
    'acaaaaaabdbbbbbb',
    'acaaaaaabdbbbbbb',
    'acaaaaaabdbbbbbb',
    'acaaaaaabdbbbbbb',
    'acaaaaaabdbbbbbb',
    'bbbbbbbbaaaaaaaa',
    'bdddddddaccccccc',
    'bdbbbbbbacaaaaaa',
    'bdbbbbbbacaaaaaa',
    'bdbbbbbbacaaaaaa',
    'bdbbbbbbacaaaaaa',
    'bdbbbbbbacaaaaaa',
    'bdbbbbbbacaaaaaa',
  ], { a: '#8E86D9', b: '#4B3F9E', c: '#B9B3F0', d: '#6A5FC4' }),
};
Object.assign(SPRITES, GC_GROUND, {
  gc_marinera: gcArt([
    '................',
    '.....nnnnnn.....',
    '....nwwwwwwn....',
    '...nwwuuuuwwn...',
    '...nnnnnnnnnn...',
    '....nkeeeekn....',
    '....keneenek....',
    '....keeeeeek....',
    '.....kerrek.....',
    '....nwwuuwwn.y..',
    '...nwwwuuwwwnk..',
    '...enwwwwwwnek..',
    '....nuuuuuun.k..',
    '....nuunnuun....',
    '....neen.neen...',
    '....nnn...nnn...',
  ]),
  gc_pinon: gcArt([
    '................',
    '...n........n...',
    '...nkn....nkn...',
    '...nkknnnnkkn...',
    '..nkkkkkkkkkkn..',
    '..nkwwwkkwwwkn..',
    '..nkwnwkkwnwkn..',
    '..nkwwwkkwwwkn..',
    '..nkkkkyykkkkn..',
    '..nkeekkkkeekn..',
    '..nkeeeeeeeekn..',
    '..nkeeeeeeeekn..',
    '...nkeeeeeekn...',
    '....nkkkkkkn....',
    '.....yn..ny.....',
    '....yyn..nyy....',
  ]),
  gc_sonda: gcArt([
    '................',
    '.......yy.......',
    '.......nn.......',
    '....nnnnnnnn....',
    '...nppppppwpn...',
    '...npllllllpn...',
    '...nplsllslpn...',
    '...npllllllpn...',
    '...nppppppppn...',
    '..nnppnnnnppnn..',
    '.npnppppppppnpn.',
    '.nn.nppppppn.nn.',
    '.....nppppn.....',
    '......nssn......',
    '.......ss.......',
    '................',
  ]),
  memory_card_gc: gcArt([
    '................',
    '................',
    '....nnnnnnnn....',
    '....nppppppn....',
    '....npwppppn....',
    '....nppppppn....',
    '....npiiiipn....',
    '....npillipn....',
    '....npiiiipn....',
    '....nppppppn....',
    '....nppppppn....',
    '....nnnnnnnn....',
    '.....nynyny.....',
    '................',
    '................',
    '................',
  ]),
  wavebird: gcArt([
    '................',
    '.......nn.......',
    '......npwn......',
    '..nnnnnppnnnnn..',
    '.nppppppppppppn.',
    '.npnnpppppgpppn.',
    '.npnnppppgggppn.',
    '.nppppppppgpppn.',
    '.npppnnppppyppn.',
    '.nppppppppppppn.',
    '..nppnnnnnnppn..',
    '..npn......npn..',
    '..nn........nn..',
    '................',
    '................',
    '................',
  ]),
  dk_bongos: gcArt([
    '................',
    '................',
    '...nnnn..nnnn...',
    '..neeeenneeeen..',
    '..nweeennweeen..',
    '..nnnnnnnnnnnn..',
    '..nkkkknnkkkkn..',
    '..nkyyknnkyykn..',
    '..nkkkknnkkkkn..',
    '..nkyyknnkyykn..',
    '..nkkkknnkkkkn..',
    '...nkkn..nkkn...',
    '....nn....nn....',
    '.....nnnnnn.....',
    '................',
    '................',
  ]),
});

// ---------- Música ORIGINAL de las zonas (todas las voces de cada pista suman los mismos pasos) ----------
// Isla Celeste: Fa mayor en 3/4 (vals marinero, como dirigir el viento con batuta). 96 pasos.
TRACKS.gc_celeste = {
  bpm: 132,
  voices: [
    {
      wave: 'square', vol: 0.026,
      notes: 'C5/4 F5/4 A5/4 G5/6 F5/2 E5/4 D5/4 G5/4 A#5/4 A5/8 -/4 ' +
        'C6/4 A5/4 F5/4 G5/6 A5/2 G5/4 E5/4 C5/4 E5/4 F5/8 -/4',
    },
    { wave: 'triangle', vol: 0.1, notes: 'F2/4 C3/4 C3/4 C2/4 G2/4 G2/4 A#1/4 F2/4 F2/4 F2/4 C3/4 C3/4 F2/4 A2/4 A2/4 C2/4 G2/4 G2/4 C2/4 G2/4 G2/4 F2/4 C3/4 C3/4' },
    { wave: 'sine', vol: 0.02, notes: rep('-/4 A6/1 -/3 C7/1 -/3', 8) },
    { wave: 'noise', vol: 0.018, notes: rep('x/4 -/2 x/2 -/2 x/2', 8) },
  ],
};
// Pueblo de Bellota: Re mayor, tranquila, de pueblito con buzones. 64 pasos.
TRACKS.gc_bellota = {
  bpm: 112,
  voices: [
    {
      wave: 'square', vol: 0.024,
      notes: 'F#5/2 A5/2 B5/2 A5/2 F#5/4 D5/4 E5/2 F#5/2 G5/2 E5/2 A5/8 ' +
        'G5/2 B5/2 D6/2 B5/2 A5/4 F#5/4 E5/2 D5/2 E5/2 C#5/2 D5/8',
    },
    { wave: 'triangle', vol: 0.1, notes: 'D3/4 A2/4 D3/4 A2/4 G2/4 D3/4 A2/4 E3/4 G2/4 D3/4 G2/4 D3/4 A2/4 E3/4 D3/8' },
    { wave: 'sine', vol: 0.02, legato: 1, notes: 'D4/16 E4/16 G4/16 F#4/16' },
    { wave: 'noise', vol: 0.016, notes: rep('x/2 -/2 x/1 x/1 -/2', 8) },
  ],
};
// Arena Final: Mi menor, tensa, antes del torneo. 64 pasos.
TRACKS.gc_arena = {
  bpm: 140,
  voices: [
    {
      wave: 'square', vol: 0.026,
      notes: 'E5/4 -/2 E5/2 G5/4 F#5/4 E5/2 D5/2 B4/4 -/8 ' +
        'C5/4 -/2 C5/2 E5/4 D5/4 C5/2 B4/2 E5/8 -/4',
    },
    { wave: 'triangle', vol: 0.11, notes: `${rep('E2/2 E3/2', 8)} ${rep('C2/2 C3/2', 4)} ${rep('D2/2 D3/2', 4)}` },
    { wave: 'sine', vol: 0.022, legato: 1, notes: 'E4/16 E4/16 C4/16 D4/16' },
    { wave: 'noise', vol: 0.024, notes: rep('x/2 -/2 x/2 x/2', 8) },
  ],
};

// ---------- Casillas (sprite 2D + colores para el modo clásico; d3/h para el 3D) ----------
const gcT = (s, colors, extra = {}) => ({ s, ...(colors ? { colors } : {}), ...extra });
const GC_TILE_COLS = {
  tall: { a: '#5CC96A', b: '#8EE59A', c: '#2F8A3C', d: '#17162B' },
  flower: { a: '#5CC96A', b: '#F5D547', c: '#2F8A3C', d: '#E04B4B' },
  water: { a: '#FFFFFF', b: '#7EC8FF', c: '#2B9EDB', d: '#17162B' },
  space: { a: '#8E86D9', b: '#2D2566', c: '#4B3F9E', d: '#17162B' },
  wood: { a: '#F5E6B8', b: '#C9A66B', c: '#8B5E3C', d: '#17162B' },
  metal: { a: '#FFFFFF', b: '#C8CBD6', c: '#8E86D9', d: '#17162B' },
  tree: { a: '#FFFFFF', b: '#8EE59A', c: '#2F8A3C', d: '#17162B' },
  palm: { a: '#F5D547', b: '#8EE59A', c: '#8B5E3C', d: '#17162B' },
  sign: { a: '#FFFFFF', b: '#F5D547', c: '#4B3F9E', d: '#17162B' },
  pipe: { a: '#FFFFFF', b: '#8E86D9', c: '#4B3F9E', d: '#17162B' },
  roof: { a: '#FFFFFF', b: '#F28C28', c: '#E04B4B', d: '#17162B' },
  wall: { a: '#FFFFFF', b: '#ECEBF7', c: '#8E86D9', d: '#17162B' },
  door: { a: '#F5D547', b: '#F28C28', c: '#4B3F9E', d: '#17162B' },
  crystal: { a: '#FFFFFF', b: '#B9B3F0', c: '#8E86D9', d: '#2D2566' },
  red: { a: '#FFFFFF', b: '#F28C28', c: '#E04B4B', d: '#17162B' },
  gold: { a: '#FFFFFF', b: '#F5D547', c: '#8E86D9', d: '#17162B' },
};
const GC_TILES = {
  '.': gcT('gc_pasto'),
  ',': gcT('tall', GC_TILE_COLS.tall, { tall: true }),
  ':': gcT('gc_camino'),
  s: gcT('gc_arena'),
  '*': gcT('flower', GC_TILE_COLS.flower, { under: 'gc_pasto' }),
  '~': gcT('water', GC_TILE_COLS.water, { solid: true, look: 'agua' }),
  '=': gcT('s16_puente', GC_TILE_COLS.wood, { d3: 'bridge' }),
  b: gcT('s16_puente', GC_TILE_COLS.metal, { d3: 'bridge', over: 'void' }),
  v: gcT('water', GC_TILE_COLS.space, { solid: true, d3: 'void', look: 'vacio' }),
  T: gcT('tree', GC_TILE_COLS.tree, { solid: true, d3: 'gcArbol', look: 'arbol' }),
  p: gcT('tree', GC_TILE_COLS.palm, { solid: true, d3: 'palm', look: 'palma', under: 'gc_arena' }),
  S: gcT('sign', GC_TILE_COLS.sign, { solid: true }),
  P: gcT('pipe', GC_TILE_COLS.pipe, { c3: '#4B3F9E' }),
  H: gcT('wall', GC_TILE_COLS.red, { solid: true, d3: 'gcFaro', look: 'faro' }),
  O: gcT('tree', GC_TILE_COLS.tree, { solid: true, d3: 'gcArbusto', look: 'seto' }),
  F: gcT('flower', GC_TILE_COLS.flower, { solid: true, d3: 'gcFlor', look: 'florGigante', under: 'gc_pasto' }),
  '^': gcT('gc_pasto', null, { h: 1.2, c3s: '#8E86D9' }),
  '/': gcT('gc_camino', null, { h: 0.6, c3s: '#8E86D9' }),
  R: gcT('roof', GC_TILE_COLS.roof, { solid: true }),
  W: gcT('wall', GC_TILE_COLS.wall, { solid: true }),
  d: gcT('door', GC_TILE_COLS.door, { solid: true, look: 'casa' }),
  L: gcT('sign', GC_TILE_COLS.gold, { solid: true, d3: 'gcFarol', look: 'farol' }),
  B: gcT('sign', GC_TILE_COLS.red, { solid: true, d3: 'gcBuzon', look: 'buzon' }),
  M: gcT('wall', GC_TILE_COLS.metal, { solid: true, d3: 'gcPanel', bh: 1.5, look: 'panel' }),
  m: gcT('gc_piso', null, { c3s: '#8E86D9' }),
  K: gcT('rock', GC_TILE_COLS.crystal, { solid: true, d3: 'gcCristal', look: 'cristal', under: 'gc_piso' }),
  A: gcT('sign', GC_TILE_COLS.metal, { solid: true, d3: 'gcAntena', look: 'antena', under: 'gc_piso' }),
  X: gcT('gc_baldosa', null, { c3s: '#4B3F9E' }),
  U: gcT('gc_baldosa', null, { h: 1.0, c3s: '#2D2566' }),
  Y: gcT('rock', GC_TILE_COLS.metal, { solid: true, d3: 'gcPoste', look: 'poste', under: 'gc_baldosa' }),
  1: gcT('rock', GC_TILE_COLS.gold, { solid: true, d3: 'gcFigura', fig: 'tetro', look: 'figTetro', under: 'gc_baldosa', h: 1.0 }),
  2: gcT('rock', GC_TILE_COLS.gold, { solid: true, d3: 'gcFigura', fig: 'caparazon', look: 'figCaparazon', under: 'gc_baldosa', h: 1.0 }),
  3: gcT('rock', GC_TILE_COLS.gold, { solid: true, d3: 'gcFigura', fig: 'nebula', look: 'figNebula', under: 'gc_baldosa', h: 1.0 }),
  4: gcT('rock', GC_TILE_COLS.gold, { solid: true, d3: 'gcFigura', fig: 'marco', look: 'figMarco', under: 'gc_baldosa', h: 1.0 }),
};

const GC_LOOKS = {
  agua: '* Agua azul que brilla como plástico recién lavado.\n* Si te asomas, te ves reflejado. ¡Con todo y brillito!',
  vacio: '* Abajo hay estrellas. Y más abajo, más estrellas.\n* El cubo flota en medio del espacio. Mejor no te asomes.',
  arbol: '* Un árbol redondito con contorno negro, como de caricatura.\n* Parece dibujado con plumón.',
  palma: '* Una palmera que brilla un poquito.\n* Hasta los cocos tienen su puntito de luz.',
  faro: '* El faro de la Isla Celeste.\n* Su luz gira y gira. Como un disco de 8 cm.',
  seto: '* Un seto altísimo... o tú eres chiquito.\n* Desde aquí abajo, todo el jardín se ve gigante.',
  florGigante: '* Una flor más alta que tú.\n* Huele a dulce. Los Brotitos duermen la siesta debajo.',
  casa: '* Una casita con la puerta cerrada.\n* Adentro se oye a alguien escribiendo una carta.',
  farol: '* Un farol del pueblo. De noche se prende solo.\n* Bueno, cuando el reloj de la consola dice que es de noche.',
  buzon: '* Un buzón rojo del Pueblo de Bellota.\n* Está vacío. Esperando cartas con mayúsculas y puntos.',
  panel: '* Un panel plateado de la Estación Visor.\n* Tiene una lucecita que hace "bip" cada tres segundos.',
  cristal: '* Un cristal lila que zumba bajito.\n* Por dentro se ven letras moviéndose. ¿Datos?',
  antena: '* Una antena que apunta a las estrellas.\n* Está escuchando algo... o a alguien.',
  poste: '* Un poste del borde de la Arena.\n* Más allá solo hay espacio. Muy, muy grande.',
  figTetro: '* Una figurita de Tetro Rey en su pedestal.\n* "Edición de colección. No se juega con ella." ...Se ve triste.',
  figCaparazon: '* Una figurita de Lord Caparazón.\n* Alguien le quitó la corona y la pegó al revés.',
  figNebula: '* Una figurita de Reina Nébula.\n* Sus medusitas están pintadas, pero parece que quieren moverse.',
  figMarco: '* Una figurita de Marco, con su marco dorado.\n* Adentro del cuadro no hay nadie.',
};

// ---------- Modelos 3D de casilla (estilo GameCube: plástico brillante y contorno de caricatura) ----------
// Se juntan en dos mallas por mapa: una brillante (Phong) y una de contornos (caras de atrás en negro).
function gcPut(r3, geo, m, color, line = 1.08) {
  const k = r3.gcK || (r3.gcK = { shiny: new T3Bake(), line: new T3Bake() });
  if (line) k.line.add(geo.clone(), m.clone().multiply(new THREE.Matrix4().makeScale(line, line, line)), GCC.black);
  k.shiny.add(geo, m, color);
}

const GC_PROPS = {
  gcArbol(r3, x, y, c, X, Z) {
    const h = c.h;
    const j = (k) => T3Hash(x, y, k);
    const ox = (j(1) - 0.5) * 0.4;
    const oz = (j(2) - 0.5) * 0.4;
    gcPut(r3, new THREE.CylinderGeometry(0.22, 0.3, 1.4, 6), T3M(X + ox, h + 0.7, Z + oz), GCC.brown, 0);
    // Los del borde del mapa (casi todos) van más sencillos: así el mapa entero se dibuja fluido.
    const edge = x === 0 || y === 0 || x === r3.sc.W - 1 || y === r3.sc.H - 1;
    gcPut(r3, new THREE.IcosahedronGeometry(1.0, edge ? 0 : 1), T3M(X + ox, h + 2.0, Z + oz, 1, 0.85, 1, j(3) * 3), j(4) < 0.5 ? '#3BB54A' : '#4CC85A', 1.07);
    if (!edge) gcPut(r3, new THREE.IcosahedronGeometry(0.55, 0), T3M(X + ox + 0.4, h + 2.6, Z + oz + 0.25), '#7BE08A', 1.1);
  },
  gcArbusto(r3, x, y, c, X, Z) {
    const h = c.h;
    const j = (k) => T3Hash(x, y, k);
    gcPut(r3, new THREE.IcosahedronGeometry(1.05, 1), T3M(X, h + 0.95, Z, 1, 0.95, 1, j(1) * 3), j(2) < 0.5 ? '#2F9E44' : '#38A84D', 1.05);
    if (j(3) < 0.35) gcPut(r3, new THREE.IcosahedronGeometry(0.18, 0), T3M(X + 0.5, h + 1.7, Z + 0.6), [GCC.yellow, GCC.red, GCC.white][Math.floor(j(4) * 3)], 0);
  },
  gcFlor(r3, x, y, c, X, Z) {
    const h = c.h;
    const j = (k) => T3Hash(x, y, k);
    const petal = [GCC.red, GCC.water, GCC.yellow, GCC.white, GCC.orange][Math.floor(j(1) * 5)];
    gcPut(r3, new THREE.CylinderGeometry(0.1, 0.14, 2.2, 6), T3M(X, h + 1.1, Z), '#2F8A3C', 1.15);
    gcPut(r3, new THREE.IcosahedronGeometry(0.3, 0), T3M(X + 0.3, h + 0.8, Z, 1.8, 0.25, 0.8, 0.4), '#3BB54A', 0);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + j(2);
      gcPut(r3, new THREE.IcosahedronGeometry(0.4, 0), T3M(X + Math.cos(a) * 0.55, h + 2.35, Z + Math.sin(a) * 0.55, 1, 0.4, 1, a), petal, 1.1);
    }
    gcPut(r3, new THREE.IcosahedronGeometry(0.32, 1), T3M(X, h + 2.45, Z), GCC.yellow, 1.12);
  },
  gcFaro(r3, x, y, c, X, Z) {
    const h = c.h;
    gcPut(r3, new THREE.CylinderGeometry(0.72, 0.95, 4.2, 12), T3M(X, h + 2.1, Z), GCC.white, 1.05);
    [1.2, 2.7].forEach((yy) => gcPut(r3, new THREE.CylinderGeometry(0.86, 0.9, 0.5, 12), T3M(X, h + yy, Z), GCC.red, 0));
    gcPut(r3, new THREE.CylinderGeometry(0.55, 0.55, 0.7, 8), T3M(X, h + 4.55, Z), GCC.sky, 1.08);
    gcPut(r3, new THREE.ConeGeometry(0.75, 0.75, 8), T3M(X, h + 5.27, Z), GCC.red, 1.08);
  },
  gcFarol(r3, x, y, c, X, Z) {
    const h = c.h;
    gcPut(r3, new THREE.CylinderGeometry(0.08, 0.12, 2.2, 6), T3M(X, h + 1.1, Z), GCC.indigoD, 1.2);
    gcPut(r3, new THREE.IcosahedronGeometry(0.32, 1), T3M(X, h + 2.35, Z), GCC.yellow, 1.12);
    gcPut(r3, new THREE.ConeGeometry(0.38, 0.3, 8), T3M(X, h + 2.75, Z), GCC.indigo, 1.1);
  },
  gcBuzon(r3, x, y, c, X, Z) {
    const h = c.h;
    gcPut(r3, new THREE.BoxGeometry(0.18, 1.0, 0.18), T3M(X, h + 0.5, Z), GCC.brown, 0);
    gcPut(r3, new THREE.BoxGeometry(0.6, 0.5, 0.85), T3M(X, h + 1.2, Z), GCC.red, 1.08);
    gcPut(r3, new THREE.BoxGeometry(0.06, 0.38, 0.16), T3M(X + 0.34, h + 1.4, Z - 0.2), GCC.yellow, 0);
  },
  gcPanel(r3, x, y, c, X, Z) {
    const h = c.h;
    const S = T3S;
    const bh = c.t.bh || 1.5;
    gcPut(r3, new THREE.BoxGeometry(S, bh, S), T3M(X, h + bh / 2, Z), GCC.silver, 1.02);
    gcPut(r3, new THREE.BoxGeometry(S * 1.03, 0.24, S * 1.03), T3M(X, h + bh - 0.3, Z), GCC.indigo, 0);
    if ((x + y) % 2) gcPut(r3, new THREE.BoxGeometry(S * 1.05, 0.16, 0.3), T3M(X, h + bh * 0.42, Z), GCC.sky, 0);
  },
  gcCristal(r3, x, y, c, X, Z) {
    const h = c.h;
    const j = (k) => T3Hash(x, y, k);
    gcPut(r3, new THREE.OctahedronGeometry(0.75, 0), T3M(X, h + 1.45, Z, 0.8, 1.9, 0.8, j(1) * 3), GCC.lila, 1.08);
    gcPut(r3, new THREE.OctahedronGeometry(0.35, 0), T3M(X + 0.6, h + 0.6, Z + 0.4, 0.8, 1.6, 0.8, j(2) * 3), GCC.sky, 1.1);
  },
  gcAntena(r3, x, y, c, X, Z) {
    const h = c.h;
    gcPut(r3, new THREE.CylinderGeometry(0.09, 0.14, 2.6, 6), T3M(X, h + 1.3, Z), GCC.silver, 1.15);
    gcPut(r3, new THREE.SphereGeometry(0.75, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), T3M(X, h + 2.5, Z, 1, 1, 1, 0, -0.7), GCC.white, 1.06);
    gcPut(r3, new THREE.IcosahedronGeometry(0.14, 0), T3M(X, h + 2.95, Z - 0.2), GCC.red, 0);
  },
  gcPoste(r3, x, y, c, X, Z) {
    const h = c.h;
    gcPut(r3, new THREE.CylinderGeometry(0.3, 0.4, 1.0, 10), T3M(X, h + 0.5, Z), GCC.silver, 1.06);
    gcPut(r3, new THREE.IcosahedronGeometry(0.32, 1), T3M(X, h + 1.25, Z), GCC.yellow, 1.1);
  },
  gcFigura(r3, x, y, c, X, Z, band) {
    const h = c.h;
    gcPut(r3, new THREE.CylinderGeometry(0.72, 0.85, 0.9, 12), T3M(X, h + 0.45, Z), GCC.lila, 1.05);
    gcPut(r3, new THREE.CylinderGeometry(0.8, 0.8, 0.12, 12), T3M(X, h + 0.96, Z), GCC.yellow, 0);
    const v = r3.v;
    v.gcMats = v.gcMats || {};
    const fig = GC3.models.figurita(v, c.t.fig || 'tetro');
    fig.position.set(X, h + 1.75, Z);
    fig.scale.setScalar(1.1);
    band.grp.add(fig);
    r3.anims.push((dt, t) => { fig.rotation.y = t * 0.8 + x; });
  },
};

// ---------- Enganches con el renderer 3D (una sola vez, solo para los mapas de este mundo) ----------
const gcIsZone = (sc) => !!(sc && sc.m && sc.m.world === 'gc' && sc.m.render === '3d');

// Modelo de gc3d.js para un personaje del mapa (o null = el renderer decide).
function gcModelKey(e) {
  if (e.kind !== 'foe' || typeof GC3 === 'undefined') return null;
  const def = ENEMIES[e.enemy];
  if (def && def.model && GC3.models[def.model]) return def.model;
  if (e.enemy === 'guante') return 'guante';
  return null;
}

function gcDress(r3) {
  const v = r3.v;
  const { W, H } = r3.sc;
  // Mallas de los modelos propios: plástico brillante y contornos de caricatura.
  if (r3.gcK) {
    const shiny = r3.gcK.shiny.mesh(new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 60, specular: 0x666677 }));
    const line = r3.gcK.line.mesh(new THREE.MeshBasicMaterial({ color: GCC.black, side: THREE.BackSide }));
    if (shiny) v.scene.add(shiny);
    if (line) v.scene.add(line);
    r3.gcK = null;
  }
  // Todo lo demás también brilla un poquito (plástico pulido).
  r3.mats.vc.shininess = 28;
  r3.mats.vc.specular = new THREE.Color(0x333344);
  // Luz de contra lila, como en las batallas de gc3d.js.
  const rim = new THREE.DirectionalLight(GCC.lila, 0.4);
  rim.position.set(-20, 12, -25);
  v.scene.add(rim);
  // Agua con reflejos.
  if (r3.waterMesh) {
    const old = r3.waterMesh.material;
    r3.waterMesh.material = new THREE.MeshPhongMaterial({ color: GCC.water, transparent: true, opacity: 0.74, shininess: 90, specular: 0xffffff, depthWrite: false });
    if (old) old.dispose();
  }
  // En el espacio: estrellas alrededor de todo el mapa.
  if (r3.opt.gcSpace) {
    const pos = [];
    const R = Math.max(W, H) * T3S + 80;
    for (let i = 0; i < 320; i++) {
      const a = T3Hash(i, 1, 7) * Math.PI * 2;
      const b = Math.acos(T3Hash(i, 2, 7) * 2 - 1);
      pos.push((W * T3S) / 2 + Math.sin(b) * Math.cos(a) * R, Math.cos(b) * R * 0.8, (H * T3S) / 2 + Math.sin(b) * Math.sin(a) * R);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    v.scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, sizeAttenuation: false, fog: false })));
  }
}

if (typeof Town3D !== 'undefined' && !Town3D.gcHooked) {
  Town3D.gcHooked = true;
  const P = Town3D.prototype;
  const prop0 = P.prop;
  const body0 = P.body;
  const build0 = P.build;

  P.prop = function gcProp(x, y, c, X, Z, band) {
    const f = c && c.native && GC_PROPS[c.kind];
    if (f) { f(this, x, y, c, X, Z, band); return; }
    prop0.call(this, x, y, c, X, Z, band);
  };

  P.body = function gcBody(e) {
    const key = gcIsZone(this.sc) && e.id !== 'player' && e.kind !== 'chest' ? gcModelKey(e) : null;
    if (!key) return body0.call(this, e);
    const v = this.v;
    v.gcMats = v.gcMats || {};
    const o = GC3.models[key](v);
    // Igual que Town3D.body: tamaño parejo y los pies en el suelo.
    const wrap = new THREE.Group();
    const lift = new THREE.Group();
    lift.add(o);
    wrap.add(lift);
    const box = new THREE.Box3().setFromObject(o);
    const size = box.max.y - box.min.y || 1;
    const s = Math.max(0.35, Math.min(1.3, (e.big ? 3.4 : 2.2) / size));
    lift.scale.setScalar(s);
    lift.position.y = -box.min.y * s;
    return { o: wrap, model: o };
  };

  P.build = function gcBuild(flat) {
    const gc = gcIsZone(this.sc);
    const sky0 = Poly.sky;
    // En el espacio no hay montañas ni nubes en el cielo: solo estrellas (gcDress).
    if (gc && this.opt.gcSpace) Poly.sky = (v, o) => sky0.call(Poly, v, { ...o, mountains: 0, clouds: 0, missing: 0 });
    try { build0.call(this, flat); } finally { Poly.sky = sky0; }
    if (gc) gcDress(this);
  };
}

// ---------- Personajes del mundo ----------
const GC_NPC_MARINERA = {
  id: 'gc-marinera', sprite: 'gc_marinera', x: 4, y: 12,
  async talk(ctx) {
    if (!ctx.flag('gcMarinera')) {
      ctx.setFlag('gcMarinera');
      await ctx.say([
        '* ¡Ahoy! Soy la CAPITANA RAFAGA. Mi barco se quedó sin viento...\n* ...desde que llegó esa sombra morada.',
        '* Antes yo dirigía el viento con una batuta: un, dos, tres. Un, dos, tres.\n* Así se navega en tres por cuatro.',
        '* Para cruzar al norte tendrás que usar los puentes.\n* Y en los puentes hay cosas que ruedan. Y que giran.',
      ], 'CAPITANA RAFAGA');
      return;
    }
    const lines = [
      ['* En un juego de esta consola, un niño cruzaba el mar con una batuta mágica.\n* Movía la batuta y el viento cambiaba de dirección.', '* Se llamaba The Wind Waker (2002). ¡Y el barco hablaba!\n* Sí. El BARCO.'],
      ['* Ese juego se veía como una caricatura: contornos negros y colores planos.\n* A eso le dicen cel-shading. Como los árboles de esta isla.'],
      ['* Cuando el Glitch se vaya, te enseño a dirigir el viento.\n* Norte, sur, este... ¡en tres tiempos!'],
    ];
    await ctx.say(lines[ctx.counter('gcMarinera') % lines.length], 'CAPITANA RAFAGA');
  },
};

const GC_NPC_PINON = {
  id: 'gc-pinon', sprite: 'gc_pinon', x: 17, y: 13,
  async talk(ctx) {
    if (!ctx.flag('gcPinon')) {
      ctx.setFlag('gcPinon');
      await ctx.say([
        '* Uuuh... ¿Es de día? Yo soy PIÑON. Duermo de día y leo de noche.',
        Save.data.done.correo
          ? '* Me llegó una carta tuya. Con mayúsculas y puntos. Uuuh.\n* La leí tres veces. Es mi favorita.'
          : '* La alcaldesa busca cartero. Está en la puerta de arriba.\n* Si me escribes una carta, prometo contestarla. De noche.',
      ], 'PIÑON');
      return;
    }
    const lines = [
      ['* En Animal Crossing (2001) el pueblo usaba el reloj de la consola.\n* Si en tu casa era de noche, en el juego también. Uuuh.'],
      ['* En ese juego había fiestas en las fechas de verdad.\n* Y si no jugabas en mucho tiempo... crecía hierba en tu pueblo.'],
      ['* Las partidas de esta consola se guardaban en una Memory Card.\n* Un pueblo entero, en una tarjetita. Qué maravilla.'],
    ];
    await ctx.say(lines[ctx.counter('gcPinon') % lines.length], 'PIÑON');
  },
};

const GC_NPC_SONDA = {
  id: 'gc-sonda', sprite: 'gc_sonda', x: 8, y: 17,
  async talk(ctx) {
    if (Save.data.done.casco) {
      await ctx.say([
        '* BIP. El Casco ya no escanea a nadie sin permiso.\n* BIP. Gracias por enseñarle modales.',
        '* BIP... Tu amigo flotante salió muy callado del laboratorio.\n* Recomendación: hablar con él. Sin escanearlo.',
      ], 'SONDA V-1');
      return;
    }
    if (!ctx.flag('gcSonda')) {
      ctx.setFlag('gcSonda');
      await ctx.say([
        '* BIP. Soy SONDA V-1, robot de mantenimiento de la Estación Visor.',
        '* El CASCO ESCANER se volvió loco. Escanea todo lo que se mueve.\n* BIP. También lo que no se mueve.',
        '* Está hasta arriba, en el laboratorio. Cuidado: de camino hay sombras.',
      ], 'SONDA V-1');
      return;
    }
    const lines = [
      ['* BIP. Dato: el procesador de esta consola se llamaba "Gekko".\n* Iba a 485 megahercios. Lo hizo IBM.'],
      ['* BIP. Dato: su chip de gráficos se llamaba "Flipper".\n* Gekko y Flipper. Un geco y un delfín. ¡Puro animalito!'],
      ['* BIP. Dato: el nombre secreto de la consola era "Dolphin".\n* Por eso hay tantos delfines en el Cubo Galáctico.'],
    ];
    await ctx.say(lines[ctx.counter('gcSonda') % lines.length], 'SONDA V-1');
  },
};

addMaps('gc', {
  entry: { map: 'gc-celeste', spawn: [6, 16, 'up'] },
  maps: {
    'gc-celeste': {
      name: 'Isla Celeste',
      render: '3d',
      view3d: { edge: 'sea', sky: '#7EC8FF', fogColor: '#CFE6FF', fog: [26, 80] },
      intro: [
        '* ¡Whoa! ¡Todo BRILLA! El agua, las palmeras... ¡hasta yo brillo!',
        '* Esto es el CUBO GALACTICO: una isla con forma de cubo que flota en el espacio.\n* Cada cara del cubo es una zona distinta.',
        '* Dicen que el Glitch invocó COPIAS de los jefes que ya vencimos.\n* Copias de sombra. Magenta. Con estática.',
        '* Aquí se escriben FRASES COMPLETAS: mayúsculas, comas y puntos.\n* ¡Meñique listo para el SHIFT!',
      ],
      music: 'gc_celeste',
      ground: 'gc_arena',
      map: [
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
        '~~~~~~~~~~~~~~~~~~~sssssss~~~~',
        '~~~~~~~~~~~~~~~~~~ss.T.T.ss~~~',
        '~~~~~~~~~~~~~~~~~ss..:::::::::',
        '~~~~~~~~~~~~~~~~~sT.:..T...ss~',
        '~~~~~~~~~~~~~~~~~~s.:.S.p.ss~~',
        '~~~~~~~~~~~~~~~~~~~~=~~~~~~~~~',
        '~~~~~~~~~~~~~~~~~~~~=~~~~~~~~~',
        '~~~~ssss~~~~~~~~~~~~=~~~~~~~~~',
        '~~~s.H.ss~~~~~~~sss.:.ss~~~~~~',
        '~~~s..:.s~~~~~~s....:..*ss~~~~',
        '~~s.p.:..s~~~~~s.T,,:,...s~~~~',
        '~~s...::::=====::::::,,...s~~~',
        '~~s*..:..s~~~~~s.,,..,T.ss~~~~',
        '~~~sS.:.ps~~~~~~ss...ss~~~~~~~',
        '~~~s..:.s~~~~~~~~ssss~~~~~~~~~',
        '~~~~ss:ss~~~~~~~~~~~~~~~~~~~~~',
        '~~~~~sPs~~~~~~~~~~~~~~~~~~~~~~',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      ],
      tiles: GC_TILES,
      spawns: { start: [6, 16, 'up'] },
      exits: {
        '6,17': { pueblo: 'gc' },
        '29,3': { map: 'gc-jardin', spawn: [1, 10, 'right'] },
      },
      encounters: [
        { enemy: 'cubito', x: 12, y: 12, say: ['* ¡Clic, clic! ¡Alto! Este puente es MIO.\n* Bueno, nuestro. Si me cargas de la manija, es nuestro.'] },
        { enemy: 'disquin', x: 20, y: 7, say: ['* ¡No puedo parar de girar! ¡El puente gira! ¡El mar gira!\n* ...Ah, no. Soy yo.'] },
      ],
      chests: [
        { id: 'gc_mcard', x: 25, y: 12, treasure: 'memory_card_gc', word: 'bloques' },
      ],
      wild: ['cubito', 'disquin'],
      signs: {
        '4,14': ['* ISLA CELESTE\n* (Tubería al Pueblo Vitrina, al sur.)', '* La GameCube salió en Japón el 14 de septiembre de 2001.', `* ${GC_FACTS[0]}`],
        '22,5': ['* MUELLE NORTE\n* Al este: JARDIN BROTITOS. Cuidado con los gigantes.', `* ${GC_FACTS[2]}`],
      },
      looks: GC_LOOKS,
      bitTips: [
        '* ¡Mira el agua! Brilla como si la acabaran de pulir.',
        '* ¿Sabías que el nombre secreto de este cubo era "Dolphin"?\n* Por eso hay tantos delfines por aquí.',
        '* Los árboles tienen contorno negro. ¡Parecen dibujados con plumón!',
        '* En el pasto alto de la isla del centro salen enemigos salvajes.\n* ¡Para practicar frases con mayúsculas!',
      ],
      npcs: [GC_NPC_MARINERA],
    },

    'gc-jardin': {
      name: 'Jardín Brotitos',
      render: '3d',
      view3d: { edge: 'forest', sky: '#9AD8FF', fogColor: '#D8EEFF', fog: [24, 74] },
      intro: ['* Todo aquí es GIGANTE. Las flores, los setos...\n* ¿O nosotros somos chiquitos?', '* Escucha... "¡Rojo, azul, amarillo!" Alguien está dando órdenes.'],
      music: 'gc_map',
      ground: 'gc_pasto',
      map: [
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
        'T..*...F..OF..,,,,.FO..F...*.T',
        'T.F.....*.O...,,,,..O.....F..T',
        'T.....F...O.^^^^^...O.,,,,...T',
        'T..*......O.^^^^^.F.O.,,,,.F.T',
        'T......F..O.^^^^^:::::::.....T',
        'T.F.......O.^^/^^...O..:..,,.T',
        'T....*....O....:....O..:..,,.T',
        'T..F....F.O....:..F.O..:.....T',
        'T....S....O,,,,:,,,,O..:.F...T',
        ':::::.....O,,,,:,,,,O..:.....T',
        'T...:..F..O....:....O..:..F..T',
        'T...:.....O.F..:....O..:.....T',
        'T.*.:..*..O....:..*.O..:.*...T',
        'T...:::::::::::::...O..:.OOOOT',
        'T..F......O.....,,,.O..:::::::',
        'T.....*...O..F......O....OOOOT',
        'T.F.....F.O.....F...O.F......T',
        'T....*....O.*.......O...*..F.T',
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      ],
      tiles: GC_TILES,
      spawns: { start: [1, 10, 'right'] },
      exits: {
        '0,10': { map: 'gc-celeste', spawn: [28, 3, 'left'] },
        '29,15': { map: 'gc-bellota', spawn: [1, 11, 'right'] },
      },
      encounters: [
        { enemy: 'brotitos', x: 10, y: 14, say: ['* ¡Rojo! ¡Azul! ¡Amarillo! ¡Un GIGANTE en el hueco del seto!\n* ¡Nadie pasa sin órdenes!'] },
        { enemy: 'capbrotes', x: 20, y: 5, say: ['* CAPITAN BROTES: ¡Alto ahí, gigante! Este paso es de mi expedición.', '* CAPITAN BROTES: Tengo 30 días para reparar mi nave. Este es el 29.\n* ¡Diez brotitos rojos, a mí!'] },
        { enemy: 'sombra_tetro', x: 26, y: 15, say: ['* (Una figura magenta llena de estática tapa el paso.)\n* Tiene la corona de Tetro Rey... pero chueca.', '* COPIA DE TETRO REY: Todo... encaja...\n* ...menos... yo.'] },
      ],
      chests: [
        { id: 'gc_bongos', x: 13, y: 4, treasure: 'dk_bongos', word: 'tambores' },
      ],
      wild: ['cubito', 'disquin', 'brotitos'],
      signs: {
        '5,9': ['* JARDIN BROTITOS\n* Por favor, no pise a los Brotitos. Son chiquitos.', '* Pikmin salió en 2001, el mismo año que la GameCube.\n* El Capitán Olimar medía como una moneda.', `* ${GC_FACTS[1]}`],
      },
      looks: GC_LOOKS,
      bitTips: [
        '* Los Brotitos siguen órdenes con DOS PUNTOS: "rojo: cava".\n* ¡Primero el color, luego dos puntos, luego la orden!',
        '* ¿Ves esa meseta? Arriba hay un cofre. ¡Sube!',
        '* Las flores gigantes huelen a dulce. Y a aventura.',
      ],
    },

    'gc-bellota': {
      name: 'Pueblo de Bellota',
      render: '3d',
      view3d: { edge: 'forest', sky: '#A8DCFF', fogColor: '#F2E6D8', fog: [24, 74] },
      intro: ['* ¡Un pueblito! Casitas, faroles, un buzón rojo...\n* Huele a pan y a hojas secas.', '* Aquí todos se escriben CARTAS. Con mayúsculas, comas y puntos.\n* ...Espero que tu letra sea bonita.'],
      music: 'gc_bellota',
      ground: 'gc_pasto',
      map: [
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
        'T..T..*..T~~...*..,,...TTTTTTT',
        'T.T.......~~.,,,....::::::::::',
        'T....T..*.~~..*...,.:..TTTTTTT',
        'T..*......~~TTTTTTTT:TTTTTTTTT',
        'T.T.....T.~~..*....L:L....*..T',
        'T.RRR..*..~~.RRR....:..RRRRR.T',
        'T.WWW.....~~.WWW....:..WWWWW.T',
        'T.WdW..T..~~.WdW....:..WWdWW.T',
        'T..:......~~..:...B.:.S..:...T',
        'T..:...*..~~..:.....:....:..TT',
        '::::::::::==::::::::::::::...T',
        'T.....:...~~.......T.....:...T',
        'T.*...:..T~~..*.....L....:.*.T',
        'T..RRR:...~~...........RRR:..T',
        'T..WWW:.*.~~..~~~......WWW:..T',
        'T..WdW:...~~..~~~...*..WdW...T',
        'T.....:.T.~~.T.........:....TT',
        'T.T...*...~~...RRR.....:..*..T',
        'T...T.....~~...WWW..T..:.....T',
        'T..*....T.~~...WdW.....:...T.T',
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      ],
      tiles: GC_TILES,
      spawns: { start: [1, 11, 'right'] },
      exits: {
        '0,11': { map: 'gc-jardin', spawn: [28, 15, 'left'] },
        '29,2': { map: 'gc-visor', spawn: [14, 20, 'up'] },
      },
      encounters: [
        { enemy: 'delfinito', x: 11, y: 11, say: ['* ¡Iiiik! (Un delfín salta del río y cae justo en el puente.)\n* ¡Iiiik! ¡Nadie cruza sin jugar conmigo!'] },
        { enemy: 'correo', x: 20, y: 4, say: ['* ALCALDESA BELLOTA: ¡Ay, un visitante! ¿Sabes escribir con mayúsculas y puntos?', '* ALCALDESA BELLOTA: Mi cartero se fue de vacaciones.\n* Si me ayudas con unas cartas, te abro la puerta del norte.'] },
        { enemy: 'sombra_cap', x: 25, y: 2, say: ['* (La estática magenta toma la forma de Lord Caparazón.)\n* Hasta su capa parpadea.', '* COPIA DE CAPARAZON: Mi castillo...\n* ...es otro castillo.'] },
      ],
      wild: ['delfinito', 'brotitos', 'disquin'],
      signs: {
        '22,9': ['* ALCALDIA DE BELLOTA\n* Horario: cuando la alcaldesa despierte.', `* ${GC_FACTS[3]}`],
      },
      looks: { ...GC_LOOKS, casa: '* La casita de un vecino. La puerta está cerrada.\n* Adentro se oye a alguien escribiendo una carta.' },
      bitTips: [
        '* ¡Un buzón rojo! En este pueblo se mandan cartas todo el día.',
        '* ¿Ves el río? Delfinito vive ahí. Por eso salpica tanto.',
        '* Piñón el búho sabe muchas cosas. Pero hay que hablarle bajito: está desvelado.',
      ],
      npcs: [GC_NPC_PINON],
    },

    'gc-visor': {
      name: 'Estación Visor',
      render: '3d',
      view3d: { edge: 'void', gcSpace: true, sky: '#2D2566', fogColor: '#2D2566', fog: [30, 90], cam: [12.5, 9] },
      intro: ['* Una estación en medio del espacio. Todo es plateado y hace "bip".', '* ...Qué raro. Siento que ya había estado aquí.\n* Bueno. Seguro no es nada. ¡Vamos!'],
      music: 'gc_escaner',
      ground: 'gc_piso',
      map: [
        'vvvvvvvvvvvvvvvvvvvvvbvvvvvvvv',
        'vvvvvvvvvvvvvvvvvvvvvbvvvvvvvv',
        'vvvMMMMMMMMMMMMMMMMMM:MMMMvvvv',
        'vvvMKmmmmmmmmmKMAmmmmmmmAMvvvv',
        'vvvMmmmmmmmmmmmMmmmmmmmmmMvvvv',
        'vvvMmmmmmmmmmmmmmmmmmmmmmMvvvv',
        'vvvMmmmmmmmmmmmMmmmmmmmmmMvvvv',
        'vvvMKmmmmmmmmmmMmmmmmmmmmMvvvv',
        'vvvMMMmMMMMMMMMMMMMMMMMMMMvvvv',
        'vvvMmmmmmmSmmmmmmmmmmmmmmMvvvv',
        'vvvMmmmmmmmmmmmmmmmmmmmmmMvvvv',
        'vvvMmmmmmmmmmmmmmmmmmmmmmMvvvv',
        'vvvMmmmmmmmmmmmmmmmmmmmmmMvvvv',
        'vvvMKmmmmmmmmmmmmmmmmmmmKMvvvv',
        'vvvMMMMMMMMMMMmMMMMMMMMMMMvvvv',
        'vvvMmmmmmmmmmmmmmmmmmmmmmMvvvv',
        'vvvMmmmmmmmmmmmmmmmmmmmmmMvvvv',
        'vvvMmmmmmmmmSmmmmmmmmmmmmMvvvv',
        'vvvMKmmmmmmmmmmmmmmmmmmmKMvvvv',
        'vvvMMMMMMMMMMMmMMMMMMMMMMMvvvv',
        'vvvvvvvvvvvvvvbvvvvvvvvvvvvvvv',
        'vvvvvvvvvvvvvvbvvvvvvvvvvvvvvv',
      ],
      tiles: GC_TILES,
      spawns: { start: [14, 20, 'up'] },
      exits: {
        '14,21': { map: 'gc-bellota', spawn: [28, 2, 'left'] },
        '21,0': { map: 'gc-arena', spawn: [12, 18, 'up'] },
      },
      encounters: [
        { enemy: 'fantasmita', x: 14, y: 14, say: ['* (La puerta tiene un cuadro colgado. El cuadro se ríe.)\n* "¡Buh! ¡Jijiji! Adivina dónde estoy."'] },
        { enemy: 'sombracel', x: 6, y: 8, say: ['* (Una sombra con contorno grueso se despega de la puerta.)\n* "Esta pared es mía. Y esta puerta también."'] },
        { enemy: 'sombra_nebula', x: 15, y: 5, say: ['* (Medusitas de estática flotan alrededor de una corona magenta.)', '* COPIA DE REINA NEBULA: Mis hijas...\n* ...no me reconocen.'] },
        { enemy: 'casco', x: 21, y: 2, say: ['* CASCO ESCANER: Escaneo iniciado. Sujeto: rápido. Nervioso. Sin nombre.', '* CASCO ESCANER: Segundo sujeto detectado: flotante, redondo...\n* ...origen: INTERESANTE. Acércate más.', '* BIT: ...¿Yo?'] },
      ],
      chests: [
        { id: 'gc_wavebird', x: 24, y: 10, treasure: 'wavebird', word: 'inalámbrico' },
      ],
      signs: {
        '12,17': ['* ESTACION VISOR\n* Prohibido correr. Prohibido escanear sin permiso.', '* Metroid Prime (2002) lo hizo Retro Studios, un estudio de Texas.\n* ¡Samus en 3D y en primera persona!'],
        '10,9': ['* LABORATORIO DE DATOS\n* Arriba: sala del Casco Escáner.', '* En la GameCube, las partidas se guardaban en la Memory Card, que se metía al frente.\n* Cada partida ocupaba "bloques".'],
      },
      looks: GC_LOOKS,
      bitTips: [
        '* Este lugar me da escalofríos... y yo no tengo espalda.',
        '* ¿Oyes ese "bip"? Es como si algo nos estuviera escaneando desde lejos.',
        '* Los cristales lila tienen letras adentro. ¿Serán datos de alguien?',
      ],
      npcs: [GC_NPC_SONDA],
    },

    'gc-arena': {
      name: 'Arena Final',
      render: '3d',
      view3d: { edge: 'void', gcSpace: true, sky: '#17162B', fogColor: '#2D2566', fog: [34, 100], cam: [12.5, 9.5] },
      intro: ['* La ARENA FINAL. Flota encima de todo el cubo.', '* Allá arriba hay figuritas... de los jefes que ya conocemos.\n* Alguien las colecciona. Y no me gusta cómo nos miran.'],
      music: 'gc_arena',
      ground: 'gc_baldosa',
      map: [
        'vvvvvvvvvvvvvvvvvvvvvvvvvv',
        'vvvvvvvvvvvvvvvvvvvvvvvvvv',
        'vvvvvvvUUUUUUUUUUUUvvvvvvv',
        'vvvvvvvU1U2UUUU3U4Uvvvvvvv',
        'vvvvvvvUUUUUUUUUUUUvvvvvvv',
        'vvvvvvvUUUUUUUUUUUUvvvvvvv',
        'vvvvvvvUUUUUUUUUUUUvvvvvvv',
        'vvvvvvvvvvvv/vvvvvvvvvvvvv',
        'vvvvYXXXXXXXXXXXXXXXXYvvvv',
        'vvvvXXXXXXXXXXXXXXXXXXvvvv',
        'vvvvXSXXXXXXXXXXXXXXXXvvvv',
        'vvvvXXXXXXXXXXXXXXXXXXvvvv',
        'vvvvXXXXXXXXXXXXXXXXXXvvvv',
        'vvvvYXXXXXXXXXXXXXXXXYvvvv',
        'vvvvvvvvvvvvbvvvvvvvvvvvvv',
        'vvvvvvvvvvvvbvvvvvvvvvvvvv',
        'vvvvvvvvvvvvbvvvvvvvvvvvvv',
        'vvvvvvvvvvvvbvvvvvvvvvvvvv',
        'vvvvvvvvvvvvbvvvvvvvvvvvvv',
        'vvvvvvvvvvvvbvvvvvvvvvvvvv',
      ],
      tiles: GC_TILES,
      spawns: { start: [12, 18, 'up'] },
      exits: {
        '12,19': { map: 'gc-visor', spawn: [21, 1, 'down'] },
      },
      encounters: [
        { enemy: 'sombra_marco', x: 12, y: 16, say: ['* (Un marco dorado de estática flota en medio del puente.)\n* Adentro no hay ninguna pintura.', '* COPIA DE MARCO: Un cuadro...\n* ...sin nadie que lo mire.'] },
        { enemy: 'guante', x: 12, y: 6, say: ['* (Un guante blanco GIGANTE baja de las estrellas y se para en la escalera.)', '* EL GUANTE CROSSOVER: ¡Bienvenido a la Arena!\n* Todos contra todos. Yo contra todos.', '* EL GUANTE CROSSOVER: ¿Te gustan mis figuritas? Me falta una.\n* ...La tuya.'] },
      ],
      signs: {
        '5,10': ['* ARENA FINAL\n* Reglas: 3 caídas. Sin objetos. Solo teclado.', `* ${GC_FACTS[4]}`, '* Super Smash Bros. Melee salió en Japón en noviembre de 2001,\n* apenas dos meses después que la consola.'],
      },
      looks: GC_LOOKS,
      bitTips: [
        '* No te acerques a la orilla. Abajo solo hay espacio.',
        '* Esas figuritas... son Tetro Rey, Caparazón, Nébula y Marco.\n* Pero chiquitas. Y quietas. Qué tristeza.',
        '* Respira hondo. Mayúsculas, comas, puntos. Tú puedes.',
      ],
    },
  },
});
