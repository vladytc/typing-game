// CIRCUITO ISLA — carrera de karts por tecleo (guiño a Mario Kart 64, 1996).
//   Cada letra correcta empuja tu kart. 3 vueltas, 4 corredores.
//   Cajas ? cada 25 % de la vuelta: te dan un objeto; escribe su nombre para usarlo.
//     plátano: el rival más cercano derrapa 1.5 s     caparazón: el rival de adelante se para 2 s
//     rayo: todos los rivales se encogen (-30 %) 4 s   estrella: inmune y +20 % durante 5 s
//   Si el Piloto Sombra te lanza algo, escribe ESQUIVA antes de que se acabe la barra.
//   1º = tesoro · 2º o 3º = pasas · 4º = otra vez.
// La carrera es lógica pura (KartRace) y el 3D solo la dibuja: sin three.js se juega igual.

const KART_LAP = 80;   // letras por vuelta
const KART_LAPS = 3;
const KART_ITEMS = {
  platano: { word: 'plátano', label: 'PLATANO', icon: '🍌' },
  caparazon: { word: 'caparazón', label: 'CAPARAZON', icon: '🐢' },
  rayo: { word: 'rayo', label: 'RAYO', icon: '⚡' },
  estrella: { word: 'estrella', label: 'ESTRELLA', icon: '★' },
};
const KART_RACERS = [
  { id: 'tu', name: 'TU', color: '#D64545', cap: '#D64545', lane: -0.9 },
  { id: 'sombra', name: 'SOMBRA', color: '#4B2F8A', cap: '#7E57C2', lane: 0.9, ppm: 33 },
  { id: 'dani', name: 'DANI', color: '#F0953C', cap: '#D64545', lane: -2.7, ppm: 22 }, // el que se deja alcanzar: 3º es posible a ~30 PPM
  { id: 'rayo', name: 'RAYO CERO', color: '#3C8DD6', cap: '#F4F4F4', lane: 2.7, ppm: 30 },
];

// Simulación de la carrera, sin nada de pantalla (se prueba en Node).
class KartRace {
  constructor({ speed = 1, rng = Math.random } = {}) {
    this.rng = rng;
    this.total = KART_LAP * KART_LAPS;
    this.t = 0;
    this.racers = KART_RACERS.map((r) => ({ ...r, dist: 0, spin: 0, stop: 0, shrink: 0, star: 0, finishT: 0 }));
    this.me = this.racers[0];
    this.me.pend = 0;
    // Velocidad de los rivales en letras por segundo: PPM × 5 / 60, escalada por la dificultad.
    this.racers.slice(1).forEach((r) => { r.cps = (r.ppm * 5 / 60) * speed; });
    this.boxesTaken = 0; // cuántas cajas ? has pasado en total
    this.events = [];
  }

  get finished() { return this.me.finishT > 0; }
  lapOf(r) { return Math.min(KART_LAPS, Math.floor(r.dist / KART_LAP) + 1); }

  // Una letra correcta.
  push(n = 1) { this.me.pend += n; }

