// MUNDO 1 — Valle Game Boy (1989). Paleta de 4 verdes. Diseño en docs/LORE.md §4.

// Misión de récord "Racha de 20": 20 palabras seguidas sin error en batallas de este mundo.
// Cada enemigo del valle la llama con `onWord` al terminar una palabra o frase.
function gbRacha(unit) {
  const f = Save.data.flags;
  if (Quests.state('racha_gb') === 'done') return;
  if (!Quests.state('racha_gb')) Quests.start('racha_gb');
  const n = unit.text.trim().split(/\s+/).length;
  f.gbRacha = unit.errors ? 0 : (f.gbRacha || 0) + n;
  f.gbRachaMax = Math.max(f.gbRachaMax || 0, f.gbRacha);
  if (f.gbRacha >= 20) {
    Save.data.treasures.pila_extra = true;
    Quests.complete('racha_gb');
    toast(`¡RACHA DE 20!\nGanaste: ${upper(TREASURES.pila_extra.name)}`);
  }
  Save.write();
}

// Sprites del mundo (se pintan con la paleta de 4 verdes).
const GB_SPRITES = {
  monedin: [
    '................',
    '.....dddddd.....',
    '....dbbbbbbd....',
    '...dbaabbbbbd...',
    '..dbabbbbbbbbd..',
    '..dbbadbbadbbd..',
    '..dbbddbbddbbd..',
    '..dbbbbbbbbbbd..',
    '..dbcbbbbbbcbd..',
    '..dbbbddddbbbd..',
    '..dbbbbbbbbbbd..',
    '...dbbbbbbbbd...',
    '....dbbbbbbd....',
    '.....dddddd.....',
    '....dd....dd....',
    '................',
  ],
  linkito: [
    '................',
    '...dddddddd.....',
    '...dbbbbbbd.....',
    '...dbadbadd.....',
    '...dbddbddd.....',
    '...dbbbbbbd.....',
    '...dbbddbbd.....',
    '...dddddddd.....',
    '....dccccd......',
    '.....dccd.......',
    '.....dcd....dd..',
    '.....dcd...dcd..',
    '.....dccd.dccd..',
    '......dcccccd...',
    '.......ddddd....',
    '................',
  ],
  chupin: [
    '................',
    '.....dddddd.....',
    '...ddbbbbbbdd...',
    '..dbbaabbbbbbd..',
    '..dbabbdbbdbbd..',
    '.dbbbbdbbdbbbbd.',
    '.dbbbbadbadbbbd.',
    '.dbcbbbbbbbbcbd.',
    '.dbbbbbddbbbbbd.',
    '.dbbbbdccdbbbbd.',
    '..dbbbbddbbbbd..',
    '..dbbbbbbbbbbd..',
    '...ddbbbbbbdd...',
    '..dccddddddccd..',
    '..dccccd.dcccd..',
    '...dddd...ddd...',
  ],
  moneda_verde: [
    '................',
    '................',
    '.....dddddd.....',
    '....dbbbbbbd....',
    '...dbaabbbbcd...',
    '...dbabddbbcd...',
    '...dbbdbbbbcd...',
    '...dbbbddbbcd...',
    '...dbbbbbdbcd...',
    '...dbbddddbcd...',
    '...dbbbbbbbcd...',
    '....dccccccd....',
    '.....dddddd.....',
    '................',
    '................',
    '................',
  ],
  cable_doble: [
    '................',
    '.dddd......dddd.',
    '.dbbd......dbbd.',
    '.dbbd......dbbd.',
    '.dddd......dddd.',
    '..dd........dd..',
    '..dc........cd..',
    '..dc........cd..',
    '..dcd......dcd..',
    '...dcd....dcd...',
    '....dcddddcd....',
    '.....dccccd.....',
    '......dccd......',
    '......dccd......',
    '.......dd.......',
    '................',
  ],
  gameboy_lupa: [
    '................',
    '....dddddd......',
    '...daabbbbd.....',
    '..dabbbbbbbd....',
    '..dabbbbbbbd....',
    '..dbbbbbbbbd....',
    '..dbbbbbbbbd....',
    '..dbbbbbbbbd....',
    '...dbbbbbbd.....',
    '....dddddddd....',
    '.........dccd...',
    '..........dccd..',
    '...........dccd.',
    '............dcd.',
    '.............d..',
    '................',
  ],
  tomate: [
    '................',
    '.......dd.......',
    '.....ddcdd......',
    '....dccdccd.....',
    '...ddddddddd....',
    '..dbbbbbbbbbd...',
    '.dbaabbbbbbbbd..',
    '.dbabdbbbbdbbd..',
    '.dbbbddbbddbbd..',
    '.dbbbdbddbdbbd..',
    '.dbbbdbbbbdbbd..',
    '.dbbbbbbbbbbcd..',
    '..dbbbbbbbbcd...',
    '...dccccccdd....',
    '....dddddd......',
    '................',
  ],
};
// La hermana de Monedín: la misma moneda, pero "dorada" (más clarita).
GB_SPRITES.monedina = GB_SPRITES.monedin.map((r) => r.replace(/c/g, 'a'));

