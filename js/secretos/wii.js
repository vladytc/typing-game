// Secretos jugables del mundo wii: curiosidades con el dato real (ver js/secretos.js).
//
// wii_espejo, "El mundo al espejo": en Twilight Princess (2006) la versión de Wii es un espejo
// de la de GameCube, para que Link blandiera la espada con la derecha, como el jugador el control.
// En la Ciudad Sensor: en la esquina del parque de la Plaza Canal hay un espejo de cuerpo entero.
// Si lo tocas, entras a la PLAZA LANAC: la misma plaza volteada de izquierda a derecha (el mismo
// arreglo del mapa, cada renglón al revés; el 3D la dibuja igual que a las demás). Ahí, justo donde
// del otro lado está el cofre, hay una espada clavada que solo existe en el lado espejo.
// Tomarla descubre el secreto; el espejo de allá te regresa.
//
// Este archivo se carga ANTES que js/worlds/wii-mapa.js (los mapas, las casillas y el 3D de la
// ciudad), así que lo que depende de ellos se arma en DOMContentLoaded (todavía antes de que
// arranque el juego: main.js espera la fuente).

// ---------- Sprites: el espejo (museo y 2D) y la espada en su pedestal ----------
Object.assign(SPRITES, {
  espejo: wiiArt([
    '.....KKKKKK.....',
    '....KWWWWWWK....',
    '...KWSSSSSLWK...',
    '..KWSLSSSSSSWK..',
    '..KWSSLSSSSSWK..',
    '..KWSSSLSSSSWK..',
    '..KWSSSSSSSSWK..',
    '..KWSSSSSSLSWK..',
    '..KWSSSSSLSSWK..',
    '..KWSSSSLSSSWK..',
    '...KWSSSSSSWK...',
    '....KWWWWWWK....',
    '......KGGK......',
    '......KGGK......',
    '....KKGGGGKK....',
    '....KGGGGGGK....',
  ]),
  wii_espada_espejo: wiiArt([
    '.......KK.......',
    '......KWWK......',
    '......KWLK......',
    '......KWLK......',
    '......KWLK......',
    '......KWLK......',
    '......KWLK......',
    '....KKKWLKKK....',
    '....KNBBBBNK....',
    '.....KKBBKK.....',
    '......KNNK......',
    '......KNNK......',
    '......KYYK......',
    '...KKKKKKKKKK...',
    '..KLLLLLLLLLLK..',
    '..KGGGGGGGGGGK..',
  ]),
});

// Música: la de la plaza, tocada al revés (wiiReverse, js/worlds/wii.js). Sigue siendo original.
TRACKS.wii_espejo = wiiReverse(TRACKS.wii_map);

// ---------- La tarjeta del secreto ----------
addCuriosities({
  secreto_wii_espejo: {
    console: 'wii',
    title: 'El mundo al espejo',
    caption: 'Twilight Princess (2006) salió en GameCube y en Wii. En la de Wii TODO el mundo está volteado como espejo: así Link blande la espada con la derecha, igual que tú el control. En GameCube, Link es zurdo, como siempre.',
    draw(g, w, h) {
      const C = WIIP;
      const p = pixelArt(g, w, h, 64, 40, C.W);
      p.r(0, 33, 64, 7, C.L);
      // Link de GameCube (izquierda): espada en su mano izquierda, que se ve a NUESTRA derecha.
      const link = [
        '....VVVV......',
        '...VVVVVV.....',
        '..VVYYYYVV....',
        '..YFFFFFFY....',
        '...FKFFKF.....',
        '...FFFFFF.....',
        '..VVVVVVVV.GG.',
        '.FVVVVVVVVFG..',
        '.F.VVNNVV.FG..',
        '...VVVVVV.F...',
        '...VV..VV.....',
        '...NN..NN.....',
        '..NNN..NNN....',
      ];
      const pal = { V: C.V, Y: C.Y, F: C.F, K: C.K, N: C.N, G: C.G };
      p.rows(13, 18, link, pal);
      // El espejo en medio y, del otro lado, el mismo Link volteado: la espada en la derecha.
      p.r(31, 4, 2, 32, C.G).r(30, 4, 1, 32, C.S);
      p.rows(37, 18, link.map((r) => [...r].reverse().join('')), pal);
      // Arriba de cada uno, su control: el de cubo (morado) y el de la Wii (blanco).
      p.shape(14, 6, 10, 6, C.M, C.K, (i, j) => !(j < 2 && i > 3 && i < 6));
      p.r(16, 8, 2, 2, C.G).r(20, 8, 2, 2, C.V);
      p.r(42, 4, 4, 12, C.W).r(41, 4, 1, 12, C.G).r(46, 4, 1, 12, C.G).r(41, 3, 6, 1, C.G).r(41, 16, 6, 1, C.G);
      p.r(43, 6, 2, 2, C.G).r(43, 10, 2, 2, C.S);
      p.rows(56, 4, SPARKLE, { x: C.Y });
    },
  },
});

