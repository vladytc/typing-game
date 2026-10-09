// Combate normal en la Ciudad Sensor (Wii). Es el MISMO combate de js/scenes/battle.js: si el
// enemigo trae `wii: true` se le agrega (sin tocar battle.js, igual que battle64.js):
//   - el enemigo en 3D limpio y brillante (WiiPoly.models) sobre el "menú" blanco de la consola,
//   - la paleta .theme-wii y la música de batalla Wii,
//   - una forma de leer/escribir propia de cada enemigo (`wiiTask`) y de lluvia (`wiiDodge`),
//   - PAUSA con ESC durante la lluvia.
//
// wiiTask (LUCHAR y ACTUAR):
//   'side'  Sensorín: la palabra salta de izquierda a derecha, una vez de cada lado
//   'half'  Nunchuquín: cada palabra viene partida en dos mitades (se escriben seguidas)
//   'beat'  Zumbito: metrónomo a 100 BPM; escribir letras a ritmo constante pega más
//   'echo'  Muñequito: su frase sale en un globito; hay que copiarla exacta
//   'ticker' Canal Clima: las palabras pasan como en el canal del clima
// wiiDodge:
//   'side'  las palabras caen alternando izquierda / derecha
//   'beat'  una letra exactamente en cada tiempo del metrónomo
//   'echo'  te lanza de regreso las palabras que TÚ escribiste en LUCHAR (copia tus gestos)

// ---------- Tareas de tecleo con otra presentación ----------

// Sensorín: solo se ve la palabra actual, una vez a la izquierda y otra a la derecha.
class WiiSideTask extends TypingTask {
  render(err = false) {
    super.render(err);
    this.wordsEl.classList.add('wii-side');
    this.wordsEl.classList.toggle('right', this.i % 2 === 1);
  }
}

// Nunchuquín: la palabra actual en dos mitades unidas por un cable.
class WiiHalfTask extends TypingTask {
  render(err = false) {
    const text = this.texts[this.i];
    if (text === undefined) { super.render(err); return; }
    const half = Math.ceil(text.length / 2);
    const span = (c, k) => {
      const state = k < this.pos ? 'ok' : k === this.pos ? `next${err ? ' err' : ''}` : '';
      return c === ' ' ? `<span class="c sp ${state}">&nbsp;</span>` : `<span class="c ${state}">${esc(c)}</span>`;
    };
    const chars = [...text];
    const a = chars.slice(0, half).map((c, k) => span(c, k)).join('');
    const b = chars.slice(half).map((c, k) => span(c, k + half)).join('');
    const rest = this.texts.length - this.i - 1;
    this.wordsEl.innerHTML = `<span class="w cur wii-half"><span class="h1">${a}</span><span class="cable"></span><span class="h2">${b}</span></span>`
      + `<span class="wii-rest">${rest > 0 ? `+${rest}` : ''}</span>`
      + (this.tip ? `<div class="tt-tip">${esc(this.tip)}</div>` : '');
  }
}

// Zumbito: metrónomo visible. Guarda cuándo se escribió cada letra para medir el ritmo.
class WiiBeatTask extends TypingTask {
  start() {
    super.start();
    this.beat = WII_BEAT_MS * diff().time;
    this.stamps = [];
    const m = document.createElement('div');
    m.className = 'wii-metro';
    m.innerHTML = '<i></i><span>RITMO</span>';
    $('.tt', this.box).appendChild(m);
    this.metro = m;
    this.metroT0 = performance.now();
    const pulse = () => {
      if (this.done) return;
      const ph = ((performance.now() - this.metroT0) % this.beat) / this.beat;
      m.classList.toggle('on', ph < 0.22);
      this.metroRaf = requestAnimationFrame(pulse);
    };
    this.metroRaf = requestAnimationFrame(pulse);
  }

  // La marca de tiempo se guarda ANTES de procesar la letra: así onUnit ya la ve.
  key(e) {
    if (this.active && !e.repeat && e.key.length === 1) {
      const text = this.texts[this.i];
      const expected = text && text[this.pos];
      if (expected !== undefined && this.match(expected, e.key)) this.stamps.push(performance.now());
    }
    super.key(e);
  }

  stop() { super.stop(); cancelAnimationFrame(this.metroRaf); }

  finish(completed, aborted) { cancelAnimationFrame(this.metroRaf); super.finish(completed, aborted); }
}
const WII_BEAT_MS = 600; // 100 BPM

