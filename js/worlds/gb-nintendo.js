// MUNDO 1 — Los de Nintendo en el Valle Game Boy: lugares y personajes de verdad, dibujados aquí.
// Se carga después de js/secretos/gb.js (usa GB4 y gbLadronLine). Solo agrega cosas; no cambia ids.
//
//   ALDEA MABE (zona de la tubería, con la tienda)   y abajo, por el camino del sur (12, 29):
//   ISLA KOHOLINT (mapa gb-koholint): Monte Tamaranch con el huevo del Pez del Viento,
//                 y la Playa Toronbo con Marin y Link.
//   PUEBLO PALETA (zona del laboratorio): el Profesor Oak (32, 16) y su batalla que nunca se usó.
//   PASTO ALTO GRANDE: Pikachu (25, 26), que no se deja meter en una Poké Ball.
//   BOSQUE: Wario (8, 16), que reta a un duelo por las 6 monedas.
//   CUEVA DE LOS SUEÑOS: Kirby (15, 13), con el código del Extra Game.
//
// Banderas: gbOak, gbOakGano, gbMarin, gbKirbyExtra, gbWarioGano, gbPika (y contadores de charla).

// ---------- Sprites (4 tonos: a claro ... d oscuro) ----------

// El huevo del Pez del Viento: 2x2 casillas. Óvalo más angosto arriba, brillo y una manchita.
const gbHuevo = (ox, oy) => rowsOf((x, y) => {
  const X = x + ox + 0.5;
  const Y = y + oy + 0.5;
  const dy = Y - 17;
  const rx = 14 - (dy < 0 ? -dy * 0.22 : 0);
  const dd = Math.hypot((X - 16) / rx, dy / 15);
  if (dd > 1) return '.';
  if (dd > 0.9) return 'd';
  if ((X - 11) ** 2 + (Y - 9) ** 2 < 8) return 'a';
  if ((X - 20) ** 2 + (Y - 20) ** 2 < 5 || (X - 12) ** 2 + (Y - 23) ** 2 < 3) return 'c';
  return X + Y > 38 ? 'c' : 'b';
});

