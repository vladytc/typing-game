// Secretos jugables del mundo n64: curiosidades con el dato real (ver js/secretos.js).
//
// 1) n64_yoshi, "Yoshi en el techo" (Super Mario 64): con las 120 estrellas se abría el cañón junto
//    al foso del castillo y te disparaba al techo, donde Yoshi daba un mensaje de los programadores.
//    Aquí: con la ESTRELLA 120 (las 8 estrellas PERFECTAS de Marco) se abre la reja del cañón que está
//    junto al foso del Castillo de los Cuadros. Te lanza al techo (mapa 'n64-techo'), donde espera
//    Yoshi con un mensaje del equipo y las GALLETAS DE YOSHI (una galleta más en cada combate).
// 2) Huevos de Stop 'n' Swop, parte N64 (Banjo-Kazooie): el huevo rosa, el huevo azul y la llave de
//    hielo están escondidos en rincones de la isla. No sirven para nada... todavía. Se guardan en
//    Save.data.flags.swop; el secreto n64_huevos se descubre en el mundo GameCube, al abrirlos.
//
// Este archivo se carga ANTES que los mapas de la isla (js/worlds/n64-mapa.js) y que el motor 3D
// (poly3d.js, town3d.js), así que lo que toca esos archivos se agrega al terminar de cargar la página.

// ---------- Sprites (museo y modo clásico): paleta fija con rows.pal, se ven igual en cualquier era ----------
const N64_SEC_K = '#202030';
const n64SecArt = (rows, pal) => Object.assign(rows, { pal: { K: N64_SEC_K, ...pal } });

Object.assign(SPRITES, {
  yoshi64: n64SecArt([
    '......KKK.......',
    '.....KWWWK......',
    '....KWWKWKKKK...',
    '....KGWKWGGGGKK.',
    '...KGGGGGGGGGGGK',
    '...KGGGGGGGGGgGK',
    '...KGGGWWWWWGGK.',
    '.RRKGGGKKKKKKK..',
    'RRKGGGWWK.......',
    '.KGGGWWWWK......',
    'KGGRRWWWWK......',
    'KGRRRRWWWK......',
    'KGGGRGWWK.......',
    '.KGGGGGK........',
    '.KOOK.KOOK......',
    'KOOOOKKOOOOK....',
  ], { G: '#58b85c', g: '#2f7d3a', W: '#f4f4f4', R: '#d64545', O: '#f0953c' }),
  canon64: n64SecArt([
    '................',
    '....KKKKKKKK....',
    '...KLKLKLKLKK...',
    '...KDDDDDDDDK...',
    '....KDDDDDDK....',
    '....KDLDDDDK....',
    '....KDLDDDDK....',
    '....KDDDDDDK....',
    '...KDDDDDDDDK...',
    '..KDDDDDDDDDDK..',
    '..KSSSSSSSSSSK..',
    '.KSsSSSsSSSsSSK.',
    '.KSSSSSSSSSSSSK.',
    '.KKKKKKKKKKKKKK.',
    '................',
    '................',
  ], { D: '#3a3a44', L: '#8c8c9c', S: '#e8dcb5', s: '#9a8c7a' }),
  llave_hielo: n64SecArt([
    '................',
    '.....KKKK.......',
    '....KCCCCK......',
    '...KCWKKCCK.....',
    '...KCK..KCK.....',
    '...KCK..KCK.....',
    '...KCCKKCCK.....',
    '....KCCCCK......',
    '.....KCCK.......',
    '.....KCCK.......',
    '.....KCCKKK.....',
    '.....KCCCCCK....',
    '.....KCCKKK.....',
    '.....KCCKK......',
    '.....KCCCCK.....',
    '......KKKK......',
  ], { K: '#3c6c9a', C: '#bfe8ff', W: '#ffffff' }),
});
// Los dos huevos son el mismo dibujo con otros colores. (El huevo genérico del museo, huevo_swop,
// lo dibuja el mundo GameCube en js/secretos/gc.js.)
const N64_HUEVO = [
  '................',
  '......KKKK......',
  '.....KAAAAK.....',
  '....KAWAAAAK....',
  '....KWAABAAK....',
  '...KAAABBAAAK...',
  '...KAAAAAAAAK...',
  '...KABBAAABAK...',
  '...KABBAAAAAK...',
  '...KAAAAABBAK...',
  '...KAAAAABBAK...',
  '....KAAAAAAK....',
  '....KDAAAADK....',
  '.....KDDDDK.....',
  '......KKKK......',
  '................',
];
SPRITES.huevo_rosa = n64SecArt(N64_HUEVO.slice(), { A: '#f48fb1', B: '#d64585', D: '#c2607f', W: '#ffffff' });
SPRITES.huevo_azul = n64SecArt(N64_HUEVO.slice(), { A: '#6fb4f0', B: '#2f6fb8', D: '#3c7cc0', W: '#ffffff' });

