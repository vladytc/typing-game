// MUNDO 1 — Valle Game Boy explorable (docs/LORE.md §4). Se carga después de js/worlds/gb.js.
// Cada enemigo está parado en un paso angosto entre zonas, así el orden de avance sale del mapa:
//
//   +----------------------------------------+
//   | CUEVA   D: orilla norte      TORRE     |   rocas tapan la cueva hasta vencer al Tetro Rey
//   | (rocas)        Tetro Rey ->  [puerta]  |
//   |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ puente ~~|
//   |#################################  Dani |
//   | B2 bosque  Cartuchon | C1 | C3 lab      |
//   |---Monedin---         |    | (Profesora) |
//   | B1 bosque            |-Linkito---Pilabat-|
//   |---Pixelito---        | C2 Pasto Alto     |
//   | A: tubería al pueblo |    Grande         |
//   +----------------------------------------+

const GB_FACTS = CONSOLES.find((c) => c.id === 'gameboy').facts;

// Leyenda extra (se mezcla con TILES de js/town-data.js):
//   B  bloque de la torre   O  puerta de la torre   =  puente   r  rocas (tapan la cueva)
//   K  entrada a la cueva   L  puerta del laboratorio
//   U  puerta de la tienda de herramientas (la casilla y la tienda están en js/secretos/gb.js)
const GB_VALLE_MAP = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'T.######..TT........TT.......BBBBBBB..TT',
  'T.##K###......T..............BBBBBBB.TTT',
  'T###r##.................**...BBBBBBB...T',
  'T...:...,,,......**..,,,,....BBBOBBB...T',
  'T...:.......................S...:....S.T',
  'T...::::::::::::::::::::::::::::::::...T',
  'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~=~~~T',
  'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~=~~~T',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT..:...T',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT:TTTT',
  'T.S......TT...T.....TTTT,,,,,,,,,,,:,TTT',
  'T.....:::::::::::::...T,,,RRRRR,,,,:,,,T',
  'T...T.:...,,,.T.*.:...T,,,RRRRR,,,,:,,,T',
  'TTTTTT:TTTTTTTT...:...T,,,WWLWW,,,,:,,,T',
  'T.....:.,,.TT.T,,.:,,,T..S..::::::::,,,T',
  'T.T.TT:.......T,,.:...T,,,,,,,,,,:,,,,,T',
  'T.....:::::.T.T...:...T,,,,,,,,,,:,,,,,T',
  'T,,.......:...TTTT:TTTTTTTTTTTTTT:TTTTTT',
  'TTTTTTTTTT:TTTT,,,:,,,,,,,,,,,,,,:,,,,,T',
  'T....SRRR.:...T,,S:,,,TTT,,,,,,,,:,,,,,T',
  'T,,,..WUW.:...T,,,:,,,,,,,,TT,,,,:,,,,,T',
  'T,,,......:.T.T,,,:,,,,,,,,,,,,,,:,,T,,T',
  'T,,,......:...T,,,:,,,,,,,,,,,,,,:,,,,,T',
  'T.........:...T,,,::::::::::::::::,,,,,T',
  'T..::::::::...T,,,,,,,,,,,,,,,,,,,,,,,,T',
  'T..:.S.....,,,T,,,,,**,,,,,,,,.,,,,,,,,T',
  'T..P..**...,,,TTT,,,,,,,TTT,,,S,,,,,,,,T',
  'T..........,,,T,,,,,,,,,,,,,,,,,,,,,,,,T',
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
];

const GB_CUEVA_MAP = [
  '######################',
  '########......########',
  '######..........######',
  '#####............#####',
  '####..##......##..####',
  '####..##......##..####',
  '###................###',
  '###...~~~....~~~...###',
  '###...~~~....~~~...###',
  '####..............####',
  '#####....####....#####',
  '#####....####....#####',
  '####..............####',
  '####..S...........####',
  '#####............#####',
  '#######........#######',
  '#########....#########',
  '##########^^##########',
];

