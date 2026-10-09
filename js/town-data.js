// Pueblo Vitrina: mapa, personajes y lo que dicen.
//
// Cada personaje tiene un `talk(ctx)` que es un guion. Lo que puede hacer el guion:
//   await ctx.say(['* página 1', '* página 2'], 'NOMBRE')   texto con ENTER para avanzar
//   await ctx.choose(['opción a', 'opción b'], 'NOMBRE')     el jugador ESCRIBE una opción; devuelve su número
//   await ctx.challenge({ label, texts, timeLimit })        reto de tecleo; devuelve { completed, errors, ... }
//   await ctx.give('idTesoro')                              entrega un tesoro de TREASURES
//   ctx.flag('x') / ctx.setFlag('x') / ctx.counter('x')     recordar cosas entre visitas

// Leyenda del mapa (20 x 15 casillas):
//   .  pasto      ,  pasto alto (¡encuentros salvajes!)   :  camino   *  flores
//   T  árbol      ~  agua      R  techo     W  pared      D  puerta del museo (lleva a la vitrina)
//   d  puerta cerrada          P  tubería de un mundo (ver PIPE_SLOTS)  S  letrero   C  cueva   #  roca
const TILES = {
  '.': { s: 'grass' },
  ',': { s: 'tall', tall: true },
  ':': { s: 'path' },
  '*': { s: 'flower' },
  T: { s: 'tree', solid: true },
  '~': { s: 'water', solid: true, look: 'agua' },
  R: { s: 'roof', solid: true },
  W: { s: 'wall', solid: true },
  D: { s: 'door', warp: 'vitrina' },
  d: { s: 'door', solid: true, look: 'casa' },
  P: { s: 'pipe', warp: 'world' },
  S: { s: 'sign', solid: true },
  C: { s: 'cave', solid: true, look: 'cueva' },
  '#': { s: 'rock', solid: true },
};

// Plaza de las Tuberías: casilla de la tubería de cada mundo, según su `order`.
// Si el mundo no existe o todavía no se abre, ahí solo hay pasto (¡nada de spoilers!).
const PIPE_SLOTS = [[8, 12], [10, 12], [12, 12], [14, 12], [16, 12], [18, 12]];
function pipeWorldAt(x, y) {
  const slot = PIPE_SLOTS.findIndex(([px, py]) => px === x && py === y);
  return WORLDS.find((w) => w.order === slot + 1 && worldUnlocked(w));
}

const BIT_TIPS = [
  '* ¿Sabías que antes la gente soplaba los cartuchos?\n* No servía, pero se sentía muy profesional.',
  '* Si caminas por el pasto alto, cuidado...\n* ¡algo salvaje puede aparecer!',
  '* Si te quedas quieto mucho rato, a veces digo cosas raras.',
  '* Dicen que en la pantalla de título hay un código secreto...\n* Uno muy, muy famoso.',
  '* Ese ronquido enorme no me deja pensar.',
  '* Cada amigo que haces se muda al pueblo.\n* Si llegan muchos... ¡el pueblo tendrá que crecer!',
  '* Don Chip sabe MUCHISIMO de consolas. Pregúntale algo.',
];

