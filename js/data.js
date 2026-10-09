// Contenido del juego: palabras, enemigos, mundos y coleccionables.
// Los mundos viven en js/worlds/*.js (ver docs/MUNDOS.md).

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

// room: en qué sala del museo se exhibe ('pueblo' o el id de un mundo).
const TREASURES = {
  manual: { room: 'gb', name: 'Manual de instrucciones', desc: 'Nadie lo leyó nunca. Excepto tú.' },
  cartucho: { room: 'gb', name: 'Cartucho misterioso', desc: 'Sopla antes de usar. Es la regla.' },
  pilas: { room: 'gb', name: 'Pilas AA', desc: 'Para jugar en el carro durante horas.' },
  cable: { room: 'gb', name: 'Cable Link', desc: 'Sirve para jugar con un amigo. ¡Ya tienes varios!' },
  bloques: { room: 'pueblo', name: 'Cartucho de bloques', sprite: 'cartucho', desc: 'Regalo de Don Chip. Venía incluido con la Game Boy.' },
  espada: { room: 'pueblo', name: 'Espada de madera', desc: 'Es peligroso ir solo. Un clásico de 1986.' },
  medalla: { room: 'gb', name: 'Medalla Pixel', desc: 'Se la ganaste a Dani Turbo en tu primer combate de Tecloides.' },
  ficha: { room: 'pueblo', name: 'Ficha dorada', desc: 'Premio por llegar a 40 puntos en BLOQUES.' },
  zapper: { room: 'pueblo', name: 'Pistola de luz', desc: 'Premio de Toby. Las de verdad solo funcionaban en teles de tubo.' },
};

// Enemigos y mundos se llenan desde js/worlds/*.js con addWorld().
const ENEMIES = {};
const WORLDS = [];

// Registra un mundo (ver docs/MUNDOS.md):
//   id, order (lugar de su tubería en el pueblo), name, theme, requires (consola que lo abre),
//   console (consola que se rescata), nodes, enemies, y opcionales: treasures, sprites, tracks, quests
function addWorld(w) {
  Object.assign(ENEMIES, w.enemies || {});
  Object.entries(w.treasures || {}).forEach(([id, t]) => { TREASURES[id] = { room: w.id, ...t }; });
  Object.assign(SPRITES, w.sprites || {});
  Object.assign(TRACKS, w.tracks || {});
  Object.assign(QUESTS, w.quests || {});
  WORLDS.push(w);
  WORLDS.sort((a, b) => a.order - b.order);
}

const worldUnlocked = (w) => !w.requires || !!Save.data.consoles[w.requires];

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
