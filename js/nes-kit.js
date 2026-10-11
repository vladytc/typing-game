// Kit del Castillo 8-Bit (NES): la paleta, el pintor multicolor y las piezas que comparten
// las escenas del Mundo 2 (mario, kongo, patos, mazmorra, punin, caparazon).
//
// La ley del castillo: cada sprite usa máximo 3 colores + transparente (como en la NES real).

const NES = {
  R: '#d82800', B: '#887000', S: '#fca044', K: '#000000', W: '#fcfcfc', O: '#c84c0c',
  Y: '#f8b800', G: '#00a800', L: '#b8f818', T: '#fcbcb0', D: '#7c7c7c', U: '#5c94fc',
  F: '#f83800', // rojo de la paleta del lore
  M: '#ff00ff', // el color imposible del Glitch (ninguna consola lo muestra)
};

// Pinta filas de letras de NES en un canvas. Sirve para cualquier tamaño de dibujo.
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

// Convierte dibujos NES (16x16 con letras de color) en sprites de 4 tonos con su propia paleta,
// para que el mapa, la batalla y la vitrina los pinten con sus colores de verdad.
function nesArt(art) {
  const sprites = {};
  const palettes = {};
  const TONES = ['d', 'c', 'b', 'a'];
  Object.entries(art).forEach(([id, rows]) => {
    const used = [];
    rows.join('').split('').forEach((ch) => { if (ch !== '.' && !used.includes(ch)) used.push(ch); });
    if (used.length > 4) throw new Error(`Sprite ${id}: más de 4 colores`);
    const tone = {};
    palettes[id] = {};
    used.forEach((ch, i) => { tone[ch] = TONES[i]; palettes[id][TONES[i]] = NES[ch]; });
    sprites[id] = rows.map((r) => r.replace(/[^.]/g, (ch) => tone[ch]));
  });
  return { sprites, palettes };
}

// Paletas para pintar sprites de 4 tonos (héroe, Toby) con colores NES y solo 3 colores.
const NES_TONES = {
  heroe: { a: NES.S, b: NES.R, c: NES.R, d: NES.K },
  toby: { a: NES.W, b: NES.B, c: NES.W, d: NES.K },
};
function paintTones(g, name, x, y, scale, flip = false) {
  if (!flip) { paintSprite(g, name, x, y, scale, NES_TONES[name] || paletteColors()); return; }
  g.save();
  g.translate(x + 16 * scale, y);
  g.scale(-1, 1);
  paintSprite(g, name, 0, 0, scale, NES_TONES[name] || paletteColors());
  g.restore();
}

// Una palabra que se escribe letra por letra, con mayúsculas exigidas (SHIFT).
class NesWord {
  constructor(el, tally) {
    this.el = el;
    this.tally = tally;
    this.set('');
  }
  set(word, hint = '') {
    Object.assign(this, { word, hint, pos: 0, err: false, errors: 0 });
    this.render();
  }
  get done() { return !!this.word && this.pos >= this.word.length; }
  // Devuelve 'ok', 'err', 'done' o null (si no había nada que escribir).
  key(k) {
    if (!this.word || this.done) return null;
    const exp = this.word[this.pos];
    if (!capsMatch(exp, k)) {
      Stats.record(exp, false);
      this.errors++;
      this.tally.errors++;
      this.err = true;
      Sfx.error();
      this.render();
      return 'err';
    }
    Stats.record(exp, true);
    this.tally.chars++;
    this.pos++;
    this.err = false;
    this.render();
    if (this.done) return 'done';
    Sfx.key();
    return 'ok';
  }
  render() {
    const chars = [...this.word].map((c, i) => {
      const cls = i < this.pos ? 'ok' : i === this.pos ? `nx${this.err ? ' bad' : ''}` : '';
      return `<span class="${cls}">${c === ' ' ? '&nbsp;' : esc(c)}</span>`;
    }).join('');
    this.el.innerHTML = `<div class="nw-hint">${esc(this.hint)}</div><div class="nw-word">${chars}</div>`;
  }
}

