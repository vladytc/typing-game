// Batalla de Tecloides contra un entrenador (homenaje a los RPG de monstruos de Game Boy).
//   ATACAR:   escribe la palabra del ataque. Rápido y sin errores = más daño; el tipo importa.
//   TECLOIDE: cambia de Tecloide.  OBJETO: galletas.  HUIR: ...no se puede.
//   Turno rival: aparece la palabra de su ataque; escríbela a tiempo para esquivar (mitad de daño).

const TEC_CMDS = ['ATACAR', 'TECLOIDE', 'OBJETO', 'HUIR'];
const tecName = (m) => upper(TECLOIDES[m.id].name);
const mkTec = ({ id, lv }) => ({ id, lv, hp: tecloideHp(id, lv), max: tecloideHp(id, lv) });

Scenes.tecloides = {
  enter({ enemyId, back = 'map' }) {
    const tr = TRAINERS[enemyId];
    Object.assign(this, {
      id: enemyId, tr, back, def: ENEMIES[enemyId],
      cmd: 0, phase: 'busy', timers: [], ui: null, stunned: false,
      st: { chars: 0, errors: 0, ms: 0, perfect: 0 },
      items: 3 + (Save.data.konami ? 3 : 0),
    });
    Music.play(tr.music || 'tecloides');
    Game.root.innerHTML = `
      <div class="mon intro-flash">
        <div class="info foe-info hidden">
          <div><b class="fname"></b> <span class="lv flv"></span></div>
          <div class="hpline"><span>HP</span><div class="bar"><i></i></div></div>
          <div class="balls"></div>
        </div>
        <div class="spr foe-spr"></div>
        <div class="spr me-spr"></div>
        <div class="info me-info hidden">
          <div><b class="mname"></b> <span class="lv mlv"></span></div>
          <div class="hpline"><span>HP</span><div class="bar"><i></i></div></div>
          <div class="hpnum"></div>
        </div>
        <div class="box mbox"><div class="mtext"></div><div class="mcmds hidden"></div></div>
      </div>`;
    this.later(() => $('.mon').classList.remove('intro-flash'), 900);
    const hasTeam = (Save.data.team || []).length > 0;
    this.showSprite('.foe-spr', hasTeam ? tr.sprite : 'profesora');
    this.later(() => (hasTeam ? this.begin() : this.chooseStarter()), 900);
  },

  exit() {
    this.timers.forEach(clearTimeout);
    if (this.ui && this.ui.stop) this.ui.stop();
  },

  later(fn, ms) { this.timers.push(setTimeout(fn, ms)); },

  // ---------- Interfaz ----------

  showSprite(sel, sprite, flip = false) {
    const el = $(sel);
    el.innerHTML = '';
    el.classList.remove('faint', 'hit');
    if (sprite) el.appendChild(spriteCanvas(sprite, 6, false, flip ? 'flip' : ''));
  },

  say(pages, done) {
    this.phase = 'dialog';
    $('.mcmds').classList.add('hidden');
    $('.mtext').classList.remove('narrow');
    this.ui = new Dialog($('.mtext'), pages, done);
  },

  talk(pages) { return new Promise((done) => this.say(pages, done)); },

  updateInfo() {
    const f = this.foe[this.fi];
    const m = this.team[this.pi];
    $('.fname').textContent = tecName(f);
    $('.flv').textContent = `Nv${f.lv}`;
    $('.foe-info .bar i').style.width = `${(f.hp / f.max) * 100}%`;
    $('.balls').textContent = this.foe.map((x) => (x.hp > 0 ? '●' : '○')).join(' ');
    $('.mname').textContent = tecName(m);
    $('.mlv').textContent = `Nv${m.lv}`;
    $('.me-info .bar i').style.width = `${(m.hp / m.max) * 100}%`;
    $('.hpnum').textContent = `${m.hp}/${m.max}`;
    // "¡Casi!": cuando al rival le queda poca vida, la música cambia a mayor.
    if (f.hp > 0 && f.hp / f.max < 0.3 && this.foe.filter((x) => x.hp > 0).length === 1) Music.play(this.tr.musicCasi || 'tecloides_casi');
  },

  pulse(sel, cls) {
    const el = $(sel);
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  },

  // ---------- Inicio ----------

  async chooseStarter() {
    await this.talk([
      '* PROFESORA LETRA: ¡Bienvenido al mundo de los TECLOIDES!\n* Criaturas que viven en las teclas.',
      '* Cada Tecloide sabe 4 ataques, y cada ataque es una PALABRA.\n* Si la escribes rápido y sin errores, pega más fuerte.',
      '* CHISPA le gana a GOTA, GOTA le gana a BROTE\n* y BROTE le gana a CHISPA.',
      '* Escoge a tu primer compañero escribiendo su nombre.',
    ]);
    this.phase = 'choose';
    STARTERS.forEach((id, i) => {
      const c = spriteCanvas(TECLOIDES[id].sprite, 4, false, 'starter');
      c.style.left = `${150 + i * 120}px`;
      $('.mon').appendChild(c);
    });
    this.ui = new ChoicePrompt($('.mtext'), STARTERS.map((id) => TECLOIDES[id].name.toLowerCase()), async (i) => {
      document.querySelectorAll('.starter').forEach((c) => c.remove());
      const id = STARTERS[i];
      Save.data.team = [{ id, lv: 5, xp: 0 }];
      Save.write();
      await this.talk([
        `* ¡Escogiste a ${upper(TECLOIDES[id].name)}!\n* ${TECLOIDES[id].desc}`,
        '* PROFESORA LETRA: Un Tecloide bien escrito nunca falla.',
      ]);
      this.showSprite('.foe-spr', this.tr.sprite);
      Sfx.confirm();
      this.begin();
    }, {
      prompt: 'Escribe el nombre de tu compañero:',
      tags: STARTERS.map((id) => TTYPES[TECLOIDES[id].type]),
    });
  },

  async begin() {
    this.team = Save.data.team.map(mkTec);
    this.foe = this.tr.team(Save.data.team[0].id).map(mkTec);
    this.pi = 0;
    this.fi = 0;
    await this.talk(this.tr.intro);
    this.showSprite('.foe-spr', TECLOIDES[this.foe[0].id].sprite);
    $('.foe-info').classList.remove('hidden');
    this.updateInfo();
    await this.talk([`* ${upper(this.tr.name)} envió a ${tecName(this.foe[0])}.`]);
    this.showSprite('.me-spr', TECLOIDES[this.team[0].id].sprite, true);
    $('.me-info').classList.remove('hidden');
    this.updateInfo();
    await this.talk([`* ¡Adelante, ${tecName(this.team[0])}!`]);
    this.toMenu();
  },

  // ---------- Turno del jugador ----------

  toMenu() {
    this.phase = 'menu';
    $('.mtext').classList.add('narrow');
    this.ui = new Dialog($('.mtext'), [`* ¿Qué hará ${tecName(this.team[this.pi])}?`], null, { wait: false });
    this.renderCmds();
  },

  renderCmds() {
    const el = $('.mcmds');
    el.classList.remove('hidden');
    el.innerHTML = TEC_CMDS.map((c, i) => `<div class="mcmd ${i === this.cmd ? 'sel' : ''}" data-i="${i}">${c}</div>`).join('');
    el.querySelectorAll('.mcmd').forEach((c) => {
      c.onclick = () => { if (this.phase === 'menu') { this.cmd = +c.dataset.i; this.choose(); } };
    });
  },

  choose() {
    Sfx.confirm();
    if (this.ui && this.ui.stop) this.ui.stop();
    $('.mcmds').classList.add('hidden');
    $('.mtext').classList.remove('narrow');
    [() => this.pickMove(), () => this.teamMenu(false), () => this.bag(), () => this.run()][this.cmd]();
  },

  pickMove() {
    const tec = TECLOIDES[this.team[this.pi].id];
    const foeType = TECLOIDES[this.foe[this.fi].id].type;
    this.phase = 'moves';
    this.ui = new ChoicePrompt($('.mtext'), tec.moves.map((m) => m.word), (i, timing) => this.attack(tec.moves[i], timing), {
      prompt: 'Escribe la palabra del ataque (ESC para volver):',
      tags: tec.moves.map((m) => {
        const e = effectiveness(m.type, foeType);
        return `${upper(m.name)} · ${TTYPES[m.type]} · ${m.power}${e > 1 ? ' · ¡FUERTE!' : e < 1 ? ' · débil' : ''}`;
      }),
    });
  },

  async attack(m, { ms, errors }) {
    this.phase = 'busy';
    const me = this.team[this.pi];
    const foe = this.foe[this.fi];
    const wpm = (m.word.length / 5) / (Math.max(ms, 150) / 60000);
    const speed = Math.min(2.2, 0.6 + wpm / 60);
    const accuracy = errors === 0 ? 1.2 : Math.max(0.5, 1 - errors * 0.1);
    const eff = effectiveness(m.type, TECLOIDES[foe.id].type);
    const stab = m.type === TECLOIDES[me.id].type ? 1.2 : 1;
    const levelBoost = 1 + (me.lv - 5) * 0.08;
    const perfect = errors === 0;
    const dmg = Math.max(1, Math.round(m.power * 0.35 * speed * accuracy * eff * stab * levelBoost));
    if (perfect) this.st.perfect++;
    this.st.chars += m.word.length;
    this.st.errors += errors;
    this.st.ms += Math.max(ms, 300);

    await this.talk([`* ¡${tecName(me)} usó ${upper(m.name)}!`]);
    foe.hp = Math.max(0, foe.hp - dmg);
    eff > 1 ? Sfx.crit() : Sfx.hit();
    this.pulse('.foe-spr', 'hit');
    this.updateInfo();
    const notes = [];
    if (eff > 1) notes.push('* ¡Es muy eficaz!');
    if (eff < 1) notes.push('* No es muy eficaz...');
    if (perfect) notes.push(`* ¡Escritura PERFECTA! (${Math.round(Math.min(wpm, 200))} PPM)`);
    if (perfect && m.effect === 'curar' && me.hp < me.max) {
      const heal = Math.min(me.max - me.hp, Math.ceil(me.max * 0.1));
      me.hp += heal;
      this.updateInfo();
      notes.push(`* Las raíces curaron ${heal} HP.`);
    }
    if (perfect && m.effect === 'aturdir' && foe.hp > 0 && !this.justStunned) {
      this.stunned = true;
      notes.push(`* ¡${tecName(foe)} rival quedó aturdido!`);
    }
    if (notes.length) await this.talk([notes.join('\n')]);
    if (foe.hp <= 0) { await this.foeFainted(); return; }
    this.foeTurn();
  },

  async foeFainted() {
    const foe = this.foe[this.fi];
    $('.foe-spr').classList.add('faint');
    Sfx.pop();
    await this.talk([`* ¡${tecName(foe)} rival se debilitó!`]);
    const next = this.foe.findIndex((x) => x.hp > 0);
    if (next < 0) { this.win(); return; }
    this.fi = next;
    this.stunned = false;
    this.showSprite('.foe-spr', TECLOIDES[this.foe[next].id].sprite);
    this.updateInfo();
    await this.talk([`* ${upper(this.tr.name)} envió a ${tecName(this.foe[next])}.`]);
    this.toMenu();
  },

  bag() {
    this.phase = 'sub';
    this.ui = new ListMenu($('.mtext'), [{ label: `${ITEM.name} x${this.items}`, disabled: !this.items }], {
      onPick: async () => {
        const m = this.team[this.pi];
        this.items--;
        const heal = Math.min(15, m.max - m.hp);
        m.hp += heal;
        Sfx.heal();
        this.updateInfo();
        await this.talk([`* ${tecName(m)} comió la galleta y recuperó ${heal} HP.`]);
        this.foeTurn();
      },
      onCancel: () => this.toMenu(),
    });
  },

  // forced = true cuando el Tecloide activo se debilitó y hay que mandar otro.
  teamMenu(forced) {
    this.phase = 'sub';
    if (!forced && this.team.length === 1) {
      this.say([`* ${tecName(this.team[0])} es tu único Tecloide por ahora.\n* (Conseguirás más en tu aventura.)`], () => this.toMenu());
      return;
    }
    const items = this.team.map((m, i) => ({
      label: `${TECLOIDES[m.id].name} ${TTYPES[TECLOIDES[m.id].type]} ${m.hp}/${m.max}`,
      disabled: m.hp <= 0 || i === this.pi,
    }));
    this.ui = new ListMenu($('.mtext'), items, {
      onPick: async (i) => {
        const old = this.team[this.pi];
        this.pi = i;
        if (!forced) await this.talk([`* ¡Regresa, ${tecName(old)}!`]);
        this.showSprite('.me-spr', TECLOIDES[this.team[i].id].sprite, true);
        this.updateInfo();
        await this.talk([`* ¡Adelante, ${tecName(this.team[i])}!`]);
        if (forced) this.toMenu(); else this.foeTurn();
      },
      onCancel: forced ? null : () => this.toMenu(),
    });
  },

  async run() {
    await this.talk(['* ¡No puedes huir de una batalla contra un entrenador!']);
    this.toMenu();
  },

  // ---------- Turno del rival ----------

  async foeTurn() {
    const foe = this.foe[this.fi];
    const me = this.team[this.pi];
    if (this.stunned) {
      this.stunned = false;
      this.justStunned = true; // no se puede aturdir dos turnos seguidos
      await this.talk([`* ${tecName(foe)} rival sigue aturdido y no se mueve.`]);
      this.toMenu();
      return;
    }
    this.justStunned = false;
    // Algunos Tecloides (como "???") a veces no obedecen: TECLOIDES[id].flaky = probabilidad.
    const flaky = TECLOIDES[foe.id].flaky;
    if (flaky && Math.random() < flaky) {
      await this.talk([`* ${tecName(foe)} se quedó congelado.\n* ...No hizo nada.`]);
      this.toMenu();
      return;
    }
    const moves = TECLOIDES[foe.id].moves;
    const myType = TECLOIDES[me.id].type;
    // La mitad de las veces escoge el ataque que más te duele.
    const best = moves.reduce((a, x) => (effectiveness(x.type, myType) * x.power > effectiveness(a.type, myType) * a.power ? x : a));
    const m = Math.random() < 0.5 ? best : rand(moves);
    await this.talk([`* ¡${tecName(foe)} rival usó ${upper(m.name)}!`]);
    const res = await this.dodge(m.word);
    const eff = effectiveness(m.type, myType);
    const stab = m.type === TECLOIDES[foe.id].type ? 1.2 : 1;
    let dmg = Math.max(1, Math.round(m.power * 0.22 * eff * stab * (1 + (foe.lv - 5) * 0.08)));
    dmg = scaledDmg(dmg);
    if (res.completed) dmg = Math.ceil(dmg / 2);
    me.hp = Math.max(0, me.hp - dmg);
    Sfx.hurt();
    this.pulse('.me-spr', 'hit');
    this.updateInfo();
    const notes = [res.completed ? '* ¡Esquivaste a medias! Recibiste la mitad del daño.' : '* ¡No alcanzaste a esquivar!'];
    if (eff > 1) notes.push('* ¡Es muy eficaz!');
    if (eff < 1) notes.push('* No es muy eficaz...');
    await this.talk([notes.join('\n')]);
    if (me.hp > 0) { this.toMenu(); return; }

    $('.me-spr').classList.add('faint');
    await this.talk([`* ¡${tecName(me)} se debilitó!`]);
    if (this.team.some((x) => x.hp > 0)) {
      await this.talk(['* ¿A quién vas a mandar?']);
      this.teamMenu(true);
      return;
    }
    this.lose();
  },

  // Esquivar: escribir la palabra del ataque rival antes de que se acabe la barra.
  dodge(word) {
    return new Promise((done) => {
      this.phase = 'defend';
      $('.mtext').innerHTML = '';
      this.ui = new TypingTask($('.mtext'), {
        label: '¡ESQUIVA! Escribe su ataque:',
        texts: [word],
        timeLimit: 2000 + word.length * 100,
        onDone: (res) => {
          this.st.chars += res.chars;
          this.st.errors += res.errors;
          done(res);
        },
      });
      this.ui.start();
    });
  },

  // ---------- Final ----------

  async lose() {
    Music.stop();
    Sfx.lose();
    Save.write();
    await this.talk([...this.tr.win, ...this.tr.retry]);
    this.phase = 'sub';
    this.ui = new ListMenu($('.mtext'), [{ label: 'Revancha' }, { label: 'Volver al mapa' }], {
      cols: 2,
      onPick: (i) => (i === 0 ? Game.go((this.def && this.def.mode) || 'tecloides', { enemyId: this.id, back: this.back }) : Game.go(this.back)),
    });
  },

  async win() {
    Music.play('victory');
    const d = Save.data;
    this.showSprite('.foe-spr', this.tr.sprite);
    const wpm = this.st.ms > 0 ? Math.round((this.st.chars / 5) / (this.st.ms / 60000)) : 0;
    const typed = this.st.chars + this.st.errors;
    const acc = typed ? Math.round((this.st.chars / typed) * 100) : 100;
    const isRecord = Stats.addBattle({ enemy: this.id, wpm, acc, date: Date.now() });
    const ups = addXp(this.def.xp);
    const pages = [`* ¡Derrotaste a ${upper(this.tr.name)}!`, ...this.tr.lose,
      `* Ganaste ${this.def.xp} XP.\n* Velocidad de ataques: ${wpm} PPM · Precisión: ${acc}%`];

    // Los Tecloides que pelearon ganan experiencia.
    d.team.forEach((t, i) => {
      if (this.team[i].hp <= 0) return;
      t.xp = (t.xp || 0) + 12;
      while (t.xp >= t.lv * 4) {
        t.xp -= t.lv * 4;
        t.lv++;
        pages.push(`* ¡${upper(TECLOIDES[t.id].name)} subió a nivel ${t.lv}!`);
      }
    });
    if (isRecord && d.stats.battles.length > 1) pages.push(`* ¡¡NUEVO RECORD DE VELOCIDAD: ${wpm} PPM!!`);
    if (ups) { pages.push(`* ¡SUBISTE A NIVEL ${d.level}!`); Sfx.levelup(); }
    if (!d.done[this.id]) {
      d.done[this.id] = true;
      if (this.tr.reward && !d.treasures[this.tr.reward]) {
        d.treasures[this.tr.reward] = true;
        pages.push(`* Recibiste: ${upper(TREASURES[this.tr.reward].name)}.\n* (Se guardó en tu vitrina.)`);
      }
    }
    Quests.complete('primer_tecloide');
    Save.write();
    await this.talk(pages);
    Game.go(this.back);
  },

  onKey(e) {
    if (this.phase === 'menu') {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { this.cmd ^= 1; Sfx.move(); this.renderCmds(); }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { this.cmd ^= 2; Sfx.move(); this.renderCmds(); }
      else if (isConfirm(e)) this.choose();
      return;
    }
    if (this.phase === 'moves' && e.key === 'Escape') { Sfx.move(); this.toMenu(); return; }
    if (this.ui && this.phase !== 'busy') this.ui.key(e);
  },
};
