// REINA NEBULA — jefe del Reino 16-Bit (guiño a Super Metroid, 1994). LORE.md §6.5.
// Es el combate normal (js/scenes/battle.js) con cuatro reglas nuevas:
//   1. Oscuridad: en LUCHAR > Ráfaga, las palabras se ven 1.5 s (escáner) y luego se tapan letras.
//   2. Rayo cargado: LUCHAR > Rayo cargado = una palabra larga; PERFECTO = daño x2.5, un error lo corta.
//   3. Drenaje: mientras estás en los menús, te quita 1 HP cada 2 s. ¡Decide rápido!
//   4. Las crías: en su turno, las medusitas salen del centro en espiral.
// Fases: al 60 % se prenden luces (menos letras tapadas) y aparece la cría grande (ACTUAR);
// al 25 % sale una mancha magenta en su núcleo: ACTUAR > Limpiar.
// Después de ganar, la misión "Las crías de Nébula" se juega volviendo a este nodo.

// Palabras con letras tapadas (·) que todavía no escribes.
class DarkTask extends TypingTask {
  constructor(box, opts) {
    super(box, opts);
    this.masks = opts.masks || [];
  }

  render(err = false) {
    const hidden = (j, k) => this.masks[j] && this.masks[j].has(k);
    const masked = (t, j) => [...t].map((c, k) => (hidden(j, k) ? '·' : c)).join('');
    const charSpan = (c, k) => {
      const state = k < this.pos ? 'ok' : k === this.pos ? `next${err ? ' err' : ''}` : '';
      if (c === ' ') return `<span class="c sp ${state}">&nbsp;</span>`;
      const hid = k >= this.pos && hidden(this.i, k);
      return `<span class="c ${state}${hid ? ' hid' : ''}">${esc(hid ? '·' : c)}</span>`;
    };
    const chars = (text) => {
      let k = 0;
      return text.split(/(?<= )/).map((word) => `<span class="wg">${[...word].map((c) => charSpan(c, k++)).join('')}</span>`).join('');
    };
    this.wordsEl.innerHTML = this.texts.map((t, j) => {
      if (j < this.i) return `<span class="w done">${esc(t)}</span>`;
      if (j > this.i) return `<span class="w">${esc(masked(t, j))}</span>`;
      return `<span class="w cur">${chars(t)}</span>`;
    }).join(' ') + (this.tip ? `<div class="tt-tip">${esc(this.tip)}</div>` : '');
  }
}

// Rayo cargado: la barra se llena mientras no te equivocas; un error lo dispara a medias.
class ChargeTask extends TypingTask {
  start() {
    super.start();
    const bar = document.createElement('div');
    bar.className = 'charge';
    bar.innerHTML = '<i></i>';
    $('.tt', this.box).appendChild(bar);
    this.chargeEl = $('i', bar);
  }

  key(e) {
    const before = this.errors;
    super.key(e);
    if (this.chargeEl) this.chargeEl.style.width = `${(this.chars / this.texts[0].length) * 100}%`;
    if (this.errors > before && !this.done) this.finish(false, true);
  }
}

// Las crías salen del centro y giran hacia afuera. Llegar a la orilla = te pegan.
class SpiralDodge extends Dodge {
  start() {
    super.start();
    this.field.classList.add('spiral');
    $('.dodge-label', this.box).textContent = '¡Las crías salen en espiral!';
    this.cx = this.W / 2;
    this.cy = this.field.clientHeight / 2 - 8;
    this.arm = Math.random() * 6;
  }

  spawn() {
    const b = { text: rand(this.cfg.pool), pos: 0, r: 0, a: this.arm, y: 0 };
    this.arm += 2.4;
    b.el = document.createElement('div');
    b.el.className = 'bullet cria';
    this.field.appendChild(b.el);
    this.renderBullet(b);
    b.w = b.el.offsetWidth;
    b.h = b.el.offsetHeight;
    this.place(b);
    this.bullets.push(b);
    this.spawned++;
  }

