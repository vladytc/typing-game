// GIMNASIO SENSOR — Minijefe A del Mundo 6: ENTRENADOR MI (guiño a Wii Sports, 2006). LORE.md §9.4.
// No hay HP: son tres pruebas de RITMO y se pasan una por una (el avance se guarda):
//   1. BOLICHE: cada letra de la palabra cae en el metrónomo (90 BPM). Todas en ventana = ¡CHUZA!
//      10 tiros; se pasa con 60 pinos o más.
//   2. TENIS: cada golpe es una palabra de UNA sola mano (izquierda o derecha, según el lado de la
//      cancha). Un error o llegar tarde = punto para Mi. Gana quien llegue a 7.
//   3. BOX: "izq", "der" y "agacha" llegan al compás (100 BPM). Escríbelas antes del golpe;
//      si terminas justo en un tiempo, ¡vale doble! 20 golpes antes de recibir 5.
// Con { arcade: 'boliche' | 'tenis' | 'box' } es el minijuego suelto (récord en Save.data.arcade).
// La dificultad cambia el tempo y las ventanas (diff().time). ESC = PAUSA.
//
// Todo el tiempo se mide con un reloj propio (this.now()) que se detiene en la PAUSA.

const WII_GYM_GAMES = ['boliche', 'tenis', 'box'];
const WII_GYM_NAMES = { boliche: 'BOLICHE SENSOR', tenis: 'TENIS SENSOR', box: 'BOX SENSOR' };

const WII_BOLICHE_WORDS = ['chuza', 'bolo', 'pino', 'carril', 'tiro', 'bola', 'ritmo', 'pista', 'giro', 'golpe', 'canal',
  'pinos', 'recto', 'suave', 'firme', 'calma', 'brazo', 'lanza', 'rueda', 'tempo', 'compás', 'chuzas'];
// Palabras de UNA sola mano en un teclado QWERTY (se revisa en las pruebas).
const WII_LEFT_KEYS = 'qwertasdfgzxcvb';
const WII_RIGHT_KEYS = 'yuiophjklñnm';
const WII_TENIS_LEFT = ['casa', 'verde', 'fresa', 'cabeza', 'cerca', 'barca', 'vaca', 'trece', 'cesta', 'sabes', 'tarea',
  'recta', 'seda', 'gafas', 'brava', 'tres', 'red', 'extra', 'grasa', 'deber', 'sacar', 'cesar'];
const WII_TENIS_RIGHT = ['pollo', 'nulo', 'kilo', 'mono', 'hoyo', 'pino', 'ojo', 'hilo', 'polo', 'uno', 'humo', 'molino',
  'pulpo', 'mimo', 'olimpo', 'kimono', 'lino', 'puño', 'moño', 'niño', 'mil', 'ñoño'];
const WII_BOX_CUES = ['izq', 'der', 'agacha'];

