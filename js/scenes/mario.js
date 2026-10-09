// MUNDO 1-1 — homenaje al primer nivel de Super Mario Bros. (NES, 1985).
// Mario avanza mientras escribes. Cada obstáculo tiene su palabra:
//   tubería / hoyo -> salta    Goomba / Koopa -> písalo (antes de que te alcance)
//   bloque ? -> golpéalo (moneda o súper hongo)    bandera -> fin del nivel
// Las palabras con mayúscula (Mario, Goomba...) se escriben con SHIFT.

const NES = {
  R: '#d82800', B: '#887000', S: '#fca044', K: '#000000', W: '#fcfcfc', O: '#c84c0c',
  Y: '#f8b800', G: '#00a800', L: '#b8f818', T: '#fcbcb0', D: '#7c7c7c', U: '#5c94fc',
};
const MT = 32; // tamaño de casilla en pantalla (16 px x 2)

const MARIO_SPR = {
  stand: [
    '...RRRRR....',
    '..RRRRRRRRR.',
    '..BBBSSBS...',
    '.BSBSSSBSSS.',
    '.BSBBSSSBSSS',
    '.BBSSSSBBBB.',
    '...SSSSSSS..',
    '..BBRBBB....',
    '.BBBRBBRBBB.',
    'BBBBRRRRBBBB',
    'SSBRSRRSRBSS',
    'SSSRRRRRRSSS',
    'SSRRRRRRRRSS',
    '..RRR..RRR..',
    '.BBB....BBB.',
    'BBBB....BBBB',
  ],
  walk: [
    '...RRRRR....',
    '..RRRRRRRRR.',
    '..BBBSSBS...',
    '.BSBSSSBSSS.',
    '.BSBBSSSBSSS',
    '.BBSSSSBBBB.',
    '...SSSSSSS..',
    '..BBBBRB....',
    '.BBBBRRBB...',
    '.BBBRRSRRS..',
    '.BBBRRRRRR..',
    '..RRRRRRRR..',
    '..RRR.RRRR..',
    '.BBB..RRR...',
    '.BBBB.BBB...',
    '......BBBB..',
  ],
};
// Súper Mario: el mismo dibujo con el cuerpo estirado al doble.
const bigOf = (rows) => rows.slice(0, 7).concat(rows.slice(7).flatMap((r) => [r, r]));
MARIO_SPR.bigStand = bigOf(MARIO_SPR.stand);
MARIO_SPR.bigWalk = bigOf(MARIO_SPR.walk);

const GOOMBA_SPR = [
  '......OOOO......',
  '.....OOOOOO.....',
  '....OOOOOOOO....',
  '...OKKOOOOKKO...',
  '..OOOWKOOKWOOO..',
  '.OOOOWKOOKWOOOO.',
  '.OOOOWWOOWWOOOO.',
  'OOOOOOOOOOOOOOOO',
  'OOOOOOOOOOOOOOOO',
  '.OOOOTTTTTTOOOO.',
  '....TTTTTTTT....',
  '....TTTTTTTT....',
  '..KKTTTTTTTTKK..',
  '.KKKKTTTTTKKKK..',
  '.KKKKK....KKKKK.',
  '..KKK......KKK..',
];
const KOOPA_SPR = [
  '..........SS....',
  '.........SSSS...',
  '.........SWKS...',
  '.........SSSS...',
  '....GGGG.SSS....',
  '...GLGGLGSS.....',
  '..GLLGGLLGS.....',
  '..GGGGGGGG......',
  '.GLLGGGLLGG.....',
  '.GGGGGGGGGG.....',
  '.WWWWWWWWWW.....',
  '..SSS..SSS......',
  '.SSSS..SSSS.....',
  '................',
  '................',
  '................',
];
const QBLOCK = [
  '.OOOOOOOOOOOOOO.',
  'OYYYYYYYYYYYYYYK',
  'OYKYYYYYYYYYYKYK',
  'OYYYYOOOOOYYYYYK',
  'OYYYOOKKKOOYYYYK',
  'OYYYOOKYYOOKYYYK',
  'OYYYYKKYYOOKYYYK',
  'OYYYYYYYOOKKYYYK',
  'OYYYYYYOOKKYYYYK',
  'OYYYYYYOOKYYYYYK',
  'OYYYYYYYKKYYYYYK',
  'OYYYYYYOOYYYYYYK',
  'OYYYYYYOOKYYYYYK',
  'OYKYYYYYKKYYYKYK',
  'OYYYYYYYYYYYYYYK',
  'KKKKKKKKKKKKKKKK',
];
const MUSHROOM_SPR = [
  '......RRRR......',
  '....RRRWWRRR....',
  '...RRRWWWWRRR...',
  '..RWWRRWWRRWWR..',
  '.RWWWWRRRRWWWWR.',
  '.RWWWWRRRRWWWWR.',
  'RRWWRRRRRRRRWWRR',
  'RRRRRRRRRRRRRRRR',
  '.RRRTTTTTTTTRRR.',
  '...TTKTTTTKTT...',
  '...TTKTTTTKTT...',
  '...TTTTTTTTTT...',
  '....TTTTTTTT....',
  '................',
  '................',
  '................',
];

