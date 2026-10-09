// Mapa del mundo: el camino de enemigos hasta el jefe.

Scenes.map = {
  music: 'title',
  // Se entra desde la tubería de un mundo en el pueblo: { world: 'gb' }.
  enter({ world } = {}) {
    this.world = WORLDS.find((w) => w.id === world) || this.world || WORLDS[0];
    // Cada mundo se pinta con la paleta de su consola.
    document.body.className = `theme-${this.world.theme || 'gb'}`;
    const nodes = this.world.nodes;
    const firstOpen = nodes.findIndex((id, i) => this.state(i) === 'open');
    this.i = firstOpen >= 0 ? firstOpen : nodes.length - 1;
    this.render();
  },

  state(i) {
    const d = Save.data;
    const id = this.world.nodes[i];
    if (d.done[id]) return d.spared[id] ? 'spared' : 'beaten';
    if (i === 0 || d.done[this.world.nodes[i - 1]]) return 'open';
    return 'locked';
  },

  render() {
    const d = Save.data;
    const best = d.stats.bestWpm;
    const label = { open: '¡A JUGAR!', beaten: '★ VENCIDO', spared: '♥ AMIGO', locked: 'BLOQUEADO' };
    Game.root.innerHTML = `
      <div class="map">
        <h2>MUNDO ${this.world.order} · ${upper(this.world.name)}</h2>
        <div class="path">${this.world.nodes.map((id, i) => `
          ${i ? '<div class="link"></div>' : ''}
          <div class="node ${this.state(i)} ${i === this.i ? 'sel' : ''}" data-i="${i}">
            <div class="ncursor">♥</div>
            <div class="nsprite"></div>
            <div class="nname">${this.state(i) === 'locked' ? '???' : esc(ENEMIES[id].name)}</div>
            <div class="nstate">${label[this.state(i)]}</div>
          </div>`).join('')}
        </div>
        <div class="box map-info"></div>
        <div class="map-foot">
          <span>NV ${d.level} · HP ${playerMaxHp()} · XP ${d.xp}/${xpToNext(d.level)}${best ? ` · RECORD ${best} PPM` : ''}</span>
        </div>
        <div class="map-keys">
          <span data-k="m">[M] Misiones</span><span data-k="v">[V] Vitrina</span><span data-k="e">[E] Estadísticas</span><span data-k="Escape">[ESC] Pueblo</span>
        </div>
      </div>`;
    this.world.nodes.forEach((id, i) => {
      const locked = this.state(i) === 'locked';
      $(`.node[data-i="${i}"] .nsprite`).appendChild(spriteCanvas(ENEMIES[id].sprite, ENEMIES[id].boss ? 5 : 4, locked));
    });
    document.querySelectorAll('.node').forEach((n) => {
      n.onclick = () => { this.i = +n.dataset.i; this.play(); };
    });
    document.querySelectorAll('.map-keys span').forEach((s) => {
      s.onclick = () => this.onKey({ key: s.dataset.k });
    });
    this.renderInfo();
  },

  renderInfo() {
    const id = this.world.nodes[this.i];
    const e = ENEMIES[id];
    const st = this.state(this.i);
    $('.map-info').innerHTML = st === 'locked'
      ? '* ???<br>* Vence al enemigo anterior para abrir este camino.'
      : `* ${esc(upper(e.name))}${e.boss ? ' (JEFE)' : ''}<br>* ${esc(e.blurb)}<br><span class="dim">* Práctica: ${esc(e.keysHint)}</span>`;
  },

  play() {
    if (this.state(this.i) === 'locked') { Sfx.error(); return; }
    Sfx.confirm();
    const id = this.world.nodes[this.i];
    Game.go(ENEMIES[id].mode || 'battle', { enemyId: id });
  },

  onKey(e) {
    const n = this.world.nodes.length;
    if (e.key === 'ArrowRight') { this.i = Math.min(n - 1, this.i + 1); Sfx.move(); this.render(); }
    else if (e.key === 'ArrowLeft') { this.i = Math.max(0, this.i - 1); Sfx.move(); this.render(); }
    else if (isConfirm(e)) this.play();
    else if (e.key === 'v' || e.key === 'V') Game.go('vitrina', { back: 'map' });
    else if (e.key === 'e' || e.key === 'E') Game.go('stats', { back: 'map' });
    else if (e.key === 'm' || e.key === 'M') Game.go('diario', { back: 'map' });
    else if (e.key === 'Escape') { Sfx.warp(); Game.go('town', { from: `pipe:${this.world.id}` }); }
  },
};