const TOWN = {
  name: 'Pueblo Vitrina',
  map: [
    'TTTTTTTTTTTT#C#TTTTT',
    'T...........#:#....T',
    'T..RRRRR....::.RRR.T',
    'T..RRRRR....:..RRR.T',
    'T..WWDWW....:..WdW.T',
    'T*...:......:...:..T',
    'T*...::::::::::::..:',
    'T....:...~~~...:...T',
    'T,,..:..~~~~~..:..TT',
    'T,,,.:...~~~...:...T',
    'T,,,.:.........:...T',
    'T,,,,:....S.......ST',
    'T,,,,:..P.P.P.P.P.PT',
    'T,,,,::::::::......T',
    'TTTTTTTTTTTTTTTTTTTT',
  ],
  // Dónde aparece el jugador según de dónde viene.
  spawns: {
    start: [10, 6, 'down'],
    vitrina: [5, 5, 'down'],
    // 'pipe:<mundo>' se calcula con PIPE_SLOTS (abajo de su tubería).
  },
  signs: {
    '10,11': '* PUEBLO VITRINA\n* Población: unos cuantos píxeles.',
    '18,11': '* PLAZA DE LAS TUBERIAS\n* Cada consola que rescates abre un camino nuevo.\n* Párate encima de una tubería para entrar.',
  },
  looks: {
    agua: '* El agua refleja tu cara.\n* Te ves... rápido.',
    casa: '* Está cerrado. Hay una nota:\n* "Salí a jugar. Vuelvo en 5 minutos." (Fecha: 1989)',
    cueva: '* Está muy oscuro allá adentro.\n* Mejor otro día.',
  },

  npcs: [
    {
      id: 'donchip', sprite: 'donchip', x: 7, y: 5,
      async talk(ctx) {
        const d = Save.data;
        if (!ctx.flag('metChip')) {
          ctx.setFlag('metChip');
          await ctx.say([
            '* ¡Hola, hola! Soy DON CHIP, el Coleccionista.',
            '* El apagón se llevó todas las consolas de mi museo.\n* Si las rescatas, las pondré en la vitrina.',
            '* La puerta del museo está aquí a mi lado.\n* ¡Entra cuando quieras!',
          ], 'DON CHIP');
          Quests.start('coleccion');
        }
        if (d.consoles.gameboy && !ctx.flag('chipGB')) {
          ctx.setFlag('chipGB');
          await ctx.say([
            '* ¡¿ESA ES LA GAME BOY?!\n* ¡Está como nueva!',
            '* En muchos países venía con un juego de bloques que caen.\n* Mira, encontré este cartucho en el sótano.',
          ], 'DON CHIP');
          await ctx.give('bloques');
        }
        if (d.consoles.nes && !ctx.flag('chipNES')) {
          ctx.setFlag('chipNES');
          await ctx.say([
            '* ¡LA NES! ¡Con su control de dos botones!\n* Eso, mi joven amigo, es HISTORIA.',
            '* ¿Una sombra morada, dices?\n* ...Hubo un apagón de verdad en 1989 en mi cuadra.',
            '* Pero este no fue de la luz. Fue de... otra cosa.',
          ], 'DON CHIP');
        }
        // Los amigos son los expertos en SU consola; Don Chip tiene un poquito de todo.
        if (!ctx.flag('chipExpertos') && recruitableFriends().some((id) => d.spared[id])) {
          ctx.setFlag('chipExpertos');
          await ctx.say([
            '* Psst... ¿Ya viste a los amigos que se mudaron al pueblo?',
            '* Cada uno sabe MUCHISIMO de su propia consola.\n* Pregúntales. Yo solo soy el que tiene de todo.',
          ], 'DON CHIP');
        }
        // Datos y curiosidades de la Game Boy siempre; los de otras consolas cuando ya las rescató.
        const owned = CONSOLES.filter((c) => c.id === 'gameboy' || d.consoles[c.id]);
        const i = await ctx.choose(['cuéntame un dato', 'enséñame algo', 'adiós'], 'DON CHIP');
        if (i === 2) { await ctx.say(['* ¡Vuelve pronto! Y no soples los cartuchos.'], 'DON CHIP'); return; }
        if (i === 1) {
          const { item } = pickNext(ctx, 'chipCurio', curiositiesFor(owned.map((c) => c.id)));
          await ctx.say(['* Ven, ven. Mira lo que tengo en mi álbum...\n* Eso, mi joven amigo, es HISTORIA.'], 'DON CHIP');
          await showCuriosity(ctx, item);
          return;
        }
        const pool = owned.flatMap((c) => c.facts.map((f) => `* ${upper(c.name)} (${c.year}):\n* ${f}`));
        await ctx.say([pool[ctx.counter('chipFact') % pool.length]], 'DON CHIP');
      },
    },
    {
      id: 'champi', sprite: 'champi', x: 15, y: 5,
      async talk(ctx) {
        const n = ctx.counter('champi');
        const lines = [
          '* ¡Gracias por visitarme!\n* ...pero tu consola está en otro castillo.',
          '* Perdón, siempre quise decir eso.\n* La verdad, está en el Valle Game Boy. Por la tubería.',
          '* Cuido esta casa. Mi amigo salió a jugar en 1989 y no ha vuelto.',
        ];
        await ctx.say([lines[Math.min(n, lines.length - 1)]], 'CHAMPI');
      },
    },
    {
      id: 'viejo', sprite: 'viejo', x: 13, y: 1,
      async talk(ctx) {
        if (Quests.state('tres_llaves') === 'active' && [1, 2, 3].every((n) => Save.data.flags[`nesKey${n}`])) {
          await ctx.say(['* ...Esas llaves... son de la mazmorra del castillo.', '* Las encontraste todas. Hace años que nadie lo lograba.\n* Toma. Así nunca te perderás allá abajo.'], 'ANCIANO');
          await ctx.give('mapa_mazmorra');
          Quests.complete('tres_llaves');
          return;
        }
        if (Save.data.treasures.espada) {
          await ctx.say(['* ¿Sabías que en aquel juego de 1986, si escribías ZELDA como tu nombre, empezabas una misión secreta más difícil?'], 'ANCIANO');
          return;
        }
        // Como en los RPG clásicos: si dices que no, te lo vuelve a preguntar.
        let i;
        do {
          await ctx.say(['* Es peligroso ir solo. ¡Toma esto!'], 'ANCIANO');
          i = await ctx.choose(['gracias', 'no gracias'], 'ANCIANO');
        } while (i === 1);
        await ctx.give('espada');
        await ctx.say(['* Es un clásico de 1986. Trátala con cariño.'], 'ANCIANO');
      },
    },
    {
      id: 'toby', sprite: 'toby', x: 2, y: 10,
      async talk(ctx) {
        if (Save.data.treasures.zapper) {
          await ctx.say(['* ¡Guau! Todavía me acuerdo de tu racha perfecta.'], 'TOBY');
          return;
        }
        await ctx.say([
          '* ¡Guau! Soy TOBY.\n* Mi abuelo se reía de los cazadores que fallaban.',
          '* ¿Te atreves? Escribe "pato" tres veces seguidas sin ningún error.',
        ], 'TOBY');
        Quests.start('pato');
        if (await ctx.choose(['acepto', 'no'], 'TOBY') === 1) {
          await ctx.say(['* Je je. ¿Gallina? Digo... ¿pato?'], 'TOBY');
          return;
        }
        const res = await ctx.challenge({ label: 'Escribe sin errores:', texts: ['pato', 'pato', 'pato'], timeLimit: 9000 });
        if (res.completed && res.errors === 0) {
          await ctx.say(['* ¡GUAU! ¡Ni un solo error!\n* Te ganaste esto.'], 'TOBY');
          await ctx.give('zapper');
          Quests.complete('pato');
        } else {
          Sfx.laugh();
          await ctx.say(['* Je je je je je.', '* ¡Inténtalo otra vez cuando quieras!'], 'TOBY');
        }
      },
    },
    {
      id: 'roncaton', sprite: 'roncaton', x: 18, y: 6, big: true, when: () => !Save.data.flags.roncatonAwake,
      async talk(ctx) {
        await ctx.say(['* Una criatura ENORME duerme en medio del camino.', '* Zzz... Zzzz...']);
        // Con la Flauta Polígono (Mundo 4) se puede tocar la Canción de Despertar (js/scenes/ocarin.js).
        if (Save.data.treasures.flauta_poligono && typeof n64PlayFlute === 'function') {
          if (await ctx.choose(['tocar la flauta', 'dejarlo dormir']) === 1) { await ctx.say(['* Lo dejas dormir. Se ve muy cómodo.']); return; }
          const res = await n64PlayFlute();
          if (res.cancelled) { await ctx.say(['* Guardas la flauta. El Roncatón sigue roncando.']); return; }
          await ctx.say(['* ¡La Canción de Despertar suena por todo el pueblo!', '* ...', '* ¡El Roncatón abre un ojo! Luego el otro. Bosteza ENORME.', '* RONCATON: Mmmh... ¿Quién me despertó? Llevo dormido desde 1995.\n* Antes de moverme... ¿me ayudas a escribir mi sueño? Se me olvida rápido.'], 'RONCATON');
          await ctx.challenge({ label: 'Escribe el sueño del Roncatón:', texts: ['soñé con una montaña de galletas', 'luego todo se puso rojo', 'y alguien me tocaba una flauta'], timeLimit: 40000 });
          await ctx.say(['* RONCATON: Soñé que todo era rojo. ...Ah, no. Eso está allá atrás.', '* RONCATON: Gracias por despertarme. Me hago a un lado.'], 'RONCATON');
          ctx.setFlag('roncatonAwake');
          Quests.complete('flauta');
          Game.go('town');
          return;
        }
        if (await ctx.choose(['despierta', 'dejarlo dormir']) === 0) {
          await ctx.say(['* ¡¡DESPIERTA!!', '* ...', '* Zzz. Ni se movió.']);
          await ctx.say(['* Creo que necesitamos algo especial para despertarlo...\n* ¿Una flauta, tal vez?'], 'BIT');
          Quests.start('flauta');
        } else {
          await ctx.say(['* Lo dejas dormir. Se ve muy cómodo.']);
        }
      },
    },
    // Ya despierto, el Roncatón se hace a un lado y el camino del este queda libre.
    {
      id: 'roncaton-despierto', sprite: 'roncaton', x: 18, y: 7, big: true, when: () => Save.data.flags.roncatonAwake,
      async talk(ctx) { await ctx.say(['* Zzz... todavía no. Primero lo morado.', '* ...Ah, perdón. Hablo dormido aunque esté despierto.'], 'RONCATON'); },
    },
    {
      id: 'camino-este', sprite: 'sign', x: 19, y: 6, when: () => Save.data.flags.roncatonAwake,
      async talk(ctx) { await ctx.say(['* CAMINO DEL ESTE\n* Al fondo, entre los árboles, brilla algo ROJO y enorme...', '* Pero una reja lo cierra con candado.\n* (Todavía no se puede pasar.)']); },
    },

    {
      id: 'profesora', sprite: 'profesora', x: 6, y: 12,
      async talk(ctx) {
        const team = Save.data.team || [];
        if (!team.length) {
          await ctx.say([
            '* ¡Hola! Soy la PROFESORA LETRA.\n* Estudio a los TECLOIDES: criaturas que viven en las teclas.',
            '* Tengo mi laboratorio de campo en el Pasto Alto Grande del Valle Game Boy.\n* ¡Búscame ahí y te regalo tu primer Tecloide!',
          ], 'PROFESORA LETRA');
          Quests.start('primer_tecloide');
          return;
        }
        await ctx.say([
          `* ¿Cómo está tu ${upper(TECLOIDES[team[0].id].name)}? Nivel ${team[0].lv}, ¡qué bien!`,
          rand([
            '* CHISPA le gana a GOTA, GOTA a BROTE y BROTE a CHISPA.\n* BYTE no le gana a nadie... pero nadie le gana a él.',
            '* Si escribes el ataque sin errores, pega más fuerte.\n* Un Tecloide bien escrito nunca falla.',
            '* En el turno rival, escribe la palabra de su ataque para esquivar.\n* ¡Recibes la mitad del daño!',
          ]),
        ], 'PROFESORA LETRA');
      },
    },
    {
      id: 'arcade', sprite: 'arcade', x: 14, y: 4,
      async talk(ctx) {
        const a = Save.data.arcade || {};
        const best = a.bloques || 0;
        // Minijuegos que ya se desbloquearon en los mundos, además de BLOQUES.
        const extra = [];
        if (Save.data.flags.chupaletras) extra.push({ name: 'chupa letras', label: `CHUPA-LETRAS (récord: ${a.chupaletras || 0})`, go: () => Game.go('chupaletras', { back: 'town' }) });
        if (Save.data.done.patos) extra.push({ name: 'patos', label: `PATOS DE LETRAS (récord: ${a.patos || 0} patos)`, go: () => Game.go('patos', { back: 'town', arcade: true }) });
        if (Save.data.done.kongo) extra.push({ name: 'barriles', label: `BARRILES (récord: ${a.barriles || 0} vigas)`, go: () => Game.go('kongo', { back: 'town', endless: true }) });
        if (!extra.length) {
          await ctx.say([`* Una máquina arcade: BLOQUES.\n* Récord: ${best} puntos.`]);
          Quests.start('arcade');
          if (await ctx.choose(['jugar', 'ahora no']) === 0) Game.go('bloques', { back: 'town' });
          return;
        }
        await ctx.say([`* Una máquina arcade con varios juegos:\n* BLOQUES (récord: ${best} puntos)\n* ${extra.map((x) => x.label).join('\n* ')}`]);
        Quests.start('arcade');
        const i = await ctx.choose(['bloques', ...extra.map((x) => x.name), 'ahora no']);
        if (i === 0) Game.go('bloques', { back: 'town' });
        else if (i <= extra.length) extra[i - 1].go();
      },
    },

    // Los enemigos que perdonó se mudan al pueblo y conservan la estética de su era (`era`).
    // Platican con friendTalk (js/curiosidades.js): su línea, y luego datos y curiosidades de su consola.
    // Los de mundos nuevos también pueden llegar solos: dale `home: [x, y]`, `townLine` y `townFacts` a su enemigo.
    {
      id: 'f-pixelito', era: 'gb', sprite: 'pixelito', x: 13, y: 10, when: () => Save.data.spared.pixelito,
      talk: (ctx) => friendTalk(ctx, 'pixelito', {
        curio: 'gb_pantalla',
        say: ['* ¡Boing! ¡Me mudé al pueblo!\n* Aquí todo se ve en alta definición.'],
        facts: ['* Dato: la pantalla de la Game Boy tenía 160 x 144 píxeles.\n* Yo soy uno de ellos. ¡El más guapo!'],
        bye: '* ¡Boing! ¡Boing! (Así se dice adiós en píxel.)',
      }),
    },
    {
      id: 'f-cartuchon', era: 'gb', sprite: 'cartuchon', x: 17, y: 8, when: () => Save.data.spared.cartuchon,
      talk: (ctx) => friendTalk(ctx, 'cartuchon', {
        curio: 'gb_guerra',
        say: ['* Ya no soy gruñón. Bueno, solo los lunes.'],
        facts: ['* Dato: soplarnos no nos arreglaba.\n* Lo que funcionaba era sacarnos y volvernos a meter.\n* ¡Y la humedad del aliento hasta nos podía oxidar!'],
        bye: '* Bye. Y NADA de soplarme, ¿eh?',
      }),
    },
    {
      id: 'f-pilabat', era: 'gb', sprite: 'pilabat', x: 18, y: 2, when: () => Save.data.spared.pilabat,
      talk: (ctx) => friendTalk(ctx, 'pilabat', {
        curio: 'gb_pilas',
        say: ['* Bzzt. Aquí hay enchufes por todos lados.\n* Soy muy feliz.'],
        facts: ['* Bzzt. Dato: la Game Boy original comía 4 pilas AA.\n* La Game Boy Pocket (1996) ya solo usaba 2 AAA. ¡A dieta!'],
        bye: '* Bzzt... me voy a recargar. Adiós.',
      }),
    },
    {
      id: 'f-tetrorey', era: 'gb', sprite: 'tetrorey', x: 7, y: 10, when: () => Save.data.spared.tetrorey,
      talk: (ctx) => friendTalk(ctx, 'tetrorey', {
        curio: 'gb_tetris',
        say: ['* Este pueblo necesita orden.\n* ¿Por qué ninguna casa encaja con la otra?'],
        facts: ['* Dato real: Tetris lo inventó Alekséi Pázhitnov en 1984, en Moscú.\n* Mi tatara-tatarabuelo, pues.'],
        extra: [
          { opt: 'qué te pasó', run: (c) => c.say(['* Algo morado me puso a girar y girar...\n* Todavía me da vueltas la corona.'], 'TETRO REY') },
          { opt: 'tetris', run: (c) => c.say(['* ¡No digas esa palabra! Me da vértigo.'], 'TETRO REY') },
        ],
        bye: '* Puedes retirarte. En orden, por favor.',
      }),
    },
    // Amigos del Castillo 8-Bit (Mundo 2). Su casa está en el Barrio 8 Bits (ver BARRIOS, abajo).
    townFriend('ladrillin', {
      say: ['* ¡Ting! Aquí nadie me salta encima.\n* Por fin puedo relajar las cejas.'],
      facts: ['* Dato: en Super Mario Bros. (1985), Mario chiquito no puede romper ladrillos.\n* Solo los hace rebotar. ¡Tiene que crecer primero!'],
      bye: '* ¡Ting! Cuidado con la cabeza al salir.',
    }),
    townFriend('caparacho', {
      say: ['* ¡Vuuum! El camino del pueblo es perfecto para patinar.', '* ...Pero ya no me escondo tanto. Aquí todos me saludan.'],
      facts: ['* Dato: en Super Mario Bros., si pateas un caparazón y tumba muchos enemigos seguidos...\n* ¡los puntos suben y suben hasta darte vidas extra!'],
      bye: '* ¡Vuuum! (Me fui patinando.)',
    }),
    townFriend('bombita', {
      say: ['* Inhala... exhala...\n* Ya no tengo prisa. Bueno, solo un poquito.'],
      facts: ['* Dato: en The Legend of Zelda (1986), las bombas abren paredes secretas en las mazmorras.\n* ¡Yo nunca abrí nada! Pero hacía mucho ruido.'],
      bye: '* Adiós. Despacito. Sin chispas.',
    }),
    townFriend('patoloco', {
      say: ['* ¡Cuac! Toby y yo ya somos amigos.\n* Ahora nos reímos juntos de las nubes.'],
      facts: ['* Dato: Duck Hunt se jugaba con la Zapper, una pistola de luz.\n* Solo funcionaba en las teles de tubo. ¡Cuac de alivio para los patos de hoy!'],
      bye: '* ¡Cuac! ¡Cuac! (Eso fue un adiós doble.)',
    }),
    townFriend('tragabombas', {
      say: ['* Bit dice que las bombas no son comida.\n* Ahora como zanahorias. Explotan menos.'],
      facts: ['* Dato: en The Legend of Zelda (1986) había un dinosaurio, Dodongo...\n* ¡y se le vencía dándole bombas de comer! Mi héroe.'],
      bye: '* Me voy a cenar. Zanahorias. Otra vez.',
    }),
    townFriend('kongo', {
      say: ['* ¡BUM BUM! Mi tambor y yo ya no rompemos nada.\n* Solo tocamos para que el pueblo baile.'],
      facts: ['* Dato: en el arcade Donkey Kong (1981) apareció por primera vez el héroe del bigote.\n* ¡Entonces le decían Jumpman, el Saltador!'],
      bye: '* ¡BUM! (Eso es adiós en idioma tambor.)',
    }),
    townFriend('punin', {
      say: ['* ¡Ding ding! Ya me retiré del boxeo.\n* Ahora entreno a los guijarros. Son muy duros.'],
      facts: ['* Dato: en Punch-Out!! para NES, la contraseña 007 373 5963 te llevaba directo a la pelea final.\n* ¡Psst! No le digas a nadie.'],
      bye: '* ¡Guardia arriba! ...Digo, adiós.',
    }),
    townFriend('caparazon', {
      name: 'LORD CAPARAZON',
      say: ['* ¡BIENVENIDO A TU PUEBLO!\n* ...Ya no me trabo. Solo lo digo porque me gusta.'],
      facts: ['* Dato: en Super Mario Bros. 3 aparecieron por primera vez los siete Koopalings, los hijos del rey Koopa.\n* Siete hijos. Imagínate la hora de la cena.'],
      bye: '* Puedes retirarte. ¡SIN TRABARTE!',
    }),

    // Amigos de la Isla Polígono (Mundo 4). Viven en el Barrio Polígono.
    townFriend('trianguloso', {
      say: ['* ¡Hola! En este pueblo todo es cuadrado.\n* Yo soy el único con puntas. Me siento especial.'],
      facts: ['* Dato: en la N64 todo se dibuja con triángulos, los famosos polígonos.\n* ¡Hasta la nariz de los héroes estaba hecha de triángulos!'],
      bye: '* ¡Adiós! Cuidado con mis esquinas.',
    }),
    townFriend('cactin', {
      say: ['* Ya no pincho a nadie.\n* Bueno... solo si me abrazan muy fuerte.'],
      facts: ['* Dato: el control de la N64 tenía tres agarraderas, como un tridente.\n* Lo podías tomar de dos maneras distintas según el juego.'],
      bye: '* Adiós. Sin abrazos, ¿eh? Por tu bien.',
    }),
    townFriend('texturin', {
      say: ['* Aquí todo se ve nítido. ¡Qué raro!\n* Yo nací un poquito borroso.'],
      facts: ['* Dato: la N64 suavizaba sus texturas para que no se vieran los cuadritos.\n* Por eso muchos juegos se veían un poco borrosos. ¡Como yo!'],
      bye: '* Adiós... (se pone borroso de la emoción)',
    }),
    townFriend('niebla', {
      say: ['* Shhh... aquí ya no escondo nada.\n* Solo un poquito de neblina en las mañanas.'],
      facts: ['* Dato: muchos juegos de N64 usaban niebla para tapar lo que estaba lejos.\n* Así la consola no tenía que dibujarlo todo. ¡Era un truco!'],
      bye: '* Me disipo. Adiós...',
    }),
    townFriend('camaraloca', {
      say: ['* ¡Click! Por fin una casa donde no me atoro en las paredes.'],
      facts: ['* Dato: en Super Mario 64, la cámara la lleva un personaje: un Lakitu en su nube.\n* ¡Un camarógrafo de verdad! Mi ídolo.'],
      bye: '* ¡Click! Saliste movido. Otra vez.',
    }),
    townFriend('pakito', {
      say: ['* ¡Brrrrr! Perdón, me emociono y vibro.\n* Bienvenido a mi casa. Brrr.'],
      facts: ['* Dato: el Rumble Pak se conectaba debajo del control de la N64...\n* ¡y necesitaba sus propias 2 pilas AAA para vibrar!'],
      bye: '* ¡Brrrrr-adiós!',
    }),
  ],
};
MAPS.pueblo = Object.assign(TOWN, { id: 'pueblo' });

