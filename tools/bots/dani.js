// Adaptador kidsim para la batalla de Tecloides (Dani Turbo).
// Escoge inicial al azar, ataca con el ataque que se ve más fuerte (casi siempre),
// come galleta si le queda poca vida y esquiva con el bot genérico.
(function () {
  let seen = null, target = null, ready = 0;
  window.__kidAdapter = {
    step(now, kid) {
      const s = Game.scene;
      if (s !== Scenes.tecloides) return false;
      if (s.team) { const m = s.team[s.pi]; kid.hp = m.hp; kid.max = m.max; kid.foe = s.foe.reduce((a, x) => a + x.hp, 0); }
      const ph = s.phase;
      if (ph === 'menu') {
        const m = s.team[s.pi];
        // Galleta si le queda menos del 35% y tiene.
        const want = (m.hp < m.max * 0.35 && s.items > 0) ? 2 : 0;
        if (s.cmd !== want) { kid.send(want === 2 ? 'ArrowDown' : 'ArrowUp'); return 300; }
        seen = null;
        kid.send('Enter'); return kid.react;
      }
      if (ph === 'sub' && s.ui instanceof ListMenu) { kid.send('Enter'); return 500; }
      if ((ph === 'choose' || ph === 'moves') && s.ui instanceof ChoicePrompt) {
        const ui = s.ui;
        if (seen !== ui) {
          seen = ui;
          if (ph === 'choose') target = ui.options[Math.floor(kid.rnd() * 3)];
          else {
            const tec = TECLOIDES[s.team[s.pi].id];
            const ft = TECLOIDES[s.foe[s.fi].id].type;
            const sc = tec.moves.map((m) => m.power * effectiveness(m.type, ft));
            const order = sc.map((v, i) => i).sort((a, b) => sc[b] - sc[a]);
            // 70% el más fuerte, 30% el segundo.
            target = tec.moves[order[kid.rnd() < 0.7 ? 0 : 1]].word;
          }
          return kid.react + 400; // leer las opciones
        }
        if (ui.done) return 100;
        const ch = target[ui.buf.length];
        if (ch == null) return 100;
        kid.type(ch); return kid.gap(ch);
      }
      return false;
    },
    done(s) {
      if (s !== Scenes.tecloides) return null;
      const k = window.__kid;
      if (s.team && s.foe && s.foe.every((x) => x.hp <= 0)) { k.log = ['hp ' + k.hp + '/' + k.max]; return 'win'; }
      if (s.team && s.team.every((x) => x.hp <= 0)) { k.log = ['hp 0/' + k.max + ' foe ' + k.foe]; return 'lose'; }
      return null;
    },
  };
})();