  step(dt) {
    this.t += dt;
    const me = this.me;
    this.racers.forEach((r) => {
      if (r.finishT) return;
      ['spin', 'stop', 'shrink', 'star'].forEach((k) => { if (r[k] > 0) r[k] = Math.max(0, r[k] - dt); });
      let move;
      if (r === me) {
        if (r.spin > 0) { r.pend = Math.min(r.pend, 3); move = 0; } else {
          move = Math.min(r.pend, Math.max(5, r.pend * 4) * dt);
          r.pend -= move;
          if (r.star > 0) move *= 1.2;
        }
      } else {
        let cps = r.cps * (1 + 0.05 * Math.sin(this.t * 0.7 + r.lane));
        if (r.shrink > 0) cps *= 0.7;
        if (me.dist - r.dist > KART_LAP * 0.25) cps *= 1.1; // "goma elástica": si vas muy adelante, acelera
        move = r.spin > 0 || r.stop > 0 ? 0 : cps * dt;
      }
      const before = r.dist;
      r.dist = Math.min(this.total, r.dist + move);
      if (r === me && Math.floor(r.dist / KART_LAP) > Math.floor(before / KART_LAP) && r.dist < this.total) this.events.push({ type: 'lap', lap: this.lapOf(r) });
      if (r.dist >= this.total && !r.finishT) { r.finishT = this.t; if (r === me) this.events.push({ type: 'finish', place: this.place() }); }
    });
    // Cajas ? en 12.5 %, 37.5 %, 62.5 % y 87.5 % de cada vuelta.
    const boxes = Math.floor((me.dist + KART_LAP / 8) / (KART_LAP / 4));
    if (boxes > this.boxesTaken) {
      this.boxesTaken = boxes;
      if (me.dist < this.total) this.events.push({ type: 'box' });
    }
  }

  // Objeto al azar; el que va atrás tiene más chance de estrella.
  rollItem() {
    const p = this.place();
    const bag = ['platano', 'platano', 'caparazon', 'caparazon', 'rayo', 'estrella'];
    if (p >= 3) bag.push('estrella', 'rayo');
    if (p === 1) bag.push('platano');
    return bag[Math.floor(this.rng() * bag.length)];
  }

  // Lugar actual (1-4). Los que ya cruzaron la meta van primero, por orden de llegada.
  place(r = this.me) {
    const key = (x) => (x.finishT ? 1e6 - x.finishT : x.dist);
    return 1 + this.racers.filter((x) => x !== r && key(x) > key(r)).length;
  }

  // Usa un objeto. Devuelve un texto para el HUD.
  use(item) {
    const me = this.me;
    const rivals = this.racers.filter((r) => r !== me && !r.finishT);
    const ahead = rivals.filter((r) => r.dist > me.dist).sort((a, b) => a.dist - b.dist);
    const near = rivals.slice().sort((a, b) => Math.abs(a.dist - me.dist) - Math.abs(b.dist - me.dist));
    if (item === 'platano') {
      const r = ahead[0] || near[0];
      if (!r) return '¡Nadie cerca!';
      r.spin = 1.5;
      return `¡${r.name} DERRAPA!`;
    }
    if (item === 'caparazon') {
      const r = ahead[0];
      if (!r) return '¡Vas primero! El caparazón se pierde...';
      r.stop = 2;
      return `¡LE DISTE A ${r.name}!`;
    }
    if (item === 'rayo') { rivals.forEach((r) => { r.shrink = 4; }); return '¡RAYO! Todos se encogen.'; }
    if (item === 'estrella') { me.star = 5; return '¡ESTRELLA! Nada te detiene.'; }
    return '';
  }
}