// Un amigo perdonado que se muda al pueblo: aparece cuando lo perdonas y platica con friendTalk.
// x, y solo se usan si no tiene casa (la casa la pone BARRIOS, abajo).
function townFriend(id, opts = {}, x = 9, y = 6) {
  return {
    id: `f-${id}`, sprite: (ENEMIES[id] && ENEMIES[id].sprite) || id, x, y,
    when: () => !!Save.data.spared[id],
    talk: (ctx) => friendTalk(ctx, id, opts),
  };
}

// ---------- El pueblo crece ----------
// Cada era tiene su BARRIO, con una casa por amigo. Los barrios se construyen cuando juntas
// suficientes amigos y ya se abrió el mundo de esa era. El mapa crece hacia la derecha y hacia
// abajo: lo de antes no se mueve (tuberías, museo, Don Chip...).
//
//   0-2 amigos                      el pueblo de siempre (20 x 15)
//   3 amigos                        + Barrio Game Boy, al este (32 x 15)
//   8 amigos y Castillo 8-Bit       + Barrio 8 Bits, al sur, con la tienda de Doña Tecla (32 x 27)
//   13 amigos y Reino 16-Bit        + Barrio 16 Bits, con la Sala de Arcade de la Maestra Modo
//   18 amigos e Isla Polígono       + Barrio Polígono, al este, con el quiosco de Ocarín (44 x 27)
//
// Cada barrio se pinta con la paleta de SU era (regions), aunque el pueblo esté en otra.
// Si un amigo llega antes de que exista su barrio, espera en el pueblo (TOWN_CAMP).
// Mundo nuevo: agrega su barrio aquí (pedazo de mapa, casas y amigos); ver docs/MUNDOS.md §3e.