Object.assign(SPRITES, {
  // Link de Link's Awakening: gorro con punta, escudo a la izquierda y espada a la derecha.
  link_gb: [
    '.......ddd......',
    '.....ddcccdd....',
    '....dcccccccd...',
    '...dccccccccdd..',
    '...dddddddddcd..',
    '...dbaaaaaabdcd.',
    '...dadaaadabd.d.',
    '...daaaaaaaad...',
    '....daaddaad....',
    '..dd.dccccd..d..',
    '.dbbddccccdddad.',
    '.dbabdccccd.dad.',
    '.dbbbddddddddad.',
    '..dbd.dbbd...d..',
    '...d..dbbd......',
    '.....dd..dd.....',
  ],
  // Marin: pelo largo, flor en el pelo y vestido.
  marin: [
    '.....dddddd.....',
    '....dccccccd....',
    '...dccccccccd.d.',
    '..dccbbbbbbccdad',
    '..dcbaaaaaabcdd.',
    '..dcadaaaadacd..',
    '..dcaaaaaaaacd..',
    '..dccaaddaaccd..',
    '..dcccdaadcccd..',
    '..dccdbbbbdccd..',
    '..dcdbbbbbbdcd..',
    '...ddbbbbbbdd...',
    '....dbbbbbbd....',
    '...dbbbbbbbbd...',
    '...dddddddddd...',
    '.....da..ad.....',
  ],
  // Pikachu: orejas con punta oscura, cachetes y cola de rayo.
  pikachu: [
    '.d..........d...',
    '.dd........dd...',
    '.dbd......dbd...',
    '..dbd....dbd....',
    '..dbbddddbbd....',
    '..dbbbbbbbbd.dd.',
    '.dbadbbbbadbddbd',
    '.dbddbbbbddbdbbd',
    '.dcbbbbbbbbcdbd.',
    '.dccbbddbbccbd..',
    '..dbbbbbbbbbbd..',
    '..dbdbbbbbbdbd..',
    '..dbbbbbbbbbd...',
    '...dbbbbbbbd....',
    '...dbd...dbd....',
    '...dd.....dd....',
  ],
  // El Profesor Oak: pelo gris y bata de laboratorio.
  oak: [
    '................',
    '.....dddddd.....',
    '....dbbbbbbd....',
    '...dbbbbbbbbd...',
    '...dbaaaaaabd...',
    '...dadaaaadad...',
    '....daaaaaad....',
    '....daddddad....',
    '.....daaaad.....',
    '...ddaacdaadd...',
    '..daaaacdaaaad..',
    '..daaaacdaaaad..',
    '..daaaaaaaaaad..',
    '...daaaaaaaad...',
    '...dddccccddd...',
    '....dd....dd....',
  ],
  // Kirby: bolita con ojos largos, cachetes y zapatos.
  kirby: [
    '................',
    '.....dddddd.....',
    '...ddbbbbbbdd...',
    '..dbbbbbbbbbbd..',
    '..dbbbbdbdbbbd..',
    '.dbbbbbdbdbbbbd.',
    '.dbbbbbababbbbd.',
    '.dbcbbbdbdbbcbd.',
    '.dbbbbbbbbbbbbd.',
    'dbbbbbbddbbbbbbd',
    'dbbbbbbbbbbbbbbd',
    '.ddbbbbbbbbbbdd.',
    '..dbbbbbbbbbbd..',
    '..ddcccddcccdd..',
    '.dcccccddcccccd.',
    '..dddddd.ddddd..',
  ],
  // Wario: gorra con W, bigote en zigzag y barbilla enorme.
  wario: [
    '....dddddddd....',
    '...dccccccccd...',
    '..dccadccdaccd..',
    '..dcccaddacccd..',
    '.dddddddddddddd.',
    '..dbaaaaaaaabd..',
    '..dadaaaaaadad..',
    '..daaaabbaaaad..',
    '..ddddbbbbdddd..',
    '..dadddaadddad..',
    '..daaaaaaaaaad..',
    '...daddddddad...',
    '..dccdaaaadccd..',
    '.dccccddddccccd.',
    '.dbbdccccccdbbd.',
    '..dd.dd..dd.dd..',
  ],
  huevo_a: gbHuevo(0, 0),
  huevo_b: gbHuevo(16, 0),
  huevo_c: gbHuevo(0, 16),
  huevo_d: gbHuevo(16, 16),
  arena: tileFrom('a', speckles(9, 4, 'b').concat(speckles(4, 12, 'c'))),
  // Tesoros nuevos.
  caracola: [
    '................',
    '.......dd.......',
    '......dbbd......',
    '.....dbaabd.....',
    '....dbabbabd....',
    '...dbabccbabd...',
    '...dbbcddcbbd...',
    '..dbabcddcbabd..',
    '..dbbabccbabbd..',
    '..dbbbabbabbbd..',
    '...dbbbaabbbd...',
    '....ddbbbbdd....',
    '.....dcccd......',
    '......dcd.......',
    '.......d........',
    '................',
  ],
  pokedex: [
    '................',
    '..dddddddddddd..',
    '..dccccccccccd..',
    '..dcaacccdcccd..',
    '..dcaacccccccd..',
    '..dccccccccccd..',
    '..dcddddddddcd..',
    '..dcdaaaaaadcd..',
    '..dcdaaaaaadcd..',
    '..dcdaaaaaadcd..',
    '..dcddddddddcd..',
    '..dccccccccccd..',
    '..dcdcccccddcd..',
    '..dccccccccccd..',
    '..dddddddddddd..',
    '................',
  ],
  moneda_wario: [
    '................',
    '.....dddddd.....',
    '....dbbbbbbd....',
    '...dbaaaaaabd...',
    '..dbaabbbbaabd..',
    '..dbadbbbbdabd..',
    '..dbadbbbbdabd..',
    '..dbadbddbdabd..',
    '..dbadbddbdabd..',
    '..dbaaddddaabd..',
    '..dbabdbbdbabd..',
    '...dbaaaaaabd...',
    '....dbbbbbbd....',
    '.....dddddd.....',
    '................',
    '................',
  ],
});
// La caja de Kirby's Dream Land en América: Kirby salió blanco.
SPRITES.kirby_blanco = SPRITES.kirby.map((r) => r.replace(/b/g, 'a'));
// Los del museo se quedan en sus 4 verdes aunque el pueblo ya sea de otra era.
Object.assign(SPRITE_PALETTES, { caracola: GB4, pokedex: GB4, moneda_wario: GB4, kirby_blanco: GB4 });

