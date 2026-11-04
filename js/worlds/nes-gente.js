// MUNDO 2 — La gente de verdad del Castillo 8-Bit. Se carga después de js/worlds/nes-mapa.js.
// El mundo es un viaje por los juegos de la NES: el REINO CHAMPIÑÓN (Super Mario Bros.), la OBRA 25m
// (Donkey Kong), HYRULE y su mazmorra (The Legend of Zelda), la CIUDAD DEL BOX (Punch-Out!!) y el
// CASTILLO DE BOWSER. Cada quien da algo al hablarle: un dato de verdad, una pista o un objeto. Máximo 2 páginas.
//
//   Reino Champiñón  Pit (Kid Icarus, bajo las nubes) 9,2 · Toad frente a su casa 9,15
//   Obra 25m         Popo y Nana (Ice Climbers) 15,12 y 16,12
//   Hyrule           el anciano de la cueva con sus dos fuegos 30,4 (fuegos 29,4 y 31,4)
//                    el perro que se ríe (Duck Hunt), abuelo de Toby, en la pradera 8,11
//   Ciudad del Box   Little Mac 10,12 · Doc Louis 14,12 (a los lados de la entrada del ring)
//   Castillo Bowser  Samus 2,5 · Peach 21,2 y Bowser 21,11 (después de Lord Caparazón)

// ---------- Dibujos (16×16, máximo 3 colores, como los sprites de la NES) ----------