// Leyenda extra del pueblo grande.
TOWN.tiles = {
  h: { s: 'door', solid: true, look: 'casaAmigo' },   // puerta de la casa de un amigo (su letrero dice de quién es)
  t: { s: 'door', solid: true, look: 'casa' },        // tienda de Doña Tecla
  a: { s: 'door', solid: true, look: 'casa' },        // Sala de Arcade
  k: { s: 'door', solid: true, look: 'casa' },        // quiosco de Ocarín
};
TOWN.looks.casaAmigo = '* Una casa nueva. Huele a píxeles recién horneados.';

// Pedazos de mapa de cada barrio y en qué casilla del pueblo grande empiezan.
// h = puerta de una casa; el amigo se para justo abajo de su puerta.
const BARRIOS = [
  {
    id: 'gb', era: 'gb', name: 'Barrio Game Boy', x: 20, y: 0, min: 3, world: 'gb',
    friends: ['pixelito', 'monedin', 'cartuchon', 'linkito', 'pilabat', 'tetrorey', 'chupin'],
    sign: [20, 9, '* BARRIO GAME BOY\n* Aquí todo se ve en 4 tonos de verde.\n* (Se prohíbe soplar las casas.)'],
    map: [
      'TTTTTTTTTTTT',
      'TRRR.RRR.RRR',
      'TWhW.WhW.WhW',
      'T...........',
      'TT.:::::::::',
      'TT.:...*..*.',
      'TTT:RRR.RRR.',
      'TT.:WhW.WhW.',
      'T,.:.......*',
      'S..::::::::.',
      '::::.RRR.RRR',
      'T..:.WhW.WhW',
      'T*.:........',
      'T**::::::::.',
      'TTTTTTT:TTTT',
    ],
  },
  {
    id: 'nes', era: 'nes', name: 'Barrio 8 Bits', x: 0, y: 15, min: 8, world: 'nes',
    friends: ['ladrillin', 'caparacho', 'bombita', 'patoloco', 'tragabombas', 'kongo', 'punin', 'caparazon'],
    sign: [4, 16, '* BARRIO 8 BITS\n* Máximo 3 colores por casa.\n* Es la regla. Lo dice la NES.'],
    places: { donatecla: [16, 19, 'TIENDA DE DOÑA TECLA', '* Teclas sueltas, repuestos y consejos.\n* (Los consejos son gratis.)'] },
    map: [
      'TTTT#:#TTTTTTTTTTTTT',
      'T...S:..............',
      'T.RRR:RRR.RRR.RRRRR.',
      'T.WhW:WhW.WhW.WWtWW.',
      'T....:..............',
      'T:::::::::::::::::::',
      'TRRR.RRR.RRR.RRR.RRR',
      'TWhW.WhW.WhW.WhW.WhW',
      'T...................',
      'T,,,..*.*..*..TT...T',
      'T,,,,..........TT..T',
      'TTTTTTTTTTTTTTTTTTTT',
    ],
  },
  {
    id: 'snes', era: 'snes', name: 'Barrio 16 Bits', x: 20, y: 15, min: 13, world: 'snes',
    friends: ['dinohuevin', 'setita', 'gema', 'modosiete', 'caballero', 'monobarril', 'vulpino', 'nebula'],
    sign: [25, 15, '* BARRIO 16 BITS\n* Con sombras, brillos y hasta 256 colores en pantalla.'],
    places: { maestramodo: [30, 23, 'SALA DE ARCADE', '* Se oyen pitidos, monedas y alguien gritando "¡RECORD!".'] },
    map: [
      'TTTT*S.:.*TT',
      'TRRR.RRR.RRR',
      'TWhW.WhW.WhW',
      'T...........',
      'T.*.*..:.*..',
      '::::::::::::',
      'TRRR.RRR.RRR',
      'TWhW.WhW.WaW',
      'T...........',
      'TRRR.RRR.RRR',
      'TWhW.WhW.WhW',
      'T...........',
    ],
  },
  {
    id: 'n64', era: 'n64', name: 'Barrio Polígono', x: 32, y: 0, min: 18, world: 'n64',
    friends: ['trianguloso', 'cactin', 'texturin', 'niebla', 'camaraloca', 'pakito'],
    sign: [32, 5, '* BARRIO POLIGONO\n* Aquí todo tiene 3 dimensiones.\n* Bueno... casi todo.'],
    places: { ocarin: [36, 19, 'QUIOSCO DE OCARIN', '* Un quiosco de música. Huele a madera y a viento.'] },
    map: [
      'TTTTTTTTTTTT',
      'TTRRR..RRRTT',
      'T.WhW..WhW.T',
      'T..........T',
      '::::::::::.T',
      'S...:..:...T',
      'T...:..:...T',
      'TRRR:~~:RRRT',
      'TWhW:~~:WhWT',
      'T...:~~:...T',
      'T*..:~~:..*T',
      'T...::::...T',
      'T..:....:..T',
      'T..:....:..T',
      'TRRR.RRR:..T',
      'TWhW.WhW:..T',
      'T.......:..T',
      'T.RRRRR.:..T',
      'T.WWkWW.:..T',
      'T...*...:..T',
      ':::::::::..T',
      'T.*.*.*.*..T',
      'T,,,,..,,,,T',
      'T,,,,..,,,,T',
      'T*.*.*.*.*.T',
      'T..........T',
      'TTTTTTTTTTTT',
    ],
  },
];

