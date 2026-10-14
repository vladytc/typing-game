// MUNDO 4 — Isla Polígono explorable, ¡en 3D! (docs/LORE.md §7). Se carga después de las escenas
// del Mundo 4 (js/scenes/castillo.js...) y de js/scenes/town3d.js, que es quien la dibuja en 3D.
// Las casillas son las de siempre (y se juegan igual: flechas, casilla por casilla); `render: '3d'`
// hace que se vean con polígonos. Sin three.js se ven en 2D con la paleta de la N64.
//
//   PLAYA POLIGONO (28×20)                    CIRCUITO ISLA + BOSQUE DE LA NIEBLA (30×22)
//   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ (oso)        TTTTTTTTTTTTTTTTTTTTTTTTTTT:TT  -> estadio
//   ~~sss~~~~~~~~~~ss#^^^#s~~~~               T bosque A  [Texturín] bosque B [Niebla] C  T
//   ~sss:::::s====Trianguloso^^ meseta        T  (niebla)    ::::     (cofre)   ::::      T
//   ~sps:sss~~~~~~ss##/##sss~~                Tooooooooooo[Piloto]oooooooooo~~~~~~~~~~~~~~~
//   ~~sS:ssc~~~~~~~ssps:::[Cactín]::ss  ->    gg> pista de karts con cajas ?   ~~~ mar ~~~
//   ~~~~~ssPss (tubería al pueblo)            TTTTTTTTTTTTTTTTTTTTTTT~~~~~~~
//
//   ESTADIO POLIGONO + ISLAS FLOTANTES (30×22)   TEMPLO DE LA MELODIA + CASTILLO DE LOS CUADROS (30×24)
//   vvT^^^^^bbbbbb[Pakito]bbbbb::isla 3::> castillo   TTTTTTTTTTTTTTT~~~AKKKKKKKA~~T
//   vv^^(cofre)^/bb[Cámara]bb isla 1  vvvv            T templo  T.~~~KKKQKKK~~T  castillo y foso
//   vvvvvvEEEEEEEEE:EEEEEEEEE (estadio)               T IItII  T.~~~~~~[Marco]~~T
//   vvvvvvEGffffffffffffffGE  cancha                  :: t M t :[Ocarín]::::::::   MISSING X
//   vvvvvvEEEEEEE[Dani]EEEEEE                         T IItII  T.,,,,X,,,,,,,,.T
//   vvvvvvvv..tele, 4 sillas..:..   <- circuito
//
// Orden: Trianguloso → Cactín → Piloto Sombra → Texturín → Niebla → Dani → Cámara Loca →
//        Pakito → Ocarín → Marco. (El mismo de `nodes` en n64.js; cada uno en un paso angosto.)

const N64_FACTS = CONSOLES.find((c) => c.id === 'n64').facts;

// ---------- Tesoros nuevos (cofres) y sprites ----------
Object.assign(TREASURES, {
  controller_pak: { room: 'n64', name: 'Controller Pak', desc: 'Una tarjeta de memoria que se metía DEBAJO del control de la N64. Ahí guardabas tus partidas.' },
  expansion_pak: { room: 'n64', name: 'Expansion Pak', desc: 'Le daba 4 MB más de memoria a la N64. Donkey Kong 64 lo traía en la caja.' },
  transfer_pak: { room: 'n64', name: 'Transfer Pak', desc: 'Conectaba un cartucho de Game Boy al control de la N64. ¡Tus Pokémon del Game Boy, en 3D!' },
});

Object.assign(SPRITES, {
  pingui: [
    '................',
    '.....dddddd.....',
    '....dccccccd....',
    '...dccaccaccd...',
    '...dccdccdccd...',
    '...dcaabbaacd...',
    '..dccaaaaaaccd..',
    '..dcaaaaaaaacd..',
    '..dbbbbbbbbbbd..',
    '..dcaaaaaaaabd..',
    '.dccaaaaaaaabbd.',
    '.dccaaaaaaaaccd.',
    '..dcaaaaaaaacd..',
    '...dcaaaaaacd...',
    '...dbbd..dbbd...',
    '...ddd....ddd...',
  ],
  controller_pak: [
    '................',
    '...dddddddddd...',
    '...dccccccccd...',
    '...dcbbbbbbcd...',
    '...dcbaaaabcd...',
    '...dcbaddabcd...',
    '...dcbaaaabcd...',
    '...dcbbbbbbcd...',
    '...dccccccccd...',
    '...dcdcdcdccd...',
    '...dccccccccd...',
    '...dddddddddd...',
    '....dadadada....',
    '....dddddddd....',
    '................',
    '................',
  ],
  expansion_pak: [
    '................',
    '....dddddddd....',
    '...dbbbbbbbbd...',
    '...dbaaaaaabd...',
    '...dbbbbbbbbd...',
    '...dccccccccd...',
    '...dcddddddcd...',
    '...dcdaaaadcd...',
    '...dcddddddcd...',
    '...dccccccccd...',
    '...dccccccccd...',
    '...dddddddddd...',
    '....dcdcdcdc....',
    '....dddddddd....',
    '................',
    '................',
  ],
  transfer_pak: [
    '................',
    '..dddddddddddd..',
    '..dccccccccccd..',
    '..dcddddddddcd..',
    '..dcdbbbbbbdcd..',
    '..dcdbaaaabdcd..',
    '..dcdbaaaabdcd..',
    '..dcdbbbbbbdcd..',
    '..dcddddddddcd..',
    '..dccccccccccd..',
    '..dccccccccccd..',
    '..dddddddddddd..',
    '.....dadada.....',
    '.....dddddd.....',
    '................',
    '................',
  ],
});
Object.assign(SPRITE_PALETTES, {
  pingui: { a: '#f4f4f4', b: '#d64545', c: '#3c3c58', d: '#202030' },
  controller_pak: { a: '#f4f4f4', b: '#7e57c2', c: '#3a3a44', d: '#202030' },
  expansion_pak: { a: '#f7e463', b: '#d64545', c: '#3a3a44', d: '#202030' },
  transfer_pak: { a: '#f4f4f4', b: '#58b85c', c: '#3a3a44', d: '#202030' },
});