// Casillas y objetos nuevos (16×16, letras a/b/c/d).
// Rocas redonditas: círculos con borde oscuro, brillo arriba a la izquierda y sombra abajo.
const gbBlobs = (list) => rowsOf((x, y) => {
  for (const [cx, cy, r] of list) {
    const dx = x + 0.5 - cx;
    const dy = y + 0.5 - cy;
    const dd = Math.hypot(dx, dy);
    if (dd > r) continue;
    if (dd > r - 1.1) return 'd';
    if (dx + dy < -r * 0.6) return 'a';
    if (dx + dy > r * 0.5) return 'c';
    return 'b';
  }
  return '.';
});

Object.assign(SPRITES, {
  cofre: [
    '................',
    '................',
    '...dddddddddd...',
    '..dbbbbbbbbbbd..',
    '..dbaaaaaaaabd..',
    '..dbbbbbbbbbbd..',
    '..dddddaaddddd..',
    '..dcccdaadcccd..',
    '..dcccddddcccd..',
    '..dbbbbbbbbbbd..',
    '..dccccccccccd..',
    '..dbbbbbbbbbbd..',
    '..dccccccccccd..',
    '..dddddddddddd..',
    '................',
    '................',
  ],
  cofre_abierto: [
    '................',
    '...dddddddddd...',
    '..dbbbbbbbbbbd..',
    '..dbaaaaaaaabd..',
    '..dbbbbbbbbbbd..',
    '..dddddddddddd..',
    '..dddddddddddd..',
    '..ddddddaddddd..',
    '..dccccccccccd..',
    '..dbbbbbbbbbbd..',
    '..dccccccccccd..',
    '..dbbbbbbbbbbd..',
    '..dccccccccccd..',
    '..dddddddddddd..',
    '................',
    '................',
  ],
  rocas: gbBlobs([[4.5, 11.5, 4.5], [11.5, 11.5, 4.2], [8, 5.5, 4.5]]),
  // Bloque de la torre del Tetro Rey (con bisel, como las piezas de los juegos de bloques).
  bloque: rowsOf((x, y) => {
    if (x === 0 || y === 0 || x === 15 || y === 15) return 'd';
    if (x === 1 || y === 1) return 'a';
    if (x === 14 || y === 14) return 'c';
    if (x >= 5 && x <= 10 && y >= 5 && y <= 10) return x === 5 || y === 5 ? 'c' : x === 10 || y === 10 ? 'a' : 'b';
    return 'b';
  }),
  // Puente de tablas sobre el río (se cruza de norte a sur).
  puente: rowsOf((x, y) => {
    if (x === 0 || x === 15) return 'c';
    if (x <= 1 || x >= 14) return 'd';
    if (y % 4 === 3) return 'c';
    return (x * 5 + y * 3) % 11 === 0 ? 'c' : 'b';
  }),
  cuevapiso: tileFrom('c', speckles(10, 5, 'd').concat(speckles(5, 13, 'b'))),
  cuevamuro: rowsOf((x, y) => (y % 8 === 7 || (x + (Math.floor(y / 8) % 2) * 5) % 10 === 0 ? 'c' : 'd')),
  // Una pieza L perdida (NPC del valle).
  pieza: [
    '................',
    '...ddddddd......',
    '...dbbbbad......',
    '...dbbbbbd......',
    '...dcccccd......',
    '...ddddddd......',
    '...dbbbbad......',
    '...dbdbdbd......',
    '...dbbbbbd......',
    '...dcdddcd......',
    '...ddddddddddddd',
    '...dbbbbadbbbbad',
    '...dbbbbbdbbbbbd',
    '...dbbbbbdbbbbbd',
    '...dcccccdcccccd',
    '...ddddddddddddd',
  ],
  audifonos: [
    '................',
    '.....dddddd.....',
    '...ddccccccdd...',
    '..dcc......ccd..',
    '.dc..........cd.',
    '.dc..........cd.',
    '.dc..........cd.',
    'ddd..........ddd',
    'dbbd........dbbd',
    'dbad........dbad',
    'dbbd........dbbd',
    'dbbd........dbbd',
    'dcbd........dcbd',
    '.dd..........dd.',
    '................',
    '................',
  ],
  funda: [
    '................',
    '................',
    '...dddddddddd...',
    '..dccccccccccd..',
    '..dccccaaccccd..',
    '..ddccccccccdd..',
    '..dbddddddddbd..',
    '..dbbbbbbbbbbd..',
    '..dbaabbbbbbbd..',
    '..dbabbbbbbbbd..',
    '..dbbbbbbbbbbd..',
    '..dbbbbbbbbbbd..',
    '..dbbbbbbbbcbd..',
    '..dcbbbbbbbbcd..',
    '...dddddddddd...',
    '................',
  ],
  camara: [
    '................',
    '.....dddddd.....',
    '....dccccccd....',
    '...dcbddddbcd...',
    '...dcdaabbdcd...',
    '...dcdabbbdcd...',
    '...dcbddddbcd...',
    '....dccccccd....',
    '.....dddddd.....',
    '.....dbbbbd.....',
    '...dddddddddd...',
    '...dbbbbbbbbd...',
    '...dbddddddbd...',
    '...dbbbbbbbbd...',
    '...dddddddddd...',
    '................',
  ],
});

