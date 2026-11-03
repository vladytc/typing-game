// MUNDO 4 — Personajes de verdad de la Nintendo 64 en la Isla Polígono.
// Se carga después de js/worlds/n64-mapa.js (y del motor 3D), así que aquí ya existen MAPS, Poly y T3_MODELS.
//
//   Castillo de Peach (n64-castillo): Lakitu con su cámara, un Toad con la carta de la princesa,
//     MIPS el conejo y la placa borrosa del patio (el mito "L is real 2401").
//   Bosque Kokiri (n64-circuito, el claro del bosque): el Gran Árbol Deku, Saria y Navi.
//   Montaña Espiral (n64-playa, junto a la meseta): Banjo y Kazooie.
//   Estadio (n64-estadio): Fox McCloud con su Arwing y Pikachu frente a la tele.
//
// Todo el arte se dibuja aquí (sprites 16×16 con paleta fija y modelos low-poly). Ninguna melodía nueva.

// ---------- Sprites (modo clásico y vitrina): paleta fija con rows.pal ----------
const N64N_K = '#202030';
const n64NinArt = (rows, pal) => Object.assign(rows.map((r) => r.padEnd(16, '.').slice(0, 16)), { pal: { K: N64N_K, ...pal } });

Object.assign(SPRITES, {
  lakitu64: n64NinArt([
    '.....KKKKKK.....',
    '....KGGGGGGK....',
    '...KGgGGGGgGK...',
    '...KYYYYYYYYK..L',
    '...KYWKYYWKYK.L.',
    '...KYYYYYYYYKL..',
    '....KYYOOYYK.CC.',
    '....KGGGGGGK.CC.',
    '...KGGgGGgGGK...',
    '..KWWWWWWWWWWK..',
    '.KWWWWWWWWWWWWK.',
    'KWWWWwWWWWwWWWWK',
    'KWWWWWWWWWWWWWWK',
    '.KWWWwWWWWwWWWK.',
    '..KKKKKKKKKKKK..',
    '................',
  ], { G: '#58b85c', g: '#2f7d3a', Y: '#f7d060', W: '#f4f4f4', w: '#c9d6e3', O: '#f0953c', L: '#8a6a3a', C: '#3a3a44' }),
  toad64: n64NinArt([
    '.....KKKKKK.....',
    '...KKWWRRWWKK...',
    '..KRRWWRRWWRRK..',
    '.KRRRWWWWWWRRRK.',
    '.KWWWRRWWRRWWWK.',
    '.KKKKKKKKKKKKKK.',
    '....KSSSSSSK....',
    '....KSKSSKSK....',
    '....KSSSSSSK....',
    '.....KSSSSK.....',
    '...KBBBWWBBBK...',
    '...KBBWWWWBBK...',
    '....KWWWWWWK....',
    '....KWWKKWWK....',
    '...KOOK..KOOK...',
    '...KKKK..KKKK...',
  ], { R: '#d64545', W: '#f4f4f4', S: '#f2c6a0', B: '#3c8dd6', O: '#8a5a2a' }),
  mips64: n64NinArt([
    '....KK...KK.....',
    '...KYK..KYK.....',
    '...KYK..KYK.....',
    '...KYK..KYK.....',
    '...KYYKKYYK.....',
    '..KYYYYYYYYK....',
    '..KYKYYYKYYK....',
    '..KYYYYYYYYK....',
    '...KYYPPYYK.....',
    '..KYYYYYYYYKK...',
    '.KYYYWWWWYYYWK..',
    '.KYYWWWWWWYYWK..',
    '.KYYYWWWWYYYK...',
    '..KYYYYYYYYK....',
    '..KOOK..KOOK....',
    '..KKKK..KKKK....',
  ], { Y: '#f7d43c', W: '#fff4c0', P: '#f48fb1', O: '#e8a030' }),
  deku64: n64NinArt([
    '...GGGGGGGGGG...',
    '.GGgGGGGGGGgGGG.',
    'GGGGGgGGGGGGGgGG',
    '.GGGGGGGGgGGGGG.',
    '....KBBBBBBK....',
    '...KBBBBBBBBK...',
    '...KBKKBBKKBK...',
    '...KBKKBBKKBK...',
    '...KBBbBBbBBK...',
    '...KbbbbbbbbK...',
    '...KBBbKKbBBK...',
    '...KBBKKKKBBK...',
    '...KBBBBBBBBK...',
    '..KBBBBBBBBBBK..',
    '.KBBKBBBBBBKBBK.',
    'KKKKKKKKKKKKKKKK',
  ], { G: '#3e8e44', g: '#58b85c', B: '#8a5a32', b: '#c9a66b' }),
  saria64: n64NinArt([
    '....KKKKKKKK....',
    '...KHHHHHHHHK...',
    '..KHHHHHHHHHHK..',
    '..KHHSSSSSSHHK..',
    '..KHSKSSSSKSHK..',
    '..KHSSSSSSSSHK..',
    '..KHHSSPPSSHHK..',
    '...KKSSSSSSKK...',
    '....KGGGGGGK....',
    '...KGGGWWGGGK...',
    '..KSGGGGGGGGSK..',
    '..KSKGGGGGGKSK..',
    '....KGGGGGGK....',
    '....KGGKKGGK....',
    '....KBBK.KBBK...',
    '....KKKK.KKKK...',
  ], { H: '#58b85c', S: '#f2c6a0', G: '#3e8e44', W: '#f4f4f4', P: '#d64545', B: '#8a5a2a' }),
  navi64: n64NinArt([
    '................',
    '..WW........WW..',
    '.WwwW......WwwW.',
    '.WwwwW....WwwwW.',
    '..WwwwW..WwwwW..',
    '...WwwWLLWwwW...',
    '.....LLCCLL.....',
    '....LCCCCCCL....',
    '....LCCCCCCL....',
    '.....LLCCLL.....',
    '...WwwWLLWwwW...',
    '..WwwwW..WwwwW..',
    '..WwwW....WwwW..',
    '...WW......WW...',
    '................',
    '................',
  ], { W: '#9fd3ff', w: '#e8f6ff', L: '#6fb4f0', C: '#ffffff' }),
  banjo64: n64NinArt([
    '..KK..RR...KK...',
    '.KBBKRRRK.KBBK..',
    '.KBBBKRRKKBBBK..',
    '..KBBBBBBBBBK...',
    '..KBKBBBBKBBKYY.',
    '..KBBBbbbBBBKY..',
    '...KBbbKbbBK....',
    '....KBbbbBK.....',
    '..KKBWBBBBBKK...',
    '.KBBBBBBBBBUUK..',
    '.KBBBBBBBBBUUK..',
    '..KKYYYYYYYUUK..',
    '...KYYYYYYYK....',
    '...KBBK.KBBK....',
    '..KOOOK.KOOOK...',
    '..KKKKK.KKKKK...',
  ], { B: '#a0642d', b: '#e8c890', R: '#d64545', Y: '#f7e463', W: '#f4f4f4', U: '#3c8dd6', O: '#f0953c' }),
  fox64: n64NinArt([
    '..KK......KK....',
    '.KOOK....KOOK...',
    '.KOWOK..KOWOK...',
    '..KOOOKKOOOK....',
    '..KOOOOOOOOK....',
    '..KOKOOOOKOK....',
    '..KOOWWWWOOK....',
    '...KWWWWWWKK....',
    '....KRRRRK......',
    '...KGGWWGGK.....',
    '..KGGGWWGGGK....',
    '..KOKGWWGKOK....',
    '....KWWWWK......',
    '....KWWKWWK.....',
    '...KGGK.KGGK....',
    '...KKKK.KKKK....',
  ], { O: '#e8903c', W: '#f4f4f4', R: '#d64545', G: '#4c7a4c' }),
  pikachu64: n64NinArt([
    '..K........K....',
    '.KK........KK...',
    '.KYK......KYK...',
    '.KYYK....KYYK.KK',
    '..KYYKKKKYYK.KYK',
    '..KYYYYYYYYK.KYK',
    '.KYYKYYYYKYYKYK.',
    '.KRRYYYYYYRRKYK.',
    '.KYYYYKKYYYYKK..',
    '..KYYYYYYYYKKYK.',
    '.KYYYYYYYYYYKYK.',
    '.KYKYYYYYYKYKK..',
    '.KYYYYYYYYYYK...',
    '..KYYYYYYYYK....',
    '..KYYK..KYYK....',
    '..KKKK..KKKK....',
  ], { Y: '#f7d43c', R: '#e84a3c' }),
  ocarina_hadas: n64NinArt([
    '................',
    '................',
    '................',
    '....KKKKKK......',
    '...KBBBBBBKK....',
    '..KBbBBKBBBBK...',
    '.KBBBBBBBBKBBKKK',
    '.KBKBBBBKBBBBBBK',
    '.KBBBBBBBBBBBKKK',
    '..KBBKBBBBBBK...',
    '...KBBBBBBKK....',
    '....KKKKKK......',
    '................',
    '................',
    '................',
    '................',
  ], { B: '#c9a66b', b: '#f4ecc8' }),
  esmeralda_kokiri: n64NinArt([
    '................',
    '.......KK.......',
    '......KGGK......',
    '.....KGgGGK.....',
    '....KGgGGGGK....',
    '....KGGGGGGK....',
    '.....KGGGGK.....',
    '...KKKKGGKKKK...',
    '..KYYYYKKYYYYK..',
    '..KYKKYYYYKKYK..',
    '..KYK.KYYK.KYK..',
    '...KK.KYYK.KK...',
    '......KYYK......',
    '.......KK.......',
    '................',
    '................',
  ], { G: '#3ec46a', g: '#c8ffd8', Y: '#e8b830' }),
  jiggy: n64NinArt([
    '................',
    '......KKK.......',
    '.....KYYYK......',
    '.....KYYYK......',
    '..KKKKYYYKKKK...',
    '.KYYYYYYYYYYYK..',
    '.KYyYYYYYYYYYKK.',
    '..KYYYYYYYYYYYYK',
    '..KYYYYYYYYYYYYK',
    '.KYYYYYYYYYYYKK.',
    '.KYYYYYYYYYYYK..',
    '..KKKKYYYKKKK...',
    '.....KYYYK......',
    '.....KYYYK......',
    '......KKK.......',
    '................',
  ], { Y: '#f7c83c', y: '#fff4b0' }),
});

