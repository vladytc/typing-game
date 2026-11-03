// Las dos mecánicas de tecleo del combate:
//   TypingTask: escribir palabras o frases contra el reloj (LUCHAR, ACTUAR, OBJETO).
//   Dodge: el turno del enemigo; caen letras/palabras y hay que escribirlas antes de que toquen el suelo.
// Las dos aceptan `caps: true` para exigir las mayúsculas (practicar SHIFT); los acentos siguen sin importar.

// Como keyMatches, pero las mayúsculas cuentan: la letra mayúscula se escribe con SHIFT y la
// minúscula SIN él (si no, se pasaría el nivel dejando SHIFT apretado todo el tiempo).
const isUpper = (ch) => ch !== ch.toLowerCase();
const isLower = (ch) => ch !== ch.toUpperCase();
function capsMatch(expected, typed) {
  if (isUpper(expected)) return typed === expected || (norm(typed) === norm(expected) && isUpper(typed));
  if (isLower(expected) && isUpper(typed)) return false;
  return keyMatches(expected, typed);
}

// Modo estricto (opcional, desde el Mundo 3): los acentos y la ñ sí cuentan; las mayúsculas no.
// Se puede apagar en toda la partida con Save.data.strictAccents = false.
const strictOn = (wanted) => !!wanted && Save.data.strictAccents !== false;
function strictMatch(expected, typed) {
  return typed === expected || typed.toLowerCase() === expected.toLowerCase();
}
// ¿Le faltó solo el acento o la tilde? (para darle una pista en vez de solo marcar error)
const missingAccent = (expected, typed) => typed !== expected && norm(typed) === norm(expected);
const accentTip = (ch) => (norm(ch) === 'n' ? '¡Es Ñ, con tilde!' : `¡Lleva acento! ${ch}`);
// Pista para el error en modo estricto ('' si el error no tiene que ver con acentos ni signos).
function strictTip(expected, typed) {
  if (missingAccent(expected, typed)) return accentTip(expected);
  if (expected === '¿' || expected === '¡') return `Empieza con ${expected} (en Mac: Option+1 = ¡, Option+Shift+? = ¿)`;
  return '';
}

// Elige cómo comparar teclas según las reglas activas (se pueden combinar).
function pickMatch({ caps = false, strict = false } = {}) {
  if (caps && strict) return (e, t) => strictMatch(e, t) && isUpper(e) === isUpper(t);
  if (strict) return strictMatch;
  if (caps) return capsMatch;
  return keyMatches;
}

class TypingTask {
  // texts: lista de palabras/frases. onUnit(unit) se llama al terminar cada una;
  // si devuelve false, la tarea se detiene (por ejemplo, porque el enemigo ya cayó).
  // caps: exige mayúsculas (Mundo 2). strict: exige acentos y ñ (Mundo 3, ver strictOn).
  // Trucos de enemigo (opcionales): dust = fracción de letras tapadas con polvo (se ve solo la que
  // toca escribir); flip = las palabras salen de cabeza.
  constructor(box, { label, texts, timeLimit, onUnit, onDone, caps = false, strict = false, dust = 0, flip = false }) {
    Object.assign(this, { box, label, texts, timeLimit: timeLimit * diff().time, onUnit, onDone, strict: strictOn(strict), flip });
    this.match = pickMatch({ caps, strict: this.strict });
    this.totalChars = texts.join('').length;
    // Qué letras lleva tapadas cada palabra (nunca la primera ni los espacios).
    this.dusty = texts.map((t) => [...t].map((c, k) => dust > 0 && k > 0 && c !== ' ' && Math.random() < dust));
  }