// Tesoros nuevos del valle (salen en la sala Game Boy del museo).
Object.assign(TREASURES, {
  audifonos: { room: 'gb', name: 'Audífonos', desc: 'La Game Boy tenía una sola bocina (mono), pero con audífonos ¡sonaba en estéreo!' },
  funda: { room: 'gb', name: 'Funda de viaje', desc: 'Para que la pantalla no se raye en la mochila. Caben la consola, 4 pilas AA y un cartucho.' },
  camara: { room: 'gb', name: 'Cámara de bolsillo', desc: 'Como la Game Boy Camera (1998): fotos en 4 tonos de verde. ¡Y con su impresora salían en calcomanía!' },
});

// Música del valle (melodía original, Sol mayor, de paseo).
Object.assign(TRACKS, {
  gb_valle: {
    bpm: 118,
    voices: [
      {
        wave: 'square', vol: 0.032,
        notes: 'G4/2 B4/2 D5/2 B4/2 C5/2 E5/2 D5/4 B4/2 G4/2 A4/2 B4/2 A4/8 ' +
          'G4/2 B4/2 D5/2 G5/2 F#5/2 E5/2 D5/4 C5/2 E5/2 D5/2 A4/2 G4/8',
      },
      { wave: 'triangle', vol: 0.09, notes: 'G2/4 D3/4 G2/4 D3/4 E2/4 B2/4 D2/4 A2/4 C3/4 G2/4 G2/4 D3/4 C3/4 D3/4 G2/8' },
      { wave: 'noise', vol: 0.018, notes: rep('x/4 -/4 x/2 x/2 -/4', 4) },
    ],
  },
});

