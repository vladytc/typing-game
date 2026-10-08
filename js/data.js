// Contenido del juego: palabras, enemigos, mundos y coleccionables.
// Para agregar un mundo nuevo: crea sus enemigos en ENEMIES y quítale `soon` en WORLDS.

const WORDS = {
  // Cortas y comunes, para calentar.
  t1: ['sol', 'mar', 'pan', 'gato', 'casa', 'luna', 'nube', 'rojo', 'azul', 'mesa', 'pato', 'dedo',
    'lago', 'mano', 'nido', 'pera', 'rana', 'sapo', 'taza', 'vaso', 'hada', 'sala', 'fila', 'lado',
    'dado', 'jugo', 'kilo', 'foca', 'oso', 'rey', 'flor', 'gol', 'tren', 'bici', 'lupa', 'queso'],
  // Palabras de videojuego.
  t2: ['pixel', 'consola', 'control', 'botón', 'pantalla', 'batería', 'nivel', 'jefe', 'moneda',
    'castillo', 'espada', 'escudo', 'poción', 'dragón', 'tesoro', 'mapa', 'llave', 'puerta',
    'corazón', 'estrella', 'hongo', 'tubería', 'bloque', 'cartucho', 'partida', 'vidas', 'salto',
    'fuego', 'puntos', 'récord', 'bonus', 'mando', 'cueva', 'bosque', 'volcán', 'magia'],
};

const ENEMIES = {
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
  },
  tetrorey: {
    name: 'Tetro Rey',
    sprite: 'tetrorey',
    boss: true,
    hp: 120, atk: 4, def: 2, xp: 40,
    fightWords: 4, words: WORDS.t2,
    blurb: '¡JEFE! El rey de los bloques que caen. Tiene la Game Boy guardada en su torre.',
    intro: '* ¡EL TETRO REY baja girando desde lo alto!\n* "¿Quieres la Game Boy? ¡Tendrás que ganártela!"',
    check: '* TETRO REY - ATQ 4 DEF 2\n* Rey de los bloques que caen. Guarda la Game Boy en su torre.',
    idle: ['* El Tetro Rey gira 90 grados. Se ve igual.', '* Una línea completa desaparece a lo lejos.', '* La música se pone más rápida...'],
    calm: '* El Tetro Rey tararea una melodía rusa muy famosa.',
    taunts: ['¡TODO ENCAJA EN MI REINO!', '¡LLUEVEN BLOQUES!', '¡LA GAME BOY ES MIA!'],
    acts: [
      { name: 'Girar', text: 'giras en el sentido del reloj', mercy: 30, reply: '* El Tetro Rey se marea un poquito. "¡Eso es trampa!"' },
      { name: 'Hacer línea', text: 'completas una línea perfecta', mercy: 35, reply: '* ¡LINEA! El Tetro Rey aplaude sin querer.' },
      { name: 'Reverencia', text: 'haces una reverencia a su majestad', mercy: 30, reply: '* "Hmm... por fin alguien con modales."' },
    ],
    bullets: {
      count: 12, interval: 1700, speed: 28,
      pool: ['rey', 'bloque', 'gira', 'cae', 'torre', 'linea', 'pieza', 'nivel', 'fila', 'caja', 'rapido', 'punto'],
    },
    drop: 'cable',
    console: 'gameboy',
    keysHint: 'Palabras completas que caen',
  },
};

const WORLDS = [
  { id: 'gb', name: 'Valle Game Boy', short: 'GB', nodes: ['pixelito', 'cartuchon', 'pilabat', 'tetrorey'] },
  { id: 'nes', name: 'Castillo 8-Bit', short: 'NES', soon: true },
  { id: 'snes', name: 'Reino 16-Bit', short: 'SNES', soon: true },
  { id: 'n64', name: 'Isla Polígono', short: 'N64', soon: true },
  { id: 'gc', name: 'Cubo Galáctico', short: 'GC', soon: true },
  { id: 'wii', name: 'Ciudad Sensor', short: 'WII', soon: true },
];

