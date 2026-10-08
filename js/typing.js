// Las dos mecánicas de tecleo del combate:
//   TypingTask: escribir palabras o frases contra el reloj (LUCHAR, ACTUAR, OBJETO).
//   Dodge: el turno del enemigo; caen letras/palabras y hay que escribirlas antes de que toquen el suelo.

class TypingTask {
  // texts: lista de palabras/frases. onUnit(unit) se llama al terminar cada una;
  // si devuelve false, la tarea se detiene (por ejemplo, porque el enemigo ya cayó).
  constructor(box, { label, texts, timeLimit, onUnit, onDone }) {
    Object.assign(this, { box, label, texts, timeLimit, onUnit, onDone });
    this.totalChars = texts.join('').length;
  }

  start() {
    Object.assign(this, { i: 0, pos: 0, chars: 0, errors: 0, unitErrors: 0, active: false, done: false });
    this.box.innerHTML = `
      <div class="tt">
        <div class="tt-label">${esc(this.label)}</div>
        <div class="tt-words"></div>
        <div class="tt-timer"><i></i></div>
        <div class="tt-ready">¿LISTO?</div>
      </div>`;
    this.wordsEl = $('.tt-words', this.box);
    this.barEl = $('.tt-timer i', this.box);
    this.render();
    this.readyT = setTimeout(() => {
      const r = $('.tt-ready', this.box);
      if (r) { r.textContent = '¡YA!'; setTimeout(() => r.remove(), 350); }
      this.active = true;
      this.t0 = this.unitT0 = performance.now();
      this.tick();
    }, 750);
  }

  tick = () => {
    if (!this.active) return;
    const left = 1 - (performance.now() - this.t0) / this.timeLimit;
    this.barEl.style.width = `${Math.max(0, left) * 100}%`;
    this.barEl.classList.toggle('low', left < 0.25);
    if (left <= 0) { this.finish(false); return; }
    this.raf = requestAnimationFrame(this.tick);
  };

  key(e) {
    if (!this.active || e.repeat || e.key.length !== 1) return;
    const text = this.texts[this.i];
    const expected = text[this.pos];
    if (!keyMatches(expected, e.key)) {
      Stats.record(expected, false);
      this.errors++;
      this.unitErrors++;
      Sfx.error();
      this.render(true);
      return;
    }
    Stats.record(expected, true);
    Sfx.key();
    this.pos++;
    this.chars++;
    if (this.pos < text.length) { this.render(); return; }

    const now = performance.now();
    const unit = { text, ms: now - this.unitT0, errors: this.unitErrors };
    this.i++;
    this.pos = 0;
    this.unitErrors = 0;
    this.unitT0 = now;
    this.render();
    const keepGoing = this.onUnit ? this.onUnit(unit) !== false : true;
    if (!keepGoing) this.finish(true, true);
    else if (this.i >= this.texts.length) this.finish(true);
  }

  render(err = false) {
    // Cada palabra va en un grupo que no se parte, para que las frases largas
    // salten de línea entre palabras y no a la mitad.
    const charSpan = (c, k) => {
      const state = k < this.pos ? 'ok' : k === this.pos ? `next${err ? ' err' : ''}` : '';
      return c === ' '
        ? `<span class="c sp ${state}">&nbsp;</span>`
        : `<span class="c ${state}">${esc(c)}</span>`;
    };
    const chars = (text) => {
      let k = 0;
      return text.split(/(?<= )/).map((word) =>
        `<span class="wg">${[...word].map((c) => charSpan(c, k++)).join('')}</span>`).join('');
    };
    this.wordsEl.innerHTML = this.texts.map((t, j) => {
      if (j < this.i) return `<span class="w done">${esc(t)}</span>`;
      if (j > this.i) return `<span class="w">${esc(t)}</span>`;
      return `<span class="w cur">${chars(t)}</span>`;
    }).join(' ');
  }

  finish(completed, aborted = false) {
    if (this.done) return;
    this.done = true;
    this.active = false;
    cancelAnimationFrame(this.raf);
    clearTimeout(this.readyT);
    const ms = this.t0 ? performance.now() - this.t0 : 0;
    this.onDone && this.onDone({
      completed, aborted, ms,
      chars: this.chars, errors: this.errors,
      progress: this.totalChars ? this.chars / this.totalChars : 0,
    });
  }

