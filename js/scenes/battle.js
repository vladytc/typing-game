// Combate por turnos estilo RPG: LUCHAR / ACTUAR / OBJETO / PERDONAR,
// y después el turno del enemigo (esquivar escribiendo lo que cae).
//
// Campos opcionales del enemigo (además de los de docs/MUNDOS.md):
//   caps: true          exige mayúsculas con SHIFT al escribir (LUCHAR, ACTUAR y la lluvia)
//   music: 'pista'      pista propia en vez de 'battle' / 'boss'
//   fightTime: 0.8      multiplica el tiempo de LUCHAR (menos de 1 = más prisa)
//   fightList(words)    cambia la lista de palabras de LUCHAR (devuelve la lista nueva)
//   fightUnit(unit, dmg, battle)  ajusta el daño de cada palabra (devuelve el daño)
//   trick: 'pares'      truco propio del enemigo (ver TRICKS abajo), para que cada pelea se sienta distinta
// El combate se pinta con el tema del mundo al que pertenece el enemigo.

const COMMANDS = ['LUCHAR', 'ACTUAR', 'OBJETO', 'PERDONAR'];

// Trucos de los enemigos normales (def.trick). Se enganchan en trickFor():
//   bullets: se mezcla con def.bullets (opciones de Dodge en js/typing.js: hop, slide, pairs, dark, coin)
//   fight: opciones extra para la TypingTask de LUCHAR (dust, flip)
//   rain / hit: avisito corto en la lluvia / en LUCHAR
const TRICKS = {
  rebote: { bullets: { hop: true }, rain: '¡Las letras rebotan!' },                         // Pixelito
  moneda: { bullets: { coin: 3 }, rain: '¡Atrapa las MONEDAS: +2 HP!' },                    // Monedín
  polvo: { fight: { dust: 0.4 }, hit: '¡Error de lectura! El polvo tapa letras:' },         // Cartuchón
  pares: { bullets: { pairs: true }, rain: '¡Vienen de DOS en DOS!' },                      // Linkito
  apagon: { bullets: { dark: true }, rain: '¡Se va la luz a ratos!' },                      // Pilabat
  volteo: { fight: { flip: true }, hit: '¡Te voltearon las palabras! Escribe:' },           // Ladrillín
  patina: { bullets: { slide: 90 }, rain: '¡Las palabras patinan!' },                       // Caparacho
};

Scenes.battle = {
  enter({ enemyId, back = 'map' }) {
    const def = ENEMIES[enemyId];
    // Opcionales por enemigo: theme (paleta), music (pista), strictAccents (acentos obligatorios),
    // onEnter(scene, pages) / onExit(scene) / onWin(scene, { spared, first, pages }).
    Object.assign(this, {
      id: enemyId, def, back,
      e: { hp: def.hp, mercy: 0 },
      p: { hp: playerMaxHp(), max: playerMaxHp() },
      items: (def.boss ? 3 : 2) + (Save.data.konami ? 3 : 0) + treasureBonus('cookies'),
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
    if (this.def && this.def.onExit) this.def.onExit(this); // (def falta si la escena falló al arrancar)
  },

  cleanup() {
    (this.timers || []).forEach(clearTimeout); // por si la escena falló al arrancar
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
    dmg *= diff().hit || 1; // Experto: tus golpes rinden menos (a 80 PPM la pelea si no dura un suspiro)
    return { dmg: Math.max(1, Math.round(dmg)), perfect };
  },

  // El truco del enemigo (o {} si no tiene). Las escenas hijas pueden cambiarlo.
  trickFor() { return TRICKS[this.def.trick] || {}; },

  fight() {
    let words = pickWords(this.def.words, this.def.fightWords);
    if (this.def.fightList) words = this.def.fightList(words);
    const total = words.join('').length;
    const trick = this.trickFor();
    let dealt = 0;
    this.runTask({
      label: trick.hit || '¡LUCHAR! Escribe rápido:',
      ...(trick.fight || {}),
      texts: words,
      // (los tesoros con effect.time dan un poquito más de tiempo)
      timeLimit: (total * 560 + 2500) * (this.def.fightTime || 1) * (1 + treasureBonus('time') / 100),
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
        this.afterFight(dealt, res);
      },
    });
  },

  // Fin de LUCHAR: el daño ya salió flotando palabra por palabra; aquí solo el total, sin página
  // que leer, y de inmediato el turno del enemigo.
  afterFight(dealt, res) {
    if (dealt === 0) this.floatText('¡TIEMPO!');
    else if (res.completed) this.floatText(`¡COMBO! -${dealt}`, 'crit');
    else this.floatText(`TIEMPO · -${dealt}`);
    this.phase = 'busy';
    this.renderCmds();
    this.box.innerHTML = '';
    this.later(() => this.enemyTurn(), 450);
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
        let gain = res.completed ? a.mercy : Math.round(a.mercy * res.progress * 0.5);
        gain = Math.round(gain * (1 + treasureBonus('mercy') / 100)); // tesoros con effect.mercy
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
    // La lluvia empieza mientras todavía se lee la burla (menos espera entre turnos).
    this.later(() => this.startDodge(), 700);
    this.later(() => bubble.classList.add('hidden'), 1700);
  },

  startDodge() {
    this.phase = 'dodge';
    const trick = this.trickFor();
    const cfg = { caps: !!this.def.caps, strict: this.strict, ...this.def.bullets, ...(trick.bullets || {}) };
    if (trick.rain) cfg.label = trick.rain;
    this.dodge = new Dodge(this.box, cfg, {
      // Monedas (truco 'moneda'): atraparlas cura un poquito.
      onCoin: () => {
        const was = this.p.hp;
        this.p.hp = Math.min(this.p.max, this.p.hp + 2);
        if (this.p.hp > was) { Sfx.heal(); this.floatText(`+${this.p.hp - was} HP`, 'mercy'); }
        this.updateBars();
      },
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
    if (ups) this.later(() => Sfx.levelup(), 400);

    // Todo el resumen va en UN panel (resultsPanel en js/ui.js); la historia, en páginas cortas después.
    if (spared) d.spared[this.id] = true;
    const first = !d.done[this.id];
    let treasure = null;
    const pages = [];
    if (!d.done[this.id]) {
      d.done[this.id] = true;
      if (def.drop && !d.treasures[def.drop]) {
        d.treasures[def.drop] = true;
        treasure = def.drop;
      }
      if (def.console) {
        d.consoles[def.console] = true;
        Quests.complete('rescate_gb');
        const c = CONSOLES.find((x) => x.id === def.console);
        pages.push(`* ¡¡RESCATASTE LA ${upper(c.name)}!! Ya brilla en tu vitrina.${WORLDS.some((w) => w.requires === def.console)
          ? '\n* A lo lejos, algo retumbó en la Plaza de las Tuberías...' : ''}\n* (Pssst... Don Chip querrá verla.)`);
      }
    }
    pages.unshift(resultsPanel({
      title: spared ? `¡Perdonaste a ${this.NAME}!` : '¡GANASTE!',
      sub: spared ? 'Ahora es tu AMIGO.' : `${this.NAME} huyó muy lejos.`,
      xp: def.xp, wpm, acc, record: isRecord && d.stats.battles.length > 1,
      level: ups ? d.level : 0, perfect: this.st.perfect, treasure,
    }));
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