// Pasos entre pedazos: árbol mientras el barrio del otro lado (`opens`) no exista.
const TOWN_GATES = [
  { x: 19, y: 10, opens: 'gb' }, { x: 5, y: 14, opens: 'nes' }, { x: 27, y: 14, opens: 'snes' },
  { x: 19, y: 20, opens: 'snes' }, { x: 31, y: 4, opens: 'n64' }, { x: 31, y: 20, opens: 'n64' },
];

// Donde esperan los amigos que llegaron antes que su barrio, y los lugares sin barrio todavía.
const TOWN_CAMP = [[13, 10], [17, 8], [7, 10], [3, 7], [12, 9], [8, 7], [2, 5], [14, 10], [3, 5], [13, 8], [10, 3], [14, 8], [4, 1], [6, 9]];
const PLACE_CAMP = { maestramodo: [11, 3], donatecla: [9, 5], ocarin: [11, 11] };

// Amigos que ya viven en el pueblo (los de todos los barrios).
const townFriendIds = () => BARRIOS.flatMap((b) => b.friends);
const townFriendCount = () => townFriendIds().filter((id) => Save.data.spared[id]).length;

// Casillas de las casas de un barrio (la de enfrente de cada puerta h), en orden de lectura.
function barrioHouses(b) {
  const out = [];
  b.map.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === 'h') out.push([b.x + i, b.y + j + 1]); }));
  return out.sort((p, q) => p[1] - q[1] || p[0] - q[0]);
}

