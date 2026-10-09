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
        const i = await ctx.choose(['cuéntame un dato', 'adiós'], 'DON CHIP');
        if (i === 1) { await ctx.say(['* ¡Vuelve pronto! Y no soples los cartuchos.'], 'DON CHIP'); return; }
        // Datos de la Game Boy siempre; los de otras consolas cuando ya las rescató.
        const pool = CONSOLES.filter((c) => c.id === 'gameboy' || d.consoles[c.id])
          .flatMap((c) => c.facts.map((f) => `* ${upper(c.name)} (${c.year}):\n* ${f}`));
        await ctx.say([pool[ctx.counter('chipFact') % pool.length]], 'DON CHIP');
      },
    },
    {
      id: 'champi', sprite: 'champi', x: 17, y: 5,
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
      id: 'roncaton', sprite: 'roncaton', x: 18, y: 6, big: true,
      async talk(ctx) {
        await ctx.say(['* Una criatura ENORME duerme en medio del camino.', '* Zzz... Zzzz...']);
        if (await ctx.choose(['despierta', 'dejarlo dormir']) === 0) {
          await ctx.say(['* ¡¡DESPIERTA!!', '* ...', '* Zzz. Ni se movió.']);
          await ctx.say(['* Creo que necesitamos algo especial para despertarlo...\n* ¿Una flauta, tal vez?'], 'BIT');
          Quests.start('flauta');
        } else {
          await ctx.say(['* Lo dejas dormir. Se ve muy cómodo.']);
        }
      },
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
        const best = (Save.data.arcade || {}).bloques || 0;
        await ctx.say([`* Una máquina arcade: BLOQUES.\n* Récord: ${best} puntos.`]);
        Quests.start('arcade');
        if (await ctx.choose(['jugar', 'ahora no']) === 0) Game.go('bloques', { back: 'town' });
      },
    },

    // Los enemigos que perdonó se mudan al pueblo.
    {
      id: 'f-pixelito', sprite: 'pixelito', x: 13, y: 10, when: () => Save.data.spared.pixelito,
      async talk(ctx) { await ctx.say(['* ¡Boing! ¡Me mudé al pueblo!\n* Aquí todo se ve en alta definición.'], 'PIXELITO'); },
    },
    {
      id: 'f-cartuchon', sprite: 'cartuchon', x: 17, y: 8, when: () => Save.data.spared.cartuchon,
      async talk(ctx) {
        await ctx.say([
          '* Ya no soy gruñón. Bueno, solo los lunes.',
          '* Dato: soplarnos no nos arreglaba.\n* Lo que funcionaba era sacarnos y volvernos a meter.',
        ], 'CARTUCHON');
      },
    },
    {
      id: 'f-pilabat', sprite: 'pilabat', x: 18, y: 2, when: () => Save.data.spared.pilabat,
      async talk(ctx) { await ctx.say(['* Bzzt. Aquí hay enchufes por todos lados.\n* Soy muy feliz.'], 'PILABAT'); },
    },
    {
      id: 'f-tetrorey', sprite: 'tetrorey', x: 7, y: 10, when: () => Save.data.spared.tetrorey,
      async talk(ctx) { await ctx.say(['* Este pueblo necesita orden.\n* ¿Por qué ninguna casa encaja con la otra?'], 'TETRO REY'); },
    },
  ],
};

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
