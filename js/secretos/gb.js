// Secretos jugables del mundo gb: curiosidades con el dato real (ver js/secretos.js).
// Los tres viven en el Valle Game Boy (js/worlds/gb-mapa.js); aquí van sus sprites, personajes y reglas:
//
//   gb_mew     En la esquina de arriba a la derecha (38, 1), detrás de la torre, "sobró" un hueco.
//              Parece vacío; al acercarte aparece Mew (como los ~300 bytes que sobraron en Rojo/Verde).
//   gb_camion  Un camión junto al río (12-13, 5) y un niño que jura que debajo está Mew.
//              Empujarlo (escribiendo FUERZA) solo demuestra que era un rumor.
//   gb_ladron  Tienda de herramientas junto a la tubería (puerta en 7, 21). Si sales con la pala
//              mientras el tendero está de espaldas, te la llevas... y todos te dicen LADRON.
//              Si vuelves a entrar, el tendero te fulmina y despiertas en la tubería (sin perder nada).
//
// Banderas: flags.gbCamionVisto (ya empujaste el camión), flags.gbLadron (ya robaste la pala).

// ---------- Sprites (4 tonos: a claro ... d oscuro) ----------

Object.assign(SPRITES, {
  // Mew de frente, flotando, con su cola larga y la puntita ovalada.
  mew: [
    '.............dd.',
    '.d.....d....dbbd',
    'dbd...dbd...dbbd',
    'dbbdddbbd....dd.',
    'dbbbbbbbbd...d..',
    'dbadbbadbd...d..',
    'dbddbbddbd...d..',
    'dbbbbbbbbd..d...',
    '.dbbbbbbd...d...',
    '..ddbbdd...d....',
    '...dbbbd..d.....',
    '..dbbbbbddd.....',
    '.dbdbbbbbd......',
    '..ddbbbbcd......',
    '...dbd.dbd......',
    '...dd...dd......',
  ],
  // El camión del rumor en chiquito (para el museo).
  camion: [
    '................',
    '................',
    '................',
    '.dddddddddd.....',
    '.dbbbbbbbbd.....',
    '.dbbbbbbbbdddd..',
    '.dbbbbbbbbdaacd.',
    '.dbbbbbbbbdaacd.',
    '.dbbbbbbbbdcccdd',
    '.dccccccccdccccd',
    '.ddddddddddddddd',
    '..ddd....ddd....',
    '.dcacd..dcacd...',
    '..ddd....ddd....',
    '................',
    '................',
  ],
  // El camión del valle: dos casillas (caja + cabina).
  camion_caja: [
    '................',
    '................',
    'dddddddddddddddd',
    'dbbbbbbbbbbbbbbd',
    'dbaaaaaaaaaaaabd',
    'dbbbbbbbbbbbbbbd',
    'dbbbbbbbbbbbbbbd',
    'dbbbbbbbbbbbbbbd',
    'dbbbbbbbbbbbbbbd',
    'dbbbbbbbbbbbbbbd',
    'dccccccccccccccd',
    'dddddddddddddddd',
    '..dddd....dddd..',
    '.dccccd..dccccd.',
    '.dcaacd..dcaacd.',
    '..dddd....dddd..',
  ],
  camion_cabina: [
    '................',
    '................',
    '................',
    '................',
    'ddddddddd.......',
    'dbbbbbbbbd......',
    'dbaaaaaabbd.....',
    'dbaaaaaabbbd....',
    'dbaaaaaabbbbd...',
    'dbbbbbbbbbbbbd..',
    'dccccccccccccd..',
    'dddddddddddddd..',
    '.........dddd...',
    '........dccccd..',
    '........dcaacd..',
    '.........dddd...',
  ],
  // El niño de la gorra que sabe TODOS los rumores.
  nino: [
    '................',
    '.....dddddd.....',
    '....dccccccd....',
    '...dccccccccd...',
    '...dddddddddddd.',
    '....dbbbbbbd....',
    '....dbdbbdbd....',
    '....dbbbbbbd....',
    '.....dbddbd.....',
    '......dddd......',
    '....dddccddd....',
    '...dbdccccdbd...',
    '...dbdccccdbd...',
    '....ddccccdd....',
    '.....dcddcd.....',
    '.....dd..dd.....',
  ],
  // El tendero, de frente (te está viendo) y de espaldas (acomodando el estante).
  tendero: [
    '................',
    '.....dddddd.....',
    '....dccccccd....',
    '...dcbbbbbbcd...',
    '...dbdbbbbdbd...',
    '...dbbbbbbbbd...',
    '...dbddddddbd...',
    '....dbbddbbd....',
    '.....dddddd.....',
    '...ddaaaaaadd...',
    '..dbdaaaaaadbd..',
    '..dbdaaccaadbd..',
    '..dbdaaaaaadbd..',
    '...ddaaaaaadd...',
    '....dcd..dcd....',
    '....ddd..ddd....',
  ],
  tendero_espalda: [
    '................',
    '.....dddddd.....',
    '....dccccccd....',
    '...dccccccccd...',
    '...dccccccccd...',
    '...dccccccccd...',
    '...dbccccccbd...',
    '....dbbbbbbd....',
    '.....dddddd.....',
    '...ddbbbbbbdd...',
    '..dbdbbbbbbdbd..',
    '..dbdbbddbbdbd..',
    '..dbdbbbbbbdbd..',
    '...ddbbbbbbdd...',
    '....dcd..dcd....',
    '....ddd..ddd....',
  ],
  pala: [
    '................',
    '.........ddd....',
    '........dbbd....',
    '.........dd.....',
    '........dcd.....',
    '.......dcd......',
    '......dcd.......',
    '.....dcd........',
    '....dcd.........',
    '..ddddd.........',
    '.dbbbbbd........',
    '.dbaabbd........',
    '.dbabbbd........',
    '.dbbbbbd........',
    '..dbbbd.........',
    '...ddd..........',
  ],
  mesa: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '.dddddddddddddd.',
    '.dbbbbbbbbbbbbd.',
    '.dccccccccccccd.',
    '.dddddddddddddd.',
    '..dcd......dcd..',
    '..dcd......dcd..',
    '..dcd......dcd..',
    '..ddd......ddd..',
  ],
  // El de la Sala de Secretos: antifaz de ladrón.
  ladron: [
    '................',
    '.....dddddd.....',
    '....dccccccd....',
    '...dccccccccd...',
    '...dbbbbbbbbd...',
    '..dddddddddddd..',
    '..ddaddddddaddd.',
    '..dddddddddddddd',
    '...dbbbbbbbbd.dd',
    '...dbbddddbbd...',
    '....dbbbbbbd....',
    '.....dddddd.....',
    '...ddcccccccdd..',
    '..dcccccccccccd.',
    '..dcccdddcccccd.',
    '..dddd...ddddd..',
  ],
  // Casillas de la tienda.
  gb_piso: rowsOf((x, y) => (y % 4 === 3 || (x + (Math.floor(y / 4) % 2) * 8) % 16 === 0 ? 'c' : 'b')),
  gb_muro: rowsOf((x, y) => (y % 8 === 7 || (x + (Math.floor(y / 8) % 2) * 8) % 16 === 0 ? 'd' : 'c')),
  gb_estante: rowsOf((x, y) => {
    if (x === 0 || x === 15 || y === 0 || y === 15 || y % 5 === 4) return 'd';
    return y % 5 >= 1 && (x % 4 === 1 || x % 4 === 2) ? 'a' : 'c';
  }),
  gb_mostrador: rowsOf((x, y) => {
    if (y <= 1 || y === 5 || y === 15 || x === 0 || x === 15) return 'd';
    if (y <= 4) return 'a';
    return x % 5 === 2 ? 'c' : 'b';
  }),
  gb_tapete: rowsOf((x, y) => (x < 2 || x > 13 || y < 3 || y > 12 ? 'b' : (x + y) % 2 ? 'c' : 'd')),
});
// La mesa con la pala acostada encima.
SPRITES.mesa_pala = SPRITES.mesa.map((r, y) => [
  null, null, null, null,
  '...........ddd..',
  '.dd.......dbbbd.',
  'dbbdccccccdbabd.',
  '.dd.......dbbbd.',
][y] || r);
// Los tres del museo se quedan en sus 4 verdes aunque el pueblo ya sea de otra era.
Object.assign(SPRITE_PALETTES, { mew: GB4, camion: GB4, ladron: GB4 });