// Qué tan parejo fue el ritmo: 0 (desordenado) a 1 (como metrónomo). Mide los espacios entre letras.
function wiiSteadiness(stamps, beat) {
  if (!stamps || stamps.length < 3) return 0.5;
  const gaps = [];
  for (let i = 1; i < stamps.length; i++) gaps.push(stamps[i] - stamps[i - 1]);
  const mean = gaps.reduce((s, x) => s + x, 0) / gaps.length;
  const dev = gaps.reduce((s, x) => s + Math.abs(x - mean), 0) / gaps.length;
  const even = Math.max(0, 1 - dev / Math.max(80, mean)); // parejo
  const onBeat = beat ? Math.max(0, 1 - Math.abs(mean - beat) / beat) : 1; // cerca del metrónomo
  return Math.max(0, Math.min(1, even * 0.7 + onBeat * 0.3));
}

// Muñequito: la frase aparece en el globito del enemigo, como si te la dijera.
class WiiEchoTask extends TypingTask {
  render(err = false) {
    super.render(err);
    const b = $('.bubble');
    if (b && this.texts[this.i] !== undefined) {
      b.textContent = `"${this.texts[this.i]}"`;
      b.classList.remove('hidden');
    }
  }
  finish(completed, aborted) {
    const b = $('.bubble');
    if (b) b.classList.add('hidden');
    super.finish(completed, aborted);
  }
  stop() {
    const b = $('.bubble');
    if (b) b.classList.add('hidden');
    super.stop();
  }
}

// Canal Clima: el texto pasa como cintilla de noticias (solo se ve, se escribe igual).
class WiiTickerTask extends TypingTask {
  start() {
    super.start();
    const tt = $('.tt', this.box);
    tt.classList.add('wii-ticker');
    const head = document.createElement('div');
    head.className = 'wii-ticker-head';
    head.textContent = 'CANAL DEL CLIMA · EN VIVO';
    tt.insertBefore(head, tt.firstChild);
  }
}

const WII_TASKS = { side: WiiSideTask, half: WiiHalfTask, beat: WiiBeatTask, echo: WiiEchoTask, ticker: WiiTickerTask };

// ---------- Lluvias con otra forma ----------

// Sensorín: una palabra a la izquierda, la siguiente a la derecha.
class WiiSideDodge extends Dodge {
  spawn() {
    super.spawn();
    const b = this.bullets[this.bullets.length - 1];
    const w = b.el.offsetWidth;
    const half = this.W / 2;
    const left = this.spawned % 2 === 1;
    b.x = left ? 10 + Math.random() * Math.max(0, half - w - 30) : half + 20 + Math.random() * Math.max(0, half - w - 30);
    b.el.classList.add(left ? 'from-left' : 'from-right');
    b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
  }
}

// Zumbito: una letra justo en cada tiempo del metrónomo (no importa la dificultad: el ritmo es el ritmo,
// lo que cambia es qué tan rápido caen).
class WiiBeatDodge extends Dodge {
  start() {
    super.start();
    this.cfg = { ...this.cfg, interval: WII_BEAT_MS * diff().speed };
    $('.dodge-label', this.box).textContent = '¡Bzz! Una letra en cada tiempo';
    this.field.classList.add('wii-beat');
  }
  spawn() {
    super.spawn();
    this.field.classList.remove('tick');
    void this.field.offsetWidth;
    this.field.classList.add('tick');
  }
}

// Muñequito: copia tus gestos. Te lanza las palabras que escribiste en tu último LUCHAR.
class WiiEchoDodge extends Dodge {
  start() {
    super.start();
    $('.dodge-label', this.box).textContent = '¡Te imita! Son tus palabras';
  }
}

const WII_DODGES = { side: WiiSideDodge, beat: WiiBeatDodge, echo: WiiEchoDodge };

// ---------- Envoltura del combate ----------

