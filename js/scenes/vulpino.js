// CAPITAN VULPINO — disparar a palabras (guiño a Star Fox, 1993, y su chip Super FX). LORE.md §6.4.
// Las palabras vienen del fondo (chicas) hacia ti (grandes). Escribir la primera letra apunta
// (si hay dos que empiezan igual, a la más cercana); terminarla la destruye.
// Oleada sin daño = 1 anillo. Con 3 anillos, Vulpino da la cara: una frase con puntuación = 40 de daño.
// Las palabras VERDES son mensajes de radio (rodar, equipo, radio): llenan la PAZ.
// Con { arcade: true } es el minijuego ESCUADRON ZORRINO: oleadas infinitas y 3 vidas.

const FOX = {
  words: ['giro', 'nave', 'láser', 'escudo', 'zorro', 'radar', 'misil', 'órbita', 'cañón', 'piloto', 'cometa', 'planeta',
    'alerta', 'turbo', 'ala', 'motor', 'rápido', 'señal', 'galaxia', 'estrella', 'polígono', 'triángulo', 'hangar', 'túnel'],
  signs: ['¡fuego!', '¿listo?', '¡gira!', '¿dónde?', '¡alerta!', '¿quién?', '¡ya!', '¡atrás!'],
  pairs: ['nave roja', 'giro doble', 'gran láser', 'ala rota', 'zorro veloz', 'rayo azul', 'polígono plano', 'piloto feliz'],
  phrases: [
    '¡Haz un giro, piloto, y no te rindas!',
    'Mi nave tiene veinte polígonos, ¿lo sabías?',
    '¡Escuadrón, en formación, que ya vienen!',
    'Todos mis polígonos son triángulos, ¿ves?',
    'El chip dibuja la nave, ¡y muy rápido!',
    'Vuela bajo, esquiva y dispara, ¡ya!',
  ],
  radio: {
    rodar: '* Haces un giro completo.\n* VULPINO: "...¡Nada mal, cadete!"',
    equipo: '* Le dices que su escuadrón lo necesita.\n* VULPINO: "...¿Mi equipo? kzzt... ¿Me están buscando?"',
    radio: '* "¡Vulpino, contesta!"\n* VULPINO: "...Aquí Vulpino. Te escucho, piloto."',
  },
  hitDmg: 4,     // lo que te quita una palabra que llega
  wordDmg: 2,    // lo que le quita a Vulpino cada palabra destruida
  phraseDmg: 40, // la frase cuando da la cara
};

// Naves de polígonos planos, con sombreado por cara (como el Super FX).
const FOX_MESH = {
  v: [[0, 0, -3], [-3, -0.3, 1], [3, -0.3, 1], [0, 0.9, 0.6], [0, -0.5, 0.8], [0, 0, 1.2]],
  f: [[0, 1, 3, 'a'], [0, 3, 2, 'a'], [0, 4, 1, 'b'], [0, 2, 4, 'b'], [3, 1, 5, 'c'], [3, 5, 2, 'c'], [4, 5, 1, 'b'], [4, 2, 5, 'b']],
};
function shadeHex(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const c = (s) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k)));
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}
function drawMesh(g, mesh, { x, y, scale, yaw = 0, pitch = 0, roll = 0, colors }) {
  const rot = mesh.v.map(([vx, vy, vz]) => {
    let X = vx * Math.cos(roll) - vy * Math.sin(roll);
    let Y = vx * Math.sin(roll) + vy * Math.cos(roll);
    let Z = vz;
    const x2 = X * Math.cos(yaw) + Z * Math.sin(yaw);
    Z = -X * Math.sin(yaw) + Z * Math.cos(yaw);
    X = x2;
    const y2 = Y * Math.cos(pitch) - Z * Math.sin(pitch);
    Z = Y * Math.sin(pitch) + Z * Math.cos(pitch);
    Y = y2;
    return [X, Y, Z];
  });
  const L = [0.3, 0.8, 0.5];
  mesh.f.map(([a, b, c, col]) => {
    const [p, q, r] = [rot[a], rot[b], rot[c]];
    const u = [q[0] - p[0], q[1] - p[1], q[2] - p[2]];
    const w = [r[0] - p[0], r[1] - p[1], r[2] - p[2]];
    const nx = u[1] * w[2] - u[2] * w[1];
    const ny = u[2] * w[0] - u[0] * w[2];
    const nz = u[0] * w[1] - u[1] * w[0];
    const len = Math.hypot(nx, ny, nz) || 1;
    const light = Math.abs(nx * L[0] + ny * L[1] + nz * L[2]) / len;
    return { pts: [p, q, r], z: (p[2] + q[2] + r[2]) / 3, color: shadeHex(colors[col], 0.45 + 0.6 * light) };
  }).sort((m, n) => m.z - n.z).forEach((face) => {
    g.fillStyle = face.color;
    g.beginPath();
    face.pts.forEach(([X, Y, Z], i) => {
      const f = 1 / (1 - Z * 0.06);
      const sx = x + X * scale * f;
      const sy = y - Y * scale * f;
      if (i) g.lineTo(sx, sy); else g.moveTo(sx, sy);
    });
    g.closePath();
    g.fill();
  });
}