Scenes.wiigym = {
  enter({ enemyId = 'entrenadormi', back = 'map', arcade = null } = {}) {
    document.body.className = 'theme-wii';
    const d = Save.data;
    Object.assign(this, {
      id: enemyId, def: ENEMIES[enemyId] || { xp: 0, name: 'Entrenador Mi' }, back, arcade,
      replay: !arcade && !!d.done[enemyId], phase: 'intro', ui: null, game: null, paused: null,
      st: { chars: 0, errors: 0, ms: 0 }, offset: performance.now(), pausedAt: 0, msgs: [], timers: [],
    });
    Game.root.innerHTML = `
      <div class="wiigym">
        <canvas class="wg-cv" width="640" height="300"></canvas>
        <div class="wg-hud"></div>
        <div class="box wg-panel"></div>
      </div>`;
    this.cv = $('.wg-cv');
    this.g = this.cv.getContext('2d');
    this.panel = $('.wg-panel');
    this.match = pickMatch({ strict: strictOn(true) });
    this.last = performance.now();
    const loop = (ts) => {
      const dt = Math.max(0, Math.min(50, ts - this.last)) / 1000;
      this.last = ts;
      if (!this.paused && this.game && this.phase === 'play') this.game.update(this.now(), dt);
      this.draw(dt);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);

    if (arcade) { this.startGame(arcade); return; }
    const s = WIIS();
    const pages = this.replay
      ? ['* ENTRENADOR MI: ¡Volviste! ¿Una sesión más?\n* ¡El deporte es ritmo! ¡El tecleo es ritmo!']
      : [
        '* ¡Bienvenido al GIMNASIO SENSOR!\n* Un muñequito de chaleco blanco te saluda agitando los brazos.',
        '* ENTRENADOR MI: ¡Soy el ENTRENADOR MI!\n* ¡El deporte es ritmo! ¡El tecleo es ritmo! ¡Todo es ritmo!',
        '* ENTRENADOR MI: Aquí no hay golpes ni HP.\n* Solo tres pruebas: BOLICHE, TENIS y BOX.',
        '* ENTRENADOR MI: Recuerda ponerte la correa.\n* Correíta me lo pidió. Insistió. Mucho.',
      ];
    if (!this.replay && WII_GYM_GAMES.some((k) => s.gym[k])) pages.splice(1, 3, '* ENTRENADOR MI: ¡Seguimos donde nos quedamos! Ya pasaste ' + WII_GYM_GAMES.filter((k) => s.gym[k]).map((k) => upper(k)).join(' y ') + '.');
    this.say(pages, () => this.nextGame());
  },

  exit() {
    cancelAnimationFrame(this.raf);
    this.timers.forEach(clearTimeout);
    if (this.ui && this.ui.stop) this.ui.stop();
    if (this.paused) this.paused.close();
  },

  later(fn, ms) { this.timers.push(setTimeout(fn, ms)); },

  // Reloj del gimnasio en ms (se congela en la PAUSA).
  now() { return this.paused ? this.pausedAt : performance.now() - this.offset; },

  pause() {
    if (this.paused || this.phase !== 'play') return;
    this.pausedAt = this.now();
    Sfx.move();
    this.paused = wiiPause($('.wiigym'), {
      quitLabel: this.arcade ? 'Salir del juego' : 'Salir del gimnasio',
      onResume: () => { this.offset = performance.now() - this.pausedAt; this.paused = null; },
      onQuit: () => { this.paused = null; Game.go(this.back); },
    });
  },

  // ---------- Panel de abajo ----------

  say(pages, done) {
    this.phase = 'dialog';
    this.panel.innerHTML = '<div class="tb-text"></div>';
    this.ui = new Dialog($('.tb-text', this.panel), pages, done);
  },

  choose(items, onPick) {
    this.phase = 'menu';
    this.panel.innerHTML = '<div class="wg-menu"></div>';
    this.ui = new ListMenu($('.wg-menu', this.panel), items.map((label) => ({ label })), { cols: 2, onPick });
  },

  // La palabra actual con lo que ya se escribió.
  showWord(text, pos, { label = '', err = -1, marks = null } = {}) {
    const chars = [...text].map((c, i) => {
      const cls = i < pos ? `ok${marks && marks[i] ? ` m-${marks[i]}` : ''}` : i === pos ? `nx${err === i ? ' bad' : ''}` : '';
      return `<span class="${cls}">${c === ' ' ? '&nbsp;' : esc(c)}</span>`;
    }).join('');
    this.panel.innerHTML = `<div class="wg-label">${esc(label)}</div><div class="wg-word">${chars}</div>`;
  },

  pop(text, cls = '') { this.msgs.push({ text, cls, t: 0 }); },

  hud(html) { $('.wg-hud').innerHTML = html; },

  // ---------- Flujo de la visita ----------

  nextGame() {
    const s = WIIS();
    const next = WII_GYM_GAMES.find((k) => !(this.replay ? this.passed && this.passed[k] : s.gym[k]));
    if (!next) { this.win(); return; }
    this.startGame(next);
  },

  startGame(kind) {
    const G = { boliche: WiiBowling, tenis: WiiTennis, box: WiiBoxing }[kind];
    this.kind = kind;
    this.game = new G(this);
    this.msgs = [];
    const bpm = this.game.bpm;
    if (bpm) {
      const name = `wii_gym_${bpm}`;
      if (!TRACKS[name] && typeof wiiGymTrack === 'function') TRACKS[name] = wiiGymTrack(bpm);
      Music.play(name);
    } else Music.play('wii_gym_120');
    this.say(this.game.rules(), () => this.play());
  },

  play() {
    this.phase = 'play';
    this.ui = null;
    this.game.start(this.now());
  },

  // Lo llama cada juego al terminar: ok = pasó la prueba (o, en arcade, se acabó la partida).
  finishGame(ok, lines) {
    this.phase = 'result';
    const d = Save.data;
    if (this.arcade) {
      const a = d.arcade || (d.arcade = {});
      const key = `wii_${this.kind}`;
      const score = this.game.record();
      const best = a[key] || 0;
      const out = [...lines];
      if (score > best) { a[key] = score; out.push('* ¡¡NUEVO RECORD!!'); Sfx.levelup(); } else out.push(`* Récord: ${best}.`);
      Save.write();
      this.say(out, () => this.choose(['Otra vez', 'Salir'], (i) => (i === 0 ? Game.go('wiigym', { arcade: this.arcade, back: this.back }) : Game.go(this.back))));
      return;
    }
    if (ok) {
      Sfx.win();
      if (this.replay) (this.passed || (this.passed = {}))[this.kind] = true;
      else WIIS().gym[this.kind] = true;
      Save.write();
      this.say([...lines, `* ENTRENADOR MI: ¡${WII_GYM_NAMES[this.kind]} SUPERADO!\n* ¡Eso es ritmo de campeón!`], () => this.nextGame());
      return;
    }
    Music.stop();
    Sfx.lose();
    Save.write();
    this.say([...lines, '* ENTRENADOR MI: ¡Casi! El ritmo se entrena.\n* ¿Otra vez?'], () => this.choose(['Reintentar', 'Salir'], (i) => (i === 0 ? this.startGame(this.kind) : Game.go(this.back))));
  },

  win() {
    const d = Save.data;
    const def = this.def;
    const first = !d.done[this.id];
    const wpm = this.st.ms > 0 ? Math.round((this.st.chars / 5) / (this.st.ms / 60000)) : 0;
    const typed = this.st.chars + this.st.errors;
    const acc = typed ? Math.round((this.st.chars / typed) * 100) : 100;
    Stats.addBattle({ enemy: this.id, wpm, acc, date: Date.now() });
    const ups = addXp(def.xp || 0);
    Music.play('victory');
    const pages = [
      '* ENTRENADOR MI: ¡LAS TRES PRUEBAS!\n* ¡Boliche, tenis y box! ¡Qué ritmo!',
      `* Ganaste ${def.xp || 0} XP.\n* Velocidad: ${wpm} PPM · Precisión: ${acc}%`,
    ];
    if (ups) pages.push(`* ¡SUBISTE A NIVEL ${d.level}!`);
    d.done[this.id] = true;
    d.flags.wii_gym_arcade = true;
    if (first) {
      if (def.drop && !d.treasures[def.drop]) {
        d.treasures[def.drop] = true;
        pages.push(`* Recibiste: ${upper(TREASURES[def.drop].name)}.\n* (Se guardó en tu vitrina.)`);
      }
      pages.push(
        '* ¡En la gran pantalla de la ciudad se prende un cuadrito!\n* CANAL DEPORTES: ENCENDIDO.',
        '* ENTRENADOR MI: Me voy a abrir un gimnasio en tu pueblo.\n* ¡Ahí puedes repetir los tres deportes cuando quieras!',
      );
    }
    if (def.onWin) def.onWin(this, { first, pages });
    Save.write();
    this.say(pages, () => Game.go(this.back));
  },

  // ---------- Teclas ----------

  onKey(e) {
    if (this.paused) { this.paused.menu.key(e); return; }
    if (this.phase === 'play') {
      if (e.key === 'Escape') { this.pause(); return; }
      if (e.repeat || e.key.length !== 1) return;
      this.game.key(e.key, this.now());
      return;
    }
    if (this.ui && this.ui.key) this.ui.key(e);
  },

  // Una letra contra la esperada. Devuelve true si estuvo bien (y la cuenta en las estadísticas).
  check(expected, typed) {
    const ok = this.match(expected, typed);
    Stats.record(expected, ok);
    if (ok) { this.st.chars++; Sfx.key(); } else { this.st.errors++; Sfx.error(); }
    return ok;
  },

  // ---------- Dibujo ----------

  draw(dt) {
    const g = this.g;
    if (!g) return;
    const W = 640;
    const H = 300;
    // Fondo del gimnasio: blanco con franjas grises suaves (como el menú de la consola).
    g.fillStyle = WIIC.white;
    g.fillRect(0, 0, W, H);
    g.fillStyle = WIIC.light;
    for (let y = 0; y < H; y += 24) g.fillRect(0, y, W, 12);
    if (this.game) this.game.draw(g, this.now(), dt);
    else {
      wiiPaint(g, 'entrenadormi', 270, 60, 6);
      g.fillStyle = WIIC.navy;
      g.font = '14px "Press Start 2P", monospace';
      g.textAlign = 'center';
      g.fillText('GIMNASIO SENSOR', W / 2, 40);
    }
    // Mensajes que flotan ("¡CHUZA!", "¡JUSTO!").
    this.msgs = this.msgs.filter((m) => (m.t += dt) < 1.1);
    g.textAlign = 'center';
    this.msgs.forEach((m, i) => {
      g.globalAlpha = Math.max(0, 1 - m.t / 1.1);
      g.font = `${m.cls === 'big' ? 22 : 12}px "Press Start 2P", monospace`;
      g.fillStyle = WII_PAL.K;
      const y = 120 - m.t * 40 - i * 4;
      g.fillText(m.text, W / 2 + 2, y + 2);
      g.fillStyle = m.cls === 'bad' ? WIIC.red : m.cls === 'good' ? WIIC.green : WIIC.blue;
      g.fillText(m.text, W / 2, y);
      g.globalAlpha = 1;
    });
  },
};

