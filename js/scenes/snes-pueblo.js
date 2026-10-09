// Lo que el Reino 16-Bit agrega al Pueblo Vitrina (sin tocar js/town-data.js):
//   MAESTRA MODO: sala de arcade (Pista Cero, Escuadrón Zorrino) y el interruptor de acentos.
//   Los amigos perdonados del Reino 16-Bit se mudan al pueblo (Dino Huevín tiene una misión).
//   Don Chip reconoce la Etiqueta en blanco y la Super Nintendo.

(() => {
  const d = () => Save.data;
  const open = () => worldUnlocked(WORLDS.find((w) => w.id === 'snes') || {});

  // Si otro mundo ya puso a alguien en esa casilla, busca una libre al lado.
  const taken = (x, y) => TOWN.npcs.some((n) => n.x === x && n.y === y);
  const walkable = (x, y) => {
    const ch = (TOWN.map[y] || '')[x];
    return ch === '.' || ch === '*' || ch === ',';
  };
  const spot = (x, y) => {
    for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0]]) {
      if (walkable(x + dx, y + dy) && !taken(x + dx, y + dy)) return { x: x + dx, y: y + dy };
    }
    return { x, y };
  };
  const npc = (n) => TOWN.npcs.push({ ...n, ...spot(n.x, n.y) });

  // ---------- Maestra Modo ----------
  npc({
    id: 'maestramodo', sprite: 'maestramodo', x: 11, y: 3, when: open,
    async talk(ctx) {
      if (!ctx.flag('metModo')) {
        ctx.setFlag('metModo');
        await ctx.say([
          '* ¡Hola! Soy la MAESTRA MODO.\n* Llegué del Reino 16-Bit para abrir mi SALA DE ARCADE.',
          '* Cada minijefe que venzas allá deja aquí su máquina.\n* ¡Récords, récords, récords!',
        ], 'MAESTRA MODO');
        await ctx.say(['* Un control con botones de colores habla desde la mesa:\n* "En Japón y Europa soy de colores; en Estados Unidos soy morado. Es por la moda."'], 'CONTROL');
      }
      const s = d();
      const options = [];
      const actions = [];
      if (s.flags.arcade_pistacero) {
        options.push('pista cero');
        actions.push(() => Game.go('carrera', { arcade: true, back: 'town' }));
      }
      if (s.flags.arcade_zorrino) {
        options.push('escuadron zorrino');
        actions.push(() => Game.go('vulpino', { arcade: true, back: 'town' }));
      }
      const strict = s.strictAccents !== false;
      options.push(strict ? 'apagar acentos' : 'prender acentos');
      actions.push(async () => {
        s.strictAccents = !strict;
        Save.write();
        await ctx.say([strict
          ? '* Listo: los acentos, la Ñ y los signos ¡ ¿ ya NO cuentan.\n* (Para teclados que no los tienen.)'
          : '* ¡Listo! En el Reino 16-Bit los acentos y la Ñ vuelven a contar.'], 'MAESTRA MODO');
      });
      options.push('adios');
      actions.push(() => ctx.say(['* ¡Vuelve cuando quieras romper un récord!'], 'MAESTRA MODO'));
      if (options.length === 2) {
        await ctx.say(['* Todavía no tengo máquinas...\n* Vence a los minijefes del Reino 16-Bit y aparecerán aquí.'], 'MAESTRA MODO');
      } else {
        const a = s.arcade || {};
        await ctx.say([`* RECORDS: Pista Cero ${a.pistacero || 0} m · Escuadrón Zorrino ${a.zorrino || 0} oleadas.`], 'MAESTRA MODO');
      }
      const i = await ctx.choose(options, 'MAESTRA MODO');
      await actions[i]();
    },
  });

  // ---------- Amigos perdonados ----------
  const friend = (id, x, y, lines, name) => npc({
    id: `f-${id}`, sprite: ENEMIES[id] ? ENEMIES[id].sprite : id, x, y, when: () => !!d().spared[id],
    async talk(ctx) { await ctx.say([lines[ctx.counter(`f_${id}`) % lines.length]], name); },
  });
  friend('setita', 3, 6, ['* ¡Boing! El pueblo es perfecto para rebotar.\n* ¿Cómo está Hongoló? Es mi primo.'], 'SETITA');
  friend('gema', 14, 8, ['* Con el sol del pueblo me veo de 32 768 colores.\n* Bueno... de 256. No le digas a nadie.'], 'GEMA FLOTANTE');
  friend('modosiete', 4, 9, ['* Aquí el piso no gira. Qué tranquilidad.\n* ...Qué aburrido.'], 'MODOSIETE');
  friend('caballero', 10, 1, ['* ¡Mi nueva misión es cuidar este pueblo!\n* ...Ya me acordé. Era esa.'], 'CABALLERO BLOQUE');
  friend('monobarril', 17, 10, ['* ¡Uh, uh! ¿Viste un barril por aquí?\n* Era mío. Bueno, todos son míos.'], 'MONO BARRIL');
  friend('vulpino', 18, 9, ['* ¡Piloto! Mi escuadrón patrulla el cielo del pueblo. kzzt.', '* ¿Sabías? Mi juego traía un chip extra dentro del cartucho: el Super FX.'], 'CAPITAN VULPINO');
  friend('nebula', 12, 9, ['* Mis hijas juegan en el agua del pueblo.\n* Crecer no es irse. Ahora lo sé.'], 'REINA NEBULA');

  // Dino Huevín: la misión "Huevos perdidos" (lore §6.7).
  npc({
    id: 'f-dinohuevin', sprite: 'dinohuevin', x: 9, y: 10, when: () => !!d().spared.dinohuevin,
    async talk(ctx) {
      if (Quests.state('snes_huevos') !== 'active') {
        await ctx.say([rand([
          '* ¡Ñam! Nací en un juego que venía con la consola.\n* ¡Y tengo lengua larga!',
          '* ¿Me trajiste fruta? ¿No? ...¿Y ahora?',
        ])], 'DINO HUEVIN');
        return;
      }
      await ctx.say([
        '* ¡Ñam! ¡Amigo! Perdí 3 huevos en las Colinas Dinosaurio...',
        '* Cada huevo tiene un nombre escrito.\n* ¡Escríbelos con sus acentos para encontrarlos!',
      ], 'DINO HUEVIN');
      if (await ctx.choose(['vamos', 'luego'], 'DINO HUEVIN') === 1) return;
      const eggs = [['árbol', 'plátano'], ['canción', 'música'], ['océano', 'fácil']];
      for (let n = 0; n < eggs.length; n++) {
        const res = await ctx.challenge({ label: `Huevo ${n + 1} de 3:`, texts: eggs[n], timeLimit: 7000, strict: true });
        if (!res.completed) {
          await ctx.say(['* ¡Uy! El huevo rodó colina abajo.\n* Háblame otra vez para buscarlo.'], 'DINO HUEVIN');
          return;
        }
        Sfx.coin();
        await ctx.say([`* ¡Encontraste el huevo ${n + 1}!`]);
      }
      Quests.complete('snes_huevos');
      const t = giveTecloide('hongolo');
      if (t) {
        await ctx.say(['* ¡Ñam ñam! ¡Mis tres huevos!\n* ...¡De uno salió un honguito!', t], 'DINO HUEVIN');
      } else {
        await ctx.say(['* ¡Ñam ñam! ¡Mis tres huevos!\n* Toma este, lo pinté para ti.'], 'DINO HUEVIN');
        await ctx.give('huevo_pintado');
      }
    },
  });

  // ---------- Don Chip ----------
  const chip = TOWN.npcs.find((n) => n.id === 'donchip');
  if (chip) {
    const base = chip.talk;
    chip.talk = async function (ctx) {
      const s = d();
      if (s.treasures.etiqueta_blanca && Quests.state('snes_etiqueta') === 'active') {
        await ctx.say([
          '* ¿Qué traes ahí? ¿Una etiqueta... en blanco?',
          '* ...Es de la misma marca que el cartucho sin nombre de mi cajón.\n* Qué raro. Nunca supe de dónde salió ese cartucho.',
          '* (En la vitrina, algo parpadea un instante.)',
        ], 'DON CHIP');
        Quests.complete('snes_etiqueta');
      }
      if (s.consoles.snes && !ctx.flag('chipSNES')) {
        ctx.setFlag('chipSNES');
        await ctx.say([
          '* ¡¿LA SUPER NINTENDO?! ¡Y con sus botones de colores!',
          '* Fue la primera de Nintendo con botones L y R en los hombros.\n* Eso, mi joven amigo, es HISTORIA.',
        ], 'DON CHIP');
      }
      return base.call(this, ctx);
    };
  }
})();
