// EL FINAL Y EL POST-JUEGO (docs/LORE.md §10, §11 y §12). Datos compartidos por:
//   js/scenes/fin-canal.js     antes de la batalla: el pueblo entero te da sus FRASES
//   js/scenes/fin-glitch.js    la batalla final contra EL GLITCH (3 fases + NOMBRAR)
//   js/scenes/fin-creditos.js  créditos, vitrina, estadísticas y FIN
//   js/fin-pueblo.js           la tele del Canal Vacío, el Glitch en la banca, el epílogo
//   js/worlds/vb-cueva.js      La Cueva Roja (Virtual Boy), detrás del Roncatón
// Nombres globales con prefijo FIN_ / fin (y VB_ / vb en la Cueva Roja).
//
// Lo que se guarda:
//   Save.data.flags.finalAbierto  lo pone el jefe del Wii: aparece la tele en la plaza
//   Save.data.finalPhrases        las frases que te dieron los amigos (las usa la fase 3)
//   Save.data.flags.finFase       fase en curso (si pierdes, reintentas desde esa fase)
//   Save.data.glitchName          el nombre que el niño le escribió al Glitch
//   Save.data.flags.finBueno / finNeutral / finJugado   cómo terminó (finJugado abre el post-juego)

// ---------- Letras rotas (el Glitch habla cada vez más limpio) ----------
function finRuido(s, every = 10) {
  if (!every) return s;
  let n = 0;
  return String(s).replace(/[a-záéíóúñ]/gi, (c) => (++n % every === 0 ? '#%▒'[n % 3] : c));
}

// El nombre que le pusiste (o null).
const finName = () => (Save.data.glitchName ? String(Save.data.glitchName) : null);
const FIN_NAME_UP = () => upper(finName() || 'el glitch');

