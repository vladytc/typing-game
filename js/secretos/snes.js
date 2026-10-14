// Secretos jugables del mundo snes: curiosidades con el dato real (ver js/secretos.js).
//
// LA ZONA ESPECIAL (snes_otono). En Super Mario World, al pasar los 8 niveles de la Special Zone
// el mapa se pinta de otoño y los Koopas salen con máscara de Mario. Aquí:
//   1. En las Colinas Dinosaurio, junto al huevo del rincón (37, 20), hay un árbol que no es árbol
//      (38, 20): se puede atravesar. Detrás brilla una estrella (38, 21) que lleva a la Zona Especial.
//      Pista: el PIDGIT (pájaro negro) que anda por ahí, y el árbol mismo si lo revisas.
//   2. Zona Especial ('snes-especial'): un camino de 8 niveles con sus nombres reales (Gnarly...
//      Funky). Al final, la ESTRELLA pone el reto: 8 frases seguidas, con acentos, poco tiempo y
//      máximo 2 errores por frase. Si te caes, vuelves a empezar desde Gnarly.
//   3. Al ganar: flags.snesOtono. Las zonas del Reino 16-Bit se pintan de otoño (Scenes.town.tileCols)
//      y los enemigos parados en el mapa llevan máscara de Mario (Scenes.town.entityCanvas).
//      El Pidgit o la Estrella regresan a la primavera (flags.snesOtonoOff) y otra vez al otoño.

// ---------- Sprites ----------
Object.assign(SPRITES, {
  // La máscara de Mario de los Koopas de otoño (sale en la Sala de Secretos).
  mascara_mario: snesArt([
    '................',
    '.....KKKKKK.....',
    '....KRRRRRRK....',
    '...KRRRWWRRRK...',
    '..KRRRWRRWRRRK..',
    '..KRRRRWWRRRRK..',
    '..KKKKKKKKKKKK..',
    '..KNFFFFFFFFNK..',
    '..KFFWKFFWKFFK..',
    '..KFFFFFFFFFFK..',
    '.KKFFFFIIFFFFKK.',
    '..KKKKKKKKKKKK..',
    '...KKFFFFFFKK...',
    '....KFFFFFFK....',
    '.....KKKKKK.....',
    '................',
  ]),
  // Pájaro negro: en el otoño de aquel juego, las balas de cañón se volvían pájaros así.
  pidgit: snesArt([
    '................',
    '................',
    '......KKKK......',
    '.....KppppK.....',
    '....KpWKpppK....',
    '....KpKKpppKYY..',
    '....KpppppKYYY..',
    '...KKpppppKK....',
    '..KpppPpppppK...',
    '.KpppPPPpppppK..',
    'KppPPPPPppppppK.',
    '.KKpppppppppK...',
    '...KKKKKKKKK....',
    '.....KY..KY.....',
    '....KYY.KYY.....',
    '................',
  ]),
  // La Estrella que cuida el reto de la Zona Especial.
  estrella_esp: snesArt([
    '.......KK.......',
    '......KYYK......',
    '......KWYK......',
    '.....KYWYYK.....',
    'KKKKKKYYYYKKKKKK',
    'KYYWYYYYYYYYYYDK',
    '.KYYYKYYYYKYYDK.',
    '..KYYKYYYYKYDK..',
    '...KYYYYYYYYK...',
    '...KYYYYYYYDK...',
    '..KYYYYKKYYYDK..',
    '..KYYYK..KYYDK..',
    '.KYYK......KDDK.',
    '.KYK........KDK.',
    '.KK..........KK.',
    '................',
  ]),
  // Casillas de la Zona Especial (letras a/b/c/d con la paleta de HUB_ERAS.snes, abajo).
  esp_cielo: rowsOf((x, y) => {
    const r = s16Hash(x, y, 11);
    if (r < 0.025) return 'a';
    if (r < 0.06) return 'b';
    return (y >> 2) % 2 ? 'd' : 'c';
  }),
  // Camino de bloques amarillos flotando en el espacio.
  esp_camino: rowsOf((x, y) => {
    const bx = x % 8;
    const by = y % 8;
    if (bx === 7 || by === 7) return 'd';
    if (bx === 0 || by === 0) return 'a';
    if (bx === 6 || by === 6) return 'c';
    return 'b';
  }),
  // Circulito de nivel, como los del mapa de aquel juego.
  esp_nivel: rowsOf((x, y) => {
    const d = Math.hypot(x + 0.5 - 8, y + 0.5 - 8);
    if (d < 1.6) return 'a';
    if (d < 4.6) return 'b';
    if (d < 5.6) return 'd';
    const bx = x % 8;
    const by = y % 8;
    return bx === 7 || by === 7 ? 'd' : 'c';
  }),
  // Estrella para viajar (fondo transparente: va sobre pasto o sobre cielo).
  esp_estrella: rowsOf((x, y) => {
    const dx = x + 0.5 - 8;
    const dy = y + 0.5 - 8.5;
    const ang = Math.atan2(dy, dx);
    const rr = Math.hypot(dx, dy);
    const edge = 3.4 + 3.4 * Math.max(0, Math.cos(5 * (ang + Math.PI / 2)));
    if (rr > edge) return '.';
    if (rr > edge - 1.1) return 'd';
    return dx + dy < -1 ? 'a' : 'b';
  }),
});