addMaps('gb', {
  entry: { map: 'gb-valle', spawn: [3, 26, 'up'] },
  maps: {
    'gb-valle': {
      name: 'Valle Game Boy',
      intro: ['* ¡El Valle Game Boy! Todo es verde... como en la pantalla de la Game Boy.', '* Los enemigos cierran los caminos. Para pasar, tendrás que escribir.\n* (ESC abre el menú para volver al pueblo.)'],
      music: 'gb_valle',
      map: GB_VALLE_MAP,
      // Al vencer al Tetro Rey, las rocas se mueven y se abre la Cueva de los Sueños.
      variants: [{ when: () => !!Save.data.done.tetrorey, map: GB_VALLE_MAP.map((r) => r.replace('r', ':')) }],
      tiles: {
        B: { s: 'bloque', solid: true, look: 'torre' },
        O: { s: 'door', solid: true, look: 'torre_puerta' },
        '=': { s: 'puente' },
        r: { s: 'rocas', solid: true, look: 'rocas' },
        K: { s: 'cave' },
        L: { s: 'door', solid: true, look: 'lab' },
      },
      spawns: { start: [3, 26, 'up'] },
      exits: {
        '3,27': { pueblo: 'gb' },
        '4,2': { map: 'gb-cueva', spawn: [10, 16, 'up'] },
      },
      encounters: [
        { enemy: 'pixelito', x: 10, y: 19, say: ['* ¡Boing! ¡De aquí no pasas sin rebotar conmigo!'] },
        { enemy: 'monedin', x: 6, y: 14 },
        { enemy: 'cartuchon', x: 14, y: 12 },
        { enemy: 'linkito', x: 18, y: 18 },
        { enemy: 'pilabat', x: 33, y: 18 },
        { enemy: 'dani', x: 35, y: 10, say: ['* ¡Alto ahí! Nadie cruza al río sin pelear conmigo primero.', '* ¿Ya tienes un Tecloide? ¡Pues a ver si sabes usarlo!'] },
        { enemy: 'tetrorey', x: 32, y: 5, say: ['* ¡ALTO! ¡Nadie entra a mi torre sin encajar primero!'] },
      ],
      chests: [
        { id: 'gb_audifonos', x: 1, y: 15, treasure: 'audifonos', word: 'estéreo' },
        { id: 'gb_funda', x: 38, y: 28, treasure: 'funda', word: 'mochila' },
        { id: 'gb_camara', x: 12, y: 2, treasure: 'camara', word: 'sonríe' },
      ],
      wild: ['pixelito', 'monedin', 'cartuchon', 'linkito', 'pilabat'],
      signs: {
        '5,26': ['* VALLE GAME BOY\n* (Tubería al Pueblo Vitrina)', `* ${GB_FACTS[0]}`],
        '2,11': ['* BOSQUE DE LOS CARTUCHOS', `* ${GB_FACTS[3]}`],
        '17,20': '* PASTO ALTO GRANDE\n* Lugar de la Pokédex: aquí hubo 151. Contamos.',
        '30,27': ['* DATO DEL VALLE', `* ${GB_FACTS[4]}`],
        '25,15': '* LABORATORIO DE CAMPO\n* DE LA PROFESORA LETRA\n* Prohibido pisar a los Tecloides.',
        '28,5': ['* TORRE DEL TETRO REY', `* ${GB_FACTS[1]}`],
        '37,5': ['* DATO DEL VALLE', `* ${GB_FACTS[2]}`],
      },
      looks: {
        torre: '* Una torre de bloques perfectamente encajados.\n* Hasta arriba parpadea un puntito de un color... raro.',
        torre_puerta: '* La puerta de la torre.\n* Tiene un candado con forma de T.',
        rocas: '* Unas rocas enormes tapan la entrada de una cueva.\n* Tiemblan cada vez que el Tetro Rey grita.',
        lab: '* Adentro se oyen pitidos...\n* y a alguien tecleando MUY rápido.',
      },
      bitTips: [
        '* Los monstruos del valle cuidan los caminos angostos.\n* ¡Hay que vencerlos (o hacernos amigos) para pasar!',
        '* Con ESC podemos volver al pueblo cuando quieras.',
        '* Esa torre del fondo... ¿no tiene un puntito de un color raro?',
        '* Los letreros tienen datos de la Game Boy de verdad.\n* ¡Léelos todos!',
        '* En el pasto alto vuelven a salir los que ya vencimos.\n* ¡Buena práctica para los dedos!',
        '* Dicen que detrás de unas rocas, junto al río, hay una cueva que huele a pastel.',
      ],
      npcs: [
        {
          id: 'abuelo_gris', sprite: 'viejo', x: 7, y: 23,
          async talk(ctx) {
            if (!ctx.flag('metAbueloGris')) {
              ctx.setFlag('metAbueloGris');
              await ctx.say([
                '* ¡Un viajero! Hacía como 30 años que nadie salía de esa tubería.',
                '* Los monstruos del valle se paran justo en los caminos angostos.\n* Para pasar, chócalos o háblales... ¡y prepara los dedos!',
                '* Y en el pasto alto, los que ya venciste salen otra vez a practicar.',
              ], 'ABUELO GRIS');
              return;
            }
            await ctx.say([rand([
              '* ¿Ves esa torre al fondo? Ahí vive el Tetro Rey.\n* Dicen que no ha dejado de girar en años.',
              '* En mis tiempos jugábamos con 4 pilas AA durante horas.\n* Bueno, hasta que se acababan.',
              '* Por aquí escondieron cofres con candados de letras.\n* Solo los abre quien escribe la palabra.',
              '* Me dicen ABUELO GRIS porque soy de cuatro tonos.\n* Como todos aquí, la verdad.',
            ])], 'ABUELO GRIS');
          },
        },
        {
          id: 'pieza_l', sprite: 'pieza', x: 20, y: 13,
          async talk(ctx) {
            const lines = [
              '* Soy una PIEZA L.\n* Llevo desde 1989 buscando un hueco de mi forma.',
              '* Una vez casi encajo en una casa.\n* Pero era un perro.',
              '* Si ves al Tetro Rey, dile que no estoy perdida.\n* Solo estoy... girando para pensar.',
              '* Allá arriba, detrás de la torre, en la esquina, sobró un hueco.\n* Algo flotaba ahí... pero de lejos no se ve nada.',
            ];
            await ctx.say([lines[ctx.counter('piezaL') % lines.length]], 'PIEZA L');
          },
        },
        {
          id: 'profesora_valle', sprite: 'profesora', x: 27, y: 15,
          async talk(ctx) {
            const d = Save.data;
            if (!(d.team || []).length) {
              await ctx.say([
                '* ¡Llegaste a mi laboratorio de campo!\n* Bienvenido al Pasto Alto Grande.',
                '* Mi otro alumno, DANI, te espera en el paso del norte, junto al río.\n* Quiere retarte a una batalla de TECLOIDES.',
                '* No te preocupes: cuando empiece te presto un Tecloide.\n* ¡Elígelo escribiendo su nombre!',
              ], 'PROFESORA LETRA');
              Quests.start('primer_tecloide');
              return;
            }
            await ctx.say([
              d.done.dani
                ? '* ¡Le ganaste a Dani! Anda presumiendo que te dejó ganar.\n* No le creas.'
                : '* Dani te espera en el paso del norte.\n* ¡Escribe rápido y sin errores!',
              rand([
                '* CHISPA le gana a GOTA, GOTA a BROTE y BROTE a CHISPA.',
                '* En el turno rival, escribe la palabra de su ataque para esquivar.\n* ¡Recibes la mitad del daño!',
                '* Estudio el pasto alto porque aquí los Tecloides se sienten en casa.',
              ]),
            ], 'PROFESORA LETRA');
          },
        },
      ],
    },

    'gb-cueva': {
      name: 'Cueva de los Sueños',
      music: 'title',
      map: GB_CUEVA_MAP,
      ground: 'cuevapiso',
      tiles: {
        '#': { s: 'cuevamuro', solid: true },
        '.': { s: 'cuevapiso' },
        '^': { s: 'grass' },
      },
      spawns: { start: [10, 16, 'up'] },
      exits: {
        '10,17': { map: 'gb-valle', spawn: [4, 3, 'down'] },
        '11,17': { map: 'gb-valle', spawn: [4, 3, 'down'] },
      },
      encounters: [
        { enemy: 'chupin', x: 11, y: 2, say: ['* ...Zzz... ¿eh? ¡¿Visitas?!'] },
      ],
      signs: {
        '6,13': ['* Aquí nació una bolita rosa en 1992.', '* Su creador después inventó un juego donde los personajes de Nintendo pelean todos juntos.'],
      },
      bitTips: [
        '* Aquí huele a pastel... y a siesta.',
        '* Shh. Algo rosa ronca al fondo.\n* Bueno, verde.',
      ],
    },
  },
});
