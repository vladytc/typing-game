// Adaptador kidsim para Chupín: ABSORBER es propio (la palabra marcada viaja a su boca).
(function () {
  let seen = null;
  window.__kidAdapter = {
    step(now, kid) {
      const s = Game.scene;
      if (s !== Scenes.chupin || s.phase !== 'absorb') return false;
      const f = s.target;
      if (!f) return 50;
      if (seen !== f || f.t0 !== seen.__t0) { seen = f; f.__t0 = f.t0; return kid.react; }
      const ch = f.text[f.pos]; if (ch == null) return 50;
      kid.type(ch); return kid.gap(ch);
    },
    cat(s) { return s === Scenes.chupin && s.phase === 'absorb' ? (s.target ? 'type' : 'wait') : null; },
    done(s) { return null; },
  };
})();
