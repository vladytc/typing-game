// El pueblo viaja en el tiempo: cada vez que se abre un mundo nuevo, el Pueblo Vitrina
// cambia a la estética de esa era. Los amigos rescatados conservan la estética de SU era
// (Pixelito sigue en 4 verdes aunque el pueblo ya sea de 16 bits).
//
// Los dibujos son los mismos (letras a/b/c/d); lo que cambia por era son las paletas.
// Como en la NES real, cada casilla tiene su propia paleta de 4 colores.

const GB4 = { a: '#9bbc0f', b: '#8bac0f', c: '#306230', d: '#0f380f' };

const HUB_ERAS = {
  gb: {
    label: 'ERA GAME BOY',
    theme: 'theme-gb',
    tiles: {},           // todo con los 4 verdes
    chars: GB4,
    charOverrides: {},
  },
  nes: {
    label: 'ERA 8 BITS',
    theme: 'theme-nes',
    tiles: {
      grass: { a: '#00a800', b: '#b8f818', c: '#000000', d: '#000000' },
      tall: { a: '#00a800', b: '#b8f818', c: '#005800', d: '#000000' },
      flower: { a: '#00a800', b: '#fcfcfc', c: '#000000', d: '#f83800' },
      path: { a: '#fcd8a8', b: '#fca044', c: '#c84c0c', d: '#000000' },
      rock: { a: '#fcfcfc', b: '#7c7c7c', c: '#3c3c3c', d: '#000000' },
      water: { a: '#fcfcfc', b: '#fcfcfc', c: '#5c94fc', d: '#000000' },
      roof: { a: '#fcfcfc', b: '#f8b800', c: '#c84c0c', d: '#000000' },
      wall: { a: '#fcfcfc', b: '#f8b800', c: '#c84c0c', d: '#000000' },
      door: { a: '#fcfcfc', b: '#f8b800', c: '#c84c0c', d: '#000000' },
      tree: { a: '#fcfcfc', b: '#b8f818', c: '#00a800', d: '#000000' },
      pipe: { a: '#fcfcfc', b: '#b8f818', c: '#00a800', d: '#000000' },
      sign: { a: '#fcfcfc', b: '#fca044', c: '#c84c0c', d: '#000000' },
      cave: { a: '#fcfcfc', b: '#7c7c7c', c: '#3c3c3c', d: '#000000' },
    },
    // Regla de la NES: 3 colores + transparente por sprite (el negro es el contorno).
    chars: { a: '#fcfcfc', b: '#fca044', c: '#c84c0c', d: '#000000' },
    charOverrides: {
      bit: { a: '#fcfcfc', b: '#fcfcfc', c: '#5c94fc', d: '#000000' },
      heroe: { a: '#fca044', b: '#fcfcfc', c: '#f83800', d: '#000000' },
      champi: { a: '#fcfcfc', b: '#f83800', c: '#fca044', d: '#000000' },
      toby: { a: '#fcfcfc', b: '#fca044', c: '#c84c0c', d: '#000000' },
      roncaton: { a: '#fcfcfc', b: '#fcd8a8', c: '#00a800', d: '#000000' },
      profesora: { a: '#fcfcfc', b: '#fca044', c: '#7c7c7c', d: '#000000' },
      arcade: { a: '#fcfcfc', b: '#f8b800', c: '#f83800', d: '#000000' },
    },
  },
  snes: {
    label: 'ERA 16 BITS',
    theme: 'theme-hub-snes',
    shadows: true,       // sombras suaves bajo personajes y árboles (look más moderno)
    tiles: {
      grass: { a: '#3fbf3f', b: '#5fd65f', c: '#1e7a2e', d: '#1a1a2e' },
      tall: { a: '#3fbf3f', b: '#5fd65f', c: '#1e7a2e', d: '#1a1a2e' },
      flower: { a: '#3fbf3f', b: '#f79ac0', c: '#1e7a2e', d: '#ffd93d' },
      path: { a: '#f2c14e', b: '#d29a5b', c: '#a0522d', d: '#1a1a2e' },
      rock: { a: '#ffffff', b: '#8c8c9c', c: '#4a4a5e', d: '#1a1a2e' },
      water: { a: '#ffffff', b: '#5fcde4', c: '#2e5c9a', d: '#1a1a2e' },
      roof: { a: '#ffffff', b: '#ff8c1a', c: '#e8393d', d: '#1a1a2e' },
      wall: { a: '#ffffff', b: '#d29a5b', c: '#a0522d', d: '#1a1a2e' },
      door: { a: '#ffd93d', b: '#d29a5b', c: '#8e44ad', d: '#1a1a2e' },
      tree: { a: '#ffffff', b: '#5fd65f', c: '#1e7a2e', d: '#1a1a2e' },
      pipe: { a: '#ffffff', b: '#5fd65f', c: '#1e7a2e', d: '#1a1a2e' },
      sign: { a: '#ffffff', b: '#f2c14e', c: '#a0522d', d: '#1a1a2e' },
      cave: { a: '#ffffff', b: '#8c8c9c', c: '#4a4a5e', d: '#1a1a2e' },
    },
    chars: { a: '#ffffff', b: '#f2c14e', c: '#2e5c9a', d: '#1a1a2e' },
    charOverrides: {
      bit: { a: '#ffffff', b: '#ffffff', c: '#8e44ad', d: '#1a1a2e' },
      heroe: { a: '#f2c14e', b: '#ffffff', c: '#e8393d', d: '#1a1a2e' },
      champi: { a: '#ffffff', b: '#e8393d', c: '#f2c14e', d: '#1a1a2e' },
      toby: { a: '#ffffff', b: '#d29a5b', c: '#a0522d', d: '#1a1a2e' },
      roncaton: { a: '#ffffff', b: '#f2e0c0', c: '#2e5c9a', d: '#1a1a2e' },
      profesora: { a: '#ffffff', b: '#f2c14e', c: '#8c8c9c', d: '#1a1a2e' },
      donchip: { a: '#ffffff', b: '#8c8c9c', c: '#8e44ad', d: '#1a1a2e' },
      arcade: { a: '#ffffff', b: '#ffd93d', c: '#8e44ad', d: '#1a1a2e' },
    },
  },
};

