// Mundo 1 en el Pueblo Vitrina: los amigos nuevos del Valle Game Boy y la misión "La moneda perdida".
// Se carga después de js/town-data.js y solo agrega personajes a TOWN.npcs.
// Los amigos platican con friendTalk (js/curiosidades.js): datos y curiosidades de la Game Boy.

const MONEDIN_FACTS = ['* Dato: Super Mario Land salió junto con la Game Boy en Japón, en 1989.\n* ¡Y estaba lleno de monedas! Primos lejanos, creo.'];

TOWN.npcs.push(
  {
    id: 'f-monedin', sprite: 'monedin', x: 3, y: 5, when: () => Save.data.spared.monedin,
    async talk(ctx) {
      const q = Quests.state('moneda_perdida');
      if (q === 'done') {
        await friendTalk(ctx, 'monedin', {
          say: ['* ¡Ting ting! Mi hermana y yo juntos valemos el doble.\n* O sea... dos. Pero dos MUY valiosos.'],
          facts: MONEDIN_FACTS,
          bye: '* ¡Ting! Que te vaya de oro.',
        });
        return;
      }
      if (ctx.flag('monedinaHallada')) {
        await ctx.say(['* ¡¿La encontraste?! ¡TING TING TING!', '* Ella insistió en irse contigo a la vitrina.\n* Dice que ahí brilla más.'], 'MONEDIN');
        await ctx.give('moneda_dorada');
        Quests.complete('moneda_perdida');
        return;
      }
      if (q === 'active') {
        await friendTalk(ctx, 'monedin', {
          say: ['* Mi hermana se esconde en el pasto alto, en la esquina de abajo a la izquierda.\n* Es dorada. Bueno, verde clarito.'],
          facts: MONEDIN_FACTS,
          bye: '* ¡Ting! Salúdame a mi hermana si la ves.',
        });
        return;
      }
      await ctx.say([
        '* ¡Ting! Gracias por no gastarme.',
        '* Oye... mi hermana rodó hasta este pueblo y no la encuentro.\n* Creo que está en el pasto alto, en la esquina de abajo.',
        '* Es tímida. Solo regresa con alguien que escriba MUY bonito.',
      ], 'MONEDIN');
      Quests.start('moneda_perdida');
    },
  },
  {
    // La hermana de Monedín: un encuentro fijo en el pasto alto.
    id: 'monedina', era: 'gb', sprite: 'monedina', x: 1, y: 13,
    when: () => Save.data.spared.monedin && !Save.data.flags.monedinaHallada,
    async talk(ctx) {
      await ctx.say([
        Quests.state('moneda_perdida') ? '* ¡Ting! ¿Te mandó mi hermano?' : '* ¡Ting! Estoy jugando a las escondidas con mi hermano Monedín.\n* Ya me aburrí. ¿Me llevas con él?',
        '* Solo regreso si escribes 5 palabras SIN UN SOLO ERROR.\n* Las monedas doradas somos exigentes.',
      ], 'MONEDINA');
      if (await ctx.choose(['acepto', 'luego'], 'MONEDINA') === 1) {
        await ctx.say(['* Aquí te espero. Rodando en mi lugar.'], 'MONEDINA');
        return;
      }
      const texts = pickWords(WORDS.t1, 5);
      const res = await ctx.challenge({ label: 'Sin errores:', texts, timeLimit: texts.join('').length * 600 + 4000 });
      if (res.completed && res.errors === 0) {
        ctx.setFlag('monedinaHallada');
        Sfx.coin();
        await ctx.say(['* ¡Qué letra tan bonita! Ting ting.', '* Vamos con mi hermano. (Habla con Monedín.)'], 'MONEDINA');
      } else {
        await ctx.say([`* Mmm... ${res.completed ? `tuviste ${res.errors} error${res.errors > 1 ? 'es' : ''}` : 'se acabó el tiempo'}.\n* ¡Inténtalo otra vez!`], 'MONEDINA');
      }
    },
  },
  {
    id: 'f-linkito', sprite: 'linkito', x: 13, y: 8, when: () => Save.data.spared.linkito,
    talk: (ctx) => friendTalk(ctx, 'linkito', {
      curio: 'gb_cable',
      say: (c) => {
        const lines = [
          '* ¡En este pueblo todos están conectados! Ya nunca me siento solo.',
          '* ¿Tienes un puerto libre? ...Es broma. Ya tengo muchos amigos.',
        ];
        return [lines[c.counter('linkito') % lines.length]];
      },
      facts: ['* Dato: con un Cable Link, dos Game Boy podían jugar Tetris uno contra el otro.\n* ¡Las líneas que hacías le caían al otro!'],
      bye: '* ¡Desconectando! ...Pero solo un ratito.',
    }),
  },
  {
    id: 'f-chupin', sprite: 'chupin', x: 10, y: 3, when: () => Save.data.spared.chupin,
    talk: (ctx) => friendTalk(ctx, 'chupin', {
      curio: 'gb_verdes',
      say: () => {
        const best = (Save.data.arcade || {}).chupaEaten || 0;
        return [
          rand(['* ¡Poyo! ...Perdón, se me sale.', '* Hoy desayuné un diccionario. Me quedé con hambre de la Z.', '* Soy rosa. CONFIA EN MI.']),
          best >= 30
            ? `* ¡Te comiste ${best} palabras en Chupa-Letras! Me das un poquito de miedo.`
            : '* ¿Ya jugaste CHUPA-LETRAS en la máquina arcade?\n* Si te comes 30 palabras en una partida, te doy un premio.',
        ];
      },
      facts: ["* Dato: el primer juego de Kirby salió para Game Boy en 1992.\n* Se llamaba Kirby's Dream Land. ¡Poyo!"],
      bye: '* ¡Adiós! Voy a ver si hay palabras en el refri.',
    }),
  },
);