const NES_GENTE_ART = nesArt({
  // Toad: el hongo del castillo. El paje es su primo (por eso se parecen tanto).
  nes_toad: [
    '....WWWWWWWW....',
    '..WWRRWWWWRRWW..',
    '.WRRRRWWWWRRRRW.',
    '.WRRRWWRRWWRRRW.',
    'WWWWWWRRRRWWWWWW',
    'WRRWWWWRRWWWWRRW',
    '.WWWWWWWWWWWWWW.',
    '...SSSSSSSSSS...',
    '...SSRSSSSRSS...',
    '...SSRSSSSRSS...',
    '....SSSSSSSS....',
    '...RRWWWWWWRR...',
    '..SRRWWWWWWRRS..',
    '...RRWWWWWWRR...',
    '....WW....WW....',
    '...RRR....RRR...',
  ],
  nes_peach: [
    '......Y.Y.Y.....',
    '......YYYYY.....',
    '.....YYYYYYY....',
    '....YYSSSSSYY...',
    '....YSFSSFSSY...',
    '....YSSSSSSSY...',
    '....YYSSFSSYY...',
    '....YYYSSSYYY...',
    '.....YFFFFFY....',
    '....SFFFFFFFS...',
    '....SFFYFFFFS...',
    '....FFFFFFFFF...',
    '...FFFFFFFFFFF..',
    '...FFFFFFFFFFF..',
    '..FFFFFFFFFFFFF.',
    '..FFFFFFFFFFFFF.',
  ],
  nes_bowser: [
    '...W........W...',
    '...WW.SSSS.WW...',
    '....SSSSSSSS....',
    '...SSWGSSGWSS...',
    '...SSSSSSSSSS...',
    '..WSSWSWSWSSSW..',
    '.WGGSSSSSSSSGGW.',
    '.GGGSWWWWWWSGGG.',
    'WGGGSWSSSSWSGGGW',
    '.GGGSWWWWWWSGGG.',
    'WGGGSWSSSSWSGGGW',
    '.GGGSWWWWWWSGGG.',
    '..GGSSSSSSSSGG..',
    '...SSSS..SSSS...',
    '..WSSSS..SSSSW..',
    '..W.WW....WW.W..',
  ],
  // El anciano de la cueva: túnica roja y barba blanca.
  nes_anciano: [
    '.....RRRRRR.....',
    '....RRRRRRRR....',
    '....RSSSSSSR....',
    '....SRSSSSRS....',
    '....SSSSSSSS....',
    '....WSSSSSSW....',
    '....WWWWWWWW....',
    '...RWWWWWWWWR...',
    '..RRRWWWWWWRRR..',
    '..RRRRWWWWRRRR..',
    '.SRRRRRWWRRRRRS.',
    '.SRRRRRRRRRRRRS.',
    '..RRRRRRRRRRRR..',
    '..RRRRRRRRRRRR..',
    '..RRRRRRRRRRRR..',
    '...RRRR..RRRR...',
  ],
  nes_fuego: [
    '.......F........',
    '......FF........',
    '......FF...F....',
    '.....FFF..FF....',
    '....FFYF..FF....',
    '....FYYFFFF.....',
    '...FFYYYFF.F....',
    '...FYYWYYFFF....',
    '..FFYWWWYYFF....',
    '..FYYWWWWYYF....',
    '..FYWWWWWWYF....',
    '..FYYWWWWYYF....',
    '...FYYWWYYF.....',
    '....FFYYFF......',
    '.....FFFF.......',
    '................',
  ],
  // El perro de Duck Hunt, riéndose (como siempre).
  nes_perro: [
    '....KK....KK....',
    '...KKKO..OKKK...',
    '...KKOOOOOOKK...',
    '....OOOOOOOO....',
    '....OKOOOOKO....',
    '....OOOOOOOO....',
    '...OOWWWWWWOO...',
    '...OWWKKKKWWO...',
    '...OWWWWWWWWO...',
    '....OWWWWWWO....',
    '....OOWWWWOO....',
    '...OOOWWWWOOO...',
    '..OOOOWWWWOOOO..',
    '..OOOOOOOOOOOO..',
    '..OOO.OOOO.OOO..',
    '..KK..KK.KK..KK.',
  ],
  // Samus con su traje y el cañón en el brazo derecho.
  nes_samus: [
    '.....OOOOOO.....',
    '....OOOOOOOO....',
    '....OGGGGGGO....',
    '....OGGGGGGO....',
    '....OOOOOOOO....',
    '..YYYOOOOOOYYY..',
    '.YYYYYOOOOYYYYY.',
    '.YYYOOOOOOOOYYY.',
    '..OOOOYYYYOOOOOO',
    '..OOOOYYYYOOOOOO',
    '..OO.OOOOOO.OOO.',
    '.....OOOOOO.....',
    '....OOO..OOO....',
    '....OOO..OOO....',
    '....YYY..YYY....',
    '...OOOO..OOOO...',
  ],
  nes_pit: [
    '.....OOOOOO.....',
    '....OOOOOOOO....',
    '....OSSSSSSO....',
    '....SOSSSSOS....',
    '....SSSSSSSS....',
    '.....SSSSSS.....',
    '.W...WWWWWW...W.',
    '.WW.WWWWWWWW.WW.',
    '.WWWSWWWWWWSWWW.',
    '..WWSWWWWWWSWW..',
    '...WWWWWWWWWW...',
    '....WWWWWWWW....',
    '....WWWWWWWW....',
    '.....SS..SS.....',
    '.....SS..SS.....',
    '....OOO..OOO....',
  ],
  // Popo de azul. Nana es el MISMO dibujo con otra paleta (abajo).
  nes_popo: [
    '.....UUUUUU.....',
    '....UUUUUUUU....',
    '...UUWWWWWWUU...',
    '...UWSSSSSSWU...',
    '...UWSUSSUSWU...',
    '...UWSSSSSSWU...',
    '...UUWWWWWWUU...',
    '..UUUUUUUUUUUU..',
    '.SUUUUUUUUUUUUS.',
    '.SUUUUWWUUUUUUS.',
    '..UUUUWWUUUUUU..',
    '..UUUUUUUUUUUU..',
    '...WWWWWWWWWW...',
    '...UUUU..UUUU...',
    '...UUUU..UUUU...',
    '..WWWW....WWWW..',
  ],
  nes_littlemac: [
    '.....KKKKKK.....',
    '....KKKKKKKK....',
    '....KSSSSSSK....',
    '....SKSSSSKS....',
    '....SSSSSSSS....',
    '.....SSSSSS.....',
    '.GG..KKKKKK..GG.',
    'GGGGSKKKKKKSGGGG',
    'GGGGSKKKKKKSGGGG',
    '.GG.SKKKKKKS.GG.',
    '.....GGGGGG.....',
    '.....GGGGGG.....',
    '.....SS..SS.....',
    '.....SS..SS.....',
    '.....SS..SS.....',
    '....KKK..KKK....',
  ],
  nes_doclouis: [
    '................',
    '.....WWWWWW.....',
    '....WBBBBBBW....',
    '....BWBBBBWB....',
    '....BBBBBBBB....',
    '....BWWWWWWB....',
    '.....BBBBBB.....',
    '...FFFFFFFFFF...',
    '..FFFFWFFWFFFF..',
    '..FFFFWFFWFFFF..',
    '..BFFFFFFFFFFB..',
    '...FFFFFFFFFF...',
    '...FFFWWWWFFF...',
    '....FFF..FFF....',
    '....FFF..FFF....',
    '...WWWW..WWWW...',
  ],
});
// Nana: el dibujo de Popo con parka rosa (#f878f8 es un rosa de la paleta de la NES).
NES_GENTE_ART.sprites.nes_nana = NES_GENTE_ART.sprites.nes_popo.slice();
NES_GENTE_ART.palettes.nes_nana = { ...NES_GENTE_ART.palettes.nes_popo, d: '#f878f8' };

