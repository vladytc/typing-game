// JEFE del Mundo 5: EL GUANTE CROSSOVER (guiño: Super Smash Bros. Melee, 2001). LORE §8.5.
// Es la batalla normal (js/scenes/battle.js) cambiada a reglas de "torneo":
//   - No hay HP: hay PORCENTAJE. Cada palabra bien escrita le sube el % (como el daño normal).
//   - Con 100 % o más, LUCHAR se vuelve SMASH: una frase larga con mayúsculas y puntuación que hay
//     que escribir PERFECTA (sin un solo error) en 12 s (más si es muy larga). Si sale: 1 CAIDA.
//     Si fallas: su % baja a 60. Tres caídas y ganas.
//   - Tu HP también es %: cada golpe te sube el %. Si tienes 100 % o más y te pegan otra vez, sales
//     volando: escribe RECUPERAR rapidísimo para volver al borde (tu % baja a 50). Si no, pierdes
//     una de tus 3 VIDAS. Sin vidas = GAME OVER.
//   - En su turno, los golpes llegan de los LADOS (puñetazos) y de ARRIBA.
//   - FIGURITAS: cada 2 turnos tira la figurita de un jefe anterior y ese turno usa SU lluvia:
//     bloques (Tetro Rey), bolas de fuego (Lord Caparazón), medusitas (Reina Nébula) o pinceladas
//     (Marco). La música cambia el timbre a la era de esa figurita.
//   - PAZ: Chocar, Figuras y (en la 3ª fase, cuando atrapa a Bit) Suelta.
// Al ganar se rescata la GameCube y aparece el Glitch con su pantalla de NOMBRE vacía.

const GC_GUANTE = { pctGain: 1.15, hitPct: 2, recoverMs: 3000, lives: 3, falls: 3, smashMs: 12000 };
const GC_GUANTE_FIGS = ['tetro', 'caparazon', 'nebula', 'marco'];
const GC_GUANTE_FIG_NAMES = { tetro: 'TETRO REY', caparazon: 'LORD CAPARAZON', nebula: 'REINA NEBULA', marco: 'MARCO' };
const GC_GUANTE_FIG_POOLS = {
  tetro: ['Bloque', 'Fila', 'Pieza', 'Gira', 'Cae', 'Línea'],
  caparazon: ['Fuego', 'Bola', 'Lava', 'Zas', 'Uf'],
  nebula: ['Medusa', 'Burbuja', 'Ola', 'Órbita', 'Hondo'],
  marco: ['Pincel', 'Óleo', 'Trazo', 'Color', 'Lienzo'],
};

// Lluvia del Guante: como Dodge (js/typing.js), pero los golpes viajan hacia el corazón desde los
// lados, desde arriba, desde abajo o en diagonal, según el estilo.
class GCPunch {
  constructor(box, cfg, { onHit, onDone }) {
    Object.assign(this, { box, cfg, onHit, onDone });
    this.match = pickMatch({ caps: cfg.caps, strict: strictOn(cfg.strict) });
  }