Object.assign(TREASURES, {
  caracola: { room: 'gb', name: 'Caracola de Koholint', desc: 'Regalo de Marin. Si te la acercas al oído se oye el mar... y alguien cantando.' },
  pokedex: { room: 'gb', name: 'Pokédex de Oak', desc: 'Por ganarle al Profesor Oak la batalla que se quedó escondida en el cartucho.' },
  kirby_blanco: { room: 'gb', name: 'Kirby blanco', desc: 'Así salió Kirby en la caja americana de Dream Land (1992). Sakurai dice que fue un error.' },
  moneda_wario: { room: 'gb', name: 'Moneda de Wario', desc: 'Una de las 6 Monedas de Oro de Super Mario Land 2. Wario jura que es suya.' },
});

// ---------- Música de la isla ----------

// Isla Koholint: canción de playa ORIGINAL en Sol mayor, tranquila y con swing, al estilo de las
// aldeas de los juegos de aventura de Game Boy (pulso con vibrato, arpegios suaves y olas de hi-hat).
// 1 compás de intro + 32 (≈ 80 s).
Object.assign(TRACKS, {
  gb_koholint: (() => {
    const { bars, root, tones, tr } = GB_MUS;
    const H = {
      I: ['G D'],
      A: ['G', 'Em', 'C', 'D', 'G', 'Bm', 'C', 'D7'],
      A2: ['G', 'Em', 'C', 'D', 'G', 'Bm', 'C', 'D7 G'],
      B: ['Em', 'C', 'Am7', 'D', 'Em', 'C', 'Am D', 'D7'],
    };
    const head = 'B4/4 D5/4 G5/6 F#5/2 | E5/8 -/2 B4/2 D5/2 E5/2 | G5/4 E5/4 C5/6 D5/2 | A4/12 -/4 | B4/4 D5/4 G5/4 A5/4 | B5/6 A5/2 F#5/4 D5/4';
    const mel = {
      I: 'G4/2 B4/2 D5/2 G5/2 F#5/2 D5/2 A4/2 F#4/2',
      A: `${head} | E5/4 G5/4 C6/4 B5/2 A5/2 | A5/8 F#5/4 -/4`,
      A2: `${head} | E5/4 G5/4 A5/2 G5/2 E5/2 C5/2 | A4/4 C5/4 B4/8`,
      // B: se va a Mi menor, como cuando se nubla un ratito en la playa.
      B: 'G5/6 F#5/2 E5/4 B4/4 | C5/6 D5/2 E5/4 G5/4 | A5/6 G5/2 E5/4 C5/4 | D5/12 -/4 | ' +
        'E5/4 G5/4 B5/6 A5/2 | G5/4 E5/4 C5/4 E5/4 | A5/4 C6/4 F#5/4 A5/4 | A5/8 -/8',
    };
    // Segundo pulso: acordes quebrados lentos.
    const brkH = (c) => { const t = tones(c, 'G3'); return `${t[0]}/2 ${t[1]}/2 ${t[2]}/2 ${t[1]}/2`; };
    const brk = (c) => `${brkH(c)} ${brkH(c)}`;
    const v2 = { I: bars(H.I, brk, brkH), A: bars(H.A, brk, brkH), A2: bars(H.A2, brk, brkH), B: bars(H.B, brk, brkH) };
    // Bajo (canal de onda): raíz y quinta, sin prisa.
    const R = (c) => root(c, 'E2');
    const sway = (c) => `${R(c)}/6 ${tr(R(c), 7)}/2 ${tr(R(c), 12)}/4 ${tr(R(c), 7)}/4`;
    const swayH = (c) => `${R(c)}/4 ${tr(R(c), 7)}/4`;
    const bas = { I: bars(H.I, sway, swayH), A: bars(H.A, sway, swayH), A2: bars(H.A2, sway, swayH), B: bars(H.B, sway, swayH) };
    // Las olas: hi-hats suaves y un hi-hat abierto que "revienta" al final del compás.
    const ola = 'k/4 h/2 h/2 h/4 h/2 o/2';
    const dr = { I: 'h/4 h/4 h/4 o/4', A: `(${ola})*8`, A2: `(${ola})*8`, B: `(${ola})*7 k/4 h/2 h/2 s/2 s/2 o/4` };
    return {
      bpm: 100, era: 'gb', swing: 0.1, intro: ['I'], form: ['A', 'A2', 'B', 'A2'],
      voices: [
        { wave: 'pulse25', vol: 0.032, vib: { rate: 5, depth: 0.25, delay: 0.3 }, parts: mel },
        { wave: 'pulse12', vol: 0.014, env: 'soft', parts: v2 },
        { wave: 'triangle', vol: 0.08, fx: 0, parts: bas },
        { wave: 'noise', vol: 0.014, parts: dr },
      ],
    };
  })(),
});

