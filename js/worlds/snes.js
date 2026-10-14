// MUNDO 3 — Reino 16-Bit (Super Nintendo, 1990). Diseño en docs/LORE.md §6.
// Aquí los ACENTOS y la Ñ cuentan (strictAccents). Se apaga con Save.data.strictAccents = false
// (o con la Maestra Modo del pueblo).
//
// Escenas propias del mundo:
//   js/scenes/modo7.js      piso Modo 7 + paintArt (sprites a todo color en canvas)
//   js/scenes/carrera.js    RAYO CERO (carrera de tecleo) y el minijuego PISTA CERO
//   js/scenes/vulpino.js    CAPITAN VULPINO (disparar a palabras) y el minijuego ESCUADRON ZORRINO
//   js/scenes/arena7.js     DANI TURBO 3 contra 3 en la Arena Modo 7 (batalla de Tecloides)
//   js/scenes/nebula.js     REINA NEBULA (jefe): oscuridad, rayo cargado, drenaje, crías en espiral
//   js/scenes/snes-pueblo.js lo que el Reino 16-Bit agrega al pueblo (Maestra Modo, amigos, misiones)

// ---------- Paleta 16-bit (lore §6.1 + sombras) ----------
// Letras de los sprites a todo color. (Las letras a/b/c/d siguen siendo los 4 tonos del mundo.)
const SNES_PAL = {
  K: '#1a1a2e', // contorno
  W: '#ffffff',
  L: '#5fcde4', // cielo
  B: '#2e5c9a', // cielo oscuro
  U: '#3b7bd8', // azul medio
  V: '#9be7ff', // brillo azul
  G: '#3fbf3f', // pasto
  g: '#1e7a2e', // pasto oscuro
  H: '#9be86e', // brillo verde
  N: '#a0522d', // tierra
  n: '#d29a5b', // tierra clara
  P: '#8c8c9c', // piedra
  p: '#4a4a5e', // piedra oscura
  S: '#c0c8d8', // plata
  Z: '#eef2f8', // plata brillante
  Y: '#ffd93d', // amarillo
  D: '#f2c14e', // dorado
  O: '#ff8c1a', // naranja
  R: '#e8393d', // rojo
  r: '#9c1f2a', // rojo oscuro
  M: '#8e44ad', // morado
  m: '#c39bd3', // lila
  I: '#f79ac0', // rosa
  F: '#ffe2c0', // piel
  X: '#ff00ff', // el color que ninguna consola puede mostrar (el Glitch)
};
const snesArt = (rows, pal = SNES_PAL) => Object.assign(rows, { pal });
// Mismo dibujo con otros colores: recolor(filas, { R: 'U' }).
const recolor = (rows, map) => snesArt(rows.map((r) => [...r].map((c) => map[c] || c).join('')), rows.pal || SNES_PAL);

// ---------- Palabras (lore §16) ----------
WORDS.snes = ['plátano', 'dinosaurio', 'caballero', 'armadura', 'piña', 'niño', 'sueño', 'montaña', 'cañón',
  'pequeño', 'rápido', 'música', 'fácil', 'difícil', 'galaxia', 'polígono', 'órbita', 'medusa', 'océano', 'estrellita'];

// Quita los signos de apertura ¡ ¿ si el jugador apagó los acentos (su teclado no los tiene).
const snesSigns = (list) => () => (strictOn(true) ? list : list.map((w) => w.replace(/[¡¿]/g, '')));

// Frases para la carrera (párrafo continuo con acentos).
const SNES_PHRASES = [
  'la nave más rápida', 'gira en la curva', 'el piloto pequeño sueña', 'la pista brilla de noche',
  'el motor ruge fuerte', 'nadie frena en la recta', 'el cañón de energía', 'una montaña de colores',
  'el niño saluda feliz', 'la música suena fuerte', 'qué fácil es correr', 'la órbita del planeta',
  'el dinosaurio corre', 'gana el más veloz', 'mañana hay otra carrera', 'el público grita', 'cuidado con el muro',
  'la galaxia es enorme', 'piña, plátano y melón', 'el último giro', 'mira el océano', 'la estrella fugaz',
];

// ---------- Sprites a todo color (16x16) ----------
const SNES_SPRITES = {
  dinohuevin: snesArt([
    '................',
    '......KKKKK.....',
    '.....KGGGGGK....',
    '....KGGGGGGGK...',
    '....KGWWGGGGGK..',
    '....KGWKGGGGGGK.',
    '....KHGGGGGGGGK.',
    '.....KHGGGIIIIK.',
    '.....KHGGGGKKK..',
    '...KKKKGGGGK....',
    '..KWWGWKKKKWK...',
    '.KWWWWWWGWWWWK..',
    '.KWGWWWWWWWGWK..',
    '.KWWWWGWWWWWWK..',
    '..KWWWWWWWGWK...',
    '...KKKKKKKKK....',
  ]),
  modosiete: snesArt([
    '................',
    '.......KK.......',
    '......KYMK......',
    '.....KMYMYK.....',
    '....KYMYMYMK....',
    '...KMYWKYWKYK...',
    '..KYMYWKMWKMYK..',
    '.KMYMYMYMYMYMYK.',
    '..KYMYMKKKMYMK..',
    '...KYMYMYMYMK...',
    '....KYMYMYMK....',
    '.....KYMYMK.....',
    '......KYMK......',
    '.......KK.......',
    '...I........L...',
    '................',
  ]),
  caballero: snesArt([
    '.......RR.......',
    '......RRrR......',
    '.....KKKKKK.....',
    '....KZZZZZSK....',
    '....KZKKKKSK....',
    '....KZKYYKSK....',
    '....KZKKKKSK....',
    '....KZZZZSSK....',
    '..KKKKKKKKKKKK..',
    '.KZZZSKDDKSSSPK.',
    '.KZZSSKDDKSSPPK.',
    '.KZSSSKKKKSPPpK.',
    '..KSSSSSSSPPpK..',
    '...KPPPPPPPppK..',
    '...KpK....KpK...',
    '...KKK....KKK...',
  ]),
  gema: snesArt([
    '................',
    '.....KKKKKK.....',
    '....KWVVLLBK....',
    '...KWVVVLLBBK...',
    '..KKKKKKKKKKKK..',
    '..KVWVVLLLBBUK..',
    '...KVWKVLKBUK...',
    '...KVVKVLKBUK...',
    '....KVVLLBUK....',
    '.....KVLLUK.....',
    '......KLUK......',
    '.......KK.......',
    '................',
    '..I.....Y....G..',
    '.....M......O...',
    '................',
  ]),
  monobarril: snesArt([
    '................',
    '.....KKKKKK.....',
    '..KK.KNNNNNK.KK.',
    '.KnnKNNNNNNNKnnK',
    '.KnnKNFFNFFNKnnK',
    '..KKNFWKFWKFNKK.',
    '....KFFFFFFFK...',
    '....KFFKKKFFK...',
    '.....KFFFFFK....',
    '..KKKKKKKKKKKK..',
    '.KnKnnnnnnnnKnK.',
    '.KFKNNNNNNNNKFK.',
    '..KKKKKKKKKKKK..',
    '...KnnnnnnnnK...',
    '...KNNNNNNNNK...',
    '....KKKKKKKK....',
  ]),
  setita: snesArt([
    '................',
    '.....KKKKKK.....',
    '...KKRRWWRRKK...',
    '..KRRRWWWWRRRK..',
    '.KWWRRRWWRRRWWK.',
    '.KWWRRRRRRRRWWK.',
    'KRRRRWWRRRRRRRRK',
    'KRRRWWWWRRRWWRRK',
    '.KKKKKKKKKKKKKK.',
    '...KFFFFFFFFK...',
    '...KFKWFFKWFK...',
    '...KFKKFFKKFK...',
    '...KFFIFFIFFK...',
    '....KFFFFFFK....',
    '...KKNK..KNKK...',
    '...KKKK..KKKK...',
  ]),
  rayocero: snesArt([
    '................',
    '................',
    '......KKKK......',
    '.....KVVLBK.....',
    '....KVWVLBBK....',
    '..KKKKKKKKKKKK..',
    '.KYRRRRRRRRRRRK.',
    'KYYRRWWRRRRRRRrK',
    'KRRRRRRRRRRRRrrK',
    '.KrrrrrrrrrrrrK.',
    '..KKKKKKKKKKKK..',
    '..KOK......KOK..',
    '...Y........Y...',
    '..Y..........Y..',
    '................',
    '................',
  ]),
  vulpino: snesArt([
    '..K..........K..',
    '.KOK........KOK.',
    '.KOOK......KOOK.',
    '.KOWOKKKKKKOWOK.',
    '..KOOOOOOOOOOK..',
    '..KOOWWOOWWOOK..',
    '.KOOOKWOOWKOOOK.',
    '.KOOOKKOOKKOOOK.',
    '..KOWWWWWWWWOK..',
    '...KWWWKKWWWK...',
    '....KWWWWWWK....',
    '..KKKgKWWKgKKK..',
    '.KgggGKKKKGgggK.',
    '.KgGGGGYYGGGGgK.',
    '.KgGGGGGGGGGGgK.',
    '..KKKKKKKKKKKK..',
  ]),
  nebula: snesArt([
    '................',
    '.....KKKKKK.....',
    '...KKmmmmmmKK...',
    '..KmmWWmmmmmmK..',
    '.KmmWmmmmmmmmmK.',
    '.KmmmmIIIImmmmK.',
    '.KmmmIYYYYImmmK.',
    '.KmmmIYWYYImmmK.',
    '.KMMMMIIIIMMMMK.',
    '..KKKKKKKKKKKK..',
    '..Km.Km.mK.mK...',
    '...mK.m.Km.mK...',
    '..Km..mK.m..m...',
    '...m.Km..mK.K...',
    '..K...m...m.....',
    '................',
  ]),
  maestramodo: snesArt([
    '................',
    '.....KKKKKK.....',
    '....KMMMMMMK....',
    '...KMMMMMMMMK...',
    '...KMFFFFFFMK...',
    '...KMFKFFKFMK...',
    '...KMFFFFFFMK...',
    '..KYKFFIIFFKYK..',
    '....KKFFFFKK....',
    '...KLLLLLLLLK...',
    '..KLKLWLLWLKLK..',
    '..KFKLLLLLLKFK..',
    '....KLLLLLLK....',
    '....KBBKKBBK....',
    '....KBK..KBK....',
    '....KK....KK....',
  ]),
  // La consola: redondita y gris, con botones de colores (como en Japón y Europa).
  snes: snesArt([
    '................',
    '................',
    '................',
    '...KKKKKKKKKK...',
    '..KZZZZZZZZZZK..',
    '.KZZKppppppKZZK.',
    '.KZZKPPPPPPKZZK.',
    '.KSZZZZZZZZZZSK.',
    '.KSSSSSSSSSSSSK.',
    '.KSMKSSSSSSRYSK.',
    '.KSmKSSSSSSGUSK.',
    '.KPSSSSSSSSSSPK.',
    '..KPPPPPPPPPPK..',
    '...KKKKKKKKKK...',
    '................',
    '................',
  ]),
  // ---------- Tesoros ----------
  etiqueta_blanca: snesArt([
    '................',
    '................',
    '................',
    '...KKKKKKKKKK...',
    '...KWWWWWWWWK...',
    '...KWZZZZZZWK...',
    '...KWWWWWWWWK...',
    '...KWZZZZWWWK...',
    '...KWWWWWWWWK...',
    '...KWWWWWWWWK...',
    '...KWWWWWWXWK...',
    '...KKKKKKKKKK...',
    '................',
    '................',
    '................',
    '................',
  ]),
  casco_cero: snesArt([
    '................',
    '................',
    '.....KKKKKK.....',
    '...KKRRRRRRKK...',
    '..KRRWWRRRRRRK..',
    '..KRWRRRRRRRRK..',
    '.KRRRKKKKKKKRRK.',
    '.KRRKVVVLLBBKRK.',
    '.KRRKVWVLLBBKRK.',
    '.KRRRKKKKKKKRRK.',
    '.KYYYYYYYYYYYYK.',
    '..KKKKKKKKKKKK..',
    '................',
    '................',
    '................',
    '................',
  ]),
  chip_fx: snesArt([
    '................',
    '................',
    '..K.K.K.K.K.K...',
    '..KKKKKKKKKKK...',
    '.KpppppppppppK..',
    '.KpGGGGGGGGGpK..',
    '.KpGYKYKYKYGpK..',
    '.KpGKYKYKYKGpK..',
    '.KpGGGGGGGGGpK..',
    '.KpppppppppppK..',
    '..KKKKKKKKKKK...',
    '..K.K.K.K.K.K...',
    '................',
    '................',
    '................',
    '................',
  ]),
  huevo_pintado: snesArt([
    '................',
    '......KKKK......',
    '.....KWWWWK.....',
    '....KWRWWYWK....',
    '....KWWWWWWK....',
    '...KWGWWWIWWK...',
    '...KWWWWWWWWK...',
    '...KUWWMWWWOK...',
    '...KWWWWWWWWK...',
    '...KWWYWWGWWK...',
    '....KWWWWWWK....',
    '.....KKKKKK.....',
    '................',
    '................',
    '................',
    '................',
  ]),
  nebulita: snesArt([
    '................',
    '................',
    '................',
    '......KKKK......',
    '....KKmmmmKK....',
    '...KmWmmmmmmK...',
    '...KmmIYYImmK...',
    '...KMMMMMMMMK...',
    '....KKKKKKKK....',
    '....m.m..m.m....',
    '...m..m..m..m...',
    '....m..m..m.....',
    '................',
    '................',
    '................',
    '................',
  ]),
  control_colores: snesArt([
    '................',
    '................',
    '................',
    '................',
    '..KKKKKKKKKKKK..',
    '.KSSSSSSSSSSSSK.',
    'KSSKSSSSSSSYSSSK',
    'KSKKKSSSSSUSGSSK',
    'KSSKSSmmSSSRSSSK',
    '.KSSSSSSSSSSSSK.',
    '..KKKK....KKKK..',
    '................',
    '................',
    '................',
    '................',
    '................',
  ]),
  fruta_dino: snesArt([
    '................',
    '..........KK....',
    '.........KgK....',
    '........KYK.....',
    '.......KYYK.....',
    '......KYYYK.....',
    '.....KYYYDK.....',
    '....KYYYYDK.....',
    '...KYYYYDK......',
    '..KYYYYDDK......',
    '..KYYYDDK.......',
    '...KDDDK........',
    '....KKK.........',
    '................',
    '................',
    '................',
  ]),
  lente_modo7: snesArt([
    '................',
    '................',
    '.....KKKKKK.....',
    '....KYMYMYMK....',
    '...KMYMYMYMYK...',
    '...KYMYMYMYMK...',
    '...KMYMYMYMYK...',
    '...KYMYMYMYMK...',
    '....KYMYMYMK....',
    '.....KKKKKKK....',
    '..........KNK...',
    '...........KNK..',
    '............KNK.',
    '.............KK.',
    '................',
    '................',
  ]),
  escudo_16: snesArt([
    '................',
    '...KKKKKKKKKK...',
    '..KZZZZZZZZSSK..',
    '..KZBBBBBBBBSK..',
    '..KZBBBDDBBBSK..',
    '..KZBBDDDDBBSK..',
    '..KZBBBDDBBBSK..',
    '..KZBBBDDBBBSK..',
    '...KZBBBBBBSK...',
    '...KZBBBBBBSK...',
    '....KZBBBBSK....',
    '.....KZSSSK.....',
    '......KKKK......',
    '................',
    '................',
    '................',
  ]),
  gema_32k: snesArt([
    '................',
    '................',
    '................',
    '.....KKKKKK.....',
    '....KWIIMMMK....',
    '...KKKKKKKKKK...',
    '...KIWIIMMMMK...',
    '....KIIIMMMK....',
    '.....KIIMMK.....',
    '......KIMK......',
    '.......KK.......',
    '................',
    '................',
    '................',
    '................',
    '................',
  ]),
  barril_3d: snesArt([
    '................',
    '................',
    '....KKKKKKKK....',
    '...KnnnnnnnnK...',
    '..KKKKKKKKKKKK..',
    '..KNnNNNNNNnNK..',
    '..KNnNNNNNNnNK..',
    '..KpppppppppNK..',
    '..KNnNNNNNNnNK..',
    '..KNnNNNNNNnNK..',
    '..KKKKKKKKKKKK..',
    '...KnnnnnnnnK...',
    '....KKKKKKKK....',
    '................',
    '................',
    '................',
  ]),
};