  stop() {
    this.done = true;
    this.active = false;
    cancelAnimationFrame(this.raf);
    clearTimeout(this.readyT);
  }
}

class Dodge {
  constructor(box, cfg, { onHit, onDone }) {
    Object.assign(this, { box, cfg, onHit, onDone });
  }

  start() {
    this.box.innerHTML = `
      <div class="dodge">
        <div class="dodge-label">¡Escribe lo que cae!</div>
        <div class="ground"></div>
        <div class="heart">♥</div>
      </div>`;
    this.field = $('.dodge', this.box);
    this.heart = $('.heart', this.box);
    this.W = this.field.clientWidth;
    this.groundY = this.field.clientHeight - 30;
    Object.assign(this, { bullets: [], spawned: 0, target: null, chars: 0, errors: 0, active: true, elapsed: 0, nextSpawn: 300 });
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  loop = (ts) => {
    if (!this.active) return;
    const dt = Math.max(0, Math.min(50, ts - this.last)) / 1000;
    this.last = ts;
    this.elapsed += dt * 1000;
    if (this.spawned < this.cfg.count && this.elapsed >= this.nextSpawn) {
      this.spawn();
      this.nextSpawn += this.cfg.interval;
    }
    for (const b of [...this.bullets]) {
      b.y += this.cfg.speed * dt;
      b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
      if (b.y + b.h >= this.groundY) this.land(b);
    }
    if (!this.active) return;
    if (this.spawned >= this.cfg.count && !this.bullets.length) { this.end(); return; }
    this.raf = requestAnimationFrame(this.loop);
  };

  spawn() {
    const b = { text: rand(this.cfg.pool), pos: 0, y: -30 };
    b.el = document.createElement('div');
    b.el.className = 'bullet';
    this.field.appendChild(b.el);
    this.renderBullet(b);
    const w = b.el.offsetWidth;
    b.h = b.el.offsetHeight;
    b.x = 10 + Math.random() * Math.max(0, this.W - w - 20);
    b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
    this.bullets.push(b);
    this.spawned++;
  }

  renderBullet(b) {
    b.el.innerHTML = `<span class="t">${esc(b.text.slice(0, b.pos))}</span>${esc(b.text.slice(b.pos))}`;
  }

  removeBullet(b) {
    const i = this.bullets.indexOf(b);
    if (i >= 0) this.bullets.splice(i, 1);
    if (this.target === b) this.target = null;
  }

  land(b) {
    this.removeBullet(b);
    b.el.remove();
    Sfx.hurt();
    this.heart.classList.remove('hurt');
    void this.heart.offsetWidth;
    this.heart.classList.add('hurt');
    this.onHit();
  }

  destroy(b) {
    this.removeBullet(b);
    Sfx.pop();
    b.el.classList.add('pop');
    setTimeout(() => b.el.remove(), 250);
  }

  key(e) {
    if (!this.active || e.repeat || e.key.length !== 1 || e.key === ' ') return;
    const k = e.key;
    let b = this.target;
    if (b) {
      const expected = b.text[b.pos];
      if (!keyMatches(expected, k)) {
        Stats.record(expected, false);
        this.errors++;
        Sfx.error();
        return;
      }
      Stats.record(expected, true);
    } else {
      // Sin objetivo: apunta a lo que va más abajo y empieza con esa letra.
      const options = this.bullets.filter((x) => keyMatches(x.text[0], k));
      if (!options.length) { this.errors++; Sfx.error(); return; }
      b = options.reduce((a, x) => (x.y > a.y ? x : a));
      Stats.record(b.text[0], true);
    }
    this.chars++;
    b.pos++;
    if (b.pos >= b.text.length) { this.destroy(b); return; }
    Sfx.key();
    this.target = b;
    b.el.classList.add('target');
    this.renderBullet(b);
  }

  end() {
    this.active = false;
    this.onDone({ chars: this.chars, errors: this.errors });
  }

  stop() {
    this.active = false;
    cancelAnimationFrame(this.raf);
  }
}
