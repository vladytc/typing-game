// MINIJEFE del Mundo 5: CAPITAN BROTES — "Órdenes de colores" (guiño: Pikmin, 2001). LORE §8.4 A.
//
// Tres escuadrones de Brotitos (ROJO, AZUL, AMARILLO), 10 de cada color. Llegan TAREAS:
//   FUEGO  → solo los ROJOS aguantan el fuego       escribe:  rojo: apagar
//   AGUA   → solo los AZULES saben nadar             escribe:  azul: nadar
//   ALTURA → a los AMARILLOS se les lanza alto       escribe:  amarillo: saltar
// La pantalla solo dice la tarea y el verbo: TÚ decides el color (cambio de contexto).
//   Color equivocado = ese escuadrón pierde 1 Brotito. Si se acaba el tiempo de la orden, también.
//   Cada orden correcta le quita 5 HP al Capitán; cada 6 seguidas, 25 más ("¡se me acaban los brotes!").
//   Con menos de la mitad de HP, las órdenes son de 2 palabras (rojo: apagar fuego).
//   El día dura 90 s. Empieza en el día 29: si termina el día 30 sin ganar (o te quedas sin
//   Brotitos), pierdes. Al terminar el día 29 el Capitán pierde 10 % de HP (está cansado).
//   PAZ: a veces llega una orden dorada (Silbato, Gigante, Nave). Tres = puedes PERDONAR.
// Minijuego BROTITOS (arcade: true): 90 s, récord = órdenes correctas. Turbo agrega MORADO (peso).
// ESC pausa.

const GC_BROTES = { day: 90, perSquad: 10, hitHp: 5, streak: 6, streakHp: 25, peaceEvery: 5 };

