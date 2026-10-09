// Lo que el Reino 16-Bit agrega al Pueblo Vitrina (sin tocar js/town-data.js):
//   MAESTRA MODO: sala de arcade (Pista Cero, Escuadrón Zorrino) y el interruptor de acentos.
//   Los amigos perdonados del Reino 16-Bit se mudan al Barrio 16 Bits (Dino Huevín tiene una misión).
//   Dónde se para cada quien lo decide BARRIOS (js/town-data.js): x, y de aquí son de respaldo.
//   Don Chip reconoce la Etiqueta en blanco y la Super Nintendo.

(() => {
  const d = () => Save.data;
  const open = () => worldUnlocked(WORLDS.find((w) => w.id === 'snes') || {});

  const npc = (n) => TOWN.npcs.push(n);

  // ---------- Maestra Modo ----------
  npc({
    // Con el Barrio 16 Bits construido, atiende en su Sala de Arcade; antes, junto al museo.
    id: 'maestramodo', era: 'snes', sprite: 'maestramodo', x: 11, y: 3, when: open,
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
  // Platican con friendTalk (js/curiosidades.js): su línea, su dato y las curiosidades de la Super Nintendo.
  const friend = (id, opts) => npc(townFriend(id, opts));
  friend('setita', {
    say: ['* ¡Boing! El pueblo es perfecto para rebotar.\n* ¿Cómo está Hongoló? Es mi primo.'],
    facts: ['* Dato: Super Mario All-Stars (1993) juntó los Mario de la NES en un solo cartucho...\n* ¡y los volvió a dibujar con gráficos de 16 bits!'],
    bye: '* ¡Boing! ¡Boing! ¡Adiós!',
  });
  friend('gema', {
    curio: 'snes_morada',
    say: ['* Con el sol del pueblo me veo de 32 768 colores.\n* Bueno... de 256. No le digas a nadie.'],
    facts: ['* Dato real: la Super Nintendo podía elegir entre 32 768 colores...\n* pero en pantalla mostraba unos 256 a la vez. ¡Por eso lo de mis colores!'],
    bye: '* Adiós. Brilla mucho, ¿sí?',
  });
  friend('modosiete', {
    curio: 'snes_modo7',
    say: ['* Aquí el piso no gira. Qué tranquilidad.\n* ...Qué aburrido.'],
    facts: ['* Dato: el Modo 7 giraba y agrandaba UN solo fondo, como una hoja de papel.\n* ¡Por eso las pistas de F-Zero eran planitas!'],
    bye: '* Me voy a dar vueltas. Literalmente.',
  });
  friend('caballero', {
    curio: 'snes_lr',
    say: ['* ¡Mi nueva misión es cuidar este pueblo!\n* ...Ya me acordé. Era esa.'],
    facts: ['* Dato: en The Legend of Zelda: A Link to the Past (1991) había dos mundos:\n* el Mundo de la Luz y el Mundo Oscuro. ¡Y saltabas de uno a otro!'],
    bye: '* ¡Por el honor del bloque! Adiós.',
  });
  friend('monobarril', {
    say: ['* ¡Uh, uh! ¿Viste un barril por aquí?\n* Era mío. Bueno, todos son míos.'],
    facts: ['* Dato: Donkey Kong Country (1994) se veía casi en 3D...\n* porque sus dibujos los hicieron con modelos 3D en computadoras muy potentes.'],
    bye: '* ¡Uh, uh! (Se fue rodando un barril.)',
  });
  friend('vulpino', {
    curio: 'snes_superfx',
    name: 'CAPITAN VULPINO',
    say: ['* ¡Piloto! Mi escuadrón patrulla el cielo del pueblo. kzzt.'],
    facts: ['* Dato: mi juego traía un chip extra dentro del cartucho: el Super FX.\n* Le ayudaba a la consola a dibujar polígonos. kzzt.'],
    bye: '* ¡Escuadrón, a volar! kzzt.',
  });
  friend('nebula', {
    name: 'REINA NEBULA',
    say: ['* Mis hijas juegan en el agua del pueblo.\n* Crecer no es irse. Ahora lo sé.'],
    facts: ['* Dato: el chip de sonido de la Super Nintendo lo hizo Sony.\n* ¡Años antes de que Sony tuviera su propia consola!'],
    bye: '* Ve con calma, pequeño. Como las mareas.',
  });

  // Dino Huevín: la misión "Huevos perdidos" (lore §6.7).
  npc({
    id: 'f-dinohuevin', sprite: 'dinohuevin', x: 9, y: 10, when: () => !!d().spared.dinohuevin,
    async talk(ctx) {
      if (Quests.state('snes_huevos') !== 'active') {
        await friendTalk(ctx, 'dinohuevin', {
          curio: 'snes_yoshi',
          say: () => [rand([
            '* ¡Ñam! Nací en un juego que venía con la consola.\n* ¡Y tengo lengua larga!',
            '* ¿Me trajiste fruta? ¿No? ...¿Y ahora?',
          ])],
          facts: ['* Dato: Super Mario World venía con la Super Nintendo, y ahí apareció Yoshi por primera vez.\n* ¡Un dinosaurio que se come todo! Me identifico.'],
          bye: '* ¡Ñam! Adiós. ¿Seguro que no traes fruta?',
        });
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