// ---------- Tesoros nuevos (vitrina, sala N64) ----------
Object.assign(TREASURES, {
  ocarina_hadas: { room: 'n64', name: 'Ocarina de las Hadas', desc: 'Regalo de Saria. En Ocarina of Time, ella le dio la suya a Link cuando salió del bosque.' },
  esmeralda_kokiri: { room: 'n64', name: 'Esmeralda Kokiri', desc: 'La Piedra Espiritual del Bosque. El Gran Árbol Deku la guardaba en Ocarina of Time.' },
  jiggy: { room: 'n64', name: 'Jiggy', desc: 'Una pieza de rompecabezas dorada. En Banjo-Kazooie había 100. Kazooie dice que esta le sobraba.' },
});

// Las raíces del Gran Árbol Deku (casillas D del claro del bosque).
N64_LOOKS.deku = '* Las raíces del Gran Árbol Deku.\n* Son tan viejas que tienen raíces propias.';

// ---------- Personajes ----------

// Lakitu: el camarógrafo de Super Mario 64. Habla el primero de los hermanos.
const N64_LAKITU = {
  id: 'lakitu64', sprite: 'lakitu64', x: 26, y: 13,
  async talk(ctx) {
    if (!ctx.flag('n64Lakitu')) {
      ctx.setFlag('n64Lakitu');
      await ctx.say([
        '* "Buenas tardes. Los Hermanos Lakitu, reportando en vivo\n* desde afuera del castillo de la princesa."',
        '* Así empezaba Super Mario 64: la cámara era YO, en mi nube.\n* Con los botones C me movías. ¡Ahora estoy filmando este hoyo MISSING!',
      ], 'LAKITU');
      return;
    }
    const primo = Save.data.done.camaraloca
      ? '* Gracias por calmar a Cámara Loca. Es mi primo.\n* Ahora ya solo se atora los domingos.'
      : '* ¿Ya viste a Cámara Loca en el estadio? Es mi primo.\n* Se atora en las paredes. Yo también, de joven.';
    const lines = [
      primo,
      '* Con el botón R cambiabas mi cámara por la de Mario.\n* Yo lo tomaba personal.',
      '* En el cuarto del espejo del castillo, el reflejo me mostraba a mí con la cámara.\n* ¡Por fin salí en pantalla!',
      '* Los fines de semana trabajo en Mario Kart 64:\n* sostengo el semáforo y saco del agua a los que se caen.',
    ];
    await ctx.say([lines[ctx.counter('n64Lakitu') % lines.length]], 'LAKITU');
  },
};