Object.assign(SPRITES, NES_GENTE_ART.sprites);
Object.assign(SPRITE_PALETTES, NES_GENTE_ART.palettes);
// Cada dibujo conserva sus colores de verdad en el mapa (no los de la era).
Object.keys(NES_GENTE_ART.sprites).forEach((id) => { SPRITES[id].pal = NES_GENTE_ART.palettes[id]; });

// ---------- Cómo hablan ----------

// La primera vez dice `first` (1 o 2 páginas); después va dando un dato distinto cada vez.
function nesGente(id, speaker, first, lines) {
  return async (ctx) => {
    const n = ctx.counter(`gente_${id}`);
    if (n === 0 && first) { await ctx.say(first, speaker); return; }
    await ctx.say([lines[(n - (first ? 1 : 0)) % lines.length]], speaker);
  };
}

// El anciano de la cueva: si no tienes espada, te da la de madera (la misma del Anciano del pueblo).
async function nesAnciano(ctx) {
  if (!Save.data.treasures.espada) {
    await ctx.say(['* IT\'S DANGEROUS TO GO ALONE! TAKE THIS.', '* (Es peligroso ir solo. ¡Toma esto!)\n* Así lo decía en la primera cueva de Hyrule, en 1986.'], 'ANCIANO');
    await ctx.give('espada');
    await ctx.say(['* Con ella, la puerta de madera de la mazmorra se abre fácil.'], 'ANCIANO');
    return;
  }
  const lines = [
    '* IT\'S DANGEROUS TO GO ALONE! TAKE TH—\n* ...Ah, ya traes espada. ¿Te la dio mi hermano del pueblo?',
    '* DODONGO DISLIKES SMOKE.\n* (Al Dodongo se le vence con bombas. Tragabombas es su primo: dale "bomba" perfecta.)',
    '* Para salir del Bosque Perdido: norte, oeste, sur, oeste.\n* Me lo vendió una viejita. Carísimo.',
    '* Un Moblin me contó: IT\'S A SECRET TO EVERYBODY.\n* ...Ups. Ya no es secreto.',
    '* En las mazmorras, si picas a un anciano con la espada,\n* sus fuegos te disparan. Mejor ni lo intentes.',
    '* LET\'S PLAY A MONEY-MAKING GAME.\n* ...Es broma. Aquí no hay rupias, solo letras.',
  ];
  await ctx.say([lines[ctx.counter('gente_anciano') % lines.length]], 'ANCIANO');
}

