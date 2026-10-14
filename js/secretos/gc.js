// Secretos jugables del mundo gc: curiosidades con el dato real (ver js/secretos.js).
//
//   gc_nes      "Una NES en tu casa" (Animal Crossing). En el Pueblo de Bellota vive NUEZ, una
//               ardilla que enterró su mueble favorito "junto al farol solito" y no se acuerda
//               dónde. Junto al farol de abajo (20, 13) hay una grieta con forma de estrella
//               (21, 13): al cavar sale una NES con Donkey Kong, que se queda en el jardín y se
//               puede jugar (el minijuego BARRILES de js/scenes/kongo.js, de regreso a Bellota).
//   n64_huevos  "Stop 'n' Swop", parte GameCube. En la Estación Visor (22, 16) hay una máquina
//               rara con dos huecos de huevo y uno de llave. Lee los objetos de SWOP_EGGS que se
//               juntan en el mundo N64 (Save.data.flags.swop): con menos de 3 da una pista; con
//               los 3, los huevos se abren y dan la Mochila de Banjo.
//
// js/worlds/gc-mapa.js se carga DESPUÉS de este archivo, así que los NPC se suman a sus mapas
// envolviendo addMaps (solo cuando el mundo GameCube registra sus zonas).

// ---------- Sprites (colores fijos de la GameCube, GC_PAL de js/worlds/gc.js) ----------
Object.assign(SPRITES, {
  // La NES de mueble con su control (también es el sprite del secreto en el museo).
  nes_mueble: gcArt([
    '................',
    '................',
    '................',
    '.nnnnnnnnnnnnnn.',
    '.nppppppppppppn.',
    '.npnnnnnnnnnnpn.',
    '.npnwwwwwwwwnpn.',
    '.npnnnnnnnnnnpn.',
    '.nppppppppppppn.',
    '.nnnnnnnnnnnnnn.',
    '.nrnpnpppnnpnnn.',
    '.nppppppppppppn.',
    '.nnnnnnnnnnnnnn.',
    '..n.............',
    '.nnnnnn.........',
    '.npnrrn.........',
  ]),
  // La grieta con forma de estrella: aquí hay algo enterrado (como en Animal Crossing).
  gc_grieta: gcArt([
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '.......n........',
    '....n..k..n.....',
    '.....k.n.k......',
    '......knk.......',
    '..nkkknnnkkkn...',
    '......knk.......',
    '.....k.n.k......',
    '....n..k..n.....',
  ]),
  // NUEZ, la ardilla vecina de Bellota (con delantal verde y cola esponjada).
  gc_nuez: gcArt([
    '..n...n....nnn..',
    '.nkn.nkn..nkkkn.',
    '.nkknkkkn.nkokn.',
    '.nkkkkkkn..nkokn',
    '.nknkknkn..nkokn',
    '.nkkeekkn..nkokn',
    '..nkeenn...nkokn',
    '...nnnn...nkookn',
    '..ngggggn.nkokn.',
    '.nkgwwwgknkookn.',
    '.nkgwwwgkkkokn..',
    '..ngggggnkkkn...',
    '..ngggggnnnn....',
    '...nkn.nkn......',
    '...nkn.nkn......',
    '..nnn...nnn.....',
  ]),
  // La máquina que "lee" cosas de otra época: pantallita, dos huecos de huevo y uno de llave.
  gc_swopera: gcArt([
    '.......yy.......',
    '.......nn.......',
    '.nnnnnnnnnnnnnn.',
    '.nllllllllllllnn',
    '.nlnnnnnnnnnnlnn',
    '.nlnssssssssnlnn',
    '.nlnswssssssnlnn',
    '.nlnnnnnnnnnnlnn',
    '.nllllllllllllnn',
    '.nlnnlnnlnlnllnn',
    '.nlnnlnnlnnnlrnn',
    '.nlnnlnnlnlnllnn',
    '.nllllllllllllnn',
    '.nnnnnnnnnnnnnnn',
    '..nin......nin..',
    '..nnn......nnn..',
  ]),
  // Huevo misterioso, rosa con manchas azules (sprite del secreto en el museo).
  huevo_swop: Object.assign([
    '................',
    '......nnnn......',
    '.....nmmmmn.....',
    '....nmwmmmmn....',
    '....nwmmummn....',
    '...nmmmuuummn...',
    '...nmmmmummmn...',
    '...nmummmmmmn...',
    '..nmuuummmmmmn..',
    '..nmmummmmummn..',
    '..nmmmmmmuuumn..',
    '..nmmmmmmmummn..',
    '...nmmmmmmmmn...',
    '....nnmmmmnn....',
    '......nnnn......',
    '................',
  ], { pal: { ...GC_PAL, m: '#F48FB1' } }),
  // La recompensa: la mochila azul de Banjo, con Kazooie asomándose.
  mochila_banjo: gcArt([
    '......nn........',
    '.....nrrn.......',
    '....nrwnrn......',
    '....nrrrnyyn....',
    '.....nrrnnnn....',
    '...nnnnnnnnnn...',
    '..nuuuuuuuuuun..',
    '..nusssssssusn..',
    '..nuuuuuuuuuun..',
    '..nuunnnnnnuun..',
    '..nuunyyyynuun..',
    '..nuunnnnnnuun..',
    '..nuuuuuuuuuun..',
    '..nuuuuuuuuuun..',
    '...nnnnnnnnnn...',
    '................',
  ]),
});

