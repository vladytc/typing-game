// MUNDO 6 — Ciudad Sensor (Wii, 2006). Diseño en docs/LORE.md §9.
// Blanco y azul cielo, como el menú de la consola. Aquí se practica RITMO CONSTANTE y VELOCIDAD:
// letras al compás, una mano a la vez, mayúsculas exactas, números y símbolos (° % /), texto de cabeza.
// Los acentos y la Ñ siguen contando (strictAccents), como desde el Reino 16-Bit.
//
// Escenas propias (js/scenes/):
//   wii-kit.js      paleta, 3D limpio (WiiPoly, sobre poly3d.js), pausa
//   wii-battle.js   enemigos normales en 3D, cada uno con su forma de escribir (wiiTask / wiiDodge)
//   wii-gym.js      ENTRENADOR MI: boliche, tenis y box (y los minijuegos sueltos del pueblo)
//   wii-torneo.js   DANI TURBO, Torneo Sensor (Tecloides 3 contra 3, la final del rival)
//   wii-cometa.js   CAPITAN COMETA (jefe): gravedad desde 4 lados, texto de cabeza, 7 estrellitas
// Lo del pueblo (Barrio Sensor, gimnasio, observatorio, amigos): js/worlds/wii-pueblo.js.
//
// Para probar sin jugar todo (consola del navegador):
//   Save.data.consoles.gamecube = true; Game.go('map', { world: 'wii' })

// ---------- Palabras del mundo (lore §16) ----------
WORDS.wii = ['24°', '75%', '10 km/h', '¡Ponte la correa!', 'izq', 'der', 'agacha', 'chuza', 'saque', 'raqueta', 'estrella',
  'gravedad', 'planeta', 'observatorio', 'canal', 'sensor', 'remoto', 'gimnasio', 'boliche', 'tenis', 'cometa'];

// ---------- Tecloides nuevos ----------
addTecloide('zumbito', {
  name: 'Zumbito', type: 'chispa', sprite: 'zumbito', hp: 46,
  desc: 'Una abeja de LED que zumba al ritmo. Bzz. Bzz. Bzz. Siempre a tiempo.',
  moves: [move('Zumbido', 'bzz', 20, 'chispa'), TECLEO, move('Aguijón', 'aguijón', 36, 'chispa'), move('Enjambre', 'enjambre', 44, 'chispa', 'aturdir')],
});
// Las formas finales de los iniciales (el equipo definitivo de Dani). Usan el dibujo de su forma base.
addTecloide('voltrueno', {
  name: 'Voltrueno', type: 'chispa', sprite: 'voltin', hp: 58,
  desc: 'La forma final de Voltín. Truena con solo verte.',
  moves: [move('Relámpago', 'relámpago', 44, 'chispa'), TECLEO, move('Eléctrico', 'eléctrico', 48, 'chispa'), move('Electricidad', 'electricidad', 56, 'chispa', 'aturdir')],
});
addTecloide('gotamar', {
  name: 'Gotamar', type: 'gota', sprite: 'gotin', hp: 62,
  desc: 'La forma final de Gotín. Ya no es una gota: es un mar con gorra.',
  moves: [move('Marejada', 'marejada', 44, 'gota'), TECLEO, move('Remolino', 'remolino', 46, 'gota'), move('Océano Azul', 'océano azul', 54, 'gota')],
});
addTecloide('brotarbol', {
  name: 'Brotárbol', type: 'brote', sprite: 'brotin', hp: 66,
  desc: 'La forma final de Brotín. Un árbol entero que salió de una tubería.',
  moves: [move('Hojarasca', 'hojarasca', 44, 'brote'), TECLEO, move('Enredadera', 'enredadera', 46, 'brote'), move('Árbol Gigante', 'árbol gigante', 56, 'brote', 'curar')],
});
const WII_FINAL_OF = { voltin: 'voltrueno', gotin: 'gotamar', brotin: 'brotarbol' };

TRAINERS.daniwii = {
  name: 'Dani Turbo',
  sprite: 'dani',
  music: 'wii_torneo',
  musicCasi: 'wii_torneo_casi',
  reward: 'medalla_sensor',
  // Su equipo definitivo: las tres formas finales, sin el "???". (El lore dice nivel 28; aquí el
  // nivel va de acuerdo con el tuyo para que la final sea difícil pero justa.)
  team: (starter) => {
    const s = STARTERS.includes(starter) ? starter : 'voltin';
    const top = Math.max(5, ...(Save.data.team || []).map((t) => t.lv));
    const other = STARTERS.find((x) => x !== s && x !== COUNTER[s]);
    return [
      { id: WII_FINAL_OF[COUNTER[s]], lv: top + 1 }, // el que te gana por tipo, un nivel menos (con +2 la final se perdía 1 de cada 5)
      { id: WII_FINAL_OF[other], lv: top + 1 },
      { id: WII_FINAL_OF[s], lv: top + 2 },
    ];
  },
  intro: [
    '* LOCUTOR: ¡BIENVENIDOS A LA GRAN FINAL DEL TORNEO SENSOR!',
    '* DANI: Llegaste. Sabía que ibas a llegar.\n* ...Mira. Ya no traigo al "???".',
    '* DANI: Lo dejé ir. No era mío. Era de él.\n* Y tampoco era de él, la verdad.',
    '* DANI: Este es mi equipo de verdad. Sin trucos.\n* Mis ataques son LARGOS y con acento. Y para esquivar tendrás 20 % menos de tiempo.',
    '* ¡DANI TURBO quiere pelear, 3 contra 3! (La final.)',
  ],
  lose: [
    '* DANI: ...Ok. Eres el más rápido del museo.\n* Lo digo yo, que soy el segundo.',
    '* DANI: Y oye... cuando vayas con el tipo morado, no vayas solo.',
  ],
  win: ['* DANI: ¡Ja! La final es mía. ¿Revancha? Claro que sí. Soy generoso.'],
  retry: ['* PROFESORA LETRA (desde las gradas): ¡Ya curé a tu equipo!', '* DANI: Otra vez. Y esta vez escribe con TODOS los dedos.'],
};

// ---------- Música ORIGINAL (lore §14.2). Todas las voces de cada pista suman los mismos pasos. ----------

