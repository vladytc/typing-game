// Secretos jugables del mundo nes: curiosidades con el dato real (ver js/secretos.js).
//
//   nes_menos1  Patio de Ladrillos: el ladrillo con grieta junto a las dos tuberías de arriba
//               (como la pared del final del 1-2). Se atraviesa y lleva al MUNDO -1 (Scenes.menos1),
//               un nivel de agua que se repite. A la tercera vuelta se sale con RESET.
//   nes_zelda   Castillo 2: el libro de registro pide tu nombre. Con ZELDA empieza la Segunda
//               Misión de la mazmorra (js/scenes/mazmorra.js con { second: true }).
//   nes_nube    Patio de Ladrillos: el arbusto debajo de la nube del medio. Habla, se pinta de nube.

// ---------- Sprites (4 tonos con su paleta NES; el museo los pinta con `pal`) ----------

// Copia de un dibujo de 4 tonos con otra paleta (como la NES: mismo dibujo, otros colores).
const nesRepal = (rows, pal) => Object.assign(rows.slice(), { pal });

const NES_SECRET_PAL = {
  ladrillo: { a: '#fcbcb0', b: '#c84c0c', c: '#c84c0c', d: '#000000' },
  arbusto: { a: '#b8f818', b: '#b8f818', c: '#00a800', d: '#000000' },
  nube: { a: '#fcfcfc', b: '#fcfcfc', c: '#a4e4fc', d: '#000000' },
};

Object.assign(SPRITES, {
  // Museo: la tubería del Mundo -1 con burbujas.
  menos1: nesRepal([
    '..c.............',
    '.c.c.....c......',
    '..c.....c.c.....',
    '.........c......',
    '..dddddddddddd..',
    '..daaabbbbbbbd..',
    '..daaabbbbbbbd..',
    '..dddddddddddd..',
    '...dabbbbbbbd...',
    '...dabbbbbbbd...',
    '...dabbbbbbbd...',
    '...dabbbbbbbd...',
    '...dabbbbbbbd...',
    '...dabbbbbbbd...',
    '...dabbbbbbbd...',
    '...dddddddddd...',
  ], { a: '#b8f818', b: '#00a800', c: '#fcfcfc', d: '#000000' }),
  // Museo: un triángulo dorado con un 2 (la Segunda Misión).
  zelda2q: nesRepal([
    '.......dd.......',
    '......daad......',
    '.....daaaad.....',
    '.....dabbbd.....',
    '....daabbbbd....',
    '....dabbbbbd....',
    '...ddddddddd....',
    '...dad....dad...',
    '..daad.cc.daad..',
    '..dabd...cdabd..',
    '.daabbd.c.daabd.',
    '.dabbbdccdabbbd.',
    'ddddddddddddddd.',
    '................',
    '................',
    '................',
  ], { a: '#fcfcfc', b: '#f8b800', c: '#fcfcfc', d: '#000000' }),
  // Museo: mitad nube, mitad arbusto. El mismo dibujo.
  nubearbusto: nesRepal(SPRITES.nes_arbusto.map((row) => [...row].map((ch, x) => {
    if (ch === '.' || ch === 'd') return ch;
    if (x < 8) return 'a';
    return ch === 'c' ? 'c' : 'b';
  }).join('')), { a: '#fcfcfc', b: '#b8f818', c: '#00a800', d: '#000000' }),
  // Patio: un ladrillo igual a los demás... con una grieta finita.
  nes_ladrillo_raro: nesRepal(SPRITES.nes_ladrillo.map((row, y) => [...row].map((ch, x) => (
    [[4, 5], [5, 6], [5, 9], [6, 10], [10, 6], [11, 5]].some(([cx, cy]) => cx === x && cy === y) ? 'd' : ch
  )).join('')), NES_SECRET_PAL.ladrillo),
  // Patio: el arbusto que habla. Y el mismo arbusto con la paleta de las nubes.
  arbusto_parlante: nesRepal(SPRITES.nes_arbusto, NES_SECRET_PAL.arbusto),
  nube_parlante: nesRepal(SPRITES.nes_arbusto, NES_SECRET_PAL.nube),
  // Castillo 2: atril con el libro de registro.
  atril: nesRepal([
    '................',
    '................',
    '..dddddd.dddddd.',
    '.daaaaaadaaaaaad',
    '.dacccaadacccaad',
    '.daaaaaadaaaaaad',
    '.dacccaadaccaaad',
    '.daaaaaadaaaaaad',
    '..dddddddddddd..',
    '......dbbd......',
    '......dbbd......',
    '......dbbd......',
    '......dbbd......',
    '....dddbbddd....',
    '...dbbbbbbbbd...',
    '...dddddddddd...',
  ], { a: '#fcfcfc', b: '#887000', c: '#7c7c7c', d: '#000000' }),
});

