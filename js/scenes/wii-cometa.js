// CAPITAN COMETA — jefe de la Ciudad Sensor (guiño a Super Mario Galaxy, 2007). LORE.md §9.5.
// Es el combate normal (js/scenes/battle.js, con la envoltura de wii-battle.js) con estas reglas:
//   1. Gravedad de planetitas: en su turno, las palabras caen desde los 4 LADOS hacia un planeta
//      chiquito en el centro. Lento en la orilla, rápido cerca del planeta (¡aceleran!).
//   2. Cambio de gravedad: cada 2 turnos el Capitán gira el planeta y tu siguiente LUCHAR sale
//      DE CABEZA o EN ESPEJO (solo se ve así; se escribe normal). ACTUAR > Estabilizar lo evita.
//   3. Estrellitas: 7 orbitan al Capitán. Cada palabra PERFECTA en LUCHAR rescata una (la lluvia
//      baja 5 % por cada una). Con las 7: "...Ya tienes mi gravedad. Úsala."
//   4. Caída libre (fase final, una vez): 40 palabras seguidas mientras el cielo gira.
//      Cada 10 palabras sin error = 30 de daño; un error reinicia la cuenta (no quita HP).
// La música se invierte mientras la gravedad está al revés (pista wii_cometa_rev).

// Las palabras caen hacia el planeta desde arriba, la derecha, abajo y la izquierda.
class WiiGravityDodge extends Dodge {
  start() {
    super.start();
    this.field.classList.add('gravity');
    $('.dodge-label', this.box).textContent = '¡Todo cae hacia el planeta!';
    const ground = $('.ground', this.box);
    if (ground) ground.remove();
    const heart = $('.heart', this.box);
    if (heart) heart.remove();
    const planet = document.createElement('div');
    planet.className = 'cm-planet';
    planet.innerHTML = '<span>♥</span>';
    this.field.appendChild(planet);
    this.heart = planet; // el planeta parpadea cuando lo tocan
    this.H = this.field.clientHeight;
    this.cx = this.W / 2;
    this.cy = this.H / 2;
    this.side = Math.floor(Math.random() * 4);
  }

  spawn() {
    const b = { text: rand(this.cfg.pool), pos: 0, r: 1, y: 0 };
    b.el = document.createElement('div');
    b.el.className = 'bullet grav';
    this.field.appendChild(b.el);
    this.renderBullet(b);
    b.w = b.el.offsetWidth || 60;
    b.h = b.el.offsetHeight || 30;
    const side = this.side++ % 4;
    const W = this.W || 600;
    const H = this.H || 180;
    const along = 0.2 + Math.random() * 0.6;
    // Punto de salida (centro de la palabra) en la orilla de la caja.
    if (side === 0) { b.sx = W * along; b.sy = b.h / 2 + 2; }
    else if (side === 1) { b.sx = W - b.w / 2 - 4; b.sy = H * along; }
    else if (side === 2) { b.sx = W * along; b.sy = H - b.h / 2 - 2; }
    else { b.sx = b.w / 2 + 4; b.sy = H * along; }
    b.el.classList.add(['from-top', 'from-right', 'from-bottom', 'from-left'][side]);
    const len = Math.hypot(b.sx - this.cx, b.sy - this.cy) || 1;
    b.hitR = Math.min(0.9, (24 + Math.min(b.w, b.h) / 2) / len); // toca el planeta
    this.place(b);
    this.bullets.push(b);
    this.spawned++;
  }

  place(b) {
    const x = this.cx + (b.sx - this.cx) * b.r - b.w / 2;
    const y = this.cy + (b.sy - this.cy) * b.r - b.h / 2;
    b.el.style.transform = `translate(${x}px, ${y}px)`;
  }

  loop = (ts) => {
    if (!this.active) return;
    const dt = Math.max(0, Math.min(50, ts - this.last)) / 1000;
    this.last = ts;
    this.elapsed += dt * 1000;
    if (this.spawned < this.cfg.count && this.elapsed >= this.nextSpawn) {
      this.spawn();
      this.nextSpawn += this.cfg.interval / diff().speed;
    }
    for (const b of [...this.bullets]) {
      // Gravedad: más rápido mientras más cerca del planeta.
      b.r -= this.cfg.speed * diff().speed * (0.45 + 1.3 * (1 - b.r)) * dt;
      b.y = 1 - b.r; // para apuntar a la que va más cerca
      this.place(b);
      if (b.r <= b.hitR) this.land(b);
    }
    if (!this.active) return;
    if (this.spawned >= this.cfg.count && !this.bullets.length) { this.end(); return; }
    this.raf = requestAnimationFrame(this.loop);
  };
}