// Gimnasio Sensor: Fa mayor, simple y alegre. El tempo es la mecánica (se crea al tempo de cada prueba).
// Sin percusión fuerte: el TIC del metrónomo lo pone la escena, para que siempre coincida.
function wiiGymTrack(bpm) {
  return {
    bpm,
    voices: [
      { wave: 'sine', vol: 0.04, legato: 0.5, notes: 'F5/4 A5/4 C6/4 A5/4 G5/4 A#5/4 A5/8 F5/4 A5/4 C6/4 D6/4 C6/4 A5/4 F5/8' },
      { wave: 'triangle', vol: 0.08, notes: rep('F3/4 C3/4', 2) + ' ' + rep('C3/4 G2/4', 2) + ' ' + rep('F3/4 C3/4', 2) + ' ' + rep('A#2/4 C3/4', 2) },
      { wave: 'sine', vol: 0.018, legato: 0.3, notes: rep('-/2 A4/2', 4) + ' ' + rep('-/2 G4/2', 4) + ' ' + rep('-/2 A4/2', 4) + ' ' + rep('-/2 A#4/2', 4) },
    ],
  };
}

// Invierte una pista (cuando el Capitán Cometa gira la gravedad, la música suena al revés).
function wiiReverse(track) {
  return {
    ...track,
    voices: track.voices.map((v) => ({ ...v, intro: undefined, notes: v.notes.trim().split(/\s+/).reverse().join(' ') })),
  };
}

const WII_TRACKS = {
  // Ciudad Sensor (mapa): Do mayor, limpia y moderna. Marimba, silbido y un bajo redondo.
  wii_map: {
    bpm: 110,
    voices: [
      { wave: 'sine', vol: 0.035, legato: 0.9, notes: 'E5/4 G5/2 C6/2 B5/4 G5/4 A5/2 G5/2 E5/2 D5/2 C5/8 -/4 D5/2 E5/2 F5/4 E5/2 D5/2 G5/8 -/8' },
      { wave: 'sine', vol: 0.028, legato: 0.3, notes: rep('C5/2 E5/2 G5/2 E5/2', 2) + ' ' + rep('A4/2 C5/2 E5/2 C5/2', 2) + ' ' + rep('F4/2 A4/2 C5/2 A4/2', 2) + ' ' + rep('G4/2 B4/2 D5/2 B4/2', 2) },
      { wave: 'triangle', vol: 0.08, notes: 'C3/4 -/4 G2/4 -/4 A2/4 -/4 E2/4 -/4 F2/4 -/4 C3/4 -/4 G2/4 -/4 B2/4 -/4' },
      { wave: 'noise', vol: 0.012, notes: rep('x -/3 -/2 x/2 -/4 x -/3', 4) },
    ],
  },
  // Batalla normal Wii: Sol menor, "electrónica": ruido en 16 pasos y arpegio sincopado.
  wii_battle: {
    bpm: 160,
    voices: [
      {
        wave: 'square', vol: 0.028,
        notes: 'G5/2 A#5/2 D6/3 C6/1 A#5/2 A5/2 G5/4 F5/2 G5/2 A5/2 A#5/2 C6/3 A#5/1 A5/4 ' +
          'D#5/2 G5/2 A#5/2 D#6/3 D6/1 C6/2 A#5/4 F5/2 A5/2 C6/2 D6/2 C6/2 A5/2 F#5/4',
      },
      { wave: 'square', vol: 0.012, notes: rep('G4 - D5 A#4 - G4 D5 -', 2) + ' ' + rep('F4 - C5 A4 - F4 C5 -', 2) + ' ' + rep('D#4 - A#4 G4 - D#4 A#4 -', 2) + ' ' + rep('D4 - A4 F#4 - D4 A4 -', 2) },
      { wave: 'triangle', vol: 0.1, notes: rep('G2/2 G3/2', 4) + ' ' + rep('F2/2 F3/2', 4) + ' ' + rep('D#2/2 D#3/2', 4) + ' ' + rep('D2/2 D3/2', 4) },
      { wave: 'noise', vol: 0.024, notes: rep('x - - x - - x - x - - x - - x x', 4) },
    ],
  },
  // Torneo Sensor: el Reto de Tecloides versión final, con todas las capas y modulación a mitad.
  wii_torneo: {
    bpm: 170,
    voices: [
      {
        wave: 'square', vol: 0.03,
        intro: '-/4 E5 F5 F#5 G5 G#5 A5 A#5 B5 C6/4',
        notes: 'A5/2 E5/2 A5/2 C6/2 B5/2 G5/2 E5/4 F5/2 A5/2 C6/2 E6/2 D6/3 C6/1 B5/4 ' +
          'B5/2 F#5/2 B5/2 D6/2 C#6/2 A5/2 F#5/4 G5/2 B5/2 D6/2 F#6/2 E6/3 D6/1 C#6/4',
      },
      { wave: 'triangle', vol: 0.11, intro: '-/8 E2/8', notes: rep('A2 A3 G3 A3', 4) + ' ' + rep('F2 F3 E3 F3', 4) + ' ' + rep('B2 B3 A3 B3', 4) + ' ' + rep('G2 G3 F#3 G3', 4) },
      { wave: 'sine', vol: 0.02, legato: 1, intro: '-/16', notes: 'A3/16 F3/16 B3/16 G3/16' },
      { wave: 'sine', vol: 0.016, legato: 0.3, intro: '-/16', notes: rep('E6 -/3', 8) + ' ' + rep('F#6 -/3', 8) },
      { wave: 'noise', vol: 0.03, intro: 'x x x x -/12', notes: rep('x/2 x/2 x/4 x/2 -/2 x/4', 4) },
    ],
  },
  // Capitán Cometa: Mi bemol mayor, vals lento (3/4) y espacial. 8 compases de 12 pasos.
  wii_cometa: {
    bpm: 100,
    voices: [
      { wave: 'sine', vol: 0.04, legato: 0.95, notes: 'D#5/6 G5/3 A#5/3 D#6/9 D6/3 C6/6 A#5/3 G#5/3 G5/12 F5/6 G5/3 G#5/3 A#5/9 G5/3 F5/6 D5/3 F5/3 D#5/12' },
      {
        wave: 'triangle', vol: 0.07,
        notes: 'D#2/4 G3/4 A#3/4 D#2/4 G3/4 A#3/4 G#2/4 C4/4 D#4/4 D#2/4 G3/4 A#3/4 ' +
          'A#1/4 D3/4 F3/4 D#2/4 G3/4 A#3/4 A#1/4 D3/4 F3/4 D#2/4 G3/4 A#3/4',
      },
      { wave: 'sine', vol: 0.018, legato: 1, notes: 'G3/24 G#3/12 G3/12 F3/12 G3/12 D3/12 G3/12' },
      { wave: 'sine', vol: 0.014, legato: 0.3, notes: rep('A#6/1 -/11 G6/1 -/11', 4) },
    ],
  },
  // Fase final (7 estrellitas): 4/4 a 128, arpegios de 7 notas (una por estrellita).
  wii_cometa2: {
    bpm: 128,
    voices: [
      { wave: 'square', vol: 0.028, notes: 'G5/4 A#5/4 D#6/6 D6/2 C6/4 A#5/4 G5/8 G#5/4 C6/4 D#6/6 D6/2 D6/4 C6/2 A#5/2 A#5/8' },
      { wave: 'sine', vol: 0.02, legato: 0.4, notes: 'D#5 G5 A#5 D6 D#6 G6 A#6 -/9 C5 D#5 G5 A#5 C6 D#6 G6 -/9 G#4 C5 D#5 G5 G#5 C6 D#6 -/9 A#4 D5 F5 A5 A#5 D6 F6 -/9' },
      { wave: 'triangle', vol: 0.1, notes: rep('D#2/2 D#3/2', 4) + ' ' + rep('C2/2 C3/2', 4) + ' ' + rep('G#1/2 G#2/2', 4) + ' ' + rep('A#1/2 A#2/2', 4) },
      { wave: 'noise', vol: 0.022, notes: rep('x/2 -/2 x x -/2 x/2 -/2 x x x/2', 4) },
    ],
  },
  // Guiño a la musiquita del canal de los muñequitos: bossa tranquila y ORIGINAL (no es la real).
  wii_canal: {
    bpm: 114,
    voices: [
      { wave: 'sine', vol: 0.04, legato: 0.8, notes: 'E5/3 G5/1 -/2 A5/2 G5/3 E5/1 -/4 D5/3 E5/1 -/2 F5/2 E5/6 -/2 C5/3 E5/1 -/2 G5/2 A5/3 B5/1 -/4 C6/3 B5/1 -/2 A5/2 G5/8' },
      {
        wave: 'sine', vol: 0.018, legato: 0.5,
        notes: '-/2 E4/2 -/1 B4/2 -/1 G4/2 -/2 B4/2 -/2 -/2 A4/2 -/1 E5/2 -/1 C5/2 -/2 E5/2 -/2 ' +
          '-/2 F4/2 -/1 C5/2 -/1 A4/2 -/2 C5/2 -/2 -/2 F4/2 -/1 B4/2 -/1 D5/2 -/2 B4/2 -/2',
      },
      { wave: 'triangle', vol: 0.07, notes: 'C3/6 G2/2 -/4 C3/2 -/2 F2/6 C3/2 -/4 F2/2 -/2 D3/6 A2/2 -/4 D3/2 -/2 G2/6 D3/2 -/4 G2/2 -/2' },
      { wave: 'noise', vol: 0.01, notes: rep('x/3 x/3 x/2 -/2 x/2 x/2 x/2', 4) },
    ],
  },
};
WII_TRACKS.wii_torneo_casi = { ...WII_TRACKS.wii_torneo, bpm: 184 };
WII_TRACKS.wii_cometa_rev = wiiReverse(WII_TRACKS.wii_cometa);
WII_TRACKS.wii_gym_90 = wiiGymTrack(90);
WII_TRACKS.wii_gym_100 = wiiGymTrack(100);
WII_TRACKS.wii_gym_120 = wiiGymTrack(120);

