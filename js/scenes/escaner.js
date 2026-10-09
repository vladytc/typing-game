// MINIJEFE del Mundo 5: CASCO ESCANER — "Visor de escaneo" (guiño: Metroid Prime, 2002). LORE §8.4 B.
// Es la batalla normal (js/scenes/battle.js) con dos visores que se turnan cada turno:
//   VISOR DE COMBATE: LUCHAR normal.
//   VISOR DE ESCANEO: LUCHAR se vuelve ESCANEAR. Hay 4 objetos con una línea de datos cada uno
//     (frases con mayúsculas y punto). Escribir la línea completa revela una debilidad y
//     DESBLOQUEA un ACTUAR nuevo (+50 PAZ). Con los 4 escaneados, su DEF baja de 6 a 0.
// Al vencerlo (o perdonarlo), el casco revela el origen de Bit: "CARTUCHO SIN NOMBRE".

Scenes.escaner = Object.assign(Object.create(Scenes.battle), {
  enter(params) {
    Scenes.battle.enter.call(this, params);
    const def = this.def;
    // Copia propia: los ACTUAR se van agregando conforme escaneas (sin tocar ENEMIES).
    this.def = { ...def, acts: [] };
    Object.assign(this, { visor: 'combate', scanned: [], toggleNext: false, curDef: def.def });
    const v = document.createElement('div');
    v.className = 'gc-visor';
    $('.battle').appendChild(v);
    this.renderVisor();
  },

  renderVisor() {
    const b = $('.battle');
    if (!b) return;
    b.classList.toggle('visor-scan', this.visor === 'escaneo');
    const v = $('.gc-visor');
    if (v) v.innerHTML = `<b>${this.visor === 'escaneo' ? 'VISOR DE ESCANEO' : 'VISOR DE COMBATE'}</b><span>ESCANEOS ${this.scanned.length}/${this.def.scans.length} · DEF ${this.curDef}</span>`;
    const cmd = document.querySelector('.cmd[data-i="0"]');
    if (cmd) cmd.textContent = this.visor === 'escaneo' ? 'ESCANEAR' : 'LUCHAR';
  },

  // Cambia de visor al volver del turno del enemigo; Bit lo anuncia.
  enemyTurn() {
    this.toggleNext = true;
    Scenes.battle.enemyTurn.call(this);
  },

  toMenu() {
    if (this.toggleNext) {
      this.toggleNext = false;
      const left = this.def.scans.length - this.scanned.length;
      this.visor = this.visor === 'combate' && left > 0 ? 'escaneo' : 'combate';
      this.renderVisor();
      Sfx.secret();
      const line = this.visor === 'escaneo'
        ? `* BIT: ¡Cambió a VISOR DE ESCANEO!\n* Usa ESCANEAR para leer sus secretos. (Quedan ${left}.)`
        : '* BIT: ¡VISOR DE COMBATE! Ahora LUCHAR pega normal.';
      this.say([line], () => Scenes.battle.toMenu.call(this));
      return;
    }
    Scenes.battle.toMenu.call(this);
  },

  damageFor(unit) {
    const saved = this.def.def;
    this.def.def = this.curDef;
    const r = Scenes.battle.damageFor.call(this, unit);
    this.def.def = saved;
    return r;
  },

  fight() {
    if (this.visor !== 'escaneo') { Scenes.battle.fight.call(this); return; }
    const scans = this.def.scans;
    const items = scans.map((s) => ({ label: this.scanned.includes(s.name) ? `${s.name} ✓` : s.name, disabled: this.scanned.includes(s.name) }));
    this.subMenu(items, (i) => this.scan(scans[i]));
  },

  scan(s) {
    this.runTask({
      label: `ESCANEAR: ${upper(s.name)}`,
      texts: [s.line],
      timeLimit: s.line.length * 650 + 3500,
      onDone: (res) => {
        if (!res.completed) {
          this.say(['* ¡Escaneo incompleto! Se acabó el tiempo.\n* (Vuelve a intentarlo en otro VISOR DE ESCANEO.)'], () => this.enemyTurn());
          return;
        }
        this.scanned.push(s.name);
        this.def.acts.push(s.act);
        Sfx.powerup();
        this.floatText('¡ESCANEADO!', 'mercy');
        const pages = [`* DATO ESCANEADO: "${s.line}"`, `* ¡Nuevo ACTUAR desbloqueado: ${upper(s.act.name)}!`];
        if (this.scanned.length === this.def.scans.length) {
          this.curDef = 0;
          pages.push('* ¡CASCO ESCANER se quedó sin secretos!\n* Su DEF bajó de 6 a 0.');
        }
        this.renderVisor();
        this.say(pages, () => this.enemyTurn());
      },
    });
  },

  actMenu() {
    if (!this.def.acts.length) {
      this.say(['* No sabes qué hacer con un casco...\n* BIT: ¡Escanéalo primero! Así sabremos cómo hacerle sentir mejor.'], () => this.toMenu());
      return;
    }
    Scenes.battle.actMenu.call(this);
  },

  win(spared) {
    // La revelación de Bit (§8.2): sale siempre, ganes o perdones.
    const def = this.def;
    def.onWin = (scene, { pages }) => {
      pages.unshift(
        '* CASCO ESCANER: Escaneo... final.\n* Sujeto 2: BIT. Cursor. Parpadea mucho.',
        '* CASCO ESCANER: ORIGEN: CARTUCHO SIN NOMBRE.\n* 1989. Sin etiqueta. Sin título.',
        '* BIT: ...¿Qué?',
        '* BIT: Entonces... yo era el cursor de ese juego.\n* El que nadie terminó. Me escapé al teclado.',
        '* BIT: ...Entonces, técnicamente, él es mi hermano.\n* Mi hermano mayor. ¡Mi hermano mayor que da miedo!',
      );
      if (!Save.data.flags.gcRevelacion) {
        Save.data.flags.gcRevelacion = true;
        pages.push('* BIT: Oye... Don Chip tiene un sótano lleno de cajas viejas.\n* ¿Y si vamos al pueblo a preguntarle?');
      }
    };
    Scenes.battle.win.call(this, spared);
  },
});