// ---------- Sprites ----------
const FIN_SPRITES = {
  // El Glitch sin forma: a veces héroe, a veces cursor, a veces estática.
  glitch: [
    '.....dddddd.....',
    '....dbbbbbbd....',
    '...dbbbbbbbbd...',
    '..dddddddddddd..',
    '...daaaaaaaad...',
    '...dacaaaacad...',
    '...daaaaaaaad...',
    '....daaccaad....',
    '.....dddddd.....',
    '....dbbbbbbd....',
    '...dbbcbbcbbd...',
    '..dbbdcbbcdbbd..',
    '..dd.dbbbbd.dd..',
    '.....dccccd.....',
    '.....dcddcd.....',
    '.....dd..dd.....',
  ],
  // Ya "compilado": un chico pequeño con gorra de píxeles y el magenta solo en la bufanda.
  glitch_ok: [
    '................',
    '.....dddddd.....',
    '....dbbbbbbd....',
    '...dbbbbbbbbdd..',
    '...ddddddddddd..',
    '....daaaaaad....',
    '....dadaadad....',
    '....daaaaaad....',
    '.....daccad.....',
    '....dMMMMMMd....',
    '...dbMMbbbbbd...',
    '...dbbMbbbbbd...',
    '...dadbbbbdad...',
    '.....dccccd.....',
    '.....dcddcd.....',
    '.....dd..dd.....',
  ],
  // Sentado en la banca junto a la vitrina (así vive en el pueblo).
  glitch_banca: [
    '................',
    '.....dddddd.....',
    '....dbbbbbbd....',
    '...dbbbbbbbbdd..',
    '...ddddddddddd..',
    '....daaaaaad....',
    '....dadaadad....',
    '....daaaaaad....',
    '.....daccad.....',
    '....dMMMMMMd....',
    '...dbMMbbbbbd...',
    '.WWWWWWWWWWWWWW.',
    '.WWdcccccccdWWW.',
    '.W..dcd..dcd..W.',
    '.W..dd....dd..W.',
    '.W............W.',
  ],
  // La tele del Canal Vacío (aparece en la plaza cuando se abre el final).
  fin_tele: [
    '................',
    '...d.......d....',
    '....d.....d.....',
    '.....d...d......',
    '..dddddddddddd..',
    '..dccccccccccd..',
    '..dcMaMcaMcacd..',
    '..dcaMcMaccMcd..',
    '..dcMcaMcMaacd..',
    '..dccMacMcaMcd..',
    '..dcaccMaMcacd..',
    '..dccccccccccd..',
    '..dddddddddddd..',
    '....dd....dd....',
    '...dddd..dddd...',
    '................',
  ],
  // El cartucho del prototipo, con la Etiqueta en blanco ya escrita (o sin nada).
  fin_cartucho: [
    '................',
    '...dddddddddd...',
    '...dccccccccd...',
    '...dcaaaaaacd...',
    '...dcaMMMMacd...',
    '...dcaaaaaacd...',
    '...dcabbbbacd...',
    '...dcaaaaaacd...',
    '...dcaaaaaacd...',
    '...dccccccccd...',
    '...dccccccccd...',
    '...dcdcdcdccd...',
    '...dccccccccd...',
    '...dddddddddd...',
    '................',
    '................',
  ],
  // Foto de la vitrina completa (regalo final de Don Chip, §11.3).
  foto_vitrina: [
    '................',
    '.dddddddddddddd.',
    '.daaaaaaaaaaaad.',
    '.dabbbbbbbbbbad.',
    '.dabcbcbcbcbbad.',
    '.dabbbbbbbbbbad.',
    '.dabcbcbMbcbbad.',
    '.dabbbbbbbbbbad.',
    '.daaaaaaaaaaaad.',
    '.daaaaaaaaaaaad.',
    '.dacccccccccaad.',
    '.daaaaaaaaaaaad.',
    '.dddddddddddddd.',
    '................',
    '................',
    '................',
  ],
};
FIN_SPRITES.glitch_ok.pal = { M: '#FF00FF' };
FIN_SPRITES.glitch_banca.pal = { M: '#FF00FF', W: '#9A6332' };
FIN_SPRITES.fin_tele.pal = { M: '#FF00FF' };
FIN_SPRITES.fin_cartucho.pal = { M: '#FF00FF' };
FIN_SPRITES.foto_vitrina.pal = { M: '#FF00FF' };
Object.assign(SPRITES, FIN_SPRITES);
Object.assign(SPRITE_PALETTES, {
  glitch: { a: '#E6E6E6', b: '#FF00FF', c: '#555555', d: '#22001F' },
  glitch_ok: { a: '#F6D2B0', b: '#5B6EE1', c: '#2B2B44', d: '#141420' },
  glitch_banca: { a: '#F6D2B0', b: '#5B6EE1', c: '#2B2B44', d: '#141420' },
  fin_tele: { a: '#FFFFFF', b: '#999999', c: '#3A3A3A', d: '#141414' },
  fin_cartucho: { a: '#FFFFFF', b: '#5B6EE1', c: '#8C8C96', d: '#2A2A30' },
  foto_vitrina: { a: '#FFFFFF', b: '#E8E0C8', c: '#5B6EE1', d: '#2A2A30' },
});

// ---------- Tesoros nuevos ----------
// El cartucho del Glitch: su nombre en la vitrina depende de cómo terminó el juego.
TREASURES.fin_cartucho = {
  room: 'fin', sprite: 'fin_cartucho',
  get name() { return finName() ? `Cartucho de ${finName()}` : 'Cartucho sin nombre'; },
  get desc() {
    return finName()
      ? `Prototipo de 1989. Lleva pegada la Etiqueta en blanco... que ya no está en blanco: dice "${finName()}", con tu letra.`
      : 'Prototipo de 1989. Sin etiqueta, sin título. Bit dice que había otra forma.';
  },
};
TREASURES.foto_vitrina = { room: 'fin', name: 'Foto de la vitrina', desc: 'Las siete consolas y el cartucho con nombre. "La mejor consola es la que juegas con alguien." —Don Chip' };

// ---------- El Glitch (para la batalla final) ----------
ENEMIES.glitch = {
  name: 'El Glitch', sprite: 'glitch', boss: true, mode: 'fin', theme: 'fin', music: 'fin_pausa',
  hp: 200, atk: 6, def: 6, xp: 150,
  fightWords: 5,
  words: ['pausa', 'estática', 'apagón', 'cartucho', 'prototipo', 'cursor', 'señal', 'ruido', 'vitrina', 'memoria',
    'guardar', 'recuerdo', 'pantalla', 'píxel', 'consola', 'nombre', 'olvido', 'cajón', 'etiqueta', 'botón', 'reinicio', 'eco'],
  intro: '',
  check: '* EL GLITCH - ATQ ?? DEF ??\n* Un personaje de un juego que nadie terminó. 1989. Sin nombre.',
  idle: ['* El Glitch parpadea. No decide qué forma tener.'],
  calm: '* El Glitch se queda quieto. Escucha.',
  taunts: ['...'],
  acts: [],
  bullets: { count: 10, interval: 1150, speed: 36, pool: ['pausa', 'alto', 'quieto', 'espera', 'nada', 'hielo', 'cero', 'vacío', 'eco', 'stop'] },
};