// ---------- Música (melodías originales) ----------
const gbArp = (a, b, c) => `${rep(`${a} ${b} ${c}`, 5)} ${a}`; // 16 pasos de arpegio "en tresillos"
const GB_TETRO_MEL = 'D5/2 D6/2 A5/2 F5/2 D5/2 D6/2 C6/2 A5/2 A#4/2 A#5/2 F5/2 D5/2 C5/4 E5/4 ' +
  'D5/2 D6/2 A5/2 F5/2 G5/2 A5/2 A#5/2 A5/2 G5/2 F5/2 E5/2 C#5/2 D5/8';
const GB_TETRO_BASS = rep('D2/2 D3/2', 4) + ' A#1/2 A#2/2 A#1/2 A#2/2 C2/2 C3/2 C2/2 C3/2 ' +
  'D2/2 D3/2 D2/2 D3/2 G1/2 G2/2 G1/2 G2/2 ' + rep('A1/2 A2/2', 4);
// TETRIS VS (fase 2 de Tetro Rey): arreglo PROPIO de Korobeiniki, la canción folclórica rusa
// del siglo XIX (dominio público) que Tetris usó como "Tipo A". Solo la melodía es la del pueblo:
// el bajo de polka, los acordes a contratiempo, la segunda voz, las variaciones y el puente B
// son nuestros (nada del arreglo de Game Boy). La menor, forma A A' B A.
const GB_KORO_TRACK = (() => {
  // La melodía folclórica, 8 compases.
  const melA = 'E5/4! B4/2 C5/2 D5/4 C5/2 B4/2 | A4/4 A4/2 C5/2 E5/4 D5/2 C5/2 | B4/6 C5/2 D5/4 E5/4 | C5/4 A4/4 A4/8 | ' +
    '-/2 D5/4! F5/2 A5/4 G5/2 F5/2 | E5/6 C5/2 E5/4 D5/2 C5/2 | B4/4 B4/2 C5/2 D5/4 E5/4 | C5/4 A4/4 A4/4 -/4';
  // A': la misma, pero adornada (mordentes y rellenos donde había notas largas).
  const melA2 = 'E5/2! F5/1 E5/1 B4/2 C5/2 D5/2 E5/1 D5/1 C5/2 B4/2 | A4/4 A4/2 C5/2 E5/4 D5/2 C5/2 | ' +
    'B4/2 A4/1 B4/1 C5/2. C5/2 D5/4 E5/4 | C5/4 A4/2 E4/2 A4/2 C5/2 E5/4 | ' +
    '-/2 D5/4! F5/2 A5/4 G5/2 F5/2 | E5/2 D5/1 E5/1 F5/2 C5/2 E5/4 D5/2 C5/2 | B4/4 B4/2 C5/2 D5/2 E5/2 G#5/4 | A5/4! E5/2 C5/2 A4/4 -/4';
  // B: puente original en Do mayor que vuelve a Mi para caer otra vez en La menor.
  const melB = 'G5/4! E5/2 G5/2 C6/4 G5/4 | B5/4 G5/2 D5/2 G5/8 | A5/4! F5/2 A5/2 C6/4 A5/4 | G5/6 E5/2 C5/8 | ' +
    'D5/2 F5/2 A5/4 F5/2 A5/2 D6/4 | C6/2 B5/2 A5/4 E5/4 A5/4 | B4/2 C5/2 D5/2 E5/2 G#5/4 B5/4 | E6/8! D6/2 C6/2 B5/2 G#5/2';
  const CH = { Am: 'C4+E4+A4', E: 'B3+E4+G#4', Dm: 'D4+F4+A4', C: 'C4+E4+G4', G: 'B3+D4+G4', F: 'C4+F4+A4' };
  const harmA = ['Am', 'Am', 'E', 'Am', 'Dm', 'C', 'E', 'Am'];
  const harmB = ['C', 'G', 'F', 'C', 'Dm', 'Am', 'E', 'E'];
  // Bajo de polka: raíz y quinta con un paso que lleva al siguiente acorde.
  const BAS = { Am: ['A2', 'E3'], E: ['E2', 'B2'], Dm: ['D3', 'A2'], C: ['C3', 'G2'], G: ['G2', 'D3'], F: ['F2', 'C3'] };
  const PASO = { Am: 'G#2', E: 'D#2', Dm: 'C#3', C: 'B2', G: 'F#2', F: 'E2' };
  const bassOf = (harm) => harm.map((c, i) => {
    const [r, f] = BAS[c];
    const sig = harm[(i + 1) % harm.length];
    return `${r}/2! -/2 ${f}/2. -/2 ${r}/2 -/2 ${f}/2. ${PASO[sig]}/2.`;
  }).join(' ');
  const stabs = (harm) => harm.map((c) => `(-/2 ${CH[c]}/2.)*4`).join(' ');
  const beat = 'k/2 h/2 s/2 h/2 k/2 k/2 s/2 h/2';
  const fill = 'k/2 s/1 s/1 s/2 s/2 t/2 t/2 T/2 T/2';
  const drums = `(${beat})*7 ${fill}`;
  return {
    bpm: 150, era: 'gb', intro: ['I'], form: ['A', 'A2', 'B', 'A'],
    voices: [
      { wave: 'pulse25', vol: 0.034, vib: 'light', parts: { A: melA, A2: melA2, B: melB } },
      // Segunda voz: notas largas del acorde abajo de la melodía (en A va callada).
      { wave: 'pulse50', vol: 0.014, env: 'soft', parts: {
        A2: 'C5/8 A4/8 E4/8 A4/8 G#4/8 B4/8 A4/8 E4/8 F4/8 A4/8 G4/8 E4/8 G#4/8 B4/8 A4/16',
        B: 'E4/16 D4/16 C4/16 E4/16 F4/16 E4/16 G#4/16 B4/16' } },
      { wave: 'pulse12', vol: 0.011, arp: 0.03, parts: { A: stabs(harmA), A2: stabs(harmA), B: stabs(harmB) } },
      { wave: 'triangle', vol: 0.1, fx: 0, parts: { I: 'A2/2! -/2 E3/2. -/2 A2/2 -/2 E3/2. G#2/2.', A: bassOf(harmA), A2: bassOf(harmA), B: bassOf(harmB) } },
      { wave: 'noise', vol: 0.026, parts: { I: fill, A: drums, A2: drums, B: drums } },
    ],
  };
})();
const GB_CHUPIN_TRACK = {
  bpm: 138,
  voices: [
    {
      wave: 'square', vol: 0.032, legato: 0.5, // staccato
      notes: 'F5 - A5 - C6 - A5 - G5 - A#5 - A5/2 F5/2 ' +
        'D5 - F5 - A5 - G5 - E5 - G5 - C5/4 ' +
        'F5 - A5 - C6 - D6 - C6 - A5 - F5/2 G5/2 ' +
        'A5 - G5 - E5 - C5 - D5 - E5 - F5/4',
    },
    // ¡A inhalar! Una bajadita cromática al final de cada vuelta.
    { wave: 'square', vol: 0.016, notes: '-/48 C6 B5 A#5 A5 G#5 G5 F#5 F5 E5 D#5 D5 C#5 C5 B4 A#4 A4' },
    { wave: 'triangle', vol: 0.1, notes: 'F2/4 C3/4 F2/4 C3/4 D2/4 A2/4 C2/4 G2/4 F2/4 C3/4 A#1/4 F2/4 C2/4 G2/4 F2/8' },
    { wave: 'noise', vol: 0.02, notes: rep('x/2 -/2 -/2 x/2', 8) },
  ],
};