TREASURES.pala_robada = { room: 'gb', sprite: 'pala', name: 'Pala (sin pagar)', desc: 'Te la llevaste cuando el tendero no veía. Él no lo olvida.' };

// ---------- Tarjetas con el dato real ----------

// Pinta un sprite de 16x16 dentro de un pixelArt con los 4 verdes.
const gbSpr = (p, x, y, name) => p.rows(x, y, SPRITES[name], GB4);

addCuriosities({
  // La tarjeta de TETRIS VS (fase 2 de Tetro Rey). No es secreto: sale al terminar esa fase.
  gb_tetris_vs: {
    console: 'gameboy',
    title: 'Tetris por cable',
    caption: 'En el Tetris de Game Boy (1989) podían jugar 2 personas con el Cable Link. Si borrabas 2 líneas juntas, al otro le subía 1 fila de basura; con 3, le subían 2, ¡y con un TETRIS, 4!',
    draw(g, w, h) {
      const P = GB4;
      const p = pixelArt(g, w, h, 64, 40, P.a);
      p.r(15, 1, 34, 1, P.c).r(15, 1, 1, 3, P.c).r(48, 1, 1, 3, P.c); // el cable
      // Tu pantalla: una barra I a punto de hacer TETRIS.
      drawGameBoy(p, 5, 4, P, { screen: (q, sx, sy) => {
        for (let r = 0; r < 4; r++) q.r(sx + 1, sy + 6 + r, 9, 1, r % 2 ? P.c : P.d);
        q.r(sx + 10, sy + 1, 1, 4, P.d);
      } });
      // La del otro: le suben 4 filas de basura con el hueco alineado.
      drawGameBoy(p, 37, 4, P, { screen: (q, sx, sy) => {
        for (let r = 0; r < 4; r++) q.r(sx + 1, sy + 6 + r, 10, 1, P.c).r(sx + 7, sy + 6 + r, 1, 1, P.a);
        q.r(sx + 3, sy + 4, 3, 1, P.d).r(sx + 4, sy + 3, 1, 1, P.d);
      } });
      p.r(14, 3, 3, 2, P.d).r(47, 3, 3, 2, P.d); // conectores
      // La basura viaja de una a la otra.
      p.rows(28, 14, ARROWS.right, { x: P.d }).rows(28, 21, ARROWS.right, { x: P.d });
      for (let k = 0; k < 4; k++) p.r(28 + k * 2, 28, 1, 1, P.d);
    },
  },
  secreto_gb_mew: {
    console: 'gameboy',
    title: 'El Pokémon escondido',
    caption: 'Cuando ya no se podía tocar Pokémon Rojo y Verde (1996), Shigeki Morimoto usó unos 300 bytes que sobraron al quitar las herramientas de prueba para esconder a Mew. La revista CoroCoro lo regaló a solo 20 ganadores.',
    draw(g, w, h) {
      const P = GB4;
      const p = pixelArt(g, w, h, 64, 40, P.a);
      // La memoria del cartucho: todo lleno de "bytes"... menos un huequito.
      for (let y = 2; y < 38; y += 3) {
        for (let x = 2; x < 62; x += 3) {
          const hueco = x >= 38 && x < 58 && y >= 11 && y < 32;
          if (!hueco) p.r(x, y, 2, 2, (x * 7 + y * 3) % 5 ? P.c : P.d);
        }
      }
      p.r(37, 10, 22, 1, P.d).r(37, 32, 22, 1, P.d).r(37, 10, 1, 23, P.d).r(58, 10, 1, 23, P.d);
      gbSpr(p, 40, 13, 'mew');
      p.rows(56, 13, SPARKLE, { x: P.d }).rows(39, 27, SPARKLE, { x: P.c });
      p.r(3, 31, 17, 7, P.a);
      pixText(p, 5, 32, '300', P.d, 1);
    },
  },
  secreto_gb_camion: {
    console: 'gameboy',
    title: 'El camión del rumor',
    caption: 'MITO: "Mew está debajo del camión" junto al S.S. Anne, en Ciudad Carmín. El camión sí existe, pero solo se llegaba con un truco: tener Surf antes de que zarpara el barco. Es puro adorno: abajo nunca hubo nada.',
    draw(g, w, h) {
      const P = GB4;
      const p = pixelArt(g, w, h, 64, 40, P.a);
      // El mar y el muelle.
      p.r(0, 26, 64, 14, P.c);
      for (let x = 2; x < 64; x += 7) p.r(x, 31 + (x % 3), 3, 1, P.b);
      p.r(34, 22, 30, 4, P.b).r(34, 25, 30, 1, P.d);
      // El barco, de lado.
      p.r(2, 18, 26, 6, P.d).r(4, 24, 22, 2, P.d).r(6, 13, 16, 5, P.b).r(6, 13, 16, 1, P.d);
      [8, 12, 16].forEach((x) => p.r(x, 15, 2, 2, P.d));
      p.r(18, 8, 3, 5, P.d);
      // El camión, con un "?" encima... y nada abajo.
      gbSpr(p, 42, 9, 'camion');
      p.rows(47, 1, ['.xxx.', 'x...x', '...x.', '..x..', '.....', '..x..'], { x: P.d });
    },
  },
  secreto_gb_ladron: {
    console: 'gameboy',
    title: 'LADRÓN',
    caption: "En Link's Awakening (Game Boy, 1993) podías salir de la tienda con algo sin pagar si el tendero no veía. ¡Tu nombre cambiaba a THIEF (LADRÓN) y todos te llamaban así! Si volvías, el tendero te fulminaba.",
    draw(g, w, h) {
      const P = GB4;
      const p = pixelArt(g, w, h, 64, 40, P.b);
      // La tienda: estante al fondo, piso y la puerta abierta.
      p.r(0, 0, 64, 9, P.c);
      for (let x = 2; x < 62; x += 4) p.r(x, 2, 2, 5, P.a);
      p.r(0, 9, 64, 1, P.d);
      p.r(48, 26, 12, 14, P.d).r(50, 28, 8, 12, P.a);
      gbSpr(p, 10, 14, 'tendero_espalda');
      // El héroe saliendo con la pala.
      gbSpr(p, 34, 20, 'heroe');
      gbSpr(p, 35, 7, 'pala');
      // ¡Y el rayo que te espera si vuelves!
      p.rows(26, 11, ['..xx', '.xx.', 'xxxx', '..x.', '.x..', 'x...'], { x: P.d });
    },
  },
});