// Base de las escenas del castillo: lienzo + barra de estado + panel de texto abajo,
// pausa con ESC, diálogos, elecciones escritas y retos de tecleo.
const NES_BASE = {
  mount(cls, hud = '') {
    document.body.className = 'theme-nes';
    Game.root.innerHTML = `
      <div class="nesx ${cls}">
        <canvas class="nesx-cv" width="640" height="300"></canvas>
        <div class="nesx-hud">${hud}</div>
        <div class="nesx-panel"></div>
      </div>`;
    this.cv = $('.nesx-cv');
    this.g = this.cv.getContext('2d');
    this.panel = $('.nesx-panel');
    this.tally = { chars: 0, errors: 0, t0: performance.now() };
    this.waits = [];
    this.ui = null;
    this.paused = false;
    this.noPause = false; // se prende al ganar, para no saltarse el premio con ESC
    this.paje = false;
    this.pops = [];
    this.running = true;
    this.last = performance.now();
    const loop = (ts) => {
      if (!this.running) return;
      const dt = Math.max(0, Math.min(50, ts - this.last)) / 1000;
      this.last = ts;
      if (!this.paused) {
        // Primero se separan las esperas cumplidas: sus callbacks pueden agregar esperas nuevas.
        const due = [];
        this.waits = this.waits.filter((w) => {
          w.t -= dt;
          if (w.t > 0) return true;
          due.push(w);
          return false;
        });
        due.forEach((w) => w.fn());
        this.update && this.update(dt);
      }
      this.draw && this.draw(dt);
      if (this.paje) this.drawPaje();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  },

  // Espera que se detiene con la pausa (en segundos).
  after(sec, fn) { this.waits.push({ t: sec, fn }); },

  cleanup() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    if (this.ui && this.ui.stop) this.ui.stop();
    this.ui = null;
    this.waits = [];
  },

  exit() { this.cleanup(); },

  say(pages, done, speaker = '') {
    this.mode = 'ui';
    this.panel.innerHTML = `${speaker ? `<div class="nesx-speaker">${esc(speaker)}</div>` : ''}<div class="tb-text"></div>`;
    this.ui = new Dialog($('.tb-text', this.panel), pages, () => { this.ui = null; done && done(); });
  },

  choose(options, onPick, prompt) {
    this.mode = 'ui';
    this.ui = new ChoicePrompt(this.panel, options, (i, info) => { this.ui = null; onPick(i, info); }, { prompt });
  },

  task(opts) {
    this.mode = 'ui';
    this.ui = new TypingTask(this.panel, {
      caps: true,
      ...opts,
      onDone: (res) => {
        this.tally.chars += res.chars;
        this.tally.errors += res.errors;
        this.ui = null;
        opts.onDone(res);
      },
    });
    this.ui.start();
  },

  // ESC: pausa con "Seguir / Salir". No se puede pausar a media prueba con reloj.
  pause() {
    if (this.paused || this.noPause || this.mode === 'over' || this.ui instanceof TypingTask) return;
    this.paused = true;
    Music.stop();
    const el = document.createElement('div');
    el.className = 'smb-pause';
    el.innerHTML = '<div>PAUSA</div><div class="smb-menu"></div>';
    $('.nesx').appendChild(el);
    const resume = () => {
      el.remove();
      this.paused = false;
      this.pauseMenu = null;
      if (this.musicId) Music.play(this.musicId);
      this.onResume && this.onResume();
    };
    this.pauseMenu = new ListMenu($('.smb-menu', el), [{ label: 'Seguir' }, { label: 'Salir' }], {
      cols: 2,
      onPick: (i) => (i === 0 ? resume() : Game.go(this.back || 'map', this.backParams)),
      onCancel: resume,
    });
  },

  playMusic(id) {
    this.musicId = id;
    Music.play(id);
  },

  // El hongo-paje sale a dar su famoso aviso (castillos 1 y 2).
  drawPaje() {
    const g = this.g;
    g.fillStyle = 'rgba(0, 0, 0, 0.6)';
    g.fillRect(0, 0, 640, 300);
    paintNes(g, NES_ART.paje, 272, 90 + Math.sin(performance.now() / 180) * 4, 6);
  },

  // Reparte la tecla: pausa, interfaz (diálogo, elección, reto) o la acción de la escena.
  routeKey(e) {
    if (this.pauseMenu) { this.pauseMenu.key(e); return; }
    if (e.key === 'Escape') { this.pause(); return; }
    if (this.endMenu) { this.endMenu.key(e); return; }
    if (this.ui) { this.ui.key(e); return; }
    if (e.repeat || e.key.length !== 1) return;
    this.actionKey && this.actionKey(e.key);
  },

  onKey(e) { this.routeKey(e); },

  endMenuShow(items) {
    this.mode = 'over';
    this.panel.innerHTML = '<div class="nesx-end"></div>';
    this.endMenu = new ListMenu($('.nesx-end', this.panel), items.map((it) => ({ label: it.label })), {
      cols: Math.min(3, items.length),
      onPick: (i) => { this.endMenu = null; items[i].go(); },
    });
  },

  calcWpm() {
    const minutes = Math.max(1000, performance.now() - this.tally.t0) / 60000;
    return Math.round((this.tally.chars / 5) / minutes);
  },
  calcAcc() {
    const typed = this.tally.chars + this.tally.errors;
    return typed ? Math.round((this.tally.chars / typed) * 100) : 100;
  },

  // Guarda la victoria (como las otras escenas) y devuelve las páginas del resumen.
  finish(spared) {
    const d = Save.data;
    const def = ENEMIES[this.id];
    const NAME = upper(def.name);
    const wpm = this.calcWpm();
    const acc = this.calcAcc();
    const isRecord = Stats.addBattle({ enemy: this.id, wpm, acc, date: Date.now() });
    const ups = addXp(def.xp);
    const pages = [];
    if (spared !== undefined) {
      pages.push(spared
        ? `* ¡Perdonaste a ${NAME}!\n* Ahora es tu AMIGO.`
        : `* ¡GANASTE!\n* ${NAME} huyó muy lejos.`);
    }
    pages.push(`* Ganaste ${def.xp} XP.\n* Velocidad: ${wpm} PPM · Precisión: ${acc}%`);
    if (isRecord && d.stats.battles.length > 1) pages.push(`* ¡¡NUEVO RECORD DE VELOCIDAD: ${wpm} PPM!!`);
    if (ups) {
      pages.push(`* ¡SUBISTE A NIVEL ${d.level}!\n* Tu HP máximo ahora es ${playerMaxHp()} y pegas más fuerte.`);
      Sfx.levelup();
    }
    if (spared) d.spared[this.id] = true;
    if (!d.done[this.id]) {
      d.done[this.id] = true;
      if (def.drop && !d.treasures[def.drop]) {
        d.treasures[def.drop] = true;
        pages.push(`* Encontraste: ${upper(TREASURES[def.drop].name)}.\n* (Se guardó en tu vitrina.)`);
      }
    }
    Save.write();
    return pages;
  },

  // Texto flotante sobre el lienzo.
  pop(text, x, y, color = NES.W) {
    (this.pops || (this.pops = [])).push({ text, x, y, color, t: 0 });
  },
  drawPops(dt) {
    const g = this.g;
    g.font = '12px "Press Start 2P", TQSym, monospace';
    g.textAlign = 'center';
    this.pops = (this.pops || []).filter((p) => {
      p.t += dt;
      g.fillStyle = p.color;
      g.fillText(p.text, p.x, p.y - p.t * 40);
      return p.t < 1;
    });
    g.textAlign = 'left';
  },

  // Etiqueta de texto con caja negra (palabras sobre barriles, patos, bloques...).
  label(text, x, y, { pos = 0, active = false } = {}) {
    const g = this.g;
    g.font = '14px "Press Start 2P", TQSym, monospace';
    const w = g.measureText(text).width + 12;
    g.fillStyle = active ? NES.W : NES.K;
    g.fillRect(Math.round(x - w / 2), y - 18, w, 24);
    g.fillStyle = active ? NES.K : NES.W;
    g.fillRect(Math.round(x - w / 2) + 2, y - 16, w - 4, 20);
    g.fillStyle = active ? NES.W : NES.K;
    g.fillRect(Math.round(x - w / 2) + 4, y - 14, w - 8, 16);
    let cx = x - w / 2 + 6;
    [...text].forEach((c, i) => {
      g.fillStyle = i < pos ? NES.D : NES.W;
      g.fillText(c, cx, y);
      cx += g.measureText(c).width;
    });
  },
};

// Crea una escena del castillo: Scenes.kongo = nesScene({ enter() {...}, update(dt) {...}, ... }).
// (Se copian los descriptores para que los `get` de la escena sigan siendo getters.)
const nesScene = (own) => Object.defineProperties({ ...NES_BASE }, Object.getOwnPropertyDescriptors(own));

// Barras de la barra de estado (HP, PAZ...).
function nesBar(label, value, max, cls = '') {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return `<span class="nb-label">${label}</span><span class="nb ${cls}"><i style="width:${pct}%"></i></span>`;
}