// Toad: guarda la carta de la princesa (la del principio de Super Mario 64).
const N64_TOAD = {
  id: 'toad64', sprite: 'toad64', x: 20, y: 15,
  async talk(ctx) {
    if (!ctx.flag('n64Toad')) {
      ctx.setFlag('n64Toad');
      await ctx.say([
        '* ¡Hola! La princesa Peach dejó esta carta:\n* "Mario: por favor ven al castillo. Te horneé un pastel."',
        '* ...Dice Mario, pero tú sirves. Del pastel no queda nada.\n* Marco dice que él no fue. Tiene betún en el marco.',
      ], 'TOAD');
      return;
    }
    const lines = [
      '* En el original, Bowser escondió las estrellas en los cuadros del castillo.\n* Aquí fue Marco. Copión.',
      '* Para acabar Super Mario 64 bastaban 70 estrellas.\n* Las 120 eran para los necios. Digo, para los valientes.',
      '* Super Mario 64 salió en Japón el 23 de junio de 1996,\n* el mismo día que la consola. ¡Llegaron juntos!',
      '* Afuera brinca un conejo amarillo, MIPS.\n* Nadie lo ha atrapado. Bueno, nadie que escriba lento.',
    ];
    await ctx.say([lines[ctx.counter('n64Toad') % lines.length]], 'TOAD');
  },
};

// MIPS: el conejo del sótano. Se atrapa escribiendo su nombre a tiempo.
const N64_MIPS = {
  id: 'mips64', sprite: 'mips64', x: 28, y: 18,
  async talk(ctx) {
    if (ctx.flag('n64Mips')) {
      await ctx.say([rand([
        '* MIPS se deja acariciar. Ya sabe que escribes más rápido que él brinca.',
        '* En Super Mario 64, MIPS salía en el sótano con 15 estrellas... y otra vez con 50.',
        '* MIPS mueve la nariz. Es su forma de procesar datos.',
      ])]);
      return;
    }
    await ctx.say(['* ¡Un conejo amarillo! Se llama MIPS.\n* ¡Escribe su nombre RAPIDO para atraparlo!']);
    const res = await ctx.challenge({ label: '¡Atrápalo!', texts: ['mips'], timeLimit: 2600 });
    if (!res.completed) {
      await ctx.say(['* ¡Se escapó brincando! Pero no se fue lejos.\n* (Los conejos de 1996 no tienen mucha memoria.)']);
      return;
    }
    ctx.setFlag('n64Mips');
    Sfx.coin();
    await ctx.say([
      '* ¡Lo atrapaste! MIPS se llama así por el procesador de la N64, un chip MIPS.\n* O sea: acabas de atrapar al cerebro de la consola.',
      '* En el original te daba una estrella. Aquí te da un dato.\n* ...Es lo mismo, pero más ligero.',
    ]);
  },
};

// El Gran Árbol Deku: guardián del Bosque Kokiri. Su cuerpo enorme es un adorno 3D (arbolDeku);
// lo que se toca es la raíz de enfrente.
const N64_DEKU = {
  id: 'deku64', sprite: 'deku64', x: 7, y: 5,
  async talk(ctx) {
    if (!Save.data.treasures.esmeralda_kokiri) {
      if (!ctx.flag('n64Deku')) {
        ctx.setFlag('n64Deku');
        await ctx.say([
          '* Navi... Navi, ¿dónde estás? Ven acá...\n* ...Ah. No eres Navi. Tienes cara de que escribes rápido.',
          '* Una vez se me metió en las raíces un bicho de un solo ojo, la Reina Gohma.\n* Desde entonces no confío en nadie con un ojo. Saludos, Trianguloso.',
        ], 'GRAN ARBOL DEKU');
      }
      await ctx.say(['* Guardo algo para quien escriba su nombre sin temblar:'], 'GRAN ARBOL DEKU');
      const text = 'piedra espiritual del bosque';
      const res = await ctx.challenge({ label: 'Escribe sin temblar:', texts: [text], timeLimit: text.length * 700 + 2500 });
      if (!res.completed) {
        await ctx.say(['* Hmm. Tus dedos tiemblan como hojas.\n* Vuelve cuando el viento se calme.'], 'GRAN ARBOL DEKU');
        return;
      }
      await ctx.give('esmeralda_kokiri');
      return;
    }
    const lines = [
      '* Los Kokiri nunca crecen. Por eso las puertas del bosque son tan bajitas.',
      '* Cada Kokiri tiene su hada. Link no tenía... hasta que le mandé a Navi.',
      '* Mido dice que nadie me visita sin espada y escudo.\n* Yo nunca dije eso. Mido inventa reglas.',
      '* El que está detrás de la niebla es el Bosque Perdido.\n* Si te pierdes, no te preocupes: todos se pierden.',
    ];
    await ctx.say([lines[ctx.counter('n64Deku') % lines.length]], 'GRAN ARBOL DEKU');
  },
};