// ======================================================================
// 1. BOLICHE SENSOR — ritmo constante.
// ======================================================================
class WiiBowling {
  constructor(scene) {
    this.s = scene;
    this.bpm = Math.round(90 / diff().time);
    this.beat = 60000 / this.bpm;
    this.win = 120 * diff().time;
    this.frame = 0;
    this.total = 0;
    this.strikes = 0;
    this.bestRun = 0;
    this.frames = [];
    this.roll = null;
    this.word = null;
  }

  rules() {
    return [
      '* PRUEBA 1: BOLICHE SENSOR.\n* ENTRENADOR MI: ¡Sigue el metrónomo! Tic... tic... tic...',
      '* La PRIMERA letra marca el tiempo. Cada letra que sigue va en el siguiente "tic".\n* Ni antes, ni después: ¡parejito!',
      `* Si TODAS caen en el tic: ¡CHUZA! (10 pinos).\n* Son 10 tiros. ${this.s.arcade ? '¡Haz todos los pinos que puedas!' : 'Necesitas 60 pinos o más.'}`,
    ];
  }

  start(now) {
    this.metro0 = now;
    this.nextFrame(now);
  }

  nextFrame(now) {
    this.frame++;
    this.word = { text: rand(WII_BOLICHE_WORDS.filter((w) => !this.word || w !== this.word.text)), pos: 0, t0: 0, scores: [], marks: [], errors: 0, err: -1 };
    this.roll = null;
    this.metro0 = now;
    this.render();
  }

