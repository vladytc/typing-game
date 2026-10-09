// Piezas de interfaz compartidas: cajas de diálogo y menús.

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const isConfirm = (e) => e.key === 'Enter' || e.key === 'z' || e.key === 'Z';
const isCancel = (e) => e.key === 'Escape' || e.key === 'x' || e.key === 'X' || e.key === 'Backspace';
// La fuente pixelada no tiene mayúsculas con acento, así que se quitan (la Ñ sí existe).
const upper = (s) => String(s).toUpperCase().replace(/[ÁÉÍÓÚÜ]/g, (c) => c.normalize('NFD')[0]);
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Texto que aparece letra por letra, estilo RPG. Con wait:false solo escribe
// una página y no espera ENTER (para el texto de ambiente del menú).
class Dialog {
  constructor(el, pages, onDone, { wait = true } = {}) {
    this.el = el;
    this.pages = pages;
    this.onDone = onDone;
    this.wait = wait;
    this.i = 0;
    this.show();
  }
  show() {
    this.full = this.pages[this.i];
    this.n = 0;
    this.typing = true;
    clearInterval(this.iv);
    this.iv = setInterval(() => {
      this.n++;
      if (this.n % 2) Sfx.text();
      if (this.n >= this.full.length) this.finishPage();
      else this.render();
    }, 26);
    this.render();
  }
  render() {
    const more = !this.typing && this.wait ? '<span class="more">▼</span>' : '';
    this.el.innerHTML = esc(this.full.slice(0, this.n)).replace(/\n/g, '<br>') + more;
  }
  finishPage() {
    clearInterval(this.iv);
    this.n = this.full.length;
    this.typing = false;
    this.render();
  }
  key(e) {
    if (!isConfirm(e)) return;
    if (this.typing) { this.finishPage(); return; }
    if (!this.wait) return;
    this.i++;
    if (this.i >= this.pages.length) { this.stop(); this.onDone && this.onDone(); } else this.show();
  }
  stop() { clearInterval(this.iv); }
}

// Lista de opciones con el corazón como cursor. También funciona con el mouse.
class ListMenu {
  constructor(el, items, { cols = 1, onPick, onCancel, onMove, start = 0 } = {}) {
    Object.assign(this, { el, items, cols, onPick, onCancel, onMove, i: start });
    this.render();
  }
  render() {
    this.el.innerHTML = `<div class="list cols-${this.cols}">${this.items.map((it, i) =>
      `<div class="opt ${i === this.i ? 'sel' : ''} ${it.disabled ? 'dis' : ''}" data-i="${i}">${esc(it.label)}</div>`).join('')}</div>`;
    this.el.querySelectorAll('.opt').forEach((o) => {
      o.onclick = () => { this.i = +o.dataset.i; this.pick(); };
    });
  }
  move(d) {
    const n = this.items.length;
    this.i = (this.i + d + n) % n;
    Sfx.move();
    this.render();
    this.onMove && this.onMove(this.i);
  }
  pick() {
    if (this.items[this.i].disabled) { Sfx.error(); return; }
    Sfx.confirm();
    this.onPick && this.onPick(this.i);
  }
  key(e) {
    if (e.key === 'ArrowDown') this.move(this.cols);
    else if (e.key === 'ArrowUp') this.move(-this.cols);
    else if (e.key === 'ArrowRight' && this.cols > 1) this.move(1);
    else if (e.key === 'ArrowLeft' && this.cols > 1) this.move(-1);
    else if (isConfirm(e)) this.pick();
    else if (isCancel(e) && this.onCancel) { Sfx.move(); this.onCancel(); }
  }
}

// Respuesta escrita: el jugador teclea una de las opciones para elegirla.
// Solo acepta letras que sigan alguna opción; BORRAR corrige.
class ChoicePrompt {
  // onPick(i, { ms, errors }) recibe también cuánto tardó (desde la primera letra) y los errores.
  // tags: texto pequeño opcional junto a cada opción (por ejemplo, el tipo de un ataque).
  constructor(el, options, onPick, { prompt = 'Escribe tu respuesta:', tags = [] } = {}) {
    Object.assign(this, { el, options, onPick, prompt, tags, buf: '', done: false, errors: 0, t0: 0 });
    this.render();
  }
  fits(opt, text) {
    return opt.length >= text.length && [...text].every((c, i) => keyMatches(opt[i], c));
  }
  key(e) {
    if (this.done) return;
    if (e.key === 'Backspace') { this.buf = this.buf.slice(0, -1); this.render(); return; }
    if (e.key.length !== 1 || e.repeat) return;
    const next = this.buf + e.key;
    const live = this.options.filter((o) => this.fits(o, this.buf));
    if (live.length === 1) Stats.record(live[0][this.buf.length] || e.key, this.fits(live[0], next));
    if (!this.options.some((o) => this.fits(o, next))) { this.errors++; Sfx.error(); this.render(true); return; }
    if (!this.t0) this.t0 = performance.now();
    Sfx.key();
    this.buf = next;
    this.render();
    const picked = this.options.findIndex((o) => o.length === next.length && this.fits(o, next));
    if (picked >= 0) {
      this.done = true;
      Sfx.confirm();
      const ms = performance.now() - this.t0;
      setTimeout(() => this.onPick(picked, { ms, errors: this.errors }), 250);
    }
  }
  render(err = false) {
    const n = this.buf.length;
    this.el.innerHTML = `<div class="choice ${err ? 'err' : ''}">
      <div class="cprompt">${esc(this.prompt)}</div>
      ${this.options.map((o, i) => {
        const live = this.fits(o, this.buf);
        const tag = this.tags[i] ? `<span class="ctag">${esc(this.tags[i])}</span>` : '';
        return `<div class="copt ${live ? '' : 'off'}">▸ <span class="typed">${esc(live ? o.slice(0, n) : '')}</span>${esc(live ? o.slice(n) : o)}${tag}</div>`;
      }).join('')}
    </div>`;
  }
}

function spriteCanvas(name, scale, silhouette = false, cls = '') {
  const c = document.createElement('canvas');
  c.className = cls;
  drawSprite(c, name, { scale, silhouette });
  return c;
}

// Cada pantalla es una "escena" con enter(params), onKey(e) y exit() opcional.
const Scenes = {};
const Game = {
  root: null,
  scene: null,
  go(name, params = {}) {
    if (this.scene && this.scene.exit) this.scene.exit();
    this.scene = Scenes[name];
    this.root.className = `scene-${name}`;
    document.body.className = 'theme-gb'; // cada escena puede cambiarlo (el mapa usa el tema de su mundo)
    this.root.innerHTML = '';
    this.lockUntil = performance.now() + 300;
    this.scene.enter(params);
    if (this.scene.music) Music.play(this.scene.music);
  },
};