const nesFuego = (ctx) => ctx.say(['* Un fuego que no se apaga nunca.\n* Lleva desde 1986 cuidando al anciano.']);

// El perro de Duck Hunt (el abuelo de Toby).
const nesPerro = nesGente('perro', 'PERRO', [
  '* (Un perro café sale del pasto alto.)\n* ...Je je je je je.',
  '* (Es el abuelo de Toby: el perro de Duck Hunt, 1984.\n* En el juego nunca le pusieron nombre.)',
], [
  '* Je je je. (En la tele de tu casa no se le podía disparar.\n* En las maquinitas VS. Duck Hunt, en la ronda de bonus, sí.)',
  '* (El perro te mira fallar en tu cabeza... y se ríe por adelantado.)',
  '* (La Zapper solo funcionaba en teles de tubo.\n* El perro dice que por eso ya no lo invitan a nada.)',
]);

// ---------- Dónde están ----------

// Toad, frente a su casa (como las Casas de Toad de Super Mario Bros. 3): antes de la Obra da el
// camino; al vencer a Kongo por fin dice su frase famosa; después, datos de verdad.
const nesToadFacts = nesGente('toadfacts', 'TOAD', null, [
  '* En 1985 éramos siete: uno en cada castillo, del 1 al 7.\n* La princesa estaba hasta el 8-4. Pobre Mario.',
  '* El manual de 1985 no nos decía Toad.\n* Nos llamaba "Mushroom People": la gente hongo.',
  '* ¿Sabías? El "Bowser" del castillo 1-4 era un Goomba disfrazado.\n* Con bolas de fuego se le caía el disfraz.',
  '* ¿Perdido? El camino de arena lleva a la OBRA 25m.\n* Y de ahí, una tubería a Hyrule.',
]);
async function nesToad(ctx) {
  if (!Save.data.done.kongo && !ctx.flag('nesToadHola')) {
    ctx.setFlag('nesToadHola');
    await ctx.say([
      '* ¡Hola! Soy TOAD y esta es mi casa.\n* En Super Mario Bros. 3, las Casas de Toad regalaban objetos.',
      '* Yo regalo consejos: sigue el CAMINO DE ARENA.\n* Lleva a la OBRA 25m, donde un gorila toca el tambor.',
    ], 'TOAD');
    return;
  }
  if (Save.data.done.kongo && !ctx.flag('nesToadThanks')) {
    ctx.setFlag('nesToadThanks');
    await ctx.say([
      '* THANK YOU MARIO!\n* BUT OUR PRINCESS IS IN ANOTHER CASTLE!',
      '* ...¿No eres Mario? Ups. Es la única frase que me sé.\n* Mi primo el paje la dice en español. Y con tu consola.',
    ], 'TOAD');
    return;
  }
  await nesToadFacts(ctx);
}

MAPS['nes-patio'].npcs.push({
  id: 'nes_toad', sprite: 'nes_toad', x: 9, y: 15, talk: nesToad,
}, {
  // Pit bajó siguiendo las nubes: está justo debajo del cielo.
  id: 'nes_pit', sprite: 'nes_pit', x: 9, y: 2,
  talk: nesGente('pit', 'PIT', [
    '* ¡Hola! Soy PIT, ángel de la diosa Palutena.\n* Bajé siguiendo las nubes. ¿Son de verdad o son arbustos?',
    '* En Angel Land busco los Tres Tesoros Sagrados:\n* el Escudo Espejo, las Flechas de Luz y las Alas de Pegaso.',
  ], [
    '* Cuidado con el Mago Berenjena: te convierte en BERENJENA.\n* Solo te curan en el hospital de la fortaleza.',
    '* Mi juego (Kid Icarus, 1986) lo hizo el mismo equipo de Metroid.\n* Por eso los pasillos se parecen tanto.',
    '* Medusa se robó los tesoros. Yo me escapé del Inframundo\n* trepando. Sin volar. Un ángel que no vuela, ¿tú crees?',
  ]),
});