// ---------- Tecloides nuevos (lore §3.1) ----------
TTYPES.estatica = 'ESTATICA';
// Los de otros mundos se definen solo si nadie los definió antes.
// Las evoluciones: el mismo dibujo, con más colores.
addTecloide('volton', {
  name: 'Voltón', type: 'chispa', sprite: 'volton', hp: 56,
  desc: 'Voltín ya creció. Chispea con dieciséis colores.',
  moves: [move('Chispazo', 'zas', 20, 'chispa'), TECLEO, move('Rayo doble', 'rayo doble', 45, 'chispa'), move('Trueno', 'trueno', 50, 'chispa', 'aturdir')],
}, snesArt(SPRITES.voltin.slice(), { a: '#ffffff', b: '#ffd93d', c: '#ff8c1a', d: '#1a1a2e' }));
addTecloide('goton', {
  name: 'Gotón', type: 'gota', sprite: 'goton', hp: 60,
  desc: 'Gotín ya creció. Su gorra ahora es de capitán.',
  moves: [move('Salpicón', 'salpica', 30, 'gota'), TECLEO, move('Cascada', 'cascada', 45, 'gota'), move('Marea', 'marea alta', 55, 'gota')],
}, snesArt(SPRITES.gotin.slice(), { a: '#ffffff', b: '#9be7ff', c: '#3b7bd8', d: '#1a1a2e' }));
addTecloide('broton', {
  name: 'Brotón', type: 'brote', sprite: 'broton', hp: 64,
  desc: 'Brotín ya creció. Le salieron más hojas que a un árbol de Navidad.',
  moves: [move('Hojita', 'hoja', 20, 'brote'), TECLEO, move('Enredadera', 'enredadera', 45, 'brote'), move('Raíz', 'raíces profundas', 55, 'brote', 'curar')],
}, snesArt(SPRITES.brotin.slice(), { a: '#ffe2c0', b: '#9be86e', c: '#3fbf3f', d: '#1a1a2e' }));
addTecloide('pilin', {
  name: 'Pilín', type: 'chispa', sprite: 'pilin', hp: 46,
  desc: 'Una pila AA con patitas. Siempre está al cien.',
  moves: [move('Pilazo', 'pila', 20, 'chispa'), TECLEO, move('Descarga', 'descarga', 40, 'chispa'), move('Cortocircuito', 'cortocircuito', 55, 'chispa', 'aturdir')],
}, snesArt([
  '................',
  '.......KK.......',
  '......KPPK......',
  '.....KKKKKK.....',
  '.....KYYYYK.....',
  '.....KYKYKK.....',
  '.....KYYYYK.....',
  '.....KYIIYK.....',
  '.....KKKKKK.....',
  '.....KppppK.....',
  '.....KpWppK.....',
  '.....KppppK.....',
  '.....KKKKKK.....',
  '......K..K......',
  '.....KK..KK.....',
  '................',
]));
addTecloide('burbujin', {
  name: 'Burbujín', type: 'gota', sprite: 'burbujin', hp: 50,
  desc: 'Una burbuja que se escapó de una pantalla de tubo.',
  moves: [move('Burbuja', 'burbuja', 25, 'gota'), TECLEO, move('Espuma', 'espuma', 35, 'gota'), move('Tsunami', 'gran ola', 50, 'gota')],
}, snesArt([
  '................',
  '................',
  '.....KKKKKK.....',
  '....KVVLLLLK....',
  '...KVWWLLLLLK...',
  '..KVWWLLLLLLUK..',
  '..KVWLKLLKLLUK..',
  '..KLLLKLLKLLUK..',
  '..KLLLLLLLLLUK..',
  '..KLLLIKKILUUK..',
  '...KLLLLLLUUK...',
  '....KUUUUUUK....',
  '.....KKKKKK.....',
  '................',
  '................',
  '................',
]));
addTecloide('hongolo', {
  name: 'Hongoló', type: 'brote', sprite: 'hongolo', hp: 50,
  desc: 'Un honguito saltarín. Tu amigo desde que perdonaste a Setita.',
  moves: [move('Esporas', 'esporas', 30, 'brote'), TECLEO, move('Brinco', 'brinco', 35, 'brote'), move('Bosque mágico', 'bosque mágico', 55, 'brote', 'curar')],
}, snesArt(SNES_SPRITES.setita.map((r, i) => (i < 8 ? r.replace(/R/g, 'G').replace(/W/g, 'Y') : r))));
// "???" — el Tecloide raro que el Glitch le dio a Dani. A veces no obedece.
addTecloide('glitchon', {
  name: '???', type: 'estatica', sprite: 'glitchon', hp: 58, flaky: 0.3,
  desc: 'Nadie sabe qué es. Hace ruido de tele sin señal.',
  moves: [move('Ruido', 'ruido', 30, 'estatica'), move('Estática', 'estática', 40, 'estatica'), move('Borrar', 'borrar', 35, 'estatica'), move('Pausa', 'pausa eterna', 45, 'estatica')],
}, snesArt(rowsOf((x, y) => {
  const dx = x - 7.5;
  const dy = y - 8;
  if (dx * dx / 49 + dy * dy / 42 > 1) return '.';
  if ((y === 6 || y === 7) && (x === 5 || x === 10)) return 'W';
  if (y === 11 && x > 4 && x < 11) return 'K';
  return 'XKpWX'[(x * 7 + y * 13 + x * y) % 5];
})));