  place(b) {
    const x = this.cx + Math.cos(b.a) * b.r * (this.W / 2 - 40) - b.w / 2;
    const y = this.cy + Math.sin(b.a) * b.r * (this.cy - 6) - b.h / 2;
    b.el.style.transform = `translate(${x}px, ${y}px) scale(${0.6 + b.r * 0.5})`;
  }

  loop = (ts) => {
    if (!this.active) return;
    const dt = Math.max(0, Math.min(50, ts - this.last)) / 1000;
    this.last = ts;
    this.elapsed += dt * 1000;
    if (this.spawned < this.cfg.count && this.elapsed >= this.nextSpawn) {
      this.spawn();
      this.nextSpawn += this.gap / diff().speed; // el mismo espaciado mínimo que el Dodge normal
    }
    for (const b of [...this.bullets]) {
      b.r += this.cfg.speed * diff().speed * dt;
      b.a += 1.1 * dt;
      b.y = b.r; // para apuntar a la que va más adelantada
      this.place(b);
      if (b.r >= 1) this.land(b);
    }
    if (!this.active) return;
    if (this.spawned >= this.cfg.count && !this.bullets.length) { this.end(); return; }
    this.raf = requestAnimationFrame(this.loop);
  };
}

const NEBULA_CRIAS = ['ñami', 'ñoñita', 'piñita', 'cariño', 'pequeña', 'sueñito', 'castañita', 'muñequita', 'señorita', 'niña luz', 'ñaña', 'leñita'];

