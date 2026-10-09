// MUNDO 2 — Castillo 8-Bit (NES, 1985). Diseño en docs/LORE.md §5.
// Zonas: Patio de Ladrillos → Castillo 1 (Kongo Tambor) → Bosque Oscuro (Patos de Letras)
//        → Castillo 2 (Mazmorra de Llaves + Tragabombas) → Ring de la Plaza (Campeón Puñín)
//        → Castillo 3 (Lord Caparazón, rescata la NES).
// Aquí se practican las MAYUSCULAS con SHIFT (nombres propios, inicio de frase) y el punto final.

// Dibujos a todo color (letras de la paleta NES de js/nes-kit.js). Ley del castillo: máximo 3 colores.
const NES_ART = {
  ladrillin: [
    '................',
    '.KKKKKKKKKKKKKK.',
    '.KOOOOOKOOOOOOK.',
    '.KOOOOOKOOOOOOK.',
    '.KKKKKKKKKKKKKK.',
    '.KOKKKOOOOKKKOK.',
    '.KOOOKKOOKKOOOK.',
    '.KOWWWOOOOWWWOK.',
    '.KOWKWOOOOWKWOK.',
    '.KOWWWOOOOWWWOK.',
    '.KOOOOOOOOOOOOK.',
    '.KOOOKKKKKKOOOK.',
    '.KOOKOOOOOOKOOK.',
    '.KKKKKKKKKKKKKK.',
    '..KKK......KKK..',
    '.KKKK......KKKK.',
  ],
  caparacho: [
    '................',
    '................',
    '................',
    '...........SSS..',
    '....GGGGGG.SSGSS',
    '...GWGGGGWGSSSSS',
    '..GGGWWWWGGGSSS.',
    '..GGWGGGGWGGSS..',
    '.GGWGGGGGGWGGS..',
    '.GGWGGGGGGWGG...',
    '.GGGWGGGGWGGG...',
    '.WWWWWWWWWWWWW..',
    '..SSS....SSS....',
    '.SSSS...SSSS....',
    '................',
    '................',
  ],
  bombita: [
    '..........Y.Y...',
    '...........Y....',
    '..........WYY...',
    '.........W......',
    '........W.......',
    '.....KKKKKK.....',
    '...KKKKKKKKKK...',
    '..KKWWKKKKKKKK..',
    '..KWWKKKKKKKKK..',
    '.KKWKKWKKKWKKKK.',
    '.KKKKKWKKKWKKKK.',
    '.KKKKKKKKKKKKKK.',
    '.KKKKKWWWWKKKKK.',
    '..KKKKKKKKKKKK..',
    '...KKKKKKKKKK...',
    '.....KKKKKK.....',
  ],
  patoloco: [
    '................',
    '.........GGGG...',
    '........GGGGGG..',
    '........GGGYGGYY',
    '........GGGGGYYY',
    '.........GGGG...',
    '..........BB....',
    '..BB....BBBB....',
    '.BBBBBBBBBBBB...',
    'BBBBYYYYBBBBBB..',
    '.BBBBYYYBBBBBB..',
    '..BBBBBBBBBBB...',
    '....BBBBBBBB....',
    '......Y..Y......',
    '.....YY.YY......',
    '................',
  ],
  kongo: [
    '.....BBBBBB.....',
    '...BBBBBBBBBB...',
    '..BBBSSSSSSBBB..',
    '..BBSSBSSBSSBB..',
    '..BBSSSSSSSSBB..',
    '.BBBSSBBBBSSBBB.',
    'BBBBBSSSSSSBBBBB',
    'BB.BBBBRRBBBB.BB',
    'BB.BBBBRRBBBB.BB',
    'SS.BBBBRRBBBB.SS',
    'SS.BBBRRRRBBB.SS',
    '...BBBBRRBBBB...',
    '...BBBBBBBBBB...',
    '...BBB....BBB...',
    '..SSSS....SSSS..',
    '................',
  ],
  tragabombas: [
    '................',
    '....GGGGG.......',
    '...GGWGGGG......',
    '..GGGDGGGGG.....',
    '.GGGGGGGGGGG....',
    'WDWDWDGGGGGG....',
    '......GGGGGGG...',
    'WDWDWDGGGGGGGG..',
    '.GGGGGGGDDGGGGG.',
    '...GGGGDDDDGGGGG',
    '...GGGDDDDDDGGGG',
    '....GGDDDDDDGGG.',
    '....GGGGGGGGGG..',
    '....GGG....GGG..',
    '...DDDD...DDDD..',
    '................',
  ],
  punin: [
    '.....KKKKKK.....',
    '....KKKKKKKK....',
    '....SSSSSSSS....',
    '....SKSSSSKS....',
    '....SSSSSSSS....',
    '.....SKKKKS.....',
    '.GG...SSSS...GG.',
    'GGGG.SSSSSS.GGGG',
    'GGGGSSSSSSSSGGGG',
    'GGGG.SSSSSS.GGGG',
    '.GG..SSSSSS..GG.',
    '.....KKKKKK.....',
    '.....KKKKKK.....',
    '.....SS..SS.....',
    '.....SS..SS.....',
    '....KKK..KKK....',
  ],
  caparazon: [
    '...Y.Y.Y........',
    '...YYYYY.RR.....',
    '..GGGGGGRRRR....',
    '.GGRGGGGGRRRR...',
    'YYGGGGGGGGRRR...',
    'YYYYGGGGGGGRR...',
    '.Y.Y.GGGGG.GGG..',
    '.....YYYYGGGGGG.',
    '....YYYYYGGRGGGG',
    '..GGYYYYYGGGGRGG',
    '..GGYYYYYGGRGGGG',
    '....YYYYYGGGGGG.',
    '.....YYYYGGGGG..',
    '....GGG...GGG...',
    '...YGYG..YGYG...',
    '................',
  ],
  paje: [
    '.....WWWWWW.....',
    '...WWRRWWRRWW...',
    '..WRRRRWWRRRRW..',
    '.WWRRWWWWWWRRWW.',
    '.WWWWWWRRWWWWWW.',
    '.RRWWWRRRRWWWRR.',
    '..WWWWWWWWWWWW..',
    '....SSSSSSSS....',
    '....SRSSSSRS....',
    '....SSSSSSSS....',
    '.....SSRRSS.....',
    '....WWWWWWWW....',
    '...SWWRRRRWWS...',
    '....WWWWWWWW....',
    '....RR....RR....',
    '...RRR....RRR...',
  ],
  llave: [
    '................',
    '................',
    '.....KKKK.......',
    '....KYYYYK......',
    '...KYYKKYYK.....',
    '...KYK..KYK.....',
    '...KYYKKYYK.....',
    '....KYYYYK......',
    '.....KYYK.......',
    '.....KYYK.......',
    '.....KYYKKK.....',
    '.....KYYYYK.....',
    '.....KYYKKK.....',
    '.....KYYYYK.....',
    '.....KKKKKK.....',
    '................',
  ],
  ladrillo_dorado: [
    '.KKKKKKKKKKKKKK.',
    'KYYYYYYYYYYYYYYK',
    'KYOYYYYYYYYYYOYK',
    'KYYYYKKKKKYYYYYK',
    'KYYYKKOOOKKYYYYK',
    'KYYYKKOYYKKOYYYK',
    'KYYYYOOYYKKOYYYK',
    'KYYYYYYYKKOOYYYK',
    'KYYYYYYKKOOYYYYK',
    'KYYYYYYKKOYYYYYK',
    'KYYYYYYYOOYYYYYK',
    'KYYYYYYKKYYYYYYK',
    'KYYYYYYKKOYYYYYK',
    'KYOYYYYYOOYYYOYK',
    'KYYYYYYYYYYYYYYK',
    '.KKKKKKKKKKKKKK.',
  ],
  guantes_verdes: [
    '................',
    '................',
    '..KKKK....KKKK..',
    '.KGGGGK..KGGGGK.',
    'KGLLGGGKKGGGLLGK',
    'KGLGGGGKKGGGGLGK',
    'KGGGGGGKKGGGGGGK',
    'KGGGGGGKKGGGGGGK',
    'KGGGGGGKKGGGGGGK',
    '.KGGGGK..KGGGGK.',
    '.KLLLLK..KLLLLK.',
    '.KLLLLK..KLLLLK.',
    '.KKKKKK..KKKKKK.',
    '................',
    '................',
    '................',
  ],
  mapa_mazmorra: [
    '................',
    '................',
    '.KKKKKKKKKKKKKK.',
    '.KWWWWWWWWWWWWK.',
    '.KWKKKWWWKKKWWK.',
    '.KWKWKKKKKWKWWK.',
    '.KWKKKWWWKKKWWK.',
    '.KWWWWWWWWWKWWK.',
    '.KWWWWWWWKKKWWK.',
    '.KWWWWWWWKFKWWK.',
    '.KWWWWWWWKKKWWK.',
    '.KWWWWWWWWWWWWK.',
    '.KKKKKKKKKKKKKK.',
    '................',
    '................',
    '................',
  ],
  cinturon: [
    '................',
    '................',
    '................',
    '................',
    '................',
    'KKKKKKKKKKKKKKKK',
    'RRRRRKYYYYKRRRRR',
    'RRRRKYYKKYYKRRRR',
    'RRRRKYKYYKYKRRRR',
    'RRRRKYYKKYYKRRRR',
    'RRRRRKYYYYKRRRRR',
    'KKKKKKKKKKKKKKKK',
    '................',
    '................',
    '................',
    '................',
  ],
};