  render() {
    const w = this.word;
    this.s.showWord(w.text, w.pos, { label: `TIRO ${this.frame}/10 · Primera letra cuando quieras; las demás, en cada TIC`, err: w.err, marks: w.marks });
    this.s.hud(`<span>${WII_GYM_NAMES.boliche}</span><span>TIRO ${this.frame}/10</span><span>PINOS ${this.total}</span><span>${this.bpm} BPM</span>`);
  }

  key(k, now) {
    const w = this.word;
    if (this.roll || !w) return;
    const expected = w.text[w.pos];
    if (!this.s.check(expected, k)) { w.errors++; w.err = w.pos; w.badAt = w.pos; this.render(); return; }
    w.err = -1;
    if (w.pos === 0) {
      w.t0 = now;
      this.metro0 = now; // el metrónomo se acomoda a tu primer golpe
      w.marks.push('');
    } else {
      const dev = Math.abs(now - (w.t0 + w.pos * this.beat));
      const bad = w.badAt === w.pos; // se equivocó en esta letra: ya no cuenta como TIC
      const sc = bad ? 0 : dev <= this.win ? 1 : dev <= this.win * 2 ? 0.5 : 0;
      w.scores.push(sc);
      w.marks.push(sc === 1 ? 'good' : sc ? 'meh' : 'bad');
      this.s.pop(sc === 1 ? '¡TIC!' : sc ? 'casi' : now < w.t0 + w.pos * this.beat ? '¡pronto!' : '¡tarde!', sc === 1 ? 'good' : sc ? '' : 'bad');
    }
    w.pos++;
    if (w.pos >= w.text.length) this.throwBall(now);
    else this.render();
  }

  throwBall(now) {
    const w = this.word;
    this.s.st.ms += Math.max(300, now - w.t0);
    const n = w.scores.length;
    const steady = n ? w.scores.reduce((a, b) => a + b, 0) / n : 1;
    const perfect = n > 0 ? w.scores.every((x) => x === 1) && w.errors === 0 : w.errors === 0;
    const pins = perfect ? 10 : Math.max(0, Math.min(9, Math.round(10 * steady) - Math.min(3, w.errors)));
    this.roll = { t: 0, pins, curve: (1 - steady) * (Math.random() < 0.5 ? -1 : 1), done: false };
    this.render();
    Sfx.bump();
  }

  update(now, dt) {
    const r = this.roll;
    if (!r) return;
    r.t += dt;
    if (r.t >= 1.3 && !r.done) {
      r.done = true;
      this.total += r.pins;
      this.frames.push(r.pins);
      const st = WIIS();
      const counts = diff().time <= 1; // la misión pide Normal (o Difícil)
      if (r.pins === 10) {
        this.strikes++;
        this.bestRun = Math.max(this.bestRun, this.strikes);
        Sfx.crit();
        this.s.pop('¡CHUZA!', 'big');
        if (counts) st.chuzas = (st.chuzas || 0) + 1;
        if (counts && st.chuzas >= 10 && Quests.state('wii_chuza') !== 'done') {
          Quests.complete('wii_chuza');
          Save.data.treasures.pelota_dorada = true;
          this.goldNote = true;
        }
      } else {
        this.strikes = 0;
        if (counts) st.chuzas = 0;
        Sfx.hit();
        this.s.pop(r.pins ? `${r.pins} PINOS` : '¡CANAL!', r.pins >= 7 ? 'good' : r.pins ? '' : 'bad');
      }
      Save.write();
      this.render();
      this.s.later(() => {
        if (this.s.phase !== 'play' || Game.scene !== this.s) return;
        if (this.frame >= 10) this.end();
        else this.nextFrame(this.s.now());
      }, 1100);
    }
  }

  end() {
    const lines = [`* ¡Hiciste ${this.total} pinos en 10 tiros!${this.bestRun >= 2 ? `\n* (${this.bestRun} chuzas seguidas.)` : ''}`];
    if (this.goldNote) lines.push('* ¡¡10 CHUZAS SEGUIDAS!!\n* Recibiste: PELOTA DORADA. (Se guardó en tu vitrina.)');
    this.s.finishGame(this.s.arcade ? true : this.total >= 60, lines);
  }

  record() { return this.total; }

