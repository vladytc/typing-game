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

// ---------- Música: ayudas ----------
// Deja una voz "plana" (sin paréntesis ni barras). La copia de Marco del mundo GameCube
// (gcShadowTrack) recorta las voces ficha por ficha y no entiende "( ... )*n" ni la forma.
function n64Flat(s) {
  let out = s;
  let prev;
  do {
    prev = out;
    out = out.replace(/\(([^()]*)\)\s*\*\s*(\d+)/g, (m, body, n) => Array(Number(n)).fill(body).join(' '));
  } while (out !== prev);
  return out.replace(/\|/g, ' ').trim().split(/\s+/).join(' ');
}

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

  // Música ORIGINAL (§14.2), era 'n64': ocarina, cuerdas, bajo cálido y reverb de sala.
  // Todas las melodías son nuevas; solo el ESTILO recuerda a los juegos de la consola.
  // Cada sección (A, B...) tiene 8 compases y todas las voces suman lo mismo (Music.check).
  tracks: {
    // Batalla normal: rock épico en Re menor a 148 (metales, cuerdas en semicorcheas, bajo que
    // bombea). Golpe de entrada y forma A A' B A', 32 compases (~52 s).
    n64battle: (() => {
      const melA = 'D5/4! A4/2 D5/2 F5/4 E5/2 D5/2 | E5/3 F5/1 E5/2 C5/2 A4/6 -/2 | ' +
        'Bb4/2 D5/2 F5/2 Bb5/4 A5/2 G5/2 F5/2 | G5/4 E5/2 C5/2 E5/2 G5/2 C6/2 Bb5/2 | ' +
        'A5/4! F5/2 D5/2 A5/2 Bb5/2 A5/2 F5/2 | G5/3 F5/1 E5/2 F5/2 D5/8 | ' +
        'F5/2 G5/2 A5/2 Bb5/2 D6/4 C6/2 Bb5/2 |';
      const melB = 'C6/6 A5/2 F5/4 A5/4 | G5/6 E5/2 C5/4 E5/2 G5/2 | Bb5/6 G5/2 D5/4 G5/2 Bb5/2 | ' +
        'A5/6 F5/2 D5/4 F5/2 A5/2 | D6/4! C6/2 Bb5/2 F6/4! D6/2 Bb5/2 | E6/4 C6/2 G5/2 C6/2 E6/2 G6/4! | ' +
        'G#5/2 B5/2 D6/2 E6/2 F6/4 E6/2 D6/2 | C#6/2 E6/2 C#6/2 A5/2 E5/2 G5/2 A5/2 C#6/2';
      const cA = ['Dm', 'Dm', 'Bb', 'C', 'Dm', 'Dm', 'Bb', 'A'];
      const cB = ['F', 'C', 'Gm', 'Dm', 'Bb', 'C', 'E7', 'A'];
      const R = { Dm: ['D2', 'A2', 'D3'], Bb: ['Bb1', 'F2', 'Bb2'], C: ['C2', 'G2', 'C3'], A: ['A1', 'E2', 'A2'], F: ['F2', 'C3', 'F3'], Gm: ['G2', 'D3', 'G3'], E7: ['E2', 'B2', 'E3'] };
      const T = { Dm: ['D4', 'F4', 'A4'], Bb: ['D4', 'F4', 'Bb4'], C: ['E4', 'G4', 'C5'], A: ['C#4', 'E4', 'A4'], F: ['F4', 'A4', 'C5'], Gm: ['D4', 'G4', 'Bb4'], E7: ['D4', 'G#4', 'B4'] };
      const CH = { Dm: 'D3+F3+A3', Bb: 'D3+F3+Bb3', C: 'E3+G3+C4', A: 'C#3+E3+A3', F: 'F3+A3+C4', Gm: 'D3+G3+Bb3', E7: 'D3+G#3+B3' };
      const bass = (c) => { const [r, f, o] = R[c]; return `${r}/2. ${r}/2. ${o}/2. ${r}/2. ${r}/2. ${f}/2. ${o}/2. ${f}/2.`; };
      const ost = (c) => { const [a, b, d] = T[c]; return `(${a} ${d} ${b} ${d})*4`; };
      const hit = (c) => `${CH[c]}/3! -/7 ${CH[c]}/2. ${CH[c]}/4`;
      const groove = 'k/2 h/2 s/2 h/2 k/1 k/1 h/2 s/2 h/2';
      const fill = 'k/2 s/1 s/1 t/2 t/2 T/2 T/2 s/2! s/2!';
      const drA = `c+${groove} (${groove})*6 ${fill}`;
      const drB = `c+k/2 o/2 s/2 h/2 k/2 o/2 s/2 h/2 (k/2 o/2 s/2 h/2 k/2 o/2 s/2 h/2)*6 ${fill}`;
      return {
        bpm: 148, vol: 1.4, era: 'n64', intro: ['I'], form: ['A', 'A2', 'B', 'A2'],
        voices: [
          { wave: 'brass', vol: 0.045, vib: { rate: 5.5, depth: 0.2, delay: 0.25 }, parts: {
            I: '-/16',
            A: `${melA} A5/4 E5/2 C#5/2 E5/2 G5/2 A5/2 C#6/2`,
            A2: `${melA} A5/8! C#6/2. E6/2. A5/4`,
            B: melB } },
          { wave: 'brass', vol: 0.02, env: 'stab', poly: true, fx: 0.5, parts: {
            I: 'D3+A3+D4/2! -/2 D3+A3+D4/2! -/2 C3+G3+C4/2! -/2 C#3+E3+A3/4!',
            A: cA.map(hit).join(' '), A2: cA.map(hit).join(' '),
            B: cB.map((c) => `${CH[c]}/4! -/12`).join(' ') } },
          { wave: 'sawtooth', vol: 0.016, env: 'stab', legato: 0.5, fx: 0.4, parts: {
            A: cA.map(ost).join(' '), A2: cA.map(ost).join(' ') } },
          { wave: 'sawtooth', vol: 0.015, env: 'pad', poly: true, unison: 12, parts: {
            B: 'F4+A4+C5/16 E4+G4+C5/16 D4+G4+Bb4/16 D4+F4+A4/16 D4+F4+Bb4/16 E4+G4+C5/16 D4+G#4+B4/16 C#4+E4+A4/16' } },
          { wave: 'triangle', vol: 0.075, fx: 0, parts: {
            I: 'D2/2 -/2 D2/2 -/2 C2/2 -/2 A1/4',
            A: cA.map(bass).join(' '), A2: cA.map(bass).join(' '), B: cB.map(bass).join(' ') } },
          { wave: 'noise', vol: 0.018, fx: 0.2, parts: {
            I: 'c+k/2! -/2 k/2! -/2 k/2! -/2 t/1 t/1 T/2', A: drA, A2: drA, B: drB } },
        ],
      };
    })(),

    // Circuito Isla: calipso de playa en Mi mayor a 160 (tambor de acero, metales a contratiempo
    // como el ska, bajo de calipso). Forma A A' B C A', 40 compases (~60 s). C es el "derrape".
    n64kart: (() => {
      const melA = 'B4/2 E5/2 G#5/3 B5/1 -/2 G#5/2 B5/2 C#6/2 | C#6/3 B5/1 A5/2 E5/2 C#5/4 E5/2 A5/2 | ' +
        'A5/2. A5/2 G#5/2 F#5/2 C#5/2 F#5/2 A5/4 | G#5/3 F#5/1 D#5/2 B4/2 D#5/2 F#5/2 A5/4 | ' +
        'G#5/2 B5/2 E6/3 D#6/1 C#6/2 B5/2 G#5/4 | E5/2 G#5/2 C#6/4 B5/2 G#5/2 E5/4 | ' +
        'A5/2 C#6/2 E6/2 C#6/2 B5/2 D#6/2 F#6/2 D#6/2 |';
      const melB = 'E6/6 C#6/2 A5/4 C#6/4 | D#6/6 B5/2 F#5/4 B5/4 | D#6/3 C#6/1 B5/2 G#5/2 D#5/2 G#5/2 B5/4 | ' +
        'C#6/6 G#5/2 E5/4 C#6/2 D#6/2 | E6/3 C#6/1 A5/2 C#6/2 F#6/4! E6/2 C#6/2 | D#6/3 B5/1 F#5/2 B5/2 D#6/4 F#6/4 | ' +
        'G#6/4! E6/2 B5/2 A6/4! E6/2 C#6/2 | B5/2 A5/2 F#5/2 D#5/2 B4/2 C#5/2 D#5/2 F#5/2';
      const r1 = 'G#5/3 G#5/3 E5/2 C#5/2 -/2 E5/2 G#5/2 | A5/3 A5/3 E5/2 C#5/2 -/2 C#5/2 E5/2 | ' +
        'B5/3 B5/3 G#5/2 E5/2 -/2 G#5/2 B5/2 |';
      const melC = `${r1} D#6/3 C#6/3 B5/2 F#5/2 -/2 G#5/2 A5/2 | ${r1} B4/2 C#5/2 D#5/2 E5/2 F#5/2 G#5/2 A5/2 B5/2!`;
      const cA = ['E', 'A', 'F#m', 'B', 'E', 'C#m', ['A', 'B'], 'E'];
      const cB = ['A', 'B', 'G#m', 'C#m', 'F#m', 'B', ['E', 'A'], 'B'];
      const cC = ['C#m', 'A', 'E', 'B', 'C#m', 'A', 'E', 'B'];
      const R = { E: ['E2', 'B2', 'E3'], A: ['A2', 'E3', 'A3'], 'F#m': ['F#2', 'C#3', 'F#3'], B: ['B1', 'F#2', 'B2'], 'C#m': ['C#2', 'G#2', 'C#3'], 'G#m': ['G#2', 'D#3', 'G#3'] };
      const CH = { E: 'G#3+B3+E4', A: 'A3+C#4+E4', 'F#m': 'A3+C#4+F#4', B: 'A3+D#4+F#4', 'C#m': 'G#3+C#4+E4', 'G#m': 'G#3+B3+D#4' };
      const bars = (list, full, half) => list.map((c) => (Array.isArray(c) ? c.map(half).join(' ') : full(c))).join(' ');
      // Bajo de calipso: "bum... ba-bum" con la quinta al final.
      const bass = (c) => { const [r, f, o] = R[c]; return `${r}/3 ${r}/1 ${f}/2 -/2 ${r}/3 ${o}/1 ${f}/4`; };
      const bassH = (c) => { const [r, f] = R[c]; return `${r}/3 ${r}/1 ${f}/4`; };
      const skank = (c) => `(-/2 ${CH[c]}/2.)*4`;
      const skankH = (c) => `(-/2 ${CH[c]}/2.)*2`;
      const pan2 = (c) => { const n = CH[c].split('+'); return `${n[0]}/4 ${n[1]}/4 ${n[2]}/4 ${n[1]}/4`; };
      const pan2H = (c) => { const n = CH[c].split('+'); return `${n[0]}/4 ${n[2]}/4`; };
      const groove = 'k/2 h/2 s/2 h/1 k/1 k/2 h/2 s/2 o/2';
      const fill = 'k/2 s/1 s/1 t/2 t/2 T/2 T/2 s/2! s/2!';
      const drA = `c+${groove} (${groove})*6 ${fill}`;
      const drC = `k/4 h/2 h/2 s/4 h/2 k/2 (k/4 h/2 h/2 s/4 h/2 k/2)*6 ${fill}`;
      return {
        bpm: 160, vol: 1.3, era: 'n64', form: ['A', 'A2', 'B', 'C', 'A2'],
        voices: [
          // Tambor de acero: armónicos de "lata" y una caída larga.
          { wave: [1, 0.55, 0.12, 0.3, 0, 0.08], vol: 0.04, env: { a: 0.003, d: 0.35, s: 0.3, r: 0.15 }, vib: 'light', parts: {
            A: `${melA} E6/4! -/2 B5/2 G#5/2 E5/2 B4/2 D#5/2`,
            A2: `${melA} E6/6 B5/2 E5/4. -/4`,
            B: melB, C: melC } },
          { wave: 'brass', vol: 0.02, env: 'stab', poly: true, fx: 0.5, parts: {
            A: bars(cA, skank, skankH), A2: bars(cA, skank, skankH), B: bars(cB, skank, skankH), C: bars(cC, skank, skankH) } },
          { wave: 'sawtooth', vol: 0.014, env: 'pad', poly: true, unison: 10, parts: {
            B: bars(cB, (c) => `${CH[c]}/16`, (c) => `${CH[c]}/8`) } },
          { wave: 'bell', vol: 0.02, env: 'bell', transpose: 12, fx: 0.7, parts: {
            A2: bars(cA, pan2, pan2H), C: bars(cC, pan2, pan2H) } },
          { wave: 'triangle', vol: 0.075, fx: 0, parts: {
            A: bars(cA, bass, bassH), A2: bars(cA, bass, bassH), B: bars(cB, bass, bassH), C: bars(cC, bass, bassH) } },
          { wave: 'noise', vol: 0.02, fx: 0.15, parts: { A: drA, A2: drA, B: drA, C: drC } },
        ],
      };
    })(),

    // Templo de la Melodía: vals lento y misterioso en La menor / Do mayor (flauta grave, arpa,
    // coro y campanitas). Va en Do para que las notas de Ocarín (pentatónica de Do, ocarin.js)
    // suenen siempre bien encima. Forma A B A C, 32 compases de 3/4 (~69 s); C deja aire.
    n64temple: (() => {
      const melA = 'E4/6 A4/3 C5/3 | C5/6 A4/3 F4/3 | G4/6 C5/3 E5/3 | D5/9 -/3 | ' +
        'E5/6 D5/3 C5/3 | A4/6 C5/3 F5/3 | E5/4 D5/2 C5/3 A4/3 | B4/9 -/3';
      const melB = 'A4/3 C5/3 F5/6 | G5/6 D5/3 B4/3 | E5/3 G5/3 B5/6 | A5/9 E5/3 | ' +
        'F5/6 E5/3 C5/3 | D5/6 G5/3 B4/3 | C5/12 | -/12';
      const cA = ['Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'Em'];
      const cB = ['F', 'G', 'Em', 'Am', 'F', 'G', 'C', 'C'];
      const H = { Am: ['A2', 'E3', 'A3', 'C4'], F: ['F2', 'C3', 'F3', 'A3'], C: ['C3', 'G3', 'C4', 'E4'], G: ['G2', 'D3', 'G3', 'B3'], Dm: ['D3', 'A3', 'D4', 'F4'], Em: ['E3', 'B3', 'E4', 'G4'] };
      const PAD = { Am: 'A3+C4+E4', F: 'A3+C4+F4', C: 'G3+C4+E4', G: 'G3+B3+D4', Dm: 'A3+D4+F4', Em: 'G3+B3+E4' };
      const ROOT = { Am: 'A2', F: 'F2', C: 'C3', G: 'G2', Dm: 'D3', Em: 'E2' };
      const harp = (c) => { const [a, b, d, e] = H[c]; return `${a}/2 ${b}/2 ${d}/2 ${e}/2 ${d}/2 ${b}/2`; };
      const join = (list, f) => list.map(f).join(' ');
      return {
        bpm: 84, vol: 1.25, era: 'n64', form: ['A', 'B', 'A', 'C'],
        fx: { reverb: { time: 2.6, mix: 0.32 }, filter: { type: 'lowpass', freq: 8000 }, comp: true },
        voices: [
          { wave: 'sine', vol: 0.032, legato: 0.95, vib: 'slow', parts: { A: melA, B: melB, C: '-/96' } },
          // Arpa: armónicos que se apagan solos.
          { wave: [1, 0.45, 0.2, 0.1, 0.05], vol: 0.02, env: { a: 0.002, d: 0.7, s: 0.05, r: 0.4 }, transpose: 12, parts: {
            A: join(cA, harp), B: join(cB, harp), C: join(cA, harp) } },
          { wave: 'vox', vol: 0.011, env: 'swell', poly: true, legato: 1, filter: 2400, parts: {
            A: join(cA, (c) => `${PAD[c]}/12`), B: join(cB, (c) => `${PAD[c]}/12`), C: join(cA, (c) => `${PAD[c]}/12`) } },
          { wave: 'triangle', vol: 0.05, legato: 0.95, fx: 0.2, parts: {
            A: join(cA, (c) => `${ROOT[c]}/12`), B: join(cB, (c) => `${ROOT[c]}/12`), C: join(cA, (c) => `${ROOT[c]}/12`) } },
          { wave: 'bell', vol: 0.016, env: 'bell', parts: {
            B: '-/36 E6/6 A6/6 -/36 G6/6 C7/6', C: '(-/42 G6/3 E6/3)*2' } },
        ],
      };
    })(),

    // Estadio Polígono: rock de estadio en La menor a 165 (metales, guitarra de quintas, bajo en
    // octavas y palmas del público). Sirena de entrada y forma A A' B C A', 40 compases (~58 s).
    n64estadio: (() => {
      const melA = 'E5/2 A5/2 C6/3 B5/1 A5/2 E5/2 A5/4 | F5/2 A5/2 C6/2 F6/2 E6/3 D6/1 C6/4 | ' +
        'B5/3 C6/1 D6/2 B5/2 G5/4 D6/4 | E6/6 D6/2 B5/4 G5/4 | A5/2 C6/2 E6/3 D6/1 C6/2 B5/2 A5/4 | ' +
        'C6/2 A5/2 F5/2 A5/2 C6/2 F6/2 E6/2 C6/2 | D6/3 C6/1 A5/2 F5/2 E5/2 G#5/2 B5/2 D6/2 |';
      const melB = 'A5/6 C6/2 F6/4 E6/4 | D6/6 B5/2 G5/4 B5/4 | G5/2 B5/2 E6/4 D6/2 B5/2 G5/4 | A5/8 C6/2 B5/2 A5/2 G5/2 | ' +
        'F5/2 A5/2 D6/4 F6/4 E6/2 D6/2 | D6/2 G6/4! F6/2 E6/2 D6/2 B5/4 | C6/2 E6/2 G6/4 B5/2 E6/2 G#6/4 | ' +
        'A6/4! G#6/2 E6/2 D6/2 B5/2 G#5/2 E5/2';
      const c3 = 'A5/2. A5/2. C6/2. A5/2. -/4 G5/2 A5/2 | B5/2. B5/2. D6/2. B5/2. -/4 A5/2 B5/2 | ' +
        'C6/2. C6/2. F6/2. C6/2. -/4 B5/2 C6/2 |';
      const melC = `${c3} B5/2. G#5/2. E5/2. G#5/2. B5/2. D6/2. E6/4! | ${c3} E6/2 D6/2 B5/2 G#5/2 E5/2 F#5/2 G#5/2 B5/2`;
      const cA = ['Am', 'F', 'G', 'Em', 'Am', 'F', ['Dm', 'E'], 'Am'];
      const cB = ['F', 'G', 'Em', 'Am', 'Dm', 'G', ['C', 'E'], 'E'];
      const cC = ['Am', 'G', 'F', 'E', 'Am', 'G', 'F', 'E'];
      const R = { Am: ['A2', 'E3', 'A3'], F: ['F2', 'C3', 'F3'], G: ['G2', 'D3', 'G3'], Em: ['E2', 'B2', 'E3'], Dm: ['D2', 'A2', 'D3'], E: ['E2', 'B2', 'E3'], C: ['C2', 'G2', 'C3'] };
      const PC = { Am: 'A3+E4', F: 'F3+C4', G: 'G3+D4', Em: 'E3+B3', Dm: 'D3+A3', E: 'E3+B3', C: 'C4+G4' };
      const CH = { F: 'F4+A4+C5', G: 'G4+B4+D5', Em: 'E4+G4+B4', Am: 'E4+A4+C5', Dm: 'D4+F4+A4', C: 'E4+G4+C5', E: 'E4+G#4+B4' };
      const bars = (list, full, half) => list.map((c) => (Array.isArray(c) ? c.map(half).join(' ') : full(c))).join(' ');
      const bass = (c) => { const [r, f, o] = R[c]; return `${r}/2 ${o}/2 ${r}/2 ${o}/2 ${r}/2 ${o}/2 ${f}/2 ${o}/2`; };
      const bassH = (c) => { const [r, , o] = R[c]; return `${r}/2 ${o}/2 ${r}/2 ${o}/2`; };
      const gtr = (c) => `${PC[c]}/2. ${PC[c]}/2. -/2 ${PC[c]}/2. ${PC[c]}/2. ${PC[c]}/2. -/2 ${PC[c]}/2`;
      const gtrH = (c) => `${PC[c]}/2. ${PC[c]}/2. -/2 ${PC[c]}/2.`;
      const groove = 'k/2 h/2 s+x/2 h/2 k/2 k/2 s+x/2 h/2';
      const fill = 'k/2 s/1 s/1 t/2 t/2 T/2 T/2 s/2! s/2!';
      const drA = `c+${groove} (${groove})*6 ${fill}`;
      const drB = `c+k/2 o/2 s+x/2 o/2 k/2 o/2 s+x/2 o/2 (k/2 o/2 s+x/2 o/2 k/2 o/2 s+x/2 o/2)*6 ${fill}`;
      // El público aplaude a coro en el puente.
      const drC = `k/2 -/2 x/2 -/2 k/2 x/2 x/2 -/2 (k/2 -/2 x/2 -/2 k/2 x/2 x/2 -/2)*6 ${fill}`;
      return {
        bpm: 165, vol: 1.25, era: 'n64', intro: ['I'], form: ['A', 'A2', 'B', 'C', 'A2'],
        voices: [
          { wave: 'brass', vol: 0.045, vib: { rate: 5.5, depth: 0.2, delay: 0.25 }, parts: {
            I: '-/16 E5/1 F5/1 F#5/1 G5/1 G#5/1 A5/1 A#5/1 B5/1 C6/2 B5/2 G#5/4!',
            A: `${melA} C6/2 B5/2 A5/4 -/4 E5/2 G#5/2`,
            A2: `${melA} A5/8! -/2 A4/2 B4/2 C5/2`,
            B: melB, C: melC } },
          // Guitarra de quintas: muchos armónicos y caída rápida.
          { wave: [1, 0.7, 0.5, 0.4, 0.3, 0.25, 0.2, 0.15], vol: 0.02, env: 'pluck', poly: true, fx: 0.3, parts: {
            I: '-/16 E3+B3/16', A: bars(cA, gtr, gtrH), A2: bars(cA, gtr, gtrH), B: bars(cB, gtr, gtrH), C: bars(cC, gtr, gtrH) } },
          { wave: 'sawtooth', vol: 0.014, env: 'pad', poly: true, unison: 12, parts: {
            B: bars(cB, (c) => `${CH[c]}/16`, (c) => `${CH[c]}/8`) } },
          { wave: 'triangle', vol: 0.072, fx: 0, parts: {
            I: '-/16 E2/2 E2/2 E2/2 E2/2 E2/4 E2/4',
            A: bars(cA, bass, bassH), A2: bars(cA, bass, bassH), B: bars(cB, bass, bassH), C: bars(cC, bass, bassH) } },
          { wave: 'noise', vol: 0.019, fx: 0.2, parts: {
            I: 'k/4! k/4! k/4! k/4! s/1 s/1 s/1 s/1 s/2 s/2 t/2 t/2 T/2 T/2!', A: drA, A2: drA, B: drB, C: drC } },
        ],
      };
    })(),

    // Pasillo del castillo: vals señorial en Sol mayor a 112 (3/4 de verdad): ocarina, cuerdas
    // que doblan y luego cantan el puente, arpa en "um-pa-pa" y coro. A A' B A', 32 compases (~51 s).
    n64castle: (() => {
      const mel = 'D5/6 G5/3 B5/3 | B5/6 A5/3 G5/3 | E5/6 G5/3 C6/3 | A5/9 F#5/3 | G5/6 B5/3 D6/3 | D#6/6 B5/3 A5/3 |';
      const melA = `${mel} G5/4 B5/2 E6/3 C#6/3 | D6/6 C6/3 A5/3`;
      const melA2 = `${mel} C6/4 E6/2 D6/3 C6/3 | B5/9 -/3`;
      const melB = 'E6/6 D6/3 B5/3 | G5/6 B5/3 E6/3 | E6/6 D6/3 C6/3 | B5/6 G5/3 D5/3 | ' +
        'C6/6 E6/3 A6/3 | A6/9! F#6/3 | G6/4 D6/2 E6/3 G#5/3 | A5/6 C6/3 F#5/3';
      const cA = ['G', 'Em', 'C', 'D', 'G', 'B7', ['Em', 'A7'], 'D'];
      const cA2 = ['G', 'Em', 'C', 'D', 'G', 'B7', ['Am', 'D7'], 'G'];
      const cB = ['Em', 'Em', 'C', 'G', 'Am', 'D', ['G', 'E7'], ['Am', 'D7']];
      const R = { G: ['G2', 'D3'], Em: ['E2', 'B2'], C: ['C2', 'G2'], D: ['D2', 'A2'], B7: ['B1', 'F#2'], A7: ['A1', 'E2'], Am: ['A1', 'E2'], D7: ['D2', 'A2'], E7: ['E2', 'B2'] };
      const CH = { G: 'G3+B3+D4', Em: 'G3+B3+E4', C: 'G3+C4+E4', D: 'F#3+A3+D4', B7: 'F#3+A3+D#4', A7: 'G3+C#4+E4', Am: 'A3+C4+E4', D7: 'F#3+C4+D4', E7: 'G#3+D4+E4' };
      const PAD = { G: 'B4+D5', Em: 'B4+E5', C: 'C5+E5', D: 'A4+D5', B7: 'A4+D#5', A7: 'A4+C#5', Am: 'A4+C5', D7: 'A4+C5', E7: 'G#4+D5' };
      const bars = (list, full, half) => list.map((c) => (Array.isArray(c) ? c.map(half).join(' ') : full(c))).join(' ');
      const bass = (c) => `${R[c][0]}/4 -/4 ${R[c][1]}/4?`;
      const bassH = (c) => `${R[c][0]}/6`;
      const oompa = (c) => `-/4 ${CH[c]}/4. ${CH[c]}/4.`;
      const oompaH = (c) => `-/2 ${CH[c]}/2. ${CH[c]}/2.`;
      const pad = (c) => `${PAD[c]}/12`;
      const padH = (c) => `${PAD[c]}/6`;
      const dr = '(k/4? h/4? h/4?)*7 k/4? t/4? T/4';
      return {
        bpm: 112, vol: 1.45, era: 'n64', form: ['A', 'A2', 'B', 'A2'],
        voices: [
          { wave: 'square', vol: 0.036, parts: { A: melA, A2: melA2, B: '-/96' } },
          // Cuerdas: doblan la melodía una octava abajo en A' y cantan el puente.
          { wave: 'sawtooth', vol: 0.02, env: { a: 0.06, d: 0.2, s: 0.8, r: 0.25 }, vib: 'light', transpose: -12, parts: {
            A2: melA2, B: melB } },
          { wave: [1, 0.45, 0.2, 0.1, 0.05], vol: 0.022, env: 'pluck', poly: true, parts: {
            A: bars(cA, oompa, oompaH), A2: bars(cA2, oompa, oompaH), B: bars(cB, oompa, oompaH) } },
          { wave: 'vox', vol: 0.014, env: 'pad', poly: true, filter: 2600, parts: {
            B: bars(cB, pad, padH) } },
          { wave: 'triangle', vol: 0.07, fx: 0.2, parts: {
            A: bars(cA, bass, bassH), A2: bars(cA2, bass, bassH), B: bars(cB, bass, bassH) } },
          { wave: 'noise', vol: 0.018, fx: 0.3, parts: { A2: dr, B: `c+${dr}` } },
        ],
      };
    })(),

    // Marco, Rey de los Cuadros: tema de jefe en Sol menor a 150 (órgano, coro, metales y un riff
    // cromático en el bajo). Entrada de 2 compases y A A' B C A', 40 compases (~64 s).
    // Sin acordes ni bemoles y con voces planas: la copia de Marco del mundo GameCube
    // (gcShadowTrack) transporta y recorta estas voces ficha por ficha.
    n64marco: (() => {
      const mel = 'G5/6 D5/2 G5/2 A5/2 A#5/4 | A5/3 G5/1 F#5/2 G5/2 D5/8 | D#5/2 G5/2 A#5/4 D#6/4 D6/2 C6/2 | ' +
        'D6/6 A5/2 F#5/4 D5/4 | G5/4! A#5/2 D6/2 G6/4 F6/2 D#6/2 | D6/3 C6/1 A#5/2 A5/2 G5/8 | ' +
        'C6/2 D#6/2 G6/4 F#6/2 G6/2 D#6/2 C6/2 |';
      const leadA = `${mel} D6/4 C6/2 A5/2 F#5/2 A5/2 C6/2 F#5/2`;
      const leadA2 = `${mel} D6/8! -/2 D5/2 F#5/2 A5/2`;
      const leadB = 'A#5/8 G5/4 D#5/4 | A5/8 F#5/4 D5/4 | G5/4 A5/4 A#5/4 C6/4 | B5/12 D6/4 | ' +
        'D#6/4! D6/2 C6/2 A#5/4 G5/4 | F6/4! D#6/2 D6/2 C6/4 A5/4 | F#6/6 D6/2 A5/4 F#6/4 | ' +
        'G6/4! F#6/2 D#6/2 D6/2 C6/2 A5/2 F#5/2';
      const c4 = 'G5/2. G5/2. A#5/2 A5/2 G5/2 -/2 D6/4 | G5/2. G5/2. A#5/2 A5/2 G5/2 -/2 D#6/4 | ' +
        'C6/2. C6/2. D#6/2 D6/2 C6/2 -/2 G6/4 |';
      const leadC = `${c4} F#6/4 D6/2 A5/2 F#5/4 D5/4 | ${c4} D6/2 C6/2 A#5/2 A5/2 G5/2 F#5/2 D5/2 F#5/2`;
      const cA = ['Gm', 'Gm', 'D#', 'D', 'Gm', 'Gm', 'Cm', 'D'];
      const cB = ['D#', 'D', 'Cm', 'G', 'D#', 'F', 'D', 'D'];
      const cC = ['Gm', 'D#', 'Cm', 'D', 'Gm', 'D#', 'C', 'D'];
      const R = { Gm: ['G2', 'D3', 'G3'], 'D#': ['D#2', 'A#2', 'D#3'], D: ['D2', 'A2', 'D3'], Cm: ['C2', 'G2', 'C3'], F: ['F2', 'C3', 'F3'], G: ['G2', 'D3', 'G3'], C: ['C2', 'G2', 'C3'] };
      const ORG = { Gm: ['G4', 'A#4', 'D5'], 'D#': ['G4', 'A#4', 'D#5'], D: ['F#4', 'A4', 'D5'], Cm: ['G4', 'C5', 'D#5'], F: ['F4', 'A4', 'C5'], G: ['G4', 'B4', 'D5'], C: ['G4', 'C5', 'E5'] };
      // Riff del bajo: golpe, octava, quinta... con empuje de semicorcheas.
      const riff = (c) => { const [r, f, o] = R[c]; return `${r}/2! ${r}/1 ${r}/1 ${o}/2. ${r}/2 ${f}/2! ${r}/2 ${o}/2. ${f}/2`; };
      const org16 = (c) => { const [a, b, d] = ORG[c]; return rep(`${a} ${d} ${b} ${d}`, 4); };
      const org4 = (c) => { const [a, b, d] = ORG[c]; return `${a}/4 ${b}/4 ${d}/4 ${b}/4`; };
      const j = (list, f) => list.map(f).join(' ');
      const g8 = (pat, fill) => `c+${rep(pat, 7)} ${fill}`;
      const fill = 's/1 s/1 s/1 s/1 t/2 t/2 T/2 T/2 s/2! s/2!';
      const drA = g8('k/2 h/2 s/2! h/2 k/1 k/1 k/2 s/2! h/2', fill);
      const drB = g8('k/4 h/2 h/2 s/4! h/2 k/2', fill);
      const drC = g8('k/1 k/1 t/2 s/2 t/2 k/1 k/1 T/2 s/2! T/2', fill);
      const flat = (...secs) => n64Flat(secs.join(' '));
      return {
        bpm: 150, vol: 1.25, era: 'n64',
        voices: [
          { wave: 'brass', vol: 0.048, env: 'soft', vib: { rate: 5.5, depth: 0.22, delay: 0.25 },
            intro: '-/16 D5/2. D5/2. D5/2. F#5/2. A5/2. C6/2. D6/4!',
            notes: flat(leadA, leadA2, leadB, leadC, leadA2) },
          { wave: 'vox', vol: 0.02, env: 'pad', legato: 1, filter: 2600,
            intro: 'G4/16 F#4/16',
            notes: flat('-/128', 'D4/16 D4/16 D#4/16 D4/16 D4/16 D4/16 D#4/16 C4/16',
              'G4/16 F#4/16 G4/16 G4/16 G4/16 A4/16 A4/16 F#4/16',
              'A#4/16 A#4/16 C5/16 A4/16 A#4/16 A#4/16 C5/16 A4/16',
              'D4/16 D4/16 D#4/16 D4/16 D4/16 D4/16 D#4/16 C4/16') },
          { wave: 'organ', vol: 0.014, env: 'organ', legato: 0.6, fx: 0.6,
            intro: 'G4/8 F#4/8 G4/4 A#4/4 D5/4 C#5/4',
            notes: flat(j(cA, org16), j(cA, org16), j(cB, org4), j(cC, org16), j(cA, org16)) },
          { wave: 'warmbass', vol: 0.07, env: 'bass', fx: 0,
            intro: 'G2/8 F#2/8 G2/2. G2/2. G2/2. G2/2. G2/2. G2/2. G2/4',
            notes: flat(j(cA, riff), j(cA, riff), j(cB, riff), j(cC, riff), j(cA, riff)) },
          { wave: 'noise', vol: 0.02, fx: 0.2,
            intro: 'c+k/4! -/4 k/4! -/4 t/2 t/2 t/2 t/2 T/2 T/2 s/2! s/2!',
            notes: [drA, drA, drB, drC, drA].join(' ') },
        ],
      };
    })(),
  },
});

// Última vuelta: la misma pista del circuito, más rápida.
TRACKS.n64kart_fast = { ...TRACKS.n64kart, bpm: 188 };