// ---------- Lo que dicen si ya robaste en la tienda (como Marin en Link's Awakening) ----------

Object.assign(GB_LADRON_LINES, {
  gb_marin: ['MARIN', '* Ah, eres tú... LADRON.\n* (En toda la isla ya te dicen así.)'],
  gb_oak: ['PROF. OAK', '* ¡Ah, el LADRON! ...Digo, el joven entrenador.'],
  gb_wario: ['WARIO', '* ¡Wajajá! ¡Un LADRON! Me caes bien.'],
});

// ---------- Retos ----------

// Un reto de varias palabras: gana si las escribe todas a tiempo.
const gbReto = (ctx, label, texts, msPorLetra, extra = 3000) =>
  ctx.challenge({ label, texts, timeLimit: texts.join('').length * msPorLetra + extra });

// ---------- Valle: Pueblo Paleta, Pasto Alto Grande y el Bosque ----------

MAPS['gb-valle'].regions = [
  { x0: 1, y0: 19, x1: 13, y1: 28, era: 'gb', name: 'Aldea Mabe' },
  { x0: 23, y0: 11, x1: 38, y1: 17, era: 'gb', name: 'Pueblo Paleta' },
];
// El camino del sur de la Aldea Mabe baja a la playa, como en Koholint.
Object.assign(MAPS['gb-valle'].exits, { '12,29': { map: 'gb-koholint', spawn: [17, 1, 'down'] } });
MAPS['gb-valle'].bitTips.push('* Por el camino del sur de la aldea se oye el mar...\n* ¿Una isla? ¿Aquí?');

