// MUNDO 5 — Cubo Galáctico (GameCube, 2001). Diseño en docs/LORE.md §8.
// El mundo del giro emocional: el Glitch invoca copias en sombra de los jefes anteriores y,
// en la Estación Visor, Bit descubre que salió del mismo cartucho sin nombre.
//
// Escenas propias (todas en js/scenes/):
//   gc3d.js     3D "plástico pulido" (encima de poly3d.js) + ganchos del combate normal
//   brotes.js   Capitán Brotes: órdenes de colores (y el minijuego Brotitos)
//   escaner.js  Casco Escáner: visor de combate / visor de escaneo
//   sombra.js   Las 4 Copias de Sombra: la mecánica del jefe original resumida a 30 s
//   guante.js   JEFE El Guante Crossover: porcentaje, SMASH, recuperarse y 3 vidas
//   correo.js   Correo de Bellota: cartas con mayúsculas y puntuación
// El pueblo (Barrio Cubo, Alcaldesa Bellota, la caja del sótano) está en js/worlds/gc-pueblo.js.

// Palabras del mundo (§16): frases completas, dos puntos y cambio de contexto.
WORDS.gc = WORDS.gc || ['El cubo tiene manija.', 'Salta Delfinito, salta.', 'rojo: apagar', 'azul: nadar', 'amarillo: saltar',
  'Querido vecino, ¿cómo estás?', 'Hoy llovió en la isla.', 'La fantasmita se escondió en el cuadro.', 'Gracias por tu carta.',
  'Nos vemos en la plaza a las cinco.'];

// Colores fijos extra para los sprites de este mundo (además de a/b/c/d del tema).
const GC_PAL = {
  w: '#FFFFFF', g: '#3BB54A', o: '#F28C28', y: '#F5D547', r: '#E04B4B', s: '#7EC8FF', k: '#8B5E3C',
  i: '#4B3F9E', l: '#8E86D9', n: '#17162B', p: '#C8CBD6', u: '#2B9EDB', e: '#F2C6A0',
};
const gcArt = (rows) => Object.assign(rows, { pal: GC_PAL });

// Base de los enemigos normales: frases con MAYUSCULAS (SHIFT), acentos que cuentan y escenario 3D.
const GC_BASE = {
  theme: 'gc', music: 'gc_battle', caps: true, strictAccents: true, gc: true,
  onEnter: (s, pages) => gcBattleEnter(s, pages),
  onExit: (s) => gcBattleExit(s),
  onWin: (s, info) => gcBattleWin(s, info),
};

// ---------- Tecloide nuevo: Delfinito (GOTA), guiño al nombre clave "Dolphin" ----------
addTecloide('delfinito', {
  name: 'Delfinito', type: 'gota', sprite: 'delfinito', hp: 56,
  desc: 'Un delfín juguetón. Su nombre secreto es Dolphin. No se lo digas a nadie.',
  moves: [move('Salpicón', 'salpica', 30, 'gota'), TECLEO, move('Aro de Agua', 'aro de agua', 42, 'gota'), move('Ola Dolphin', 'ola gigante', 52, 'gota', 'aturdir')],
});

// ---------- Las 4 Copias de Sombra (§8.4) ----------
// Se dibujan con el sprite del jefe original, pero en magenta "de estática".
const GC_SHADOW_PAL = { a: '#FFC2FF', b: '#FF66FF', c: '#B000B0', d: '#2A0030' };
function gcShadowSprite(orig) {
  const src = SPRITES[orig] || SPRITES.guante_gc;
  if (!src) return null;
  const rows = src.map((r) => r);
  const pal = { ...GC_SHADOW_PAL };
  Object.keys(src.pal || {}).forEach((k) => { if (!pal[k]) pal[k] = '#FF00FF'; });
  return Object.assign(rows, { pal });
}

const GC_SHADOW = (id, o) => ({
  name: o.name, sprite: `gc_sombra_${o.kind}`, mode: 'sombra', xp: 26, kind: o.kind, orig: o.orig,
  blurb: o.blurb, keysHint: o.keysHint, sad: o.sad, origTrack: o.origTrack, words: o.words,
});