// El mapa del pueblo con los primeros `n` barrios construidos.
function townStageMap(n) {
  const built = BARRIOS.slice(0, n);
  const W = Math.max(TOWN.map[0].length, ...built.map((b) => b.x + b.map[0].length));
  const H = Math.max(TOWN.map.length, ...built.map((b) => b.y + b.map.length));
  const g = Array.from({ length: H }, () => Array(W).fill('T'));
  const paste = (x0, y0, rows) => rows.forEach((row, j) => [...row].forEach((ch, i) => { g[y0 + j][x0 + i] = ch; }));
  paste(0, 0, TOWN.map);
  built.forEach((b) => paste(b.x, b.y, b.map));
  TOWN_GATES.forEach(({ x, y, opens }) => {
    if (y < H && x < W) g[y][x] = built.some((b) => b.id === opens) ? ':' : 'T';
  });
  return g.map((r) => r.join(''));
}

// ¿Cuántos barrios hay? El siguiente se construye con `min` amigos y su mundo abierto.
function townStage() {
  const n = townFriendCount();
  let k = 0;
  while (k < BARRIOS.length) {
    const b = BARRIOS[k];
    const w = WORLDS.find((x) => x.id === b.world);
    if (!w || !worldUnlocked(w) || n < b.min) break;
    k++;
  }
  return k;
}

