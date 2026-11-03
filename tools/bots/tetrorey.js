// Adaptador kidsim para el Tetro Rey con TETRIS VS (fase 2). Fases 1 y 3 las juega el bot
// genérico (LUCHAR + esquivar); en la fase 3 las palabras van en vertical (+40 % por letra).
// En TETRIS VS el niño escribe la palabra de la pieza; si hay basura y la pila ya está alta
// (y a la pieza le queda tiempo), primero borra una fila de basura.
(function () {
  let seen = null, lastTall = null;
  window.__L = { tvs: [] };
  let logged = false;
  window.__kidAdapter = {
    step(now, kid) {
      const s = Game.scene;
      if (s !== Scenes.tetrorey) return false;
      if (s.phase === 'tvs') {
        const v = s.tvs;
        if (!v || !v.active) return 50;
        if (!logged) { logged = true; window.__L.start = Math.round(performance.now() / 1000); window.__L.hp0 = s.p.hp; window.__L.ehp0 = s.e.hp; }
        if (!window.__L.rh) window.__L.rh = [];
        const sec = Math.floor(v.elapsed / 3000);
        if (false) window.__L.rh.push(Math.round(v.elapsed / 1000) + 's h' + tvsHeight(v.rey.board) + ' ' + v.rey.board.map((r) => r.c.map((c) => (c ? (c === 'G' ? 'g' : '#') : '.')).join('')).filter((r) => r !== '..........').join('/'));
        let t = v.target;
        if (t && t !== v.piece && !v.me.board.includes(t)) t = null;
        if (!t) {
          const p = v.piece;
          const junk = v.me.board.filter((r) => r.g);
          const h = tvsHeight(v.me.board);
          let left = 1e9;
          if (p) { const land = tvsDrop(v.me.board, p.cells, p.x); left = (land - p.y) * v.rowMs; }
          const need = (w) => kid.react + w.length * kid.ms * 1.1;
          if (junk.length && (!p || (h >= 8 && left > need(junk[0].g.word) + need(p.word)))) t = junk[0];
          else if (p) t = p;
          else return 50;
          if (seen !== t) { seen = t; return kid.react; }
        }
        const w = t === v.piece ? t : t.g;
        const ch = (t === v.piece ? t.word : t.g.word)[w.pos];
        if (ch == null) return 30;
        kid.type(ch); return kid.gap(ch);
      }
      if (logged && !window.__L.end && s.stage === 3) {
        window.__L.end = Math.round(performance.now() / 1000);
        window.__L.hp1 = s.p.hp; window.__L.ehp1 = s.e.hp;
      }
      // Fase 3: leer en vertical cuesta (~+40% por letra).
      const t = kid.find();
      if (s.stage === 3 && t instanceof TypingTask && s.box.classList.contains('tr-tall')) {
        const txt = t.texts[t.i]; if (txt == null) return false;
        const id = t.i + '|' + txt;
        if (id !== lastTall) { lastTall = id; return kid.react * 1.3; }
        const ch = txt[t.pos]; if (ch == null) return false;
        kid.type(ch); return kid.gap(ch) * 1.4;
      }
      return false;
    },
    cat(s) { if (s !== Scenes.tetrorey || s.phase !== 'tvs') return null; const v = s.tvs; return v && v.active && (v.piece || v.target) ? 'type' : 'wait'; },
    done(s) {
      // Resumen de TETRIS VS para las tablas.
      if (s === Scenes.tetrorey && s.tvs) { window.__L.lines = s.tvs.lines; window.__L.sent = s.tvs.sent; }
      return null;
    },
  };
  const lk = Scenes.tetrorey.tvsLock;
  Scenes.tetrorey.tvsLock = function (p, landY, bad) {
    const L = window.__L; L.pieces = (L.pieces || 0) + 1;
    if (bad) { L.bad = (L.bad || 0) + 1; (L.badl = L.badl || []).push(`${p.word}@${p.pos} y${p.y.toFixed(1)} land${landY} tgt${this.tvs.target === p ? 'P' : this.tvs.target ? 'J' : '-'}`); } else if (p.errors) L.errp = (L.errp || 0) + 1;
    return lk.call(this, p, landY, bad);
  };
  // Cuenta los topes del niño.
  const top = Scenes.tetrorey.tvsTopOut;
  Scenes.tetrorey.tvsTopOut = function () { window.__L.tops = (window.__L.tops || 0) + 1; return top.call(this); };
  const att = Scenes.tetrorey.tvsReyAttack;
  Scenes.tetrorey.tvsReyAttack = function () { const q = this.tvs.queue.length; att.call(this); if (this.tvs && this.tvs.queue.length > q) window.__L.got = (window.__L.got || 0) + this.tvs.queue[this.tvs.queue.length - 1].n; };
})();