// ---------- Las frases de los amigos (§10.2) ----------
// Una por amigo perdonado. Cortas, en minúsculas y sin signos: se escriben en la fase 3.
const FIN_FRASES = {
  pixelito: 'un pixel también cuenta', monedin: 'cada moneda suma', cartuchon: 'no hace falta soplar',
  linkito: 'nadie va solo de verdad', pilabat: 'siempre hay pila para ti', tetrorey: 'todo encaja si lo giras',
  chupin: 'hay espacio para todos', ladrillin: 'hasta un ladrillo es amigo', caparacho: 'sal de tu caparazón',
  bombita: 'respira y cuenta hasta tres', patoloco: 'reírse juntos es mejor', tragabombas: 'nadie es solo un monstruo',
  kongo: 'tu corazón es un tambor', punin: 'levántate una vez más', caparazon: 'bienvenido a tu pueblo',
  dinohuevin: 'todo empieza en un huevo', setita: 'crecer sí es posible', gema: 'brillas aunque no lo veas',
  modosiete: 'mira desde otro ángulo', caballero: 'proteger también es querer', monobarril: 'rodar no es caer',
  vulpino: 'nunca vueles solo', nebula: 'la luz siempre vuelve', trianguloso: 'tres lados bastan',
  cactin: 'abraza con cuidado', texturin: 'borroso también es bonito', niebla: 'lo lejano también existe',
  camaraloca: 'cada ángulo cuenta', pakito: 'temblar un poquito está bien', cubito: 'en el cubo cabemos todos',
  disquin: 'pequeño pero guarda mucho', brotitos: 'juntos somos más', delfinito: 'salta sin miedo',
  fantasmita: 'aquí nadie es invisible', sombracel: 'tu sombra te acompaña', capbrotes: 'nadie se queda atrás',
  casco: 'el origen no es destino', guante: 'todos los mundos juntos', zumbito: 'a tiempo siempre llegas',
  munequito: 'tu cara es tu cara', canalclima: 'mañana sale el sol', correita: 'agárrate fuerte',
  nunchuquin: 'ir segundo también vale', sensorin: 'te veo y estás bien',
  // Copias de sombra abrazadas (Mundo 5): frases extra.
  sombra_tetro: 'una copia también siente', sombra_cap: 'ya no me trabo', sombra_nebula: 'la oscuridad pasa',
  sombra_marco: 'cada cuadro es un mundo',
  // Jefes que se mudaron al pueblo aunque no se "perdonen".
  marco: 'un cuadro es una ventana', ocarin: 'cada nota es un paso', cometa: 'las estrellas no se apagan',
  entrenadormi: 'el ritmo está en ti',
};

// Los del pueblo siempre te dan la suya. (quién, sprite, frase, condición, línea)
const FIN_PUEBLO = [
  { id: 'donchip', who: 'DON CHIP', sprite: 'donchip', frase: 'nada viejo es basura', say: '* Eso, mi joven amigo, es HISTORIA. ...Y él también lo es.' },
  { id: 'champi', who: 'CHAMPI', sprite: 'champi', frase: 'volver siempre cuenta', say: '* Yo esperé desde 1989. Valió la pena.' },
  { id: 'toby', who: 'TOBY', sprite: 'toby', frase: 'guau', say: '* ¡Guau!', bit: '* BIT: ...Gracias, Toby.' },
  { id: 'profesora', who: 'PROFESORA LETRA', sprite: 'profesora', frase: 'escribe con el corazón', say: '* Un Tecloide bien escrito nunca falla. Tú tampoco.' },
  { id: 'dani', who: 'DANI TURBO', sprite: 'dani', frase: 'el segundo más rápido te apoya', say: '* No vayas solo, te dije. ...Por eso vine.' },
  { id: 'donatecla', who: 'DOÑA TECLA', sprite: 'donatecla', frase: 'tecla a tecla se llega', when: () => !!Save.data.consoles.nes, say: '* Sin prisa, pero sin pausa.' },
  { id: 'viejo', who: 'ANCIANO', sprite: 'viejo', frase: 'acompañado no es peligroso', say: '* ...Es peligroso ir solo. Por eso vamos todos.' },
];
const FIN_BIT_FRASE = 'no estás solo';