// El equipo de Dani en la Arena Modo 7: su inicial ya evolucionado, otro del tipo que te gana
// y "???". Los niveles van de acuerdo con los tuyos (el lore dice 14/12/15; aquí se ajusta solo).
const DANI_EVOLVED = { voltin: 'volton', gotin: 'goton', brotin: 'broton' };
const SECOND_OF = { chispa: 'pilin', gota: 'burbujin', brote: 'hongolo' };
TRAINERS.dani3 = {
  name: 'Dani Turbo',
  sprite: 'dani',
  music: 'snes_arena',
  musicCasi: 'snes_arena_casi',
  team: (starter) => {
    const top = Math.max(5, ...(Save.data.team || []).map((t) => t.lv));
    const c = COUNTER[starter] || 'voltin';
    return [
      { id: DANI_EVOLVED[c], lv: top + 1 },
      { id: SECOND_OF[TECLOIDES[c].type], lv: top },
      { id: 'glitchon', lv: top + 1 },
    ];
  },
  intro: [
    '* DANI: ¡Bienvenido a la ARENA MODO 7!\n* El piso gira. Yo no. Yo GANO.',
    '* DANI: Mira mi equipo nuevo. Este de aquí...\n* me lo dio un tipo morado en la pista. Dice que es ÚNICO.',
    '* BIT: ¿Un tipo morado? ...Eso no me gusta nada.',
    '* PROFESORA LETRA: ¡Es de tipo ESTATICA! Nunca lo había visto.\n* Dicen que el tipo BYTE le pega doble. ¡Usa TECLEO!',
    '* PROFESORA LETRA: Y si tienes más Tecloides, cámbialos con TECLOIDE\n* para aprovechar los tipos.',
    '* ¡DANI TURBO quiere pelear! (3 contra 3)',
  ],
  lose: ['* DANI: ...¡Mi equipo de tres!\n* Ok. Fuiste rápido. MUY rápido.', '* DANI: Ese ??? no me hacía caso.\n* ...Creo que no era un regalo. Era una trampa.'],
  win: ['* DANI: ¡Ja! ¡Tres contra uno es lo justo para mí!'],
  retry: ['* PROFESORA LETRA: ¡Ya curé a tu equipo! Recuerda: BYTE contra ESTATICA.', '* DANI: Otra vez. Pero rápido, que mi piso se marea.'],
};

// Da un Tecloide nuevo al equipo (máximo 3). Devuelve el texto para el diálogo, o '' si no cupo.
function giveTecloide(id) {
  const team = Save.data.team || (Save.data.team = []);
  if (team.some((t) => t.id === id) || team.length >= 3) return '';
  const lv = Math.max(5, ...team.map((t) => t.lv)) - 1;
  team.push({ id, lv: Math.max(5, lv), xp: 0 });
  Save.write();
  Sfx.secret();
  return `* ¡${upper(TECLOIDES[id].name)} se unió a tu equipo de Tecloides!\n* (Ahora tienes ${team.length}. Cámbialos con TECLOIDE.)`;
}

// ---------- Música (melodías originales, lore §14) ----------
// Todas las pistas usan era 'snes': ondas "sampleadas" y acolchadas, envolventes suaves y el eco
// del chip de sonido de la Super Nintendo. Las melodías son nuevas, escritas al ESTILO de los
// juegos de 16 bits (shuffle con bongós, marcha épica, rock de carreras, ambiente submarino...).
// Se arman como texto plano (sin `form`, sin "( )*n" ni "|"): la Copia de Sombra de GameCube
// (gcShadowTrack en gc.js) recorta `notes` ficha por ficha y necesita fichas sueltas.