Scenes.kart = {
  music: 'n64kart',

  enter({ enemyId = 'piloto', back = 'map' } = {}) {
    document.body.className = 'theme-n64';
    Object.assign(this, { id: enemyId, def: ENEMIES[enemyId], back, timers: [], phase: 'intro', ui: null });
    this.race = new KartRace({ speed: diff().speed });
    this.st = { chars: 0, errors: 0 };
    this.queue = [];
    this.word = null;
    this.item = null;
    this.defend = null;
    this.atkT = this.nextAttack();
    this.lapStart = 0;
    this.bestLap = 0;
    this.wordN = 0;
    Game.root.innerHTML = `
      <div class="kart">
        <div class="k-3d"></div>
        <div class="k-hud">
          <div class="k-lap">VUELTA 1/${KART_LAPS}</div>
          <div class="k-pos">-</div>
          <div class="k-item"><div class="k-item-box"></div><div class="k-item-name"></div></div>
        </div>
        <div class="k-strip">${KART_RACERS.map((r) => `<i data-id="${r.id}" style="background:${r.color}"></i>`).join('')}</div>
        <div class="k-msg"></div>
        <div class="smb-type k-type"><div class="st-hint"></div><div class="st-word"></div><div class="st-next"></div><div class="k-def hidden"><i></i></div></div>
        <div class="box k-box hidden"></div>
      </div>`;
    Poly.attach(this, $('.kart'), () => this.build3d());
    this.loop2d(); // la lógica corre desde ya; si llega el 3D, él toma el bucle
    this.intro();
  },

  exit() {
    this.tok = null;
    this.timers.forEach(clearTimeout);
    cancelAnimationFrame(this.raf);
    if (this.ui && this.ui.stop) this.ui.stop();
    if (this.v) { this.v.dispose(); this.v = null; }
  },

  later(fn, ms) { this.timers.push(setTimeout(fn, ms)); },
  nextAttack() { return (14 + Math.random() * 8) / diff().speed; },

  // ---------- Diálogos y cuenta regresiva ----------

  showBox(pages, done) {
    const box = $('.k-box');
    box.classList.remove('hidden');
    box.innerHTML = '<div class="tb-text"></div>';
    this.ui = new Dialog($('.tb-text', box), pages, () => { box.classList.add('hidden'); this.ui = null; done(); });
  },

  intro() {
    const first = !Save.data.done[this.id];
    Quests.start('cuatro_puertos');
    const pages = first ? [
      '* (En la orilla de la pista hay cuatro sillas frente a una tele.)\n* "Cuatro puertos. Cuatro amigos. Cero cables largos."',
      '* PILOTO SOMBRA: Soy tu sombra.\n* Sé exactamente qué tan lento escribes.',
      '* DANI: ¡Cuatro puertos, cuatro corredores!\n* Y RAYO CERO vino de visita desde el Reino 16-Bit.',
      '* BIT: ¡Escribe para acelerar! Cada letra es un empujón.\n* Las cajas ? te dan objetos: escribe su nombre para usarlos.',
      '* BIT: Si el Piloto Sombra te lanza algo, escribe ESQUIVA rapidito.\n* (ESC pausa la carrera.)',
    ] : ['* PILOTO SOMBRA: ¿Otra vez? Mi sombra nunca se cansa.'];
    this.showBox(pages, () => this.countdown());
  },

  countdown() {
    this.phase = 'count';
    const msg = $('.k-msg');
    ['3', '2', '1', '¡YA!'].forEach((t, i) => this.later(() => {
      msg.textContent = t;
      msg.className = 'k-msg big';
      if (i < 3) Sfx.move(); else Sfx.confirm();
    }, i * 800));
    this.later(() => {
      msg.className = 'k-msg';
      msg.textContent = '';
      this.phase = 'race';
      this.nextWord();
    }, 3200);
  },

  // ---------- Palabras ----------

  // Números y palabras alternados (§7.10).
  genWord() {
    const pool = this.def.pool;
    this.wordN++;
    if (this.wordN % 2) return { text: pickWords(pool.words, 1)[0] };
    const nums = pool.numbers.concat([String(10 + Math.floor(Math.random() * 90)), String(100 + Math.floor(Math.random() * 900))]);
    return { text: rand(nums) };
  },

  nextWord() {
    while (this.queue.length < 3) this.queue.push(this.genWord());
    this.word = this.queue.shift();
    this.pos = 0;
    this.errAt = -1;
    this.renderWord();
  },

  renderWord() {
    const w = this.defend ? { text: 'esquiva', defend: true } : this.word;
    if (!w) return;
    const pos = this.defend ? this.defend.pos : this.pos;
    $('.st-hint').textContent = this.defend ? '⚠ ¡TE LANZARON ALGO! ¡ESQUIVA!' : w.item ? `${KART_ITEMS[w.item].icon} ¡USA EL OBJETO!` : '';
    $('.st-word').className = `st-word ${w.item ? 'item' : ''} ${this.defend ? 'defend' : ''}`;
    $('.st-word').innerHTML = [...w.text].map((c, i) =>
      `<span class="${i < pos ? 'ok' : i === pos ? `nx${this.errAt === i ? ' bad' : ''}` : ''}">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('');
    $('.st-next').textContent = this.defend ? '' : this.queue.slice(0, 2).map((q) => q.text).join('  ');
    $('.k-def').classList.toggle('hidden', !this.defend);
  },

  onKey(e) {
    if (this.phase === 'paused' || this.phase === 'end') { if (this.ui) this.ui.key(e); return; }
    if (this.ui && this.ui.key && this.phase !== 'race') { this.ui.key(e); return; }
    if (e.key === 'Escape') { if (this.phase === 'race') this.pause(); return; }
    if (this.phase !== 'race' || e.repeat || e.key.length !== 1) return;
    const target = this.defend || this;
    const text = this.defend ? 'esquiva' : this.word.text;
    const expected = text[target.pos];
    if (!keyMatches(expected, e.key)) {
      Stats.record(expected, false);
      this.st.errors++;
      this.errAt = target.pos;
      Sfx.error();
      this.renderWord();
      return;
    }
    Stats.record(expected, true);
    this.st.chars++;
    this.errAt = -1;
    target.pos++;
    Sfx.key();
    this.race.push(1);
    if (target.pos < text.length) { this.renderWord(); return; }
    if (this.defend) {
      this.defend = null;
      this.flash('¡ESQUIVADO!');
      Sfx.pop();
      this.renderWord();
      return;
    }
    if (this.word.item) {
      const out = this.race.use(this.word.item);
      Sfx.powerup();
      this.flash(out);
      this.item = null;
      this.renderItem();
    }
    this.nextWord();
  },

  flash(text) {
    const m = $('.k-msg');
    if (!m) return;
    m.textContent = text;
    m.className = 'k-msg';
    void m.offsetWidth;
    m.className = 'k-msg show';
  },

  renderItem() {
    $('.k-item-box').textContent = this.item ? KART_ITEMS[this.item].icon : '';
    $('.k-item-name').textContent = this.item ? KART_ITEMS[this.item].label : '';
  },

  pause() {
    this.phase = 'paused';
    const el = document.createElement('div');
    el.className = 'smb-pause';
    el.innerHTML = '<div>PAUSA</div><div class="smb-menu"></div>';
    $('.kart').appendChild(el);
    const resume = () => { el.remove(); this.ui = null; this.phase = 'race'; };
    this.ui = new ListMenu($('.smb-menu', el), [{ label: 'Seguir' }, { label: 'Salir de la carrera' }], {
      cols: 2,
      onPick: (i) => (i === 1 ? Game.go(this.back) : resume()),
      onCancel: resume,
    });
  },

  // ---------- Bucle ----------

  update(dt) {
    if (this.phase !== 'race') return;
    const R = this.race;
    R.step(dt);
    R.events.splice(0).forEach((ev) => {
      if (ev.type === 'box') {
        if (this.item) return;
        this.item = R.rollItem();
        this.queue.unshift({ text: KART_ITEMS[this.item].word, item: this.item });
        Sfx.coin();
        this.renderItem();
        this.renderWord();
      } else if (ev.type === 'lap') {
        const lapT = R.t - this.lapStart;
        this.lapStart = R.t;
        if (!this.bestLap || lapT < this.bestLap) this.bestLap = lapT;
        $('.k-lap').textContent = `VUELTA ${ev.lap}/${KART_LAPS}`;
        this.flash(ev.lap === KART_LAPS ? '¡ULTIMA VUELTA!' : `VUELTA ${ev.lap}`);
        Sfx.secret();
        if (ev.lap === KART_LAPS) Music.play('n64kart_fast');
      } else if (ev.type === 'finish') {
        const lapT = R.t - this.lapStart;
        if (!this.bestLap || lapT < this.bestLap) this.bestLap = lapT;
        this.finish(ev.place);
      }
    });
    if (this.phase !== 'race') return;
    // El Piloto Sombra lanza algo de vez en cuando (si va cerca de ti).
    const me = R.me;
    const sombra = R.racers[1];
    this.atkT -= dt;
    if (this.atkT <= 0 && !this.defend) {
      this.atkT = this.nextAttack();
      if (me.star <= 0 && !sombra.finishT && Math.abs(sombra.dist - me.dist) < KART_LAP * 0.5) {
        this.defend = { pos: 0, t: 0, limit: (1.2 + 7 * 0.22) * diff().time };
        Sfx.laugh();
        this.renderWord();
      }
    }
    if (this.defend) {
      this.defend.t += dt;
      const left = 1 - this.defend.t / this.defend.limit;
      $('.k-def i').style.width = `${Math.max(0, left) * 100}%`;
      if (me.star > 0) { this.defend = null; this.renderWord(); } else if (left <= 0) {
        this.defend = null;
        me.spin = 1.5;
        Sfx.hurt();
        this.flash('¡TE DIERON! ¡A DERRAPAR!');
        this.renderWord();
      }
    }
    $('.k-pos').textContent = `${R.place()}º`;
    KART_RACERS.forEach((r, i) => {
      const dot = $(`.k-strip i[data-id="${r.id}"]`);
      if (dot) dot.style.left = `${(R.racers[i].dist / R.total) * 100}%`;
    });
  },

  // Sin 3D: bucle simple solo para la lógica.
  loop2d() {
    let last = performance.now();
    const loop = (ts) => {
      const dt = Math.max(0, Math.min(50, ts - last)) / 1000;
      last = ts;
      this.update(dt);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  },

  // ---------- 3D ----------

  build3d() {
    const v = Poly.view($('.k-3d'), { fog: [25, 120] });
    if (!v) return;
    this.v = v;
    const M = Poly.models;
    const P = [[0, -40], [28, -34], [44, -12], [40, 14], [22, 30], [0, 24], [-18, 36], [-40, 22], [-46, -4], [-30, -30]];
    this.curve = new THREE.CatmullRomCurve3(P.map(([x, z]) => new THREE.Vector3(x, 0, z)), true);
    const N = 220;
    const W = 9;
    const pts = this.curve.getSpacedPoints(N);
    const road = [];
    const curbL = [];
    const curbR = [];
    const colors = [];
    const side = (i, off) => {
      const t = this.curve.getTangentAt((i % N) / N);
      const n = new THREE.Vector3(t.z, 0, -t.x).normalize();
      return pts[i % N].clone().addScaledVector(n, off);
    };
    const quad = (arr, a1, a2, b1, b2, y) => {
      [a1, b1, a2, a2, b1, b2].forEach((p) => arr.push(p.x, y, p.z));
    };
    for (let i = 0; i < N; i++) {
      quad(road, side(i, -W / 2), side(i, W / 2), side(i + 1, -W / 2), side(i + 1, W / 2), 0.02);
      quad(curbL, side(i, -W / 2 - 0.8), side(i, -W / 2), side(i + 1, -W / 2 - 0.8), side(i + 1, -W / 2), 0.04);
      quad(curbR, side(i, W / 2), side(i, W / 2 + 0.8), side(i + 1, W / 2), side(i + 1, W / 2 + 0.8), 0.04);
      const c = new THREE.Color(i % 4 < 2 ? N64C.red : N64C.white);
      for (let k = 0; k < 6; k++) colors.push(c.r, c.g, c.b);
    }
    const geo = (arr, cols) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
      if (cols) g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
      g.computeVertexNormals();
      return g;
    };
    v.mesh(geo(road), '#7A7A86', { side: THREE.DoubleSide });
    const curbMat = new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 0, side: THREE.DoubleSide });
    v.scene.add(new THREE.Mesh(geo(curbL, colors), curbMat));
    v.scene.add(new THREE.Mesh(geo(curbR, colors), curbMat));
    // Meta a cuadros.
    const checker = v.tex(64, 16, (g) => { for (let x = 0; x < 8; x++) for (let y = 0; y < 2; y++) { g.fillStyle = (x + y) % 2 ? N64C.black : N64C.white; g.fillRect(x * 8, y * 8, 8, 8); } }, { nearest: true });
    const fin = v.mesh(new THREE.PlaneGeometry(W, 2), v.mat(N64C.white, { map: checker }));
    const p0 = this.curve.getPointAt(0);
    const t0 = this.curve.getTangentAt(0);
    fin.rotation.x = -Math.PI / 2;
    fin.rotation.z = Math.atan2(t0.x, t0.z); // a lo ancho de la pista
    fin.position.set(p0.x, 0.05, p0.z);
    // Isla: pasto, arena y mar.
    const sea = v.mesh(new THREE.PlaneGeometry(500, 500), N64C.water);
    sea.rotation.x = -Math.PI / 2;
    sea.position.y = -0.6;
    const sand = v.mesh(new THREE.CircleGeometry(78, 12), N64C.sand);
    sand.rotation.x = -Math.PI / 2;
    sand.position.y = -0.3;
    const grass = v.mesh(new THREE.CircleGeometry(66, 12), N64C.grass);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.05;
    Poly.sky(v, { radius: 160 });
    // Árboles lejos de la pista.
    const near = (x, z) => pts.some((p) => (p.x - x) ** 2 + (p.z - z) ** 2 < 64);
    for (let i = 0, n = 0; i < 200 && n < 34; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 60;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (near(x, z)) continue;
      const tr = M.tree(v, 0.8 + Math.random() * 0.6);
      tr.position.set(x, 0, z);
      v.scene.add(tr);
      n++;
    }
    // Guiños (§7.8): el cubo que vibra en la playa, y el oso con el pájaro que pasa al fondo.
    this.pak = M.pakito(v);
    this.pak.position.set(70, 0.8, 8);
    v.scene.add(this.pak);
    this.bear = M.bear(v);
    v.scene.add(this.bear);
    // Cajas ?: tres a lo ancho de la pista en cada cuarto de vuelta.
    this.boxes = [];
    [0.125, 0.375, 0.625, 0.875].forEach((u) => {
      const p = this.curve.getPointAt(u);
      const t = this.curve.getTangentAt(u);
      const n = new THREE.Vector3(t.z, 0, -t.x).normalize();
      [-2.5, 0, 2.5].forEach((o) => {
        const b = M.itembox(v);
        b.position.copy(p).addScaledVector(n, o);
        b.position.y = 1.2;
        v.scene.add(b);
        this.boxes.push(b);
      });
    });
    // Karts.
    this.karts = KART_RACERS.map((r) => {
      const k = M.kart(v, r.color, r.cap);
      v.scene.add(k);
      return k;
    });
    this.camPos = new THREE.Vector3(0, 30, 0);
    this.camLook = new THREE.Vector3();
    this.place3d(0);
    v.camera.position.copy(this.camPos);
    cancelAnimationFrame(this.raf);
    v.start((dt, t) => { this.update(dt); this.place3d(dt, t); });
  },

  place3d(dt, t = 0) {
    const R = this.race;
    R.racers.forEach((r, i) => {
      const k = this.karts[i];
      const u = ((r.dist % KART_LAP) + KART_LAP) % KART_LAP / KART_LAP;
      const p = this.curve.getPointAt(u);
      const tg = this.curve.getTangentAt(u);
      const n = new THREE.Vector3(tg.z, 0, -tg.x).normalize();
      k.position.copy(p).addScaledVector(n, r.lane);
      k.position.y = Math.abs(Math.sin(t * 18 + i)) * 0.05;
      k.rotation.y = Math.atan2(tg.x, tg.z) + (r.spin > 0 ? r.spin * 12 : 0) + (r.stop > 0 ? Math.sin(t * 30) * 0.2 : 0);
      k.scale.setScalar(r.shrink > 0 ? 0.55 : 1);
      const bm = k.userData.bodyMat;
      if (r.star > 0) bm.color.setHSL((t * 2) % 1, 0.9, 0.55); else bm.color.set(r.color);
      if (r === R.me) {
        const back = p.clone().addScaledVector(tg, -7).addScaledVector(n, r.lane);
        back.y = 3.2;
        const look = p.clone().addScaledVector(tg, 6).addScaledVector(n, r.lane * 0.5);
        look.y = 0.8;
        const a = dt ? 1 - Math.exp(-dt * 6) : 1;
        this.camPos.lerp(back, a);
        this.camLook.lerp(look, a);
      }
    });
    this.boxes.forEach((b, i) => {
      b.rotation.x += dt * 1.2;
      b.rotation.y += dt * 1.7;
      b.userData.mat.color.setHSL((t * 0.3 + i * 0.08) % 1, 0.8, 0.7);
    });
    if (this.pak) { this.pak.position.x = 70 + (Math.random() - 0.5) * 0.15; }
    if (this.bear) {
      const a = t * 0.05;
      this.bear.position.set(Math.cos(a) * 72, 0, Math.sin(a) * 72);
      this.bear.rotation.y = -a;
    }
    this.v.camera.position.copy(this.camPos);
    this.v.camera.lookAt(this.camLook);
  },

  // ---------- Final ----------

  finish(place) {
    this.phase = 'end';
    this.defend = null;
    const d = Save.data;
    const minutes = this.race.t / 60;
    const wpm = Math.round((this.st.chars / 5) / Math.max(minutes, 0.01));
    const typed = this.st.chars + this.st.errors;
    const acc = typed ? Math.round((this.st.chars / typed) * 100) : 100;
    const lapTxt = (this.bestLap || 0).toFixed(2);
    const a = d.arcade || (d.arcade = {});
    const lapRecord = !a.kart64 || this.bestLap < a.kart64;
    if (lapRecord) a.kart64 = Math.round(this.bestLap * 100) / 100;
    const lines = [`¡META! LLEGASTE ${place}º`, `Mejor vuelta: ${lapTxt} s${lapRecord ? ' ¡RECORD!' : ''}`, `Velocidad: ${wpm} PPM · Precisión: ${acc}%`];
    if (place <= 3) {
      Stats.addBattle({ enemy: this.id, wpm, acc, date: Date.now() });
      const ups = addXp(this.def.xp);
      if (ups) lines.push(`¡Subiste a nivel ${d.level}!`);
      if (!d.done[this.id]) { d.done[this.id] = true; lines.push('¡Se abrió el siguiente camino de la isla!'); }
      if (place === 1) {
        if (!d.treasures.palanca_analogica) { d.treasures.palanca_analogica = true; lines.push('Recibiste: PALANCA ANALOGICA (vitrina)'); }
        Quests.complete('cuatro_puertos');
        lines.push('SOMBRA: ...Imposible. Una sombra no debería quedar atrás.');
      } else lines.push('DANI: ¡Nada mal! Pero el tesoro es para el 1º...');
    } else {
      lines.push('¡Quedaste último! Necesitas quedar 3º o mejor para seguir.', 'SOMBRA: Te lo dije. Sé qué tan lento escribes.');
      Sfx.lose();
    }
    Music.play(place <= 3 ? 'victory' : 'n64kart');
    Save.write();
    const box = $('.k-box');
    box.classList.remove('hidden');
    box.classList.add('k-end');
    box.innerHTML = `${lines.map((l) => `<div>${esc(l)}</div>`).join('')}<div class="k-endmenu"></div>`;
    this.ui = new ListMenu($('.k-endmenu', box), [{ label: 'Otra carrera' }, { label: 'Salir' }], {
      cols: 2,
      onPick: (i) => (i === 0 ? Game.go('kart', { enemyId: this.id, back: this.back }) : Game.go(this.back)),
    });
  },
};
