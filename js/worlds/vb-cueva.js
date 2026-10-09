// MUNDO SECRETO — LA CUEVA ROJA (Virtual Boy, 1995). Diseño en docs/LORE.md §11.2.
// Post-juego: se abre al terminar el final (Save.data.flags.finJugado), por la reja del camino del
// este, detrás del Roncatón (js/fin-pueblo.js). Solo rojo y negro, 4 tonos, como el Virtual Boy real.
// Todo con "profundidad falsa": cada personaje lleva un fantasma rojo oscuro detrás (css/fin.css).
//
// No se registra con addWorld (no tiene tubería ni sala propia): sus enemigos, tesoros, música y
// sprites se agregan aquí, y sus zonas con addMaps('vb', ...). La era 'vb' entra a HUB_ERAS solo
// para las paletas de casillas y personajes (ningún mundo la usa, así que el pueblo nunca la toma).
//
//   vb-claro   el claro del cartucho rojo gigante (salida al pueblo por la izquierda)
//   vb-cueva   la cueva: Rojito → Doble Visión → Trípode → VISORIO (jefe) → el pedestal y ECO ROJO
//
//   ##########################      O  salida al claro      R  Rojito (5,7)
//   #O...#.......#...........#      D  Doble Visión (13,3)  T  Trípode (17,9)
//   #....#..c....#..fff......#      V  Visorio (20,12)      A  pedestal del Virtual Boy
//   #..S.#.......D..fff..S...#      c  cofres               ,  pasto alto (encuentros)
//   #....#.......#..fff......#      f  suelo "lejano" (más oscuro)
//   #....#.......#...........#
//   #....#.......#...........#
//   #....R.......#.....c.....#
//   #....#.......#...........#
//   #....#.......####T########
//   #,,..#.......#......#....#
//   #,,,.#..S....#.~~~..#.A..#
//   #,,..#.......#.~~~..V....#
//   #....#.......#......#....#
//   ##########################
//
// Para probar (consola del navegador):
//   Save.data.flags.finJugado = true; Save.data.flags.roncatonAwake = true;
//   Game.go('town', { map: 'vb-cueva', spawn: [2, 2, 'down'] })

const VB4 = { k0: '#000000', k1: '#550000', k2: '#AA0000', k3: '#FF0000' };
const VB_CHARS = { a: VB4.k3, b: VB4.k3, c: VB4.k2, d: VB4.k1 };
const VB_TILE = { a: VB4.k0, b: VB4.k1, c: VB4.k2, d: VB4.k3 };

// ---------- Paletas de la era roja ----------
HUB_ERAS.vb = {
  label: 'ERA ROJA',
  theme: 'theme-vb',
  tiles: {
    grass: { a: VB4.k0, b: VB4.k1, c: VB4.k1, d: VB4.k2 },
    tall: { a: VB4.k0, b: VB4.k1, c: VB4.k2, d: VB4.k2 },
    flower: { a: VB4.k0, b: VB4.k1, c: VB4.k1, d: VB4.k3 },
    path: { a: VB4.k0, b: VB4.k1, c: VB4.k0, d: VB4.k2 },
    rock: { a: VB4.k3, b: VB4.k1, c: VB4.k2, d: VB4.k3 },
    water: { a: VB4.k3, b: VB4.k3, c: VB4.k2, d: VB4.k1 },
    tree: { a: VB4.k3, b: VB4.k2, c: VB4.k1, d: VB4.k0 },
    sign: { a: VB4.k3, b: VB4.k2, c: VB4.k1, d: VB4.k0 },
    cave: { a: VB4.k3, b: VB4.k1, c: VB4.k2, d: VB4.k0 },
    vb_cart: VB_TILE, vb_label: VB_TILE, vb_hole: VB_TILE, vb_altar: VB_TILE,
  },
  chars: VB_CHARS,
  charOverrides: {},
};