  draw(g, now) {
    const W = 640;
    // El carril en perspectiva (de abajo, ancho, hacia arriba, angosto).
    const top = 40;
    const bot = 296;
    const xAt = (y, f) => { const k = (y - top) / (bot - top); const half = 40 + k * 120; return 320 + f * half; };
    g.fillStyle = WIIC.gray;
    g.beginPath();
    g.moveTo(xAt(top, -1.25), top); g.lineTo(xAt(top, 1.25), top); g.lineTo(xAt(bot, 1.25), bot); g.lineTo(xAt(bot, -1.25), bot);
    g.fill();
    g.fillStyle = '#F3D9A4';
    g.beginPath();
    g.moveTo(xAt(top, -1), top); g.lineTo(xAt(top, 1), top); g.lineTo(xAt(bot, 1), bot); g.lineTo(xAt(bot, -1), bot);
    g.fill();
    g.strokeStyle = '#E2C285';
    g.lineWidth = 1;
    for (let f = -0.75; f <= 0.76; f += 0.25) { g.beginPath(); g.moveTo(xAt(top, f), top); g.lineTo(xAt(bot, f), bot); g.stroke(); }
    // Flechitas guía.
    g.fillStyle = WIIC.orange;
    [-0.4, -0.2, 0, 0.2, 0.4].forEach((f) => { const y = 210; const x = xAt(y, f); g.beginPath(); g.moveTo(x, y - 6); g.lineTo(x - 4, y + 4); g.lineTo(x + 4, y + 4); g.fill(); });
    // Pinos (10, en triángulo). Los que tumba la bola se acuestan.
    const r = this.roll;
    const fallen = r && r.t > 0.9 ? r.pins : 0;
    const order = [0, 1, 2, 4, 3, 5, 7, 8, 6, 9];
    const rowsPins = [[0], [-1, 1], [-2, 0, 2], [-3, -1, 1, 3]];
    let k = 0;
    const pins = [];
    rowsPins.forEach((row, j) => row.forEach((c) => { pins.push({ c, j, idx: k++ }); }));
    pins.slice().reverse().forEach((p) => {
      const y = top + 34 - p.j * 9;
      const x = xAt(y, p.c * 0.13);
      const down = order.indexOf(p.idx) < fallen;
      g.save();
      g.translate(x, y);
      if (down) g.rotate(p.c >= 0 ? 1.3 : -1.3);
      g.fillStyle = WII_PAL.K;
      g.fillRect(-4, -16, 8, 18);
      g.fillStyle = WIIC.white;
      g.fillRect(-3, -15, 6, 16);
      g.fillStyle = WIIC.red;
      g.fillRect(-3, -11, 6, 2);
      g.restore();
    });
    // La bola.
    let by = 270;
    let bx = 320;
    if (r) {
      const k2 = Math.min(1, r.t / 0.95);
      by = 270 - k2 * 200;
      bx = xAt(by, r.curve * Math.sin(k2 * Math.PI * 0.9) * 0.9 + r.curve * k2 * 0.3);
    }
    const br = r ? 14 - Math.min(1, r.t / 0.95) * 8 : 14;
    g.fillStyle = WIIC.navy;
    g.beginPath(); g.arc(bx, by, br + 2, 0, Math.PI * 2); g.fill();
    g.fillStyle = WIIC.blue;
    g.beginPath(); g.arc(bx, by, br, 0, Math.PI * 2); g.fill();
    g.fillStyle = WIIC.white;
    g.beginPath(); g.arc(bx - br * 0.35, by - br * 0.35, br * 0.25, 0, Math.PI * 2); g.fill();
    // Metrónomo (a la derecha): un péndulo y el foquito de cada TIC.
    const ph = ((now - this.metro0) % this.beat) / this.beat;
    const side = Math.floor((now - this.metro0) / this.beat) % 2 ? 1 : -1;
    const ang = side * Math.cos(ph * Math.PI) * 0.6;
    g.save();
    g.translate(560, 200);
    g.fillStyle = WIIC.light;
    wiiRoundRect(g, -40, -120, 80, 140, 12); g.fill();
    g.strokeStyle = WIIC.gray; g.lineWidth = 3; g.stroke();
    g.rotate(ang);
    g.fillStyle = WII_PAL.K;
    g.fillRect(-2, -100, 4, 100);
    g.fillStyle = WIIC.sky;
    g.fillRect(-8, -80, 16, 12);
    g.restore();
    g.fillStyle = ph < 0.18 ? WIIC.green : WIIC.gray;
    g.beginPath(); g.arc(560, 214, 9, 0, Math.PI * 2); g.fill();
    if (ph < 0.02 && !this.ticked) { Sfx.text(); this.ticked = true; } else if (ph > 0.5) this.ticked = false;
    // Marcador de tiros.
    g.font = '8px "Press Start 2P", monospace';
    g.textAlign = 'center';
    for (let i = 0; i < 10; i++) {
      const x = 30 + i * 20;
      g.fillStyle = i < this.frames.length ? (this.frames[i] === 10 ? WIIC.yellow : WIIC.white) : WIIC.light;
      g.fillRect(x - 9, 16, 18, 18);
      g.strokeStyle = WIIC.gray; g.lineWidth = 1; g.strokeRect(x - 9, 16, 18, 18);
      if (i < this.frames.length) { g.fillStyle = WII_PAL.K; g.fillText(this.frames[i] === 10 ? 'X' : String(this.frames[i]), x, 29); }
    }
    // El héroe con la bola en la mano.
    wiiPaint(g, 'heroe', 40, 200, 5);
  }
}

// ======================================================================
// 2. TENIS SENSOR — alternar manos.
// ======================================================================
class WiiTennis {
  constructor(scene) {
    this.s = scene;
    this.bpm = 120;
    this.me = 0;
    this.mi = 0;
    this.rally = 0;
    this.hits = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.side = Math.random() < 0.5 ? 'left' : 'right';
    this.ball = null;
    this.word = null;
    this.goal = scene.arcade ? Infinity : 7;
    this.miGoal = scene.arcade ? 3 : 7;
  }

