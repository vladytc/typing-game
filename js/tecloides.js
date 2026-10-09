// TECLOIDES: criaturitas que viven en las teclas (homenaje a las batallas de monstruos
// de los RPG portátiles). Cada ataque es una PALABRA: se escribe para usarlo.
// Diseño completo en docs/LORE.md §3.1.

// Tipos. Ventaja x1.5, desventaja x0.67. BYTE es neutral.
const TTYPES = { chispa: 'CHISPA', gota: 'GOTA', brote: 'BROTE', byte: 'BYTE' };
const BEATS = { chispa: 'gota', gota: 'brote', brote: 'chispa' };
// ESTATICA (tipo secreto del Glitch, desde el Mundo 3): x1.2 contra todos, pero BYTE le pega x2.
function effectiveness(moveType, defType) {
  if (defType === 'estatica') return moveType === 'byte' ? 2 : 1;
  if (moveType === 'estatica') return 1.2;
  if (BEATS[moveType] === defType) return 1.5;
  if (BEATS[defType] === moveType) return 0.67;
  return 1;
}

// Ataque: { name, word (lo que se escribe), power, type, effect? }
//   effect 'aturdir': si es PERFECTO, el rival pierde su siguiente turno.
//   effect 'curar':   si es PERFECTO, recupera 10% de HP.
const move = (name, word, power, type, effect) => ({ name, word, power, type, effect });
const TECLEO = move('Tecleo', 'tecla', 25, 'byte');

const TECLOIDES = {
  voltin: {
    name: 'Voltín', type: 'chispa', sprite: 'voltin', hp: 44,
    desc: 'Una chispa con ojos. Le gustan las palabras cortas y rápidas.',
    moves: [move('Chispazo', 'zas', 20, 'chispa'), TECLEO, move('Destello', 'destello', 35, 'chispa'), move('Trueno', 'trueno', 45, 'chispa', 'aturdir')],
  },
  gotin: {
    name: 'Gotín', type: 'gota', sprite: 'gotin', hp: 48,
    desc: 'Una gota con gorra. Fluye mejor si escribes sin errores.',
    moves: [move('Salpicón', 'salpica', 30, 'gota'), TECLEO, move('Burbujas', 'burbujas', 35, 'gota'), move('Marea', 'marea alta', 50, 'gota')],
  },
  brotin: {
    name: 'Brotín', type: 'brote', sprite: 'brotin', hp: 52,
    desc: 'Un brote que salió de una tubería. Resiste mucho y ama las palabras largas.',
    moves: [move('Hojita', 'hoja', 20, 'brote'), TECLEO, move('Enredadera', 'enredadera', 40, 'brote'), move('Raíz', 'raíces profundas', 55, 'brote', 'curar')],
  },
};

const STARTERS = ['voltin', 'gotin', 'brotin'];
// El inicial que le gana a cada uno: el rival siempre escoge ese, como todo buen rival.
const COUNTER = { voltin: 'brotin', gotin: 'voltin', brotin: 'gotin' };

// HP de un Tecloide según su nivel (los iniciales empiezan en nivel 5).
const tecloideHp = (id, lv) => TECLOIDES[id].hp + (lv - 5) * 3;

const TRAINERS = {
  dani: {
    name: 'Dani Turbo',
    sprite: 'dani',
    team: (starter) => [{ id: COUNTER[starter], lv: 5 }],
    intro: [
      '* DANI: ¿Tú también recibiste uno?\n* ¡Pues a ver si sabes usarlo!',
      '* ¡DANI TURBO quiere pelear!',
    ],
    lose: ['* DANI: Te dejé ganar. Para que no llores.', '* DANI: ...Ok, ok. Fuiste rápido.\n* No se lo digas a nadie.'],
    win: ['* DANI: ¡Ja! ¿Eso fue un intento?\n* Yo tecleo más rápido dormido.'],
    retry: ['* PROFESORA LETRA: ¡Tranquilo! Ya curé a tu Tecloide.', '* DANI: Te doy otra oportunidad porque soy generoso.'],
    reward: 'medalla',
  },
};

Object.assign(SPRITES, {
  voltin: [
    '..........d.....',
    '.........dd.....',
    '........dbd.....',
    '.......dbd......',
    '......dbbd......',
    '.....dddddd.....',
    '....dbbbbbbd....',
    '...dbbadbadbd...',
    '...dbbddbddbd...',
    '..ddbbbbbbbbdd..',
    '.dbdbbbddbbbdbd.',
    '..ddbbbbbbbbdd..',
    '....dbbbbbbd....',
    '.....dddddd.....',
    '................',
    '................',
  ],
  gotin: [
    '................',
    '....ddddddd.....',
    '...dcccccccd....',
    '...dddddddddd...',
    '....dbbbbbbd....',
    '...dbbccccccd...',
    '..dbcadccadccd..',
    '..dbcddccddccd..',
    '..dbcccccccccd..',
    '..dbccbddbcccd..',
    '..dbcccbbccccd..',
    '...dbcccccccd...',
    '....ddccccdd....',
    '......dddd......',
    '................',
    '................',
  ],
  brotin: [
    '....dd....dd....',
    '...dbbd..dbbd...',
    '...dbbbddbbbd...',
    '....dbbccbbd....',
    '......dccd......',
    '....dddddddd....',
    '....dcadcadd....',
    '....dcddcddd....',
    '..dddddddddddd..',
    '..dbbbbbbbbbbd..',
    '..dddddddddddd..',
    '...dccccccccd...',
    '...dcbccccccd...',
    '...dcbccccccd...',
    '...dcbccccccd...',
    '...dddddddddd...',
  ],
  dani: [
    '................',
    '.....dddddd.....',
    '....dccccccd....',
    '...dccccccccd...',
    '....dccccccd....',
    '....daaaaaad....',
    '...dddddddddd...',
    '....dddaaddd....',
    '....daaddaad....',
    '..dccccccccccd..',
    '...dccdbbdbbd...',
    '...dabbbbbbad...',
    '....dbbbbbbd....',
    '....dddddddd....',
    '....dcd..dcd....',
    '....dd....dd....',
  ],
  profesora: [
    '........dd......',
    '.......dbd......',
    '.....dddddd.....',
    '....dccccccd....',
    '....dcaaaacd....',
    '....daaaaaad....',
    '....dadaadad....',
    '....daaaaaad....',
    '.....daddad.....',
    '...ddaaaaaadd...',
    '..daadaaaadaad..',
    '..daadadadaad...',
    '..dddaaaaaaddd..',
    '....daaaaaad....',
    '....dcd..dcd....',
    '....dd....dd....',
  ],
});