const NES_C1 = MAPS['nes-castillo1'];
NES_C1.npcs.push(
  {
    id: 'nes_popo', sprite: 'nes_popo', x: 15, y: 12,
    talk: nesGente('popo', 'POPO', [
      '* ¡Somos POPO y NANA, los ICE CLIMBERS (1985)!\n* Estas vigas no tienen hielo. ¡Qué fácil!',
      '* Allá arriba hay un gorila. En nuestras montañas hay un CÓNDOR\n* que se roba las verduras. Sobre todo las berenjenas.',
    ], [
      '* Arriba de cada montaña pasa el cóndor.\n* Si te cuelgas de él, ¡puntos extra!',
      '* Son 32 montañas en el cartucho.\n* Llevamos 31. La última la dejamos de postre.',
      '* Cuidado con el Nitpicker, un pajarito que baja de las cuevas de hielo.\n* Pica. Mucho.',
    ]),
  },
  {
    id: 'nes_nana', sprite: 'nes_nana', x: 16, y: 12,
    talk: nesGente('nana', 'NANA', null, [
      '* Popo y yo somos el MISMO dibujo. Él de azul, yo de rosa.\n* Como la nube y el arbusto del Reino Champiñón.',
      '* En Japón nos estorbaban unas focas, los Topi.\n* Afuera las cambiaron por yetis chiquitos.',
      '* ¿El martillo? Es para romper hielo.\n* Aquí ni lo saco: estas vigas son de Kongo.',
    ]),
  },
);
NES_C1.bitTips.push('* ¿Esos dos de parka? Vienen de escalar montañas de hielo.\n* Aquí les parece fácil.');

const NES_BOSQUE = MAPS['nes-bosque'];
NES_BOSQUE.npcs = NES_BOSQUE.npcs || [];
NES_BOSQUE.npcs.push(
  // Adentro de la cueva (se entra por la boca negra de las rocas, junto al camino).
  { id: 'nes_anciano', sprite: 'nes_anciano', x: 30, y: 4, talk: nesAnciano },
  { id: 'nes_fuego1', sprite: 'nes_fuego', x: 29, y: 4, talk: nesFuego },
  { id: 'nes_fuego2', sprite: 'nes_fuego', x: 31, y: 4, talk: nesFuego },
  // En la Pradera de Duck Hunt, entre el pasto alto.
  { id: 'nes_perro', sprite: 'nes_perro', x: 8, y: 11, talk: nesPerro },
);
NES_BOSQUE.bitTips.push('* En Zelda, en la primera cueva hay un anciano entre dos fuegos.\n* Hay que hablarle. Siempre regala algo.');

MAPS['nes-plaza'].npcs.push(
  {
    id: 'nes_littlemac', sprite: 'nes_littlemac', x: 10, y: 12,
    talk: nesGente('littlemac', 'LITTLE MAC', [
      '* Soy LITTLE MAC: 17 años y 107 libras.\n* El más chiquito del circuito... y el más terco.',
      '* Puñín avisa sus golpes. Tú escríbelos y esquiva.\n* Así le gané yo a gigantes en Punch-Out!! (1987).',
    ], [
      '* Doc me entrena así: él en bicicleta y yo corriendo atrás.\n* Muy justo todo.',
      '* El código 007 373 5963 te mandaba directo a la última pelea.\n* Aquí no sirve. Ya lo intenté.',
      '* ¿El árbitro? En mi juego era MARIO.\n* Este dice que no es él. Tiene el mismo bigote.',
    ]),
  },
  {
    id: 'nes_doclouis', sprite: 'nes_doclouis', x: 14, y: 12,
    async talk(ctx) {
      if (!Save.data.done.punin) {
        await ctx.say(['* ¡Oye, chico! Puñín se marea con 3 esquives seguidos.\n* ¡Ahí es cuando le das!'], 'DOC LOUIS');
        await ctx.say(['* ...Y una cosa más:\n* JOIN THE NINTENDO FUN CLUB TODAY! MAC.'], 'DOC LOUIS');
        return;
      }
      await ctx.say([rand([
        '* ¡Buena pelea! Te invito un chocolate. Bueno, me lo como yo.',
        '* JOIN THE NINTENDO FUN CLUB TODAY! MAC.\n* ...Así le decía a Mac entre rounds. Funcionaba. A veces.',
        '* En 1990 el campeón final cambió: ahora era Mr. Dream.\n* El resto del circuito, igualito.',
      ])], 'DOC LOUIS');
    },
  },
);