// ---------- La consola ----------
CONSOLES.push({
  id: 'virtualboy', name: 'Virtual Boy', year: 1995,
  facts: [
    'Salió en 1995 y solo mostraba ROJO sobre NEGRO, con luces LED rojas.',
    'Lo diseñó Gunpei Yokoi, el mismo creador de la Game Boy y de los Game & Watch.',
    'Para jugar pegabas la cara al visor, que se apoyaba en la mesa sobre un soporte con patas.',
    'Su control tenía DOS crucetas, una para cada pulgar.',
    'Se dejó de vender en menos de un año. Salieron muy poquitos juegos: ¡es una rareza!',
  ],
});

// ---------- Sprites (todos con la paleta roja fija, para verse igual en cualquier lado) ----------
const VB_SPRITES = {
  virtualboy: [
    '................',
    '................',
    '..dddddddddddd..',
    '.dccccccccccccd.',
    '.dcaabccccbaacd.',
    '.dcabbccccbbacd.',
    '.dccccccccccccd.',
    '..dddddddddddd..',
    '.......dd.......',
    '.......dd.......',
    '......dccd......',
    '.....d.dd.d.....',
    '....d..dd..d....',
    '...d...dd...d...',
    '..dd...dd...dd..',
    '................',
  ],
  vb_rojito: SPRITES.pixelito,
  vb_doble: [
    '................',
    '....dddddd......',
    '...dccccccd.....',
    '..dcbbbbbbcd....',
    '.dcbaaaaaabcd...',
    '.dcbaaddaabcd...',
    '.dcbaaddaabcd...',
    '.dcbaaaaaabcd...',
    '..dcbbbbbbcd....',
    '...dccccccd.....',
    '....dddddd......',
    '.....d..d.......',
    '....dc..cd......',
    '....dd..dd......',
    '................',
    '................',
  ],
  vb_tripode: [
    '................',
    '...dddddddddd...',
    '..dccccccccccd..',
    '..dcaaccccaacd..',
    '..dcaaccccaacd..',
    '..dccccccccccd..',
    '...dddddddddd...',
    '.......dd.......',
    '.......dd.......',
    '......dccd......',
    '.....dcddcd.....',
    '....dcd..dcd....',
    '...dcd....dcd...',
    '..dcd......dcd..',
    '..dd........dd..',
    '................',
  ],
  visorio: [
    '................',
    '..dddddddddddd..',
    '.dccccccccccccd.',
    '.dcbbbbccbbbbcd.',
    '.dcbaabccbaabcd.',
    '.dcbadbccbdabcd.',
    '.dcbbbbccbbbbcd.',
    '.dccccbbbbccccd.',
    '..dddddddddddd..',
    '......dccd......',
    '......dccd......',
    '.....dcddcd.....',
    '....dcd..dcd....',
    '...dcd....dcd...',
    '..dcd......dcd..',
    '..dd........dd..',
  ],
  lente_rojo: [
    '................',
    '.....dddddd.....',
    '...ddccccccdd...',
    '..dcbbbbbbbbcd..',
    '..dcbaabbbbbcd..',
    '.dcbaabbbbbbbcd.',
    '.dcbabbbbbbbbcd.',
    '.dcbbbbbbbbbbcd.',
    '.dcbbbbbbbbbbcd.',
    '.dcbbbbbbbbbbcd.',
    '..dcbbbbbbbbcd..',
    '..dcbbbbbbbbcd..',
    '...ddccccccdd...',
    '.....dddddd.....',
    '................',
    '................',
  ],
  control_doble: [
    '................',
    '................',
    '................',
    '...dddddddddd...',
    '..dccccccccccd..',
    '.dcbdbccccbdbcd.',
    '.dcdddccccdddcd.',
    '.dcbdbccccbdbcd.',
    '.dccccccccccccd.',
    '.dccccddddccccd.',
    '..dccd....dccd..',
    '...dd......dd...',
    '................',
    '................',
    '................',
    '................',
  ],
  vb_cart: [
    'cccccccccccccccc',
    'cbbbbbbbbbbbbbbc',
    'cbaaaaaaaaaaaabc',
    'cbaaaaaaaaaaaabc',
    'cbbbbbbbbbbbbbbc',
    'cccccccccccccccc',
    'cbbbbbbbbbbbbbbc',
    'cbaaaaaaaaaaaabc',
    'cbaaaaaaaaaaaabc',
    'cbbbbbbbbbbbbbbc',
    'cccccccccccccccc',
    'cbbbbbbbbbbbbbbc',
    'cbaaaaaaaaaaaabc',
    'cbaaaaaaaaaaaabc',
    'cbbbbbbbbbbbbbbc',
    'cccccccccccccccc',
  ],
  vb_label: [
    'dddddddddddddddd',
    'daaaaaaaaaaaaaad',
    'daddddddaddddaad',
    'daaaaaaaaaaaaaad',
    'daddadddddaddaad',
    'daaaaaaaaaaaaaad',
    'dadddaddddddaaad',
    'daaaaaaaaaaaaaad',
    'daaaaaaaaaaaaaad',
    'daddddaddadddaad',
    'daaaaaaaaaaaaaad',
    'dadddddddaddaaad',
    'daaaaaaaaaaaaaad',
    'daaaaaaaaaaaaaad',
    'daaaaaaaaaaaaaad',
    'dddddddddddddddd',
  ],
  vb_hole: [
    'cccccccccccccccc',
    'cbbbbbbbbbbbbbbc',
    'cbaaaaaaaaaaaabc',
    'cbaaaaaaaaaaaabc',
    'cbaaaaaaaaaaaabc',
    'cbaaaaaaaaaaaabc',
    'cbaaaaaaaaaaaabc',
    'cbaaaaaaaaaaaabc',
    'cbaaaaaaaaaaaabc',
    'cbaaaaaaaaaaaabc',
    'cbaaaaaaaaaaaabc',
    'cbaaaaaaaaaaaabc',
    'cbaaaaaaaaaaaabc',
    'cbaaaaaaaaaaaabc',
    'cbaaaaaaaaaaaabc',
    'cbaaaaaaaaaaaabc',
  ],
  vb_altar: [
    '................',
    '................',
    '....dddddddd....',
    '...dccccccccd...',
    '...dcbbbbbbcd...',
    '...dccccccccd...',
    '....dddddddd....',
    '.....dccccd.....',
    '.....dcbbcd.....',
    '.....dcbbcd.....',
    '.....dcbbcd.....',
    '....dccccccd....',
    '...dccccccccd...',
    '...dddddddddd...',
    '................',
    '................',
  ],
};
Object.assign(SPRITES, VB_SPRITES);
['virtualboy', 'vb_rojito', 'vb_doble', 'vb_tripode', 'visorio', 'lente_rojo', 'control_doble'].forEach((id) => { SPRITE_PALETTES[id] = VB_CHARS; });