  rules() {
    return [
      '* PRUEBA 2: TENIS SENSOR.\n* ENTRENADOR MI: ¡Cada golpe usa UNA sola mano!',
      '* Si la pelota viene a la IZQUIERDA, la palabra es de la mano izquierda (casa, verde...).\n* Si viene a la DERECHA, de la mano derecha (pollo, kilo...).',
      `* Escríbela antes de que llegue la pelota.\n* ¡UN error y el punto es mío! ${this.s.arcade ? 'Juega hasta que yo haga 3 puntos.' : 'Gana el primero que llegue a 7.'}`,
    ];
  }

  start(now) { this.serve(now); }

  need() { return this.me + this.mi < 3 ? 2 : 3; }

  serve(now) {
    const list = this.side === 'left' ? WII_TENIS_LEFT : WII_TENIS_RIGHT;
    const text = rand(list.filter((w) => !this.word || w !== this.word.text));
    const speedup = Math.max(0.7, Math.pow(0.97, this.hits));
    const dur = (1300 + text.length * 380) * diff().time * speedup;
    this.word = { text, pos: 0, t0: now };
    this.ball = { from: now, dur, dir: 'in', side: this.side };
    this.render();
  }

  render() {
    const w = this.word;
    const hand = this.side === 'left' ? 'MANO IZQUIERDA ←' : 'MANO DERECHA →';
    if (w) this.s.showWord(w.text, w.pos, { label: `${hand}  ·  golpe ${this.rally + 1}/${this.need()}` });
    this.s.hud(`<span>${WII_GYM_NAMES.tenis}</span><span>TU ${this.me}</span><span>MI ${this.mi}</span><span>${this.s.arcade ? `RACHA ${this.streak}` : 'A 7 PUNTOS'}</span>`);
  }

  key(k, now) {
    const w = this.word;
    if (!w || !this.ball || this.ball.dir !== 'in') return;
    if (!this.s.check(w.text[w.pos], k)) { this.point('mi', now, '¡ERROR! Punto para Mi'); return; }
    w.pos++;
    if (w.pos < w.text.length) { this.render(); return; }
    // ¡Golpe!
    this.s.st.ms += Math.max(300, now - w.t0);
    this.hits++;
    this.rally++;
    Sfx.hit();
    this.s.pop('¡PLAF!', 'good');
    this.ball = { from: now, dur: 700, dir: 'out', side: this.side, miss: this.rally >= this.need() };
    this.word = null;
    this.s.panel.innerHTML = '<div class="wg-label">¡Buen golpe!</div>';
  }

  point(who, now, text) {
    if (who === 'me') { this.me++; this.streak++; this.bestStreak = Math.max(this.bestStreak, this.streak); Sfx.coin(); } else { this.mi++; this.streak = 0; Sfx.hurt(); }
    this.s.pop(text, who === 'me' ? 'good' : 'bad');
    this.rally = 0;
    this.ball = null;
    this.word = null;
    this.render();
    if (this.me >= this.goal || this.mi >= this.miGoal) { this.s.later(() => this.end(), 900); this.over = true; return; }
    this.s.later(() => {
      if (this.s.phase !== 'play' || Game.scene !== this.s) return;
      this.side = Math.random() < 0.5 ? 'left' : 'right';
      this.serve(this.s.now());
    }, 1000);
  }

  update(now) {
    const b = this.ball;
    if (!b || this.over) return;
    const k = (now - b.from) / b.dur;
    if (b.dir === 'in' && k >= 1) { this.point('mi', now, '¡Llegó tarde!'); return; }
    if (b.dir === 'out' && k >= 1) {
      if (b.miss) { this.point('me', now, '¡PUNTO PARA TI!'); return; }
      // Mi la regresa al otro lado: ahora toca la otra mano.
      this.side = this.side === 'left' ? 'right' : 'left';
      this.serve(now);
    }
  }

  end() {
    const lines = this.s.arcade
      ? [`* Hiciste ${this.me} puntos. Tu mejor racha: ${this.bestStreak} seguidos.`]
      : [this.me >= 7 ? `* ¡Ganaste el set ${this.me} a ${this.mi}!` : `* Mi ganó el set ${this.mi} a ${this.me}.`];
    this.s.finishGame(this.s.arcade ? true : this.me >= 7, lines);
  }

  record() { return this.bestStreak; }