Object.assign(HUB_ERAS.snes.tiles, {
  esp_cielo: { a: '#ffffff', b: '#9be7ff', c: '#1c2468', d: '#150f30' },
  esp_camino: { a: '#fff8e7', b: '#ffd93d', c: '#f2c14e', d: '#8a5a14' },
  esp_nivel: { a: '#ffffff', b: '#e8393d', c: '#ffd93d', d: '#5a0f1a' },
  esp_estrella: { a: '#ffffff', b: '#ffd93d', c: '#f2c14e', d: '#8a5a14' },
});

// ---------- El otoño ----------
const snesOtonoOn = () => !!Save.data.flags.snesOtono && !Save.data.flags.snesOtonoOff;

// Un color "de otoño": los verdes se vuelven naranja y café, la tierra oscura se vuelve verde olivo
// y el agua se pone verde azulado (como en el mapa de aquel juego). Lo demás se queda igual.
const SNES_OTONO_CACHE = {};
function snesOtonoColor(hex) {
  if (typeof hex !== 'string' || !/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  if (SNES_OTONO_CACHE[hex]) return SNES_OTONO_CACHE[hex];
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const dd = max - min;
  let out = hex;
  if (dd > 0.08) {
    const s = dd / (1 - Math.abs(2 * l - 1));
    let h = max === r ? ((g - b) / dd) % 6 : max === g ? (b - r) / dd + 2 : (r - g) / dd + 4;
    h = (h * 60 + 360) % 360;
    let nh = null;
    if (h >= 70 && h < 165) nh = 16 + (h - 70) * 0.3;          // verde → naranja / café
    else if (h >= 12 && h < 40 && l < 0.5) nh = 88;             // tierra oscura → verde olivo
    else if (h >= 185 && h < 225) nh = 172;                     // agua → verde azulado
    if (nh !== null) {
      // HSL → hex
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const xx = c * (1 - Math.abs(((nh / 60) % 2) - 1));
      const m = l - c / 2;
      const [r1, g1, b1] = nh < 60 ? [c, xx, 0] : nh < 120 ? [xx, c, 0] : nh < 180 ? [0, c, xx] : [0, xx, c];
      out = `#${[r1, g1, b1].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('')}`;
    }
  }
  SNES_OTONO_CACHE[hex] = out;
  return out;
}
const snesOtonoCols = (cols) => {
  if (!cols) return cols;
  const out = {};
  Object.keys(cols).forEach((k) => { out[k] = snesOtonoColor(cols[k]); });
  return out;
};

// Máscara chiquita (10 x 8) que se pinta sobre la cara de los enemigos parados en el mapa.
const SNES_MASCARA_MINI = [
  '..KKKKKK..',
  '.KRRWWRRK.',
  'KRRRRRRRRK',
  'KKKKKKKKKK',
  'KFWKFFKWFK',
  'KFFFIIFFFK',
  '.KKKKKKKK.',
  '..KFFFFK..',
];
function snesPaintMask(canvas, sprite) {
  const rows = SPRITES[sprite];
  const g = canvas.getContext && canvas.getContext('2d');
  if (!rows || !g) return;
  const s = canvas.width / 16;
  // Dónde está la cabeza: la primera fila con dibujo y el centro de las 3 filas de arriba.
  const y0 = Math.max(0, rows.findIndex((r) => /[^.]/.test(r)));
  const xs = [];
  rows.slice(y0, y0 + 3).forEach((r) => [...r].forEach((ch, x) => { if (ch !== '.') xs.push(x); }));
  const cx = xs.length ? (Math.min(...xs) + Math.max(...xs) + 1) / 2 : 8;
  const ox = Math.max(0, Math.min(6, Math.round(cx - 5)));
  const oy = Math.max(0, Math.min(8, y0));
  SNES_MASCARA_MINI.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch === '.') return;
    g.fillStyle = SNES_PAL[ch];
    g.fillRect((ox + i) * s, (oy + j) * s, s, s);
  }));
}

