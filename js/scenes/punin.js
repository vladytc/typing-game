// MINIJEFE C — CAMPEON PUÑIN (guiño a Punch-Out!!, NES 1987). Ring de la Plaza.
// "Esquivar escribiendo": Puñín avisa su golpe con una palabra que parpadea. Escríbela antes de
// que termine el aviso para esquivar. 3 esquives seguidos = se MAREA y es tu turno de golpear
// (cada palabra PERFECTA pega 12). Cada 40 de daño, Puñín cae; a la tercera caída, ¡K.O.!
// También se puede ganar con PAZ (Guantes, Entrenar, Admirar) cuando está mareado.
//
// Simplificación: el lore pide 1.2 s por aviso, pero eso es imposible a 20-25 PPM; aquí el aviso
// dura según sus letras (0.7 s + 0.3 s por letra) y se acorta en cada ronda (×1, ×0.85, ×0.7).

const PUNIN_WARN = ['izquierda', 'derecha', 'gancho', 'abajo', 'arriba', 'jab'];
const PUNIN_PUNCH = ['golpe', 'guante', 'ring', 'campana', 'esquiva', 'fuerza', 'toalla', 'rápido', 'Ring', 'Campeón', 'Puño', 'Round'];
const PUNIN_KO = 40;
const PUNIN_ACTS = [
  { name: 'Guantes', text: 'chocas los guantes con respeto', mercy: 35, reply: '* Puñín choca sus guantes con los tuyos.\n* "Respeto. Eso me gusta."' },
  { name: 'Entrenar', text: 'corres con él por el parque', mercy: 35, reply: '* Corren tres vueltas al parque.\n* Puñín suda... y sonríe.' },
  { name: 'Admirar', text: 'le dices que es tu ídolo', mercy: 40, reply: '* "¿YO? ¿Tu ídolo?"\n* Puñín se pone rojo como un tomate.' },
];
// Dónde se mueve el héroe al esquivar cada aviso.
const PUNIN_DODGE = { izquierda: [-70, 0], derecha: [70, 0], abajo: [0, 26], gancho: [-60, 10], arriba: [60, 10], jab: [0, 26] };

function puninWindow(word, round) {
  return (0.7 + 0.3 * word.length) * [1, 0.85, 0.7][Math.min(3, round) - 1] * diff().time;
}