// ---------- El mundo al espejo (se arma cuando ya cargó js/worlds/wii-mapa.js) ----------
window.addEventListener('DOMContentLoaded', () => {
  const plaza = typeof MAPS !== 'undefined' && MAPS['wii-plaza'];
  if (!plaza || typeof WII_TILES === 'undefined') return;

  const W = Math.max(...plaza.map.map((r) => r.length));
  const flipX = (x) => W - 1 - x;
  const flipKey = (k) => { const [x, y] = k.split(',').map(Number); return `${flipX(x)},${y}`; };
  const backwards = (s) => s.split('\n').map((l) => [...l].reverse().join('')).join('\n');
  const MIRROR = [25, 17]; // el espejo de la plaza (esquina del parque, junto a los árboles)
  const SWORD = [3, 7];    // la espada: el reflejo del cofre del Control Clásico (24, 7)

  // Modelo 3D del espejo: marco blanco ovalado, vidrio azul cielo que brilla y una base gris.
  const mirrorModel = (v) => {
    const g = new THREE.Group();
    const frame = v.s(new THREE.TorusGeometry(0.75, 0.12, 10, 28), WIIC.white, g);
    frame.position.y = 1.55;
    frame.scale.set(1, 1.45, 1);
    const glassMat = new THREE.MeshPhongMaterial({ color: '#CFEFFF', shininess: 120, specular: 0xffffff, emissive: '#5BC0EB', emissiveIntensity: 0.25 });
    const glass = v.s(new THREE.CircleGeometry(0.72, 28), glassMat, g);
    glass.position.set(0, 1.55, 0.02);
    glass.scale.set(1, 1.45, 1);
    // Rayitas de brillo en diagonal (como el sprite).
    [[-0.25, 1.95], [0.2, 1.2]].forEach(([x, y]) => {
      const s = v.s(new THREE.PlaneGeometry(0.08, 0.5), WIIC.white, g);
      s.position.set(x, y, 0.04);
      s.rotation.z = 0.6;
    });
    const leg = v.s(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8), WIIC.gray, g);
    leg.position.y = 0.25;
    const foot = v.s(new THREE.CylinderGeometry(0.45, 0.5, 0.12, 16), WIIC.gray, g);
    foot.position.y = 0.06;
    g.userData.anim = (t) => { glassMat.emissiveIntensity = 0.2 + (Math.sin(t * 1.6) + 1) * 0.12; };
    return g;
  };

  // La espada en su pedestal (sin espada si ya la tomaste).
  const swordModel = (v) => {
    const g = new THREE.Group();
    const base = v.s(new THREE.CylinderGeometry(0.75, 0.85, 0.5, 16), WIIC.light, g);
    base.position.y = 0.25;
    const top = v.s(new THREE.CylinderGeometry(0.6, 0.7, 0.2, 16), WIIC.gray, g);
    top.position.y = 0.6;
    if (typeof secretFound === 'function' && secretFound('wii_espejo')) return g;
    const sword = new THREE.Group();
    sword.position.y = 0.7;
    g.add(sword);
    const blade = v.s(new THREE.BoxGeometry(0.16, 1.5, 0.05), WIIC.white, sword);
    blade.position.y = 0.6;
    const guard = v.s(new THREE.BoxGeometry(0.7, 0.12, 0.14), WIIC.blue, sword);
    guard.position.y = 1.4;
    const grip = v.s(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 8), WIIC.navy, sword);
    grip.position.y = 1.66;
    const knob = v.s(WiiPoly.sphere(0.1, 10, 8), WIIC.yellow, sword);
    knob.position.y = 1.9;
    g.userData.anim = (t) => { sword.rotation.y = Math.sin(t * 0.8) * 0.25; };
    return g;
  };

  // Tocar el espejo: de la plaza al lado espejo, y de regreso.
  const touchMirror = (to, spawn, lines) => async (ctx) => {
    await ctx.say(lines);
    const i = await ctx.choose(['tocar el espejo', 'mejor no']);
    if (i !== 0) return;
    const sc = Game.scene;
    sc.mode = 'busy';
    Sfx.warp();
    $('.town').classList.add('fade');
    await new Promise((r) => setTimeout(r, 400));
    if (Game.scene === sc) Game.go('town', { map: to, spawn });
  };

  // ---------- En la Plaza Canal: el espejo y la pista de Bit ----------
  plaza.npcs.push({
    id: 'wii_espejo', sprite: 'espejo', x: MIRROR[0], y: MIRROR[1],
    wiiModel: mirrorModel,
    talk: touchMirror('wii-espejo', [flipX(MIRROR[0]) + 1, MIRROR[1], 'right'], [
      '* Un espejo de cuerpo entero, escondido entre los árboles del parque.',
      '* Tu reflejo levanta el control con la mano IZQUIERDA.\n* ...Tú lo tienes en la DERECHA. ¿O no?',
    ]),
  });
  plaza.bitTips.push('* Dicen que en esta ciudad hay un lugar donde los zurdos se vuelven diestros.\n* ...¿Qué querrá decir eso?');

  // ---------- PLAZA LANAC: la Plaza Canal al espejo ----------
  const signs = {};
  Object.entries(plaza.signs).forEach(([k, pages]) => {
    const first = [].concat(typeof pages === 'function' ? pages() : pages)[0];
    signs[flipKey(k)] = [backwards(first), '* (Está escrito al revés. Como si lo leyeras en un espejo.)'];
  });

  MAPS['wii-espejo'] = {
    id: 'wii-espejo',
    world: 'wii',
    name: 'Plaza Lanac',
    render: '3d',
    view3d: plaza.view3d,
    wii3d: { sky: 'menu', on: () => !!Save.data.done.canalclima },
    intro: [
      '* ¡Whoa! Es la plaza... pero todo está AL REVÉS.\n* Lo que estaba a la izquierda ahora está a la derecha.',
      '* Hasta el nombre: PLAZA LANAC. ...Canal, al revés.\n* Bueno, por lo menos yo sigo igual de guapo. Creo.',
    ],
    music: 'wii_espejo',
    ground: plaza.ground,
    // El mismo arreglo del mapa, cada renglón volteado.
    map: plaza.map.map((r) => [...r.padEnd(W, 'T')].reverse().join('')),
    tiles: WII_TILES,
    spawns: { start: [flipX(MIRROR[0]) + 1, MIRROR[1], 'right'] },
    exits: {},
    encounters: [],
    chests: [],
    signs,
    looks: wiiLooks(() => !!Save.data.done.canalclima),
    bitTips: [
      '* Aquí la tubería no lleva a ningún lado. Es solo un reflejo de tubería.',
      '* Si me guiñas el ojo derecho, yo te guiño el izquierdo. Bueno, no tengo ojos así. Pero entiendes.',
      '* Para volver, busca el espejo. Está en la misma esquina... pero del otro lado.',
    ],
    npcs: [
      {
        id: 'wii_espejo', sprite: 'espejo', x: flipX(MIRROR[0]), y: MIRROR[1],
        wiiModel: mirrorModel,
        talk: touchMirror('wii-plaza', [MIRROR[0] - 1, MIRROR[1], 'left'], [
          '* El espejo, visto desde adentro.\n* Del otro lado se ve la plaza de siempre, con todo en su lugar.',
        ]),
      },
      {
        id: 'wii_reflejo', sprite: 'wii_noticias', x: flipX(8), y: 7,
        wiiModel: (v) => WiiPoly.models.mii(v, { hair: WIIC.orange, shirt: WIIC.pink, pants: WIIC.navy }),
        async talk(ctx) {
          await ctx.say([rand([
            '* ¡Última hora! Les habla el CANAL SAICITON, en vivo desde la plaza.\n* ...¿Qué? Así se dice aquí.',
            '* Del otro lado del espejo hay una locutora igualita a mí.\n* Ella es diestra. Yo soy zurda. ¡Noticia!',
            '* Aquí hay cosas que del otro lado no existen.\n* Dicen que algo brilla junto al camino, cerca de la fuente.',
          ])], 'LOCUTORA DEL CANAL SAICITON');
        },
      },
      {
        id: 'wii_espada_espejo', sprite: 'wii_espada_espejo', x: SWORD[0], y: SWORD[1],
        wiiModel: swordModel,
        async talk(ctx) {
          if (secretFound('wii_espejo')) {
            await ctx.say(['* El pedestal está vacío.\n* Del otro lado del espejo, aquí mismo, hay un cofre. Aquí, nada.']);
            return;
          }
          await ctx.say([
            '* Una espada clavada en un pedestal. Del otro lado del espejo, aquí no hay nada.',
            '* La empuñadura apunta a tu mano DERECHA.\n* En la base, unas letras al revés: "AHCERED ONAM".',
          ]);
          const res = await ctx.challenge({ label: 'Léelo al derecho para sacar la espada:', texts: ['mano derecha'], timeLimit: 12 * 1120 + 1500 });
          if (!res.completed) {
            await ctx.say(['* La espada no se mueve. Las letras siguen al revés...\n* ¡Inténtalo otra vez!']);
            return;
          }
          Sfx.coin();
          await ctx.say(['* ¡Sacaste la espada con la mano DERECHA!\n* Del otro lado del espejo, tu reflejo la sacó con la izquierda.']);
          await findSecret('wii_espejo', ctx);
          await ctx.say(['* BIT: ...¿Entonces del otro lado somos zurdos?\n* ¡Vámonos antes de que se nos olvide cuál es cuál!'], 'BIT');
        },
      },
    ],
  };
});