(() => {
  const base = {
    enter: Scenes.battle.enter, exit: Scenes.battle.exit, runTask: Scenes.battle.runTask,
    startDodge: Scenes.battle.startDodge, onKey: Scenes.battle.onKey, fight: Scenes.battle.fight,
  };

  Scenes.battle.enter = function (params) {
    const def = ENEMIES[params.enemyId];
    if (!def || !def.wii) { base.enter.call(this, params); return; }
    // El tema va antes de dibujar el sprite, para que salga con la paleta de la Wii.
    document.body.className = `theme-${def.theme || 'wii'}`;
    this.paused = null;
    this.echoWords = null;
    base.enter.call(this, params);
    if (!def.music) Music.play(def.boss ? 'wii_cometa' : 'wii_battle');
    $('.battle').classList.add('wii', `wfx-${def.wiiTask || 'none'}`);
    if (def.wiiBackdrop !== false) {
      const back = document.createElement('div');
      back.className = 'wii-backdrop';
      back.innerHTML = '<div class="wii-hand"></div>';
      $('.battle').insertBefore(back, $('.battle').firstChild);
    }
    const tok = this.wiitok = {};
    Poly.load((ok) => {
      if (!ok || Game.scene !== this || this.wiitok !== tok || !def.model) return;
      const host = $('.esprite');
      if (!host) return;
      const v = WiiPoly.view(host, { w: 300, h: 180, alpha: true, fov: 38, cls: 'poly-cv wii-cv bwii' });
      if (!v) return;
      this.vwii = v;
      host.classList.add('has3d');
      const model = WiiPoly.models[def.model](v);
      v.scene.add(model);
      const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.4, 24), new THREE.MeshBasicMaterial({ color: WIIC.navy, transparent: true, opacity: 0.12 }));
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = -1.5;
      v.scene.add(shadow);
      v.camera.position.set(0, 0.7, def.boss ? 8.5 : 7);
      v.camera.lookAt(0, 0.2, 0);
      this.wiiModel = model;
      v.start((dt, t) => {
        if (model.userData.anim) model.userData.anim(t, dt);
        if (this.e && this.e.mercy >= 100) model.rotation.y += dt * 3; // contento: da vueltas
      });
    });
  };

  Scenes.battle.exit = function () {
    if (this.paused) { this.paused.close(); this.paused = null; }
    base.exit.call(this);
    this.wiitok = null;
    if (this.vwii) { this.vwii.dispose(); this.vwii = null; }
  };

  // LUCHAR / ACTUAR / OBJETO con la tarea propia del enemigo.
  Scenes.battle.runTask = function (opts, Klass) {
    const K = Klass || (this.def && this.def.wii && WII_TASKS[this.def.wiiTask]);
    if (!K) { base.runTask.call(this, opts); return; }
    this.phase = 'typing';
    this.renderCmds();
    const { onDone, onUnit } = opts;
    this.task = new K(this.box, {
      caps: !!this.def.caps,
      strict: this.strict,
      ...opts,
      onUnit: (unit) => {
        if (this.def.onWord) this.def.onWord(unit);
        return onUnit ? onUnit(unit) : true;
      },
      onDone: (res) => {
        this.st.chars += res.chars;
        this.st.errors += res.errors;
        this.st.ms += res.ms;
        onDone(res);
      },
    });
    this.task.start();
  };

  // Muñequito guarda lo que escribiste para lanzártelo después.
  Scenes.battle.fight = function () {
    base.fight.call(this);
    if (this.def && this.def.wii && this.def.wiiDodge === 'echo' && this.task) this.echoWords = this.task.texts.slice();
  };

  Scenes.battle.startDodge = function () {
    const def = this.def;
    const K = def && def.wii && WII_DODGES[def.wiiDodge];
    if (!K) { base.startDodge.call(this); return; }
    this.phase = 'dodge';
    const cfg = { caps: !!def.caps, strict: this.strict, ...def.bullets };
    if (def.wiiDodge === 'echo' && this.echoWords && this.echoWords.length) {
      // Sus palabras, partidas en pedacitos que caben en la lluvia.
      const bits = this.echoWords.flatMap((w) => w.split(' ')).filter((w) => w.length <= 9);
      if (bits.length) cfg.pool = bits;
    }
    this.dodge = new K(this.box, cfg, {
      onHit: () => {
        this.p.hp = Math.max(0, this.p.hp - scaledDmg(def.atk));
        this.updateBars();
        this.shake('.pinfo');
        if (this.p.hp <= 0) {
          this.dodge.stop();
          this.phase = 'busy';
          this.later(() => { Sfx.lose(); Game.go('gameover', { enemyId: this.id, back: this.back, scene: def.mode || 'battle' }); }, 600);
        }
      },
      onDone: (res) => {
        this.st.chars += res.chars;
        this.st.errors += res.errors;
        this.toMenu();
      },
    });
    this.dodge.start();
  };

  // ESC durante la lluvia = PAUSA (en todos los combates de la Ciudad Sensor).
  Scenes.battle.onKey = function (e) {
    if (this.def && this.def.wii) {
      if (this.paused) { this.paused.menu.key(e); return; }
      if (e.key === 'Escape' && this.phase === 'dodge' && this.dodge) {
        if (wiiPauseDodge(this, this.dodge, $('.battle'))) { Sfx.move(); return; }
      }
    }
    base.onKey.call(this, e);
  };
})();