// Mapa de la isla: shuffle saltarín en Fa mayor a 132, de plataformero 3D (ocarina, bajo que
// rebota, piano a contratiempo; en B cuerdas y arpa). Forma A A' B A', 32 compases (~58 s).
// Música ORIGINAL: ninguna melodía viene de un juego.
TRACKS.n64isla = (() => {
  const melA = 'C5/2! F5/2 A5/3 G5/1 F5/2 A5/2 C6/4 | A5/3 G5/1 E5/2 C5/2 E5/6 -/2 | ' +
    'D5/2 F5/2 Bb5/3 A5/1 G5/2 F5/2 D5/4 | E5/2 G5/2 C6/2 Bb5/2 A5/2 G5/2 E5/2 G5/2 | ' +
    'A5/3! C6/1 A5/2 F5/2 C5/2 F5/2 A5/4 | F#5/2 A5/2 D6/4 C6/2 A5/2 F#5/4 | ' +
    'G5/2 Bb5/2 D6/2 Bb5/2 C6/2 Bb5/2 G5/2 E5/2 |';
  const melB = 'D6/6 C6/2 Bb5/4 F5/4 | Db6/6 C6/2 Bb5/4 F5/4 | C6/3 A5/1 E5/2 A5/2 C6/2 E6/2 D6/2 C6/2 | ' +
    'D6/6 A5/2 F#5/4 C6/4 | Bb5/2 A5/2 G5/2 Bb5/2 D6/4 G6/4! | F6/3 E6/1 D6/2 C6/2 Bb5/2 G5/2 E5/4 | ' +
    'G5/2 C6/2 E6/2 G6/2 F6/2 E6/2 D6/2 C6/2 | Bb5/2. A5/2. G5/2. E5/2. C5/2 D5/2 E5/2 G5/2';
  const cA = ['F', 'Am', 'Bb', 'C', 'F', 'D7', ['Gm', 'C7'], 'F'];
  const cB = ['Bb', 'Bbm', 'Am', 'D7', 'Gm', 'Gm', 'C7', 'C7'];
  const R = { F: ['F2', 'C3', 'F3', 'A2'], Am: ['A2', 'E3', 'A3', 'C3'], Bb: ['Bb2', 'F3', 'Bb3', 'D3'], C: ['C3', 'G3', 'C4', 'E3'], D7: ['D3', 'A3', 'D4', 'F#3'], Gm: ['G2', 'D3', 'G3', 'Bb2'], C7: ['C3', 'G3', 'Bb3', 'E3'], Bbm: ['Bb2', 'F3', 'Bb3', 'Db3'] };
  const CH = { F: 'A3+C4+F4', Am: 'A3+C4+E4', Bb: 'Bb3+D4+F4', C: 'G3+C4+E4', D7: 'A3+C4+F#4', Gm: 'G3+Bb3+D4', C7: 'G3+Bb3+E4', Bbm: 'Bb3+Db4+F4' };
  const bars = (list, full, half) => list.map((c) => (Array.isArray(c) ? c.map(half).join(' ') : full(c))).join(' ');
  // Bajo: en A rebota en staccato (raíz-quinta); en B camina (raíz, tercera, quinta, tercera).
  const bounce = (c) => { const [r, f, o] = R[c]; return `${r}/4. ${f}/4. ${r}/4. ${f}/2. ${o}/2.`; };
  const bounceH = (c) => { const [r, f] = R[c]; return `${r}/4. ${f}/4.`; };
  const walk = (c) => { const [r, f, , t] = R[c]; return `${r}/4 ${t}/4 ${f}/4 ${t}/4`; };
  const comp = (c) => `(-/2 ${CH[c]}/2.)*4`;
  const compH = (c) => `(-/2 ${CH[c]}/2.)*2`;
  const harp = (c) => { const [a, b, d] = CH[c].split('+'); return `(${a}/2 ${b}/2 ${d}/2 ${b}/2)*2`; };
  const harpH = (c) => { const [a, b, d] = CH[c].split('+'); return `${a}/2 ${b}/2 ${d}/2 ${b}/2`; };
  const groove = 'k/2 h/2 s/2 h/1? h/1 k/2 h/2 s/2 h/2';
  const fill = 'k/2 h/2 s/2 h/2 s/1 s/1? t/2 t/2 T/2';
  const drA = `c+${groove} (${groove})*6 ${fill}`;
  const drB = `c+k/2 h/2 o/2 h/2 s/2 h/2 o/2 h/2 (k/2 h/2 o/2 h/2 s/2 h/2 o/2 h/2)*6 ${fill}`;
  return {
    bpm: 132, vol: 1.3, era: 'n64', swing: 0.12, form: ['A', 'A2', 'B', 'A2'],
    voices: [
      { wave: 'square', vol: 0.038, parts: {
        A: `${melA} F5/4 -/2 C5/2 D5/2 E5/2 F5/2 G5/2`,
        A2: `${melA} F5/6 A5/2 F5/4! -/4`,
        B: melB } },
      // "Piano" a contratiempo: armónicos brillantes y caída corta.
      { wave: [1, 0.5, 0.3, 0.2, 0.1], vol: 0.02, env: 'pluck', poly: true, fx: 0.5, parts: {
        A: bars(cA, comp, compH), A2: bars(cA, comp, compH) } },
      { wave: 'sawtooth', vol: 0.015, env: 'pad', poly: true, unison: 10, parts: {
        B: bars(cB, (c) => `${CH[c]}/16`, (c) => `${CH[c]}/8`) } },
      { wave: [1, 0.45, 0.2, 0.1, 0.05], vol: 0.02, env: 'pluck', transpose: 12, fx: 0.7, parts: {
        A2: bars(cA, harp, harpH), B: bars(cB, harp, harpH) } },
      { wave: 'triangle', vol: 0.075, fx: 0, parts: {
        A: bars(cA, bounce, bounceH), A2: bars(cA, bounce, bounceH), B: bars(cB, walk, walk) } },
      { wave: 'noise', vol: 0.02, fx: 0.15, parts: { A: drA, A2: drA, B: drB } },
    ],
  };
})();