// ---------- El nivel (versión compacta del 1-1) ----------
// x en casillas. h = altura sobre el piso, en casillas.
const L11 = {
  width: 162,
  gaps: [[62, 63], [78, 80], [125, 126]],
  pipes: [{ x: 22, h: 2 }, { x: 32, h: 3 }, { x: 40, h: 4 }, { x: 50, h: 4 }],
  stairs: [
    { x: 104, n: 4, dir: 'up' }, { x: 110, n: 4, dir: 'down' },
    { x: 120, n: 4, dir: 'up', extra: 1 }, { x: 127, n: 4, dir: 'down' },
    { x: 140, n: 8, dir: 'up', extra: 1 },
  ],
  // y = fila de la pantalla (el piso empieza en la fila 13)
  blocks: [
    { x: 12, y: 9, t: 'q', c: 'coin' },
    { x: 16, y: 9, t: 'b' }, { x: 17, y: 9, t: 'q', c: 'mushroom' }, { x: 18, y: 9, t: 'b' },
    { x: 19, y: 9, t: 'q', c: 'coin' }, { x: 20, y: 9, t: 'b' }, { x: 18, y: 5, t: 'q', deco: true },
    { x: 70, y: 9, t: 'b' }, { x: 71, y: 9, t: 'q', c: 'coin' }, { x: 72, y: 9, t: 'b' },
    ...[73, 74, 75, 76, 77, 78, 79, 80].map((x) => ({ x, y: 5, t: 'b' })),
    { x: 86, y: 9, t: 'q', c: 'coin' }, { x: 90, y: 9, t: 'b' }, { x: 91, y: 9, t: 'b' },
    { x: 94, y: 9, t: 'q', c: 'coin' }, { x: 97, y: 9, t: 'q', c: 'coin' }, { x: 97, y: 5, t: 'q', deco: true },
  ],
  enemies: [
    { x: 27, t: 'goomba' }, { x: 45, t: 'goomba' }, { x: 55, t: 'goomba' }, { x: 57, t: 'goomba' },
    { x: 68, t: 'goomba' }, { x: 84, t: 'goomba' }, { x: 92.5, t: 'goomba' }, { x: 100, t: 'koopa' },
    { x: 116, t: 'goomba' }, { x: 134, t: 'goomba' },
  ],
  flag: 152,
  castle: 156,
  checkpoint: 70,
  clouds: [[9, 2], [19, 1], [28, 2], [37, 1], [57, 2], [67, 1], [76, 2], [85, 1], [105, 2], [115, 1], [124, 2], [133, 1], [153, 2]],
  hills: [[0, 2], [16, 1], [48, 2], [64, 1], [96, 2], [112, 1], [144, 2]],
  bushes: [[11, 3], [23, 1], [41, 2], [59, 3], [71, 1], [89, 2], [107, 3], [119, 1], [137, 2]],
};

const WALK_WORDS = ['hongo', 'moneda', 'tubo', 'salto', 'estrella', 'castillo', 'ladrillo', 'bloque', 'nube', 'arbusto',
  'colina', 'corre', 'mundo', 'nivel', 'vida', 'fuego', 'tortuga', 'princesa', 'planta', 'cielo', 'reino', 'puntos'];
const NAME_WORDS = ['Mario', 'Luigi', 'Peach', 'Toad', 'Bowser', 'Yoshi'];
const JUMP_WORDS = ['salta', 'brinca', 'arriba', 'vuela'];

function terrainH(x) {
  const c = Math.floor(x);
  if (L11.gaps.some(([a, b]) => c >= a && c <= b)) return -99;
  let h = 0;
  L11.pipes.forEach((p) => { if (c >= p.x && c <= p.x + 1) h = Math.max(h, p.h); });
  L11.stairs.forEach((s) => {
    const i = c - s.x;
    if (i >= 0 && i < s.n) h = Math.max(h, s.dir === 'up' ? i + 1 : s.n - i);
    if (s.extra && i >= s.n && i < s.n + s.extra) h = Math.max(h, s.n);
  });
  return h;
}

// Arma la lista de "pasos" del nivel: palabras para caminar y palabras de acción.
function buildBeats() {
  const ev = [];
  L11.pipes.forEach((p) => ev.push({ type: 'jump', x0: p.x - 1.3, x1: p.x + 2.3, word: rand(JUMP_WORDS) }));
  L11.gaps.forEach(([a, b]) => ev.push({ type: 'jump', x0: a - 1.1, x1: b + 1.2, word: rand(JUMP_WORDS) }));
  L11.blocks.forEach((b, i) => { if (b.t === 'q' && !b.deco) ev.push({ type: 'block', x0: b.x, x1: b.x, block: i, word: b.c === 'mushroom' ? 'hongo' : 'moneda' }); });
  L11.enemies.forEach((e, i) => ev.push({ type: 'stomp', x0: e.x - 2.5, x1: e.x, enemy: i, word: e.t === 'koopa' ? 'Koopa' : 'Goomba' }));
  ev.push({ type: 'flag', x0: 148.2, x1: L11.flag, word: 'bandera' });
  ev.sort((a, b) => a.x0 - b.x0);
  const out = [];
  let x = 2;
  ev.forEach((e) => {
    const dist = e.x0 - x;
    const n = Math.max(dist > 0.6 ? 1 : 0, Math.round(dist / 6));
    for (let i = 0; i < n; i++) {
      out.push({ type: 'walk', x1: x + (dist * (i + 1)) / n, word: Math.random() < 0.25 ? rand(NAME_WORDS) : rand(WALK_WORDS) });
    }
    out.push(e);
    x = e.type === 'stomp' || e.type === 'block' ? e.x0 : e.x1;
  });
  return out;
}