// Saria: la amiga del bosque. Da su ocarina y conoce a Ocarín (sin prestarle canciones).
const N64_SARIA = {
  id: 'saria64', sprite: 'saria64', x: 9, y: 7,
  async talk(ctx) {
    if (!Save.data.treasures.ocarina_hadas) {
      await ctx.say(['* ¡Hola! Soy SARIA. ¿Vas a cruzar el bosque?\n* Toma, mi ocarina. Así te acuerdas de mí.'], 'SARIA');
      await ctx.give('ocarina_hadas');
      return;
    }
    const lines = [
      Save.data.done.ocarin
        ? '* ¡Tocaste con Ocarín! Él tiene sus canciones y yo las mías.\n* No nos prestamos ni una. Así somos los músicos.'
        : '* En el templo de los pilares vive Ocarín. Toca con S D F J K.\n* Sus canciones son suyas. ¡No le copies las mías!',
      '* Tranquilo, tengo otra ocarina igualita.\n* En el juego también: le di una a Link y me quedé tocando con otra.',
      '* Mido me sigue a todos lados. Es el jefe de los Kokiri. Él dice.',
      '* Si te pierdes en el bosque, sigue la música.\n* Aquí la niebla tapa todo, pero el sonido no.',
    ];
    await ctx.say([lines[ctx.counter('n64Saria') % lines.length]], 'SARIA');
  },
};

// Navi: el hada guía. Bit se pone celoso.
const N64_NAVI = {
  id: 'navi64', sprite: 'navi64', x: 5, y: 6,
  async talk(ctx) {
    if (!ctx.flag('n64Navi')) {
      ctx.setFlag('n64Navi');
      await ctx.say(['* ¡Hey! ¡Listen!\n* Soy NAVI, el hada del Gran Árbol Deku. ¡Yo guío a los héroes!'], 'NAVI');
      await ctx.say(['* ...Ejem. Aquí el guía soy YO.\n* Yo tengo cursor. Ella tiene... alas. Y brillo. Pff.'], 'BIT');
      return;
    }
    const lines = [
      '* ¡Hey! ¡Listen!\n* Mira la pantalla, no el teclado. Tus dedos ya saben dónde están.',
      '* ¡Hey! ¡Listen!\n* En Ocarina of Time apretabas Z y yo me pegaba al enemigo. ¡Z-targeting!',
      '* ¡Hey! ¡Listen!\n* Al principio yo iba a ser una flechita. Les pareció fea y me hicieron hada.',
      '* ¡Hey! ¡Listen!\n* ...No, nada. Solo quería ver si me hacías caso.',
    ];
    await ctx.say([lines[ctx.counter('n64Navi') % lines.length]], 'NAVI');
  },
};

// Banjo y Kazooie: un oso y una breegull en la mochila, al pie de la Montaña Espiral.
const N64_BANJO = {
  id: 'banjo64', sprite: 'banjo64', x: 22, y: 9,
  async talk(ctx) {
    if (!Save.data.treasures.jiggy) {
      if (!ctx.flag('n64Banjo')) {
        ctx.setFlag('n64Banjo');
        await ctx.say(['* ¡Guh-huh! Soy BANJO, y en la mochila viene KAZOOIE.\n* Esa meseta es nuestra Montaña Espiral. Versión playa.'], 'BANJO');
      }
      await ctx.say(['* ¿Ese es el héroe? ¡Tiene cara de escribir con dos dedos!\n* A ver, cabeza de tecla, escribe esto sin fallar:'], 'KAZOOIE');
      const text = '100 jiggies y 900 notas';
      const res = await ctx.challenge({ label: 'Reto de Kazooie:', texts: [text], timeLimit: text.length * 750 + 2500 });
      if (!res.completed) {
        await ctx.say(['* ¡JA! Lo sabía. Vuelve cuando te crezcan más dedos.'], 'KAZOOIE');
        return;
      }
      await ctx.say(['* ...Bueno, no estuvo TAN mal. Toma una pieza.\n* Total, nos faltan 99.'], 'KAZOOIE');
      await ctx.give('jiggy');
      return;
    }
    const lines = [
      ['BANJO', '* Antes de nuestro juego, yo corrí en Diddy Kong Racing, en 1997.\n* ¡Ahí debuté! Kazooie todavía no salía.'],
      ['KAZOOIE', '* Soy una BREEGULL. No un pollo. No una gallina. BREEGULL.\n* Apúntalo.'],
      ['BANJO', '* En nuestro juego había 100 Jiggies y 900 notas.\n* Las notas abrían las puertas del castillo de la bruja.'],
      ['KAZOOIE', '* ¿Huevos raros que no sirven para nada? ¡No nos mires!\n* Nosotros tampoco sabemos para qué son. ...Todavía.'],
      ['BANJO', '* Un topo con lentes, Bottles, nos enseñaba movimientos nuevos.\n* Kazooie le decía cosas feas. Yo le pedía perdón.'],
    ];
    const [who, line] = lines[ctx.counter('n64BanjoTalk') % lines.length];
    await ctx.say([line], who);
  },
};

