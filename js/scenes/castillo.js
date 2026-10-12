// CASTILLO DE LOS CUADROS — el jefe Marco, Rey de los Cuadros (guiño a Super Mario 64, 1996).
// Un pasillo 3D con 8 cuadros. Escribes el nombre de un cuadro y tu personaje salta adentro:
// cada cuadro es un mundo con un reto de tecleo de ~25 s que da una ESTRELLA POLIGONO.
// Si fallas, sales despedido al pasillo (-8 HP). Con las 8 estrellas, escribe MARCO para la
// pelea final (combate normal con el texto dentro de un marco que gira, ver battle64.js).
// Escondidos en las paredes hay letreros (misión "La cámara se atora").

// TypingTask con reglas extra para los cuadros:
//   strictCase: las MAYUSCULAS hay que escribirlas con SHIFT (acentos siguen siendo opcionales)
//   noErrors:   un error y te resbalas: la palabra vuelve a empezar (Arcoíris)
//   freezeMs:   si tardas en EMPEZAR una palabra, se congela y hay que escribir "derretir"
class PolyTask extends TypingTask {
  constructor(box, opts) {
    // caps: así TypingTask usa capsMatch (si no, su this.match tapaba al match de abajo y SHIFT no contaba).
    super(box, { ...opts, texts: [...opts.texts], caps: !!opts.strictCase });
    this.strictCase = !!opts.strictCase;
    this.noErrors = !!opts.noErrors;
    this.freezeMs = opts.freezeMs ? opts.freezeMs * diff().time : 0;
    this.onFreeze = opts.onFreeze;
    this.meta = this.texts.map(() => ({}));
  }

  match(expected, typed) {
    if (this.strictCase && expected !== expected.toLowerCase()) {
      return typed === expected || (norm(typed) === norm(expected) && typed !== typed.toLowerCase());
    }
    return keyMatches(expected, typed);
  }

  tick = () => {
    if (!this.active) return;
    const now = performance.now();
    const m = this.meta[this.i];
    if (this.freezeMs && m && this.pos === 0 && !m.ice && !m.melted && now - this.unitT0 > this.freezeMs) {
      m.melted = true;
      this.texts.splice(this.i, 0, 'derretir');
      this.meta.splice(this.i, 0, { ice: true });
      this.totalChars += 8;
      Sfx.bump();
      if (this.onFreeze) this.onFreeze();
      this.render();
    }
    const left = 1 - (now - this.t0) / this.timeLimit;
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
      if (this.noErrors) this.pos = 0;
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
    super.render(err);
    const m = this.meta && this.meta[this.i];
    const cur = this.wordsEl && $('.w.cur', this.wordsEl);
    if (cur && m && m.ice) cur.classList.add('ice');
  }
}

// Elegir escribiendo, como ChoicePrompt, pero acepta también palabras ESCONDIDAS (no se listan).
class WordPicker {
  constructor(el, options, onPick, { prompt = 'Escribe:', foot = '' } = {}) {
    Object.assign(this, { el, options, onPick, prompt, foot, buf: '', done: false });
    this.render();
  }
  fits(word, text) { return word.length >= text.length && [...text].every((c, i) => keyMatches(word[i], c)); }
  key(e) {
    if (this.done) return;
    if (e.key === 'Backspace') { this.buf = this.buf.slice(0, -1); this.render(); return; }
    if (e.key.length !== 1 || e.repeat || e.key === ' ') return;
    const next = this.buf + e.key;
    if (!this.options.some((o) => this.fits(o.word, next))) { Sfx.error(); this.render(true); return; }
    Sfx.key();
    this.buf = next;
    const hit = this.options.find((o) => o.word.length === next.length && this.fits(o.word, next));
    if (hit) { this.done = true; Sfx.confirm(); this.render(); setTimeout(() => this.onPick(hit), 200); return; }
    this.render();
  }
  render(err = false) {
    const n = this.buf.length;
    const vis = this.options.filter((o) => !o.hidden);
    const hiddenOnly = n && !vis.some((o) => this.fits(o.word, this.buf));
    this.el.innerHTML = `<div class="choice wpick ${err ? 'err' : ''}">
      <div class="cprompt">${esc(this.prompt)}</div>
      <div class="wp-grid">${vis.map((o) => {
        const live = this.fits(o.word, this.buf);
        return `<div class="copt ${live ? '' : 'off'}">${esc(o.tag || '▸')} <span class="typed">${esc(live ? o.word.slice(0, n) : '')}</span>${esc(live ? o.word.slice(n) : o.word)}</div>`;
      }).join('')}</div>
      ${hiddenOnly ? `<div class="copt wp-hidden">▸ <span class="typed">${esc(this.buf)}</span>...</div>` : ''}
      ${this.foot ? `<div class="wp-foot dim">${esc(this.foot)}</div>` : ''}
    </div>`;
  }
}

const PAINT_Z = [-7, -15, -23, -31];
const HIDDEN_WALLS = ['pared', 'esquina', 'techo', 'puerta'];