// ---------- Los personajes del valle ----------

const GB_MEW_AT = [38, 1];
const GB_TIENDA_DOOR = [7, 21];

// Lo que dicen los del valle cuando ya robaste (como en Link's Awakening, todos lo saben).
const GB_LADRON_LINES = {
  abuelo_gris: ['ABUELO GRIS', '* Hmm... tú eres el que salió de la tienda con una pala sin pagar.\n* Aquí todos te dicen LADRON.'],
  pieza_l: ['PIEZA L', '* ¡Ah! ¡El LADRON!\n* ...No te tengo miedo. Soy de plástico.'],
  profesora_valle: ['PROFESORA LETRA', '* Hola, LADRON... ¡digo! Perdón.\n* Es que ya todos te dicen así.'],
  gb_nino: ['NIÑO', '* ¡Wow! ¡Eres el LADRON de la tienda!\n* En la escuela no se habla de otra cosa.'],
};
const gbLadronLine = async (ctx, id) => {
  const l = GB_LADRON_LINES[id];
  if (l && ctx.flag('gbLadron')) await ctx.say([l[1]], l[0]);
};
MAPS['gb-valle'].npcs.forEach((n) => {
  if (!GB_LADRON_LINES[n.id]) return;
  const talk = n.talk;
  n.talk = async (ctx) => { await gbLadronLine(ctx, n.id); return talk(ctx); };
});

