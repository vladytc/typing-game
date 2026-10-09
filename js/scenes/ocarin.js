// TEMPLO DE LA MELODÍA — Ocarín enseña melodías con las teclas de la posición base (guiño a
// Ocarina of Time, 1998). Ocarín toca la melodía; tú la repites con ritmo:
//   tecla correcta y a tiempo (±250 ms × dificultad) = ¡PERFECTO!   correcta fuera de tiempo = bien
//   tecla equivocada = la melodía vuelve a empezar (Ocarín la toca otra vez).
// Lo mismo sirve para el minijuego Melodías (secuencias de 4 a 12 notas, de memoria) y para
// despertar al Roncatón en el pueblo con la Flauta Polígono (ver n64PlayFlute).

// Notas: s d f j k (Turbo/Difícil agrega a y l). Pentatónica de Do: siempre suena bonito.
const MELODY_NOTES = {
  a: { f: 392.0, color: '#9A8C7A' },
  s: { f: 523.25, color: '#D64545' },
  d: { f: 587.33, color: '#F7E463' },
  f: { f: 659.25, color: '#58B85C' },
  j: { f: 783.99, color: '#3C8DD6' },
  k: { f: 880.0, color: '#7E57C2' },
  l: { f: 1046.5, color: '#F0953C' },
};

// Sonido de flauta (onda senoidal con un vibrato suavecito).
function fluteNote(freq, dur = 0.35) {
  const c = Sfx.unlock();
  if (!c || Sfx.muted) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  const lfo = c.createOscillator();
  const lg = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(freq, t);
  lfo.frequency.value = 5.5;
  lg.gain.value = freq * 0.012;
  lfo.connect(lg).connect(o.frequency);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.12, t + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  lfo.start(t);
  o.stop(t + dur + 0.05);
  lfo.stop(t + dur + 0.05);
}

// Juzga una nota: ¿llegó a tiempo? (función pura, se prueba en Node).
function judgeNote(expectedMs, actualMs, windowMs) {
  return Math.abs(actualMs - expectedMs) <= windowMs ? 'perfect' : 'good';
}

class MelodyPrompt {
  // keys: 'sfkf' · opts: { title, beat (ms), showSeq, onDone({ perfect, total, errors, allPerfect, cancelled }), onNote(k) }
  constructor(el, keys, { title = '', beat = 560, showSeq = true, pads = 'sdfjk', onDone, onNote } = {}) {
    Object.assign(this, { el, keys: [...keys], title, showSeq, onDone, onNote, pads: [...pads] });
    this.beat = beat * diff().time;
    this.win = 250 * diff().time;
    this.timers = [];
    this.errors = 0;
  }

  start() {
    this.el.innerHTML = `
      <div class="mel">
        <div class="mel-title">${esc(this.title)}</div>
        <div class="mel-seq"></div>
        <div class="mel-pads">${this.pads.map((k) => `<div class="pad" data-k="${k}" style="--pc:${MELODY_NOTES[k].color}">${k.toUpperCase()}</div>`).join('')}</div>
        <div class="mel-msg"></div>
      </div>`;
    this.demo();
  }

  later(fn, ms) { this.timers.push(setTimeout(fn, ms)); }

  msg(text, cls = '') {
    const m = $('.mel-msg', this.el);
    if (m) { m.textContent = text; m.className = `mel-msg ${cls}`; }
  }

  renderSeq() {
    const s = $('.mel-seq', this.el);
    if (!s) return;
    s.innerHTML = this.keys.map((k, i) => {
      const st = i < this.idx ? (this.marks[i] === 'perfect' ? 'pf' : 'ok') : i === this.idx && this.phase === 'turn' ? 'nx' : '';
      const show = this.showSeq || this.phase === 'demo' && i <= this.demoAt || i < this.idx;
      return `<span class="${st}">${show ? k.toUpperCase() : '·'}</span>`;
    }).join('');
  }

  light(k) {
    const p = $(`.pad[data-k="${k}"]`, this.el);
    if (p) { p.classList.remove('on'); void p.offsetWidth; p.classList.add('on'); }
    fluteNote(MELODY_NOTES[k].f);
    if (this.onNote) this.onNote(k);
  }

