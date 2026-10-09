// MUNDO 5 en el Pueblo Vitrina (LORE §12.1 y §8.7-8.8). Se carga después de js/town-data.js y
// js/town-eras.js (no los modifica: solo agrega cosas a sus listas).
//   - Paleta de la ERA CUBO para el Barrio Cubo (BARRIO_ERAS.gc). El barrio está en BARRIOS.
//   - La Alcaldesa Bellota (abre el Correo de Bellota desde el pueblo).
//   - La caja del prototipo junto a Don Chip (misión "La caja del sótano") y la revelación de Champi.
//   - El Capitán Brotes, ya de vecino, deja jugar BROTITOS.
//   - Guiños del Barrio Cubo (§8.8): el cubo con manija, el disco de 8 cm, el kart de dos,
//     el aparato para jugar Game Boy en la tele y el botón A gigante en la fuente.

if (typeof BARRIO_ERAS !== 'undefined' && !BARRIO_ERAS.gc) {
  BARRIO_ERAS.gc = {
    label: 'ERA CUBO',
    shadows: true,
    tiles: {
      grass: { a: '#5cc96a', b: '#8ee59a', c: '#2f8a3c', d: '#17162b' },
      tall: { a: '#5cc96a', b: '#8ee59a', c: '#2f8a3c', d: '#17162b' },
      flower: { a: '#5cc96a', b: '#f5d547', c: '#2f8a3c', d: '#e04b4b' },
      path: { a: '#ecebf7', b: '#c8cbd6', c: '#8e86d9', d: '#17162b' },
      rock: { a: '#ffffff', b: '#c8cbd6', c: '#4b3f9e', d: '#17162b' },
      water: { a: '#ffffff', b: '#7ec8ff', c: '#2b9edb', d: '#17162b' },
      roof: { a: '#ffffff', b: '#8e86d9', c: '#4b3f9e', d: '#17162b' },
      wall: { a: '#ffffff', b: '#ecebf7', c: '#8e86d9', d: '#17162b' },
      door: { a: '#f5d547', b: '#f28c28', c: '#4b3f9e', d: '#17162b' },
      tree: { a: '#ffffff', b: '#8ee59a', c: '#2f8a3c', d: '#17162b' },
      pipe: { a: '#ffffff', b: '#8e86d9', c: '#4b3f9e', d: '#17162b' },
      sign: { a: '#ffffff', b: '#f5d547', c: '#4b3f9e', d: '#17162b' },
      cave: { a: '#ffffff', b: '#c8cbd6', c: '#4b3f9e', d: '#17162b' },
    },
    chars: { a: '#ecebf7', b: '#8e86d9', c: '#4b3f9e', d: '#17162b' },
    charOverrides: {
      bit: { a: '#ffffff', b: '#ffffff', c: '#4b3f9e', d: '#17162b' },
      heroe: { a: '#f2c6a0', b: '#ffffff', c: '#e04b4b', d: '#17162b' },
    },
  };
}

// Mientras no exista el Barrio Cubo, la alcaldesa espera junto a la Plaza de las Tuberías.
if (typeof PLACE_CAMP !== 'undefined' && !PLACE_CAMP.bellota) PLACE_CAMP.bellota = [17, 10];

const gcBarrioBuilt = () => {
  const k = BARRIOS.findIndex((b) => b.id === 'gc');
  return k >= 0 && townStage() >= k + 1;
};

