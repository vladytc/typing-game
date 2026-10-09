// Diario de misiones. Una misión se activa con Quests.start(id) y se cumple con Quests.complete(id).
// `progress` (opcional) calcula un texto de avance, por ejemplo "3/17".

const QUESTS = {
  rescate_gb: {
    name: 'Rescata la Game Boy',
    desc: 'Entra por la tubería verde al Valle Game Boy y vence al Tetro Rey.',
  },
  coleccion: {
    name: 'El sueño de Don Chip',
    desc: 'Llena la vitrina del museo con consolas y tesoros.',
    progress: () => {
      const d = Save.data;
      const total = CONSOLES.length + Object.keys(TREASURES).length;
      const got = Object.keys(d.consoles).length + Object.keys(d.treasures).length;
      return `${got}/${total}`;
    },
  },
  amigos: {
    name: 'Amigos del pueblo',
    desc: 'Perdona a los monstruos en vez de vencerlos: se mudan al Pueblo Vitrina y te cuentan datos de su consola.',
    progress: () => {
      const all = Object.keys(ENEMIES).filter((id) => !ENEMIES[id].mode || ENEMIES[id].friend);
      return `${all.filter((id) => Save.data.spared[id]).length}/${all.length}`;
    },
  },
  primer_tecloide: {
    name: 'Mi primer Tecloide',
    desc: 'Ve al Pasto Alto Grande del Valle Game Boy, escoge tu Tecloide con la Profesora Letra y vence a Dani Turbo.',
  },
  pato: {
    name: 'El reto de Toby',
    desc: 'Escribe "pato" tres veces seguidas sin ningún error.',
  },
  flauta: {
    name: 'El gran ronquido',
    desc: 'Algo ENORME duerme en el camino del este. Bit cree que hace falta una flauta para despertarlo.',
  },
  arcade: {
    name: 'Leyenda del arcade',
    desc: 'Consigue 40 puntos en BLOQUES, la máquina arcade del pueblo.',
    progress: () => `Récord: ${(Save.data.arcade || {}).bloques || 0}`,
  },
};

const Quests = {
  state(id) { return (Save.data.quests || {})[id]; },
  start(id) {
    const q = Save.data.quests || (Save.data.quests = {});
    if (q[id]) return;
    q[id] = 'active';
    Save.write();
    toast(`¡NUEVA MISION!\n${QUESTS[id].name}`);
  },
  complete(id) {
    const q = Save.data.quests || (Save.data.quests = {});
    if (q[id] === 'done') return;
    q[id] = 'done';
    Save.write();
    Sfx.secret();
    toast(`¡MISION CUMPLIDA!\n${QUESTS[id].name}`);
  },
};

// Aviso que aparece arriba de la pantalla y sobrevive a los cambios de escena.
function toast(text) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = esc(text).replace(/\n/g, '<br>');
  const frame = document.getElementById('screen-frame');
  el.style.top = `${28 + frame.querySelectorAll('.toast').length * 62}px`;
  frame.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}