// ---------- Secreto 1: el MUNDO -1 ----------

// La pared rara del patio: se empuja con el truco y se atraviesa.
async function nesParedRara(ctx) {
  await ctx.say(['* Este ladrillo tiene una grieta finita.\n* Junto a esas dos tuberías... ¿te recuerda el final de algún nivel?']);
  if (await ctx.choose(['empujar', 'dejar']) === 1) return;
  await ctx.say(['* Como en el truco de siempre:\n* te agachas, saltas de espaldas y te empujas contra la pared...']);
  const res = await ctx.challenge({ label: '¡El truco! Escríbelo rápido:', texts: ['agáchate', 'salta', 'empuja'], timeLimit: 9000 });
  if (!res.completed) {
    await ctx.say(['* ¡PUM! Rebotaste.\n* La pared sigue ahí... pero la grieta tembló un poquito.']);
    return;
  }
  Sfx.warp();
  await ctx.say(['* ¡¿QUÉ?! ¡Atravesaste la pared!', '* Del otro lado hay una tubería que no estaba en el mapa.\n* Abajo se oye... agua.']);
  if (Game.scene === Scenes.town) Game.go('menos1', { back: 'town' });
}

const M1_WORDS = ['agua', 'burbuja', 'nada', 'pez', 'alga', 'coral', 'ola', 'marea', 'calamar', 'azul', 'arena', 'concha', 'buceo', 'profundo'];
const M1_LAPS = 3;
const M1_X = [60, 150, 240, 330, 420, 510];

// Cheep cheep (pez rojo) y Blooper (calamar blanco), dibujados al estilo NES con 3 colores.
const M1_CHEEP = [
  '................',
  '......RRRR......',
  '....RRRRRRR..RR.',
  '...RRWWRRRRRRRR.',
  '..RRWKWRRRRRRR..',
  '.RRRWWRRRRRRRR..',
  '.RRRRRRRRRRRR...',
  '.WWRRRRRRRRRRR..',
  '..WWWRRRRRRRRRR.',
  '...WWWWRRRR..RR.',
  '.....WWWW.......',
  '................',
];
const M1_BLOOPER = [
  '.......WW.......',
  '......WWWW......',
  '.....WWWWWW.....',
  '....WWWWWWWW....',
  '....WKWWWWKW....',
  '....WKWWWWKW....',
  '....WWWWWWWW....',
  '.....WWWWWW.....',
  '....KKKKKKKK....',
  '....WWWWWWWW....',
  '...W.W.WW.W.W...',
  '...W.W.WW.W.W...',
  '..W..W.WW.W..W..',
  '..W..W.WW.W..W..',
];

