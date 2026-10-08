// Estadísticas de tecleo: velocidad, precisión y mapa de teclas difíciles.

const KEY_ROWS = ['qwertyuiop', 'asdfghjklñ', 'zxcvbnm'];

Scenes.stats = {
  enter({ back = 'map' }) {
    this.back = back;
    this.confirming = false;
    this.render();
  },

  render() {
    const s = Save.data.stats;
    const last = s.battles.slice(-10);
    const recent = s.battles.slice(-5);
    const avg = recent.length ? Math.round(recent.reduce((a, b) => a + b.wpm, 0) / recent.length) : 0;
    const accAvg = recent.length ? Math.round(recent.reduce((a, b) => a + b.acc, 0) / recent.length) : 0;
    const maxW = Math.max(10, ...last.map((b) => b.wpm));
    const weak = Stats.weakKeys(3);

    const shade = (k) => {
      const r = s.keys[k];
      if (!r || r.n < 5) return 'k-none';
      const rate = r.e / r.n;
      return rate < 0.03 ? 'k-good' : rate < 0.08 ? 'k-ok' : rate < 0.15 ? 'k-meh' : 'k-bad';
    };

    Game.root.innerHTML = `
      <div class="stats">
        <h2>ESTADISTICAS</h2>
        <div class="tiles">
          <div class="tile"><b>${s.bestWpm}</b><span>RECORD PPM</span></div>
          <div class="tile"><b>${avg}</b><span>PROMEDIO PPM</span></div>
          <div class="tile"><b>${accAvg}%</b><span>PRECISION</span></div>
          <div class="tile"><b>${s.battles.length}</b><span>BATALLAS</span></div>
        </div>
        <div class="chart">
          ${last.length ? last.map((b) => `<div class="cbar" style="height:${(b.wpm / maxW) * 100}%"><em>${b.wpm}</em></div>`).join('')
            : '<p class="dim">Juega una batalla para ver tu progreso aquí.</p>'}
        </div>
        <div class="chart-label">PPM en las últimas ${last.length || 10} batallas</div>
        <div class="kb">${KEY_ROWS.map((row, i) =>
          `<div class="kbrow" style="margin-left:${i * 14}px">${[...row].map((k) =>
            `<div class="key ${shade(k)}">${upper(k)}</div>`).join('')}</div>`).join('')}
        </div>
        <div class="kb-legend">Más oscuro = más errores${weak.length ? ` · A practicar: <b>${weak.map((k) => upper(k)).join(' ')}</b>` : ''}</div>
        <div class="stats-menu"></div>
      </div>`;
    const items = this.confirming
      ? [{ label: 'No, mejor no' }, { label: 'Sí, borrar todo' }]
      : [{ label: 'Volver' }, { label: 'Borrar partida' }];
    this.menu = new ListMenu($('.stats-menu'), items, {
      cols: 2,
      onPick: (i) => {
        if (!this.confirming) {
          if (i === 0) Game.go(this.back);
          else { this.confirming = true; this.render(); }
          return;
        }
        if (i === 1) { Save.reset(); Game.go('title'); return; }
        this.confirming = false;
        this.render();
      },
      onCancel: () => Game.go(this.back),
    });
  },

  onKey(e) { this.menu.key(e); },
};