  start() {
    this.box.innerHTML = `
      <div class="dodge gc-punch style-${this.cfg.style}">
        <div class="dodge-label">${esc(this.cfg.label || '¡Escribe los golpes antes de que te alcancen!')}</div>
        <div class="heart">♥</div>
      </div>`;
    this.field = $('.gc-punch', this.box);
    this.heart = $('.heart', this.box);
    this.W = this.field.clientWidth || 576;
    this.H = this.field.clientHeight || 150;
    this.cx = this.W / 2;
    this.cy = this.H / 2 + 8;
    Object.assign(this, { bullets: [], spawned: 0, target: null, chars: 0, errors: 0, active: true, elapsed: 0, nextSpawn: 300 });
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  // Desde dónde sale cada golpe y qué tan rápido viaja (px/s).
  origin(w) {
    const st = this.cfg.style;
    const side = Math.random() < 0.5 ? -1 : 1;
    const sideX = side < 0 ? -w : this.W;
    const pick = st === 'mix' ? (Math.random() < 0.65 ? 'side' : 'top') : st;
    if (pick === 'side' || st === 'caparazon') return { x: sideX, y: this.cy - 10 + (Math.random() - 0.5) * 40, v: st === 'caparazon' ? 95 : 82 };
    if (pick === 'top' || st === 'tetro') {
      const col = Math.floor(Math.random() * 6);
      return { x: 10 + col * ((this.W - 20) / 6), y: -24, v: st === 'tetro' ? 44 : 40 };
    }
    if (st === 'nebula') return { x: 20 + Math.random() * (this.W - w - 40), y: this.H, v: 38, wobble: true };
    return { x: side < 0 ? -w : this.W, y: Math.random() < 0.5 ? -20 : this.H, v: 72 }; // marco: diagonal
  }

  loop = (ts) => {
    if (!this.active) return;
    const dt = this.paused ? 0 : Math.max(0, Math.min(50, ts - this.last)) / 1000;
    this.last = ts;
    this.elapsed += dt * 1000;
    if (this.spawned < this.cfg.count && this.elapsed >= this.nextSpawn) {
      this.spawn();
      this.nextSpawn += this.cfg.interval / diff().speed;
    }
    for (const b of [...this.bullets]) {
      b.t += dt;
      const dx = this.cx - (b.x + b.w / 2);
      const dy = this.cy - (b.y + b.h / 2);
      const dist = Math.hypot(dx, dy);
      if (dist < 16) { this.land(b); if (!this.active) return; continue; }
      const sp = b.v * diff().speed * dt;
      b.x += (dx / dist) * sp;
      b.y += (dy / dist) * sp;
      const wob = b.wobble ? Math.sin(b.t * 3) * 14 : 0;
      b.el.style.transform = `translate(${Math.round(b.x + wob)}px, ${Math.round(b.y)}px)${b.rot ? ` rotate(${Math.sin(b.t * 2) * 25}deg)` : ''}`;
    }
    if (!this.active) return;
    if (this.spawned >= this.cfg.count && !this.bullets.length) { this.end(); return; }
    this.raf = requestAnimationFrame(this.loop);
  };

  spawn() {
    const b = { text: rand(this.cfg.pool), pos: 0, t: 0 };
    b.el = document.createElement('div');
    b.el.className = 'bullet';
    this.field.appendChild(b.el);
    this.renderBullet(b);
    b.w = b.el.offsetWidth || b.text.length * 12 + 12;
    b.h = b.el.offsetHeight || 22;
    Object.assign(b, this.origin(b.w));
    b.rot = this.cfg.style === 'marco';
    b.el.style.transform = `translate(${Math.round(b.x)}px, ${Math.round(b.y)}px)`;
    this.bullets.push(b);
    this.spawned++;
  }

  renderBullet(b) { b.el.innerHTML = `<span class="t">${esc(b.text.slice(0, b.pos))}</span>${esc(b.text.slice(b.pos))}`; }

  removeBullet(b) {
    this.bullets = this.bullets.filter((x) => x !== b);
    if (this.target === b) this.target = null;
  }

  land(b) {
    if (!this.active) return;
    this.removeBullet(b);
    b.el.remove();
    Sfx.hurt();
    this.heart.classList.remove('hurt');
    void this.heart.offsetWidth;
    this.heart.classList.add('hurt');
    this.onHit();
  }

  key(e) {
    if (!this.active || this.paused || e.repeat || e.key.length !== 1 || e.key === ' ') return;
    let b = this.target;
    if (b) {
      const want = b.text[b.pos];
      if (!this.match(want, e.key)) { Stats.record(want, false); this.errors++; Sfx.error(); return; }
      Stats.record(want, true);
    } else {
      const opts = this.bullets.filter((x) => this.match(x.text[0], e.key));
      if (!opts.length) { this.errors++; Sfx.error(); return; }
      const d = (x) => Math.hypot(this.cx - x.x, this.cy - x.y);
      b = opts.reduce((a, x) => (d(x) < d(a) ? x : a));
      Stats.record(b.text[0], true);
    }
    this.chars++;
    b.pos++;
    if (b.pos >= b.text.length) {
      this.removeBullet(b);
      Sfx.pop();
      b.el.classList.add('pop');
      setTimeout(() => b.el.remove(), 250);
      return;
    }
    Sfx.key();
    this.target = b;
    b.el.classList.add('target');
    this.renderBullet(b);
  }

  end() {
    this.active = false;
    this.onDone({ chars: this.chars, errors: this.errors });
  }

  stop() {
    this.active = false;
    cancelAnimationFrame(this.raf);
  }
}

Scenes.guante = Object.assign(Object.create(Scenes.battle), {
  enter(params) {
    Scenes.battle.enter.call(this, params);
    const def = this.def;
    this.allActs = def.acts;
    this.def = { ...def, acts: def.acts.filter((a) => !a.phase3), onWin: (s, info) => this.onWinPages(info) };
    this.e = { hp: 1, pct: 0, falls: 0, mercy: 0 };
    this.p = { hp: 1, max: 1, pct: 0, lives: GC_GUANTE.lives };
    this.turnN = 0;
    this.bitHeld = false;
    $('.battle').classList.add('gc', 'guante');
    $('.enemy-info').innerHTML = `
      <span class="ename">${esc(this.NAME)}</span>
      <span class="g-pct">0%</span><span class="g-stock"></span>
      <span class="blabel">PAZ</span><div class="bar emercy"><i></i></div>`;
    $('.php').innerHTML = '<span class="g-ppct">0%</span><span class="g-lives"></span>';
    const arena = document.createElement('div');
    arena.className = 'g-arena';
    $('.battle').insertBefore(arena, $('.battle').firstChild);
    this.updateBars();
    this.dialog.stop();
    const first = !Save.data.done[this.id];
    const pages = first ? [
      def.intro,
      '* EL GUANTE: Mira mi colección. Tetro Rey, Lord Caparazón, Reina Nébula, Marco...\n* Figuritas. Todas mías. Hechas de estática.',
      '* BIT: ¡Aquí no hay HP! Cada palabra le sube el PORCENTAJE.\n* Cuando pase de 100%, ¡dale un SMASH con una frase PERFECTA!',
      '* BIT: Tú también tienes porcentaje. Si pasas de 100% y te pegan... ¡sales volando!\n* Escribe RECUPERAR rapidísimo para volver al borde. Tienes 3 vidas.',
    ] : [def.intro];
    this.say(pages, () => this.toMenu());
    this.build3d();
  },

  cleanup() {
    Scenes.battle.cleanup.call(this);
    if (this.punch) this.punch.stop();
  },

  exit() {
    Scenes.battle.exit.call(this);
    this.gtok = null;
    if (this.v) { this.v.dispose(); this.v = null; }
  },

  // ---------- Interfaz ----------

  updateBars() {
    const e = this.e || {};
    const p = this.p || {};
    const pct = $('.g-pct');
    if (!pct) return; // todavía se está armando la pantalla
    pct.textContent = `${Math.round(e.pct || 0)}%`;
    pct.className = `g-pct ${e.pct >= 100 ? 'hot' : e.pct >= 60 ? 'warm' : ''}`;
    $('.g-stock').textContent = '●'.repeat(Math.max(0, GC_GUANTE.falls - (e.falls || 0))) + '○'.repeat(e.falls || 0);
    $('.emercy i').style.width = `${e.mercy || 0}%`;
    $('.ename').classList.toggle('spareable', e.mercy >= 100);
    const pp = $('.g-ppct');
    pp.textContent = `${Math.round(p.pct || 0)}%`;
    pp.className = `g-ppct ${p.pct >= 100 ? 'hot' : p.pct >= 60 ? 'warm' : ''}`;
    $('.g-lives').textContent = '♥'.repeat(Math.max(0, p.lives || 0));
    const cmd = document.querySelector('.cmd[data-i="0"]');
    if (cmd) cmd.textContent = e.pct >= 100 ? 'SMASH' : 'LUCHAR';
  },

  toMenu() {
    Scenes.battle.toMenu.call(this);
    if (this.e.pct >= 100 && this.e.mercy < 100) {
      this.dialog.stop();
      this.dialog = new Dialog($('.tb-text', this.box), ['* ¡El Guante está en más de 100%!\n* ¡Elige SMASH para mandarlo a volar!'], null, { wait: false });
    }
  },

  // ---------- LUCHAR / SMASH ----------

  fight() {
    if (this.e.pct >= 100) { this.smash(); return; }
    const words = pickWords(this.def.words, this.def.fightWords);
    const total = words.join('').length;
    this.runTask({
      label: '¡LUCHAR! Cada palabra le sube el porcentaje:',
      texts: words,
      timeLimit: total * 560 + 2500,
      onUnit: (unit) => {
        const { dmg, perfect } = this.damageFor(unit);
        const gain = Math.round(dmg * GC_GUANTE.pctGain);
        if (perfect) this.st.perfect++;
        this.e.pct = Math.min(999, this.e.pct + gain);
        perfect ? Sfx.crit() : Sfx.hit();
        this.floatText(perfect ? `¡PERFECTO! +${gain}%` : `+${gain}%`, perfect ? 'crit' : '');
        this.shake('.esprite');
        this.knock(0.3);
        this.updateBars();
        return true;
      },
      onDone: () => {
        const pages = [`* ¡El Guante ya va en ${Math.round(this.e.pct)}%!`];
        if (this.e.pct >= 100) pages.push('* ¡¡PASO DE 100%!!\n* En tu siguiente turno, elige SMASH.');
        this.say(pages, () => this.enemyTurn());
      },
    });
  },

  smash() {
    this.smashing = true;
    const phrase = pickWords(this.def.smash, 1)[0];
    [0, 90, 180, 270, 360].forEach((ms) => this.later(() => Sfx.bump(), ms)); // redoble
    this.runTask({
      label: '¡GOLPE SMASH! Escríbela PERFECTA (un error y falla):',
      texts: [phrase],
      timeLimit: Math.max(GC_GUANTE.smashMs, phrase.length * 300 + 3000), // 12 s o más si la frase es larga
      onDone: (res) => {
        this.smashing = false;
        if (res.completed && res.errors === 0) this.smashHit(); else this.smashFail(res.completed ? 'error' : 'tiempo');
      },
    });
  },

  // Un error en el SMASH lo cancela al instante (tiene que ser PERFECTA).
  onKey(e) {
    if (this.phase === 'typing' && this.smashing) {
      this.task.key(e);
      if (this.task.errors > 0 && !this.task.done) {
        this.st.chars += this.task.chars;
        this.st.errors += this.task.errors;
        this.st.ms += performance.now() - (this.task.t0 || performance.now());
        this.task.stop();
        this.smashing = false;
        this.smashFail('error');
      }
      return;
    }
    if (this.phase === 'punch') {
      if (this.pauseUi) { this.pauseUi.key(e); return; }
      if (e.key === 'Escape') { this.pausePunch(); return; }
      this.punch.key(e);
      return;
    }
    if (this.phase === 'recover') { this.task.key(e); return; }
    Scenes.battle.onKey.call(this, e);
  },

  smashHit() {
    this.e.falls++;
    this.e.pct = 0;
    Sfx.firework();
    this.later(() => Sfx.crit(), 150);
    this.floatText('¡¡SMASH!!', 'crit');
    this.fly();
    this.updateBars();
    if (this.e.falls >= GC_GUANTE.falls) {
      this.phase = 'busy';
      this.later(() => this.win(false), 1400);
      return;
    }
    const pages = [`* ¡¡SMASH!! El Guante sale volando fuera de la plataforma...\n* ¡CAIDA ${this.e.falls}/${GC_GUANTE.falls}!`];
    if (this.e.falls === GC_GUANTE.falls - 1 && !this.bitHeld) {
      this.bitHeld = true;
      this.def.acts = this.allActs.slice();
      pages.push('* El Guante regresa desde las estrellas...\n* ¡¡Y TIENE A BIT ATRAPADO EN SU PUÑO!!', '* BIT: ¡AYUDAAA! ¡Esto no estaba en el manual!', '* (Ahora en ACTUAR puedes pedirle que SUELTE a Bit.)');
    } else pages.push('* ...El Guante vuelve a la plataforma. Su porcentaje regresó a 0%.');
    this.say(pages, () => this.enemyTurn());
  },

  smashFail(why) {
    this.e.pct = 60;
    Sfx.lose();
    this.updateBars();
    this.say([why === 'error' ? '* ¡Un error! El SMASH salió chueco.' : '* ¡Se acabó el tiempo del SMASH!', '* El Guante se recupera. Su porcentaje bajó a 60%.'], () => this.enemyTurn());
  },

  actMenu() {
    this.def.acts = this.allActs.filter((a) => !a.phase3 || this.bitHeld);
    Scenes.battle.actMenu.call(this);
  },

  act(a) {
    // Soltar a Bit: el resto de la pelea ya no lo tiene atrapado.
    if (a.phase3) this.bitFree = true;
    Scenes.battle.act.call(this, a);
  },

  // ---------- Turno del Guante ----------

  startDodge() {
    this.turnN++;
    const fig = this.turnN % 2 === 0 ? GC_GUANTE_FIGS[(this.turnN / 2 - 1) % GC_GUANTE_FIGS.length] : null;
    Music.play(fig ? `gc_guante_${fig}` : 'gc_guante');
    if (fig) { this.floatText(`¡FIGURITA: ${GC_GUANTE_FIG_NAMES[fig]}!`, 'mercy'); this.throwFigure(fig); }
    const b = this.def.bullets;
    this.phase = 'punch';
    this.renderCmds();
    this.punch = new GCPunch(this.box, {
      style: fig || 'mix', count: b.count, interval: b.interval, pool: fig ? GC_GUANTE_FIG_POOLS[fig] : b.pool, caps: true, strict: true,
      label: fig ? `¡La lluvia de ${GC_GUANTE_FIG_NAMES[fig]}! Escríbela antes de que te alcance.` : '¡Puñetazos! Escríbelos antes de que te alcancen.',
    }, {
      onHit: () => this.hitMe(),
      onDone: (res) => { this.st.chars += res.chars; this.st.errors += res.errors; this.punch = null; this.toMenu(); },
    });
    this.punch.start();
  },

  // ESC en el turno del Guante: pausa la lluvia de golpes.
  pausePunch() {
    const pu = this.punch;
    pu.paused = true;
    const el = document.createElement('div');
    el.className = 'smb-pause gc-pause';
    el.innerHTML = '<div>PAUSA</div><div class="smb-menu"></div>';
    $('.battle').appendChild(el);
    const resume = () => { el.remove(); this.pauseUi = null; pu.paused = false; };
    this.pauseUi = new ListMenu($('.smb-menu', el), [{ label: 'Seguir' }, { label: 'Salir' }], {
      cols: 2, onPick: (i) => { if (i === 1) { this.pauseUi = null; Game.go(this.back); } else resume(); }, onCancel: resume,
    });
  },

  hitMe() {
    if (this.p.pct >= 100) { this.launched(); return; }
    this.p.pct += scaledDmg(this.def.atk) * GC_GUANTE.hitPct;
    this.shake('.pinfo');
    this.updateBars();
  },

  // Te mandaron a volar: RECUPERAR o pierdes una vida.
  launched() {
    const pu = this.punch;
    if (pu) { pu.stop(); this.st.chars += pu.chars; this.st.errors += pu.errors; this.punch = null; }
    this.phase = 'recover';
    Sfx.flag();
    this.floatText('¡A VOLAR!', '');
    this.renderCmds();
    this.task = new TypingTask(this.box, {
      label: '¡SALISTE VOLANDO! Escribe rapidísimo:',
      texts: ['recuperar'],
      timeLimit: GC_GUANTE.recoverMs,
      onDone: (res) => {
        this.st.chars += res.chars;
        this.st.errors += res.errors;
        this.st.ms += res.ms;
        if (res.completed) {
          this.p.pct = 50;
          Sfx.powerup();
          this.updateBars();
          this.say(['* ¡Te agarraste del borde de la plataforma!\n* Tu porcentaje bajó a 50%.'], () => this.toMenu());
          return;
        }
        this.p.lives--;
        this.p.pct = 0;
        this.updateBars();
        if (this.p.lives <= 0) {
          this.phase = 'busy';
          Sfx.lose();
          this.later(() => Game.go('gameover', { enemyId: this.id, back: this.back, scene: 'guante' }), 700);
          return;
        }
        Sfx.hurt();
        this.say([`* ¡Te caíste de la plataforma! Perdiste una vida.\n* Te quedan ${this.p.lives}. (Regresas con 0%.)`], () => this.toMenu());
      },
    });
    this.task.start();
  },

  // ---------- Fin ----------

  onWinPages({ spared, first, pages }) {
    const d = Save.data;
    if (first) Quests.complete('mundo_gc');
    pages.splice(1, 0, spared
      ? '* EL GUANTE: ...Las figuritas no son juguetes. Son amigos.\n* Toma. Esto tampoco es mío.'
      : '* EL GUANTE: ¡Tres caídas! ...Buena pelea, de verdad.\n* Toma. Esto tampoco es mío.');
    pages.push('* (Bit carga la GameCube de la manija. Le queda grande.)\n* BIT: ¡Por fin una consola que puedo cargar!');
    if (first || !d.flags.gcNombre) {
      d.flags.gcNombre = true;
      pages.push(
        '* ...',
        '* (Toda la arena se queda en silencio. Las estrellas dejan de parpadear.)',
        `* ${gcGlitchText('EL GLITCH: ...Muy bien. Ganaste otra vez.', 14)}`,
        '* (El Glitch abre una ventana. Es una pantalla vieja, de 1989.)\n*\n*     NOMBRE: _______',
        `* ${gcGlitchText('EL GLITCH: Yo también quería que alguien escribiera aquí.', 14)}`,
        '* (El Glitch se va. No pelea. Solo se va.)',
        '* BIT: ...',
        '* BIT: ......',
        '* (Por primera vez, Bit no dice nada.)',
        '* (Pssst... Don Chip, en el pueblo, encontró algo en el sótano.)',
      );
    }
  },

  // ---------- 3D: la Arena Final ----------

  build3d() {
    const tok = this.gtok = {};
    const host = $('.g-arena');
    Poly.load((ok) => {
      if (!ok || Game.scene !== this || this.gtok !== tok) return;
      const v = GC3.view(host, { w: 640, h: 250, cls: 'poly-cv g-cv' });
      if (!v) return;
      this.v = v;
      $('.battle').classList.add('has-arena');
      const M = GC3.models;
      GC3.stars(v);
      const arena = M.arena(v);
      arena.position.y = -2.4;
      v.scene.add(arena);
      const hero = Poly.models.hero(v);
      hero.position.set(-4.5, -2.1, 0.6);
      hero.rotation.y = 0.9;
      hero.scale.setScalar(0.9);
      v.scene.add(hero);
      this.glove = M.guante(v);
      this.glove.position.set(2.5, 1.2, 0);
      this.glove.scale.setScalar(0.85);
      v.scene.add(this.glove);
      // Bit atrapado (fase 3): un cursor blanco con ojos dentro del puño.
      this.bit3 = new THREE.Group();
      GC3.part(v, new THREE.BoxGeometry(0.35, 0.6, 0.25), GCC.white, this.bit3);
      GC3.eyes(v, this.bit3, { y: 0.1, z: 0.14, x: 0.08, r: 0.06 });
      this.bit3.position.set(0, 0.2, 0.55);
      this.glove.userData.hand.add(this.bit3);
      this.figs = GC_GUANTE_FIGS.map((k, i) => {
        const f = M.figurita(v, k, true);
        f.position.set(3.5 + i * 0.95 - 1.4, -1.7, -1.2);
        f.scale.setScalar(0.55);
        v.scene.add(f);
        return f;
      });
      this.flying = 0;
      this.knockT = 0;
      v.camera.position.set(0, 1.5, 12);
      v.camera.lookAt(0, -0.2, 0);
      v.start((dt, t) => this.anim3d(dt, t));
    });
  },

  anim3d(dt, t) {
    const g = this.glove;
    if (!g) return;
    if (g.userData.anim) g.userData.anim(t);
    this.bit3.visible = this.bitHeld && !this.bitFree;
    if (this.flying > 0) {
      // SMASH: sale volando hacia arriba a la derecha girando, y luego regresa desde arriba.
      this.flying -= dt;
      const k = 1 - this.flying / 1.6;
      if (k < 0.55) { g.position.set(2.5 + k * 22, 1.2 + k * 14, -k * 10); g.rotation.z += dt * 14; } else {
        const r = (k - 0.55) / 0.45;
        g.position.set(2.5, 1.2 + (1 - r) * 12, 0);
        g.rotation.z *= 0.9;
      }
      if (this.flying <= 0) { g.position.set(2.5, 1.2, 0); g.rotation.z = 0; }
    } else if (this.knockT > 0) {
      this.knockT -= dt;
      g.position.x = 2.5 + Math.sin(this.knockT * 40) * 0.12 * (this.e.pct / 50 + 1);
    }
    const hot = Math.min(1, (this.e.pct || 0) / 120);
    g.userData.hand.children[0].material.emissive && g.userData.hand.children[0].material.emissive.setRGB(hot * 0.5, 0, 0);
    if (this.thrown) {
      this.thrown.t += dt;
      const f = this.thrown.f;
      const k = Math.min(1, this.thrown.t / 0.8);
      f.position.set(2.5 - k * 3, 1 - k * 2.6 + Math.sin(k * Math.PI) * 2, 0.8);
      f.rotation.y += dt * 8;
      if (this.thrown.t > 2.2) { f.position.copy(this.thrown.home); this.thrown = null; }
    }
    if (this.e && this.e.mercy >= 100) g.rotation.y += dt * 2;
  },

  knock(s) { this.knockT = s; },
  fly() { this.flying = 1.6; },
  throwFigure(kind) {
    if (!this.figs) return;
    const f = this.figs[GC_GUANTE_FIGS.indexOf(kind)];
    this.thrown = { f, t: 0, home: f.position.clone() };
  },
});