// Segundo cuadro del pato (alas arriba), para Patos de Letras.
const PATO_VUELA = NES_ART.patoloco.map((r, i) => ({
  6: '...YYY....BB....', 7: '..BBYYYYBBBB....', 9: 'BBBBBBBBBBBBBB..', 10: '.BBBBBBBBBBBBB..',
}[i] || r));

const NES_SPRITES = nesArt(NES_ART);
// Tesoros que reusan un dibujo del juego con colores dorados.
NES_SPRITES.sprites.cartucho_dorado = SPRITES.cartucho;
NES_SPRITES.palettes.cartucho_dorado = { b: NES.W, c: NES.Y, d: NES.K };
NES_SPRITES.sprites.zapper_dorada = SPRITES.zapper;
NES_SPRITES.palettes.zapper_dorada = { b: NES.W, c: NES.Y, d: NES.K };

// Palabras del mundo (LORE §16): mayúscula inicial y nombres propios.
const WORDS_NES = ['Castillo', 'Ladrillo', 'Tubería', 'Hongo', 'Moneda', 'Bandera', 'Puente', 'Lava', 'Nube',
  'Robot', 'Pato', 'Red', 'Bosque', 'Llave', 'Mazmorra', 'Mapa', 'Bomba', 'Escudo', 'Ring', 'Guante',
  'Campeón', 'Torre', 'Princesa', 'Paje', 'Puerta', 'Cofre', 'Corona', 'Hacha', 'Cuerda', 'Martillo'];