Scenes.castillo = {
  music: 'n64castle',

  enter({ enemyId = 'marco', back = 'map' } = {}) {
    document.body.className = 'theme-n64';
    Object.assign(this, { id: enemyId, def: ENEMIES[enemyId], back, timers: [], tweens: [], ui: null, phase: 'intro' });
    this.hp = playerMaxHp();
    this.idleAt = performance.now();
    Game.root.innerHTML = `
      <div class="castle">
        <div class="c-3d"></div>
        <div class="c-hud">
          <div class="c-stars"></div>
          <div class="c-hp"><span class="blabel">HP</span><div class="bar"><i></i></div><span class="c-hpn"></span></div>
        </div>
        <div class="c-title"></div>
        <div class="c-flash"></div>
        <div class="box c-box"></div>
      </div>`;
    this.box = $('.c-box');
    this.renderHud();
    Poly.attach(this, $('.castle'), () => this.build3d(), () => { if (this.phase === 'pick') this.pick(); });
    Quests.start('estrellas_perfectas');
    this.idleIv = setInterval(() => this.idleCheck(), 1000);
    this.intro();
  },

  exit() {
    this.tok = null;
    this.timers.forEach(clearTimeout);
    clearInterval(this.idleIv);
    clearInterval(this.clockIv);
    if (this.ui && this.ui.stop) this.ui.stop();
    if (this.v) { this.v.dispose(); this.v = null; }
  },

  later(fn, ms) { this.timers.push(setTimeout(fn, ms)); },

  stars() { return N64S().stars; },
  starCount() { return Object.keys(this.stars()).length; },
  perfectCount() { return Object.values(this.stars()).filter((s) => s === 2).length; },

  renderHud() {
    const st = this.stars();
    $('.c-stars').innerHTML = `★ ${this.starCount()}/8 <span class="c-row">${this.def.paintings.map((p, i) => `<i class="${st[i] === 2 ? 'pf' : st[i] ? 'got' : ''}">★</i>`).join('')}</span>`;
    $('.c-hp .bar i').style.width = `${(this.hp / playerMaxHp()) * 100}%`;
    $('.c-hpn').textContent = `${this.hp}/${playerMaxHp()}`;
  },

  say(pages, done, speaker) {
    this.phase = 'dialog';
    this.box.innerHTML = `${speaker ? `<div class="speaker">${esc(speaker)}</div>` : ''}<div class="tb-text"></div>`;
    this.ui = new Dialog($('.tb-text', this.box), pages, done);
  },
  talk(pages, speaker) { return new Promise((r) => this.say(pages, r, speaker)); },

  async intro() {
    const d = Save.data;
    if (!d.flags.n64castle) {
      d.flags.n64castle = true;
      Save.write();
      await this.talk([
        '* (Entras al castillo. La cámara se atora en una pared.)\n* (...Ya se destrabó.)',
        '* ¡Bienvenido a mi galería! Soy MARCO, REY DE LOS CUADROS.\n* Toda pintura es un mundo. Todo mundo es una pausa.',
        '* El señor morado me pidió guardar las 8 ESTRELLAS POLIGONO en mis cuadros.\n* Así la isla nunca termina de cargar.',
        '* Trescientas ventanas... bueno, ocho cuadros. Presupuesto.',
      ], 'MARCO');
      await this.talk([
        '* ¡Escribe el nombre de un cuadro para saltar adentro!\n* Cada uno tiene un reto. Si lo pasas: ¡ESTRELLA!',
        '* Si fallas, sales volando al pasillo y pierdes un poco de HP.\n* Con las 8 estrellas... escribe MARCO.',
      ], 'BIT');
    }
    this.pick();
  },

  // ---------- Elegir cuadro ----------

  pick() {
    this.phase = 'pick';
    this.idleAt = performance.now();
    const st = this.stars();
    const opts = this.def.paintings.map((p, i) => ({ word: p.word, tag: st[i] === 2 ? '★' : st[i] ? '☆' : '▸', i }));
    if (this.starCount() >= 8 || Save.data.done.marco) opts.push({ word: 'marco', tag: '♛', boss: true });
    HIDDEN_WALLS.forEach((w) => opts.push({ word: w, hidden: true, wall: true }));
    opts.push({ word: 'letrero', hidden: true, sign: true });
    const foot = this.v ? 'ESC: salir · (☆ estrella · ★ perfecta)' : 'ESC: salir · Letreros escondidos: pared, esquina, techo, puerta, letrero';
    this.ui = new WordPicker(this.box, opts, (o) => this.chosen(o), { prompt: 'Escribe el nombre de un cuadro:', foot });
    $('.c-title').textContent = 'CASTILLO DE LOS CUADROS';
  },

  async chosen(o) {
    if (o.wall) { await this.wall(o.word); this.pick(); return; }
    if (o.sign) {
      await this.talk(['* Un letrero dice:\n* "Este castillo tiene menos cuadros que el original.\n* Pero los nuestros hablan."']);
      this.pick();
      return;
    }
    if (o.boss) { this.bossDoor(); return; }
    this.jumpInto(o.i);
  },

  async wall(word) {
    if (this.v) this.lookAt(word);
    if (Quests.state('camara_atora') !== 'active') { await this.talk(['* (La cámara se atora en una pared.)']); return; }
    const w = N64S().walls;
    const fresh = !w[word];
    w[word] = true;
    Save.write();
    const n = HIDDEN_WALLS.filter((x) => w[x]).length;
    await this.talk([`* (La cámara se atora en ${word === 'techo' ? 'el techo' : word === 'pared' ? 'una pared' : word === 'esquina' ? 'una esquina' : 'la puerta'}.)\n* ${fresh ? `¡Encontraste un lugar donde se atora! ${n}/4` : `Ya lo habías encontrado. ${n}/4`}`], 'CAMARA LOCA');
    if (n >= 4) {
      Quests.complete('camara_atora');
      if (!Save.data.treasures.camara_amiga) {
        Save.data.treasures.camara_amiga = true;
        Save.write();
        await this.talk(['* ¡Gracias! Ahora apunta a donde tú quieres. Milagro.\n* Recibiste: CAMARA AMIGA. (Se guardó en tu vitrina.)'], 'CAMARA LOCA');
      }
    }
  },

  async bossDoor() {
    const d = Save.data;
    if (d.done.marco) {
      if (!d.treasures.flauta_poligono) { Game.go('despertar'); return; }
      await this.talk(['* Ahh, por fin cuelgo derechito.\n* Puedes volver a mis cuadros cuando quieras. Por las estrellas perfectas.'], 'MARCO');
      this.pick();
      return;
    }
    await this.talk([
      '* ¡Ocho estrellas! Nadie había llegado tan lejos... bueno, nadie había venido.',
      '* La Nintendo 64 está en el cuadro del sótano, y el cuadro del sótano... soy YO.',
      '* ¡Si me quieres, tendrás que leerme aunque me ponga CHUECO!',
    ], 'MARCO');
    Game.go('battle', { enemyId: this.id, back: 'despertar' });
  },

  // ---------- Saltar al cuadro ----------

  jumpInto(i) {
    this.phase = 'jump';
    this.ui = null;
    this.box.innerHTML = '';
    const p = this.def.paintings[i];
    $('.c-title').textContent = upper(p.name);
    if (!this.v) { this.inside(i); return; }
    const side = i < 4 ? -1 : 1;
    const z = PAINT_Z[i % 4];
    const h = this.hero;
    const from = h.position.clone();
    const mid = new THREE.Vector3(side * 5, 0, z);
    h.rotation.y = Math.atan2(mid.x - from.x, mid.z - from.z);
    this.tween(0.9, (k) => { h.position.lerpVectors(from, mid, k); this.walkAnim(k * 8); }, () => {
      h.rotation.y = side < 0 ? -Math.PI / 2 : Math.PI / 2;
      Sfx.jump();
      this.tween(0.55, (k) => {
        h.position.set(side * (5 + 2.5 * k), 2.6 * k + Math.sin(Math.PI * k) * 1.2, z);
        h.scale.setScalar(1 - k * 0.6);
        this.frames[i].scale.z = 1 + Math.sin(k * Math.PI * 4) * 0.6;
      }, () => {
        h.visible = false;
        Sfx.warp();
        this.flash(() => this.inside(i));
      });
    });
  },

  flash(mid) {
    const f = $('.c-flash');
    f.classList.remove('on');
    void f.offsetWidth;
    f.classList.add('on');
    this.later(mid, 300);
  },

  inside(i) {
    const p = this.def.paintings[i];
    this.cur = i;
    if (this.v) this.enterWorld(p.theme);
    this.phase = 'dialog';
    this.say([`* ${upper(p.name)}\n* ${p.intro}`], () => this.challenge(i));
  },

  // Arma el reto de cada cuadro.
  makeTexts(p) {
    const P = this.def.pools;
    const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((a2, b) => a2[0] - b[0]).map((x) => x[1]);
    const num = () => String(rand([10 + Math.floor(Math.random() * 90), 100 + Math.floor(Math.random() * 900)]));
    switch (p.kind) {
      case 'caps': return pickWords(P.caps, 6);
      case 'phrase': return [rand(P.phrases)];
      case 'freeze': return pickWords(P.ice, 6);
      case 'numbers': return shuffle(['64', '120', '1996', ...pickWords(P.numbers, 2), num(), num(), num()]);
      case 'clock': return pickWords(WORDS.t1.filter((w) => w.length <= 4), 8);
      case 'rainbow': return pickWords(P.accents, 6);
      case 'mix': return shuffle([...pickWords(P.caps, 2), num(), '64', ...pickWords(P.accents, 2), rand(P.short)]);
      default: return pickWords(WORDS.t1, 6);
    }
  },

  challenge(i) {
    const p = this.def.paintings[i];
    const texts = this.makeTexts(p);
    const chars = texts.join('').length;
    this.phase = 'challenge';
    const tickMs = 2000; // un tic por palabra: a ~30 PPM una palabra corta (con reacción) tarda ~2 s
    const time = p.kind === 'clock' ? texts.length * tickMs + 1500 : Math.max(p.time || 25000, chars * 420 + 2500);
    this.box.innerHTML = '';
    this.ui = new PolyTask(this.box, {
      label: p.label,
      texts,
      timeLimit: time,
      strictCase: p.kind === 'caps' || p.kind === 'mix',
      noErrors: p.kind === 'rainbow',
      freezeMs: p.kind === 'freeze' ? 2000 : 0,
      onFreeze: () => { const l = $('.tt-label', this.box); if (l) l.textContent = '¡SE CONGELO! Escribe DERRETIR'; },
      onDone: (res) => this.challengeDone(i, res),
    });
    this.ui.start();
    this.clockTick = 0;
    if (p.kind === 'clock') {
      clearInterval(this.clockIv);
      this.later(() => {
        this.clockIv = setInterval(() => { Sfx.text(); Sfx.bump(); this.clockTick = (this.clockTick || 0) + 1; }, tickMs * diff().time);
      }, 750);
    }
  },

  async challengeDone(i, res) {
    clearInterval(this.clockIv);
    const p = this.def.paintings[i];
    this.st = this.st || { chars: 0, errors: 0, ms: 0 };
    this.st.chars += res.chars;
    this.st.errors += res.errors;
    this.st.ms += res.ms;
    if (!res.completed) {
      this.hp = Math.max(0, this.hp - scaledDmg(8));
      Sfx.hurt();
      this.renderHud();
      await this.talk([p.kind === 'rainbow' && res.errors ? '* ¡Te resbalaste del arcoíris!\n* ...y saliste despedido del cuadro.' : '* ¡Se acabó el tiempo!\n* ¡Saliste despedido del cuadro!']);
      this.backToHall(i, true);
      if (this.hp <= 0) {
        this.phase = 'busy';
        this.later(() => { Sfx.lose(); Game.go('gameover', { enemyId: this.id, back: this.back, scene: 'castillo' }); }, 500);
        return;
      }
      this.pick();
      return;
    }
    const perfect = res.errors === 0;
    const st = this.stars();
    const had = st[i];
    st[i] = Math.max(had || 0, perfect ? 2 : 1);
    Save.write();
    Sfx.powerup();
    if (this.v) this.showStar(perfect);
    this.renderHud();
    const pages = [perfect ? '* ¡¡ESTRELLA POLIGONO PERFECTA!!\n* Sin un solo error.' : `* ¡ESTRELLA POLIGONO!\n* (${res.errors} error${res.errors === 1 ? '' : 'es'}: sin errores sería PERFECTA.)`];
    if (!had && this.starCount() === 8) pages.push('* ¡LAS OCHO ESTRELLAS! El marco del fondo empezó a temblar...\n* Escribe MARCO cuando estés listo.');
    if (this.perfectCount() === 8 && Quests.state('estrellas_perfectas') !== 'done') {
      Quests.complete('estrellas_perfectas');
      Save.data.treasures.estrella_120 = true;
      Save.write();
      pages.push('* ¡Las 8 estrellas PERFECTAS!\n* Recibiste: ESTRELLA 120. (Se guardó en tu vitrina.)');
    }
    await this.talk(pages);
    this.backToHall(i, false);
    this.pick();
  },

  backToHall(i, ejected) {
    $('.c-title').textContent = 'CASTILLO DE LOS CUADROS';
    if (!this.v) return;
    this.leaveWorld();
    const side = i < 4 ? -1 : 1;
    const z = PAINT_Z[i % 4];
    const h = this.hero;
    h.visible = true;
    h.scale.setScalar(1);
    h.position.set(side * 5, 0, z);
    h.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    if (ejected) {
      // Sale volando del cuadro y cae dando vueltas.
      this.tween(0.8, (k) => {
        h.position.set(side * (7 - 5 * k), Math.sin(Math.PI * k) * 3, z + k * 3);
        h.rotation.x = k * Math.PI * 4;
      }, () => { h.rotation.x = 0; });
    }
  },

  // ---------- 3D del pasillo ----------

  build3d() {
    const v = Poly.view($('.c-3d'), { sky: '#2A2440', fog: [26, 80], fogColor: '#3A3050' });
    if (!v) return;
    this.v = v;
    const M = Poly.models;
    const hall = new THREE.Group();
    v.scene.add(hall);
    this.hall = hall;
    const floorTex = v.tex(16, 16, (g) => { g.fillStyle = N64C.sand; g.fillRect(0, 0, 16, 16); g.fillStyle = N64C.white; g.fillRect(0, 0, 8, 8); g.fillRect(8, 8, 8, 8); }, { nearest: true, repeat: [4, 13] });
    const floor = v.mesh(new THREE.PlaneGeometry(16, 56), v.mat(N64C.white, { map: floorTex }), null, hall);
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = -12;
    const carpet = v.mesh(new THREE.PlaneGeometry(3.4, 56), N64C.red, null, hall);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.02, -12);
    [-1, 1].forEach((s) => {
      const wall = v.mesh(new THREE.PlaneGeometry(56, 8), '#F1E3C8', null, hall);
      wall.rotation.y = -s * Math.PI / 2;
      wall.position.set(s * 8, 4, -12);
      for (let k = 0; k < 5; k++) {
        const col = v.mesh(new THREE.BoxGeometry(0.8, 8, 0.8), '#D9C7A8', null, hall);
        col.position.set(s * 7.7, 4, -3 - k * 8);
      }
    });
    const ceil = v.mesh(new THREE.PlaneGeometry(16, 56), '#B8A890', null, hall);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(0, 8, -12);
    const end = v.mesh(new THREE.PlaneGeometry(16, 8), '#E8D6B8', null, hall);
    end.position.set(0, 4, -40);
    const door = v.mesh(new THREE.BoxGeometry(3, 3.6, 0.2), '#6B3E1E', null, hall);
    door.position.set(0, 1.8, -39.9);
    // Marco cuelga al fondo, chueco, vigilando.
    this.marco = M.marco(v);
    this.marco.position.set(0, 5.6, -39.4);
    this.marco.scale.setScalar(0.85);
    hall.add(this.marco);
    // Los 8 cuadros.
    this.frames = [];
    this.plaques = [];
    this.def.paintings.forEach((p, i) => {
      const s = i < 4 ? -1 : 1;
      const z = PAINT_Z[i % 4];
      const g = new THREE.Group();
      g.position.set(s * 7.85, 3, z);
      g.rotation.y = -s * Math.PI / 2;
      hall.add(g);
      const pic = this.paintTex(p.theme);
      v.mesh(new THREE.PlaneGeometry(4, 3), v.mat(N64C.white, { map: pic }), null, g).position.z = 0.06;
      [[0, 1.6, 4.5, 0.25], [0, -1.6, 4.5, 0.25], [-2.15, 0, 0.25, 3.4], [2.15, 0, 0.25, 3.4]].forEach(([x, y, w, h]) => {
        const b = v.mesh(new THREE.BoxGeometry(w, h, 0.2), N64C.gold, null, g);
        b.position.set(x, y, 0.08);
      });
      const pl = v.mesh(new THREE.PlaneGeometry(2.6, 0.5), this.plaqueMat(i), null, g);
      pl.position.set(0, -2.2, 0.06);
      this.plaques.push(pl);
      this.frames.push(g);
    });
    // Letreros escondidos (misión "La cámara se atora") y el letrero del castillo.
    // (Todos en la mitad cercana del pasillo, para que se alcancen a leer con la cámara.)
    const hidden = (word, pos, rot) => {
      const m = v.mesh(new THREE.PlaneGeometry(4.2, 1.05), v.mat(N64C.white, { map: v.textTex(upper(word), { w: 96, h: 24, bg: '#D9C7A8', fg: '#6B5F52', size: 10 }) }), null, hall);
      m.position.set(...pos);
      m.rotation.set(...rot);
      return m;
    };
    const sideDoor = v.mesh(new THREE.BoxGeometry(0.2, 2.8, 1.8), '#6B3E1E', null, hall);
    sideDoor.position.set(7.9, 1.4, 0);
    this.walls = {
      pared: hidden('pared', [-7.95, 2.2, 0], [0, Math.PI / 2, 0]),
      esquina: hidden('esquina', [7.95, 7.2, -7], [0, -Math.PI / 2, 0]),  // arriba, donde se juntan pared y techo
      techo: hidden('techo', [0, 7.2, -6], [0, 0, 0]),                   // cuelga del techo
      puerta: hidden('puerta', [7.78, 3.5, 0], [0, -Math.PI / 2, 0]),    // encima de la puertita lateral
    };
    const chain = v.mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 4), N64C.rockD, null, hall);
    chain.position.set(0, 7.6, -6);
    const post = v.mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.6, 5), N64C.rockD, null, hall);
    post.position.set(3.6, 0.8, 4);
    const board = v.mesh(new THREE.PlaneGeometry(1.8, 0.8), v.mat(N64C.white, { map: v.textTex('LETRERO', { w: 64, h: 28, bg: '#A0642D', fg: N64C.white, size: 8 }) }), null, hall);
    board.position.set(3.6, 1.8, 4.06);
    board.rotation.y = -0.4;
    // Tú.
    this.hero = M.hero(v);
    this.hero.position.set(0, 0, 4);
    this.hero.rotation.y = Math.PI;
    v.scene.add(this.hero);
    this.look = new THREE.Vector3(0, 2.6, -14);
    this.lookGoal = this.look.clone();
    v.camera.position.set(0, 4.5, 12);
    v.start((dt, t) => this.frame(dt, t));
  },

  plaqueMat(i) {
    const p = this.def.paintings[i];
    const s = this.stars()[i];
    const t = this.v.textTex(`${s === 2 ? '★ ' : s ? '☆ ' : ''}${upper(p.word)}`, { w: 96, h: 18, bg: N64C.black, fg: s === 2 ? N64C.yellow : N64C.white, size: 8 });
    return this.v.mat(N64C.white, { map: t });
  },

  // Dibujito de cada cuadro (canvas 64x48).
  paintTex(theme) {
    return this.v.tex(64, 48, (g, w, h) => {
      const sky = (c) => { g.fillStyle = c; g.fillRect(0, 0, w, h); };
      const tri = (x1, y1, x2, y2, x3, y3, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineTo(x3, y3); g.fill(); };
      const circ = (x, y, r, c) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
      if (theme === 'bob') {
        sky(N64C.sky); circ(16, 50, 22, N64C.grass); circ(50, 54, 24, N64C.grassD);
        circ(44, 22, 8, N64C.black); circ(41, 20, 2, N64C.white); circ(47, 20, 2, N64C.white);
      } else if (theme === 'fortaleza') {
        sky(N64C.sky); g.fillStyle = N64C.rock; g.fillRect(22, 10, 20, 38);
        for (let x = 22; x < 42; x += 6) g.fillRect(x, 6, 4, 4);
        g.fillStyle = N64C.black; g.fillRect(29, 34, 6, 14);
      } else if (theme === 'bahia') {
        sky(N64C.sky); g.fillStyle = N64C.water; g.fillRect(0, 26, w, 22);
        g.fillStyle = '#6B3E1E'; g.fillRect(18, 22, 26, 6); g.fillRect(30, 6, 2, 16);
        tri(32, 7, 32, 20, 44, 18, N64C.white);
      } else if (theme === 'montana') {
        sky('#CFE8FF'); tri(0, 48, 24, 8, 48, 48, N64C.white); tri(26, 48, 46, 16, 64, 48, '#E0ECF4');
        g.fillStyle = N64C.white; for (let k = 0; k < 14; k++) g.fillRect((k * 23) % 64, (k * 11) % 30, 2, 2);
      } else if (theme === 'caverna') {
        sky('#2A2030'); for (let x = 0; x < 64; x += 10) tri(x, 0, x + 10, 0, x + 5, 12, N64C.rockD);
        g.fillStyle = N64C.yellow; g.font = '10px monospace'; g.fillText('64', 8, 32); g.fillText('120', 28, 40); g.fillText('7', 50, 24);
      } else if (theme === 'reloj') {
        sky('#8A5A2E'); circ(32, 24, 18, N64C.white); g.fillStyle = N64C.black;
        g.fillRect(31, 10, 2, 14); g.fillRect(32, 23, 10, 2);
      } else if (theme === 'arcoiris') {
        sky('#1C1C4A');
        ['#D64545', '#F0953C', '#F7E463', '#58B85C', '#3C8DD6', '#7E57C2'].forEach((c, k) => { g.strokeStyle = c; g.lineWidth = 3; g.beginPath(); g.arc(32, 48, 30 - k * 3, Math.PI, 0); g.stroke(); });
      } else {
        sky('#2A1F45');
        paintSprite(g, 'n64', 8, 0, 3, { a: N64C.white, b: N64C.yellow, c: '#5A5A66', d: N64C.black });
      }
    }, { nearest: true });
  },

  lookAt(word) {
    const m = this.walls && this.walls[word];
    if (!m) return;
    this.lookGoal = m.position.clone();
    this.later(() => { this.lookGoal = new THREE.Vector3(0, 2.6, -14); }, 2600);
  },

  walkAnim(k) {
    const legs = this.hero.userData.legs;
    legs[0].rotation.x = Math.sin(k * Math.PI) * 0.7;
    legs[1].rotation.x = -Math.sin(k * Math.PI) * 0.7;
  },

  tween(dur, fn, done) {
    if (!this.v) { fn(1); if (done) done(); return; }
    this.tweens.push({ t: 0, dur, fn, done });
  },

  frame(dt, t) {
    // (Un tween que termina puede crear otro: se juntan al final para no perderlo.)
    const list = this.tweens;
    this.tweens = [];
    const keep = list.filter((tw) => {
      tw.t += dt;
      const k = Math.min(1, tw.t / tw.dur);
      tw.fn(k);
      if (k >= 1) { if (tw.done) tw.done(); return false; }
      return true;
    });
    this.tweens = keep.concat(this.tweens);
    if (this.marco && this.marco.userData.anim) this.marco.userData.anim(t * (this.starCount() >= 8 ? 4 : 1));
    if (this.world) {
      // Adentro del cuadro: la cámara gira alrededor del mundito.
      const a = t * 0.25;
      this.v.camera.position.set(this.world.position.x + Math.cos(a) * 16, 6 + Math.sin(t * 0.4), this.world.position.z + Math.sin(a) * 16);
      this.v.camera.lookAt(this.world.position.x, 2.5, this.world.position.z);
      if (this.world.userData.anim) this.world.userData.anim(t, dt, this.clockTick || 0);
    } else {
      this.v.camera.position.set(Math.sin(t * 0.2) * 2.5, 4.5, 12);
      this.look.lerp(this.lookGoal, 1 - Math.exp(-dt * 3));
      this.v.camera.lookAt(this.look.x + Math.sin(t * 0.2 + 1) * 2.5, this.look.y, this.look.z);
    }
    if (this.starFx) {
      this.starFx.rotation.y += dt * 5;
      this.starFx.userData.life -= dt;
      if (this.starFx.userData.life <= 0) { this.v.free(this.starFx); this.starFx = null; }
    }
  },

  showStar(perfect) {
    const s = Poly.models.star(this.v, perfect ? N64C.yellow : '#F4F4F4');
    const cam = this.v.camera;
    const dir = new THREE.Vector3();
    cam.getWorldDirection(dir);
    s.position.copy(cam.position).addScaledVector(dir, 6);
    s.userData.life = 2.2;
    s.scale.setScalar(1.3);
    this.v.scene.add(s);
    this.starFx = s;
    // Las placas de los cuadros se actualizan con la estrella nueva.
    this.plaques.forEach((pl, i) => { pl.material.dispose(); pl.material = this.plaqueMat(i); });
  },

  // ---------- Mundos adentro de los cuadros ----------

  enterWorld(theme) {
    const v = this.v;
    const g = new THREE.Group();
    g.position.set(0, 0, -400);
    v.scene.add(g);
    this.world = g;
    this.hall.visible = false;
    this.hero.visible = false;
    const T = {
      bob: { sky: N64C.sky, ground: N64C.grass },
      fortaleza: { sky: N64C.sky, ground: N64C.rock },
      bahia: { sky: N64C.sky, ground: N64C.water },
      montana: { sky: '#CFE8FF', ground: N64C.white },
      caverna: { sky: '#1A1420', ground: N64C.rockD },
      reloj: { sky: '#5A3A1E', ground: '#8A5A2E' },
      arcoiris: { sky: '#101030', ground: '#1C1C4A' },
      sotano: { sky: '#1A1030', ground: '#3A2A55' },
    }[theme] || { sky: N64C.sky, ground: N64C.grass };
    this.savedBg = v.scene.background;
    v.scene.background = new THREE.Color(T.sky);
    v.scene.fog.color.set(T.sky);
    const ground = v.mesh(new THREE.CircleGeometry(40, 10), T.ground, null, g);
    ground.rotation.x = -Math.PI / 2;
    const add = (geo, color, x, y, z) => { const m = v.mesh(geo, color, null, g); m.position.set(x, y, z); return m; };
    const spin = [];
    if (theme === 'bob') {
      [[-8, -6, 6], [9, -4, 5], [0, -14, 8]].forEach(([x, z, r]) => add(new THREE.SphereGeometry(r, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), N64C.grassD, x, 0, z));
      const ball = add(new THREE.IcosahedronGeometry(1.6, 1), N64C.black, 3, 1.6, 3);
      Poly.models.eyes(v, ball, { z: 1.3, r: 0.35, x: 0.6 });
      for (let k = 0; k < 6; k++) { const tr = Poly.models.tree(v); tr.position.set(Math.cos(k) * 14, 0, Math.sin(k) * 14); g.add(tr); }
      g.userData.anim = (t) => { ball.position.y = 1.6 + Math.abs(Math.sin(t * 3)) * 1.5; };
    } else if (theme === 'fortaleza') {
      add(new THREE.BoxGeometry(6, 10, 6), N64C.rock, 0, 5, -2);
      for (let k = 0; k < 4; k++) add(new THREE.BoxGeometry(1.2, 1.2, 1.2), N64C.rockD, -2.4 + k * 1.6, 10.6, 0.4);
      add(new THREE.BoxGeometry(14, 3, 1), N64C.rockD, 0, 1.5, 5);
      const flag = add(new THREE.BoxGeometry(1.6, 1, 0.1), N64C.red, 0.8, 13, -2);
      add(new THREE.CylinderGeometry(0.08, 0.08, 3, 4), N64C.black, 0, 12, -2);
      g.userData.anim = (t) => { flag.rotation.y = Math.sin(t * 4) * 0.4; };
    } else if (theme === 'bahia') {
      add(new THREE.CircleGeometry(6, 8), N64C.sand, -6, 0.05, -4).rotation.x = -Math.PI / 2;
      const ship = new THREE.Group();
      g.add(ship);
      v.mesh(new THREE.BoxGeometry(7, 1.6, 2.4), '#6B3E1E', null, ship).position.y = 0.6;
      v.mesh(new THREE.CylinderGeometry(0.15, 0.15, 6, 5), '#6B3E1E', null, ship).position.set(0, 4, 0);
      v.mesh(new THREE.PlaneGeometry(3, 3), v.mat(N64C.white, { side: THREE.DoubleSide }), null, ship).position.set(0.2, 4.4, 0);
      ship.position.set(4, 0, 2);
      g.userData.anim = (t) => { ship.rotation.z = Math.sin(t * 1.2) * 0.08; ship.position.y = Math.sin(t * 1.5) * 0.2; };
    } else if (theme === 'montana') {
      [[-10, -8, 6, 14], [8, -12, 7, 18], [0, -20, 9, 24]].forEach(([x, z, r, h]) => add(new THREE.ConeGeometry(r, h, 6), N64C.white, x, h / 2, z));
      const flakes = [];
      for (let k = 0; k < 40; k++) flakes.push(add(new THREE.TetrahedronGeometry(0.2, 0), N64C.white, (Math.random() - 0.5) * 30, Math.random() * 14, (Math.random() - 0.5) * 30));
      g.userData.anim = (t, dt) => flakes.forEach((f) => { f.position.y -= dt * 2; if (f.position.y < 0) f.position.y = 14; });
    } else if (theme === 'caverna') {
      for (let k = 0; k < 14; k++) add(new THREE.ConeGeometry(0.8, 4, 5), N64C.rock, Math.cos(k * 2.1) * (6 + k % 5 * 2), 10, Math.sin(k * 2.1) * (6 + k % 5 * 2)).rotation.x = Math.PI;
      ['64', '120', '1996', '8', '3'].forEach((n, k) => {
        const m = add(new THREE.PlaneGeometry(3, 1.5), v.mat(N64C.white, { map: v.textTex(n, { w: 64, h: 32, bg: '#1A1420', fg: N64C.yellow, size: 14 }), side: THREE.DoubleSide }), Math.cos(k * 1.3) * 7, 3 + k, Math.sin(k * 1.3) * 7);
        spin.push(m);
      });
      g.userData.anim = (t, dt) => spin.forEach((m) => { m.rotation.y += dt; });
    } else if (theme === 'reloj') {
      const face = add(new THREE.CylinderGeometry(5, 5, 0.6, 12), N64C.white, 0, 6, -3);
      face.rotation.x = Math.PI / 2;
      const hand = new THREE.Group();
      hand.position.set(0, 6, -2.5);
      g.add(hand);
      v.mesh(new THREE.BoxGeometry(0.3, 4, 0.2), N64C.black, null, hand).position.y = 2;
      const gears = [[-7, 3, 2.5], [7, 4, 2], [6, 10, 1.6]].map(([x, y, r]) => { const m = add(new THREE.CylinderGeometry(r, r, 0.5, 8), N64C.gold, x, y, -3); m.rotation.x = Math.PI / 2; return m; });
      g.userData.anim = (t, dt, ticks) => {
        hand.rotation.z += ((-ticks * Math.PI / 6) - hand.rotation.z) * Math.min(1, dt * 20);
        gears.forEach((m, k) => { m.rotation.y += dt * (k % 2 ? -1 : 1); });
      };
    } else if (theme === 'arcoiris') {
      ['#D64545', '#F0953C', '#F7E463', '#58B85C', '#3C8DD6', '#7E57C2'].forEach((c, k) => add(new THREE.TorusGeometry(12 - k * 0.8, 0.4, 4, 16, Math.PI), c, 0, 0, -6));
      for (let k = 0; k < 6; k++) spin.push(add(new THREE.BoxGeometry(2, 0.4, 2), ['#D64545', '#F7E463', '#3C8DD6'][k % 3], Math.cos(k) * 8, 2 + k, Math.sin(k) * 8));
      g.userData.anim = (t) => spin.forEach((m, k) => { m.position.y = 2 + k + Math.sin(t * 2 + k) * 0.5; });
    } else {
      add(new THREE.CylinderGeometry(2.5, 3, 2, 8), N64C.rockD, 0, 1, 0);
      const c = Poly.models.console64(v);
      c.position.set(0, 2.8, 0);
      g.add(c);
      g.userData.anim = (t) => { c.rotation.y = t; c.position.y = 2.8 + Math.sin(t * 2) * 0.3; };
    }
  },

  leaveWorld() {
    const v = this.v;
    if (!this.world) return;
    v.free(this.world);
    this.world = null;
    this.hall.visible = true;
    v.scene.background = this.savedBg;
    v.scene.fog.color.set('#3A3050');
  },

  // ---------- Teclas ----------

  idleCheck() {
    if (this.phase !== 'pick' || this.bitSaid || performance.now() - this.idleAt < 20000) return;
    this.bitSaid = true;
    toast(rand([
      'BIT: Dicen que esta consola seguía usando cartuchos cuando todos ya usaban CD. ¡Cargaba rapidísimo!',
      'BIT: Cuidado con la cámara. En esta época la cámara era un enemigo más.',
    ]));
  },

  pause() {
    const prev = this.ui;
    this.phase = 'paused';
    const el = document.createElement('div');
    el.className = 'smb-pause';
    el.innerHTML = '<div>PAUSA</div><div class="smb-menu"></div>';
    $('.castle').appendChild(el);
    this.ui = new ListMenu($('.smb-menu', el), [{ label: 'Seguir' }, { label: 'Salir del castillo' }], {
      cols: 2,
      onPick: (i) => {
        if (i === 1) { Game.go(this.back); return; }
        el.remove();
        this.ui = prev;
        this.phase = 'pick';
      },
      onCancel: () => { el.remove(); this.ui = prev; this.phase = 'pick'; },
    });
  },

  onKey(e) {
    this.idleAt = performance.now();
    if (this.phase === 'pick' && e.key === 'Escape') { this.pause(); return; }
    if (this.ui && this.ui.key) this.ui.key(e);
  },
};
