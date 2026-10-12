// JEFE — LORD CAPARAZON (guiño a Super Mario Bros., NES 1985). Castillo 3. Rescata la NES.
// "Plataformas al ritmo": una fila de bloques sobre la lava y un METRONOMO. Sobre el siguiente
// bloque aparece una palabra: si la terminas antes de que se acaben sus tiempos, saltas; si no,
// caes a la lava (-5 HP) y vuelves a intentarlo. Tras 6 bloques llegas al HACHA del puente:
// "cortas la cuerda del puente" (PERFECTO = más daño) o una acción de PAZ.
// Fases según su HP: 120 BPM (palabras cortas) → 135 BPM (con mayúscula) → 150 BPM "trabado"
// (palabras repetidas y franjas moradas). La acción "Pausa" lo destraba y quita la fase 3.
//
// Simplificación: los tiempos de cada palabra se cuentan en tiempos del metrónomo (mínimo un
// compás de 4), alargándose si la palabra es larga: 0.55 s + 0.36 s por letra, justo para ~30 PPM
// (con más margen nadie caía a la lava y el jefe no hacía nada).

const CAP_BLOCKS = 6;
const CAP_HP = 160;
const CAP_AXE_PHRASE = 'cortas la cuerda del puente';
const CAP_W1 = ['salto', 'fuego', 'llama', 'calor', 'lava', 'puente', 'hacha', 'rey', 'torre', 'bloque', 'nube', 'paso', 'brinco', 'salta', 'sol', 'fuerte'];
const CAP_W2 = ['Martillo', 'Corona', 'Castillo', 'Puente', 'Hacha', 'Cuerda', 'Bandera', 'Princesa', 'Tortuga', 'Escudo', 'Rey', 'Lava'];
const CAP_PHASES = [{ bpm: 120, track: 'caparazon1' }, { bpm: 135, track: 'caparazon2' }, { bpm: 150, track: 'caparazon3' }];
const CAP_ACTS = [
  { name: 'Reverencia', text: 'haces una reverencia al rey', mercy: 30, reply: '* "¡Por fin alguien con modales! ¡BIENVENIDO A MI CAST—!"\n* ...Se volvió a trabar.' },
  { name: 'Hijos', text: 'le preguntas por sus hijos', mercy: 30, reply: '* "¡Tengo muchos! Y todos gritan."\n* Lord Caparazón sonríe un poquito.' },
  { name: 'Pausa', text: 'pulsas pausa para que descanse', mercy: 50, unstick: true, reply: '* ...\n* "¿Pausa? ¿Se puede? ...Gracias."\n* ¡Las franjas moradas desaparecen!' },
];
const CAP_STUCK = ['¡BIENVENIDO A MI CASTILLO!', '¡BIENVENIDO A MI CASTI—', '¡BIENVENIDO!', '¡BIEN- BIEN- BIENVENIDO!'];
// Bloques flotantes (x, altura sobre la lava) y el puente con el hacha.
const CAP_BLOCK_H = [20, 60, 30, 80, 40, 60];
const capBlockX = (i) => 160 + i * 100;
const capBlockY = (i) => 210 - CAP_BLOCK_H[i];
const CAP_BRIDGE = { x0: 760, x1: 960, y: 200 };

// Tiempos del metrónomo que dura una palabra: mínimo 4 (un compás), de 2 en 2.
function capBeatsFor(word, bpm) {
  const beatSec = 60 / bpm;
  const need = ((0.55 + word.length * 0.36) * diff().time) / beatSec;
  return Math.max(4, 2 * Math.ceil(need / 2));
}
// Fase según el HP del jefe (0, 1 o 2). Si ya se destrabó, nunca llega a la 3.
function capPhase(hp, unstuck) {
  if (hp > CAP_HP * (2 / 3)) return 0;
  if (hp > CAP_HP / 3 || unstuck) return 1;
  return 2;
}
function capWord(phase) {
  if (phase === 0) return rand(CAP_W1);
  if (phase === 1) return rand(CAP_W2);
  const w = rand(CAP_W1);
  return `${w} ${w}`; // trabado: todo dos veces
}