// Fox McCloud: aterrizó en las islas flotantes. Peppy le dejó una frase pegada.
const N64_FOX = {
  id: 'fox64', sprite: 'fox64', x: 26, y: 0,
  async talk(ctx) {
    if (!ctx.flag('n64Fox')) {
      await ctx.say([
        '* Soy FOX McCLOUD, del equipo Star Fox. Aterricé a revisar el Arwing.',
        '* Mi compañero Peppy me grita todo el día: "Do a barrel roll!"\n* (Z o R dos veces.) A ver tú: ¡escríbelo, rápido!',
      ], 'FOX');
      const text = 'do a barrel roll';
      const res = await ctx.challenge({ label: '¡Esquiva!', texts: [text], timeLimit: text.length * 650 + 2000 });
      if (!res.completed) {
        await ctx.say(['* ¡Te dieron! Tranquilo, a Slippy le pasa diario.\n* Inténtalo otra vez.'], 'FOX');
        return;
      }
      ctx.setFlag('n64Fox');
      Sfx.coin();
      await ctx.say(['* ¡Esquivaste todo! ...Aunque, técnicamente, eso es un "giro de alerón".\n* No se lo digas a Peppy. Se ofende.'], 'FOX');
      return;
    }
    const lines = [
      Save.data.done.pakito
        ? '* Star Fox 64 (1997) fue el primer juego con Rumble Pak. Venía en la caja.\n* El cubito que vibra en el puente es mi fan. Me firmó un autógrafo a mí.'
        : '* Star Fox 64 (1997) fue el primer juego con Rumble Pak. Venía en la caja.\n* Por eso ese cubito del puente no deja de vibrar.',
      '* Peppy también dice: "Never give up. Trust your instincts!"\n* Y luego otra vez lo del barrel roll.',
      '* Todas las rutas de Star Fox 64 empiezan en Corneria.\n* Hasta las vacaciones.',
      '* Falco busca atajos. Slippy busca problemas. Yo busco a los dos.',
    ];
    await ctx.say([lines[ctx.counter('n64FoxTalk') % lines.length]], 'FOX');
  },
};

// Pikachu: junto a la tele del estadio. En Hey You, Pikachu! se le hablaba con micrófono.
const N64_PIKACHU = {
  id: 'pikachu64', sprite: 'pikachu64', x: 12, y: 18,
  async talk(ctx) {
    if (!ctx.flag('n64Pika')) {
      await ctx.say(['* ¿Pika?\n* (En Hey You, Pikachu! le hablabas con un micrófono de verdad. Aquí no hay.)'], 'PIKACHU');
      const res = await ctx.challenge({ label: 'Escríbele en vez de hablarle:', texts: ['hola pikachu'], timeLimit: 12 * 700 + 2500 });
      if (!res.completed) {
        await ctx.say(['* ...¿Pika? (Pikachu ladea la cabeza. No te entendió.)'], 'PIKACHU');
        return;
      }
      ctx.setFlag('n64Pika');
      Sfx.coin();
      await ctx.say(['* ¡PIKA PIKA! (Pikachu salta de gusto.)\n* Ese micrófono se llamaba VRU y entendía 256 palabras. Tú tecleas más.'], 'PIKACHU');
      return;
    }
    const lines = [
      '* ¡Pika! (Pikachu señala la tele.)\n* Hey You, Pikachu! salió en Japón en 1998 y en América hasta el 2000.',
      '* ¡Pikachu! (Hace pose de pelea.)\n* Fue uno de los 12 luchadores del primer Super Smash Bros., en 1999.',
      '* (Pikachu se sienta en una de las 4 sillas.)\n* Agarró el control bueno. Nadie se atreve a pedírselo.',
      '* Pika... (Pikachu bosteza.)\n* Al final de su juego, Oak lo regresa al bosque... y tras los créditos, vuelve.',
    ];
    await ctx.say([lines[ctx.counter('n64PikaTalk') % lines.length]], 'PIKACHU');
  },
};

// ---------- Se acomodan en los mapas de la isla ----------
[['n64-castillo', [N64_LAKITU, N64_TOAD, N64_MIPS]], ['n64-circuito', [N64_DEKU, N64_SARIA, N64_NAVI]],
  ['n64-playa', [N64_BANJO]], ['n64-estadio', [N64_FOX, N64_PIKACHU]]].forEach(([id, list]) => {
  const m = MAPS[id];
  m.npcs = (m.npcs || []).concat(list);
});

// El Gran Árbol Deku (enorme, sobre las casillas D) y el Arwing estacionado en el aire.
MAPS['n64-circuito'].decor3d = (MAPS['n64-circuito'].decor3d || []).concat([{ model: 'arbolDeku', x: 7, y: 3.4 }]);
MAPS['n64-estadio'].decor3d = (MAPS['n64-estadio'].decor3d || []).concat([{ model: 'arwing', x: 26.5, y: 4, y3: 2.4 }]);

MAPS['n64-castillo'].bitTips.push(
  '* ¡Ese de la nube es LAKITU! El camarógrafo de Super Mario 64.\n* Mi ídolo. ¿Crees que me dé su autógrafo?',
  '* Hay una placa borrosa en el patio. Dicen que dice algo de Luigi...\n* Yo no la puedo leer. Tengo resolución de 1989.',
);
MAPS['n64-circuito'].bitTips.push(
  '* Ese árbol gigante tiene CARA. Y bigote.\n* ...Y un hada que habla más que yo. No me cae bien.',
);
MAPS['n64-playa'].bitTips.push('* El oso dice "guh-huh" y la pájara dice groserías. Bueno, casi groserías.');
MAPS['n64-estadio'].bitTips.push(
  '* ¡Una nave en el aire! Es el Arwing de Fox.\n* Si le haces un barrel roll, ¿te mareas?',
  '* Pikachu está viendo la tele. Shhh. Dice que ya va a empezar su programa.',
);

