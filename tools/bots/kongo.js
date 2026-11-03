// Adaptador kidsim para Kongo Tambor (js/scenes/kongo.js).
// Barriles: palabra con mayúscula en NesWord. Arriba escoge "Martillo" (ChoicePrompt).
// Martillo y diálogos: bot genérico (TypingTask / Enter).
// OJO (bug viejo del adaptador): win() pone mode='win' y en el mismo tick say() lo cambia a 'ui',
// así que done() nunca lo veía; y kidsim no encontraba el HP (busca s.p), así que al volver al
// título lo contaba como 'left'. Ahora: se envuelve win() y se expone s.p = { hp, max }.
(function () {
  let seenB = null, seenC = null, target = null, minHp = 999, won = null;
  const K = Scenes.kongo;
  const _win = K.win;
  K.win = function (spared) { won = spared ? 'spared' : 'hammer'; return _win.apply(this, arguments); };
  Object.defineProperty(K, 'p', { get() { return { hp: this.hp, max: this.hpMax }; }, enumerable: false, configurable: true });
  const L = (window.__L = []);
  const _hurt = K.hurt;
  K.hurt = function () { L.push(`t${Math.round(performance.now() / 1000)} AY r${this.round} b${this.beam} s${this.step} hp${this.hp} ${this.barrel && this.barrel.word}`); return _hurt.apply(this, arguments); };
  window.__kidAdapter = {
    cat(s) {
      if (s !== Scenes.kongo) return null;
      if (s.ui instanceof ChoicePrompt && !s.ui.done) return 'type';
      if (s.ui) return null; // diálogo / TypingTask: lo decide kidsim
      if (s.mode === 'climb' && s.barrel && !s.barrel.passed && s.word.word) return 'type';
      return 'wait';
    },
    step(now, kid) {
      const s = Game.scene;
      if (s !== Scenes.kongo) return false;
      minHp = Math.min(minHp, s.hp);
      if (s.ui instanceof ChoicePrompt) {
        const ui = s.ui;
        if (seenC !== ui) { seenC = ui; target = ui.options[0]; return kid.react + 400; }
        if (ui.done) return 100;
        const ch = target[ui.buf.length]; if (ch == null) return 100;
        kid.type(ch); return kid.gap(ch);
      }
      if (s.ui) return false;
      if (s.mode === 'climb') {
        const b = s.barrel;
        if (!b || b.passed || !s.word.word) return 50;
        // Palabra nueva (barril nuevo o la 2.ª mitad de un barril partido): tiempo de reacción.
        const id = s.word.word;
        if (seenB !== b || b.__seenW !== id) { seenB = b; b.__seenW = id; return kid.react; }
        const ch = s.word.word[s.word.pos]; if (ch == null) return 50;
        kid.type(ch); return kid.gap(ch);
      }
      return 100;
    },
    done(s) {
      const k = window.__kid;
      if (won) k.log = ['won ' + won + ' hp ' + (s && s.hp) + ' min ' + minHp + ' hurts ' + L.length];
      if (s !== Scenes.kongo) return null;
      // La victoria se cuenta al volver al título (así se mide también el diálogo final).
      if (s.mode === 'over' && s.hp <= 0) { k.log = ['hp 0/' + s.hpMax + ' round ' + s.round + ' beam ' + s.beam + ' hits ' + s.hits]; return 'lose'; }
      return null;
    },
  };
})();
