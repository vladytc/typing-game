// JEFE SECRETO: VISORIO (Virtual Boy, 1995) y el minijuego ECO ROJO. Diseño en docs/LORE.md §11.2.
// Mecánica "Profundidad": las palabras salen en DOS CAPAS (adelante = rojo brillante, atrás = rojo
// oscuro). Hay que escribir SIEMPRE la de adelante. Cada 10 s las capas se intercambian (un parpadeo
// avisa). Escribir una de atrás = 0 de daño y "se te cansan los ojos" (−3 HP, guiño al aparato real).
// Lo mismo en su lluvia: las de atrás no hacen daño al caer, pero escribirlas cansa la vista.
//   VbLayerTask   la tarea de tecleo en dos capas (LUCHAR de Visorio y ECO ROJO)
//   VbDodge       la lluvia en dos capas
//   Scenes.visorio  el jefe (hereda de la batalla)   ·   Scenes.ecorojo  el minijuego

const VB_SWAP_MS = 10000;

// Elige n palabras con distinta primera letra (así nunca se confunde cuál estás escribiendo).
function vbDistinct(pool, n, avoid = []) {
  const used = new Set(avoid.map((w) => norm(w[0])));
  const out = [];
  for (const w of pickWords(pool, pool.length)) {
    if (out.length >= n) break;
    const k = norm(w[0]);
    if (used.has(k)) continue;
    used.add(k);
    out.push(w);
  }
  return out;
}

class VbLayerTask {
  // rows: [[palabras de la capa 0], [palabras de la capa 1]]. La capa 0 empieza adelante.
  // onWord({ text, ms, errors, layer: 'front'|'back' }) → false para terminar. refill(word) → palabra nueva (minijuego).
  constructor(box, { label, rows, timeLimit, swapMs = VB_SWAP_MS, onWord, onDone, refill = null, strict = false }) {
    Object.assign(this, { box, label, timeLimit: timeLimit * diff().time, swapMs, onWord, onDone, refill });
    this.strict = strictOn(strict);
    this.match = pickMatch({ strict: this.strict });
    this.words = rows.flatMap((list, r) => list.map((text) => ({ text, r, done: false })));
  }

  start() {
    Object.assign(this, { front: 0, buf: '', chars: 0, errors: 0, unitErrors: 0, active: false, done: false, warned: false });
    this.box.innerHTML = `
      <div class="vbl">
        <div class="tt-label">${esc(this.label)}</div>
        <div class="vbl-rows"><div class="vbl-row" data-r="0"></div><div class="vbl-row" data-r="1"></div></div>
        <div class="vbl-tip"></div>
        <div class="tt-timer"><i></i></div>
        <div class="tt-ready">¿LISTO?</div>
      </div>`;
    this.root = $('.vbl', this.box);
    this.barEl = $('.tt-timer i', this.box);
    this.render();
    this.readyT = setTimeout(() => {
      const r = $('.tt-ready', this.box);
      if (r) { r.textContent = '¡YA!'; setTimeout(() => r.remove(), 350); }
      this.active = true;
      this.t0 = this.unitT0 = performance.now();
      this.nextSwap = this.t0 + this.swapMs;
      this.tick();
    }, 750);
  }

  tick = () => {
    if (!this.active) return;
    const now = performance.now();
    const left = 1 - (now - this.t0) / this.timeLimit;
    this.barEl.style.width = `${Math.max(0, left) * 100}%`;
    this.barEl.classList.toggle('low', left < 0.25);
    if (!this.warned && now >= this.nextSwap - 800) { this.warned = true; this.root.classList.add('vbl-warn'); }
    if (now >= this.nextSwap) {
      this.front ^= 1;
      this.nextSwap += this.swapMs;
      this.warned = false;
      this.root.classList.remove('vbl-warn');
      Sfx.move();
      this.render();
    }
    if (left <= 0) { this.finish(false); return; }
    this.raf = requestAnimationFrame(this.tick);
  };

  fits(word, text) {
    return word.length >= text.length && [...text].every((c, i) => this.match(word[i], c));
  }