// ---------- Modelos low-poly ----------
if (typeof Poly !== 'undefined') {
  Object.assign(Poly.models, {
    // Lakitu: en su nube, con lentes y una caña con la cámara colgando.
    lakitu64(v) {
      const g = new THREE.Group();
      [[0, 0, 0.8], [0.7, -0.1, 0.55], [-0.7, -0.1, 0.55], [0, -0.1, 0.6]].forEach(([x, y, r]) => {
        const c = v.mesh(new THREE.IcosahedronGeometry(r, 0), N64C.white, null, g);
        c.position.set(x, 0.5 + y, 0);
        c.scale.y = 0.6;
      });
      const shell = v.mesh(new THREE.IcosahedronGeometry(0.5, 0), N64C.grass, null, g);
      shell.position.set(0, 1.15, -0.12);
      const body = v.mesh(new THREE.IcosahedronGeometry(0.42, 0), '#F7D060', null, g);
      body.position.set(0, 1.15, 0.12);
      const head = v.mesh(new THREE.IcosahedronGeometry(0.42, 0), '#F7D060', null, g);
      head.position.set(0, 1.8, 0.1);
      const glasses = v.mesh(new THREE.BoxGeometry(0.6, 0.16, 0.1), N64C.black, null, g);
      glasses.position.set(0, 1.9, 0.48);
      const rod = v.mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 4), '#8A6A3A', null, g);
      rod.rotation.z = -0.9;
      rod.position.set(0.85, 1.9, 0.3);
      const cam = v.mesh(new THREE.BoxGeometry(0.4, 0.3, 0.35), '#3A3A44', null, g);
      cam.position.set(1.5, 2.0, 0.3);
      const lens = v.mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 6), N64C.black, null, g);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(1.5, 2.0, 0.55);
      g.userData.anim = (t) => { g.position.y = Math.sin(t * 2) * 0.15; g.rotation.y = Math.sin(t * 0.7) * 0.25; };
      return g;
    },

    toad64(v) {
      const g = new THREE.Group();
      const pants = v.mesh(new THREE.BoxGeometry(0.6, 0.4, 0.45), N64C.white, null, g);
      pants.position.y = 0.4;
      const vest = v.mesh(new THREE.BoxGeometry(0.66, 0.45, 0.5), N64C.water, null, g);
      vest.position.y = 0.82;
      const head = v.mesh(new THREE.IcosahedronGeometry(0.34, 0), N64C.skin, null, g);
      head.position.y = 1.3;
      const cap = v.mesh(new THREE.IcosahedronGeometry(0.62, 1), N64C.white, null, g);
      cap.position.y = 1.72;
      cap.scale.set(1, 0.72, 1);
      [[0, 2.1, 0], [0.48, 1.8, 0.2], [-0.48, 1.8, 0.2], [0, 1.82, 0.52]].forEach(([x, y, z]) => {
        v.mesh(new THREE.IcosahedronGeometry(0.17, 0), N64C.red, null, g).position.set(x, y, z);
      });
      this.eyes(v, g, { y: 1.3, z: 0.24, x: 0.12, r: 0.08 });
      [-0.15, 0.15].forEach((x) => { const s = v.mesh(new THREE.BoxGeometry(0.22, 0.18, 0.32), '#8A5A2A', null, g); s.position.set(x, 0.1, 0.04); });
      return g;
    },

    // MIPS: conejo amarillo que no deja de brincar.
    mips64(v) {
      const g = new THREE.Group();
      const Y = '#F7D43C';
      const body = v.mesh(new THREE.IcosahedronGeometry(0.5, 0), Y, null, g);
      body.position.y = 0.6;
      body.scale.set(1, 0.9, 1.1);
      const belly = v.mesh(new THREE.IcosahedronGeometry(0.32, 0), '#FFF4C0', null, g);
      belly.position.set(0, 0.55, 0.3);
      const head = v.mesh(new THREE.IcosahedronGeometry(0.36, 0), Y, null, g);
      head.position.set(0, 1.2, 0.15);
      [-0.15, 0.15].forEach((x) => {
        const ear = v.mesh(new THREE.BoxGeometry(0.12, 0.6, 0.08), Y, null, g);
        ear.position.set(x, 1.7, 0.05);
        ear.rotation.z = x * 1.2;
      });
      this.eyes(v, g, { y: 1.25, z: 0.42, x: 0.13, r: 0.08 });
      const nose = v.mesh(new THREE.BoxGeometry(0.08, 0.06, 0.05), '#F48FB1', null, g);
      nose.position.set(0, 1.14, 0.5);
      g.userData.anim = (t) => { g.position.y = Math.abs(Math.sin(t * 5)) * 0.35; };
      return g;
    },

    // La raíz del Gran Árbol Deku que se ve frente al tronco (el NPC que se toca).
    deku64(v) {
      const g = new THREE.Group();
      [[-0.5, 0], [0.5, 0], [0, 0.3]].forEach(([x, z]) => {
        const r = v.mesh(new THREE.IcosahedronGeometry(0.4, 0), '#6B4A2A', null, g);
        r.position.set(x, 0.15, z);
        r.scale.set(1.3, 0.4, 1);
      });
      return g;
    },

    // El Gran Árbol Deku: tronco enorme con ojos, boca y bigote de corteza, y una copa de hojas.
    arbolDeku(v) {
      const g = new THREE.Group();
      const B = '#7A5230';
      const trunk = v.mesh(new THREE.CylinderGeometry(1.7, 2.3, 6.5, 8), B, null, g);
      trunk.position.y = 3.25;
      [-0.65, 0.65].forEach((x) => {
        const eye = v.mesh(new THREE.BoxGeometry(0.55, 0.4, 0.2), N64C.black, null, g);
        eye.position.set(x, 4.3, 1.75);
        const brow = v.mesh(new THREE.BoxGeometry(0.85, 0.22, 0.3), '#C9A66B', null, g);
        brow.position.set(x, 4.75, 1.72);
        brow.rotation.z = x > 0 ? -0.2 : 0.2;
        const stache = v.mesh(new THREE.BoxGeometry(0.9, 0.3, 0.3), '#C9A66B', null, g);
        stache.position.set(x * 0.9, 3.35, 1.85);
        stache.rotation.z = x > 0 ? 0.35 : -0.35;
      });
      const nose = v.mesh(new THREE.ConeGeometry(0.25, 0.6, 4), B, null, g);
      nose.rotation.x = Math.PI / 2;
      nose.position.set(0, 3.8, 1.9);
      const mouth = v.mesh(new THREE.BoxGeometry(0.9, 0.55, 0.2), '#2A1A10', null, g);
      mouth.position.set(0, 2.7, 1.85);
      [[0, 0], [2.2, 0.4], [-2.2, 0.4], [1.2, -1.8], [-1.2, -1.8], [0, 1.8]].forEach(([x, z], i) => {
        const leaf = v.mesh(new THREE.IcosahedronGeometry(2.2 - (i % 2) * 0.4, 0), i % 2 ? N64C.grassD : '#357A3B', null, g);
        leaf.position.set(x, 7.6 + (i % 3) * 0.5, z - 0.6);
      });
      [-1.6, 1.6].forEach((x) => {
        const root = v.mesh(new THREE.BoxGeometry(1.2, 0.5, 0.8), B, null, g);
        root.position.set(x, 0.25, 1.6);
        root.rotation.y = x > 0 ? -0.5 : 0.5;
      });
      return g;
    },

    saria64(v) {
      const g = new THREE.Group();
      const tunic = v.mesh(new THREE.ConeGeometry(0.55, 1.0, 6), N64C.grassD, null, g);
      tunic.position.y = 0.75;
      const head = v.mesh(new THREE.IcosahedronGeometry(0.4, 0), N64C.skin, null, g);
      head.position.y = 1.55;
      const hair = v.mesh(new THREE.IcosahedronGeometry(0.46, 0), N64C.grass, null, g);
      hair.position.set(0, 1.68, -0.1);
      hair.scale.set(1.05, 0.85, 1);
      this.eyes(v, g, { y: 1.55, z: 0.32, x: 0.14, r: 0.08 });
      const oca = v.mesh(new THREE.IcosahedronGeometry(0.12, 0), '#C9A66B', null, g);
      oca.position.set(0.3, 1.0, 0.4);
      [-0.15, 0.15].forEach((x) => { const l = v.mesh(new THREE.BoxGeometry(0.16, 0.3, 0.16), '#8A5A2A', null, g); l.position.set(x, 0.15, 0); });
      return g;
    },

    // Navi: una bolita de luz con cuatro alas, flotando.
    navi64(v) {
      const g = new THREE.Group();
      const glow = v.mat('#E8F6FF', { emissive: '#6FB4F0' });
      const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 1), glow);
      g.add(ball);
      const wingMat = v.mat('#9FD3FF', { transparent: true, opacity: 0.6, side: THREE.DoubleSide });
      const wings = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sy]) => {
        const w = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.24), wingMat);
        w.position.set(sx * 0.3, sy * 0.14, -0.05);
        w.rotation.z = sx * sy * 0.5;
        g.add(w);
        return w;
      });
      g.userData.anim = (t) => {
        g.position.y = 1.3 + Math.sin(t * 3) * 0.25;
        g.position.x = Math.sin(t * 1.3) * 0.3;
        wings.forEach((w, i) => { w.rotation.y = Math.sin(t * 30 + i) * 0.8; });
      };
      return g;
    },

    // Banjo con su short amarillo y la mochila azul; Kazooie se asoma por arriba.
    banjo64(v) {
      const g = new THREE.Group();
      const BR = '#A0642D';
      const shorts = v.mesh(new THREE.BoxGeometry(0.85, 0.4, 0.6), N64C.yellow, null, g);
      shorts.position.y = 0.55;
      const body = v.mesh(new THREE.BoxGeometry(0.9, 0.7, 0.62), BR, null, g);
      body.position.y = 1.08;
      const head = v.mesh(new THREE.IcosahedronGeometry(0.45, 0), BR, null, g);
      head.position.y = 1.8;
      const snout = v.mesh(new THREE.IcosahedronGeometry(0.22, 0), '#E8C890', null, g);
      snout.position.set(0, 1.72, 0.38);
      [-0.3, 0.3].forEach((x) => {
        v.mesh(new THREE.IcosahedronGeometry(0.15, 0), BR, null, g).position.set(x, 2.2, 0);
        const l = v.mesh(new THREE.BoxGeometry(0.3, 0.35, 0.34), BR, null, g);
        l.position.set(x * 0.8, 0.18, 0);
      });
      this.eyes(v, g, { y: 1.92, z: 0.36, x: 0.15, r: 0.08 });
      const tooth = v.mesh(new THREE.ConeGeometry(0.06, 0.16, 4), N64C.white, null, g);
      tooth.rotation.x = Math.PI;
      tooth.position.set(0, 1.3, 0.34);
      const pack = v.mesh(new THREE.BoxGeometry(0.8, 0.75, 0.42), N64C.water, null, g);
      pack.position.set(0, 1.15, -0.52);
      const kaz = v.mesh(new THREE.IcosahedronGeometry(0.24, 0), N64C.red, null, g);
      kaz.position.set(0.15, 1.7, -0.55);
      const beak = v.mesh(new THREE.ConeGeometry(0.08, 0.36, 4), N64C.orange, null, g);
      beak.rotation.x = Math.PI / 2;
      beak.position.set(0.15, 1.68, -0.2);
      g.userData.anim = (t) => { kaz.position.y = 1.7 + Math.max(0, Math.sin(t * 1.7)) * 0.2; };
      return g;
    },

    // Fox McCloud: zorro naranja, chamarra verde, pañuelo rojo y pantalón blanco.
    fox64(v) {
      const g = new THREE.Group();
      const O = '#E8903C';
      [-0.17, 0.17].forEach((x) => {
        const l = v.mesh(new THREE.BoxGeometry(0.24, 0.6, 0.28), N64C.white, null, g);
        l.position.set(x, 0.32, 0);
        const ear = v.mesh(new THREE.ConeGeometry(0.13, 0.42, 4), O, null, g);
        ear.position.set(x * 1.4, 2.25, -0.05);
      });
      const jacket = v.mesh(new THREE.BoxGeometry(0.78, 0.72, 0.5), '#4C7A4C', null, g);
      jacket.position.y = 0.98;
      const scarf = v.mesh(new THREE.BoxGeometry(0.5, 0.14, 0.42), N64C.red, null, g);
      scarf.position.y = 1.4;
      const head = v.mesh(new THREE.IcosahedronGeometry(0.38, 0), O, null, g);
      head.position.y = 1.78;
      const snout = v.mesh(new THREE.ConeGeometry(0.17, 0.42, 4), N64C.white, null, g);
      snout.rotation.x = Math.PI / 2;
      snout.position.set(0, 1.7, 0.42);
      this.eyes(v, g, { y: 1.88, z: 0.3, x: 0.14, r: 0.07 });
      const tail = v.mesh(new THREE.ConeGeometry(0.16, 0.7, 5), O, null, g);
      tail.rotation.x = -2.2;
      tail.position.set(0, 0.7, -0.45);
      return g;
    },

    // El Arwing: nave blanca con alas en flecha y puntas azules. Se mece en el aire.
    arwing(v) {
      const g = new THREE.Group();
      const body = v.mesh(new THREE.ConeGeometry(0.5, 3, 4), N64C.white, null, g);
      body.rotation.x = Math.PI / 2;
      const glass = v.mesh(new THREE.IcosahedronGeometry(0.35, 0), '#3C8DD6', null, g);
      glass.position.set(0, 0.32, -0.2);
      [-1, 1].forEach((s) => {
        const wing = v.mesh(new THREE.BoxGeometry(2.2, 0.08, 0.8), '#C9D6E3', null, g);
        wing.position.set(s * 1.3, -0.1, -0.6);
        wing.rotation.y = s * 0.45;
        const fin = v.mesh(new THREE.BoxGeometry(0.1, 1.1, 0.7), N64C.water, null, g);
        fin.position.set(s * 2.3, 0.35, -1.0);
        fin.rotation.z = s * -0.3;
        const jet = v.mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.3, 6), N64C.orange, null, g);
        jet.rotation.x = Math.PI / 2;
        jet.position.set(s * 0.35, 0, -1.55);
      });
      g.rotation.y = 0.6;
      return g;
    },

    pikachu64(v) {
      const g = new THREE.Group();
      const Y = '#F7D43C';
      const body = v.mesh(new THREE.IcosahedronGeometry(0.55, 0), Y, null, g);
      body.position.y = 0.62;
      body.scale.set(1, 1.05, 0.9);
      const head = v.mesh(new THREE.IcosahedronGeometry(0.46, 0), Y, null, g);
      head.position.y = 1.4;
      [-1, 1].forEach((s) => {
        const ear = v.mesh(new THREE.ConeGeometry(0.13, 0.75, 4), Y, null, g);
        ear.position.set(s * 0.3, 2.0, 0);
        ear.rotation.z = -s * 0.35;
        const tip = v.mesh(new THREE.ConeGeometry(0.08, 0.25, 4), N64C.black, null, g);
        tip.position.set(s * 0.43, 2.35, 0);
        tip.rotation.z = -s * 0.35;
        const cheek = v.mesh(new THREE.IcosahedronGeometry(0.11, 0), '#E84A3C', null, g);
        cheek.position.set(s * 0.3, 1.3, 0.34);
        const foot = v.mesh(new THREE.BoxGeometry(0.22, 0.12, 0.3), Y, null, g);
        foot.position.set(s * 0.25, 0.08, 0.15);
      });
      this.eyes(v, g, { y: 1.5, z: 0.38, x: 0.17, r: 0.08 });
      // La cola de rayo: tres tablitas en zigzag.
      [[0, 0.7, -0.55, 0.6, '#A0642D'], [0.2, 1.05, -0.65, -0.6, Y], [0, 1.4, -0.75, 0.6, Y]].forEach(([x, y, z, r, c]) => {
        const seg = v.mesh(new THREE.BoxGeometry(0.42, 0.18, 0.06), c, null, g);
        seg.position.set(x, y, z);
        seg.rotation.z = r;
      });
      g.userData.anim = (t) => { g.rotation.y = Math.sin(t * 0.9) * 0.3; };
      return g;
    },
  });
}
if (typeof T3_MODELS !== 'undefined') {
  ['lakitu64', 'toad64', 'mips64', 'deku64', 'saria64', 'navi64', 'banjo64', 'fox64', 'pikachu64'].forEach((id) => { T3_MODELS[id] = id; });
}