Scenes.menos1 = nesScene({
  enter({ back = 'town' } = {}) {
    this.back = back;
    this.mount('m1-scene', '<div class="m1-hud"></div>');
    Object.assign(this, { lap: 1, beat: 0, mx: 20, tx: 20, warpT: 0, bubbles: [] });
    this.spawnFish();
    this.playMusic('menos1');
    this.renderHud();
    this.say([
      '* ...¿Dónde estamos? Todo es agua.',
      '* Arriba dice "MUNDO -1"... con un espacio antes del -1.\n* ¡Ese mundo no existe!',
      '* Escribe las palabras para nadar. Al final hay una tubería.',
    ], () => this.typing(), 'BIT');
  },

  renderHud() {
    const hud = $('.m1-hud');
    if (hud) hud.innerHTML = `<span>MARIO</span><span>MUNDO&nbsp;&nbsp;-1</span><span>VUELTA ${this.lap}</span>`;
  },

  // Cada vuelta: un pez o un calamar en cada parada con su palabra; la última es la tubería.
  spawnFish() {
    const words = pickWords(M1_WORDS, M1_X.length - 1);
    this.fish = M1_X.map((x, i) => ({
      x: x + 60, y: 90 + ((i * 53) % 120), word: i < words.length ? words[i] : 'tubo',
      kind: i === M1_X.length - 1 ? 'pipe' : i % 2 ? 'blooper' : 'cheep', gone: 0,
    }));
  },

  typing() {
    this.mode = 'type';
    this.panel.innerHTML = '<div class="m1-word"></div>';
    this.word = new NesWord($('.m1-word', this.panel), this.tally);
    const f = this.fish[this.beat];
    this.word.set(f.word, f.kind === 'pipe' ? '▶ ¡A LA TUBERIA!' : '~ ¡NADA!');
  },

  actionKey(k) {
    if (this.mode !== 'type') return;
    if (this.word.key(k) !== 'done') return;
    const f = this.fish[this.beat];
    Sfx.jump();
    if (f.kind === 'pipe') { this.mode = 'warp'; this.tx = 600; this.warpT = 0.9; return; }
    f.gone = 0.01;
    this.tx = M1_X[this.beat] + 30;
    this.beat++;
    this.typing();
  },

  // La tubería del final te regresa al principio. Siempre.
  endLap() {
    Sfx.warp();
    this.lap++;
    this.beat = 0;
    this.mx = 20;
    this.tx = 20;
    this.spawnFish();
    this.renderHud();
    const lines = {
      2: ['* ...¿Eh? ¡Volvimos al principio!\n* Es el mismo lugar. Los mismos peces.'],
      3: ['* ¡OTRA VEZ! La tubería del final nos regresa al inicio.\n* Este nivel se repite para siempre.'],
    }[this.lap];
    if (lines) { this.say(lines, () => this.typing(), 'BIT'); return; }
    this.say([
      '* Ya entendí: en el juego de verdad, de aquí solo se salía\n* perdiendo todas las vidas... o apagando la consola.',
      '* ¡Presionemos RESET! (Escríbelo con MAYUSCULAS.)',
    ], () => this.reset(), 'BIT');
  },

  reset() {
    this.mode = 'reset';
    this.task({
      label: 'Escribe para presionar el botón:',
      texts: ['RESET'],
      timeLimit: 60000,
      onDone: (res) => {
        if (!res.completed) { this.reset(); return; }
        this.mode = 'off';
        this.noPause = true;
        Music.stop();
        Sfx.bump();
        this.panel.innerHTML = '';
        this.after(1.2, () => findSecret('nes_menos1').then(() => { if (Game.scene === this) Game.go(this.back); }));
      },
    });
  },

  update(dt) {
    const d = this.tx - this.mx;
    this.mx += Math.sign(d) * Math.min(Math.abs(d), 180 * dt);
    this.fish.forEach((f) => { if (f.gone) f.gone += dt; });
    if (this.mode === 'warp') {
      this.warpT -= dt;
      if (this.warpT <= 0) { this.mode = 'ui'; this.endLap(); }
    }
    if (Math.random() < dt * 3) this.bubbles.push({ x: Math.random() * 640, y: 300 });
    this.bubbles = this.bubbles.filter((b) => (b.y -= dt * 40) > 30);
  },

  draw(dt) {
    const g = this.g;
    if (this.mode === 'off') { g.fillStyle = NES.K; g.fillRect(0, 0, 640, 300); return; }
    const t = performance.now() / 1000;
    g.fillStyle = '#2038ec';
    g.fillRect(0, 0, 640, 300);
    // Olas de la superficie.
    g.fillStyle = NES.W;
    for (let x = 0; x < 640; x += 32) g.fillRect(x + ((t * 20) % 32), 22 + (x % 64 ? 2 : 0), 20, 4);
    // Fondo de coral y algas.
    for (let x = 0; x < 640; x += 32) {
      g.fillStyle = NES.K;
      g.fillRect(x, 264, 32, 36);
      g.fillStyle = NES.G;
      g.fillRect(x + 2, 266, 28, 32);
      g.fillStyle = NES.L;
      g.fillRect(x + 6, 270, 8, 4);
    }
    [80, 270, 390].forEach((x, i) => {
      g.fillStyle = NES.L;
      for (let j = 0; j < 5; j++) g.fillRect(x + Math.sin(t * 2 + j + i) * 4, 256 - j * 12, 6, 12);
    });
    g.fillStyle = NES.W;
    this.bubbles.forEach((b) => g.fillRect(b.x, b.y, 4, 4));
    // La tubería de salida (de lado, como la de los niveles de agua).
    g.fillStyle = NES.K;
    g.fillRect(586, 196, 54, 68);
    g.fillStyle = NES.G;
    g.fillRect(600, 202, 40, 56);
    g.fillRect(588, 198, 16, 64);
    g.fillStyle = NES.L;
    g.fillRect(606, 206, 6, 48);
    // Peces y calamares con su palabra.
    this.fish.forEach((f, i) => {
      if (f.kind === 'pipe') {
        if (i === this.beat && this.mode === 'type') this.label(f.word, 612, 186, { pos: this.word.pos, active: true });
        return;
      }
      if (f.gone > 1) return;
      const y = f.y + Math.sin(t * 2 + i) * 8 - f.gone * 200;
      const x = f.x + f.gone * 300;
      if (f.kind === 'blooper') paintNes(g, M1_BLOOPER, x, y, 2);
      else paintNes(g, M1_CHEEP, x, y, 2, true);
      if (i === this.beat && this.mode === 'type') this.label(f.word, x + 16, y - 8, { pos: this.word.pos, active: true });
    });
    // Mario nadando (si ya entró a la tubería, no se ve).
    if (this.mode !== 'warp' || this.mx < 590) {
      const frame = Math.floor(t * 4) % 2 ? MARIO_SPR.walk : MARIO_SPR.stand;
      paintNes(g, frame, this.mx, 150 + Math.sin(t * 3) * 10, 2);
    }
    if (this.mode === 'warp' && this.warpT < 0.4) { g.fillStyle = `rgba(0,0,0,${1 - this.warpT / 0.4})`; g.fillRect(0, 0, 640, 300); }
    this.drawPops(dt);
  },
});