// Era Polígono (N64): desde aquí el pueblo es 3D de verdad (render: '3d', js/scenes/town3d.js).
// Las paletas sirven para el suelo con textura, los cartones de los personajes y el modo clásico
// (si three.js no carga, el pueblo se ve en 2D con estos colores). Los de .theme-n64 (css/worlds/n64.css).
HUB_ERAS.n64 = {
  label: 'ERA POLIGONO',
  theme: 'theme-hub-n64',
  render: '3d',
  shadows: true,
  tiles: {
    grass: { a: '#58b85c', b: '#7fd07f', c: '#2f7d3a', d: '#202030' },
    tall: { a: '#58b85c', b: '#7fd07f', c: '#2f7d3a', d: '#202030' },
    flower: { a: '#58b85c', b: '#f7e463', c: '#2f7d3a', d: '#d64545' },
    path: { a: '#e8dcb5', b: '#c9a66b', c: '#8a6a3a', d: '#202030' },
    rock: { a: '#ffffff', b: '#c9d6e3', c: '#7e57c2', d: '#202030' },
    water: { a: '#ffffff', b: '#9fd3ff', c: '#3c8dd6', d: '#202030' },
    roof: { a: '#ffffff', b: '#f7e463', c: '#d64545', d: '#202030' },
    wall: { a: '#ffffff', b: '#c9d6e3', c: '#3c8dd6', d: '#202030' },
    door: { a: '#f7e463', b: '#c9a66b', c: '#7e57c2', d: '#202030' },
    tree: { a: '#ffffff', b: '#7fd07f', c: '#2f7d3a', d: '#202030' },
    pipe: { a: '#ffffff', b: '#7fd07f', c: '#2f7d3a', d: '#202030' },
    sign: { a: '#ffffff', b: '#f7e463', c: '#7e57c2', d: '#202030' },
    cave: { a: '#ffffff', b: '#c9d6e3', c: '#7e57c2', d: '#202030' },
  },
  chars: { a: '#c9d6e3', b: '#3c8dd6', c: '#7e57c2', d: '#202030' },
  charOverrides: {
    bit: { a: '#ffffff', b: '#ffffff', c: '#7e57c2', d: '#202030' },
    heroe: { a: '#f7e463', b: '#ffffff', c: '#d64545', d: '#202030' },
    donchip: { a: '#f4f4f4', b: '#c9d6e3', c: '#7e57c2', d: '#202030' },
    champi: { a: '#f4f4f4', b: '#d64545', c: '#f7e463', d: '#202030' },
    toby: { a: '#f4f4f4', b: '#f0953c', c: '#8a6a3a', d: '#202030' },
    roncaton: { a: '#f4f4f4', b: '#e8dcb5', c: '#3c8dd6', d: '#202030' },
    profesora: { a: '#f4f4f4', b: '#f7e463', c: '#9a8c7a', d: '#202030' },
    viejo: { a: '#f4f4f4', b: '#c9d6e3', c: '#9a8c7a', d: '#202030' },
    arcade: { a: '#f4f4f4', b: '#f7e463', c: '#d64545', d: '#202030' },
  },
};