// Las zonas se pintan con Scenes.town (js/scenes/town.js), que carga después de este archivo:
// se envuelve cuando ya está todo.
window.addEventListener('DOMContentLoaded', () => {
  const town = Scenes.town;
  if (!town) return;
  const inReino = (sc) => sc.m && sc.m.world === 'snes' && snesOtonoOn();
  const baseCols = town.tileCols;
  town.tileCols = function (sprite, t, era) {
    const cols = baseCols.call(this, sprite, t, era);
    return inReino(this) ? snesOtonoCols(cols) : cols;
  };
  const baseCanvas = town.entityCanvas;
  town.entityCanvas = function (e) {
    const c = baseCanvas.call(this, e);
    if (e.kind === 'foe' && inReino(this)) snesPaintMask(c, e.sprite);
    return c;
  };
});

// Cambia de estación y vuelve a pintar la zona donde estás.
function snesSetOtono(on) {
  Save.data.flags.snesOtonoOff = !on;
  Save.write();
  const sc = Game.scene;
  if (sc === Scenes.town && sc.m) {
    sc.paintMap();
    sc.repaintEntities();
  }
}

// ---------- El árbol que no es árbol y la estrella (Colinas Dinosaurio) ----------
(() => {
  const col = MAPS['snes-colinas'];
  if (!col) return;
  const put = (x, y, ch) => { col.map[y] = col.map[y].slice(0, x) + ch + col.map[y].slice(x + 1); };
  put(38, 20, 'F');   // árbol falso: se ve igual (con un verde apenas distinto) pero se atraviesa
  put(38, 21, 'E');   // la estrella, en el huequito que parecía cerrado
  Object.assign(col.tiles, {
    F: { s: 's16_arbol', look: 'arbolFalso', colors: { a: '#a4ea78', b: '#46c449', c: '#1e7a2e', d: '#0f3d1a' } },
    E: { s: 'esp_estrella', under: 's16_pasto', look: 'estrellaEsp' },
  });
  col.looks.arbolFalso = '* Un árbol redondito.\n* ...Sus hojas son de un verde apenas distinto. Y se mueven sin viento.';
  col.looks.estrellaEsp = '* Una estrella brillando en el pasto.';
  col.exits['38,21'] = { map: 'snes-especial', spawn: [3, 3, 'right'] };
  col.npcs.push({
    id: 'pidgit', sprite: 'pidgit', x: 35, y: 20,
    async talk(ctx) {
      if (!ctx.flag('snesOtono')) {
        const lines = [
          ['* Pío. Este rincón del bosque es muy tranquilo.\n* Solo vengo a cuidar ese huevo. No es mío. Pero me gusta.'],
          ['* Pío. ¿Ya viste el árbol de junto al huevo?\n* Tiene las hojas de otro verde. Como si no fuera árbol de verdad.'],
          ['* Pío. Dicen que detrás de los árboles hay una ZONA ESPECIAL...\n* Con niveles de nombres rarísimos. "Tubular", "Funky"... pío.'],
        ];
        await ctx.say(lines[ctx.counter('snesPidgit') % lines.length], 'PIDGIT');
        return;
      }
      const on = snesOtonoOn();
      await ctx.say([on
        ? '* ¡Pío! Mira nada más: todo el reino de color naranja.\n* En el otoño de aquel juego, las balas de cañón se volvían pájaros negros. ¡Como yo!'
        : '* Pío. Volvió la primavera. Todo verde otra vez.\n* Si extrañas el otoño, dime y lo traigo de regreso.'], 'PIDGIT');
      const i = await ctx.choose([on ? 'primavera' : 'otoño', 'así está bien'], 'PIDGIT');
      if (i === 1) { await ctx.say(['* Pío. Como tú digas.'], 'PIDGIT'); return; }
      Sfx.secret();
      snesSetOtono(!on);
      await ctx.say([on ? '* ¡Pío! Listo: primavera. Los enemigos ya se quitaron sus máscaras.' : '* ¡Pío pío! Otoño otra vez. Y las máscaras, de regreso.'], 'PIDGIT');
    },
  });
})();