// ---------- Casillas (sprite 2D + colores para el modo clásico; d3/h para el 3D) ----------
const n64T = (s, colors, extra = {}) => ({ s, colors, ...extra });
const N64_SAND = { a: '#f4ecc8', b: '#e8d8a8', c: '#c9b07a', d: '#8a6a3a' };
const N64_WOOD = { a: '#e8c890', b: '#c9a66b', c: '#8a6a3a', d: '#202030' };
const N64_STONE = { a: '#f4f4f4', b: '#e8dcb5', c: '#9a8c7a', d: '#6b5f52' };
const N64_HIGH = { a: '#7fd07f', b: '#a8e0a0', c: '#3e8e44', d: '#2f7d3a' };
const N64_SKY = { a: '#c9e8ff', b: '#9fd3ff', c: '#b4dcff', d: '#9fd3ff' };
const N64_TILES = {
  s: n64T('path', N64_SAND),
  '=': n64T('s16_puente', N64_WOOD, { d3: 'bridge' }),
  b: n64T('s16_puente', N64_WOOD, { d3: 'bridge', over: 'void' }),
  p: n64T('tree', { a: '#f7e463', b: '#7fd07f', c: '#9a6c3a', d: '#202030' }, { solid: true, d3: 'palm', look: 'palma', under: 'path' }),
  '^': n64T('grass', N64_HIGH, { h: 1.2 }),
  '/': n64T('path', N64_STONE, { h: 0.6 }),
  '#': { s: 'rock', solid: true, look: 'roca' },
  g: n64T('path', { a: '#9a9aa8', b: '#7c7c8a', c: '#5a5a6a', d: '#3a3a44' }),
  m: n64T('s16_meta', { a: '#f4f4f4', b: '#f4f4f4', c: '#202030', d: '#202030' }),
  o: n64T('rock', { a: '#f4f4f4', b: '#d64545', c: '#3a3a44', d: '#202030' }, { solid: true, d3: 'tire', look: 'llanta' }),
  '?': n64T('rock', { a: '#f4f4f4', b: '#f7e463', c: '#3c8dd6', d: '#202030' }, { solid: true, d3: 'itembox', look: 'caja' }),
  n: n64T('grass', { a: '#a8c8b0', b: '#c9d6e3', c: '#6a9a78', d: '#4a6a58' }, { d3: 'fog' }),
  E: n64T('wall', { a: '#f7e463', b: '#9a7ad8', c: '#7e57c2', d: '#202030' }, { solid: true, d3: 'wall', bh: 3.2, look: 'muroEstadio' }),
  G: n64T('roof', { a: '#f7e463', b: '#9a7ad8', c: '#7e57c2', d: '#202030' }, { solid: true, d3: 'stand', look: 'gradas' }),
  f: n64T('grass', { a: '#6fc870', b: '#86d886', c: '#4ca651', d: '#3e8e44' }),
  w: n64T('path', { a: '#f4f4f4', b: '#f4f4f4', c: '#c9d6e3', d: '#c9d6e3' }),
  V: n64T('sign', { a: '#9fd3ff', b: '#3a3a44', c: '#6b4a2a', d: '#202030' }, { solid: true, d3: 'tv', look: 'tele' }),
  H: n64T('rock', { a: '#f7e463', b: '#d64545', c: '#3c8dd6', d: '#202030' }, { solid: true, d3: 'chair', look: 'sillas' }),
  v: n64T('water', N64_SKY, { solid: true, d3: 'void', look: 'vacio' }),
  K: n64T('wall', N64_STONE, { solid: true, d3: 'castle', look: 'castillo' }),
  A: n64T('roof', { a: '#f4f4f4', b: '#e8dcb5', c: '#d64545', d: '#202030' }, { solid: true, d3: 'tower', look: 'torre' }),
  Q: n64T('door', { a: '#f7e463', b: '#c9a66b', c: '#8a3a2a', d: '#202030' }, { solid: true, look: 'puertaCastillo', d3: 'castle', c3: '#8A3A2A', bh: 2.6 }),
  I: n64T('rock', N64_STONE, { solid: true, d3: 'pillar', look: 'pilar' }),
  t: n64T('path', { a: '#e8e0f4', b: '#d4c8ec', c: '#a898d0', d: '#7e57c2' }),
  M: n64T('sign', { a: '#f7e463', b: '#9a7ad8', c: '#7e57c2', d: '#202030' }, { solid: true, d3: 'mask', look: 'mascara' }),
  X: n64T('cave', { a: '#f4f4f4', b: '#202030', c: '#000000', d: '#000000' }, { solid: true, d3: 'missing', look: 'missing' }),
  c: n64T('rock', { a: '#c9c9d4', b: '#8a8a96', c: '#5a5a66', d: '#202030' }, { solid: true, d3: 'cube', look: 'cubo' }),
};

