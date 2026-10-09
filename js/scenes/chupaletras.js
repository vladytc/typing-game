// Minijuego CHUPA-LETRAS (docs/LORE.md §4.6, guiño a la bolita rosa de 1992).
// 60 segundos. Las palabras flotan despacito hacia la boca de Chupín, en el centro.
// Escribirlas las "come" (+10). Si una llega a la boca sin escribirse, te quita 5 segundos.
// Cada 10 comidas aparece una palabra DORADA (más larga) que vale 50.

const CHL = { time: 60000, mouth: 44, penalty: 5000, goal: 30 };

Scenes.chupaletras = {
  music: 'gb_chupaletras',

  enter({ back = 'town' } = {}) {
    this.back = back;
    const a = Save.data.arcade || {};
    Game.root.innerHTML = `
      <div class="chl">
        <div class="chl-hud">
          <span>PUNTOS <b class="chl-score">0</b></span>
          <span>COMIDAS <b class="chl-eaten">0</b></span>
          <span>TIEMPO <b class="chl-time">60</b></span>
          <span>RECORD <b>${a.chupaletras || 0}</b></span>
        </div>
        <div class="chl-field">
          <div class="chl-mouth"></div>
        </div>
        <div class="chl-help">Escribe las palabras antes de que lleguen a la boca · ESC: pausa</div>
        <div class="box bover chl-over hidden"></div>
      </div>`;
    this.field = $('.chl-field');
    $('.chl-mouth').appendChild(spriteCanvas('chupin', 5, false, 'idle'));
    Object.assign(this, {
      words: [], target: null, score: 0, eaten: 0, left: CHL.time, elapsed: 0, nextSpawn: 400,
      goldPending: false, active: false, over: false, paused: false,
    });
    this.W = this.field.clientWidth || 640;
    this.H = this.field.clientHeight || 400;
    this.readyT = setTimeout(() => this.start(), 600);
  },

  exit() {
    this.active = false;
    cancelAnimationFrame(this.raf);
    clearTimeout(this.readyT);
  },

  start() {
    this.active = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  },

  // Más comidas = palabras un poquito más rápidas.
  speed() { return (22 + Math.min(this.eaten, 40) * 0.6) * diff().speed; },
  interval() { return Math.max(1100, 2300 - this.eaten * 30) / diff().speed; },

  spawn(gold = false) {
    const pool = gold ? WORDS.t2 : WORDS.t1.concat(ENEMIES.chupin ? ENEMIES.chupin.words : []);
    const used = this.words.map((w) => norm(w.text[0]));
    // Que no empiecen con la misma letra que otra en pantalla (así es claro a cuál apuntas).
    const fresh = pool.filter((t) => !used.includes(norm(t[0])));
    const text = rand(fresh.length ? fresh : pool);
    const w = { text, pos: 0, gold };
    w.el = document.createElement('div');
    w.el.className = `chl-word${gold ? ' gold' : ''}`;
    this.field.appendChild(w.el);
    this.render(w);
    // Aparece en una orilla y viaja hacia el centro.
    const ang = Math.random() * Math.PI * 2;
    const r = Math.max(this.W, this.H) * 0.62;
    w.x = this.W / 2 + Math.cos(ang) * r;
    w.y = this.H / 2 + Math.sin(ang) * r * 0.75;
    w.x = Math.max(0, Math.min(this.W - 60, w.x));
    w.y = Math.max(0, Math.min(this.H - 30, w.y));
    this.move(w);
    this.words.push(w);
  },

  render(w, err = false) {
    w.el.innerHTML = `<span class="t">${esc(w.text.slice(0, w.pos))}</span><span class="${err ? 'nx bad' : 'nx'}">${esc(w.text.slice(w.pos, w.pos + 1))}</span>${esc(w.text.slice(w.pos + 1))}`;
  },

  move(w) { w.el.style.transform = `translate(${w.x}px, ${w.y}px)`; },

  loop: function loop(ts) {
    const self = Scenes.chupaletras;
    if (!self.active) return;
    const dt = Math.max(0, Math.min(50, ts - self.last));
    self.last = ts;
    self.left -= dt;
    self.elapsed += dt;
    if (self.elapsed >= self.nextSpawn && self.words.length < 6) {
      self.spawn(self.goldPending);
      self.goldPending = false;
      self.nextSpawn = self.elapsed + self.interval();
    }
    const cx = self.W / 2;
    const cy = self.H / 2;
    for (const w of [...self.words]) {
      const wx = w.x + w.el.offsetWidth / 2;
      const wy = w.y + 14;
      const dx = cx - wx;
      const dy = cy - wy;
      const dist = Math.hypot(dx, dy);
      if (dist < CHL.mouth) { self.bite(w); continue; }
      const v = self.speed() * (w.gold ? 0.8 : 1) * (dt / 1000);
      w.x += (dx / dist) * v;
      w.y += (dy / dist) * v;
      self.move(w);
    }
    self.hud();
    if (self.left <= 0) { self.gameOver(); return; }
    self.raf = requestAnimationFrame(loop);
  },

  remove(w) {
    this.words.splice(this.words.indexOf(w), 1);
    if (this.target === w) this.target = null;
  },

  // Llegó a la boca sin que la escribieras: Chupín se la come solo y te roba tiempo.
  bite(w) {
    this.remove(w);
    w.el.remove();
    this.left -= CHL.penalty;
    Sfx.hurt();
    this.flash('-5 s');
    const m = $('.chl-mouth');
    m.classList.remove('shake');
    void m.offsetWidth;
    m.classList.add('shake');
  },

  // ¡Te la comiste!
  eat(w) {
    this.remove(w);
    Sfx.pop();
    w.el.classList.add('pop');
    setTimeout(() => w.el.remove(), 250);
    this.score += w.gold ? 50 : 10;
    this.eaten++;
    if (w.gold) { Sfx.coin(); this.flash('¡DORADA! +50'); }
    if (this.eaten % 10 === 0) this.goldPending = true;
  },

  flash(text) {
    const el = document.createElement('div');
    el.className = 'bflash';
    el.textContent = text;
    this.field.appendChild(el);
    setTimeout(() => el.remove(), 900);
  },

  hud() {
    $('.chl-score').textContent = this.score;
    $('.chl-eaten').textContent = this.eaten;
    $('.chl-time').textContent = Math.max(0, Math.ceil(this.left / 1000));
  },

  key(k) {
    let w = this.target;
    if (w) {
      const expected = w.text[w.pos];
      if (!keyMatches(expected, k)) { Stats.record(expected, false); Sfx.error(); this.render(w, true); return; }
      Stats.record(expected, true);
    } else {
      // Sin objetivo: la que está más cerca de la boca y empieza con esa letra.
      const options = this.words.filter((x) => keyMatches(x.text[0], k));
      if (!options.length) { Sfx.error(); return; }
      const d = (x) => Math.hypot(this.W / 2 - x.x, this.H / 2 - x.y);
      w = options.reduce((a, x) => (d(x) < d(a) ? x : a));
      Stats.record(w.text[0], true);
    }
    w.pos++;
    if (w.pos >= w.text.length) { this.eat(w); return; }
    Sfx.key();
    this.target = w;
    w.el.classList.add('target');
    this.render(w);
  },

  pause() {
    this.paused = true;
    this.active = false;
    cancelAnimationFrame(this.raf);
    const box = $('.chl-over');
    box.classList.remove('hidden');
    box.innerHTML = '<div class="bover-text">PAUSA</div><div class="bover-menu"></div>';
    const resume = () => {
      box.classList.add('hidden');
      this.paused = false;
      this.start();
    };
    this.menu = new ListMenu($('.bover-menu', box), [{ label: 'Seguir' }, { label: 'Salir' }], {
      cols: 2,
      onPick: (i) => (i === 0 ? resume() : Game.go(this.back)),
      onCancel: resume,
    });
  },

  gameOver() {
    this.active = false;
    this.over = true;
    cancelAnimationFrame(this.raf);
    Music.stop();
    Sfx.win();
    this.hud();
    const a = Save.data.arcade || (Save.data.arcade = {});
    const record = this.score > (a.chupaletras || 0);
    if (record) a.chupaletras = this.score;
    a.chupaEaten = Math.max(a.chupaEaten || 0, this.eaten);
    const pages = [`¡TIEMPO!<br><br>Puntos: ${this.score} · Comidas: ${this.eaten}${record ? '<br>¡NUEVO RECORD!' : ''}`];
    if (this.eaten >= CHL.goal && Quests.state('dulces_suenos') !== 'done') {
      Save.data.treasures.tomate = true;
      Quests.complete('dulces_suenos');
      pages.push(`¡Ganaste el ${upper(TREASURES.tomate.name)}!`);
    } else if (Quests.state('dulces_suenos') === 'active') {
      pages.push(`(Misión: cómete ${CHL.goal} en una partida)`);
    }
    Save.write();
    const box = $('.chl-over');
    box.classList.remove('hidden');
    box.innerHTML = `<div class="bover-text">${pages.join('<br><br>')}</div><div class="bover-menu"></div>`;
    this.menu = new ListMenu($('.bover-menu', box), [{ label: 'Otra vez' }, { label: 'Salir' }], {
      cols: 2,
      onPick: (i) => (i === 0 ? Game.go('chupaletras', { back: this.back }) : Game.go(this.back)),
    });
  },

  onKey(e) {
    if (this.over || this.paused) { this.menu.key(e); return; }
    if (e.key === 'Escape') { if (this.active) this.pause(); return; }
    if (!this.active || e.repeat || e.key.length !== 1 || e.key === ' ') return;
    this.key(e.key);
  },
};