Object.assign(TREASURES, {
  mochila_banjo: { room: 'gc', name: 'Mochila de Banjo', desc: 'Azul, con un pájaro rojo adentro. Salió de los huevos de Stop \'n\' Swop... ¡por fin!' },
});

// ---------- Curiosidades (las tarjetas de los secretos) ----------
addCuriosities({
  secreto_gc_nes: {
    console: 'gamecube',
    title: 'Una NES en tu casa',
    caption: 'En Animal Crossing (GameCube) las consolas NES eran muebles ¡y se jugaban de verdad! Donkey Kong te lo regalaba un vecino en tu cumpleaños; Ice Climber solo salía con una tarjeta e-Reader.',
    draw(g, w, h) {
      const C = GCP;
      const N = NES10;
      const p = pixelArt(g, w, h, 64, 40, '#F5E6B8');
      // Cuarto de Animal Crossing: papel tapiz a rayas y piso de madera.
      for (let x = 0; x < 64; x += 4) p.r(x, 0, 2, 26, '#EBD08F');
      p.r(0, 26, 64, 14, '#C9A66B');
      for (let y = 28; y < 40; y += 4) p.r(0, y, 64, 1, '#8B5E3C');
      // La tele con Donkey Kong: vigas rojas inclinadas, una escalera y un barril.
      p.round(14, 4, 36, 22, '#4B3F9E', C.K).r(17, 7, 30, 16, N.K);
      [[19, 20], [21, 16], [19, 12]].forEach(([x, y], k) => {
        for (let i = 0; i < 24; i++) p.r(x + i, y + Math.floor((k % 2 ? 24 - i : i) / 12), 1, 1, N.F);
      });
      p.r(38, 13, 1, 7, N.S).r(40, 13, 1, 7, N.S).r(38, 15, 3, 1, N.S).r(38, 18, 3, 1, N.S);
      p.r(22, 9, 3, 3, N.R).r(23, 9, 1, 1, N.P);                 // el gorila, de lejos
      p.r(30, 14, 2, 2, N.P);                                    // un barril rodando
      p.r(27, 19, 2, 1, N.F).r(27, 17, 2, 2, N.S);               // el héroe del overol
      // La NES abajo de la tele, con su control.
      p.r(18, 28, 22, 8, C.K).r(19, 29, 20, 3, C.P).r(19, 32, 20, 3, '#7c7c7c').r(20, 30, 18, 1, C.K).r(21, 33, 1, 1, C.R);
      p.r(44, 33, 9, 4, C.K).r(45, 34, 7, 2, C.P).r(49, 34, 1, 1, C.R).r(51, 34, 1, 1, C.R).r(41, 31, 4, 1, C.K);
      p.rows(56, 4, SPARKLE, { x: C.W }).rows(4, 8, SPARKLE, { x: C.W });
    },
  },
  secreto_n64_huevos: {
    console: 'n64',
    title: 'Stop \'n\' Swop',
    caption: 'Banjo-Kazooie (N64, 1998) escondía huevos y una llave de hielo: había que apagar la consola y cambiar el cartucho en segundos para pasarlos a Banjo-Tooie. Nunca funcionó así; se usaron hasta Xbox Live Arcade, en 2008.',
    draw(g, w, h) {
      const C = N64P;
      const p = pixelArt(g, w, h, 64, 40, C.K);
      const egg = (x, y, fill, spot) => {
        p.shape(x, y, 11, 14, fill, C.K, (i, j) => ((i - 5) / 5.5) ** 2 + ((j - 7.5) / (j < 7 ? 7.5 : 6.5)) ** 2 <= 1);
        p.r(x + 3, y + 4, 2, 2, spot).r(x + 6, y + 8, 3, 2, spot).r(x + 3, y + 10, 2, 1, spot).r(x + 3, y + 2, 1, 2, C.W);
      };
      // Dos cartuchos y una flecha entre ellos: el cambio "con la consola apagada".
      p.round(2, 4, 14, 12, C.G, C.D).r(4, 6, 10, 6, C.R).r(6, 16, 6, 2, C.D);
      p.round(48, 4, 14, 12, C.G, C.D).r(50, 6, 10, 6, C.Y).r(52, 16, 6, 2, C.D);
      p.rows(25, 7, ['....x...', 'xxxxxx..', 'xxxxxxx.', 'xxxxxx..', '....x...'], { x: C.W });
      // Los huevos y la llave de hielo.
      egg(10, 22, '#f48fb1', C.B);
      egg(26, 22, C.B, C.S);
      p.shape(44, 24, 6, 6, C.S, C.B, (i, j) => (i - 2.5) ** 2 + (j - 2.5) ** 2 <= 7);   // aro de la llave
      p.r(46, 26, 2, 2, C.K).r(50, 26, 10, 2, C.S).r(55, 28, 2, 3, C.S).r(58, 28, 2, 2, C.S);
      p.rows(40, 20, SPARKLE, { x: C.W }).rows(22, 34, SPARKLE, { x: C.L });
    },
  },
});