Scenes.vulpino = {
  enter({ enemyId = 'vulpino', back = 'map', arcade = false } = {}) {
    document.body.className = 'theme-snes';
    const def = ENEMIES[enemyId] || ENEMIES.vulpino;
    Object.assign(this, {
      id: enemyId, def, back, arcade,
      strict: strictOn(true),
      phase: 'intro', running: true, t: 0,
      hp: def.hp, mercy: 0, p: { hp: playerMaxHp(), max: playerMaxHp() }, lives: 3,
      wave: 0, cycle: 0, rings: 0, list: [], queue: [], target: null, damaged: false,
      shots: [], booms: [], usedRadio: {}, roll: 0,
      st: { chars: 0, errors: 0, t0: 0 },
    });
    Game.root.innerHTML = `
      <div class="fox">
        <canvas class="fox-cv" width="320" height="240"></canvas>
        <div class="fox-words"></div>
        <div class="fox-hud">
          <div class="fh-me">${arcade ? '<span class="fh-lives"></span>' : 'TÚ <div class="bar fh-php"><i></i></div>'}</div>
          <div class="fh-mid"><span class="fh-rings"></span><br><span class="fh-wave"></span></div>
          <div class="fh-foe">${arcade ? '<span class="fh-best"></span>' : 'VULPINO <div class="bar fh-ehp"><i></i></div>PAZ <div class="bar fh-mercy"><i></i></div>'}</div>
        </div>
        <div class="fox-radio hidden"></div>
        <div class="fox-flash hidden"></div>
        <div class="box fox-box hidden"></div>
      </div>`;
    this.cv = $('.fox-cv');
    this.g = this.cv.getContext('2d');
    this.layer = $('.fox-words');
    this.m7 = new Mode7(this.cv, M7_FLOORS.planet(), { horizon: 0.5, height: 20, focal: 140, fog: 'rgba(26,26,46,0.95)' });
    this.stars = Array.from({ length: 50 }, () => ({ a: Math.random() * Math.PI * 2, r: Math.random(), s: 0.3 + Math.random() }));
    this.updateHud();
    this.last = performance.now();
    this.raf = requestAnimationFrame((ts) => this.loop(ts));
    Music.play('snes_vulpino');

    const pages = arcade
      ? ['* MAESTRA MODO: ¡ESCUADRON ZORRINO!\n* Oleadas infinitas y 3 vidas. Desde la oleada 5 hay ¿? y ¡!',
        '* (Escribe las palabras para dispararles. La primera letra apunta.)']
      : ['* (Una voz entrecortada sale del radio...)\n* VULPINO: ¡Aquí el Capitán Vulpino! Nadie pasa por mi hangar... kzzt.',
        '* VULPINO: Mi nave tiene 20 polígonos.\n* Y todos son triángulos.',
        '* Un letrero en el hangar:\n* "El chip que dibujaba polígonos venía DENTRO del cartucho."',
        '* (Escribe las palabras que vienen para dispararles. La primera letra apunta.\n* Oleada sin daño = 1 anillo. ¡Con 3, Vulpino da la cara!)',
        '* (Las palabras VERDES son del radio. Dicen que hacen las paces...)',
        '* VULPINO: ¡Haz un giro! ...¿No sabes?\n* ¡Escribe "giro"!'];
    this.boxShow(true);
    this.ui = new Dialog($('.fox-box'), pages, () => { this.boxShow(false); this.ui = null; this.st.t0 = performance.now(); this.nextWave(); });
  },

  exit() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    clearTimeout(this.waveT);
    clearTimeout(this.radioT);
    if (this.ui && this.ui.stop) this.ui.stop();
  },

  boxShow(on) { $('.fox-box').classList.toggle('hidden', !on); },

  flash(text, small = false) {
    const el = $('.fox-flash');
    el.textContent = text;
    el.classList.toggle('small', small);
    el.classList.remove('hidden');
    clearTimeout(this.flashT);
    this.flashT = setTimeout(() => el.classList.add('hidden'), 900);
  },

  radioSay(text) {
    const el = $('.fox-radio');
    el.innerHTML = esc(text).replace(/\n/g, '<br>');
    el.classList.remove('hidden');
    this.radioOn = 3;
    clearTimeout(this.radioT);
    this.radioT = setTimeout(() => el.classList.add('hidden'), 3000);
  },

  updateHud() {
    if (this.arcade) {
      $('.fh-lives').textContent = '♥'.repeat(this.lives) + '♡'.repeat(Math.max(0, 3 - this.lives));
      $('.fh-best').textContent = `RECORD ${(Save.data.arcade || {}).zorrino || 0}`;
      $('.fh-rings').textContent = '';
    } else {
      $('.fh-php i').style.width = `${(this.p.hp / this.p.max) * 100}%`;
      $('.fh-ehp i').style.width = `${(this.hp / this.def.hp) * 100}%`;
      $('.fh-mercy i').style.width = `${Math.min(100, this.mercy)}%`;
      $('.fh-rings').textContent = '◎'.repeat(this.rings) + '○'.repeat(3 - this.rings);
    }
    $('.fh-wave').textContent = `OLEADA ${Math.max(1, this.wave)}`;
  },

  // ---------- Oleadas ----------

  pool() {
    const w = this.wave;
    let pool = FOX.words.slice();
    if (this.arcade ? w >= 5 : this.cycle >= 1) pool = pool.concat(snesSigns(FOX.signs)());
    if (this.arcade ? w >= 10 : this.cycle >= 2) pool = pool.concat(FOX.pairs);
    return pool;
  },

  nextWave() {
    this.phase = 'wave';
    this.wave++;
    this.damaged = false;
    const size = this.arcade ? Math.min(7, 3 + Math.floor(this.wave / 3)) : Math.min(5, 3 + this.cycle);
    const travel = (this.arcade ? Math.max(2.4, 5 - this.wave * 0.15) : Math.max(3, 5 - this.cycle)) / diff().speed;
    const words = pickWords(this.pool(), size);
    // De vez en cuando llega un mensaje de radio (verde) que llena la PAZ.
    const radioLeft = Object.keys(FOX.radio).filter((k) => !this.usedRadio[k]);
    if (!this.arcade && this.wave >= 2 && radioLeft.length && Math.random() < 0.6) words.push(rand(radioLeft));
    this.queue = words.map((text, i) => ({ text, at: this.t + i * travel * 0.33, travel, special: !!FOX.radio[text] && !this.arcade }));
    this.flash(`OLEADA ${this.wave}`);
    this.updateHud();
  },

  spawn(q) {
    const b = { ...q, z: 1, pos: 0, lx: Math.random() * 1.6 - 0.8 };
    b.el = document.createElement('div');
    b.el.className = `fword${b.special ? ' radio' : ''}`;
    this.layer.appendChild(b.el);
    this.renderWord(b);
    this.list.push(b);
  },

  renderWord(b) {
    b.el.innerHTML = `<span class="t">${esc(b.text.slice(0, b.pos))}</span>${esc(b.text.slice(b.pos))}`;
  },

  screenOf(b) {
    const k = 1 - b.z;
    return { x: 320 + b.lx * (30 + 250 * k), y: 210 + k * 150, s: 0.45 + 0.85 * k };
  },

  remove(b) {
    this.list = this.list.filter((x) => x !== b);
    if (this.target === b) this.target = null;
  },

  arrive(b) {
    this.remove(b);
    b.el.remove();
    if (b.special) return; // el mensaje de radio solo se va
    this.damaged = true;
    Sfx.hurt();
    $('.fox').classList.remove('hurt');
    void $('.fox').offsetWidth;
    $('.fox').classList.add('hurt');
    if (this.arcade) {
      this.lives--;
      this.updateHud();
      if (this.lives <= 0) this.arcadeOver();
      return;
    }
    this.p.hp = Math.max(0, this.p.hp - scaledDmg(FOX.hitDmg));
    this.updateHud();
    if (this.p.hp <= 0) {
      this.phase = 'over';
      Sfx.lose();
      setTimeout(() => Game.go('gameover', { enemyId: this.id, back: this.back, scene: 'vulpino' }), 700);
    }
  },

  destroy(b) {
    this.remove(b);
    const sp = this.screenOf(b);
    this.shots.push({ x: sp.x / 2, y: sp.y / 2, t: 0 });
    for (let i = 0; i < 14; i++) this.booms.push({ x: sp.x / 2, y: sp.y / 2, vx: (Math.random() - 0.5) * 90, vy: (Math.random() - 0.5) * 90, t: 0 });
    this.roll = Math.max(-0.6, Math.min(0.6, b.lx * 0.7));
    Sfx.pop();
    b.el.classList.add('pop');
    setTimeout(() => b.el.remove(), 250);
    if (b.special) {
      this.usedRadio[b.text] = true;
      this.mercy = Math.min(100, this.mercy + 34);
      Sfx.mercy();
      this.radioSay(FOX.radio[b.text]);
      this.updateHud();
      if (this.mercy >= 100) { this.phase = 'over'; setTimeout(() => this.win(true), 1500); }
      return;
    }
    if (!this.arcade) {
      this.hp = Math.max(0, this.hp - FOX.wordDmg);
      this.updateHud();
      if (this.hp <= 0) { this.phase = 'over'; setTimeout(() => this.win(false), 700); }
    }
  },

  waveDone() {
    this.phase = 'between';
    if (this.arcade) {
      const best = (Save.data.arcade || {}).zorrino || 0;
      if (this.wave > best) { Save.data.arcade.zorrino = this.wave; Save.write(); }
      this.waveT = setTimeout(() => this.nextWave(), 900);
      return;
    }
    if (!this.damaged) {
      this.rings++;
      Sfx.heal();
      this.flash('¡ANILLO DE CARGA!');
      this.updateHud();
    }
    this.waveT = setTimeout(() => (this.rings >= 3 ? this.faceOff() : this.nextWave()), 1000);
  },

  // Con 3 anillos, Vulpino aparece de frente: una frase larga con puntuación.
  faceOff() {
    this.phase = 'boss';
    this.bossT = 0;
    this.radioSay('* VULPINO: ¡kzzt! ¡Me tienes en la mira!\n* ¡A ver si escribes esto!');
    this.boxShow(true);
    const text = snesSigns([rand(FOX.phrases)])()[0];
    this.ui = new TypingTask($('.fox-box'), {
      label: '¡VULPINO AL FRENTE! Escribe para disparar:',
      texts: [text],
      timeLimit: text.length * 450 + 3000,
      strict: true,
      onDone: (res) => {
        this.st.chars += res.chars;
        this.st.errors += res.errors;
        const dmg = res.completed ? FOX.phraseDmg : Math.round(FOX.phraseDmg * res.progress * 0.6);
        this.hp = Math.max(0, this.hp - dmg);
        this.boxShow(false);
        this.ui = null;
        if (dmg) { Sfx.crit(); this.flash(res.completed && !res.errors ? `¡PERFECTO! -${dmg}` : `-${dmg}`); }
        for (let i = 0; i < 30; i++) this.booms.push({ x: 160, y: 80, vx: (Math.random() - 0.5) * 160, vy: (Math.random() - 0.5) * 160, t: 0 });
        this.rings = 0;
        this.cycle++;
        this.updateHud();
        if (this.hp <= 0) { this.phase = 'over'; setTimeout(() => this.win(false), 900); return; }
        this.radioSay(rand(['* VULPINO: ¡Ay! ¡Mis triángulos!', '* VULPINO: kzzt... ¡Todavía no termino!', '* VULPINO: ¡Escuadrón, más rápido!']));
        this.phase = 'between';
        this.waveT = setTimeout(() => this.nextWave(), 1400);
      },
    });
    this.ui.start();
  },

  // ---------- Tecleo ----------

  onKey(e) {
    if (this.phase === 'intro' || this.phase === 'boss') { if (this.ui) this.ui.key(e); return; }
    if (this.phase === 'paused' || this.phase === 'end') { if (this.menu) this.menu.key(e); return; }
    if (e.key === 'Escape') { if (this.phase === 'wave') this.pause(); return; }
    if (this.phase !== 'wave' || e.repeat || e.key.length !== 1) return;
    const match = this.strict ? strictMatch : keyMatches;
    const k = e.key;
    let b = this.target;
    if (b) {
      const expected = b.text[b.pos];
      if (!match(expected, k)) {
        Stats.record(expected, false);
        this.st.errors++;
        Sfx.error();
        if (this.strict && strictTip(expected, k)) this.flash(strictTip(expected, k), true);
        return;
      }
      Stats.record(expected, true);
    } else {
      if (k === ' ') return;
      const options = this.list.filter((x) => match(x.text[0], k));
      if (!options.length) { this.st.errors++; Sfx.error(); return; }
      b = options.reduce((a, x) => (x.z < a.z ? x : a)); // la más cercana
      Stats.record(b.text[0], true);
    }
    this.st.chars++;
    b.pos++;
    if (b.pos >= b.text.length) { this.destroy(b); return; }
    Sfx.key();
    this.target = b;
    b.el.classList.add('target');
    this.renderWord(b);
  },

  pause() {
    this.prevPhase = this.phase;
    this.phase = 'paused';
    const el = document.createElement('div');
    el.className = 'snes-pause';
    el.innerHTML = '<div>PAUSA</div><div class="snes-pmenu"></div>';
    $('.fox').appendChild(el);
    const resume = () => { el.remove(); this.menu = null; this.phase = this.prevPhase; this.last = performance.now(); };
    this.menu = new ListMenu($('.snes-pmenu', el), [{ label: 'Seguir' }, { label: 'Salir' }], {
      cols: 2,
      onPick: (i) => (i === 1 ? Game.go(this.back) : resume()),
      onCancel: resume,
    });
  },

  // ---------- Bucle ----------

  loop(ts) {
    if (!this.running) return;
    const dt = Math.max(0, Math.min(50, ts - this.last)) / 1000;
    this.last = ts;
    if (this.phase !== 'paused') this.update(dt);
    this.draw();
    this.raf = requestAnimationFrame((t) => this.loop(t));
  },

  update(dt) {
    this.t += dt;
    this.roll *= Math.exp(-dt * 3);
    if (this.phase === 'wave') {
      while (this.queue.length && this.queue[0].at <= this.t) this.spawn(this.queue.shift());
      for (const b of [...this.list]) {
        b.z -= dt / b.travel;
        if (b.z <= 0) this.arrive(b);
      }
      if (this.phase === 'wave' && !this.queue.length && !this.list.length) this.waveDone();
    }
    this.list.forEach((b) => {
      const sp = this.screenOf(b);
      b.el.style.transform = `translate(${sp.x}px, ${sp.y}px) translate(-50%, -50%) scale(${sp.s})`;
      b.el.style.zIndex = Math.round((1 - b.z) * 100);
    });
    if (this.phase === 'boss') this.bossT += dt;
  },

  draw() {
    const g = this.g;
    const t = this.t;
    // Suelo del planeta en Modo 7 y espacio con estrellas.
    this.m7.render(t * 140, 64 + Math.sin(t * 0.4) * 20, this.roll * 0.3);
    const sky = g.createLinearGradient(0, 0, 0, 120);
    sky.addColorStop(0, '#0b0b1e');
    sky.addColorStop(1, '#2e2a6e');
    g.fillStyle = sky;
    g.fillRect(0, 0, 320, 121);
    g.fillStyle = '#ffffff';
    this.stars.forEach((s) => {
      s.r += 0.004 * s.s;
      if (s.r > 1) { s.r = 0.02; s.a = Math.random() * Math.PI * 2; }
      const x = 160 + Math.cos(s.a) * s.r * 200;
      const y = 60 + Math.sin(s.a) * s.r * 60;
      if (y < 120) g.fillRect(x, y, s.r > 0.6 ? 2 : 1, 1);
    });
    // Planeta al fondo.
    g.fillStyle = '#8e44ad';
    g.beginPath();
    g.arc(250, 40, 18, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#c39bd3';
    g.fillRect(232, 38, 36, 3);

    // Vulpino de frente, girando, cuando da la cara.
    if (this.phase === 'boss') {
      const k = Math.min(1, this.bossT * 1.5);
      drawMesh(g, FOX_MESH, {
        x: 160 + Math.sin(t * 2) * 20, y: 70 + Math.cos(t * 1.4) * 6, scale: 6 + 10 * k,
        yaw: Math.PI + Math.sin(t * 1.3) * 0.7, pitch: 0.3, roll: Math.sin(t * 2) * 0.3,
        colors: { a: '#ff8c1a', b: '#ffffff', c: '#e8393d' },
      });
    }
    // Disparos y explosiones.
    this.shots = this.shots.filter((s) => (s.t += 1 / 60) < 0.15);
    g.strokeStyle = '#9be86e';
    g.lineWidth = 2;
    this.shots.forEach((s) => {
      g.beginPath();
      g.moveTo(152, 196);
      g.lineTo(s.x, s.y);
      g.moveTo(168, 196);
      g.lineTo(s.x, s.y);
      g.stroke();
    });
    this.booms = this.booms.filter((b) => (b.t += 1 / 60) < 0.5);
    this.booms.forEach((b) => {
      g.fillStyle = b.t < 0.2 ? '#ffd93d' : '#ff8c1a';
      g.fillRect(b.x + b.vx * b.t, b.y + b.vy * b.t, 2, 2);
    });
    // Tu nave, vista desde atrás.
    drawMesh(g, FOX_MESH, {
      x: 160, y: 200 + Math.sin(t * 3) * 2, scale: 9, yaw: 0, pitch: 0.35, roll: this.roll,
      colors: { a: '#eef2f8', b: '#3b7bd8', c: '#8c8c9c' },
    });
    g.fillStyle = Math.random() < 0.5 ? '#9be7ff' : '#5fcde4';
    g.fillRect(156, 207, 8, 3);
    // Ventanita del radio con la cara de Vulpino (como en los juegos de naves).
    if (!$('.fox-radio').classList.contains('hidden')) {
      g.fillStyle = '#1a1a2e';
      g.fillRect(6, 30, 40, 40);
      g.strokeStyle = '#ffffff';
      g.strokeRect(6.5, 30.5, 39, 39);
      paintArt(g, SNES_SPRITES.vulpino, 10, 34, 2);
    }
  },

  // ---------- Final ----------

  clearWords() {
    this.list.forEach((b) => b.el.remove());
    this.list = [];
    this.queue = [];
  },

  endCard(lines, items) {
    this.phase = 'end';
    this.clearWords();
    this.boxShow(true);
    const box = $('.fox-box');
    box.classList.add('end');
    box.innerHTML = `${lines.map((l) => `<div>${esc(upper(l))}</div>`).join('')}<div class="snes-pmenu"></div>`;
    this.menu = new ListMenu($('.snes-pmenu', box), items, { cols: items.length, onPick: (i) => items[i].go() });
  },

  arcadeOver() {
    this.phase = 'over';
    Music.stop();
    Sfx.lose();
    const d = Save.data;
    const cleared = this.wave - 1;
    const best = d.arcade.zorrino || 0;
    if (cleared > best) d.arcade.zorrino = cleared;
    const mins = (performance.now() - this.st.t0) / 60000;
    const wpm = Math.round(this.st.chars / 5 / Math.max(mins, 0.01));
    Stats.addBattle({ enemy: 'zorrino', wpm, acc: this.acc(), date: Date.now() });
    Save.write();
    this.endCard(['FIN DEL ESCUADRÓN', `Oleadas superadas: ${cleared}`, cleared > best ? '¡NUEVO RÉCORD!' : `Récord: ${best}`],
      [{ label: 'Otra vez', go: () => Game.go('vulpino', { arcade: true, back: this.back }) }, { label: 'Salir', go: () => Game.go(this.back) }]);
  },

  acc() {
    const typed = this.st.chars + this.st.errors;
    return typed ? Math.round((this.st.chars / typed) * 100) : 100;
  },

  win(spared) {
    Music.play('victory');
    const d = Save.data;
    const mins = (performance.now() - this.st.t0) / 60000;
    const wpm = Math.round(this.st.chars / 5 / Math.max(mins, 0.01));
    const acc = this.acc();
    const isRecord = Stats.addBattle({ enemy: this.id, wpm, acc, date: Date.now() });
    const ups = addXp(this.def.xp);
    const lines = [spared ? '¡Hiciste las paces con el Capitán Vulpino!' : '¡El Capitán Vulpino huyó a toda velocidad!',
      spared ? 'VULPINO: "Mi escuadrón me espera. ¡Gracias, piloto!"' : 'VULPINO: "¡Esto no se queda así! ...kzzt."',
      `Ganaste ${this.def.xp} XP · ${wpm} PPM · Precisión ${acc}%`];
    if (isRecord && d.stats.battles.length > 1) lines.push(`¡NUEVO RÉCORD: ${wpm} PPM!`);
    if (ups) { lines.push(`¡Subiste a nivel ${d.level}!`); Sfx.levelup(); }
    if (spared) d.spared[this.id] = true;
    if (!d.done[this.id]) {
      d.done[this.id] = true;
      d.treasures.chip_fx = true;
      d.flags.arcade_zorrino = true;
      lines.push('Recibiste: CHIP FX', '¡ESCUADRÓN ZORRINO ya está en el arcade de la Maestra Modo!');
    }
    Save.write();
    this.endCard(lines, [{ label: 'Continuar', go: () => Game.go(this.back) }]);
  },
};