// Empujar el camión: el mito de Mew debajo del camión de Ciudad Carmín.
async function gbCamion(ctx) {
  if (ctx.flag('gbCamionVisto')) {
    await ctx.say(['* El camión sigue ahí, estacionado junto al río.\n* Debajo sigue sin haber nada. Solo la tuerca.']);
    return;
  }
  await ctx.say(['* Un camión estacionado junto al río.\n* ¿Quién lo trajo hasta aquí? Nadie sabe.']);
  if (await ctx.choose(['empujar', 'dejarlo']) === 1) return;
  const res = await ctx.challenge({ label: 'Escribe para empujar:', texts: ['fuerza'], timeLimit: 'fuerza'.length * 1120 + 1500 });
  if (!res.completed) {
    await ctx.say(['* El camión ni se enteró.\n* ¡Escribe con más FUERZA!']);
    return;
  }
  Sfx.bump();
  await ctx.say([
    '* ¡Empujas con todas tus fuerzas!',
    '* ...El camión no se mueve ni un pixel.',
    '* Te asomas por debajo: no hay nada.\n* Solo pasto y una tuerca vieja.',
    '* Era un rumor del patio de la escuela.',
  ]);
  ctx.setFlag('gbCamionVisto');
  await findSecret('gb_camion', ctx);
}

