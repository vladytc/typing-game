// Lo que la Ciudad Sensor (Mundo 6, Wii) agrega al Pueblo Vitrina. Se carga después de
// js/town-data.js y js/town-eras.js, y solo AGREGA cosas:
//   - la paleta del Barrio Sensor (BARRIO_ERAS.wii): blanco y azul cielo,
//   - los amigos perdonados de la Ciudad Sensor (sus casas las pone BARRIOS en js/town-data.js),
//     con la misión "Caras nuevas" de Muñequito,
//   - el GIMNASIO del Entrenador Mi (boliche, tenis y box sueltos; la balanza; la musiquita del canal),
//   - el OBSERVATORIO del Capitán Cometa (si rescataste las 7 estrellitas): tus récords como constelaciones,
//   - lo que dice Don Chip de la Wii.

(() => {
  const d = () => Save.data;

  // ---------- Paleta del Barrio Sensor (todavía no es era de todo el pueblo) ----------
  if (typeof BARRIO_ERAS !== 'undefined') {
    BARRIO_ERAS.wii = {
      label: 'ERA SENSOR',
      shadows: true,
      tiles: {
        grass: { a: '#FAFAFA', b: '#C8F0D6', c: '#43D17A', d: '#2B3445' },
        tall: { a: '#FAFAFA', b: '#C8F0D6', c: '#43D17A', d: '#2B3445' },
        flower: { a: '#C8F0D6', b: '#F48FB1', c: '#43D17A', d: '#FFD54F' },
        path: { a: '#FAFAFA', b: '#E6E9EE', c: '#AAB2BD', d: '#2B3445' },
        rock: { a: '#FAFAFA', b: '#E6E9EE', c: '#AAB2BD', d: '#2B3445' },
        water: { a: '#FAFAFA', b: '#9FD8F5', c: '#5BC0EB', d: '#1E88E5' },
        roof: { a: '#FAFAFA', b: '#9FD8F5', c: '#1E88E5', d: '#2B3445' },
        wall: { a: '#FAFAFA', b: '#FAFAFA', c: '#E6E9EE', d: '#AAB2BD' },
        door: { a: '#FAFAFA', b: '#5BC0EB', c: '#1E88E5', d: '#2B3445' },
        tree: { a: '#FAFAFA', b: '#8BE3AE', c: '#43D17A', d: '#2B3445' },
        pipe: { a: '#FAFAFA', b: '#E6E9EE', c: '#AAB2BD', d: '#2B3445' },
        sign: { a: '#FAFAFA', b: '#E6E9EE', c: '#1E88E5', d: '#2B3445' },
        cave: { a: '#FAFAFA', b: '#E6E9EE', c: '#AAB2BD', d: '#2B3445' },
      },
      chars: { a: '#FAFAFA', b: '#5BC0EB', c: '#1E88E5', d: '#2B3445' },
      charOverrides: {
        bit: { a: '#FAFAFA', b: '#FAFAFA', c: '#5BC0EB', d: '#2B3445' },
        heroe: { a: '#F6D2B0', b: '#FAFAFA', c: '#1E88E5', d: '#2B3445' },
      },
    };
  }

  // Dónde esperan el Entrenador Mi y el Capitán si su barrio todavía no existe.
  if (typeof PLACE_CAMP !== 'undefined') Object.assign(PLACE_CAMP, { entrenadormi: [4, 9], cometa: [4, 10] });

  const npc = (n) => TOWN.npcs.push(n);

  // ---------- Amigos de la Ciudad Sensor ----------
  npc(townFriend('zumbito', {
    curio: 'wii_sports',
    say: ['* ¡Bzz! Aquí las flores no prenden ni apagan.\n* Pero huelen rico. Bzz.'],
    facts: ['* Bzz. Dato: el control de la Wii tenía una bocinita adentro.\n* ¡Algunos sonidos salían de tu mano, no de la tele!'],
    bye: '* Bzz... bzz... (adiós al ritmo de 600 milisegundos).',
  }));

  // Muñequito y la misión "Caras nuevas" (lore §9.7).
  const CARAS = [
    'Ojos grandes, boca chica, gorra azul.',
    'Pelo rojo y cejas muy felices.',
    'Lentes redondos y un bigote.',
    'Cara larga, ojos juntitos.',
    'Pecas, sonrisa y un moño rosa.',
  ];
  npc(townFriend('munequito', {
    curio: 'wii_mii',
    say: ['* ¡Hola! ¡Hola! (Te saluda. Tú saludas. Te saluda otra vez.)', '* Aquí en el pueblo todos tienen caras MUY complicadas.\n* Narices, orejas... ¡qué lujo!'],
    facts: ['* Dato: un Mii podía viajar en el control de la Wii...\n* ¡y aparecer en la consola de un amigo!'],
    extra: [{
      opt: 'caras nuevas',
      run: async (ctx) => {
        const f = d().flags;
        if (Quests.state('wii_caras') === 'done') {
          await ctx.say(['* ¡Ya hicimos todas mis caras nuevas!\n* Me las pongo según el día. Hoy: "pecas".'], 'MUÑEQUITO');
          return;
        }
        Quests.start('wii_caras');
        let n = f.wii_caras || 0;
        await ctx.say(['* ¡Diséñame caras! Yo te digo cómo y tú lo escribes EXACTO.\n* (Con mayúsculas, comas y punto final.)'], 'MUÑEQUITO');
        while (n < CARAS.length) {
          const text = CARAS[n];
          await ctx.say([`* Cara ${n + 1} de ${CARAS.length}: "${text}"`], 'MUÑEQUITO');
          const res = await ctx.challenge({ label: `Cara ${n + 1}/${CARAS.length}: escríbela exacta`, texts: [text], timeLimit: text.length * 700 + 3000, caps: true });
          if (!res.completed) {
            await ctx.say(['* ¡Uy! Se me borró la cara a la mitad.\n* Volvemos cuando quieras. ¡Las que ya hicimos se quedan!'], 'MUÑEQUITO');
            return;
          }
          n++;
          f.wii_caras = n;
          Save.write();
          Sfx.coin();
          await ctx.say([n < CARAS.length ? '* ¡Me encanta! (Muñequito se cambia la cara. Se ve igual. Pero él dice que no.)' : '* ¡La última! Me veo... ¡IGUALITO A TI!'], 'MUÑEQUITO');
          if (n < CARAS.length) {
            const go = await ctx.choose(['otra', 'luego'], 'MUÑEQUITO');
            if (go === 1) return;
          }
        }
        Quests.complete('wii_caras');
        await ctx.say(['* Toma: con lo que aprendí, te diseñé una cara a TI.'], 'MUÑEQUITO');
        await ctx.give('cara_mii');
      },
    }],
    bye: '* ¡Adiós! (Te despide igualito a como tú lo despides.)',
  }));

  npc(townFriend('canalclima', {
    curio: 'wii_revolution',
    say: ['* Pronóstico para el pueblo: soleado, 24°, y 100% de probabilidad de amigos.'],
    facts: ['* Dato: la Wii tenía un Canal del Tiempo de verdad.\n* ¡Te decía el clima de tu ciudad y del mundo, en un globo terráqueo que girabas!'],
    bye: '* Pronóstico para tu salida: despejado. ¡Adiós!',
  }));

  npc(townFriend('correita', {
    curio: 'wii_sports',
    say: ['* ¿Te pusiste la correa para caminar? ...Es broma.\n* (No es broma. ¿Te la pusiste?)'],
    facts: ['* Dato: en 2006 Nintendo cambió las correas por unas más gruesas...\n* ¡porque algunos jugadores las rompían de tanto agitar el control!'],
    bye: '* ¡Adiós! Y cuidado con las teles de los vecinos.',
  }));

  npc(townFriend('nunchuquin', {
    curio: 'wii_gamecube',
    say: ['* Aquí en el pueblo me dejan ir PRIMERO en la fila del pan.\n* ¡PRIMERO! Todavía no me la creo.'],
    facts: ['* Dato: yo me conecto al control con un cable.\n* Tú sostienes el control en una mano... ¡y a mí en la otra!'],
    bye: '* ¡Adiós! (Voy detrás de ti. Bueno, no. Ya aprendí a ir primero.)',
  }));

  npc(townFriend('sensorin', {
    curio: 'wii_sensor',
    say: ['* ¡Clic, clic! Desde aquí te veo perfecto.\n* Ninguna lámpara me confunde en este pueblo.'],
    facts: ['* Dato: como solo soy dos luces infrarrojas...\n* ¡la gente me reemplazaba con dos velitas, y funcionaba! (No lo intentes sin un adulto.)'],
    bye: '* ¡Clic! Te sigo viendo. Adiós.',
  }));

  // ---------- Entrenador Mi: el Gimnasio Sensor ----------
  npc({
    id: 'entrenadormi', era: 'wii', sprite: 'entrenadormi', x: 4, y: 9, when: () => !!d().done.entrenadormi,
    async talk(ctx) {
      if (!ctx.flag('metMiPueblo')) {
        ctx.setFlag('metMiPueblo');
        await ctx.say([
          '* ¡Hola, hola! ¡Abrí mi GIMNASIO SENSOR en tu pueblo!',
          '* Aquí puedes repetir los tres deportes cuando quieras.\n* ¡El deporte es ritmo! ¡El tecleo es ritmo!',
        ], 'ENTRENADOR MI');
      }
      const a = d().arcade || {};
      await ctx.say([`* Récords: BOLICHE ${a.wii_boliche || 0} pinos · TENIS ${a.wii_tenis || 0} seguidos · BOX ${a.wii_box || 0} golpes.`], 'ENTRENADOR MI');
      const opts = ['boliche', 'tenis', 'box', 'la balanza', 'música', 'adiós'];
      const i = await ctx.choose(opts, 'ENTRENADOR MI');
      if (i <= 2) { Game.go('wiigym', { arcade: opts[i], back: 'town' }); return; }
      if (i === 3) {
        await ctx.say(['* En la esquina hay una balanza blanca, plana como tabla.\n* Un letrerito dice: "Pésate y haz yoga. 2007."', '* ENTRENADOR MI: ¡Hasta tu postura tiene ritmo!'], 'ENTRENADOR MI');
        return;
      }
      if (i === 4) {
        Music.play('wii_canal');
        await ctx.say(['* ENTRENADOR MI: ¡La musiquita del canal de los muñequitos!\n* ...Bueno, una que se le parece. ¡Es para relajarse entre series!'], 'ENTRENADOR MI');
        return;
      }
      await ctx.say(['* ¡Recuerda ponerte la correa! Correíta me está viendo.'], 'ENTRENADOR MI');
    },
  });

  // ---------- Capitán Cometa: el Observatorio ----------
  npc({
    id: 'cometa', era: 'wii', sprite: 'cometa', x: 4, y: 10, when: () => !!d().flags.cometaPueblo,
    async talk(ctx) {
      if (!ctx.flag('metCometaPueblo')) {
        ctx.setFlag('metCometaPueblo');
        await ctx.say([
          '* ¡Bienvenido a mi OBSERVATORIO!\n* Desde aquí se ve todo el cielo... y todos tus récords.',
          '* Cada récord que haces brilla como una constelación.\n* Mira, mira.',
        ], 'CAPITAN COMETA');
      }
      const s = d();
      const a = s.arcade || {};
      const stars = (n) => '★'.repeat(Math.max(1, Math.min(7, Math.round(n)))) || '☆';
      const lines = [
        `* Constelación de la VELOCIDAD: ${stars((s.stats.bestWpm || 0) / 8)} (${s.stats.bestWpm || 0} PPM)`,
        `* Constelación del BOLICHE: ${stars((a.wii_boliche || 0) / 15)} (${a.wii_boliche || 0} pinos)`,
        `* Constelación de los AMIGOS: ${stars(Object.keys(s.spared).length / 6)} (${Object.keys(s.spared).length} amigos)`,
      ];
      await ctx.say([lines.join('\n')], 'CAPITAN COMETA');
      const i = await ctx.choose(['un dato', 'el canal vacío', 'adiós'], 'CAPITAN COMETA');
      if (i === 0) {
        await ctx.say(['* Dato: en 2007 salió un juego de Wii en el que un plomero salta entre planetitas.\n* Cada planeta tenía su propia gravedad. ...Como yo, pues.'], 'CAPITAN COMETA');
        await showCuriosity(ctx, 'wii_ventas');
      } else if (i === 1) {
        await ctx.say([s.flags.finalAbierto
          ? '* Ese canal no aparece en ningún mapa de estrellas.\n* Cuando entres, no vayas solo. Lleva las palabras de tus amigos.'
          : '* ¿Un canal vacío? No sé de qué hablas. ...Todavía.'], 'CAPITAN COMETA');
      } else await ctx.say(['* Las estrellas no se apagan. Se van lejos. ¡Vuelve pronto!'], 'CAPITAN COMETA');
    },
  });

  // ---------- Don Chip y la Wii ----------
  const chip = TOWN.npcs.find((n) => n.id === 'donchip');
  if (chip) {
    const base = chip.talk;
    chip.talk = async function (ctx) {
      const s = d();
      if (s.consoles.wii && !ctx.flag('chipWii')) {
        ctx.setFlag('chipWii');
        await ctx.say([
          '* ¡¿LA WII?! ¡Y con su barra sensora!\n* Mientras la hacían le decían "Revolution". Y vaya que lo fue.',
          '* Mi abuela jugaba boliche en ella. MI ABUELA.\n* Eso, mi joven amigo, es HISTORIA.',
        ], 'DON CHIP');
      }
      if (s.flags.finalAbierto && !ctx.flag('chipFinal')) {
        ctx.setFlag('chipFinal');
        await ctx.say([
          '* ¿Un canal vacío, dices? ¿Sin nombre?\n* ...Como el cartucho de mi cajón.',
          '* (Don Chip mira el cajón un buen rato. No dice nada más.)',
        ], 'DON CHIP');
      }
      return base.call(this, ctx);
    };
  }
})();
