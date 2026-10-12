// LAS 4 COPIAS DE SOMBRA del Mundo 5 (guiño al concepto crossover de Smash). LORE §8.4.
// El Glitch hizo copias de estática magenta de los jefes anteriores. Cada una es la mecánica
// del original RESUMIDA A 30 SEGUNDOS, con su HP al 40 %:
//   tetro      Tetro Rey: bloques con palabras caen por columnas.
//   caparazon  Lord Caparazón: metrónomo; cada palabra dura unos golpes (más letras, más golpes).
//   nebula     Reina Nébula: medusitas que suben ondulando.
//   marco      Marco: palabras dentro de cuadros que giran.
// Escribe las palabras (con su MAYUSCULA) para pegarle a la copia. Si algo te alcanza, pierdes HP.
// Si se acaban los 30 s y la copia sigue en pie, se rearma (pierdes). Al vencerla dice su frase
// triste y eliges: ABRAZAR (amistad: frase para el final) o DEJAR IR. ESC pausa.

const GC_SOMBRA = { time: 30, hitsToWin: 7, hurt: 5 }; // time se multiplica por la dificultad (Fácil 45 s)
const GC_SOMBRA_KINDS = {
  tetro: { every: 1.1, speed: 46, label: '¡Escribe los bloques antes de que toquen el piso!' },
  caparazon: { bpm: 96, label: '¡Al ritmo! Cada palabra dura unos golpes del metrónomo: ¡acábala antes!' },
  nebula: { every: 1.35, speed: 34, label: '¡Las medusitas suben! Escríbelas antes de que lleguen arriba.' },
  marco: { every: 1.6, label: '¡Lee los cuadros aunque giren!' },
};