Scenes.nebula = Object.create(Scenes.battle);
Object.assign(Scenes.nebula, {
  enter(params) {
    const d = Save.data;
    this.crias = d.done[params.enemyId] && Quests.state('snes_crias') === 'active';
    this.stage = 1;
    this.cleaned = false;
    this.warned = false;
    if (this.crias) { this.enterCrias(params); return; }
    Scenes.battle.enter.call(this, params);
    $('.battle').classList.add('dark');
    this.makeQueen();
    this.drainIv = setInterval(() => this.drain(), 2000 * diff().time);
  },

  exit() {
    clearInterval(this.drainIv);
    cancelAnimationFrame(this.qraf);
    if (this.ui && this.ui.stop) this.ui.stop();
    Scenes.battle.exit.call(this);
  },

  // ---------- La Reina (dibujo animado a 16 bits) ----------

  makeQueen() {
    const wrap = $('.esprite');
    wrap.innerHTML = '';
    const cv = document.createElement('canvas');
    cv.className = 'neb-cv';
    cv.width = 120;
    cv.height = 86;
    wrap.appendChild(cv);
    const g = cv.getContext('2d');
    const babies = [0, 1, 2, 3, 4];
    const step = (ts) => {
      const t = ts / 1000;
      g.clearRect(0, 0, 120, 86);
      const bob = Math.sin(t * 1.4) * 2;
      // Crías alrededor (detrás).
      babies.forEach((i) => {
        const a = t * 0.6 + (i / babies.length) * Math.PI * 2;
        if (Math.sin(a) < 0) paintArt(g, SNES_SPRITES.nebulita, 52 + Math.cos(a) * 52, 30 + Math.sin(a) * 12, 1);
      });
      // Tentáculos.
      g.strokeStyle = 'rgba(195,155,211,0.65)';
      g.lineWidth = 2;
      for (let k = 0; k < 7; k++) {
        const x0 = 34 + k * 9;
        g.beginPath();
        g.moveTo(x0, 46 + bob);
        for (let y = 0; y < 34; y += 3) g.lineTo(x0 + Math.sin(t * 2 + k + y * 0.2) * 3, 46 + bob + y);
        g.stroke();
      }
      // Campana translúcida.
      const grad = g.createRadialGradient(60, 30 + bob, 4, 60, 34 + bob, 40);
      grad.addColorStop(0, 'rgba(247,154,192,0.95)');
      grad.addColorStop(0.6, 'rgba(195,155,211,0.75)');
      grad.addColorStop(1, 'rgba(142,68,173,0.35)');
      g.fillStyle = grad;
      g.beginPath();
      g.ellipse(60, 36 + bob, 38, 30, 0, Math.PI, 0);
      for (let x = 98; x >= 22; x -= 4) g.lineTo(x, 36 + bob + 6 + Math.sin(t * 3 + x * 0.3) * 2);
      g.closePath();
      g.fill();
      // Núcleo que late.
      const pr = 7 + Math.sin(t * 4) * 1.2;
      const core = g.createRadialGradient(60, 28 + bob, 1, 60, 28 + bob, pr);
      core.addColorStop(0, '#ffffff');
      core.addColorStop(0.5, '#ffd93d');
      core.addColorStop(1, 'rgba(247,154,192,0)');
      g.fillStyle = core;
      g.beginPath();
      g.arc(60, 28 + bob, pr, 0, Math.PI * 2);
      g.fill();
      // La mancha del Glitch (fase 3), con rayitas de señal mala.
      if (this.stage >= 3 && !this.cleaned) {
        for (let k = 0; k < 6; k++) {
          if (Math.random() < 0.7) {
            g.fillStyle = k % 2 ? '#ff00ff' : '#1a1a2e';
            g.fillRect(52 + Math.random() * 6, 22 + bob + k * 2, 8 + Math.random() * 6, 1);
          }
        }
      }
      // Ojitos (se cierran cuando ya está tranquila).
      g.fillStyle = '#1a1a2e';
      if (this.e && this.e.mercy >= 60) {
        g.fillRect(44, 24 + bob, 5, 1);
        g.fillRect(71, 24 + bob, 5, 1);
      } else {
        g.fillStyle = '#ffffff';
        g.fillRect(44, 21 + bob, 5, 5);
        g.fillRect(71, 21 + bob, 5, 5);
        g.fillStyle = '#1a1a2e';
        g.fillRect(46, 23 + bob, 2, 3);
        g.fillRect(73, 23 + bob, 2, 3);
      }
      // Crías al frente.
      babies.forEach((i) => {
        const a = t * 0.6 + (i / babies.length) * Math.PI * 2;
        if (Math.sin(a) >= 0) paintArt(g, SNES_SPRITES.nebulita, 52 + Math.cos(a) * 52, 30 + Math.sin(a) * 12, 1);
      });
      this.qraf = requestAnimationFrame(step);
    };
    this.qraf = requestAnimationFrame(step);
  },

  // ---------- Drenaje: pensar mucho cuesta HP ----------

  drain() {
    if (!['menu', 'submenu'].includes(this.phase) || this.p.hp <= 1) return;
    this.p.hp--;
    this.updateBars();
    this.shake('.pinfo');
    if (!this.warned) {
      this.warned = true;
      const el = document.createElement('div');
      el.className = 'bit-warn';
      el.textContent = 'BIT: ¡No te quedes pensando, te chupa la energía!';
      $('.battle').appendChild(el);
      setTimeout(() => el.remove(), 3500);
    }
  },

  // ---------- LUCHAR: ráfaga a oscuras o rayo cargado ----------

  runTask(opts, Klass = TypingTask) {
    this.phase = 'typing';
    this.renderCmds();
    const onDone = opts.onDone;
    this.task = new Klass(this.box, {
      strict: this.strict,
      ...opts,
      onDone: (res) => {
        this.st.chars += res.chars;
        this.st.errors += res.errors;
        this.st.ms += res.ms;
        onDone(res);
      },
    });
    this.task.start();
  },

  fight() {
    this.subMenu([{ label: 'Ráfaga' }, { label: 'Rayo cargado' }], (i) => (i === 0 ? this.darkFight() : this.chargeFight()));
  },

  hit(dmg, perfect, label) {
    this.e.hp = Math.max(0, this.e.hp - dmg);
    perfect ? Sfx.crit() : Sfx.hit();
    this.floatText(label, perfect ? 'crit' : '');
    this.shake('.esprite');
    this.updateBars();
  },

  darkFight() {
    const words = pickWords(this.def.words, this.def.fightWords);
    const ratio = this.stage >= 2 ? 0.25 : 0.5;
    const masks = words.map((w) => {
      const s = new Set();
      [...w].forEach((c, k) => { if (k > 0 && c !== ' ' && Math.random() < ratio) s.add(k); });
      if (!s.size && w.length > 2) s.add(1 + Math.floor(Math.random() * (w.length - 1)));
      return s;
    });
    // Escáner: 1.5 s para memorizar.
    this.phase = 'busy';
    this.renderCmds();
    this.box.innerHTML = `
      <div class="tt scan">
        <div class="tt-label">ESCANER: ¡memoriza las palabras!</div>
        <div class="tt-words">${words.map((w) => `<span class="w cur">${esc(w)}</span>`).join(' ')}</div>
        <div class="scanline"></div>
      </div>`;
    Sfx.secret();
    this.later(() => {
      let dealt = 0;
      const total = words.join('').length;
      this.runTask({
        label: 'A OSCURAS: escribe lo que viste',
        texts: words,
        masks,
        timeLimit: total * 620 + 2500,
        onUnit: (unit) => {
          const { dmg, perfect } = this.damageFor(unit);
          dealt += dmg;
          if (perfect) this.st.perfect++;
          this.hit(dmg, perfect, perfect ? `¡PERFECTO! -${dmg}` : `-${dmg}`);
          return this.e.hp > 0;
        },
        onDone: (res) => {
          if (this.e.hp <= 0) { this.later(() => this.win(false), 700); return; }
          const msg = dealt === 0 ? '* ¡Se acabó el tiempo! No lograste atacar.'
            : res.completed ? `* ¡Ráfaga completa a oscuras! Hiciste ${dealt} de daño.` : `* Se acabó el tiempo. Hiciste ${dealt} de daño.`;
          this.say([msg], () => this.enemyTurn());
        },
      }, DarkTask);
    }, 1500 * diff().time);
  },

  chargeFight() {
    const text = rand(this.def.longWords);
    this.runTask({
      label: 'RAYO CARGADO: sin errores = x2.5 (un error lo dispara)',
      texts: [text],
      timeLimit: text.length * 560 + 2500,
      onDone: (res) => {
        let dmg = 0;
        let msg;
        if (res.completed && res.errors === 0) {
          dmg = Math.round(this.damageFor({ text, ms: res.ms, errors: 1 }).dmg * 2.5);
          this.st.perfect++;
          this.hit(dmg, true, `¡RAYO CARGADO! -${dmg}`);
          msg = `* ¡RAYO CARGADO AL MÁXIMO!\n* Hiciste ${dmg} de daño.`;
        } else if (res.chars > 0) {
          dmg = this.damageFor({ text: text.slice(0, res.chars), ms: Math.max(res.ms, 300), errors: 1 }).dmg;
          this.hit(dmg, false, `-${dmg}`);
          msg = res.aborted ? `* ¡Un error! El rayo se disparó a medias.\n* Hiciste ${dmg} de daño.` : `* Se acabó el tiempo. El rayo hizo ${dmg} de daño.`;
        } else msg = '* El rayo no alcanzó a cargar...';
        if (this.e.hp <= 0) { this.later(() => this.win(false), 700); return; }
        this.say([msg], () => this.enemyTurn());
      },
    }, ChargeTask);
  },

  // ---------- ACTUAR: opciones según la fase ----------

  actMenu() {
    const acts = this.def.acts.filter((a) => !a.stage || this.stage >= a.stage);
    this.subMenu([{ label: 'Revisar' }, ...acts.map((a) => ({ label: a.name }))], (i) => {
      if (i === 0) { this.say([this.def.check], () => this.toMenu()); return; }
      if (acts[i - 1].name === 'Limpiar') this.cleaned = true;
      this.act(acts[i - 1]);
    });
  },

  // ---------- Turno de la Reina ----------

  enemyTurn() {
    const r = this.e.hp / this.def.hp;
    const pages = [];
    if (this.stage < 2 && r <= 0.6) {
      this.stage = 2;
      $('.battle').classList.add('lit');
      Music.play('snes_nebula2');
      pages.push('* ¡Se prenden unas luces en la cueva!\n* Ahora se ve un poco mejor. (Menos letras tapadas.)',
        '* La cría más grande se asoma: "¡Nebulita! ¡Nebulita!"\n* (Nueva opción en ACTUAR.)');
    }
    if (this.stage < 3 && r <= 0.25) {
      this.stage = 3;
      pages.push('* Una mancha MAGENTA aparece sobre su núcleo...\n* BIT: ¡Ese color! ¡Es del tipo morado!', '* (Nueva opción en ACTUAR: Limpiar.)');
    }
    if (pages.length) { this.say(pages, () => Scenes.battle.enemyTurn.call(this)); return; }
    Scenes.battle.enemyTurn.call(this);
  },

  startDodge() {
    this.phase = 'dodge';
    this.dodge = new SpiralDodge(this.box, { strict: this.strict, ...this.def.bullets }, {
      onHit: () => {
        this.p.hp = Math.max(0, this.p.hp - scaledDmg(this.def.atk));
        this.updateBars();
        this.shake('.pinfo');
        if (this.p.hp <= 0) {
          this.dodge.stop();
          this.phase = 'busy';
          this.later(() => { Sfx.lose(); Game.go('gameover', { enemyId: this.id, back: this.back, scene: 'nebula' }); }, 600);
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
    clearInterval(this.drainIv);
    Scenes.battle.win.call(this, spared);
  },

  // ---------- Misión: Las crías de Nébula ----------

  enterCrias({ enemyId, back = 'map' }) {
    document.body.className = 'theme-nebula';
    Object.assign(this, { id: enemyId, def: ENEMIES[enemyId], back, timers: [], e: { hp: 1, mercy: 100 }, phase: 'crias' });
    Music.play('snes_nebula');
    Game.root.innerHTML = `
      <div class="battle dark lit crias">
        <div class="enemy-wrap"><div class="esprite"></div></div>
        <div class="box bbox"></div>
      </div>`;
    this.box = $('.bbox');
    this.makeQueen();
    const names = pickWords(NEBULA_CRIAS, 10);
    const intro = () => {
      this.ui = new Dialog(this.box, [
        '* REINA NEBULA: ¡Volviste!\n* Mis hijas quieren que sepas cómo se llaman.',
        '* (Escribe los 10 nombres sin NINGÚN error. Llevan Ñ.)',
      ], () => this.criasTask(names));
    };
    intro();
  },

  criasTask(names) {
    this.ui = new TypingTask(this.box, {
      label: 'Los nombres de las medusitas (sin errores):',
      texts: names,
      timeLimit: names.join('').length * 900 + 6000,
      strict: true,
      onDone: (res) => {
        const ok = res.completed && res.errors === 0;
        if (ok) {
          Save.data.treasures.nebulita = true;
          Save.write();
          Quests.complete('snes_crias');
          this.ui = new Dialog(this.box, [
            '* ¡Las diez medusitas brillan al oír su nombre!',
            '* REINA NEBULA: Esta es la más pequeña. Quiere ir contigo a ver el mundo.',
            '* Recibiste: NEBULITA.\n* (Se guardó en tu vitrina.)',
          ], () => Game.go(this.back));
          Sfx.spare();
        } else {
          this.ui = new Dialog(this.box, [res.completed
            ? `* Las escribiste todas... pero con ${res.errors} error${res.errors === 1 ? '' : 'es'}.\n* Las medusitas se hicieron bolas. ¡Otra vez!`
            : '* ¡Se acabó el tiempo! Las medusitas se escondieron. ¡Otra vez!'], () => this.criasTask(pickWords(NEBULA_CRIAS, 10)));
        }
      },
    });
    this.ui.start();
  },

  onKey(e) {
    if (this.crias) {
      if (e.key === 'Escape' && !(this.ui instanceof TypingTask)) { Game.go(this.back); return; }
      if (this.ui) this.ui.key(e);
      return;
    }
    Scenes.battle.onKey.call(this, e);
  },
});