// ---------- Sprites (16 x 16, redonditos y a todo color; ojos de puntito, sin nariz) ----------
const WII_SPRITES = {
  sensorin: wiiArt([
    '................',
    '................',
    '................',
    '....P......P....',
    '...PP......PP...',
    '.KKKKKKKKKKKKKK.',
    'KWWWWWWWWWWWWWWK',
    'KLKKKKKKKKKKKKLK',
    'KLKPPKKKKKKPPKLK',
    'KLKPWKKKKKKPWKLK',
    'KLKKKKKSSKKKKKLK',
    'KWWWWWWWWWWWWWWK',
    '.KKKKKKKKKKKKKK.',
    '......KGGK......',
    '.....KGGGGK.....',
    '.....KKKKKK.....',
  ]),
  correita: wiiArt([
    '................',
    '.....KKKKKK.....',
    '....KBBBBBBK....',
    '...KBK....KBK...',
    '...KBK....KBK...',
    '...KBK....KBK...',
    '....KBK..KBK....',
    '.....KBKKBK.....',
    '....KKGGGGKK....',
    '...KLLLLLLLLK...',
    '...KLKLLLLKLK...',
    '...KLLLLLLLLK...',
    '...KLLLKKLLLK...',
    '...KLLLKKLLLK...',
    '....KKKKKKKK....',
    '................',
  ]),
  nunchuquin: wiiArt([
    '.......KKK......',
    '......KGGGK.....',
    '......KGWGK.....',
    '.......KKK......',
    '.....KKKKKK.....',
    '....KWWWWWWK....',
    '...KWKWWWWKWK...',
    '...KWWWWWWWWK...',
    '...KWWKWWKWWK...',
    '...KWWWKKWWWK...',
    '....KWWWWWWK....',
    '....KWWWWWWK....',
    '.....KWWWWK.....',
    '......KKKK......',
    '.......GG.......',
    '........GGGGG...',
  ]),
  munequito: wiiArt([
    '................',
    '.....KKKKKK.....',
    '....KNNNNNNK....',
    '...KNNNNNNNNK...',
    '...KFFFFFFFFK...',
    '...KFKFFFFKFK...',
    '...KFFFFFFFFK...',
    '...KFFKFFKFFK...',
    '....KFFKKFFK....',
    '.....KKKKKK.....',
    '....KSSSSSSK....',
    '..KFKSSSSSSKFK..',
    '...KKSSSSSSKK...',
    '....KGGKKGGK....',
    '....KGGKKGGK....',
    '....KKK..KKK....',
  ]),
  canalclima: wiiArt([
    '................',
    '..........YY....',
    '.........YYYY...',
    '.....KKK.YYYY...',
    '....KWWWKKYY....',
    '..KKKWWWWWKK....',
    '.KWWWWWWWWWWK...',
    'KWWKWWWWWKWWWK..',
    'KWWWWWWWWWWWWK..',
    'KWWWWKKKWWWWWK..',
    '.KWWWWWWWWWWK...',
    '..KKKKKKKKKK....',
    '....S...S...S...',
    '...S...S...S....',
    '................',
    '................',
  ]),
  zumbito: wiiArt([
    '................',
    '....SS....SS....',
    '...SWWS..SWWS...',
    '...SWWS..SWWS...',
    '....SSK..KSS....',
    '.....KKKKKK.....',
    '....KYYYYYYK....',
    '...KYKYYYYKYK...',
    '...KYYYYYYYYK...',
    '...KKKKKKKKKK...',
    '...KYYYKKYYYK...',
    '...KKKKKKKKKK...',
    '....KYYYYYYK....',
    '.....KKKKKK.....',
    '.......KK.......',
    '........K.......',
  ]),
  entrenadormi: wiiArt([
    '................',
    '.....KKKKKK.....',
    '....KOOOOOOK....',
    '...KRRRRRRRRK...',
    '...KFFFFFFFFK...',
    '...KFKFFFFKFK...',
    '...KFFFFFFFFK...',
    '...KFFKKKKFFK...',
    '....KFFFFFFK....',
    '...KKKKKKKKKK...',
    '..KWWWWBBWWWWK..',
    '..KWWWWBBWWWWK..',
    '..KFKWWBBWWKFK..',
    '...KWWWWWWWWK...',
    '....KGGKKGGK....',
    '....KKK..KKK....',
  ]),
  cometa: wiiArt([
    '.......YY.......',
    '......KYYK......',
    '....KKKKKKKK....',
    '...KNNNNNNNNK...',
    '..KKKKKKKKKKKK..',
    '...KFFFFFFFFK...',
    '...KFKFFFFKFK...',
    '...KFFFFFFFFK...',
    '...KFFFKKFFFK...',
    '....KFFFFFFK....',
    '..KBKKKKKKKKBK..',
    '.KBBKWWYWWKBBK..',
    '.KBBKWWWWWKBBK..',
    'KBBBKWWWWWKBBBK.',
    'KBBBKNNKNNKBBBK.',
    'KKKKKKKKKKKKKKK.',
  ]),
  pelota_boliche: wiiArt([
    '................',
    '................',
    '.....KKKKKK.....',
    '....KBBBBBBK....',
    '...KBBSBBBBBK...',
    '..KBBSBBBBBBBK..',
    '..KBBBBBKKBBBK..',
    '..KBBBBBKKBKBK..',
    '..KBBBBBBBBKBK..',
    '..KBBBBBBBBBBK..',
    '..KNBBBBBBBBNK..',
    '...KNBBBBBBNK...',
    '....KNNNNNNK....',
    '.....KKKKKK.....',
    '................',
    '................',
  ]),
  estrellita_capitan: wiiArt([
    '.......KK.......',
    '......KYYK......',
    '......KYYK......',
    '.....KYYYYK.....',
    'KKKKKKYYYYKKKKKK',
    'KYYYYYYYYYYYYYYK',
    '.KYYYKYYYYKYYYK.',
    '..KYYKYYYYKYYK..',
    '...KYYYYYYYYK...',
    '...KYYYKKYYYK...',
    '..KYYYYYYYYYYK..',
    '..KYYYYKKYYYYK..',
    '.KYYYKK..KKYYYK.',
    '.KYKK......KKYK.',
    '.KK..........KK.',
    '................',
  ]),
  correa: wiiArt([
    '................',
    '....KKKKKKK.....',
    '...KBBBBBBBK....',
    '..KBK.....KBK...',
    '..KBK.....KBK...',
    '..KBK.....KBK...',
    '...KBK...KBK....',
    '....KBK.KBK.....',
    '.....KBKBK......',
    '.....KGGGK......',
    '....KGLLLGK.....',
    '....KGLLLGK.....',
    '.....KGGGK......',
    '......KBK.......',
    '......KBK.......',
    '.......K........',
  ]),
  sensor: wiiArt([
    '................',
    '................',
    '................',
    '................',
    '................',
    '..P..........P..',
    '.KKKKKKKKKKKKKK.',
    'KWWWWWWWWWWWWWWK',
    'KLKKKKKKKKKKKKLK',
    'KLKPPKKKKKKPPKLK',
    'KLKKKKKKKKKKKKLK',
    'KWWWWWWWWWWWWWWK',
    '.KKKKKKKKKKKKKK.',
    '................',
    '................',
    '................',
  ]),
  medalla_sensor: wiiArt([
    '....KK....KK....',
    '....KBK..KBK....',
    '.....KBKKBK.....',
    '......KBBK......',
    '.....KKKKKK.....',
    '....KYYYYYYK....',
    '...KYYOOOOYYK...',
    '..KYYOYYYYOYYK..',
    '..KYOYYWWYYOYK..',
    '..KYOYWYYWYOYK..',
    '..KYOYYWWYYOYK..',
    '..KYYOYYYYOYYK..',
    '...KYYOOOOYYK...',
    '....KYYYYYYK....',
    '.....KKKKKK.....',
    '................',
  ]),
  cara_mii: wiiArt([
    '................',
    '.....KKKKKK.....',
    '....KBBBBBBK....',
    '...KBBBBBBBBK...',
    '..KBBBBBBBBBBK..',
    '..KFFFFFFFFFFK..',
    '..KFFKFFFFKFFK..',
    '..KFFKFFFFKFFK..',
    '..KFFFFFFFFFFK..',
    '..KFFFFFFFFFFK..',
    '..KFFKFFFFKFFK..',
    '..KFFFKKKKFFFK..',
    '...KFFFFFFFFK...',
    '....KKFFFFKK....',
    '......KKKK......',
    '................',
  ]),
};
WII_SPRITES.pelota_dorada = wiiRecolor(WII_SPRITES.pelota_boliche, { B: 'Y', S: 'W', N: 'O' });