  start() {
    Object.assign(this, { i: 0, pos: 0, chars: 0, errors: 0, unitErrors: 0, active: false, done: false });
    this.box.innerHTML = `
      <div class="tt">
        <div class="tt-label">${esc(this.label)}${this.strict ? ' <span class="tt-strict">ACENTOS Y Ñ CUENTAN</span>' : ''}</div>
        <div class="tt-words${this.flip ? ' tt-flip' : ''}"></div>
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
    }, 550); // el "¿LISTO?" dura poquito: el reloj no corre mientras
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
    if (!this.match(expected, e.key)) {
      Stats.record(expected, false);
      this.errors++;
      this.unitErrors++;
      Sfx.error();
      this.tip = this.strict ? strictTip(expected, e.key) : '';
      this.render(true);
      return;
    }
    this.tip = '';
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
    // Letra tapada con polvo (truco dust): se ve hasta que le toca.
    const shown = (j, k, c) => (this.dusty[j] && this.dusty[j][k] && (j > this.i || k > this.pos) ? '▒' : c);
    const charSpan = (c, k) => {
      const state = k < this.pos ? 'ok' : k === this.pos ? `next${err ? ' err' : ''}` : '';
      return c === ' '
        ? `<span class="c sp ${state}">&nbsp;</span>`
        : `<span class="c ${state}">${esc(shown(this.i, k, c))}</span>`;
    };
    const chars = (text) => {
      let k = 0;
      return text.split(/(?<= )/).map((word) =>
        `<span class="wg">${[...word].map((c) => charSpan(c, k++)).join('')}</span>`).join('');
    };
    this.wordsEl.innerHTML = this.texts.map((t, j) => {
      if (j < this.i) return `<span class="w done">${esc(t)}</span>`;
      if (j > this.i) return `<span class="w">${esc([...t].map((c, k) => shown(j, k, c)).join(''))}</span>`;
      return `<span class="w cur">${chars(t)}</span>`;
    }).join(' ') + (this.tip ? `<div class="tt-tip">${esc(this.tip)}</div>` : '');
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

// cfg: count, interval, speed, pool (ver docs/MUNDOS.md), caps, strict, label (texto de arriba) y los
// trucos de enemigo (opcionales): hop (las letras rebotan), slide: px/s (patinan de lado y rebotan
// en las orillas), pairs (caen de dos en dos), dark (la luz se va a ratos), coin: N (una de cada N
// es MONEDA: al escribirla llama onCoin).
class Dodge {
  constructor(box, cfg, { onHit, onDone, onCoin }) {
    Object.assign(this, { box, cfg, onHit, onDone, onCoin });
    this.strict = strictOn(cfg.strict);
    this.match = pickMatch({ caps: cfg.caps, strict: this.strict });
    // Las palabras largas no caen más seguido de lo que un niño de ~30 PPM alcanza a escribir:
    // al menos 360 ms por letra (en Normal) entre una y otra.
    const avg = cfg.pool.reduce((a, w) => a + w.length, 0) / cfg.pool.length;
    this.gap = Math.max(cfg.interval, avg * 360) * (cfg.pairs ? 1.8 : 1); // en pares: casi el mismo ritmo de letras
    // Tesoros con effect.slow: lo que cae baja un pelín más lento.
    this.slow = 1 - treasureBonus('slow') / 100;
  }

  start() {
    this.box.innerHTML = `
      <div class="dodge">
        <div class="dodge-label">${esc(this.cfg.label || '¡Escribe lo que cae!')}</div>
        <div class="ground"></div>
        <div class="heart">♥</div>
      </div>`;
    this.field = $('.dodge', this.box);
    this.heart = $('.heart', this.box);
    this.W = this.field.clientWidth;
    this.groundY = this.field.clientHeight - 30;
    Object.assign(this, { bullets: [], spawned: 0, target: null, chars: 0, errors: 0, active: true, elapsed: 0, nextSpawn: 300, emptyAt: null });
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  loop = (ts) => {
    if (!this.active) return;
    const dt = Math.max(0, Math.min(50, ts - this.last)) / 1000;
    this.last = ts;
    this.elapsed += dt * 1000;
    if (this.spawnDue()) {
      this.spawn(0);
      if (this.cfg.pairs && this.spawned < this.cfg.count) this.spawn(1);
    }
    if (this.cfg.dark) this.field.classList.toggle('dark', this.elapsed % 2600 > 1800); // truco 'apagón'
    for (const b of [...this.bullets]) {
      b.y += this.cfg.speed * diff().speed * this.slow * dt;
      if (b.vx) { // truco 'patina': rebota en las orillas
        b.x += b.vx * dt;
        if (b.x < 6 || b.x > this.W - b.w - 6) { b.vx = -b.vx; b.x = Math.max(6, Math.min(this.W - b.w - 6, b.x)); }
      }
      // Truco 'rebote': saltitos hacia arriba (solo se ve; la caída real no cambia).
      const hop = this.cfg.hop ? -Math.abs(Math.sin(b.y / 16)) * 12 : 0;
      b.el.style.transform = `translate(${b.x}px, ${b.y + hop}px)`;
      if (b.y + b.h >= this.groundY) this.land(b);
    }
    if (!this.active) return;
    if (this.spawned >= this.cfg.count && !this.bullets.length) { this.end(); return; }
    this.raf = requestAnimationFrame(this.loop);
  };

  // ¿Toca soltar la siguiente? (y agenda la que sigue). Si ya escribiste todo lo que había en
  // pantalla, sale casi de inmediato (Dodge.EMPTY_MS): las mismas palabras, sin esperar. Con palabras
  // cayendo se respeta el espaciado mínimo. Las lluvias propias que heredan de Dodge también la usan.
  spawnDue(gap = this.gap / diff().speed) {
    if (this.spawned >= this.cfg.count) return false;
    const early = !this.bullets.length && this.emptyAt != null && this.elapsed >= this.emptyAt + Dodge.EMPTY_MS;
    if (this.elapsed < this.nextSpawn && !early) return false;
    this.nextSpawn = Math.min(this.elapsed, this.nextSpawn) + gap;
    this.emptyAt = null;
    return true;
  }

  // half: con pairs, 0 = mitad izquierda y 1 = mitad derecha (para que no se encimen).
  spawn(half = 0) {
    const b = { text: rand(this.cfg.pool), pos: 0, y: -30 };
    b.coin = !!this.cfg.coin && this.spawned % this.cfg.coin === this.cfg.coin - 1;
    b.el = document.createElement('div');
    b.el.className = `bullet${b.coin ? ' coin' : ''}`;
    this.field.appendChild(b.el);
    this.renderBullet(b);
    const w = b.el.offsetWidth;
    b.w = w;
    b.h = b.el.offsetHeight;
    const room = Math.max(0, this.W - w - 20);
    b.x = 10 + (this.cfg.pairs ? (half + Math.random()) * 0.5 : Math.random()) * room;
    if (this.cfg.slide) b.vx = (Math.random() < 0.5 ? -1 : 1) * this.cfg.slide;
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
    if (!this.bullets.length) this.emptyAt = this.elapsed; // pantalla vacía: ver loop
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
    if (b.coin && this.onCoin) this.onCoin(b);
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
      if (!this.match(expected, k)) {
        Stats.record(expected, false);
        this.errors++;
        Sfx.error();
        return;
      }
      Stats.record(expected, true);
    } else {
      // Sin objetivo: apunta a lo que va más abajo y empieza con esa letra.
      const options = this.bullets.filter((x) => this.match(x.text[0], k));
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
// Con la pantalla vacía, cuánto espera la siguiente palabra (ms).
Dodge.EMPTY_MS = 250;