// Mundo -1: celesta de 8 bits en Mi menor, 72 BPM, como flotar en un lugar que no debería existir.
// La melodía es la "Danza del Hada de Azúcar" de El Cascanueces (Chaikovski, 1892; murió en 1893:
// dominio público), la misma pieza que Nintendo usó como "Music 1" del Tetris de NES (1989).
// Fuentes: Wikipedia, "Tetris (NES video game)" (desarrollado y publicado por Nintendo R&D1; su música
// incluye "The Dance of the Sugar Plum Fairy"); los créditos de MobyGames del Tetris de NES la listan
// como Chaikovski sin acreditar. Las notas salen de la partitura de Chaikovski; el arreglo es propio:
// pulso 25 % con envolvente de campana una octava arriba, el triángulo en pizzicato, acordes de
// colchón, trinos de octava en el B y un poco de eco. Entrada de 4 tiempos, forma A B A (~67 s).
TRACKS.menos1 = (() => {
  const p1 = 'G5/1 E5/1 G5/2 F#5/2 D#5/2 E5/2 D5/1 D5/1 D5/2 C#5/1 C#5/1 C#5/2 C5/1 C5/1 C5/2 B4/1 E5/1 C5/1 E5/1 B4/2 -/4';
  const p2 = 'G4/1 E4/1 G4/2 F#4/2 C5/2 B4/2 G5/1 G5/1 G5/2 F#5/1 F#5/1 F#5/2 E5/1 E5/1 E5/2 D#5/1 F#5/1 E5/1 F#5/1 D#5/2 -/4';
  const p3 = 'E5/1 C#5/1 E5/2 D#5/2 -/2 D5/1 B4/1 D5/2 C#5/2 -/2 C5/1 A4/1 C5/2 B4/2 -/2 B4+D#5+F#5+B5/2 E5/6';
  const run = 'C#5+C#6/2 D#5+D#6/2 E5+E6/2 F#5+F#6/2 G5+G6/2 E5+E6/2 D#5+D#6/4';
  const melB = `${run} | B5/1 A5/1 F#5/1 D#5/1 B4/1 A4/1 F#4/1 D#4/1 B3/2 -/6 | ${run} | E5+E6/2 F#5+F#6/2 G5+G6/2 A5+A6/2 B5+B6/4 D#5/2 F#5/2`;
  const b1 = '-/2 E2/2. -/2 E2/2. -/2 E2/2. -/2 E2/2. -/2 E2/2. -/2 E3/2. E3/2. E3/1 D3/1 C3/1 B2/1 A#1/2';
  const b2 = '-/2 A1/4 G1/4 F#1/4 F#2/4 F#1/4 B1/2 C2/2 B1/4 E2/2';
  const b3 = '-/2 E2/2. -/2 E2/2. -/2 D2/2. -/2 D2/2. -/2 C2/2. -/2 B1/2. -/2 E2/2. B1/2. E2/2.';
  const bB = `-/2 ${rep('B1/2. -/2', 7)} B1/2.`;
  const h1 = '-/2 E4+G4+B4/2 E4+A4+C5/2 D#4+F#4+A4/2 C#4+E4+G4/2 D4+F4+G#4/4 C#4+E4+G4/4 C4+D#4+F#4/4 B3+E4+G4/2 C4+E4+A4/2 B3+E4+G4/2 -/4';
  const h2 = '-/2 C4+E4+G4/2 C4+D#4+F#4/2 D#4+F#4+A4/2 E4+G4+B4/2 C#4+E4+G4+A#4/4 D4+F#4+G#4+B4/4 C#4+E4+F#4+A#4/4 B3+D#4+F#4/10';
  const h3 = '-/2 C#4+E4+G4+A#4/8 B3+D4+F#4/8 A3+C4+E4/4 A3+B3+D#4+F#4/4 E4+G4+B4/6';
  return {
    bpm: 72, era: 'nes', intro: ['I'], form: ['A', 'B', 'A'],
    fx: { echo: { steps: 3, feedback: 0.3, mix: 0.18 } },
    voices: [
      { wave: 'pulse25', vol: 0.045, env: 'bell', transpose: 12, vib: false, parts: { A: [p1, p2, p1, p3].join(' | '), B: melB } },
      { wave: 'square', vol: 0.014, env: 'pluck', parts: { A: [p1, p2, p1, p3].join(' | ') } },
      { wave: 'square', vol: 0.012, env: 'pad', poly: true, filter: 1800, fx: 0.6, parts: { A: [h1, h2, h1, h3].join(' | '), B: 'A3+B3+D#4+F#4/32 | A3+B3+D#4+F#4/32' } },
      { wave: 'triangle', vol: 0.1, fx: 0, parts: { I: `${rep('E2/2. -/2', 8)} -/2`, A: [b1, b2, b1, b3].join(' | '), B: `${bB} | ${bB}` } },
      { wave: 'noise', vol: 0.02, fx: 0.4, parts: { A: rep('-/6 h/1? -/9', 8), B: rep('-/14 h/2?', 4) } },
    ],
  };
})();