// ---------- La Zona Especial ----------
// Los 8 niveles con sus nombres reales (jerga de los años 80) y la frase de cada reto.
const SNES_ESPECIAL = [
  ['GNARLY', 'súbete a la enredadera'],
  ['TUBULAR', 'el globo te lleva muy alto'],
  ['WAY COOL', 'salta de cuerda en cuerda'],
  ['AWESOME', 'el piso está resbaloso'],
  ['GROOVY', 'esquiva al cactus que baila'],
  ['MONDO', 'el agua sube y baja sin parar'],
  ['OUTRAGEOUS', 'corre más rápido que el fuego'],
  ['FUNKY', '¡el último salto es el más difícil!'],
];
const SNES_ESPECIAL_MAP = [
  '####################',
  '####################',
  '####################',
  '##E:1:::2:::3:::4###',
  '#####S##########:###',
  '################:###',
  '###8:::7:::6:::5:###',
  '###:################',
  '###:################',
  '###::::::::::::#####',
  '####################',
  '####################',
  '####################',
  '####################',
  '####################',
];

// El reto: las 8 frases una tras otra. Más de 2 errores o se acaba el tiempo = te caes.
async function snesEspecialReto(ctx) {
  for (let i = 0; i < SNES_ESPECIAL.length; i++) {
    const [name, text] = SNES_ESPECIAL[i];
    const res = await ctx.challenge({ label: `NIVEL ${i + 1}/8 · ${name}`, texts: [text], timeLimit: text.length * 520 + 1500, strict: true });
    if (!res.completed || res.errors > 2) {
      Sfx.lose();
      await ctx.say([
        `* ¡Te caíste en ${name}!${res.completed ? ` (${res.errors} errores: el máximo es 2.)` : ''}`,
        '* En la Zona Especial no hay puntos de control.\n* Cuando quieras, vuelve a empezar desde GNARLY.',
      ], 'ESTRELLA');
      return false;
    }
    Sfx.coin();
  }
  return true;
}

(() => {
  const levels = {};
  const looks = {};
  SNES_ESPECIAL.forEach(([name], i) => {
    levels[String(i + 1)] = { s: 'esp_nivel', look: `nivel${i + 1}` };
    looks[`nivel${i + 1}`] = `* Nivel ${i + 1}: ${name}.\n* El reto de los 8 niveles te espera al final del camino.`;
  });
  const especial = {
    id: 'snes-especial',
    world: 'snes',
    name: 'Zona Especial',
    music: 'snes_map',
    ground: 'esp_cielo',
    map: SNES_ESPECIAL_MAP,
    intro: [
      '* ¿Dónde estamos? ¡Todo es estrellas!',
      '* Creo que es una zona ESPECIAL.\n* En el juego del dinosaurio verde había una así... con 8 niveles dificilísimos.',
    ],
    tiles: {
      '#': { s: 'esp_cielo', solid: true, look: 'cielo' },
      ':': { s: 'esp_camino' },
      E: { s: 'esp_estrella', look: 'estrella' },
      ...levels,
    },
    spawns: { start: [3, 3, 'right'] },
    exits: {
      '2,3': { map: 'snes-colinas', spawn: [38, 19, 'up'] },
    },
    signs: {
      '5,4': ['* ZONA ESPECIAL\n* Ocho niveles. Un solo reto. Sin caerse.', '* Sus nombres son jerga de los años 80.\n* "Tubular" quería decir ¡padrísimo!'],
    },
    looks: {
      ...looks,
      cielo: '* Puro espacio y estrellas.\n* Mejor no te asomes mucho.',
      estrella: '* La estrella de regreso a las Colinas Dinosaurio.',
    },
    bitTips: [
      '* ¡Estamos caminando en el espacio!\n* ...Bueno, en bloques amarillos. Pero en el espacio.',
      '* GNARLY, TUBULAR, FUNKY...\n* ¡Hasta los nombres de los niveles dan miedo!',
      '* La Estrella del fondo pone el reto.\n* Sin errores... o casi.',
    ],
    npcs: [
      {
        id: 'estrella_esp', sprite: 'estrella_esp', x: 14, y: 9,
        async talk(ctx) {
          if (!ctx.flag('snesEstrella')) {
            ctx.setFlag('snesEstrella');
            await ctx.say([
              '* ¡Llegaste! Casi nadie encuentra el camino entre los árboles.',
              '* Esta es la ZONA ESPECIAL: GNARLY, TUBULAR, WAY COOL, AWESOME,\n* GROOVY, MONDO, OUTRAGEOUS y FUNKY.',
              '* El reto: las 8 frases seguidas, con acentos y con poco tiempo.\n* Más de 2 errores en una frase... y te caes.',
              '* Dicen que quien los pasa todos le cambia la estación al reino entero.',
            ], 'ESTRELLA');
          }
          const won = ctx.flag('snesOtono');
          const options = [won ? 'otra vez' : 'jugar'];
          if (won) options.push(snesOtonoOn() ? 'primavera' : 'otoño');
          options.push('después');
          const pick = options[await ctx.choose(options, 'ESTRELLA')];
          if (pick === 'después') { await ctx.say(['* Aquí estaré. Brillando. Es lo que hago.'], 'ESTRELLA'); return; }
          if (pick === 'primavera' || pick === 'otoño') {
            Sfx.secret();
            snesSetOtono(pick === 'otoño');
            await ctx.say([pick === 'otoño' ? '* ¡Otoño otra vez en todo el reino!' : '* Listo: primavera en todo el reino.\n* (Si lo extrañas, el otoño se puede volver a traer.)'], 'ESTRELLA');
            return;
          }
          if (!await snesEspecialReto(ctx)) return;
          Sfx.win();
          if (won) {
            await ctx.say(['* ¡Los 8 niveles otra vez! Tienes los dedos más rápidos del reino.'], 'ESTRELLA');
            return;
          }
          await ctx.say([
            '* ¡¡FUNKY superado!! ¡Pasaste la ZONA ESPECIAL completa!',
            '* ...¿Lo sientes? El aire huele a hojas secas.\n* Al Reino 16-Bit le llegó el OTOÑO.',
            '* Y mira a los enemigos del reino: ¡andan con máscara de Mario!',
          ], 'ESTRELLA');
          ctx.setFlag('snesOtono');
          snesSetOtono(true);
          await findSecret('snes_otono', ctx);
          await ctx.say(['* Si un día extrañas la primavera, dímelo.\n* (O pregúntale al pájaro negro de las Colinas.)'], 'ESTRELLA');
        },
      },
    ],
  };
  MAPS['snes-especial'] = especial;
})();