// ---------- Mecánicas de cada enemigo (lore §9.3) ----------

const WII_BASE = { wii: true, theme: 'wii', music: 'wii_battle', strictAccents: true, fightTime: 0.95 };

// Sin acentos (teclado sin acentos): se quitan ¡ ¿ y el ° se dice "grados".
const wiiList = (list) => list.map(wiiSigns);

// Zumbito: cada palabra pega más si las letras van parejitas, al ritmo del metrónomo.
function wiiBeatDamage(unit, dmg, battle) {
  const task = battle.task;
  const stamps = task && task.stamps ? task.stamps.slice(-unit.text.length) : null;
  const steady = wiiSteadiness(stamps, WII_BEAT_MS * diff().time);
  if (steady >= 0.8) battle.floatText('¡AL RITMO!', 'mercy');
  return Math.max(1, Math.round(dmg * (0.6 + steady * 0.9)));
}

function wiiIntroPages() {
  return [
    '* (La tubería te deja en una ciudad blanquísima.\n* Todo brilla como recién lavado.)',
    '* BIT: ¡Whoa! ¡La CIUDAD SENSOR! Mira la pantalla gigante: tiene CANALES...\n* ...pero casi todos están APAGADOS.',
    '* En cada edificio parpadea una lucecita roja: la luz de standby.\n* BIT: Es él. El tipo morado quiere apagar TODO. Un apagón definitivo.',
    '* BIT: Si ganamos en cada zona, los canales se prenden otra vez.\n* ¡Vamos a encender la ciudad!',
    '* BIT: Aquí todo va al RITMO. Y los acentos siguen contando.\n* Tip: el ° se escribe con Shift + la tecla de la izquierda del 1 (en Mac: Option + Shift + 8).',
  ];
}