Scenes.brotes = {
  music: 'gc_brotes',

  enter({ enemyId = 'capbrotes', back = 'map', arcade = false, turbo = false, menu = true } = {}) {
    document.body.className = 'theme-gc';
    Object.assign(this, { id: enemyId, def: ENEMIES[enemyId], back, arcade, turbo, timers: [], ui: null, phase: 'intro' });
    Game.root.innerHTML = `
      <div class="brotes">
        <canvas class="br-cv" width="640" height="250"></canvas>
        <div class="br-hud">
          <div class="br-day"></div>
          <div class="br-boss"><span class="br-name"></span><div class="bar br-hp"><i></i></div><span class="blabel">PAZ</span><div class="bar br-mercy"><i></i></div></div>
        </div>
        <div class="br-panel">
          <div class="br-legend"></div>
          <div class="br-order"><div class="br-task"></div><div class="br-type"></div><div class="br-timer"><i></i></div></div>
          <div class="br-msg"></div>
        </div>
        <div class="box br-box hidden"></div>
      </div>`;
    this.cv = $('.br-cv');
    this.g = this.cv.getContext('2d');
    this.reset();
    this.render();
    this.loop();
    // Si ya lo venciste, desde el mapa puedes elegir revancha o el minijuego.
    if (!arcade && menu && Save.data.done[enemyId]) { this.modeMenu(); return; }
    this.intro();
  },

  exit() {
    this.timers.forEach(clearTimeout);
    cancelAnimationFrame(this.raf);
    if (this.ui && this.ui.stop) this.ui.stop();
  },

  later(fn, ms) { this.timers.push(setTimeout(fn, ms)); },

  reset() {
    const def = this.def;
    this.squads = def.squads.concat(this.turbo ? [def.squadTurbo] : []).map((s) => ({ ...s, left: GC_BROTES.perSquad, flash: 0 }));
    Object.assign(this, {
      hp: def.hp, mercy: 0, day: 29, t: 0, order: null, buf: '', streak: 0, best: 0, correct: 0, ordersN: 0,
      st: { chars: 0, errors: 0, ms: 0 }, playT: 0, err: false, msgT: 0, launches: [],
    });
  },

  // ---------- Menús y diálogos ----------

  showBox(pages, done) {
    const box = $('.br-box');
    box.classList.remove('hidden');
    box.innerHTML = '<div class="tb-text"></div>';
    this.ui = new Dialog($('.tb-text', box), pages, () => { box.classList.add('hidden'); this.ui = null; done(); });
  },

  menuBox(items, onPick, title = '') {
    const box = $('.br-box');
    box.classList.remove('hidden');
    box.innerHTML = `${title ? `<div class="br-mtitle">${esc(title)}</div>` : ''}<div class="br-menu"></div>`;
    this.phase = 'menu';
    this.ui = new ListMenu($('.br-menu', box), items, { cols: 2, onPick: (i) => { box.classList.add('hidden'); this.ui = null; onPick(i); } });
  },

  modeMenu() {
    const a = Save.data.arcade || {};
    this.menuBox([
      { label: 'Revancha' }, { label: `Brotitos (${a.brotitos || 0})` }, { label: `Turbo (${a.brotitos_turbo || 0})` }, { label: 'Salir' },
    ], (i) => {
      if (i === 3) { Game.go(this.back); return; }
      this.arcade = i > 0;
      this.turbo = i === 2;
      this.reset();
      this.render();
      this.intro();
    }, 'CAPITAN BROTES: ¿Qué hacemos hoy, gigante?');
  },

  intro() {
    this.phase = 'intro';
    const first = !Save.data.done[this.id];
    const legend = this.squads.map((s) => `${s.label} = ${s.task}`).join(' · ');
    const pages = this.arcade ? [
      `* BROTITOS${this.turbo ? ' TURBO' : ''}: 90 segundos. ¡Todas las órdenes que puedas!`,
      `* ${legend}.\n* Escribe el color, dos puntos y la orden: "rojo: apagar".`,
    ] : first ? [
      '* (Un explorador del tamaño de un dedo te apunta con su antena.)',
      '* CAPITAN BROTES: ¡Un GIGANTE! ¡Diez brotitos rojos, a mí!\n* ...Y diez azules. Y diez amarillos.',
      '* CAPITAN BROTES: Tengo 30 días para reparar mi nave.\n* Este es el 29. ¡No me vas a detener!',
      '* BIT: ¡Los Brotitos te obedecen a TI si les hablas bien!\n* ROJO aguanta el FUEGO, AZUL nada en el AGUA y AMARILLO llega a lo ALTO.',
      '* BIT: Solo verás la tarea y el verbo. ¡Tú eliges el color!\n* Escribe: color, dos puntos, espacio y la orden. Ejemplo: "rojo: apagar".',
      '* BIT: Si llega una orden DORADA, escríbela para hacer las paces.\n* (ESC pausa.)',
    ] : ['* CAPITAN BROTES: ¡Otra vez el gigante! ¡Brotitos, en formación!'];
    this.showBox(pages, () => this.countdown());
  },

  countdown() {
    this.phase = 'count';
    ['3', '2', '1', '¡YA!'].forEach((t, i) => this.later(() => { this.say(t, 'big'); if (i < 3) Sfx.move(); else Sfx.confirm(); }, i * 700));
    this.later(() => { this.phase = 'play'; this.say(''); this.nextOrder(); }, 2800);
  },

  say(text, cls = '') {
    const m = $('.br-msg');
    if (!m) return;
    m.textContent = text;
    m.className = `br-msg ${cls}`;
    void m.offsetWidth;
    if (text) m.classList.add('show');
  },

  // ---------- Órdenes ----------

  alive() { return this.squads.filter((s) => s.left > 0); },

  nextOrder() {
    this.ordersN++;
    this.buf = '';
    this.err = false;
    const twoWords = !this.arcade && this.hp < this.def.hp / 2;
    if (!this.arcade && this.mercy < 100 && this.ordersN % GC_BROTES.peaceEvery === 0) {
      const p = this.def.peace[Math.floor(this.mercy / 34) % this.def.peace.length];
      this.order = { peace: true, name: p.name, text: p.text, t: 0, limit: (p.text.length * 420 + 3500) * diff().time };
    } else {
      const sq = rand(this.alive());
      const verb = rand(twoWords ? sq.verbs2 : sq.verbs);
      this.order = { squad: sq, verb, text: `${sq.id}: ${verb}`, t: 0, limit: ((sq.id.length + verb.length) * 380 + 2600) * diff().time };
    }
    this.orderT0 = performance.now();
    this.renderOrder();
  },

  // Lo que se puede escribir para la orden actual: el color correcto... o uno equivocado.
  candidates() {
    const o = this.order;
    if (o.peace) return [{ text: o.text, squad: null }];
    return this.alive().map((s) => ({ text: `${s.id}: ${o.verb}`, squad: s }));
  },

  onKey(e) {
    if (this.ui && this.phase !== 'play') { this.ui.key(e); return; }
    if (this.phase !== 'play') return;
    if (e.key === 'Escape') { this.pause(); return; }
    if (e.key === 'Backspace') { this.buf = this.buf.slice(0, -1); this.renderOrder(); return; }
    if (e.repeat || e.key.length !== 1) return;
    const match = pickMatch({ strict: true });
    const fits = (c, s) => c.length >= s.length && [...s].every((ch, i) => match(c[i], ch));
    const next = this.buf + e.key;
    const live = this.candidates().filter((c) => fits(c.text, next));
    const want = this.candidates().find((c) => c.squad === this.order.squad) || this.candidates()[0];
    if (!live.length) {
      Stats.record(want.text[this.buf.length] || e.key, false);
      this.st.errors++;
      this.err = true;
      Sfx.error();
      this.renderOrder();
      return;
    }
    Stats.record(live[0].text[this.buf.length], true);
    this.st.chars++;
    this.err = false;
    this.buf = next;
    Sfx.key();
    const done = live.find((c) => c.text.length === next.length);
    if (done) this.resolve(done);
    else this.renderOrder();
  },

  resolve(c) {
    const o = this.order;
    this.st.ms += performance.now() - this.orderT0;
    if (o.peace) {
      const was = this.mercy;
      this.mercy = Math.min(100, this.mercy + 34);
      Sfx.mercy();
      this.say(`${upper(o.name)}: PAZ +${this.mercy - was}%`, 'gold');
      this.updateHud();
      if (this.mercy >= 100) { this.offerPeace(); return; }
      this.nextOrder();
      return;
    }
    if (c.squad !== o.squad) {
      // Color equivocado: ese escuadrón no sabe hacer la tarea y se pierde un Brotito.
      this.lose(c.squad, `¡${c.squad.label} NO SABE DE ${o.squad.task}!`);
      this.streak = 0;
      if (this.checkLose()) return;
      this.nextOrder();
      return;
    }
    this.correct++;
    this.streak++;
    this.best = Math.max(this.best, this.streak);
    o.squad.flash = 0.6;
    this.launches.push({ squad: o.squad, t: 0 });
    Sfx.pop();
    if (!this.arcade) {
      this.hp -= GC_BROTES.hitHp;
      if (this.streak % GC_BROTES.streak === 0) {
        this.hp -= GC_BROTES.streakHp;
        Sfx.crit();
        this.say(`¡${this.streak} SEGUIDAS! "¡Se me acaban los brotes!" -${GC_BROTES.streakHp}`, 'gold');
      } else this.say(`¡${o.squad.label}, BIEN! -${GC_BROTES.hitHp}`);
      this.hp = Math.max(0, this.hp);
      this.updateHud();
      if (this.hp <= 0) { this.finish(false); return; }
    } else this.say(`¡${o.squad.label}! ${this.correct}`);
    this.nextOrder();
  },

  lose(sq, text) {
    if (!sq) return;
    sq.left = Math.max(0, sq.left - 1);
    sq.flash = -0.6;
    Sfx.hurt();
    this.say(text, 'bad');
  },

  checkLose() {
    if (this.alive().length) return false;
    this.gameOver('¡Te quedaste sin Brotitos!');
    return true;
  },

  offerPeace() {
    this.phase = 'peace';
    this.order = null;
    this.renderOrder();
    const box = $('.br-box');
    box.classList.remove('hidden');
    box.innerHTML = '<div class="tb-text"></div>';
    this.ui = new Dialog($('.tb-text', box), ['* CAPITAN BROTES: ...¿No eres un gigante malo?\n* Ya no quiere pelear. ¡Escribe PERDONAR!'], () => {
      this.ui = new ChoicePrompt(box, ['perdonar'], () => { this.ui = null; box.classList.add('hidden'); this.finish(true); }, { prompt: 'Escribe:' });
    });
  },

  pause() {
    this.phase = 'paused';
    this.pauseT0 = performance.now();
    const el = document.createElement('div');
    el.className = 'smb-pause gc-pause';
    el.innerHTML = '<div>PAUSA</div><div class="smb-menu"></div>';
    $('.brotes').appendChild(el);
    const resume = () => {
      el.remove();
      this.ui = null;
      this.orderT0 += performance.now() - this.pauseT0; // la pausa no cuenta para la velocidad
      this.phase = 'play';
    };
    this.ui = new ListMenu($('.smb-menu', el), [{ label: 'Seguir' }, { label: 'Salir' }], {
      cols: 2, onPick: (i) => (i === 1 ? Game.go(this.back) : resume()), onCancel: resume,
    });
  },

  // ---------- Bucle ----------

  update(dt) {
    this.squads.forEach((s) => { if (s.flash > 0) s.flash = Math.max(0, s.flash - dt); else if (s.flash < 0) s.flash = Math.min(0, s.flash + dt); });
    this.launches.forEach((l) => { l.t += dt; });
    this.launches = this.launches.filter((l) => l.t < 0.8);
    if (this.phase !== 'play') return;
    this.t += dt;
    this.playT += dt;
    const o = this.order;
    if (o) {
      o.t += dt * 1000;
      const left = 1 - o.t / o.limit;
      const bar = $('.br-timer i');
      if (bar) { bar.style.width = `${Math.max(0, left) * 100}%`; bar.classList.toggle('low', left < 0.25); }
      if (left <= 0) {
        if (o.peace) this.say('La orden dorada se fue volando...');
        else { this.lose(o.squad, `¡${o.squad.label} SE CANSO DE ESPERAR!`); this.streak = 0; }
        this.st.ms += o.limit;
        if (this.checkLose()) return;
        this.nextOrder();
      }
    }
    if (this.t >= GC_BROTES.day) this.endDay();
    this.updateHud();
  },

  endDay() {
    if (this.arcade) { this.finishArcade(); return; }
    if (this.day >= 30) { this.gameOver('Terminó el día 30. La nave del Capitán despegó sin ti...'); return; }
    this.day++;
    this.t = 0;
    const cut = Math.round(this.def.hp * 0.1);
    this.hp = Math.max(1, this.hp - cut);
    Sfx.secret();
    this.say(`TERMINA EL DIA 29. EL CAPITAN ESTA CANSADO: -${cut}`, 'gold');
    this.updateHud();
  },

  loop() {
    let last = performance.now();
    const step = (ts) => {
      const dt = Math.max(0, Math.min(50, ts - last)) / 1000;
      last = ts;
      this.update(dt);
      this.draw(ts / 1000);
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  },

  // ---------- Final ----------

  results() {
    const minutes = Math.max(this.st.ms, 1) / 60000;
    const wpm = Math.round((this.st.chars / 5) / minutes);
    const typed = this.st.chars + this.st.errors;
    const acc = typed ? Math.round((this.st.chars / typed) * 100) : 100;
    return { wpm, acc };
  },

  finish(spared) {
    this.phase = 'end';
    this.order = null;
    this.renderOrder();
    const d = Save.data;
    const { wpm, acc } = this.results();
    Stats.addBattle({ enemy: this.id, wpm, acc, date: Date.now() });
    const ups = addXp(this.def.xp);
    const first = !d.done[this.id];
    d.done[this.id] = true;
    if (spared) d.spared[this.id] = true;
    Quests.start('dia_30');
    Save.write();
    Music.play('victory');
    const pages = spared ? [
      '* CAPITAN BROTES: ...No eres un gigante. Eres... normal.\n* Perdón por mandarte a los brotitos.',
      '* ¡Perdonaste al CAPITAN BROTES!\n* Dice que se mudará a tu pueblo cuando repare su nave.',
    ] : [
      '* CAPITAN BROTES: ¡Se me acabaron los brotes!\n* ¡Retirada! ¡A la nave!',
      '* El Capitán Brotes huyó en su nave... que todavía hace ruidos raros.',
    ];
    pages.push(`* Ganaste ${this.def.xp} XP.\n* Velocidad: ${wpm} PPM · Precisión: ${acc}% · Mejor racha: ${this.best}`);
    if (ups) pages.push(`* ¡SUBISTE A NIVEL ${d.level}!`);
    if (first) pages.push('* BIT: ¡Ahora puedes jugar BROTITOS desde esta parada del mapa!\n* Si logras 40 órdenes, el Capitán te regala algo.');
    this.showBox(pages, () => Game.go(this.back));
  },

  finishArcade() {
    this.phase = 'end';
    this.order = null;
    this.renderOrder();
    const d = Save.data;
    const a = d.arcade || (d.arcade = {});
    const key = this.turbo ? 'brotitos_turbo' : 'brotitos';
    const record = this.correct > (a[key] || 0);
    if (record) a[key] = this.correct;
    const { wpm, acc } = this.results();
    const lines = [`¡SE PUSO EL SOL! ${this.correct} ORDENES CORRECTAS${record ? ' ¡RECORD!' : ''}`, `Mejor racha: ${this.best} · ${wpm} PPM · Precisión: ${acc}%`];
    if (!this.turbo && this.correct >= 40 && Quests.state('dia_30') !== 'done') {
      Quests.start('dia_30');
      if (!d.treasures.silbato_brotes) { d.treasures.silbato_brotes = true; lines.push('CAPITAN: ¡El día 30 fue un éxito! Toma mi SILBATO DE BROTES.'); }
      Quests.complete('dia_30');
    } else if (!this.turbo && this.correct < 40) lines.push(`CAPITAN: Para el día 30 necesito 40 órdenes. ¡Te faltan ${40 - this.correct}!`);
    Save.write();
    Music.play('victory');
    const box = $('.br-box');
    box.classList.remove('hidden');
    box.innerHTML = `${lines.map((l) => `<div class="br-end">${esc(l)}</div>`).join('')}<div class="br-menu"></div>`;
    this.ui = new ListMenu($('.br-menu', box), [{ label: 'Otra vez' }, { label: 'Salir' }], {
      cols: 2,
      onPick: (i) => (i === 0 ? Game.go('brotes', { enemyId: this.id, back: this.back, arcade: true, turbo: this.turbo }) : Game.go(this.back)),
    });
  },

  gameOver(text) {
    this.phase = 'end';
    this.order = null;
    this.renderOrder();
    Sfx.lose();
    Music.stop();
    this.showBox([`* ${text}`, '* CAPITAN BROTES: ¡Ja! ¡El gigante perdió!'], () => Game.go('gameover', { enemyId: this.id, back: this.back, scene: 'brotes' }));
  },

  // ---------- Dibujo ----------

  updateHud() {
    const day = $('.br-day');
    if (!day) return;
    const left = Math.max(0, Math.ceil(GC_BROTES.day - this.t));
    day.textContent = this.arcade ? `BROTITOS${this.turbo ? ' TURBO' : ''} · ${left} s · ${this.correct} ORDENES` : `DIA ${this.day} · ${left} s · RACHA ${this.streak}`;
    $('.br-boss').classList.toggle('hidden', this.arcade);
    $('.br-name').textContent = 'CAPITAN BROTES';
    $('.br-hp i').style.width = `${(this.hp / this.def.hp) * 100}%`;
    $('.br-mercy i').style.width = `${this.mercy}%`;
  },

  render() {
    $('.br-legend').innerHTML = this.squads.map((s) => `<span style="--sq:${s.color}"><b>${s.label}</b> ${s.icon} ${s.task} <i>${s.left}</i></span>`).join('');
    this.updateHud();
    this.renderOrder();
  },

  renderOrder() {
    const task = $('.br-task');
    const type = $('.br-type');
    if (!task) return;
    $('.br-legend').querySelectorAll('i').forEach((el, k) => { el.textContent = this.squads[k] ? this.squads[k].left : ''; });
    const o = this.order;
    $('.br-order').classList.toggle('gold', !!(o && o.peace));
    if (!o) { task.textContent = ''; type.innerHTML = ''; return; }
    task.textContent = o.peace ? `★ ORDEN DORADA: ${upper(o.name)} ★` : `${o.squad.icon} ¡${o.squad.task}! → ${o.verb}`;
    // Lo escrito se muestra; después, el resto de la orden en gris (sin el color: ese lo eliges tú).
    const typed = `<span class="ok">${esc(this.buf)}</span>`;
    const bad = this.err ? 'bad' : '';
    if (!o.peace && !this.buf.includes(':')) {
      type.innerHTML = `${typed}<span class="nx ${bad}">?</span><span class="dim">: ${esc(o.verb)}</span>`;
      return;
    }
    const pick = o.peace ? o : this.candidates().find((c) => c.text.startsWith(`${this.buf.split(':')[0]}:`));
    const rest = pick && pick.text.length > this.buf.length ? pick.text.slice(this.buf.length) : '';
    type.innerHTML = `${typed}<span class="nx ${bad}">${rest ? esc(rest[0]).replace(' ', '&nbsp;') : '&nbsp;'}</span><span class="dim">${esc(rest.slice(1))}</span>`;
  },

  draw(time) {
    const g = this.g;
    const W = 640;
    const H = 250;
    const p = Math.min(1, this.t / GC_BROTES.day);
    // Cielo: mañana azul → tarde naranja → noche índigo.
    const sky = g.createLinearGradient(0, 0, 0, H);
    const top = p < 0.6 ? '#7EC8FF' : p < 0.85 ? '#F28C28' : '#2D2566';
    const bot = p < 0.6 ? '#DDF1FF' : p < 0.85 ? '#F5D547' : '#8E86D9';
    sky.addColorStop(0, top);
    sky.addColorStop(1, bot);
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);
    // Sol que cruza el cielo (la barra del día).
    const sx = 40 + p * (W - 80);
    const sy = 120 - Math.sin(p * Math.PI) * 95;
    g.fillStyle = '#F5D547';
    g.beginPath(); g.arc(sx, sy, 16, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#FFFFFF';
    g.fillRect(sx - 8, sy - 10, 5, 5); // brillo especular
    // Suelo con sombra.
    g.fillStyle = '#3BB54A';
    g.fillRect(0, 180, W, 70);
    g.fillStyle = '#2E8E3A';
    for (let x = 0; x < W; x += 24) g.fillRect(x + ((x / 24) % 2) * 8, 196, 10, 3);
    const n = this.squads.length;
    const zoneW = (W - 140) / n;
    this.squads.forEach((s, k) => {
      const zx = 20 + k * zoneW;
      this.drawTask(g, s, zx + zoneW / 2, 150, time);
      // Escuadrón: 10 Brotitos en dos filas.
      for (let i = 0; i < GC_BROTES.perSquad; i++) {
        const alive = i < s.left;
        const bx = zx + 14 + (i % 5) * ((zoneW - 28) / 5);
        const by = 205 + Math.floor(i / 5) * 20 + (alive ? Math.abs(Math.sin(time * 5 + i + k)) * -3 : 0);
        this.drawBrotito(g, bx, by, s.color, alive, s.id === 'amarillo');
      }
      if (s.flash) {
        g.fillStyle = s.flash > 0 ? 'rgba(255,255,255,0.35)' : 'rgba(224,75,75,0.35)';
        g.fillRect(zx + 4, 196, zoneW - 8, 48);
      }
    });
    // Brotitos lanzados a su tarea.
    this.launches.forEach((l) => {
      const k = this.squads.indexOf(l.squad);
      const zx = 20 + k * zoneW + zoneW / 2;
      this.drawBrotito(g, zx, 205 - Math.sin((l.t / 0.8) * Math.PI) * 70, l.squad.color, true, l.squad.id === 'amarillo');
    });
    if (!this.arcade) this.drawCaptain(g, W - 70, 190, time);
  },

  drawTask(g, s, x, y, t) {
    if (s.id === 'rojo') { // fogata
      g.fillStyle = '#8B5E3C'; g.fillRect(x - 22, y + 18, 44, 8);
      [['#E04B4B', 20, 34], ['#F28C28', 14, 26], ['#F5D547', 8, 16]].forEach(([c, w, h]) => {
        g.fillStyle = c;
        const f = Math.sin(t * 12 + w) * 3;
        g.beginPath(); g.moveTo(x - w, y + 18); g.lineTo(x + f, y + 18 - h); g.lineTo(x + w, y + 18); g.fill();
      });
    } else if (s.id === 'azul') { // estanque
      g.fillStyle = '#2B9EDB'; g.beginPath(); g.ellipse(x, y + 20, 42, 12, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#FFFFFF'; g.fillRect(x - 20 + Math.sin(t * 2) * 6, y + 16, 12, 2); g.fillRect(x + 8 - Math.sin(t * 2) * 6, y + 22, 8, 2);
    } else if (s.id === 'amarillo') { // risco
      g.fillStyle = '#8E86D9'; g.beginPath(); g.moveTo(x - 30, y + 26); g.lineTo(x - 10, y - 40); g.lineTo(x + 18, y - 34); g.lineTo(x + 32, y + 26); g.fill();
      g.fillStyle = '#C8CBD6'; g.fillRect(x - 10, y - 40, 28, 5);
    } else { // piedra pesada
      g.fillStyle = '#8B8B9C'; g.beginPath(); g.ellipse(x, y + 10, 28, 18, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#C8CBD6'; g.fillRect(x - 14, y, 8, 4);
    }
    g.fillStyle = '#17162B';
    g.font = '8px "Press Start 2P", monospace';
    g.textAlign = 'center';
    g.fillText(s.task, x, y + 42);
  },

  drawBrotito(g, x, y, color, alive, flower) {
    if (!alive) { g.fillStyle = 'rgba(23,22,43,0.25)'; g.fillRect(x - 3, y + 6, 6, 3); return; }
    g.fillStyle = 'rgba(23,22,43,0.3)'; g.fillRect(x - 4, y + 9, 8, 2);   // sombra
    g.fillStyle = '#3BB54A'; g.fillRect(x, y - 10, 1, 6);                  // tallo
    g.fillStyle = flower ? '#FFFFFF' : '#3BB54A'; g.fillRect(x - 2, y - 12, 5, 3);
    g.fillStyle = '#17162B'; g.fillRect(x - 4, y - 5, 9, 14);              // contorno
    g.fillStyle = color; g.fillRect(x - 3, y - 4, 7, 12);
    g.fillStyle = '#FFFFFF'; g.fillRect(x - 2, y - 2, 2, 2); g.fillRect(x + 1, y - 2, 2, 2);
    g.fillRect(x + 2, y - 4, 1, 1);                                         // brillito de plástico
  },

  drawCaptain(g, x, y, t) {
    const b = Math.sin(t * 3) * 2;
    g.fillStyle = 'rgba(23,22,43,0.3)'; g.fillRect(x - 14, y + 24, 28, 4);
    g.fillStyle = '#17162B'; g.fillRect(x - 13, y - 2 + b, 26, 26);
    g.fillStyle = '#F28C28'; g.fillRect(x - 11, y + b, 22, 22);            // traje
    g.fillStyle = '#F2C6A0'; g.fillRect(x - 8, y - 18 + b, 16, 14);          // cara
    g.fillStyle = '#E04B4B'; g.fillRect(x - 2, y - 12 + b, 4, 4);            // nariz
    g.fillStyle = '#17162B'; g.fillRect(x - 6, y - 14 + b, 2, 2); g.fillRect(x + 4, y - 14 + b, 2, 2);
    g.strokeStyle = '#7EC8FF'; g.lineWidth = 2; g.beginPath(); g.arc(x, y - 11 + b, 12, Math.PI, 0); g.stroke(); // casco
    g.fillStyle = '#FFFFFF'; g.fillRect(x + 4, y - 22 + b, 3, 3);
    g.fillStyle = '#17162B'; g.fillRect(x, y - 34 + b, 1, 12);              // antena
    g.fillStyle = Math.floor(t * 3) % 2 ? '#F5D547' : '#E04B4B'; g.fillRect(x - 2, y - 38 + b, 5, 5);
  },
};