MAPS['gb-valle'].npcs.push(
  {
    // Mew, en el rincón que sobró del mapa. No se ve hasta que llegas a la esquina (gbMewCheck).
    id: 'gb_mew', sprite: 'mew', cls: 'gb-mew', x: GB_MEW_AT[0], y: GB_MEW_AT[1],
    async talk(ctx) {
      const e = Scenes.town.npcs.find((n) => n.id === 'gb_mew');
      if (e) e.el.classList.add('visto');
      if (secretFound('gb_mew')) {
        await ctx.say([rand([
          '* ¡Mew!\n* (Da una vuelta en el aire y se queda en su rincón.)',
          '* Mew... mew.\n* (Parece que nadie más ha encontrado este hueco.)',
        ])], 'MEW');
        return;
      }
      await ctx.say(['* ¡Mew!'], 'MEW');
      await ctx.say([
        '* (Un Pokémon chiquito flota en el rincón que sobró del mapa.\n* Te mira con mucha curiosidad.)',
        '* (Cuentan que lo escondieron en un pedacito de memoria\n* que nadie iba a usar...)',
      ]);
      await findSecret('gb_mew', ctx);
    },
  },
  { id: 'gb_camion_caja', sprite: 'camion_caja', x: 12, y: 5, talk: gbCamion },
  { id: 'gb_camion_cab', sprite: 'camion_cabina', x: 13, y: 5, talk: gbCamion },
  {
    id: 'gb_nino', sprite: 'nino', x: 10, y: 5,
    async talk(ctx) {
      await gbLadronLine(ctx, 'gb_nino');
      if (secretFound('gb_mew') && ctx.flag('gbCamionVisto')) {
        await ctx.say(['* ¿Que encontraste a Mew en un rincón del mapa?\n* ¡Te dije que estaba en el valle!', '* ...Bueno, no estaba debajo del camión. Pero casi.'], 'NIÑO');
        return;
      }
      if (ctx.flag('gbCamionVisto')) {
        await ctx.say([rand([
          '* ¿No estaba? ...Seguro lo empujaste mal.\n* El primo de mi primo nunca miente.',
          '* A lo mejor hay que empujarlo 100 veces.\n* O con el cartucho al revés.',
          '* Bueno, si no está debajo del camión, está en otro lado.\n* ¡Los rumores siempre tienen ALGO de verdad!',
        ])], 'NIÑO');
        return;
      }
      await ctx.say([
        '* ¡Oye! ¿Sabías que debajo de ese camión está MEW?',
        '* Me lo contó el primo de un amigo de mi primo.\n* ¡Es 100% real!',
        '* Dice que hay que empujarlo con FUERZA.\n* Yo no puedo... ¡inténtalo tú!',
      ], 'NIÑO');
    },
  },
);
Object.assign(MAPS['gb-valle'].tiles, { U: { s: 'door' } });
Object.assign(MAPS['gb-valle'].exits, { [GB_TIENDA_DOOR.join(',')]: { map: 'gb-tienda', spawn: [9, 10, 'up'] } });
Object.assign(MAPS['gb-valle'].signs, {
  '5,20': ['* TIENDA DE HERRAMIENTAS', '* "Aquí se paga antes de salir."\n* (Alguien escribió abajo, chiquito: "casi siempre")'],
});