  key(e) {
    if (!this.active || e.repeat || e.key.length !== 1) return;
    if (e.key === ' ' && !this.buf) return;
    const next = this.buf + e.key;
    const cand = this.words.filter((w) => !w.done && this.fits(w.text, next));
    const live = this.words.filter((w) => !w.done && this.fits(w.text, this.buf));
    if (!cand.length) {
      if (live.length === 1) Stats.record(live[0].text[this.buf.length] || e.key, false);
      this.errors++;
      this.unitErrors++;
      Sfx.error();
      this.render(true);
      return;
    }
    Stats.record(cand[0].text[this.buf.length], true);
    this.buf = next;
    this.chars++;
    Sfx.key();
    const full = cand.find((w) => w.text.length === next.length);
    if (!full) { this.render(); return; }
    const now = performance.now();
    full.done = true;
    const unit = { text: full.text, ms: now - this.unitT0, errors: this.unitErrors, layer: full.r === this.front ? 'front' : 'back' };
    this.buf = '';
    this.unitErrors = 0;
    this.unitT0 = now;
    if (this.refill) {
      const others = this.words.filter((w) => !w.done).map((w) => w.text);
      full.text = this.refill(others);
      full.done = false;
    }
    const keep = this.onWord ? this.onWord(unit) !== false : true;
    this.render();
    if (!keep) { this.finish(true, true); return; }
    if (!this.refill && !this.words.some((w) => !w.done && w.r === this.front)) this.finish(true);
  }

  render(err = false) {
    if (!this.root) return;
    [0, 1].forEach((r) => {
      const el = this.root.querySelector(`.vbl-row[data-r="${r}"]`);
      el.className = `vbl-row ${r === this.front ? 'vbl-front' : 'vbl-back'}`;
      el.innerHTML = this.words.filter((w) => w.r === r).map((w) => {
        if (w.done) return `<span class="vbw done">${esc(w.text)}</span>`;
        const k = this.buf && this.fits(w.text, this.buf) ? this.buf.length : 0;
        return `<span class="vbw ${k ? 'cur' : ''} ${err && k ? 'err' : ''}"><span class="t">${esc(w.text.slice(0, k))}</span>${esc(w.text.slice(k))}</span>`;
      }).join(' ');
    });
  }

  finish(completed, aborted = false) {
    if (this.done) return;
    this.done = true;
    this.active = false;
    cancelAnimationFrame(this.raf);
    clearTimeout(this.readyT);
    const ms = this.t0 ? performance.now() - this.t0 : 0;
    const front = this.words.filter((w) => w.r === 0);
    this.onDone && this.onDone({ completed, aborted, ms, chars: this.chars, errors: this.errors, progress: front.length ? front.filter((w) => w.done).length / front.length : 0 });
  }

  stop() {
    this.done = true;
    this.active = false;
    cancelAnimationFrame(this.raf);
    clearTimeout(this.readyT);
  }
}

// La lluvia en dos capas: solo la de ADELANTE duele al caer; escribir la de atrás cansa la vista.
class VbDodge extends Dodge {
  start() {
    super.start();
    this.front = 0;
    this.nextSwap = VB_SWAP_MS;
    this.warned = false;
    this.field.classList.add('vb-dodge');
    const lab = $('.dodge-label', this.box);
    if (lab) lab.textContent = 'Solo la capa de ADELANTE hace daño';
  }

  spawn() {
    super.spawn();
    const b = this.bullets[this.bullets.length - 1];
    b.r = Math.random() < 0.6 ? this.front : 1 - this.front;
    this.layer(b);
  }

  layer(b) { b.el.classList.toggle('vb-back', b.r !== this.front); }