addWorld({
  id: 'gc',
  order: 5,
  name: 'Cubo Galáctico',
  theme: 'gc',                // css/worlds/gc.css
  music: 'gc_map',
  requires: 'n64',
  console: 'gamecube',
  // Isla Celeste → Jardín Brotitos → Pueblo de Bellota → Estación Visor → Arena Final.
  // Entre zona y zona aparece una Copia de Sombra.
  nodes: ['cubito', 'disquin', 'brotitos', 'capbrotes', 'sombra_tetro', 'delfinito', 'correo', 'sombra_cap',
    'fantasmita', 'sombracel', 'sombra_nebula', 'casco', 'sombra_marco', 'guante'],
  enemies: {
    // ===== Isla Celeste =====
    cubito: {
      ...GC_BASE,
      name: 'Cubito', sprite: 'cubito', model: 'cubito',
      hp: 100, atk: 6, def: 4, xp: 42,
      fightWords: 2, fightTime: 1.1,
      words: ['El cubo tiene manija.', 'Llévame a casa.', 'Soy índigo, no morado.', 'Tengo cuatro puertos.', 'Mi tapa se abre.',
        'Juguemos con amigos.', 'Mi disco es chiquito.', 'Cárgame, por favor.', 'Soy un cubo feliz.', 'Hola, Isla Celeste.'],
      blurb: 'ISLA CELESTE. Un cubo índigo con manija. Quiere que lo cargues a casa de un amigo.',
      keysHint: 'Frases completas: El cubo tiene manija.',
      intro: '* ¡Un Cubito rueda hacia ti!\n* Te ofrece su manija. "¿Me cargas?"',
      check: '* CUBITO - ATQ 6 DEF 4\n* Un cubo con manija. Técnicamente es portátil. Técnicamente.',
      idle: ['* Cubito abre y cierra su tapita. Clic, clic.', '* Cubito presume sus cuatro puertos.', '* "Tengo manija. Soy portátil. Técnicamente."', '* Huele a plástico nuevo.'],
      calm: '* Cubito se queda quieto, esperando que lo cargues.',
      taunts: ['¡Cárgame!', '¡Soy índigo!', '¡Clic, clic!'],
      acts: [
        { name: 'Cargar', text: 'lo cargas de la manija con cuidado', mercy: 50, reply: '* "¡Vamos a la casa de un amigo!"' },
        { name: 'Cubo', text: 'le dices que es el cubo más bonito', mercy: 40, reply: '* "Soy índigo, no morado. ÍNDIGO."' },
        { name: 'Abrir', text: 'abres la tapita de arriba', mercy: 45, reply: '* "¡Mi disco está aquí!"' },
      ],
      bullets: { count: 10, interval: 1250, speed: 36, pool: ['Cubo', 'Manija.', 'Tapa', 'Índigo', 'Disco.', 'Clic', 'Cuatro', 'Hola.', 'Plástico', 'Casa.'] },
      drop: 'manija',
      townLine: '* ¡Clic! Mi casa tiene manija en la puerta.\n* Cuando quiera, me la llevo a casa de un amigo.',
      townFacts: ['* Dato: la GameCube tenía 4 puertos para controles al frente.\n* ¡Cuatro amigos, como en la N64!'],
    },
    disquin: {
      ...GC_BASE,
      name: 'Disquín', sprite: 'disquin', model: 'disquin', fx: 'circle',
      hp: 95, atk: 5, def: 3, xp: 40,
      fightWords: 3,
      words: ['disco', 'gira', 'vuelta', 'centro', 'mareo', 'órbita', 'rueda', 'espiral', 'redondo', 'círculo', 'Ocho', 'Giro', 'Mini'],
      blurb: 'ISLA CELESTE. Un disco de 8 cm que gira y gira... y se marea. Sus letras salen en círculo.',
      keysHint: 'Letras en círculo: se escriben en orden',
      intro: '* ¡Disquín llega girando!\n* "¡No puedo parar! ¡El mundo gira! ¿O soy yo?"',
      check: '* DISQUIN - ATQ 5 DEF 3\n* Un disco de 8 cm. Sus letras giran: empieza por la de ARRIBA y sigue como reloj.',
      idle: ['* Disquín gira tan rápido que hace viento.', '* "Soy chiquito y guardo mil cuatrocientos megas. Más o menos."', '* Disquín se tambalea. Se marea.', '* BIT: ¿Sabías que el nombre secreto de esta consola era "Dolphin"?'],
      calm: '* Disquín gira despacito, sonriendo.',
      taunts: ['¡Giro, giro!', '¡Ocho centímetros!', '¡Me mareo!'],
      acts: [
        { name: 'Parar', text: 'lo detienes con un dedo suave', mercy: 50, reply: '* "Uff. El mundo seguía girando."' },
        { name: 'Limpiar', text: 'lo limpias del centro hacia afuera', mercy: 45, reply: '* "¡Así es como se hace!"' },
        { name: 'Chico', text: 'le dices que ser chico es práctico', mercy: 40, reply: '* "¡Ocho centímetros de pura potencia!"' },
      ],
      bullets: { count: 11, interval: 1200, speed: 36, pool: ['Gira', 'Disco', 'Ocho', 'Mini', 'Vuelta', 'Centro', 'Rueda', 'Mareo'] },
      drop: 'disco_mini',
      townLine: '* ¡Llegué girando! Ya casi no me mareo.\n* Bueno, solo si me ves fijamente.',
      townFacts: ['* Dato: los discos de GameCube medían 8 cm y guardaban cerca de 1.5 GB.\n* ¡Chiquitos pero llenos de aventura!'],
    },

    // ===== Jardín Brotitos =====
    brotitos: {
      ...GC_BASE,
      name: 'Brotitos', sprite: 'brotitos', model: 'brotitos',
      hp: 90, atk: 4, def: 2, xp: 34,
      fightWords: 3,
      words: ['rojo: cava', 'azul: nada', 'amarillo: salta', 'rojo: empuja', 'azul: busca', 'amarillo: sube', 'rojo: carga',
        'azul: trae', 'amarillo: brinca', 'rojo: corre', 'azul: bucea', 'amarillo: vuela'],
      blurb: 'JARDIN BROTITOS. Tres criaturitas-planta de colores que siguen órdenes. ¡Dile a cuál le hablas!',
      keysHint: 'Cambio de contexto con dos puntos: rojo: cava',
      intro: '* ¡Tres Brotitos salen de la tierra!\n* ROJO, AZUL y AMARILLO te miran. Esperan órdenes.',
      check: '* BROTITOS - ATQ 4 DEF 2\n* Vienen de 3 en 3. Cada orden empieza con el color: "rojo: cava".',
      idle: ['* Los Brotitos se forman en fila. Luego en otra fila.', '* El Brotito amarillo tiene una florecita.', '* "¡Esperamos órdenes, capitán!"'],
      calm: '* Los tres Brotitos se sientan juntos, muy tranquilos.',
      taunts: ['¡A la carga!', '¡Rojo, azul, amarillo!', '¡Sí, capitán!'],
      acts: [
        { name: 'Silbar', text: 'silbas para que vengan los tres', mercy: 50, reply: '* "¡Sí, capitán!"' },
        { name: 'Plantar', text: 'los plantas un rato al sol', mercy: 45, reply: '* "Crecen las hojitas."' },
        { name: 'Contar', text: 'cuentas uno, dos, tres', mercy: 40, reply: '* "¡Estamos todos!"' },
      ],
      bullets: { count: 11, interval: 1200, speed: 35, pool: ['rojo:', 'azul:', 'cava', 'nada', 'sube', 'salta', 'trae', 'busca', 'amarillo:'] },
      townLine: '* ¡Rojo, azul y amarillo reportándose!\n* Plantamos flores en todo el barrio.',
      townFacts: ['* Dato: Pikmin (2001) lo creó Shigeru Miyamoto.\n* Dicen que se le ocurrió mirando su jardín.'],
    },
    capbrotes: {
      name: 'Capitán Brotes', sprite: 'capbrotes', mode: 'brotes', friend: true, xp: 60, hp: 150,
      blurb: '¡MINIJEFE! JARDIN BROTITOS. Un explorador diminuto que cree que eres un gigante. Da órdenes a tus Brotitos con el color correcto.',
      keysHint: 'Órdenes con dos puntos y cambio de contexto',
      townLine: '* ¡Gigante! ...Digo, vecino.\n* Mi nave ya está reparada, pero me gusta este barrio.',
      townFacts: ['* Dato: en Pikmin, el Capitán Olimar tenía solo 30 días para reparar su nave.\n* ¡Yo tengo todo el tiempo del mundo!'],
      // Pikmin real: los rojos aguantan el fuego, los azules nadan y a los amarillos se les lanza alto.
      squads: [
        { id: 'rojo', label: 'ROJO', color: '#E04B4B', task: 'FUEGO', icon: '🔥', verbs: ['apagar', 'cruzar', 'pisar', 'soplar'], verbs2: ['apagar fuego', 'cruzar llamas', 'pisar brasas', 'soplar humo'] },
        { id: 'azul', label: 'AZUL', color: '#2B9EDB', task: 'AGUA', icon: '💧', verbs: ['nadar', 'bucear', 'flotar', 'remar'], verbs2: ['nadar rápido', 'bucear hondo', 'flotar quieto', 'remar fuerte'] },
        { id: 'amarillo', label: 'AMARILLO', color: '#F5D547', task: 'ALTURA', icon: '⛰', verbs: ['saltar', 'subir', 'trepar', 'volar'], verbs2: ['saltar alto', 'subir muro', 'trepar roca', 'volar lejos'] },
      ],
      // Turbo del minijuego: un 4º color (§8.6). Los morados son pesados y fuertes.
      squadTurbo: { id: 'morado', label: 'MORADO', color: '#8E44AD', task: 'PESO', icon: '🪨', verbs: ['cargar', 'empujar', 'aplastar', 'mover'], verbs2: ['cargar piedra', 'empujar caja', 'aplastar lata', 'mover tronco'] },
      peace: [
        { name: 'Silbato', text: 'silbas la nota de reunión' },
        { name: 'Gigante', text: 'no soy gigante, solo normal' },
        { name: 'Nave', text: 'le ayudas a juntar piezas de su nave' },
      ],
    },
    sombra_tetro: GC_SHADOW('sombra_tetro', {
      name: 'Copia de Tetro Rey', kind: 'tetro', orig: 'tetrorey', origTrack: 'gb_tetrorey',
      blurb: 'COPIA DE SOMBRA. Tetro Rey, pero de estática magenta. Bloques con palabras caen... ¡30 segundos!',
      keysHint: 'Bloques que caen: escríbelos antes de que toquen el piso',
      sad: 'Todo encaja... menos yo.',
      words: ['Bloque', 'Línea', 'Encaja', 'Gira', 'Torre', 'Pieza', 'Caer', 'Rey', 'Fila', 'Cuadro', 'Ordena', 'Baja'],
    }),

    // ===== Pueblo de Bellota =====
    delfinito: {
      ...GC_BASE,
      name: 'Delfinito Salvaje', sprite: 'delfinito', model: 'delfin', gift: 'delfinito',
      hp: 110, atk: 6, def: 3, xp: 45,
      fightWords: 2, fightTime: 1.1,
      words: ['Salta Delfinito, salta.', 'Gira, Delfinito, gira.', 'Bit y Delfinito juegan.', 'Mira el Mar Celeste.', 'Nadamos con Bit.',
        'Hola, Pueblo de Bellota.', 'Delfinito ama el Agua.', 'Un aro para Delfinito.', 'Ve al Muelle, Delfinito.'],
      blurb: 'PUEBLO DE BELLOTA. Un delfín juguetón (guiño a "Dolphin"). Si lo perdonas... quizá quiera ser tu Tecloide.',
      keysHint: 'Frases con dos mayúsculas: Salta Delfinito, salta.',
      intro: '* ¡Delfinito Salvaje salta del agua!\n* ¡Iiiik! Te salpica toda la cara.',
      check: '* DELFINITO SALVAJE - ATQ 6 DEF 3\n* Un Tecloide de tipo GOTA... salvaje. Sus frases llevan DOS mayúsculas.',
      idle: ['* Delfinito hace un clavado perfecto.', '* "¡Iiiik! ¡Iiiik!"', '* BIT: Por eso hay tantos delfines aquí: ¡a esta consola le decían Dolphin!'],
      calm: '* Delfinito flota panza arriba, feliz.',
      taunts: ['¡Iiiik!', '¡Splash!', '¡Atrápame!'],
      acts: [
        { name: 'Nadar', text: 'nadas a su lado', mercy: 45, reply: '* "¡Iiiik!"' },
        { name: 'Aro', text: 'lanzas un aro al agua', mercy: 50, reply: '* "¡Lo atrapo! ¡Otra vez!"' },
        { name: 'Nombre', text: 'le preguntas por su nombre secreto', mercy: 40, reply: '* "Shh. Es Dolphin. No lo digas."' },
      ],
      bullets: { count: 11, interval: 1200, speed: 37, pool: ['Iiik', 'Splash', 'Aro', 'Ola', 'Mar.', 'Salta', 'Agua', 'Dolphin'] },
      townLine: '* ¡Iiiik! El barrio tiene fuente. ¡Hago clavados todo el día!',
      townFacts: ['* Dato: "Dolphin" era el nombre clave de la GameCube.\n* Su procesador se llamaba Gekko y su chip de gráficos, Flipper. ¡Puro mar!'],
    },
    correo: {
      name: 'Correo de Bellota', sprite: 'bellota', mode: 'correo', xp: 30,
      blurb: 'PUEBLO DE BELLOTA. La Alcaldesa Bellota necesita cartero. Escribe 3 cartas a los vecinos (con mayúsculas y puntuación).',
      keysHint: 'Cartas: frases largas con comas, puntos y signos',
    },
    sombra_cap: GC_SHADOW('sombra_cap', {
      name: 'Copia de Lord Caparazón', kind: 'caparazon', orig: 'caparazon', origTrack: 'caparazon1',
      blurb: 'COPIA DE SOMBRA. Lord Caparazón en estática. Cada palabra hay que terminarla antes del siguiente golpe del metrónomo.',
      keysHint: 'Al ritmo: una palabra por golpe',
      sad: 'Mi castillo es otro castillo.',
      words: ['Castillo', 'Puente', 'Hacha', 'Lava', 'Fuego', 'Torre', 'Corona', 'Salto', 'Bandera', 'Tubo', 'Hongo', 'Rey'],
    }),

    // ===== Estación Visor =====
    fantasmita: {
      ...GC_BASE,
      name: 'Fantasmita Aspirada', sprite: 'fantasmita', model: 'fantasmita', fx: 'ghost',
      hp: 90, atk: 5, def: 4, xp: 40,
      fightWords: 3,
      words: ['fantasma', 'cuadro', 'escondida', 'linterna', 'aspiradora', 'mansión', 'susto', 'pasillo', 'sábana', 'retrato', 'Buh', 'Luigi'],
      blurb: 'ESTACION VISOR. Una fantasmita traviesa que se esconde en los cuadros. Sus palabras solo se ven cuando escribes la primera letra.',
      keysHint: 'Palabras escondidas: adivina la primera letra',
      intro: '* ¡Un cuadro se mueve...!\n* ¡Fantasmita Aspirada sale de la pintura! "¡Buh!"',
      check: '* FANTASMITA ASPIRADA - ATQ 5 DEF 4\n* Esconde las palabras. Solo se ve la primera letra: escríbela y aparece lo demás.',
      idle: ['* Fantasmita se mete a un cuadro. Luego a otro.', '* Se oye una aspiradora a lo lejos. Fantasmita tiembla.', '* "¡Buh! ...¿No te asustaste? Qué mal."'],
      calm: '* Fantasmita juega a las escondidas. Siempre en el mismo cuadro.',
      taunts: ['¡Buh!', '¡Adivina dónde estoy!', '¡Jijiji!'],
      acts: [
        { name: 'Aspirar', text: 'la aspiras... no, mejor la saludas', mercy: 45, reply: '* "¡Buh! Digo, hola."' },
        { name: 'Cuadro', text: 'miras el cuadro donde se esconde', mercy: 50, reply: '* "Me encontraste. Juguemos otra."' },
        { name: 'Linterna', text: 'prendes la linterna un segundo', mercy: 35, reply: '* "¡Ay, mis ojitos!"' },
      ],
      bullets: { count: 12, interval: 1150, speed: 37, pool: ['Buh', 'Susto', 'Cuadro', 'Sábana', 'Jiji', 'Uuuh', 'Luz', 'Eco'] },
      townLine: '* ¡Buh! ...Jiji. Mi casa tiene muchos cuadros.\n* Ven a jugar a las escondidas.',
      townFacts: ['* Dato: Luigi\'s Mansion fue uno de los primeros juegos de la GameCube, en 2001.\n* ¡Luigi atrapaba fantasmas con una aspiradora!'],
    },
    sombracel: {
      ...GC_BASE,
      name: 'Sombra de Cel', sprite: 'sombracel', model: 'sombracel', fx: 'neg',
      hp: 105, atk: 6, def: 5, xp: 44,
      fightWords: 2, fightTime: 1.1,
      words: ['Mi contorno es grueso.', 'El viento sopla.', 'Soy de caricatura.', 'La pared es mía.', 'Tinta negra, borde fino.',
        'El barco cruza el mar.', 'Dibújame con cuidado.', 'Sin luz no hay sombra.', 'Batuta, viento y mar.'],
      blurb: 'ESTACION VISOR. Una sombra con contorno negro grueso que se pega a las paredes. Sus frases salen en negativo.',
      keysHint: 'Frases en negativo (blanco sobre negro)',
      intro: '* ¡Una sombra se despega de la pared!\n* Tiene un contorno grueso, como de caricatura.',
      check: '* SOMBRA DE CEL - ATQ 6 DEF 5\n* Dibujada con cel-shading. Sus palabras salen en negativo.',
      idle: ['* Sombra de Cel se pega a la pared. Ya no se ve.', '* El contorno de Sombra de Cel se pone más grueso.', '* Sopla un viento con ritmo de tres por cuatro.'],
      calm: '* Sombra de Cel posa con su mejor contorno.',
      taunts: ['¡Más grueso!', '¡Pegada a la pared!', '¡Soy caricatura!'],
      acts: [
        { name: 'Luz', text: 'le das luz de frente', mercy: 45, reply: '* "Mi contorno se ve genial."' },
        { name: 'Dibujar', text: 'delineas su borde con cuidado', mercy: 50, reply: '* "¡Más grueso! ¡Más!"' },
        { name: 'Viento', text: 'la despegas de la pared con un soplo', mercy: 40, reply: '* "¡Libre!"' },
      ],
      bullets: { count: 12, interval: 1150, speed: 38, pool: ['Tinta', 'Borde', 'Sombra', 'Viento', 'Mar.', 'Barco', 'Pared', 'Trazo'] },
      townLine: '* Aquí hay mucha luz. Mi contorno nunca se vio tan bien.',
      townFacts: ['* Dato: The Legend of Zelda: The Wind Waker (2002) usaba cel-shading.\n* ¡Parecía una caricatura que se movía!'],
    },
    sombra_nebula: GC_SHADOW('sombra_nebula', {
      name: 'Copia de Reina Nébula', kind: 'nebula', orig: 'nebula', origTrack: 'snes_nebula',
      blurb: 'COPIA DE SOMBRA. Reina Nébula en estática. Sus medusitas suben flotando: escríbelas antes de que lleguen arriba.',
      keysHint: 'Medusitas que suben (acentos)',
      sad: 'Mis hijas no me reconocen.',
      words: ['Medusa', 'Océano', 'Órbita', 'Galaxia', 'Nébula', 'Reina', 'Burbuja', 'Hondo', 'Estrella', 'Lago', 'Ola', 'Brillo'],
    }),
    casco: {
      name: 'Casco Escáner', sprite: 'casco', mode: 'escaner', friend: true, model: 'casco',
      theme: 'gc', music: 'gc_escaner', caps: true, strictAccents: true, gc: true,
      onEnter: (s, pages) => gcBattleEnter(s, pages),
      onExit: (s) => gcBattleExit(s),
      hp: 140, atk: 5, def: 6, xp: 65,
      fightWords: 3,
      words: ['Visor', 'escaneo', 'casco', 'energía', 'Samus', 'datos', 'misil', 'sensor', 'Prime', 'archivo', 'radar', 'señal'],
      blurb: '¡MINIJEFE! ESTACION VISOR. Un casco-visor que te escanea. Usa su propio visor: escanea sus secretos para debilitarlo.',
      keysHint: 'Líneas de datos con mayúsculas y puntos',
      intro: '* ¡CASCO ESCANER baja del techo!\n* "Escaneo iniciado. Sujeto: rápido. Nervioso. Sin nombre."',
      check: '* CASCO ESCANER - ATQ 6 DEF ?\n* Cambia de visor cada turno. En el VISOR DE ESCANEO puedes leer sus secretos.',
      idle: ['* Casco Escáner hace "bip". Luego "bup".', '* "Toda la información es... información."', '* Un anillo de luz te recorre de pies a cabeza.'],
      calm: '* Casco Escáner apaga su luz roja. Ahora es verde.',
      taunts: ['¡Escaneando!', '¡Bip, bup!', '¡Datos, datos!'],
      // Los ACTUAR se desbloquean escaneando (§8.4 B).
      acts: [],
      scans: [
        { name: 'Visera', line: 'Su visera se nubla con el vapor.', act: { name: 'Vapor', text: 'soplas vapor tibio en su visera', mercy: 50, reply: '* "¡No veo nada! ...Qué relajante."' } },
        { name: 'Antena', line: 'Escanear sin parar le da hipo.', act: { name: 'Hipo', text: 'le das un susto para quitarle el hipo', mercy: 50, reply: '* "¡Hip! ...¿Ya se fue? ¡Ya se fue!"' } },
        { name: 'Archivo', line: 'Nadie le pregunta cómo está.', act: { name: 'Preguntar', text: 'le preguntas cómo está hoy', mercy: 50, reply: '* "...Bien. Nadie me lo había preguntado."' } },
        { name: 'Memoria', line: 'Guarda una foto de su primer escaneo.', act: { name: 'Foto', text: 'le pides que te enseñe su foto', mercy: 50, reply: '* "¡Era un helecho! Lo escaneé 400 veces."' } },
      ],
      bullets: { count: 8, interval: 2200, speed: 34, pool: ['Bip', 'Bup', 'Datos', 'Visor', 'Radar', 'Misil', 'Señal', 'Escaneo'] },
      townLine: '* Escaneo del barrio: 100% amigable.\n* ...Ya no escaneo a nadie sin permiso.',
      townFacts: ['* Dato: Metroid Prime (2002) llevó a Samus al 3D en primera persona.\n* ¡Veías todo desde dentro de su casco, hasta las gotas en la visera!'],
    },
    sombra_marco: GC_SHADOW('sombra_marco', {
      name: 'Copia de Marco', kind: 'marco', orig: 'marco', origTrack: 'n64marco',
      blurb: 'COPIA DE SOMBRA. Marco en estática. Sus cuadros giran: léelos aunque estén chuecos.',
      keysHint: 'Palabras dentro de un marco que gira',
      sad: 'Un cuadro sin nadie que lo mire.',
      words: ['Cuadro', 'Pincel', 'Óleo', 'Galería', 'Marco', 'Estrella', 'Castillo', 'Pintura', 'Dorado', 'Arte', 'Museo', 'Lienzo'],
    }),

    // ===== Arena Final =====
    guante: {
      name: 'El Guante Crossover', sprite: 'guante_gc', boss: true, friend: true, console: 'gamecube',
      mode: 'guante', theme: 'gc', music: 'gc_guante', caps: true, strictAccents: true,
      hp: 100, atk: 7, def: 4, xp: 100,
      fightWords: 3,
      words: ['Arena', 'Guante', 'Smash', 'figurita', 'plataforma', 'torneo', 'Melee', 'trofeo', 'borde', 'combo', 'todos', 'escudo', 'campeón', 'salto'],
      smash: [
        // Frases de ~35 letras: con 50 un niño de ~30 PPM casi nunca la saca sin errores.
        '¡Todos contra todos, hoy gano yo!',
        'Las figuritas son amigos, Guante.',
        'Salto, golpe y escudo: ¡así se juega!',
        'Bit, aguanta un poco más, ya llego.',
        '¿Listo para volar? ¡Golpe Smash!',
        'Cuatro jugadores y mucha amistad.',
      ],
      blurb: '¡JEFE! ARENA FINAL. Un guante gigante que coleccionó copias de todos los jefes como figuritas. ¡Súbele el porcentaje y mándalo a volar!',
      keysHint: 'De todo: frases largas PERFECTAS, mayúsculas y puntuación',
      intro: '* ¡EL GUANTE CROSSOVER baja de las estrellas!\n* "¡Bienvenido a la Arena! Todos contra todos. Yo contra todos."',
      check: '* EL GUANTE CROSSOVER - ATQ 7 DEF 4\n* No tiene HP: tiene PORCENTAJE. Al 100% puedes darle un SMASH. Tres caídas y se acabó.',
      idle: ['* El Guante chasquea los dedos. Hace eco en todo el espacio.', '* "Esta consola vendió más de mi juego que de ninguno. Lo digo con humildad."', '* El Guante acomoda sus figuritas en fila.', '* Las figuritas tiemblan un poquito. Están hechas de estática.'],
      calm: '* El Guante abre la mano. Ya no es un puño.',
      taunts: ['¡Todos contra todos!', '¡A volar!', '¡Figurita va!', '¡Pon tu escudo!'],
      acts: [
        { name: 'Chocar', text: 'chocas la mano con el guante', mercy: 45, reply: '* "...Nadie me había chocado."' },
        { name: 'Figuras', text: 'las figuritas no son juguetes', mercy: 40, reply: '* "...Son amigos. Ya lo sé."' },
        { name: 'Suelta', text: 'le pides que suelte a Bit', mercy: 50, reply: '* El Guante abre los dedos. Bit sale volando hacia ti.\n* BIT: ¡¡AAAH!! ...¡Gracias!', phase3: true },
      ],
      bullets: { count: 6, interval: 1900, speed: 40, pool: ['Golpe', 'Puño', 'Smash', 'Zas', 'Pum', 'Arena', 'Borde', 'Vuela', 'Escudo'] },
      townLine: '* ¡Choca esos cinco! ...Bueno, yo pongo los cinco.\n* Ya no colecciono jefes. Ahora colecciono amigos.',
      townFacts: ['* Dato: Super Smash Bros. Melee fue el juego más vendido de la GameCube.\n* ¡Más de 7 millones de copias!', '* Dato: en Smash Bros., el jefe final es una mano gigante con guante: Master Hand.\n* Primo lejano. Muy lejano.'],
    },
  },

  treasures: {
    caja_prototipo: { name: 'Caja del prototipo', desc: 'Caja de cartón, sin dibujo, sin nombre. Pesa mucho para lo que es.' },
    buzon_rojo: { name: 'Buzón rojo', desc: 'Regalo de la Alcaldesa Bellota. Llegan cartas de vecinos que todavía no conoces.' },
    figurita_dorada: { name: 'Figurita dorada', desc: 'Un guante dorado chiquito. Lo dejaron las cuatro sombras al despedirse.' },
    silbato_brotes: { name: 'Silbato de brotes', desc: 'Suena "¡fiiu!" y aparecen tres hojitas. Regalo del Capitán Brotes.' },
    disco_mini: { name: 'Disco mini', sprite: 'disquin', desc: 'Ocho centímetros de aventura.' },
    manija: { name: 'Manija', desc: 'La manija de la consola. Para llevarla a casa de un amigo.' },
  },

  quests: {
    mundo_gc: {
      name: 'El Cubo Galáctico',
      desc: 'Una tubería índigo lleva a una isla-cubo que flota en el espacio. El Glitch invocó copias de los jefes anteriores. Rescata la GameCube.',
    },
    diez_cartas: {
      name: 'Diez cartas',
      desc: 'Escribe una carta a cada uno de los 10 vecinos de la Alcaldesa Bellota y recibe 5 respuestas felices (precisión de 97% o más).',
      progress: () => {
        const c = GCS().cartas;
        return `${Object.keys(c).length}/10 cartas · ${Object.values(c).filter((a) => a >= 97).length}/5 felices`;
      },
    },
    caja_sotano: {
      name: 'La caja del sótano',
      desc: 'Don Chip encontró una caja vieja en el sótano del museo. Ayúdale a leerla: está junto a él, en el pueblo.',
    },
    cuatro_sombras: {
      name: 'Las cuatro sombras',
      desc: 'Abraza a las 4 Copias de Sombra en vez de vencerlas. Cada una guarda una frase para el final.',
      progress: () => `${Object.values(GCS().sombras).filter((s) => s === 'abrazo').length}/4`,
    },
    dia_30: {
      name: 'El día 30',
      desc: 'Juega BROTITOS (desde la parada del Capitán Brotes) en modo Normal y logra 40 órdenes correctas.',
      progress: () => `Récord: ${(Save.data.arcade || {}).brotitos || 0}/40`,
    },
  },

  sprites: {
    cubito: gcArt([
      '................',
      '.....nnnnnn.....',
      '....n......n....',
      '..nnnnnnnnnnnn..',
      '..niiiiiiiiiwn..',
      '..nillllllllin..',
      '..nianiiiianin..',
      '..nianiiiianin..',
      '..niiiiiiiiiin..',
      '..niiiinniiiin..',
      '..niiiiiiiiiin..',
      '..nininiininin..',
      '..niiiiiiiiiin..',
      '..nnnnnnnnnnnn..',
      '...nn......nn...',
      '................',
    ]),
    disquin: gcArt([
      '................',
      '.....nnnnnn.....',
      '...nnppppppnn...',
      '..nppppppppwpn..',
      '.npsspppppppspn.',
      '.nspanpppppanpn.',
      '.nppanpnnpanppn.',
      '.npppppnnpppppn.',
      '.nppspppppppspn.',
      '.npppnppppnpppn.',
      '..npsppnnppspn..',
      '..nppppppppppn..',
      '...nnppppppnn...',
      '.....nnnnnn.....',
      '................',
      '................',
    ]),
    delfinito: gcArt([
      '................',
      '................',
      '........nn......',
      '.......nuun.....',
      '....nnnuuunnn...',
      '...nuuuuuuuuwnn.',
      'n.nuuuuuuuuuanun',
      'nnuuuuuuuuuuuuun',
      'nuussssssssuuun.',
      'n.nsssssssssnn..',
      '...nnsssssnn....',
      '.....nnnnn......',
      '................',
      '..u...u...u.....',
      '.uuuu.uuuu.uuuu.',
      '................',
    ]),
    fantasmita: gcArt([
      '................',
      '.....nnnnnn.....',
      '....naaaaaan....',
      '...naaaaaawan...',
      '..naaaaaaaaaan..',
      '..naannaannaan..',
      '..naannaannaan..',
      '..naaaaaaaaaan..',
      '..naaaallaaaan..',
      '..naaaaaaaaaan..',
      '..naaaaaaaaaan..',
      '..naaaaaaaaaan..',
      '..nanaanaanaan..',
      '..n.nn.nn.nn.n..',
      '................',
      '................',
    ]),
    sombracel: gcArt([
      '................',
      '......nnnn......',
      '.....nccccn.....',
      '....nccccccn....',
      '....ncyccycn....',
      '....nccccccn....',
      '.....nccccn.....',
      '...nnnccccnnn...',
      '..nccccccccccn..',
      '.nccnccccccnccn.',
      '.nn.nccccccn.nn.',
      '....nccccccn....',
      '....nccnnccn....',
      '....ncn..ncn....',
      '...nnnn..nnnn...',
      '................',
    ]),
    brotitos: gcArt([
      '................',
      '.gg...gg...www..',
      '..g....g....g...',
      '..g....g....g...',
      '.nnnn.nnnn.nnnn.',
      'nrrrrnuuuunyyyyn',
      'nanannanannanann',
      'nrrrrnuuuunyyyyn',
      'nrnnrnunnunynnyn',
      'nrrrrnuuuunyyyyn',
      'nnnnnnnnnnnnnnnn',
      '.nn..nn...nn..n.',
      '................',
      '................',
      '................',
      '................',
    ]),
    capbrotes: gcArt([
      '.......y........',
      '.......n........',
      '.......n........',
      '.....nnnnnn.....',
      '....nsswsssn....',
      '...nseeeeeesn...',
      '...nsenrrnesn...',
      '...nseeeeeesn...',
      '....nnnnnnnn....',
      '...noooooooon...',
      '..nnoooooooonn..',
      '...nooyooyoon...',
      '...noooooooon...',
      '....nnn..nnn....',
      '....nkn..nkn....',
      '....nnn..nnn....',
    ]),
    casco: gcArt([
      '................',
      '.....nnnnnn.....',
      '...nnoooooonn...',
      '..noooowooooon..',
      '.noooooooooooon.',
      '.noonnnnnnnnoon.',
      '.nongggggggwnon.',
      '.nonggnggnggnon.',
      '.nongggggggggon.',
      '.noonnnnnnnnoon.',
      '.noooooooooooon.',
      'pnoorooooooroonp',
      '.noooooooooooon.',
      '..noooooooooon..',
      '...nnnnnnnnnn...',
      '................',
    ]),
    guante_gc: gcArt([
      '................',
      '...nn.nn.nn.nn..',
      '..nawnawnawnawn.',
      '..naanaanaanaan.',
      '..naanaanaanaan.',
      '..naaaaaaaaaaan.',
      '.nnnaaaaaaaaaan.',
      'naaanaaaaaaaaan.',
      '.nnaaaaaaaaaaan.',
      '...naaaaaaaaan..',
      '...nnnnnnnnnnn..',
      '...niiiiiiiiin..',
      '...nyyyyyyyyyn..',
      '...niiiiiiiiin..',
      '...nnnnnnnnnnn..',
      '................',
    ]),
    bellota: gcArt([
      '................',
      '....n....n..nn..',
      '...nkn..nkn.nkkn',
      '...nkkkkkkn.nkkn',
      '..nkkeeeekkn.nkn',
      '..nkenkknekn.nkn',
      '..nkeeeeeekn.nkn',
      '..nkkeeeekkn.nkn',
      '...nnggggnn.nkn.',
      '..ngggwgggn.nkn.',
      '..ngggggggnnkn..',
      '..nggyggggn.....',
      '...ngggggggn....',
      '....nnnnnnn.....',
      '....nk...kn.....',
      '....nn...nn.....',
    ]),
    caja_prototipo: gcArt([
      '................',
      '................',
      '...nnnnnnnnnn...',
      '..nkkkkkkkkkkn..',
      '.nkkkkkkkkkkkkn.',
      '.nnnnnnnnnnnnnn.',
      '.nkkkkkkkkkkkkn.',
      '.nkkkkkkkkkkwkn.',
      '.nkkkkaaaakkkkn.',
      '.nkkkkaaaakkkkn.',
      '.nkkkkkkkkkkkkn.',
      '.nkkkkkkkkkkkkn.',
      '.nnnnnnnnnnnnnn.',
      '................',
      '................',
      '................',
    ]),
    buzon_rojo: gcArt([
      '................',
      '.....nnnnnn.....',
      '....nrrrrrwn....',
      '...nrrrrrrrrn.y.',
      '...nrrrrrrrrnny.',
      '...nrnnnnnnrn.n.',
      '...nrnaaaanrn.n.',
      '...nrnnnnnnrn.n.',
      '...nrrrrrrrrn.n.',
      '...nnnnnnnnnn.n.',
      '.......nk.......',
      '.......nk.......',
      '.......nk.......',
      '.....nnnnnn.....',
      '................',
      '................',
    ]),
    figurita_dorada: gcArt([
      '................',
      '....n.n.n.n.....',
      '....nynynynn....',
      '....nyyyyyyn....',
      '...nnyyyywyn....',
      '...nyyyyyyyn....',
      '....nyyyyyn.....',
      '.....nyyyn......',
      '......nyn.......',
      '......nyn.......',
      '....nnnnnnn.....',
      '...nyyyyyyyn....',
      '...nkkkkkkkn....',
      '...nnnnnnnnn....',
      '................',
      '................',
    ]),
    silbato_brotes: gcArt([
      '................',
      '................',
      '................',
      '................',
      '........nnnnn...',
      '..nnnnnnyyyyyn..',
      '.nyyyyyyywyyyyn.',
      '.nyyyyyyyyyyyyn.',
      '.nnnnnnnnyyyyyn.',
      '........nyyyyn..',
      '........nnnnnn..',
      '.......g........',
      '......ggg.......',
      '................',
      '................',
      '................',
    ]),
    manija: gcArt([
      '................',
      '................',
      '................',
      '....nnnnnnnn....',
      '...niiiiiiiin...',
      '..niinnnnnniin..',
      '..nin......nin..',
      '..nin......nin..',
      '..nin......nin..',
      '.nnnnn....nnnnn.',
      '.niiwn....niiwn.',
      '.nnnnn....nnnnn.',
      '................',
      '................',
      '................',
      '................',
    ]),
    // Guiños del Barrio Cubo (§8.8).
    gc_botona: gcArt([
      '................',
      '................',
      '.....nnnnnn.....',
      '...nnggggggnn...',
      '..nggggggwwggn..',
      '..nggggaaggggn..',
      '..ngggaggagggn..',
      '..ngggaaaagggn..',
      '..ngggaggagggn..',
      '..nggggggggggn..',
      '...nnggggggnn...',
      '.....nnnnnn.....',
      '....nppppppn....',
      '...nppppppppn...',
      '...nnnnnnnnnn...',
      '................',
    ]),
    gc_kart: gcArt([
      '................',
      '....nn...nn.....',
      '...nrrn.nuun....',
      '...neen.neen....',
      '....nn...nn.....',
      '..nnnnnnnnnnnn..',
      '.nyyyyyyyyyyyyn.',
      'nyyywyyyyyyyyyyn',
      'nnnnnnnnnnnnnnnn',
      '.nnn.......nnn..',
      '.npn.......npn..',
      '.nnn.......nnn..',
      '................',
      '................',
      '................',
      '................',
    ]),
    gc_gbplayer: gcArt([
      '................',
      '................',
      '................',
      '................',
      '..nnnnnnnnnnnn..',
      '..niiiiiiiiiin..',
      '..niinnnnnniin..',
      '..niinppppniin..',
      '..niiiiiiiiwin..',
      '..nnnnnnnnnnnn..',
      '...ngn....nrn...',
      '...nnn....nnn...',
      '................',
      '................',
      '................',
      '................',
    ]),
  },

  // Música ORIGINAL (§14.2). Todas las voces de cada pista suman los mismos pasos (64).
  tracks: {
    // Cubo Galáctico (mapa): Do mayor, pop brillante, bossa simplificada, campanitas y bajo slap.
    gc_map: {
      bpm: 124,
      voices: [
        {
          wave: 'square', vol: 0.026,
          notes: 'E5/2 -/2 G5/2 -/2 C6/3 B5/1 A5/2 G5/2 -/4 E5/2 F5/2 G5/4 -/4 ' +
            'D5/2 -/2 F5/2 -/2 A5/3 G5/1 F5/2 E5/2 -/4 D5/2 E5/2 C5/4 -/4',
        },
        { wave: 'sine', vol: 0.02, notes: rep('C7/1 -/7 G6/1 -/7 E7/1 -/7 C7/1 -/7', 2) },
        {
          wave: 'triangle', vol: 0.1, legato: 0.4,
          notes: 'C3/3 G2/3 C3/2 G2/3 C3/3 G2/2 A2/3 E2/3 A2/2 E2/3 A2/3 E2/2 ' +
            'D3/3 A2/3 D3/2 A2/3 D3/3 A2/2 G2/3 D3/3 G2/2 D3/3 G2/3 B2/2',
        },
        { wave: 'noise', vol: 0.02, notes: rep('x - - x - - x - - x - - x - x -', 4) },
      ],
    },
    // Batalla normal GC: La menor, riff de bajo funky y "metales" cortos.
    gc_battle: {
      bpm: 158,
      voices: [
        {
          wave: 'square', vol: 0.028,
          notes: 'A4/2 -/2 C5/1 D5/1 E5/2 -/2 G5/2 E5/2 D5/2 C5/2 -/2 A4/2 C5/2 D5/2 E5/4 -/2 ' +
            'F5/2 -/2 E5/1 D5/1 C5/2 -/2 E5/2 G5/2 A5/4 G5/2 E5/2 D5/2 B4/2 C5/2 A4/4',
        },
        { wave: 'square', vol: 0.014, notes: '-/4 C5/1 -/3 -/4 C5/1 -/3 -/4 C5/1 -/3 -/4 C5/1 -/3 -/4 A4/1 -/3 -/4 A4/1 -/3 -/4 G#4/1 -/3 -/4 G#4/1 -/3' },
        {
          wave: 'triangle', vol: 0.11, legato: 0.35,
          notes: rep('A2/2 A3/1 A2/1 -/2 G2/1 A2/1 -/2 C3/1 D3/1 E3/2 G2/2', 2) + ' ' +
            'F2/2 F3/1 F2/1 -/2 E2/1 F2/1 -/2 A2/1 C3/1 D3/2 E2/2 ' +
            'E2/2 E3/1 E2/1 -/2 D2/1 E2/1 -/2 G#2/1 B2/1 D3/2 E2/2',
        },
        { wave: 'noise', vol: 0.026, notes: rep('x - x x - x x - x - x x - x x -', 4) },
      ],
    },
    // Capitán Brotes: Fa mayor, marcha de expedición; silbido, pasos y un motivo por escuadrón.
    gc_brotes: {
      bpm: 130,
      voices: [
        {
          wave: 'sine', vol: 0.04, legato: 0.9,
          notes: 'F5/2 A5/2 C6/4 A5/2 F5/2 G5/4 E5/2 G5/2 C6/4 A#5/2 A5/2 G5/4 ' +
            'F5/2 A5/2 C6/4 D6/2 C6/2 A5/4 G5/2 A5/2 F5/4 C5/2 E5/2 F5/4',
        },
        { wave: 'square', vol: 0.014, notes: 'C5/1 E5/1 -/6 E5/1 C5/1 -/6 G5/1 G5/1 -/6 C5/1 E5/1 -/6 E5/1 C5/1 -/6 G5/1 G5/1 -/6 C5/1 E5/1 -/6 G5/1 G5/1 -/6' },
        { wave: 'triangle', vol: 0.1, notes: 'F2/4 C3/4 F2/4 C3/4 C2/4 G2/4 C2/4 G2/4 A#1/4 F2/4 C2/4 G2/4 F2/4 C3/4 F2/8' },
        { wave: 'noise', vol: 0.018, notes: rep('x/2 -/2', 16) },
      ],
    },
    // Casco Escáner: Si menor, fría; pad, pulsos cada 2 tiempos y melodía escasa.
    gc_escaner: {
      bpm: 96,
      voices: [
        { wave: 'sine', vol: 0.03, legato: 1, notes: 'B3/16 G3/16 D4/16 F#3/16' },
        { wave: 'square', vol: 0.02, notes: 'F#5/4 -/4 D5/2 -/6 B4/4 -/12 C#5/2 D5/2 E5/4 F#5/4 -/20' },
        { wave: 'triangle', vol: 0.08, notes: 'B1/8 B1/8 G1/8 G1/8 D2/8 D2/8 F#1/8 F#1/8' },
        { wave: 'noise', vol: 0.02, notes: rep('x/1 -/7', 8) },
      ],
    },
    // El Guante Crossover: Mi menor, épica de torneo; fanfarria de 2 compases y riff rápido.
    gc_guante: {
      bpm: 170,
      voices: [
        {
          wave: 'sawtooth', vol: 0.018,
          intro: 'E5/2 E5/2 E5/2 G5/2 B5/8 A5/2 G5/2 A5/4 B5/8',
          notes: 'E5/1 G5/1 B5/2 A5/2 G5/2 F#5/2 E5/2 D5/2 F#5/2 E5/4 B4/4 -/8 ' +
            'C5/2 E5/2 G5/2 C6/2 B5/2 A5/2 G5/2 F#5/2 G5/2 A5/2 B5/4 E5/8',
        },
        { wave: 'square', vol: 0.014, intro: 'B4/8 D5/8 E5/16', notes: rep('E4 B4', 16) + ' ' + rep('C4 G4', 8) + ' ' + rep('D4 A4', 8) },
        { wave: 'triangle', vol: 0.11, intro: 'E2/8 G2/8 E2/16', notes: rep('E2 E3', 16) + ' ' + rep('C2 C3', 8) + ' ' + rep('D2 D3', 8) },
        { wave: 'noise', vol: 0.028, intro: 'x x x x x x x x -/24', notes: rep('x - x - x x x -', 8) },
      ],
    },
  },
});