// ---------- Secreto 2: la Segunda Misión ----------

// Escribir un nombre libre (como la pantalla de registro de 1986): letras, BORRAR y ENTER.
class NesNombre {
  constructor(el, prompt, onDone) {
    Object.assign(this, { el, prompt, onDone, buf: '', done: false });
    this.render();
  }
  key(e) {
    if (this.done || e.repeat) return;
    if (e.key === 'Escape') { this.finish(''); return; }
    if (e.key === 'Backspace') { this.buf = this.buf.slice(0, -1); Sfx.move(); this.render(); return; }
    // Solo ENTER confirma: la Z también cuenta como "aceptar" en el juego, ¡y aquí hace falta para ZELDA!
    if (e.key === 'Enter') { if (this.buf) this.finish(this.buf); return; }
    if (e.key.length !== 1 || !/[a-zñáéíóú]/i.test(e.key)) return;
    if (this.buf.length >= 8) { Sfx.error(); return; } // como en el juego: máximo 8 letras
    this.buf += upper(e.key);
    Sfx.key();
    this.render();
  }
  finish(name) {
    this.done = true;
    Sfx.confirm();
    this.onDone(name);
  }
  render() {
    const slots = [...this.buf.padEnd(8, '_')].map((c) => esc(c)).join(' ');
    this.el.innerHTML = `<div class="tb-text">${esc(this.prompt)}</div><div class="nn-name">${slots}</div><div class="nn-keys">ENTER listo · BORRAR corrige · ESC nada</div>`;
  }
}