  // Ocarín toca la melodía para que la escuches.
  demo() {
    this.phase = 'demo';
    this.idx = 0;
    this.marks = [];
    this.demoAt = -1;
    this.msg('♪ Escucha...');
    this.renderSeq();
    this.keys.forEach((k, i) => this.later(() => { this.demoAt = i; this.light(k); this.renderSeq(); }, 500 + i * this.beat));
    this.later(() => {
      this.phase = 'turn';
      this.t0 = 0;
      this.msg('¡Tu turno! Toca las teclas con el mismo ritmo.');
      this.renderSeq();
    }, 500 + this.keys.length * this.beat + 250);
  }

  key(e) {
    if (e.key === 'Escape') { this.stop(); if (this.onDone) this.onDone({ cancelled: true }); return; }
    if (this.phase !== 'turn' || e.repeat || e.key.length !== 1) return;
    const k = e.key.toLowerCase();
    const expected = this.keys[this.idx];
    if (!this.pads.includes(k)) return; // las demás teclas no hacen nada
    const now = performance.now();
    if (k !== expected) {
      Stats.record(expected, false);
      this.errors++;
      Sfx.error();
      this.phase = 'wait';
      this.msg('¡Uy! Esa no era. Ocarín la toca otra vez...', 'bad');
      const s = $('.mel', this.el);
      if (s) { s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake'); }
      this.later(() => this.demo(), 1100);
      return;
    }
    Stats.record(expected, true);
    if (!this.t0) this.t0 = now;
    const mark = this.idx === 0 ? 'perfect' : judgeNote(this.t0 + this.idx * this.beat, now, this.win);
    this.marks.push(mark);
    this.light(k);
    this.idx++;
    this.msg(mark === 'perfect' ? '¡PERFECTO!' : 'bien', mark === 'perfect' ? 'pf' : '');
    this.renderSeq();
    if (this.idx >= this.keys.length) {
      this.phase = 'done';
      const perfect = this.marks.filter((m) => m === 'perfect').length;
      const res = { perfect, total: this.keys.length, errors: this.errors, allPerfect: perfect === this.keys.length };
      this.msg(res.allPerfect ? '¡MELODIA PERFECTA!' : `¡Lo lograste! ${perfect}/${res.total} perfectas`, 'pf');
      this.later(() => this.onDone && this.onDone(res), 900);
    }
  }

  stop() {
    this.phase = 'off';
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }
}

// Para el pueblo: toca una melodía dentro de la caja de diálogo de la escena actual.
// Devuelve una promesa con el resultado (o { cancelled: true } con ESC).
function n64PlayFlute(keys = 'sdfjkjfd', title = 'FLAUTA POLIGONO · Canción de Despertar') {
  return new Promise((done) => {
    const sc = Game.scene;
    const body = sc.showBox ? sc.showBox() : Game.root;
    body.innerHTML = '';
    sc.ui = new MelodyPrompt(body, keys, { title, beat: 560, onDone: done });
    sc.ui.start();
  });
}

Scenes.ocarin = {
  music: 'n64temple',

  enter({ enemyId = 'ocarin', back = 'map', final = false } = {}) {
    document.body.className = 'theme-n64';
    Object.assign(this, { id: enemyId, def: ENEMIES[enemyId], back, final, ui: null, timers: [], songsDef: ENEMIES.ocarin.songs });
    Game.root.innerHTML = `
      <div class="oc">
        <div class="oc-3d"></div>
        <div class="oc-title">TEMPLO DE LA MELODIA</div>
        <div class="box oc-box"></div>
      </div>`;
    this.box = $('.oc-box');
    Poly.attach(this, $('.oc'), () => this.build3d());
    this.begin();
  },

  exit() {
    this.tok = null;
    this.timers.forEach(clearTimeout);
    if (this.ui && this.ui.stop) this.ui.stop();
    if (this.v) { this.v.dispose(); this.v = null; }
  },

  // ---------- 3D: templo circular con pilares y cristales que suenan ----------

  build3d() {
    const v = Poly.view($('.oc-3d'), { sky: '#4A3F7A', fog: [18, 70], fogColor: '#6A5FA0' });
    if (!v) return;
    this.v = v;
    const M = Poly.models;
    this.skyG = Poly.sky(v, { radius: 60, mountains: 7, clouds: 4, y: -6 });
    const floor = v.mesh(new THREE.CylinderGeometry(13, 14, 1.2, 8), N64C.rock);
    floor.position.y = -0.6;
    const step = v.mesh(new THREE.CylinderGeometry(15, 16, 1.2, 8), N64C.rockD);
    step.position.y = -1.6;
    const water = v.mesh(new THREE.PlaneGeometry(300, 300), N64C.water);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -2.5;
    for (let i = 0; i < 8; i++) {
      // Medio paso de giro: así ningún pilar queda entre la cámara y Ocarín.
      const a = ((i + 0.5) / 8) * Math.PI * 2;
      const p = v.mesh(new THREE.CylinderGeometry(0.7, 0.8, 9, 6), N64C.white);
      p.position.set(Math.cos(a) * 11, 4.5, Math.sin(a) * 11);
      const cap = v.mesh(new THREE.BoxGeometry(2, 0.6, 2), N64C.sand);
      cap.position.set(Math.cos(a) * 11, 9.2, Math.sin(a) * 11);
    }
    // La máscara del easter egg (§7.8), colgada de un pilar.
    const mask = v.mesh(new THREE.ConeGeometry(0.8, 0.5, 5), N64C.purple);
    mask.rotation.x = Math.PI / 2;
    mask.position.set(Math.cos(Math.PI * 0.625) * 10.2, 5, Math.sin(Math.PI * 0.625) * 10.2);
    this.oca = M.ocarin(v);
    this.oca.position.set(0, 0, -3);
    v.scene.add(this.oca);
    const pads = 'asdfjkl';
    this.crystals = {};
    [...pads].forEach((k, i) => {
      const c = v.mesh(new THREE.OctahedronGeometry(0.55, 0), MELODY_NOTES[k].color, { emissive: '#000000' });
      c.position.set((i - 3) * 1.7, 1.6, 3);
      c.visible = 'sdfjk'.includes(k) || Save.data.difficulty === 'dificil';
      this.crystals[k] = c;
    });
    this.notes = [];
    v.camera.position.set(0, 4.5, 13);
    v.start((dt, t) => {
      this.oca.position.y = 0.3 + Math.sin(t * 1.6) * 0.25;
      this.oca.rotation.y = Math.sin(t * 0.5) * 0.3;
      v.camera.position.x = Math.sin(t * 0.15) * 3;
      v.camera.lookAt(0, 2.6, 0);
      Object.values(this.crystals).forEach((c, i) => {
        c.rotation.y += dt * 1.5;
        c.position.y = 1.6 + Math.sin(t * 2 + i) * 0.1;
        if (c.userData.glow > 0) {
          c.userData.glow -= dt * 3;
          c.material.emissive.setRGB(c.userData.glow * 0.8, c.userData.glow * 0.8, c.userData.glow * 0.8);
          c.scale.setScalar(1 + c.userData.glow * 0.4);
        }
      });
      this.notes = this.notes.filter((n) => {
        n.position.y += dt * 2.5;
        n.rotation.z += dt * 3;
        if (n.position.y > 9) { v.scene.remove(n); n.geometry.dispose(); return false; }
        return true;
      });
    });
  },

  onNote(k) {
    if (!this.v) return;
    const c = this.crystals[k];
    if (!c) return;
    c.userData.glow = 1;
    const n = this.v.mesh(new THREE.TetrahedronGeometry(0.3, 0), MELODY_NOTES[k].color);
    n.position.copy(c.position);
    this.notes.push(n);
  },

  // ---------- Flujo ----------

  later(fn, ms) { this.timers.push(setTimeout(fn, ms)); },

  say(pages, done, speaker = 'OCARIN') {
    this.phase = 'dialog';
    this.box.innerHTML = `<div class="speaker">${esc(speaker)}</div><div class="tb-text"></div>`;
    this.ui = new Dialog($('.tb-text', this.box), pages, done);
  },
  talk(pages, speaker) { return new Promise((r) => this.say(pages, r, speaker)); },

  play(keys, title, { showSeq = true, pads = 'sdfjk' } = {}) {
    return new Promise((done) => {
      this.phase = 'melody';
      this.box.innerHTML = '';
      this.ui = new MelodyPrompt(this.box, keys, { title, showSeq, pads, onDone: done, onNote: (k) => this.onNote(k) });
      this.ui.start();
    });
  },

  async begin() {
    const d = Save.data;
    const s = N64S();
    if (this.final) { await this.finale(); return; }
    if (!d.done.ocarin) {
      if (!s.songs) {
        await this.talk([
          '* ¡Hola, viajero! Soy OCARIN, el músico del templo.',
          '* Un tipo morado PAUSO la isla. ¿Ves esos huecos negros en el cielo?\n* Dicen MISSING. Son polígonos que se quedaron sin dibujar.',
          '* Cada melodía re-dibuja un pedacito de la isla.\n* Las notas son 5 teclas: S D F J K. ¡La posición base de tus dedos!',
          '* La música es tecleo con ritmo.\n* O el tecleo es música sin ritmo. Uno de los dos.',
          '* Yo toco, tú repites. Si tocas a tiempo: ¡PERFECTO!\n* Si te equivocas de tecla, la toco otra vez. Sin prisa.',
        ]);
      }
      while (s.songs < 4) {
        const song = this.songsDef[s.songs];
        await this.talk([`* Esta se llama ${upper(song.name)}.\n* (${song.effect})`]);
        const res = await this.play(song.keys, upper(song.name));
        if (res.cancelled) { Game.go(this.back); return; }
        s.songs++;
        s.played[s.songs - 1] = true;
        Save.write();
        Sfx.secret();
        await this.talk([res.allPerfect ? '* ¡Perfecta! Hasta los pilares bailaron.' : '* ¡Muy bien! Mira, un pedacito de cielo volvió a aparecer.', `* ${song.done}`]);
        if (this.v) this.rebuildSky();
      }
      this.win();
      return;
    }
    this.menu();
  },

  rebuildSky() {
    // Los parches MISSING se quitan conforme aprendes melodías.
    const v = this.v;
    v.free(this.skyG);
    this.skyG = Poly.sky(v, { radius: 60, mountains: 7, clouds: 4, y: -6 });
  },

  win() {
    const d = Save.data;
    d.done.ocarin = true;
    const ups = addXp(this.def.xp);
    Stats.addBattle({ enemy: 'ocarin', wpm: 0, acc: 100, date: Date.now() });
    Save.write();
    Music.play('victory');
    const pages = [
      '* ¡Las cuatro melodías! Cinco notas bastan. Siempre bastaron.',
      '* Hay una quinta canción, la CANCION DE DESPERTAR...\n* pero solo suena cuando la isla termine de cargar.',
      '* Dicen que Marco, en el castillo, guarda las Estrellas Polígono en sus cuadros.\n* Vuelve cuando lo hayas visitado.',
      `* Ganaste ${this.def.xp} XP.${ups ? `\n* ¡SUBISTE A NIVEL ${d.level}!` : ''}`,
    ];
    this.say(pages, () => Game.go(this.back));
  },

  // Después de vencer a Marco: la Canción de Despertar y la Flauta Polígono.
  async finale() {
    const d = Save.data;
    if (!d.done.marco) { this.later(() => Game.go('map'), 0); return; }
    if (d.treasures.flauta_poligono) { this.menu(); return; }
    await this.talk([
      '* ¡La isla terminó de cargar! ¡Mira el cielo, completito!',
      '* Ahora sí puedo enseñarte la última: la CANCION DE DESPERTAR.\n* Ocho notas. Con ella hasta lo más dormido abre los ojos.',
    ]);
    let res;
    do {
      res = await this.play('sdfjkjfd', 'CANCION DE DESPERTAR');
    } while (res.cancelled);
    N64S().played[4] = true;
    Sfx.secret();
    d.treasures.flauta_poligono = true;
    Quests.start('concierto_ocarin');
    Save.write();
    await this.talk([
      '* ¡Perfecto! Toma: la FLAUTA POLIGONO.\n* (Se guardó en tu vitrina.)',
      '* Dicen que en tu pueblo algo ENORME duerme en medio del camino...\n* Con esta flauta, despierta seguro.',
    ]);
    this.checkConcert();
    Game.go('map');
  },

  menu() {
    this.phase = 'menu';
    const best = (Save.data.arcade || {}).melodias || 0;
    this.box.innerHTML = `<div class="speaker">OCARIN</div><div class="oc-menu"></div><div class="dim oc-best">Récord de Melodías: ${best} notas</div>`;
    const items = [{ label: 'Repasar melodías' }, { label: 'Melodías (minijuego)' }, { label: 'Mirar la máscara' }, { label: 'Salir' }];
    this.ui = new ListMenu($('.oc-menu', this.box), items, {
      cols: 2,
      onPick: async (i) => {
        if (i === 0) this.review();
        else if (i === 1) this.minigame();
        else if (i === 2) { await this.talk(['* Una máscara cuelga de un pilar.\n* Tiene cara de que sabe algo.', '* "Tengo tres días. Siempre tengo tres días."'], 'MASCARA'); this.menu(); }
        else Game.go(this.back);
      },
      onCancel: () => Game.go(this.back),
    });
  },

  review() {
    const songs = this.songsDef.slice(0, Save.data.treasures.flauta_poligono ? 5 : 4);
    this.phase = 'menu';
    this.box.innerHTML = '<div class="oc-menu"></div>';
    this.ui = new ListMenu($('.oc-menu', this.box), [...songs.map((s, i) => ({ label: `${N64S().played[i] ? '♪' : '·'} ${s.name}` })), { label: 'Volver' }], {
      onPick: async (i) => {
        if (i >= songs.length) { this.menu(); return; }
        const res = await this.play(songs[i].keys, upper(songs[i].name));
        if (!res.cancelled) { N64S().played[i] = true; Save.write(); this.checkConcert(); }
        this.menu();
      },
      onCancel: () => this.menu(),
    });
  },

  // Minijuego Melodías: secuencias cada vez más largas, de memoria (4 → 12 notas).
  async minigame() {
    const turbo = Save.data.difficulty === 'dificil';
    const pads = turbo ? 'asdfjkl' : 'sdfjk';
    await this.talk([`* ¡Melodías! Yo toco, tú repites... de memoria.\n* Empezamos con 4 notas y cada vez una más, hasta 12.${turbo ? '\n* (Modo Turbo: también A y L.)' : ''}`]);
    let n = 4;
    let reached = 0;
    let perfect10 = false;
    for (; n <= 12; n++) {
      const seq = Array.from({ length: n }, () => rand([...pads])).join('');
      const res = await this.playOnce(seq, `MELODIAS · ${n} NOTAS`, pads);
      if (!res.ok) break;
      reached = n;
      if (n >= 10 && res.allPerfect) perfect10 = true;
    }
    const a = Save.data.arcade || (Save.data.arcade = {});
    const record = reached > (a.melodias || 0);
    if (record) a.melodias = reached;
    if (perfect10) N64S().perfect10 = true;
    Save.write();
    this.checkConcert();
    await this.talk([reached ? `* ¡Llegaste a ${reached} notas!${record ? ' ¡NUEVO RECORD!' : ''}` : '* ¡Uy! A la primera se escapa. Otra vez será.', '* Esto, en el fondo, entrena la posición base de tus manos. Shhh.']);
    this.menu();
  },

  // En el minijuego, equivocarse termina la ronda (no se repite).
  playOnce(keys, title, pads) {
    return new Promise((done) => {
      this.phase = 'melody';
      this.box.innerHTML = '';
      const mp = new MelodyPrompt(this.box, keys, { title, showSeq: false, pads, onNote: (k) => this.onNote(k), onDone: (r) => done({ ok: !r.cancelled, allPerfect: r.allPerfect }) });
      const baseKey = mp.key.bind(mp);
      mp.key = (e) => {
        const before = mp.errors;
        baseKey(e);
        if (mp.errors > before) { mp.stop(); setTimeout(() => done({ ok: false }), 900); }
      };
      this.ui = mp;
      mp.start();
    });
  },

  // Misión "El concierto de Ocarín": tocar las 5 y una melodía de 10 notas perfecta.
  checkConcert() {
    const s = N64S();
    if (Quests.state('concierto_ocarin') !== 'active') return;
    const all5 = [0, 1, 2, 3, 4].every((i) => s.played[i]);
    if (all5 && s.perfect10) {
      Quests.complete('concierto_ocarin');
      Save.data.treasures.flauta_repuesto = true;
      Save.write();
      toast('Recibiste: FLAUTA DE REPUESTO\n(Se guardó en tu vitrina.)');
    }
  },

  onKey(e) {
    if (this.ui && this.ui.key) this.ui.key(e);
  },
};

// Después de vencer a Marco, la batalla regresa aquí: Ocarín enseña la Canción de Despertar.
Scenes.despertar = Object.assign(Object.create(Scenes.ocarin), {
  enter() { Scenes.ocarin.enter.call(this, { final: true }); },
});