Scenes.sombra = {
  enter({ enemyId, back = 'map' }) {
    document.body.className = 'theme-gc';
    const def = ENEMIES[enemyId];
    const orig = ENEMIES[def.orig] || {};
    Object.assign(this, {
      id: enemyId, def, back, kind: def.kind, K: GC_SOMBRA_KINDS[def.kind], timers: [], ui: null, phase: 'intro',
      maxHp: Math.max(30, Math.round((orig.hp || 200) * 0.4)), items: [], target: null, left: Math.round(GC_SOMBRA.time * diff().time),
      p: { hp: playerMaxHp(), max: playerMaxHp() }, st: { chars: 0, errors: 0 }, spawnT: 0.4, beat: 0, beatT: 0, playT: 0,
    });
    this.hp = this.maxHp;
    this.dmg = Math.ceil(this.maxHp / GC_SOMBRA.hitsToWin);
    Music.play(gcShadowTrackFor(def.origTrack));
    Game.root.innerHTML = `
      <div class="sombra kind-${this.kind}">
        <div class="sb-top">
          <span class="sb-name">${esc(upper(def.name))}</span>
          <span class="blabel">HP</span><div class="bar sb-hp"><i></i></div>
          <span class="sb-time"></span>
        </div>
        <div class="sb-field">
          <div class="sb-ghost"></div>
          <div class="sb-beat hidden"></div>
          <div class="sb-label"></div>
        </div>
        <div class="sb-bottom">
          <div class="pinfo"><div>Tú · NV ${Save.data.level}</div><div class="php"><span class="blabel">HP</span><div class="bar pbar"><i></i></div><span class="phpn"></span></div></div>
        </div>
        <div class="box sb-box hidden"></div>
      </div>`;
    const ghost = spriteCanvas(def.sprite, 12, false, 'sb-sprite');
    $('.sb-ghost').appendChild(ghost);
    this.field = $('.sb-field');
    this.W = this.field.clientWidth || 640;
    this.H = this.field.clientHeight || 330;
    $('.sb-label').textContent = this.K.label;
    if (this.kind === 'caparazon') $('.sb-beat').classList.remove('hidden');
    this.updateBars();
    Quests.start('cuatro_sombras');
    const first = !Save.data.done[enemyId];
    const pages = first ? [
      `* El aire se llena de estática magenta...\n* ¡Una ${upper(def.name)}!`,
      `* BIT: ¡Es una copia! El Glitch la hizo de estática.\n* Tiene la mecánica del original, pero solo dura ${this.left} segundos.`,
      `* BIT: ${this.K.label}\n* Ojo: las palabras empiezan con MAYUSCULA. (ESC pausa.)`,
    ] : [`* La ${upper(def.name)} vuelve a armarse de estática...`];
    this.showBox(pages, () => this.start());
  },

  exit() {
    this.timers.forEach(clearTimeout);
    cancelAnimationFrame(this.raf);
    if (this.ui && this.ui.stop) this.ui.stop();
  },

  later(fn, ms) { this.timers.push(setTimeout(fn, ms)); },

  showBox(pages, done) {
    const box = $('.sb-box');
    box.classList.remove('hidden');
    box.innerHTML = '<div class="tb-text"></div>';
    this.ui = new Dialog($('.tb-text', box), pages, () => { this.ui = null; box.classList.add('hidden'); done(); });
  },

  start() {
    this.phase = 'play';
    let last = performance.now();
    const step = (ts) => {
      const dt = Math.max(0, Math.min(50, ts - last)) / 1000;
      last = ts;
      this.update(dt, ts / 1000);
      if (this.phase === 'play' || this.phase === 'paused') this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  },

  updateBars() {
    $('.sb-hp i').style.width = `${(this.hp / this.maxHp) * 100}%`;
    $('.pbar i').style.width = `${(this.p.hp / this.p.max) * 100}%`;
    $('.phpn').textContent = `${this.p.hp}/${this.p.max}`;
    $('.sb-time').textContent = `${Math.max(0, Math.ceil(this.left))} s`;
  },

  // ---------- Palabras ----------

  spawn() {
    const used = this.items.map((x) => x.text[0]);
    const pool = this.def.words.filter((w) => !used.includes(w[0]));
    const text = rand(pool.length ? pool : this.def.words);
    const it = { text, pos: 0, errors: 0, t: 0 };
    it.el = document.createElement('div');
    it.el.className = `sb-word w-${this.kind}`;
    this.field.appendChild(it.el);
    this.renderItem(it);
    const w = it.el.offsetWidth || text.length * 14 + 16;
    const h = it.el.offsetHeight || 28;
    it.w = w;
    it.h = h;
    if (this.kind === 'tetro') {
      const cols = 5;
      const col = Math.floor(Math.random() * cols);
      Object.assign(it, { x: 10 + col * ((this.W - 20) / cols), y: -h, vy: this.K.speed });
    } else if (this.kind === 'nebula') {
      Object.assign(it, { x0: 20 + Math.random() * Math.max(0, this.W - w - 40), y: this.H, vy: -this.K.speed, ph: Math.random() * 6 });
      it.x = it.x0;
    } else if (this.kind === 'marco') {
      Object.assign(it, { x: 30 + Math.random() * Math.max(0, this.W - w - 60), y: 40 + Math.random() * (this.H - 120), ttl: (2.2 + text.length * 0.35) * diff().time, rot: Math.random() * 40 - 20 });
    } else {
      // Caparazón: aparece en el puente y tiene 2 golpes del metrónomo para acabarse.
      const beatS = 60 / this.K.bpm * diff().time;
      Object.assign(it, { x: 30 + Math.random() * Math.max(0, this.W - w - 60), y: this.H - 110 - Math.random() * 60, ttl: beatS * Math.round(2 + text.length * 0.6) });
    }
    this.items.push(it);
    this.place(it);
  },

  renderItem(it) {
    it.el.innerHTML = `<span class="t">${esc(it.text.slice(0, it.pos))}</span>${esc(it.text.slice(it.pos))}`;
  },

  place(it) {
    const rot = this.kind === 'marco' ? ` rotate(${it.rot}deg)` : '';
    it.el.style.transform = `translate(${Math.round(it.x)}px, ${Math.round(it.y)}px)${rot}`;
    if (it.ttl) it.el.style.setProperty('--life', `${Math.max(0, 1 - it.t / it.ttl)}`);
  },

  remove(it) {
    this.items = this.items.filter((x) => x !== it);
    if (this.target === it) this.target = null;
  },

  hurt(it) {
    this.remove(it);
    it.el.remove();
    this.p.hp = Math.max(0, this.p.hp - scaledDmg(GC_SOMBRA.hurt));
    Sfx.hurt();
    const f = $('.sombra');
    f.classList.remove('hurt');
    void f.offsetWidth;
    f.classList.add('hurt');
    this.updateBars();
    if (this.p.hp <= 0) this.lose('* ¡La copia te ganó!');
  },

  onKey(e) {
    if (this.ui) { this.ui.key(e); return; }
    if (this.phase !== 'play') return;
    if (e.key === 'Escape') { this.pause(); return; }
    if (e.repeat || e.key.length !== 1 || e.key === ' ') return;
    const match = pickMatch({ caps: true, strict: true });
    let it = this.target;
    if (it) {
      const want = it.text[it.pos];
      if (!match(want, e.key)) { Stats.record(want, false); this.st.errors++; it.errors++; Sfx.error(); return; }
      Stats.record(want, true);
    } else {
      const opts = this.items.filter((x) => match(x.text[0], e.key));
      if (!opts.length) { this.st.errors++; Sfx.error(); return; }
      it = opts.reduce((a, x) => (this.danger(x) > this.danger(a) ? x : a));
      Stats.record(it.text[0], true);
      this.target = it;
      it.el.classList.add('target');
    }
    it.pos++;
    this.st.chars++;
    Sfx.key();
    if (it.pos < it.text.length) { this.renderItem(it); return; }
    // ¡Palabra completa! Le pega a la copia.
    this.remove(it);
    it.el.classList.add('pop');
    this.later(() => it.el.remove(), 250);
    const dmg = it.errors ? this.dmg : Math.ceil(this.dmg * 1.25);
    this.hp = Math.max(0, this.hp - dmg);
    it.errors ? Sfx.hit() : Sfx.crit();
    const g = $('.sb-ghost');
    g.classList.remove('hit');
    void g.offsetWidth;
    g.classList.add('hit');
    this.updateBars();
    if (this.hp <= 0) this.beaten();
  },

  // Qué tan cerca está de alcanzarte (para elegir a cuál apuntar si dos empiezan igual).
  danger(it) {
    if (this.kind === 'tetro') return it.y / this.H;
    if (this.kind === 'nebula') return 1 - it.y / this.H;
    return it.t / it.ttl;
  },

  pause() {
    this.phase = 'paused';
    const el = document.createElement('div');
    el.className = 'smb-pause gc-pause';
    el.innerHTML = '<div>PAUSA</div><div class="smb-menu"></div>';
    $('.sombra').appendChild(el);
    const resume = () => { el.remove(); this.ui = null; this.phase = 'play'; };
    this.ui = new ListMenu($('.smb-menu', el), [{ label: 'Seguir' }, { label: 'Salir' }], {
      cols: 2, onPick: (i) => (i === 1 ? Game.go(this.back) : resume()), onCancel: resume,
    });
  },

  update(dt, time) {
    const ghost = $('.sb-ghost');
    if (ghost) ghost.style.transform = `translate(${Math.sin(time * 1.3) * 18}px, ${Math.sin(time * 2.1) * 6}px)`;
    if (this.phase !== 'play') return;
    this.playT += dt;
    this.left -= dt;
    // Generar palabras según la copia.
    if (this.kind === 'caparazon') {
      const beatS = 60 / this.K.bpm * diff().time;
      this.beatT += dt;
      if (this.beatT >= beatS) {
        this.beatT -= beatS;
        this.beat++;
        const b = $('.sb-beat');
        b.classList.remove('tick');
        void b.offsetWidth;
        b.classList.add('tick');
        Sfx.bump();
        if (this.beat % 2 === 1 && this.items.length < 3) this.spawn();
      }
    } else {
      this.spawnT -= dt * diff().speed;
      if (this.spawnT <= 0) { this.spawnT += this.K.every; if (this.items.length < 6) this.spawn(); }
    }
    for (const it of [...this.items]) {
      it.t += dt;
      if (this.kind === 'tetro') {
        it.y += it.vy * diff().speed * dt;
        if (it.y + it.h >= this.H - 6) { this.hurt(it); continue; }
      } else if (this.kind === 'nebula') {
        it.y += it.vy * diff().speed * dt;
        it.x = it.x0 + Math.sin(it.t * 2 + it.ph) * 26;
        if (it.y <= 4) { this.hurt(it); continue; }
      } else {
        if (this.kind === 'marco') it.rot += dt * 35 * (it.rot > 0 ? 1 : -1);
        if (it.t >= it.ttl) { this.hurt(it); continue; }
      }
      this.place(it);
    }
    if (this.phase !== 'play') return;
    if (this.left <= 0) { this.lose('* ¡Se acabó el tiempo!\n* La copia se rearma con estática...'); return; }
    this.updateBars();
  },

  clearItems() {
    this.items.forEach((it) => it.el.remove());
    this.items = [];
    this.target = null;
  },

  lose(text) {
    this.phase = 'end';
    this.clearItems();
    Sfx.lose();
    Music.stop();
    this.showBox([text, `* ${upper(this.def.name)}: Je. Je. Je.`], () => Game.go('gameover', { enemyId: this.id, back: this.back, scene: 'sombra' }));
  },

  beaten() {
    this.phase = 'end';
    this.clearItems();
    $('.sb-ghost').classList.add('fade');
    Music.stop();
    const box = $('.sb-box');
    box.classList.remove('hidden');
    box.innerHTML = '<div class="tb-text"></div>';
    this.ui = new Dialog($('.tb-text', box), [
      `* La copia se tambalea. La estática se calma.\n* ${upper(this.def.name)}: "${this.def.sad}"`,
      '* (Se ve muy triste. ¿Qué haces?)',
    ], () => {
      this.ui = new ChoicePrompt(box, ['abrazar', 'dejar ir'], (i) => { this.ui = null; this.finish(i === 0); }, { prompt: 'Escribe tu respuesta:' });
    });
  },

  finish(hug) {
    const d = Save.data;
    const s = GCS();
    const minutes = Math.max(this.playT, 1) / 60;
    const wpm = Math.round((this.st.chars / 5) / minutes);
    const typed = this.st.chars + this.st.errors;
    const acc = typed ? Math.round((this.st.chars / typed) * 100) : 100;
    Stats.addBattle({ enemy: this.id, wpm, acc, date: Date.now() });
    const ups = addXp(this.def.xp);
    d.done[this.id] = true;
    const pages = [];
    if (hug) {
      s.sombras[this.id] = 'abrazo';
      d.spared[this.id] = true; // guarda su frase para la batalla final (§10)
      Sfx.spare();
      pages.push('* Abrazas a la sombra aunque pique.', '* ...gracias.', '* (La copia se desvanece. Te dejó una frase guardada en el corazón.)');
    } else {
      if (s.sombras[this.id] !== 'abrazo') s.sombras[this.id] = 'ida';
      pages.push('* La copia se deshace en estática.\n* A lo lejos, alguien suspira.');
    }
    Music.play('victory');
    pages.push(`* Ganaste ${this.def.xp} XP.\n* Velocidad: ${wpm} PPM · Precisión: ${acc}%`);
    if (ups) pages.push(`* ¡SUBISTE A NIVEL ${d.level}!`);
    const hugs = Object.values(s.sombras).filter((x) => x === 'abrazo').length;
    if (hug && hugs >= 4 && Quests.state('cuatro_sombras') !== 'done') {
      if (!d.treasures.figurita_dorada) { d.treasures.figurita_dorada = true; pages.push('* Las cuatro sombras dejaron algo brillante en el piso...\n* Encontraste: FIGURITA DORADA. (Se guardó en tu vitrina.)'); }
      Quests.complete('cuatro_sombras');
    } else if (hug) pages.push(`* (Sombras abrazadas: ${hugs}/4.)`);
    Save.write();
    this.showBox(pages, () => Game.go(this.back));
  },
};