function nesPideNombre(prompt) {
  const town = Game.scene;
  return new Promise((done) => { town.ui = new NesNombre(town.showBox('REGISTRO'), prompt, done); });
}

async function nesRegistro(ctx) {
  await ctx.say([
    '* Un libro viejo sobre un atril:\n* "REGISTRO DE AVENTUREROS".',
    '* En la primera página alguien escribió un nombre y lo borró.\n* Solo se alcanza a leer la primera letra: una Z.',
  ]);
  if (await ctx.choose(['escribir', 'dejar']) === 1) return;
  const name = await nesPideNombre('* ¿Cómo te llamas, aventurero?');
  if (!name) return;
  if (upper(name) !== 'ZELDA') {
    await ctx.say([`* Escribes ${name} en el libro...`, '* La tinta brilla un momento y se borra sola.\n* Parece que el libro esperaba OTRO nombre.']);
    return;
  }
  Sfx.secret();
  await ctx.say([
    '* Escribes ZELDA en el libro...',
    '* ¡Las páginas se voltean solas!\n* Allá abajo, la mazmorra hace CRAC.',
    '* ¡La SEGUNDA MISIÓN! Misma mazmorra, pero remezclada:\n* todas las puertas cerradas y frases más largas.',
  ]);
  if (await ctx.choose(['entrar', 'luego']) === 1) return;
  Sfx.warp();
  Game.go('mazmorra', { enemyId: 'mazmorra', back: 'town', second: true });
}

// Lo que js/scenes/mazmorra.js usa cuando run.second está prendido.
const MZ2_TIME = 0.8;
const MZ2_INTRO = [
  '* ¡La mazmorra cambió de color! Esto es la SEGUNDA MISIÓN.',
  '* Ahora TODAS las puertas tienen cerradura, las frases son más largas\n* y hay menos tiempo. La espada de madera ya no sirve.',
  '* Si nos vence, volvemos al castillo y lo intentamos otra vez.',
];
const MZ2_DOOR_PHRASES = ['La puerta se abre sin hacer ruido.', 'Giro la llave, despacio, hacia la izquierda.',
  'Esta mazmorra no es la misma de antes.', 'Bit ilumina la cerradura oxidada.', 'Toco tres veces y espero.'];
const MZ2_KEY_PHRASES = ['La segunda misión es mucho más difícil.', 'Las mazmorras cambiaron de forma.',
  'Escribí un nombre secreto en el libro.', 'Los enemigos pegan más fuerte que antes.', 'El cofre dorado guarda una llave vieja.',
  'Nadie había bajado hasta aquí desde 1986.', 'Hay una pared falsa en algún cuarto.', 'Mi espada de madera ya no corta nada.',
  'Las antorchas se apagan, una por una.', 'Bit encuentra el camino en la oscuridad.'];
// Premio del fondo: un triángulo dorado (dibujo NES).
const MZ2_PRIZE = [
  '.......KK.......',
  '......KWYK......',
  '.....KWYYYK.....',
  '....KWYYYYOK....',
  '...KWYYYYYYOK...',
  '...KKKKKKKKKK...',
  '..KWYK....KWYK..',
  '.KWYYYK..KWYYYK.',
  '.KYYYYOKKYYYYYOK',
  'KKKKKKKKKKKKKKKK',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
];