const N64_SWOP_NAMES = { huevo_rosa: 'HUEVO ROSA', huevo_azul: 'HUEVO AZUL', llave_hielo: 'LLAVE DE HIELO' };

// ¿Ya se abrió la reja del cañón? (la Estrella 120 = las 8 estrellas perfectas, ver castillo.js)
const n64TechoAbierto = () => !!Save.data.treasures.estrella_120;

// ---------- La tarjeta del secreto ----------
addCuriosities({
  secreto_n64_yoshi: {
    console: 'n64',
    title: 'Yoshi en el techo',
    caption: 'En Super Mario 64, con las 120 estrellas se abría el cañón junto al foso del castillo. Te disparaba al techo, donde Yoshi esperaba con un mensaje de los programadores, 100 vidas y un triple salto mejorado.',
    draw(g, w, h) {
      const C = N64P;
      const p = pixelArt(g, w, h, 64, 40, C.S);
      // Nubes y el castillo: muro de piedra, almenas y dos torres de techo rojo.
      p.r(2, 6, 9, 2, C.W).r(4, 5, 5, 1, C.W).r(50, 9, 10, 2, C.W).r(52, 8, 5, 1, C.W);
      p.r(8, 26, 48, 14, C.L).r(8, 26, 48, 1, C.G);
      for (let x = 8; x < 56; x += 4) p.r(x, 24, 2, 2, C.L);
      [[4, 18], [52, 18]].forEach(([x, y]) => {
        p.r(x, y, 8, 22, C.L).r(x + 3, y + 6, 2, 3, C.K);
        p.rows(x - 1, y - 7, ['....xx....', '...xxxx...', '..xxxxxx..', '.xxxxxxxx.', 'xxxxxxxxxx', 'xxxxxxxxxx', 'xxxxxxxxxx'], { x: C.R });
      });
      // El cañón junto al foso y su rastro de humo hasta el techo.
      p.r(14, 34, 6, 4, C.D).r(15, 31, 4, 3, C.K);
      [[18, 27], [21, 23], [25, 20], [29, 18]].forEach(([x, y], i) => p.r(x, y, 2 - (i % 2), 2 - (i % 2), C.W));
      // Yoshi en el techo (el sprite del museo) con su número famoso.
      const y = SPRITES.yoshi64;
      p.rows(28, 9, y, y.pal);
      pixText(p, 46, 2, '120', C.Y, 1);
      p.rows(42, 2, SPARKLE, { x: C.Y }).rows(58, 14, SPARKLE, { x: C.W });
    },
  },
});

// Quita del mapa (2D y 3D) a un personaje que ya se recogió, sin volver a cargar la zona.
function n64Quitar(id) {
  const sc = Scenes.town;
  const e = (sc.npcs || []).find((n) => n.id === id);
  if (!e) return;
  if (e.el) e.el.remove();
  sc.npcs = sc.npcs.filter((n) => n !== e);
  sc.solids = sc.solids.filter((n) => n !== e);
  const r = sc.r3 && sc.r3.ents && sc.r3.ents.get(e);
  if (r) r.holder.visible = false;
}

// Objeto de Stop 'n' Swop tirado en un rincón: al revisarlo se guarda y desaparece.
const n64Swop = (id, x, y) => ({
  id: `swop-${id}`, sprite: id, x, y,
  when: () => !(Save.data.flags.swop || {})[id],
  async talk(ctx) {
    Save.data.flags.swop = { ...(Save.data.flags.swop || {}), [id]: true };
    Save.write();
    Sfx.coin();
    n64Quitar(`swop-${id}`);
    const n = swopEggs().length;
    await ctx.say([
      `* Encontraste: ${N64_SWOP_NAMES[id]}.\n* Un objeto raro. No parece servir para nada... ¿todavía?`,
      n < SWOP_EGGS.length
        ? `* Lo guardas con cuidado. (${n} de ${SWOP_EGGS.length})\n* Algo te dice que hay más escondidos por la isla.`
        : '* ¡Ya tienes los tres! Y siguen sin servir para nada.\n* ...A menos que en otra consola, más adelante, alguien sepa abrirlos.',
    ]);
  },
});