// ---------- gc_nes: Nuez y la grieta junto al farol ----------
// Prende la NES del jardín: BARRILES (kongo.js) y de regreso a Bellota. Game.go cambia de escena;
// la plática se queda esperando para siempre (igual que BROTITOS en gc-pueblo.js).
const gcJugarNes = () => { Game.go('kongo', { endless: true, back: 'town' }); return new Promise(() => {}); };

const GC_NPC_NUEZ = {
  id: 'gc-nuez', sprite: 'gc_nuez', x: 8, y: 9,
  async talk(ctx) {
    if (ctx.flag('gcNesDug')) {
      const lines = [
        ['* ¡Mi NES! Gracias por desenterrarla.\n* Se queda en el jardín para que la juegues cuando quieras. ¡Es un regalo!'],
        ['* En mi pueblo de antes, los vecinos te regalaban muebles.\n* Y algunos muebles... ¡se podían jugar!'],
        ['* La enterré para que la sombra morada no se la llevara.\n* Las ardillas guardamos todo. Luego se nos olvida dónde.'],
      ];
      await ctx.say(lines[ctx.counter('gcNuez') % lines.length], 'NUEZ');
      return;
    }
    if (!ctx.flag('gcNuez0')) {
      ctx.setFlag('gcNuez0');
      await ctx.say([
        '* ¡Hola, hola, bellotita! Soy NUEZ. Vivo en la casita de aquí al lado.',
        '* Cuando llegó la sombra morada, enterré mi mueble favorito para esconderlo.\n* ...Y se me olvidó dónde. ¡Ay, mi cabeza de ardilla!',
      ], 'NUEZ');
      return;
    }
    const lines = [
      ['* Me acuerdo de que había un farol. Uno solito, sin hermano.\n* Los otros dos faroles siempre andan juntos.'],
      ['* En mi pueblo de antes, si veías una grieta en el suelo con forma de estrella...\n* ¡había algo enterrado! Había que cavar.'],
      ['* Mi mueble era gris, con un control y un juego de un gorila.\n* ¿Lo has visto? No, ¿verdad? Está enterrado. Ya sé.'],
    ];
    await ctx.say(lines[ctx.counter('gcNuez') % lines.length], 'NUEZ');
  },
};