Scenes.caparazon = nesScene({
  enter({ enemyId = 'caparazon', back = 'map' } = {}) {
    Object.assign(this, { id: enemyId, back, backParams: undefined });
    this.mount('cap-scene', '<div class="cp-hud"></div>');
    Object.assign(this, {
      hpMax: playerMaxHp(), boss: CAP_HP, mercy: 0, unstuck: false, phase: 0, acts: CAP_ACTS.slice(),
      pos: -1, clock: 0, cur: null, anim: null, bridge: 1, bossFall: 0, mode: 'intro', endMenu: null, pauseMenu: null,
      bubble: CAP_STUCK[0], bubbleT: 0,
    });
    this.hp = this.hpMax;
    this.playMusic('caparazon1');
    this.renderHud();
    this.say([
      '* "¡BIENVENIDO A MI CASTILLO! ¡BIENVENIDO A MI CASTI—\n* ¡BIENVENIDO!"',
      '* Lord Caparazón está TRABADO: repite lo mismo como disco rayado.',
    ], () => this.say([
      '* ¡Mira el puente! Si llegamos al HACHA...',
      '* Salta los bloques AL COMPAS: cada bloque tiene su palabra.\n* Termínala antes de que se acaben los tiempos del metrónomo. ¡Arriba a la izquierda!',
    ], () => this.startRun(), 'BIT'), 'LORD CAPARAZON');
  },

  get bpm() { return CAP_PHASES[this.phase].bpm; },
  get beatSec() { return 60 / this.bpm; },

  renderHud() {
    const hud = $('.cp-hud');
    if (!hud) return;
    hud.innerHTML = `${nesBar('HP', this.hp, this.hpMax)}${nesBar('REY', this.boss, CAP_HP, 'enemy')}${nesBar('PAZ', this.mercy, 100, 'mercy')}<span>${this.bpm} BPM</span>`;
  },

  startRun() {
    this.mode = 'run';
    this.pos = -1;
    this.bridge = 1;
    this.bossFall = 0;
    this.panel.innerHTML = '<div class="nesx-word"></div>';
    this.word = new NesWord($('.nesx-word', this.panel), this.tally);
    this.newWord();
  },

  newWord() {
    if (this.mode !== 'run') return;
    const word = capWord(this.phase);
    const startBeat = Math.floor(this.clock / this.beatSec) + 1;
    const beats = capBeatsFor(word, this.bpm);
    this.cur = { word, deadline: (startBeat + beats) * this.beatSec, beats };
    this.word.set(word, `▲ ¡SALTA AL BLOQUE ${this.pos + 2}/${CAP_BLOCKS}!`);
  },

  actionKey(k) {
    if (this.mode !== 'run' || !this.cur || this.anim) return;
    if (this.word.key(k) === 'done') this.jump();
  },

  heroAt(pos) {
    if (pos < 0) return [60, 210];
    if (pos >= CAP_BLOCKS) return [CAP_BRIDGE.x0 + 20, CAP_BRIDGE.y];
    return [capBlockX(pos) + 20, capBlockY(pos)];
  },

  jump() {
    this.cur = null;
    Sfx.jump();
    this.word.set('', '');
    this.anim = { kind: 'jump', t: 0, dur: 0.35, from: this.heroAt(this.pos), to: this.heroAt(this.pos + 1) };
  },

  fall() {
    this.cur = null;
    this.word.set('', '');
    Sfx.hurt();
    const [x, y] = this.heroAt(this.pos);
    this.anim = { kind: 'fall', t: 0, dur: 0.7, from: [x, y], to: [x + 50, 300] };
    this.hp = Math.max(0, this.hp - scaledDmg(5));
    this.pop('¡A LA LAVA!', x, y - 40, NES.F);
    this.renderHud();
  },

  landed(a) {
    this.anim = null;
    if (a.kind === 'jump') {
      this.pos++;
      if (this.pos >= CAP_BLOCKS) { this.atAxe(); return; }
      this.newWord();
      return;
    }
    // Se cayó: vuelve al bloque donde estaba (si le queda HP).
    if (this.hp <= 0) {
      this.mode = 'over';
      Music.stop();
      Sfx.lose();
      this.after(0.6, () => Game.go('gameover', { enemyId: this.id, back: this.back, scene: 'caparazon' }));
      return;
    }
    this.blinkT = 0.8;
    this.newWord();
  },

  // ---------- El hacha del puente ----------

  atAxe() {
    this.mode = 'axe';
    Sfx.secret();
    const options = [CAP_AXE_PHRASE, ...this.acts.map((a) => a.text)];
    this.bubble = rand(CAP_STUCK);
    this.choose(options, (i, info) => (i === 0 ? this.axe(info) : this.act(this.acts[i - 1])),
      '¡EL HACHA! Escribe una opción (sin errores = más daño):');
  },

  axe({ errors }) {
    const perfect = errors === 0;
    const dmg = perfect ? 50 : 30;
    this.mode = 'collapse';
    this.collapseT = 0;
    this.pendingDmg = { dmg, perfect };
    if (perfect) Sfx.crit(); else Sfx.hit();
    this.pop(perfect ? `¡PERFECTO! -${dmg}` : `-${dmg}`, CAP_BRIDGE.x0 + 100, 120, NES.Y);
  },

  afterCollapse() {
    const { dmg } = this.pendingDmg;
    this.boss = Math.max(0, this.boss - dmg);
    this.renderHud();
    if (this.boss <= 0) { this.win(false); return; }
    const before = this.phase;
    this.phase = capPhase(this.boss, this.unstuck);
    const pages = ['* ¡SPLASH! Lord Caparazón "se moja" en la lava...\n* ...y sale de un brinco, empapado y enojado.'];
    if (this.phase !== before) {
      this.playMusic(CAP_PHASES[this.phase].track);
      if (this.phase === 1) pages.push('* "¡GRRR! ¡AHORA CON MARTILLOS!"\n* (Fase 2: más rápido, y las palabras llevan MAYUSCULA.)');
      if (this.phase === 2) pages.push('* ¡Lord Caparazón se TRABA! Franjas moradas cruzan su caparazón...', '* "¡BIENVENIDO BIENVENIDO BIENVENIDO!"\n* (Fase 3: las palabras se repiten dos veces.)');
    }
    this.renderHud();
    this.say(pages, () => {
      if (this.phase === 2 && before !== 2) this.say(['* Está trabado como un juego sin pausa...\n* ¿Y si le das una PAUSA?'], () => this.startRun(), 'BIT');
      else this.startRun();
    });
  },

  act(a) {
    this.acts = this.acts.filter((x) => x !== a);
    this.mercy = Math.min(100, this.mercy + a.mercy);
    Sfx.mercy();
    const pages = [a.reply];
    if (a.unstick) {
      this.unstuck = true;
      const before = this.phase;
      this.phase = capPhase(this.boss, true);
      if (this.phase !== before) this.playMusic(CAP_PHASES[this.phase].track);
    }
    this.renderHud();
    this.say(pages, () => {
      if (this.mercy >= 100) { this.win(true); return; }
      this.say(['* "¡BIENVENIDO... otra vez!" El puente se arma de nuevo.'], () => this.startRun());
    });
  },

  win(spared) {
    this.mode = 'win';
    this.noPause = true;
    this.unstuck = true;
    this.playMusic('victory');
    this.musicId = null;
    const first = spared
      ? '* Lord Caparazón respira hondo.\n* Por primera vez en años... no repite nada.'
      : '* ¡SPLASH! Lord Caparazón sale de la lava...\n* ...y ya no está trabado.';
    this.say([first], () => this.say([
      '* "Una sombra morada entró por la pantalla.\n* Me dijo que si nadie apaga la consola, el juego nunca termina..."',
      '* "...y me gustó la idea.\n* Hasta que no pude dejar de repetir el nivel."',
    ], () => this.say([
      '* ¿Una sombra MORADA?\n* ...Entonces el apagón NO fue un accidente.',
    ], () => this.rescue(spared), 'BIT'), 'LORD CAPARAZON'));
  },

  rescue(spared) {
    const d = Save.data;
    const pages = this.finish(spared);
    d.consoles.nes = true;
    Save.write();
    Quests.complete('mundo_nes');
    pages.push('* ¡¡RESCATASTE LA NES!!\n* Ya brilla en tu vitrina.');
    if (WORLDS.some((w) => w.requires === 'nes')) pages.push('* A lo lejos, algo retumbó en el pueblo...\n* ¿Será en la Plaza de las Tuberías?');
    pages.push('* (Pssst... Don Chip, en el pueblo, querrá verla.)');
    this.say(pages, () => Game.go(this.back));
  },

  // ---------- Bucle y dibujo ----------

  update(dt) {
    const prevBeat = Math.floor(this.clock / this.beatSec);
    this.clock += dt;
    if (Math.floor(this.clock / this.beatSec) !== prevBeat) this.beatFlash = 0.12;
    this.beatFlash = Math.max(0, (this.beatFlash || 0) - dt);
    this.blinkT = Math.max(0, (this.blinkT || 0) - dt);
    this.bubbleT += dt;
    if (this.bubbleT > 2.5) { this.bubbleT = 0; this.bubble = rand(CAP_STUCK); }
    if (this.anim) {
      const a = this.anim;
      a.t += dt;
      if (a.t >= a.dur) this.landed(a);
    }
    if (this.mode === 'run' && this.cur && !this.anim && this.clock >= this.cur.deadline) this.fall();
    if (this.mode === 'collapse') {
      this.collapseT += dt;
      this.bridge = Math.max(0, 1 - this.collapseT / 0.8);
      this.bossFall = Math.max(0, this.collapseT - 0.5);
      if (this.collapseT >= 1.6) { this.mode = 'splash'; this.afterCollapse(); }
    }
  },

  heroPos() {
    const a = this.anim;
    if (!a) return this.heroAt(Math.min(this.pos, CAP_BLOCKS));
    const k = Math.min(1, a.t / a.dur);
    const x = a.from[0] + (a.to[0] - a.from[0]) * k;
    if (a.kind === 'jump') return [x, a.from[1] + (a.to[1] - a.from[1]) * k - Math.sin(Math.PI * k) * 50];
    return [x, a.from[1] - Math.sin(Math.PI * Math.min(k, 0.3) / 0.6) * 30 + Math.max(0, k - 0.2) * 160];
  },

  draw(dt) {
    const g = this.g;
    const [hx, hy] = this.heroPos();
    const cam = Math.max(0, Math.min(1000 - 640, hx - 220));
    const X = (x) => Math.round(x - cam);
    const t = performance.now() / 1000;
    g.fillStyle = NES.K;
    g.fillRect(0, 0, 640, 300);
    // Techo del castillo.
    g.fillStyle = NES.D;
    for (let x = -(cam % 32); x < 640; x += 32) { g.fillRect(x, 0, 30, 14); g.fillRect(x + 16, 16, 30, 14); }
    // Lava.
    g.fillStyle = NES.O;
    g.fillRect(0, 262, 640, 38);
    g.fillStyle = NES.Y;
    for (let x = -(cam % 24); x < 640; x += 24) g.fillRect(x + Math.sin(t * 3 + x) * 3, 262 + Math.sin(t * 4 + x / 20) * 3, 12, 4);
    // Plataforma de inicio y bloques.
    this.bricks(X(20), 210, 80, 52);
    for (let i = 0; i < CAP_BLOCKS; i++) this.bricks(X(capBlockX(i)), capBlockY(i), 40, 24);
    // Puente (se cae de derecha a izquierda) y hacha.
    const tiles = 10;
    for (let i = 0; i < tiles; i++) {
      const fallen = i >= Math.ceil(tiles * this.bridge);
      const by = CAP_BRIDGE.y + (fallen ? (this.mode === 'collapse' ? this.collapseT * 200 : 300) : 0);
      if (by > 300) continue;
      g.fillStyle = NES.O;
      g.fillRect(X(CAP_BRIDGE.x0 + i * 20), by, 18, 10);
      g.fillStyle = NES.Y;
      g.fillRect(X(CAP_BRIDGE.x0 + i * 20), by, 18, 3);
    }
    g.fillStyle = NES.D;
    g.fillRect(X(CAP_BRIDGE.x1 + 10), 140, 4, 60);
    g.fillStyle = NES.W;
    g.fillRect(X(CAP_BRIDGE.x1 + 2), 140, 20, 14);
    // Lord Caparazón (con franjas moradas cuando está trabado).
    const bx = X(CAP_BRIDGE.x0 + 90);
    const by = CAP_BRIDGE.y - 64 + this.bossFall * this.bossFall * 300 + Math.sin(t * 3) * 2;
    if (by < 300) {
      paintNes(this.g, NES_ART.caparazon, bx, by, 4);
      if (this.phase === 2 && !this.unstuck) {
        g.fillStyle = NES.M;
        for (let i = 0; i < 4; i++) if ((Math.floor(t * 12) + i) % 3) g.fillRect(bx - 6, by + 8 + i * 15 + ((t * 40) % 6), 76, 3);
      }
      if (this.mode === 'run' || this.mode === 'axe') {
        g.font = '8px "Press Start 2P", TQSym, monospace';
        g.fillStyle = NES.W;
        g.textAlign = 'center';
        g.fillText(this.bubble, bx + 32, by - 10);
        g.textAlign = 'left';
      }
    }
    // Palabra sobre el siguiente bloque.
    if (this.cur && this.mode === 'run' && !this.anim) {
      const [nx, ny] = this.heroAt(this.pos + 1);
      this.label(this.cur.word, X(nx), ny - 16, { pos: this.word.pos, active: true });
    }
    // Héroe.
    if (!(this.blinkT > 0 && Math.floor(this.blinkT * 12) % 2)) paintTones(g, 'heroe', X(hx) - 16, hy - 32, 2);
    // Metrónomo: 4 tiempos y los que quedan para la palabra.
    const beat = Math.floor(this.clock / this.beatSec);
    for (let i = 0; i < 4; i++) {
      g.fillStyle = i === beat % 4 ? (this.beatFlash > 0 ? NES.W : NES.Y) : NES.D;
      g.fillRect(16 + i * 22, 38, 16, 16);
    }
    if (this.cur && this.mode === 'run') {
      const left = Math.max(0, Math.ceil((this.cur.deadline - this.clock) / this.beatSec));
      g.font = '10px "Press Start 2P", TQSym, monospace';
      g.fillStyle = left <= 2 ? NES.F : NES.W;
      g.fillText(`${'♪'.repeat(Math.min(left, 12))}`, 16, 72);
    }
    this.drawPops(dt);
  },

  bricks(x, y, w, h) {
    const g = this.g;
    g.fillStyle = NES.O;
    g.fillRect(x, y, w, h);
    g.fillStyle = NES.K;
    for (let r = 0; r < h; r += 8) {
      g.fillRect(x, y + r + 6, w, 2);
      for (let c = (r / 8) % 2 ? 0 : 10; c < w; c += 20) g.fillRect(x + c, y + r, 2, 6);
    }
    g.fillStyle = NES.T;
    g.fillRect(x, y, w, 2);
  },
});