// ---------- La tienda ----------

const GB_TIENDA_MAP = [
  'XXXXXXXXXXXXXXXXXXXX',
  'XXXXXXXXXXXXXXXXXXXX',
  'XXXXXXXXXXXXXXXXXXXX',
  'XXXXEEEEEEEEEEEEXXXX',
  'XXXX...MMMMM....XXXX',
  'XXXX............XXXX',
  'XXXX............XXXX',
  'XXXX............XXXX',
  'XXXX............XXXX',
  'XXXX............XXXX',
  'XXXX............XXXX',
  'XXXXXXXXXvXXXXXXXXXX',
  'XXXXXXXXXXXXXXXXXXXX',
  'XXXXXXXXXXXXXXXXXXXX',
  'XXXXXXXXXXXXXXXXXXXX',
];
const GB_PALA_PRICE = 980; // lo que costaba el arco en la tienda de Link's Awakening

Object.assign(MAPS, {
  'gb-tienda': {
    id: 'gb-tienda',
    world: 'gb',
    name: 'Tienda de herramientas',
    music: 'gb_valle',
    map: GB_TIENDA_MAP,
    ground: 'gb_piso',
    tiles: {
      X: { s: 'gb_muro', solid: true },
      '.': { s: 'gb_piso' },
      E: { s: 'gb_estante', solid: true, look: 'estante' },
      M: { s: 'gb_mostrador', solid: true, look: 'mostrador' },
      v: { s: 'gb_tapete' },
    },
    spawns: { start: [9, 10, 'up'] },
    exits: { '9,11': { map: 'gb-valle', spawn: [GB_TIENDA_DOOR[0], GB_TIENDA_DOOR[1] + 1, 'down'] } },
    looks: {
      estante: '* Frascos, cuerdas, bombitas...\n* Todo tiene etiqueta de precio. Todo es carísimo.',
      mostrador: '* El mostrador. Tiene una campanita y un letrero:\n* "NO SE FÍA".',
    },
    bitTips: [
      '* Qué tienda tan tranquila.\n* El tendero no deja de vernos...',
      '* ...bueno, casi nunca deja de vernos.',
    ],
    npcs: [
      {
        id: 'gb_tendero', sprite: 'tendero', x: 9, y: 5,
        async talk(ctx) {
          const t = Scenes.town;
          if (t.gbTurned) {
            await ctx.say(['* (Está de espaldas, acomodando el estante.\n* Tararea una canción y no te hace caso.)']);
            return;
          }
          if (t.gbCarga) {
            await ctx.say([`* ¡Buena elección! La PALA cuesta ${GB_PALA_PRICE} monedas.`], 'TENDERO');
            if (await ctx.choose(['pagar', 'dejarla'], 'TENDERO') === 0) {
              await ctx.say(['* ...¿No traes ni una moneda?\n* (Monedín no cuenta. Él no se deja gastar.)'], 'TENDERO');
            }
            gbSoltarPala(t);
            await ctx.say(['* Te la dejo en su mesa. Aquí te espera.'], 'TENDERO');
            return;
          }
          await ctx.say([rand([
            '* ¡Bienvenido! Si quieres algo, tómalo y tráemelo.\n* Aquí todo se paga ANTES de salir.',
            '* Tengo la mejor pala del valle. Cava lo que sea.\n* Bueno, casi todo es pasto, pero igual.',
            '* Yo nunca le quito el ojo a la puerta.\n* ...Casi nunca.',
          ])], 'TENDERO');
        },
      },
      {
        id: 'gb_mesa_pala', sprite: 'mesa_pala', x: 14, y: 5,
        async talk(ctx) {
          const t = Scenes.town;
          if (t.gbCarga) return;
          await ctx.say([`* Una PALA brillante.\n* La etiqueta dice: ${GB_PALA_PRICE} monedas.`]);
          if (await ctx.choose(['tomarla', 'dejarla']) === 1) return;
          gbTomarPala(t);
          Sfx.pop();
          await ctx.say(['* La levantas sobre tu cabeza.\n* (Para pagarla, llévasela al tendero.)']);
        },
      },
      {
        id: 'gb_mesa_vacia', sprite: 'mesa', x: 5, y: 5,
        talk: (ctx) => ctx.say(['* Aquí había escudos.\n* Un letrerito dice: "AGOTADOS. Vuelva mañana."']),
      },
    ],
  },
});