// ---------- Lo que se agrega cuando ya cargó todo (mapas, motor 3D, combate) ----------
function n64SecretosListos() {
  if (typeof MAPS === 'undefined' || !MAPS['n64-castillo']) return;

  // El cañón junto al foso del castillo (con reja hasta tener la Estrella 120).
  const castillo = MAPS['n64-castillo'];
  castillo.npcs = castillo.npcs || [];
  castillo.npcs.push({
    id: 'canon64', sprite: 'canon64', x: 16, y: 12,
    async talk(ctx) {
      if (!n64TechoAbierto()) {
        await ctx.say([
          '* Un cañón negro junto al foso, tapado con una reja.\n* Apunta directo al techo del castillo.',
          '* En la reja hay una placa chiquita:\n* "SOLO PARA QUIEN TENGA LAS 8 ESTRELLAS... PERFECTAS."',
        ]);
        return;
      }
      if (!ctx.flag('n64Canon')) {
        ctx.setFlag('n64Canon');
        await ctx.say(['* ¡La reja del cañón ya no está!\n* Desde adentro se oye el viento... y algo que dice "¡yoshi!".']);
      }
      if (await ctx.choose(['entrar', 'todavía no']) === 1) return;
      await ctx.say(['* (Te metes al cañón y apuntas al techo del castillo...)\n* ¡¡BUM!!']);
      Sfx.jump();
      Game.go('town', { map: 'n64-techo', spawn: [9, 9, 'up'] });
    },
  });

  // El techo del castillo: una terraza flotando en las nubes, con almenas y cuatro torres.
  MAPS['n64-techo'] = {
    id: 'n64-techo',
    world: 'n64',
    name: 'Techo del Castillo',
    render: '3d',
    view3d: { edge: 'void', fog: [24, 80] },
    intro: ['* ¡WOOOW! ¡Estamos en el TECHO del castillo!\n* Se ve toda la isla... bueno, hasta la niebla.', '* Oye... ¿quién es ese de allá arriba?'],
    music: 'n64castle',
    ground: 'path',
    map: [
      'vvvvvvvvvvvvvvvvvvvv',
      'vvvvvvvvvvvvvvvvvvvv',
      'vvvvAKKKKKKKKKKAvvvv',
      'vvvvKSrrrrrrrrrKvvvv',
      'vvvvKrrrrrrrrrrKvvvv',
      'vvvvKrrrrrrrrrrKvvvv',
      'vvvvKrrrrrrrrrrKvvvv',
      'vvvvKrrrrrrrrrrKvvvv',
      'vvvvKrrrrrrrrrrKvvvv',
      'vvvvKrrrrrrrrrrKvvvv',
      'vvvvKrrrrrrrrrPKvvvv',
      'vvvvAKKKKKKKKKKAvvvv',
      'vvvvvvvvvvvvvvvvvvvv',
      'vvvvvvvvvvvvvvvvvvvv',
      'vvvvvvvvvvvvvvvvvvvv',
    ],
    tiles: {
      ...N64_TILES,
      r: n64T('path', N64_STONE),
      K: n64T('wall', N64_STONE, { solid: true, d3: 'castle', bh: 0.7, look: 'almena' }),
      P: { s: 'pipe' },
    },
    spawns: { start: [9, 9, 'up'] },
    exits: { '14,10': { map: 'n64-castillo', spawn: [16, 13, 'down'] } },
    signs: { '5,3': ['* TECHO DEL CASTILLO\n* Prohibido aventar caparazones desde aquí.', '* (La tubería de la esquina baja al jardín, junto al cañón.)'] },
    looks: {
      ...N64_LOOKS,
      almena: '* Las almenas del techo. Abajo, muy abajo, se ve el foso.\n* Y más abajo... nubes. ¿Cómo que nubes?',
    },
    bitTips: [
      '* ¡Qué alto! Desde aquí el castillo parece un pastel.',
      '* Ese dinosaurio verde se ve MUY contento de verte.\n* Como si te hubiera esperado mucho tiempo.',
    ],
    npcs: [{
      id: 'yoshi64', sprite: 'yoshi64', x: 9, y: 5,
      async talk(ctx) {
        if (!ctx.flag('galletasYoshi')) {
          await ctx.say([
            '* ¡¿De verdad eres tú?! ¡Llevaba muchísimo tiempo esperando aquí arriba!',
            '* Me dijeron que solo llegaría quien juntara TODAS las estrellas.\n* Ya casi me rendía... ¡pero llegaste!',
            '* Tengo un mensaje para ti. Me lo dio el equipo que hizo este juego.\n* Ejem, ejem...',
          ], 'YOSHI');
          await ctx.say([
            '* "Hola. Este juego lo hicimos para ti, una tecla a la vez.\n* Cada chiste, cada nivel y cada secreto los pensamos en ti."',
            '* "Si llegaste hasta este techo es porque no te rendiste.\n* Eso vale más que escribir rápido. (Aunque ya escribes rapidísimo.)"',
            '* "Gracias por jugar. Estamos muy orgullosos de ti.\n* Con mucho cariño: el equipo."',
          ], 'MENSAJE');
          ctx.setFlag('galletasYoshi');
          Sfx.powerup();
          await ctx.say([
            '* ¡Y también te dejaron un regalo!\n* Recibiste: GALLETAS DE YOSHI.',
            '* (Desde ahora tienes una GALLETA PIXEL más en cada combate.)\n* ¡Yoshi! ¡Yoshi!',
          ], 'YOSHI');
          await findSecret('n64_yoshi', ctx);
          return;
        }
        const lines = [
          '* ¡Yoshi! El equipo dice que cada día escribes mejor.',
          '* Desde aquí arriba se ve todo. Hasta el pez de 12 triángulos.',
          '* ¿Te acabaste las galletas? No pasa nada: en cada combate te toca una más.',
          '* Si alguien te pregunta por mí... di que es un secreto. ¡Yoshi!',
        ];
        await ctx.say([lines[ctx.counter('n64Yoshi') % lines.length]], 'YOSHI');
      },
    }],
  };

  // Los objetos de Stop 'n' Swop, en rincones que no están de paso.
  const swop = [['n64-playa', 'huevo_rosa', 3, 3], ['n64-circuito', 'huevo_azul', 1, 1], ['n64-estadio', 'llave_hielo', 2, 4]];
  swop.forEach(([map, id, x, y]) => {
    const m = MAPS[map];
    m.npcs = m.npcs || [];
    m.npcs.push(n64Swop(id, x, y));
  });
  // Pistas suaves de Bit (no dicen qué ni dónde exactamente).
  MAPS['n64-playa'].bitTips.push('* ¿Y si el oso de la islita escondió algo en una esquina de la playa?\n* En su juego había huevos raros que nadie sabía para qué servían.');
  MAPS['n64-circuito'].bitTips.push('* Allá en lo más hondo de la niebla brilló algo azul...\n* ¿O fue mi imaginación? Desde aquí no termina de cargar.');
  MAPS['n64-estadio'].bitTips.push('* En la meseta del cofre se siente un frío raro.\n* ¿Hielo? ¿En una isla flotante?');

  // Modelos low-poly (Poly.models) para el techo, el cañón y los objetos raros.
  if (typeof Poly !== 'undefined') {
    Object.assign(Poly.models, {
      yoshi64(v) {
        const g = new THREE.Group();
        const G = '#58B85C';
        const body = v.mesh(new THREE.IcosahedronGeometry(0.6, 0), G, null, g);
        body.position.y = 0.95;
        body.scale.set(1, 1.1, 0.9);
        const belly = v.mesh(new THREE.IcosahedronGeometry(0.45, 0), N64C.white, null, g);
        belly.position.set(0, 0.9, 0.25);
        const saddle = v.mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.22, 6), N64C.red, null, g);
        saddle.position.set(0, 1.45, -0.12);
        const head = v.mesh(new THREE.IcosahedronGeometry(0.45, 0), G, null, g);
        head.position.set(0, 2.0, 0.12);
        const snout = v.mesh(new THREE.IcosahedronGeometry(0.4, 0), G, null, g);
        snout.position.set(0, 1.88, 0.55);
        snout.scale.set(1.15, 0.9, 1);
        [-0.17, 0.17].forEach((x) => {
          const eye = v.mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.42, 6), N64C.white, null, g);
          eye.position.set(x, 2.38, 0.22);
          const pupil = v.mesh(new THREE.BoxGeometry(0.09, 0.16, 0.06), N64C.black, null, g);
          pupil.position.set(x, 2.42, 0.37);
          const nose = v.mesh(new THREE.BoxGeometry(0.06, 0.06, 0.04), '#2F7D3A', null, g);
          nose.position.set(x * 0.6, 2.0, 0.93);
          const shoe = v.mesh(new THREE.BoxGeometry(0.34, 0.24, 0.5), N64C.orange, null, g);
          shoe.position.set(x * 1.6, 0.12, 0.08);
          const arm = v.mesh(new THREE.BoxGeometry(0.14, 0.14, 0.3), G, null, g);
          arm.position.set(x * 3.2, 1.15, 0.3);
        });
        [[2.25, -0.25], [1.98, -0.4], [1.68, -0.52]].forEach(([y, z]) => {
          const spine = v.mesh(new THREE.ConeGeometry(0.1, 0.24, 4), N64C.red, null, g);
          spine.position.set(0, y, z);
          spine.rotation.x = -0.9;
        });
        // Brinca de gusto, como cuando por fin llegas.
        g.userData.anim = (t) => { g.position.y = Math.abs(Math.sin(t * 2.6)) * 0.3; g.rotation.y = Math.sin(t * 0.8) * 0.3; };
        return g;
      },

      canon64(v) {
        const g = new THREE.Group();
        const base = v.mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.5, 8), '#E8DCB5', null, g);
        base.position.y = 0.25;
        const barrel = v.mesh(new THREE.CylinderGeometry(0.42, 0.52, 1.1, 8), '#3A3A44', null, g);
        barrel.position.y = 1.0;
        const rim = v.mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.14, 8), '#2A2A34', null, g);
        rim.position.y = 1.55;
        if (!n64TechoAbierto()) {
          // La reja: barras grises encima de la boca del cañón.
          [-0.25, 0, 0.25].forEach((o) => {
            v.mesh(new THREE.BoxGeometry(0.08, 0.08, 0.95), '#9A9AA8', null, g).position.set(o, 1.65, 0);
            v.mesh(new THREE.BoxGeometry(0.95, 0.08, 0.08), '#9A9AA8', null, g).position.set(0, 1.65, o);
          });
        } else {
          const hole = v.mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.02, 8), N64C.black, null, g);
          hole.position.y = 1.63;
        }
        return g;
      },

      ...Object.fromEntries(['huevo_rosa', 'huevo_azul'].map((id) => [id, (v) => {
        const pal = SPRITES[id].pal;
        const g = new THREE.Group();
        const egg = v.mesh(new THREE.IcosahedronGeometry(0.3, 1), pal.A, null, g);
        egg.scale.set(1, 1.25, 1);
        [[0.18, 0.12, 0.2], [-0.2, -0.05, 0.18], [0.05, -0.2, -0.26], [-0.1, 0.2, -0.22]].forEach(([x, y, z]) => {
          v.mesh(new THREE.IcosahedronGeometry(0.07, 0), pal.B, null, g).position.set(x, y, z);
        });
        g.userData.anim = (t) => { g.rotation.y = t * 1.2; g.position.y = 0.1 + Math.sin(t * 2.5) * 0.06; };
        return g;
      }])),

      llave_hielo(v) {
        const g = new THREE.Group();
        const ice = v.mat('#BFE8FF', { transparent: true, opacity: 0.85 });
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.07, 4, 8), ice);
        ring.position.y = 0.42;
        g.add(ring);
        const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), ice);
        shaft.position.y = 0.0;
        g.add(shaft);
        [-0.12, -0.24].forEach((y) => { const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.07, 0.1), ice); tooth.position.set(0.12, y, 0); g.add(tooth); });
        g.userData.anim = (t) => { g.rotation.y = t * 1.5; g.position.y = 0.15 + Math.sin(t * 2.2) * 0.06; };
        return g;
      },
    });
  }
  if (typeof T3_MODELS !== 'undefined') Object.assign(T3_MODELS, { yoshi64: 'yoshi64', canon64: 'canon64', huevo_rosa: 'huevo_rosa', huevo_azul: 'huevo_azul', llave_hielo: 'llave_hielo' });

  // Las GALLETAS DE YOSHI: una galleta pixel más en cada combate (como las 100 vidas del original).
  if (Scenes.battle && !Scenes.battle.n64Galletas) {
    const enter = Scenes.battle.enter;
    Scenes.battle.enter = function (...args) {
      enter.apply(this, args);
      if (Save.data.flags.galletasYoshi) this.items += 1;
    };
    Scenes.battle.n64Galletas = true;
  }
}
document.addEventListener('DOMContentLoaded', n64SecretosListos);