// Sprites de las copias de sombra (el sprite original en magenta). Se crean ahora que los
// mundos anteriores ya se registraron; si alguno falta, se usa el del Guante.
[['tetro', 'tetrorey'], ['caparazon', 'caparazon'], ['nebula', 'nebula'], ['marco', 'marco']].forEach(([kind, orig]) => {
  const s = gcShadowSprite(orig);
  if (s) SPRITES[`gc_sombra_${kind}`] = s;
});

// Variantes de música hechas a partir de pistas que ya existen:
//  - Copias de sombra: la pista del jefe original, medio tono abajo y con cortes (§14.2).
//  - Figuritas del Guante: la pista del jefe con el timbre de la voz principal de cada era.
const GC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function gcTranspose(tok, by) {
  const [n, d] = tok.split('/');
  const m = /^([A-G]#?)(\d)$/.exec(n);
  if (!m) return tok;
  let i = GC_NOTES.indexOf(m[1]) + by;
  let o = Number(m[2]);
  while (i < 0) { i += 12; o--; }
  while (i > 11) { i -= 12; o++; }
  return `${GC_NOTES[i]}${o}${d ? `/${d}` : ''}`;
}
function gcShadowTrack(src) {
  const cut = (s) => s.trim().split(/\s+/).map((tok, k) => {
    if (k % 7 === 6 && !tok.startsWith('-')) return `-/${tok.split('/')[1] || 1}`; // "cortes"
    return gcTranspose(tok, -1);
  }).join(' ');
  return {
    bpm: Math.round(src.bpm * 0.92),
    voices: src.voices.map((v) => ({ ...v, notes: v.wave === 'noise' ? v.notes : cut(v.notes), intro: v.intro && v.wave !== 'noise' ? cut(v.intro) : v.intro })),
  };
}
function gcShadowTrackFor(id) {
  const key = `gc_sombra_${id}`;
  if (!TRACKS[key]) TRACKS[key] = gcShadowTrack(TRACKS[id] || TRACKS.boss);
  return key;
}
const GC_FIGURE_WAVE = { tetro: 'square', caparazon: 'triangle', nebula: 'sine', marco: 'square' };
Object.entries(GC_FIGURE_WAVE).forEach(([kind, wave]) => {
  const base = TRACKS.gc_guante;
  TRACKS[`gc_guante_${kind}`] = {
    bpm: kind === 'nebula' ? 150 : base.bpm,
    voices: base.voices.map((v, i) => (i === 0 ? { ...v, wave, vol: wave === 'square' ? 0.026 : 0.04, intro: undefined } : { ...v, intro: undefined })),
  };
});
TRACKS.gc_brotes_fast = { ...TRACKS.gc_brotes, bpm: 156 };