const gbEnt = (t, id) => (t.npcs || []).find((n) => n.id === id);

function gbTomarPala(t) {
  t.gbCarga = true;
  const mesa = gbEnt(t, 'gb_mesa_pala');
  if (mesa) { mesa.sprite = 'mesa'; t.repaint(mesa); }
  // La pala arriba de tu cabeza, como en los juegos de Zelda.
  const up = document.createElement('div');
  up.className = 'gb-carga';
  up.appendChild(spriteCanvas('pala', 2));
  t.player.el.appendChild(up);
}

function gbSoltarPala(t) {
  t.gbCarga = false;
  const mesa = gbEnt(t, 'gb_mesa_pala');
  if (mesa) { mesa.sprite = 'mesa_pala'; t.repaint(mesa); }
  const up = t.player && t.player.el.querySelector('.gb-carga');
  if (up) up.remove();
}

// El tendero se voltea a acomodar el estante un ratito y luego vuelve a vigilar.
function gbTenderoTick(t) {
  const e = gbEnt(t, 'gb_tendero');
  if (!e || t.mode !== 'walk' || performance.now() < t.gbNext) return;
  t.gbTurned = !t.gbTurned;
  t.gbNext = performance.now() + (t.gbTurned ? 2800 * diff().time : 2500 + Math.random() * 1800);
  e.sprite = t.gbTurned ? 'tendero_espalda' : 'tendero';
  t.repaint(e);
  const old = e.el.querySelector('.gb-tarareo');
  if (old) old.remove();
  if (t.gbTurned) {
    const b = document.createElement('div');
    b.className = 'gb-tarareo';
    b.textContent = 'LA LA LA';
    e.el.appendChild(b);
  }
}

function gbVigilar(t) {
  const e = gbEnt(t, 'gb_tendero');
  t.gbTurned = false;
  t.gbNext = performance.now() + 2500;
  if (e) { e.sprite = 'tendero'; t.repaint(e); const b = e.el.querySelector('.gb-tarareo'); if (b) b.remove(); }
}

// Llegas a la puerta con la pala: si te ve, te la quita; si está de espaldas, te la llevas.
function gbPuertaConPala(t, arrive) {
  if (t.gbTurned) {
    gbRobo = true;
    t.gbCarga = false;
    arrive.call(t);
    return;
  }
  t.run(async (ctx) => {
    Sfx.error();
    await ctx.say(['* ¡OYE, OYE! ¡Eso no está pagado!'], 'TENDERO');
    gbSoltarPala(t);
    Object.assign(t.p, { x: 9, y: 10, face: 'up' });
    Object.assign(t.player, { x: 9, y: 10 });
    t.place(t.player, true);
    t.facePlayer();
    t.camera(true);
    t.savePos();
    await ctx.say(['* (El tendero regresa la pala a su mesa.\n* No te quita el ojo de encima.)']);
  });
}