TOWN.npcs.push(
  // La Alcaldesa Bellota llega al pueblo después de conocerla en el Pueblo de Bellota.
  {
    id: 'bellota', sprite: 'bellota', era: 'gc', x: 17, y: 10, when: () => !!Save.data.flags.gcBellota,
    async talk(ctx) {
      const c = GCS().cartas;
      const n = Object.keys(c).length;
      await ctx.say([n >= 10
        ? '* ¡Mi cartero estrella! Todos los vecinos hablan de tus cartas.'
        : `* ¡Hola, hola! Llevas ${n} de 10 cartas.\n* Los vecinos esperan junto al buzón.`], 'ALCALDESA BELLOTA');
      const i = await ctx.choose(['escribir cartas', 'un dato', 'adiós'], 'ALCALDESA BELLOTA');
      if (i === 0) { Game.go('correo', { back: 'town' }); return; }
      if (i === 1) {
        await ctx.say([rand([
          '* ¿Sabías? En la GameCube, el botón A era el más grande y era verde.\n* ¡Para que nunca te equivocaras!',
          '* Las partidas de la GameCube se guardaban en una Memory Card que se metía al frente.\n* Como guardar cartas en un buzón.',
          '* Muchos juegos de GameCube se jugaban con 4 amigos.\n* ¡4 puertos para controles! Más vecinos, más diversión.',
        ])], 'ALCALDESA BELLOTA');
        return;
      }
      await ctx.say(['* ¡Que tengas un día de cinco estrellas!'], 'ALCALDESA BELLOTA');
    },
  },

  // La caja del prototipo, sobre el mostrador junto a Don Chip (después de la Estación Visor).
  {
    id: 'gc-caja', sprite: 'caja_prototipo', x: 8, y: 5, when: () => !!Save.data.done.casco,
    async talk(ctx) {
      if (Save.data.treasures.caja_prototipo) {
        await ctx.say(['* La caja del prototipo. Sin dibujo. Sin nombre.\n* Pesa mucho para lo que es.', '* DON CHIP: Cuando todo esto termine... quizá por fin la abramos juntos.'], 'DON CHIP');
        return;
      }
      Quests.start('caja_sotano');
      await ctx.say([
        '* DON CHIP: ¡Ah, eres tú! Mira lo que encontré en el sótano.',
        '* DON CHIP: Lo compré en una venta de garaje. Nunca prendió.\n* Nunca lo tiré... no sé por qué.',
        '* BIT: ...Esa caja. Yo conozco esa caja.',
        '* DON CHIP: La letra está muy borrada. ¿Me ayudas a leerla?\n* Escríbela tal cual, con mayúsculas y puntos.',
      ], 'DON CHIP');
      if (await ctx.choose(['leer la caja', 'ahora no'], 'DON CHIP') === 1) { await ctx.say(['* DON CHIP: Aquí la dejo. No se va a ir a ningún lado.'], 'DON CHIP'); return; }
      const texts = ['PROTOTIPO. NO SE VENDE.', 'Año: 1989. Sin título.', 'Protagonista: sin nombre.', 'Cursor: se escapó.'];
      const res = await ctx.challenge({ label: 'Lee lo que dice la caja:', texts, timeLimit: texts.join('').length * 650 + 6000, caps: true, strict: true });
      if (!res.completed) { await ctx.say(['* La letra es difícil de leer... ¡Inténtalo otra vez!'], 'DON CHIP'); return; }
      await ctx.say([
        '* DON CHIP: "Cursor: se escapó"... ¿Un cursor? ¿Cómo se escapa un cursor?',
        '* BIT: ...Por el cable del teclado. Así.\n* Yo era el cursor de ese juego, Don Chip.',
        '* DON CHIP: ...',
        '* DON CHIP: Entonces el apagón, las consolas, la sombra morada...\n* Todo salió de esta caja. Del juego que nadie terminó.',
      ], 'DON CHIP');
      await ctx.give('caja_prototipo');
      Quests.complete('caja_sotano');
      // Champi era el dibujo del cuaderno de Don Chip niño (§2.8 y §8.2).
      await ctx.say([
        '* (Champi se asoma desde el otro lado de la plaza.)',
        '* CHAMPI: ...¿Chip? ¿Eres tú? Dijiste "vuelvo en 5 minutos".\n* Eso fue en 1989.',
        '* DON CHIP: ¿Champi? ¿CHAMPI?\n* ¡Yo te dibujé en mi cuaderno de tercero!',
        '* DON CHIP: ...Era yo. El niño que salió a jugar en 1989 era yo.\n* Y nunca volví a esa casa. Perdóname, Champi.',
        '* CHAMPI: No pasa nada. Ya volviste. Eso es lo que cuenta.',
      ], 'DON CHIP');
      ctx.setFlag('gcChampi');
    },
  },
);

// El Capitán Brotes, ya de vecino, deja jugar BROTITOS (y recuerda la misión del día 30).
TOWN.npcs.push(townFriend('capbrotes', {
  extra: [
    // Game.go cambia de escena; la plática se queda esperando para siempre (no vuelve a pintar el pueblo).
    { opt: 'jugar brotitos', run: () => { Game.go('brotes', { enemyId: 'capbrotes', back: 'town', arcade: true }); return new Promise(() => {}); } },
  ],
  bye: '* ¡Diez brotitos rojos, a dormir! ...Digo, adiós.',
}));

// Guiños del Barrio Cubo (§8.8). Solo aparecen cuando el barrio ya existe.
[
  { id: 'gc-cubo', sprite: 'cubito', x: 47, y: 6, say: ['* Un cubo con manija descansa en la plaza.', '* CUBO: Tengo manija. Soy portátil. Técnicamente.'] },
  { id: 'gc-disco', sprite: 'disquin', x: 56, y: 6, say: ['* Un disco chiquito brilla en el pasto.', '* DISCO: Soy chiquito y guardo mil cuatrocientos megas. Más o menos.\n* (En realidad, cerca de 1.5 GB. ¡Redondeando!)'] },
  { id: 'gc-kart', sprite: 'gc_kart', x: 57, y: 12, say: ['* Dos amigos en un solo kart.', '* "Dos en un kart. Uno maneja, otro avienta. 2003."'] },
  { id: 'gc-gbplayer', sprite: 'gc_gbplayer', x: 57, y: 8, say: ['* Un aparato con una ranura para cartuchos de Game Boy.', '* "Con este aparato jugabas Game Boy en la tele. 2003."\n* (Se conectaba debajo de la GameCube.)'] },
  { id: 'gc-botona', sprite: 'gc_botona', x: 51, y: 5, say: ['* Un botón verde ENORME en la orilla de la fuente.', '* BOTON A: Soy el botón A. Soy grande para que no te equivoques.'] },
].forEach((o) => TOWN.npcs.push({
  id: o.id, sprite: o.sprite, era: 'gc', x: o.x, y: o.y, when: gcBarrioBuilt,
  async talk(ctx) { await ctx.say(o.say); },
}));
