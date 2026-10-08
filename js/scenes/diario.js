// Diario de misiones: activas arriba, cumplidas abajo.

Scenes.diario = {
  enter({ back = 'town' }) {
    this.back = back;
    const q = Save.data.quests || {};
    const ids = Object.keys(QUESTS).filter((id) => q[id]);
    const active = ids.filter((id) => q[id] === 'active');
    const done = ids.filter((id) => q[id] === 'done');
    const row = (id, isDone) => {
      const quest = QUESTS[id];
      const prog = quest.progress && !isDone ? ` <span class="qprog">${esc(quest.progress())}</span>` : '';
      return `<div class="quest ${isDone ? 'done' : ''}">
        <div class="qname">${isDone ? '★' : '♥'} ${esc(quest.name)}${prog}</div>
        <div class="qdesc">${esc(quest.desc)}</div>
      </div>`;
    };
    Game.root.innerHTML = `
      <div class="diario">
        <h2>DIARIO DE MISIONES</h2>
        ${active.length ? active.map((id) => row(id, false)).join('') : '<p class="dim">* No tienes misiones activas. ¡Habla con la gente del pueblo!</p>'}
        ${done.length ? `<div class="shelf-title">CUMPLIDAS</div>${done.map((id) => row(id, true)).join('')}` : ''}
        <div class="map-keys"><span>[ESC] Volver</span></div>
      </div>`;
    $('.map-keys span').onclick = () => Game.go(this.back);
  },
  onKey(e) { if (isCancel(e) || isConfirm(e)) Game.go(this.back); },
};