// Amigos que te dan frase (en orden: primero los jefes, que tienen más que decir).
function finFriendIds() {
  const d = Save.data;
  const gc = (d.gc && d.gc.sombras) || {};
  return Object.keys(FIN_FRASES).filter((id) => {
    if (id.startsWith('sombra_')) return gc[id] === 'abrazo' || !!d.spared[id];
    if (['marco', 'ocarin', 'cometa', 'entrenadormi'].includes(id)) return !!d.done[id];
    return !!d.spared[id];
  });
}

// Junta todas las frases: [{ quien, frase }]. Se guardan en Save.data.finalPhrases.
function finCollectPhrases() {
  const out = FIN_PUEBLO.filter((p) => !p.when || p.when()).map((p) => ({ quien: p.who, frase: p.frase }));
  finFriendIds().forEach((id) => out.push({ quien: upper((ENEMIES[id] && ENEMIES[id].name) || id), frase: FIN_FRASES[id] }));
  out.push({ quien: 'BIT', frase: FIN_BIT_FRASE });
  return out;
}

// ---------- Chistes del Glitch (uno por día, según la fecha real) ----------
const FIN_CHISTES = [
  '¿Qué le dijo un píxel a otro píxel?\n* ...¡Nos vemos en la pantalla!',
  '¿Cuál es el colmo de un cursor?\n* ...Que nadie le haga clic.',
  '¿Cómo se despide una Game Boy?\n* ...¡Pila luego!',
  '¿Qué le dijo un 0 a un 8?\n* ...¡Qué bonito cinturón!',
  '¿Qué hace un píxel cuando está triste?\n* ...Se pone en escala de grises.',
  'Toc, toc. ¿Quién es? Pausa. ¿Pausa quién?\n* ...\n* ............(Ese era el chiste.)',
  '¿Qué le dice una tubería verde a otra?\n* ...¡Nos vemos en el otro mundo!',
  'Mi chiste favorito es el de la tecla ESC.\n* ...Pero siempre se escapa.',
  '¿Por qué el disquete estaba triste?\n* ...Porque ya nadie lo guardaba.',
  '¿Por qué Bit no juega a las escondidas?\n* ...Porque parpadea. Lo encuentran rapidísimo.',
  '¿Qué le dijo la tecla ENTER a la barra espaciadora?\n* ...¡Qué grande eres! ¿Haces ejercicio?',
  '¿Qué come un robot en el desayuno?\n* ...Chips. De computadora. Je. Je.',
  '¿Qué hace una abeja en la computadora?\n* ...¡Zzzumbar archivos!',
  '¿Por qué la consola no quería salir de la casa?\n* ...Porque estaba en modo hogar.',
  '¿Qué le dijo 1989 a 2006?\n* ...¡Cómo has crecido!',
  '¿Por qué la vitrina es tan presumida?\n* ...Porque está llena de clásicos.',
  '¿Qué tienen en común un chiste malo y yo?\n* ...Que antes nadie nos escuchaba. ¡Y ahora sí!',
  '¿Por qué el control fue a la fiesta?\n* ...Porque le dijeron que iba a haber muchos botones.',
  '¿Cuál es la letra más fría del teclado?\n* ...La "brrr". No existe. Pero debería.',
  '¿Por qué el cartucho fue al dentista?\n* ...Porque tenía los contactos sucios.',
  '¿Qué es un píxel en la playa?\n* ...Un píxel bronceado. Se pone de 16 bits.',
  '¿Por qué el mago no usa la Wii?\n* ...Porque ya tiene su varita. ¡Y no se le olvida la correa!',
  '¿Cómo se llama un dinosaurio que teclea muy rápido?\n* ...¡Un tecla-saurio!',
  '¿Qué le dijo el Roncatón a la flauta?\n* ...Zzz. (No le dijo nada. Estaba dormido.)',
  '¿Por qué el héroe no tiene nombre?\n* ...Porque tiene amigos que le dicen "tú".\n* (Ese no es chiste. Es verdad.)',
  '¿Sabes qué pasa cuando apagas una consola sin guardar?\n* ...Ya no. Ya no pasa nada. Porque ya me guardaste.',
  '¿Qué le dijo el mouse al teclado?\n* ...Tú escribes, yo apunto. ¡Equipo!',
  '¿Por qué el polígono fue al psicólogo?\n* ...Porque tenía muchos lados y no sabía cuál era el suyo.',
  '¿Qué hace un Tecloide en el banco?\n* ...Guarda sus ahorros en BYTES.',
  '¿Cómo se llama la tecla más valiente?\n* ...La tecla ALT. Porque siempre dice "¡ALTo ahí!".',
  '¿Por qué los fantasmas no juegan videojuegos?\n* ...Porque les da miedo el "Game Over".',
];
// Número del día según la fecha real (cambia a medianoche).
function finDayIndex(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const day = Math.floor((date - start) / 86400000);
  return date.getFullYear() * 366 + day;
}
const finChisteDelDia = (date) => FIN_CHISTES[finDayIndex(date) % FIN_CHISTES.length];