// ---------- Tesoros (salen en la vitrina, en el estante del Virtual Boy) ----------
Object.assign(TREASURES, {
  tripode: { room: 'vb', sprite: 'vb_tripode', name: 'Trípode del visor', desc: 'El soporte de Visorio. Se tambalea un poquito, pero aguanta. Como todos.' },
  lente_rojo: { room: 'vb', name: 'Lente rojo', desc: 'Si miras por él, todo se ve rojo. Hasta tus recuerdos.' },
  control_doble: { room: 'vb', name: 'Control de dos crucetas', desc: 'Una cruceta para cada pulgar. Para moverte en 3D... rojo.' },
});

// ---------- Música ORIGINAL (§14.2). Cada voz suma los mismos pasos. ----------
Object.assign(TRACKS, {
  // Cueva Roja: Do# menor, mono y grave; la segunda voz es un eco un paso atrás. Latido en el ruido.
  vb_cueva: {
    bpm: 72,
    voices: [
      { wave: 'square', vol: 0.03, notes: 'C#5/8 E5/4 D#5/4 C#5/8 G#4/8 A4/8 G#4/4 E4/4 C#4/16' },
      { wave: 'square', vol: 0.012, notes: '-/1 C#5/8 E5/4 D#5/4 C#5/8 G#4/8 A4/8 G#4/4 E4/4 C#4/15' },
      { wave: 'noise', vol: 0.03, notes: rep('x/1 -/3 x/1 -/11', 4) },
    ],
  },
  // Batallas de la cueva.
  vb_batalla: {
    bpm: 140,
    voices: [
      { wave: 'square', vol: 0.03, notes: 'C#5/2 C#5/1 E5/1 G#5/2 E5/2 F#5/2 E5/1 D#5/1 C#5/4 B4/2 C#5/2 E5/2 D#5/2 C#5/8' },
      { wave: 'triangle', vol: 0.1, notes: `${rep('C#2/2 C#3/2', 4)} ${rep('A1/2 A2/2', 2)} ${rep('B1/2 B2/2', 2)}` },
      { wave: 'noise', vol: 0.024, notes: rep('x/2 -/1 x/1', 8) },
    ],
  },
  // Visorio: dos capas que se turnan, una brillante (arriba) y una oscura (una octava abajo).
  vb_visorio: {
    bpm: 126,
    voices: [
      { wave: 'square', vol: 0.032, notes: 'C#6/2 E6/2 G#6/4 F#6/2 E6/2 D#6/4 C#6/2 D#6/2 E6/2 F#6/2 G#6/8 -/32' },
      { wave: 'square', vol: 0.03, notes: '-/32 C#4/4 E4/4 G#4/4 F#4/4 E4/8 C#4/8' },
      { wave: 'triangle', vol: 0.1, notes: `${rep('C#2/2 C#3/2', 8)} ${rep('A1/2 A2/2', 4)} ${rep('B1/2 B2/2', 4)}` },
      { wave: 'noise', vol: 0.026, notes: rep('x/2 -/1 x/1', 16) },
    ],
  },
});