// Al fondo de la Segunda Misión: el premio y el secreto.
function mz2Prize(scene) {
  scene.mode = 'win';
  scene.noPause = true;
  scene.playMusic('victory');
  scene.musicId = null;
  const d = Save.data;
  const pages = ['* Detrás de la puerta triple no ronca nadie.\n* En medio del cuarto brilla un triángulo dorado.', '* ¡Terminaste la SEGUNDA MISIÓN!'];
  if (!d.flags.nesZelda2) {
    d.flags.nesZelda2 = true;
    const ups = addXp(40);
    pages.push(`* Ganaste 40 XP.${ups ? `\n* ¡SUBISTE A NIVEL ${d.level}!` : ''}`);
    Save.write();
  }
  scene.say(pages, () => findSecret('nes_zelda').then(() => { scene.run = null; if (Game.scene === scene) Game.go(scene.back); }), 'BIT');
}

// ---------- Secreto 3: nube y arbusto ----------

async function nesArbustoHabla(ctx) {
  const town = Game.scene;
  const me = town.npcs && town.npcs.find((n) => n.id === 'arbusto_parlante');
  const paint = (sprite) => { if (me) { me.sprite = sprite; town.repaint(me); } };
  await ctx.say(['* Un arbusto verde y esponjoso.\n* ...Se movió. Los arbustos no se mueven.']);
  await ctx.say(['* Shhh... no se lo digas a nadie.\n* En realidad soy una NUBE.'], 'ARBUSTO');
  paint('nube_parlante');
  Sfx.secret();
  await ctx.say(['* ¡¿Ves?! Mismo dibujo, otra paleta.\n* Así ahorraban memoria en el cartucho.'], 'ARBUSTO');
  paint('arbusto_parlante');
  await ctx.say(['* ...Ya. Otra vez de arbusto.\n* Allá arriba está mi gemela. Ella sí puede volar.'], 'ARBUSTO');
  await findSecret('nes_nube');
}

// ---------- Dónde están (se agregan a las zonas de js/worlds/nes-mapa.js) ----------

const NES_PATIO = MAPS['nes-patio'];
NES_PATIO.npcs.push(
  // El ladrillo junto a las dos tuberías de arriba (la "Zona Warp" del patio).
  { id: 'pared_rara', sprite: 'nes_ladrillo_raro', x: 23, y: 4, talk: nesParedRara },
  // El arbusto justo debajo de la nube del medio.
  { id: 'arbusto_parlante', sprite: 'arbusto_parlante', x: 11, y: 4, talk: nesArbustoHabla },
);
NES_PATIO.bitTips.push('* Esas dos tuberías pegadas a la pared de arriba...\n* me recuerdan el final del Mundo 1-2.');

const NES_CASTILLO2 = MAPS['nes-castillo2'];
NES_CASTILLO2.npcs.push({ id: 'registro', sprite: 'atril', x: 5, y: 12, talk: nesRegistro });
NES_CASTILLO2.bitTips.push('* Ese libro de registro... En un juego de 1986,\n* el nombre que escribías al empezar importaba MUCHO.');

// ---------- Tarjetas de los secretos ----------