// Los mensajes del hongo-paje al terminar los castillos 1 y 2.
const PAJE_LINES = {
  1: [
    '* ¡Gracias por venir!\n* ...Pero tu consola está en otro castillo.',
    '* Soy el paje. Es mi trabajo decirte que la consola está en otro castillo.\n* ¡Me encanta mi trabajo!',
  ],
  2: [
    '* ¡Gracias! Pero tu consola está en otro...',
    '* Sí, ya sé, ya sé. En OTRO castillo.\n* El tercero. El último. Te lo prometo.',
  ],
};

addWorld({
  id: 'nes',
  order: 2,
  name: 'Castillo 8-Bit',
  theme: 'nes',
  requires: 'gameboy',      // se abre al rescatar la Game Boy
  console: 'nes',
  nodes: ['mario11', 'ladrillin', 'caparacho', 'kongo', 'bombita', 'patoloco', 'patos', 'mazmorra', 'punin', 'caparazon'],
  enemies: {
    mario11: {
      name: 'Mundo 1-1',
      sprite: 'mario',
      mode: 'mario', // nivel de plataformas (js/scenes/mario.js)
      xp: 30,
      blurb: '¡El nivel más famoso de la historia! Mario avanza mientras escribes.',
      keysHint: 'Mayúsculas con SHIFT (Mario, Goomba)',
    },

    // ---------- Patio de Ladrillos ----------
    ladrillin: {
      name: 'Ladrillín',
      sprite: 'ladrillin',
      hp: 45, atk: 3, def: 2, xp: 16,
      caps: true, music: 'nes_battle',
      fightWords: 3,
      words: ['Torre', 'Perro', 'Tipo', 'Puerto', 'Repite', 'Poquito', 'Quiero', 'Tuyo', 'Pero', 'Trote', 'Ropero', 'Pirueta', 'Ladrillo', 'Tubo', 'Retiro'],
      blurb: 'Un bloque de ladrillo con cejas. Se enoja si saltas debajo de él.',
      intro: '* ¡Un Ladrillín bloquea el Patio de Ladrillos!\n* (Aquí las MAYUSCULAS cuentan: usa SHIFT.)',
      check: '* LADRILLIN - ATQ 3 DEF 2\n* Un bloque de ladrillo con cejas. Se enoja si saltas debajo de él.',
      idle: ['* Ladrillín frunce las cejas. También son de ladrillo.', '* Se oye una moneda adentro... ¿o te lo imaginaste?', '* "Aquí todos somos de tres colores. Es la ley del castillo."'],
      calm: '* Ladrillín ya no frunce tanto las cejas.',
      taunts: ['¡No me saltes encima!', '¡Soy de ladrillo macizo!', '¡Ni se te ocurra golpearme desde abajo!'],
      acts: [
        { name: 'Tocar', text: 'tocas el bloque con cuidado', mercy: 40, reply: '* ¡Ting! ...\n* "Ah, eso se sintió bien."' },
        { name: 'Preguntar', text: 'qué guardas adentro', mercy: 35, reply: '* "Una moneda. O un hongo. Nunca sé."' },
        { name: 'Apilar', text: 'apilas tres ladrillos derechitos', mercy: 50, reply: '* "¡Por fin alguien construye en vez de romper!"' },
      ],
      bullets: { count: 9, interval: 1250, speed: 32, pool: 'qwertyuiop'.split('').concat(['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P']) },
      drop: 'ladrillo_dorado',
      keysHint: 'Fila de arriba (Q W E R T Y U I O P) + mayúscula inicial',
    },
    caparacho: {
      name: 'Caparacho',
      sprite: 'caparacho',
      hp: 55, atk: 3, def: 1, xp: 18,
      caps: true, music: 'nes_battle',
      fightWords: 3,
      words: ['Mario', 'Luigi', 'Yoshi', 'Toad', 'Peach', 'Ana', 'Pablo', 'Lucas', 'Diego', 'Sofía', 'Toby', 'Champi', 'Bit', 'Lima', 'Roma', 'Tokio', 'Kioto', 'Chile', 'Perú'],
      blurb: 'Una tortuguita que se mete a su caparazón y patina por todo el patio.',
      intro: '* ¡Caparacho llega patinando dentro de su caparazón!\n* (Los nombres propios llevan MAYUSCULA.)',
      check: '* CAPARACHO - ATQ 3 DEF 1\n* Patina rapidísimo. Nadie le ha preguntado nunca a dónde va.',
      idle: ['* Caparacho da vueltas dentro de su concha.', '* Se escucha un "¡vuuum!" a lo lejos.', '* Caparacho se asoma... y se vuelve a esconder.'],
      calm: '* Caparacho saca la cabeza y te sonríe.',
      taunts: ['¡Patina esto!', '¡Me escondo y no me ves!', '¡Soy más rápido de lo que parezco!'],
      acts: [
        { name: 'Rascar', text: 'le rascas el caparazón', mercy: 45, reply: '* "Más a la izquierda... ahí. AHI."' },
        { name: 'Patinar', text: 'patinas a su lado por el pasillo', mercy: 40, reply: '* ¡Vuuum! Caparacho se ríe dentro de su concha.' },
        { name: 'Devolver', text: 'le devuelves su caparazón perdido', mercy: 50, reply: '* "Oh. Pensé que no volvería a verlo."' },
      ],
      bullets: { count: 9, interval: 1350, speed: 30, pool: ['Ma', 'Lu', 'To', 'Pe', 'Yo', 'Ki', 'Ro', 'Bi', 'Sa', 'Ne', 'Da', 'Li'] },
      keysHint: 'Nombres propios con mayúscula (Mario, Lima...)',
    },

    // ---------- Castillo 1 ----------
    kongo: {
      name: 'Kongo Tambor',
      sprite: 'kongo',
      mode: 'kongo', // js/scenes/kongo.js
      xp: 30,
      blurb: '¡MINIJEFE del Castillo 1! Un gorila con corbata avienta barriles. Escribe para saltarlos y sube las vigas.',
      keysHint: 'Palabras con mayúscula inicial (Barril, Viga)',
    },

    // ---------- Bosque Oscuro ----------
    bombita: {
      name: 'Bombita Mecha',
      sprite: 'bombita',
      hp: 50, atk: 4, def: 0, xp: 20,
      caps: true, music: 'nes_battle',
      fightWords: 4, fightTime: 0.8, // ¡tiene prisa! 20 % menos tiempo
      words: ['Bum', 'Pum', 'Uno', 'Dos', 'Tres', 'mecha', 'chispa', 'fuego', 'humo', 'luz', 'zas', 'Bomba', 'ya', 'corre', 'Fiu'],
      blurb: 'Una bomba con la mecha corta y MUCHA prisa. Aquí hay menos tiempo para escribir.',
      intro: '* ¡Bombita Mecha corre en círculos por el Bosque Oscuro!\n* "¡No hay tiempo! ¡NO HAY TIEMPO!"',
      check: '* BOMBITA MECHA - ATQ 4 DEF 0\n* Siempre tiene prisa. Nadie sabe a dónde va tan rápido.',
      idle: ['* La mecha de Bombita hace fssssss.', '* Bombita mira su reloj. No tiene reloj.', '* Huele a cerillo recién apagado.'],
      calm: '* La mecha de Bombita se apagó solita. Está tranquila.',
      taunts: ['¡Tres... dos...!', '¡No hay tiempo! ¡No hay tiempo!', '¡Fsssss!'],
      acts: [
        { name: 'Soplar', text: 'soplas la mecha hasta apagarla', mercy: 50, reply: '* ...¡Ay! "Qué alivio."' },
        { name: 'Calmar', text: 'respiras hondo con bombita', mercy: 45, reply: '* "Inhala... exhala... ¡Me gusta!"' },
        { name: 'Contar', text: 'cuentas hasta tres muy despacio', mercy: 35, reply: '* "¿Tres? ¡Pensé que era uno!"' },
      ],
      bullets: { count: 11, interval: 950, speed: 40, pool: ['tic', 'tac', 'bum', 'pum', 'ya', 'uno', 'dos', 'tres'] },
      keysHint: 'Palabras cortas contra reloj (20 % menos tiempo)',
    },
    patoloco: {
      name: 'Patoloco',
      sprite: 'patoloco',
      hp: 40, atk: 2, def: 1, xp: 14,
      caps: true, music: 'nes_battle',
      fightWords: 4,
      words: ['Pato', 'cuac', 'pluma', 'Red', 'pan', 'Toby', 'vuela', 'nido', 'ala', 'pico', 'lago', 'Cuac'],
      blurb: 'Un pato que se burla porque nadie le atina nunca. Sus letras caen rapidísimo.',
      intro: '* ¡Patoloco sale volando de un arbusto!\n* "¡Ja ja ja! ¡A que no me atrapas!"',
      check: '* PATOLOCO - ATQ 2 DEF 1\n* Vuela en zigzag. Se ríe de todo, sobre todo de los que fallan.',
      idle: ['* Patoloco hace cuac. Muy fuerte.', '* Una pluma cae despacito.', '* Patoloco vuela en zigzag nada más porque sí.'],
      calm: '* Patoloco te mira de ladito. Ya no se burla tanto.',
      taunts: ['¡Ja ja ja! ¡Fallaste!', '¡Cuac! ¡Muy lento!', '¡Nadie me atrapa!'],
      acts: [
        { name: 'Silbar', text: 'silbas como pato', mercy: 40, reply: '* "¡Cuac! ¿Eres primo mío?"' },
        { name: 'Reír', text: 'te ríes con el pato y no de él', mercy: 50, reply: '* "Nadie se había reído CONMIGO."' },
        { name: 'Pan', text: 'le das un pedazo de pan', mercy: 35, reply: '* "¡Cuac cuac cuac!"' },
      ],
      bullets: { count: 14, interval: 720, speed: 50, pool: 'asdfghjklqwertyuiopzxcvbnm'.split('').concat(['P', 'A', 'T', 'O']) },
      keysHint: 'Letras sueltas muy rápidas (reacción)',
    },
    patos: {
      name: 'Patos de Letras',
      sprite: 'toby',
      mode: 'patos', // js/scenes/patos.js
      xp: 20,
      blurb: 'Toby te acompaña al Bosque Oscuro. Atrapa patos con tu red de letras: ¡escribe la letra de cada pato!',
      keysHint: 'Letras sueltas, reacción rápida',
    },

    // ---------- Castillo 2 ----------
    mazmorra: {
      name: 'Mazmorra de Llaves',
      sprite: 'llave',
      mode: 'mazmorra', // js/scenes/mazmorra.js
      xp: 25,
      blurb: '¡Castillo 2! Una mazmorra de cuartos con puertas que se abren escribiendo frases. Al fondo espera Tragabombas.',
      keysHint: 'Frases con mayúscula y punto final',
    },
    // Minijefe del fondo de la mazmorra: combate normal con bombas (no es nodo del mapa).
    tragabombas: {
      name: 'Tragabombas',
      sprite: 'tragabombas',
      hp: 100, atk: 4, def: 1, xp: 30,
      caps: true, music: 'nes_battle',
      fightWords: 5,
      words: WORDS_NES.filter((w) => w !== 'Bomba'),
      // Cada tercera palabra es "bomba": PERFECTA, Tragabombas se la traga (daño triple). Con errores, explota en tu lado.
      fightList: (words) => words.map((w, i) => (i % 3 === 2 ? 'bomba' : w)),
      fightUnit(unit, dmg, battle) {
        if (unit.text !== 'bomba') return dmg;
        if (unit.errors === 0) {
          battle.floatText('¡SE LA TRAGO!', 'crit');
          return dmg * 3;
        }
        battle.p.hp = Math.max(1, battle.p.hp - scaledDmg(5));
        battle.updateBars();
        battle.shake('.pinfo');
        Sfx.hurt();
        battle.floatText('¡BUM! La bomba explotó de tu lado');
        return 0;
      },
      blurb: 'Un dinosaurio que come bombas.',
      intro: '* ¡TRAGABOMBAS sale de las sombras!\n* "¿Tienes bombas? Me encantan las bombas."\n* (Escribe "bomba" SIN ERRORES y se la tragará.)',
      check: '* TRAGABOMBAS - ATQ 4 DEF 1\n* Come bombas. Escribe "bomba" perfecto y le hará daño triple. ¡A Tragabombas no le gusta el humo!',
      idle: ['* Tragabombas eructa humo.', '* "Es peligroso ir solo. Por eso como acompañado."', '* Huele a pólvora y a zanahoria.'],
      calm: '* Tragabombas se acaricia la panza. Ya está lleno.',
      taunts: ['¿Tienes bombas? ¡Me encantan las bombas!', 'Es peligroso ir solo. Por eso como acompañado.', '¡ÑAM ÑAM!'],
      acts: [
        { name: 'Dieta', text: 'le ofreces una zanahoria', mercy: 35, reply: '* Tragabombas la mastica...\n* "No explota. Pero está rica."' },
        { name: 'Cepillar', text: 'le cepillas los dientes', mercy: 40, reply: '* Huele a menta y a pólvora. Tragabombas sonríe.' },
        { name: 'Mapa', text: 'le muestras la salida del laberinto', mercy: 40, reply: '* "¿Había SALIDA? ¡Llevo años aquí adentro!"' },
      ],
      bullets: { count: 12, interval: 900, speed: 36, pool: 'bombaexplotahumo'.split('').concat(['B', 'U', 'M']) },
      keysHint: 'Mayúsculas + la palabra "bomba" perfecta',
    },

    // ---------- Ring de la Plaza ----------
    punin: {
      name: 'Campeón Puñín',
      sprite: 'punin',
      mode: 'punin', // js/scenes/punin.js
      xp: 30,
      drop: 'guantes_verdes',
      blurb: 'Un boxeador enorme con guantes verdes. Avisa su golpe con una palabra: ¡escríbela para esquivar!',
      keysHint: 'Reacción: escribir el aviso a tiempo',
    },

    // ---------- Castillo 3 ----------
    caparazon: {
      name: 'Lord Caparazón',
      sprite: 'caparazon',
      boss: true,
      mode: 'caparazon', // js/scenes/caparazon.js
      console: 'nes',
      xp: 50,
      blurb: '¡JEFE! El rey tortuga del Castillo 3. Está "trabado": repite su frase como disco rayado. Salta los bloques AL COMPAS.',
      keysHint: 'Palabras al ritmo del metrónomo',
    },
  },

  treasures: {
    superhongo: { name: 'Súper hongo', desc: 'Premio por terminar el Mundo 1-1. Te hace grande... en la vitrina.' },
    ladrillo_dorado: { name: 'Ladrillo dorado', desc: 'Todavía tiene un signo de interrogación. Nadie lo ha golpeado.' },
    zapper_dorada: { name: 'Pistola de luz dorada', desc: 'Regalo de Toby por atrapar 20 patos. Solo brilla en teles de tubo.' },
    guantes_verdes: { name: 'Guantes verdes', desc: 'Los guantes del Campeón Puñín. Huelen a esfuerzo... y un poquito a pies.' },
    mapa_mazmorra: { name: 'Mapa de la mazmorra', desc: 'Regalo del Anciano. Con él, todos los cuartos del Castillo 2 se ven en el minimapa.' },
    cartucho_dorado: { name: 'Cartucho dorado', desc: 'Los cartuchos dorados guardaban tu partida con una pila. ¡Era magia!' },
    cinturon: { name: 'Cinturón de campeón', desc: 'Por esquivar 9 golpes seguidos de Puñín. Dani Turbo no lo puede creer.' },
  },

  sprites: NES_SPRITES.sprites,
  palettes: NES_SPRITES.palettes,

  // Música original al estilo NES (LORE §14): melodía en cuadrada, bajo en triángulo, ruido corto.
  tracks: {
    // Batalla normal NES: Sol menor, riff de 1 compás, acorde nuevo cada 2 compases.
    nes_battle: {
      bpm: 165,
      voices: [
        {
          wave: 'square', vol: 0.03,
          notes: rep('G4 A#4 D5 G5/2 F5 D5/2 A#4 C5 D5/2 A#4 G4/2 F4', 2) + ' ' +
            rep('G4 A#4 D#5 G5/2 F5 D#5/2 A#4 C5 D#5/2 A#4 G4/2 A#4', 2) + ' ' +
            rep('G4 C5 D#5 G5/2 F5 D#5/2 C5 D5 D#5/2 C5 G4/2 C5', 2) + ' ' +
            rep('F#4 A4 D5 F#5/2 E5 D5/2 A4 C5 D5/2 C5 A4/2 F#4', 2),
        },
        { wave: 'triangle', vol: 0.1, notes: rep('G2/2 G3/2', 8) + ' ' + rep('D#2/2 D#3/2', 8) + ' ' + rep('C2/2 C3/2', 8) + ' ' + rep('D2/2 D3/2', 8) },
        { wave: 'noise', vol: 0.024, notes: rep('x -/3 x/2 x/2 x -/3 x/2 x/2', 8) },
      ],
    },
    // Kongo Tambor: Mi menor, los tambores mandan (bombo-caja-bombo-bombo-caja).
    kongo: {
      bpm: 132,
      voices: [
        { wave: 'square', vol: 0.03, notes: 'E5/2 -/2 G5/2 -/2 A5/2 G5/2 E5/4 D5/2 -/2 E5/2 -/2 G5/2 E5/2 D5/4 E5/2 -/2 G5/2 -/2 A5/2 G5/2 E5/4 B4/2 -/2 D5/2 -/2 E5/8' },
        { wave: 'triangle', vol: 0.14, notes: rep('E2/2 -/6 E2/2 E2/2 -/4', 4) },
        { wave: 'noise', vol: 0.035, notes: rep('-/4 x/2 -/6 x/2 -/2', 4) },
      ],
    },
    // Mazmorra de Llaves: La menor, misteriosa; la segunda voz es el eco un tiempo después.
    mazmorra: {
      bpm: 100,
      voices: [
        { wave: 'square', vol: 0.03, notes: 'A4/4 C5/4 E5/4 D5/4 C5/4 B4/4 G#4/8 A4/4 E5/4 F5/4 E5/4 D5/4 C5/4 B4/8' },
        { wave: 'square', vol: 0.012, notes: '-/4 A4/4 C5/4 E5/4 D5/4 C5/4 B4/4 G#4/8 A4/4 E5/4 F5/4 E5/4 D5/4 C5/4 B4/4' },
        { wave: 'triangle', vol: 0.1, notes: 'A2/16 F2/16 D2/16 E2/16' },
        { wave: 'noise', vol: 0.015, notes: rep('x -/15', 4) },
      ],
    },
    // Campeón Puñín: Si bemol mayor, fanfarria de gimnasio con silencios para los avisos.
    punin: {
      bpm: 170,
      voices: [
        { wave: 'square', vol: 0.03, notes: 'A#4 D5 F5 A#5/5 -/2 A5 A#5/2 G5/2 F5 D#5/2 F5/2 G5/2 A5/2 A#5/4 -/4 C5 D#5 G5 C6/5 -/2 A#5 C6/2 A5/2 F5 G5/2 A5/2 A#5/2 C6/2 A#5/4 -/4' },
        { wave: 'square', vol: 0.014, notes: 'D5/8 -/8 G4/8 -/8 D#5/8 -/8 F5/8 -/8' },
        { wave: 'triangle', vol: 0.1, notes: rep('A#2 A#3', 8) + ' ' + rep('D#2 D#3', 8) + ' ' + rep('C3 C4', 8) + ' ' + rep('F2 F3', 8) },
        { wave: 'noise', vol: 0.025, notes: rep('x -/3 x/2 -/2', 8) },
      ],
    },
    // Patos de Letras: Do mayor, saltarina, de campo.
    patos: {
      bpm: 150,
      voices: [
        { wave: 'square', vol: 0.03, notes: 'C5 E5 G5 E5 C5/2 G4/2 A4 C5 E5 C5 A4/4 F4 A4 C5 A4 F4/2 C5/2 B4 G4 D5 B4 G4/4 C5 E5 G5 E5 C5/2 G4/2 A4 C5 E5 C5 A4/4 D5 C5 B4 A4 G4/2 B4/2 C5/8' },
        { wave: 'triangle', vol: 0.1, notes: rep('C3/2 G3/2', 4) + ' ' + rep('F2/2 C3/2', 4) + ' ' + rep('C3/2 G3/2', 4) + ' ' + rep('G2/2 D3/2', 2) + ' C3/8' },
        { wave: 'noise', vol: 0.02, notes: rep('x -/3 x/2 -/2', 8) },
      ],
    },
    // Lord Caparazón: Do menor, grandiosa y con pulso marcado (el metrónomo del jefe).
    caparazon1: {
      bpm: 120,
      voices: [
        { wave: 'square', vol: 0.032, notes: 'C5/4 D#5/4 G5/6 F5/2 D#5/4 D5/4 C5/4 G4/4 G#4/4 C5/4 D#5/6 D5/2 C5/4 D5/4 B4/8' },
        { wave: 'square', vol: 0.014, notes: 'G4/16 G4/16 D#4/16 D4/16' },
        { wave: 'triangle', vol: 0.12, notes: 'C3/4 C3/4 C3/4 C3/4 C3/4 C3/4 G2/4 G2/4 G#2/4 G#2/4 G#2/4 G#2/4 G2/4 G2/4 G2/4 G2/4' },
        { wave: 'noise', vol: 0.03, notes: rep('x -/3', 16) },
      ],
    },
  },

  quests: {
    // mundo_<id> se activa sola cuando Bit anuncia la tubería nueva.
    mundo_nes: {
      name: 'El Castillo 8-Bit',
      desc: 'Una tubería nueva lleva a un mundo de ladrillos y bloques ?. Cruza los tres castillos y rescata la NES.',
    },
    patos_toby: {
      name: 'Los patos de Toby',
      desc: 'Toby quiere ver cuántos patos atrapas con tu red de letras en el Bosque Oscuro. ¡Atrapa 20!',
      progress: () => `${Math.min(20, Save.data.flags.nesDucks || 0)}/20`,
    },
    tres_llaves: {
      name: 'Las tres llaves',
      desc: 'Encuentra las 3 llaves de la Mazmorra del Castillo 2 y muéstraselas al Anciano del pueblo.',
      progress: () => `${[1, 2, 3].filter((n) => Save.data.flags[`nesKey${n}`]).length}/3`,
    },
    record_ring: {
      name: 'Récord de ring',
      desc: 'Vence al Campeón Puñín esquivando 9 golpes seguidos sin fallar.',
      progress: () => `Mejor racha: ${Save.data.flags.nesBestStreak || 0}`,
    },
  },
});

// Variaciones del jefe: más rápida en la fase 2; en la fase 3 se "traba" (nota repetida cada 4 compases).
TRACKS.caparazon2 = { ...TRACKS.caparazon1, bpm: 135 };
TRACKS.caparazon3 = {
  bpm: 150,
  voices: TRACKS.caparazon1.voices.map((v, i) => (i === 0
    ? { ...v, notes: 'C5/4 D#5/4 G5/6 F5/2 D#5/4 D5/4 C5/4 G4/4 G#4/4 C5/4 D#5/6 D5/2 C5/4 D5/4 B4 B4 B4 B4 -/4' }
    : v)),
};