// Las mayúsculas sí importan aquí (para practicar SHIFT); los acentos no.
function nesMatch(expected, typed) {
  if (expected !== expected.toLowerCase()) return typed === expected || norm(typed) === norm(expected) && typed !== typed.toLowerCase();
  return keyMatches(expected, typed);
}

function paintNes(g, rows, x, y, scale = 2, flip = false) {
  rows.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === '.' || !NES[ch]) continue;
      g.fillStyle = NES[ch];
      const cx = flip ? row.length - 1 - c : c;
      g.fillRect(Math.round(x + cx * scale), Math.round(y + r * scale), scale, scale);
    }
  });
}

Scenes.mario = {
  enter({ back = 'map' }) {
    this.back = back;
    document.body.className = 'theme-nes';
    Game.root.innerHTML = `
      <div class="smb">
        <canvas class="smb-cv" width="640" height="480"></canvas>
        <div class="smb-hud">
          <div>MARIO<br><span class="h-score">000000</span></div>
          <div><span class="coin-i"></span>×<span class="h-coins">00</span></div>
          <div>MUNDO<br>1-1</div>
          <div>TIEMPO<br><span class="h-time">400</span></div>
        </div>
        <div class="smb-type"><div class="st-hint"></div><div class="st-word"></div><div class="st-next"></div></div>
        <div class="smb-card hidden"></div>
      </div>`;
    this.cv = $('.smb-cv');
    this.g = this.cv.getContext('2d');
    this.lives = 3;
    this.score = 0;
    this.coins = 0;
    this.st = { chars: 0, errors: 0, ms: 0 };
    this.startedAt = 0;
    this.used = {};   // bloques ? ya golpeados
    this.killed = {}; // enemigos ya pisados
    this.passedCheckpoint = false;
    this.resetFrom(0);
    this.titleCard();
  },

  exit() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    clearTimeout(this.cardT);
    clearInterval(this.fwIv);
  },

  // ---------- Estado ----------

  resetFrom(checkpointX) {
    this.beats = buildBeats();
    this.bi = this.beats.findIndex((b) => b.type !== 'walk' && b.x0 >= checkpointX);
    while (this.bi > 0 && this.beats[this.bi - 1].type === 'walk') this.bi--;
    const startX = checkpointX ? checkpointX - 1 : 2;
    Object.assign(this, {
      mx: startX, my: 0, tx: startX, face: 1, anim: null, big: false, inv: 0, pos: 0,
      time: 400, timeAcc: 0, hurry: false, phase: 'card', pops: [], fx: [], queue: [], hidden: false, flagY: undefined,
    });
    this.enemies = L11.enemies.map((e, i) => ({ ...e, alive: e.x > startX + 1 && !this.killed[i], squash: 0 }));
    this.beatStart();
  },

  get beat() { return this.beats[this.bi]; },

  titleCard() {
    this.phase = 'card';
    Music.stop();
    const card = $('.smb-card');
    card.classList.remove('hidden');
    card.innerHTML = `<div>MUNDO 1-1</div><div class="card-mario"><canvas width="24" height="32"></canvas> × ${this.lives}</div>`;
    paintNes($('.card-mario canvas').getContext('2d'), MARIO_SPR.stand, 0, 0, 2);
    this.cardT = setTimeout(() => {
      card.classList.add('hidden');
      this.phase = 'play';
      if (!this.startedAt) this.startedAt = performance.now();
      Music.play(this.hurry ? 'nes11_hurry' : 'nes11');
      this.running = true;
      this.last = performance.now();
      this.raf = requestAnimationFrame((t) => this.loop(t));
      this.renderWord();
    }, 2000);
  },

  beatStart() {
    const b = this.beat;
    if (!b) return;
    this.pos = 0;
    this.errAt = -1;
    if (b.type === 'walk') b.x0 = this.tx;
    if (b.type === 'stomp') b.armed = false;
    this.renderWord();
  },

  renderWord() {
    const b = this.beat;
    if (!b) return;
    const hints = { walk: '', jump: '▲ ¡SALTA!', block: '? ¡GOLPEA EL BLOQUE!', stomp: '▼ ¡PISALO!', flag: '⚑ ¡LA BANDERA!' };
    $('.st-hint').textContent = hints[b.type];
    $('.st-word').innerHTML = [...b.word].map((c, i) =>
      `<span class="${i < this.pos ? 'ok' : i === this.pos ? `nx${this.errAt === i ? ' bad' : ''}` : ''}">${esc(c)}</span>`).join('');
    $('.st-next').textContent = this.beats.slice(this.bi + 1, this.bi + 3).map((x) => x.word).join('  ');
  },

  // ---------- Tecleo ----------

  onKey(e) {
    if (this.phase === 'over') { this.menu.key(e); return; }
    if (e.key === 'Escape') { Game.go(this.back); return; }
    if (this.phase !== 'play' || e.repeat || e.key.length !== 1) return;
    const b = this.beat;
    if (!b) return;
    const expected = b.word[this.pos];
    if (!nesMatch(expected, e.key)) {
      Stats.record(expected, false);
      this.st.errors++;
      this.errAt = this.pos;
      Sfx.error();
      this.renderWord();
      return;
    }
    Stats.record(expected, true);
    this.st.chars++;
    this.pos++;
    this.errAt = -1;
    Sfx.key();
    if (b.type === 'walk') this.tx = Math.max(this.tx, b.x0 + (b.x1 - b.x0) * (this.pos / b.word.length));
    if (this.pos >= b.word.length) this.complete(b);
    else this.renderWord();
  },

  complete(b) {
    if (b.type === 'jump') this.queueAnim({ kind: 'jump', x1: b.x1 });
    if (b.type === 'block') this.queueAnim({ kind: 'bump', block: b.block });
    if (b.type === 'stomp') {
      const en = this.enemies[b.enemy];
      if (en.alive) this.queueAnim({ kind: 'stomp', enemy: b.enemy });
    }
    if (b.type === 'flag') { this.queueAnim({ kind: 'flag' }); this.phase = 'finish'; }
    this.bi++;
    this.beatStart();
  },

  queueAnim(a) {
    this.queue = this.queue || [];
    this.queue.push(a);
  },

  // ---------- Bucle ----------

  loop(ts) {
    if (!this.running) return;
    const dt = Math.max(0, Math.min(50, ts - this.last)) / 1000;
    this.last = ts;
    this.update(dt);
    this.draw();
    this.raf = requestAnimationFrame((t) => this.loop(t));
  },

  update(dt) {
    if (this.phase === 'play' || this.phase === 'finish') this.tickTime(dt);
    if (this.inv > 0) this.inv -= dt;
    this.pops = this.pops.filter((p) => (p.t += dt) < p.life);

    // Animaciones especiales (saltar, golpear bloque, pisar, bandera).
    if (!this.anim && this.queue && this.queue.length && Math.abs(this.tx - this.mx) < 0.05) this.startAnim(this.queue.shift());
    if (this.anim) { this.stepAnim(dt); }
    else if (this.phase !== 'dying') {
      // Caminar hacia donde lo llevan las letras.
      const d = this.tx - this.mx;
      this.walking = Math.abs(d) > 0.02;
      if (this.walking) this.mx += Math.sign(d) * Math.min(Math.abs(d), 7 * dt);
      const ground = terrainH(this.mx + 0.5);
      this.my += (Math.max(0, ground) - this.my) * Math.min(1, dt * 18);
    }

    // Enemigo que se acerca cuando te toca pisarlo.
    const b = this.beat;
    if (this.phase === 'play' && b && b.type === 'stomp' && !this.anim && Math.abs(this.tx - this.mx) < 0.05) {
      const en = this.enemies[b.enemy];
      if (!en.alive) { this.bi++; this.beatStart(); return; }
      if (!b.armed) { b.armed = true; b.speed = (en.x - (this.mx + 1)) / (1.6 + b.word.length * 0.45); }
      en.x -= b.speed * dt;
      if (en.x <= this.mx + 0.8) this.hurt(b.enemy);
    }
    this.enemies.forEach((en) => { if (en.squash) en.squash += dt; });
  },

  tickTime(dt) {
    if (this.phase === 'finish') return;
    this.timeAcc += dt;
    while (this.timeAcc >= 0.5) {
      this.timeAcc -= 0.5;
      this.time--;
      if (this.time === 100 && !this.hurry) {
        this.hurry = true;
        Sfx.secret();
        Music.play('nes11_hurry');
        this.pops.push({ text: '¡APÚRATE!', x: this.mx, y: 6, t: 0, life: 2 });
      }
      if (this.time <= 0) { this.time = 0; this.die(); return; }
    }
    $('.h-time').textContent = String(this.time).padStart(3, '0');
  },

  startAnim(a) {
    a.t = 0;
    a.x0 = this.mx;
    a.y0 = this.my;
    if (a.kind === 'jump') {
      a.dur = 0.6;
      a.y1 = Math.max(0, terrainH(a.x1 + 0.5));
      let peak = Math.max(a.y0, a.y1);
      for (let x = Math.floor(a.x0); x <= Math.ceil(a.x1); x++) peak = Math.max(peak, terrainH(x));
      a.peak = peak + 1.6;
      Sfx.jump();
    } else if (a.kind === 'bump') {
      a.dur = 0.45;
      Sfx.jump();
    } else if (a.kind === 'stomp') {
      const en = this.enemies[a.enemy];
      a.x1 = en.x;
      a.dur = 0.4;
      a.y1 = 0;
      a.peak = 2;
      Sfx.jump();
    } else if (a.kind === 'flag') {
      a.dur = 99;
      a.stage = 'leap';
      Sfx.jump();
    }
    this.anim = a;
  },

  stepAnim(dt) {
    const a = this.anim;
    if (a.kind === 'death') return;
    a.t += dt;
    const k = Math.min(1, a.t / a.dur);
    if (a.kind === 'jump' || a.kind === 'stomp') {
      this.mx = a.x0 + (a.x1 - a.x0) * k;
      // Parábola que pasa por el punto más alto.
      const line = a.y0 + (a.y1 - a.y0) * k;
      this.my = line + (a.peak - (a.y0 + a.y1) / 2) * 4 * k * (1 - k);
      if (k >= 1) {
        this.my = a.y1;
        this.tx = this.mx;
        if (a.kind === 'stomp') {
          const en = this.enemies[a.enemy];
          en.alive = false;
          en.squash = 0.01;
          this.killed[a.enemy] = true;
          Sfx.stomp();
          this.addScore(100, en.x, 1.5);
        }
        this.anim = null;
      }
    } else if (a.kind === 'bump') {
      const blk = L11.blocks[a.block];
      // Brinca justo lo necesario para que su cabeza toque la parte de abajo del bloque.
      const hop = Math.max(0.5, (12 - blk.y) - (this.big ? 2 : 1) - a.y0);
      this.my = a.y0 + Math.sin(Math.PI * k) * hop;
      if (!a.hit && k >= 0.5) {
        a.hit = true;
        this.used[a.block] = true;
        Sfx.bump();
        if (blk.c === 'mushroom') {
          this.fx.push({ kind: 'mush', x: blk.x, row: blk.y, t: 0 });
          setTimeout(() => { this.big = true; Sfx.powerup(); this.addScore(1000, this.mx, 3); }, 500);
        } else {
          this.coins++;
          $('.h-coins').textContent = String(this.coins).padStart(2, '0');
          Sfx.coin();
          this.fx.push({ kind: 'coin', x: blk.x, row: blk.y, t: 0 });
          this.addScore(200, blk.x, 13 - blk.y + 1);
        }
      }
      if (k >= 1) { this.my = a.y0; this.anim = null; }
    } else if (a.kind === 'flag') {
      this.flagStep(a, dt);
    }
  },

  addScore(n, x, y) {
    this.score += n;
    $('.h-score').textContent = String(this.score).padStart(6, '0');
    this.pops.push({ text: String(n), x, y, t: 0, life: 0.9 });
  },

  hurt(enemyIndex) {
    const en = this.enemies[enemyIndex];
    if (this.inv > 0) return;
    if (this.big) {
      this.big = false;
      this.inv = 1.5;
      Sfx.hurt();
      en.alive = false; // se va de largo
      this.killed[enemyIndex] = true;
      this.pops.push({ text: '¡AY!', x: this.mx, y: 3, t: 0, life: 1 });
      this.bi++;
      this.beatStart();
      return;
    }
    this.die();
  },

  die() {
    if (this.phase === 'dying') return;
    this.phase = 'dying';
    Music.stop();
    Sfx.die();
    this.anim = null;
    this.queue = [];
    const y0 = this.my;
    let t = 0;
    this.anim = { kind: 'death', t: 0 };
    // Clásico: brinca hacia arriba y cae fuera de la pantalla.
    const step = () => {
      t += 1 / 60;
      this.my = y0 + 3 * Math.sin(Math.min(t, 0.5) * Math.PI) - Math.max(0, t - 0.5) * 18;
      if (t < 1.6 && this.phase === 'dying') setTimeout(step, 16);
    };
    step();
    this.cardT = setTimeout(() => {
      this.anim = null;
      this.lives--;
      this.running = false;
      cancelAnimationFrame(this.raf);
      if (this.lives <= 0) { this.gameOver(); return; }
      this.resetFrom(this.passedCheckpoint ? L11.checkpoint : 0);
      this.titleCard();
    }, 2600);
  },

  // ---------- Bandera y castillo ----------

  flagStep(a, dt) {
    if (a.stage === 'leap') {
      const k = Math.min(1, a.t / 0.7);
      a.x0s = a.x0s === undefined ? this.mx : a.x0s;
      a.y0s = a.y0s === undefined ? this.my : a.y0s;
      a.grab = a.grab || Math.max(1, Math.min(8, a.y0s + 2));
      this.mx = a.x0s + (L11.flag - 0.6 - a.x0s) * k;
      this.my = a.y0s + (a.grab - a.y0s) * k + 2 * Math.sin(Math.PI * k);
      if (k >= 1) {
        a.stage = 'slide';
        a.t = 0;
        this.flagY = 9;
        Music.stop();
        Sfx.flag();
        // Puntos según la velocidad de todo el nivel, como la altura en la bandera.
        const minutes = (performance.now() - this.startedAt) / 60000;
        this.wpm = Math.round((this.st.chars / 5) / Math.max(minutes, 0.01));
        const pts = this.wpm >= 40 ? 5000 : this.wpm >= 30 ? 2000 : this.wpm >= 20 ? 800 : this.wpm >= 10 ? 400 : 100;
        this.addScore(pts, L11.flag + 0.5, a.grab + 1);
      }
    } else if (a.stage === 'slide') {
      this.my = Math.max(1, this.my - dt * 6);
      this.flagY = Math.max(0.6, (this.flagY || 9) - dt * 7);
      if (this.my <= 1 && this.flagY <= 0.6) { a.stage = 'walk'; a.t = 0; this.face = 1; Music.play('victory'); }
    } else if (a.stage === 'walk') {
      this.walking = true;
      this.mx += dt * 3.5;
      this.my = Math.max(0, this.my - dt * 6);
      if (this.mx >= L11.castle + 2) { a.stage = 'bonus'; a.t = 0; this.hidden = true; }
    } else if (a.stage === 'bonus') {
      // El tiempo que sobra se vuelve puntos.
      if (this.time > 0) {
        const n = Math.min(this.time, Math.ceil(dt * 120));
        this.time -= n;
        this.score += n * 50;
        $('.h-time').textContent = String(this.time).padStart(3, '0');
        $('.h-score').textContent = String(this.score).padStart(6, '0');
        if (Math.random() < 0.5) Sfx.text();
      } else {
        a.stage = 'fireworks';
        a.t = 0;
        // Dato real del 1-1: si el último dígito del tiempo al tocar la bandera es 1, 3 o 6, hay fuegos artificiales.
        const digit = this.flagTime % 10;
        a.fw = [1, 3, 6].includes(digit) ? digit : 0;
        a.fired = 0;
      }
    } else if (a.stage === 'fireworks') {
      if (a.fired < a.fw && a.t > 0.5 * (a.fired + 1)) {
        a.fired++;
        this.fx.push({ kind: 'fw', x: L11.castle + 1 + Math.random() * 4 - 2, y: 9 + Math.random() * 2, t: 0 });
        this.addScore(500, L11.castle + 1, 10);
        Sfx.firework();
      }
      if (a.t > 0.5 * (a.fw + 1) + 0.8) { a.stage = 'done'; this.finishLevel(a.fw); }
    }
  },

  finishLevel(fireworks) {
    this.running = false;
    const d = Save.data;
    const typed = this.st.chars + this.st.errors;
    const acc = typed ? Math.round((this.st.chars / typed) * 100) : 100;
    const isRecord = Stats.addBattle({ enemy: 'mario11', wpm: this.wpm, acc, date: Date.now() });
    const ups = addXp(ENEMIES.mario11.xp);
    const best = (d.arcade.mario11 || 0);
    if (this.score > best) d.arcade.mario11 = this.score;
    const lines = [
      '¡NIVEL COMPLETADO!',
      `Puntos: ${this.score}${this.score > best ? ' ¡RECORD!' : ''}`,
      `Monedas: ${this.coins} · Velocidad: ${this.wpm} PPM · Precisión: ${acc}%`,
    ];
    if (fireworks) lines.push(`¡${fireworks} fuegos artificiales! (Tiempo terminado en ${fireworks})`);
    if (isRecord && d.stats.battles.length > 1) lines.push(`¡NUEVO RECORD DE VELOCIDAD!`);
    if (ups) lines.push(`¡Subiste a nivel ${d.level}!`);
    if (!d.done.mario11) {
      d.done.mario11 = true;
      d.treasures.superhongo = true;
      lines.push('Recibiste: SÚPER HONGO (vitrina)');
    }
    lines.push('Gracias, Mario... ¡pero tu consola está en otro castillo!');
    Save.write();
    this.showEnd(lines);
  },

  gameOver() {
    Sfx.lose();
    Save.write();
    this.showEnd(['GAME OVER', '¡No te rindas! Mario siempre lo vuelve a intentar.']);
  },

  showEnd(lines) {
    this.phase = 'over';
    const card = $('.smb-card');
    card.classList.remove('hidden');
    card.innerHTML = `${lines.map((l) => `<div>${esc(l)}</div>`).join('')}<div class="smb-menu"></div>`;
    this.menu = new ListMenu($('.smb-menu'), [{ label: 'Otra vez' }, { label: 'Salir' }], {
      cols: 2,
      onPick: (i) => (i === 0 ? Game.go('mario', { back: this.back }) : Game.go(this.back)),
    });
  },

  // ---------- Dibujo ----------

  draw() {
    const g = this.g;
    if (this.mx > L11.checkpoint) this.passedCheckpoint = true;
    const cam = Math.max(0, Math.min(L11.width - 20, this.mx - 7)) * MT;
    this.cam = cam;
    g.fillStyle = NES.U;
    g.fillRect(0, 0, 640, 480);
    const X = (x) => x * MT - cam;
    const Y = (row) => row * MT;
    const vis = (x, w = 1) => X(x) > -w * MT && X(x) < 640;

    // Fondo: colinas, nubes y arbustos (que tienen la misma forma, como en el original).
    L11.hills.forEach(([x, s]) => { if (vis(x, 6)) this.hill(X(x), s); });
    L11.clouds.forEach(([x, w]) => { if (vis(x, 4)) this.puff(X(x), Y(2 + (x % 2)), w, NES.W); });
    L11.bushes.forEach(([x, w]) => { if (vis(x, 4)) this.puff(X(x), Y(12) + 4, w, NES.L, NES.G); });

    // Piso.
    for (let x = Math.floor(cam / MT); x < Math.floor(cam / MT) + 21; x++) {
      if (terrainH(x) === -99 || x >= L11.width) continue;
      this.groundTile(X(x), Y(13));
      this.groundTile(X(x), Y(14));
    }
    // Escaleras.
    L11.stairs.forEach((s) => {
      for (let i = 0; i < s.n + (s.extra || 0); i++) {
        const h = i < s.n ? (s.dir === 'up' ? i + 1 : s.n - i) : s.n;
        for (let j = 1; j <= h; j++) if (vis(s.x + i)) this.hardTile(X(s.x + i), Y(13 - j));
      }
    });
    // Tuberías.
    L11.pipes.forEach((p) => { if (vis(p.x, 2)) this.pipe(X(p.x), Y(13 - p.h), p.h); });
    // Bloques.
    L11.blocks.forEach((b, i) => {
      if (!vis(b.x)) return;
      let off = 0;
      if (this.anim && this.anim.kind === 'bump' && this.anim.block === i) off = -Math.sin(Math.PI * Math.min(1, this.anim.t / this.anim.dur)) * 8;
      if (b.t === 'b') this.brickTile(X(b.x), Y(b.y) + off);
      else if (this.used[i]) this.usedTile(X(b.x), Y(b.y) + off);
      else paintNes(g, QBLOCK, X(b.x), Y(b.y) + off);
    });
    // Bandera y castillo.
    this.flagpole(X(L11.flag), this.flagY === undefined ? 9 : this.flagY);
    this.castle(X(L11.castle));

    // Efectos: monedas, hongo, fuegos artificiales.
    const now = performance.now();
    this.fx = this.fx.filter((f) => {
      f.t = ((now - (f.born || (f.born = now))) / 1000);
      if (f.kind === 'coin') {
        if (f.t > 0.6) return false;
        g.fillStyle = NES.Y;
        g.fillRect(X(f.x) + 10, Y(f.row - 1) - f.t * 160 + f.t * f.t * 200, 12, 24);
        return true;
      }
      if (f.kind === 'mush') {
        if (f.t > 0.6) return false;
        paintNes(g, MUSHROOM_SPR, X(f.x), Y(f.row) - Math.min(f.t, 0.4) * 80);
        return true;
      }
      if (f.kind === 'fw') {
        if (f.t > 0.6) return false;
        g.fillStyle = [NES.W, NES.Y, NES.R][Math.floor(f.t * 10) % 3];
        for (let i = 0; i < 12; i++) {
          const ang = (i / 12) * Math.PI * 2;
          g.fillRect(X(f.x) + Math.cos(ang) * f.t * 120, Y(f.y) + Math.sin(ang) * f.t * 120, 6, 6);
        }
        return true;
      }
      return false;
    });

    // Enemigos.
    const frame = Math.floor(performance.now() / 250) % 2;
    this.enemies.forEach((en) => {
      if (!vis(en.x)) return;
      if (en.alive) {
        if (en.t === 'koopa') paintNes(g, KOOPA_SPR, X(en.x), Y(12) - 16, 2, frame === 1);
        else paintNes(g, GOOMBA_SPR, X(en.x), Y(12), 2, frame === 1);
      } else if (en.squash && en.squash < 0.5) {
        g.save();
        g.translate(X(en.x), Y(12) + 24);
        g.scale(1, 0.3);
        paintNes(g, en.t === 'koopa' ? KOOPA_SPR : GOOMBA_SPR, 0, 0);
        g.restore();
      }
    });

    // Mario (parpadea si es invencible).
    if (!this.hidden && !(this.inv > 0 && Math.floor(this.inv * 10) % 2)) {
      const walkFrame = this.walking && Math.floor(performance.now() / 110) % 2;
      const rows = this.big ? (walkFrame ? MARIO_SPR.bigWalk : MARIO_SPR.bigStand) : (walkFrame ? MARIO_SPR.walk : MARIO_SPR.stand);
      const h = rows.length * 2;
      paintNes(g, rows, X(this.mx) + 4, Y(13) - this.my * MT - h, 2, this.face < 0);
    }

    // Números de puntos.
    g.font = '12px "Press Start 2P", monospace';
    g.fillStyle = NES.W;
    this.pops.forEach((p) => g.fillText(p.text, X(p.x), Y(13 - p.y) - p.t * 30));
  },

  groundTile(x, y) {
    const g = this.g;
    g.fillStyle = NES.O;
    g.fillRect(x, y, MT, MT);
    g.fillStyle = NES.T;
    g.fillRect(x, y, MT, 2);
    g.fillRect(x, y, 2, MT);
    g.fillStyle = NES.K;
    g.fillRect(x, y + MT - 2, MT, 2);
    g.fillRect(x + MT - 2, y, 2, MT);
    g.fillRect(x + 18, y + 2, 2, 14);
    g.fillRect(x + 2, y + 16, 16, 2);
  },

  brickTile(x, y) {
    const g = this.g;
    g.fillStyle = NES.O;
    g.fillRect(x, y, MT, MT);
    g.fillStyle = NES.K;
    for (let r = 0; r < 4; r++) {
      g.fillRect(x, y + r * 8 + 6, MT, 2);
      const off = r % 2 ? 0 : 16;
      g.fillRect(x + off, y + r * 8, 2, 6);
    }
    g.fillStyle = NES.T;
    g.fillRect(x, y, MT, 2);
  },

  usedTile(x, y) {
    const g = this.g;
    g.fillStyle = NES.O;
    g.fillRect(x, y, MT, MT);
    g.fillStyle = NES.K;
    g.strokeStyle = NES.K;
    g.lineWidth = 2;
    g.strokeRect(x + 1, y + 1, MT - 2, MT - 2);
    [[4, 4], [24, 4], [4, 24], [24, 24]].forEach(([a, b]) => g.fillRect(x + a, y + b, 4, 4));
  },

  hardTile(x, y) {
    const g = this.g;
    g.fillStyle = NES.O;
    g.fillRect(x, y, MT, MT);
    g.fillStyle = NES.T;
    g.fillRect(x, y, MT, 4);
    g.fillRect(x, y, 4, MT);
    g.fillStyle = NES.K;
    g.fillRect(x, y + MT - 4, MT, 4);
    g.fillRect(x + MT - 4, y, 4, MT);
  },

  pipe(x, y, h) {
    const g = this.g;
    const bodyH = h * MT - MT / 2;
    g.fillStyle = NES.K;
    g.fillRect(x + 2, y + MT / 2, MT * 2 - 4, bodyH);
    g.fillStyle = NES.G;
    g.fillRect(x + 4, y + MT / 2, MT * 2 - 8, bodyH);
    g.fillStyle = NES.L;
    g.fillRect(x + 10, y + MT / 2, 6, bodyH);
    g.fillStyle = NES.K;
    g.fillRect(x - 2, y, MT * 2 + 4, MT / 2 + 2);
    g.fillStyle = NES.G;
    g.fillRect(x, y + 2, MT * 2, MT / 2 - 2);
    g.fillStyle = NES.L;
    g.fillRect(x + 6, y + 2, 6, MT / 2 - 2);
  },

  puff(x, y, w, fill, line) {
    const g = this.g;
    g.fillStyle = line || NES.K;
    for (let i = 0; i < w; i++) {
      g.beginPath();
      g.arc(x + 24 + i * 28, y + 14, 18, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = fill;
    for (let i = 0; i < w; i++) {
      g.beginPath();
      g.arc(x + 24 + i * 28, y + 14, 15, 0, Math.PI * 2);
      g.fill();
    }
  },

  hill(x, s) {
    const g = this.g;
    const h = s === 2 ? 76 : 44;
    const w = s === 2 ? 160 : 96;
    g.fillStyle = NES.K;
    g.beginPath();
    g.ellipse(x + w / 2, 416, w / 2 + 2, h + 2, 0, Math.PI, 0);
    g.fill();
    g.fillStyle = NES.G;
    g.beginPath();
    g.ellipse(x + w / 2, 416, w / 2, h, 0, Math.PI, 0);
    g.fill();
    g.fillStyle = NES.K;
    g.fillRect(x + w / 2 - 10, 416 - h + 22, 4, 10);
    g.fillRect(x + w / 2 + 8, 416 - h + 22, 4, 10);
  },

  flagpole(x, flagY) {
    const g = this.g;
    g.fillStyle = NES.G;
    g.fillRect(x + 14, 416 - 10 * MT, 4, 10 * MT - MT);
    g.fillStyle = NES.L;
    g.beginPath();
    g.arc(x + 16, 416 - 10 * MT, 7, 0, Math.PI * 2);
    g.fill();
    this.hardTile(x, 416 - MT);
    // La bandera baja junto con Mario.
    const fy = 416 - MT - flagY * MT;
    g.fillStyle = NES.W;
    g.beginPath();
    g.moveTo(x + 14, fy);
    g.lineTo(x - 18, fy + 14);
    g.lineTo(x + 14, fy + 28);
    g.fill();
    g.fillStyle = NES.G;
    g.fillRect(x - 2, fy + 10, 8, 8);
  },

  castle(x) {
    const g = this.g;
    const base = 416;
    const brick = (bx, by, w, h) => {
      g.fillStyle = NES.O;
      g.fillRect(bx, by, w, h);
      g.fillStyle = NES.K;
      for (let r = 0; r < h; r += 8) g.fillRect(bx, by + r + 6, w, 2);
    };
    brick(x, base - 3 * MT, 5 * MT, 3 * MT);
    brick(x + MT, base - 5 * MT, 3 * MT, 2 * MT);
    for (let i = 0; i < 5; i++) brick(x + i * MT + 4, base - 3 * MT - 16, 24, 16);
    for (let i = 0; i < 3; i++) brick(x + MT + i * MT + 4, base - 5 * MT - 16, 24, 16);
    g.fillStyle = NES.K;
    g.fillRect(x + 2 * MT, base - 2 * MT, MT, 2 * MT);
    g.beginPath();
    g.arc(x + 2.5 * MT, base - 2 * MT, MT / 2, Math.PI, 0);
    g.fill();
    g.fillRect(x + 1.5 * MT, base - 4.5 * MT, 12, 20);
    g.fillRect(x + 3.1 * MT, base - 4.5 * MT, 12, 20);
  },
};

// Guarda el tiempo exacto al tocar la bandera (para los fuegos artificiales).
Object.defineProperty(Scenes.mario, 'phase', {
  get() { return this._phase; },
  set(v) {
    if (v === 'finish' && this._phase !== 'finish') this.flagTime = this.time;
    this._phase = v;
  },
});

// Versiones de 4 tonos para el mapa y la vitrina.
SPRITES.mario = MARIO_SPR.stand.map((r) => `..${r}..`.replace(/R/g, 'c').replace(/B/g, 'd').replace(/S/g, 'b'));
SPRITES.superhongo = MUSHROOM_SPR.map((r) => r.replace(/R/g, 'c').replace(/W/g, 'a').replace(/T/g, 'b').replace(/K/g, 'd'));