  draw(g, now) {
    // Cancha en perspectiva: azul con líneas blancas.
    const top = 50;
    const bot = 290;
    const xAt = (y, f) => { const k = (y - top) / (bot - top); return 320 + f * (110 + k * 150); };
    g.fillStyle = WIIC.green;
    g.fillRect(0, top - 10, 640, 260);
    g.fillStyle = WIIC.blue;
    g.beginPath(); g.moveTo(xAt(top, -1), top); g.lineTo(xAt(top, 1), top); g.lineTo(xAt(bot, 1), bot); g.lineTo(xAt(bot, -1), bot); g.fill();
    g.strokeStyle = WIIC.white;
    g.lineWidth = 3;
    g.beginPath(); g.moveTo(xAt(top, -1), top); g.lineTo(xAt(top, 1), top); g.lineTo(xAt(bot, 1), bot); g.lineTo(xAt(bot, -1), bot); g.closePath(); g.stroke();
    g.beginPath(); g.moveTo(xAt(top, 0), top); g.lineTo(xAt(bot, 0), bot); g.stroke();
    // Red.
    const ny = 150;
    g.fillStyle = 'rgba(255,255,255,0.7)';
    g.fillRect(xAt(ny, -1.1), ny - 18, xAt(ny, 1.1) - xAt(ny, -1.1), 18);
    g.fillStyle = WIIC.white;
    g.fillRect(xAt(ny, -1.1), ny - 20, xAt(ny, 1.1) - xAt(ny, -1.1), 3);
    // El lado donde viene la pelota se ilumina.
    const b = this.ball;
    if (b && b.dir === 'in') {
      const f = b.side === 'left' ? -0.5 : 0.5;
      g.fillStyle = 'rgba(255,213,79,0.35)';
      g.beginPath();
      g.moveTo(xAt(ny, f - 0.5), ny); g.lineTo(xAt(ny, f + 0.5), ny); g.lineTo(xAt(bot, f + 0.5), bot); g.lineTo(xAt(bot, f - 0.5), bot);
      g.fill();
      g.font = '12px "Press Start 2P", monospace';
      g.textAlign = 'center';
      g.fillStyle = WIIC.navy;
      g.fillText(b.side === 'left' ? '← IZQUIERDA' : 'DERECHA →', xAt(260, f), 270);
    }
    // Mi al fondo y tú adelante.
    wiiPaint(g, 'entrenadormi', 296, top - 30, 3);
    const myX = b && b.dir === 'in' ? (b.side === 'left' ? 170 : 410) : 290;
    wiiPaint(g, 'heroe', myX, 216, 4);
    // La pelota: de Mi hacia tu lado (o de regreso), con sombra y un arco.
    if (b) {
      const k = Math.max(0, Math.min(1, (now - b.from) / b.dur));
      const f = b.side === 'left' ? -0.55 : 0.55;
      const fromY = top + 10;
      const toY = 250;
      const kk = b.dir === 'in' ? k : 1 - k;
      const y = fromY + (toY - fromY) * kk;
      const x = xAt(y, f * kk);
      const lift = Math.sin(kk * Math.PI) * 40;
      const r = 4 + kk * 6;
      g.fillStyle = 'rgba(0,0,0,0.2)';
      g.beginPath(); g.ellipse(x, y, r, r * 0.4, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#D8F05A';
      g.beginPath(); g.arc(x, y - lift, r, 0, Math.PI * 2); g.fill();
      g.strokeStyle = WIIC.white; g.lineWidth = 1.5;
      g.beginPath(); g.arc(x - r * 0.3, y - lift, r * 0.7, -1, 1); g.stroke();
    }
  }
}

// ======================================================================
// 3. BOX SENSOR — al compás.
// ======================================================================
class WiiBoxing {
  constructor(scene) {
    this.s = scene;
    this.bpm = Math.round(100 / diff().time);
    this.beat = 60000 / this.bpm;
    this.onBeatWin = 90 * diff().time;
    this.hits = 0;
    this.taken = 0;
    this.cue = null;
    this.nextCueBeat = 2;
    this.pose = 'idle';
    this.poseT = 0;
    this.goal = scene.arcade ? Infinity : 20;
  }

  rules() {
    return [
      '* PRUEBA 3: BOX SENSOR.\n* ENTRENADOR MI: ¡Guantes arriba! ¡Escucha el compás!',
      '* En cada tiempo puede llegar un aviso: IZQ, DER o AGACHA.\n* Escríbelo antes de que caiga el golpe (la barrita se llena).',
      `* Si terminas JUSTO en un tiempo: ¡AL COMPAS! (vale doble).\n* ${this.s.arcade ? 'Pega todo lo que puedas antes de recibir 5.' : 'Necesitas 20 golpes antes de recibir 5.'}`,
    ];
  }

  start(now) { this.t0 = now; this.render(); }

  beatAt(now) { return (now - this.t0) / this.beat; }

  render() {
    const c = this.cue;
    if (c) this.s.showWord(c.text, c.pos, { label: `¡${upper(c.text)}! Antes de ${c.beats} tiempos` });
    else this.s.panel.innerHTML = '<div class="wg-label">Guardia arriba... escucha el compás</div><div class="wg-word dim">· · ·</div>';
    this.s.hud(`<span>${WII_GYM_NAMES.box}</span><span>GOLPES ${this.hits}${this.goal < Infinity ? `/${this.goal}` : ''}</span><span>RECIBIDOS ${'●'.repeat(this.taken)}${'○'.repeat(Math.max(0, 5 - this.taken))}</span><span>${this.bpm} BPM</span>`);
  }