// Ayudantes: de acordes a notas. Las notas se cuentan en MIDI (C4 = 60).
const S16_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const S16_NAME = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const S16_Q = { '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], m7: [0, 3, 7, 10], dim: [0, 3, 6] };
const s16n = (m) => `${S16_NAME[m % 12]}${Math.floor(m / 12) - 1}`;
// Notas del acorde (raíz, tercera, quinta[, séptima]) desde la primera raíz en `base` o arriba.
function s16Chord(sym, base) {
  const m = /^([A-G])([#b]?)(.*)$/.exec(sym);
  const pc = (S16_PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12;
  const root = base + ((pc - (base % 12) + 12) % 12);
  return S16_Q[m[3]].map((i) => root + i);
}
// Repite una celda hasta llenar `steps` pasos; cell(i) da las fichas de la celda número i.
const s16Fill = (steps, size, cell) => Array.from({ length: Math.round(steps / size) }, (_, i) => cell(i)).join(' ');
// Una progresión 'Em C|D ...' (un compás por palabra; "|" lo parte a la mitad) → fn(acorde, pasos).
const s16Bars = (prog, len, fn) => prog.trim().split(/\s+/).map((bar) => {
  const cs = bar.split('|');
  return cs.map((c) => fn(c, len / cs.length)).join(' ');
}).join(' ');
const s16Chd = (c, base) => s16Chord(c, base).map(s16n).join('+');
// Patrones de acompañamiento: (acorde, pasos) → fichas.
const S16P = {
  // Bajo que rebota (raíz, quinta y octava), celdas de 8.
  bounce: (c, st) => { const [r] = s16Chord(c, 40); return s16Fill(st, 8, () => `${s16n(r)}/3 ${s16n(r)}/1. ${s16n(r + 7)}/2. ${s16n(r + 12)}/2`); },
  // Bajo que camina en negras: raíz, octava, quinta, octava.
  walk: (c, st) => { const [r] = s16Chord(c, 40); const w = [r, r + 12, r + 7, r + 12]; return s16Fill(st, 4, (i) => `${s16n(w[i % 4])}/4`); },
  // Bajo en corcheas: raíz y octava (batalla).
  drive: (c, st) => { const [r] = s16Chord(c, 40); return s16Fill(st, 4, (i) => `${s16n(r)}/2${i % 2 ? '' : '!'} ${s16n(r + 12)}/2.`); },
  // Bajo de rock: raíz en corcheas con un salto a la octava.
  rock: (c, st) => { const [r] = s16Chord(c, 40); return s16Fill(st, 8, () => `${s16n(r)}/2! ${s16n(r)}/2 ${s16n(r + 12)}/2 ${s16n(r)}/2`); },
  // Bajo largo (ambiente).
  long: (c, st) => `${s16n(s16Chord(c, 36)[0])}/${st}`,
  // Acorde a contratiempo: el "chik" del shuffle.
  skank: (c, st) => s16Fill(st, 4, () => `-/2 ${s16Chd(c, 55)}/2.`),
  // Acorde largo para pads.
  pad: (base) => (c, st) => `${s16Chd(c, base)}/${st}`,
  // Semicorcheas de cuerdas: raíz, quinta, tercera, quinta.
  ostinato: (base) => (c, st) => { const t = s16Chord(c, base).map(s16n); return s16Fill(st, 4, (i) => `${t[0]}/1${i % 4 ? '?' : ''} ${t[2]}/1? ${t[1]}/1? ${t[2]}/1?`); },
  // Arpegio de sintetizador que sube en semicorcheas.
  arpUp: (base) => (c, st) => { const t = s16Chord(c, base); const seq = [t[0], t[1], t[2], t[0] + 12]; return s16Fill(st, 1, (i) => `${s16n(seq[i % 4])}/1${i % 4 ? '?' : ''}`); },
  // Golpes de metales: largo-largo-corto y, en la otra mitad, dos a contratiempo.
  stabs: (c, st) => { const ch = s16Chd(c, 55); return s16Fill(st, 8, (i) => (i % 2 ? `-/4 ${ch}/2. ${ch}/2.` : `${ch}/3! ${ch}/3 ${ch}/2.`)); },
  // Power chord (raíz, quinta y octava) con apagado de palma, para la guitarra.
  power: (c, st) => { const [r] = s16Chord(c, 49); const pc = [r, r + 7, r + 12].map(s16n).join('+'); return s16Fill(st, 8, () => `${pc}/2! ${pc}/2. -/1 ${pc}/1 ${pc}/2.`); },
};
// Guitarra "distorsionada" hecha de armónicos (la SNES la tocaba con una muestra).
const S16_GUITAR = [1, 0.85, 0.7, 0.55, 0.5, 0.42, 0.35, 0.3, 0.25, 0.2, 0.16, 0.12];

const SNES_TRACKS = {
  // Mapa del reino: shuffle saltarín en Re mayor con bongós, 132 BPM, 32 compases (~58 s).
  // Al estilo de los plataformeros de 16 bits: swing, bajo que rebota y acordes a contratiempo.
  // Forma A A' B A': en A' entran las cuerdas y la batería completa; B sube hasta un Fa# agudo.
  snes_map: (() => {
    const pA1 = 'D Bm G A D F#m G|A Em|A7';
    const pA2 = 'D Bm G A D F#m G|A D';
    const pB = 'G A F#m Bm Em A Bm|G E7|A7';
    const m7 = 'A4/2 D5/2 F#5/3 E5/1 D5/2 F#5/2 A5/4 B5/2 A5/2 F#5/2 D5/2 F#5/4 -/2 B4/2 ' +
      'D5/2 G5/2 B5/3 A5/1 G5/2 B5/2 D6/4! C#6/2 B5/2 A5/2 G5/2 E5/4 -/4 ' +
      'A4/2 D5/2 F#5/3 E5/1 D5/2 F#5/2 A5/4 C#6/2 A5/2 F#5/2 C#5/2 E5/4 F#5/2 E5/2 ' +
      'D5/2 E5/2 G5/2 F#5/2 E5/2 F#5/2 G5/2 C#5/2';
    const melA1 = `${m7} E5/6 -/2 G5/2 E5/2 C#5/2 B4/2`;
    const melA2 = `${m7} D5/4 A5/2 F#5/2 D6/4! -/4`;
    const melB = 'B5/4 A5/2 G5/2 D5/4 G5/2 A5/2 C#6/4 B5/2 A5/2 E5/6 -/2 ' +
      'A5/2 F#5/2 C#5/2 F#5/2 A5/2 C#6/2 E6/4 D6/6 C#6/2 B5/4 F#5/4 ' +
      'G5/2 B5/2 E6/4^ D6/2 B5/2 G5/2 E5/2 A5/2 C#6/2 E6/4! F#6/4! E6/4 ' +
      'D6/2 C#6/2 B5/2 F#5/2 G5/2 A5/2 B5/2 D6/2 E6/4 D6/2 B5/2 C#6/2 B5/2 A5/2 G5/2';
    const sec = (fn) => [pA1, pA2, pB, pA2].map((p) => s16Bars(p, 16, fn)).join(' ');
    const groove = 'k/4 h/2 h/2? s/4 h/2 h/2?';
    const fill = 'k/2 s/2 s/1? s/1 s/2 t/2 t/2 T/2 T/2';
    const drA = (lite) => `c+${groove} ${Array(6).fill(lite ? 'k/4 h/2 h/2? k/4 h/2 h/2?' : groove).join(' ')} ${fill}`;
    const bongoA = Array(16).fill('-/2 t/1? t/1 T/2 t/2').join(' ');
    const bongoB = Array(8).fill('t/2 t/1? t/1 T/2 t/2 t/2 T/2 t/1? t/1 T/2').join(' ');
    return {
      bpm: 132, era: 'snes', swing: 0.18,
      voices: [
        { wave: 'square', vol: 0.04, notes: [melA1, melA2, melB, melA2].join(' ') },
        { wave: 'triangle', vol: 0.075, fx: 0, notes: [pA1, pA2].map((p) => s16Bars(p, 16, S16P.bounce)).join(' ') + ' ' +
          s16Bars(pB, 16, S16P.walk) + ' ' + s16Bars(pA2, 16, S16P.bounce) },
        { wave: 'organ', vol: 0.02, env: 'stab', poly: true, fx: 0.5, pan: 0.25, notes: sec(S16P.skank) },
        { wave: 'sawtooth', vol: 0.018, env: 'pad', poly: true, pan: -0.25, notes: `-/128 ${[pA2, pB, pA2].map((p) => s16Bars(p, 16, S16P.pad(62))).join(' ')}` },
        { wave: 'noise', vol: 0.02, fx: 0.15, notes: [drA(true), drA(false), drA(false), drA(false)].join(' ') },
        { wave: 'noise', vol: 0.014, fx: 0.3, pan: -0.3, notes: [bongoA, bongoA, bongoB, bongoA].join(' ') },
      ],
    };
  })(),

  // Batalla normal: marcha épica en Mi menor, 160 BPM, 32 compases (~48 s) + 2 de entrada.
  // Metales al frente, cuerdas en semicorcheas, golpes de metales y redobles de timbal;
  // el puente cae al acorde napolitano (Fa mayor) antes de volver.
  snes_battle: (() => {
    const pA1 = 'Em Em C D Em Em C B7';
    const pA2 = 'Em Em C D Em Em C|D Em';
    const pB = 'C D Bm Em C D B B7';
    const pC = 'Am Em Am Em F F B B';
    const m7 = 'E5/3 B4/1 E5/2 G5/2 B5/4 A5/2 G5/2 F#5/3 G5/1 F#5/2 E5/2 D5/2 E5/2 B4/4 ' +
      'C5/3 E5/1 G5/2 C6/2 B5/4 A5/2 G5/2 A5/6 F#5/2 D5/4 -/4 ' +
      'E5/3 B4/1 E5/2 G5/2 B5/4 D6/2 C6/2 B5/3 A5/1 G5/2 F#5/2 G5/2 A5/2 B5/4';
    const melA1 = `${m7} C6/4 B5/2 A5/2 G5/2 A5/2 E5/4 D#5/4 F#5/4 B5/6 -/2`;
    const melA2 = `${m7} C6/4 G5/2 E5/2 F#5/4 A5/2 D6/2 E6/4! B5/2 G5/2 E5/4 -/4`;
    const melB = 'G5/2 C6/2 E6/4 D6/2 C6/2 B5/2 C6/2 D6/6 A5/2 F#5/4 D6/4 ' +
      'D6/2 B5/2 F#5/2 B5/2 D6/4 C#6/2 D6/2 E6/8 -/2 B5/2 G5/2 E5/2 ' +
      'E5/2 G5/2 C6/4 D6/2 E6/2 D6/2 C6/2 D6/2 E6/2 F#6/6! E6/2 D6/4 ' +
      'D#6/6! B5/2 F#5/4 B5/4 A5/2 B5/2 A5/2 G5/2 F#5/2 E5/2 D#5/4';
    const melC = 'A4/8 C5/8 B4/8 G4/8 A4/4 C5/4 E5/4 A5/4 G5/12 F#5/4 ' +
      'F5/8 A5/8 C6/16 B5/8 D#6/8 B5/2 C6/2 B5/2 A5/2 G5/2 F#5/2 E5/2 D#5/2';
    const all = [pA1, pA2, pB, pC];
    const sec = (fn, list = all) => list.map((p) => s16Bars(p, 16, fn)).join(' ');
    const groove = 'k/2 h/2 s/2 h/2 k/2 k/2 s/2 h/2';
    const fill = 'k/2 h/2 s/2 h/2 s/1 s/1 t/2 t/2 T/2';
    const drA = `c+${groove} ${Array(6).fill(groove).join(' ')} ${fill}`;
    const drC = `${Array(6).fill('T/4! -/4 T/4 -/2 T/2').join(' ')} T/2 T/2 T/2 T/2 t/2 t/2 T/2 T/2 ${Array(12).fill('s/1').join(' ')} s/2 s/2!`;
    return {
      bpm: 160, era: 'snes',
      voices: [
        { wave: 'brass', vol: 0.04, intro: 'B4/2! -/2 B4/2! -/2 B4/2! -/2 A4/2 B4/2 E5/4! D5/2 E5/2 F#5/2 G5/2 A5/2 B5/2',
          notes: [melA1, melA2, melB, melC].join(' ') },
        { wave: 'sawtooth', vol: 0.019, legato: 0.7, pan: -0.3, intro: s16Bars('Em Em', 16, S16P.ostinato(64)), notes: sec(S16P.ostinato(64)) },
        { wave: 'brass', vol: 0.02, env: 'stab', poly: true, pan: 0.3, intro: '-/32',
          notes: `${sec(S16P.stabs, [pA1, pA2, pB])} ${s16Bars(pC, 16, S16P.pad(57))}` },
        { wave: 'triangle', vol: 0.075, fx: 0, intro: 'E2/2! -/2 E2/2! -/2 E2/2! -/2 D2/2 D#2/2 E2/16',
          notes: `${sec(S16P.drive, [pA1, pA2, pB])} ${s16Bars(pC, 16, (c, st) => S16P.walk(c, st))}` },
        { wave: 'noise', vol: 0.022, fx: 0.15, intro: 'c+k/2! -/2 k/2! -/2 k/2! -/2 s/2 s/2 s/1 s/1 s/1 s/1 t/2 t/2 T/2 T/2 s/1 s/1 s/2!',
          notes: [drA, drA, drA, drC].join(' ') },
      ],
    };
  })(),

  // Rayo Cero (carrera): rock de carreras futuristas en Fa# menor, 175 BPM, 36 compases (~49 s).
  // Riff de guitarra con el bajo al unísono, power chords apagados, coro que sube a Sol# agudo
  // y un "solo" de arpegios en semicorcheas.
  snes_rayo: (() => {
    const pA = 'F#m D E F#m F#m D E C#';
    const pB = 'D E C#m F#m D E C# C#';
    const pC = 'Bm C#m D E Bm C#m D C#';
    const riffG = 'F#3/2! F#3/2 A3/2 F#3/1 B3/1 F#3/2 C#4/2 B3/2 A3/2 F#3/2! F#3/2 A3/2 F#3/1 B3/1 F#3/2 E3/2 D3/2 E3/2';
    const riffB = riffG.replace(/([A-G]#?)(\d)/g, (m, n, o) => `${n}${o - 1}`); // el bajo, una octava abajo
    const melA = 'C#5/2 F#5/2 A5/2 G#5/2 F#5/4 E5/2 F#5/2 A5/6 F#5/2 D5/4 E5/2 F#5/2 ' +
      'G#5/4 E5/2 B4/2 E5/2 G#5/2 B5/4 A5/3 G#5/1 F#5/4 C#5/8 ' +
      'C#5/2 F#5/2 A5/2 C#6/2 B5/2 A5/2 G#5/2 A5/2 F#5/6 A5/2 D6/4 C#6/2 B5/2 ' +
      'B5/4 G#5/2 E5/2 B5/4 E6/4 C#6/6 G#5/2 F5/4 C#5/4';
    const melB = 'D6/4 C#6/2 A5/2 F#5/4 A5/2 D6/2 E6/6 D6/2 B5/4 G#5/4 ' +
      'C#6/2 E6/2 G#6/4! F#6/2 E6/2 C#6/4 F#6/8 E6/2 C#6/2 A5/4 ' +
      'A5/2 D6/2 F#6/4 E6/2 D6/2 A5/4 B5/2 E6/2 G#6/4 F#6/2 E6/2 B5/4 ' +
      'G#5/2 C#6/2 F6/4! G#6/4! F6/4 C#6/8 G#5/2 F5/2 C#5/4';
    // Solo: arpegios de ida y vuelta por cada acorde; el último compás aterriza largo.
    const solo = pC.split(' ').slice(0, 7).map((c, i) => {
      const t = s16Chord(c, 66);
      const up = [t[0], t[1], t[2], t[0] + 12, t[1] + 12, t[2] + 12, t[1] + 12, t[0] + 12];
      const seq = i % 2 ? up.slice().reverse() : up;
      return seq.concat(seq).map((m, k) => `${s16n(m)}/1${k % 4 ? '' : '!'}`).join(' ');
    }).join(' ') + ' F6/8! C#6/4 G#5/4';
    const grooveA = 'k/2 h/2 s/2 h/2 k/2 k/2 s/2 h/2';
    const grooveB = 'k/2 o/2 s/2 o/2 k/2 k/2 s/2 o/2';
    const grooveC = 'k/2 h/1 h/1 s/2 h/1 h/1 k/2 k/2 s/2 h/1 h/1';
    const fill = 'k/2 h/2 s/2 h/2 s/1 s/1 s/1 s/1 t/1 t/1 T/1 T/1';
    const eight = (g, f = fill) => `c+${g} ${Array(6).fill(g).join(' ')} ${f}`;
    const riffDr = 'k/2 k/2 s/2 k/2 k/2 k/2 s/2 h/2 k/2 k/2 s/2 k/2 s/1 s/1 s/1 s/1 t/2 T/2';
    return {
      bpm: 175, era: 'snes',
      voices: [
        { wave: 'brass', vol: 0.04, vib: { rate: 6, depth: 0.25, delay: 0.18 }, intro: '-/32',
          notes: [melA, melA, '-/32', melB, solo, '-/32'].join(' ') },
        { wave: S16_GUITAR, vol: 0.022, env: 'stab', poly: true, filter: 2600, pan: -0.35, intro: riffG,
          notes: [s16Bars(pA, 16, S16P.power), s16Bars(pA, 16, S16P.power), riffG, s16Bars(pB, 16, S16P.power), s16Bars(pC, 16, S16P.power), riffG].join(' ') },
        { wave: 'triangle', vol: 0.075, fx: 0, intro: riffB,
          notes: [s16Bars(pA, 16, S16P.rock), s16Bars(pA, 16, S16P.rock), riffB, s16Bars(pB, 16, S16P.rock), s16Bars(pC, 16, S16P.rock), riffB].join(' ') },
        { wave: 'sawtooth', vol: 0.019, env: 'pad', poly: true, pan: 0.35, intro: '-/32',
          notes: ['-/128', s16Bars(pA, 16, S16P.pad(61)), '-/32', s16Bars(pB, 16, S16P.pad(61)), '-/128', '-/32'].join(' ') },
        { wave: 'noise', vol: 0.022, fx: 0.12, intro: riffDr,
          notes: [eight(grooveA), eight(grooveA), riffDr, eight(grooveB), eight(grooveC), riffDr].join(' ') },
      ],
    };
  })(),

  // Capitán Vulpino: fanfarria espacial en Si bemol mayor, 150 BPM, 32 compases (~51 s) + 2.
  // Metales heroicos, arpegio de sintetizador en semicorcheas y redoble de marcha;
  // B se va a Sol menor y su clímax llega a Sol agudo antes de la subida final.
  snes_vulpino: (() => {
    const pA1 = 'Bb F Gm Eb Bb F Eb|F F';
    const pA2 = 'Bb F Gm Eb Bb F Eb|F Bb';
    const pB = 'Gm Gm Eb Eb Cm D Gm D';
    const pC = 'Eb F Dm Gm Cm Eb F F';
    const m7 = 'F4/2 Bb4/2 D5/4 F5/6 D5/2 C5/4 F5/2 A5/2 G5/4 F5/4 ' +
      'G5/3 F5/1 D5/2 Bb4/2 D5/4 G5/4 G5/6 F5/2 Eb5/4 -/4 ' +
      'F4/2 Bb4/2 D5/4 F5/4 Bb5/4 A5/3 G5/1 F5/2 C5/2 F5/4 A5/4 G5/4 Bb5/4 A5/4 C6/4';
    const melA1 = `${m7} C6/6 A5/2 F5/4 C5/4`;
    const melA2 = `${m7} Bb5/8! F5/2 D5/2 Bb4/4`;
    const melB = 'D5/4 G5/4 Bb5/6 A5/2 G5/4 F#5/2 G5/2 D5/8 Eb5/4 G5/4 Bb5/4 Eb6/4 D6/6 C6/2 Bb5/8 ' +
      'C6/4 Bb5/2 G5/2 Eb6/6 D6/2 D6/4 F#5/4 A5/4 C6/4 Bb5/4 A5/2 G5/2 D6/4 G6/4! F#6/8 D6/4 A5/4';
    const melC = 'G5/2 Bb5/2 Eb6/4 D6/4 Bb5/4 C6/2 A5/2 F5/4 A5/4 C6/4 D6/6 C6/2 A5/4 F5/4 G5/8 D5/4 G5/4 ' +
      'Eb5/2 G5/2 C6/4 Bb5/2 G5/2 Eb5/4 G5/2 Bb5/2 Eb6/4 F6/4 G6/4 F6/12! -/4 -/16';
    const all = [pA1, pA2, pB, pC];
    const sec = (fn, list = all) => list.map((p) => s16Bars(p, 16, fn)).join(' ');
    const groove = 'k/2 h/2 s/2 h/2 k/2 k/2 s/2 s/1? s/1';
    const fill = 's/1 s/1 s/1 s/1 s/2 s/2 t/2 t/2 T/2 T/2';
    const drA = `c+${groove} ${Array(6).fill(groove).join(' ')} ${fill}`;
    const drC = `c+${groove} ${Array(6).fill(groove).join(' ')} ${Array(14).fill('s/1').join(' ')} s/2!`;
    return {
      bpm: 150, era: 'snes',
      voices: [
        { wave: 'brass', vol: 0.04, intro: 'F4/2! F4/1 F4/1 F4/2 Bb4/2 D5/4 F5/4 Bb5/12! -/4',
          notes: [melA1, melA2, melB, melC].join(' ') },
        { wave: 'square', vol: 0.018, env: 'pluck', pan: 0.3, legato: 0.6, intro: s16Bars('Bb Bb', 16, S16P.arpUp(58)), notes: sec(S16P.arpUp(58)) },
        { wave: 'sawtooth', vol: 0.018, env: 'pad', poly: true, pan: -0.3, intro: 'A#3+D4+F4/32',
          notes: `-/128 ${sec(S16P.pad(58), [pA2, pB, pC])}` },
        { wave: 'triangle', vol: 0.075, fx: 0, intro: 'A#1/2! A#1/1 A#1/1 A#1/2 A#1/2 A#1/4 A#2/4 A#1/16',
          notes: sec(S16P.rock) },
        { wave: 'noise', vol: 0.022, fx: 0.15, intro: `c+k/4! -/4 s/1 s/1 s/1 s/1 s/2 s/2 c+k/4! -/4 ${Array(8).fill('s/1').join(' ')}`,
          notes: [drA, drA, drA, drC].join(' ') },
      ],
    };
  })(),

  // Arena Modo 7 (Dani Turbo, reto de Tecloides): batalla de rock orquestal en La menor,
  // 165 BPM, 32 compases (~47 s) + 2 de sirena. Cuerdas en semicorcheas y golpes de metales.
  snes_arena: (() => {
    const pA1 = 'Am Am F G Am Am Dm E';
    const pA2 = 'Am Am F G Am Am Dm Am';
    const pB = 'F G Em Am F G E E7';
    const pC = 'Dm Am Dm Am Bb Bb E E';
    const m7 = 'A4/2 C5/2 E5/2 A5/4 G5/2 E5/2 C5/2 D5/3 E5/1 C5/2 B4/2 A4/4 E4/4 ' +
      'F4/2 A4/2 C5/2 F5/4 E5/2 F5/2 A5/2 G5/6 F5/2 E5/2 D5/2 B4/4 ' +
      'A4/2 C5/2 E5/2 A5/4 B5/2 C6/2 A5/2 B5/3 C6/1 B5/2 A5/2 G5/2 E5/2 C5/4 ' +
      'D5/2 F5/2 A5/2 D6/4 C6/2 A5/2 F5/2';
    const melA1 = `${m7} G#5/4 B5/4 E6/6 -/2`;
    const melA2 = `${m7} A5/8 E5/2 C5/2 A4/4`;
    const melB = 'C6/4 A5/2 F5/2 C6/2 D6/2 C6/4 B5/6 G5/2 D5/4 B5/4 E6/4 B5/2 G5/2 E6/2 G6/2 F#6/4 E6/8 C6/4 A5/4 ' +
      'A5/2 C6/2 F6/4 E6/2 D6/2 C6/4 B5/2 D6/2 G6/4! F6/2 E6/2 D6/4 E6/4 D6/2 B5/2 G#5/4 B5/4 ' +
      'D6/2 C6/2 B5/2 A5/2 G#5/2 E5/2 B4/2 G#4/2';
    const melC = 'F5/8 E5/4 D5/4 E5/8 C5/4 A4/4 D5/4 F5/4 A5/4 D6/4 C6/12 B5/4 ' +
      'A#5/8 A5/4 F5/4 D6/8 C6/4 A#5/4 B5/4 G#5/4 E5/4 G#5/4 B5/12 -/4';
    const all = [pA1, pA2, pB, pC];
    const sec = (fn, list = all) => list.map((p) => s16Bars(p, 16, fn)).join(' ');
    const groove = 'k/2 h/2 s/2 h/2 k/2 k/2 s/2 h/1 h/1';
    const fill = 'k/2 h/2 s/2 h/2 s/1 s/1 s/1 s/1 t/2 T/2';
    const dr = (g) => `c+${g} ${Array(6).fill(g).join(' ')} ${fill}`;
    return {
      bpm: 165, era: 'snes',
      voices: [
        { wave: 'square', vol: 0.038,
          intro: 'A4/2! -/2 A4/2! -/2 A4/2! -/2 G4/2 G#4/2 E5/1 D5/1 C5/1 B4/1 A4/1 G#4/1 A4/1 B4/1 C5/1 D5/1 E5/1 F5/1 E5/4!',
          notes: [melA1, melA2, melB, melC].join(' ') },
        { wave: 'sawtooth', vol: 0.019, legato: 0.7, pan: -0.3, intro: s16Bars('Am E', 16, S16P.ostinato(64)), notes: sec(S16P.ostinato(64)) },
        { wave: 'brass', vol: 0.02, env: 'stab', poly: true, pan: 0.3, intro: '-/32', notes: `-/128 ${sec(S16P.stabs, [pA2, pB, pC])}` },
        { wave: 'triangle', vol: 0.075, fx: 0, intro: 'A2/2! -/2 A2/2! -/2 A2/2! -/2 G2/2 G#2/2 E2/16', notes: sec(S16P.drive) },
        { wave: 'noise', vol: 0.022, fx: 0.15, intro: 'c+k/2! -/2 k/2! -/2 k/2! -/2 s/2 s/2 s/1 s/1 s/1 s/1 s/1 s/1 s/1 s/1 t/2 t/2 T/2 T/2',
          notes: [dr(groove), dr(groove), dr('k/2 o/2 s/2 o/2 k/2 k/2 s/2 o/2'), dr('k/4 h/2 h/2 s/4 h/2 h/2')].join(' ') },
      ],
    };
  })(),
  // "¡Casi!" de la Arena: la misma banda pasa a Do mayor y acelera a 170 BPM, 32 compases (~45 s).
  snes_arena_casi: (() => {
    const pA1 = 'C C F G Am F D7 G';
    const pA2 = 'C C F G Am F D7 C';
    const pB = 'F G Em Am Dm G C G7';
    const m7 = 'G4/2 C5/2 E5/2 G5/4 E5/2 G5/2 C6/2 B5/3 C6/1 B5/2 G5/2 E5/4 C5/4 ' +
      'A4/2 C5/2 F5/2 A5/4 G5/2 A5/2 C6/2 D6/6 C6/2 B5/2 A5/2 G5/4 ' +
      'A5/2 C6/2 E6/4 D6/2 C6/2 A5/4 F5/2 A5/2 C6/4 B5/2 A5/2 F5/4 ' +
      'F#5/2 A5/2 C6/2 D6/4 C6/2 A5/2 F#5/2';
    const melA1 = `${m7} G5/4 B5/4 D6/6 -/2`;
    const melA2 = `${m7} C6/8! G5/2 E5/2 C5/4`;
    const melB = 'A5/4 C6/4 F6/6 E6/2 D6/4 B5/4 G5/8 G5/2 B5/2 E6/4 D6/2 B5/2 G5/4 A5/4 C6/4 E6/4 A6/4! ' +
      'F6/6 E6/2 D6/4 A5/4 B5/2 D6/2 G6/4 F6/2 D6/2 B5/4 C6/4 E6/4 G6/4 E6/4 F6/2 E6/2 D6/2 C6/2 B5/2 A5/2 G5/2 F5/2';
    const all = [pA1, pA2, pB, pA2];
    const sec = (fn) => all.map((p) => s16Bars(p, 16, fn)).join(' ');
    const groove = 'k/2 o/2 s/2 o/2 k/2 k/2 s/2 o/2';
    const fill = 'k/2 h/2 s/2 h/2 s/1 s/1 s/1 s/1 t/2 T/2';
    const dr = `c+${groove} ${Array(6).fill(groove).join(' ')} ${fill}`;
    return {
      bpm: 170, era: 'snes',
      voices: [
        { wave: 'square', vol: 0.038, notes: [melA1, melA2, melB, melA2].join(' ') },
        { wave: 'sawtooth', vol: 0.019, legato: 0.7, pan: -0.3, notes: sec(S16P.ostinato(64)) },
        { wave: 'brass', vol: 0.02, env: 'stab', poly: true, pan: 0.3, notes: sec(S16P.stabs) },
        { wave: 'triangle', vol: 0.075, fx: 0, notes: sec(S16P.drive) },
        { wave: 'noise', vol: 0.022, fx: 0.15, notes: [dr, dr, dr, dr].join(' ') },
      ],
    };
  })(),
};

// Reina Nébula: lamento submarino en Do menor y 6/8 (compases de 12 pasos), 32 compases.
// Flauta con eco, arpegios de "burbujas" de campanita y un pad de cuerdas, al estilo de las
// cuevas acuáticas de los juegos de exploración de 16 bits. A los 92 BPM dura ~63 s.
// Al 60 % se prenden las luces: snes_nebula2 toca las MISMAS voces a 110 BPM (~52 s) con bajo
// que se mueve y batería a contratiempo. Ojo: la Copia de Sombra de GameCube recorta snes_nebula.
const SNES_NEBULA_VOICES = (() => {
  const prog = 'Cm Cm Ab Ab Fm Fm G G Cm Cm Ab Ab Fm Fm G G Eb Bb Ab Fm Db Db G G7 Ab G Fm Eb Db Cm G G';
  const mel = 'G4/6 C5/3 D5/3 Eb5/9 D5/3 C5/6 Eb5/3 G5/3 F5/6 Eb5/3 C5/3 Ab5/6 G5/3 F5/3 Eb5/3 F5/3 Ab5/3 C6/3 ' +
    'B5/6 G5/3 F5/3 D5/9 -/3 ' +
    'G5/6 Eb5/3 F5/3 G5/9 Ab5/3 C6/6 Bb5/3 Ab5/3 G5/6 Eb5/3 C5/3 F5/3 Ab5/3 C6/3 Eb6/3 Db6/6 C6/3 Ab5/3 ' +
    'B5/3 C6/3 D6/3 F6/3 Eb6/6 D6/6 ' +
    'G5/6 Bb5/3 Eb6/3 D6/9 F5/3 Ab5/6 C6/3 Eb6/3 F6/9! Eb6/3 Db6/6 C6/3 Ab5/3 F5/6 Ab5/3 Db6/3 ' +
    'B5/6 D6/3 F6/3 G6/6 F6/3 D6/3 ' +
    'Eb5/6 C5/6 D5/6 B4/6 C5/6 Ab4/6 G4/6 Bb4/3 G4/3 Ab4/6 F4/6 G4/6 Eb4/6 D4/3 F4/3 G4/3 B4/3 D5/12';
  const bubbles = s16Bars(prog, 12, (c, st) => {
    const t = s16Chord(c, 60);
    return [t[0], t[1], t[2], t[0] + 12, t[2], t[1]].map((m, i) => `${s16n(m)}/2${i ? '?' : ''}`).join(' ');
  });
  return {
    prog,
    voices: [
      { wave: 'flute', vol: 0.045, env: 'soft', vib: 'slow', notes: mel },
      { wave: 'bell', vol: 0.022, env: 'bell', pan: -0.35, notes: bubbles },
      { wave: 'strings', vol: 0.016, env: 'pad', poly: true, pan: 0.35, notes: s16Bars(prog, 12, S16P.pad(55)) },
    ],
  };
})();
Object.assign(SNES_TRACKS, {
  snes_nebula: {
    bpm: 92, era: 'snes', fx: { echo: { steps: 3, feedback: 0.45, mix: 0.32, tone: 2200 }, filter: { type: 'lowpass', freq: 6000 }, comp: true },
    voices: SNES_NEBULA_VOICES.voices.concat([
      { wave: 'warmbass', vol: 0.075, fx: 0, notes: s16Bars(SNES_NEBULA_VOICES.prog, 12, (c) => { const [r] = s16Chord(c, 36); return `${s16n(r)}/9 ${s16n(r + 7)}/3`; }) },
      { wave: 'noise', vol: 0.018, fx: 0.4, notes: Array(32).fill('T/2? -/4 h/2? -/4').join(' ') },
    ]),
  },
  snes_nebula2: {
    bpm: 110, era: 'snes',
    voices: SNES_NEBULA_VOICES.voices.concat([
      { wave: 'warmbass', vol: 0.075, fx: 0, notes: s16Bars(SNES_NEBULA_VOICES.prog, 12, (c) => { const [r] = s16Chord(c, 36); return `${s16n(r)}/3! ${s16n(r)}/1 ${s16n(r)}/2 ${s16n(r + 7)}/3 ${s16n(r + 12)}/3`; }) },
      { wave: 'noise', vol: 0.018, fx: 0.2, notes: Array(4).fill(`c+k/2 h/2 h/2? s/2 h/2 h/2? ${Array(6).fill('k/2 h/2 h/2? s/2 h/2 h/2?').join(' ')} k/2 s/2 s/1? s/1 s/2 t/2 T/2`).join(' ') },
    ]),
  },
});

// ---------- Cosas que pasan en las batallas ----------

// El Glitch habla con letras rotas (1 de cada 8, más o menos).
function glitchText(s, every = 8) {
  let n = 0;
  return s.replace(/[a-záéíóúñ]/gi, (c) => (++n % every === 0 ? '#%▒'[n % 3] : c));
}

// Piso Modo 7 detrás del enemigo (Modosiete).
function addMode7Backdrop(scene, floor = 'grid') {
  const cv = document.createElement('canvas');
  cv.className = 'm7-backdrop';
  cv.width = 320;
  cv.height = 106;
  const battle = $('.battle');
  battle.insertBefore(cv, battle.firstChild);
  battle.classList.add('has-m7');
  const m7 = new Mode7(cv, M7_FLOORS[floor](), { horizon: 0.32, height: 18, focal: 120, fog: 'rgba(95,205,228,1)' });
  const t0 = performance.now();
  const step = (ts) => {
    const t = (ts - t0) / 1000;
    const a = t * 0.35;
    // La cámara da vueltas alrededor de un punto: el piso gira y se agranda.
    m7.render(Math.cos(a) * 30, Math.sin(a) * 30, a + Math.PI / 2 + Math.sin(t * 0.7) * 0.4);
    paintParallaxSky(m7.g, 320, m7.hy, t * 20, { top: '#2e5c9a', bottom: '#5fcde4', far: '#c39bd3', near: '#8e44ad' });
    scene.m7raf = requestAnimationFrame(step);
  };
  scene.m7raf = requestAnimationFrame(step);
}

const snesIntroPages = () => [
  '* BIT: ¡COLORES! ¡Mira cuántos!\n* ¡Esto es el REINO 16-BIT!',
  '* BIT: Aquí los ACENTOS y la Ñ sí cuentan.\n* "plátano" no es lo mismo que "platano".',
  '* BIT: En Mac: Option+E y luego la vocal (á).\n* Option+N y luego N para la ñ.',
  '* BIT: Con teclado en español: la tecla ´ y luego la vocal.\n* (Si tu teclado no puede, la MAESTRA MODO del pueblo los apaga.)',
];

const SNES_BASE = { theme: 'snes', music: 'snes_battle', strictAccents: true };
const CAB_WORDS = ['¿quién va?', '¡alto!', '¡en guardia!', '¿listo?', '¡a la carga!', '¿qué pasa?', '¡bravo!', '¿dónde?', '¡qué brillo!', '¿por qué?', '¡ataque!', '¿cómo?'];
const CAB_SIGNS = ['¡', '¿', '!', '?', '¡ya!', '¿eh?', '¡oh!', '¿sí?', 'va', 'yo'];

// ---------- El mundo ----------
addWorld({
  id: 'snes',
  order: 3,
  name: 'Reino 16-Bit',
  theme: 'snes',            // css/worlds/snes.css
  music: 'snes_map',
  requires: 'nes',          // la tubería brota al rescatar la NES
  console: 'snes',
  // Colinas Dinosaurio → Pista Cero → Hangar → Arena Modo 7 → Planeta Oscuro.
  nodes: ['dinohuevin', 'modosiete', 'gema', 'setita', 'rayocero', 'caballero', 'vulpino', 'monobarril', 'dani3', 'nebula'],
  enemies: {
    dinohuevin: {
      ...SNES_BASE,
      name: 'Dino Huevín',
      sprite: 'dinohuevin',
      hp: 70, atk: 4, def: 2, xp: 28,
      fightWords: 3,
      words: ['plátano', 'cántalo', 'árbol', 'melón', 'limón', 'sandía', 'maíz', 'piña', 'canción', 'túnel', 'café', 'camión', 'corazón', 'pájaro', 'fácil'],
      blurb: 'Un dinosaurio verde que salió de un huevo con manchas. Se come todo... hasta tus letras.',
      intro: '* ¡Dino Huevín sale de su huevo de un salto!\n* Te mira la mano. Cree que es una fruta.',
      check: '* DINO HUEVIN - ATQ 4 DEF 2\n* "Nací en un juego que venía con la consola. ¡Y tengo lengua larga!"',
      idle: ['* Dino Huevín se come una nube. Sabe a algodón.', '* Dino Huevín estira la lengua... ¡casi te alcanza!', '* Huele a fruta tropical.'],
      calm: '* Dino Huevín mueve la cola como perrito.',
      taunts: ['¡Ñam!', '¡Tengo hambre de acentos!', '¡Plá-ta-no!'],
      acts: [
        { name: 'Alimentar', text: 'le das una fruta con la lengua larga', mercy: 50, reply: '* "¡Ñam! ¿Hay más?"' },
        { name: 'Montar', text: 'te subes en su lomo', mercy: 45, reply: '* "¡A trotar!" Dino Huevín da tres vueltas contigo.' },
        { name: 'Huevo', text: 'cuidas su huevo hasta que se duerme', mercy: 40, reply: '* "...zzz." Dino Huevín bosteza.' },
      ],
      bullets: { count: 9, interval: 1300, speed: 32, pool: ['á', 'é', 'í', 'ó', 'ú', 'ñam', 'mí', 'sí', 'té', 'ya', 'yo', 'él'] },
      drop: 'fruta_dino',
      keysHint: 'Acentos: plátano, árbol, maíz',
      onEnter(scene, pages) {
        if (Save.data.flags.snesIntro) return;
        Save.data.flags.snesIntro = true;
        pages.unshift(...snesIntroPages());
      },
      onWin(scene, { spared, pages }) {
        if (!spared) return;
        pages.push('* Dino Huevín se fue al pueblo.\n* Dice que perdió unos huevos... ¿lo ayudas?');
        Quests.start('snes_huevos');
      },
    },
    modosiete: {
      ...SNES_BASE,
      name: 'Modosiete',
      sprite: 'modosiete',
      hp: 65, atk: 3, def: 3, xp: 26,
      fightWords: 3,
      words: ['órbita', 'polígono', 'rápido', 'pantalla', 'cuadrícula', 'horizonte', 'perspectiva', 'píxel', 'gráfico', 'cámara', 'rotación', 'mágico', 'plano', 'giro'],
      blurb: 'Un plano cuadriculado que gira y se agranda. Marea a quien lo mira.',
      intro: '* ¡El piso empieza a girar!\n* Modosiete aparece... en perspectiva.',
      check: '* MODOSIETE - ATQ 3 DEF 3\n* El "Modo 7" giraba y agrandaba el piso para fingir 3D. Las letras se ven más chicas al fondo.',
      idle: ['* El horizonte da vueltas. Tú no.', '* Modosiete se hace grande... y luego chiquito.', '* BIT: "Mira el piso. ¿Ves cómo gira? Eso se llamaba Modo 7. No sé por qué 7."'],
      calm: '* Modosiete gira despacito, como carrusel.',
      taunts: ['¡Gira, gira!', '¡Soy casi 3D!', '¡Mira el horizonte!'],
      acts: [
        { name: 'Mirar', text: 'miras el horizonte y respiras', mercy: 45, reply: '* "¿Ves? Giro para ti."' },
        { name: 'Dibujar', text: 'dibujas una cuadrícula perfecta', mercy: 40, reply: '* "¡Qué ortogonal!"' },
        { name: 'Parar', text: 'le pides que pare un poquito', mercy: 45, reply: '* "Está bien. Pausa... no, pausa no. Alto."' },
      ],
      bullets: { count: 10, interval: 1200, speed: 34, pool: ['7', 'giro', 'eje', 'zoom', 'á', 'ó', 'plano', 'modo'] },
      drop: 'lente_modo7',
      keysHint: 'Palabras en perspectiva con acentos',
      onEnter(scene) {
        $('.battle').classList.add('persp');
        addMode7Backdrop(scene);
      },
      onExit(scene) { cancelAnimationFrame(scene.m7raf); },
    },
    gema: {
      ...SNES_BASE,
      name: 'Gema Flotante',
      sprite: 'gema',
      hp: 60, atk: 3, def: 2, xp: 24,
      fightWords: 3,
      words: ['piña', 'niño', 'sueño', 'año', 'baño', 'caña', 'leña', 'moño', 'araña', 'montaña', 'pequeña', 'señal', 'cariño', 'castaña', 'muñeco', 'otoño', 'uña'],
      blurb: 'Una gema que presume sus 32 mil colores. Entrena la Ñ.',
      intro: '* ¡Una Gema Flotante brilla frente a ti!\n* Te deslumbra con 32 768 colores.',
      check: '* GEMA FLOTANTE - ATQ 3 DEF 2\n* La SNES podía mostrar 32 768 colores, pero solo 256 a la vez. Ella presume los 32 mil.',
      idle: ['* La gema cambia de color. Ahora es "verde ñoño".', '* Brilla tanto que tienes que entrecerrar los ojos.', '* La gema se admira en un charco.'],
      calm: '* La Gema Flotante brilla suavecito, color de sueño.',
      taunts: ['¡Ñiii!', '¡Mira mis colores!', '¡Treinta y dos mil!'],
      acts: [
        { name: 'Admirar', text: 'qué bonitos colores tienes', mercy: 45, reply: '* "¡Treinta y dos mil! Bueno, uso dieciséis."' },
        { name: 'Contar', text: 'cuentas sus caras una por una', mercy: 40, reply: '* "¿Ocho? ¡Nadie me había contado!"' },
        { name: 'Lupa', text: 'la miras con lupa', mercy: 40, reply: '* "¡Qué nítida me veo!"' },
      ],
      bullets: { count: 10, interval: 1150, speed: 34, pool: ['ñ', 'ña', 'ñe', 'ño', 'ñu', 'año', 'uña', 'ñi'] },
      drop: 'gema_32k',
      keysHint: 'La Ñ: piña, niño, sueño',
    },
    setita: {
      ...SNES_BASE,
      name: 'Setita Saltarina',
      sprite: 'setita',
      hp: 55, atk: 3, def: 1, xp: 22,
      fightWords: 2,
      words: ['tubería', 'castillo', 'princesa', 'saltarina', 'trampolín', 'mariposa', 'escondite', 'tormenta', 'aventura', 'chocolate', 'sombrilla', 'champiñón', 'esporas'],
      blurb: 'Un hongo que rebota sin parar. Si la perdonas... quizás se una a tu equipo.',
      intro: '* ¡Boing! ¡Boing!\n* Setita Saltarina cae del cielo y rebota hacia ti.',
      check: '* SETITA SALTARINA - ATQ 3 DEF 1\n* Le gustan las palabras largas. Dicen que es pariente de un Tecloide...',
      idle: ['* Setita rebota. Y rebota. Y rebota.', '* Setita se esconde bajo su sombrero.', '* Huele a bosque después de la lluvia.'],
      calm: '* Setita da saltitos de felicidad.',
      taunts: ['¡Boing!', '¡Más alto!', '¡Esporas!'],
      acts: [
        { name: 'Saltar', text: 'saltas al mismo ritmo que ella', mercy: 45, reply: '* "¡Boing, boing!"' },
        { name: 'Sombra', text: 'la pones en la sombra', mercy: 45, reply: '* "Ahh. Los hongos amamos la sombrita."' },
        { name: 'Chiste', text: 'por qué el hongo era popular? porque era un buen tipo', mercy: 50, reply: '* "¡JA! Pésimo. Me encanta."' },
      ],
      bullets: { count: 8, interval: 1500, speed: 30, pool: ['brinco', 'salto', 'boing', 'seta', 'hongo', 'rebote', 'sombrero'] },
      keysHint: 'Palabras largas: tubería, princesa',
      onWin(scene, { spared, first, pages }) {
        if (spared) {
          const t = giveTecloide('hongolo');
          if (t) pages.push('* ¡Setita brilló... y de su sombrero salió un Tecloide!', t);
        }
        if (!first) return;
        // Primer encuentro cara a cara con el Glitch (lore §6.2).
        pages.push(
          '* ...',
          '* La música se detiene. Un píxel MAGENTA flota frente a ti.',
          `* ???: ${glitchText('Hola. ¿Tú eres el que anda rescatando consolas?')}`,
          `* ???: ${glitchText('Nadie me pregunta mi nombre. Porque no tengo.')}`,
          '* ¡¿Eh?! Las letras de esta caja se congelaron...\n* No se m▒e▒v▒e▒n...',
          '* BIT: ¡Parpadeo, parpadeo, PARPADEO!\n* ...¡Listo! Destrabé el texto.',
          `* ???: ${glitchText('Hm. Tienes un cursor muy terco.')}\n* (La figura morada se deshace en estática y huye.)`,
          '* Algo cayó al suelo donde estaba...',
        );
        if (!Save.data.treasures.etiqueta_blanca) {
          Save.data.treasures.etiqueta_blanca = true;
          pages.push('* Encontraste: ETIQUETA EN BLANCO.\n* (Se guardó en tu vitrina.)', '* BIT: Una etiqueta sin nada... Don Chip tiene que ver esto.');
          Quests.start('snes_etiqueta');
        }
      },
    },
    rayocero: {
      name: 'Rayo Cero',
      sprite: 'rayocero',
      mode: 'carrera',          // js/scenes/carrera.js
      xp: 35,
      blurb: '¡MINIJEFE! Una nave de carreras con cara de velocidad. Te reta a una vuelta en la Pista Cero.',
      keysHint: 'Velocidad sostenida: párrafo continuo con acentos',
    },
    caballero: {
      ...SNES_BASE,
      name: 'Caballero Bloque',
      sprite: 'caballero',
      hp: 90, atk: 5, def: 4, xp: 35,
      fightWords: 3,
      words: CAB_WORDS, // (abajo se vuelve dinámico: sin acentos, tampoco van ¡ ¿)
      blurb: 'Un caballero de armadura brillante, hecha de 16 tonos. Entrena los signos ¿? y ¡!',
      intro: '* ¡CLANK! ¡CLANK!\n* El Caballero Bloque te cierra el paso: "¿QUIEN VA?"',
      check: '* CABALLERO BLOQUE - ATQ 5 DEF 4\n* En español, ¿ y ¡ abren la frase. En Mac: Option+1 = ¡ y Option+Shift+? = ¿.',
      idle: [
        '* La armadura brilla en dieciséis tonos de gris.',
        '* El caballero hace una pose heroica. Se le cae el casco.',
        '* Pasa corriendo alguien con un reloj y una rana:\n* "Un amigo mío viajó en el tiempo en 1995. Dice que este reino es su favorito."',
      ],
      calm: '* El Caballero Bloque baja la espada. Se ve aliviado.',
      taunts: ['¡En guardia!', '¿Quién va?', '¡Por el reino!'],
      acts: [
        { name: 'Reverencia', text: 'saludos, noble caballero', mercy: 45, reply: '* "¡Un escudero con modales!"' },
        { name: 'Pulir', text: 'pules su armadura hasta verte', mercy: 40, reply: '* "¡Dieciséis tonos de brillo!"' },
        { name: 'Pregunta', text: 'cuál es tu misión', mercy: 50, reply: '* "...No me acuerdo. Qué alivio."' },
      ],
      bullets: { count: 10, interval: 1300, speed: 32, pool: CAB_SIGNS },
      drop: 'escudo_16',
      keysHint: 'Signos ¿? y ¡!',
    },
    vulpino: {
      name: 'Capitán Vulpino',
      sprite: 'vulpino',
      mode: 'vulpino',          // js/scenes/vulpino.js
      hp: 150, xp: 40,
      blurb: '¡MINIJEFE! Un zorro piloto en una nave de polígonos. Dispara escribiendo las palabras que vienen.',
      keysHint: 'Ráfagas de palabras y frases con puntuación',
    },
    monobarril: {
      ...SNES_BASE,
      name: 'Mono Barril',
      sprite: 'monobarril',
      hp: 80, atk: 4, def: 2, xp: 30,
      fightWords: 2,
      words: ['plátano, uva, pera', 'uva, pera, kiwi', 'barril, mono, selva', 'coco, mango, piña', 'liana, río, mina', 'rojo, azul, verde', 'salto, giro, barril', 'mono, gorila, tucán'],
      blurb: 'Un monito que avienta barriles que parecen de 3D. Entrena las comas.',
      intro: '* ¡Un barril rueda hacia ti!\n* Detrás viene Mono Barril, muy orgulloso.',
      check: '* MONO BARRIL - ATQ 4 DEF 2\n* Sus barriles se ven 3D porque los dibujaron en una computadora y los pasaron a píxeles.',
      idle: ['* Mono Barril se rasca la cabeza.', '* Un barril pasa rodando. Nadie sabe de dónde salió.', '* Huele a plátano. Mucho.'],
      calm: '* Mono Barril se sienta encima de su barril, tranquilo.',
      taunts: ['¡Uh, uh!', '¡Barril va!', '¡Plátano, uva, pera!'],
      acts: [
        { name: 'Plátano', text: 'le das un plátano, el amarillo', mercy: 50, reply: '* "¡Mi favorito!"' },
        { name: 'Rodar', text: 'ruedas en un barril con él', mercy: 45, reply: '* "¡Uuuuh!"' },
        { name: 'Foto', text: 'le tomas una foto en tres dimensiones', mercy: 35, reply: '* "¡Me veo renderizado!"' },
      ],
      bullets: { count: 9, interval: 1400, speed: 30, pool: ['uva,', 'pera,', 'kiwi,', 'coco,', 'mango,', 'barril,', 'mono,'] },
      drop: 'barril_3d',
      keysHint: 'Comas en listas: plátano, uva, pera',
    },
    dani3: {
      name: 'Dani Turbo',
      sprite: 'dani',
      mode: 'arena7',           // js/scenes/arena7.js (Tecloides 3 contra 3 en la Arena Modo 7)
      xp: 40,
      blurb: '¡MINIJEFE! Revancha en la Arena Modo 7. Dani trae TRES Tecloides... y uno muy raro.',
      keysHint: 'Ataques + cambiar de Tecloide por tipo',
    },
    nebula: {
      name: 'Reina Nébula',
      sprite: 'nebula',
      boss: true,
      mode: 'nebula',           // js/scenes/nebula.js (combate normal + oscuridad, rayo cargado, drenaje, crías)
      console: 'snes',
      theme: 'nebula',
      music: 'snes_nebula',
      strictAccents: true,
      hp: 210, atk: 5, def: 3, xp: 60,
      fightWords: 3,
      words: ['medusa', 'océano', 'órbita', 'galaxia', 'estrellita', 'cometa', 'planeta', 'oscuro', 'brillo', 'núcleo', 'cría', 'nébula', 'eléctrico', 'tentáculo', 'burbuja', 'abismo'],
      longWords: ['electricidad', 'constelación', 'extraterrestre', 'transparente', 'luminiscencia', 'exploradora', 'profundidades', 'gravitación', 'interestelar', 'submarino gigante', 'medusa luminosa', 'dinosaurio'],
      blurb: '¡JEFE! Una medusa espacial enorme en el Planeta Oscuro. Cuida a sus crías... y a la Super Nintendo.',
      intro: '* Todo se pone oscuro.\n* Algo enorme y transparente brilla en la cueva...',
      check: '* REINA NEBULA - ATQ 5 DEF 3\n* Cuida a sus crías. Alguien le dijo que vienes a llevártelas.',
      idle: [
        '* Las medusitas se esconden detrás de su mamá.',
        '* Un casco espacial abandonado brilla en el piso:\n* "Alguien exploró esto en 1994. Volvió cambiada."',
        '* El agua oscura hace burbujas.',
      ],
      calm: '* La Reina Nébula brilla con una luz tibia.',
      taunts: ['...Vienes por mis hijas.', 'Como todos.', 'No te las llevarás.'],
      acts: [
        { name: 'Cantar', text: 'le cantas bajito a las medusitas', mercy: 25, reply: '* Las medusitas se mecen con tu canción.\n* "...Nadie les había cantado."' },
        { name: 'Prometer', text: 'prometes no llevarte a nadie', mercy: 25, reply: '* "¿Lo prometes? ...Él dijo que mentirías."' },
        { name: 'Cría grande', stage: 2, text: 'nebulita nebulita nebulita', mercy: 30, reply: '* La cría más grande se ríe al oír su nombre tres veces.\n* La Reina Nébula se calma un poco.' },
        { name: 'Limpiar', stage: 3, text: 'limpias la estática de su núcleo', mercy: 50, reply: '* La mancha magenta se borra.\n* "...Él me dijo que si el juego se pausaba, mis hijas nunca crecerían. Nunca se irían."' },
      ],
      // Las crías salen del centro en espiral (speed = cuánto avanzan por segundo, de 0 a 1).
      bullets: { count: 12, interval: 1200, speed: 0.2, pool: ['ña', 'mi', 'bu', 'blu', 'glu', 'ñu', 'pi', 'mú', 'té', 'ola', 'luz', 'sí'] },
      keysHint: 'Memoria, palabras largas y acentos',
      onWin(scene, { first, pages }) {
        pages.splice(1, 0, '* REINA NEBULA: ...Pero crecer no es irse, ¿verdad?\n* Gracias por no llevártelas.');
        Quests.complete('mundo_snes');
        if (first) {
          pages.push('* BIT: Ese tipo morado... es el mismo de la Etiqueta en blanco.\n* Tenemos que averiguar quién es.');
          Quests.start('snes_crias');
        }
      },
    },
  },
  treasures: {
    etiqueta_blanca: { name: 'Etiqueta en blanco', desc: 'Una etiqueta sin nada. Da escalofríos.' },
    casco_cero: { name: 'Casco Cero', desc: 'El casco de Rayo Cero. F-Zero salió junto con la Super Nintendo, en 1990.' },
    chip_fx: { name: 'Chip FX', desc: 'Un chip extra dentro del cartucho. Dibujaba polígonos.' },
    huevo_pintado: { name: 'Huevo pintado', desc: 'Regalo de Dino Huevín. Tiene manchas de todos los colores.' },
    nebulita: { name: 'Nebulita', desc: 'Una medusita que brilla en la vitrina. Ya creció un poquito.' },
    control_colores: { name: 'Control de colores', desc: 'Botones de colores. Dicen que es el control más cómodo de la historia. Dicen.' },
    fruta_dino: { name: 'Plátano de Dino', desc: 'Con acento en la a. Dino Huevín insiste.' },
    lente_modo7: { name: 'Lupa Modo 7', desc: 'Si miras el piso con ella, gira. Bueno, no. Pero se siente.' },
    gema_32k: { name: 'Gema de 32 mil colores', desc: 'En realidad solo muestra 256 a la vez. No le digas.' },
    escudo_16: { name: 'Escudo de 16 tonos', desc: 'Del Caballero Bloque. Cada tono es un nivel de brillo.' },
    barril_3d: { name: 'Barril pre-renderizado', desc: 'Parece 3D, pero son puros píxeles. ¡El truco de 1994!' },
  },
  sprites: SNES_SPRITES,
  tracks: SNES_TRACKS,
  quests: {
    mundo_snes: { name: 'El Reino 16-Bit', desc: 'Una tubería nueva lleva a un reino con muchísimos colores. Llega al Planeta Oscuro y rescata la Super Nintendo.' },
    snes_etiqueta: { name: 'La etiqueta en blanco', desc: 'El tipo morado soltó una etiqueta sin nada. Llévasela a Don Chip, en el pueblo.' },
    snes_huevos: { name: 'Huevos perdidos', desc: 'Dino Huevín perdió 3 huevos. Búscalo en el pueblo y ayúdalo (cada huevo es un reto con acentos).' },
    snes_piloto: {
      name: 'Piloto de pruebas',
      desc: 'En PISTA CERO (con la Maestra Modo, en el pueblo), gana en Normal sin ningún error los primeros 20 segundos.',
      progress: () => `Récord: ${(Save.data.arcade || {}).pistacero || 0} m`,
    },
    snes_crias: { name: 'Las crías de Nébula', desc: 'Vuelve al Planeta Oscuro y escribe los nombres de 10 medusitas sin ningún error.' },
  },
});


// Si el jugador apagó los acentos (su teclado no los tiene), al Caballero tampoco se le escriben ¡ ¿.
Object.defineProperties(ENEMIES.caballero, {
  words: { get: snesSigns(CAB_WORDS), configurable: true },
  bullets: {
    get: () => ({ count: 10, interval: 1300, speed: 32, pool: snesSigns(CAB_SIGNS)().filter(Boolean) }),
    configurable: true,
  },
});