const N64_LOOKS = {
  agua: '* Agua azul con un poquito de niebla encima.\n* Si te asomas, ves un pez de 12 triángulos.',
  palma: '* Una palmera de polígonos.\n* Sus hojas son triángulos. Muy, muy planos.',
  roca: '* Una roca con caras planas.\n* Cada cara tiene su propio tono. Así se veía el 3D en 1996.',
  arbol: '* Un pino hecho de dos conos.\n* Si lo rodeas, se ve igual por todos lados. ¡Ahorro de polígonos!',
  llanta: '* Una pila de llantas. Huele a hule y a carrera.',
  caja: '* Una caja con un signo de pregunta. Gira y gira.\n* Adentro suena algo... ¿un plátano?',
  muroEstadio: '* El muro del estadio. Desde adentro se oye:\n* "¡DA-NI! ¡DA-NI!"',
  gradas: '* Gradas llenas de público de bolitas.\n* Te saludan. Bueno, eso crees.',
  tele: '* Una tele de tubo con una consola gris enfrente.\n* "Cuatro puertos. Cuatro amigos. Cero cables largos."',
  sillas: '* Cuatro sillas frente a la tele.\n* Una para cada control. Nadie quiere el control que se atora.',
  vacio: '* Abajo solo hay nubes... y más abajo, más nubes.\n* Mejor no te asomes tanto.',
  castillo: '* El Castillo de los Cuadros.\n* Sus ventanas están pintadas. Literalmente.',
  torre: '* Una torre con techo rojo puntiagudo.\n* Alguien vive arriba. O algo.',
  puertaCastillo: '* Una puerta enorme de madera.\n* Del otro lado se oye un marco crujir... y una pausa muy larga.',
  pilar: '* Un pilar blanco del templo.\n* Si lo tocas suena un "do". Bueno, casi.',
  mascara: '* Una máscara cuelga de un pilar. Tiene cara de que sabe algo.\n* "Tengo tres días. Siempre tengo tres días."',
  missing: '* Aquí falta un pedazo del mundo. Solo dice: MISSING.\n* El Glitch pausó esta parte antes de que terminara de cargar.',
  cubo: '* Un cubo gris. Vibra un poquito.\n* "Soy un paquete que hace vibrar. Nací en 1997 con un zorro."',
};

// Lo mismo que el mapa del castillo pero sin los pedazos MISSING (después de vencer a Marco).
const n64Fixed = (rows) => rows.map((r) => r.replace(/X/g, '.'));

