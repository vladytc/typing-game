// Combate por turnos estilo RPG: LUCHAR / ACTUAR / OBJETO / PERDONAR,
// y después el turno del enemigo (esquivar escribiendo lo que cae).
//
// Campos opcionales del enemigo (además de los de docs/MUNDOS.md):
//   caps: true          exige mayúsculas con SHIFT al escribir (LUCHAR, ACTUAR y la lluvia)
//   music: 'pista'      pista propia en vez de 'battle' / 'boss'
//   fightTime: 0.8      multiplica el tiempo de LUCHAR (menos de 1 = más prisa)
//   fightList(words)    cambia la lista de palabras de LUCHAR (devuelve la lista nueva)
//   fightUnit(unit, dmg, battle)  ajusta el daño de cada palabra (devuelve el daño)
// El combate se pinta con el tema del mundo al que pertenece el enemigo.

const COMMANDS = ['LUCHAR', 'ACTUAR', 'OBJETO', 'PERDONAR'];

Scenes.battle = {
  enter({ enemyId, back = 'map' }) {
    const def = ENEMIES[enemyId];
    // Opcionales por enemigo: theme (paleta), music (pista), strictAccents (acentos obligatorios),
    // onEnter(scene, pages) / onExit(scene) / onWin(scene, { spared, first, pages }).
    Object.assign(this, {
      id: enemyId, def, back,
      e: { hp: def.hp, mercy: 0 },
      p: { hp: playerMaxHp(), max: playerMaxHp() },
      items: (def.boss ? 3 : 2) + (Save.data.konami ? 3 : 0),
      st: { chars: 0, errors: 0, ms: 0, perfect: 0 },
      cmd: 0, phase: 'intro', timers: [], strict: !!def.strictAccents,
    });
    document.body.className = `theme-${eraOfEnemy(enemyId)}`; // la estética de su mundo
    if (def.theme) document.body.className = `theme-${def.theme}`;
    Music.play(def.music || (def.boss ? 'boss' : 'battle'));
    const NAME = upper(def.name);
    Game.root.innerHTML = `
      <div class="battle ${def.boss ? 'boss' : ''}">
        <div class="enemy-info">
          <span class="ename">${esc(NAME)}</span>
          <span class="blabel">HP</span><div class="bar ehp"><i></i></div>
          <span class="blabel">PAZ</span><div class="bar emercy"><i></i></div>
        </div>
        <div class="enemy-wrap">
          <div class="esprite"></div>
          <div class="bubble hidden"></div>
          <div class="fx"></div>
        </div>
        <div class="box bbox"></div>
        <div class="hud">
          <div class="cmds">${COMMANDS.map((c, i) => `<div class="cmd" data-i="${i}">${c}</div>`).join('')}</div>
          <div class="pinfo">
            <div>Tú · NV ${Save.data.level}</div>
            <div class="php"><span class="blabel">HP</span><div class="bar pbar"><i></i></div><span class="phpn"></span></div>
          </div>
        </div>
      </div>`;
    $('.esprite').appendChild(spriteCanvas(def.sprite, def.boss ? 9 : 7, false, 'idle'));
    document.querySelectorAll('.cmd').forEach((c) => {
      c.onclick = () => { if (this.phase === 'menu') { this.cmd = +c.dataset.i; this.choose(); } };
    });
    this.box = $('.bbox');
    this.updateBars();
    this.renderCmds();

    const pages = [def.intro];
    if (!Save.data.tutorialDone) {
      pages.push(...TUTORIAL);
      Save.data.tutorialDone = true;
      Save.write();
    }
    if (def.onEnter) def.onEnter(this, pages);
    this.say(pages, () => this.toMenu());
  },

  exit() {
    this.cleanup();
    if (this.def.onExit) this.def.onExit(this);
  },

  cleanup() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    if (this.dialog) this.dialog.stop();
    if (this.task) this.task.stop();
    if (this.dodge) this.dodge.stop();
  },

  later(fn, ms) { this.timers.push(setTimeout(fn, ms)); },

  get NAME() { return upper(this.def.name); },

  // ---------- Interfaz ----------

  updateBars() {
    $('.ehp i').style.width = `${(this.e.hp / this.def.hp) * 100}%`;
    $('.emercy i').style.width = `${this.e.mercy}%`;
    $('.ename').classList.toggle('spareable', this.e.mercy >= 100);
    $('.pbar i').style.width = `${(this.p.hp / this.p.max) * 100}%`;
    $('.phpn').textContent = `${this.p.hp}/${this.p.max}`;
  },

  renderCmds() {
    document.querySelectorAll('.cmd').forEach((c, i) => c.classList.toggle('sel', i === this.cmd));
    $('.hud').classList.toggle('inactive', this.phase !== 'menu');
  },

  say(pages, done) {
    this.phase = 'dialog';
    this.renderCmds();
    this.box.innerHTML = '<div class="tb-text"></div>';
    this.dialog = new Dialog($('.tb-text', this.box), pages, done);
  },

  floatText(text, cls = '') {
    const el = document.createElement('div');
    el.className = `float ${cls}`;
    el.textContent = text;
    el.style.left = `${40 + Math.random() * 20}%`;
    $('.fx').appendChild(el);
    setTimeout(() => el.remove(), 1100);
  },

  shake(sel) {
    const el = $(sel);
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  },

  // ---------- Turno del jugador ----------

  toMenu() {
    this.phase = 'menu';
    this.renderCmds();
    this.box.innerHTML = '<div class="tb-text"></div>';
    const text = this.e.mercy >= 100
      ? `* ${this.NAME} ya no quiere pelear.\n* ¡Usa PERDONAR!`
      : this.e.mercy >= 50 ? this.def.calm : rand(this.def.idle);
    this.dialog = new Dialog($('.tb-text', this.box), [text], null, { wait: false });
  },

  choose() {
    Sfx.confirm();
    this.dialog.stop();
    [() => this.fight(), () => this.actMenu(), () => this.itemMenu(), () => this.mercy()][this.cmd]();
  },

  subMenu(items, onPick) {
    this.phase = 'submenu';
    this.renderCmds();
    this.sub = new ListMenu(this.box, items, { cols: 2, onPick, onCancel: () => this.toMenu() });
  },

  runTask(opts) {
    this.phase = 'typing';
    this.renderCmds();
    const { onDone, onUnit } = opts;
    this.task = new TypingTask(this.box, {
      caps: !!this.def.caps,
      strict: this.strict,
      ...opts,
      // def.onWord (opcional): avisa cada palabra terminada, p. ej. para misiones de racha.
      onUnit: (unit) => {
        if (this.def.onWord) this.def.onWord(unit);
        return onUnit ? onUnit(unit) : true;
      },
      onDone: (res) => {
        this.st.chars += res.chars;
        this.st.errors += res.errors;
        this.st.ms += res.ms;
        onDone(res);
      },
    });
    this.task.start();
  },

  damageFor({ text, ms, errors }) {
    const wpm = (text.length / 5) / (ms / 60000);
    const levelBoost = 1 + (Save.data.level - 1) * 0.12;
    const perfect = errors === 0;
    let dmg = text.length * (0.6 + Math.min(wpm, 120) / 50) * levelBoost - this.def.def;
    if (perfect) dmg *= 1.3;
    return { dmg: Math.max(1, Math.round(dmg)), perfect };
  },

  fight() {
    let words = pickWords(this.def.words, this.def.fightWords);
    if (this.def.fightList) words = this.def.fightList(words);
    const total = words.join('').length;
    let dealt = 0;
    this.runTask({
      label: '¡LUCHAR! Escribe rápido:',
      texts: words,
      timeLimit: (total * 560 + 2500) * (this.def.fightTime || 1),
      onUnit: (unit) => {
        let { dmg, perfect } = this.damageFor(unit);
        if (this.def.fightUnit) dmg = this.def.fightUnit(unit, dmg, this);
        dealt += dmg;
        if (perfect) this.st.perfect++;
        this.e.hp = Math.max(0, this.e.hp - dmg);
        perfect ? Sfx.crit() : Sfx.hit();
        this.floatText(perfect ? `¡PERFECTO! -${dmg}` : `-${dmg}`, perfect ? 'crit' : '');
        this.shake('.esprite');
        this.updateBars();
        return this.e.hp > 0;
      },
      onDone: (res) => {
        if (this.e.hp <= 0) { this.later(() => this.win(false), 700); return; }
        const pages = [];
        if (dealt === 0) pages.push('* ¡Se acabó el tiempo! No lograste atacar.');
        else if (res.completed) pages.push(`* ¡Combo completo! Hiciste ${dealt} de daño.`);
        else pages.push(`* Se acabó el tiempo. Hiciste ${dealt} de daño.`);
        this.say(pages, () => this.enemyTurn());
      },
    });
  },

  actMenu() {
    const acts = this.def.acts;
    this.subMenu([{ label: 'Revisar' }, ...acts.map((a) => ({ label: a.name }))], (i) => {
      if (i === 0) { this.say([this.def.check], () => this.toMenu()); return; }
      this.act(acts[i - 1]);
    });
  },

  act(a) {
    this.runTask({
      label: `ACTUAR: ${a.name}`,
      texts: [a.text],
      timeLimit: a.text.length * 600 + 3000,
      onDone: (res) => {
        const gain = res.completed ? a.mercy : Math.round(a.mercy * res.progress * 0.5);
        const was = this.e.mercy;
        this.e.mercy = Math.min(100, this.e.mercy + gain);
        if (gain) { Sfx.mercy(); this.floatText(`PAZ +${this.e.mercy - was}%`, 'mercy'); }
        this.updateBars();
        const pages = [res.completed ? a.reply : '* ¡Casi! Se acabó el tiempo antes de terminar.'];
        if (this.e.mercy >= 100 && was < 100) pages.push(`* ${this.NAME} ya no quiere pelear.\n* ¡Usa PERDONAR!`);
        this.say(pages, () => this.enemyTurn());
      },
    });
  },

  itemMenu() {
    this.subMenu([{ label: `${ITEM.name} x${this.items}`, disabled: this.items === 0 }], () => {
      this.runTask({
        label: `OBJETO: ${ITEM.name}`,
        texts: [ITEM.text],
        timeLimit: ITEM.text.length * 600 + 3000,
        onDone: (res) => {
          this.items--;
          const heal = res.completed ? ITEM.heal : Math.ceil(ITEM.heal / 2);
          this.p.hp = Math.min(this.p.max, this.p.hp + heal);
          Sfx.heal();
          this.updateBars();
          this.say([`* Comiste la ${ITEM.name}. ¡Recuperaste ${heal} HP!`], () => this.enemyTurn());
        },
      });
    });
  },

  mercy() {
    if (this.e.mercy >= 100) {
      Sfx.spare();
      $('.esprite').classList.add('spared');
      this.phase = 'busy';
      this.later(() => this.win(true), 900);
      return;
    }
    this.say([`* Le ofreces la paz a ${this.NAME}...`, '* ...pero todavía quiere pelear.\n* (Usa ACTUAR para llenar la barra de PAZ.)'], () => this.enemyTurn());
  },

  // ---------- Turno del enemigo ----------

  enemyTurn() {
    this.phase = 'busy';
    this.renderCmds();
    this.box.innerHTML = '';
    const bubble = $('.bubble');
    bubble.textContent = rand(this.def.taunts);
    bubble.classList.remove('hidden');
    this.later(() => {
      bubble.classList.add('hidden');
      this.startDodge();
    }, 1500);
  },

  startDodge() {
    this.phase = 'dodge';
    this.dodge = new Dodge(this.box, { caps: !!this.def.caps, strict: this.strict, ...this.def.bullets }, {
      onHit: () => {
        this.p.hp = Math.max(0, this.p.hp - scaledDmg(this.def.atk));
        this.updateBars();
        this.shake('.pinfo');
        if (this.p.hp <= 0) {
          this.dodge.stop();
          this.phase = 'busy';
          this.later(() => { Sfx.lose(); Game.go('gameover', { enemyId: this.id, back: this.back, scene: this.def.mode || 'battle' }); }, 600);
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

  // ---------- Fin del combate ----------

  win(spared) {
    this.cleanup();
    const d = Save.data;
    const def = this.def;
    if (!spared) $('.esprite').classList.add('fled');
    Music.play('victory');

    const wpm = this.st.ms > 0 ? Math.round((this.st.chars / 5) / (this.st.ms / 60000)) : 0;
    const typed = this.st.chars + this.st.errors;
    const acc = typed ? Math.round((this.st.chars / typed) * 100) : 100;
    const isRecord = Stats.addBattle({ enemy: this.id, wpm, acc, date: Date.now() });
    const ups = addXp(def.xp);

    const pages = [spared
      ? `* ¡Perdonaste a ${this.NAME}!\n* Ahora es tu AMIGO. Lo encontrarás en la vitrina.`
      : `* ¡GANASTE!\n* ${this.NAME} huyó muy lejos.`];
    pages.push(`* Ganaste ${def.xp} XP.\n* Velocidad: ${wpm} PPM · Precisión: ${acc}%`);
    if (this.st.perfect >= 3) pages.push(`* ¡${this.st.perfect} ataques PERFECTOS! Tus dedos están on fire.`);
    if (isRecord && d.stats.battles.length > 1) pages.push(`* ¡¡NUEVO RECORD DE VELOCIDAD: ${wpm} PPM!!`);
    if (ups) {
      pages.push(`* ¡SUBISTE A NIVEL ${d.level}!\n* Tu HP máximo ahora es ${playerMaxHp()} y pegas más fuerte.`);
      this.later(() => Sfx.levelup(), 400);
    }
    if (spared) d.spared[this.id] = true;
    const first = !d.done[this.id];
    if (!d.done[this.id]) {
      d.done[this.id] = true;
      if (def.drop && !d.treasures[def.drop]) {
        d.treasures[def.drop] = true;
        pages.push(`* Encontraste: ${upper(TREASURES[def.drop].name)}.\n* (Se guardó en tu vitrina.)`);
      }
      if (def.console) {
        d.consoles[def.console] = true;
        Quests.complete('rescate_gb');
        const c = CONSOLES.find((x) => x.id === def.console);
        pages.push(`* ¡¡RESCATASTE LA ${upper(c.name)}!!\n* Ya brilla en tu vitrina.`);
        if (WORLDS.some((w) => w.requires === def.console)) pages.push('* A lo lejos, algo retumbó en el pueblo...\n* ¿Será en la Plaza de las Tuberías?');
        pages.push('* (Pssst... Don Chip, en el pueblo, querrá verla.)');
      }
    }
    if (def.onWin) def.onWin(this, { spared, first, pages });
    Save.write();
    this.say(pages, () => Game.go(this.back));
  },

  onKey(e) {
    switch (this.phase) {
      case 'dialog': this.dialog.key(e); break;
      case 'submenu': this.sub.key(e); break;
      case 'typing': this.task.key(e); break;
      case 'dodge': this.dodge.key(e); break;
      case 'menu':
        if (e.key === 'ArrowLeft') { this.cmd = (this.cmd + 3) % 4; Sfx.move(); this.renderCmds(); }
        else if (e.key === 'ArrowRight') { this.cmd = (this.cmd + 1) % 4; Sfx.move(); this.renderCmds(); }
        else if (isConfirm(e)) this.choose();
        break;
      default: break;
    }
  },
};
