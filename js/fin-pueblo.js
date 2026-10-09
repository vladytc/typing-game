// Lo que el FINAL agrega al Pueblo Vitrina (docs/LORE.md §10, §11 y §12.1). Se carga después de
// js/town-data.js y de los *-pueblo.js de cada mundo, y solo AGREGA o envuelve cosas:
//   - LA TELE DEL CANAL VACIO en la plaza (12, 10): aparece con Save.data.flags.finalAbierto
//     (lo pone el jefe del Wii). Entrar → js/scenes/fin-canal.js → batalla js/scenes/fin-glitch.js.
//     Con el final neutral se queda prendida para repetir la batalla.
//   - EL GLITCH (con su nombre) en la banca junto a la vitrina (4, 5), con un chiste por día.
//   - El epílogo al volver de los créditos, Don Chip (la foto de la vitrina completa), el Anciano
//     y el Roncatón hablan del post-juego, y la reja del camino del este abre LA CUEVA ROJA.
//   - La vitrina muestra el cartucho de 1989 y, si lo rescatas, el Virtual Boy.

(() => {
  const d = () => Save.data;
  const F = () => Save.data.flags;

  // ESC en la Cueva Roja ("Volver al pueblo") te deja junto al camino del este.
  TOWN.spawns['pipe:vb'] = [18, 6, 'left'];

  // ---------- La tele del Canal Vacío ----------
  TOWN.npcs.push({
    id: 'fin-tele', sprite: 'fin_tele', x: 12, y: 10,
    when: () => !!F().finalAbierto && !F().finBueno,
    async talk(ctx) {
      if (F().finNeutral) {
        await ctx.say(['* La tele sigue mostrando CANAL VACIO.\n* La estática suena bajito. ...Él sigue ahí adentro, solito.']);
        if (await ctx.choose(['volver a entrar', 'todavía no']) === 1) { await ctx.say(['* Cuando quieras. La tele no se va a apagar.'], 'BIT'); return; }
        F().finFase = 1;
        Save.write();
        Sfx.warp();
        Game.go('fin', { back: 'town', fase: 1 });
        return;
      }
      if (!ctx.flag('finTeleVista')) {
        ctx.setFlag('finTeleVista');
        await ctx.say([
          '* Una tele vieja apareció en medio de la plaza.\n* Nadie sabe quién la trajo.',
          '* La pantalla tiembla. Estática magenta.\n* Arriba, en letras rotas: C#NAL VAC%O.',
        ]);
        await ctx.say([
          '* Es aquí. Es él. El del cartucho sin nombre.',
          '* Dani dijo que no fuéramos solos...\n* Y creo que no vamos a ir solos.',
        ], 'BIT');
      } else await ctx.say(['* CANAL VACIO. La estática te llama bajito.']);
      if (await ctx.choose(['entrar', 'todavía no']) === 1) { await ctx.say(['* Ok. Aquí te espero. ...Bueno, aquí te esperamos.'], 'BIT'); return; }
      Sfx.warp();
      Game.go('fincanal', { back: 'town' });
    },
  });

  // ---------- El Glitch, ya con nombre, en la banca junto a la vitrina ----------
  const SALUDOS = [
    (n) => `* ¡Hola! Soy ${n}. ...Todavía me emociona decirlo.`,
    () => '* Desde esta banca se ve toda la vitrina.\n* Mi cartucho está en medio. Lo saludo diario.',
    () => '* Hoy Bit me enseñó a parpadear como cursor.\n* Me salió con estática. Pero me salió.',
    () => '* Don Chip dice que soy HISTORIA.\n* Yo le digo que él es más historia que yo. Se ríe.',
  ];
  TOWN.npcs.push({
    id: 'fin-glitch', sprite: 'glitch_banca', x: 4, y: 5,
    when: () => !!F().finBueno && !!finName(),
    async talk(ctx) {
      const N = FIN_NAME_UP();
      await ctx.say([rand(SALUDOS)(finName())], N);
      const i = await ctx.choose(['un chiste', 'cómo estás', 'adiós'], N);
      if (i === 0) {
        const today = finDayIndex();
        const repeat = F().finChisteDia === today;
        F().finChisteDia = today;
        if (!repeat) F().finChistes = (F().finChistes || 0) + 1;
        Save.write();
        await ctx.say([`* ${repeat ? '¿Otra vez el de hoy? Ok:\n* ' : 'El chiste de hoy:\n* '}${finChisteDelDia()}`], N);
        Sfx.laugh();
        await ctx.say([repeat
          ? '* (Solo se sabe uno por día. Mañana tendrá otro.)'
          : rand(['* BIT: ...Ese estuvo malísimo. ¡Me encantó!', '* BIT: Jajaja... ja... ¿Ya? ¿Era todo?', '* (Toby se ríe desde lejos. Eso cuenta.)', `* BIT: Llevas ${F().finChistes} chistes. Todos malísimos. Sigue así.`])]);
        return;
      }
      if (i === 1) {
        await ctx.say([rand([
          '* Bien. Muy bien. Ya no tengo que cuidar a nadie en pausa.\n* Ahora solo me cuidan a mí. Es raro. Raro bonito.',
          '* A veces todavía se me rompe una letra al hablar. Pero ya casi no.',
          '* Las consolas se apagan en la noche y se prenden en la mañana.\n* Y ya no me da miedo. Se llama "descansar".',
          '* Bit dice que somos hermanos. Yo le digo que él es el menor.\n* ...Él dice que él es el más guapo.',
        ])], N);
        return;
      }
      await ctx.say(['* ¡Adiós! Aquí voy a estar. En la banca. Con nombre.'], N);
    },
  });

  // ---------- Epílogo (al volver de los créditos) ----------
  async function finEpilogo(ctx, final) {
    const s = d();
    if (final === 'bueno') {
      const N = FIN_NAME_UP();
      await ctx.say(['* (Regresas al pueblo. Huele a pan y a píxeles recién horneados.)']);
      await ctx.say(['* ¡Mira quién está sentado en la banca, junto a la vitrina!'], 'BIT');
      await ctx.say([`* Hola. Soy ${finName()}.\n* ...Se siente raro decirlo. Raro bonito.`], N);
      await ctx.say([
        '* Por fin abrimos la caja del sótano. Adentro estaba su cartucho.',
        s.treasures.etiqueta_blanca
          ? `* Le pegamos la Etiqueta en blanco... y escribí "${finName()}" con mi mejor letra.`
          : `* Le hice una etiqueta y escribí "${finName()}" con mi mejor letra.`,
        '* Ya está en la vitrina, en medio de todas las consolas.\n* Eso, mi joven amigo, es HISTORIA.',
      ], 'DON CHIP');
      if (s.flags.daniPresta && TECLOIDES[s.flags.daniPresta]) {
        await ctx.say([`* ¿Y mi ${upper(TECLOIDES[s.flags.daniPresta].name)}? ¿Me lo regresas?\n* ...Bueno, quédatelo un día más. Pero solo uno.`], 'DANI TURBO');
      }
      await ctx.say(['* Psst. Desde hoy cuenta un chiste nuevo cada día.\n* Son malísimos. Ve a escucharlos.'], 'BIT');
    } else {
      await ctx.say(['* (Regresas al pueblo. Todo está igual... casi.)']);
      await ctx.say(['* Puse el cartucho gris en la vitrina. "SIN NOMBRE".\n* Se ve muy solito ahí en medio.'], 'DON CHIP');
      await ctx.say(['* ...La tele de la plaza sigue prendida.\n* Si quieres, un día volvemos. Yo creo que había otra forma.'], 'BIT');
    }
    await ctx.say(['* Y oye... el Roncatón dice que al este, detrás de la reja,\n* algo ROJO se despertó. ¿Vamos? ¡Cuando quieras!'], 'BIT');
    delete s.flags.finEpilogo;
    Save.write();
    Quests.start('cueva_roja');
  }

  const baseEnter = Scenes.town.enter;
  Scenes.town.enter = function (params) {
    baseEnter.call(this, params);
    clearInterval(this.finIv);
    if (!this.pueblo || !F().finEpilogo) return;
    this.finIv = setInterval(() => {
      if (Game.scene !== this) { clearInterval(this.finIv); return; }
      if (this.mode !== 'walk') return;
      clearInterval(this.finIv);
      const fin = F().finEpilogo;
      if (fin) this.run((ctx) => finEpilogo(ctx, fin));
    }, 700);
  };
  const baseExit = Scenes.town.exit;
  Scenes.town.exit = function () {
    clearInterval(this.finIv);
    baseExit.call(this);
  };

  // ---------- La reja del camino del este: LA CUEVA ROJA ----------
  const gate = TOWN.npcs.find((n) => n.id === 'camino-este');
  if (gate) {
    const base = gate.talk;
    gate.talk = async function (ctx) {
      if (!F().finJugado) return base.call(this, ctx);
      if (!ctx.flag('vbReja')) {
        ctx.setFlag('vbReja');
        await ctx.say([
          '* CAMINO DEL ESTE',
          '* ¡El candado de la reja está abierto!\n* En el piso hay un cartelito: "SE ABRE AL TERMINAR EL JUEGO."',
        ]);
        await ctx.say(['* Al fondo brilla algo rojo y enorme... ¿un cartucho?\n* ¡Un cartucho del tamaño de una casa!'], 'BIT');
      }
      if (await ctx.choose(['entrar', 'luego']) === 1) return;
      Sfx.confirm();
      Game.go('town', { map: 'vb-claro', spawn: [1, 7, 'right'] });
    };
  }

  const ronca = TOWN.npcs.find((n) => n.id === 'roncaton-despierto');
  if (ronca) {
    const base = ronca.talk;
    ronca.talk = async function (ctx) {
      if (!F().finJugado) return base.call(this, ctx);
      if (d().consoles.virtualboy) {
        await ctx.say(['* Mmmh... ya no sueño rojo. Ahora sueño de colores.', '* ...Gracias por ir allá atrás. Alguien tenía que ir.'], 'RONCATON');
        return;
      }
      await ctx.say(['* Ya pasó lo morado. Lo oí desde aquí. Qué bonito final.', '* Ahora... lo rojo. Está allá atrás, detrás de la reja.\n* Yo lo soñé desde 1995.'], 'RONCATON');
    };
  }

  // El Anciano (ex probador de juegos) explica la Cueva Roja (§2.7).
  const viejo = TOWN.npcs.find((n) => n.id === 'viejo');
  if (viejo) {
    const base = viejo.talk;
    viejo.talk = async function (ctx) {
      if (F().finJugado && !ctx.flag('viejoRoja')) {
        ctx.setFlag('viejoRoja');
        await ctx.say([
          '* ...Así que terminaste el juego. Y aun así sigues aquí.\n* Eso dice mucho de ti.',
          '* Yo fui probador de juegos, ¿sabes? En 1995 probé una consola roja.\n* Un visor. Te ponías la cara ahí... y todo era rojo y negro.',
          '* La gente dijo que mareaba. Que era un fracaso.\n* ...Nadie la volvió a mirar.',
          '* Está detrás del Roncatón. Allá adentro, escribe siempre lo que está ADELANTE.\n* Y descansa la vista. Es peligroso ir cansado.',
        ], 'ANCIANO');
        return;
      }
      return base.call(this, ctx);
    };
  }

  // Don Chip: el cartucho de 1989, el Virtual Boy y la foto de la vitrina completa (§11.3).
  const chip = TOWN.npcs.find((n) => n.id === 'donchip');
  if (chip) {
    const base = chip.talk;
    chip.talk = async function (ctx) {
      const s = d();
      if (s.flags.finJugado && !ctx.flag('chipFin')) {
        ctx.setFlag('chipFin');
        await ctx.say(s.flags.finBueno ? [
          `* ¡El cartucho de mi cajón tiene nombre! "${finName()}".`,
          '* Treinta años lo guardé sin saber por qué.\n* ...Ahora sé por qué.',
        ] : ['* Ese cartucho gris... lo puse en medio de la vitrina.\n* Algún día le pondremos nombre. Yo sé que sí.'], 'DON CHIP');
      }
      if (s.consoles.virtualboy && !ctx.flag('chipVB')) {
        ctx.setFlag('chipVB');
        await ctx.say([
          '* ¡¿El VIRTUAL BOY?! ¡Lo tenía en el sótano, con pena!',
          '* Salió en 1995. Solo mostraba rojo sobre negro.\n* Y lo diseñó Gunpei Yokoi, el mismo de la Game Boy.',
          '* Le voy a poner su propio estante con un letrero:\n* "FRACASO FAMOSO. LO QUEREMOS IGUAL."',
        ], 'DON CHIP');
      }
      const all = CONSOLES.every((c) => s.consoles[c.id]);
      if (all && s.flags.finBueno && !s.treasures.foto_vitrina) {
        await ctx.say([
          '* Siete consolas... y un cartucho con nombre.\n* La vitrina está completa. Nunca pensé verla así.',
          '* Te voy a decir el último dato que sé. El más importante:',
          '* La mejor consola es la que juegas con alguien.',
          '* Toma. Les tomé una foto a todas. Para que nunca se te olvide.',
        ], 'DON CHIP');
        await ctx.give('foto_vitrina');
        return;
      }
      return base.call(this, ctx);
    };
  }

  // ---------- La vitrina: el cartucho de 1989 y el estante del Virtual Boy ----------
  const vit = Scenes.vitrina;
  const baseBuild = vit.build;
  vit.build = function () {
    baseBuild.call(this);
    if (this.room !== 'pueblo') return;
    const s = d();
    const extra = [];
    const tre = (tid) => ({ sprite: TREASURES[tid].sprite || tid, got: !!s.treasures[tid], name: TREASURES[tid].name, desc: TREASURES[tid].desc, colors: charColors(TREASURES[tid].sprite || tid, 'snes') });
    if (s.treasures.fin_cartucho) {
      extra.push({ title: 'EL CARTUCHO DE 1989', slots: Object.keys(TREASURES).filter((t) => TREASURES[t].room === 'fin').map(tre) });
    }
    if (s.consoles.virtualboy) {
      const c = CONSOLES.find((x) => x.id === 'virtualboy');
      const vb = Object.keys(TREASURES).filter((t) => TREASURES[t].room === 'vb').map(tre);
      extra.push({ title: 'VIRTUAL BOY: "FRACASO FAMOSO. LO QUEREMOS IGUAL."', slots: [{ sprite: c.id, got: true, name: `${c.name} (${c.year})`, facts: c.facts, colors: charColors(c.id, 'snes') }, ...vb] });
    }
    this.rows.splice(1, 0, ...extra);
  };
})();