const NES_C3 = MAPS['nes-castillo3'];
NES_C3.npcs = NES_C3.npcs || [];
NES_C3.npcs.push(
  {
    id: 'nes_samus', sprite: 'nes_samus', x: 2, y: 5,
    talk: nesGente('samus', 'SAMUS', [
      '* (La armadura te mira sin decir nada.)\n* ...Esta lava me recuerda a Norfair, en el planeta Zebes.',
      '* Soy SAMUS ARAN, cazarrecompensas. Vengo de vencer a Mother Brain.\n* Consejo: ese puente no aguanta a nadie. Llega al HACHA.',
    ], [
      '* En el manual de Metroid (1986) decían "él".\n* Si terminabas rápido, al final me quitaba el casco. Sorpresa.',
      '* Con la Morph Ball me hago bolita y paso por cualquier hueco.\n* Aquí todos los huecos ya tienen un monstruo.',
      '* Contraseña: NARPAS SWORD. En Metroid daba vida y misiles infinitos.\n* Aquí solo te da práctica de MAYÚSCULAS.',
      '* Kraid y Ridley eran los jefes de los piratas espaciales.\n* Lord Caparazón, a su lado, es un osito.',
    ]),
  },
  {
    id: 'nes_peach', sprite: 'nes_peach', x: 21, y: 2, when: () => !!Save.data.done.caparazon,
    talk: nesGente('peach', 'PEACH', [
      '* THANK YOU MARIO! YOUR QUEST IS OVER.\n* WE PRESENT YOU A NEW QUEST.',
      '* ...Así terminaba en 1985. La "misión nueva" era el juego otra vez,\n* más difícil: los Goombas se volvían Buzzy Beetles.',
    ], [
      '* Soy PEACH. En el manual de 1985 me llamaban Princesa Toadstool.',
      '* Mario revisó siete castillos equivocados.\n* Tú, una obra, una mazmorra y un solo castillo. ¡Récord!',
      '* Ese hongo de la Obra 25m practica su frase en inglés todos los días.\n* Es la única que se sabe.',
    ]),
  },
  {
    id: 'nes_bowser', sprite: 'nes_bowser', big: true, x: 21, y: 11, when: () => !!Save.data.done.caparazon,
    talk: nesGente('bowser', 'BOWSER', [
      '* ¡BWAHAHA! Soy BOWSER, el Rey Koopa.\n* Le presté mi castillo a Lord Caparazón. Mira cómo me lo dejaste.',
      '* ¿Que se parece a mí? Todos quieren ser yo.\n* En 1985 tuve siete dobles: los "Bowser" de los castillos 1 al 7.',
    ], [
      '* Mis dobles eran enemigos disfrazados: un Goomba, un Koopa, un Buzzy Beetle,\n* un Spiny, un Lakitu, un Blooper y un Hermano Martillo.',
      '* ¿Cómo se descubría el disfraz? Con bolas de fuego.\n* Por eso odio las flores de fuego.',
      '* El manual de 1985 me llamaba "el gran rey de las tortugas Koopa".\n* Suena elegante. Lo pongo en mis tarjetas.',
      '* ¿El hacha del puente? NI LA TOQUES.\n* Es mi única debilidad. Bueno, eso y las bolas de fuego.',
    ]),
  },
);