  update(now, dt) {
    if (this.over) return;
    this.poseT = Math.max(0, this.poseT - dt);
    if (!this.poseT) this.pose = 'idle';
    const b = this.beatAt(now);
    const whole = Math.floor(b);
    if (whole !== this.lastBeat) { this.lastBeat = whole; Sfx.text(); }
    if (!this.cue && b >= this.nextCueBeat) {
      const text = rand(WII_BOX_CUES);
      const beats = text === 'agacha' ? 4 : 3;
      const at = Math.ceil(this.nextCueBeat);
      this.cue = { text, pos: 0, beats, at, deadline: at + beats, t0: now };
      Sfx.move();
      this.render();
    }
    if (this.cue && b >= this.cue.deadline) {
      // ¡PUM! No llegaste.
      this.taken++;
      this.pose = 'hurt';
      this.poseT = 0.5;
      Sfx.hurt();
      this.s.pop('¡PUM!', 'bad');
      this.nextCueBeat = this.cue.deadline + 1;
      this.cue = null;
      this.render();
      this.checkEnd();
    }
  }

  key(k, now) {
    const c = this.cue;
    if (!c || this.over) return;
    if (!this.s.check(c.text[c.pos], k)) { this.render(); return; }
    c.pos++;
    if (c.pos < c.text.length) { this.render(); return; }
    this.s.st.ms += Math.max(300, now - c.t0);
    const b = this.beatAt(now);
    const off = Math.abs(b - Math.round(b)) * this.beat;
    const exact = off <= this.onBeatWin;
    this.hits += exact ? 2 : 1;
    this.pose = c.text;
    this.poseT = 0.45;
    exact ? Sfx.crit() : Sfx.hit();
    this.s.pop(exact ? '¡AL COMPAS! x2' : '¡GOLPE!', 'good');
    this.nextCueBeat = Math.floor(b) + 2;
    this.cue = null;
    this.render();
    this.checkEnd();
  }

  checkEnd() {
    if (this.hits >= this.goal || this.taken >= 5) {
      this.over = true;
      this.s.later(() => this.end(), 800);
    }
  }

  end() {
    const ok = this.hits >= 20;
    const lines = this.s.arcade ? [`* ¡${this.hits} golpes antes de recibir 5!`]
      : [ok ? `* ¡${this.hits} golpes! Mi se sienta en la esquina a tomar agua.` : `* Recibiste 5 golpes (llevabas ${this.hits}).`];
    this.s.finishGame(this.s.arcade ? true : ok, lines);
  }

  record() { return this.hits; }

  draw(g, now) {
    // El ring.
    g.fillStyle = WIIC.sky;
    g.fillRect(0, 0, 640, 200);
    g.fillStyle = WIIC.light;
    g.fillRect(0, 200, 640, 100);
    g.strokeStyle = WIIC.red;
    g.lineWidth = 4;
    [130, 155, 180].forEach((y) => { g.beginPath(); g.moveTo(0, y); g.lineTo(640, y); g.stroke(); });
    // Mi, grandote, en guardia (se mueve según tu golpe).
    const shift = this.pose === 'izq' ? 40 : this.pose === 'der' ? -40 : 0;
    const dip = this.pose === 'hurt' ? -6 : this.pose === 'agacha' ? 0 : Math.sin(now / 200) * 3;
    wiiPaint(g, 'entrenadormi', 232 + shift, 20 + dip, 11);
    // Tus guantes (abajo, como si fueras tú).
    const pump = (side) => (this.pose === side ? -50 : 0);
    const duck = this.pose === 'agacha' ? 30 : 0;
    const glove = (x, y) => {
      g.fillStyle = WIIC.navy;
      g.beginPath(); g.arc(x, y, 34, 0, Math.PI * 2); g.fill();
      g.fillStyle = WIIC.red;
      g.beginPath(); g.arc(x, y, 30, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.5)';
      g.beginPath(); g.arc(x - 10, y - 10, 8, 0, Math.PI * 2); g.fill();
    };
    glove(190, 270 + pump('izq') + duck);
    glove(450, 270 + pump('der') + duck);
    if (this.pose === 'hurt') { g.fillStyle = 'rgba(244,67,54,0.25)'; g.fillRect(0, 0, 640, 300); }
    // La barra del compás: un punto por tiempo; el golpe cae en la meta.
    const b = this.beatAt(now);
    const c = this.cue;
    g.fillStyle = 'rgba(255,255,255,0.85)';
    wiiRoundRect(g, 120, 214, 400, 24, 12); g.fill();
    for (let i = 0; i < 6; i++) {
      const x = 140 + i * 72 - ((b % 1) * 72);
      const on = (b % 1) < 0.2 && i === 0;
      g.fillStyle = on ? WIIC.green : WIIC.gray;
      g.beginPath(); g.arc(x, 226, on ? 8 : 5, 0, Math.PI * 2); g.fill();
    }
    if (c) {
      const left = c.deadline - b;
      const x = 140 + Math.max(0, left) * 72;
      g.fillStyle = WIIC.red;
      g.beginPath(); g.moveTo(x, 214); g.lineTo(x - 8, 204); g.lineTo(x + 8, 204); g.fill();
      g.fillStyle = WIIC.navy;
      g.font = '10px "Press Start 2P", monospace';
      g.textAlign = 'center';
      g.fillText(upper(c.text), x, 200);
      g.fillStyle = WIIC.orange;
      g.fillRect(132, 212, 6, 28);
    }
  }
}