const GC_NPC_NES = {
  id: 'gc-nes', x: 21, y: 13,
  // El sprite se lee al entrar al mapa: grieta mientras no caves, la NES después.
  get sprite() { return Save.data.flags.gcNesDug ? 'nes_mueble' : 'gc_grieta'; },
  async talk(ctx) {
    if (ctx.flag('gcNesDug')) {
      await ctx.say(['* La NES de Nuez, con su cartucho de DONKEY KONG puesto.\n* Alguien la conectó a una tele chiquita en el jardín.'], 'NES');
      if (await ctx.choose(['jugar', 'dejarla'], 'NES') === 0) return gcJugarNes();
      return;
    }
    await ctx.say(['* Hay una grieta en el suelo con forma de estrella.\n* La tierra está suavecita, como si alguien la hubiera movido.']);
    if (await ctx.choose(['cavar', 'dejarla']) === 1) return;
    const texts = ['Cava, cava, cava.', '¡Algo suena!'];
    const res = await ctx.challenge({ label: 'Escribe para cavar:', texts, timeLimit: texts.join('').length * 700 + 4000, caps: true });
    if (!res.completed) { await ctx.say(['* La tierra se volvió a caer en el hoyo.\n* ¡Inténtalo otra vez!']); return; }
    ctx.setFlag('gcNesDug');
    Sfx.win();
    // Ya no es grieta: ahora se ve la NES (en 2D y en 3D).
    const town = Scenes.town;
    const e = (town.npcs || []).find((n) => n.id === 'gc-nes');
    if (e) { e.sprite = 'nes_mueble'; town.repaint(e); }
    await ctx.say([
      '* ¡TOC! La pala pega con algo duro...',
      '* ¡Es una consola NES! Gris, con su control.\n* Y trae un cartucho puesto: DONKEY KONG.',
      '* NUEZ: ¡MI MUEBLE! ¡Lo encontraste!\n* Quédatela. Bueno, se queda aquí en el jardín, pero es TUYA. ¡Regalo!',
    ]);
    await findSecret('gc_nes', ctx);
    await ctx.say(['* (En Donkey Kong de la Famicom, 1983, un gorila avienta barriles desde las vigas.)\n* ¿La prendes?'], 'NES');
    if (await ctx.choose(['jugar', 'luego'], 'NES') === 0) return gcJugarNes();
  },
};

// ---------- n64_huevos: la máquina que lee cosas de otra época ----------
const GC_SWOP_NOMBRES = { huevo_rosa: 'HUEVO ROSA', huevo_azul: 'HUEVO AZUL', llave_hielo: 'LLAVE DE HIELO' };

const GC_NPC_SWOP = {
  id: 'gc-swop', sprite: 'gc_swopera', x: 22, y: 16,
  async talk(ctx) {
    if (secretFound('n64_huevos')) {
      await ctx.say(['* La máquina rara está tranquila. Los tres huecos están vacíos y calientitos.', '* En la pantalla dice: "CAMBIO COMPLETO. GRACIAS POR ESPERAR."'], 'MAQUINA');
      if (!Save.data.treasures.mochila_banjo) await ctx.give('mochila_banjo');
      return;
    }
    const got = swopEggs();
    const pages = ['* Una máquina rara con tres huecos: dos con forma de huevo y uno con forma de llave.'];
    if (got.length < 3) {
      pages.push('* Una etiqueta vieja dice:\n* "LECTOR STOP Y CAMBIO. Traiga lo que falta... de OTRA EPOCA."');
      if (got.length) pages.push(`* ${got.length === 1 ? 'Un hueco brilla' : `${got.length} huecos brillan`}: la máquina reconoce algo que traes.\n* En la pantalla: "FALTAN ${3 - got.length}. CAMBIE EL CARTUCHO... CON LA CONSOLA APAGADA."`);
      else pages.push('* En la pantalla parpadea: "ESPERANDO DATOS... DESDE 1998."\n* (¿1998? Esta estación no es tan vieja.)');
      await ctx.say(pages, 'MAQUINA');
      return;
    }
    pages.push('* ¡Los tres huecos brillan! La máquina reconoce lo que traes.');
    await ctx.say(pages, 'MAQUINA');
    if (await ctx.choose(['meterlos', 'ahora no'], 'MAQUINA') === 1) return;
    await ctx.say([
      `* Metes el ${GC_SWOP_NOMBRES.huevo_rosa}, el ${GC_SWOP_NOMBRES.huevo_azul} y la ${GC_SWOP_NOMBRES.llave_hielo}.\n* BZZZ... clic... clic...`,
      '* La llave de hielo se derrite y abre los huevos.\n* ¡CRAC! ¡CRAC! Adentro hay algo azul...',
      '* BIT: ¡Esos huevos esperaron AÑOS para abrirse!\n* Los guardaron en otra época... y se abren aquí. ¡Increíble!',
    ], 'MAQUINA');
    await ctx.give('mochila_banjo');
    await findSecret('n64_huevos', ctx);
  },
};

// ---------- Los NPC entran a los mapas del Cubo Galáctico ----------
const GC_SECRET_NPCS = { 'gc-bellota': [GC_NPC_NUEZ, GC_NPC_NES], 'gc-visor': [GC_NPC_SWOP] };
const addMapsSinSecretosGc = addMaps;
addMaps = function (worldId, def) { // eslint-disable-line no-global-assign
  addMapsSinSecretosGc(worldId, def);
  if (worldId !== 'gc') return;
  Object.entries(GC_SECRET_NPCS).forEach(([id, list]) => {
    const m = def.maps[id];
    if (m) m.npcs = [...(m.npcs || []), ...list];
  });
};