// ---------- Enemigos ----------
const VB_BASE = { theme: 'vb', music: 'vb_batalla', strictAccents: true };
const vbClass = (cls) => (scene) => { const b = $('.battle'); if (b) b.classList.add(cls); };
Object.assign(ENEMIES, {
  vbrojito: {
    ...VB_BASE,
    name: 'Rojito', sprite: 'vb_rojito', hp: 150, atk: 6, def: 5, xp: 45, fightWords: 5,
    words: ['rojo', 'visor', 'lente', 'espejo', 'fondo', 'cerca', 'lejos', 'brillo', 'sombra', 'profundo', 'capa', 'negro', 'foco', 'reflejo'],
    blurb: 'Un píxel rojo. Primo de Pixelito.', keysHint: 'Velocidad en rojo',
    intro: '* ¡Rojito brinca frente a ti!\n* ...Se parece MUCHÍSIMO a alguien que conoces.',
    check: '* ROJITO - ATQ 6 DEF 5\n* Un píxel rojo. Primo de Pixelito, del lado del Virtual Boy.',
    idle: ['* Rojito rebota: ¡boing rojo!', '* BIT: ¿Ese no es Pixelito? ...No. Pixelito es verde. Creo.', '* Todo es rojo. Hasta tu sombra.'],
    calm: '* Rojito rebota más despacito.',
    taunts: ['¡Boing rojo!', '¡Soy de 1995!', '¡Todo es rojo!'],
    acts: [
      { name: 'Primo', text: 'le cuentas que pixelito vive en tu pueblo', mercy: 50, reply: '* "¿PIXELITO? ¡Es mi primo! ¡Dile que lo saludo!"' },
      { name: 'Saludar', text: 'lo saludas como se saludan los primos', mercy: 40, reply: '* "¡Boing! ¡Boing rojo!" (Así se saludan los primos.)' },
      { name: 'Color', text: 'le dices que el rojo le queda muy bien', mercy: 30, reply: '* Rojito se pone... más rojo.' },
    ],
    bullets: { count: 12, interval: 950, speed: 44, pool: ['rojo', 'luz', 'capa', 'eco', 'foco', 'lente', 'ojo', 'visor', 'mesa'] },
  },
  vbdoble: {
    ...VB_BASE,
    name: 'Doble Visión', sprite: 'vb_doble', hp: 165, atk: 6, def: 5, xp: 48, fightWords: 5,
    words: ['doble', 'espejo', 'gemelo', 'copia', 'reflejo', 'adelante', 'atrás', 'capa', 'imagen', 'brillante', 'oscuro', 'ojo'],
    blurb: 'Se dibuja dos veces.', keysHint: 'Leer la palabra de adelante',
    intro: '* ¡Doble Visión aparece! ...¿Dos veces?\n* (Sus palabras se ven dobles. Escribe la de ADELANTE, la brillante.)',
    check: '* DOBLE VISION - ATQ 6 DEF 5\n* Todo lo dice dos veces. Todo lo dice dos veces.',
    idle: ['* Doble Visión parpadea. Doble Visión parpadea.', '* Ves dos de todo. Bit dice que él solo es uno.', '* BIT: Si te mareas, mira la de adelante. La brillante.'],
    calm: '* Doble Visión se enfoca. Ya casi es uno solo.',
    taunts: ['¡Dos! ¡Dos!', '¿Cuál soy yo?', '¡Adelante y atrás!'],
    acts: [
      { name: 'Enfocar', text: 'le ayudas a enfocar la vista', mercy: 45, reply: '* Las dos imágenes se juntan... casi.\n* "¡Ah! Así se ve el mundo."' },
      { name: 'Parpadear', text: 'parpadean juntos tres veces', mercy: 40, reply: '* Parpadean. Parpadean. Parpadean.\n* "Je. Eso relaja."' },
      { name: 'Contar', text: 'le dices que uno también es suficiente', mercy: 35, reply: '* "...¿Uno solo? ¿Y así está bien?" Sí. Así está bien.' },
    ],
    bullets: { count: 12, interval: 950, speed: 44, pool: ['dos', 'doble', 'eco', 'par', 'ojo', 'copia', 'capa', 'atrás'] },
    onEnter: vbClass('vb-doble'),
  },
  vbtripode: {
    ...VB_BASE,
    name: 'Trípode', sprite: 'vb_tripode', hp: 180, atk: 7, def: 6, xp: 50, fightWords: 5,
    words: ['patas', 'soporte', 'mesa', 'firme', 'equilibrio', 'tambalea', 'apoyo', 'base', 'altura', 'recto', 'sostener', 'pie'],
    blurb: 'Un soporte que se tambalea.', keysHint: 'Palabras que oscilan',
    intro: '* ¡Un Trípode se tambalea hacia ti!\n* (Sus palabras oscilan de un lado al otro. Se escriben igual.)',
    check: '* TRIPODE - ATQ 7 DEF 6\n* Sostenía el visor en la mesa. Desde que nadie juega, se tambalea.',
    idle: ['* El Trípode se balancea. Tic. Tac.', '* Una de sus patas es más corta. Pobre.', '* BIT: Dato: el visor se ponía en la mesa sobre un soporte con patas.'],
    calm: '* El Trípode se queda quieto. ¡Firme!',
    taunts: ['¡Me caigo!', '¡Uy, uy, uy!', '¡Sostente!'],
    acts: [
      { name: 'Calzar', text: 'le pones un papelito doblado en la pata', mercy: 50, reply: '* ¡Ya no se tambalea! "¡Es el truco más viejo del mundo!"' },
      { name: 'Apoyar', text: 'te apoyas en él con cuidado', mercy: 35, reply: '* "...Hace años que nadie se apoyaba en mí."' },
      { name: 'Medir', text: 'mides sus tres patas con una regla', mercy: 30, reply: '* Ninguna mide igual. "¡Por eso!"' },
    ],
    bullets: { count: 12, interval: 950, speed: 46, pool: ['pata', 'mesa', 'pie', 'base', 'tic', 'tac', 'apoyo', 'firme'] },
    onEnter: vbClass('vb-tripode'),
  },
  visorio: {
    ...VB_BASE,
    name: 'Visorio', sprite: 'visorio', boss: true, friend: true, mode: 'visorio', console: 'virtualboy', drop: 'tripode',
    music: 'vb_visorio', hp: 420, atk: 7, def: 6, xp: 100, fightWords: 8,
    words: ['rojo', 'visor', 'lente', 'espejo', 'fondo', 'cerca', 'negro', 'brillo', 'profundo', 'tres', 'dimensión', 'ojos', 'mesa', 'gafas',
      'umbral', 'imagen', 'quieto', 'junto', 'abajo', 'hondo', 'kilo', 'yema', 'zona', 'vista', 'luz', 'nítido', 'ancho'],
    blurb: '¡JEFE SECRETO! Un visor rojo con patas que cree que nadie lo quiere.',
    keysHint: 'Profundidad: escribe siempre la capa de ADELANTE',
    intro: '* Al fondo de la cueva, algo rojo se enciende.\n* ¡VISORIO, el visor olvidado, te mira con sus dos lentes!',
    check: '* VISORIO - ATQ 7 DEF 6\n* Palabras en DOS capas: escribe la de ADELANTE (brillante).\n* Cada 10 segundos se intercambian. ¡Ojo con el parpadeo!',
    idle: [
      '* VISORIO: "Me dijeron fracaso. Me guardaron en un sótano."',
      '* Las dos capas tiemblan. Adelante, atrás. Atrás, adelante.',
      '* BIT: Escribe la capa de ADELANTE. La de atrás... te cansa la vista.',
      '* VISORIO: "¿Tú también te vas a ir? Todos se van."',
    ],
    calm: '* Visorio baja sus lentes. Ya no brillan tan fuerte.',
    taunts: ['¡Mira adelante!', '¡Profundidad!', '¡Todo es rojo!', '¿Me ves?'],
    acts: [
      { name: 'Descanso', text: 'tomas un descanso cada quince minutos', mercy: 50, reply: '* Cierras los ojos un ratito. Visorio también.\n* "...Mis juegos recomendaban eso. ¡Nadie me hacía caso!"' },
      { name: 'Rojo', text: 'le dices que el rojo es tu color favorito', mercy: 30, reply: '* "¿...En serio? ¿El ROJO?"\n* Sus lentes brillan un poquito más.' },
      { name: 'Abuelo', text: 'le cuentas que su creador también hizo la game boy', mercy: 50, reply: '* "...¿En serio? ¿El mismo que hizo la Game Boy?"\n* "...Entonces soy familia."' },
    ],
    bullets: { count: 13, interval: 900, speed: 46, pool: ['rojo', 'luz', 'capa', 'eco', 'foco', 'lente', 'ojo', 'visor', 'mesa', 'fondo', 'vista', 'negro'] },
    onWin(scene, { first, pages }) {
      const d = Save.data;
      for (let i = 0; i < pages.length; i++) pages[i] = pages[i].replace('RESCATASTE LA VIRTUAL BOY', 'RESCATASTE EL VIRTUAL BOY').replace('Lo encontrarás en la vitrina.', 'Vive en la Cueva Roja.');
      if (!first) return;
      pages.splice(1, 0, '* VISORIO: ...¿Me vas a llevar? ¿A la vitrina?\n* ¿Aunque me digan "fracaso"?', '* BIT: ¡Claro! Don Chip le va a hacer su propio estante.\n* "Fracaso famoso. Lo queremos igual."');
      d.flags.ecoRojo = true;
      Quests.complete('cueva_roja');
      pages.push('* (Al fondo de la cueva se prende una maquinita: ECO ROJO.)');
      Quests.start('eco_rojo');
    },
  },
});