// ---------- Curiosidad ----------
addCuriosities({
  secreto_snes_otono: {
    console: 'secreto',   // fuera de CONSOLES: solo sale como tarjeta del secreto, no en los álbumes
    title: 'La Zona Especial',
    caption: 'En Super Mario World (1990), si pasas los 8 niveles de la Zona Especial, el mapa se vuelve de otoño: los Koopas usan máscara de Mario y las Plantas Piraña, cabeza de calabaza. ¡Y en esa partida ya no hay vuelta atrás!',
    draw(g, w, h) {
      const C = SNES_PAL;
      const p = pixelArt(g, w, h, 64, 40, '#1c2468');
      // Dos mitades del mismo mapa: primavera (izquierda) y otoño (derecha).
      p.r(2, 4, 28, 22, '#5fd65f').r(34, 4, 28, 22, '#e0892c');
      p.r(2, 22, 28, 4, '#1e7a2e').r(34, 22, 28, 4, '#9a4a14');
      const hill = ['..xxxx..', '.xxxxxx.', 'xxoxxoxx', 'xxxxxxxx'];
      [[5, 12], [18, 9]].forEach(([x, y]) => p.rows(x, y, hill, { x: '#3fbf3f', o: C.K }));
      [[37, 12], [50, 9]].forEach(([x, y]) => p.rows(x, y, hill, { x: '#c0581a', o: C.K }));
      p.r(4, 18, 24, 2, '#3b7bd8').r(36, 18, 24, 2, '#2e9a8a');                 // el río
      p.rows(29, 13, ['x...', 'xx..', 'xxx.', 'xxxx', 'xxx.', 'xx..', 'x...'], { x: C.Y });  // flecha
      // Un Koopa sin caparazón con su máscara de Mario.
      p.rows(26, 27, [
        '...KKKKKK...',
        '..KRRWWRRK..',
        '.KRRRRRRRRK.',
        '.KKKKKKKKKK.',
        '.KFWKFFKWFK.',
        '.KFFFIIFFFK.',
        '..KKKKKKKK..',
        '...KYYYYK...',
        '..KYYKKYYK..',
        '..KOOK.KOOK.',
      ].map((r) => r.padEnd(12, '.')), C);
    },
  },
});
