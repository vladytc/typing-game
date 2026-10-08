// Batalla de monstruos contra un entrenador (homenaje a los RPG de monstruos de Game Boy).
//   LUCHAR: escribe el nombre del ataque. Rápido = más daño; el tipo importa.
//   MOCHILA: galletas.  EQUIPO: cambia de monstruo.  HUIR: ...no se puede.
//   Turno rival: escribe la palabra de defensa a tiempo para recibir la mitad del daño.

const MON_CMDS = ['LUCHAR', 'MOCHILA', 'EQUIPO', 'HUIR'];
const mkMon = (id, hpScale = 1) => ({ id, hp: Math.round(MONSTERS[id].hp * hpScale), max: Math.round(MONSTERS[id].hp * hpScale) });
const monName = (m) => upper(MONSTERS[m.id].name);

Scenes.monster = {
  enter({ enemyId, back = 'map' }) {
    const tr = TRAINERS[enemyId];
    Object.assign(this, {
      id: enemyId, tr, back, def: ENEMIES[enemyId],
      cmd: 0, phase: 'busy', timers: [], ui: null,
      st: { chars: 0, errors: 0, ms: 0, perfect: 0 },
      items: 3 + (Save.data.konami ? 3 : 0),
    });
    Music.play('monster');
    Game.root.innerHTML = `
      <div class="mon intro-flash">
        <div class="info foe-info hidden">
          <div><b class="fname"></b> <span class="lv">Nv${tr.level}</span></div>
          <div class="hpline"><span>HP</span><div class="bar"><i></i></div></div>
          <div class="balls"></div>
        </div>
        <div class="spr foe-spr"></div>
        <div class="spr me-spr"></div>
        <div class="info me-info hidden">
          <div><b class="mname"></b> <span class="lv">Nv${Save.data.level + 4}</span></div>
          <div class="hpline"><span>HP</span><div class="bar"><i></i></div></div>
          <div class="hpnum"></div>
        </div>
        <div class="box mbox"><div class="mtext"></div><div class="mcmds hidden"></div></div>
      </div>`;
    this.later(() => $('.mon').classList.remove('intro-flash'), 900);
    this.showSprite('.foe-spr', tr.sprite);
    if (!Save.data.starter) this.later(() => this.chooseStarter(), 900);
    else this.later(() => this.begin(), 900);
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

  // Promesa para encadenar textos sin pirámides de callbacks.
  talk(pages) { return new Promise((done) => this.say(pages, done)); },

  updateInfo() {
    const f = this.foe[this.fi];
    const m = this.team[this.pi];
    $('.fname').textContent = monName(f);
    $('.foe-info .bar i').style.width = `${(f.hp / f.max) * 100}%`;
    $('.balls').textContent = this.foe.map((x) => (x.hp > 0 ? '●' : '○')).join(' ');
    $('.mname').textContent = monName(m);
    $('.me-info .bar i').style.width = `${(m.hp / m.max) * 100}%`;
    $('.hpnum').textContent = `${m.hp}/${m.max}`;
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
      '* MAX: ¿No tienes monstruos? ¡Qué triste!\n* Toma, escoge uno. Yo escojo después... je je.',
    ]);
    this.phase = 'choose';
    STARTERS.forEach((id, i) => {
      const c = spriteCanvas(MONSTERS[id].sprite, 4, false, 'starter');
      c.style.left = `${150 + i * 120}px`;
      $('.mon').appendChild(c);
    });
    const names = STARTERS.map((id) => MONSTERS[id].name.toLowerCase());
    this.ui = new ChoicePrompt($('.mtext'), names, async (i) => {
      document.querySelectorAll('.starter').forEach((c) => c.remove());
      Save.data.starter = STARTERS[i];
      Save.write();
      const rival = MONSTERS[COUNTER[STARTERS[i]]].name;
      await this.talk([
        `* ¡Escogiste a ${upper(MONSTERS[STARTERS[i]].name)}!`,
        `* MAX: Entonces yo escojo a ${upper(rival)}.\n* El agua le gana al fuego, el fuego a la planta, la planta al agua... ¿ya sabías, no?`,
      ]);
      this.begin();
    }, {
      prompt: 'Escribe el nombre de tu compañero:',
      tags: STARTERS.map((id) => MTYPES[MONSTERS[id].type]),
    });
  },

  async begin() {
    const starter = Save.data.starter;
    this.team = [starter, ...STARTERS.filter((s) => s !== starter)].map((id) => mkMon(id));
    this.foe = this.tr.team(starter).map((id) => mkMon(id, 0.8));
    this.pi = 0;
    this.fi = 0;
    await this.talk(this.tr.intro);
    this.showSprite('.foe-spr', MONSTERS[this.foe[0].id].sprite);
    $('.foe-info').classList.remove('hidden');
    this.updateInfo();
    await this.talk([`* ${upper(this.tr.name)} envió a ${monName(this.foe[0])}.`]);
    this.showSprite('.me-spr', MONSTERS[this.team[0].id].sprite, true);
    $('.me-info').classList.remove('hidden');
    this.updateInfo();
    await this.talk([`* ¡Adelante, ${monName(this.team[0])}!`]);
    this.toMenu();
  },

  // ---------- Turno del jugador ----------

  toMenu() {
    this.phase = 'menu';
    $('.mtext').classList.add('narrow');
    this.ui = new Dialog($('.mtext'), [`* ¿Qué hará ${monName(this.team[this.pi])}?`], null, { wait: false });
    this.renderCmds();
  },

  renderCmds() {
    const el = $('.mcmds');
    el.classList.remove('hidden');
    el.innerHTML = MON_CMDS.map((c, i) => `<div class="mcmd ${i === this.cmd ? 'sel' : ''}" data-i="${i}">${c}</div>`).join('');
    el.querySelectorAll('.mcmd').forEach((c) => {
      c.onclick = () => { if (this.phase === 'menu') { this.cmd = +c.dataset.i; this.choose(); } };
    });
  },

  choose() {
    Sfx.confirm();
    if (this.ui && this.ui.stop) this.ui.stop();
    $('.mcmds').classList.add('hidden');
    $('.mtext').classList.remove('narrow');
    [() => this.pickMove(), () => this.bag(), () => this.teamMenu(false), () => this.run()][this.cmd]();
  },

  pickMove() {
    const mon = MONSTERS[this.team[this.pi].id];
    const foeType = MONSTERS[this.foe[this.fi].id].type;
    this.phase = 'moves';
    this.ui = new ChoicePrompt($('.mtext'), mon.moves.map((m) => m[0]), (i, timing) => this.attack(mon.moves[i], timing), {
      prompt: 'Escribe el ataque (ESC para volver):',
      tags: mon.moves.map(([, t]) => {
        const e = effectiveness(t, foeType);
        return `${MTYPES[t]}${e > 1 ? ' · ¡FUERTE!' : e < 1 ? ' · débil' : ''}`;
      }),
    });
  },

  async attack([move, type], { ms, errors }) {
    this.phase = 'busy';
    const me = this.team[this.pi];
    const foe = this.foe[this.fi];
    const wpm = (move.length / 5) / (Math.max(ms, 150) / 60000);
    const eff = effectiveness(type, MONSTERS[foe.id].type);
    const stab = type === MONSTERS[me.id].type ? 1.2 : 1;
    const perfect = errors === 0;
    const levelBoost = 1 + (Save.data.level - 1) * 0.12;
    let dmg = move.length * (0.6 + Math.min(wpm, 120) / 50) * levelBoost * eff * stab;
    if (perfect) { dmg *= 1.2; this.st.perfect++; }
    dmg = Math.max(1, Math.round(dmg));
    this.st.chars += move.length;
    this.st.errors += errors;
    this.st.ms += Math.max(ms, 300);

    await this.talk([`* ¡${monName(me)} usó ${upper(move)}!`]);
    foe.hp = Math.max(0, foe.hp - dmg);
    eff > 1 ? Sfx.crit() : Sfx.hit();
    this.pulse('.foe-spr', 'hit');
    this.updateInfo();
    const notes = [];
    if (eff > 1) notes.push('* ¡Es súper eficaz!');
    if (eff < 1) notes.push('* No es muy eficaz...');
    if (perfect) notes.push(`* ¡Escritura PERFECTA! (${Math.round(wpm)} PPM)`);
    if (notes.length) await this.talk([notes.join('\n')]);
    if (foe.hp <= 0) { await this.foeFainted(); return; }
    this.foeTurn();
  },

  async foeFainted() {
    const foe = this.foe[this.fi];
    $('.foe-spr').classList.add('faint');
    Sfx.pop();
    await this.talk([`* ¡${monName(foe)} rival se debilitó!`]);
    const next = this.foe.findIndex((m) => m.hp > 0);
    if (next < 0) { this.win(); return; }
    this.fi = next;
    this.showSprite('.foe-spr', MONSTERS[this.foe[next].id].sprite);
    this.updateInfo();
    await this.talk([`* ${upper(this.tr.name)} envió a ${monName(this.foe[next])}.`]);
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
        await this.talk([`* ${monName(m)} comió la galleta y recuperó ${heal} HP.`]);
        this.foeTurn();
      },
      onCancel: () => this.toMenu(),
    });
  },

  // forced = true cuando el monstruo activo se debilitó y hay que mandar otro.
  teamMenu(forced) {
    this.phase = 'sub';
    const items = this.team.map((m, i) => ({
      label: `${MONSTERS[m.id].name} ${MTYPES[MONSTERS[m.id].type]} ${m.hp}/${m.max}`,
      disabled: m.hp <= 0 || i === this.pi,
    }));
    this.ui = new ListMenu($('.mtext'), items, {
      onPick: async (i) => {
        const old = this.team[this.pi];
        this.pi = i;
        if (!forced) await this.talk([`* ¡Regresa, ${monName(old)}!`]);
        this.showSprite('.me-spr', MONSTERS[this.team[i].id].sprite, true);
        this.updateInfo();
        await this.talk([`* ¡Adelante, ${monName(this.team[i])}!`]);
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
    const moves = MONSTERS[foe.id].moves;
    // La mitad de las veces escoge el ataque que más te duele.
    const best = moves.reduce((a, m) => (effectiveness(m[1], MONSTERS[me.id].type) > effectiveness(a[1], MONSTERS[me.id].type) ? m : a));
    const [move, type] = Math.random() < 0.5 ? best : rand(moves);
    await this.talk([`* ¡${monName(foe)} rival usó ${upper(move)}!`]);
    const res = await this.defend();
    const eff = effectiveness(type, MONSTERS[me.id].type);
    let dmg = Math.round((3 + move.length * 0.5) * eff * (type === MONSTERS[foe.id].type ? 1.2 : 1));
    if (res.completed) dmg = Math.ceil(dmg / 2);
    me.hp = Math.max(0, me.hp - dmg);
    Sfx.hurt();
    this.pulse('.me-spr', 'hit');
    this.updateInfo();
    const notes = [res.completed ? '* ¡Te defendiste! Recibiste la mitad del daño.' : '* ¡No alcanzaste a defenderte!'];
    if (eff > 1) notes.push('* ¡Es súper eficaz!');
    if (eff < 1) notes.push('* No es muy eficaz...');
    await this.talk([notes.join('\n')]);
    if (me.hp > 0) { this.toMenu(); return; }

    $('.me-spr').classList.add('faint');
    await this.talk([`* ¡${monName(me)} se debilitó!`]);
    if (this.team.some((m) => m.hp > 0)) {
      await this.talk(['* ¿A quién vas a mandar?']);
      this.teamMenu(true);
      return;
    }
    await this.talk(['* ¡No te quedan monstruos!', `* MAX: ¡Ja! Vuelve cuando escribas más rápido.`]);
    Sfx.lose();
    Game.go('gameover', { enemyId: this.id, back: this.back, scene: 'monster' });
  },

  defend() {
    return new Promise((done) => {
      this.phase = 'defend';
      $('.mtext').innerHTML = '';
      this.ui = new TypingTask($('.mtext'), {
        label: '¡DEFIENDETE! Escribe rápido:',
        texts: [rand(DEFENSE_WORDS)],
        timeLimit: 2600,
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

  async win() {
    Music.play('victory');
    const d = Save.data;
    this.showSprite('.foe-spr', this.tr.sprite);
    const wpm = this.st.ms > 0 ? Math.round((this.st.chars / 5) / (this.st.ms / 60000)) : 0;
    const typed = this.st.chars + this.st.errors;
    const acc = typed ? Math.round((this.st.chars / typed) * 100) : 100;
    const isRecord = Stats.addBattle({ enemy: this.id, wpm, acc, date: Date.now() });
    const ups = addXp(this.def.xp);
    const pages = [`* ¡Derrotaste al ENTRENADOR ${upper(this.tr.name)}!`, ...this.tr.lose,
      `* Ganaste ${this.def.xp} XP.\n* Velocidad de ataques: ${wpm} PPM · Precisión: ${acc}%`];
    if (isRecord && d.stats.battles.length > 1) pages.push(`* ¡¡NUEVO RECORD DE VELOCIDAD: ${wpm} PPM!!`);
    if (ups) { pages.push(`* ¡SUBISTE A NIVEL ${d.level}!`); Sfx.levelup(); }
    if (!d.done[this.id]) {
      d.done[this.id] = true;
      if (this.tr.reward && !d.treasures[this.tr.reward]) {
        d.treasures[this.tr.reward] = true;
        pages.push(`* Recibiste: ${upper(TREASURES[this.tr.reward].name)}.\n* (Se guardó en tu vitrina.)`);
      }
    }
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
