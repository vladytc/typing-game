// La vitrina de colección: consolas rescatadas, tesoros y amigos.

Scenes.vitrina = {
  enter({ back = 'map' }) {
    this.back = back;
    const d = Save.data;
    const friends = Object.keys(ENEMIES);
    this.rows = [
      {
        title: 'CONSOLAS',
        slots: CONSOLES.map((c) => ({
          sprite: c.id, got: !!d.consoles[c.id],
          name: `${c.name} (${c.year})`, facts: c.facts,
        })),
      },
      {
        title: 'TESOROS',
        slots: Object.entries(TREASURES).map(([id, t]) => ({ sprite: t.sprite || id, got: !!d.treasures[id], name: t.name, desc: t.desc })),
      },
      {
        title: 'AMIGOS',
        slots: friends.map((id) => ({
          sprite: ENEMIES[id].sprite, got: !!d.spared[id],
          name: ENEMIES[id].name, desc: 'Lo perdonaste en vez de pelear. ¡Qué buena onda!',
        })),
      },
    ];
    this.r = 0;
    this.c = 0;
    this.fact = 0;
    this.render();
  },

  render() {
    const all = this.rows.flatMap((r) => r.slots);
    const got = all.filter((s) => s.got).length;
    Game.root.innerHTML = `
      <div class="vitrina">
        <h2>VITRINA <span class="count">${got}/${all.length}</span></h2>
        ${this.rows.map((row, r) => `
          <div class="shelf-title">${row.title}</div>
          <div class="shelf">${row.slots.map((s, c) =>
            `<div class="slot ${s.got ? 'got' : ''} ${r === this.r && c === this.c ? 'sel' : ''}" data-r="${r}" data-c="${c}"></div>`).join('')}
          </div>`).join('')}
        <div class="box vinfo"></div>
        <div class="map-keys"><span data-k="Escape">[ESC] Volver</span></div>
      </div>`;
    document.querySelectorAll('.slot').forEach((el) => {
      const s = this.rows[+el.dataset.r].slots[+el.dataset.c];
      el.appendChild(spriteCanvas(s.sprite, 3, !s.got));
      el.onclick = () => { this.r = +el.dataset.r; this.c = +el.dataset.c; this.render(); };
    });
    $('.map-keys span').onclick = () => Game.go(this.back);
    const s = this.rows[this.r].slots[this.c];
    if (!s.got) $('.vinfo').innerHTML = '* ???<br>* Sigue jugando para descubrirlo.';
    else if (s.facts) {
      const n = this.fact % s.facts.length;
      $('.vinfo').innerHTML = `* ${esc(upper(s.name))} <span class="dim">· DATO ${n + 1}/${s.facts.length} · ENTER: otro</span><br>* ${esc(s.facts[n])}`;
    } else $('.vinfo').innerHTML = `* ${esc(upper(s.name))}<br>* ${esc(s.desc)}`;
  },

  onKey(e) {
    const row = this.rows[this.r];
    if (e.key === 'ArrowRight') this.c = (this.c + 1) % row.slots.length;
    else if (e.key === 'ArrowLeft') this.c = (this.c - 1 + row.slots.length) % row.slots.length;
    else if (e.key === 'ArrowDown') this.r = (this.r + 1) % this.rows.length;
    else if (e.key === 'ArrowUp') this.r = (this.r - 1 + this.rows.length) % this.rows.length;
    else if (isCancel(e)) { Game.go(this.back); return; }
    else if (isConfirm(e)) { this.fact++; Sfx.move(); this.render(); return; }
    else return;
    this.fact = 0;
    this.c = Math.min(this.c, this.rows[this.r].slots.length - 1);
    Sfx.move();
    this.render();
  },
};