// ---------- Zonas ----------
const VB_TILES = {
  K: { s: 'vb_cart', solid: true, look: 'cartucho' },
  L: { s: 'vb_label', solid: true, look: 'etiqueta' },
  O: { s: 'vb_hole' },
  f: { s: 'path', colors: { a: VB4.k0, b: VB4.k0, c: VB4.k1, d: VB4.k1 } },
  A: { s: 'vb_altar', solid: true, look: 'altar' },
};

const VB_BIT = [
  '* Todo es rojo... ¿o soy yo? No. Es todo.',
  '* Psst: si te mareas, cierra los ojos tres segundos.\n* ...Pero no mientras caminas.',
  '* ¿Ves que todo tiene un fantasmita detrás? Es la "profundidad".\n* El Virtual Boy dibujaba una imagen para cada ojo.',
  '* Aquí también hay pasto alto. Rojo. Obvio.',
];

// Un amigo de la cueva (ya perdonado): dice su línea y un dato real del Virtual Boy.
function vbFriend(id, x, y, lines) {
  return {
    id: `vbf-${id}`, sprite: ENEMIES[id].sprite, x, y, when: () => !!Save.data.spared[id],
    async talk(ctx) { await ctx.say([rand(lines)], upper(ENEMIES[id].name)); },
  };
}

