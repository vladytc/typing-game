// MINIJEFE A — KONGO TAMBOR (guiño a Donkey Kong, arcade 1981). Castillo 1.
// "Subir las vigas": cada barril trae una palabra con MAYUSCULA inicial. Si la escribes antes de
// que te alcance, lo saltas y subes un escalón; si te alcanza, pierdes HP y bajas uno.
// Hay cuatro barriles: el normal (café); el de FUEGO (rojo, con llamita: su palabra va TODA EN
// MAYÚSCULAS); el AZUL, que baja por la escalera (más rápido, palabra corta); y el PARTIDO, que al
// saltarlo se divide y suelta otra palabrita de inmediato (dos saltos seguidos).
// Son 2 subidas (desde la 2.ª, los barriles traen DOS palabras). Arriba está el MARTILLO
// (2 martillazos lo hacen huir)... o puedes hacerte su amigo (PAZ: dos ACTUAR completos la llenan).
// Si fallas arriba, hay otra ronda. Dura ~1.5-2 min a 80 PPM.
// Con { endless: true } es el minijuego BARRILES del arcade: vigas infinitas y récord de vigas.

const KONGO_PER_BEAM = 2; // barriles por viga (el lore pide 5; con 2 y barriles variados la pelea dura ~2 minutos)
const KONGO_BEAMS = 4;    // vigas que hay que subir para llegar al martillo
const KONGO_HITS = 2;     // martillazos para que Kongo huya (uno por subida)
const KONGO_W1 = ['Barril', 'Viga', 'Martillo', 'Kongo', 'Tambor', 'Plátano', 'Corbata', 'Gorila', 'Selva',
  'Escalera', 'Torre', 'Ritmo', 'Salto', 'Bum', 'Mono', 'Rueda'];
const KONGO_W2 = ['Barril Rodante', 'Viga Roja', 'Gran Salto', 'Bum Bum', 'Tambor Loco', 'Torre Alta',
  'Kongo Ruge', 'Barril Veloz', 'Mono Feliz', 'Viga Alta', 'Selva Negra', 'Rueda Rueda'];
// Barril de fuego: TODO en mayúsculas (SHIFT en cada letra; por eso le toca más tiempo).
const KONGO_FIRE1 = ['LAVA', 'FUEGO', 'LLAMA', 'BRASA', 'CHISPA', 'HUMO'];
const KONGO_FIRE2 = ['LAVA ROJA', 'FUEGO VIVO', 'GRAN LLAMA', 'CHISPA LOCA', 'MUCHO HUMO', 'BRASA ROJA'];
// Barril azul: baja por la escalera, va más rápido y su palabra es corta.
const KONGO_BLUE1 = ['Ola', 'Mar', 'Azul', 'Gota', 'Lago', 'Nube', 'Hielo'];
const KONGO_BLUE2 = ['Mar Azul', 'Ola Ola', 'Ola Azul', 'Nube Azul', 'Lago Azul', 'Ya Voy'];
// La mitad que sale del barril partido: una sola palabrita (es medio barril).
const KONGO_HALF = ['Bum', 'Pum', 'Zas', 'Uy', 'Ay', 'Plaf', 'Toc'];
const KONGO_SPECIALS = ['fuego', 'azul', 'partido'];
// Barriles de una subida (2 por viga × 4 vigas = 8): mitad normales, uno de cada especial y otro especial al azar.
const KONGO_DECK = ['normal', 'normal', 'normal', 'normal', ...KONGO_SPECIALS];
// Tiempo de cada tipo respecto al normal (las mayúsculas del fuego ya cuentan en kongoBarrelTime; el azul corre).
const KONGO_KIND_TIME = { normal: 1, fuego: 1, azul: 0.8, partido: 1 };
const KONGO_HINTS = {
  normal: '▲ ¡SALTA EL BARRIL!', partido: '▲ ¡SALTA EL BARRIL!',
  fuego: '▲ ¡FUEGO! TODO EN MAYÚSCULAS', azul: '▼ ¡AZUL! ¡BAJA RAPIDÍSIMO!',
};
const KONGO_DROP = 0.25; // parte del tiempo que el barril azul pasa bajando por la escalera
const KONGO_ACTS = [
  { name: 'Tambor', text: 'tocas el tambor con él', mercy: 50, reply: '* ¡BUM BUM BUM! Kongo te sigue el ritmo.\n* "¿Quién dijo que los gorilas no saben de ritmo?"' },
  { name: 'Plátano', text: 'le das un plátano amarillo', mercy: 50, reply: '* Kongo pela el plátano con mucha elegancia.\n* "Gracias. Es mi color favorito."' },
  { name: 'Corbata', text: 'le acomodas la corbata', mercy: 50, reply: '* "Mi primo salió en un juego en 1981.\n* ¡Yo nací en 1985 y ya tengo corbata!"' },
];

