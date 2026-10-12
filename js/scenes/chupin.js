// MINIJEFE del Mundo 1: CHUPIN, el que absorbe palabras (docs/LORE.md §4.4 B). Reutiliza la batalla normal,
// pero LUCHAR se cambia por ABSORBER: flotan 6 palabras y Chupín inhala una a la vez (marcada con flechas).
//   Si la escribes antes de que llegue a su boca, la escupe de vuelta y le duele.
//   Si no, se la traga y COPIA su habilidad: esa palabra se agrega a la lluvia de su turno.
// Cada 25 % de HP que pierde, inhala 0.3 s más rápido. Perdonarlo regala el minijuego Chupa-Letras.

const CHU = { words: 6, inhales: 3 };

Scenes.chupin = Object.assign(Object.create(Scenes.battle), {
  music: 'gb_chupin',

  enter(params) {
    Scenes.battle.enter.call(this, params);
    // Copia propia de la definición: la lluvia crece con lo que se traga (sin tocar ENEMIES).
    const def = this.def;
    this.def = { ...def, bullets: { ...def.bullets, pool: def.bullets.pool.slice() } };
    this.stolen = [];
    this.ending = false;
    this.dialog.stop();
    this.say([def.intro, def.intro2], () => this.toMenu());
  },

  exit() {
    cancelAnimationFrame(this.chuRaf);
    Scenes.battle.exit.call(this);
  },

  // Tiempo para escribir la palabra inhalada (más letras = más tiempo).
  inhaleMs(text) {
    const lost = Math.min(3, Math.floor((1 - this.e.hp / this.def.hp) / 0.25));
    return Math.max(1500, 1900 + text.length * 220 - lost * 300) * diff().time;
  },

  // ---------- LUCHAR → ABSORBER ----------

  fight() {
    this.phase = 'absorb';
    this.renderCmds();
    this.box.innerHTML = `
      <div class="chu">
        <div class="chu-label">¡ABSORBER! Escribe la palabra marcada antes de que llegue a su boca.</div>
        <div class="chu-field"></div>
      </div>`;
    this.field = $('.chu-field', this.box);
    this.fw = this.field.clientWidth || 576;
    this.fh = this.field.clientHeight || 140;
    this.floaters = [];
    for (let i = 0; i < CHU.words; i++) this.addFloater(i);
    Object.assign(this, { left: CHU.inhales, dealt: 0, spat: 0, eaten: [], target: null });
    this.later(() => this.nextInhale(), 700);
  },

  // Cada palabra flota en su lugar de una cuadrícula de 3 x 2.
  addFloater(slot) {
    const used = this.floaters.map((f) => f.text);
    const pool = this.def.words.filter((w) => !used.includes(w));
    const f = { slot, text: rand(pool.length ? pool : this.def.words), pos: 0, errors: 0 };
    f.el = document.createElement('div');
    f.el.className = 'chu-word';
    this.field.appendChild(f.el);
    this.renderFloater(f);
    f.x = (slot % 3) * (this.fw / 3) + 12 + Math.random() * 30;
    f.y = 30 + Math.floor(slot / 3) * 54 + Math.random() * 10;
    f.el.style.transform = `translate(${f.x}px, ${f.y}px)`;
    this.floaters[slot] = f;
  },

  renderFloater(f, err = false) {
    f.el.innerHTML = `<span class="t">${esc(f.text.slice(0, f.pos))}</span><span class="${err ? 'nx bad' : 'nx'}">${esc(f.text.slice(f.pos, f.pos + 1))}</span>${esc(f.text.slice(f.pos + 1))}`;
  },

  nextInhale() {
    if (this.phase !== 'absorb') return;
    if (this.left <= 0) { this.endAbsorb(); return; }
    this.left--;
    const f = rand(this.floaters);
    Object.assign(f, { pos: 0, errors: 0, t0: performance.now(), t1: 0, dur: this.inhaleMs(f.text), sx: f.x, sy: f.y });
    f.el.classList.add('inhaled');
    this.renderFloater(f);
    this.target = f;
    $('.esprite').classList.add('inhaling');
    this.chuRaf = requestAnimationFrame(this.chuLoop);
  },

  // La palabra marcada viaja hacia la boca de Chupín (arriba, al centro).
  chuLoop: function chuLoop(ts) {
    const self = Scenes.chupin;
    const f = self.target;
    if (!f || self.phase !== 'absorb') return;
    const k = Math.min(1, (ts - f.t0) / f.dur);
    const mx = self.fw / 2 - f.el.offsetWidth / 2;
    const x = f.sx + (mx - f.sx) * k * k;
    const y = f.sy + (-34 - f.sy) * k * k;
    f.el.style.transform = `translate(${x}px, ${y}px) scale(${1 - 0.4 * k})`;
    if (k >= 1) { self.swallow(f); return; }
    self.chuRaf = requestAnimationFrame(chuLoop);
  },

  // ¡Ñam! Se la tragó: ahora esa palabra cae en su turno.
  swallow(f) {
    this.target = null;
    $('.esprite').classList.remove('inhaling');
    Sfx.pop();
    this.floatText('¡ÑAM!', 'mercy');
    this.eaten.push(f.text);
    this.stolen.push(f.text);
    this.def.bullets.pool.push(f.text);
    f.el.remove();
    this.addFloater(f.slot);
    this.later(() => this.nextInhale(), 600);
  },

  // ¡Ptui! La escupe de regreso y le pega.
  spit(f) {
    this.target = null;
    cancelAnimationFrame(this.chuRaf);
    $('.esprite').classList.remove('inhaling');
    const ms = performance.now() - (f.t1 || f.t0);
    this.st.ms += ms;
    const unit = { text: f.text, ms, errors: f.errors };
    if (this.def.onWord) this.def.onWord(unit);
    const { dmg, perfect } = this.damageFor(unit);
    const hit = Math.round(dmg * 1.2); // escupir duele más que un golpe normal
    if (perfect) this.st.perfect++;
    this.e.hp = Math.max(0, this.e.hp - hit);
    this.dealt += hit;
    this.spat++;
    perfect ? Sfx.crit() : Sfx.hit();
    this.floatText(perfect ? `¡PTUI! ¡PERFECTO! -${hit}` : `¡PTUI! -${hit}`, perfect ? 'crit' : '');
    this.shake('.esprite');
    this.updateBars();
    f.el.classList.add('pop');
    setTimeout(() => f.el.remove(), 250);
    if (this.e.hp <= 0) { this.phase = 'busy'; this.later(() => this.win(false), 700); return; }
    this.addFloater(f.slot);
    this.later(() => this.nextInhale(), 600);
  },

  endAbsorb() {
    this.phase = 'busy';
    const pages = [this.spat
      ? `* ¡Le escupiste ${this.spat} palabra${this.spat > 1 ? 's' : ''}! Hiciste ${this.dealt} de daño.`
      : '* Chupín se tragó todo. No lograste escupirle nada.'];
    if (this.eaten.length) pages.push(`* Chupín se tragó: ${this.eaten.map(upper).join(', ')}.\n* ¡Ahora las va a escupir en su turno!`);
    this.say(pages, () => this.enemyTurn());
  },

  absorbKey(e) {
    const f = this.target;
    if (!f || e.repeat || e.key.length !== 1 || e.key === ' ') return;
    const expected = f.text[f.pos];
    if (!keyMatches(expected, e.key)) {
      Stats.record(expected, false);
      f.errors++;
      this.st.errors++;
      Sfx.error();
      this.renderFloater(f, true);
      return;
    }
    if (!f.t1) f.t1 = performance.now();
    Stats.record(expected, true);
    Sfx.key();
    f.pos++;
    this.st.chars++;
    if (f.pos >= f.text.length) { this.spit(f); return; }
    this.renderFloater(f);
  },

  // ---------- Fin: perdonarlo regala Chupa-Letras ----------

  win(spared) {
    const gift = !Save.data.flags.chupaletras;
    if (this.ending || !gift) { Scenes.battle.win.call(this, spared); return; }
    this.ending = true;
    this.cleanup();
    cancelAnimationFrame(this.chuRaf);
    if (!spared) {
      this.say(['* Chupín sale rodando hacia el fondo de la cueva.', '* (Pssst... Bit cree que si lo PERDONAS, a lo mejor te regala algo.)'],
        () => Scenes.battle.win.call(this, spared));
      return;
    }
    Save.data.flags.chupaletras = true;
    Save.write();
    Sfx.secret();
    this.say([
      '* Chupín deja de inhalar.\n* "...Nadie me había dado de comer sin que yo lo pidiera."',
      '* Chupín escupe algo brillante. ¡Es un cartucho!\n* Dice CHUPA-LETRAS.',
      '* "Juégalo en la maquinita del pueblo. ¡A ver si comes más que yo!"',
    ], () => {
      Quests.start('dulces_suenos');
      Scenes.battle.win.call(this, spared);
    });
  },

  onKey(e) {
    if (this.phase === 'absorb') { this.absorbKey(e); return; }
    Scenes.battle.onKey.call(this, e);
  },
});