addCuriosities({
  secreto_nes_menos1: {
    console: 'nes',
    title: 'El Mundo -1',
    caption: 'En Super Mario Bros. (1985), si atravesabas la pared al final del 1-2, una tubería te llevaba al MUNDO -1: un nivel de agua que se repite sin fin. Para el juego es el mundo 36, pero ese número sale como un espacio en blanco: " -1".',
    draw(g, w, h) {
      const C = NES10;
      const p = pixelArt(g, w, h, 64, 40, '#2038ec');
      // Barra de arriba: MUNDO  -1 (con su espacio en blanco).
      p.r(0, 0, 64, 7, C.K);
      p.rows(20, 1, ['x...x.x.x', 'xx.xx.x.x', 'x.x.x.x.x', 'x...x.x.x', 'x...x..x.'], { x: C.W });
      p.r(34, 1, 4, 5, '#3c3c3c'); // el "espacio" que en realidad es el 36
      p.rows(40, 1, ['....x', '...xx', 'xx..x', '....x', '...xxx'], { x: C.W });
      // Olas, fondo de coral, la tubería de salida y una flecha que regresa al inicio.
      for (let x = 0; x < 64; x += 6) p.r(x, 9, 4, 1, C.W);
      p.r(0, 34, 64, 6, C.G).r(0, 34, 64, 1, C.L);
      p.r(54, 24, 10, 10, C.K).r(55, 25, 9, 8, C.G).r(53, 23, 3, 12, C.K).r(54, 24, 2, 10, C.L);
      p.r(8, 16, 44, 1, C.Y).r(8, 14, 1, 5, C.Y).r(7, 15, 1, 3, C.Y);
      p.rows(26, 20, ['..rrrr..', '.rwkrrr.', 'rrrrrrrr', '.wwrrrr.', '..wwww..'], { r: C.R, w: C.W, k: C.K });
      p.rows(10, 22, ['.w.', 'w.w', '.w.'], { w: C.W }).rows(44, 18, ['.w.', 'w.w', '.w.'], { w: C.W });
    },
  },
  secreto_nes_zelda: {
    console: 'nes',
    title: 'La Segunda Misión',
    caption: 'En The Legend of Zelda (1986), si escribías ZELDA como nombre de tu archivo, empezabas directo la Segunda Misión: mazmorras en otros lugares y con otras formas, y enemigos más duros. Normalmente se abría al terminar el juego.',
    draw(g, w, h) {
      const C = NES10;
      const p = pixelArt(g, w, h, 64, 40, C.K);
      // Pantalla de registro: REGISTER YOUR NAME... con ZELDA escrito.
      p.round(8, 4, 48, 32, C.K, C.W);
      const L = {
        Z: ['xxxx', '..x.', '.x..', 'x...', 'xxxx'],
        E: ['xxxx', 'x...', 'xxx.', 'x...', 'xxxx'],
        D: ['xxx.', 'x..x', 'x..x', 'x..x', 'xxx.'],
        A: ['.xx.', 'x..x', 'xxxx', 'x..x', 'x..x'],
      };
      L.L = ['x...', 'x...', 'x...', 'x...', 'xxxx'];
      [...'ZELDA'].forEach((ch, i) => p.rows(14 + i * 7, 10, L[ch], { x: C.W }));
      p.r(14, 16, 33, 1, C.Z);
      // Corazón y triángulo dorado.
      p.rows(14, 22, ['.x.x.', 'xxxxx', 'xxxxx', '.xxx.', '..x..'], { x: C.F });
      p.rows(34, 21, ['...yy...', '..yyyy..', '.yyyyyy.', 'yyyyyyyy', '.y....y.', 'yyy..yyy'], { y: C.Y });
      p.rows(44, 28, ['xxx', '..x', 'xxx', 'x..', 'xxx'], { x: C.W });
    },
  },
  secreto_nes_nube: {
    console: 'nes',
    title: 'Nube y arbusto',
    caption: 'En Super Mario Bros. (1985) las nubes y los arbustos están hechos con las mismas piezas de dibujo: solo cambia la paleta de colores. Así ahorraban memoria del cartucho. Lo contaron Miyamoto e Iwata en "Iwata Pregunta".',
    draw(g, w, h) {
      const C = NES10;
      const p = pixelArt(g, w, h, 64, 40, C.S);
      // La misma figura dos veces: arriba blanca (nube), abajo verde (arbusto).
      const puff = SPRITES.nes_arbusto;
      p.rows(8, 4, puff, { a: C.W, b: C.W, c: '#a4e4fc', d: C.K });
      p.rows(40, 20, puff, { a: C.L, b: C.L, c: C.G, d: C.K });
      p.r(0, 34, 64, 6, C.R).r(0, 34, 64, 1, C.P);
      // Flecha: es la misma.
      p.rows(28, 14, ['x....', '.x...', '..x.x', '...xx', '..xxx'], { x: C.Y });
    },
  },
});
