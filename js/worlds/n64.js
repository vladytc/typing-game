// MUNDO 4 — Isla Polígono (Nintendo 64, 1996). Diseño en docs/LORE.md §7.
// El primer mundo en 3D: three.js se carga solo al entrar a una escena de este mundo
// (js/scenes/poly3d.js). Sin internet todo se juega igual en "modo clásico".
// Escenas propias: battle64.js (enemigos en 3D), kart.js, ocarin.js, estadio.js, castillo.js.

// Palabras del mundo (§16): números, fechas y posición base.
WORDS.n64 = WORDS.n64 || ['64', '120', '1996', '4 puertos', '3 lados', '8 cuadros', 'estrella', 'cuadro', 'castillo',
  'niebla', 'cámara', 'polígono', 'textura', 'triángulo', 'isla', 'playa', 'templo', 'melodía', 'flauta', 'kart',
  'plátano', 'caparazón', 'rayo', 'derretir', 'reloj'];

// ---------- Tecloides nuevos (solo si otro mundo no los definió ya) ----------
TTYPES.estatica = TTYPES.estatica || 'ESTATICA';
addTecloide('cactin', {
  name: 'Cactín', type: 'brote', sprite: 'cactin', hp: 50,
  desc: 'Un cactus de polígonos con sombrero. Pica, pero poquito.',
  moves: [move('Espinita', 'espina', 22, 'brote'), TECLEO, move('Tres Lados', '3 lados', 36, 'byte'), move('Sol de Mediodía', '4 espinas al sol', 52, 'brote', 'curar')],
});
addTecloide('volton', {
  name: 'Voltón', type: 'chispa', sprite: 'voltin', hp: 50,
  desc: 'Voltín, pero con más voltios. Y más ego.',
  moves: [move('Chispazo', 'zas', 22, 'chispa'), TECLEO, move('Relámpago', 'relámpago', 42, 'chispa'), move('Trueno', 'trueno', 46, 'chispa', 'aturdir')],
});
addTecloide('goton', {
  name: 'Gotón', type: 'gota', sprite: 'gotin', hp: 54,
  desc: 'Gotín ya creció. La gorra le queda chica.',
  moves: [move('Salpicón', 'salpica', 30, 'gota'), TECLEO, move('Cascada', 'cascada', 40, 'gota'), move('Marea', 'marea alta', 50, 'gota')],
});
addTecloide('broton', {
  name: 'Brotón', type: 'brote', sprite: 'brotin', hp: 58,
  desc: 'Brotín con hojas nuevas. Sigue amando las palabras largas.',
  moves: [move('Hojita', 'hoja', 20, 'brote'), TECLEO, move('Enredadera', 'enredadera', 40, 'brote'), move('Raíz', 'raíces profundas', 55, 'brote', 'curar')],
});
addTecloide('estatico64', {
  name: '????', type: 'estatica', sprite: 'estatico', hp: 52, flaky: 0.3, // "No me hace caso. Pero es fuerte."
  desc: 'El ??? de Dani ya evolucionó. Ahora tiene un signo más.',
  moves: [move('Ruido', 'ruido', 26, 'estatica'), TECLEO, move('Interferencia', 'interferencia', 42, 'estatica'), move('Pausa Eterna', 'pausa eterna', 48, 'estatica', 'aturdir')],
});
const TEC_STAGE2 = { voltin: 'volton', gotin: 'goton', brotin: 'broton' };

TRAINERS.dani64 = {
  name: 'Dani Turbo',
  sprite: 'dani',
  // 3 contra 3: el que le gana a tu inicial (evolucionado), el otro inicial y el ????.
  team: (starter) => {
    const s = STARTERS.includes(starter) ? starter : 'voltin';
    const other = STARTERS.find((x) => x !== s && x !== COUNTER[s]);
    return [{ id: TEC_STAGE2[COUNTER[s]], lv: 6 }, { id: TEC_STAGE2[other], lv: 5 }, { id: 'estatico64', lv: 7 }];
  },
  intro: [
    '* PUBLICO: ¡DA-NI! ¡DA-NI! ¡DA-NI!',
    '* DANI: ¡Bienvenido a MI estadio!\n* Mi ??? ya evolucionó. Ahora es ????. Tiene un signo más.',
    '* DANI: ...No me hace caso. Pero es fuerte.',
    '* ¡DANI TURBO quiere pelear, 3 contra 3!',
  ],
  lose: [
    '* DANI: Te dejé ganar. Para que el público no llore.',
    '* DANI: ...Oye. El tipo morado me dijo que con ???? sería el más rápido del museo.\n* Pero ni me obedece. ¿Y si me mintió?',
  ],
  win: ['* DANI: ¡Ja! ¿Escuchaste? ¡El público me ama!'],
  retry: ['* PROFESORA LETRA (desde las gradas): ¡Ya curé a tus Tecloides!', '* DANI: Revancha cuando quieras. Aquí te espero.'],
};

// ---------- Enemigos normales: practican números y palabras alternadas (§7.3, §7.10) ----------
const N64_BULLET_NUMS = '0123456789'.split('');