addMaps('vb', {
  entry: { map: 'vb-claro', spawn: [1, 7, 'right'] },
  maps: {
    'vb-claro': {
      name: 'Claro del Cartucho Rojo',
      theme: 'vb',
      music: 'vb_cueva',
      tiles: VB_TILES,
      map: [
        'TTTTTTTTTTTTTTTTTTTT',
        'TTTTTTKKKKKKKKTTTTTT',
        'TTTTTTKLLLLLLKTTTTTT',
        'TTTTTTKLLLLLLKTTTTTT',
        'TTTTTTKKKKOKKKTTTTTT',
        'TTT.......:.......TT',
        'TT........:........T',
        '::::::::::::..S....T',
        'TT.....,,,,.:......T',
        'TTT..,,,,,,,:...S.TT',
        'TTTT.,,,,,,.:...TTTT',
        'TTTTT.......:..TTTTT',
        'TTTTTTT.....:.TTTTTT',
        'TTTTTTTTTTTTTTTTTTTT',
        'TTTTTTTTTTTTTTTTTTTT',
      ],
      spawns: { start: [1, 7, 'right'] },
      intro: [
        '* ...¡Whoa! Todo es ROJO. Y negro. Nada más.',
        '* ¿Y ese cartucho? ¡Es del tamaño de una casa!\n* La entrada está justo en medio. ¡Vamos!',
      ],
      signs: {
        '14,7': '* CARTUCHO ROJO GIGANTE\n* La etiqueta dice: "VIRTUAL BOY · 1995".\n* Abajo, en letras chiquitas: "Fracaso famoso".',
        '16,9': [
          '* Dato: el Virtual Boy funcionaba con 6 pilas AA.\n* (También tenía un adaptador para conectarlo a la luz.)',
          '* Dato: sus juegos tenían una opción de PAUSA AUTOMATICA\n* que te pedía descansar la vista cada rato.',
        ],
      },
      looks: {
        cartucho: '* Plástico rojo, frío y enorme.\n* Tiene ranuritas, como un cartucho de verdad.',
        etiqueta: '* La etiqueta del cartucho gigante.\n* Un visor rojo dibujado sobre fondo negro.',
      },
      exits: {
        '0,7': { map: 'pueblo', spawn: [18, 6, 'left'] },
        '10,4': { map: 'vb-cueva', spawn: [2, 2, 'down'] },
      },
      wild: ['vbrojito', 'vbdoble', 'vbtripode'],
      bitTips: VB_BIT,
    },

    'vb-cueva': {
      name: 'La Cueva Roja',
      theme: 'vb',
      music: 'vb_cueva',
      tiles: VB_TILES,
      map: [
        '##########################',
        '#O...#.......#...........#',
        '#....#.......#..fff......#',
        '#..S.#.......:..fff..S...#',
        '#....#.......#..fff......#',
        '#....#.......#...........#',
        '#....#.......#...........#',
        '#....:.......#...........#',
        '#....#.......#...........#',
        '#....#.......####:########',
        '#,,..#.......#......#....#',
        '#,,,.#..S....#.~~~..#.A..#',
        '#,,..#.......#.~~~..:....#',
        '#....#.......#......#....#',
        '##########################',
      ],
      ground: 'grass',
      spawns: { start: [2, 2, 'down'] },
      intro: [
        '* Adentro del cartucho hay una cueva entera.\n* Todo tiene un fantasmita rojo oscuro detrás. Como si viéramos doble.',
        '* Psst. El Anciano dijo: "escribe siempre lo que está ADELANTE".\n* No sé qué significa todavía. ¡Pero suena importante!',
      ],
      signs: {
        '3,3': '* LA CUEVA ROJA\n* Aquí todo es rojo y negro, como en el Virtual Boy (1995).\n* Tus ojos se acostumbran. Más o menos.',
        '21,3': '* Dato: para dibujar, una fila de luces rojas y un espejo que se movía\n* de un lado a otro rapidísimo. ¡Así parecía una pantalla completa!',
        '8,11': '* Dato: el Virtual Boy lo diseñó Gunpei Yokoi.\n* El mismo inventor de la Game Boy y de los Game & Watch.',
      },
      looks: {
        lago: '* Un lago de luz roja. No moja. Solo brilla.',
        altar: () => (Save.data.consoles.virtualboy
          ? '* El pedestal está vacío: el Virtual Boy ya está en tu vitrina,\n* en su propio estante.'
          : '* Un pedestal con forma de visor. Está vacío.\n* Alguien lo guarda celosamente...'),
      },
      encounters: [
        { enemy: 'vbrojito', x: 5, y: 7, say: ['* ¡Boing rojo! ¡Nadie pasa sin saludar!'] },
        { enemy: 'vbdoble', x: 13, y: 3, say: ['* ¡Alto! ¡Alto!', '* (Lo dice dos veces.)'] },
        { enemy: 'vbtripode', x: 17, y: 9, say: ['* ¡Uy, uy, uy! ¡Me caigo... encima de ti!'] },
        { enemy: 'visorio', x: 20, y: 12, say: ['* ...¿Viniste a verme? Nadie viene a verme.', '* Bueno. Si quieres verme... ¡MIRA BIEN!'] },
      ],
      chests: [
        { id: 'vb_lente', x: 8, y: 2, treasure: 'lente_rojo', word: 'profundidad' },
        { id: 'vb_control', x: 19, y: 7, treasure: 'control_doble', word: 'dos crucetas' },
      ],
      exits: { '1,1': { map: 'vb-claro', spawn: [10, 5, 'down'] } },
      wild: ['vbrojito', 'vbdoble', 'vbtripode'],
      bitTips: VB_BIT,
      npcs: [
        vbFriend('vbrojito', 3, 6, ['* ¡Boing rojo! Dile a Pixelito que lo extraño.', '* Dato: el Virtual Boy salió en 1995. ¡Igual que yo!']),
        vbFriend('vbdoble', 9, 5, ['* Ya veo uno solo. ...Casi siempre.', '* Dato: el Virtual Boy mostraba una imagen distinta a cada ojo.\n* Por eso parecía que las cosas tenían profundidad.']),
        vbFriend('vbtripode', 17, 5, ['* ¡Firme! Con mi papelito ya no me tambaleo.', '* Dato: el visor se apoyaba en la mesa con un soporte de patas.\n* ¡Ese era yo!']),
        {
          id: 'vbf-visorio', sprite: 'visorio', x: 23, y: 12, when: () => !!Save.data.spared.visorio,
          async talk(ctx) {
            await ctx.say([rand([
              '* Don Chip me hizo un estante. Dice "Fracaso famoso. Lo queremos igual."\n* ...Es lo más bonito que me han dicho.',
              '* Soy familia de la Game Boy. ¡FAMILIA! Se lo digo a todos.',
              '* Descansa la vista cada quince minutos. Lo digo por experiencia.',
            ])], 'VISORIO');
          },
        },
        {
          id: 'vb-ecorojo', sprite: 'arcade', x: 23, y: 10, when: () => !!Save.data.flags.ecoRojo,
          async talk(ctx) {
            const best = (Save.data.arcade || {}).ecorojo || 0;
            await ctx.say([`* Una maquinita roja: ECO ROJO.\n* Palabras en dos capas. Solo cuenta la de ADELANTE.\n* Récord: ${best}.`]);
            if (await ctx.choose(['jugar', 'ahora no']) === 0) Game.go('ecorojo', { back: 'town' });
          },
        },
      ],
    },
  },
});