MAPS['gb-valle'].npcs.push(
  {
    // El Profesor Oak, de visita en el laboratorio de su colega.
    id: 'gb_oak', sprite: 'oak', x: 32, y: 16,
    async talk(ctx) {
      await gbLadronLine(ctx, 'gb_oak');
      if (!ctx.flag('gbOak')) {
        ctx.setFlag('gbOak');
        await ctx.say([
          '* ¡ESPERA! ¡No entres al pasto alto sin un Pokémon!\n* ...Ah, traes un Tecloide. Bueno, pasa.',
          '* Soy el PROFESOR OAK. Tengo un nieto que se llama...\n* eh... ¿cómo se llamaba? Siempre se me olvida.',
        ], 'PROF. OAK');
        await ctx.say(['* (Es de verdad: en Pokémon Rojo y Verde,\n* Oak te pregunta cómo se llama SU PROPIO nieto.)']);
        return;
      }
      if (!ctx.flag('gbOakGano')) {
        await ctx.say(['* Psst. En el cartucho hay datos de una batalla CONTRA MÍ.\n* Nunca la usaron. ¿Le entramos?'], 'PROF. OAK');
        if (await ctx.choose(['pelear', 'luego'], 'PROF. OAK') === 1) {
          await ctx.say(['* Sabia decisión. Mi equipo está al nivel del de mi nieto.\n* Como se llame.'], 'PROF. OAK');
          return;
        }
        const res = await gbReto(ctx, 'La batalla que nunca se usó:', pickWords(WORDS.t2, 5), 420);
        if (!res.completed) {
          await ctx.say(['* ¡Ja! Por algo la quitaron del juego.\n* Vuelve cuando quieras la revancha.'], 'PROF. OAK');
          return;
        }
        ctx.setFlag('gbOakGano');
        Sfx.coin();
        await ctx.say(['* ¡Increíble! Nadie me había ganado...\n* bueno, nadie había podido pelear conmigo.'], 'PROF. OAK');
        await ctx.give('pokedex');
        return;
      }
      const lines = [
        '* Dato: mis datos de batalla están en TODOS los juegos de la 1.ª generación.\n* Solo se llegaba a mí con un glitch.',
        '* Dato: Pikachu lo dibujó Atsuko Nishida.\n* Se inspiró en las ardillas: guarda electricidad en los cachetes.',
        '* Dato: en Pokémon Amarillo, el primer Pokémon es un Pikachu\n* que te sigue a pie. ¡Odia su Poké Ball!',
      ];
      await ctx.say([lines[ctx.counter('gbOakDato') % lines.length]], 'PROF. OAK');
    },
  },
  {
    // Pikachu, en el pasto alto a las afueras de Pueblo Paleta (como en Pokémon Amarillo).
    id: 'gb_pikachu', sprite: 'pikachu', x: 25, y: 26,
    async talk(ctx) {
      if (ctx.flag('gbPika')) {
        await ctx.say([rand([
          '* ¡Pika pika!\n* (Se llama así por "pika", chispa, y "chu", el chillido de un ratón.)',
          '* ¡Pikachu!\n* (Te muestra su número: el 025 de la Pokédex.)',
          '* ¡Pi-ka!\n* (Sus cachetes hacen bzzt. Pilabat lo mira con envidia.)',
        ])], 'PIKACHU');
        return;
      }
      await ctx.say(['* ¡Pika! (Un Pikachu salvaje. ¡Escribe rápido para atraparlo!)'], 'PIKACHU');
      const res = await gbReto(ctx, '¡Lanza la Poké Ball!', ['pokebola'], 700, 1500);
      if (!res.completed) {
        await ctx.say(['* ¡Pika! (Se ríe de ti y vuelve a esconderse en el pasto.)'], 'PIKACHU');
        return;
      }
      ctx.setFlag('gbPika');
      Sfx.bump();
      await ctx.say([
        '* ¡Lo atrapaste! ...Y se sale solito. ¡PIKA!',
        '* (Como en Pokémon Amarillo: no quiere estar en su bola.\n* Prefiere seguirte a pie.)',
      ]);
    },
  },
  {
    // Wario, recién llegado de Super Mario Land 2, buscando monedas.
    id: 'gb_wario', sprite: 'wario', x: 8, y: 16,
    async talk(ctx) {
      await gbLadronLine(ctx, 'gb_wario');
      if (ctx.flag('gbWarioGano')) {
        await ctx.say([rand([
          '* Mi nombre viene de "warui", MALO en japonés, más Mario.\n* ¡Soy Mario, pero malo! ¡Wajajá!',
          '* Debuté en Super Mario Land 2 (1992). Me quedé con el castillo de Mario\n* mientras él andaba en Sarasaland.',
          '* Me inventó Hiroji Kiyotake.\n* Pero las ganas de monedas son todas mías.',
        ])], 'WARIO');
        return;
      }
      await ctx.say([
        '* ¡Wajajá! ¿Tú conoces a una moneda que habla? ¡La quiero!',
        '* Te reto: escribe mis 6 monedas de oro antes que yo.\n* Si ganas, te doy UNA. Si pierdo... no, yo nunca pierdo.',
      ], 'WARIO');
      if (await ctx.choose(['duelo', 'huir'], 'WARIO') === 1) {
        await ctx.say(['* ¡Gallina! ¡Cocoroco! ...Wajajá.'], 'WARIO');
        return;
      }
      const res = await gbReto(ctx, 'Duelo de las 6 monedas:', ['arbol', 'tortuga', 'macro', 'calabaza', 'mario', 'espacio'], 400, 2500);
      if (!res.completed) {
        await ctx.say(['* ¡WAJAJÁ! ¡Gané! Las 6 son mías.\n* (Las 6 zonas de Mario Land 2 tenían una moneda cada una.)'], 'WARIO');
        return;
      }
      ctx.setFlag('gbWarioGano');
      Sfx.coin();
      await ctx.say(['* ¡¿QUÉ?! ¡Trampa! ...Bueno, toma UNA.\n* Pero que conste que me duele.'], 'WARIO');
      await ctx.give('moneda_wario');
    },
  },
);