addWorld({
  id: 'n64',
  order: 4,
  name: 'Isla Polígono',
  theme: 'n64',               // css/worlds/n64.css
  requires: 'snes',
  console: 'n64',
  nodes: ['trianguloso', 'cactin', 'piloto', 'texturin', 'niebla', 'dani64', 'camaraloca', 'pakito', 'ocarin', 'marco'],
  enemies: {
    trianguloso: {
      name: 'Trianguloso', sprite: 'trianguloso', n64: true, model: 'trianguloso', fx: 'none',
      hp: 85, atk: 5, def: 3, xp: 34,
      fightWords: 3, words: ['3 lados', '1 ojo', 'triángulo', '3 puntas', 'polígono', 'vértice', '64', '2 caras', 'plano', '3 ángulos', '180', 'arista'],
      blurb: 'Un triángulo con un ojo. Se cree el átomo de todo lo 3D. (Tiene razón.)',
      keysHint: 'Fila de números: 3 lados, 1 ojo',
      intro: '* ¡Trianguloso aparece girando!\n* "Sin mí, nada de esto existiría."',
      check: '* TRIANGULOSO - ATQ 5 DEF 3\n* Un triángulo con un ojo. Dice que todo el 3D está hecho de él.',
      idle: ['* Trianguloso cuenta sus lados. Le salen tres. Siempre.', '* Trianguloso gira para que veas su lado bueno. Todos son iguales.', '* Huele a polígono recién renderizado.'],
      calm: '* Trianguloso se ve muy... equilátero.',
      taunts: ['¡Soy la base de todo!', '¡Tres lados, cero dudas!', '¡Gira, gira, polígono!'],
      acts: [
        { name: 'Contar', text: 'cuentas sus 3 lados', mercy: 45, reply: '* "¡Tres! Soy perfecto."' },
        { name: 'Dibujar', text: 'dibujas un cuadrado a su lado', mercy: 50, reply: '* "¡Un amigo con cuatro!"' },
        { name: 'Elogiar', text: 'eres la base de todo lo 3d', mercy: 35, reply: '* "Lo sé, pero gracias."' },
      ],
      bullets: { count: 10, interval: 1250, speed: 34, pool: N64_BULLET_NUMS.concat(['3', '64', '1', '120']) },
    },
    cactin: {
      name: 'Cactín Salvaje', sprite: 'cactin', n64: true, model: 'cactin', fx: 'none', gift: 'cactin',
      hp: 75, atk: 4, def: 2, xp: 30,
      fightWords: 3, words: ['4 espinas', '2 flores', 'cactus', 'sombrero', 'desierto', '1 gota', '3 brazos', 'espina', 'arena', '40 grados', 'sol', '7 nubes'],
      blurb: 'Un cactus poligonal con sombrero. Si lo perdonas... quizá quiera ser tu Tecloide.',
      keysHint: 'Números y palabras mezclados: 4 espinas',
      intro: '* ¡Un Cactín Salvaje sale de la arena!\n* Se acomoda el sombrero con mucha dignidad.',
      check: '* CACTIN SALVAJE - ATQ 4 DEF 2\n* Un cactus de polígonos. Tecloide de tipo BROTE... salvaje.',
      idle: ['* Cactín se abanica con el sombrero.', '* El sol de la playa pega fuerte.', '* Cactín cuenta sus espinas: 4. Perfecto.'],
      calm: '* Cactín te mira con cariño. Con mucho cuidado de no picarte.',
      taunts: ['¡Pica, pica!', '¡Cuatro espinas!', '¡Ajúa!'],
      acts: [
        { name: 'Sombrero', text: 'le acomodas el sombrero', mercy: 45, reply: '* "Gracias, el sol pega fuerte."' },
        { name: 'Agua', text: 'le das 1 gota de agua', mercy: 50, reply: '* "Justo lo que necesitaba." (Solo una. Es un cactus.)' },
        { name: 'Cantar', text: 'cantas una ranchera corta', mercy: 40, reply: '* "¡AJUA!"' },
      ],
      bullets: { count: 10, interval: 1300, speed: 32, pool: ['4', '2', '1', '3', 'sol', 'pica', 'arena', 'agua', '7', '9'] },
    },
    piloto: {
      name: 'Piloto Sombra', sprite: 'piloto', mode: 'kart', xp: 45,
      blurb: '¡MINIJEFE! Circuito Isla: carrera de karts de 3 vueltas. Escribe para acelerar y usa los objetos.',
      keysHint: 'Velocidad sostenida: números y palabras',
      pool: {
        words: ['isla', 'playa', 'kart', 'turbo', 'curva', 'meta', 'vuelta', 'llanta', 'motor', 'pista', 'arena', 'palmera', 'derrape', 'rampa', 'volante', 'bandera', 'nube', 'ola'],
        numbers: ['64', '120', '1996', '4 puertos', '3 vueltas', '8 cuadros', '1 2 3', '50 cc', '100 cc', '150 cc'],
      },
    },
    texturin: {
      name: 'Texturín', sprite: 'texturin', n64: true, model: 'texturin', fx: 'blur',
      hp: 90, atk: 5, def: 2, xp: 36,
      fightWords: 3, words: ['textura', 'ladrillo', 'borroso', 'filtro', 'pasto', 'madera', 'piso', 'pared', '32 bits', '64', '128', '2 pixeles'],
      blurb: 'Una textura borrosa que anda buscando su modelo. Sus palabras salen borrosas.',
      keysHint: 'Lectura rápida: palabras borrosas',
      intro: '* ¡Texturín se pega en tu cara!\n* ...No, se cayó. No tiene modelo dónde pegarse.',
      check: '* TEXTURIN - ATQ 5 DEF 2\n* Una textura sin modelo. Sus palabras salen borrosas medio segundo.',
      idle: ['* Texturín se estira. Se ve todavía más borroso.', '* Texturín busca un cubo. Cualquier cubo.', '* Todo se ve un poquito suave aquí.'],
      calm: '* Texturín casi se ve nítido.',
      taunts: ['¡Mírame! ...¿Me ves?', '¡Soy un ladrillo! Creo.', '¡Filtro bilineal!'],
      acts: [
        { name: 'Enfocar', text: 'ajustas el enfoque despacio', mercy: 50, reply: '* "¡Me veo! ¡Soy un ladrillo!"' },
        { name: 'Pegar', text: 'la pegas en un cubo', mercy: 45, reply: '* "Por fin tengo forma."' },
        { name: 'Filtro', text: 'le pones un filtro bilineal', mercy: 40, reply: '* "Ahh, suavecito."' },
      ],
      bullets: { count: 11, interval: 1200, speed: 34, pool: ['pixel', 'borroso', 'ladrillo', '64', '32', 'filtro', 'pasto', '128'] },
    },
    niebla: {
      name: 'Niebla Lejana', sprite: 'niebla', n64: true, model: 'niebla', fx: 'far',
      hp: 80, atk: 4, def: 4, xp: 32,
      fightWords: 3, words: ['niebla', 'lejos', 'cerca', 'montaña', 'horizonte', 'carga', 'vapor', 'nube', '200 metros', '100', '50 pasos', '5 casillas'],
      blurb: 'Una nube gris que dice "no me veas, no estoy cargada". Sus palabras llegan desde el fondo.',
      keysHint: 'Palabras que llegan de lejos',
      intro: '* Algo aparece a lo lejos... ¡Niebla Lejana!\n* "¡No me veas! ¡No estoy cargada!"',
      check: '* NIEBLA LEJANA - ATQ 4 DEF 4\n* Esconde todo lo que está a más de 5 casillas. Es tímida.',
      idle: ['* Niebla Lejana se hace un poquito más espesa.', '* A lo lejos, una montaña aparece y desaparece.', '* "...Todavía no termino de cargar."'],
      calm: '* Niebla Lejana deja ver un poquito del horizonte.',
      taunts: ['¡No me veas!', '¡Cargando...!', '¡Todo lo lejano es mío!'],
      acts: [
        { name: 'Esperar', text: 'esperas a que cargue', mercy: 50, reply: '* "...Ya. Gracias por la paciencia."' },
        { name: 'Acercar', text: 'caminas hacia ella sin miedo', mercy: 45, reply: '* "¡Nadie se acerca!"' },
        { name: 'Dibujar', text: 'dibujas montañas detrás de la niebla', mercy: 40, reply: '* "¿Eso había?"' },
      ],
      bullets: { count: 11, interval: 1250, speed: 32, pool: ['gris', 'nube', 'lejos', '5', '100', 'carga', 'vapor', '50'] },
    },
    camaraloca: {
      name: 'Cámara Loca', sprite: 'camaraloca', n64: true, model: 'camaraloca', fx: 'tilt', startsQuest: 'camara_atora',
      hp: 95, atk: 5, def: 3, xp: 38,
      fightWords: 3, words: ['cámara', 'pared', 'esquina', 'zoom', 'girar', 'centrar', 'foto', 'lente', '90 grados', '45', '180', '360'],
      blurb: 'Una cámara con alas que se atora en las paredes. Sus palabras salen inclinadas.',
      keysHint: 'Leer palabras inclinadas',
      intro: '* ¡Cámara Loca entra volando!\n* (La cámara se atora en una pared.) (...Ya se soltó.)',
      check: '* CAMARA LOCA - ATQ 5 DEF 3\n* En 1996 la cámara era un enemigo más. Esta lo tomó literal.',
      idle: ['* Cámara Loca se atora en una esquina.', '* Cámara Loca hace zoom a tu nariz.', '* Todo se ve chueco por un segundo.'],
      calm: '* Cámara Loca se queda quietecita, centrada.',
      taunts: ['¡CLIC!', '¡Ángulo raro!', '¡Me atoré!'],
      acts: [
        { name: 'Centrar', text: 'pulsas el botón de centrar cámara', mercy: 50, reply: '* "¡Ahh! ¡Mi botón favorito!"' },
        { name: 'Pared', text: 'le dices que las paredes no muerden', mercy: 40, reply: '* "¿Segura?"' },
        { name: 'Foto', text: 'posas para la foto', mercy: 45, reply: '* "¡Clic! Salió borrosa. Perfecta."' },
      ],
      bullets: { count: 12, interval: 1150, speed: 35, pool: ['clic', 'zoom', '90', '45', 'foto', 'lente', '360', 'gira'] },
    },
    pakito: {
      name: 'Pakito Vibra', sprite: 'pakito', n64: true, model: 'pakito', fx: 'shake',
      hp: 100, atk: 6, def: 3, xp: 40,
      fightWords: 3, words: ['vibra', 'pilas', 'control', 'temblor', '1997', 'zumbido', 'motor', 'brrr', '2 pilas', 'tiembla', '4 puertos', 'calma'],
      blurb: 'Un cubito gris que vibra todo el tiempo. Sus palabras tiemblan: ¡precisión bajo presión!',
      keysHint: 'Precisión con palabras que tiemblan',
      intro: '* ¡Pakito Vibra aparece temblando!\n* "¡Brrrrrr! ¡Hola! ¡Brrrr!"',
      check: '* PAKITO VIBRA - ATQ 6 DEF 3\n* Nació en 1997 junto con un juego de naves. Hace brrr.',
      idle: ['* Pakito vibra. Es lo que hace.', '* El suelo tiembla un poquito.', '* "Brrr... brr... ¿me quitas una pila?"', '* "Soy un paquete que hace vibrar. Nací en 1997 con un zorro."'],
      calm: '* Pakito casi no vibra. Casi.',
      taunts: ['¡BRRRR!', '¡Siente la vibra!', '¡Zzzzzumbido!'],
      acts: [
        { name: 'Abrazar', text: 'lo abrazas hasta que se calma', mercy: 50, reply: '* "brrr... brr... b."' },
        { name: 'Pilas', text: 'le quitas 1 pila', mercy: 40, reply: '* "¡Oye! ...bueno, vibro menos."' },
        { name: 'Ritmo', text: 'vibras al mismo ritmo', mercy: 45, reply: '* "¡Somos una banda!"' },
      ],
      bullets: { count: 12, interval: 1150, speed: 36, pool: ['brrr', 'vibra', '1997', 'pila', 'motor', '2', '4', 'zum'] },
      drop: 'pak_vibra',
    },
    dani64: {
      name: 'Dani Turbo', sprite: 'dani', mode: 'estadio', xp: 45,
      blurb: '¡MINIJEFE! Estadio Polígono: Tecloides 3 contra 3, con público y locutor.',
      keysHint: 'Ataques-palabra; esquivar con menos tiempo',
    },
    ocarin: {
      name: 'Ocarín', sprite: 'ocarin', mode: 'ocarin', xp: 40,
      blurb: '¡MINIJEFE! Templo de la Melodía: Ocarín no pelea, te enseña melodías con S D F J K.',
      keysHint: 'Posición base con ritmo: S D F J K',
      // Melodías ORIGINALES del lore (§7.4). Cada una re-dibuja un pedazo de la isla.
      songs: [
        { name: 'Canción del Sol', keys: 'sfkf', effect: 'Quita la niebla de la Playa.', done: 'La niebla de la playa se fue. ¡Ya se ven las palmeras!' },
        { name: 'Canción de la Lluvia', keys: 'djdjs', effect: 'Llena el río del Circuito Isla.', done: 'El río se llenó. Dicen que los karts derrapan más bonito.' },
        { name: 'Canción del Viento', keys: 'fkjfds', effect: 'Limpia el cielo del Estadio.', done: 'El viento empujó las nubes. Se oye al público desde aquí.' },
        { name: 'Canción del Cuadro', keys: 'kjfdjks', effect: 'Abre el Castillo de los Cuadros.', done: 'Las puertas del castillo rechinaron. Marco te espera.' },
        { name: 'Canción de Despertar', keys: 'sdfjkjfd', effect: 'Despierta a lo más dormido.', done: 'Con esto, hasta lo más dormido abre los ojos.' },
      ],
    },
    marco: {
      name: 'Marco, Rey de los Cuadros', sprite: 'marco', boss: true, console: 'n64',
      mode: 'castillo',          // el mapa lleva al castillo; la pelea final es el combate normal (battle64)
      n64: true, model: 'marco', fx: 'frame', hpCutPerStar: 20,
      hp: 220, atk: 5, def: 4, xp: 80,
      fightWords: 4, words: ['cuadro', 'pintura', 'castillo', 'estrella', 'pincel', 'galería', 'dorado', 'sótano', '1996', '120', '8 cuadros', '64 colores'],
      blurb: '¡JEFE! El Castillo de los Cuadros: 8 pinturas, 8 estrellas... y Marco, que guarda la Nintendo 64.',
      keysHint: 'De todo: mayúsculas, números, acentos y texto que gira',
      intro: '* ¡MARCO, REY DE LOS CUADROS se descuelga de la pared!\n* "Toda pintura es un mundo. Todo mundo es una pausa."',
      check: '* MARCO - ATQ 5 DEF 4\n* Un marco dorado con cara. Lleva 30 años colgado chueco.',
      idle: ['* Marco se ladea 15 grados. Luego 30.', '* Huele a óleo y a castillo viejo.', '* "Trescientas ventanas... bueno, ocho cuadros. Presupuesto."'],
      calm: '* Marco se queda derechito por primera vez en años.',
      taunts: ['¡PINCELADAS!', '¡Toda pintura es una pausa!', '¡Léeme aunque esté CHUECO!'],
      acts: [
        { name: 'Colgar', text: 'lo cuelgas derechito en la pared', mercy: 35, reply: '* "Ahh, llevaba 30 años chueco."' },
        { name: 'Admirar', text: 'admiras su arte en silencio', mercy: 30, reply: '* Marco se sonroja. Bueno, se pone más dorado.' },
        { name: 'Pausa', text: 'un cuadro ya es una pausa', mercy: 50, reply: '* "...Eso es cierto. No necesito al morado para eso."' },
      ],
      bullets: { count: 11, interval: 1300, speed: 34, pool: ['pincel', 'óleo', 'marco', '64', 'color', 'cuadro', 'arte', '8', 'rojo', 'azul'] },
      // Los 8 cuadros del castillo (js/scenes/castillo.js). kind = tipo de reto.
      paintings: [
        { name: 'Campo de Bob', word: 'bob', theme: 'bob', kind: 'words', label: 'Calentamiento: escribe las 6 palabras', intro: 'Colinas verdes y una bola negra que salta.\n* ¡Para calentar los dedos!' },
        { name: 'Fortaleza Rápida', word: 'fortaleza', theme: 'fortaleza', kind: 'caps', time: 20000, label: '¡MAYUSCULAS con SHIFT! 6 palabras', intro: 'Aquí las palabras importantes empiezan con mayúscula.\n* ¡Usa SHIFT!' },
        { name: 'Bahía Grande', word: 'bahia', theme: 'bahia', kind: 'phrase', label: 'Una frase larga, con comas', intro: 'Un barco viejo flota en la bahía.\n* Escribe la frase completa, ¡con todo y comas!' },
        { name: 'Montaña Fría', word: 'montaña', theme: 'montana', kind: 'freeze', time: 30000, label: 'Empieza cada palabra en menos de 2 segundos', intro: 'Hace tanto frío que si tardas en EMPEZAR una palabra, se congela.\n* Escribe DERRETIR para salvarla.' },
        { name: 'Caverna de Números', word: 'caverna', theme: 'caverna', kind: 'numbers', label: 'Fila de números: escribe los 8', intro: 'En la oscuridad brillan números.\n* ¡Usa la fila de arriba del teclado!' },
        { name: 'Reloj Tic-Tac', word: 'reloj', theme: 'reloj', kind: 'clock', label: 'Al ritmo del reloj: una palabra por tic', intro: 'Todo aquí se mueve al ritmo del reloj.\n* Una palabra por cada tic-tac.' },
        { name: 'Arcoíris', word: 'arcoiris', theme: 'arcoiris', kind: 'rainbow', time: 30000, label: '¡6 palabras! Un error y la palabra vuelve a empezar', intro: 'Un camino de arcoíris en el cielo.\n* Un solo error... y te resbalas al principio de la palabra.' },
        { name: 'Cuadro del Sótano', word: 'sotano', theme: 'sotano', kind: 'mix', time: 30000, label: 'De todo un poco (mayúsculas con SHIFT)', intro: '¡Aquí está la Nintendo 64, pintada!\n* Un reto con un poco de todo.' },
      ],
      pools: {
        caps: ['Castillo', 'Estrella', 'Isla', 'Marco', 'Mario', 'Yoshi', 'Templo', 'Playa', 'Bahía', 'Princesa', 'Nintendo', 'Cuadro', 'Kart', 'Ocarín', 'Torre', 'Puerta'],
        phrases: [
          'mira el barco, la isla, el faro y las olas de la bahía',
          'el faro gira, el barco flota y la gaviota canta sobre las olas',
          'nado con peces, cangrejos, estrellas y una ballena muy amable',
        ],
        ice: ['helado', 'nieve', 'pingüino', 'iglú', 'frío', 'bufanda', 'hielo', 'trineo', 'copo', 'abrigo', 'gorro', 'invierno'],
        numbers: ['2000', '4 puertos', '8 cuadros', '3 lados', '128', '256', '300', '7 estrellas'],
        accents: ['arcoíris', 'música', 'pingüino', 'corazón', 'niño', 'sueño', 'montaña', 'pequeño', 'árbol', 'cañón', 'rápido', 'fácil', 'polígono', 'teléfono', 'araña'],
        short: ['estrella', 'cuadro', 'castillo', 'flauta', 'templo'],
      },
    },
  },

  treasures: {
    flauta_poligono: { name: 'Flauta Polígono', desc: 'Regalo de Ocarín. Con la Canción de Despertar, hasta lo más dormido abre los ojos.' },
    estrella_120: { name: 'Estrella 120', desc: 'Hay una leyenda sobre 120 estrellas. Tú tienes una. Es suficiente.' },
    camara_amiga: { name: 'Cámara amiga', sprite: 'camaraloca', desc: 'Ahora apunta a donde tú quieres. Milagro.' },
    pak_vibra: { name: 'Pak Vibra', sprite: 'pakito', desc: 'Hace brrr. Es todo. Es suficiente.' },
    palanca_analogica: { name: 'Palanca analógica', desc: 'La primera palanca de Nintendo. Se desgastaba, pero valía la pena.' },
    flauta_repuesto: { name: 'Flauta de repuesto', sprite: 'flauta_poligono', desc: 'Regalo de Ocarín por el concierto. Por si la otra se pierde en el pasto.' },
  },

  quests: {
    mundo_n64: {
      name: 'La Isla Polígono',
      desc: 'Una tubería nueva lleva a una isla... ¡en 3D! El Glitch la dejó a medio dibujar. Rescata la Nintendo 64.',
    },
    estrellas_perfectas: {
      name: 'Las 8 estrellas perfectas',
      desc: 'Completa los 8 cuadros del castillo de Marco sin un solo error.',
      progress: () => `${Object.values((Save.data.n64 || {}).stars || {}).filter((s) => s === 2).length}/8`,
    },
    concierto_ocarin: {
      name: 'El concierto de Ocarín',
      desc: 'Toca las 5 melodías en el templo (Repasar) y llega a 10 notas PERFECTAS en el minijuego Melodías.',
    },
    cuatro_puertos: {
      name: 'Cuatro puertos',
      desc: 'Gana la carrera del Circuito Isla quedando en 1er lugar contra los 3 rivales.',
    },
    camara_atora: {
      name: 'La cámara se atora',
      desc: 'Cámara Loca quiere saber dónde se atora. Busca 4 letreros escondidos en el castillo y escribe lo que dicen.',
      progress: () => `${Object.keys((Save.data.n64 || {}).walls || {}).length}/4`,
    },
  },

  sprites: {
    trianguloso: [
      '................',
      '.......dd.......',
      '......dbbd......',
      '......dbbd......',
      '.....dbbbbd.....',
      '.....dbaabd.....',
      '....dbaaaabd....',
      '....dbaddabd....',
      '...dbbaddabbd...',
      '...dbbbaabbbd...',
      '..dbbbbbbbbbbd..',
      '..dccccccccccd..',
      '.dddddddddddddd.',
      '.....d....d.....',
      '.....d....d.....',
      '....dd....dd....',
    ],
    texturin: [
      '................',
      '..dddddddddddd..',
      '..dbbcbbbbcbbd..',
      '..dbbcbbbbcbbd..',
      '..dccccccccccd..',
      '..dbbbbcbbbbbd..',
      '..dbadbcbbadbd..',
      '..dbddbcbbddbd..',
      '..dccccccccccd..',
      '..dbbcbbbbcbbd..',
      '..dbbcbddbcbbd..',
      '..dccccccccccd..',
      '..dbbbbcbbbbbd..',
      '..dbbbbcbbbbbd..',
      '..dddddddddddd..',
      '................',
    ],
    niebla: [
      '................',
      '................',
      '.....dddd.......',
      '....dbbbbd.ddd..',
      '..dddbbbbbdbbbd.',
      '.dbbbbbbbbbbbbd.',
      'dbbbbbbbbbbbbbbd',
      'dbbddbbbbbddbbbd',
      'dbbbbbbbbbbbbbbd',
      'dbbbbbbccbbbbbbd',
      '.dbbbbbbbbbbbbd.',
      '..dddbbbbbbddd..',
      '.....dddddd.....',
      '................',
      '................',
      '................',
    ],
    camaraloca: [
      '................',
      '................',
      'dd............dd',
      'dbd...dddd...dbd',
      'dbbd.dccccd.dbbd',
      '.dbbdccccccdbbd.',
      '..dddcddddcddd..',
      '....cdbbbbdc....',
      '....dbbaabbd....',
      '....dbaddabd....',
      '....dbaddabd....',
      '....dbbaabbd....',
      '....cdbbbbdc....',
      '....cccccccc....',
      '................',
      '................',
    ],
    pakito: [
      '................',
      '.d............d.',
      'd..dddddddddd..d',
      '.d.dbbbbbbbbd.d.',
      '...daaaaaaaad...',
      '...dbbbbbbbbd...',
      'd..dbadbbadbd..d',
      '.d.dbddbbddbd.d.',
      '...dbbbbbbbbd...',
      '...dbbbddbbbd...',
      'd..dbbbbbbbbd..d',
      '.d.dccccccccd.d.',
      '...dddddddddd...',
      '....dd....dd....',
      '................',
      '................',
    ],
    cactin: [
      '.....dddddd.....',
      '....dbbbbbbd....',
      '.dddddddddddddd.',
      'dbbbbbbbbbbbbbbd',
      '.dddddddddddddd.',
      '.....dccccd.....',
      '.dd..dacacd..dd.',
      'dccd.dccccd.dccd',
      'dccd.dccccd.dccd',
      'dcccddcbbcddcccd',
      '.dddddccccddddd.',
      '.....dccccd.....',
      '.....dccccd.....',
      '.....dccccd.....',
      '...dddddddddd...',
      '...dbbbbbbbbd...',
    ],
    piloto: [
      '................',
      '................',
      '......dddd......',
      '.....dccccd.....',
      '.....dcaacd.....',
      '.....dccccd.....',
      '......dddd......',
      '...dddddddddd...',
      '..dbbbbbbbbbbd..',
      '.dbbbbbbbbbbbbd.',
      'dddddddddddddddd',
      '.dddd......dddd.',
      'dccccd....dccccd',
      'dcaacd....dcaacd',
      '.dddd......dddd.',
      '................',
    ],
    ocarin: [
      '........d.......',
      '.......dcd......',
      '......dccd......',
      '.....dcccd......',
      '....dccccd......',
      '...dddddddddd...',
      '.....daaaad.....',
      '.....dadadd.....',
      '.....daaaadddddd',
      '....dbbddbbd....',
      '...dbbbbbbbbd...',
      '...dbbbbbbbbd...',
      '..dbbbbbbbbbbd..',
      '..dbbbbbbbbbbd..',
      '.dbbbbbbbbbbbbd.',
      '.dddddddddddddd.',
    ],
    marco: [
      'dddddddddddddddd',
      'dccccccccccccccd',
      'dcddddddddddddcd',
      'dcdaaaaaaaaaadcd',
      'dcdaddaaaaddadcd',
      'dcdaddaaaaddadcd',
      'dcdaaaaaaaaaadcd',
      'dcdaaaabbaaaadcd',
      'dcdaabbbbbbaadcd',
      'dcdaaddddddaadcd',
      'dcdaaaaaaaaaadcd',
      'dcdaaaabbaaaadcd',
      'dcdaaaaaaaaaadcd',
      'dcddddddddddddcd',
      'dccccccccccccccd',
      'dddddddddddddddd',
    ],
    estatico: [
      '................',
      '...d..d...d.....',
      '....dddddd..d...',
      '..ddbcbcbcdd....',
      '.dbcbcbcbcbcd...',
      'dcbcadcbcadcbd..',
      '.dbcddcbcddcbcd.',
      'dcbcbcbcbcbcbd..',
      '.dbcbddddcbcbcd.',
      'dcbcbcbcbcbcd...',
      '.ddcbcbcbcbdd...',
      '...dddddddd..d..',
      '.d....d.........',
      '..........d.....',
      '................',
      '................',
    ],
    flauta_poligono: [
      '................',
      '................',
      '................',
      '................',
      '.............dd.',
      '...........ddbd.',
      '.........ddbbd..',
      '.......ddbbad...',
      '.....ddbbabd....',
      '...ddbbabbd.....',
      '.ddbbabbdd......',
      'dbbabbdd........',
      'dbbbdd..........',
      '.ddd............',
      '................',
      '................',
    ],
    estrella_120: [
      '.......dd.......',
      '......dbbd......',
      '......dbbd......',
      '.....dbbbbd.....',
      'ddddddbbbbdddddd',
      'dbbbbbbbbbbbbbbd',
      '.dbbbadbbadbbbd.',
      '..dbbadbbadbbd..',
      '...dbbbbbbbbd...',
      '...dbbbbbbbbd...',
      '..dbbbbddbbbbd..',
      '..dbbbd..dbbbd..',
      '.dbbdd....ddbbd.',
      '.ddd........ddd.',
      '................',
      '................',
    ],
    palanca_analogica: [
      '................',
      '.......dd.......',
      '......dbbd......',
      '......dbad......',
      '......dbbd......',
      '.......dd.......',
      '.......cd.......',
      '.......cd.......',
      '.......cd.......',
      '....dddddddd....',
      '...dccccccccd...',
      '..dcbbbbbbbbcd..',
      '..dcbbbbbbbbcd..',
      '..dccccccccccd..',
      '...dddddddddd...',
      '................',
    ],
  },

  // Música ORIGINAL (§14.2). Todas las voces de cada pista suman los mismos pasos.
  tracks: {
    // Batalla normal N64: Re menor, percusión seca, bajo "slap" (notas cortas), melodía angular.
    n64battle: {
      bpm: 148,
      voices: [
        {
          wave: 'square', vol: 0.03,
          notes: 'D5/2 A4/2 F5/2 D5/2 E5/2 C5/2 G5/4 F5/2 E5/2 D5/2 A5/2 G5/3 F5/1 E5/4 ' +
            'A#4/2 D5/2 F5/2 A#5/2 A5/2 G5/2 F5/2 E5/2 C#5/2 E5/2 A5/4 G5/2 E5/2 C#5/4',
        },
        { wave: 'triangle', vol: 0.1, legato: 0.45, notes: rep('D2 D3 -/2', 4) + ' ' + rep('F2 F3 -/2', 4) + ' ' + rep('A#1 A#2 -/2', 4) + ' ' + rep('A1 A2 -/2', 4) },
        { wave: 'sine', vol: 0.025, legato: 1, notes: 'D4/16 C4/16 A#3/16 A3/16' },
        { wave: 'noise', vol: 0.028, notes: rep('x/2 -/2 x x -/2', 8) },
      ],
    },
    // Circuito Isla: Mi mayor, ritmo de ska (acordes en contratiempo), campanas.
    n64kart: {
      bpm: 160,
      voices: [
        {
          wave: 'square', vol: 0.03,
          notes: 'E5/2 G#5/2 B5/2 G#5/2 A5/2 F#5/2 E5/4 C#5/2 E5/2 F#5/2 G#5/2 A5/3 G#5/1 F#5/4 ' +
            'E5/2 G#5/2 B5/2 C#6/2 B5/2 A5/2 G#5/2 F#5/2 D#5/2 F#5/2 B5/4 A5/2 F#5/2 E5/4',
        },
        { wave: 'square', vol: 0.014, notes: rep('-/2 E4/2', 4) + ' ' + rep('-/2 C#4/2', 4) + ' ' + rep('-/2 E4/2', 4) + ' ' + rep('-/2 D#4/2', 4) },
        { wave: 'triangle', vol: 0.1, notes: rep('E2/2 B2/2', 4) + ' ' + rep('A2/2 E3/2', 4) + ' ' + rep('E2/2 B2/2', 4) + ' ' + rep('B1/2 F#2/2', 4) },
        { wave: 'sine', vol: 0.02, notes: 'B6/2 -/14 G#6/2 -/14 B6/2 -/14 D#6/2 -/14' },
        { wave: 'noise', vol: 0.024, notes: rep('x - - - x - x -', 8) },
      ],
    },
    // Templo de la Melodía: Fa mayor, 3/4 lento (8 compases de 12 pasos), flauta y pad.
    n64temple: {
      bpm: 80,
      voices: [
        {
          wave: 'sine', vol: 0.045, legato: 0.95,
          notes: 'F5/6 A5/3 G5/3 C6/6 A5/6 A#5/4 A5/4 G5/4 F5/9 -/3 ' +
            'D5/6 F5/3 A5/3 G5/6 E5/6 F5/4 G5/4 A5/4 F5/12',
        },
        { wave: 'triangle', vol: 0.05, legato: 1, notes: 'F3/12 F3/12 A#2/12 C3/12 D3/12 C3/12 A#2/12 F2/12' },
        { wave: 'sine', vol: 0.018, legato: 1, notes: 'A4/12 A4/12 D5/12 E5/12 F4/12 E4/12 D4/12 C4/12' },
      ],
    },
    // Estadio Polígono: el reto de Tecloides con "público" (palmadas en 2 y 4) y pads.
    n64estadio: {
      bpm: 165,
      voices: [
        {
          wave: 'square', vol: 0.03,
          intro: '-/4 E5 F5 F#5 G5 G#5 A5 A#5 B5 C6/4',
          notes: 'A5/2 E5/2 A5/2 C6/2 B5/2 G5/2 E5/4 F5/2 A5/2 C6/2 E6/2 D6/3 C6/1 B5/4 ' +
            'A5/2 C6/2 B5/2 A5/2 G5/2 E5/2 F5/2 G5/2 G#5/2 B5/2 E6/4 D6/2 B5/2 A5/4',
        },
        { wave: 'triangle', vol: 0.11, intro: '-/8 E2/8', notes: rep('A2 A3 G3 A3', 4) + ' ' + rep('F2 F3 E3 F3', 4) + ' ' + rep('C3 C4 B3 C4', 4) + ' ' + rep('E2 E3 D3 E3', 4) },
        { wave: 'sine', vol: 0.02, legato: 1, intro: '-/16', notes: 'A3/16 F3/16 C4/16 E3/16' },
        { wave: 'noise', vol: 0.03, intro: 'x x x x -/12', notes: rep('x/2 x/2 x/4 x/2 -/2 x/4', 4) },
      ],
    },
    // Pasillo del castillo: Sol mayor, un vals lento "disfrazado" de 4/4.
    n64castle: {
      bpm: 112,
      voices: [
        {
          wave: 'square', vol: 0.026,
          notes: 'G4/4 B4/2 D5/2 G5/4 F#5/2 E5/2 D5/6 B4/2 C5/4 A4/4 ' +
            'B4/4 D5/2 G5/2 B5/4 A5/2 G5/2 F#5/4 A5/4 G5/8',
        },
        { wave: 'triangle', vol: 0.09, notes: 'G2/4 D3/4 B2/4 D3/4 C3/4 G3/4 A2/4 D3/4 G2/4 D3/4 E3/4 B2/4 D3/4 F#3/4 G2/8' },
        { wave: 'sine', vol: 0.02, legato: 1, notes: 'B3/16 C4/16 B3/16 A3/8 B3/8' },
        { wave: 'noise', vol: 0.015, notes: rep('x -/7', 8) },
      ],
    },
    // Marco, Rey de los Cuadros: el tema del castillo en Sol menor a 150.
    n64marco: {
      bpm: 150,
      voices: [
        {
          wave: 'square', vol: 0.032,
          notes: 'G5/2 D5/2 A#5/2 G5/2 A5/2 F5/2 D5/4 D#5/2 G5/2 C6/2 A#5/2 A5/3 G5/1 F#5/4 ' +
            'G5/2 A#5/2 D6/2 C6/2 A#5/2 A5/2 G5/2 F5/2 D#5/2 D5/2 F#5/2 A5/2 G5/8',
        },
        { wave: 'square', vol: 0.016, notes: rep('G4 D4', 8) + ' ' + rep('D#4 A#3', 8) + ' ' + rep('A#3 F3', 8) + ' ' + rep('D4 A3', 8) },
        { wave: 'triangle', vol: 0.11, notes: rep('G2/2 G3/2', 4) + ' ' + rep('D#2/2 D#3/2', 4) + ' ' + rep('A#1/2 A#2/2', 4) + ' ' + rep('D2/2 D3/2', 4) },
        { wave: 'noise', vol: 0.03, notes: rep('x x - x x/2 x/2', 8) },
      ],
    },
  },
});

// Última vuelta: la misma pista del circuito, más rápida.
TRACKS.n64kart_fast = { ...TRACKS.n64kart, bpm: 188 };
