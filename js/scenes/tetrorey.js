// JEFE del Mundo 1: TETRO REY en 3 fases (docs/LORE.md §4.5). Reutiliza la batalla normal.
//   Fase 1: LUCHAR / ACTUAR normales, hasta que le queda la mitad de HP.
//   Fase 2: ¡LLUEVEN BLOQUES! 45 s de palabras-bloque en 4 columnas.
//           4 bloques seguidos sin error = ¡LINEA! (15 de daño). Si la pila llega al tope, te duele.
//   Fase 3 (al 20 % o al acabarse el tiempo): batalla normal, pero LUCHAR se lee en vertical.
// Al final dice la primera pista del Glitch.

const TRB = { cols: 4, colW: 92, row: 34, max: 7, height: 340, time: 45000, lineDmg: 15, topDmg: 8 };

Scenes.tetrorey = Object.assign(Object.create(Scenes.battle), {
  music: 'gb_tetrorey',

  enter(params) {
    this.stage = 1; // ('phase' ya lo usa la batalla para saber qué tecla toca)
    this.clued = false;
    Scenes.battle.enter.call(this, params);
    // La mancha imposible: un píxel magenta en la torre del rey.
    const px = document.createElement('div');
    px.className = 'glitch-px';
    $('.esprite').appendChild(px);
  },

  exit() {
    this.stopBlocks();
    Scenes.battle.exit.call(this);
  },

  // ---------- Fases 1 y 3: LUCHAR ----------

  fight() {
    const tall = this.stage === 3;
    const words = pickWords(tall ? this.def.tallWords : this.def.words, tall ? 3 : this.def.fightWords);
    const total = words.join('').length;
    // En la fase 1 no baja de la mitad: ahí empieza la lluvia de bloques.
    const floor = this.stage === 1 ? Math.round(this.def.hp / 2) : 0;
    let dealt = 0;
    this.box.classList.toggle('tr-tall', tall);
    this.runTask({
      label: tall ? '¡LUCHAR! Lee como bloque, de arriba a abajo:' : '¡LUCHAR! Escribe rápido:',
      texts: words,
      timeLimit: total * (tall ? 700 : 560) + 2500,
      onUnit: (unit) => {
        const { dmg, perfect } = this.damageFor(unit);
        const before = this.e.hp;
        if (perfect) this.st.perfect++;
        this.e.hp = Math.max(floor, this.e.hp - dmg);
        dealt += before - this.e.hp;
        perfect ? Sfx.crit() : Sfx.hit();
        this.floatText(perfect ? `¡PERFECTO! -${dmg}` : `-${dmg}`, perfect ? 'crit' : '');
        this.shake('.esprite');
        this.updateBars();
        return this.e.hp > floor;
      },
      onDone: (res) => {
        this.box.classList.remove('tr-tall');
        if (this.e.hp <= 0) { this.later(() => this.win(false), 700); return; }
        if (this.stage === 1 && this.e.hp <= floor) {
          this.say([
            '* ¡El Tetro Rey se pone ROJO! Bueno, verde oscuro.',
            '* "¡SUFICIENTE! ¡¡LLUEVEN BLOQUES!!"',
            '* (Escribe cada bloque antes de que caiga.\n* 4 seguidos sin error = ¡LINEA! y le duele.)',
          ], () => this.startBlocks());
          return;
        }
        const pages = [];
        if (dealt === 0) pages.push('* ¡Se acabó el tiempo! No lograste atacar.');
        else if (res.completed) pages.push(`* ¡Combo completo! Hiciste ${dealt} de daño.`);
        else pages.push(`* Se acabó el tiempo. Hiciste ${dealt} de daño.`);
        this.say(pages, () => this.enemyTurn());
      },
    });
  },

  // ---------- Fase 2: ¡LLUEVEN BLOQUES! ----------

  startBlocks() {
    this.stage = 2;
    this.phase = 'blocks';
    this.renderCmds();
    Music.play('gb_tetrorey2');
    const el = document.createElement('div');
    el.className = 'trb';
    el.innerHTML = `
      <div class="trb-well" style="width:${TRB.cols * TRB.colW}px;height:${TRB.height}px">
        ${Array.from({ length: TRB.cols }, (_, c) => `<div class="trb-col" style="left:${c * TRB.colW}px;width:${TRB.colW}px"></div>`).join('')}
        <div class="trb-top" style="top:${TRB.height - TRB.max * TRB.row}px"></div>
      </div>
      <div class="trb-panel">
        <h2>¡LLUEVEN<br>BLOQUES!</h2>
        <div class="bstat"><span>TIEMPO</span><b class="trb-time"></b></div>
        <div class="bstat"><span>RACHA</span><b class="trb-streak"></b></div>
        <div class="bstat"><span>TETRO REY</span><div class="bar trb-ehp"><i></i></div></div>
        <div class="bstat"><span>TU HP</span><div class="bar trb-php"><i></i></div></div>
        <p class="bhelp">Escribe el bloque que cae.<br>4 seguidos sin error:<br>¡LINEA! (-${TRB.lineDmg} HP)</p>
      </div>`;
    $('.battle').appendChild(el);
    this.trb = {
      el, well: $('.trb-well', el),
      cols: Array.from({ length: TRB.cols }, () => []),
      piece: null, streak: [], left: TRB.time * diff().time, elapsed: 0, speedUps: 0, active: true,
    };
    this.trbStats();
    this.trbSpawn();
    this.trbLast = performance.now();
    this.trbRaf = requestAnimationFrame(this.trbLoop);
  },

  stopBlocks() {
    if (!this.trb) return;
    this.trb.active = false;
    cancelAnimationFrame(this.trbRaf);
  },

  trbLoop: function trbLoop(ts) {
    const self = Scenes.tetrorey;
    const b = self.trb;
    if (!b || !b.active) return;
    const dt = Math.max(0, Math.min(50, ts - self.trbLast));
    self.trbLast = ts;
    b.left -= dt;
    b.elapsed += dt;
    // La música se acelera cada 20 segundos.
    const ups = Math.min(2, Math.floor(b.elapsed / 20000));
    if (ups !== b.speedUps) {
      b.speedUps = ups;
      Music.play(['gb_tetrorey2', 'gb_tetrorey2b', 'gb_tetrorey2c'][ups]);
      self.trbFlash('¡MAS RAPIDO!');
    }
    const p = b.piece;
    if (p) {
      p.y += self.trbSpeed() * (dt / 1000);
      const floorY = TRB.height - (b.cols[p.col].length + 1) * TRB.row;
      if (p.y >= floorY) self.trbPlace(p, false);
      else p.el.style.transform = `translate(${p.col * TRB.colW + 4}px, ${p.y}px)`;
    }
    self.trbStats();
    if (b.left <= 0) { self.endBlocks(); return; }
    if (b.active) self.trbRaf = requestAnimationFrame(trbLoop);
  },

  // Cae más rápido con el tiempo (y según la dificultad).
  trbSpeed() { return (42 + this.trb.speedUps * 10) * diff().speed; },

  trbSpawn() {
    const b = this.trb;
    const text = rand(this.def.blockWords);
    const el = document.createElement('div');
    el.className = 'trb-piece falling';
    el.style.width = `${TRB.colW - 8}px`;
    b.well.appendChild(el);
    // Prefiere columnas bajitas para que la pila no crezca tan rápido.
    const order = [...Array(TRB.cols).keys()].sort(() => Math.random() - 0.5).sort((x, y) => b.cols[x].length - b.cols[y].length);
    const col = Math.random() < 0.7 ? order[0] : rand(order);
    b.piece = { text, pos: 0, errors: 0, col, y: -TRB.row, el, t0: 0 };
    this.trbRender(b.piece);
    el.style.transform = `translate(${col * TRB.colW + 4}px, ${-TRB.row}px)`;
  },

  trbRender(p, err = false) {
    p.el.innerHTML = `<span class="t">${esc(p.text.slice(0, p.pos))}</span><span class="${err ? 'nx bad' : 'nx'}">${esc(p.text.slice(p.pos, p.pos + 1))}</span>${esc(p.text.slice(p.pos + 1))}`;
  },

  // Coloca el bloque en su columna. clean = lo escribiste a tiempo.
  trbPlace(p, clean) {
    const b = this.trb;
    b.piece = null;
    const block = { el: p.el, cracked: !clean };
    p.el.classList.remove('falling');
    p.el.classList.add(clean ? 'placed' : 'cracked');
    if (!clean) { p.pos = 0; this.trbRender(p); Sfx.hurt(); }
    b.cols[p.col].push(block);
    if (clean && p.errors === 0) {
      b.streak.push(block);
      if (b.streak.length >= 4) this.trbLine();
    } else b.streak = [];
    this.trbLayout();
    if (b.cols.some((c) => c.length >= TRB.max)) this.trbTop();
    if (!b.active) return;
    if (this.e.hp <= Math.round(this.def.hp * 0.2)) { this.endBlocks(); return; }
    this.trbSpawn();
  },

  trbLayout() {
    this.trb.cols.forEach((col, c) => col.forEach((blk, i) => {
      blk.el.style.transform = `translate(${c * TRB.colW + 4}px, ${TRB.height - (i + 1) * TRB.row}px)`;
    }));
  },

  // ¡LINEA! Se van los 4 bloques de la racha y el rey recibe daño.
  trbLine() {
    const b = this.trb;
    b.streak.forEach((blk) => {
      b.cols.forEach((col) => { const i = col.indexOf(blk); if (i >= 0) col.splice(i, 1); });
      blk.el.classList.add('pop');
      setTimeout(() => blk.el.remove(), 250);
    });
    b.streak = [];
    const floor = Math.round(this.def.hp * 0.2);
    const before = this.e.hp;
    this.e.hp = Math.max(floor, this.e.hp - TRB.lineDmg);
    Sfx.crit();
    this.trbFlash(`¡LINEA! -${before - this.e.hp}`);
    this.updateBars();
  },

  // La pila llegó al tope: te cae encima y se reinicia.
  trbTop() {
    const b = this.trb;
    b.cols.forEach((col) => col.forEach((blk) => blk.el.remove()));
    b.cols = b.cols.map(() => []);
    b.streak = [];
    this.p.hp = Math.max(0, this.p.hp - scaledDmg(TRB.topDmg));
    this.updateBars();
    Sfx.hurt();
    this.trbFlash('¡TOPE! ¡AU!');
    b.well.classList.remove('shake');
    void b.well.offsetWidth;
    b.well.classList.add('shake');
    if (this.p.hp <= 0) {
      this.stopBlocks();
      this.phase = 'busy';
      this.later(() => { Sfx.lose(); Game.go('gameover', { enemyId: this.id, back: this.back, scene: 'tetrorey' }); }, 600);
    }
  },

  trbFlash(text) {
    const el = document.createElement('div');
    el.className = 'bflash';
    el.textContent = text;
    this.trb.well.appendChild(el);
    setTimeout(() => el.remove(), 900);
  },

  trbStats() {
    const b = this.trb;
    $('.trb-time', b.el).textContent = `${Math.max(0, Math.ceil(b.left / 1000))} s`;
    $('.trb-streak', b.el).textContent = `${b.streak.length}/4`;
    $('.trb-ehp i', b.el).style.width = `${(this.e.hp / this.def.hp) * 100}%`;
    $('.trb-php i', b.el).style.width = `${(this.p.hp / this.p.max) * 100}%`;
  },

  trbKey(e) {
    const p = this.trb && this.trb.piece;
    if (!p || !this.trb.active || e.repeat || e.key.length !== 1 || e.key === ' ') return;
    const expected = p.text[p.pos];
    if (!p.t0) p.t0 = performance.now();
    if (!keyMatches(expected, e.key)) {
      Stats.record(expected, false);
      p.errors++;
      this.st.errors++;
      Sfx.error();
      this.trbRender(p, true);
      return;
    }
    Stats.record(expected, true);
    Sfx.key();
    p.pos++;
    this.st.chars++;
    if (p.pos < p.text.length) { this.trbRender(p); return; }
    const ms = performance.now() - p.t0;
    this.st.ms += ms;
    if (this.def.onWord) this.def.onWord({ text: p.text, ms, errors: p.errors });
    p.el.innerHTML = esc(p.text);
    this.trbPlace(p, true);
  },

  endBlocks() {
    this.stopBlocks();
    if (this.trb) this.trb.el.remove();
    this.trb = null;
    this.stage = 3;
    Music.play('gb_tetrorey3');
    this.updateBars();
    this.say([
      '* ¡Se acabó la lluvia de bloques!',
      '* El Tetro Rey se acuesta de lado.\n* "¡AHORA VAS A LEER COMO BLOQUE!"',
      '* (Fase final: las palabras de LUCHAR van de arriba a abajo.)',
    ], () => this.toMenu());
  },

  // ---------- Fin: la primera pista del Glitch ----------

  win(spared) {
    if (this.clued) { Scenes.battle.win.call(this, spared); return; }
    this.clued = true;
    this.cleanup();
    Save.data.flags.pistaGlitch1 = true;
    const px = $('.glitch-px');
    if (px) px.classList.add('reveal');
    this.say([
      spared ? '* El Tetro Rey deja de girar por fin.\n* Se ve... aliviado.' : '* El Tetro Rey se tambalea y deja de girar.',
      '* "Yo no quería... algo morado me puso a girar y no me dejaba parar."',
      '* (Por un instante, un píxel de un color IMPOSIBLE parpadea en la torre... y desaparece.)',
    ], () => {
      if (px) px.remove();
      Scenes.battle.win.call(this, spared);
    });
  },

  onKey(e) {
    if (this.phase === 'blocks') { this.trbKey(e); return; }
    Scenes.battle.onKey.call(this, e);
  },
});