Scenes.punin = nesScene({
  enter({ enemyId = 'punin', back = 'map' } = {}) {
    Object.assign(this, { id: enemyId, back, backParams: undefined });
    this.mount('punin-scene', '<div class="pn-hud"></div>');
    Object.assign(this, {
      hpMax: playerMaxHp(), mercy: 0, dmg: 0, downs: 0, round: 1, streak: 0, best: 0,
      warn: null, pose: 'idle', poseT: 0, dodge: null, mode: 'intro', endMenu: null, pauseMenu: null, shakeT: 0,
    });
    this.hp = this.hpMax;
    this.playMusic('punin');
    Quests.start('record_ring');
    this.renderHud();
    this.say([
      '* ¡DING DING! En la esquina verde... ¡el CAMPEON PUÑIN!\n* "¡Vas a necesitar más que dos dedos!"',
      '* Cuando Puñín va a pegar, AVISA con una palabra.\n* Escríbela antes de que se acabe la barra y lo esquivas.',
      '* 3 esquives seguidos y se MAREA: ¡ahí te toca a ti!\n* "Cuando parpadeo, lo digo en serio."',
    ], () => this.startWarns(), 'PUÑIN');
  },

  renderHud() {
    const hud = $('.pn-hud');
    if (!hud) return;
    hud.innerHTML = `${nesBar('HP', this.hp, this.hpMax)}${nesBar('PAZ', this.mercy, 100, 'mercy')}${nesBar('GOLPES', this.dmg, PUNIN_KO, 'enemy')}<span>CAIDAS ${'●'.repeat(this.downs)}${'○'.repeat(3 - this.downs)}</span><span>RACHA ${this.streak}</span>`;
  },

  startWarns() {
    this.mode = 'fight';
    this.panel.innerHTML = '<div class="nesx-word"></div>';
    this.word = new NesWord($('.nesx-word', this.panel), this.tally);
    this.after(0.6, () => this.nextWarn());
  },

  nextWarn() {
    if (this.mode !== 'fight') return;
    const word = rand(PUNIN_WARN);
    this.warn = { word, t: 0, dur: puninWindow(word, this.round) };
    this.pose = 'wind';
    this.word.set(word, '¡ESQUIVA! Escribe el aviso:');
    Sfx.move();
  },

  actionKey(k) {
    if (this.mode !== 'fight' || !this.warn) return;
    if (this.word.key(k) === 'done') this.dodged();
  },

  dodged() {
    const w = this.warn.word;
    this.warn = null;
    this.streak++;
    this.best = Math.max(this.best, this.streak);
    this.dodge = { off: PUNIN_DODGE[w] || [0, 20], t: 0.45 };
    this.pose = 'punch';
    this.poseT = 0.35;
    Sfx.jump();
    this.pop('¡ESQUIVE!', 320, 200, NES.Y);
    this.word.set('', '');
    this.renderHud();
    if (this.streak % 3 === 0) this.after(0.6, () => this.dizzy());
    else this.after(0.55, () => this.nextWarn());
  },

  punched() {
    this.warn = null;
    this.streak = 0;
    this.pose = 'punch';
    this.poseT = 0.35;
    this.shakeT = 0.3;
    Sfx.hurt();
    this.hp = Math.max(0, this.hp - scaledDmg(6));
    this.pop('¡PAF!', 320, 200, NES.F);
    this.word.set('', '');
    this.renderHud();
    if (this.hp <= 0) {
      this.mode = 'over';
      Music.stop();
      Sfx.lose();
      this.after(0.9, () => Game.go('gameover', { enemyId: this.id, back: this.back, scene: 'punin' }));
      return;
    }
    this.after(0.8, () => this.nextWarn());
  },

  dizzy() {
    this.mode = 'dizzy';
    this.pose = 'dizzy';
    Sfx.secret();
    this.choose(['Golpear', ...PUNIN_ACTS.map((a) => a.name)], (i) => (i === 0 ? this.punch() : this.act(PUNIN_ACTS[i - 1])), '¡Puñín está MAREADO! ¿Qué haces?');
  },

  punch() {
    const words = pickWords(PUNIN_PUNCH, 4);
    this.task({
      label: '¡A GOLPEAR! Cada palabra PERFECTA pega fuerte',
      texts: words,
      timeLimit: words.join('').length * 450 + 1500,
      onUnit: (unit) => {
        const hit = unit.errors === 0 ? 12 : 6;
        this.dmg += hit;
        this.pose = 'hit';
        this.poseT = 0.25;
        if (unit.errors === 0) Sfx.crit(); else Sfx.hit();
        this.pop(unit.errors === 0 ? `¡PERFECTO! -${hit}` : `-${hit}`, 320, 120, NES.W);
        this.renderHud();
        return this.dmg < PUNIN_KO;
      },
      onDone: () => {
        if (this.dmg >= PUNIN_KO) { this.knockdown(); return; }
        this.pose = 'idle';
        this.say(['* Puñín sacude la cabeza y vuelve a ponerse en guardia.'], () => this.startWarns());
      },
    });
  },

  act(a) {
    this.task({
      label: `ACTUAR: ${a.name}`,
      texts: [a.text],
      caps: false,
      timeLimit: a.text.length * 600 + 3000,
      onDone: (res) => {
        const gain = res.completed ? a.mercy : Math.round(a.mercy * res.progress * 0.5);
        this.mercy = Math.min(100, this.mercy + gain);
        if (gain) Sfx.mercy();
        this.renderHud();
        this.pose = 'idle';
        this.say([res.completed ? a.reply : '* ¡Casi! Se acabó el tiempo antes de terminar.'], () => {
          if (this.mercy >= 100) this.win(true);
          else this.startWarns();
        });
      },
    });
  },

  knockdown() {
    this.downs++;
    this.dmg = 0;
    this.mode = 'down';
    this.pose = 'down';
    Sfx.stomp();
    this.renderHud();
    [1, 2, 3].forEach((n) => this.after(n * 0.5, () => { this.pop(`${n}...`, 320, 110, NES.W); Sfx.text(); }));
    this.after(1.9, () => {
      if (this.downs >= 3) { this.pop('¡K.O.!', 320, 100, NES.Y); this.win(false); return; }
      this.round++;
      this.pose = 'idle';
      this.say([`* ¡Puñín se levanta! RONDA ${this.round}.\n* Sus avisos ahora duran menos. ¡Ojo!`], () => this.startWarns());
    });
  },

  win(spared) {
    this.mode = 'win';
    this.noPause = true;
    this.warn = null;
    this.playMusic('victory');
    this.musicId = null;
    const d = Save.data;
    d.flags.nesBestStreak = Math.max(d.flags.nesBestStreak || 0, this.best);
    const pages = [spared
      ? '* Puñín baja los guantes.\n* "Eres el primero que me pregunta cómo estoy. ¡Amigos!"'
      : '* ¡K.O.! Puñín se queda viendo estrellitas... y luego huye a las regaderas.'];
    pages.push(...this.finish(spared));
    pages.push('* Desde las gradas, Dani Turbo aplaude...\n* ...y luego finge que no estaba aplaudiendo.');
    let record = false;
    if (this.best >= 9 && Quests.state('record_ring') !== 'done') {
      d.treasures.cinturon = true;
      record = true;
      pages.push(`* ¡${this.best} esquives seguidos! ¡RECORD DE RING!\n* Recibiste: ${upper(TREASURES.cinturon.name)}.`);
    }
    Save.write();
    if (record) Quests.complete('record_ring');
    this.say(pages, () => Game.go(this.back));
  },

  // ---------- Bucle y dibujo ----------

  update(dt) {
    this.poseT = Math.max(0, this.poseT - dt);
    this.shakeT = Math.max(0, this.shakeT - dt);
    if (this.dodge) { this.dodge.t -= dt; if (this.dodge.t <= 0) this.dodge = null; }
    if (this.poseT === 0 && (this.pose === 'punch' || this.pose === 'hit')) this.pose = this.mode === 'dizzy' || this.ui ? 'dizzy' : 'idle';
    if (this.mode === 'fight' && this.warn) {
      this.warn.t += dt;
      if (this.warn.t >= this.warn.dur) this.punched();
    }
  },

  draw(dt) {
    const g = this.g;
    const sh = this.shakeT > 0 ? Math.sin(this.shakeT * 90) * 5 : 0;
    g.save();
    g.translate(sh, 0);
    g.fillStyle = NES.K;
    g.fillRect(-10, 0, 660, 300);
    // Público.
    for (let i = 0; i < 40; i++) {
      g.fillStyle = [NES.D, NES.B, NES.O][i % 3];
      g.fillRect(8 + i * 16, 14 + (i % 2) * 6 + Math.sin(performance.now() / 300 + i) * 2, 10, 10);
    }
    // Lona y cuerdas.
    g.fillStyle = NES.U;
    g.fillRect(0, 190, 640, 110);
    g.fillStyle = NES.W;
    [70, 96, 122].forEach((y) => g.fillRect(0, y, 640, 4));
    g.fillStyle = NES.F;
    g.fillRect(30, 60, 10, 140);
    g.fillRect(600, 60, 10, 140);
    // Puñín.
    const t = performance.now() / 1000;
    let px = 256;
    let py = 50 + Math.sin(t * 4) * 3;
    if (this.pose === 'wind') { px += Math.sin(t * 30) * 3; py -= 4; }
    if (this.pose === 'hit') px += 14;
    if (this.pose === 'down') {
      g.save();
      g.translate(320, 200);
      g.rotate(Math.PI / 2);
      paintNes(g, NES_ART.punin, -64, -64, 8);
      g.restore();
    } else if (this.pose === 'punch') {
      paintNes(g, NES_ART.punin, px - 16, py + 6, 10);
    } else {
      paintNes(g, NES_ART.punin, px, py, 8);
    }
    if (this.pose === 'dizzy') {
      for (let i = 0; i < 3; i++) {
        const a = t * 4 + (i * Math.PI * 2) / 3;
        g.fillStyle = NES.Y;
        g.fillRect(320 + Math.cos(a) * 50 - 5, py + 6 + Math.sin(a) * 12 - 5, 10, 10);
      }
    }
    // Héroe (pequeño, de espaldas, como en el original).
    const off = this.dodge ? this.dodge.off.map((v) => v * Math.sin(Math.PI * (this.dodge.t / 0.45))) : [0, 0];
    paintTones(g, 'heroe', 296 + off[0], 222 + off[1], 3);
    g.restore();
    // El aviso parpadea arriba, con su barra de tiempo.
    if (this.warn) {
      const left = 1 - this.warn.t / this.warn.dur;
      if (Math.floor(performance.now() / 150) % 2 || left > 0.5) this.label(this.warn.word, 320, 44, { pos: this.word.pos, active: true });
      g.fillStyle = NES.W;
      g.fillRect(220, 52, 200, 8);
      g.fillStyle = left < 0.3 ? NES.F : NES.Y;
      g.fillRect(222, 54, 196 * Math.max(0, left), 4);
    }
    this.drawPops(dt);
  },
});