const N64_CASTILLO_MAP = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTT~~~~~~~~~~~~~~T',
  'TTTTTTTTTTTTTTT~~~AKKKKKKKA~~T',
  'TTTTTTTTTTTTTTT~~~KKKKKKKKK~~T',
  'TTTTTTTTTTTTTTT~~~KKKKKKKKK~~T',
  'TTTTTTTTTTTTTTT~~~KKKKKKKKK~~T',
  'TTTTTTTTTTTTTTT~~~KKKKKKKKK~~T',
  'TTTTTTTTTTTTTTT~~~KKKKKKKKK~~T',
  'T............T.~~~AKKKQKKKA~~T',
  'T............T.~~~~~~~=~~~~~~T',
  'T..ItItItIt..T.~~~~~~~=~~~~~~T',
  'T..ttMttttt..T.~~~~~~~=~~~~~~T',
  'T..IttttttI..TT..*...::.S...TT',
  'T.Stttttttt..T....:::......X.T',
  'T..Ittttttt:::::::...........T',
  '::::ttttttt..T..........X....T',
  'T..IttttttI..T..X..........*.T',
  'T..tttttttt..T.,,,,,,,,,,,,,.T',
  'T..ItItItIt..T.,,,,,,,,,,,,,.T',
  'T............T.,,,,,X,,,,,,,.T',
  'T............T.*,,,,,,,,,X,,.T',
  'TTTTTTTTTTTTTT.,,,,,,,,,,,,,.T',
  'TTTTTTTTTTTTTTT.............TT',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
];