// ---------- El mundo ----------
addWorld({
  id: 'wii',
  order: 6,
  name: 'Ciudad Sensor',
  theme: 'wii',               // css/worlds/wii.css
  music: 'wii_map',
  requires: 'gamecube',       // la tubería brota al rescatar la GameCube (jefe del Mundo 5)
  console: 'wii',
  // Plaza Canal (de menos a más difícil) → Gimnasio Sensor → Torneo Sensor → Observatorio.
  nodes: ['zumbito', 'munequito', 'canalclima', 'correita', 'nunchuquin', 'sensorin', 'entrenadormi', 'daniwii', 'cometa'],
  enemies: {
    zumbito: {
      ...WII_BASE,
      name: 'Zumbito Salvaje', sprite: 'zumbito', model: 'zumbito', wiiTask: 'beat', wiiDodge: 'beat', fightTime: 1.15,
      hp: 90, atk: 5, def: 3, xp: 42,
      fightWords: 3,
      words: ['zumbido', 'abeja', 'panal', 'miel', 'ritmo', 'compás', 'flor', 'néctar', 'bzz bzz', 'aleteo', 'polen', 'colmena', 'antena', 'tic tac'],
      blurb: 'Una abeja de LED que zumba al ritmo. Si la perdonas... quizá quiera ser tu Tecloide.',
      keysHint: 'Ritmo constante: una letra en cada tic',
      intro: '* ¡Bzz! ¡Bzz! ¡Un Zumbito Salvaje!\n* Zumba exactamente cada 600 milisegundos. Ni uno más.',
      check: '* ZUMBITO SALVAJE - ATQ 5 DEF 3\n* Un Tecloide CHISPA salvaje. Si escribes al ritmo de su zumbido, pegas más fuerte.',
      idle: ['* Zumbito zumba: bzz... bzz... bzz... Perfectamente a tiempo.', '* BIT: Aquí todos se mueven agitando los brazos.\n* Yo no tengo brazos. Qué envidia.', '* Huele a miel recién encendida.'],
      calm: '* Zumbito zumba más bajito, como canción de cuna.',
      taunts: ['¡Bzz!', '¡Al ritmo, al ritmo!', '¡Tic, tac, bzz!'],
      acts: [
        { name: 'Ritmo', text: 'aplaudes a su ritmo', mercy: 50, reply: '* "¡Bzz bzz bzz!" Zumbito baila en el aire.' },
        { name: 'Flor', text: 'le das una flor de led', mercy: 45, reply: '* "¡Mi favorita!" La flor parpadea en azul.' },
        { name: 'Silencio', text: 'le pides un segundo de silencio', mercy: 35, reply: '* "...bzz? Un segundo. Ya."' },
      ],
      bullets: { count: 14, interval: 600, speed: 40, pool: ['b', 'z', 's', 'a', 'f', 'j', 'k', 'l', 'm', 'r', 'o', 'e'] },
      fightUnit: wiiBeatDamage,
      onEnter(scene, pages) {
        if (Save.data.flags.wiiIntro) return;
        Save.data.flags.wiiIntro = true;
        Save.write();
        pages.unshift(...wiiIntroPages());
        Quests.start('wii_canales');
      },
      onWin(scene, { spared, pages }) {
        if (!spared || typeof giveTecloide !== 'function') return;
        const t = giveTecloide('zumbito');
        if (t) pages.push('* Zumbito da tres vueltas a tu alrededor... ¡y se queda contigo!', t);
      },
    },
    munequito: {
      ...WII_BASE,
      name: 'Muñequito', sprite: 'munequito', model: 'munequito', caps: true, wiiTask: 'echo', wiiDodge: 'echo', fightTime: 1.1,
      hp: 100, atk: 6, def: 3, xp: 45,
      fightWords: 2,
      words: ['¡Hola, vecino!', 'Me gusta tu gorra.', '¿Jugamos boliche?', 'Soy tu copia.', '¡Choca esos cinco!', 'Ojos de puntito.', '¿Me imitas?', 'Sin nariz, ¿y qué?', 'Hoy es Martes.', '¡Qué cara tan simple!', 'Vivo en la Plaza.'],
      blurb: 'Un habitante de la ciudad con cara de puntitos. Repite lo que dices... y tú lo que él dice.',
      keysHint: 'Copiar frases EXACTAS: mayúsculas y signos',
      intro: '* ¡Un Muñequito te saluda agitando la mano!\n* ...Tú saludas. Él saluda igual. Tú paras. Él para.',
      check: '* MUÑEQUITO - ATQ 6 DEF 3\n* Copia todo. Escribe su frase EXACTA: con mayúsculas (SHIFT), comas y signos.',
      idle: ['* Muñequito te imita la postura. Se ve igualito.', '* BIT: ¿Ves esa manita que flota en el fondo?\n* Es mi tío.', '* Muñequito parpadea. Sus ojos son dos puntitos perfectos.'],
      calm: '* Muñequito sonríe con su boquita de una rayita.',
      taunts: ['¡Lo que tú digas!', '¡Lo que tú digas!', '¡Te copio!'],
      acts: [
        { name: 'Imitar', text: 'imitas su cara de puntitos', mercy: 50, reply: '* "¡Jaja! ¡Te pareces a mí!"' },
        { name: 'Crear', text: 'le diseñas unas cejas nuevas', mercy: 45, reply: '* "¡Cejas! ¡Qué expresivo!"' },
        { name: 'Saludar', text: 'lo saludas agitando la mano', mercy: 40, reply: '* Muñequito agita la mano igualito. Durante un buen rato.' },
      ],
      bullets: { count: 11, interval: 1150, speed: 36, pool: ['Hola', 'Copia', 'Igual', 'Tú', 'Yo', 'Mii', 'Cara', 'Ojos'] },
      fightList: wiiList,
    },
    canalclima: {
      ...WII_BASE,
      name: 'Canal Clima', sprite: 'canalclima', model: 'canalclima', wiiTask: 'ticker',
      hp: 105, atk: 5, def: 5, xp: 46,
      fightWords: 4,
      words: ['24°', '75%', '10 km/h', '18°C', '3/4', '90%', '12 km/h', '-5°', '50%', '1/2', 'lluvia 20%', 'sol 30°', 'viento 15 km/h', '2/3'],
      blurb: 'Una nubecita con pronóstico. Habla en números, grados y porcentajes.',
      keysHint: 'Números y símbolos: 24° 75% 10 km/h',
      intro: '* ¡Canal Clima interrumpe la batalla!\n* "Pronóstico para hoy: 100% de probabilidad de pelea."',
      check: '* CANAL CLIMA - ATQ 5 DEF 5\n* Escribe sus números con símbolos. El ° va con Shift + la tecla de la izquierda del 1\n* (en Mac: Option + Shift + 8).',
      idle: ['* Canal Clima anuncia: "Mañana, 25 grados y despejado."', '* En la gran pantalla hay un Canal Tienda cerrado:\n* "Aquí se compraban juegos viejitos para jugarlos en la nueva. Se llamaba Consola Virtual."', '* Cae una gotita. Luego sale el sol. Luego otra gotita.'],
      calm: '* Canal Clima pronostica: "Cielo despejado. Amistad al 80%."',
      taunts: ['¡Lluvia al 90%!', '¡Viento de 50 km/h!', '¡Granizo de letras!'],
      acts: [
        { name: 'Pronóstico', text: 'le preguntas si va a llover', mercy: 45, reply: '* "Veinte por ciento. Trae paraguas igual."' },
        { name: 'Sol', text: 'le pides un día soleado', mercy: 50, reply: '* "Para ti, 25 grados."' },
        { name: 'Nube', text: 'la abrazas aunque esté fría', mercy: 40, reply: '* "Brrr. Pero gracias."' },
      ],
      get bullets() { return { count: 11, interval: 1150, speed: 36, pool: wiiList(['°', '%', '/', '24', '75%', '1/2', '10', 'km', 'h', '30°', '5%']).filter((x) => x && x.trim()) }; },
      fightList: wiiList,
    },
    correita: {
      ...WII_BASE,
      name: 'Correíta', sprite: 'correita', model: 'correita', caps: true, fightTime: 1.05,
      hp: 110, atk: 6, def: 5, xp: 48,
      fightWords: 2,
      words: ['¡Ponte la correa!', '¡Cuidado con la Tele!', 'Respeta la Distancia.', '¡No lo sueltes!', 'Primero la Seguridad.', '¡Ojo con la Lámpara!', 'Muñeca bien amarrada.', '¡Atención, Jugador!', 'Revisa el Cordón.'],
      blurb: 'La correa de seguridad del control. Está MUY preocupada por todos. Grita con mayúsculas.',
      keysHint: 'Frases de advertencia con MAYUSCULAS y signos',
      intro: '* ¡Correíta aparece colgando de tu muñeca!\n* "¡ALTO! ¿Te pusiste la correa? ¡¿TE PUSISTE LA CORREA?!"',
      check: '* CORREITA - ATQ 6 DEF 5\n* Sus advertencias llevan MAYUSCULAS (SHIFT) y signos ¡! Escríbelas exactas.',
      idle: ['* Correíta: "En 2006, hubo gente que rompió su tele por no ponerse la correa.\n* No seas esa gente."', '* Correíta revisa que todos tengan la correa puesta. Hasta Bit.', '* Correíta se aprieta solita. Por si acaso.'],
      calm: '* Correíta suspira: "...Bueno. Confío en ti."',
      taunts: ['¡LA CORREA!', '¡Cuidado con la tele!', '¡Seguridad primero!'],
      acts: [
        { name: 'Ponerse', text: 'te pones la correa en la muñeca', mercy: 55, reply: '* "¡Por fin alguien responsable!"' },
        { name: 'Tele', text: 'le prometes no romper la tele', mercy: 40, reply: '* "...Lo voy a anotar."' },
        { name: 'Calma', text: 'le dices que todo va a estar bien', mercy: 45, reply: '* "¿Seguro? ...Ok."' },
      ],
      bullets: { count: 11, interval: 1150, speed: 37, pool: ['Ojo', 'Tele', 'Correa', 'Alto', 'Cuidado', 'Calma', 'Ya', 'Mano'] },
      fightList: wiiList,
      drop: 'correa',
    },
    nunchuquin: {
      ...WII_BASE,
      name: 'Nunchuquín', sprite: 'nunchuquin', model: 'nunchuquin', wiiTask: 'half',
      hp: 115, atk: 6, def: 4, xp: 48,
      fightWords: 4,
      words: ['palanca', 'botones', 'segundo', 'cable', 'control', 'izquierda', 'gatillo', 'sacudida', 'enredado', 'compañero', 'pareja', 'ayudante', 'conexión', 'mitades', 'después'],
      blurb: 'El control chiquito que cuelga de un cable. Siempre va de segundo. Sus palabras vienen en dos mitades.',
      keysHint: 'Palabras partidas en dos: escríbelas seguidas',
      intro: '* ¡Nunchuquín llega... detrás de alguien más, como siempre!\n* "¿Puedo pelear yo? ¿Sí? ¿De veras?"',
      check: '* NUNCHUQUIN - ATQ 6 DEF 4\n* Sus palabras vienen partidas por su cable. Escribe las dos mitades SEGUIDAS, sin espacio.',
      idle: ['* Nunchuquín se enreda en su propio cable.', '* Un letrero: "El nombre secreto de esta ciudad era Revolution."', '* Nunchuquín mueve su palanquita en círculos. Se marea.'],
      calm: '* Nunchuquín se queda quietecito, sin enredarse. Milagro.',
      taunts: ['¡Yo voy después!', '¡Mitad y mitad!', '¡Conectado!'],
      acts: [
        { name: 'Primero', text: 'lo dejas ir primero', mercy: 55, reply: '* "¿Yo? ¿Primero? ¡Wow!"' },
        { name: 'Cable', text: 'desenredas su cable', mercy: 45, reply: '* "Llevaba desde 2006 enredado."' },
        { name: 'Palanca', text: 'mueves su palanquita con cuidado', mercy: 40, reply: '* "Jiji, cosquillas."' },
      ],
      bullets: { count: 12, interval: 1100, speed: 38, pool: ['pa', 'lan', 'ca', 'bo', 'to', 'nes', 'ca', 'ble', 'se', 'gun', 'do', 'mi'] },
    },
    sensorin: {
      ...WII_BASE,
      name: 'Sensorín', sprite: 'sensorin', model: 'sensorin', wiiTask: 'side', wiiDodge: 'side', fightTime: 0.85,
      hp: 120, atk: 7, def: 4, xp: 50,
      fightWords: 4,
      words: ['sensor', 'infrarrojo', 'distancia', 'puntero', 'pantalla', 'apuntar', 'luces', 'señal', 'calibrar', 'televisión', 'cursor', 'mirada', 'izquierda', 'derecha'],
      blurb: 'La barra sensora con dos ojitos LED. Te "ve" de un lado y del otro. El más rápido de la plaza.',
      keysHint: 'Velocidad: palabras que saltan de izquierda a derecha',
      intro: '* ¡Sensorín se prende sobre la tele!\n* Sus dos ojitos LED te siguen a todos lados.',
      check: '* SENSORIN - ATQ 7 DEF 4\n* Sus palabras saltan de un lado al otro. Y sus luces caen alternando izquierda y derecha.',
      idle: ['* Una ranura con un control de cubo dice:\n* "Los primeros modelos leían los discos del cubo. Familia es familia."', '* Sensorín parpadea sus dos LED: ¡clic, clic!', '* BIT: Psst... la barra sensora no "siente" nada. Solo son dos luces. El que ve es el control.'],
      calm: '* Sensorín te mira con sus dos luces tranquilas.',
      taunts: ['¡Te veo!', '¡Izquierda! ¡Derecha!', '¡Dos luces, cero dudas!'],
      acts: [
        { name: 'Alinear', text: 'la pones derechita sobre la tele', mercy: 50, reply: '* "¡Ahora sí te veo!"' },
        { name: 'Lejos', text: 'te paras a la distancia correcta', mercy: 45, reply: '* "Un metro... dos. ¡Perfecto!"' },
        { name: 'Luz', text: 'apagas la lámpara que la confunde', mercy: 40, reply: '* "¡Gracias! Esa lámpara me daba dolor de cabeza."' },
      ],
      bullets: { count: 13, interval: 1050, speed: 40, pool: ['luz', 'led', 'izq', 'der', 'ojo', 'clic', 'ver', 'rayo', 'señal', 'tele'] },
      drop: 'sensor',
    },
    entrenadormi: {
      name: 'Entrenador Mi', sprite: 'entrenadormi', mode: 'wiigym', xp: 55, drop: 'pelota_boliche',
      blurb: '¡MINIJEFE! Gimnasio Sensor: tres pruebas de ritmo. Boliche, tenis (una mano a la vez) y box al compás.',
      keysHint: 'Ritmo constante y mano izquierda / derecha',
    },
    daniwii: {
      name: 'Dani Turbo', sprite: 'dani', mode: 'wiitorneo', xp: 55,
      blurb: '¡MINIJEFE! Torneo Sensor: la gran final contra Dani. Tecloides 3 contra 3, ataques largos y con acento.',
      keysHint: 'Palabras de 8 a 12 letras con acento, con prisa',
    },
    cometa: {
      ...WII_BASE,
      name: 'Capitán Cometa', sprite: 'cometa', model: 'cometa', boss: true, console: 'wii',
      mode: 'cometa',           // js/scenes/wii-cometa.js
      theme: 'cometa', music: 'wii_cometa', fightTime: 1,
      hp: 340, atk: 7, def: 5, xp: 90,
      fightWords: 4,
      words: ['estrella', 'gravedad', 'planeta', 'órbita', 'cometa', 'galaxia', 'telescopio', 'capitán', 'satélite', 'meteoro', 'nebulosa', 'constelación', 'cráter', 'cósmico', 'brillo', 'lejano'],
      fallWords: ['estrella', 'cielo', 'noche', 'luna', 'planeta', 'órbita', 'cometa', 'galaxia', 'nave', 'viaje', 'rumbo', 'espacio', 'cosmos', 'sol', 'eclipse',
        'meteoro', 'cráter', 'brillo', 'polvo', 'estelar', 'satélite', 'universo', 'gravedad', 'capitán', 'mapa', 'faro', 'luz', 'casa', 'lejos', 'volver'],
      blurb: '¡JEFE! El Observatorio: el Glitch le robó la gravedad al Capitán. Ahora todo cae... hacia todos lados.',
      keysHint: 'De todo: velocidad, ritmo y texto de cabeza',
      intro: '* El Observatorio flota en el espacio. Todo da vueltas.\n* "¡ALTO! Solo un tecleo MUY estable puede restaurar mi órbita."',
      check: '* CAPITAN COMETA - ATQ 7 DEF 5\n* El Glitch le robó la gravedad. Cada palabra PERFECTA rescata una de sus 7 estrellitas.',
      idle: [
        '* Las estrellitas giran alrededor del Capitán, asustadas.',
        '* CAPITAN COMETA: "Cada palabra que escribes bien tiene su propia gravedad. Lo noto."',
        '* El planeta chiquito gira. Tus pies quieren ir hacia arriba.',
        '* Un telescopio enorme apunta a la Ciudad Sensor. Casi todos los canales siguen apagados.',
      ],
      calm: '* La capa del Capitán ondea más despacio. La órbita se está calmando.',
      taunts: ['¡Gravedad, ven aquí!', '¡Todo cae hacia el centro!', '¡Las estrellas no se apagan!'],
      acts: [
        { name: 'Estabilizar', text: 'estabilizas la órbita con calma', mercy: 30, reply: '* El planeta deja de tambalearse.\n* "...Gracias. Así no se me voltea el mundo." (Se canceló el giro de gravedad.)' },
        { name: 'Estrellas', needStars: 1, costStar: true, text: 'le devuelves una estrellita en la mano', mercy: 40, reply: '* La estrellita brinca a su hombro.\n* "Las estrellas no se apagan. Se van lejos. No es lo mismo."' },
        { name: 'Observar', needStars: 3, text: 'miras el cielo con él en silencio', mercy: 50, reply: '* Se quedan callados, mirando las estrellas.\n* "...Ahí. Esa es mi casa."' },
      ],
      bullets: { count: 12, interval: 1050, speed: 0.2, pool: ['luz', 'sol', 'luna', 'astro', 'polvo', 'nave', 'cielo', 'órbita', 'cometa', 'brillo', 'estrella', 'faro'] },
      // Cada palabra PERFECTA en LUCHAR rescata una estrellita (js/scenes/wii-cometa.js).
      fightUnit(unit, dmg, battle) {
        if (!unit.errors && battle.rescueStar) battle.rescueStar();
        return dmg;
      },
      onWin(scene, { first, pages }) {
        const d = Save.data;
        pages.splice(1, 0, '* CAPITAN COMETA: ...La órbita es estable otra vez.\n* "Ya tienes mi gravedad. Cuídala."');
        Quests.complete('mundo_wii');
        if (['entrenadormi', 'daniwii', 'cometa'].every((id) => d.done[id])) Quests.complete('wii_canales');
        if (Quests.state('wii_estrellitas') === 'done' && !d.flags.cometaPueblo) {
          d.flags.cometaPueblo = true;
          d.treasures.estrellita_capitan = true;
          pages.push(
            '* Una de las 7 estrellitas se queda flotando junto a ti.\n* Recibiste: ESTRELLITA DEL CAPITAN. (Se guardó en tu vitrina.)',
            '* CAPITAN COMETA: Rescataste a las siete. Te debo una.\n* Voy a poner un observatorio en el techo de tu museo.',
          );
        }
        if (!first) return;
        d.flags.finalAbierto = true; // gancho para el final (LORE.md §10, El Canal Vacío)
        pages.push(
          '* ¡La pantalla gigante de la ciudad se prende entera!\n* CANAL DEPORTES · CANAL TORNEO · CANAL GALAXIA: ENCENDIDOS.',
          '* BIT: ¡LO LOGRAMOS! Esta consola vendió más de cien millones.\n* Cien. Millones. ...Y ahora está a salvo.',
          '* ...',
          '* En una esquina de la pantalla, un cuadrito que nadie había visto se prende solo.\n* No tiene dibujo. Solo dice: CANAL VACIO.',
          `* ???: ${wiiGlitch('Ya no tengo dónde esconderlas. Las rescataste todas.')}`,
          `* ???: ${wiiGlitch('Si quieres saber quién soy... entra. Te espero en el canal que nunca existió.')}`,
          '* BIT: ...',
          '* BIT: Oye. Antes de entrar, vamos al pueblo.\n* Todos los amigos que hiciste... van a querer decirte algo.',
          '* (Se abrió EL CANAL VACIO. En la plaza del pueblo apareció una tele vieja...)',
        );
        Quests.start('wii_canal_vacio');
      },
    },
  },

  treasures: {
    pelota_boliche: { name: 'Pelota de boliche', desc: 'Regalo del Entrenador Mi. Azul, pesada y con tres hoyitos.' },
    pelota_dorada: { name: 'Pelota dorada', desc: '10 chuzas seguidas. El Entrenador Mi lloró un poquito.' },
    estrellita_capitan: { name: 'Estrellita del Capitán', desc: 'Una de las 7. Brilla más cuando escribes sin errores.' },
    correa: { name: 'Correa', desc: 'Para que el control no vuele. Y la tele no llore.' },
    sensor: { name: 'Barra sensora', desc: 'Solo son dos luces. En serio, solo eso.' },
    medalla_sensor: { name: 'Medalla Sensor', desc: 'Campeón del Torneo Sensor. Dani dice que fue de suerte.' },
    cara_mii: { name: 'Cara de puntitos', desc: 'Tu cara, diseñada por Muñequito. Ojos grandes, boca chica, gorra azul.' },
  },

  sprites: WII_SPRITES,
  tracks: WII_TRACKS,

  quests: {
    mundo_wii: {
      name: 'La Ciudad Sensor',
      desc: 'Una tubería blanca lleva a una ciudad moderna. El Glitch quiere apagarla con su "luz de standby". Llega al Observatorio y rescata la Wii.',
    },
    wii_canales: {
      name: 'Enciende los canales',
      desc: 'Gana el Gimnasio Sensor, el Torneo Sensor y el Observatorio: cada uno prende un canal de la pantalla gigante.',
      progress: () => `${['entrenadormi', 'daniwii', 'cometa'].filter((id) => Save.data.done[id]).length}/3`,
    },
    wii_chuza: {
      name: 'Chuza perfecta',
      desc: 'Haz 10 chuzas seguidas en BOLICHE SENSOR (dificultad Normal o Difícil). El gimnasio del Entrenador Mi también cuenta.',
      progress: () => `${Math.min(10, ((Save.data.wii || {}).chuzas) || 0)}/10`,
    },
    wii_estrellitas: {
      name: 'Las 7 estrellitas',
      desc: 'Rescata las 7 estrellitas del Capitán Cometa en una sola batalla (7 palabras PERFECTAS en LUCHAR).',
    },
    wii_caras: {
      name: 'Caras nuevas',
      desc: 'Muñequito, en el pueblo, quiere caras nuevas. Escribe las 5 descripciones que te dicta, exactas.',
    },
    wii_canal_vacio: {
      name: 'El Canal Vacío',
      desc: 'Un canal sin nombre se prendió en la pantalla gigante de la Ciudad Sensor. Vuelve al pueblo: en la Plaza de las Tuberías apareció una tele vieja con estática magenta. Alguien te espera adentro.',
    },
  },
});