// Mew aparece cuando llegas a la esquina (de lejos el hueco se ve vacío).
function gbMewCheck(t) {
  const e = gbEnt(t, 'gb_mew');
  if (!e || e.el.classList.contains('visto')) return;
  if (Math.abs(t.p.x - e.x) <= 1 && Math.abs(t.p.y - e.y) <= 1) {
    e.el.classList.add('visto');
    Sfx.pop();
  }
}

// Avisos que pasan de una escena a la siguiente (al salir de la tienda o al despertar del rayo).
let gbRobo = false;
let gbFulminado = false;

// js/scenes/town.js se carga después de este archivo: envolvemos sus funciones cuando ya existe.
function gbWrapTown() {
  const gbEnter = Scenes.town.enter;
  Scenes.town.enter = function (params) {
    gbEnter.call(this, params);
    this.gbCarga = false;
    clearInterval(this.gbIv);
    clearTimeout(this.gbLater);
    if (this.mapId === 'gb-tienda') {
      gbVigilar(this);
      if (Save.data.flags.gbLadron) this.gbLater = setTimeout(() => this.run(gbRayo), 450);
      else this.gbIv = setInterval(() => gbTenderoTick(this), 100);
    }
    if (this.mapId !== 'gb-valle') return;
    // Bit también se entera.
    if (Save.data.flags.gbLadron && this.bit) {
      this.bit.talk = (ctx) => ctx.say([rand([
        '* Todos te dicen LADRON...\n* Yo te sigo diciendo amigo. Creo.',
        '* Si quieres, la próxima vez pagamos.\n* Bueno, si alguna vez tenemos monedas.',
        '* Yo que tú no volvería a entrar a esa tienda.',
      ])], 'BIT');
    }
    if (gbRobo) {
      gbRobo = false;
      this.gbLater = setTimeout(() => this.run(async (ctx) => {
        await ctx.say(['* ¡Saliste de la tienda con la PALA... sin pagar!']);
        if (!Save.data.treasures.pala_robada) await ctx.give('pala_robada');
        ctx.setFlag('gbLadron');
        await ctx.say(['* Adentro, el tendero se da la vuelta...\n* y se queda viendo la mesa vacía.']);
        await ctx.say(['* ...Oye. ¿Eso estuvo bien?', '* Yo que tú no volvería a entrar a esa tienda.'], 'BIT');
      }), 350);
    } else if (gbFulminado) {
      gbFulminado = false;
      this.gbLater = setTimeout(() => this.run(async (ctx) => {
        await ctx.say(['* ¿Estás bien? Hueles a pelo quemado.'], 'BIT');
        if (!secretFound('gb_ladron')) await findSecret('gb_ladron', ctx);
      }), 450);
    }
  };

  const gbExit = Scenes.town.exit;
  Scenes.town.exit = function () {
    clearInterval(this.gbIv);
    clearTimeout(this.gbLater);
    return gbExit.call(this);
  };

  const gbArrive = Scenes.town.arrive;
  Scenes.town.arrive = function () {
    if (this.mapId === 'gb-tienda' && this.gbCarga && this.exitAt(this.p.x, this.p.y)) { gbPuertaConPala(this, gbArrive); return; }
    gbArrive.call(this);
    if (this.mapId === 'gb-valle' && Game.scene === this) gbMewCheck(this);
  };
}
document.addEventListener('DOMContentLoaded', gbWrapTown);

// Volviste a la tienda después de robar: el tendero te fulmina. Sin game over: despiertas en la tubería.
async function gbRayo(ctx) {
  const town = $('.town');
  await ctx.say(['* ...', '* ¡¡¡TE ESTABA ESPERANDO, LADRON!!!'], 'TENDERO');
  Sfx.hurt();
  town.classList.add('gb-rayo');
  await townWait(1300);
  town.classList.remove('gb-rayo');
  await ctx.say([
    '* ¡ZAAAS! El tendero te fulminó con un rayo.',
    '* ...Despiertas en la tubería de la entrada del valle,\n* con los pelos de punta. (No perdiste nada. Bueno, la dignidad.)',
  ]);
  gbFulminado = true;
  Game.go('town', { map: 'gb-valle', spawn: [3, 26, 'up'] });
}