addMaps('n64', {
  entry: { map: 'n64-playa', spawn: [7, 17, 'up'] },
  maps: {
    'n64-playa': {
      name: 'Playa Polígono',
      render: '3d',
      view3d: { edge: 'sea', missing: true, fog: [22, 72] },
      intro: [
        '* ¡¿Q-qué es esto?! ¡Todo tiene... PROFUNDIDAD!',
        '* Árboles con esquinas, agua que brilla, una cámara que nos sigue...\n* ¡Bienvenido a la ISLA POLIGONO! El primer mundo en 3D.',
        '* Pero mira el cielo: tiene hoyos que dicen MISSING.\n* El Glitch dejó la isla a medio cargar. ¡Hay que arreglarla!',
        '* Tranquilo: se camina igual, con las flechas.\n* Aquí se practican los NUMEROS. Dedos a la fila de arriba.',
      ],
      music: 'n64isla',
      ground: 'path',
      map: [
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
        '~~~~~~~~~~~~~~~~ssss~~~~sss~',
        '~~~sssss~~~~~~~sspTTs~~~sps~',
        '~~sspsssss~~~~ss#^^^#s~~~~~~',
        '~~sssss*ss~~~~s#^^S^^#s~~~~~',
        '~sss:::::s====ss^^^^^ss~~~~~',
        '~sps:sspss~~~~ss##/##sss~~~~',
        '~sss:ssssss~~~~sss:sssps~~~~',
        '~ss*:ssps~~~~~~ss:::ssss~~~~',
        '~sss:sss~~~~~~~sps:sssps~~~~',
        '~~ss:ss~~~~~~~~ss::sss##~~~~',
        '~~ss:sss~~~~~~~sss::::#~ssss',
        '~~sS:ssc~~~~~~~~ssps::::::ss',
        '~~sss:sss~~~~~~~~sss##~#sss:',
        '~~~ss:spss~~~~~~~~~~~~~~ssps',
        '~~~sss:sss~~~~~~~~~~~~~~~ss~',
        '~~~~sss:ss~~~~~~~~~~~~~~~~~~',
        '~~~~~ssPss~~~~~~~~~~~~~~~~~~',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      ],
      tiles: {
        ...N64_TILES,
        '#': n64T('rock', N64_STONE, { solid: true, look: 'roca', under: 'path', h: 0 }),
        '*': n64T('flower', { a: '#e8d8a8', b: '#f7e463', c: '#58b85c', d: '#d64545' }),
        ':': n64T('path', N64_STONE),
        T: { s: 'tree', solid: true, look: 'arbol', under: 'path' },
        '~': { s: 'water', solid: true, look: 'agua' },
      },
      spawns: { start: [7, 17, 'up'] },
      exits: {
        '7,18': { pueblo: 'n64' },
        '27,14': { map: 'n64-circuito', spawn: [1, 16, 'right'] },
      },
      encounters: [
        { enemy: 'trianguloso', x: 12, y: 6, say: ['* ¡Alto ahí! Este puente es de TRES tablas por lado.\n* Bueno, cuatro. Pero yo cuento tres. Siempre tres.'] },
        { enemy: 'cactin', x: 22, y: 13, say: ['* ¡Ajúa! Por este paso solo pasa quien sepa contar espinas.\n* (Tengo 4. No me abraces.)'] },
      ],
      chests: [
        { id: 'n64_cpak', x: 19, y: 4, treasure: 'controller_pak', word: 'memoria' },
      ],
      wild: ['trianguloso', 'cactin'],
      signs: {
        '3,13': ['* ISLA POLIGONO · PLAYA\n* (Tubería al Pueblo Vitrina, al sur.)', '* La Nintendo 64 salió en Japón el 23 de junio de 1996.', `* ${N64_FACTS[1]}`],
        '18,5': ['* MIRADOR DE LA PLAYA\n* Desde aquí arriba se ve toda la isla. Bueno, hasta la niebla.', `* ${N64_FACTS[0]}`],
      },
      looks: N64_LOOKS,
      bitTips: [
        '* ¡Puedo ver ATRAS de las palmeras! En el Valle eso era imposible.',
        '* Dicen que esta consola seguía usando cartuchos cuando todos ya usaban CD.\n* Cargaba rapidísimo.',
        '* ¿Ves esa meseta? En 3D hay ARRIBA y ABAJO. ¡Sube por el escalón!',
        '* Allá en la islita pasa un oso con un pájaro en la mochila.\n* ...No le digas que lo vi. Se ve ocupado.',
      ],
      decor3d: [{ model: 'bear', path: [[24, 2], [26, 2]], speed: 0.8, scale: 0.7 }],
      npcs: [
        {
          id: 'pingui', sprite: 'pingui', x: 6, y: 8,
          async talk(ctx) {
            if (!ctx.flag('n64Pingui')) {
              ctx.setFlag('n64Pingui');
              await ctx.say([
                '* ¡Hola! Soy PINGÜI. Vengo de vacaciones desde una montaña MUY fría.\n* Bueno... de un cuadro de una montaña.',
                '* Aquí todo es 3D. Para caminar en los juegos de esta isla había una cosa nueva:\n* ¡una palanquita en medio del control!',
              ], 'PINGÜI');
              return;
            }
            const lines = [
              ['* La palanca analógica sabía si la empujabas poquito o mucho.\n* Poquito: caminar. Mucho: ¡correr!'],
              ['* El control de esta consola tenía forma de tridente: tres agarraderas.\n* Yo lo agarro con las aletas. Cuesta trabajo.'],
              ['* En la meseta de allá hay un cofre.\n* Yo no lo abrí: no me sé la palabra. Y tengo aletas.'],
            ];
            await ctx.say(lines[ctx.counter('n64Pingui') % lines.length], 'PINGÜI');
          },
        },
      ],
    },

    'n64-circuito': {
      name: 'Circuito Isla',
      render: '3d',
      view3d: { edge: 'sea', missing: true, fog: [14, 50], fogColor: '#D5DEE8' },
      music: 'n64kart',
      ground: 'grass',
      map: [
        'TTTTTTTTTTTTTTTTTTTTTTTTTTT:TT',
        'TnnnnnnnnnnnnTnnnnnTnnnT...:.T',
        'TnTnnnTnnnnnnTnTnnnnnnnTT..:*T',
        'Tn,,nnnnnTnnnTnnnnTnnTnT...:.T',
        'Tn,,.......n::::nnnnnnnT...:.T',
        'Tnnn.......:nTnn:nnnTnnTT..:.T',
        'TnnT..T....:nTTnn:nnnnnT..:.*T',
        'Tnnn.......:nTnnnn:nnnnT.:...T',
        'Tnnn.......:nTnTnnn::::::....T',
        'TnTnnTnnTnSn:Tnn,,,,,,nT....TT',
        'Tnnnnnnnnnnn:Tnn,,,,,,nT.T...T',
        'Tooooooooooo:oooooooooo~~~~~~~',
        'Toggggggggggggggggggggs~~~~~~~',
        'Toggggggggggggggggggggs~~~~~~~',
        'Toggo.?...?S..?...?oggs~~~~~~~',
        'Togg.,,,,,,,,,,,,,,.ggs~~~~~~~',
        'ggmm.,,,,,,oo,,,,,,.ggs~~~~~~~',
        'Togg.,,,,,,,,,,,,,,.ggs~~~~~~~',
        'Toggo...?...?...?..oggs~~~~~~~',
        'Toggggggggggggggggggggs~~~~~~~',
        'Toggggggggggggggggggggs~~~~~~~',
        'TTTTTTTTTTTTTTTTTTTTTTT~~~~~~~',
      ],
      tiles: {
        ...N64_TILES,
        T: { s: 'tree', solid: true, look: 'arbol' },
        '~': { s: 'water', solid: true, look: 'agua' },
      },
      spawns: { start: [1, 16, 'right'] },
      exits: {
        '0,16': { map: 'n64-playa', spawn: [26, 14, 'left'] },
        '27,0': { map: 'n64-estadio', spawn: [15, 20, 'up'] },
      },
      encounters: [
        { enemy: 'piloto', x: 12, y: 11, say: ['* PILOTO SOMBRA: Soy tu sombra.\n* Sé exactamente qué tan lento escribes.', '* PILOTO SOMBRA: ¿Quieres pasar al bosque? Primero, tres vueltas.\n* ¡Cuatro puertos, cuatro corredores!'] },
        { enemy: 'texturin', x: 13, y: 4, say: ['* ¡Psst! ¿Tú eres un cubo? ¿No? ¿Una pared?\n* Necesito algo donde pegarme... ¡AY, NO ME VEAS ASI DE CERCA!'] },
        { enemy: 'niebla', x: 23, y: 8, say: ['* ...No me veas. Todavía no termino de cargar.', '* Lo que hay detrás de mí no existe hasta que yo diga.\n* ...Bueno, sí existe. Pero no se ve.'] },
      ],
      chests: [
        { id: 'n64_xpak', x: 21, y: 2, treasure: 'expansion_pak', word: 'expansión' },
      ],
      wild: ['trianguloso', 'cactin', 'texturin', 'niebla'],
      signs: {
        '11,14': ['* CIRCUITO ISLA\n* Pista de 3 vueltas. ¡Cuidado con los plátanos!', '* Mario Kart 64 (1996) dejaba correr a 4 personas al mismo tiempo, con la pantalla partida en 4.', `* ${N64_FACTS[4]}`],
        '10,9': ['* BOSQUE DE LA NIEBLA\n* Lo que está lejos... todavía no carga.', '* Muchos juegos de N64 usaban niebla para tapar lo que estaba lejos.\n* Así la consola dibujaba menos y el juego iba más fluido.'],
      },
      looks: N64_LOOKS,
      bitTips: [
        '* ¡Cajas que giran con un signo de pregunta!\n* No las toques. Bueno, no puedes. Pero se ven bonitas.',
        '* El bosque está lleno de niebla.\n* ¿Ves cómo los árboles de atrás se ponen grises? ¡Es a propósito!',
        '* El Piloto Sombra corre igualito que tú. Pero morado.',
        '* En el pasto alto del centro de la pista salen enemigos salvajes.\n* ¡Para practicar números!',
      ],
    },

    'n64-estadio': {
      name: 'Estadio Polígono',
      render: '3d',
      view3d: { edge: 'void', missing: true, fog: [26, 86] },
      intro: ['* ¡Whoa! El estadio está FLOTANDO en el cielo.', '* (La cámara se atora en una pared.)\n* ...Ya se soltó. ¡Vamos!'],
      music: 'n64estadio',
      ground: 'grass',
      map: [
        'vvvvvvvvvvvvvvvvvvvvvvv.....Tv',
        'vvT^^^^^bbbbbbbbbbbbbbb::....v',
        'vv^^^^^^vvvvvvvvvvvvvvv..:::::',
        'vv^^^^^^vvvvT.....Tvvvv...S..v',
        'vv^^^^^/bbbb...:...vvvvT....Tv',
        'vvT^^^^^vvvv...:...vvvvvvvvvvv',
        'vvvvvvEEEEEEEEE:EEEEEEEEEvvvvv',
        'vvvvvvEGGGGGGGG:GGGGGGGGEvvvvv',
        'vvvvvvEGfffffffffffffffGEvvvvv',
        'vvvvvvEGfffffffwfffffffGEvvvvv',
        'vvvvvvEGfffffffwfffffffGEvvvvv',
        'vvvvvvEGfffffffwfffffffGEvvvvv',
        'vvvvvvEGfffffffwfffffffGEvvvvv',
        'vvvvvvEGfffffffwfffffffGEvvvvv',
        'vvvvvvEGfffffffffffffffGEvvvvv',
        'vvvvvvEGGGGGGGG:GGGGGGGGEvvvvv',
        'vvvvvvEEEEEEEEE:EEEEEEEEEvvvvv',
        'vvvvvvvvT......:......Tvvvvvvv',
        'vvvvvvvv..V....:...S...vvvvvvv',
        'vvvvvvvv.......:.......vvvvvvv',
        'vvvvvvvv.HHHH..:.......vvvvvvv',
        'vvvvvvvvT......:......Tvvvvvvv',
      ],
      tiles: {
        ...N64_TILES,
        T: { s: 'tree', solid: true, look: 'arbol' },
        ':': n64T('path', N64_STONE),
      },
      spawns: { start: [15, 20, 'up'] },
      exits: {
        '15,21': { map: 'n64-circuito', spawn: [27, 1, 'down'] },
        '29,2': { map: 'n64-castillo', spawn: [1, 15, 'right'] },
      },
      encounters: [
        { enemy: 'dani64', x: 15, y: 16, say: ['* DANI: ¡Por fin llegas! ¿Escuchas al público? ¡Gritan MI nombre!', '* DANI: Para cruzar el estadio tienes que ganarme.\n* ¡Tres contra tres! Y mi ??? ya evolucionó...'] },
        { enemy: 'camaraloca', x: 10, y: 4, say: ['* ¡CLIC! ¡No te muevas! ...¡Ay, me atoré en el puente!', '* Para pasar tienes que leer mis palabras.\n* Salen un poquito... chuecas.'] },
        { enemy: 'pakito', x: 20, y: 1, say: ['* ¡Brrrrr! ¡Hola! ¡Brrr! Este puente tiembla...\n* ...ah no, soy yo. ¡BRRRR!'] },
      ],
      chests: [
        { id: 'n64_tpak', x: 3, y: 2, treasure: 'transfer_pak', word: 'transferir' },
      ],
      signs: {
        '19,18': ['* ESTADIO POLIGONO\n* Hoy: ¡DANI TURBO y sus Tecloides!', '* En Pokémon Stadium, con el Transfer Pak, tus Pokémon del Game Boy se veían en 3D.\n* ¡Y peleaban en un estadio como este!'],
        '26,3': ['* ISLAS FLOTANTES\n* Prohibido saltar. (Bueno, poquito.)', `* ${N64_FACTS[3]}`],
      },
      looks: N64_LOOKS,
      bitTips: [
        '* ¡Islas que flotan! Si te caes, ¿adónde vas?\n* ...Mejor no averiguarlo.',
        '* ¿Ves la tele de tubo con las cuatro sillas? ¡Así se jugaba con amigos!',
        '* Escucha al público. Creo que ya se saben tu nombre también.',
      ],
      npcs: [
        {
          id: 'profesora64', sprite: 'profesora', x: 17, y: 19,
          async talk(ctx) {
            if (Save.data.done.dani64) {
              await ctx.say(['* ¡Qué combate! Dani se fue pensativo...\n* Creo que empieza a dudar del señor morado.'], 'PROFESORA LETRA');
              return;
            }
            await ctx.say([
              '* ¡Hola! Vine a ver el estadio. Dicen que Dani tiene un Tecloide nuevo: ????.',
              rand([
                '* Aquí el locutor dice el ataque ANTES de que salga.\n* Escucha bien: la palabra llega con menos tiempo.',
                '* Si tu Tecloide está cansado, cámbialo. ¡Para eso son tres!',
                '* Recuerda: CHISPA le gana a GOTA, GOTA a BROTE y BROTE a CHISPA.',
              ]),
            ], 'PROFESORA LETRA');
          },
        },
      ],
    },

    'n64-castillo': {
      name: 'Castillo de los Cuadros',
      render: '3d',
      view3d: { edge: 'forest', missing: true, fog: [22, 70] },
      intro: ['* Escucha... música. Viene del templo de los pilares.', '* Y allá, detrás del foso... ¡el CASTILLO DE LOS CUADROS!\n* Ahí debe estar la Nintendo 64.'],
      music: 'n64castle',
      ground: 'grass',
      map: N64_CASTILLO_MAP,
      tiles: {
        ...N64_TILES,
        T: { s: 'tree', solid: true, look: 'arbol' },
        '~': { s: 'water', solid: true, look: 'agua' },
      },
      variants: [{ when: () => !!Save.data.done.marco, map: n64Fixed(N64_CASTILLO_MAP) }],
      spawns: { start: [1, 15, 'right'] },
      exits: {
        '0,15': { map: 'n64-estadio', spawn: [28, 2, 'left'] },
      },
      encounters: [
        { enemy: 'ocarin', x: 13, y: 14, say: ['* OCARIN: ¡Hola, hola! La música es tecleo con ritmo.\n* O el tecleo es música sin ritmo. Uno de los dos.', '* OCARIN: Para cruzar al castillo, toca conmigo. ¡Cinco notas bastan!'] },
        { enemy: 'marco', x: 22, y: 10, say: ['* MARCO: Toda pintura es un mundo. Todo mundo es una pausa.', '* MARCO: ¿Vienes por la consola gris? Está en mi cuadro del sótano.\n* Pasa, pasa... si puedes con mis ocho cuadros.'] },
      ],
      wild: ['texturin', 'niebla', 'camaraloca', 'pakito'],
      signs: {
        '2,13': ['* TEMPLO DE LA MELODIA\n* (Se ruega tocar bonito.)', '* En Ocarina of Time (1998) la ocarina se tocaba con 5 botones del control.\n* ¡Cada botón era una nota!'],
        '24,12': ['* CASTILLO DE LOS CUADROS', '* Este castillo tiene menos cuadros que el original.\n* Pero los nuestros hablan.', `* ${N64_FACTS[2]}`],
      },
      looks: N64_LOOKS,
      bitTips: [
        '* Los cuadros MISSING del pasto... dan escalofríos.\n* Es como si el mundo tuviera hoyos.',
        '* Ocarín toca con S D F J K. ¡La posición base de tus manos!',
        '* El castillo tiene un foso. Y un puente. Y un marco dorado en el puente...',
      ],
    },
  },
});