addWorld({
  id: 'gb',
  order: 1,                 // posición en la Plaza de las Tuberías del pueblo
  name: 'Valle Game Boy',
  theme: 'gb',              // paleta en css/style.css (.theme-gb)
  console: 'gameboy',       // consola que se rescata al vencer al jefe
  nodes: ['pixelito', 'monedin', 'cartuchon', 'linkito', 'pilabat', 'dani', 'tetrorey', 'chupin'],
  enemies: {
    pixelito: {
      name: 'Pixelito',
      sprite: 'pixelito',
      hp: 30, atk: 2, def: 0, xp: 10,
      fightWords: 2, words: WORDS.t1,
      blurb: 'Un pixel saltarín que se escapó de la pantalla. Ideal para calentar los dedos.',
      intro: '* ¡Pixelito se escapó de la pantalla y rebota hacia ti!',
      check: '* PIXELITO - ATQ 2 DEF 0\n* Un pixel que se escapó de su pantalla. Busca un amigo.',
      idle: ['* Pixelito rebota en su lugar.', '* Huele a pantalla recién limpiada.', '* Pixelito parpadea... ¿o es la pantalla?'],
      calm: '* Pixelito te mira con ojitos brillantes.',
      taunts: ['¡Boing!', '¡Soy el pixel más rápido!', '¡Píxel, píxel!'],
      acts: [
        { name: 'Acariciar', text: 'acaricias a pixelito', mercy: 40, reply: '* Pixelito vibra de felicidad.' },
        { name: 'Saludar', text: 'hola pixelito', mercy: 35, reply: '* Pixelito te saluda con todo su cuerpo.' },
        { name: 'Bailar', text: 'haces un baile de ocho bits', mercy: 50, reply: '* Pixelito baila contigo. ¡Es buenísimo!' },
      ],
      bullets: { count: 7, interval: 1300, speed: 30, pool: 'asdfghjkl'.split('') },
      drop: 'manual',
      keysHint: 'Fila del medio: A S D F G H J K L',
      onWord: gbRacha,
    },
    monedin: {
      name: 'Monedín',
      sprite: 'monedin',
      hp: 40, atk: 2, def: 1, xp: 12,
      fightWords: 3,
      // Solo letras de la fila de arriba: Q W E R T Y U I O P.
      words: ['pie', 'rey', 'oye', 'tipo', 'tiro', 'reto', 'pero', 'otro', 'tuyo', 'quito', 'quiero', 'puerto',
        'perro', 'torre', 'yeti', 'peor', 'piropo', 'repite', 'ropero', 'trueque'],
      blurb: 'Una moneda que gira y gira. Se cree la cosa más valiosa del valle.',
      intro: '* ¡Ting ting! Monedín sale rodando de entre el pasto.',
      check: '* MONEDIN - ATQ 2 DEF 1\n* Una moneda de cuatro tonos. Se cree muy valiosa.',
      idle: [
        '* Monedín gira sobre su orilla. Ting, ting, ting.',
        '* Monedín se mira en un charco. Le gusta lo que ve.',
        '* Monedín presume: "Mi primo salió en Super Mario Land, el mismo año que la Game Boy."',
      ],
      calm: '* Monedín brilla un poquito más que antes.',
      taunts: ['¡Ting ting!', '¡Cien como yo valen una vida!', '¡No me gastes!'],
      acts: [
        { name: 'Contar', text: 'cuentas hasta diez con monedín', mercy: 40, reply: '* "¡Diez! ¡Soy diez veces más valioso!"' },
        { name: 'Pulir', text: 'pules la moneda hasta que brilla', mercy: 45, reply: '* "¡Me veo de oro! Bueno, de verde claro."' },
        { name: 'Guardar', text: 'guardas la moneda en la alcancía', mercy: 35, reply: '* "¡Por fin un lugar seguro!"' },
      ],
      bullets: { count: 8, interval: 1250, speed: 31, pool: 'qwertyuiop'.split('') },
      drop: 'moneda_verde',
      keysHint: 'Fila de arriba: Q W E R T Y U I O P',
      onWord: gbRacha,
    },
    cartuchon: {
      name: 'Cartuchón',
      sprite: 'cartuchon',
      hp: 45, atk: 3, def: 1, xp: 15,
      fightWords: 3, words: WORDS.t1.concat(WORDS.t2.slice(0, 12)),
      blurb: 'Un cartucho viejo y gruñón. Lleva años sin que nadie lo juegue.',
      intro: '* Cartuchón aparece. Está lleno de polvo.',
      check: '* CARTUCHON - ATQ 3 DEF 1\n* Un cartucho viejo que no ha jugado en años. Está gruñón.',
      idle: ['* Cartuchón tose una nube de polvo.', '* Se escucha un "error de lectura" a lo lejos.', '* Cartuchón se acomoda la etiqueta.'],
      calm: '* Cartuchón brilla como recién comprado.',
      taunts: ['¡No me soples!', '¡Antes era el más vendido!', '¡Error de lectura!'],
      acts: [
        { name: 'Soplar', text: 'soplas el cartucho con fuerza', mercy: 50, reply: '* ¡FFFFFF! El polvo vuela. Cartuchón se siente limpio.' },
        { name: 'Jugar', text: 'pones el cartucho en la consola', mercy: 50, reply: '* Cartuchón recuerda los viejos tiempos.' },
        { name: 'Elogiar', text: 'qué buenos gráficos tienes', mercy: 35, reply: '* Cartuchón se sonroja. Bueno, se pone más gris.' },
      ],
      bullets: { count: 9, interval: 1150, speed: 34, pool: 'qwertyuiopasdfghjkl'.split('') },
      drop: 'cartucho',
      keysHint: 'Fila de arriba + fila del medio',
      onWord: gbRacha,
    },
    linkito: {
      name: 'Linkito',
      sprite: 'linkito',
      hp: 50, atk: 3, def: 1, xp: 18,
      fightWords: 3,
      // Fila de abajo (Z X C V B N M) mezclada con la del medio.
      words: ['cama', 'vaca', 'banca', 'masa', 'nada', 'baja', 'caza', 'zanja', 'lana', 'manzana', 'hamaca',
        'calma', 'falda', 'gala', 'gana', 'mancha', 'salsa', 'balanza', 'alcanza', 'llama'],
      blurb: 'Un cablecito de intercambio. Anda buscando con quién conectarse.',
      intro: '* ¡Linkito se desenrolla frente a ti!\n* "¿Alguien tiene un puerto libre?"',
      check: '* LINKITO - ATQ 3 DEF 1\n* Un cable de intercambio. Sin alguien a quien conectarse, se siente solo.',
      idle: [
        '* Linkito busca un enchufe con la punta.',
        '* Linkito se hace nudo solito. Se desenreda. Se vuelve a hacer nudo.',
        '* Un letrero viejo dice: "Lugar de la Pokédex: aquí hubo 151. Contamos."',
      ],
      calm: '* Linkito mueve la punta como si fuera una colita.',
      taunts: ['¿Alguien tiene un puerto libre?', '¡Sin mí no hay intercambios!', '¡Conexión perdida!'],
      acts: [
        { name: 'Conectar', text: 'conectas el cable a otra consola', mercy: 50, reply: '* "¡Enlace establecido! ¡Ya no estoy solo!"' },
        { name: 'Enrollar', text: 'enrollas el cable sin nudos', mercy: 40, reply: '* "Qué orden. Qué paz."' },
        { name: 'Intercambiar', text: 'intercambias un tecloide con un amigo', mercy: 45, reply: '* "Eso es para lo que nací."' },
      ],
      bullets: { count: 10, interval: 1200, speed: 32, pool: 'zxcvbnm'.split('').concat(['za', 'co', 'vi', 'bu', 'mo']) },
      drop: 'cable_doble',
      keysHint: 'Fila de abajo: Z X C V B N M',
      onWord: gbRacha,
    },
    pilabat: {
      name: 'Pilabat',
      sprite: 'pilabat',
      hp: 55, atk: 3, def: 1, xp: 22,
      fightWords: 3, words: WORDS.t2,
      blurb: 'Un murciélago hecho de pilas. Casi sin energía y de muy mal humor.',
      intro: '* ¡Una Pilabat sale volando del compartimiento de pilas!',
      check: '* PILABAT - ATQ 3 DEF 1\n* Un murciélago hecho de pilas. Casi sin energía... y de mal humor.',
      idle: ['* Pilabat hace bzzzt.', '* El indicador de batería parpadea.', '* Pilabat cuelga de cabeza para pensar.'],
      calm: '* Pilabat ronronea como un cargador.',
      taunts: ['¡Bzzt!', '¡Me queda un diez por ciento!', '¡Energía al máximo... casi!'],
      acts: [
        { name: 'Recargar', text: 'conectas el cargador', mercy: 45, reply: '* Pilabat sube al 50 por ciento. Se ve más contenta.' },
        { name: 'Chiste', text: 'por qué la pila fue al doctor', mercy: 45, reply: '* "¡Porque estaba descargada!" Pilabat se ríe... un poco.' },
        { name: 'Apagar luz', text: 'apagas la luz para que duerma', mercy: 40, reply: '* Pilabat bosteza. Los murciélagos aman la oscuridad.' },
      ],
      bullets: {
        count: 11, interval: 1250, speed: 34,
        pool: 'abcdefghijklmnopqrstuvwxyz'.split('').concat(['la', 'me', 'si', 'to', 'pa', 'ru', 'co', 've', 'ni', 'da', 'zo', 'bi']),
      },
      drop: 'pilas',
      keysHint: 'Todas las letras + sílabas',
      onWord: gbRacha,
    },
    dani: {
      name: 'Dani Turbo',
      sprite: 'dani',
      mode: 'tecloides', // usa la batalla de Tecloides (js/scenes/tecloides.js)
      xp: 25,
      blurb: '¡MINIJEFE! En el Pasto Alto Grande te esperan la Profesora Letra y tu rival, Dani Turbo.',
      keysHint: 'Palabras de ataque + esquivar escribiendo',
    },
    tetrorey: {
      name: 'Tetro Rey',
      sprite: 'tetrorey',
      boss: true,
      mode: 'tetrorey', // jefe en 3 fases (js/scenes/tetrorey.js)
      friend: true,     // aunque tenga mode propio, se puede perdonar y sale en la vitrina
      hp: 120, atk: 4, def: 2, xp: 40,
      fightWords: 4, words: WORDS.t2,
      // Fase 2 (TETRIS VS): palabras de las piezas, las largas de la barra I y las cortitas de la
      // basura. Muchas primeras letras distintas (y ninguna con q o w): la primera letra decide qué escribes.
      vsWords: ['bloque', 'pieza', 'linea', 'torre', 'gira', 'cubo', 'caja', 'forma', 'nivel', 'punto', 'muro', 'suelo',
        'barra', 'cable', 'fila', 'rey', 'verde', 'pila', 'boton', 'jugar', 'salto', 'turbo', 'encaja', 'llave', 'dedo',
        'mapa', 'nube', 'tecla', 'union', 'hueco', 'zeta', 'ganar', 'rapido', 'alto', 'once', 'vamos', 'idea', 'yoyo'],
      vsLong: ['pantalla', 'cartucho', 'columnas', 'velocidad', 'torreones', 'tetromino', 'apilados', 'escaleras',
        'derribar', 'cuadritos', 'campeones', 'aventura', 'consolas', 'bloqueado'],
      vsJunk: ['sol', 'mar', 'pan', 'oso', 'uva', 'ajo', 'fin', 'gol', 'kilo', 'luz', 'dia', 'eco', 'hoy', 'isla',
        'nido', 'rio', 'tren', 'vaso', 'yate', 'zoo', 'jugo', 'bote', 'cola', 'taza'],
      // Fase 3: se leen en vertical, así que van cortitas.
      tallWords: ['torre', 'pieza', 'bloque', 'nivel', 'linea', 'cubo', 'caja', 'gira', 'fila', 'rey', 'muro', 'alto', 'tope', 'barra'],
      blurb: '¡JEFE! El rey de los bloques que caen. Tiene la Game Boy guardada en su torre.',
      intro: '* ¡EL TETRO REY baja girando desde lo alto!\n* "¿Quieres la Game Boy? ¡Tendrás que ganártela!"',
      check: '* TETRO REY - ATQ 4 DEF 2\n* Rey de los bloques que caen. Guarda la Game Boy en su torre.\n* Dicen que si se enoja... saca su Cable Link.',
      idle: ['* El Tetro Rey gira 90 grados. Se ve igual.', '* Una línea completa desaparece a lo lejos.', '* La música se pone más rápida...',
        '* En lo alto de la torre parpadea un puntito de un color... raro.'],
      calm: '* El Tetro Rey tararea una melodía muy famosa.',
      taunts: ['¡TODO ENCAJA EN MI REINO!', '¡CONECTA TU CABLE!', '¡LA GAME BOY ES MIA!'],
      acts: [
        { name: 'Girar', text: 'giras en el sentido del reloj', mercy: 30, reply: '* El Tetro Rey se marea un poquito. "¡Eso es trampa!"' },
        { name: 'Hacer línea', text: 'completas una línea perfecta', mercy: 35, reply: '* ¡LINEA! El Tetro Rey aplaude sin querer.' },
        { name: 'Reverencia', text: 'haces una reverencia a su majestad', mercy: 30, reply: '* "Hmm... por fin alguien con modales."' },
      ],
      bullets: {
        count: 12, interval: 1900, speed: 28, // con 1700 un niño a ~30 PPM no alcanza a esquivar y pierde
        pool: ['rey', 'bloque', 'gira', 'cae', 'torre', 'linea', 'pieza', 'nivel', 'fila', 'caja', 'rapido', 'punto'],
      },
      drop: 'cable',
      console: 'gameboy',
      keysHint: 'Palabras completas que caen (¡3 fases!)',
      onWord: gbRacha,
    },
    chupin: {
      name: 'Chupín',
      sprite: 'chupin',
      mode: 'chupin',   // minijefe que absorbe palabras (js/scenes/chupin.js)
      friend: true,
      hp: 90, atk: 3, def: 1, xp: 30,
      // Palabras que flotan en la Cueva de los Sueños (y que se puede tragar).
      words: ['nube', 'sueño', 'pastel', 'globo', 'siesta', 'cobija', 'luna', 'dulce', 'tomate', 'estrella',
        'flotar', 'cereza', 'helado', 'brinco', 'burbuja', 'almohada', 'aire', 'manzana', 'galleta', 'bostezo'],
      blurb: '¡MINIJEFE! En la Cueva de los Sueños vive una bolita que se traga TODO lo que escribes.',
      intro: '* Un letrero a la entrada de la Cueva de los Sueños dice:\n* "Aquí nació una bolita rosa en 1992."',
      intro2: '* ¡CHUPIN aparece flotando!\n* "Soy rosa. CONFIA EN MI."',
      check: '* CHUPIN - ATQ 3 DEF 1\n* Una bolita rosa... en cuatro tonos de verde.\n* Inhala palabras. ¡Escríbelas antes de que se las trague!',
      idle: ['* Chupín se infla como globo y flota un ratito.', '* Chupín bosteza. Casi te traga con todo y bostezo.',
        '* Se oye una musiquita de sueños a lo lejos.'],
      calm: '* Chupín tiene los cachetes rojos. Bueno, verde oscuro.',
      taunts: ['Hoy desayuné un diccionario.', '¡Poyo!... Perdón, eso es de otro.', '¡Ñam ñam!', '¡Todo cabe en mi pancita!'],
      acts: [
        { name: 'Dar de comer', text: 'le das una galleta pixel', mercy: 40, reply: '* Chupín se la traga entera. "¡Otra! ¡Otra!"' },
        { name: 'Flotar', text: 'inflas los cachetes y flotas', mercy: 35, reply: '* Flotan juntos. Chupín se ríe tanto que se desinfla.' },
        { name: 'Siesta', text: 'te acuestas a dormir con chupín', mercy: 45, reply: '* Zzz... Chupín ronca bajito. Es el mejor ronquido del mundo.' },
      ],
      bullets: { count: 12, interval: 1000, speed: 32, pool: 'asdfghjklqwertyuiop'.split('') }, // letras sueltas, pero seguiditas
      drop: 'gameboy_lupa',
      keysHint: 'Leer y escribir rápido (¡ABSORBER!)',
      onWord: gbRacha,
    },
  },
  treasures: {
    moneda_verde: { name: 'Moneda verde', desc: 'Moneda de cuatro tonos. No vale nada. Vale todo.' },
    cable_doble: { name: 'Cable doble', desc: 'Para intercambiar. Nunca supiste bien qué.' },
    gameboy_lupa: { name: 'Lupa con luz', desc: 'Para jugar debajo de la cobija. Regalo de Chupín.' },
    moneda_dorada: { name: 'Moneda dorada', sprite: 'monedina', desc: 'La hermana de Monedín te la regaló. Bueno, es ella. Dice que no se gasta.' },
    pila_extra: { name: 'Pila Extra', sprite: 'pilas', desc: 'Premio por 20 palabras seguidas sin error. ¡Dedos con batería llena!' },
    tomate: { name: 'Tomate máximo', desc: 'Premio de Chupa-Letras. Chupín jura que no se lo va a comer. Mentira.' },
  },
  sprites: GB_SPRITES,
  tracks: {
    // Tetro Rey (Re menor, marcial): 140 → 160 → 180, como en docs/LORE.md §14.
    gb_tetrorey: {
      bpm: 140,
      voices: [
        { wave: 'square', vol: 0.032, notes: GB_TETRO_MEL },
        { wave: 'square', vol: 0.016, notes: rep('D4/2 F4/2', 4) + ' ' + rep('A#3/2 D4/2', 4) + ' ' + rep('D4/2 F4/2', 2) + ' ' + rep('A#3/2 D4/2', 2) + ' ' + rep('A3/2 C#4/2', 4) },
        { wave: 'triangle', vol: 0.11, notes: GB_TETRO_BASS },
        { wave: 'noise', vol: 0.03, notes: rep('x/2 -/2 x x -/2', 8) }, // ritmo de marcha
      ],
    },
    // Fase 2 (TETRIS VS): Korobeiniki; se acelera cuando tu pila está alta.
    gb_tetrisvs: GB_KORO_TRACK,
    gb_tetrisvs_rapido: { ...GB_KORO_TRACK, bpm: 178 },
    // Fase 3: la marcha a 180 con arpegios de P2 "en tresillos".
    gb_tetrorey3: {
      bpm: 180,
      voices: [
        { wave: 'square', vol: 0.03, notes: GB_TETRO_MEL },
        { wave: 'square', vol: 0.014, notes: [gbArp('D5', 'F5', 'A5'), gbArp('A#4', 'D5', 'F5'), gbArp('D5', 'G5', 'A#5'), gbArp('A4', 'C#5', 'E5')].join(' ') },
        { wave: 'triangle', vol: 0.11, notes: GB_TETRO_BASS },
        { wave: 'noise', vol: 0.03, notes: rep('x x - x', 16) },
      ],
    },
    // Chupín (Fa mayor, dulce y traviesa) y su minijuego, un poquito más rápido.
    gb_chupin: GB_CHUPIN_TRACK,
    gb_chupaletras: { ...GB_CHUPIN_TRACK, bpm: 152 },
  },
  quests: {
    moneda_perdida: {
      name: 'La moneda perdida',
      desc: 'Monedín busca a su hermana. Dice que se esconde en el pasto alto del pueblo, en la esquina de abajo.',
    },
    racha_gb: {
      name: 'Racha de 20',
      desc: 'Escribe 20 palabras seguidas sin ningún error en las batallas del Valle Game Boy.',
      progress: () => `Mejor: ${Math.min(20, Save.data.flags.gbRachaMax || 0)}/20`,
    },
    dulces_suenos: {
      name: 'Dulces sueños',
      desc: 'Chupín te regaló CHUPA-LETRAS. Juégalo en la máquina arcade del pueblo y cómete 30 palabras en una partida.',
      progress: () => `Mejor: ${(Save.data.arcade || {}).chupaEaten || 0}/30`,
    },
  },
});