// Dónde vive cada quien con `n` barrios: su casa, o el pueblo viejo si su barrio no existe.
function townHomes(n) {
  const homes = {};
  const camp = [...TOWN_CAMP];
  BARRIOS.forEach((b, k) => {
    const houses = barrioHouses(b);
    b.friends.forEach((id, i) => {
      if (k < n) homes[`f-${id}`] = houses[i];
      else if (Save.data.spared[id] && camp.length) homes[`f-${id}`] = camp.shift();
    });
    Object.entries(b.places || {}).forEach(([id, [x, y]]) => { homes[id] = k < n ? [x, y] : PLACE_CAMP[id]; });
  });
  return homes;
}

// Letreros de cada barrio: el de la entrada, el de cada casa (de quién es) y los de sus lugares.
function barrioSigns(b) {
  const signs = { [`${b.sign[0]},${b.sign[1]}`]: b.sign[2] };
  barrioHouses(b).forEach(([x, y], i) => {
    const id = b.friends[i];
    signs[`${x},${y - 1}`] = () => (id && Save.data.spared[id]
      ? `* CASA DE ${upper(ENEMIES[id].name)}.\n* Toca la puerta... ¡o mejor háblale, está aquí afuera!`
      : `* Una casa nueva y vacía.\n* El tapete dice: "BIENVENIDO, AMIGO DE LA ${upper(HUB_ERAS[b.era] ? HUB_ERAS[b.era].label : eraDef(b.era).label)}".`);
  });
  Object.entries(b.places || {}).forEach(([id, [x, y, title, text]]) => {
    signs[`${x},${y - 1}`] = () => {
      const owner = TOWN.npcs.find((n) => n.id === id);
      return owner && owner.when && !owner.when() ? `* ${title}\n* Está cerrado. Un letrero dice: "PROXIMAMENTE".` : `* ${title}\n${text}`;
    };
  });
  return signs;
}

const BARRIO_NEWS = {
  gb: () => ['* ¡Mira! ¡El pueblo creció hacia el este!', '* Construyeron el BARRIO GAME BOY: una casita para cada amigo del Valle.\n* Mientras más amigos hagas, más grande se pone el pueblo.'],
  nes: () => ['* ¡Otra vez! Ahora hay calles nuevas al sur del pueblo.', `* Es el BARRIO 8 BITS.${Save.data.consoles.nes ? ' ¡Y Doña Tecla abrió una tienda!' : ''}\n* Fíjate: allá todo sigue con colores de la NES.`],
  snes: () => ['* ¡El pueblo sigue creciendo! Al sureste hay un barrio con sombras y brillos.', '* El BARRIO 16 BITS. La Maestra Modo se mudó ahí con su Sala de Arcade.'],
  n64: () => ['* ¡Whoa! ¡El pueblo llegó hasta el otro lado del bosque!', `* El BARRIO POLIGONO.${Save.data.done.ocarin ? ' Ocarín puso un quiosco de música.' : ''}\n* Ahora el pueblo parece un museo del tiempo... ¡caminando!`],
};

// Una variante del pueblo por barrio construido (la última que se cumple es la que se ve).
TOWN.variants = BARRIOS.map((b, k) => ({
  id: `barrio_${b.id}`,
  stage: k + 1,
  when: () => townStage() >= k + 1,
  map: townStageMap(k + 1),
  regions: BARRIOS.slice(0, k + 1).map((x) => ({ x0: x.x, y0: x.y, x1: x.x + x.map[0].length - 1, y1: x.y + x.map.length - 1, era: x.era, name: x.name })),
  signs: Object.assign({}, ...BARRIOS.slice(0, k + 1).map(barrioSigns)),
  announce: BARRIO_NEWS[b.id],
}));
TOWN.homes = (v) => townHomes(v ? v.stage : 0);

// ---------- Lugares nuevos ----------

// Doña Tecla (lore §12.1, después del Mundo 2): su tienda no vende nada, ¡pero sabe de teclados!
Object.assign(SPRITES, {
  donatecla: [
    '................',
    '......dddd......',
    '.....dccccd.....',
    '....dddddddd....',
    '...dccccccccd...',
    '...dcaaaaaacd...',
    '...ddadaadadd...',
    '....daaaaaad....',
    '.....daddad.....',
    '....ddbbbbdd....',
    '...dbbdaadbbd...',
    '..dabbdaadbbad..',
    '..ddbbbaabbbdd..',
    '....dbbbbbbd....',
    '....dcd..dcd....',
    '....dd....dd....',
  ],
});

const TECLA_FACTS = [
  '* Dato: el teclado QWERTY se inventó para las máquinas de escribir, allá por 1870.\n* ¡Tiene más de 150 años!',
  '* Dato: ¿ves las rayitas en la F y en la J? Son para encontrar la posición base sin mirar.\n* Tus índices van ahí. Siempre.',
  '* Dato: la Famicom tuvo un teclado de verdad. Venía con Family BASIC (1984)...\n* ¡y servía para programar tus propios juegos!',
  '* Dato: la barra espaciadora es la tecla más grande del teclado.\n* Se lo merece. Trabaja entre TODAS las palabras.',
];