// ---------- Cueva de los Sueños: Kirby ----------

MAPS['gb-cueva'].npcs = (MAPS['gb-cueva'].npcs || []).concat({
  id: 'gb_kirby', sprite: 'kirby', x: 15, y: 13,
  async talk(ctx) {
    if (ctx.flag('gbKirbyExtra')) {
      await ctx.say([rand([
        '* ¡Poyo! (En Dream Land todavía no copiaba poderes.\n* Eso empezó en Kirby\'s Adventure, de NES.)',
        '* ¡Poyo! (Su primer juego salió en 1992, en Game Boy.\n* Lo dirigió Masahiro Sakurai.)',
        '* ¡Poyo! (En Link\'s Awakening hay unos Anti-Kirby\n* en la Torre del Águila. Kirby no quiere hablar de eso.)',
      ])], 'KIRBY');
      return;
    }
    await ctx.say([
      '* ¡Poyo! (Kirby. El de verdad. De Dream Land.)\n* (Te mira, mira a la bolita que ronca... y se encoge de hombros.)',
      '* (Te susurra un código de la pantalla de título:\n* ARRIBA + A + SELECT. Abre el EXTRA GAME, mucho más difícil.)',
    ], 'KIRBY');
    if (await ctx.choose(['probar', 'luego'], 'KIRBY') === 1) return;
    const res = await gbReto(ctx, 'EXTRA GAME:', pickWords(WORDS.t2, 6), 380, 2500);
    if (!res.completed) {
      await ctx.say(['* ¡Poyo! (Kirby te infla los cachetes: así se ve alguien que perdió.)'], 'KIRBY');
      return;
    }
    ctx.setFlag('gbKirbyExtra');
    Sfx.coin();
    await ctx.say(['* ¡POYO! (Kirby te regala una foto suya... blanca.\n* En la caja americana de Dream Land salió así.)'], 'KIRBY');
    await ctx.give('kirby_blanco');
  },
});

// ---------- Isla Koholint ----------

// Leyenda: A arena de la Playa Toronbo. El huevo del Pez del Viento son 4 personajes (2x2).
const GB_KOHOLINT_MAP = [
  'TTTTTTTTTTTTTTTTT:TTTTTT',
  'T######....####T.:.....T',
  'T#####......###T.:.*...T',
  'T#####......###T.:.....T',
  'T######....####T.:..S..T',
  'T#######:S#####..:.....T',
  'TTTT....:.......::..TTTT',
  'T,,,....::::::::::..,,,T',
  'T,,,......:.........,,,T',
  'T*........:..........*.T',
  '#AAAAAAAAA:AAAAAAAAAAAA#',
  '#AAAAAAAAAAAAAAAAAAAAAA#',
  '#AAAAAAAAAAAAAAAAAAAAAA#',
  '#~~~~~~~~~~~~~~~~~~~~~~#',
  '~~~~~~~~~~~~~~~~~~~~~~~~',
  '~~~~~~~~~~~~~~~~~~~~~~~~',
];

// El huevo: lo mismo en sus 4 casillas.
async function gbHuevoTalk(ctx) {
  if (ctx.flag('gbMarin')) {
    await ctx.say(['* (El huevo se mueve un poquito, como si soñara con una canción.)\n* (...Mejor no lo despiertes todavía.)']);
    return;
  }
  await ctx.say([
    '* Un huevo GIGANTE en la cima del Monte Tamaranch.\n* Adentro duerme el PEZ DEL VIENTO. Se oye roncar.',
    '* Para despertarlo hacen falta los 8 Instrumentos de las Sirenas\n* y la Balada del Pez del Viento.',
  ]);
}