// ---------- Misiones ----------
Object.assign(QUESTS, {
  fin_nombre: {
    name: 'Un nombre para él',
    desc: 'Lo venciste peleando y se desarmó en estática. Bit cree que había otra forma. La tele del Canal Vacío sigue prendida en la plaza.',
  },
  cueva_roja: {
    name: 'La Cueva Roja',
    desc: 'Detrás del Roncatón, al este del pueblo, la reja del cartucho rojo gigante se abrió. Allá adentro todo es rojo y negro... y alguien se siente olvidado.',
  },
  eco_rojo: {
    name: 'Eco Rojo',
    desc: 'Consigue 25 palabras de la capa de ADELANTE en ECO ROJO, la maquinita de la Cueva Roja.',
    progress: () => `Récord: ${(Save.data.arcade || {}).ecorojo || 0}`,
  },
});

// ---------- Música ORIGINAL (lore §14.2). Cada voz de cada pista suma los mismos pasos. ----------
// Ojo: fin_nombre y fin_creditos usan las voces del tema del pueblo (TRACKS.town, js/music.js) tal cual:
// 0 melodía, 1 bajo, 2 arpegios, 3 pad, 4 batería. Aquí solo cambia el timbre o lo que va antes.
// Créditos: 2 compases de cada mundo (tocados dos veces) y al final el tema del pueblo.
// Por mundo: [melodía, bajo, batería, acordes]; cada uno suma 32 pasos.
const FIN_CRED = {
  gb: ['G5/2 B5/2 D6/2 B5/2 A5/2 F#5/2 D5/4 E5/2 G5/2 B5/2 G5/2 A5/8', 'G2/4 D3/4 G2/4 D3/4 C3/4 G3/4 D3/4 A2/4',
    'k/4 h/4 s/4 h/4 k/4 h/4 s/4 h/2 h/2', 'G4+B4+D5/16 C4+E4+G4/8 D4+F#4+A4/8'],
  nes: ['C5/1 E5/1 G5/2 E5/1 G5/3 A5/2 G5/2 E5/2 C5/2 D5/2 E5/2 D5/4 G4/4 C5/4', 'C3/2 G3/2 C3/2 G3/2 C3/2 G3/2 C3/2 G3/2 F2/2 C3/2 F2/2 C3/2 G2/2 D3/2 G2/2 D3/2',
    rep('k/2 h/2 s/2 h/2', 4), 'C4+E4+G4/16 F4+A4+C5/8 G4+B4+D5/8'],
  snes: ['D5/4 F#5/4 A5/4 D6/4 C#6/2 B5/2 A5/4 F#5/4 A5/4', 'D3/8 B2/8 G2/8 A2/8',
    rep('k/4 h/2 h/2 s/4 h/4', 2), 'D4+F#4+A4/8 B3+D4+F#4/8 G3+B3+D4/8 A3+C#4+E4/8'],
  n64: ['A5/6 E5/2 C#6/8 B5/4 A5/2 G#5/2 A5/8', 'A2/16 E2/8 E3/8',
    'k/6 h/2 s/8 k/6 h/2 s/4 t/2 T/2', 'A3+C#4+E4/16 E4+G#4+B4/16'],
  gc: ['-/2 E5/2 G5/2 C6/4 B5/2 A5/2 G5/2 -/2 E5/2 F5/2 G5/2 E5/4 D5/4', 'C3/3 G3/3 C3/2 A2/3 E3/3 A2/2 F2/3 C3/3 F2/2 G2/3 D3/3 G2/2',
    rep('k/3 h/3 s/2', 3) + ' k/3 h/3 s/1 s/1', 'C4+E4+G4/8 A3+C4+E4/8 F3+A3+C4/8 G3+B3+D4/8'],
  wii: ['C6/2 G5/2 E5/2 G5/2 A5/2 G5/2 E5/4 D5/2 E5/2 G5/2 E5/2 C5/8', 'C3/4 C3/4 A2/4 A2/4 F2/4 F2/4 G2/4 G2/4',
    `${rep('k/2 h/2 s/2 h/2', 2)} k/2 h/2 s/2 s/1 s/1 t/2 t/2 T/2 T/2`, 'C4+E4+G4/8 A3+C4+E4/8 F3+A3+C4/8 G3+B3+D4/8'],
};
const FIN_ERAS = ['gb', 'nes', 'snes', 'n64', 'gc', 'wii'];
const FIN_PAD_A = 'C4/16 A3/16 F3/16 G3/16 C4/16 E3/16 F3/8 G3/8 C4/16';
const finCredVoice = (k) => FIN_ERAS.map((w) => rep(FIN_CRED[w][k], 2)).join(' ');
// La melodía de un solo mundo (silencio en los demás): cada consola con su propio timbre.
const finCredOnly = (era) => FIN_ERAS.map((w) => (w === era ? rep(FIN_CRED[w][0], 2) : `-/${Music.steps(rep(FIN_CRED[w][0], 2))}`)).join(' ');
const FIN_CRED_LEN = Music.steps(finCredVoice(0));
// Sube o baja semitonos un texto de fichas (la segunda vuelta de fin_repe sale medio tono "chueca").
function finUp(s, n) {
  const PCS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return s.replace(/([A-G])([#b]?)(\d)/g, (x, l, acc, o) => {
    const m = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[l] + (acc === '#' ? 1 : acc === 'b' ? -1 : 0) + Number(o) * 12 + n;
    return `${PCS[((m % 12) + 12) % 12]}${Math.floor(m / 12)}`;
  });
}

// Fase 2: cada pedazo de jefe [melodía, bajo, acordes] (32 pasos) y la nota donde "se traba".
const FIN_REPE = [
  // Marcha
  ['C5/2 C5/2 G4/2 C5/2 D#5/4 D5/4 C5/2 G4/2 C5/2 D#5/2 G5/8', rep('C3/4 G2/4', 4), 'C4+D#4+G4/32', 'G5', 'G2'],
  // Mar profundo
  ['D#5/6 D5/6 C5/4 D#5/6 G4/10', 'C2/16 G#1/16', 'C4+D#4+G4/16 G#3+C4+D#4/16', 'G4', 'G#1'],
  // Vals de cuadro
  ['G5/4 B5/2 A5/2 G5/4 D5/4 E5/4 F#5/2 G5/2 A5/8', 'G2/4 D3/4 D3/4 G2/4 C3/4 G3/4 D3/4 D3/4', 'G4+B4+D5/16 C4+E4+G4/8 D4+F#4+A4/8', 'A5', 'D3'],
  // Torneo
  ['E5/1 E5/1 G5/2 E5/1 B5/3 A5/2 G5/2 F#5/2 E5/2 D5/2 E5/4 B4/2 E5/8', rep('E2/2 E3/2', 8), 'E4+G4+B4/32', 'E5', 'E2'],
];
const FIN_REPE_DRUMS = [rep('k/2 h/2 s/2 h/2', 4), 'k/8 -/8 k/8 s/8', 'k/4 h/4 h/4 k/4 h/4 h/4 k/4 s/4', rep('k/1 h/1 s/1 h/1', 8)];
// Un pedazo + un compás "trabado": su última nota repetida en semicorcheas, que se apaga de golpe.
function finRepeVoice(k, up) {
  return FIN_REPE.map((p, i) => {
    let body;
    if (k === 0) body = `${p[0]} ${rep(`${p[3]}/1`, 8)} ${rep(`${finUp(p[3], -12)}/1`, 4)} -/4`;
    else if (k === 1) body = `${p[1]} ${rep(`${p[4]}/2`, 4)} -/8`;
    else if (k === 2) body = `${p[2]} -/16`;
    else body = `${FIN_REPE_DRUMS[i]} ${rep('s/1', 12)} -/4`;
    return k === 3 ? body : finUp(body, up);
  }).join(' ');
}

Object.assign(TRACKS, {
  // Fase 1 "Pausa": una sola nota que se corta, con silencios incómodos. Game Boy con el crush a 5 bits,
  // un dron que desafina y, de vez en cuando, el tema del pueblo que se "salta" como disco rayado.
  // 3 vueltas de 64 pasos a 60 BPM (~48 s).
  fin_pausa: {
    bpm: 60, era: 'gb',
    fx: { crush: 5, echo: { steps: 3, feedback: 0.45, mix: 0.25, tone: 1500 } },
    voices: [
      { wave: 'square', vol: 0.032, notes: [
        'C5/2 -/6 C5/1 -/1 C5/1 -/5 C#5/2 -/14 C5/4 -/4 B4/1 -/7 C5/2 -/14',
        'C5/1 C5/1 C5/1 -/5 C5/1 -/7 C#5/1 C5/1 -/14 C5/1 -/3 C5/1 C5/1 C5/1 C5/1 -/8 B4/2 -/14',
        'C5/2 -/14 F#4/4 -/12 C5/1 -/1 C5/1 -/1 C5/1 -/11 B4/8 -/8'] },
      { wave: 'sawtooth', vol: 0.016, notes: '-/24 E5/1 G5/1 A5/1 -/13 -/8 E5/1 G5/1 A5/1 G5/1 E5/1 -/11 -/32 -/16 E5/1 G5/1 E5/1 G5/1 E5/1 G5/1 -/10 -/40 E5/1 G5/1 A5/1 G5/1 E5/1 D5/1 C5/1 -/1 -/16' },
      { wave: 'triangle', vol: 0.08, notes: 'C2/16 -/8 C2/8 C#2/16 -/16 C2/24 -/8 C#2/8 C2/8 -/16 C2/16 F#1/16 -/16 C2/16' },
      { wave: 'noise', vol: 0.02, notes: 'x/1 -/15 x/1 -/3 x/1 -/11 x/1 -/1 x/1 -/29 ' +
        'x/1 x/1 x/1 -/13 x/1 -/15 x/1 -/1 x/1 -/1 x/1 -/1 x/1 -/9 k/1 -/15 ' +
        'x/1 -/31 c/1 -/15 x/1 -/1 x/1 -/13' },
    ],
  },
  // Fase 2 "Repetición": collage de NES con 2 compases por jefe (marcha, mar profundo, vals de cuadro,
  // torneo); cada pedazo se TRABA un compás. La segunda vuelta se repite medio tono arriba, como un
  // cartucho mal puesto. 24 compases a 120 BPM (~48 s).
  fin_repe: {
    bpm: 120, era: 'nes',
    voices: [
      { wave: 'pulse25', vol: 0.032, vib: 'light', notes: `${finRepeVoice(0, 0)} ${finRepeVoice(0, 1)}` },
      { wave: 'pulse12', vol: 0.016, env: 'stab', arp: 0.033, notes: `${finRepeVoice(2, 0)} ${finRepeVoice(2, 1)}` },
      { wave: 'triangle', vol: 0.1, fx: 0, notes: `${finRepeVoice(1, 0)} ${finRepeVoice(1, 1)}` },
      { wave: 'noise', vol: 0.024, notes: `${finRepeVoice(3, 0)} ${finRepeVoice(3, 1)}` },
    ],
  },
  // Fase 3 "Nombre": el tema del pueblo tocado lento, al estilo GameCube. Siempre fue parte del pueblo.
  // Mismas notas (voces 0 a 3 del pueblo), otro timbre: flauta, bajo cálido, campanitas y cuerdas.
  fin_nombre: {
    bpm: 80, era: 'gc', vol: 1.2,
    voices: [
      ...TRACKS.town.voices.filter((v) => v.wave !== 'noise').map((v, i) => ({ ...v, ...[
        { wave: 'flute', vol: 0.045, env: 'soft', vib: 'slow' },
        { wave: 'warmbass', vol: 0.085, env: 'bass' },
        { wave: 'bell', vol: 0.014, env: 'pluck', arp: 0.09, fx: 0.8 },
        { wave: 'strings', vol: 0.016, env: 'pad', filter: 2600 },
      ][i] })),
      // Pad que sigue los acordes del pueblo (A A' B A).
      { wave: 'strings', vol: 0.03, env: 'pad', filter: 1800, notes: [FIN_PAD_A, FIN_PAD_A, 'F3/16 C4/16 D4/16 G3/16 A3/16 F3/16 D4/8 G3/8 G3/16', FIN_PAD_A].join(' ') },
    ],
  },
  // Créditos: popurrí de todas las eras (cada una con su timbre: pulso de Game Boy, pulso de NES, SNES,
  // ocarina, flauta y campanita), terminando en el tema del pueblo completo con todas sus voces.
  fin_creditos: {
    bpm: 112,
    fx: { echo: { steps: 3, feedback: 0.28, mix: 0.18 } },
    voices: [
      { wave: 'pulse50', vol: 0.03, env: 'chip', vib: { rate: 6, depth: 0.15, delay: 0.2 }, notes: `${finCredOnly('gb')} -/${Music.steps(TRACKS.town.voices[0].notes)}` },
      // La del pueblo va en esta voz: es el mismo pulso 25 % con vibrato.
      { wave: 'pulse25', vol: 0.034, env: 'chip', vib: { rate: 5.5, depth: 0.18, delay: 0.22 }, notes: `${finCredOnly('nes')} ${TRACKS.town.voices[0].notes}` },
      { wave: 'snes', vol: 0.036, env: 'soft', vib: 'light', filter: 6000, notes: `${finCredOnly('snes')} -/${Music.steps(TRACKS.town.voices[0].notes)}` },
      { wave: 'ocarina', vol: 0.04, env: 'soft', vib: 'slow', notes: `${finCredOnly('n64')} -/${Music.steps(TRACKS.town.voices[0].notes)}` },
      { wave: 'flute', vol: 0.04, env: 'soft', vib: 'light', notes: `${finCredOnly('gc')} -/${Music.steps(TRACKS.town.voices[0].notes)}` },
      { wave: 'bell', vol: 0.03, env: { a: 0.002, d: 0.5, s: 0.3, r: 0.3 }, notes: `${finCredOnly('wii')} -/${Music.steps(TRACKS.town.voices[0].notes)}` },
      { wave: 'triangle', vol: 0.1, fx: 0, notes: `${finCredVoice(1)} ${TRACKS.town.voices[1].notes}` },
      { wave: 'pulse12', vol: 0.018, env: 'stab', arp: 0.035, fx: 0.6, notes: `${finCredVoice(3)} ${TRACKS.town.voices[2].notes}` },
      { wave: 'pulse25', vol: 0.016, env: 'pad', poly: true, filter: 2200, vib: 'light', notes: `-/${FIN_CRED_LEN} ${TRACKS.town.voices[3].notes}` },
      { wave: 'noise', vol: 0.02, kit: 'full', fx: 0.15, notes: `${finCredVoice(2)} ${TRACKS.town.voices[4].notes}` },
    ],
  },
});

// Revisa que todas las voces de una pista sumen lo mismo (si no, el loop se desfasa).
function finTrackSteps(t) {
  return t.voices.map((v) => Music.steps(v.notes));
}

// Una nota suelta (para la pantalla de NOMBRAR: cada letra toca una nota del tema del pueblo).
const FIN_MELODIA = ['E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5', 'D5'];
function finNote(name, dur = 0.35, vol = 0.05, wave = 'square') {
  if (Sfx.muted) return;
  const c = Sfx.unlock();
  if (!c) return;
  const m = /^([A-G]#?)(\d)$/.exec(name);
  if (!m) return;
  const N = { C: -9, 'C#': -8, D: -7, 'D#': -6, E: -5, F: -4, 'F#': -3, G: -2, 'G#': -1, A: 0, 'A#': 1, B: 2 };
  const f = 440 * Math.pow(2, (N[m[1]] + (Number(m[2]) - 4) * 12) / 12);
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = wave;
  o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}
