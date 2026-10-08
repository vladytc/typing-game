// Minijuego BLOQUES (homenaje al juego de bloques que caen de la Game Boy).
// Cae una palabra a la vez. Si la escribes, desaparece. Si toca el fondo, se apila.
// Las palabras apiladas también se pueden escribir para "romper la línea" (puntos dobles).
// Si la pila llega hasta arriba: GAME OVER.

const WELL_W = 360;
const WELL_H = 416;
const ROW = 32;
const MAX_ROWS = Math.floor(WELL_H / ROW) - 1;

Scenes.bloques = {
  music: 'arcade',

  enter({ back = 'town' }) {
    this.back = back;
    const best = (Save.data.arcade || {}).bloques || 0;
    Game.root.innerHTML = `
      <div class="bloques">
        <div class="well"></div>
        <div class="bpanel">
          <h2>BLOQUES</h2>
          <div class="bstat"><span>PUNTOS</span><b class="bscore">0</b></div>
          <div class="bstat"><span>NIVEL</span><b class="blevel">1</b></div>
          <div class="bstat"><span>LINEAS</span><b class="blines">0</b></div>
          <div class="bstat"><span>RECORD</span><b>${best}</b></div>
          <div class="bstat"><span>SIGUIENTE</span><b class="bnext"></b></div>
          <p class="bhelp">Escribe la palabra que cae.<br>Las apiladas valen doble.<br><br>ESC: salir</p>
        </div>
        <div class="box bover hidden"></div>
      </div>`;
    this.well = $('.well');
    Object.assign(this, { score: 0, level: 1, lines: 0, cleared: 0, stack: [], piece: null, target: null, active: false, over: false });
    this.queue = [this.word(), this.word()];
    this.readyT = setTimeout(() => this.start(), 600);
  },

  exit() {
    this.active = false;
    cancelAnimationFrame(this.raf);
    clearTimeout(this.readyT);
  },

  word() {
    const pool = this.level < 3 ? WORDS.t1 : this.level < 5 ? WORDS.t1.concat(WORDS.t2) : WORDS.t2;
    return rand(pool || WORDS.t1);
  },

  start() {
    this.active = true;
    this.last = performance.now();
    this.spawn();
    this.raf = requestAnimationFrame(this.loop);
  },

  speed() { return 50 + (this.level - 1) * 9; },

  spawn() {
    const text = this.queue.shift();
    this.queue.push(this.word());
    $('.bnext').textContent = this.queue[0];
    const el = document.createElement('div');
    el.className = 'bpiece falling';
    this.well.appendChild(el);
    const p = { text, pos: 0, y: -ROW, el };
    this.render(p);
    p.x = Math.floor(Math.random() * Math.max(1, WELL_W - el.offsetWidth - 8)) + 4;
    this.piece = p;
    this.move(p);
  },

  render(p) {
    p.el.innerHTML = `<span class="t">${esc(p.text.slice(0, p.pos))}</span>${esc(p.text.slice(p.pos))}`;
  },

  move(p) { p.el.style.transform = `translate(${p.x}px, ${p.y}px)`; },

  stackTop() { return WELL_H - this.stack.length * ROW; },

  layoutStack() {
    this.stack.forEach((s, i) => {
      s.y = WELL_H - (i + 1) * ROW;
      this.move(s);
    });
  },

  loop: function loop(ts) {
    const self = Scenes.bloques;
    if (!self.active) return;
    const dt = Math.max(0, Math.min(50, ts - self.last)) / 1000;
    self.last = ts;
    const p = self.piece;
    if (p) {
      p.y += self.speed() * dt;
      if (p.y + ROW >= self.stackTop()) self.land(p);
      else self.move(p);
    }
    if (self.active) self.raf = requestAnimationFrame(loop);
  },

  land(p) {
    Sfx.hurt();
    if (this.target === p) this.target = null;
    p.pos = 0;
    p.el.classList.remove('falling', 'target');
    p.el.classList.add('stuck');
    this.render(p);
    this.stack.push(p);
    this.layoutStack();
    this.piece = null;
    if (this.stack.length >= MAX_ROWS) { this.gameOver(); return; }
    this.spawn();
  },

  clear(p) {
    Sfx.pop();
    this.target = null;
    p.el.classList.add('pop');
    setTimeout(() => p.el.remove(), 250);
    if (p === this.piece) {
      this.score += p.text.length;
      this.piece = null;
      this.spawn();
    } else {
      this.stack.splice(this.stack.indexOf(p), 1);
      this.layoutStack();
      this.score += p.text.length * 2;
      this.lines++;
      this.flash('¡LINEA!');
    }
    this.cleared++;
    if (this.cleared % 8 === 0) {
      this.level++;
      Sfx.levelup();
      this.flash(`¡NIVEL ${this.level}!`);
    }
    $('.bscore').textContent = this.score;
    $('.blevel').textContent = this.level;
    $('.blines').textContent = this.lines;
  },

  flash(text) {
    const el = document.createElement('div');
    el.className = 'bflash';
    el.textContent = text;
    this.well.appendChild(el);
    setTimeout(() => el.remove(), 900);
  },

  key(k) {
    let p = this.target;
    if (p) {
      const expected = p.text[p.pos];
      if (!keyMatches(expected, k)) { Stats.record(expected, false); Sfx.error(); return; }
      Stats.record(expected, true);
    } else {
      // Primero la pieza que cae; si no empieza con esa letra, la apilada más baja que sí.
      const options = [this.piece, ...this.stack].filter((x) => x && keyMatches(x.text[0], k));
      if (!options.length) { Sfx.error(); return; }
      p = options[0];
      Stats.record(p.text[0], true);
    }
    p.pos++;
    if (p.pos >= p.text.length) { this.clear(p); return; }
    Sfx.key();
    this.target = p;
    p.el.classList.add('target');
    this.render(p);
  },

  gameOver() {
    this.active = false;
    this.over = true;
    Music.stop();
    Sfx.lose();
    const a = Save.data.arcade || (Save.data.arcade = {});
    const record = this.score > (a.bloques || 0);
    if (record) a.bloques = this.score;
    const pages = [`GAME OVER<br><br>Puntos: ${this.score} · Líneas: ${this.lines}${record ? '<br>¡NUEVO RECORD!' : ''}`];
    if (this.score >= 40 && Quests.state('arcade') !== 'done') {
      Save.data.treasures.ficha = true;
      Quests.complete('arcade');
      pages.push(`¡Ganaste la ${TREASURES.ficha.name.toUpperCase()}!`);
    }
    Save.write();
    const box = $('.bover');
    box.classList.remove('hidden');
    box.innerHTML = `<div class="bover-text">${pages.join('<br><br>')}</div><div class="bover-menu"></div>`;
    this.menu = new ListMenu($('.bover-menu'), [{ label: 'Otra vez' }, { label: 'Salir' }], {
      cols: 2,
      onPick: (i) => (i === 0 ? Game.go('bloques', { back: this.back }) : Game.go(this.back)),
    });
  },

  onKey(e) {
    if (this.over) { this.menu.key(e); return; }
    if (e.key === 'Escape') { Game.go(this.back); return; }
    if (!this.active || e.repeat || e.key.length !== 1 || e.key === ' ') return;
    this.key(e.key);
  },
};