// Datos curiosos reales de cada consola. Se leen en la vitrina y con Don Chip.
const CONSOLES = [
  {
    id: 'gameboy', name: 'Game Boy', year: 1989,
    facts: [
      'Funcionaba con 4 pilas AA y su pantalla solo mostraba 4 tonos de verde. ¡Como este mundo!',
      'En América y Europa venía con Tetris incluido.',
      'Una Game Boy sobrevivió a un bombardeo en la Guerra del Golfo y todavía prendía. Estuvo en exhibición en la tienda de Nintendo en Nueva York.',
      'Pokémon Rojo y Verde salieron para Game Boy en 1996, en Japón. Para intercambiar Pokémon usabas el Cable Link.',
      'Entre Game Boy y Game Boy Color se vendieron casi 119 millones de consolas.',
    ],
  },
  {
    id: 'nes', name: 'NES', year: 1985,
    facts: [
      'En Japón se llamaba Famicom, era roja con blanco y salió en 1983.',
      'En Estados Unidos la hicieron parecida a una videocasetera para que las tiendas confiaran en ella.',
      'Algunos paquetes traían a R.O.B., un robot que jugaba contigo.',
      'El código ↑↑↓↓←→←→BA apareció en Gradius y se hizo famoso en Contra, donde daba 30 vidas.',
      'El cartucho de The Legend of Zelda era dorado y guardaba tu partida gracias a una pila.',
    ],
  },
  {
    id: 'snes', name: 'Super Nintendo', year: 1990,
    facts: [
      'Fue la primera consola de Nintendo con botones L y R en los hombros del control.',
      'Su "Modo 7" giraba y agrandaba el piso para fingir 3D, como en F-Zero y Super Mario Kart.',
      'Super Mario World venía incluido, y ahí apareció Yoshi por primera vez.',
      'Star Fox traía un chip especial, el Super FX, dentro del cartucho para dibujar polígonos.',
      'En Japón y Europa era redondita con botones de colores. En Estados Unidos era cuadrada y morada.',
    ],
  },
  {
    id: 'n64', name: 'Nintendo 64', year: 1996,
    facts: [
      'Fue la primera consola de Nintendo con palanca analógica en el control.',
      'Super Mario 64 salió el mismo día que la consola en Japón.',
      'Mientras otras consolas usaban CD, la N64 siguió con cartuchos: cargaban casi al instante.',
      'El Rumble Pak hacía vibrar el control. Debutó junto con Star Fox 64.',
      'Traía 4 puertos para controles, perfecta para jugar con amigos.',
    ],
  },
  {
    id: 'gamecube', name: 'GameCube', year: 2001,
    facts: [
      'Usaba discos pequeñitos de 8 cm en lugar de discos normales.',
      '¡Tenía una manija para llevarla a todos lados!',
      'Su nombre secreto durante su desarrollo era "Dolphin".',
      'Con el Game Boy Player podías jugar juegos de Game Boy en la tele.',
      'Super Smash Bros. Melee fue su juego más vendido.',
    ],
  },
  {
    id: 'wii', name: 'Wii', year: 2006,
    facts: [
      'Su nombre secreto durante su desarrollo era "Revolution".',
      'Wii Sports venía incluido y es uno de los juegos más vendidos de la historia.',
      'Se vendieron más de 100 millones de Wii.',
      'Los primeros modelos podían jugar discos y usar controles de GameCube.',
      'Ahí nacieron los Mii: personajes que te representaban a ti.',
    ],
  },
];

const TREASURES = {
  manual: { name: 'Manual de instrucciones', desc: 'Nadie lo leyó nunca. Excepto tú.' },
  cartucho: { name: 'Cartucho misterioso', desc: 'Sopla antes de usar. Es la regla.' },
  pilas: { name: 'Pilas AA', desc: 'Para jugar en el carro durante horas.' },
  cable: { name: 'Cable Link', desc: 'Sirve para jugar con un amigo. ¡Ya tienes varios!' },
  bloques: { name: 'Cartucho de bloques', sprite: 'cartucho', desc: 'Regalo de Don Chip. Venía incluido con la Game Boy.' },
  espada: { name: 'Espada de madera', desc: 'Es peligroso ir solo. Un clásico de 1986.' },
  zapper: { name: 'Pistola de luz', desc: 'Premio de Toby. Las de verdad solo funcionaban en teles de tubo.' },
};

const ITEM = { name: 'Galleta Pixel', text: 'comes la galleta pixel', heal: 12 };

const INTRO_STORY = [
  '* Hace mucho tiempo, las consolas antiguas vivían felices en una gran vitrina.',
  '* Pero un día, un apagón mágico las mandó dentro de sus propios juegos.',
  '* Ahora están atrapadas, cuidadas por monstruos de píxeles.',
  '* Solo alguien con dedos MUY rápidos puede rescatarlas.',
  '* En esta aventura, tus ataques se hacen TECLEANDO.\n* Mientras más rápido y preciso escribas, más fuerte golpeas.',
  '* Y si eres amable... a veces puedes hacer AMIGOS en vez de pelear.',
  '* ¿Listo? Tu primera parada: el VALLE GAME BOY.',
];

const TUTORIAL = [
  '* (Usa ← → para elegir y ENTER para aceptar.)',
  '* LUCHAR: escribe las palabras para atacar.\n* Rápido = más daño. Sin errores = ¡PERFECTO!',
  '* ACTUAR: haz algo amable. Llena la barra de PAZ...\n* ...y usa PERDONAR para hacerte su amigo.',
  '* En el turno del enemigo caen letras.\n* ¡Escríbelas antes de que toquen el suelo!',
];