// Eras que solo se ven en su barrio del pueblo (todavía no son era de todo el pueblo).
// Mismo formato que HUB_ERAS. (La N64 ya es era del pueblo; GameCube y Wii llegarán aquí.)
const BARRIO_ERAS = {};
// Paleta de una era, sea de todo el pueblo o solo de un barrio.
const eraDef = (era) => HUB_ERAS[era] || BARRIO_ERAS[era];

// Era del pueblo = la del mundo más avanzado que ya está abierto.
// Eras que todavía no tienen estética de pueblo usan la más cercana anterior.
function hubEra() {
  const open = WORLDS.filter(worldUnlocked);
  for (let i = open.length - 1; i >= 0; i--) if (HUB_ERAS[open[i].theme]) return open[i].theme;
  return 'gb';
}
// La era que el jugador ya VIO en el pueblo. Al abrir un mundo nuevo, hubEra() cambia de inmediato,
// pero el pueblo "viaja en el tiempo" hasta que entras (js/scenes/town.js). Mientras, el museo y
// los menús se quedan con la era anterior para no adelantar la sorpresa.
function shownHubEra() {
  if (!Save.data.flags.metBit) return hubEra();
  const seen = Save.data.flags.hubEra;
  return HUB_ERAS[seen] ? seen : 'gb';
}
const hubTheme = () => HUB_ERAS[shownHubEra()].theme;

// Colores de una casilla del mapa del pueblo en la era actual.
function tileColors(era, sprite) {
  const e = eraDef(era) || HUB_ERAS.gb;
  return e.tiles[sprite] || e.tiles.grass || GB4;
}

// Colores de un personaje. Si tiene era propia (un amigo rescatado), se queda en la suya;
// si es del pueblo (Bit, Don Chip...), viaja en el tiempo con el pueblo.
function charColors(sprite, era) {
  const e = eraDef(era) || HUB_ERAS.gb;
  return e.charOverrides[sprite] || e.chars;
}

// ¿De qué mundo es un enemigo/amigo? (para su estética original)
function eraOfEnemy(id) {
  const w = WORLDS.find((x) => (x.nodes || []).includes(id) || (x.enemies && x.enemies[id]));
  return w ? w.theme : 'gb';
}

// Lo que dicen Bit y los amigos cuando el pueblo cambia de era.
const ERA_CHANGE_LINES = {
  nes: [
    '* ¡¿Qué fue eso?! El pueblo... ¡tiene COLORES!',
    '* Creo que viajamos en el tiempo. Ahora todo es de 8 bits.\n* Rojo, azul, naranja... ¡como el Castillo 8-Bit!',
  ],
  snes: [
    '* ¡Otra vez! Todo brilla, hay sombras... ¡y mira esos colores!',
    '* Bienvenido a la ERA DE LOS 16 BITS.\n* Hasta mis píxeles se sienten más suaves.',
  ],
};
ERA_CHANGE_LINES.n64 = [
  '* ¡¿QUE?! ¡El piso se está... LEVANTANDO!',
  '* ¡Los árboles tienen ESQUINAS! ¡Las casas tienen techo de verdad, con dos lados!\n* Bienvenido a la ERA POLIGONO: el pueblo ahora es 3D.',
  '* Y mira atrás de nosotros: la cámara nos sigue sola.\n* Como si alguien nos filmara desde una nube.',
  '* Tranquilo: se camina igual, casilla por casilla. ¡Solo que ahora hay ARRIBA!',
];
// Si hay amigos de una era anterior, alguno lo comenta (conservan su estética original).
const NATIVE_LOOK_LINE = '* PIXELITO: ¡Yo me quedo verde, gracias!\n* Así nací y así me gusta.';