  loop = (ts) => {
    if (!this.active) return;
    const dt = Math.max(0, Math.min(50, ts - this.last)) / 1000;
    this.last = ts;
    this.elapsed += dt * 1000;
    if (!this.warned && this.elapsed >= this.nextSwap - 800) { this.warned = true; this.field.classList.add('vb-warn'); }
    if (this.elapsed >= this.nextSwap) {
      this.front ^= 1;
      this.nextSwap += VB_SWAP_MS;
      this.warned = false;
      this.field.classList.remove('vb-warn');
      this.bullets.forEach((b) => this.layer(b));
    }
    if (this.spawned < this.cfg.count && this.elapsed >= this.nextSpawn) {
      this.spawn();
      this.nextSpawn += this.gap / diff().speed; // como la lluvia normal: no más seguido de lo que alcanza un niño
    }
    for (const b of [...this.bullets]) {
      b.y += this.cfg.speed * diff().speed * dt * (b.r === this.front ? 1 : 0.8);
      b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
      if (b.y + b.h >= this.groundY) this.land(b);
    }
    if (!this.active) return;
    if (this.spawned >= this.cfg.count && !this.bullets.length) { this.end(); return; }
    this.raf = requestAnimationFrame(this.loop);
  };

  land(b) {
    if (b.r !== this.front) {
      this.removeBullet(b);
      b.el.classList.add('pop');
      setTimeout(() => b.el.remove(), 250);
      return;
    }
    super.land(b);
  }

  destroy(b) {
    if (b.r !== this.front && this.cfg.onEye) this.cfg.onEye();
    super.destroy(b);
  }
}

Scenes.visorio = Object.assign(Object.create(Scenes.battle), {
  enter(params) {
    Scenes.battle.enter.call(this, params);
    $('.battle').classList.add('vb-battle');
  },

  // −3 HP (con la dificultad) por escribir la capa de atrás.
  eyes() {
    this.p.hp = Math.max(0, this.p.hp - scaledDmg(3));
    this.floatText('¡OJOS CANSADOS!');
    Sfx.hurt();
    this.shake('.pinfo');
    this.updateBars();
  },

  checkLose() {
    if (this.p.hp > 0) return false;
    if (this.task) this.task.stop();
    if (this.dodge) this.dodge.stop();
    this.phase = 'busy';
    this.later(() => { Sfx.lose(); Game.go('gameover', { enemyId: this.id, back: this.back, scene: 'visorio' }); }, 600);
    return true;
  },

  fight() {
    const words = vbDistinct(this.def.words, 8);
    const rows = [words.slice(0, 4), words.slice(4, 8)];
    const total = rows[0].join('').length + rows[1].join('').length / 2;
    let dealt = 0;
    this.phase = 'typing';
    this.renderCmds();
    this.task = new VbLayerTask(this.box, {
      label: '¡LUCHAR! Escribe SOLO la capa de ADELANTE (la brillante)',
      rows,
      strict: this.strict,
      timeLimit: total * 600 + 4000,
      onWord: (u) => {
        if (u.layer === 'back') {
          this.eyes();
          return !this.checkLose();
        }
        const { dmg, perfect } = this.damageFor(u);
        dealt += dmg;
        if (perfect) this.st.perfect++;
        this.e.hp = Math.max(0, this.e.hp - dmg);
        perfect ? Sfx.crit() : Sfx.hit();
        this.floatText(perfect ? `¡PERFECTO! -${dmg}` : `-${dmg}`, perfect ? 'crit' : '');
        this.shake('.esprite');
        this.updateBars();
        return this.e.hp > 0;
      },
      onDone: (res) => {
        this.st.chars += res.chars;
        this.st.errors += res.errors;
        this.st.ms += res.ms;
        if (this.p.hp <= 0) return;
        if (this.e.hp <= 0) { this.later(() => this.win(false), 700); return; }
        const pages = [];
        if (dealt === 0) pages.push('* No le hiciste daño. ¿Escribiste la capa de atrás?');
        else if (res.completed) pages.push(`* ¡Capa de adelante completa! Hiciste ${dealt} de daño.`);
        else pages.push(`* Se acabó el tiempo. Hiciste ${dealt} de daño.`);
        this.say(pages, () => this.enemyTurn());
      },
    });
    this.task.start();
  },

  startDodge() {
    this.phase = 'dodge';
    this.dodge = new VbDodge(this.box, { strict: this.strict, ...this.def.bullets, onEye: () => { this.eyes(); this.checkLose(); } }, {
      onHit: () => {
        this.p.hp = Math.max(0, this.p.hp - scaledDmg(this.def.atk));
        this.updateBars();
        this.shake('.pinfo');
        this.checkLose();
      },
      onDone: (res) => {
        this.st.chars += res.chars;
        this.st.errors += res.errors;
        this.toMenu();
      },
    });
    this.dodge.start();
  },
});