TOWN.npcs.push(
  {
    id: 'donatecla', sprite: 'donatecla', x: 9, y: 5, when: () => !!Save.data.consoles.nes,
    async talk(ctx) {
      if (!ctx.flag('metTecla')) {
        ctx.setFlag('metTecla');
        await ctx.say([
          '* ¡Bienvenido, bienvenida! Soy DOÑA TECLA.\n* Llegué con la NES. Vendo teclas sueltas.',
          '* ...Bueno, en realidad nadie compra teclas sueltas.\n* Así que regalo consejos y retos.',
        ], 'DOÑA TECLA');
      }
      const i = await ctx.choose(['un dato', 'un reto', 'adiós'], 'DOÑA TECLA');
      if (i === 2) { await ctx.say(['* ¡Vuelve pronto! Y lávate las manos: el teclado lo agradece.'], 'DOÑA TECLA'); return; }
      if (i === 0) { await ctx.say([pickNext(ctx, 'teclaDato', TECLA_FACTS).item], 'DOÑA TECLA'); return; }
      // Una frase que usa TODAS las letras del abecedario (un pangrama).
      await ctx.say(['* Esta frase tiene TODAS las letras del abecedario.\n* Escríbela completita. ¡Sin prisa, pero sin pausa!'], 'DOÑA TECLA');
      const text = 'el veloz murciélago hindú comía feliz cardillo y kiwi';
      const res = await ctx.challenge({ label: 'Escribe la frase:', texts: [text], timeLimit: text.length * 900 + 3000 });
      if (!res.completed) { await ctx.say(['* ¡Uy! Se acabó el tiempo.\n* Las teclas no se van a ningún lado. Inténtalo otra vez.'], 'DOÑA TECLA'); return; }
      Sfx.coin();
      await ctx.say([res.errors === 0 ? '* ¡PERFECTO! Ni un error.\n* Tienes dedos de tienda fina.' : `* ¡Lo lograste! Con ${res.errors} error${res.errors > 1 ? 'es' : ''}.\n* Ya casi tienes dedos de tienda fina.`], 'DOÑA TECLA');
    },
  },
  // Ocarín (lore §12.1, después del Mundo 4): su quiosco de música. Toca sus melodías con la flauta.
  {
    id: 'ocarin', era: 'n64', sprite: 'ocarin', x: 11, y: 11, when: () => !!Save.data.done.ocarin,
    talk: (ctx) => friendTalk(ctx, 'ocarin', {
      name: 'OCARIN',
      say: ['* ¡Hola, hola! Puse mi quiosco aquí para que el pueblo tenga música.', '* Los vecinos dicen que toco muy fuerte.\n* Yo digo que ellos oyen muy bien.'],
      facts: ['* Dato: la música de Super Mario 64 la compuso Koji Kondo.\n* ¡El mismo que hizo la música del primer Super Mario Bros.!'],
      extra: [{
        opt: 'tocar una melodía',
        run: async (c) => {
          const songs = (ENEMIES.ocarin && ENEMIES.ocarin.songs) || [];
          if (!Save.data.treasures.flauta_poligono || typeof n64PlayFlute !== 'function' || !songs.length) {
            await c.say(['* Necesitas una flauta. ¡La mía no se presta! Es muy personal.'], 'OCARIN');
            return;
          }
          const j = await c.choose([...songs.map((s) => s.name.toLowerCase()), 'mejor no'], 'OCARIN');
          if (j >= songs.length) return;
          const res = await n64PlayFlute(songs[j].keys, `FLAUTA POLIGONO · ${upper(songs[j].name)}`);
          await c.say([res.cancelled ? '* ¿Ya? Bueno. La música también es saber parar.' : '* ¡Precioso! Hasta el Roncatón movió una oreja.'], 'OCARIN');
        },
      }],
      bye: '* ¡Que tus dedos no pierdan el ritmo!',
    }),
  },
);

async function bitIntro(ctx) {
  await ctx.say([
    '* ¡Hola! Soy BIT, el cursor que vivía en tu teclado.',
    '* Desde el apagón todo está raro...\n* ¡pero tú tienes dedos rápidos!',
    '* ¿Me dejas acompañarte?',
  ], 'BIT');
  const i = await ctx.choose(['claro que sí', 'ahora no'], 'BIT');
  await ctx.say([
    i === 0 ? '* ¡Genial! Seremos el mejor equipo.' : '* ...Lo voy a tomar como un sí. ¡Vamos!',
    '* Aquí se habla ESCRIBIENDO la respuesta.\n* ¡Justo como acabas de hacer!',
    '* La tubería verde de la plaza, al sur, nos lleva al Valle Game Boy.\n* ¡Ahí está la primera consola!',
    '* (Muévete con las flechas. ENTER para hablar o revisar.)\n* (M abre tu diario de misiones.)',
  ], 'BIT');
  Quests.start('rescate_gb');
}

async function bitTalk(ctx) {
  const first = Save.data.consoles.gameboy
    ? '* Cada consola que rescatamos abre una tubería nueva en la plaza.\n* ¿A dónde nos llevará la siguiente?'
    : '* La tubería verde de la plaza nos lleva al Valle Game Boy.\n* ¡Ahí está la primera consola!';
  await ctx.say([first, rand(BIT_TIPS)], 'BIT');
}

// Cuando se abre un mundo nuevo, Bit lo anuncia la siguiente vez que entras al pueblo.
async function announcePipe(ctx, w) {
  Sfx.secret();
  await ctx.say([
    '* ¿Escuchaste eso?\n* ¡Brotó una tubería nueva en la Plaza de las Tuberías!',
    `* Dice que lleva a... ¡${upper(w.name)}!\n* ¿Vamos?`,
  ], 'BIT');
}