// Caída libre: un párrafo de 40 palabras; se ven de 10 en 10 (un bloque por cada 30 de daño).
class WiiFallTask extends TypingTask {
  render(err = false) {
    const all = this.texts;
    const start = Math.floor(Math.min(this.i, all.length - 1) / 10) * 10;
    const keep = this.texts;
    const offI = this.i;
    // Se dibuja solo el bloque actual con el mismo render de TypingTask.
    this.texts = all.slice(start, start + 10);
    this.i = offI - start;
    super.render(err);
    this.texts = keep;
    this.i = offI;
    this.wordsEl.insertAdjacentHTML('afterbegin', `<span class="cm-block">BLOQUE ${Math.floor(start / 10) + 1}/${Math.ceil(all.length / 10)}</span> `);
  }
}

const COMETA_STARS = 7;

Scenes.cometa = Object.create(Scenes.battle);
Object.assign(Scenes.cometa, {
  enter(params) {
    Object.assign(this, { stars: 0, turns: 0, gravity: null, gravNow: null, finalReady: false, finalSaid: false, finalDone: false, streak: 0, starMeshes: null });
    Scenes.battle.enter.call(this, params);
    const battle = $('.battle');
    battle.classList.add('cometa');
    // Cielo con estrellas detrás de todo.
    const sky = document.createElement('canvas');
    sky.className = 'cm-sky';
    sky.width = 640;
    sky.height = 480;
    battle.insertBefore(sky, battle.firstChild);
    const hud = document.createElement('div');
    hud.className = 'cm-stars';
    battle.appendChild(hud);
    this.renderStars();
    Quests.start('wii_estrellitas');
    const g = sky.getContext('2d');
    const dots = Array.from({ length: 90 }, () => ({ x: Math.random() * 640 - 320, y: Math.random() * 480 - 240, s: Math.random() * 2 + 0.5, ph: Math.random() * 6 }));
    let spin = 0;
    const step = (ts) => {
      if (g) {
        g.fillStyle = WIIC.space;
        g.fillRect(0, 0, 640, 480);
        if (this.freefall) spin += 0.004;
        g.save();
        g.translate(320, 200);
        g.rotate(spin);
        dots.forEach((d) => {
          g.globalAlpha = 0.45 + Math.sin(ts / 400 + d.ph) * 0.35;
          g.fillStyle = d.s > 2 ? WIIC.yellow : WIIC.white;
          g.fillRect(d.x, d.y, d.s, d.s);
        });
        g.globalAlpha = 1;
        g.restore();
      }
      this.updateStars3d(ts / 1000);
      this.skyRaf = requestAnimationFrame(step);
    };
    this.skyRaf = requestAnimationFrame(step);
  },

  exit() {
    cancelAnimationFrame(this.skyRaf);
    Scenes.battle.exit.call(this);
    this.starMeshes = null;
  },

  // ---------- Estrellitas ----------

  renderStars() {
    const el = $('.cm-stars');
    if (el) el.innerHTML = `ESTRELLITAS <b>${'★'.repeat(this.stars)}</b>${'☆'.repeat(COMETA_STARS - this.stars)}`;
  },

  // Cada PERFECTO en LUCHAR rescata una (lo llama fightUnit del enemigo, en js/worlds/wii.js).
  rescueStar() {
    if (this.stars >= COMETA_STARS) return;
    this.stars++;
    Sfx.coin();
    this.floatText(`★ ${this.stars}/${COMETA_STARS}`, 'mercy');
    this.renderStars();
    if (this.stars >= COMETA_STARS) this.finalReady = true;
  },

  // Las estrellitas en 3D (si hay three.js): orbitan al Capitán; las rescatadas vuelan hacia ti.
  updateStars3d(t) {
    const v = this.vwii;
    if (!v) return;
    if (!this.starMeshes) {
      this.starMeshes = [];
      const colors = [WIIC.yellow, WIIC.pink, WIIC.sky, WIIC.green, WIIC.orange, WIIC.purple, WIIC.white];
      for (let i = 0; i < COMETA_STARS; i++) {
        const s = WiiPoly.models.star(v, colors[i], 0.28, true);
        v.scene.add(s);
        this.starMeshes.push({ m: s, gone: 0 });
      }
    }
    this.starMeshes.forEach((s, i) => {
      if (i < this.stars) s.gone = Math.min(1, s.gone + 0.02);
      const a = t * 0.9 + (i / COMETA_STARS) * Math.PI * 2;
      const x = Math.cos(a) * 2.6;
      const z = Math.sin(a) * 1.2;
      const y = 0.8 + Math.sin(a * 2) * 0.3;
      // Rescatada: se va hacia la izquierda (de tu lado) y se hace chiquita.
      s.m.position.set(x + (-6 - x) * s.gone, y + (-1 - y) * s.gone, z);
      s.m.scale.setScalar(1 - s.gone * 0.7);
      s.m.rotation.y = t * 2 + i;
      s.m.visible = s.gone < 1;
    });
  },

  // ---------- LUCHAR ----------

  fight() {
    if (this.finalReady && !this.finalDone) { this.freeFall(); return; }
    const grav = this.gravity;
    this.gravity = null;
    this.gravNow = grav;
    if (grav) {
      $('.battle').classList.add(`grav-${grav}`);
      Music.play('wii_cometa_rev');
      this.floatText(grav === 'flip' ? '¡DE CABEZA!' : '¡EN ESPEJO!', 'crit');
    }
    Scenes.battle.fight.call(this);
  },

  freeFall() {
    this.finalDone = true;
    this.freefall = true;
    this.streak = 0;
    $('.battle').classList.add('freefall');
    const pool = this.def.fallWords || this.def.words;
    const texts = [];
    while (texts.length < 40) texts.push(...pickWords(pool, Math.min(pool.length, 40 - texts.length)));
    let dealt = 0;
    this.runTask({
      label: 'CAIDA LIBRE: 10 palabras sin error = 30 de daño',
      texts,
      timeLimit: texts.join(' ').length * 520 + 6000,
      onUnit: (unit) => {
        if (unit.errors === 0) this.streak++; else { this.streak = 0; this.floatText('cuenta: 0', ''); }
        if (unit.errors === 0) this.st.perfect++;
        if (this.streak >= 10) {
          this.streak = 0;
          dealt += 30;
          this.e.hp = Math.max(0, this.e.hp - 30);
          Sfx.crit();
          this.floatText('¡10 SEGUIDAS! -30', 'crit');
          this.shake('.esprite');
          this.updateBars();
        }
        return this.e.hp > 0;
      },
      onDone: (res) => {
        this.freefall = false;
        $('.battle').classList.remove('freefall');
        if (this.e.hp <= 0) { this.later(() => this.win(false), 700); return; }
        this.say([dealt ? `* ¡CAIDA LIBRE! Hiciste ${dealt} de daño.` : '* La caída libre se acabó... sin bloques completos.',
          '* CAPITAN COMETA: La órbita casi está estable.\n* ¡Un poco más!'], () => this.enemyTurn());
      },
    }, WiiFallTask);
  },

  // ---------- ACTUAR ----------

  actMenu() {
    const acts = this.def.acts.filter((a) => (!a.needStars || this.stars >= a.needStars));
    this.subMenu([{ label: 'Revisar' }, ...acts.map((a) => ({ label: a.name }))], (i) => {
      if (i === 0) { this.say([this.def.check], () => this.toMenu()); return; }
      const a = acts[i - 1];
      if (a.name === 'Estabilizar') this.gravity = null;
      if (a.costStar) { this.stars = Math.max(0, this.stars - 1); this.finalReady = this.stars >= COMETA_STARS; this.renderStars(); }
      this.act(a);
    });
  },

  // ---------- Turno del Capitán ----------

  enemyTurn() {
    const battle = $('.battle');
    if (battle) battle.classList.remove('grav-flip', 'grav-mirror');
    if (this.gravNow) { this.gravNow = null; Music.play(this.finalSaid ? 'wii_cometa2' : 'wii_cometa'); }
    const pages = [];
    if (this.finalReady && !this.finalSaid) {
      this.finalSaid = true;
      Music.play('wii_cometa2');
      Quests.complete('wii_estrellitas');
      pages.push('* Las 7 estrellitas brillan a tu alrededor.',
        '* CAPITAN COMETA: ...Ya tienes mi gravedad. Úsala.',
        '* (Tu siguiente LUCHAR será la CAIDA LIBRE: 40 palabras seguidas.)');
    }
    this.turns++;
    if (this.turns % 2 === 0 && !this.finalDone && this.e.hp > 0) {
      this.gravity = Math.random() < 0.5 ? 'flip' : 'mirror';
      pages.push(`* ¡El Capitán gira el planeta!\n* Tu próximo LUCHAR saldrá ${this.gravity === 'flip' ? 'DE CABEZA' : 'EN ESPEJO'}. (ACTUAR > Estabilizar lo evita.)`);
    }
    if (pages.length) { this.say(pages, () => Scenes.battle.enemyTurn.call(this)); return; }
    Scenes.battle.enemyTurn.call(this);
  },

  startDodge() {
    this.phase = 'dodge';
    const def = this.def;
    const slow = 1 - 0.05 * this.stars; // cada estrellita rescatada frena la lluvia 5 %
    this.dodge = new WiiGravityDodge(this.box, { strict: this.strict, ...def.bullets, speed: def.bullets.speed * slow }, {
      onHit: () => {
        this.p.hp = Math.max(0, this.p.hp - scaledDmg(def.atk));
        this.updateBars();
        this.shake('.pinfo');
        if (this.p.hp <= 0) {
          this.dodge.stop();
          this.phase = 'busy';
          this.later(() => { Sfx.lose(); Game.go('gameover', { enemyId: this.id, back: this.back, scene: 'cometa' }); }, 600);
        }
      },
      onDone: (res) => {
        this.st.chars += res.chars;
        this.st.errors += res.errors;
        this.toMenu();
      },
    });
    this.dodge.start();
  },

  win(spared) {
    cancelAnimationFrame(this.skyRaf);
    Scenes.battle.win.call(this, spared);
  },
});