// ---------- ECO ROJO: 60 segundos de capas que se turnan. Récord = palabras de ADELANTE. ----------
const VB_ECO_POOL = ['rojo', 'visor', 'lente', 'espejo', 'fondo', 'cerca', 'negro', 'brillo', 'tres', 'ojos', 'mesa', 'gafas', 'umbral',
  'imagen', 'quieto', 'junto', 'abajo', 'hondo', 'kilo', 'yema', 'zona', 'vista', 'luz', 'nube', 'pila', 'dedo', 'gato', 'sol', 'faro', 'eco',
  'capa', 'pata', 'tecla', 'vela', 'nido', 'oso', 'uva', 'isla', 'jugo', 'queso', 'lago', 'mapa', 'rana', 'taza', 'bici', 'dado', 'foco'];

Scenes.ecorojo = {
  music: 'vb_visorio',
  enter({ back = 'town' } = {}) {
    this.back = back;
    this.state = 'play';
    this.score = 0;
    this.combo = 0;
    this.best = 0;
    document.body.className = 'theme-vb';
    Game.root.innerHTML = `
      <div class="ecorojo">
        <h2>ECO ROJO</h2>
        <div class="er-score">ADELANTE: <b class="er-n">0</b> · COMBO: <b class="er-c">0</b> · RECORD: ${(Save.data.arcade || {}).ecorojo || 0}</div>
        <div class="box er-box"></div>
        <div class="er-help">Escribe solo la capa BRILLANTE. Cada 8 segundos se intercambian.</div>
      </div>`;
    const words = vbDistinct(VB_ECO_POOL, 8);
    this.task = new VbLayerTask($('.er-box'), {
      label: '¡Capa de ADELANTE! (60 segundos)',
      rows: [words.slice(0, 4), words.slice(4)],
      timeLimit: 60000,
      swapMs: 8000,
      refill: (others) => vbDistinct(VB_ECO_POOL, 1, others)[0] || rand(VB_ECO_POOL),
      onWord: (u) => {
        if (u.layer === 'front') {
          this.score++;
          this.combo++;
          this.best = Math.max(this.best, this.combo);
          Sfx.coin();
        } else {
          this.combo = 0;
          Sfx.hurt();
        }
        $('.er-n').textContent = this.score;
        $('.er-c').textContent = this.combo;
        return true;
      },
      onDone: () => this.results(),
    });
    this.task.start();
  },

  results() {
    this.state = 'done';
    const a = Save.data.arcade || (Save.data.arcade = {});
    const record = this.score > (a.ecorojo || 0);
    if (record) a.ecorojo = this.score;
    if (this.score >= 25) Quests.complete('eco_rojo');
    Save.write();
    $('.er-box').innerHTML = `<div class="tb-text">* ¡SE ACABO EL TIEMPO!<br>* Capa de adelante: ${this.score} · Mejor combo: ${this.best}${record ? '<br>* ¡¡NUEVO RECORD!!' : ''}<br>* ENTER: otra vez · ESC: salir</div>`;
    Sfx.win();
  },

  exit() { if (this.task) this.task.stop(); },

  onKey(e) {
    if (this.state === 'play') {
      if (e.key === 'Escape') { this.task.stop(); Game.go(this.back); return; }
      this.task.key(e);
      return;
    }
    if (e.key === 'Escape') Game.go(this.back);
    else if (e.key === 'Enter') this.enter({ back: this.back });
  },
};