addMaps('gb', {
  entry: WORLDS.find((w) => w.id === 'gb').entry,
  maps: {
    'gb-koholint': {
      name: 'Isla Koholint',
      intro: ['* ¡Huele a mar! Esto parece la Isla Koholint, la de Link\'s Awakening.', '* Allá arriba, en el monte, hay algo enorme y redondo...'],
      music: 'gb_koholint',
      map: GB_KOHOLINT_MAP,
      tiles: { A: { s: 'arena' } },
      regions: [
        { x0: 1, y0: 1, x1: 14, y1: 5, era: 'gb', name: 'Monte Tamaranch' },
        { x0: 0, y0: 10, x1: 23, y1: 13, era: 'gb', name: 'Playa Toronbo' },
      ],
      spawns: { start: [17, 1, 'down'] },
      exits: { '17,0': { map: 'gb-valle', spawn: [12, 28, 'up'] } },
      signs: {
        '20,4': ['* ISLA KOHOLINT', '* (Abajo, alguien escribió: "Link\'s Awakening salió en 1993.\n* Empezó como un proyecto de los programadores después del trabajo.")'],
        '9,5': '* MONTE TAMARANCH\n* Silencio, por favor: aquí duerme alguien muy grande.',
      },
      looks: { agua: '* El mar. A lo lejos no se ve nada más...\n* como si la isla fuera lo único que existe.' },
      bitTips: [
        '* En Link\'s Awakening, Link naufraga y despierta en esta isla.',
        '* ¿Oyes eso? Alguien canta en la playa.',
        '* Un búho me dijo un secreto de esta isla... pero no te lo digo. Spoiler.',
      ],
      npcs: [
        { id: 'gb_huevo_a', sprite: 'huevo_a', x: 8, y: 2, talk: gbHuevoTalk },
        { id: 'gb_huevo_b', sprite: 'huevo_b', x: 9, y: 2, talk: gbHuevoTalk },
        { id: 'gb_huevo_c', sprite: 'huevo_c', x: 8, y: 3, talk: gbHuevoTalk },
        { id: 'gb_huevo_d', sprite: 'huevo_d', x: 9, y: 3, talk: gbHuevoTalk },
        {
          id: 'gb_marin', sprite: 'marin', x: 5, y: 11,
          async talk(ctx) {
            await gbLadronLine(ctx, 'gb_marin');
            if (ctx.flag('gbMarin')) {
              await ctx.say([rand([
                '* ¿Sabes qué quisiera? Ser gaviota.\n* Volaría lejísimos, a donde nadie ha ido.',
                '* ¿Me confundiste con una tal Zelda? A Link le pasó igual\n* cuando despertó en mi casa.',
                '* Yo encontré a Link tirado aquí en la playa.\n* Su espada apareció después, en la arena.',
              ])], 'MARIN');
              return;
            }
            await ctx.say([
              '* (Una muchacha canta mirando el mar.)\n* ¡Hola! Soy MARIN. Canto la Balada del Pez del Viento.',
              '* Dicen que despierta al que duerme en el monte.\n* ¿Me ayudas? Escribe su nombre sin un solo error.',
            ], 'MARIN');
            const res = await gbReto(ctx, 'Sin errores:', ['balada del pez del viento'], 650, 3000);
            if (!res.completed || res.errors) {
              await ctx.say(['* Casi... la balada es delicada.\n* ¡Otra vez, sin errores!'], 'MARIN');
              return;
            }
            ctx.setFlag('gbMarin');
            Sfx.secret();
            await ctx.say(['* ¡Qué bonito! El huevo de allá arriba se movió, ¿viste?\n* Toma: para que te acuerdes de la isla.'], 'MARIN');
            await ctx.give('caracola');
          },
        },
        {
          // Link no habla. Nunca habla.
          id: 'gb_link', sprite: 'link_gb', x: 17, y: 11,
          async talk(ctx) {
            if (ctx.flag('gbLadron')) {
              await ctx.say(['* (Link te mira. Luego mira hacia la tienda de la aldea.)\n* (Asiente despacito: él también fue LADRON alguna vez.)'], 'LINK');
              return;
            }
            const lines = [
              '* ...\n* (Link no dice nada. Nunca dice nada. Pero te saluda con el escudo.)',
              '* ...\n* (Link escribe en la arena: "1993". Es el año de su aventura en Game Boy.)',
              '* ...\n* (Link señala la tienda de la aldea. Luego al tendero.\n* Luego hace como que corre. ¿Qué querrá decir?)',
              '* ...\n* (Link escribe en la arena: "PRIMER ZELDA DE BOLSILLO".\n* Y lo subraya dos veces.)',
            ];
            await ctx.say([lines[ctx.counter('gbLink') % lines.length]], 'LINK');
          },
        },
      ],
    },
  },
});