// Altura de la viga b en la posición x (las vigas van inclinadas, en zigzag).
const kongoBeamY = (b, x) => 272 - b * 52 + ((b % 2 === 0) ? (x - 320) : (320 - x)) * 0.025;
// Dónde está el héroe en la viga b después de saltar `step` barriles.
function kongoHeroX(beam, step) {
  const dir = beam % 2 === 0 ? 1 : -1;
  const x0 = dir > 0 ? 70 : 570;
  const x1 = dir > 0 ? 570 : 70;
  return x0 + (x1 - x0) * (Math.min(step, KONGO_PER_BEAM) / KONGO_PER_BEAM);
}
// Segundos que tarda un barril en llegar: más letras = más tiempo (cada mayúscula después de la primera
// cuenta como letra y media: es SHIFT otra vez); cada viga y cada ronda, 8 % más rápido.
function kongoBarrelTime(word, beam, level) {
  const letters = word.length + Math.max(0, word.replace(/[^A-ZÁÉÍÓÚÑ]/g, '').length - 1) * 0.5;
  return ((1.3 + letters * 0.55) * diff().time * pace('kongo')) / ((1 + 0.08 * beam) * (1 + 0.08 * (level - 1)));
}

Scenes.kongo = nesScene({
  enter({ enemyId = 'kongo', back = 'map', endless = false } = {}) {
    Object.assign(this, { id: enemyId, back, endless, backParams: undefined });
    this.mount('kongo-scene', '<div class="kg-hud"></div>');
    Object.assign(this, {
      hpMax: playerMaxHp(), mercy: 0, hits: 0, round: 1, level: 1, beam: 0, step: 0, climbed: 0,
      barrel: null, jumpT: 0, hurtT: 0, throwT: 0, climbT: 0, mode: 'intro', endMenu: null, pauseMenu: null,
    });
    this.hp = this.hpMax;
    this.hx = kongoHeroX(0, 0);
    this.playMusic('kongo');
    this.renderHud();
    const pages = endless
      ? ['* BARRILES: sube todas las vigas que puedas.\n* Escribe la palabra del barril para saltarlo. (¡Con SHIFT! Los rojos, TODO EN MAYÚSCULAS.)']
      : ['* ¡BUM BUM BUM! KONGO TAMBOR te avienta barriles.\n* Escribe su palabra para saltarlos. (¡Con SHIFT!)',
        '* Los ROJOS queman: van TODO EN MAYÚSCULAS. Los AZULES bajan rapidísimo.\n* Arriba hay un MARTILLO... (¿o Kongo solo quiere con quién tocar?)'];
    this.say(pages, () => this.startClimb());
  },

  // ---------- Estado ----------

  renderHud() {
    const hud = $('.kg-hud');
    if (!hud) return;
    const best = (Save.data.arcade || {}).barriles || 0;
    hud.innerHTML = this.endless
      ? `${nesBar('HP', this.hp, this.hpMax)}<span>VIGAS ${this.climbed}</span><span>RECORD ${best}</span>`
      : `${nesBar('HP', this.hp, this.hpMax)}${nesBar('PAZ', this.mercy, 100, 'mercy')}<span>KONGO ${'♥'.repeat(KONGO_HITS - this.hits)}${'♡'.repeat(this.hits)}</span><span>RONDA ${this.round}</span>`;
  },

  startClimb() {
    this.mode = 'climb';
    this.panel.innerHTML = '<div class="nesx-word"></div>';
    this.word = new NesWord($('.nesx-word', this.panel), this.tally);
    this.deck = this.makeDeck();
    this.after(0.4, () => this.spawn());
  },

  // Los barriles de una subida, revueltos. El primero de toda la pelea siempre es normal (para aprender).
  makeDeck() {
    const deck = [...KONGO_DECK, rand(KONGO_SPECIALS)]
      .map((k) => [Math.random(), k]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    if (!this.climbed && this.round === 1 && this.level === 1) {
      deck.splice(deck.indexOf('normal'), 1);
      deck.unshift('normal');
    }
    return deck;
  },

  // Si te pegan, se repone el barril con otro: cuando se acaba la baraja, mitad normales y mitad especiales.
  nextKind() {
    if (this.deck && this.deck.length) return this.deck.shift();
    return Math.random() < 0.5 ? 'normal' : rand(KONGO_SPECIALS);
  },

  spawn() {
    if (this.mode !== 'climb') return;
    const kind = this.nextKind();
    // De la ronda 2 en adelante, TODOS traen dos palabras (Kongo lo promete; la mitad del partido es la excepción).
    const two = this.endless ? this.level >= 2 : this.round >= 2;
    const pool = { normal: [KONGO_W1, KONGO_W2], partido: [KONGO_W1, KONGO_W2], fuego: [KONGO_FIRE1, KONGO_FIRE2], azul: [KONGO_BLUE1, KONGO_BLUE2] }[kind];
    const word = rand(pool[two ? 1 : 0]);
    const dir = this.beam % 2 === 0 ? 1 : -1;
    const lx = dir > 0 ? 570 : 70; // la escalera de esta viga (por ahí baja el azul)
    const from = kind === 'azul' ? lx : lx + dir * 40;
    const dur = kongoBarrelTime(word, this.beam, this.endless ? this.level : this.round) * KONGO_KIND_TIME[kind];
    this.barrel = { kind, word, x: from, from, dur, t: 0, passed: false, dir: -dir, spin: 0, drop: kind === 'azul' ? 1 : 0 };
    this.throwT = 0.4;
    this.word.set(word, KONGO_HINTS[kind]);
  },

  actionKey(k) {
    if (this.mode !== 'climb' || !this.barrel || this.barrel.passed) return;
    if (this.word.key(k) === 'done') this.jump();
  },

  jump() {
    const b = this.barrel;
    Sfx.jump();
    this.jumpT = 0.45;
    // Barril partido: el primer salto lo rompe y la mitad sigue rodando con otra palabrita.
    if (b.kind === 'partido' && !b.half) {
      const word = rand(KONGO_HALF);
      Object.assign(b, { half: true, word, from: b.x, t: 0, dur: kongoBarrelTime(word, 0, 1) }); // sale de sorpresa: sin la prisa de la viga
      this.word.set(word, '▲ ¡SE PARTIÓ! ¡SALTA OTRA VEZ!');
      this.pop('¡CRAC!', b.x, kongoBeamY(this.beam, b.x) - 40, NES.W);
      return;
    }
    b.passed = true;
    this.step++;
    this.word.set('', '');
    this.pop('¡SALTO!', this.hx, kongoBeamY(this.beam, this.hx) - 50, NES.Y);
    this.after(0.5, () => {
      if (this.step >= KONGO_PER_BEAM) this.climb();
      else this.spawn();
    });
  },

  climb() {
    this.mode = 'ladder';
    this.climbT = 0.6;
    this.climbed++;
    this.after(0.6, () => {
      this.beam++;
      this.step = 0;
      this.hx = kongoHeroX(this.beam, 0);
      if (this.beam < KONGO_BEAMS) { this.mode = 'climb'; this.renderHud(); this.spawn(); return; }
      if (this.endless) {
        // Arcade: de vuelta abajo, un poquito más rápido.
        this.level++;
        this.beam = 0;
        this.hx = kongoHeroX(0, 0);
        Sfx.levelup();
        this.pop(`¡NIVEL ${this.level}!`, 320, 150, NES.Y);
        this.deck = this.makeDeck();
        this.mode = 'climb';
        this.renderHud();
        this.after(0.6, () => this.spawn());
        return;
      }
      this.renderHud();
      this.atTop();
    });
  },

  hurt() {
    const b = this.barrel;
    this.barrel = null;
    Sfx.hurt();
    this.hurtT = 0.8;
    this.hp = Math.max(0, this.hp - scaledDmg(4));
    this.pop('¡AY!', this.hx, kongoBeamY(this.beam, this.hx) - 50, NES.F);
    this.word.set('', '');
    // Bajas un escalón (o a la viga de abajo).
    if (this.step > 0) this.step--;
    else if (this.beam > 0) { this.beam--; this.step = KONGO_PER_BEAM - 1; }
    this.hx = kongoHeroX(this.beam, this.step);
    this.renderHud();
    if (this.hp <= 0) { this.lose(); return; }
    if (b) this.after(0.8, () => this.spawn());
  },

  lose() {
    this.mode = 'over';
    Music.stop();
    Sfx.lose();
    if (this.endless) { this.after(0.6, () => this.arcadeOver()); return; }
    this.after(0.9, () => Game.go('gameover', { enemyId: this.id, back: this.back, scene: 'kongo' }));
  },

  arcadeOver() {
    const a = Save.data.arcade || (Save.data.arcade = {});
    const record = this.climbed > (a.barriles || 0);
    if (record) a.barriles = this.climbed;
    Save.write();
    this.say([`* ¡GAME OVER!\n* Vigas subidas: ${this.climbed}${record ? ' · ¡NUEVO RECORD!' : ''}`], () => {
      this.endMenuShow([
        { label: 'Otra vez', go: () => Game.go('kongo', { endless: true, back: this.back }) },
        { label: 'Salir', go: () => Game.go(this.back) },
      ]);
    });
  },

  // ---------- Arriba: martillo o amistad ----------

  atTop() {
    this.mode = 'top';
    Sfx.secret();
    const options = ['Martillo', ...KONGO_ACTS.map((a) => a.name)];
    this.say(['* ¡Llegaste arriba! Aquí hay un MARTILLO.\n* Kongo deja de aventar barriles y te mira...'], () => {
      this.choose(options, (i) => (i === 0 ? this.hammer() : this.act(KONGO_ACTS[i - 1])), '¿Qué haces? (escribe una opción)');
    });
  },

  hammer() {
    const words = pickWords(WORDS_NES, 3);
    this.task({
      label: '¡MARTILLO! Escribe con mayúsculas:',
      texts: words,
      timeLimit: words.join('').length * 600 + 3000,
      onDone: (res) => {
        if (res.completed) {
          this.hits++;
          Sfx.crit();
          this.hurtKongo = 0.6;
          this.pop('¡PUM!', 500, 30, NES.Y);
        }
        this.renderHud();
        if (this.hits >= KONGO_HITS) { this.win(false); return; } // la página de victoria ya cuenta el martillazo
        this.afterTop(res.completed
          ? `* ¡PUM! ¡Le diste a Kongo! (${this.hits}/${KONGO_HITS})`
          : '* ¡Kongo esquivó el martillo! Se acabó el tiempo.');
      },
    });
  },

  act(a) {
    this.task({
      label: `ACTUAR: ${a.name}`,
      texts: [a.text],
      caps: false,
      timeLimit: a.text.length * 600 + 3000,
      onDone: (res) => {
        const gain = res.completed ? a.mercy : Math.round(a.mercy * res.progress * 0.5);
        this.mercy = Math.min(100, this.mercy + gain);
        if (gain) Sfx.mercy();
        this.renderHud();
        const text = res.completed ? a.reply : '* ¡Casi! Se acabó el tiempo antes de terminar.';
        if (this.mercy >= 100) this.say([text], () => this.win(true));
        else this.afterTop(text);
      },
    });
  },

  // Otra subida. Lo que pasó arriba y lo que dice Kongo van en UNA sola página.
  afterTop(lead) {
    this.round++;
    this.beam = 0;
    this.step = 0;
    this.hx = kongoHeroX(0, 0);
    this.renderHud();
    const line = this.round === 2
      ? '* "¡BUM BUM! ¿Eso es todo? ¡Ahora van de DOS en DOS!"'
      : '* "¡Otra vez! ¡Otra vez!" Kongo toca más rápido.';
    this.say([`${lead}\n${line}`], () => this.startClimb());
  },

  win(spared) {
    this.mode = 'win';
    this.noPause = true;
    Music.play('victory');
    this.musicId = null;
    const first = spared
      ? ['* Kongo deja el tambor y te ofrece la mano.\n* "Nadie había tocado CONMIGO. ¡Eres buen baterista!"']
      : ['* ¡PUM! ¡Segundo martillazo! ¡Kongo se tambalea!\n* "¡BUM... bum... bum!" Y huye saltando por las vigas.'];
    this.say(first, () => {
      this.paje = true;
      this.say(PAJE_LINES[1], () => {
        this.paje = false;
        this.say(this.finish(spared), () => Game.go(this.back));
      }, 'HONGO-PAJE');
    });
  },

  // ---------- Bucle y dibujo ----------

  update(dt) {
    this.jumpT = Math.max(0, this.jumpT - dt);
    this.hurtT = Math.max(0, this.hurtT - dt);
    this.throwT = Math.max(0, this.throwT - dt);
    this.climbT = Math.max(0, this.climbT - dt);
    this.hurtKongo = Math.max(0, (this.hurtKongo || 0) - dt);
    // El héroe camina hacia su escalón.
    const tx = kongoHeroX(this.beam, this.step);
    if (this.mode !== 'ladder') this.hx += Math.sign(tx - this.hx) * Math.min(Math.abs(tx - this.hx), 400 * dt);
    const b = this.barrel;
    if (!b) return;
    b.spin += dt * 10;
    if (b.passed) {
      b.drop = Math.max(0, b.drop - dt * 4);
      b.x += b.dir * (Math.abs(b.from - this.hx) / b.dur + 120) * dt;
      if (b.x < -40 || b.x > 680) this.barrel = null;
      return;
    }
    if (this.mode !== 'climb') return;
    b.t += dt;
    const k = Math.min(1, b.t / b.dur);
    if (b.kind === 'azul') {
      // Primero baja por la escalera (drop de 1 a 0) y luego rueda hacia ti.
      b.drop = Math.max(0, 1 - k / KONGO_DROP);
      b.x = b.from + (this.hx - b.from) * Math.max(0, (k - KONGO_DROP) / (1 - KONGO_DROP));
    } else b.x = b.from + (this.hx - b.from) * k;
    if (k >= 1) this.hurt();
  },

  draw(dt) {
    const g = this.g;
    g.fillStyle = NES.K;
    g.fillRect(0, 0, 640, 300);
    // Vigas rojas con remaches.
    for (let b = 0; b <= KONGO_BEAMS; b++) {
      for (let x = 40; x < 600; x += 16) {
        const y = Math.round(kongoBeamY(b, x + 8));
        g.fillStyle = NES.F;
        g.fillRect(x, y, 16, 10);
        g.fillStyle = NES.K;
        g.fillRect(x + 3, y + 3, 4, 4);
        g.fillRect(x + 10, y + 3, 4, 4);
      }
    }
    // Escaleras (en el extremo hacia donde caminas).
    for (let b = 0; b < KONGO_BEAMS; b++) {
      const lx = b % 2 === 0 ? 570 : 70;
      const top = kongoBeamY(b + 1, lx) + 10;
      const bot = kongoBeamY(b, lx);
      g.fillStyle = NES.U;
      g.fillRect(lx - 10, top, 3, bot - top);
      g.fillRect(lx + 7, top, 3, bot - top);
      for (let y = top + 6; y < bot; y += 9) g.fillRect(lx - 10, y, 20, 3);
    }
    // Kongo arriba con su tambor y su pila de barriles.
    const ky = kongoBeamY(KONGO_BEAMS, 470) - 48 - (this.throwT > 0 ? 6 : 0);
    if (!(this.hurtKongo > 0 && Math.floor(this.hurtKongo * 12) % 2)) paintNes(g, NES_ART.kongo, 446, ky, 3);
    this.drum(530, kongoBeamY(KONGO_BEAMS, 540) - 22);
    this.barrelAt(390, kongoBeamY(KONGO_BEAMS, 390) - 11, 0);
    this.barrelAt(390, kongoBeamY(KONGO_BEAMS, 390) - 33, 0);
    // El martillo espera arriba.
    if (!this.endless && this.mode !== 'top' && this.mode !== 'win') {
      const hy = kongoBeamY(KONGO_BEAMS, 120) - 24 + Math.sin(performance.now() / 200) * 2;
      g.fillStyle = NES.B;
      g.fillRect(118, hy + 6, 4, 16);
      g.fillStyle = NES.W;
      g.fillRect(110, hy, 20, 8);
    }
    // Barril.
    const b = this.barrel;
    if (b) {
      const by = kongoBeamY(this.beam, b.x) - 11 - b.drop * 52; // 52 = de una viga a la otra
      this.barrelAt(b.x, by, b.spin, b.kind, b.half);
      if (!b.passed) this.label(b.word, b.x, by - 20, { pos: this.word.pos, active: true });
    }
    // Héroe (salta los barriles; parpadea si lo golpearon; sube por la escalera).
    let hy = kongoBeamY(this.beam, this.hx) - 32;
    if (this.jumpT > 0) hy -= Math.sin(Math.PI * (1 - this.jumpT / 0.45)) * 34;
    if (this.mode === 'ladder') hy -= (1 - this.climbT / 0.6) * 52;
    const dir = this.beam % 2 === 0 ? 1 : -1;
    if (!(this.hurtT > 0 && Math.floor(this.hurtT * 12) % 2)) paintTones(g, 'heroe', this.hx - 16, hy, 2, dir < 0);
    this.drawPops(dt);
  },

  // Barril de 3 colores (ley NES): normal café/naranja, fuego rojo/amarillo con llamita,
  // azul azul/blanco, partido café con grieta blanca (y, ya partido, solo media rueda).
  barrelAt(x, y, spin, kind = 'normal', half = false) {
    const g = this.g;
    const [body, dots] = { normal: [NES.B, NES.O], fuego: [NES.F, NES.Y], azul: [NES.U, NES.W], partido: [NES.B, NES.W] }[kind];
    if (kind === 'fuego') {
      // La llamita de arriba baila.
      const f = Math.floor(performance.now() / 90) % 2;
      g.fillStyle = NES.Y;
      g.fillRect(x - 6, y - 15 - f * 2, 4, 6 + f * 2);
      g.fillRect(x - 1, y - 19 + f * 2, 4, 10 - f * 2);
      g.fillRect(x + 4, y - 15 - f, 3, 5 + f);
    }
    g.fillStyle = body;
    g.beginPath();
    if (half) g.arc(x, y + 3, 9, 0, Math.PI); // media rueda: queda la mitad de abajo
    else g.arc(x, y, 11, 0, Math.PI * 2);
    g.fill();
    if (half) return;
    g.fillStyle = dots;
    for (let i = 0; i < 2; i++) {
      const a = spin + i * Math.PI;
      g.fillRect(x + Math.cos(a) * 6 - 2, y + Math.sin(a) * 6 - 2, 4, 4);
    }
    if (kind === 'partido') {
      // La grieta en zigzag.
      g.fillRect(x - 1, y - 10, 2, 4);
      g.fillRect(x + 1, y - 6, 2, 4);
      g.fillRect(x - 1, y + 2, 2, 4);
      g.fillRect(x + 1, y + 6, 2, 4);
    }
    g.fillStyle = NES.K;
    g.fillRect(x - 11, y - 1, 22, 2);
  },

  drum(x, y) {
    const g = this.g;
    g.fillStyle = NES.F;
    g.fillRect(x, y, 26, 22);
    g.fillStyle = NES.W;
    g.fillRect(x, y, 26, 4);
    g.fillRect(x, y + 18, 26, 4);
    g.fillStyle = NES.K;
    for (let i = 0; i < 3; i++) g.fillRect(x + 4 + i * 8, y + 6, 2, 10);
  },
});
